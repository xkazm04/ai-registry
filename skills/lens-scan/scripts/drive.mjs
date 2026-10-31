#!/usr/bin/env node
// lens-scan drive - the headless caller's door: complete one lens's coverage or execute its backlog in a
// product repo with no review UI and no blueprint server running. Deterministic: it reads the store, decides
// which features or items need a run, and starts `claude -p` once per run with a lens-scan prompt on stdin -
// the same prompts the blueprint's job runner sends. The model works only inside those runs.
//
//   node drive.mjs status  --lens <id>|all [--root <product repo>]
//   node drive.mjs cover   --lens <id>|all [--root r] [--features a,b | --stale] [--retry] [--chunk n] [--max-runs n] [--no-propose]
//   node drive.mjs execute --lens <id>|all [--root r] [--ids a,b] [--approve-proposed --by <kind:name> | --auto [--start technical=n,product=m] [--max-size XS..XL]]
//                          [--batch n] [--base <ref>]
//   node drive.mjs propagate --lens <id> [--root r] [--ids <upgrade,...> | --standard house:<subject>/<line>]
//   node drive.mjs release --id rel-<version> [--root r] [--finish]
//   node drive.mjs triage  --ids a,b --decision accept|rework|descope --by <kind:name> [--note t] [--root r]
//   node drive.mjs compare --pack k | --ids a,b [--root r]
//   common: [--model m] [--timeout-min n] [--dry]
//
//   status   gaps and backlog (store.mjs gaps); starts nothing.
//   cover    measures the features with an `unmeasured` metric (also `stale` with --stale, `unmeasurable` with
//            --retry) in runs of --chunk features (default 12; a lens with a conform step: its budget, so each
//            feature in a run gets a pair judged), then one propose run over the lens unless --no-propose. An
//            `unmeasurable` metric - a done run covered the feature and wrote nothing - is reported, and re-run only
//            on --retry (the method changed, or a steps lens's conform step can fill what its script could not).
//            --features a,b names exactly the features to measure, whatever their state (a person's re-measure):
//            each must be in the app-structure's features, and --stale / --retry have nothing left to add.
//   execute  the lens's approved items (or --ids), in runs of --batch (default 50, the blueprint's cap), plus any
//            item a dead run left `executing` (`cut_off`): the run reconciles it from what landed.
//            --approve-proposed --by <kind:name> first approves the lens's `proposed` items as that decider
//            (store.mjs decide): the caller's flag is the decision, exactly as the blueprint's Execute backlog
//            button is. Without it nothing is approved here. Each run builds a pack (SKILL.md 5. Execute): one branch
//            pack/<short>-<n> cut from the release base, one commit per item, never merged into main. --base <ref> passes
//            a specific release base into the prompt. With --ids, a named `rework` item is in the plan too: the run
//            rebuilds it as a new attempt (store.mjs rework-attempt).
//            A machine-approved item (decided_by machine:lens-scan, an L1 decision) is built only in a technical slice
//            the store puts at L2, and never when it is band reserve or sized above --max-size (bp's first --auto built
//            a reserve L); elsewhere it is skipped and waits for a person. --auto (the autonomy ladder,
//            SKILL.md Autonomy) first records the predicted verdict of each `proposed` item whose slice is >= L1
//            (store.mjs decide --machine, which skips reserve and oversize items; `machine_decided`, `machine_skipped`),
//            and after the runs offers every built item to store.mjs triage --machine, which accepts only a better
//            proof with a red control, green gates and an after of its own (`machine_triaged`; the rest
//            `waits_for_triage`). --start is the overlay's trust_start (it only lowers); --max-size XS..XL its
//            auto_max_size (default M).
//            Nothing here releases: a release stays a person's.
//   --lens all (status, cover, execute): every enabled lens of the app-structure with a scan method (store.mjs
//            structureLenses). status and cover merge the lenses' gaps (per feature, `<lens>.<metric>`), cover runs
//            `/lens-scan measure --lens all --scope ...` in chunks of the smallest conform budget among them (each
//            feature read once, judged through every lens) and one `/lens-scan propose --lens all`; execute takes
//            every lens's items. `lenses`, `before.lenses` per lens and `skipped_lenses` (with why) are in the summary.
//   propagate one `claude -p` per landed baseline upgrade of the lens (SKILL.md 6. Propagate,
//            references/propagation.md): `/lens-scan propagate --lens <id> --proposals <upgrade>`, which emits one
//            `propagation` child per similar site for a person to approve. Without --ids / --standard, every `done`
//            baseline-upgrade of the lens; a named one that is not `done` is refused (its house rule is not landed).
//   release  one `claude -p` with `/lens-scan release --id rel-x [--finish]` (references/release.md): without --finish
//            the release goes draft|failed -> building -> pr-open; with --finish, once its PR is merged, pr-open|merged
//            -> merged -> tagged. Done means the release reached that status. A session that ends with the release
//            still `building` has it set `failed` (the person decides). Timeout default 60 min, never under 30.
//   triage   store.mjs triage, no model call: one entry point for a headless caller recording a person's triage.
//   compare  store.mjs compare, no model call: per item, its before/after measurements and shot pairs.
//
// The CLI: LENS_SCAN_CLAUDE_BIN, else BP_CLAUDE_BIN, else `claude` on PATH (a .js/.mjs path runs on this Node).
// Each run gets BP_JOB_ID=drive-<id> (the store notes the run `bp-job:drive-<id>`, which is how this script
// finds it) and a log at .ai/lens-scan/work/drive/<id>.log. stdout: one JSON summary. stderr: progress lines.
// release, triage and compare take no --lens; a propagate run's timeout defaults to 90 min. A run's session that ends while its run still says running (a timeout - --timeout-min, default 90 for a measure,
// 30 per item and at least 90 for an execute - or a crash) has the run closed `aborted`.
// Exit 0 every run done, 1 a run failed or was refused, 2 bad input (an unknown flag among them: refused, never ignored).
import { spawn } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { delimiter, extname, join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  openStore, gaps, decide, proposals, parseArgs, runEnd, triage, compare, releaseGet, releaseUpdate, structureLens, structureLenses, trust, sliceOf,
  MACHINE, StoreError, SIZES, AUTO_MAX_SIZE,
} from './store.mjs';

