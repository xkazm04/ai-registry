#!/usr/bin/env node
/**
 * check-run-results - the gate for the run-results lane (librarian/runs/<id>/result.json).
 *
 * WHY this exists: scripts/lib/run-result.mjs refuses a bad result at WRITE time, and
 * `readRunResult` refuses one at read time, but nothing walked the committed tree. A
 * result that predates the validator, or was hand-edited, sat in the lane unjudged, and
 * consumers that read the files raw (librarian-scan.mjs counts them for its halt rules)
 * took whatever was there. A measurement on 2026-10-25 found 15 of 466 committed
 * records failing `validateRunResult`, with no gate that could have said so.
 *
 * What it checks: every `librarian/runs/**\/result.json` is parsed and passed through
 * `validateRunResult`. A record that does not parse is invalid, not a crash.
 *
 * The 15 existing failures are history, not work to rewrite. They are grandfathered by a
 * SHRINK-ONLY allowlist, `librarian/runs/.grandfathered.json`:
 *
 *   { "_note": "<why>", "ids": ["<run id>", ...] }
 *
 * A run id is the result's directory path under librarian/runs/. Shrink-only is enforced
 * from both ends: an invalid result that is NOT listed fails (the list never grows to
 * excuse a new defect), and a listed id that now VALIDATES, or whose result no longer
 * exists, also fails with "delist <id>" (a repaired record must leave the list, so the
 * list can only get shorter).
 *
 * Exits 0 when every invalid result is listed and every listed id is still invalid, 1
 * on any violation, 2 when the check could not run: no result files at all (an empty
 * lane has not been checked, `requirePopulation`), an unreadable or malformed allowlist,
 * or an unknown argument.
 *
 * `--root <dir>` points the check at another tree (the tests use it with temp fixtures).
 *
 * Usage:
 *   node scripts/check-run-results.mjs
 *   node scripts/check-run-results.mjs --root <dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { requirePopulation } from './lib/check-result.mjs';
import { validateRunResult } from './lib/run-result.mjs';

const DEFAULT_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LIST_NAME = '.grandfathered.json';

const fatal = (msg) => { console.error(`check-run-results: ${msg}`); process.exit(EXIT.FATAL); };

const argv = process.argv.slice(2);
let root = DEFAULT_ROOT;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--help' || argv[i] === '-h') {
    console.log('usage: node check-run-results.mjs [--root <dir>]');
    process.exit(EXIT.OK);
  } else if (argv[i] === '--root') {
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) fatal('--root needs a value.');
    root = path.resolve(v);
  } else {
    fatal(`unknown argument ${JSON.stringify(argv[i])}.`);
  }
}

const runsDir = path.join(root, 'librarian', 'runs');
if (!fs.existsSync(runsDir)) fatal('librarian/runs does not exist - there is no lane to check.');

/** Every result.json under the lane, as `{ id, file }`, id being its directory path. */
function walk(dir, rel = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel ? `${rel}/${entry.name}` : entry.name));
    else if (entry.name === 'result.json' && rel) out.push({ id: rel, file: path.join(dir, entry.name) });
  }
  return out;
}

function readList() {
  const file = path.join(runsDir, LIST_NAME);
  // No list is an empty list: every invalid result is then a violation, which is the
  // honest consequence of deleting it. A list that exists but cannot be read is not.
  if (!fs.existsSync(file)) return new Set();
  let parsed;
  try { parsed = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (err) { return fatal(`librarian/runs/${LIST_NAME} is not readable JSON - ${err.message}`); }
  const shapeOk = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    && typeof parsed._note === 'string' && parsed._note.trim() !== ''
    && Array.isArray(parsed.ids) && parsed.ids.every((id) => typeof id === 'string' && id !== '');
  if (!shapeOk) return fatal(`librarian/runs/${LIST_NAME} must be { "_note": "<why>", "ids": ["<run id>", ...] }.`);
  const ids = new Set(parsed.ids);
  if (ids.size !== parsed.ids.length) return fatal(`librarian/runs/${LIST_NAME} lists a run id more than once.`);
  return ids;
}

const results = walk(runsDir).sort((a, b) => a.id.localeCompare(b.id));
const population = requirePopulation(results.length, 'librarian/runs result.json files');
if (population.code !== EXIT.OK) fatal(population.reason);

const listed = readList();
const invalid = new Map();
for (const { id, file } of results) {
  let problems;
  try { problems = validateRunResult(JSON.parse(fs.readFileSync(file, 'utf8'))); }
  catch (err) { problems = [`not readable JSON - ${err.message}`]; }
  if (problems.length) invalid.set(id, problems);
}

const unlisted = [...invalid.keys()].filter((id) => !listed.has(id));
const stale = [...listed].filter((id) => !invalid.has(id)).sort();

for (const id of unlisted) {
  console.error(`INVALID librarian/runs/${id}/result.json`);
  for (const p of invalid.get(id)) console.error(`  - ${p}`);
}
for (const id of stale) {
  const exists = results.some((r) => r.id === id);
  console.error(`delist ${id}: ${exists ? 'its result now validates' : 'its result no longer exists'} - remove it from librarian/runs/${LIST_NAME}`);
}

if (unlisted.length || stale.length) {
  console.error(`\ncheck-run-results: ${unlisted.length} invalid unlisted result(s), ${stale.length} stale allowlist id(s) of ${results.length} results.`);
  console.error('Fix an invalid result at its source; never add it to the allowlist. The allowlist only shrinks.');
  process.exit(EXIT.VIOLATIONS);
}

console.log(`check-run-results: ${results.length} results, ${results.length - invalid.size} valid, ${invalid.size} grandfathered.`);
process.exit(EXIT.OK);
