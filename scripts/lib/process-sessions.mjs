/**
 * process-sessions - the pure half of `scripts/process-sessions.mjs`: turn one Claude Code
 * transcript into one STRUCTURE-ONLY process instance.
 *
 * A development session is a process like any other: an ordered list of typed steps with
 * timestamps, errors and an outcome. This module keeps exactly that and nothing else. No
 * prompt text, no command text, no file path and no tool output ever leaves the transcript:
 * a Bash call becomes the word `verify` or `commit`, a prompt becomes its length class.
 *
 * Pure: no filesystem, no clock. Tests feed it lines; the script feeds it files.
 */

export const SCHEMA = 'process-sessions/1';

const READ = new Set(['Read', 'Grep', 'Glob', 'LS', 'NotebookRead']);
const EDIT = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
const PLAN = new Set(['TodoWrite', 'TaskCreate', 'TaskUpdate', 'ExitPlanMode', 'EnterPlanMode']);
const WAIT = new Set(['Monitor', 'TaskStop', 'ScheduleWakeup', 'TaskOutput']);
/** Harness commands typed as `/name` that are not skills. */
export const HARNESS_COMMANDS = new Set(['model', 'clear', 'login', 'logout', 'compact', 'config', 'cost', 'help',
  'resume', 'exit', 'effort', 'fast', 'status', 'doctor', 'mcp', 'memory', 'permissions', 'agents', 'hooks', 'ide',
  'terminal-setup', 'vim', 'add-dir', 'bug', 'context', 'usage', 'rewind', 'plugin', 'export', 'theme',
  'output-style', 'statusline', 'upgrade', 'release-notes', 'privacy-settings', 'feedback', 'btw', 'tasks',
  'artifacts', 'remote-control']);

/**
 * The phase a step kind belongs to. The raw kinds interleave too finely for an order to exist
 * between them (a session reads, edits, reads, runs); phases do have one, and they are what the
 * strategic layer draws. Kinds that are not work on the task (waiting, harness events) map to
 * themselves so a consumer can drop or show them.
 */
export const PHASE = {
  prompt: 'brief', skill: 'brief', plan: 'brief', ask: 'brief',
  read: 'explore', shell: 'explore', git: 'explore', web: 'explore', browser: 'explore', mcp: 'explore', tool: 'explore', delegate: 'explore',
  edit: 'edit',
  verify: 'verify', build: 'verify',
  commit: 'ship', push: 'ship',
  wait: 'wait', notify: 'wait', interrupt: 'interrupt', compact: 'compact',
};

/** What a shell command DID, as one word. The command text itself is never kept. */
export function shellKind(cmd = '') {
  const c = String(cmd).toLowerCase();
  if (/\bgit\s+(-c\s+\S+\s+)*commit\b/.test(c)) return 'commit';
  if (/\bgit\s+push\b/.test(c)) return 'push';
  if (/(npm run (test|check|gate|lint|census|verify)|npm test|vitest|cargo (test|clippy|check)|\btsc\b|eslint|pytest|playwright test|node --test)/.test(c)) return 'verify';
  if (/(npm run (build|dev|tauri)|vite build|cargo build|next build)/.test(c)) return 'build';
  if (/\bgit\b/.test(c)) return 'git';
  return 'shell';
}

export function toolKind(name, input) {
  if (READ.has(name)) return 'read';
  if (EDIT.has(name)) return 'edit';
  if (name === 'Bash' || name === 'PowerShell') return shellKind(input?.command);
  if (name === 'Agent' || name === 'Task') return 'delegate';
  if (name === 'WebSearch' || name === 'WebFetch') return 'web';
  if (name === 'Skill') return 'skill';
  if (name === 'AskUserQuestion') return 'ask';
  if (PLAN.has(name)) return 'plan';
  if (WAIT.has(name)) return 'wait';
  if (/^mcp__(claude-in-chrome|playwright)/.test(name)) return 'browser';
  if (name.startsWith('mcp__')) return 'mcp';
  return 'tool';
}

const textOf = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.filter((x) => x?.type === 'text').map((x) => x.text).join(' ') : '');

/**
 * Summarise one transcript. `lines` is an iterable of raw JSONL lines; `projectOf(cwd)` maps a
 * working directory to a fleet slug (or null for a session outside the fleet, which is dropped).
 * Returns null when the transcript holds no session worth keeping.
 */