const MAX_BATCH = 50;
const SAFE_ID = /^[A-Za-z0-9._-]+$/;
const SAFE_REF = /^[A-Za-z0-9._][A-Za-z0-9._/-]*$/;
const REL_ID = /^rel-\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const SAFE_STANDARD = /^[A-Za-z0-9._:/-]+$/;
const VERBS = ['status', 'cover', 'execute', 'propagate', 'release', 'triage', 'compare'];
// Every flag the header documents, as parseArgs names them. Anything else is refused before a session starts: an
// unknown flag was silently ignored, so `--dry-run` for `--dry` ran real `claude -p` sessions.
const FLAGS = ['root', 'lens', 'features', 'stale', 'retry', 'chunk', 'maxRuns', 'noPropose', 'ids', 'approveProposed', 'by', 'batch',
  'base', 'standard', 'id', 'finish', 'decision', 'note', 'pack', 'model', 'timeoutMin', 'dry', 'auto', 'start', 'maxSize'];
/** `--lens all`: every enabled lens with a scan method, each feature read once per run (SKILL.md 2. Measure). */
const ALL = 'all';
const kebab = (k) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const bad = (m) => { throw new StoreError(m, 2); };
const say = (m) => process.stderr.write(`drive: ${m}\n`);

// ------------------------------------------------------------------------------------- the CLI
/** The CLI to start: { file, args } with the prompt on stdin. null = not installed. */
export function resolveCli(args, env = process.env) {
  const bin = env.LENS_SCAN_CLAUDE_BIN || env.BP_CLAUDE_BIN || 'claude';
  if (/\.(mjs|cjs|js)$/i.test(bin)) return existsSync(bin) ? { file: process.execPath, args: [bin, ...args], shell: false } : null;
  if (process.platform !== 'win32') return { file: bin, args, shell: false };
  const exts = extname(bin) ? [''] : ['.exe', '.com', '.cmd', '.bat'];
  const dirs = /[\\/]/.test(bin) ? [''] : (env.PATH ?? env.Path ?? '').split(delimiter).filter(Boolean);
  for (const d of dirs) for (const e of exts) {
    const f = d ? join(d, bin + e) : resolve(bin + e);
    try { if (statSync(f).isFile()) return { file: f, args, shell: /\.(cmd|bat)$/i.test(f) }; } catch { /* not here */ }
  }
  return null;
}

