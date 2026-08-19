/* 博客文章数据 —— 所有博客页面共用 */
window.BLOG_POSTS = [
  {
    title: "提问的智慧（How To Ask Questions The Smart Way）",
    date: "2026-08-19",
    url: "posts/post-article-1.html",
    tags: ["文章", "提问", "黑客文化", "开源社区", "沟通技巧"],
    excerpt: "Eric S. Raymond 与 Rick Moen 的经典提问指南（中文版，基于原文 3.10 版翻译）：涵盖提问前的准备、慎选提问论坛、使用有意义且描述明确的标题、精确描述问题、如何解读答案、避免扮演失败者、不该问的问题、好问题与蠢问题、如何更好地回答问题等完整章节。",
    readingTime: 12
  },
  {
    title: "别像弱智一样提问",
    date: "2026-08-19",
    url: "posts/post-article-2.html",
    tags: ["文章", "提问", "社区礼仪", "沟通"],
    excerpt: "以辛辣幽默的方式列出提问前须知：Free 的正确翻译是「自由」而非「免费」，愿意回答问题的人都是可爱的人，向帮助你的人付费是高尚行为；学会搜索与英文、礼貌、准确描述问题、画关键字、贴图与圈重点，附「萌新滚粗」对比表。",
    readingTime: 2
  },
  {
    title: "Wallpaper Engine部分壁纸黑屏的解决方法",
    date: "2026-08-19",
    url: "posts/post-tool-3.html",
    tags: ["tool", "WallpaperEngine", "壁纸", "LAV", "故障排查"],
    excerpt: "Wallpaper Engine 部分壁纸（尤其是视频壁纸）黑屏，多为视频解码器缺失所致：下载并安装 LAV Filters 的 x86 与 x64 版本（GitHub / Fosshub 镜像），安装时以管理员权限运行，完成后重启 Wallpaper Engine 即可；安装后仍黑屏可尝试重启电脑。",
    readingTime: 2
  },
  {
    title: "NS手柄蓝牙连接后马上断开",
    date: "2026-08-17",
    url: "posts/post-game-2.html",
    tags: ["游戏", "故障排查", "NS", "Switch", "手柄", "蓝牙"],
    excerpt: "NS（Switch）手柄在电脑上蓝牙连接后马上断开：已打开的 NS 模拟器（Switch 模拟器）会抢占手柄直驱通道，在 设置-控制 中取消勾选「Joycon 直接驱动」和「Pro Controller 直接驱动」两项即可正常使用。",
    readingTime: 1
  },
  {
    title: "Chrome扩展程序ManifestV2临时方案",
    date: "2026-08-16",
    url: "posts/post-win-5.html",
    tags: ["Chrome", "浏览器", "注册表", "ManifestV2", "扩展程序"],
    excerpt: "Chrome 提示「此扩展程序未遵循最佳实践」时，可通过注册表策略临时恢复 ManifestV2 支持：在 HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Google\\Chrome 下新建 DWORD ExtensionManifestV2Availability 并设为 2，再到 chrome://policy/ 重新加载政策。",
    readingTime: 1
  },
  {
    title: "Win11记事本不显示下划线",
    date: "2026-08-16",
    url: "posts/post-win-4.html",
    tags: ["Windows", "记事本", "字体", "故障排查"],
    excerpt: "Win11 记事本中文字符不显示下划线：默认的微软雅黑 11 号配合 4K + 150% 缩放显示会导致，换个字体或字号即可解决。",
    readingTime: 1
  },
  {
    title: "Edge浏览器屏蔽广告hosts",
    date: "2026-08-16",
    url: "posts/post-win-3.html",
    tags: ["Edge", "浏览器", "hosts", "广告屏蔽", "Windows"],
    excerpt: "通过修改 hosts 文件屏蔽 Edge 新标签页的 MSN 广告与数据上报域名：将 api.msn.com / pipe.aria.microsoft.com / ntp.msn.com 等域名指向 0.0.0.0，含国内 msn.cn 域名，附操作步骤。",
    readingTime: 1
  },
  {
    title: "雪花引擎相关设置",
    date: "2026-08-16",
    url: "posts/post-game-1.html",
    tags: ["游戏", "性能优化", "SnowDROP", "雪花引擎", "EAC"],
    excerpt: "雪花引擎（SnowDROP）性能优化：graphic settings.cfg 中 streamer dedicated budget 控制显存占用、streamer memory fraction 控制显存百分比、taa 禁用视觉性能消耗；注册表将 EasyAntiCheat 的 ErrorControl 设为 0 防卡顿，服务改为手动。",
    readingTime: 2
  },
  {
    title: "运行JAR文件提示Error: Unable to access jarfile",
    date: "2026-08-16",
    url: "posts/post-java-1.html",
    tags: ["Java", "JAR", "故障排查"],
    excerpt: "运行 JAR 文件提示 Error: Unable to access jarfile，网上其他方法都不成功时，可检查文件夹名是否为单个特殊字符（中文字符有时也会被判定为特殊字符），可能导致 java 读取失败，重命名文件夹即可解决。",
    readingTime: 1
  },
  {
    title: "暗黑4中文语言+英文语音修改方法",
    date: "2026-08-16",
    url: "posts/post-diablo4-1.html",
    tags: ["暗黑4", "Diablo4", "游戏", "语言设置"],
    excerpt: "在战网启动选项输入 -locale zhCN（简体）/ -locale zhTW（繁体）即可切换中文界面，2025年12月14日更新后可用。",
    readingTime: 1
  },
  {
    title: "解决游戏左侧的黑色方框",
    date: "2026-08-16",
    url: "posts/post-nvidia-1.html",
    tags: ["NVIDIA", "游戏", "显卡", "故障排查"],
    excerpt: "游戏左侧黑色方框是 NVIDIA Reflex 分析仪的 LDAT 支持（始终显示 Reflex 闪存指示器）开启导致：Alt+Z 呼出 N 卡菜单 → 统计数据 → Reflex 分析仪 → 关闭 LDAT 支持。",
    readingTime: 1
  },
  {
    title: "程序优先级",
    date: "2026-08-16",
    url: "posts/post-win-2.html",
    tags: ["Windows", "注册表", "系统技巧", "性能"],
    excerpt: "在 HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\程序全名\\PerfOptions 下设置 CpuPriorityClass / IoPriority / PagePriority，为程序固定 CPU、IO、页面优先级。",
    readingTime: 1
  },
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
