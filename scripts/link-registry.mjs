#!/usr/bin/env node
/**
 * link-registry — point every project at THIS registry: `.claude/skills/<name>` as a link to the
 * skills lane, so there is exactly one copy of each skill on the machine, and
 * `.claude/rules/ai-registry-*.md` as installed COPIES of the generated knowledge rules, so the
 * corpus is present in every session (a symlinked rule never loads - see the rules block below).
 *
 * ## Why a link and not a copy, and not a plugin
 *
 * A copy has to be synced, and a sync that is not performed is a silent divergence - the
 * failure this registry measured across the fleet (44 copies, 0 in sync). A plugin fixes
 * that with a version-pinned cache, which is the right answer when the registry and the
 * consumer are owned by different people: it makes an update an explicit act, so nobody's
 * agent changes behaviour without their say-so.
 *
 * When ONE person owns the registry and every consumer, that protection is a tax. There is
 * nobody to protect from, and the round trip (edit -> bump -> regenerate -> commit -> push
 * -> update in six repos) buys nothing. A link removes the trip entirely: the project's
 * skill directory IS the registry's skill directory, so editing it from any project session
 * edits the one file, and it is live in every project immediately (the harness watches skill
 * directories and reloads within the session).
 *
 * The harness supports this directly: "A <skill-name> entry in the enterprise, personal, or
 * project locations can be a symlink to a directory elsewhere on disk. Claude Code follows
 * the symlink and reads SKILL.md from the target directory, and if the same target is
 * reachable from more than one location, Claude Code loads the skill once." That last clause
 * is a bonus: with one target, the personal-over-project shadowing class of bug cannot occur.
 *
 * ## What is committed and what is not
 *
 * The LINK is local machine state and is gitignored (a link committed into a repo is a
 * dangling path on the next machine). The DECLARATION - which skills a project uses - is
 * committed, in that project's `.ai/manifest.yaml` under `skills:`, where it is reviewable
 * exactly like the `enabledPlugins` list it replaces. This script reads the declaration and
 * makes the machine match it.
 *
 * A real directory under `.claude/skills/` is a PROJECT-OWNED skill and is never touched.
 * Refusing to convert one is the point: the lane's rule is one home per name, and a project
 * skill that shadows a lane name is a finding for `fleet-audit.mjs`, not something to
 * silently delete here.
 *
 *   node scripts/link-registry.mjs [--check] [--project <slug>]
 *
 * `--check` verifies and reports without writing - the form for a pre-commit hook or a
 * session-start sanity pass. Exit 1 when something is wrong, 2 when the instrument cannot
 * run at all.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadBridge } from './lib/projects.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'skills');
const RULES = path.join(ROOT, 'rules');
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  // Without this guard an unknown flag fell through to a fleet-wide write run (2026-09-14:
  // `--help` relinked every project and rewrote a rules copy and a .gitignore it was not asked to).
  console.log('usage: node scripts/link-registry.mjs [--check] [--listing-only] [--project <slug>]');
  process.exit(0);
}
const checkOnly = process.argv.includes('--check');
// --listing-only runs the listing-tier pass alone: it writes nothing but the gitignored
// .claude/settings.local.json, so it can land beside unrelated link or .gitignore drift.
const listingOnly = process.argv.includes('--listing-only');
const projIdx = process.argv.indexOf('--project');
const onlyProject = projIdx === -1 ? null : process.argv[projIdx + 1];
const GITIGNORE_BEGIN = '# BEGIN ai-registry linked skills (managed by ai-registry/scripts/link-registry.mjs)';
const GITIGNORE_END = '# END ai-registry linked skills';

const fleet = loadBridge(ROOT)._fleet;
if (!fleet.machine && !Object.keys(fleet.projects).length) {
  console.error('FATAL: this machine has no resolvable fleet.');
  for (const p of fleet.problems) console.error(`  - ${p}`);
  console.error('  Expected a committed projects.json plus a local .machine.local.json (see librarian/projects.md).');
  process.exit(2);
}
if (!fs.existsSync(LANE)) {
  console.error(`FATAL: no skills/ lane at ${LANE}. Refusing to link projects at nothing.`);
  process.exit(2);
}
const laneSkills = new Set(
  fs.readdirSync(LANE, { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(path.join(LANE, e.name, 'SKILL.md'))).map((e) => e.name),
);
if (laneSkills.size === 0) {
  console.error('FATAL: the lane parsed to zero skills. THE READER IS BROKEN - refusing to unlink six projects.');
  process.exit(2);
}

const bridge = fleet;

/** The manifest's `skills:` block - a `- name` list. Deliberately a subset parser: this
 *  file is a contract, not a place for YAML cleverness. */
