---
source: github:Portkey-AI/gateway
kind: repository - vendor repository, the branch with no rules page (a company's open gateway over hosted engines; 22k words of cookbook and deployment recipes, no operating document; the yield was ~9:1 code to prose, from the request pipeline, the config schema, the adapter interface and the mocked-boundary integration suite)
url: https://github.com/Portkey-AI/gateway
title: "Portkey AI Gateway - route to 1,600+ LLMs with guardrails, fallbacks and load balancing"
author: Portkey-AI
commit: 669825cbe89ee51569918b8f78a9db486fd69dd4
words: 1,814 landing / 22,127 in-tree markdown (~6,000 operational, all deployment recipes) / ~5,500 lines of TypeScript read across 24 of 430 files; 33 test files
method: 2.1.1 (round 3 of the 2.x series; every worker Opus, the director Fable)
extracted: 25
accepted: 13
declined: 0
leads: 7
already_covered: 9
untriaged: 5
dispatched: 5
applied: 13
shipped: 1
routing_count: 6 whole-tree; per system A2/B1/C2/D1 - no system clears alone; the HOME-IF-NEW clause fired on four entries sharing one home
handoff: forge (scoped to the request plane; one worker, one subject, same session) + two technique-grain workers + one peer-study worker
directions: 4 proposed (tracklight 3, pumper 1) + 2 peer studies (32 + 13 points) / 0 not proposed
run_id: intake-portkey-0902
siblings: 0 at claim; a foreign, unclaimed restructure of game-production/asset-production appeared mid-run
rescan_when: "the tree records the over-budget stop distinctly from exhaustion (the task row's change, or its own); or a second gateway shows the strictness switch as a caller property (C1's second sighting); or the corpus resolves its own three-way disagreement on guardrail fail direction (the run's highest-value lead)"
---

# Portkey AI gateway (vendor repository, no rules page) - round 3

**Class read at Phase 2 (Opus worker, confirmed):** vendor repository on three tells - two
unregistered seams where the hosted product plugs in (`preRequestValidator`,
`handleCircuitBreakerResponse`), 14k words of cookbook, a config schema plus client types
publishing the closed product's data model. The class predicted the README would produce
nothing and it produced nothing. What the class entry did not predict is written into it
now: **no production-rules page exists**, Phase 2b step 1 returned empty, and the density
moved wholesale into the pipeline code. Fetches: 0 for the director, 1 for the forge
worker (the event-stream framing specification).

**Round-3 declared focus, applied:** (1) the peer-source shape for Phase 7.6 - the front
half ran the peer check, named two peers, seeded twelve points; the study worker produced
32 for tracklight and 13 for pumper, four proposals, and one correction to a seeded point.
Second sighting of the shape; the 2.2.0 bump writes it in. (2) `verified_against` and the
purity substring trap moved into `docs/forge-brief.md` before dispatch; every worker
reported clean on both without being told. (3) per-system count and the source-tree task
rule kept.

**Who wrote what.** Front half - one Opus worker (13 design entries with the golden path
opened per `corpus:` line, per-system routing, 12 claim rows, five promoting questions
executed with three promoted, the spec in the template's shape with placement walked
through the taxonomy list, the peer check). Subject - one Opus forge worker (boundary
section written first, two slug overrides argued, B2 decided into this subject). Four
retry-backoff amendments - one Opus worker. Security technique and two amendments - one
Opus worker. Peer studies and proposals - one Opus worker. The director (Fable) claimed,
re-ran the concept map uncapped, spot-checked anchors, reviewed every diff, wrote the
source-tree task, the notes and the ledgers, and edited the source-classes reference.
**Nothing redone.** Companion file: [`2026-09-02-portkey-gateway.design-read.md`](2026-09-02-portkey-gateway.design-read.md)
(1,291 lines: the full record, evidence, claim rows, promoting questions, leads, untriaged,
reusable engineering, peer notes).

**Foreign change observed:** at 20:20 a session with no board claim began nesting
`game-production/asset-production` into four groups (94 deletions, four new folders, a
taxonomy diff). Not this run's. The pathspec excluded it; index and catalog are left
uncommitted rather than baked over a move in flight. A manual restructure should claim.

## Design record (Phase 2d) - summary; evidence in the companion file

| system | entries | NONE | landed as |
| --- | --- | --- | --- |
| A routing and execution tree | A1 strategy and policy as one recursive tree with per-key inheritance · A2 breaker as candidate filter, all-open is not empty · A3 stated retry-after vs the budget · A4 the hop marks its own failures for the enclosing loop · A5 conditional routing over a query DSL | 2 (A2, A3 promoted) | A1, A4 → the new subject; A2, A3 → `circuit-breakers`, `backoff-design` amendments; A5 catch |
| B guardrail / hook plane | B1 errored ≠ failed, per-check fail direction · B2 the verdict rides in the status space · B3 input checks once, output checks per attempt, one budget | 1 (B3 promoted, narrowed) | B2 → the new subject (drafter's decision); B3 → `failover-horizon` paragraph; B1 catch (`advisory-guard-fail-mode`) |
| C provider normalization | C1 strictness is a per-request switch, native payload alongside · C2 request translation is data, response translation is code · C3 stateful stream framing per (provider, endpoint) | 2 | C1, C3, C2 → the new subject |
| D operator and credential surface | D1 allowlist-sanitized debug stream behind a boot-required token · D2 credential slug with rate limits and a priced roster · D3 one build for the web-standard runtime subset | 1 | D1 → `allowlisted-operator-stream` (browser-credential-boundary); D2 → `brokered-egress` amendment; D3 catch |

**Routing:** whole tree 6 NONE, per system at most 2, so no plane clears alone; four
NONEs plus B2 share one home if new - the request plane of a gateway fronting many
providers for many callers - and the mechanical trigger fired on that clause. Handoff
scoped to the subject; D1, A2/A3, B3, D2 landed as ordinary technique-grain work beside it.

## Landed (13)

- **Subject** `backend-platform/resilience/multi-provider-gateway-plane` (ninth of ten in
  the subcategory; `stream-proxy-hop` is the same shape at N=1 and is its stated boundary):
  `strategy-tree-with-inherited-policy`, `router-versus-candidate-failure` (renamed from the
  spec - the bundle reserves the "X-is-not-Y" form for state-vs-failure claims),
  `caller-scoped-normalization-strictness`, `per-provider-stream-framing`,
  `adapter-direction-asymmetry` (renamed - the transplantable claim is that an adapter's two
  directions deserve different expression media), `policy-verdict-in-the-status-space`;
  application `node--strategy-tree-with-inherited-policy`. Spec
  [`docs/subject-proposal-multi-provider-gateway-plane.md`](../../docs/subject-proposal-multi-provider-gateway-plane.md)
  (EXECUTED). The normalization-for-accounting subject in the other bundle is a boundary
  stated in prose, no link.
- **Technique** `allowlisted-operator-stream` in browser-credential-boundary; application
  `node--allowlisted-operator-stream` with five shortfalls, the sharpest being that the
  tree's "throws at startup" is a per-request 500 in all three callers.
- **Amendments (5):** `circuit-breakers` (one breaker per candidate; all-open degrades to
  trying); `backoff-design` (the stated wait that does not fit the budget ends the ladder,
  never truncated; the ordered accept-list for three spellings of retry-after in two units;
  a fleet-correlating hop shipped with jitter off, cited as a counterexample) with the
  golden path's terminal states now five; `storm-control` (a fan-in component's retry
  default is the fleet's amplifier: ships off); `brokered-egress` (the credential may carry
  a priced roster); `failover-horizon` (input checks once per request, output checks per
  attempt, one budget); application `node--circuit-breakers`.

Director review: gate green for every touched subject (the only red lines belonged to the
foreign restructure), purity grep empty over every upper-layer file (false positives
recorded: "laws", "trust", "invites"), `use_when` on all seven techniques, taxonomy slug
appended last, one cited line per subject opened.

## Applied (Phase 7.5) and shipped (Phase 8)

| Landing | Where | Mode | Verdict | Note |
| --- | --- | --- | --- | --- |
| `backoff-design` amendment (over-budget wait) | source tree (clone) | **task** | better | The over-budget stop set the same sentinel as exhaustion and dropped the stated delay; the retry handler now returns the skipped wait and the caller logs it and names the state. Branch `intake/over-budget-wait-is-not-exhausted`, commit `cc20ac2`, 2 files; typecheck: error count unchanged from the pinned base (one pre-existing error at the retry callback signature); the integration suite needs a booted gateway and was not run. Patch beside [`the plan`](../handoffs/2026-09-02-portkey-gateway-source-tree-task.md); clone deleted. |
| the other 12 | tracklight, pumper (directions), else - | unapplied | - | tracklight is the strongest fleet seam in three rounds (self-hosted, holds provider keys, serves an operator dashboard, benchmarks a provider matrix); four proposals wait for ledger rows |

Shipped: 1, with its predicate.

## Directions (Phase 7.6) - the peer shape, second sighting

`tracklight/.ai/directions/2026-09-02-portkey-gateway-comparison.md` (`cf64295`): **32
points**, adopt 8 / adapt 9 / keep ours 11 / different forces 4; proposals
`browser-credential-boundary`, `retry-backoff`, `credential-vault`. Strongest keep-ours:
fail-closed judging - all samples unparseable is a hard error, never a phantom score.
`pumper/.ai/directions/2026-09-02-portkey-gateway-comparison.md` (`62c0336`): **13 points**,
adopt 2 / adapt 3 / keep ours 6 / different forces 2; proposal `multi-provider-gateway-plane`
(router-versus-candidate attribution for engine fallback). Strongest keep-ours and the
run's convergence: pumper's `capped_retry_sleep` independently reached the source's
hardest retry decision, so the fleet's own code is now the reference the tracklight
proposal cites. One seeded point corrected against the tree: pumper's retries default
off, the same as the source - two opposite-shaped systems, one default, one reason.
Top tests: a provider-boundary suite for tracklight (zero mock crates today); an
unhealthy-target matrix with the all-open assertion; a router-vs-routed fixture for pumper.

## Already covered (9), leads (7), untriaged (5)

Companion §8. Highest-value lead, costing no fetch: **the corpus disagrees with itself
three ways on guardrail fail direction** (`prompt-safety` always-closed;
`advisory-guard-fail-mode` per-guard default-open; `refusal-is-not-failure`
propagate-unless-opted-in), none citing the others. Return: a deepen pass that writes the
discriminator once and cites it from all three. Untriaged of note: a check declares which
lifecycle points it may run at (manifest `supportedHooks`); the cache key is the
provider-transformed body, not the caller's; cacheability as an enumerated per-endpoint
list.

## Reusable engineering seen

Companion §9: the pipeline integration suite with a mocked provider boundary and fluent
builders (26 named cases through the whole request path against a booted gateway); the
per-(provider, endpoint) framing table as data; the strictness switch as a request
property rather than a deployment property.
