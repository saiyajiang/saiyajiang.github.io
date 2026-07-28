# 自定义音乐播放器组件

## 概述

纯自定义 HTML + JavaScript 音乐播放器，不依赖 APlayer 等第三方库。

## 功能特性

- **播放控制**：播放/暂停、上一曲、下一曲
- **播放模式**（单按钮循环切换）：
  - ➡️ 顺序播放
  - 🔁 循环全部
  - 🔂 单曲循环
  - 🔀 随机播放
- **音量控制**：滑块调节 0-100%
- **播放列表**：可展开/收起，点击切歌
- **拖动定位**：按住标题栏可拖动播放器位置

## 文件位置

```
assets/site.js      # initPlayer() 函数
assets/style.css    # #custom-player 样式
assets/playlist.json # 歌曲数据源
```

## 核心代码

### HTML 结构
```javascript
wrap.innerHTML = `
  <div class="cp-main">
    <button id="cp-prev">⏮</button>
    <button id="cp-play">▶</button>
    <button id="cp-next">⏭</button>
    <span id="cp-title">点击播放</span>
    <input type="range" id="cp-vol" min="0" max="100" value="50" title="音量">
    <button id="cp-mode" title="顺序播放">➡️</button>
    <button id="cp-listbtn">☰</button>
  </div>
  <div class="cp-list"></div>
`;
```

### 关键样式
```css
#custom-player {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
  background: rgba(20, 20, 24, 0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,.45);
  width: 520px;
  font-size: 14px;
}

.cp-main button {
  width: 36px;
  height: 36px;
  /* ... */
}
```

### 播放模式切换逻辑
```javascript
var playModes = [
  {icon: '➡️', title: '顺序播放', loop: false, shuffle: false},
  {icon: '🔁', title: '循环全部', loop: false, shuffle: false},
  {icon: '🔂', title: '单曲循环', loop: true, shuffle: false},
  {icon: '🔀', title: '随机播放', loop: false, shuffle: true}
];
```

## 数据源格式

`assets/playlist.json`：
```json
[
  {
    "name": "歌曲名",
    "artist": "艺术家",
    "url": "https://...",
    "cover": "https://..."
  }
]
```

## 初始化

在 `assets/site.js` 中：
```javascript
document.addEventListener('DOMContentLoaded', function() {
  initPlayer();
});
```

## 版本历史

- v20260727: 初始版本，替代 APlayer
