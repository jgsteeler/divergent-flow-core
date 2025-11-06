/* Centralized environment loader (same behavior as API package)
   Loads root-level env files with priority and avoids implicit loads in Docker. */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

let loaded = false;

function findRepoRoot(startDir: string): string {
  let dir = startDir;
  const root = path.parse(startDir).root;
  while (true) {
    const pkgJson = path.join(dir, 'package.json');
    const packagesDir = path.join(dir, 'packages');
    if (fs.existsSync(pkgJson) && fs.existsSync(packagesDir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir || dir === root) return startDir;
    dir = parent;
  }
}

function tryLoad(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath });
      return true;
    }
  } catch {}
  return false;
}

(function loadEnvOnce() {
  if (loaded) return; loaded = true;
  const isDocker = process.env.DOCKER === 'true' || process.env.NODE_ENV === 'docker';
  const repoRoot = findRepoRoot(__dirname);

  const explicit = process.env.ENV_FILE;
  if (explicit) {
    const explicitPath = path.isAbsolute(explicit) ? explicit : path.join(repoRoot, explicit);
    if (tryLoad(explicitPath)) return;
  }
  if (isDocker) return;

  const nodeEnv = process.env.NODE_ENV || 'development';
  const candidates = [
    path.join(repoRoot, '.env.local'),
    path.join(repoRoot, `.env.${nodeEnv}`),
    path.join(repoRoot, '.env'),
  ];
  for (const p of candidates) { if (tryLoad(p)) break; }
})();
