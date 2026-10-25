#!/usr/bin/env node
/**
 * install-merge-driver - opt this checkout into the generated-file merge driver.
 *
 * Why it exists. `.gitattributes` names `merge=registry-generated` for every generated
 * view, but an attribute cannot carry a command: the driver itself lives in git config,
 * which is never cloned. So the attribute is inert until a machine opts in, and a machine
 * that has not opted in merges those files exactly as it always did (the built-in text
 * merge - measured, see docs/merge-driver.md). This script is the opt-in. It writes:
 *
 *   - two LOCAL repo config keys (never --global):
 *       merge.registry-generated.name
 *       merge.registry-generated.driver = node scripts/merge-generated.mjs %O %A %B %P
 *   - one managed block in each of post-merge, post-rewrite and post-commit. post-merge
 *     covers a merge that commits; post-rewrite covers `rebase` / `pull --rebase`;
 *     post-commit covers the merge that stopped on an unrelated conflict and was finished
 *     by `git commit`, which fires post-commit and NOT post-merge (measured, git 2.52).
 *
 * Hooks resolve through `git rev-parse --git-path hooks`, which is the COMMON git dir, so
 * one install covers every worktree of the checkout; so does the local config. Like
 * install-consult-hook.mjs, an existing hook is chained, never replaced: the block is
 * appended, and `--uninstall` removes only the block (and the file, if the block was all
 * it held). A core.hooksPath outside the git dir is a TRACKED directory; it is reported
 * and left alone, because writing there means a commit nobody asked for.
 *
 * Usage:
 *   node scripts/install-merge-driver.mjs [--check]     # report state (default); 1 if not installed
 *   node scripts/install-merge-driver.mjs --install     # idempotent
 *   node scripts/install-merge-driver.mjs --uninstall   # remove only what this added
 *   ... --repo <dir>                                     # another checkout (tests use temp repos)
 *
 * Exits 0 when installed (or the requested change was made), 1 when --check finds it
 * missing or partial or when --install could only do part of it (a tracked
 * core.hooksPath: driver set, hooks not written), 2 if it could not run.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

export const DRIVER = 'registry-generated';
export const CONFIG = Object.freeze({
  [`merge.${DRIVER}.name`]: 'ai-registry generated view: keep ours, regenerate after the merge',
  [`merge.${DRIVER}.driver`]: 'node scripts/merge-generated.mjs %O %A %B %P',
});
export const HOOKS = Object.freeze(['post-merge', 'post-rewrite', 'post-commit']);

const BEGIN = '# BEGIN ai-registry regen-generated (managed by scripts/install-merge-driver.mjs)';
const END = '# END ai-registry regen-generated';

/** The managed block for one hook. Silent and fast unless a merge left work pending. */
export function blockFor(hook) {
  return `${BEGIN}
# Never blocks. Rebuilds generated views a merge left pending (docs/merge-driver.md).
if [ -z "$REGISTRY_REGEN_ACTIVE" ] && [ -f scripts/regen-generated.mjs ]; then
  _rrg_dir=$(git rev-parse --git-dir 2>/dev/null)
  if [ -n "$_rrg_dir" ] && [ -f "$_rrg_dir/registry-regen-pending" ]; then
    node scripts/regen-generated.mjs --commit --hook ${hook} --hook-arg "$1" || true
  fi
  unset _rrg_dir
fi
${END}`;
}

const blockRe = new RegExp(`${BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END}\\n?`, 'g');

function git(repo, args) {
  const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() || (r.error?.message ?? '') };
}

function hookState(file, hook) {
  if (!fs.existsSync(file)) return 'absent';
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(BEGIN)) return 'foreign';
  return text.includes(blockFor(hook)) ? 'current' : 'stale';
}

