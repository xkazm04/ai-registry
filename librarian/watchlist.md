---
kind: watchlist
updated: 2026-08-22
---

# OSS watchlist - candidate trees for the two loops

Public repositories worth tracking for the external-reconcile lane (mastery) and
the maturity-scan showcase. Two tracks, because the loops select on different
axes and [[2026-08-22-2]] measured them near-orthogonal. Everything here is a
CANDIDATE: a scan verifies the velocity claim, a worker's read verifies the
quality claim, and entries graduate into run notes when a wave consumes them.

Sourcing note, recorded so the next update knows the landscape: web research
(2026-08-22) found NO authoritative public list of "repos developed primarily by
AI agents" - coverage is tool-listicles, not repo evidence. The claims below are
therefore graded: **measured** (our scan), **declared** (the project says so /
ships agent config), or **reputed** (community standing only). The scan is the
verifier for track A; nothing publishes as AI-native on reputation.

## Track A - AI-native velocity candidates (scan/showcase loop)

Verified by scanning; high adoption expected. Sorted by expected signal.

| repo | grade | why it is here |
| --- | --- | --- |
| anomalyco/opencode | declared | ~199k stars; MIT terminal agent, heavily dogfooded; the free-model episode showed its infra velocity |
| block/goose | declared | Block's agent, an anchor project of the Linux Foundation's Agentic AI Foundation |
| openai/codex | declared | the Codex CLI agent repo; agent-built agent |
| anthropics/claude-code | measured (earlier scan in DB) | rescan on cadence; the canonical dogfooding tree |
| cline/cline | declared | open-source agentic assistant, local-first |
| All-Hands-AI/OpenHands | declared | long-running agent platform, publicly agent-developed |
| vercel/ai | measured (wave 4 scan pending) | the org already posts top adoption scores (next.js, v0-sdk in DB) |
| modelcontextprotocol/* (servers, inspector, python-sdk) | measured (typescript-sdk L4/76, adoption 78 - highest yet) | sibling repos of a proven high-adoption org |
| getsentry/sentry | measured (sentry-javascript L4/81) | scan the mothership; the org is demonstrably AI-native |
| posthog/posthog | reputed | publicly aggressive AI-assisted engineering culture; scan to verify |
| cal-com/cal.com | reputed | same class; scan to verify |
| ghostty-org/ghostty | reputed | Mitchell Hashimoto's tree; publicly documented agent-assisted workflow (zig - stack would need declaring) |

## Track B - mastery candidates (external-reconcile lane)

Premium engineering reputation; mapped to registry subjects still single-stack.
Stack in parentheses; `zig`/`c`/`go` beyond the declared set would need
`stacks:` extension, which [[2026-08-22-2]] normalized.

| repo | subjects it could serve | grade |
| --- | --- | --- |
| tailscale/tailscale (go) | p2p-networking (connection-lifecycle, discovery), sync-observability | reputed, exceptionally documented internals |
| caddyserver/caddy (go) | ingress-topology, listener-lifecycle, entity-lifecycle (config reload) | reputed |
| nats-io/nats-server (go) | delivery-guarantees, outbound-fan-out, subscription-lifecycle | reputed |
| etcd-io/etcd (go) | sync-replication (topology), migrations (schema version), lease-renewal | reputed |
| prometheus/alertmanager (go) | alerting is ALREADY 2-stack (react+rust, verified 2026-08-22) - hold for a deepen pass, not a reconcile | reputed |
| evanw/esbuild (go) | build-economics (compilation-unit-splitting, cache-budgeting) | reputed, famously disciplined tree |
| temporalio/temporal (go) | overlap-and-reentrancy second pass - banked in [[2026-08-22-5]] | measured |
| modelcontextprotocol/typescript-sdk (node) | client-integration, server-composition - banked leads | measured |
| redis/redis (c) | embedded-db siblings? admission (maxmemory eviction), rate-limiting | reputed |
| postgres/postgres (c, mirror) | transactions, migrations (transactional-ddl) - NOTE: mirror; scan label applies | reputed |
| openzfs/zfs (c) | journal-and-durability-modes second c sighting, storage-accounting | reputed |
| oven-sh/bun (zig/c++) | subprocess-lifecycle, streaming-output | reputed; stack question |

## Standing rules for consuming this list

- A wave consumes at most one entry per subject; the worker's evidence-first
  rule overrides any mapping above.
- Track A entries get a scan BEFORE any showcase claim; "reputed" never
  publishes.
- Mirrors (postgres, sqlite-class trees) carry the register's outside-in and
  no-PR-signal caveats by construction - see the register's honesty qualifiers.
- Update grades in place; move consumed entries into the run note that consumed
  them rather than deleting the row silently.
