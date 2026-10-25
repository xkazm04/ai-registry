#!/usr/bin/env node
/**
 * registry-mcp - the registry's query engine, served to agents as MCP tools.
 *
 * WHY THIS EXISTS. Every connected project's agent was told to locate knowledge by
 * reading knowledge/<domain>/index.json (~397K tokens for software-engineering). None
 * did; they sliced it with ad-hoc `node -e` and python instead (477 slices against 53
 * calls of the real router in 3,594 local transcripts), rebuilding a query layer per
 * session. scripts/lib/registry-query.mjs is that layer built once. This file is its
 * face: an agent that holds typed tools reaches for them, where an agent that holds a
 * CLI path in a rule has to remember it exists. One core, three callers (this server,
 * the CLI scripts/registry-query.mjs, and scripts/routing-bench.mjs), so a ranking
 * fix lands everywhere at once. docs/query-lane.md is the design and install page.
 *
 * Transport: MCP stdio - newline-delimited JSON-RPC 2.0 on stdin/stdout. STDOUT CARRIES
 * PROTOCOL AND NOTHING ELSE: one stray console.log corrupts the client's stream, so
 * main() routes console.log to stderr before anything loads. Logs go to stderr.
 *
 * Tools (names and parameters are wire contract; changing one bumps SERVER_VERSION's
 * major and docs/query-lane.md):
 *   registry_query    ranked hits for a decision: path, gist, use_when (budgeted)
 *   registry_read     one published document, or one `## ` section of it (budgeted)
 *   registry_subject  a subject's card: its golden path + every technique's gist
 *   registry_ledger   ledger-read.mjs over a shared markdown ledger, in-process
 *
 * registry_ledger imports ledger-read's exported runQuery(argv, text) rather than
 * spawning the script: runQuery IS the CLI minus file I/O and process exit, so the tool
 * gets the exact CLI semantics (cursor, budget, refusals) without a node start per call.
 * The tool's params are that CLI's options in snake_case, mapped back to flags here.
 *
 * The projection loads lazily on the first tool call that needs it, then stays in
 * memory; at most every RECHECK_MS the server calls loadProjection again, which rebuilds
 * only bundles whose fingerprint moved, so a long-lived session sees new techniques.
 *
 * Root: the checkout this file lives in, overridden by `--root <dir>` or AI_REGISTRY_DIR.
 *
 *   node scripts/registry-mcp.mjs [--root <registry checkout>]
 *   claude mcp add --scope user ai-registry -- node <registry>/scripts/registry-mcp.mjs
 *
 * Exits: 0 when stdin closes; 2 (FATAL) when the root has no knowledge/ lane. Zero
 * dependencies; Node 20.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

/** Bumped on any change to tool names, params or result shapes (semver). */
export const SERVER_VERSION = '1.0.0';
export const SERVER_NAME = 'ai-registry';
/** Newest first; the first entry answers a client that asks for anything else. */
export const SUPPORTED_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
export const RECHECK_MS = 60_000;

export const INSTRUCTIONS = 'Before a design, architecture or product decision, call registry_query with the decision in plain words; each hit names a technique or subject with its path, a one-line gist and its use_when triggers. Then call registry_read on the ONE path that fits (pass section to read one heading). Never read knowledge/<domain>/index.json: it is hundreds of thousands of tokens and registry_query already answers from it.';

const DEFAULT_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

// ---------------------------------------------------------------- tool definitions

const posInt = { type: 'integer', minimum: 1 };

const HIT_SCHEMA = {
  type: 'object',
  properties: {
    rank: { type: 'integer' },
    score: { type: 'number' },
    kind: { type: 'string', enum: ['subject', 'technique', 'law'] },
    domain: { type: 'string' },
    subject: { type: ['string', 'null'] },
    technique: { type: ['string', 'null'] },
    path: { type: 'string' },
    gist: { type: 'string' },
    use_when: { type: 'array', items: { type: 'string' } },
    why: { type: 'array', items: { type: 'string' } },
  },
  required: ['rank', 'score', 'kind', 'domain', 'subject', 'technique', 'path', 'gist', 'use_when', 'why'],
};

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    schema: { type: 'string', const: 'registry-query/1' },
    terms: { type: 'array', items: { type: 'string' } },
    hits: { type: 'array', items: HIT_SCHEMA },
    truncated: { type: 'boolean' },
    tokens: { type: 'integer' },
    empty_reason: { type: ['string', 'null'] },
  },
  required: ['schema', 'terms', 'hits', 'truncated', 'tokens', 'empty_reason'],
};

