#!/usr/bin/env node
/**
 * contest - run a blind design contest between CLI agent seats.
 *
 *   node contest.mjs init    --id <slug> --title "<t>" --brief <file> --participants <specs> [--variants 3]
 *                            [--arena .contest/arena] [--data <dir>] [--vault .contest] [--vault-subdir Contest]
 *                            [--project <name>] [--timeout-min 60]
 *   node contest.mjs run     --id <slug> [--only <participant-id>] [--force]
 *   node contest.mjs plan    --id <slug> [--kind participants|judges] [--judges <specs>] [--only <id>]
 *                            (seats as JSON, prepared but not spawned - for a host's own queue)
 *   node contest.mjs collect --id <slug>
 *   node contest.mjs judge   --id <slug> --judges <specs> [--timeout-min 30] [--force] [--keep-workspaces]
 *   node contest.mjs aggregate --id <slug> [--keep-workspaces]
 *                            (judges work in staged copies outside the arena; aggregate harvests their
 *                             verdicts into judging/ and deletes the copies unless --keep-workspaces)
 *   node contest.mjs verdict --id <slug> --winner <A/2> [--runner-up <B/1>] [--note <file|text>]
 *                            [--pattern "slug|statement|evidence"]... [--force]
 *   node contest.mjs verdict --id <slug> --shortlist <A/2,C/1> [--note ...] [--pattern ...]   (the owner wants another round)
 *   node contest.mjs refine  --id <slug> --shortlist <A/2,C/1> --feedback <file> [--round 2] [--timeout-min 60]
 *   node contest.mjs status  --id <slug>
 *
 * A participant spec is engine:model@effort[#label] - claude:opus@xhigh, grok:grok-4.6@high,
 * codex:gpt-5.6-sol@high. Every step is idempotent and file-backed, so a killed session resumes
 * by re-running the same command. Builtins only.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseParticipants, engineCommand, parseEnvelope, classifyOutcome } from './lib/participants.mjs';
import { blindMap, unblind, scrubIdentity, validateVerdict, aggregate, tallyPatterns, scoreboardMarkdown, feedbackSection } from './lib/judging.mjs';
import { renderContestNote, upsertIndex, upsertPatterns, readPatterns, slugify } from './lib/vault.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REFERENCES = path.join(HERE, '..', 'references');
const WIN = process.platform === 'win32';

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const cmd = argv[0];
const opts = { _pattern: [] };
for (let i = 1; i < argv.length; i += 1) {
  const a = argv[i];
  if (!a.startsWith('--')) continue;
  const key = a.slice(2);
  const next = argv[i + 1];
  const val = next === undefined || next.startsWith('--') ? true : (i += 1, next);
  if (key === 'pattern') opts._pattern.push(val); else opts[key] = val;
}
const need = (k) => { if (opts[k] === undefined || opts[k] === true) die(`--${k} is required`); return opts[k]; };
function die(msg, code = 2) { console.error(`contest: ${msg}`); process.exit(code); }
const read = (f) => fs.readFileSync(f, 'utf8');
const readIf = (f) => (fs.existsSync(f) ? read(f) : null);
const writeJson = (f, v) => fs.writeFileSync(f, `${JSON.stringify(v, null, 2)}\n`);
const readJson = (f) => JSON.parse(read(f));
const today = () => new Date().toISOString().slice(0, 10);
const cwd = process.cwd();

// ---------------------------------------------------------------- layout
const arenaRoot = () => path.resolve(cwd, opts.arena ?? '.contest/arena');
const contestDir = (id) => path.join(arenaRoot(), id);
const load = () => {
  const id = need('id');
  const dir = contestDir(id);
  const file = path.join(dir, 'contest.json');
  if (!fs.existsSync(file)) die(`no contest "${id}" under ${arenaRoot()} - run init first`);
  const c = readJson(file);
  if (opts.arena === undefined && c.arena) return { c, dir: path.join(c.arena, id) };
  return { c, dir };
};
const save = (dir, c) => writeJson(path.join(dir, 'contest.json'), c);

const copyDir = (from, to) => { fs.mkdirSync(to, { recursive: true }); fs.cpSync(from, to, { recursive: true }); };

// ---------------------------------------------------------------- engines
function resolveBin(engine) {
  const env = process.env[`CONTEST_${engine.toUpperCase()}_BIN`];
  if (env) return env.includes('|') ? env.split('|') : env;
  const exts = WIN ? ['.exe', '.cmd', ''] : [''];
  const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean);
  const home = os.homedir();
  const fallbacks = {
    claude: [path.join(home, '.local', 'bin', 'claude.exe'), path.join(home, '.local', 'bin', 'claude')],
    grok: [path.join(home, '.grok', 'bin', 'grok.exe'), path.join(home, '.grok', 'bin', 'grok')],
    codex: [],
  };
  const candidates = [];
  for (const d of dirs) for (const e of exts) candidates.push(path.join(d, engine + e));
  candidates.push(...fallbacks[engine]);
  for (const c of candidates) {
    if (!fs.existsSync(c)) continue;
    // An npm shim cannot be spawned without a shell; run the package's entry script with this node.
    if (/\.cmd$/i.test(c) || !path.extname(c)) {
      const entry = {
        codex: 'node_modules/@openai/codex/bin/codex.js',
        claude: 'node_modules/@anthropic-ai/claude-code/cli.js',
      }[engine];
      const script = entry && path.join(path.dirname(c), entry);
      if (script && fs.existsSync(script)) return [process.execPath, script];
      if (WIN) continue;
    }
    return c;
  }
  die(`cannot find the ${engine} CLI on PATH; set CONTEST_${engine.toUpperCase()}_BIN`);
  return null;
}

function runSeat({ argv: cmdArgv, stdin, env }, { cwd: dir, timeoutMs, logDir, label }) {
  fs.mkdirSync(logDir, { recursive: true });
  const t0 = Date.now();
  return new Promise((resolve) => {
    const p = spawn(cmdArgv[0], cmdArgv.slice(1), { cwd: dir, env: { ...process.env, ...env }, windowsHide: true });
    const out = fs.createWriteStream(path.join(logDir, 'stdout.log'));
    const err = fs.createWriteStream(path.join(logDir, 'stderr.log'));
    const chunks = [];
    p.stdout.on('data', (d) => { chunks.push(d); out.write(d); });
    p.stderr.on('data', (d) => err.write(d));
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      if (WIN) spawn('taskkill', ['/F', '/T', '/PID', String(p.pid)], { windowsHide: true });
      else p.kill('SIGKILL');
    }, timeoutMs);
    p.on('error', (e) => { err.write(`spawn error: ${e.message}\n`); });
    p.on('close', (code) => {
      clearTimeout(timer);
      out.end(); err.end();
      resolve({ exit: code, timedOut, stdout: Buffer.concat(chunks).toString('utf8'), wall_s: Math.round((Date.now() - t0) / 10) / 100, label });
    });
    p.stdin.on('error', () => {});
    p.stdin.end(stdin ?? '');
  });
}

async function runSeats(seats, { timeoutMs, force, kind }) {
  const jobs = seats.map(async ({ p, dir, logDir, prompt }) => {
    const recordFile = path.join(logDir, 'record.json');
    if (!force && fs.existsSync(recordFile) && readJson(recordFile).outcome === 'completed') {
      console.log(`${kind} ${p.id}: already completed (use --force to rerun)`);
      return readJson(recordFile);
    }
    const bin = resolveBin(p.engine);
    const command = engineCommand(p, bin, prompt, { workspace: '.' });
    console.log(`${kind} ${p.id}: starting (${p.engine} ${p.model}@${p.effort}, ceiling ${Math.round(timeoutMs / 60000)} min)`);
    fs.mkdirSync(logDir, { recursive: true });
    writeJson(path.join(logDir, 'command.json'), { argv: command.argv, cwd: dir, started: new Date().toISOString() });
    const r = await runSeat(command, { cwd: dir, timeoutMs, logDir, label: p.id });
    const parsed = parseEnvelope(p.engine, r.stdout);
    const outcome = classifyOutcome(parsed, r);
    const record = {
      id: p.id, spec: p.spec, engine: p.engine, model: p.model, effort: p.effort,
      outcome, exit: r.exit, timed_out: r.timedOut, wall_s: r.wall_s,
      turns: parsed.turns, cost_usd: parsed.cost_usd, usage: parsed.usage, model_usage: parsed.model_usage,
      errors: parsed.errors, finished: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(logDir, 'final.md'), parsed.final ?? '');
    writeJson(recordFile, record);
    console.log(`${kind} ${p.id}: ${outcome} in ${r.wall_s}s, ${parsed.turns} turns${parsed.cost_usd != null ? `, $${parsed.cost_usd.toFixed(2)} reported` : ''}${parsed.errors.length ? ` - ${parsed.errors[0]}` : ''}`);
    return record;
  });
  return Promise.all(jobs);
}

// ---------------------------------------------------------------- init
function init() {
  const id = slugify(need('id'));
  const title = need('title');
  const briefFile = need('brief');
  const participants = parseParticipants(need('participants'));
  const variants = Number(opts.variants ?? 3);
  const dir = contestDir(id);
  if (fs.existsSync(path.join(dir, 'contest.json')) && !opts.force) die(`contest "${id}" exists at ${dir} (use --force to re-init the briefs; entries are kept)`);
  fs.mkdirSync(path.join(dir, 'entries'), { recursive: true });
  // The template opens the brief with its own "## The idea"; a brief that starts the same way
  // would print the heading twice (measured on the first contest).
  const brief = read(briefFile).trim().replace(/^##\s+The idea\s*\n+/i, '');
  fs.writeFileSync(path.join(dir, 'BRIEF.md'), `${brief}\n`);
  if (opts.data) copyDir(path.resolve(cwd, opts.data), path.join(dir, 'data'));
  const hasData = fs.existsSync(path.join(dir, 'data'));

  const vault = path.resolve(cwd, opts.vault ?? '.contest');
  const c = {
    id, title, date: today(), project: opts.project ?? path.basename(cwd), arena: arenaRoot(),
    brief_file: 'BRIEF.md', variants, timeout_min: Number(opts['timeout-min'] ?? 60),
    participants, judges: [], vault, vault_subdir: opts['vault-subdir'] ?? 'Contest',
    created: new Date().toISOString(),
  };
  save(dir, c);

  // The ledger of past winners is the one thing that makes contest n+1 better than contest n.
  const ledger = readPatterns(readIf(path.join(vault, c.vault_subdir, 'Patterns.md')));
  const top = ledger.filter((p) => p.wins > 0 || p.seen > 1).slice(0, 8);
  const patternsSection = top.length
    ? ['## What has won before', '', 'Judges of earlier contests named these philosophies in winning work. They are the floor, not a recipe: a variant that merely re-implements one of them will lose to one that finds the next.', '', ...top.map((p) => `- **${p.slug}** (won ${p.wins}, seen ${p.seen}): ${p.statement}`)].join('\n')
    : '';
  const template = read(path.join(REFERENCES, 'participant-brief.md'));
  const dataLine = hasData
    ? 'The input data is in `data/` beside the variant directories, with `data/SCHEMA.md` describing it. Reference it by relative path from `index.html` (for example `<script src="../data/knowledge.js">`), or inline it. Never modify `data/`.'
    : 'No input data is provided; build your own realistic dataset inside the variant and say in `NOTES.md` how it was made.';
  for (const p of participants) {
    const ws = path.join(dir, 'entries', p.id);
    fs.mkdirSync(ws, { recursive: true });
    if (hasData) copyDir(path.join(dir, 'data'), path.join(ws, 'data'));
    const text = template
      .replaceAll('{{title}}', title).replaceAll('{{brief}}', brief).replaceAll('{{variants}}', String(variants))
      .replaceAll('{{data_line}}', dataLine).replaceAll('{{patterns_section}}', patternsSection)
      .replaceAll('{{timeout}}', String(c.timeout_min));
    fs.writeFileSync(path.join(ws, 'PARTICIPANT.md'), text);
  }
  console.log(`contest "${id}" at ${dir}\n  ${participants.length} participant(s): ${participants.map((p) => p.spec).join(', ')}\n  ${variants} variants each, ${c.timeout_min} min ceiling, data: ${hasData ? 'staged' : 'none'}, prior patterns quoted: ${top.length}\n  vault: ${path.join(vault, c.vault_subdir)}`);
}

// ---------------------------------------------------------------- run
const PARTICIPANT_PROMPT = 'You are a participant in a design contest. Read PARTICIPANT.md in the current directory and deliver exactly what it specifies, into this directory. Work autonomously to the end; never ask a question; stop when every variant and its notes exist.';

function participantSeats(c, dir) {
  const only = opts.only ? String(opts.only).split(',') : null;
  return c.participants.filter((p) => !only || only.includes(p.id)).map((p) => ({
    p, dir: path.join(dir, 'entries', p.id), logDir: path.join(dir, 'runs', p.id), prompt: PARTICIPANT_PROMPT,
  }));
}

async function run() {
  const { c, dir } = load();
  const seats = participantSeats(c, dir);
  if (!seats.length) die('no participants selected');
  const records = await runSeats(seats, { timeoutMs: Number(opts['timeout-min'] ?? c.timeout_min) * 60000, force: !!opts.force, kind: 'participant' });
  const bad = records.filter((r) => r.outcome !== 'completed');
  if (bad.length) console.log(`\n${bad.length} seat(s) did not complete: ${bad.map((r) => `${r.id} (${r.outcome})`).join(', ')} - rerun with --only <id> [--force]; collect will score what exists`);
}

// ---------------------------------------------------------------- collect
function collect() {
  const { c, dir } = load();
  const ids = c.participants.map((p) => p.id);
  const extraWords = c.participants.flatMap((p) => [p.id, p.model, p.spec]);
  const manifest = { contest: c.id, collected: new Date().toISOString(), entries: {}, leaks: {} };
  const blind = blindMap(ids, c.id);
  const judging = path.join(dir, 'judging');
  fs.rmSync(path.join(judging, 'entries'), { recursive: true, force: true });
  for (const [letter, id] of Object.entries(blind)) {
    const ws = path.join(dir, 'entries', id);
    const record = readIf(path.join(dir, 'runs', id, 'record.json'));
    const entry = { letter, variants: [], record: record ? JSON.parse(record) : null, stray: [] };
    for (const name of fs.existsSync(ws) ? fs.readdirSync(ws) : []) {
      if (['PARTICIPANT.md', 'data', 'reference'].includes(name) || /^variant-\d+$/.test(name)) continue;
      entry.stray.push(name);
    }
    let leaks = 0;
    // A refinement round expects specific variant numbers per seat, not 1..N.
    const wanted = c.expected?.[id] ?? Array.from({ length: c.variants }, (_, i) => i + 1);
    for (const n of wanted) {
      const vdir = path.join(ws, `variant-${n}`);
      const index = path.join(vdir, 'index.html');
      const v = { n, present: fs.existsSync(index), files: [], bytes: 0, title: '', notes: fs.existsSync(path.join(vdir, 'NOTES.md')) };
      if (v.present) {
        const dest = path.join(judging, 'entries', letter, `variant-${n}`);
        fs.mkdirSync(dest, { recursive: true });
        for (const f of fs.readdirSync(vdir, { withFileTypes: true, recursive: true })) {
          if (!f.isFile()) continue;
          const rel = path.relative(vdir, path.join(f.parentPath ?? f.path, f.name));
          const src = path.join(vdir, rel);
          const st = fs.statSync(src);
          v.files.push(rel); v.bytes += st.size;
          const target = path.join(dest, rel);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          if (/\.(html?|css|js|mjs|md|json|svg|txt)$/i.test(rel) && st.size < 8_000_000) {
            const { text, count } = scrubIdentity(read(src), extraWords);
            leaks += count;
            fs.writeFileSync(target, text);
          } else fs.copyFileSync(src, target);
        }
        v.title = (read(index).match(/<title>([^<]*)<\/title>/i)?.[1] ?? '').trim();
        const notes = readIf(path.join(vdir, 'NOTES.md'));
        v.concept = (notes?.match(/^#\s+(.+)$/m)?.[1] ?? v.title).trim();
      }
      entry.variants.push(v);
    }
    if (fs.existsSync(path.join(ws, 'data'))) copyDir(path.join(ws, 'data'), path.join(judging, 'entries', letter, 'data'));
    manifest.entries[id] = entry;
    manifest.leaks[id] = leaks;
  }
  writeJson(path.join(dir, 'runs', 'blind-map.json'), blind);
  writeJson(path.join(dir, 'manifest.json'), manifest);
  fs.writeFileSync(path.join(dir, 'gallery.html'), gallery(c, manifest, blind));
  for (const [id, e] of Object.entries(manifest.entries)) {
    const present = e.variants.filter((v) => v.present).length;
    console.log(`${e.letter} <- ${id}: ${present}/${e.variants.length} variants${e.stray.length ? `, stray: ${e.stray.join(', ')}` : ''}${manifest.leaks[id] ? `, ${manifest.leaks[id]} identity leak(s) redacted` : ''}`);
    for (const v of e.variants) if (v.present) console.log(`    ${v.n}. ${v.concept || '(untitled)'} - ${Math.round(v.bytes / 1024)} KB${v.notes ? '' : ' - NO NOTES'}`);
  }
  console.log(`gallery: ${path.join(dir, 'gallery.html')} (unblinded, for the host)\nblinded copies: ${path.join(judging, 'entries')}`);
}

function gallery(c, manifest, blind) {
  const rows = Object.entries(blind).map(([letter, id]) => {
    const e = manifest.entries[id];
    const cards = e.variants.map((v) => (v.present
      ? `<a class="card" href="entries/${id}/variant-${v.n}/index.html" target="_blank"><b>${letter}/${v.n}</b> ${esc(v.concept || v.title || 'untitled')}<small>${Math.round(v.bytes / 1024)} KB${v.notes ? '' : ' - no notes'}</small></a>`
      : `<div class="card missing"><b>${letter}/${v.n}</b> missing</div>`)).join('');
    const rec = e.record ? `${e.record.outcome}, ${Math.round(e.record.wall_s / 60)} min${e.record.cost_usd != null ? `, $${e.record.cost_usd.toFixed(2)}` : ''}` : 'not run';
    return `<section><h2>${letter} <span>${esc(id)} - ${esc(rec)}</span></h2><div class="cards">${cards}</div></section>`;
  }).join('');
  return `<!doctype html><meta charset="utf-8"><title>${esc(c.title)} - gallery</title><style>body{font:15px/1.5 system-ui;margin:2rem auto;max-width:60rem;padding:0 1rem;background:#0f1115;color:#e6e6e6}h1{font-weight:600}h2{font-size:1.1rem;margin:2rem 0 .5rem}h2 span{font-weight:400;color:#8a8f98;margin-left:.6rem}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(16rem,1fr));gap:.6rem}.card{display:block;padding:.8rem 1rem;border:1px solid #2a2f3a;border-radius:.6rem;color:inherit;text-decoration:none;background:#171a21}.card:hover{border-color:#6ea8fe}.card b{display:block;color:#6ea8fe}.card small{display:block;color:#8a8f98}.missing{opacity:.5}</style><h1>${esc(c.title)}</h1><p>Unblinded gallery for the host. Judges see letters only. Open each variant in a new tab and score it against the same rubric the panel used.</p>${rows}`;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

// ---------------------------------------------------------------- judge
async function judge() {
  const { c, dir } = load();
  const judges = parseParticipants(need('judges'));
  const seats = prepareJudges(c, dir, judges);
  const records = await runSeats(seats, { timeoutMs: Number(opts['timeout-min'] ?? 30) * 60000, force: !!opts.force, kind: 'judge' });
  const badRecords = records.filter((r) => r.outcome !== 'completed');
  if (badRecords.length) console.log(`${badRecords.length} judge(s) did not complete: ${badRecords.map((r) => `${r.id} (${r.outcome})`).join(', ')}`);
  aggregateVerdicts();
}

// A judge runs with its permissions bypassed, so "do not look" was a request, not a wall: from
// <arena>/judging/ the blind map was one `..` away (runs/blind-map.json, manifest.json). Each judge
// now works in a staged copy OUTSIDE the arena that holds only the redacted entries and its own
// brief; aggregate harvests the verdict back into judging/ and deletes the copy.
const stageRoot = () => path.join(os.tmpdir(), 'contest-judging');
const isStaged = (p) => { const rel = path.relative(stageRoot(), p); return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel); };

function stageJudgeWorkspace(c, judging, p) {
  // Reuse the recorded workspace, so a repeated plan cannot strand a verdict a host is already writing.
  const known = c.judge_workspaces?.[p.id];
  let ws = known && isStaged(known) && fs.existsSync(known) ? known : null;
  if (!ws) {
    fs.mkdirSync(stageRoot(), { recursive: true });
    ws = fs.mkdtempSync(path.join(stageRoot(), `${c.id}-${p.id}-`));
  }
  fs.rmSync(path.join(ws, 'entries'), { recursive: true, force: true });
  copyDir(path.join(judging, 'entries'), path.join(ws, 'entries')); // redacted by collect; carries entries/<letter>/data
  return ws;
}

// Writes each judge's JUDGE-<id>.md into its staged workspace (and a copy into judging/ for the
// record) and records the panel in contest.json, without spawning anything - `judge` runs the
// seats itself, `plan --kind judges` hands them to an outside dispatcher (a host app's own queue)
// that writes the same runs/<id>/record.json and final.md.
function prepareJudges(c, dir, judges) {
  const manifest = readJson(path.join(dir, 'manifest.json'));
  const judging = path.join(dir, 'judging');
  const brief = read(path.join(dir, 'BRIEF.md')).trim();
  const entriesText = Object.values(manifest.entries).sort((a, b) => a.letter.localeCompare(b.letter)).map((e) => {
    const present = e.variants.filter((v) => v.present).map((v) => `variant-${v.n}`);
    return `- **${e.letter}**: ${present.length ? present.join(', ') : '(no variants delivered - score nothing, note it in entry_note)'}`;
  }).join('\n');
  const template = read(path.join(REFERENCES, 'judge-brief.md'));
  c.judge_workspaces ??= {};
  const seats = judges.map((p) => {
    const file = `JUDGE-${p.id}.md`;
    const verdictFile = `verdict-${p.id}.json`;
    const text = template
      .replaceAll('{{title}}', c.title).replaceAll('{{brief}}', brief).replaceAll('{{entries}}', entriesText)
      .replaceAll('{{verdict_file}}', verdictFile).replaceAll('{{judge_id}}', p.id);
    const ws = stageJudgeWorkspace(c, judging, p);
    fs.writeFileSync(path.join(ws, file), text);
    fs.writeFileSync(path.join(judging, file), text);
    c.judge_workspaces[p.id] = ws;
    return { p, dir: ws, logDir:path.join(dir, 'runs', `judge-${p.id}`), prompt: `You are a judge on a blind design panel. Read ${file} in the current directory and follow it exactly; write your verdict to ${verdictFile} in the current directory. Never leave this directory. Work autonomously to the end; never ask a question.` };
  });
  c.judges = [...new Set([...c.judges, ...judges.map((j) => j.spec)])];
  save(dir, c);
  return seats;
}

// A judge that wrote its JSON into the final message instead of the file still counts. Runs on
// every aggregate, so a verdict recovers the same way whoever ran the judge seat.
function recoverVerdicts(c, dir) {
  if (!c.judges?.length) return;
  const judging = path.join(dir, 'judging');
  for (const p of parseParticipants(c.judges.join(','))) {
    const vf = path.join(judging, `verdict-${p.id}.json`);
    if (fs.existsSync(vf)) continue;
    const final = readIf(path.join(dir, 'runs', `judge-${p.id}`, 'final.md')) ?? '';
    const m = final.match(/\{[\s\S]*\}/);
    if (m) { try { writeJson(vf, JSON.parse(m[0])); console.log(`judge ${p.id}: verdict recovered from the final message`); } catch { /* reported by aggregate */ } }
  }
}

