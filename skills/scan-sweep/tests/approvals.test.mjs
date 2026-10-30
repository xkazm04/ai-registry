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
import { proofFromAb } from '../scripts/filing.mjs';

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

test('proofFromAb: a Lane B return becomes the contract proof; fp/demoted built nothing', () => {
  const r = { verdict: 'unmeasurable', metric: 'p95', unit: 'ms', before: '410', after: '400', method: 'probe', seeded_red: false, sha: 'h1' };
  assert.deepEqual(proofFromAb(r, { base_sha: 'b0' }), { metric: 'p95', method: 'probe', unit: 'ms', before: '410', after: '400', verdict: 'inconclusive', control: 'absent', base_sha: 'b0', head_sha: 'h1' });
  assert.equal(proofFromAb({ ...r, verdict: 'better', seeded_red: true }).control, 'red');
  assert.ok(!('base_sha' in proofFromAb({ ...r, verdict: 'better' })), 'an unknown sha is omitted, not guessed');
  assert.equal(proofFromAb({ ...r, verdict: 'fp' }), undefined);
  assert.equal(proofFromAb({ ...r, verdict: 'demoted' }), undefined);
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
