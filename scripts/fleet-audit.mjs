#!/usr/bin/env node
/**
 * fleet-audit — the OPERATOR-SIDE instrument for the skills lane.
 *
 * The registry cannot see any installation, so its gate (check-skills.mjs) cannot
 * answer the question that actually matters to a fleet: WHICH copy of a skill runs in
 * each repository, and is it the one the registry holds? This script runs where the
 * installations are — on the operator's machine, reading the gitignored
 * committed `projects.json` + local `.machine.local.json` fleet config — and reports, per lane skill:
 *
 *   - which connected projects hold a copy under `.claude/skills/<name>/`, at which
 *     version, and whether it is `in_sync` (same content), `stale` (older version),
 *     `ahead` (newer version than the lane), or `diverged` (same version, different
 *     bytes) against the lane;
 *   - whether the PERSONAL tier (`~/.claude/skills/<name>`) holds the name. This is the
 *     load-bearing check: the reference harness resolves a same-named skill PERSONAL over
 *     PROJECT, so a personal copy silently shadows every project copy in the fleet. The
 *     lane's rule is one home per name (docs/skills-lane.md, "Resolution").
 *   - which projects ENABLE the skill as a plugin (`.claude/settings.json` ->
 *     enabledPlugins["<name>@ai-registry"]) — the reviewable adoption record.
 *
 * And per project: bare `.claude/skills/<name>.md` files (never loaded by the harness —
 * dead weight that reads as installed), lowercase `skill.md` (works only on a
 * case-insensitive disk), and whether the project carries a registry pointer
 * (`.ai/manifest.yaml` with a `registry:` block).
 *
 * `--write-adopters` rewrites each catalog skill's `adopters` list from what it found
 * (`<slug>@<version>` for copies, `<slug>@plugin:<version>` for plugin enablement) —
 * public-safe, because project slugs are already published in librarian/projects.md.
 * Everything else is a report. `--json` for machines.
 *
 * Zero dependencies. Paths never leave this machine: the report prints slugs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readLane, readSkill, parseFrontmatter, parseSemver, cmpSemver, contentDigest } from './lib/skills-lane.mjs';
import { loadBridge } from './lib/projects.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const CATALOG = path.join(ROOT, 'catalog.json');
const LANE = path.join(ROOT, 'skills');
const MARKETPLACE = 'ai-registry';
const json = process.argv.includes('--json');
const writeAdopters = process.argv.includes('--write-adopters');

const fleet = loadBridge(ROOT)._fleet;
if (!fleet.machine && !Object.keys(fleet.projects).length) {
  console.error('FATAL: this machine has no resolvable fleet.');
  for (const p of fleet.problems) console.error(`  - ${p}`);
  console.error('  Expected a committed projects.json plus a local .machine.local.json (see librarian/projects.md).');
  process.exit(2);
}
const bridge = fleet;
const projects = Object.entries(bridge.projects ?? {}).filter(([, p]) => p && p.path);
if (projects.length === 0) { console.error('FATAL: the bridge lists zero projects — nothing to audit, refusing to report a clean fleet.'); process.exit(2); }

const lane = readLane(LANE).filter((s) => s.exists && s.fm?.name);
const laneByName = new Map(lane.map((s) => [s.name, s]));
const personalDir = path.join(os.homedir(), '.claude', 'skills');

const laneReal = fs.realpathSync(LANE);
/** A linked entry resolves into the lane: that is not a copy, it is THE file. */
const isLaneLink = (dir) => {
  try {
    const st = fs.lstatSync(dir);
    const real = fs.realpathSync(dir);
    if (!st.isSymbolicLink() && path.resolve(real) === path.resolve(dir)) return false;
    return path.resolve(real).startsWith(path.resolve(laneReal));
  } catch { return false; }
};

