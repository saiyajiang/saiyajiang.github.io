/* ============================================================
   词条图谱词条详情页逻辑 — entry.js
   依赖：wiki/db/data/knowledge.js（window.WIKI_DATA）
   职责：entry.html?t=<词条名> 语义化 URL 定位词条；
         渲染「← 返回」、板块分类、词条正文、「相关词条」区块
         （可点击跳转，跨板块带标记）
   ============================================================ */
(function () {
  'use strict';

  var BOARD_TITLES = {};

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- 词条解析（与 graph.js / db.js 同款算法） ---------- */
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
  var entries = [];

  wiki.forEach(function (sec) {
    BOARD_TITLES[sec.id] = sec.title || sec.id;
    (sec.items || []).forEach(function (it) {
      var text = it.text || '';
      entries.push({
        boardId: sec.id,
        subCategory: it.subCategory || '',
        name: extractName(text) || text.slice(0, 12),
        core: coreNameOf(extractName(text) || text.slice(0, 12)),
        text: text,
        links: it.links || []
      });
    });
  });

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

  /* ---------- 渲染 ---------- */
  function renderMissing() {
    var root = document.getElementById('entryRoot');
    root.innerHTML =
      '<div class="entry-missing">' +
      '<div class="wiki-empty-icon">∅</div>' +
      '<p>未找到该词条</p>' +
      '<span>请返回词条图谱重新选择节点</span><br /><br />' +
      '<a class="entry-back" href="index.html">← 返回图谱</a>' +
      '</div>';
    document.title = '未找到词条 · 词条图谱 · Wiki · 悲歌';
  }

  function render(entry, term) {
    var root = document.getElementById('entryRoot');
    var crumb = document.getElementById('crumbTerm');
    if (crumb) crumb.textContent = entry.name;
    document.title = entry.name + ' · ' + BOARD_TITLES[entry.boardId] + ' · 词条图谱 · Wiki · 悲歌';

    var related = resolveRelated(entry);
    var relatedHtml = '';
    if (related.length) {
      relatedHtml =
        '<div class="entry-related">' +
        '<div class="entry-related-head">相关词条 <em>RELATED</em></div>' +
        '<div class="entry-related-list">' +
        related.map(function (r) {
          var cross = r.boardId !== entry.boardId
            ? '<span class="entry-related-cross" title="跨板块 · ' + esc(BOARD_TITLES[r.boardId]) + '">↗</span>'
            : '';
          return '<a class="entry-related-item" href="entry.html?t=' + encodeURIComponent(r.name) + '">' +
            '<span class="entry-related-name">' + esc(r.name) + '</span>' + cross +
            '</a>';
        }).join('') +
        '</div></div>';
    } else {
      relatedHtml =
        '<div class="entry-related">' +
        '<div class="entry-related-head">相关词条 <em>RELATED</em></div>' +
        '<p class="entry-sub" style="margin-top:8px">暂无显式关联，可在图谱中查看其位置。</p>' +
        '</div>';
    }

    var sub = entry.subCategory
      ? '<div class="entry-sub">' + esc(entry.subCategory) + '</div>'
      : '<div class="entry-sub">' + esc(BOARD_TITLES[entry.boardId]) + ' · 条目</div>';

    root.innerHTML =
      '<a class="entry-back" href="javascript:history.back()">← 返回</a>' +
      '<div class="entry-head" style="margin-top:16px">' +
      '<span class="entry-board" style="border-color:rgba(var(--wiki-accent-rgb),0.45);color:var(--wiki-accent)">' +
      esc(BOARD_TITLES[entry.boardId]) + '</span>' +
      '<h1 class="entry-title">' + esc(entry.name) + '</h1>' +
      '</div>' +
      sub +
      '<div class="entry-text">' + esc(entry.text) + '</div>' +
      relatedHtml;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    var params = new URLSearchParams(window.location.search);
    var term = (params.get('t') || '').trim();
    if (!term) { renderMissing(); return; }
    var found = null;
    entries.forEach(function (e) {
      if (!found && (e.name === term || nameMatches(e.name, term))) found = e;
    });
    if (!found) { renderMissing(); return; }
    render(found, term);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
