/* ============================================================
   推荐与不推荐板块逻辑 — recommend.js
   依赖：wiki/db/data/recommend.js（window.RECOMMEND_DB）
   职责：记录卡片渲染、按类型筛选、关键词搜索、统计展示
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 数据扁平化 ---------- */
  var records = [];   // {cat, type, name, 主演, 编剧, 导演, 出品公司, 其他片名, UID, reason, date}
  var typeSet = {};

  (window.RECOMMEND_DB || []).forEach(function (board) {
    (board.categories || []).forEach(function (c) {
      (c.items || []).forEach(function (it) {
        var r = {
          cat: c.name,
          type: it['类型'] || '',
          name: it['名称'] || '',
          actors: it['主演'] || '',
          writer: it['编剧'] || '',
          director: it['导演'] || '',
          company: it['出品公司'] || '',
          alias: it['其他片名'] || '',
          uid: it['UID'] || '',
          reason: it['不推荐原因'] || it['推荐理由'] || '',
          date: it['日期'] || ''
        };
        records.push(r);
        if (r.type) typeSet[r.type] = true;
      });
    });
  });

  var state = { query: '', type: '全部' };

  var el = {
    search: document.getElementById('searchInput'),
    chips: document.getElementById('typeChips'),
    grid: document.getElementById('recGrid'),
    empty: document.getElementById('emptyState'),
    statRec: document.getElementById('statRec'),
    statAvoid: document.getElementById('statAvoid'),
    statTotal: document.getElementById('statTotal')
  };

  /* ---------- 统计 ---------- */
  function renderStats() {
    var rec = records.filter(function (r) { return r.cat === '推荐'; }).length;
    var avoid = records.length - rec;
    if (el.statRec) el.statRec.textContent = rec;
    if (el.statAvoid) el.statAvoid.textContent = avoid;
    if (el.statTotal) el.statTotal.textContent = records.length;
  }

  /* ---------- 类型筛选 chips ---------- */
  function renderChips() {
    if (!el.chips) return;
    var types = Object.keys(typeSet).sort();
    var list = ['全部'].concat(types);
    el.chips.innerHTML = '';
    list.forEach(function (t) {
      var btn = document.createElement('button');
      btn.className = 'chip' + (state.type === t ? ' active' : '');
      btn.setAttribute('data-type', t);
      btn.textContent = t;
      btn.addEventListener('click', function () {
        state.type = t;
        renderChips();
        renderList();
      });
      el.chips.appendChild(btn);
    });
  }

  /* ---------- 过滤 ---------- */
  function filtered() {
    var q = state.query.toLowerCase();
    return records.filter(function (r) {
      if (state.type !== '全部' && r.type !== state.type) return false;
      if (!q) return true;
      var hay = (r.cat + ' ' + r.type + ' ' + r.name + ' ' + r.actors + ' ' + r.writer + ' ' +
        r.director + ' ' + r.company + ' ' + r.alias + ' ' + r.uid + ' ' + r.reason + ' ' + r.date).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  /* ---------- 渲染卡片 ---------- */
  function renderList() {
    if (!el.grid) return;
    var list = filtered();
    el.empty.hidden = list.length > 0;
    if (!list.length) {
      el.grid.innerHTML = '';
      return;
    }
    el.grid.innerHTML = '';
    list.forEach(function (r, i) {
      var card = document.createElement('div');
      card.className = 'rec-card';
      card.style.animationDelay = Math.min(i * 0.03, 0.4) + 's';

      var fields = '';
      var pairs = [
        ['主演', r.actors], ['编剧', r.writer], ['导演', r.director],
        ['出品公司', r.company], ['其他片名', r.alias], ['UID', r.uid]
      ];
      pairs.forEach(function (p) {
        if (!p[1]) return;
        fields += '<div class="rec-field"><span class="k">' + esc(p[0]) + '</span><span class="v">' + esc(p[1]) + '</span></div>';
      });

      var reasonHtml = '';
      if (r.cat === '不推荐' && r.reason) {
        reasonHtml = '<div class="rec-reason"><span class="k">不推荐原因</span>' + esc(r.reason) + '</div>';
      } else if (r.reason) {
        reasonHtml = '<div class="rec-reason"><span class="k">推荐理由</span>' + esc(r.reason) + '</div>';
      }

      card.innerHTML =
        '<div class="rec-card-top">' +
        '<span class="rec-name">' + esc(r.name) + '</span>' +
        (r.type ? '<span class="rec-type">' + esc(r.type) + '</span>' : '') +
        '</div>' +
        (fields ? '<div class="rec-fields">' + fields + '</div>' : '') +
        reasonHtml +
        (r.date ? '<div class="rec-date">' + esc(r.date) + '</div>' : '');
      el.grid.appendChild(card);
    });
  }

  /* ---------- 搜索 ---------- */
  function bindSearch() {
    if (!el.search) return;
    el.search.addEventListener('input', function () {
      state.query = el.search.value;
      renderList();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === '/' && document.activeElement !== el.search) {
        ev.preventDefault();
        el.search.focus();
      }
      if (ev.key === 'Escape') el.search.blur();
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    renderStats();
    renderChips();
    renderList();
    bindSearch();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