const runIdOf = (db, job) => db.prepare("SELECT id FROM runs WHERE note LIKE ? ORDER BY started_at DESC LIMIT 1").get(`bp-job:${job}%`)?.id;

/**
 * One `claude -p` run of `prompt` in `root`; resolves { job, prompt, run, status, exit, error }. `outcome(r)`, when
 * given, judges the job instead of its run (a release: its status), with r = { run, runStatus, code, last }.
 */
function runJob({ root, dbPath, prompt, model, timeoutMin, env = process.env, outcome }) {
  const job = `drive-${Date.now().toString(36)}-${randomBytes(2).toString('hex')}`;
  const args = ['-p', '--dangerously-skip-permissions', '--output-format', 'text', ...(model ? ['--model', model] : [])];
  const cli = resolveCli(args, env);
  if (!cli) return Promise.resolve({ job, prompt, status: 'failed', error: 'Claude Code CLI not found (set LENS_SCAN_CLAUDE_BIN)' });
  const dir = join(root, '.ai', 'lens-scan', 'work', 'drive');
  mkdirSync(dir, { recursive: true });
  const log = createWriteStream(join(dir, `${job}.log`), { flags: 'a' });
  log.write(`# drive job ${job} started ${new Date().toISOString()}\n# prompt (stdin): ${prompt}\n`);
  say(`${job} start: ${prompt}`);
  return new Promise((done) => {
    let last = '', timer;
    const child = spawn(cli.file, cli.args, { cwd: root, env: { ...env, BP_JOB_ID: job }, windowsHide: true, shell: cli.shell, stdio: ['pipe', 'pipe', 'pipe'] });
    const out = (d) => { log.write(d); const l = String(d).replace(/\r/g, '').split('\n').map((x) => x.trim()).filter(Boolean).pop(); if (l) last = l.slice(0, 300); };
    child.stdout.on('data', out); child.stderr.on('data', out);
    child.stdin.on('error', () => {});
    if (timeoutMin > 0) timer = setTimeout(() => { last = `timed out after ${timeoutMin} min`; killTree(child); }, timeoutMin * 60_000);
    const finish = (r) => {
      clearTimeout(timer);
      log.end(`\n# drive job ${job} ${r.status}${r.error ? `: ${r.error}` : ''}\n`);
      say(`${job} ${r.status}${r.run ? ` (${r.run})` : ''}${r.error ? `: ${r.error}` : ''}`);
      done({ job, prompt, ...r });
    };
    child.on('error', (e) => finish({ status: 'failed', error: e.message }));
    child.on('close', (code) => {
      const db = openStore(dbPath, { readOnly: true });
      let run, runStatus;
      try { run = db && runIdOf(db, job); runStatus = run && db.prepare('SELECT status FROM runs WHERE id = ?').get(run).status; } finally { db?.close(); }
      // the session is gone (killed, crashed) and its run still says running: close it, so its items read as cut off
      if (runStatus === 'running') {
        const w = openStore(dbPath);
        try { runEnd(w, { run, status: 'aborted', note: `ended by drive: ${last || `exit ${code}`}` }); runStatus = 'aborted'; } catch { /* closed meanwhile */ } finally { w.close(); }
      }
      if (outcome) {
        let r;
        try { r = outcome({ run, runStatus, code, last }); } catch (e) { r = { status: 'failed', error: e.message }; }
        return finish({ ...(run ? { run } : {}), exit: code ?? undefined, ...r });
      }
      // lens-scan refuses before run-start and still exits 0: no run is a failure, its last line says why
      if (code !== 0) finish({ run, status: 'failed', exit: code ?? undefined, error: last || `exit ${code}` });
      else if (!run) finish({ status: 'failed', exit: 0, error: last || 'no run started' });
      else if (runStatus !== 'done') finish({ run, status: 'failed', exit: 0, error: `run ended ${runStatus}` });
      else finish({ run, status: 'done', exit: 0 });
    });
    child.stdin.end(`${prompt}\n`);
  });
}

function killTree(child) {
  if (child.pid === undefined) return;
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }).on('error', () => child.kill());
  else child.kill();
}

