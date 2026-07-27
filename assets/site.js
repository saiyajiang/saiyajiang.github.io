/* ========================================
   公共 JS — 主题切换 / 返回顶部 / 菜单折叠
   所有页面共享
   ======================================== */
(function() {
    'use strict';

    /* ---- 主题切换 ---- */
    var themeToggle = document.getElementById('themeToggle');
    var htmlEl = document.documentElement;

    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
        }
        try { localStorage.setItem('theme', theme); } catch (e) {}
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var current = htmlEl.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // 初始化：从 localStorage 读取
    var saved;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
    }

    /* ---- 返回顶部 ---- */
    var backToTop = document.getElementById('backToTop');

    function onScroll() {
        if (!backToTop) return;
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---- 移动端菜单 ---- */
    var menuToggle = document.getElementById('menuToggle');
    var navMenu    = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('open');
            }
        });
    }

    /* ========================================
       全局音乐播放器 — Meting API QQ 音乐 + 本地回退
       ======================================== */
    var PLAYLIST_JSON = 'assets/playlist.json';
    var DEFAULT_PLAYLIST = [
        { title: '$ play 悠忽舞于梦中 --artist 鸣潮先约电台', src: '' },
        { title: '$ play 星炬不熄 --artist 鸣潮先约电台', src: '' },
        { title: '$ play Running For Your Life --artist Casey Lee Williams', src: '' }
    ];

    var audio       = new Audio();
    var playlist    = DEFAULT_PLAYLIST;
    var currentIdx  = 0;
    var playMode    = 'loop'; // loop | shuffle | single
    var isPlaying   = false;
    var panelHeader = 'player';

    function initPlayer() {
        fetch(PLAYLIST_JSON)
            .then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function(data) {
                if (Array.isArray(data) && data.length) {
                    var mapped = data.map(function(s) {
                        return {
                            title: '$ play ' + (s.name || '未知') + ' --artist ' + (s.artist || '未知'),
                            src: s.url || ''
                        };
                    }).filter(function(s) { return s.src; });
                    if (mapped.length) {
                        playlist = mapped;
                        panelHeader = '~/playlist.json';
                        console.log('[music] playlist.json OK, ' + playlist.length + ' songs');
                    }
                }
                doInit();
            })
            .catch(function(err) {
                console.warn('[music] playlist.json failed (' + err.message + '), using defaults');
                doInit();
            });
    }

    function doInit() {
        /* restore state */
        var savedIdx;
        try { savedIdx = parseInt(localStorage.getItem('music_idx'), 10); } catch(e) {}
        if (!isNaN(savedIdx) && savedIdx >= 0 && savedIdx < playlist.length) {
            currentIdx = savedIdx;
        }
        try { var savedTime = parseFloat(localStorage.getItem('music_time')); } catch(e) {}
        if (savedTime && savedTime > 0) {
            audio.currentTime = savedTime;
        }
        try { var savedMode = localStorage.getItem('music_mode'); } catch(e) {}
        if (savedMode && /^(loop|shuffle|single)$/.test(savedMode)) {
            playMode = savedMode;
        }

        audio.src = playlist[currentIdx].src;
        audio.preload = 'metadata';

        /* events */
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', updateUI);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', function() { isPlaying = true; updateUI(); });
        audio.addEventListener('pause', function() { isPlaying = false; updateUI(); });
        audio.addEventListener('error', function() {
            console.warn('Music load error:', playlist[currentIdx].src);
            updateUI();
        });

        /* save */
        audio.addEventListener('timeupdate', saveState);
        window.addEventListener('beforeunload', saveState);

        /* build UI */
        buildPlayerUI();
        updateUI();
    }

    function saveState() {
        try { localStorage.setItem('music_idx', currentIdx); } catch(e) {}
        try { localStorage.setItem('music_time', audio.currentTime || 0); } catch(e) {}
        try { localStorage.setItem('music_mode', playMode); } catch(e) {}
    }

    function togglePanel() {
        var panel = document.getElementById('musicPanel');
        if (!panel) return;
        panel.classList.toggle('open');
    }

    function play(idx) {
        if (idx >= 0 && idx < playlist.length) {
            currentIdx = idx;
            audio.src = playlist[currentIdx].src;
            audio.play().catch(function(){});
        }
    }

    function togglePlay() {
        if (audio.paused) {
            audio.play().catch(function(){});
        } else {
            audio.pause();
        }
    }

    function prev() {
        if (playMode === 'shuffle') {
            currentIdx = Math.floor(Math.random() * playlist.length);
        } else {
            currentIdx = (currentIdx - 1 + playlist.length) % playlist.length;
        }
        audio.src = playlist[currentIdx].src;
        audio.play().catch(function(){});
    }

    function next() {
        if (playMode === 'shuffle') {
            currentIdx = Math.floor(Math.random() * playlist.length);
        } else {
            currentIdx = (currentIdx + 1) % playlist.length;
        }
        audio.src = playlist[currentIdx].src;
        audio.play().catch(function(){});
    }

    function onEnded() {
        if (playMode === 'single') {
            audio.currentTime = 0;
            audio.play().catch(function(){});
        } else {
            next();
        }
    }

    function cycleMode() {
        var modes = ['loop', 'shuffle', 'single'];
        var idx = modes.indexOf(playMode);
        playMode = modes[(idx + 1) % modes.length];
        saveState();
        updateUI();
    }

    function seek(e) {
        var progress = document.getElementById('musicProgress');
        if (!progress || !audio.duration) return;
        var rect = progress.getBoundingClientRect();
        var pct  = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    }

    function onTimeUpdate() {
        var progress = document.getElementById('musicProgress');
        var curEl    = document.getElementById('musicCurTime');
        var durEl    = document.getElementById('musicDurTime');
        if (progress && audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
        if (curEl) curEl.textContent = fmtTime(audio.currentTime);
        if (durEl) durEl.textContent = fmtTime(audio.duration || 0);
    }

    function fmtTime(sec) {
        if (isNaN(sec)) return '0:00';
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function updateUI() {
        var toggle   = document.getElementById('musicToggle');
        var nowEl    = document.getElementById('musicNowPlaying');
        var prog     = document.getElementById('musicProgress');
        var modeBtn  = document.getElementById('musicModeBtn');
        var playlistEl = document.getElementById('musicPlaylistList');

        if (toggle) {
            if (isPlaying) toggle.classList.add('playing');
            else toggle.classList.remove('playing');
        }
        if (nowEl && playlist[currentIdx]) {
            nowEl.textContent = playlist[currentIdx].title;
        }
        if (prog && audio.duration) {
            prog.value = (audio.currentTime / audio.duration) * 100;
        }
        var modeLabels = { loop: '\u27A4\uFE0F', shuffle: '\uD83D\uDD00', single: '\uD83D\uDD02' };
        if (modeBtn) {
            modeBtn.textContent = modeLabels[playMode] || '\u27A4\uFE0F';
            modeBtn.title = { loop: '列表循环 (\u27A4\uFE0F)', shuffle: '随机播放 (\uD83D\uDD00)', single: '单曲循环 (\uD83D\uDD02)' }[playMode];
        }
        if (playlistEl) {
            var items = playlistEl.querySelectorAll('.music-playlist-item');
            items.forEach(function(item, i) {
                item.classList.toggle('active', i === currentIdx);
            });
        }
    }

    function buildPlayerUI() {
        var container = document.createElement('div');
        container.className = 'music-player';
        container.innerHTML =
            '<button class="music-toggle" id="musicToggle" aria-label="音乐播放器" title="打开音乐">&#9835;</button>' +
            '<div class="music-panel" id="musicPanel">' +
            '  <div class="music-panel-header">' + panelHeader + '</div>' +
            '  <div class="music-now-playing" id="musicNowPlaying">--</div>' +
            '  <div class="music-progress-wrap"><input type="range" class="music-progress" id="musicProgress" min="0" max="100" value="0" /></div>' +
            '  <div class="music-time"><span id="musicCurTime">0:00</span><span id="musicDurTime">0:00</span></div>' +
            '  <div class="music-controls">' +
            '    <button class="music-btn" id="musicPrev" title="上一首">&#9664;</button>' +
            '    <button class="music-btn music-btn-play" id="musicPlay" title="播放/暂停">&#9654;</button>' +
            '    <button class="music-btn" id="musicNext" title="下一首">&#9654;</button>' +
            '  </div>' +
            '  <div class="music-vol-wrap">' +
            '    <span class="music-vol-icon">&#128266;</span>' +
            '    <input type="range" class="music-vol" id="musicVol" min="0" max="100" value="50" title="音量" />' +
            '  </div>' +
            '  <div class="music-mode"><button class="music-mode-btn" id="musicModeBtn">&#10145;</button></div>' +
            '  <div class="music-playlist" id="musicPlaylistList"></div>' +
            '</div>';

        document.body.appendChild(container);

        /* build playlist */
        var plEl = document.getElementById('musicPlaylistList');
        playlist.forEach(function(item, i) {
            var div = document.createElement('div');
            div.className = 'music-playlist-item';
            div.textContent = item.title;
            (function(j) {
                div.addEventListener('click', function() { play(j); });
            })(i);
            plEl.appendChild(div);
        });

        /* bind events */
        document.getElementById('musicToggle').addEventListener('click', function(e) { e.stopPropagation(); togglePanel(); });
        document.getElementById('musicPlay').addEventListener('click', togglePlay);
        document.getElementById('musicPrev').addEventListener('click', prev);
        document.getElementById('musicNext').addEventListener('click', next);
        document.getElementById('musicModeBtn').addEventListener('click', cycleMode);
        document.getElementById('musicProgress').addEventListener('click', seek);
        document.getElementById('musicVol').addEventListener('input', function() {
            audio.volume = this.value / 100;
        });
        audio.volume = 0.5;

        /* 拖动播放器 */
        var player = container;
        var dragging = false, dragStartX, dragStartY, dragStartR, dragStartB;
        player.addEventListener('mousedown', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            dragging = true;
            dragStartX = e.clientX; dragStartY = e.clientY;
            var cs = getComputedStyle(player);
            dragStartR = parseInt(cs.right, 10) || 0;
            dragStartB = parseInt(cs.bottom, 10) || 0;
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (!dragging) return;
            player.style.right = (dragStartR - (e.clientX - dragStartX)) + 'px';
            player.style.bottom = (dragStartB + (e.clientY - dragStartY)) + 'px';
            player.style.left = 'auto';
        });
        document.addEventListener('mouseup', function() { dragging = false; });

        document.addEventListener('click', function(e) {
            var panel = document.getElementById('musicPanel');
            var player = document.querySelector('.music-player');
            if (panel && player && !player.contains(e.target) && panel.classList.contains('open')) {
                panel.classList.remove('open');
            }
        });
    }

    /* init on DOM ready */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
        initPlayer();
    }

})();
