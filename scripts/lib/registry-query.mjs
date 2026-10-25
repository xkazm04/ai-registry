/**
 * registry-query - the one query core every agent-facing entry point shares.
 *
 * WHY THIS EXISTS. An agent locating a technique was told to read
 * knowledge/<domain>/index.json, which for software-engineering is ~400K tokens. In
 * 3,594 local transcripts no agent Read it; they sliced it with ad-hoc `node -e` and
 * python 430 times, rebuilding a query layer per session, while the real router
 * (research-map.mjs) missed concepts that live only in prose and returned neither a
 * technique's path nor its rule. This module is that query layer, built once: a
 * PROJECTION of the corpus (subjects, techniques, laws, each with its path, a one-line
 * gist and its use_when triggers) plus a BM25 postings list over the document bodies,
 * cached outside git, answered under a token budget.
 *
 * The projection is GENERATED and LOCAL. Markdown + frontmatter stay the source of
 * truth; the cache lives in `.cache/registry-route/` (gitignored), keyed by each
 * bundle's content digest, so a stale cache is rebuilt rather than trusted, and a
 * committed copy cannot add the per-commit churn the generated indexes already carry.
 *
 * Callers: scripts/registry-query.mjs (CLI), scripts/registry-mcp.mjs (MCP server),
 * scripts/routing-bench.mjs (the benchmark arm). Zero dependencies; runs on Node 20.
 *
 * Wire contract (every field always present; arrays are [] rather than omitted):
 *
 *   Entry  { kind: 'subject'|'technique'|'law', domain, subject, technique|null,
 *            path, title, gist, use_when: string[], status, laws: string[] }
 *          path is repo-relative with forward slashes; technique is null on subject
 *          and law rows; gist is '' when the document has no paragraph; for a law
 *          row, subject is null and path is the bundle's _laws.md.
 *   Hit    { rank, score, kind, domain, subject, technique, path, gist, use_when,
 *            why: string[] }
 *   Result { schema: 'registry-query/1', terms: string[], hits: Hit[],
 *            truncated: boolean, tokens: number, empty_reason: string|null }
 *   Doc    { path, tokens, truncated, text, sections: string[] }
 *
 * ## Design notes (the decisions behind the contract, so nobody re-litigates them blind)
 *
 * PROJECTION. One row per golden path (`subject`), per technique, per law the bundle's
 * index.json carries. Applications are deliberately NOT rows: they are stack-specific
 * evidence of a technique, and ranking them beside the technique would let one subject
 * with six stacks crowd a result. A subject row's gist says how many it has instead.
 * The subject and technique LIST comes from index.json (the same enumeration every
 * other consumer reads, so this cannot disagree with it about what exists); everything
 * routable - gist, use_when, headings, body - comes from the markdown itself. A
 * technique's path is derived as `<subject dir>/techniques/<slug>.md` and verified on
 * disk; a technique whose file is named otherwise is found by its frontmatter and
 * counted in `postings.nonconforming`, never silently dropped.
 *
 * A law row's `title` is its anchor id, and its gist is `<id> - <first sentence>`: the
 * Hit shape carries no title, so the id rides in the gist the same way an H1 title does
 * for every other row (`<title> - <first sentence>`). Read one law with
 * `readDoc(<_laws.md>, { section: <id> })` - a section matches its heading words or its
 * `<a id>` anchor, and a law's heading words are not its id.
 *
 * RANKING. BM25F: per-field term frequencies are length-normalised per field, weighted
 * (FIELD_WEIGHTS), summed, then saturated once with k1. Fields: title (H1 + slug words),
 * use_when, gist, `##`-and-deeper headings, body. Statistics (N, df, average field
 * lengths) are taken over the bundles actually queried, so a domain filter does not
 * borrow another bundle's idf. A query term of two or more tokens earns a phrase bonus
 * when its token sequence occurs contiguously in title, use_when or gist - order is
 * evidence the bag-of-words cannot see. The same phrase in the BODY is found through a
 * per-document Bloom sketch of adjacent token pairs and confirmed by reading the file
 * (see "phrase sketch" below); the adjacent pairs of a long query score from the
 * sketch alone. Ties break technique > subject > law, then path, so output is
 * deterministic. At most MAX_PER_SUBJECT rows per subject survive, so one large
 * subject cannot fill the page.
 *
 * TUNING. Weights were held at the Director's starting point (title 3, use_when 3,
 * gist 2, headings 1.5, body 1; k1 1.2, b 0.75) and moved only where a leave-one-out
 * dev set (a use_when line as the query, removed from the projection; see
 * withoutUseWhen) moved consistently across seeds. Flat weights scored 2-3 points
 * better there and were NOT adopted: that dev set removes exactly the use_when line
 * the query was, so it structurally under-rewards the use_when field real queries hit.
 * The held-out benchmark (scripts/routing-bench.mjs) is the arbiter, not this note.
 *
 * TOKENS. Lowercase, split on non-alphanumerics, a small stoplist, and a five-rule
 * suffix stemmer (ies->y, plural s, -ing, -ed, trailing e). It is crude on purpose:
 * deterministic, explainable in one breath, and it folds the pairs that actually miss
 * (cache/caches/caching/cached -> `cach`, route/routing -> `rout`, shared/share -> `shar`).
 *
 * CACHE. One file per bundle, `<root>/.cache/registry-route/<domain>.json`, holding
 * `{schema, fingerprint, entries, postings}`. The fingerprint is sha256 over the
 * builder version plus every bundle .md file's (relative path, size, mtimeMs) and
 * index.json's - stat-based, so a dirty working tree invalidates it without a git call,
 * and a tokenizer change invalidates it through BUILDER. Postings are stored as one
 * compact string per term (`<doc>t<n>u<n>g<n>h<n>b<n>` per document, zero fields
 * omitted) and decoded only for the terms a query asks for, which is what keeps a warm
 * load to one JSON.parse; `postings.sketch` holds one base64 Bloom filter per row.
 * Writes go tmp-then-rename (concurrent sessions share this
 * checkout); an unwritable cache degrades to in-memory with one stderr note.
 *
 * BUDGET. A Result is cut at `top` or at `budgetTokens`, whichever binds first, where
 * tokens are estimated over the exact compact text the CLI prints (formatHit), so the
 * number an agent is told is the number it pays.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseFrontmatter } from './skills-lane.mjs';

export const PROJECTION_SCHEMA = 'registry-route/1';
export const RESULT_SCHEMA = 'registry-query/1';
export const DEFAULT_TOP = 8;
export const DEFAULT_BUDGET_TOKENS = 1500;
export const DEFAULT_READ_TOKENS = 2000;
export const GIST_MAX_CHARS = 280;

/** Same estimator as ledger-read.mjs, so budgets mean one thing across tools. */
export const estimateTokens = (s) => Math.ceil(s.length / 4);

