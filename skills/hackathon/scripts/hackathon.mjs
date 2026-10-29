#!/usr/bin/env node
/**
 * hackathon - run a time-boxed, owner-judged hackathon on a broad track in a real repository.
 *
 * WHY this is a script and not host prose: the parts that go wrong in a hackathon are mechanical -
 * a builder restarted after the deadline, a board that names the seat behind an idea, a worktree
 * removal that followed a node_modules junction into the primary checkout, a ledger that counts a
 * seat twice because a step was re-run. Each of those is pinned here, in a file-backed state
 * (<arena>/<id>/hackathon.json, written atomically after every change) so every step is
 * idempotent and a killed host resumes by re-running the same command.
 *
 *   node hackathon.mjs preflight [--id <slug>] [--entries N] [--seats <specs>] [--ram-per-entry-gb G]
 *   node hackathon.mjs init      --id <slug> --title "<t>" --track <TRACK.md> [--dossier <file>] [--repo <path>]
 *                                [--ideators <specs>] [--ideas N] [--hours H] [--sprints] [--sprint-min M]
 *                                [--baseline-frac F] [--build-effort E] [--base <ref>] [--base-port P]
 *                                [--setup "<cmd>"]... [--gate "<cmd>"]... [--worktrees-root <dir>]
 *                                [--ideate-timeout-min M] [--max-sessions N] [--vault <dir>] [--vault-subdir S] [--force]
 *   node hackathon.mjs ideate    --id <slug> [--only <seatId>] [--timeout-min M] [--force] [--keep-worktrees]
 *                                [--from <dir|file>] [--dry-run]
 *   node hackathon.mjs board     --id <slug> [--clusters <file>]
 *   node hackathon.mjs shortlist --id <slug> (--pick A3,C7 [--assign C7=<spec>]... | --packs <packs.json>) [--note "<owner words>"]
 *                                (packs.json: { "packs": [ { title, focus: broad|deep, ideas: [ids], builder, brief, note? } ] } -
 *                                 one entry per pack; an idea may sit in several packs)
 *   node hackathon.mjs prepare   --id <slug> [--only e1] [--skip-setup] [--force]
 *   node hackathon.mjs run       --id <slug> [--only e1] [--sprints] [--dry-run] [--reopen | --resume-limited]
 *                                [--ignore-ram] [--ram-per-entry-gb G]
 *   node hackathon.mjs status    [--id <slug>]
 *   node hackathon.mjs collect   --id <slug> [--skip-gates]
 *   node hackathon.mjs verdict   --id <slug> (--winner e2 [--runner-up e1] | --fuse "e1=base,e2=absorb,e3=defer,e4=drop"
 *                                | --close "<reason>") --note "<owner words>" [--followup "<where the scope goes next>"]
 *   node hackathon.mjs wrap      --id <slug> [--apply] [--release-kept]
 *   (every step also takes --arena <dir>)
 *
 * Seats are engine:model@effort[#label] (engines claude, codex, grok, agy, muse). The seat engine
 * table, resolver and runner are the contest skill's (../../contest/scripts/lib). Builtins only.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseParticipant, engineCommand, parseEnvelope, classifyOutcome } from '../../contest/scripts/lib/participants.mjs';
import { resolveBin, runSeat } from '../../contest/scripts/lib/seat.mjs';
import { blindMap } from '../../contest/scripts/lib/judging.mjs';
import { slugify } from '../../contest/scripts/lib/vault.mjs';
import { parseOverlay, resolveConfig, DEFAULTS } from './lib/config.mjs';
import { planSessionWhy, MIN_SESSION_MS, isoLocal, hhmm, stamp, humanDuration, sessionLine } from './lib/clock.mjs';
import { validateIdeasDoc, recoverFromFinal, buildBoard, groupIdeas, leaks } from './lib/ideas.mjs';
import { renderTemplate, demoteHeadings, ideaMarkdown, boardHtml, boardMarkdown, judgingHtml, judgingMarkdown } from './lib/render.mjs';
import { seatContributions, upsertSeatLedger, renderSeatsMd, upsertIndexRow, renderHackathonNote } from './lib/ledger.mjs';
import { validatePacks, packMarkdown, shortlistLabels, entryIdeaLabel, pickAdvice } from './lib/packs.mjs';
import { withFileLock } from './lib/lock.mjs';
import { ramCheck, reaperNote, effectiveSpec, RAM_PER_ENTRY_GB } from './lib/preflight.mjs';
import { parseFusion, fusionBase, verdictLabel, wrapPlan } from './lib/verdict.mjs';
import { git, gitOrThrow, ensureExcluded, isRegistered, dirtyFiles, removeWorktree, treeSize } from './lib/git.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REFERENCES = path.join(HERE, '..', 'references');
const cwd = process.cwd();

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const cmd = argv[0];
const MULTI = new Set(['setup', 'gate', 'assign']);
const opts = {};
for (let i = 1; i < argv.length; i += 1) {
  const a = argv[i];
  if (!a.startsWith('--')) continue;
  const key = a.slice(2);
  const next = argv[i + 1];
  const val = next === undefined || next.startsWith('--') ? true : (i += 1, next);
  if (MULTI.has(key)) (opts[key] ??= []).push(val); else opts[key] = val;
}

const USAGE = `usage: node hackathon.mjs <step> --id <slug> [options]
steps:
  preflight [--id] [--entries N] [--seats <specs>] [--ram-per-entry-gb G]
  init      --id --title --track <file> [--dossier <file>] [--repo <path>] [--ideators <specs>] [--ideas N]
            [--hours H] [--sprints] [--sprint-min M] [--baseline-frac F] [--build-effort E] [--base <ref>]
            [--base-port P] [--setup "<cmd>"]... [--gate "<cmd>"]... [--worktrees-root <dir>]
            [--ideate-timeout-min M] [--max-sessions N] [--vault <dir>] [--vault-subdir S] [--force]
  ideate    --id [--only <seatId>] [--timeout-min M] [--force] [--keep-worktrees] [--from <dir|file>] [--dry-run]
  board     --id [--clusters <file>]
  shortlist --id (--pick A3,C7 [--assign C7=<spec>]... | --packs <packs.json>) [--note "<owner words>"]
  prepare   --id [--only e1] [--skip-setup] [--force]
  run       --id [--only e1] [--sprints] [--dry-run] [--reopen | --resume-limited] [--ignore-ram] [--ram-per-entry-gb G]
  status    [--id]
  collect   --id [--skip-gates]
  verdict   --id (--winner e2 [--runner-up e1] | --fuse "e1=base,e2=absorb,e3=defer,e4=drop" | --close "<reason>")
            --note "<owner words>" [--followup "<where the scope goes next>"]
  wrap      --id [--apply] [--release-kept]
every step takes --arena <dir> (default from .claude/hackathon/config.md, else .hackathon/arena)`;

function die(msg, code = 2) { console.error(`hackathon: ${msg}`); process.exit(code); }
const need = (k) => { if (opts[k] === undefined || opts[k] === true) die(`--${k} is required`); return opts[k]; };
const ts = () => new Date().toTimeString().slice(0, 8);
const log = (m) => console.log(`[${ts()}] ${m}`);
const read = (f) => fs.readFileSync(f, 'utf8');
const readIf = (f) => (fs.existsSync(f) ? read(f) : null);
const readJson = (f) => JSON.parse(read(f));
const posix = (p) => String(p).replace(/\\/g, '/');
const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** tmp + rename; a reader on Windows can hold the target for a moment, so EPERM is retried. */
function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, text);
  for (let i = 0; ; i += 1) {
    try { fs.renameSync(tmp, file); return; } catch (e) {
      if (i >= 8 || !['EPERM', 'EACCES', 'EBUSY'].includes(e.code)) throw e;
      sleepSync(60);
    }
  }
}
const writeJson = (f, v) => writeAtomic(f, `${JSON.stringify(v, null, 2)}\n`);

// ---------------------------------------------------------------- overlay, arena, state
const OVERLAY_FILE = path.join(cwd, '.claude', 'hackathon', 'config.md');
let overlayCache = null;
const overlay = () => (overlayCache ??= fs.existsSync(OVERLAY_FILE) ? parseOverlay(read(OVERLAY_FILE)) : { data: {}, setup: [], gates: [], taste: '', repo_law: '', warnings: [] });
const arenaRoot = () => path.resolve(cwd, opts.arena && opts.arena !== true ? opts.arena : (overlay().data.arena || DEFAULTS.arena));
const stateFile = (dir) => path.join(dir, 'hackathon.json');

function load() {
  const id = slugify(need('id'));
  const dir = path.join(arenaRoot(), id);
  if (!fs.existsSync(stateFile(dir))) die(`no hackathon "${id}" under ${arenaRoot()} - run init first`);
  return { s: readJson(stateFile(dir)), dir };
}
/**
 * Re-read, mutate, write - under the state lock, so concurrent `run` processes (a resume beside the
 * main run, as in 1.0.0's first hackathon) never lose each other's writes.
 */
function update(dir, fn) {
  return withFileLock(stateFile(dir), () => {
    const s = readJson(stateFile(dir));
    fn(s);
    writeJson(stateFile(dir), s);
    return s;
  });
}

