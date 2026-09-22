import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const source = new URL('../assets/', import.meta.url);
const destination = new URL('../dist/assets/', import.meta.url);

if (!existsSync(source)) process.exit(0);

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
