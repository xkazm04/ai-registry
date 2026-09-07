---
source: openclaude
kind: repository
url: https://github.com/Gitlawb/openclaude
title: "OpenClaude — runs anywhere. uses anything"
author: Gitlawb
words: 3093 (landing page) / ~29,800 (in-tree operating documents)
commit: 0abfca30e5a2945678415f5328691584387720fb
extracted: 14
accepted: 2
declined: 0
untriaged: 8
already_covered: 4
leads: 2
dispatched: 0
applied: 2
shipped: 1
run_id: 2026-09-06-openclaude
siblings: 0 at claim; 5 live by Phase 9 (praisonai, sofka, harbor, acestep, +1)
rescan_when: the descriptor migration's remaining compatibility bridges shrink — `src/integrations/compatibility.ts`, `profileResolver.ts` and `utils/providerFlag.ts` are named as temporary and their removal is the event that changes the design record; or `reasoning_object` / `thinking_type` leave the "reserved, not request-plumbed" state in `descriptors.ts`; or 8 weeks elapse (2026-11-01)
---

# OpenClaude — a multi-provider agent CLI, read as a system

## Class and expected yield

**Vendor repository / practitioner codebase in repository form.** Mined from a
clone at `0abfca30`, never from the ingest: `research-ingest` returned the
rendered landing page (3,093 words), which is the README plus site chrome. The
tree carries ~29,800 words of operating documents, an order of magnitude more,
and they are where the yield was.

Swept in yield order per Phase 2b: the operating documents
(`docs/architecture/integrations.md`, `docs/integrations/**`, `docs/hook-chains.md`,
`docs/smart-routing.md`, `docs/agent-routing.md`, `AGENTS.md`, `PLAYBOOK.md`),
the instruments (`scripts/verify-no-phone-home.ts`, `stubMarkerGuard.ts`,
`feature-flags-source-guard.test.ts`, `no-ant-employee-gates.test.ts`,
`no-raw-abort-signal-timeout.test.ts`), the types (`src/integrations/descriptors.ts`),
the tests (726 `*.test.ts*` files), and the README last.

Expected yield for the class, said before the table: **two to four candidates
that survive, mostly at technique altitude, with the architecture arriving as
design rather than as claims.** Landed two. That is on calibration.

**Self-catch, in the source's own tree.** `docs/architecture/integrations.md`
closes by pointing at `plan/phase-3d-final-audit.md`. There is no `plan/`
directory at this commit. The document that defines "Pitfall 14: using stale
repo paths in docs" commits Pitfall 14 in its own last line. Recorded because it
is the cheapest possible demonstration that a docs-hygiene rule needs an
instrument and not a checklist — which is the same shape as the finding that
landed.

## Design record (Phase 2d)

Grouped by system, because the routing count is per system. Each entry carries
the round-26 falsifier test: *what would this tree have to show for the decision
to be wrong, and does it show it?*

### System A — the descriptor-era provider integration layer

**A1 — `transportConfig.kind` is the routing contract; `category` is display only.**
- *forces*: the display taxonomy (`local` / `hosted` / `aggregating`) correlates
  strongly with the transport family, which is exactly what makes it a tempting
  dispatch key; but grouping labels change for UI reasons and transport families
  change for protocol reasons, at different rates and by different people.
- *buys*: a display relabel can never re-route a request.
- *rejects*: one field serving both grouping and dispatch — named as removed
  fields `targetVendorId`, `isOpenAICompatible`, gateway `classification`.
- *where*: `docs/architecture/integrations.md` § Gateway routing contract;
  `docs/integrations/common-pitfalls.md` Pitfalls 2 and 3;
  `src/integrations/descriptors.ts:288,299`.
- *stage*: route resolution, before transport selection.
- *falsifier*: **passes.** The tree shows the failure it is defending against —
  the conflated fields existed and were removed, and the pitfall list records the
  mistake as recurring rather than hypothetical.
- *corpus*: NONE. Nearest is `se/backend-platform/resilience/multi-provider-gateway-plane`,
  which models the router/candidate structure and per-provider framing but not
  the discriminator-versus-label split. HOME IF NEW: that subject.

**A2 — a capability flag does not authorize a request mutation.**
- *forces*: catalogs are large and partly third-party; aggregating gateways
  multiplex models that accept different parameters, so a provider-wide
  inference sends fields some upstream rejects.
- *buys*: unknown models never receive new request fields; a catalog can be
  annotated `supportsReasoning` ahead of any audit without that annotation
  changing a single request.
