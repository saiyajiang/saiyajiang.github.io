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
    if (!("speechSynthesis" in window)) return; // 浏览器不支持则静默跳过

    var synth = window.speechSynthesis;
    var utter = null;
    var timer = null;
    var readChars = 0; // 已朗读字符数（进度推断用）
    var chars = Array.prototype.map.call(article.querySelectorAll("h1,h2,h3,h4,p,li,blockquote,pre,code"), function (n) { return n.textContent; });
    var fullText = chars.join("\n").replace(/\s*\n\s*/g, "\n").trim();
    if (!fullText) return;
    var totalLen = fullText.length;
    var charMs = 180; // 每中文字约 180ms（估算，用于进度条）

    // 构建浮动控件
    var bar = document.createElement("div");
    bar.className = "tts-bar";
    bar.innerHTML =
      '<button class="tts-btn" id="ttsPlay" aria-label="朗读">' +
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

    function pickVoice() {
      var voices = synth.getVoices() || [];
      var zh = voices.filter(function (v) { return /zh|cmn|Chinese/i.test(v.lang || v.name); });
      if (!zh.length) return null;
      var scored = zh.map(function (v) {
        var sc = 0, n = (v.name || "") + " " + (v.lang || "");
        if (/neural|online|云|神经|premium|enhanced/i.test(n)) sc += 3;
        if (/female|女|yaoyao|huihui|xiaoxiao|yunyang/i.test(n)) sc += 1;
        return { v: v, s: sc };
      });
      scored.sort(function (a, b) { return b.s - a.s; });
      return scored[0].v;
    }

    function setPlaying(on) {
      bar.classList.toggle("is-playing", on);
      label.textContent = on ? "暂停" : "继续";
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        readChars += Math.max(1, Math.round(120 / charMs));
        fill.style.width = Math.min(100, (readChars / totalLen) * 100) + "%";
      }, 120);
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

    function makeUtter(text, startIdx) {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN";
      u.rate = 1; u.pitch = 1;
      var v = pickVoice();
      if (v) u.voice = v;
      u.onboundary = function (e) {
        if (typeof e.charIndex === "number") {
          readChars = (startIdx || 0) + e.charIndex;
          fill.style.width = Math.min(100, (readChars / totalLen) * 100) + "%";
        }
      };
      return u;
    }

    function speak() {
      readChars = 0; fill.style.width = "0%";
      utter = makeUtter(fullText, 0);
      utter.onend = function () { stopTimer(); setPlaying(false); fill.style.width = "100%"; label.textContent = "朗读全文"; };
      utter.onerror = function () { stopTimer(); setPlaying(false); label.textContent = "朗读出错"; };
      synth.speak(utter);
      setPlaying(true);
      startTimer();
    }

    btn.addEventListener("click", function () {
      if (synth.speaking && !synth.paused) { synth.pause(); stopTimer(); setPlaying(false); }
      else if (synth.paused) { synth.resume(); setPlaying(true); startTimer(); }
      else { speak(); }
    });

    bar.querySelector(".tts-progress").addEventListener("click", function (e) {
      var rect = this.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      synth.cancel(); stopTimer();
      var start = Math.floor(totalLen * ratio);
      readChars = start;
      var seg = fullText.slice(start);
      utter = makeUtter(seg, start);
      utter.onend = function () { stopTimer(); setPlaying(false); fill.style.width = "100%"; label.textContent = "朗读全文"; };
      utter.onerror = function () { stopTimer(); setPlaying(false); label.textContent = "朗读出错"; };
      fill.style.width = (ratio * 100) + "%";
      synth.speak(utter);
      setPlaying(true);
      startTimer();
    });

    window.addEventListener("beforeunload", function () { stopTimer(); synth.cancel(); });
  }


  /* ---------- 全局音乐播放器（跨页续播）---------- */
  function initPlayer() {
    var list = window.SITE_PLAYLIST || [];
    if (!list.length) return; // 没有音源则静默不显示

    var LS_IDX = "site_player_idx";
    var LS_POS = "site_player_pos";
    var LS_ON = "site_player_on";

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
      '<button class="player-btn player-btn--sm" id="playerPrev" aria-label="上一首">\u23ee</button>' +
      '<button class="player-btn player-btn--sm" id="playerNext" aria-label="下一首">\u23ed</button>';
    document.body.appendChild(bar);
    bar.classList.add("show");

    var audio = new Audio();
    audio.preload = "metadata";
    var btnPlay = bar.querySelector("#playerPlay");
    var btnPrev = bar.querySelector("#playerPrev");
    var btnNext = bar.querySelector("#playerNext");
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

    function load(idx, autoplay) {
      cur = (idx + list.length) % list.length;
      localStorage.setItem(LS_IDX, String(cur));
      var item = list[cur];
      audio.src = item.src;
      titleEl.textContent = item.title || "未命名";
      subEl.textContent = item.artist || "";
      fill.style.width = "0%";
      timeEl.textContent = "0:00";
      audio.load();
      if (autoplay) audio.play().then(function(){ setPlaying(true); }).catch(function(){ setPlaying(false); });
    }

    function setPlaying(on) {
      bar.classList.toggle("is-playing", on);
      if (on) subEl.textContent = (list[cur].artist || "") + (subEl.dataset.tip || "");
    }

    btnPlay.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function(){ setPlaying(true); }).catch(function(){ setPlaying(false); });
      } else { audio.pause(); setPlaying(false); }
    });

    btnPrev.addEventListener("click", function () { load(cur - 1, true); });
    btnNext.addEventListener("click", function () { load(cur + 1, true); });

    audio.addEventListener("timeupdate", function () {
      if (audio.duration) {
        fill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
        timeEl.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
      }
      localStorage.setItem(LS_POS, String(audio.currentTime));
    });
    audio.addEventListener("ended", function () { load(cur + 1, true); });
    audio.addEventListener("play", function () { setPlaying(true); });
    audio.addEventListener("pause", function () { setPlaying(false); });

    prog.addEventListener("click", function (e) {
      if (!audio.duration) return;
      var r = this.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });

    // 初始载入（不自动播，等用户点）；若上次在播放则尝试续播进度
    load(cur, false);
    var savedPos = parseFloat(localStorage.getItem(LS_POS) || "0");
    if (savedPos > 0) { try { audio.currentTime = savedPos; } catch (e) {} }
  }

  /* ---------- 启动 ---------- */
  function init() {
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
