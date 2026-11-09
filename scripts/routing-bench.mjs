#!/usr/bin/env node
/**
 * routing-bench - the proof bar for any change to how agents locate registry knowledge.
 *
 * WHY THIS EXISTS. A router change is easy to argue for and hard to argue against: every
 * new ranker finds the example its author had in mind. The operator's bar is narrower and
 * mechanical - a query-path change lands only if it beats the baseline on a FIXED set of
 * REAL routing queries, measured as recall and as tokens returned. This script is that
 * instrument. The query set (scripts/fixtures/routing-bench/queries.json) was mined from
 * transcripts by scripts/experiments/mine-routing-queries.mjs and screened by hand: each
 * row is a query an agent actually issued (or, where marked synthetic, a decision a
 * developer faces), labelled with the subject the agent then OPENED.
 *
 * Arms (`--arms`, comma-separated; default all):
 *   research-map         spawn `node scripts/research-map.mjs <terms>` (default flags)
 *   research-map-deep    the same with --deep
 *   research-map-prose   the same with --prose
 *   registry-query       scripts/lib/registry-query.mjs: loadProjection + query, defaults
 *   registry-query-top3  the same with top: 3
 * An arm whose implementation throws "not implemented" is reported UNAVAILABLE with the
 * reason - never as zero recall, which would be a fabricated measurement.
 *
 * Per arm:
 *   recall@1, recall@5   subject hit: the hit's subject is expect.subject or one of
 *                        expect.alt_subjects (slugs are unique across bundles, so the
 *                        slug alone is identity)
 *   technique@5          over rows with expect.technique: the correct subject is in the
 *                        top 5 AND that hit names the technique (research-map: in its
 *                        matched_techniques; registry-query: a technique row for it)
 *   output tokens        estimateTokens of the TEXT an agent receives. research-map: its
 *                        default human-readable stdout, not --json. registry-query: the
 *                        hits rendered by the module's formatHit when it exports one, else
 *                        the serialized hits. Median and p90.
 *   wall ms              mean per query (research-map: the text run, process spawn
 *                        included; registry-query: query() alone, with the one-off
 *                        projection load reported separately as setup_ms)
 *   decision cost        A MODEL, not a measurement of agent behaviour. Output tokens plus
 *                        the tokens (chars/4 of the real files) of the documents an agent
 *                        must open to reach the right technique:
 *                          - hit carries the technique's path and gist (a registry-query
 *                            technique row): that one technique file
 *                          - otherwise: the subject's golden path, then the technique file
 *                            (golden path only when expect.technique is null)
 *                          - miss (correct subject not in the top 5): the top-1 hit's
 *                            golden path is opened and wasted, then the right documents
 *                            as above are paid as if found by other means
 *                        It prices reading, not judgment; it assumes the agent stops at
 *                        the first correct hit and never opens a second wrong one.
 *
 * Multi-term rows: research-map scores each term separately; the bench merges by keeping
 * each subject's best score across terms. registry-query receives the terms as given.
 *
 * Splits. A row may carry `"split": "dev"` or `"split": "heldout"`; a row without one is
 * heldout (the original 38 rows, 2026-10-25, carry none and stay byte-for-byte). Rows added
 * since carry a split assigned by splitFor(id), a stable hash, about half each. `--split`
 * picks the rows scored (default heldout, so a bare run keeps measuring the held-out set;
 * tune against dev, report heldout). When the selection mixes the original rows with grown
 * ones, the report adds one line per arm and cohort (`original`, `grown`), so the original
 * 38's numbers stay readable on their own.
 *
 * Usage:
 *   node scripts/routing-bench.mjs [--arms a,b] [--split dev|heldout|all] [--json] [--fixture <path>]
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 the bench ran (low recall is a result, not a
 * failure); 2 the fixture is invalid, an arm name is unknown, or an arm failed to run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { estimateTokens } from './ledger-read.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_FIXTURE = path.join(ROOT, 'scripts', 'fixtures', 'routing-bench', 'queries.json');
export const FIXTURE_SCHEMA = 'routing-bench/1';
export const ARMS = ['research-map', 'research-map-deep', 'research-map-prose', 'registry-query', 'registry-query-top3'];
const AT = 5;
export const SPLITS = ['dev', 'heldout'];

/** The split a new row gets: the parity of the first byte of sha256(id). Stable, about half each. */
export function splitFor(id) {
  return createHash('sha256').update(String(id)).digest()[0] % 2 === 0 ? 'dev' : 'heldout';
}
/** A row's split; a row without one (the original set) is heldout. */
export const splitOf = (q) => q.split ?? 'heldout';
/** `original` for the rows that predate splits, `grown` for rows that carry one. */
export const cohortOf = (q) => (q.split === undefined ? 'original' : 'grown');

