import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('Created .env from .env.example');
  } else {
    console.warn('No .env or .env.example found');
    process.exit(0);
  }
}

const backendEnv = path.join(root, 'apps', 'backend', '.env');
const frontendEnv = path.join(root, 'apps', 'frontend', '.env.local');

fs.mkdirSync(path.dirname(backendEnv), { recursive: true });
fs.mkdirSync(path.dirname(frontendEnv), { recursive: true });
fs.copyFileSync(envPath, backendEnv);
fs.copyFileSync(envPath, frontendEnv);
console.log('Synced .env → apps/backend/.env and apps/frontend/.env.local');
