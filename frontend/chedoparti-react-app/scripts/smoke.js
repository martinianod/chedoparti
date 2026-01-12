const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const required = ['src/main.jsx', 'src/App.jsx', 'src/services/api.js', 'src/i18n.js'];

let ok = true;
required.forEach((p) => {
  const full = path.join(projectRoot, p);
  if (!fs.existsSync(full)) {
    console.error('Missing required file:', p);
    ok = false;
  }
});

if (!ok) process.exit(2);

process.exit(0);
