#!/usr/bin/env node
/**
 * agent-cost-band — measure the noise band of agent process cost, then derive how
 * many replays a structural comparison needs before its ratio means anything.
 *
 * ## Why this is a script and not a judgment
 *
 * `module-design/change-class-is-the-workload` says a structure's extensibility is
 * scoreable: replay a class of change against each candidate structure with an agent
 * as the executor, and meter what the execution costs. Its first discipline is the one
 * that gets skipped, because skipping it still produces a number — **derive the arm
 * count from a band you measured**, never from the budget you happened to have.
 *
 * Both published measurements in that lane run exactly one trajectory per cell, so
 * neither carries a within-cell variance estimate, and a 21% ratio read off one run per
 * arm is indistinguishable from noise. This script computes the band from recorded
 * agent sessions and prints the arm count each candidate effect size would need. It
 * decides nothing: it tells you whether the comparison you are about to run can
 * resolve the effect you expect.
 *
 * ## What it reads
 *
 * A directory of agent session transcripts in JSON-lines form, grouped one
 * subdirectory per workspace. Per line it needs only a usage block carrying
 * `output_tokens`; everything else is ignored. Output tokens are the metric because
 * they are the stochastic half of a trajectory — input is dominated by whatever the
 * harness chose to resend, which is a property of the harness and not of the work.
 *
 * ## What it refuses
 *
 * It will not report a band from a group it cannot estimate one for (fewer than
 * `--min-sessions` sessions), and it will not report a between-group share without
 * also reporting what that share becomes when the largest group is dropped. A
 * between-group difference computed over groups doing *different work* measures the
 * work assignment, not the substrate — so that figure is printed as a diagnostic with
 * its confound named, never as a substrate effect.
 *
 * Usage:
 *   node scripts/agent-cost-band.mjs <transcript-root> [--min-sessions 8]
 *                                    [--min-turns 3] [--effect 1.21,2.7] [--json]
 *   node scripts/agent-cost-band.mjs <transcript-root> --validate
 *
 * `--validate` checks the arm-count arithmetic against the corpus it came from: it
 * replays the one-per-arm protocol over every workspace pair and scores it against the
 * ordering the full samples agree on, bucketed by the size of the true effect. A
 * formula nobody checked is an opinion with a square root in it.
 *
 * Exit codes: 0 ok · 2 the instrument could not read its input · 3 not enough data
 * to estimate a band (which is an answer: the comparison is not yet runnable).
 */

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? dflt : argv[i + 1];
};
// Positional root = the first bare argument that is not the value of a --flag.
const VALUED = new Set(['min-sessions', 'min-turns', 'effect']);
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a.startsWith('--')) {
    if (VALUED.has(a.slice(2))) i += 1;
    continue;
  }
  positional.push(a);
}
const root = positional[0];
const MIN_SESSIONS = Number(flag('min-sessions', 8));
const MIN_TURNS = Number(flag('min-turns', 3));
const EFFECTS = String(flag('effect', '1.21,1.36,1.63,2.7'))
  .split(',').map(Number).filter((n) => n > 1);
const asJson = argv.includes('--json');

if (!root) {
  console.error('agent-cost-band: need a transcript root directory');
  console.error('usage: node scripts/agent-cost-band.mjs <transcript-root> [--min-sessions N] [--effect 1.2,2.0] [--json]');
  process.exit(2);
}

// Assert the instrument before it reports anything: the root must exist and hold
// subdirectories with .jsonl files. A silent empty read here would print a confident
// band of zero.
let groupDirs;
try {
  groupDirs = readdirSync(root).filter((d) => {
    try { return statSync(join(root, d)).isDirectory(); } catch { return false; }
  });
} catch (err) {
  console.error(`agent-cost-band: cannot read ${root}: ${err.message}`);
  process.exit(2);
}
if (groupDirs.length === 0) {
  console.error(`agent-cost-band: ${root} holds no workspace subdirectories`);
  process.exit(2);
}

const sessions = [];
let filesSeen = 0;
let skippedShort = 0;
for (const dir of groupDirs) {
  let files;
  try { files = readdirSync(join(root, dir)).filter((f) => f.endsWith('.jsonl')); } catch { continue; }
  for (const file of files) {
    const full = join(root, dir, file);
    filesSeen += 1;
    let text;
    try { text = readFileSync(full, 'utf8'); } catch { continue; }
    let out = 0;
    let turns = 0;
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      const usage = obj?.message?.usage ?? obj?.usage;
      if (!usage) continue;
      turns += 1;
      out += usage.output_tokens || 0;
    }
    // A transcript with almost no model turns is an aborted session, not a run. It
    // would drag the band toward zero and inflate every ratio computed from it.
    if (turns < MIN_TURNS || out <= 0) { skippedShort += 1; continue; }
    sessions.push({ group: dir, out, turns });
  }
}

