#!/usr/bin/env node
import { loadV2Model, checkProjection } from './lib/coord-v2-model.mjs';

const strictGit = process.argv.includes('--strict-git');
const model = loadV2Model(process.cwd());
const result = checkProjection(model);

for (const warning of result.warnings) console.warn('WARN:', warning);
if (result.errors.length) {
  for (const error of result.errors) console.error('ERROR:', error);
  process.exitCode = 1;
}
if (!result.projectionMatches) {
  console.error('ERROR: derived CURRENT.json does not match canonical records');
  process.exitCode = 1;
}

if (strictGit) {
  const { validateLoadedModel } = await import('./lib/coord-v2-model.mjs');
  const strict = validateLoadedModel(model, { strictGit: true });
  if (strict.errors.length) {
    for (const error of strict.errors) console.error('ERROR:', error);
    process.exitCode = 1;
  }
}

if (!process.exitCode) console.log('Agent Orchestration V2 invariants PASS');
