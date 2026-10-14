// node --test "skills/explorer/tests/*.mjs" - the pure half of scripts/pick.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  slug, flattenContexts, parseOverlay, parseCoverage, parseSweepCategories, parseClaims,
  parseHistory, resolveRows, hasSurface, rank, pickLine, CATEGORIES,
} from '../scripts/pick.mjs';

const flatMap = {
  contexts: [
    { name: 'alerts', file_paths: ['src/a.rs', 'src/b.rs', 'src/c.rs'], cross_refs: ['billing', 'cli'], keywords: ['webhook'] },
    { name: 'billing', file_paths: ['src/p.rs', 'src/q.rs', 'src/r.rs', 'src/s.rs'], cross_refs: [] },
    { name: 'cli', file_paths: ['src/main.rs'], cross_refs: [] },
    { name: 'dashboard', file_paths: ['app/page.tsx', 'app/Chart.tsx', 'app/data.ts'], cross_refs: ['alerts'] },
  ],
};
const groupedMap = {
  groups: [
    { name: 'Data & Persistence', contexts: [{ name: 'Database Client', filePaths: ['a.ts', 'b.ts', 'c.ts'] }, { name: 'Retention', filePaths: ['r.ts'] }] },
    { name: 'Shell', contexts: [{ name: 'App Shell', filePaths: ['x.tsx', 'y.tsx', 'z.tsx'] }] },
  ],
  relationships: [{ source: 'Data & Persistence', target: 'Shell', type: 'uses' }, { source: 'Data & Persistence', target: 'X', type: 'uses' }],
};

test('slug folds ampersands and punctuation', () => {
  assert.equal(slug('Data & Persistence'), 'data-and-persistence');
  assert.equal(slug('  CI Gate / Status  '), 'ci-gate-status');
});

test('flattenContexts reads both map shapes and counts cross-references', () => {
  const flat = flattenContexts(flatMap);
  const alerts = flat.find((c) => c.name === 'alerts');
  assert.equal(alerts.files, 3);
  assert.equal(alerts.crossRefs, 3); // 2 own + 1 inbound from dashboard
  assert.equal(alerts.crossRefSource, 'context');
  assert.equal(flat.find((c) => c.name === 'dashboard').uiFiles, 2);
  const grouped = flattenContexts(groupedMap);
  assert.deepEqual(grouped.map((c) => c.name), ['Database Client', 'Retention', 'App Shell']);
  assert.equal(grouped[0].group, 'Data & Persistence');
  assert.equal(grouped[0].crossRefs, 2); // group degree in relationships
  assert.equal(grouped[0].crossRefSource, 'group');
});

test('parseOverlay reads a vault list, a scalar subdir and the map path', () => {
  const o = parseOverlay('---\nproduct: "x"\nvault: ["/v/one", "/v/two"]\nvault_subdir: Explorer\ncontext_map: maps/ctx.json\n---\n# body');
  assert.deepEqual(o.vault, ['/v/one', '/v/two']);
  assert.equal(o.vault_subdir, 'Explorer');
  assert.equal(o.context_map, 'maps/ctx.json');
  assert.deepEqual(parseOverlay('no frontmatter').vault, []);
});

test('parseCoverage reads Lenses and Contexts, and marks legacy rows', () => {
  const md = [
    '# Explorer Coverage', '', '## Areas', '',
    '### data-and-persistence  (group sweep)', '', '- Last visited: 2026-08-29', '- Items surfaced (last 3 runs): [10]', '',
    '### alerts', '', '- Last visited: 2026-10-14', '- Contexts: alerts | billing', '- Lenses: bug 2026-10-14, sec, nonsense 2026-01-01', '',
  ].join('\n');
  const rows = parseCoverage(md);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].slug, 'data-and-persistence');
  assert.equal(rows[0].lenses, null);
  assert.deepEqual(rows[1].contexts, ['alerts', 'billing']);
  assert.deepEqual([...rows[1].lenses.entries()], [['bug', '2026-10-14'], ['sec', '2026-10-14']]);
});