// ------------------------------------------------------------------------------------- planning
/** The conform budget of a lens's steps scan, when it has one: a cover run then judges one pair per feature. */
function conformBudget(structurePath, lens) {
  try {
    const l = JSON.parse(readFileSync(structurePath, 'utf8')).lenses.find((x) => x.id === lens);
    const step = l?.manifest?.scan?.steps?.find((s) => s.kind === 'skill' && s.skill === 'conform');
    return step ? (Number.isInteger(step.budget) && step.budget > 0 ? step.budget : 6) : undefined;
  } catch { return undefined; }
}

const chunks = (list, n) => { const out = []; for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n)); return out; };
const intFlag = (a, k, dflt, max = Infinity) => {
  if (a[k] === undefined) return dflt;
  const n = Number(a[k]);
  if (!Number.isInteger(n) || n < 1 || n > max) bad(`--${kebab(k)} is an integer 1-${max === Infinity ? 'n' : max}`);
  return n;
};

/** Plans and (unless --dry) runs one verb. Returns the summary object; `ok` false when any run failed. */
export async function drive(argv, env = process.env) {
  const a = parseArgs(argv);
  const verb = a._[0];
  if (!VERBS.includes(verb)) bad(`usage: drive.mjs ${VERBS.join('|')} ... [--root <repo>] (see the header)`);
  const unknown = Object.keys(a).filter((k) => k !== '_' && !FLAGS.includes(k));
  if (unknown.length) bad(`unknown flag ${unknown.map((k) => `--${kebab(k)}`).join(', ')} - drive.mjs takes ${FLAGS.map((k) => `--${kebab(k)}`).join(' ')} (see the header)`);
  const root = resolve(typeof a.root === 'string' ? a.root : '.');
  const dbPath = join(root, '.ai', 'lens-scan', 'scan.db');
  const structure = join(root, '.ai', 'lens-scan', 'app-structure.json');
  if (!existsSync(dbPath)) bad(`no scan store at ${dbPath} - adopt the product first (/adopt-bp)`);
  const model = typeof a.model === 'string' ? (SAFE_ID.test(a.model) ? a.model : bad('--model may not reach a command line')) : undefined;
  const dry = a.dry === true;
  const read = (fn) => { const db = openStore(dbPath, { readOnly: true }); try { return fn(db); } finally { db.close(); } };
  const write = (fn) => { const db = openStore(dbPath); try { return fn(db); } finally { db.close(); } };

  // pass-throughs: no model call, the store's answer as `result`
  if (verb === 'triage') {
    const note = typeof a.note === 'string' ? a.note : undefined;
    return { verb, root, result: write((db) => triage(db, { ids: a.ids, decision: a.decision, by: a.by, note })), ok: true };
  }
  if (verb === 'compare') return { verb, root, result: read((db) => compare(db, { ids: a.ids, pack: a.pack })), ok: true };
  if (verb === 'release') return release(a, { root, dbPath, model, dry, read, write, env });

  const lens = typeof a.lens === 'string' ? a.lens : bad('--lens is required');
  if (!SAFE_ID.test(lens)) bad(`--lens ${JSON.stringify(lens)} may not reach a command line`);
  const base = a.base === undefined ? undefined : (typeof a.base === 'string' && SAFE_REF.test(a.base) && !a.base.includes('..') ? a.base : bad('--base is a git ref (letters, digits, . _ / -)'));
  if (base !== undefined && verb !== 'execute') bad('--base belongs to execute');
  if (a.features !== undefined && verb !== 'cover') bad('--features belongs to cover');
  if (a.standard !== undefined && verb !== 'propagate') bad('--standard belongs to propagate');
  if (a.auto !== undefined && verb !== 'execute') bad('--auto belongs to execute');
  if (a.start !== undefined && a.auto === undefined) bad('--start (the overlay\'s trust_start) belongs to execute --auto');
  if (a.maxSize !== undefined && a.auto === undefined) bad('--max-size (the overlay\'s auto_max_size) belongs to execute --auto');
  const maxSize = a.maxSize === undefined ? AUTO_MAX_SIZE : (SIZES.includes(a.maxSize) ? a.maxSize : bad(`--max-size is one of ${SIZES.join(', ')} (the overlay's auto_max_size)`));
  if (a.auto !== undefined && a.approveProposed !== undefined) bad('--auto lets the store decide by its trust levels; --approve-proposed is a person\'s blanket decision - pass one');
  if (verb === 'propagate') {
    if (lens === ALL) bad('propagate runs one landed upgrade at a time; name its lens (--lens all is for status, cover and execute)');
    return propagate(a, { lens, root, dbPath, model, dry, read, env, timeoutMin: intFlag(a, 'timeoutMin', 90) });
  }
  // a cover run is one bounded measure; an execute run builds, gates and re-measures every item (paypal's 9 took
  // over 90 min): 30 min per item, never under 90, unless the caller says otherwise
  const timeoutFor = (items) => intFlag(a, 'timeoutMin', Math.max(90, 30 * items));
  // --lens all: the structure's lens set; a lens it cannot count gaps for (no metric field) is skipped with why
  let lensSet = [lens];
  const skippedLenses = [];
  if (lens === ALL) {
    const set = structureLenses(structure) ?? bad(`--lens all reads the app-structure, and there is none at ${structure}`);
    skippedLenses.push(...set.skipped);
    lensSet = set.lenses;
  }
  const perLens = {};
  for (const l of lensSet) {
    try { perLens[l] = read((db) => gaps(db, { lens: l, structure })); } catch (e) {
      if (lens !== ALL || !(e instanceof StoreError) || e.code !== 2) throw e;
      skippedLenses.push({ id: l, why: e.message });
    }
  }
  lensSet = lensSet.filter((l) => perLens[l]);
  if (lens === ALL && !lensSet.length) bad(`--lens all: no lens to drive (${skippedLenses.map((s) => `${s.id}: ${s.why}`).join('; ') || 'lenses[] is empty'})`);
  // one lens: its gaps as before; all: per lens, and every feature with a gap in any lens
  const before = lens === ALL ? mergeGaps(perLens) : perLens[lens];
  const summary = { verb, lens, root, dry, before: { totals: before.totals, backlog: before.backlog } };
  if (lens === ALL) {
    summary.lenses = lensSet;
    summary.before.lenses = Object.fromEntries(lensSet.map((l) => [l, { totals: perLens[l].totals, backlog: perLens[l].backlog }]));
    if (skippedLenses.length) summary.skipped_lenses = skippedLenses;
  }

  if (verb === 'status') return { ...summary, gaps: before.features, ok: true };

  const jobs = [];
  if (verb === 'cover') {
    const named = a.features === undefined ? undefined : namedFeatures(a.features, structure, lensSet[0]);
    const todo = named ?? before.features.filter((f) => f.unmeasured || (a.stale === true && f.stale) || (a.retry === true && f.unmeasurable)).map((f) => f.feature);
    // all lenses in one run: the smallest conform budget among them, so every steps lens still gets a pair per feature
    const budgets = lensSet.map((l) => conformBudget(structure, l)).filter((b) => b !== undefined);
    const size = intFlag(a, 'chunk', budgets.length ? Math.min(...budgets) : 12, 200);
    const plan = chunks(todo, size).slice(0, intFlag(a, 'maxRuns', Infinity));
    summary.plan = plan.map((c) => `/lens-scan measure --lens ${lens} --scope ${c.join(',')}`);
    if (a.noPropose !== true) summary.plan.push(`/lens-scan propose --lens ${lens}`);
    summary.unmeasurable = before.features.filter((f) => f.unmeasurable).map((f) => ({ feature: f.feature, metrics: f.unmeasurable }));
    if (!dry) for (const prompt of summary.plan) jobs.push(await runJob({ root, dbPath, prompt, model, timeoutMin: timeoutFor(1), env }));
  } else {
    const inScope = (p) => lens === ALL || p.lens === lens;
    let items = read((db) => proposals(db, a.ids !== undefined ? { ids: a.ids } : {})).filter(inScope);
    if (a.ids !== undefined) {
      // as propagate --ids: a named id that is no item of this lens is refused, never dropped into an empty ok plan
      const found = new Set(items.map((p) => p.id));
      const missing = String(a.ids).split(',').map((x) => x.trim()).filter((x) => x && !found.has(x));
      if (missing.length) bad(`--ids: not an item of lens ${lens}: ${missing.join(', ')}`);
    }
    if (a.approveProposed !== undefined) {
      const by = typeof a.by === 'string' ? a.by : bad('--approve-proposed needs --by <kind:name>: who carries the decision');
      const open = items.filter((p) => p.status === 'proposed').map((p) => p.id);
      if (open.length && !dry) {
        const db = openStore(dbPath);
        try { summary.approved = decide(db, { ids: open, decision: 'approve', by, note: `approved headless through drive.mjs by ${by}` }).decided; } finally { db.close(); }
      } else summary.approved = dry ? open : [];
      items = read((db) => proposals(db, { ids: items.map((p) => p.id).join(',') || 'none' }));
    }
    // --auto (SKILL.md Autonomy): the store, not this script, decides what the machine may do. L1: each predicted
    // `proposed` item's verdict is recorded where its slice allows it (decide --machine). L2: a machine-approved item
    // is built only in an L2 technical slice; a person's approval is built as always. After the runs, triage --machine
    // accepts only a better proof with a red control. Nothing here releases: a release stays a person's.
    let levels;
    if (a.auto !== undefined) {
      const start = typeof a.start === 'string' ? a.start : undefined;
      const open = items.filter((p) => p.status === 'proposed' && p.predicted_verdict).map((p) => p.id);
      if (open.length && !dry) {
        const r = write((db) => decide(db, { ids: open, machine: true, start, maxSize }));
        summary.machine_decided = r.decided;
        if (r.skipped.length) summary.machine_skipped = r.skipped;
      }
      items = read((db) => proposals(db, { ids: items.map((p) => p.id).join(',') || 'none' }));
      if (start) summary.start = start;
    }
    // a machine's approval is an L1 decision; building it is L2, with or without --auto: only in an L2 technical slice
    if (items.some((p) => p.status === 'approved' && p.decided_by === MACHINE)) {
      const start = typeof a.start === 'string' ? a.start : undefined;
      levels = new Map(write((db) => trust(db, { start })).slices.map((s) => [s.slice, s.level]));
    }
    // (H-L3) and never a reserve item or one above the auto size, even one a machine approved before this rule
    const oversize = (p) => p.size && SIZES.indexOf(p.size) > SIZES.indexOf(maxSize);
    const machineOnly = (p) => p.status === 'approved' && p.decided_by === MACHINE;
    const parked = (p) => machineOnly(p) && (p.band === 'reserve' || oversize(p));
    const waits = (p) => parked(p) || (levels !== undefined && machineOnly(p) && !(p.category === 'technical' && (levels.get(sliceOf(p)) ?? 0) >= 2));
    // an item left `executing` by a run that is no longer running was cut off; the next execute reconciles it
    const held = read((db) => new Set(db.prepare("SELECT scope FROM runs WHERE phase = 'execute' AND status = 'running'").all()
      .flatMap((r) => { try { return JSON.parse(r.scope ?? '{}').proposals ?? ['*']; } catch { return ['*']; } })));
    const cutOff = items.filter((p) => p.status === 'executing' && !held.has(p.id) && !held.has('*')).map((p) => p.id);
    if (cutOff.length) summary.cut_off = cutOff;
    // a `rework` item is rebuilt only by an execute that names it (--ids): the run makes its new attempt
    const named = a.ids !== undefined;
    const go = items.filter((p) => (p.status === 'approved' && !waits(p)) || cutOff.includes(p.id) || (named && p.status === 'rework') || (dry && summary.approved?.includes(p.id))).map((p) => p.id).filter((id) => SAFE_ID.test(id));
    summary.skipped = items.filter((p) => !go.includes(p.id)).map((p) => (parked(p)
      ? { id: p.id, status: p.status, reason: `machine-approved ${p.band === 'reserve' ? 'band reserve' : `size ${p.size} above the auto size ${maxSize}`}: it waits for a person` }
      : waits(p)
      ? { id: p.id, status: p.status, reason: `machine-approved in slice ${sliceOf(p)} (L${levels.get(sliceOf(p)) ?? 0}${p.category === 'technical' ? '' : `, ${p.category ?? 'no category'}`}): building it is L2; it waits for a person` }
      : { id: p.id, status: p.status }));
    const batches = chunks(go, intFlag(a, 'batch', MAX_BATCH, MAX_BATCH));
    summary.plan = batches.map((c) => `/lens-scan execute --proposals ${c.join(',')}${base ? ` --base ${base}` : ''}`);
    if (!dry) for (const [i, prompt] of summary.plan.entries()) jobs.push(await runJob({ root, dbPath, prompt, model, timeoutMin: timeoutFor(batches[i].length), env }));
    if (go.length && !dry) {
      summary.items = read((db) => proposals(db, { ids: go.join(',') })).map((p) => ({
        id: p.id, feature: p.feature, status: p.status, metric: p.metric, expected_delta: p.expected_delta, after_value: p.after_value, result_sha: p.result_sha,
        commit_sha: p.commit_sha, pack: p.pack_id, title: p.title,
      }));
      // a rework item stays `rework`; its rebuild is the new attempt that names it
      const attempts = read((db) => db.prepare(`SELECT id, attempt_of, status, pack_id, commit_sha FROM proposals WHERE attempt_of IN (${go.map(() => '?').join(',')})`).all(...go));
      if (attempts.length) summary.attempts = attempts.map((p) => ({ id: p.id, attempt_of: p.attempt_of, status: p.status, pack: p.pack_id ?? undefined, commit_sha: p.commit_sha ?? undefined }));
      // L2's landing rule: the machine accepts a built item only on a better proof with a red control (the store checks)
      const built = [...summary.items, ...(summary.attempts ?? [])].filter((p) => p.status === 'done').map((p) => p.id);
      if (a.auto !== undefined && built.length) {
        const r = write((db) => triage(db, { ids: built, machine: true, start: typeof a.start === 'string' ? a.start : undefined }));
        summary.machine_triaged = r.triaged;
        if (r.skipped.length) summary.waits_for_triage = r.skipped;
      }
    }
  }
  summary.jobs = jobs;
  if (!dry) {
    const after = lens === ALL ? mergeGaps(Object.fromEntries(lensSet.map((l) => [l, read((db) => gaps(db, { lens: l, structure }))]))) : read((db) => gaps(db, { lens, structure }));
    summary.after = { totals: after.totals, backlog: after.backlog };
  }
  summary.ok = jobs.every((j) => j.status === 'done');
  return summary;
}

