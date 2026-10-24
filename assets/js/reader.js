/* 原文阅读器：正文 + 脂批 + 注释 + 讲解层（导读/旁批/诗词译/小结）+ 词条 + 划词批注 */
(function () {
  var H = window.HLM;
  var R = { n: 1, showZhi: true, showNote: true, showGuide: true, dense: 'all',
            showLex: true, showTr: true, allTr: false, fs: 17, mentor: true };

  var KIND = {
    bai:  ['白　话', 'k-bai'],
    bg:   ['背　景', 'k-bg'],
    yin:  ['弦外之音', 'k-yin'],
    quan: ['权力信号', 'k-quan'],
    xing: ['性　格', 'k-xing'],
    huo:  ['生　活', 'k-huo'],
    si:   ['人　生', 'k-si'],
    fo:   ['佛与命', 'k-fo'],
    fu:   ['伏　笔', 'k-fu'],
    qian: ['钱', 'k-qian']
  };
  // 密度为「重点」时只保留这几类（主线 + 读不懂的硬伤 + 佛理命运）
  var CORE = { yin: 1, quan: 1, bai: 1, bg: 1, fo: 1 };

  try {
    var pref = JSON.parse(localStorage.getItem('hlm.reader') || '{}');
    ['showZhi', 'showNote', 'showGuide', 'showLex', 'showTr', 'allTr', 'mentor'].forEach(function (k) {
      if (pref[k] != null) R[k] = pref[k];
    });
    if (pref.dense) R.dense = pref.dense;
    if (pref.fs) R.fs = pref.fs;
  } catch (e) {}

  function savePref() {
    try {
      localStorage.setItem('hlm.reader', JSON.stringify({
        showZhi: R.showZhi, showNote: R.showNote, showGuide: R.showGuide,
        showLex: R.showLex, showTr: R.showTr, allTr: R.allTr, dense: R.dense, fs: R.fs,
        mentor: R.mentor
      }));
    } catch (e) {}
  }

  function strip(s) { return String(s || '').replace(/<[^>]+>/g, ''); }
  // 讲解文字的轻量 markdown 在 app.js（HLM.para / HLM.mdBold），olj.html 等页面共用
  var para = H.para, mdBold = H.mdBold;

  /* ---------- 按需加载 ---------- */
  function loadScript(src, cb, onerr) {
    var s = document.createElement('script');
    s.src = src; s.onload = cb; s.onerror = onerr || cb;
    document.head.appendChild(s);
  }
  function pad(n) { return String(n).padStart(3, '0'); }

  function loadChapter(n, cb) {
    var need = [];
    if (!(H.text && H.text[n])) need.push(['data/text/ch' + pad(n) + '.js', 'text']);
    if (!(H.guide && H.guide[n]) && !(H.guideMiss && H.guideMiss[n])) need.push(['data/guide/ch' + pad(n) + '.js', 'guide']);
    if (!(H.trans && H.trans[n]) && !(H.transMiss && H.transMiss[n])) need.push(['data/trans/ch' + pad(n) + '.js', 'trans']);
    if (!need.length) return cb(H.text[n]);
    var left = need.length, failedText = false;
    need.forEach(function (it) {
      loadScript(it[0], done, function () {
        if (it[1] === 'text') failedText = true;
        else if (it[1] === 'trans') { H.transMiss = H.transMiss || {}; H.transMiss[n] = 1; }
        else { H.guideMiss = H.guideMiss || {}; H.guideMiss[n] = 1; }  // 该回还没写讲解，正常
        done();
      });
    });
    function done() {
      if (--left) return;
      if (failedText || !H.text[n]) {
        document.getElementById('body').innerHTML =
          (n > 8 ? '<div class="empty">演示版只收第 1–8 回。<br><small>完整的 120 回在本地版里。</small></div>' : '<div class="empty">第 ' + n + ' 回原文没能载入。<br><small>若是双击打开的本地文件，' +
          '个别浏览器会拦截同目录脚本；可在本目录运行 <code>python -m http.server</code> 后访问。</small></div>');
        return;
      }
      cb(H.text[n]);
    }
  }

  /* ---------- 目录 ---------- */
  function buildTOC() {
    var q = document.getElementById('tocQ').value.trim();
    var list = H.manifest.filter(function (m) {
      if (!q) return true;
      return m.name.indexOf(q) >= 0 || m.couplet.join('').indexOf(q) >= 0 || String(m.n) === q;
    });
    document.getElementById('toc').innerHTML = list.map(function (m) {
      return '<a href="#ch' + m.n + '" data-n="' + m.n + '" class="tocitem' + (m.n === R.n ? ' on' : '') + '">' +
        '<b>' + H.esc(m.name) + '</b><span>' + H.esc(m.couplet.join('　')) + '</span>' +
        '<em>' + m.chars + '字' + (m.zhi ? ' · 脂批' + m.zhi : '') + (m.preface ? ' · 回前墨' : '') + '</em></a>';
    }).join('') || '<div class="empty" style="padding:20px">没有匹配的回目</div>';
    document.querySelectorAll('.tocitem').forEach(function (a) {
      a.onclick = function (ev) { ev.preventDefault(); go(+a.dataset.n); };
    });
  }

  /* ---------- 锚点纠偏 ----------
     旁批挂在 block 序号上，但数据管道可重跑、序号会漂。
     因此每条旁批同时存 anchor（该段开头十来个字），对不上就全章搜回来。 */
  function resolveAt(d, item) {
    var i = item.at;
    var a = (item.anchor || '').replace(/\s/g, '');
    if (!a) return i;
    function textAt(j) {
      var b = d.blocks[j];
      if (!b || b.t === 'img') return '';
      return strip(b.t === 'q' ? b.v.join('') : b.v[0]).replace(/\s/g, '');
    }
    if (textAt(i).indexOf(a) === 0) return i;
    for (var j = 0; j < d.blocks.length; j++) {
      if (textAt(j).indexOf(a) === 0) { item._moved = i + '→' + j; return j; }
    }
    item._lost = true;
    return -1;
  }

  /* ---------- 渲染 ---------- */
  function render(d) {
    var g = (H.guide && H.guide[d.n]) || null;
    var out = [];

    // 回前导读
    if (g && g.intro && R.showGuide) out.push(introHTML(g.intro));

    // 回前墨
    if (d.preface) out.push('<div class="huiqianmo"><div class="hd">回 前 墨 · 脂砚斋总评</div>' + d.preface + '</div>');

    // 旁批按落点分组
    var byAt = {};
    if (g && g.asides && R.showGuide) {
      g.asides.forEach(function (a) {
        if (R.dense === 'core' && !CORE[a.k] && !a.ask) return;  // 导师提问一律保留
        var at = resolveAt(d, a);
        if (at < 0) return;
        (byAt[at] = byAt[at] || []).push(a);
      });
    }
    var poems = (g && g.poems && R.showGuide) ? g.poems : {};

    // 译文按锚点归位，和旁批共用一套纠偏
    // 已知数据缺口（原书有、本站数据没能解析出来的地方）
    var gapAt = {};
    (d.gaps || []).forEach(function (g) { gapAt[g.at] = g; });

    var trAt = {};
    var tlist = (H.trans && H.trans[d.n]) || [];
    if (R.showTr) {
      tlist.forEach(function (t) {
        var at = resolveAt(d, t);
        if (at >= 0) trAt[at] = t;
      });
    }

    d.blocks.forEach(function (b, i) {
      if (b.t === 'img') {
        out.push('<figure><img src="assets/img/' + b.v[0] + '" alt="插图" loading="lazy"/></figure>');
      } else if (b.t === 'q') {
        out.push('<blockquote data-p="' + i + '">' + b.v.map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</blockquote>');
        if (poems[i]) out.push(poemHTML(poems[i], i));
      } else {
        out.push('<p data-p="' + i + '">' + b.v[0] +
          (trAt[i] ? '<span class="trbtn" data-tr="' + i + '" title="用现代文读这一段">译</span>' : '') + '</p>');
        if (trAt[i] && R.allTr) out.push(transHTML(trAt[i].x, i));
      }
      if (gapAt[i]) {
        out.push('<div class="gap"><b>⚠ 此处原书有内容，本站数据缺失</b>' +
          '<div>缺失的是：' + H.esc(gapAt[i].what) + '</div>' +
          '<div class="why">' + H.esc(gapAt[i].why) + '</div></div>');
      }
      (byAt[i] || []).forEach(function (a) { out.push(asideHTML(a, i)); });
    });
    R._tr = trAt;

    // 回后评（脂砚斋回末总评，不是正文）—— 可能有多条，逐条分段
    if (d.postface) {
      out.push('<div class="huiqianmo" style="margin:30px 0 0"><div class="hd">回 后 评 · 脂砚斋总评</div>' +
        d.postface.split('\n').filter(Boolean)
          .map(function (x) { return '<p style="text-indent:0;margin:0 0 .7em">' + x + '</p>'; }).join('') +
        '</div>');
    }

    // 回末小结
    if (g && g.outro && R.showGuide) out.push(outroHTML(g.outro, g));

    // 欧丽娟怎么读：放在读后小结之后、默认收起——先自己读、做完提问，再听她
    if (R.showGuide) out.push(oljHTML(d.n));

    var el = document.getElementById('body');
    el.innerHTML =
      '<div class="chead"><div class="cno">' + H.esc(d.name) + '</div>' +
      '<h1>' + d.couplet.join('<br/>') + '</h1>' +
      '<div class="cmeta">' + d.chars + ' 字' +
      (Object.keys(d.zhi).length ? ' · 脂批 ' + Object.keys(d.zhi).length + ' 条' : ' · 无脂批') +
      (Object.keys(d.notes).length ? ' · 注释 ' + Object.keys(d.notes).length + ' 条' : '') +
      (d.postface ? ' · 有回后评' : '') +
      (g ? ' · 讲解 ' + ((g.asides || []).length) + ' 条' : ' · <span style="color:var(--ink-3)">本回讲解待写</span>') +
      '</div></div>' + out.join('');

    applyToggles();
    bindMarks(d);
    bindGuide();
    bindTrans();
    if (R.showLex) markLexicon();
    paintMyNotes();
    document.getElementById('scroller').scrollTop = 0;
    document.getElementById('prev').disabled = d.n <= 1;
    document.getElementById('next').disabled = d.n >= 120;
  }

  function introHTML(o) {
    return '<div class="guide-box" data-box="intro"><div class="gh">读 前 导 读<span class="caret">▾</span></div><div class="gb">' +
      (o.one ? '<div class="one">' + H.esc(o.one) + '</div>' : '') +
      (o.bg ? '<h4>进这一回之前</h4>' + para(o.bg) : '') +
      (o.watch && o.watch.length ? '<h4>注意看这几处</h4><ol>' +
        o.watch.map(function (w) { return '<li>' + mdBold(H.esc(w)) + '</li>'; }).join('') + '</ol>' : '') +
      (o.moves && o.moves.length ? '<h4>本回要练的读法</h4><div class="mchips">' +
        o.moves.map(moveChip).join('') + '</div>' : '') +
      (o.how && R.mentor ? '<h4>这一回怎么陪你读</h4>' + para(o.how) : '') +
      '</div></div>';
  }

  /* ---------- 导师模式 ----------
     讲解员给结论；导师先指一句、问一个问题，展开后才给解读 + 怎么看出来的 + 可信度。 */
  function moveChip(id) {
    var m = H.moveById && H.moveById[id];
    return m ? '<a class="mchip" href="moves.html#' + m.id + '" title="' + H.esc(m.rule) + '">' + H.esc(m.name) + '</a>' : '';
  }
  function howHTML(a) {
    if (!a.how) return '';
    return '<div class="ahow"><div class="hh"><span>怎么看出来的</span>' + (a.move ? moveChip(a.move) : '') + '</div>' +
      para(a.how) + '</div>';
  }
  function lvHTML(a) {
    if (!a.lv || !H.LV) return '';
    return '<div class="alv">' + [].concat(a.lv).map(function (l) {
      var v = H.LV[l];
      return v ? '<span class="lvt ' + v[1] + '">' + v[0] + '</span>' : '';
    }).join('') + (a.lvn ? '<span class="lvn">' + H.esc(a.lvn) + '</span>' : '') + '</div>';
  }

  function transHTML(x, i) {
    return '<div class="trans" data-trbox="' + i + '"><div class="th">现 代 文</div>' + para(x) + '</div>';
  }

  function asideHTML(a, at) {
    var k = KIND[a.k] || KIND.bai;
    var key = 'ch:' + R.n + ':aside:' + at + ':' + a.k;
    var has = !!H.notes.get(key);
    var foot = '<div class="afoot"><button class="anb">' + (has ? '✎ 已有批注' : '＋ 就这条写点什么') + '</button></div>';
    var open = '<div class="aside' + (has ? ' hasnote' : '') + (a.ask && R.mentor ? ' mentor' : '') +
      '" data-k="' + a.k + '" style="--kc:var(--' + k[1] + ')" data-akey="' + key + '">';
    if (a.ask && R.mentor) {
      return open +
        '<div class="ah"><span class="ak">' + k[0] + '</span>' +
        '<span class="mtag' + (a.practice ? ' try' : '') + '">' + (a.practice ? '轮到你' : '停一下') + '</span></div>' +
        (a.stop ? '<div class="astop">「' + H.esc(a.stop) + '」</div>' : '') +
        '<div class="aask">' + mdBold(H.esc(a.ask)) + '</div>' +
        '<div class="mbtns"><button class="btn sm atry"></button>' +
        '<button class="btn sm pri areveal">看怎么读 ▸</button></div>' +
        '<div class="ans"><div class="mytry"></div>' +
        '<div class="at">' + H.esc(a.t) + '</div>' +
        '<div class="ax">' + para(a.x) + '</div>' + howHTML(a) + lvHTML(a) + foot + '</div>' +
        '</div>';
    }
    return open +
      '<div class="ah"><span class="ak">' + k[0] + '</span><span class="at">' + H.esc(a.t) + '</span></div>' +
      '<div class="ax">' + para(a.x) + '</div>' + howHTML(a) + lvHTML(a) + foot +
      '</div>';
  }

  function poemHTML(p, i) {
    return '<div class="poem-tr" data-poem="' + i + '">' +
      '<div class="pt"><span>白话译文' + (p.t ? ' · ' + H.esc(p.t) : '') + '</span><span class="tg">收起 ▾</span></div>' +
      p.tr.map(function (l) { return '<div class="pl">' + H.esc(l) + '</div>'; }).join('') +
      (p.x ? '<div class="px">' + para(p.x) + '</div>' : '') + '</div>';
  }

  // 本回练过的读法：从旁批的 move 字段自动汇总，讲过几次、自己试过几次
  function movesRecap(g) {
    var seen = [], cnt = {};
    (g.asides || []).forEach(function (a) {
      if (!a.move) return;
      if (!cnt[a.move]) { cnt[a.move] = { teach: 0, try: 0 }; seen.push(a.move); }
      cnt[a.move][a.practice ? 'try' : 'teach']++;
    });
    if (!seen.length || !H.moveById) return '';
    return '<h4>这一回练过的读法</h4><ol>' + seen.map(function (id) {
      var m = H.moveById[id], c = cnt[id];
      if (!m) return '';
      return '<li><b>' + H.esc(m.name) + '</b>　' + H.esc(m.rule) +
        '<span class="mcount">讲 ' + c.teach + ' 次' + (c.try ? ' · 你试 ' + c.try + ' 次' : '') + '</span></li>';
    }).join('') + '</ol><p class="muted" style="font-size:13px">读法才是要带走的东西。每一条换到别的书上怎么用，见 <a href="moves.html">读法库</a>。</p>';
  }

  // 「我的判断」可能是多段、带引文或表格：标签塞进第一段，否则单独占一行
  function mineHTML(s) {
    var b = para(s), lab = '<b>我的判断：</b>';
    return b.indexOf('<p>') === 0 ? '<p>' + lab + b.slice(3) : '<p>' + lab + '</p>' + b;
  }

  function outroHTML(o, g) {
    var h = '';
    if (o.happened) h += '<h4>这一回究竟发生了什么</h4>' + para(o.happened);
    if (o.changed && o.changed.length) {
      h += '<h4>谁变了</h4>' + o.changed.map(function (c) {
        return '<p><span class="who">' + H.esc(c.who) + '</span>　' + H.esc(c.what) + '</p>';
      }).join('');
    }
    if (o.debate && o.debate.length) {
      h += '<h4>诸家异说</h4>' + o.debate.map(function (dd) {
        return '<div class="dbt"><div class="dq">' + H.esc(dd.q) + '</div>' +
          dd.views.map(function (v) {
            return '<div class="dv"><span class="who">' + H.esc(v.who) + '：</span>' + H.esc(v.v) + '</div>';
          }).join('') +
          '<div class="dm">' + mineHTML(dd.mine) + '</div></div>';
      }).join('');
    }
    if (g) h += movesRecap(g);
    if (o.q && o.q.length) {
      h += '<h4>留给你的问题</h4><ol>' + o.q.map(function (x, j) {
        return '<li>' + H.esc(x) +
          '<div style="margin-top:6px"><button class="btn sm" data-oq="' + j + '">写下你的答案</button></div></li>';
      }).join('') + '</ol>';
    }
    return '<div class="guide-box tail" data-box="outro"><div class="gh">读 后 小 结<span class="caret">▾</span></div><div class="gb">' + h + '</div></div>';
  }

  /* ---------- 欧丽娟怎么读 ---------- */
  function oljHTML(n) {
    var O = H.olj, list = O ? O.items.filter(function (it) { return it.ch.indexOf(n) >= 0; }) : [];
    if (!list.length) return '';
    return '<div class="guide-box tail fold olj" data-box="olj"><div class="gh">欧 丽 娟 怎 么 读' +
      '<span class="olcnt">' + list.length + ' 段</span><span class="caret">▾</span></div><div class="gb">' +
      '<p class="muted" style="font-size:13px">先做完这一回的提问再打开。每一段是她课上的几分钟，点时间可以直接去听；' +
      '文字是我的转述，不是她的原话。<a href="olj.html">全部讲次 →</a></p>' +
      list.map(oljItemHTML).join('') + '</div></div>';
  }
  function oljItemHTML(it) {
    var has = !!H.notes.get('olj:' + it.id);
    return '<div class="oli">' + H.oljHead(it) +
      '<div class="olb">' + para(it.she) + '</div>' +
      (it.vs ? '<div class="olvs"><div class="hh">和本站的读法比</div>' + para(it.vs) + '</div>' : '') +
      (it.ask ? '<div class="olask"><b>你站谁？</b>' + mdBold(H.esc(it.ask)) +
        '<div style="margin-top:6px"><button class="btn sm" data-olj="' + it.id + '">' +
        (has ? '✎ 已写' : '写下你的看法') + '</button></div></div>' : '') +
      '</div>';
  }

  function bindTrans() {
    document.querySelectorAll('.trbtn').forEach(function (b) {
      var i = b.dataset.tr;
      if (document.querySelector('.trans[data-trbox="' + i + '"]')) b.classList.add('on');
      b.onclick = function (ev) {
        ev.stopPropagation();
        var exist = document.querySelector('.trans[data-trbox="' + i + '"]');
        if (exist) { exist.remove(); b.classList.remove('on'); return; }
        var host = b.closest('[data-p]');
        host.insertAdjacentHTML('afterend', transHTML(R._tr[i].x, i));
        b.classList.add('on');
      };
    });
  }

  function bindGuide() {
    document.querySelectorAll('.guide-box .gh').forEach(function (h) {
      h.onclick = function () { h.parentElement.classList.toggle('fold'); };
    });
    document.querySelectorAll('.poem-tr .pt').forEach(function (t) {
      t.onclick = function () {
        var box = t.parentElement;
        box.classList.toggle('fold');
        t.querySelector('.tg').textContent = box.classList.contains('fold') ? '展开 ▸' : '收起 ▾';
      };
    });
    document.querySelectorAll('.aside .anb').forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        var box = b.closest('.aside');
        openNote(box.dataset.akey, box.querySelector('.at').textContent, '旁批');
      };
    });
    // 导师模式：先写（可选）→ 再展开；展开时把你先写的那句摆在解读上面，方便对照
    document.querySelectorAll('.aside.mentor').forEach(function (box) {
      var tryKey = box.dataset.akey + ':try';
      box.querySelector('.atry').onclick = function (ev) {
        ev.stopPropagation();
        openNote(tryKey, box.querySelector('.aask').textContent, '先写后看');
      };
      box.querySelector('.areveal').onclick = function (ev) {
        ev.stopPropagation();
        var on = box.classList.toggle('open');
        this.textContent = on ? '收起 ▾' : '看怎么读 ▸';
        paintTry(box);
      };
    });
    document.querySelectorAll('[data-olj]').forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        var it = H.olj.items.filter(function (x) { return x.id === b.dataset.olj; })[0];
        openNote('olj:' + it.id, it.title + '（欧丽娟第 ' + it.lec + ' 讲）', '欧丽娟 · 你站谁');
      };
    });
    document.querySelectorAll('[data-oq]').forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        var li = b.closest('li');
        openNote('ch:' + R.n + ':q:' + b.dataset.oq, li.firstChild.textContent, '思考题');
      };
    });
  }

  /* ---------- 词条自动标注 ----------
     必须走 DOM 文本节点，不能对 HTML 串做正则 —— 否则会标进标签属性里。
     每回只标首次出现，避免满屏下划线。 */
  function markLexicon() {
    if (!H.lexicon) return;
    var used = {}, body = document.getElementById('body');
    var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // 只标原文。译文本身就是来解释难词的，再标一遍是噪音；
        // 而且译文是后插入的，会打乱「每回只标首次出现」的顺序。
        if (node.parentElement.closest('.aside, .guide-box, .poem-tr, .trans, .lex, i, a, button')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], nd;
    while ((nd = walker.nextNode())) nodes.push(nd);

    nodes.forEach(function (node) {
      for (var i = 0; i < H.lexicon.length; i++) {
        var t = H.lexicon[i];
        if (used[t.w]) continue;
        if (t.only && t.only.indexOf(R.n) < 0) continue;
        var idx = node.nodeValue.indexOf(t.w);
        if (idx < 0) continue;
        used[t.w] = 1;
        var after = node.splitText(idx);
        after.splitText(t.w.length);
        var span = document.createElement('span');
        span.className = 'lex';
        span.dataset.w = t.w;
        span.textContent = t.w;
        after.parentNode.replaceChild(span, after);
        return;   // 一个文本节点只处理一个词，切开后剩下的留给下一轮
      }
    });
    bindLexPop();
  }

  function bindLexPop() {
    var pop = document.getElementById('lexPop');
    document.querySelectorAll('.lex').forEach(function (s) {
      s.onclick = function (ev) {
        ev.stopPropagation();
        var t = H.lexiconBy[s.dataset.w];
        if (!t) return;
        var CAT = { zhi:'制度', cheng:'称谓', qian:'钱', jian:'建筑', qi:'器物', li:'礼俗', ci:'词语', dian:'典故' };
        pop.innerHTML = '<div><span class="lw">' + H.esc(t.w) + '</span>' +
          '<span class="lc">' + (CAT[t.c] || '') + '</span></div>' +
          '<div class="ld">' + H.esc(t.d) + '</div>' +
          (t.ex ? '<div class="lx">' + mdBold(H.esc(t.ex)).replace(/\n/g, '<br/>') + '</div>' : '');
        pop.classList.add('show');
        var r = s.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
        var left = Math.min(Math.max(8, r.left), innerWidth - pw - 8);
        var top = r.bottom + 8 + ph > innerHeight ? r.top - ph - 8 : r.bottom + 8;
        pop.style.left = left + 'px';
        pop.style.top = Math.max(8, top) + 'px';
      };
    });
    document.addEventListener('click', function () { pop.classList.remove('show'); });
  }

  function applyToggles() {
    document.querySelectorAll('#body i.zm').forEach(function (e) { e.classList.toggle('hide', !R.showZhi); });
    document.querySelectorAll('#body i.nm').forEach(function (e) { e.classList.toggle('hide', !R.showNote); });
    document.getElementById('body').style.fontSize = R.fs + 'px';
    document.getElementById('zhiBtn').classList.toggle('pri', R.showZhi);
    document.getElementById('noteBtn').classList.toggle('pri', R.showNote);
    document.getElementById('guideBtn').classList.toggle('pri', R.showGuide);
    document.getElementById('mentorBtn').classList.toggle('pri', R.mentor);
    document.getElementById('mentorBtn').disabled = !R.showGuide;
    document.getElementById('lexBtn').classList.toggle('pri', R.showLex);
    document.getElementById('trBtn').classList.toggle('pri', R.allTr);
    document.querySelectorAll('.trbtn').forEach(function (b) { b.classList.toggle('hide', !R.showTr); });
    document.getElementById('denseSel').value = R.dense;
    document.getElementById('denseSel').disabled = !R.showGuide;
  }

  /* ---------- 脂批 / 注释角标 ---------- */
  function bindMarks(d) {
    document.querySelectorAll('#body i.zm, #body i.nm').forEach(function (mk) {
      mk.onclick = function (ev) {
        ev.stopPropagation();
        var isZhi = mk.classList.contains('zm');
        var n = mk.dataset.n;
        var txt = isZhi ? d.zhi[n] : d.notes[n];
        if (!txt) return;
        // 回前墨里的角标不在 <p> 里，得退到 .huiqianmo 本身
        var host = mk.closest('p, blockquote') || mk.closest('.huiqianmo') || mk.parentElement;
        if (!host || !host.parentNode) return;
        var id = (isZhi ? 'z' : 'n') + n;
        var exist = host.parentNode.querySelector('.inline-note[data-k="' + id + '"]');
        if (exist) { exist.remove(); return; }
        var div = document.createElement('div');
        div.className = 'inline-note ' + (isZhi ? 'z' : 'n');
        div.dataset.k = id;
        div.innerHTML = '<b>' + (isZhi ? '脂砚斋批 [' + n + ']' : '注 [' + n + ']') + '</b>' + txt;
        host.parentNode.insertBefore(div, host.nextSibling);
      };
    });
  }

  /* ---------- 我的批注 ---------- */
  function noteKey(n, p) { return 'ch:' + n + ':p:' + p; }

  function paintMyNotes() {
    var all = H.notes.all();
    document.querySelectorAll('#body [data-p]').forEach(function (el) {
      el.classList.toggle('hasnote', !!all[noteKey(R.n, el.dataset.p)]);
    });
    document.querySelectorAll('.aside').forEach(function (el) {
      var has = !!all[el.dataset.akey];
      el.classList.toggle('hasnote', has);
      var b = el.querySelector('.anb');
      if (b) b.textContent = has ? '✎ 已有批注' : '＋ 就这条写点什么';
    });
    document.querySelectorAll('.aside.mentor').forEach(paintTry);
    var cnt = Object.keys(all).filter(function (k) { return k.indexOf('ch:' + R.n + ':') === 0; }).length;
    document.getElementById('myCount').textContent = cnt ? cnt + ' 条批注' : '';
  }

  function paintTry(box) {
    var t = H.notes.get(box.dataset.akey + ':try');
    box.querySelector('.atry').textContent = t ? '✎ 改我的想法' : '先写我的想法';
    box.querySelector('.mytry').innerHTML = t
      ? '<b>你先写的：</b>' + H.esc(t.text).replace(/\n/g, '<br/>') : '';
  }

  function openNote(k, quote, label) {
    var cur = H.notes.get(k), d = H.text[R.n];
    document.getElementById('drawerBody').innerHTML =
      '<div class="muted sans" style="font-size:11px;letter-spacing:.12em;margin-bottom:6px">' +
      H.esc(d.name) + (label ? ' · ' + label : '') + '</div>' +
      (quote ? '<blockquote style="margin:0 0 14px;padding:8px 12px;background:var(--paper-3);border-radius:8px;' +
        'font-size:13.5px;border-left:3px solid var(--jin)">' + H.esc(quote) + '</blockquote>' : '') +
      '<textarea id="mNote" style="min-height:200px" placeholder="你怎么看？&#10;&#10;不同意也直接写——导出后发我，我会正面回应。">' +
      H.esc(cur ? cur.text : '') + '</textarea>' +
      '<div style="display:flex;gap:8px;margin-top:10px">' +
      '<button class="btn pri" id="mSave">保存</button><button class="btn" id="mDel">删除</button>' +
      '<span class="muted sans" style="font-size:11px;align-self:center" id="mHint">' +
      (cur ? '上次 ' + cur.at : '') + '</span></div>';
    document.getElementById('drawer').classList.add('open');
    var ta = document.getElementById('mNote'); ta.focus();
    var meta = { section: d.name + '　' + strip(d.couplet.join('　')), quote: quote, ref: 'ch' + R.n };
    document.getElementById('mSave').onclick = function () {
      var nn = H.notes.set(k, ta.value, meta);
      document.getElementById('mHint').textContent = nn ? '已保存 ' + nn.at : '已清空';
      paintMyNotes();
    };
    document.getElementById('mDel').onclick = function () {
      H.notes.set(k, ''); ta.value = '';
      document.getElementById('mHint').textContent = '已删除';
      paintMyNotes();
    };
  }

  /* ---------- 跳转 ---------- */
  function go(n) {
    n = Math.max(1, Math.min(120, n));
    R.n = n;
    location.hash = 'ch' + n;
    loadChapter(n, function (d) { render(d); buildTOC(); });
  }

  /* ---------- 初始化 ---------- */
  window.initReader = function () {
    var m = (location.hash || '').match(/ch(\d+)/);
    R.n = m ? Math.max(1, Math.min(120, +m[1])) : 1;

    buildTOC();
    document.getElementById('tocQ').oninput = buildTOC;
    document.getElementById('prev').onclick = function () { go(R.n - 1); };
    document.getElementById('next').onclick = function () { go(R.n + 1); };

    function reload() { savePref(); render(H.text[R.n]); }
    document.getElementById('zhiBtn').onclick   = function () { R.showZhi = !R.showZhi; applyToggles(); savePref(); };
    document.getElementById('noteBtn').onclick  = function () { R.showNote = !R.showNote; applyToggles(); savePref(); };
    document.getElementById('guideBtn').onclick = function () { R.showGuide = !R.showGuide; reload(); };
    document.getElementById('mentorBtn').onclick = function () { R.mentor = !R.mentor; reload(); };
    document.getElementById('lexBtn').onclick   = function () { R.showLex = !R.showLex; reload(); };
    document.getElementById('trBtn').onclick    = function () { R.allTr = !R.allTr; reload(); };
    document.getElementById('denseSel').onchange = function () { R.dense = this.value; reload(); };
    document.getElementById('fsUp').onclick = function () { R.fs = Math.min(24, R.fs + 1); applyToggles(); savePref(); };
    document.getElementById('fsDn').onclick = function () { R.fs = Math.max(13, R.fs - 1); applyToggles(); savePref(); };
    document.getElementById('closeDrawer').onclick = function () { document.getElementById('drawer').classList.remove('open'); };
    document.getElementById('tocBtn').onclick = function () { document.getElementById('side').classList.toggle('show'); };

    document.getElementById('body').addEventListener('click', function (ev) {
      if (ev.target.closest('i.zm, i.nm, .inline-note, figure, .aside, .guide-box, .poem-tr, .lex, .trbtn, .trans')) return;
      var host = ev.target.closest('[data-p]');
      if (!host) return;
      var sel = String(window.getSelection());
      var t = host.textContent;
      openNote(noteKey(R.n, host.dataset.p),
        sel && sel.length > 1 ? sel : t.slice(0, 60) + (t.length > 60 ? '…' : ''), '第 ' + (+host.dataset.p + 1) + ' 段');
    });

    window.addEventListener('hashchange', function () {
      var mm = (location.hash || '').match(/ch(\d+)/);
      if (mm && +mm[1] !== R.n) go(+mm[1]);
    });
    document.addEventListener('keydown', function (ev) {
      if (/input|textarea/i.test(ev.target.tagName)) return;
      if (ev.key === 'ArrowLeft') go(R.n - 1);
      if (ev.key === 'ArrowRight') go(R.n + 1);
    });

    go(R.n);
  };
})();
