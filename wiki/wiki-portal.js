/* ============================================================
   Wiki 门户首页逻辑 — wiki-portal.js
   依赖：taiwu/data/taiwu-core.js + sects.js（TAIWU_BOARDS）、
         db/data/recommend.js（RECOMMEND_DB）、
         db/data/knowledge.js（WIKI_DATA）
   职责：板块徽标统计、站内大搜索（太吾词条直达 / 图谱词条直达 /
         推荐记录跳板块页 / 板块跳转）
   ============================================================ */
(function () {
  'use strict';

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return (h >>> 0).toString(36);
  }

  function extractName(text) {
    var i = String(text).indexOf(' — ');
    return i > 0 ? String(text).slice(0, i).trim() : '';
  }

  /* ---------- 数据收集 ---------- */
  var taiwuBoard = (window.TAIWU_BOARDS || [])[0] || null;
  var taiwuEntries = [];
  if (taiwuBoard) {
    (taiwuBoard.categories || []).forEach(function (c) {
      (c.items || []).forEach(function (it) {
        taiwuEntries.push({
          cat: c.name,
          title: it.title || '',
          tag: it.tag || '',
          sub: it.sub || '',
          text: it.text || '',
          sections: it.sections || [],
          hash: hashStr(taiwuBoard.id + '|' + c.name + '|' + (it.title || ''))
        });
      });
    });
  }

  var recBoard = (window.RECOMMEND_DB || [])[0] || null;
  var dbRecords = [];
  if (recBoard) {
    (recBoard.categories || []).forEach(function (c) {
      (c.items || []).forEach(function (it) {
        dbRecords.push({
          cat: c.name,
          name: it['名称'] || '',
          reason: it['不推荐原因'] || it['推荐理由'] || ''
        });
      });
    });
  }

  var graphEntries = [];
  (window.WIKI_DATA || []).forEach(function (sec) {
    (sec.items || []).forEach(function (it) {
      var text = it.text || '';
      graphEntries.push({
        board: sec.title || sec.id,
        name: extractName(text) || text.slice(0, 12),
        text: text
      });
    });
  });

  var blocks = [
    { key: '太吾', name: '太吾绘卷', url: 'taiwu/index.html' },
    { key: '鸣潮', name: '鸣潮', url: 'mingchao/index.html' },
    { key: '数据库', name: '数据库', url: 'db/index.html' },
    { key: '图谱', name: '词条图谱', url: 'graph/index.html' },
    { key: '推荐', name: '推荐与不推荐', url: 'recommend/index.html' }
  ];

  /* ---------- 徽标统计 ---------- */
  function renderBadges() {
    var taiwuCount = taiwuEntries.length;
    var dbCount = dbRecords.length;
    var graphCount = graphEntries.length;
    document.querySelectorAll('[data-count]').forEach(function (node) {
      var key = node.getAttribute('data-count');
      var n = key === 'taiwu' ? taiwuCount
        : key === 'db' ? dbCount
          : key === 'graph' ? graphCount
            : key === 'recommend' ? dbCount
              : 0;
      node.textContent = n + ' 条';
    });
    var statItem = document.getElementById('portalStatTaiwu');
    if (statItem) statItem.textContent = taiwuCount;
    var statDb = document.getElementById('portalStatDb');
    if (statDb) statDb.textContent = dbCount;
    var statGraph = document.getElementById('portalStatGraph');
    if (statGraph) statGraph.textContent = graphCount;
  }

  /* ---------- 站内搜索 ---------- */
  function matchAll(q) {
    var out = { blocks: [], taiwu: [], graph: [], db: [] };
    blocks.forEach(function (b) {
      if (b.name.indexOf(q) !== -1 || b.key.indexOf(q) !== -1) out.blocks.push(b);
    });
    taiwuEntries.forEach(function (e) {
      var hay = (e.title + ' ' + e.tag + ' ' + e.sub + ' ' + e.text +
        e.sections.map(function (s) { return s.k + ' ' + s.v; }).join(' ')).toLowerCase();
      if (hay.indexOf(q) !== -1) out.taiwu.push(e);
    });
    graphEntries.forEach(function (e) {
      var hay = (e.name + ' ' + e.board + ' ' + e.text).toLowerCase();
      if (hay.indexOf(q) !== -1) out.graph.push(e);
    });
    dbRecords.forEach(function (r) {
      if ((r.name + ' ' + r.reason + ' ' + r.cat).toLowerCase().indexOf(q) !== -1) out.db.push(r);
    });
    return out;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderSuggest(panel, out) {
    panel.innerHTML = '';
    var list = [];
    if (out.blocks.length) {
      list.push({ group: '板块', html: out.blocks.map(function (b) {
        return '<a href="' + b.url + '"><span class="sg-cat">板块</span>' + esc(b.name) + '<span class="sg-desc">进入板块列表页</span></a>';
      }).join('') });
    }
    if (out.taiwu.length) {
      list.push({ group: '太吾 · 门派剧情', html: out.taiwu.slice(0, 5).map(function (e) {
        return '<a href="taiwu/sect.html?id=' + e.hash + '"><span class="sg-cat">' + esc(e.cat) + '</span>' + esc(e.title) +
          '<span class="sg-desc">' + esc(e.sub || e.text || '') + '</span></a>';
      }).join('') });
    }
    if (out.graph.length) {
      list.push({ group: '词条图谱 · 词条', html: out.graph.slice(0, 5).map(function (e) {
        return '<a href="graph/entry.html?t=' + encodeURIComponent(e.name) + '"><span class="sg-cat">' + esc(e.board) + '</span>' + esc(e.name) +
          '<span class="sg-desc">' + esc(e.text.slice(0, 40)) + '</span></a>';
      }).join('') });
    }
    if (out.db.length) {
      list.push({ group: '推荐与不推荐 · 记录', html: out.db.slice(0, 4).map(function (r) {
        return '<a href="recommend/index.html"><span class="sg-cat">' + esc(r.cat) + '</span>' + esc(r.name) +
          '<span class="sg-desc">' + esc(r.reason || '') + '</span></a>';
      }).join('') });
    }
    if (!list.length) {
      panel.innerHTML = '<div class="suggest-empty">无匹配结果 — 回车前往太吾列表页搜索</div>';
      panel.hidden = false;
      return;
    }
    list.forEach(function (g) {
      var div = document.createElement('div');
      div.innerHTML = '<div class="suggest-group">' + esc(g.group) + '</div>' + g.html;
      panel.appendChild(div);
    });
    panel.hidden = false;
  }

  function goFirst(out) {
    if (out.blocks.length) { window.location.href = out.blocks[0].url; return; }
    if (out.taiwu.length) { window.location.href = 'taiwu/sect.html?id=' + out.taiwu[0].hash; return; }
    if (out.graph.length) { window.location.href = 'graph/entry.html?t=' + encodeURIComponent(out.graph[0].name); return; }
    if (out.db.length) { window.location.href = 'recommend/index.html'; return; }
    var q = input.value.trim();
    window.location.href = 'taiwu/index.html?q=' + encodeURIComponent(q);
  }

  var input = null;
  var panel = null;
  var timer = null;

  function bindSearch() {
    input = document.getElementById('homeSearch');
    panel = document.getElementById('searchSuggest');
    if (!input || !panel) return;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      var q = input.value.trim().toLowerCase();
      if (!q) { panel.hidden = true; panel.innerHTML = ''; return; }
      timer = setTimeout(function () {
        renderSuggest(panel, matchAll(q));
      }, 120);
    });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        var q = input.value.trim().toLowerCase();
        if (!q) return;
        clearTimeout(timer);
        goFirst(matchAll(q));
      }
      if (ev.key === 'Escape') { panel.hidden = true; input.blur(); }
    });
    document.addEventListener('click', function (ev) {
      if (!panel.contains(ev.target) && ev.target !== input) panel.hidden = true;
    });
    var btn = document.getElementById('homeSearchBtn');
    if (btn) {
      btn.addEventListener('click', function () {
        var q = input.value.trim().toLowerCase();
        if (!q) return;
        goFirst(matchAll(q));
      });
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    renderBadges();
    bindSearch();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
