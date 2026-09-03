---
subject: tenant-scoped-agent-runtime
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# tenant-scoped-agent-runtime

Born 2026-09-02 from `/intake` run `intake-hermes-0902` (intake 2.1.1): a forge handoff
scoped to one subsystem of a peer agent runtime, where four design decisions carried
`corpus: NONE` with no neighbouring home - the tenant as a task-local scope never an
ambient one; a credential accessor whose fail direction follows the deployment mode;
caches keyed on the tenant that evict the loaded code their entries captured; handles
resolved at call time; ownership stamped before the router; and a written inventory of
what stays process-global. Placed in `llm-agent/orchestration` (ninth of ten) because
`runtime-and-io` reached its cap the same morning with `agent-browser-control`; the
golden path records the forced placement and states the `agent-runtime-assembly` boundary
in both directions. Front half by an Opus worker, subject by an Opus worker, director
review: gate green, purity clean (one trap: "asynchronous" contains a company name as a
substring), the first cited deviation opened and read verbatim. Spec:
`docs/subject-proposal-tenant-scoped-agent-runtime.md` (EXECUTED). No fleet seam - no
connected project serves several tenants from one agent process; the apply step is a
source-tree task row. Deviations recorded in the source note for that backlog: the home
resolver and the secret resolver have opposite fail directions; the global-prefix
allowlist admits a whole platform prefix; the keyed caches have no production reaper.