test('parseSweepCategories backfills lenses from item lines and frontmatter', () => {
  const md = '---\nlenses: [ui, "a11y"]\n---\n**Category / Severity / Effort:** bug / high / s\n**Category / Severity / Effort:** perf / medium / m · **Standard:** none\n';
  assert.deepEqual([...parseSweepCategories(md)].sort(), ['a11y', 'bug', 'perf', 'ui']);
});

test('parseClaims keeps only fresh Active claims', () => {
  const now = Date.parse('2026-10-14T12:00:00Z');
  const md = '# State\n\n## Active\n\n- **alerts** - claimed_at: 2026-10-14T11:30:00Z, run_id: a1, category: any\n- **billing** - claimed_at: 2026-10-14T08:00:00Z, run_id: b2\n\n## Recently completed\n- **cli** - claimed_at: 2026-10-14T11:59:00Z\n';
  assert.deepEqual([...parseClaims(md, now)], ['alerts']);
});

test('parseHistory unions lens keys per scope and skips challenge rounds and junk', () => {
  const jsonl = [
    JSON.stringify({ at: '2026-09-01T00:00:00Z', scope: 'alerts', strategy: 'stabilize', lens_keys: ['security-auditor'] }),
    JSON.stringify({ at: '2026-09-05T00:00:00Z', scope: 'alerts', strategy: 'develop', lens_keys: ['feature-scout', 'bounty-hunter'] }),
    JSON.stringify({ at: '2026-09-09T00:00:00Z', scope: 'alerts', strategy: 'challenge', lens_keys: ['architecture-challenger'] }),
    'not json',
  ].join('\n');
  const h = parseHistory(jsonl).get('alerts');
  assert.equal(h.rounds, 2);
  assert.equal(h.last, '2026-09-05T00:00:00Z');
  assert.deepEqual([...h.keys].sort(), ['bounty-hunter', 'feature-scout', 'security-auditor']);
});

test('resolveRows maps rows by Contexts, by context slug, then by group slug', () => {
  const contexts = flattenContexts(groupedMap);
  const rows = parseCoverage('### data-and-persistence\n- Last visited: 2026-08-29\n\n### app-shell\n- Last visited: 2026-09-01\n- Lenses: ui\n\n### gone-area\n- Last visited: 2026-01-01\n');
  const { byContext, unresolved } = resolveRows(rows, contexts, (s) => (s === 'data-and-persistence' ? new Set(['bug']) : null));
  assert.deepEqual([...byContext.keys()].sort(), ['App Shell', 'Database Client', 'Retention']);
  assert.equal(byContext.get('Retention').inferred, true);
  assert.ok(byContext.get('Retention').lenses.has('bug'));
  assert.equal(byContext.get('App Shell').inferred, false);
  assert.deepEqual(unresolved, ['gone-area']);
});

test('ui and a11y need a UI file; backend lenses need any file', () => {
  const [alerts, , , dashboard] = flattenContexts(flatMap);
  assert.equal(hasSurface('ui', alerts), false);
  assert.equal(hasSurface('a11y', dashboard), true);
  assert.equal(hasSurface('sec', alerts), true);
});

test('a lens run by scan-sweep is never offered, and a fully covered context drops out', () => {
  const contexts = flattenContexts(flatMap);
  const sweep = parseHistory(JSON.stringify({ at: '2026-09-01T00:00:00Z', scope: 'billing', lens_keys: ['security-auditor', 'bounty-hunter', 'architecture-analyst', 'code-optimizer', 'test-strategist'] }));
  const explorer = new Map([['dashboard', { lenses: new Map(CATEGORIES.map((k) => [k, '2026-10-01'])), last: '2026-10-01', inferred: false, rows: ['dashboard'] }]]);
  const { rows, fullyCovered, firstRun } = rank({ contexts, sweep, explorer });
  assert.equal(firstRun, false);
  assert.ok(fullyCovered.includes('billing')); // five lenses run, ui/a11y/i18n have no surface
  assert.ok(fullyCovered.includes('dashboard'));
  for (const r of rows) assert.ok(!r.covered[r.lens], `${r.context}/${r.lens} was already covered`);
});

