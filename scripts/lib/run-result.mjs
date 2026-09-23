#!/usr/bin/env node
/**
 * run-result — the machine-readable record of what ONE registry run did.
 *
 * ## The gap this closes
 *
 * Every engine in this repository reports in prose. `/librarian`, `/deepen`, `/intake`,
 * `/harvest` and `/conform` each write an excellent human record — a run note, a source
 * note, a subject note, a map edit — and between them they emit no field a program can
 * read. `librarian/runs/<date>-<n>.md` carries frontmatter, but its `kind` is free text
 * and no two skills agree on the rest.
 *
 * That is fine while a person reads every run. It stops being fine the moment something
 * DISPATCHES a run and has to know what happened: an orchestrator cannot tell "it landed
 * two techniques" from "it refused" from "nothing changed", and the loops' own halt rules
 * — two dry passes, the same failure signature three times, an evaluation debt of three —
 * are stated in prose in `/harvest`'s stop rule and are not computable from anything a run
 * leaves behind.
 *
 * This is the door. One file per run, one schema, written through one helper that owns the
 * rules so no caller has to remember them.
 *
 * ## Where it lands
 *
 *   librarian/runs/<run-id>/result.json          a registry run (the default)
 *   <project>/.ai/conform-runs/<run-id>.json     a /conform run, which executes in the
 *                                                CONSUMING project, not here
 *
 * The prose note stays exactly where it is and keeps its job. This file is beside it, not
 * instead of it: a run note explains, a result reports. Nothing here may be derived from
 * the other — `librarian/index.md` is explicit that a number in a note is a record of a
 * moment and never an input, and the same rule binds this file.
 *
 * ## The rules are the helper's, not the caller's
 *
 * Every constraint below is enforced here rather than described in five skill files,
 * because a rule that lives in prose in five places is five rules:
 *
 *   - **The lane is public.** `librarian/` publishes slugs, scores and dates and never a
 *     consumer's path, the same rule as `usage/` and `signals/`. So every path this file
 *     carries — in `files[]` and in a commit's `pathspec` — is refused when it is
 *     absolute, carries a drive letter, contains a `..` segment, uses a backslash, opens
 *     at a home directory, or names this machine or its user. A leak that a gate would
 *     catch a week later is a leak that was published.
 *
 *     **One half of that rule is PROSE-ENFORCED on purpose, and this note exists so the
 *     next reader does not "fix" it.** In the `librarian/` lane `files[]` must name the
 *     REGISTRY's own paths - a landing in a project tree is a `subjects[]` row, never
 *     that repo's file list - and nothing here can tell `src/api/limiter.ts` in a
 *     consumer from a relative path in the registry; both are ordinary and neither is a
 *     leak by shape. The mechanical version (require every `files[]` entry to exist in
 *     the destination root) was considered and DECLINED on 2026-09-23: it would refuse a
 *     run that DELETED a file, which is a legitimate result, and a door that refuses
 *     honest reports is worse than one rule carried by the five skills' own steps.
 *     `/conform` is the deliberate exception - its result lives in the project it
 *     judged, so project-relative paths there are correct rather than a leak.
 *   - **A decline is only real when written down.** A `declined[]` entry without a
 *     non-blank reason is an error, and so is a positive `counts.declined` with nothing
 *     written down. The registry re-proposes forever what it did not record.
 *   - **Unknown fields are rejected**, at every level. A field nobody declared is a field
 *     no reader knows to read, and it is how a schema quietly becomes free text again.
 *   - **A partial write leaves no file.** Validation runs to completion before anything
 *     touches the disk, and the write itself is a temp file plus a rename.
 *   - **`exit` is the vocabulary `scripts/lib/exit-codes.mjs` declares**, and nothing else.
 *     An undeclared code here would be the same drift that gave code 3 three meanings.
 *
 * What it deliberately does NOT do: judge. It will not infer `landed` from a commit list,
 * will not compute a count the caller did not state, and will not fill a field the caller
 * left out. A skill that opens no pull request writes `pr: null` — never a guess. The
 * refusals above are mechanical; everything else is the run's own honest account.
 *
 * ## Usage
 *
 *   import { writeRunResult, readRunResult } from './lib/run-result.mjs';
 *
 *   node scripts/lib/run-result.mjs write <draft.json|-> [--root <dir>] [--path <rel>]
 *   node scripts/lib/run-result.mjs read  <run-id>       [--root <dir>] [--path <rel>]
 *
 * `--root` is the tree the result is relative to (default: this registry). `--path` names
 * the destination relative to that root (default: `librarian/runs/<run-id>/result.json`);
 * it is what `/conform` passes to land in a project's `.ai/conform-runs/`.
 *
 * Exits 0 on success and 2 on any refusal — a refused write is a broken precondition, not
 * a finding, and the caller must not treat it as "nothing to report".
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, nameOf } from './exit-codes.mjs';

export const SCHEMA = 'rkb-run-result/1';

/** This registry's root — the default tree a result is written relative to. */
export const REGISTRY_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