const readCopy = (dir) => {
  // A copy in an installation: `<dir>/SKILL.md` (or a lowercase skill.md, which we flag).
  const upper = path.join(dir, 'SKILL.md');
  const lower = path.join(dir, 'skill.md');
  const real = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const hasUpper = real.includes('SKILL.md');
  const hasLower = !hasUpper && real.includes('skill.md');
  const file = hasUpper ? upper : hasLower ? lower : null;
  if (!file) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const fm = parseFrontmatter(raw)?.fm ?? {};
  return { version: fm.version ? String(fm.version) : null, hash: contentDigest(raw), lowercase: hasLower };
};
const toSemver = (v) => {
  if (!v) return null;
  const p = String(v).split('.').map((x) => parseInt(x, 10));
  while (p.length < 3) p.push(0);
  return p.every(Number.isFinite) ? p.slice(0, 3) : null;
};
const verdict = (laneSkill, copy) => {
  if (!copy) return null;
  if (copy.hash === laneSkill.contentHash) return 'in_sync';
  const a = toSemver(copy.version), b = parseSemver(laneSkill.fm.version);
  if (!a || !b) return 'diverged';
  const c = cmpSemver(a, b);
  return c < 0 ? 'stale' : c > 0 ? 'ahead' : 'diverged';
};

const report = { generatedAt: new Date().toISOString(), lane: lane.length, projects: {}, skills: {}, personalShadows: [], summary: {} };
for (const s of lane) report.skills[s.name] = { version: s.fm.version, copies: {}, links: [], plugins: [], personal: null };

// Personal tier.
const personal = fs.existsSync(personalDir) ? fs.readdirSync(personalDir, { withFileTypes: true }) : [];
for (const e of personal) {
  const name = e.isDirectory() ? e.name : e.name.replace(/\.md$/, '');
  if (!laneByName.has(name)) continue;
  const copy = e.isDirectory() ? readCopy(path.join(personalDir, e.name)) : { version: null, hash: null, bare: true };
  const v = e.isDirectory() ? verdict(laneByName.get(name), copy) : 'bare-file';
  report.skills[name].personal = { ...copy, verdict: v };
  report.personalShadows.push(`${name} (${v})`);
}

// Projects.
for (const [slug, p] of projects) {
  const root = p.path;
  const row = { exists: fs.existsSync(root), copies: {}, linked: [], rules: [], deadBareFiles: [], lowercase: [], enabled: [], manifest: false, registryPointer: false, staleCommands: [] };
  report.projects[slug] = row;
  if (!row.exists) continue;
  const skillsDir = path.join(root, '.claude', 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const e of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      // A symlink dirent reports isDirectory() === false even when it points at one, so a
      // linked skill is invisible to a directory-only test - which is exactly how this
      // audit first reported "0 linked" over 51 live links.
      if (e.isDirectory() || e.isSymbolicLink()) {
        if (isLaneLink(path.join(skillsDir, e.name))) {
          row.linked.push(e.name);
          if (report.skills[e.name]) report.skills[e.name].links.push(slug);
          continue;
        }
        const copy = readCopy(path.join(skillsDir, e.name));
        if (copy?.lowercase) row.lowercase.push(e.name);
        if (laneByName.has(e.name) && copy) {
          const v = verdict(laneByName.get(e.name), copy);
          row.copies[e.name] = { version: copy.version, verdict: v };
          report.skills[e.name].copies[slug] = { version: copy.version, verdict: v };
        }
      } else if (e.name.endsWith('.md')) {
        row.deadBareFiles.push(e.name);
      }
    }
  }
  const settingsPath = path.join(root, '.claude', 'settings.json');
  if (fs.existsSync(settingsPath)) {
    try {
      const st = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      for (const [key, on] of Object.entries(st.enabledPlugins ?? {})) {
        const m = key.match(/^([a-z0-9-]+)@([a-z0-9-]+)$/);
        if (m && m[2] === MARKETPLACE && on) {
          row.enabled.push(m[1]);
          if (report.skills[m[1]]) report.skills[m[1]].plugins.push(slug);
        }
      }
    } catch { /* unparseable settings: reported implicitly by an empty enabled list */ }
  }
  const rulesDir = path.join(root, '.claude', 'rules');
  if (fs.existsSync(rulesDir)) row.rules = fs.readdirSync(rulesDir).filter((f) => f.startsWith('ai-registry-'));
  const manifest = path.join(root, '.ai', 'manifest.yaml');
  if (fs.existsSync(manifest)) {
    row.manifest = true;
    row.registryPointer = /^\s*registry:\s*$/m.test(fs.readFileSync(manifest, 'utf8')) || /registry:\s*github:/m.test(fs.readFileSync(manifest, 'utf8'));
  }
  const cmds = path.join(root, '.claude', 'commands');
  if (fs.existsSync(cmds)) {
    for (const f of ['scan-contexts.md', 'structure-rules.md']) {
      const fp = path.join(cmds, f);
      if (fs.existsSync(fp) && /localhost:3000|Vibeman|Next\.js 15/i.test(fs.readFileSync(fp, 'utf8'))) row.staleCommands.push(f);
    }
  }
}

