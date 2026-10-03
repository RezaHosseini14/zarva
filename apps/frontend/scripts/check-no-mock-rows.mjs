import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '../src/app/[locale]/(app)');
const pattern = /rows=\[\{\s*id:/;

function walk(dir, hits) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, hits);
      continue;
    }
    if (entry.name !== 'page.tsx') {
      continue;
    }
    const text = fs.readFileSync(full, 'utf8');
    if (pattern.test(text)) {
      hits.push(full);
    }
  }
}

const hits = [];
if (fs.existsSync(appRoot)) {
  walk(appRoot, hits);
}

if (hits.length > 0) {
  console.error('Mock inline rows detected in app pages:');
  for (const file of hits) {
    console.error(`  ${file}`);
  }
  process.exit(1);
}

console.log('check-no-mock-rows: ok');
