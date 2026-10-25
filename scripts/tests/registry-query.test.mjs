import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  RESULT_SCHEMA, PROJECTION_SCHEMA, GIST_MAX_CHARS, estimateTokens,
  tokenize, stem, extractGist, firstSentence, checkReadPath,
  buildProjection, loadProjection, query, readDoc, subjectCard, formatHit, withoutUseWhen,
} from '../lib/registry-query.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const CLI = path.join(REPO, 'scripts', 'registry-query.mjs');

// ---------------------------------------------------------------- fixture bundle

const tech = (subject, slug, use, h1, para, body = '') => [
  '---', 'layer: technique', 'type: technique', `subject: ${subject}`, `technique: ${slug}`, 'status: forged',
  'laws: [law-x]', 'shared_with: []', `use_when: [${use.join(', ')}]`, '---', '', `# ${h1}`, '', para, '', '## Mechanism', '', body, '',
].join('\n');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rq-'));
  const b = path.join(root, 'knowledge', 'demo');
  const alpha = path.join(b, 'cat', 'alpha');
  const beta = path.join(b, 'cat', 'beta');
  for (const d of [path.join(alpha, 'techniques'), path.join(beta, 'techniques'), path.join(root, 'docs'), path.join(root, 'scripts')]) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(alpha, 'alpha.md'), [
    '---', 'layer: golden-path', 'subject: alpha', 'status: forged', 'techniques:', '  - one', '  - two', '---', '',
    '# Alpha caching', '', 'Alpha is the discipline of [caching](https://example.com/x) results. It has more sentences.', '',
    '## Overview', '', 'The shared custody of a cache key is the subject here.', '',
  ].join('\n'));
  fs.writeFileSync(path.join(alpha, 'techniques', 'one.md'), tech('alpha', 'one', ['a cache returns stale rows', 'deciding when to invalidate'], 'Cache invalidation', 'Invalidation is the hard part of caching. Everything else is easy.', 'Zebra quokka marmot appear only here.'));
  // Named differently from its slug: the projection must find it by frontmatter and count it.
  fs.writeFileSync(path.join(alpha, 'techniques', 'two-file.md'), tech('alpha', 'two', ['choosing a cache key'], 'Cache keys', 'A key names what was cached.'));
  for (const n of ['b1', 'b2', 'b3', 'b4']) {
    fs.writeFileSync(path.join(beta, 'techniques', `${n}.md`), tech('beta', n, [`widget routing ${n}`], `Widget routing ${n}`, `Widget routing variant ${n} is described here.`));
  }
  fs.writeFileSync(path.join(beta, 'beta.md'), ['---', 'subject: beta', 'status: draft', 'use_when: [routing widgets]', '---', '', '# Beta', '', '- a list first', '', 'Beta routes widgets. More.', ''].join('\n'));
  // The corpus shape: an anchor id, then a heading in words that is NOT the id.
  fs.writeFileSync(path.join(b, '_laws.md'), ['# Laws', '', '## <a id="law-x"></a>Caches name their reaper', '', 'Every cache names its reaper. A second sentence.', ''].join('\n'));
  const index = {
    meta: {},
    subjects: {
      alpha: { status: 'forged', file: 'knowledge/demo/cat/alpha/alpha.md', techniques: [{ slug: 'one' }, { slug: 'two' }], applications: [{ stack: 'react' }] },
      beta: { status: 'draft', file: 'knowledge/demo/cat/beta/beta.md', techniques: ['b1', 'b2', 'b3', 'b4'].map((slug) => ({ slug })), applications: [] },
    },
    laws: { 'law-x': { statement: 'Every cache names its reaper. A second sentence.', techniques: [] } },
  };
  fs.writeFileSync(path.join(b, 'index.json'), JSON.stringify(index));
  fs.writeFileSync(path.join(root, 'docs', 'guide.md'), ['# Guide', '', 'intro', '', '## Install', '', 'run it', '', '## Install extras', '', 'more', '', '## Usage notes', '', ...Array.from({ length: 200 }, (_, i) => `line ${i} of a long usage section`), ''].join('\n'));
  fs.writeFileSync(path.join(root, 'docs', '.notes.local.md'), 'secret');
  fs.writeFileSync(path.join(root, 'scripts', 'x.md'), 'tooling');
  return root;
}

