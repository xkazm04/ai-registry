#!/usr/bin/env node
// lens-scan steps - runs one `script` step of a steps lens (scan.method 'steps', references/lens-manifest-scan.md)
// inside a running measure run, and records what it printed. `skill` and `judgement` steps are the agent's own
// work (SKILL.md "Lenses with a scan block"); this script refuses them.
//
//   node steps.mjs run --lens <id> --step <i> --run-id <run> [--scope a,b] [--root <product root>]
//                      [--structure <app-structure.json>] [--db <scan.db>]
//
// The step's `run` is a shell command. Before it runs, the placeholders are replaced:
//   {root}       the product root (--root, default the working directory)
//   {structure}  the app-structure.json path (absolute)
//   {registry}   the ai-registry checkout: $AI_REGISTRY_DIR, else registry.local from <root>/.ai/manifest.yaml,
//                else ../ai-registry beside the product. A step that names {registry} when no such directory
//                exists is SKIPPED with a `note` activity "no registry checkout" (nothing is measured, exit 0).
//   {features}   the scoped feature slugs, comma-separated, or empty when the run covers every feature
// Values are put in as they are: quote a placeholder in `run` when the path may hold spaces ("{root}").
// It runs with cwd = the product root and a 10 minute cap. Its stdout is JSON: an array of rows (or an object
// whose `rows` is one) `{feature, metric, value, evidence?, applicable?, reason?}`.
//   - a row for a feature outside the scope is ignored (counted, not written);
//   - `applicable: false` (with a reason) marks the facet not applicable through structure.mjs's setApplicable;
//   - a metric the step does not list in `yields`, or that is not a numeric metric field of the lens, or a value
//     that is not a finite number is REFUSED: a `note` activity, never a row;
//   - every other row is a measurement: method `static`, unit = the manifest field's `unit`, evidence = the
//     row's, else the step's command. A feature that gets a measurement and whose facet said not applicable is
//     cleared back (the lens touches it after all).
// A command that fails (exit code, timeout, stdout that is not rows) writes an `error` activity and exits 1
// with nothing measured. Prints a JSON summary.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openStore, measure, activity, getRun, parseArgs, StoreError, DEFAULT_DB } from './store.mjs';
import { lensMethod, setApplicable, writeAtomic, DEFAULT_OUT } from './structure.mjs';

export const STEP_TIMEOUT_MS = 10 * 60 * 1000;
const bad = (m) => { throw new StoreError(m, 2); };
const refuse = (m) => { throw new StoreError(m, 1); };

