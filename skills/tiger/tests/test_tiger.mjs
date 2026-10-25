import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  huntAreas, huntGroups, parseTouches, parseSeatOutput, parseAnchor, checkAnchors,
  buildPool, peerScores, poolMarkdown, seatStats, isCode, isTest,
} from '../scripts/lib/hunt.mjs';

const NOW = 1_800_000_000;

test('parseTouches counts commits per file and keeps the most recent touch', () => {
  const log = `@@${NOW - 86400 * 2}\n\na/x.ts\nb/y.ts\n@@${NOW - 86400 * 10}\n\na/x.ts\n`;
  const t = parseTouches(log, NOW);
  assert.deepEqual(t.get('a/x.ts'), { commits: 2, last_days: 2 });
  assert.deepEqual(t.get('b/y.ts'), { commits: 1, last_days: 2 });
});

test('isCode skips vendored, generated and asset paths; isTest finds test files', () => {
  assert.ok(isCode('src/a.ts'));
  assert.ok(!isCode('node_modules/x/index.js'));
  assert.ok(!isCode('dist/app.js'));
  assert.ok(!isCode('package-lock.json'));
  assert.ok(!isCode('src/logo.svg'));
  assert.ok(isTest('src/a.test.ts') && isTest('tests/test_a.py') && isTest('src/__tests__/a.ts'));
  assert.ok(!isTest('src/attest.ts'));
});

test('huntAreas prefers the hot feature dir over its container and ignores test files', () => {
  const files = [];
  const touches = new Map();
  for (let i = 0; i < 10; i += 1) {
    files.push({ path: `src/features/billing/f${i}.ts`, bytes: 2048 });
    touches.set(`src/features/billing/f${i}.ts`, { commits: 5, last_days: 1 });
    files.push({ path: `src/features/profile/f${i}.ts`, bytes: 1024 });
    touches.set(`src/features/profile/f${i}.ts`, { commits: 1, last_days: 30 });
    files.push({ path: `src/__tests__/t${i}.test.ts`, bytes: 4096 });
    files.push({ path: `src/other/o${i}.ts`, bytes: 512 });
  }
  const areas = huntAreas(files, touches, { minFiles: 6, maxShare: 0.6 });
  const names = areas.map((a) => a.area);
  assert.equal(names[0], 'src/features/billing');
  assert.ok(names.includes('src/features/profile'));
  assert.ok(!names.includes('src/features'), 'a container with two candidate children is not an area');
  assert.ok(!names.some((n) => n.includes('__tests__')), 'test trees are not areas');
  assert.equal(areas[0].commits, 50);
});

test('huntGroups ranks a group by use-case reach as well as churn', () => {
  const map = {
    contexts: [
      { name: 'quote', group: 'Pricing', file_paths: ['src/p/a.ts', 'src/p/b.ts'] },
      { name: 'infra', group: 'Infra', file_paths: ['src/i/a.ts', 'src/i/b.ts'] },
    ],
    use_cases: [
      { slug: 'get-a-quote', contexts: ['quote'], tier: 'major' },
      { slug: 'compare', contexts: ['quote'], tier: 'standard' },
    ],
  };
  const touches = new Map([['src/p/a.ts', { commits: 4, last_days: 3 }], ['src/i/a.ts', { commits: 6, last_days: 1 }], ['src/i/b.ts', { commits: 6, last_days: 1 }]]);
  const rows = huntGroups(map, touches, () => 1024);
  assert.equal(rows[0].group, 'Pricing', 'two flows incl. a major one outweigh 3x churn');
  assert.deepEqual(rows[0].major_use_cases, ['get-a-quote']);
  assert.equal(rows[1].commits, 12);
});

test('huntGroups reads a nested groups[].contexts[] map, the group named by its parent', () => {
  const map = {
    groups: [
      { name: 'desk-linga', contexts: [{ name: 'linga', file_paths: ['desk/e/a.ts', 'desk/e/b.ts'] }] },
      { name: 'tooling', contexts: [{ name: 'uat', file_paths: ['uat/a.cjs'] }, { name: 'kpi', file_paths: ['tools/k.cjs'] }] },
    ],
  };
  const touches = new Map([['desk/e/a.ts', { commits: 9, last_days: 0 }], ['uat/a.cjs', { commits: 2, last_days: 4 }]]);
  const rows = huntGroups(map, touches, () => 1024);
  assert.deepEqual(rows.map((r) => r.group), ['desk-linga', 'tooling']);
  assert.equal(rows[0].contexts, 1);
  assert.equal(rows[1].contexts, 2);
  assert.equal(rows[1].files, 2);
});

