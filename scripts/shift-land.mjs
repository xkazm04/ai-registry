#!/usr/bin/env node
/**
 * shift-land - the door a /shift lander commits through, and the gate the supervisor pushes through.
 *
 * WHY A DOOR
 * On 2026-11-06 one lander committed with check-run-results red, because "gate, then commit" was two
 * steps in a command line an agent wrote and the command did not stop. Two others deadlocked, each
 * waiting for the other's commit, because lines of shared ledgers intertwined in one dirty checkout.
 * The fix for that deadlock (the first lander carries the shared files) could commit a line naming a
 * sibling's note not yet in HEAD, and a gate over the working tree stayed green because the note was
 * on disk. All three come from gating a tree that is not the tree being landed. So a lander names
 * what it landed, and this script does the rest.
 *
 * WHY THE PINNED TREE
 * The tree starts from HEAD in a temporary index and takes exactly the named paths from the working
 * tree. A sibling's half-written file is not in it, so it can neither turn the gate red nor be carried.
 * The gate runs on a checkout of that tree, and the commit is made from that exact tree object.
 *
 * WHY ONE LOCK IS HELD FOR MINUTES
 * Everywhere else a board lock is held for seconds. This one holds the whole gate, because the tree
 * only means something while HEAD stays its parent, and because only landers contend here: a miner, a
 * proof or a filler never takes `commit`. The hold stays under what the board would reclaim: it treats
 * an acquire younger than 45 minutes as evidence of life, so the gate has a 35 minute ceiling. A hard
 * kill of this process skips `finally`: the lock then waits for the board's reclaim and an `sl-*`
 * directory beside the checkout must be removed by name.
 *
 * SHORT PATH
 * The checkout sits beside the repository as `sl-<id>`, never longer than a checkout that already
 * works, so the deepest bundle paths still fit, and relative walks to sibling projects still resolve.
 *
 * LEDGERS
 * `--ledger-dir` mirrors the repository: `<dir>/librarian/applied.md` is a fragment for that ledger,
 * applied to HEAD's copy inside the lock. Shared ledgers therefore never sit dirty between landers,
 * and naming one as a path is refused. Rules per target, in applyFragment:
 *   librarian/sources/index.md       under the `## Mined` table's delimiter row, the file's own
 *                                    "newest first". Its stray rows at end of file are left where they are.
 *   librarian/applied.md             table rows, end of file
 *   .claude/skills/<s>/SCORECARD.md  a table row, end of file; the stage line may follow it
 *   [.claude/]skills/<s>/LESSONS.md  one `## ` block, end of file. A bare bullet would land under
 *                                    whichever sibling's heading came last, so it is refused.
 *   librarian/harvest/backlog.jsonl  by id: a new id appends, a known id replaces its row in place
 * Any fragment that cannot apply refuses the whole landing. A fragment already present refuses too,
 * so a re-run after a landing cannot double a row. A sources row must link a note in the pinned tree.
 *
 * WHAT IT CANNOT SEE
 * Git holds no authorship for an uncommitted line. Inside a named file that is neither a ledger nor
 * generated, the only evidence of a sibling is a live board claim on that path (`run-board check`).
 * Two authors in one unclaimed file are carried together. The rule stays: a lander names its own files.
 *
 * HOOKS
 * `commit-tree` and `update-ref` fire no commit hooks. This repo has post-commit, post-merge and
 * post-rewrite only, all the managed regen block (docs/merge-driver.md), with no core.hooksPath and no
 * pre-commit, commit-msg or reference-transaction hook. That block acts only on a pending record a
 * merge left, and this door regenerates and gates every landing, so skipping post-commit loses nothing
 * here; a record that is pending stays pending for `push`, which runs the regen. If a checking hook is
 * ever added, this paragraph is false and the door must run it.
 *
 * COMMANDS
 *   commit --run <id> --message-file <f> [--ledger-dir <d>] -- <paths...>
 *   push --remote <r> --branch <b> [--run <id>]
 * No --force and no --no-verify exist, and a red gate is not retried: run-tests failed then passed
 * twice on 2026-11-06, so a failure needs its saved log read, and a retry would discard the evidence.
 *
 * OUTPUT one JSON line on stdout, `state` one of landed | landed-dirty-checkout | pushed | refused.
 * EXIT 0 landed or pushed · 1 refused: gate red, a named path or fragment refused, or landed with a
 * file left dirty (read `state`) · 2 could not run · 3 a sibling holds it: lock, moved HEAD, live lander
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { readRunning, splitRunning } from './lib/shift-running.mjs';
import { parseLedger } from './backlog-wave.mjs';
import { GENERATORS, PENDING_NAME, globToRegExp } from './regen-generated.mjs';
import { UsageError, parseArgs, sleepSync, stateDir } from './shift-queue.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const LOCK_NAME = 'commit';
const LOCK_WAIT_S = 3600;
const LOCK_TTL_S = 3000;
const GATE_CEILING_MS = 35 * 60 * 1000;
const RUN_ID_RE = /^[A-Za-z0-9._:-]+$/;
const ZERO = '0'.repeat(40);

/** Ends a landing with a state and an exit code. Anything else thrown is a crash, not a verdict. */
class Refusal extends Error {
  constructor(code, exit, message, fields = {}) {
    super(message);
    Object.assign(this, { code, exit, fields });
  }
}