/** Bumped whenever tokenizer, fields or encoding change: it is folded into every fingerprint. */
export const BUILDER = 'rq-builder/4';

/** Field order is the posting encoding's letter order: t u g h b. */
export const FIELDS = ['title', 'use_when', 'gist', 'headings', 'body'];
const FIELD_LETTER = ['t', 'u', 'g', 'h', 'b'];

/** Query-time weights; postings keep raw per-field counts, so tuning needs no rebuild. */
export const FIELD_WEIGHTS = { title: 3, use_when: 3, gist: 2, headings: 1.5, body: 1 };
export const BM25 = { k1: 1.2, b: 0.75 };
export const PHRASE_BONUS = 0.5; // times the summed idf of the phrase's tokens
export const BODY_PHRASE_BONUS = 1.5; // times summed idf, times (1 + ln occurrences)
export const PAIR_BONUS = 0.3; // times the pair's summed idf, per query pair the body sketch may hold
export const PHRASE_SCAN_MAX = 64; // body files read per query for the phrase scan
export const MAX_PER_SUBJECT = 3;
const KIND_PRIORITY = { technique: 0, subject: 1, law: 2 };
const WHEN_MAX_CHARS = 240;

/** Lanes readDoc will serve. Everything else in the checkout is tooling or local state. */
export const READ_LANES = ['knowledge', 'recipes', 'skills', 'practices', 'memory', 'publications', 'docs', 'librarian'];

// ---------------------------------------------------------------- tokens

const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can', 'do', 'does', 'for',
  'from', 'had', 'has', 'have', 'if', 'in', 'into', 'is', 'it', 'its', 'of', 'on', 'or', 'so',
  'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
  'to', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'why', 'how',
  'will', 'with', 'would', 'you', 'your', 'our', 'not', 'no', 'one',
]);

const undouble = (s) => (/([b-df-hj-km-np-tv-z])\1$/.test(s) && !/(ll|ss|zz)$/.test(s) ? s.slice(0, -1) : s);

/** The five-rule stemmer. Exported because the tests pin its folds. */
export function stem(w) {
  if (w.length <= 2 || /^\d+$/.test(w)) return w;
  let s = w;
  if (s.length > 4 && s.endsWith('ies')) s = `${s.slice(0, -3)}y`;
  else if (s.endsWith('s') && !/(ss|us|is)$/.test(s) && s.length - 1 >= 2) s = s.slice(0, -1);
  if (s.endsWith('ing') && s.length - 3 >= 3) s = undouble(s.slice(0, -3));
  else if (s.endsWith('ed') && !s.endsWith('eed') && s.length - 2 >= 3) s = undouble(s.slice(0, -2));
  if (s.endsWith('e') && s.length - 1 >= 3) s = s.slice(0, -1);
  return s;
}

/** Text -> stemmed tokens, in order (order matters for the phrase bonus). */
export function tokenize(text) {
  const out = [];
  for (const w of String(text ?? '').toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length < 2 || STOP.has(w)) continue;
    out.push(stem(w));
  }
  return out;
}

// ---------------------------------------------------------------- markdown

const stripLinks = (s) => s.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
const clean = (s) => stripLinks(s).replace(/<[^>]+>/g, ' ').replace(/\*\*|__/g, '').replace(/\s+/g, ' ').trim();

const ABBREV = /(?:^|\s)(?:e\.g|i\.e|etc|vs|cf|approx|no|fig)\.$/i;

