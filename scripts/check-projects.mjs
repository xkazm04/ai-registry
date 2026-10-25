#!/usr/bin/env node
/**
 * check-projects - the gate for projects.json, the committed half of the fleet declaration.
 *
 * projects.json is published; .machine.local.json is not (scripts/lib/projects.mjs holds
 * the split). Two things keep the published half portable:
 *
 * 1. Shape, via validatePublicFleet: schema 2, no `root` on a machine, every checkout a
 *    relative path that stays inside its machine's root.
 *
 * 2. Free text. The shape check looks at `checkouts` and `root` and nothing else, so a
 *    machine's `note`, a `home` key, a project's `path`, or the file's own `_note` could
 *    carry `C:\Users\<name>\...` and pass (measured 2026-10-25). Every string in the file,
 *    keys included, now goes through the FREE_TEXT preset of scripts/lib/leaks.mjs, the
 *    one table every leak gate shares: no absolute path of any kind, no home anchor
 *    (`~/`, `$HOME`, `%USERPROFILE%`), no email. The scanner is asserted against its own
 *    controls first - a dead must-not-match scan reads as a clean file.
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 clean, 1 violations, 2 could not run
 * (projects.json missing or unparseable, or the scanner broken).
 *
 * Usage:  node scripts/check-projects.mjs [--root <registry root>]   (--root: tests)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePublicFleet } from './lib/projects.mjs';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { leaksIn, assertScanner, PRESETS } from './lib/leaks.mjs';

installCrashDoor();

const LEAK_FORMS = PRESETS.FREE_TEXT;

/** Every string in a JSON value, keys included, with the JSON path it sits at. */
function* strings(value, at = '$') {
  if (typeof value === 'string') { yield [at, value]; return; }
  if (Array.isArray(value)) { for (const [i, v] of value.entries()) yield* strings(v, `${at}[${i}]`); return; }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const here = `${at}.${k}`;
      yield [`${here} (key)`, k];
      yield* strings(v, here);
    }
  }
}

function main() {
  const argv = process.argv.slice(2);
  const at = argv.indexOf('--root');
  if (at !== -1 && !argv[at + 1]) throw new Error('--root needs a directory');
  const root = at !== -1 ? path.resolve(argv[at + 1]) : path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
  assertScanner(LEAK_FORMS);
  const fleet = JSON.parse(fs.readFileSync(path.join(root, 'projects.json'), 'utf8'));
  const problems = validatePublicFleet(fleet);
  for (const [where, text] of strings(fleet)) {
    for (const hit of leaksIn(text, LEAK_FORMS)) {
      problems.push(`${where}: contains ${hit.what} (${JSON.stringify(hit.match.slice(0, 60))}) - absolute roots belong in .machine.local.json`);
    }
  }
  for (const problem of problems) console.error(problem);
  console.log(`projects: ${Object.keys(fleet.projects ?? {}).length} declarations, ${problems.length} violations`);
  process.exitCode = problems.length ? EXIT.VIOLATIONS : EXIT.OK;
}

try { main(); } catch (error) { console.error(`FATAL: ${error.message}`); process.exitCode = EXIT.FATAL; }
