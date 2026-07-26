/* 网站背景音乐配置
 * mode: 'meting' - 通过 Meting API 获取 QQ音乐歌单
 * mode: 'local'  - 使用下面 playlist 字段的直链
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
  },
  // 本地备份歌单（API 失败时使用）
  playlist: [
    { title: "悠忽舞于梦中", artist: "鸣潮先约电台", src: "https://api.injahow.cn/meting/?server=tencent&type=url&id=002bWs2m3I05cp", pic: "" },
    { title: "星炬不熄", artist: "鸣潮先约电台", src: "https://api.injahow.cn/meting/?server=tencent&type=url&id=000nMgTC3lDi8o", pic: "" },
    { title: "Turning Around (余烬重燃)", artist: "鸣潮先约电台", src: "https://api.injahow.cn/meting/?server=tencent&type=url&id=002uVqdJ0unvAk", pic: "" },
    { title: "致以无名的抗争者", artist: "鸣潮先约电台", src: "https://api.injahow.cn/meting/?server=tencent&type=url&id=002lmk6D3XxnnD", pic: "" },
    { title: "潮汐的回声", artist: "鸣潮先约电台", src: "https://api.injahow.cn/meting/?server=tencent&type=url&id=001UehXy1oYjT2", pic: "" },
    { title: "黑海岸的守望", artist: "鸣潮先约电台", src: "https://api.injahow.cn/meting/?server=tencent&type=url&id=0033K7J91KNK1q", pic: "" },
    { title: "黎明的序曲", artist: "鸣潮先约电台", src: "https://api.injahow.cn/meting/?server=tencent&type=url&id=004nMgTC3lDi8o", pic: "" },
    { title: "无垠之海", artist: "鸣潮先约电台", src: "https://api.injahow.cn/meting/?server=tencent&type=url&id=005uVqdJ0unvAk", pic: "" }
  ]
};
