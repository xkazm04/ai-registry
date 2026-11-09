/**
 * gate-plan - the testable half of scripts/gate.mjs: deriving `--all` and every lane row
 * from one plan table, mapping changed paths to rows, and running a chain of steps.
 *
 * Why it exists. The gate used to stop at the first red, so one red step hid every step
 * behind it: on 2026-10-06 a red check-public-paths hid 19 later steps, and on 2026-11-09
 * check-coverage-age went red purely by the calendar and hid 15. A contributor fixed one
 * thing, re-ran three minutes of gates, and met the next red. And the plan was written by
 * hand twice (`ALL` and `LANES`), held together only by a test. Here the plan is one
 * table; `--all` and the lane rows are filters over it, and the runner keeps going, so
 * a run reports every step's verdict at once.
 *
 * The runner is exported so tests can drive it with tiny fixture scripts instead of the
 * 26 real gates. It never calls process.exit; gate.mjs owns the process.
 *
 * Step statuses: ok | violations | could-not-run | timed-out | not-run. "Could not run"
 * covers exit 2, a declared-but-not-verdict code (3, CONTENDED), an undeclared code, a
 * launch failure and a kill. None of those is a content verdict (exit-codes.mjs).
 */
import path from 'node:path';
import { spawn } from 'node:child_process';
import { EXIT, nameOf } from './exit-codes.mjs';

export const STATUS = Object.freeze({
  OK: 'ok',
  VIOLATIONS: 'violations',
  COULD_NOT_RUN: 'could-not-run',
  TIMED_OUT: 'timed-out',
  NOT_RUN: 'not-run',
});

/** A step's identity in `--list`: "<script> <check args>". */
export const stepId = (s) => [s.script, ...s.check].join(' ');

/**
 * Hold the table to its own rules: every step names at least one declared lane, no step
 * is declared twice, and every declared lane has a row. Returns a list of problems.
 */
export function validatePlan(plan, laneNames) {
  const problems = [];
  const declared = new Set(laneNames);
  const seen = new Set();
  for (const s of plan) {
    const id = stepId(s);
    if (seen.has(id)) problems.push(`step "${id}" is declared twice`);
    seen.add(id);
    if (!s.lanes.length) problems.push(`step "${id}" belongs to no lane, so no contributor can run it on its own`);
    for (const l of s.lanes) if (!declared.has(l)) problems.push(`step "${id}" names undeclared lane "${l}"`);
  }
  for (const l of laneNames) {
    if (!plan.some((s) => s.lanes.includes(l))) problems.push(`lane "${l}" has no steps`);
  }
  return problems;
}

/** Each lane row is the plan, filtered to that lane, in plan order. */
export function deriveLanes(plan, laneNames) {
  return Object.fromEntries(laneNames.map((l) => [l, plan.filter((s) => s.lanes.includes(l))]));
}

/** The union of the given rows, each step once, in plan order. */
export function unionRows(plan, laneNames) {
  const want = new Set(laneNames);
  return plan.filter((s) => s.lanes.some((l) => want.has(l)));
}

/**
 * A line-based read of registry.yaml's `lanes:` block - not a YAML parser. Returns
 * { <lane>: { paths: [...], gate: 'scripts/x.mjs' | null } }. A lane is a two-space key
 * under `lanes:`; its `path:` lines (own and nested, e.g. knowledge's rules/) and its
 * four-space `gate:` line are collected.
 */
