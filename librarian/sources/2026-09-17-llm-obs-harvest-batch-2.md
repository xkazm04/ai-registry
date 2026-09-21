---
source: batch
kind: harvest-batch (6 sources, one domain, parallel miners)
domain: llm-observability
mined_on: 2026-09-17
queue_rows: [OBS-003, OBS-004, OBS-006, OBS-007, OBS-013, OBS-014]
parked_same_pass: [OBS-009, OBS-012]
harvest_skill: 0.3.0
miners: 6 (cap 5 + top-up; proposals only; single-writer landing)
fetches: 6 of 18 budgeted (OBS-014 spent 5 of its own as a reference-index wave; the five vendor/lab clones spent 0–1)
extracted: 79
accepted: 5
already_covered: 51
declined: 0
leads: 17
untriaged: banked per source
run_id: harvest-obs-0917
siblings: intake-supermemory held agent-memory and eval-harness throughout; miners were forbidden those homes
---

# llm-observability harvest batch 2 — ingest of senders that already normalized

Six remaining queued rows in the domain, admitted against live needles
(operator-surfaces 40, telemetry/trace-rollup/usage-limit 24 each, the
federation coverage-gap line). Two pri-1/2 quality-scoring rows parked
before mining: judge and drift subjects sit at 0 attention after batch 1,
and OBS-009's paper was already used as corroboration by ragas (2026-09-15).
Parked is not declined.

Expected yield, said before mining: vendor repos produce content and
currency with catches against batch 1's specs; HELM is a coverage-gap
closer, not a technique factory; the awesome-list yields leads. That is
what the trees produced. Body-level prior-art verification then dropped
two auto-accept *new technique* proposals to catch and lead — same lesson
as batch 1, applied on purpose.

A source ORIGINATES a finding. It never AUTHORIZES one.

## Landings (content)

| landing | where | from |
| --- | --- | --- |
| sender-defaulted optional 0 is not a miss; fold at most once | `token-usage-quadruple` | OBS-003; converges with OBS-001's untriaged "token subset invariants as ingest checks" |
| sampled list needs a sample signal | `span-cap-truncation-signal` | OBS-004; inverts the "list needs no cap-and-signal" sentence |
| missing token usage is unmeasurable, not headroom | `cost-evidence-and-imputation` | OBS-007; inverts "token caps need none of this — a token count is exact" |
| force-and-observe a stream usage frame; admission check adds zero of the usage meter | `enforcement-placement-and-reconciliation` | OBS-007 |

No new subject. No new technique file. GPU collector (OBS-004) fired the
XL count (three unhomed decisions sharing `platform-observability`) and
was banked as a lead, not forged in this harvest.

## Dropped at body-level (not declined)

| miner proposal | why it did not land |
| --- | --- |
| exclusive spend buckets as a new operator-surfaces technique (OBS-004) | `cost-metering/spend-attribution` already owns feature / spend-class as a write-time axis; the dashboard total composing from exclusive partitions is honesty the render layer already states |
| identical-tool loop detector as a new trace-rollup technique (OBS-004) | a product detector over traces, not this subject's derivation craft; banked as a lead |
| mix-by-unit limiter, optimistic escrow wait-skip, prepaid model deny-list (OBS-006) | G1 boundaries of techniques that already name both modes / escrow / unpriceable-refuses; untriaged with anchors |
| base64 OTLP id decode (OBS-004) | G1 on `tenant-scoped-trace-ids` (hex-only canonicalization); untriaged |

## Per-source

