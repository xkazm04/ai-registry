#!/usr/bin/env node
/**
 * contest - run a blind design contest between CLI agent seats.
 *
 *   node contest.mjs init    --id <slug> --title "<t>" --brief <file> [--participants <specs>] [--variants 3]
 *                            [--landing | --preset <name>] [--review panel|owner]
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
 *   node contest.mjs verdict --id <slug> --combine <A/2,B/3> --design <doc> [--note ...]   (one design fuses several; no panel needed)
 *   node contest.mjs refine  --id <slug> --shortlist <A/2,C/1> --feedback <file> [--round 2] [--timeout-min 60]
 *   node contest.mjs reveal  --id <slug> [--timeout-min 60] [--force]   (each seat keeps and masters one of its variants)
 *   node contest.mjs router  --id <slug>                                  (rebuild the contest and vault routers)
 *   node contest.mjs status  --id <slug>
 *   node contest.mjs wrap    --id <slug> [--apply] [--close "<owner's reason>"] [--release-winner] [--lessons <file|text>]
 *                            (after the decision: archive notes and screenshots, keep the winner's source,
 *                             remove the rest; a dry run unless --apply; an undecided family is left alone)
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
import { blindMap, unblind, scrubIdentity, materialPhrases, validateVerdict, aggregate, tallyPatterns, scoreboardMarkdown, feedbackSection } from './lib/judging.mjs';
import { renderRouter, fileHref } from './lib/router.mjs';
import { renderContestNote, upsertIndex, upsertPatterns, readPatterns, slugify } from './lib/vault.mjs';
import { resolveInit, reviewLines } from './lib/presets.mjs';
import { familyState, shotsFor, renderedTextFor, extractById, pageText, duplicateShots, upsertSection, human, treeBytes, removeTree, findRebuildable, listFiles, label } from './lib/wrap.mjs';

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
// A wrapped contest has no implementations left to run, collect, judge or seed a round from.
const AFTER_WRAP = new Set(['status', 'router', 'wrap', 'aggregate']);
const load = () => {
  const id = need('id');
  const dir = contestDir(id);
  const file = path.join(dir, 'contest.json');
  if (!fs.existsSync(file)) die(`no contest "${id}" under ${arenaRoot()} - run init first`);
  const c = readJson(file);
  if (c.wrapped && !AFTER_WRAP.has(cmd)) die(`"${id}" was wrapped on ${c.wrapped.at.slice(0, 10)} - its variants are screenshots now; ${cmd} needs the implementations`);
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
  let shape;
  try { shape = resolveInit(opts); } catch (e) { die(e.message); }
  const participants = parseParticipants(shape.participants);
  const variants = shape.variants;
  const dir = contestDir(id);
  if (fs.existsSync(path.join(dir, 'contest.json')) && !opts.force) die(`contest "${id}" exists at ${dir} (use --force to re-init the briefs; entries are kept)`);
  fs.mkdirSync(path.join(dir, 'entries'), { recursive: true });
  // The template opens the brief with its own "## The idea"; a brief that starts the same way
  // would print the heading twice (measured on the first contest).
  let brief = read(briefFile).trim().replace(/^##\s+The idea\s*\n+/i, '');
  // A preset's bar is part of the brief every seat reads, so it lands in BRIEF.md too.
  if (shape.bar) brief = `${brief}\n\n${read(path.join(REFERENCES, shape.bar)).trim()}`;
  fs.writeFileSync(path.join(dir, 'BRIEF.md'), `${brief}\n`);
  if (opts.data) copyDir(path.resolve(cwd, opts.data), path.join(dir, 'data'));
  const hasData = fs.existsSync(path.join(dir, 'data'));

  const vault = path.resolve(cwd, opts.vault ?? '.contest');
  const c = {
    id, title, date: today(), project: opts.project ?? path.basename(cwd), arena: arenaRoot(),
    brief_file: 'BRIEF.md', variants, timeout_min: shape.timeout_min, preset: shape.preset, review: shape.review,
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
  const lines = reviewLines(shape.review);
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
      .replaceAll('{{timeout}}', String(c.timeout_min))
      .replaceAll('{{review_line}}', lines.review_line).replaceAll('{{rubric_intro}}', lines.rubric_intro);
    fs.writeFileSync(path.join(ws, 'PARTICIPANT.md'), text);
  }
  console.log(`contest "${id}" at ${dir}${shape.preset ? ` (preset: ${shape.preset})` : ''}\n  ${participants.length} participant(s)${shape.participantsDefaulted ? ' [UI default]' : ''}: ${participants.map((p) => p.spec).join(', ')}\n  ${variants} variants each, ${c.timeout_min} min ceiling, review: ${shape.review}, data: ${hasData ? 'staged' : 'none'}, prior patterns quoted: ${top.length}\n  vault: ${path.join(vault, c.vault_subdir)}`);
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
  const manifest = { contest: c.id, collected: new Date().toISOString(), entries: {}, leaks: {}, kept: {} };
  // Identifiers the staged material itself uses are evidence, not signatures (see materialPhrases).
  const materialTexts = [];
  if (fs.existsSync(path.join(dir, 'data'))) {
    for (const f of fs.readdirSync(path.join(dir, 'data'), { withFileTypes: true, recursive: true })) {
      if (f.isFile() && /\.(md|json|js|txt|sql|rs|py|ts|toml|ya?ml|csv)$/i.test(f.name)) materialTexts.push(read(path.join(f.parentPath ?? f.path, f.name)));
    }
  }
  const protect = materialPhrases(materialTexts, extraWords);
  // A reveal round keeps the parent's letters, so B/2 in the router is B/2 in both rounds.
  const blind = c.kind === 'reveal' ? revealBlind(c, dir) : blindMap(ids, c.id);
  const judging = path.join(dir, 'judging');
  fs.rmSync(path.join(judging, 'entries'), { recursive: true, force: true });
  for (const [letter, id] of Object.entries(blind)) {
    const ws = path.join(dir, 'entries', id);
    const record = readIf(path.join(dir, 'runs', id, 'record.json'));
    const entry = { letter, variants: [], record: record ? JSON.parse(record) : null, stray: [] };
    for (const name of fs.existsSync(ws) ? fs.readdirSync(ws) : []) {
      if (['PARTICIPANT.md', 'data', 'reference', 'own', 'others'].includes(name) || /^variant-\d+$/.test(name)) continue;
      entry.stray.push(name);
    }
    let leaks = 0;
    let kept = 0;
    // A refinement round expects specific variant numbers per seat, not 1..N.
    // A reveal seat delivers whichever of its own variants it kept, so collect what is on disk.
    const onDisk = () => (fs.existsSync(ws) ? fs.readdirSync(ws).map((x) => Number(x.match(/^variant-(\d+)$/)?.[1])).filter(Boolean) : []);
    const wanted = c.kind === 'reveal'
      ? (onDisk().length ? onDisk() : [1])
      : c.expected?.[id] ?? Array.from({ length: c.variants }, (_, i) => i + 1);
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
            const { text, count, kept: k } = scrubIdentity(read(src), extraWords, protect);
            leaks += count; kept += k;
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
    manifest.kept[id] = kept;
  }
  writeJson(path.join(dir, 'runs', 'blind-map.json'), blind);
  writeJson(path.join(dir, 'manifest.json'), manifest);
  fs.writeFileSync(path.join(dir, 'gallery.html'), gallery(c, manifest, blind));
  for (const [id, e] of Object.entries(manifest.entries)) {
    const present = e.variants.filter((v) => v.present).length;
    console.log(`${e.letter} <- ${id}: ${present}/${e.variants.length} variants${e.stray.length ? `, stray: ${e.stray.join(', ')}` : ''}${manifest.leaks[id] ? `, ${manifest.leaks[id]} identity leak(s) redacted` : ''}${manifest.kept[id] ? `, ${manifest.kept[id]} material identifier(s) kept` : ''}`);
    for (const v of e.variants) if (v.present) console.log(`    ${v.n}. ${v.concept || '(untitled)'} - ${Math.round(v.bytes / 1024)} KB${v.notes ? '' : ' - NO NOTES'}`);
  }
  console.log(`gallery: ${path.join(dir, 'gallery.html')} (unblinded, for the host)\nblinded copies: ${path.join(judging, 'entries')}`);
  writeRouters(c, dir);
}

// ---------------------------------------------------------------- router
/** The parent's letter for every reveal seat, through the lineage `reveal` recorded. */
function revealBlind(c, dir) {
  const parentBlind = readJson(path.join(path.dirname(dir), c.parent, 'runs', 'blind-map.json'));
  const out = {};
  for (const [childId, l] of Object.entries(c.lineage ?? {})) {
    const letter = Object.entries(parentBlind).find(([, pid]) => pid === l.parent)?.[0];
    if (letter) out[letter] = childId;
  }
  return out;
}