/**
 * The gaps of several lenses as one plan input: totals and backlog summed, and per feature the union of what any lens
 * still needs, each metric named `<lens>.<metric>` so the report says which lens a gap belongs to.
 */
export function mergeGaps(perLens) {
  const totals = {}, backlog = {}, byFeature = new Map();
  for (const [l, g] of Object.entries(perLens)) {
    for (const [k, v] of Object.entries(g.totals)) totals[k] = k === 'features' ? Math.max(totals[k] ?? 0, v) : (totals[k] ?? 0) + v;
    for (const [k, v] of Object.entries(g.backlog ?? {})) backlog[k] = (backlog[k] ?? 0) + v;
    for (const f of g.features) {
      if (!byFeature.has(f.feature)) byFeature.set(f.feature, { feature: f.feature });
      const row = byFeature.get(f.feature);
      for (const k of ['unmeasured', 'unmeasurable', 'stale']) if (f[k]) row[k] = [...(row[k] ?? []), ...f[k].map((m) => `${l}.${m}`)];
    }
  }
  return { totals, backlog, features: [...byFeature.values()] };
}

/** `--features a,b`: the named slugs, each one a feature of the app-structure (else bad input naming the unknown). */
function namedFeatures(flag, structure, lens) {
  const list = typeof flag === 'string' ? [...new Set(flag.split(',').map((x) => x.trim()).filter(Boolean))] : [];
  if (!list.length) bad('--features names at least one feature slug');
  const known = new Set(structureLens(structure, lens).features);
  const unknown = list.filter((f) => !known.has(f));
  if (unknown.length) bad(`--features: not in the app-structure: ${unknown.join(', ')}`);
  return list;
}

