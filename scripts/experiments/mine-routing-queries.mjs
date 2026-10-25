#!/usr/bin/env node
/**
 * mine-routing-queries - harvest the routing questions agents actually asked, and what
 * they opened next, from local Claude Code transcripts.
 *
 * WHY THIS EXISTS. The routing benchmark (scripts/routing-bench.mjs) is only a proof bar
 * if its queries are ones agents really issue. Invented queries drift toward whatever
 * the router under test happens to be good at; slug-literal ones are trivially easy.
 * The honest source is the transcripts: every time an agent LOCATED registry knowledge
 * it left two traces - the query (a `research-map.mjs` call, a `registry-query` call, or
 * an ad-hoc `node -e` / python / grep slice of `knowledge/<domain>/index.json`) and, a few
 * tool calls later, the Read of the subject or technique document it settled on. The
 * second trace is the label: the subject that was read is the subject the query was for.
 *
 * WHY IT IS AN EXPERIMENT AND NOT A GATE. Its input is machine state - one operator's
 * transcript history under `~/.claude/projects` - which no CI runner and no other
 * checkout has, and which changes every session. A gate over it would be unreproducible
 * by construction. So this script only PROPOSES candidates; a human (the bench's
 * builder) screens them by hand for label quality, natural phrasing and privacy, and
 * the screened set is committed as scripts/fixtures/routing-bench/queries.json, which
 * IS reproducible and IS tested. Nothing runs this script automatically.
 *
 * PRIVACY. Its output carries raw command text from private sessions (paths, product
 * names). Write it to a scratch directory, never into the repository; only the
 * hand-screened, rewritten fixture is committed.
 *
 * What it extracts per transcript file (main sessions and subagent sidechains alike):
 *   - research-map   Bash calls of research-map.mjs, with their positional and --terms
 *                    terms (each term one candidate).
 *   - registry-query the FRONT DOOR (docs/query-lane.md): a Bash call of registry-query.mjs
 *                    or an MCP `registry_query` tool_use (the tool name may carry a server
 *                    prefix, e.g. mcp__ai-registry__registry_query). One candidate per call;
 *                    `surface` says which door. A `--read` or `--subject` call is an opener,
 *                    not a query. Before this existed the miner could not see the door agents
 *                    are told to use first, so every post-front-door session mined to nothing.
 *   - index-slice    Bash calls that read knowledge/<domain>/index.json and carry a
 *                    string or regex literal that looks like a search term.
 *   - consult-missed one candidate per subject consult-check reported as a miss, parsed from
 *                    its --json `missed` array or from the rows under its text header. (It
 *                    used to match the word "missed", which the text output never prints and
 *                    which on JSON output is only the junk line `"missed": [`.)
 * and, for each, the knowledge documents opened within the next WINDOW tool calls: the Read
 * tool, a Bash cat/sed/head of the file, `registry-query.mjs --read <path>`, or an MCP
 * `registry_read`. `label` is the first subject opened; `ambiguous` is set when the window
 * opened more than one distinct subject.
 *
 * The extractors are exported (mineTranscript and the helpers under it) so
 * scripts/tests/mine-routing-queries.test.mjs can pin them against a synthetic transcript.
 * Importing this module scans nothing; running it is still the CLI below.
 *
 * Usage:
 *   node scripts/experiments/mine-routing-queries.mjs [--root <dir>] [--window 15] [--out <file>]
 *     --root    transcript root (default: <home>/.claude/projects)
 *     --out     write candidates JSON there (default: stdout)
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 mined (zero candidates is an answer);
 * 2 could not run (root missing, bad usage).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';

// ---------------------------------------------------------------- walk
export function* jsonlFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'tool-results') continue; // tool output blobs, not transcripts
      yield* jsonlFiles(p);
    } else if (e.isFile() && e.name.endsWith('.jsonl')) {
      yield p;
    }
  }
}

// ---------------------------------------------------------------- shell-ish parsing
/** Quote-aware split of one shell segment into words. Good enough for argv recovery. */
function shellWords(s) {
  const out = [];
  let cur = '';
  let q = null;
  let any = false;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (q) {
      if (c === q) q = null;
      else if (c === '\\' && q === '"' && i + 1 < s.length) cur += s[(i += 1)];
      else cur += c;
      continue;
    }
    if (c === '"' || c === "'") { q = c; any = true; continue; }
    if (/\s/.test(c)) {
      if (cur || any) out.push(cur);
      cur = '';
      any = false;
      continue;
    }
    cur += c;
  }
  if (cur || any) out.push(cur);
  return out;
}

