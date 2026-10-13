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

  // 词条 → 所属主题归属（与 graph.js 同款算法）：
  //  ① 先收集精确命中主题（词条名 === 成员名，或去英文核心名相等）
  //  ② 若存在精确命中 → 只返回精确命中的主题（避免包含误连，如「铜过量与精神疾病」不再因含「疾病」二字连取名礼俗）
  //  ③ 若完全无精确命中（典型为 phrases 长句条目）→ 退回宽松 nameMatches 兜底，保证长句能归入对应作品主题
  function themesOf(e) {
    var themes = window.WIKI_THEMES || [];
    var exact = [];
    var ecore = coreNameOf(e.name);
    themes.forEach(function (th) {
      var hit = (th.members || []).some(function (m) {
        return m && (e.name === m || (ecore && coreNameOf(m) && ecore === coreNameOf(m)));
      });
      if (hit) exact.push(th);
    });
    if (exact.length) return exact;
    var out = [];
    themes.forEach(function (th) {
      var hit = (th.members || []).some(function (m) { return nameMatches(e.name, m); });
      if (hit) out.push(th);
    });
    return out;
  }

  function resolveThemes(e) {
    return themesOf(e);
  }

  // 同主题其它词条（不含当前词条）
  function themeSiblings(e, theme) {
    var list = [];
    entries.forEach(function (t) {
      if (t === e) return;
      if (themesOf(t).some(function (x) { return x.name === theme.name; })) list.push(t);
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

    var themes = resolveThemes(entry);
    var relatedHtml = '';
    if (themes.length) {
      relatedHtml =
        '<div class="entry-related">' +
        '<div class="entry-related-head">所属主题 <em>THEMES</em></div>' +
        '<div class="entry-related-list">' +
        themes.map(function (th) {
          var siblings = themeSiblings(entry, th);
          var sibHtml = siblings.length
            ? siblings.map(function (r) {
                var cross = r.boardId !== entry.boardId
                  ? '<span class="entry-related-cross" title="跨板块 · ' + esc(BOARD_TITLES[r.boardId]) + '">↗</span>'
                  : '';
                return '<a class="entry-related-item" href="entry.html?t=' + encodeURIComponent(r.name) + '">' +
                  '<span class="entry-related-name">' + esc(r.name) + '</span>' + cross +
                  '</a>';
              }).join('')
            : '<span class="entry-sub" style="margin-top:4px">该主题暂无其它成员词条。</span>';
          return '<div class="entry-theme-block">' +
            '<a class="entry-theme-tag" href="index.html" title="在图谱中查看 ' + esc(th.name) + ' 主题">' +
            esc(th.name) + '</a>' +
            '<span class="entry-theme-desc">' + esc(th.desc || '') + '</span>' +
            '<div class="entry-related-subs">' + sibHtml + '</div>' +
            '</div>';
        }).join('') +
        '</div></div>';
    } else {
      relatedHtml =
        '<div class="entry-related">' +
        '<div class="entry-related-head">所属主题 <em>THEMES</em></div>' +
        '<p class="entry-sub" style="margin-top:8px">暂无主题归属，可在图谱中查看其位置。</p>' +
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