- *rejects*: treating descriptive capability as a control surface.
- *where*: `docs/integrations/reasoning-effort.md`; `descriptors.ts:52-85`.
- *stage*: request shaping.
- *falsifier*: **passes, unusually well.** `ReasoningWireFormat` deliberately
  holds two values (`reasoning_object`, `thinking_type`) the serializer does not
  implement, documented as reserved — a type that admits states the runtime
  refuses is a costly, checkable commitment, not a slogan.
- *corpus*: MODELLED, cross-bundle. `game-production/production-governance/generative-provider-auditing/capability-is-not-registry-membership`
  states the same forces for asset dispatch ("the provider's own documentation is
  a capability claim made by the party selling the capability"). The
  software-engineering side holds `agent-cli-transport/dated-capability-matrix`.
  Catch — with the discriminator noted below.

**A3 — documented exceptions carry a KIND, and cleanup must preserve the distinction.**
- *forces*: a long exception list reads as debt and invites blanket cleanup, but
  three different things live in it — permanent protocol divergence, temporary
  env/config bridge, hybrid transport shim — and each has a different removal
  criterion.
- *buys*: a future cleanup can be scoped without deleting correct behaviour.
- *rejects*: one undifferentiated "known exceptions" list.
- *where*: `docs/architecture/integrations.md` §§ Known exceptions, Follow-on
  guidance ("do not remove a documented exception just because it looks
  repetitive; remove it only when equivalent behavior is proven by tests").
- *stage*: architecture maintenance.
- *falsifier*: **fails.** The tree states the rule but shows no instance of the
  harm — no record of an exception wrongly removed, and nothing mechanical
  distinguishes the kinds; they are distinguished in prose only. Under the
  declared focus this is a lead, whatever its forces say.
- *corpus*: NONE. HOME IF NEW: `multi-provider-gateway-plane`.

**A4 — descriptors are data; registration is loader-owned and generated.**
- *corpus*: `engineering-process/build-and-release/codegen` (`generated-file-hygiene`,
  `trigger-wiring`). Catch.

### System B — fork-maintenance guards

**B1 — the de-telemetry claim is verified against the BUILD ARTIFACT.**
`scripts/verify-no-phone-home.ts` greps `dist/cli.mjs`, not `src/`, for eleven
banned patterns, and refuses to run if the bundle is absent.
- *falsifier*: passes — the check is structured so a green source tree cannot
  produce a green result on its own.
- *corpus*: MODELLED by the law `gate-sees-target`, plus
  `security/code-provenance/supply-chain/verification-scope`. Catch.

**B2 — a build flag can be enabled while the source its capability needs is absent,
and the toolchain makes that configuration build successfully.**
- *forces*: this is an open fork assembled from a partial mirror of an upstream
  tree. Which files arrive is not this repository's decision, so a flag is a
  *claim* about the source rather than a selector over it. The bundler's
  missing-module fallback substitutes a stub that exports only `default` — the
  build is green, startup is green, and the first *named* import through it
  throws at runtime.
- *buys*: with the guard, failure at the moment the mistake is made.
- *rejects*: trusting the bundler's fallback.
- *where*: `scripts/feature-flags-source-guard.test.ts` (regression guard for
  their issue #856, `fetchMcpSkillsForClient is not a function`),
  `scripts/stubMarkerGuard.ts` (marker canonicalised on the path from `src/`
  onward, explicitly because a basename key would let one stub mask another),
  `scripts/missing-module-stub.test.ts`.
- *stage*: build.
- *falsifier*: **passes, strongest in the tree.** A named issue, a runtime error
  string, and two instruments written after the fact.
- *corpus*: MODELLED and DENIED by
  `engineering-process/build-and-release/build-economics/capability-feature-gating`,
  whose rule 1 states "there is no flag whose absence breaks the default build"
  and whose rule 4 designs the gap only for the flag-**off** direction. **Landed
  as an amendment.**

**B3 / B4 — removed-surface guards keyed to removed files as well as identifiers;
a banned API enforced by a source-scanning test with a doc-comment exemption.**
`no-ant-employee-gates.test.ts` carries both `BANNED_PATTERNS` and `REMOVED_FILES`;
`no-raw-abort-signal-timeout.test.ts` exempts comment lines so the rule can be
documented in the code it forbids.
- *corpus*: near-catch against `supply-chain/vendored-fork-ledger` and the
  quality-gates chokepoint family. Untriaged, anchors recorded.

### System C — routing

**C1/C2 — when no caller can assert a class, infer it and make the error asymmetric.**
- *forces*: the caller is a person at a terminal. There is one call site serving
  every class of work, and the only party who knows the class cannot be obliged
  to declare it.
- *buys*: the failure mode is a missed saving, never a degraded answer on a turn
  the user cared about. The decision is taken once per turn and pinned across
  the turn's tool calls so it cannot flap; a simple-routed turn that errors
  retries once on strong, with aborts and auth/bad-request excluded.
- *rejects*: routing everything to one tier, and equally, inferring and then
  claiming accuracy.
- *where*: `docs/smart-routing.md` — "when in doubt it routes to the strong
  model, so the failure mode is 'no savings on a turn that could have been
  cheap,' never a silently degraded answer on a turn you cared about."
- *stage*: turn entry, before the tool loop.
- *falsifier*: **passes.** The document states its classifier is "a fast
  heuristic, not a perfect judge" and that it does not read the provider's
  pricing, so its own savings numbers are labelled reference-pricing estimates.
  A tree defending a wrong version of this decision would claim accuracy.
- *corpus*: MODELLED and DENIED by
  `se/llm-agent/orchestration/model-routing/turn-classification`, whose § "The
  caller asserts the class" rejects content inference outright and whose rule
  "an unclassified call fails loudly" presumes a call site. **Landed as an
  amendment.**

**C3 — a cost router that cannot read real prices labels its savings as estimates.**
- *corpus*: `llm-observability/economics-and-governance/llm-price-book-operations`
  says it better and in more detail — `price-provenance-and-staleness`, and
  `embedded-seed-fallback` § "When not to use it" ("wrong-and-plausible is the
  one outcome worse than empty"). Catch.

### System D — hook chains

**D1–D3 — an event-driven recovery mesh, disabled by default behind three
independent gates (build feature, env var, config `enabled`), with recursion
bounded three ways (depth guard, per-rule cooldown, action dedup window) and
every unavailability rendered as a structured skip reason rather than an error.**
- *falsifier*: partial — the safety properties are enumerated in documentation;
  the tree shows the guards but no incident that motivated the depth cap.
- *corpus*: `backend-platform/resilience/self-healing` and `retry-backoff`
  (breaker state machine, budgets). Catch on the bounding; the "safe no-op with
  a structured reason" half is untriaged below.

## Routing count (Phase 2d) — and the decision

Counted both clauses before deciding, per v2.2.

- **Per system, `corpus: NONE`:** System A = 2 (A1, A3) · System B = 0 · System C
  = 0 · System D = 0. No system reaches three.
- **Across systems, sharing one HOME IF NEW:** A1 and A3 both point at
  `multi-provider-gateway-plane` = 2. Does not reach three.

**Neither clause fires → stayed in intake, no forge handoff, no XL spec.** Worth
saying plainly: this is a large system (3,446 files, ~50 `src/` subsystems) and
the naive read of v2 would hand it off on size. Size is not the trigger; unmodelled
load-bearing decisions are, and this corpus already models most of what this tree
decided. The two that it does not are a pair, not a subject.

## Triage table (Phase 5, v2.5 — scored, not asked)

`G/R/C` = gain / risk / cost. Auto-accept at `G−R ≥ 2` and `G ≥ C`.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | amendment | M | No call site to ask: routing when the caller is a person | model-routing/turn-classification | new-technique (boundary) | real gap | 3/0/2 | **accept** |
| 2 | K | amendment | M | Flag and gated code with different owners | build-economics/capability-feature-gating | new-technique (boundary) | real gap | 2/0/2 | **accept** |
| 3 | K | technique | M | A display label must never be the dispatch discriminator | multi-provider-gateway-plane | new-technique | partial | 2/1/2 | untriaged |
| 4 | K | technique | M | Exceptions carry a kind; cleanup preserves it | multi-provider-gateway-plane | new-technique | partial | 1/1/2 | untriaged |
| 5 | K | catch | S | Capability is not a control surface | generative-provider-auditing | none | likely catch | — | already covered |
| 6 | K | catch | S | Verify the claim against the shipped artifact | law `gate-sees-target`, supply-chain/verification-scope | none | likely catch | — | already covered |
| 7 | K | catch | S | Estimated savings must declare their basis | llm-price-book-operations | resets-clock | likely catch | — | already covered |
| 8 | K | catch | S | Descriptors are data, registration is generated | codegen | none | likely catch | — | already covered |
| 9 | K | untriaged | S | Structured skip reason as the unavailable-action shape | self-healing | new-technique | partial | — | untriaged |
| 10 | K | untriaged | S | Removed-surface guard keyed to files as well as identifiers | supply-chain/vendored-fork-ledger | new-technique | partial | — | untriaged |
| 11 | K | untriaged | S | Banned-API test with a documentation-comment exemption | quality-gates | new-technique | thin | — | untriaged |
| 12 | K | untriaged | S | Marker canonicalisation: a basename key lets one stub mask another | build-economics | new-technique | partial | — | untriaged |
| 13 | T | lead | M | Reserved-but-unplumbed enum values as a checkable commitment | — | new-technique | partial | — | lead |
| 14 | T | lead | S | Docs-hygiene rules need an instrument (the tree's own Pitfall 14 self-violation) | docs-sync | none | thin | — | lead |

**Row 3 is the one worth explaining, because it was accepted on gain and rejected
on placement.** The finding is real and its falsifier passes. But its two
candidate homes are both wrong in the same way: `multi-provider-gateway-plane`
scopes itself to "a process fronting several upstreams **for callers you do not
control**", and this is a single-user client whose caller is its own operator;
`agent-cli-transport` is about *consuming* agent CLIs as transports, not about
being one. A contested home is `+1` risk and the row falls below the bar. That is
the reject-biased gate behaving as designed — the row is banked with its anchors
and costs one re-read to recover, where a mis-homed technique would cost a
migration. **Rows 3 and 4 together are the return condition for a future
`client-side-provider-selection` subject**, which is the shape both of them
actually want and which neither alone justifies.

**Promoting question executed on every `partial` row** (rows 3, 4, 9, 10, 12):
each got one file read against the technique its prior art names. Rows 3 and 4
were promoted from `likely catch` to `partial` by that read (the gateway-plane
golden path's boundary statement is what disqualified the home); rows 9, 10 and
12 stayed `partial` and are banked. No row was promoted to `real gap` by the
promoting question this run.

**`fp = 0`** — neither accepted row died at Phase 6.

## What landed

**1. `turn-classification` — new section "When there is no call site to ask".**
The technique's § "The caller asserts the class" rejects content inference for
three good reasons, and its rule "an unclassified call fails loudly" presumes a
bug at a call site. An interactive client has one call site, serving every class,
and a human caller who will not annotate turns — so the absence of a class is the
normal condition, not a bug. The amendment does not weaken the rule; it states
the lane the rule does not reach, and what makes inference acceptable there:
abstain toward the expensive tier and publish the direction, pin the decision for
the whole turn so it cannot flap across the turn's tool calls, scope a retry to
failures a different tier could fix, and record that the class was inferred
rather than asserted. `use_when` extended by two lanes.

**2. `capability-feature-gating` — new section "When the flag and the code it
gates have different owners".** Rules 1 and 4 both assume the flag and the code
it admits are co-owned, so that "the flag is on" and "the capability is present"
are one statement. Under a partial mirror they are two, and the resolver's
missing-module stub makes the broken configuration build green and fail at
runtime through a named import. Two obligations restore the identity: assert the
flag's source precondition where the flag is set, and mark substituted
placeholders so a post-build step can fail on any that reached the artifact
(keyed on a path from the source root, because a basename key lets one stub mask
another). `use_when` extended by two lanes.

## Leads

- **Reserved-but-unplumbed enum values as a checkable commitment.** `ReasoningWireFormat`
  admits `reasoning_object` and `thinking_type` while the serializer implements
  neither, documented as reserved. This is a deliberate, costly design move —
  the type is wider than the runtime and the gap is the documentation — and it
  may be a real technique about publishing intent in a type system. *Return when*
  a second independent source uses the same device, or when one of the two
  formats gets plumbed and the tree shows what the reservation bought.
- **A docs-hygiene rule needs an instrument.** The source's own pitfall list
  names "using stale repo paths in docs" as Pitfall 14 and then violates it in
  the architecture note's closing line. *Return when* a connected project grows a
  docs-path checker, at which point this is an application against
  `codebase-stewardship/docs-sync` rather than a lead.

## Cross-bundle discriminator (recorded, not linked)

`game-production` holds `capability-is-not-registry-membership`; the
software-engineering side reaches the same rule for request shaping via
`agent-cli-transport/dated-capability-matrix`. The two are the same idea on
opposite sides of a boundary and the bundles may not link. The discriminator a
reader needs: **is the thing being authorized a *dispatch* (may this provider
serve this kind of work at all) or a *request field* (may this parameter be added
to this call)?** The first is registry membership and is decided per provider;
the second is a control surface and is decided per exact route-and-model, because
one model can accept a parameter from its vendor and reject it through a gateway.

## Parallelism

0 siblings on the board at claim; 5 live by Phase 9. None held any subject this
run touched. One collision did occur and it was not on the board: a sibling
session in the `personas` checkout committed while this run's cross-repo change
was staged, and swept this run's `package.json` wiring and `.ai/applied.jsonl`
row into its own commit (`6c67179b8`). The content is correct and present in
`HEAD`; history was not rewritten to reclaim it. **The board covers registry
subjects and does not cover a shared consumer checkout** — worth a method note.

`check-bundles.mjs` was red at Phase 9 on two files belonging to live siblings
(`conformance-checking` applications with unknown stacks, a `process` application
carrying `verified_against`). Neither is this run's; the index and catalog were
therefore **not** regenerated, per the rule against regenerating over content you
do not own.
