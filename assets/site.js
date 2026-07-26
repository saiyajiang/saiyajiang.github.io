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

  /* ---------- 文字朗读（Web Speech API）---------- */
  function initTTS() {
    // 仅在文章页启用
    var article = document.querySelector(".post-content");
    if (!article) return;
    if (!("speechSynthesis" in window)) return;

    var synth = window.speechSynthesis;
    var utter = null, timer = null, readChars = 0;
    var nodes = article.querySelectorAll("h1,h2,h3,h4,p,li,blockquote");
    var fullText = Array.prototype.map.call(nodes, function(n){ return n.textContent; }).join("\n").replace(/\s*\n\s*/g, "\n").trim();
    if (!fullText) return;
    var totalLen = fullText.length;
    var charMs = 180;

    // 构建控件
    var bar = document.createElement("div");
    bar.className = "tts-bar";
    bar.innerHTML = '<button class="tts-btn" id="ttsPlay" aria-label="朗读">' +
      '<svg class="tts-icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<svg class="tts-icon-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>' +
      '</button>' +
      '<div class="tts-progress"><div class="tts-progress-fill" id="ttsFill"></div></div>' +
      '<span class="tts-label" id="ttsLabel">朗读全文</span>';
    document.body.appendChild(bar);
    bar.classList.add("show");

    var btn = bar.querySelector("#ttsPlay");
    var fill = bar.querySelector("#ttsFill");
    var label = bar.querySelector("#ttsLabel");

    function setPlaying(on){ bar.classList.toggle("is-playing", on); label.textContent = on ? "暂停" : "继续"; }
    function stopTimer(){ if(timer){ clearInterval(timer); timer = null; } }
    function startTimer(){ stopTimer(); timer = setInterval(function(){ readChars += Math.max(1, Math.round(120/charMs)); fill.style.width = Math.min(100, (readChars/totalLen)*100) + "%"; }, 120); }

    function pickVoice(voices){
      var zh = voices.filter(function(v){ return /zh|cmn|Chinese/i.test(v.lang || v.name); });
      if(!zh.length) return null;
      var scored = zh.map(function(v){ var sc=0, n=(v.name||"")+" "+(v.lang||""); if(/neural|online|云|神经|premium|enhanced/i.test(n)) sc+=3; if(/female|女|yaoyao|huihui|xiaoxiao|yunyang/i.test(n)) sc+=1; return {v:v,s:sc}; });
      scored.sort(function(a,b){ return b.s-a.s; });
      return scored[0].v;
    }

    function makeUtter(text, startIdx, voices){
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN"; u.rate = 1; u.pitch = 1;
      var v = pickVoice(voices);
      if(v) u.voice = v;
      u.onboundary = function(e){ if(typeof e.charIndex === "number"){ readChars = (startIdx||0)+e.charIndex; fill.style.width = Math.min(100,(readChars/totalLen)*100)+"%"; } };
      return u;
    }

    function doSpeak(voices, startAt){
      readChars = startAt || 0; fill.style.width = (readChars/totalLen*100)+"%";
      var text = fullText.slice(readChars);
      if(!text){ label.textContent = "已读完"; setPlaying(false); return; }
      utter = makeUtter(text, readChars, voices);
      utter.onend = function(){ stopTimer(); setPlaying(false); fill.style.width = "100%"; label.textContent = "朗读全文"; };
      utter.onerror = function(e){ stopTimer(); setPlaying(false); label.textContent = "朗读出错"; console.error("TTS error", e); };
      synth.speak(utter);
      setPlaying(true); startTimer();
    }

    function ensureVoicesThen(fn, onWait){
      if(onWait) onWait();
      var voices = synth.getVoices();
      if(voices && voices.length){ fn(voices); return; }
      // 某些浏览器需等待 voiceschanged
      var once = function(){ voices = synth.getVoices(); if(voices && voices.length){ synth.removeEventListener("voiceschanged", once); fn(voices); } };
      synth.addEventListener("voiceschanged", once);
      // 兜底：500ms 后若仍无则直接跑（用默认嗓音）
      setTimeout(function(){ if(!(synth.getVoices()||[]).length) fn([]); }, 500);
    }

    btn.addEventListener("click", function(){
      if(synth.speaking && !synth.paused){ synth.pause(); stopTimer(); setPlaying(false); }
      else if(synth.paused){ synth.resume(); setPlaying(true); startTimer(); }
      else { 
        label.textContent = "等待加载...";
        ensureVoicesThen(function(voices){ doSpeak(voices, 0); }, function(){
          label.textContent = "加载语音...";
        }); 
      }
    });

    bar.querySelector(".tts-progress").addEventListener("click", function(e){
      var rect = this.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      synth.cancel(); stopTimer();
      ensureVoicesThen(function(voices){ doSpeak(voices, Math.floor(totalLen*ratio)); });
    });

    window.addEventListener("beforeunload", function(){ stopTimer(); synth.cancel(); });
  }


  /* ---------- 全局音乐播放器：APlayer + Meting API 获取 QQ 音乐 ---------- */
  function initPlayer() {
    if (typeof window.APlayer === 'undefined') return;
    var cfg = window.SITE_MUSIC_CONFIG || {};
    if (cfg.mode !== 'meting' || !cfg.meting) return;
    
    var m = cfg.meting;
    var api = 'https://api.injahow.cn/meting/?server=' + m.server + '&type=' + m.type + '&id=' + m.id;
    
    // 创建固定定位的 wrapper（这里加 position:fixed）
    var wrapper = document.createElement('div');
    wrapper.className = 'player-wrapper';
    wrapper.style.cssText = 'position:fixed;right:20px;bottom:28px;z-index:81';
    document.body.appendChild(wrapper);
    
    // 加载提示
    var tip = document.createElement('div');
    tip.textContent = '加载歌单...';
    tip.style.cssText = 'position:fixed;right:20px;bottom:28px;z-index:82;padding:10px 14px;background:var(--bg-elev);border:1px solid var(--border);border-radius:16px;font-size:13px;color:var(--text-muted);opacity:0;transition:opacity.25s ease';
    document.body.appendChild(tip);
    setTimeout(function(){ tip.style.opacity = '1'; }, 50);
    
    function buildPlayer(songs) {
      tip.remove();
      if (!songs || !songs.length) return;
      var list = songs.map(function(item) {
        return {
          name: item.name || item.title || '',
          artist: item.artist || '',
          url: item.url || item.src || '',
          cover: item.cover || item.pic || 'https://y.qq.com/music/photo_new/T002R300x300M000003RMaRI1iMXzR.jpg'
        };
      });
      
      var ap = new APlayer({
        container: wrapper,
        fixed: false,
        mini: false,
        autoplay: false,
        theme: '#8b8cff',
        loop: 'all',
        order: 'list',
        preload: 'auto',
        volume: 0.5,
        lrcType: 3,
        audio: list
      });
      
      // 拖拽 wrapper 整体
      var drag = false, sx, sy, sr, sb;
      wrapper.addEventListener('mousedown', function(e) {
        if (e.target.closest('.aplayer-icon') || e.target.closest('.aplayer-bar-wrap') || e.target.closest('.aplayer-list')) return;
        drag = true;
        sx = e.clientX; sy = e.clientY;
        sr = parseInt(wrapper.style.right) || 20;
        sb = parseInt(wrapper.style.bottom) || 28;
        wrapper.style.cursor = 'grabbing';
      });
      document.addEventListener('mousemove', function(e) {
        if (!drag) return;
        var nw = wrapper.offsetWidth;
        wrapper.style.right = Math.max(10, Math.min(window.innerWidth - nw, sr + (sx - e.clientX))) + 'px';
        wrapper.style.bottom = Math.max(10, sb + (sy - e.clientY)) + 'px';
      });
      document.addEventListener('mouseup', function() {
        if (drag) { drag = false; wrapper.style.cursor = ''; }
      });
    }
    
    // 尝试在线加载歌单
    fetch(api, { mode: 'cors' })
      .then(function(r) { return r.arrayBuffer(); })
      .then(function(buf) {
        var decoder = new TextDecoder('gbk');
        var text = decoder.decode(buf);
        buildPlayer(JSON.parse(text));
      })
      .catch(function(err) {
        console.error('Meting fetch err:', err);
        // 兜底：用本地备份歌单
        var backup = cfg.playlist || [];
        if (backup.length) {
          tip.textContent = '使用本地备份歌单';
          setTimeout(function() { buildPlayer(backup); }, 500);
        } else {
          tip.textContent = '歌单加载失败';
          setTimeout(function(){ tip.remove(); }, 3000);
        }
      });
  }  function _legacyCreatePlayer(list) {
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
  
  /* ---------- 短记录侧边（读书、札记、短句）---------- */
  window.SITE_NOTES = window.SITE_NOTES || [
    {"text": "行动是存在的唯一证据", "meta": ""},
    {"text": "自律不是束缚，是选择的累积", "meta": ""},
    {"text": "气场 = 行动 × 冷静 × 存在感", "meta": ""}
  ];
  
  function initSidebar() {
    var notes = window.SITE_NOTES || [];
    if (!notes.length) return;
    
    // 查找 anchor：有 #postList 则贴它两侧，否则贴 .page 两侧
    var anchor = document.getElementById('postList') ||
                 document.getElementById('archiveList') ||
                 document.querySelector('main.page') ||
                 document.querySelector('main');
    if (!anchor) return;
    
    var half = Math.ceil(notes.length / 2);
    
    function makeNote(n) {
      var item = document.createElement('div');
      item.className = 'side-note';
      var t = document.createElement('div');
      t.className = 'side-note__text';
      t.textContent = n.text || '';
      item.appendChild(t);
      if (n.meta) {
        var m = document.createElement('div');
        m.className = 'side-note__meta';
        m.textContent = '— ' + n.meta;
        item.appendChild(m);
      }
      return item;
    }
    
    var leftCol = document.createElement('aside');
    leftCol.className = 'side-notes__col side-notes__col--left';
    notes.slice(0, half).forEach(function(n) { leftCol.appendChild(makeNote(n)); });
    
    var rightCol = document.createElement('aside');
    rightCol.className = 'side-notes__col side-notes__col--right';
    notes.slice(half).forEach(function(n) { rightCol.appendChild(makeNote(n)); });
    
    // 包成一个两列 flex，置于 anchor 之前
    var wrap = document.createElement('div');
    wrap.className = 'side-notes';
    wrap.appendChild(leftCol);
    wrap.appendChild(rightCol);
    
    anchor.parentNode.insertBefore(wrap, anchor);
  }
  
  /* ---------- 启动 ---------- */
  function init() {
    // 设置音乐模式标记，CSS 据此显示/隐藏对应播放器
    var cfg = window.SITE_MUSIC_CONFIG || {};
    document.body.setAttribute('data-music', cfg.mode || 'local');
    initTheme();
    initToggle();
    setActiveNav();
    renderPosts();
    renderArchive();
    renderTags();
    initFilter();
    initArchiveTagNav();
    initTTS();
    initPlayer();
    initSidebar();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
