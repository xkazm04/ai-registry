---
layer: application
type: application
subject: breach-alerting-and-attribution
technique: top-contributor-attribution
stack: rust
status: forged
---

# Top-contributor attribution in LightTrack (Rust)

LightTrack's breach alerts answer "what's burning the money?" inline. The
module doc of `crates/api/src/alerts/attribution.rs:1-8` states the whole
technique in three sentences: the operator's next question is always what
drove the spend, so the alert carries top contributors; pure composition
(`compose`) is split from I/O (`fetch`) so ranking/share/scoped-wording are
unit-tested on fixture rows; and everything runs inside the spawned delivery
task — zero cost on the ingest path — and is best-effort.

## Where it runs and what it reads

`on_admission` (`crates/api/src/events.rs:138-203`) is the shared
post-admission hook for single- and batch-ingest: it logs each breach
(`:149-159`), feeds the out-of-band rejection ledger (`:160-170` — a rejected
event is *never stored*, "that would corrupt usage/cost", so the running
per-key rejection count rides along on the alert instead of existing as rows),
then hands the breached statuses to `st.alerts.notify` (`:183`), the
best-effort, off-path delivery entry. Attribution's `fetch`
(`attribution.rs:69-84`) executes inside that spawned task, reading the two
**existing rollups** — `cost_summary_windowed` and `usecase_costs` — with
`unwrap_or_default()` on both: a store error degrades to empty attribution,
never a failed or delayed alert. The docs (`docs/ALERTS.md:69-76`) advertise
exactly this contract: computed in the delivery task, zero ingest cost, and
"if the rollup is empty or fails, the alert still delivers without the
`attribution` block".

## The composed answer

`compose` with no scope (`attribution.rs:96-103`) groups cost rows by model,
annotates each model with its dominant *named* use-case
(`annotate`, `:162-175` — producing decision-ready labels like
`gpt-4o (summarize)`), then `rank` (`:187-203`) sorts by cost descending,
**drops zero-spend rows**, keeps the top **3**, and computes `share_pct`
against the full window total — the fixture test at `:252-273` pins the
60/30/10 share math and the annotation. Both renderings come from one result:
`message_tail` (`:39-54`) appends the human sentence chat webhooks render
("Top spenders (in this window): …62% ($3.1000)…"), and `to_json` (`:57-64`)
emits the structured block for custom receivers — the payload shape in
`docs/ALERTS.md:45-63` shows the two side by side.

## Scope inversion and the identity refusal, in the same match

The same `compose` realizes the two sibling techniques. Scoped arms invert the
axis and recompute the denominator within scope: a provider cap ranks that
provider's models (`:104-108`), a model cap ranks that model's use-cases
(`:109-120`), a use-case cap ranks the models serving it (`:121-130`); each
carries a scope note, and an empty scoped window states "no attributable spend
in window" rather than going blank (`scoped`, `:206-217`; test `:302-312`).
The `ApiKey | Customer` arm (`:131-144`) is the refusal, with the rationale in
the comment: the rollups "cannot be filtered to one key or customer, and an
alert channel is the wrong place to enumerate key identifiers anyway — it fans
out to whoever holds the webhook." The alert instead carries a forwarding
address: `scope …: per-key/customer breakdown at GET /v1/limits/usage` — the
authenticated, project-scoped surface that does answer it.

## Deviations worth noting

- Attribution reads the embedded database directly, so it is disabled on the
  hosted-database backends (`docs/ALERTS.md:87-89`) — the breach still
  delivers, minus attribution. Honest degradation, but a coverage gap the
  standard would eventually close by porting the rollup reads.
- Dedup state is in-memory (`docs/ALERTS.md:117-118`): restart re-alerts, and
  horizontally scaled instances dedup independently — disclosed in the docs
  exactly as the golden path requires, rather than discovered in an incident.