export function summarize(lines, { projectOf, id }) {
  const s = { id, project: null, wt: 0, mode: null, model: null, effort: null, start: null, end: null,
    tok: { in: 0, out: 0, cr: 0, cw: 0 }, prompts: 0, interrupts: 0, compactions: 0, errors: 0, commits: 0, skills: [], steps: [] };
  const pending = new Map();
  const push = (k, t, extra) => {
    const last = s.steps[s.steps.length - 1];
    if (last && last.k === k && !extra) { last.n++; last.te = t; return last; }
    const st = { k, n: 1, e: 0, t, te: t, x: extra ?? null };
    s.steps.push(st);
    return st;
  };
  for (const line of lines) {
    if (!line || line.length > 2_000_000) continue;
    let o; try { o = JSON.parse(line); } catch { continue; }
    if (o.isSidechain) continue;
    const t = o.timestamp ? Date.parse(o.timestamp) : null;
    if (o.cwd && !s.project) { s.project = projectOf(o.cwd); s.wt = /[\\/]worktrees?[\\/]/i.test(o.cwd) ? 1 : 0; }
    if (o.entrypoint && !s.mode) s.mode = o.entrypoint === 'cli' ? 'interactive' : 'headless';
    if (t) { if (s.start == null || t < s.start) s.start = t; if (s.end == null || t > s.end) s.end = t; }
    if (o.type === 'system' && /compact/.test(o.subtype || '')) { s.compactions++; push('compact', t); continue; }
    const c = o.message?.content;
    if (o.type === 'user') {
      const text = textOf(c);
      if (text) {
        if (/\[Request interrupted by user/.test(text)) { s.interrupts++; push('interrupt', t); }
        else if (o.isMeta || /^<(local-command|system-reminder)/.test(text.trim())) { /* harness chatter */ }
        else if (/<task-notification>/.test(text)) push('notify', t);
        else {
          const m = text.match(/<command-name>\/?([^<\s]+)<\/command-name>/);
          const name = m ? m[1].replace(/^.*:/, '') : null;
          s.prompts++;
          if (name && !HARNESS_COMMANDS.has(name)) { s.skills.push(name); push('skill', t, name); }
          else push('prompt', t, name ? 'cmd' : text.length > 1500 ? 'l' : text.length > 300 ? 'm' : 's');
        }
      }
      if (Array.isArray(c)) for (const x of c) {
        if (x?.type !== 'tool_result') continue;
        const st = pending.get(x.tool_use_id);
        if (st && x.is_error) { st.e++; s.errors++; }
        pending.delete(x.tool_use_id);
      }
    } else if (o.type === 'assistant') {
      const m = o.message || {};
      if (m.model && m.model !== '<synthetic>') s.model = m.model;
      if (o.effort) s.effort = o.effort;
      const u = m.usage;
      if (u) { s.tok.in += u.input_tokens || 0; s.tok.out += u.output_tokens || 0; s.tok.cr += u.cache_read_input_tokens || 0; s.tok.cw += u.cache_creation_input_tokens || 0; }
      if (Array.isArray(c)) for (const x of c) {
        if (x?.type !== 'tool_use') continue;
        let k = toolKind(x.name, x.input);
        if (k === 'skill') {
          const name = String(x.input?.skill ?? '').replace(/^.*:/, '');
          if (name) { s.skills.push(name); pending.set(x.id, push('skill', t, name)); continue; }
          k = 'tool';
        }
        pending.set(x.id, push(k, t));
      }
    }
  }
  if (!s.project || s.start == null) return null;
  s.commits = s.steps.filter((x) => x.k === 'commit').reduce((a, x) => a + Math.max(0, x.n - x.e), 0);
  s.skills = [...new Set(s.skills)];
  return s;
}

/** Tool steps that are work on the task (not prompts, notifications or harness events). */
export function workSteps(s) {
  const skip = new Set(['prompt', 'skill', 'notify', 'interrupt', 'compact']);
  return s.steps.filter((x) => !skip.has(x.k)).reduce((a, x) => a + x.n, 0);
}

/**
 * The wire form: kinds indexed once, steps as tuples, times in seconds from the session start.
 * `active` excludes idle - any gap over `idleCapS` between steps counts as `idleCapS`.
 */
export function encode(sessions, { minWorkSteps = 3, maxSteps = 600, idleCapS = 600 } = {}) {
  const kept = sessions.filter((s) => workSteps(s) >= minWorkSteps);
  const kinds = [...new Set(kept.flatMap((s) => s.steps.map((x) => x.k)))].sort();
  const out = kept.map((s) => {
    let active = 0, prevEnd = null;
    for (const x of s.steps) {
      const a = (x.t - s.start) / 1000, b = (x.te - s.start) / 1000;
      if (prevEnd != null) active += Math.min(Math.max(0, a - prevEnd), idleCapS);
      active += b - a; prevEnd = b;
    }
    return {
      id: s.id, project: s.project, wt: s.wt, mode: s.mode, model: s.model, effort: s.effort,
      start: new Date(s.start).toISOString(), dur: Math.round((s.end - s.start) / 1000), active: Math.round(active),
      tok: s.tok, prompts: s.prompts, interrupts: s.interrupts, compactions: s.compactions, errors: s.errors, commits: s.commits,
      skills: s.skills,
      steps: s.steps.slice(0, maxSteps).map((x) => [kinds.indexOf(x.k), x.n, x.e, Math.round((x.t - s.start) / 1000), Math.round((x.te - x.t) / 1000), x.x]),
      ...(s.steps.length > maxSteps ? { truncated: s.steps.length } : {}),
    };
  });
  return { schema: SCHEMA, kinds, phases: PHASE, stepTuple: ['kind', 'count', 'errors', 'tStartSec', 'spanSec', 'extra'], sessions: out };
}
