/* ============================================================
   词条图谱板块逻辑 — graph.js
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
        edges.push({ a: n, b: t, key: key });
      });
    });
    setText('statEdge', edges.length);

    // 力导向物理参数（REP 回退至安全区间；斥力加距离下限、速度钳制、边界软约束防爆炸堆叠）
    var REP = 4800, K = 0.05, REST = 240, DAMP = 0.82;
    var REP_MIN_D = 40, MAX_SPEED = 50;
    function step() {
      var i, j, a, b, dx, dy, d, f, fx, fy;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          a = nodes[i]; b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy) || 1;
          d = Math.max(d, REP_MIN_D);  // 距离下限：防止 d→0 时 f=REP/d² 力爆炸
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
        var sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (sp > MAX_SPEED) { n.vx *= MAX_SPEED / sp; n.vy *= MAX_SPEED / sp; }  // 每帧速度上限
        n.x += n.vx; n.y += n.vy;
        // 边界软约束（弹性回弹）：越界部分折半弹回、速度反向衰减，不硬钳死角落
        if (n.x < 24) { n.x = 24 + (24 - n.x) * 0.5; n.vx = Math.abs(n.vx) * 0.4; }
        if (n.x > W - 24) { n.x = (W - 24) - (n.x - (W - 24)) * 0.5; n.vx = -Math.abs(n.vx) * 0.4; }
        if (n.y < 24) { n.y = 24 + (24 - n.y) * 0.5; n.vy = Math.abs(n.vy) * 0.4; }
        if (n.y > H - 24) { n.y = (H - 24) - (n.y - (H - 24)) * 0.5; n.vy = -Math.abs(n.vy) * 0.4; }
      });
    }

    // 初始视口：动画期间默认放大 1.3 倍并将布局中心对齐到画布中心；收敛后由 fitView 按包围盒自动适配
    var INIT_SCALE = 1.3;
    var panX = (W - W * INIT_SCALE) / 2, panY = (H - H * INIT_SCALE) / 2, scale = INIT_SCALE;
    function paint() {
      gMain.setAttribute('transform', 'translate(' + panX + ',' + panY + ') scale(' + scale + ')');
      edges.forEach(function (ed) {
        if (!ed.line) {
          ed.line = document.createElementNS(NS, 'line');
          ed.line.setAttribute('class', 'graph-edge');
          ed.line.style.transition = 'opacity 0.4s';
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
          n.g.style.transition = 'opacity 0.4s';
          n.rect = document.createElementNS(NS, 'rect');
          n.rect.setAttribute('rx', 8); n.rect.setAttribute('ry', 8);
          var titleEl = document.createElementNS(NS, 'title');
          titleEl.textContent = n.e.name;
          n.rect.appendChild(titleEl);
          n.g.appendChild(n.rect);
          // 超长标签（>8 字符）矩形内截断显示，悬浮 title 提示原文
          n.dispName = n.e.name.length > 8 ? n.e.name.slice(0, 8) + '…' : n.e.name;
          var t = document.createElementNS(NS, 'text');
          t.textContent = n.dispName;
          n.g.appendChild(t);
          gMain.appendChild(n.g);
        }
        var color = BOARD_COLORS[n.e.boardId] || '#b07cf0';
        var w = Math.max(72, n.dispName.length * 12 + 30);
        n._w = w;
        n.rect.setAttribute('x', -w / 2); n.rect.setAttribute('y', -17);
        n.rect.setAttribute('width', w); n.rect.setAttribute('height', 34);
        n.rect.setAttribute('fill', 'rgba(' + hexToRgb(color) + ', 0.13)');
        n.rect.setAttribute('stroke', color);
        n.g.setAttribute('transform', 'translate(' + n.x + ',' + n.y + ')');
        var t = n.g.querySelector('text');
        t.setAttribute('x', 0); t.setAttribute('y', 5);
        t.setAttribute('text-anchor', 'middle');
      });
    }

    var iter = 0, MAX = 480, dragging = false, fitted = false;
    function tick() {
      if (iter < MAX) { step(); iter++; }
      paint();
      if (iter >= MAX && !fitted) { fitted = true; fitView(); return; }
      if (iter < MAX && !dragging) requestAnimationFrame(tick);
    }

    // 收敛后按全部节点包围盒自动 fit 缩放居中（替代固定 INIT_SCALE），保留后续手动缩放/平移
    function fitView() {
      if (!nodes.length) return;
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach(function (n) {
        var hw = (n._w || 72) / 2 + 10, hh = 17 + 10;
        if (n.x - hw < minX) minX = n.x - hw;
        if (n.x + hw > maxX) maxX = n.x + hw;
        if (n.y - hh < minY) minY = n.y - hh;
        if (n.y + hh > maxY) maxY = n.y + hh;
      });
      var bw = Math.max(1, maxX - minX), bh = Math.max(1, maxY - minY);
      var ns = Math.min(W / bw, H / bh, 1.6);
      ns = Math.max(0.35, ns);
      scale = ns;
      panX = W / 2 - ((minX + maxX) / 2) * ns;
      panY = H / 2 - ((minY + maxY) / 2) * ns;
      paint();
      // 记录收敛后原始布局位置，供退出聚焦时补间回归
      nodes.forEach(function (n) { n.homeX = n.x; n.homeY = n.y; });
    }

    // ============ 聚焦模式：点击词条居中放大 + 邻居环形环绕 + 非邻居淡出 ============
    var FOCUS_ANIM_MS = 400;            // 聚焦切换补间动画时长（ms）
    var focusName = null;               // 当前聚焦词条名；null = 全图谱视图
    var focusNeighbors = null;          // 当前聚焦邻居名集合 {name:true}
    var focusEdgeKeys = {};             // 聚焦模式下仅显示的边 key（根↔邻居）
    var focusAnim = null;               // 进行中的补间动画句柄（用于中断/取代）
    var hitLink = null;                 // pointerdown 命中的「详情 ↗」链接
    var linkA = null;                   // 根节点「详情 ↗」入口（SVG <a>）
    var exitBtn = null;                 // 「退出聚焦」按钮

    function neighborsOf(n) {
      var out = [];
      n.e.related.forEach(function (r) {
        var t = byName[r.name];
        if (t && t !== n) out.push(t);
      });
      return out;
    }

    // 聚焦布局：根居中；邻居按原方位角排序后均匀铺到圆周（保持相对方位）
    // 半径按邻居数量与平均矩形宽自适应，避免重叠；上限受画布可视高度约束
    function focusTargets(name) {
      var root = byName[name];
      if (!root) return null;
      var neigh = neighborsOf(root);
      var cx = (W / 2 - panX) / scale, cy = (H / 2 - panY) / scale; // 视口中心对应逻辑坐标
      var k = neigh.length;
      var avgW = 96;
      if (k) {
        var sw = 0, c = 0;
        neigh.forEach(function (m) { if (m._w) { sw += m._w; c++; } });
        avgW = c ? sw / c : 96;
      }
      var R = Math.max(210, (k * (avgW + 26)) / (2 * Math.PI) * 1.35);
      R = Math.min(R, 340, (H * 0.44) / scale); // 显示半径 ≤ 画布高 44%，避免溢出可视区
      var targets = [{ n: root, tx: cx, ty: cy }];
      if (!k) return { root: root, neigh: neigh, targets: targets, R: R };
      var sorted = neigh.map(function (m) {
        return { m: m, a: Math.atan2(m.y - root.y, m.x - root.x) };
      }).sort(function (x, y) { return x.a - y.a; });
      var startA = k === 1 ? 0 : -Math.PI / 2;
      var stepA = (2 * Math.PI) / k;
      sorted.forEach(function (s, i) {
        var a = startA + i * stepA;
        targets.push({ n: s.m, tx: cx + Math.cos(a) * R, ty: cy + Math.sin(a) * R });
      });
      return { root: root, neigh: neigh, targets: targets, R: R };
    }

    // 补间动画（easeOutCubic，默认 400ms）：从当前位置平滑移动到目标
    function animatePositions(targets, dur, onDone) {
      var start = targets.map(function (t) {
        return { n: t.n, sx: t.n.x, sy: t.n.y, tx: t.tx, ty: t.ty };
      });
      var t0 = performance.now();
      var f = { start: start, t0: t0, dur: dur, onDone: onDone };
      focusAnim = f;
      function frame(now) {
        if (focusAnim !== f) return; // 已被新动画或退出取代，立即停止
        var p = Math.min(1, (now - f.t0) / f.dur);
        var e = 1 - Math.pow(1 - p, 3);
        f.start.forEach(function (s) {
          s.n.x = s.sx + (s.tx - s.sx) * e;
          s.n.y = s.sy + (s.ty - s.sy) * e;
        });
        paint();
        if (p < 1) requestAnimationFrame(frame);
        else { focusAnim = null; if (f.onDone) f.onDone(); }
      }
      requestAnimationFrame(frame);
    }

    // 聚焦可见性：非邻居淡出（opacity 0.06 + 禁指针），连线仅保留根↔邻居
    function applyFocusVisibility() {
      nodes.forEach(function (n) {
        var vis = !focusName || n.e.name === focusName || (focusNeighbors && focusNeighbors[n.e.name]);
        n.g.style.opacity = vis ? '1' : '0.06';
        n.g.style.pointerEvents = vis ? 'auto' : 'none';
      });
      edges.forEach(function (ed) {
        var vis = !focusName || focusEdgeKeys[ed.key];
        ed.line.style.opacity = vis ? '1' : '0';
        ed.line.style.pointerEvents = vis ? 'auto' : 'none';
      });
    }

    function buildDetailLink() {
      linkA = document.createElementNS(NS, 'a');
      linkA.setAttribute('class', 'graph-node-link');
      var linkText = document.createElementNS(NS, 'text');
      linkText.setAttribute('class', 'graph-node-detail-text');
      linkText.textContent = '详情 ↗';
      linkText.setAttribute('text-anchor', 'middle');
      linkA.appendChild(linkText);
      gMain.appendChild(linkA);
      linkA.style.display = 'none';
    }

    function buildExitBtn() {
      exitBtn = document.createElement('button');
      exitBtn.type = 'button';
      exitBtn.className = 'graph-focus-exit';
      exitBtn.textContent = '退出聚焦';
      exitBtn.addEventListener('click', exitFocus);
      wrap.appendChild(exitBtn);
      exitBtn.style.display = 'none';
    }

    // 聚焦到指定词条（进入或切换）：根居中高亮、邻居环绕、非邻居淡出
    function focusTo(name) {
      if (focusAnim) return; // 动画进行中忽略新请求
      var plan = focusTargets(name);
      if (!plan) return;
      focusName = name;
      focusNeighbors = {};
      plan.neigh.forEach(function (m) { focusNeighbors[m.e.name] = true; });
      focusEdgeKeys = {};
      edges.forEach(function (ed) {
        var aN = ed.a.e.name, bN = ed.b.e.name;
        if ((aN === name && focusNeighbors[bN]) || (bN === name && focusNeighbors[aN])) {
          focusEdgeKeys[ed.key] = true;
        }
      });
      nodes.forEach(function (n) {
        n.g.classList.toggle('graph-node-root', n.e.name === name);
      });
      if (!linkA) buildDetailLink();
      linkA.style.display = '';
      linkA.setAttribute('transform', 'translate(' + plan.root.x + ',' + (plan.root.y + 30) + ')');
      linkA.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'entry.html?t=' + encodeURIComponent(name));
      if (!exitBtn) buildExitBtn();
      exitBtn.style.display = '';
      applyFocusVisibility();
      animatePositions(plan.targets, FOCUS_ANIM_MS, function () {
        if (focusName === name) {
          linkA.setAttribute('transform', 'translate(' + plan.targets[0].tx + ',' + (plan.targets[0].ty + 30) + ')');
        }
      });
    }

    // 退出聚焦：节点补间回归原始布局，恢复全量显示，隐藏聚焦 UI
    function exitFocus() {
      if (!focusName) return;
      focusAnim = null;
      focusName = null;
      focusNeighbors = null;
      focusEdgeKeys = {};
      var targets = [];
      nodes.forEach(function (n) {
        if (n.homeX !== undefined) targets.push({ n: n, tx: n.homeX, ty: n.homeY });
      });
      applyFocusVisibility();
      animatePositions(targets, FOCUS_ANIM_MS);
      nodes.forEach(function (n) { n.g.classList.remove('graph-node-root'); });
      if (linkA) linkA.style.display = 'none';
      if (exitBtn) exitBtn.style.display = 'none';
    }

    // 交互：拖拽节点 / 平移画布 / 滚轮缩放 / 点击节点聚焦 / 空白或 Esc 退出聚焦
    var draggingNode = null, panning = false, moved = 0, downX = 0, downY = 0;
    var hitNode = null;  // pointerdown 命中节点引用（指针捕获会使 pointerup.target 漂移为 svg）
    function svgPos(ev) {
      var r = svg.getBoundingClientRect();
      return { x: (ev.clientX - r.left - panX) / scale, y: (ev.clientY - r.top - panY) / scale };
    }
    svg.addEventListener('pointerdown', function (ev) {
      var linkEl = ev.target.closest ? ev.target.closest('.graph-node-link') : null;
      hitLink = linkEl;
      downX = ev.clientX; downY = ev.clientY; moved = 0;
      if (linkEl) {
        dragging = true;
        svg.setPointerCapture(ev.pointerId);
        return;
      }
      var nEl = ev.target.closest ? ev.target.closest('.graph-node') : null;
      hitNode = nEl;
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
      var linkEl = hitLink; hitLink = null;
      if (draggingNode) { draggingNode.fx = null; draggingNode.fy = null; draggingNode = null; }
      panning = false;
      if (dragging && moved < 5) {
        // 「详情 ↗」入口：仍跳词条详情页
        if (linkEl) {
          dragging = false;
          if (focusName) window.location.href = 'entry.html?t=' + encodeURIComponent(focusName);
          return;
        }
        if (nEl) {
          var name = nEl.getAttribute('data-name');
          if (name) {
            dragging = false;
            if (focusName) {
              // 聚焦模式下点击邻居 → 平滑切换聚焦；点击根自身忽略
              if (name !== focusName && focusNeighbors && focusNeighbors[name]) focusTo(name);
            } else {
              focusTo(name); // 非聚焦模式：进入聚焦（不再默认跳 entry.html）
            }
            return;
          }
        }
      }
      // 点击画布空白（轻点，非拖拽平移）：聚焦模式下退出聚焦
      if (!nEl && !linkEl && moved < 5 && focusName) { dragging = false; exitFocus(); return; }
      dragging = false;
      if (iter < MAX) requestAnimationFrame(tick);
    }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && focusName) exitFocus();
    });
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
