// (2026-07-13) Asset builder for Capacitor www output; was none
const fs = require('fs');
const path = require('path');

const root = __dirname;
const outDir = path.join(root, 'www');

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

const filesToCopy = [
  'index.html',
  'manifest.json',
  'sw.js',
  'NAV-ICONS.png'
];

const dirsToCopy = [
  'css',
  'js',
  'assets',
  'venues'
];

filesToCopy.forEach(file => {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, file));
  }
});

dirsToCopy.forEach(dir => {
  const src = path.join(root, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(outDir, dir), { recursive: true });
  }
});

console.log('Build completed: assets copied to www/');