/** One propagation session per landed baseline upgrade (references/propagation.md); judged by its run, as a measure. */
async function propagate(a, { lens, root, dbPath, model, dry, read, env, timeoutMin }) {
  const standard = a.standard === undefined ? undefined : (typeof a.standard === 'string' && SAFE_STANDARD.test(a.standard) ? a.standard : bad('--standard is a house line, house:<subject>/<line>'));
  if (standard !== undefined && a.ids !== undefined) bad('propagate takes --ids or --standard, not both');
  const upgrades = read((db) => proposals(db, { kind: 'baseline-upgrade', ...(a.ids !== undefined ? { ids: a.ids } : {}) }))
    .filter((p) => p.lens === lens && (standard === undefined || p.standard === standard));
  if (a.ids !== undefined) {
    const found = new Set(upgrades.map((p) => p.id));
    const missing = String(a.ids).split(',').map((x) => x.trim()).filter((x) => x && !found.has(x));
    if (missing.length) bad(`--ids: not a baseline-upgrade of lens ${lens}: ${missing.join(', ')}`);
  }
  if (standard !== undefined && !upgrades.length) bad(`no baseline-upgrade of lens ${lens} names ${standard}`);
  const named = a.ids !== undefined || standard !== undefined;
  const notLanded = upgrades.filter((p) => p.status !== 'done');
  if (named && notLanded.length) throw new StoreError(`not landed, so its house rule does not exist yet: ${notLanded.map((p) => `${p.id} is ${p.status}`).join(', ')}`, 1);
  const go = upgrades.filter((p) => p.status === 'done' && SAFE_ID.test(p.id));
  const summary = { verb: 'propagate', lens, root, dry, upgrades: go.map((p) => ({ id: p.id, standard: p.standard, feature: p.feature })) };
  summary.plan = go.map((p) => `/lens-scan propagate --lens ${lens} --proposals ${p.id}`);
  const jobs = [];
  if (!dry) for (const prompt of summary.plan) jobs.push(await runJob({ root, dbPath, prompt, model, timeoutMin, env }));
  summary.jobs = jobs;
  if (go.length && !dry) {
    summary.children = read((db) => db.prepare(`SELECT id, parent_id, feature, status FROM proposals WHERE kind = 'propagation' AND parent_id IN (${go.map(() => '?').join(',')}) ORDER BY created_at`)
      .all(...go.map((p) => p.id))).map((p) => ({ id: p.id, parent: p.parent_id, feature: p.feature, status: p.status }));
  }
  summary.ok = jobs.every((j) => j.status === 'done');
  return summary;
}