/**
 * A run id is a directory name and a key a dispatcher quotes back, so the CHARSET is
 * deliberately narrow: no spaces, no separators, nothing a shell or a filesystem has an
 * opinion about. The LENGTH bound is about path safety, not brevity, which is why it is
 * 128 rather than 64: `run-board.mjs` DERIVES a default id up to ~98 characters when
 * `--run` is omitted (date + skill slug + a 40-char source slug + pid), and a door that
 * refuses that would fail precisely when a skill behaved correctly. 128 still leaves
 * `librarian/runs/<id>/result.json` comfortably inside Windows' path limit. Pass a short,
 * stable `--run <id>` anyway - a run id is quoted back in reports and read by people.
 */
const RUN_ID_RE = /^[A-Za-z0-9._-]{4,128}$/;

/** The closed verdict vocabulary of the apply/A-B lane (`librarian/applied.md`). */
const VERDICTS = new Set(['better', 'not-better', 'unmeasurable', 'COVERED']);

/**
 * The closed vocabularies for the two fields that used to admit free text. Non-uniform
 * free-text `kind` in the run notes is the defect this whole file exists to end, so
 * leaving two of its own fields open would have reintroduced it one level down.
 *
 * `OUTCOMES` mirrors `counts` exactly, so a subject row and the tally cannot describe
 * different things. `MODES` is the applied ledger's own ladder, highest reachable first.
 */
const OUTCOMES = new Set(['landed', 'declined', 'idled', 'contended', 'dispatched']);
const MODES = new Set(['code', 'experiment', 'blind-ab', 'simulation', 'render']);

const COUNT_KEYS = ['dispatched', 'landed', 'declined', 'idled', 'contended'];

const TOP_KEYS = [
  'schema', 'run_id', 'skill', 'skill_version', 'mode', 'domain',
  'started_at', 'ended_at', 'exit', 'counts', 'subjects', 'verdicts',
  'files', 'commits', 'pr', 'declined', 'failure_signature', 'notes',
];

const NOTES_MAX = 280;

// An instant, strictly. `Date.parse` alone accepts "2026" and "Sep 23 2026", which read as
// timestamps and sort as garbage.
const INSTANT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------- public safety
/**
 * Tokens that would identify the machine this ran on. Read once, defensively: a container
 * with no resolvable user must not make the whole helper throw.
 */
function machineTokens() {
  const out = new Set();
  const add = (v) => { const s = String(v ?? '').split('.')[0].trim().toLowerCase(); if (s.length >= 3) out.add(s); };
  try { add(os.hostname()); } catch { /* no hostname: one fewer token to screen */ }
  try { add(os.userInfo().username); } catch { /* no user info: same */ }
  return out;
}

