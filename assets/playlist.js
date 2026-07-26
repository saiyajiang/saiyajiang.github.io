/* 网站背景音乐播放列表（数据驱动）
 * 支持本地文件或远程 URL
 * 远程音源需对方允许跨域（CORS）
 * 
 * 推荐无版权音源：
 * - archive.org（Internet Archive，CORS 友好）
 * - incompetech.com（Kevin MacLeod，需确认跨域）
 * - 本地 assets/music/ 目录（最稳，无跨域问题）
 */
window.SITE_PLAYLIST = [
  // Internet Archive 示例（CC0 协议，可自由使用）
  {
    title: "Gymnopedie No.1",
    artist: "Erik Satie",
    src: "https://archive.org/download/Classical_Sampler-9615/Kevin_MacLeod_-_Gymnopedie_No_1.mp3"
  },
  {
    title: "Relaxing Piano Music",
    artist: "Kevin MacLeod",
    src: "https://archive.org/download/Classical_Sampler-9615/Kevin_MacLeod_-_Relaxing_Piano_Music.mp3"
  },
  // 本地示例（取消注释并放入文件即可使用）
  // {
  //   title: "一生所爱",
  //   artist: "卢冠廷",
  //   src: "assets/music/yishengsuojia.mp3"
  // }
];
