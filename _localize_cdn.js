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

const repl = [
  ['<link rel="stylesheet" href="https://cdn.staticfile.org/aplayer/1.10.1/APlayer.min.css">',
   '<link rel="stylesheet" href="assets/vendor/APlayer.min.css">'],
  ['<script src="https://cdn.staticfile.org/aplayer/1.10.1/APlayer.min.js"></script>',
   '<script src="assets/vendor/APlayer.min.js"></script>'],
  ['<script src="https://cdn.staticfile.org/meting/1.1.1/Meting.min.js"></script>',
   '<script src="assets/vendor/Meting.min.js"></script>'],
  ['<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css"></script>',
   '<link rel="stylesheet" href="assets/vendor/APlayer.min.css">'],
  ['<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css">',
   '<link rel="stylesheet" href="assets/vendor/APlayer.min.css">'],
  ['<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js"></script>',
   '<script src="assets/vendor/APlayer.min.js"></script>'],
  ['<script src="https://cdn.jsdelivr.net/npm/meting@1.1.1/dist/Meting.min.js"></script>',
   '<script src="assets/vendor/Meting.min.js"></script>']
];

let n = 0;
walk(root).forEach(f => {
  let html = fs.readFileSync(f, 'utf8');
  let orig = html;
  repl.forEach(([o, n2]) => { if (html.includes(o)) html = html.split(o).join(n2); });
  if (html !== orig) { fs.writeFileSync(f, html); n++; console.log('updated:', path.basename(f)); }
});
console.log('changed:', n);