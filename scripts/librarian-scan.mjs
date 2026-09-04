#!/usr/bin/env node
/**
 * librarian-scan — the deterministic half of /librarian.
 *
 * ## Why this is a script and not a prompt
 *
 * The registry's own most expensive lesson was a content gap reported at 0/267 over a
 * corpus that was actually at 267/267, because the counter read a different shape than
 * the parser emitted. A maintenance loop that asks a model to count things reproduces
 * that failure every run, silently, and its output is a confident number nobody can
 * check.
 *
 * So everything countable is counted HERE, once, by something that can be read and
 * proved. `/librarian` spends its judgment on what the numbers mean and what to dispatch
 * - never on producing them.
 *
 * ## What it scores, and what it refuses to score
 *
 * Structure, consultability, maturity and decay are all measurable from the corpus, and
 * they are measured. DEMAND is not: it lives in the signals/ lane, and until an
 * installation reports, demand is UNKNOWN. This script never scores unknown demand as
 * zero demand - it reports `demandKnown: false` and leaves the ranking honest about what
 * it is ranking on, because "nobody consults this" and "nobody has told us" are opposite
 * conclusions that a zero would merge.
 *
 * Demand it does report is a RANGE, not a figure. Two contributors can be one fleet on
 * two machines, and nothing in the schema can tell you which - so deviations are scored
 * at the floor and the ceiling is printed beside it. See the aggregation note below.
 *
 * Usage:
 *   node scripts/librarian-scan.mjs               # the human table
 *   node scripts/librarian-scan.mjs --json        # what the skill reads
 *   node scripts/librarian-scan.mjs --top 20      # the worklist head
 *   node scripts/librarian-scan.mjs --domain software-engineering
 *   node scripts/librarian-scan.mjs --weights       # the floor table, as markdown
 *   node scripts/librarian-scan.mjs --stamp-weights # write it into librarian/standard.md
 *   node scripts/librarian-scan.mjs --check-weights # 1 when the stamped copy has drifted
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTaxonomy, walkSubjects, MAX_CHILD_DIRS } from './lib/taxonomy.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
const SIGNALS = path.join(ROOT, 'signals');
const VAULT = path.join(ROOT, 'librarian');

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const pick = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i === -1 ? dflt : argv[i + 1];
};
const topN = Number(pick('--top', 15));
const onlyDomain = pick('--domain', null);

if (!fs.existsSync(KNOWLEDGE)) {
  console.error('librarian-scan FATAL: no knowledge/ lane.');
  process.exit(2);
}

const today = new Date().toISOString().slice(0, 10);
const DAY = 86400000;
const daysSince = (iso) => Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / DAY);

/** The frontmatter subset this corpus uses. Scalars plus `- ` and `[a, b]` lists. */
const frontmatter = (file) => {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fm: {}, bodyBytes: Buffer.byteLength(txt) };
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
      fm[key] = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
      key = null;
    } else { fm[key] = v.replace(/\s+#.*$/, '').trim(); key = null; }
  }
  return { fm, bodyBytes: Buffer.byteLength(txt.slice(m[0].length)) };
};

const mdFiles = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('.')).sort() : [];

// ---------------------------------------------------------------- signals (demand)
const contributors = [];
if (fs.existsSync(SIGNALS)) {
  for (const f of fs.readdirSync(SIGNALS).filter((x) => x.endsWith('.json')).sort()) {
    try { contributors.push(JSON.parse(fs.readFileSync(path.join(SIGNALS, f), 'utf8'))); } catch { /* the gate owns this */ }
  }
}
/*
 * Aggregating across contributors: events sum, states do not.
 *
 * `consults` is an EVENT COUNT over a window. Two installations that each read a
 * subject four times produced eight reads, and summing them is right.
 *
 * `deviations` and a citation's `gone` are STATES OF A TREE - "how many places this
 * repo falls short", "how many of these anchors no longer resolve". Summing a state
 * across two installations that hold the SAME checkout counts one shortfall twice.
 * On 2026-08-30 that was not hypothetical: two contributors reported a byte-identical
 * `llm-observability` block fourteen hours apart, and 17 of the 31 software-engineering
 * subjects both named carried identical deviation counts. Summed, the corpus read 550
 * deviations; deduplicated it read 370. The entire top of the worklist was that 1.49x,
 * and a sweep that dispatched against it would have spent workers on a ranking artifact.
 *
 * Nothing in the signals schema can prove two contributors are independent - `contributor`
 * is a self-declared id, and one fleet checked out on two machines legitimately writes two
 * files. So this does not guess. It scores the FLOOR (max across contributors: at least
 * this many distinct places fall short) and reports the ceiling (the sum, if every
 * contributor is independent) beside it, the same way check-currency reports a drift
 * count as a lower bound over the witnessed slice. A floor cannot manufacture a worklist;
 * a sum can, and did.
 */