export const TOOLS = [
  {
    name: 'registry_query',
    title: 'Find the registry technique for a decision',
    description: 'START HERE for any design, architecture, product or domain decision. Ranks the registry\'s subjects (golden paths), techniques and laws against your terms, scoring slugs, use_when triggers AND document bodies, so a concept that lives only in prose is still found. Phrase terms as the decision you face ("deciding whether a green audit means accessible"), not as a guessed slug. Returns up to `top` hits (default 8) under `budget_tokens` (default 1500): each with kind, domain/subject/technique, repo-relative path, a one-line gist, its use_when triggers and why it matched. Next step: registry_read on the ONE path that fits. An empty result carries empty_reason; rephrase before concluding the registry lacks the concept.',
    inputSchema: {
      type: 'object',
      properties: {
        terms: {
          description: 'The decision or concept, as one phrase or several (each phrase also earns an exact-phrase bonus).',
          anyOf: [{ type: 'string', minLength: 1 }, { type: 'array', items: { type: 'string' }, minItems: 1 }],
        },
        domain: { type: 'string', description: 'Restrict to one bundle (e.g. "software-engineering"), or a comma-separated list. Omit to search every bundle.' },
        top: { ...posInt, description: 'Maximum hits (default 8).' },
        budget_tokens: { ...posInt, description: 'Token ceiling for the serialized hits (default 1500); whichever of top/budget binds first wins, and `truncated` says hits were left.' },
      },
      required: ['terms'],
      additionalProperties: false,
    },
    outputSchema: RESULT_SCHEMA,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'registry_read',
    title: 'Read one registry document',
    description: 'Read ONE published registry document by the repo-relative path a registry_query or registry_subject hit gave you (golden path, technique, application, recipe, skill, doc). Pass `section` to read just one "## " heading (case-insensitive, exact or prefix) instead of the whole file. Output is capped at `max_tokens` (default 2000) on a line boundary, ending with a marker that names the remaining tokens and the section headings so you can ask for the one you need. A first line lists the file\'s sections. Refuses paths outside the published lanes and any *.local.* file. Do not use it on index.json.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', minLength: 1, description: 'Repo-relative path exactly as a hit printed it, e.g. knowledge/<domain>/.../techniques/<slug>.md.' },
        section: { type: 'string', minLength: 1, description: 'A "## " heading to read alone.' },
        max_tokens: { ...posInt, description: 'Token ceiling (default 2000).' },
      },
      required: ['path'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'registry_subject',
    title: 'Card for one registry subject',
    description: 'When you already know the subject slug (from a registry_query hit or a rule\'s slug list): its golden path entry plus EVERY technique in it, each with path, one-line gist and use_when triggers. Typically a few hundred to ~2K tokens. Use it to choose among a subject\'s techniques without opening them; then registry_read the one that fits. Pass `domain` when a slug could exist in two bundles.',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', minLength: 1, description: 'Subject slug, e.g. "rate-limiting".' },
        domain: { type: 'string', minLength: 1, description: 'Bundle name, to disambiguate.' },
      },
      required: ['subject'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'registry_ledger',
    title: 'Query a registry ledger table',
    description: 'Bounded reads over the registry\'s shared markdown ledgers (librarian/applied.md, librarian/harvest/queue.md, librarian/sources/index.md, the intake SCORECARD.md / LESSONS.md, and any other repo .md table). Same engine and semantics as scripts/ledger-read.mjs: run command "schema" first to see the tables and columns, then "rows" with where/since/last/fields, "sections" for "## " blocks, or "prose" with after_table. Replies are capped at max_tokens (default 2000) and say what they omitted; when has_more is true, pass the returned cursor back with the SAME other params for the next page. Not for knowledge documents - use registry_query / registry_read for those.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', enum: ['schema', 'rows', 'sections', 'prose'], description: 'schema | rows | sections | prose.' },
        file: { type: 'string', minLength: 1, description: 'Repo-relative path of a .md ledger, e.g. librarian/applied.md.' },
        where: { type: 'array', items: { type: 'string' }, description: 'rows only; each "col~regex", "col!~regex", "col=value" or "*~regex"; all must hold.' },
        since: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'YYYY-MM-DD; rows by their Date column, sections by a date in the heading.' },
        last: { ...posInt, description: 'Keep only the last N matches.' },
        fields: { type: 'string', description: 'Comma-separated columns to project (rows), or heading,body (sections).' },
        table: { type: 'integer', minimum: 0, description: 'rows only; a table index from schema, instead of the main table.' },
        match: { type: 'string', description: 'sections only; regex over the heading.' },
        after_table: { type: 'boolean', description: 'prose only; required: read paragraphs after the last table.' },
        last_paragraphs: { ...posInt, description: 'prose only; keep the last N paragraphs.' },
        max_tokens: { ...posInt, description: 'Token ceiling for the reply (default 2000).' },
        cursor: { type: 'string', description: 'Continue a previous reply; the other params must be identical.' },
        json: { type: 'boolean', description: 'Reply as one JSON object instead of text.' },
      },
      required: ['command', 'file'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
];

