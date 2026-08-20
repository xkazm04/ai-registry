#!/usr/bin/env node
/**
 * check-currency — how old is what this registry claims, and who is still watching it.
 *
 * The bundle gate proves the four-layer CONTRACT holds. It says nothing about whether the
 * content is still TRUE. An application cites real code in a real tree; that tree moves,
 * the citation does not, and nothing in this repository could previously notice.
 *
 * This script is the noticing. It reports four things:
 *
 *   expired      the derived clock on an application has run out
 *   at risk      the clock runs out inside the horizon (default 30 days)
 *   stack drift  a reporting installation runs a newer major than the document was
 *                verified against
 *   unwitnessed  a bundle nobody reports on at all
 *
 * ## It reports; it does not fail
 *
 * Exit 0 even with findings, on purpose. A stale document must never block an unrelated
 * pull request - that is how a gate gets deleted. `--fail-on-expired` is for a SCHEDULED
 * run (or /librarian), where a red result is the whole point and nobody is blocked by it.
 * A broken input still exits 2: reporting nothing is not the same as finding nothing.
 *
 * ## Where the clock comes from
 *
 * `verified_on` is a fact - the date an application's citations were last resolved
 * against a tree. The expiry is DERIVED from it here, per stack, so the policy lives in
 * one place a maintainer can tune instead of in 451 invented dates. A document may
 * override the derivation with its own `refresh_by`.
 *
 * Usage:
 *   node scripts/check-currency.mjs                 # the report
 *   node scripts/check-currency.mjs --json          # machine-readable (this is what /librarian reads)
 *   node scripts/check-currency.mjs --horizon 60    # widen "at risk"
 *   node scripts/check-currency.mjs --fail-on-expired
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const KNOWLEDGE = path.join(ROOT, 'knowledge');
const SIGNALS = path.join(ROOT, 'signals');

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const failOnExpired = argv.includes('--fail-on-expired');
const horizonDays = (() => {
  const i = argv.indexOf('--horizon');
  if (i === -1) return 30;
  const n = Number(argv[i + 1]);
  if (!Number.isInteger(n) || n < 0) {
    console.error(`check-currency FATAL: --horizon needs a non-negative integer, got ${JSON.stringify(argv[i + 1])}`);
    process.exit(2);
  }
  return n;
})();

/**
 * How long a citation against each stack stays plausible without a re-check.
 *
 * These are FLOORS, not measurements. The reasoning is how fast the surface underneath a
 * citation moves: a UI framework and its ecosystem churn fastest, a systems runtime is
 * slower and its breaking changes are louder, and the SQL surface a document is likely to
 * cite barely moves at all. `process` gets NO clock - a methodology does not expire on a
 * vendor's release schedule, and giving it one would generate noise that trains people to
 * ignore the report.
 *
 * Tune these here, in one place. A document that knows better carries its own `refresh_by`.
 */
const WINDOW_DAYS = {
  react: 183,
  node: 183,
  rust: 274,
  sql: 365,
  process: null,
};
const DEFAULT_WINDOW_DAYS = 183;

const DAY = 86400000;
const today = new Date().toISOString().slice(0, 10);
const addDays = (iso, days) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

// ---------------------------------------------------------------- inputs
if (!fs.existsSync(KNOWLEDGE)) {
  console.error(`check-currency FATAL: no knowledge/ lane at ${KNOWLEDGE}.`);
  process.exit(2);
}

const frontmatter = (file) => {
  const m = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
  }
  return fm;
};

