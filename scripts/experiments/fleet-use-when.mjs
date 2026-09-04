#!/usr/bin/env node
// EXPERIMENT — a one-off systematic pass, not a gate: no caller in CI, CONTRIBUTING, any
// SKILL.md or any docs/ contract, and it calls a model, so it can never be a gate. Last used
// in librarian run 2026-08-21-2, the pass that cleared the bundle-wide use_when gap.
/**
 * fleet-use-when — propose the missing `use_when` lines, then apply the accepted ones.
 *
 * ## What is broken
 *
 * `use_when` is the field a consuming agent ROUTES on: it is how a technique gets found
 * at the moment it is needed. A technique without one is reachable only by a human
 * reading prose, which is why `librarian-scan` weights it per missing file. As of the
 * run that motivated this script, 633 of 1,516 techniques carried none — all of them in
 * one bundle, which makes this the corpus's largest single defect and exactly the shape
 * the librarian's own doctrine says to fix with ONE systematic pass rather than a
 * hundred dispatches.
 *
 * ## Why it is two commands and not one
 *
 * `--propose` writes a file; `--apply` reads it. Nothing reaches a document in the same
 * breath as the model that suggested it. The gap is where review happens, and making it
 * a file rather than a prompt means the same proposals can be re-reviewed, diffed, and
 * argued with after the model that produced them is gone.
 *
 * ## Why the validator is stricter than the bundle gate
 *
 * Two independent reasons, and the first is the dangerous one:
 *
 * 1. THE GATE DOES NOT LOOK HERE. `check-bundles.mjs` applies its purity denylist to a
 *    document's BODY only. A vendor name in `use_when` would ship green. So this
 *    validator carries its own denylist, and deliberately applies the UNION of every
 *    domain profile rather than the bundle's own — a routing hint has no business
 *    naming a vendor in any domain, and a union can only ever be too strict, which is
 *    a rejected proposal rather than a corrupted corpus.
 * 2. THE FRONTMATTER PARSER IS A SUBSET OF YAML. This corpus reads inline lists by
 *    splitting on `,` and stripping ` #...`. An entry containing either would not fail
 *    — it would silently become two entries, or lose its tail. Those are corpus
 *    corruption, so they are hard rejections, not warnings.
 *
 * Usage:
 *   node scripts/experiments/fleet-use-when.mjs --propose [--domain X] [--limit N] [--concurrency N]
 *   node scripts/experiments/fleet-use-when.mjs --review   [--in FILE]        # what a reviewer reads
 *   node scripts/experiments/fleet-use-when.mjs --apply    [--in FILE] [--only slug,slug]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkSubjects } from '../lib/taxonomy.mjs';
import { dispatch, extractJson } from '../lib/fleet.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const pick = (f, d) => { const i = argv.indexOf(f); return i === -1 ? d : argv[i + 1]; };

const MODE = has('--apply') ? 'apply' : has('--review') ? 'review' : 'propose';
const OUT = pick('--in', pick('--out', path.join(ROOT, 'fleet-use-when.proposals.json')));
const ONLY_DOMAIN = pick('--domain', null);
const LIMIT = Number(pick('--limit', 0)) || 0;
const CONCURRENCY = Number(pick('--concurrency', 10));
const MODELS = pick('--models', null)?.split(',').map((s) => s.trim()).filter(Boolean) || null;

// ------------------------------------------------------------------ frontmatter
// This script's own parser, matching the repo convention that each runnable carries
// one. It must read EXACTLY what `librarian-scan` reads, or this pass would disagree
// with the instrument that says the work is done.
const readFm = (file) => {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fm: {}, txt, fmBlock: null };
  const fm = {};
  let key = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const li = raw.match(/^\s*-\s+(.*)$/);
    if (li && key) { fm[key].push(li[1].replace(/\s+#.*$/, '').trim()); continue; }
    const kv = raw.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1];
    const v = kv[2].trim();
    if (v === '') fm[key] = [];
    else if (v === '[]') { fm[key] = []; key = null; }
    else if (v.startsWith('[') && v.endsWith(']')) {
      fm[key] = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean); key = null;
    } else { fm[key] = v.replace(/\s+#.*$/, '').trim(); key = null; }
  }
  return { fm, txt, fmBlock: m[0], fmInner: m[1] };
};

const hasUseWhen = (fm) => {
  const uw = Array.isArray(fm.use_when) ? fm.use_when.filter(Boolean) : fm.use_when ? [fm.use_when] : [];
  return uw.length > 0;
};

// ------------------------------------------------------------------ worklist
function worklist() {
  const items = [];
  const domains = fs.readdirSync(KNOWLEDGE, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .filter((d) => !ONLY_DOMAIN || d === ONLY_DOMAIN)
    .sort();

  for (const domain of domains) {
    const bundleDir = path.join(KNOWLEDGE, domain);
    // Never construct a subject path: the walk is the only thing that knows where a
    // subject actually sits at this bundle's current layout.
    const { found } = walkSubjects(bundleDir);
    for (const [slug, rel] of [...found].sort((a, b) => a[0].localeCompare(b[0]))) {
      const techDir = path.join(bundleDir, rel, 'techniques');
      if (!fs.existsSync(techDir)) continue;
      const gpPath = path.join(bundleDir, rel, `${slug}.md`);
      const gp = fs.existsSync(gpPath) ? readFm(gpPath) : { fm: {} };
      for (const f of fs.readdirSync(techDir).filter((x) => x.endsWith('.md') && !x.startsWith('.')).sort()) {
        const abs = path.join(techDir, f);
        const { fm } = readFm(abs);
        if (hasUseWhen(fm)) continue;
        items.push({
          domain,
          subject: slug,
          technique: f.replace(/\.md$/, ''),
          file: path.relative(ROOT, abs).replace(/\\/g, '/'),
          subjectTitle: gp.fm.subject || slug,
        });
      }
    }
  }
  return LIMIT ? items.slice(0, LIMIT) : items;
}

// ------------------------------------------------------------------ the contract
// The length target and the two permitted shapes are MEASURED from the 407 use_when
// entries this bundle already carries, not invented: p50 43 characters, p90 60, max 86.
// A first pass that merely said "under 90 characters" produced a p50 of 75 — every entry
// legal, and every entry visibly longer than the ones it would sit beside. The standard's
// judged bar is that the corpus reads as one author, so the house style is quoted at the
// model rather than described to it.
const SYSTEM = `You write the "use_when" routing line for ONE technique document in a
Reference Knowledge Bundle.

A use_when is a list of exactly 3 SHORT phrases naming the moments at which a consuming
agent should open this document. It is a routing key, not a summary.

Here are real examples from the same bundle. Match this length and voice:

  declared-then-proven:
    - designing what each check in a conformance run actually verifies
    - deciding whether presence is sufficient proof
    - auditing a checker that reads more than it executes

  band-design:
    - cutting a continuous signal into named rungs
    - rung labels keep flipping between runs
    - choosing band edges

  fixture-repo-testing:
    - testing a checker whose subject is a whole repository
    - proving a checker can actually fail
    - locking in a regression after a disputed finding

Note what those do: they are SHORT — most are 35 to 55 characters, and "choosing band
edges" is 19. Aim for that. Never exceed 85 characters; an entry that long is almost
always a sentence that should have been trimmed to its noun.

Two shapes are allowed, and mixing them is good:
- a moment of work: "deciding whether presence is sufficient proof"
- a SYMPTOM the reader is staring at: "rung labels keep flipping between runs"

Rules:
- Each entry names a situation, not a topic. "choosing band edges", never "band edges".
- The 3 entries must be DISTINCT. Three paraphrases of one moment is a failure.
- Derive them from what THIS document actually decides, so a reader can tell which
  document it routes to.
- NEVER name a product, vendor, framework, language, model or file path. This layer must
  transplant unchanged to an unrelated organisation.
- No commas inside an entry. No "#", "[" or "]" characters. Lowercase first letter. No
  trailing period. The comma rule is a hard parser constraint, so do not write a phrase
  that WANTS commas and then strip them — "queued shed or coalesced" reads as damaged.
  Pick a phrasing that never needed a list.

Respond with ONLY a JSON object, no prose and no markdown fence:
{"use_when": ["...", "...", "..."]}`;

const build = (item) => {
  const body = fs.readFileSync(path.join(ROOT, item.file), 'utf8');
  return {
    system: SYSTEM,
    user: `Subject: ${item.subject}\nTechnique: ${item.technique}\n\n--- document ---\n${body}`,
  };
};

// ------------------------------------------------------------------ validation
//
// The union of every domain profile in check-bundles.mjs, plus the generic core. A
// routing hint has no business naming a vendor in ANY domain, so the union is the right
// floor here even though the gate applies one profile at a time. Extend it when a leak
// slips past; never narrow it to make a proposal pass.
// Paths and extensions are case-insensitive: no ordinary English word looks like one.
//
// The NAME lists are deliberately case-SENSITIVE, which is the same choice
// `check-bundles.mjs` made and for the same reason its comment gives — a product name
// that is also a common English word false-positives everywhere. Measured on the first
// bulk run: an `/i` flag rejected "deciding whether to delete or quarantine an uncertain
// removal candidate" (the word `candidate`, matched against a product called CandiDate),
// "wiring one slice to react to another" (the VERB react), and "notifications that
// resolve state" (a video editor called Resolve). All three are clean routing keys, and
// all three were thrown away by a lowercase match on a proper noun.
//
// A use_when entry is lowercase prose by contract, so a capitalised product name inside
// one is unambiguous — which is exactly what makes case the right discriminator here.
const DENY = [
  [/\b(?:src|src-tauri|scripts|docs|app|lib|features|components|assets|projects|renders|footage)\//i, 'repo or asset path'],
  [/\.(?:tsx?|rs|mjs|cjs|jsx|py|sql|mp4|mov|prproj|aep|psd|wav)\b/i, 'file extension'],
  [/\b(?:React|Tauri|Rust|TypeScript|JavaScript|Zustand|Tailwind|Vite|Vitest|SQLite|PostgreSQL|Postgres|Prisma|Personas|UnifiedTable|ESLint|Zod|Next\.js|Firebase|Firestore|Neo4j|Supabase|Polar|Wellspring|Politicas|CandiDate)\b/, 'stack or product name'],
  [/\b(?:Greenhouse|Workday|SmartRecruiters|Ashby|Taleo|iCIMS|LinkedIn)\b/, 'vendor name'],
  [/\b(?:OpenAI|GPT-[0-9]|Claude|Anthropic|Gemini|Mistral|Whisper|ElevenLabs|Llama|DeepSeek)\b/, 'model vendor'],
  [/\b(?:Premiere|Resolve|After Effects|Photoshop|Blender|Midjourney|Runway|Gravitone)\b/, 'tool name'],
];

// The house style permits TWO shapes — a moment of work ("deciding whether presence is
// sufficient proof") and a symptom the reader is staring at ("rung labels keep flipping
// between runs"). An earlier version of this file warned on anything that did not open
// with a participle, which would have flagged the corpus's own best entries. There is no
// opener check any more; length and distinctness carry the style signal instead.
//
// The cap below is the bundle's observed maximum (86), rounded up slightly. Anything
// beyond it is a sentence that should have been a noun phrase.
const MAX_ENTRY = 88;
const LONG_ENTRY = 70; // above this bundle's p90 of 60 — worth a look, not a rejection

function validate(list, item) {
  const errs = [];
  const warns = [];
  if (!Array.isArray(list)) return { ok: false, errs: ['not an array'], warns };
  const entries = list.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);

  if (entries.length < 3 || entries.length > 5) errs.push(`${entries.length} entries (want 3-5)`);
  if (new Set(entries.map((e) => e.toLowerCase())).size !== entries.length) errs.push('duplicate entries');

  for (const e of entries) {
    // Hard: these corrupt the corpus through the frontmatter parser, silently.
    if (e.includes(',')) errs.push(`comma splits the inline list: "${e}"`);
    if (e.includes('#')) errs.push(`"#" truncates the entry: "${e}"`);
    if (/[[\]]/.test(e)) errs.push(`bracket breaks the inline list: "${e}"`);
    if (/[\r\n]/.test(e)) errs.push('newline in entry');
    // Hard: the transplant contract.
    for (const [re, what] of DENY) {
      const hit = e.match(re);
      if (hit) errs.push(`${what} "${hit[0]}" in "${e}"`);
    }
    // Hard: shape.
    if (e.length > MAX_ENTRY) errs.push(`${e.length} chars (max ${MAX_ENTRY}): "${e.slice(0, 50)}…"`);
    if (e.length < 12) errs.push(`too short: "${e}"`);
    if (/[.]$/.test(e)) errs.push(`trailing period: "${e}"`);
    if (/^[A-Z]/.test(e)) errs.push(`capitalised: "${e}"`);
    // Soft: style drift, reported so a reviewer can see it without it blocking.
    if (e.length > LONG_ENTRY) warns.push(`${e.length} chars — long for this bundle: "${e}"`);
  }
  return { ok: errs.length === 0, errs, warns, entries };
}

// ------------------------------------------------------------------ modes
const fmtInline = (entries) => `use_when: [${entries.join(', ')}]`;

/**
 * The checkpoint. A full pass over this bundle takes well over an hour against a free
 * endpoint that slows under sustained load, and the first attempt at it was killed at
 * 125/627 having written NOTHING — because results were assembled in memory and saved
 * once, at the end.
 *
 * So every completed item is appended here the moment it lands, and a re-run skips what
 * the file already holds. A pass is now interruptible on purpose: run it in chunks, stop
 * it when the machine is needed, resume tomorrow. The JSONL is the durable artifact; the
 * assembled `--out` JSON is just a view over it.
 */
