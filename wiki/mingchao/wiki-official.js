/* ============================================================
   鸣潮 · Wiki 全量收录分类浏览页脚本（wiki-official.js）
   按顶层分类加载 data/*.json，按子分类分组渲染词条列表；
   词条链接进入 wiki-detail.html?cat=..&id=..
   依赖：data/wiki-meta.js（window.WIKI_META）
   ============================================================ */
(function () {
  'use strict';

  var META = window.WIKI_META || [];
  var CATS = {};
  META.forEach(function (m) { CATS[m.key] = m; });

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtChars(n) {
    if (n >= 10000) return (n / 10000).toFixed(1) + ' 万';
    return String(n);
  }

  // ---- 渲染顶层分类导航 ----
  var nav = document.getElementById('woCatNav');
  if (nav) {
    nav.innerHTML = META.map(function (m) {
      return '<button class="chip" data-key="' + m.key + '">' + esc(m.name) +
        '<span class="wo-nav-count">' + m.count + '</span></button>';
    }).join('');
  }

  var params = new URLSearchParams(location.search);
  var catKey = params.get('cat') || 'tujian';
  var cur = CATS[catKey] || CATS['tujian'];

  var title = document.getElementById('woTitle');
  var count = document.getElementById('woCount');
  var subCount = document.getElementById('woSubCount');
  var chars = document.getElementById('woChars');
  var crumb = document.getElementById('crumbCat');
  var list = document.getElementById('woList');

  function markActive() {
    var chips = nav ? nav.querySelectorAll('.chip') : [];
    chips.forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-key') === cur.key);
    });
  }
  if (nav) {
    nav.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (chip) location.href = 'wiki-official.html?cat=' + chip.getAttribute('data-key');
    });
  }

  function renderNotFound() {
    list.innerHTML = '<div class="mc-placeholder"><div class="mc-placeholder-icon">◈</div>' +
      '<p class="mc-placeholder-title">数据加载失败</p>' +
      '<p class="mc-placeholder-desc">请确认在 HTTP 环境访问（如 GitHub Pages / 本地静态服务器）。<br/>直接以 file:// 打开时浏览器会拦截 JSON 请求。</p></div>';
  }

  // 成就游戏内分类层级（索拉漫行 / 长路留迹 / 铿锵刃鸣 / 诸音声轨）
  var ACH_CATS = ['索拉漫行', '长路留迹', '铿锵刃鸣', '诸音声轨'];
  var achAllItems = [];
  var achActiveCat = '';
  var achActiveColl = '';

  // 该大类下合集（子分类）去重列表，保持出现顺序
  function achCollsOf(cat) {
    var seen = {}, out = [];
    achAllItems.forEach(function (it) {
      if (it['大类'] !== cat) return;
      var c = it['合集'];
      if (c && !seen[c]) { seen[c] = 1; out.push(c); }
    });
    return out;
  }

  // 成就分类：每条成就一张卡片（大类/版本/合集/描述摘要），顶部提供游戏内大类 + 合集二级筛选
  function renderAchievementCards(items, filterCat, filterColl) {
    if (filterCat) {
      items = items.filter(function (it) { return it['大类'] === filterCat; });
    }
    if (filterColl) {
      items = items.filter(function (it) { return it['合集'] === filterColl; });
    }
    var html = '<div class="wo-ach-filter">' +
      '<button class="wo-ach-chip' + (!filterCat ? ' active' : '') + '" data-cat="">全部</button>' +
      ACH_CATS.map(function (c) {
        return '<button class="wo-ach-chip' + (filterCat === c ? ' active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('') +
      '</div>';
    if (filterCat) {
      var colls = achCollsOf(filterCat);
      if (colls.length) {
        html += '<div class="wo-ach-filter wo-ach-filter-sub">' +
          '<button class="wo-ach-chip' + (!filterColl ? ' active' : '') + '" data-coll="">全部合集</button>' +
          colls.map(function (c) {
            return '<button class="wo-ach-chip' + (filterColl === c ? ' active' : '') + '" data-coll="' + esc(c) + '">' + esc(c) + '</button>';
          }).join('') +
          '</div>';
      }
    }
    html += '<div class="wo-card-grid">' + items.map(function (it) {
      var cat = it['大类'];
      var v = it['版本'];
      var hz = it['合集'];
      var desc = it['正文文字'] || '';
      if (desc.length > 46) desc = desc.slice(0, 46) + '…';
      var badges = '';
      if (cat) badges += '<span class="wo-card-badge wo-card-cat">' + esc(String(cat)) + '</span>';
      if (v) badges += '<span class="wo-card-badge">' + esc(String(v)) + '</span>';
      if (hz) badges += '<span class="wo-card-badge wo-card-coll">' + esc(String(hz)) + '</span>';
      return '<a class="wo-card" href="wiki-detail.html?cat=' + encodeURIComponent(cur.key) +
        '&id=' + encodeURIComponent(it['词条id']) + '">' +
        '<span class="wo-card-title">' + esc(it['标题'] || '（无标题）') + '</span>' +
        '<span class="wo-card-badges">' + badges + '</span>' +
        '<span class="wo-card-desc">' + esc(desc) + '</span>' +
        '</a>';
    }).join('') + '</div>';
    return html;
  }

  function renderAchStats(filterCat, filterColl) {
    var shown = achAllItems.filter(function (it) {
      if (filterCat && it['大类'] !== filterCat) return false;
      if (filterColl && it['合集'] !== filterColl) return false;
      return true;
    });
    if (count) count.textContent = shown.length;
    if (subCount) {
      if (!filterCat) subCount.textContent = ACH_CATS.length;
      else if (filterColl) subCount.textContent = 1;
      else subCount.textContent = achCollsOf(filterCat).length;
    }
    var totalChars = shown.reduce(function (n, it) { return n + (it['字符数'] || 0); }, 0);
    if (chars) chars.textContent = fmtChars(totalChars);
  }

  function render(items) {
    if (!items || !items.length) {
      list.innerHTML = '<p class="wiki-desc">该分类暂无正文词条。</p>';
      return;
    }
    if (cur.key === 'chengjiu') {
      achAllItems = items;
      achActiveCat = '';
      achActiveColl = '';
      list.innerHTML = renderAchievementCards(items, '', '');
      renderAchStats('', '');
      list.addEventListener('click', function (e) {
        var chip = e.target.closest('.wo-ach-chip');
        if (!chip) return;
        if (chip.hasAttribute('data-cat')) {
          achActiveCat = chip.getAttribute('data-cat');
          achActiveColl = '';
        } else if (chip.hasAttribute('data-coll')) {
          achActiveColl = chip.getAttribute('data-coll') || '';
        }
        list.innerHTML = renderAchievementCards(achAllItems, achActiveCat, achActiveColl);
        renderAchStats(achActiveCat, achActiveColl);
      });
      return;
    }
    // 按子分类分组（保持出现顺序）
    var groups = [];
    var idx = {};
    items.forEach(function (it) {
      var g = (it['子分类'] || '综合').trim();
      if (!idx[g]) {
        idx[g] = groups.length;
        groups.push({ name: g, items: [] });
      }
      groups[idx[g]].items.push(it);
    });

    var html = groups.map(function (g, gi) {
      var rows = g.items.map(function (it) {
        var u = it['最后更新'];
        var meta = [];
        meta.push('<span class="wo-item-chars">' + fmtChars(it['字符数'] || 0) + ' 字</span>');
        if (u) meta.push('<span class="wo-item-date">' + esc(String(u).slice(0, 10)) + '</span>');
        return '<li class="wo-item">' +
          '<a href="wiki-detail.html?cat=' + encodeURIComponent(cur.key) + '&id=' + encodeURIComponent(it['词条id']) + '">' +
          esc(it['标题'] || '（无标题）') + '</a>' +
          '<span class="wo-item-meta">' + meta.join('') + '</span>' +
          '</li>';
      }).join('');
      var open = gi === 0 ? ' open' : '';
      return '<details class="wo-group"' + open + '>' +
        '<summary>' + esc(g.name) + '<span class="wo-group-count">' + g.items.length + '</span></summary>' +
        '<ul class="wo-rows">' + rows + '</ul>' +
        '</details>';
    }).join('');

    list.innerHTML = html;
    if (count) count.textContent = items.length;
    if (subCount) subCount.textContent = groups.length;
    var totalChars = items.reduce(function (n, it) { return n + (it['字符数'] || 0); }, 0);
    if (chars) chars.textContent = fmtChars(totalChars);
  }

  if (title) title.textContent = cur.name + ' · 词条';
  if (crumb) crumb.textContent = '全量收录 · ' + cur.name;
  markActive();

  fetch('data/' + cur.file)
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(render)
    .catch(function () { renderNotFound(); });
})();
