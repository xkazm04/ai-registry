---
source: github:diegosouzapw/OmniRoute
kind: vendor repository (first-party OSS LLM gateway)
url: https://github.com/diegosouzapw/OmniRoute
title: OmniRoute
author: diegosouzapw
commit: b7a0c541394e89c32e30d3d9f1408c2388a89afe
words: 11691 README / ~34000 mined in-tree
extracted: 18
accepted: 4
declined: 0
leads: 2
already_covered: 3
untriaged: 11
applied: 4
shipped: 2
dispatched: 0
run_id: omniroute-0831
siblings: 3
---

# OmniRoute — an LLM gateway's operating documents

Operator-directed: software-engineering domain, topics around LLM wrapping and
middleware.

## The source

A large, seriously-run OSS LLM gateway: 13,026 files, ~50 CI quality gates, 4,207 unit
tests, and — the reason the run was worth it — an operating-document layer whose failure
modes are recorded as issue-numbered revisions. Class is **vendor repository**, and it
behaved exactly as the class entry predicts: the README is the ad (11,691 words of
feature list), and the yield is in `docs/architecture/`, `docs/security/`, the middleware
directory, and a 23-item Hard Rules contract in `AGENTS.md`.

Swept in the class's prescribed order — operating documents, the instrument, the
measurement, the types, the tests, README last. The densest artifacts were
`docs/architecture/admission-lanes.md` (two lane systems and why both exist),
`docs/architecture/ADAPTIVE_ROUTING.md` (a feedback-routing design with its own measured
overhead table and a section listing what it deliberately did NOT build),
`docs/architecture/RESILIENCE_GUIDE.md` (three resilience scopes kept separate),
`docs/security/GUARDRAILS.md`, and `src/shared/middleware/admissionBudget.ts` — a
70-line instrument whose header comment is a post-mortem.

Three sibling runs were live on the board at start (`genesis-agi`, `tanks-0831`,
`intake-archify`). `genesis-agi` held `llm-agent/prompt-and-context/*` and
`operations/service-operations/health-checks`; no overlap with this run's homes.

Zero of three fetches spent — the fourth consecutive practitioner-codebase run to spend
none. Everything corroborated in-tree or by training-data convergence.

## What was picked, and what it became

### 1. Denominate the bound in the scarce resource — ACCEPTED (technique)

`software-engineering/backend-platform/work-execution/admission-queue/techniques/resource-denominated-bounds.md`

**This is the run's best finding because the corpus was contradicted.**
`depth-bounds-and-shed` instructs that the depth bound be derived from entry cost "under
the pessimistic case where every entry is maximal". That is right about the arithmetic
and wrong about the unit: sizing a *count* against the maximal entry is precisely what
produced this source's pathological default cap of 1, which collapsed coding-agent
fan-out (bodies routinely >256 KB) to an effective concurrency of ~1 and returned 503
under ordinary load. Neither raising nor lowering the count is correct, because no single
count is.

The technique carries three parts the source paid for: denominate in the resource itself
and charge each item its real measured cost; refuse at the door an arrival larger than
the whole budget (it can never be admitted, so queueing it is a promise already broken —
the source spells this `413 body_exceeds_budget`); and derive the ceiling from the host's
own limits rather than shipping a constant, taking the tighter of the readable ceilings
and recording which one won. The source's own header notes that an earlier outage was "a
fixed-number version of this same mistake", which is the convergence that justified the
third part.

Closes with where a count is still the honest instrument — uniform cost, per-item
resources, or no cost figure available at the door.

### 2. An unattested origin key is a fairness key, never a capacity shard — ACCEPTED (correction)

Amendment inside `admission-queue/techniques/priority-and-fairness.md`.

The technique prescribes per-origin occupancy caps and treats origins as trustworthy and
enumerable — it never asks who mints the identity. This source shipped exactly that model
and then removed it (#10110): when the origin key is caller-supplied (a client-minted
session id, an unauthenticated header, an API key accepted before validation), per-origin
capacity is a multiplier — N invented identities buy N×K occupancy, every gauge reads
healthy, and the process-wide bound is whatever the caller decides. The repair separates
the two roles the key was serving at once: capacity is bounded globally, and identity
decides only the round-robin order among waiters, so minting a thousand identities buys a
thousand positions in the rotation and not one byte of capacity.

The amendment keeps the original instrument where it is safe (attested origins) and adds
the question that decides which case you are in — *what does it cost the caller to have a
second identity*, checked against the unauthenticated path. Plus the reason a late
repair does not work: admission runs before authentication by design, so the gate sees
the claim and never the verdict.

### 3. Speculative work is probed and skipped, never queued — ACCEPTED (technique)

