// Deterministic tests for style-divergence.mjs and the shared grouping rule:
// `node --test skills/kit/tests`. Builtins only; the fixture tree is created in a temp dir
// and analysed with git switched off, so nothing here depends on the host repository.
//
// What is worth pinning: (1) every instrument groups a file into the same module, and the
// default rule is the sub_ heuristic the campaign was forged on; (2) a score is weighted raw
// usage per 100 LOC and debt converts it back to occurrences; (3) config can re-weight,
// remove and add metrics without touching the defaults; (4) the phantom-class metric is
// empty until a project supplies its list.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { moduleOf, parseGrouping, isSystemModule, fileFilter, relToRoot, stripJsonComments } from '../scripts/lib/modules.mjs';
import { analyze, render, buildMetrics, countMetrics, scoreOf, debtOf, defaultMetrics } from '../scripts/style-divergence.mjs';

const SUB = { kind: 'sub' };

test('sub rule: the feature/sub_x heuristic, root files and the system prefix', () => {
  assert.equal(moduleOf('Top.tsx', SUB), '(root)');
  assert.equal(moduleOf('settings/Page.tsx', SUB), 'settings/(root)');
  assert.equal(moduleOf('settings/sub_admin/A.tsx', SUB), 'settings/sub_admin');
  assert.equal(moduleOf('settings/sub_admin/deep/er/A.tsx', SUB), 'settings/sub_admin');
  assert.equal(moduleOf('plugins/twin/sub_training/A.tsx', SUB), 'plugins/twin/sub_training');
  assert.equal(moduleOf('plugins/twin/A.tsx', SUB), 'plugins/twin');
  assert.equal(moduleOf('templates/components/x/A.tsx', SUB), 'templates/components');
  assert.equal(moduleOf('shared/components/forms/Input.tsx', SUB), 'shared/components/forms');
  assert.equal(moduleOf('shared/chrome/Bar.tsx', SUB), 'shared/chrome/(root)');
  // A different system folder name is honoured; "shared" is then an ordinary feature.
  assert.equal(moduleOf('ds/buttons/x/B.tsx', SUB, 'ds/'), 'ds/buttons/x');
  assert.equal(moduleOf('shared/components/forms/Input.tsx', SUB, 'ds/'), 'shared/components');
});

test('depth rule and grouping parser', () => {
  const d2 = parseGrouping('depth:2');
  assert.deepEqual(d2, { kind: 'depth', n: 2 });
  assert.equal(moduleOf('a/b/c/X.tsx', d2), 'a/b');
  assert.equal(moduleOf('a/X.tsx', d2), 'a/(root)');
  assert.equal(moduleOf('X.tsx', d2), '(root)');
  assert.equal(moduleOf('a/b/X.tsx', parseGrouping('depth:1')), 'a');
  assert.deepEqual(parseGrouping(undefined), SUB);
  assert.throws(() => parseGrouping('depth:0'), /unknown rule/);
  assert.throws(() => parseGrouping('folders'), /unknown rule/);
});

test('system detection, file filter, root-relative paths, JSONC stripping', () => {
  assert.equal(isSystemModule('shared/components/forms'), true);
  assert.equal(isSystemModule('settings/shared'), false);
  assert.equal(isSystemModule('ds/x', 'ds'), true);
  assert.equal(isSystemModule('shared'), true, 'depth:1 names the system folder itself');
  const f = fileFilter({ extensions: ['.tsx'], exclude: '__tests__|\\.test\\.|\\.stories\\.' });
  assert.equal(f('src/features/a/B.tsx'), true);
  assert.equal(f('src/features/a/B.test.tsx'), false);
  assert.equal(f('src/features/a/__tests__/B.tsx'), false);
  assert.equal(f('src/features/a/b.ts'), false);
  assert.equal(relToRoot('src/features/a/B.tsx', 'src/features/'), 'a/B.tsx');
  assert.equal(relToRoot('src/lib/x.ts', 'src/features'), null);
  assert.deepEqual(JSON.parse(stripJsonComments('{ // c\n "a": "x//y", /* b */ "b": [1,], }')), { a: 'x//y', b: [1] });
});

test('score = weighted raw usage per 100 LOC; debt converts it back', () => {
  const metrics = buildMetrics({});
  const src = '<div className="text-sm rounded-lg bg-white text-foreground/60" />\n<button/>\n';
  const c = countMetrics(src, metrics);
  assert.equal(c.rawText, 1);
  assert.equal(c.rawRadius, 1);
  assert.equal(c.rawBW, 1);
  assert.equal(c.dimText, 1);
  assert.equal(c.button, 1);
  // 3 + 1.5 + 1.5 + 0.5 + 0.25 = 6.75 raw over 3 LOC.
  const s = scoreOf({ ...c, loc: 3 }, metrics);
  assert.equal(+s.toFixed(2), 225);
  assert.equal(debtOf(s, 3), 7);
  assert.equal(scoreOf({ loc: 0 }, metrics), 0);
  // CSS weight only counts when set.
  assert.equal(scoreOf({ cssRaw: 4, loc: 100 }, metrics, 0), 0);
  assert.equal(scoreOf({ cssRaw: 4, loc: 100 }, metrics, 1), 4);
});

