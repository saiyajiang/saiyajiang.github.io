const fs = require('fs');
const path = require('path');

const root = __dirname;
function walk(dir) {
  let out = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (f !== 'node_modules' && f !== '.git') out = out.concat(walk(p)); }
    else if (f.endsWith('.html')) out.push(p);
  });
  return out;
}
const pages = walk(root);

const OLD = `<meting-js
  server="tencent"
  type="playlist"
  id="9750122774"
  fixed="true"
  autoplay="false"
  mutex="true"
  theme="#8b8cff"
  list-max-height="340px"
  order="list"
  preload="auto"
  volume="0.5">
</meting-js>`;

const NEW = `<meting-js class="aplayer meting"
  data-server="tencent"
  data-type="playlist"
  data-id="9750122774"
  data-fixed="true"
  data-autoplay="false"
  data-mutex="true"
  data-theme="#8b8cff"
  data-list-max-height="340px"
  data-order="list"
  data-preload="auto"
  data-volume="0.5">
</meting-js>`;

// meting_api 全局变量要在 Meting.min.js 之前定义
const API_SNIPPET = `<script>window.meting_api='https://api.injahow.cn/meting/';</script>`;

let changed = 0;
pages.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');
  let orig = html;
  if (html.includes('<meting-js')) {
    // 替换标签（兼容已改或旧格式）
    html = html.replace(/<meting-js[\s\S]*?<\/meting-js>/, NEW);
  }
  // 在 Meting.min.js 之前注入 meting_api 定义（避免重复）
  if (html.includes('meting/1.1.1/Meting.min.js') && !html.includes('window.meting_api')) {
    html = html.replace(
      '<script src="https://cdn.staticfile.org/meting/1.1.1/Meting.min.js"></script>',
      API_SNIPPET + '\n<script src="https://cdn.staticfile.org/meting/1.1.1/Meting.min.js"></script>'
    );
  }
  if (html !== orig) { fs.writeFileSync(file, html); changed++; console.log('updated:', path.basename(file)); }
});
console.log('changed:', changed);