`admission-queue/techniques/speculative-work-admission.md`

The subject assumes an arrival somebody is waiting for, for whom *queued* converts a
refusal into a slower success. Redundant work inverts that: the result arrives after the
moment that would have used it, and the capacity it consumed on promotion was taken from
work someone wanted, during exactly the congestion the bound exists to relieve. The
source gates each fan-out target with a zero-wait probe, releases the lease on admit (a
gate, not a reservation), prices the probe from the target's real body, and states in
prose that there is deliberately **no knob** to make fan-out wait — because wait knobs
previously produced the mass-502/504 class the lane was built to stop.

`depth-bounds-and-shed` covers the adjacent-but-different rule (a fan-out producer
applies backpressure at the fan-out point). This one is the gate-side treatment.

The technique gained a section from its own A/B — see below — on the two boundaries
that decide whether it pays.

### 4. Operational quality is not semantic quality — ACCEPTED (technique)

`software-engineering/llm-agent/orchestration/model-routing/techniques/quality-axis-separation.md`

`candidate-ranking` is thorough about *how* to rank (convex combination, guardrails
multiply, posterior with a prior, evidence decays) and silent about what "success" means.
The estimator it describes is fed by successes-over-attempts — a measurement of
transport — and this subject's own opening says the failure that matters is the mis-route
that "does not error, it produces a plausible answer". A layer scoring candidates on
transport is measuring the one axis where a good route and a bad one look identical.

The source separates the axes explicitly and states the rule that keeps them separate: a
200 is NOT semantic quality; the semantic score is `null` until an evaluator sets it and
never leaks into the operational score. The technique takes that, adds the unusable
successes (empty completion, output stopped at the cap, prose where structure was
required) to the *operational* axis — where they belong, because the request path detects
them without an evaluator — and closes the three holes through which a manufactured
number arrives: never default it, never let the operational writer touch it, always carry
its sample predicate. Plus the evaluator-as-sink half: typed outcome record separate from
the interface's notification bus, nothing judged synchronously, bounded buffer that drops
rather than backpressures.

Home was contested with `llm-observability/quality-scoring`; model-routing won because
the finding is about what feeds the *ranking*, which is this subject's ground.

## Applied (Phase 7.5) — 4 rows

| Technique | Project | Mode | Verdict |
| --- | --- | --- | --- |
| speculative-work-admission | goat | **code** | **better** — shipped |
| quality-axis-separation | gravity | simulation | better |
| resource-denominated-bounds | goat | simulation | unmeasurable |
| priority-and-fairness amendment | — | — | unapplied, no seam |

**The A/B that mattered.** `goat`'s prefetch subsystem is the cleanest possible instance
of speculative-work-admission — every arrival is speculative, and the project already
counts the exact waste the technique predicts (`unused` beside `hitRate`). The real
`PriorityQueue` was driven with an 86-arrival scroll session on a virtual clock, in three
arms, swept across the tiers its own `BandwidthDetector` models:

| Condition | Arm A (queue all) | Arm B1 (skip all) | Arm B2 (skip speculative) |
| --- | --- | --- | --- |
| 4g, capacity ~120 | 86 disp / 86 useful | 83 / 83, **hover 3/6** | 85 / 85, hover 6/6 |
| 3g, capacity ~30 | 52 disp / 18 useful / **34 wasted** | 30 / 30, **hover 0/6** | **30 / 30 / 0 wasted**, hover 6/6 |
| 2g, capacity ~10 | 17 / 5 / 12 wasted | 10 / 10, **hover 0/6** | 10 / 8 / 2, hover 4/6 |

Under congestion B2 wins on every axis simultaneously — more useful prefetches (30 vs 18)
for less total bandwidth (30 dispatches vs 52) — because the waiting line was actively
converting useful work into waste. Shipped to `goat` at `58453a3`, 43 lines across two
files, with the operator's explicit confirmation.

**The run's most valuable measurement was the B1/B2 discriminator, and it amended my own
technique.** Skipping indiscriminately is the simpler and more obvious implementation,
and it is the harmful one: 0 of 6 hover prefetches served at both congested tiers, and it
costs 3 of 6 even at 4g where it should do nothing. The technique's sentence about the
class of the arrival was a caveat before the measurement and is a boundary after it.
The second boundary the sweep produced: **below saturation the rule is a no-op**, so the
precondition is worth measuring before adopting — which is now a section in the file.