test('parseSeatOutput reads the last fenced json block and normalises fields', () => {
  const text = 'thinking...\n```json\n{"proposals":[{"title":"old"}]}\n```\nfinal:\n```json\n' + JSON.stringify({
    proposals: [
      { title: 'Stream the ranking', kind: 'deepen', anchors: ['src/a.ts:10-20'], effort: 's', verify: 'p95 < 2s' },
      { title: 'Bad kind', kind: 'revolution', anchors: [], verify: '' },
    ],
  }) + '\n```\n';
  const r = parseSeatOutput(text);
  assert.equal(r.proposals.length, 2);
  assert.equal(r.proposals[0].title, 'Stream the ranking');
  assert.equal(r.proposals[0].effort, 'S');
  assert.equal(r.proposals[1].kind, 'extend');
  assert.ok(r.problems.some((p) => p.includes('kind "revolution"')));
  assert.ok(r.problems.some((p) => p.includes('no anchors')));
});

test('parseSeatOutput reports a seat that returned no JSON', () => {
  const r = parseSeatOutput('I could not finish.');
  assert.equal(r.proposals.length, 0);
  assert.match(r.problems[0], /no JSON block/);
});

test('parseSeatOutput keeps only well-formed ratings', () => {
  const r = parseSeatOutput('```json\n{"ratings":[{"id":"P01","score":8,"why":"x"},{"id":"P02","score":11},{"id":"zz","score":5}],"proposals":[]}\n```');
  assert.deepEqual(r.ratings.map((x) => x.id), ['P01']);
});

test('parseAnchor handles ranges, #L anchors, backslashes and bare paths', () => {
  assert.deepEqual(parseAnchor('src/a.ts:12'), { file: 'src/a.ts', from: 12, to: 12 });
  assert.deepEqual(parseAnchor('`./src/a.ts:12-30`'), { file: 'src/a.ts', from: 12, to: 30 });
  assert.deepEqual(parseAnchor('src\\b.py#L4-L9'), { file: 'src/b.py', from: 4, to: 9 });
  assert.deepEqual(parseAnchor('src/c.rs'), { file: 'src/c.rs', from: null, to: null });
  assert.equal(parseAnchor('the ranking module'), null);
});

test('checkAnchors flags missing files and out-of-range lines', () => {
  const lines = { 'src/a.ts': 50 };
  const r = checkAnchors(['src/a.ts:10-20', 'src/a.ts:49-80', 'src/gone.ts:1', 'prose'], (f) => lines[f] ?? null);
  assert.equal(r.ok, 1);
  assert.equal(r.total, 4);
  assert.equal(r.bad.length, 3);
});

const pool2 = () => {
  const r1 = buildPool([
    { seat: 'codex-x', spec: 'codex:x@high', round: 1, proposals: [{ title: 'A', anchors: [] }, { title: 'B', anchors: [] }], ratings: [] },
    { seat: 'grok-y', spec: 'grok:y@high', round: 1, proposals: [{ title: 'C', anchors: [] }], ratings: [] },
  ]);
  return buildPool([
    { seat: 'codex-x', spec: 'codex:x@high', round: 2, proposals: [{ title: 'A+C', anchors: [], parents: ['P01', 'P03'] }], ratings: [{ id: 'P01', score: 10 }, { id: 'P03', score: 6 }] },
    { seat: 'grok-y', spec: 'grok:y@high', round: 2, proposals: [], ratings: [{ id: 'P01', score: 8 }, { id: 'P02', score: 4 }, { id: 'P03', score: 9 }] },
  ], r1);
};

test('buildPool assigns stable global ids across rounds and letters per seat', () => {
  const p = pool2();
  assert.deepEqual(p.proposals.map((x) => x.id), ['P01', 'P02', 'P03', 'P04']);
  assert.equal(p.proposals[3].round, 2);
  assert.equal(p.seats['codex-x'].letter, 'A');
  assert.equal(p.seats['grok-y'].letter, 'B');
});

test('peerScores ignores a seat rating its own proposals', () => {
  const s = peerScores(pool2());
  assert.deepEqual(s.P01, { mean: 8, n: 1 }, 'codex rating its own P01 at 10 does not count');
  assert.deepEqual(s.P03, { mean: 6, n: 1 });
  assert.equal(s.P04, undefined);
});

test('poolMarkdown never names a seat', () => {
  const md = poolMarkdown(pool2());
  assert.ok(!/codex|grok/i.test(md));
  assert.match(md, /P04 - A\+C/);
  assert.match(md, /fuses P01 \+ P03/);
});

test('seatStats joins the verdict and run records per seat', () => {
  const p = pool2();
  for (const x of p.proposals) x.anchor_check = { ok: 1, total: 2, bad: [] };
  const rows = seatStats(p, { kept: ['P01', 'P03', 'P04'], approved: ['P01', 'P04'], landed: ['P04'] }, { 'codex-x': { outcome: 'completed', wall_s: 600, cost_usd: null } });
  const codex = rows.find((r) => r.seat === 'codex-x');
  assert.equal(codex.proposals, 3);
  assert.equal(codex.kept, 2);
  assert.equal(codex.approved, 2);
  assert.equal(codex.landed, 1);
  assert.equal(codex.anchors_ok, 50);
  assert.equal(codex.cost_usd, null);
  assert.equal(rows.find((r) => r.seat === 'grok-y').kept, 1);
});