const ckptPath = () => `${OUT}.jsonl`;

/**
 * Load the checkpoint, RE-DERIVING every verdict from the current validator.
 *
 * Generation and validation are separable, and conflating them is expensive: the first
 * bulk run rejected three perfectly good routing keys because the denylist was matching
 * case-insensitively, and if the verdict had been final at write time, fixing the
 * validator would have meant paying for 627 completions again. The checkpoint therefore
 * stores what the MODEL said; what the REPOSITORY thinks of it is recomputed on every
 * read, for free.
 */
const loadCheckpoint = () => {
  const p = ckptPath();
  const done = new Map();
  if (!fs.existsSync(p)) return done;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    let r;
    try { r = JSON.parse(line); } catch { continue; } // a torn last line is expected after a kill
    if (!r?.file) continue;
    if (Array.isArray(r.use_when) && r.use_when.length) {
      const v = validate(r.use_when, r);
      r = { ...r, status: v.ok ? 'proposed' : 'rejected', use_when: v.entries, errs: v.errs, warns: v.warns };
    }
    done.set(r.file, r);
  }
  return done;
};

/**
 * What counts as settled for resume. A `no-answer` is a transport failure, not a verdict,
 * so a later pass tries it again — that is how the 404s a free endpoint emits under load
 * get picked up without re-running the whole bundle. A `rejected` item DID get an answer;
 * re-generating it is a deliberate act, behind `--retry-rejected`.
 */
