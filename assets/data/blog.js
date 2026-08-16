/* 博客文章数据 —— 所有博客页面共用 */
window.BLOG_POSTS = [
  {
    title: "使某个程序打开时不显示用户账户控制",
    date: "2026-08-16",
    url: "posts/post-win-1.html",
    tags: ["Windows", "注册表", "UAC", "系统技巧"],
    excerpt: "在 HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers 下添加软件全路径 = RunAsInvoker，让程序以当前用户权限运行，不再弹出 UAC 确认框。",
    readingTime: 1
  },
  {
    title: "重复文件名对比工具",
    date: "2026-08-16",
    url: "posts/post-tool-2.html",
    tags: ["tool", "Windows", "效率工具", "重复文件"],
    excerpt: "查找并清理重复文件：dupeGuru 跨平台开源工具，支持按文件名、内容、图片相似度对比，清理前可预览匹配结果。",
    readingTime: 1
  },
  {
    title: "HTML游戏修改",
    date: "2026-08-16",
    url: "posts/post-htmlgame-1.html",
    tags: ["HTML游戏", "SugarCube", "Twine", "游戏修改"],
    excerpt: "HTML 游戏（Twine + SugarCube 引擎）的变量可通过 State.active.variables.变量名 = 值 直接修改，$变量名 是其简写，两者等价。",
    readingTime: 1
  },
  {
    title: "修改文件名工具",
    date: "2026-08-16",
    url: "posts/post-tool-1.html",
    tags: ["tool", "Windows", "效率工具"],
    excerpt: "批量修改文件名：微软官方开源工具 PowerToys 内置 PowerRename 模块，支持搜索替换、正则表达式、大小写转换、序号追加等，重命名前实时预览。",
    readingTime: 1
  },
  {
    title: "RenPy 标题被修改",
    date: "2026-08-16",
    url: "posts/post-renpy-title.html",
    tags: ["RenPy", "游戏开发", "故障排查"],
    excerpt: "RenPy 游戏标题被修改却找不到修改位置时，检查 \\game\\ 下的 options.rpy，若没有则可能在本地化文件夹 \\game\\tl\\chinese\\ 下的 options.rpy 中被覆盖。",
    readingTime: 1
  },
  {
    title: "好了歌注",
    date: "2026-08-02",
    url: "posts/post-poem-2.html",
    tags: ["诗词", "红楼梦", "好了歌注", "曹雪芹"],
    excerpt: "《红楼梦》甄士隐对跛足道人《好了歌》的注解，写尽世事无常、盛衰轮转，末句与秦韬玉《贫女》呼应。",
    readingTime: 2
  },
  {
    title: "贫女",
    date: "2026-08-02",
    url: "posts/post-poem-3.html",
    tags: ["诗词", "秦韬玉", "贫女", "唐诗"],
    excerpt: "晚唐秦韬玉七言律诗，以贫女自喻写怀才不遇，「为他人作嫁衣裳」成为千古名句。",
    readingTime: 2
  },
  {
    title: "一生所爱",
    date: "2026-07-26",
    url: "posts/post-song-1.html",
    tags: ["歌词", "一生所爱", "大话西游"],
    excerpt: "电影《大话西游》片尾曲，唐书琛作词、卢冠廷作曲，写尽错过与命运。",
    readingTime: 1
  },
  {
    title: "且听风吟",
    date: "2026-07-28",
    url: "posts/post-song-2.html",
    tags: ["歌词", "鸣潮", "且听风吟", "万声弥新"],
    excerpt: "《鸣潮》万声弥新原声带，云之泣演唱，冉语优作词，写风与远方。",
    readingTime: 1
  },
  {
    title: "摸鱼儿·恨人间情是何物",
    date: "2026-07-25",
    url: "posts/post-poem-1.html",
    tags: ["诗词", "元好问", "赏析"],
    excerpt: "金·元好问《摸鱼儿·雁丘词》，因一只大雁殉情而作，成为'情'字的极致表达。",
    readingTime: 2
  },
  {
    title: "NVIDIA APP 怎么也无法更新或卸载？可以尝试删除这个注册表项",
    date: "2026-02-10",
    url: "posts/post-7.html",
    tags: ["Windows", "NVIDIA", "故障排查"],
    excerpt: "记录一次 NVIDIA APP 无法更新与卸载的解决过程，通过删除注册表项解决问题。",
    readingTime: 3
  },
  {
    title: "RPG Maker MV 资源导航页",
    date: "2026-04-01",
    url: "posts/post-old-rpg.html",
    tags: ["RPG-Maker", "插件汉化", "素材", "GIF"],
    excerpt: "RPG Maker MV 相关插件汉化、GIF 素材、脚本资源的整理导航。",
    readingTime: 2
  },
  {
    title: "RPG Maker MV 插件汉化列表",
    date: "2026-04-02",
    url: "posts/post-rpg-1.html",
    tags: ["RPG-Maker", "插件汉化"],
    excerpt: "整理 RPG Maker MV 常用插件的汉化版本列表及下载地址。",
    readingTime: 2
  },
  {
    title: "RPG Maker 事件 GIF 素材汇总",
    date: "2026-03-15",
    url: "posts/post-rpg-2.html",
    tags: ["RPG-Maker", "GIF", "素材"],
    excerpt: "收集整理 RPG Maker 事件系统常用的 GIF 动图素材。",
    readingTime: 1
  },
  {
    title: "RPG Maker MV 常用脚本调用参考",
    date: "2026-03-20",
    url: "posts/post-rpg-3.html",
    tags: ["RPG-Maker", "脚本", "教程"],
    excerpt: "RPG Maker MV 中常用脚本命令的调用方法与参考手册。",
    readingTime: 3
  }
];
