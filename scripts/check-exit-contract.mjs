#!/usr/bin/env node
/**
 * check-exit-contract — the gate that makes scripts/lib/exit-codes.mjs binding.
 *
 * The declaration alone does not stop drift; it only makes drift SAYABLE. This is the
 * instrument that says it. It reads every exit call in scripts/ - literal codes, and
 * codes hidden behind a ternary or a const binding - and fails on any code the
 * declaration does not name, and on any computed code above FATAL that the collision
 * ledger does not excuse.
 *
 * Why a gate rather than a convention: adding a failure meaning and giving it a code
 * are two edits, and only the first one is required for the script to work. Nothing in
 * the language, the linter or the test suite has an opinion about the second. That
 * asymmetry is the whole reason code 3 acquired three incompatible meanings while codes
 * 0/1/2 stayed clean - the convention held only as long as it fit in one head.
 *
 * Why computed exits are read too: a literal-only scan is blind to the shape that hides
 * a meaning best. transcript-mirror exited 3 for "paused at budget" through a variable
 * bound a few lines above the exit call, so the literal scan counted zero sites there and
 * the retry code carried a permanent-ish meaning with no entry in the ledger. The scan
 * resolves the integers a ternary or a const binding can yield; an argument that yields
 * no integer in the text (a function result, a parameter) is counted and reported as not
 * evaluated, never guessed at.
 *
 * Asserts itself before reporting: it builds synthetic scripts carrying an undeclared
 * exit code and a computed exit, and requires its own detector to flag both. A checker
 * that cannot find a planted positive has no standing to report an absence.
 *
 * Exports exitSites/judgeSite so the tests can plant cases; it only runs as a script.
 * Exits 1 on findings, 2 if it could not run.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, MEANINGS, KNOWN_COLLISIONS, nameOf } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SCRIPTS = path.join(ROOT, 'scripts');

/**
 * The argument text of every exit call, balanced to its closing paren. A regex over the
 * whole call would stop at the first close paren inside a ternary condition, which is
 * exactly the shape the computed case needs read whole.
 */
function exitCalls(text) {
  const out = [];
  const re = /process\.exit\(/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    // Prose quoting the call - a `//` line or a `/** ... */` block line - is not a site.
    // Only a line that BEGINS as a comment is skipped, so the miss this can cause is an
    // exit written after `/* x */` on one line, which no script here does.
    const lineStart = text.lastIndexOf('\n', m.index) + 1;
    if (/^\s*(?:\/\/|\/\*|\*)/.test(text.slice(lineStart, m.index))) continue;
    let depth = 1;
    let i = re.lastIndex;
    while (i < text.length && depth > 0) {
      if (text[i] === '(') depth++;
      else if (text[i] === ')') depth--;
      i++;
    }
    if (depth !== 0) continue;
    out.push({
      arg: text.slice(re.lastIndex, i - 1).trim(),
      line: text.slice(0, m.index).split('\n').length,
    });
  }
  return out;
}

const EXIT_TERNARY = /^[^?:]+\?\s*EXIT\.[A-Z_]+\s*:\s*(?:[^?:]+\?\s*EXIT\.[A-Z_]+\s*:\s*)*EXIT\.[A-Z_]+$/;

/** Integers a branch or fallback position can yield: `? 3`, `: 0`, `|| 2`, `?? 1`. */
function branchLiterals(expr) {
  const out = [];
  const re = /(?:\?\?|\|\||[?:])\s*(-?\d+)\b(?!\s*[.\w])/g;
  let m;
  while ((m = re.exec(expr)) !== null) out.push(Number(m[1]));
  return out;
}

/**
 * Every exit site in one file, with its line number.
 *
 *   - integer literal              -> { code, line, computed: false }
 *   - a bare EXIT.NAME             -> nothing; the name is the declaration
 *   - anything else                -> one site per integer the expression can yield, read
 *     from the argument itself or from the const/let/var declaration that binds it, each
 *     tagged computed: true
 *   - an argument yielding no integer is listed on the result's `opaque` array
 */
export function exitSites(text) {
  const sites = [];
  const opaque = [];
  for (const { arg, line } of exitCalls(text)) {
    if (/^-?\d+$/.test(arg)) { sites.push({ code: Number(arg), line, computed: false }); continue; }
    if (/^EXIT\.[A-Z_]+$/.test(arg)) continue;
    // A ternary chain whose every branch is an EXIT name is declared by construction. The
    // conditions may not contain `?` (optional chaining) - such an argument stays opaque.
    if (EXIT_TERNARY.test(arg)) continue;
    let exprs = [arg];
    if (/^[A-Za-z_$][\w$]*$/.test(arg)) {
      const decl = new RegExp('\\b(?:const|let|var)\\s+' + arg.replace(/\$/g, '\\$') + '\\s*=([^;]*);', 'g');
      exprs = [...text.matchAll(decl)].map((d) => d[1]);
    }
    const codes = [...new Set(exprs.flatMap(branchLiterals))];
    if (codes.length === 0) { opaque.push({ line, arg }); continue; }
    for (const code of codes) sites.push({ code, line, computed: true });
  }
  sites.opaque = opaque;
  return sites;
}

/**
 * Why a site fails the contract, or null. Any site fails when its code is undeclared and
 * not excused. A COMPUTED site also fails when it hides a code above FATAL: writing
 * EXIT.CONTENDED says what 3 means at the call site, while a bound ternary says nothing,
 * which is how a "paused" meaning shipped on the retry code. The owner either writes the
 * EXIT name or records the collision in KNOWN_COLLISIONS.
 */
