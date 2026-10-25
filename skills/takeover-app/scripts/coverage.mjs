#!/usr/bin/env node
// coverage - how much of an inherited repo the provisional context map can see (takeover-app P2, GATE 1).
//
// WHY: every later phase - the lens scans, the triage, the hardening batches - works context by context, so a source
// file no context claims is a file nothing will ever judge. On a vibecoded app the self-written map is the first
// thing an agent produces, and its blind spots are invisible unless counted: the gate shows the operator
// files-claimed / files-tracked per top-level root, and the uncovered directories, before anything is scanned.
//
//   node coverage.mjs --product-root <repo> [--map context-map.json] [--uncovered]
//     Tracked files (git ls-files) with a source extension, grouped by their first path segment (`.` for the root),
//     against the files the map's contexts claim (flat `contexts[]`, nested `groups[].contexts[]`, `ungrouped[]`;
//     `file_paths` / `filePaths`; a directory entry claims every file under it). Also counts dead paths: claimed entries that match no tracked file.
//     -> {map, totals: {tracked, claimed, pct, dead_paths}, roots: [{root, tracked, claimed, pct}], uncovered?: [dir...]}
//     exit 0 it ran; 2 it could not (no git, no map).
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
let EXIT;
try { ({ EXIT } = await import(pathToFileURL(resolve(HERE, '../../../scripts/lib/exit-codes.mjs')).href)); } catch { EXIT = Object.freeze({ OK: 0, VIOLATIONS: 1, FATAL: 2, CONTENDED: 3 }); }

export const SOURCE_EXT = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|py|cs|fs|vb|java|kt|kts|scala|go|rb|php|rs|swift|dart|ex|exs|sql|prisma|graphql|gql|css|scss|sass|less|html|razor|cshtml)$/i;
const norm = (p) => String(p).replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');

/**
 * Every context a map declares: flat v2 `contexts[]`, nested `groups[].contexts[]` (Vibeman's shape,
 * which adopt-bp phase 0 reads as v2) and `ungrouped[]`. Read as flat only, a nested map claimed
 * nothing and GATE 1 showed 0% for a repo that was fully mapped.
 */
export function mapContexts(map) {
  const list = (v) => (Array.isArray(v) ? v : []);
  return [...list(map?.contexts), ...list(map?.groups).flatMap((g) => list(g?.contexts)), ...list(map?.ungrouped)];
}

/** Pure: tracked file list + context map -> the coverage report. */
export function coverage(tracked, map, { uncovered = false } = {}) {
  const files = tracked.map(norm).filter((f) => SOURCE_EXT.test(f));
  const entries = [...new Set(mapContexts(map).flatMap((c) => c?.file_paths ?? c?.filePaths ?? []).map(norm).filter(Boolean))];
  const exact = new Set(entries);
  const dirs = entries.map((e) => `${e}/`);
  const isClaimed = (f) => exact.has(f) || dirs.some((d) => f.startsWith(d));
  const all = tracked.map(norm);
  const dead = entries.filter((e) => !all.some((f) => f === e || f.startsWith(`${e}/`))).length;
  const roots = new Map();
  const gaps = new Map();
  let claimed = 0;
  for (const f of files) {
    const root = f.includes('/') ? f.split('/')[0] : '.';
    if (!roots.has(root)) roots.set(root, { root, tracked: 0, claimed: 0 });
    const r = roots.get(root);
    r.tracked += 1;
    if (isClaimed(f)) { r.claimed += 1; claimed += 1; } else {
      const d = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '.';
      gaps.set(d, (gaps.get(d) ?? 0) + 1);
    }
  }
  const pct = (c, t) => (t ? Math.round((1000 * c) / t) / 10 : 0);
  const out = {
    totals: { tracked: files.length, claimed, pct: pct(claimed, files.length), dead_paths: dead },
    roots: [...roots.values()].map((r) => ({ ...r, pct: pct(r.claimed, r.tracked) })).sort((a, b) => b.tracked - a.tracked),
  };
  if (uncovered) out.uncovered = [...gaps.entries()].sort((a, b) => b[1] - a[1]).map(([dir, n]) => ({ dir, files: n }));
  return out;
}

function isEntry(argv1, url) {
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}
if (process.argv[1] && isEntry(process.argv[1], import.meta.url)) {
  const argv = process.argv.slice(2);
  const flag = (k) => { const i = argv.indexOf(k); return i === -1 ? undefined : argv[i + 1]; };
  const die = (m) => { process.stderr.write(`coverage: ${m}\n`); process.exit(EXIT.FATAL); };
  const root = resolve(flag('--product-root') ?? process.cwd());
  const mapPath = resolve(root, flag('--map') ?? 'context-map.json');
  if (!existsSync(mapPath)) die(`no context map at ${mapPath} - write one first (P2)`);
  let map;
  try { map = JSON.parse(readFileSync(mapPath, 'utf8')); } catch (e) { die(`${mapPath} is not readable JSON (${e.message})`); }
  const git = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (git.status !== 0) die(`git ls-files failed in ${root}: ${String(git.stderr).trim()}`);
  const out = coverage(git.stdout.split('\0').filter(Boolean), map, { uncovered: argv.includes('--uncovered') });
  process.stdout.write(`${JSON.stringify({ map: mapPath.slice(root.length + 1).replace(/\\/g, '/'), ...out }, null, 2)}\n`);
  process.exit(EXIT.OK);
}
