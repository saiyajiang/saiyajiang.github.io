/* 网站背景音乐配置
 * mode: 'meting' - APlayer + Meting API 拉取 QQ 音乐歌单
 * mode: 'local'  - 用 playlist 数组的本地 MP3
 */
/* 网站背景音乐配置
 * mode: 'qqmusic' - iframe 嵌 QQ 音乐 web 播放器（国内网络推荐）
 * mode: 'local'  - 用 playlist 数组的本地 MP3
 * mode: 'meting'  - APlayer + Meting API（境外网络）
 */
window.SITE_MUSIC_CONFIG = {
  mode: 'qqmusic',
  /* QQ 音乐 iframe 播放器
   * playlist ID: 9750122774（鸣潮先约电台）
   * 使用 QQ 音乐官方 web player iframe
   */
  qqmusic: {
    playlistId: '9750122774'
  },
  /* 本地歌单（mode === 'local' 时使用）
   * 示例：
   * playlist: [
   *   { title: "歌名", artist: "艺术家", src: "assets/audio/song.mp3", pic: "" }
   * ]
   */
  playlist: []
};