const templateText = (name) => read(path.join(REFERENCES, name));
const section = (heading, body) => (String(body ?? '').trim() ? `## ${heading}\n\n${String(body).trim()}` : '');
const ideatorOf = (s, ideaId) => {
  const letter = String(ideaId).replace(/\d+$/, '');
  return Object.entries(s.ideation).find(([, x]) => x.letter === letter) ?? [null, null];
};
/** The original (unscrubbed) idea behind a board id: the builder is not blind. */
function originalIdea(s, dir, ideaId) {
  const [seatId] = ideatorOf(s, ideaId);
  const n = Number(String(ideaId).match(/\d+$/)?.[0]);
  const f = path.join(dir, 'ideation', seatId ?? '-', 'IDEAS.json');
  if (!seatId || !fs.existsSync(f)) return null;
  const idea = readJson(f).ideas?.[n - 1];
  return idea ? { id: ideaId, ...idea } : null;
}

// ---------------------------------------------------------------- init
function init() {
  const id = slugify(need('id'));
  if (!id) die('--id must contain letters or digits');
  const title = need('title');
  const trackFile = path.resolve(cwd, need('track'));
  if (!fs.existsSync(trackFile)) die(`track file ${trackFile} does not exist`);
  let resolved;
  try {
    resolved = resolveConfig({ cli: opts, overlay: overlay(), id, cwd, home: os.homedir(), platform: process.platform, tmpdir: os.tmpdir(), exists: fs.existsSync });
  } catch (e) { die(e.message); }
  const { config: c, sources, warnings } = resolved;
  const repoArg = path.resolve(cwd, opts.repo && opts.repo !== true ? opts.repo : '.');
  const top = git(repoArg, ['rev-parse', '--show-toplevel']);
  if (!top.ok) die(`${repoArg} is not a git repository`);
  const repo = path.resolve(top.out);
  const baseRef = opts.base && opts.base !== true ? opts.base : 'HEAD';
  const base = git(repo, ['rev-parse', '--verify', `${baseRef}^{commit}`]);
  if (!base.ok) die(`cannot resolve base ref "${baseRef}" in ${repo}`);

  const dir = path.join(path.resolve(cwd, opts.arena && opts.arena !== true ? opts.arena : c.arena), id);
  if (fs.existsSync(stateFile(dir))) {
    if (!opts.force) die(`hackathon "${id}" exists at ${dir} (use --force to re-init)`);
    const old = readJson(stateFile(dir));
    if (Object.keys(old.entries ?? {}).length) die(`hackathon "${id}" already has entries (${Object.keys(old.entries).join(', ')}); re-init would orphan their worktrees - wrap it or pick a new id`);
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(trackFile, path.join(dir, 'TRACK.md'));
  const notes = [...warnings];
  if (opts.dossier && opts.dossier !== true) {
    const f = path.resolve(cwd, opts.dossier);
    if (!fs.existsSync(f)) die(`dossier file ${f} does not exist`);
    fs.copyFileSync(f, path.join(dir, 'DOSSIER.md'));
    if (!read(f).trim()) notes.push('the dossier is empty - ideators will scout the code without one');
  } else {
    fs.writeFileSync(path.join(dir, 'DOSSIER.md'), '');
    notes.push('no --dossier given - DOSSIER.md is empty; ideators will scout the code without one');
  }
  const behind = git(repo, ['rev-list', '--count', `${base.out}..${baseRef}@{u}`]);
  if (behind.ok && Number(behind.out) > 0) notes.push(`the base is ${behind.out} commit(s) behind ${baseRef}@{u} (local remote-tracking ref; nothing was fetched)`);

  c.ideators = c.ideators.map(effectiveSpec); // agy runs xhigh as high: record what runs
  const seats = c.ideators.map((spec) => parseParticipant(spec));
  const letters = blindMap(seats.map((p) => p.id), id);
  const letterOf = Object.fromEntries(Object.entries(letters).map(([l, sid]) => [sid, l]));
  const s = {
    id, title, created: isoLocal(Date.now()), repo: posix(repo), base_ref: baseRef, base: base.out,
    mode: c.mode, hours: c.hours, ideas_per_seat: c.ideas_per_seat, ideators: c.ideators, build_effort: c.build_effort,
    base_port: c.base_port, baseline_frac: c.baseline_frac, sprint_min: c.sprint_min, max_sessions: c.max_sessions,
    ideate_timeout_min: c.ideate_timeout_min, worktrees_root: c.worktrees_root, arena: posix(path.dirname(dir)),
    vault: posix(c.vault), vault_subdir: c.vault_subdir,
    setup: c.setup, gates: c.gates, taste: c.taste, repo_law: c.repo_law,
    ideation: Object.fromEntries(seats.map((p) => [p.id, { spec: p.spec, letter: letterOf[p.id], outcome: null, wall_s: null, count: 0, errors: [], worktree: null }])),
    shortlist: [], owner_note: '', revealed: false, entries: {},
    winner: null, runner_up: null, verdict_note: null, closed: null,
  };
  writeJson(stateFile(dir), s);
  console.log(`hackathon "${id}" at ${dir}`);
  console.log(`  repo ${s.repo} @ ${baseRef} = ${s.base.slice(0, 12)}`);
  const show = (k, v) => console.log(`  ${k.padEnd(20)} ${Array.isArray(v) ? (v.length ? v.join(' ; ') : '(none)') : v}  [${sources[k] ?? 'default'}]`);
  show('ideators', c.ideators); show('ideas', c.ideas_per_seat); show('hours', c.hours); show('mode', c.mode);
  show('build_effort', c.build_effort); show('base_port', c.base_port); show('baseline_frac', c.baseline_frac);
  show('sprint_min', c.sprint_min); show('max_sessions', c.max_sessions); show('ideate_timeout_min', c.ideate_timeout_min);
  show('worktrees_root', c.worktrees_root); show('vault', `${s.vault}/${c.vault_subdir}`); show('arena', s.arena);
  show('setup', c.setup); show('gates', c.gates);
  console.log(`  taste ${c.taste ? 'from overlay' : '(none)'}, repo law ${c.repo_law ? 'from overlay' : '(none)'}, overlay ${fs.existsSync(OVERLAY_FILE) ? OVERLAY_FILE : 'not found'}`);
  for (const n of notes) console.log(`  warning: ${n}`);
}

// ---------------------------------------------------------------- ideate
const IDEATE_PROMPT = 'Read .hackathon/IDEATOR.md in this directory and follow it.';

function ideatorBrief(s, dir) {
  const dossier = read(path.join(dir, 'DOSSIER.md'));
  return renderTemplate(templateText('ideator-brief.md'), {
    ideas: String(s.ideas_per_seat), hours: String(s.hours), track: demoteHeadings(read(path.join(dir, 'TRACK.md')).trim()),
    dossier: dossier.trim() ? '' : '_The host wrote no dossier for this hackathon: `.hackathon/DOSSIER.md` is empty. Scout the code yourself._',
    baseline_frac_pct: String(Math.round(s.baseline_frac * 100)), taste: section('Taste', s.taste), out: '.hackathon/IDEAS.json',
  });
}

/** Validate a harvested document and write the seat's arena files. Returns the ideation record. */
function harvest(dir, s, p, doc, { recovered = false, outcome, run = null, extraErrors = [] }) {
  const logDir = path.join(dir, 'ideation', p.id);
  fs.mkdirSync(logDir, { recursive: true });
  const v = validateIdeasDoc(doc, s.ideas_per_seat);
  const errors = [...extraErrors, ...(v.fatal ? [v.fatal] : [])];
  writeJson(path.join(logDir, 'IDEAS.json'), { seat_notes: v.seat_notes, ideas: v.valid });
  const record = {
    id: p.id, spec: p.spec, outcome, wall_s: run?.wall_s ?? null, exit: run?.exit ?? null, timed_out: run?.timedOut ?? null,
    errors, count: v.valid.length, invalid: v.invalid, warnings: v.warnings, recovered_from_final: recovered, finished: isoLocal(Date.now()),
  };
  writeJson(path.join(logDir, 'record.json'), record);
  return record;
}

async function ideate() {
  const { s, dir } = load();
  if (s.shortlist.length && !opts.force) die('the owner has shortlisted already - re-ideating would change the idea ids the entries point at (use --force only before prepare)');
  if (Object.values(s.entries).some((e) => e.status !== 'shortlisted')) die('entries are prepared - ideation is closed for this hackathon');
  const only = opts.only && opts.only !== true ? String(opts.only).split(',').map((x) => x.trim()) : null;
  const seats = s.ideators.map((spec, k) => ({ p: parseParticipant(spec), k: k + 1 }))
    .filter(({ p }) => !only || only.includes(p.id) || only.includes(p.spec));
  if (only && !seats.length) die(`--only ${opts.only} names no ideator (ids: ${Object.keys(s.ideation).join(', ')})`);
  const timeoutMin = opts['timeout-min'] !== undefined ? Number(opts['timeout-min']) : s.ideate_timeout_min;
  if (!(timeoutMin > 0)) die(`--timeout-min needs a positive number, got ${JSON.stringify(opts['timeout-min'])}`);
  const dry = opts['dry-run'] === true;
  const from = opts.from && opts.from !== true ? path.resolve(cwd, opts.from) : null;
  if (from && !fs.existsSync(from)) die(`--from ${from} does not exist`);
  const brief = ideatorBrief(s, dir);

  const jobs = seats.map(async ({ p, k }) => {
    const rec = readIf(path.join(dir, 'ideation', p.id, 'record.json'));
    if (rec && JSON.parse(rec).count > 0 && !opts.force && !only) { log(`ideate ${p.id}: already harvested (${JSON.parse(rec).count} ideas; --force or --only to rerun)`); return null; }
    if (from) {
      const file = fs.statSync(from).isFile() ? from : [path.join(from, `${p.id}.json`), path.join(from, p.id, 'IDEAS.json')].find((f) => fs.existsSync(f));
      if (!file) { log(`ideate ${p.id}: no hand-fed file in ${from} (${p.id}.json or ${p.id}/IDEAS.json)`); return null; }
      let doc = null;
      let recovered = false;
      // A hand-fed file may be a seat's whole final message; it is recovered the same way.
      try { doc = JSON.parse(read(file)); } catch { doc = recoverFromFinal(read(file)); recovered = true; }
      const r = harvest(dir, s, p, doc, { outcome: 'hand-fed', recovered });
      log(`ideate ${p.id}: hand-fed from ${file} - ${r.count} valid, ${r.invalid.length} invalid${r.warnings.length ? `, ${r.warnings.length} warning(s)` : ''}${recovered ? ' (recovered from message text)' : ''}`);
      return r;
    }
    const wt = posix(path.join(s.worktrees_root, `idea-${k}`));
    const bin = resolveBin(p.engine);
    if (dry) {
      const command = engineCommand(p, bin ?? `<${p.engine} CLI not found>`, IDEATE_PROMPT, { workspace: wt, timeoutMin });
      console.log(`ideate ${p.id} [${s.ideation[p.id].letter}] (dry run): worktree ${wt} at ${s.base.slice(0, 12)}, ceiling ${timeoutMin} min\n  argv: ${JSON.stringify(command.argv)}\n  stdin: ${JSON.stringify(command.stdin)}`);
      return null;
    }
    if (!bin) {
      log(`ideate ${p.id}: no ${p.engine} CLI found (set CONTEST_${p.engine.toUpperCase()}_BIN) - seat skipped`);
      return harvest(dir, s, p, null, { outcome: 'unavailable', extraErrors: [`no ${p.engine} CLI found`] });
    }
    if (fs.existsSync(wt) && !isRegistered(s.repo, wt)) {
      log(`ideate ${p.id}: ${wt} exists and is not a worktree of ${s.repo} - seat skipped`);
      return harvest(dir, s, p, null, { outcome: 'errored', extraErrors: [`${wt} exists and is not a registered worktree`] });
    }
    if (!fs.existsSync(wt)) {
      fs.mkdirSync(path.dirname(wt), { recursive: true });
      const add = git(s.repo, ['worktree', 'add', '--detach', wt, s.base]);
      if (!add.ok) return harvest(dir, s, p, null, { outcome: 'errored', extraErrors: [`worktree add failed: ${add.err}`] });
    }
    ensureExcluded(s.repo);
    const hk = path.join(wt, '.hackathon');
    fs.mkdirSync(hk, { recursive: true });
    fs.rmSync(path.join(hk, 'IDEAS.json'), { force: true });
    fs.writeFileSync(path.join(hk, 'IDEATOR.md'), brief);
    fs.copyFileSync(path.join(dir, 'TRACK.md'), path.join(hk, 'TRACK.md'));
    fs.copyFileSync(path.join(dir, 'DOSSIER.md'), path.join(hk, 'DOSSIER.md'));
    update(dir, (x) => { x.ideation[p.id].worktree = wt; x.ideation[p.id].outcome = 'running'; });

    const logDir = path.join(dir, 'ideation', p.id);
    const command = engineCommand(p, bin, IDEATE_PROMPT, { workspace: wt, timeoutMin });
    writeJson(path.join(logDir, 'command.json'), { argv: command.argv, cwd: wt, started: isoLocal(Date.now()) });
    log(`ideate ${p.id}: starting in ${wt} (ceiling ${timeoutMin} min)`);
    const r = await runSeat(command, { cwd: wt, timeoutMs: timeoutMin * 60000, logDir, label: p.id });
    const parsed = parseEnvelope(p.engine, r.stdout);
    const outcome = classifyOutcome(parsed, r);
    fs.writeFileSync(path.join(logDir, 'final.md'), parsed.final ?? '');
    let doc = null;
    let recovered = false;
    const fileText = readIf(path.join(hk, 'IDEAS.json'));
    if (fileText !== null) { try { doc = JSON.parse(fileText); } catch { doc = null; } }
    if (!doc || !Array.isArray(doc.ideas)) {
      const fromFinal = recoverFromFinal(parsed.final);
      if (fromFinal) { doc = fromFinal; recovered = true; }
    }
    const record = harvest(dir, s, p, doc, { outcome, run: r, recovered, extraErrors: parsed.errors });
    if (!opts['keep-worktrees']) {
      // An ideation worktree is a throwaway read-only checkout; a seat that edited it despite the
      // brief left nothing anyone needs, so it goes even when dirty - and the paths are recorded.
      const rm = removeWorktree(s.repo, wt, { allowDirty: true });
      record.worktree_removed = rm.removed;
      if (rm.dirty?.length) record.discarded_changes = rm.dirty;
      if (!rm.removed) log(`ideate ${p.id}: worktree not removed - ${rm.refused}`);
      writeJson(path.join(logDir, 'record.json'), record);
    }
    log(`ideate ${p.id}: ${outcome} in ${Math.round(r.wall_s)} s - ${record.count} valid idea(s)${record.invalid.length ? `, ${record.invalid.length} invalid` : ''}${recovered ? ' (recovered from the final message)' : ''}${record.errors.length ? ` - ${record.errors[0]}` : ''}`);
    return record;
  });
  const records = (await Promise.all(jobs)).filter(Boolean);
  if (!dry) git(s.repo, ['worktree', 'prune']);
  if (!records.length) return;
  update(dir, (x) => {
    for (const r of records) {
      const wtGone = !fs.existsSync(posix(path.join(x.worktrees_root, `idea-${x.ideators.indexOf(r.spec) + 1}`)));
      Object.assign(x.ideation[r.id], { outcome: r.outcome, wall_s: r.wall_s, count: r.count, errors: r.errors, worktree: wtGone ? null : x.ideation[r.id].worktree });
    }
  });
  for (const r of records) {
    for (const inv of r.invalid) console.log(`  ${r.id}: invalid idea ${inv.index}${inv.title ? ` "${inv.title}"` : ''}: ${inv.problems.join('; ')}`);
    for (const w of r.warnings) console.log(`  ${r.id}: warning: ${w}`);
  }
  const total = Object.values(readJson(stateFile(dir)).ideation).reduce((a, x) => a + (x.count ?? 0), 0);
  console.log(`ideas harvested so far: ${total}. Next: board --id ${s.id}`);
}

// ---------------------------------------------------------------- board
function boardData(s, dir) {
  const seats = Object.entries(s.ideation).map(([id, x]) => {
    const f = path.join(dir, 'ideation', id, 'IDEAS.json');
    return { id, spec: x.spec, ideas: fs.existsSync(f) ? readJson(f).ideas ?? [] : [] };
  });
  const letters = Object.fromEntries(Object.entries(s.ideation).map(([id, x]) => [x.letter, id]));
  const material = [readIf(path.join(dir, 'TRACK.md')) ?? '', readIf(path.join(dir, 'DOSSIER.md')) ?? ''];
  const b = buildBoard({ hackathonId: s.id, seats, material, letters });
  const clustersFile = path.join(dir, 'clusters.json');
  const clusters = fs.existsSync(clustersFile) ? readJson(clustersFile) : null;
  const { groups, warnings } = groupIdeas(b.ideas, clusters);
  return { b, groups, warnings, seatCount: seats.filter((x) => x.ideas.length).length };
}

function board() {
  const { s, dir } = load();
  if (opts.clusters && opts.clusters !== true) {
    const f = path.resolve(cwd, opts.clusters);
    let c;
    try { c = readJson(f); } catch (e) { die(`clusters file ${f}: ${e.message}`); }
    if (!Array.isArray(c.clusters)) die(`clusters file ${f} has no "clusters" array`);
    writeJson(path.join(dir, 'clusters.json'), c);
  }
  const { b, groups, warnings, seatCount } = boardData(s, dir);
  if (!b.ideas.length) die('no ideas harvested - run ideate (or ideate --from <dir> to hand-feed IDEAS.json files)');
  const generated = isoLocal(Date.now());
  const json = { id: s.id, title: s.title, generated, groups, ideas: b.ideas, redactions: b.redactions };
  const html = boardHtml({ title: s.title, generated, groups, ideas: b.ideas, seatCount });
  const md = boardMarkdown({ title: s.title, generated, groups, ideas: b.ideas });
  const found = leaks(`${JSON.stringify(json)}\n${html}\n${md}`, s.ideators);
  if (found.length) die(`the board would name a seat (${found.join(', ')}) - check the hackathon title and the ideas; nothing was written`, 1);
  writeJson(path.join(dir, 'board.json'), json);
  fs.writeFileSync(path.join(dir, 'board.md'), md);
  fs.writeFileSync(path.join(dir, 'board.html'), html);
  for (const w of warnings) console.log(`warning: ${w}`);
  console.log(`board: ${b.ideas.length} ideas from ${seatCount} seat(s) in ${groups.length} group(s), ${b.redactions} identity redaction(s)\n  ${path.join(dir, 'board.html')}\n  ${path.join(dir, 'board.md')}`);
}

// ---------------------------------------------------------------- vault
function writeVault(s, dir) {
  const root = path.join(s.vault, s.vault_subdir);
  fs.mkdirSync(path.join(root, 'hackathons'), { recursive: true });
  const boardFile = path.join(dir, 'board.json');
  const bj = fs.existsSync(boardFile) ? readJson(boardFile) : { ideas: [] };
  const pickOf = shortlistLabels(s);
  // The note is the revealed record: original titles, not the blind board's redacted ones.
  const boardRows = bj.ideas.map((i) => ({ id: i.id, title: originalIdea(s, dir, i.id)?.title ?? i.title, seat: ideatorOf(s, i.id)[1]?.spec ?? '?', shortlisted: pickOf[i.id] ?? '' }));
  const entries = Object.entries(s.entries).map(([e, x]) => ({
    entry: e, title: x.ideas ? `Pack: ${x.title}` : x.title, ideas: entryIdeaLabel(x), spec: x.spec,
    sessions: x.sessions.length ? x.sessions.map((q) => `${q.kind}:${q.outcome ?? 'running'}`).join(', ') : 'none',
    commits: x.collected?.commits ?? null, shortstat: x.collected?.shortstat ?? null, gates: x.collected?.gates ?? null,
  }));
  fs.writeFileSync(path.join(root, 'hackathons', `${s.id}.md`), renderHackathonNote({ state: s, track: demoteHeadings(readIf(path.join(dir, 'TRACK.md')) ?? ''), board: boardRows, entries }));
  const w = s.winner ? s.entries[s.winner] : null;
  const indexFile = path.join(root, 'Hackathons.md');
  fs.writeFileSync(indexFile, upsertIndexRow(readIf(indexFile), {
    date: String(s.created).slice(0, 10), id: s.id, title: s.title, mode: s.mode, hours: s.hours,
    entries: Object.keys(s.entries).length, winner: s.dispositions ? verdictLabel(s) : w ? `${w.title} (${w.spec})` : (s.closed ? 'closed' : 'pending'),
    note: String(s.verdict_note ?? s.owner_note ?? '').slice(0, 160),
  }));
  const ledgerFile = path.join(root, 'seats.json');
  const ledger = upsertSeatLedger(fs.existsSync(ledgerFile) ? readJson(ledgerFile) : null, s.id, seatContributions(s), { title: s.title, date: String(s.created).slice(0, 10) });
  writeJson(ledgerFile, ledger);
  fs.writeFileSync(path.join(root, 'Seats.md'), renderSeatsMd(ledger));
  return root;
}

// ---------------------------------------------------------------- shortlist
function shortlist() {
  const { s, dir } = load();
  if (Object.values(s.entries).some((e) => e.status !== 'shortlisted')) die('entries are already prepared - a new shortlist would orphan their worktrees; wrap this hackathon or start a new id');
  const bfile = path.join(dir, 'board.json');
  if (!fs.existsSync(bfile)) die('no board yet - run board first');
  const bj = readJson(bfile);
  const ids = new Set(bj.ideas.map((i) => i.id));
  const hasPick = opts.pick !== undefined;
  const hasPacks = opts.packs !== undefined;
  if (hasPick === hasPacks) die('give exactly one of --pick A3,C7 or --packs <packs.json>');
  if (hasPacks) { shortlistPacks(s, dir, bj); return; }
  const picks = String(need('pick')).split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);
  if (!picks.length) die('--pick names no idea');
  for (const p of picks) if (!ids.has(p)) die(`--pick ${p} is not on the board (ideas: ${[...ids].join(', ')})`);
  if (new Set(picks).size !== picks.length) die('--pick repeats an idea');
  const advice = pickAdvice(picks.length, Object.keys(s.ideation).length);
  if (advice?.refuse && opts.force !== true) die(advice.message);
  if (advice) console.log(`warning: ${advice.message}`);
  const assign = {};
  for (const a of opts.assign ?? []) {
    const m = String(a).match(/^([A-Za-z]+\d+)=(.+)$/);
    if (!m) die(`--assign "${a}" is not <idea>=<engine:model@effort>`);
    const idea = m[1].toUpperCase();
    if (!picks.includes(idea)) die(`--assign ${idea} is not one of the picks`);
    try { assign[idea] = parseParticipant(m[2]).spec; } catch (e) { die(e.message); }
  }
  const entries = {};
  const list = picks.map((idea, i) => {
    const entry = `e${i + 1}`;
    const [, seat] = ideatorOf(s, idea);
    if (!seat) die(`no ideator behind ${idea}`);
    const prop = parseParticipant(seat.spec);
    const spec = effectiveSpec(assign[idea] ?? parseParticipant(`${prop.engine}:${prop.model}@${s.build_effort}`).spec);
    const card = bj.ideas.find((x) => x.id === idea);
    const orig = originalIdea(s, dir, idea);
    entries[entry] = {
      idea, title: orig?.title ?? card.title, spec, proposer: seat.spec, branch: `hackathon/${s.id}/${entry}`,
      worktree: posix(path.join(s.worktrees_root, entry)), port: s.base_port + i + 1, setup_ok: null,
      started: null, deadline: null, status: 'shortlisted', sessions: [],
    };
    return { idea, entry };
  });
  const next = commitShortlist(dir, list, entries);
  for (const { idea, entry } of list) {
    const e = entries[entry];
    console.log(`${entry}: ${idea} "${e.title}" - proposed by ${e.proposer}, built by ${e.spec}, port ${e.port}, branch ${e.branch}`);
  }
  finishShortlist(next, dir);
}

