const fs=require('fs');
global.window={};
global.document={ querySelectorAll:()=>[], getElementById:()=>null, body:{getAttribute:()=>'home'}, addEventListener:()=>{}, readyState:'complete' };
global.localStorage={getItem:()=>null,setItem:()=>{}};
global.location={search:''};
let out='';
try {
  eval(fs.readFileSync('assets/posts.js','utf8'));
  out+='posts.js OK\n';
  eval(fs.readFileSync('assets/site.js','utf8'));
  out+='site.js OK\n';
} catch(e) {
  out+='ERROR: '+(e.stack||e.message)+'\n';
}
out+='done';
fs.writeFileSync('_test_out.txt', out);