// ---------------------------------------------------------------- argument checks

class ParamError extends Error {}

const typeOk = (v, t) => {
  if (t === 'string') return typeof v === 'string';
  if (t === 'integer') return Number.isInteger(v);
  if (t === 'number') return typeof v === 'number' && Number.isFinite(v);
  if (t === 'boolean') return typeof v === 'boolean';
  if (t === 'array') return Array.isArray(v);
  if (t === 'object') return v !== null && typeof v === 'object' && !Array.isArray(v);
  return false;
};

/** Validate against the small JSON Schema subset the tool inputs use. Returns an error string or null. */
function checkValue(v, s, where) {
  if (s.anyOf) {
    const errs = s.anyOf.map((alt) => checkValue(v, alt, where));
    return errs.every(Boolean) ? `${where}: ${errs.join('; or ')}` : null;
  }
  if (s.type && !typeOk(v, s.type)) return `${where} must be ${s.type === 'integer' ? 'an integer' : `a ${s.type}`}`;
  if (s.enum && !s.enum.includes(v)) return `${where} must be one of ${s.enum.join(', ')}`;
  if (typeof v === 'string') {
    if (s.minLength && v.trim().length < s.minLength) return `${where} must not be empty`;
    if (s.pattern && !new RegExp(s.pattern).test(v)) return `${where} must match ${s.pattern}`;
  }
  if (typeof v === 'number' && s.minimum !== undefined && v < s.minimum) return `${where} must be >= ${s.minimum}`;
  if (Array.isArray(v)) {
    if (s.minItems && v.length < s.minItems) return `${where} must have at least ${s.minItems} item(s)`;
    for (let i = 0; i < v.length && s.items; i++) {
      const e = checkValue(v[i], s.items, `${where}[${i}]`);
      if (e) return e;
    }
  }
  return null;
}

export function validateArgs(tool, args) {
  const s = tool.inputSchema;
  if (!typeOk(args, 'object')) return 'arguments must be an object';
  for (const k of s.required ?? []) if (args[k] === undefined) return `missing required argument "${k}"`;
  for (const [k, v] of Object.entries(args)) {
    const ps = s.properties[k];
    if (!ps) return `unknown argument "${k}"; accepted: ${Object.keys(s.properties).join(', ')}`;
    const e = checkValue(v, ps, k);
    if (e) return e;
  }
  return null;
}

// ---------------------------------------------------------------- text renderers

const oneLine = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const whenOf = (uw) => (uw && uw.length ? ` | when: ${oneLine(uw.join('; '))}` : '');
const labelOf = (h) => [h.domain, h.subject, h.technique].filter(Boolean).join('/');

