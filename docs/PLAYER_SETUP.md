# 播放器配置记录

## 当前方案 (2026-07-27)

### 核心配置
- `fixed: false` - 禁用 APlayer 内置固定定位
- 自定义容器 `#aplayer-wrap` 绝对定位
- 手动控制位置、列表方向、拖动

### 关键代码位置
**site.js** (~line 345-395):
```javascript
var wrap = document.createElement('div');
wrap.id = 'aplayer-wrap';
document.body.appendChild(wrap);

// 自定义定位容器
wrap.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:9999;width:360px;';

var ap = new APlayer({
  container: wrap,
  fixed: false,
  listFolded: true,
  listMaxHeight: '300px',
  // ...
});

// 列表向上展开
setTimeout(function(){
  var list = wrap.querySelector('.aplayer-list');
  if (list) list.style.cssText = 'position:absolute;left:0;right:0;bottom:100%;top:auto;max-height:300px;overflow-y:auto;';
}, 100);

// 拖动逻辑绑定 wrap
```

### 已知问题待修复
- [ ] 列表按钮点击无法展开
- [ ] 拖动不灵敏/无法自由拖动