/** One release session (references/release.md); judged by the status the release reached, not by a run. */
async function release(a, { root, dbPath, model, dry, read, write, env }) {
  const id = typeof a.id === 'string' ? a.id : bad('--id rel-<version> is required');
  if (!REL_ID.test(id)) bad(`--id ${JSON.stringify(id)} is rel-<semver>`);
  const finish = a.finish === true;
  const rel = read((db) => releaseGet(db, { id }));
  const from = finish ? ['pr-open', 'merged'] : ['draft', 'failed'];
  if (!from.includes(rel.status)) throw new StoreError(`release ${id} is ${rel.status}; ${finish ? '--finish' : 'release'} starts from ${from.join(' or ')}`, 1);
  const target = finish ? 'tagged' : 'pr-open';
  const prompt = `/lens-scan release --id ${id}${finish ? ' --finish' : ''}`;
  const summary = { verb: 'release', root, dry, release: id, finish, before: { status: rel.status, items: rel.items.length }, plan: [prompt] };
  if (dry) return { ...summary, ok: true };
  const given = intFlag(a, 'timeoutMin', 60);
  const outcome = ({ run, runStatus, last }) => {
    let r = read((db) => releaseGet(db, { id }));
    // the session is gone mid-build: the release says building and nobody holds it; fail it, the person decides
    if (r.status === 'building') {
      try { write((w) => releaseUpdate(w, { release: id, status: 'failed', from: 'building', error: `ended by drive: ${last || 'session ended'}` })); } catch { /* moved on */ }
      r = read((d) => releaseGet(d, { id }));
    }
    if (r.status !== target) return { status: 'failed', release: r.status, error: r.error ?? (last || `release ended ${r.status}`) };
    if (run && runStatus !== 'done') return { status: 'failed', release: r.status, error: `run ended ${runStatus}` };
    return { status: 'done', release: r.status };
  };
  const job = await runJob({ root, dbPath, prompt, model, timeoutMin: Math.max(30, given), env, outcome });
  const after = read((db) => releaseGet(db, { id }));
  const { items, ...head } = after;
  return { ...summary, jobs: [job], after: { ...head, items: items.map((p) => ({ id: p.id, status: p.status, commit_sha: p.commit_sha })) }, ok: job.status === 'done' };
}

if (process.argv[1] && isEntry(process.argv[1], import.meta.url)) {
  drive(process.argv.slice(2)).then((s) => {
    process.stdout.write(`${JSON.stringify(s, null, 2)}\n`);
    process.exit(s.ok ? 0 : 1);
  }, (e) => {
    process.stderr.write(`drive: ${e.message}\n`);
    process.exit(e instanceof StoreError ? e.code : 1);
  });
}

function isEntry(argv1, url) {
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}