// Summary + adopters.
let copies = 0, inSync = 0, stale = 0, ahead = 0, diverged = 0, enabled = 0, links = 0;
const adopters = {};
for (const [name, s] of Object.entries(report.skills)) {
  adopters[name] = [];
  for (const [slug, c] of Object.entries(s.copies)) {
    copies++;
    if (c.verdict === 'in_sync') inSync++; else if (c.verdict === 'stale') stale++; else if (c.verdict === 'ahead') ahead++; else diverged++;
    adopters[name].push(`${slug}@${c.version ?? 'unversioned'}`);
  }
  for (const slug of s.links) { links++; adopters[name].push(`${slug}@link`); }
  for (const slug of s.plugins) { enabled++; adopters[name].push(`${slug}@plugin:${s.version}`); }
  adopters[name].sort();
}
report.summary = { links, copies, inSync, stale, ahead, diverged, pluginEnablements: enabled, personalShadows: report.personalShadows.length };

if (writeAdopters) {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  let changed = 0;
  for (const sk of catalog.skills ?? []) {
    const next = adopters[sk.name] ?? [];
    if (JSON.stringify(sk.adopters ?? []) !== JSON.stringify(next)) { sk.adopters = next; changed++; }
  }
  fs.writeFileSync(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`);
  report.adoptersWritten = changed;
}

if (json) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

console.log(`fleet audit — ${report.generatedAt.slice(0, 10)} — ${lane.length} lane skill(s), ${projects.length} project(s)\n`);
console.log(`  LINKED skills: ${links}  (one file, no version to compare - the link IS the lane)`);
console.log(`  remaining copies: ${copies}  (in_sync ${inSync} · stale ${stale} · ahead ${ahead} · diverged ${diverged})`);
console.log(`  plugin enablements: ${enabled}`);
console.log(`  personal tier holds ${report.personalShadows.length} lane name(s)${report.personalShadows.length ? ' — THESE SHADOW EVERY PROJECT COPY: ' + report.personalShadows.join(', ') : ''}\n`);
console.log('  skill                    lane      where it runs (project:link = the lane file itself)');
for (const [name, s] of Object.entries(report.skills).sort()) {
  const ls = s.links.map((slug) => `${slug}:link`);
  const cs = Object.entries(s.copies).map(([slug, c]) => `${slug}@${c.version ?? '-'} ${c.verdict}`);
  const ps = s.plugins.map((slug) => `${slug}:plugin`);
  const all = [...ls, ...cs, ...ps];
  console.log(`  ${name.padEnd(24)} ${String(s.version).padEnd(9)} ${all.length ? all.join(', ') : '—'}`);
}
console.log('\n  project        linked  rules  copies  dead-bare  lowercase  manifest  registry-ptr  stale-cmds');
for (const [slug, p] of Object.entries(report.projects)) {
  console.log(`  ${slug.padEnd(14)} ${String(p.linked.length).padEnd(7)} ${String(p.rules.length).padEnd(6)} ${String(Object.keys(p.copies).length).padEnd(7)} ${String(p.deadBareFiles.length).padEnd(10)} ${String(p.lowercase.length).padEnd(10)} ${String(p.manifest).padEnd(9)} ${String(p.registryPointer).padEnd(13)} ${p.staleCommands.join(',') || '-'}`);
}
if (writeAdopters) console.log(`\n  catalog.json adopters rewritten for ${report.adoptersWritten} skill(s)`);
console.log('\n  Verdicts are against the LANE version and bytes. `ahead` means an installation carries a newer');
console.log('  version than the registry — a share that never landed; `diverged` means same version, different');
console.log('  method — the silent failure versions exist to prevent. Personal-tier shadows are the first thing to fix.');