const PATH_REFUSALS = [
  [/^[\\/]/, 'is absolute'],
  [/^[A-Za-z]:/, 'carries a drive letter'],
  [/[A-Za-z]:[\\/]/, 'carries a drive letter'],
  [/\\/, 'uses a backslash; a repo-relative path separates with "/"'],
  [/(^|\/)\.\.(\/|$)/, 'contains a ".." segment'],
  [/^(users|home)\//i, 'opens at a home directory, which is a machine path with its root stripped'],
];

/**
 * Why this path may not be published, or null when it may be.
 * @param {unknown} value
 * @param {Set<string>} tokens machine/user names to screen for
 */
export function unpublishablePath(value, tokens = machineTokens()) {
  if (typeof value !== 'string') return 'is not a string';
  if (!value.trim()) return 'is blank';
  for (const [re, why] of PATH_REFUSALS) if (re.test(value)) return why;
  for (const seg of value.split('/')) {
    if (tokens.has(seg.toLowerCase())) return `names this machine or its user (${JSON.stringify(seg)})`;
  }
  return null;
}

// ---------------------------------------------------------------- validation
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNonBlankString = (v) => typeof v === 'string' && v.trim().length > 0;
const isCount = (v) => Number.isInteger(v) && v >= 0;

/** Report every extra key rather than the first: a caller fixing one at a time re-runs five times. */
function unknownKeys(obj, allowed, where, problems) {
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) problems.push(`${where}: unknown field ${JSON.stringify(k)}`);
}

function requireKeys(obj, required, where, problems) {
  for (const k of required) if (!Object.prototype.hasOwnProperty.call(obj, k)) problems.push(`${where}: missing required field ${JSON.stringify(k)}`);
}

/**
 * Every problem with a draft result, as a list of sentences. Empty means valid.
 *
 * Collecting rather than throwing on the first is deliberate: the caller is usually an
 * agent assembling a record once at the end of a long run, and eight round trips to learn
 * eight rules is how a door gets routed around.
 *
 * @param {unknown} draft
 * @returns {string[]}
 */