const rmrf = (p) => fs.rmSync(p, { recursive: true, force: true });

// ---------------------------------------------------------------- tokens

test('stemmer folds the pairs that miss and leaves the rest alone', () => {
  for (const w of ['cache', 'caches', 'caching', 'cached']) assert.equal(stem(w), 'cach', w);
  assert.equal(stem('route'), stem('routing'));
  assert.equal(stem('shared'), stem('share'));
  assert.equal(stem('policies'), 'policy');
  assert.equal(stem('running'), 'run');
  assert.equal(stem('status'), 'status');
  assert.equal(stem('access'), 'access');
  assert.equal(stem('speed'), 'speed', '-eed is not an -ed suffix');
  assert.equal(stem('2026'), '2026');
});

test('tokenize lowercases, splits on non-alphanumerics, drops stopwords, keeps order', () => {
  assert.deepEqual(tokenize('Deciding whether a GREEN audit-means accessible!'), ['decid', 'whether', 'green', 'audit', 'mean', 'accessibl']);
  assert.deepEqual(tokenize('the of and to'), []);
  assert.deepEqual(tokenize('x y z'), [], 'one-character words carry nothing');
  assert.deepEqual(tokenize('Caches, caching'), ['cach', 'cach']);
});

// ---------------------------------------------------------------- gist

test('gist is H1 + first sentence, links stripped, whitespace collapsed', () => {
  const g = extractGist('# Title here\n\nFirst [linked](http://x) sentence\nwraps here. Second one.\n');
  assert.equal(g, 'Title here - First linked sentence wraps here.');
});

test('gist skips lists, code and headings to the first prose paragraph', () => {
  const g = extractGist('# T\n\n- item one\n- item two\n\n```\ncode.\n```\n\nReal prose, e.g. this. Next.\n');
  assert.equal(g, 'T - Real prose, e.g. this.');
});

test('gist is empty without a paragraph and capped on a word boundary', () => {
  assert.equal(extractGist('# Only a title\n\n## Heading\n'), '');
  const long = `# T\n\n${'word '.repeat(200)}end.\n`;
  const g = extractGist(long);
  assert.ok(g.length <= GIST_MAX_CHARS, `${g.length}`);
  assert.ok(g.endsWith('...'));
  assert.ok(!/wor\.\.\.$/.test(g), 'cut on a word boundary');
});

test('firstSentence keeps a closing quote and does not split on an abbreviation', () => {
  assert.equal(firstSentence('"Accessible" is a decaying claim. Every new surface.'), '"Accessible" is a decaying claim.');
  assert.equal(firstSentence('He said "stop." Then left.'), 'He said "stop."');
  assert.equal(firstSentence('no terminal punctuation'), 'no terminal punctuation');
});

// ---------------------------------------------------------------- projection

test('projection carries subjects, techniques and laws with derived, verified paths', () => {
  const root = fixture();
  try {
    const p = buildProjection(root);
    assert.equal(p.schema, PROJECTION_SCHEMA);
    assert.ok(p.builtFrom.demo.startsWith('sha256:'));
    const kinds = p.entries.reduce((m, e) => ({ ...m, [e.kind]: (m[e.kind] ?? 0) + 1 }), {});
    assert.deepEqual(kinds, { subject: 2, technique: 6, law: 1 });
    const one = p.entries.find((e) => e.technique === 'one');
    assert.equal(one.path, 'knowledge/demo/cat/alpha/techniques/one.md');
    assert.deepEqual(one.use_when, ['a cache returns stale rows', 'deciding when to invalidate']);
    assert.deepEqual(one.laws, ['law-x']);
    assert.equal(one.gist, 'Cache invalidation - Invalidation is the hard part of caching.');
    const two = p.entries.find((e) => e.technique === 'two');
    assert.equal(two.path, 'knowledge/demo/cat/alpha/techniques/two-file.md');
    assert.deepEqual(p.postings.segments[0].nonconforming, ['knowledge/demo/cat/alpha/techniques/two-file.md']);
    const alpha = p.entries.find((e) => e.kind === 'subject' && e.subject === 'alpha');
    assert.equal(alpha.technique, null);
    assert.match(alpha.gist, /^Alpha caching - Alpha is the discipline of caching results\. \(2 techniques, 1 application\)$/);
    assert.deepEqual(alpha.use_when, []);
    const beta = p.entries.find((e) => e.kind === 'subject' && e.subject === 'beta');
    assert.deepEqual(beta.use_when, ['routing widgets']);
    assert.match(beta.gist, /^Beta - Beta routes widgets\./);
    const law = p.entries.find((e) => e.kind === 'law');
    assert.deepEqual({ subject: law.subject, technique: law.technique, path: law.path, gist: law.gist },
      { subject: null, technique: null, path: 'knowledge/demo/_laws.md', gist: 'law-x - Every cache names its reaper.' });
    for (const e of p.entries) for (const k of ['kind', 'domain', 'subject', 'technique', 'path', 'title', 'gist', 'use_when', 'status', 'laws']) assert.ok(k in e, `${k} present`);
  } finally { rmrf(root); }
});