// A verdict a judge wrote in its staged workspace is copied back into judging/, where aggregate
// reads it. The staged copy is the newer one, so it overwrites.
function harvestVerdicts(c, dir) {
  const judging = path.join(dir, 'judging');
  for (const [id, ws] of Object.entries(c.judge_workspaces ?? {})) {
    const staged = path.join(ws, `verdict-${id}.json`);
    if (!fs.existsSync(staged)) continue;
    fs.copyFileSync(staged, path.join(judging, `verdict-${id}.json`));
    console.log(`judge ${id}: verdict harvested from its staged workspace`);
  }
}

// Once a judge's verdict is in judging/ (harvested or recovered), its staged workspace has done its
// job. --keep-workspaces leaves them for inspection. Only paths under the staging root are ever removed.
function releaseWorkspaces(c, dir) {
  if (opts['keep-workspaces']) return;
  const judging = path.join(dir, 'judging');
  let changed = false;
  for (const [id, ws] of Object.entries(c.judge_workspaces ?? {})) {
    if (!fs.existsSync(path.join(judging, `verdict-${id}.json`))) continue;
    if (isStaged(ws)) fs.rmSync(ws, { recursive: true, force: true });
    delete c.judge_workspaces[id];
    changed = true;
  }
  if (changed) save(dir, c);
}

