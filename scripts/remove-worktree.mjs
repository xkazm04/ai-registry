#!/usr/bin/env node
/**
 * remove-worktree - remove a clean git worktree without following links out of it.
 *
 *   node scripts/remove-worktree.mjs <worktree> [--dry-run]
 *
 * `git worktree remove` on Git for Windows descends into directory junctions while deleting.
 * A worktree whose node_modules held per-package junctions into its primary's node_modules
 * emptied that node_modules and deleted 608 tracked files of the primary's workspace packages
 * (gravitone, 2026-10-20). This refuses a dirty or locked worktree, deletes the tree through
 * safe-remove (every link unlinked, never entered), then prunes the worktree's admin entry.
 * Exit 0 removed, 1 refused or failed, 2 usage.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { removeTree } from './lib/safe-remove.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const target = args.find((a) => !a.startsWith('--'));
if (!target) { console.error('usage: node scripts/remove-worktree.mjs <worktree> [--dry-run]'); process.exit(2); }

const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const refuse = (why) => { console.error(`refused: ${why}`); process.exit(1); };

const wt = path.resolve(target);
if (!fs.existsSync(wt)) refuse(`${wt} does not exist`);
if (!fs.statSync(path.join(wt, '.git'), { throwIfNoEntry: false })?.isFile()) refuse(`${wt} is not a linked worktree (its .git is not a file)`);
const common = path.resolve(wt, git(wt, 'rev-parse', '--git-common-dir'));
const primary = path.dirname(common);
const listed = git(primary, 'worktree', 'list', '--porcelain').split(/\r?\n\r?\n/);
const entry = listed.find((b) => { const m = b.match(/^worktree (.+)$/m); return m && path.resolve(m[1]) === wt; });
if (!entry) refuse(`${wt} is not registered with ${primary}`);
if (/^locked/m.test(entry)) refuse('worktree is locked');
// --untracked-files=all is explicit: under status.showUntrackedFiles=no a plain --porcelain
// prints nothing for new files, the tree reads clean, and their only copy is deleted.
const dirty = git(wt, '--no-optional-locks', 'status', '--porcelain', '--untracked-files=all');
if (dirty) refuse(`worktree has uncommitted changes:\n${dirty}`);

const r = removeTree(wt, { dryRun });
console.log(JSON.stringify({ worktree: wt, dryRun, files: r.files, dirs: r.dirs, links: r.links, errors: r.errors, firstErrors: r.firstErrors }));
if (dryRun) process.exit(0);
if (fs.existsSync(wt)) refuse(`could not empty ${wt} (${r.errors} error(s))`);
git(primary, 'worktree', 'prune');
console.log(`removed ${wt}`);
