const fs = require('fs');
const path = require('path');

// 1. 从所有 HTML 移除 APlayer/Meting 相关
function cleanHTML(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  
  // 移除 APlayer CSS
  c = c.replace(/<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/aplayer@[^"]+\/dist\/APlayer\.min\.css">\n?/g, '');
  
  // 移除 APlayer JS
  c = c.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/aplayer@[^"]+\/dist\/APlayer\.min\.js"><\/script>\n?/g, '');
  
  // 移除 Meting JS
  c = c.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/meting@[^"]+\/dist\/Meting\.min\.js"><\/script>\n?/g, '');
  
  // 移除 <meting-js> 标签
  c = c.replace(/<meting-js[\s\S]*?<\/meting-js>\n?/g, '');
  c = c.replace(/<!-- APlayer.*?-->\n?/g, '');
  c = c.replace(/<!-- Meting.*?-->\n?/g, '');
  
  fs.writeFileSync(filePath, c);
  console.log('cleaned: ' + filePath);
}

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (f !== '.git') walk(p); }
    else if (f.endsWith('.html')) cleanHTML(p);
  });
}

walk('.');
console.log('HTML done');

// 2. 修改 site.js：Meting 模式改为用 API 获取数据
let s = fs.readFileSync('assets/site.js', 'utf8');

// 找到 meting 模式的 if 块，替换为 API 获取
const oldMetingIf = `    // Meting 模式：使用 APlayer + Meting.js 支持 QQ音乐/网易云等
    if (cfg.mode === 'meting' && cfg.meting && typeof window.APlayer !== 'undefined') {
      var m = cfg.meting;
      var metingDiv = document.createElement('div');
      metingDiv.setAttribute('data-id', m.id);
      metingDiv.setAttribute('data-server', m.server);
      metingDiv.setAttribute('data-type', m.type);
      metingDiv.setAttribute('data-fixed', m.fixed ? 'true' : 'false');
      metingDiv.setAttribute('data-autoplay', m.autoplay ? 'true' : 'false');
      metingDiv.setAttribute('data-loop', m.loop);
      metingDiv.setAttribute('data-order', m.order);
      metingDiv.setAttribute('data-preload', m.preload);
      metingDiv.setAttribute('data-list-folded', m.listFolded ? 'true' : 'false');
      metingDiv.setAttribute('data-list-max-height', m.listMaxHeight);
      metingDiv.setAttribute('data-lrc-type', String(m.lrcType));
      metingDiv.setAttribute('data-theme', m.theme);
      metingDiv.className = 'meting-js';
      document.body.appendChild(metingDiv);
      // Meting.js 会自动初始化，延迟加拖动和配置
      setTimeout(function() {
        var ap = document.querySelector('.aplayer.aplayer-fixed');
        if (!ap) return;
        
        // 默认音量 50%（APlayer API + audio 元素双保险）
        try {
          if (window.APlayer && ap.aplayer) ap.aplayer.volume(0.5, false);
        } catch(e) {}
        var audio = ap.querySelector('audio');
        if (audio) audio.volume = 0.5;
        
        // 初始位置：右侧
        ap.style.left = 'auto';
        ap.style.right = '10px';
        
        // 拖动实现（累积 transform，mouseup 后保持位置）
        var isDragging = false, startX, startY;
        var transX = 0, transY = 0;
        var EDGE_SNAP = 60;
        
        ap.addEventListener('mousedown', function(e) {
          if (e.target.closest('.aplayer-icon') || 
              e.target.closest('.aplayer-bar-wrap') ||
              e.target.closest('.aplayer-list') ||
              e.target.closest('.aplayer-lrc') ||
              e.target.closest('.aplayer-pic')) return;
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          ap.style.transition = 'none';
          ap.style.cursor = 'grabbing';
          e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
          if (!isDragging) return;
          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          startX = e.clientX;
          startY = e.clientY;
          transX += dx;
          transY += dy;
          ap.style.transform = 'translate3d(' + transX + 'px, ' + transY + 'px, 0)';
        });
        
        document.addEventListener('mouseup', function() {
          if (!isDragging) return;
          isDragging = false;
          ap.style.cursor = '';
          ap.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)';
          
          var rect = ap.getBoundingClientRect();
          var vw = window.innerWidth, vh = window.innerHeight;
          var moved = false;
          
          if (vw - rect.right < EDGE_SNAP) {
            transX -= (vw - rect.right) + 10;
            moved = true;
          }
          else if (rect.left < 10) {
            transX += 10 - rect.left;
            moved = true;
          }
          
          if (rect.top < EDGE_SNAP) {
            transY += rect.top + 10;
            moved = true;
          } else if (vh - rect.bottom < EDGE_SNAP) {
            transY -= (vh - rect.bottom) + 10;
            moved = true;
          }
          
          if (moved) {
            ap.style.transform = 'translate3d(' + transX + 'px, ' + transY + 'px, 0)';
          }
        });
      }, 1500);
      return;
    }`;

