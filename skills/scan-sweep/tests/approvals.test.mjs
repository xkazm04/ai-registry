// node --test skills/scan-sweep/tests/approvals.test.mjs
// Pins the exit contract SKILL.md section 9.1 builds on: the caller DELETES the hand-off file on
// exit 0, so exit 0 must mean every line of that file landed. A line that is not a card (bad JSON,
// no title) is a card still owed, and its only record is the file.
//
// No Personas app is touched: the test serves the app's local HTTP door from a loopback server
// in this process and points the script at it through a temp HOME.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as filing from '../scripts/filing.mjs';

// Namespace reads, not named imports: a missing export must fail ITS test on an assertion, not void the whole file
// at link time (the D1 lesson applies to this file too).
const { proofFromAb } = filing;
const outcomeFor = (...a) => (filing.outcomeFor ?? (() => ({})))(...a);
const abTally = (...a) => (filing.abTally ?? (() => ({})))(...a);

const SCRIPT = fileURLToPath(new URL('../scripts/approvals.mjs', import.meta.url));
const made = [];
const scratch = (p) => { const d = mkdtempSync(join(tmpdir(), p)); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

/**
 * A fake Personas door: one project at `repo`, one context `core`, every idea created. A filing with
 * `autoDecide: true` is answered the way Seam A4 says the door answers it at level 1.
 */
async function door(repo) {
  const filed = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      if (req.method === 'GET' && req.url === '/dev-tools/projects') return res.end(JSON.stringify([{ id: 'p1', name: 'repo', root_path: repo }]));
      if (req.method === 'GET' && req.url.startsWith('/dev-tools/contexts/')) return res.end(JSON.stringify([{ id: 'c1', name: 'core' }]));
      if (req.method === 'POST' && req.url === '/dev-tools/ideas') {
        const b = JSON.parse(body);
        filed.push(b);
        if (b.autoDecide === true) return res.end(JSON.stringify({ outcome: 'created', idea: { id: `i${filed.length}`, status: 'accepted' }, autoDecided: true, level: 1 }));
        return res.end(JSON.stringify({ outcome: 'created', idea: { id: `i${filed.length}`, status: 'pending' }, ...(b.autoDecide === false ? { autoDecided: false, level: 0 } : {}) }));
      }
      res.statusCode = 404; res.end('{}');
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, filed, port: server.address().port };
}

function run(args, home) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [SCRIPT, ...args], { env: { ...process.env, HOME: home, USERPROFILE: home }, windowsHide: true });
    let stdout = ''; let stderr = '';
    p.stdout.on('data', (d) => { stdout += d; });
    p.stderr.on('data', (d) => { stderr += d; });
    p.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

async function fixture(lines) {
  const home = scratch('approvals-home-');
  const repo = scratch('approvals-repo-');
  const d = await door(repo);
  mkdirSync(join(home, '.personas'), { recursive: true });
  writeFileSync(join(home, '.personas', 'local-http.json'), JSON.stringify({ port: d.port, token: 't' }));
  const file = join(repo, 'handoff.jsonl');
  writeFileSync(file, `${lines.join('\n')}\n`);
  return { home, repo, file, ...d };
}