const demandOf = {}; // `${domain}/${slug}` -> { consults, deviations, deviationsSummed, gone, goneSummed, contributors }
const witnessed = new Set();
const bucket = (key) => (demandOf[key] ??= {
  consults: 0, deviations: 0, deviationsSummed: 0, gone: 0, goneSummed: 0, contributors: 0,
});
const namedBy = {}; // `${domain}/${slug}` -> Set(contributor id)
const blockSig = {}; // bundle -> [{ contributor, sig }] for the duplicate-report diagnostic

for (const c of contributors) {
  const who = c.contributor ?? '(unnamed)';
  for (const [bundle, obs] of Object.entries(c.bundles ?? {})) {
    witnessed.add(bundle);
    (blockSig[bundle] ??= []).push({
      contributor: who,
      sig: JSON.stringify([obs.consults ?? {}, obs.deviations ?? {}, obs.citations ?? {}]),
    });
    for (const [slug, n] of Object.entries(obs.consults ?? {})) {
      bucket(`${bundle}/${slug}`).consults += n; // event: sums
      (namedBy[`${bundle}/${slug}`] ??= new Set()).add(who);
    }
    for (const [slug, n] of Object.entries(obs.deviations ?? {})) {
      const d = bucket(`${bundle}/${slug}`);
      d.deviations = Math.max(d.deviations, n); // state: floor across contributors
      d.deviationsSummed += n;
      (namedBy[`${bundle}/${slug}`] ??= new Set()).add(who);
    }
    // A subject's `gone` is the max over its own documents summed within one contributor,
    // then the floor across contributors - the same event/state split one level down.
    const goneWithin = {};
    for (const [id, v] of Object.entries(obs.citations ?? {})) {
      const slug = id.split('/')[0];
      goneWithin[slug] = (goneWithin[slug] ?? 0) + (v.gone ?? 0);
      (namedBy[`${bundle}/${slug}`] ??= new Set()).add(who);
    }
    for (const [slug, n] of Object.entries(goneWithin)) {
      const d = bucket(`${bundle}/${slug}`);
      d.gone = Math.max(d.gone, n);
      d.goneSummed += n;
    }
  }
}
for (const [key, who] of Object.entries(namedBy)) bucket(key).contributors = who.size;

// Two contributors whose whole bundle block is identical are one fleet counted twice, not
// two installations that agree. Loud, because it is the shape that inflated the worklist.
const duplicateBlocks = [];
for (const [bundle, rows] of Object.entries(blockSig)) {
  const seen = new Map();
  for (const r of rows) {
    if (seen.has(r.sig)) duplicateBlocks.push({ bundle, contributors: [seen.get(r.sig), r.contributor] });
    else seen.set(r.sig, r.contributor);
  }
}

// ---------------------------------------------------------------- vault (coverage memory)
const sweptOf = {}; // `${domain}/${slug}` -> { last_swept, dry_streak }
if (fs.existsSync(path.join(VAULT, 'subjects'))) {
  for (const d of fs.readdirSync(path.join(VAULT, 'subjects'), { withFileTypes: true }).filter((e) => e.isDirectory())) {
    for (const f of mdFiles(path.join(VAULT, 'subjects', d.name))) {
      const { fm } = frontmatter(path.join(VAULT, 'subjects', d.name, f));
      // Accept either spelling. The vault's documented design is that a subject note
      // is created the first time a subject is TOUCHED and that "no note" is what
      // means never-swept (librarian/index.md); its notes accordingly carry
      // `last_touched`, while domain notes carry `last_swept`. This reader asked for
      // `last_swept` only, so no subject note ever satisfied it — the never-swept
      // clause scored every subject in the registry forever, and its 3 points times
      // the whole corpus dominated the ranking it was meant to inform. Found by the
      // 2026-08-22 harvest wave: 20 fresh subject notes moved the count by zero.
      // Reading a field no writer emits is the same failure family as the
      // use_when counter that reported 0/267 over a corpus at 267/267.
      sweptOf[`${d.name}/${f.replace(/\.md$/, '')}`] = {
        last_swept: fm.last_swept ?? fm.last_touched ?? null,
        dry_streak: Number(fm.dry_streak ?? 0) || 0,
      };
    }
  }
}

