// routing-bench fixture and parser tests. These check the instrument, not the router:
// the bench itself is too slow for run-tests (research-map --prose reads every document
// per query), so nothing here spawns it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_FIXTURE, validateFixture, parseResearchMapText, scoreAnswer, runArm, splitFor, selectSplit, cohortOf } from '../routing-bench.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fx = JSON.parse(fs.readFileSync(DEFAULT_FIXTURE, 'utf8'));

const indexes = new Map();
for (const d of fs.readdirSync(path.join(ROOT, 'knowledge'), { withFileTypes: true })) {
  const p = path.join(ROOT, 'knowledge', d.name, 'index.json');
  if (d.isDirectory() && fs.existsSync(p)) indexes.set(d.name, JSON.parse(fs.readFileSync(p, 'utf8')));
}
const anySubject = (slug) => [...indexes.values()].some((ix) => ix.subjects?.[slug]);
const subjectOf = (domain, slug) => indexes.get(domain)?.subjects?.[slug] ?? null;

/**
 * Slug-literal: the row's joined terms ARE an expected slug, in kebab or spaced form.
 * Such a query only proves a router can echo a name it was handed; the set caps them.
 */
const spaced = (s) => s.replace(/-/g, ' ');
function isSlugLiteral(q) {
  const joined = q.terms.join(' ').trim().toLowerCase();
  const slugs = [q.expect.subject, ...q.expect.alt_subjects, q.expect.technique].filter(Boolean);
  return slugs.some((s) => joined === s || joined === spaced(s));
}

// The 2026-10-25 held-out set, by id. These rows carry no `split`, stay byte-for-byte, and the
// recall floor below is measured on exactly them, whatever the fixture grows into.
const ORIGINAL_IDS = Array.from({ length: 38 }, (_, i) => `q${String(i + 1).padStart(2, '0')}`);
const original = { ...fx, queries: fx.queries.filter((q) => ORIGINAL_IDS.includes(q.id)) };
const grown = fx.queries.filter((q) => !ORIGINAL_IDS.includes(q.id));

test('fixture parses against the routing-bench/1 schema', () => {
  assert.deepEqual(validateFixture(fx), []);
  assert.equal(original.queries.length, 38, 'the 38 original rows are all present');
});

test('split protocol: original rows carry no split; every grown row carries splitFor(id)', () => {
  for (const q of original.queries) {
    assert.equal(q.split, undefined, `${q.id} is an original row`);
    assert.equal(cohortOf(q), 'original');
  }
  for (const q of grown) {
    assert.ok(q.split === 'dev' || q.split === 'heldout', `${q.id}: split missing`);
    assert.equal(q.split, splitFor(q.id), `${q.id}: split must be the stable hash of its id, never hand-picked`);
    assert.equal(cohortOf(q), 'grown');
  }
  assert.equal(selectSplit(fx, 'heldout').queries.length + selectSplit(fx, 'dev').queries.length, fx.queries.length);
  assert.ok(selectSplit(fx, 'heldout').queries.length >= 38, 'original rows count as heldout');
  assert.equal(selectSplit(fx, 'all'), fx);
  assert.throws(() => selectSplit(fx, 'test'), /unknown split/);
  assert.ok(validateFixture({ ...fx, queries: [{ ...fx.queries[0], split: 'train' }] }).some((e) => e.includes('split')));
});

test('grown rows: transcript-labelled, at most three rows per owning subject across the fixture, no exact duplicates', () => {
  for (const q of grown) {
    assert.equal(q.source, 'transcript', `${q.id}: a grown row is labelled by behaviour, so it comes from a transcript`);
    assert.match(q.note, /opened/, `${q.id}: the note names what the session opened`);
  }
  const per = new Map();
  for (const q of fx.queries) per.set(q.expect.subject, [...(per.get(q.expect.subject) ?? []), q.id]);
  for (const [s, ids] of per) {
    if (ids.some((id) => !ORIGINAL_IDS.includes(id))) assert.ok(ids.length <= 3, `${s} owns ${ids.length} rows (${ids.join(', ')}); the cap is 3`);
  }
  const keys = fx.queries.map((q) => q.terms.join(' | ').toLowerCase());
  assert.equal(new Set(keys).size, keys.length, 'no two rows ask the same terms');
});

