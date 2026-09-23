/**
 * runs-transcript — the pure half of `scripts/runs-backfill.mjs`: read a Claude Code
 * transcript and turn one run-log row into one measured sidecar row.
 *
 * Why a separate module: the backfill touches three places that are not this repo (the
 * consuming projects' local run files, `~/.claude/projects/`, and the device log), and the
 * tests must never read the real transcript store. Everything here takes its inputs as
 * arguments - paths or already-parsed lines - and writes nothing, so the tests build
 * fixture transcripts in a temp dir and call these directly.
 *
 * What the transcript looks like (observed on disk 2026-09-21, Claude Code on Windows;
 * re-verify when the harness moves - a shape drift here reads as "no match", not as an
 * error, so the backfill reports unmatched rows loudly instead of skipping them):
 *
 *   ~/.claude/projects/<encoded cwd>/<sessionId>.jsonl            the main session
 *   ~/.claude/projects/<encoded cwd>/<sessionId>/subagents/*.jsonl  its subagents
 *
 *   - <encoded cwd> is the absolute launch directory with EVERY non-alphanumeric char
 *     replaced by '-': C:\Users\x\.personas\p -> C--Users-x--personas-p. A session
 *     launched inside a worktree gets its own folder (<project>--claude-worktrees-<name>);
 *     a subagent that runs in a worktree is logged under its PARENT session's folder.
 *   - One API message is split across several lines (one per content block) that repeat
 *     the same message.id and the same message.usage. Summing lines double-counts; the
 *     usage is summed once per message.id.
 *   - `effort` is a TOP-LEVEL field of assistant lines, not inside `message`.
 *   - A model-invoked skill is an assistant `tool_use` block {name:"Skill",
 *     input:{skill, args}}; an operator-typed one is a user line whose string content
 *     carries `<command-name>/<skill></command-name>`.
 *   - `message.model` "<synthetic>" marks harness-made messages; it is not a model.
 */
import fs from 'node:fs';
import path from 'node:path';

const SYNTHETIC_MODEL = '<synthetic>';
/** A session "covers" a run whose ts lands within this long after its last line (clock skew, abrupt exit). */
export const COVER_SLACK_MS = 2 * 60 * 1000;

/** `C:\Users\x\dolla\ai-registry` -> `C--Users-x-dolla-ai-registry`. */
export const encodeProjectPath = (abs) => path.resolve(abs).replace(/[^A-Za-z0-9]/g, '-');

/**
 * The transcript folders a project's sessions can live in: its own, plus one per
 * worktree session launched inside it. Only the `--claude-worktrees-` prefix is
 * followed - a bare `<enc>-` prefix would also match a sibling project whose name
 * merely extends this one's (`kp` vs `kp-tools`).
 */
export function transcriptDirs(projectsRoot, checkout) {
  const enc = encodeProjectPath(checkout);
  if (!fs.existsSync(projectsRoot)) return [];
  const wt = `${enc}--claude-worktrees-`;
  return fs.readdirSync(projectsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && (e.name === enc || e.name.startsWith(wt)))
    .map((e) => path.join(projectsRoot, e.name))
    .sort();
}

/** Parse a transcript file into objects, dropping unparseable lines. */
export function readTranscript(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return []; }
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* a torn last line from a live session */ }
  }
  return out;
}

const tsOf = (line) => (typeof line?.timestamp === 'string' ? Date.parse(line.timestamp) : NaN);