/* ---------------------------------------------------------------- git */

/** A hook or a parent's GIT_INDEX_FILE must not reach any command here: every one names its own. */
function gitEnv(extra = {}) {
  const env = { ...process.env };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX', 'GIT_OBJECT_DIRECTORY']) delete env[k];
  if (process.platform === 'win32') Object.assign(env, { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.longpaths', GIT_CONFIG_VALUE_0: 'true' });
  return { ...env, ...extra };
}

function git(cwd, args, { env = {}, input } = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, env: gitEnv(env), input, windowsHide: true });
  return { ok: r.status === 0, out: r.stdout ?? '', err: (r.stderr ?? '').trim() || (r.error?.message ?? '') };
}

function must(cwd, args, opts) {
  const r = git(cwd, args, opts);
  if (!r.ok) throw new Refusal('git-failed', EXIT.FATAL, `git ${args.join(' ')}: ${r.err}`);
  return r.out;
}

const literal = (p) => `:(top,literal)${p}`;

/** A live git process holds index.lock for moments; only that one failure is worth waiting out. */
function withIndexRetry(fn) {
  for (let attempt = 0; ; attempt++) {
    const r = fn();
    if (r.ok || attempt >= 10 || !/index\.lock/.test(r.err)) return r;
    sleepSync(300);
  }
}

/* ---------------------------------------------------------------- what may be named */

/** Pure. The shared ledgers, by repo-relative path. Null means not a ledger. */
export function ledgerRule(p) {
  if (p === 'librarian/sources/index.md') return 'sources-index';
  if (p === 'librarian/applied.md') return 'table-rows';
  if (p === 'librarian/harvest/backlog.jsonl') return 'backlog';
  if (/^\.claude\/skills\/[^/]+\/SCORECARD\.md$/.test(p)) return 'scorecard';
  if (/^(\.claude\/)?skills\/[^/]+\/LESSONS\.md$/.test(p)) return 'lessons';
  return null;
}

const generatedTest = (generators) => {
  const res = generators.flatMap((g) => g.paths).map(globToRegExp);
  return (p) => res.some((re) => re.test(p));
};

function repoRelative(root, raw) {
  const rel = path.relative(root, path.resolve(root, raw)).split(path.sep).join('/');
  if (!rel || rel === '..' || rel.startsWith('../') || path.isAbsolute(rel)) {
    throw new Refusal('path-refused', EXIT.VIOLATIONS, `${raw} is not a path inside this repository`, { path: raw });
  }
  return rel;
}

function refuseNamed(p, why) {
  throw new Refusal('path-refused', EXIT.VIOLATIONS, `${p}: ${why}`, { path: p });
}

/* ---------------------------------------------------------------- fragments */

export class FragmentRefusal extends Error {}

const rowsOf = (text) => text.split('\n').filter((l) => l.trim());
const isRow = (l) => l.startsWith('|') && l.trimEnd().endsWith('|');

function refuseRepeat(target, current, lines) {
  const have = new Set(current.split('\n'));
  const repeat = lines.find((l) => have.has(l));
  if (repeat) throw new FragmentRefusal(`${target}: already holds this line: ${repeat.slice(0, 120)}`);
}

const appended = (current, text) => `${current}${current.endsWith('\n') || !current ? '' : '\n'}${text}`;

