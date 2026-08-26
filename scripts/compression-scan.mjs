#!/usr/bin/env node
/**
 * compression-scan - the deterministic half of the compression lane
 * (docs/compression-lane.md).
 *
 * ## Why this is a script and not a prompt
 *
 * The question "which documents are worth compressing?" is arithmetic over the corpus:
 * how many tokens, multiplied by how often those tokens are re-billed. Asking a model
 * to eyeball that produces a confident ranking nobody can check, over a corpus far too
 * large for anyone to verify it against. So the countable part is counted here, once,
 * and the compression brief spends its model calls only on what this ranks.
 *
 * ## What it refuses to do
 *
 * It does not judge whether repetition is waste. This corpus repeats house vocabulary
 * ON PURPOSE, cites laws in a fixed formula ON PURPOSE, and has golden paths restate a
 * technique's rule in one line ON PURPOSE - that last one IS the routing working. A
 * script cannot separate those from redundancy and this one does not pretend to. It
 * prints the repeated spans verbatim so a human can look at them.
 *
 * It does not print a bill. The token figure is an ESTIMATE from an estimator with a
 * stated rule and a stated bias (see TOKEN_RULE). Usable for ranking, which is all it
 * claims; not usable as money.
 *
 * ## Exit codes
 *   0  scanned
 *   2  the instrument is broken (self-test failed, or a lane came back empty)
 *
 * Usage:
 *   node scripts/compression-scan.mjs                  # the worklist
 *   node scripts/compression-scan.mjs --json           # what a brief reads
 *   node scripts/compression-scan.mjs --top 30
 *   node scripts/compression-scan.mjs --domain software-engineering
 *   node scripts/compression-scan.mjs --show <path>    # the repeated spans in one doc
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
const RULES = path.join(ROOT, 'rules');

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const pick = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i === -1 ? dflt : argv[i + 1];
};
const topN = Number(pick('--top', 20));
const onlyDomain = pick('--domain', null);
const showPath = pick('--show', null);

/* ---------------------------------------------------------------- estimator */

/**
 * TOKEN_RULE. English prose tokenizes at roughly 1.3 subword tokens per whitespace
 * word for common vocabulary, higher for long or hyphenated words and for anything
 * non-ASCII. We count words, add one token per punctuation run, and add a surcharge
 * for words over 8 characters (which reliably split). Markdown scaffolding - fences,
 * link targets, frontmatter punctuation - is counted, because the model pays for it.
 *
 * Known bias: under-counts code blocks and long URLs, over-counts short list-heavy
 * prose slightly. That is fine for ranking and useless as a bill.
 */
const TOKEN_RULE = 'words + punctuation runs + surcharge for words > 8 chars; under-counts code blocks';

function estimateTokens(text) {
  const words = text.split(/\s+/).filter(Boolean);
  let n = 0;
  for (const w of words) {
    n += 1;
    if (w.length > 8) n += Math.floor((w.length - 8) / 5) + 1;
    if (/[^\x20-\x7e]/.test(w)) n += 1;
  }
  n += (text.match(/[^\w\s]+/g) || []).length;
  return n;
}

/* ---------------------------------------------------------------- shingles */

const SHINGLE = 12;
const FENCE = /```[\s\S]*?```/g;
const MDLINK = /\[([^\]]*)\]\([^)]*\)/g;

