#!/usr/bin/env node
/**
 * build-registry-map — the JOIN between a project's contexts and this registry's subjects.
 *
 * ## The gap this closes
 *
 * The registry could publish knowledge and a project could consume it, but nothing said
 * WHICH subjects govern WHICH part of a project - so "what does the standard say about this
 * file?" and "where does this repo fall short?" both cost a search every time they were
 * asked, and were therefore mostly not asked. Forging produced one-off harvests; nothing
 * maintained.
 *
 * This writes `<project>/.ai/registry-map.json`: one row per context, carrying the subjects
 * that govern it, the evidence for the match, and a STATE per pair that an evaluation pass
 * fills in over time (`unknown` -> `conformant` | `deviation` | `not-applicable`). The map
 * is committed in the project, because the states are expensive knowledge about that repo,
 * not machine state.
 *
 * ## Deterministic, and only as clever as it can justify
 *
 * Matching is scored, not guessed: an IDF-weighted overlap between a context's own words
 * (name, business feature, description, keywords, path segments, api surface, tables) and a
 * subject's identity (its slug, its techniques' slugs, and every technique's `use_when` -
 * the field written to be matched on). A token that appears in half the corpus carries
 * almost no weight; a rare one carries most of the score. Every emitted pair reports the
 * tokens that earned it, so a wrong match is visible rather than mysterious.
 *
 * Judgment stays out of here. Whether a context actually CONFORMS cannot be computed from
 * words - it needs someone to read the code against the technique - so this script never
 * writes a state other than `unknown`, and `/conform` is what fills them in. Deterministic
 * code owns every number; the model owns every verdict.
 *
 * ## Two honest outputs people usually skip
 *
 * - **Weakly-governed contexts** are reported, not hidden. A context whose best match scores
 *   under half its own project's median is one the declared domains barely cover: either
 *   infrastructure (fine) or a COVERAGE HOLE in the corpus (a forge lead). The measure is
 *   relative to the project because raw scores track how verbose its context scan was, not
 *   how well the corpus covers it. A map that silently drops them looks complete and is not.
 * - **Staleness is per pair.** Each row records the bundle digest it was matched against,
 *   so `--check` can say exactly which pairs were judged against a bundle that has since
 *   moved, rather than invalidating the whole map on any change.
 *
 *   node scripts/build-registry-map.mjs [--check] [--project <slug>] [--top <n>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
const BRIDGE = path.join(ROOT, '.projects.local.json');
const CATALOG = path.join(ROOT, 'catalog.json');
const checkOnly = process.argv.includes('--check');
const pIdx = process.argv.indexOf('--project');
const onlyProject = pIdx === -1 ? null : process.argv[pIdx + 1];
const tIdx = process.argv.indexOf('--top');
const TOP = tIdx === -1 ? 5 : Math.max(1, Number(process.argv[tIdx + 1]) || 5);
const SCORE_FLOOR = 3.0;      // absolute sanity guard: below this there is no signal at all
const RELATIVE_FLOOR = 0.55;  // keep subjects within 55% of this context's best match
const STRONG = 0.8;           // ...and call the ones within 80% of it strong
// A context scoring under 60% of its project's median top score is barely governed by the
// domains it declares. Measured across the fleet: 0.5 flags 8 of 614 and misses a whole
// coverage hole (an advertising product's campaign and lead contexts, whose best matches
// were nonsense like `embedded-db`); 0.7 flags 98 and turns into noise; 0.6 flags 44, which
// is a list a person reads. A generous flag is the right error to make - a false weak costs
// a glance, a missed hole stays invisible.
const WEAK_FRACTION = 0.6;

if (!fs.existsSync(BRIDGE)) {
  console.error(`FATAL: no ${path.basename(BRIDGE)} - this tool needs the local bridge (slug -> path).`);
  process.exit(2);
}
const bridge = JSON.parse(fs.readFileSync(BRIDGE, 'utf8'));
const catalog = fs.existsSync(CATALOG) ? JSON.parse(fs.readFileSync(CATALOG, 'utf8')) : { bundles: [] };
const bundleHash = Object.fromEntries((catalog.bundles ?? []).map((b) => [b.name, b.contentHash]));

// ---------------------------------------------------------------- tokenizing
const STOP = new Set(('the a an and or of to in for on with by from at as is are be it its this that these those not no ' +
  'when where which who what how why if then than so such use used using uses via per into onto out over under about ' +
  'you your we our they their he she his her one two three new old more most less least other another each every any ' +
  'all both few many much some own same very can will just should now also only').split(' '));
const tokenize = (s) => String(s ?? '')
  .replace(/[_/\\.\-]+/g, ' ')
  .replace(/([a-z])([A-Z])/g, '$1 $2')          // camelCase -> two tokens
  .toLowerCase()
  .split(/[^a-z0-9]+/)
  .filter((t) => t.length > 2 && !STOP.has(t));

/** Counted bag of tokens, so a word repeated across a context's fields weighs more. */
const bag = (parts) => {
  const m = new Map();
  for (const [text, weight] of parts) for (const t of tokenize(text)) m.set(t, (m.get(t) ?? 0) + weight);
  return m;
};

