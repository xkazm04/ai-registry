#!/usr/bin/env node
/**
 * query-misses - which front-door searches found the document the session then read,
 * which did not, and which were given up on.
 *
 * WHY THIS EXISTS. The routing bench (scripts/routing-bench.mjs) measures ranking on a
 * fixed set of queries; it cannot see the queries agents ask today, and a search used to
 * be logged nowhere. scripts/lib/query-log.mjs now writes one row per search into the
 * project's `.ai/queries.local.jsonl`; the reads are already in its `.ai/consults.jsonl`
 * (scripts/lib/consult-log.mjs). Joined by time, the pair says what each search led to.
 * A search whose next read was a subject the search did NOT return is a miss labelled by
 * behaviour - the subject the agent actually needed - which is exactly the row the bench
 * is short of. This report names those rows; a human screens and scrubs them before any
 * reaches the fixture, because the query text is the project's own words.
 *
 * Classes, per query, looking forward from its timestamp within --window-min minutes:
 *   hit@k      the first event is a consult of a subject that is in the query's hits;
 *              k is that subject's best rank among the logged hits (1-5)
 *   miss       the first event is a consult of a subject NOT in the hits; the label is
 *              that consult (bundle/subject, and its technique when the row names one)
 *   requery    the first event is another query (no consult in between)
 *   abandoned  nothing within the window
 * Events are ordered by timestamp; a consult stamped in the same second as a query counts
 * as after it, and a later query only when its timestamp is strictly later or it comes
 * later in the log. Consult rows with `outcome:"missed"` are consult-check's own records
 * of a subject NOT read, so they are not reads and are skipped.
 *
 * It reads the project the operator names and writes nothing. Nothing collects either log
 * into the registry; the candidate rows are printed for the operator, not saved.
 *
 * Usage:
 *   node scripts/query-misses.mjs --project-root <dir> [--window-min 10] [--json]
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 the report ran (misses are a result, not a
 * failure); 2 could not run - bad usage, or either log is absent (without both there is
 * nothing to join, and "no misses" would be a fabricated answer).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { QUERY_LOG_REL } from './lib/query-log.mjs';

export const CONSULT_LOG_REL = '.ai/consults.jsonl';
export const DEFAULT_WINDOW_MIN = 10;

class Fatal extends Error {}

/** JSONL text -> rows with a parseable ts; malformed lines are counted, not fatal. */
export function parseJsonl(text) {
  const rows = [];
  let bad = 0;
  for (const line of String(text ?? '').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      const t = Date.parse(r?.ts);
      if (!Number.isFinite(t)) { bad += 1; continue; }
      rows.push({ ...r, t });
    } catch { bad += 1; }
  }
  return { rows, bad };
}

/** `domain/subject[/technique]` -> subject slug. */
const subjectOfAddress = (a) => String(a).split('/')[1] ?? null;

/**
 * Classify every query against the consults. Pure: no clock, no I/O. `queries` and
 * `consults` are parsed rows (each with numeric `t`). Returns { rows, counts }.
 */
export function classify(queries, consults, { windowMin = DEFAULT_WINDOW_MIN } = {}) {
  const windowMs = windowMin * 60_000;
  const reads = consults
    .filter((c) => c.outcome !== 'missed' && Array.isArray(c.subjects) && c.subjects.length)
    .map((c, i) => ({ ...c, i }))
    .sort((a, b) => a.t - b.t || a.i - b.i);
  const qs = queries.map((q, i) => ({ ...q, i })).sort((a, b) => a.t - b.t || a.i - b.i);
  const out = [];
  for (let k = 0; k < qs.length; k += 1) {
    const q = qs[k];
    const hits = Array.isArray(q.hits) ? q.hits : [];
    const read = reads.find((c) => c.t >= q.t && c.t - q.t <= windowMs) ?? null;
    const next = qs[k + 1] && qs[k + 1].t - q.t <= windowMs ? qs[k + 1] : null;
    const base = { ts: q.ts, terms: q.terms ?? [], domain: q.domain ?? null, hits, empty: Boolean(q.empty), from: q.from ?? null };
    // A consult in the same second as the next query is taken as the answer to this one.
    if (read && (!next || read.t <= next.t)) {
      let rank = null;
      for (const s of read.subjects) {
        const r = hits.findIndex((h) => subjectOfAddress(h) === s);
        if (r !== -1 && (rank === null || r + 1 < rank)) rank = r + 1;
      }
      const label = {
        domain: read.bundle ?? null,
        subject: read.subjects[0],
        technique: Array.isArray(read.techniques) && read.techniques.length ? read.techniques[0] : null,
      };
      out.push(rank !== null
        ? { ...base, class: 'hit', rank, read: label, after_s: Math.round((read.t - q.t) / 1000) }
        : { ...base, class: 'miss', rank: null, read: label, after_s: Math.round((read.t - q.t) / 1000) });
    } else if (next) {
      out.push({ ...base, class: 'requery', rank: null, read: null, after_s: Math.round((next.t - q.t) / 1000) });
    } else {
      out.push({ ...base, class: 'abandoned', rank: null, read: null, after_s: null });
    }
  }
  const counts = { queries: out.length, hit: 0, hit_at: {}, miss: 0, requery: 0, abandoned: 0 };
  for (const r of out) {
    counts[r.class] += 1;
    if (r.class === 'hit') counts.hit_at[r.rank] = (counts.hit_at[r.rank] ?? 0) + 1;
  }
  return { rows: out, counts };
}

