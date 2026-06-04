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
   - `.post-tags` 标签（与首页 `index.html` 中 `articles` 数组的 tags 保持一致）
   - `.post-content` 正文
   - 评论区 `href` 中 `title=` 参数改为文章标题（用于创建对应 Issue）
   - `.post-nav` 上下篇链接
3. **在首页添加条目**：打开 `index.html`，找到 `const articles = [...]`，在数组**开头**插入：
   ```javascript
   {
     id: "post-X",
     title: "文章标题",
     excerpt: "摘要，50-80 字",
     date: "2026-06-04",
     tags: ["标签1", "标签2"],
     href: "posts/post-X.html"
   }
   ```
4. **在归档页添加**：打开 `archive.html`，在 `.archive-list` 最前面加一条 `<a class="archive-item">...</a>`
5. **在 changelog.html 添加更新记录**

---

## 标签系统

- 标签在每篇文章的 `articles[].tags` 数组和文章页 `.post-tags` 中定义
- 首页会自动提取所有标签生成筛选面板
- 新增标签只需在 `articles[].tags` 里写入，无需其他配置

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