// ---------------------------------------------------------------- the corpus
const domains = fs
  .readdirSync(KNOWLEDGE, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

if (domains.length === 0) {
  console.error('check-currency FATAL: knowledge/ holds zero bundles. Refusing to report "all current".');
  process.exit(2);
}

/** Every application, with its derived clock. */
const apps = [];
for (const domain of domains) {
  const dDir = path.join(KNOWLEDGE, domain);
  for (const subj of fs.readdirSync(dDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const aDir = path.join(dDir, subj.name, 'applications');
    if (!fs.existsSync(aDir)) continue;
    for (const f of fs.readdirSync(aDir).filter((x) => x.endsWith('.md')).sort()) {
      const fm = frontmatter(path.join(aDir, f)) ?? {};
      const stack = fm.stack ?? 'unknown';
      const window = stack in WINDOW_DAYS ? WINDOW_DAYS[stack] : DEFAULT_WINDOW_DAYS;
      const verifiedOn = fm.verified_on ?? null;

      // Explicit override beats derivation; `process` has no derived clock at all.
      let expiresOn = null;
      let clockSource = 'none';
      if (fm.refresh_by) {
        expiresOn = fm.refresh_by;
        clockSource = 'refresh_by';
      } else if (verifiedOn && window !== null) {
        expiresOn = addDays(verifiedOn, window);
        clockSource = 'derived';
      }

      apps.push({
        id: `${domain}/${subj.name}/${f.replace(/\.md$/, '')}`,
        domain,
        subject: subj.name,
        stack,
        verifiedOn,
        verifiedAgainst: fm.verified_against ?? null,
        expiresOn,
        clockSource,
        daysLeft: expiresOn ? daysBetween(today, expiresOn) : null,
      });
    }
  }
}

if (apps.length === 0) {
  console.error('check-currency FATAL: zero application documents found. THE WALKER IS BROKEN.');
  process.exit(2);
}

// ---------------------------------------------------------------- the signals lane
// Validation lives in scripts/check-signals.mjs. This reads what that gate accepts and is
// deliberately tolerant: one malformed contributor file must not erase every other
// installation's report.
const contributors = [];
if (fs.existsSync(SIGNALS)) {
  for (const f of fs.readdirSync(SIGNALS).filter((x) => x.endsWith('.json')).sort()) {
    try {
      contributors.push(JSON.parse(fs.readFileSync(path.join(SIGNALS, f), 'utf8')));
    } catch {
      console.warn(`  note: signals/${f} is not valid JSON — skipped (run check-signals.mjs)`);
    }
  }
}

/** Highest major any installation reports for a stack. */
const fleetMajor = {};
for (const c of contributors) {
  for (const [stack, version] of Object.entries(c.stack ?? {})) {
    const major = Number(String(version).split('.')[0]);
    if (!Number.isFinite(major)) continue;
    if (!(stack in fleetMajor) || major > fleetMajor[stack]) fleetMajor[stack] = major;
  }
}

/** Which bundles anybody reports on at all. */
const witnessed = new Set();
for (const c of contributors) for (const b of Object.keys(c.bundles ?? {})) witnessed.add(b);

// ---------------------------------------------------------------- findings
const expired = apps.filter((a) => a.daysLeft !== null && a.daysLeft < 0);
const atRisk = apps.filter((a) => a.daysLeft !== null && a.daysLeft >= 0 && a.daysLeft <= horizonDays);
const noClock = apps.filter((a) => a.expiresOn === null);

const drift = [];
for (const a of apps) {
  if (!a.verifiedAgainst) continue;
  const [stack, version] = a.verifiedAgainst.split('@');
  const was = Number(String(version).split('.')[0]);
  const now = fleetMajor[stack];
  if (Number.isFinite(was) && Number.isFinite(now) && now > was) {
    drift.push({ ...a, was, now });
  }
}

// A document with a version witness is one whose drift is COMPUTABLE. Without one, a
// runtime bump is invisible no matter how many installations report - which is a fact
// about our instrumentation, not about the document, and it is reported as such.
const versionWitness = apps.filter((a) => a.verifiedAgainst).length;

const perDomain = domains.map((d) => {
  const mine = apps.filter((a) => a.domain === d);
  const withClock = mine.filter((a) => a.expiresOn !== null);
  const oldest = mine.reduce((acc, a) => (a.verifiedOn && (!acc || a.verifiedOn < acc) ? a.verifiedOn : acc), null);
  return {
    domain: d,
    applications: mine.length,
    expired: mine.filter((a) => a.daysLeft !== null && a.daysLeft < 0).length,
    atRisk: mine.filter((a) => a.daysLeft !== null && a.daysLeft >= 0 && a.daysLeft <= horizonDays).length,
    noClock: mine.length - withClock.length,
    versionWitness: mine.filter((a) => a.verifiedAgainst).length,
    oldestVerifiedOn: oldest,
    // "unknown", never "current" - a bundle nobody reports on has not been checked, and
    // saying otherwise is the exact dishonesty catalog.json avoids with invokes30d.
    witness: witnessed.has(d) ? 'reported' : 'unknown',
  };
});

// ---------------------------------------------------------------- report
if (asJson) {
  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        today,
        horizonDays,
        windowDays: WINDOW_DAYS,
        defaultWindowDays: DEFAULT_WINDOW_DAYS,
        totals: {
          applications: apps.length,
          expired: expired.length,
          atRisk: atRisk.length,
          noClock: noClock.length,
          versionWitness,
          contributors: contributors.length,
        },
        domains: perDomain,
        expired: expired.map((a) => ({ id: a.id, expiresOn: a.expiresOn, daysLeft: a.daysLeft, clockSource: a.clockSource })),
        atRisk: atRisk.map((a) => ({ id: a.id, expiresOn: a.expiresOn, daysLeft: a.daysLeft, clockSource: a.clockSource })),
        drift: drift.map((a) => ({ id: a.id, stack: a.stack, verifiedAgainst: a.verifiedAgainst, fleetMajor: a.now })),
      },
      null,
      2,
    ),
  );
} else {
  console.log(`currency report — ${today}, horizon ${horizonDays}d\n`);
  const w = Math.max(...perDomain.map((d) => d.domain.length));
  console.log(
    `  ${'bundle'.padEnd(w)}  ${'apps'.padStart(5)} ${'expired'.padStart(8)} ${'at risk'.padStart(8)} ${'no clock'.padStart(9)} ${'ver.witness'.padStart(12)}  oldest      witness`,
  );
  for (const d of perDomain) {
    console.log(
      `  ${d.domain.padEnd(w)}  ${String(d.applications).padStart(5)} ${String(d.expired).padStart(8)} ${String(d.atRisk).padStart(8)} ${String(d.noClock).padStart(9)} ${String(d.versionWitness).padStart(12)}  ${d.oldestVerifiedOn ?? '—'}  ${d.witness}`,
    );
  }

  console.log(
    `\n  ${apps.length} applications · ${expired.length} expired · ${atRisk.length} at risk · ` +
      `${noClock.length} with no clock · ${contributors.length} reporting installation(s)`,
  );

  if (expired.length) {
    console.log('\nEXPIRED');
    for (const a of expired.slice(0, 40)) {
      console.log(`  ${a.expiresOn}  ${String(-a.daysLeft).padStart(4)}d ago  ${a.id}  (${a.clockSource})`);
    }
    if (expired.length > 40) console.log(`  … and ${expired.length - 40} more (--json for all)`);
  }

  if (atRisk.length) {
    console.log(`\nAT RISK (next ${horizonDays}d)`);
    for (const a of atRisk.slice(0, 20)) {
      console.log(`  ${a.expiresOn}  in ${String(a.daysLeft).padStart(4)}d  ${a.id}  (${a.clockSource})`);
    }
    if (atRisk.length > 20) console.log(`  … and ${atRisk.length - 20} more (--json for all)`);
  }

  if (drift.length) {
    console.log('\nSTACK DRIFT (a reporting installation is on a newer major)');
    for (const a of drift.slice(0, 20)) {
      console.log(`  ${a.verifiedAgainst} → fleet is on ${a.stack}@${a.now}  ${a.id}`);
    }
    if (drift.length > 20) console.log(`  … and ${drift.length - 20} more (--json for all)`);
  }

  const unwitnessed = perDomain.filter((d) => d.witness === 'unknown');
  if (unwitnessed.length) {
    console.log('\nUNWITNESSED — no installation reports on these bundles.');
    console.log('  Their currency is UNKNOWN, not current. See docs/signals-lane.md.');
    for (const d of unwitnessed) console.log(`  ${d.domain}`);
  }
  if (versionWitness === 0) {
    console.log('\n  note: no application carries `verified_against`, so stack drift is not computable');
    console.log('  for any of them yet. It is written going forward by whatever resolves a citation');
    console.log('  against a real tree — backfilling it would be inventing data.');
  }
}

if (failOnExpired && expired.length) process.exit(1);
