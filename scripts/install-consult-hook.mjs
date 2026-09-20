#!/usr/bin/env node
/**
 * install-consult-hook — put `consult-check` in front of every commit on this machine.
 *
 * The registry's knowledge reaches a session through an always-on rule that lists 229
 * subject slugs and tells it to read the governing one before a design decision. Measured,
 * that obligation is met for a quarter of the corpus. The missing piece is not a better
 * rule; it is a moment. A commit is that moment: it is the one point where the work is
 * finished, the changed paths are known exactly, and a session is still present to act.
 *
 * THIS SCRIPT WRITES INTO OTHER PEOPLE'S REPOSITORIES, so it obeys the same law
 * `/straighten` does: **propose, never adopt**. `--check` is the default and writes
 * nothing. `--install` writes. Neither ever commits, ever pushes, or ever overwrites a
 * hook it did not author — a foreign pre-commit is reported and left exactly alone.
 *
 * Thirteen checkouts on this machine run FIVE different hook mechanisms, so the installer
 * detects rather than assumes, and it is honest about the two it will not automate:
 *
 *   .git/hooks      the hooks path resolves inside .git — MACHINE-LOCAL, so installing
 *                   there changes no tracked file and needs no commit in that project.
 *                   Preferred wherever it is available, precisely because it is free.
 *   <hooksPath>/    core.hooksPath points at a committed directory (.githooks). Installing
 *                   means a tracked file in that repo, which its owner must commit.
 *   husky           append to .husky/pre-commit, also tracked.
 *   lefthook        NOT automated. A lefthook.yml's job graph is the project's own
 *                   structure and a script that rewrites YAML it did not design will
 *                   eventually mangle one. The snippet is printed instead.
 *   pre-commit      NOT automated, for the same reason: .pre-commit-config.yaml declares
 *                   remote repos and revisions, and a local hook injected into it is a
 *                   decision that belongs to whoever maintains that config.
 *
 * The hook body is deliberately tiny and ends in `|| true`. It resolves the registry from
 * the project's own manifest, does nothing at all when the registry checkout is absent,
 * and CANNOT fail a commit. A hook that blocks gets deleted, and a deleted hook measures
 * nothing — the whole value here is the miss being written down.
 *
 * Usage:
 *   node install-consult-hook.mjs                   # report what would change
 *   node install-consult-hook.mjs --install         # write the hooks
 *   node install-consult-hook.mjs --project kp      # one project
 *   node install-consult-hook.mjs --uninstall       # remove the managed block
 *
 * Exits 0 when it ran, 1 under --check when something is not installed, 2 if it could
 * not run at all.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

const argv = process.argv.slice(2);
const install = argv.includes('--install');
const uninstall = argv.includes('--uninstall');
const projIdx = argv.indexOf('--project');
const onlyProject = projIdx === -1 ? null : argv[projIdx + 1];

if (argv.includes('--help') || argv.includes('-h')) {
  console.log('usage: node install-consult-hook.mjs [--install|--uninstall] [--project <slug>]');
  process.exit(EXIT.OK);
}

const BEGIN = '# BEGIN ai-registry consult-check (managed by ai-registry/scripts/install-consult-hook.mjs)';
const END = '# END ai-registry consult-check';

/**
 * Resolve the registry from the project's OWN manifest, not from where this script
 * happens to live: the hook outlives the invocation that wrote it, and the registry may
 * be moved or absent later. Every failure path here is a silent success.
 */
const BODY = `${BEGIN}
# Never blocks. Prints the subjects governing the staged paths and records a miss.
if [ -f .ai/manifest.yaml ]; then
  _reg="\${AI_REGISTRY_DIR:-}"
  if [ -z "$_reg" ]; then
    _reg=$(sed -n 's/^[[:space:]]*local:[[:space:]]*//p' .ai/manifest.yaml | head -1 | tr -d '"'"'"'"')
  fi
  [ -z "$_reg" ] && _reg="../ai-registry"
  if [ -f "$_reg/scripts/consult-check.mjs" ]; then
    node "$_reg/scripts/consult-check.mjs" || true
  fi
  unset _reg
fi
${END}`;

const fleet = loadFleet(ROOT);
if (!fleet.machine) {
  console.error('install-consult-hook: no machine identity (.machine.local.json) — cannot resolve any checkout.');
  process.exit(EXIT.FATAL);
}