/** Pure. The ledger's new text, or a FragmentRefusal. See the header for each rule. */
export function applyFragment(target, current, fragment) {
  const rule = ledgerRule(target);
  if (!rule) throw new FragmentRefusal(`${target} is not a shared ledger this door knows`);
  if (fragment.includes('�')) throw new FragmentRefusal(`${target}: fragment is not valid UTF-8`);
  const text = `${fragment.replace(/\r\n/g, '\n').replace(/\n+$/, '').replace(/^\n+/, '')}\n`;
  if (!text.trim()) throw new FragmentRefusal(`${target}: fragment is empty`);
  const lines = rowsOf(text);

  if (rule === 'sources-index' || rule === 'table-rows') {
    const bad = lines.find((l) => !isRow(l));
    if (bad) throw new FragmentRefusal(`${target}: every fragment line must be a table row, got: ${bad.slice(0, 120)}`);
    refuseRepeat(target, current, lines);
    if (rule === 'table-rows') return appended(current, `${lines.join('\n')}\n`);
    const all = current.split('\n');
    const mined = all.indexOf('## Mined');
    const delim = mined < 0 ? -1 : all.findIndex((l, i) => i > mined && /^\|\s*-{3}/.test(l));
    if (delim < 0) throw new FragmentRefusal(`${target}: no \`## Mined\` table to insert under`);
    all.splice(delim + 1, 0, ...lines);
    return all.join('\n');
  }

  if (rule === 'scorecard') {
    if (!isRow(lines[0])) throw new FragmentRefusal(`${target}: fragment must open with a table row`);
    refuseRepeat(target, current, [lines[0]]);
    return appended(current, text);
  }

  if (rule === 'lessons') {
    if (!lines[0].startsWith('## ')) throw new FragmentRefusal(`${target}: fragment must open with its own \`## <version> - <date> - <scope>\` heading`);
    if (current.includes(text.trim())) throw new FragmentRefusal(`${target}: already holds this block`);
    return appended(current, `\n${text}`);
  }

  // backlog: keyed by id, so a held row can change state without a second writer in the shared file.
  const all = current.split('\n');
  if (all[all.length - 1] === '') all.pop();
  for (const line of lines) {
    let row;
    try { row = JSON.parse(line); } catch { throw new FragmentRefusal(`${target}: fragment line is not JSON: ${line.slice(0, 120)}`); }
    if (!row.id) throw new FragmentRefusal(`${target}: fragment row has no id: ${line.slice(0, 120)}`);
    const at = all.findIndex((l) => { try { return JSON.parse(l).id === row.id; } catch { return false; } });
    if (at >= 0 && all[at] === line) throw new FragmentRefusal(`${target}: already holds row ${row.id}`);
    if (at >= 0) all[at] = line; else all.push(line);
  }
  const out = `${all.join('\n')}\n`;
  try { parseLedger(out); } catch (e) { throw new FragmentRefusal(`${target}: ${e.message}`); }
  return out;
}

function fragmentsIn(dir) {
  const found = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else found.push({ target: path.relative(dir, full).split(path.sep).join('/'), file: full });
    }
  };
  walk(dir);
  return found;
}

/* ---------------------------------------------------------------- the pinned tree */