/** The fixture restricted to one split (`all` keeps every row). */
export function selectSplit(fx, split = 'heldout') {
  if (split === 'all') return fx;
  if (!SPLITS.includes(split)) throw new Fatal(`unknown split "${split}"; splits: ${SPLITS.join(', ')}, all`);
  return { ...fx, queries: fx.queries.filter((q) => splitOf(q) === split) };
}

class Fatal extends Error {}
class Unavailable extends Error {}

// ---------------------------------------------------------------- fixture
/** Structural validation of a parsed fixture. Returns a list of problems ([] = valid). */
export function validateFixture(fx) {
  const errs = [];
  if (!fx || typeof fx !== 'object') return ['fixture is not an object'];
  if (fx.schema !== FIXTURE_SCHEMA) errs.push(`schema must be "${FIXTURE_SCHEMA}", got ${JSON.stringify(fx.schema)}`);
  if (typeof fx.generated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fx.generated)) errs.push('generated must be a YYYY-MM-DD date');
  if (!Array.isArray(fx.queries) || fx.queries.length === 0) return [...errs, 'queries must be a non-empty array'];
  const ids = new Set();
  fx.queries.forEach((q, i) => {
    const at = `queries[${i}]${q?.id ? ` (${q.id})` : ''}`;
    if (!q || typeof q !== 'object') { errs.push(`${at} is not an object`); return; }
    if (typeof q.id !== 'string' || !q.id) errs.push(`${at}: id missing`);
    else if (ids.has(q.id)) errs.push(`${at}: duplicate id`);
    else ids.add(q.id);
    if (!Array.isArray(q.terms) || q.terms.length === 0 || q.terms.some((t) => typeof t !== 'string' || !t.trim())) errs.push(`${at}: terms must be non-empty strings`);
    const e = q.expect;
    if (!e || typeof e !== 'object') { errs.push(`${at}: expect missing`); return; }
    if (typeof e.domain !== 'string' || !e.domain) errs.push(`${at}: expect.domain missing`);
    if (typeof e.subject !== 'string' || !e.subject) errs.push(`${at}: expect.subject missing`);
    if (!(e.technique === null || (typeof e.technique === 'string' && e.technique))) errs.push(`${at}: expect.technique must be a slug or null`);
    if (!Array.isArray(e.alt_subjects) || e.alt_subjects.some((s) => typeof s !== 'string' || !s)) errs.push(`${at}: expect.alt_subjects must be an array of slugs`);
    if (q.source !== 'transcript' && q.source !== 'synthetic') errs.push(`${at}: source must be transcript|synthetic`);
    if (typeof q.rewritten !== 'boolean') errs.push(`${at}: rewritten must be boolean`);
    if (typeof q.note !== 'string' || !q.note.trim()) errs.push(`${at}: note missing`);
    if (q.split !== undefined && !SPLITS.includes(q.split)) errs.push(`${at}: split must be ${SPLITS.join('|')} when present`);
  });
  return errs;
}

export function loadFixture(file) {
  let fx;
  try {
    fx = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Fatal(`fixture ${file} does not read as JSON (${e.message})`);
  }
  const errs = validateFixture(fx);
  if (errs.length) throw new Fatal(`fixture ${file} is invalid:\n  - ${errs.join('\n  - ')}`);
  return fx;
}

