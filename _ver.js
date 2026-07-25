const fs=require('fs');
const path=require('path');
function walk(d){
  fs.readdirSync(d).forEach(f=>{
    const p=path.join(d,f);
    const st=fs.statSync(p);
    if(st.isDirectory()){ if(f!=='.git' && !f.startsWith('.')===false){} if(f!=='.git') walk(p); }
    else if(f.endsWith('.html')){
      let c=fs.readFileSync(p,'utf8');
      const n=c.replace(/v=20260725/g,'v=20260726');
      if(n!==c){ fs.writeFileSync(p,n); fs.appendFileSync('_ver_out.txt', 'updated '+p+'\n'); }
    }
  });
}
walk('.');
fs.appendFileSync('_ver_out.txt','done\n');
