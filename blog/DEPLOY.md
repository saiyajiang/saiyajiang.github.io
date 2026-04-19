# 知识库博客 · GitHub Pages 部署指南

## 文件结构

```
blog/
├── index.html        ← 首页（文章列表+搜索+筛选）
├── about.html        ← 关于页
├── archive.html      ← 归档页
└── posts/
    ├── post-1.html   ← 文章：建立知识体系
    ├── post-2.html   ← 文章：Dota 2 游廊地图入门
    └── ...           ← 后续新增文章放这里
```

---

## 第一步：创建 GitHub 仓库

1. 登录 [github.com](https://github.com)，点击右上角 **"+"** → **New repository**
2. 仓库名建议：`knowledge-base` 或 `blog`（或直接用 `你的用户名.github.io`）
3. 设置为 **Public**（GitHub Pages 免费版需要公开仓库）
4. 不勾选 Initialize，直接创建

---

## 第二步：推送代码到 GitHub

打开终端，进入 `blog/` 文件夹：

```bash
cd C:\Users\resai\WorkBuddy\Claw\blog

# 初始化 git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "🚀 初始化博客"

# 关联远程仓库（把 YOUR_USERNAME 替换成你的 GitHub 用户名，REPO_NAME 替换成仓库名）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 推送
git branch -M main
git push -u origin main
```

---

## 第三步：开启 GitHub Pages

1. 进入仓库页面，点击 **Settings**
2. 左侧找到 **Pages**
3. Source 选择 **Deploy from a branch**
4. Branch 选择 **main**，目录选 **/ (root)**
5. 点击 **Save**

等待约 1-2 分钟，你的博客将在以下地址上线：
```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

如果仓库名就是 `YOUR_USERNAME.github.io`，则直接访问：
```
https://YOUR_USERNAME.github.io/
```

---

## 第四步：如何写新文章

### 1. 复制文章模板

复制 `posts/post-1.html`，重命名为 `posts/post-7.html`（或任意名称）

### 2. 修改文章内容

编辑以下部分：
- `<title>` 标签
- `.post-cat` — 分类标签（改颜色类名）
- `.post-title` — 文章标题
- `.post-meta` — 日期、阅读时间
- `.post-tags` — 标签
- `<article class="post-content">` — 正文内容
- `.post-nav` — 上/下一篇导航链接

### 3. 在首页添加条目

打开 `index.html`，找到 `const articles = [...]` 数组，在最前面添加：

```javascript
{
  id: "post-7",
  featured: false,
  title: "你的文章标题",
  excerpt: "文章摘要，大约 50-80 字",
  cat: "tech",           // tech | finance | game | life | share
  catLabel: "技术",
  date: "2026-04-20",
  tags: ["标签1", "标签2"],
  readTime: "X 分钟",
  href: "posts/post-7.html"
},
```

### 4. 在归档页添加条目

打开 `archive.html`，在列表最前面添加对应条目。

### 5. 推送更新

```bash
git add .
git commit -m "✍️ 新增文章：文章标题"
git push
```

---

## 分类颜色对照

| 分类 | cat 值 | 颜色 |
|------|--------|------|
| 技术 | `tech` | 蓝色 |
| 金融 | `finance` | 绿色 |
| 游戏 | `game` | 粉色 |
| 生活 | `life` | 黄色 |
| 转发精选 | `share` | 紫色 |

---

## 转发他人内容的注意事项

- 在文章标题加 `【转】` 前缀，分类选 `share`
- 正文最开头注明：原文作者、原文链接
- 可以在正文末尾加上你自己的评注，用 `<blockquote>` 标签包裹
- 示例：`<blockquote>编者注：这篇文章让我想到了...</blockquote>`

---

## 常见问题

**Q: 推送后页面显示 404？**  
A: 等待 2-5 分钟，GitHub Pages 部署需要时间

**Q: 本地预览怎么看？**  
A: 直接双击 `index.html` 用浏览器打开即可，无需本地服务器

**Q: 想要自定义域名？**  
A: 在仓库根目录新建 `CNAME` 文件，内容写你的域名，然后在域名商处添加 CNAME 记录指向 `YOUR_USERNAME.github.io`
