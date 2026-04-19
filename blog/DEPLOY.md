# 知识库博客 · 使用指南

## 文件结构

```
blog/
├── index.html        ← 首页（标签筛选 + 搜索 + 文章卡片）
├── about.html        ← 关于页（含评论说明）
├── archive.html      ← 归档页
├── DEPLOY.md         ← 本文件
└── posts/            ← 文章目录
    ├── post-1.html   ← 文章模板
    └── ...
```

---

## 文章管理

### 写新文章

1. **复制模板**：复制 `posts/post-1.html`，重命名为 `posts/post-X.html`

2. **修改内容**：
   - 修改 `<title>`、`.post-title`、日期、阅读时间
   - 修改 `.post-tags` 里的链接（指向 `../index.html`）
   - 修改 `.post-nav` 的上/下篇链接
   - 修改评论区 `href` 的 Issue 标题参数

3. **在首页添加**：打开 `index.html`，找到 `const articles = [...]`，在数组开头添加：

```javascript
{
  id: "post-X",
  title: "文章标题",
  excerpt: "摘要，大约50-80字",
  date: "2026-04-20",
  tags: ["标签1", "标签2"],   // 任意多个标签
  readTime: "5 分钟",
  href: "posts/post-X.html"
}
```

4. **在归档页添加**：打开 `archive.html`，在列表最前面加一个条目

5. **推送**：
```bash
git add .
git commit -m "✍️ 新增：文章标题"
git push
```

---

## 标签系统

### 可用标签（可自行添加）
- 学习方法、知识管理、思维、Dota2、游戏开发、Lua
- Python、量化投资、金融、Git、工程实践
- RPG-Maker、插件汉化、素材、GIF、脚本、教程
- 转发、成长

### 添加新标签
直接在文章的 `tags` 数组里写标签名，首页会自动出现该标签的筛选按钮。

---

## 评论功能

使用 GitHub Issues 作为评论系统：

- 每篇文章底部有「去 GitHub 发表讨论」按钮
- 点击后跳转到对应 Issue 页面（Issue 标题含文章名）
- 读者无需安装任何插件，直接用 GitHub 账号评论

### 手动创建 Issue
如果按钮跳转的 Issue 不存在，GitHub 会自动引导创建。

---

## 常见问题

**Q: 为什么选 GitHub Issues 而不是其他评论系统？**
A: 无需后端、无需数据库、永久保存、与仓库集成、免费。不需要登录任何第三方账号。

**Q: 如何删除旧评论？**
A: 在 GitHub 仓库的 Issues 页面，直接关闭或删除对应 Issue 即可。

**Q: 本地预览？**
A: 直接双击 `index.html` 用浏览器打开即可，无需服务器。
