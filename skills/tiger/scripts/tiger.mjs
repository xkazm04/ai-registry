#!/usr/bin/env node
// tiger: find a codebase's most valuable feature area and brainstorm its evolution with a
// cross-vendor council of CLI seats. The seat engines, their isolation flags and envelope
// parsing are the contest skill's (../../contest/scripts/lib); the pure half is lib/hunt.mjs.
//
//   node tiger.mjs probe   [--seats <specs>] [--timeout-s 150]           which seats answer right now
//   node tiger.mjs hunt    --root <repo> [--days 180] [--top 12]         candidate areas + value sources
//   node tiger.mjs init    --root <repo> --area <path[,path]> [--slug s] run dir + brief/prompt templates
//   node tiger.mjs convene --run <dir> [--round 1|2] [--seats <specs>] [--ceiling-min 40] [--only <seat-id>] [--force]
//   node tiger.mjs pool    --run <dir>                                   parse seats, check anchors, write pool.{json,md}
//   node tiger.mjs ledger  --run <dir>                                   per-seat numbers from verdict.json -> tiger/seats.jsonl
//   node tiger.mjs clean   --run <dir>                                   remove the seats' worktree
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseParticipants, engineCommand, parseEnvelope, classifyOutcome } from '../../contest/scripts/lib/participants.mjs';
import { huntAreas, huntGroups, parseTouches, parseSeatOutput, buildPool, poolMarkdown, checkAnchors, seatStats } from './lib/hunt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(HERE, '..');
const WIN = process.platform === 'win32';
const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const flag = (k) => argv.includes(`--${k}`);
const die = (m) => { console.error(`tiger: ${m}`); process.exit(2); };
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 2)}\n`); };
const posix = (p) => p.split(path.sep).join('/');
const git = (root, args, o = {}) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...o });
// A run directory is <repo>/tiger/hunts/<id>. The repo root is derived from it rather than
// stored, so nothing committed in the vault carries a machine path (repos forbid them, and a
// clone on another machine must still resume). Runs written before 3.3.0 stored `root`; the
// derived path wins.
const rootOf = (dir) => path.resolve(dir, '..', '..', '..');
const loadRun = (dir) => ({ ...readJson(path.join(dir, 'run.json')), root: posix(rootOf(dir)) });
const saveRun = (dir, run) => { const { root, ...rest } = run; writeJson(path.join(dir, 'run.json'), rest); };

// The strongest seat each vendor's CLI offers on this machine (2026-10). A seat that does not
// answer the probe is skipped and the round runs with whoever is left.
export const DEFAULT_SEATS = 'agy:gemini-4-argon@high,codex:gpt-6.1-sol@xhigh,grok:grok-4.7@high,claude:claude-opus-5-5@xhigh';

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

// =================================================================================== probe
async function probe() {
  const seats = parseParticipants(opt('seats', DEFAULT_SEATS));
  const timeoutMs = Number(opt('timeout-s', '150')) * 1000;
  const logRoot = path.join(os.tmpdir(), `tiger-probe-${process.pid}`);
  const rows = await Promise.all(seats.map(async (p) => {
    const bin = resolveBin(p.engine);
    if (!bin) return { seat: p.id, spec: p.spec, available: false, reason: `no ${p.engine} CLI on PATH (set CONTEST_${p.engine.toUpperCase()}_BIN)` };
    // Low effort for the probe: it tests reachability, auth and quota, not the seat's quality.
    const cheap = { ...p, effort: 'low' };
    const command = engineCommand(cheap, bin, 'Reply with exactly the word READY and nothing else. Do not use any tools.', { workspace: '.' });
    const r = await runSeat(command, { cwd: os.tmpdir(), timeoutMs, logDir: path.join(logRoot, p.id) });
    const parsed = parseEnvelope(p.engine, r.stdout);
    const outcome = classifyOutcome(parsed, r);
    const ok = outcome === 'completed' && /READY/i.test(parsed.final);
    const why = ok ? null : (parsed.errors[0] ?? (r.timedOut ? 'timed out' : `exit ${r.exit}, reply "${parsed.final.slice(0, 80)}"`));
    return { seat: p.id, spec: p.spec, available: ok, outcome, wall_s: r.wall_s, reason: why };
  }));
  fs.rmSync(logRoot, { recursive: true, force: true });
  if (flag('json')) { console.log(JSON.stringify(rows, null, 2)); return; }
  for (const r of rows) console.log(`${r.available ? 'ok     ' : 'SKIP   '} ${r.spec.padEnd(40)} ${r.available ? `${r.wall_s}s` : r.reason}`);
  const live = rows.filter((r) => r.available).map((r) => r.spec);
  console.log(`\nseats: ${live.join(',') || '(none - the caller brainstorms alone and says so)'}`);
}

// =================================================================================== hunt
const VALUE_SOURCES = [
  ['README.md', 'what the product says it is'], ['PRODUCT.md', 'product intent'], ['DESIGN.md', 'design intent'],
  ['context-map.json', 'contexts and their files'], ['.ai/lens-scan/app-structure.json', 'bp product tree: domains, capabilities, features, stages'],
  ['.ai/registry-map.json', 'registry standards and deviations per context'], ['.ai/directions/ledger.jsonl', 'perfect: directions the owner took or rejected'],
  ['uat/characters', 'representative users (uat)'], ['value-ledger', 'value cases'], ['tiger/engine', 'tiger 2.x LLM call-site notes'],
  ['tiger/hunts.md', 'earlier tiger hunts'], ['docs', 'project docs'],
];

function hunt() {
  const root = path.resolve(opt('root', '.'));
  const days = Number(opt('days', '180'));
  const files = git(root, ['ls-files', '-z']).split('\0').filter(Boolean).map((p) => {
    let bytes = 0;
    try { bytes = fs.statSync(path.join(root, p)).size; } catch { /* deleted in the working tree */ }
    return { path: p, bytes };
  });
  const log = git(root, ['log', `--since=${days}.days`, '--no-merges', '--name-only', '--format=@@%ct']);
  const touches = parseTouches(log);
  const top = Number(opt('top', '12'));
  const areas = huntAreas(files, touches, { top });
  let groups = null;
  const cmap = path.join(root, 'context-map.json');
  if (fs.existsSync(cmap)) {
    try {
      const bytes = new Map(files.map((f) => [f.path, f.bytes]));
      groups = huntGroups(readJson(cmap), touches, (f) => bytes.get(f) ?? 0, { top });
    } catch (e) { console.error(`tiger: context-map.json unreadable (${e.message}); directory areas only`); }
  }
  const sources = VALUE_SOURCES.filter(([f]) => fs.existsSync(path.join(root, f))).map(([f, what]) => ({ path: f, what }));
  let features = null;
  const appStructure = path.join(root, '.ai/lens-scan/app-structure.json');
  if (fs.existsSync(appStructure)) {
    try {
      const m = readJson(appStructure);
      const live = (m.features ?? []).filter((f) => f.status !== 'archived' && f.stage !== 'deprecated');
      features = live.map((f) => ({ slug: f.slug, name: f.name, tier: f.tier ?? null, stage: f.stage ?? null, capability: f.capability ?? null }));
    } catch { features = null; }
  }
  const out = { root: posix(root), head: git(root, ['rev-parse', '--short', 'HEAD']).trim(), window_days: days, groups, areas, value_sources: sources, features };
  if (flag('json')) { console.log(JSON.stringify(out, null, 2)); return; }
  console.log(`# tiger hunt - ${out.root} @ ${out.head} (last ${days} days)\n`);
  if (groups) {
    console.log('## Context-map groups (preferred: named feature areas)\n');
    console.log('| group | heat | use cases | major flows | contexts | commits | hot files | files | kB | last touch (days) |\n|---|---|---|---|---|---|---|---|---|---|');
    for (const g of groups) console.log(`| ${g.group} | ${g.heat} | ${g.use_cases} | ${g.major_use_cases.join(', ') || '-'} | ${g.contexts} | ${g.commits} | ${g.hot_files} | ${g.files} | ${g.kb} | ${g.last_days ?? '-'} |`);
    console.log('\n## Directory areas\n');
  }
  console.log('| area | heat | commits | hot files | files | tests | kB | share % | last touch (days) |\n|---|---|---|---|---|---|---|---|---|');
  for (const a of areas) console.log(`| ${a.area} | ${a.heat} | ${a.commits} | ${a.hot_files} | ${a.files} | ${a.tests} | ${a.kb} | ${a.share} | ${a.last_days ?? '-'} |`);
  console.log('\nHeat is where work went lately, weighted by mass - evidence, not the verdict. Value comes from what the product says it is for.');
  console.log(`\nValue sources present: ${sources.map((s) => `${s.path} (${s.what})`).join('; ') || 'none - read the code and the git log'}`);
  if (features) console.log(`\nbp product tree: ${features.length} live features; major tier: ${features.filter((f) => f.tier === 'major').map((f) => f.slug).join(', ') || '-'}`);
}