export function judgeSite(site, base, collisions = KNOWN_COLLISIONS) {
  if (collisions.some((c) => c.script === base && c.code === site.code)) return null;
  if (nameOf(site.code) === null) {
    return `exits ${site.code}, which scripts/lib/exit-codes.mjs does not name.`;
  }
  if (site.computed && site.code > EXIT.FATAL) {
    return `exits ${site.code} through a computed value, so its meaning is invisible at the call site; ` +
      `write EXIT.${nameOf(site.code)} directly if it means "${MEANINGS[site.code]}", otherwise record it in KNOWN_COLLISIONS.`;
  }
  return null;
}

/**
 * Ledger entries that excuse a code their script no longer exits with (or a script that is
 * gone). The ledger is debt that may only shrink, and an entry outliving its site is the
 * one way it grows quietly: it would go on excusing the next code-3 meaning added there.
 * `scanned` is [{ base, sites }] for every file the gate read.
 */
export function staleCollisions(scanned, collisions = KNOWN_COLLISIONS) {
  return collisions
    .filter((c) => !scanned.some(({ base, sites }) => base === c.script && sites.some((s) => s.code === c.code)))
    .map((c) => ({
      script: c.script,
      code: c.code,
      why: `KNOWN_COLLISIONS excuses ${c.script} exiting ${c.code}, and no exit site in the scanned scripts yields it; ` +
        'remove the entry (the debt is paid) or restore the site it describes.',
    }));
}

function mjsFilesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.mjs'))
    .map((e) => path.join(dir, e.name));
}

// ---------------------------------------------------------------- self-assertion
function selfAssert() {
  // Built by concatenation on purpose: written as a literal, these fixtures would be real
  // exit sites in this file and the scan below would report its own scaffolding.
  const call = 'process.' + 'exit';

  const found = exitSites(`if (bad) ${call}(97);\n`);
  if (found.length !== 1 || found[0].code !== 97) {
    console.error('FATAL: the detector failed its own planted positive.');
    console.error(`  expected one site with code 97, got ${JSON.stringify(found)}`);
    return false;
  }
  if (nameOf(97) !== null) {
    console.error('FATAL: nameOf() claims 97 is declared; the declaration is not what this gate thinks.');
    return false;
  }

  // The computed shape: a const-bound ternary carrying a meaning the call site never states.
  const computed = exitSites(`const exit = ok ? 0 : paused ? 3 : 1;\n${call}(exit);\n`);
  const codes = computed.map((x) => x.code).sort().join(',');
  const flagged = computed.filter((x) => judgeSite(x, 'planted.mjs', []) !== null).map((x) => x.code).join(',');
  if (codes !== '0,1,3' || flagged !== '3') {
    console.error('FATAL: the detector failed its own planted computed exit (a const-bound ternary yielding 3).');
    console.error(`  expected codes 0,1,3 with only 3 flagged, got codes ${codes}, flagged ${flagged}`);
    return false;
  }
  return true;
}

function main() {
  if (!selfAssert()) return EXIT.FATAL;

  // -------------------------------------------------------------- read the tree
  const files = [...mjsFilesIn(SCRIPTS), ...mjsFilesIn(path.join(SCRIPTS, 'lib'))];
  if (files.length === 0) {
    console.error(`FATAL: no .mjs files under ${path.relative(ROOT, SCRIPTS)} - reporting nothing is not finding nothing.`);
    return EXIT.FATAL;
  }

  const findings = [];
  const byCode = new Map();
  let sites = 0;
  let computedSites = 0;
  let opaqueSites = 0;
  const scanned = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const base = path.basename(file);
    const found = exitSites(fs.readFileSync(file, 'utf8'));
    scanned.push({ base, sites: found });
    opaqueSites += found.opaque.length;
    for (const site of found) {
      sites++;
      if (site.computed) computedSites++;
      byCode.set(site.code, (byCode.get(site.code) ?? 0) + 1);
      const why = judgeSite(site, base);
      if (why !== null) findings.push({ rel, line: site.line, why });
    }
  }
  for (const s of staleCollisions(scanned)) findings.push({ rel: 'scripts/lib/exit-codes.mjs', line: 'KNOWN_COLLISIONS', why: s.why });

  // -------------------------------------------------------------- report
  console.log(`check-exit-contract - ${sites} exit site(s) across ${files.length} script(s)`);
  for (const code of [...byCode.keys()].sort((a, b) => a - b)) {
    const label = nameOf(code) ? `${nameOf(code)} - ${MEANINGS[code]}` : 'UNDECLARED';
    console.log(`  ${String(code).padStart(3)}  x${String(byCode.get(code)).padStart(3)}  ${label}`);
  }
  console.log(`  ${computedSites} of those site(s) are computed (resolved from a ternary or a const binding);`);
  console.log(`  ${opaqueSites} further exit argument(s) yield no integer in the text and are not evaluated.`);

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
    return EXIT.OK;
  }

  console.error(`\nexit contract FAILED - ${findings.length} site(s):`);
  for (const f of findings) console.error(`  - ${f.rel}:${f.line} ${f.why}`);
  console.error('\nAdd a name to EXIT in scripts/lib/exit-codes.mjs, or reuse a declared code.');
  console.error('If the meaning genuinely collides with a code already owned, record it in KNOWN_COLLISIONS with its conflict.');
  return EXIT.VIOLATIONS;
}

// Importable for tests; runs only when invoked as the script.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