export function validateRunResult(draft) {
  const problems = [];
  if (!isPlainObject(draft)) return ['the result must be a JSON object'];
  const tokens = machineTokens();

  unknownKeys(draft, TOP_KEYS, 'result', problems);
  requireKeys(draft, TOP_KEYS, 'result', problems);

  if ('schema' in draft && draft.schema !== SCHEMA) {
    problems.push(`result.schema must be ${JSON.stringify(SCHEMA)} (got ${JSON.stringify(draft.schema)})`);
  }
  if (!RUN_ID_RE.test(String(draft.run_id ?? ''))) {
    problems.push(`result.run_id must match ${RUN_ID_RE} - a short stable id, not a derived one (got ${JSON.stringify(draft.run_id)})`);
  }
  for (const k of ['skill', 'skill_version', 'mode']) {
    if (!isNonBlankString(draft[k])) problems.push(`result.${k} must be a non-blank string`);
  }
  if (!(draft.domain === null || isNonBlankString(draft.domain))) {
    problems.push('result.domain must be a bundle name or null - never an empty string');
  }
  for (const k of ['started_at', 'ended_at']) {
    if (!INSTANT_RE.test(String(draft[k] ?? ''))) problems.push(`result.${k} must be an ISO-8601 instant (got ${JSON.stringify(draft[k])})`);
  }
  if (INSTANT_RE.test(String(draft.started_at ?? '')) && INSTANT_RE.test(String(draft.ended_at ?? ''))
      && Date.parse(draft.ended_at) < Date.parse(draft.started_at)) {
    problems.push('result.ended_at is before result.started_at');
  }
  if (nameOf(draft.exit) === null) {
    problems.push(`result.exit must be a code scripts/lib/exit-codes.mjs declares (${Object.values(EXIT).join(', ')}) - got ${JSON.stringify(draft.exit)}`);
  }

  // counts
  if (!isPlainObject(draft.counts)) problems.push('result.counts must be an object');
  else {
    unknownKeys(draft.counts, COUNT_KEYS, 'result.counts', problems);
    for (const k of COUNT_KEYS) {
      if (!isCount(draft.counts[k])) problems.push(`result.counts.${k} must be a non-negative integer`);
    }
  }

  // subjects
  if (!Array.isArray(draft.subjects)) problems.push('result.subjects must be an array');
  else draft.subjects.forEach((s, i) => {
    const where = `result.subjects[${i}]`;
    if (!isPlainObject(s)) { problems.push(`${where} must be an object`); return; }
    const keys = ['id', 'at', 'engine', 'outcome', 'points_before', 'points_after'];
    unknownKeys(s, keys, where, problems);
    requireKeys(s, keys, where, problems);
    for (const k of ['id', 'engine']) if (!isNonBlankString(s[k])) problems.push(`${where}.${k} must be a non-blank string`);
    if (!OUTCOMES.has(s.outcome)) problems.push(`${where}.outcome must be one of ${[...OUTCOMES].join(' | ')} (got ${JSON.stringify(s.outcome)})`);
    if (!(INSTANT_RE.test(String(s.at ?? '')) || DATE_RE.test(String(s.at ?? '')))) {
      problems.push(`${where}.at must be a date or an ISO-8601 instant`);
    }
    for (const k of ['points_before', 'points_after']) {
      if (!(s[k] === null || Number.isFinite(s[k]))) problems.push(`${where}.${k} must be a number or null`);
    }
  });

  // verdicts
  if (!Array.isArray(draft.verdicts)) problems.push('result.verdicts must be an array');
  else draft.verdicts.forEach((v, i) => {
    const where = `result.verdicts[${i}]`;
    if (!isPlainObject(v)) { problems.push(`${where} must be an object`); return; }
    const keys = ['subject', 'technique', 'verdict', 'mode'];
    unknownKeys(v, keys, where, problems);
    requireKeys(v, keys, where, problems);
    if (!isNonBlankString(v.subject)) problems.push(`${where}.subject must be a non-blank string`);
    if (!(v.technique === null || isNonBlankString(v.technique))) problems.push(`${where}.technique must be a slug or null`);
    if (!VERDICTS.has(v.verdict)) problems.push(`${where}.verdict must be one of ${[...VERDICTS].join(' | ')} (got ${JSON.stringify(v.verdict)})`);
    if (!MODES.has(v.mode)) problems.push(`${where}.mode must be one of ${[...MODES].join(' | ')} - the mode the verdict was MEASURED at (got ${JSON.stringify(v.mode)})`);
  });

  // files - the public-safe lane's hardest rule
  if (!Array.isArray(draft.files)) problems.push('result.files must be an array');
  else draft.files.forEach((f, i) => {
    const why = unpublishablePath(f, tokens);
    if (why) problems.push(`result.files[${i}] ${why} - this lane is public (got ${JSON.stringify(f)})`);
  });

  // commits
  if (!Array.isArray(draft.commits)) problems.push('result.commits must be an array');
  else draft.commits.forEach((c, i) => {
    const where = `result.commits[${i}]`;
    if (!isPlainObject(c)) { problems.push(`${where} must be an object`); return; }
    const keys = ['sha', 'branch', 'pathspec'];
    unknownKeys(c, keys, where, problems);
    requireKeys(c, keys, where, problems);
    if (!/^[0-9a-f]{7,40}$/.test(String(c.sha ?? ''))) problems.push(`${where}.sha must be a 7-40 character hex sha (got ${JSON.stringify(c.sha)})`);
    if (!isNonBlankString(c.branch)) problems.push(`${where}.branch must be a non-blank string`);
    // A pathspec is a path, so it is screened exactly like `files[]`. One or several.
    const specs = Array.isArray(c.pathspec) ? c.pathspec : [c.pathspec];
    if (Array.isArray(c.pathspec) && c.pathspec.length === 0) problems.push(`${where}.pathspec must name at least one path`);
    specs.forEach((p, j) => {
      const why = unpublishablePath(p, tokens);
      if (why) problems.push(`${where}.pathspec${Array.isArray(c.pathspec) ? `[${j}]` : ''} ${why} - this lane is public (got ${JSON.stringify(p)})`);
    });
  });

  // pr
  if (!(draft.pr === null || isPlainObject(draft.pr))) problems.push('result.pr must be an object or null - a skill that opens no pull request writes null, never a guess');
  else if (isPlainObject(draft.pr)) {
    unknownKeys(draft.pr, ['number', 'url'], 'result.pr', problems);
    requireKeys(draft.pr, ['number', 'url'], 'result.pr', problems);
    if (!(Number.isInteger(draft.pr.number) && draft.pr.number > 0)) problems.push('result.pr.number must be a positive integer');
    if (!/^https:\/\/\S+$/.test(String(draft.pr.url ?? ''))) problems.push('result.pr.url must be an https URL');
  }

  // declined - "a decline is only real when written down"
  if (!Array.isArray(draft.declined)) problems.push('result.declined must be an array');
  else {
    draft.declined.forEach((d, i) => {
      const where = `result.declined[${i}]`;
      if (!isPlainObject(d)) { problems.push(`${where} must be an object`); return; }
      unknownKeys(d, ['subject', 'reason'], where, problems);
      requireKeys(d, ['subject', 'reason'], where, problems);
      if (!isNonBlankString(d.subject)) problems.push(`${where}.subject must be a non-blank string`);
      if (!isNonBlankString(d.reason)) problems.push(`${where}.reason must be a non-blank string - a decline with no reason gets re-proposed every run forever`);
    });
    if (isPlainObject(draft.counts) && isCount(draft.counts.declined) && draft.counts.declined > 0 && draft.declined.length === 0) {
      problems.push(`result.counts.declined is ${draft.counts.declined} but result.declined[] is empty - a decline is only real when written down`);
    }
  }

  // failure_signature - identity, not attempt count
  if (!(draft.failure_signature === null || isNonBlankString(draft.failure_signature))) {
    problems.push('result.failure_signature must be a short stable string or null');
  } else if (isNonBlankString(draft.failure_signature)) {
    if (draft.failure_signature.length > 120) problems.push('result.failure_signature must be <= 120 characters - it is an identity, not a description');
    if (!/[A-Za-z]/.test(draft.failure_signature)) problems.push('result.failure_signature must name the failure, not count attempts - the halt rule compares identity across passes');
  }

  if (typeof draft.notes !== 'string') problems.push('result.notes must be a string (empty when there is nothing to add)');
  else if (draft.notes.length > NOTES_MAX) problems.push(`result.notes must be <= ${NOTES_MAX} characters (got ${draft.notes.length}) - the run note is where prose lives`);

  return problems;
}

