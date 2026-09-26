#!/usr/bin/env node
import { buildProjection, loadRemoteV2Model, loadV2Model, projectionText, validateLoadedModel } from './lib/coord-v2-model.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const root = process.cwd();
const remote = arg('--remote');
const model = remote ? loadRemoteV2Model(root, remote) : loadV2Model(root);
const result = validateLoadedModel(model, { strictGit: process.argv.includes('--strict-git') });

for (const warning of result.warnings) console.warn('WARN:', warning);
if (result.errors.length) {
  for (const error of result.errors) console.error('ERROR:', error);
  process.exit(1);
}

process.stdout.write(projectionText(buildProjection(model, result)));
