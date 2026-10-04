/* 人物关系图谱 —— 零依赖力导向 + 族谱树
   force: 排斥(库仑) + 弹簧(胡克) + 向心 + 简单碰撞，Verlet 风格积分
*/
(function () {
  var H = window.HLM;

  var LAYERS = [
    { id: 'lineage',  name: '世系',   desc: '宁荣二府五代血脉' },
    { id: 'marriage', name: '联姻',   desc: '贾史王薛，一荣俱荣一损俱损' },
    { id: 'faction',  name: '派系',   desc: '谁跟谁、谁防谁 —— 人情世故主战场' },
    { id: 'service',  name: '主仆',   desc: '每个主子的丫鬟班底' },
    { id: 'love',     name: '情感',   desc: '木石前盟、金玉良缘及一切纠缠' },
    { id: 'fate',     name: '命运',   desc: '判词、册子与真假对照' }
  ];

  var TYPE_STYLE = {
    blood:  { c: '#8a7048', w: 1.8, dash: null,    name: '血缘' },
    marry:  { c: '#a8813a', w: 2.2, dash: null,    name: '姻亲' },
    serve:  { c: '#7b8a94', w: 1.2, dash: '3,3',   name: '主仆' },
    ally:   { c: '#4a7a52', w: 1.6, dash: null,    name: '同盟' },
    rival:  { c: '#9c3a2e', w: 1.8, dash: '6,3',   name: '敌对' },
    love:   { c: '#b5618a', w: 1.8, dash: null,    name: '情感' },
    patron: { c: '#3d6b73', w: 1.6, dash: '8,3',   name: '靠山' }
  };

  var HOUSE_COLOR = {
    rong: '#8a6d3b', ning: '#7d4a3e', lin: '#3d6b73', xue: '#9c5a7a',
    wang: '#5c6b8a', shi: '#4a7a52', you: '#8a5a3a', clergy: '#6a6a7a', out: '#7a7268'
  };

  var G = {
    nodes: [], edges: [], byId: {},
    layers: { lineage: true, marriage: true, faction: true, service: false, love: true, fate: false },
    upto: 120, minRank: 3, focus: null, pathTo: null,
    svg: null, vw: 0, vh: 0,
    tx: 0, ty: 0, scale: 1,
    dragging: null, panning: false, alpha: 1, timer: null, mode: 'force'
  };

  /* ---------- 建图 ---------- */
  function build() {
    var all = H.people.concat(H.extraPeople || []);
    G.byId = {};
    all.forEach(function (p) { G.byId[p.id] = p; });

    var actEdges = H.relations.filter(function (e) {
      if (!G.layers[e.layer]) return false;
      var a = G.byId[e.a], b = G.byId[e.b];
      if (!a || !b) return false;
      if (a.rank > G.minRank || b.rank > G.minRank) return false;
      if ((a.debut || 1) > G.upto || (b.debut || 1) > G.upto) return false;
      return true;
    });

    var used = {};
    actEdges.forEach(function (e) { used[e.a] = 1; used[e.b] = 1; });

    var keep = {};
    G.nodes = G.nodes.filter(function (n) {
      if (!used[n.id]) return false;
      keep[n.id] = n; return true;
    });
    Object.keys(used).forEach(function (id) {
      if (keep[id]) return;
      var p = G.byId[id];
      var n = {
        id: id, p: p,
        x: G.vw / 2 + (Math.random() - .5) * 320,
        y: G.vh / 2 + (Math.random() - .5) * 320,
        vx: 0, vy: 0,
        r: p.rank === 1 ? 26 : p.rank === 2 ? 20 : 15
      };
      keep[id] = n; G.nodes.push(n);
    });

    G.edges = actEdges.map(function (e) {
      return { s: keep[e.a], t: keep[e.b], e: e };
    });

    G.deg = {};
    G.edges.forEach(function (l) {
      G.deg[l.s.id] = (G.deg[l.s.id] || 0) + 1;
      G.deg[l.t.id] = (G.deg[l.t.id] || 0) + 1;
    });

    G.alpha = 1;
    if (G.mode === 'tree') layoutTree();
    render();
    kick();
  }

  /* ---------- 力导向 ---------- */
  function step() {
    var n = G.nodes, i, j, a, b, dx, dy, d, f;
    var cx = G.vw / 2, cy = G.vh / 2;

    // 排斥
    for (i = 0; i < n.length; i++) {
      a = n[i];
      for (j = i + 1; j < n.length; j++) {
        b = n[j];
        dx = b.x - a.x; dy = b.y - a.y;
        d = Math.sqrt(dx * dx + dy * dy) || .01;
        if (d > 460) continue;
        f = (a.r + b.r) * 62 / (d * d);
        dx = dx / d * f; dy = dy / d * f;
        a.vx -= dx; a.vy -= dy; b.vx += dx; b.vy += dy;
      }
    }
    // 弹簧
    G.edges.forEach(function (l) {
      dx = l.t.x - l.s.x; dy = l.t.y - l.s.y;
      d = Math.sqrt(dx * dx + dy * dy) || .01;
      var rest = 74 + l.s.r + l.t.r;
      f = (d - rest) * .012;
      dx = dx / d * f; dy = dy / d * f;
      l.s.vx += dx; l.s.vy += dy; l.t.vx -= dx; l.t.vy -= dy;
    });
    // 向心 + 阻尼 + 积分
    n.forEach(function (v) {
      if (v === G.dragging) { v.vx = v.vy = 0; return; }
      v.vx += (cx - v.x) * .0016;
      v.vy += (cy - v.y) * .0016;
      v.vx *= .82; v.vy *= .82;
      v.x += v.vx * G.alpha; v.y += v.vy * G.alpha;
    });
    G.alpha *= .994;
  }

  function kick() {
    G.alpha = Math.max(G.alpha, .9);
    if (G.timer) return;
    G.timer = setInterval(function () {
      if (G.mode === 'force') { step(); paint(); }
      if (G.alpha < .02 && !G.dragging) { clearInterval(G.timer); G.timer = null; }
    }, 16);
  }

  /* ---------- 族谱树布局 ---------- */
  function layoutTree() {
    var gens = {};
    G.nodes.forEach(function (v) {
      var g = v.p.gen || 0;
      (gens[g] = gens[g] || []).push(v);
    });
    var keys = Object.keys(gens).map(Number).sort(function (x, y) { return x - y; });
    var rowH = Math.max(110, (G.vh - 120) / Math.max(keys.length, 1));
    keys.forEach(function (g, gi) {
      var row = gens[g];
      // 同辈按 house 聚拢：宁在左，荣在右
      row.sort(function (p, q) {
        var o = { ning: 0, rong: 1, lin: 2, shi: 3, wang: 4, xue: 5, you: 6, clergy: 7, out: 8 };
        return (o[p.p.house] - o[q.p.house]) || p.p.name.localeCompare(q.p.name);
      });
      var gap = Math.min(120, (G.vw - 120) / Math.max(row.length, 1));
      var x0 = G.vw / 2 - (row.length - 1) * gap / 2;
      row.forEach(function (v, i) {
        v.x = x0 + i * gap;
        v.y = 70 + gi * rowH;
        v.vx = v.vy = 0;
      });
    });
    paint();
  }

  /* ---------- 关系路径（BFS 最短链） ---------- */
  function findPath(fromId, toId) {
    var adj = {};
    G.edges.forEach(function (l) {
      (adj[l.s.id] = adj[l.s.id] || []).push([l.t.id, l]);
      (adj[l.t.id] = adj[l.t.id] || []).push([l.s.id, l]);
    });
    var q = [[fromId]], seen = {}; seen[fromId] = 1;
    while (q.length) {
      var p = q.shift(), last = p[p.length - 1];
      if (last === toId) return p;
      (adj[last] || []).forEach(function (nx) {
        if (seen[nx[0]]) return;
        seen[nx[0]] = 1;
        q.push(p.concat([nx[0]]));
      });
    }
    return null;
  }

  /* ---------- 绘制 ---------- */
  function render() {
    var svg = G.svg;
    svg.innerHTML =
      '<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%">' +
      '<feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/>' +
      '<feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<g id="gv"><g id="ge"></g><g id="gn"></g></g>';
    G.gv = svg.querySelector('#gv');
    G.ge = svg.querySelector('#ge');
    G.gn = svg.querySelector('#gn');

    G.edges.forEach(function (l) {
      var st = TYPE_STYLE[l.e.t] || TYPE_STYLE.blood;
      var p = mk('path', { fill: 'none', stroke: st.c, 'stroke-width': st.w, 'stroke-opacity': .34 });
      if (st.dash) p.setAttribute('stroke-dasharray', st.dash);
      l.el = p; G.ge.appendChild(p);
    });

    G.nodes.forEach(function (v) {
      var g = mk('g', { class: 'node', 'data-id': v.id, style: 'cursor:pointer' });
      var col = HOUSE_COLOR[v.p.house] || '#7a7268';
      v.circle = mk('circle', { r: v.r, fill: col, 'fill-opacity': .18, stroke: col, 'stroke-width': v.p.rank === 1 ? 2.4 : 1.4 });
      var fs = v.p.rank === 1 ? 13 : v.p.rank === 2 ? 12 : 11;
      v.label = mk('text', {
        'text-anchor': 'middle', dy: '.36em', 'font-size': fs,
        fill: 'var(--ink)', 'font-family': 'var(--serif)',
        'font-weight': v.p.rank === 1 ? '700' : '400',
        'pointer-events': 'none', 'paint-order': 'stroke',
        stroke: 'var(--paper)', 'stroke-width': 3.5, 'stroke-linejoin': 'round'
      });
      v.label.textContent = v.p.name;
      g.appendChild(v.circle); g.appendChild(v.label);
      v.el = g; G.gn.appendChild(g);
      bindNode(g, v);
    });
    paint();
    document.getElementById('gStat').textContent = G.nodes.length + ' 人 · ' + G.edges.length + ' 条关系';
  }

  function paint() {
    G.gv.setAttribute('transform', 'translate(' + G.tx + ',' + G.ty + ') scale(' + G.scale + ')');
    G.edges.forEach(function (l) {
      var dx = l.t.x - l.s.x, dy = l.t.y - l.s.y;
      var dr = Math.sqrt(dx * dx + dy * dy) * 2.4;
      l.el.setAttribute('d', 'M' + l.s.x + ',' + l.s.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + l.t.x + ',' + l.t.y);
    });
    G.nodes.forEach(function (v) { v.el.setAttribute('transform', 'translate(' + v.x + ',' + v.y + ')'); });
  }

  function mk(t, a) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', t);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }

  /* ---------- 高亮 ---------- */
  function highlight(id) {
    G.focus = id;
    var near = {};
    if (id) { near[id] = 1; G.edges.forEach(function (l) { if (l.s.id === id) near[l.t.id] = 1; if (l.t.id === id) near[l.s.id] = 1; }); }
    G.nodes.forEach(function (v) {
      var on = !id || near[v.id];
      v.el.setAttribute('opacity', on ? 1 : .16);
      v.circle.setAttribute('filter', v.id === id ? 'url(#glow)' : '');
      v.circle.setAttribute('fill-opacity', v.id === id ? .5 : .18);
    });
    G.edges.forEach(function (l) {
      var on = !id || l.s.id === id || l.t.id === id;
      l.el.setAttribute('stroke-opacity', on ? (id ? .85 : .34) : .05);
    });
  }

  function showPath(ids) {
    var set = {}, pairs = {};
    ids.forEach(function (x, i) { set[x] = 1; if (i) pairs[ids[i - 1] + '|' + x] = pairs[x + '|' + ids[i - 1]] = 1; });
    G.nodes.forEach(function (v) { v.el.setAttribute('opacity', set[v.id] ? 1 : .1); });
    G.edges.forEach(function (l) {
      var on = pairs[l.s.id + '|' + l.t.id];
      l.el.setAttribute('stroke-opacity', on ? .95 : .04);
      l.el.setAttribute('stroke-width', on ? (TYPE_STYLE[l.e.t].w + 1.6) : TYPE_STYLE[l.e.t].w);
    });
    var html = ids.map(function (x, i) {
      var seg = '<b>' + H.esc(G.byId[x].name) + '</b>';
      if (i) {
        var lk = G.edges.find(function (l) {
          return (l.s.id === ids[i - 1] && l.t.id === x) || (l.t.id === ids[i - 1] && l.s.id === x);
        });
        seg = '<span class="muted"> —' + (lk ? H.esc(lk.e.l) : '') + '→ </span>' + seg;
      }
      return seg;
    }).join('');
    document.getElementById('pathOut').innerHTML =
      '<div style="padding:10px 12px;background:var(--paper-3);border-radius:8px;font-size:13px;line-height:2">' +
      html + '</div>';
  }

  /* ---------- 交互 ---------- */
  function bindNode(g, v) {
    var moved = false;
    g.addEventListener('pointerdown', function (ev) {
      ev.stopPropagation(); moved = false;
      G.dragging = v; g.setPointerCapture(ev.pointerId);
    });
    g.addEventListener('pointermove', function (ev) {
      if (G.dragging !== v) return;
      moved = true;
      var pt = toLocal(ev.clientX, ev.clientY);
      v.x = pt.x; v.y = pt.y; paint();
    });
    g.addEventListener('pointerup', function (ev) {
      if (G.dragging === v) { G.dragging = null; kick(); }
      if (!moved) { openCard(v.p); highlight(v.id); }
    });
  }

  function toLocal(cx, cy) {
    var r = G.svg.getBoundingClientRect();
    return { x: (cx - r.left - G.tx) / G.scale, y: (cy - r.top - G.ty) / G.scale };
  }

  function openCard(p) {
    var d = document.getElementById('drawer');
    var deg = G.deg[p.id] || 0;
    var rels = H.relations.filter(function (e) { return e.a === p.id || e.b === p.id; });
    var byLayer = {};
    rels.forEach(function (e) {
      var other = G.byId[e.a === p.id ? e.b : e.a];
      if (!other) return;
      (byLayer[e.layer] = byLayer[e.layer] || []).push(
        '<div style="padding:5px 0;border-bottom:1px solid var(--line)">' +
        '<a href="#" data-goto="' + other.id + '"><b>' + H.esc(other.name) + '</b></a> ' +
        '<span class="tag" style="border-color:' + TYPE_STYLE[e.t].c + '55;color:' + TYPE_STYLE[e.t].c + '">' +
        H.esc(e.l || TYPE_STYLE[e.t].name) + '</span></div>');
    });

    var noteKey = 'person:' + p.id;
    var note = H.notes.get(noteKey);

    document.getElementById('drawerBody').innerHTML =
      '<h2 style="margin:0 0 4px;border:0;padding:0;font-size:24px">' + H.esc(p.name) + '</h2>' +
      (p.alias ? '<div class="muted sans" style="font-size:12px;margin-bottom:10px">' + p.alias.map(H.esc).join(' · ') + '</div>' : '') +
      '<div style="margin:10px 0 14px">' +
      (p.ce ? '<span class="tag jin">' + p.ce + '</span> ' : '') +
      '<span class="tag">' + ({ rong: '荣国府', ning: '宁国府', lin: '林家', shi: '史家', wang: '王家', xue: '薛家', you: '尤家', clergy: '方外', out: '府外' }[p.house] || p.house) + '</span> ' +
      '<span class="tag">' + ({ master: '主子', concubine: '姨娘', maid: '丫鬟', servant: '仆役', outsider: '外人', clergy: '僧道', actor: '伶人', official: '官场' }[p.role] || p.role) + '</span> ' +
      (p.debut ? '<span class="tag">第' + H.cn(p.debut) + '回登场</span> ' : '') +
      '<span class="tag">' + deg + ' 条关系</span>' +
      '</div>' +
      (p.verdict ? '<div class="huiqianmo"><div class="hd">判　词</div>' + H.esc(p.verdict) + '</div>' : '') +
      (p.brief ? '<p>' + H.esc(p.brief) + '</p>' : '') +
      (p.power ? '<h3>在权力结构中的位置</h3><p>' + H.esc(p.power) + '</p>' : '') +
      (p.read ? '<h3>怎么读这个人</h3><p>' + H.esc(p.read) + '</p>' : '') +
      (p.fate ? '<h3>结局</h3><p>' + H.esc(p.fate) + '</p>' : '') +
      (p.key && p.key.length ?
        '<h3>关键场景</h3>' + p.key.map(function (k) {
          return '<div style="padding:4px 0"><a href="reader.html#ch' + k.n + '" class="sans" style="font-size:12px">第' + H.cn(k.n) + '回</a> ' + H.esc(k.t) + '</div>';
        }).join('') : '') +
      '<h3>关系明细</h3>' +
      LAYERS.filter(function (L) { return byLayer[L.id]; }).map(function (L) {
        return '<div style="margin:12px 0 6px;font-family:var(--sans);font-size:11px;letter-spacing:.14em;color:var(--ink-3)">' +
          L.name.toUpperCase() + '</div>' + byLayer[L.id].join('');
      }).join('') +
      '<h3>我的批注</h3>' +
      '<textarea id="pNote" placeholder="写下你对' + H.esc(p.name) + '的看法…（自动保存到本地，可在「我的笔记」导出）">' +
      H.esc(note ? note.text : '') + '</textarea>' +
      '<div class="muted sans" style="font-size:11px;margin-top:6px" id="pNoteHint">' +
      (note ? '上次保存 ' + note.at : '') + '</div>';

    d.classList.add('open');

    var ta = document.getElementById('pNote'), tmr;
    ta.oninput = function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () {
        var n = H.notes.set(noteKey, ta.value, { section: '人物 · ' + p.name, ref: p.name });
        document.getElementById('pNoteHint').textContent = n ? '已保存 ' + n.at : '已清空';
      }, 500);
    };
    d.querySelectorAll('[data-goto]').forEach(function (a) {
      a.onclick = function (ev) {
        ev.preventDefault();
        var t = G.byId[a.dataset.goto];
        if (t) { openCard(t); highlight(t.id); centerOn(t.id); }
      };
    });
  }

  function centerOn(id) {
    var v = G.nodes.find(function (x) { return x.id === id; });
    if (!v) return;
    G.tx = G.vw / 2 - v.x * G.scale;
    G.ty = G.vh / 2 - v.y * G.scale;
    paint();
  }

  /* ---------- 初始化 ---------- */
  window.initGraph = function () {
    G.svg = document.getElementById('svg');
    var box = G.svg.parentElement.getBoundingClientRect();
    G.vw = box.width; G.vh = box.height;
    G.svg.setAttribute('viewBox', '0 0 ' + G.vw + ' ' + G.vh);

    // 层开关
    document.getElementById('layerBox').innerHTML = LAYERS.map(function (L) {
      return '<label style="display:flex;gap:8px;align-items:flex-start;padding:7px 0;cursor:pointer;border-bottom:1px solid var(--line)">' +
        '<input type="checkbox" data-layer="' + L.id + '"' + (G.layers[L.id] ? ' checked' : '') + ' style="width:auto;margin-top:5px">' +
        '<span><b class="sans" style="font-size:13px">' + L.name + '</b>' +
        '<br><span class="muted" style="font-size:11.5px">' + L.desc + '</span></span></label>';
    }).join('');
    document.querySelectorAll('[data-layer]').forEach(function (cb) {
      cb.onchange = function () { G.layers[cb.dataset.layer] = cb.checked; build(); };
    });

    // 图例
    document.getElementById('legend').innerHTML = Object.keys(TYPE_STYLE).map(function (k) {
      var s = TYPE_STYLE[k];
      return '<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px;font-size:11.5px;font-family:var(--sans);color:var(--ink-2)">' +
        '<svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="' + s.c + '" stroke-width="' + s.w +
        '"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '/></svg>' + s.name + '</span>';
    }).join('');

    // 回目滑块
    var sl = document.getElementById('upto');
    sl.oninput = function () {
      G.upto = +sl.value;
      document.getElementById('uptoLab').textContent = G.upto >= 120 ? '全书' : '第 ' + G.upto + ' 回';
      build();
    };
    // 重要度
    document.getElementById('rankSel').onchange = function () { G.minRank = +this.value; build(); };
    // 布局
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.onclick = function () {
        document.querySelectorAll('[data-mode]').forEach(function (x) { x.classList.remove('pri'); });
        b.classList.add('pri');
        G.mode = b.dataset.mode;
        if (G.mode === 'tree') { if (G.timer) { clearInterval(G.timer); G.timer = null; } layoutTree(); }
        else kick();
      };
    });

    // 搜索
    var sq = document.getElementById('q');
    sq.oninput = function () {
      var v = sq.value.trim();
      if (!v) { highlight(null); document.getElementById('qOut').innerHTML = ''; return; }
      var hits = G.nodes.filter(function (n) {
        return n.p.name.indexOf(v) >= 0 || (n.p.alias || []).some(function (a) { return a.indexOf(v) >= 0; });
      }).slice(0, 8);
      document.getElementById('qOut').innerHTML = hits.map(function (n) {
        return '<a href="#" data-hit="' + n.id + '" class="tag" style="margin:2px 3px 0 0">' + H.esc(n.p.name) + '</a>';
      }).join('') || '<span class="muted" style="font-size:12px">没找到（可能被当前筛选隐藏了）</span>';
      document.querySelectorAll('[data-hit]').forEach(function (a) {
        a.onclick = function (ev) {
          ev.preventDefault();
          highlight(a.dataset.hit); centerOn(a.dataset.hit); openCard(G.byId[a.dataset.hit]);
        };
      });
    };

    // 路径查询
    function fillSel(sel) {
      sel.innerHTML = '<option value="">—</option>' + H.people
        .filter(function (p) { return p.rank <= 2; })
        .map(function (p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
    }
    fillSel(document.getElementById('pa'));
    fillSel(document.getElementById('pb'));
    document.getElementById('pathBtn').onclick = function () {
      var a = document.getElementById('pa').value, b = document.getElementById('pb').value;
      if (!a || !b || a === b) { document.getElementById('pathOut').innerHTML = '<span class="muted" style="font-size:12px">请选两个不同的人</span>'; return; }
      var p = findPath(a, b);
      if (!p) { document.getElementById('pathOut').innerHTML = '<span class="muted" style="font-size:12px">当前显示的层里，这两人之间没有通路。试试勾上更多关系层。</span>'; return; }
      showPath(p);
    };

    // 画布平移缩放
    G.svg.addEventListener('pointerdown', function (ev) {
      if (ev.target.closest('.node')) return;
      G.panning = { x: ev.clientX - G.tx, y: ev.clientY - G.ty };
      highlight(null);
      document.getElementById('pathOut').innerHTML = '';
      G.edges.forEach(function (l) { l.el.setAttribute('stroke-width', TYPE_STYLE[l.e.t].w); });
    });
    window.addEventListener('pointermove', function (ev) {
      if (!G.panning) return;
      G.tx = ev.clientX - G.panning.x; G.ty = ev.clientY - G.panning.y; paint();
    });
    window.addEventListener('pointerup', function () { G.panning = false; });
    G.svg.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      var r = G.svg.getBoundingClientRect();
      var mx = ev.clientX - r.left, my = ev.clientY - r.top;
      var k = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
      var ns = Math.min(3, Math.max(.3, G.scale * k));
      G.tx = mx - (mx - G.tx) * (ns / G.scale);
      G.ty = my - (my - G.ty) * (ns / G.scale);
      G.scale = ns; paint();
    }, { passive: false });

    document.getElementById('fitBtn').onclick = function () {
      var xs = G.nodes.map(function (n) { return n.x; }), ys = G.nodes.map(function (n) { return n.y; });
      if (!xs.length) return;
      var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs);
      var y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
      var s = Math.min(G.vw / (x1 - x0 + 160), G.vh / (y1 - y0 + 160), 1.6);
      G.scale = s;
      G.tx = G.vw / 2 - (x0 + x1) / 2 * s;
      G.ty = G.vh / 2 - (y0 + y1) / 2 * s;
      paint();
    };
    document.getElementById('closeDrawer').onclick = function () {
      document.getElementById('drawer').classList.remove('open');
    };

    window.addEventListener('resize', function () {
      var b = G.svg.parentElement.getBoundingClientRect();
      G.vw = b.width; G.vh = b.height;
      G.svg.setAttribute('viewBox', '0 0 ' + G.vw + ' ' + G.vh);
    });

    build();
    setTimeout(function () { document.getElementById('fitBtn').click(); }, 900);
  };
})();