if (filesSeen === 0) {
  console.error(`agent-cost-band: no .jsonl transcripts under ${root}`);
  process.exit(2);
}

const byGroup = new Map();
for (const s of sessions) {
  if (!byGroup.has(s.group)) byGroup.set(s.group, []);
  byGroup.get(s.group).push(s.out);
}
const groups = [...byGroup.entries()]
  .filter(([, v]) => v.length >= MIN_SESSIONS)
  .map(([group, vals]) => ({ group, n: vals.length, vals }))
  .sort((a, b) => b.n - a.n);

if (groups.length === 0) {
  console.error(
    `agent-cost-band: no workspace reached --min-sessions ${MIN_SESSIONS} ` +
    `(${sessions.length} usable sessions across ${byGroup.size} workspaces). ` +
    'The band is not estimable yet, which means a comparison run now could not ' +
    'attribute its own result.',
  );
  process.exit(3);
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const sd = (a) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((acc, x) => acc + (x - m) ** 2, 0) / Math.max(1, a.length - 1));
};

// Cost is multiplicative — every published figure in this lane is a ratio — so the
// decomposition runs on logs and the band comes back as a geometric SD.
function decompose(cells) {
  const logged = cells.map((c) => ({ n: c.n, vals: c.vals.map(Math.log) }));
  const all = logged.flatMap((c) => c.vals);
  const grand = mean(all);
  const k = logged.length;
  const N = all.length;
  if (k < 2 || N <= k) return null;
  let ssB = 0;
  let ssW = 0;
  for (const c of logged) {
    const m = mean(c.vals);
    ssB += c.n * (m - grand) ** 2;
    for (const v of c.vals) ssW += (v - m) ** 2;
  }
  const msB = ssB / (k - 1);
  const msW = ssW / (N - k);
  const n0 = (N - logged.reduce((acc, c) => acc + c.n * c.n, 0) / N) / (k - 1);
  const varBetween = Math.max(0, (msB - msW) / n0);
  return { k, N, varBetween, varWithin: msW, share: varBetween / (varBetween + msW) };
}

const d = decompose(groups);
if (!d) {
  console.error('agent-cost-band: need at least two workspaces over the threshold');
  process.exit(3);
}
const dropped = groups.length > 2 ? decompose(groups.slice(1)) : null;

// Two-sample size for a log-ratio effect at 95% confidence / 80% power. The band is
// the within-group variance: the arm count is DERIVED from it, which is the whole
// point of running this before the comparison rather than after.
const Z = 1.959964;
const ZB = 0.841621;
const armsFor = (ratio) =>
  Math.ceil((2 * d.varWithin * (Z + ZB) ** 2) / Math.log(ratio) ** 2);

const report = {
  root_groups: groupDirs.length,
  transcripts_seen: filesSeen,
  sessions_usable: sessions.length,
  sessions_skipped_short: skippedShort,
  min_sessions: MIN_SESSIONS,
  min_turns: MIN_TURNS,
  groups: groups.map((g) => ({
    group: g.group,
    n: g.n,
    median_output_tokens: Math.round(median(g.vals)),
    cv: Number((sd(g.vals) / mean(g.vals)).toFixed(3)),
    max_over_min: Number((Math.max(...g.vals) / Math.min(...g.vals)).toFixed(1)),
  })),
  band: {
    groups_used: d.k,
    sessions_used: d.N,
    within_group_log_variance: Number(d.varWithin.toFixed(4)),
    within_group_geometric_sd: Number(Math.exp(Math.sqrt(d.varWithin)).toFixed(2)),
  },
  between_group_share_diagnostic: {
    share: Number(d.share.toFixed(3)),
    share_largest_group_dropped: dropped ? Number(dropped.share.toFixed(3)) : null,
    confound:
      'Groups doing different work differ in workload assignment, not in substrate. ' +
      'This share is a stability diagnostic for the band, never a substrate effect.',
  },
  replays_per_arm: Object.fromEntries(EFFECTS.map((r) => [`${r}x`, armsFor(r)])),
};