/** Save the shortlist and entries, then write the revealed board and the vault. */
function commitShortlist(dir, list, entries) {
  const next = update(dir, (x) => {
    x.shortlist = list; x.entries = entries; x.revealed = true;
    if (opts.note && opts.note !== true) x.owner_note = String(opts.note);
  });
  const { b, groups, seatCount } = boardData(next, dir);
  const reveal = { seatOf: Object.fromEntries(b.ideas.map((i) => [i.id, ideatorOf(next, i.id)[1]?.spec ?? '?'])), pickOf: shortlistLabels(next) };
  const generated = isoLocal(Date.now());
  fs.writeFileSync(path.join(dir, 'board-revealed.html'), boardHtml({ title: next.title, generated, groups, ideas: b.ideas, seatCount, reveal }));
  fs.writeFileSync(path.join(dir, 'board-revealed.md'), boardMarkdown({ title: next.title, generated, groups, ideas: b.ideas, reveal }));
  return next;
}

function finishShortlist(next, dir) {
  const root = writeVault(next, dir);
  console.log(`revealed board: ${path.join(dir, 'board-revealed.html')}\nvault: ${root}\nNext: prepare --id ${next.id}`);
}

/**
 * --packs: several board ideas fused into one entry per pack, each built by the pack's builder.
 * An idea may sit in more than one pack (a broad pack overlapping deep ones is the point).
 */
