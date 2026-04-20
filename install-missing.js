const { execSync } = require('child_process');
const fs = require('fs');
const txt = fs.readFileSync('tsc-utf8-3.txt', 'utf8');
const regex = /Cannot find module '([^']+)'/g;
const s = new Set();
let m;
while ((m = regex.exec(txt)) !== null) {
  // Ignore internal/relative module paths
  if (!m[1].startsWith('@/') && !m[1].startsWith('./') && !m[1].startsWith('../')) {
    s.add(m[1]);
  }
}
const packages = [...s];
if (packages.length > 0) {
  console.log('Installing: ' + packages.join(' '));
  execSync('npm install ' + packages.join(' '), { stdio: 'inherit' });
} else {
  console.log('No external packages missing.');
}
