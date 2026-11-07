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
 *
 * Memory: the store is tens of GB, so discovery never holds parsed sessions. `listSessions`
 * yields { file, dir, id, span } with the span read from the file's head and tail and cached
 * by size+mtime (`openSpanCache`); lines are parsed on demand inside `matchRun` and released.
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

const ASSISTANT_RE = /"type"\s*:\s*"assistant"/;
const CMD_TAG_RE = /<command-name>\s*[^<\s]+\s*<\/command-name>/g;

/**
 * Reduce one parsed line to the fields the measurement reads, or null when it carries none.
 * An assistant line keeps its usage, id, model, effort and tool_use blocks (a Skill call keeps
 * its skill name; any other call keeps only whether it mentions log-run); a user line keeps
 * only its `<command-name>` tags. Prompt text, tool output and file contents are dropped, so
 * a multi-hundred-MB session shrinks to a few MB while every function below answers the same.
 */
function slimLine(l, raw) {
  const t = typeof l?.timestamp === 'string' ? l.timestamp : undefined;
  if (l?.type === 'assistant') {
    const content = [];
    for (const b of Array.isArray(l.message?.content) ? l.message.content : []) {
      if (b?.type !== 'tool_use') continue;
      content.push({ type: 'tool_use', name: b.name, input: b.name === 'Skill' ? { skill: b.input?.skill } : /log-run(\.mjs)?\b/.test(JSON.stringify(b.input ?? {})) ? { command: 'log-run' } : {} });
    }
    const m = l.message ?? {};
    return { type: 'assistant', timestamp: t, effort: l.effort, message: { id: m.id, model: m.model, effort: m.effort, usage: m.usage, content } };
  }
  if (l?.type === 'user') {
    const tags = raw.match(CMD_TAG_RE);
    return tags ? { type: 'user', timestamp: t, message: { content: tags.join(' ') } } : null;
  }
  return null;
}

/**
 * Stream a transcript and keep only the slim lines the measurement needs (see `slimLine`).
 * Reads 1 MB at a time and parses only lines that can matter (an assistant message or a
 * command tag), so memory is bounded by the slim result, not by the file. Torn or
 * unparseable lines are dropped, like `readTranscript`.
 */
export function readTranscriptSlim(file) {
  let fd;
  try { fd = fs.openSync(file, 'r'); } catch { return []; }
  const out = [];
  const take = (line) => {
    if (!line.trim()) return;
    if (!ASSISTANT_RE.test(line) && !line.includes('<command-name>')) return;
    try { const s = slimLine(JSON.parse(line), line); if (s) out.push(s); } catch { /* torn line */ }
  };
  try {
    const buf = Buffer.alloc(1024 * 1024);
    let tail = Buffer.alloc(0);
    for (;;) {
      const n = fs.readSync(fd, buf, 0, buf.length, null);
      if (n === 0) break;
      let chunk = tail.length ? Buffer.concat([tail, buf.subarray(0, n)]) : Buffer.from(buf.subarray(0, n));
      let start = 0;
      for (let i = chunk.indexOf(0x0a, start); i >= 0; i = chunk.indexOf(0x0a, start)) {
        take(chunk.toString('utf8', start, i));
        start = i + 1;
      }
      tail = chunk.subarray(start);
    }
    if (tail.length) take(tail.toString('utf8'));
  } catch { /* unreadable mid-way: what was read stands */ } finally { fs.closeSync(fd); }
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

const TS_RE = /"timestamp":"([^"]+)"/g;
const SPAN_CHUNKS = [64 * 1024, 1024 * 1024, 16 * 1024 * 1024];
const FULL_PARSE_MAX = 64 * 1024 * 1024;

/** Min / max timestamp mentioned in a raw text chunk, or null. */
function chunkSpan(text) {
  let lo = Infinity; let hi = -Infinity;
  for (const m of text.matchAll(TS_RE)) {
    const t = Date.parse(m[1]);
    if (Number.isNaN(t)) continue;
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  return lo === Infinity ? null : { first: lo, last: hi };
}

/**
 * [first, last] timestamp of a transcript WITHOUT parsing it: the head and the tail of the
 * file are read as raw text and scanned for `"timestamp":"..."`. Transcripts are append-only
 * and written in time order, so the head holds the earliest and the tail the latest. The
 * chunk grows (64 KB, 1 MB, 16 MB) until each end yields a timestamp; a file that still
 * yields none is parsed whole when it is small enough, else it has no span (and so never
 * matches a run - it is reported unmatched, not invented).
 */
export function spanFromFile(file, size) {
  let fd;
  try { fd = fs.openSync(file, 'r'); } catch { return null; }
  try {
    let first = null; let last = null;
    for (const n of SPAN_CHUNKS) {
      const len = Math.min(n, size);
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, 0);
      const h = chunkSpan(buf.toString('utf8'));
      if (h) { first = h.first; break; }
      if (len >= size) break;
    }
    for (const n of SPAN_CHUNKS) {
      const len = Math.min(n, size);
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, size - len);
      const t = chunkSpan(buf.toString('utf8'));
      if (t) { last = t.last; break; }
      if (len >= size) break;
    }
    if (first !== null && last !== null) return { first: Math.min(first, last), last: Math.max(first, last) };
  } catch { /* fall through to the whole-file path */ } finally { fs.closeSync(fd); }
  return size <= FULL_PARSE_MAX ? spanOf(readTranscript(file)) : null;
}

