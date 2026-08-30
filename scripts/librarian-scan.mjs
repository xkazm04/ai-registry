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
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTaxonomy, walkSubjects, MAX_CHILD_DIRS } from './lib/taxonomy.mjs';

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
 * Attention points. Each weight is a claim about how much a defect costs a CONSUMING
 * agent, and they are here rather than in a prompt so they can be argued with.
 *
 *   use_when     the field an agent routes on. Without it a technique is unreachable
 *                except by a human reading prose, so it is weighted per missing file.
 *   applications a subject with no application has never been reconciled against real
 *                code; it is a standard nobody has tested.
 *   thin         the forge designs 4-6 techniques per subject. Below 4 usually means the
 *                subject was cut short, not that it is simple.
 *   expired      a claim past its clock is worse than a missing one: it asserts currency
 *                it does not have.
 *   gone         a consumer reports the cited anchors no longer exist. The strongest
 *                signal in the file, because somebody measured it against a real tree.
 */
const W = {
  missingUseWhen: 2,
  noApplications: 6,
  thinTechniques: 4,
  singleStack: 2,
  expiredApplication: 5,
  atRiskApplication: 1,
  neverSwept: 3,
  citationGone: 6,
  deviation: 4,
};

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
