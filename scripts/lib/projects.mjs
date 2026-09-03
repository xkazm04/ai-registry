/**
 * projects — the one place that answers "where is project X on this machine?"
 *
 * ## Why this exists
 *
 * The fleet bridge used to be a single gitignored `.projects.local.json` holding
 * absolute paths. Hiding it was the wrong fix for the right problem: the paths
 * were machine-specific, so the whole declaration went unpublished — including
 * the parts that are not machine-specific at all and that a second machine, a
 * reviewer, or a fresh clone genuinely needs.
 *
 * Seven scripts then each opened that file themselves. Nothing enforced the
 * shape, and a field one of them required could be absent everywhere else
 * without anything saying so. That is exactly how the `domains` bug happened:
 * the bridge carried a `domains` array that duplicated what every project
 * already declares in its own manifest, this machine's copy never filled it in,
 * and `build-registry-map.mjs` skipped all seven projects and wrote nothing —
 * a SILENT no-op. The map looked current because nothing had rewritten it.
 *
 * ## The split
 *
 * - `projects.json` — COMMITTED. Per project, a `checkouts` map from MACHINE to
 *   the path that project sits at on that machine, relative to that machine's
 *   root. Portable by construction: no user names, no drive letters, no
 *   absolute anything.
 * - `.machine.local.json` — GITIGNORED, and the only machine-specific file
 *   left: which machine this is (`Fox`, `Wolf`, …), the root the relative paths
 *   hang off, the contributor id, and an optional `overrides` map for a
 *   checkout that cannot be expressed relative to that root (another drive).
 *
 * **One project, several machines, a DIFFERENT path on each.** That is the whole
 * point of `checkouts` being a map rather than one path plus exceptions: the
 * keys are the machines the project exists on, each carries its own path, and a
 * machine absent from the map simply resolves nothing for that slug rather than
 * erroring. Adding a machine is adding one key.
 *
 * ## Where domains come from, and why not from here
 *
 * They come from the project's own `.ai/manifest.yaml` (`knowledge.domains`),
 * which is committed IN THAT PROJECT and is the only authority on what governs
 * it. The registry does not get a second opinion, because two copies of a fact
 * is how the first one went stale. If the checkout is not on this machine there
 * are no domains to read, and there is also nothing to scan — the project is
 * skipped, loudly, by the caller.
 */

import fs from 'node:fs';
import path from 'node:path';

const MACHINE_FILE = '.machine.local.json';
const FLEET_FILE = 'projects.json';
const LEGACY_FILE = '.projects.local.json';

const readJson = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
};

/**
 * `knowledge.domains` out of a project's manifest.
 *
 * Deliberately a regex and not a YAML parser: this repository ships zero
 * dependencies, the field is a flow sequence on one line by convention, and a
 * miss here is visible immediately (the caller reports the project as having no
 * domains) rather than silently wrong.
 */
export function domainsOf(checkout) {
  const manifest = path.join(checkout, '.ai', 'manifest.yaml');
  let text;
  try { text = fs.readFileSync(manifest, 'utf8'); } catch { return []; }
  const m = text.match(/^\s*domains:\s*\[([^\]]*)\]/m);
  if (!m) return [];
  return m[1].split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Resolve the fleet for THIS machine.
 *
 * Returns the same shape every caller already expected — `{ contributor,
 * projects: { slug: { path, domains, … } } }` with `path` absolute — so the
 * migration is a change of source, not a change of contract.
 *
 * `problems` is never thrown: a missing machine file or an un-cloned project is
 * a normal state on a fresh machine, and the caller decides whether it is fatal.
 */
export function loadFleet(root = process.cwd()) {
  const problems = [];
  const machineCfg = readJson(path.join(root, MACHINE_FILE));
  const fleetCfg = readJson(path.join(root, FLEET_FILE));

  // Legacy: a machine that has not migrated yet still holds the old bridge.
  // Honour it rather than breaking the other box mid-flight.
  if (!machineCfg || !fleetCfg) {
    const legacy = readJson(path.join(root, LEGACY_FILE));
    if (legacy) {
      const projects = {};
      for (const [slug, p] of Object.entries(legacy.projects ?? {})) {
        if (!p?.path) continue;
        const abs = path.resolve(p.path);
        projects[slug] = {
          slug,
          path: abs,
          exists: fs.existsSync(abs),
          domains: p.domains?.length ? p.domains : domainsOf(abs),
        };
      }
      return {
        machine: legacy.machine ?? null,
        contributor: legacy.contributor ?? null,
        projects,
        source: LEGACY_FILE,
        legacy: true,
        problems: [`${LEGACY_FILE} is the legacy bridge — migrate to ${FLEET_FILE} + ${MACHINE_FILE}`],
      };
    }
    if (!machineCfg) problems.push(`no ${MACHINE_FILE} at the registry root — this machine has no identity`);
    if (!fleetCfg) problems.push(`no ${FLEET_FILE} at the registry root`);
    return { machine: null, contributor: null, projects: {}, source: null, legacy: false, problems };
  }

  const machine = machineCfg.machine ?? null;
  // The root lives in the COMMITTED file, per machine, so projects.json alone resolves
  // a full path on every device (2026-09-02). The local file may still override it -
  // that is the escape hatch for a box whose root differs from the declared one.
  const base = machineCfg.root ?? fleetCfg.machines?.[machine]?.root ?? null;
  if (!machine) problems.push(`${MACHINE_FILE} declares no "machine" name`);
  if (!base) problems.push(`no root for machine "${machine}": declare machines.${machine}.root in ${FLEET_FILE} (or "root" in ${MACHINE_FILE})`);

  const overrides = machineCfg.overrides ?? {};
  const projects = {};
  for (const [slug, decl] of Object.entries(fleetCfg.projects ?? {})) {
    // A local override wins: it is how a machine declares a checkout that does
    // not sit under its root at all, without putting an absolute path in the
    // committed file.
    const override = overrides[slug];
    const rel = override ?? decl.checkouts?.[machine];
    // Absent from `checkouts` means "not on this machine". That is a normal
    // state, not a problem: the fleet is bigger than any one box.
    if (!rel) continue;
    const abs = override
      ? path.resolve(override)
      : base ? path.resolve(base, rel) : path.resolve(rel);
    const exists = fs.existsSync(abs);
    if (!exists) problems.push(`${slug}: checkout not found at ${rel}`);
    projects[slug] = {
      slug,
      path: abs,
      relPath: rel,
      machine,
      exists,
      // The project declares what governs it. See the header.
      domains: exists ? domainsOf(abs) : [],
    };
  }

  return {
    machine,
    contributor: machineCfg.contributor ?? null,
    projects,
    source: FLEET_FILE,
    legacy: false,
    problems,
  };
}

/**
 * Back-compat shim for the seven callers that used to `JSON.parse` the bridge
 * themselves. Same keys they read before: `projects` and `contributor`.
 */
export function loadBridge(root = process.cwd()) {
  const fleet = loadFleet(root);
  return { projects: fleet.projects, contributor: fleet.contributor, machine: fleet.machine, _fleet: fleet };
}
