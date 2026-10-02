/* ============================================================
   鸣潮 Wuthering Waves 板块 — 占位交互脚本（无数据）
   框架阶段：分类 Tab 切换 + 占位文案联动，后续数据接入后扩展
   ============================================================ */
(function () {
  'use strict';

  var PLACEHOLDER = {
    '共鸣者': { title: '共鸣者图鉴 · 建设中', desc: '共鸣者角色卡片宫格将在此呈现（属性 / 稀有度 / 武器类型筛选）。' },
    '武器': { title: '武器图鉴 · 建设中', desc: '武器数据表与卡片（品质 / 类型 / 词缀）将在此呈现。' },
    '声骸': { title: '声骸图鉴 · 建设中', desc: '声骸收集与套装数据将在此呈现。' },
    '探索': { title: '探索 · 地图 · 建设中', desc: '地图区域与探索点位数据将在此呈现。' },
    '攻略': { title: '攻略 · 百科 · 建设中', desc: '养成指南、活动攻略等内容将在此呈现。' }
  };

  var grid = document.getElementById('mcGrid');
  var chips = document.querySelectorAll('.wiki-tabs .chip');
  var dockBtns = document.querySelectorAll('.wiki-dock button');
  var catCount = document.getElementById('mcCatCount');

  function render(cat) {
    var p = PLACEHOLDER[cat] || PLACEHOLDER['共鸣者'];
    grid.innerHTML =
      '<div class="mc-placeholder">' +
      '<div class="mc-placeholder-icon">◈</div>' +
      '<p class="mc-placeholder-title">' + p.title + '</p>' +
      '<p class="mc-placeholder-desc">' + p.desc + '</p>' +
      '</div>';
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

  render('共鸣者');
})();
