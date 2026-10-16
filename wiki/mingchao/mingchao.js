/* ============================================================
   鸣潮 Wuthering Waves 板块 — 交互脚本
   分类 Tab 切换 + 占位文案联动；
   「探索 · 地图」分类渲染 data/mc-data.js 中的真实条目
   （成就位置 / 收集点位），其余分类暂为占位。
   ============================================================ */
(function () {
  'use strict';

  var PLACEHOLDER = {
    '共鸣者': { title: '共鸣者图鉴 · 建设中', desc: '共鸣者角色卡片宫格将在此呈现（属性 / 稀有度 / 武器类型筛选）。' },
    '武器': { title: '武器图鉴 · 建设中', desc: '武器数据表与卡片（品质 / 类型 / 词缀）将在此呈现。' },
    '声骸': { title: '声骸图鉴 · 建设中', desc: '声骸收集与套装数据将在此呈现。' },
    '探索': { title: '探索 · 地图 · 建设中', desc: '地图区域与探索点位数据将在此呈现。' }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var grid = document.getElementById('mcGrid');
  var chips = document.querySelectorAll('.wiki-tabs .chip');
  var dockBtns = document.querySelectorAll('.wiki-dock button');
  var catCount = document.getElementById('mcCatCount');

  var DATA = window.MC_DATA || {};
  var totalItems = Object.keys(DATA).reduce(function (n, k) { return n + DATA[k].length; }, 0);

  function renderPlaceholder(cat) {
    var p = PLACEHOLDER[cat] || PLACEHOLDER['共鸣者'];
    grid.innerHTML =
      '<div class="mc-placeholder">' +
      '<div class="mc-placeholder-icon">◈</div>' +
      '<p class="mc-placeholder-title">' + p.title + '</p>' +
      '<p class="mc-placeholder-desc">' + p.desc + '</p>' +
      '</div>';
  }

  function renderCards(items) {
    grid.innerHTML = items.map(function (r) {
      var img = r.img
        ? '<div class="mc-card-media"><img src="' + esc(r.img) + '" alt="' + esc(r.title || r.name) + '" loading="lazy" /></div>'
        : '';
      var achv = r.name
        ? '<p class="mc-card-achv">成就：' + esc(r.name) + '</p>'
        : '';
      var loc = r.location
        ? '<p class="mc-card-loc">位置：' + esc(r.location) + '</p>'
        : '';
      var open = r.detail
        ? '<span class="mc-card-open">查看详情 ↗</span>'
        : '';
      var card = '' +
        '<article class="mc-card">' +
        img +
        '<div class="mc-card-body">' +
        (r.cat ? '<span class="mc-card-cat">' + esc(r.cat) + '</span>' : '') +
        '<h3 class="mc-card-title">' + esc(r.title || r.name) + '</h3>' +
        achv +
        loc +
        (r.desc ? '<p class="mc-card-desc">' + esc(r.desc) + '</p>' : '') +
        open +
        (r.date ? '<p class="mc-card-date">' + esc(r.date) + '</p>' : '') +
        '</div>' +
        '</article>';
      if (r.detail) {
        card = '<a class="mc-card-link" href="' + esc(r.detail) + '" target="_blank" rel="noopener">' + card + '</a>';
      }
      return card;
    }).join('');
  }

  function render(cat) {
    var items = DATA[cat];
    if (items && items.length) {
      renderCards(items);
    } else {
      renderPlaceholder(cat);
    }
    chips.forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-cat') === cat);
    });
    dockBtns.forEach(function (b) {
      b.classList.toggle('active', b.textContent.trim() === cat);
    });
    if (catCount) catCount.textContent = Object.keys(PLACEHOLDER).length;
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      render(c.getAttribute('data-cat'));
    });
  });
  dockBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      render(b.textContent.trim());
    });
  });

  if (totalItems > 0) {
    var statTotal = document.querySelector('.wiki-stats .wiki-stat:last-child b');
    if (statTotal) statTotal.textContent = totalItems;
    var statBoard = document.querySelector('.wiki-stats .wiki-stat:first-child b');
    if (statBoard) statBoard.textContent = Object.keys(DATA).length;
    var desc = document.querySelector('.wiki-desc');
    if (desc) desc.textContent = '成就位置 / 探索点位数据已接入 · 其余板块建设中';
  }

  render('探索');
})();
