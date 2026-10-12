#!/usr/bin/env node
// adopt-bp bench: run the same /adopt-bp onboarding in parallel CLI seats (Claude, Codex, Grok, agy)
// on throwaway worktrees of one repo, then score what each produced. The seat engines, their
// isolation flags and envelope parsing are the contest skill's (../../contest/scripts/lib).
//
//   node bench.mjs run     --target <repo> --seats <engine:model@effort,...> [--bp <bp>] [--out <dir>] [--ceiling-min 120] [--only <seat-id>] [--force]
//   node bench.mjs score   --out <dir>                     scores.json + SCOREBOARD.md
//   node bench.mjs promote --out <dir> --seat <seat-id>    copy that seat's .ai/lens-scan into the target and register it
//   node bench.mjs clean   --out <dir> [--keep <seat-id>]  remove the seat worktrees (the kept one too once promoted)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseParticipants, engineCommand, parseEnvelope, classifyOutcome } from '../../contest/scripts/lib/participants.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(HERE, '..');
const ADOPT = path.join(HERE, 'adopt.mjs');
const WIN = process.platform === 'win32';
const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const flag = (k) => argv.includes(`--${k}`);
const die = (m) => { console.error(`bench: ${m}`); process.exit(2); };
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 2)}\n`); };
const posix = (p) => p.split(path.sep).join('/');

const OUT = path.resolve(opt('out', path.join(os.homedir(), '.adopt-bench', 'run')));
const BENCH = path.join(OUT, 'bench.json');

function resolveBin(engine) {
  const env = process.env[`CONTEST_${engine.toUpperCase()}_BIN`];
  if (env) return env.includes('|') ? env.split('|') : env;
  const exts = WIN ? ['.exe', '.cmd', ''] : [''];
  const home = os.homedir();
  const fallbacks = { claude: [path.join(home, '.local', 'bin', 'claude.exe')], grok: [path.join(home, '.grok', 'bin', 'grok.exe')], codex: [], agy: [] };
  const cands = [];
  for (const d of (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)) for (const e of exts) cands.push(path.join(d, engine + e));
  cands.push(...fallbacks[engine]);
  for (const c of cands) {
    if (!fs.existsSync(c) || fs.statSync(c).isDirectory()) continue;
    if (/\.cmd$/i.test(c) || !path.extname(c)) {
      const native = engine === 'claude' && path.join(path.dirname(c), 'node_modules/@anthropic-ai/claude-code/bin/claude.exe');
      if (native && fs.existsSync(native)) return native;
      const entry = { codex: 'node_modules/@openai/codex/bin/codex.js', claude: 'node_modules/@anthropic-ai/claude-code/cli.js' }[engine];
      const script = entry && path.join(path.dirname(c), entry);
      if (script && fs.existsSync(script)) return [process.execPath, script];
      if (WIN) continue;
    }
    return c;
  }
  die(`cannot find the ${engine} CLI; set CONTEST_${engine.toUpperCase()}_BIN`);
  return null;
}

function runSeat({ argv: a, stdin, env }, { cwd, timeoutMs, logDir }) {
  fs.mkdirSync(logDir, { recursive: true });
  const t0 = Date.now();
  return new Promise((resolve) => {
    const p = spawn(a[0], a.slice(1), { cwd, env: { ...process.env, ...env }, windowsHide: true });
    const out = fs.createWriteStream(path.join(logDir, 'stdout.log'));
    const err = fs.createWriteStream(path.join(logDir, 'stderr.log'));
    const chunks = [];
    p.stdout.on('data', (d) => { chunks.push(d); out.write(d); });
    p.stderr.on('data', (d) => err.write(d));
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; if (WIN) spawn('taskkill', ['/F', '/T', '/PID', String(p.pid)], { windowsHide: true }); else p.kill('SIGKILL'); }, timeoutMs);
    p.on('error', (e) => err.write(`spawn error: ${e.message}\n`));
    p.on('close', (code) => { clearTimeout(timer); out.end(); err.end(); resolve({ exit: code, timedOut, stdout: Buffer.concat(chunks).toString('utf8'), wall_s: Math.round((Date.now() - t0) / 1000) }); });
    p.stdin.on('error', () => {});
    p.stdin.end(stdin ?? '');
  });
}

function prompt(p, ws, bp) {
  return [
    `You are running the /adopt-bp skill as one seat of a benchmark. Read ${posix(path.join(SKILL, 'SKILL.md'))} and its references, then follow it end to end on the repository in your current directory (${posix(ws)}).`,
    `- bp checkout: ${posix(bp)} (pass --bp to every adopt.mjs call). Scripts: node ${posix(ADOPT)} <cmd> --root . --bp ${posix(bp)}`,
    `- Benchmark workspace: do NOT run register. Do run check, seed (--slug ${opt('slug', 'x')} --name "${opt('name', 'x')}"), the product tree, events, measure, batches, judgement for EVERY batch, judge (--model ${p.model}), validate and report.`,
    '- Work autonomously; never ask questions. Write only under .ai/lens-scan/ in this directory. Do not commit, do not touch git state, do not edit any file outside this directory.',
    '- Quality matters more than speed: stages need evidence, judgement values must be grounded in code you read. Use subagents for the judgement batches if your harness has them.',
    '- Finish with the five-line hand-back from SKILL.md step 8.',
  ].join('\n');
}

// =================================================================================== run
async function run() {
  const target = path.resolve(opt('target') ?? die('--target is required'));
  const bp = path.resolve(opt('bp', process.env.ADOPT_BP_ROOT ?? path.join(target, '..', 'bp')));
  const seats = parseParticipants(opt('seats') ?? die('--seats is required'));
  const timeoutMs = Number(opt('ceiling-min', '120')) * 60_000;
  const head = execFileSync('git', ['-C', target, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const bench = fs.existsSync(BENCH) ? readJson(BENCH) : { target: posix(target), bp: posix(bp), head, created: new Date().toISOString(), seats: {} };
  const only = opt('only');
  const jobs = seats.filter((p) => !only || p.id === only).map(async (p) => {
    const ws = path.join(OUT, p.id);
    const logDir = path.join(OUT, '_logs', p.id);
    const rec = path.join(logDir, 'record.json');
    if (fs.existsSync(rec) && !flag('force') && readJson(rec).outcome === 'completed') { console.log(`${p.id}: already completed`); return; }
    if (!fs.existsSync(ws)) execFileSync('git', ['-C', target, 'worktree', 'add', '--detach', ws, head], { stdio: 'ignore' });
    // the operator's context map may be newer than HEAD (or untracked): seats adopt what the operator has
    for (const f of ['context-map.json']) if (fs.existsSync(path.join(target, f))) fs.copyFileSync(path.join(target, f), path.join(ws, f));
    if (flag('force')) fs.rmSync(path.join(ws, '.ai', 'lens-scan'), { recursive: true, force: true });
    const command = engineCommand(p, resolveBin(p.engine), prompt(p, ws, bp), { workspace: '.' });
    writeJson(path.join(logDir, 'command.json'), { argv: command.argv.map((x) => (x.length > 300 ? `${x.slice(0, 300)}...` : x)), cwd: posix(ws), started: new Date().toISOString() });
    console.log(`${p.id}: starting in ${posix(ws)} (ceiling ${timeoutMs / 60000} min)`);
    const r = await runSeat(command, { cwd: ws, timeoutMs, logDir });
    const parsed = parseEnvelope(p.engine, r.stdout);
    const record = { id: p.id, spec: p.spec, engine: p.engine, model: p.model, effort: p.effort, outcome: classifyOutcome(parsed, r), exit: r.exit, timed_out: r.timedOut, wall_s: r.wall_s, turns: parsed.turns, cost_usd: parsed.cost_usd, usage: parsed.usage, model_usage: parsed.model_usage, errors: parsed.errors, finished: new Date().toISOString() };
    fs.writeFileSync(path.join(logDir, 'final.md'), parsed.final ?? '');
    writeJson(rec, record);
    bench.seats[p.id] = { spec: p.spec, ws: posix(ws) };
    console.log(`${p.id}: ${record.outcome} in ${r.wall_s}s, ${parsed.turns} turns${parsed.cost_usd != null ? `, $${parsed.cost_usd.toFixed(2)}` : ''}`);
  });
  for (const p of seats) bench.seats[p.id] = { spec: p.spec, ws: posix(path.join(OUT, p.id)) };
  writeJson(BENCH, bench);
  await Promise.all(jobs);
  writeJson(BENCH, bench);
}

// =================================================================================== score
async function score() {
  const bench = readJson(BENCH);
  const { DatabaseSync } = await import('node:sqlite');
  const rows = [];
  for (const [id, s] of Object.entries(bench.seats)) {
    const ws = s.ws;
    const rec = fs.existsSync(path.join(OUT, '_logs', id, 'record.json')) ? readJson(path.join(OUT, '_logs', id, 'record.json')) : {};
    const store = path.join(ws, '.ai', 'lens-scan');
    const row = { id, spec: s.spec, outcome: rec.outcome ?? 'not-run', wall_min: rec.wall_s ? Math.round(rec.wall_s / 6) / 10 : null, turns: rec.turns ?? null, cost_usd: rec.cost_usd ?? null, usage: rec.usage ?? null };
    const v = spawnSync(process.execPath, [ADOPT, 'validate', '--root', ws, '--bp', bench.bp], { encoding: 'utf8' });
    row.validate = v.status === 0 ? 'ok' : 'FAIL';
    row.validate_errors = (v.stderr ?? '').split('\n').filter((l) => l.startsWith('error')).slice(0, 8);
    const sum = (v.stdout ?? '').split('\n').find((l) => l.startsWith('{"features"'));
    Object.assign(row, sum ? JSON.parse(sum) : {});
    const mapFile = path.join(store, 'app-structure.json');
    if (fs.existsSync(mapFile)) {
      const m = readJson(mapFile);
      const f = (m.features ?? []).filter((x) => x.status !== 'archived');
      row.by_stage = Object.fromEntries([...new Set(f.map((x) => x.stage))].map((st) => [st, f.filter((x) => x.stage === st).length]));
      row.with_evidence = (() => { try { const t = readJson(path.join(store, 'work', 'product-tree.json')); return (t.features ?? []).filter((x) => (x.stage_evidence ?? '').length > 20).length; } catch { return 0; } })();
      const judged = f.map((x) => m.facets?.[x.slug]?.development?.values?.standardsPct).filter((x) => x !== undefined);
      row.dev_standards_mean = judged.length ? Math.round(judged.reduce((a, b) => a + b, 0) / judged.length) : null;
      row.dev_standards_spread = judged.length ? Math.max(...judged) - Math.min(...judged) : null;
      row.batches = fs.existsSync(path.join(store, 'work', 'batches')) ? fs.readdirSync(path.join(store, 'work', 'batches')).length : 0;
      row.judged_batches = fs.existsSync(path.join(store, 'work', 'judgement')) ? fs.readdirSync(path.join(store, 'work', 'judgement')).filter((x) => x.endsWith('.json')).length : 0;
    }
    if (fs.existsSync(path.join(store, 'scan.db'))) {
      const db = new DatabaseSync(path.join(store, 'scan.db'), { readOnly: true });
      row.proposals = db.prepare('SELECT COUNT(*) n FROM proposals').get().n;
      row.proposals_with_fileline = db.prepare("SELECT COUNT(*) n FROM proposals WHERE body GLOB '*:[0-9]*'").get().n;
      row.coverage = db.prepare('SELECT COUNT(*) n FROM coverage').get().n;
      row.evidence_fileline = db.prepare("SELECT COUNT(*) n FROM measurements WHERE method = 'judgement' AND evidence GLOB '*:[0-9]*'").get().n;
      row.judgement_rows = db.prepare("SELECT COUNT(*) n FROM measurements WHERE method = 'judgement'").get().n;
      db.close();
    }
    const stray = spawnSync('git', ['-C', ws, 'status', '--porcelain'], { encoding: 'utf8' }).stdout.split('\n').filter((l) => l && !/\.ai\/lens-scan|context-map\.json/.test(l));
    row.stray_changes = stray.length;
    rows.push(row);
  }
  writeJson(path.join(OUT, 'scores.json'), rows);
  const cols = ['id', 'outcome', 'wall_min', 'cost_usd', 'validate', 'domains', 'capabilities', 'features', 'contexts_covered', 'with_evidence', 'judged_batches', 'batches', 'judged_dev', 'judged_sec', 'judged_design', 'dev_standards_mean', 'dev_standards_spread', 'proposals', 'proposals_with_fileline', 'evidence_fileline', 'coverage', 'stray_changes'];
  const md = [`# adopt-bp bench - ${bench.target} @ ${bench.head.slice(0, 10)}`, '', `| ${cols.join(' | ')} |`, `|${cols.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${cols.map((c) => r[c] ?? '').join(' | ')} |`), '',
    ...rows.map((r) => `- **${r.id}** stages ${JSON.stringify(r.by_stage ?? {})}${r.validate_errors?.length ? `; validate: ${r.validate_errors.join(' / ')}` : ''}`)].join('\n');
  fs.writeFileSync(path.join(OUT, 'SCOREBOARD.md'), `${md}\n`);
  console.log(md);
}

