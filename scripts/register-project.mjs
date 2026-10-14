#!/usr/bin/env node
/**
 * register-project - connect one product checkout to this registry, the three writes it takes.
 *
 * A project is connected when three things hold, and until now each was a hand edit:
 *
 *   1. projects.json declares its checkout for THIS machine (relative to the machine root),
 *      so every fleet script - leads, signals, the map builder - can find it;
 *   2. the project carries `.ai/manifest.yaml`, the only authority on which knowledge
 *      domains govern it (see scripts/lib/projects.mjs, "Where domains come from");
 *   3. `.ai/registry-map.json` exists, the join `/conform` fills in.
 *
 * This does exactly those, in that order, and nothing else. bp's registry lens proposes
 * "register the project" as a backlog item and lens-scan's execute runs this to land it.
 *
 * ## Refusals, all before the first write
 *
 * - The registry checkout has uncommitted changes. projects.json is shared, committed state;
 *   an edit landed beside another session's work gets committed as part of it, or lost. The
 *   refusal line is the one lens-scan's execute already prints for the same condition.
 * - The slug already points at a DIFFERENT checkout on this machine, or another slug already
 *   points at this one. Re-pointing a project is a decision, not a registration.
 * - The checkout sits outside the machine root. A relative path cannot express it, and an
 *   absolute one never goes in projects.json; that is what `.machine.local.json` overrides are for.
 *
 * Idempotent: an already-registered slug says so and moves on; an existing manifest is never
 * rewritten; an existing map is not rebuilt. A second run writes nothing.
 *
 *   node scripts/register-project.mjs --slug <s> --path <root> [--domains a,b] [--dry-run]
 *                                     [--registry <dir>]
 *
 * `--dry-run` prints every write it would make and runs nothing that writes. `--registry`
 * names the registry checkout to register into (a test's temp copy); it defaults to the one
 * this script sits in. Exit 0 registered (or already was); exit 2 refused or bad input, with
 * a one-line reason.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadFleet, domainsOf, portableCheckout, validatePublicFleet } from './lib/projects.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const DEFAULT_DOMAINS = ['software-engineering'];

class Refusal extends Error {}

const posix = (p) => p.split(path.sep).join('/');
const samePath = (a, b) => {
  const x = path.resolve(a);
  const y = path.resolve(b);
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
};

/**
 * Add `projects.<slug>.checkouts.<machine> = rel` to the fleet text.
 *
 * projects.json is written by JSON.stringify(_, null, 2) and nothing else, so a parse and a
 * re-serialise keeps its formatting and its key order: an existing project gains the machine
 * as its LAST checkout key, a new project is appended as the last project.
 */
export function addCheckout(text, { slug, machine, rel }) {
  const fleet = JSON.parse(text);
  if (!fleet.machines?.[machine]) throw new Refusal(`machine "${machine}" is not declared under "machines" in projects.json`);
  const projects = fleet.projects ?? {};
  const current = projects[slug]?.checkouts?.[machine];
  if (current === rel) return { text, changed: false };
  if (current) throw new Refusal(`${slug} already points at ${current} on ${machine}, not ${rel} - re-pointing is a decision, not a registration`);
  const other = Object.entries(projects).find(([s, p]) => s !== slug && p.checkouts?.[machine] === rel);
  if (other) throw new Refusal(`${rel} is already registered on ${machine} as "${other[0]}"`);
  if (projects[slug]) projects[slug].checkouts = { ...(projects[slug].checkouts ?? {}), [machine]: rel };
  else projects[slug] = { checkouts: { [machine]: rel } };
  fleet.projects = projects;
  return { text: `${JSON.stringify(fleet, null, 2)}\n`, changed: true };
}

/** The smallest manifest the fleet scripts read: schema, where the registry is, which domains govern. */
export function minimalManifest({ slug, registryLocal, domains, date }) {
  return [
    '# .ai/manifest.yaml - the agent-facing contract for this repo (ai-manifest spec). Written by',
    '# ai-registry/scripts/register-project.mjs as the minimum the fleet reads; add capability blocks',
    '# freely - unknown fields are ignored by readers.',
    'schema: ai-manifest',
    'schemaVersion: 0.1.0',
    `generatedAt: "${date}"`,
    '',
    'repo:',
    `  name: ${slug}`,
    '',
    '# The organization\'s AI registry - knowledge bundles this repo consumes and the skill',
    '# marketplace it installs from.',
    'registry:',
    '  remote: github:xkazm04/ai-registry',
    `  local: ${registryLocal}`,
    'knowledge:',
    `  domains: [${domains.join(', ')}]`,
    '',
    '# Shared skills this project uses, from the registry\'s skills/ lane. Empty until one is linked.',
    'skills: []',
    '',
  ].join('\n');
}

/**
 * This machine's name and root. projects.mjs resolves checkouts but does not hand back the
 * root it resolved them against, and registering is the one caller that needs it.
 */
function machineOf(registry) {
  const fleet = loadFleet(registry);
  let root = null;
  try { root = JSON.parse(fs.readFileSync(path.join(registry, '.machine.local.json'), 'utf8')).root ?? null; } catch { /* reported below */ }
  if (!fleet.machine || !root) throw new Refusal(`this registry checkout has no machine identity: ${fleet.problems.join('; ') || 'no root in .machine.local.json'}`);
  return { machine: fleet.machine, base: path.resolve(root), fleet };
}

/**
 * Where the manifest's `registry.local` should point: the registry's MAIN checkout. A worktree
 * (or a temp copy) is where this script may run, but it is gone tomorrow, and `/conform` reads
 * this path to find the corpus long after.
 */
