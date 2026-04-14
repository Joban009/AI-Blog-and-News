import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// 1. Load the main .env file first
dotenv.config({ path: join(repoRoot, '.env') });

// 2. Load .env if it exists (overriding .env)
const localPath = join(repoRoot, '.env');
if (existsSync(localPath)) {
  dotenv.config({ path: localPath, override: true });
}
