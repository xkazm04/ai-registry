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
 * SCREEN (`--screen <fixture>`). The bench-growth protocol (docs/query-lane.md, "Query log
 * and miss mining") as code: screenCandidates applies SCREEN_RULES in order and reports how
 * many candidates survive each, so the counts behind a fixture growth are reproducible.
 * A label still comes only from what the session opened; the screen never runs a router.
 * What it cannot do - privacy scrubbing and a last read for label quality - stays manual,
 * and a row the screener drops by hand is named in the growth's report.
 *
 * Usage:
 *   node scripts/experiments/mine-routing-queries.mjs [--root <dir>] [--window 15] [--out <file>] [--screen <fixture>]
 *     --root    transcript root (default: <home>/.claude/projects)
 *     --out     write candidates JSON there (default: stdout)
 *     --screen  keep only candidates that survive the protocol against that fixture
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 mined (zero candidates is an answer);
 * 2 could not run (root missing, bad usage).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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

// ---------------------------------------------------------------- screen
const words = (s) => new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
/** Token Jaccard of two texts: the near-duplicate measure of the screen. */
export function jaccard(a, b) {
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return 0;
  let i = 0;
  for (const x of A) if (B.has(x)) i += 1;
  return i / (A.size + B.size - i);
}

/** Rules of the bench-growth protocol, in the order applied. Each drops what fails it. */
export const SCREEN_RULES = [
  ['labelled', 'the session opened a knowledge document within the window'],
  ['unambiguous', 'it opened exactly one subject in the window'],
  ['not_index_slice', 'not an index.json slice (its "terms" are code literals, not a question)'],
  ['label_in_index', 'the label subject (and technique) exists in the current index'],
  ['not_slug_literal', 'the query is not the label slug itself'],
  ['distinct_terms', 'first occurrence of the exact terms'],
  ['not_near_dup_existing', 'token Jaccard < 0.5 against every fixture row'],
  ['not_near_dup_each_other', 'token Jaccard < 0.5 against every candidate kept before it'],
  ['attributable', 'a research-map call with several terms opened one document for the call; only single-term calls carry a per-query label'],
  ['well_formed', 'no unexpanded shell variable, no phrase under 3 characters'],
  ['not_echo', 'the query does not already name the label subject or technique (multi-word slug, kebab or spaced)'],
  ['not_address_list', 'not a list of kebab slugs (the exact-address tier answers those, not ranking)'],
  ['subject_cap_3', 'at most three rows per owning subject across the fixture, existing rows included'],
];

/**
 * Apply SCREEN_RULES to mined candidates. Labels come only from what the session opened
 * (the miner's `label`); nothing here runs a router. `fixtureRows` are the bench rows
 * already committed; `labelExists(domain, subject, technique)` checks the index. Returns
 * { kept, counts } with the survivors of each rule. Privacy scrubbing and a final read for
 * label quality stay manual.
 */
export function screenCandidates(candidates, { fixtureRows = [], labelExists = () => true } = {}) {
  const counts = { total: candidates.length };
  let c = candidates;
  const step = (name, fn) => { c = c.filter(fn); counts[name] = c.length; };
  step('labelled', (x) => x.label);
  step('unambiguous', (x) => !x.ambiguous);
  step('not_index_slice', (x) => x.kind !== 'index-slice');
  step('label_in_index', (x) => labelExists(x.label.domain, x.label.subject, x.label.technique));
  const joined = (x) => x.terms.join(' ').trim().toLowerCase();
  step('not_slug_literal', (x) => ![x.label.subject, x.label.technique].filter(Boolean).some((s) => joined(x) === s || joined(x) === s.replace(/-/g, ' ')));
  const seen = new Set();
  step('distinct_terms', (x) => { const k = x.terms.join(' | ').toLowerCase().trim(); if (seen.has(k)) return false; seen.add(k); return true; });
  const existing = fixtureRows.map((q) => q.terms.join(' '));
  step('not_near_dup_existing', (x) => existing.every((e) => jaccard(e, x.terms.join(' ')) < 0.5));
  const kept = [];
  step('not_near_dup_each_other', (x) => { if (kept.some((k) => jaccard(k.terms.join(' '), x.terms.join(' ')) >= 0.5)) return false; kept.push(x); return true; });
  step('attributable', (x) => x.kind !== 'research-map' || (x.all_terms ?? x.terms).length === 1);
  step('well_formed', (x) => x.terms.every((t) => !/\$\w|\$\{/.test(t) && t.trim().length >= 3));
  step('not_echo', (x) => ![x.label.subject, x.label.technique].filter((s) => s && s.includes('-')).some((s) => joined(x).includes(s) || joined(x).includes(s.replace(/-/g, ' '))));
  step('not_address_list', (x) => {
    const text = x.terms.join(' ');
    const short = text.split(/\s+/).length <= 3;
    return (text.match(/\b[a-z0-9]+(?:-[a-z0-9]+)+\b/g) ?? []).filter((w) => w.split('-').length >= 3 || (short && /^[a-z]+-[a-z]+$/.test(w))).length < 2;
  });
  const per = new Map();
  for (const q of fixtureRows) per.set(q.expect.subject, (per.get(q.expect.subject) ?? 0) + 1);
  step('subject_cap_3', (x) => { const n = per.get(x.label.subject) ?? 0; if (n >= 3) return false; per.set(x.label.subject, n + 1); return true; });
  return { kept: c, counts };
}

/** labelExists over the knowledge indexes of a registry checkout. */
function indexLabelCheck(registryRoot) {
  const idx = new Map();
  const k = path.join(registryRoot, 'knowledge');
  for (const d of fs.existsSync(k) ? fs.readdirSync(k, { withFileTypes: true }) : []) {
    const p = path.join(k, d.name, 'index.json');
    if (d.isDirectory() && fs.existsSync(p)) idx.set(d.name, JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return (domain, subject, technique) => {
    const s = idx.get(domain)?.subjects?.[subject];
    return Boolean(s && (!technique || (s.techniques ?? []).some((t) => t.slug === technique)));
  };
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
  const SCREEN = pick('--screen', null);

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
  let screen;
  if (SCREEN) {
    let fx;
    try { fx = JSON.parse(fs.readFileSync(SCREEN, 'utf8')); } catch (e) {
      console.error(`mine-routing-queries FATAL: --screen fixture ${SCREEN} does not read (${e.message}).`);
      process.exit(EXIT.FATAL);
    }
    const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    screen = screenCandidates(candidates, { fixtureRows: fx.queries ?? [], labelExists: indexLabelCheck(registryRoot) });
    summary.screen = screen.counts;
  }
  const payload = JSON.stringify(screen ? { schema: 'routing-candidates/1', summary, rules: Object.fromEntries(SCREEN_RULES), candidates: screen.kept } : { schema: 'routing-candidates/1', summary, candidates }, null, 1);
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