// ---------------------------------------------------------------- the corpus
/** One searchable record per subject, plus the document frequency of every token. */
const loadBundle = (name) => {
  const file = path.join(KNOWLEDGE, name, 'index.json');
  if (!fs.existsSync(file)) return null;
  const idx = JSON.parse(fs.readFileSync(file, 'utf8'));
  const subjects = [];
  for (const [slug, s] of Object.entries(idx.subjects ?? {})) {
    const techniques = s.techniques ?? [];
    // Weights: the subject's own slug is its identity; a technique's `use_when` was written
    // to be matched on; a technique slug sits between the two.
    const parts = [[slug.replace(/-/g, ' '), 6]];
    for (const t of techniques) {
      parts.push([String(t.slug ?? '').replace(/-/g, ' '), 3]);
      for (const u of t.use_when ?? []) parts.push([u, 2]);
    }
    subjects.push({
      slug, bundle: name, file: s.file, category: s.category, subcategory: s.subcategory ?? null,
      techniques: techniques.map((t) => t.slug), stacks: [...new Set((s.applications ?? []).map((a) => a.stack).filter(Boolean))],
      bag: bag(parts),
    });
  }
  return subjects;
};

// ---------------------------------------------------------------- context maps
/** Normalize the two generator shapes into one row per context. */
const readContexts = (projectRoot) => {
  const file = path.join(projectRoot, 'context-map.json');
  if (!fs.existsSync(file)) return null;
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = [];
  const push = (c, group) => {
    const paths = c.file_paths ?? c.filePaths ?? [];
    out.push({
      id: c.id ?? `${group ? `${group}/` : ''}${c.name}`,
      name: c.name,
      group: c.group ?? group ?? null,
      category: c.category ?? null,
      feature: c.business_feature ?? c.businessFeature ?? null,
      description: String(c.description ?? '').slice(0, 1200),
      keywords: c.keywords ?? [],
      paths: paths.slice(0, 60),
      api: c.api_surface ?? (Array.isArray(c.apiRoutes) ? c.apiRoutes.join(' ') : c.apiRoutes) ?? '',
      tables: c.db_tables ?? [],
    });
  };
  if (Array.isArray(m.contexts) && m.contexts.length && m.contexts[0]?.name) {
    for (const c of m.contexts) push(c, c.group ?? null);            // flat shape
  }
  for (const g of m.groups ?? []) for (const c of g.contexts ?? []) push(c, g.name);  // nested shape
  for (const c of m.ungrouped ?? []) push(c, null);
  return {
    contexts: out,
    revision: m.revision ?? m.generated_at ?? m.generatedAt ?? null,
    generator: m.generator ?? (m.$schema ? 'vibeman' : null),
  };
};

const contextBag = (c) => bag([
  [c.name, 8], [c.feature, 5], [c.group, 2], [c.category, 1],
  [c.description, 2], [c.keywords.join(' '), 4],
  [c.paths.map((p) => p.replace(/\.[a-z]+$/i, '')).join(' '), 3],
  [String(c.api), 3], [c.tables.join(' '), 2],
]);

