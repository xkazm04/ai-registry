/**
 * registry-query - the one query core every agent-facing entry point shares.
 *
 * WHY THIS EXISTS. An agent locating a technique was told to read
 * knowledge/<domain>/index.json, which for software-engineering is ~400K tokens. In
 * 3,594 local transcripts no agent Read it; they sliced it with ad-hoc `node -e` and
 * python 430 times, rebuilding a query layer per session, while the real router
 * (research-map.mjs) missed concepts that live only in prose and returned neither a
 * technique's path nor its rule. This module is that query layer, built once: a
 * PROJECTION of the corpus (subjects, techniques, laws, each with its path, a one-line
 * gist and its use_when triggers) plus a BM25 postings list over the document bodies,
 * cached outside git, answered under a token budget.
 *
 * The projection is GENERATED and LOCAL. Markdown + frontmatter stay the source of
 * truth; the cache lives in `.cache/registry-route/` (gitignored), keyed by each
 * bundle's content digest, so a stale cache is rebuilt rather than trusted, and a
 * committed copy cannot add the per-commit churn the generated indexes already carry.
 *
 * Callers: scripts/registry-query.mjs (CLI), scripts/registry-mcp.mjs (MCP server),
 * scripts/routing-bench.mjs (the benchmark arm). Zero dependencies; runs on Node 20.
 *
 * Wire contract (every field always present; arrays are [] rather than omitted):
 *
 *   Entry  { kind: 'subject'|'technique'|'law', domain, subject, technique|null,
 *            path, title, gist, use_when: string[], status, laws: string[] }
 *          path is repo-relative with forward slashes; technique is null on subject
 *          and law rows; gist is '' when the document has no paragraph; for a law
 *          row, subject is null and path is the bundle's _laws.md.
 *   Hit    { rank, score, kind, domain, subject, technique, path, gist, use_when,
 *            why: string[] }
 *   Result { schema: 'registry-query/1', terms: string[], hits: Hit[],
 *            truncated: boolean, tokens: number, empty_reason: string|null }
 *   Doc    { path, tokens, truncated, text, sections: string[] }
 */

export const PROJECTION_SCHEMA = 'registry-route/1';
export const RESULT_SCHEMA = 'registry-query/1';
export const DEFAULT_TOP = 8;
export const DEFAULT_BUDGET_TOKENS = 1500;
export const DEFAULT_READ_TOKENS = 2000;
export const GIST_MAX_CHARS = 280;

/** Same estimator as ledger-read.mjs, so budgets mean one thing across tools. */
export const estimateTokens = (s) => Math.ceil(s.length / 4);

/**
 * Walk every bundle (or `domains`) under `<root>/knowledge/` and build the projection.
 * @returns {{ schema: string, builtFrom: Record<string,string>, entries: object[], postings: object }}
 */
export function buildProjection(root, { domains = null } = {}) {
  throw new Error('registry-query: buildProjection not implemented');
}

/**
 * Load the cached projection, rebuilding a bundle whose digest moved.
 * @returns the same shape as buildProjection
 */
export function loadProjection(root, { domains = null, cacheDir = null, rebuild = false } = {}) {
  throw new Error('registry-query: loadProjection not implemented');
}

/**
 * Rank entries for the terms. Output is cut to `budgetTokens` (estimated over the
 * serialized hits) and `top`, whichever binds first; `truncated` says which happened.
 * @returns Result
 */
export function query(projection, terms, { domains = null, top = DEFAULT_TOP, budgetTokens = DEFAULT_BUDGET_TOKENS, kinds = null } = {}) {
  throw new Error('registry-query: query not implemented');
}

/**
 * Read one published document, optionally one `## ` section of it, under a budget.
 * Refuses paths outside the published lanes and any `*.local.*` file.
 * @returns Doc
 */
export function readDoc(root, relPath, { section = null, maxTokens = DEFAULT_READ_TOKENS } = {}) {
  throw new Error('registry-query: readDoc not implemented');
}

/**
 * A subject's card: its golden path entry plus every technique entry, gists included.
 * @returns {{ subject: object|null, techniques: object[], tokens: number }}
 */
export function subjectCard(projection, subject, { domain = null } = {}) {
  throw new Error('registry-query: subjectCard not implemented');
}
