#!/usr/bin/env node
import { loadRemoteV2Model, loadV2Model, validateLoadedModel } from './lib/coord-v2-model.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const remote = arg('--remote');
const strictGit = process.argv.includes('--strict-git');
const model = remote ? loadRemoteV2Model(process.cwd(), remote) : loadV2Model(process.cwd());
const result = validateLoadedModel(model, { strictGit });

for (const warning of result.warnings) console.warn('WARN:', warning);
if (result.errors.length) {
  for (const error of result.errors) console.error('ERROR:', error);
  process.exit(1);
}

console.log(remote ? `Agent Orchestration V2 global invariants PASS across remote ${remote}` : 'Agent Orchestration V2 local invariants PASS');
