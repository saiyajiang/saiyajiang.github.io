/* 网站背景音乐配置
 * mode: 'local'  - 使用自定义播放器（支持本地文件 + 直链 URL）
 * mode: 'meting' - 使用 Meting.js（支持 QQ 音乐、网易云等歌单）
 *
 * Meting 配置说明：
 * - server: 'tencent' (QQ音乐), 'netease' (网易云), 'kugou', 'kuwo', 'baidu'
 * - type: 'playlist' (歌单), 'album' (专辑), 'song' (单曲), 'artist' (艺术家)
 * - id: 对应平台的 ID（从分享链接中获取）
 */
window.SITE_MUSIC_CONFIG = {
  mode: 'local', // 切换: 'local' 或 'meting'
  
  // local 模式: 播放列表
  playlist: [
    // Internet Archive 示例（CC0 协议）
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
  ],
  
  // meting 模式: 歌单配置
  meting: {
    id: '20173709',      // 歌单ID（从QQ音乐/网易云分享链接获取）
    server: 'netease',   // 平台: 'tencent'(QQ音乐), 'netease'(网易云), 'kugou', 'kuwo'
    type: 'playlist',    // 类型: 'playlist', 'album', 'song', 'artist'
    fixed: true,         // 固定到底部
    autoplay: false,     // 自动播放
    loop: 'all',         // 循环: 'all', 'one', 'none'
    order: 'random',     // 顺序: 'random', 'list'
    preload: 'auto',
    listFolded: true,    // 默认折叠列表
    listMaxHeight: '330px',
    lrcType: 0,          // 歌词: 0=禁用, 1=原生, 2=Meting解析
    theme: '#8b8cff'     // 主题色
  }
};

// 兼容旧代码
window.SITE_PLAYLIST = window.SITE_MUSIC_CONFIG.playlist;
