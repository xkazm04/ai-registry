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
 *   node scripts/link-registry.mjs [--check] [--listing-only] [--project <slug>]
 *   node scripts/link-registry.mjs --heal --project <slug>
 *
 * `--check` verifies and reports without writing - the form for a pre-commit hook or a
 * session-start sanity pass. Exit 1 when something is wrong, 2 when the instrument cannot
 * run at all.
 *
 * ## --heal: the unattended repair, and what it may touch
 *
 * Links cannot drift; rule COPIES can, and nothing refreshed them but a hand-run of this
 * script (2026-11-09 on one machine: `--check` FAILED with 71 findings, three projects with
 * a drifted always-on rule copy, one with none at all). `--heal --project <slug>` repairs
 * the classes below that are SAFE to repair with nobody watching, for that one project,
 * and is what the SessionStart hook (next section) runs. Every SAFE repair additionally
 * requires `git check-ignore` to report the path IGNORED in the project (`ignoredPaths`):
 * a tracked path is someone's working tree, and check-ignore does not report tracked
 * files, so a tracked rule copy falls out as UNSAFE by the same test. Heal never deletes
 * except to replace the entry it is refreshing, never recurses through a link
 * (`unlinkEntry`), and never writes `.gitignore` or `.claude/settings.local.json`.
 *
 *   class                                          detected by                  heal
 *   rule copy drifted from the generated rule     ruleState() -> 'stale'       SAFE if ignored
 *   rule copy absent                              ruleState() -> 'absent'      SAFE if ignored
 *   rule installed as a symlink (never loads)     ruleState() -> 'symlink'     SAFE if ignored
 *   declared skill, link absent                   inspect() -> 'absent'        SAFE if ignored
 *   declared skill, link dangling                 inspect() -> 'broken-link'   SAFE if ignored
 *   declared skill, link into the lane but at     inspect() -> 'link-lane',    SAFE if ignored
 *     another skill's directory                     target mismatch
 *   any of the above at a path git does not       ignoredPaths()               UNSAFE (tracked,
 *     ignore (tracked, or no managed block yet)                                  or not yet ours)
 *   declared skill, link to a directory OUTSIDE   inspect() -> 'link-elsewhere' UNSAFE: may be a
 *     this lane (a fork, another checkout)                                     deliberate link
 *   real directory / file shadowing a lane name   inspect() -> 'dir' | 'file'  UNSAFE
 *   rule path holding a directory                 ruleState() -> 'other'       UNSAFE
 *   lane link or ai-registry-* rule no longer     the "stale" readdir passes   UNSAFE (a delete;
 *     declared                                                                 the default run)
 *   .gitignore managed block mismatch             writeGitignoreBlock()        UNSAFE (tracked)
 *   skillOverrides / hook in settings.local.json  writeListing(), writeHook()  UNSAFE (session
 *                                                                              config; default run)
 *   declared skill the lane lacks, domain with    laneSkills / RULES lookups   not repairable
 *     no generated rule                                                        (content)
 *
 * Heal is silent and exits 0 when nothing is SAFE to repair; prints ONE stderr line naming
 * what it repaired; never prints the UNSAFE findings (they belong to `--check`); and exits 0
 * with one stderr line when the instrument itself is broken (no fleet, unknown slug,
 * unreadable manifest, no rules/ directory, a throw) - a hook that fails a session start
 * gets removed, and then it measures nothing. Usage errors (`--heal` without `--project`,
 * an unknown flag) still exit 2: a fleet-wide unattended write is not what this mode is for.
 * Nothing is ever written to STDOUT in this mode, because a SessionStart hook's stdout is
 * added to the session's context (see below).
 *
 * ## The SessionStart hook
 *
 * The default (writing) run maintains one entry in each project's machine-local
 * `.claude/settings.local.json` beside `skillOverrides` (`writeHook`):
 *
 *   "hooks": { "SessionStart": [ { "matcher": "startup|resume",
 *     "hooks": [ { "type": "command", "timeout": 30,
 *       "command": "node \"<registry>/scripts/link-registry.mjs\" --heal --project <slug>" } ] } ] }
 *
 * Shape and behaviour confirmed against https://code.claude.com/docs/en/hooks (read
 * 2026-11-09): hooks nest event -> matcher group -> handlers `{type, command, timeout}`;
 * `.claude/settings.local.json` is a listed hook location ("Single project ... gitignored");
 * SessionStart matchers are `startup`, `resume`, `clear`, `compact`, `fork`, and "SessionStart
 * runs on every session, so keep these hooks fast"; `timeout` is "Seconds before canceling"
 * (default 600 for command hooks - 30 here caps a hung git); on exit 0 "Claude Code adds
 * plain-text stdout as context" for SessionStart, and "Claude never sees stderr from a hook
 * that exits 0" (hence: repair line on stderr, nothing on stdout); exit 2 on SessionStart
 * "Shows stderr to user only" and the session proceeds; other non-zero codes are a
 * non-blocking error notice. Whether a rule refreshed during session start is the copy
 * that session loads is not documented, so the repair line claims only "takes effect from
 * the next session at the latest". Our entry is recognised by its command
 * (`link-registry.mjs" --heal`), replaced when it differs, and every foreign hook and every
 * other key is kept; a tracked or unparseable settings file is not written and the run
 * says so (the same path as `skillOverrides`). `--check` reports a missing or outdated hook.
 *
 * ## The registry's own checkout
 *
 * Lane skills the registry runs on itself (`/spark`, `/perfect`, `/explorer`) are linked
 * into its own `.claude/skills/` by the same rule as any consumer. Their declaration is the
 * registry's `.gitignore`: a line `/.claude/skills/<name>` naming a LANE skill is the
 * declaration, because such a link must be ignored anyway and two lists of one fact drift
 * (`ownLaneLinks`). Until 2026-11-09 nothing read those lines - the comment said "recreate
 * with a symlink/junction" by hand - so on a fresh machine `/spark` simply did not resolve.
 * The default run without `--project` now makes those links and `--check` reports them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadBridge } from './lib/projects.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LANE = path.join(ROOT, 'skills');