// ---------------------------------------------------------------- placement
/** The destination, relative to its root. Public-safe by construction and screened anyway. */
export function resultPathFor(runId, options = {}) {
  return options.path ?? `librarian/runs/${runId}/result.json`;
}

function resolveDestination(runId, options) {
  const root = path.resolve(options.root ?? REGISTRY_ROOT);
  const rel = resultPathFor(runId, options);
  const why = unpublishablePath(rel);
  if (why) throw new Error(`run-result: the destination path ${why} (got ${JSON.stringify(rel)})`);
  return { root, rel, abs: path.join(root, rel) };
}

// ---------------------------------------------------------------- write / read
/**
 * Validate a run result and place it atomically.
 *
 * Nothing touches the disk until every rule has passed, so a refused write leaves no
 * file, no directory and no temp residue; a successful one replaces any previous result
 * in a single rename, so a reader never sees half a document.
 *
 * @param {object} result the draft; `schema` may be omitted and is stamped
 * @param {{root?: string, path?: string}} [options] destination tree and relative path
 * @returns {string} the ROOT-RELATIVE path written - never an absolute one, so a caller
 *   printing it into a public note cannot leak a machine path by echoing this
 */
export function writeRunResult(result, options = {}) {
  const draft = { ...(isPlainObject(result) ? result : {}), schema: SCHEMA };
  if (isPlainObject(result) && 'schema' in result && result.schema !== SCHEMA) draft.schema = result.schema;
  const problems = validateRunResult(draft);
  if (problems.length) {
    throw new Error(`run-result: refused to write ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  }
  // Ordered exactly as the schema declares it, so two results diff against each other.
  const ordered = {};
  for (const k of TOP_KEYS) ordered[k] = draft[k];
  const serialized = `${JSON.stringify(ordered, null, 2)}\n`;

  const { rel, abs } = resolveDestination(draft.run_id, options);
  const dir = path.dirname(abs);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(abs)}.${process.pid}-${Math.random().toString(36).slice(2, 8)}.tmp`);
  try {
    fs.writeFileSync(tmp, serialized);
    fs.renameSync(tmp, abs);
  } catch (err) {
    fs.rmSync(tmp, { force: true });
    throw err;
  }
  return rel;
}

/**
 * Read a run's result back, validated.
 *
 * Returns `null` when no result exists — which is a real answer and a different one from
 * a run that reported a failure. Throws when a file exists and is unreadable or invalid,
 * because a corrupt result read as an absent one would silently reset a halt counter.
 *
 * @param {string} runId
 * @param {{root?: string, path?: string}} [options]
 * @returns {object|null}
 */
export function readRunResult(runId, options = {}) {
  if (!RUN_ID_RE.test(String(runId ?? ''))) throw new Error(`run-result: run id must match ${RUN_ID_RE} (got ${JSON.stringify(runId)})`);
  const { rel, abs } = resolveDestination(runId, options);
  if (!fs.existsSync(abs)) return null;
  let parsed;
  try { parsed = JSON.parse(fs.readFileSync(abs, 'utf8')); }
  catch (err) { throw new Error(`run-result: ${rel} is not readable JSON - ${err.message}`); }
  const problems = validateRunResult(parsed);
  if (problems.length) throw new Error(`run-result: ${rel} is not a valid ${SCHEMA}:\n  - ${problems.join('\n  - ')}`);
  return parsed;
}

// ---------------------------------------------------------------- CLI
const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const argv = process.argv.slice(2);
  const flag = (name) => { const i = argv.indexOf(`--${name}`); return i === -1 ? undefined : argv[i + 1]; };
  const positionals = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
  const [command, target] = positionals;
  const options = {};
  if (flag('root') !== undefined) options.root = flag('root');
  if (flag('path') !== undefined) options.path = flag('path');

  const fail = (msg) => { console.error(`FATAL: ${msg}`); process.exit(EXIT.FATAL); };
  try {
    if (command === 'write') {
      if (!target) fail('write needs a draft file (or `-` for stdin).');
      const raw = target === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(path.resolve(target), 'utf8');
      const rel = writeRunResult(JSON.parse(raw), options);
      console.log(rel);
      process.exit(EXIT.OK);
    } else if (command === 'read') {
      if (!target) fail('read needs a run id.');
      const found = readRunResult(target, options);
      if (!found) fail(`no result for run ${JSON.stringify(target)} at ${resultPathFor(target, options)}.`);
      console.log(JSON.stringify(found, null, 2));
      process.exit(EXIT.OK);
    } else {
      console.error('usage: node scripts/lib/run-result.mjs write <draft.json|-> [--root <dir>] [--path <rel>]');
      console.error('       node scripts/lib/run-result.mjs read  <run-id>       [--root <dir>] [--path <rel>]');
      process.exit(EXIT.FATAL);
    }
  } catch (err) {
    fail(err.message);
  }
}
