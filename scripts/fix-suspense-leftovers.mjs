import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('apps/frontend/src');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

let fixed = 0;
for (const file of walk(root).filter((f) => /\.(tsx|ts)$/.test(f))) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before
    // leftover from broken Suspense open tags: `}>` or `} key={q}>`
    .replace(/^[ \t]*\}(?:\s+key=\{[^}]+\})?>\s*\r?\n/gm, '')
    .replace(/\n{3,}/g, '\n\n');

  if (after !== before) {
    fs.writeFileSync(file, after);
    fixed += 1;
    console.log('FIX', path.relative(root, file));
  }
}

console.log(JSON.stringify({ fixed }, null, 2));