/** `registry: { local: <path> }` from an ai-manifest's text (the one key read here; no YAML dependency). */
export function manifestRegistryLocal(text) {
  const m = String(text).match(/^registry:[^\S\r\n]*\r?\n((?:[^\S\r\n]+.*\r?\n?)*)/m);
  const local = m?.[1].match(/^[^\S\r\n]+local:[^\S\r\n]*["']?([^"'#\r\n]+?)["']?[^\S\r\n]*(?:#.*)?$/m);
  return local ? local[1].trim() : undefined;
}

/** The registry checkout a step's {registry} names, or undefined when there is none on this machine. */
export function resolveRegistry(root, env = process.env) {
  const candidates = [];
  if (env.AI_REGISTRY_DIR) candidates.push(env.AI_REGISTRY_DIR);
  const mf = join(root, '.ai', 'manifest.yaml');
  const local = existsSync(mf) ? manifestRegistryLocal(readFileSync(mf, 'utf8')) : undefined;
  if (local) candidates.push(isAbsolute(local) ? local : resolve(root, local));
  candidates.push(resolve(root, '..', 'ai-registry'));
  for (const c of candidates) { try { if (statSync(c).isDirectory()) return resolve(c); } catch { /* next */ } }
  return undefined;
}

/** The step's command with its placeholders replaced; `registry` undefined leaves {registry} unresolved (caller skips). */
export const fillPlaceholders = (run, { root, structure, registry, features }) => run
  .replaceAll('{root}', root).replaceAll('{structure}', structure).replaceAll('{features}', features.join(','))
  .replaceAll('{registry}', registry ?? '{registry}');

/** The rows a script printed: an array, or an object holding `rows`. Anything else is a failed step. */
export function parseRows(stdout) {
  let v;
  try { v = JSON.parse(String(stdout).trim()); } catch (e) { refuse(`the step's stdout is not JSON (${e.message})`); }
  const rows = Array.isArray(v) ? v : Array.isArray(v?.rows) ? v.rows : null;
  if (!rows) refuse('the step printed JSON that is neither an array of rows nor { rows: [...] }');
  return rows;
}

/**
 * Sorts a step's rows into measurements, not-applicable marks, refusals and ignored rows. Pure: the
 * caller writes. `fields` are lensMethod's numeric metric fields; `scope` a Set of feature slugs.
 */
export function classifyRows(rows, { lens, step, scope, fields, command }) {
  const byKey = new Map(fields.map((f) => [f.key, f]));
  const out = { measurements: [], notApplicable: [], refused: [], ignored: 0 };
  for (const r of rows) {
    if (!r || typeof r !== 'object' || typeof r.feature !== 'string') { out.refused.push({ row: r, why: 'a row names its feature' }); continue; }
    if (!scope.has(r.feature)) { out.ignored += 1; continue; }
    if (r.applicable === false) {
      const reason = typeof r.reason === 'string' ? r.reason.trim() : '';
      if (!reason) out.refused.push({ row: r, why: 'applicable:false needs a reason' });
      else out.notApplicable.push({ feature: r.feature, reason });
      continue;
    }
    if (!step.yields.includes(r.metric)) { out.refused.push({ row: r, why: `metric ${r.metric} is not in the step's yields` }); continue; }
    const f = byKey.get(r.metric);
    if (!f) { out.refused.push({ row: r, why: `metric ${r.metric} is not a numeric metric field of ${lens}` }); continue; }
    const value = typeof r.value === 'number' ? r.value : NaN;
    if (!Number.isFinite(value)) { out.refused.push({ row: r, why: `value ${JSON.stringify(r.value)} is not a finite number; an unmeasurable metric gets no row` }); continue; }
    out.measurements.push({ feature: r.feature, lens, metric: r.metric, value, ...(f.unit ? { unit: f.unit } : {}), method: 'static',
      evidence: typeof r.evidence === 'string' && r.evidence.trim() ? r.evidence : command });
  }
  // a feature the lens marks both measured and not applicable in one output keeps the not-applicable mark only
  const na = new Set(out.notApplicable.map((n) => n.feature));
  const dropped = out.measurements.filter((m) => na.has(m.feature));
  out.measurements = out.measurements.filter((m) => !na.has(m.feature));
  for (const m of dropped) out.refused.push({ row: m, why: `${m.feature} is also marked not applicable in the same output` });
  return out;
}

/** Runs step `i` of lens `lens` in run `runId`. Returns the summary the CLI prints. */
export function runScriptStep({ lens, step: i, runId, scope, root = process.cwd(), structurePath, dbPath, env = process.env, exec = execStep }) {
  root = resolve(root);
  const sPath = resolve(root, structurePath ?? DEFAULT_OUT);
  if (!existsSync(sPath)) bad(`no app-structure at ${sPath} - run phase 1 first, or pass --structure <path>`);
  const structure = JSON.parse(readFileSync(sPath, 'utf8'));
  const entry = structure.lenses?.find((l) => l.id === lens);
  if (!entry) bad(`no lens ${JSON.stringify(lens)} in the structure's lenses[]`);
  const info = lensMethod(entry);
  if (info.method === 'invalid') refuse(info.why);
  if (info.method !== 'steps') refuse(`lens ${lens} is measured by method ${info.method}, not steps`);
  const idx = Number(i);
  const step = info.steps[idx];
  if (!Number.isInteger(idx) || !step) bad(`--step must be 0..${info.steps.length - 1} (got ${JSON.stringify(i)})`);
  if (step.kind !== 'script') refuse(`step ${idx} is a ${step.kind} step; steps.mjs runs script steps, the agent runs the others`);

  const db = openStore(resolve(root, dbPath ?? DEFAULT_DB));
  try {
    const run = getRun(db, runId);
    if (!run) refuse(`run ${runId} does not exist`);
    const all = (structure.features ?? []).map((f) => f.slug);
    const listed = scope?.length ? scope : Array.isArray(run.scope?.features) ? run.scope.features : undefined;
    const unknown = (listed ?? []).filter((f) => !all.includes(f));
    if (unknown.length) bad(`unknown feature slug(s) in scope: ${unknown.join(', ')}`);
    const features = listed ?? [];
    const scoped = new Set(listed ?? all);
    const note = (kind, text) => activity(db, { run: runId, kind, lens, text });

    const registry = step.run.includes('{registry}') ? resolveRegistry(root, env) : undefined;
    if (step.run.includes('{registry}') && !registry) {
      note('note', `step ${idx} skipped: no registry checkout ($AI_REGISTRY_DIR, registry.local in .ai/manifest.yaml, ../ai-registry)`);
      return { lens, step: idx, skipped: 'no registry checkout', written: 0 };
    }
    const command = fillPlaceholders(step.run, { root, structure: sPath, registry, features });
    note('note', `step ${idx}: ${step.run}`);
    const r = exec(command, root);
    if (r.error || r.status !== 0) {
      const why = r.error?.code === 'ETIMEDOUT' ? `timed out after ${STEP_TIMEOUT_MS / 60000} min` : r.error ? r.error.message : `exit ${r.status}: ${String(r.stderr ?? '').trim().split('\n').slice(-3).join(' | ').slice(0, 400)}`;
      note('error', `step ${idx} failed (${why})`);
      refuse(`step ${idx} failed: ${why}`);
    }
    let rows;
    try { rows = parseRows(r.stdout); } catch (e) { note('error', `step ${idx}: ${e.message}`); throw e; }
    const sorted = classifyRows(rows, { lens, step, scope: scoped, fields: info.fields, command: step.run });
    for (const x of sorted.refused) note('note', `step ${idx} refused a row (${x.why}): ${JSON.stringify(x.row).slice(0, 200)}`);

    if (sorted.measurements.length) {
      measure(db, runId, sorted.measurements);
      const feats = new Set(sorted.measurements.map((m) => m.feature));
      activity(db, { run: runId, kind: 'measured', lens, text: `step ${idx}: ${sorted.measurements.length} measurements over ${feats.size} feature(s)` });
    }
    // the map side: not-applicable marks, and a measured feature's stale mark cleared; one atomic rewrite
    const fresh = JSON.parse(readFileSync(sPath, 'utf8'));
    let changed = false;
    for (const n of sorted.notApplicable) {
      changed = setApplicable(fresh, { feature: n.feature, lens, applicable: false, reason: n.reason }).changed || changed;
      note('note', `no impact: ${n.feature}: ${n.reason}`);
    }
    for (const f of new Set(sorted.measurements.map((m) => m.feature))) {
      if (fresh.facets?.[f]?.[lens]?.applicable === false) changed = setApplicable(fresh, { feature: f, lens, applicable: true }).changed || changed;
    }
    if (changed) writeAtomic(sPath, `${JSON.stringify(fresh, null, 2)}\n`);
    return { lens, step: idx, written: sorted.measurements.length, not_applicable: sorted.notApplicable.map((n) => n.feature),
      refused: sorted.refused.length, ignored: sorted.ignored, structure_written: changed };
  } finally { db.close(); }
}

/** The shell run: cwd = product root, 10 minute cap, stdout kept whole (a map's rows can be large). */
export function execStep(command, cwd) {
  return spawnSync(command, { cwd, shell: true, encoding: 'utf8', timeout: STEP_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024, windowsHide: true });
}

// ------------------------------------------------------------------------------------- cli
const HELP = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^#!.*\n/, '').replace(/^\/\/ ?/gm, '');

export function main(argv, env = process.env) {
  const a = parseArgs(argv);
  if (a.help || !a._[0]) return { help: HELP };
  if (a._[0] !== 'run') bad(`unknown subcommand ${JSON.stringify(a._[0])} - run with --help`);
  if (typeof a.lens !== 'string' || typeof a.runId !== 'string' || a.step === undefined || a.step === true) bad('run needs --lens <id> --step <i> --run-id <run>');
  const scope = typeof a.scope === 'string' ? a.scope.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
  return runScriptStep({ lens: a.lens, step: a.step, runId: a.runId, scope, root: typeof a.root === 'string' ? a.root : process.cwd(),
    structurePath: typeof a.structure === 'string' ? a.structure : undefined, dbPath: typeof a.db === 'string' ? a.db : undefined, env });
}

// run as a script: compare real paths, so a skills folder reached through a junction or symlink still runs
if (process.argv[1] && isEntry(process.argv[1], import.meta.url)) {
  try {
    const out = main(process.argv.slice(2));
    if (out?.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  } catch (e) {
    process.stderr.write(`steps: ${e.message}\n`);
    process.exit(e instanceof StoreError ? e.code : 1);
  }
}

function isEntry(argv1, url) {
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}
