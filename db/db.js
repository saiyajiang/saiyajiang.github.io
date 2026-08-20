/* ============================================================
   知识数据库 db.js — 多游戏板块交互逻辑（搜索/筛选/视图/图表）
   数据结构：window.GAME_DB = [ { id, name, icon, desc, categories: [ { name, items: [...] } ] } ]
   知识库：window.WIKI_DATA = [ { id, title, items: [ { text, subCategory? } ] } ]，合并为独立板块
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 数据归一化 ---------- */
  var PALETTE = [
    '#f2b54c', '#4fd8e0', '#9d8cff', '#6fe3a5',
    '#f27fa0', '#f26d6d', '#7dd3fc', '#fbd38d'
  ];

  var games = [];        // 游戏板块
  var entries = [];      // 当前板块扁平化条目

  function loadGames() {
    games = (window.GAME_DB || []).map(function (g) {
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
          catMap[catName].push({ text: it.text || '' });
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
    viewBtns: document.querySelectorAll('.db-viewswitch button'),
    version: $('#versionFilter')
  };

  /* ---------- 分类统计（当前板块） ---------- */
  function categoryStats() {
    var map = {};
    entries.forEach(function (e) {
      if (!map[e.category]) map[e.category] = { name: e.category, count: 0 };
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
    el.statCat.closest('.stat-card').querySelector('span').textContent = game ? game.name + '·分类' : '分类';
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
      var badge = '<span class="badge" style="background:rgba(79,216,224,0.12);color:var(--cyan);border:1px solid rgba(79,216,224,0.35)">' + esc(e.category) + '</span>';
      card.innerHTML =
        '<div class="db-card-top">' + badge +
        '<span class="db-title" title="' + esc(e.title) + '">' + esc(e.title) + '</span>' +
        '<span class="expand-icon">▾</span></div>' +
        '<div class="db-excerpt">' + esc(e.text) + '</div>' +
        '<div class="db-meta">' +
          '<span>' + (e.tag ? esc(e.tag) : '条目') + '</span>' +
          '<span>' + (e.date || '#' + e.hash) + '</span>' +
        '</div>';
      card.addEventListener('click', function () {
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

    // 表格化条目（columns/row）vs 传统条目
    var tableish = list[0] && list[0].columns && list[0].row;
    if (tableish) {
      table.className = 'db-table table-raw';
      var cols = list[0].columns;
      head.innerHTML = '<tr>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
      list.forEach(function (e) {
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
        body.appendChild(tr);
      });
    } else {
      table.className = 'db-table';
      head.innerHTML = '<tr><th>分类</th><th>标题</th><th>内容</th><th>标签</th><th>日期</th></tr>';
      list.forEach(function (e) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td><span class="badge" style="background:rgba(79,216,224,0.10);color:var(--cyan);border:1px solid rgba(148,174,210,0.25);padding:2px 8px;border-radius:999px;font-size:11px">' +
          esc(e.category) + '</span></td>' +
          '<td><strong style="color:var(--text-0)">' + esc(e.title) + '</strong></td>' +
          '<td>' + esc(e.text) + '</td>' +
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
      el.emptyDesc.textContent = '在 db/data/games.js 中添加游戏板块数据';
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
    // 表格化板块强制表格视图
    if (game && game.tableOnly) {
      state.view = 'table';
      el.viewBtns.forEach(function (b) {
        var on = b.getAttribute('data-view') === 'table';
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
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

  /* ---------- 初始化 ---------- */
  function init() {
    loadGames();
    bindSearch();
    bindView();
    bindVersion();
    switchGame();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
