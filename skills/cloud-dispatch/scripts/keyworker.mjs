#!/usr/bin/env node
/**
 * keyworker - the process that runs INSIDE the console window `dispatch.mjs --engine key --go` opens.
 *
 *   node keyworker.mjs <itemJsonFile>
 *
 * Why it exists: the key engine spends a lane's time-limited API key on a LOCAL headless
 * `claude -p` worker that drains a registry backlog and returns one pull request, the same
 * landing contract a cloud session follows. It runs in its own console window (opened through
 * `cmd /d /c start`, like launch.mjs) so it outlives the agent session that dispatched it.
 *
 * Steps: (a) fetch origin and add the worktree <C:/t/cd-<id>> on a new branch claude/key-<id>
 * from origin/<default>, without upstream tracking so a bare `git push` can never reach the
 * default branch; copy .machine.local.json in when the repo has one. (b) spawn `claude` without a
 * shell, cwd = the worktree, prompt on stdin, argv from keyWorkerArgv. (c) the child env is
 * keyChildEnv: the lane's key as ANTHROPIC_API_KEY and no other Anthropic credential - the fleet
 * strips ANTHROPIC_API_KEY everywhere else, so the key must reach this child alone. (d) parse the
 * JSON result into the status file {exit, error, cost_usd, session_id, ended}. (e) remove the
 * worktree through scripts/remove-worktree.mjs (never `git worktree remove`: on Windows it follows
 * node_modules junctions into the primary); the branch stays. On failure the window stays 60 s.
 *
 * The item file names the key's VARIABLE (keyEnv), never its value; nothing here prints a key.
 * Builtins only; imports only its own lib/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT_REFUSED, EXIT_USAGE, KEY_ENV_PREFIX, realGit, keyChildEnv, keyWorkerArgv, parseClaudeResult, keyStatus } from './lib/core.mjs';

const MACHINE_FILE = '.machine.local.json';

/** remove-worktree.mjs in the registry checkout, run as a child; it refuses a dirty or locked worktree. */
export function realRemoveWorktree(worktree, registryDir) {
  const script = path.join(registryDir, 'scripts', 'remove-worktree.mjs');
  if (!fs.existsSync(script)) return { ok: false, reason: `${script} not found; the worktree ${worktree} was left in place` };
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, [script, worktree], { encoding: 'utf8', env, windowsHide: true });
  if (r.error) return { ok: false, reason: r.error.message };
  if (r.status !== 0) return { ok: false, reason: (r.stderr || r.stdout || `exit ${r.status}`).trim() };
  return { ok: true };
}

/**
 * One worker run. Every side effect is injectable for the tests:
 * deps: { git(repo,args), spawnSync(cmd,args,opts), env, now, removeWorktree(wt, reg), log }
 * Returns { status, cleanup } where status is what was written to the status file.
 */