/** [first, last] timestamp of a parsed transcript, or null when it has none. */
export function spanOf(lines) {
  let lo = Infinity; let hi = -Infinity;
  for (const l of lines) {
    const t = tsOf(l);
    if (Number.isNaN(t)) continue;
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  return lo === Infinity ? null : { first: lo, last: hi };
}

/** Does the skill name in the transcript name this row's skill? Plugin/scoped names end in `:<skill>`. */
export const skillNameMatches = (seen, skill) => {
  if (typeof seen !== 'string') return false;
  const s = seen.replace(/^\//, '');
  return s === skill || s.endsWith(`:${skill}`);
};

const contentBlocks = (line) => (Array.isArray(line?.message?.content) ? line.message.content : []);

const userText = (line) => {
  const c = line?.message?.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((b) => (typeof b?.text === 'string' ? b.text : typeof b?.content === 'string' ? b.content : '')).join('\n');
  return '';
};

/**
 * The latest point at or before `endMs` where this session started `skill`.
 * Returns { kind: 'skill-call'|'command-tag', at } or null. A Skill tool_use is preferred
 * over a command tag - it is the model's own call, the tag only says what was typed.
 */
export function findAnchor(lines, skill, endMs) {
  let call = null; let tag = null;
  const CMD = /<command-name>\s*([^<\s]+)\s*<\/command-name>/g;
  for (const l of lines) {
    const t = tsOf(l);
    if (Number.isNaN(t) || t > endMs) continue;
    if (l.type === 'assistant') {
      for (const b of contentBlocks(l)) {
        if (b?.type === 'tool_use' && b.name === 'Skill' && skillNameMatches(b.input?.skill, skill)) {
          if (!call || t >= call) call = t;
        }
      }
    } else if (l.type === 'user') {
      for (const m of userText(l).matchAll(CMD)) {
        if (skillNameMatches(m[1], skill) && (!tag || t >= tag)) tag = t;
      }
    }
  }
  if (call !== null) return { kind: 'skill-call', at: call };
  if (tag !== null) return { kind: 'command-tag', at: tag };
  return null;
}

/** Did this session run `log-run.mjs` near the row's ts? Used only to break ties between parallel sessions. */
export function ranLogRun(lines, tsMs, beforeMs = 15 * 60 * 1000) {
  for (const l of lines) {
    if (l.type !== 'assistant') continue;
    const t = tsOf(l);
    if (Number.isNaN(t) || t < tsMs - beforeMs || t > tsMs + COVER_SLACK_MS) continue;
    for (const b of contentBlocks(l)) {
      if (b?.type === 'tool_use' && /log-run(\.mjs)?\b/.test(JSON.stringify(b.input ?? {}))) return true;
    }
  }
  return false;
}

/**
 * Sum usage over assistant lines in [startMs, endMs], ONCE PER message.id across every
 * file given (main session + subagents). Lines without an id are counted individually -
 * there is nothing to dedupe them by, and dropping them would under-report.
 */
export function sumUsage(lineSets, startMs, endMs) {
  const seen = new Set();
  const tot = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, messages: 0 };
  for (const lines of lineSets) {
    for (const l of lines) {
      if (l.type !== 'assistant' || !l.message?.usage) continue;
      const t = tsOf(l);
      if (Number.isNaN(t) || t < startMs || t > endMs) continue;
      const id = l.message.id;
      if (id) { if (seen.has(id)) continue; seen.add(id); }
      const u = l.message.usage;
      const n = (v) => (Number.isFinite(v) && v > 0 ? Math.round(v) : 0);
      tot.input += n(u.input_tokens);
      tot.cacheWrite += n(u.cache_creation_input_tokens);
      tot.cacheRead += n(u.cache_read_input_tokens);
      tot.output += n(u.output_tokens);
      tot.messages += 1;
    }
  }
  return tot;
}

const mode = (counts) => {
  let best = null; let bestN = 0;
  for (const [k, n] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) if (n > bestN) { best = k; bestN = n; }
  return best;
};

/** Most frequent model and effort over the window's distinct messages (main session only). */
export function observedModelEffort(lines, startMs, endMs) {
  const models = new Map(); const efforts = new Map(); const seen = new Set();
  for (const l of lines) {
    if (l.type !== 'assistant') continue;
    const t = tsOf(l);
    if (Number.isNaN(t) || t < startMs || t > endMs) continue;
    const id = l.message?.id;
    if (id) { if (seen.has(id)) continue; seen.add(id); }
    const m = l.message?.model;
    if (typeof m === 'string' && m && m !== SYNTHETIC_MODEL) models.set(m, (models.get(m) ?? 0) + 1);
    const e = typeof l.effort === 'string' ? l.effort : typeof l.message?.effort === 'string' ? l.message.effort : null;
    if (e) efforts.set(e, (efforts.get(e) ?? 0) + 1);
  }
  return { model: mode(models), effort: mode(efforts) };
}

/** Session files in the given folders, with their parsed lines and span. Lazy callers pass a cache. */
export function listSessions(dirs, cache = new Map()) {
  const out = [];
  for (const dir of dirs) {
    let names;
    try { names = fs.readdirSync(dir); } catch { continue; }
    for (const name of names.filter((n) => n.endsWith('.jsonl')).sort()) {
      const file = path.join(dir, name);
      if (!cache.has(file)) {
        const lines = readTranscript(file);
        cache.set(file, { file, dir, id: name.replace(/\.jsonl$/, ''), lines, span: spanOf(lines) });
      }
      out.push(cache.get(file));
    }
  }
  return out;
}

/** `<dir>/<sessionId>/subagents/*.jsonl`, parsed. */
export function subagentLines(session) {
  const sub = path.join(session.dir, session.id, 'subagents');
  let names;
  try { names = fs.readdirSync(sub); } catch { return []; }
  return names.filter((n) => n.endsWith('.jsonl')).sort().map((n) => readTranscript(path.join(sub, n)));
}

/**
 * Tie one run row to one transcript span and measure it.
 *
 * Returns { exact } on a match (an EXACT_KEYS-shaped row minus nothing) or
 * { unmatched: reason }. Rules, in order:
 *   - candidate sessions: those whose span covers row.ts (last line within COVER_SLACK_MS);
 *   - window END is always row.ts;
 *   - window START is row.started when given, else the session's latest anchor for the skill;
 *   - `matched` names the strongest evidence tying the session to the skill: the anchor kind
 *     if the session has one, else 'window' (only possible when started was given);
 *   - no started and no anchor -> unmatched. A span is never invented;
 *   - several sessions qualify -> prefer the one that ran log-run near ts; still several ->
 *     unmatched as ambiguous (parallel sessions of one skill in one project).
 */
export function matchRun(row, sessions, { schema, subagents = subagentLines } = {}) {
  const endMs = Date.parse(row.ts);
  const startedMs = row.started ? Date.parse(row.started) : null;
  const RANK = { 'skill-call': 0, 'command-tag': 1, window: 2 };
  const cands = [];
  for (const s of sessions) {
    if (!s.span) continue;
    const lo = startedMs ?? endMs;
    if (s.span.first > endMs || s.span.last + COVER_SLACK_MS < lo) continue;
    const anchor = findAnchor(s.lines, row.skill, endMs);
    let start; let kind;
    if (startedMs !== null) { start = startedMs; kind = anchor ? anchor.kind : 'window'; }
    else if (anchor) { start = anchor.at; kind = anchor.kind; }
    else continue;
    cands.push({ s, start, kind });
  }
  if (!cands.length) return { unmatched: startedMs === null ? 'no Skill call or command tag for this skill in any session covering ts' : 'no session covers the started..ts window' };
  const best = Math.min(...cands.map((c) => RANK[c.kind]));
  let pool = cands.filter((c) => RANK[c.kind] === best);
  if (pool.length > 1) {
    const withLog = pool.filter((c) => ranLogRun(c.s.lines, endMs));
    if (withLog.length === 1) pool = withLog;
    else return { unmatched: `ambiguous - ${pool.length} sessions qualify (${pool.map((c) => c.s.id).join(', ')})` };
  }
  const { s, start, kind } = pool[0];
  const usage = sumUsage([s.lines, ...subagents(s)], start, endMs);
  const { model, effort } = observedModelEffort(s.lines, start, endMs);
  return {
    exact: {
      schema, id: row.id, session: s.id, model, effort,
      input: usage.input, cacheWrite: usage.cacheWrite, cacheRead: usage.cacheRead, output: usage.output,
      matched: kind,
    },
    messages: usage.messages,
  };
}

// Stamping a local-file row into a log row is lib/runs.mjs stampRow - the contract owns it,
// so log-run, the drain and the tests share one definition.