const settled = (r) => r && (r.status === 'proposed' || (r.status === 'rejected' && !has('--retry-rejected')));

async function propose() {
  const all = worklist();
  if (!all.length) { console.log('nothing to do — every technique already carries a use_when'); return; }

  const done = loadCheckpoint();
  const items = all.filter((i) => !settled(done.get(i.file)));
  console.log(`fleet-use-when: ${all.length} technique(s) with no use_when` +
    `${ONLY_DOMAIN ? ` in ${ONLY_DOMAIN}` : ''}` +
    `${done.size ? ` · ${done.size} already in checkpoint · ${items.length} to do` : ''}` +
    ` · concurrency ${CONCURRENCY}`);

  if (items.length) {
    const fd = fs.openSync(ckptPath(), 'a');
    const t0 = Date.now();
    try {
      await dispatch({
        items,
        build,
        models: MODELS,
        concurrency: CONCURRENCY,
        parse: (content) => {
          const j = extractJson(content);
          return Array.isArray(j?.use_when) ? j.use_when : null;
        },
        onDone: (n, total, r) => {
          let rec;
          if (!r || r.value == null) {
            rec = { ...r?.item, status: 'no-answer', err: r?.err };
          } else {
            const v = validate(r.value, r.item);
            rec = {
              ...r.item,
              status: v.ok ? 'proposed' : 'rejected',
              use_when: v.entries,
              errs: v.errs,
              warns: v.warns,
              model: r.model,
              attempts: r.attempts?.length ?? 1,
            };
          }
          fs.writeSync(fd, `${JSON.stringify(rec)}\n`);
          if (n % 25 === 0 || n === total) {
            const rate = n / ((Date.now() - t0) / 1000);
            console.log(`  ${n}/${total}  (${rate.toFixed(2)}/s, ~${((total - n) / rate / 60).toFixed(0)} min left)`);
          }
        },
      });
    } finally { fs.closeSync(fd); }
  }

  // Assemble the view from the durable artifact, never from this run's memory — so an
  // interrupted-and-resumed pass produces exactly what one uninterrupted run would.
  const merged = loadCheckpoint();
  const proposals = all.map((i) => merged.get(i.file)).filter(Boolean);
  const count = (s) => proposals.filter((p) => p.status === s).length;

  fs.writeFileSync(OUT, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    endpoint: process.env.FLEET_ENDPOINT || 'default',
    total: all.length,
    proposed: count('proposed'),
    rejected: count('rejected'),
    noAnswer: count('no-answer'),
    proposals,
  }, null, 2)}\n`);

  console.log(`\nproposed ${count('proposed')} · rejected ${count('rejected')} · no answer ${count('no-answer')}` +
    ` · ${proposals.length}/${all.length} of the bundle covered`);
  console.log(`wrote ${path.relative(ROOT, OUT).replace(/\\/g, '/')}`);
  if (proposals.length < all.length) console.log(`re-run to continue — the checkpoint resumes where this stopped`);
  console.log(`\nnext: node scripts/experiments/fleet-use-when.mjs --review`);
}

// ------------------------------------------------------------------ review signals
//
// The validator rejects what would CORRUPT the corpus. These heuristics find what would
// merely make it worse, and they exist so a reviewer's attention lands where a machine
// cannot help. None of them reject anything — they only sort.
const STOP = new Set(['the', 'a', 'an', 'to', 'of', 'for', 'and', 'or', 'in', 'on', 'at', 'is',
  'it', 'its', 'that', 'this', 'with', 'from', 'by', 'as', 'be', 'has', 'have', 'not', 'when',
  'whether', 'how', 'what', 'which', 'one', 'own', 'must', 'may', 'can', 'into', 'over', 'per']);
const bag = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
  .filter((w) => w.length > 2 && !STOP.has(w)));
const overlap = (a, b) => {
  const A = bag(a); const B = bag(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const w of A) if (B.has(w)) hit++;
  return hit / Math.min(A.size, B.size);
};

/** Quality signals for one proposal. Returns a list of short flags, worst first. */
function signals(p) {
  const out = [];
  const es = p.use_when || [];
  // Two entries that are the same moment in different words. The prompt forbids it and
  // it is the most common way a routing key set becomes useless.
  for (let i = 0; i < es.length; i++) {
    for (let j = i + 1; j < es.length; j++) {
      const o = overlap(es[i], es[j]);
      if (o >= 0.6) out.push(`redundant (${(o * 100) | 0}%): "${es[i]}" ~ "${es[j]}"`);
    }
  }
  // An entry that only restates the technique's own name carries no routing information
  // a filename did not already carry.
  const slugWords = bag(p.technique.replace(/-/g, ' '));
  for (const e of es) {
    const B = bag(e);
    if (!slugWords.size) break;
    let hit = 0;
    for (const w of slugWords) if (B.has(w)) hit++;
    if (hit === slugWords.size && B.size <= slugWords.size + 2) out.push(`restates the slug: "${e}"`);
  }
  return out.concat(p.warns || []);
}

function review() {
  const doc = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  const ok = doc.proposals.filter((p) => p.status === 'proposed');
  const bad = doc.proposals.filter((p) => p.status !== 'proposed');
  const brief = has('--flagged');

  const scored = ok.map((p) => ({ p, sig: signals(p) }));
  const flagged = scored.filter((s) => s.sig.length);

  console.log(`# fleet-use-when — ${ok.length} clean · ${doc.rejected} rejected · ${doc.noAnswer} no answer`);
  console.log(`# ${flagged.length} of ${ok.length} carry a quality signal worth a human eye`);
  console.log(`# ${ok.length * 3} routing phrases proposed\n`);

  let dom = null;
  for (const { p, sig } of (brief ? flagged : scored)) {
    const head = `${p.domain}/${p.subject}`;
    if (head !== dom) { dom = head; console.log(`\n## ${dom}`); }
    console.log(`\n${p.technique}${sig.length ? '  [!]' : ''}`);
    for (const e of p.use_when) console.log(`    - ${e}`);
    for (const s of sig) console.log(`      ! ${s}`);
  }
  if (bad.length) {
    console.log(`\n\n## not applied (${bad.length}) — these files stay untouched\n`);
    for (const p of bad) console.log(`${p.subject}/${p.technique}: ${(p.errs || [p.err]).slice(0, 3).join('; ')}`);
  }
}