test('validator rejects a broken fixture rather than passing it', () => {
  const bad = { schema: 'routing-bench/1', generated: '2026-10-25', queries: [
    { id: 'x', terms: ['a'], expect: { domain: 'd', subject: 's', technique: null, alt_subjects: [] }, source: 'transcript', rewritten: false, note: 'n' },
    { id: 'x', terms: [], expect: { domain: 'd', subject: '', technique: 7, alt_subjects: 'no' }, source: 'guess', rewritten: 'no', note: '' },
  ] };
  const errs = validateFixture(bad);
  for (const want of ['duplicate id', 'terms', 'expect.subject', 'expect.technique', 'alt_subjects', 'source', 'rewritten', 'note']) {
    assert.ok(errs.some((e) => e.includes(want)), `expected an error mentioning ${want}: ${errs.join(' | ')}`);
  }
});

test('ids are unique', () => {
  const ids = fx.queries.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every expected subject, alt subject and technique exists in the current index', () => {
  const problems = [];
  for (const q of fx.queries) {
    const s = subjectOf(q.expect.domain, q.expect.subject);
    if (!s) problems.push(`${q.id}: ${q.expect.domain}/${q.expect.subject} not in the index`);
    for (const alt of q.expect.alt_subjects) if (!anySubject(alt)) problems.push(`${q.id}: alt ${alt} not in any index`);
    if (s && q.expect.technique && !(s.techniques ?? []).some((t) => t.slug === q.expect.technique)) {
      problems.push(`${q.id}: technique ${q.expect.technique} not under ${q.expect.subject}`);
    }
  }
  assert.deepEqual(problems, [], 'a subject or technique was renamed or removed: relabel the row, never delete it silently');
});

test('the set spans at least 3 domains', () => {
  assert.ok(new Set(fx.queries.map((q) => q.expect.domain)).size >= 3);
});

test('synthetic share is at most 40%', () => {
  const synth = fx.queries.filter((q) => q.source === 'synthetic').length;
  assert.ok(synth / fx.queries.length <= 0.4, `${synth}/${fx.queries.length} synthetic`);
});

test('slug-literal share is at most 1/3', () => {
  assert.equal(isSlugLiteral({ terms: ['mcp-tools'], expect: { subject: 'mcp-tools', alt_subjects: [], technique: null } }), true);
  assert.equal(isSlugLiteral({ terms: ['mcp tools'], expect: { subject: 'mcp-tools', alt_subjects: [], technique: null } }), true);
  assert.equal(isSlugLiteral({ terms: ['which mcp tools'], expect: { subject: 'mcp-tools', alt_subjects: [], technique: null } }), false);
  const lit = fx.queries.filter(isSlugLiteral).length;
  assert.ok(lit / fx.queries.length <= 1 / 3, `${lit}/${fx.queries.length} slug-literal`);
});

test('at least 4 prose-only rows, each carried by body text and not by the routing fields', () => {
  const rows = fx.queries.filter((q) => q.note.startsWith('prose-only'));
  assert.ok(rows.length >= 4, `${rows.length} prose-only rows`);
  for (const q of rows) {
    const s = subjectOf(q.expect.domain, q.expect.subject);
    const files = [s.file, ...(s.techniques ?? []).map((t) => s.file.replace(/\/[^/]+\.md$/, `/techniques/${t.slug}.md`))];
    const body = files.map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join(' ').toLowerCase().replace(/\s+/g, ' ');
    const routing = [q.expect.subject, ...(s.techniques ?? []).flatMap((t) => [t.slug, ...(t.use_when ?? [])])].join(' ').toLowerCase();
    const words = q.terms.join(' ').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    for (const w of words) assert.ok(body.includes(w), `${q.id}: "${w}" is not in ${q.expect.subject}'s documents`);
    assert.ok(words.some((w) => !routing.includes(w)), `${q.id}: every word is in a slug or use_when, so the row is not prose-only`);
  }
});

test('privacy screen: no absolute paths or home directories in any query', () => {
  for (const q of fx.queries) {
    const t = q.terms.join(' ');
    assert.doesNotMatch(t, /[A-Za-z]:[\\/]|\/Users\/|\/home\/|\\Users\\/, q.id);
  }
});

