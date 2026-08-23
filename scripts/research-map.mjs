#!/usr/bin/env node
/**
 * research-map — the routing half of /research.
 *
 * ## What it answers
 *
 * A research run's two most expensive mistakes are proposing what the corpus already
 * says, and writing a document into a folder nobody reads. This script answers both
 * from the generated indexes, deterministically, before any judgment is spent:
 *
 *   PRIOR ART   which subjects and techniques already cover this term, with the file
 *               that is their ADDRESS - so nothing downstream constructs a path. A
 *               bundle is nested (`<category>/[<subcategory>/]<subject>/`) and a
 *               guessed path writes a document into a folder no consumer walks.
 *   HOME        where a genuinely new subject would live, from taxonomy.json, which
 *               is the authority on placement.
 *   NOTHING     an honest empty result. "The registry has never heard of this" is a
 *               finding, and it is the one a model is most tempted to paper over.
 *
 * ## What it refuses to answer
 *
 * Whether the claim is TRUE, and whether the corpus is WRONG. Slug overlap says a
 * subject is in the neighbourhood, never that it says the same thing - the file still
 * has to be read before a correction is written against it. This is the same split
 * every instrument here runs on: the script counts, the skill judges.
 *
 * Matching is over slugs and law statements, deliberately. Slugs in this corpus are
 * descriptive noun phrases, so token overlap is a decent recall signal at zero cost;
 * `--deep` additionally reads each concept document's `use_when` frontmatter, which
 * is the field written to be matched on but which the index does not carry.
 *
 * Usage:
 *   node scripts/research-map.mjs "local inference" "open weights"
 *   node scripts/research-map.mjs --terms "agent memory, tool use" --top 5
 *   node scripts/research-map.mjs "prompt caching" --domain llm-observability --json
 *   node scripts/research-map.mjs "quantization" --deep
 *
 * Zero dependencies, like every gate here.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const pick = (n, d) => {
  const i = argv.indexOf(n);
  return i === -1 ? d : argv[i + 1];
};

const VALUED = new Set(['--terms', '--domain', '--top']);
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i].startsWith('--')) {
    if (VALUED.has(argv[i])) i += 1;
    continue;
  }
  positional.push(argv[i]);
}

const asJson = flag('--json');
const deep = flag('--deep');
const topN = Number(pick('--top', 6));
const onlyDomain = pick('--domain', null);
const terms = [...positional, ...String(pick('--terms', '')).split(',')]
  .map((t) => t.trim())
  .filter(Boolean);

if (terms.length === 0) {
  console.error('usage: node scripts/research-map.mjs <term> [<term> ...] [--terms "a, b"] [--domain <d>] [--top N] [--deep] [--json]');
  process.exit(2);
}

// ---------------------------------------------------------------- instrument
if (!fs.existsSync(KNOWLEDGE)) {
  console.error(`research-map FATAL: no knowledge/ lane at ${KNOWLEDGE}`);
  process.exit(2);
}

const domains = fs
  .readdirSync(KNOWLEDGE, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((d) => !onlyDomain || d === onlyDomain)
  .sort();

if (domains.length === 0) {
  console.error(`research-map FATAL: no bundles under knowledge/${onlyDomain ? ` matching --domain ${onlyDomain}` : ''}.`);
  process.exit(2);
}

const bundles = [];
for (const d of domains) {
  const indexPath = path.join(KNOWLEDGE, d, 'index.json');
  const taxPath = path.join(KNOWLEDGE, d, 'taxonomy.json');
  if (!fs.existsSync(indexPath)) {
    console.error(`research-map FATAL: ${d} has no index.json. Run \`node scripts/build-index.mjs\` first -`);
    console.error('  matching a stale or absent index would report "no prior art" over a corpus that has it.');
    process.exit(2);
  }
  let index;
  let taxonomy = null;
  try {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch (e) {
    console.error(`research-map FATAL: ${d}/index.json does not parse (${e.message}).`);
    process.exit(2);
  }
  if (fs.existsSync(taxPath)) {
    try {
      taxonomy = JSON.parse(fs.readFileSync(taxPath, 'utf8'));
    } catch {
      /* placement guidance degrades; matching does not */
    }
  }
  bundles.push({ domain: d, index, taxonomy });
}

