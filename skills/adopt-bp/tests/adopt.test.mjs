// End-to-end on a throwaway git repo: check -> seed -> tree -> events -> measure -> judge -> validate.
// Needs a bp checkout for the lens manifests, the DDL and the validator (ADOPT_BP_ROOT, or a sibling
// ../bp of the registry checkout); skipped without one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ADOPT = path.join(HERE, '..', 'scripts', 'adopt.mjs');
const BP = [process.env.ADOPT_BP_ROOT, path.join(HERE, '..', '..', '..', '..', 'bp')].filter(Boolean)
  .find((p) => fs.existsSync(path.join(p, 'docs', 'standard', 'lenses', 'development.json')));

const run = (root, ...a) => spawnSync(process.execPath, [ADOPT, ...a, '--root', root, '--bp', BP], { encoding: 'utf8' });
const write = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };

test('adopts a tiny repo end to end', { skip: !BP && 'no bp checkout' }, () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'adopt-bp-'));
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
  write(root, 'src/app/page.tsx', "import { Editor } from '../editor/Editor';\nexport default function P() { return <Editor />; }\n");
  write(root, 'src/editor/Editor.tsx', "import React from 'react';\nexport function Editor() { return <div style={{ color: '#ff0000' }}>x</div>; }\n");
  write(root, 'src/editor/Editor.test.tsx', "test('x', () => {});\n");
  write(root, 'src/api/route.ts', "export function GET() { return eval('1'); }\n");
  // a duplicate context name and a directory entry, as real maps carry
  write(root, 'context-map.json', JSON.stringify({ version: 2, project: { name: 'Tiny' }, groups: [{ name: 'App', domain: 'feature' }, { name: 'Api', domain: 'feature' }],
    contexts: [
      { name: 'editor', group: 'App', category: 'ui', file_paths: ['src/editor/'], entry_points: ['src/app/page.tsx'] },
      { name: 'editor', group: 'Api', category: 'api', file_paths: ['src/api/route.ts'] },
      { name: 'shell', group: 'App', category: 'ui', file_paths: ['src/app/page.tsx'] },
    ] }));
  git('add', '-A'); git('commit', '-qm', 'init');

  let r = run(root, 'check');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /duplicate names: editor/);
  r = run(root, 'seed', '--slug', 'tiny', '--name', 'Tiny');
  assert.equal(r.status, 0, r.stderr);
  const inv = JSON.parse(fs.readFileSync(path.join(root, '.ai/lens-scan/work/inventory.json'), 'utf8'));
  assert.deepEqual(inv.contexts.map((c) => c.name), ['editor', 'editor-api', 'shell']);
  assert.equal(inv.contexts[0].files, 2, 'the directory entry expands to its tracked files');

  // a broken tree is refused by name
  write(root, '.ai/lens-scan/work/product-tree.json', JSON.stringify({ domains: [{ slug: 'app', name: 'App' }], capabilities: [{ slug: 'edit', name: 'Edit', domain: 'nope' }], features: [] }));
  r = run(root, 'tree');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /unknown domain "nope"/);

  write(root, '.ai/lens-scan/work/product-tree.json', JSON.stringify({
    domains: [{ slug: 'app', name: 'App' }], capabilities: [{ slug: 'edit', name: 'Edit', domain: 'app' }],
    features: [
      { slug: 'editor', name: 'Editor', summary: 's', capability: 'edit', contexts: ['editor', 'shell'], primary_context: 'editor', stage: 'live', stage_evidence: 'mounted at src/app/page.tsx:2' },
      { slug: 'api', name: 'Api', summary: 's', capability: 'edit', contexts: ['editor-api'], stage: 'in-dev', stage_evidence: 'not called' },
    ] }));
  for (const c of ['tree', 'events', 'measure']) { r = run(root, c); assert.equal(r.status, 0, `${c}: ${r.stderr}`); }
  const map = JSON.parse(fs.readFileSync(path.join(root, '.ai/lens-scan/app-structure.json'), 'utf8'));
  assert.equal(map.facets.editor.development.values.testRatioPct > 0, true);
  assert.equal(map.facets.editor.design.values.rawLiterals, 1);
  assert.equal(map.facets.api.security.values.unsafeSinks, 1);
  assert.equal(map.facets.api.design.applicable, false);

  write(root, '.ai/lens-scan/work/judgement/01.json', JSON.stringify({ features: { editor: { development: { standardsPct: 80, dupSites: 0, techDebt: 0 }, security: { findingsCritical: 0, findingsHigh: 0, findingsMedium: 0, findingsLow: 0, standardsPct: 90 } } },
    proposals: [{ feature: 'api', lens: 'security', metric: 'unsafeSinks', title: 'Drop eval', body: 'src/api/route.ts:1', expected_delta: -1, size: 'XS', risk: 2 }] }));
  r = run(root, 'judge', '--model', 'test');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /judgement gaps/, 'missing lenses are reported');
  r = run(root, 'validate');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  fs.rmSync(root, { recursive: true, force: true });
});