// ---------------------------------------------------------------- query

test('query ranks by body as well as frontmatter, and says why', () => {
  const root = fixture();
  try {
    const p = buildProjection(root);
    const r = query(p, ['zebra quokka']);
    assert.equal(r.schema, RESULT_SCHEMA);
    assert.equal(r.hits[0].technique, 'one');
    assert.ok(r.hits[0].why.some((w) => w.startsWith('phrase in body')), r.hits[0].why.join(' | '));
    const h = r.hits[0];
    for (const k of ['rank', 'score', 'kind', 'domain', 'subject', 'technique', 'path', 'gist', 'use_when', 'why']) assert.ok(k in h);
    assert.equal(r.empty_reason, null);
    assert.equal(r.tokens, estimateTokens(r.hits.map(formatHit).join('\n')));
  } finally { rmrf(root); }
});

test('prose-only phrase surfaces its owner', () => {
  const root = fixture();
  try {
    const r = query(buildProjection(root), ['shared custody']);
    assert.equal(r.hits[0].subject, 'alpha');
    assert.equal(r.hits[0].kind, 'subject');
  } finally { rmrf(root); }
});

test('at most three hits per subject; kind priority breaks ties', () => {
  const root = fixture();
  try {
    const r = query(buildProjection(root), ['widget routing'], { top: 20 });
    const beta = r.hits.filter((h) => h.subject === 'beta');
    assert.equal(beta.length, 3);
  } finally { rmrf(root); }
});

test('budget cut: stops before the hit that would exceed it and says truncated', () => {
  const root = fixture();
  try {
    const p = buildProjection(root);
    const full = query(p, ['cache'], { top: 50, budgetTokens: 1e6 });
    assert.ok(full.hits.length >= 3);
    assert.equal(full.truncated, false);
    const oneHit = estimateTokens(formatHit(full.hits[0]));
    const cut = query(p, ['cache'], { top: 50, budgetTokens: oneHit + 5 });
    assert.equal(cut.hits.length, 1);
    assert.equal(cut.truncated, true);
    assert.ok(cut.tokens <= oneHit + 5);
    const topCut = query(p, ['cache'], { top: 1, budgetTokens: 1e6 });
    assert.equal(topCut.hits.length, 1);
    assert.equal(topCut.truncated, true);
    const none = query(p, ['cache'], { budgetTokens: 1 });
    assert.equal(none.hits.length, 0);
    assert.equal(none.truncated, true);
    assert.match(none.empty_reason, /budget/);
  } finally { rmrf(root); }
});

test('empty results name their reason', () => {
  const root = fixture();
  try {
    const p = buildProjection(root);
    assert.match(query(p, ['the of a']).empty_reason, /no terms after tokenizing/);
    assert.match(query(p, ['cache'], { domains: ['nope'] }).empty_reason, /no bundle/);
    assert.match(query(p, ['xylophone']).empty_reason, /no match/);
    assert.match(query(buildProjection(path.join(root, 'nowhere')), ['cache']).empty_reason, /no bundle/);
    assert.deepEqual(query(p, ['cache'], { kinds: ['law'] }).hits.map((h) => h.kind), ['law']);
    // A kind filter that removed every match says so, rather than "no match for <terms>".
    assert.match(query(p, ['invalidation'], { kinds: ['law'] }).empty_reason, /kinds: law/);
  } finally { rmrf(root); }
});