function aggregateVerdicts() {
  const { c, dir } = load();
  harvestVerdicts(c, dir);
  recoverVerdicts(c, dir);
  releaseWorkspaces(c, dir);
  const judging = path.join(dir, 'judging');
  const manifest = readJson(path.join(dir, 'manifest.json'));
  const expected = Object.fromEntries(Object.values(manifest.entries).map((e) => [e.letter, e.variants.filter((v) => v.present).map((v) => v.n)]));
  const verdicts = [];
  // Panel verdicts land in judging/ (harvested from the judges' staged workspaces); the host's own
  // verdict lands in runs/, which no judge workspace contains - the first contest's second judge cited
  // the host's screenshots, which had been written next to the entries.
  const verdictFiles = [judging, path.join(dir, 'runs')].flatMap((d) => (fs.existsSync(d)
    ? fs.readdirSync(d).filter((x) => /^verdict-.*\.json$/.test(x)).map((x) => path.join(d, x)) : []));
  for (const file of verdictFiles) {
    const f = path.relative(dir, file);
    let v;
    try { v = readJson(file); } catch (e) { console.log(`${f}: unreadable (${e.message})`); continue; }
    v.judge ??= f.replace(/^verdict-|\.json$/g, '');
    const problems = validateVerdict(v, expected);
    if (problems.length) console.log(`${f}: ${problems.length} problem(s) - ${problems.slice(0, 4).join('; ')}${problems.length > 4 ? '; ...' : ''}`);
    verdicts.push(v);
  }
  if (!verdicts.length) { console.log('no verdicts yet'); return null; }
  const blind = readJson(path.join(dir, 'runs', 'blind-map.json'));
  const rows = aggregate(verdicts);
  const participants = Object.fromEntries(c.participants.map((p) => [p.id, p]));
  const md = scoreboardMarkdown(rows, blind, participants);
  const patterns = tallyPatterns(verdicts, 'patterns');
  const anti = tallyPatterns(verdicts, 'anti_patterns');
  writeJson(path.join(judging, 'scoreboard.json'), { judges: verdicts.map((v) => v.judge), rows, patterns, anti_patterns: anti });
  fs.writeFileSync(path.join(judging, 'scoreboard.md'), `# Scoreboard - ${c.title}\n\nJudges: ${verdicts.map((v) => v.judge).join(', ')}\n\n${md}\n\n## Patterns named\n\n${patterns.map((p) => `- (${p.judges.length}) ${p.statement}${p.variants.length ? ` - ${[...new Set(p.variants)].join(', ')}` : ''}`).join('\n') || '_none_'}\n\n## Anti-patterns named\n\n${anti.map((p) => `- (${p.judges.length}) ${p.statement}`).join('\n') || '_none_'}\n`);
  console.log(`\n${md}\n\nscoreboard: ${path.join(judging, 'scoreboard.md')}`);
  return { rows, verdicts, patterns, anti };
}

