#!/usr/bin/env node
/**
 * codex-run - run one Codex builder to completion and leave a verdict on disk.
 *
 *   node codex-run.mjs --cwd <dir> --brief <file> --run-dir <dir>
 *        [--timeout-min 45] [--effort medium] [--sandbox write|read] [--resume <sessionId>] [--model gpt-6.1-sol]
 *
 * WHY: daybreak launches builders detached (a Start-Process child dies with the session
 * unless it is launched detached, and a long wait must survive a closed terminal), so the
 * outcome cannot travel on stdout. This script is the whole contract: it spawns codex,
 * streams its JSONL events to <run-dir>/events.jsonl, writes the final message to
 * <run-dir>/last.md and ALWAYS writes <run-dir>/result.json, even on timeout or crash.
 *
 * Facts it is built on are measured in ../references/codex-probe.md: the session id is the
 * first event (thread.started), a read-only refusal exits 0 (so exit code alone proves
 * nothing, hence the git-status diff check), `-o` is not written when killed (so last.md
 * is derived from the events), codex.cmd needs a shell on Windows and a shell splits
 * arguments at spaces (so every argument is space-free and the prompt goes on stdin), and
 * `resume` has no -s or -C (so sandbox goes through -c and the cwd is the spawn cwd).
 *
 * Classes and exit codes (the producer; SKILL.md Phase 5 is the consumer):
 *   done 0 | timeout 10 | crash 11 | no-diff 12
 * no-diff is only judged for --sandbox write: a read-only survey legitimately changes nothing.
 * filesChanged is the difference of `git status --porcelain` before and after the run, so a
 * file already dirty before the run and edited again is not seen; builders get fresh worktrees.
 *
 * DAYBREAK_CODEX_BIN overrides the executable (tests use a stub; a .mjs/.js path runs
 * under this node, anything else through the shell on Windows).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { EXIT, installCrashDoor } from '../../../scripts/lib/exit-codes.mjs';

export const CODES = Object.freeze({ done: 0, timeout: 10, crash: 11, 'no-diff': 12 });

/** Pure: the codex argument list. No argument contains a space (see header). */
export function buildArgs({ model = 'gpt-6.1-sol', effort = 'medium', sandbox = 'write', resume = null }) {
  const mode = sandbox === 'read' ? 'read-only' : 'workspace-write';
  const common = ['-c', `model_reasoning_effort=${effort}`, '--json'];
  if (resume) return ['exec', 'resume', resume, '-m', model, ...common, '-c', `sandbox_mode=${mode}`, '-'];
  return ['exec', '-m', model, ...common, '-s', mode, '--skip-git-repo-check', '-'];
}

/** Pure: pick the class. */
export function classify({ timedOut, exitCode, sawTurnCompleted, sandbox, filesChanged }) {
  if (timedOut) return 'timeout';
  if (exitCode !== 0 || !sawTurnCompleted) return 'crash';
  if (sandbox !== 'read' && filesChanged.length === 0) return 'no-diff';
  return 'done';
}

/**
 * Pure: fold one parsed event into the run state. Usage is summed because a resumed or
 * multi-turn session reports per turn, and it is the only producer of the ledger's Codex
 * token figure. An unknown model does not fail (probe fact 11), so it is surfaced here.
 */
export function absorb(state, ev) {
  if (ev.type === 'thread.started' && ev.thread_id) state.sessionId = ev.thread_id;
  if (ev.type === 'turn.completed') {
    state.sawTurnCompleted = true;
    for (const [k, v] of Object.entries(ev.usage ?? {})) {
      if (typeof v === 'number') state.usage[k] = (state.usage[k] ?? 0) + v;
    }
  }
  if (ev.type === 'item.completed' && ev.item?.type === 'agent_message') state.lastMsg = ev.item.text ?? state.lastMsg;
  if (ev.type === 'item.completed' && ev.item?.type === 'error' && /Model metadata/i.test(ev.item.message ?? '')) state.modelUnknown = true;
  return state;
}

const porcelain = (cwd) => {
  const r = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.split('\n').map((l) => l.trimEnd()).filter(Boolean) : [];
};

