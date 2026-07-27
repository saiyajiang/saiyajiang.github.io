/* 网站背景音乐配置
 * mode: 'meting' - APlayer + Meting API 拉取 QQ 音乐歌单
 * mode: 'local'  - 用 playlist 数组的本地 MP3
 */
/* 网站背景音乐配置
 * mode: 'meting'  - APlayer + Meting.js（推荐）
 * mode: 'local'   - 本地 MP3 同源自托管
 *
 * meting 模式依赖 https://api.injahow.cn/meting/ 接口
 * 歌单 ID: 9750122774（鸣潮先约电台）
 */
window.SITE_MUSIC_CONFIG = {
  mode: 'meting',
  meting: {
    server: 'tencent',
    type: 'playlist',
    id: '9750122774'
  },
  playlist: []
};
