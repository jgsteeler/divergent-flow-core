/*
  Centralized environment loader for the monorepo.
  - Loads env files ONLY from the monorepo root.
  - Priority (first match wins):
      1) ENV_FILE (absolute or relative to repo root)
      2) .env.local
      3) .env.{NODE_ENV}
      4) .env
  - Skips loading in containers unless ENV_FILE is explicitly provided (DOCKER === 'true').
*/

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

let loaded = false;

function findRepoRoot(startDir: string): string {
  // Ascend until we find a directory that looks like the repo root
  // Heuristics: has package.json AND a packages/ directory
  let dir = startDir;
  const root = path.parse(startDir).root;
  while (true) {
    const pkgJson = path.join(dir, 'package.json');
    const packagesDir = path.join(dir, 'packages');
    if (fs.existsSync(pkgJson) && fs.existsSync(packagesDir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir || dir === root) {
      // Fallback: give back the starting dir if nothing found
      return startDir;
    }
    dir = parent;
  }
}

function tryLoad(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath });
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

(function loadEnvOnce() {
  if (loaded) return;
  loaded = true;

  const isDocker = process.env.DOCKER === 'true' || process.env.NODE_ENV === 'docker';
  const startDir = __dirname; // packages/div-flo-api/src
  const repoRoot = findRepoRoot(startDir);

  const explicit = process.env.ENV_FILE; // allow explicit override
  if (explicit) {
    const explicitPath = path.isAbsolute(explicit) ? explicit : path.join(repoRoot, explicit);
    if (tryLoad(explicitPath)) return;
  }

  // If running inside Docker, do not implicitly load root files
  // (containers should receive env via runtime), unless ENV_FILE set above.
  if (isDocker) {
    return;
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  const candidates = [
    path.join(repoRoot, '.env.local'),
    path.join(repoRoot, `.env.${nodeEnv}`),
    path.join(repoRoot, '.env'),
  ];

  for (const p of candidates) {
    if (tryLoad(p)) break;
  }
})();