/** Where a variant opens: its blinded copy, or after a wrap its kept source, its screenshot, its archived notes. */
function variantLinks(dir, c, letter, seatId, n) {
  const blinded = path.join(dir, 'judging', 'entries', letter, `variant-${n}`);
  if (!c.wrapped || fs.existsSync(path.join(blinded, 'index.html'))) return { href: fileHref(path.join(blinded, 'index.html')), notesHref: fileHref(path.join(blinded, 'NOTES.md')) };
  const src = path.join(dir, 'entries', seatId, `variant-${n}`, 'index.html');
  const adir = path.join(dir, 'archive', `${letter}-${n}`);
  const shots = fs.existsSync(path.join(adir, 'shots')) ? fs.readdirSync(path.join(adir, 'shots')).sort() : [];
  const shot = shots.find((x) => /load/i.test(x)) ?? shots[0];
  return { href: fileHref(fs.existsSync(src) ? src : shot ? path.join(adir, 'shots', shot) : path.join(dir, 'gallery.html')), notesHref: fileHref(path.join(adir, 'NOTES.md')) };
}

/** One router row for a first-round contest, with its reveal overlaid when one exists. */
function routerContest(dir) {
  const c = readJson(path.join(dir, 'contest.json'));
  const mfFile = path.join(dir, 'manifest.json');
  const row = { id: c.id, title: c.title, project: c.project, collected: fs.existsSync(mfFile), closed: !!c.winner || !!c.combined?.length || !!c.closed,
    reveal: 'none', briefHref: fileHref(path.join(dir, 'BRIEF.md')),
    materialHref: fs.existsSync(path.join(dir, 'data', 'SCHEMA.md')) ? fileHref(path.join(dir, 'data', 'SCHEMA.md')) : null, entries: [] };
  if (!row.collected) return row;
  const mf = readJson(mfFile);
  if (c.design) row.designHref = fileHref(c.design);
  if (!c.winner && !c.combined?.length && c.shortlist?.length) {
    row.shortlisted = true;
    const note = path.join(c.vault, c.vault_subdir, 'contests', `${c.id}.md`);
    if (fs.existsSync(note)) row.noteHref = fileHref(note);  // the owner's reason, and what the decision waits on
  }
  // Panel scores are shown as mean, spread and rank only: a per-judge column would name the judges' families.
  const board = (d) => {
    const f = path.join(d, 'judging', 'scoreboard.json');
    if (!fs.existsSync(f)) return {};
    const out = {};
    const rows = readJson(f).rows.map((r) => { const v = Object.values(r.per_judge ?? {}); return { key: r.key, mean: v.reduce((a, b) => a + b, 0) / (v.length || 1), spread: v.length ? Math.max(...v) - Math.min(...v) : 0, judges: v.length }; });
    rows.sort((a, b) => b.mean - a.mean).forEach((r, i) => { out[r.key] = { ...r, rank: i + 1, of: rows.length }; });
    return out;
  };
  const scores = board(dir);
  const revealDir = path.join(path.dirname(dir), `${c.id}-reveal`);
  const kept = {};
  if (fs.existsSync(path.join(revealDir, 'contest.json'))) {
    row.reveal = 'pending';
    const rmf = readIf(path.join(revealDir, 'manifest.json'));
    if (rmf) {
      row.reveal = 'collected';
      const rc = readJson(path.join(revealDir, 'contest.json'));
      for (const [seatId, e] of Object.entries(JSON.parse(rmf).entries)) {
        const v = e.variants.find((x) => x.present);
        if (!v) continue;
        kept[e.letter] = { n: v.n, concept: v.concept, bytes: v.bytes, ...variantLinks(revealDir, rc, e.letter, seatId, v.n) };
      }
    }
  }
  for (const [seatId, e] of Object.entries(mf.entries).sort(([, a], [, b]) => a.letter.localeCompare(b.letter))) {
    row.entries.push({ letter: e.letter, variants: e.variants.map((v) => {
      const key = `${e.letter}/${v.n}`;
      let state = 'open';
      // A seat whose reveal delivered nothing keeps all its variants open rather than losing them.
      if (row.reveal === 'collected' && v.present && kept[e.letter]) state = kept[e.letter].n === v.n ? 'kept' : 'eliminated';
      if (label(c.winner) === key) state = 'winner'; else if (label(c.runner_up) === key) state = 'runner-up';
      else if (c.combined?.some((x) => label(x) === key)) state = 'combined';
      else if (!c.winner && c.shortlist?.some((x) => label(x) === key)) state = 'shortlisted';
      return { n: v.n, present: v.present, concept: v.concept || v.title, bytes: v.bytes, state, score: scores[key] ?? null,
        ...variantLinks(dir, c, e.letter, seatId, v.n),
        mastered: kept[e.letter]?.n === v.n ? kept[e.letter] : null };
    }) });
  }
  return row;
}