const SPAN_CACHE_VERSION = 1;

/**
 * A persistent span index: file -> { size, mtime, span }, valid while size AND mtime are
 * unchanged (the same rule as the process-sessions device cache). Held in memory; `save()`
 * writes it whole-or-not-at-all. Pass `file: null` for an in-memory index (tests, fixtures).
 * An unreadable cache file is treated as empty - it is derived state, never evidence.
 */
export function openSpanCache(file = null) {
  let files = {};
  if (file) {
    try {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (raw?.version === SPAN_CACHE_VERSION && raw.files && typeof raw.files === 'object') files = raw.files;
    } catch { /* first run or damaged: rebuild */ }
  }
  const stats = { hits: 0, misses: 0 };
  let dirty = false;
  return {
    stats,
    /** The span of `path` given its stat; reads the file's ends only on a miss. */
    spanFor(path_, st) {
      const e = files[path_];
      if (e && e.size === st.size && e.mtime === st.mtimeMs) { stats.hits += 1; return e.span; }
      stats.misses += 1;
      const span = spanFromFile(path_, st.size);
      files[path_] = { size: st.size, mtime: st.mtimeMs, span };
      dirty = true;
      return span;
    },
    save() {
      if (!file || !dirty) return;
      const tmp = `${file}.${process.pid}.tmp`;
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(tmp, JSON.stringify({ version: SPAN_CACHE_VERSION, files }));
        fs.renameSync(tmp, file);
        dirty = false;
      } catch { try { fs.rmSync(tmp, { force: true }); } catch { /* best effort */ } }
    },
  };
}

/**
 * Session files in the given folders as { file, dir, id, span } - NO parsed lines. Spans
 * come from `spanCache` (head/tail read, cached by size+mtime); `memo` remembers a file's
 * entry for the life of one backfill so a project's second row does not stat it again.
 * `matchRun` loads a session's lines only when its span can match the row.
 */
export function listSessions(dirs, memo = new Map(), { spanCache = openSpanCache() } = {}) {
  const out = [];
  for (const dir of dirs) {
    let names;
    try { names = fs.readdirSync(dir); } catch { continue; }
    for (const name of names.filter((n) => n.endsWith('.jsonl')).sort()) {
      const file = path.join(dir, name);
      if (!memo.has(file)) {
        let st;
        try { st = fs.statSync(file); } catch { continue; }
        memo.set(file, { file, dir, id: name.replace(/\.jsonl$/, ''), span: spanCache.spanFor(file, st) });
      }
      out.push(memo.get(file));
    }
  }
  return out;
}

/** A parse-on-demand (slim) line loader that keeps only the `max` most recent sessions (default 2). */
export function makeLineLoader(max = 2) {
  const held = new Map();
  return (session) => {
    if (Array.isArray(session.lines)) return session.lines;
    if (held.has(session.file)) { const v = held.get(session.file); held.delete(session.file); held.set(session.file, v); return v; }
    const lines = readTranscriptSlim(session.file);
    held.set(session.file, lines);
    while (held.size > max) held.delete(held.keys().next().value);
    return lines;
  };
}

/** `<dir>/<sessionId>/subagents/*.jsonl`, slimmed. */
export function subagentLines(session) {
  const sub = path.join(session.dir, session.id, 'subagents');
  let names;
  try { names = fs.readdirSync(sub); } catch { return []; }
  return names.filter((n) => n.endsWith('.jsonl')).sort().map((n) => readTranscriptSlim(path.join(sub, n)));
}

/**
 * Tie one run row to one transcript span and measure it. A session's lines are parsed only
 * if its span can hold the row (`loadLines`, default a 2-session LRU), never up front.
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
export function matchRun(row, sessions, { schema, subagents = subagentLines, loadLines = makeLineLoader() } = {}) {
  const endMs = Date.parse(row.ts);
  const startedMs = row.started ? Date.parse(row.started) : null;
  const RANK = { 'skill-call': 0, 'command-tag': 1, window: 2 };
  const cands = [];
  for (const s of sessions) {
    if (!s.span) continue;
    const lo = startedMs ?? endMs;
    if (s.span.first > endMs || s.span.last + COVER_SLACK_MS < lo) continue;
    const anchor = findAnchor(loadLines(s), row.skill, endMs);
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
    const withLog = pool.filter((c) => ranLogRun(loadLines(c.s), endMs));
    if (withLog.length === 1) pool = withLog;
    else return { unmatched: `ambiguous - ${pool.length} sessions qualify (${pool.map((c) => c.s.id).join(', ')})` };
  }
  const { s, start, kind } = pool[0];
  const lines = loadLines(s);
  const usage = sumUsage([lines, ...subagents(s)], start, endMs);
  const { model, effort } = observedModelEffort(lines, start, endMs);
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