/** A labelled miss as a routing-bench row candidate. Unscrubbed: the operator screens it. */
export function benchCandidate(r) {
  return {
    terms: r.terms,
    expect: { domain: r.read.domain, subject: r.read.subject, technique: r.read.technique, alt_subjects: [] },
    source: 'transcript',
    rewritten: false,
    note: `query-log miss ${r.ts}: the next read (+${r.after_s}s) was ${r.read.subject}${r.read.technique ? `#${r.read.technique}` : ''}, not in the logged hits [${r.hits.join(', ')}]. Screen and scrub before adding; assign split with routing-bench splitFor(id).`,
  };
}

export function report(projectRoot, { windowMin = DEFAULT_WINDOW_MIN } = {}) {
  const qFile = path.join(projectRoot, ...QUERY_LOG_REL.split('/'));
  const cFile = path.join(projectRoot, ...CONSULT_LOG_REL.split('/'));
  const missing = [qFile, cFile].filter((f) => !fs.existsSync(f));
  if (missing.length) throw new Fatal(`no log to join: ${missing.map((f) => path.relative(projectRoot, f).replace(/\\/g, '/')).join(' and ')} absent under ${projectRoot}`);
  const q = parseJsonl(fs.readFileSync(qFile, 'utf8'));
  const c = parseJsonl(fs.readFileSync(cFile, 'utf8'));
  const { rows, counts } = classify(q.rows, c.rows, { windowMin });
  return {
    schema: 'query-misses/1',
    window_min: windowMin,
    malformed: { queries: q.bad, consults: c.bad },
    counts,
    rows,
    candidates: rows.filter((r) => r.class === 'miss').map(benchCandidate),
  };
}

const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : '-');

export function renderText(rep) {
  const { counts: k } = rep;
  const at = Object.entries(k.hit_at).sort(([a], [b]) => a - b).map(([r, n]) => `@${r} ${n}`).join(', ');
  const lines = [
    `query-misses: ${k.queries} queries, window ${rep.window_min} min`,
    `  hit        ${String(k.hit).padStart(4)}  ${pct(k.hit, k.queries).padStart(4)}${at ? `  (${at})` : ''}`,
    `  miss       ${String(k.miss).padStart(4)}  ${pct(k.miss, k.queries).padStart(4)}`,
    `  requery    ${String(k.requery).padStart(4)}  ${pct(k.requery, k.queries).padStart(4)}`,
    `  abandoned  ${String(k.abandoned).padStart(4)}  ${pct(k.abandoned, k.queries).padStart(4)}`,
  ];
  if (rep.malformed.queries || rep.malformed.consults) lines.push(`  skipped malformed lines: ${rep.malformed.queries} query, ${rep.malformed.consults} consult`);
  lines.push('');
  if (!rep.candidates.length) lines.push('no labelled misses: nothing to propose for the bench.');
  else {
    lines.push(`labelled misses -> bench candidates (${rep.candidates.length}; private text - screen and scrub before any reaches the fixture):`);
    for (const c of rep.candidates) lines.push(JSON.stringify(c));
  }
  return lines.join('\n');
}

function parseArgs(argv) {
  const a = { projectRoot: null, windowMin: DEFAULT_WINDOW_MIN, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const w = argv[i];
    if (w === '--project-root') a.projectRoot = argv[++i];
    else if (w === '--window-min') a.windowMin = Number(argv[++i]);
    else if (w === '--json') a.json = true;
    else if (w === '-h' || w === '--help') a.help = true;
    else throw new Fatal(`unknown argument ${w}`);
  }
  if (a.help) return a;
  if (!a.projectRoot) throw new Fatal('--project-root <dir> is required');
  if (!Number.isFinite(a.windowMin) || a.windowMin <= 0) throw new Fatal('--window-min must be a positive number of minutes');
  a.projectRoot = path.resolve(a.projectRoot);
  return a;
}

const USAGE = 'usage: node scripts/query-misses.mjs --project-root <dir> [--window-min 10] [--json]';

export function main(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  try {
    const a = parseArgs(argv);
    if (a.help) { stdout.write(`${USAGE}\n`); return EXIT.OK; }
    const rep = report(a.projectRoot, { windowMin: a.windowMin });
    stdout.write(a.json ? `${JSON.stringify(rep, null, 1)}\n` : `${renderText(rep)}\n`);
    return EXIT.OK;
  } catch (e) {
    if (e instanceof Fatal) { stderr.write(`query-misses: ${e.message}\n${USAGE}\n`); return EXIT.FATAL; }
    stderr.write(`query-misses: could not run: ${e?.stack ?? e}\n`);
    return EXIT.FATAL;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