/** Steps 2 and 3. Returns the tree object: HEAD, the named paths, and the applied fragments. */
function buildPinned(ctx, { head, gitDir, run, paths, ledgerDir, isGenerated }) {
  const index = path.join(gitDir, `shift-land-${process.pid}.index`);
  const env = { GIT_INDEX_FILE: index };
  try {
    must(ctx.root, ['read-tree', head], { env });
    const inHead = (p) => git(ctx.root, ['cat-file', '-e', `${head}:${p}`]).ok;

    for (const p of paths) {
      if (isGenerated(p)) refuseNamed(p, 'generated, and the door regenerates it; a checkout copy could hold a sibling\'s view');
      if (ledgerRule(p) && inHead(p)) refuseNamed(p, 'a shared ledger; write a fragment under --ledger-dir');
      let st = null;
      try { st = fs.lstatSync(path.join(ctx.root, p)); } catch { /* a deletion, or a typo */ }
      if (st?.isDirectory()) refuseNamed(p, 'a directory; name files, since a directory can sweep a sibling\'s');
      if (!st && !inHead(p)) refuseNamed(p, 'neither on disk nor in HEAD');
    }
    if (paths.length) {
      const held = spawnSync(process.execPath, [ctx.board, 'check', '--run', run, ...paths], { cwd: ctx.root, encoding: 'utf8', env: gitEnv(), windowsHide: true });
      if (held.status === EXIT.CONTENDED) throw new Refusal('path-refused', EXIT.VIOLATIONS, `a live sibling holds a named path, so its content cannot be told from yours:\n${held.stderr.trim()}`);
      if (held.status !== EXIT.OK) throw new Refusal('board-failed', EXIT.FATAL, `run-board check: ${held.stderr || held.error?.message}`);
      const added = git(ctx.root, ['add', '--', ...paths.map(literal)], { env });
      if (!added.ok) throw new Refusal('path-refused', EXIT.VIOLATIONS, `git add refused a named path: ${added.err}`);
    }

    const ledger = [];
    const sourceLinks = [];
    if (ledgerDir) {
      const fragments = fragmentsIn(ledgerDir);
      if (!fragments.length) throw new Refusal('fragment-refused', EXIT.VIOLATIONS, `--ledger-dir ${ledgerDir} holds no fragment`);
      try {
        for (const { target, file } of fragments) {
          if (!ledgerRule(target)) throw new FragmentRefusal(`${target} is not a shared ledger this door knows`);
          if (!inHead(target)) throw new FragmentRefusal(`${target} is not in HEAD`);
          const fragment = fs.readFileSync(file, 'utf8');
          const current = must(ctx.root, ['cat-file', 'blob', `${head}:${target}`]);
          const next = applyFragment(target, current, fragment);
          const sha = must(ctx.root, ['hash-object', '-w', '--stdin', `--path=${target}`], { input: next }).trim();
          const mode = must(ctx.root, ['ls-tree', head, '--', target]).split(' ')[0];
          must(ctx.root, ['update-index', '--add', '--cacheinfo', `${mode},${sha},${target}`], { env });
          ledger.push(target);
          if (ledgerRule(target) === 'sources-index') {
            for (const m of fragment.matchAll(/\]\(([^)#\s]+\.md)\)/g)) sourceLinks.push(path.posix.join(path.posix.dirname(target), m[1]));
          }
        }
      } catch (e) {
        if (e instanceof FragmentRefusal) throw new Refusal('fragment-refused', EXIT.VIOLATIONS, e.message);
        throw e;
      }
    }

    const tree = must(ctx.root, ['write-tree'], { env }).trim();
    // The carry bug by name: a ledger line must not reach a commit ahead of the note it points at.
    for (const note of sourceLinks) {
      if (!git(ctx.root, ['cat-file', '-e', `${tree}:${note}`]).ok) {
        throw new Refusal('fragment-refused', EXIT.VIOLATIONS, `a sources row links ${note}, which is not in this landing's tree; name the note, or let its own lander write the row`);
      }
    }
    return { tree, ledger };
  } finally {
    fs.rmSync(index, { force: true });
    fs.rmSync(`${index}.lock`, { force: true });
  }
}

/* ---------------------------------------------------------------- the short checkout */

function addCheckout(ctx, commit) {
  const wt = path.join(ctx.tmpParent ?? path.dirname(ctx.root), `sl-${Number(ctx.now()).toString(36).slice(-6)}`);
  must(ctx.root, ['worktree', 'add', '--detach', '--quiet', wt, commit]);
  const machine = path.join(ctx.root, '.machine.local.json');
  if (fs.existsSync(machine)) fs.copyFileSync(machine, path.join(wt, '.machine.local.json'));
  return wt;
}

/** By its own name, never by a sweep: siblings keep worktrees beside this one. */
function removeCheckout(ctx, wt) {
  if (!wt) return;
  let r = git(ctx.root, ['worktree', 'remove', '--force', wt]);
  if (!r.ok) { sleepSync(1000); r = git(ctx.root, ['worktree', 'remove', '--force', wt]); }
  if (!r.ok) {
    fs.rmSync(wt, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
    git(ctx.root, ['worktree', 'prune']);
  }
  if (fs.existsSync(wt)) ctx.err(`shift-land: could not remove ${wt}; remove it by name`);
}

/* ---------------------------------------------------------------- generators and the gate */

/** The generators the gate's lanes name, read from regen-generated's one declaration. */
function regenerate(ctx, { wt, head, tree, messageFile, logFd, isGenerated }) {
  for (const g of ctx.generators) {
    fs.writeSync(logFd, `--- regenerate scripts/${g.script}\n`);
    const r = spawnSync(process.execPath, [path.join(wt, 'scripts', g.script)], { cwd: wt, stdio: ['ignore', logFd, logFd], env: gitEnv(), windowsHide: true });
    if (r.status !== EXIT.OK) throw new Refusal('generator-failed', EXIT.VIOLATIONS, `${g.script} exited ${r.status ?? r.signal ?? r.error?.message}`);
  }
  const parts = must(wt, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--no-renames']).split('\0').filter(Boolean);
  const changed = parts.map((e) => e.slice(3));
  const stray = changed.filter((p) => !isGenerated(p));
  if (stray.length) throw new Refusal('generator-strayed', EXIT.FATAL, `a generator changed files outside the generated set: ${stray.join(', ')}`);
  if (!changed.length) return { tree, regenerated: [] };
  must(wt, ['add', '--', ...changed.map(literal)]);
  const gatedTree = must(wt, ['write-tree']).trim();
  const commit = must(wt, ['commit-tree', gatedTree, '-p', head, '-F', messageFile]).trim();
  must(wt, ['update-ref', '--no-deref', 'HEAD', commit]);
  return { tree: gatedTree, regenerated: changed };
}

const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

function openGateLog(ctx, label) {
  const rel = `.ai/shift/gate/${label.replace(/[^A-Za-z0-9._-]/g, '_')}-${stamp(ctx.now())}.txt`;
  const file = path.join(ctx.root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return { rel, fd: fs.openSync(file, 'w') };
}

/**
 * Runs gate.mjs --all with stdout and stderr on the log's descriptor, so no pipe stands between the
 * child and its status, and reads the status. Output is never parsed.
 */
function runGate(wt, logFd) {
  const started = Date.now();
  fs.writeSync(logFd, '--- node scripts/gate.mjs --all\n');
  const r = spawnSync(process.execPath, [path.join(wt, 'scripts', 'gate.mjs'), '--all'], {
    cwd: wt, stdio: ['ignore', logFd, logFd], env: gitEnv(), timeout: GATE_CEILING_MS, killSignal: 'SIGKILL', windowsHide: true,
  });
  fs.writeSync(logFd, `\n--- gate status=${r.status} signal=${r.signal ?? 'none'}${r.error ? ` error=${r.error.message}` : ''}\n`);
  return { status: r.status, signal: r.signal, error: r.error, ms: Date.now() - started };
}

function refuseUnlessGreen(gate, gateLog) {
  if (gate.status === EXIT.OK) return;
  const finished = gate.status !== null && !gate.error;
  const code = finished && gate.status === EXIT.VIOLATIONS ? EXIT.VIOLATIONS : EXIT.FATAL;
  throw new Refusal('gate-red', code, `gate exit ${gate.status ?? gate.signal ?? gate.error?.message}; HEAD left alone; read ${gateLog}`, { gateExit: gate.status });
}

/* ---------------------------------------------------------------- the shared checkout */

function parseRawDiff(raw) {
  const out = [];
  const parts = raw.split('\0').filter(Boolean);
  for (let i = 0; i < parts.length; i += 2) {
    const [oldMode, newMode, oldSha, newSha] = parts[i].slice(1).split(' ');
    out.push({ path: parts[i + 1], oldMode, newMode, oldSha, newSha });
  }
  return out;
}

const present = (sha) => (sha === ZERO ? null : sha);

/**
 * Step 5's second half. read-tree -m -u is git's own two-way merge, and it refuses a whole update for
 * one dirty path, even one that already holds the new content, which is every lander's own file. So
 * each changed path is first sorted by what the checkout holds:
 *   own      the disk already holds the new content: the index learns it, the disk is not touched
 *   clean    index and disk hold the old content: read-tree writes the new content
 *   dirty    anything else: the index learns the new content so HEAD and index agree, the disk is not
 *            touched, and the path is named, because a sibling's bytes must never be overwritten
 * After the sort read-tree still guards the clean ones, so a write racing this step refuses rather than
 * clobbers. A path no landing changed is carried by read-tree whatever state it is in.
 */
function updateCheckout(ctx, { oldSha, newSha }) {
  const root = ctx.root;
  const changed = parseRawDiff(must(root, ['diff-tree', '-r', '-z', '--raw', '--no-renames', '--no-abbrev', oldSha, newSha]));
  let dirty = [];
  let last = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    withIndexRetry(() => git(root, ['update-index', '-q', '--refresh']));
    const index = new Map();
    for (const e of must(root, ['ls-files', '-s', '-z']).split('\0').filter(Boolean)) {
      const [meta, p] = e.split('\t');
      index.set(p, meta.split(' ')[1]);
    }
    const onDisk = changed.filter((c) => {
      try { return fs.lstatSync(path.join(root, c.path)).isFile(); } catch { return false; }
    });
    const hashes = onDisk.length ? must(root, ['hash-object', '--stdin-paths'], { input: `${onDisk.map((c) => c.path).join('\n')}\n` }).trim().split('\n') : [];
    const disk = new Map(onDisk.map((c, i) => [c.path, hashes[i]]));

    dirty = [];
    const info = [];
    const entry = (c, wantNew) => {
      const sha = wantNew ? present(c.newSha) : present(c.oldSha);
      return sha ? `${wantNew ? c.newMode : c.oldMode} ${sha}\t${c.path}\0` : `0 ${ZERO}\t${c.path}\0`;
    };
    for (const c of changed) {
      const [was, now] = [present(c.oldSha), present(c.newSha)];
      const onIndex = index.get(c.path) ?? null;
      const here = disk.get(c.path) ?? null;
      const blockedByDir = !disk.has(c.path) && fs.existsSync(path.join(root, c.path));
      const stagedOther = onIndex !== was && onIndex !== now;
      if (!blockedByDir && here === now && !stagedOther) {
        if (onIndex !== now) info.push(entry(c, true));
      } else if (!blockedByDir && here === was && !stagedOther) {
        if (onIndex !== was) info.push(entry(c, false));
      } else {
        dirty.push({ path: c.path, reason: stagedOther ? 'staged different content' : 'dirty with different content' });
        if (onIndex !== now) info.push(entry(c, true));
      }
    }
    if (info.length) {
      const r = withIndexRetry(() => git(root, ['update-index', '-z', '--index-info'], { input: info.join('') }));
      if (!r.ok) { last = r.err; continue; }
    }
    const merged = withIndexRetry(() => git(root, ['read-tree', '-m', '-u', oldSha, newSha]));
    if (merged.ok) {
      withIndexRetry(() => git(root, ['update-index', '-q', '--refresh']));
      return { dirty };
    }
    last = merged.err;
  }
  return { dirty, failed: last };
}

/* ---------------------------------------------------------------- the lock */

function takeLock(ctx, run) {
  const r = spawnSync(process.execPath, [ctx.board, 'lock', ctx.lockName, '--run', run, '--wait', String(LOCK_WAIT_S), '--ttl', String(LOCK_TTL_S)], {
    cwd: ctx.root, encoding: 'utf8', env: gitEnv(), windowsHide: true,
  });
  if (r.status === EXIT.CONTENDED) throw new Refusal('lock-contended', EXIT.CONTENDED, `lock ${ctx.lockName} stayed held for ${LOCK_WAIT_S} s: ${r.stderr.trim()}`);
  if (r.status !== EXIT.OK) throw new Refusal('board-failed', EXIT.FATAL, `run-board lock: ${r.stderr || r.error?.message}`);
  // The board calls a second take by one run a no-op. Two doors would then both believe they hold it,
  // and the first to finish would release it under the other.
  if (/already held/.test(r.stdout)) throw new Refusal('lock-already-held', EXIT.FATAL, `run ${run} already holds lock ${ctx.lockName}; the door takes it itself, so release it first`);
}

function releaseLock(ctx, run) {
  const r = spawnSync(process.execPath, [ctx.board, 'unlock', ctx.lockName, '--run', run], { cwd: ctx.root, encoding: 'utf8', env: gitEnv(), windowsHide: true });
  if (r.status !== EXIT.OK) ctx.err(`shift-land: could not release lock ${ctx.lockName}: ${r.stderr || r.error?.message}`);
}

/* ---------------------------------------------------------------- shared shape */

function requireQuietCheckout(ctx, gitDir) {
  const busy = ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply'].filter((n) => fs.existsSync(path.join(gitDir, n)));
  if (busy.length) throw new Refusal('checkout-busy', EXIT.CONTENDED, `this checkout is mid-operation (${busy.join(', ')})`);
}

function currentBranch(root) {
  const r = git(root, ['symbolic-ref', '-q', 'HEAD']);
  if (!r.ok) throw new Refusal('detached-head', EXIT.FATAL, 'HEAD is not on a branch');
  return r.out.trim();
}

/** Holds the lock around `fn`, always releases it, always prints the one JSON line. */
function door(ctx, run, report, fn) {
  const asked = ctx.now();
  let started = asked;
  let held = false;
  let exit = EXIT.OK;
  try {
    takeLock(ctx, run);
    held = true;
    started = ctx.now();
    report.lockWaitMs = started - asked;
    exit = fn();
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    Object.assign(report, { state: report.state === 'landed' ? report.state : 'refused', refused: e.code, message: e.message, ...e.fields });
    exit = e.exit;
  } finally {
    if (held) {
      releaseLock(ctx, run);
      report.lockHeldMs = ctx.now() - started;
    }
    ctx.log(JSON.stringify(report));
  }
  return exit;
}

/* ---------------------------------------------------------------- commit */

function cmdCommit(argv, ctx) {
  const dash = argv.indexOf('--');
  const named = dash < 0 ? [] : argv.slice(dash + 1);
  const { positional, opts } = parseArgs(dash < 0 ? argv : argv.slice(0, dash), { valued: ['run', 'message-file', 'ledger-dir'] });
  if (positional.length) throw new UsageError(`paths follow a bare --, got: ${positional.join(' ')}`);
  const run = opts.run?.[0];
  if (!run || !RUN_ID_RE.test(run)) throw new UsageError('commit needs --run <id>, a plain board run id');
  if (!opts['message-file']) throw new UsageError('commit needs --message-file <f>');
  const messageFile = path.resolve(ctx.root, opts['message-file'][0]);
  if (!fs.existsSync(messageFile) || !fs.readFileSync(messageFile, 'utf8').trim()) throw new UsageError(`--message-file ${messageFile} is missing or empty`);
  const ledgerDir = opts['ledger-dir'] ? path.resolve(ctx.root, opts['ledger-dir'][0]) : null;
  if (ledgerDir && !fs.statSync(ledgerDir, { throwIfNoEntry: false })?.isDirectory()) throw new UsageError(`--ledger-dir ${ledgerDir} is not a directory`);
  if (!named.length && !ledgerDir) throw new UsageError('commit needs paths after --, or --ledger-dir');

  const report = { state: 'refused', run, sha: null, gateLog: null };
  return door(ctx, run, report, () => {
    const gitDir = must(ctx.root, ['rev-parse', '--absolute-git-dir']).trim();
    const paths = [...new Set(named.map((p) => repoRelative(ctx.root, p)))];
    requireQuietCheckout(ctx, gitDir);
    const branch = currentBranch(ctx.root);
    const head = must(ctx.root, ['rev-parse', '--verify', 'HEAD']).trim();
    const isGenerated = generatedTest(ctx.generators);
    Object.assign(report, { branch: branch.replace('refs/heads/', ''), parent: head });

    const { tree: pinned, ledger } = buildPinned(ctx, { head, gitDir, run, paths, ledgerDir, isGenerated });
    if (pinned === must(ctx.root, ['rev-parse', `${head}^{tree}`]).trim()) {
      throw new Refusal('nothing-to-land', EXIT.VIOLATIONS, 'the named paths and fragments change nothing against HEAD');
    }
    const commit = must(ctx.root, ['commit-tree', pinned, '-p', head, '-F', messageFile]).trim();

    let wt = null;
    let log = null;
    let sha;
    let gatedTree;
    try {
      log = openGateLog(ctx, run);
      report.gateLog = log.rel;
      wt = addCheckout(ctx, commit);
      const regen = regenerate(ctx, { wt, head, tree: pinned, messageFile, logFd: log.fd, isGenerated });
      gatedTree = regen.tree;
      Object.assign(report, { ledger, regenerated: regen.regenerated });
      const gate = runGate(wt, log.fd);
      report.gateMs = gate.ms;
      refuseUnlessGreen(gate, log.rel);
      // Check mode writes nothing tracked. If it ever did, what passed is not this tree.
      const wrote = must(wt, ['status', '--porcelain=v1', '--untracked-files=no']).trim();
      if (wrote) throw new Refusal('gate-wrote', EXIT.FATAL, `the gate changed tracked files, so its verdict is not about this tree: ${wrote}`);
      sha = must(wt, ['rev-parse', 'HEAD']).trim();
      if (must(wt, ['rev-parse', 'HEAD^{tree}']).trim() !== gatedTree) throw new Refusal('gate-wrote', EXIT.FATAL, 'the checkout is not on the gated tree');
    } finally {
      if (log) fs.closeSync(log.fd);
      removeCheckout(ctx, wt);
    }

    const moved = git(ctx.root, ['update-ref', '-m', `shift-land: ${run}`, branch, sha, head]);
    if (!moved.ok) {
      throw new Refusal('head-moved', EXIT.CONTENDED, `${branch} moved while the gate ran, so this gate is about a tree that is not next: ${moved.err}`, {
        head: must(ctx.root, ['rev-parse', 'HEAD']).trim(),
      });
    }
    Object.assign(report, { state: 'landed', sha, tree: gatedTree });

    const landedTree = must(ctx.root, ['rev-parse', `${sha}^{tree}`]).trim();
    const headNow = must(ctx.root, ['rev-parse', 'HEAD']).trim();
    if (headNow !== sha || landedTree !== gatedTree) throw new Refusal('verify-failed', EXIT.FATAL, `HEAD is ${headNow}, tree ${landedTree}; gated ${sha}, tree ${gatedTree}`);

    const { dirty, failed } = updateCheckout(ctx, { oldSha: head, newSha: sha });
    if (failed) {
      throw new Refusal('checkout-stale', EXIT.FATAL, `HEAD moved to ${sha}, but this checkout's index and files were not updated: ${failed}. Run: git read-tree -m -u ${head} ${sha}`, { sha });
    }
    if (dirty.length) {
      report.state = 'landed-dirty-checkout';
      report.dirty = dirty;
      report.message = `HEAD moved to ${sha}. These files were left as they were on disk, and now differ from HEAD: read their diff before anyone commits them, because committing the disk copy would drop this landing's content: ${dirty.map((d) => d.path).join(', ')}`;
      return EXIT.VIOLATIONS;
    }
    return EXIT.OK;
  });
}

/* ---------------------------------------------------------------- push */

function cmdPush(argv, ctx) {
  const { positional, opts } = parseArgs(argv, { valued: ['remote', 'branch', 'run'] });
  if (positional.length) throw new UsageError(`unexpected: ${positional.join(' ')}`);
  const remote = opts.remote?.[0];
  const branch = opts.branch?.[0];
  if (!remote || !branch) throw new UsageError('push needs --remote <r> and --branch <b>');
  const run = opts.run?.[0] ?? 'shift-push';
  if (!RUN_ID_RE.test(run)) throw new UsageError('--run must be a plain board run id');

  const report = { state: 'refused', run, remote, branch, sha: null, gateLog: null };
  return door(ctx, run, report, () => {
    const root = ctx.root;
    const gitDir = must(root, ['rev-parse', '--absolute-git-dir']).trim();
    requireQuietCheckout(ctx, gitDir);

    const { live } = splitRunning(readRunning(stateDir(root)), ctx.now());
    const landers = live.filter((r) => r.kind === 'lander').map((r) => r.key);
    if (landers.length) throw new Refusal('lander-live', EXIT.CONTENDED, `a lander is live: ${landers.join(', ')}`, { landers });

    if (currentBranch(root) !== `refs/heads/${branch}`) throw new Refusal('wrong-branch', EXIT.FATAL, `this checkout is not on ${branch}`);
    const tracked = () => must(root, ['status', '--porcelain=v1', '--untracked-files=no']).trim();
    if (tracked()) throw new Refusal('tree-dirty', EXIT.VIOLATIONS, `the tree has tracked changes:\n${tracked()}`);

    const tracking = `refs/remotes/${remote}/${branch}`;
    const fetch = () => must(root, ['fetch', '--quiet', remote, `+refs/heads/${branch}:${tracking}`]);
    const ahead = () => Number(must(root, ['rev-list', '--count', `${tracking}..HEAD`]).trim());
    fetch();
    if (ahead() === 0) throw new Refusal('not-ahead', EXIT.VIOLATIONS, `HEAD is not ahead of ${remote}/${branch}`);

    const pulled = git(root, ['pull', '--rebase', '--no-autostash', '--quiet', remote, branch]);
    if (!pulled.ok) {
      const conflicts = git(root, ['diff', '--name-only', '--diff-filter=U']).out.trim().split('\n').filter(Boolean);
      git(root, ['rebase', '--abort']);
      throw new Refusal('rebase-failed', EXIT.VIOLATIONS, `git pull --rebase failed and was aborted: ${pulled.err}`, { conflicts });
    }
    // The managed post-rewrite hook normally clears this. A record still pending means it could not.
    if (fs.existsSync(path.join(gitDir, PENDING_NAME))) {
      const regen = spawnSync(process.execPath, [path.join(root, 'scripts', 'regen-generated.mjs'), '--commit'], { cwd: root, encoding: 'utf8', env: gitEnv(), windowsHide: true });
      if (regen.status !== EXIT.OK) throw new Refusal('regen-failed', EXIT.VIOLATIONS, `regen-generated exit ${regen.status}: ${regen.stderr}`);
    }
    if (tracked()) throw new Refusal('tree-dirty', EXIT.VIOLATIONS, `the rebase left tracked changes:\n${tracked()}`);

    const sha = must(root, ['rev-parse', 'HEAD']).trim();
    report.sha = sha;
    let wt = null;
    let log = null;
    try {
      log = openGateLog(ctx, run);
      report.gateLog = log.rel;
      wt = addCheckout(ctx, sha);
      const gate = runGate(wt, log.fd);
      report.gateMs = gate.ms;
      refuseUnlessGreen(gate, log.rel);
    } finally {
      if (log) fs.closeSync(log.fd);
      removeCheckout(ctx, wt);
    }

    fetch();
    if (!git(root, ['merge-base', '--is-ancestor', tracking, sha]).ok) {
      throw new Refusal('remote-moved', EXIT.CONTENDED, `${remote}/${branch} moved during the gate; nothing was pushed`);
    }
    // No + on the refspec, so a rejected push stays rejected.
    const pushed = git(root, ['push', '--quiet', remote, `${sha}:refs/heads/${branch}`]);
    if (!pushed.ok) throw new Refusal('push-rejected', EXIT.VIOLATIONS, `push rejected, reported, not retried: ${pushed.err}`);
    report.state = 'pushed';
    return EXIT.OK;
  });
}

/* ---------------------------------------------------------------- entry */

const USAGE = 'usage: shift-land.mjs commit --run <id> --message-file <f> [--ledger-dir <d>] -- <paths...> | push --remote <r> --branch <b> [--run <id>]';

export function main(argv, over = {}) {
  const ctx = {
    root: ROOT,
    now: () => Date.now(),
    log: (s) => console.log(s),
    err: (s) => console.error(s),
    generators: GENERATORS,
    lockName: LOCK_NAME,
    ...over,
  };
  ctx.board ??= path.join(ctx.root, 'scripts', 'run-board.mjs');
  const table = { commit: cmdCommit, push: cmdPush };
  const cmd = table[argv[0]];
  if (!cmd) { ctx.err(USAGE); return EXIT.FATAL; }
  try { return cmd(argv.slice(1), ctx); } catch (e) {
    ctx.err(e instanceof UsageError ? `${e.message}\n${USAGE}` : `FATAL: ${e.message}`);
    return EXIT.FATAL;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  installCrashDoor();
  process.exitCode = main(process.argv.slice(2));
}