const plainHit = (h) => `${h.rank}. ${h.kind} ${labelOf(h)} - ${oneLine(h.gist)}\n   ${h.path}${whenOf(h.use_when)}`;

/**
 * The CLI's compact form: two lines per hit. The real handlers pass the core's own
 * formatHit, so the server, the CLI and the budget count one text; the plain fallback
 * exists for tests that inject fake handlers.
 */
export function renderResult(r, formatHit = plainHit) {
  if (!r.hits.length) return `no match: ${r.empty_reason ?? 'nothing scored'}\n`;
  const out = r.hits.map(formatHit);
  out.push(`(${r.hits.length} hit${r.hits.length === 1 ? '' : 's'}, ~${r.tokens} tokens${r.truncated ? ', truncated: more hits exist - raise top/budget_tokens or narrow the terms' : ''})`);
  return out.join('\n') + '\n';
}

export function renderDoc(d) {
  const head = `# ${d.path} (~${d.tokens} tokens${d.truncated ? ', truncated' : ''})${d.sections.length ? ` | sections: ${d.sections.join(' / ')}` : ''}`;
  return `${head}\n${d.text}${d.text.endsWith('\n') ? '' : '\n'}`;
}

export function renderCard(c, slug) {
  const s = c.subject;
  const out = [`subject ${[s.domain, s.subject].filter(Boolean).join('/')} - ${oneLine(s.gist)}`, `   ${s.path}${whenOf(s.use_when)}`];
  out.push(`techniques (${c.techniques.length}):`);
  c.techniques.forEach((t, i) => out.push(`${i + 1}. ${t.technique} - ${oneLine(t.gist)}\n   ${t.path}${whenOf(t.use_when)}`));
  if (!c.techniques.length) out.push(`(none: ${slug} carries no techniques yet)`);
  out.push(`(~${c.tokens} tokens)`);
  return out.join('\n') + '\n';
}

// ---------------------------------------------------------------- the server

const text = (t) => ({ content: [{ type: 'text', text: t }] });
const failure = (msg) => ({ content: [{ type: 'text', text: msg }], isError: true });

/**
 * A transport-free MCP server. `handlers` maps each tool name to an async function
 * (args) => tool result ({content, structuredContent?, isError?}). Returns
 * `handle(message)`, which resolves to the response object, or null for a notification.
 */
export function createServer({ handlers, log = (m) => process.stderr.write(`${m}\n`), tools = TOOLS } = {}) {
  const byName = new Map(tools.map((t) => [t.name, t]));
  const state = { protocolVersion: null, initialized: false };

  const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
  const err = (id, code, message, data) => ({ jsonrpc: '2.0', id, error: data === undefined ? { code, message } : { code, message, data } });

  async function callTool(params) {
    if (!typeOk(params, 'object') || typeof params.name !== 'string') throw new ParamError('tools/call needs params.name');
    const tool = byName.get(params.name);
    if (!tool) throw new ParamError(`unknown tool "${params.name}"; tools: ${[...byName.keys()].join(', ')}`);
    const args = params.arguments ?? {};
    const bad = validateArgs(tool, args);
    // Argument errors are tool results, not protocol errors (MCP 2025-11-25): the model
    // reads isError and can correct the call, where -32602 reaches only the client.
    if (bad) return failure(`${tool.name}: invalid arguments: ${bad}`);
    const fn = handlers?.[tool.name];
    if (!fn) return failure(`${tool.name} has no handler in this server build`);
    try {
      return await fn(args);
    } catch (e) {
      log(`${tool.name} failed: ${e?.stack || e}`);
      return failure(`${tool.name} failed: ${e?.message || e}`);
    }
  }

  async function handleOne(msg) {
    if (!typeOk(msg, 'object') || msg.jsonrpc !== '2.0') return err(msg?.id ?? null, -32600, 'Invalid Request: expected a JSON-RPC 2.0 object');
    const isRequest = Object.prototype.hasOwnProperty.call(msg, 'id') && msg.id !== null;
    if (typeof msg.method !== 'string') {
      // A response from the client (we send no requests) - nothing to do.
      if ('result' in msg || 'error' in msg) return null;
      return err(msg.id ?? null, -32600, 'Invalid Request: no method');
    }
    if (!isRequest) {
      if (msg.method === 'notifications/initialized') state.initialized = true;
      return null; // notifications never get a reply, known or not
    }
    const { id, method, params } = msg;
    try {
      switch (method) {
        case 'initialize': {
          const asked = params?.protocolVersion;
          state.protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(asked) ? asked : SUPPORTED_PROTOCOL_VERSIONS[0];
          return ok(id, {
            protocolVersion: state.protocolVersion,
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
            instructions: INSTRUCTIONS,
          });
        }
        case 'ping':
          return ok(id, {});
        case 'tools/list':
          return ok(id, { tools });
        case 'tools/call':
          return ok(id, await callTool(params));
        default:
          return err(id, -32601, `Method not found: ${method}`);
      }
    } catch (e) {
      if (e instanceof ParamError) return err(id, -32602, `Invalid params: ${e.message}`);
      log(`${method} failed: ${e?.stack || e}`);
      return err(id, -32603, `Internal error: ${e?.message || e}`);
    }
  }

  async function handle(msg) {
    if (Array.isArray(msg)) {
      if (!msg.length) return err(null, -32600, 'Invalid Request: empty batch');
      const out = (await Promise.all(msg.map(handleOne))).filter(Boolean);
      return out.length ? out : null;
    }
    return handleOne(msg);
  }

  return { handle, state };
}

