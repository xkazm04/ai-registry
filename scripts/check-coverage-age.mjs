#!/usr/bin/env node
/**
 * check-coverage-age — the gate that makes fleet drift fail a build.
 *
 * There is a hard constraint behind this script's odd shape, and it is worth stating
 * plainly because it is the reason nothing gated this before. **CI cannot see the fleet.**
 * Every instrument that measures registry↔project alignment resolves its checkouts
 * through `.machine.local.json`, which is gitignored by design — the fleet's absolute
 * roots and contributor identity are not publishable, and putting them in the repo to
 * satisfy a gate would trade a real privacy rule for a green tick.
 *
 * So this gate does not check the fleet. It checks the AGE OF THE LAST MEASUREMENT.
 * `converge.mjs` runs where the fleet is visible and leaves a committed, public-safe
 * report behind; this reads only that file's own `generated:` stamp. The fleet stays
 * unpublishable, and drift still stops being invisible — which was the actual goal.
 *
 * Read the failure correctly: a red build here NEVER means the fleet is broken. It means
 * nobody has looked recently, which is a different and more honest claim. The measured
 * history this exists for: thirteen of thirteen project maps stale at once, 193 leads
 * held in project ledgers for up to three weeks, and a fleet map that had itself gone
 * stale — none of it a failure of any instrument, all of it a failure to run one.
 *
 * `--max-age` is the one tunable and it is generous on purpose. This is a reminder with
 * teeth, not a cadence police.
 *
 * Usage:
 *   node check-coverage-age.mjs                 # default: 14 days
 *   node check-coverage-age.mjs --max-age 30
 *
 * Exits 0 when the report is present and fresh, 1 when it is missing, stale or stamped in
 * the future, 2 if the file exists but its age or population cannot be established: no
 * readable stamp, more than one stamp, or no projects declared (an instrument that cannot
 * read its own input reports that, rather than passing).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { requirePopulation } from './lib/check-result.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const REPORT = path.join(ROOT, 'librarian', 'fleet-coverage.md');
const REL = path.relative(ROOT, REPORT).replace(/\\/g, '/');

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  console.log('usage: node check-coverage-age.mjs [--max-age <days>]');
  process.exit(EXIT.OK);
}
// A closed flag set. `--max-age` with no value used to fall back to 14 and an unknown flag
// was ignored, so the limit a caller asked for was not the limit the verdict used.
let maxAgeArg = null;
for (let a = 0; a < argv.length; a++) {
  if (argv[a] !== '--max-age') {
    console.error(`check-coverage-age: unknown argument ${JSON.stringify(argv[a])}. Usage: node scripts/check-coverage-age.mjs [--max-age <days>]`);
    process.exit(EXIT.FATAL);
  }
  maxAgeArg = argv[++a] ?? null;
  if (maxAgeArg === null || maxAgeArg.startsWith('--')) {
    console.error('check-coverage-age: --max-age needs a value (a positive number of days).');
    process.exit(EXIT.FATAL);
  }
}
const MAX_AGE = maxAgeArg === null ? 14 : Number(maxAgeArg);

if (!Number.isFinite(MAX_AGE) || MAX_AGE <= 0) {
  console.error('check-coverage-age: --max-age must be a positive number of days.');
  process.exit(EXIT.FATAL);
}

if (!fs.existsSync(REPORT)) {
  console.error(`check-coverage-age: ${REL} does not exist.`);
  console.error('Run `node scripts/converge.mjs` on a machine that can see the fleet, and commit the report.');
  process.exit(EXIT.VIOLATIONS);
}

const text = fs.readFileSync(REPORT, 'utf8');
// Exactly one stamp. The first match used to win, so a fresh decoy line written above
// the real one made a stale report read fresh (2026-10-25 gates scan). Two stamps are
// two claims about one measurement; the age cannot be established from either.
const stamps = [...text.matchAll(/^generated:\s*(\S+)/gm)].map((m) => m[1]);
if (stamps.length > 1) {
  console.error(`check-coverage-age: ${REL} carries ${stamps.length} \`generated:\` stamps (${stamps.join(', ')}) — its age cannot be established.`);
  console.error('Regenerate it with `node scripts/converge.mjs` rather than editing the stamp.');
  process.exit(EXIT.FATAL);
}
const stamp = stamps[0] ?? null;
const when = Date.parse(stamp ?? '');

if (!Number.isFinite(when)) {
  // A report with no readable date cannot be judged fresh OR stale. Saying so is the
  // finding; passing it would be exactly the "reporting nothing is not finding nothing"
  // failure the exit contract exists to prevent.
  console.error(`check-coverage-age: ${REL} carries no readable \`generated:\` stamp — its age cannot be established.`);
  process.exit(EXIT.FATAL);
}

// A stamp records when a measurement happened, so a future one is a defect in the report,
// not a very fresh measurement: 2099 used to pass for the next seventy years. One day of
// slack for clock skew between the measuring machine and this one.
if (when > Date.now() + 86_400_000) {
  console.error(`check-coverage-age: ${REL} is stamped ${stamp}, which is in the future — a stamp records a measurement that happened.`);
  console.error('Regenerate it with `node scripts/converge.mjs` rather than editing the stamp.');
  process.exit(EXIT.VIOLATIONS);
}

// A fresh measurement of nothing is not a measurement. converge.mjs writes the population
// it measured into the header (`projects declared: N`); absent or zero, the report cannot
// say the fleet was looked at, however recent its stamp.
const declared = /projects declared:\s*(\d+)/.exec(text);
const population = requirePopulation(declared ? Number(declared[1]) : NaN, `projects declared in ${REL}`);
if (population.code !== EXIT.OK) {
  console.error(`check-coverage-age: ${population.reason}`);
  console.error('Run `node scripts/converge.mjs` on a machine whose fleet bridge declares projects, and commit the report.');
  process.exit(EXIT.FATAL);
}

const days = Math.floor((Date.now() - when) / 86_400_000);

if (days > MAX_AGE) {
  console.error(`check-coverage-age: ${REL} is ${days} day(s) old (limit ${MAX_AGE}).`);
  console.error('');
  console.error('This does NOT mean the fleet is broken. It means nobody has measured it recently.');
  console.error('Run `node scripts/converge.mjs` where the fleet is visible, then commit the report.');
  process.exit(EXIT.VIOLATIONS);
}

console.log(`check-coverage-age: ${REL} is ${days} day(s) old (limit ${MAX_AGE}). Fresh.`);
process.exit(EXIT.OK);