function normalizeWords(text) {
  return text
    .replace(FENCE, ' ')        // fenced code is not prose repetition
    .replace(MDLINK, '$1')      // keep link text, drop targets
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(words, k = SHINGLE) {
  const out = new Map();
  for (let i = 0; i + k <= words.length; i++) {
    const key = words.slice(i, i + k).join(' ');
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(i);
  }
  return out;
}

/* ---------------------------------------------------------------- self-test */

function selftest() {
  const failures = [];

  // The estimator must be monotone and in a sane band.
  const short = estimateTokens('the cache is warm');
  const long = estimateTokens('the cache is warm and the prefix is resident in it');
  if (!(short > 0 && long > short)) failures.push('estimator is not monotone in length');
  const wordy = 'alpha beta gamma delta epsilon zeta eta theta iota kappa';
  const est = estimateTokens(wordy);
  if (est < 10 || est > 20) failures.push(`estimator out of band on 10 plain words: ${est}`);

  // The shingler must find a planted duplicate and nothing else.
  const planted = 'one two three four five six seven eight nine ten eleven twelve';
  const doc = `alpha ${planted} bravo charlie delta echo foxtrot golf hotel india juliet kilo ${planted} lima`;
  const sh = shingles(normalizeWords(doc));
  const dupes = [...sh.entries()].filter(([, at]) => at.length > 1);
  if (dupes.length !== 1) failures.push(`shingler found ${dupes.length} duplicate spans, expected exactly 1`);
  else if (dupes[0][0] !== planted) failures.push('shingler found the wrong span');

  // Overlapping shingles must collapse. A 24-word passage appearing twice covers 48
  // word positions, NOT the 13 overlapping shingles x 12 words the naive count gives.
  // This assertion exists because the naive version shipped first and read 74% where
  // the truth was a third of that.
  const p24 = 'one two three four five six seven eight nine ten eleven twelve '
            + 'thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty alpha bravo charlie delta';
  const twice = normalizeWords(`${p24} zulu yankee xray whiskey victor uniform tango sierra ${p24}`);
  const fakeSh = shingles(twice);
  const fake = {
    words: twice,
    sh: fakeSh,
    repeat: new Map([...fakeSh.entries()].filter(([, at]) => at.length > 1)
      .map(([k]) => [k, { self: true, others: new Set() }])),
  };
  const merged = mergedRuns(fake);
  if (merged.covered !== 48) failures.push(`overlap merge covered ${merged.covered} positions, expected 48`);
  if (merged.runs.length !== 2) failures.push(`overlap merge produced ${merged.runs.length} runs, expected 2`);

  // Code fences and link targets must not register as prose.
  const fenced = normalizeWords('text ```const x = 1;``` text').join(' ');
  if (fenced.includes('const')) failures.push('code fence leaked into prose words');
  const linked = normalizeWords('see [the rule](../a/b/c.md) now').join(' ');
  if (linked.includes('md') || !linked.includes('the rule')) failures.push('link target handling is wrong');

  return failures;
}

const selftestFailures = selftest();
if (selftestFailures.length) {
  console.error('compression-scan FATAL: the instrument failed its own self-test.');
  for (const f of selftestFailures) console.error(`  - ${f}`);
  process.exit(2);
}

/* ---------------------------------------------------------------- collect */

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

function classify(relPath) {
  if (relPath.startsWith('rules/')) return { tier: 'always-on', weight: 40, domain: 'rules' };
  const parts = relPath.split('/');            // knowledge/<domain>/.../x.md
  const domain = parts[1] || '(none)';
  const base = parts[parts.length - 1].replace(/\.md$/, '');
  const parent = parts[parts.length - 2] || '';
  const grand = parts[parts.length - 3] || '';
  if (base === '_laws') return { tier: 'always-on', weight: 40, domain };
  if (parent === 'techniques') return { tier: 'routed', weight: 4, domain, subject: grand };
  if (parent === 'applications') return { tier: 'stack-scoped', weight: 1, domain, subject: grand };
  if (base === parent) return { tier: 'entry', weight: 12, domain, subject: base };
  return { tier: 'other', weight: 2, domain };
}

const files = [];
if (fs.existsSync(RULES)) files.push(...walk(RULES));
if (fs.existsSync(KNOWLEDGE)) files.push(...walk(KNOWLEDGE));

if (files.length === 0) {
  console.error('compression-scan FATAL: zero documents found. THE WALKER IS BROKEN.');
  process.exit(2);
}

const docs = [];
const inbound = new Map();

for (const abs of files) {
  const relPath = rel(abs);
  const text = fs.readFileSync(abs, 'utf8');
  const meta = classify(relPath);

  for (const m of text.matchAll(/\]\(([^)]+\.md)(?:#[^)]*)?\)/g)) {
    const target = path.normalize(path.join(path.dirname(abs), m[1]));
    const key = rel(target);
    inbound.set(key, (inbound.get(key) || 0) + 1);
  }

  if (onlyDomain && meta.domain !== onlyDomain && meta.tier !== 'always-on') continue;
  docs.push({ path: relPath, text, words: normalizeWords(text), ...meta, tokens: estimateTokens(text) });
}

const byTier = docs.reduce((a, d) => ((a[d.tier] = (a[d.tier] || 0) + 1), a), {});
for (const need of ['always-on', 'entry', 'routed']) {
  if (!byTier[need]) {
    console.error(`compression-scan FATAL: lane "${need}" came back empty. THE CLASSIFIER IS BROKEN.`);
    process.exit(2);
  }
}

/* ---------------------------------------------------------------- repetition */

// Within-document repetition, and repetition against SIBLINGS (same subject), which is
// the case that actually costs twice: a golden path and its technique both loading.
const bySubject = new Map();
for (const d of docs) {
  if (!d.subject) continue;
  const key = `${d.domain}/${d.subject}`;
  if (!bySubject.has(key)) bySubject.set(key, []);
  bySubject.get(key).push(d);
}

// Shingles OVERLAP: a 20-word duplicated passage yields 9 shingles starting one word
// apart. Counting those as 9 repetitions inflates the ratio several-fold and prints the
// same passage nine times. So repetition is measured as the share of distinct WORD
// POSITIONS covered by any repeated shingle, and reported as maximal merged runs.
for (const d of docs) {
  d.sh = shingles(d.words);
  d.repeat = new Map();   // shingle key -> { self, others:Set<path> }
  const mark = (key) => {
    if (!d.repeat.has(key)) d.repeat.set(key, { self: false, others: new Set() });
    return d.repeat.get(key);
  };
  for (const [key, at] of d.sh) if (at.length > 1) mark(key).self = true;
  d._mark = mark;
}

for (const [, group] of bySubject) {
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i], b = group[j];
      for (const key of a.sh.keys()) {
        if (b.sh.has(key)) {
          a._mark(key).others.add(b.path);
          b._mark(key).others.add(a.path);
        }
      }
    }
  }
}