/** First sentence of an already-cleaned paragraph. */
export function firstSentence(text) {
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c !== '.' && c !== '!' && c !== '?') continue;
    let j = i + 1;
    while (j < text.length && /["')\]*_`”’]/.test(text[j])) j += 1;
    if (j >= text.length) return text.slice(0, j);
    if (text[j] !== ' ') continue;
    if (c === '.' && ABBREV.test(text.slice(0, i + 1))) continue;
    const next = text[j + 1] ?? '';
    if (/[A-Z0-9"'(\[*_`“‘]/.test(next)) return text.slice(0, j);
  }
  return text;
}

const capWords = (s, max) => {
  if (s.length <= max) return s;
  let cut = s.slice(0, max - 3);
  const sp = cut.lastIndexOf(' ');
  if (sp > max / 2) cut = cut.slice(0, sp);
  return `${cut.replace(/[\s,;:.-]+$/, '')}...`;
};

const isProseStart = (line) => !/^\s*(#|```|~~~|\||>|[-*+]\s|\d+[.)]\s|<|!\[|---|===)/.test(line);

/**
 * Split a markdown body (frontmatter already removed) into the routable parts.
 * @returns {{ title: string, paragraph: string, headings: string[], body: string }}
 */
export function parseBody(body) {
  const lines = String(body).replace(/\r\n/g, '\n').split('\n');
  let title = '';
  let paragraph = '';
  const headings = [];
  const bodyLines = [];
  let fence = false;
  let para = null; // lines of the paragraph being collected
  let sawTitle = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      bodyLines.push(line);
      if (para) { paragraph ||= para.join(' '); para = null; }
      continue;
    }
    if (!fence) {
      const h1 = /^#\s+(.+?)\s*#*\s*$/.exec(line);
      if (h1 && !sawTitle) { title = clean(h1[1]); sawTitle = true; continue; }
      const hn = /^#{2,6}\s+(.+?)\s*#*\s*$/.exec(line);
      if (hn) {
        headings.push(clean(hn[1]));
        if (para) { paragraph ||= para.join(' '); para = null; }
        continue;
      }
      if (!paragraph) {
        if (line.trim() === '') {
          if (para) { paragraph = para.join(' '); para = null; }
        } else if (para) para.push(line);
        else if (isProseStart(line)) para = [line];
      }
    }
    bodyLines.push(line);
  }
  if (para && !paragraph) paragraph = para.join(' ');
  return { title, paragraph: clean(paragraph), headings, body: bodyLines.join('\n') };
}

/** `<H1> - <first sentence of the first prose paragraph>`, capped; '' without a paragraph. */
export function extractGist(body, fallbackTitle = '') {
  const { title, paragraph } = parseBody(body);
  return gistOf(title || fallbackTitle, paragraph);
}

const gistOf = (title, paragraph) => {
  if (!paragraph) return '';
  const sentence = firstSentence(paragraph);
  return capWords(title ? `${title} - ${sentence}` : sentence, GIST_MAX_CHARS);
};

const bodyText = (s) => stripLinks(s).replace(/https?:\/\/\S+/g, ' ').replace(/<[^>]+>/g, ' ');

const unquote = (s) => String(s).trim().replace(/^(["'])(.*)\1$/, '$2');
const asList = (v) => (Array.isArray(v) ? v.map(unquote).filter(Boolean) : typeof v === 'string' && v.trim() ? [unquote(v)] : []);

// ---------------------------------------------------------------- build

const toPosix = (p) => p.split(path.sep).join('/');

function walkMd(dir, rel, out) {
  let list;
  try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of list) {
    if (e.name.startsWith('.')) continue;
    const abs = path.join(dir, e.name);
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walkMd(abs, r, out);
    else if (e.isFile() && e.name.endsWith('.md')) out.push(r);
  }
  return out;
}

/** Stat-based digest of one bundle: builder version + (rel, size, mtimeMs) of every .md and index.json. */
export function bundleFingerprint(root, domain) {
  const base = path.join(root, 'knowledge', domain);
  const files = walkMd(base, '', []);
  files.push('index.json');
  files.sort();
  const h = crypto.createHash('sha256').update(`${BUILDER}\n`);
  for (const rel of files) {
    let st = null;
    try { st = fs.statSync(path.join(base, rel)); } catch { /* absent index.json hashes as absent */ }
    h.update(`${rel}\t${st ? st.size : -1}\t${st ? st.mtimeMs : -1}\n`);
  }
  return `sha256:${h.digest('hex')}`;
}

/** Bundles present under knowledge/ (a directory with an index.json), filtered by `domains`. */
export function listDomains(root, domains = null) {
  const lane = path.join(root, 'knowledge');
  let names = [];
  try {
    names = fs.readdirSync(lane, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && fs.existsSync(path.join(lane, e.name, 'index.json')))
      .map((e) => e.name)
      .sort();
  } catch { return []; }
  const want = normDomains(domains);
  return want ? names.filter((n) => want.has(n)) : names;
}

const normDomains = (d) => {
  if (d == null) return null;
  const list = (Array.isArray(d) ? d : String(d).split(',')).map((x) => String(x).trim()).filter(Boolean);
  return list.length ? new Set(list) : null;
};

const readMd = (abs) => {
  const raw = fs.readFileSync(abs, 'utf8');
  const parsed = parseFrontmatter(raw);
  return parsed ? { fm: parsed.fm, body: parsed.body } : { fm: {}, body: raw };
};

/** Sections of `_laws.md` keyed by anchor id -> section text (for the law row's body). */
function lawSections(text) {
  const out = {};
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  let id = null;
  let buf = [];
  const flush = () => { if (id) out[id] = buf.join('\n'); };
  for (const line of lines) {
    const m = /^##\s+.*<a id="([^"]+)"/.exec(line);
    if (m || /^##?\s/.test(line)) { flush(); id = m ? m[1] : null; buf = []; continue; }
    if (id) buf.push(line);
  }
  flush();
  return out;
}

/** Per-field unigram counts. A field is a string or a list of segments (use_when lines, headings). */
function countFields(fieldTexts) {
  const tf = new Map(); // token -> [5 counts]
  const lengths = [0, 0, 0, 0, 0];
  fieldTexts.forEach((text, f) => {
    for (const seg of Array.isArray(text) ? text : [text]) {
      const toks = tokenize(seg);
      lengths[f] += toks.length;
      for (const t of toks) {
        let row = tf.get(t);
        if (!row) { row = [0, 0, 0, 0, 0]; tf.set(t, row); }
        row[f] += 1;
      }
    }
  });
  return { tf, lengths };
}

// ---------------------------------------------------------------- phrase sketch
//
// Which documents could contain a phrase in their prose? Exact bigram postings answer
// that and were measured at 63 MB of cache (4 s warm load) for the eleven bundles,
// against 14 MB without them. A per-document Bloom filter over the body's adjacent
// token pairs answers "certainly not" or "maybe" at SKETCH_BITS_PER_PAIR bits a pair
// (~3% false positives at k=3), and the "maybe"s are confirmed by reading the file -
// so the sketch only decides which files are worth opening, never what is true.
export const SKETCH_BITS_PER_PAIR = 8;
const SKETCH_K = 3;

const fnv = (str, seed) => {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i += 1) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
};
const pairKey = (a, b) => `${a} ${b}`;
const sketchBits = (key, m) => {
  const h1 = fnv(key, 2166136261);
  const h2 = fnv(key, 0x9747b28c) | 1;
  const out = [];
  for (let i = 0; i < SKETCH_K; i += 1) out.push((h1 + Math.imul(i, h2) >>> 0) % m);
  return out;
};

/** Base64 Bloom filter of every adjacent token pair in the segments. '' when there are none. */
function buildSketch(segments) {
  const pairs = new Set();
  for (const seg of segments) {
    const toks = tokenize(seg);
    for (let i = 1; i < toks.length; i += 1) pairs.add(pairKey(toks[i - 1], toks[i]));
  }
  if (!pairs.size) return '';
  const bytes = Math.max(8, Math.ceil((pairs.size * SKETCH_BITS_PER_PAIR) / 8));
  const buf = Buffer.alloc(bytes);
  const m = bytes * 8;
  for (const p of pairs) for (const bit of sketchBits(p, m)) buf[bit >> 3] |= 1 << (bit & 7);
  return buf.toString('base64');
}

/** May the document whose sketch this is contain every adjacent pair of `toks`? */
function sketchMay(sketch, toks) {
  if (!sketch || !sketch.length) return false;
  const buf = typeof sketch === 'string' ? Buffer.from(sketch, 'base64') : sketch;
  const m = buf.length * 8;
  for (let i = 1; i < toks.length; i += 1) {
    for (const bit of sketchBits(pairKey(toks[i - 1], toks[i]), m)) if (!(buf[bit >> 3] & (1 << (bit & 7)))) return false;
  }
  return true;
}

const encodePosting = (doc, row) => {
  let s = String(doc);
  for (let f = 0; f < 5; f += 1) if (row[f]) s += FIELD_LETTER[f] + row[f];
  return s;
};

/** Build one bundle's segment: entries plus postings. Pure over the files on disk. */
export function buildBundle(root, domain) {
  const base = path.join(root, 'knowledge', domain);
  const index = JSON.parse(fs.readFileSync(path.join(base, 'index.json'), 'utf8'));
  const entries = [];
  const docs = []; // per entry: [title, use_when, gist, headings, body]
  const nonconforming = [];
  const missing = [];

  for (const slug of Object.keys(index.subjects ?? {}).sort()) {
    const s = index.subjects[slug];
    if (!s?.file) continue;
    const gpAbs = path.join(root, s.file);
    if (!fs.existsSync(gpAbs)) { missing.push(s.file); continue; }
    const gp = readMd(gpAbs);
    const gpParts = parseBody(gp.body);
    const nApps = (s.applications ?? []).length;
    const nTech = (s.techniques ?? []).length;
    const gpTitle = gpParts.title || slug;
    const gpGist = gistOf(gpTitle, gpParts.paragraph);
    const gpUse = asList(gp.fm.use_when);
    entries.push({
      kind: 'subject', domain, subject: slug, technique: null, path: s.file, title: gpTitle,
      gist: gpGist ? `${gpGist} (${nTech} technique${nTech === 1 ? '' : 's'}, ${nApps} application${nApps === 1 ? '' : 's'})` : '',
      use_when: gpUse, status: s.status ?? gp.fm.status ?? null, laws: asList(gp.fm.laws),
    });
    docs.push([[gpTitle, slug.replace(/-/g, ' ')], gpUse, gpGist, gpParts.headings, bodyText(gpParts.body)]);

    const subjDir = path.posix.dirname(s.file);
    let byFm = null; // lazily: technique slug -> file, for files not named after their slug
    for (const t of s.techniques ?? []) {
      let rel = `${subjDir}/techniques/${t.slug}.md`;
      if (!fs.existsSync(path.join(root, rel))) {
        if (!byFm) {
          byFm = new Map();
          const tdir = path.join(root, subjDir, 'techniques');
          for (const f of fs.existsSync(tdir) ? fs.readdirSync(tdir).filter((x) => x.endsWith('.md')) : []) {
            const tf = readMd(path.join(tdir, f));
            if (tf.fm.technique) byFm.set(tf.fm.technique, `${subjDir}/techniques/${f}`);
          }
        }
        if (!byFm.has(t.slug)) { missing.push(rel); continue; }
        rel = byFm.get(t.slug);
        nonconforming.push(rel);
      }
      const tm = readMd(path.join(root, rel));
      const parts = parseBody(tm.body);
      const title = parts.title || t.slug;
      const gist = gistOf(title, parts.paragraph);
      const use = asList(tm.fm.use_when);
      entries.push({
        kind: 'technique', domain, subject: slug, technique: t.slug, path: rel, title, gist,
        use_when: use, status: t.status ?? tm.fm.status ?? null, laws: asList(tm.fm.laws ?? t.laws),
      });
      docs.push([[title, t.slug.replace(/-/g, ' ')], use, gist, parts.headings, bodyText(parts.body)]);
    }
  }

  const lawsRel = `knowledge/${domain}/_laws.md`;
  const lawsAbs = path.join(root, lawsRel);
  const lawText = fs.existsSync(lawsAbs) ? lawSections(fs.readFileSync(lawsAbs, 'utf8')) : {};
  for (const id of Object.keys(index.laws ?? {}).sort()) {
    const statement = clean(index.laws[id]?.statement ?? '');
    const gist = statement ? capWords(`${id} - ${firstSentence(statement)}`, GIST_MAX_CHARS) : '';
    entries.push({ kind: 'law', domain, subject: null, technique: null, path: lawsRel, title: id, gist, use_when: [], status: null, laws: [id] });
    docs.push([[id.replace(/-/g, ' ')], [], gist, [], bodyText(lawText[id] ?? statement)]);
  }

  const terms = new Map(); // token -> string[] encoded postings
  const lengths = [];
  const sketch = [];
  docs.forEach((fieldTexts, i) => {
    const { tf, lengths: len } = countFields(fieldTexts);
    lengths.push(len);
    sketch.push(buildSketch([...fieldTexts[3], fieldTexts[4]]));
    for (const [tok, row] of tf) {
      let list = terms.get(tok);
      if (!list) { list = []; terms.set(tok, list); }
      list.push(encodePosting(i, row));
    }
  });
  const termObj = {};
  for (const tok of [...terms.keys()].sort()) termObj[tok] = terms.get(tok).join(',');

  return {
    domain,
    entries,
    postings: { fields: FIELDS, lengths, terms: termObj, sketch, nonconforming: nonconforming.sort(), missing: missing.sort() },
  };
}

const assemble = (root, segments, builtFrom) => {
  const entries = [];
  const segs = [];
  for (const s of segments) {
    segs.push({ domain: s.domain, offset: entries.length, count: s.entries.length, lengths: s.postings.lengths, terms: s.postings.terms, sketch: s.postings.sketch ?? [], nonconforming: s.postings.nonconforming ?? [], missing: s.postings.missing ?? [] });
    for (const e of s.entries) entries.push(e);
  }
  return { schema: PROJECTION_SCHEMA, builtFrom, entries, postings: { fields: FIELDS, root, segments: segs } };
};

/**
 * Walk every bundle (or `domains`) under `<root>/knowledge/` and build the projection.
 * @returns {{ schema: string, builtFrom: Record<string,string>, entries: object[], postings: object }}
 */
export function buildProjection(root, { domains = null } = {}) {
  const builtFrom = {};
  const segments = [];
  for (const d of listDomains(root, domains)) {
    builtFrom[d] = bundleFingerprint(root, d);
    segments.push(buildBundle(root, d));
  }
  return assemble(root, segments, builtFrom);
}

let warnedCache = false;
const cacheNote = (msg) => {
  if (warnedCache) return;
  warnedCache = true;
  process.stderr.write(`registry-query: ${msg}; continuing with an in-memory projection\n`);
};

/**
 * Load the cached projection, rebuilding a bundle whose digest moved.
 * @returns the same shape as buildProjection
 */
export function loadProjection(root, { domains = null, cacheDir = null, rebuild = false } = {}) {
  const dir = cacheDir ?? path.join(root, '.cache', 'registry-route');
  const builtFrom = {};
  const segments = [];
  for (const d of listDomains(root, domains)) {
    const fingerprint = bundleFingerprint(root, d);
    builtFrom[d] = fingerprint;
    const file = path.join(dir, `${d}.json`);
    if (!rebuild) {
      try {
        const c = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (c.schema === PROJECTION_SCHEMA && c.fingerprint === fingerprint && Array.isArray(c.entries) && c.postings?.terms && Array.isArray(c.postings.sketch)) {
          segments.push({ domain: d, entries: c.entries, postings: c.postings });
          continue;
        }
      } catch { /* absent or corrupt: rebuild */ }
    }
    const seg = buildBundle(root, d);
    segments.push(seg);
    try {
      fs.mkdirSync(dir, { recursive: true });
      const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify({ schema: PROJECTION_SCHEMA, fingerprint, entries: seg.entries, postings: seg.postings }));
      fs.renameSync(tmp, file);
    } catch (e) {
      cacheNote(`cache not writable at ${dir} (${e.code ?? e.message})`);
    }
  }
  return assemble(root, segments, builtFrom);
}

// ---------------------------------------------------------------- query

const POSTING_RE = /(\d+)((?:[tughb]\d+)*)/;
const decode = (enc) => {
  const out = [];
  for (const p of enc.split(',')) {
    const m = POSTING_RE.exec(p);
    const row = [0, 0, 0, 0, 0];
    for (const fm of m[2].matchAll(/([tughb])(\d+)/g)) row[FIELD_LETTER.indexOf(fm[1])] = Number(fm[2]);
    out.push([Number(m[1]), row]);
  }
  return out;
};

// Lowercased, frontmatter-stripped document text for the body phrase scan. Bounded, and
// keyed by mtime so a long-lived caller (the MCP server) never matches a stale copy.
const TEXT_CACHE_MAX = 1024;
const textCache = new Map();
function docText(root, rel) {
  const abs = path.join(root, rel);
  let st;
  try { st = fs.statSync(abs); } catch { return ''; }
  const hit = textCache.get(abs);
  if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.text;
  let text = '';
  try { text = bodyText(fs.readFileSync(abs, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---/, '')).toLowerCase(); } catch { return ''; }
  if (textCache.size >= TEXT_CACHE_MAX) textCache.clear();
  textCache.set(abs, { mtimeMs: st.mtimeMs, size: st.size, text });
  return text;
}

const STOP_ALT = [...STOP].sort((a, b) => b.length - a.length).join('|');
/**
 * Candidate matcher for a token sequence: each stem as a word prefix, stopwords and
 * one-character words skippable between. Tokens are [a-z0-9]+ by construction, so
 * they need no escaping.
 */
const phraseRegex = (toks) => new RegExp(
  `(?<![a-z0-9])${toks.map((t) => `${t}[a-z0-9]*`).join(`(?:[^a-z0-9]+(?:${STOP_ALT}|[a-z0-9]))*[^a-z0-9]+`)}(?![a-z0-9])`, 'g');
/** Occurrences of the exact token sequence: the regex proposes, tokenize() confirms. */
function countPhrase(text, re, toks) {
  if (!text) return 0;
  let n = 0;
  re.lastIndex = 0;
  for (const m of text.matchAll(re)) {
    const got = tokenize(m[0]);
    if (got.length === toks.length && got.every((t, i) => t === toks[i])) n += 1;
  }
  return n;
}

const phraseCache = new WeakMap(); // entry -> ' tok tok ... ' per phrase field

const phraseFields = (e) => {
  let v = phraseCache.get(e);
  if (!v) {
    v = [` ${tokenize(`${e.title} ${e.technique ?? e.subject ?? ''}`.replace(/-/g, ' ')).join(' ')} `, ...e.use_when.map((u) => ` ${tokenize(u).join(' ')} `), ` ${tokenize(e.gist).join(' ')} `];
    v.labels = ['title', ...e.use_when.map(() => 'use_when'), 'gist'];
    phraseCache.set(e, v);
  }
  return v;
};

const addressOf = (h) => {
  if (h.kind === 'technique') return `${h.domain}/${h.subject}/${h.technique}`;
  if (h.kind === 'subject') return `${h.domain}/${h.subject}`;
  const id = h.gist.split(' - ')[0] || '_laws';
  return `${h.domain}/${id}`;
};

/** The compact two-line text form of one hit: what the CLI prints and what the budget counts. */
export function formatHit(h) {
  const gist = h.kind === 'law' ? h.gist.split(' - ').slice(1).join(' - ') : h.gist;
  const head = `${h.rank}. ${h.kind} ${addressOf(h)}${gist ? ` - ${gist}` : ''}`;
  const tail = h.kind === 'law'
    ? ` | section: ${addressOf(h).split('/').pop()}`
    : h.use_when.length ? ` | when: ${capWords(h.use_when.join('; '), WHEN_MAX_CHARS)}` : '';
  return `${head}\n   ${h.path}${tail}`;
}

/**
 * Rank entries for the terms. Output is cut to `budgetTokens` (estimated over the
 * serialized hits) and `top`, whichever binds first; `truncated` says which happened.
 * @returns Result
 */
export function query(projection, terms, { domains = null, top = DEFAULT_TOP, budgetTokens = DEFAULT_BUDGET_TOKENS, kinds = null, weights = FIELD_WEIGHTS, bm25 = BM25, phraseBonus = PHRASE_BONUS, bodyPhraseBonus = BODY_PHRASE_BONUS, scanMax = PHRASE_SCAN_MAX, pairBonus = PAIR_BONUS } = {}) {
  const termList = (Array.isArray(terms) ? terms : [terms]).map((t) => String(t).trim()).filter(Boolean);
  const result = (hits, truncated, reason, text = '') => ({
    schema: RESULT_SCHEMA, terms: termList, hits, truncated, tokens: estimateTokens(text), empty_reason: reason,
  });

  const qTokens = [...new Set(termList.flatMap(tokenize))];
  if (!qTokens.length) return result([], false, 'no terms after tokenizing (every word was a stopword or too short)');

  const want = normDomains(domains);
  const segs = (projection?.postings?.segments ?? []).filter((s) => !want || want.has(s.domain));
  if (!segs.length) {
    return result([], false, want ? `no bundle matches domain ${[...want].join(',')}` : 'no bundle in the projection');
  }
  const kindSet = kinds ? new Set(Array.isArray(kinds) ? kinds : String(kinds).split(',')) : null;

  // Corpus statistics over the queried bundles only.
  let N = 0;
  const sumLen = [0, 0, 0, 0, 0];
  for (const s of segs) {
    N += s.lengths.length;
    for (const l of s.lengths) for (let f = 0; f < 5; f += 1) sumLen[f] += l[f];
  }
  const avg = sumLen.map((x) => (N ? x / N : 0));
  const w = FIELDS.map((f) => weights[f] ?? 0);

  const lists = new Map(); // token -> [{seg, doc, row}]
  for (const tok of qTokens) {
    const all = [];
    for (const s of segs) {
      if (typeof s.terms[tok] !== 'string') continue; // not `in`: JSON objects inherit `constructor`
      for (const [doc, row] of decode(s.terms[tok])) all.push({ s, doc, row });
    }
    lists.set(tok, all);
  }

  const scores = new Map(); // global entry index -> {score, contrib: per field per token}
  const idfOf = new Map();
  for (const [tok, all] of lists) {
    if (!all.length) continue;
    const idf = Math.log(1 + (N - all.length + 0.5) / (all.length + 0.5));
    idfOf.set(tok, idf);
    for (const { s, doc, row } of all) {
      const len = s.lengths[doc];
      let tfw = 0;
      const per = [0, 0, 0, 0, 0];
      for (let f = 0; f < 5; f += 1) {
        if (!row[f] || !w[f] || !avg[f]) continue;
        const norm = row[f] / (1 - bm25.b + bm25.b * (len[f] / avg[f]));
        per[f] = w[f] * norm;
        tfw += per[f];
      }
      if (!tfw) continue;
      const contrib = idf * ((tfw * (bm25.k1 + 1)) / (bm25.k1 + tfw));
      const gi = s.offset + doc;
      let acc = scores.get(gi);
      if (!acc) { acc = { score: 0, fields: new Map(), phrases: [], toks: new Set() }; scores.set(gi, acc); }
      acc.score += contrib;
      acc.toks.add(tok);
      for (let f = 0; f < 5; f += 1) {
        if (!per[f]) continue;
        const share = contrib * (per[f] / tfw);
        const fe = acc.fields.get(FIELDS[f]) ?? { score: 0, toks: [] };
        fe.score += share;
        fe.toks.push(tok);
        acc.fields.set(FIELDS[f], fe);
      }
    }
  }

  // Phrase evidence. A multi-token term whose token sequence occurs contiguously is
  // stronger than the same words scattered, and the bag above cannot see order. Title,
  // use_when and gist are checked in memory. The BODY is checked in two steps: the
  // bigram sketch drops every row that certainly lacks the phrase, then the file is read
  // to confirm and count it, for at most PHRASE_SCAN_MAX rows a query (file reads cost
  // ~0.7 ms each on a Windows checkout). This is what recovers a concept carried only in
  // prose: "shared custody" put no owner in a bag ranking's top 40, and ordering a
  // fixed read window by score or by body weight alone still missed at 32 reads.
  const sketchOf = (gi) => {
    const seg = segs.find((x) => gi >= x.offset && gi < x.offset + x.count);
    return seg?.sketch?.[gi - seg.offset] ?? '';
  };
  const phrases = termList
    .map((t) => ({ term: t, toks: tokenize(t) }))
    .filter((p) => p.toks.length >= 2 && p.toks.every((t) => idfOf.has(t)));
  if (phrases.length) {
    const root = projection.postings?.root ?? null;
    const perPhrase = Math.max(16, Math.floor(scanMax / phrases.length));
    for (const p of phrases) {
      const idfSum = p.toks.reduce((n, t) => n + idfOf.get(t), 0);
      const needle = ` ${p.toks.join(' ')} `;
      const carriers = [];
      for (const [gi, acc] of scores) {
        if (!p.toks.every((t) => acc.toks.has(t))) continue;
        const e = projection.entries[gi];
        if (phraseBonus) {
          const pf = phraseFields(e);
          const at = pf.findIndex((x) => x.includes(needle));
          if (at !== -1) {
            const bonus = phraseBonus * idfSum;
            acc.score += bonus;
            acc.phrases.push({ label: pf.labels[at], term: p.term, bonus });
          }
        }
        if (root && bodyPhraseBonus && e.kind !== 'law' && sketchMay(sketchOf(gi), p.toks)) carriers.push([gi, acc]);
      }
      carriers.sort((x, y) => y[1].score - x[1].score);
      const re = phraseRegex(p.toks);
      for (const [gi, acc] of carriers.slice(0, perPhrase)) {
        const n = countPhrase(docText(root, projection.entries[gi].path), re, p.toks);
        if (!n) continue;
        const bonus = bodyPhraseBonus * idfSum * (1 + Math.log(n));
        acc.score += bonus;
        acc.phrases.push({ label: 'body', term: p.term, bonus, n });
      }
    }
  }

  // Sub-phrase pairs. A long query (a use_when-shaped sentence) rarely occurs whole in
  // anyone's prose, but its adjacent pairs ("green audit", "screen reader") do. These are
  // scored from the sketch alone, without a read: a ~3% false positive costs one small
  // bonus, not a wrong file. Measured on the leave-one-out dev set (three 200-query
  // seeds): recall@5 +4..+5, recall@1 +6..+11 at PAIR_BONUS 0.3; 0.6 gave some back.
  if (pairBonus) {
    const pairTerms = termList.map(tokenize).filter((k) => k.length >= 3);
    if (pairTerms.length) {
      for (const [gi, acc] of scores) {
        const sk = sketchOf(gi);
        if (!sk) continue;
        const buf = Buffer.from(sk, 'base64');
        for (const toks of pairTerms) {
          for (let i = 1; i < toks.length; i += 1) {
            if (!acc.toks.has(toks[i - 1]) || !acc.toks.has(toks[i])) continue;
            if (sketchMay(buf, [toks[i - 1], toks[i]])) acc.score += pairBonus * (idfOf.get(toks[i - 1]) + idfOf.get(toks[i]));
          }
        }
      }
    }
  }

  // Original surface word for each stem, for readable why[] strings.
  const surface = new Map();
  for (const t of termList) {
    for (const wd of t.toLowerCase().split(/[^a-z0-9]+/)) {
      if (wd.length < 2 || STOP.has(wd)) continue;
      const st = stem(wd);
      if (!surface.has(st)) surface.set(st, wd);
    }
  }

  const ranked = [];
  for (const [gi, acc] of scores) {
    const e = projection.entries[gi];
    if (kindSet && !kindSet.has(e.kind)) continue;
    ranked.push({ e, acc });
  }
  ranked.sort((a, b) => b.acc.score - a.acc.score
    || KIND_PRIORITY[a.e.kind] - KIND_PRIORITY[b.e.kind]
    || (a.e.path < b.e.path ? -1 : a.e.path > b.e.path ? 1 : 0)
    || String(a.e.technique ?? a.e.title).localeCompare(String(b.e.technique ?? b.e.title)));

  if (!ranked.length) return result([], false, `no match for ${termList.map((t) => JSON.stringify(t)).join(', ')} in ${segs.map((s) => s.domain).join(', ')}`);

  const perSubject = new Map();
  const hits = [];
  let text = '';
  let truncated = false;
  for (const { e, acc } of ranked) {
    if (e.subject) {
      const key = `${e.domain}/${e.subject}`;
      const n = perSubject.get(key) ?? 0;
      if (n >= MAX_PER_SUBJECT) continue;
      perSubject.set(key, n + 1);
    }
    if (hits.length >= top) { truncated = true; break; }
    const why = [
      ...acc.phrases.sort((a, b) => b.bonus - a.bonus).map((p) => `phrase in ${p.label}:"${p.term}"${p.n > 1 ? ` x${p.n}` : ''}`),
      ...[...acc.fields.entries()].sort((a, b) => b[1].score - a[1].score)
        .map(([f, fe]) => `${f}:"${fe.toks.map((t) => surface.get(t) ?? t).join(' ')}"`),
    ].slice(0, 3);
    const hit = {
      rank: hits.length + 1, score: Math.round(acc.score * 1000) / 1000, kind: e.kind, domain: e.domain,
      subject: e.subject, technique: e.technique, path: e.path, gist: e.gist, use_when: e.use_when, why,
    };
    const next = text ? `${text}\n${formatHit(hit)}` : formatHit(hit);
    if (estimateTokens(next) > budgetTokens) { truncated = true; break; }
    text = next;
    hits.push(hit);
  }
  if (!hits.length) return result([], true, `budget of ${budgetTokens} tokens is below one hit`);
  return result(hits, truncated, null, text);
}

// ---------------------------------------------------------------- evaluation

/**
 * A copy of `projection` with one use_when line removed from one entry, postings and
 * field length included - the leave-one-out arm of a routing evaluation, so a query
 * phrased as that line must find its owner through every OTHER field. Copy-on-write:
 * only the touched term strings, one lengths row and one entry are new objects.
 */
export function withoutUseWhen(projection, entryIndex, line) {
  const e = projection.entries[entryIndex];
  if (!e || !e.use_when.includes(line)) throw new Error(`registry-query: entry ${entryIndex} has no use_when ${JSON.stringify(line)}`);
  const seg = projection.postings.segments.find((s) => entryIndex >= s.offset && entryIndex < s.offset + s.count);
  const doc = entryIndex - seg.offset;
  const toks = tokenize(line);
  const dec = new Map();
  for (const t of toks) dec.set(t, (dec.get(t) ?? 0) + 1);
  const terms = Object.create(seg.terms);
  for (const [t, n] of dec) {
    const list = decode(seg.terms[t]).map(([d, row]) => {
      if (d !== doc) return [d, row];
      const r = row.slice();
      r[1] = Math.max(0, r[1] - n);
      return [d, r];
    }).filter(([, r]) => r.some(Boolean));
    terms[t] = list.length ? list.map(([d, r]) => encodePosting(d, r)).join(',') : undefined;
  }
  const lengths = seg.lengths.slice();
  lengths[doc] = lengths[doc].slice();
  lengths[doc][1] = Math.max(0, lengths[doc][1] - toks.length);
  const entries = projection.entries.slice();
  entries[entryIndex] = { ...e, use_when: e.use_when.filter((u) => u !== line) };
  const segments = projection.postings.segments.map((s) => (s === seg ? { ...s, terms, lengths } : s));
  return { ...projection, entries, postings: { ...projection.postings, segments } };
}

// ---------------------------------------------------------------- read

/** Validate a repo-relative path against the published lanes; returns the posix form. */
export function checkReadPath(relPath) {
  const raw = String(relPath ?? '').trim();
  if (!raw) throw new Error('registry-query: readDoc needs a repo-relative path');
  if (path.isAbsolute(raw) || /^[A-Za-z]:/.test(raw) || raw.startsWith('/') || raw.startsWith('\\')) {
    throw new Error(`registry-query: refusing absolute path ${JSON.stringify(raw)}; pass a repo-relative path such as knowledge/<domain>/...`);
  }
  const p = raw.replace(/\\/g, '/').replace(/^\.\//, '');
  const segs = p.split('/');
  if (segs.some((s) => s === '..')) throw new Error(`registry-query: refusing ${JSON.stringify(raw)}: '..' segments may not escape the published lanes`);
  if (!READ_LANES.includes(segs[0]) || segs.length < 2) {
    throw new Error(`registry-query: refusing ${JSON.stringify(raw)}: outside the published lanes (${READ_LANES.join(', ')})`);
  }
  if (segs.some((s) => /\.local(\.|$)/i.test(s))) {
    throw new Error(`registry-query: refusing ${JSON.stringify(raw)}: *.local.* files are machine-local and never served`);
  }
  return segs.filter((s) => s && s !== '.').join('/');
}

const headingText = (line) => clean(line.replace(/^##\s+/, '').replace(/\s*#+\s*$/, ''));

/**
 * Read one published document, optionally one `## ` section of it, under a budget.
 * Refuses paths outside the published lanes and any `*.local.*` file.
 * @returns Doc
 */
export function readDoc(root, relPath, { section = null, maxTokens = DEFAULT_READ_TOKENS } = {}) {
  const rel = checkReadPath(relPath);
  const abs = path.resolve(root, rel);
  const rootAbs = path.resolve(root);
  if (abs !== rootAbs && !abs.startsWith(rootAbs + path.sep)) throw new Error(`registry-query: refusing ${rel}: resolves outside the checkout`);
  let st;
  try { st = fs.statSync(abs); } catch { throw new Error(`registry-query: no such document ${rel}`); }
  // A link inside a lane can point anywhere; the lexical check above cannot see that.
  const real = fs.realpathSync(abs);
  const realRoot = fs.realpathSync(rootAbs);
  if (real !== realRoot && !real.startsWith(realRoot + path.sep)) throw new Error(`registry-query: refusing ${rel}: links outside the checkout`);
  if (!st.isFile()) throw new Error(`registry-query: ${rel} is not a file`);

  const lines = fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n').split('\n');
  // {i, text, id}: id is the heading's `<a id>` anchor - on the heading line, or alone on
  // the line(s) just above it (both shapes are in the corpus's _laws.md) - '' without one.
  const heads = [];
  let fence = false;
  let anchorAbove = null; // {id, at}
  lines.forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) { fence = !fence; anchorAbove = null; return; }
    if (fence) return;
    if (/^##\s/.test(l)) {
      const own = /<a\s+id="([^"]+)"/i.exec(l)?.[1];
      // `from` is where the previous section ends: an anchor above belongs to this heading.
      heads.push({ i, from: own || !anchorAbove ? i : anchorAbove.at, text: headingText(l), id: (own ?? anchorAbove?.id ?? '').toLowerCase() });
      anchorAbove = null;
      return;
    }
    const alone = /^\s*<a\s+id="([^"]+)"\s*>\s*<\/a>\s*$/i.exec(l);
    if (alone) anchorAbove = { id: alone[1], at: i };
    else if (l.trim()) anchorAbove = null;
  });
  const sections = heads.map((h) => h.text);

  let start = 0;
  let end = lines.length;
  if (section != null && String(section).trim()) {
    const want = clean(String(section).replace(/^#+\s*/, '')).toLowerCase();
    // Heading words exactly, then the heading's anchor id (what a law hit prints as its
    // section: _laws.md headings are `## <a id="<id>"></a><words>`, and the words are
    // not the id), then a prefix of the words.
    let at = heads.findIndex((h) => h.text.toLowerCase() === want);
    if (at === -1) at = heads.findIndex((h) => h.id && h.id === want);
    if (at === -1) at = heads.findIndex((h) => h.text.toLowerCase().startsWith(want));
    if (at === -1) throw new Error(`registry-query: ${rel} has no "## ${section}" section; sections: ${sections.join(' | ') || '(none)'}`);
    start = heads[at].i;
    end = heads[at + 1]?.from ?? lines.length;
  }
  const slice = lines.slice(start, end);
  while (slice.length && slice[slice.length - 1].trim() === '') slice.pop();
  const full = slice.join('\n');
  if (estimateTokens(full) <= maxTokens) return { path: rel, tokens: estimateTokens(full), truncated: false, text: full, sections };

  // Truncate on a line boundary, leaving room for the marker that names what was cut.
  const budgetChars = Math.max(0, maxTokens * 4);
  // The marker lists the document's sections (as many as fit its reserve), so the next
  // call can ask for exactly one of them.
  const reserve = Math.min(Math.floor(budgetChars / 3), 400);
  const marker = (rest) => {
    let names = sections.slice();
    const fmt = (more) => `[truncated: ${rest} more tokens; sections: ${names.join(' | ') || '(none)'}${more ? ' | ...' : ''}]`;
    let m = fmt(false);
    while (names.length && m.length > reserve) { names = names.slice(0, -1); m = fmt(true); }
    return m;
  };
  let kept = 0;
  let used = 0;
  while (kept < slice.length && used + slice[kept].length + 1 <= budgetChars - reserve) { used += slice[kept].length + 1; kept += 1; }
  const head = slice.slice(0, kept).join('\n');
  const rest = estimateTokens(full) - estimateTokens(head);
  const text = `${head}${head ? '\n' : ''}${marker(rest)}`;
  return { path: rel, tokens: estimateTokens(text), truncated: true, text, sections };
}

// ---------------------------------------------------------------- card

/** Text form of a subject card (what the CLI prints and the token count measures). */
export function formatCard(card) {
  if (!card.subject) return '';
  const s = card.subject;
  const lines = [`subject ${s.domain}/${s.subject} - ${s.gist}`, `   ${s.path}${s.use_when.length ? ` | when: ${capWords(s.use_when.join('; '), WHEN_MAX_CHARS)}` : ''}`];
  card.techniques.forEach((t, i) => {
    lines.push(`${i + 1}. ${t.technique} - ${t.gist}`);
    lines.push(`   ${t.path}${t.use_when.length ? ` | when: ${capWords(t.use_when.join('; '), WHEN_MAX_CHARS)}` : ''}`);
  });
  return lines.join('\n');
}

/**
 * A subject's card: its golden path entry plus every technique entry, gists included.
 * @returns {{ subject: object|null, techniques: object[], tokens: number }}
 */
export function subjectCard(projection, subject, { domain = null } = {}) {
  const want = normDomains(domain);
  const entries = projection?.entries ?? [];
  const s = entries.find((e) => e.kind === 'subject' && e.subject === subject && (!want || want.has(e.domain))) ?? null;
  if (!s) return { subject: null, techniques: [], tokens: 0 };
  const techniques = entries.filter((e) => e.kind === 'technique' && e.domain === s.domain && e.subject === subject);
  const card = { subject: s, techniques, tokens: 0 };
  card.tokens = estimateTokens(formatCard(card));
  return card;
}
