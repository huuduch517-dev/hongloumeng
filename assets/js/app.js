/* 全站公用：导航、主题、批注存储 */
var HLM = window.HLM || {};
window.HLM = HLM;

HLM.NAV = [
  ['index.html', '总览'],
  ['reader.html', '原文'],
  ['graph.html', '关系图谱'],
  ['people.html', '人物志'],
  ['fo.html', '佛与命'],
  ['moves.html', '读法库'],
  ['olj.html', '欧丽娟'],
  ['notes.html', '我的笔记']
];

HLM.mountNav = function (active) {
  var bar = document.createElement('div');
  bar.className = 'topbar';
  bar.innerHTML =
    '<div class="brand">红楼梦<small>研读工作台</small></div><nav>' +
    HLM.NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[0] === active ? ' class="on"' : '') + '>' + n[1] + '</a>';
    }).join('') +
    '</nav><div class="tools">' +
    '<button class="iconbtn" id="themeBtn" title="切换深浅色">◐</button></div>';
  document.body.insertBefore(bar, document.body.firstChild);
  document.getElementById('themeBtn').onclick = function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    try { localStorage.setItem('hlm.theme', cur); } catch (e) {}
  };
};

(function initTheme() {
  try {
    var t = localStorage.getItem('hlm.theme');
    if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();

/* ---------- 批注存储 ----------
   key 形如  ch:19:p:7   person:xiren   topic:power
   一律存 localStorage，可整体导出为 JSON / Markdown 发给 Claude 迭代解读
*/
HLM.notes = {
  KEY: 'hlm.notes.v1',
  _cache: null,
  all: function () {
    if (this._cache) return this._cache;
    try { this._cache = JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
    catch (e) { this._cache = {}; }
    return this._cache;
  },
  get: function (k) { return this.all()[k] || null; },
  set: function (k, text, meta) {
    var a = this.all();
    if (!text || !text.trim()) { delete a[k]; }
    else {
      a[k] = Object.assign({}, meta || {}, {
        text: text.trim(),
        at: new Date().toISOString().slice(0, 16).replace('T', ' ')
      });
    }
    try { localStorage.setItem(this.KEY, JSON.stringify(a)); } catch (e) { alert('保存失败：本地存储可能已满'); }
    return a[k] || null;
  },
  count: function () { return Object.keys(this.all()).length; },
  exportJSON: function () {
    return JSON.stringify({ v: 1, exported: new Date().toISOString(), notes: this.all() }, null, 2);
  },
  exportMD: function () {
    var a = this.all(), keys = Object.keys(a).sort(HLM.notes._cmpKey);
    if (!keys.length) return '# 我的《红楼梦》批注\n\n（暂无）\n';
    var out = ['# 我的《红楼梦》批注', '', '共 ' + keys.length + ' 条，导出于 ' + new Date().toLocaleString('zh-CN'), ''];
    var lastSec = '';
    keys.forEach(function (k) {
      var n = a[k], sec = n.section || '其他';
      if (sec !== lastSec) { out.push('', '## ' + sec, ''); lastSec = sec; }
      if (n.quote) out.push('> ' + n.quote.replace(/\n/g, ' '));
      out.push('', n.text, '', '<small>' + k + ' · ' + n.at + '</small>', '');
    });
    return out.join('\n');
  },
  _cmpKey: function (x, y) {
    var m1 = x.match(/^ch:(\d+)/), m2 = y.match(/^ch:(\d+)/);
    if (m1 && m2) return (+m1[1]) - (+m2[1]) || x.localeCompare(y);
    if (m1) return -1;
    if (m2) return 1;
    return x.localeCompare(y);
  },
  download: function (name, text, mime) {
    var b = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
  },
  importJSON: function (raw) {
    var d = JSON.parse(raw);
    var incoming = d.notes || d;
    var a = this.all(), n = 0;
    Object.keys(incoming).forEach(function (k) { a[k] = incoming[k]; n++; });
    localStorage.setItem(this.KEY, JSON.stringify(a));
    this._cache = a;
    return n;
  }
};

/* 小工具 */
HLM.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
};
HLM.cn = function (n) {
  var d = '零一二三四五六七八九';
  if (n <= 10) return n === 10 ? '十' : d[n];
  if (n < 20) return '十' + d[n % 10];
  if (n < 100) return d[Math.floor(n / 10)] + '十' + (n % 10 ? d[n % 10] : '');
  var r = '一百', rest = n % 100;
  if (!rest) return r;
  if (rest < 10) return r + '零' + d[rest];
  if (rest < 20) return r + '十' + (rest % 10 ? d[rest % 10] : '');
  return r + d[Math.floor(rest / 10)] + '十' + (rest % 10 ? d[rest % 10] : '');
};

/* ---------- 欧丽娟课程：讲号、时间点、B 站链接（reader 与 olj.html 共用） ---------- */
HLM.oljSec = function (t) {
  return String(t || '0').split(':').reduce(function (s, x) { return s * 60 + (+x || 0); }, 0);
};
HLM.oljLec = function (lec) {
  var L = (HLM.olj && HLM.olj.lectures) || [];
  for (var i = 0; i < L.length; i++) if (L[i][0] === lec) return L[i];
  return null;
};
HLM.oljURL = function (lec, t) {
  var l = HLM.oljLec(lec);
  return 'https://www.bilibili.com/video/' + HLM.olj.bv + '?p=' + (l ? l[1] : lec) + (t ? '&t=' + HLM.oljSec(t) : '');
};
HLM.oljHead = function (it) {
  var l = HLM.oljLec(it.lec), short = function (t) { return String(t).replace(/^0:/, ''); };
  return '<div class="olh"><div class="olt">' + HLM.esc(it.title) + '</div>' +
    '<a class="olplay" target="_blank" rel="noopener" href="' + HLM.oljURL(it.lec, it.t) + '">▶ 第 ' + it.lec + ' 讲' +
    (l ? '「' + HLM.esc(l[2]) + '」' : '') + ' ' + short(it.t) + (it.t2 ? '–' + short(it.t2) : '') + '</a></div>';
};

/* ---------- 讲解文字的轻量 markdown（从 reader.js 移来） ---------- */
// 讲解文字的轻量 markdown：段落、**加粗**、> 引文、| 表格 |、---、- 列表、1. 列表。
// 连续同类行合成一块；空行断开。加粗仍按行替换，所以一行里 ** 必须成对。
HLM.para = function (s) {
  var lines = String(s || '').split('\n'), out = [], i = 0;
  function inl(x) { return HLM.mdBold(HLM.esc(x)); }
  function run(re) {
    var got = [];
    while (i < lines.length && re.test(lines[i].trim())) got.push(lines[i++].trim());
    return got;
  }
  function cells(row) {
    return row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); });
  }
  while (i < lines.length) {
    var t = lines[i].trim();
    if (!t) { i++; continue; }
    if (/^-{3,}$/.test(t)) { out.push('<hr class="md-hr"/>'); i++; continue; }
    if (t.charAt(0) === '>') {
      out.push('<blockquote class="md-q">' + run(/^>/).map(function (q) {
        q = q.replace(/^>\s?/, '');
        return q ? '<p>' + inl(q) + '</p>' : '';
      }).join('') + '</blockquote>');
      continue;
    }
    if (t.charAt(0) === '|') {
      var rows = run(/^\|/), head = '';
      if (rows.length > 1 && /^\|?[\s:|-]+$/.test(rows[1]) && rows[1].indexOf('-') >= 0) {
        head = '<thead><tr>' + cells(rows[0]).map(function (c) { return '<th>' + inl(c) + '</th>'; }).join('') + '</tr></thead>';
        rows = rows.slice(2);
      }
      out.push('<div class="md-tbw"><table class="md-tb">' + head + '<tbody>' + rows.map(function (r) {
        return '<tr>' + cells(r).map(function (c) { return '<td>' + inl(c) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>');
      continue;
    }
    if (/^[-*] /.test(t)) {
      out.push('<ul class="md-l">' + run(/^[-*] /).map(function (x) {
        return '<li>' + inl(x.slice(2)) + '</li>';
      }).join('') + '</ul>');
      continue;
    }
    if (/^\d+\. /.test(t)) {
      var items = run(/^\d+\. /);
      out.push('<ol class="md-l" start="' + parseInt(items[0], 10) + '">' + items.map(function (x) {
        return '<li>' + inl(x.replace(/^\d+\.\s/, '')) + '</li>';
      }).join('') + '</ol>');
      continue;
    }
    out.push('<p>' + inl(t) + '</p>'); i++;
  }
  return out.join('');
}
HLM.mdBold = function (s) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\[\[链接:(.+?)\]\]/g,
            '<a href="fo.html" class="sans" style="font-size:12.5px">→ $1</a>');
}