function writeHook(file, hook, remove) {
  let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  text = text.replace(blockRe, '');
  if (remove) {
    if (text.trim() === '#!/bin/sh' || text.trim() === '') fs.rmSync(file, { force: true });
    else fs.writeFileSync(file, text.replace(/\n+$/, '\n'));
    return null;
  }
  let warning = null;
  if (!text.trim()) text = '#!/bin/sh\n';
  else {
    if (!text.endsWith('\n')) text += '\n';
    // An appended block after a top-level `exit` / `exec` never runs. Say so.
    const last = text.trim().split('\n').pop().trim();
    if (/^(exit|exec)\b/.test(last)) warning = `${hook}: the existing hook ends in \`${last}\`, so the appended block will not run - move that line below the block.`;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${text.replace(/\n*$/, '\n')}\n${blockFor(hook)}\n`);
  try { fs.chmodSync(file, 0o755); } catch { /* Windows has no mode bit */ }
  return warning;
}

function main(argv) {
  const install = argv.includes('--install');
  const uninstall = argv.includes('--uninstall');
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log('usage: node scripts/install-merge-driver.mjs [--check | --install | --uninstall] [--repo <dir>]');
    return EXIT.OK;
  }
  if (install && uninstall) { console.error('FATAL: --install and --uninstall are exclusive.'); return EXIT.FATAL; }
  const ri = argv.indexOf('--repo');
  const repo = path.resolve(ri === -1 ? ROOT : (argv[ri + 1] ?? ''));

  const top = git(repo, ['rev-parse', '--show-toplevel']);
  if (!top.ok) { console.error(`FATAL: ${repo} is not a git checkout (${top.err}).`); return EXIT.FATAL; }
  const common = path.resolve(repo, git(repo, ['rev-parse', '--git-common-dir']).out);
  const hooksDir = path.resolve(repo, git(repo, ['rev-parse', '--git-path', 'hooks']).out);
  const rel = path.relative(common, hooksDir);
  const hooksLocal = rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));

  const rows = [];
  let missing = 0;
  const warnings = [];

  for (const [key, want] of Object.entries(CONFIG)) {
    const have = git(repo, ['config', '--local', '--get', key]);
    const state = !have.ok ? 'absent' : have.out === want ? 'current' : 'different';
    let action = 'none';
    if (install && state !== 'current') {
      const w = git(repo, ['config', '--local', key, want]);
      if (!w.ok) { console.error(`FATAL: git config ${key}: ${w.err}`); return EXIT.FATAL; }
      action = state === 'absent' ? 'set' : 'replaced';
    } else if (uninstall && state === 'current') {
      git(repo, ['config', '--local', '--unset', key]);
      action = 'unset';
    } else if (!install && !uninstall && state !== 'current') missing += 1;
    rows.push({ item: key, state, action });
  }
  if (uninstall) {
    // Leave no empty [merge "registry-generated"] section behind; harmless if absent.
    const left = git(repo, ['config', '--local', '--get-regexp', `^merge\\.${DRIVER}\\.`]);
    if (!left.ok) git(repo, ['config', '--local', '--remove-section', `merge.${DRIVER}`]);
  }

  for (const hook of HOOKS) {
    const file = path.join(hooksDir, hook);
    if (!hooksLocal) {
      rows.push({ item: `hook ${hook}`, state: 'tracked hooksPath', action: 'manual' });
      if (!uninstall) missing += 1;
      continue;
    }
    const state = hookState(file, hook);
    let action = 'none';
    if (install && state !== 'current') {
      const w = writeHook(file, hook, false);
      if (w) warnings.push(w);
      action = state === 'foreign' ? 'chained' : state === 'stale' ? 'refreshed' : 'installed';
    } else if (uninstall && (state === 'current' || state === 'stale')) {
      writeHook(file, hook, true);
      action = 'removed';
    } else if (!install && !uninstall && state !== 'current') missing += 1;
    rows.push({ item: `hook ${hook}`, state, action });
  }

  console.log(`install-merge-driver - ${top.out}`);
  console.log(`  hooks dir: ${hooksDir}${hooksLocal ? ' (shared by every worktree)' : ' (TRACKED via core.hooksPath - not written)'}\n`);
  for (const r of rows) console.log(`  ${r.item.padEnd(34)} ${r.state.padEnd(18)} ${r.action}`);
  for (const w of warnings) console.log(`\n  WARNING ${w}`);
  if (!hooksLocal && !uninstall) {
    console.log('\nAdd this block to each of post-merge, post-rewrite and post-commit in that directory (replace <hook>):\n');
    console.log(blockFor('<hook>'));
  }

  if (!install && !uninstall) {
    console.log(missing ? `\n${missing} item(s) not installed - run with --install.` : '\ninstalled.');
    return missing ? EXIT.VIOLATIONS : EXIT.OK;
  }
  if (install && !hooksLocal) {
    // The driver is set but no hook could be written, so a merge now keeps ours and leaves a
    // pending record nothing reads. That is a partial install, and saying "installed" here
    // is how generated views would go stale with nobody told.
    console.log(`\nPARTIAL: the driver is configured but hooks NOT installed (${hooksDir} is tracked). Until the block above is in each hook there, merges of generated files keep ours and nothing regenerates.`);
    return EXIT.VIOLATIONS;
  }
  console.log(uninstall ? '\nremoved what this script manages.' : '\ninstalled. Merges of generated files now keep ours and regenerate after.');
  return EXIT.OK;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
