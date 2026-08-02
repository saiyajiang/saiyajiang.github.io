/* 站点全局配置 */
window.SITE_CONFIG = {
  title: "悲歌的小站",
  author: "悲歌",
  description: "随便写写，记录一些东西。游戏开发、编程随笔、折腾记录，以及偶尔的一些碎碎念。",
  themeColor: "#10b981",
  github: "https://github.com/saiyajiang",
  repo: "https://github.com/saiyajiang/saiyajiang.github.io",
  discussionUrl: "https://github.com/saiyajiang/saiyajiang.github.io/discussions",

  /* 导航菜单 */
  nav: [
    { label: "~/blog",     href: "index.html",         page: "blog" },
    { label: "~/archive",  href: "archive.html",       page: "archive" },
    { label: "~/wiki",     href: "wiki/index.html",    page: "wiki" },
    { label: "~/about",    href: "about.html",         page: "about" },
    { label: "~/quotes",   href: "quotes.html",        page: "quotes" },
    { label: "~/changelog",href: "changelog.html",     page: "changelog" }
  ],

  /* 数据页映射：data-page → 数据源 */
  dataMap: {
    blog:      "BLOG_POSTS",
    archive:   "BLOG_POSTS",
    quotes:    "QUOTES_DATA",
    wiki:      "WIKI_DATA",
    changelog: "CHANGELOG_DATA"
  }
};