const RULES = path.join(ROOT, 'rules');
const USAGE = 'usage: node scripts/link-registry.mjs [--check] [--listing-only] [--project <slug>]\n       node scripts/link-registry.mjs --heal --project <slug>';
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}
// The default run WRITES into every project, so anything this script does not understand
// stops it. The --help guard above was the first half of this (2026-09-14: `--help`
// relinked every project and rewrote a rules copy and a .gitignore it was not asked to);
// a typo such as `--chek`, or a `--project` with its slug missing, fell through the same
// way until 2026-10-25 - the second relinking the whole fleet, because no slug read as
// "no filter".
const argv = process.argv.slice(2);
let onlyProject = null;
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--check' || a === '--listing-only' || a === '--heal') continue;
  if (a === '--project') {
    const slug = argv[i + 1];
    if (!slug || slug.startsWith('-')) { console.error(`FATAL: --project needs a slug.\n${USAGE}`); process.exit(2); }
    onlyProject = slug; i += 1; continue;
  }
  console.error(`FATAL: unknown argument ${a} - refusing to run, because the default run writes into every project.\n${USAGE}`);
  process.exit(2);
}
const checkOnly = argv.includes('--check');
// --listing-only runs the listing-tier pass alone: it writes nothing but the gitignored
// .claude/settings.local.json (skillOverrides and the SessionStart heal hook), so it can
// land beside unrelated link or .gitignore drift.
const listingOnly = argv.includes('--listing-only');
// --heal is the unattended session-start repair (header, "--heal"). It is one project or
// nothing: without --project it would be a fleet-wide write nobody is watching.
const healMode = argv.includes('--heal');
if (healMode && !onlyProject) { console.error(`FATAL: --heal needs --project <slug>; it never repairs the whole fleet.\n${USAGE}`); process.exit(2); }
if (healMode && (checkOnly || listingOnly)) { console.error(`FATAL: --heal takes only --project <slug>.\n${USAGE}`); process.exit(2); }
const healLine = (text) => { try { process.stderr.write(`link-registry --heal ${onlyProject}: ${text}\n`); } catch { /* no stderr: nothing to say it on */ } };
if (healMode) {
  // A session start must never fail on this instrument: anything that escapes is one line
  // and exit 0. (Not installCrashDoor: that exits 2 by design, the right answer elsewhere.)
  const door = (e) => { healLine(`could not run - ${String(e?.message ?? e).split('\n')[0]}`); process.exit(0); };
  process.on('uncaughtException', door);
  process.on('unhandledRejection', door);
}
/** The instrument cannot run. Exit 2 - except in heal mode: one line, exit 0 (header). */
const fatal = (lines) => {
  if (healMode) { healLine(`could not run - ${lines[0].replace(/^FATAL: /, '')}`); process.exit(0); }
  for (const l of lines) console.error(l);
  process.exit(2);
};
const GITIGNORE_BEGIN = '# BEGIN ai-registry linked skills (managed by ai-registry/scripts/link-registry.mjs)';
const GITIGNORE_END = '# END ai-registry linked skills';

