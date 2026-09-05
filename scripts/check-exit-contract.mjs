#!/usr/bin/env node
/**
 * check-exit-contract — the gate that makes scripts/lib/exit-codes.mjs binding.
 *
 * The declaration alone does not stop drift; it only makes drift SAYABLE. This is the
 * instrument that says it. It reads every `process.exit(<literal>)` in scripts/ and
 * fails on any code the declaration does not name and the collision ledger does not
 * excuse.
 *
 * Why a gate rather than a convention: adding a failure meaning and giving it a code
 * are two edits, and only the first one is required for the script to work. Nothing in
 * the language, the linter or the test suite has an opinion about the second. That
 * asymmetry is the whole reason code 3 acquired three incompatible meanings while codes
 * 0/1/2 stayed clean - the convention held only as long as it fit in one head.
 *
 * Asserts itself before reporting: it builds a synthetic script carrying an undeclared
 * exit code and requires its own detector to flag it. A checker that cannot find a
 * planted positive has no standing to report an absence.
 *
 * Exits 1 on findings, 2 if it could not run.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, MEANINGS, KNOWN_COLLISIONS, nameOf } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SCRIPTS = path.join(ROOT, 'scripts');

/** Every `process.exit(<integer literal>)` in one file, with its line number. */
function exitSites(text) {
  const out = [];
  const re = /process\.exit\(\s*(-?\d+)\s*\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ code: Number(m[1]), line: text.slice(0, m.index).split('\n').length });
  }
  return out;
}

function mjsFilesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.mjs'))
    .map((e) => path.join(dir, e.name));
}

// ---------------------------------------------------------------- self-assertion
{
  // Built by concatenation on purpose: written as a literal, this fixture would be a
  // real exit site in this file and the scan below would report its own scaffolding.
  const planted = 'if (bad) process.' + 'exit(97);\n';
  const found = exitSites(planted);
  if (found.length !== 1 || found[0].code !== 97) {
    console.error('FATAL: the detector failed its own planted positive.');
    console.error(`  expected one site with code 97, got ${JSON.stringify(found)}`);
    process.exit(EXIT.FATAL);
  }
  if (nameOf(97) !== null) {
    console.error('FATAL: nameOf() claims 97 is declared; the declaration is not what this gate thinks.');
    process.exit(EXIT.FATAL);
  }
}

// ---------------------------------------------------------------- read the tree
const files = [...mjsFilesIn(SCRIPTS), ...mjsFilesIn(path.join(SCRIPTS, 'lib'))];
if (files.length === 0) {
  console.error(`FATAL: no .mjs files under ${path.relative(ROOT, SCRIPTS)} - reporting nothing is not finding nothing.`);
  process.exit(EXIT.FATAL);
}

const excused = new Set(KNOWN_COLLISIONS.map((c) => `${c.script}:${c.code}`));
const findings = [];
const byCode = new Map();
let sites = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const base = path.basename(file);
  for (const { code, line } of exitSites(fs.readFileSync(file, 'utf8'))) {
    sites++;
    byCode.set(code, (byCode.get(code) ?? 0) + 1);
    if (nameOf(code) !== null) continue;
    if (excused.has(`${base}:${code}`)) continue;
    findings.push({ rel, line, code });
  }
}

// ---------------------------------------------------------------- report
console.log(`check-exit-contract - ${sites} exit site(s) across ${files.length} script(s)`);
for (const code of [...byCode.keys()].sort((a, b) => a - b)) {
  const label = nameOf(code) ? `${nameOf(code)} - ${MEANINGS[code]}` : 'UNDECLARED';
  console.log(`  ${String(code).padStart(3)}  x${String(byCode.get(code)).padStart(3)}  ${label}`);
}

if (KNOWN_COLLISIONS.length) {
  console.log(`\n  ${KNOWN_COLLISIONS.length} known collision(s) - a declared code carrying a second meaning:`);
  for (const c of KNOWN_COLLISIONS) {
    console.log(`    ${c.script} exits ${c.code} meaning "${c.means}"`);
    console.log(`      conflicts with ${c.conflictsWith}`);
  }
  console.log('    These ship as debt. Resolving one means renumbering a live code and telling its callers.');
}

if (findings.length === 0) {
  console.log('\nexit contract OK');
  process.exit(EXIT.OK);
}

console.error(`\nexit contract FAILED - ${findings.length} undeclared exit code(s):`);
for (const f of findings) {
  console.error(`  - ${f.rel}:${f.line} exits ${f.code}, which scripts/lib/exit-codes.mjs does not name.`);
}
console.error('\nAdd a name to EXIT in scripts/lib/exit-codes.mjs, or reuse a declared code.');
console.error('If the meaning genuinely collides with a code already owned, record it in KNOWN_COLLISIONS with its conflict.');
process.exit(EXIT.VIOLATIONS);
