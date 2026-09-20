import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function collect(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collect(path));
    else if (entry.isFile() && entry.name.endsWith('.test.mjs')) out.push(path);
  }
  return out;
}

const tests = collect('tests').sort();
if (tests.length === 0) {
  console.error('No test files discovered');
  process.exit(1);
}

console.log(`Discovered ${tests.length} test files recursively`);
const result = spawnSync(process.execPath, ['--test', ...tests], { stdio: 'inherit' });
process.exit(result.status ?? 1);
