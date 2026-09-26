#!/usr/bin/env node
import { loadV2Model, checkProjection, writeProjection } from './lib/coord-v2-model.mjs';

const root = process.cwd();
const model = loadV2Model(root);
const write = process.argv.includes('--write');
const check = process.argv.includes('--check') || !write;

if (write) {
  const content = writeProjection(model);
  process.stdout.write(content);
}

if (check) {
  const result = checkProjection(model);
  for (const warning of result.warnings) console.warn('WARN:', warning);
  if (result.errors.length) {
    for (const error of result.errors) console.error('ERROR:', error);
    process.exit(1);
  }
  if (!result.projectionMatches) {
    console.error('ERROR: coordination/v2/CURRENT.json drifted from canonical records');
    process.exit(1);
  }
  console.log('V2 projection is canonical and current');
}
