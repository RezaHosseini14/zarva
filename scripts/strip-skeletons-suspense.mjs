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

const files = walk(root);
let deleted = 0;

for (const file of files) {
  const base = path.basename(file);
  const lower = base.toLowerCase();
  const shouldDelete =
    base === 'loading.tsx' || lower.includes('skeleton') || base === 'zarva-shimmer.tsx';
  if (shouldDelete) {
    fs.unlinkSync(file);
    deleted += 1;
    console.log('DEL', path.relative(root, file));
  }
}

function stripSuspense(code) {
  let out = code;
  let prev;
  do {
    prev = out;
    out = out.replace(/<Suspense\b[^>]*>\s*([\s\S]*?)\s*<\/Suspense>/g, (_, inner) =>
      inner.trim(),
    );
  } while (out !== prev);

  out = out.replace(/^import\s*\{\s*Suspense\s*\}\s*from\s*['"]react['"];\r?\n/gm, '');
  out = out.replace(
    /^import\s*\{\s*Suspense\s*,\s*([^}]+)\}\s*from\s*['"]react['"];/gm,
    "import { $1} from 'react';",
  );
  out = out.replace(
    /^import\s*\{\s*([^}]*?),\s*Suspense\s*\}\s*from\s*['"]react['"];/gm,
    "import { $1} from 'react';",
  );
  out = out.replace(
    /^import\s*\{\s*([^}]*?),\s*Suspense\s*,\s*([^}]+)\}\s*from\s*['"]react['"];/gm,
    "import { $1, $2} from 'react';",
  );

  out = out.replace(/^import\s+[^;]*skeleton[^;]*;\r?\n/gim, '');
  out = out.replace(/^import\s+[^;]*Skeleton[^;]*;\r?\n/gm, '');
  out = out.replace(/^import\s+[^;]*zarva-shimmer[^;]*;\r?\n/gim, '');

  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

const srcFiles = walk(root).filter((f) => /\.(tsx|ts)$/.test(f));
let transformed = 0;

for (const file of srcFiles) {
  const before = fs.readFileSync(file, 'utf8');
  if (!/Suspense|Skeleton|skeleton|zarva-shimmer/.test(before)) continue;
  const after = stripSuspense(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    transformed += 1;
    console.log('EDIT', path.relative(root, file));
  }
}

console.log(JSON.stringify({ deleted, transformed }, null, 2));