const VALUED = new Set(['--terms', '--domain', '--top']);
// registry-query.mjs takes more valued flags than research-map.mjs; a value must not be read as a term.
const QUERY_VALUED = new Set(['--terms', '--domain', '--top', '--budget', '--kinds', '--read', '--section', '--max-tokens', '--subject', '--root']);

/**
 * Every real invocation of `node <path/>script` inside a Bash command string: its terms
 * (positional words plus the comma-split --terms value), its flags, and the value of each
 * valued flag. A grep or a mention of the script name is not an invocation.
 */
function scriptCalls(cmd, script, valued) {
  const calls = [];
  const re = new RegExp('\\bnode\\s+(?:[^\\s;|&]*[\\\\/])?' + script.replace(/\./g, '\\.'), 'g');
  let m;
  while ((m = re.exec(cmd)) !== null) {
    let rest = cmd.slice(m.index + m[0].length);
    // The invocation ends at the first unquoted shell operator or newline.
    let end = rest.length;
    let q = null;
    for (let i = 0; i < rest.length; i += 1) {
      const c = rest[i];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === '\n' || c === ';' || c === '|' || c === '&' || c === '>' || c === '<' || c === ')') { end = i; break; }
    }
    rest = rest.slice(0, end);
    const words = shellWords(rest);
    const terms = [];
    const flags = [];
    const opts = {};
    for (let i = 0; i < words.length; i += 1) {
      const w = words[i];
      if (w.startsWith('--')) {
        flags.push(w);
        if (w === '--terms') terms.push(...String(words[i + 1] ?? '').split(','));
        if (valued.has(w)) { opts[w] = words[i + 1] ?? ''; i += 1; }
        continue;
      }
      if (/^\d+$/.test(w) || w.startsWith('2') && w.includes('>')) continue;
      terms.push(w);
    }
    calls.push({ terms: terms.map((t) => t.trim()).filter(Boolean), flags, opts });
  }
  return calls;
}

/** Terms of every research-map.mjs invocation inside a Bash command string. */
export function researchMapTerms(cmd) {
  return scriptCalls(cmd, 'research-map.mjs', VALUED).map(({ terms, flags }) => ({ terms, flags }));
}

/**
 * Terms of every registry-query.mjs QUERY invocation (the CLI front door). A `--read` or
 * `--subject` call opens a document or a card; it asks no question, so it yields no call here.
 */
export function registryQueryCalls(cmd) {
  return scriptCalls(cmd, 'registry-query.mjs', QUERY_VALUED)
    .filter((c) => c.opts['--read'] == null && c.opts['--subject'] == null && c.terms.length)
    .map((c) => ({ terms: c.terms, flags: c.flags, domain: c.opts['--domain'] ?? null }));
}

/** An MCP tool name with or without its server prefix: `registry_query`, `mcp__ai-registry__registry_query`. */
const mcpTool = (name, tool) => typeof name === 'string' && (name === tool || name.endsWith(`__${tool}`));

/** The question an MCP `registry_query` tool_use asked (terms is a string or an array of phrases). */
export function mcpQueryTerms(input) {
  const t = input?.terms ?? input?.query;
  const list = Array.isArray(t) ? t : [t];
  return list.filter((x) => typeof x === 'string').map((x) => x.trim()).filter(Boolean);
}

/** String and regex literals in an index.json slice that plausibly carry a search term. */
export function sliceTerms(cmd) {
  const found = new Set();
  const lit = /'([^'\n]{3,80})'|"([^"\n]{3,80})"|\/([^/\n]{3,80})\/[gimsuy]*/g;
  let m;
  while ((m = lit.exec(cmd)) !== null) {
    const s = (m[1] ?? m[2] ?? m[3] ?? '').trim();
    if (!s) continue;
    if (/[\\/]?knowledge[\\/]|index\.json|\.mjs|\.md\b|utf-?8|^node|^python/i.test(s)) continue;
    if (/[{}();=]|=>|\$\{|\bconst\b|\bprint\b|\bfor\b.*\bin\b|readFileSync|JSON\./.test(s)) continue;
    if (!/[a-z]{3}/i.test(s)) continue;
    for (const part of s.split('|')) {
      const p = part.replace(/\\[bswdS]|[\\^$.*+?()[\]]/g, ' ').replace(/\s+/g, ' ').trim();
      if (p.length >= 3 && /[a-z]{3}/i.test(p)) found.add(p);
    }
  }
  return [...found];
}

// ---------------------------------------------------------------- labels
const norm = (p) => String(p).replace(/\\/g, '/');

