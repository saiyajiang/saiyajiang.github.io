/* 网站背景音乐配置
 * mode: 'local'  - 使用自定义播放器（直链 URL）
 * mode: 'meting' - 通过 Meting API 获取 QQ音乐/网易云歌单
 *
 * Meting 配置说明：
 * - server: 'tencent' (QQ音乐), 'netease' (网易云), 'kugou', 'kuwo'
 * - type: 'playlist' (歌单), 'album' (专辑), 'song' (单曲)
 * - id: 对应平台的 ID
 */
window.SITE_MUSIC_CONFIG = {
  mode: 'meting',
  meting: {
    server: 'tencent',
    type: 'playlist',
    id: '9750122774',
    fixed: true,
    autoplay: false,
    loop: 'all',
    order: 'list',
    preload: 'auto',
    listFolded: true,
    listMaxHeight: '340px',
    lrcType: 0,
    theme: '#7c3aed'
  }
};
