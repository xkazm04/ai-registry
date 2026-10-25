# The query lane - the registry's front door

How an agent finds the one technique a decision needs, without paying for the corpus to
find it. One query core ([`scripts/lib/registry-query.mjs`](../scripts/lib/registry-query.mjs))
behind three faces: an MCP server for agents, a CLI for shells and skills, and a benchmark
arm that proves a ranking change before it lands.

> **Query first, then open the one document the hit names.** `index.json` is a
> script-facing address book: a script resolves a field from it; an agent never Reads,
> greps or slices it.

## Why

The read path used to be "read `knowledge/<domain>/index.json`". Measured, that instruction
did not survive contact with agents:

- **The index is too big to read.** `software-engineering/index.json` is 397K tokens
  (chars/4); `game-production` 117K and `recruiting` 98K. No agent in the local transcript
  set ever Read one whole.
- **So every session rebuilt a query layer by hand.** Across 3,594 local Claude Code
  transcripts, agents sliced an index with ad-hoc `node -e`, python and grep 477 times,
  against 53 calls of the real router (`research-map.mjs`). Each slice is a one-off
  parser with its own bugs, and none returns a technique's path or its rule.
- **The router had a blind spot.** `research-map.mjs` scores slugs and `use_when` from the
  index, which drops document bodies. A concept that lives only in prose is unreachable
  through it by any query, and the result set stays full while it happens: "shared custody"
  returned forty confident rows without the owning subject, where a body-aware search put
  it at two; "groundedness verification" missed the eight-technique build that owns it
  (`research-map.mjs` header, measured 2026-08-31 and 2026-09-06).
- **And the docs disagreed.** AGENTS.md and README said "read index.json"; the always-on
  access rule said "grep `use_when`"; `/consult` said "always route with the script". An
  agent handed three stories improvises a fourth.

This lane is that query layer, built once, and every agent-facing surface now tells the
same story: AGENTS.md, README, `rules/ai-registry-access.md` (always-on in every connected
project) and `skills/consult`.

## The projection and its cache

The core builds a **projection** of each bundle: one entry per golden path
(`kind: subject`), per technique (`kind: technique`) and per law (`kind: law`), each with its
repo-relative `path`, its `title`, a one-line `gist` (title plus the first sentence of the
first paragraph), its `use_when` triggers and its laws. Alongside it sits a BM25 postings list
over the fields and the document **bodies**, which is what closes the prose blind spot.
Field weights and the tokenizer are documented in the core's header.

- **Generated and local.** Markdown and frontmatter stay the source of truth. The cache is
  `.cache/registry-route/<domain>.json`, gitignored: a committed projection would add the
  per-commit churn the generated indexes already carry.
- **Fingerprinted, never trusted stale.** Each bundle's cache carries a sha256 over the
  sorted (path, size, mtime) of its `.md` files and `index.json`. A moved fingerprint
  rebuilds that bundle only; a dirty working tree invalidates correctly. An unwritable cache
  degrades to in-memory with a note on stderr; it never fails a query.
- **Budgeted.** A query stops adding hits at `top` (default 8) or `budget_tokens` (default
  1500, estimated as chars/4 of the serialized hits, the same estimator `ledger-read.mjs`
  uses), whichever binds first, and says `truncated` when hits were left. An empty result
  carries `empty_reason`; an honest empty is an answer, and a reason to rephrase once.

Wire shapes (`Entry`, `Hit`, `Result`, `Doc`) are declared in the core's header. Every field
is always present.

## CLI

```sh
node <registry>/scripts/registry-query.mjs "deciding whether a green audit means accessible"
node <registry>/scripts/registry-query.mjs --terms "rate limiting, retry budget" --domain software-engineering --top 5
node <registry>/scripts/registry-query.mjs "<terms>" --json          # the Result object
node <registry>/scripts/registry-query.mjs --read <path> [--section "<heading>"] [--max-tokens 2000]
node <registry>/scripts/registry-query.mjs --subject <slug> [--domain <bundle>]
```

Default output is two lines per hit:

```
1. technique <domain>/<subject>/<technique> - <gist>
   <path> | when: <use_when; ...>
```

## MCP server