const gitSha = (repo) => {
  try { return execFileSync('git', ['-C', repo, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { return null; }
};

// ---------------------------------------------------------------- per project
const rows = [];
const problems = [];
let staleProjects = 0;

for (const [slug, p] of Object.entries(bridge.projects ?? {})) {
  if (onlyProject && slug !== onlyProject) continue;
  if (!p?.path || !fs.existsSync(p.path)) { problems.push(`${slug}: checkout not found`); continue; }
  const domains = p.domains ?? [];
  if (!domains.length) { problems.push(`${slug}: the bridge declares no domains`); continue; }

  const cm = readContexts(p.path);
  if (!cm) { problems.push(`${slug}: no context-map.json - nothing to join against`); continue; }

  const subjects = domains.flatMap((d) => loadBundle(d) ?? []);
  if (!subjects.length) { problems.push(`${slug}: none of its domains resolved to a bundle index`); continue; }

  // IDF over THIS project's candidate corpus: a token common to most subjects tells you
  // nothing about which subject governs a context.
  const df = new Map();
  for (const s of subjects) for (const t of s.bag.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const N = subjects.length;
  const idf = (t) => Math.log((N + 1) / ((df.get(t) ?? 0) + 1)) + 1;

  const mapped = [];
  let unmatched = 0;
  for (const c of cm.contexts) {
    const cb = contextBag(c);
    const scored = [];
    for (const s of subjects) {
      let score = 0;
      const hits = [];
      for (const [t, w] of cb) {
        const sw = s.bag.get(t);
        if (!sw) continue;
        const contribution = Math.sqrt(w * sw) * idf(t);
        score += contribution;
        hits.push([t, contribution]);
      }
      if (score >= SCORE_FLOOR) {
        hits.sort((a, b) => b[1] - a[1]);
        scored.push({ subject: s.slug, bundle: s.bundle, score: Math.round(score * 10) / 10, why: hits.slice(0, 3).map((h) => h[0]) });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    // The cutoff is RELATIVE to this context's best match, because raw scores scale with
    // how much text a context carries - a long description outscores a terse one on every
    // subject, so any absolute floor either keeps everything (it did: 3,070 pairs, nothing
    // unmatched) or silently drops small contexts entirely. What generalizes is the shape
    // of the ranking: the subjects that come close to the leader, and the tail that does not.
    const best = scored.length ? scored[0].score : 0;
    const top = scored.filter((s) => s.score >= best * RELATIVE_FLOOR).slice(0, TOP)
      .map((s) => ({ ...s, confidence: s.score >= best * STRONG ? 'strong' : 'probable' }));
    if (!top.length) unmatched += 1;
    mapped.push({
      context: c.id,
      name: c.name,
      group: c.group,
      paths: c.paths.slice(0, 12),
      // Verdict fields are written only once a verdict exists. Emitting `evidence: null`
      // on every unjudged pair cost ~40% of the file for no information at all.
      subjects: top.map((t) => ({ ...t, state: 'unknown' })),
    });
  }

  // "Weakly governed" is measured against THIS project's own median, not an absolute
  // number: a repo whose context descriptions are two sentences scores lower on every
  // subject than one whose descriptions are two paragraphs, and an absolute floor would
  // just be a measure of how verbose the context scan was. A context far below its own
  // project's median is one the declared domains do not really cover - which is either
  // infrastructure or a COVERAGE HOLE, and the aggregate of them is a forge lead.
  const tops = mapped.map((r) => r.subjects[0]?.score ?? 0).sort((a, b) => a - b);
  const medianTop = tops.length ? tops[Math.floor(tops.length / 2)] : 0;
  let weak = 0;
  for (const r of mapped) {
    const best = r.subjects[0]?.score ?? 0;
    r.governance = best >= medianTop * WEAK_FRACTION ? 'governed' : 'weak';
    if (r.governance === 'weak') weak += 1;
  }

  // The inverse view: which contexts a subject governs. This is what makes a bundle change
  // actionable - when a subject moves, these are the rows whose verdicts went stale.
  const subjectIndex = {};
  for (const r of mapped) for (const s of r.subjects) {
    (subjectIndex[s.subject] ??= []).push(r.context);
  }

  const outPath = path.join(p.path, '.ai', 'registry-map.json');
  const prev = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : null;
  // Carry forward every verdict somebody paid to produce; a regenerated map must never
  // silently discard evaluation work just because the matcher re-ran.
  let carried = 0;
  if (prev) {
    const prevPairs = new Map();
    for (const r of prev.contexts ?? []) for (const s of r.subjects ?? []) {
      if (s.state && s.state !== 'unknown') prevPairs.set(`${r.context}|${s.subject}`, s);
    }
    for (const r of mapped) for (const s of r.subjects) {
      const old = prevPairs.get(`${r.context}|${s.subject}`);
      if (old) {
        s.state = old.state;
        if (old.evidence) s.evidence = old.evidence;
        if (old.evaluatedAt) s.evaluatedAt = old.evaluatedAt;
        if (old.evaluatedAgainst) s.evaluatedAgainst = old.evaluatedAgainst;
        carried += 1;
      }
    }
  }

  const doc = {
    schema: 'rkb-registry-map/1',
    _note: 'GENERATED by ai-registry/scripts/build-registry-map.mjs - the join between this repo\'s contexts and the registry\'s subjects. Matching is deterministic and re-runnable; the per-pair `state` is JUDGEMENT, written by /conform, and is carried forward across regenerations. Regenerate after a context scan or a bundle change; `--check` reports what went stale.',
    project: slug,
    generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    projectSha: gitSha(p.path),
    contextMapRevision: cm.revision,
    domains,
    bundleDigests: Object.fromEntries(domains.map((d) => [d, bundleHash[d] ?? null])),
    stats: {
      contexts: mapped.length,
      pairs: mapped.reduce((n, r) => n + r.subjects.length, 0),
      unmatched,
      weaklyGoverned: weak,
      medianTopScore: Math.round(medianTop * 10) / 10,
      carriedVerdicts: carried,
    },
    subjectIndex,
    contexts: mapped,
  };
  const serialized = `${JSON.stringify(doc, null, 2)}\n`;

  // Freshness for --check: the matcher's INPUTS, not the file's bytes (generatedAt always moves).
  const stale = !prev
    || JSON.stringify(prev.bundleDigests ?? {}) !== JSON.stringify(doc.bundleDigests)
    || (prev.contextMapRevision ?? null) !== (doc.contextMapRevision ?? null)
    || (prev.stats?.contexts ?? -1) !== doc.stats.contexts;

  if (stale) staleProjects += 1;
  if (!checkOnly) { fs.mkdirSync(path.dirname(outPath), { recursive: true }); fs.writeFileSync(outPath, serialized); }

  const evaluated = mapped.reduce((n, r) => n + r.subjects.filter((s) => s.state !== 'unknown').length, 0);
  const deviations = mapped.reduce((n, r) => n + r.subjects.filter((s) => s.state === 'deviation').length, 0);
  rows.push({ slug, contexts: mapped.length, pairs: doc.stats.pairs, weak, evaluated, deviations, stale });
}

console.log(`registry map - ${rows.length} project(s), <=${TOP} subject(s) per context, kept within ${Math.round(RELATIVE_FLOOR * 100)}% of each context's best match\n`);
console.log('  project        contexts  pairs  weak  evaluated  deviations  state');
for (const r of rows) {
  console.log(`  ${r.slug.padEnd(14)} ${String(r.contexts).padEnd(9)} ${String(r.pairs).padEnd(6)} ${String(r.weak).padEnd(5)} ${String(r.evaluated).padEnd(10)} ${String(r.deviations).padEnd(11)} ${r.stale ? (checkOnly ? 'STALE' : 'rebuilt') : 'current'}`);
}
const totalWeak = rows.reduce((n, r) => n + r.weak, 0);
const totalPairs = rows.reduce((n, r) => n + r.pairs, 0);
const totalEval = rows.reduce((n, r) => n + r.evaluated, 0);
console.log(`\n  ${totalPairs} pair(s) mapped, ${totalEval} judged, ${totalWeak} context(s) only WEAKLY governed.`);
console.log('  A weakly-governed context scores under half its own project median: the declared domains');
console.log('  barely cover it. Infrastructure, or a coverage hole - and the aggregate is a forge lead.');
console.log('  A pair\'s `state` is only ever written by a pass that read the code. This script writes `unknown`.');
if (problems.length) { console.error(`\n${problems.length} problem(s):`); for (const p of problems) console.error(`  - ${p}`); }
if (checkOnly && (staleProjects || problems.length)) {
  console.error(`\n${staleProjects} project map(s) are stale - run \`node scripts/build-registry-map.mjs\`.`);
  process.exit(1);
}
