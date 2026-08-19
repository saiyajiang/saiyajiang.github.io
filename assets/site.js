/* 悲歌的小站 · 统一渲染引擎 + 共用脚本 */
(function () {
  "use strict";

  var posts = window.BLOG_POSTS || [];
  var quotes = window.QUOTES_DATA || { excerpts: [], phrases: [] };
  var wiki = window.WIKI_DATA || [];
  var changelog = window.CHANGELOG_DATA || [];
  var config = window.SITE_CONFIG || {};

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }

  /* ==================== 主题切换 ==================== */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
  }
  function initTheme() {
    var t;
    try { t = localStorage.getItem("theme"); } catch (e) {}
    if (!t) t = "dark";
    document.documentElement.setAttribute("data-theme", t);
  }
  function initToggle() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      applyTheme(cur === "light" ? "dark" : "light");
    });
  }

  /* ==================== 菜单折叠 ==================== */
  function initMenuToggle() {
    var btn = document.getElementById("menuToggle");
    var nav = document.getElementById("navMenu");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      nav.classList.toggle("show");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("show"); });
    });
  }

  /* ==================== 回到顶部 ==================== */
  function initBackToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;
    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          btn.classList.toggle("visible", window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ==================== 渲染：博客列表（首页） ==================== */
  function renderBlogList(data) {
    var el = document.getElementById("app");
    if (!el) return;
    var sorted = data.slice().sort(byDateDesc);

    /* ---- 构建标签云（按文章数量降序） ---- */
    var tagCounts = {};
    data.forEach(function (p) { p.tags.forEach(function (t) { tagCounts[t] = (tagCounts[t] || 0) + 1; }); });
    var allTags = Object.keys(tagCounts).sort(function (a, b) {
      return tagCounts[b] - tagCounts[a] || a.localeCompare(b);
    });

    /* ---- 分类统计 ---- */
    var catCounts = {};
    data.forEach(function (p) {
      // Derive category from tags pattern
      var cat = "other";
      if (p.tags.some(function(t){ return ["RPG-Maker","插件汉化","GIF","素材","脚本","教程"].indexOf(t) !== -1; })) cat = "rpgmaker";
      else if (p.tags.some(function(t){ return ["Windows","NVIDIA","故障排查"].indexOf(t) !== -1; })) cat = "tech";
      else cat = "literature";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    var total = data.length;

    var html = '';
    html += '<section class="card" id="posts">';
    html += '  <div class="card-header">$ ls posts/</div>';
    html += '  <div class="card-body">';
    html += '    <div class="search-wrap"><input type="text" class="search-input" id="searchInput" placeholder="$ grep -i ..." /><span class="search-icon">$</span></div>';
    html += '    <div class="category-tabs" id="categoryTabs">';
    html += '      <span class="category-tab active" data-cat="all">/* <span class="count">(' + total + ')</span></span>';
    html += '      <span class="category-tab" data-cat="rpgmaker">./rpgmaker/ <span class="count">(' + (catCounts.rpgmaker || 0) + ')</span></span>';
    html += '      <span class="category-tab" data-cat="tech">./tech/ <span class="count">(' + (catCounts.tech || 0) + ')</span></span>';
    html += '      <span class="category-tab" data-cat="literature">./literature/ <span class="count">(' + (catCounts.literature || 0) + ')</span></span>';
    html += '    </div>';
    html += '    <div class="article-list" id="articleList"></div>';
    html += '    <div class="pager" id="pager"></div>';
    html += '  </div>';
    html += '</section>';
    el.innerHTML = html;

    /* ---- 渲染文章列表（分页） ---- */
    var PAGE_SIZE = 10;
    var currentPage = 1;

    function renderPager(total, totalPages) {
      var pager = document.getElementById("pager");
      if (!pager) return;
      if (totalPages <= 1) { pager.innerHTML = ""; return; }
      var html = '<span class="pager-info">' + total + ' 篇 / 第 ' + currentPage + '/' + totalPages + ' 页</span>';
      html += '<button class="pager-btn" data-page="' + (currentPage - 1) + '"' + (currentPage <= 1 ? ' disabled' : '') + '>&#9664; 上一页</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button class="pager-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
      }
      html += '<button class="pager-btn" data-page="' + (currentPage + 1) + '"' + (currentPage >= totalPages ? ' disabled' : '') + '>下一页 &#9654;</button>';
      pager.innerHTML = html;
    }

    function renderFiltered(filtered) {
      var list = document.getElementById("articleList");
      if (filtered.length === 0) {
        list.innerHTML = '<div class="article-empty">$ find . -name "*" => 0 results</div>';
        renderPager(0, 0);
        return;
      }
      var totalPages = Math.ceil(filtered.length / PAGE_SIZE);
      if (currentPage > totalPages) currentPage = totalPages;
      var start = (currentPage - 1) * PAGE_SIZE;
      var pageItems = filtered.slice(start, start + PAGE_SIZE);
      list.innerHTML = pageItems.map(function (a) {
        return '<div class="article-item">' +
          '  <div class="article-title"><a href="' + esc(a.url) + '">$ cat ' + esc(a.title) + '</a></div>' +
          '  <div class="article-meta">' +
          '    <span class="article-date">' + esc(a.date) + '</span>' +
          a.tags.map(function (t) { return '    <span class="article-cat">' + esc(t) + '</span>'; }).join("") +
          '  </div>' +
          '  <div class="article-summary">' + esc(a.excerpt) + '</div>' +
          '</div>';
      }).join("");
      renderPager(filtered.length, totalPages);
    }

    var currentCat = "all";
    var currentSearch = "";
    var currentTag = "";

    function getCat(a) {
      if (a.tags.some(function(t){ return ["RPG-Maker","插件汉化","GIF","素材","脚本","教程"].indexOf(t) !== -1; })) return "rpgmaker";
      if (a.tags.some(function(t){ return ["Windows","NVIDIA","故障排查"].indexOf(t) !== -1; })) return "tech";
      return "literature";
    }

    function computeFiltered() {
      var filtered = data.slice();
      if (currentCat !== "all") filtered = filtered.filter(function(a){ return getCat(a) === currentCat; });
      if (currentSearch) {
        var q = currentSearch.toLowerCase();
        filtered = filtered.filter(function(a){
          return a.title.toLowerCase().indexOf(q) !== -1 ||
                 a.excerpt.toLowerCase().indexOf(q) !== -1 ||
                 a.tags.some(function(t){ return t.toLowerCase().indexOf(q) !== -1; });
        });
      }
      if (currentTag) {
        filtered = filtered.filter(function(a){ return a.tags.indexOf(currentTag) !== -1; });
      }
      return filtered;
    }

    function doFilter() {
      currentPage = 1;
      renderFiltered(computeFiltered());
    }

    var catTabs = document.getElementById("categoryTabs");
    if (catTabs) {
      catTabs.addEventListener("click", function(e){
        var tab = e.target.closest(".category-tab");
        if (!tab) return;
        currentCat = tab.getAttribute("data-cat");
        currentTag = "";
        catTabs.querySelectorAll(".category-tab").forEach(function(t){ t.classList.remove("active"); });
        tab.classList.add("active");
        doFilter();
      });
    }

    var searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function(){
        currentSearch = searchInput.value.trim();
        doFilter();
      });
    }

    var pager = document.getElementById("pager");
    if (pager) {
      pager.addEventListener("click", function(e){
        var btn = e.target.closest(".pager-btn");
        if (!btn || btn.disabled) return;
        currentPage = parseInt(btn.getAttribute("data-page"), 10);
        renderFiltered(computeFiltered());
      });
    }

    // 标签云在侧栏，点击事件由 index.html 中的 side 标签处理
    // 这里提供 window 方法供侧栏使用
    window._blogFilter = {
      setTag: function(tag) {
        currentTag = (currentTag === tag) ? "" : tag;
        currentCat = "all";
        var tabs = document.querySelectorAll(".category-tab");
        tabs.forEach(function(t){ t.classList.remove("active"); });
        var allTab = document.querySelector('[data-cat="all"]');
        if (allTab) allTab.classList.add("active");
        doFilter();
        document.getElementById("posts").scrollIntoView({ behavior: "smooth" });
      },
      getTags: function() { return allTags; }
    };

    renderFiltered(data);
  }

  /* ==================== 渲染：归档列表 ==================== */
  function renderArchiveList(data) {
    var el = document.getElementById("app");
    if (!el) return;
    var sorted = data.slice().sort(byDateDesc);

    var groups = {};
    sorted.forEach(function (a) {
      var year = a.date.substring(0, 4);
      if (!groups[year]) groups[year] = [];
      groups[year].push(a);
    });

    var years = Object.keys(groups).sort().reverse();
    var html = '<section class="page-card"><div class="card-header">$ ls archive/ --sort=time</div><div class="card-body"><div id="archiveList">';

    years.forEach(function (year) {
      html += '<div class="year-group">';
      html += '  <div class="year-divider">### ' + year + ' ###</div>';
      groups[year].forEach(function (a) {
        html += '<div class="article-item">';
        html += '  <div class="article-title"><a href="' + esc(a.url) + '">$ cat ' + esc(a.title) + '</a></div>';
        html += '  <div class="article-meta">';
        html += '    <span class="article-date">' + esc(a.date) + '</span>';
        a.tags.forEach(function (t) { html += '    <span class="article-cat">' + esc(t) + '</span>'; });
        html += '  </div>';
        html += '  <div class="article-summary">' + esc(a.excerpt) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    });

    html += '</div></div></section>';
    el.innerHTML = html;
  }

  /* ==================== 渲染：Quotes 页 ==================== */
  function renderQuotesPage(data) {
    var el = document.getElementById("app");
    if (!el) return;

    var html = '';
    html += '<article class="post-content">';

    html += '<div class="card"><div class="card-header">$ cat quotes.txt</div><div class="card-body"><p style="color:var(--text-secondary);margin:0;">摘抄与短语拾遗，来自书籍、影视、网络与日常收集。</p></div></div>';
    html += '<hr class="section-divider" />';

    html += '<h2 id="quotes" style="scroll-margin-top:80px;">摘抄 (' + data.length + ')</h2>';
    html += '<div class="card"><div class="card-body-sm" style="display:grid;grid-template-columns:1fr;gap:12px;">';
    data.forEach(function(q){
      html += '<div class="quote-item"><blockquote>' + esc(q.text.join('<br>')) + '</blockquote>';
      html += '<p class="quote-source">\u2014 ' + esc(q.source) + '</p></div>';
    });
    html += '</div></div>';

    html += '</article>';
    el.innerHTML = html;
  }

  /* ==================== 渲染：Wiki 页 ==================== */
  function renderWikiPage(data) {
    var el = document.getElementById("app");
    if (!el) return;

    // Populate sidebar TOC
    var tocEl = document.getElementById("wikiToc");
    if (tocEl) {
      tocEl.innerHTML = data.map(function(s){
        return '<a href="#' + esc(s.id) + '">' + esc(s.title) + '</a>';
      }).join("\n");
    }

    var html = '';
    html += '<article class="post-content">';
    html += '<div class="card"><div class="card-header">~/wiki $ cat README.md</div><div class="card-body"><p style="color:var(--text-secondary);margin:0;">零散知识收集，按分类整理。</p></div></div>';
    html += '<div class="card" style="margin-top:24px;"><div class="card-header">$ tags | grep wiki</div><div class="card-body-sm"><span class="tag-chip">wiki</span></div></div>';
    html += '<hr class="section-divider" />';

    data.forEach(function(section){
      html += '<h2 id="' + esc(section.id) + '" style="scroll-margin-top:80px;">' + esc(section.title) + '</h2>';

      // Check if items have subCategory
      var hasSubCat = section.items.some(function(it){ return it.subCategory; });

      if (hasSubCat) {
        // Group by subCategory
        var groups = {};
        section.items.forEach(function(it){
          var key = it.subCategory || "";
          if (!groups[key]) groups[key] = [];
          groups[key].push(it.text);
        });

        Object.keys(groups).forEach(function(cat){
          html += '<div class="card" style="margin-bottom:12px;">';
          html += '<div class="card-header">' + esc(cat) + '</div>';
          html += '<div class="card-body-sm" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;">';
          groups[cat].forEach(function(t){
            html += '<div>' + t + '</div>';
          });
          html += '</div></div>';
        });
      } else {
        html += '<ul class="wiki-list">';
        section.items.forEach(function(it){
          html += '<li>' + it.text + '</li>';
        });
        html += '</ul>';
      }
    });

    html += '</article>';
    el.innerHTML = html;
  }

  /* ==================== 渲染：Changelog 页 ==================== */
  function renderChangelogPage(data) {
    var el = document.getElementById("app");
    if (!el) return;

    var html = '<section class="page-card"><div class="card-header">$ git log --oneline</div><div class="card-body"><div class="timeline" id="timelineList">';

    data.forEach(function(entry){
      html += '<div class="timeline-item">';
      html += '  <div class="timeline-commit">* <span class="hash">' + esc(entry.hash) + '</span> (' + esc(entry.date) + ') ' + esc(entry.title) + '</div>';
      if (entry.desc) {
        html += '  <div class="timeline-desc">' + esc(entry.desc) + '</div>';
      }
      html += '  <div class="timeline-tags">';
      entry.tags.forEach(function(tag){
        html += '    <span class="timeline-tag">[' + esc(tag) + ']</span>';
      });
      html += '  </div>';
      html += '</div>';
    });

    html += '</div></div></section>';
    el.innerHTML = html;
  }

  /* ==================== 标签云初始化（首页侧栏） ==================== */
  function initTagCloud() {
    var cloud = document.getElementById("tagCloud");
    if (!cloud || !window._blogFilter) return;
    var tags = window._blogFilter.getTags();
    var SHOW = 15;
    var expanded = false;

    function render() {
      var visible = expanded ? tags : tags.slice(0, SHOW);
      var html = visible.map(function(t){
        return '<a data-tag="' + esc(t) + '">' + esc(t) + '</a>';
      }).join("");
      if (tags.length > SHOW) {
        html += '<button class="tag-more" id="tagMore" type="button">' + (expanded ? '&#9650; 收起' : '&#9660; 显示更多 (' + tags.length + ')') + '</button>';
      }
      cloud.innerHTML = html;
      var moreBtn = document.getElementById("tagMore");
      if (moreBtn) {
        moreBtn.addEventListener("click", function(){
          expanded = !expanded;
          render();
        });
      }
    }
    render();

    cloud.addEventListener("click", function(e){
      var a = e.target.closest("a");
      if (!a) return;
      var tag = a.getAttribute("data-tag");
      cloud.querySelectorAll("a").forEach(function(el){ el.classList.remove("active-tag"); });
      a.classList.add("active-tag");
      window._blogFilter.setTag(tag);
    });
  }

  /* ==================== Fortune 卡片（首页右侧栏） ==================== */
  function initFortune() {
    var catEl = document.getElementById("fortuneCategory");
    var textEl = document.getElementById("fortuneText");
    var btn = document.getElementById("fortuneRefresh");
    if (!catEl || !textEl) return;

    var pool = [];

    // 从摘抄数据添加
    if (window.QUOTES_DATA) {
      window.QUOTES_DATA.forEach(function(q){
        pool.push({
          category: q.type,
          text: Array.isArray(q.text) ? q.text[0] : q.text,
          url: "quotes.html"
        });
      });
    }

    // 从 wiki 数据添加
    if (window.WIKI_DATA) {
      window.WIKI_DATA.forEach(function(section){
        section.items.forEach(function(item){
          pool.push({
            category: section.title,
            text: item.text,
            url: "wiki/index.html#" + section.id
          });
        });
      });
    }

    function showRandom() {
      if (pool.length === 0) return;
      var item = pool[Math.floor(Math.random() * pool.length)];
      catEl.textContent = item.category;
      textEl.textContent = item.text;
      textEl.href = item.url || "#";
    }

    showRandom();

    if (btn) {
      btn.addEventListener("click", function(e){
        e.preventDefault();
        showRandom();
      });
    }
  }

  /* ==================== 全局音乐播放器 ==================== */
  function initPlayer() {
    var cfg = window.SITE_MUSIC_CONFIG || {};
    document.body.setAttribute('data-music', cfg.mode || 'local');

    var playlistCandidates = ['assets/playlist.json', '../assets/playlist.json', '/assets/playlist.json'];
    function fetchPlaylist(i) {
      if (i >= playlistCandidates.length) return Promise.reject(new Error('playlist.json not found'));
      return fetch(playlistCandidates[i]).then(function(r){
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r;
      }).catch(function(){ return fetchPlaylist(i + 1); });
    }
    fetchPlaylist(0)
      .then(function(r){ return r.json(); })
      .then(function(songs){
        if (!songs || !songs.length) { console.warn('[player] 空歌单'); return; }
        var audio_data = songs.map(function(s){
          return {
            name: s.name || '未知',
            artist: s.artist || '',
            url: s.url || '',
            cover: s.cover || s.pic || '',
            lrc: s.lrc || ''
          };
        }).filter(function(s){ return s.url; });
        if (!audio_data.length) return;

        var wrap = document.createElement('div');
        wrap.id = 'custom-player';
        wrap.innerHTML = '<div class="cp-main"><button id="cp-prev">\u23ee</button><button id="cp-play">\u25b6</button><button id="cp-next">\u23ed</button><span id="cp-title">点击播放</span><input type="range" id="cp-vol" min="0" max="100" value="30" title="音量"><button id="cp-mode" title="顺序播放">\u27a1\ufe0f</button><button id="cp-listbtn">\u2630</button></div><div class="cp-list"></div>';
        document.body.appendChild(wrap);

        var curIdx = 0;
        var audioEl = new Audio();
        audioEl.volume = 0.3;
        var loopMode = 0;
        var isShuffle = false;
        var playedIdx = [];

        function loadSong(idx) {
          curIdx = (idx + audio_data.length) % audio_data.length;
          var s = audio_data[curIdx];
          audioEl.src = s.url;
          document.getElementById('cp-title').textContent = s.name + ' - ' + s.artist;
          if (isShuffle && playedIdx.indexOf(curIdx) === -1) playedIdx.push(curIdx);
        }

        function safePlay() {
          var btn = document.getElementById('cp-play');
          audioEl.play().then(function(){
            if (btn) btn.textContent = '\u275a\u275a';
          }).catch(function(err){
            console.warn('[player] 播放失败:', err && err.message ? err.message : err);
            if (btn) btn.textContent = '\u25b6';
          });
        }

        function nextSong() {
          if (isShuffle) {
            if (playedIdx.length >= audio_data.length) playedIdx = [];
            var remain = audio_data.map(function(_,i){return i;}).filter(function(i){return playedIdx.indexOf(i)===-1;});
            var next = remain[Math.floor(Math.random()*remain.length)];
            loadSong(next);
          } else {
            loadSong(curIdx + 1);
          }
          safePlay();
        }

        document.getElementById('cp-play').onclick = function() {
          if (audioEl.paused) { safePlay(); }
          else { audioEl.pause(); this.textContent = '\u25b6'; }
        };
        document.getElementById('cp-prev').onclick = function() { loadSong(curIdx - 1); safePlay(); };
        document.getElementById('cp-next').onclick = nextSong;
        document.getElementById('cp-listbtn').onclick = function() { listEl.classList.toggle('show'); };

        var playModes = [
          {icon: '\u27a1\ufe0f', title: '顺序播放', loop: false, shuffle: false},
          {icon: '\ud83d\udd01', title: '循环全部', loop: false, shuffle: false},
          {icon: '\ud83d\udd02', title: '单曲循环', loop: true, shuffle: false},
          {icon: '\ud83d\udd00', title: '随机播放', loop: false, shuffle: true}
        ];
        var modeIdx = 0;
        document.getElementById('cp-mode').onclick = function() {
          modeIdx = (modeIdx + 1) % 4;
          var m = playModes[modeIdx];
          this.textContent = m.icon;
          this.title = m.title;
          audioEl.loop = m.loop;
          isShuffle = m.shuffle;
          if (isShuffle) playedIdx = [curIdx];
        };

        document.getElementById('cp-vol').oninput = function() {
          audioEl.volume = this.value / 100;
        };

        audioEl.onended = function() {
          if (audioEl.loop) return;
          if (isShuffle || modeIdx === 1 || (modeIdx === 0 && curIdx < audio_data.length - 1)) {
            nextSong();
          } else {
            document.getElementById('cp-play').textContent = '\u25b6';
          }
        };

        var listEl = document.querySelector('.cp-list');
        audio_data.forEach(function(s, i) {
          var div = document.createElement('div');
          div.className = 'cp-item';
          div.textContent = s.name;
          div.onclick = function() { loadSong(i); safePlay(); };
          listEl.appendChild(div);
        });

        var dragging = false, startX, startY, startR, startB;
        wrap.querySelector('.cp-main').addEventListener('mousedown', function(e) {
          if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
          dragging = true;
          startX = e.clientX; startY = e.clientY;
          var s = getComputedStyle(wrap);
          startR = parseInt(s.right) || 20;
          startB = parseInt(s.bottom) || 20;
          e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
          if (!dragging) return;
          wrap.style.right = Math.max(10, startR + startX - e.clientX) + 'px';
          wrap.style.bottom = Math.max(10, startB + startY - e.clientY) + 'px';
        });
        document.addEventListener('mouseup', function() { dragging = false; });

        loadSong(0);
        console.log('[player] loaded', audio_data.length, 'songs from local JSON');
      })
      .catch(function(err){
        console.error('[player] playlist.json 加载失败:', err);
      });
  }

  /* ==================== 数据驱动渲染入口 ==================== */
  function renderPage() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;

    switch(page) {
      case "blog":
        if (posts.length) renderBlogList(posts);
        break;
      case "archive":
        if (posts.length) renderArchiveList(posts);
        break;
      case "quotes":
        if (quotes.length) renderQuotesPage(quotes);
        break;
      case "wiki":
        if (wiki.length) renderWikiPage(wiki);
        break;
      case "changelog":
        if (changelog.length) renderChangelogPage(changelog);
        break;
    }
  }

  /* ==================== 启动 ==================== */
  function init() {
    var cfg = window.SITE_MUSIC_CONFIG || {};
    document.body.setAttribute('data-music', cfg.mode || 'local');
    initTheme();
    initToggle();
    initMenuToggle();
    initBackToTop();
    renderPage();
    initTagCloud();
    initFortune();
    initPlayer();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