// ---------------------------------------------------------------- corpus addresses
/** domain -> index.json, read once. Used for file sizes in the decision-cost model. */
const indexCache = new Map();
function indexOf(domain) {
  if (!indexCache.has(domain)) {
    const p = path.join(ROOT, 'knowledge', domain, 'index.json');
    indexCache.set(domain, fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);
  }
  return indexCache.get(domain);
}
const sizeCache = new Map();
function fileTokens(rel) {
  if (!rel) return 0;
  if (!sizeCache.has(rel)) {
    const abs = path.join(ROOT, rel);
    sizeCache.set(rel, fs.existsSync(abs) ? estimateTokens(fs.readFileSync(abs, 'utf8')) : 0);
  }
  return sizeCache.get(rel);
}
function subjectEntry(domain, subject) {
  return indexOf(domain)?.subjects?.[subject] ?? null;
}
function goldenPath(domain, subject) {
  return subjectEntry(domain, subject)?.file ?? null;
}
function techniquePath(domain, subject, technique) {
  const s = subjectEntry(domain, subject);
  if (!s || !technique) return null;
  const t = (s.techniques ?? []).find((x) => x.slug === technique);
  return t?.file ?? s.file.replace(/\/[^/]+\.md$/, `/techniques/${technique}.md`);
}
/** Subject slug -> domain, across every bundle (slugs are unique registry-wide). */
let domainOfSubject = null;
function domainFor(subject) {
  if (!domainOfSubject) {
    domainOfSubject = new Map();
    const k = path.join(ROOT, 'knowledge');
    for (const d of fs.readdirSync(k, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
      for (const s of Object.keys(indexOf(d)?.subjects ?? {})) domainOfSubject.set(s, d);
    }
  }
  return domainOfSubject.get(subject) ?? null;
}

// ---------------------------------------------------------------- arms
// Each arm answers one query as { ranked: [{subject, domain, techniques: Set, techniqueRows?: Set}], text, ms }.
// `ranked` is deduplicated by subject in rank order; `techniques` are the technique slugs
// that subject's hit(s) name; `techniqueRows` are the techniques a hit carries path+gist for.

/**
 * Read research-map's human-readable report back into per-term hit lists. The ranks are
 * taken from the very text an agent reads (one spawn per query, not a second --json run,
 * which doubled the bench's wall time; --prose costs seconds a call). Hit lines are
 * `<score>  <domain>  <category>[/<subcategory>]/<subject>  [...]`, optionally followed
 * by `techniques: a, b`.
 */
export function parseResearchMapText(text) {
  const results = [];
  let cur = null;
  let last = null;
  for (const ln of String(text).split(/\r?\n/)) {
    const term = /^term: "(.*)"$/.exec(ln);
    if (term) { cur = { term: term[1], hits: [] }; results.push(cur); last = null; continue; }
    if (!cur) continue;
    const hit = /^ {4}\s*(\d+) {2}(\S+) {2}(\S+) {2}\[/.exec(ln);
    if (hit) {
      last = { score: Number(hit[1]), domain: hit[2], subject: hit[3].split('/').pop(), matched_techniques: [] };
      cur.hits.push(last);
      continue;
    }
    const tech = /^\s+techniques: (.*)$/.exec(ln);
    if (tech && last) last.matched_techniques = tech[1].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return results;
}

function runResearchMap(terms, flags) {
  const script = path.join(ROOT, 'scripts', 'research-map.mjs');
  const opts = { encoding: 'utf8', maxBuffer: 1 << 26, cwd: ROOT };
  const t0 = performance.now();
  const txt = spawnSync(process.execPath, [script, ...terms, ...flags], opts);
  const ms = performance.now() - t0;
  if (txt.status !== 0) throw new Fatal(`research-map ${flags.join(' ')} exited ${txt.status}: ${String(txt.stderr).trim().slice(0, 300)}`);
  const parsed = parseResearchMapText(txt.stdout);
  if (parsed.length !== terms.length) {
    throw new Fatal(`research-map ${flags.join(' ')} report has ${parsed.length} term block(s) for ${terms.length} term(s); its text format moved and the bench can no longer read it`);
  }
  // Merge per-term hit lists: each subject keeps its best score across terms.
  const best = new Map();
  for (const r of parsed) {
    for (const h of r.hits) {
      const prev = best.get(h.subject);
      const techniques = new Set([...(prev?.techniques ?? []), ...(h.matched_techniques ?? [])]);
      if (!prev || h.score > prev.score) best.set(h.subject, { subject: h.subject, domain: h.domain, score: h.score, techniques });
      else prev.techniques = techniques;
    }
  }
  const ranked = [...best.values()].sort((a, b) => b.score - a.score || a.subject.localeCompare(b.subject));
  return { ranked, text: txt.stdout, ms };
}

let rq = null; // { mod, projection, setupMs }
async function registryQueryModule() {
  if (rq) return rq;
  let mod;
  try {
    mod = await import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'registry-query.mjs')).href);
  } catch (e) {
    throw new Fatal(`registry-query module does not load (${e.message})`);
  }
  const t0 = performance.now();
  let projection;
  try {
    projection = mod.loadProjection(ROOT);
  } catch (e) {
    if (/not implemented/i.test(e.message)) throw new Unavailable('not implemented');
    throw new Fatal(`registry-query loadProjection failed: ${e.message}`);
  }
  rq = { mod, projection, setupMs: performance.now() - t0 };
  return rq;
}