/**
 * Attention points — ONE declaration, carrying both the number and the argument for it.
 *
 * Each weight is a claim about how much a defect costs a CONSUMING agent, so the number
 * is worthless without the sentence beside it. They used to live twice: as bare numbers
 * here and as a hand-written table in `librarian/standard.md`, under a disclaimer saying
 * they could not disagree. Nothing enforced that, and the disclaimer is exactly the kind
 * of sentence that makes a reviewer stop checking. So the table over there is now STAMPED
 * from this array (`--weights` renders it, `--stamp-weights` writes it, `--check-weights`
 * fails when the two have parted), and this is the only place a weight is decided.
 *
 * `clause` and `why` are the standard's prose, not comments: they ship into the document.
 * Edit them here.
 */
const WEIGHTS = [
  {
    key: 'missingUseWhen',
    points: 2,
    per: 'each',
    clause: 'A technique carries no `use_when`',
    why: 'It is the field a consuming agent routes on. Without it a technique is reachable only by a human reading prose - the difference between a bundle that can be consulted and one that can only be read.',
  },
  {
    key: 'noApplications',
    points: 6,
    clause: 'The subject has no application',
    why: 'It has never been reconciled against real code. It is a standard nobody has tested against anything.',
  },
  {
    key: 'thinTechniques',
    points: 4,
    clause: 'Fewer than 4 techniques',
    why: 'The forge designs 4-6 per subject. Below that usually means the subject was cut short, not that it is simple.',
  },
  {
    key: 'singleStack',
    points: 2,
    clause: 'One stack across all applications',
    why: 'The transplant claim is untested. Two stacks is where "this is general" stops being an assertion.',
  },
  {
    key: 'expiredApplication',
    points: 5,
    per: 'each',
    clause: 'An application is past its clock',
    why: 'Worse than a missing claim: it asserts a currency it does not have.',
  },
  {
    key: 'atRiskApplication',
    points: 1,
    per: 'each',
    clause: 'An application is within 30 days of its clock',
    why: 'Cheap to catch before it expires.',
  },
  {
    key: 'neverSwept',
    points: 3,
    clause: 'Never swept by the librarian',
    why: 'Not a defect in the subject - a gap in what we know about it.',
  },
  {
    key: 'citationGone',
    points: 6,
    per: 'each',
    clause: 'A consumer reports citations `gone`',
    why: 'The strongest signal available, because somebody measured it against a real tree.',
  },
  {
    key: 'deviation',
    points: 4,
    per: 'each',
    clause: 'A consumer records a deviation',
    why: 'Demand pointing directly at a subject.',
  },
];

/** The numbers alone, for the scorer. Derived — never edited on its own. */
const W = Object.fromEntries(WEIGHTS.map((w) => [w.key, w.points]));

// ------------------------------------------------------------------ the stamped table
//
// The standard carries this table so the bar can be argued with in prose. It is a COPY,
// and a copy that nothing compares is a copy that drifts. These three flags close that:
// render it, write it, or prove the written one still matches.

const STANDARD = path.join(VAULT, 'standard.md');
const STAMP_OPEN = '<!-- weights: stamped by scripts/librarian-scan.mjs --weights; edit the script, then re-stamp -->';
const STAMP_CLOSE = '<!-- /weights -->';

/** The weights as the markdown table the standard carries. */
function renderWeights() {
  const rows = WEIGHTS.map((w) => `| ${w.clause} | ${w.why} | ${w.points}${w.per ? ` ${w.per}` : ''} |`);
  return ['| Clause | Why | Points |', '| --- | --- | --- |', ...rows].join('\n');
}

