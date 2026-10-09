// node --test skills/lens-scan/tests
// Pins the phase-1 conversion (SKILL.md "1. Structure"): domains from group.domain, capabilities
// from groups, one feature per context with kind and use-case tags, lenses embedded, the store's
// latest measurements merged into facets, nulls dropped, and byte-identical output on a re-run.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { toAppStructure, slugify, main } from '../scripts/structure.mjs';
import { openStore, runStart, measure } from '../scripts/store.mjs';

const MAP = {
  version: 2,
  generated_at: '2026-09-21T21:06:40.852713700+00:00',
  generator: 'example-scan',
  project: { name: 'example', root: '/somewhere/machine-specific' },
  taxonomy: { context_categories: ['ui', 'lib', 'test'] },
  groups: [
    { id: 'g1', name: 'Billing & Invoices', domain: 'feature' },
    { id: 'g2', name: 'Platform Core', domain: 'infrastructure' },
    { id: 'g3', name: 'Loose Ends' },
  ],
  contexts: [
    { id: 'c1', name: 'invoice-editor', group: 'Billing & Invoices', category: 'ui', business_feature: 'Invoice Editing', description: 'Edit invoices.', file_paths: ['src/a.ts'], api_surface: null },
    { id: 'c2', name: 'invoice-api', group_id: 'g1', category: 'lib', file_paths: [] },
    { id: 'c3', name: 'core-tests', group: 'Platform Core', category: 'test' },
    { id: 'c4', name: 'misc', group: 'Loose Ends' },
  ],
  use_cases: [
    { name: 'Send an invoice', contexts: ['invoice-editor', 'c2'] },
    { name: 'Get paid', contexts: [{ name: 'invoice-editor' }] },
  ],
};
const LENS = (id) => ({ $schema: 'lens-manifest/1', id, version: '1.1.0', name: id, reader: { density: 'simple' }, fields: [], health: { rules: [], default: 'good', rollup: { method: 'worst-of' } }, presentation: { glyph: 'bars', line: 'solid' } });

test('slugify', () => {
  assert.equal(slugify('Automation & Pipelines'), 'automation-pipelines');
  assert.equal(slugify('  Ünïcode Name '), 'unicode-name');
});

test('conversion: counts, mapping, tags, lenses, facets', () => {
  const latest = [
    { feature: 'invoice-editor', lens: 'development', metric: 'loc', value: 120, measured_at: '2026-10-01T10:00:00.000Z' },
    { feature: 'invoice-editor', lens: 'development', metric: 'files', value: 4, measured_at: '2026-10-02T10:00:00.000Z' },
    { feature: 'gone-feature', lens: 'development', metric: 'loc', value: 1, measured_at: '2026-10-03T10:00:00.000Z' },
  ];
  const { structure: s, report } = toAppStructure(MAP, { lenses: [LENS('development'), LENS('com.example.cost')], latest, projectSlug: 'example', projectName: 'Example' });
  assert.equal(s.$schema, 'app-structure/3');
  assert.deepEqual(s.domains.map((d) => d.slug), ['feature', 'infrastructure', 'unassigned']);
  assert.deepEqual(s.capabilities.map((c) => [c.slug, c.domain]), [['billing-invoices', 'feature'], ['platform-core', 'infrastructure'], ['loose-ends', 'unassigned']]);
  assert.equal(s.features.length, 4);
  const ed = s.features.find((f) => f.slug === 'invoice-editor');
  assert.equal(ed.name, 'Invoice Editing');
  assert.equal(ed.kind, 'ui');
  assert.equal(ed.capability, 'billing-invoices');
  assert.equal(ed.summary, 'Edit invoices.');
  assert.deepEqual(ed.contexts, ['invoice-editor']);
  assert.equal(ed.primary_context, 'invoice-editor');
  assert.deepEqual(ed.tags, ['Get paid', 'Send an invoice']);
  const api = s.features.find((f) => f.slug === 'invoice-api');
  assert.equal(api.capability, 'billing-invoices', 'group resolved by group_id');
  assert.deepEqual(api.tags, ['Send an invoice'], 'a use case may list a context by id');
  assert.equal('tags' in s.features.find((f) => f.slug === 'misc'), false, 'no empty tag list');
  assert.equal('stage' in ed, false, 'stage is never guessed');
  assert.deepEqual(s.lenses.map((l) => [l.id, l.source, l.enabled, l.version]), [['development', 'builtin', true, '1.1.0'], ['com.example.cost', 'project', true, '1.1.0']]);
  assert.deepEqual(s.facets['invoice-editor'].development, { values: { files: 4, loc: 120 }, source: 'lens-scan', measured_at: '2026-10-02T10:00:00.000Z' });
  assert.equal(report.skipped_measurements, 1);
  assert.equal(s.generated_at, '2026-10-02T10:00:00.000Z', 'the newest MERGED input; a skipped row does not count');
  assert.equal('root' in s.project, false, 'the machine-specific root is not copied');
  assert.equal(JSON.stringify(s).includes('null'), false, 'v3 omits unknown values');
  assert.equal(s.stats.features, 4);
});

test('cli: store merge and idempotent re-run', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'lens-scan-structure-'));
  const lensDir = join(dir, 'lenses');
  mkdirSync(lensDir);
  writeFileSync(join(lensDir, 'development.json'), JSON.stringify(LENS('development')));
  writeFileSync(join(lensDir, 'notes.json'), '{"not":"a manifest"}');
  writeFileSync(join(dir, 'context-map.json'), JSON.stringify(MAP));
  const dbPath = join(dir, '.ai', 'lens-scan', 'scan.db');
  const db = openStore(dbPath);
  const { id } = runStart(db, { phase: 'measure', lenses: 'development' });
  measure(db, id, { feature: 'misc', lens: 'development', metric: 'loc', value: 7 });
  measure(db, id, { feature: 'misc', lens: 'development', metric: 'loc', value: 8 });
  db.close();
  const args = ['--map', join(dir, 'context-map.json'), '--lenses', lensDir, '--db', dbPath, '--out', join(dir, 'out', 'app-structure.json')];
  const first = await main(args);
  assert.equal(first.written, true);
  assert.equal(first.features, 4);
  assert.deepEqual(first.skipped_lens_files, ['notes.json']);
  const text = readFileSync(join(dir, 'out', 'app-structure.json'), 'utf8');
  assert.equal(JSON.parse(text).facets.misc.development.values.loc, 8, 'the latest measurement is the facet value');
  const second = await main(args);
  assert.equal(second.written, false, 'same inputs, same bytes, no rewrite');
  assert.equal(readFileSync(join(dir, 'out', 'app-structure.json'), 'utf8'), text);
  const none = await main([...args.slice(0, 4), '--db', join(dir, 'missing.db'), '--dry']);
  assert.equal(none.store, 'none');
});
