#!/usr/bin/env node
// lens-scan store - the only writer of <repo>/.ai/lens-scan/scan.db, so the agent never writes SQL.
// The DDL is ../references/store.sql (user_version 1); this script applies it to a fresh file and
// refuses a file it does not know. Every subcommand prints JSON on stdout; errors go to stderr with
// exit 2 (bad input) or 1 (refused by a store rule). NULL columns are never printed.
//
//   node store.mjs [--db <path>] <subcommand> [flags]        (--db default .ai/lens-scan/scan.db)
//   init
//   run-start --phase measure|propose|execute|propagate --lenses a,b [--scope <json>] [--model m] [--note t]
//   run-end --run <id> --status done|failed|aborted [--note t]
//   activity --run <id> --kind <k> --text <t> [--feature f] [--lens l]
//   measure --run <id> --feature f --lens l --metric m --value <num> [--unit u] [--method m] [--evidence e]
//   measure --run <id> --json <file>          (array of {feature, lens, metric, value, unit?, method?, evidence?})
//   propose --run <id> --feature f --lens l --title t --kind fix|baseline-upgrade|propagation
//           [--metric m] [--body-file p] [--standard s] [--expected-delta n] [--size XS..XL] [--risk 1-10] [--parent id]
//   proposals [--status s] [--feature f] [--kind k]
//   proposal-update --id <id> [--status executing|done|failed] [--after-value n] [--result-sha sha]
//   shot --run <id> --feature f --path <rel to store dir> [--size s] [--theme t] [--module m] [--report-file p]
//   coverage --run <id> --feature f --standard s --state conformant|deviation|not-applicable|unknown [--evidence e]
//   latest [--feature f] [--lens l]           latest measurement per (feature, lens, metric)
//
// Store rules this script owns (SKILL.md and references/metrics.md explain why):
//  - a measurement is a finite number; an unmeasurable metric gets NO row (never a 0 placeholder);
//  - writes go only into a run whose status is `running`;
//  - `approved` and `declined` are human decisions written by the review UI, never by this CLI;
//  - every write bumps runs.updated_at (or proposals.updated_at), the cursor the review UI polls.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, isAbsolute, normalize, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DDL_PATH = resolve(HERE, '../references/store.sql');
export const DEFAULT_DB = '.ai/lens-scan/scan.db';
const SCHEMA_VERSION = 1;

export const PHASES = ['measure', 'propose', 'execute', 'propagate'];
export const RUN_END = ['done', 'failed', 'aborted'];
export const METHODS = ['static', 'probe', 'harness', 'judgement'];
export const KINDS = ['fix', 'baseline-upgrade', 'propagation'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
export const ACTIVITY = ['reading', 'measured', 'proposed', 'executing', 'committed', 'note', 'error'];
export const COVERAGE = ['conformant', 'deviation', 'not-applicable', 'unknown'];
// The skill may move an approved item through execution; it may never decide one.
const SKILL_STATUS = { executing: ['approved'], done: ['executing', 'approved'], failed: ['executing', 'approved'] };
// A metric key is a lens field key (lens-manifest/1 fieldKey: camelCase).
const METRIC_RE = /^[a-z][A-Za-z0-9]*$/;
// '<subject>/<technique>' | 'house:<subject>/<technique>' | 'none'
const STANDARD_RE = /^(?:none|(?:house:)?[a-z0-9][a-z0-9.-]*\/[a-z0-9][a-z0-9.-]*)$/;

export class StoreError extends Error {
  constructor(message, code = 1) { super(message); this.code = code; }
}
const bad = (m) => { throw new StoreError(m, 2); };
const refuse = (m) => { throw new StoreError(m, 1); };

const now = () => new Date().toISOString();
/** The row without NULL/undefined columns: absent is omitted, never null. */
export const clean = (row) => {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) if (v !== null && v !== undefined) out[k] = v;
  return out;
};
const pad = (n) => String(n).padStart(2, '0');
export const runId = (d = new Date()) =>
  `r-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}-${randomBytes(2).toString('hex')}`;
export const proposalId = () => `p-${randomBytes(3).toString('hex')}`;

/** The skill's own version, stamped on every run so a measurement can be traced to the method. */
export function skillVersion() {
  try {
    const m = readFileSync(resolve(HERE, '../SKILL.md'), 'utf8').match(/^version:\s*(\S+)/m);
    return m ? m[1] : undefined;
  } catch { return undefined; }
}