/** Write <arena>/<id>/router.html and the vault router over every first-round contest registered in that vault. */
function writeRouters(c, dir) {
  const rootDir = c.kind === 'reveal' ? path.join(path.dirname(dir), c.parent) : dir;
  const root = readJson(path.join(rootDir, 'contest.json'));
  if (root.parent) return; // a refinement round has its own gallery; the router follows first rounds and their reveal
  const own = routerContest(rootDir);
  fs.writeFileSync(path.join(rootDir, 'router.html'), renderRouter({ title: `${root.title} - variants`, contests: [own] }));
  const vaultDir = path.join(root.vault, root.vault_subdir);
  fs.mkdirSync(vaultDir, { recursive: true });
  const regFile = path.join(vaultDir, 'router.json');
  const reg = fs.existsSync(regFile) ? readJson(regFile) : { contests: {} };
  reg.contests[root.id] = rootDir;
  writeJson(regFile, reg);
  const rows = Object.values(reg.contests).filter((d) => fs.existsSync(path.join(d, 'contest.json'))).map(routerContest);
  fs.writeFileSync(path.join(vaultDir, 'router.html'), renderRouter({ title: `${root.vault_subdir} contests - blinded variants`, contests: rows }));
  console.log(`router: ${path.join(rootDir, 'router.html')}\n        ${path.join(vaultDir, 'router.html')} (${rows.length} contest(s))`);
}

function router() {
  const { c, dir } = load();
  writeRouters(c, dir);
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
  // The owner may decide on the reveal alone, with no panel: then there is no scoreboard to quote.
  const agg = aggregateVerdicts() ?? { rows: [], patterns: [], anti: [], verdicts: [] };
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
  const list = (k) => (opts[k] && opts[k] !== true ? String(opts[k]).split(',').map((x) => resolve(x.trim())) : []);
  const shortlist = list('shortlist');
  // Or decide that no single variant wins and one design fuses several: a decision, not another round.
  const combined = list('combine');
  if (!shortlist.length && !combined.length) need('winner');
  const winner = shortlist.length || combined.length ? null : resolve(opts.winner);
  const runnerUp = resolve(opts['runner-up']);
  const noteArg = opts.note ?? '';
  const decision = noteArg && fs.existsSync(path.resolve(cwd, noteArg)) ? read(path.resolve(cwd, noteArg)) : String(noteArg);

  // Host-curated patterns win over the tally: the tally is evidence, the host decides what generalizes.
  const curated = opts._pattern.map((s) => {
    const [slug, statement, evidence] = String(s).split('|').map((x) => x.trim());
    if (!slug || !statement) die(`--pattern needs "slug|statement|evidence", got "${s}"`);
    return { slug: slugify(slug), statement, evidence: evidence || statement, winner: !shortlist.length || combined.length > 0, from: 'host' };
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
    winner, runnerUp, shortlist: combined.length ? combined : shortlist, patterns, antiPatterns,
    decision: combined.length ? `**Combined design** of ${combined.map((x) => `${x.label} "${x.concept}"`).join(', ')} - no single winner.

${decision}` : decision,
    panelPatterns: noteEvidence.map((p) => `${p.statement} _(${p.from})_`),
    costs: ['| Seat | Entry | Outcome | Wall | Reported cost | Turns |', '|---|---|---|--:|--:|--:|', ...costs].join('\n')
      + `\n\n${winner ? `Winner artefact: \`${winner.path}\`` : `Shortlisted artefacts: ${shortlist.map((x) => `\`${x.path}\``).join(', ')}`}\nReported cost is the CLI's own figure, not an invoice; subscription seats report an API-equivalent price.`,
  });
  fs.writeFileSync(noteFile, note);
  const indexFile = path.join(vaultDir, 'Contests.md');
  fs.writeFileSync(indexFile, upsertIndex(readIf(indexFile), {
    id: c.id, title: c.title, date: c.date, project: c.project,
    winner: winner ? `${winner.label} ${winner.concept}` : combined.length ? `combined: ${combined.map((x) => `${x.label} ${x.concept}`).join('; ')}` : `shortlist: ${shortlist.map((x) => `${x.label} ${x.concept}`).join('; ')}`,
    winnerSeat: winner ? winner.spec : combined.length ? combined.map((x) => x.spec).join('; ') : 'next round pending', participants: c.participants.length,
  }));
  const patternsFile = path.join(vaultDir, 'Patterns.md');
  fs.writeFileSync(patternsFile, upsertPatterns(readIf(patternsFile), c.id, patterns));
  c.winner = winner; c.runner_up = runnerUp; c.shortlist = shortlist; c.combined = combined; c.decided = new Date().toISOString();
  // The design doc the decision produced - the artefact the next session builds from - is linked from the router.
  if (opts.design && opts.design !== true) c.design = path.resolve(cwd, opts.design);
  save(dir, c);
  writeRouters(c, dir);
  console.log(`${winner ? `winner: ${winner.label} = ${winner.spec} - "${winner.concept}"` : combined.length ? `combined design of ${combined.map((x) => `${x.label} "${x.concept}" (${x.spec})`).join(', ')}` : `shortlist: ${shortlist.map((x) => `${x.label} (${x.spec})`).join(', ')} - run refine for the next round`}\nvault: ${noteFile}\n       ${indexFile}\n       ${patternsFile} (${patterns.length} pattern(s), ${patterns.filter((p) => p.winner).length} credited to a winner)`);
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