**A negative structural fact from `gravity`.** Its text/imaging routers are exemplary
fallback ladders (five named elimination reasons, a typed descent trail, rung and
transport reaching every surface) with **no quality term at all** — order comes from a
static posture×turn-class table. So the failure the technique prevents is structurally
unreachable there, and the interesting fact is that the *sink seam already exists* — the
descent trail is exactly the typed outcome record a quality tracker would attach to,
built for inspectability and feeding nothing, which is the state in which the shortcut is
cheapest to take. The simulation's decisive case came from the tree's own recorded
history: `app/api/frames/route.ts` documents that its first implementation used "nine
roles, nine canned compositions" and "produced exactly the deck it deserved" — output
that was fast, deterministic, schema-valid, and semantically worthless. Single-axis
scoring rates that **maximal**.

## Already covered — 3 catches

- **Success decays the failure count.** The source halves a model's failure count on a
  healthy response so a recovered model clears before its timer. `candidate-ranking`
  already states it, and states it better: "A success must not purge accumulated failure
  evidence. Decrement it."
- **Cold candidates score neutral, not zero.** The source blends toward 0.5 by
  `confidence = clamp01(samples/50)`. The corpus's version is stronger — draw from a
  posterior with a prior, so exploration is automatic and proportional to uncertainty
  rather than a linear ramp to a fixed sample count.
- **Quality de-preferences, never disables.** The source keeps hard exclusion with the
  breaker/quota/auth stack. `candidate-ranking`: "Ranking never overrides eligibility."

All three are the corpus being confirmed by an independent implementation, which is worth
recording even though nothing landed.

## Untriaged — 11, with anchors, nobody verified these

Extracted and mapped, never picked. Recorded so a later run does not re-derive them.

| Claim | Anchor |
| --- | --- |
| Guardrail chain is fail-open; a throwing guardrail is recorded and skipped, blocking is explicit (`block: true`) never accidental | `docs/security/GUARDRAILS.md` |
| Payload-mutating middleware defaults OFF because the operator owns the data; a regression test asserts both the definition default and behavioural pass-through | `AGENTS.md` Hard Rule #20 |
| Gate-exception allowlist entries must name consumer, rationale and a linked issue; malformed entries fail closed; exceptions cannot suppress a deleted test or an added `.skip` | `docs/architecture/QUALITY_GATES.md` |
| New gates ship advisory-then-blocking with a named calibration window and a retained artifact | `docs/architecture/QUALITY_GATES.md`, "Forgotten sibling tests" |
| Engine role is two orthogonal axes (lifecycle × selection); conflating "embedded service" and "routing backend" into one list is the named mistake | `docs/architecture/ROUTER_BACKENDS.md` |
| Terminal connection states (banned, expired, credits_exhausted) must never be overwritten by transient cooldown state | `docs/architecture/RESILIENCE_GUIDE.md` |
| Circuit-breaker trip codes are provider-level statuses only; account-level errors belong to cooldown, not the breaker | same |
| Soft session affinity vs durable exclusive lease with a generation fence — three related mechanisms kept deliberately separate | same |
| Correlation headers are never forwarded upstream; executors build upstream headers from scratch | same |
| Stream timing: first-forwarded-chunk latency is NOT token-level TTFT, and the doc says so rather than letting the name imply it | `docs/architecture/ADAPTIVE_ROUTING.md` §3b |
| Compression as an ordered multi-engine pipeline with command-class-aware filters that preserve failures, errors, changed files and the tail | `docs/compression/COMPRESSION_GUIDE.md` |

## Leads — 2

- **A design document that enumerates what it deliberately did NOT build, with reasons.**
  `ADAPTIVE_ROUTING.md` §7.10 lists five proposed features and why each was rejected —
  four because they already existed elsewhere in the tree. This is a documentation shape
  the registry has no technique for, and it is the artifact that makes "we audited before
  building" checkable rather than claimed. *Return when a second independent source shows
  the same section shape* — one instance is a habit, not a practice.
- **The measured-overhead table that separates the baseline from the delta.**
  Same document publishes µs/op for scoring-only, scoring+event, and scoring+event+export,
  and explicitly retracts its own earlier aggregate figure as not separating the two.
  Relevant to `count-carries-predicate` at the benchmark layer. *Return when a project
  here publishes a hot-path overhead number, or when a second source shows the
  baseline-separation discipline.*

## Method notes

- The `--min-words` floor said nothing useful again: the landing page is 11,691 words and
  is the least reliable surface in the tree; the single densest artifact was a 70-line
  source file. Fifth consecutive run to say this.
- The clone reported a Windows long-path checkout warning and every file showed as `D` in
  `git status`; the tree was nevertheless fully materialised (13,026 files). Worth
  knowing so a future run does not abandon a good clone on a cosmetic error.
- Two application files were first written with `stack: typescript`, which this bundle
  does not declare. Both projects are Next.js and `next` is declared. Caught by the gate,
  not by review.
