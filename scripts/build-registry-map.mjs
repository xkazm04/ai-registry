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
 * Matching is scored, not guessed: a doubly-IDF-weighted overlap between a context's own
 * words (name, business feature, description, keywords, path segments, api surface, tables)
 * and a subject's identity (its slug, its techniques' slugs, and every technique's
 * `use_when` - the field written to be matched on). A token counts only when it is
 * distinctive on BOTH sides: rare among the corpus's subjects AND rare among this project's
 * contexts. One-sided weighting is not a detail - measured, it put `test-harness` on 63% of
 * one project's contexts, because every context's file list carries `*.test.ts` and `test`
 * is rare among subjects while being near-universal among contexts. Every emitted pair
 * reports the tokens that earned it, so a wrong match is visible rather than mysterious.
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
 * ## Two gates the first backtest wave demanded (2026-08-29, 150 pairs judged)
 *
 * - **A pair must be grounded in a trigger, not only in a name.** Twelve-plus pairs in that
 *   wave were lexical resonance: the credential vault matched `markdown-vault` on the word
 *   *vault*, a template wizard matched `adoption-measurement` on a directory name, a shell
 *   gate harness matched `eval-harness` on *harness*. Every worker proposed the same fix -
 *   route by the subject's precondition, not its vocabulary. The index carries no golden-
 *   path precondition, but every technique's `use_when` was written as exactly that: the
 *   condition under which the technique applies. So each pair now records where its score
 *   came from. A pair whose `use_when` share is below `GROUNDING_FLOOR` is marked
 *   `grounding: "lexical-only"` and capped at `probable` - never `strong` - so a conform
 *   worker skips it by default and a reader sees why it is there. It is still emitted:
 *   a name match is a lead for a missing pairing, not nothing.
 *
 *   **The second wave measured four sharper versions of this gate and shipped none of
 *   them (2026-08-31.)** That wave judged 110 more pairs, taking the fleet to 287 labelled
 *   verdicts, and ten workers repeated the first wave's complaint: `markdown-vault` onto a
 *   credential vault (10 of 13 pairs in one project), `eval-harness` onto candidate
 *   comparison because both domains say *eval*, `agent-cli-transport` onto a UI context
 *   scoring 324 on the single token *matrix*.
 *
 *   A `not-applicable` verdict IS the matcher's error; `conformant` and `deviation` are
 *   both its successes, since the subject governs there either way. That makes the
 *   labelled set a backtest, so the candidates were measured rather than argued:
 *
 *       variant                        n/a rate   real pairs kept
 *       baseline                         24.5%         97.7%
 *       scaffolding-token stoplist       23.2%         95.3%
 *       path weight 3 -> 1               23.2%         96.7%
 *       ambiguity penalty (df >= 12)     23.0%         96.7%
 *       all three together               22.0%         92.6%
 *       drop lexical-only entirely       22.6%         84.2%
 *
 *   Every one trades about one real governance pair for one bad pair. Buying 2.5 points of
 *   precision by discarding sixteen real pairs is not an improvement, and dropping
 *   lexical-only outright costs a sixth of everything the matcher correctly found. The
 *   per-token intuition behind them - that *vault* and *eval* are the problem - is NOT
 *   supported: those tokens are polysemous, and they are also how the right pairs are
 *   found. Removing them costs as much true signal as it saves.
 * - **A subject this project keeps judging not-applicable is ranked down (2026-08-31).**
 *   What separates the pairs is evidence the fleet already paid for. Measured leave-one-out
 *   over the same 287 verdicts: "this subject already has >= 2 not-applicable verdicts in
 *   this project, and more not-applicable than governed" predicts a further not-applicable
 *   at **69% precision, 57% recall** - better than 2:1, where every token fix was 1:1.
 *   So an unjudged pair carries `priorNotApplicable` when its subject has that record here.
 *   It is a RANKING hint, never a filter: the pair is still emitted and still judgeable, one
 *   `conformant` verdict weakens the prior that produced it, and being wrong about it costs
 *   a glance - unlike dropping a pair, which is invisible.
 * - **A path that no longer exists must not feed the match.** At least thirty listed paths
 *   in that wave's briefs were gone and two contexts were entirely dead; a worker cannot
 *   tell deleted from renamed-and-still-governed. Missing paths are dropped from the bag,
 *   listed on the row as `pathsMissing`, and a context with no surviving path is marked
 *   `governance: "dead"` with no subjects scored - its carried verdicts survive, its
 *   matcher output does not.
 *
 *   node scripts/build-registry-map.mjs [--check] [--project <slug>] [--top <n>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadBridge } from './lib/projects.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
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
// Share of a pair's score that must come from technique `use_when` tokens - the written
// trigger conditions - for the pair to count as grounded. Below it the match is the
// subject's name echoing in the repo's vocabulary, which the first backtest wave measured
// as the dominant mispairing shape.
const GROUNDING_FLOOR = 0.25;