test('parseResearchMapText reads hit lines and their techniques', () => {
  const text = [
    'research-map: 1 term(s) against 9 subjects / 9 techniques in 1 bundle(s)',
    '',
    'term: "shared custody"',
    '  PRIOR ART (2 subject(s) matched, top 2):',
    '     14  software-engineering  integration/embedded-surfaces/markdown-vault  [8t 3a node] oldest 2026-01-01',
    '         file: knowledge/software-engineering/integration/embedded-surfaces/markdown-vault/markdown-vault.md',
    '         techniques: vault-as-database, link-resolution',
    '         why: prose in 2 doc(s)',
    '      8  recruiting  measurement/small-sample-honesty-in-hiring-analytics  [7t 0a NO-APP]',
    '         file: knowledge/recruiting/measurement/small-sample-honesty-in-hiring-analytics/small-sample-honesty-in-hiring-analytics.md',
    '',
    'term: "nothing"',
    '  PRIOR ART: none. The corpus has never heard of this - that is a finding, not a miss.',
  ].join('\n');
  const r = parseResearchMapText(text);
  assert.equal(r.length, 2);
  assert.deepEqual(r[0].hits.map((h) => [h.score, h.domain, h.subject]), [[14, 'software-engineering', 'markdown-vault'], [8, 'recruiting', 'small-sample-honesty-in-hiring-analytics']]);
  assert.deepEqual(r[0].hits[0].matched_techniques, ['vault-as-database', 'link-resolution']);
  assert.deepEqual(r[0].hits[1].matched_techniques, []);
  assert.deepEqual(r[1].hits, []);
});

test('scoreAnswer accepts alt subjects for recall but only the expected subject for technique@5', () => {
  const q = { expect: { subject: 'a', alt_subjects: ['b'], technique: 't' } };
  const ranked = [
    { subject: 'x', techniques: new Set() },
    { subject: 'b', techniques: new Set(['t']) },
  ];
  const s = scoreAnswer(q, ranked);
  assert.equal(s.rank, 2);
  assert.equal(s.at1, false);
  assert.equal(s.at5, true);
  assert.equal(s.technique_at5, false);
  const miss = scoreAnswer(q, [{ subject: 'x', techniques: new Set() }]);
  assert.equal(miss.rank, null);
  assert.equal(miss.at5, false);
});

test('technique@5 reads the EXPECTED subject in the top 5, even when an alt subject ranks above it', () => {
  // The header: "the correct subject is in the top 5 AND that hit names the technique". An alt
  // subject at rank 1 must not hide the expected subject naming the technique at rank 2.
  const q = { expect: { subject: 'a', alt_subjects: ['b'], technique: 't' } };
  const shadowed = scoreAnswer(q, [{ subject: 'b', techniques: new Set() }, { subject: 'a', techniques: new Set(['t']) }]);
  assert.equal(shadowed.rank, 1, 'recall still credits the alt subject first');
  assert.equal(shadowed.technique_at5, true);
  const deep = [1, 2, 3, 4, 5].map((i) => ({ subject: `x${i}`, techniques: new Set() }));
  assert.equal(scoreAnswer(q, [{ subject: 'b', techniques: new Set() }, ...deep, { subject: 'a', techniques: new Set(['t']) }]).technique_at5, false, 'rank 7 is outside the top 5');
});

// Held-out regression floor for the registry-query arm. Measured 2026-11-07 after the
// exact-address tier: r@1 25/38, r@5 31/38 (before the tier: 22/38 and 31/38). Floors sit one
// query below, so a single relabel or corpus edit does not trip them but a real ranking
// regression does. Pinned to the ORIGINAL 38 rows by id, so growing the fixture never moves
// the denominator. Offline and fast (about 1.5 s); needs the real knowledge tree, so it
// skips where knowledge/ is absent, as the real-corpus test in registry-query.test.mjs does.
const HAS_CORPUS = fs.existsSync(path.join(ROOT, 'knowledge', 'software-engineering', 'index.json'));
test('registry-query arm holds its recall floor on the held-out bench', { skip: !HAS_CORPUS && 'knowledge/ absent' }, async (t) => {
  const res = await runArm('registry-query', original);
  const n = res.n;
  assert.equal(n, 38);
  const r1 = res.rows.filter((r) => r.at1).length;
  const r5 = res.rows.filter((r) => r.at5).length;
  t.diagnostic(`held-out bench: r@1 ${r1}/${n}, r@5 ${r5}/${n}`);
  assert.ok(r1 >= 24, `recall@1 ${r1}/${n} fell below the floor of 24`);
  assert.ok(r5 >= 30, `recall@5 ${r5}/${n} fell below the floor of 30`);
});

// The grown rows, reported and not floored: a floor would be set from one measurement of a
// set nobody has tuned against yet. The line is for the record.
test('registry-query arm on the grown rows (reported, no floor)', { skip: !HAS_CORPUS && 'knowledge/ absent' }, async (t) => {
  for (const split of ['dev', 'heldout']) {
    const rows = grown.filter((q) => q.split === split);
    if (!rows.length) continue;
    const res = await runArm('registry-query', { ...fx, queries: rows });
    t.diagnostic(`grown ${split}: r@1 ${res.rows.filter((r) => r.at1).length}/${res.n}, r@5 ${res.rows.filter((r) => r.at5).length}/${res.n}`);
    assert.equal(res.n, rows.length);
  }
});
