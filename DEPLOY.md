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
3. **在首页添加卡片**：打开 `index.html`，找到 `<div class="post-list" id="postList">`，在其中**复制一个已有的 `<a class="post-card" ...>` 块**并修改：
   - `href="posts/post-X.html"`
   - `data-tags="标签1 标签2"`（空格分隔，驱动标签筛选；与卡片内 `.post-card-tag` 保持一致）
   - `.post-card-date` 日期、`.post-card-title` 标题、`.post-card-excerpt` 摘要
   - 卡片内的 `.post-card-tag` 标签文字
4. **在归档页添加**：打开 `archive.html`，在 `.archive-list` 最前面加一条 `<a class="archive-item" ...>...</a>`（结构参考已有条目）
5. **在 changelog.html 添加更新记录**

> ⚠️ 注意：本站文章列表是**写死在 `index.html` 的静态 HTML 卡片**，不存在 `const articles` 数组。新增/修改文章必须同步改 `index.html` 的 `.post-card` 块与 `archive.html` 的 `.archive-item` 条目，否则首页/归档不会更新。

---

## 标签系统

- 标签通过首页每张卡片的 `data-tags="标签1 标签2"`（空格分隔）与卡片内 `.post-card-tag` 文字定义，文章页的 `.post-tags` 仅作展示
- 首页根据 `data-tags` 做筛选；顶部标签云是 `#tagCloud` 里静态的 `<button class="tag-btn" data-tag="...">` 按钮
- 新增标签：在卡片 `data-tags` 与 `.post-card-tag` 写入即可参与筛选；要让它出现在标签云，再在 `#tagCloud` 加一个对应的 `tag-btn` 按钮

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