const fleet = loadBridge(ROOT)._fleet;
if (!fleet.machine && !Object.keys(fleet.projects).length) {
  fatal(['FATAL: this machine has no resolvable fleet.',
    ...fleet.problems.map((p) => `  - ${p}`),
    '  Expected a committed projects.json plus a local .machine.local.json (see librarian/projects.md).']);
}
// A named project this machine does not resolve is a run that cannot happen, not an empty
// one: without this, `--check --project <typo>` printed "every declared skill is linked"
// and exited 0 over a project it never looked at.
if (onlyProject && !fleet.projects[onlyProject]) {
  fatal([`FATAL: no project "${onlyProject}" resolves on this machine (projects.json + .machine.local.json).`]);
}
if (!fs.existsSync(LANE)) {
  fatal([`FATAL: no skills/ lane at ${LANE}. Refusing to link projects at nothing.`]);
}
const laneSkills = new Set(
  fs.readdirSync(LANE, { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(path.join(LANE, e.name, 'SKILL.md'))).map((e) => e.name),
);
if (laneSkills.size === 0) {
  fatal(['FATAL: the lane parsed to zero skills. THE READER IS BROKEN - refusing to unlink six projects.']);
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

/** Remove a link (symlink or junction) WITHOUT recursing: never through a link into the lane.
 *  A real non-empty directory makes rmdir throw, which is the point. */
const unlinkEntry = (p) => {
  try { fs.unlinkSync(p); } catch { fs.rmdirSync(p); }
};

/** What an installed rule path currently is: absent | symlink | ok | stale | other. */
const sameText = (a, b) => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');
const ruleState = (entry, want) => {
  let st;
  try { st = fs.lstatSync(entry); } catch { return 'absent'; }
  if (st.isSymbolicLink()) return 'symlink';
  if (!st.isFile()) return 'other';
  return sameText(fs.readFileSync(entry, 'utf8'), want) ? 'ok' : 'stale';
};

/** The subset of `rels` (forward-slash, repo-relative) that git ignores in `repo`. One git
 *  process for the whole set. check-ignore does not report TRACKED paths (they are not
 *  subject to exclude rules), so a tracked file is "not ignored" here by construction. Not
 *  a repository, or no git: nothing is ignored, so heal writes nothing. */
const ignoredPaths = (repo, rels) => {
  if (!rels.length) return new Set();
  const r = spawnSync('git', ['-C', repo, 'check-ignore', '--stdin', '-z'], { input: `${rels.join('\0')}\0`, encoding: 'utf8', timeout: 15000 });
  if (r.error || (r.status !== 0 && r.status !== 1)) return new Set();
  return new Set(String(r.stdout).split('\0').filter(Boolean).map((s) => s.replace(/\\/g, '/')));
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
       // The front door's query log (scripts/lib/query-log.mjs): query text can carry
       // project-private words, and the logger writes only where this line ignores it.
       '/.ai/queries.local.jsonl',
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

// ---- the SessionStart heal hook (header, "The SessionStart hook") --------------
const HOOK_MATCHER = 'startup|resume';
const HOOK_TIMEOUT = 30;
const OUR_HOOK = /link-registry\.mjs"?\s+--heal\b/;
const hookGroup = (slug) => ({
  matcher: HOOK_MATCHER,
  hooks: [{ type: 'command', command: `node "${ROOT.split(path.sep).join('/')}/scripts/link-registry.mjs" --heal --project ${slug}`, timeout: HOOK_TIMEOUT }],
});
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
/** Keep exactly one heal entry under hooks.SessionStart of <repo>/.claude/settings.local.json,
 *  preserving every foreign hook and every other key. Returns
 *  'current' | 'written' | 'updated' | 'missing' | 'stale' | 'skipped:<why>'. */
const writeHook = (repo, slug) => {
  const rel = '.claude/settings.local.json';
  const file = path.join(repo, rel);
  if (tracked(repo, rel)) return 'skipped:tracked';
  let cur = {};
  if (fs.existsSync(file)) {
    try { cur = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return 'skipped:unparseable'; }
  }
  if (!isObject(cur)) return 'skipped:unparseable';
  const hooks = cur.hooks ?? {};
  const groups = isObject(hooks) ? (hooks.SessionStart ?? []) : null;
  if (!Array.isArray(groups)) return 'skipped:an unexpected hooks shape';
  const ours = (h) => isObject(h) && typeof h.command === 'string' && OUR_HOOK.test(h.command);
  const holdsOurs = (g) => isObject(g) && Array.isArray(g.hooks) && g.hooks.some(ours);
  const want = hookGroup(slug);
  const mine = groups.filter(holdsOurs);
  if (mine.length === 1 && JSON.stringify(mine[0]) === JSON.stringify(want)) return 'current';
  if (checkOnly) return mine.length ? 'stale' : 'missing';
  // Drop our handler from whatever group holds it; drop a group only if that emptied it.
  const kept = [];
  for (const g of groups) {
    if (!holdsOurs(g)) { kept.push(g); continue; }
    const rest = g.hooks.filter((h) => !ours(h));
    if (rest.length) kept.push({ ...g, hooks: rest });
  }
  const next = { ...cur, hooks: { ...hooks, SessionStart: [...kept, want] } };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
  return mine.length ? 'updated' : 'written';
};
const reportHook = (slug, hook) => {
  if (hook === 'missing') problems.push(`${slug}: no SessionStart heal hook in .claude/settings.local.json - run the linker`);
  if (hook === 'stale') problems.push(`${slug}: the SessionStart heal hook in .claude/settings.local.json is outdated - run the linker`);
  if (hook.startsWith('skipped')) problems.push(`${slug}: SessionStart heal hook not written - .claude/settings.local.json is ${hook.slice(8)}; add it by hand or untrack the file`);
};

/** The lane skills the registry links into its OWN .claude/skills: every `.gitignore` line
 *  `/.claude/skills/<name>` naming a lane skill (header, "The registry's own checkout"). */
const ownLaneLinks = () => {
  let text = '';
  try { text = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8'); } catch { return []; }
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.trim().match(/^\/?\.claude\/skills\/([a-z0-9][a-z0-9-]*)\/?$/);
    if (m && laneSkills.has(m[1]) && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
};

// ---- --heal ------------------------------------------------------------------
/** Repair the SAFE classes for one project (header table). Pushes a label per repair onto
 *  `repaired` as it goes, so a throw half-way still reports what was done. */
const heal = (slug, repaired) => {
  const p = bridge.projects[slug];
  if (!p?.path || !fs.existsSync(p.path)) throw new Error('checkout not found');
  if (!fs.existsSync(RULES)) throw new Error(`no rules/ directory in the registry at ${RULES}`);
  const manifest = path.join(p.path, '.ai', 'manifest.yaml');
  const declared = declaredSkills(manifest);
  if (declared === null) return;   // nothing declared: a --check finding, not a repair
  const todo = [];
  const skillsDir = path.join(p.path, '.claude', 'skills');
  for (const name of declared) {
    if (!laneSkills.has(name)) continue;
    const entry = path.join(skillsDir, name);
    const target = path.join(LANE, name);
    const cur = inspect(entry);
    if (cur.kind === 'link-lane' && path.resolve(cur.target) === path.resolve(target)) continue;
    const why = { absent: 'absent', 'broken-link': 'dangling', 'link-lane': 'pointing at another lane skill' }[cur.kind];
    if (!why) continue;   // link-elsewhere, dir, file: UNSAFE
    todo.push({ rel: `.claude/skills/${name}`, label: `link ${name} (${why})`, apply: () => {
      fs.mkdirSync(skillsDir, { recursive: true });
      if (cur.kind !== 'absent') unlinkEntry(entry);
      makeLink(target, entry);
    } });
  }
  const rulesDir = path.join(p.path, '.claude', 'rules');
  for (const rule of ['ai-registry-access.md', ...declaredDomains(manifest).map((d) => `ai-registry-${d}.md`)]) {
    const src = path.join(RULES, rule);
    if (!fs.existsSync(src)) continue;   // a domain with no generated rule: content, --check
    const want = fs.readFileSync(src, 'utf8');
    const entry = path.join(rulesDir, rule);
    const cur = ruleState(entry, want);
    const why = { absent: 'absent', stale: 'drifted', symlink: 'a symlink' }[cur];
    if (!why) continue;   // ok, or 'other': UNSAFE
    todo.push({ rel: `.claude/rules/${rule}`, label: `rule ${rule} (${why})`, apply: () => {
      fs.mkdirSync(rulesDir, { recursive: true });
      if (cur !== 'absent') fs.rmSync(entry, { force: true });
      fs.writeFileSync(entry, want);
    } });
  }
  if (!todo.length) return;   // the hot path: no git process at all
  const ignored = ignoredPaths(p.path, todo.map((t) => t.rel));
  for (const t of todo) {
    if (!ignored.has(t.rel)) continue;   // tracked, or not covered by an ignore rule: UNSAFE
    t.apply();
    repaired.push(t.label);
  }
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

if (healMode) {
  const repaired = [];
  try { heal(onlyProject, repaired); } catch (e) {
    const done = repaired.length ? `; repaired ${repaired.join(', ')} first` : '';
    healLine(`could not run - ${String(e?.message ?? e).split('\n')[0]}${done}`);
    process.exit(0);
  }
  if (repaired.length) healLine(`repaired ${repaired.join(', ')} - takes effect from the next session at the latest`);
  process.exit(0);
}

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
    // The heal hook lives in the same machine-local file, so it rides this pass too: it is
    // how the hook reaches a project whose links or tracked .gitignore block are being left
    // alone, which is exactly the project that most needs an unattended repair.
    const hook = writeHook(p.path, slug);
    if (hook === 'written' || hook === 'updated') changed += 1;
    reportHook(slug, hook);
    rows.push({ slug, declared: declared.length, domains: 0, ok: 0, linked: 0, repointed: 0, removed: 0, rulesOk: 0, rulesLinked: 0, blocked: 0, gi: '-', listing, hook });
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
  for (const rule of wantRules) {
    const src = path.join(RULES, rule);
    const entry = path.join(rulesDir, rule);
    if (!fs.existsSync(src)) { problems.push(`${slug}: declares a domain with no generated rule (${rule}) - run build-knowledge-rules.mjs`); acts.blocked += 1; continue; }
    const want = fs.readFileSync(src, 'utf8');
    const cur = ruleState(entry, want);
    if (cur === 'ok') { acts.rulesOk += 1; continue; }
    if (cur === 'other') { problems.push(`${slug}: rule ${rule} is not a file (a directory?) - not replacing it`); acts.blocked += 1; continue; }
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
  const hook = writeHook(p.path, slug);
  if (hook === 'written' || hook === 'updated') changed += 1;
  reportHook(slug, hook);
  rows.push({ slug, declared: declared.length, domains: domains.length, ...acts, gi: giMoved ? (checkOnly ? 'stale' : 'updated') : 'current', listing, hook });
}

// The registry's own maintenance skills (.claude/skills here) are started by the operator by
// name, like the lane's initiators; the same tiers apply to this checkout.
if (!onlyProject) {
  const own = path.join(ROOT, '.claude', 'skills');
  // Lane skills the registry runs on itself, declared by its .gitignore (ownLaneLinks).
  let ownLinked = 0;
  for (const name of ownLaneLinks()) {
    const entry = path.join(own, name);
    const target = path.join(LANE, name);
    const cur = inspect(entry);
    if (cur.kind === 'link-lane' && path.resolve(cur.target) === path.resolve(target)) continue;
    if (cur.kind === 'dir' || cur.kind === 'file') { problems.push(`ai-registry: .claude/skills/${name} is a real ${cur.kind}, not a link to the lane - not converting`); continue; }
    if (checkOnly) { problems.push(`ai-registry: lane skill ${name} is ${cur.kind} in .claude/skills, should be a link to the lane (declared in .gitignore)`); continue; }
    fs.mkdirSync(own, { recursive: true });
    if (cur.kind !== 'absent') unlinkEntry(entry);
    makeLink(target, entry);
    ownLinked += 1; changed += 1;
  }
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
  rows.push({ slug: '(registry)', declared: Object.keys(wanted).length, domains: 0, ok: 0, linked: ownLinked, repointed: 0, removed: 0, rulesOk: 0, rulesLinked: 0, blocked: 0, gi: '-', listing, hook: '-' });
}

console.log(`link-registry - lane at ${path.relative(process.cwd(), LANE) || LANE}, ${laneSkills.size} skill(s)\n`);
console.log('  project        skills  ok  new  gone  | domains  rules-ok  rules-new  | blocked  .gitignore  listing  hook');
for (const r of rows) {
  console.log(`  ${r.slug.padEnd(14)} ${String(r.declared).padEnd(7)} ${String(r.ok).padEnd(3)} ${String(r.linked + r.repointed).padEnd(4)} ${String(r.removed).padEnd(5)} | ${String(r.domains).padEnd(8)} ${String(r.rulesOk).padEnd(9)} ${String(r.rulesLinked).padEnd(10)} | ${String(r.blocked).padEnd(8)} ${r.gi.padEnd(11)} ${r.listing.padEnd(8)} ${r.hook}`);
}
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
}
if (checkOnly) {
  if (problems.length) { console.error('\nlink-registry --check FAILED'); process.exit(1); }
  console.log('\nevery declared skill is linked to the lane; nothing stale.');
} else {
  console.log(`\n${changed} link(s) changed. An edit to a linked skill edits the registry file itself - there is nothing to sync.`);
}