const newMetingFetch = `    // Meting 模式：通过 API 获取 QQ音乐/网易云歌单
    if (cfg.mode === 'meting' && cfg.meting) {
      var m = cfg.meting;
      var api = 'https://api.injahow.cn/meting/?server=' + m.server + '&type=' + m.type + '&id=' + m.id;
      
      // 显示加载状态
      var loadingEl = document.createElement('div');
      loadingEl.style.cssText = 'position:fixed;right:20px;bottom:28px;z-index:81;padding:10px 14px;background:var(--bg-elev);border:1px solid var(--border);border-radius:16px;font-size:13px;color:var(--text-muted);opacity:0;transition:opacity.25s ease';
      loadingEl.textContent = '加载歌单...';
      document.body.appendChild(loadingEl);
      setTimeout(function(){ loadingEl.style.opacity = '1'; }, 50);
      
      // 获取歌单数据
      var xhr = new XMLHttpRequest();
      xhr.open('GET', api, true);
      xhr.onload = function() {
        loadingEl.remove();
        try {
          var data = JSON.parse(xhr.responseText);
          // 转换为自定义播放器格式
          var list = data.map(function(item) {
            var src = item.url;
            // 有些 API 返回的是相对路径
            if (src && src.indexOf('http') !== 0) {
              src = 'https://api.injahow.cn/meting/?server=' + m.server + '&type=url&id=' + (src.match(/id=([^&]+)/)||[])[1];
            }
            if (!src) src = item.url;
            return {
              title: item.name,
              artist: item.artist,
              src: src,
              pic: item.pic
            };
          });
          // 用自定义播放器 UI 渲染
          initLocalPlayer(list);
        } catch(e) {
          console.error('Meting fetch error', e);
        }
      };
      xhr.onerror = function() { loadingEl.remove(); };
      xhr.send();
      return;
    }
    
    // 兼容旧版 SITE_MUSIC_CONFIG.playlist
    var localList = cfg.playlist || window.SITE_PLAYLIST || [];
    if (localList.length) { initLocalPlayer(localList); }`;

if (s.indexOf(oldMetingIf) !== -1) {
  s = s.replace(oldMetingIf, newMetingFetch);
} else {
  console.log('WARNING: old meting if block not found, trying partial match...');
  // 如果上面匹配不到，可能格式有细微差异，试试找 initPlayer 里的第一个 if
  s = s.replace(
    /if \(cfg\.mode === 'meting'[\s\S]{300,5000}?return;\s*?\n\s*?\}/,
    newMetingFetch
  );
}

// 将原来的 initPlayer 内部的 local 模式提取为独立函数 initLocalPlayer
// 把 initPlayer 中的 local 模式代码改为调用 initLocalPlayer
s = s.replace(
  'initLocalPlayer(localList);\n    \n    var LS_IDX = "site_player_idx";',
  'initLocalPlayer(localList); return;\n    \n    function initLocalPlayer(list) {\n    var LS_IDX = "site_player_idx";'
);

// 找到 initLocalPlayer 的结束 (function setPlaying + 拖动代码后)
// 在 } 之前补上 initLocalPlayer 函数的关闭
s = s.replace(
  '    // 兼容旧版 SITE_MUSIC_CONFIG.playlist\n    var localList = cfg.playlist || window.SITE_PLAYLIST || [];\n    if (localList.length) { initLocalPlayer(localList); }\n  }\n\n  /* ---------- 启动 ---------- */',
  '    // 兼容旧版 SITE_MUSIC_CONFIG.playlist\n    var localList = cfg.playlist || window.SITE_PLAYLIST || [];\n    if (localList.length) { initLocalPlayer(localList); }\n  }\n\n  /* ---------- 启动 ---------- */'
);

fs.writeFileSync('assets/site.js', s);
console.log('site.js updated');
