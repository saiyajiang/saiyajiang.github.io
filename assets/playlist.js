/* 网站背景音乐配置
 * mode: 'meting' - APlayer + Meting API 拉取 QQ 音乐歌单
 * mode: 'local'  - 用 playlist 数组的本地 MP3
 */
window.SITE_MUSIC_CONFIG = {
  mode: 'meting',
  meting: {
    server: 'tencent',
    type: 'playlist',
    id: '9750122774',
    autoplay: false,
    loop: 'all',
    order: 'list',
    preload: 'auto',
    volume: 0.5,
    lrcType: 0
  },
  /* 本地备份歌单
   * mode === 'local' 时生效；meting 模式作为 API 失败时的兑底
   * 示例：
   * playlist: [
   *   { title: "歌名", artist: "艺术家", src: "assets/audio/song.mp3", pic: "" }
   * ]
   */
  playlist: []
};