export function readRegistryLanes(text) {
  const lanes = {};
  let inLanes = false;
  let cur = null;
  const unquote = (v) => v.replace(/^['"]|['"]$/g, '');
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || /^\s*#/.test(raw)) continue;
    if (/^\S/.test(raw)) { inLanes = /^lanes:\s*$/.test(raw); cur = null; continue; }
    if (!inLanes) continue;
    let m = raw.match(/^ {2}([A-Za-z][\w-]*):\s*$/);
    if (m) { cur = lanes[m[1]] = { paths: [], gate: null }; continue; }
    if (!cur) continue;
    m = raw.match(/^ {4,}path:\s*(\S+)\s*$/);
    if (m) { cur.paths.push(unquote(m[1])); continue; }
    m = raw.match(/^ {4}gate:\s*(\S+)\s*$/);
    if (m) cur.gate = unquote(m[1]);
  }
  return lanes;
}

/**
 * Map changed repo-relative paths to lane rows. `routes` is an ordered list of
 * { match(path) -> boolean, lanes: [...] | (path) => [...] } or { match, all: true, why };
 * the first match wins. A path no route matches selects the whole chain. Returns
 * { all: boolean, lanes: [...], why: [...] }, where `why` names each path that forced
 * the whole chain.
 */
export function selectRows(paths, routes) {
  const lanes = new Set();
  const why = [];
  for (const p of paths) {
    const r = routes.find((x) => x.match(p));
    if (!r) why.push(`${p} maps to no lane`);
    else if (r.all) why.push(`${p}: ${r.why}`);
    else for (const l of (typeof r.lanes === 'function' ? r.lanes(p) : r.lanes)) lanes.add(l);
  }
  return { all: why.length > 0, lanes: [...lanes], why };
}

/** Classify one finished child. */
export function classify({ code, signal, timedOut, launchError }, timeoutMs) {
  if (timedOut) {
    return { status: STATUS.TIMED_OUT, exit: null, note: `timed out after ${timeoutMs} ms and was stopped - it did not finish, so it reported nothing.` };
  }
  if (launchError) return { status: STATUS.COULD_NOT_RUN, exit: null, note: `could not be launched (${launchError.message}).` };
  if (signal) return { status: STATUS.COULD_NOT_RUN, exit: null, note: `was killed by ${signal} - it did not finish, so it reported nothing.` };
  if (code === EXIT.OK) return { status: STATUS.OK, exit: code, note: null };
  if (code === EXIT.VIOLATIONS) return { status: STATUS.VIOLATIONS, exit: code, note: `exit ${code} (VIOLATIONS)` };
  const named = nameOf(code);
  return {
    status: STATUS.COULD_NOT_RUN,
    exit: code,
    note: `exit ${code}${named ? ` (${named})` : ' (undeclared code)'} - not a content verdict`,
  };
}

/**
 * The exit code of a whole run.
 * Keep-going: 1 if any step reported violations; otherwise 2 if any step was incomplete
 * (could-not-run, timed-out); otherwise 0.
 * Fail-fast (and --write): the first non-ok step decides, exactly as the gate always did -
 * a declared code propagates, anything else (undeclared, timeout, kill) is FATAL.
 */
export function runExit(results, { failFast = false } = {}) {
  if (failFast) {
    const first = results.find((r) => r.status !== STATUS.OK && r.status !== STATUS.NOT_RUN);
    if (!first) return EXIT.OK;
    if (first.exit !== null && first.exit !== EXIT.OK && nameOf(first.exit)) return first.exit;
    return EXIT.FATAL;
  }
  if (results.some((r) => r.status === STATUS.VIOLATIONS)) return EXIT.VIOLATIONS;
  if (results.some((r) => r.status === STATUS.COULD_NOT_RUN || r.status === STATUS.TIMED_OUT)) return EXIT.FATAL;
  return EXIT.OK;
}

/**
 * Run `steps` and resolve to one result per step, in plan order.
 *
 * opts:
 *   root, scriptsDir     cwd for each child, and where step scripts live
 *   mode                 'check' | 'write' (picks s.check or s.write as arguments)
 *   jobs                 concurrency bound; 1 is strictly sequential, in plan order
 *   failFast             stop launching after the first non-ok step (callers force jobs=1)
 *   timeoutMs            per-step ceiling; expiry kills the child and is "timed-out"
 *   out, err             writable streams for the log (default process.stdout/stderr)
 *   execPath             the node binary (default process.execPath)
 *   now                  clock in ms (default Date.now), injectable for tests
 *
 * With jobs > 1 each step's output is buffered and printed whole, in plan order, as soon
 * as it and every step before it have finished. With jobs = 1 output streams live.
 * Steps marked `slow` launch first when jobs > 1 (the run's wall time is bounded below by
 * them); steps marked `exclusive` run with nothing beside them.
 */
export function runSteps(steps, opts) {
  const {
    root, scriptsDir, mode = 'check', jobs = 1, failFast = false, timeoutMs,
    out = process.stdout, err = process.stderr, execPath = process.execPath, now = Date.now,
  } = opts;
  const live = jobs === 1;
  const argsOf = (s) => (mode === 'write' && s.write ? s.write : s.check);
  const results = steps.map((s) => ({
    script: s.script, args: argsOf(s), status: STATUS.NOT_RUN, exit: null, ms: null,
    note: null, chunks: [], done: false,
  }));
  const shown = (r) => ['node', `scripts/${r.script}`, ...r.args].join(' ');
  const writeNote = (r) => { if (r.note) err.write(`gate: scripts/${r.script} ${r.note}\n`); };

  // Launch order: plan order, with slow steps pulled to the front when running wide.
  const order = steps.map((_, i) => i);
  if (!live) order.sort((a, b) => Number(Boolean(steps[b].slow)) - Number(Boolean(steps[a].slow)) || a - b);

  let printed = 0;
  const flush = (final) => {
    while (printed < results.length) {
      const r = results[printed];
      if (!r.done) {
        if (!final) return;
        printed += 1;   // not-run: nothing to print here; the verdict table names it
        continue;
      }
      if (!live) {
        out.write(`--- ${shown(r)}\n`);
        for (const c of r.chunks) (c.stream === 'err' ? err : out).write(c.data);
        writeNote(r);
        out.write('\n');
      }
      r.chunks = [];
      printed += 1;
    }
  };

  const launch = (i) => new Promise((resolve) => {
    const s = steps[i];
    const r = results[i];
    if (live) out.write(`--- ${shown(r)}\n`);
    const t0 = now();
    let timedOut = false;
    let launchError = null;
    let settled = false;
    let timer = null;
    let child;
    // Live mode inherits stdio as the gate always did; when the gate's stdout is reserved
    // for --json, a live child's stdout is redirected to stderr (fd 2). Any other stream
    // (a test's sink) is fed through a pipe.
    const stdio = live
      ? ['inherit',
        out === process.stdout ? 'inherit' : out === process.stderr ? 2 : 'pipe',
        err === process.stderr ? 'inherit' : 'pipe']
      : ['ignore', 'pipe', 'pipe'];
    const settle = (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      Object.assign(r, classify({ code, signal, timedOut, launchError }, timeoutMs));
      r.ms = now() - t0;
      r.done = true;
      if (live) { writeNote(r); out.write('\n'); }
      resolve();
    };
    try {
      child = spawn(execPath, [path.join(scriptsDir, s.script), ...r.args], { cwd: root, stdio, windowsHide: true });
    } catch (e) {
      launchError = e;
      settle(null, null);
      return;
    }
    timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    if (child.stdout) child.stdout.on('data', (d) => (live ? out.write(d) : r.chunks.push({ stream: 'out', data: d })));
    if (child.stderr) child.stderr.on('data', (d) => (live ? err.write(d) : r.chunks.push({ stream: 'err', data: d })));
    child.on('error', (e) => { launchError = e; settle(null, null); });
    child.on('close', (code, signal) => settle(code, signal));
  });

  return new Promise((resolve) => {
    let next = 0;
    let running = 0;
    let exclusiveRunning = false;
    let stopped = false;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      flush(true);
      resolve(results.map(({ chunks, done, ...rest }) => rest));
    };
    const pump = () => {
      while (!stopped && next < order.length && running < jobs && !exclusiveRunning) {
        const i = order[next];
        if (steps[i].exclusive && running > 0) break;
        next += 1;
        running += 1;
        if (steps[i].exclusive) exclusiveRunning = true;
        launch(i).then(() => {
          running -= 1;
          if (steps[i].exclusive) exclusiveRunning = false;
          if (failFast && results[i].status !== STATUS.OK) stopped = true;
          flush(false);
          pump();
        });
      }
      if (running === 0 && (stopped || next >= order.length)) finish();
    };
    pump();
  });
}