/** The stamped block's body, or null when the markers are absent. */
function stampedTable(text) {
  const a = text.indexOf(STAMP_OPEN);
  if (a === -1) return null;
  const b = text.indexOf(STAMP_CLOSE, a);
  if (b === -1) return null;
  return text.slice(a + STAMP_OPEN.length, b).trim();
}

if (argv.includes('--weights')) {
  console.log(renderWeights());
  process.exit(EXIT.OK);
}

if (argv.includes('--stamp-weights') || argv.includes('--check-weights')) {
  const checking = argv.includes('--check-weights');
  if (!fs.existsSync(STANDARD)) {
    console.error(`librarian-scan FATAL: ${path.relative(ROOT, STANDARD)} does not exist. Nothing to ${checking ? 'check' : 'stamp'}.`);
    process.exit(EXIT.FATAL);
  }
  const text = fs.readFileSync(STANDARD, 'utf8');
  const found = stampedTable(text);
  if (found === null) {
    // Not a mismatch — the instrument could not run. Reporting nothing is not finding
    // nothing, so this is FATAL rather than a clean pass over an unmarked file.
    console.error('librarian-scan FATAL: librarian/standard.md carries no stamped weights block.');
    console.error(`  expected the markers:\n    ${STAMP_OPEN}\n    ${STAMP_CLOSE}`);
    process.exit(EXIT.FATAL);
  }
  const want = renderWeights();
  if (checking) {
    if (found === want) {
      console.log(`weights: librarian/standard.md matches this script (${WEIGHTS.length} clauses).`);
      process.exit(EXIT.OK);
    }
    console.error('librarian-scan: the standard\'s weights table DISAGREES with the scan that runs.');
    console.error('  librarian/standard.md is stamped and has been edited by hand, or a weight moved here');
    console.error('  and was not re-stamped. The script is the source; fix it there, then run:');
    console.error('    node scripts/librarian-scan.mjs --stamp-weights');
    const a = found.split('\n');
    const b = want.split('\n');
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        console.error(`\n  line ${i + 1} of the block differs:`);
        console.error(`    standard.md: ${a[i] ?? '(missing)'}`);
        console.error(`    this script: ${b[i] ?? '(missing)'}`);
      }
    }
    process.exit(EXIT.VIOLATIONS);
  }
  if (found === want) {
    console.log('weights: already current — librarian/standard.md unchanged.');
    process.exit(EXIT.OK);
  }
  const a = text.indexOf(STAMP_OPEN);
  const b = text.indexOf(STAMP_CLOSE, a);
  fs.writeFileSync(STANDARD, `${text.slice(0, a + STAMP_OPEN.length)}\n${want}\n${text.slice(b)}`, 'utf8');
  console.log(`weights: stamped ${WEIGHTS.length} clauses into librarian/standard.md.`);
  process.exit(EXIT.OK);
}

