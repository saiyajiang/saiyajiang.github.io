/* 悲歌的小站 · 共用脚本：主题切换 + 数据渲染 + 筛选 */
(function () {
  "use strict";

  var posts = window.SITE_POSTS || [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }

  function tagSpans(tags) {
    return tags.map(function (t) { return '<span class="post-card__tag" data-tag="' + esc(t) + '" title="按此标签筛选">' + esc(t) + "</span>"; }).join("");
  }

  function archiveTagSpans(tags) {
    return tags.map(function (t) { return '<span class="archive-tag" data-tag="' + esc(t) + '" title="按此标签筛选">' + esc(t) + "</span>"; }).join("");
  }

  /* ---------- 主题 ---------- */
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

  /* ---------- 当前导航高亮 ---------- */
  function setActiveNav() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    var links = document.querySelectorAll(".site-nav a");
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (href && href.indexOf(page) !== -1) a.classList.add("active");
    });
  }

  /* ---------- 渲染：首页文章卡片 ---------- */
  function renderPosts() {
    var el = document.getElementById("postList");
    if (!el) return;
    var sorted = posts.slice().sort(byDateDesc);
    el.innerHTML = sorted.map(function (p, i) {
      return '' +
        '<a href="' + esc(p.url) + '" class="post-card" data-tags="' + esc(p.tags.join(" ")) + '" style="animation-delay:' + (i % 8) * 0.05 + 's">' +
          '<div class="post-card__accent"></div>' +
          '<div class="post-card__body">' +
            '<div class="post-card__meta">' +
              '<span class="post-card__date">' + esc(p.date) + "</span>" +
              '<div class="post-card__tags">' + tagSpans(p.tags) + "</div>" +
            "</div>" +
            '<div class="post-card__title">' + esc(p.title) + "</div>" +
            '<div class="post-card__excerpt">' + esc(p.excerpt) + "</div>" +
            '<div class="post-card__more">继续阅读 →</div>' +
          "</div>" +
        "</a>";
    }).join("");

    // 文章数 / 标签数统计
    var stats = document.querySelectorAll(".hero-stat-num");
    if (stats.length) {
      stats[0].textContent = posts.length;
      var tagSet = {};
      posts.forEach(function (p) { p.tags.forEach(function (t) { tagSet[t] = true; }); });
      if (stats[1]) stats[1].textContent = Object.keys(tagSet).length;
    }
  }

  /* ---------- 渲染：归档列表 ---------- */
  function renderArchive() {
    var el = document.getElementById("archiveList");
    if (!el) return;
    var sorted = posts.slice().sort(byDateDesc);
    el.innerHTML = sorted.map(function (p) {
      return '' +
        '<a href="' + esc(p.url) + '" class="archive-item" data-tags="' + esc(p.tags.join(" ")) + '">' +
          '<span class="archive-date">' + esc(p.date) + "</span>" +
          '<div class="archive-info">' +
            '<div class="archive-title">' + esc(p.title) + "</div>" +
            '<div class="archive-tags">' + archiveTagSpans(p.tags) + "</div>" +
          "</div>" +
        "</a>";
    }).join("");

    var count = document.querySelector(".archive-count");
    if (count) count.textContent = posts.length;
  }

  /* ---------- 渲染：标签云 ---------- */
  function renderTags() {
    var cloud = document.getElementById("tagCloud");
    if (!cloud) return;
    var set = {};
    posts.forEach(function (p) { p.tags.forEach(function (t) { set[t] = true; }); });
    var tags = Object.keys(set).sort();
    cloud.innerHTML = tags.map(function (t) {
      return '<button class="tag-chip" data-tag="' + esc(t) + '">' + esc(t) + "</button>";
    }).join("");
  }

  /* ---------- 搜索 + 标签筛选（首页） ---------- */
  function initFilter() {
    var search = document.getElementById("searchInput");
    var cloud = document.getElementById("tagCloud");
    var list = document.getElementById("postList");
    if (!search || !list) return;

    var cards = function () { return list.querySelectorAll(".post-card"); };
    var tagBtns = cloud ? cloud.querySelectorAll(".tag-chip") : [];
    var activeTagsEl = document.getElementById("activeTags");
    var toggleBtn = document.getElementById("tagToggleBtn");
    var noResults = document.getElementById("noResults");
    var resultCount = document.getElementById("resultCount");
    var active = {};

    function renderActive() {
      if (!activeTagsEl) return;
      activeTagsEl.innerHTML = "";
      Object.keys(active).forEach(function (tag) {
        var s = document.createElement("span");
        s.className = "active-tag";
        s.innerHTML = esc(tag) + '<span class="active-tag-clear" data-tag="' + esc(tag) + '">✕</span>';
        activeTagsEl.appendChild(s);
      });
      if (toggleBtn) toggleBtn.classList.toggle("has-active", Object.keys(active).length > 0);
    }

    function filter() {
      var q = search.value.trim().toLowerCase();
      var activeKeys = Object.keys(active);
      var visible = 0;
      cards().forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var title = card.querySelector(".post-card__title").textContent.toLowerCase();
        var excerpt = card.querySelector(".post-card__excerpt").textContent.toLowerCase();
        var okSearch = !q || title.indexOf(q) !== -1 || excerpt.indexOf(q) !== -1;
        var okTags = activeKeys.length === 0 || activeKeys.some(function (t) { return tags.indexOf(t.toLowerCase()) !== -1; });
        var show = okSearch && okTags;
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (noResults) noResults.style.display = visible === 0 ? "" : "none";
      if (resultCount) resultCount.textContent = (q || activeKeys.length) ? visible + " / " + cards().length + " 篇" : "";
    }

    search.addEventListener("input", filter);

    function toggleTag(tag, btn) {
      if (active[tag]) { delete active[tag]; if (btn) btn.classList.remove("active"); }
      else { active[tag] = true; if (btn) btn.classList.add("active"); }
      renderActive();
      filter();
    }

    if (cloud) {
      cloud.addEventListener("click", function (e) {
        var b = e.target.closest(".tag-chip");
        if (b) toggleTag(b.getAttribute("data-tag"), b);
      });
    }
    if (toggleBtn && cloud) {
      toggleBtn.addEventListener("click", function () { cloud.classList.toggle("show"); });
    }
    if (activeTagsEl) {
      activeTagsEl.addEventListener("click", function (e) {
        var x = e.target.closest(".active-tag-clear");
        if (!x) return;
        var t = x.getAttribute("data-tag");
        delete active[t];
        if (cloud) cloud.querySelectorAll(".tag-chip").forEach(function (b) {
          if (b.getAttribute("data-tag") === t) b.classList.remove("active");
        });
        renderActive();
        filter();
      });
    }

    function chipFor(tag) {
      var found = null;
      if (cloud) cloud.querySelectorAll(".tag-chip").forEach(function (b) {
        if (b.getAttribute("data-tag").toLowerCase() === String(tag).toLowerCase()) found = b;
      });
      return found;
    }

    // 卡片内标签直接点选（阻止跳转文章）
    list.addEventListener("click", function (e) {
      var t = e.target.closest(".post-card__tag");
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      var chip = chipFor(t.getAttribute("data-tag"));
      toggleTag(chip ? chip.getAttribute("data-tag") : t.getAttribute("data-tag"), chip);
    });

    // URL ?tag=xxx 预选标签（来自文章页/归档页的标签点击）
    var params = new URLSearchParams(location.search);
    var pre = params.getAll("tag");
    if (pre.length) {
      pre.forEach(function (tag) {
        var chip = chipFor(tag);
        if (chip && !active[chip.getAttribute("data-tag")]) toggleTag(chip.getAttribute("data-tag"), chip);
      });
      if (cloud && Object.keys(active).length) cloud.classList.add("show");
    }
  }

  /* ---------- 归档页：标签点击跳转首页筛选 ---------- */
  function initArchiveTagNav() {
    var el = document.getElementById("archiveList");
    if (!el) return;
    el.addEventListener("click", function (e) {
      var t = e.target.closest(".archive-tag");
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      location.href = "index.html?tag=" + encodeURIComponent(t.getAttribute("data-tag"));
    });
  }

  