async function runRegistryQuery(terms, opts) {
  const { mod, projection } = await registryQueryModule();
  const t0 = performance.now();
  let result;
  try {
    result = mod.query(projection, terms, opts);
  } catch (e) {
    if (/not implemented/i.test(e.message)) throw new Unavailable('not implemented');
    throw new Fatal(`registry-query query failed: ${e.message}`);
  }
  const ms = performance.now() - t0;
  const hits = Array.isArray(result?.hits) ? result.hits : [];
  const text = typeof mod.formatHit === 'function' ? hits.map((h) => mod.formatHit(h)).join('\n') : JSON.stringify(hits);
  const bySubject = new Map();
  const ranked = [];
  for (const h of hits) {
    if (!h.subject) continue; // law rows address no subject
    let row = bySubject.get(h.subject);
    if (!row) {
      row = { subject: h.subject, domain: h.domain, techniques: new Set(), techniqueRows: new Set() };
      bySubject.set(h.subject, row);
      ranked.push(row);
    }
    if (h.kind === 'technique' && h.technique) {
      row.techniques.add(h.technique);
      if (h.path && h.gist) row.techniqueRows.add(h.technique);
    }
  }
  return { ranked, text, ms };
}

const ARM_IMPL = {
  'research-map': (terms) => runResearchMap(terms, []),
  'research-map-deep': (terms) => runResearchMap(terms, ['--deep']),
  'research-map-prose': (terms) => runResearchMap(terms, ['--prose']),
  'registry-query': (terms) => runRegistryQuery(terms, {}),
  'registry-query-top3': (terms) => runRegistryQuery(terms, { top: 3 }),
};

// ---------------------------------------------------------------- scoring
const quantile = (xs, q) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil(q * s.length) - 1)];
};
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** recall@1, recall@5 and technique@5 over scored rows. */
export function recallOf(rows) {
  const n = rows.length;
  const tRows = rows.filter((r) => r.technique_at5 !== null);
  return {
    n,
    recall_at1: n ? rows.filter((r) => r.at1).length / n : null,
    recall_at5: n ? rows.filter((r) => r.at5).length / n : null,
    technique_at5: tRows.length ? tRows.filter((r) => r.technique_at5).length / tRows.length : null,
    technique_n: tRows.length,
  };
}