const subjectCount = bundles.reduce((n, b) => n + Object.keys(b.index.subjects ?? {}).length, 0);
if (subjectCount === 0) {
  console.error('research-map FATAL: zero subjects across every index read. THE READER IS BROKEN.');
  process.exit(2);
}

// ---------------------------------------------------------------- tokens
// Small stoplist: words that appear in so many slugs that a hit on them is noise.
const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'it', 'its',
  'of', 'on', 'or', 'per', 'that', 'the', 'this', 'to', 'with', 'not', 'no', 'new', 'use', 'using',
  'how', 'what', 'when', 'why', 'best', 'good', 'better',
]);

// Crude but stable singularisation, so `models` matches `model` and `policies` matches `policy`.
const stem = (w) => {
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  if (w.length > 4 && w.endsWith('ses')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
};

const tokens = (s) =>
  String(s)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map(stem);

const tokenSet = (s) => new Set(tokens(s));
const kebab = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ---------------------------------------------------------------- deep pass
// `use_when` is the frontmatter field written to be matched on. TECHNIQUE use_when is
// carried by index.json (build-index emits it), so the default pass scores it with no
// file reads - see the technique loop below. What `--deep` adds is the GOLDEN PATH's
// use_when, which the index does not carry, and a file-read fallback for any technique
// entry that predates the index emitting the field.
//
// History, so nobody re-introduces the gap: until 2026-08-23 this comment claimed the
// index did not carry use_when at all, and the default pass scored only slug overlap -
// a query phrased exactly as a technique's routing trigger ("one delivery minted two
// internal events") ranked its subject THIRD behind two slug-word coincidences. The
// 1,900 routing phrases the corpus carries were unreachable on the path every consult
// takes. Measured by the second full sweep (librarian run 2026-08-23-3).
const useWhenOf = new Map(); // file -> string
if (deep) {
  const readUseWhen = (file) => {
    try {
      const raw = fs.readFileSync(path.join(ROOT, file), 'utf8');
      const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
      if (!m) return '';
      const lines = m[1].split(/\r?\n/);
      const out = [];
      let capturing = false;
      for (const ln of lines) {
        if (/^use_when:/.test(ln)) {
          capturing = true;
          out.push(ln.replace(/^use_when:\s*/, ''));
          continue;
        }
        if (capturing) {
          if (/^\s+-\s+/.test(ln)) out.push(ln.replace(/^\s+-\s+/, ''));
          else if (/^\S/.test(ln)) capturing = false;
        }
      }
      return out.join(' ');
    } catch {
      return '';
    }
  };
  for (const b of bundles) {
    for (const [slug, s] of Object.entries(b.index.subjects ?? {})) {
      if (s.file) useWhenOf.set(s.file, readUseWhen(s.file));
      for (const t of s.techniques ?? []) {
        const tf = t.file ?? (s.file ? s.file.replace(/\/[^/]+\.md$/, `/techniques/${t.slug}.md`) : null);
        if (tf) useWhenOf.set(`${slug}::${t.slug}`, readUseWhen(tf));
      }
    }
  }
}

// ---------------------------------------------------------------- score
const W_SUBJECT_EXACT = 20;
const W_SUBJECT_TOKEN = 4;
const W_TECHNIQUE_EXACT = 14;
const W_TECHNIQUE_TOKEN = 3;
const W_USE_WHEN_TOKEN = 2;
const W_LAW_TOKEN = 1;

const scoreTerm = (term) => {
  const tt = tokenSet(term);
  const termKebab = kebab(term);
  const hits = [];

  for (const b of bundles) {
    for (const [slug, s] of Object.entries(b.index.subjects ?? {})) {
      let score = 0;
      const why = [];
      const techHits = [];

      const st = tokenSet(slug);
      const shared = [...tt].filter((w) => st.has(w));
      if (slug === termKebab) {
        score += W_SUBJECT_EXACT;
        why.push('subject slug is the term');
      } else if (shared.length) {
        score += W_SUBJECT_TOKEN * shared.length;
        why.push(`subject slug shares ${shared.join('+')}`);
      }

      for (const t of s.techniques ?? []) {
        const ttk = tokenSet(t.slug);
        const tshared = [...tt].filter((w) => ttk.has(w));
        if (t.slug === termKebab) {
          score += W_TECHNIQUE_EXACT;
          techHits.push(t.slug);
        } else if (tshared.length) {
          score += W_TECHNIQUE_TOKEN * tshared.length;
          techHits.push(t.slug);
        }
        // Technique use_when: from the index by default; the deep file-read map only
        // fills in for an entry the index does not carry it for.
        const uwIndexed = Array.isArray(t.use_when) ? t.use_when.join(' ') : '';
        const uw = uwIndexed || (deep ? useWhenOf.get(`${slug}::${t.slug}`) ?? '' : '');
        if (uw) {
          const ut = tokenSet(uw);
          const ushared = [...tt].filter((w) => ut.has(w));
          if (ushared.length) {
            score += W_USE_WHEN_TOKEN * ushared.length;
            if (!techHits.includes(t.slug)) techHits.push(t.slug);
            if (!why.some((w) => w.startsWith('use_when'))) why.push(`use_when shares ${ushared.join('+')}`);
          }
        }
      }
      if (deep && s.file) {
        const uw = useWhenOf.get(s.file) ?? '';
        const ut = tokenSet(uw);
        const ushared = [...tt].filter((w) => ut.has(w));
        if (ushared.length) {
          score += W_USE_WHEN_TOKEN * ushared.length;
          why.push(`use_when shares ${ushared.join('+')}`);
        }
      }

      if (score > 0) {
        const stacks = [...new Set((s.applications ?? []).map((a) => a.stack))].sort();
        const dates = (s.applications ?? []).map((a) => a.verified_on).filter(Boolean).sort();
        hits.push({
          domain: b.domain,
          subject: slug,
          category: s.category ?? null,
          subcategory: s.subcategory ?? null,
          file: s.file ?? null,
          status: s.status ?? null,
          techniques: (s.techniques ?? []).length,
          applications: (s.applications ?? []).length,
          stacks,
          oldest_verified_on: dates[0] ?? null,
          matched_techniques: techHits,
          score,
          why,
        });
      }
    }
  }

  // Laws are cross-cutting and matched separately: a term that lands on a law is a
  // signal the finding may belong in _laws.md rather than under any one subject.
  const lawHits = [];
  for (const b of bundles) {
    for (const [id, law] of Object.entries(b.index.laws ?? {})) {
      const lt = tokenSet(`${id} ${law.statement ?? ''}`);
      const shared = [...tt].filter((w) => lt.has(w));
      if (shared.length >= 2 || id === termKebab) {
        lawHits.push({ domain: b.domain, law: id, score: W_LAW_TOKEN * shared.length + (id === termKebab ? 10 : 0), shared });
      }
    }
  }

  // Where a NEW subject would go, if nothing above is the home. Category titles are
  // the only human-written placement vocabulary the taxonomy carries.
  const homes = [];
  for (const b of bundles) {
    for (const c of b.taxonomy?.categories ?? []) {
      const ct = tokenSet(`${c.id} ${c.title ?? ''}`);
      const shared = [...tt].filter((w) => ct.has(w));
      if (shared.length) homes.push({ domain: b.domain, category: c.id, title: c.title ?? c.id, score: shared.length });
      for (const sc of c.subcategories ?? []) {
        const sct = tokenSet(`${sc.id} ${sc.title ?? ''}`);
        const sshared = [...tt].filter((w) => sct.has(w));
        if (sshared.length) {
          homes.push({ domain: b.domain, category: c.id, subcategory: sc.id, title: sc.title ?? sc.id, score: sshared.length + 1 });
        }
      }
    }
  }

  hits.sort((a, b) => b.score - a.score || a.subject.localeCompare(b.subject));
  lawHits.sort((a, b) => b.score - a.score);
  homes.sort((a, b) => b.score - a.score);

  return { term, hits: hits.slice(0, topN), laws: lawHits.slice(0, 3), homes: homes.slice(0, 3), total_hits: hits.length };
};

const results = terms.map(scoreTerm);

// ---------------------------------------------------------------- report
// The corpus is bigger than any one branch: this repository carries bundles on
// feature branches that a checkout of another branch simply does not contain. The
// scan cannot see them, so it says which branch it read rather than letting an
// empty result be mistaken for an absent subject.
let branch = null;
try {
  branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {
  /* not a git checkout, or git unavailable: the warning is simply omitted */
}

const scanned = {
  branch,
  bundles: bundles.map((b) => b.domain),
  subjects: subjectCount,
  techniques: bundles.reduce(
    (n, b) => n + Object.values(b.index.subjects ?? {}).reduce((m, s) => m + (s.techniques ?? []).length, 0),
    0,
  ),
  deep,
};

if (asJson) {
  console.log(JSON.stringify({ scanned, results }, null, 1));
  process.exit(0);
}

console.log(
  `research-map: ${terms.length} term(s) against ${scanned.subjects} subjects / ${scanned.techniques} techniques ` +
    `in ${scanned.bundles.length} bundle(s)${deep ? ' [deep: use_when read]' : ''}`,
);
console.log(`  scanned: ${scanned.bundles.join(', ')}`);
if (scanned.branch) {
  console.log(
    `  branch:  ${scanned.branch} - THIS WORKING TREE ONLY. Bundles that exist on other branches are` +
      ' invisible here, and a "no prior art" result over a domain this branch does not carry is a fact' +
      ' about the checkout, not about the corpus. Check `git branch` before trusting an empty.',
  );
}

for (const r of results) {
  console.log(`\nterm: "${r.term}"`);
  if (r.hits.length === 0) {
    console.log('  PRIOR ART: none. The corpus has never heard of this - that is a finding, not a miss.');
  } else {
    console.log(`  PRIOR ART (${r.total_hits} subject(s) matched, top ${r.hits.length}):`);
    for (const h of r.hits) {
      const where = [h.category, h.subcategory].filter(Boolean).join('/');
      console.log(
        `    ${String(h.score).padStart(3)}  ${h.domain}  ${where}/${h.subject}` +
          `  [${h.techniques}t ${h.applications}a${h.stacks.length ? ` ${h.stacks.join(',')}` : ' NO-APP'}]` +
          `${h.oldest_verified_on ? ` oldest ${h.oldest_verified_on}` : ''}`,
      );
      console.log(`         file: ${h.file}`);
      if (h.matched_techniques.length) console.log(`         techniques: ${h.matched_techniques.join(', ')}`);
      if (h.why.length) console.log(`         why: ${h.why.join('; ')}`);
    }
  }
  if (r.laws.length) {
    console.log(`  LAWS: ${r.laws.map((l) => `${l.domain}#${l.law}`).join(', ')}`);
  }
  if (r.homes.length) {
    console.log(
      `  HOME IF NEW: ${r.homes
        .map((h) => `${h.domain}/${h.category}${h.subcategory ? `/${h.subcategory}` : ''}`)
        .join('  |  ')}`,
    );
  }
}

console.log('\nNOT answered here: whether any hit actually SAYS the same thing, or says something wrong.');
console.log('Slug overlap puts you in the neighbourhood. Read the file before writing a correction against it.');