function shortlistPacks(s, dir, bj) {
  if (opts.assign?.length) die('--assign goes with --pick; a pack names its builder in packs.json');
  const file = path.resolve(cwd, String(opts.packs === true ? die('--packs needs a file') : opts.packs));
  let doc;
  try { doc = readJson(file); } catch (e) { die(`packs file ${file}: ${e.message}`); }
  const { packs, problems } = validatePacks(doc, bj.ideas.map((i) => i.id));
  if (problems.length) die(`packs file ${file} is not usable - nothing was shortlisted:\n  ${problems.join('\n  ')}`);
  if (packs.length < 2 || packs.length > 4) console.log(`warning: ${packs.length} pack(s) - the format expects 2 to 4 entries`);
  writeJson(path.join(dir, 'packs.json'), { packs });
  const entries = {};
  const list = packs.map((p, i) => {
    const entry = `e${i + 1}`;
    const proposers = [...new Set(p.ideas.map((id) => ideatorOf(s, id)[1]?.spec).filter(Boolean))];
    entries[entry] = {
      idea: p.ideas[0], ideas: p.ideas, pack: { focus: p.focus, brief: p.brief, note: p.note },
      title: p.title, spec: effectiveSpec(p.builder), proposer: null, proposers, branch: `hackathon/${s.id}/${entry}`,
      worktree: posix(path.join(s.worktrees_root, entry)), port: s.base_port + i + 1, setup_ok: null,
      started: null, deadline: null, status: 'shortlisted', sessions: [],
    };
    return { entry, title: p.title, ideas: p.ideas };
  });
  const shared = Object.entries(shortlistLabels({ shortlist: list })).filter(([, v]) => v.includes(','));
  const next = commitShortlist(dir, list, entries);
  for (const { entry } of list) {
    const e = entries[entry];
    console.log(`${entry}: pack "${e.title}" [${e.pack.focus}] fusing ${e.ideas.join(', ')} - built by ${e.spec}, port ${e.port}, branch ${e.branch}`);
  }
  if (shared.length) console.log(`ideas in more than one pack: ${shared.map(([id, v]) => `${id} (${v})`).join('; ')}`);
  finishShortlist(next, dir);
}

