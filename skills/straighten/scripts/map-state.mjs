#!/usr/bin/env node
/**
 * map-state - the two instruments /straighten runs inside a project before it commits.
 *
 *   node map-state.mjs classify --checkout <dir> --slug <slug> --scratch <dir> [--registry <dir>]
 *   node map-state.mjs verify-merge --checkout <dir> --runs a.json,b.json [--registry <dir>]
 *
 * `classify` answers "may this run commit the project's modified .ai/registry-map.json?":
 *   clean           - the map matches HEAD; nothing to decide
 *   current         - modified only in generatedAt/projectSha; restore it, nothing to commit
 *   generator-dirty - equal to a rebuild from HEAD inputs (or differs only in generator-owned
 *                     fields): rebuild and commit with the single-path commit
 *   dirty           - a judgement field differs, or the inputs are uncommitted: never commit
 * It rebuilds into `--scratch` only (`build-registry-map.mjs --out`, seeded with HEAD's map so
 * the previous verdicts are HEAD's), never into the project. It also reports the map's
 * `git ls-files --eol` row and whether a commit would rewrite every line.
 *
 * `verify-merge` is the conform 1.8.2 check after merge-conform-runs: every row the wave's run
 * files judged carries the subject digest and evaluatedRevision, stale cleared.
 *
 * Prints one JSON document. Exit 0 = ran (classify) / check passed (verify-merge);
 * 1 = verify-merge found rows without the stamps; 2 = could not run.
 * The decisions live in map-compare.mjs, which the tests import.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { classifyMap, parseMapText, parseLsFilesEol, eolHazard, subjectIndex, verifyMerged } from './map-compare.mjs';

const OK = 0, VIOLATIONS = 1, FATAL = 2;
const MAP = '.ai/registry-map.json';
const CONTEXT_MAP = 'context-map.json';

const git = (checkout, args) => {
  try { return { ok: true, out: execFileSync('git', ['-C', checkout, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024,
    // A status must not take index.lock in a checkout other sessions are committing in.
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  }) }; }
  catch (e) { return { ok: false, out: String(e.stdout || ''), err: String(e.stderr || e.message) }; }
};

function registryRoot(explicit) {
  if (explicit) return path.resolve(explicit);
  if (process.env.AI_REGISTRY_DIR) return path.resolve(process.env.AI_REGISTRY_DIR);
  // skills/straighten/scripts -> the registry checkout this skill lives in (realpath: a linked install)
  return path.resolve(path.dirname(fs.realpathSync(fileURLToPath(import.meta.url))), '..', '..', '..');
}

function eolOf(checkout) {
  const row = git(checkout, ['ls-files', '--eol', '--', MAP]);
  const eol = row.ok ? parseLsFilesEol(row.out.split('\n')[0]) : null;
  const autocrlf = git(checkout, ['config', 'core.autocrlf']).out.trim() || null;
  return { eol, autocrlf, hazard: eolHazard(eol, autocrlf) };
}

function classify({ checkout, slug, scratch, registry }) {
  if (!checkout || !slug || !scratch) throw new Error('classify needs --checkout, --slug and --scratch');
  const root = path.resolve(checkout);
  const mapAbs = path.join(root, MAP);
  if (!fs.existsSync(mapAbs)) return { slug, class: 'missing', reason: `no ${MAP} in the checkout` };
  const status = git(root, ['status', '--porcelain', '--', MAP]);
  if (!status.ok) throw new Error(`git status failed in ${slug}: ${status.err}`);
  const eol = eolOf(root);
  const line = status.out.split('\n').find(Boolean) || '';
  if (!line) return { slug, class: 'clean', reason: 'the map matches HEAD', ...eol };
  // Staged by somebody: the index already holds a version HEAD does not - their commit in waiting.
  if (!line.startsWith('??') && line[0] !== ' ') {
    return { slug, class: 'dirty', reason: `the map is staged (${line.slice(0, 2)}) - another session's commit in waiting`, ...eol };
  }

  // A map built from an uncommitted context map describes inputs HEAD does not hold.
  const cm = git(root, ['status', '--porcelain', '--', CONTEXT_MAP]).out.split('\n').find(Boolean) || '';
  if (cm && !cm.startsWith('??')) {
    return { slug, class: 'dirty', reason: `${CONTEXT_MAP} has uncommitted changes (${cm.slice(0, 2).trim()}) - the map's inputs are not at HEAD`, ...eol };
  }

  const working = parseMapText(fs.readFileSync(mapAbs, 'utf8'));
  const headText = line.startsWith('??') ? null : git(root, ['show', `HEAD:${MAP}`]);
  const head = headText?.ok ? parseMapText(headText.out) : null;

  let rebuilt = null;
  let rebuild = null;
  if (head) {
    fs.mkdirSync(scratch, { recursive: true });
    const out = path.join(path.resolve(scratch), `${slug}.head-rebuild.json`);
    // Seed the --out file with HEAD's map: the builder reads its previous map from an
    // existing --out file, so the verdicts it carries are exactly the committed ones.
    fs.writeFileSync(out, headText.out);
    const r = spawnSync(process.execPath, [path.join(registry, 'scripts', 'build-registry-map.mjs'), '--project', slug, '--out', out], { encoding: 'utf8' });
    rebuild = { out, exit: r.status };
    // The builder exits 1 when the map it replaced was stale - a finding, not a failure.
    if (r.status === 0 || r.status === 1) rebuilt = parseMapText(fs.readFileSync(out, 'utf8'));
    else rebuild.error = (r.stderr || r.stdout || '').trim().split('\n').slice(-3).join(' | ');
  }
  const verdict = classifyMap({ working, rebuilt, head });
  return { slug, ...verdict, diffs: verdict.diffs.slice(0, 25), diffCount: verdict.diffs.length, rebuild, ...eol };
}

function verifyMerge({ checkout, runs, registry }) {
  if (!checkout || !runs) throw new Error('verify-merge needs --checkout and --runs');
  const root = path.resolve(checkout);
  const map = parseMapText(fs.readFileSync(path.join(root, MAP), 'utf8'));
  const indexes = {};
  for (const bundle of Object.keys(map.bundleDigests || {})) {
    const p = path.join(registry, 'knowledge', bundle, 'index.json');
    if (fs.existsSync(p)) indexes[bundle] = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  const runPairs = [];
  const files = [];
  for (const name of runs.split(',').map((s) => s.trim()).filter(Boolean)) {
    const candidates = [path.join(root, '.ai', 'conform-runs', 'merged', name), path.join(root, '.ai', 'conform-runs', name)];
    const found = candidates.find((c) => fs.existsSync(c));
    if (!found) { files.push({ name, status: 'missing' }); continue; }
    const run = parseMapText(fs.readFileSync(found, 'utf8'));
    files.push({ name, status: found.includes(`${path.sep}merged${path.sep}`) ? 'merged' : 'pending', pairs: (run.pairs || []).length });
    runPairs.push(...(run.pairs || []));
  }
  return { files, ...verifyMerged({ map, index: subjectIndex(indexes), runPairs }) };
}

function main(argv) {
  const [cmd, ...rest] = argv;
  const opt = {};
  for (let i = 0; i < rest.length; i++) {
    const m = /^--(checkout|slug|scratch|registry|runs)$/.exec(rest[i]);
    if (!m) { console.error(`map-state: unknown argument ${rest[i]}`); return FATAL; }
    opt[m[1]] = rest[++i];
  }
  opt.registry = registryRoot(opt.registry);
  try {
    if (cmd === 'classify') { console.log(JSON.stringify(classify(opt), null, 2)); return OK; }
    if (cmd === 'verify-merge') { const r = verifyMerge(opt); console.log(JSON.stringify(r, null, 2)); return r.pass ? OK : VIOLATIONS; }
    console.error('usage: map-state.mjs classify --checkout <dir> --slug <slug> --scratch <dir> | verify-merge --checkout <dir> --runs a.json,b.json');
    return FATAL;
  } catch (e) {
    console.error(`map-state: ${e.message}`);
    return FATAL;
  }
}

const self = fs.realpathSync(fileURLToPath(import.meta.url));
const invoked = process.argv[1] ? (() => { try { return fs.realpathSync(path.resolve(process.argv[1])); } catch { return null; } })() : null;
if (invoked === self) process.exitCode = main(process.argv.slice(2));
