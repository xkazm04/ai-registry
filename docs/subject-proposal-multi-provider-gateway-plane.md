# Subject proposal — `multi-provider-gateway-plane`

**Status:** **EXECUTED** 2026-09-02 by run `intake-portkey-0902`, in the same session that raised it (intake 2.1.1; front half by an Opus worker, subject forged by an Opus worker, reviewed by the director). Six techniques plus one application. Overrides recorded by the drafter: `router-failure-is-not-candidate-failure` renamed `router-versus-candidate-failure` (the bundle reserves the "X-is-not-Y" form for state-versus-failure claims); `declarative-request-map-imperative-response-transform` renamed `adapter-direction-asymmetry` (the transplantable claim is that an adapter's two directions deserve different expression media). B2 decided into this subject: the carrier must be a status integer because the consumer that branches is an operator-authored list of integers, a gateway-plane object. One fetch spent on the event-stream framing specification. Five deviations recorded and carried into the source-tree task row. Five `design` candidates with
`corpus: NONE` and one shared home; the worker did not raise this as a repo-wide `/forge`,
because the per-system routing count (§4) says no single plane of the tree clears the
threshold alone and only this cluster shares a home.
**Bundle:** `software-engineering`
**Category:** `backend-platform` → subcategory **`resilience`** (see placement note)
**Resolved path:** `knowledge/software-engineering/backend-platform/resilience/multi-provider-gateway-plane/`
**Raised by:** `/intake`, 2026-09-02, from [`librarian/sources/2026-09-02-portkey-gateway.md`](../librarian/sources/2026-09-02-portkey-gateway.md) (design record — entries A1, A4, C1,
C3, and optionally B2 — over `Portkey-AI/gateway` @ `669825cb`.
**Engine:** `domain-knowledge-forge` — read `docs/forge-brief.md` first; it is the contract.

## Placement, verified against the authority

`knowledge/software-engineering/taxonomy.json` is the authority; **`categories` is a
list**, and the counts below were read from the file this run by walking
`categories[] → subcategories[] → subjects[]`, not from the directory tree:

- `backend-platform.resilience` holds **eight** — `error-handling`,
  `optional-dependency-degradation`, `rate-limiting`, `retry-backoff`,
  `scale-investment-timing`, `self-healing`, `stream-proxy-hop`, `webhook-ingestion`.
  **Cap is ten. Two slots free.**
- `llm-agent.orchestration` holds **nine** (the `tenant-scoped-agent-runtime` landing
  earlier today took the ninth). One slot free.
- **`llm-agent.runtime-and-io` holds ten — FULL.** `streaming-output` lives there, so the
  streaming-shaped half of this subject (C3) **cannot** be homed beside its nearest
  neighbour, and this constrains the placement rather than merely informing it.
- `llm-agent.prompt-and-context` seven; `llm-agent.evaluation-and-cost` five;
  `security` eight; `integration` nine.

**Placement decision: `backend-platform/resilience`.** The subject's nearest neighbour by
force is `stream-proxy-hop`, which is *the same shape with N=1* — one hop, one origin, one
credential — and lives here. `retry-backoff` (the failure lane this plane composes over)
and `rate-limiting` are here too. The alternative, `llm-agent/orchestration` beside
`model-routing`, is defensible and would consume that subcategory's last slot; the
discriminator is that this subject's decisions are **transport-and-envelope** decisions
(framing, status space, config inheritance, failure attribution) rather than
*which-model* decisions, and `model-routing` already draws that seam in its own words:
"routing decides, failover retries, metering bills." **Append the slug through
`scripts/apply-taxonomy.mjs`; do not edit the tree by hand.**

Link depths, stated so they are not derived wrongly:

- from `multi-provider-gateway-plane/multi-provider-gateway-plane.md` → `../../../_laws.md`
- from `multi-provider-gateway-plane/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling in the same subcategory: `../stream-proxy-hop/stream-proxy-hop.md`,
  `../retry-backoff/retry-backoff.md`,
  `../stream-proxy-hop/techniques/upstream-status-normalization.md`,
  `../retry-backoff/techniques/storm-control.md`
- to another subcategory in the same category: `../../data-layer/...`
- to another category's subject:
  `../../../llm-agent/orchestration/model-routing/model-routing.md`,
  `../../../llm-agent/orchestration/model-routing/techniques/failover-horizon.md`,
  `../../../llm-agent/runtime-and-io/streaming-output/streaming-output.md`,
  `../../../security/credential-vault/credential-vault.md`
- to another bundle:
  `../../../../llm-observability/telemetry-and-data/multi-provider-event-normalization/multi-provider-event-normalization.md`

## The gap, measured

Concept probes only — never product names, which return zero by construction against the
purity gate — followed by opening every golden path the map returned:

| concept probed | best hit | what it actually covers |
| --- | --- | --- |
| provider fallback and load balancing across model endpoints | `llm-agent/orchestration/model-routing` (17 pts) | *which* candidate serves a call — class, tier, effort, policy, ranking, floors. `routing-policy` is a flat rule cascade over one candidate set; nothing composes strategies or inherits execution policy down a tree |
| normalizing heterogeneous provider responses to one schema | `llm-observability/.../multi-provider-event-normalization` (21) | normalization **for accounting**: one internal event model, `refuse-to-derive`, `two-doors-one-pipeline`. Correct there, and the opposite of correct for a proxy whose normalized payload is the product |
| circuit breaker for degraded upstreams | `backend-platform/resilience/stream-proxy-hop` (9), `retry-backoff` (6) | one hop to one origin; and a breaker whose output is admit-or-deny for one dependency. Neither reaches a breaker feeding a candidate list |
| retry budget and provider-dictated backoff | `retry-backoff` (34) | the classification taxonomy, the ladder, the budget, the breaker — all of it, and this subject must **compose over it, never restate it** |
| (streaming, via the corpus worker) | `llm-agent/runtime-and-io/streaming-output` | one producer to one UI surface, with a parser prescribed **stateless per frame** — the opposite of what N providers require |

`stream-proxy-hop` is the nearest neighbour and must be **cited as a boundary, never
absorbed**: it owns one long-lived hop to one origin (heartbeats, reconnect hygiene,
origin non-disclosure, status clamping toward a dumb client). This subject owns what
changes when the hop fronts **many** origins for **many** callers — which is where
composition, inheritance, failure attribution, caller-scoped lossiness and per-provider
framing all appear at once, and none of them exist at N=1.

## The subject, in one paragraph

**Multi-provider gateway plane** is the discipline of the request/response path in a
process that fronts several interchangeable-but-not-identical upstreams for callers it
does not control. Its unit is one caller request resolved against a *tree* of candidates,
and its four recurring problems are: expressing routing and execution policy in one
structure without making inheritance ambiguous; keeping the router's own failures
distinguishable from its candidates' at every layer that loops; deciding how much of each
upstream's native shape survives translation, and who gets to choose; and re-framing
byte streams whose only shared property is that bytes arrive over time.

## Boundaries it must NOT absorb

- `retry-backoff` owns the ladder, the classes, the budget and the breaker's state
  machine. This subject owns only what changes when the breaker's verdict becomes an
  input to *candidate selection* (A2 lands **there**, not here).
- `model-routing` owns which model and why, and `failover-horizon` owns the
  substitution window. This subject owns the mechanics under that decision.
- `stream-proxy-hop` owns the N=1 hop entirely.
- `multi-provider-event-normalization` owns normalization for accounting; this subject
  must cite it and state the discriminator (is the normalized payload a *record* or the
  *product*?) rather than duplicating its extractor rules.
- `credential-vault` owns the slug and the brokered egress. D2 lands there.
- `prompt-safety` owns what a content check decides; B2 owns only how the verdict is
  carried.

## Proposed techniques (slugs are proposals; the drafter may override with an argument)

1. `strategy-tree-with-inherited-policy` — from A1. Routing strategies as composable
   nodes; the inheritance table (which keys merge, which replace wholesale, which are
   converted once at the root); the node address that survives filtering.
2. `router-failure-is-not-candidate-failure` — from A4. In-band attribution across a
   retry boundary; why a status code cannot carry it; the loop's break condition.
3. `caller-scoped-normalization-strictness` — from C1. Two consumer populations, one
   wire format; the additive-native-payload pattern; what strict mode is allowed to
   silently collapse and what it must not.
4. `per-provider-stream-framing` — from C3. The delimiter as a `(provider, endpoint)`
   lookup; non-SSE framings; the per-stream state a chunk transform must own.
5. `declarative-request-map-imperative-response-transform` — from C2 (promoted from a
   qualifier to a technique **only** inside this subject, where it is load-bearing for
   the adapter interface; otherwise it is a line in `per-provider-usage-extractors`).
6. *(optional sixth)* `policy-verdict-in-the-status-space` — from B2, if the drafter
   agrees it belongs here rather than in `prompt-safety`.

## Open questions the drafter decides rather than discovers

- Does the inheritance table belong in the golden path or in technique 1? (One tree's
  26 keys are an instance; the transplantable rule is the merge-vs-replace *distinction*.)
- Is B2 this subject's or `prompt-safety`'s? Decide before drafting, and cite either way.
- The subject is at risk of restating `retry-backoff`. The drafter should write the
  boundary section **first** and check every technique against it.

## Instances a reader can open

- `Portkey-AI/gateway` @ `669825cbe89ee51569918b8f78a9db486fd69dd4` — every anchor in §3.
- Fleet: `pumper`'s pluggable engine interface is the same shape in a non-LLM domain and
  is the natural place to look for a second sighting (§10).

## Why proposed rather than written by the intake run

Five design decisions, four consecutive pipeline stages, one home, no corpus subject —
that is a subject by construction and the routing count says forge, not amendment. It is
proposed rather than executed because the director owns the direction pass, because the
placement consumes one of `resilience`'s two remaining slots, and because the boundary
against `stream-proxy-hop` and `retry-backoff` is delicate enough that a drafter should
write it deliberately rather than inherit it from a triage table.