/** A knowledge concept document a path names, or null. */
export function knowledgeDoc(p) {
  const s = norm(p);
  const i = s.lastIndexOf('knowledge/');
  if (i === -1) return null;
  const parts = s.slice(i).split('/');
  if (parts.length < 4 || !parts.at(-1).endsWith('.md')) return null;
  const domain = parts[1];
  const base = parts.at(-1).replace(/\.md$/, '');
  if (parts.at(-2) === 'techniques' && parts.length >= 5) {
    return { domain, subject: parts.at(-3), technique: base, rel: parts.join('/') };
  }
  if (parts.at(-2) === base) return { domain, subject: base, technique: null, rel: parts.join('/') };
  return null;
}

/** Paths named by `registry-query.mjs --read <path>` calls in a Bash command. */
function readFlagPaths(cmd) {
  const out = [];
  for (const call of scriptCalls(cmd, 'registry-query.mjs', QUERY_VALUED)) {
    if (call.opts['--read']) out.push(call.opts['--read']);
  }
  return out;
}

/** Knowledge documents one tool call opened: Read, a Bash cat/sed/head, `--read`, or MCP `registry_read`. */
export function docsInCall(call) {
  if (call.name === 'Read' && call.input?.file_path) {
    const d = knowledgeDoc(call.input.file_path);
    return d ? [{ ...d, via: 'Read' }] : [];
  }
  // The front door's opener, whatever server prefix the host gave the tool.
  if (mcpTool(call.name, 'registry_read') && typeof call.input?.path === 'string') {
    const d = knowledgeDoc(call.input.path);
    return d ? [{ ...d, via: 'registry_read' }] : [];
  }
  if (call.name === 'Bash' && typeof call.input?.command === 'string') {
    const cmd = call.input.command;
    const out = [];
    for (const rp of readFlagPaths(cmd)) {
      const d = knowledgeDoc(rp);
      if (d) out.push({ ...d, via: 'registry-query --read' });
    }
    if (/\b(cat|sed|head|tail|less)\b/.test(cmd)) {
      for (const m of cmd.matchAll(/[^\s'"]*knowledge[\\/][^\s'"]+\.md/g)) {
        const d = knowledgeDoc(m[0]);
        if (d) out.push({ ...d, via: 'Bash' });
      }
    }
    return out;
  }
  return [];
}

// ---------------------------------------------------------------- consult-check output
/**
 * The rows consult-check reported as misses, from either of its outputs. `--json` carries
 * `missed: [{subject, bundle, ...}]`; the text form prints a header ("N subject(s) govern this
 * change and were not read.") then one indented row per subject: "<subject>  <bundle>  (how)".
 * Matching the word "missed" matched nothing in the text (it says "were not read" and
 * "recorded as a miss") and, on JSON, only the junk line `"missed": [`.
 */
export function consultMissRows(out) {
  const text = String(out ?? '');
  const open = text.indexOf('{');
  const close = text.lastIndexOf('}');
  if (open !== -1 && close > open) {
    try {
      const j = JSON.parse(text.slice(open, close + 1));
      if (Array.isArray(j?.missed)) {
        return j.missed
          .filter((r) => r && typeof r.subject === 'string')
          .map((r) => ({ subject: r.subject, bundle: r.bundle ?? null }));
      }
    } catch { /* not JSON: fall through to the text form */ }
  }
  const rows = [];
  let inRows = false;
  for (const ln of text.split('\n')) {
    if (/govern this change and were not read/.test(ln)) { inRows = true; continue; }
    if (!inRows) continue;
    const m = /^\s{2,}([a-z0-9][a-z0-9._-]*)\s+([a-z0-9][a-z0-9._-]*)\s+\(.*\)\s*$/i.exec(ln);
    if (m) rows.push({ subject: m[1], bundle: m[2] });
    else if (!ln.trim() || /^\s*(note:|read them|recorded as a miss)/.test(ln)) inRows = false;
  }
  return rows;
}

// ---------------------------------------------------------------- mine
export function toolCalls(text) {
  const calls = [];
  const results = new Map(); // tool_use_id -> text
  for (const line of text.split('\n')) {
    if (!line.includes('"tool_use"') && !line.includes('"tool_result"')) continue;
    let rec;
    try { rec = JSON.parse(line); } catch { continue; }
    const content = rec?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (c?.type === 'tool_use') calls.push({ id: c.id, name: c.name, input: c.input ?? {}, ts: rec.timestamp ?? null });
      else if (c?.type === 'tool_result') {
        const body = Array.isArray(c.content) ? c.content.map((x) => x?.text ?? '').join('\n') : String(c.content ?? '');
        results.set(c.tool_use_id, body);
      }
    }
  }
  return { calls, results };
}

/** A transcript worth parsing at all: it must mention one of the traces this miner looks for. */
export function worthMining(text) {
  return ['research-map', 'index.json', 'registry-query', 'registry_query', 'consult-check'].some((k) => text.includes(k));
}

/** Candidates from one transcript's text. `session` is only a label carried onto each row. */
export function mineTranscript(text, { session = '', window = 15 } = {}) {
  const candidates = [];
  const { calls, results } = toolCalls(text);
  const opened = (i) => {
    const docs = [];
    for (let j = i + 1; j < Math.min(calls.length, i + 1 + window); j += 1) {
      for (const d of docsInCall(calls[j])) docs.push({ ...d, offset: j - i });
    }
    return docs;
  };
  const push = (kind, i, terms, extra = {}) => {
    const docs = opened(i);
    const subjects = [...new Set(docs.map((d) => `${d.domain}/${d.subject}`))];
    candidates.push({
      kind,
      session,
      ts: calls[i].ts,
      terms,
      label: docs[0] ? { domain: docs[0].domain, subject: docs[0].subject, technique: docs.find((d) => d.subject === docs[0].subject && d.technique)?.technique ?? null } : null,
      ambiguous: subjects.length > 1,
      opened: docs.map((d) => ({ doc: `${d.domain}/${d.subject}${d.technique ? `#${d.technique}` : ''}`, via: d.via, offset: d.offset })),
      ...extra,
    });
  };
  for (let i = 0; i < calls.length; i += 1) {
    const c = calls[i];
    if (mcpTool(c.name, 'registry_query')) {
      const terms = mcpQueryTerms(c.input);
      if (terms.length) push('registry-query', i, terms, { surface: 'mcp', domain: c.input?.domain ?? null });
      continue;
    }
    const cmd = c.name === 'Bash' ? String(c.input?.command ?? '') : '';
    if (!cmd) continue;
    if (/\bnode\s+\S*research-map\.mjs/.test(cmd)) {
      for (const call of researchMapTerms(cmd)) {
        for (const t of call.terms) push('research-map', i, [t], { flags: call.flags, all_terms: call.terms });
      }
      continue;
    }
    if (/\bnode\s+\S*registry-query\.mjs/.test(cmd)) {
      for (const call of registryQueryCalls(cmd)) push('registry-query', i, call.terms, { surface: 'cli', flags: call.flags, domain: call.domain });
      continue;
    }
    if (/knowledge[\\/][a-z-]+[\\/]index\.json/.test(cmd)) {
      const terms = sliceTerms(cmd);
      if (terms.length) push('index-slice', i, terms, { command: cmd.slice(0, 600) });
      continue;
    }
    if (cmd.includes('consult-check')) {
      for (const row of consultMissRows(results.get(c.id))) {
        push('consult-missed', i, [row.subject], { subject: row.subject, bundle: row.bundle });
      }
    }
  }
  return candidates;
}

function main() {
  const argv = process.argv.slice(2);
  const pick = (n, d) => {
    const i = argv.indexOf(n);
    return i === -1 ? d : argv[i + 1];
  };
  const ROOT = path.resolve(pick('--root', path.join(os.homedir(), '.claude', 'projects')));
  const WINDOW = Number(pick('--window', 15));
  const OUT = pick('--out', null);

  if (!fs.existsSync(ROOT)) {
    console.error(`mine-routing-queries FATAL: transcript root ${ROOT} does not exist.`);
    process.exit(EXIT.FATAL);
  }
  if (!Number.isFinite(WINDOW) || WINDOW < 1) {
    console.error('mine-routing-queries FATAL: --window must be a positive integer.');
    process.exit(EXIT.FATAL);
  }

  const candidates = [];
  let files = 0;
  let scanned = 0;
  for (const file of jsonlFiles(ROOT)) {
    files += 1;
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    if (!worthMining(text)) continue;
    scanned += 1;
    candidates.push(...mineTranscript(text, { session: path.relative(ROOT, file).replace(/\\/g, '/'), window: WINDOW }));
  }

  const summary = {
    root_files: files,
    files_scanned: scanned,
    candidates: candidates.length,
    by_kind: candidates.reduce((a, c) => ({ ...a, [c.kind]: (a[c.kind] ?? 0) + 1 }), {}),
    labelled: candidates.filter((c) => c.label).length,
    unambiguous: candidates.filter((c) => c.label && !c.ambiguous).length,
  };
  const payload = JSON.stringify({ schema: 'routing-candidates/1', summary, candidates }, null, 1);
  if (OUT) {
    fs.writeFileSync(OUT, payload);
    console.error(`mine-routing-queries: ${JSON.stringify(summary)} -> ${OUT}`);
  } else {
    console.log(payload);
  }
  process.exit(EXIT.OK);
}

// Run only as the CLI; importing the extractors (the test does) must not scan anything.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