// ---------------------------------------------------------------- reveal
// Every seat sees the whole field - its own variants unredacted, everyone else's blinded - keeps
// one of its own, masters it, and argues in a comparison matrix why it is the better choice. The
// router marks what each author cut as eliminated and keeps it clickable until the verdict.
function reveal() {
  const { c, dir } = load();
  if (c.kind === 'reveal' || c.parent) die('reveal runs on a first-round contest, not on a round derived from one');
  const mfFile = path.join(dir, 'manifest.json');
  if (!fs.existsSync(mfFile)) die('collect the first round before the reveal');
  const mf = readJson(mfFile);
  const blind = readJson(path.join(dir, 'runs', 'blind-map.json'));
  const letterOf = Object.fromEntries(Object.entries(blind).map(([l, id]) => [id, l]));
  const childId = `${c.id}-reveal`;
  const childDir = path.join(path.dirname(dir), childId);
  if (fs.existsSync(path.join(childDir, 'contest.json')) && !opts.force) die(`reveal exists at ${childDir} (use --force to rewrite the briefs; entries are kept)`);
  fs.mkdirSync(path.join(childDir, 'entries'), { recursive: true });
  fs.copyFileSync(path.join(dir, 'BRIEF.md'), path.join(childDir, 'BRIEF.md'));
  const hasData = fs.existsSync(path.join(dir, 'data'));
  if (hasData) copyDir(path.join(dir, 'data'), path.join(childDir, 'data'));
  const template = read(path.join(REFERENCES, 'reveal-brief.md'));
  const brief = read(path.join(dir, 'BRIEF.md')).trim();
  const timeout = Number(opts['timeout-min'] ?? c.timeout_min);
  const concept = (v) => v.concept || v.title || 'untitled';
  const participants = [];
  const lineage = {};
  for (const parent of c.participants) {
    const entry = mf.entries[parent.id];
    const own = entry?.variants.filter((v) => v.present) ?? [];
    if (!own.length) { console.log(`${parent.spec}: delivered nothing in round one - no reveal seat`); continue; }
    const [p] = parseParticipants(`${parent.engine}:${parent.model}@${parent.effort}#reveal`);
    const letter = letterOf[parent.id];
    participants.push(p); lineage[p.id] = { parent: parent.id, letter };
    const ws = path.join(childDir, 'entries', p.id);
    fs.mkdirSync(ws, { recursive: true });
    for (const v of own) copyDir(path.join(dir, 'entries', parent.id, `variant-${v.n}`), path.join(ws, 'own', `variant-${v.n}`));
    const others = [];
    for (const [ol, oid] of Object.entries(blind).sort()) {
      if (oid === parent.id) continue;
      for (const v of mf.entries[oid]?.variants.filter((x) => x.present) ?? []) {
        copyDir(path.join(dir, 'judging', 'entries', ol, `variant-${v.n}`), path.join(ws, 'others', ol, `variant-${v.n}`));
        others.push(`  ${ol}/variant-${v.n}/   ${ol}/${v.n} "${concept(v)}"`);
      }
    }
    if (hasData) copyDir(path.join(childDir, 'data'), path.join(ws, 'data'));
    fs.writeFileSync(path.join(ws, 'PARTICIPANT.md'), template
      .replaceAll('{{title}}', c.title).replaceAll('{{brief}}', brief).replaceAll('{{timeout}}', String(timeout))
      .replaceAll('{{own_count}}', String(own.length))
      .replaceAll('{{own_list}}', own.map((v) => `  variant-${v.n}/   "${concept(v)}"`).join('\n'))
      .replaceAll('{{others_list}}', others.join('\n') || '  (no other seat delivered)'));
  }
  if (!participants.length) die('no seat delivered anything in round one');
  const child = {
    id: childId, kind: 'reveal', title: `${c.title} - reveal`, date: today(), project: c.project, arena: c.arena,
    brief_file: 'BRIEF.md', variants: 1, timeout_min: timeout, participants, lineage,
    parent: c.id, judges: [], vault: c.vault, vault_subdir: c.vault_subdir, created: new Date().toISOString(),
  };
  save(childDir, child);
  console.log(`reveal as contest "${childId}" at ${childDir}\n  ${participants.map((p) => `${p.spec} keeps one of ${lineage[p.id].letter}'s variants`).join('\n  ')}\n  next: run --id ${childId}, then collect --id ${childId}`);
  writeRouters(child, childDir);
}

// ---------------------------------------------------------------- wrap
// The hygiene step after the owner decides. It works on the whole family (the first round, its
// reveal and every refinement or fuse round) and is a dry run unless --apply. It keeps the
// decision, the verdicts, the run records, each variant's notes and screenshots (moved to
// archive/<letter>-<n>/), and the source of every winner and combined variant (for the
// promotion); it removes every other implementation, the blinded and seeded copies, the staged
// data (its SCHEMA.md stays) and rebuildable trees. A variant with no screenshot keeps its source:
// run the visual pass, then wrap again. An undecided family is reported and left untouched.
const MEMBER_FILES = new Set(['contest.json', 'BRIEF.md', 'manifest.json', 'gallery.html', 'router.html', 'WRAP.md', 'entries', 'judging', 'runs', 'seed', 'data', 'archive']);

function familyMembers(arena, rootId) {
  const all = fs.readdirSync(arena).filter((d) => fs.existsSync(path.join(arena, d, 'contest.json')))
    .map((d) => ({ dir: path.join(arena, d), c: readJson(path.join(arena, d, 'contest.json')) }));
  const ids = new Set([rootId]);
  for (let grew = true; grew;) {
    grew = false;
    for (const m of all) if (m.c.parent && ids.has(m.c.parent) && !ids.has(m.c.id)) { ids.add(m.c.id); grew = true; }
  }
  return all.filter((m) => ids.has(m.c.id));
}

function wrap() {
  const apply = !!opts.apply;
  const { dir: selfDir } = load();
  const arena = path.dirname(selfDir);
  let rootDir = selfDir;
  let root = readJson(path.join(rootDir, 'contest.json'));
  while (root.parent && fs.existsSync(path.join(arena, root.parent, 'contest.json'))) {
    rootDir = path.join(arena, root.parent);
    root = readJson(path.join(rootDir, 'contest.json'));
  }
  // The owner may end a contest with no winner; that is a decision, and it is recorded on the first round.
  if (opts.close !== undefined) {
    if (opts.close === true) die('--close needs the owner\'s reason, in their words');
    root.closed = { reason: String(opts.close), at: new Date().toISOString() };
    if (apply) save(rootDir, root);
  }
  const members = familyMembers(arena, root.id).map((m) => (m.c.id === root.id ? { ...m, c: root } : m));
  const fam = familyState(members);
  const say = (s) => console.log(`${apply ? '' : '[dry run] '}${s}`);
  if (!fam.decided) {
    console.log(`${root.id}: undecided - ${fam.open.join(', ')} ${fam.open.length > 1 ? 'have' : 'has'} no verdict. Nothing removed.`);
    console.log('  record the owner\'s verdict (verdict --winner | --combine), or wrap --close "<the owner\'s reason>" when they ended it with no winner');
    process.exitCode = 3;
    return;
  }
  const releaseWinner = !!opts['release-winner'];
  // The seats a kept variant descends from, through each round's lineage. A refinement round
  // builds on its parent seat's scratch (habit-garden's round-3 winner ran on round 2's Unity
  // spike), so that scratch stays with only its rebuildable trees pruned.
  const lineageSeats = new Map();
  const blindOf = (dir) => (fs.existsSync(path.join(dir, 'runs', 'blind-map.json')) ? readJson(path.join(dir, 'runs', 'blind-map.json')) : {});
  for (const k of fam.keep) {
    let m = members.find((x) => x.c.id === k.id);
    let seat = blindOf(m.dir)[k.key.split('/')[0]];
    while (m && seat && m.c.lineage?.[seat]?.parent && m.c.parent) {
      const up = members.find((x) => x.c.id === m.c.parent);
      if (!up) break;
      seat = m.c.lineage[seat].parent;
      if (!lineageSeats.has(up.c.id)) lineageSeats.set(up.c.id, new Set());
      lineageSeats.get(up.c.id).add(seat);
      m = up;
    }
  }
  const lessons = opts.lessons && opts.lessons !== true
    ? (fs.existsSync(path.resolve(cwd, opts.lessons)) ? read(path.resolve(cwd, opts.lessons)) : String(opts.lessons)) : '';
  const report = [];
  let familyBefore = 0;
  let familyAfter = 0;
  for (const { c, dir } of members) {
    const before = treeBytes(dir);
    const original = Math.max(before, c.wrapped?.bytes_before ?? 0);  // a second wrap reports against the size before the first
    const removals = [];     // [path, why]
    const missing = [];
    const keptSrc = [];
    const archived = [];
    const remove = (p, why) => { if (fs.existsSync(p) || fs.lstatSync(p, { throwIfNoEntry: false })) removals.push([p, why]); };
    const mfFile = path.join(dir, 'manifest.json');
    if (!fs.existsSync(mfFile)) {
      say(`${c.id}: never collected - left as it is (collect it, or delete the directory by hand once you have looked)`);
      report.push({ c, dir, before, after: before, skipped: 'not collected' });
      familyBefore += before; familyAfter += before;
      continue;
    }
    const mf = readJson(mfFile);
    const blind = readIf(path.join(dir, 'runs', 'blind-map.json')) ? readJson(path.join(dir, 'runs', 'blind-map.json')) : {};
    const letterOf = Object.fromEntries(Object.entries(blind).map(([l, id]) => [id, l]));
    const runsDir = path.join(dir, 'runs');
    const runFiles = fs.existsSync(runsDir) ? listFiles(runsDir) : [];
    const runImages = runFiles.filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f));
    const archive = path.join(dir, 'archive');
    const dataSeat = new Set();    // holds a variant that must still open, so it keeps the ../data it loads
    const winnerSeat = new Set();  // built a kept variant, so its scratch stays too
    for (const [seatId, e] of Object.entries(mf.entries)) {
      const letter = e.letter ?? letterOf[seatId];
      for (const v of e.variants.filter((x) => x.present)) {
        const key = `${letter}/${v.n}`;
        const src = path.join(dir, 'entries', seatId, `variant-${v.n}`);
        const blinded = path.join(dir, 'judging', 'entries', letter, `variant-${v.n}`);
        const from = fs.existsSync(src) ? src : fs.existsSync(blinded) ? blinded : null;
        const adir = path.join(archive, `${letter}-${v.n}`);
        const isKept = !releaseWinner && fam.keep.some((k) => k.id === c.id && k.key === key);
        const state = fam.keep.find((k) => k.id === c.id && k.key === key)?.why
          ?? (label(c.runner_up) === key ? 'runner-up' : c.shortlist?.some((x) => label(x) === key) ? 'shortlisted' : '');
        const toMove = shotsFor(runImages, letter, v.n);
        const already = fs.existsSync(path.join(adir, 'shots')) ? fs.readdirSync(path.join(adir, 'shots')) : [];
        const files = from ? listFiles(from) : [];
        const notes = files.filter((f) => /\.md$/i.test(f));
        // Every page's words, as page-text.md (index.html) or page-text-<path>.md: a report's argument outlives its source.
        const pages = files.filter((f) => /\.html?$/i.test(f)).map((f) => [f, /^index\.html?$/i.test(f) ? 'page-text.md' : `page-text-${f.replace(/[\\/]/g, '_').replace(/\.html?$/i, '')}.md`]);
        if (apply) {
          fs.mkdirSync(path.join(adir, 'shots'), { recursive: true });
          for (const f of notes) {
            const t = path.join(adir, f);
            if (!fs.existsSync(t)) { fs.mkdirSync(path.dirname(t), { recursive: true }); fs.copyFileSync(path.join(from, f), t); }
          }
          for (const [f, name] of pages) {
            const t = path.join(adir, name);
            const text = !fs.existsSync(t) && fs.statSync(path.join(from, f)).size < 20_000_000 ? pageText(read(path.join(from, f))) : null;
            if (text) fs.writeFileSync(t, `${text.slice(0, 1_000_000)}\n`);
          }
          const index = from && path.join(from, 'index.html');
          if (c.kind === 'reveal' && index && fs.existsSync(index) && !fs.existsSync(path.join(adir, 'why-this-design.md'))) {
            const why = extractById(read(index), 'reveal');
            if (why) fs.writeFileSync(path.join(adir, 'why-this-design.md'), `# Why this design - ${key}\n\n${why}\n`);
          }
          for (const f of toMove) {
            const t = path.join(adir, 'shots', path.basename(f));
            if (!fs.existsSync(t)) fs.renameSync(path.join(runsDir, f), t); else fs.unlinkSync(path.join(runsDir, f));
          }
          for (const d of duplicateShots(path.join(adir, 'shots'))) fs.unlinkSync(d);
          // A page that renders its words from script leaves page-text.md nearly empty; the visual pass read them live.
          for (const f of renderedTextFor(runFiles, letter, v.n)) {
            const t = path.join(adir, 'rendered-text.md');
            if (!fs.existsSync(t)) fs.writeFileSync(t, `# Rendered text - ${key}\n\n${read(path.join(runsDir, f)).trim()}\n`);
            fs.unlinkSync(path.join(runsDir, f));
          }
        }
        const shots = apply ? fs.readdirSync(path.join(adir, 'shots')).sort() : [...new Set([...already, ...toMove.map((f) => path.basename(f))])].sort();
        archived.push({ key, seat: c.participants.find((p) => p.id === seatId)?.spec ?? seatId, concept: v.concept || v.title || 'untitled', state, shots, kept: isKept,
          notes: fs.existsSync(adir) ? listFiles(adir).filter((f) => /\.md$/i.test(f)) : [...notes, ...pages.map(([, n]) => n)] });
        if (isKept) { keptSrc.push({ key, path: src }); dataSeat.add(seatId); winnerSeat.add(seatId); }
        else if (!shots.length) { missing.push(key); dataSeat.add(seatId); }
        else remove(src, 'variant source (archived)');
        if (isKept || shots.length) remove(blinded, 'blinded copy');
      }
    }
    // Seat workspaces: the brief each seat read stays; copies, strays and scratch trees go.
    const entriesDir = path.join(dir, 'entries');
    for (const seatId of fs.existsSync(entriesDir) ? fs.readdirSync(entriesDir) : []) {
      const ws = path.join(entriesDir, seatId);
      if (!fs.statSync(ws).isDirectory()) continue;
      const stillHere = new Set([...keptSrc.map((k) => k.path), ...missing.map((key) => {
        const [l, n] = key.split('/');
        return path.join(entriesDir, blind[l] ?? '', `variant-${n}`);
      })].map((p) => path.resolve(p)));
      for (const name of fs.readdirSync(ws)) {
        const full = path.join(ws, name);
        if (name === 'PARTICIPANT.md' || stillHere.has(path.resolve(full))) continue;
        if (/^variant-\d+$/.test(name)) { if (!removals.some(([p]) => p === full) && !stillHere.has(path.resolve(full))) remove(full, 'variant not in the manifest'); continue; }
        if (name === 'data' && dataSeat.has(seatId)) continue;
        if ((winnerSeat.has(seatId) || lineageSeats.get(c.id)?.has(seatId)) && !['reference', 'own', 'others', 'data'].includes(name)) continue;  // rebuildables inside it go below
        remove(full, ['reference', 'own', 'others', 'data'].includes(name) ? `${name}/ copy in a seat workspace` : 'stray in a seat workspace');
      }
    }
    const judgingEntries = path.join(dir, 'judging', 'entries');
    if (!missing.length) remove(judgingEntries, 'blinded copy');
    remove(path.join(dir, 'seed'), 'seed copy');
    if (fs.existsSync(path.join(dir, 'data'))) {
      for (const f of fs.readdirSync(path.join(dir, 'data'))) if (!/\.md$/i.test(f)) remove(path.join(dir, 'data', f), 'staged material (SCHEMA.md stays)');
    }
    for (const ws of Object.values(c.judge_workspaces ?? {})) remove(ws, 'judge workspace left behind');
    // Seat logs: record.json and final.md are the cost and the seat's own summary; a large stream log is neither.
    for (const f of fs.existsSync(runsDir) ? listFiles(runsDir) : []) {
      const full = path.join(runsDir, f);
      if (/\.(log|jsonl|txt)$/i.test(f) && fs.statSync(full).size > 1 << 20) remove(full, 'stream log over 1 MB');
    }
    // A kept variant must still open, so nothing inside one is pruned, rebuildable or not.
    const keepTrees = keptSrc.map((k) => k.path).concat(missing.flatMap((key) => {
      const [l, n] = key.split('/');
      return [path.join(entriesDir, blind[l] ?? '', `variant-${n}`), path.join(judgingEntries, l, `variant-${n}`)];
    }));
    const under = (p, r) => p === r || p.startsWith(r + path.sep);
    for (const p of findRebuildable(dir, keepTrees)) if (!removals.some(([r]) => under(p, r))) remove(p, 'rebuildable tree');
    const extras = fs.readdirSync(dir).filter((n) => !MEMBER_FILES.has(n)).map((n) => `${n} (${human(treeBytes(path.join(dir, n)))})`);

    const removeBytes = removals.reduce((s, [p]) => s + (removals.some(([o]) => o !== p && under(p, o)) ? 0 : treeBytes(p)), 0);
    if (apply) {
      for (const [p] of removals) {
        if (!path.resolve(p).startsWith(path.resolve(dir) + path.sep) && !Object.values(c.judge_workspaces ?? {}).includes(p)) die(`refusing to delete ${p}: outside ${dir}`);
        removeTree(p);
      }
      if (fs.existsSync(judgingEntries) && !fs.readdirSync(judgingEntries).some((l) => fs.readdirSync(path.join(judgingEntries, l)).some((n) => /^variant-/.test(n)))) removeTree(judgingEntries);
      if (c.judge_workspaces) c.judge_workspaces = {};
    }
    const after = apply ? treeBytes(dir) : before - removeBytes;
    report.push({ c, dir, before: original, after, archived, keptSrc, missing, extras, removals });
    familyBefore += original; familyAfter += after;
    say(`${c.id}: ${human(original)} -> ${human(after)}; ${archived.length} variant(s) archived, source kept for ${keptSrc.map((k) => k.key).join(', ') || 'none'}${missing.length ? `; NO SCREENSHOT, source kept: ${missing.join(', ')}` : ''}`);
    const grouped = {};
    for (const [p, why] of removals) (grouped[why] ??= []).push(p);
    for (const [why, ps] of Object.entries(grouped)) say(`  remove ${ps.length} x ${why}`);
    if (extras.length) say(`  host files left as they are: ${extras.join(', ')}`);

    if (apply) {
      fs.writeFileSync(path.join(dir, 'gallery.html'), archiveGallery(c, archived));
      fs.writeFileSync(path.join(dir, 'WRAP.md'), wrapNote(c, { before: original, after, archived, keptSrc, missing, extras, removals, lessons: c.id === root.id ? lessons : '' }));
      c.wrapped = { at: new Date().toISOString(), bytes_before: original, bytes_after: after, archived: archived.length, kept: keptSrc.map((k) => k.key), missing_shots: missing };
      save(dir, c);
    }
  }
  say(`family ${root.id}: ${human(familyBefore)} -> ${human(familyAfter)}`);
  const missingAll = report.filter((r) => r.missing?.length);
  if (missingAll.length) {
    console.log(`\nscreenshots missing - run the visual pass on these, then wrap again:\n${missingAll.map((r) => `  python <skill>/scripts/visual-pass.py ${r.dir} --widths 1280x800,1920x1080   (or node <skill>/scripts/visual-pass.mjs)`).join('\n')}`);
  }
  if (!apply) { console.log('\nnothing changed; re-run with --apply'); return; }
  // The vault note carries the outcome, so the arena can be read as an archive from Obsidian.
  const vaultDir = path.join(root.vault, root.vault_subdir);
  for (const r of report) {
    const note = path.join(vaultDir, 'contests', `${r.c.id}.md`);
    if (!fs.existsSync(note)) continue;
    const body = [
      `Wrapped ${today()}: ${human(r.before)} -> ${human(r.after)}.`,
      r.skipped ? `Not collected; left as it was.` : `${r.archived.length} variant(s) archived as notes and screenshots: [archive](${fileHref(path.join(r.dir, 'gallery.html'))}).`,
      ...(r.keptSrc ?? []).map((k) => `- Source kept for ${k.key}: \`${k.path}\``),
      ...(r.missing?.length ? [`- No screenshot yet, source kept: ${r.missing.join(', ')}`] : []),
      ...(r.c.id === root.id && root.closed ? [`- Closed: ${root.closed.reason}`] : []),
      ...(r.c.id === root.id && lessons ? ['', lessons.trim()] : []),
    ].join('\n');
    fs.writeFileSync(note, upsertSection(read(note), 'Wrapped', body));
  }
  writeRouters(root, rootDir);
}