// ---------------------------------------------------------------- prepare
const selectEntries = (s) => {
  const only = opts.only && opts.only !== true ? String(opts.only).split(',').map((x) => x.trim()) : null;
  if (only) for (const o of only) if (!s.entries[o]) die(`--only ${o} is not an entry (${Object.keys(s.entries).join(', ') || 'none'})`);
  return Object.keys(s.entries).filter((e) => !only || only.includes(e));
};

/** A pack's IDEA.md: the fusion text and every fused card in full (the builder is not blind). */
function packFile(s, dir, e) {
  const cards = e.ideas.map((id) => originalIdea(s, dir, id) ?? { id, title: '(card missing from the arena)', surface: '?', pitch: '', user_moment: '', insight: '', baseline: '', mastery: '', risks: '', stretch: [], grounding: [] });
  return packMarkdown({ title: e.title, focus: e.pack.focus, brief: e.pack.brief, note: e.pack.note, cards });
}

function ideaFile(s, dir, e) {
  if (e.ideas) return `${packFile(s, dir, e).trim()}\n${s.owner_note ? `\n## The owner's shortlist note\n\n${s.owner_note.trim()}\n` : ''}`;
  const orig = originalIdea(s, dir, e.idea);
  const card = orig ? ideaMarkdown(orig, { heading: '#' }) : `# ${e.idea} - ${e.title}\n`;
  return `${card.trim()}\n${s.owner_note ? `\n## The owner's note\n\n${s.owner_note.trim()}\n` : ''}`;
}

function runShell(command, { cwd: where, timeoutMs, logFile }) {
  const t0 = Date.now();
  const r = spawnSync(command, { cwd: where, shell: true, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 256 * 1024 * 1024, windowsHide: true });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}${r.error ? `\n${r.error.message}` : ''}`;
  const timedOut = r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM';
  if (logFile) fs.appendFileSync(logFile, `\n$ ${command}\n${out}\n[exit ${r.status}${timedOut ? ', timed out' : ''}, ${Math.round((Date.now() - t0) / 1000)} s]\n`);
  return { ok: r.status === 0 && !timedOut, exit: r.status, timed_out: timedOut, out, wall_s: Math.round((Date.now() - t0) / 1000) };
}

function prepare() {
  const { s, dir } = load();
  const ids = selectEntries(s);
  if (!ids.length) die('no entries - run shortlist first');
  ensureExcluded(s.repo);
  for (const eid of ids) {
    const e = readJson(stateFile(dir)).entries[eid];
    if (e.status !== 'shortlisted' && !opts.force) { log(`prepare ${eid}: already ${e.status} (use --force to rewrite its files and rerun setup)`); continue; }
    const wt = e.worktree;
    if (fs.existsSync(wt)) {
      if (!isRegistered(s.repo, wt)) die(`${wt} exists and is not a worktree of ${s.repo} - move it away or choose another --worktrees-root`, 1);
      log(`prepare ${eid}: reusing worktree ${wt}`);
    } else {
      fs.mkdirSync(path.dirname(wt), { recursive: true });
      const hasBranch = git(s.repo, ['rev-parse', '--verify', '--quiet', `refs/heads/${e.branch}`]).ok;
      const add = hasBranch ? git(s.repo, ['worktree', 'add', wt, e.branch]) : git(s.repo, ['worktree', 'add', '-b', e.branch, wt, s.base]);
      if (!add.ok) die(`prepare ${eid}: worktree add failed: ${add.err}`, 1);
      log(`prepare ${eid}: worktree ${wt} on ${e.branch}${hasBranch ? ' (existing branch)' : ''}`);
    }
    const hk = path.join(wt, '.hackathon');
    fs.mkdirSync(hk, { recursive: true });
    fs.copyFileSync(path.join(dir, 'TRACK.md'), path.join(hk, 'TRACK.md'));
    fs.copyFileSync(path.join(dir, 'DOSSIER.md'), path.join(hk, 'DOSSIER.md'));
    fs.writeFileSync(path.join(hk, 'IDEA.md'), ideaFile(s, dir, e));
    const edir = path.join(dir, 'entries', eid);
    fs.mkdirSync(edir, { recursive: true });
    let setupOk = null;
    if (opts['skip-setup']) log(`prepare ${eid}: setup skipped (--skip-setup)`);
    else if (!s.setup.length) { setupOk = true; log(`prepare ${eid}: no setup commands declared`); } else {
      const logFile = path.join(edir, 'setup.log');
      fs.writeFileSync(logFile, `setup for ${eid} in ${wt} at ${isoLocal(Date.now())}\n`);
      setupOk = true;
      for (const c of s.setup) {
        log(`prepare ${eid}: $ ${c}`);
        const r = runShell(c, { cwd: wt, timeoutMs: 30 * 60000, logFile });
        if (!r.ok) {
          setupOk = false;
          console.error(`\n!!! prepare ${eid}: SETUP FAILED: \`${c}\` exit ${r.exit}${r.timed_out ? ' (timed out)' : ''} - see ${logFile}\n!!! the entry is prepared anyway; the host decides whether to fix it or drop it\n${r.out.split(/\r?\n/).slice(-15).join('\n')}\n`);
          break;
        }
      }
    }
    update(dir, (x) => { Object.assign(x.entries[eid], { status: x.entries[eid].sessions.length ? x.entries[eid].status : 'prepared', setup_ok: setupOk, prepared: isoLocal(Date.now()) }); });
    log(`prepare ${eid}: ready - port ${e.port}, setup ${setupOk === null ? 'skipped' : setupOk ? 'ok' : 'FAILED'}`);
  }
}

// ---------------------------------------------------------------- run
const sessionPrompt = (n, now, end, deadline) => `Hackathon session ${n}: read .hackathon/BUILDER.md in this directory and follow it. Now ${hhmm(now)}; this session ends at ${hhmm(end)}; the hackathon ends at ${hhmm(deadline)}.`;

function builderBrief(s, dir, e, eid, { now, end, started, deadline, kind, n, lastOutcome }) {
  const wt = e.worktree;
  const ideaMd = readIf(path.join(wt, '.hackathon', 'IDEA.md'));
  const orig = originalIdea(s, dir, e.idea);
  return renderTemplate(templateText('builder-brief.md'), {
    title: e.title, entry: eid, track: demoteHeadings(read(path.join(dir, 'TRACK.md')).trim()),
    // IDEA.md carries the owner's note too; the brief prints it once, under its own placeholder.
    // A pack's text (fusion brief + every card) sits under the brief's "## Your project", so its headings drop two levels.
    idea: e.ideas ? demoteHeadings(packFile(s, dir, e).trim(), 2)
      : orig ? ideaMarkdown(orig, { heading: '###' }).trim() : (ideaMd ?? `### ${e.title}`).trim(),
    owner_note: s.owner_note ? `**The owner's note on the shortlist:** ${s.owner_note.trim()}` : '',
    hours: String(s.hours), started: stamp(started), deadline: stamp(deadline),
    baseline_by: stamp(Math.min(deadline, started + s.baseline_frac * (deadline - started))),
    session_line: sessionLine({ kind, n, now, end, deadline, lastOutcome }), port: String(e.port), branch: e.branch,
    gates: s.gates.length ? s.gates.map((g) => `- \`${g}\``).join('\n') : 'None declared - keep the app building and its tests green.',
    taste: section('Taste', s.taste), repo_law: section('Repo law', s.repo_law), dossier_path: '.hackathon/DOSSIER.md',
  });
}

/** Commit whatever a session left uncommitted, in the worktree, with hooks; retry once without them. */
function snapshot(wt, eid, n, branch) {
  const out = { committed: false, snapshot_hook_failed: false, snapshot_error: null, sha_after: null, branch_drift: null };
  const dirty = dirtyFiles(wt);
  if (dirty === null) { out.snapshot_error = 'git status failed in the worktree'; return out; }
  if (dirty.length) {
    git(wt, ['add', '-A']);
    const msg = `hackathon(${eid}): snapshot after session ${n}`;
    let c = git(wt, ['commit', '-q', '-m', msg]);
    if (!c.ok) {
      out.snapshot_hook_failed = true;
      c = git(wt, ['commit', '-q', '--no-verify', '-m', msg]);
      if (!c.ok) out.snapshot_error = (c.err || `exit ${c.code}`).slice(0, 300);
    }
    out.committed = c.ok;
  }
  const head = git(wt, ['rev-parse', '--short=12', 'HEAD']);
  out.sha_after = head.ok ? head.out : null;
  const cur = git(wt, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (cur.ok && cur.out !== branch) out.branch_drift = cur.out;
  return out;
}

function copyDeliverables(wt, edir) {
  for (const f of ['HACKLOG.md', 'DEMO.md']) {
    const src = path.join(wt, '.hackathon', f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(edir, f));
  }
}

const pidAlive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };

async function runEntry(dir, eid, mode) {
  const edir = path.join(dir, 'entries', eid);
  fs.mkdirSync(edir, { recursive: true });
  const lock = path.join(edir, 'run.lock');
  const held = readIf(lock);
  if (held && Number(held) !== process.pid && pidAlive(Number(held))) { log(`${eid}: another run (pid ${held}) owns this entry - skipped`); return; }
  fs.writeFileSync(lock, String(process.pid));
  try {
    let s = readJson(stateFile(dir));
    const p = parseParticipant(s.entries[eid].spec);
    const bin = resolveBin(p.engine);
    if (!bin) {
      update(dir, (x) => { x.entries[eid].status = 'stopped'; x.entries[eid].stop_reason = `no ${p.engine} CLI found (set CONTEST_${p.engine.toUpperCase()}_BIN)`; });
      log(`${eid}: stopped - no ${p.engine} CLI found`);
      return;
    }
    let resumeLimit = opts['resume-limited'] === true || opts.reopen === true;
    const doneFile = path.join(s.entries[eid].worktree, '.hackathon', 'DONE');
    if (opts.reopen === true && fs.existsSync(doneFile)) {
      fs.renameSync(doneFile, `${doneFile}.${Date.now()}.prev`);
      log(`${eid}: reopened - the builder's DONE marker was set aside`);
    }
    for (;;) {
      s = readJson(stateFile(dir));
      const e = s.entries[eid];
      const wt = e.worktree;
      const last = e.sessions.at(-1);
      if (last && !last.outcome) {
        // The host died mid-session: the session is closed as interrupted and its work snapshotted.
        const snap = snapshot(wt, eid, last.n, e.branch);
        update(dir, (x) => { Object.assign(x.entries[eid].sessions.at(-1), { outcome: 'interrupted', ...snap }); });
        log(`${eid}: session ${last.n} was interrupted (host stopped) - snapshot ${snap.sha_after ?? '?'}`);
        continue;
      }
      const now = Date.now();
      const started = e.started ? Date.parse(e.started) : now;
      const deadline = e.deadline ? Date.parse(e.deadline) : now + s.hours * 3600000;
      const quick = e.sessions.slice(-2);
      let { plan, reason } = planSessionWhy({
        mode, started, deadline, now, baselineFrac: s.baseline_frac, sprintMin: s.sprint_min,
        sessions: e.sessions, maxSessions: s.max_sessions, lastOutcome: last?.outcome ?? null, resumeLimit,
        declaredDone: fs.existsSync(doneFile) ? (read(doneFile).split(/\r?\n/)[0] || true) : null,
      });
      resumeLimit = false;
      if (plan && quick.length === 2 && quick.every((q) => q.outcome === 'errored' && (q.wall_s ?? 0) < 120)) {
        plan = null; reason = 'two sessions in a row errored within 2 min - the seat is not working';
      }
      if (!plan) {
        const status = /clock|10 min|declared|nothing left/.test(reason) ? 'done' : 'stopped';
        update(dir, (x) => { x.entries[eid].status = status; x.entries[eid].stop_reason = reason; x.entries[eid].finished = isoLocal(Date.now()); });
        log(`${eid}: ${status} - ${reason}`);
        return;
      }
      const n = e.sessions.length + 1;
      const brief = builderBrief(s, dir, e, eid, { now, end: plan.end, started, deadline, kind: plan.kind, n, lastOutcome: last?.outcome ?? null });
      if (e.status === 'stopped' || e.status === 'done') update(dir, (x) => { delete x.entries[eid].stop_reason; delete x.entries[eid].finished; });
      fs.mkdirSync(path.join(wt, '.hackathon'), { recursive: true });
      fs.writeFileSync(path.join(wt, '.hackathon', 'BUILDER.md'), brief);
      const prompt = sessionPrompt(n, now, plan.end, deadline);
      const timeoutMs = plan.end - now;
      const command = engineCommand(p, bin, prompt, { workspace: wt, timeoutMin: timeoutMs / 60000 });
      const logDir = path.join(edir, 'sessions', String(n));
      fs.mkdirSync(logDir, { recursive: true });
      writeJson(path.join(logDir, 'command.json'), { argv: command.argv, cwd: wt, prompt, started: isoLocal(now), ends: isoLocal(plan.end) });
      update(dir, (x) => {
        const xe = x.entries[eid];
        xe.started ??= isoLocal(started); xe.deadline ??= isoLocal(deadline); xe.status = 'running';
        xe.sessions.push({ n, kind: plan.kind, started: isoLocal(now), ends: isoLocal(plan.end), outcome: null, exit: null, wall_s: null, timed_out: null, sha_after: null });
      });
      log(`${eid}: session ${n} (${plan.kind}) starts, ends ${hhmm(plan.end)}, deadline ${hhmm(deadline)} - ${p.spec}`);
      const r = await runSeat(command, { cwd: wt, timeoutMs, logDir, label: `${eid}-${n}` });
      const parsed = parseEnvelope(p.engine, r.stdout);
      const outcome = classifyOutcome(parsed, r);
      fs.writeFileSync(path.join(logDir, 'final.md'), parsed.final ?? '');
      const snap = snapshot(wt, eid, n, e.branch);
      copyDeliverables(wt, edir);
      update(dir, (x) => {
        Object.assign(x.entries[eid].sessions.at(-1), {
          outcome, exit: r.exit, wall_s: r.wall_s, timed_out: r.timedOut, errors: parsed.errors, turns: parsed.turns, cost_usd: parsed.cost_usd, ...snap,
        });
      });
      log(`${eid}: session ${n} ${outcome} after ${humanDuration(r.wall_s * 1000)}${snap.committed ? `, snapshot ${snap.sha_after}` : `, head ${snap.sha_after}`}${snap.snapshot_hook_failed ? ' (hook failed; committed with --no-verify)' : ''}${snap.snapshot_error ? ` - SNAPSHOT FAILED: ${snap.snapshot_error}` : ''}${snap.branch_drift ? ` - WARNING: worktree is on ${snap.branch_drift}, not ${e.branch}` : ''}${parsed.errors.length ? ` - ${parsed.errors[0]}` : ''}`);
    }
  } finally {
    try { if (Number(readIf(lock)) === process.pid) fs.rmSync(lock, { force: true }); } catch { /* best effort */ }
  }
}

async function run() {
  const { s, dir } = load();
  const mode = opts.sprints === true ? 'sprints' : s.mode;
  const dry = opts['dry-run'] === true;
  if (opts.reopen === true && !(opts.only && opts.only !== true)) die('--reopen needs --only <entry>: reopening is a per-entry decision');
  const ids = selectEntries(s).filter((eid) => {
    const e = s.entries[eid];
    if (e.status === 'shortlisted') { console.log(`${eid}: not prepared - run prepare first`); return false; }
    const finished = e.status === 'done' || e.status === 'stopped';
    const limited = e.status === 'stopped' && e.sessions.at(-1)?.outcome === 'seat-limit';
    if (limited && opts['resume-limited'] === true) return true;
    if (finished && opts.reopen === true) return true;
    const timeLeft = e.deadline && Date.parse(e.deadline) - Date.now() >= MIN_SESSION_MS;
    if (finished) { console.log(`${eid}: finished (${e.status}: ${e.stop_reason ?? ''})${timeLeft ? ` - ${limited ? 'after the reset, ' : ''}run --only ${eid} --reopen to give it another session` : ''}`); return false; }
    return true;
  });
  if (!ids.length) { console.log('nothing to run'); return; }
  // Size the field to the machine before the clock: four entries with dev servers and sidecars
  // outgrew free memory in 1.0.0's first run and the harness reaped the whole tree.
  const perEntryGb = opts['ram-per-entry-gb'] && opts['ram-per-entry-gb'] !== true ? Number(opts['ram-per-entry-gb']) : RAM_PER_ENTRY_GB;
  const ram = ramCheck({ freeBytes: os.freemem(), totalBytes: os.totalmem(), entries: ids.length, perEntryGb });
  const reaper = reaperNote(process.env);
  console.log(`preflight: ${ram.line}${ram.ok ? '' : ' - SHORT'}`);
  if (reaper) console.log(`warning: ${reaper}`);
  if (!dry && !ram.ok && opts['ignore-ram'] !== true) {
    console.error(`hackathon: not enough free memory for ${ids.length} entr${ids.length === 1 ? 'y' : 'ies'} - stop other heavy work (native builds, stray dev servers) or run fewer (--only), then re-run; --ignore-ram starts anyway`);
    process.exit(3);
  }
  if (dry) {
    for (const eid of ids) {
      const e = s.entries[eid];
      const p = parseParticipant(e.spec);
      const now = Date.now();
      const started = e.started ? Date.parse(e.started) : now;
      const deadline = e.deadline ? Date.parse(e.deadline) : now + s.hours * 3600000;
      const last = e.sessions.at(-1);
      const { plan, reason } = planSessionWhy({ mode, started, deadline, now, baselineFrac: s.baseline_frac, sprintMin: s.sprint_min, sessions: e.sessions, maxSessions: s.max_sessions, lastOutcome: last ? (last.outcome ?? 'interrupted') : null, resumeLimit: opts.reopen === true || opts['resume-limited'] === true, declaredDone: opts.reopen === true ? null : fs.existsSync(path.join(e.worktree, '.hackathon', 'DONE')) || null });
      if (!plan) { console.log(`${eid} (dry run): no session - ${reason}`); continue; }
      const n = e.sessions.length + 1;
      const brief = builderBrief(s, dir, e, eid, { now, end: plan.end, started, deadline, kind: plan.kind, n, lastOutcome: last?.outcome ?? null });
      const briefFile = path.join(dir, 'entries', eid, 'BUILDER.dry-run.md');
      fs.mkdirSync(path.dirname(briefFile), { recursive: true });
      fs.writeFileSync(briefFile, brief);
      const bin = resolveBin(p.engine) ?? `<${p.engine} CLI not found>`;
      const command = engineCommand(p, bin, sessionPrompt(n, now, plan.end, deadline), { workspace: e.worktree, timeoutMin: (plan.end - now) / 60000 });
      console.log(`${eid} (dry run, ${mode}): session ${n} ${plan.kind}, ${hhmm(now)} -> ${hhmm(plan.end)} (${humanDuration(plan.end - now)}), deadline ${hhmm(deadline)}, seat ${p.spec}, cwd ${e.worktree}`);
      console.log(`  argv: ${JSON.stringify(command.argv)}`);
      console.log(`  stdin: ${JSON.stringify(command.stdin)}`);
      console.log(`  brief rendered (${brief.length} chars, no placeholders left): ${briefFile}`);
    }
    return;
  }
  if (opts.sprints === true && s.mode !== 'sprints') update(dir, (x) => { x.mode = 'sprints'; });
  log(`run ${s.id}: ${ids.join(', ')} in ${mode} mode, ${s.hours} h each`);
  await Promise.all(ids.map((eid) => runEntry(dir, eid, mode)));
  log(`run ${s.id}: all entries stopped. Next: collect --id ${s.id}`);
}