test('every card landing is exit 0', async () => {
  const f = await fixture([JSON.stringify({ title: 'One', lane: 'C' }), '', JSON.stringify({ title: 'Two', lane: 'B' })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(f.filed.length, 2);
  } finally { f.server.close(); }
});

test('a line that is not a card is still owed: exit 1, named by its line number, recorded in --out', async () => {
  const f = await fixture([JSON.stringify({ title: 'One' }), '{"title": "torn', '', JSON.stringify({ body: 'no title' })]);
  const out = join(f.repo, 'results.jsonl');
  try {
    const r = await run(['--file', f.file, '--repo', f.repo, '--out', out], f.home);
    assert.equal(f.filed.length, 1, 'the readable card is still filed');
    assert.equal(r.status, 1, `exit 0 tells the caller to delete a file that still holds two cards\n${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /line 2: not JSON/);
    assert.match(r.stderr, /line 4: no title/);
    const rows = readFileSync(out, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.deepEqual(rows.filter((x) => x.outcome === 'unreadable').map((x) => x.line), [2, 4]);
  } finally { f.server.close(); }
});

test('a file holding no readable card at all is not "nothing to do"', async () => {
  const f = await fixture(['not json', JSON.stringify({ title: '   ' })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.equal(f.filed.length, 0);
  } finally { f.server.close(); }
});

// ---- Seam A1: the scan-finding/1 wire -------------------------------------------------------

const PROOF = { metric: 'p95 ms', method: 'gate', unit: 'ms', before: '410', after: '120', verdict: 'better', control: 'red', base_sha: 'aaa', head_sha: 'bbb' };
const FULL = {
  title: 'Guard the empty queue', body: '## Summary\nx', evidence: 'src/q.ts:4', lens: 'error-handler', context: 'core',
  category: 'technical', size: 'M', impact: 8, impact_why: 'crash on the main path', confidence: 'medium', effort: 4, risk: 3,
  band: 'ranked', mvp: true, mvp_rule: 'top-score', predicted_verdict: 'accept', predicted_why: 'like i9: "accepted, same guard"',
  predicted_by: 'scan-sweep@4.9.0:claude-opus-5-5', proof: PROOF, gate: 'none', result: 'better', method: 'probe', lane: 'C',
  disposition: 'backlog', sweep_run_id: 'run-7', auto_decide: true, source: 'reg-1',
};

test('every A1 field travels top-level under its exact wire key; nothing rides in reasoning', async () => {
  const f = await fixture([JSON.stringify(FULL)]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 0, r.stderr);
    const b = f.filed[0];
    assert.deepEqual(Object.keys(b).sort(), [
      'autoDecide', 'band', 'category', 'confidence', 'context_id', 'description', 'disposition', 'effort', 'gate', 'impact',
      'impactWhy', 'lane', 'lens', 'method', 'mvp', 'mvpRule', 'origin', 'predictedBy', 'predictedVerdict', 'predictedWhy',
      'project_id', 'proof', 'reasoning', 'result', 'risk', 'score', 'scoreParts', 'size', 'sweepRunId', 'title',
    ]);
    assert.equal(b.context_id, 'c1');
    assert.deepEqual(b.proof, PROOF);
    assert.equal(b.sweepRunId, 'run-7');
    assert.equal(b.reasoning, 'scan-sweep hand-off - from reg-1');
    assert.doesNotMatch(b.reasoning, /Lane|gate|size|method|result/, 'routing fields are fields, not prose');
  } finally { f.server.close(); }
});

test('scales go out native 1-10, never halved', async () => {
  const f = await fixture([JSON.stringify({ title: 'T', lens: 'code-optimizer', impact: 8, effort: 4, risk: 3, confidence: 'medium' })]);
  try {
    await run(['--file', f.file, '--repo', f.repo], f.home);
    const b = f.filed[0];
    assert.deepEqual([b.impact, b.effort, b.risk], [8, 4, 3]);
  } finally { f.server.close(); }
});

test('score is computed by score.mjs when absent, and a card score that disagrees is overwritten', async () => {
  const f = await fixture([
    JSON.stringify({ title: 'A', lens: 'code-optimizer', impact: 8, effort: 4, risk: 3, confidence: 'medium' }),
    JSON.stringify({ title: 'B', lens: 'code-optimizer', impact: 8, effort: 4, risk: 3, confidence: 'medium', score: 99 }),
    JSON.stringify({ title: 'C', lens: 'code-optimizer', impact: 10, size: 'XS', risk: 1, confidence: 'high' }),
  ]);
  try {
    await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(f.filed[0].score, 40.5);
    assert.deepEqual(f.filed[0].scoreParts, { impact: 8, confidence_w: 0.75, effort_div: 1.333, risk_factor: 0.9, formula: 'scan-score/1' });
    assert.equal(f.filed[1].score, 40.5);
    assert.match(f.filed[1].reasoning, /card score 99 ignored/);
    assert.equal(f.filed[2].effort, 1, 'effort from size via sizeToEffort');
    assert.equal(f.filed[2].score, 95);
  } finally { f.server.close(); }
});

test('absent stays absent: no default scales, no score, category from the lens reference', async () => {
  const f = await fixture([JSON.stringify({ title: 'Bare' }), JSON.stringify({ title: 'Copy', lens: 'copy-auditor', impact: 5 })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(Object.keys(f.filed[0]).sort(), ['description', 'origin', 'project_id', 'reasoning', 'title']);
    const copy = f.filed[1];
    assert.equal(copy.category, 'product', 'lenses.md Category line, not a blind "technical"');
    assert.equal(copy.impact, 5);
    assert.ok(!('score' in copy) && !('effort' in copy) && !('risk' in copy), 'no effort => unscored, never 0');
  } finally { f.server.close(); }
});

test('a product lens card filed as technical goes to the door as product, and the reply says clamped', async () => {
  const f = await fixture([JSON.stringify({ title: 'Relabelled', lens: 'copy-auditor', category: 'technical', impact: 5, effort: 2 })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo, '--json'], f.home);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(f.filed[0].category, 'product');
    assert.match(f.filed[0].reasoning, /category clamped technical -> product/);
    assert.equal(JSON.parse(r.stdout).results[0].clamped, true);
  } finally { f.server.close(); }
});

test('reserve-band cards are posted, not dropped', async () => {
  const f = await fixture([JSON.stringify({ title: 'R1', lens: 'bounty-hunter', band: 'reserve', impact: 3, effort: 2 }), JSON.stringify({ title: 'K1', lens: 'bounty-hunter', band: 'ranked' })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(f.filed.map((b) => [b.title, b.band]), [['R1', 'reserve'], ['K1', 'ranked']]);
  } finally { f.server.close(); }
});

test('the door\'s autoDecided / level are echoed per item; an older door\'s silence is not invented', async () => {
  const f = await fixture([
    JSON.stringify({ title: 'Auto', lens: 'error-handler', auto_decide: true, predicted_verdict: 'accept' }),
    JSON.stringify({ title: 'Plain', lens: 'error-handler', auto_decide: false }),
    JSON.stringify({ title: 'Old' }),
  ]);
  const out = join(f.repo, 'results.jsonl');
  try {
    const r = await run(['--file', f.file, '--repo', f.repo, '--out', out], f.home);
    assert.equal(r.status, 0, r.stderr);
    const rows = readFileSync(out, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.deepEqual(rows.map((x) => [x.title, x.autoDecided, x.level]), [['Auto', true, 1], ['Plain', false, 0], ['Old', undefined, undefined]]);
    assert.match(r.stdout, /1 machine-decided by the door \(L1/);
    assert.ok(!('autoDecide' in f.filed[2]));
  } finally { f.server.close(); }
});

test('a present but out-of-scale or out-of-enum field is a card still owed (exit 1, not filed)', async () => {
  const f = await fixture([JSON.stringify({ title: 'Big', impact: 11, effort: 2 }), JSON.stringify({ title: 'Sure', confidence: 'certain' }), JSON.stringify({ title: 'Ok' })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 1, r.stdout);
    assert.deepEqual(f.filed.map((b) => b.title), ['Ok']);
    assert.match(r.stderr, /line 1: impact must be an integer 1-10/);
    assert.match(r.stderr, /line 2: confidence must be/);
  } finally { f.server.close(); }
});

test('a carry is owed to the next round: never posted to the door, still owed (exit 1)', async () => {
  const f = await fixture([JSON.stringify({ title: 'Owed', disposition: 'carry' }), JSON.stringify({ title: 'Ok', disposition: 'backlog' })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 1, r.stdout);
    assert.deepEqual(f.filed.map((b) => b.title), ['Ok']);
    assert.match(r.stderr, /line 1: disposition carry is owed to the next round/);
  } finally { f.server.close(); }
});

test('proofFromAb: a Lane B return becomes the contract proof; fp/demoted built nothing', () => {
  const r = { verdict: 'unmeasurable', metric: 'p95', unit: 'ms', before: '410', after: '400', method: 'probe', seeded_red: false, sha: 'h1' };
  assert.deepEqual(proofFromAb(r, { base_sha: 'b0' }), { metric: 'p95', method: 'probe', unit: 'ms', before: '410', after: '400', verdict: 'inconclusive', control: 'absent', base_sha: 'b0', head_sha: 'h1' });
  assert.equal(proofFromAb({ ...r, verdict: 'better', seeded_red: true }).control, 'absent', 'a red control without its reading is unverifiable');
  const red = proofFromAb({ ...r, verdict: 'better', seeded_red: true, control_value: '0 cases', control_run: 're-run', control_cmd: 'node --test t.mjs' });
  assert.deepEqual([red.control, red.control_value], ['red', '0 cases']);
  assert.ok(!('base_sha' in proofFromAb({ ...r, verdict: 'better' })), 'an unknown sha is omitted, not guessed');
  assert.equal(proofFromAb({ ...r, verdict: 'fp' }), undefined);
  assert.equal(proofFromAb({ ...r, verdict: 'demoted' }), undefined);
});

test('proofFromAb: a control is red only when it was RE-RUN on the reverted tree, with its command', () => {
  // personas cycle 2: two design workers reported the base-tree (pre-edit) reading as the control - "3 (pre-edit
  // reading, not re-run)" - and the contract took it. A reading nobody re-took after reverting B proves nothing
  // about the instrument.
  const r = { verdict: 'better', metric: 'wrong statements', unit: 'count', before: '3', after: '0', method: 'probe', seeded_red: true, control_value: '3', sha: 'h1' };
  assert.equal(proofFromAb(r).control, 'absent', 'no control_run: not shown to be re-run');
  assert.equal(proofFromAb({ ...r, control_run: 'base', control_cmd: 'grep -c x README.md' }).control, 'absent', 'a base-tree reading is absent');
  assert.equal(proofFromAb({ ...r, control_run: 're-run' }).control, 'absent', 're-run without the command is unverifiable');
  const ok = proofFromAb({ ...r, control_run: 're-run', control_cmd: 'grep -c x README.md' });
  assert.deepEqual([ok.control, ok.control_value], ['red', '3']);
  assert.ok(!('control_cmd' in ok), 'the command stays in ab.jsonl; the proof keeps the contract keys only');
  assert.ok(!('control_value' in proofFromAb({ ...r, control_run: 'base' })), 'an absent control carries no reading that could pass for one');
});

test('proofFromAb: a control that failed only because the new symbol is missing is void (D1)', () => {
  // personas c2r2 (2026-10-31): 21a3a2b5's control failed to IMPORT the new helper and 9d2e26fc's failed to COMPILE;
  // both came back seeded_red with a re-run command. A test that cannot load says nothing about the old behaviour.
  const r = { verdict: 'better', metric: 'prefill', unit: 'cases', before: '0/4', after: '4/4', method: 'probe', seeded_red: true, control_run: 're-run', control_cmd: 'npx vitest run tryIt.test.ts', sha: 'h1' };
  const shapes = [
    'SyntaxError: The requested module \'./tryIt\' does not provide an export named \'samplePrefill\'',
    'TypeError: samplePrefill is not a function',
    'src/x.ts(4,10): error TS2305: Module \'"./tryIt"\' has no exported member \'samplePrefill\'.',
    'error TS2339: Property \'recordPublish\' does not exist on type \'Api\'.',
    'error[E0425]: cannot find function `record_publish` in this scope',
    'Error: Cannot find module \'./publishRecord\'',
  ];
  for (const v of shapes) {
    const p = proofFromAb({ ...r, control_value: v });
    assert.equal(p.control, 'absent', `void: ${v}`);
    assert.equal(p.void_control, 'missing-symbol', `void reported: ${v}`);
    assert.ok(!('control_value' in p));
  }
  for (const kind of ['missing-symbol', 'compile']) {
    const p = proofFromAb({ ...r, control_value: '1 failed / 4', control_failure: kind });
    assert.deepEqual([p.control, p.void_control], ['absent', kind], `worker-declared ${kind} is void`);
  }
  const ok = proofFromAb({ ...r, control_value: '4 failed / 4 (expected {} to equal sample)', control_failure: 'assertion' });
  assert.deepEqual([ok.control, ok.control_value], ['red', '4 failed / 4 (expected {} to equal sample)'], 'the behavioural re-seed is red');
  assert.ok(!('void_control' in ok));
});

test('proofFromAb: a grep or comment control is not exempt from the re-run (D2)', () => {
  // personas c2r2: f031e2e6 (a stale "14 locales" comment) returned the base tree's grep count as its control.
  const r = { verdict: 'better', metric: 'stale comment', unit: 'count', before: '1', after: '0', method: 'probe', seeded_red: true, control_value: '1', sha: 'h1' };
  for (const method of ['probe', 'grep', 'gate']) {
    assert.equal(proofFromAb({ ...r, method }).control, 'absent', `${method}: no control_run`);
    assert.equal(proofFromAb({ ...r, method, control_run: 'base', control_cmd: 'grep -c "14 locales" DesignHub.tsx' }).control, 'absent', `${method}: base reading`);
    assert.equal(proofFromAb({ ...r, method, control_run: 're-run', control_cmd: 'grep -c "14 locales" DesignHub.tsx' }).control, 'red', `${method}: re-run grep`);
  }
});

test('superseded: moot by a sibling merge - no proof, already_delivered with the sibling commit, never an fp (D3)', () => {
  // personas c2r2: 16634bfc ("comments claim reason -> memory") became true when sibling d8397f84 merged; it had to
  // be filed `fp` and counted against its lens although its premise was true when dispatched.
  const s = { verdict: 'superseded', superseded_by: 'd8397f84', commit: '8156222cf9', slug: 'comments-claim' };
  assert.equal(proofFromAb(s), undefined, 'nothing was built');
  assert.deepEqual(outcomeFor(s), { outcome: 'already_delivered', commit: '8156222cf9', note: 'superseded by d8397f84 (merged 8156222cf9)' });
  assert.match(outcomeFor({ verdict: 'superseded', commit: 'c1' }).error, /superseded_by/);
  assert.match(outcomeFor({ verdict: 'superseded', superseded_by: 'd8' }).error, /commit/, 'the app refuses already_delivered without a commit');
  assert.deepEqual(outcomeFor({ verdict: 'better', merge: 'm1' }), { outcome: 'delivered', commit: 'm1' });
  assert.equal(outcomeFor({ verdict: 'not-better' }).outcome, 'declined');
  assert.equal(outcomeFor({ verdict: 'fp' }).outcome, 'declined');
  assert.equal(outcomeFor({ verdict: 'unmeasurable' }).outcome, 'blocked');
  assert.equal(outcomeFor({ verdict: 'demoted' }).outcome, 'blocked');
  const t = abTally([{ verdict: 'better' }, { verdict: 'fp' }, { verdict: 'superseded' }, { verdict: 'superseded' }, { verdict: 'demoted' }]);
  assert.equal(t.ab, '1/0/0/1/1', 'superseded is not in any of the five slots');
  assert.deepEqual([t.fp, t.superseded], [1, 2]);
});

test('door down: the spool fallback is unchanged - the raw cards are queued durably, exit 0', async () => {
  const home = scratch('approvals-home-');
  const repo = scratch('approvals-repo-');
  const file = join(repo, 'handoff.jsonl');
  const cards = [FULL, { title: 'Two', lane: 'B' }];
  writeFileSync(file, `${cards.map((c) => JSON.stringify(c)).join('\n')}\n`);
  const r = await run(['--file', file, '--repo', repo], home);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const spool = readFileSync(join(home, '.personas', 'spool', 'ideas.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(spool.map((e) => e.card), cards, 'the spool keeps the card exactly as written');
  assert.ok(spool.every((e) => e.state === 'queued' && e.origin === 'scan_sweep'));
});

test('an out-of-scale scale is refused even when the card is unscorable (no effort, no size)', async () => {
  const f = await fixture([JSON.stringify({ title: 'Lone', impact: 12 }), JSON.stringify({ title: 'Risky', risk: 0 }), JSON.stringify({ title: 'Ok', impact: 4 })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 1, r.stdout);
    assert.deepEqual(f.filed.map((b) => b.title), ['Ok']);
    assert.match(r.stderr, /line 1: impact must be an integer 1-10/);
    assert.match(r.stderr, /line 2: risk must be an integer 1-10/);
  } finally { f.server.close(); }
});

test('built-then-reverted: disposition reverted travels with its proof; without a proof it is refused', async () => {
  // personas 2026-10-30: three reserve items were built before ranking, then reverted. The contract's `proof`
  // covers "a change was built"; `disposition: reverted` (a routing word the door stores as-is) says nothing landed.
  const reverted = { title: 'Built early', lens: 'error-handler', disposition: 'reverted', band: 'reserve', result: 'better', proof: PROOF };
  const f = await fixture([JSON.stringify(reverted), JSON.stringify({ title: 'No proof', disposition: 'reverted' })]);
  try {
    const r = await run(['--file', f.file, '--repo', f.repo], f.home);
    assert.equal(r.status, 1, r.stdout);
    assert.deepEqual(f.filed.map((b) => [b.title, b.disposition, b.proof?.verdict]), [['Built early', 'reverted', PROOF.verdict]]);
    assert.match(r.stderr, /line 2: disposition reverted needs the proof of what was built/);
  } finally { f.server.close(); }
});

/** A port nothing listens on: bind one, then close it. */
async function deadPort() {
  const s = http.createServer();
  await new Promise((r) => s.listen(0, '127.0.0.1', r));
  const { port } = s.address();
  await new Promise((r) => s.close(r));
  return port;
}

test('stale handshake (file present, app dead -> connection refused) spools like a missing one, exit 0', async () => {
  // personas 2026-10-30: the handshake outlived the app, approvals exited 3 and called the cards owed
  // although the spool tool was right there.
  const home = scratch('approvals-home-');
  const repo = scratch('approvals-repo-');
  mkdirSync(join(home, '.personas'), { recursive: true });
  writeFileSync(join(home, '.personas', 'local-http.json'), JSON.stringify({ port: await deadPort(), token: 't' }));
  const file = join(repo, 'handoff.jsonl');
  writeFileSync(file, `${JSON.stringify({ title: 'One', lane: 'C' })}\n`);
  const r = await run(['--file', file, '--repo', repo], home);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const spool = readFileSync(join(home, '.personas', 'spool', 'ideas.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(spool.map((e) => e.card.title), ['One']);
});

test('stale handshake with --no-spool keeps the old contract: exit 3, cards owed', async () => {
  const home = scratch('approvals-home-');
  const repo = scratch('approvals-repo-');
  mkdirSync(join(home, '.personas'), { recursive: true });
  writeFileSync(join(home, '.personas', 'local-http.json'), JSON.stringify({ port: await deadPort(), token: 't' }));
  const file = join(repo, 'handoff.jsonl');
  writeFileSync(file, `${JSON.stringify({ title: 'One' })}\n`);
  const r = await run(['--file', file, '--repo', repo, '--no-spool'], home);
  assert.equal(r.status, 3, r.stdout + r.stderr);
  assert.match(r.stderr, /still owed/);
});

test('the spool path validates through filing.mjs: an out-of-scale card is not queued, exit 1', async () => {
  const home = scratch('approvals-home-');
  const repo = scratch('approvals-repo-');
  const file = join(repo, 'handoff.jsonl');
  writeFileSync(file, `${[{ title: 'Good', impact: 5 }, { title: 'Bad', impact: 12, effort: 2 }].map((c) => JSON.stringify(c)).join('\n')}\n`);
  const out = join(repo, 'out.jsonl');
  const r = await run(['--file', file, '--repo', repo, '--out', out], home);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  const spool = readFileSync(join(home, '.personas', 'spool', 'ideas.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(spool.map((e) => e.card.title), ['Good'], 'only the valid card is durable');
  const rows = readFileSync(out, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(rows.map((x) => [x.title, x.outcome]), [['Good', 'queued'], ['Bad', 'invalid']]);
});
