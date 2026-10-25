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

const SCRIPT = fileURLToPath(new URL('../scripts/approvals.mjs', import.meta.url));
const made = [];
const scratch = (p) => { const d = mkdtempSync(join(tmpdir(), p)); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

/** A fake Personas door: one project at `repo`, no contexts, every idea created. */
async function door(repo) {
  const filed = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      if (req.method === 'GET' && req.url === '/dev-tools/projects') return res.end(JSON.stringify([{ id: 'p1', name: 'repo', root_path: repo }]));
      if (req.method === 'GET' && req.url.startsWith('/dev-tools/contexts/')) return res.end('[]');
      if (req.method === 'POST' && req.url === '/dev-tools/ideas') {
        filed.push(JSON.parse(body));
        return res.end(JSON.stringify({ outcome: 'created', idea: { id: `i${filed.length}`, status: 'pending' } }));
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