**OBS-003 — OpenLLMetry** (`github:traceloop/openllmetry` @ `0c7520a6`,
2026-09-16). Vendor repository. 979 landing / 14,178 in-tree md / 61,532
non-test Python lines. 0 of 3 fetches. Two ingest amendments on
`token-usage-quadruple` (defaulted optional zeros; fold-at-most-once).
Catches against stored totals, attribution keys, nullable cost, lossy
cache enum, list-vs-shape, provider-family matching. Currency: this
emitter version-cuts names rather than dual-emitting, and payload capture
defaults on. Leads: unfinished cache-name constants vs MIGRATION.md;
workflow-name leak onto sibling spans; span-attribute allowlist (builder
emission, this subject's boundary refuses it); unfinished
`use_legacy_attributes` rename. Untriaged: vector-DB instrumentations,
MCP `__dict__` walk, hosted product surfaces.

**OBS-004 — OpenLIT** (`github:openlit/openlit` @ `cc00e010`, 2026-09-17).
Vendor repository. 1,383 landing / ~365k docs mdx (cookbooks dominate) /
pipeline code is the operating document. 0 of 3 fetches. One amendment
(`span-cap-truncation-signal`). Strong catches: derived L2 rollup,
offset paging, hierarchy drop/reparent, SDK `cost=0`, auto-price treats 0
as missing, capability refusal, SQL read-only, hash sampling, token
quadruple. Leads: GPU measurement-source identity (XL / scoped forge
candidate), guard fail-open pipeline, capture-mode redaction (second
sighting of the OBS-002 sender-redaction lead).

**OBS-006 — Helicone** (`github:Helicone/helicone` @ `067d9290`,
2026-09-16). Vendor repository. 1,194 landing / ~144k in-tree md; honest
read the cost/limit/wallet/MCP slice. 0 of 3 fetches. Zero content
accepted — the class-predicted good run. Ten catches: calculator null vs
store `UInt64 DEFAULT 0`; provider-reported dollar cost wins; metric ×
window × unit × segment; DO-serialized admission; naive ClickHouse
rescan; worst-case escrow; MCP spend tool (negative of
read-tools-default-writes-gated); HQL as read-only SQL; session/property
attribution; cost alerts. Currency: two-grade cost quality. Leads:
cookbook dollar figures; token-unit and multi-policy still "coming
soon". Untriaged G1: mix-by-unit deduction, optimistic escrow wait-skip,
prepaid unpriceable → model deny-list; BYOK-then-PTB sort (home not on
admitted prior art).

**OBS-007 — Envoy AI Gateway** (`github:envoyproxy/ai-gateway` @
`815ed8e1`, 2026-09-17; repo now titled Agent Router, clone remote
unchanged). Vendor repository. 834 landing / 57,553 site/docs. 1 of 3
fetches (identity check after ingest title mismatch). Two amendments on
usage-limit-governance. Catches: enforce-on-actuals / N/C+1, debit-not-cut
at the cap, observe-only shadow, server-stamped model scope, calendar
windows, 429 without a derived wait, CEL-as-metric (corpus forbids).
Leads: quota-aware backend selection (proposal 009, return when it is in
the data plane); `serviceQuota` / Exclusive bucket still TODO. The
QuotaPolicy path still mixes a unit increment into the token ledger; the
token_ratelimit path in the same tree already documents the fix — folded
into the enforcement-placement paragraph.

**OBS-013 — HELM** (`github:stanford-crfm/helm` @ `63754d05`, 2026-06-05).
Lab evaluation-framework repository (queue guessed research-model
release; rejected — no weights). 956 landing; ~4k docs actually read.
0 of 3 fetches. **Coverage-gap KEEP:** HELM is a lab-run format other
orgs can *re-execute*, not an open spec they can *submit* into. Official
sharing is the lab's own object-store dump. Maintenance mode 2026-06-01
freezes that stand-in. Ten catches against federated-benchmark-sharing
and cross-provider-benchmark-operations once the files were opened
(aggregate-only, capture-locally, determinism-stamping, display schema ≠
ingest schema, skippable redaction). One lead: a hub that admits
third-party result artifacts without re-running. Harness-resume claims
left untriaged-contended (`eval-harness` held by a sibling).

**OBS-014 — awesome-ai-tokenomics** (`github:QuesmaOrg/awesome-ai-tokenomics`
@ `2f87ed71`, 2026-09-14). **Reference index**, not an app/tutorial
aggregator. 297 distinct outbound documents / 9,017 README words. Wave 1
opened three: Cloudflare spend-limits (catch + degrade-route lead),
arXiv:2604.22750 abstract (catch on preflight; lead that a model's own
forecast is anti-evidence), GitHub Agentic Workflows budget operating
doc (queue candidate for the llm-agent cost-CONTROL gap — do not strike).
No technique from an annotation. Ranked unread tail of 240 is the
artifact. Fetches 5 (over the commentary budget; the class's per-reference
budget, capped to one wave of three).

## Batch convergence

Two independent vendor instrumentations (OBS-003, OBS-004) plus Helicone
(OBS-006) all implement `cost = 0` on a miss — three catches against
`nullable-cost-never-zero` in one pass. OBS-001's untriaged token-subset
invariants converged with OBS-003's two landings. OBS-002's sender-side
redaction lead gained a second sighting (OBS-004 capture modes) without
being landed. HELM did not close the federation gap it was the stand-in
for. Author-deduped: six organisations, no channel-corpus.

## Evaluations owed

Four content landings, queued `pending` on `personas` (the project that
declares `llm-observability`). Not run in-pass: six 2026-08-28 evaluations
are still pending, and this pass does not pretend to be complete while
that debt sits. Currency and leads are not evaluated.

## Re-scan conditions (per row, in the miners' notes)

OpenLLMetry: cache-name constants land or `LLM_*` aliases die.
OpenLIT: list pagination leaves offset, or `get_chat_model_cost` returns
null. Helicone: token-based rate limits leave "Coming Soon", or cost
column stops being `UInt64 DEFAULT 0`. Envoy: QuotaPolicy `serviceQuota`
enforced, or proposal 009 in the data plane. HELM: a hub that admits
third-party artifacts. Tokenomics list: `research/manifest.json` grows a
dated whole-bill primary, or 2026-12-14.