const domains = fs
  .readdirSync(KNOWLEDGE, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((d) => !onlyDomain || d === onlyDomain)
  .sort();

if (domains.length === 0) {
  console.error(`librarian-scan FATAL: no bundles${onlyDomain ? ` matching "${onlyDomain}"` : ''}.`);
  process.exit(2);
}

const subjects = [];
const domainRows = [];

for (const domain of domains) {
  const base = path.join(KNOWLEDGE, domain);
  const { taxonomy, errors } = loadTaxonomy(base, domain);
  const { found, groupDirs } = walkSubjects(base);

  const capBreaches = [...groupDirs.entries()]
    .filter(([, n]) => n > MAX_CHILD_DIRS)
    .map(([rel, n]) => ({ dir: rel || '.', children: n }));

  for (const [slug, at] of found) {
    const dir = path.join(base, at);
    const { fm: gp, bodyBytes: gpBytes } = frontmatter(path.join(dir, `${slug}.md`));

    let techBytes = 0;
    let missingUseWhen = 0;
    const techniques = mdFiles(path.join(dir, 'techniques'));
    for (const t of techniques) {
      const { fm, bodyBytes } = frontmatter(path.join(dir, 'techniques', t));
      techBytes += bodyBytes;
      const uw = Array.isArray(fm.use_when) ? fm.use_when.filter(Boolean) : fm.use_when ? [fm.use_when] : [];
      if (uw.length === 0) missingUseWhen++;
    }

    const apps = mdFiles(path.join(dir, 'applications'));
    const stacks = new Set();
    let expired = 0;
    let atRisk = 0;
    let oldest = null;
    let versionWitness = 0;
    for (const a of apps) {
      const { fm } = frontmatter(path.join(dir, 'applications', a));
      if (fm.stack) stacks.add(fm.stack);
      if (fm.verified_against) versionWitness++;
      if (fm.verified_on && (!oldest || fm.verified_on < oldest)) oldest = fm.verified_on;
      // The clock policy lives in check-currency.mjs; this only needs expired-or-not, and
      // an explicit refresh_by is the only clock knowable without duplicating that table.
      if (fm.refresh_by) {
        if (fm.refresh_by < today) expired++;
        else if (daysSince(fm.refresh_by) > -30) atRisk++;
      }
    }

    const key = `${domain}/${slug}`;
    const demand = demandOf[key] ?? null;
    const swept = sweptOf[key] ?? null;

    let points = 0;
    const reasons = [];
    const add = (n, why) => { if (n > 0) { points += n; reasons.push(why); } };

    add(missingUseWhen * W.missingUseWhen, `${missingUseWhen} technique(s) with no use_when`);
    if (apps.length === 0) add(W.noApplications, 'no application — never reconciled against real code');
    if (techniques.length < 4) add(W.thinTechniques, `${techniques.length} techniques (design floor is 4)`);
    if (apps.length > 0 && stacks.size <= 1) add(W.singleStack, `single stack (${[...stacks][0] ?? '—'})`);
    add(expired * W.expiredApplication, `${expired} expired application(s)`);
    add(atRisk * W.atRiskApplication, `${atRisk} application(s) near their clock`);
    if (!swept?.last_swept) add(W.neverSwept, 'never swept by the librarian');
    // Where contributors disagree the scored figure is the floor, and the reason says so
    // rather than printing one number that reads as settled.
    const spread = (lo, hi) => (hi > lo ? `${lo}–${hi}` : `${lo}`);
    if (demand?.gone) {
      add(demand.gone * W.citationGone,
        `${spread(demand.gone, demand.goneSummed)} citation(s) reported gone by a consumer`);
    }
    if (demand?.deviations) {
      add(demand.deviations * W.deviation,
        `${spread(demand.deviations, demand.deviationsSummed)} consumer deviation(s)`);
    }

    subjects.push({
      id: key,
      domain,
      slug,
      at,
      category: gp.category ?? null,
      status: gp.status ?? 'unknown',
      techniques: techniques.length,
      applications: apps.length,
      stacks: [...stacks].sort(),
      missingUseWhen,
      bytes: gpBytes + techBytes,
      oldestVerifiedOn: oldest,
      ageDays: oldest ? daysSince(oldest) : null,
      expired,
      atRisk,
      versionWitness,
      // Never a zero. The absence of a signal and a signal of absence are different facts.
      demandKnown: witnessed.has(domain),
      demand,
      lastSwept: swept?.last_swept ?? null,
      dryStreak: swept?.dry_streak ?? 0,
      points,
      reasons,
    });
  }

  const mine = subjects.filter((s) => s.domain === domain);
  const techTotal = mine.reduce((n, s) => n + s.techniques, 0);
  domainRows.push({
    domain,
    layout: taxonomy?.layout ?? 'unknown',
    taxonomyErrors: errors.length,
    capBreaches,
    subjects: mine.length,
    techniques: techTotal,
    applications: mine.reduce((n, s) => n + s.applications, 0),
    useWhenWritten: techTotal - mine.reduce((n, s) => n + s.missingUseWhen, 0),
    useWhenTotal: techTotal,
    statuses: mine.reduce((acc, s) => { acc[s.status] = (acc[s.status] ?? 0) + 1; return acc; }, {}),
    expired: mine.reduce((n, s) => n + s.expired, 0),
    versionWitness: mine.reduce((n, s) => n + s.versionWitness, 0),
    demandKnown: witnessed.has(domain),
    neverSwept: mine.filter((s) => !s.lastSwept).length,
    points: mine.reduce((n, s) => n + s.points, 0),
  });
}

if (subjects.length === 0) {
  console.error('librarian-scan FATAL: zero subjects found. THE WALKER IS BROKEN.');
  process.exit(2);
}

const worklist = [...subjects].sort((a, b) => b.points - a.points || a.id.localeCompare(b.id));

if (asJson) {
  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    today,
    weights: W,
    demandKnownForAnyBundle: witnessed.size > 0,
    contributors: contributors.length,
    demandAggregation: {
      rule: 'consults sum (events); deviations and gone take the max across contributors (states)',
      deviationsFloor: subjects.reduce((n, s) => n + (s.demand?.deviations ?? 0), 0),
      deviationsCeiling: subjects.reduce((n, s) => n + (s.demand?.deviationsSummed ?? 0), 0),
      subjectsNamedByMoreThanOne: subjects.filter((s) => (s.demand?.contributors ?? 0) > 1).length,
      duplicateBlocks,
    },
    domains: domainRows,
    subjects,
    worklist: worklist.map((s) => ({ id: s.id, points: s.points, reasons: s.reasons })),
  }, null, 2));
} else {
  console.log(`librarian scan — ${today}\n`);
  const w = Math.max(...domainRows.map((d) => d.domain.length));
  console.log(`  ${'bundle'.padEnd(w)}  ${'subj'.padStart(4)} ${'tech'.padStart(4)} ${'apps'.padStart(4)}  ${'use_when'.padStart(9)}  ${'expired'.padStart(7)} ${'unswept'.padStart(7)} ${'points'.padStart(6)}  layout  demand`);
  for (const d of domainRows) {
    const uw = `${d.useWhenWritten}/${d.useWhenTotal}`;
    console.log(
      `  ${d.domain.padEnd(w)}  ${String(d.subjects).padStart(4)} ${String(d.techniques).padStart(4)} ${String(d.applications).padStart(4)}  ${uw.padStart(9)}  ${String(d.expired).padStart(7)} ${String(d.neverSwept).padStart(7)} ${String(d.points).padStart(6)}  ${d.layout.padEnd(6)}  ${d.demandKnown ? 'reported' : 'unknown'}`,
    );
    for (const c of d.capBreaches) console.log(`      CAP: ${c.dir} holds ${c.children} child directories`);
    for (const [st, n] of Object.entries(d.statuses)) {
      if (st !== 'forged') console.log(`      status ${st}: ${n}`);
    }
  }

  const totalTech = domainRows.reduce((n, d) => n + d.useWhenTotal, 0);
  const totalUw = domainRows.reduce((n, d) => n + d.useWhenWritten, 0);
  console.log(`\n  ${subjects.length} subjects · use_when ${totalUw}/${totalTech} · ${contributors.length} reporting installation(s)`);

  if (witnessed.size === 0) {
    console.log('\n  DEMAND IS UNKNOWN for every bundle — no installation reports (docs/signals-lane.md).');
    console.log('  The ranking below is structure and decay only. It cannot tell a subject nobody');
    console.log('  needs from one nobody has mentioned, and it does not pretend to.');
  }

  const floor = subjects.reduce((n, s) => n + (s.demand?.deviations ?? 0), 0);
  const ceiling = subjects.reduce((n, s) => n + (s.demand?.deviationsSummed ?? 0), 0);
  if (ceiling > floor) {
    const shared = subjects.filter((s) => (s.demand?.contributors ?? 0) > 1).length;
    console.log(`\n  DEMAND IS A RANGE — ${floor} deviation(s) certain, up to ${ceiling} if every contributor is independent`);
    console.log(`  (${(ceiling / floor).toFixed(2)}x). ${shared} subject(s) are named by more than one contributor; a state`);
    console.log('  reported by two installations holding the same checkout is one shortfall, not two.');
    console.log('  Ranking below uses the floor. See the aggregation note in this script.');
  }
  for (const d of duplicateBlocks) {
    console.log(`\n  DUPLICATE REPORT: ${d.contributors.join(' and ')} filed an IDENTICAL "${d.bundle}" block.`);
    console.log('  That is one fleet counted twice, not two installations that agree. Every subject in');
    console.log(`  "${d.bundle}" would have been scored at exactly double its real demand under a sum.`);
  }

  console.log(`\nWORKLIST — top ${Math.min(topN, worklist.length)} by attention points\n`);
  for (const s of worklist.slice(0, topN)) {
    console.log(`  ${String(s.points).padStart(3)}  ${s.id}`);
    for (const r of s.reasons) console.log(`       · ${r}`);
  }
}
