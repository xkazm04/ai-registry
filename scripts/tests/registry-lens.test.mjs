import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';
import { registryLensRows, pairMetrics } from '../registry-lens.mjs';

const SCRIPT = fileURLToPath(new URL('../registry-lens.mjs', import.meta.url));
const write = (file, body) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof body === 'string' ? body : JSON.stringify(body, null, 2));
};
const pair = (subject, state, extra = {}) => ({ subject, bundle: 'software-engineering', score: 100, confidence: 'strong', state, ...extra });

/**
 * A machine root holding one product and one registry. Three features: one spanning two
 * contexts through a directory entry, one inside a single context, one no context claims.
 */
function fixture(fn, { map = true } = {}) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-lens-'));
  try {
    const root = path.join(base, 'work', 'shop');
    const registry = path.join(base, 'registry');
    for (const f of ['src/cart/a.ts', 'src/cart/b.ts', 'src/pay/c.ts', 'src/pay/d.ts', 'docs/x.md']) write(path.join(root, f), '// x\n');
    write(path.join(root, 'context-map.json'), { contexts: [
      { id: 'c-cart', name: 'cart', file_paths: ['src/cart/'] },
      { id: 'c-pay', name: 'pay', file_paths: ['src/pay/c.ts', 'src/pay/d.ts'] },
      { id: 'c-docs', name: 'docs', file_paths: ['docs/x.md'] },
    ] });
    write(path.join(root, '.ai', 'lens-scan', 'app-structure.json'), {
      contexts: [
        { name: 'checkout', file_paths: ['src/cart/a.ts', 'src/pay/c.ts'] },
        { name: 'payments', file_paths: ['src/pay/'] },
        { name: 'ghost', file_paths: ['src/gone.ts'] },
      ],
      features: [
        { slug: 'checkout', contexts: ['checkout'] },
        { slug: 'payments', contexts: ['payments'] },
        { slug: 'ghost', contexts: ['ghost'] },
      ],
    });
    if (map) write(path.join(root, '.ai', 'registry-map.json'), { contexts: [
      { context: 'c-cart', name: 'cart', subjects: [pair('state-machines', 'conformant'), pair('money', 'deviation', { stale: true }), pair('forms', 'unknown')] },
      { context: 'c-pay', name: 'pay', subjects: [pair('money', 'not-applicable'), pair('retry', 'deviation', { revisionsBehind: 2 }), pair('idempotency', 'unknown'), pair('idempotency', 'unknown')] },
    ] });
    write(path.join(root, '.ai', 'registry-leads.jsonl'), '{"ts":"2026-10-01"}\n{"ts":"2026-10-02"}\n\n');
    write(path.join(root, '.ai', 'applied.jsonl'), '{"verdict":"better"}\n{"verdict":"unmeasurable"}\n{"verdict":"better"}\n');
    write(path.join(registry, '.machine.local.json'), { machine: 'Box', root: base });
    write(path.join(registry, 'projects.json'), { schema: 2, machines: { Box: {} }, projects: { shop: { checkouts: { Box: 'work/shop' } } } });
    write(path.join(registry, 'librarian', 'inbox.md'), [
      '| date | bundle | nearest subject | kind | claim | conf | from |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      '| ~~2026-09-01~~ | software-engineering | money | technique | ~~a \\| piped claim~~ **LANDED [[r]] -> money/x** | high | shop / scan-sweep@2.0.0 |',
      '| 2026-09-02 | software-engineering | money | technique | open claim | high | shop / scan-sweep@2.0.0 |',
      '| ~~2026-09-03~~ | software-engineering | money | technique | ~~c~~ **LANDED [[r]] -> money/y** | high | shopfront / scan-sweep@2.0.0 |',
    ].join('\n'));
    fn({ base, root, registry });
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
}
const byFeature = (rows) => {
  const out = {};
  for (const r of rows) (out[r.feature] ??= {})[r.metric ?? 'applicable'] = r.metric ? r.value : r.applicable;
  return out;
};

test('a feature is measured over every context its files touch, pairs deduped', () => {
  fixture(({ root, registry }) => {
    const f = byFeature(registryLensRows({ slug: 'shop', root, registry }));
    // checkout touches cart (via the expanded directory) and pay: 3 + 3 distinct pairs.
    assert.equal(f.checkout.topicsMapped, 6);
    assert.equal(f.checkout.judgedPct, 66.7);      // 4 of 6 judged
    assert.equal(f.checkout.conformantPct, 33.3);  // 1 of 3 conformant+deviation; the not-applicable pair is out
    assert.equal(f.checkout.deviations, 2);
    assert.equal(f.checkout.staleVerdicts, 2);     // stale:true and revisionsBehind > 0
    // payments touches pay only: not-applicable + deviation -> conformantPct 0 of 1.
    assert.deepEqual([f.payments.topicsMapped, f.payments.judgedPct, f.payments.conformantPct, f.payments.deviations], [3, 66.7, 0, 1]);
  });
});