function launch(bin, args, cwd) {
  const opts = { cwd, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true };
  if (/\.(mjs|js|cjs)$/i.test(bin)) return spawn(process.execPath, [bin, ...args], opts);
  if (process.platform === 'win32') return spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/c', bin, ...args], opts);
  return spawn(bin, args, { ...opts, detached: true });
}

function killTree(child) {
  try {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(-child.pid, 'SIGKILL');
  } catch { /* already gone */ }
}

export async function run({ cwd, brief, runDir, timeoutMin = 45, effort = 'medium', sandbox = 'write', resume = null, model = 'gpt-6.1-sol', bin = process.env.DAYBREAK_CODEX_BIN || 'codex', now = Date.now }) {
  fs.mkdirSync(runDir, { recursive: true });
  const prompt = fs.readFileSync(brief, 'utf8');
  const before = new Set(porcelain(cwd));
  const events = fs.createWriteStream(path.join(runDir, 'events.jsonl'));
  const t0 = now();
  const child = launch(bin, buildArgs({ model, effort, sandbox, resume }), cwd);
  const state = { sessionId: null, lastMsg: '', sawTurnCompleted: false, modelUnknown: false, usage: {} };
  let buf = '';
  const onLine = (line) => {
    if (!line.trim()) return;
    try { absorb(state, JSON.parse(line)); } catch { /* a non-JSON line is kept in events.jsonl as is */ }
  };
  child.stdout.on('data', (d) => {
    events.write(d);
    buf += d;
    const parts = buf.split('\n');
    buf = parts.pop();
    parts.forEach(onLine);
  });
  child.stderr.on('data', () => {});
  child.stdin.on('error', () => {});
  child.stdin.end(prompt);

  let timedOut = false;
  const closed = new Promise((resolve) => {
    child.on('error', () => resolve(-1));
    child.on('close', (code) => resolve(code ?? -1));
  });
  const timer = setTimeout(() => {
    timedOut = true;
    killTree(child);
  }, timeoutMin * 60000);
  let exitCode = await Promise.race([closed, new Promise((r) => setTimeout(() => r(null), timeoutMin * 60000 + 15000))]);
  clearTimeout(timer);
  if (exitCode === null) { killTree(child); exitCode = -1; }
  onLine(buf);
  await new Promise((r) => events.end(r));

  const filesChanged = porcelain(cwd).filter((l) => !before.has(l)).map((l) => l.slice(3));
  const { sessionId, lastMsg, sawTurnCompleted, modelUnknown, usage } = state;
  const cls = classify({ timedOut, exitCode, sawTurnCompleted, sandbox, filesChanged });
  fs.writeFileSync(path.join(runDir, 'last.md'), lastMsg);
  const result = {
    class: cls, exitCode,
    ...(sessionId ? { sessionId } : {}),
    minutes: Math.round(((now() - t0) / 60000) * 100) / 100,
    filesChanged,
    ...(Object.keys(usage).length ? { usage } : {}),
    ...(modelUnknown ? { modelUnknown: true } : {}),
  };
  fs.writeFileSync(path.join(runDir, 'result.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}

async function main() {
  installCrashDoor();
  const argv = process.argv.slice(2);
  const arg = (n, d = null) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
  const cwd = arg('--cwd'), brief = arg('--brief'), runDir = arg('--run-dir');
  if (!cwd || !brief || !runDir || !fs.existsSync(cwd) || !fs.existsSync(brief)) {
    console.error('usage: node codex-run.mjs --cwd <dir> --brief <file> --run-dir <dir> [--timeout-min 45] [--effort medium] [--sandbox write|read] [--resume <id>] [--model m]');
    process.exit(EXIT.FATAL);
  }
  const sandbox = arg('--sandbox', 'write');
  if (!['write', 'read'].includes(sandbox)) { console.error('FATAL: --sandbox is write or read'); process.exit(EXIT.FATAL); }
  const result = await run({
    cwd, brief, runDir, sandbox,
    timeoutMin: Number(arg('--timeout-min', 45)),
    effort: arg('--effort', 'medium'),
    resume: arg('--resume'),
    model: arg('--model', 'gpt-6.1-sol'),
  });
  try { console.log(JSON.stringify(result)); } catch { /* detached: no stdout */ }
  process.exit(CODES[result.class]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
