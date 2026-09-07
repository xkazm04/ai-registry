#!/usr/bin/env node
/**
 * recipe-map - terms -> prior art in the `recipes/` lane.
 *
 *   node scripts/recipe-map.mjs "burn rate alerting" "error budget"
 *   node scripts/recipe-map.mjs --json "dunning" "involuntary churn"
 *   node scripts/recipe-map.mjs --domain software_engineering "flaky test"
 *
 * The sibling of `research-map.mjs`, which does this for knowledge bundles. Same
 * contract and the same reason for existing: an agent asking "do we already have
 * this?" over a hundred-odd recipes will either grep for one word and miss the
 * neighbour, or read everything and burn the run. Neither scales, and both are
 * silent when wrong.
 *
 * WHAT IT DECIDES: nothing. It puts you in the neighbourhood; you still open the
 * recipe. A `none` verdict is the one answer worth acting on directly, and even
 * that is a claim about these terms rather than about the corpus.
 *
 * THE ADDRESS RULE: every hit carries the `path` recorded in `recipes/index.json`.
 * That string is the recipe's address. The lane is nested and its depth is ours to
 * change, so a constructed path writes into a folder no consumer walks.
 *
 * Exit codes, deliberately different because they lead to opposite next moves:
 *   0  ran, and reported (hits or a clean `none`)
 *   2  the instrument itself failed (no index, unreadable, self-test failed)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'recipes', 'index.json');
const LANE = path.join(ROOT, 'recipes');

// ---------------------------------------------------------------- measurement
// Kept pure and tiny so the fixture below can pin every one of them.

/** Words worth matching on: lowercase, no punctuation, no stopwords, 3+ chars. */
export const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'over',
  'than', 'then', 'when', 'what', 'which', 'who', 'why', 'how', 'are', 'was', 'were', 'been',
  'has', 'have', 'had', 'not', 'but', 'its', 'it', 'a', 'an', 'of', 'to', 'in', 'on', 'at',
  'by', 'or', 'as', 'is', 'be', 'do', 'does', 'per', 'via', 'one', 'two', 'any', 'all']);

export const tokens = (s) => String(s ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9\s_-]/g, ' ')
  .split(/[\s_-]+/)
  .filter((w) => w.length >= 3 && !STOP.has(w));

/**
 * Score one term against one recipe's searchable text.
 * Weighted by WHERE a word matched, because a title match and a guidance match
 * are different claims about relevance.
 */
export const scoreOne = (termTokens, fields) => {
  if (!termTokens.length) return { score: 0, where: [] };
  const weights = { title: 6, slug: 5, topic: 4, use_cases: 3, need: 3, core_action: 3, guidance: 2, outcomes: 2, activities: 2, connector_types: 2 };
  let score = 0;
  const where = new Set();
  for (const [field, weight] of Object.entries(weights)) {
    const hay = fields[field];
    if (!hay) continue;
    let hit = 0;
    for (const t of termTokens) if (hay.includes(t)) hit += 1;
    if (hit) { score += weight * (hit / termTokens.length); where.add(field); }
  }
  return { score: Math.round(score * 100) / 100, where: [...where] };
};

/** The verdict a caller acts on. Deliberately three states, not two. */
export const verdictFor = (best) => (best >= 6 ? 'strong' : best >= 2.5 ? 'related' : 'none');

// -------------------------------------------------------------------- fixture
// The instrument asserts itself before it reports anything, the house rule every
// script in this repository runs on: a matcher that finds nothing and a matcher
// that is broken produce the same silence.
function selfTest() {
  const problems = [];
  const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
  eq(tokens('Error-budget burn RATE, for the alert'), ['error', 'budget', 'burn', 'rate', 'alert'], 'tokens');
  eq(tokens('a of to'), [], 'tokens(stopwords only)');
  const f = { title: 'error budget burn rate alerting', guidance: 'burn rate windows' };
  const s = scoreOne(['error', 'budget'], f);
  eq(s.where.sort(), ['title'], 'scoreOne(where)');
  if (!(s.score > 5)) problems.push(`scoreOne(score): ${s.score} should exceed 5 for a full title match`);
  eq(scoreOne(['nonexistentword'], f), { score: 0, where: [] }, 'scoreOne(miss)');
  eq([verdictFor(9), verdictFor(3), verdictFor(1)], ['strong', 'related', 'none'], 'verdictFor');
  return problems;
}

