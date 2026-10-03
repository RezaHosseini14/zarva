/**
 * Sync DATABASE_URL for local Prisma Dev (Windows without Docker).
 *
 * Prefer the TCP URL to the `zarva` database. Nest uses `@prisma/adapter-pg`
 * so prepared-statement errors from the Prisma Dev proxy are avoided.
 *
 * Usage: node scripts/sync-prisma-dev-url.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');

const raw = execSync('npx prisma dev ls', {
  cwd: path.join(root, 'apps', 'backend'),
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

const tcpMatch = raw.match(
  /postgres:\/\/postgres:postgres@localhost:(\d+)\//,
);
if (!tcpMatch) {
  console.error(
    'Could not find Prisma Dev TCP port. Run: cd apps/backend && npx prisma dev --name zarva --detach',
  );
  process.exit(1);
}

const port = tcpMatch[1];
const url = `postgresql://postgres:postgres@127.0.0.1:${port}/zarva?schema=public&sslmode=disable&pgbouncer=true`;

let env = fs.readFileSync(envPath, 'utf8');
if (!/^DATABASE_URL=/m.test(env)) {
  env += `\nDATABASE_URL=${url}\n`;
} else {
  env = env.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${url}`);
}
fs.writeFileSync(envPath, env);

for (const dest of [
  path.join(root, 'apps', 'backend', '.env'),
  path.join(root, 'apps', 'frontend', '.env.local'),
]) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(envPath, dest);
}

console.log(`DATABASE_URL → 127.0.0.1:${port}/zarva (pgbouncer=true)`);