function archiveGallery(c, archived) {
  const cards = archived.map((v) => {
    const base = `archive/${v.key.replace('/', '-')}`;
    const img = v.shots.find((s) => /load/i.test(s)) ?? v.shots[0];
    const open = v.kept ? `<a href="entries/${esc(c.participants.find((p) => p.spec === v.seat)?.id ?? '')}/variant-${v.key.split('/')[1]}/index.html" target="_blank">open source</a>` : '';
    return `<div class="card"><b>${esc(v.key)}${v.state ? ` <em>${esc(v.state)}</em>` : ''}</b><span>${esc(v.concept)}</span><small>${esc(v.seat)}</small>${img ? `<a href="${base}/shots/${encodeURIComponent(img)}" target="_blank"><img src="${base}/shots/${encodeURIComponent(img)}" loading="lazy" alt=""></a>` : '<p class="none">no screenshot - source kept</p>'}<p>${v.shots.map((s) => `<a href="${base}/shots/${encodeURIComponent(s)}" target="_blank">${esc(s)}</a>`).join(' ')}</p><p>${v.notes.map((n) => `<a href="${base}/${n.split(path.sep).map(encodeURIComponent).join('/')}" target="_blank">${esc(n)}</a>`).join(' ')} ${open}</p></div>`;
  }).join('');
  return `<!doctype html><meta charset="utf-8"><title>${esc(c.title)} - archive</title><style>body{font:15px/1.5 system-ui;margin:2rem auto;max-width:72rem;padding:0 1rem;background:#0f1115;color:#e6e6e6}a{color:#6ea8fe}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(20rem,1fr));gap:.8rem}.card{padding:.8rem 1rem;border:1px solid #2a2f3a;border-radius:.6rem;background:#171a21}.card b{display:block;color:#6ea8fe}.card em{color:#f5c26b;font-style:normal}.card span,.card small{display:block}.card small{color:#8a8f98}.card img{width:100%;margin:.5rem 0;border-radius:.3rem}.card p{font-size:12px;word-break:break-all;margin:.3rem 0}.none{color:#f08a8a}</style><h1>${esc(c.title)}</h1><p>Wrapped contest, unblinded. Implementations were removed after the decision; what remains is each variant's own notes and the screenshots it was judged from, and the source of the winning variant.</p><div class="cards">${cards}</div>`;
}

