#!/usr/bin/env node
// lens-scan store - the only writer of <repo>/.ai/lens-scan/scan.db, so the agent never writes SQL.
// The DDL is ../references/store.sql (user_version 5); this script applies it to a fresh file, migrates
// a v1, v2 or v3 file in place (one transaction per step, on any open, read-only ones included) and refuses a file it
// does not know. Every subcommand prints JSON on stdout; errors go to stderr with exit 2 (bad input) or 1 (refused by
// a store rule) - a refusal that names an existing row also prints {"refused", "existing"} on stdout. NULL columns
// are never printed. The read subcommands (proposals, latest, gaps, packs, releases, release, release-items, compare)
// never create the store: with no file they answer as an empty one would.
//
//   node store.mjs [--db <path>] <subcommand> [flags]        (--db default .ai/lens-scan/scan.db)
//   init
//   run-start --phase measure|propose|execute|propagate --lenses a,b [--scope <json> | --features a,b,c]
//             [--structure <app-structure.json>] [--model m] [--note t]
//             --features is the scope {"features":[...]}; a scope naming features (either way) is checked
//             against the structure (default: app-structure.json beside the db) and an unknown slug is
//             refused before any run row exists. BP_JOB_ID in the environment makes the note
//             `bp-job:<id>` (`bp-job:<id> · <note>` with --note): how the blueprint finds its job's run.
//   run-end --run <id> --status done|failed|aborted [--note t]   (--note replaces the note, keeping a bp-job: prefix)
//   activity --run <id> --kind <k> --text <t> [--feature f] [--lens l]
//   measure --run <id> --feature f --lens l --metric m --value <num> [--unit u] [--method m] [--evidence e]
//           [--proposal p --phase before|after] [--commit-sha s]
//   measure --run <id> --json <file>          (array of {feature, lens, metric, value, unit?, method?, evidence?,
//                                              proposal?, phase?, commit_sha?})
//             --proposal and --phase go together: the reading is that item's before/after evidence. An `after`
//             reading is taken on the pack branch, so `latest` and `gaps` never count it as the feature's state.
//   propose --run <id> --feature f --lens l --title t --kind fix|baseline-upgrade|propagation|work-item
//           [--metric m] [--body-file p] [--standard s] [--expected-delta n] [--size XS..XL] [--risk 1-10] [--parent id]
//           [--origin scan|ado|sweep] [--external-ref <origin>:<id>] [--external-url u] [--tier 0-3] [--risk-class c]
//             (v4) a work-item is an imported item: no metric or delta, an --origin other than scan and an
//             --external-ref. A duplicate --external-ref is refused (exit 1) with {"refused", "existing": <id>} on
//             stdout, so an importer updates the existing item instead. `risk` is the risk of the CHANGE; how bad
//             the PROBLEM is goes in --tier (0 stop-ship .. 3 backlog) and --risk-class (references/triage.md).
//   proposals [--status s] [--feature f] [--kind k] [--pack k] [--release rel] [--origin o] [--tier n | --untriaged]
//             [--ids a,b]
//             ordered by tier (untriaged last), then created_at, id (--ids: those ids only, in that order)
//   rank --id <id> --tier 0-3 --risk-class secret|authz|money|data|llm|perf|reliability|ux|debt [--by <kind:name>] [--note t]
//             (v4) an item's severity, at any status: sets tier, risk_class, ranked_by, ranked_at (--note goes to
//             triage_note). -> {id, tier, risk_class}
//   update-external --id <id> [--title t] [--body-file p] [--external-url u]
//             (v4) an importer refreshes an imported item's text; refused for an origin-scan item
//   proposal-update --id <id> [--status executing|done|failed] [--after-value n] [--result-sha sha]
//             [--commit-sha sha] [--pack k] [--attempt-of p] [--release rel]
//             --pack names an open pack; a person's triage moves (accepted, rework, descoped) and `released`
//             are never proposal-update's
//   shot --run <id> --feature f --path <rel to store dir> [--size s] [--theme t] [--module m] [--report-file p]
//        [--proposal p --phase before|after]
//   coverage --run <id> --feature f --standard s --state conformant|deviation|not-applicable|unknown [--evidence e]
//   latest [--feature f] [--lens l]           latest measurement per (feature, lens, metric)
//   gaps --lens l [--structure <app-structure.json>]
//             what a caller still has to do for one lens: per feature, the lens's metrics with no reading
//             (`unmeasured`: no done measure run of this lens covered the feature yet; `unmeasurable`: one
//             did and wrote nothing - a "?" a re-run will not fill), readings older than the context map
//             the structure was built over (`provenance.context_map_generated_at`)
//             (`stale`), and the lens's backlog by status. Reads only.
//   decide --ids a,b --decision approve|decline --by <kind:name> [--note t]
//             a caller's decision on `proposed` items, recorded as decided_by <kind:name> (`operator:jane`,
//             `agent:personas`): the door a headless caller uses where no review UI runs. The skill itself
//             never calls it; drive.mjs calls it only on its caller's --approve-proposed.
//
// The release train (v2): execute builds approved items into a pack, a person triages them, a release ships.
//   pack-create --lens <id> --short <DES> --base-ref <r> --base-sha <s> [--run r]
//             the next pack of that lens: {id: k-des-<n>, n, branch: pack/des-<n>}, status open
//   pack-update --pack k --status open|triaged|closed [--from s]
//             compare-and-set: open->triaged|closed, triaged->open|closed; --from states the status expected
//   packs [--lens l] [--status s]              packs, each with `items` {status: count}
//   triage --ids a,b --decision accept|rework|descope|reopen --by <kind:name> [--note t]
//             a person's call on built items, each a compare-and-set: accept done|failed (failed only with a
//             --note, else skipped `note-required`); rework done|failed|accepted; descope
//             done|failed|accepted|rework|proposed|approved. An item already in a release that is past draft is
//             skipped `in-release`; one in a draft release leaves it, and so does a rework by `skill:*` while the
//             release is building (the release run's cherry-pick conflict). A pack none of whose items is executing,
//             done or failed any more moves open -> triaged in the same transaction. Every move records the
//             status it left in `triaged_from` (v3).
//             reopen (the undo): accepted|rework|descoped -> its triaged_from, clearing the note, triaged_from and a
//             draft release. Skipped `no-prior-status` (nothing recorded), `in-release` (its release left draft),
//             `rebuilt` (a rework item whose rebuild exists) or `pack-closed`. An item back at done|failed moves
//             its triaged pack -> open (packs_reopened). The answer's decision is `reopened`.
//             -> {decision, by, triaged: [ids], skipped: [{id, status, reason?}], packs_triaged: [ids], packs_reopened?: [ids]}
//   rework-attempt --id <p in rework> --run <running run>
//             a fresh `approved` copy of the item (attempt_of = it, no pack, sha or after-value, the decision
//             copied) to rebuild; the old row stays `rework`. One attempt per reworked item. -> {id, attempt_of}
//   release-create --version 1.4.1 --by <kind:name> [--base-sha s]      a draft rel-1.4.1 on release/1.4.1
//   release-add --release rel-x --ids a,b
//             `accepted` items with no release join it, while it is draft or building
//             -> {release, added: [ids], skipped: [{id, status, reason?}]}
//   release-update --release rel-x [--status s] [--from s] [--pr-url u] [--tag t] [--notes t] [--error t] [--base-sha s]
//             compare-and-set: draft->building->pr-open->merged->tagged, any state but tagged ->failed. On
//             merged -> tagged (tag defaults to v<version>) the release's accepted items become `released` and
//             every pack whose items are all settled is closed, in one transaction. Settled: released, descoped or
//             declined, or a `rework` item whose rebuild (attempt_of = it) is itself settled - so the pack of a
//             reworked item closes once its rebuild ships, from whichever pack the rebuild was built in.
//   releases [--status s]                      releases, newest first
//   release --id rel-x | release-items --release rel-x
//             one release with its items | the items alone
//   compare --ids a,b | --pack k
//             per item: {proposal, before: [measurements], after: [measurements], shots: [{theme?, size?,
//             before?, after?}]} - shots paired by (theme, size), the latest capture of each phase. Reads only.
//
// Store rules this script owns (SKILL.md and references/metrics.md explain why):
//  - a measurement is a finite number; an unmeasurable metric gets NO row (never a 0 placeholder);
//  - writes go only into a run whose status is `running`;
//  - `approved` and `declined` are decisions the review UI or a caller's `decide --by` writes, never proposal-update;
//  - every status move is a compare-and-set on the status it read, so two executors never build one item;
//  - every write bumps runs.updated_at (or proposals.updated_at), the cursor the review UI polls.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DDL_PATH = resolve(HERE, '../references/store.sql');
export const DEFAULT_DB = '.ai/lens-scan/scan.db';
const SCHEMA_VERSION = 5;

