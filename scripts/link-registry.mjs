#!/usr/bin/env node
/**
 * link-registry — point every project at THIS registry by link: `.claude/skills/<name>` at the
 * skills lane, and `.claude/rules/ai-registry-*.md` at the generated knowledge rules, so there
 * is exactly one copy of each on the machine and the corpus is present in every session.
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
const checkOnly = process.argv.includes('--check');
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
 *  therefore which generated knowledge rules it links into `.claude/rules/`. */
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
       GITIGNORE_END].join('\n')
    : '';
  let cur = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
  const re = new RegExp(`${GITIGNORE_BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${GITIGNORE_END}\\r?\\n?`, 'm');
  const next = re.test(cur) ? cur.replace(re, body ? `${body}\n` : '') : (body ? `${cur.replace(/\s*$/, '\n')}\n${body}\n` : cur);
  if (next !== cur) { if (!checkOnly) fs.writeFileSync(gi, next); return true; }
  return false;
};

const rows = [];
const problems = [];
let changed = 0;

for (const [slug, p] of Object.entries(bridge.projects ?? {})) {
  if (onlyProject && slug !== onlyProject) continue;
  if (!p?.path || !fs.existsSync(p.path)) { problems.push(`${slug}: checkout not found`); continue; }
  const manifest = path.join(p.path, '.ai', 'manifest.yaml');
  const declared = declaredSkills(manifest);
  if (declared === null) { problems.push(`${slug}: .ai/manifest.yaml has no \`skills:\` block - nothing declared, nothing linked`); continue; }

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
  // .claude/CLAUDE.md, and the harness resolves symlinks in .claude/rules/. So the corpus
  // reaches a session with no skill invoked and nothing copied: the access contract plus
  // one card per declared domain, all pointing at the registry's generated files.
  const domains = declaredDomains(manifest);
  const wantRules = ['ai-registry-access.md', ...domains.map((d) => `ai-registry-${d}.md`)];
  const rulesDir = path.join(p.path, '.claude', 'rules');
  if (!fs.existsSync(rulesDir) && !checkOnly) fs.mkdirSync(rulesDir, { recursive: true });
  for (const rule of wantRules) {
    const src = path.join(RULES, rule);
    const entry = path.join(rulesDir, rule);
    if (!fs.existsSync(src)) { problems.push(`${slug}: declares a domain with no generated rule (${rule}) - run build-knowledge-rules.mjs`); acts.blocked += 1; continue; }
    let cur = 'absent';
    try {
      const st = fs.lstatSync(entry);
      const real = fs.realpathSync(entry);
      cur = st.isSymbolicLink() || path.resolve(real) !== path.resolve(entry)
        ? (path.resolve(real) === path.resolve(src) ? 'ok' : 'wrong-target') : 'file';
    } catch { cur = fs.existsSync(entry) ? 'broken-link' : 'absent'; }
    if (cur === 'ok') { acts.rulesOk += 1; continue; }
    if (cur === 'file') { problems.push(`${slug}: .claude/rules/${rule} is a real file, not a link - not overwriting`); acts.blocked += 1; continue; }
    if (checkOnly) { problems.push(`${slug}: rule ${rule} is ${cur}, should be a link to the registry`); acts.blocked += 1; continue; }
    if (cur !== 'absent') fs.rmSync(entry, { force: true });
    try { fs.symlinkSync(src, entry, 'file'); } catch { fs.copyFileSync(src, entry); }
    acts.rulesLinked += 1; changed += 1;
  }
  for (const e of fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir) : []) {
    if (!e.startsWith('ai-registry-') || wantRules.includes(e)) continue;
    if (checkOnly) { problems.push(`${slug}: rule ${e} is linked but its domain is not declared`); continue; }
    fs.rmSync(path.join(rulesDir, e), { force: true }); acts.rulesRemoved += 1; changed += 1;
  }

  const giMoved = writeGitignoreBlock(p.path, declared.filter((n) => laneSkills.has(n)), wantRules);
  if (giMoved && checkOnly) problems.push(`${slug}: .gitignore's managed block does not match the declaration`);
  rows.push({ slug, declared: declared.length, domains: domains.length, ...acts, gi: giMoved ? (checkOnly ? 'stale' : 'updated') : 'current' });
}

console.log(`link-registry - lane at ${path.relative(process.cwd(), LANE) || LANE}, ${laneSkills.size} skill(s)\n`);
console.log('  project        skills  ok  new  gone  | domains  rules-ok  rules-new  | blocked  .gitignore');
for (const r of rows) {
  console.log(`  ${r.slug.padEnd(14)} ${String(r.declared).padEnd(7)} ${String(r.ok).padEnd(3)} ${String(r.linked + r.repointed).padEnd(4)} ${String(r.removed).padEnd(5)} | ${String(r.domains).padEnd(8)} ${String(r.rulesOk).padEnd(9)} ${String(r.rulesLinked).padEnd(10)} | ${String(r.blocked).padEnd(8)} ${r.gi}`);
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