test('seatStats credits each scope item once, to the seat whose proposal led it', () => {
  const p = pool2();
  const ids = p.proposals.map((x) => x.id);
  const seatOf = Object.fromEntries(p.proposals.map((x) => [x.id, x.seat]));
  const codexIds = ids.filter((id) => seatOf[id] === 'codex-x');
  const grokIds = ids.filter((id) => seatOf[id] === 'grok-y');
  const verdict = {
    kept: ids, approved: ids, landed: ids,
    items: { A: [codexIds[0], ...grokIds], B: [grokIds[0], codexIds[1]], C: [codexIds[2]] },
    approved_items: ['A', 'B', 'C'], landed_items: ['A', 'B'],
  };
  const rows = seatStats(p, verdict, {});
  const codex = rows.find((r) => r.seat === 'codex-x');
  const grok = rows.find((r) => r.seat === 'grok-y');
  assert.equal(codex.landed, codexIds.length, 'per-id count still credits every folded member');
  assert.equal(codex.led_approved, 2);
  assert.equal(codex.led_landed, 1);
  assert.equal(grok.led_approved, 1);
  assert.equal(grok.led_landed, 1);
  assert.equal(seatStats(p, { kept: ids }, {})[0].led_landed, null, 'no items map -> not measured, never 0');
});

test('convene refuses a --ceiling-min that is not a positive number before any seat or worktree', async () => {
  // Number('abc') is NaN and a NaN timer fires at once: every seat of the round was killed on start.
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'tiger.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tiger-ceiling-'));
  try {
    const dir = path.join(root, 'tiger', 'hunts', '2026-10-25-area');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({ id: '2026-10-25-area', area: ['src/area'], head: 'abc', rounds: {} }));
    fs.writeFileSync(path.join(dir, 'brief.md'), '# The territory\n\nA written dossier.\n');
    for (const bad of ['abc', '0', '-3']) {
      const r = spawnSync(process.execPath, [script, 'convene', '--run', dir, '--ceiling-min', bad], { encoding: 'utf8', env: { ...process.env, TIGER_WORK: path.join(root, 'work') } });
      assert.equal(r.status, 2, `--ceiling-min ${bad}: ${r.stdout}${r.stderr}`);
      assert.match(r.stderr, /--ceiling-min needs a positive number/);
    }
    assert.ok(!fs.existsSync(path.join(root, 'work')), 'no worktree was made');
    assert.ok(!fs.existsSync(path.join(dir, '_logs')), 'no seat prompt was written');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('ledger keeps one row per seat per run: a re-run replaces that run\'s rows, never appends', async () => {
  // SKILL.md's file table: tiger/seats.jsonl is "one row per seat per run". The method runs
  // `ledger` once verdict.json has `landed`, and re-running it after a fix doubled every seat's numbers.
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'tiger.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tiger-ledger-'));
  try {
    const dir = path.join(root, 'tiger', 'hunts', '2026-10-25-area');
    fs.mkdirSync(dir, { recursive: true });
    const p = pool2();
    const ids = p.proposals.map((x) => x.id);
    fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({ id: '2026-10-25-area', area: ['src/area'], rounds: {} }));
    fs.writeFileSync(path.join(dir, 'pool.json'), JSON.stringify(p));
    const out = path.join(root, 'tiger', 'seats.jsonl');
    const other = JSON.stringify({ run: '2026-09-01-older', seat: 'codex-x', kept: 9 });
    fs.writeFileSync(out, `${other}\n`);
    const ledger = () => spawnSync(process.execPath, [script, 'ledger', '--run', dir], { encoding: 'utf8' });
    fs.writeFileSync(path.join(dir, 'verdict.json'), JSON.stringify({ kept: ids, approved: [ids[0]] }));
    assert.equal(ledger().status, 0);
    fs.writeFileSync(path.join(dir, 'verdict.json'), JSON.stringify({ kept: ids, approved: [ids[0]], landed: [ids[0]] }));
    const second = ledger();
    assert.equal(second.status, 0, second.stderr);
    const rows = fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const mine = rows.filter((r) => r.run === '2026-10-25-area');
    assert.equal(mine.length, 2, `two seats, one row each - got ${mine.length}`);
    assert.equal(mine.find((r) => r.seat === 'codex-x').landed, 1, 'the latest verdict wins');
    assert.equal(rows.filter((r) => r.run === '2026-09-01-older').length, 1, 'other runs\' rows are kept');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('tiger.mjs keeps no resolver or runner of its own: both come from the contest skill\'s lib/seat.mjs', async () => {
  // The two copies had drifted (directory on PATH, agy fallback, wall_s rounding). tiger already
  // imports ../../contest/scripts/lib/participants.mjs, so this adds no new dependency edge.
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'tiger.mjs'), 'utf8');
  assert.match(src, /import \{ resolveBin, runSeat \} from '\.\.\/\.\.\/contest\/scripts\/lib\/seat\.mjs'/);
  assert.doesNotMatch(src, /function resolveBin\(/);
  assert.doesNotMatch(src, /function runSeat\(/);
  assert.doesNotMatch(src, /taskkill/);
});
