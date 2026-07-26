/* 网站背景音乐配置
 * mode: 'meting' - 通过 Meting API 获取 QQ音乐歌单（代理 URL 会被浏览器拒绝）
 * mode: 'local'  - 使用下面 playlist 字段的直链（需要本地 MP3）
 */
window.SITE_MUSIC_CONFIG = {
  mode: 'local',
  meting: {
    server: 'tencent',
    type: 'playlist',
    id: '9750122774'
  },
  /* 本地歌单示例
   * 准备 MP3 放到 assets/audio/ 目录下，填入相对路径即可
   * 例如：
   * playlist: [
   *   { title: "歌名", artist: "艺术家", src: "assets/audio/song.mp3", pic: "" }
   * ]
   */
  playlist: []
};