// =================================================================================== promote / clean
function promote() {
  const bench = readJson(BENCH);
  const id = opt('seat') ?? die('--seat is required');
  const s = bench.seats[id] ?? die(`no seat ${id}`);
  const from = path.join(s.ws, '.ai', 'lens-scan'), to = path.join(bench.target, '.ai', 'lens-scan');
  if (!fs.existsSync(path.join(from, 'app-structure.json'))) die(`${id} produced no map`);
  if (fs.existsSync(to) && !flag('force')) die(`${posix(to)} exists (use --force to replace it)`);
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true, filter: (f) => !/scan\.db-(wal|shm)$/.test(f) });
  const r = spawnSync(process.execPath, [ADOPT, 'register', '--root', bench.target, '--bp', bench.bp, ...(opt('slug') ? ['--slug', opt('slug')] : []), ...(opt('name') ? ['--name', opt('name')] : [])], { encoding: 'utf8', stdio: 'inherit' });
  bench.promoted = { seat: id, at: new Date().toISOString() };
  writeJson(BENCH, bench);
  process.exit(r.status ?? 0);
}
function clean() {
  const bench = readJson(BENCH);
  const keep = opt('keep');
  for (const [id, s] of Object.entries(bench.seats)) {
    if (id === keep) continue;
    spawnSync('git', ['-C', bench.target, 'worktree', 'remove', '--force', s.ws], { stdio: 'inherit' });
    fs.rmSync(s.ws, { recursive: true, force: true });
    console.log(`removed ${id}`);
  }
  spawnSync('git', ['-C', bench.target, 'worktree', 'prune'], { stdio: 'inherit' });
}

const CMDS = { run, score, promote, clean };
if (!CMDS[cmd]) die(`usage: bench.mjs <${Object.keys(CMDS).join('|')}> ...`);
await CMDS[cmd]();
