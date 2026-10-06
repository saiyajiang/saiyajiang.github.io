/* ============================================================
   知识数据库 db.js — 多游戏板块交互逻辑（搜索/筛选/视图/图表）
   数据结构：window.GAME_DB = [ { id, name, icon, desc, categories: [ { name, items: [...] } ] } ]
   知识库：window.WIKI_DATA = [ { id, title, items: [ { text, subCategory? } ] } ]，合并为独立板块
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 数据归一化 ---------- */
  var PALETTE = [
    '#4fd8e0', '#35b6c8', '#2b9db0', '#5fd0da',
    '#7dd3fc', '#a5e8ee', '#3bc4d2', '#228497'
  ];

  var games = [];        // 游戏板块
  var entries = [];      // 当前板块扁平化条目

  function loadGames() {
    games = (window.GAME_DB || []).concat(window.RECOMMEND_DB || []).map(function (g) {
      return {
        id: g.id || '',
        name: g.name || '未命名',
        icon: g.icon || (g.name || '?').slice(0, 1),
        desc: g.desc || '',
        tableOnly: !!g.tableOnly,
        categories: (g.categories || []).map(function (c) {
          return { name: c.name || '未分类', columns: c.columns || null, items: c.items || [] };
        })
      };
    });

    // 合并知识库（原 wiki 细分板块，单一数据源 db/data/knowledge.js）
    if (window.WIKI_DATA && window.WIKI_DATA.length) {
      window.WIKI_DATA.forEach(function (sec) {
        var catMap = {};
        (sec.items || []).forEach(function (it) {
          var catName = it.subCategory || '条目';
          if (!catMap[catName]) catMap[catName] = [];
          var _t = it.text || '';
          catMap[catName].push({
            text: _t,
            name: extractName(_t) || _t.slice(0, 24),
            links: it.links || []
          });
        });
        games.push({
          id: 'wiki-' + sec.id,
          name: sec.title || '知识库',
          icon: (sec.title || '知').slice(0, 1),
          desc: '知识库 · 原Wiki细分',
          categories: Object.keys(catMap).map(function (k) {
            return { name: k, items: catMap[k] };
          })
        });
      });
      buildWikiIndex();
    }
  }

  function flattenGame(game) {
    entries = [];
    game.categories.forEach(function (cat) {
      cat.items.forEach(function (it) {
        // 表格化条目：显式 {row} 或扁平行对象（如 {序号:'1',版本:'v2.4',...}）均兼容
        if (cat.columns) {
          var row = it.row || it;
          entries.push({
            kind: 'game',
            gameId: game.id,
            category: cat.name,
            columns: cat.columns,
            row: row,
            title: '',
            text: '',
            tag: '',
            date: '',
            hash: hashStr(game.id + '|' + cat.name + '|' + JSON.stringify(row).slice(0, 80))
          });
          return;
        }
        // 知识库条目：词条名作标题，预解析相关条目（links 优先 + 文本自动匹配）
        if (game.id.indexOf('wiki-') === 0) {
          var wh = hashStr(game.id + '|' + cat.name + '|' + (it.text || it.title || '').slice(0, 60));
          entries.push({
            kind: 'wiki',
            gameId: game.id,
            category: cat.name,
            columns: null,
            row: null,
            title: it.name || it.title || (it.text ? it.text.slice(0, 24) : ''),
            text: it.text || '',
            tag: it.tag || '',
            date: it.date || '',
            hash: wh,
            related: resolveRelated({ hash: wh, text: it.text || '', links: it.links || [] })
          });
          return;
        }
        entries.push({
          kind: 'game',
          gameId: game.id,
          category: cat.name,
          columns: null,
          row: null,
          title: it.title || (it.text ? it.text.slice(0, 24) : ''),
          text: it.text || '',
          tag: it.tag || '',
          date: it.date || '',
          hash: hashStr(game.id + '|' + cat.name + '|' + (it.text || it.title || '').slice(0, 60))
        });
      });
    });
  }

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return (h >>> 0).toString(36);
  }

  /* ---------- 知识库关联：links 显式指定 + 文本包含自动匹配 ---------- */
  var wikiAll = [];      // 全部知识条目：{gameId, category, name, core, title, text, links, hash}
  var wikiGameIdx = {};  // gameId -> games 索引

  // 词条名 = text 中「 — 」前的片段
  function extractName(text) {
    var i = String(text).indexOf(' — ');
    return i > 0 ? String(text).slice(0, i).trim() : '';
  }

  // 核心汉字名（去掉拼音/外来字母），如「琴 qín」→「琴」
  function coreNameOf(name) {
    return String(name).replace(/[a-zA-Z\u00C0-\u024F\u2019']/g, '').trim();
  }

  function isHan(ch) { return ch && /[\u4E00-\u9FFF]/.test(ch); }

  // 关键词 kw 是否指向条目 name（全名/核心名/互相包含）
  function nameMatches(name, kw) {
    if (!kw) return false;
    var core = coreNameOf(name);
    if (name === kw || core === kw) return true;
    if (kw.length >= 2 && (name.indexOf(kw) !== -1 || core.indexOf(kw) !== -1)) return true;
    // 纯英文/拼音词条（如 QT、rat）core 为空串，须跳过包含判断，避免 '' 恒命中污染
    if (core && name.length >= 2 && (kw.indexOf(name) !== -1 || kw.indexOf(core) !== -1)) return true;
    return false;
  }

  // 文本是否出现目标词条名（单字要求前后非汉字，避免误连）
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

  // 构建全局知识条目索引（须在 loadGames 推入全部 wiki 板块后调用）
  function buildWikiIndex() {
    wikiAll = [];
    window.WIKI_DATA.forEach(function (sec) {
      (sec.items || []).forEach(function (it) {
        var text = it.text || '';
        var name = extractName(text) || text.slice(0, 12);
        wikiAll.push({
          gameId: 'wiki-' + sec.id,
          category: it.subCategory || '条目',
          name: name,
          core: coreNameOf(name),
          title: name,
          text: text,
          links: it.links || [],
          hash: hashStr('wiki-' + sec.id + '|' + (it.subCategory || '条目') + '|' + text.slice(0, 60))
        });
      });
    });
    for (var i = 0; i < games.length; i++) {
      if (games[i].id.indexOf('wiki-') === 0) wikiGameIdx[games[i].id] = i;
    }
  }

  // 计算条目 e 的相关条目：links 指定优先，未指定则文本包含词条名自动关联
  function resolveRelated(e) {
    var seen = {};
    var list = [];
    function add(t) {
      if (!t || t.hash === e.hash || seen[t.hash]) return;
      seen[t.hash] = true;
      list.push({ name: t.name, hash: t.hash, gameId: t.gameId, category: t.category });
    }
    (e.links || []).forEach(function (kw) {
      wikiAll.forEach(function (t) { if (nameMatches(t.name, kw)) add(t); });
    });
    wikiAll.forEach(function (t) {
      if (t.hash === e.hash) return;
      if (textHits(e.text, t)) add(t);
    });
    return list;
  }

  function currentIsWiki() {
    var g = games[state.gameIdx];
    return !!(g && g.id.indexOf('wiki-') === 0);
  }

  /* ---------- 相关条目跳转：切换板块 + 卡片视图 + 滚动高亮 ---------- */
  function jumpTo(hash, gameId) {
    if (gameId && wikiGameIdx[gameId] != null && wikiGameIdx[gameId] !== state.gameIdx) {
      state.gameIdx = wikiGameIdx[gameId];
    }
    state.category = 'all';
    state.query = '';
    el.search.value = '';
    if (state.view !== 'card') {
      state.view = 'card';
      el.viewBtns.forEach(function (b) {
        var on = b.getAttribute('data-view') === 'card';
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    switchGame();
    var target = el.grid.querySelector('.db-card[data-hash="' + hash + '"]');
    if (target) {
      target.classList.add('expanded', 'jump-target');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { target.classList.remove('jump-target'); }, 1800);
    }
  }

  /* ---------- 图谱视图：纯 SVG 力导向（自实现，无外部 CDN） ---------- */
  function renderGraph(list) {
    el.grid.className = 'db-grid graph-view';
    el.grid.innerHTML = '';
    el.empty.hidden = list.length > 0;
    if (!list.length) return;

    var wrap = document.createElement('div');
    wrap.className = 'db-graph-wrap';
    el.grid.appendChild(wrap);

    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'db-graph-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '知识关联图谱');
    wrap.appendChild(svg);

    var W = wrap.clientWidth || 900;
    var H = wrap.clientHeight || 560;
    var gMain = document.createElementNS(NS, 'g');
    svg.appendChild(gMain);

    var entryByHash = {};
    list.forEach(function (e) { entryByHash[e.hash] = e; });

    var nodes = list.map(function (e) {
      return {
        hash: e.hash,
        gameId: e.gameId,
        label: e.title || e.text.slice(0, 12),
        x: W / 2 + (Math.random() - 0.5) * W * 0.6,
        y: H / 2 + (Math.random() - 0.5) * H * 0.6,
        vx: 0, vy: 0, fx: null, fy: null,
        rect: null, g: null
      };
    });
    var byHash = {};
    nodes.forEach(function (n) { byHash[n.hash] = n; });

    var edges = [];
    var seenEdge = {};
    nodes.forEach(function (n) {
      var ent = entryByHash[n.hash];
      (ent.related || []).forEach(function (r) {
        var t = byHash[r.hash];
        if (!t) return; // 仅绘制本板块内的关联边
        var key = n.hash < r.hash ? n.hash + '|' + r.hash : r.hash + '|' + n.hash;
        if (seenEdge[key]) return;
        seenEdge[key] = true;
        edges.push({ a: n, b: t });
      });
    });

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
          ed.line.setAttribute('class', 'db-graph-edge');
          gMain.appendChild(ed.line);
        }
        ed.line.setAttribute('x1', ed.a.x); ed.line.setAttribute('y1', ed.a.y);
        ed.line.setAttribute('x2', ed.b.x); ed.line.setAttribute('y2', ed.b.y);
      });
      nodes.forEach(function (n) {
        if (!n.g) {
          n.g = document.createElementNS(NS, 'g');
          n.g.setAttribute('class', 'db-graph-node');
          n.g.setAttribute('data-hash', n.hash);
          n.rect = document.createElementNS(NS, 'rect');
          n.rect.setAttribute('rx', 8); n.rect.setAttribute('ry', 8);
          n.g.appendChild(n.rect);
          var t = document.createElementNS(NS, 'text');
          t.textContent = n.label;
          n.g.appendChild(t);
          gMain.appendChild(n.g);
        }
        var w = Math.max(64, n.label.length * 13 + 26);
        n.rect.setAttribute('x', -w / 2); n.rect.setAttribute('y', -15);
        n.rect.setAttribute('width', w); n.rect.setAttribute('height', 30);
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

    // 交互：拖拽节点 / 平移画布 / 滚轮缩放 / 点击节点跳转
    var draggingNode = null, panning = false, moved = 0, downX = 0, downY = 0;
    function svgPos(ev) {
      var r = svg.getBoundingClientRect();
      return { x: (ev.clientX - r.left - panX) / scale, y: (ev.clientY - r.top - panY) / scale };
    }
    svg.addEventListener('pointerdown', function (ev) {
      var nEl = ev.target.closest ? ev.target.closest('.db-graph-node') : null;
      downX = ev.clientX; downY = ev.clientY; moved = 0;
      if (nEl) {
        draggingNode = byHash[nEl.getAttribute('data-hash')];
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
      if (draggingNode) { draggingNode.fx = null; draggingNode.fy = null; draggingNode = null; }
      panning = false;
      if (dragging && ev && moved < 5) {
        var nEl = ev.target.closest ? ev.target.closest('.db-graph-node') : null;
        if (nEl) {
          var n = byHash[nEl.getAttribute('data-hash')];
          if (n) { dragging = false; jumpTo(n.hash, n.gameId); return; }
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
      // 以指针为锚点缩放
      panX = mx - ((mx - panX) / scale) * ns;
      panY = my - ((my - panY) / scale) * ns;
      scale = ns;
      paint();
    }, { passive: false });

    tick();
    var hint = document.createElement('div');
    hint.className = 'db-graph-hint';
    hint.textContent = '拖拽节点调整布局 · 滚轮缩放 · 拖动空白平移 · 点击节点跳转条目';
    wrap.appendChild(hint);
  }

  /* ---------- 状态 ---------- */
  var state = {
    gameIdx: 0,      // 当前板块索引
    query: '',
    category: 'all',
    view: 'card',
    version: 'all'
  };

  /* ---------- DOM ---------- */
  var $ = function (sel) { return document.querySelector(sel); };
  var el = {
    search: $('#searchInput'),
    grid: $('#dbGrid'),
    empty: $('#emptyState'),
    emptyTitle: $('#emptyTitle'),
    emptyDesc: $('#emptyDesc'),
    chips: $('#categoryChips'),
    dock: $('#dbDock'),
    gameTabs: $('#gameTabs'),
    donut: $('#donutChart'),
    donutTotal: $('#donutTotal'),
    donutLegend: $('#donutLegend'),
    barChart: $('#barChart'),
    statGame: $('#statGame'),
    statCat: $('#statCat'),
    statItem: $('#statItem'),
    viewBtns: document.querySelectorAll('.wiki-viewswitch button'),
    version: $('#versionFilter')
  };

  /* ---------- 分类统计（当前板块） ---------- */
  function categoryStats() {
    var map = {};
    entries.forEach(function (e) {
      if (!map[e.category]) map[e.category] = { name: e.category, id: e.category, count: 0 };
      map[e.category].count++;
    });
    var list = Object.keys(map).map(function (k) { return map[k]; });
    list.sort(function (a, b) { return b.count - a.count; });
    return list;
  }

  /* ---------- 渲染：统计卡 ---------- */
  function renderStats() {
    var game = games[state.gameIdx];
    var cats = categoryStats();
    el.statGame.textContent = games.length;
    el.statCat.textContent = cats.length;
    el.statItem.textContent = entries.length;
    el.statCat.closest('.wiki-stat').querySelector('span').textContent = game ? game.name + '·分类' : '分类';
  }

  /* ---------- 渲染：游戏板块切换 ---------- */
  function renderGameTabs() {
    el.gameTabs.innerHTML = '';
    games.forEach(function (g, i) {
      var tab = document.createElement('button');
      tab.className = 'game-tab' + (i === state.gameIdx ? ' active' : '');
      tab.innerHTML =
        '<span class="game-icon' + (g.icon.length > 1 ? ' wide' : '') + '">' + esc(g.icon) + '</span>' +
        '<span class="game-name">' + esc(g.name) + '</span>' +
        '<span class="game-count">' + totalOf(g) + ' 条</span>';
      tab.addEventListener('click', function () {
        state.gameIdx = i;
        state.category = 'all';
        state.query = '';
        el.search.value = '';
        switchGame();
      });
      el.gameTabs.appendChild(tab);
    });
  }

  function totalOf(g) {
    return g.categories.reduce(function (s, c) { return s + c.items.length; }, 0);
  }

  /* ---------- 渲染：环形图 ---------- */
  function renderDonut(cats) {
    var total = cats.reduce(function (s, c) { return s + c.count; }, 0);
    el.donutTotal.textContent = total;

    var svgNS = 'http://www.w3.org/2000/svg';
    el.donut.innerHTML = '';
    var bg = document.createElementNS(svgNS, 'circle');
    bg.setAttribute('class', 'bg');
    bg.setAttribute('cx', '21'); bg.setAttribute('cy', '21'); bg.setAttribute('r', '15.915');
    bg.setAttribute('stroke-dasharray', '100 100');
    el.donut.appendChild(bg);

    var offset = 0;
    var shown = cats.slice(0, 8);
    shown.forEach(function (c, i) {
      var pct = total ? (c.count / total) * 100 : 0;
      var circ = document.createElementNS(svgNS, 'circle');
      circ.setAttribute('cx', '21'); circ.setAttribute('cy', '21'); circ.setAttribute('r', '15.915');
      circ.setAttribute('stroke', PALETTE[i % PALETTE.length]);
      circ.setAttribute('stroke-dasharray', pct + ' ' + (100 - pct));
      circ.setAttribute('stroke-dashoffset', (25 - offset));
      circ.setAttribute('stroke-linecap', 'butt');
      circ.style.transitionDelay = (i * 0.06) + 's';
      el.donut.appendChild(circ);
      offset += pct;
    });

    el.donutLegend.innerHTML = '';
    shown.forEach(function (c, i) {
      var row = document.createElement('div');
      row.className = 'legend-row';
      row.innerHTML =
        '<span class="swatch" style="background:' + PALETTE[i % PALETTE.length] + '"></span>' +
        '<span class="l-name">' + esc(c.name) + '</span>' +
        '<span class="l-count">' + c.count + '</span>';
      el.donutLegend.appendChild(row);
    });
  }

  /* ---------- 渲染：柱状图 ---------- */
  function renderBars(cats) {
    el.barChart.innerHTML = '';
    var max = Math.max.apply(null, cats.map(function (c) { return c.count; })) || 1;
    cats.slice(0, 10).forEach(function (c, i) {
      var row = document.createElement('div');
      row.className = 'bar-row' + (i % 2 ? ' alt' : '');
      row.innerHTML =
        '<span class="bar-label" title="' + esc(c.name) + '">' + esc(c.name) + '</span>' +
        '<div class="bar-track"><div class="bar-fill" data-w="' + Math.round((c.count / max) * 100) + '%"></div></div>' +
        '<span class="bar-count">' + c.count + '</span>';
      el.barChart.appendChild(row);
    });
    requestAnimationFrame(function () {
      el.barChart.querySelectorAll('.bar-fill').forEach(function (f) {
        f.style.width = f.getAttribute('data-w');
      });
    });
  }

  /* ---------- 渲染：chips 与 dock ---------- */
  function renderChips(cats) {
    var all = { name: '全部', id: 'all', count: entries.length };
    var list = [all].concat(cats);

    el.chips.innerHTML = '';
    list.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'chip' + (state.category === c.id ? ' active' : '');
      btn.setAttribute('data-cat', c.id);
      btn.innerHTML = esc(c.name) + '<span class="chip-count">' + c.count + '</span>';
      btn.addEventListener('click', function () {
        state.category = c.id;
        renderChips(cats);
        renderDock(cats);
        renderList();
        syncActive();
      });
      el.chips.appendChild(btn);
    });

    renderDock(cats);
  }

  function renderDock(cats) {
    el.dock.innerHTML = '';
    var list = [{ name: '全部', id: 'all' }].concat(cats);
    list.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = state.category === c.id ? 'active' : '';
      btn.setAttribute('data-cat', c.id);
      btn.textContent = c.name;
      btn.addEventListener('click', function () {
        state.category = c.id;
        renderChips(cats);
        renderList();
        syncActive();
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      el.dock.appendChild(btn);
    });
  }

  function syncActive() {
    el.dock.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-cat') === state.category);
    });
  }

  function versionValue(e) {
    if (!e.columns || !e.row) return '';
    var vi = e.columns.indexOf('版本号');
    if (vi === -1) vi = e.columns.indexOf('版本');
    if (vi === -1) return '';
    return String(e.row[e.columns[vi]] || '').trim();
  }

  /* ---------- 筛选逻辑 ---------- */
  function filtered() {
    var q = state.query.trim().toLowerCase();
    return entries.filter(function (e) {
      if (state.category !== 'all' && e.category !== state.category) return false;
      if (state.version !== 'all') {
        var v = versionValue(e);
        if (v && v.indexOf(state.version) !== 0) return false;
      }
      if (!q) return true;
      var hay;
      if (e.columns && e.row) {
        hay = e.columns.map(function (c) { return e.row[c]; }).join(' ');
      } else {
        hay = e.title + ' ' + e.text + ' ' + e.category + ' ' + e.tag + ' ' + e.date;
      }
      return hay.toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ---------- 渲染：主列表 ---------- */
  function renderList() {
    // 图谱视图：仅知识库板块，呈现当前板块全部条目的关联网
    if (state.view === 'graph' && currentIsWiki()) {
      renderGraph(entries);
      return;
    }
    var list = filtered();
    el.grid.className = 'db-grid' + (state.view === 'table' ? ' table-view' : '');
    el.empty.hidden = list.length > 0;

    if (!list.length) {
      el.grid.innerHTML = '';
      return;
    }

    if (state.view === 'table') {
      renderTable(list);
    } else {
      renderCards(list);
    }
  }

  function renderCards(list) {
    el.grid.innerHTML = '';
    list.forEach(function (e, i) {
      var card = document.createElement('div');
      card.className = 'db-card';
      card.style.animationDelay = Math.min(i * 0.03, 0.4) + 's';
      card.setAttribute('data-hash', e.hash);
      var badge = '<span class="badge" style="background:rgba(var(--wiki-accent-rgb),0.12);color:var(--wiki-accent);border:1px solid rgba(var(--wiki-accent-rgb),0.35)">' + esc(e.category) + '</span>';
      var relatedHtml = '';
      if (e.kind === 'wiki' && e.related && e.related.length) {
        relatedHtml =
          '<div class="db-related"><div class="db-related-head">相关条目 <em>RELATED</em></div><div class="db-related-list">' +
          e.related.map(function (r) {
            return '<a class="db-related-item" data-hash="' + r.hash + '" data-game="' + esc(r.gameId) + '" data-cat="' + esc(r.category) + '" href="#">' +
              '<span class="db-related-name">' + esc(r.name) + '</span>' +
              (r.category && r.category !== '条目' ? '<span class="db-related-cat">' + esc(r.category) + '</span>' : '') +
              (r.gameId !== e.gameId ? '<span class="db-related-cross" title="跨板块">↗</span>' : '') +
              '</a>';
          }).join('') +
          '</div></div>';
      }
      card.innerHTML =
        '<div class="db-card-top">' + badge +
        '<span class="db-title" title="' + esc(e.title) + '">' + esc(e.title) + '</span>' +
        '<span class="expand-icon">▾</span></div>' +
        '<div class="db-excerpt">' + censorText(esc(e.text)) + '</div>' +
        relatedHtml +
        '<div class="db-meta">' +
          '<span>' + (e.tag ? esc(e.tag) : '条目') + '</span>' +
          '<span>' + (e.date || '#' + e.hash) + '</span>' +
        '</div>';
      card.addEventListener('click', function (ev) {
        if (ev.target.closest && ev.target.closest('.db-related-item')) return;
        card.classList.toggle('expanded');
      });
      el.grid.appendChild(card);
    });
  }

  function renderTable(list) {
    el.grid.innerHTML = '';
    var table = document.createElement('table');
    var head = document.createElement('thead');
    var body = document.createElement('tbody');

    // 表格化条目（columns）vs 传统条目：按分类分组，每组用自身 columns 建表
    var tableish = list[0] && list[0].columns && list[0].row;
    if (tableish) {
      var groups = [], order = [];
      list.forEach(function (e) {
        var idx = order.indexOf(e.category);
        if (idx === -1) {
          order.push(e.category);
          groups.push({ name: e.category, columns: e.columns, items: [] });
          idx = groups.length - 1;
        }
        groups[idx].items.push(e);
      });

      groups.forEach(function (g) {
        if (groups.length > 1) {
          var heading = document.createElement('div');
          heading.className = 'db-table-cat';
          heading.innerHTML =
            '<span class="badge" style="background:rgba(var(--wiki-accent-rgb),0.12);color:var(--wiki-accent);border:1px solid rgba(var(--wiki-accent-rgb),0.35)">' +
            esc(g.name) + '</span>' +
            '<span class="db-table-count">' + g.items.length + ' 条</span>';
          el.grid.appendChild(heading);
        }

        var t = document.createElement('table');
        var th = document.createElement('thead');
        var tb = document.createElement('tbody');
        t.className = 'db-table table-raw';
        var cols = g.columns;
        th.innerHTML = '<tr>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
        g.items.forEach(function (e) {
          var tr = document.createElement('tr');
          tr.innerHTML = cols.map(function (c) {
            var v = e.row[c];
            return '<td>' + esc(v == null || v === '' ? '—' : v) + '</td>';
          }).join('');
          tr.addEventListener('click', function () {
            Array.prototype.forEach.call(tr.children, function (td) {
              td.classList.toggle('exp');
              td.style.whiteSpace = td.classList.contains('exp') ? 'normal' : 'nowrap';
            });
          });
          tb.appendChild(tr);
        });
        t.appendChild(th);
        t.appendChild(tb);
        el.grid.appendChild(t);
      });
      return;
    } else {
      table.className = 'db-table';
      head.innerHTML = '<tr><th>分类</th><th>标题</th><th>内容</th><th>标签</th><th>日期</th></tr>';
      list.forEach(function (e) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td><span class="badge" style="background:rgba(var(--wiki-accent-rgb),0.10);color:var(--wiki-accent);border:1px solid rgba(148,174,210,0.25);padding:2px 8px;border-radius:999px;font-size:11px">' +
          esc(e.category) + '</span></td>' +
          '<td><strong style="color:var(--text-0)">' + esc(e.title) + '</strong></td>' +
          '<td>' + censorText(esc(e.text)) + '</td>' +
          '<td style="color:var(--text-2);white-space:nowrap">' + esc(e.tag || '—') + '</td>' +
          '<td style="color:var(--text-2);white-space:nowrap">' + esc(e.date || '—') + '</td>';
        tr.addEventListener('click', function () {
          var td = tr.children[2];
          td.classList.toggle('exp');
          td.style.whiteSpace = td.classList.contains('exp') ? 'normal' : '';
        });
        body.appendChild(tr);
      });
    }
    table.appendChild(head);
    table.appendChild(body);
    el.grid.appendChild(table);
  }

  /* ---------- 搜索 ---------- */
  function bindSearch() {
    el.search.addEventListener('input', function () {
      state.query = el.search.value;
      renderList();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === '/' && document.activeElement !== el.search) {
        ev.preventDefault();
        el.search.focus();
      }
      if (ev.key === 'Escape') {
        el.search.blur();
      }
    });
  }

  /* ---------- 视图切换 ---------- */
  function bindView() {
    el.viewBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var game = games[state.gameIdx];
        if (game && game.tableOnly && btn.getAttribute('data-view') === 'card') return;
        if (btn.getAttribute('data-view') === 'graph' && !(game && game.id.indexOf('wiki-') === 0)) return;
        state.view = btn.getAttribute('data-view');
        el.viewBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        renderList();
      });
    });
  }

  /* ---------- 版本筛选 ---------- */
  function versionOptions() {
    var map = {};
    entries.forEach(function (e) {
      var v = versionValue(e);
      if (!v) return;
      var k = v.split('.')[0] + (v.match(/^\d+\.\d+$/) ? '.x' : '');
      map[k] = true;
    });
    return Object.keys(map).sort(function (a, b) {
      var na = parseFloat(a), nb = parseFloat(b);
      return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
    });
  }

  function renderVersionOptions() {
    if (!el.version) return;
    el.version.innerHTML = '';
    var opts = versionOptions();
    if (!opts.length) { el.version.style.display = 'none'; return; }
    el.version.style.display = '';
    var all = document.createElement('option');
    all.value = 'all';
    all.textContent = '全部版本';
    el.version.appendChild(all);
    opts.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      el.version.appendChild(o);
    });
    el.version.value = state.version;
  }

  function bindVersion() {
    if (!el.version) return;
    el.version.addEventListener('change', function () {
      state.version = el.version.value;
      renderList();
    });
  }

  /* ---------- 切换游戏板块 ---------- */
  function switchGame() {
    if (!games.length) {
      el.gameTabs.innerHTML = '';
      el.empty.hidden = false;
      el.emptyTitle.textContent = '暂无板块';
      el.emptyDesc.textContent = '在 wiki/db/data/games.js 中添加游戏板块数据';
      el.grid.innerHTML = '';
      el.chips.innerHTML = '';
      el.dock.innerHTML = '';
      el.donut.innerHTML = '';
      el.donutLegend.innerHTML = '';
      el.barChart.innerHTML = '';
      el.statGame.textContent = '0';
      el.statCat.textContent = '0';
      el.statItem.textContent = '0';
      return;
    }
    renderGameTabs();
    var game = games[state.gameIdx];
    flattenGame(game);
    // 非知识库板块：图谱视图不可用，回退卡片视图
    if (!(game && game.id.indexOf('wiki-') === 0) && state.view === 'graph') {
      state.view = 'card';
      el.viewBtns.forEach(function (b) {
        if (b.getAttribute('data-view') === 'graph') {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        }
      });
    }
    // 表格化板块强制表格视图
    if (game && game.tableOnly) {
      state.view = 'table';
      el.viewBtns.forEach(function (b) {
        var on = b.getAttribute('data-view') === 'table';
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        if (b.getAttribute('data-view') === 'card') {
          b.disabled = true;
          b.title = '该板块仅支持表格视图';
        } else {
          b.disabled = false;
          b.removeAttribute('title');
        }
      });
    } else {
      // 非表格化板块：恢复卡片按钮可用
      el.viewBtns.forEach(function (b) {
        if (b.getAttribute('data-view') === 'card') {
          b.disabled = false;
          b.removeAttribute('title');
        }
      });
    }
    // 图谱按钮仅知识库板块可用
    el.viewBtns.forEach(function (b) {
      if (b.getAttribute('data-view') === 'graph') {
        var ok = !!(game && game.id.indexOf('wiki-') === 0);
        b.disabled = !ok;
        if (ok) { b.removeAttribute('title'); }
        else { b.title = '仅知识库板块可用'; }
      }
    });
    state.version = 'all';
    var cats = categoryStats();
    renderStats();
    renderDonut(cats);
    renderBars(cats);
    renderChips(cats);
    renderVersionOptions();
    renderList();
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* 敏感词黑框遮挡：将指定文本替换为 censor span，悬停后显示原文 */
  function censorText(s) {
    return String(s).replace('your anus（你的肛门）', '<span class="censor">your anus（你的肛门）</span>');
  }

  /* ---------- 初始化 ---------- */
  function init() {
    loadGames();
    // 默认选中首个非空板块，避免默认落入空壳板块（如鸣潮待填充）导致初始空白
    for (var i = 0; i < games.length; i++) {
      if (totalOf(games[i]) > 0) { state.gameIdx = i; break; }
    }
    bindSearch();
    bindView();
    bindVersion();
    // 相关条目内链跳转委托（卡片重建时无需重复绑定）
    el.grid.addEventListener('click', function (ev) {
      var a = ev.target.closest ? ev.target.closest('.db-related-item') : null;
      if (!a) return;
      ev.preventDefault();
      jumpTo(a.getAttribute('data-hash'), a.getAttribute('data-game'));
    });
    switchGame();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