// ------------------------------------------------------------------------------------- open
/** Opens (and on first use creates) the store. `readOnly` never creates and never migrates. */
export function openStore(dbPath = DEFAULT_DB, { readOnly = false } = {}) {
  if (readOnly) {
    if (!existsSync(dbPath)) return null;
    const db = new DatabaseSync(dbPath, { readOnly: true });
    assertVersion(db, dbPath);
    return db;
  }
  mkdirSync(dirname(resolve(dbPath)), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA busy_timeout = 5000');
  const v = db.prepare('PRAGMA user_version').get().user_version;
  if (v === 0) db.exec(readFileSync(DDL_PATH, 'utf8'));
  else db.exec('PRAGMA journal_mode = WAL');
  assertVersion(db, dbPath);
  return db;
}
function assertVersion(db, dbPath) {
  const v = db.prepare('PRAGMA user_version').get().user_version;
  if (v !== SCHEMA_VERSION) { db.close(); refuse(`${dbPath}: store schema v${v}, this script knows v${SCHEMA_VERSION} - upgrade the skill, never hand-migrate`); }
}

// ------------------------------------------------------------------------------------- guards
const oneOf = (name, v, set) => { if (!set.includes(v)) bad(`--${name} must be one of ${set.join(', ')} (got ${JSON.stringify(v)})`); return v; };
const need = (name, v) => { if (v === undefined || v === null || v === '' || v === true) bad(`--${name} is required`); return String(v); };
const num = (name, v) => {
  if (v === undefined || v === null) return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  if (v === '' || v === true || !Number.isFinite(n)) bad(`--${name} must be a finite number (got ${JSON.stringify(v)}); an unmeasurable value gets no row, never a placeholder`);
  return n;
};
const standard = (s) => { if (!STANDARD_RE.test(s)) bad(`standard must be '<subject>/<technique>', 'house:<subject>/<technique>' or 'none' (got ${JSON.stringify(s)})`); return s; };
function liveRun(db, id) {
  const run = db.prepare('SELECT id, status FROM runs WHERE id = ?').get(need('run', id));
  if (!run) refuse(`run ${id} does not exist`);
  if (run.status !== 'running') refuse(`run ${id} is ${run.status}; writes go only into a running run`);
  return run.id;
}
const touchRun = (db, id, at) => db.prepare('UPDATE runs SET updated_at = ? WHERE id = ?').run(at, id);

// ------------------------------------------------------------------------------------- writes
export function runStart(db, { phase, lenses, scope, model, note } = {}) {
  oneOf('phase', phase, PHASES);
  const list = (Array.isArray(lenses) ? lenses : String(need('lenses', lenses)).split(',')).map((s) => s.trim()).filter(Boolean);
  if (!list.length) bad('--lenses names at least one lens');
  let scopeJson;
  if (scope !== undefined) {
    try { scopeJson = JSON.stringify(typeof scope === 'string' ? JSON.parse(scope) : scope); } catch { bad('--scope must be JSON'); }
  }
  const at = now();
  const id = runId();
  db.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses, scope, skill_version, model, note)
    VALUES (?, ?, ?, ?, 'running', ?, ?, ?, ?, ?)`).run(id, at, at, phase, JSON.stringify(list), scopeJson ?? null, skillVersion() ?? null, model ?? null, note ?? null);
  return { id };
}

export function runEnd(db, { run, status, note } = {}) {
  oneOf('status', status, RUN_END);
  const id = liveRun(db, run);
  const at = now();
  db.prepare('UPDATE runs SET status = ?, ended_at = ?, updated_at = ?, note = COALESCE(?, note) WHERE id = ?').run(status, at, at, note ?? null, id);
  return getRun(db, id);
}

export const getRun = (db, id) => {
  const r = clean(db.prepare('SELECT * FROM runs WHERE id = ?').get(id));
  if (r?.lenses) r.lenses = JSON.parse(r.lenses);
  if (r?.scope) r.scope = JSON.parse(r.scope);
  return r;
};

export function activity(db, { run, kind, text, feature, lens } = {}) {
  oneOf('kind', kind, ACTIVITY);
  const id = liveRun(db, run);
  const at = now();
  const r = db.prepare('INSERT INTO activity (run_id, at, feature, lens, kind, text) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, at, feature ?? null, lens ?? null, kind, need('text', text));
  touchRun(db, id, at);
  return { id: Number(r.lastInsertRowid) };
}

/** Appends measurements (one object or an array) in one transaction. Returns the row ids. */
export function measure(db, run, rows) {
  const id = liveRun(db, run);
  const list = Array.isArray(rows) ? rows : [rows];
  if (!list.length) bad('nothing to measure');
  const at = now();
  const ins = db.prepare(`INSERT INTO measurements (run_id, feature, lens, metric, value, unit, method, evidence, measured_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const ids = [];
  db.exec('BEGIN');
  try {
    for (const m of list) {
      const metric = need('metric', m.metric);
      if (!METRIC_RE.test(metric)) bad(`metric ${JSON.stringify(metric)} is not a lens field key (camelCase)`);
      if (m.method !== undefined) oneOf('method', m.method, METHODS);
      const value = num('value', m.value);
      if (value === undefined) bad('--value is required');
      const r = ins.run(id, need('feature', m.feature), need('lens', m.lens), metric, value, m.unit ?? null, m.method ?? null, m.evidence ?? null, at);
      ids.push(Number(r.lastInsertRowid));
    }
    touchRun(db, id, at);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return { ids, measured_at: at };
}

export function propose(db, o = {}) {
  const run = liveRun(db, o.run);
  const kind = oneOf('kind', o.kind, KINDS);
  const std = standard(o.standard ?? 'none');
  if (o.size !== undefined) oneOf('size', o.size, SIZES);
  const risk = num('risk', o.risk);
  if (risk !== undefined && (!Number.isInteger(risk) || risk < 1 || risk > 10)) bad('--risk is an integer 1-10');
  if (o.metric !== undefined && !METRIC_RE.test(o.metric)) bad(`metric ${JSON.stringify(o.metric)} is not a lens field key (camelCase)`);
  const delta = num('expected-delta', o.expectedDelta);
  if (kind === 'fix' && (o.metric === undefined || delta === undefined)) bad('a fix names the metric it moves and the expected delta (--metric, --expected-delta)');
  if (o.parent !== undefined) {
    const p = db.prepare('SELECT kind FROM proposals WHERE id = ?').get(o.parent);
    if (!p) refuse(`parent ${o.parent} does not exist`);
    if (kind === 'propagation' && p.kind !== 'baseline-upgrade') refuse(`a propagation's parent is a baseline-upgrade (${o.parent} is a ${p.kind})`);
  } else if (kind === 'propagation') bad('a propagation names its baseline-upgrade (--parent)');
  const body = o.body ?? (o.bodyFile !== undefined ? readFileSync(o.bodyFile, 'utf8') : undefined);
  const at = now();
  let id;
  for (let i = 0; i < 8 && (!id || db.prepare('SELECT 1 FROM proposals WHERE id = ?').get(id)); i += 1) id = proposalId();
  db.prepare(`INSERT INTO proposals (id, run_id, feature, lens, metric, title, body, standard, expected_delta, size, risk, kind, parent_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'proposed', ?, ?)`).run(
    id, run, need('feature', o.feature), need('lens', o.lens), o.metric ?? null, need('title', o.title), body ?? null, std,
    delta ?? null, o.size ?? null, risk ?? null, kind, o.parent ?? null, at, at);
  touchRun(db, run, at);
  return { id };
}

export function proposals(db, { status, feature, kind } = {}) {
  const where = [], args = [];
  if (status !== undefined) { where.push('status = ?'); args.push(status); }
  if (feature !== undefined) { where.push('feature = ?'); args.push(feature); }
  if (kind !== undefined) { where.push('kind = ?'); args.push(kind); }
  const sql = `SELECT * FROM proposals${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at, id`;
  return db.prepare(sql).all(...args).map(clean);
}

export function proposalUpdate(db, { id, status, afterValue, resultSha } = {}) {
  const p = db.prepare('SELECT * FROM proposals WHERE id = ?').get(need('id', id));
  if (!p) refuse(`proposal ${id} does not exist`);
  if (status === 'approved' || status === 'declined') refuse(`'${status}' is a human decision the review UI records; the skill never decides a proposal`);
  if (status !== undefined) {
    oneOf('status', status, Object.keys(SKILL_STATUS));
    if (!SKILL_STATUS[status].includes(p.status)) refuse(`proposal ${id} is ${p.status}; it cannot move to ${status}`);
  }
  const after = num('after-value', afterValue);
  if (status === undefined && after === undefined && resultSha === undefined) bad('nothing to update (--status, --after-value, --result-sha)');
  db.prepare(`UPDATE proposals SET status = COALESCE(?, status), after_value = COALESCE(?, after_value),
    result_sha = COALESCE(?, result_sha), updated_at = ? WHERE id = ?`).run(status ?? null, after ?? null, resultSha ?? null, now(), p.id);
  return clean(db.prepare('SELECT * FROM proposals WHERE id = ?').get(p.id));
}

export function shot(db, { run, feature, path, size, theme, module, report, reportFile } = {}) {
  const id = liveRun(db, run);
  const rel = need('path', path).replace(/\\/g, '/');
  if (isAbsolute(rel) || /^[A-Za-z]:/.test(rel) || normalize(rel).replace(/\\/g, '/').split('/').includes('..')) bad(`--path is relative to the store dir and stays inside it (got ${JSON.stringify(path)})`);
  let rep = report;
  if (rep === undefined && reportFile !== undefined) {
    try { rep = JSON.parse(readFileSync(reportFile, 'utf8')); } catch (e) { bad(`--report-file is not readable JSON (${e.message})`); }
  }
  const at = now();
  const r = db.prepare('INSERT INTO shots (run_id, feature, path, size, theme, harness_module, captured_at, report) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, need('feature', feature), rel, size ?? null, theme ?? null, module ?? null, at, rep === undefined ? null : JSON.stringify(rep));
  touchRun(db, id, at);
  return { id: Number(r.lastInsertRowid) };
}

export function coverage(db, { run, feature, standard: std, state, evidence } = {}) {
  const id = liveRun(db, run);
  oneOf('state', state, COVERAGE);
  const s = standard(need('standard', std));
  if (s === 'none') bad("coverage is judged against a standard; 'none' has nothing to conform to");
  const at = now();
  db.prepare(`INSERT INTO coverage (feature, standard, state, evidence, judged_at, run_id) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (feature, standard) DO UPDATE SET state = excluded.state, evidence = excluded.evidence,
    judged_at = excluded.judged_at, run_id = excluded.run_id`).run(need('feature', feature), s, state, evidence ?? null, at, id);
  touchRun(db, id, at);
  return clean(db.prepare('SELECT * FROM coverage WHERE feature = ? AND standard = ?').get(feature, s));
}

/** The latest measurement per (feature, lens, metric): newest measured_at, then newest id. */
export function latest(db, { feature, lens } = {}) {
  const where = [], args = [];
  if (feature !== undefined) { where.push('feature = ?'); args.push(feature); }
  if (lens !== undefined) { where.push('lens = ?'); args.push(lens); }
  const sql = `SELECT id, run_id, feature, lens, metric, value, unit, method, evidence, measured_at FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY feature, lens, metric ORDER BY measured_at DESC, id DESC) AS rn FROM measurements
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}) WHERE rn = 1 ORDER BY feature, lens, metric`;
  return db.prepare(sql).all(...args).map(clean);
}

// ------------------------------------------------------------------------------------- cli
/** `--key value` pairs; a flag with no value is `true`. Kebab keys become camelCase. */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const next = argv[i + 1];
    if (next === undefined || (next.startsWith('--') && !/^--?\d/.test(next))) out[key] = true;
    else { out[key] = next; i += 1; }
  }
  return out;
}

const HELP = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^#!.*\n/, '').replace(/^\/\/ ?/gm, '');

export function main(argv) {
  const a = parseArgs(argv);
  const cmd = a._[0];
  if (!cmd || a.help) return { help: HELP };
  const db = openStore(typeof a.db === 'string' ? a.db : DEFAULT_DB);
  try {
    switch (cmd) {
      case 'init': return { db: resolve(typeof a.db === 'string' ? a.db : DEFAULT_DB), user_version: SCHEMA_VERSION };
      case 'run-start': return runStart(db, { phase: a.phase, lenses: a.lenses, scope: a.scope, model: a.model, note: a.note });
      case 'run-end': return runEnd(db, { run: a.run, status: a.status, note: a.note });
      case 'activity': return activity(db, a);
      case 'measure': {
        let rows;
        if (a.json !== undefined) {
          try { rows = JSON.parse(readFileSync(String(a.json), 'utf8')); } catch (e) { bad(`--json is not readable JSON (${e.message})`); }
          if (!Array.isArray(rows)) bad('--json holds an array of measurements');
        } else rows = { feature: a.feature, lens: a.lens, metric: a.metric, value: a.value, unit: a.unit, method: a.method, evidence: a.evidence };
        const r = measure(db, a.run, rows);
        const list = Array.isArray(rows) ? rows : [rows];
        const feats = [...new Set(list.map((m) => m.feature))];
        activity(db, { run: a.run, kind: 'measured', feature: feats.length === 1 ? feats[0] : undefined,
          lens: new Set(list.map((m) => m.lens)).size === 1 ? list[0].lens : undefined,
          text: list.length === 1 ? `${list[0].metric} = ${list[0].value}${list[0].unit ? ` ${list[0].unit}` : ''}` : `${list.length} measurements over ${feats.length} feature(s)` });
        return r;
      }
      case 'propose': {
        const r = propose(db, { ...a, expectedDelta: a.expectedDelta });
        activity(db, { run: a.run, kind: 'proposed', feature: a.feature, lens: a.lens, text: String(a.title) });
        return r;
      }
      case 'proposals': return proposals(db, a);
      case 'proposal-update': return proposalUpdate(db, a);
      case 'shot': return shot(db, a);
      case 'coverage': return coverage(db, a);
      case 'latest': return latest(db, a);
      default: bad(`unknown subcommand ${JSON.stringify(cmd)} - run with --help`);
    }
  } finally { db.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const out = main(process.argv.slice(2));
    if (out?.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  } catch (e) {
    process.stderr.write(`store: ${e.message}\n`);
    process.exit(e instanceof StoreError ? e.code : 1);
  }
}