/** Wire a server to newline-delimited JSON-RPC streams. Resolves when input ends. */
export function serveStdio(server, { input = process.stdin, output = process.stdout, log = (m) => process.stderr.write(`${m}\n`) } = {}) {
  const send = (m) => { if (m) output.write(`${JSON.stringify(m)}\n`); };
  let buf = '';
  let chain = Promise.resolve();
  const dispatch = (line) => {
    const s = line.replace(/\r$/, '');
    if (!s.trim()) return;
    let msg;
    try { msg = JSON.parse(s); } catch (e) {
      send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: `Parse error: ${e.message}` } });
      return;
    }
    // In order: a client that pipelines initialize + tools/call gets answers in sequence.
    chain = chain.then(() => server.handle(msg)).then(send, (e) => log(`dispatch failed: ${e?.stack || e}`));
  };
  return new Promise((resolve) => {
    input.setEncoding('utf8');
    input.on('data', (chunk) => {
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) { dispatch(buf.slice(0, nl)); buf = buf.slice(nl + 1); }
    });
    input.on('end', () => { dispatch(buf); buf = ''; chain.then(resolve); });
  });
}

// ---------------------------------------------------------------- real handlers

const LOCAL_FILE = /(^|\/)[^/]*\.local(\.|$)/;

/** A repo-relative .md path inside root, or a thrown Error naming why not. */
function resolveLedger(root, rel) {
  const norm = rel.replace(/\\/g, '/');
  if (path.isAbsolute(rel) || /^[a-zA-Z]:/.test(norm)) throw new Error(`refused: "${rel}" is absolute; pass a repo-relative path`);
  if (norm.split('/').includes('..')) throw new Error(`refused: "${rel}" escapes the registry`);
  if (LOCAL_FILE.test(norm)) throw new Error(`refused: "${rel}" is a *.local.* file (machine-local, never served)`);
  if (!norm.endsWith('.md')) throw new Error(`refused: "${rel}" is not a markdown ledger`);
  const abs = path.join(root, norm);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) throw new Error(`no such ledger: ${norm}`);
  return { abs, norm };
}

/** snake_case tool params -> ledger-read argv (its own flag names). */
export function ledgerArgv(a, file) {
  const argv = [a.command, file];
  for (const w of a.where ?? []) argv.push('--where', w);
  const flag = { since: '--since', last: '--last', fields: '--fields', table: '--table', match: '--match', last_paragraphs: '--last-paragraphs', max_tokens: '--max-tokens', cursor: '--cursor' };
  for (const [k, f] of Object.entries(flag)) if (a[k] !== undefined) argv.push(f, String(a[k]));
  if (a.after_table) argv.push('--after-table');
  if (a.json) argv.push('--json');
  return argv;
}

