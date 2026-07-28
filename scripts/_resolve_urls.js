const fs = require('fs');
const https = require('https');
const http = require('http');

const PLAYLIST = 'assets/playlist.json';
const songs = JSON.parse(fs.readFileSync(PLAYLIST, 'utf8'));

function resolveUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout }, (res) => {
      // FOLLOW redirects up to 3 hops
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        let loc = res.headers.location;
        if (loc) {
          if (loc.startsWith('/')) {
            const u = new URL(url);
            loc = u.protocol + '//' + u.host + loc;
          }
          resolve(resolveUrl(loc, timeout));
        } else {
          resolve(url); // no location, keep original
        }
      } else {
        resolve(url); // 200 etc, keep original
      }
    });
    req.on('error', () => resolve(url)); // timeout/error, keep original
    req.on('timeout', () => { req.destroy(); resolve(url); });
  });
}

async function main() {
  let resolved = 0;
  for (let i = 0; i < songs.length; i++) {
    const s = songs[i];
    // Resolve url (type=url proxy → final mp3)
    if (s.url && s.url.includes('meting') || s.url.includes('type=url')) {
      const final = await resolveUrl(s.url);
      if (final !== s.url) {
        s.url = final;
        resolved++;
        console.log(`[${i + 1}/${songs.length}] ${s.name}: ${final.substring(0, 80)}...`);
      }
    }
    // Resolve pic (type=pic proxy → final image)
    if (s.pic && (s.pic.includes('type=pic') || s.pic.includes('/meting/'))) {
      const finalPic = await resolveUrl(s.pic);
      if (finalPic !== s.pic) {
        s.pic = finalPic;
        resolved++;
      }
    }
    // Resolve lrc
    if (s.lrc && s.lrc.includes('type=lrc')) {
      const finalLrc = await resolveUrl(s.lrc);
      if (finalLrc !== s.lrc) {
        s.lrc = finalLrc;
        resolved++;
      }
    }
  }
  
  fs.writeFileSync(PLAYLIST, JSON.stringify(songs));
  console.log(`\nDone. ${resolved} URLs resolved. ${PLAYLIST} updated.`);
}

main().catch(e => { console.error(e); process.exit(1); });