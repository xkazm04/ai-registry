// seat.mjs - find a seat's CLI binary and run one seat, shared by contest and tiger.
//
// WHY this exists: contest.mjs and tiger.mjs each carried their own resolveBin/runSeat and the
// copies drifted. Tiger skipped a PATH candidate that is a directory (a `codex/` folder on PATH
// is not the codex CLI) and contest returned it, so on POSIX a contest seat was spawned
// against a directory; the engine fallbacks differed (tiger had no `agy` fallback); and wall_s
// was rounded to whole seconds in one and hundredths in the other. One implementation, with the
// environment and platform injectable so the PATH rules are testable without a seat.
//
// Builtins only. Nothing here talks to a model: resolveBin only stats files, and runSeat spawns
// whatever argv it is handed (a test hands it `node -e`). Tiger imports this file from its
// sibling skill folder, the same way it already imports ../../contest/scripts/lib/participants.mjs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

/**
 * The command to spawn for `engine`, or null when no CLI is found. A string is a binary; an
 * array is [binary, ...args] (a node entry script behind an npm shim, or a CONTEST_<ENGINE>_BIN
 * override written `a|b`). The caller decides what null means: contest dies, tiger skips the seat.
 *
 * `env` supplies PATH, LOCALAPPDATA and the CONTEST_<ENGINE>_BIN override; `platform` decides
 * whether Windows extensions and shim rules apply; `home` roots the per-user fallbacks.
 */
export function resolveBin(engine, { env = process.env, platform = process.platform, home = os.homedir(), execPath = process.execPath } = {}) {
  const win = platform === 'win32';
  const override = env[`CONTEST_${engine.toUpperCase()}_BIN`];
  if (override) return override.includes('|') ? override.split('|') : override;
  const exts = win ? ['.exe', '.cmd', ''] : [''];
  const dirs = (env.PATH ?? '').split(path.delimiter).filter(Boolean);
  const fallbacks = {
    claude: [path.join(home, '.local', 'bin', 'claude.exe'), path.join(home, '.local', 'bin', 'claude')],
    grok: [path.join(home, '.grok', 'bin', 'grok.exe'), path.join(home, '.grok', 'bin', 'grok')],
    codex: [],
    agy: [path.join(env.LOCALAPPDATA ?? path.join(home, 'AppData', 'Local'), 'agy', 'bin', 'agy.exe'), path.join(home, '.local', 'bin', 'agy')],
  };
  const candidates = [];
  for (const d of dirs) for (const e of exts) candidates.push(path.join(d, engine + e));
  candidates.push(...(fallbacks[engine] ?? []));
  for (const c of candidates) {
    // A directory named after the engine is not the engine; skip it and keep looking.
    if (!fs.existsSync(c) || isDir(c)) continue;
    // An npm shim cannot be spawned without a shell; run the package's entry script with this node.
    if (/\.cmd$/i.test(c) || !path.extname(c)) {
      const entry = {
        codex: 'node_modules/@openai/codex/bin/codex.js',
        claude: 'node_modules/@anthropic-ai/claude-code/cli.js',
      }[engine];
      // Current claude npm packages ship a native binary, not cli.js (contest lessons 1.2.0, 1.7.0).
      const native = engine === 'claude' && path.join(path.dirname(c), 'node_modules/@anthropic-ai/claude-code/bin/claude.exe');
      if (native && fs.existsSync(native)) return native;
      const script = entry && path.join(path.dirname(c), entry);
      if (script && fs.existsSync(script)) return [execPath, script];
      if (win) continue;
    }
    return c;
  }
  return null;
}

/**
 * Run one seat to completion or to its ceiling, logging stdout/stderr under `logDir`.
 * Resolves (never rejects) with { exit, timedOut, stdout, wall_s, label }; wall_s is seconds to
 * hundredths. `env` is merged over the parent environment (`parentEnv`, injectable) for the child.
 */
export function runSeat({ argv, stdin, env }, { cwd, timeoutMs, logDir, label, parentEnv = process.env, platform = process.platform }) {
  fs.mkdirSync(logDir, { recursive: true });
  const t0 = Date.now();
  return new Promise((resolve) => {
    const p = spawn(argv[0], argv.slice(1), { cwd, env: { ...parentEnv, ...env }, windowsHide: true });
    const out = fs.createWriteStream(path.join(logDir, 'stdout.log'));
    const err = fs.createWriteStream(path.join(logDir, 'stderr.log'));
    const chunks = [];
    p.stdout.on('data', (d) => { chunks.push(d); out.write(d); });
    p.stderr.on('data', (d) => err.write(d));
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      if (platform === 'win32') spawn('taskkill', ['/F', '/T', '/PID', String(p.pid)], { windowsHide: true });
      else p.kill('SIGKILL');
    }, timeoutMs);
    p.on('error', (e) => { err.write(`spawn error: ${e.message}\n`); });
    p.on('close', (code) => {
      clearTimeout(timer);
      out.end(); err.end();
      resolve({ exit: code, timedOut, stdout: Buffer.concat(chunks).toString('utf8'), wall_s: Math.round((Date.now() - t0) / 10) / 100, label });
    });
    p.stdin.on('error', () => {});
    p.stdin.end(stdin ?? '');
  });
}
