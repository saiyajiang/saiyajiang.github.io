/* ============================================================
   推荐与不推荐板块逻辑 — recommend.js
   数据：data/movies.js（window.MOVIE_DB，影视海报墙）
        data/texts.js（window.TEXT_DB，UP主 / 广告媒体文字卡片）
   职责：海报墙卡片 / 文字卡片渲染、类型筛选、关键词搜索、统计展示
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 数据扁平化 ---------- */
  var records = [];   // {kind, type, name, year, genre, episodes, director, actors, intro, poster, uid, reason, date, note}
  var typeSet = {};

  (window.MOVIE_DB || []).forEach(function (m) {
    records.push({
      kind: 'movie',
      type: '电视剧',
      name: m.name || '',
      year: m.year || '',
      genre: m.genre || '',
      episodes: m.episodes || '',
      director: (m.director || []).join('、'),
      actors: (m.actors || []).join('、'),
      intro: m.intro || '',
      poster: m.poster || '',
      uid: '',
      reason: '无逻辑无常识',
      date: m.year ? m.year : '',
      note: m.note || '',
      tvmao_url: m.tvmao_url || ''
    });
  });
  (window.TEXT_DB || []).forEach(function (t) {
    records.push({
      kind: 'text',
      type: t.type || '',
      name: t.name || '',
      year: '',
      genre: '',
      episodes: '',
      director: '',
      actors: '',
      intro: '',
      poster: '',
      uid: t.uid || '',
      reason: t.reason || '',
      date: t.date || '',
      note: '',
      tvmao_url: ''
    });
  });

  records.forEach(function (r) { if (r.type) typeSet[r.type] = true; });

  var state = { query: '', type: '全部' };

  var el = {
    search: document.getElementById('searchInput'),
    chips: document.getElementById('typeChips'),
    grid: document.getElementById('recGrid'),
    empty: document.getElementById('emptyState'),
    statMovie: document.getElementById('statMovie'),
    statText: document.getElementById('statText'),
    statTotal: document.getElementById('statTotal')
  };

  /* ---------- 统计 ---------- */
  function renderStats() {
    var movie = records.filter(function (r) { return r.kind === 'movie'; }).length;
    var text = records.length - movie;
    if (el.statMovie) el.statMovie.textContent = movie;
    if (el.statText) el.statText.textContent = text;
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
      var hay = (r.type + ' ' + r.name + ' ' + r.year + ' ' + r.genre + ' ' + r.episodes + ' ' +
        r.director + ' ' + r.actors + ' ' + r.intro + ' ' + r.uid + ' ' + r.reason + ' ' + r.date + ' ' + r.note).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  /* ---------- 影视海报墙卡片 ---------- */
  function movieCard(r) {
    var card = document.createElement('div');
    card.className = 'movie-card';

    var meta = [];
    if (r.year) meta.push(esc(r.year));
    if (r.genre) meta.push(esc(r.genre));
    if (r.episodes) meta.push(esc(r.episodes) + '集');
    var metaHtml = meta.length ? '<div class="movie-meta">' + meta.join('<span class="dot">·</span>') + '</div>' : '';

    var dirHtml = r.director ? '<div class="movie-line"><span class="k">导演</span>' + esc(r.director) + '</div>' : '';
    var actHtml = r.actors ? '<div class="movie-line"><span class="k">主演</span>' + esc(r.actors) + '</div>' : '';

    var noteHtml = '';
    if (r.note) {
      noteHtml = '<div class="movie-note">' + esc(r.note) + '</div>';
    }

    var introHtml = r.intro ? '<div class="movie-intro">' + esc(r.intro) + '</div>' : '';

    var src = r.poster || '';
    var imgHtml = src
      ? '<img class="movie-poster" src="' + esc(src) + '" alt="' + esc(r.name) + '" loading="lazy" onerror="this.style.visibility=\'hidden\';" />'
      : '<div class="movie-poster movie-poster-empty">' + esc(r.name) + '</div>';

    card.innerHTML =
      '<div class="movie-card-inner">' +
      '<div class="movie-media">' + imgHtml + '</div>' +
      '<div class="movie-body">' +
      '<div class="movie-title">' + esc(r.name) + '</div>' +
      metaHtml +
      dirHtml +
      actHtml +
      noteHtml +
      introHtml +
      '</div>' +
      '</div>';
    return card;
  }

  /* ---------- 文字卡片 ---------- */
  function textCard(r) {
    var card = document.createElement('div');
    card.className = 'rec-card';

    var fields = '';
    if (r.uid) {
      fields += '<div class="rec-field"><span class="k">UID</span><span class="v">' + esc(r.uid) + '</span></div>';
    }
    var reasonHtml = r.reason
      ? '<div class="rec-reason"><span class="k">不推荐原因</span>' + esc(r.reason) + '</div>'
      : '';

    card.innerHTML =
      '<div class="rec-card-top">' +
      '<span class="rec-name">' + esc(r.name) + '</span>' +
      (r.type ? '<span class="rec-type">' + esc(r.type) + '</span>' : '') +
      '</div>' +
      (fields ? '<div class="rec-fields">' + fields + '</div>' : '') +
      reasonHtml +
      (r.date ? '<div class="rec-date">' + esc(r.date) + '</div>' : '');
    return card;
  }

  /* ---------- 渲染列表 ---------- */
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
      var card = r.kind === 'movie' ? movieCard(r) : textCard(r);
      card.style.animationDelay = Math.min(i * 0.02, 0.4) + 's';
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