function canonicalRegistry(registry) {
  try {
    const common = execFileSync('git', ['-C', registry, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (path.basename(common) === '.git') return path.dirname(path.resolve(common));
  } catch { /* not a git checkout: the directory itself */ }
  return registry;
}

function assertClean(registry) {
  let status;
  try { status = execFileSync('git', ['-C', registry, 'status', '--porcelain'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { throw new Refusal(`could not read the registry checkout's git status: ${e.message.split('\n')[0]}`); }
  if (status.trim()) throw new Refusal('register-project refused: registry checkout has uncommitted changes');
}

export function register({ slug, root, domains, dryRun = false, registry = ROOT, log = console.log }) {
  if (!SLUG_RE.test(slug ?? '')) throw new Refusal(`--slug must match ${SLUG_RE}, got "${slug ?? ''}"`);
  if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Refusal(`--path is not a directory: ${root ?? ''}`);
  for (const d of domains ?? []) {
    if (!fs.existsSync(path.join(registry, 'knowledge', d, 'index.json'))) throw new Refusal(`--domains names "${d}", which has no knowledge/${d}/index.json in this registry`);
  }
  const say = (s) => log(dryRun ? `[dry-run] ${s}` : s);
  if (!dryRun) assertClean(registry);
  else {
    // A dry run still says whether the real run would get past the first refusal.
    try { assertClean(registry); say('registry checkout: clean'); } catch (e) { say(`registry checkout: a real run would stop here - ${e.message}`); }
  }
  const { machine, base } = machineOf(registry);
  const rel = posix(path.relative(base, root));
  if (!portableCheckout(rel) || path.isAbsolute(rel)) throw new Refusal(`${root} is outside this machine's root (${base}); declare it as an override in .machine.local.json instead`);

  // 1. projects.json
  const fleetFile = path.join(registry, 'projects.json');
  const { text, changed } = addCheckout(fs.readFileSync(fleetFile, 'utf8'), { slug, machine, rel });
  if (!changed) say(`projects.json: ${slug} is already registered on ${machine} as ${rel}`);
  else {
    say(`projects.json: add projects.${slug}.checkouts.${machine} = "${rel}"`);
    if (!dryRun) fs.writeFileSync(fleetFile, text);
  }

  // 2. .ai/manifest.yaml - written into the PRODUCT, only when absent.
  const manifestFile = path.join(root, '.ai', 'manifest.yaml');
  if (fs.existsSync(manifestFile)) {
    const declared = domainsOf(root);
    say(`${posix(path.relative(root, manifestFile))}: present, not rewritten (domains: ${declared.join(', ') || 'none declared'})`);
    if (domains?.length && declared.join() !== domains.join()) log(`  note: --domains ${domains.join(',')} ignored - the project's own manifest is the authority`);
  } else {
    const manifest = minimalManifest({
      slug,
      registryLocal: posix(path.relative(root, canonicalRegistry(registry))) || '.',
      domains: domains?.length ? domains : DEFAULT_DOMAINS,
      date: new Date().toISOString().slice(0, 10),
    });
    say(`${manifestFile}: write (product repo)\n${manifest.replace(/^/gm, '  | ')}`);
    if (!dryRun) {
      fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
      fs.writeFileSync(manifestFile, manifest);
    }
  }

  // 3. the registry map - built only when the project has none.
  const mapFile = path.join(root, '.ai', 'registry-map.json');
  const build = [path.join(ROOT, 'scripts', 'build-registry-map.mjs'), '--project', slug, '--path', root];
  if (fs.existsSync(mapFile)) say(`.ai/registry-map.json: present, not rebuilt`);
  else if (dryRun) say(`.ai/registry-map.json: would run node ${posix(path.relative(ROOT, build[0]))} ${build.slice(1).join(' ')}`);
  else {
    log(`.ai/registry-map.json: node ${posix(path.relative(ROOT, build[0]))} ${build.slice(1).join(' ')}`);
    const r = spawnSync(process.execPath, build, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
    // The builder reports a skipped project as a problem and still exits 0; the file is the verdict.
    if (r.status !== 0 || !fs.existsSync(mapFile)) {
      throw new Refusal(`the registry map was not built (exit ${r.status}): ${(r.stderr || r.stdout).trim().split('\n').pop()}`);
    }
  }

  // 4. the fleet gate over what was written.
  const problems = validatePublicFleet(JSON.parse(fs.readFileSync(fleetFile, 'utf8')));
  if (samePath(registry, ROOT)) {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'check-projects.mjs')], { encoding: 'utf8' });
    log(`check-projects: exit ${r.status} - ${(r.stdout + r.stderr).trim()}`);
    if (r.status !== EXIT.OK) throw new Refusal('check-projects failed after registration');
  } else {
    log(`check-projects (in process, ${posix(fleetFile)}): ${problems.length} violation(s)`);
    if (problems.length) throw new Refusal(problems.join('; '));
  }
  return { machine, rel, fleetChanged: changed };
}

const isMain = process.argv[1] && samePath(process.argv[1], fileURLToPath(import.meta.url));
if (isMain) {
  const argv = process.argv.slice(2);
  const arg = (flag) => { const i = argv.indexOf(flag); return i === -1 ? null : argv[i + 1] ?? null; };
  try {
    register({
      slug: arg('--slug'),
      root: arg('--path') && path.resolve(arg('--path')),
      domains: arg('--domains')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null,
      dryRun: argv.includes('--dry-run'),
      registry: arg('--registry') ? path.resolve(arg('--registry')) : ROOT,
    });
    process.exitCode = EXIT.OK;
  } catch (e) {
    console.error(e instanceof Refusal ? e.message : `register-project: could not run: ${e.message}`);
    process.exitCode = EXIT.FATAL;
  }
}