function apply() {
  const doc = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  const only = pick('--only', null)?.split(',').map((s) => s.trim()).filter(Boolean) || null;
  let wrote = 0;
  let skipped = 0;
  for (const p of doc.proposals) {
    if (p.status !== 'proposed') { skipped++; continue; }
    if (only && !only.includes(p.technique) && !only.includes(p.subject)) { skipped++; continue; }
    const abs = path.join(ROOT, p.file);
    if (!fs.existsSync(abs)) { console.error(`  MISSING ${p.file}`); skipped++; continue; }
    const { fm, txt, fmBlock, fmInner } = readFm(abs);
    // Unreachable while the gate requires frontmatter on every concept document — but a
    // crash here would abort the loop with some files written and some not, which is the
    // one state that is worse than doing nothing.
    if (!fmBlock) { console.error(`  SKIP (no frontmatter) ${p.file}`); skipped++; continue; }
    // Re-check on the CURRENT file: the corpus may have moved since the proposal was
    // written, and a run that overwrites someone else's use_when is the one unforgivable
    // outcome here.
    if (hasUseWhen(fm)) { console.error(`  SKIP (now has one) ${p.file}`); skipped++; continue; }
    const nl = txt.includes('\r\n') ? '\r\n' : '\n';
    const line = fmtInline(p.use_when);
    const rebuilt = `---${nl}${fmInner.split(/\r?\n/).join(nl)}${nl}${line}${nl}---`;
    fs.writeFileSync(abs, txt.replace(fmBlock, rebuilt));
    wrote++;
  }
  console.log(`applied ${wrote} · skipped ${skipped}`);
  console.log('now run: node scripts/check-bundles.mjs && node scripts/build-index.mjs && node scripts/build-catalog.mjs');
}

if (MODE === 'propose') await propose();
else if (MODE === 'review') review();
else apply();