// ---------------------------------------------------------------- verdict
function verdict() {
  const { c, dir } = load();
  const blind = readJson(path.join(dir, 'runs', 'blind-map.json'));
  const manifest = readJson(path.join(dir, 'manifest.json'));
  const agg = aggregateVerdicts();
  if (!agg) die('no verdicts to decide on - run judge (and the host visual pass) first');
  const resolve = (key) => {
    if (!key) return null;
    const m = String(key).match(/^([A-Z])\/(\d+)$/);
    if (!m) die(`"${key}" is not <letter>/<n>`);
    const id = unblind(blind, m[1]);
    if (!id) die(`no entry "${m[1]}"`);
    const p = c.participants.find((x) => x.id === id);
    const v = manifest.entries[id].variants.find((x) => x.n === Number(m[2]));
    if (!v?.present) die(`${key} was not delivered`);
    return { label: key, id, spec: p.spec, n: Number(m[2]), concept: v.concept || v.title || 'untitled', path: path.join(dir, 'entries', id, `variant-${m[2]}`) };
  };
  // The owner may decline to name a winner and send a shortlist into another round instead.
  const shortlist = opts.shortlist && opts.shortlist !== true ? String(opts.shortlist).split(',').map((k) => resolve(k.trim())) : [];
  if (!shortlist.length) need('winner');
  const winner = shortlist.length ? null : resolve(opts.winner);
  const runnerUp = resolve(opts['runner-up']);
  const noteArg = opts.note ?? '';
  const decision = noteArg && fs.existsSync(path.resolve(cwd, noteArg)) ? read(path.resolve(cwd, noteArg)) : String(noteArg);

  // Host-curated patterns win over the tally: the tally is evidence, the host decides what generalizes.
  const curated = opts._pattern.map((s) => {
    const [slug, statement, evidence] = String(s).split('|').map((x) => x.trim());
    if (!slug || !statement) die(`--pattern needs "slug|statement|evidence", got "${s}"`);
    return { slug: slugify(slug), statement, evidence: evidence || statement, winner: !shortlist.length, from: 'host' };
  });
  const fromJudges = agg.patterns.map((p) => ({
    slug: slugify(p.key), statement: p.statement, evidence: `${p.statement} (${[...new Set(p.judges)].join(', ')})`,
    winner: !!winner && p.variants.includes(winner.label), from: `${p.judges.length} judge(s)`,
  }));
  // The ledger takes the host's curated statements when there are any; the panel's raw tally
  // (every judge's phrasing, merged only by its first words) goes into the contest note as
  // evidence. The first contest wrote all 20 tally entries as ledger sections - fifteen of them
  // restated the five that mattered, and the next brief would have quoted the noise.
  const patterns = curated.length ? curated : fromJudges;
  const noteEvidence = fromJudges.filter((f) => !curated.some((k) => k.slug === f.slug));
  const antiPatterns = agg.anti.map((p) => p.statement);

  const vaultDir = path.join(c.vault, c.vault_subdir);
  fs.mkdirSync(path.join(vaultDir, 'contests'), { recursive: true });
  const noteFile = path.join(vaultDir, 'contests', `${c.id}.md`);
  if (fs.existsSync(noteFile) && !opts.force) die(`${noteFile} exists - pass --force to rewrite the contest note`);
  const costs = c.participants.map((p) => {
    const r = manifest.entries[p.id]?.record;
    return `| ${p.spec} | ${blind && Object.entries(blind).find(([, id]) => id === p.id)?.[0]} | ${r ? r.outcome : 'not run'} | ${r ? Math.round(r.wall_s / 60) : '-'} min | ${r?.cost_usd != null ? `$${r.cost_usd.toFixed(2)}` : '-'} | ${r?.turns ?? '-'} |`;
  });
  const note = renderContestNote({
    id: c.id, title: c.title, date: c.date, project: c.project, brief: read(path.join(dir, 'BRIEF.md')),
    participants: c.participants, judges: agg.verdicts.map((v) => v.judge),
    scoreboard: scoreboardMarkdown(agg.rows, blind, Object.fromEntries(c.participants.map((p) => [p.id, p]))),
    winner, runnerUp, shortlist, patterns, antiPatterns, decision,
    panelPatterns: noteEvidence.map((p) => `${p.statement} _(${p.from})_`),
    costs: ['| Seat | Entry | Outcome | Wall | Reported cost | Turns |', '|---|---|---|--:|--:|--:|', ...costs].join('\n')
      + `\n\n${winner ? `Winner artefact: \`${winner.path}\`` : `Shortlisted artefacts: ${shortlist.map((x) => `\`${x.path}\``).join(', ')}`}\nReported cost is the CLI's own figure, not an invoice; subscription seats report an API-equivalent price.`,
  });
  fs.writeFileSync(noteFile, note);
  const indexFile = path.join(vaultDir, 'Contests.md');
  fs.writeFileSync(indexFile, upsertIndex(readIf(indexFile), {
    id: c.id, title: c.title, date: c.date, project: c.project, winner: winner ? `${winner.label} ${winner.concept}` : `shortlist: ${shortlist.map((x) => `${x.label} ${x.concept}`).join('; ')}`,
    winnerSeat: winner ? winner.spec : 'next round pending', participants: c.participants.length,
  }));
  const patternsFile = path.join(vaultDir, 'Patterns.md');
  fs.writeFileSync(patternsFile, upsertPatterns(readIf(patternsFile), c.id, patterns));
  c.winner = winner; c.runner_up = runnerUp; c.shortlist = shortlist; c.decided = new Date().toISOString();
  save(dir, c);
  console.log(`${winner ? `winner: ${winner.label} = ${winner.spec} - "${winner.concept}"` : `shortlist: ${shortlist.map((x) => `${x.label} (${x.spec})`).join(', ')} - run refine for the next round`}\nvault: ${noteFile}\n       ${indexFile}\n       ${patternsFile} (${patterns.length} pattern(s), ${patterns.filter((p) => p.winner).length} credited to a winner)`);
}

