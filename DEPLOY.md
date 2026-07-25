# 悲歌的小站 · 维护指南

## 文件结构

```
saiyajiang.github.io/
├── index.html          ← 首页（标签筛选 + 搜索 + 文章列表）
├── archive.html        ← 归档页
├── changelog.html     ← 更新日志
├── about.html          ← 关于页
├── .gitignore
├── sitemap.xml
├── posts/              ← 文章目录
│   ├── template.html   ← 新文章模板（复制后修改）
│   ├── post-7.html
│   └── ...
├── resources/          ← 静态资源（插件、GIF、文档等）
│   ├── plugins/
│   ├── gif/
│   └── ...
```
（无构建步骤，纯静态 HTML，双击 index.html 即可本地预览）

---

## 写新文章

1. **复制模板**：复制 `posts/template.html` → `posts/post-X.html`
2. **修改模板内标记内容**：
   - `<title>`、`.post-title` → 文章标题
   - `.post-meta` 日期、`⏱` 阅读时间
   - `.post-tags` 标签
   - `.post-content` 正文
   - 评论区 `href` 中 `title=` 参数改为文章标题（用于创建对应 Issue）
   - `.post-nav` 上下篇链接
3. **在数据源登记**：打开 `assets/posts.js`，在 `SITE_POSTS` 数组最前面加一项（`title` / `date` / `url` / `tags` / `excerpt`）。首页文章卡片与归档列表会**自动同步**，无需手动改 HTML。
4. **在 changelog.html 添加更新记录**（见下方「更新日志规范」）

> 本站文章列表由 `assets/posts.js` 数据驱动：首页卡片与归档条目都从同一数据源渲染，改 `posts.js` 一处即可，无需在两处重复维护。

## 更新日志规范（每次发布必做）

任何改动上线前，必须在 `changelog.html` 顶部新增一条 `<div class="timeline__item">`（日期用当天），说明本次改了什么。About 页不再重复维护更新记录，统一以 changelog 为准。

---

## 评论功能

使用 GitHub Issues 作为评论系统：
- 每篇文章底部有「去 GitHub 发表讨论」按钮
- 点击后跳转到对应 Issue（URL 中 `title=` 参数即为文章标题）
- 读者用 GitHub 账号登录后即可留言
- Issue 不存在时 GitHub 会自动引导创建

---

## 推送更新

```bash
git add .
git commit -m "✍️ 新增：文章标题"
git push
```

GitHub Pages 会自动部署（约 1 分钟内生效）。
