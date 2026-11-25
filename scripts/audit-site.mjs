import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('dist');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const errors = [];
const ids = new Set();

for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
  if (ids.has(match[1])) errors.push(`Duplicate id: ${match[1]}`);
  ids.add(match[1]);
}
for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
  if (!ids.has(match[1])) errors.push(`Broken page anchor: #${match[1]}`);
}
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const value = match[1];
  if (/^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(value)) continue;
  const path = value.split(/[?#]/)[0];
  if (!existsSync(resolve(root, path.replace(/^\//, '')))) errors.push(`Missing local asset: ${value}`);
}
for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
  for (const candidate of match[1].split(',')) {
    const path = candidate.trim().split(/\s+/)[0];
    if (path && !existsSync(resolve(root, path))) errors.push(`Missing responsive image: ${path}`);
  }
}
const css = readFileSync(resolve(root, 'assets/site.css'), 'utf8');
for (const match of css.matchAll(/url\((?:["']?)([^"')]+)["']?\)/g)) {
  const value = match[1];
  if (/^(?:data:|https?:)/i.test(value)) continue;
  if (!existsSync(resolve(root, 'assets', value.split(/[?#]/)[0]))) errors.push(`Missing CSS asset: ${value}`);
}
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  if (!/\balt="[^"]*"/.test(match[0])) errors.push(`Image without alt: ${match[0].slice(0, 100)}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Site audit passed: ${ids.size} unique IDs, links, images, CSS assets, and image alt text.`);
}
