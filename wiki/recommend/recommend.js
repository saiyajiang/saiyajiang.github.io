/* ============================================================
   推荐与不推荐板块逻辑 — recommend.js
   数据：data/movies.js（window.MOVIE_DB，影视海报墙）
        data/texts.js（window.TEXT_DB，UP主 / 广告媒体文字卡片）
   职责：推荐 / 不推荐分区渲染、卡片详情弹层、类型筛选、
         关键词搜索、统计展示
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 数据扁平化 ---------- */
  var records = [];   // {kind, category, type, name, year, genre, episodes, director, actors, intro, poster, uid, reason, date, note, tvmao_url}
  var typeSet = {};

  (window.MOVIE_DB || []).forEach(function (m) {
    records.push({
      kind: 'movie',
      category: m.category || '不推荐',
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
      reason: m.reason || '无逻辑无常识',
      date: m.year ? m.year : '',
      note: m.note || '',
      tvmao_url: m.tvmao_url || ''
    });
  });
  (window.TEXT_DB || []).forEach(function (t) {
    records.push({
      kind: 'text',
      category: t.category || '不推荐',
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
    recGrid: document.getElementById('recGrid'),
    notRecGrid: document.getElementById('notRecGrid'),
    recEmpty: document.getElementById('recEmpty'),
    notRecEmpty: document.getElementById('notRecEmpty'),
    recCount: document.getElementById('recCount'),
    notRecCount: document.getElementById('notRecCount'),
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
  function filtered(category) {
    var q = state.query.toLowerCase();
    return records.filter(function (r) {
      if (r.category !== category) return false;
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

    var reasonHtml = r.reason
      ? '<div class="movie-reason"><span class="k">不推荐原因</span>' + esc(r.reason) + '</div>'
      : '';

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
      reasonHtml +
      dirHtml +
      actHtml +
      noteHtml +
      introHtml +
      '</div>' +
      '</div>';
    card.addEventListener('click', function () { openModal(r); });
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
    card.addEventListener('click', function () { openModal(r); });
    return card;
  }

  /* ---------- 分区渲染 ---------- */
  function renderSection(category, gridEl, emptyEl, countEl, cardFactory) {
    var list = filtered(category);
    var has = list.length > 0;
    if (emptyEl) emptyEl.hidden = has;
    if (countEl) countEl.textContent = list.length;
    if (!gridEl) return;
    gridEl.innerHTML = '';
    list.forEach(function (r, i) {
      var card = cardFactory(r);
      card.style.animationDelay = Math.min(i * 0.02, 0.4) + 's';
      gridEl.appendChild(card);
    });
  }

  function renderList() {
    renderSection('推荐', el.recGrid, el.recEmpty, el.recCount, function (r) {
      return r.kind === 'movie' ? movieCard(r) : textCard(r);
    });
    renderSection('不推荐', el.notRecGrid, el.notRecEmpty, el.notRecCount, function (r) {
      return r.kind === 'movie' ? movieCard(r) : textCard(r);
    });
  }

  /* ---------- 详情弹层 ---------- */
  var modal = null;
  var modalMask = null;

  function ensureModal() {
    if (modalMask) return;
    modalMask = document.createElement('div');
    modalMask.className = 'rec-modal-mask';
    modalMask.hidden = true;
    modalMask.addEventListener('click', function (ev) {
      if (ev.target === modalMask) closeModal();
    });
    modal = document.createElement('div');
    modal.className = 'rec-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    var closeBtn = document.createElement('button');
    closeBtn.className = 'rec-modal-close';
    closeBtn.setAttribute('aria-label', '关闭');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeModal);
    modal.appendChild(closeBtn);
    modalMask.appendChild(modal);
    document.body.appendChild(modalMask);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modalMask.hidden) closeModal();
    });
  }

  function row(k, v) {
    return '<div class="rec-modal-row"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>';
  }

  function openModal(r) {
    ensureModal();
    var body = document.createElement('div');
    body.className = 'rec-modal-body';
    var headHtml =
      '<div class="rec-modal-head">' +
      '<h3 class="rec-modal-title">' + esc(r.name) + '</h3>' +
      (r.type ? '<span class="rec-type">' + esc(r.type) + '</span>' : '') +
      '</div>';
    var reasonHtml = r.reason
      ? '<div class="rec-modal-reason"><span class="k">不推荐原因</span><span class="v">' + esc(r.reason) + '</span></div>'
      : '';
    if (r.kind === 'movie') {
      var posterHtml = r.poster
        ? '<div class="rec-modal-media"><img class="rec-modal-poster" src="' + esc(r.poster) + '" alt="' + esc(r.name) + '" onerror="this.style.visibility=\'hidden\';" /></div>'
        : '';
      var rows = '';
      if (r.year) rows += row('年份', r.year);
      if (r.genre) rows += row('类型', r.genre);
      if (r.episodes) rows += row('集数', String(r.episodes) + ' 集');
      if (r.director) rows += row('导演', r.director);
      if (r.actors) rows += row('主演', r.actors);
      if (r.intro) rows += row('剧情简介', r.intro);
      var linkHtml = r.tvmao_url
        ? '<a class="rec-modal-link" href="' + esc(r.tvmao_url) + '" target="_blank" rel="noopener">电视猫详情 ↗</a>'
        : '';
      body.innerHTML = headHtml +
        '<div class="rec-modal-content">' +
        posterHtml +
        '<div class="rec-modal-info">' + rows + reasonHtml + linkHtml + '</div>' +
        '</div>';
    } else {
      var rows2 = '';
      if (r.type) rows2 += row('类型', r.type);
      if (r.name) rows2 += row('名称', r.name);
      if (r.uid) rows2 += row('UID', r.uid);
      if (r.date) rows2 += row('日期', r.date);
      body.innerHTML = headHtml +
        '<div class="rec-modal-content">' +
        '<div class="rec-modal-info">' + rows2 + reasonHtml + '</div>' +
        '</div>';
    }
    var oldBody = modal.querySelector('.rec-modal-body');
    if (oldBody) modal.removeChild(oldBody);
    modal.appendChild(body);
    modalMask.hidden = false;
    document.body.classList.add('rec-modal-open');
  }

  function closeModal() {
    if (!modalMask) return;
    modalMask.hidden = true;
    document.body.classList.remove('rec-modal-open');
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
      if (ev.key === 'Escape' && (!modalMask || modalMask.hidden)) {
        el.search.blur();
      }
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