const fleet = loadBridge(ROOT)._fleet;
if (!fleet.machine && !Object.keys(fleet.projects).length) {
  console.error('FATAL: this machine has no resolvable fleet.');
  for (const p of fleet.problems) console.error(`  - ${p}`);
  console.error('  Expected a committed projects.json plus a local .machine.local.json (see librarian/projects.md).');
  process.exit(2);
}
const bridge = fleet;
const catalog = fs.existsSync(CATALOG) ? JSON.parse(fs.readFileSync(CATALOG, 'utf8')) : { bundles: [] };
const bundleHash = Object.fromEntries((catalog.bundles ?? []).map((b) => [b.name, b.contentHash]));

// ---------------------------------------------------------- subject staleness
// Per-subject digests from each bundle index (`build-index` writes them). A verdict is
// judged against ONE subject, so it goes stale when THAT subject moves - not when any of
// the bundle's other 155 do. Before this (2026-09-02) staleness was the bundle digest and
// every judged pair in the fleet read STALE the day after any landing, which is the same
// as never reading stale. This is the join that makes a `/deepen` landing actionable
// downstream: the pairs whose `evaluatedAgainst` no longer equals their subject's digest.
const subjectDigest = {};           // `${bundle}/${slug}` -> digest
for (const b of fs.readdirSync(KNOWLEDGE, { withFileTypes: true })) {
  if (!b.isDirectory()) continue;
  const idxPath = path.join(KNOWLEDGE, b.name, 'index.json');
  if (!fs.existsSync(idxPath)) continue;
  const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
  for (const [slug, s] of Object.entries(idx.subjects ?? {})) {
    if (s.digest) subjectDigest[`${b.name}/${slug}`] = s.digest;
  }
}
// Verdicts written before subject digests existed carry the BUNDLE digest in
// `evaluatedAgainst`. Those are not all stale - most subjects did not move - so they are
// re-dated from git: the subject folder's last commit date against the verdict's own
// `evaluatedAt`. Unchanged since the verdict -> upgraded in place to the subject digest;
// changed -> stale. Same-day is ambiguous and counts as stale (the cheaper error).
const lastChangedCache = new Map();
const subjectLastChanged = (bundle, slug) => {
  const key = `${bundle}/${slug}`;
  if (lastChangedCache.has(key)) return lastChangedCache.get(key);
  let date = null;
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE, bundle, 'index.json'), 'utf8'));
    const file = idx.subjects?.[slug]?.file;
    if (file) {
      const dir = path.dirname(path.join(ROOT, file));
      date = execFileSync('git', ['log', '-1', '--format=%cs', '--', dir], { cwd: ROOT, encoding: 'utf8' }).trim() || null;
    }
  } catch { date = null; }
  lastChangedCache.set(key, date);
  return date;
};
const isStaleVerdict = (s) => {
  if (!s.state || s.state === 'unknown') return false;
  const current = subjectDigest[`${s.bundle}/${s.subject}`];
  if (!current) return false;                       // subject gone from the index: reported elsewhere
  if (s.evaluatedAgainst === current) return false;
  const legacy = s.evaluatedAgainst && !Object.values(subjectDigest).includes(s.evaluatedAgainst);
  if (legacy && s.evaluatedAt) {
    const changed = subjectLastChanged(s.bundle, s.subject);
    if (changed && changed < s.evaluatedAt) { s.evaluatedAgainst = current; return false; }
  }
  return true;
};

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
    const triggerParts = [];
    for (const t of techniques) {
      parts.push([String(t.slug ?? '').replace(/-/g, ' '), 3]);
      for (const u of t.use_when ?? []) { parts.push([u, 2]); triggerParts.push([u, 1]); }
    }
    subjects.push({
      slug, bundle: name, file: s.file, category: s.category, subcategory: s.subcategory ?? null,
      techniques: techniques.map((t) => t.slug), stacks: [...new Set((s.applications ?? []).map((a) => a.stack).filter(Boolean))],
      bag: bag(parts),
      // The tokens that came from a written trigger condition, kept apart so a pair can say
      // how much of its score is precondition and how much is the subject's own name.
      // The subject's own name is excluded on purpose: `markdown-vault`'s triggers say
      // "vault" too, and a credential vault echoing that word is the mispairing this gate
      // exists to catch. Grounding must come from the condition, never from the noun.
      triggerTokens: (() => { const own = new Set(tokenize(slug)); return new Set([...bag(triggerParts).keys()].filter((t) => !own.has(t))); })(),
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

  // The SECOND half of the same idea, and the join does not work without it. IDF over
  // subjects asks "how distinctive is this token in the corpus"; it cannot see a token that
  // is ubiquitous in the PROJECT. Every context's file list carries `*.test.ts`, so `test`
  // is rare among subjects (high subject-idf) and near-universal among contexts - which put
  // `test-harness` on 63% of one project's contexts as a top match. Weighting by both sides
  // keeps a token only when it is distinctive in the corpus AND distinctive in the repo.
  // A listed path that no longer exists must not feed the match: its name is the one thing
  // a dead file still has, and it is exactly what the matcher scores on.
  let contextsWithMissing = 0;
  let dead = 0;
  for (const c of cm.contexts) {
    c.pathsMissing = c.paths.filter((rel) => !fs.existsSync(path.join(p.path, rel)));
    if (c.pathsMissing.length) contextsWithMissing += 1;
    c.dead = c.paths.length > 0 && c.pathsMissing.length === c.paths.length;
    if (c.dead) dead += 1;
    c.paths = c.paths.filter((rel) => !c.pathsMissing.includes(rel));
  }
  const bags = cm.contexts.map((c) => contextBag(c));
  const cdf = new Map();
  for (const b of bags) for (const t of b.keys()) cdf.set(t, (cdf.get(t) ?? 0) + 1);
  const C = bags.length;
  const cidf = (t) => Math.log((C + 1) / ((cdf.get(t) ?? 0) + 1)) + 1;

  const mapped = [];
  let unmatched = 0;
  for (const [ci, c] of cm.contexts.entries()) {
    const cb = bags[ci];
    const scored = [];
    for (const s of subjects) {
      if (c.dead) break;
      let score = 0;
      let triggerScore = 0;
      const hits = [];
      for (const [t, w] of cb) {
        const sw = s.bag.get(t);
        if (!sw) continue;
        const contribution = Math.sqrt(w * sw) * idf(t) * cidf(t);
        score += contribution;
        if (s.triggerTokens.has(t)) triggerScore += contribution;
        hits.push([t, contribution]);
      }
      if (score >= SCORE_FLOOR) {
        hits.sort((a, b) => b[1] - a[1]);
        const grounding = triggerScore / score >= GROUNDING_FLOOR ? 'use_when' : 'lexical-only';
        scored.push({ subject: s.slug, bundle: s.bundle, score: Math.round(score * 10) / 10, why: hits.slice(0, 3).map((h) => h[0]), grounding, digest: subjectDigest[`${s.bundle}/${s.slug}`] ?? null });
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
      .map((s) => ({ ...s, confidence: s.score >= best * STRONG && s.grounding === 'use_when' ? 'strong' : 'probable' }));
    if (!top.length && !c.dead) unmatched += 1;
    mapped.push({
      context: c.id,
      name: c.name,
      group: c.group,
      paths: c.paths.slice(0, 12),
      ...(c.pathsMissing.length ? { pathsMissing: c.pathsMissing.slice(0, 12) } : {}),
      ...(c.dead ? { governance: 'dead' } : {}),
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
    if (r.governance === 'dead') continue;
    r.governance = best >= medianTop * WEAK_FRACTION ? 'governed' : 'weak';
    if (r.governance === 'weak') weak += 1;
    // `strong` is now relative to the leader AND to the project: a context whose own leader
    // is below the project median has no strong pairs, only a best guess among weak ones.
    // Without this, a context nothing matches well reports five "strong" subjects purely
    // because they are all close to a low leader - which is how five wrong subjects came
    // back strong for a context whose real governing subject scored zero.
    for (const s of r.subjects) {
      if (s.confidence === 'strong' && best < medianTop) s.confidence = 'probable';
    }
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
  let restored = 0;
  if (prev) {
    const prevPairs = new Map();
    for (const r of prev.contexts ?? []) for (const s of r.subjects ?? []) {
      if ((s.state && s.state !== 'unknown') || s.source === 'conform') prevPairs.set(`${r.context}|${s.subject}`, s);
    }
    const byContext = new Map(mapped.map((r) => [r.context, r]));
    for (const r of mapped) for (const s of r.subjects) {
      const old = prevPairs.get(`${r.context}|${s.subject}`);
      if (old) {
        s.state = old.state;
        if (old.evidence) s.evidence = old.evidence;
        if (old.evaluatedAt) s.evaluatedAt = old.evaluatedAt;
        if (old.evaluatedAgainst) s.evaluatedAgainst = old.evaluatedAgainst;
        if (old.source) s.source = old.source;
        carried += 1;
        prevPairs.delete(`${r.context}|${s.subject}`);
      }
    }
    // Anything left is a pair the matcher did NOT produce this time but somebody paid to
    // establish: a verdict on a pair that has since dropped out of the ranking, or - the
    // important case - a pairing a `/conform` run ADDED because lexical matching missed it.
    //
    // It misses more than you would guess. Measured on the first real run: a context about
    // "Provider Integrations" was correctly governed by `connector-catalog`, which the
    // matcher scored at zero, because the repo says provider/integration where the subject
    // says connector/catalog/adapter. Word overlap cannot see a concept living under a
    // different name, so the map has to be able to learn one and keep it.
    for (const [key, old] of prevPairs) {
      const ctx = key.slice(0, key.lastIndexOf('|'));
      const row = byContext.get(ctx);
      if (!row) continue;
      row.subjects.push({ ...old, digest: subjectDigest[`${old.bundle}/${old.subject}`] ?? old.digest ?? null, source: old.source ?? 'retained' });
      restored += 1;
    }

    // A subject this project keeps judging not-applicable is unlikely to govern the next
    // context either. Tallied AFTER the restore above, so a verdict on a pair the matcher
    // no longer proposes still counts - it was paid for the same way. Never tallied from
    // the matcher's own scores: this is the one signal in the file a human established.
    // Backtested at 69% precision / 57% recall over 287 verdicts, where every token-level
    // fix measured 1:1 (see the header).
    const naTally = new Map();
    for (const r of mapped) for (const s of r.subjects) {
      if (!s.state || s.state === 'unknown') continue;
      const t = naTally.get(s.subject) ?? { na: 0, governed: 0 };
      if (s.state === 'not-applicable') t.na += 1; else t.governed += 1;
      naTally.set(s.subject, t);
    }
    for (const r of mapped) for (const s of r.subjects) {
      if (s.state && s.state !== 'unknown') continue;   // a real verdict outranks a prior
      const t = naTally.get(s.subject);
      if (t && t.na >= 2 && t.na > t.governed) s.priorNotApplicable = t.na;
    }
  }

  // Stale verdicts: the pairs a bundle change actually touched. Tallied per subject so a
  // landing can be read back as "these contexts in these projects now hold a claim about
  // a document that changed". `/conform --stale` consumes the flag; the header count is
  // what a session sees before trusting any state in this file.
  const staleBySubject = {};
  let staleVerdicts = 0;
  for (const r of mapped) for (const s of r.subjects) {
    if (isStaleVerdict(s)) {
      s.stale = true;
      staleVerdicts += 1;
      (staleBySubject[s.subject] ??= []).push(r.context);
    } else {
      delete s.stale;
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
      deadContexts: dead,
      contextsWithMissingPaths: contextsWithMissing,
      lexicalOnlyPairs: mapped.reduce((n, r) => n + r.subjects.filter((s) => s.grounding === 'lexical-only').length, 0),
      medianTopScore: Math.round(medianTop * 10) / 10,
      carriedVerdicts: carried,
      restoredPairs: restored,
      staleVerdicts,
    },
    staleSubjects: staleBySubject,
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
  rows.push({ slug, contexts: mapped.length, pairs: doc.stats.pairs, weak, evaluated, deviations, stale, dead, lexical: doc.stats.lexicalOnlyPairs, missing: contextsWithMissing, staleVerdicts, staleBySubject });
}

console.log(`registry map - ${rows.length} project(s), <=${TOP} subject(s) per context, kept within ${Math.round(RELATIVE_FLOOR * 100)}% of each context's best match\n`);
console.log('  project        contexts  pairs  weak  evaluated  deviations  stale-verdicts  state    dead  stale-paths  lexical-only');
for (const r of rows) {
  console.log(`  ${r.slug.padEnd(14)} ${String(r.contexts).padEnd(9)} ${String(r.pairs).padEnd(6)} ${String(r.weak).padEnd(5)} ${String(r.evaluated).padEnd(10)} ${String(r.deviations).padEnd(11)} ${String(r.staleVerdicts).padEnd(15)} ${(r.stale ? (checkOnly ? 'STALE' : 'rebuilt') : 'current').padEnd(8)} ${String(r.dead).padEnd(5)} ${String(r.missing).padEnd(12)} ${r.lexical}`);
}
// The impact view: which subjects moved under which projects' verdicts. This is the list a
// registry landing owes its consumers - read it after `/deepen` or `/librarian run`, and
// hand each line to that project's `/conform --stale`.
const impact = {};
for (const r of rows) for (const [subject, ctxs] of Object.entries(r.staleBySubject)) {
  (impact[subject] ??= []).push(`${r.slug} (${ctxs.length})`);
}
const impactRows = Object.entries(impact).sort((a, b) => b[1].length - a[1].length);
if (impactRows.length) {
  console.log(`\n  ${rows.reduce((n, r) => n + r.staleVerdicts, 0)} verdict(s) judged against a subject that has since changed, by subject:`);
  for (const [subject, where] of impactRows.slice(0, 25)) console.log(`    ${subject.padEnd(36)} ${where.join(', ')}`);
  if (impactRows.length > 25) console.log(`    ... and ${impactRows.length - 25} more subject(s)`);
  console.log('  Each project\'s map lists them under `staleSubjects`; `/conform --stale` re-judges them.');
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
