# 网站全站重构 + 标签筛选打通 · 2026-07-25

## 目标
大幅重做网站视觉，加亮/暗双主题（默认深色），优化结构方便后续扩展，并打通全站标签筛选功能。

## 已完成工作

### 一、共用设计系统（新建）
- `assets/style.css`（22KB）：双主题令牌（深色默认）、动态背景光球、毛玻璃导航、统一组件库
- `assets/site.js`（7.5KB）：主题切换（含防闪烁初始化）、数据渲染、搜索+标签筛选、URL 参数预选
- `assets/posts.js`（1KB）：文章数据唯一源，首页+归档共用，以后新增文章只改此文件

### 二、首页体系四页重写
- `index.html`：引用共用 CSS、数据驱动文章列表、搜索+标签云多选、统计自动计算
- `archive.html`：统一导航+主题切换、归档列表数据渲染、标签可点跳回首页筛选
- `about.html`：统一视觉、版块类名对齐新系统、评论步骤复用 steps 组件
- `changelog.html`：统一视觉、时间线类名对齐新系统、标签徽章样式

### 三、文章页统一（5篇 + 模板）
- 用脚本统一转换：去内联样式、引用共用 CSS、统一导航+主题切换、加环境背景、类名对齐
- 补充文章专属组件样式：`plugin-*`、`resource-*`、`cmd-*`、`download-box`、`note-box`、`post-nav-label/title`
- 旧变量别名兼容：`--bg-card`、`--text-primary`、`--border-hover`
- 修 post-old-rpg 死链（上一篇从占位 post-1 改为实际相邻的 post-rpg-3）
- 修 post-rpg-3 死链（xlsx 路径从 `../Rpgmaker/` 改为 `../resources/`）

### 四、标签筛选全站打通
- **词表统一**：posts.js、文章页、归档三处标签名一致（RPG-Maker、插件汉化、NVIDIA 等）
- **首页筛选增强**：
  - 卡片内标签可直接点选（阻止跳转文章，触发筛选）
  - 支持 `?tag=xxx` URL 参数预选（来自文章页/归档页的标签点击）
- **归档页标签**：点击跳转首页并带上 `?tag=` 参数，自动筛选
- **文章页标签**：链接改为 `../index.html?tag=标签名`，点击跳回首页自动选中

### 五、其他
- `sitemap.xml`：所有 `<lastmod>` 更新为 2026-07-25
- 死链检查：只剩模板占位符 `post-X/post-Y`，符合预期
- 模板 `template.html` 已更新，未来新文章可直接复制使用

## 待用户操作
1. **删除临时脚本**（被安全策略拦截，需你在界面弹窗点确认）：
   - `C:\Users\resai\_restyle_posts.py`（文章页转换工具，已无用）
   - `C:\Users\resai\_linkcheck.py`（死链检查工具，已无用）
2. **Git 提交推送**：工作区已有本地修改，`git add . && git commit -m "全站重构：双主题+统一设计系统+标签筛选打通" && git push` 上线

## 文件变更摘要
- 新建：`assets/style.css`、`assets/site.js`、`assets/posts.js`
- 重写：`index.html`、`archive.html`、`about.html`、`changelog.html`
- 转换：`posts/post-7.html`、`post-old-rpg.html`、`post-rpg-1/2/3.html`、`template.html`
- 更新：`sitemap.xml`
- 新增组件样式：`.plugin-*`、`.resource-*`、`.cmd-*`、`.download-box`、`.note-box`、`.post-nav-label/title`、`.archive-tag` hover 等

## 扩展性
- 新增文章：编辑 `assets/posts.js` 数组添加一项，首页和归档自动更新
- 新增页面：复制 `index.html` 结构，引用 `assets/style.css` + `posts.js` + `site.js`
- 调整主题：修改 `assets/style.css` 中的 `:root` / `[data-theme="light"]` 令牌即可

---
*重构完成。网站视觉统一、数据驱动、标签筛选全站可用。*