/** Score one arm's answer against one fixture row. */
export function scoreAnswer(q, ranked) {
  const accept = new Set([q.expect.subject, ...q.expect.alt_subjects]);
  const rank = ranked.findIndex((r) => accept.has(r.subject));
  const hitRank = rank === -1 ? null : rank + 1;
  const hit = hitRank ? ranked[rank] : null;
  const wantT = q.expect.technique;
  // The EXPECTED subject's row in the top AT, wherever it sits: an alt subject ranked above it
  // credits recall but must not hide it from technique@5.
  const own = ranked.slice(0, AT).find((r) => r.subject === q.expect.subject);
  const techAt5 = wantT ? Boolean(own && own.techniques.has(wantT)) : null;
  return { rank: hitRank, at1: hitRank === 1, at5: hitRank !== null && hitRank <= AT, technique_at5: techAt5, hit };
}

/** The decision-cost model (see header). Returns { opened: string[], tokens }. */
export function decisionDocs(q, ranked, scored) {
  const { domain, subject, technique } = q.expect;
  const opened = [];
  if (scored.at5) {
    const h = scored.hit;
    const hd = h.domain ?? domainFor(h.subject) ?? domain;
    const usesExpected = h.subject === subject;
    const tech = usesExpected ? technique : null;
    if (tech && h.techniqueRows?.has(tech)) opened.push(techniquePath(hd, h.subject, tech));
    else {
      opened.push(goldenPath(hd, h.subject));
      if (tech) opened.push(techniquePath(hd, h.subject, tech));
    }
  } else {
    const top = ranked[0];
    if (top) opened.push(goldenPath(top.domain ?? domainFor(top.subject), top.subject));
    opened.push(goldenPath(domain, subject));
    if (technique) opened.push(techniquePath(domain, subject, technique));
  }
  const files = opened.filter(Boolean);
  return { opened: files, tokens: files.reduce((n, f) => n + fileTokens(f), 0) };
}

export async function runArm(arm, fx) {
  const rows = [];
  for (const q of fx.queries) {
    const ans = await ARM_IMPL[arm](q.terms);
    const s = scoreAnswer(q, ans.ranked);
    const outTokens = estimateTokens(ans.text);
    const docs = decisionDocs(q, ans.ranked, s);
    rows.push({
      id: q.id,
      terms: q.terms,
      expect: q.expect,
      rank: s.rank,
      at1: s.at1,
      at5: s.at5,
      technique_at5: s.technique_at5,
      top: ans.ranked.slice(0, AT).map((r) => r.subject),
      output_tokens: outTokens,
      decision_tokens: outTokens + docs.tokens,
      decision_docs: docs.opened,
      ms: Math.round(ans.ms),
    });
  }
  const out = rows.map((r) => r.output_tokens);
  const dec = rows.map((r) => r.decision_tokens);
  const cohort = new Map(fx.queries.map((q) => [q.id, cohortOf(q)]));
  const cohorts = {};
  for (const c of ['original', 'grown']) {
    const sub = rows.filter((r) => cohort.get(r.id) === c);
    if (sub.length) cohorts[c] = recallOf(sub);
  }
  return {
    arm,
    status: 'ok',
    ...recallOf(rows),
    cohorts,
    tokens_median: quantile(out, 0.5),
    tokens_p90: quantile(out, 0.9),
    decision_median: quantile(dec, 0.5),
    decision_p90: quantile(dec, 0.9),
    wall_ms_mean: Math.round(mean(rows.map((r) => r.ms))),
    setup_ms: arm.startsWith('registry-query') && rq ? Math.round(rq.setupMs) : null,
    rows,
  };
}

// ---------------------------------------------------------------- report
const pct = (x) => (x === null ? '   -' : `${(x * 100).toFixed(0).padStart(3)}%`);
const num = (x, w = 6) => (x === null || x === undefined ? '-'.padStart(w) : String(x).padStart(w));