// Merge covered positions into maximal runs, so one duplicated passage reports once.
function mergedRuns(d) {
  const covered = new Set();
  for (const key of d.repeat.keys()) {
    for (const start of d.sh.get(key)) {
      for (let p = start; p < start + SHINGLE; p++) covered.add(p);
    }
  }
  const runs = [];
  const sorted = [...covered].sort((x, y) => x - y);
  for (const p of sorted) {
    const last = runs[runs.length - 1];
    if (last && p === last.end + 1) last.end = p;
    else runs.push({ start: p, end: p });
  }
  for (const r of runs) {
    r.text = d.words.slice(r.start, r.end + 1).join(' ');
    r.self = false;
    r.others = new Set();
    for (const [key, info] of d.repeat) {
      for (const start of d.sh.get(key)) {
        if (start >= r.start && start <= r.end) {
          if (info.self) r.self = true;
          for (const o of info.others) r.others.add(o);
        }
      }
    }
  }
  return { covered: covered.size, runs };
}

for (const d of docs) {
  const m = mergedRuns(d);
  d.repeatedRuns = m.runs;
  d.repetitionRatio = d.words.length ? Math.min(1, m.covered / d.words.length) : 0;
  d.inbound = inbound.get(d.path) || 0;
  // Exposure: tier weight, nudged by how many documents route to this one.
  d.exposure = d.weight * (1 + Math.min(d.inbound, 12) / 12);
  // The ranking quantity: re-billed tokens, lifted where repetition is provable.
  d.rebilled = Math.round(d.tokens * d.exposure);
  d.score = Math.round(d.rebilled * (1 + d.repetitionRatio));
}