test('metric config: re-weight, remove, add, replace; phantom list comes from config', () => {
  const m = buildMetrics({ metrics: { rawText: { weight: 10 }, button: null, bespoke: { pattern: 'kit-legacy', weight: 2 } } });
  assert.equal(m.rawText[1], 10);
  assert.equal(m.button, undefined);
  assert.equal(countMetrics('kit-legacy kit-legacy', m).bespoke, 2);
  assert.ok(m.bespoke[0].flags.includes('g'));
  assert.deepEqual(Object.keys(buildMetrics({ replaceMetrics: true, metrics: { only: { pattern: 'x', weight: 1 } } })), ['only']);
  assert.throws(() => buildMetrics({ metrics: { nope: { weight: 1 } } }), /no pattern/);
  assert.equal(countMetrics('typo-body-sm', defaultMetrics()).phantomTypo, 0);
  const ph = buildMetrics({ phantomClasses: ['typo-body-sm', 'typo-display'] });
  assert.equal(countMetrics('<p className="typo-body-sm typo-display typo-body"/>', ph).phantomTypo, 2);
});

function fixtureTree() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-div-'));
  const w = (rel, text) => { const p = path.join(dir, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); };
  // noisy: 4 raw-text hits in 2 lines -> 600 per 100 LOC.
  w('src/features/noisy/sub_a/A.tsx', '<p className="text-sm text-lg"/>\n<p className="text-xs text-xl"/>');
  // clean: tokens only.
  w('src/features/clean/sub_b/B.tsx', '<p className="typo-body rounded-card"/>\nimport { Button } from "@/features/shared/components/buttons/Button";');
  w('src/features/clean/sub_b/B.test.tsx', '<p className="text-sm text-sm text-sm"/>');
  w('src/features/clean/sub_b/B.css', '.x { font-size: 12px; color: #fff; }');
  w('src/features/shared/components/buttons/Button.tsx', '<button className="rounded-lg"/>');
  w('src/features/solo.tsx', 'export const x = 1;');
  return dir;
}

test('analyze a fixture tree without git: modules, ranking, system split, outputs', () => {
  const dir = fixtureTree();
  try {
    const res = analyze(dir, {}, { noGit: true, now: Date.parse('2026-01-31T00:00:00Z') });
    assert.equal(res.useGit, false);
    assert.equal(res.files, 4, 'test file excluded');
    const byMod = Object.fromEntries(res.rows.map((r) => [r.module, r]));
    assert.deepEqual(Object.keys(byMod).sort(), ['(root)', 'clean/sub_b', 'noisy/sub_a', 'shared/components/buttons']);
    assert.equal(res.rows[0].module, 'noisy/sub_a', 'highest score first');
    assert.equal(byMod['noisy/sub_a'].score, 600);
    assert.equal(byMod['noisy/sub_a'].debt, 12);
    assert.equal(byMod['noisy/sub_a'].typeRaw, 4);
    assert.equal(byMod['clean/sub_b'].score, 0);
    assert.equal(byMod['clean/sub_b'].cssRaw, 2, 'co-located css counted');
    assert.equal(byMod['clean/sub_b'].sharedDistinct, 1);
    assert.equal(byMod['shared/components/buttons'].system, true);
    assert.equal(byMod['noisy/sub_a'].last, '');
    const { csv, md, json } = render(res, 10);
    assert.match(csv.split('\n')[0], /^module,system,score,debt,files,loc,big,newFiles,last,c30,rawText,/);
    assert.match(md, /^files=4 modules=4 since=2026-01-01/);
    assert.match(md, /## shared\/ \(system\) modules/);
    const j = JSON.parse(json);
    assert.equal(j.modules.length, 4);
    assert.deepEqual(j.modules.find((m) => m.module === 'clean/sub_b').sharedNames, ['Button']);
    // depth:1 groups by feature folder instead.
    const d1 = analyze(dir, { grouping: 'depth:1' }, { noGit: true });
    assert.deepEqual(d1.rows.map((r) => r.module).sort(), ['(root)', 'clean', 'noisy', 'shared']);
    assert.equal(d1.rows.find((r) => r.module === 'shared').system, true);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