/** The production handlers, over the real core. Imports lazily so a stub core cannot stop the server starting. */
export function realHandlers(root, { log = (m) => process.stderr.write(`${m}\n`), now = () => Date.now() } = {}) {
  let core = null;
  let ledger = null;
  let projection = null;
  let checkedAt = 0;
  const lib = async () => (core ??= await import('./lib/registry-query.mjs'));
  const getProjection = async () => {
    const { loadProjection } = await lib();
    if (!projection || now() - checkedAt >= RECHECK_MS) {
      const t0 = Date.now();
      projection = loadProjection(root);
      checkedAt = now();
      log(`projection loaded in ${Date.now() - t0} ms (${projection.entries?.length ?? '?'} entries)`);
    }
    return projection;
  };
  const domainsOf = (d) => (d ? d.split(',').map((x) => x.trim()).filter(Boolean) : null);

  return {
    async registry_query(a) {
      const { query, formatHit } = await lib();
      const terms = Array.isArray(a.terms) ? a.terms : [a.terms];
      const opts = { domains: domainsOf(a.domain) };
      if (a.top !== undefined) opts.top = a.top;
      if (a.budget_tokens !== undefined) opts.budgetTokens = a.budget_tokens;
      const r = query(await getProjection(), terms, opts);
      return { content: [{ type: 'text', text: renderResult(r, formatHit) }], structuredContent: r };
    },
    async registry_read(a) {
      const { readDoc } = await lib();
      const opts = {};
      if (a.section !== undefined) opts.section = a.section;
      if (a.max_tokens !== undefined) opts.maxTokens = a.max_tokens;
      return text(renderDoc(readDoc(root, a.path, opts)));
    },
    async registry_subject(a) {
      const { subjectCard } = await lib();
      const card = subjectCard(await getProjection(), a.subject, { domain: a.domain ?? null });
      if (!card.subject) return failure(`no subject "${a.subject}"${a.domain ? ` in ${a.domain}` : ''}; find the slug with registry_query`);
      return text(renderCard(card, a.subject));
    },
    async registry_ledger(a) {
      ledger ??= await import('./ledger-read.mjs');
      const { abs, norm } = resolveLedger(root, a.file);
      const { output } = ledger.runQuery(ledgerArgv(a, norm), fs.readFileSync(abs, 'utf8'));
      return text(output);
    },
  };
}

// ---------------------------------------------------------------- main

/**
 * Protocol owns stdout. Anything that logs - this file, the core, a dependency of a
 * future version - goes to stderr instead of corrupting the client's stream.
 */
export function guardStdout() {
  console.log = console.info = console.debug = (...a) => console.error(...a);
}

function parseCli(argv) {
  let root = process.env.AI_REGISTRY_DIR || DEFAULT_ROOT;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1]) root = argv[++i];
    else if (argv[i] === '-h' || argv[i] === '--help') return { help: true };
    else return { error: `unknown option ${argv[i]}` };
  }
  return { root: path.resolve(root) };
}

async function main(argv) {
  guardStdout();
  const cli = parseCli(argv);
  if (cli.help) { process.stderr.write('usage: node scripts/registry-mcp.mjs [--root <registry checkout>]  (MCP stdio server; see docs/query-lane.md)\n'); return EXIT.OK; }
  if (cli.error) { process.stderr.write(`registry-mcp: ${cli.error}\n`); return EXIT.FATAL; }
  if (!fs.existsSync(path.join(cli.root, 'knowledge'))) {
    process.stderr.write(`registry-mcp: no knowledge/ lane under ${cli.root}; pass --root or set AI_REGISTRY_DIR to a registry checkout\n`);
    return EXIT.FATAL;
  }
  process.stderr.write(`registry-mcp ${SERVER_VERSION} serving ${cli.root}\n`);
  await serveStdio(createServer({ handlers: realHandlers(cli.root) }));
  return EXIT.OK;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