function wrapNote(c, r) {
  const decision = c.winner ? `winner ${label(c.winner)}` : c.combined?.length ? `combined ${c.combined.map(label).join(', ')}` : c.closed ? `closed with no winner - ${c.closed.reason}` : c.kind === 'reveal' ? 'reveal round (its parent carries the verdict)' : c.shortlist?.length ? `shortlist ${c.shortlist.map(label).join(', ')} (decided in a later round)` : 'decided in a later round';
  return [`# Wrapped - ${c.title}`, '', `${today()}. ${decision.replace(/\.+$/, '')}. ${human(r.before)} -> ${human(r.after)}.`, '',
    'Kept: contest.json, BRIEF.md, manifest.json, the verdicts and scoreboard in judging/, the run records and final messages in runs/, each seat\'s PARTICIPANT.md, data/*.md, and per variant its notes, its page text and its screenshots under archive/<letter>-<n>/. `gallery.html` is the archive page.', '',
    '| Variant | Seat | Concept | State | Shots | Source |', '|---|---|---|---|--:|---|',
    ...r.archived.map((v) => `| ${v.key} | ${v.seat} | ${v.concept.replace(/\|/g, '/')} | ${v.state || '-'} | ${v.shots.length} | ${v.kept ? 'kept' : r.missing.includes(v.key) ? 'kept - no screenshot' : 'removed'} |`),
    '', '## Removed', '', ...Object.entries(r.removals.reduce((a, [p, why]) => { (a[why] ??= []).push(p); return a; }, {})).map(([why, ps]) => `- ${ps.length} x ${why}`),
    ...(r.extras.length ? ['', '## Left as they are', '', `Host files this step does not own: ${r.extras.join(', ')}.`] : []),
    ...(r.lessons ? ['', '## Lessons', '', r.lessons.trim()] : []), ''].join('\n');
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
  console.log(`  collected: ${fs.existsSync(path.join(dir, 'manifest.json')) ? 'yes' : 'no'}; verdicts: ${verdicts.length ? verdicts.join(', ') : 'none'}; decided: ${c.winner ? `${c.winner.label} (${c.winner.spec})` : c.combined?.length ? `combined ${c.combined.map(label).join(', ')}` : c.closed ? `closed - ${c.closed.reason}` : c.kind === 'reveal' ? `by the parent's verdict (${c.parent})` : 'no'}${c.wrapped ? `; wrapped ${c.wrapped.at.slice(0, 10)} (${human(c.wrapped.bytes_before)} -> ${human(c.wrapped.bytes_after)})` : ''}`);
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
const commands = { init, run, plan, collect, judge, aggregate: aggregateVerdicts, verdict, refine, reveal, router, status, wrap };
if (!commands[cmd]) die(`usage: contest.mjs <${Object.keys(commands).join('|')}> --id <slug> ...`);
Promise.resolve(commands[cmd]()).catch((e) => die(e.stack ?? String(e), 1));
