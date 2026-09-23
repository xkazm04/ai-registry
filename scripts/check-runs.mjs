#!/usr/bin/env node
/**
 * check-runs - the gate for the skill run log (`usage/runs/`, contract in scripts/lib/runs.mjs).
 *
 * The run log is committed, free text and all, by operator choice. That makes two things
 * this gate's job and nobody else's:
 *
 * 1. Shape. One file per DEVICE, and the filename is the identity: `<device>.jsonl` must
 *    name a machine declared in projects.json `machines`, and every row in it must carry
 *    that device. Without the stem check two machines could write the same device name
 *    into different files and the report would double-count or mis-attribute. Every row
 *    passes validateRun; every sidecar row (`<device>.exact.jsonl`) passes validateExact
 *    and points at a run id that exists in its device's log - a measurement of a run that
 *    was never logged is an orphan the report cannot place. Ids are unique. Nothing else
 *    may live in the directory: a stray file is either a misnamed log or something that
 *    should not be committed here at all.
 *
 * 2. Privacy. validateRun rejects filesystem paths and email addresses in the free text;
 *    this gate additionally scans each raw line, so a leak in a field the validator does
 *    not treat as free text is still caught. And it asserts the leak scanner BEFORE
 *    reporting: a must-not-match scan with a dead pattern and a clean lane print the same
 *    thing, so a scanner that no longer fires on its own control is FATAL (exit 2).
 *
 * An absent or empty lane is OK - no run has been logged yet is a legitimate state.
 *
 * Test hook: REGISTRY_RUNS_ROOT, if set, is read as the registry root for the LANE only
 * (<it>/usage/runs). The machine list still comes from this registry's projects.json.
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 clean, 1 findings, 2 could not run.
 * Builtins only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { assertLeakScanner, leaksIn, validateRun, validateExact, runsDir } from './lib/runs.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE_ROOT = process.env.REGISTRY_RUNS_ROOT ? path.resolve(process.env.REGISTRY_RUNS_ROOT) : ROOT;
const LANE = runsDir(LANE_ROOT);

// ---------------------------------------------------------------- assert the instrument
try {
  assertLeakScanner();
} catch (e) {
  console.error(`check-runs FATAL: ${e.message}. Refusing to report a clean lane.`);
  process.exit(EXIT.FATAL);
}

let machines;
try {
  const fleet = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects.json'), 'utf8'));
  machines = new Set(Object.keys(fleet.machines ?? {}));
} catch (e) {
  console.error(`check-runs FATAL: projects.json could not be read (${e.message}) - without the machine list no filename can be checked.`);
  process.exit(EXIT.FATAL);
}
if (machines.size === 0) {
  console.error('check-runs FATAL: projects.json declares no machines - every run file would be unverifiable.');
  process.exit(EXIT.FATAL);
}

if (!fs.existsSync(LANE)) {
  console.log('runs lane: absent - no skill run has been logged yet.');
  process.exit(EXIT.OK);
}

let entries;
try {
  entries = fs.readdirSync(LANE, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
} catch (e) {
  console.error(`check-runs FATAL: usage/runs/ exists but cannot be read (${e.message}).`);
  console.error('Reporting nothing is not the same as finding nothing - refusing to exit 0.');
  process.exit(EXIT.FATAL);
}

const failures = [];
const fail = (msg) => failures.push(msg);
const LOG_RE = /^([A-Za-z0-9][A-Za-z0-9_-]*)\.jsonl$/;
const EXACT_RE = /^([A-Za-z0-9][A-Za-z0-9_-]*)\.exact\.jsonl$/;

/** Parsed rows with their 1-based line numbers; unparseable lines are failures. */
function readLines(rel, file) {
  const out = [];
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((raw, i) => {
    if (!raw.trim()) return;
    try { out.push({ line: i + 1, raw, row: JSON.parse(raw) }); } catch (e) { fail(`${rel}:${i + 1}: not valid JSON (${e.message})`); }
  });
  return out;
}

const logs = [];
const exacts = [];
for (const e of entries) {
  const rel = `usage/runs/${e.name}`;
  if (!e.isFile()) { fail(`${rel}: not a file - usage/runs/ holds only <device>.jsonl and <device>.exact.jsonl`); continue; }
  let m;
  if ((m = e.name.match(EXACT_RE))) exacts.push({ rel, device: m[1], file: path.join(LANE, e.name) });
  else if ((m = e.name.match(LOG_RE))) logs.push({ rel, device: m[1], file: path.join(LANE, e.name) });
  else fail(`${rel}: unexpected file - usage/runs/ holds only <device>.jsonl and <device>.exact.jsonl`);
}

let rows = 0;
const idsByDevice = new Map();
const seen = new Map(); // id -> "file:line" of first sighting

for (const { rel, device, file } of logs) {
  if (!machines.has(device)) fail(`${rel}: "${device}" is not a machine declared in projects.json machines (${[...machines].join(', ')})`);
  const ids = new Set();
  idsByDevice.set(device, ids);
  for (const { line, raw, row } of readLines(rel, file)) {
    rows++;
    const at = `${rel}:${line}`;
    const problems = validateRun(row);
    for (const p of problems) fail(`${at}: ${p}`);
    if (!problems.some((p) => p.includes(' contains '))) {
      for (const what of leaksIn(raw)) fail(`${at}: line contains ${what}`);
    }
    if (row && row.device !== undefined && row.device !== device) fail(`${at}: device "${row.device}" does not match the filename stem "${device}"`);
    if (row && typeof row.id === 'string') {
      if (seen.has(row.id)) fail(`${at}: duplicate id ${row.id} (first at ${seen.get(row.id)})`);
      else seen.set(row.id, at);
      ids.add(row.id);
    }
  }
}

for (const { rel, device, file } of exacts) {
  if (!machines.has(device)) fail(`${rel}: "${device}" is not a machine declared in projects.json machines`);
  const logIds = idsByDevice.get(device) ?? new Set();
  const exactSeen = new Map();
  for (const { line, raw, row } of readLines(rel, file)) {
    rows++;
    const at = `${rel}:${line}`;
    for (const p of validateExact(row)) fail(`${at}: ${p}`);
    for (const what of leaksIn(raw)) fail(`${at}: line contains ${what}`);
    if (row && typeof row.id === 'string' && row.id) {
      if (exactSeen.has(row.id)) fail(`${at}: duplicate id ${row.id} (first at ${exactSeen.get(row.id)})`);
      else exactSeen.set(row.id, at);
      if (!logIds.has(row.id)) fail(`${at}: id ${row.id} has no row in usage/runs/${device}.jsonl`);
    }
  }
}

const nFiles = logs.length + exacts.length;
console.log(`runs lane: ${nFiles} file(s) (${logs.length} log, ${exacts.length} sidecar) · ${rows} row(s)${nFiles === 0 ? ' - empty, nothing logged yet' : ''}`);

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(EXIT.VIOLATIONS);
}
console.log('runs lane OK - one log per declared device, every row on contract.');
