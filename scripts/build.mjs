import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
if (dirname(output) !== resolve(root) || basename(output) !== 'dist') {
  throw new Error('Build output must be the project dist directory.');
}
await rm(output, { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await copyFile('assets/booking-calendar.js', 'dist/assets/booking-calendar.js');
await copyFile('assets/site-loading.js', 'dist/assets/site-loading.js');
for (const file of ['site.css', 'tesqivo-wordmark-transparent-web.png', 'tesqivo-symbol-transparent.png', 'favicon.png', 'qa-testing-hero.jpg', 'qa-testing-hero-small.jpg', 'whatsapp-group-qr.png']) {
  await copyFile(`assets/${file}`, `dist/assets/${file}`);
}
await cp('assets/fonts', 'dist/assets/fonts', { recursive: true });
console.log('Built static site in dist/.');
