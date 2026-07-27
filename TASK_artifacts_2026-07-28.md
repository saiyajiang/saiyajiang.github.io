# Task: GitHub Pages site.js 冲突修复 (2026-07-28)

## 问题诊断

site.js 从 .bak_20260727 备份恢复后，init() 调用了以下函数，与 index.html / archive.html 的 inline script 冲突：

| site.js 函数 | 依赖元素/类 | 冲突对象 |
|---|---|---|
| renderPosts() | #postList, .post-card | index.html 的 renderArticles() |
| renderArchive() | #archiveList | archive.html 的 inline script |
| renderTags() | #tagCloud, .tag-chip | index.html 的 inline script |
| initFilter() | #postList, .post-card | index.html 的 inline script |
| initArchiveTagNav() | #archiveList | archive.html 的 inline script |

## 修复方案

**设计原则**：各 HTML 页面自己负责渲染（TTS、播放器除外），site.js 只做全局功能。

1. **index.html** 末尾追加：
   ```js
   window.SITE_POSTS = articles.map(function(a){ return {
     title: a.title, date: a.date, tags: a.tags,
     url: a.url, excerpt: a.summary
   }; });
   ```
   使 site.js 的 initTTS() 等全局功能可以访问文章数据。

2. **site.js init()** 中注释掉 5 个冲突函数：
   - renderPosts() → index.html has its own renderArticles()
   - renderArchive() → archive.html has its own inline script
   - renderTags() → each page renders its own tags
   - initFilter() → index.html has its own filter logic
   - initArchiveTagNav() → archive.html has its own

3. **保留的 site.js 全局功能**：initTheme、initToggle、setActiveNav、initTTS、initPlayer、initSidebar

## 验证结果

- index.html: ✅ site.js + style.css 引用正常，window.SITE_POSTS 已设置，themeToggle 存在
- archive.html: ✅ site.js 引用正常，inline script 负责归档渲染
- 其他页面（about, changelog, 8个post）: ✅ site.js 引用正常
- initToggle (theme toggle): ✅ #themeToggle 存在于 index.html
- setActiveNav (nav highlight): ✅ .nav-menu 存在于 index.html，data-page 属性需各页面自行设置
- initSidebar: ✅ 需要 main.page.with-side 结构，不影响无该结构的页面

## 文件变更

- `assets/style.css`: 1126行，265对括号（从 commit 4f70e95 合并备份播放器CSS）
- `assets/site.js`: 793行，恢复完整功能，注释掉5个冲突渲染函数
- `index.html`: +5行（window.SITE_POSTS 映射）

## Git Commit

```
79f830b fix: 恢复完整 site.js + style.css，清理 site.js 渲染函数冲突
```

## 待处理（网络未通，暂未 push）

- GitHub push 失败（443 连接超时，防火墙问题）
- 备份文件清理：~15个 .bak_20260727 文件 + _migrate_posts.ps1（未跟踪）
- 网络恢复后需 git push

## 已知遗留问题

1. **nav 导航高亮**：site.js setActiveNav() 依赖 `body[data-page]`，各 HTML 需加对应属性（index.html 缺）
2. **backToTop**：index.html 有 #backToTop 按钮，site.js 需实现点击逻辑（需检查）
3. **文章页专属样式**：17个 CSS 类（plugin-*, resource-* 等）尚未在新 style.css 中定义
4. **短句占位符**：名言轮播目前是英文技术名言，需替换为更有深度的内容
5. **TTS "朗读出错"**：需二次排查
6. **playlist.json vkey**：QQ 音乐直链 vkey 有时效性，需定期刷新机制