/* ---------- 全局音乐播放器：本地 playlist.json → 自定义播放器 ---------- */
  function initPlayer() {
    var cfg = window.SITE_MUSIC_CONFIG || {};
    document.body.setAttribute('data-music', cfg.mode || 'local');

    fetch('assets/playlist.json')
      .then(function(r){ return r.json(); })
      .then(function(songs){
        if (!songs || !songs.length) { console.warn('[player] 空歌单'); return; }
        var audio = songs.map(function(s){
          return {
            name: s.name || '未知',
            artist: s.artist || '',
            url: s.url || '',
            cover: s.cover || s.pic || '',
            lrc: s.lrc || ''
          };
        }).filter(function(s){ return s.url; });
        if (!audio.length) return;
        console.log('[player] creating custom player...');

        // 创建自定义播放器容器
        var wrap = document.createElement('div');
        wrap.id = 'custom-player';
        wrap.innerHTML = '<div class="cp-main"><button id="cp-prev">⏮</button><button id="cp-play">▶</button><button id="cp-next">⏭</button><span id="cp-title">点击播放</span><input type="range" id="cp-vol" min="0" max="100" value="50" title="音量"><button id="cp-mode" title="顺序播放">➡️</button><button id="cp-listbtn">☰</button></div><div class="cp-list"></div>';
        document.body.appendChild(wrap);
        
        var curIdx = 0;
        var audioEl = new Audio();
        audioEl.volume = 0.5;
        var loopMode = 0; // 0=all, 1=one, 2=none
        var isShuffle = false;
        var playedIdx = [];
        
        function loadSong(idx) {
          curIdx = (idx + audio.length) % audio.length;
          var s = audio[curIdx];
          audioEl.src = s.url;
          document.getElementById('cp-title').textContent = s.name + ' - ' + s.artist;
          // 记录已播放
          if (isShuffle && playedIdx.indexOf(curIdx) === -1) playedIdx.push(curIdx);
        }
        
        function nextSong() {
          if (isShuffle) {
            if (playedIdx.length >= audio.length) playedIdx = [];
            var remain = audio.map(function(_,i){return i;}).filter(function(i){return playedIdx.indexOf(i)===-1;});
            var next = remain[Math.floor(Math.random()*remain.length)];
            loadSong(next);
          } else {
            loadSong(curIdx + 1);
          }
          audioEl.play();
          document.getElementById('cp-play').textContent = '❚❚';
        }
        
        document.getElementById('cp-play').onclick = function() {
          if (audioEl.paused) { audioEl.play(); this.textContent = '❚❚'; }
          else { audioEl.pause(); this.textContent = '▶'; }
        };
        document.getElementById('cp-prev').onclick = function() { loadSong(curIdx - 1); audioEl.play(); document.getElementById('cp-play').textContent = '❚❚'; };
        document.getElementById('cp-next').onclick = nextSong;
        document.getElementById('cp-listbtn').onclick = function() { listEl.classList.toggle('show'); };
        
        // 播放模式切换：顺序→循环全部→单曲循环→随机
        var playModes = [
          {icon: '➡️', title: '顺序播放', loop: false, shuffle: false},
          {icon: '🔁', title: '循环全部', loop: false, shuffle: false},
          {icon: '🔂', title: '单曲循环', loop: true, shuffle: false},
          {icon: '🔀', title: '随机播放', loop: false, shuffle: true}
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
        
        // 音量控制
        document.getElementById('cp-vol').oninput = function() {
          audioEl.volume = this.value / 100;
        };
        
        // 播放结束处理
        audioEl.onended = function() {
          if (audioEl.loop) return; // 单曲循环由浏览器处理
          if (isShuffle || modeIdx === 1 || (modeIdx === 0 && curIdx < audio.length - 1)) {
            nextSong();
          } else {
            document.getElementById('cp-play').textContent = '▶';
          }
        };
        
        // 列表
        var listEl = document.querySelector('.cp-list');
        audio.forEach(function(s, i) {
          var div = document.createElement('div');
          div.className = 'cp-item';
          div.textContent = s.name;
          div.onclick = function() { loadSong(i); audioEl.play(); document.getElementById('cp-play').textContent = '❚❚'; };
          listEl.appendChild(div);
        });
        
        // 拖动
        var dragging = false, startX, startY, startR, startB;
        wrap.querySelector('.cp-main').addEventListener('mousedown', function(e) {
          if (e.target.tagName === 'BUTTON') return;
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
        
        // 初始加载
        loadSong(0);

        console.log('[player] loaded', audio.length, 'songs from local JSON');
      })
      .catch(function(err){
        console.error('[player] playlist.json 加载失败:', err);
      });
  }

    function _legacyCreatePlayer(list) {
    var LS_IDX = "site_player_idx";
    var LS_POS = "site_player_pos";
    var lastPosSave = 0;

    var cur = parseInt(localStorage.getItem(LS_IDX) || "0", 10) || 0;
    if (cur >= list.length) cur = 0;

    var bar = document.createElement("div");
    bar.className = "player-bar";
    bar.innerHTML =
      '<button class="player-btn" id="playerPlay" aria-label="播放/暂停">' +
        '<svg class="player-icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
        '<svg class="player-icon-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>' +
      '</button>' +
      '<div class="player-meta">' +
        '<div class="player-title" id="playerTitle">未选择</div>' +
        '<div class="player-sub" id="playerSub">点击播放</div>' +
      '</div>' +
      '<div class="player-progress" id="playerProgress"><div class="player-progress-fill" id="playerFill"></div></div>' +
      '<span class="player-time" id="playerTime">0:00</span>' +
      '<button class="player-btn player-btn--sm" id="playerPrev" aria-label="上一首">⏮</button>' +
      '<button class="player-btn player-btn--sm" id="playerNext" aria-label="下一首">⏭</button>' +
      '<button class="player-btn player-btn--sm" id="playerMin" aria-label="最小化" title="最小化" style="margin-left:4px">−</button>' +
      '<button class="player-btn player-btn--sm player-btn--list" id="playerList" aria-label="播放列表" title="播放列表">☰</button>' +
      '<div class="player-playlist" id="playerPlaylist">' +
        '<div class="player-playlist-header">' +
          '<span>播放列表 (' + list.length + ')</span>' +
          '<button class="player-playlist-close" id="playlistClose">×</button>' +
        '</div>' +
        '<div class="player-playlist-list" id="playlistList"></div>' +
      '</div>';
    document.body.appendChild(bar);
    bar.classList.add("show");

    var audio = new Audio();
    audio.preload = "metadata";
    audio.volume = 0.5;
    
    var btnPlay = bar.querySelector("#playerPlay");
    var btnPrev = bar.querySelector("#playerPrev");
    var btnNext = bar.querySelector("#playerNext");
    var btnList = bar.querySelector("#playerList");
    var btnMin = bar.querySelector("#playerMin");
    var playlistPanel = bar.querySelector("#playerPlaylist");
    var btnCloseList = bar.querySelector("#playlistClose");
    var playlistList = bar.querySelector("#playlistList");
    var fill = bar.querySelector("#playerFill");
    var timeEl = bar.querySelector("#playerTime");
    var titleEl = bar.querySelector("#playerTitle");
    var subEl = bar.querySelector("#playerSub");
    var prog = bar.querySelector("#playerProgress");

    function fmt(t) {
      if (!isFinite(t)) t = 0;
      var m = Math.floor(t / 60), ss = Math.floor(t % 60);
      return m + ":" + (ss < 10 ? "0" : "") + ss;
    }

    function renderPlaylist() {
      playlistList.innerHTML = list.map(function(item, idx) {
        var active = idx === cur ? ' active' : '';
        var source = item.src.indexOf('injahow') > 0 ? 'QQ' : '直链';
        return '<div class="player-playlist-item' + active + '" data-idx="' + idx + '">' +
          '<span class="player-playlist-num">' + (idx + 1) + '</span>' +
          '<div class="player-playlist-info">' +
            '<div class="player-playlist-title">' + (item.title || '未命名') + '</div>' +
            '<div class="player-playlist-artist">' + (item.artist || '') + '</div>' +
          '</div>' +
          '<span class="player-playlist-source">' + source + '</span>' +
        '</div>';
      }).join('');
      playlistList.querySelectorAll('.player-playlist-item').forEach(function(el) {
        el.addEventListener('click', function() {
          var idx = parseInt(this.dataset.idx, 10);
          load(idx, true);
        });
      });
    }

    function load(idx, autoplay) {
      cur = (idx + list.length) % list.length;
      localStorage.setItem(LS_IDX, String(cur));
      var item = list[cur];
      audio.src = item.src;
      titleEl.textContent = item.title || "未命名";
      subEl.textContent = "加载中...";
      fill.style.width = "0%";
      timeEl.textContent = "0:00";
      bar.classList.add("is-loading");
      audio.load();
      if (autoplay) tryPlay(item);
      renderPlaylist();
    }

    function tryPlay(item) {
      var playTimer = setTimeout(function() {
        if (audio.paused) {
          bar.classList.remove("is-loading");
          subEl.textContent = "加载超时，跳到下一首";
          load(cur + 1, true);
        }
      }, 12000);
      audio.play().then(function(){
        clearTimeout(playTimer);
        setPlaying(true);
        bar.classList.remove("is-loading");
        subEl.textContent = item.artist || "";
      }).catch(function(e){
        clearTimeout(playTimer);
        setPlaying(false);
        bar.classList.remove("is-loading");
        subEl.textContent = "加载失败";
      });
    }

    function setPlaying(on) { bar.classList.toggle("is-playing", on); }

    btnPlay.addEventListener("click", function () {
      if (audio.paused) {
        bar.classList.add("is-loading");
        subEl.textContent = "加载中...";
        tryPlay(list[cur]);
      } else { audio.pause(); setPlaying(false); }
    });
    btnPrev.addEventListener("click", function () { load(cur - 1, true); });
    btnNext.addEventListener("click", function () { load(cur + 1, true); });

    var isMin = false;
    btnMin.addEventListener("click", function(e) {
      e.stopPropagation();
      isMin = !isMin;
      bar.classList.toggle("player-min", isMin);
      btnMin.innerHTML = isMin ? "+" : "−";
      if (!isMin) playlistPanel.classList.remove("show");
    });

    btnList.addEventListener("click", function() {
      playlistPanel.classList.toggle("show");
      renderPlaylist();
    });
    btnCloseList.addEventListener("click", function() { playlistPanel.classList.remove("show"); });

    audio.addEventListener("timeupdate", function () {
      if (audio.duration) {
        fill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
        timeEl.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
      }
      lastPosSave = Date.now();
      localStorage.setItem(LS_POS, String(audio.currentTime));
    });
    audio.addEventListener("ended", function () { load(cur + 1, true); });
    audio.addEventListener("play", function () { setPlaying(true); });
    audio.addEventListener("pause", function () { setPlaying(false); });
    audio.addEventListener("error", function() {
      setPlaying(false);
      bar.classList.remove("is-loading");
      subEl.textContent = "加载失败，点击下一首";
    });
    audio.addEventListener("stalled", function() {
      subEl.textContent = "缓冲中...";
    });
    audio.addEventListener("waiting", function() {
      subEl.textContent = "缓冲中...";
    });
    audio.addEventListener("playing", function() {
      bar.classList.remove("is-loading");
      subEl.textContent = list[cur].artist || "";
    });

    prog.addEventListener("click", function (e) {
      if (!audio.duration) return;
      var r = this.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });

    document.addEventListener("click", function(e) {
      if (playlistPanel && !playlistPanel.contains(e.target) && e.target !== btnList) {
        playlistPanel.classList.remove("show");
      }
    });

    renderPlaylist();
    load(cur, false);
    var savedPos = parseFloat(localStorage.getItem(LS_POS) || "0");
    if (savedPos > 0) { try { audio.currentTime = savedPos; } catch (e) {} }
    
    // 拖动
    bar.style.userSelect = 'none';
    var isDragging = false, dragStartX, dragStartY, startRight, startBottom;
    bar.addEventListener('mousedown', function(e) {
      if (e.target.closest('button') || e.target.closest('.player-progress') || e.target.closest('.player-playlist')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      var rect = bar.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startBottom = window.innerHeight - rect.bottom;
      bar.style.cursor = 'grabbing';
      bar.style.transition = 'none';
    });
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      var dy = e.clientY - dragStartY;
      bar.style.right = Math.max(10, Math.min(window.innerWidth - 100, startRight - dx)) + 'px';
      bar.style.bottom = Math.max(10, Math.min(window.innerHeight - 100, startBottom - dy)) + 'px';
    });
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        bar.style.cursor = '';
        bar.style.transition = '';
      }
    });
  }
  
  /* ---------- 内容区三列布局（左右夹短句）---------- */
  window.SITE_NOTES = window.SITE_NOTES || [];  // 留空，默认占位 placeholder
  
  function _placeholderNote(text) {
    var item = document.createElement('div');
    item.className = 'side-note';
    var t = document.createElement('div');
    t.className = 'side-note__text';
    t.textContent = text || '占位';
    item.appendChild(t);
    return item;
  }
  
  function initSidebar() {
    var page = document.querySelector('main.page');
    if (!page) return;
    if (page.classList.contains('with-side')) return;
    
    var postList = document.getElementById('postList') ||
                   document.getElementById('archiveList');
    if (!postList) return;
    
    var cards = Array.prototype.slice.call(postList.children);
    if (!cards.length) return;
    
    var left = document.createElement('aside');
    left.className = 'side-notes side-notes--left';
    
    var right = document.createElement('aside');
    right.className = 'side-notes side-notes--right';
    
    var mainWrap = document.createElement('div');
    mainWrap.className = 'page-main';
    
    // 每张卡片包一层 row，row 是 grid 三列
    cards.forEach(function(card){
      var row = document.createElement('div');
      row.className = 'content-row';
      var ln = document.createElement('div');
      ln.className = 'content-row__side';
      var mid = document.createElement('div');
      mid.className = 'content-row__main';
      var rn = document.createElement('div');
      rn.className = 'content-row__side';
      var nl = _placeholderNote('占位');
      var nr = _placeholderNote('占位');
      ln.appendChild(nl);
      rn.appendChild(nr);
      mid.appendChild(card);
      row.appendChild(ln);
      row.appendChild(mid);
      row.appendChild(rn);
      mainWrap.appendChild(row);
      // 保存引用以便后续 JS 同步高度
      row._leftNote = nl;
      row._rightNote = nr;
      row._card = card;
    });
    
    // 先把 mainWrap 附加到 page 末尾，再把前面的内容依次放在它之前
    page.appendChild(mainWrap);
    var preNodes = [];
    while (page.firstChild && page.firstChild !== mainWrap) {
      preNodes.push(page.firstChild);
      page.removeChild(page.firstChild);
    }
    preNodes.forEach(function(n){ page.insertBefore(n, mainWrap); });
    
    page.classList.add('with-side');
    
    // 高度同步：每张占位卡的高度等于同行文章卡高度
    function syncHeights(){
      mainWrap.querySelectorAll('.content-row').forEach(function(row){
        var h = row._card.offsetHeight;
        if (h) {
          row._leftNote.style.height = h + 'px';
          row._rightNote.style.height = h + 'px';
        }
      });
    }
    syncHeights();
    window.addEventListener('resize', syncHeights);
    // 卡片加载完后图片 / 字高变化可能引起高度变，再同步一次
    setTimeout(syncHeights, 300);
    setTimeout(syncHeights, 1000);
  }
  
  /* ---------- 回到顶部按钮 ---------- */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          btn.classList.toggle('visible', window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    // 设置音乐模式标记，CSS 据此显示/隐藏对应播放器
    var cfg = window.SITE_MUSIC_CONFIG || {};
    document.body.setAttribute('data-music', cfg.mode || 'local');
    initTheme();
    initToggle();
    setActiveNav();
    // renderPosts(); // index.html has its own renderArticles()
    // renderArchive(); // archive.html has its own inline script
    // renderTags(); // each page renders its own tags
    // initFilter(); // index.html has its own filter logic
    // initArchiveTagNav(); // archive.html has its own
    initPlayer();
    initSidebar();
    initBackToTop();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();