/** What mechanism governs this repo's pre-commit, and can we manage it? */
function detect(repo) {
  const git = (args) => {
    const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
    return r.status === 0 ? r.stdout.trim() : '';
  };
  const hooksPath = git(['config', 'core.hooksPath']);
  const gitDir = path.resolve(repo, git(['rev-parse', '--git-dir']) || '.git');

  const hasLefthook = fs.existsSync(path.join(repo, 'lefthook.yml')) || fs.existsSync(path.join(repo, 'lefthook.yaml'));
  const hasPreCommitFw = fs.existsSync(path.join(repo, '.pre-commit-config.yaml'));

  // Husky owns .husky/_ as its shim directory; the file a human edits is .husky/pre-commit.
  if (hooksPath && hooksPath.includes('.husky')) {
    return { kind: 'husky', target: path.join(repo, '.husky', 'pre-commit'), tracked: true };
  }

  if (hooksPath) {
    const abs = path.isAbsolute(hooksPath) ? hooksPath : path.join(repo, hooksPath);
    // Compare by PATH SEGMENT, never by string prefix. `.githooks` starts with `.git`,
    // so a prefix test reports six of this fleet's repos — whose hooks live in a TRACKED
    // .githooks/ — as machine-local and free to write. The difference decides whether
    // installing costs a commit in someone else's repository or costs nothing.
    const rel = path.relative(path.resolve(gitDir), path.resolve(abs));
    const insideGitDir = rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
    return {
      kind: insideGitDir ? 'git-hooks' : 'hooks-path',
      target: path.join(abs, 'pre-commit'),
      tracked: !insideGitDir,
    };
  }

  // No hooksPath. The framework configs still own the moment even so.
  if (hasPreCommitFw) return { kind: 'pre-commit-framework', target: null, tracked: false };
  if (hasLefthook) return { kind: 'lefthook', target: null, tracked: false };

  return { kind: 'git-hooks', target: path.join(gitDir, 'hooks', 'pre-commit'), tracked: false };
}

/** Is our managed block already there, is the file foreign, or is there nothing? */
function stateOf(target) {
  if (!target || !fs.existsSync(target)) return 'absent';
  const text = fs.readFileSync(target, 'utf8');
  if (text.includes(BEGIN)) return text.includes(BODY) ? 'current' : 'stale';
  return 'foreign';
}

function write(target, state) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  let text = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';

  if (state === 'stale' || uninstall) {
    const re = new RegExp(`${BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END}\\n?`, 'g');
    text = text.replace(re, '');
  }
  if (uninstall) {
    // A file we created and now emptied should go, not linger as a stub shebang.
    if (text.trim() === '#!/bin/sh' || text.trim() === '') { fs.rmSync(target, { force: true }); return; }
    fs.writeFileSync(target, text, 'utf8');
    return;
  }

  if (!text.trim()) text = '#!/bin/sh\n';
  else if (!text.endsWith('\n')) text += '\n';
  fs.writeFileSync(target, `${text}\n${BODY}\n`, 'utf8');
  try { fs.chmodSync(target, 0o755); } catch { /* Windows has no mode bit to set */ }
}

const rows = [];
let pending = 0;

for (const p of Object.values(fleet.projects)) {
  if (onlyProject && p.slug !== onlyProject) continue;
  if (!p.exists) { rows.push({ slug: p.slug, kind: '-', state: 'no checkout', action: '-' }); continue; }
  if (!fs.existsSync(path.join(p.path, '.ai', 'manifest.yaml'))) {
    rows.push({ slug: p.slug, kind: '-', state: 'not a consumer', action: '-' });
    continue;
  }

  const d = detect(p.path);

  if (!d.target) {
    // The two we refuse to automate. Say so with the snippet, every run.
    rows.push({ slug: p.slug, kind: d.kind, state: 'manual', action: 'print snippet' });
    pending += 1;
    continue;
  }

  const state = stateOf(d.target);
  let action = 'none';

  if (state === 'foreign') {
    // A hook we did not author. Appending to it is still safe (our block is additive and
    // cannot fail), but overwriting is not, and we never do that.
    action = install ? 'appended' : 'would append';
    if (install) write(d.target, state);
    else pending += 1;
  } else if (uninstall) {
    if (state === 'current' || state === 'stale') { write(d.target, state); action = 'removed'; }
  } else if (state === 'current') {
    action = 'none';
  } else {
    action = install ? (state === 'stale' ? 'refreshed' : 'installed') : `would ${state === 'stale' ? 'refresh' : 'install'}`;
    if (install) write(d.target, state);
    else pending += 1;
  }

  rows.push({
    slug: p.slug,
    kind: d.kind,
    state: `${state}${d.tracked ? ' (tracked)' : ''}`,
    action,
  });
}

console.log(`install-consult-hook — machine ${fleet.machine}, ${rows.length} project(s)\n`);
console.log('  project          mechanism              state                action');
for (const r of rows) {
  console.log(`  ${r.slug.padEnd(16)} ${r.kind.padEnd(22)} ${r.state.padEnd(20)} ${r.action}`);
}

const manual = rows.filter((r) => r.action === 'print snippet');
if (manual.length) {
  console.log(`\n${manual.length} project(s) use a hook manager this script will not rewrite (${manual.map((m) => m.slug).join(', ')}).`);
  console.log('Add the equivalent of this to the project\'s own pre-commit job:\n');
  console.log('  node "$AI_REGISTRY_DIR/scripts/consult-check.mjs" || true\n');
}

const trackedWrites = rows.filter((r) => r.state.includes('(tracked)') && r.action.startsWith('would'));
if (trackedWrites.length && !install) {
  console.log(`${trackedWrites.length} of these write a TRACKED file, so their project owner must commit it: ${trackedWrites.map((t) => t.slug).join(', ')}.`);
  console.log('This script never commits and never pushes.\n');
}

if (!install && !uninstall) {
  console.log(pending === 0 ? '\nevery consumer already carries the hook.' : `\n${pending} project(s) not yet covered — re-run with --install.`);
  process.exit(pending === 0 ? EXIT.OK : EXIT.VIOLATIONS);
}

console.log(uninstall ? '\nmanaged block removed where it was present.' : '\ninstalled. The hook never blocks a commit.');
process.exit(EXIT.OK);