const declaredSkills = (manifestPath) => {
  if (!fs.existsSync(manifestPath)) return null;
  const lines = fs.readFileSync(manifestPath, 'utf8').split(/\r?\n/);
  // Column 0 OR indented: a generated manifest keeps the human-owned block under `human:`
  // (grant did, and resolved as "nothing declared" while ten links sat in its tree).
  const start = lines.findIndex((l) => /^\s*skills:\s*$/.test(l));
  if (start === -1) return null;
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const m = lines[i].match(/^\s+-\s+([a-z0-9][a-z0-9-]*)\s*$/);
    if (m) { out.push(m[1]); continue; }
    if (/^\s*(#.*)?$/.test(lines[i])) continue;   // blank or comment inside the block
    break;                                        // any other key ends it
  }
  return out;
};

/** The manifest's `knowledge.domains: [a, b]` - which bundles this project consumes, and
 *  therefore which generated knowledge rules it installs into `.claude/rules/`. */
const declaredDomains = (manifestPath) => {
  if (!fs.existsSync(manifestPath)) return [];
  const m = fs.readFileSync(manifestPath, 'utf8').match(/^\s*domains:\s*\[([^\]]*)\]/m);
  return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
};

/** Resolve what an entry currently IS: absent | link-to-lane | link-elsewhere | dir. */
const inspect = (entry) => {
  let st;
  try { st = fs.lstatSync(entry); } catch { return { kind: 'absent' }; }
  if (st.isSymbolicLink() || st.isDirectory()) {
    let real = null;
    try { real = fs.realpathSync(entry); } catch { return { kind: 'broken-link' }; }
    const isLink = st.isSymbolicLink() || path.resolve(real) !== path.resolve(entry);
    if (!isLink) return { kind: 'dir' };
    return { kind: path.resolve(real).startsWith(path.resolve(LANE)) ? 'link-lane' : 'link-elsewhere', target: real };
  }
  return { kind: 'file' };
};

const makeLink = (target, linkPath) => {
  // 'dir' is the documented shape the harness follows. A junction is the unelevated
  // fallback on Windows; it reads through identically and git sees it as a directory,
  // which is why the gitignore block below is not optional.
  try { fs.symlinkSync(target, linkPath, 'dir'); return 'symlink'; } catch {
    try { fs.symlinkSync(target, linkPath, 'junction'); return 'junction'; } catch {
      execFileSync('cmd', ['/c', 'mklink', '/J', linkPath, target], { stdio: 'ignore' });
      return 'junction';
    }
  }
};

const writeGitignoreBlock = (repo, skillNames, ruleNames = []) => {
  const gi = path.join(repo, '.gitignore');
  const body = (skillNames.length || ruleNames.length)
    ? [GITIGNORE_BEGIN,
       '# Links are machine state; the declarations live in .ai/manifest.yaml (`skills:` and `knowledge.domains`).',
       ...skillNames.map((n) => `/.claude/skills/${n}`),
       ...ruleNames.map((n) => `/.claude/rules/${n}`),
       // Every linked skill appends its run log here (skill-reflection clause, "Run log");
       // /librarian skills drains it into the registry. Local run output, never committed.
       ...(skillNames.length ? ['/.ai/skill-runs.local.jsonl'] : []),
       GITIGNORE_END].join('\n')
    : '';
  let cur = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
  const re = new RegExp(`${GITIGNORE_BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${GITIGNORE_END}\\r?\\n?`, 'm');
  const next = re.test(cur) ? cur.replace(re, body ? `${body}\n` : '') : (body ? `${cur.replace(/\s*$/, '\n')}\n${body}\n` : cur);
  if (next !== cur) { if (!checkOnly) fs.writeFileSync(gi, next); return true; }
  return false;
};

