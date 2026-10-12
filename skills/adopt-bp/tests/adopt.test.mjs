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

  // a proposal that moves no metric is refused, and a refused judgement writes nothing
  write(root, '.ai/lens-scan/work/judgement/01.json', JSON.stringify({ features: {}, proposals: [{ feature: 'api', lens: 'security', title: 'Vague' }] }));
  r = run(root, 'judge', '--model', 'test');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /names feature, lens, title, the metric it moves/);

  write(root, '.ai/lens-scan/work/judgement/01.json', JSON.stringify({
    features: {
      editor: { development: { dupSites: 0, techDebt: 1, standardsPct: 99 }, security: { findingsCritical: 0, findingsHigh: 0, findingsMedium: 0, findingsLow: 0 } },
      api: { development: { dupSites: 0 }, security: { findingsCritical: 0, findingsHigh: 1, findingsMedium: 0, findingsLow: 0, evidence: 'src/api/route.ts:1 eval' }, design: { applicable: false } },
    },
    coverage: [
      { feature: 'editor', lens: 'development', standard: 'react-patterns/typed-props', state: 'conformant', evidence: 'src/editor/Editor.tsx:2' },
      { feature: 'editor', lens: 'development', standard: 'react-patterns/no-inline-style', state: 'deviation', evidence: 'src/editor/Editor.tsx:2' },
      { feature: 'editor', lens: 'development', standard: 'house:ui/tokens', state: 'not-applicable' },
    ],
    proposals: [{ feature: 'api', lens: 'security', metric: 'unsafeSinks', title: 'Drop eval', body: 'src/api/route.ts:1', expected_delta: -1, size: 'XS', risk: 2 }] }));
  r = run(root, 'judge', '--model', 'test');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /standardsPct ignored - it is derived/);
  assert.match(r.stderr, /judgement gaps: design missing on 1/, 'the editor has a UI and no design judgement');
  let m = JSON.parse(fs.readFileSync(path.join(root, '.ai/lens-scan/app-structure.json'), 'utf8'));
  assert.equal(m.facets.editor.development.values.standardsPct, 50, 'derived: 1 conformant / (1 + 1 deviation)');
  assert.equal(m.facets.editor.development.values.techDebt, 1, 'a non-metric field lands in the facet');
  assert.equal(m.facets.api.security.values.findingsHigh, 1);
  assert.equal('standardsPct' in m.facets.api.security.values, false, 'no coverage rows: unmeasured, never guessed');
  r = run(root, 'judge', '--model', 'test');
  assert.match(r.stdout, /1 already open or declined, not re-proposed/);

  // /lens-scan phase 1 after adoption merges: the declared tree survives a structure run
  const structure = path.join(HERE, '..', '..', 'lens-scan', 'scripts', 'structure.mjs');
  const s1 = spawnSync(process.execPath, [structure, '--map', 'context-map.json', '--lenses', path.join(BP, 'docs', 'standard', 'lenses')], { cwd: root, encoding: 'utf8' });
  assert.equal(s1.status, 0, s1.stderr);
  assert.equal(JSON.parse(s1.stdout).mode, 'merge');
  m = JSON.parse(fs.readFileSync(path.join(root, '.ai/lens-scan/app-structure.json'), 'utf8'));
  assert.deepEqual(m.features.map((f) => [f.slug, f.stage]), [['editor', 'live'], ['api', 'in-dev']]);
  assert.equal(m.facets.api.design.applicable, false);

  r = run(root, 'validate');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  r = run(root, 'register', '--slug', 'tiny-adopt-test', '--name', 'Tiny');
  assert.equal(r.status, 0, r.stderr);
  assert.match(fs.readFileSync(path.join(root, '.claude/lens-scan/config.md'), 'utf8'), /project_slug: tiny-adopt-test/);
  // leave bp's registry as it was
  const reg = path.join(BP, 'bp.products.local.json');
  const doc = JSON.parse(fs.readFileSync(reg, 'utf8'));
  doc.products = doc.products.filter((p) => p.slug !== 'tiny-adopt-test');
  fs.writeFileSync(reg, `${JSON.stringify(doc, null, 2)}
`);
  fs.rmSync(root, { recursive: true, force: true });
});