// ---------------------------------------------------------------- status
function statusAll() {
  const root = arenaRoot();
  const dirs = fs.existsSync(root) ? fs.readdirSync(root).filter((d) => fs.existsSync(path.join(root, d, 'hackathon.json'))) : [];
  if (!dirs.length) { console.log(`no hackathons under ${root}`); return; }
  for (const d of dirs) {
    const s = readJson(path.join(root, d, 'hackathon.json'));
    const w = verdictLabel(s);
    console.log(`${s.id.padEnd(28)} ${String(s.created).slice(0, 10)}  ${s.mode.padEnd(7)} ${String(Object.keys(s.entries).length).padStart(2)} entries  ${w}${s.wrapped ? '  (wrapped)' : ''}  - ${s.title}`);
  }
}

function status() {
  if (!opts.id || opts.id === true) { statusAll(); return; }
  const { s, dir } = load();
  console.log(`${s.id} - ${s.title} (${s.mode}, ${s.hours} h, base ${s.base.slice(0, 12)})`);
  if (!Object.keys(s.entries).length) {
    for (const [id, x] of Object.entries(s.ideation)) console.log(`  ideator ${x.letter} ${id}: ${x.outcome ?? 'not run'}, ${x.count ?? 0} idea(s)${x.wall_s != null ? `, ${Math.round(x.wall_s)} s` : ''}${x.errors?.length ? ` - ${x.errors[0]}` : ''}`);
    console.log(`  board: ${fs.existsSync(path.join(dir, 'board.html')) ? path.join(dir, 'board.html') : 'not built'}`);
    return;
  }
  const now = Date.now();
  for (const [eid, e] of Object.entries(s.entries)) {
    const clock = e.started ? `elapsed ${humanDuration(now - Date.parse(e.started))}, remaining ${humanDuration(Date.parse(e.deadline) - now)}` : 'clock not started';
    const ahead = git(s.repo, ['rev-list', '--count', `${s.base}..${e.branch}`]);
    const exists = fs.existsSync(e.worktree);
    const dirty = exists ? dirtyFiles(e.worktree) : null;
    const lastCommit = exists ? git(e.worktree, ['log', '-1', '--format=%h %ar %s']) : { ok: false };
    console.log(`\n${eid} ${entryIdeaLabel(e)} "${e.title}" - ${e.status}${e.stop_reason ? ` (${e.stop_reason})` : ''} - ${e.spec}`);
    console.log(`  sessions ${e.sessions.length} [${e.sessions.map((q) => `${q.n}:${q.kind}:${q.outcome ?? 'running'}`).join(' ')}], ${clock}`);
    console.log(`  commits ahead of base ${ahead.ok ? ahead.out : '?'}, dirty files ${dirty ? dirty.length : '?'}, last ${lastCommit.ok ? lastCommit.out : '(none)'}`);
    console.log(`  worktree ${e.worktree}${exists ? '' : ' (missing)'}, port ${e.port}, setup ${e.setup_ok === null ? 'skipped' : e.setup_ok ? 'ok' : 'FAILED'}`);
    const hl = readIf(path.join(e.worktree, '.hackathon', 'HACKLOG.md')) ?? readIf(path.join(dir, 'entries', eid, 'HACKLOG.md'));
    if (hl) for (const l of hl.trim().split(/\r?\n/).slice(-5)) console.log(`  | ${l}`);
  }
}

// ---------------------------------------------------------------- collect
function collect() {
  const { s, dir } = load();
  const ids = Object.keys(s.entries);
  if (!ids.length) die('no entries - nothing to collect');
  const skipGates = opts['skip-gates'] === true;
  const rows = [];
  for (const eid of ids) {
    const e = s.entries[eid];
    const edir = path.join(dir, 'entries', eid);
    fs.mkdirSync(edir, { recursive: true });
    const exists = fs.existsSync(e.worktree);
    const shortstat = git(s.repo, ['diff', '--shortstat', `${s.base}...${e.branch}`]);
    const names = git(s.repo, ['diff', '--name-only', `${s.base}...${e.branch}`]);
    const fileList = names.ok && names.out ? names.out.split(/\r?\n/) : [];
    const log1 = git(s.repo, ['log', '--format=%h %s', `${s.base}..${e.branch}`]);
    const commits = log1.ok && log1.out ? log1.out.split(/\r?\n/) : [];
    let gates = null;
    let gatesFrom = null;
    // A re-collect with --skip-gates (say, after adding screenshots) keeps the last measured gates.
    const prior = readIf(path.join(edir, 'collect.json'));
    if (skipGates && prior && Array.isArray(JSON.parse(prior).gates)) { gates = JSON.parse(prior).gates; gatesFrom = JSON.parse(prior).gates_at ?? JSON.parse(prior).collected; }
    if (!skipGates) {
      gatesFrom = isoLocal(Date.now());
      gates = [];
      if (!exists) log(`collect ${eid}: worktree missing - gates not run`);
      else {
        const logFile = path.join(edir, 'gates.log');
        fs.writeFileSync(logFile, `gates for ${eid} at ${isoLocal(Date.now())}\n`);
        for (const g of s.gates) {
          log(`collect ${eid}: gate $ ${g}`);
          const r = runShell(g, { cwd: e.worktree, timeoutMs: 15 * 60000, logFile });
          gates.push({ cmd: g, ok: r.ok, exit: r.exit, timed_out: r.timed_out, wall_s: r.wall_s, tail: r.out.split(/\r?\n/).slice(-40).join('\n') });
        }
      }
    }
    if (exists) copyDeliverables(e.worktree, edir);
    const visual = path.join(dir, 'visual');
    const shots = fs.existsSync(visual) ? fs.readdirSync(visual).filter((f) => f.startsWith(`${eid}-`) && /\.png$/i.test(f)).sort().map((f) => `visual/${f}`) : [];
    const dirty = exists ? (dirtyFiles(e.worktree) ?? []).length : 0;
    const row = {
      entry: eid, idea: e.idea, ideas: e.ideas ?? null, pack: e.pack ?? null, title: e.ideas ? `Pack: ${e.title}` : e.title, builder: e.spec,
      // A pack's pitch is the opening paragraph of its fusion brief; the whole brief rides in a fold.
      pitch: e.pack ? e.pack.brief.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').slice(0, 500) : originalIdea(s, dir, e.idea)?.pitch ?? '', worktree: e.worktree, port: e.port,
      branch: e.branch, sessions: e.sessions, commits, shortstat: shortstat.ok ? shortstat.out : `(diff failed: ${shortstat.err})`,
      files: fileList.slice(0, 40), filesTotal: fileList.length, gates, shots, dirty,
      demo: readIf(path.join(edir, 'DEMO.md')), hacklog: readIf(path.join(edir, 'HACKLOG.md')),
    };
    writeJson(path.join(edir, 'collect.json'), { ...row, demo: undefined, hacklog: undefined, gates_at: gatesFrom, collected: isoLocal(Date.now()) });
    rows.push(row);
    const gateSummary = gates === null ? 'skipped' : `${gates.length ? `${gates.filter((g) => g.ok).length}/${gates.length} pass` : 'none declared'}${skipGates ? ` (from ${String(gatesFrom).slice(11, 16)})` : ''}`;
    update(dir, (x) => { x.entries[eid].collected = { at: isoLocal(Date.now()), shortstat: row.shortstat, commits: commits.length, files: fileList.length, gates: gateSummary, dirty }; });
    console.log(`${eid} "${e.title}": ${commits.length} commit(s), ${row.shortstat || 'no change'}, gates ${gateSummary}, DEMO.md ${row.demo ? 'yes' : 'MISSING'}, ${shots.length} screenshot(s)${dirty ? `, ${dirty} UNCOMMITTED file(s)` : ''}`);
  }
  const generated = isoLocal(Date.now());
  fs.writeFileSync(path.join(dir, 'judging.html'), judgingHtml({ title: s.title, generated, base: s.base, entries: rows }));
  fs.writeFileSync(path.join(dir, 'judging.md'), judgingMarkdown({ title: s.title, generated, base: s.base, entries: rows }));
  console.log(`judging pack: ${path.join(dir, 'judging.html')}\n  screenshots are read from ${path.join(dir, 'visual')}/<entry>-*.png`);
}

