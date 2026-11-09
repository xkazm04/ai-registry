/**
 * query-log - the front door writes down what it was asked, so a miss becomes visible.
 *
 * WHY THIS EXISTS. A read is logged as a consult (scripts/lib/consult-log.mjs); a search
 * was deliberately logged nowhere, because a search is not coverage. That left the query
 * lane blind to its own failures: nobody could tell a query that was answered from one
 * that was abandoned or re-asked, and the routing bench (scripts/routing-bench.mjs) could
 * not learn from use. This module appends one row per search; scripts/query-misses.mjs
 * joins those rows with the project's consults by time and names each miss together with
 * the subject the session read instead - a behaviour-labelled bench candidate.
 *
 * Callers: the MCP tool `registry_query` (scripts/registry-mcp.mjs) and the CLI's plain
 * query (scripts/registry-query.mjs). `--read` / `--subject` are consults, not searches.
 *
 * Where it writes: `<main checkout>/.ai/queries.local.jsonl` of the project the process
 * runs in, resolved exactly as the consult log resolves it (the caller's cwd, the common
 * git dir minus `/.git`). Query text can carry project-private words, so the file must be
 * one the project already ignores: link-registry.mjs's managed `.gitignore` block lists
 * `/.ai/queries.local.jsonl`, and this module checks `git check-ignore` before every write.
 * A checkout where the path is not ignored gets nothing - never a stray untracked file.
 * No script collects this file into the registry; it stays on the machine.
 *
 * Row: `{"ts","terms":[...],"domain":<bundle>|null,"top":n,"hits":["<domain>/<subject>
 * [/<technique>]", ...at most 5, rank order],"empty":bool,"from":"registry-mcp"|
 * "registry-query"}`. Addresses are slugs, never paths. Law rows name no subject and are
 * left out of `hits`.
 *
 * Contract: append-only, one line; every failure swallowed (the search must answer even
 * when its log cannot be written); a no-op when env REGISTRY_QUERY_LOG or
 * REGISTRY_CONSULT_LOG is 0/false/off/no, when cwd is not inside a git checkout, when the
 * checkout has no `.ai/manifest.yaml`, or when the log path is not git-ignored there.
 * Zero dependencies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loggingDisabled as consultLoggingDisabled, mainCheckoutOf } from './consult-log.mjs';

/** The log's path relative to the project's main checkout. */
export const QUERY_LOG_REL = '.ai/queries.local.jsonl';
export const MAX_LOGGED_HITS = 5;
export const FROM = ['registry-mcp', 'registry-query'];

const OFF = /^(0|false|off|no)$/i;

/** Opt-out: REGISTRY_QUERY_LOG=0 (also false/off/no); REGISTRY_CONSULT_LOG=0 silences both logs. */
export function queryLoggingDisabled(env = process.env) {
  return OFF.test(String(env.REGISTRY_QUERY_LOG ?? '').trim()) || consultLoggingDisabled(env);
}

/** `<domain>/<subject>[/<technique>]` for a query hit, or null for a hit that names no subject (a law). */
export function hitAddress(h) {
  if (!h || !h.domain || !h.subject) return null;
  return [h.domain, h.subject, h.kind === 'technique' && h.technique ? h.technique : null].filter(Boolean).join('/');
}

/** The row for one search. Pure; `now` is injected. */
export function queryRow({ terms, domain = null, top, result, from, now = () => new Date() }) {
  const hits = (Array.isArray(result?.hits) ? result.hits : []).map(hitAddress).filter(Boolean).slice(0, MAX_LOGGED_HITS);
  const dom = Array.isArray(domain) ? domain.join(',') : domain;
  return {
    ts: now().toISOString().replace(/\.\d+Z$/, 'Z'),
    terms: (Array.isArray(terms) ? terms : [terms]).map((t) => String(t)),
    domain: dom && String(dom).trim() ? String(dom).trim() : null,
    top: Number.isInteger(top) ? top : null,
    hits,
    empty: !(Array.isArray(result?.hits) && result.hits.length),
    from,
  };
}

/** Is `rel` ignored by git in the checkout at `root`? Only an explicit "yes" (exit 0) counts. */
export function isIgnored(root, rel = QUERY_LOG_REL) {
  const r = spawnSync('git', ['-C', root, 'check-ignore', '-q', '--', rel], { encoding: 'utf8', windowsHide: true, timeout: 5_000 });
  return !r.error && r.status === 0;
}

/**
 * The file a search in `cwd` would be logged to, or null when it must not be logged
 * (opt-out, no checkout, no manifest, path not ignored). Never throws.
 */
export function queryLogTarget({ cwd = process.cwd(), env = process.env } = {}) {
  try {
    if (queryLoggingDisabled(env)) return null;
    const root = mainCheckoutOf(cwd);
    if (!root || !fs.existsSync(path.join(root, '.ai', 'manifest.yaml'))) return null;
    if (!isIgnored(root)) return null;
    return path.join(root, ...QUERY_LOG_REL.split('/'));
  } catch {
    return null;
  }
}

/**
 * Append one query row. Returns the path written, or null when nothing was written. Never
 * throws. `target` lets a long-lived caller pass a path it resolved earlier with
 * queryLogTarget (undefined = resolve now).
 */
export function logQuery({ cwd = process.cwd(), env = process.env, now = () => new Date(), target, terms, domain = null, top, result, from } = {}) {
  try {
    if (!FROM.includes(from)) return null;
    if (queryLoggingDisabled(env)) return null;
    const file = target === undefined ? queryLogTarget({ cwd, env }) : target;
    if (!file) return null;
    fs.appendFileSync(file, JSON.stringify(queryRow({ terms, domain, top, result, from, now })) + '\n', 'utf8');
    return file;
  } catch {
    return null;
  }
}
