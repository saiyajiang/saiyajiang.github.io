/* ============================================================
   知识图谱板块逻辑 — graph.js
   依赖：wiki/db/data/knowledge.js（window.WIKI_DATA，11 板块全条目）
   职责：全库词条关联解析（links 显式 + 文本命中自动匹配）、
         图例着色、纯 SVG 力导向图渲染（自实现，无外部 CDN）、
         节点点击跳转词条详情页 entry.html?t=词条名
   ============================================================ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* 11 个板块的强调色（与图例一致） */
  var BOARD_COLORS = {
    buddhism: '#f0a63c',
    poetry: '#e05fa0',
    idioms: '#7cc576',
    characters: '#4fd8e0',
    radicals: '#8f9ce8',
    medical: '#ef5b5b',
    slang: '#c58be8',
    naming: '#f2b54c',
    phrases: '#35d6c4',
    mythology: '#e2b93d',
    etymology: '#6fb3e0'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function setText(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }
  function hexToRgb(hex) {
    var m = String(hex).replace('#', '');
    if (m.length !== 6) return '176, 124, 240';
    return [
      parseInt(m.slice(0, 2), 16),
      parseInt(m.slice(2, 4), 16),
      parseInt(m.slice(4, 6), 16)
    ].join(', ');
  }

  /* ---------- 词条解析（与 db.js 同款算法，保证关联一致） ---------- */
  function extractName(text) {
    var i = String(text).indexOf(' — ');
    return i > 0 ? String(text).slice(0, i).trim() : '';
  }
  function coreNameOf(name) {
    return String(name).replace(/[a-zA-Z\u00C0-\u024F\u2019']/g, '').trim();
  }
  function isHan(ch) { return ch && /[\u4E00-\u9FFF]/.test(ch); }
  function nameMatches(name, kw) {
    if (!kw) return false;
    var core = coreNameOf(name);
    if (name === kw || core === kw) return true;
    if (kw.length >= 2 && (name.indexOf(kw) !== -1 || core.indexOf(kw) !== -1)) return true;
    if (core && name.length >= 2 && (kw.indexOf(name) !== -1 || kw.indexOf(core) !== -1)) return true;
    return false;
  }
  function textHits(text, target) {
    var kw = coreNameOf(target.name) || target.name;
    if (!kw) return false;
    var idx = text.indexOf(kw);
    if (idx === -1) return false;
    if (kw.length >= 2) return true;
    var before = idx > 0 ? text.charAt(idx - 1) : '';
    var after = idx + kw.length < text.length ? text.charAt(idx + kw.length) : '';
    return !isHan(before) && !isHan(after);
  }

  /* ---------- 数据收集 ---------- */
  var wiki = window.WIKI_DATA || [];
  var boards = [];   // {id, title, color, count}
  var entries = [];  // {boardId, name, core, text, links, related}

  wiki.forEach(function (sec) {
    var items = sec.items || [];
    boards.push({
      id: sec.id,
      title: sec.title || sec.id,
      color: BOARD_COLORS[sec.id] || '#b07cf0',
      count: items.length
    });
    items.forEach(function (it) {
      var text = it.text || '';
      var name = extractName(text) || text.slice(0, 12);
      entries.push({
        boardId: sec.id,
        name: name,
        core: coreNameOf(name),
        text: text,
        links: it.links || []
      });
    });
  });

  // 相关条目：links 显式指定优先，未指定则文本包含词条名自动关联（全库范围）
  function resolveRelated(e) {
    var seen = {};
    var list = [];
    function add(t) {
      if (!t || t === e || seen[t.name]) return;
      seen[t.name] = true;
      list.push(t);
    }
    (e.links || []).forEach(function (kw) {
      entries.forEach(function (t) { if (nameMatches(t.name, kw)) add(t); });
    });
    entries.forEach(function (t) {
      if (t === e) return;
      if (textHits(e.text, t)) add(t);
    });
    return list;
  }
  entries.forEach(function (e) { e.related = resolveRelated(e); });

  var entriesByBoard = {};
  entries.forEach(function (e) {
    (entriesByBoard[e.boardId] = entriesByBoard[e.boardId] || []).push(e);
  });

  /* ---------- 图例 ---------- */
  function renderLegend() {
    var legend = document.getElementById('graphLegend');
    if (!legend) return;
    legend.innerHTML = '';
    boards.forEach(function (b) {
      var item = document.createElement('div');
      item.className = 'graph-legend-item';
      item.innerHTML =
        '<span class="graph-legend-swatch" style="background:' + b.color + '"></span>' +
        '<span>' + esc(b.title) + '</span>' +
        '<b>' + b.count + ' 条</b>';
      legend.appendChild(item);
    });
  }

  /* ---------- 图谱渲染：纯 SVG 力导向（复用 db.js renderGraph 思路） ---------- */
  function renderGraph() {
    var wrap = document.getElementById('graphWrap');
    var svg = document.getElementById('graphSvg');
    if (!wrap || !svg) return;
    svg.innerHTML = '';

    var W = wrap.clientWidth || 900;
    var H = wrap.clientHeight || 560;
    var gMain = document.createElementNS(NS, 'g');
    svg.appendChild(gMain);

    var byName = {};
    var nodes = entries.map(function (e) {
      var n = {
        e: e,
        x: W / 2 + (Math.random() - 0.5) * W * 0.6,
        y: H / 2 + (Math.random() - 0.5) * H * 0.6,
        vx: 0, vy: 0, fx: null, fy: null, g: null, rect: null
      };
      byName[e.name] = n;
      return n;
    });

    var edges = [];
    var seenEdge = {};
    nodes.forEach(function (n) {
      n.e.related.forEach(function (r) {
        var t = byName[r.name];
        if (!t) return;
        var key = n.e.name < r.name ? n.e.name + '|' + r.name : r.name + '|' + n.e.name;
        if (seenEdge[key]) return;
        seenEdge[key] = true;
        edges.push({ a: n, b: t });
      });
    });
    setText('statEdge', edges.length);

    // 力导向物理参数
    var REP = 3200, K = 0.055, REST = 132, DAMP = 0.82;
    function step() {
      var i, j, a, b, dx, dy, d, f, fx, fy;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          a = nodes[i]; b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy) || 1;
          f = REP / (d * d);
          fx = (dx / d) * f; fy = (dy / d) * f;
          if (a.fx === null) { a.vx += fx; a.vy += fy; }
          if (b.fx === null) { b.vx -= fx; b.vy -= fy; }
        }
      }
      edges.forEach(function (ed) {
        a = ed.a; b = ed.b;
        dx = b.x - a.x; dy = b.y - a.y;
        d = Math.sqrt(dx * dx + dy * dy) || 1;
        f = K * (d - REST);
        fx = (dx / d) * f; fy = (dy / d) * f;
        if (a.fx === null) { a.vx += fx; a.vy += fy; }
        if (b.fx === null) { b.vx -= fx; b.vy -= fy; }
      });
      nodes.forEach(function (n) {
        if (n.fx !== null) return;
        n.vx += (W / 2 - n.x) * 0.012;
        n.vy += (H / 2 - n.y) * 0.012;
        n.vx *= DAMP; n.vy *= DAMP;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 24) n.x = 24;
        if (n.x > W - 24) n.x = W - 24;
        if (n.y < 24) n.y = 24;
        if (n.y > H - 24) n.y = H - 24;
      });
    }

    var panX = 0, panY = 0, scale = 1;
    function paint() {
      gMain.setAttribute('transform', 'translate(' + panX + ',' + panY + ') scale(' + scale + ')');
      edges.forEach(function (ed) {
        if (!ed.line) {
          ed.line = document.createElementNS(NS, 'line');
          ed.line.setAttribute('class', 'graph-edge');
          gMain.appendChild(ed.line);
        }
        ed.line.setAttribute('x1', ed.a.x); ed.line.setAttribute('y1', ed.a.y);
        ed.line.setAttribute('x2', ed.b.x); ed.line.setAttribute('y2', ed.b.y);
      });
      nodes.forEach(function (n) {
        if (!n.g) {
          n.g = document.createElementNS(NS, 'g');
          n.g.setAttribute('class', 'graph-node');
          n.g.setAttribute('data-name', n.e.name);
          n.rect = document.createElementNS(NS, 'rect');
          n.rect.setAttribute('rx', 8); n.rect.setAttribute('ry', 8);
          n.g.appendChild(n.rect);
          var t = document.createElementNS(NS, 'text');
          t.textContent = n.e.name;
          n.g.appendChild(t);
          gMain.appendChild(n.g);
        }
        var color = BOARD_COLORS[n.e.boardId] || '#b07cf0';
        var w = Math.max(64, n.e.name.length * 13 + 26);
        n.rect.setAttribute('x', -w / 2); n.rect.setAttribute('y', -15);
        n.rect.setAttribute('width', w); n.rect.setAttribute('height', 30);
        n.rect.setAttribute('fill', 'rgba(' + hexToRgb(color) + ', 0.13)');
        n.rect.setAttribute('stroke', color);
        n.g.setAttribute('transform', 'translate(' + n.x + ',' + n.y + ')');
        var t = n.g.querySelector('text');
        t.setAttribute('x', 0); t.setAttribute('y', 4);
        t.setAttribute('text-anchor', 'middle');
      });
    }

    var iter = 0, MAX = 380, dragging = false;
    function tick() {
      if (iter < MAX) { step(); iter++; }
      paint();
      if (iter < MAX && !dragging) requestAnimationFrame(tick);
    }

    // 交互：拖拽节点 / 平移画布 / 滚轮缩放 / 点击节点跳详情
    var draggingNode = null, panning = false, moved = 0, downX = 0, downY = 0;
    var hitNode = null;  // pointerdown 命中节点引用（指针捕获会使 pointerup.target 漂移为 svg）
    function svgPos(ev) {
      var r = svg.getBoundingClientRect();
      return { x: (ev.clientX - r.left - panX) / scale, y: (ev.clientY - r.top - panY) / scale };
    }
    svg.addEventListener('pointerdown', function (ev) {
      var nEl = ev.target.closest ? ev.target.closest('.graph-node') : null;
      hitNode = nEl;
      downX = ev.clientX; downY = ev.clientY; moved = 0;
      if (nEl) {
        draggingNode = byName[nEl.getAttribute('data-name')];
        if (draggingNode) { dragging = true; draggingNode.fx = draggingNode.x; draggingNode.fy = draggingNode.y; }
        svg.setPointerCapture(ev.pointerId);
      } else {
        panning = true;
        svg.setPointerCapture(ev.pointerId);
      }
    });
    svg.addEventListener('pointermove', function (ev) {
      moved = Math.max(moved, Math.abs(ev.clientX - downX) + Math.abs(ev.clientY - downY));
      if (draggingNode) {
        var p = svgPos(ev);
        draggingNode.fx = p.x; draggingNode.fy = p.y;
        draggingNode.x = p.x; draggingNode.y = p.y;
        paint();
      } else if (panning) {
        panX += ev.clientX - downX; panY += ev.clientY - downY;
        downX = ev.clientX; downY = ev.clientY;
        paint();
      }
    });
    function endDrag(ev) {
      var nEl = hitNode; hitNode = null;
      if (draggingNode) { draggingNode.fx = null; draggingNode.fy = null; draggingNode = null; }
      panning = false;
      if (dragging && moved < 5 && nEl) {
        var name = nEl.getAttribute('data-name');
        if (name) {
          dragging = false;
          window.location.href = 'entry.html?t=' + encodeURIComponent(name);
          return;
        }
      }
      dragging = false;
      if (iter < MAX) requestAnimationFrame(tick);
    }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      var r = svg.getBoundingClientRect();
      var mx = ev.clientX - r.left, my = ev.clientY - r.top;
      var ns = scale * (ev.deltaY < 0 ? 1.12 : 0.9);
      ns = Math.max(0.35, Math.min(3.2, ns));
      panX = mx - ((mx - panX) / scale) * ns;
      panY = my - ((my - panY) / scale) * ns;
      scale = ns;
      paint();
    }, { passive: false });

    tick();
  }

  /* ---------- 初始化 ---------- */
  function init() {
    renderLegend();
    setText('statBoard', boards.length);
    setText('statNode', entries.length);
    setText('statPhrase', (entriesByBoard.phrases || []).length);
    renderGraph();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