// ---------------------------------------------------------------- verdict
function verdict() {
  const { s, dir } = load();
  const note = need('note');
  const noteText = fs.existsSync(path.resolve(cwd, note)) && fs.statSync(path.resolve(cwd, note)).isFile() ? read(path.resolve(cwd, note)) : String(note);
  const winner = opts.winner && opts.winner !== true ? String(opts.winner) : null;
  const close = opts.close && opts.close !== true ? String(opts.close) : null;
  const fuse = opts.fuse && opts.fuse !== true ? String(opts.fuse) : null;
  if ([winner, close, fuse].filter(Boolean).length !== 1) die('give exactly one of --winner <entry>, --fuse "e1=base,e2=absorb,e3=defer,e4=drop" or --close "<reason>"');
  if (winner && !s.entries[winner]) die(`--winner ${winner} is not an entry (${Object.keys(s.entries).join(', ') || 'none'})`);
  const runner = opts['runner-up'] && opts['runner-up'] !== true ? String(opts['runner-up']) : null;
  if (runner && (!s.entries[runner] || runner === winner)) die(`--runner-up ${runner} must be another entry`);
  if (runner && !winner) die('--runner-up goes with --winner; a fusion names every entry, a close names none');
  let dispositions = null;
  if (fuse) {
    const r = parseFusion(fuse, Object.keys(s.entries));
    if (r.problems.length) die(`--fuse is not usable - nothing was recorded:\n  ${r.problems.join('\n  ')}`);
    dispositions = r.dispositions;
  }
  // Where the composed scope goes next (a /spark run, a ticket); free text, recorded as given.
  const followup = opts.followup && opts.followup !== true ? String(opts.followup) : null;
  const next = update(dir, (x) => {
    // A fusion's base carries the win in the seat ledger; a rerun of verdict replaces the whole decision.
    x.winner = fuse ? fusionBase(dispositions) : winner; x.runner_up = runner; x.closed = close;
    x.dispositions = dispositions; x.followup = followup; x.verdict_note = noteText; x.decided = isoLocal(Date.now());
  });
  const root = writeVault(next, dir);
  if (fuse) console.log(`${verdictLabel(next)}${followup ? ` - follow-up: ${followup}` : ''}`);
  else console.log(winner ? `winner: ${winner} "${next.entries[winner].title}" built by ${next.entries[winner].spec}${runner ? `; runner-up ${runner}` : ''}` : `closed without a winner: ${close}`);
  console.log(`vault: ${root}\nNext: wrap --id ${s.id} (a dry run; --apply removes the worktrees no follow-up builds from)`);
}

// ---------------------------------------------------------------- wrap
function wrap() {
  const { s, dir } = load();
  if (!s.winner && !s.closed && !s.dispositions) { console.error(`hackathon: "${s.id}" is undecided - run verdict (--winner, --fuse or --close) before wrap`); process.exit(3); }
  const apply = opts.apply === true;
  const release = opts['release-kept'] === true || opts['release-winner'] === true;
  const plan = wrapPlan(s, { release });
  const targets = plan.remove.map((eid) => ({ eid, wt: s.entries[eid].worktree, branch: s.entries[eid].branch }));
  const kept = plan.keep.map(({ eid, why }) => ({ eid, why, wt: s.entries[eid].worktree }));
  const root = s.worktrees_root;
  const ideaLeft = fs.existsSync(root) ? fs.readdirSync(root).filter((d) => /^idea-\d+$/.test(d)).map((d) => posix(path.join(root, d))) : [];
  const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;
  console.log(`${apply ? 'wrap' : 'wrap (dry run)'} ${s.id}:`);
  for (const t of targets) {
    if (!fs.existsSync(t.wt)) { console.log(`  ${t.eid}: ${t.wt} already gone`); continue; }
    const m = treeSize(t.wt);
    const d = dirtyFiles(t.wt);
    console.log(`  remove ${t.eid}: ${t.wt} (${mb(m.bytes)}, ${m.files} files, ${m.links} link(s) unlinked not entered)${d?.length ? ` - DIRTY (${d.length} file(s)): will be refused` : ''}`);
  }
  for (const w of ideaLeft) console.log(`  remove leftover ideation worktree ${w} (${mb(treeSize(w).bytes)})`);
  for (const k of kept) console.log(`  keep ${k.why} ${k.eid}: ${k.wt} (--release-kept removes it too)`);
  console.log(`  keep branches (the audit record, never deleted): ${Object.values(s.entries).map((e) => e.branch).join(', ') || 'none'}`);
  console.log(`  keep the arena: ${dir} (records, briefs, logs, judging pack)`);
  if (!apply) { console.log('dry run - pass --apply to remove'); return; }
  const removed = [];
  const refused = [];
  for (const t of targets) {
    if (!fs.existsSync(t.wt)) continue;
    const r = removeWorktree(s.repo, t.wt, { allowDirty: false });
    if (r.removed) { removed.push(t.wt); log(`removed ${t.eid} ${t.wt}`); } else { refused.push({ path: t.wt, why: r.refused }); console.error(`REFUSED ${t.eid}: ${r.refused}${r.dirty?.length ? `\n  ${r.dirty.slice(0, 10).join('\n  ')}` : ''}`); }
  }
  for (const w of ideaLeft) {
    const r = removeWorktree(s.repo, w, { allowDirty: true });
    if (r.removed) { removed.push(w); log(`removed ${w}`); } else { refused.push({ path: w, why: r.refused }); console.error(`REFUSED ${w}: ${r.refused}`); }
  }
  git(s.repo, ['worktree', 'prune']);
  try { if (fs.existsSync(root) && !fs.readdirSync(root).length) fs.rmdirSync(root); } catch { /* leave it */ }
  // A second wrap (after a refused worktree was cleaned) adds to the record rather than replacing it.
  update(dir, (x) => { x.wrapped = { at: isoLocal(Date.now()), removed: [...(x.wrapped?.removed ?? []), ...removed], refused }; });
  console.log(`wrapped: ${removed.length} removed, ${refused.length} refused`);
  if (refused.length) process.exit(1);
}

// ---------------------------------------------------------------- preflight
/**
 * Phase 0's machine check: free memory against the field, the reaper, and each seat's CLI and real
 * effort. Vendor allowances cannot be read from here - the host asks each CLI and tells the owner.
 * Exit 3 when memory is short, so a host script can stop before the clock.
 */
function preflight() {
  const s = opts.id && opts.id !== true ? load().s : null;
  const seatSpecs = opts.seats && opts.seats !== true ? String(opts.seats).split(',').map((x) => x.trim()).filter(Boolean)
    : s ? (Object.keys(s.entries).length ? Object.values(s.entries).map((e) => e.spec) : s.ideators)
      : String(overlay().data.ideators ?? DEFAULTS.ideators).split(',').map((x) => x.trim()).filter(Boolean);
  const entries = opts.entries && opts.entries !== true ? Number(opts.entries) : (s && Object.keys(s.entries).length) || seatSpecs.length;
  const perEntryGb = opts['ram-per-entry-gb'] && opts['ram-per-entry-gb'] !== true ? Number(opts['ram-per-entry-gb']) : RAM_PER_ENTRY_GB;
  const ram = ramCheck({ freeBytes: os.freemem(), totalBytes: os.totalmem(), entries, perEntryGb });
  console.log(`memory: ${ram.line} - ${ram.ok ? 'ok' : 'SHORT: stop other heavy work or field fewer entries'}`);
  const reaper = reaperNote(process.env);
  console.log(reaper ? `reaper: ${reaper}` : 'reaper: not armed for this process');
  for (const spec of seatSpecs) {
    let p;
    try { p = parseParticipant(spec); } catch (e) { console.log(`seat ${spec}: ${e.message}`); continue; }
    const eff = effectiveSpec(p.spec);
    console.log(`seat ${p.spec}${eff !== p.spec ? ` (runs as ${eff})` : ''}: CLI ${resolveBin(p.engine) ? 'found' : `MISSING (set CONTEST_${p.engine.toUpperCase()}_BIN)`}`);
  }
  console.log('allowance: ask each seat CLI for its remaining usage before the clock and tell the owner - a seat near its limit stops mid-build');
  if (!ram.ok) process.exit(3);
}

// ---------------------------------------------------------------- dispatch
const STEPS = { preflight, init, ideate, board, shortlist, prepare, run, status, collect, verdict, wrap };
if (!cmd || !STEPS[cmd]) { console.error(USAGE); process.exit(2); }
try {
  await STEPS[cmd]();
} catch (e) {
  die(e.stack ?? e.message, 1);
}
