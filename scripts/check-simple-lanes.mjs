#!/usr/bin/env node
/**
 * check-simple-lanes - the gate for the two lanes whose whole contract is a file name and a
 * frontmatter block: `practices/<slug>/PRACTICE.md` and `memory/<kind>/<slug>.md`.
 *
 * Why this exists: build-catalog publishes these lanes by NAME. It reads
 * `practices/<slug>/PRACTICE.md` and `memory/<kind>/*.md` and nothing else, so a note saved
 * as `practice.md`, `x.MD`, `x.markdown` or under a dot-directory is not rejected anywhere -
 * it is simply never published, and every reader concludes the lane is smaller than its
 * author thinks. The 2026-10-25 gates probe planted exactly those names and this walker
 * skipped every one of them in silence (exit 0). A gate that only validates the names it
 * already recognises reports the same "clean" whether the lane is clean or half of it is
 * invisible, so an unrecognised name is a violation here, never a skip.
 *
 * The shape, closed:
 *   practices/<slug>/PRACTICE.md       every slug directory holds exactly this note
 *   practices/<slug>/starter/**        template content copied into a consumer; anything
 *                                      goes inside it, dot-folders (.github) included,
 *                                      except a PRACTICE.md (that would be a second note)
 *   memory/_index.md                   the lane's own index - the one listed exception
 *   memory/<kind>/<slug>.md            every other file under memory/
 * No dot-entry anywhere outside a starter/, and no symlink anywhere.
 *
 * Usage:
 *   node scripts/check-simple-lanes.mjs                 # this registry's lanes
 *   node scripts/check-simple-lanes.mjs --root <dir>    # another registry root (fixtures)
 *
 * Exits 0 clean, 1 on violations, 2 when it could not run (a missing or empty lane).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateNote } from './lib/simple-lanes.mjs';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { requirePopulation } from './lib/check-result.mjs';

/** Files under memory/ that are not notes and are allowed anyway. Relative to memory/. */
export const MEMORY_EXCEPTIONS = new Set(['_index.md']);

/**
 * Walk both lanes under `root`. Returns { count, failures, fatal } - `fatal` is a reason
 * string when a lane could not be walked or held nothing, else null.
 */
export function checkLanes(root) {
  const failures = [];
  let count = 0;
  for (const lane of ['practices', 'memory']) {
    let laneCount = 0;
    const visit = (dir, relative = '') => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = relative ? `${relative}/${e.name}` : e.name;
        const file = path.join(dir, e.name);
        const parts = rel.split('/');
        const inStarter = lane === 'practices' && parts.length > 2 && parts[1] === 'starter';
        if (e.isSymbolicLink()) { failures.push(`${lane}/${rel}: symlinks are not published notes`); continue; }
        if (e.name.startsWith('.') && !inStarter) {
          failures.push(`${lane}/${rel}: a dot-entry is invisible to the catalog - rename or remove it`);
          continue;
        }
        if (e.isDirectory()) {
          if (lane === 'practices' && parts.length === 1 && !fs.existsSync(path.join(file, 'PRACTICE.md'))) {
            failures.push(`${lane}/${rel}: a practice directory must hold PRACTICE.md (exact case)`);
          }
          visit(file, rel);
          continue;
        }
        if (lane === 'practices') {
          if (e.name !== 'PRACTICE.md') {
            if (!inStarter) failures.push(`${lane}/${rel}: not part of the practice shape - expected <slug>/PRACTICE.md or <slug>/starter/**`);
            continue;
          }
        } else {
          if (MEMORY_EXCEPTIONS.has(rel)) continue;
          if (!e.name.endsWith('.md')) {
            failures.push(`${lane}/${rel}: not a memory note - every file under memory/ is <kind>/<slug>.md`);
            continue;
          }
        }
        const raw = fs.readFileSync(file, 'utf8');
        laneCount++; count++;
        for (const p of validateNote(lane, rel, raw)) failures.push(`${lane}/${rel}: ${p}`);
        if (lane === 'practices') {
          for (const m of raw.matchAll(/\]\((starter\/[^)#]+)(?:#[^)]*)?\)/g)) {
            const target = path.resolve(dir, m[1]);
            const within = path.relative(dir, target);
            if (within.startsWith('..') || path.isAbsolute(within) || !fs.existsSync(target)) failures.push(`${lane}/${rel}: unresolved starter ${m[1]}`);
          }
        }
      }
    };
    try { visit(path.join(root, lane)); } catch (error) { return { count, failures, fatal: `${lane}: ${error.message}` }; }
    const floor = requirePopulation(laneCount, `${lane} notes`);
    if (floor.code !== EXIT.OK) return { count, failures, fatal: `${lane}: ${floor.reason}` };
  }
  return { count, failures, fatal: null };
}

function main() {
  installCrashDoor();
  const argv = process.argv.slice(2);
  const usage = 'usage: node scripts/check-simple-lanes.mjs [--root <dir>] [--help]';
  if (argv.includes('--help') || argv.includes('-h')) { console.log(usage); return; }
  const rootIdx = argv.indexOf('--root');
  if (rootIdx !== -1 && (!argv[rootIdx + 1] || argv[rootIdx + 1].startsWith('--'))) {
    console.error('simple-lanes FATAL: --root needs a directory');
    process.exitCode = EXIT.FATAL;
    return;
  }
  // A closed flag set: any other argument used to be ignored and the run checked this
  // registry's lanes anyway, exiting as if the caller had been heard.
  const unknown = argv.find((a, i) => a !== '--root' && !(rootIdx !== -1 && i === rootIdx + 1));
  if (unknown !== undefined) {
    console.error(`simple-lanes FATAL: unknown argument ${JSON.stringify(unknown)}; nothing was checked.\n${usage}`);
    process.exitCode = EXIT.FATAL;
    return;
  }
  const root = rootIdx === -1 ? fileURLToPath(new URL('../', import.meta.url)) : path.resolve(argv[rootIdx + 1]);
  const { count, failures, fatal } = checkLanes(root);
  if (fatal) {
    console.error(`simple-lanes FATAL: ${fatal}`);
    process.exitCode = EXIT.FATAL;
    return;
  }
  for (const failure of failures) console.error(failure);
  console.log(`practice and memory contracts: ${count} notes; ${failures.length} violations`);
  process.exitCode = failures.length ? EXIT.VIOLATIONS : EXIT.OK;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