// =================================================================================== init
const today = () => new Date().toISOString().slice(0, 10);
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

function init() {
  const root = path.resolve(opt('root', '.'));
  const area = opt('area') ?? die('--area is required (a path, or several comma-separated)');
  const slug = slugify(opt('slug', area.split(',')[0].split('/').filter(Boolean).at(-1)));
  const id = `${today()}-${slug}`;
  const dir = path.join(root, 'tiger', 'hunts', id);
  if (fs.existsSync(path.join(dir, 'run.json')) && !flag('force')) die(`${posix(dir)} exists (--force to re-init the templates)`);
  const head = git(root, ['rev-parse', 'HEAD']).trim();
  fs.mkdirSync(dir, { recursive: true });
  saveRun(dir, { id, area: area.split(','), head, created: new Date().toISOString(), rounds: {} });
  const tpl = (f) => fs.readFileSync(path.join(SKILL, 'references', f), 'utf8');
  if (!fs.existsSync(path.join(dir, 'brief.md')) || flag('force')) fs.writeFileSync(path.join(dir, 'brief.md'), tpl('brief-template.md').replaceAll('{{area}}', area).replaceAll('{{head}}', head.slice(0, 10)).replaceAll('{{date}}', today()));
  const gi = path.join(root, 'tiger', '.gitignore');
  if (!fs.existsSync(gi)) fs.writeFileSync(gi, 'hunts/*/seats/\nhunts/*/_logs/\n');
  console.log(`run ${id}: ${posix(dir)}\nnext: write brief.md (the territory dossier), then: node ${posix(path.join(HERE, 'tiger.mjs'))} convene --run ${posix(dir)}`);
}

