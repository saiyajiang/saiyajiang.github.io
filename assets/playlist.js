/* 网站背景音乐播放列表（数据驱动，和 posts.js 同源思路）
 * 用法：
 *   1) 把音频文件放到 assets/music/ 目录（推荐 mp3，兼顾 ogg）
 *   2) 在下面数组里增加一条，src 填相对路径即可
 *   也支持远程链接：src 直接写 https://...（需对方允许跨域）
 * 字段：
 *   title  显示名
 *   artist 艺术家（可选）
 *   src    音频地址（本地相对路径或远程 URL）
 */
window.SITE_PLAYLIST = [
  // 示例（请把你的音乐文件放进 assets/music/ 后取消注释并改好文件名）：
  // {
  //   title: "示例曲目",
  //   artist: "佚名",
  //   src: "assets/music/demo.mp3"
  // }
];