test('withoutUseWhen removes one trigger from postings and entry only', () => {
  const root = fixture();
  try {
    const p = buildProjection(root);
    const i = p.entries.findIndex((e) => e.technique === 'one');
    const q = withoutUseWhen(p, i, 'deciding when to invalidate');
    assert.deepEqual(q.entries[i].use_when, ['a cache returns stale rows']);
    assert.deepEqual(p.entries[i].use_when.length, 2, 'original untouched');
    const hit = (proj) => query(proj, ['deciding'], { top: 10 }).hits.find((h) => h.technique === 'one');
    assert.ok(hit(p), 'found through use_when before');
    assert.equal(hit(q), undefined, 'not found once the only carrier is removed');
  } finally { rmrf(root); }
});

// ---------------------------------------------------------------- cache

test('cache: written lazily, reused while the fingerprint holds, rebuilt when it moves', () => {
  const root = fixture();
  try {
    const cacheDir = path.join(root, '.cache', 'registry-route');
    assert.equal(fs.existsSync(cacheDir), false);
    const first = loadProjection(root);
    const file = path.join(cacheDir, 'demo.json');
    assert.ok(fs.existsSync(file), 'cache written on first load');
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.deepEqual(Object.keys(c).sort(), ['entries', 'fingerprint', 'postings', 'schema']);
    assert.equal(c.fingerprint, first.builtFrom.demo);

    // Tamper with the cached gist: a load under the same fingerprint must serve it (proof the cache is read).
    c.entries[0].gist = 'TAMPERED';
    fs.writeFileSync(file, JSON.stringify(c));
    assert.equal(loadProjection(root).entries[0].gist, 'TAMPERED');
    assert.notEqual(loadProjection(root, { rebuild: true }).entries[0].gist, 'TAMPERED', 'rebuild ignores the cache');

    c.entries[0].gist = 'TAMPERED';
    fs.writeFileSync(file, JSON.stringify(c));
    const gp = path.join(root, 'knowledge', 'demo', 'cat', 'alpha', 'alpha.md');
    fs.appendFileSync(gp, '\nA new paragraph moves the size.\n');
    const after = loadProjection(root);
    assert.notEqual(after.builtFrom.demo, first.builtFrom.demo, 'fingerprint moved');
    assert.notEqual(after.entries[0].gist, 'TAMPERED', 'stale cache rebuilt, not trusted');

    fs.writeFileSync(file, '{not json');
    assert.ok(loadProjection(root).entries.length, 'corrupt cache rebuilds');
  } finally { rmrf(root); }
});

test('cache: an unwritable cache dir degrades to in-memory', () => {
  const root = fixture();
  try {
    const blocker = path.join(root, 'blocker');
    fs.writeFileSync(blocker, 'a file where a directory should be');
    const p = loadProjection(root, { cacheDir: path.join(blocker, 'sub') });
    assert.ok(p.entries.length > 0);
    assert.equal(query(p, ['cache']).hits.length > 0, true);
  } finally { rmrf(root); }
});

// ---------------------------------------------------------------- readDoc

test('readDoc refuses escapes, absolute paths, local files and paths outside the lanes', () => {
  const root = fixture();
  try {
    assert.throws(() => readDoc(root, 'docs/../scripts/x.md'), /'\.\.'/);
    assert.throws(() => readDoc(root, '../etc/passwd'), /'\.\.'/);
    assert.throws(() => readDoc(root, path.join(root, 'docs', 'guide.md')), /absolute/);
    assert.throws(() => readDoc(root, '/etc/passwd'), /absolute/);
    assert.throws(() => readDoc(root, 'C:\\Windows\\win.ini'), /absolute/);
    assert.throws(() => readDoc(root, 'docs/.notes.local.md'), /local/);
    assert.throws(() => readDoc(root, 'knowledge/demo/.evidence.local.md'), /local/);
    assert.throws(() => readDoc(root, 'scripts/x.md'), /outside the published lanes/);
    assert.throws(() => readDoc(root, '.machine.local.json'), /outside|local/);
    assert.throws(() => readDoc(root, 'docs/missing.md'), /no such document/);
    assert.equal(checkReadPath('docs\\guide.md'), 'docs/guide.md');
  } finally { rmrf(root); }
});

