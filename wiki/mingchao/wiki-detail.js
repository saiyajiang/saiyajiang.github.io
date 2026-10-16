/* ============================================================
   鸣潮 · Wiki 全量收录词条详情页脚本（wiki-detail.js）
   根据 URL 参数 cat + id 加载对应 data/*.json，渲染正文纯文字。
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

  var params = new URLSearchParams(location.search);
  var catKey = params.get('cat') || 'tujian';
  var entryId = params.get('id') || '';
  var cur = CATS[catKey] || CATS['tujian'];

  var wdCat = document.getElementById('wdCat');
  var wdTitle = document.getElementById('wdTitle');
  var wdSub = document.getElementById('wdSub');
  var wdSubCat = document.getElementById('wdSubCat');
  var wdChars = document.getElementById('wdChars');
  var wdUpdate = document.getElementById('wdUpdate');
  var wdBody = document.getElementById('wdBody');
  var crumbLink = document.getElementById('crumbCatLink');
  var crumbTitle = document.getElementById('crumbTitle');
  var back = document.getElementById('wdBack');

  if (wdCat) wdCat.textContent = '全量收录 · ' + (cur ? cur.name : catKey);
  if (crumbLink) crumbLink.textContent = '全量收录 · ' + (cur ? cur.name : catKey);
  if (back) back.href = 'wiki-official.html?cat=' + encodeURIComponent(catKey);

  function renderNotFound(msg) {
    if (wdTitle) wdTitle.textContent = '未找到词条';
    if (wdSub) wdSub.textContent = msg || '词条不存在或数据加载失败。';
    wdBody.innerHTML = '<div class="mc-placeholder"><div class="mc-placeholder-icon">◈</div>' +
      '<p class="mc-placeholder-title">无法显示正文</p>' +
      '<p class="mc-placeholder-desc">' + esc(msg || '') + '<br/>请确认在 HTTP 环境访问（file:// 打开时浏览器会拦截 JSON 请求）。</p></div>';
  }

  fetch('data/' + cur.file)
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (items) {
      var item = null;
      for (var i = 0; i < items.length; i++) {
        if (String(items[i]['词条id']) === String(entryId)) { item = items[i]; break; }
      }
      if (!item) { renderNotFound('未找到该词条（id=' + esc(entryId) + '）。'); return; }

      var body = item['正文文字'] || '';
      if (wdTitle) wdTitle.textContent = item['标题'] || '（无标题）';
      if (wdSub) wdSub.textContent = (cur ? cur.name : '') + (item['子分类'] ? ' · ' + item['子分类'] : '');
      if (wdSubCat) wdSubCat.textContent = item['子分类'] || '综合';
      if (wdChars) wdChars.textContent = fmtChars(item['字符数'] || 0);
      if (wdUpdate) wdUpdate.textContent = esc(String(item['最后更新'] || '-').slice(0, 10));
      if (crumbTitle) crumbTitle.textContent = item['标题'] || '词条';

      if (body) {
        wdBody.innerHTML = '<pre class="wd-text">' + esc(body) + '</pre>';
      } else {
        renderNotFound('该词条仅有标题、无正文文字。');
      }

      // 相关位置跳转（成就位置图等外部页面 → 双向互链）
      var rel = item['相关位置'];
      if (rel && rel.length) {
        var links = rel.map(function (r) {
          return '<a class="wd-rel-link" href="' + esc(r['链接']) + '">' + esc(r['名称']) + '</a>';
        }).join('<span class="wd-rel-sep"> · </span>');
        wdBody.insertAdjacentHTML('beforeend',
          '<div class="wd-rel"><span class="wd-rel-label">相关位置</span>' + links + '</div>');
      }
    })
    .catch(function () {
      renderNotFound('数据文件加载失败（HTTP 环境必需）。');
    });
})();