/* ---------------------------------------------------------------- --show */

if (showPath) {
  const d = docs.find((x) => x.path === showPath || x.path.endsWith(showPath));
  if (!d) {
    console.error(`compression-scan: no document matching "${showPath}"`);
    process.exit(2);
  }
  console.log(`${d.path}\n  tier ${d.tier} - ~${d.tokens} tokens (estimate) - ${d.inbound} inbound link(s)`);
  console.log(`  repetition ratio ${(d.repetitionRatio * 100).toFixed(1)}% of ${d.words.length} prose words\n`);
  if (!d.repeatedRuns.length) {
    console.log(`  no repeated span of ${SHINGLE}+ words, within the document or against its siblings.`);
  }
  for (const r of d.repeatedRuns.sort((a, b) => (b.end - b.start) - (a.end - a.start))) {
    const n = r.end - r.start + 1;
    console.log(`  [${String(n).padStart(3)} words] ...${r.text}...`);
    if (r.self) console.log('            repeated within this document');
    for (const o of r.others) console.log(`            also in ${o}`);
  }
  console.log('\n  Repetition here is not automatically waste: house vocabulary, law citations and');
  console.log('  a golden path restating its technique are all deliberate. Read the spans.');
  process.exit(0);
}

/* ---------------------------------------------------------------- report */

const worklist = [...docs].sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
const totalTokens = docs.reduce((n, d) => n + d.tokens, 0);
const alwaysOn = docs.filter((d) => d.tier === 'always-on');

if (asJson) {
  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    tokenRule: TOKEN_RULE,
    tokenFigureIsAnEstimate: true,
    shingleWords: SHINGLE,
    documents: docs.length,
    estimatedCorpusTokens: totalTokens,
    tiers: byTier,
    worklist: worklist.slice(0, topN).map((d) => ({
      path: d.path, tier: d.tier, tokens: d.tokens, inbound: d.inbound,
      repetitionRatio: Number(d.repetitionRatio.toFixed(3)), rebilled: d.rebilled, score: d.score,
    })),
  }, null, 2));
} else {
  console.log(`compression scan - ${docs.length} documents - ~${totalTokens.toLocaleString()} estimated tokens\n`);
  console.log(`  token figures are ESTIMATES. rule: ${TOKEN_RULE}`);
  console.log(`  repetition = share of prose words inside a ${SHINGLE}-word span repeated here or in a sibling\n`);
  console.log(`  tiers: ${Object.entries(byTier).map(([t, n]) => `${t} ${n}`).join(' - ')}`);
  console.log(`  always-on lane: ${alwaysOn.length} documents, ~${alwaysOn.reduce((n, d) => n + d.tokens, 0).toLocaleString()} tokens billed every session\n`);

  console.log(`WORKLIST - top ${Math.min(topN, worklist.length)} by re-billed tokens x provable repetition\n`);
  const w = Math.min(62, Math.max(...worklist.slice(0, topN).map((d) => d.path.length)));
  console.log(`  ${'score'.padStart(7)}  ${'tokens'.padStart(6)}  ${'tier'.padEnd(12)} ${'rep'.padStart(5)}  ${'in'.padStart(3)}  document`);
  for (const d of worklist.slice(0, topN)) {
    const p = d.path.length > w ? `...${d.path.slice(-(w - 3))}` : d.path;
    console.log(
      `  ${String(d.score).padStart(7)}  ${String(d.tokens).padStart(6)}  ${d.tier.padEnd(12)} ${(d.repetitionRatio * 100).toFixed(0).padStart(4)}%  ${String(d.inbound).padStart(3)}  ${p}`,
    );
  }
  console.log('\n  This ranks where a compression pass would repay. It does not say any of these');
  console.log('  documents is bad, and repetition it found may be deliberate - inspect one with');
  console.log('  --show <path> before commissioning a pass (docs/compression-lane.md).');
}