test('readDoc sections: exact before prefix, case-insensitive, through the next ##', () => {
  const root = fixture();
  try {
    const whole = readDoc(root, 'docs/guide.md', { maxTokens: 1e6 });
    assert.deepEqual(whole.sections, ['Install', 'Install extras', 'Usage notes']);
    assert.equal(whole.truncated, false);
    const exact = readDoc(root, 'docs/guide.md', { section: 'install' });
    assert.equal(exact.text, '## Install\n\nrun it');
    const prefix = readDoc(root, 'docs/guide.md', { section: 'INSTALL EX' });
    assert.equal(prefix.text, '## Install extras\n\nmore');
    const law = readDoc(root, 'knowledge/demo/_laws.md', { section: 'law-x' });
    assert.match(law.text, /Every cache names its reaper/);
    assert.deepEqual(law.sections, ['Caches name their reaper'], 'sections list the heading words, not the anchor');
    // The next step a law hit prints (`| section: <id>`) must be one readDoc accepts.
    const hit = query(buildProjection(root), ['reaper'], { kinds: ['law'] }).hits[0];
    const advertised = formatHit(hit).split('| section: ')[1];
    assert.match(readDoc(root, hit.path, { section: advertised }).text, /^## <a id="law-x"><\/a>Caches name their reaper/);
    // The other corpus shape: the anchor alone on the line above its heading.
    fs.writeFileSync(path.join(root, 'docs', 'laws.md'), ['# Laws', '', '<a id="l-one"></a>', '## L1 - First law', '', 'one', '', '<a id="l-two"></a>', '## L2 - Second law', '', 'two', ''].join('\n'));
    assert.equal(readDoc(root, 'docs/laws.md', { section: 'l-one' }).text, '## L1 - First law\n\none', 'the next law\'s anchor line is not this section\'s tail');
    assert.equal(readDoc(root, 'docs/laws.md', { section: 'L-TWO' }).text, '## L2 - Second law\n\ntwo');
    assert.throws(() => readDoc(root, 'docs/guide.md', { section: 'nope' }), /no "## nope" section; sections: Install/);
  } finally { rmrf(root); }
});

test('readDoc truncates on a line boundary with a marker naming what was cut', () => {
  const root = fixture();
  try {
    const d = readDoc(root, 'docs/guide.md', { maxTokens: 60 });
    assert.equal(d.truncated, true);
    assert.ok(d.tokens <= 60, `${d.tokens}`);
    assert.match(d.text, /\[truncated: \d+ more tokens; sections: .*Usage notes.*\]$/);
    const body = d.text.slice(0, d.text.lastIndexOf('\n['));
    for (const line of body.split('\n')) assert.ok(fs.readFileSync(path.join(root, 'docs', 'guide.md'), 'utf8').split('\n').includes(line), `whole line: ${line}`);
  } finally { rmrf(root); }
});

// ---------------------------------------------------------------- card + CLI

test('subjectCard carries the subject row and its techniques with a token count', () => {
  const root = fixture();
  try {
    const p = buildProjection(root);
    const card = subjectCard(p, 'alpha');
    assert.equal(card.subject.subject, 'alpha');
    assert.deepEqual(card.techniques.map((t) => t.technique).sort(), ['one', 'two']);
    assert.ok(card.tokens > 0);
    assert.deepEqual(subjectCard(p, 'nope'), { subject: null, techniques: [], tokens: 0 });
    assert.equal(subjectCard(p, 'alpha', { domain: 'other' }).subject, null);
  } finally { rmrf(root); }
});

test('CLI: two-line hits, honest empty exits 0, usage error exits 2', () => {
  const root = fixture();
  const run = (...args) => spawnSync(process.execPath, [CLI, '--root', root, ...args], { encoding: 'utf8' });
  try {
    const ok = run('cache invalidation', '--top', '2');
    assert.equal(ok.status, 0, ok.stderr);
    const lines = ok.stdout.split('\n');
    assert.match(lines[0], /^1\. technique demo\/alpha\/one - Cache invalidation - /);
    assert.match(lines[1], /^ {3}knowledge\/demo\/cat\/alpha\/techniques\/one\.md \| when: a cache returns stale rows; deciding when to invalidate$/);
    const terms = run('--terms', 'zebra, quokka', '--json');
    assert.deepEqual(JSON.parse(terms.stdout).terms, ['zebra', 'quokka']);
    const empty = run('xylophone');
    assert.equal(empty.status, 0);
    assert.match(empty.stdout, /^no match: /);
    assert.equal(run().status, 2);
    assert.equal(run('x', '--top', 'zero').status, 2);
    assert.equal(run('--bogus').status, 2);
    // An unknown kind ("techniques") used to filter every hit away and answer "no match".
    const badKind = run('cache', '--kinds', 'techniques');
    assert.equal(badKind.status, 2, badKind.stdout);
    assert.match(badKind.stderr, /--kinds: unknown kind "techniques"; kinds: technique, subject, law/);
    assert.equal(run('cache', '--kinds', 'technique,law').status, 0);
    assert.equal(run('--read', 'scripts/x.md').status, 2);
    const read = run('--read', 'docs/guide.md', '--section', 'install');
    assert.equal(read.status, 0);
    assert.match(read.stdout, /^## Install\n\nrun it\n/);
    const card = run('--subject', 'alpha');
    assert.match(card.stdout, /^subject demo\/alpha - /);
    assert.match(run('--subject', 'nope').stdout, /^no match: /);
  } finally { rmrf(root); }
});

// ---------------------------------------------------------------- real corpus

const HAS_CORPUS = fs.existsSync(path.join(REPO, 'knowledge', 'software-engineering', 'index.json'));

test('real corpus: front-door cases and a leave-one-out dev set', { skip: !HAS_CORPUS && 'knowledge/ absent' }, (t) => {
  const p = loadProjection(REPO);
  const a11y = query(p, ['deciding whether a green audit means accessible']);
  const rank = a11y.hits.findIndex((h) => h.subject === 'accessibility' && h.technique === 'a11y-verification') + 1;
  assert.ok(rank >= 1 && rank <= 3, `a11y-verification at ${rank}`);
  assert.ok(a11y.hits[rank - 1].gist && a11y.hits[rank - 1].path.endsWith('a11y-verification.md'));

  const custody = query(p, ['shared custody'], { top: 5 });
  assert.ok(custody.hits.some((h) => ['markdown-vault', 'companion-identity'].includes(h.subject)), custody.hits.map((h) => h.subject).join(','));
  const grounded = query(p, ['groundedness verification'], { top: 5 });
  assert.ok(grounded.hits.some((h) => h.subject === 'llm-forensic-gating'));

  // Leave-one-out: 60 techniques at a fixed seed, one use_when line each as the query,
  // with that line removed from the projection. Our own dev set - never the held-out bench.
  let seed = 20261025;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const pool = p.entries.map((e, i) => [e, i]).filter(([e]) => e.kind === 'technique' && e.use_when.length >= 2);
  const seen = new Set();
  let r1 = 0;
  let r5 = 0;
  while (seen.size < 60) {
    const j = Math.floor(rnd() * pool.length);
    if (seen.has(j)) continue;
    seen.add(j);
    const [e, i] = pool[j];
    const line = e.use_when[Math.floor(rnd() * e.use_when.length)];
    const hits = query(withoutUseWhen(p, i, line), [line], { top: 5, budgetTokens: 1e9 }).hits;
    const at = hits.findIndex((h) => h.path === e.path) + 1;
    if (at === 1) r1 += 1;
    if (at >= 1) r5 += 1;
  }
  t.diagnostic(`leave-one-out dev set: recall@1 ${r1}/60, recall@5 ${r5}/60`);
  assert.ok(r5 >= 30, `recall@5 ${r5}/60 fell below the floor`);
});