// ---------------------------------------------------------------- refine
// Another round for the owner's shortlist: one seat per shortlisted variant, seeded with that
// variant as the owner saw it, the owner's review of it, the panel's defect list, and redacted
// copies of the other shortlisted variants as references. It is a child contest (<id>-r<round>),
// so run, collect, judge and verdict work on it unchanged.
function refine() {
  const { c, dir } = load();
  const round = Number(opts.round ?? (c.round ?? 1) + 1);
  const keys = String(need('shortlist')).split(',').map((k) => k.trim()).filter(Boolean);
  const feedbackText = read(path.resolve(cwd, need('feedback'))).replace(/\r\n/g, '\n');
  const blind = readJson(path.join(dir, 'runs', 'blind-map.json'));
  const section = (name) => feedbackSection(feedbackText, name);
  const boardFile = path.join(dir, 'judging', 'scoreboard.json');
  const scoreboard = fs.existsSync(boardFile) ? readJson(boardFile) : { rows: [] };
  const childId = `${c.id}-r${round}`;
  const childDir = path.join(path.dirname(dir), childId);
  if (fs.existsSync(path.join(childDir, 'contest.json')) && !opts.force) die(`round ${round} exists at ${childDir} (use --force to rewrite the briefs; entries are kept)`);
  fs.mkdirSync(path.join(childDir, 'entries'), { recursive: true });
  fs.copyFileSync(path.join(dir, 'BRIEF.md'), path.join(childDir, 'BRIEF.md'));
  if (fs.existsSync(path.join(dir, 'data'))) copyDir(path.join(dir, 'data'), path.join(childDir, 'data'));
  const hasData = fs.existsSync(path.join(childDir, 'data'));
  const template = read(path.join(REFERENCES, 'refine-brief.md'));
  const brief = read(path.join(dir, 'BRIEF.md')).trim();
  const timeout = Number(opts['timeout-min'] ?? c.timeout_min);
  const names = c.participants.flatMap((x) => [x.id, x.model]);
  const participants = [];
  const expected = {};
  const lineage = {};
  for (const key of keys) {
    const m = key.match(/^([A-Z])\/(\d+)$/);
    if (!m) die(`"${key}" is not <letter>/<n>`);
    const parentId = unblind(blind, m[1]);
    const parent = c.participants.find((p) => p.id === parentId);
    if (!parent) die(`no entry "${m[1]}"`);
    const n = Number(m[2]);
    const src = path.join(dir, 'entries', parentId, `variant-${n}`);
    if (!fs.existsSync(path.join(src, 'index.html'))) die(`${key} has no index.html - it was deleted or never delivered`);
    const [p] = parseParticipants(`${parent.engine}:${parent.model}@${parent.effort}#v${n}`);
    participants.push(p); expected[p.id] = [n]; lineage[p.id] = { from: key, parent: parentId };
    const ws = path.join(childDir, 'entries', p.id);
    fs.mkdirSync(ws, { recursive: true });
    if (!fs.existsSync(path.join(ws, `variant-${n}`))) copyDir(src, path.join(ws, `variant-${n}`));
    copyDir(src, path.join(childDir, 'seed', p.id, `variant-${n}`)); // what the round started from, for a before/after
    if (hasData) copyDir(path.join(childDir, 'data'), path.join(ws, 'data'));
    const refs = [];
    for (const other of keys.filter((k) => k !== key)) {
      const [ol, on] = other.split('/');
      const osrc = path.join(dir, 'judging', 'entries', ol, `variant-${on}`);
      if (!fs.existsSync(osrc)) continue;
      const name = `${ol}-${on}`;
      copyDir(osrc, path.join(ws, 'reference', name));
      const concept = (readIf(path.join(osrc, 'NOTES.md'))?.match(/^#\s+(.+)$/m)?.[1] ?? name).trim();
      refs.push(`- \`reference/${name}/\` - "${concept}"`);
    }
    // A reference loads ../data relative to itself; give it a copy so it opens.
    if (refs.length && hasData) copyDir(path.join(childDir, 'data'), path.join(ws, 'reference', 'data'));
    const row = scoreboard.rows.find((r) => r.key === key);
    const panel = row?.notes?.length ? row.notes.map((x) => `- **${x.judge}**: ${x.weaknesses}`).join('\n') : '_(no panel notes recorded)_';
    fs.writeFileSync(path.join(ws, 'PARTICIPANT.md'), template
      .replaceAll('{{title}}', c.title).replaceAll('{{round}}', String(round)).replaceAll('{{brief}}', brief)
      .replaceAll('{{n}}', String(n)).replaceAll('{{feedback}}', section(key) || '_(the owner shortlisted this variant without further comment)_')
      .replaceAll('{{general}}', section('All') ? `### What the owner said about the field as a whole\n\n${section('All')}` : '')
      .replaceAll('{{panel}}', scrubIdentity(panel, names).text)
      .replaceAll('{{references}}', refs.length ? refs.join('\n') : '_(none)_').replaceAll('{{timeout}}', String(timeout)));
  }
  save(childDir, {
    id: childId, title: `${c.title} - round ${round}`, date: today(), project: c.project, arena: c.arena,
    brief_file: 'BRIEF.md', variants: 1, timeout_min: timeout, participants, expected, lineage,
    parent: c.id, round, judges: [], vault: c.vault, vault_subdir: c.vault_subdir, created: new Date().toISOString(),
  });
  console.log(`round ${round} as contest "${childId}" at ${childDir}\n  ${participants.map((p) => `${p.spec} refines ${lineage[p.id].from}`).join('\n  ')}\n  next: run --id ${childId}`);
}

// ---------------------------------------------------------------- status
function status() {
  const { c, dir } = load();
  console.log(`${c.id} - ${c.title} (${c.date}, ${c.project})`);
  for (const p of c.participants) {
    const r = readIf(path.join(dir, 'runs', p.id, 'record.json'));
    const ws = path.join(dir, 'entries', p.id);
    const built = fs.existsSync(ws) ? fs.readdirSync(ws).filter((n) => /^variant-\d+$/.test(n) && fs.existsSync(path.join(ws, n, 'index.html'))).length : 0;
    console.log(`  ${p.spec.padEnd(28)} ${r ? JSON.parse(r).outcome : 'not run'}  variants on disk: ${built}/${c.expected?.[p.id]?.length ?? c.variants}`);
  }
  const judging = path.join(dir, 'judging');
  const verdicts = fs.existsSync(judging) ? fs.readdirSync(judging).filter((x) => /^verdict-.*\.json$/.test(x)) : [];
  console.log(`  collected: ${fs.existsSync(path.join(dir, 'manifest.json')) ? 'yes' : 'no'}; verdicts: ${verdicts.length ? verdicts.join(', ') : 'none'}; decided: ${c.winner ? `${c.winner.label} (${c.winner.spec})` : 'no'}`);
}

// ---------------------------------------------------------------- plan
// The seats of one kind as JSON, prepared but not spawned, for a host that runs them through its
// own queue (Personas runs them as fleet sessions). The host owns the spawn and must leave behind
// exactly what `run`/`judge` would: runs/<logId>/record.json (same fields as runSeats writes) and
// runs/<logId>/final.md. Every other step then works unchanged. A judge seat's cwd is its staged
// workspace outside the arena; its log_dir stays in the arena's runs/.
function plan() {
  const { c, dir } = load();
  const kind = opts.kind ?? 'participants';
  let seats;
  let timeoutMin;
  if (kind === 'participants') {
    seats = participantSeats(c, dir);
    timeoutMin = Number(opts['timeout-min'] ?? c.timeout_min);
  } else if (kind === 'judges') {
    seats = prepareJudges(c, dir, parseParticipants(need('judges')));
    timeoutMin = Number(opts['timeout-min'] ?? 30);
  } else die(`--kind must be participants or judges, not "${kind}"`);
  const out = {
    contest: c.id, dir, kind, timeout_min: timeoutMin,
    seats: seats.map(({ p, dir: seatDir, logDir, prompt }) => ({
      id: p.id, spec: p.spec, engine: p.engine, model: p.model, effort: p.effort, label: p.label,
      cwd: seatDir, log_dir: logDir, prompt,
    })),
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

// ---------------------------------------------------------------- dispatch
const commands = { init, run, plan, collect, judge, aggregate: aggregateVerdicts, verdict, refine, status };
if (!commands[cmd]) die(`usage: contest.mjs <${Object.keys(commands).join('|')}> --id <slug> ...`);
Promise.resolve(commands[cmd]()).catch((e) => die(e.stack ?? String(e), 1));