const problems = selfTest();
if (problems.length) {
  console.error('recipe-map SELF-TEST FAILED - the instrument is broken, not the corpus:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(2);
}

// ----------------------------------------------------------------------- load
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const di = argv.indexOf('--domain');
const domainFilter = di >= 0 ? argv[di + 1] : null;
const terms = argv.filter((a, i) => !a.startsWith('--') && !(di >= 0 && i === di + 1));

if (!terms.length) {
  console.error('usage: node scripts/recipe-map.mjs [--json] [--domain <d>] "<term>" ["<term>" ...]');
  process.exit(2);
}
if (!fs.existsSync(INDEX)) {
  console.error(`recipe-map: no ${path.relative(ROOT, INDEX)} - run scripts/build-recipes-index.mjs first`);
  process.exit(2);
}

let index;
try { index = JSON.parse(fs.readFileSync(INDEX, 'utf8')); }
catch (e) { console.error(`recipe-map: index does not parse (${e.message})`); process.exit(2); }

const corpus = [];
for (const [slug, meta] of Object.entries(index.recipes ?? {})) {
  if (domainFilter && meta.domain !== domainFilter) continue;
  const file = path.join(ROOT, meta.path, 'recipe.json');
  let o = {};
  try { o = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* indexed but unreadable: still searchable by its index fields */ }
  const low = (v) => String(v ?? '').toLowerCase();
  corpus.push({
    slug,
    path: meta.path,
    domain: meta.domain,
    topic: meta.topic,
    title: meta.title,
    trigger: meta.recommended_trigger_kind,
    connector_types: meta.connector_types ?? [],
    fields: {
      title: low(meta.title),
      slug: low(slug).replace(/-/g, ' '),
      topic: low(meta.topic).replace(/-/g, ' '),
      use_cases: low((o.use_cases ?? []).join(' ')),
      need: low(o.description?.need),
      core_action: low(o.description?.core_action),
      guidance: low(o.guidance),
      outcomes: low((o.outcomes ?? []).map((x) => `${x.statement} ${(x.success_criteria ?? []).join(' ')}`).join(' ')),
      activities: low((o.activities ?? []).map((a) => a.label).join(' ')),
      connector_types: low((meta.connector_types ?? []).join(' ')),
    },
  });
}
if (!corpus.length) {
  console.error(`recipe-map: the index holds no recipes${domainFilter ? ` in domain "${domainFilter}"` : ''} - looked at nothing, which is not the same as found nothing`);
  process.exit(2);
}

// ---------------------------------------------------------------------- match
const results = terms.map((term) => {
  const tt = tokens(term);
  const hits = corpus
    .map((r) => ({ r, ...scoreOne(tt, r.fields) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return { term, tokens: tt, verdict: verdictFor(hits[0]?.score ?? 0), hits };
});

if (asJson) {
  console.log(JSON.stringify({
    corpus: corpus.length,
    domain: domainFilter ?? null,
    results: results.map((x) => ({
      term: x.term,
      verdict: x.verdict,
      hits: x.hits.map((h) => ({ slug: h.r.slug, path: h.r.path, domain: h.r.domain, topic: h.r.topic, title: h.r.title, trigger: h.r.trigger, connector_types: h.r.connector_types, score: h.score, matched_in: h.where })),
    })),
  }, null, 2));
  process.exit(0);
}

console.log(`recipe-map: ${terms.length} term(s) against ${corpus.length} recipe(s)${domainFilter ? ` in ${domainFilter}` : ''}\n`);
for (const x of results) {
  const label = { strong: 'STRONG prior art', related: 'related', none: 'NONE' }[x.verdict];
  console.log(`"${x.term}"  ->  ${label}`);
  if (!x.hits.length) console.log('    nothing scored above zero. Either the corpus lacks this work, or your term uses the source\'s vocabulary rather than the corpus\'s.');
  for (const h of x.hits) {
    console.log(`    ${h.score.toFixed(1).padStart(5)}  ${h.r.slug}`);
    console.log(`           ${h.r.path}  [${h.r.trigger}${h.r.connector_types.length ? ', ' + h.r.connector_types.join('/') : ''}]  matched in ${h.where.join(', ')}`);
  }
  console.log('');
}
console.log('The path is the address; open the recipe before deciding. A `none` is a claim');
console.log('about these terms, not about the corpus: try the corpus\'s own vocabulary too.');