export function renderTable(fx, results, split = null) {
  const lines = [];
  const synth = fx.queries.filter((q) => q.source === 'synthetic').length;
  lines.push(`routing-bench: ${fx.queries.length} queries (${fx.queries.length - synth} transcript, ${synth} synthetic)${split ? `, split ${split}` : ''}, fixture ${fx.generated}`);
  lines.push('');
  lines.push(`${'arm'.padEnd(21)}  r@1   r@5   t@5   tok-med tok-p90  dec-med dec-p90  ms-mean`);
  for (const r of results) {
    if (r.status !== 'ok') {
      lines.push(`${r.arm.padEnd(21)}  unavailable: ${r.reason}`);
      continue;
    }
    lines.push(
      `${r.arm.padEnd(21)}  ${pct(r.recall_at1)}  ${pct(r.recall_at5)}  ${pct(r.technique_at5)}  ${num(r.tokens_median, 7)} ${num(r.tokens_p90, 7)}  ${num(r.decision_median, 7)} ${num(r.decision_p90, 7)}  ${num(r.wall_ms_mean, 7)}` +
        (r.setup_ms !== null ? `  (+${r.setup_ms} ms setup)` : ''),
    );
  }
  const ok = results.filter((r) => r.status === 'ok');
  // The original rows and the grown rows, side by side, whenever the selection mixes them.
  const mixed = ok.filter((r) => Object.keys(r.cohorts ?? {}).length > 1);
  if (mixed.length) {
    lines.push('');
    lines.push(`by cohort (original = the ${mixed[0].cohorts.original.n} rows of 2026-10-25 without a split; grown = rows mined since):`);
    for (const r of mixed) {
      for (const [c, m] of Object.entries(r.cohorts)) {
        lines.push(`${`${r.arm} ${c}`.padEnd(30)} n=${String(m.n).padStart(3)}  r@1 ${pct(m.recall_at1)}  r@5 ${pct(m.recall_at5)}  t@5 ${pct(m.technique_at5)} (of ${m.technique_n})`);
      }
    }
  }
  const rmArms = ok.filter((r) => r.arm.startsWith('research-map'));
  if (rmArms.length) {
    const missedAll = fx.queries.filter((q) => rmArms.every((r) => !r.rows.find((x) => x.id === q.id).at5));
    lines.push('');
    lines.push(`missed @${AT} by every research-map arm run (${missedAll.length}): ${missedAll.map((q) => `${q.id} "${q.terms.join(' / ')}" -> ${q.expect.subject}`).join('; ') || 'none'}`);
  }
  lines.push('');
  lines.push(`t@5 is over the ${fx.queries.filter((q) => q.expect.technique).length} rows with a labelled technique. dec = output tokens + documents opened, under the decision-cost MODEL in this script's header.`);
  return lines.join('\n');
}

async function main(argv) {
  const pick = (n, d) => {
    const i = argv.indexOf(n);
    return i === -1 ? d : argv[i + 1];
  };
  const asJson = argv.includes('--json');
  const fixturePath = path.resolve(pick('--fixture', DEFAULT_FIXTURE));
  const arms = String(pick('--arms', ARMS.join(','))).split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = arms.filter((a) => !ARMS.includes(a));
  if (unknown.length) throw new Fatal(`unknown arm(s): ${unknown.join(', ')}. Known: ${ARMS.join(', ')}`);
  const split = String(pick('--split', 'heldout'));
  const fx = selectSplit(loadFixture(fixturePath), split);
  if (!fx.queries.length) throw new Fatal(`split "${split}" selects no rows in ${fixturePath}`);

  const results = [];
  for (const arm of arms) {
    try {
      results.push(await runArm(arm, fx));
    } catch (e) {
      if (e instanceof Unavailable) results.push({ arm, status: 'unavailable', reason: e.message });
      else throw e;
    }
  }
  if (asJson) process.stdout.write(`${JSON.stringify({ schema: 'routing-bench-result/1', fixture: path.relative(ROOT, fixturePath).replace(/\\/g, '/'), generated: fx.generated, split, results }, null, 1)}\n`);
  else process.stdout.write(`${renderTable(fx, results, split)}\n`);
  return EXIT.OK;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  main(process.argv.slice(2)).then(
    (code) => { process.exitCode = code; },
    (e) => {
      if (e instanceof Fatal) {
        process.stderr.write(`routing-bench FATAL: ${e.message}\n`);
        process.exitCode = EXIT.FATAL;
      } else {
        process.stderr.write(`routing-bench FATAL (unexpected): ${e.stack ?? e}\n`);
        process.exitCode = EXIT.FATAL;
      }
    },
  );
}