// --- validation: does one replay per arm actually recover the true ordering? ---
// Ground truth is each pair's full-sample median ordering, and its own stability is
// bootstrapped first — a pair whose truth is unstable cannot score any protocol, and
// saying so is the difference between a check and a decoration.
function validate() {
  const TRIALS = 20000;
  const BOOT = 2000;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const medOf = (a) => median(a);
  const rows = [];
  for (let i = 0; i < groups.length; i += 1) {
    for (let j = i + 1; j < groups.length; j += 1) {
      const A = groups[i].vals;
      const B = groups[j].vals;
      const mA = medOf(A);
      const mB = medOf(B);
      const truth = Math.sign(mA - mB);
      const ratio = Math.max(mA, mB) / Math.min(mA, mB);
      let stable = 0;
      for (let b = 0; b < BOOT; b += 1) {
        const a2 = medOf(Array.from({ length: A.length }, () => pick(A)));
        const b2 = medOf(Array.from({ length: B.length }, () => pick(B)));
        if (Math.sign(a2 - b2) === truth) stable += 1;
      }
      const rates = {};
      for (const k of [1, 3, 5, 10]) {
        let ok = 0;
        for (let t = 0; t < TRIALS; t += 1) {
          const a2 = medOf(Array.from({ length: k }, () => pick(A)));
          const b2 = medOf(Array.from({ length: k }, () => pick(B)));
          if (Math.sign(a2 - b2) === truth) ok += 1;
        }
        rates[k] = ok / TRIALS;
      }
      rows.push({ a: groups[i].group, b: groups[j].group, ratio, stability: stable / BOOT, rates });
    }
  }
  rows.sort((x, y) => x.ratio - y.ratio);
  return rows;
}

if (argv.includes('--validate')) {
  const rows = validate();
  console.log('\n--- validation: sign recovery of the one-per-arm protocol ---');
  console.log('true_ratio  truth_stab  n=1   n=3   n=5   n=10  pair');
  for (const r of rows) {
    const pct = (k) => `${(r.rates[k] * 100).toFixed(0)}%`.padStart(5);
    console.log(
      `${r.ratio.toFixed(1).padStart(10)}  ${r.stability.toFixed(2).padStart(10)}  ` +
      `${pct(1)} ${pct(3)} ${pct(5)} ${pct(10)}  ${r.a.slice(-20)} vs ${r.b.slice(-20)}`,
    );
  }
  const trusted = rows.filter((r) => r.stability >= 0.9);
  const bucket = (rs, k) => (rs.length
    ? `${((rs.reduce((s, r) => s + r.rates[k], 0) / rs.length) * 100).toFixed(0)}%`
    : 'n/a');
  const small = trusted.filter((r) => r.ratio < 3);
  const large = trusted.filter((r) => r.ratio >= 3);
  console.log(`\npairs with a stable ground truth (>=0.90): ${trusted.length} of ${rows.length}`);
  console.log(`  true ratio < 3x  (${small.length} pairs): n=1 ${bucket(small, 1)}  n=10 ${bucket(small, 10)}`);
  console.log(`  true ratio >= 3x (${large.length} pairs): n=1 ${bucket(large, 1)}  n=10 ${bucket(large, 10)}`);
  console.log(
    '\nA pair below 0.90 stability is reported and not relied on: at a small effect\n' +
    'under a wide band, even tens of samples per arm do not settle the direction, and\n' +
    'a protocol cannot be scored against an ordering that is not itself established.',
  );
  process.exit(0);
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log(`agent-cost-band — ${sessions.length} usable sessions of ${filesSeen} transcripts`);
console.log(`  (${skippedShort} skipped: fewer than ${MIN_TURNS} model turns or no output tokens)\n`);
console.log('n     median_out  CV     max/min  workspace');
for (const g of report.groups) {
  console.log(
    `${String(g.n).padEnd(5)} ${String(g.median_output_tokens).padEnd(11)} ` +
    `${g.cv.toFixed(2).padEnd(6)} ${String(g.max_over_min).padEnd(8)} ${g.group}`,
  );
}
console.log('\n--- the band (output tokens, log scale) ---');
console.log(`within-workspace variance      : ${report.band.within_group_log_variance}`);
console.log(`within-workspace geometric SD  : ${report.band.within_group_geometric_sd}x`);
console.log(`  over ${d.N} sessions in ${d.k} workspaces`);
console.log('\n--- replays per arm to resolve an effect (95% / 80%) ---');
for (const [ratio, n] of Object.entries(report.replays_per_arm)) {
  console.log(`  ${ratio.padEnd(7)} -> ${n} replays per arm`);
}
console.log('\n--- between-workspace share (diagnostic only) ---');
console.log(`share ${report.between_group_share_diagnostic.share}` +
  (dropped ? `, largest workspace dropped ${report.between_group_share_diagnostic.share_largest_group_dropped}` : ''));
console.log(`  ${report.between_group_share_diagnostic.confound}`);
console.log(
  '\nThe band above is UNCONTROLLED: these sessions did different work. A comparison\n' +
  'that fixes the change class will have a tighter band, and the arm counts above are\n' +
  'therefore an upper bound. Measure the controlled band by replaying one fixed change\n' +
  'class on one fixed structure several times - which no published figure in this lane\n' +
  'has done.',
);