// =================================================================================== convene
function seatPrompt(round, run, dir, ws) {
  const tpl = fs.readFileSync(path.join(SKILL, 'references', round === 2 ? 'seat-round2.md' : 'seat-round1.md'), 'utf8');
  return tpl
    .replaceAll('{{brief}}', posix(path.join(dir, 'brief.md')))
    .replaceAll('{{pool}}', posix(path.join(dir, 'pool.md')))
    .replaceAll('{{workspace}}', posix(ws))
    .replaceAll('{{area}}', run.area.join(', '));
}

function worktree(run) {
  const base = process.env.TIGER_WORK ?? (WIN ? 'C:/t' : os.tmpdir());
  const ws = path.join(base, `tiger-${run.id}`);
  if (!fs.existsSync(ws)) {
    fs.mkdirSync(base, { recursive: true });
    git(run.root, ['-c', 'core.longpaths=true', 'worktree', 'add', '--detach', ws, run.head], { stdio: 'ignore' });
  }
  return ws;
}

async function convene() {
  const dir = path.resolve(opt('run') ?? die('--run is required'));
  const run = loadRun(dir);
  const round = Number(opt('round', '1'));
  if (![1, 2].includes(round)) die('--round is 1 or 2');
  if (round === 2 && !fs.existsSync(path.join(dir, 'pool.md'))) die('round 2 reads pool.md: run `pool` after round 1 first');
  const brief = fs.readFileSync(path.join(dir, 'brief.md'), 'utf8');
  if (/\{\{|TODO\(tiger\)/.test(brief)) die('brief.md still carries template markers - the caller writes the dossier before any seat reads it');
  const seats = parseParticipants(opt('seats', run.seats ?? DEFAULT_SEATS));
  const timeoutMs = Number(opt('ceiling-min', '40')) * 60_000;
  const ws = worktree(run);
  const only = opt('only');
  // The rendered prompt holds absolute paths (the brief, the seats' worktree), so it lives in
  // the ignored _logs/ beside the seat output, never in the committed run directory.
  const promptFile = path.join(dir, '_logs', `prompt-r${round}.md`);
  fs.mkdirSync(path.dirname(promptFile), { recursive: true });
  fs.writeFileSync(promptFile, seatPrompt(round, run, dir, ws));
  const short = `Read ${posix(promptFile)} and follow it exactly. Work autonomously; never ask questions.`;
  run.rounds[round] = run.rounds[round] ?? { started: new Date().toISOString(), seats: {} };
  run.seats = seats.map((p) => p.spec).join(',');
  saveRun(dir, run);
  const jobs = seats.filter((p) => !only || p.id === only).map(async (p) => {
    const logDir = path.join(dir, '_logs', `r${round}`, p.id);
    const rec = path.join(logDir, 'record.json');
    if (fs.existsSync(rec) && !flag('force') && readJson(rec).outcome === 'completed') { console.log(`${p.id}: round ${round} already completed`); return; }
    const bin = resolveBin(p.engine);
    if (!bin) { writeJson(rec, { id: p.id, spec: p.spec, outcome: 'skipped', reason: `no ${p.engine} CLI` }); console.log(`${p.id}: skipped (no CLI)`); return; }
    const command = engineCommand(p, bin, short, { workspace: '.' });
    console.log(`${p.id}: round ${round} starting (ceiling ${timeoutMs / 60000} min)`);
    const r = await runSeat(command, { cwd: ws, timeoutMs, logDir });
    const parsed = parseEnvelope(p.engine, r.stdout);
    const record = { id: p.id, spec: p.spec, engine: p.engine, model: p.model, effort: p.effort, round, outcome: classifyOutcome(parsed, r), exit: r.exit, timed_out: r.timedOut, wall_s: r.wall_s, turns: parsed.turns, cost_usd: parsed.cost_usd, usage: parsed.usage, errors: parsed.errors, finished: new Date().toISOString() };
    fs.writeFileSync(path.join(logDir, 'final.md'), parsed.final ?? '');
    writeJson(rec, record);
    console.log(`${p.id}: ${record.outcome} in ${r.wall_s}s${parsed.cost_usd != null ? `, $${parsed.cost_usd.toFixed(2)}` : ''}`);
  });
  await Promise.all(jobs);
  // seats are told the worktree is read-only; a change there is a defect worth recording, not a result
  const stray = git(ws, ['status', '--porcelain']).split('\n').filter(Boolean);
  run.rounds[round].finished = new Date().toISOString();
  run.rounds[round].stray_changes = stray.length;
  saveRun(dir, run);
  if (stray.length) console.log(`WARNING: ${stray.length} change(s) in the seats' read-only worktree:\n${stray.slice(0, 10).join('\n')}`);
  console.log(`next: node ${posix(path.join(HERE, 'tiger.mjs'))} pool --run ${posix(dir)}`);
}

// =================================================================================== pool
function lineCounter(ws) {
  const cache = new Map();
  return (rel) => {
    if (cache.has(rel)) return cache.get(rel);
    let n = null;
    const f = path.join(ws, rel);
    try { if (fs.statSync(f).isFile()) n = fs.readFileSync(f, 'utf8').split('\n').length; } catch { n = null; }
    cache.set(rel, n);
    return n;
  };
}

function pool() {
  const dir = path.resolve(opt('run') ?? die('--run is required'));
  const run = loadRun(dir);
  const ws = worktree(run);
  const count = lineCounter(ws);
  let current = null;
  const problems = {};
  for (const round of [1, 2]) {
    const rdir = path.join(dir, '_logs', `r${round}`);
    if (!fs.existsSync(rdir)) continue;
    const results = [];
    for (const id of fs.readdirSync(rdir).sort()) {
      const rec = path.join(rdir, id, 'record.json');
      if (!fs.existsSync(rec)) continue;
      const r = readJson(rec);
      const final = fs.existsSync(path.join(rdir, id, 'final.md')) ? fs.readFileSync(path.join(rdir, id, 'final.md'), 'utf8') : '';
      const parsed = parseSeatOutput(final);
      if (parsed.problems.length) problems[`r${round}/${id}`] = parsed.problems;
      results.push({ seat: id, spec: r.spec, round, proposals: parsed.proposals, ratings: parsed.ratings });
    }
    current = buildPool(results, current);
  }
  if (!current || !current.proposals.length) die('no proposals parsed from any seat - read _logs/r*/<seat>/final.md and stderr.log');
  for (const p of current.proposals) p.anchor_check = checkAnchors(p.anchors, count);
  current.problems = problems;
  writeJson(path.join(dir, 'pool.json'), current);
  fs.writeFileSync(path.join(dir, 'pool.md'), poolMarkdown(current, { title: `Tiger pool - ${run.area.join(', ')}` }));
  const unanchored = current.proposals.filter((p) => p.anchor_check.ok === 0).length;
  console.log(`pool: ${current.proposals.length} proposals from ${Object.keys(current.seats).length} seats, ${unanchored} with no valid anchor -> ${posix(path.join(dir, 'pool.md'))}`);
  for (const [k, v] of Object.entries(problems)) console.log(`  ${k}: ${v.join('; ')}`);
}

// =================================================================================== ledger
function ledger() {
  const dir = path.resolve(opt('run') ?? die('--run is required'));
  const run = loadRun(dir);
  const p = readJson(path.join(dir, 'pool.json'));
  const vf = path.join(dir, 'verdict.json');
  if (!fs.existsSync(vf)) die('verdict.json is missing - the caller writes it after judging (see references/verdict.md)');
  const verdict = readJson(vf);
  const records = {};
  for (const round of [1, 2]) {
    const rdir = path.join(dir, '_logs', `r${round}`);
    if (!fs.existsSync(rdir)) continue;
    for (const id of fs.readdirSync(rdir)) {
      const rec = path.join(rdir, id, 'record.json');
      if (!fs.existsSync(rec)) continue;
      const r = readJson(rec);
      const acc = records[id] ?? { outcome: r.outcome, wall_s: 0, cost_usd: null };
      acc.wall_s += r.wall_s ?? 0;
      if (r.cost_usd != null) acc.cost_usd = (acc.cost_usd ?? 0) + r.cost_usd;
      if (r.outcome !== 'completed') acc.outcome = r.outcome;
      records[id] = acc;
    }
  }
  const rows = seatStats(p, verdict, records);
  const out = path.join(run.root, 'tiger', 'seats.jsonl');
  const lines = rows.map((r) => JSON.stringify({ run: run.id, area: run.area, at: today(), ...r }));
  // One row per seat per run (SKILL.md): a re-run - after verdict.json gains `landed`, or a fix -
  // REPLACES this run's rows. Appending doubled every seat's numbers. Other runs' lines, and any
  // line that does not parse, are kept as they are.
  const prior = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split('\n').filter((l) => l.trim()) : [];
  const ofThisRun = (l) => { try { return JSON.parse(l).run === run.id; } catch { return false; } };
  const kept = prior.filter((l) => !ofThisRun(l));
  const replaced = prior.length - kept.length;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const tmp = `${out}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${[...kept, ...lines].join('\n')}\n`);
  fs.renameSync(tmp, out);
  // `kept / approved / landed` count pool ids, so a folded cluster member reads as landed; the
  // items-led column credits each scope item once, to its lead's seat (n/a without verdict.items).
  const led = (r) => (r.led_approved == null ? 'n/a' : `${r.led_approved} / ${r.led_landed ?? 'n/a'}`);
  console.log('| seat | outcome | proposals | anchors ok % | peer mean | kept | approved | landed | items led (appr / landed) | wall s | $ |\n|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) console.log(`| ${r.spec} | ${r.outcome ?? '-'} | ${r.proposals} | ${r.anchors_ok ?? '-'} | ${r.peer_mean ?? '-'} | ${r.kept} | ${r.approved} | ${r.landed} | ${led(r)} | ${r.wall_s ?? '-'} | ${r.cost_usd != null ? r.cost_usd.toFixed(2) : 'n/a'} |`);
  console.log(`${replaced ? `replaced ${replaced} earlier row(s) of ${run.id} with` : 'appended'} ${rows.length} row(s) in ${posix(out)}`);
}

// =================================================================================== clean
function clean() {
  const dir = path.resolve(opt('run') ?? die('--run is required'));
  const run = loadRun(dir);
  const base = process.env.TIGER_WORK ?? (WIN ? 'C:/t' : os.tmpdir());
  const ws = path.join(base, `tiger-${run.id}`);
  if (!fs.existsSync(ws)) { console.log('no worktree'); return; }
  try { git(run.root, ['worktree', 'remove', '--force', ws], { stdio: 'ignore' }); } catch { /* fall through to prune */ }
  if (fs.existsSync(ws) && !fs.existsSync(path.join(ws, '.git'))) fs.rmSync(ws, { recursive: true, force: true });
  git(run.root, ['worktree', 'prune'], { stdio: 'ignore' });
  console.log(`removed ${posix(ws)}`);
}

const CMDS = { probe, hunt, init, convene, pool, ledger, clean };
if (!CMDS[cmd]) die(`usage: tiger.mjs <${Object.keys(CMDS).join('|')}> ... (see the header of this file)`);
await CMDS[cmd]();