test('first run prefers >= 3 files, then the most cross-references', () => {
  const { rows, firstRun } = rank({ contexts: flattenContexts(flatMap) });
  assert.equal(firstRun, true);
  assert.equal(rows[0].context, 'alerts'); // 3 files, 3 cross-refs
  assert.equal(rows[rows.length - 1].context, 'cli'); // 1 file sorts last
});

test('later runs put the least lens-covered context first, and skip claimed ones', () => {
  const contexts = flattenContexts(flatMap);
  const explorer = new Map([['alerts', { lenses: new Map([['bug', '2026-10-01'], ['sec', '2026-10-01']]), last: '2026-10-01', inferred: false, rows: ['alerts'] }]]);
  const { rows } = rank({ contexts, explorer, claimed: new Set(['dashboard']) });
  assert.ok(!rows.some((r) => r.context === 'dashboard'));
  assert.equal(rows[0].context, 'billing');
  const alerts = rows.find((r) => r.context === 'alerts');
  assert.ok(!['bug', 'sec'].includes(alerts.lens));
});

test('--category narrows to one lens', () => {
  const { rows } = rank({ contexts: flattenContexts(flatMap), category: 'ui' });
  assert.deepEqual(rows.map((r) => r.context), ['dashboard']);
  assert.equal(rows[0].lens, 'ui');
});

test('a lens scan-sweep recorded under lens_no_surface is not open', () => {
  const contexts = flattenContexts(flatMap);
  const sweep = parseHistory([
    JSON.stringify({ at: '2026-09-01T00:00:00Z', scope: 'alerts', lens_keys: ['security-auditor'], lens_no_surface: ['dependency-auditor', { key: 'code-optimizer', reason: 'no hot path' }] }),
  ].join('\n'));
  const h = sweep.get('alerts');
  assert.deepEqual([...h.noSurface].sort(), ['code-optimizer', 'dependency-auditor']);
  assert.deepEqual([...h.keys], ['security-auditor']);
  const alerts = rank({ contexts, sweep }).rows.find((r) => r.context === 'alerts');
  for (const l of ['dx', 'perf', 'sec']) assert.ok(l !== alerts.lens && !alerts.alsoOpen.includes(l), l + ' should not be open');
  assert.equal(alerts.noSurfaceBy.dx, 'scan-sweep:dependency-auditor');
  assert.equal(alerts.noSurfaceBy.ui, 'map');
  // a recorded no-surface closes the lens even when it is asked for directly
  assert.equal(rank({ contexts, sweep, category: 'dx' }).rows.some((r) => r.context === 'alerts'), false);
});

test('pickLine names the pair and cites both ledgers', () => {
  const contexts = flattenContexts(flatMap);
  const sweep = parseHistory(JSON.stringify({ at: '2026-09-01T00:00:00Z', scope: 'billing', lens_keys: ['bounty-hunter'], lens_no_surface: ['test-strategist'] }));
  const explorer = new Map([['alerts', { lenses: new Map([['bug', '2026-10-01']]), last: '2026-10-01', inferred: false, rows: ['alerts'] }]]);
  const { rows } = rank({ contexts, sweep, explorer });
  const billing = rows.find((r) => r.context === 'billing');
  const line = pickLine(billing);
  assert.ok(line.startsWith('pick: billing / ' + billing.lens + ' - '), line);
  assert.ok(line.includes('explorer never'), line);
  assert.ok(line.includes('scan-sweep 1 round(s), last 2026-09-01'), line);
  assert.ok(line.includes('no surface: dx (scan-sweep:test-strategist)'), line);
  assert.ok(pickLine(rows.find((r) => r.context === 'alerts')).includes('explorer 2026-10-01; scan-sweep never'));
});
