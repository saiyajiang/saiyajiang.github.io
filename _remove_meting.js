const fs = require('fs');
const path = require('path');
const root = __dirname;
function walk(dir) {
  let out = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (f !== 'node_modules' && f !== '.git' && f !== 'vendor') out = out.concat(walk(p)); }
    else if (f.endsWith('.html')) out.push(p);
  });
  return out;
}

const METING_TAG = /<meting-js[\s\S]*?<\/meting-js>\s*/g;
const METING_API = /<script>window\.meting_api=.*?<\/script>\s*/g;
const METING_JS = /<script src="assets\/vendor\/Meting\.min\.js"><\/script>\s*/g;

let n = 0;
walk(root).forEach(f => {
  let html = fs.readFileSync(f, 'utf8');
  let orig = html;
  html = html.replace(METING_TAG, '');
  html = html.replace(METING_API, '');
  html = html.replace(METING_JS, '');
  if (html !== orig) { fs.writeFileSync(f, html); n++; console.log('updated:', path.basename(f)); }
});
console.log('changed:', n);