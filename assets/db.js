/* ============================================================
   知识数据库 db.js — 独立交互逻辑（搜索/筛选/视图/图表）
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 数据归一化 ---------- */
  var PALETTE = [
    '#f2b54c', '#4fd8e0', '#9d8cff', '#6fe3a5',
    '#f27fa0', '#f26d6d', '#7dd3fc', '#fbd38d'
  ];

  var entries = [];

  function collectWiki() {
    if (!window.WIKI_DATA) return;
    window.WIKI_DATA.forEach(function (cat) {
      if (!cat || !cat.items) return;
      cat.items.forEach(function (it) {
        entries.push({
          kind: 'wiki',
          category: cat.title || cat.id || '未分类',
          categoryId: cat.id || '',
          subCategory: it.subCategory || '',
          title: it.subCategory || it.text.slice(0, 24),
          text: it.text,
          source: '',
          hash: hashStr(cat.id + '|' + it.text)
        });
      });
    });
  }

  function collectQuotes() {
    if (!window.QUOTES_DATA) return;
    window.QUOTES_DATA.forEach(function (q) {
      if (!q) return;
      var t = Array.isArray(q.text) ? q.text.join('') : (q.text || '');
      entries.push({
        kind: 'quote',
        category: '摘抄短语',
        categoryId: 'quotes',
        subCategory: '',
        title: q.source || (q.isDialogue ? '对话摘录' : '摘抄短语'),
        text: t,
        source: q.source || '',
        isDialogue: !!q.isDialogue,
        hash: hashStr('quote|' + (q.source || '') + '|' + t.slice(0, 60))
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
    query: '',
    category: 'all',
    view: 'card'
  };

  /* ---------- DOM ---------- */
  var $ = function (sel) { return document.querySelector(sel); };
  var el = {
    search: $('#searchInput'),
    searchHint: $('#searchHint'),
    grid: $('#dbGrid'),
    empty: $('#emptyState'),
    chips: $('#categoryChips'),
    dock: $('#dbDock'),
    donut: $('#donutChart'),
    donutTotal: $('#donutTotal'),
    donutLegend: $('#donutLegend'),
    barChart: $('#barChart'),
    statCat: $('#statCat'),
    statItem: $('#statItem'),
    statQuote: $('#statQuote'),
    viewBtns: document.querySelectorAll('.db-viewswitch button')
  };

  /* ---------- 分类统计 ---------- */
  function categoryStats() {
    var map = {};
    entries.forEach(function (e) {
      if (!map[e.categoryId]) {
        map[e.categoryId] = { name: e.category, id: e.categoryId, count: 0 };
      }
      map[e.categoryId].count++;
    });
    var list = Object.keys(map).map(function (k) { return map[k]; });
    list.sort(function (a, b) { return b.count - a.count; });
    return list;
  }

  /* ---------- 渲染：统计卡 ---------- */
  function renderStats(cats) {
    var wikiCount = entries.filter(function (e) { return e.kind === 'wiki'; }).length;
    var quoteCount = entries.filter(function (e) { return e.kind === 'quote'; }).length;
    el.statCat.textContent = cats.length;
    el.statItem.textContent = wikiCount;
    el.statQuote.textContent = quoteCount;
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

    /* legend */
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

    /* dock：只放有内容的分类 */
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

  /* ---------- 筛选逻辑 ---------- */
  function filtered() {
    var q = state.query.trim().toLowerCase();
    return entries.filter(function (e) {
      if (state.category !== 'all' && e.categoryId !== state.category) return false;
      if (!q) return true;
      var hay = (e.title + ' ' + e.text + ' ' + e.category + ' ' + e.subCategory + ' ' + e.source).toLowerCase();
      return hay.indexOf(q) !== -1;
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
      var badge = e.kind === 'quote'
        ? '<span class="badge" style="background:rgba(242,181,76,0.14);color:var(--amber);border:1px solid rgba(242,181,76,0.35)">摘抄</span>'
        : '<span class="badge" style="background:rgba(79,216,224,0.12);color:var(--cyan);border:1px solid rgba(79,216,224,0.35)">' + esc(e.category) + '</span>';
      card.innerHTML =
        '<div class="db-card-top">' + badge +
        '<span class="db-title" title="' + esc(e.title) + '">' + esc(e.title) + '</span>' +
        '<span class="expand-icon">▾</span></div>' +
        '<div class="db-excerpt">' + esc(e.text) + '</div>' +
        '<div class="db-meta">' +
          '<span>' + esc(e.subCategory || (e.isDialogue ? '对话' : e.kind === 'quote' ? '短语' : '条目')) + '</span>' +
          '<span>' + (e.source ? esc(e.source) : '#' + e.hash) + '</span>' +
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
    table.className = 'db-table';
    var head = document.createElement('thead');
    head.innerHTML = '<tr><th>类型</th><th>标题 / 出处</th><th>内容</th><th>子类</th></tr>';
    var body = document.createElement('tbody');
    list.forEach(function (e) {
      var tr = document.createElement('tr');
      var badge = e.kind === 'quote' ? '摘抄' : e.category;
      tr.innerHTML =
        '<td><span class="badge" style="background:rgba(79,216,224,0.10);color:' +
        (e.kind === 'quote' ? 'var(--amber)' : 'var(--cyan)') +
        ';border:1px solid rgba(148,174,210,0.25);padding:2px 8px;border-radius:999px;font-size:11px">' +
        esc(badge) + '</span></td>' +
        '<td><strong style="color:var(--text-0)">' + esc(e.title) + '</strong></td>' +
        '<td>' + esc(e.text) + '</td>' +
        '<td style="color:var(--text-2);white-space:nowrap">' + esc(e.subCategory || (e.isDialogue ? '对话' : '—')) + '</td>';
      tr.addEventListener('click', function () {
        /* 表格行点击展开：切换内容省略 */
        var td = tr.children[2];
        td.classList.toggle('exp');
        if (td.classList.contains('exp')) {
          td.style.whiteSpace = 'normal';
        } else {
          td.style.whiteSpace = '';
        }
      });
      body.appendChild(tr);
    });
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
      /* 按 / 聚焦搜索 */
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

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 初始化 ---------- */
  function init() {
    collectWiki();
    collectQuotes();
    if (!entries.length) {
      el.empty.hidden = false;
      el.empty.querySelector('p').textContent = '数据加载失败';
      return;
    }
    var cats = categoryStats();
    renderStats(cats);
    renderDonut(cats);
    renderBars(cats);
    renderChips(cats);
    bindSearch();
    bindView();
    renderList();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