test('project-level values repeat on every measured feature', () => {
  fixture(({ root, registry }) => {
    const rows = registryLensRows({ slug: 'shop', root, registry });
    const f = byFeature(rows);
    for (const slug of ['checkout', 'payments']) {
      assert.deepEqual([f[slug].registered, f[slug].leadsFiled, f[slug].leadsLanded, f[slug].appliedBetter], [1, 2, 1, 2]);
    }
    assert.ok(rows.filter((r) => r.metric === 'registered').every((r) => r.evidence.startsWith('project-level:')));
  });
});

test('a feature no context claims is not applicable, and carries nothing else', () => {
  fixture(({ root, registry }) => {
    const rows = registryLensRows({ slug: 'shop', root, registry }).filter((r) => r.feature === 'ghost');
    assert.deepEqual(rows, [{ feature: 'ghost', applicable: false, reason: 'no context in context-map.json claims its files' }]);
  });
});

test('no registry map: per-feature metrics are omitted, never zero', () => {
  fixture(({ root, registry }) => {
    const f = byFeature(registryLensRows({ slug: 'shop', root, registry }));
    assert.equal('topicsMapped' in f.checkout, false);
    assert.equal('judgedPct' in f.checkout, false);
    assert.equal(f.checkout.registered, 1);
  }, { map: false });
});

test('an unregistered checkout reads registered 0; no machine identity omits the row', () => {
  fixture(({ root, registry }) => {
    write(path.join(registry, 'projects.json'), { schema: 2, machines: { Box: {} }, projects: {} });
    assert.equal(byFeature(registryLensRows({ slug: 'shop', root, registry })).checkout.registered, 0);
    fs.rmSync(path.join(registry, '.machine.local.json'));
    assert.equal('registered' in byFeature(registryLensRows({ slug: 'shop', root, registry })).checkout, false);
  });
});

test('percentages with no denominator are omitted', () => {
  assert.deepEqual(pairMetrics([{ context: 'c', subjects: [] }]).metrics, { topicsMapped: 0, deviations: 0, staleVerdicts: 0 });
  const m = pairMetrics([{ context: 'c', subjects: [pair('a', 'unknown')] }]).metrics;
  assert.equal(m.judgedPct, 0);
  assert.equal('conformantPct' in m, false);
  // Judged, but only not-applicable: no conformant+deviation denominator either.
  const na = pairMetrics([{ context: 'c', subjects: [pair('a', 'not-applicable'), pair('b', 'unknown')] }]).metrics;
  assert.equal(na.judgedPct, 50);
  assert.equal('conformantPct' in na, false);
});

test('CLI: --features limits the rows; bad input exits FATAL with one line', () => {
  fixture(({ root, registry }) => {
    const ok = spawnSync(process.execPath, [SCRIPT, '--project', 'shop', '--path', root, '--registry', registry, '--features', 'payments', '--json'], { encoding: 'utf8' });
    assert.equal(ok.status, EXIT.OK, ok.stderr);
    assert.deepEqual([...new Set(JSON.parse(ok.stdout).map((r) => r.feature))], ['payments']);
    const bad = spawnSync(process.execPath, [SCRIPT, '--project', 'shop', '--path', root, '--registry', registry, '--features', 'nope', '--json'], { encoding: 'utf8' });
    assert.equal(bad.status, EXIT.FATAL);
    assert.equal(bad.stdout, '');
    assert.equal(bad.stderr.trim().split('\n').length, 1);
  });
});

test('CLI: an unknown flag, or a flag with no value, refuses instead of measuring something else', () => {
  fixture(({ root, registry }) => {
    const cli = (...extra) => spawnSync(process.execPath, [SCRIPT, '--project', 'shop', '--path', root, ...extra, '--json'], { encoding: 'utf8' });
    // `--feature` (singular) used to be ignored, and every feature was measured
    for (const args of [['--registry', registry, '--feature', 'payments'], ['--registry'], ['--registry', registry, '--structure']]) {
      const r = cli(...args);
      assert.equal(r.status, EXIT.FATAL, `${args.join(' ')}: ${r.stdout.slice(0, 120)}`);
      assert.equal(r.stdout, '');
      assert.equal(r.stderr.trim().split('\n').length, 1);
      assert.match(r.stderr, /^registry-lens: /);
    }
  });
});