// ---- listing tiers -----------------------------------------------------------
// Every linked skill publishes its description into the model's skill listing on every session,
// and most of this lane is started by the operator typing its name (2026-09-24 replay: 204
// skills loaded across the fleet; the model-side invocations of initiator skills were the
// operator naming them in prose, a chain naming them, or one product engine). The harness's
// `skillOverrides` setting has a state for that: `name-only` keeps the name listed - so prose
// and chains still resolve - and drops the description, which is the cost (kp: 56,282 ->
// 52,638 tokens per session start, paired, n=2 per arm, 2.1.281). The lane skill owns its tier
// in a `listing:` frontmatter key; absent means `name-only`, and a skill that must fire on
// relevance without being named declares `listing: on`. The tier is written to the project's
// `.claude/settings.local.json` - machine state beside the links, never a tracked file.
const LISTING_TIERS = new Set(['on', 'name-only', 'user-invocable-only']);
const laneFrontmatter = (dir) => {
  const t = fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8');
  const fm = (t.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const key = (k) => (fm.match(new RegExp(`^${k}:\\s*(\\S+)\\s*$`, 'm')) || [])[1];
  return { listing: key('listing'), disabled: key('disable-model-invocation') === 'true' };
};
/** The tier a skill directory asks for, or null when its own frontmatter already hides it. */
const listingTier = (dir, who) => {
  const fm = laneFrontmatter(dir);
  if (fm.disabled) return null;
  if (fm.listing && !LISTING_TIERS.has(fm.listing)) { problems.push(`${who}: listing: ${fm.listing} is not one of ${[...LISTING_TIERS].join(' | ')}`); return null; }
  return fm.listing || 'name-only';
};
const tracked = (repo, rel) => {
  try { execFileSync('git', ['-C', repo, 'ls-files', '--error-unmatch', rel], { stdio: 'ignore' }); return true; } catch { return false; }
};
/** Merge `wanted` into skillOverrides of <repo>/.claude/settings.local.json, preserving every
 *  other key and entry. Returns 'current' | 'updated' | 'stale' | 'skipped:<why>'. */
const writeListing = (repo, wanted) => {
  if (!Object.keys(wanted).length) return 'current';
  const rel = '.claude/settings.local.json';
  const file = path.join(repo, rel);
  if (tracked(repo, rel)) return 'skipped:tracked';
  let cur = {};
  if (fs.existsSync(file)) {
    try { cur = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return 'skipped:unparseable'; }
  }
  const have = cur.skillOverrides || {};
  const drift = Object.entries(wanted).filter(([n, v]) => have[n] !== v);
  if (!drift.length) return 'current';
  if (checkOnly) return 'stale';
  const next = { ...cur, skillOverrides: { ...have, ...wanted } };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
  return 'updated';
};

const rows = [];
const problems = [];
let changed = 0;
const tiersFor = (declared, slug) => {
  const wanted = {};
  for (const name of declared.filter((n) => laneSkills.has(n))) {
    const tier = listingTier(path.join(LANE, name), `${slug}/${name}`);
    if (tier) wanted[name] = tier;
  }
  return wanted;
};
const reportListing = (slug, listing) => {
  if (listing === 'stale') problems.push(`${slug}: .claude/settings.local.json skillOverrides do not match the lane's listing tiers`);
  if (listing.startsWith('skipped')) problems.push(`${slug}: listing tiers not written - .claude/settings.local.json is ${listing.slice(8)}; set skillOverrides by hand or untrack the file`);
};

for (const [slug, p] of Object.entries(bridge.projects ?? {})) {
  if (onlyProject && slug !== onlyProject) continue;
  if (!p?.path || !fs.existsSync(p.path)) { problems.push(`${slug}: checkout not found`); continue; }
  const manifest = path.join(p.path, '.ai', 'manifest.yaml');
  const declared = declaredSkills(manifest);
  if (declared === null) { problems.push(`${slug}: .ai/manifest.yaml has no \`skills:\` block - nothing declared, nothing linked`); continue; }

  if (listingOnly) {
    const listing = writeListing(p.path, tiersFor(declared, slug));
    if (listing === 'updated') changed += 1;
    reportListing(slug, listing);
    rows.push({ slug, declared: declared.length, domains: 0, ok: 0, linked: 0, repointed: 0, removed: 0, rulesOk: 0, rulesLinked: 0, blocked: 0, gi: '-', listing });
    continue;
  }

  const skillsDir = path.join(p.path, '.claude', 'skills');
  if (!fs.existsSync(skillsDir)) { if (!checkOnly) fs.mkdirSync(skillsDir, { recursive: true }); }

  const acts = { linked: 0, ok: 0, repointed: 0, removed: 0, blocked: 0, rulesOk: 0, rulesLinked: 0, rulesRemoved: 0 };
  for (const name of declared) {
    const entry = path.join(skillsDir, name);
    const target = path.join(LANE, name);
    if (!laneSkills.has(name)) { problems.push(`${slug}: declares "${name}", which the lane does not carry`); acts.blocked += 1; continue; }
    const cur = inspect(entry);
    if (cur.kind === 'link-lane' && path.resolve(cur.target) === path.resolve(target)) { acts.ok += 1; continue; }
    if (cur.kind === 'dir') {
      problems.push(`${slug}: .claude/skills/${name} is a REAL directory (a project-owned copy) - not converting. Delete it deliberately, or rename it if it is a fork.`);
      acts.blocked += 1; continue;
    }
    if (checkOnly) { problems.push(`${slug}: ${name} is ${cur.kind}, should be a link to the lane`); acts.blocked += 1; continue; }
    if (cur.kind !== 'absent') fs.rmSync(entry, { recursive: true, force: true });
    makeLink(target, entry);
    if (cur.kind === 'absent') acts.linked += 1; else acts.repointed += 1;
    changed += 1;
  }

  // Stale: a link into the lane that is no longer declared.
  for (const e of fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir) : []) {
    if (declared.includes(e)) continue;
    const cur = inspect(path.join(skillsDir, e));
    if (cur.kind === 'link-lane' || cur.kind === 'broken-link') {
      if (checkOnly) { problems.push(`${slug}: ${e} is linked to the lane but not declared in the manifest`); continue; }
      fs.rmSync(path.join(skillsDir, e), { recursive: true, force: true });
      acts.removed += 1; changed += 1;
    }
  }

  // ---- knowledge rules -----------------------------------------------------
  // A rule with no `paths:` frontmatter loads into EVERY session at the same priority as
  // .claude/CLAUDE.md - but only as a file INSIDE the project. Witnessed 2026-09-14 on harness
  // 2.1.270 with a load-telemetry (InstructionsLoaded) hook: a symlink to a rule outside the
  // project is treated as an external import and never loads, while a hard link or a copy of
  // the same file does - and every fleet project had been carrying symlinks that reached no
  // session. Skill directories behind a symlink DO load, so skills stay links. Rules are
  // therefore installed as COPIES of the generated files. The `ai-registry-` prefix is the
  // managed namespace: the registry owns and overwrites those files, and --check reports a
  // symlink or a copy whose content drifted from the generated source (re-run this script
  // after build-knowledge-rules.mjs).
  const domains = declaredDomains(manifest);
  const wantRules = ['ai-registry-access.md', ...domains.map((d) => `ai-registry-${d}.md`)];
  const rulesDir = path.join(p.path, '.claude', 'rules');
  if (!fs.existsSync(rulesDir) && !checkOnly) fs.mkdirSync(rulesDir, { recursive: true });
  const sameText = (a, b) => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');
  for (const rule of wantRules) {
    const src = path.join(RULES, rule);
    const entry = path.join(rulesDir, rule);
    if (!fs.existsSync(src)) { problems.push(`${slug}: declares a domain with no generated rule (${rule}) - run build-knowledge-rules.mjs`); acts.blocked += 1; continue; }
    const want = fs.readFileSync(src, 'utf8');
    let cur = 'absent';
    try {
      const st = fs.lstatSync(entry);
      cur = st.isSymbolicLink() ? 'symlink' : (sameText(fs.readFileSync(entry, 'utf8'), want) ? 'ok' : 'stale');
    } catch { cur = 'absent'; }
    if (cur === 'ok') { acts.rulesOk += 1; continue; }
    if (checkOnly) {
      const why = cur === 'symlink' ? 'a symlink, which the harness does not load - install a copy' : cur === 'stale' ? 'a copy that drifted from the generated rule' : 'absent';
      problems.push(`${slug}: rule ${rule} is ${why}`); acts.blocked += 1; continue;
    }
    if (cur !== 'absent') fs.rmSync(entry, { force: true });
    fs.writeFileSync(entry, want);
    acts.rulesLinked += 1; changed += 1;
  }
  for (const e of fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir) : []) {
    if (!e.startsWith('ai-registry-') || wantRules.includes(e)) continue;
    if (checkOnly) { problems.push(`${slug}: rule ${e} is linked but its domain is not declared`); continue; }
    fs.rmSync(path.join(rulesDir, e), { force: true }); acts.rulesRemoved += 1; changed += 1;
  }

  const giMoved = writeGitignoreBlock(p.path, declared.filter((n) => laneSkills.has(n)), wantRules);
  if (giMoved && checkOnly) problems.push(`${slug}: .gitignore's managed block does not match the declaration`);

  const listing = writeListing(p.path, tiersFor(declared, slug));
  if (listing === 'updated') changed += 1;
  reportListing(slug, listing);
  rows.push({ slug, declared: declared.length, domains: domains.length, ...acts, gi: giMoved ? (checkOnly ? 'stale' : 'updated') : 'current', listing });
}