[`scripts/registry-mcp.mjs`](../scripts/registry-mcp.mjs) serves the same core over MCP
stdio (newline-delimited JSON-RPC 2.0; stdout carries protocol only, logs go to stderr). It
negotiates protocol versions `2025-11-25`, `2025-06-18`, `2025-03-26` and `2024-11-05`,
answering any other request with the newest. The projection loads lazily on the first tool
call, stays in memory, and is re-checked against the fingerprints at most once a minute, so
a long-lived session sees techniques landed after it started.

| Tool | Params | Answers | Size |
| --- | --- | --- | --- |
| `registry_query` | `terms` (string or string[]), `domain?`, `top?`, `budget_tokens?` | ranked hits: kind, domain/subject/technique, path, gist, `use_when`, why it matched. Text plus `structuredContent` (a `Result`, declared by `outputSchema`) | ~1.5K tokens default |
| `registry_read` | `path`, `section?`, `max_tokens?` | one published document, or one `## ` section of it; a first line lists its sections | ~2K tokens default |
| `registry_subject` | `subject`, `domain?` | a subject's golden path entry plus every technique's gist and triggers | a few hundred to ~2K |
| `registry_ledger` | `command`, `file`, and ledger-read's options in snake_case (`where`, `since`, `last`, `fields`, `table`, `match`, `after_table`, `last_paragraphs`, `max_tokens`, `cursor`, `json`) | bounded, paged reads over the shared markdown ledgers | ~2K tokens default |

`registry_ledger` calls `ledger-read.mjs`'s exported `runQuery` in-process: that function
is the CLI minus file I/O and exit, so the tool keeps the CLI's exact cursor and refusal
semantics without a node start per call. It serves repo-relative, **git-tracked** `.md`
files only - an untracked vault note (`.architect/`, `.spark/`, scratch) is private
evidence and is refused - and refuses `..`, absolute paths, links out of the checkout and
`*.local.*` files. `registry_read` refuses paths outside
the published lanes and any `*.local.*` file.

Errors: an unknown method is `-32601`; an unknown tool or arguments that fail the input
schema are `-32602`; a tool that fails while running returns a result with `isError: true`
and a text explanation, so the agent can read it and recover.

Tool names and params are wire contract. `SERVER_VERSION` in the server (reported as
`serverInfo.version`) is semver: a renamed tool or param, or a changed result shape, is a
major bump.

## Install

The server's root is the checkout it lives in; `--root <dir>` or `AI_REGISTRY_DIR`
overrides it. It exits 2 at start if that root has no `knowledge/` lane.

User scope, once per machine (every project sees the tools):

```sh
claude mcp add --scope user ai-registry -- node <absolute path to registry>/scripts/registry-mcp.mjs
```

Project scope, committed in the consuming project's `.mcp.json` so every contributor gets
it (Claude Code expands `${VAR:-default}`, so the sibling-checkout default needs no machine
path; each contributor approves a project-scope server once):

```json
{
  "mcpServers": {
    "ai-registry": {
      "type": "stdio",
      "command": "node",
      "args": ["${AI_REGISTRY_DIR:-../ai-registry}/scripts/registry-mcp.mjs"]
    }
  }
}
```

Without the server, the CLI is the same front door, and the access rule names both.

## Verify

```sh
claude mcp list                                        # ai-registry: ... Connected
node --test scripts/tests/registry-mcp.test.mjs        # protocol, tools, round-trip, real-core smoke
node scripts/routing-bench.mjs --arms research-map,research-map-prose,registry-query,registry-query-top3
```

The bench ([`scripts/routing-bench.mjs`](../scripts/routing-bench.mjs)) runs a fixed set of
real routing queries mined from transcripts (fixture under `scripts/fixtures/routing-bench/`)
and reports recall@1/@5 on the owning subject, technique@5, tokens returned, and a
decision-cost model (tokens returned plus the documents an agent must open to reach the
right technique). **A change to ranking, fields or budgets lands only if it beats the
current arm on that fixture.** Never tune against the fixture itself; that turns the
measurement into a fit.

A one-shot smoke without a client:

```sh
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"registry_query","arguments":{"terms":"deciding whether a green audit means accessible"}}}' \
  | node scripts/registry-mcp.mjs
```

## What stays where it was

`research-map.mjs` remains the routing half of `/research` (prior art and taxonomy HOME
for a new subject), and other skills still call it. `index.json` remains the generated
address book that scripts, `/conform` and the generators read. What changed is the agent's
first move: a query, not a read.