export function runKeyWorker(itemFile, deps = {}) {
  const git = deps.git ?? realGit;
  const run = deps.spawnSync ?? spawnSync;
  const env = deps.env ?? process.env;
  const now = deps.now ?? (() => new Date());
  const removeWorktree = deps.removeWorktree ?? realRemoveWorktree;
  const log = deps.log ?? ((m) => console.log(`key-lane: ${m}`));

  const item = JSON.parse(fs.readFileSync(itemFile, 'utf8'));
  const write = (status) => {
    try { fs.writeFileSync(item.statusFile, `${JSON.stringify(status)}\n`); } catch (e) { log(`could not write the status file: ${e.message}`); }
    return status;
  };
  const finish = (fields) => ({ status: write(keyStatus({ ...fields, ended: now().toISOString() })), cleanup: null });

  if (typeof item.keyEnv !== 'string' || !item.keyEnv.startsWith(KEY_ENV_PREFIX)) {
    return finish({ exit: null, error: `item keyEnv must name an ${KEY_ENV_PREFIX}* variable` });
  }
  if (typeof env[item.keyEnv] !== 'string' || !env[item.keyEnv]) {
    return finish({ exit: null, error: `${item.keyEnv} is unset or empty in the worker's environment` });
  }
  const wt = item.worktree;
  if (fs.existsSync(wt)) return finish({ exit: null, error: `worktree path ${wt} already exists` });

  // (a) the worktree, from origin - the same base the sync gate checked
  const top = git(item.repo, ['rev-parse', '--show-toplevel']);
  if (top.code !== 0) return finish({ exit: null, error: `${item.repo} is not a git repository` });
  const repoTop = path.resolve(top.stdout.trim());
  const fetch = git(repoTop, ['fetch', 'origin', '--quiet']);
  if (fetch.code !== 0) return finish({ exit: null, error: `git fetch origin failed: ${fetch.stderr.trim() || `exit ${fetch.code}`}` });
  const add = git(repoTop, ['worktree', 'add', '--no-track', '-b', item.branch, wt, `origin/${item.defaultBranch}`]);
  if (add.code !== 0) return finish({ exit: null, error: `git worktree add failed: ${add.stderr.trim() || `exit ${add.code}`}` });
  log(`worktree ${wt} on ${item.branch} from origin/${item.defaultBranch}`);

  let copied = null;
  const machine = path.join(repoTop, MACHINE_FILE);
  if (fs.existsSync(machine)) {
    copied = path.join(wt, MACHINE_FILE);
    try { fs.copyFileSync(machine, copied); } catch (e) { copied = null; log(`could not copy ${MACHINE_FILE}: ${e.message}`); }
  }

  // (b, c) the worker; the prompt on stdin, the lane's key in the child env only
  let fields;
  try {
    const prompt = fs.readFileSync(item.promptFile, 'utf8');
    log(`starting claude -p ${item.model} @ ${item.effort}, max $${item.perRunUsd} (${prompt.length} chars) - lane ${item.lane}`);
    const r = run('claude', keyWorkerArgv(item), {
      cwd: wt, env: keyChildEnv(env, item.keyEnv), input: prompt, encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'inherit'], maxBuffer: 256 * 1024 * 1024, windowsHide: false,
    });
    // (d) the result
    const res = parseClaudeResult(r.stdout);
    let error;
    if (r.error) error = r.error.message;
    else if (r.status !== 0) error = r.signal ? `claude killed by ${r.signal}` : `claude exited ${r.status}`;
    else if (res.is_error === true) error = 'claude reported is_error';
    fields = { exit: r.error ? null : r.status, error, cost_usd: res.cost_usd, session_id: res.session_id };
  } catch (e) {
    fields = { exit: null, error: e.message };
  }
  const status = write(keyStatus({ ...fields, ended: now().toISOString() }));
  log(`ended: exit ${status.exit ?? 'null'}${status.cost_usd !== undefined ? `, $${status.cost_usd}` : ''}${status.error ? ` - ${status.error}` : ''}`);

  // (e) the worktree goes; the branch stays. A copy we made is ours to delete, or the tree reads dirty.
  if (copied) { try { fs.unlinkSync(copied); } catch { /* remove-worktree will report it */ } }
  let cleanup;
  try { cleanup = removeWorktree(wt, item.registryDir); } catch (e) { cleanup = { ok: false, reason: e.message }; }
  if (!cleanup.ok) {
    log(`worktree kept: ${cleanup.reason}`);
    return { status: write({ ...status, cleanup_error: cleanup.reason }), cleanup };
  }
  log(`removed ${wt}; branch ${item.branch} stays`);
  return { status, cleanup };
}

const isMain = (() => {
  try { return fs.realpathSync(process.argv[1] ?? '') === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
})();

if (isMain) {
  const [itemFile] = process.argv.slice(2);
  if (!itemFile) {
    console.error('usage: node keyworker.mjs <itemJsonFile>');
    process.exit(EXIT_USAGE);
  }
  let failed = true;
  try {
    const { status, cleanup } = runKeyWorker(itemFile);
    failed = status.exit !== 0 || Boolean(status.error) || (cleanup && !cleanup.ok);
  } catch (e) {
    console.error(`key-lane: ${e.message}`);
  }
  if (failed) {
    console.error('key-lane: this window closes in 60 s');
    setTimeout(() => process.exit(EXIT_REFUSED), 60_000);
  }
}
