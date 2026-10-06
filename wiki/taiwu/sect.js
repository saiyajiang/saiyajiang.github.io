/* ============================================================
   Taiwu 词条详情页（wiki/taiwu/sect.html?id=xxx）
   读取 window.TAIWU_BOARDS，按与 taiwu.js 相同 hash 算法定位词条，
   渲染：面包屑 + 标题区 + 右侧 infobox + 左侧章节正文 + 页内目录 TOC + 上下条导航。
   ============================================================ */
(function () {
  'use strict';

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return (h >>> 0).toString(36);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // 展平全部板块 -> 词条列表（顺序与列表页一致）
  function flattenAll() {
    var out = [];
    (window.TAIWU_BOARDS || []).forEach(function (b) {
      (b.categories || []).forEach(function (cat) {
        (cat.items || []).forEach(function (it) {
          out.push({
            category: cat.name,
            title: it.title || '',
            tag: it.tag || '',
            sub: it.sub || '',
            text: it.text || '',
            sections: it.sections || [],
            hash: hashStr(b.id + '|' + cat.name + '|' + (it.title || ''))
          });
        });
      });
    });
    return out;
  }

  var $ = function (sel) { return document.querySelector(sel); };
  var el = {
    crumb: $('#crumbSect'),
    badge: $('#sectBadge'),
    title: $('#sectTitle'),
    sub: $('#sectSub'),
    infobox: $('#sectInfobox'),
    body: $('#sectBody'),
    tocWrap: $('#sectTocWrap'),
    toc: $('#sectToc'),
    missing: $('#sectMissing'),
    pager: $('#sectPager')
  };

  function renderEntry(entry) {
    document.title = entry.title + ' · 太吾绘卷 · 悲歌';
    el.crumb.textContent = entry.title;
    el.badge.textContent = entry.category;
    el.title.textContent = entry.title;
    el.sub.textContent = entry.tag + (entry.sub ? ' · ' + entry.sub : '');

    /* ---- infobox ---- */
    var rows = [
      { k: 'ID', v: entry.hash },
      { k: '名称', v: entry.title },
      { k: '立场', v: entry.tag },
      { k: '前传概述', v: entry.sub },
      { k: '概述', v: entry.text },
      { k: '分类', v: entry.category }
    ].filter(function (r) { return r.v; }).map(function (r) {
      return '<div class="infobox-row"><div class="infobox-key">' + esc(r.k) + '</div>' +
        '<div class="infobox-val">' + esc(r.v) + '</div></div>';
    }).join('');
    el.infobox.innerHTML = rows || '<div class="infobox-row"><div class="infobox-key">暂无资料</div><div class="infobox-val">—</div></div>';

    /* ---- 页内目录 + 章节正文 ---- */
    if (entry.sections.length) {
      el.tocWrap.hidden = false;
      el.toc.innerHTML = entry.sections.map(function (s, i) {
        return '<li><a href="#sec-' + i + '">' + esc(s.k) + '</a></li>';
      }).join('');
      el.body.innerHTML = entry.sections.map(function (s, i) {
        return '<section class="tf-chapter" id="sec-' + i + '">' +
          '<h2 class="tf-chapter-title">' + esc(s.k) + '</h2>' +
          '<div class="tf-chapter-body">' + s.v + '</div>' +
        '</section>';
      }).join('');
    } else {
      el.body.innerHTML = '<section class="tf-chapter"><div class="tf-chapter-body">' + (entry.text || '暂无正文') + '</div></section>';
    }

    bindToc();
  }

  /* ---- 滚动高亮 TOC ---- */
  function bindToc() {
    var links = Array.prototype.slice.call(el.toc.querySelectorAll('a'));
    if (!links.length) return;
    var sections = Array.prototype.slice.call(el.body.querySelectorAll('.tf-chapter'));
    function onScroll() {
      var idx = -1;
      var top = window.pageYOffset + 90;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= top) idx = i;
      }
      links.forEach(function (a, i) {
        a.classList.toggle('active', i === idx);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- 上一条 / 下一条 ---- */
  function renderPager(entries, idx) {
    if (entries.length < 2) { el.pager.hidden = true; return; }
    el.pager.hidden = false;
    var prev = entries[(idx - 1 + entries.length) % entries.length];
    var next = entries[(idx + 1) % entries.length];
    el.pager.innerHTML =
      '<a class="sect-pager-btn prev" href="sect.html?id=' + prev.hash + '">' +
        '<span>← 上一条</span><b>' + esc(prev.title) + '</b></a>' +
      '<a class="sect-pager-btn next" href="sect.html?id=' + next.hash + '">' +
        '<span>下一条 →</span><b>' + esc(next.title) + '</b></a>';
  }

  /* ---- 初始化 ---- */
  function init() {
    var id = new URLSearchParams(window.location.search).get('id');
    var entries = flattenAll();
    if (!id) { showMissing(); return; }
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].hash === id) {
        renderEntry(entries[i]);
        renderPager(entries, i);
        return;
      }
    }
    showMissing();
  }

  function showMissing() {
    el.missing.hidden = false;
    el.body.innerHTML = '';
    el.tocWrap.hidden = true;
    el.pager.hidden = true;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
