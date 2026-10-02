/* ============================================================
   Taiwu 大板块交互逻辑（wiki/taiwu）— 独立渲染脚本
   数据结构：window.TAIWU_BOARDS = [ { id, name, icon, desc, categories: [ { name, items: [...] } ] } ]
   条目结构：{ title, tag, sub, text, sections: [ { k, v } ] }
   仿 db/db.js 的「板块→分类→条目」交互：板块切换/分类筛选/搜索/视图切换/统计
   ============================================================ */
(function () {
  'use strict';

  var PALETTE = [
    '#f2b54c', '#4fd8e0', '#9d8cff', '#6fe3a5',
    '#f27fa0', '#f26d6d', '#7dd3fc', '#fbd38d'
  ];

  var boards = [];
  var entries = [];
  var state = { boardIdx: 0, query: '', category: 'all', view: 'card' };

  var $ = function (sel) { return document.querySelector(sel); };
  var el = {
    search: $('#searchInput'),
    grid: $('#dbGrid'),
    empty: $('#emptyState'),
    chips: $('#categoryChips'),
    dock: $('#dbDock'),
    boardTabs: $('#boardTabs'),
    statBoard: $('#statBoard'),
    statCat: $('#statCat'),
    statItem: $('#statItem'),
    statDesc: $('#statDesc'),
    viewBtns: document.querySelectorAll('.db-viewswitch button')
  };

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return (h >>> 0).toString(36);
  }

  function loadBoards() {
    boards = (window.TAIWU_BOARDS || []).map(function (b) {
      return {
        id: b.id || '',
        name: b.name || '未命名',
        icon: b.icon || (b.name || '?').slice(0, 1),
        desc: b.desc || '',
        categories: (b.categories || []).map(function (c) {
          return { name: c.name || '未分类', items: c.items || [] };
        })
      };
    });
  }

  function flattenBoard(board) {
    entries = [];
    board.categories.forEach(function (cat) {
      cat.items.forEach(function (it) {
        entries.push({
          category: cat.name,
          title: it.title || '',
          tag: it.tag || '',
          sub: it.sub || '',
          text: it.text || '',
          sections: it.sections || [],
          hash: hashStr(board.id + '|' + cat.name + '|' + (it.title || ''))
        });
      });
    });
  }

  function totalOf(b) {
    return b.categories.reduce(function (s, c) { return s + c.items.length; }, 0);
  }

  function categoryStats() {
    var map = {};
    entries.forEach(function (e) {
      if (!map[e.category]) map[e.category] = { name: e.category, id: e.category, count: 0 };
      map[e.category].count++;
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.count - a.count; });
  }

  /* ---------- 统计卡 ---------- */
  function renderStats() {
    var board = boards[state.boardIdx];
    var cats = categoryStats();
    el.statBoard.textContent = boards.length;
    el.statCat.textContent = cats.length;
    el.statItem.textContent = entries.length;
    el.statDesc.textContent = board ? board.name + ' · ' + board.desc : '';
  }

  /* ---------- 板块切换 ---------- */
  function renderBoardTabs() {
    el.boardTabs.innerHTML = '';
    boards.forEach(function (b, i) {
      var tab = document.createElement('button');
      tab.className = 'game-tab' + (i === state.boardIdx ? ' active' : '');
      tab.innerHTML =
        '<span class="game-icon' + (b.icon.length > 1 ? ' wide' : '') + '">' + esc(b.icon) + '</span>' +
        '<span class="game-name">' + esc(b.name) + '</span>' +
        '<span class="game-count">' + totalOf(b) + ' 条</span>';
      tab.addEventListener('click', function () {
        state.boardIdx = i;
        state.category = 'all';
        state.query = '';
        if (el.search) el.search.value = '';
        switchBoard();
      });
      el.boardTabs.appendChild(tab);
    });
  }

  /* ---------- chips 与 dock ---------- */
  function renderChips(cats) {
    var list = [{ name: '全部', id: 'all', count: entries.length }].concat(cats);
    el.chips.innerHTML = '';
    list.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'chip' + (state.category === c.id ? ' active' : '');
      btn.setAttribute('data-cat', c.id);
      btn.innerHTML = esc(c.name) + '<span class="chip-count">' + c.count + '</span>';
      btn.addEventListener('click', function () {
        state.category = c.id;
        renderChips(categoryStats());
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
        renderChips(categoryStats());
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

  /* ---------- 筛选 ---------- */
  function filtered() {
    var q = state.query.trim().toLowerCase();
    return entries.filter(function (e) {
      if (state.category !== 'all' && e.category !== state.category) return false;
      if (!q) return true;
      var hay = e.title + ' ' + e.tag + ' ' + e.sub + ' ' + e.text +
        e.sections.map(function (s) { return s.k + ' ' + s.v; }).join(' ');
      return hay.toLowerCase().indexOf(q) !== -1;
    });
  }

  /* ---------- 渲染：主列表 ---------- */
  function renderList() {
    var list = filtered();
    el.grid.className = 'db-grid' + (state.view === 'table' ? ' table-view' : '');
    el.empty.hidden = list.length > 0;
    if (!list.length) { el.grid.innerHTML = ''; return; }
    if (state.view === 'table') { renderTable(list); } else { renderCards(list); }
  }

  function renderCards(list) {
    el.grid.innerHTML = '';
    list.forEach(function (e, i) {
      var card = document.createElement('div');
      card.className = 'db-card taiwu-card';
      card.style.animationDelay = Math.min(i * 0.03, 0.4) + 's';
      var badge = '<span class="badge" style="background:rgba(79,216,224,0.12);color:var(--cyan);border:1px solid rgba(79,216,224,0.35)">' + esc(e.category) + '</span>';
      var sub = e.sub ? '<div class="tf-sub">' + esc(e.sub) + '</div>' : '';
      var sections = e.sections.length
        ? '<div class="tf-sections">' + e.sections.map(function (s) {
            return '<div class="tf-field"><div class="tf-key">' + esc(s.k) + '</div><div class="tf-val">' + s.v + '</div></div>';
          }).join('') + '</div>'
        : '';
      card.innerHTML =
        '<div class="db-card-top">' + badge +
        '<span class="db-title" title="' + esc(e.title) + '">' + esc(e.title) + '</span>' +
        '<span class="expand-icon">▾</span></div>' +
        sub +
        '<div class="db-excerpt">' + e.text + '</div>' +
        sections +
        '<div class="db-meta">' +
          '<span>' + esc(e.tag) + '</span>' +
          '<span>#' + e.hash + '</span>' +
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
    var body = document.createElement('tbody');
    head.innerHTML = '<tr><th>分类</th><th>标题</th><th>立场 / 前传</th><th>概述</th></tr>';
    list.forEach(function (e) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="badge" style="background:rgba(79,216,224,0.10);color:var(--cyan);border:1px solid rgba(148,174,210,0.25);padding:2px 8px;border-radius:999px;font-size:11px">' +
        esc(e.category) + '</span></td>' +
        '<td><strong style="color:var(--text-0)">' + esc(e.title) + '</strong></td>' +
        '<td style="color:var(--text-2)">' + esc(e.tag) + (e.sub ? ' · ' + esc(e.sub) : '') + '</td>' +
        '<td>' + e.text + '</td>';
      tr.addEventListener('click', function () {
        var td = tr.children[3];
        td.classList.toggle('exp');
        td.style.whiteSpace = td.classList.contains('exp') ? 'normal' : '';
      });
      body.appendChild(tr);
    });
    table.appendChild(head);
    table.appendChild(body);
    el.grid.appendChild(table);
  }

  /* ---------- 搜索 / 视图 ---------- */
  function bindSearch() {
    if (!el.search) return;
    el.search.addEventListener('input', function () {
      state.query = el.search.value;
      renderList();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === '/' && document.activeElement !== el.search) {
        ev.preventDefault();
        if (el.search) el.search.focus();
      }
      if (ev.key === 'Escape' && el.search) el.search.blur();
    });
  }

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

  /* ---------- 切换板块 ---------- */
  function switchBoard() {
    if (!boards.length) {
      el.boardTabs.innerHTML = '';
      el.empty.hidden = false;
      el.grid.innerHTML = '';
      el.chips.innerHTML = '';
      el.dock.innerHTML = '';
      el.statBoard.textContent = '0';
      el.statCat.textContent = '0';
      el.statItem.textContent = '0';
      el.statDesc.textContent = '';
      return;
    }
    renderBoardTabs();
    var board = boards[state.boardIdx];
    flattenBoard(board);
    var cats = categoryStats();
    renderStats();
    renderChips(cats);
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
    loadBoards();
    bindSearch();
    bindView();
    switchBoard();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