export const PHASES = ['measure', 'propose', 'execute', 'propagate'];
export const RUN_END = ['done', 'failed', 'aborted'];
export const METHODS = ['static', 'probe', 'harness', 'judgement'];
export const KINDS = ['fix', 'baseline-upgrade', 'propagation', 'work-item'];
// v4: where an item came from, and the severity of the problem it addresses (never the change's `risk`)
export const ORIGINS = ['scan', 'ado', 'sweep'];
export const RISK_CLASSES = ['secret', 'authz', 'money', 'data', 'llm', 'perf', 'reliability', 'ux', 'debt'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
export const ACTIVITY = ['reading', 'measured', 'proposed', 'executing', 'committed', 'note', 'error'];
export const COVERAGE = ['conformant', 'deviation', 'not-applicable', 'unknown'];
export const PHASE = ['before', 'after'];
export const PACK_STATUS = ['open', 'triaged', 'closed'];
// every status a proposal can hold (the DDL's CHECK): a filter outside it is a typo, never an empty answer
export const PROPOSAL_STATUS = ['proposed', 'approved', 'declined', 'executing', 'done', 'failed', 'accepted', 'rework', 'descoped', 'released'];
export const RELEASE_STATUS = ['draft', 'building', 'pr-open', 'merged', 'tagged', 'failed'];
// a person's triage of a built item: decision -> [target status, the statuses it may come from]. reopen's target
// is each item's own triaged_from (null here).
const TRIAGE = {
  accept: ['accepted', ['done', 'failed']],
  rework: ['rework', ['done', 'failed', 'accepted']],
  descope: ['descoped', ['done', 'failed', 'accepted', 'rework', 'proposed', 'approved']],
  reopen: [null, ['accepted', 'rework', 'descoped']],
};
// compare-and-set chains: target -> the statuses it may come from
const PACK_MOVE = { triaged: ['open'], open: ['triaged'], closed: ['open', 'triaged'] };
const RELEASE_MOVE = { building: ['draft', 'failed'], 'pr-open': ['building'], merged: ['pr-open'], tagged: ['merged'], failed: ['draft', 'building', 'pr-open', 'merged'] };
// statuses only a person's triage or a release writes; proposal-update never does
const NOT_SKILL = ['accepted', 'rework', 'descoped', 'released'];
// The skill may move an approved item through execution; it may never decide one.
const SKILL_STATUS = { executing: ['approved'], done: ['executing', 'approved'], failed: ['executing', 'approved'] };
// A metric key is a lens field key (lens-manifest/1 fieldKey: camelCase).
const METRIC_RE = /^[a-z][A-Za-z0-9]*$/;
// '<subject>/<technique>' | 'house:<subject>/<technique>' | 'none'
const STANDARD_RE = /^(?:none|(?:house:)?[a-z0-9][a-z0-9.-]*\/[a-z0-9][a-z0-9.-]*)$/;

export class StoreError extends Error {
  /** `detail`, when given, is printed as JSON on stdout by the cli (e.g. {refused, existing}). */
  constructor(message, code = 1, detail = undefined) { super(message); this.code = code; if (detail !== undefined) this.detail = detail; }
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
/**
 * Opens (and on first use creates) the store, migrating an older schema in place. `readOnly` never creates;
 * it reads an older file only after a short write connection has migrated it, so a reader never sees v1.
 */
export function openStore(dbPath = DEFAULT_DB, { readOnly = false } = {}) {
  if (readOnly) {
    if (!existsSync(dbPath)) return null;
    let db = new DatabaseSync(dbPath, { readOnly: true });
    db.exec('PRAGMA busy_timeout = 5000'); // the write path waits too; a read that replaced a write open keeps the wait
    const v =db.prepare('PRAGMA user_version').get().user_version;
    if (v > 0 && v < SCHEMA_VERSION) { db.close(); openStore(dbPath).close(); db = new DatabaseSync(dbPath, { readOnly: true }); }
    assertVersion(db, dbPath);
    return db;
  }
  mkdirSync(dirname(resolve(dbPath)), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA busy_timeout = 5000');
  // Parallel runs (the blueprint starts up to 3) may open a new store together. Switching a new file to WAL can
  // answer SQLITE_BUSY without the busy handler, so it retries; the DDL sets user_version before its tables, so it
  // runs in one IMMEDIATE transaction that re-reads the version - nobody sees v1 without the tables.
  for (let i = 0; ; i++) {
    try { db.exec('PRAGMA journal_mode = WAL'); break; } catch (e) { if (e.errcode !== 5 || i >= 100) throw e; sleepSync(20 + Math.random() * 30); }
  }
  if (db.prepare('PRAGMA user_version').get().user_version === 0) {
    db.exec('BEGIN IMMEDIATE');
    try {
      if (db.prepare('PRAGMA user_version').get().user_version === 0) db.exec(readFileSync(DDL_PATH, 'utf8'));
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  if (db.prepare('PRAGMA user_version').get().user_version === 1) migrateV1(db);
  if (db.prepare('PRAGMA user_version').get().user_version === 2) migrateV2(db);
  if (db.prepare('PRAGMA user_version').get().user_version === 3) migrateV3(db);
  if (db.prepare('PRAGMA user_version').get().user_version === 4) migrateV4(db);
  assertVersion(db, dbPath);
  return db;
}

/**
 * v1 -> v4 (the current version) in place, in one IMMEDIATE transaction that re-reads the version (a second opener finds v3 and does
 * nothing). SQLite cannot widen a CHECK, so proposals is renamed aside, the current DDL creates the new proposals
 * (and packs, releases, the new indexes) and every row is copied; measurements and shots gain their columns
 * by ALTER first, so the DDL's CREATE IF NOT EXISTS finds them already in their v2 shape. Old rows get NULL.
 */
function migrateV1(db) {
  const fk = db.prepare('PRAGMA foreign_keys').get().foreign_keys;
  if (fk) db.exec('PRAGMA foreign_keys = OFF'); // a no-op inside a transaction, so set before BEGIN
  db.exec('BEGIN IMMEDIATE');
  try {
    if (db.prepare('PRAGMA user_version').get().user_version === 1) {
      const cols = db.prepare('PRAGMA table_info(proposals)').all().map((c) => `"${c.name}"`).join(', ');
      db.exec(`DROP INDEX IF EXISTS proposals_updated;
        ALTER TABLE proposals RENAME TO proposals_v1;
        ALTER TABLE measurements ADD COLUMN proposal_id TEXT;
        ALTER TABLE measurements ADD COLUMN phase TEXT CHECK (phase IN ('before', 'after'));
        ALTER TABLE measurements ADD COLUMN commit_sha TEXT;
        ALTER TABLE shots ADD COLUMN proposal_id TEXT;
        ALTER TABLE shots ADD COLUMN phase TEXT CHECK (phase IN ('before', 'after'));`);
      db.exec(readFileSync(DDL_PATH, 'utf8')); // sets the current user_version (4): proposals is born with the v3 and v4 columns
      // copied as they are: a v1 row's references are its own business, the migration neither checks nor fixes them
      db.exec(`INSERT INTO proposals (${cols}) SELECT ${cols} FROM proposals_v1; DROP TABLE proposals_v1;`);
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; } finally { if (fk) db.exec('PRAGMA foreign_keys = ON'); }
}
/**
 * v2 -> v3 in place: one nullable column, proposals.triaged_from, the status an item left at its latest triage (what
 * `triage --decision reopen` puts back). Additive, so an ALTER is enough; it lands as the table's last column, where
 * the v3 DDL declares it, so a migrated and a fresh file have one shape. One IMMEDIATE transaction that re-reads the
 * version: a second opener finds v3 and does nothing. Old rows get NULL (nothing to reopen to).
 */
function migrateV2(db) {
  db.exec('BEGIN IMMEDIATE');
  try {
    if (db.prepare('PRAGMA user_version').get().user_version === 2) {
      if (!db.prepare('PRAGMA table_info(proposals)').all().some((c) => c.name === 'triaged_from')) db.exec('ALTER TABLE proposals ADD COLUMN triaged_from TEXT');
      db.exec('PRAGMA user_version = 3');
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}
/**
 * v3 -> v4 in place: proposals gains origin, external_ref, external_url, tier, risk_class, ranked_by, ranked_at, and
 * its kind CHECK takes 'work-item'. SQLite cannot change a CHECK, so it is migrateV1's rebuild: foreign keys off for
 * the copy, one IMMEDIATE transaction that re-reads the version (a second opener finds v4 and does nothing), the
 * old proposals renamed aside, the DDL creates the v4 one (and its indexes), every v3 column is copied; the new
 * columns take their defaults (origin 'scan', the rest NULL: untriaged, unclassified).
 */
function migrateV3(db) {
  const fk = db.prepare('PRAGMA foreign_keys').get().foreign_keys;
  if (fk) db.exec('PRAGMA foreign_keys = OFF'); // a no-op inside a transaction, so set before BEGIN
  db.exec('BEGIN IMMEDIATE');
  try {
    if (db.prepare('PRAGMA user_version').get().user_version === 3) {
      const cols = db.prepare('PRAGMA table_info(proposals)').all().map((c) => `"${c.name}"`).join(', ');
      // the indexes move with a renamed table; drop them so the DDL creates them on the new one
      db.exec(`DROP INDEX IF EXISTS proposals_updated; DROP INDEX IF EXISTS proposals_pack; DROP INDEX IF EXISTS proposals_release;
        ALTER TABLE proposals RENAME TO proposals_v3;`);
      db.exec(readFileSync(DDL_PATH, 'utf8')); // sets user_version 4
      db.exec(`INSERT INTO proposals (${cols}) SELECT ${cols} FROM proposals_v3; DROP TABLE proposals_v3;`);
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; } finally { if (fk) db.exec('PRAGMA foreign_keys = ON'); }
}
/**
 * v4 -> v5 in place (scan-finding/1): proposals gains the contract columns, all additive, so ALTER is enough; they
 * land last, in the DDL's order, so a migrated and a fresh file have one shape. trust_events and the score index are
 * CREATE IF NOT EXISTS. One IMMEDIATE transaction that re-reads the version: a second opener finds v5 and does
 * nothing. Old rows take NULL (unscored, unpredicted) and the defaults band 'ranked', mvp 0.
 */
const V5_COLUMNS = [
  ['impact', 'INTEGER CHECK (impact BETWEEN 1 AND 10)'],
  ['impact_why', 'TEXT'],
  ['confidence', "TEXT CHECK (confidence IN ('low', 'medium', 'high'))"],
  ['effort', 'INTEGER CHECK (effort BETWEEN 1 AND 10)'],
  ['score', 'REAL'],
  ['score_parts', 'TEXT'],
  ['band', "TEXT NOT NULL DEFAULT 'ranked' CHECK (band IN ('ranked', 'reserve'))"],
  ['mvp', 'INTEGER NOT NULL DEFAULT 0 CHECK (mvp IN (0, 1))'],
  ['mvp_rule', "TEXT CHECK (mvp_rule IN ('top-score', 'override'))"],
  ['mvp_why', 'TEXT'],
  ['category', "TEXT CHECK (category IN ('technical', 'product'))"],
  ['predicted_verdict', "TEXT CHECK (predicted_verdict IN ('accept', 'reject', 'defer'))"],
  ['predicted_why', 'TEXT'],
  ['predicted_by', 'TEXT'],
  ['predicted_at', 'TEXT'],
  ['veto_until', 'TEXT'],
  ['proof', 'TEXT'],
];
function migrateV4(db) {
  db.exec('BEGIN IMMEDIATE');
  try {
    if (db.prepare('PRAGMA user_version').get().user_version === 4) {
      const have = new Set(db.prepare('PRAGMA table_info(proposals)').all().map((c) => c.name));
      for (const [name, decl] of V5_COLUMNS) if (!have.has(name)) db.exec(`ALTER TABLE proposals ADD COLUMN ${name} ${decl}`);
      db.exec(`CREATE INDEX IF NOT EXISTS proposals_score ON proposals (lens, band, score);
        CREATE TABLE IF NOT EXISTS trust_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, slice TEXT NOT NULL,
          from_level INTEGER NOT NULL CHECK (from_level BETWEEN 0 AND 3), to_level INTEGER NOT NULL CHECK (to_level BETWEEN 0 AND 3),
          reason TEXT NOT NULL, agreement REAL, n INTEGER, item_id TEXT REFERENCES proposals(id));
        CREATE INDEX IF NOT EXISTS trust_events_slice ON trust_events (slice, id);
        PRAGMA user_version = 5;`);
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}
function sleepSync(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
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
/** The blueprint correlates a job with its run by this note prefix (bp src/lib/scan/jobs.ts RUN_NOTE_PREFIX). */
export const BP_JOB_PREFIX = 'bp-job:';
const listOf = (v) => (Array.isArray(v) ? v : String(v).split(',')).map((s) => String(s).trim()).filter(Boolean);

/** The feature slugs of an app-structure file; null when there is none to read. */
export function structureFeatures(path) {
  if (!path || !existsSync(path)) return null;
  let s;
  try { s = JSON.parse(readFileSync(path, 'utf8')); } catch (e) { bad(`${path} is not readable JSON (${e.message})`); }
  return new Set((s.features ?? []).map((f) => f?.slug).filter((x) => typeof x === 'string'));
}

/**
 * Opens a run. `features` (array or comma list) is the scope {features: [...]}. A scope that names
 * features is checked against `knownFeatures` (a Set of slugs, or a function that reads one - called only
 * when a scope names features) before anything is written; without one the run is refused.
 * `env.BP_JOB_ID` prefixes the note with `bp-job:<id>`.
 */
export function runStart(db, { phase, lenses, scope, features, knownFeatures, model, note, env = process.env } = {}) {
  oneOf('phase', phase, PHASES);
  const list = (Array.isArray(lenses) ? lenses : String(need('lenses', lenses)).split(',')).map((s) => s.trim()).filter(Boolean);
  if (!list.length) bad('--lenses names at least one lens');
  let sc;
  if (scope !== undefined && features !== undefined) bad('--scope and --features are one scope; pass one of them');
  if (features !== undefined) {
    if (features === true) bad('--features names at least one feature slug');
    sc = { features: [...new Set(listOf(features))] };
  } else if (scope !== undefined) {
    try { sc = typeof scope === 'string' ? JSON.parse(scope) : scope; } catch { bad('--scope must be JSON'); }
  }
  if (sc?.features !== undefined) {
    if (!Array.isArray(sc.features) || !sc.features.length || !sc.features.every((f) => typeof f === 'string' && f)) bad('scope.features is a non-empty list of feature slugs');
    const known = typeof knownFeatures === 'function' ? knownFeatures() : knownFeatures;
    if (!known) bad('a feature scope is checked against the app-structure, and there is none (pass --structure <path>)');
    const unknown = sc.features.filter((f) => !known.has(f));
    if (unknown.length) bad(`unknown feature slug(s) in scope: ${unknown.join(', ')}`);
  }
  const job = typeof env?.BP_JOB_ID === 'string' ? env.BP_JOB_ID.trim() : '';
  const text = job ? `${BP_JOB_PREFIX}${job}${note ? ` · ${note}` : ''}` : note;
  const at = now();
  const id = runId();
  db.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses, scope, skill_version, model, note)
    VALUES (?, ?, ?, ?, 'running', ?, ?, ?, ?, ?)`).run(id, at, at, phase, JSON.stringify(list), sc === undefined ? null : JSON.stringify(sc), skillVersion() ?? null, model ?? null, text ?? null);
  return { id };
}

export function runEnd(db, { run, status, note } = {}) {
  oneOf('status', status, RUN_END);
  const id = liveRun(db, run);
  const at = now();
  // a closing note replaces the run's note, but never the job prefix the blueprint matches the run by
  const job = (db.prepare('SELECT note FROM runs WHERE id = ?').get(id).note ?? '').match(/^bp-job:\S+/)?.[0];
  const text = note !== undefined && job && !String(note).startsWith(job) ? `${job} · ${note}` : note;
  db.prepare('UPDATE runs SET status = ?, ended_at = ?, updated_at = ?, note = COALESCE(?, note) WHERE id = ?').run(status, at, at, text ?? null, id);
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
  const ins = db.prepare(`INSERT INTO measurements (run_id, feature, lens, metric, value, unit, method, evidence, measured_at, proposal_id, phase, commit_sha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const ids = [];
  db.exec('BEGIN');
  try {
    for (const m of list) {
      const metric = need('metric', m.metric);
      if (!METRIC_RE.test(metric)) bad(`metric ${JSON.stringify(metric)} is not a lens field key (camelCase)`);
      if (m.method !== undefined) oneOf('method', m.method, METHODS);
      const value = num('value', m.value);
      if (value === undefined) bad('--value is required');
      const link = linkage(db, m.proposal ?? m.proposal_id, m.phase);
      const sha = m.commitSha ?? m.commit_sha;
      if (sha !== undefined) need('commit-sha', sha);
      const r = ins.run(id, need('feature', m.feature), need('lens', m.lens), metric, value, m.unit ?? null, m.method ?? null, m.evidence ?? null, at,
        link.proposal ?? null, link.phase ?? null, sha ?? null);
      ids.push(Number(r.lastInsertRowid));
    }
    touchRun(db, id, at);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return { ids, measured_at: at };
}

/** A before/after link to one proposal: both or neither, the proposal must exist. */
function linkage(db, proposal, phase) {
  if (proposal === undefined && phase === undefined) return {};
  if (proposal === undefined || phase === undefined) bad('--proposal and --phase go together: a before/after reading belongs to one item');
  oneOf('phase', phase, PHASE);
  const id = need('proposal', proposal);
  if (!db.prepare('SELECT 1 FROM proposals WHERE id = ?').get(id)) refuse(`proposal ${id} does not exist`);
  return { proposal: id, phase };
}

/** A tier is an integer 0-3: 0 stop-ship .. 3 backlog (references/triage.md). */
const tierOf = (v) => {
  const t = num('tier', v);
  if (t !== undefined && (!Number.isInteger(t) || t < 0 || t > 3)) bad('--tier is an integer 0-3 (0 stop-ship .. 3 backlog)');
  return t;
};

export function propose(db, o = {}) {
  const run = liveRun(db, o.run);
  const kind = oneOf('kind', o.kind, KINDS);
  const origin = oneOf('origin', o.origin ?? 'scan', ORIGINS);
  const ref = o.externalRef === undefined ? undefined : need('external-ref', o.externalRef);
  if (kind === 'work-item' && (origin === 'scan' || ref === undefined)) bad('a work-item is imported: it names its --origin (ado, sweep, not scan) and its --external-ref');
  if (ref !== undefined && !(ref.startsWith(`${origin}:`) && ref.length > origin.length + 1)) bad(`--external-ref is '<origin>:<id>' (${origin}:<id> here, got ${JSON.stringify(ref)})`);
  const url = o.externalUrl === undefined ? undefined : need('external-url', o.externalUrl);
  const tier = tierOf(o.tier);
  if (o.riskClass !== undefined) oneOf('risk-class', o.riskClass, RISK_CLASSES);
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
  const feature = need('feature', o.feature), lens = need('lens', o.lens), title = need('title', o.title);
  // the duplicate check and the insert are one IMMEDIATE transaction: two importers never both insert one external_ref
  return tx(db, () => {
    if (ref !== undefined) {
      const dup = db.prepare('SELECT id FROM proposals WHERE external_ref = ?').get(ref);
      if (dup) throw new StoreError(`external ref ${ref} is already proposal ${dup.id}; update it instead`, 1, { refused: `duplicate external_ref ${ref}`, existing: dup.id });
    }
    const at = now();
    let id;
    for (let i = 0; i < 8 && (!id || db.prepare('SELECT 1 FROM proposals WHERE id = ?').get(id)); i += 1) id = proposalId();
    db.prepare(`INSERT INTO proposals (id, run_id, feature, lens, metric, title, body, standard, expected_delta, size, risk, kind, parent_id, status, created_at, updated_at,
        origin, external_ref, external_url, tier, risk_class)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'proposed', ?, ?, ?, ?, ?, ?, ?)`).run(
      id, run, feature, lens, o.metric ?? null, title, body ?? null, std,
      delta ?? null, o.size ?? null, risk ?? null, kind, o.parent ?? null, at, at,
      origin, ref ?? null, url ?? null, tier ?? null, o.riskClass ?? null);
    touchRun(db, run, at);
    return { id };
  });
}

/**
 * (v4) The severity of the problem an item addresses, at any status: tier and risk_class, who ranked it and when.
 * `note` goes to triage_note only when given. Never touches `risk` (the change's risk).
 */
export function rank(db, { id, tier, riskClass, by: who, note } = {}) {
  const pid = need('id', id);
  const t = tierOf(need('tier', tier));
  const rc = oneOf('risk-class', need('risk-class', riskClass), RISK_CLASSES);
  const ranker = who === undefined ? undefined : by(who);
  if (note !== undefined) need('note', note);
  const at = now();
  const r = db.prepare(`UPDATE proposals SET tier = ?, risk_class = ?, ranked_by = ?, ranked_at = ?, triage_note = COALESCE(?, triage_note), updated_at = ?
    WHERE id = ?`).run(t, rc, ranker ?? null, at, note ?? null, at, pid);
  if (!r.changes) refuse(`proposal ${pid} does not exist`);
  return { id: pid, tier: t, risk_class: rc };
}

/** (v4) An importer refreshes an imported item's title, body or link; an origin-scan item is the skill's own, never refreshed. */
export function updateExternal(db, { id, title, body, bodyFile, externalUrl } = {}) {
  const pid = need('id', id);
  if (title !== undefined) need('title', title);
  if (externalUrl !== undefined) need('external-url', externalUrl);
  const text = body ?? (bodyFile !== undefined ? readFileSync(need('body-file', bodyFile), 'utf8') : undefined);
  if ([title, text, externalUrl].every((v) => v === undefined)) bad('nothing to update (--title, --body-file, --external-url)');
  const p = db.prepare('SELECT origin FROM proposals WHERE id = ?').get(pid);
  if (!p) refuse(`proposal ${pid} does not exist`);
  if (p.origin === 'scan') refuse(`proposal ${pid} is the scan's own (origin scan); only an imported item is refreshed from its source`);
  db.prepare(`UPDATE proposals SET title = COALESCE(?, title), body = COALESCE(?, body), external_url = COALESCE(?, external_url), updated_at = ?
    WHERE id = ?`).run(title ?? null, text ?? null, externalUrl ?? null, now(), pid);
  return getProposal(db, pid);
}

/** Proposals by status, feature, kind, origin, tier (or `untriaged`: no tier), ordered by tier with untriaged last,
 *  then created_at, id; `ids` (array or comma list) keeps those ids only, in the order given - an id that is not in
 *  the result does not exist. */
export function proposals(db, { status, feature, kind, ids, pack, release, origin, tier, untriaged } = {}) {
  const where = [], args = [];
  if (origin !== undefined) { where.push('origin = ?'); args.push(oneOf('origin', origin, ORIGINS)); }
  if (tier !== undefined && untriaged !== undefined) bad('--tier and --untriaged are two answers to one question; pass one');
  if (tier !== undefined) { where.push('tier = ?'); args.push(tierOf(need('tier', tier))); }
  if (untriaged !== undefined && untriaged !== false) where.push('tier IS NULL');
  if (status !== undefined) { where.push('status = ?'); args.push(oneOf('status', status, PROPOSAL_STATUS)); }
  if (pack !== undefined) { where.push('pack_id = ?'); args.push(pack); }
  if (release !== undefined) { where.push('release_id = ?'); args.push(release); }
  if (feature !== undefined) { where.push('feature = ?'); args.push(feature); }
  if (kind !== undefined) { where.push('kind = ?'); args.push(oneOf('kind', kind, KINDS)); }
  let order;
  if (ids !== undefined) {
    order = [...new Set(listOf(ids === true ? '' : ids))];
    if (!order.length) bad('--ids names at least one proposal id');
    where.push(`id IN (${order.map(() => '?').join(', ')})`);
    args.push(...order);
  }
  const sql = `SELECT * FROM proposals${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY tier IS NULL, tier, created_at, id`;
  const rows = db.prepare(sql).all(...args).map(clean);
  return order ? rows.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)) : rows;
}

export function proposalUpdate(db, { id, status, afterValue, resultSha, commitSha, pack, attemptOf, release } = {}) {
  const p = db.prepare('SELECT * FROM proposals WHERE id = ?').get(need('id', id));
  if (!p) refuse(`proposal ${id} does not exist`);
  if (status === 'approved' || status === 'declined') refuse(`'${status}' is a human decision the review UI records; the skill never decides a proposal`);
  if (NOT_SKILL.includes(status)) refuse(`'${status}' is a person's triage or a release's move (triage, release-update); the skill never writes it`);
  if (status !== undefined) {
    oneOf('status', status, Object.keys(SKILL_STATUS));
    if (!SKILL_STATUS[status].includes(p.status)) refuse(`proposal ${id} is ${p.status}; it cannot move to ${status}`);
  }
  const after = num('after-value', afterValue);
  for (const [k, v] of [['result-sha', resultSha], ['commit-sha', commitSha], ['pack', pack], ['attempt-of', attemptOf], ['release', release]]) if (v !== undefined) need(k, v);
  if (pack !== undefined) {
    const k = db.prepare('SELECT status FROM packs WHERE id = ?').get(pack);
    if (!k) refuse(`pack ${pack} does not exist`);
    if (k.status !== 'open') refuse(`pack ${pack} is ${k.status}; items join an open pack only`);
  }
  if (attemptOf !== undefined) {
    if (attemptOf === p.id) bad('--attempt-of names the previous attempt, not the item itself');
    if (!db.prepare('SELECT 1 FROM proposals WHERE id = ?').get(attemptOf)) refuse(`proposal ${attemptOf} does not exist`);
  }
  if (release !== undefined && !db.prepare('SELECT 1 FROM releases WHERE id = ?').get(release)) refuse(`release ${release} does not exist`);
  if ([status, after, resultSha, commitSha, pack, attemptOf, release].every((v) => v === undefined)) {
    bad('nothing to update (--status, --after-value, --result-sha, --commit-sha, --pack, --attempt-of, --release)');
  }
  // compare-and-set on the status read above: a second executor that read the same `approved` row loses here
  const r = db.prepare(`UPDATE proposals SET status = COALESCE(?, status), after_value = COALESCE(?, after_value),
    result_sha = COALESCE(?, result_sha), commit_sha = COALESCE(?, commit_sha), pack_id = COALESCE(?, pack_id),
    attempt_of = COALESCE(?, attempt_of), release_id = COALESCE(?, release_id), updated_at = ? WHERE id = ? AND status = ?`)
    .run(status ?? null, after ?? null, resultSha ?? null, commitSha ?? null, pack ?? null, attemptOf ?? null, release ?? null, now(), p.id, p.status);
  if (r.changes === 0) refuse(`proposal ${id} moved on while this update ran (it was ${p.status}); someone else holds it`);
  return getProposal(db, p.id);
}
const getProposal = (db, id) => clean(db.prepare('SELECT * FROM proposals WHERE id = ?').get(id));

export function shot(db, { run, feature, path, size, theme, module, report, reportFile, proposal, phase } = {}) {
  const id = liveRun(db, run);
  const rel = need('path', path).replace(/\\/g, '/');
  if (isAbsolute(rel) || /^[A-Za-z]:/.test(rel) || normalize(rel).replace(/\\/g, '/').split('/').includes('..')) bad(`--path is relative to the store dir and stays inside it (got ${JSON.stringify(path)})`);
  const link = linkage(db, proposal, phase);
  let rep = report;
  if (rep === undefined && reportFile !== undefined) {
    try { rep = JSON.parse(readFileSync(reportFile, 'utf8')); } catch (e) { bad(`--report-file is not readable JSON (${e.message})`); }
  }
  const at = now();
  const r = db.prepare('INSERT INTO shots (run_id, feature, path, size, theme, harness_module, captured_at, report, proposal_id, phase) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, need('feature', feature), rel, size ?? null, theme ?? null, module ?? null, at, rep === undefined ? null : JSON.stringify(rep), link.proposal ?? null, link.phase ?? null);
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

/**
 * The latest measurement per (feature, lens, metric): newest measured_at, then newest id. An item's `after`
 * reading is taken on its pack branch, not the product's main line, so it never counts here.
 */
export function latest(db, { feature, lens } = {}) {
  const where = ["(phase IS NULL OR phase = 'before')"], args = [];
  if (feature !== undefined) { where.push('feature = ?'); args.push(feature); }
  if (lens !== undefined) { where.push('lens = ?'); args.push(lens); }
  const sql = `SELECT id, run_id, feature, lens, metric, value, unit, method, evidence, measured_at FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY feature, lens, metric ORDER BY measured_at DESC, id DESC) AS rn FROM measurements
      WHERE ${where.join(' AND ')}) WHERE rn = 1 ORDER BY feature, lens, metric`;
  return db.prepare(sql).all(...args).map(clean);
}

/** A decider is `<kind>:<name>` - who carries the decision when no review UI wrote it. */
const DECIDER_RE = /^[a-z][a-z-]*:[A-Za-z0-9._@-]+$/;

/**
 * A caller's decision on `proposed` items, each a compare-and-set: an item no longer `proposed` is reported,
 * never touched. Returns { decision, by, decided: [ids], skipped: [{ id, status }] } ('not-found' for a missing id).
 */
export function decide(db, { ids, decision, by, note } = {}) {
  const list = [...new Set(listOf(need('ids', ids)))];
  oneOf('decision', decision, ['approve', 'decline']);
  const who = need('by', by);
  if (!DECIDER_RE.test(who)) bad(`--by names who decides as <kind>:<name>, e.g. operator:jane or agent:personas (got ${JSON.stringify(who)})`);
  const to = decision === 'approve' ? 'approved' : 'declined';
  const at = now();
  const upd = db.prepare(`UPDATE proposals SET status = ?, decided_by = ?, decided_at = ?, decision_note = ?, updated_at = ?
    WHERE id = ? AND status = 'proposed'`);
  const decided = [], skipped = [];
  for (const id of list) {
    if (upd.run(to, who, at, note ?? null, at, id).changes) { decided.push(id); continue; }
    const p = db.prepare('SELECT status FROM proposals WHERE id = ?').get(id);
    skipped.push({ id, status: p ? p.status : 'not-found' });
  }
  return { decision: to, by: who, decided, skipped };
}

// ------------------------------------------------------------------------------------- the release train (v2)
const by = (v) => {
  const who = need('by', v);
  if (!DECIDER_RE.test(who)) bad(`--by names who decides as <kind>:<name>, e.g. operator:jane or agent:personas (got ${JSON.stringify(who)})`);
  return who;
};
/** Runs `fn` in one IMMEDIATE transaction: every compare-and-set in it and its side effects land together. */
function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const out = fn(); db.exec('COMMIT'); return out; } catch (e) { db.exec('ROLLBACK'); throw e; }
}
const getPack = (db, id) => clean(db.prepare('SELECT * FROM packs WHERE id = ?').get(id));
const getRelease = (db, id) => clean(db.prepare('SELECT * FROM releases WHERE id = ?').get(id));
const SHORT_RE = /^[A-Za-z][A-Za-z0-9]*$/;
const VERSION_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

/** Moves each pack open -> triaged once none of its items is executing, done or failed any more. */
function settlePacks(db, packIds, at) {
  const moved = [];
  for (const k of new Set(packIds)) {
    const left = db.prepare(`SELECT COUNT(*) AS n, SUM(status IN ('executing', 'done', 'failed')) AS busy FROM proposals WHERE pack_id = ?`).get(k);
    if (!left.n || left.busy) continue;
    if (db.prepare("UPDATE packs SET status = 'triaged', updated_at = ? WHERE id = ? AND status = 'open'").run(at, k).changes) moved.push(k);
  }
  return moved;
}

/** The next pack of a lens: n is one past the lens's highest, allocated inside the write transaction. */
export function packCreate(db, { lens, short, baseRef, baseSha, run } = {}) {
  const l = need('lens', lens);
  const sh = need('short', short);
  if (!SHORT_RE.test(sh)) bad(`--short is a letter then letters or digits, e.g. DES (got ${JSON.stringify(sh)})`);
  const ref = need('base-ref', baseRef), sha = need('base-sha', baseSha);
  if (run !== undefined && !db.prepare('SELECT 1 FROM runs WHERE id = ?').get(need('run', run))) refuse(`run ${run} does not exist`);
  return tx(db, () => {
    const n = db.prepare('SELECT COALESCE(MAX(n), 0) + 1 AS n FROM packs WHERE lens = ?').get(l).n;
    const s = sh.toLowerCase(), id = `k-${s}-${n}`, branch = `pack/${s}-${n}`;
    const taken = db.prepare('SELECT lens FROM packs WHERE id = ?').get(id);
    if (taken) refuse(`pack ${id} already belongs to lens ${taken.lens}; give lens ${l} a short of its own`);
    const at = now();
    db.prepare(`INSERT INTO packs (id, lens, n, branch, base_ref, base_sha, run_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`).run(id, l, n, branch, ref, sha, run ?? null, at, at);
    return { id, n, branch };
  });
}

/** A pack's status, compare-and-set on the status read (or on --from, when the caller states it). */
export function packUpdate(db, { pack, status, from } = {}) {
  const id = need('pack', pack);
  oneOf('status', status, PACK_STATUS);
  if (from !== undefined) oneOf('from', from, PACK_STATUS);
  const cur = db.prepare('SELECT status FROM packs WHERE id = ?').get(id);
  if (!cur) refuse(`pack ${id} does not exist`);
  const expect = from ?? cur.status;
  if (!PACK_MOVE[status].includes(expect)) refuse(`pack ${id}: ${expect} cannot move to ${status}`);
  if (!db.prepare('UPDATE packs SET status = ?, updated_at = ? WHERE id = ? AND status = ?').run(status, now(), id, expect).changes) {
    refuse(`pack ${id} is ${cur.status}, not ${expect}; it moved on`);
  }
  return getPack(db, id);
}

/** Packs, oldest first, each with its items counted by status. */
export function packs(db, { lens, status } = {}) {
  const where = [], args = [];
  if (lens !== undefined) { where.push('lens = ?'); args.push(lens); }
  if (status !== undefined) { where.push('status = ?'); args.push(oneOf('status', status, PACK_STATUS)); }
  const rows = db.prepare(`SELECT * FROM packs${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at, lens, n`).all(...args).map(clean);
  const count = db.prepare('SELECT status, COUNT(*) AS n FROM proposals WHERE pack_id = ? GROUP BY status');
  for (const k of rows) k.items = Object.fromEntries(count.all(k.id).map((r) => [r.status, r.n]));
  return rows;
}

/**
 * A person's triage of built items (see the header), each a compare-and-set on the status it read. Refused
 * moves land in `skipped` with the item's status, and a `reason` where the status alone does not say why.
 */
export function triage(db, { ids, decision, by: who, note } = {}) {
  const list = [...new Set(listOf(need('ids', ids)))];
  oneOf('decision', decision, Object.keys(TRIAGE));
  const person = by(who);
  if (note !== undefined && typeof note !== 'string') bad('--note needs a text');
  const text = typeof note === 'string' && note.trim() ? note : undefined;
  const reopen = decision === 'reopen';
  const [to, from] = TRIAGE[decision];
  return tx(db, () => {
    const at = now();
    const triaged = [], skipped = [], touched = [], reopened = [];
    const read = db.prepare(`SELECT p.status, p.pack_id, p.release_id, p.triaged_from, r.status AS rel, k.status AS pack FROM proposals p
      LEFT JOIN releases r ON r.id = p.release_id LEFT JOIN packs k ON k.id = p.pack_id WHERE p.id = ?`);
    const upd = db.prepare(`UPDATE proposals SET status = ?, triaged_by = ?, triaged_at = ?, triage_note = ?, triaged_from = ?, updated_at = ?,
      release_id = CASE WHEN ? THEN NULL ELSE release_id END WHERE id = ? AND status = ?`);
    const rebuilt = db.prepare('SELECT 1 FROM proposals WHERE attempt_of = ?');
    for (const id of list) {
      const p = read.get(id);
      if (!p) { skipped.push({ id, status: 'not-found' }); continue; }
      if (!from.includes(p.status)) { skipped.push({ id, status: p.status }); continue; }
      if (decision === 'accept' && p.status === 'failed' && !text) { skipped.push({ id, status: p.status, reason: 'note-required' }); continue; }
      if (reopen && p.triaged_from === null) { skipped.push({ id, status: p.status, reason: 'no-prior-status' }); continue; }
      // leaving `accepted` takes the item out of its release while that is still a draft, never later
      const leaves = decision !== 'accept' && p.release_id !== null;
      // a person takes an item out of a draft release only; the release run itself (`skill:*`) may also send a
      // conflicted item back while the release is building, so the release never claims a commit it does not hold
      const mayLeave = p.rel === 'draft' || (p.rel === 'building' && decision === 'rework' && person.startsWith('skill:'));
      if (leaves && !mayLeave) { skipped.push({ id, status: p.status, reason: 'in-release' }); continue; }
      // undoing a rework whose rebuild exists would leave the rebuild with no rework behind it; a closed pack stays closed
      if (reopen && p.status === 'rework' && rebuilt.get(id)) { skipped.push({ id, status: p.status, reason: 'rebuilt' }); continue; }
      if (reopen && p.pack === 'closed') { skipped.push({ id, status: p.status, reason: 'pack-closed' }); continue; }
      const target = reopen ? p.triaged_from : to;
      // a move records the status it left (the undo's target); the undo clears it, so undo is one step deep
      if (!upd.run(target, person, at, reopen ? null : text ?? null, reopen ? null : p.status, at, leaves ? 1 : 0, id, p.status).changes) {
        skipped.push({ id, status: read.get(id).status });
        continue;
      }
      triaged.push(id);
      if (p.pack_id && reopen && (target === 'done' || target === 'failed')) reopened.push(p.pack_id);
      else if (p.pack_id) touched.push(p.pack_id);
    }
    // an item back at done|failed waits for triage again, so its triaged pack is open again (PACK_MOVE triaged -> open)
    const back = [];
    const open = db.prepare("UPDATE packs SET status = 'open', updated_at = ? WHERE id = ? AND status = 'triaged'");
    for (const k of new Set(reopened)) if (open.run(at, k).changes) back.push(k);
    const out = { decision: reopen ? 'reopened' : to, by: person, triaged, skipped, packs_triaged: settlePacks(db, touched, at) };
    return reopen ? { ...out, packs_reopened: back } : out;
  });
}

/** A rebuild of a reworked item: a fresh `approved` copy that names it in attempt_of (see the header). */
export function reworkAttempt(db, { id, run } = {}) {
  const pid = need('id', id);
  const r = liveRun(db, run);
  return tx(db, () => {
    const p = db.prepare('SELECT status FROM proposals WHERE id = ?').get(pid);
    if (!p) refuse(`proposal ${pid} does not exist`);
    if (p.status !== 'rework') refuse(`proposal ${pid} is ${p.status}; only an item triaged rework is rebuilt`);
    const next = db.prepare('SELECT id FROM proposals WHERE attempt_of = ?').get(pid);
    if (next) refuse(`proposal ${pid} already has its rebuild, ${next.id}`);
    const at = now();
    let nid;
    for (let i = 0; i < 8 && (!nid || db.prepare('SELECT 1 FROM proposals WHERE id = ?').get(nid)); i += 1) nid = proposalId();
    // the rebuild keeps the item's origin, link and severity; never its external_ref, the original's idempotency key
    db.prepare(`INSERT INTO proposals (id, run_id, feature, lens, metric, title, body, standard, expected_delta, size, risk, kind, parent_id,
        status, decided_by, decided_at, decision_note, created_at, updated_at, attempt_of, origin, external_url, tier, risk_class, ranked_by, ranked_at)
      SELECT ?, ?, feature, lens, metric, title, body, standard, expected_delta, size, risk, kind, parent_id,
        'approved', decided_by, decided_at, decision_note, ?, ?, id, origin, external_url, tier, risk_class, ranked_by, ranked_at FROM proposals WHERE id = ?`).run(nid, r, at, at, pid);
    touchRun(db, r, at);
    return { id: nid, attempt_of: pid };
  });
}

export function releaseCreate(db, { version, by: who, baseSha } = {}) {
  const v = need('version', version);
  if (!VERSION_RE.test(v)) bad(`--version is semver without the v, e.g. 1.4.1 (got ${JSON.stringify(v)})`);
  const person = by(who);
  if (baseSha !== undefined) need('base-sha', baseSha);
  const id = `rel-${v}`;
  return tx(db, () => {
    if (db.prepare('SELECT 1 FROM releases WHERE id = ? OR version = ?').get(id, v)) refuse(`release ${v} already exists`);
    const at = now();
    db.prepare(`INSERT INTO releases (id, version, branch, base_sha, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)`).run(id, v, `release/${v}`, baseSha ?? null, person, at, at);
    return getRelease(db, id);
  });
}

/** Accepted items with no release join this one, while it is draft or building; each a compare-and-set. */
export function releaseAdd(db, { release, ids } = {}) {
  const rid = need('release', release);
  const list = [...new Set(listOf(need('ids', ids)))];
  return tx(db, () => {
    const rel = db.prepare('SELECT status FROM releases WHERE id = ?').get(rid);
    if (!rel) refuse(`release ${rid} does not exist`);
    if (rel.status !== 'draft' && rel.status !== 'building') refuse(`release ${rid} is ${rel.status}; items join a draft or building release only`);
    const at = now();
    const added = [], skipped = [];
    const upd = db.prepare("UPDATE proposals SET release_id = ?, updated_at = ? WHERE id = ? AND status = 'accepted' AND release_id IS NULL");
    const body = db.prepare('SELECT body FROM proposals WHERE id = ?');
    for (const id of list) {
      // a registry-target item's commit lives in the ai-registry checkout: a product release cannot ship it
      if (/^target:\s*registry\b/.test((body.get(id)?.body ?? '').trimStart())) { skipped.push({ id, status: 'accepted', reason: 'registry-target' }); continue; }
      if (upd.run(rid, at, id).changes) { added.push(id); continue; }
      const p = db.prepare('SELECT status, release_id FROM proposals WHERE id = ?').get(id);
      if (!p) skipped.push({ id, status: 'not-found' });
      else if (p.release_id !== null) skipped.push({ id, status: p.status, reason: p.release_id === rid ? 'already-in' : 'in-release' });
      else skipped.push({ id, status: p.status });
    }
    if (added.length) db.prepare('UPDATE releases SET updated_at = ? WHERE id = ?').run(at, rid);
    return { release: rid, added, skipped };
  });
}

/**
 * A release's status and fields, compare-and-set on the status read (or --from). merged -> tagged ships it:
 * its accepted items become `released` and every pack left with only released, descoped or declined items closes.
 */
export function releaseUpdate(db, { release, status, from, prUrl, tag, notes, error, baseSha } = {}) {
  const rid = need('release', release);
  if (status !== undefined) oneOf('status', status, RELEASE_STATUS);
  if (from !== undefined) oneOf('from', from, RELEASE_STATUS);
  const fields = { pr_url: prUrl, tag, notes, error, base_sha: baseSha };
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) need(k.replace('_', '-'), v);
  if (status === undefined && Object.values(fields).every((v) => v === undefined)) bad('nothing to update (--status, --pr-url, --tag, --notes, --error, --base-sha)');
  return tx(db, () => {
    const cur = db.prepare('SELECT status, version FROM releases WHERE id = ?').get(rid);
    if (!cur) refuse(`release ${rid} does not exist`);
    const expect = from ?? cur.status;
    if (status !== undefined && !RELEASE_MOVE[status]?.includes(expect)) refuse(`release ${rid}: ${expect} cannot move to ${status}`);
    if (status === 'tagged' && fields.tag === undefined) fields.tag = `v${cur.version}`;
    const at = now();
    const r = db.prepare(`UPDATE releases SET status = COALESCE(?, status), pr_url = COALESCE(?, pr_url), tag = COALESCE(?, tag), notes = COALESCE(?, notes),
      error = COALESCE(?, error), base_sha = COALESCE(?, base_sha), updated_at = ? WHERE id = ? AND status = ?`)
      .run(status ?? null, fields.pr_url ?? null, fields.tag ?? null, fields.notes ?? null, fields.error ?? null, fields.base_sha ?? null, at, rid, expect);
    if (!r.changes) refuse(`release ${rid} is ${cur.status}, not ${expect}; it moved on`);
    const out = getRelease(db, rid);
    if (status === 'tagged') {
      const items = db.prepare("SELECT id, pack_id FROM proposals WHERE release_id = ? AND status = 'accepted'").all(rid);
      db.prepare("UPDATE proposals SET status = 'released', updated_at = ? WHERE release_id = ? AND status = 'accepted'").run(at, rid);
      out.released = items.map((p) => p.id);
      out.packs_closed = closePacks(db, items.map((p) => p.id), at);
    }
    return out;
  });
}

// a pack item that needs nothing more: it shipped, was dropped or declined
const FINAL = ['released', 'descoped', 'declined'];
/** Settled for closing its pack: FINAL, or a `rework` item whose rebuild (attempt_of = it) is settled, down the chain. */
function settled(db, p, depth = 0) {
  if (FINAL.includes(p.status)) return true;
  if (p.status !== 'rework' || depth > 32) return false;
  return db.prepare('SELECT id, status FROM proposals WHERE attempt_of = ?').all(p.id).some((c) => settled(db, c, depth + 1));
}
/**
 * Closes every open or triaged pack whose items are all settled, among the packs of `ids` and of the items they
 * rebuild (up the attempt_of chain: a rebuild ships from a later pack, and the reworked item's pack waits on it).
 */
function closePacks(db, ids, at) {
  const row = db.prepare('SELECT id, pack_id, attempt_of FROM proposals WHERE id = ?');
  const packsOf = new Set();
  for (const id of ids) {
    let p = row.get(id);
    for (let i = 0; p && i < 32; i += 1) { if (p.pack_id) packsOf.add(p.pack_id); p = p.attempt_of ? row.get(p.attempt_of) : undefined; }
  }
  const members = db.prepare('SELECT id, status FROM proposals WHERE pack_id = ?');
  const close = db.prepare("UPDATE packs SET status = 'closed', updated_at = ? WHERE id = ? AND status IN ('open', 'triaged')");
  const closed = [];
  for (const k of packsOf) if (members.all(k).every((p) => settled(db, p)) && close.run(at, k).changes) closed.push(k);
  return closed;
}

export function releases(db, { status } = {}) {
  if (status !== undefined) oneOf('status', status, RELEASE_STATUS);
  return db.prepare(`SELECT * FROM releases${status !== undefined ? ' WHERE status = ?' : ''} ORDER BY created_at DESC, id DESC`)
    .all(...(status !== undefined ? [status] : [])).map(clean);
}
/** A release's items (proposals rows). */
export function releaseItems(db, { release } = {}) {
  const rid = need('release', release);
  if (!db.prepare('SELECT 1 FROM releases WHERE id = ?').get(rid)) refuse(`release ${rid} does not exist`);
  return proposals(db, { release: rid });
}
/** One release with its items. */
export function releaseGet(db, { id } = {}) {
  const rid = need('id', id);
  const rel = getRelease(db, rid);
  if (!rel) refuse(`release ${rid} does not exist`);
  return { ...rel, items: proposals(db, { release: rid }) };
}

/**
 * Per item, its before/after evidence: the proposal, its before and after measurements, and its shots
 * paired by (theme, size) - the latest capture of each phase. Unknown ids are absent, as in `proposals --ids`.
 */
export function compare(db, { ids, pack } = {}) {
  if ((ids === undefined) === (pack === undefined)) bad('compare reads --ids a,b or --pack k (one of them)');
  let items;
  if (pack !== undefined) {
    if (!db.prepare('SELECT 1 FROM packs WHERE id = ?').get(need('pack', pack))) refuse(`pack ${pack} does not exist`);
    items = proposals(db, { pack });
  } else items = proposals(db, { ids });
  const ms = db.prepare('SELECT * FROM measurements WHERE proposal_id = ? AND phase = ? ORDER BY lens, metric, measured_at, id');
  const ss = db.prepare('SELECT * FROM shots WHERE proposal_id = ? AND phase IS NOT NULL ORDER BY captured_at, id');
  return items.map((p) => {
    const pairs = new Map();
    for (const s of ss.all(p.id)) {
      const k = JSON.stringify([s.theme, s.size]);
      if (!pairs.has(k)) pairs.set(k, clean({ theme: s.theme, size: s.size }));
      const row = clean(s);
      if (row.report) row.report = JSON.parse(row.report);
      pairs.get(k)[s.phase] = row; // ordered by capture: the latest of each phase wins
    }
    return { proposal: p, before: ms.all(p.id, 'before').map(clean), after: ms.all(p.id, 'after').map(clean), shots: [...pairs.values()] };
  });
}

/** One lens of an app-structure file: its metric keys in manifest order, the feature slugs, the structure's date. */
export function structureLens(path, lens) {
  if (!path || !existsSync(path)) bad(`no app-structure at ${path}; gaps are counted against its features and the lens's metrics`);
  let s;
  try { s = JSON.parse(readFileSync(path, 'utf8')); } catch (e) { bad(`${path} is not readable JSON (${e.message})`); }
  const l = (s.lenses ?? []).find((x) => x?.id === lens);
  if (!l) bad(`lens ${lens} is not in ${path}`);
  if (l.enabled === false) bad(`lens ${lens} is disabled in ${path}`);
  const metrics = (l.manifest?.fields ?? []).filter((f) => f?.metric && typeof f.key === 'string').map((f) => f.key);
  if (!metrics.length) bad(`lens ${lens} declares no metric fields`);
  return { metrics, features: (s.features ?? []).map((f) => f?.slug).filter((x) => typeof x === 'string'), // not generated_at: lens-scan rewrites the structure after every measure; the map date moves only when the
  // file lists a reading was taken over change
  mapAt: s.provenance?.context_map_generated_at };
}

/**
 * What a caller still has to do for one lens (see the header). A feature counts as attempted once a `done`
 * measure run of this lens had no feature scope or named it.
 */
export function gaps(db, { lens, structure } = {}) {
  const id = need('lens', lens);
  const st = structureLens(structure, id);
  const mapAt = st.mapAt ? Date.parse(st.mapAt) : undefined;
  const have = new Map();
  for (const m of latest(db, { lens: id })) {
    if (!have.has(m.feature)) have.set(m.feature, new Map());
    have.get(m.feature).set(m.metric, m.measured_at);
  }
  const attempted = new Set();
  let all = false;
  for (const r of db.prepare("SELECT lenses, scope FROM runs WHERE phase = 'measure' AND status = 'done'").all()) {
    if (!JSON.parse(r.lenses).includes(id)) continue;
    const f = r.scope ? JSON.parse(r.scope).features : undefined;
    if (!Array.isArray(f)) { all = true; break; }
    for (const x of f) attempted.add(x);
  }
  const features = [];
  const totals = { features: st.features.length, cells: st.features.length * st.metrics.length, measured: 0, unmeasured: 0, unmeasurable: 0, stale: 0 };
  for (const f of st.features) {
    const m = have.get(f) ?? new Map();
    const tried = all || attempted.has(f);
    const row = { feature: f, unmeasured: [], unmeasurable: [], stale: [] };
    for (const k of st.metrics) {
      const at = m.get(k);
      if (at === undefined) row[tried ? 'unmeasurable' : 'unmeasured'].push(k);
      else { totals.measured += 1; if (mapAt !== undefined && Date.parse(at) < mapAt) row.stale.push(k); }
    }
    totals.unmeasured += row.unmeasured.length; totals.unmeasurable += row.unmeasurable.length; totals.stale += row.stale.length;
    // absent is omitted: a feature with nothing to do is not listed, an empty list is not printed
    if (row.unmeasured.length || row.unmeasurable.length || row.stale.length) {
      features.push(Object.fromEntries(Object.entries(row).filter(([, v]) => !Array.isArray(v) || v.length)));
    }
  }
  const backlog = {};
  for (const r of db.prepare('SELECT status, COUNT(*) AS n FROM proposals WHERE lens = ? GROUP BY status').all(id)) backlog[r.status] = r.n;
  return clean({ lens: id, metrics: st.metrics, context_map_at: st.mapAt, totals, features, backlog });
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

/** The subcommands main() answers: checked before the store is opened, which creates the file and its directory. */
export const SUBCOMMANDS = ['init', 'run-start', 'run-end', 'activity', 'measure', 'propose', 'proposals', 'proposal-update', 'rank', 'update-external',
  'shot', 'coverage', 'latest', 'gaps', 'decide', 'triage', 'rework-attempt', 'pack-create', 'pack-update', 'packs', 'release-create', 'release-add',
  'release-update', 'releases', 'release', 'release-items', 'compare'];

/** The subcommands that only read: main opens the store read-only for them and never creates it. */
export const READS = ['proposals', 'latest', 'gaps', 'packs', 'releases', 'release', 'release-items', 'compare'];

export function main(argv) {
  const a = parseArgs(argv);
  const cmd = a._[0];
  if (!cmd || a.help) return { help: HELP };
  // a typo, or a --db whose path was lost, never opens (and so creates) a store: the default one sits in the cwd
  if (!SUBCOMMANDS.includes(cmd)) bad(`unknown subcommand ${JSON.stringify(cmd)} - run with --help`);
  if (a.db === true) bad('--db needs a path (the default is .ai/lens-scan/scan.db: omit --db to use it)');
  // parseArgs reads a flag with no value as `true`; only --untriaged is a switch. Any other reached SQLite as a
  // boolean ("Provided value cannot be bound to SQLite parameter 4") or was dropped as if it were absent.
  const valueless = Object.keys(a).filter((k) => a[k] === true && k !== 'untriaged');
  if (valueless.length) bad(valueless.map((k) => `--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} needs a value`).join('; '));
  const dbPath = typeof a.db === 'string' ? a.db : DEFAULT_DB;
  // a read never creates the store (SKILL.md: status mode changes nothing). With no file it answers as an empty store
  // would - [] for the lists, "does not exist" for a named pack or release, every cell unmeasured for gaps - from a
  // scratch in-memory one, so a caller parsing the JSON sees the same shapes and exit codes either way.
  const db = READS.includes(cmd) ? (openStore(dbPath, { readOnly: true }) ?? openStore(':memory:')) : openStore(dbPath);
  try {
    switch (cmd) {
      case 'init': return { db: resolve(typeof a.db === 'string' ? a.db : DEFAULT_DB), user_version: SCHEMA_VERSION };
      case 'run-start': {
        const dbPath = typeof a.db === 'string' ? a.db : DEFAULT_DB;
        const knownFeatures = () => structureFeatures(typeof a.structure === 'string' ? a.structure : join(dirname(dbPath), 'app-structure.json'));
        return runStart(db, { phase: a.phase, lenses: a.lenses, scope: a.scope, features: a.features, knownFeatures, model: a.model, note: a.note });
      }
      case 'run-end': return runEnd(db, { run: a.run, status: a.status, note: a.note });
      case 'activity': return activity(db, a);
      case 'measure': {
        let rows;
        if (a.json !== undefined) {
          try { rows = JSON.parse(readFileSync(String(a.json), 'utf8')); } catch (e) { bad(`--json is not readable JSON (${e.message})`); }
          if (!Array.isArray(rows)) bad('--json holds an array of measurements');
        } else rows = { feature: a.feature, lens: a.lens, metric: a.metric, value: a.value, unit: a.unit, method: a.method, evidence: a.evidence,
          proposal: a.proposal, phase: a.phase, commitSha: a.commitSha };
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
      case 'rank': return rank(db, a);
      case 'update-external': return updateExternal(db, { id: a.id, title: a.title, bodyFile: a.bodyFile, externalUrl: a.externalUrl });
      case 'shot': return shot(db, a);
      case 'coverage': return coverage(db, a);
      case 'latest': return latest(db, a);
      case 'gaps': return gaps(db, { lens: a.lens, structure: typeof a.structure === 'string' ? a.structure : join(dirname(typeof a.db === 'string' ? a.db : DEFAULT_DB), 'app-structure.json') });
      case 'decide': return decide(db, a);
      case 'triage': return triage(db, a);
      case 'rework-attempt': return reworkAttempt(db, a);
      case 'pack-create': return packCreate(db, a);
      case 'pack-update': return packUpdate(db, a);
      case 'packs': return packs(db, a);
      case 'release-create': return releaseCreate(db, a);
      case 'release-add': return releaseAdd(db, a);
      case 'release-update': return releaseUpdate(db, a);
      case 'releases': return releases(db, a);
      case 'release': return releaseGet(db, a);
      case 'release-items': return releaseItems(db, a);
      case 'compare': return compare(db, a);
      default: bad(`unknown subcommand ${JSON.stringify(cmd)} - run with --help`);
    }
  } finally { db.close(); }
}

// run as a script: compare real paths, so a skills folder reached through a junction or symlink still runs
if (process.argv[1] && isEntry(process.argv[1], import.meta.url)) {
  try {
    const out = main(process.argv.slice(2));
    if (out?.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  } catch (e) {
    if (e instanceof StoreError && e.detail !== undefined) process.stdout.write(`${JSON.stringify(e.detail, null, 2)}\n`);
    process.stderr.write(`store: ${e.message}\n`);
    process.exit(e instanceof StoreError ? e.code : 1);
  }
}

function isEntry(argv1, url) {
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}
