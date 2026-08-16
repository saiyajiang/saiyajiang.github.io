/* 更新日志数据 */
window.CHANGELOG_DATA = [
  {
    date: '2026-08-16',
    hash: 'feat',
    title: '新增文章：重复文件名对比工具',
    desc: '发布《重复文件名对比工具》效率工具笔记：推荐跨平台开源工具 dupeGuru，支持按文件名、内容、图片相似度对比查找重复文件，清理前可预览匹配结果；附 GitHub 仓库与官网链接。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-16',
    hash: 'feat',
    title: '新增文章：HTML游戏修改',
    desc: '发布《HTML游戏修改》技术笔记：Twine + SugarCube 引擎的 HTML 游戏可通过 State.active.variables.变量名 = 值 直接修改变量，$变量名 是其简写，两者等价；覆盖数字/字符串/布尔赋值与浏览器控制台、Story JavaScript 等使用场景。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-16',
    hash: 'fix',
    title: '修正《修改文件名工具》文章结构与链接命名',
    desc: '修正文章结构：PowerRename 为 PowerToys 内置模块，二者是包含关系而非并列方案，文章改为单一方案结构。文章链接按既有 post-<类别>-<序号> 命名规律重命名为 post-tool-1.html，同步更新 blog.js 与导航链接。',
    tags: ['Fix', 'Doc']
  },
  {
    date: '2026-08-16',
    hash: 'feat',
    title: '新增文章：修改文件名工具',
    desc: '发布《修改文件名工具》效率工具笔记：批量修改文件名推荐微软官方开源工具 PowerToys，其内置 PowerRename 模块支持搜索替换、正则表达式、大小写转换、序号追加等，重命名前实时预览；附官方仓库与官方文档链接。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-16',
    hash: 'feat',
    title: '新增文章：RenPy 标题被修改',
    desc: '发布《RenPy 标题被修改》技术排查笔记：RenPy 游戏标题被修改却找不到修改位置时，先检查 \\game\\ 下的 options.rpy（config.name / gui.title），若没有则可能在本地化文件夹中被覆盖，一般在 \\game\\tl\\chinese\\ 下的 options.rpy。说明本地化文件会覆盖主脚本标题设置，修改时需两处同步。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-13',
    hash: 'feat',
    title: '数据库迁移至 db/ 子目录并改为多游戏板块架构',
    desc: '数据库页面整体迁移到独立目录 db/（db/index.html + db/db.css + db/db.js + db/data/games.js），删除根目录旧版 db.html 及 assets/db.css、assets/db.js。数据源改为 window.GAME_DB 多游戏板块结构（game → categories → items），每个游戏一个独立板块，板块切换、搜索、分类筛选、卡片/表格双视图、统计图表均按当前板块动态渲染。不再引用 wiki.js / quotes.js。db/data/games.js 内置模板示例，后续游戏整理内容按模板追加即可。',
    tags: ['New', 'Refactor']
  },
  {
    date: '2026-08-13',
    hash: 'feat',
    title: '新增独立知识数据库页 db.html（类 Notion 交互式看板）',
    desc: '新建 db.html + assets/db.css + assets/db.js：独立于个人站终端风的深色科幻仪表盘设计。复用 assets/data/ 下 wiki.js/quotes.js/site-config.js 数据源，实现统计概览（环形图分类占比、柱状图条目分布）、全文搜索（/ 快捷键聚焦）、分类 chip 筛选、卡片/表格双视图切换、条目点击展开详情、底部分类 Dock 快捷导航。纯静态实现，无构建步骤，不依赖外部图表库。',
    tags: ['New', 'UI']
  },
  {
    date: '2026-08-02',
    hash: 'fix',
    title: '修复 Quotes 页滚动条、返回首页、数据合并与引文',
    desc: 'CSS：添加 [data-page="quotes"] .content-main max-height:none + overflow-y:visible 修复双滚动条。渲染：site.js renderQuotesPage 移除"返回首页"链接，摘抄与短语统一单列表渲染。数据：quotes.js 全部 type 合并为"摘抄"，鲍勃·迪伦引文修正为"昔日我如此苍老，如今才风华正茂。"。',
    tags: ['Fix', 'Doc']
  },
  {
    date: '2026-08-02',
    hash: 'refactor',
    title: '全站模块化数据驱动重构',
    desc: '数据层拆分：创建 assets/data/ 目录，提取 blog.js/quotes.js/wiki.js/changelog.js/site-config.js 五个独立数据文件。渲染引擎：增强 assets/site.js 实现 renderBlogList/renderArchiveList/renderQuotesPage/renderWikiPage/renderChangelogPage 统一渲染。页面精简：所有 HTML 页面改为 shell 模板，body 保留 main#app 容器 + data-page 属性，由 site.js 检测后动态渲染。CSS 整理：style.v2.css 新增 .quote-item/.wiki-section/.changelog-entry 等数据驱动配套样式。',
    tags: ['Refactor']
  },
  {
    date: '2026-08-02',
    hash: 'chore',
    title: '清理首页残留的摘抄文章引用',
    desc: 'index.html 移除 articles 数组中8篇摘抄文章条目，更新分类计数（literature: 11→3，总计: 14→6），fortune 随机卡片改为直接引用 quotes.html 的摘抄与短语数据。',
    tags: ['Chore']
  },
  {
    date: '2026-08-02',
    hash: 'feat',
    title: '短语拾遗新增17条（Killing Eve/Humans/Sweetbitter）',
    desc: 'quotes.html 短语拾遗区追加 Killing Eve（6条）、Humans（4条）、Sweetbitter（7条）共17条中英双语句子，计数器更新为41条。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-02',
    hash: 'chore',
    title: '删除已迁移至 quotes 的摘抄文章，清理 wiki 返回首页',
    desc: '删除 8 篇已统一迁移至 quotes.html 的摘抄文章（post-quote-1~8.html）及 posts.js 中对应条目；移除 wiki 页面重复的"返回首页"链接。',
    tags: ['Chore']
  },
  {
    date: '2026-08-02',
    hash: 'fix',
    title: 'quotes 页面导航栏 about/quotes 顺序与其他页面对齐',
    desc: 'quotes.html 导航栏中 ~/about 与 ~/quotes 的顺序修正为与其他页面一致（blog → archive → wiki → about → quotes → changelog）。',
    tags: ['Fix']
  },
  {
    date: '2026-08-02',
    hash: 'feat',
    title: '新增 ~/quotes 摘抄短语聚合页',
    desc: '新建 quotes.html 统一展示8篇摘抄与24条短语拾遗，延续 terminal 暗色风格与三列 grid 布局；全站导航栏新增 ~/quotes 入口。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-02',
    hash: 'wiki',
    title: '短语拾遗新增15条（了不起的麦瑟尔女士 + 西部世界）',
    desc: '短语拾遗板块新增15条台词短语：《了不起的麦瑟尔女士》9条（女人/狗粮/抽烟/不叫生活/不开心/不听人讲话/充满失望/留下来/享受当下）+《西部世界》6条（记得你/正常与疯狂/存在的本质/联手幸存/大愿成真/算法），均附中英双语对照。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-02',
    hash: 'fix',
    title: 'wiki 三列 grid 布局，主内容居中',
    desc: 'wiki 页面主 wrapper 改为 grid 三列（1fr main-width 1fr），content-main 独占中列居中，侧栏挂左列靠右，不再整体偏移。',
    tags: ['Fix', 'CSS']
  },
  {
    date: '2026-08-02',
    hash: 'fix',
    title: 'wiki 侧栏 sticky 固定 + 回到顶部按钮',
    desc: 'wiki 页面左侧目录侧栏改为 sticky 定位，点击目录跳转后侧栏不离屏；补齐 site.js 中回到顶部按钮的滚动显隐与平滑滚动逻辑。',
    tags: ['Fix', 'CSS', 'JS']
  },
  {
    date: '2026-08-02',
    hash: 'fix',
    title: '修复 wiki 多余滚动条及锚点偏移',
    desc: '移除 wiki 页面 .content-main 的 max-height 限制避免双层滚动条；为 h2 添加 scroll-margin-top 避免锚点跳转后标题被 sticky header 遮挡。',
    tags: ['Fix', 'CSS']
  },
  {
    date: '2026-08-02',
    hash: 'feat',
    title: '短语拾遗新增哥林多前书13:11',
    desc: '短语拾遗板块新增一条：哥林多前书13:11（中文译文 + KJV 英文原文），出自圣经新约。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-02',
    hash: 'wiki',
    title: 'Wiki 新增：短语拾遗（8条）',
    desc: '新增短语拾遗板块：收录 8 条名言/台词（佚名·利益与道德、里根·推倒这堵墙、马基雅维利·骗过骗子、极寒之城·事实与谎言、神秘博士 S01E06、神秘博士·永恒水晶山、王尔德·春风得意的朋友、佚名·百行孝为先），均标注出处。位于取名礼俗与神话与民俗之间。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-02',
    hash: 'fix',
    title: '短语拾遗出处修正：两条佚名条目更正出处',
    desc: '「良心是唯一不能放弃的利益」出处从"佚名/网络流传"修正为"网络流传（确无明确出处）"；「百行孝为先」出处从"佚名"修正为"王永彬《围炉夜话》"。',
    tags: ['Fix']
  },
  {
    date: '2026-08-02',
    hash: 'fix',
    title: '修复引用块配色可读性',
    desc: 'blockquote 蓝色背景改为半透明（rgba 替换），文字颜色提亮，解决深蓝色背景上深色文字对比度不足的问题。',
    tags: ['Fix', 'UI']
  },
  {
    date: '2026-08-02',
    hash: 'wiki',
    title: 'Wiki 页面新增段落锚点链接与左侧目录导航',
    desc: 'wiki/index.html 每个分类标题新增锚点 id，支持直接跳转到具体段落。新增左侧固定目录导航栏，实时高亮当前阅读位置。',
    tags: ['New', 'UI']
  },
  {
    date: '2026-08-02',
    hash: 'migrate',
    title: '评论系统从 GitHub Issues 迁移至 GitHub Discussions',
    desc: '将全站 16 篇文章页面的评论链接从 GitHub Issues 迁移至 GitHub Discussions，统一使用 Discussions 的 General 分类。',
    tags: ['Fix']
  },
  {
    date: '2026-08-02',
    hash: 'wiki',
    title: 'Wiki 新增：取名礼俗',
    desc: '新增取名礼俗板块：取名出处（女诗经、男楚辞、文论语、武周易）、取名忌讳（国名/山川/职官/疾病/畜生）、时代流变（秦汉至唐前单名为贵、北宋后字辈双名、民国后单名复兴）。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-02',
    hash: 'wiki',
    title: 'Wiki 新增：C.O.D 死亡原因 + 汉字偏旁部首归类',
    desc: '行话与缩写分类新增 C.O.D（Cause of Death）死亡原因缩写条目，含 MOD / TOD 相关缩写说明。字义辨析分类新增偏旁部首归类表（王/玉部·乐器、鬼部·精怪、囗部·拘禁、鸟部·禽鸟、虫部·害虫），共 20 个汉字。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-08-02',
    hash: 'fix',
    title: '短语"百行孝为先…"出处改回佚名',
    desc: '「百行孝为先，论心不论迹，论迹贫家无孝子」出处从"王永彬《围炉夜话》"改回"佚名"，经查证该句并非《围炉夜话》原文。',
    tags: ['Fix']
  },
  {
    date: '2026-08-02',
    hash: 'style',
    title: '引用块颜色统一为橙色系',
    desc: 'blockquote 配色从蓝色系统一改为橙色系，提升视觉一致性。',
    tags: ['UI']
  },
  {
    date: '2026-08-02',
    hash: 'wiki',
    title: '诗词典故新增《好了歌注》与《贫女》',
    desc: '诗词典故分类新增《好了歌注》（清·曹雪芹《红楼梦》）和《贫女》（唐·秦韬玉），含经典名句与出处说明。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-07-28',
    hash: 'fix',
    title: '修复 fortune 卡片点击跳转',
    desc: '移除 fortune 卡片链接的 target="_blank" 属性，修复点击条目时错误地在新建标签页打开首页而非对应文章页的问题。',
    tags: ['Fix']
  },
  {
    date: '2026-07-28',
    hash: 'fortune',
    title: '右侧栏 fortune 卡片增加刷新与跳转',
    desc: '右侧栏 fortune 卡片新增 [↻] 刷新按钮（纯 JS 局部重抽）。条目文字改为可点击链接：wiki 条目跳转到 wiki/index.html 对应分类锚点，摘抄文章跳转到对应 post 页面。更新 wiki/index.html 分类锚点 id，wiki-data.js 每条增加 url 字段。同步 style.v2.css 按钮和链接样式。',
    tags: ['UI', 'JS']
  },
  {
    date: '2026-07-28',
    hash: 'layout',
    title: '首页布局优化 + 右侧栏随机展示',
    desc: '首页中间区域添加 max-height 限制并启用内部滚动，三栏高度对齐。右侧栏改为随机展示：从 8 篇摘抄文章和 42 条 wiki 条目（共 50 条）中随机抽取，终端风 $ fortune 卡片，每次刷新切换。新增 assets/wiki-data.js 数据文件。',
    tags: ['UI', 'New']
  },
  {
    date: '2026-07-28',
    hash: 'wiki',
    title: '新增 wiki 笔记专区',
    desc: '新建 wiki/index.html，将零散知识点按 8 个分类整理为百科式笔记：佛学典故、诗词典故、成语习语、字义辨析（听）、医学与心理、行话与缩写、神话与民俗、词源拾零。更新 index.html / archive.html / changelog.html 导航栏及 sitemap.xml。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-07-28',
    hash: 'fix',
    title: '摘抄文章标签补充出处',
    desc: '为 8 篇摘抄文章追加出处标签：post-quote-1 追加「鲍勃·迪伦」「My Back Pages」、post-quote-2 追加「乔治·奥威尔」、post-quote-3 追加「网络流传」、post-quote-4 追加「黄启远」「春风秋水辞」、post-quote-5 追加「邪恶」「Evil」、post-quote-6 追加「倩女幽魂II」、post-quote-7 追加「坏家伙们」、post-quote-8 追加「朱利安·巴恩斯」「终结的感觉」。同步更新 posts.js、index.html（含标签云）、archive.html。修复 post-quote-8 导航中残留的「影视台词三则」标题。',
    tags: ['Fix']
  },
  {
    date: '2026-07-28',
    hash: 'fix',
    title: '拆分影视台词三则 + 修复摘抄卡片摘要显示',
    desc: '将《影视台词三则》拆分为 3 篇独立文章（post-quote-5 邪恶、post-quote-6 倩女幽魂II、post-quote-7 坏家伙们），原《历史》顺延为 post-quote-8。修复所有 8 篇摘抄文章的 excerpt 字段，改为直接引用原文而非描述性文字。文章总数 16 篇。',
    tags: ['Fix', 'Doc']
  },
  {
    date: '2026-07-28',
    hash: 'fix',
    title: '统一短文章标题为「摘抄」并精简标签',
    desc: '将 post-quote-1 至 post-quote-6 共 6 篇文章的标题统一改为「摘抄」，标签精简为单个「摘抄」标签，同步更新 posts.js、index.html、archive.html 中的对应数据。',
    tags: ['Fix']
  },
  {
    date: '2026-07-28',
    hash: 'quotes',
    title: '新增 6 篇名句/诗词/台词短文章',
    desc: '新增《昔日我曾苍老》《讲真话》《无名情话》《春风秋水辞》《影视台词三则》《历史》六篇文章，涵盖鲍勃·迪伦、奥威尔误传、伪林徽因语录、黄启远诗词、影视台词、朱利安·巴恩斯等。每篇补充准确出处。文章总数 14 篇。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-07-28',
    hash: 'fix',
    title: '修复首页文章缺失与歌词页可读性',
    desc: '修复 index.html 内联文章数组遗漏新条目导致首页不显示《且听风吟》。歌词页 blockquote 背景色与文字对比度不足，替换为 .lyric-block 组件，深色背景 + 高亮文字确保清晰可读。',
    tags: ['Fix', 'UI']
  },
  {
    date: '2026-07-28',
    hash: 'cleanup',
    title: '项目结构整理',
    desc: '清理 assets/ 目录：移除未使用的 APlayer/Meting 第三方库（已被自定义播放器替代），归档历史备份文件至 .backup/，删除空 vendor/ 目录。',
    tags: ['Fix']
  },
  {
    date: '2026-07-28',
    hash: 'newsong2',
    title: '新增文章：且听风吟（歌词）',
    desc: '新增《且听风吟》歌词页，收录《鸣潮》万声弥新原声带（云之泣演唱、冉语优作词、王谢波作曲、jixwang 编曲）。文章总数 8 篇。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-07-28',
    hash: 'melodybox',
    title: '播放器独立发布：MelodyBox v1.0',
    desc: '将站内自定义音乐播放器提取为独立开源组件 MelodyBox。纯原生 JS + CSS，零依赖，支持顺序/循环/单曲循环/随机四种播放模式、音量滑块、播放列表、自由拖拽。附带完整 demo.html 和 README 使用文档。',
    tags: ['New', 'Feature']
  },
  {
    date: '2026-07-28',
    hash: '670cd70',
    title: '项目结构清理与规范',
    desc: '根目录整理：备份文件归入 .backup/、临时脚本归入 scripts/、过程文档归入 docs/。更新 .gitignore 规则。',
    tags: ['Fix']
  },
  {
    date: '2026-07-27',
    hash: 'abcd123',
    title: '全局音乐播放器重写为纯自定义组件',
    desc: '彻底弃用 APlayer/Meting.js 第三方库，改为纯原生 HTML + Audio API 实现的自定义播放器。新增功能：播放模式切换（顺序/循环全部/单曲循环/随机，单按钮循环）、音量滑块、可拖动定位、可展开播放列表。',
    tags: ['New', 'Feature', 'Fix', 'UI']
  },
  {
    date: '2026-07-26',
    hash: 'ef56789',
    title: 'TTS 进度条修复 + 全局音乐播放器',
    desc: '朗读进度条改为基于时间推算，解决长文本 boundary 事件不触发导致进度不动的问题；自动优选中文神经网络嗓音。新增全局音乐播放器（右下角），读取 assets/playlist.js 播放列表，支持跨页面续播。',
    tags: ['New', 'Fix']
  },
  {
    date: '2026-07-26',
    hash: '9012abc',
    title: '新增文字朗读功能（AI 读文字）',
    desc: '文章页新增浮动朗读控件，基于浏览器 Web Speech API（speechSynthesis）朗读中文全文，支持播放/暂停/继续、进度条与字符级进度。纯前端实现，无需密钥或后端，契合 GitHub Pages 静态限制。',
    tags: ['New', 'Feature']
  },
  {
    date: '2026-07-26',
    hash: '345def6',
    title: '新增文章：一生所爱（歌词）',
    desc: '新增《一生所爱》歌词页，收录电影《大话西游》片尾曲全文（唐书琛作词、卢冠廷作曲）。文章总数 7 篇、标签 15 个。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-07-25',
    hash: '789ghij',
    title: '数据驱动重构 + 首页统计修复 + 新增文章',
    desc: '全站重构：抽离共用 assets/style.css 与 assets/site.js，文章列表改为 posts.js 数据驱动。新增《摸鱼儿·恨人间情是何物》诗词赏析文章。修复 posts.js 语法错误导致首页统计显示 0 的问题。',
    tags: ['New', 'UI', 'Fix']
  },
  {
    date: '2026-06-04',
    hash: '012klmn',
    title: '全站 UI 统一',
    desc: '首页/关于/归档/日志四个页面统一为新设计语言：动态背景光球、顶部彩虹装饰条、文章卡片动画、毛玻璃导航栏。所有外部链接改为新标签打开。',
    tags: ['New', 'UI', 'Fix']
  },
  {
    date: '2026-05-06',
    hash: '345opqr',
    title: '改版：个人博客风格',
    desc: '从工具导航站改版为个人博客，删除测试文章，标签改为下拉收纳式，统一配色为深色主题 + 绿紫色调。',
    tags: ['New', 'UI']
  },
  {
    date: '2026-04-29',
    hash: '678stuv',
    title: 'NVIDIA APP 注册表修复文章',
    desc: '发布《NVIDIA APP 怎么也无法更新或卸载？可以尝试删除这个注册表项》，记录注册表路径与操作步骤。',
    tags: ['New', 'Doc']
  },
  {
    date: '2026-04-19',
    hash: '901wxyz',
    title: '博客迁移 + RPG Maker 内容整合',
    desc: '将博客从子目录迁移至根目录，整合原有 RPG Maker 插件/素材页面，新增更新日志页面。',
    tags: ['Fix', 'Doc']
  },
  {
    date: '2026-04-01',
    hash: '234abcd',
    title: '博客上线',
    desc: '基于 GitHub Pages 搭建个人博客，发布 RPG Maker MV 资源导航、插件汉化列表、GIF 素材汇总、脚本调用参考等文章。',
    tags: ['New']
  }
];