// The registry's own maintenance skills (.claude/skills here) are started by the operator by
// name, like the lane's initiators; the same tiers apply to this checkout.
if (!onlyProject) {
  const own = path.join(ROOT, '.claude', 'skills');
  const wanted = {};
  for (const e of fs.existsSync(own) ? fs.readdirSync(own) : []) {
    if (!fs.existsSync(path.join(own, e, 'SKILL.md'))) continue;
    const tier = listingTier(path.join(own, e), `ai-registry/.claude/skills/${e}`);
    if (tier) wanted[e] = tier;
  }
  const listing = writeListing(ROOT, wanted);
  if (listing === 'updated') changed += 1;
  if (listing === 'stale') problems.push('ai-registry: .claude/settings.local.json skillOverrides do not match the maintenance skills\' listing tiers');
  if (listing.startsWith('skipped')) problems.push(`ai-registry: listing tiers not written - .claude/settings.local.json is ${listing.slice(8)}`);
  rows.push({ slug: '(registry)', declared: Object.keys(wanted).length, domains: 0, ok: 0, linked: 0, repointed: 0, removed: 0, rulesOk: 0, rulesLinked: 0, blocked: 0, gi: '-', listing });
}

console.log(`link-registry - lane at ${path.relative(process.cwd(), LANE) || LANE}, ${laneSkills.size} skill(s)\n`);
console.log('  project        skills  ok  new  gone  | domains  rules-ok  rules-new  | blocked  .gitignore  listing');
for (const r of rows) {
  console.log(`  ${r.slug.padEnd(14)} ${String(r.declared).padEnd(7)} ${String(r.ok).padEnd(3)} ${String(r.linked + r.repointed).padEnd(4)} ${String(r.removed).padEnd(5)} | ${String(r.domains).padEnd(8)} ${String(r.rulesOk).padEnd(9)} ${String(r.rulesLinked).padEnd(10)} | ${String(r.blocked).padEnd(8)} ${r.gi.padEnd(11)} ${r.listing}`);
}
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
}
if (checkOnly) {
  if (problems.length) { console.error('\nlink-skills --check FAILED'); process.exit(1); }
  console.log('\nevery declared skill is linked to the lane; nothing stale.');
} else {
  console.log(`\n${changed} link(s) changed. An edit to a linked skill edits the registry file itself - there is nothing to sync.`);
}
