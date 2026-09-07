---
source: aws-marketplace-ai-agent-learning-series-module-10
kind: vendor educational guide (long-form reference architecture wrapped in a marketplace tools surface)
url: https://aws.amazon.com/marketplace/build-learn/ai-agent-learning-series/agent-exposure-and-integration
title: "Module 10 - Agent exposure and integration"
author: vendor (uncredited solution architects)
words: 15572
extracted: 24
accepted: 2
declined: 0
leads: 4
already_covered: 6
untriaged: 12
applied: 2
shipped: 1
dispatched: 0
run_id: intake-aws-expose-0906
siblings: 0 at claim, 1 by Phase 7
---

# AWS Marketplace - Agent exposure and integration (Module 10)

## Class and expected yield, stated before the triage table

Not a class the reference names. It is a **vendor educational guide**: a
substantive 15,572-word reference architecture with a marketplace tools sales
surface bolted to both ends. The two halves have opposite reliability and were
routed per half, as the method requires of any hybrid.

The prediction from the class, written before extraction: the guide half would
behave like a *first-party practitioner account* (it states failure modes, which
a vendor **announcement** structurally does not - "teams often learn this from a
surprise invoice", "a bad match means a confident wrong answer"), and the tools
half would strip to nothing. Expected yield: **mostly catches**, because the
corpus is mature everywhere this guide goes, plus one or two real gaps
concentrated where the guide states a mechanism *with its forces* rather than a
rule, plus several dated facts needing a fetch.

That held almost exactly. 6 catches, 2 landings, 0 fetches spent - the corpus
carried every primary the guide pointed at, which is the signature the class
table gives for a source that corroborates corpus-internally.

The tools half (Kong, KrakenD, LaunchDarkly, Logz.io, Portkey AI, Tyk) produced
**zero candidates**. Every sentence in it is a proper noun plus a threshold, and
the thresholds are the guide's own - which is the honest half of the sales
surface and is why the guide's build-vs-buy line survived as a lead rather than
as nothing.

## Container check

`words: 15572` over ~98 KB of real prose, first screen was site chrome then
prose. Not a decoded container. Not a repository, so no Phase 2b clone and no
design read - this source *reports*, it is not a system.

## Conditions

0 siblings on the board at claim; 1 by Phase 7 (`intake-flatnotes-0906`, holding
`integration/markdown-vault` and `security/identity-and-access/authorization`).
That second subject was a live home for candidate #12 below, which is why #12 is
untriaged rather than verified. `check-bundles` was **red on arrival at Phase 7
from that sibling's two in-flight technique files** (`projection-covers-the-record`,
`unregistered-is-stronger-than-refused`, both existing without a golden-path
declaration). Named, not fixed, per the shared-checkout rule. Neither file is
this run's.

## Triage table

Read column: `real gap` / `partial` / `likely catch` / `thin`. G/R/C per v2.5.
Auto-accept at `GAIN - RISK >= 2` and `GAIN >= COST`.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | amendment | M | Price the false-hit tolerance against the residual | se/client-architecture/client-fetch-cache · `similarity-keyed-admission` | new-technique | real gap | 2/0/2 | **accept** |
| 2 | K | amendment | M | The first byte commits the verdict; the terminal event is the only channel left | se/llm-agent/orchestration/model-routing · `failover-horizon` | corrects-claim | real gap | 3/1/2 | **accept** |
| 3 | K | technique | M | Request rate is not a budget control when the metered unit is tokens | se/.../rate-limiting · `metered-step-selection` | none | likely catch | - | **catch** |
| 4 | K | technique | M | A resemblance hit can be wrong rather than merely old | se/.../client-fetch-cache · `similarity-keyed-admission` | none | likely catch | - | **catch** |
| 5 | K | technique | S | Hit rate is recall; the cache's danger is precision | se/.../client-fetch-cache · `similarity-keyed-admission` | none | likely catch | - | **catch** |
| 6 | K | technique | M | An attractive wrong entry is reinforced by the traffic it corrupts | se/.../client-fetch-cache · `similarity-keyed-admission` | none | likely catch | - | **catch** |
| 7 | K | technique | S | A truncation reason must be in the response contract | se/.../structured-output · `output-budget-signal`; `agent-chaining/stop-reason-ledgers` | none | likely catch | - | **catch** |
| 8 | K | technique | M | A deterministic rejection retried into the dead-letter queue looks like an infra fault | se/.../retry-backoff · `error-classification-for-retry` | none | likely catch | - | **catch** |
| 9 | K | technique | M | A quorum of independent occurrences before an entry becomes semantically matchable | se/.../client-fetch-cache · `similarity-keyed-admission` | new-technique | partial | - | untriaged |
| 10 | K | technique | M | A perimeter inspector reads a bounded prefix, and its oversize default is allow | se/.../prompt-safety | fills-stack-gap | real gap | - | untriaged |
| 11 | K | technique | M | A detector run over a mixed population is tuned down until inert | se/.../prompt-safety · `untrusted-span-fencing` | partial | partial | - | untriaged |
| 12 | K | technique | M | Never merge a server-assembled scope filter with a caller-supplied one | se/security/identity-and-access/authorization · `scope-design` | new-technique | real gap | - | untriaged (**sibling held the home all run**) |
| 13 | K | technique | M | Reject the field the caller may not set; an ignored probe is invisible | se/.../authorization | partial | partial | - | untriaged (same sibling) |
| 14 | K | technique | L | Tiered logging by content sensitivity: metadata / hashed / sampled | se/.../tracing; llm-obs | partial | partial | - | untriaged |
| 15 | K | technique | M | An unmarked fallback is a quality regression with excellent uptime numbers | se/.../optional-dependency-degradation; `model-routing` | partial | partial | - | untriaged |
| 16 | K | technique | M | Silent configuration divergence in a failover region beats absent configuration | se/.../model-routing · `failover-path-liveness` | partial | partial | - | untriaged |
| 17 | K | technique | S | Snapshot configuration at entry so one unit of work cannot span two configs | se/.../test-harness; `serving-process-topology` | partial | partial | - | untriaged |
| 18 | K | technique | M | Break the circuit per tenant per dependency, never globally | se/.../multi-provider-gateway-plane | partial | partial | - | untriaged |
| 19 | K | technique | M | A percentage rollout samples uniformly from non-uniform risk | se/.../adoption-measurement | partial | partial | - | untriaged |
| 20 | K | technique | S | Rollback latency, not blast radius, ranks rollout mechanisms | se/.../release-pipeline | partial | thin | - | untriaged |
| 21 | X | lead | - | The version pin that makes a shared library honest is what lets teams diverge | - | - | real gap | - | lead |
| 22 | X | lead | - | Build-vs-buy threshold: consuming teams exceed the people who understand the library | - | - | real gap | - | lead |
| 23 | X | lead | - | Observing the agent costs more than running it | - | - | partial | - | lead |
| 24 | X | lead | - | An immutable audit log against an erasure obligation is an architecture conflict | - | - | partial | - | lead |

`auto=2/0/0`, `fp=0`. No row was escalated: nothing here was a direction, a
taxonomy change, a law, or XL.

**Why 12 untriaged and not 12 declines.** None of these was looked at and
rejected. They cleared extraction, reached the table, and lost to two rows that
scored higher; several (#10, #12) read as real gaps and would likely land on a
run that is not competing with them. They carry their anchors so the next run
does not re-derive them. Filing them as declines would poison the decline ledger
that Phase 11 promotes rules from.

## The two landings

Both landings have the same shape, and it is the shape this run's **declared
focus (round 30) named in advance**: *a rule that is inapplicable rather than
false*. The focus said to hunt the unstated premise as a fifth Phase 6 move. Two
of two accepted rows came from it, and neither would have survived any of the
other four hunts - both read as "already covered" to a missing-stage,
enumeration, asymmetry or neighbour read, because in both cases the corpus
already owns the mechanism, states it better than the source does, and is wrong
only about what it is allowed to assume.

### Landing 1 - the tolerance is priced against a residual

`similarity-keyed-admission` is far ahead of the source on semantic caching:
it owns the false-hit failure ("a fluent, plausible response to a question
nobody asked"), the recall-versus-precision instrument trap, and the attractive
wrong entry that eviction reinforces. Candidates 4, 5 and 6 are catches against
it and the technique says each better than the guide does.

Its central trade is stated as: *an expensive, slow, approximate authority can
rationally buy a small false-hit rate; a cheap exact one has nothing to pay
with.* The unstated premise is that the authority's cost is a **given**. The
source's caching ladder says it is not - many authorities expensive enough to
justify a resemblance key also offer reuse of their own internal work on a
repeated prefix, at a fraction of the rate and with **no possibility of serving
a wrong answer**, because it makes no admission decision at all.

The technique's own closing section disclaims that tier explicitly ("Nothing
here governs caching *inside* the authority being called"), and the disclaimer
is correct. But the disclaimed tier removes cost from the same bill the
resemblance cache is paid out of, so the trade cannot be executed until it has
been exhausted. **The rule is not wrong; the number it asks you to weigh has
not been established yet.**

Corroborated corpus-internally rather than by fetch, which is the strongest
available form here: `model-routing/cache-continuity` already prices exactly
this tier (cache read ~0.1x base, write ~1.25x) and `prompt-assembly/
cache-breakpoint-allocation` already owns allocating its cut points. The corpus
holds both halves in two subjects and had never joined them - the same shape as
the 2026-08-31 `reliability-aggregation` landing.

Landed as an amendment, not a technique, per v2's boundary-or-mechanism rule:
the mechanism exists in the corpus already; what is added is a **precondition**
on a trade the technique owns. Every existing sentence in the file stays true,
which is the least-rewriting shape that still lands it (round 27's focus).

### Landing 2 - the first byte commits the verdict

`failover-horizon` owns the moment the first byte is released, in depth: it is
where substitution stops being free. It states two post-horizon options and
insists there is no third - *finish on the chosen candidate however badly it is
going, or abort with a stated, honest truncation.*

The same instant does a second thing the technique never mentions. On a
transport that frames its outcome ahead of its body, the response status is
written before the first content byte and cannot be revised. So the honest
abort **presumes a channel that can carry the statement**, and where the outcome
lives in the status alone there is no such channel: aborting is expressible only
as stopping, and stopping is indistinguishable from finishing. The rule is
inapplicable rather than false, and a layer that believes it has an honest abort
available has an option it does not have.

This also **bounds an enumeration**, which is the technique's own strongest
claim. Its unusable-success list is closed with "every form on that list is
detectable by shape", and a seventh form (well-formed but wrong) is added as the
one that escapes shape and needs agreement across repeated draws. A stream of
**prose** that ends early escapes both: it is not empty, there is no structure
whose closing bracket is missing, and a sentence that stops early is just a
shorter sentence. Nor does resampling help - the content is not wrong, it is
*incomplete*, and each draw would have to be complete to serve as the
comparison.

Its remedy is therefore the cheapest on the page rather than the dearest, and
that inverts the technique's usual trade: no held frame, no extra draw, no
scanner, only a fixed protocol cost paid once, before anyone knows it will be
needed. That is why the form is missing from a list organised by what a check
can *see* - nothing can see it, and nothing needs to, provided the contract was
written to say so.

## Apply

| Landing | Project | Mode | Verdict |
|---|---|---|---|
| Landing 2, `failover-horizon` amendment | `pof` | **code** | **better** |
| Landing 1, `similarity-keyed-admission` amendment | - | **unapplied** | - |

**Landing 2 shipped.** The seam is a cook-progress stream consumer whose reader
loop broke on stream end and did nothing: the status was 200, nothing threw, no
verdict was ever set, and the surface rendered "running" forever. The producer
can genuinely reach it - its generator returning without a terminal event falls
through to a clean close. Paired A/B on one vitest harness with one stubbed
stream: arm A called the completion handler **0 times** (fails), arm B **once
with a failed status** (passes). A control case with the terminal event present
returns success in both arms, which is what isolates the defect to the
missing-terminal case rather than to the harness. Two neighbouring suites - one
of which exercises the same hook with a never-settling fetch, and so would have
caught a branch that fires on a merely pending stream - pass in arm B: 13/13.
Typecheck and lint clean. `generalised=no`: the amendment applied at the
condition it was landed at.

**Landing 1 is unapplied, with the query, the population and the count stated**
per round 27's rule. Query
`cosineSimilarity|cosine_similarity|nearestNeighbo|semantic.cache` over
`*.ts,*.tsx,*.py,*.rs`; population 8 fleet projects; count **1 file**, in
`personas`. Reading it - which is the step the count cannot do for you - shows a
resemblance **matcher** that routes a step to a candidate and then still does
the work, not a cache that serves a stored answer in place of it. Under the
amendment's own terms no false-hit rate is being purchased there, so there is
nothing to price a residual against.

The broad form of that query (adding the bare word `embedding`) returned **136
files in `personas` alone**, and every one of the extra 135 was the word
appearing in an unrelated context. A run that had reported 136 as the population
would have manufactured a seam. Return condition: **when a fleet project builds
a cache that serves a stored answer on a resemblance match.**

## Catches

Six, and in five of them the corpus is not merely equal to the source but
strictly better - which is the predicted result for a mature corpus against a
vendor guide, and worth recording as calibration rather than as disappointment.

- **#3, tokens versus requests.** The guide's example (10 rps at 500 tokens
  against 2 rps at 100k tokens) is `metered-step-selection`'s divergence check
  worked once: *"ask how someone would cause the harm while keeping the metered
  step's count low."* The corpus gives the general audit and the rule that
  "every step is metered in its own units"; the guide gives one instance of it.
- **#4, #5, #6, the semantic cache.** All three are in
  `similarity-keyed-admission` already, and the corpus is ahead on each: it
  reaches the precision-versus-recall trap through the *negative set* the
  measurement needs, which the guide never mentions.
- **#7, the truncation reason.** `output-budget-signal` already treats a
  reported stop reason as authoritative and `agent-chaining/stop-reason-ledgers`
  owns the record.
- **#8, terminal-versus-transient at the queue boundary.**
  `error-classification-for-retry` already carries the four-class taxonomy and
  the rule that one outage must not be retried by one path and dead-lettered by
  another.

## Leads

- **#21 - the version pin that makes a shared library honest is what lets its
  consumers diverge.** The guide's line is that a shared library lets every team
  upgrade on their own schedule and the copies drift anyway, so three teams run
  three retry policies against one shared quota. That is a real tension between
  a stated corpus virtue (an explicit, reviewable version pin) and a
  fleet-level property (one shared downstream budget), and the corpus states
  only the first half. **Return when** a second source describes a shared
  constraint fragmented by per-consumer pinning, or when a fleet project grows a
  second consumer of one metered dependency.
- **#22 - build-vs-buy stated as a threshold on comprehension.** "This trade
  pays off when the number of consuming teams exceeds the number of people who
  understand the library." A portable, memorable form of a decision the corpus
  makes qualitatively. **Return when** a second independent source states a
  build-vs-buy threshold in a countable unit.
- **#23 - observing the agent costs more than running it.** ~40k tokens per turn
  is ~160 KB, three orders of magnitude above an ordinary API body, so a logging
  habit built on the smaller assumption fails on the larger. `llm-observability`
  is the home. **Return when** a fleet project's log spend is measurable, or a
  second source carries the arithmetic.
- **#24 - an immutable audit log against an erasure obligation is an
  architecture conflict, not a policy one.** **Return when** a fleet project
  carries both commitments.

## Untriaged, with anchors

Recorded so a later run does not re-derive them. **Nobody verified these** - they
reached the table and lost on score, and two of them (#12, #13) lost to a
sibling holding their only home for the whole run rather than on merit.

- **#9** - "Require a minimum number of independent occurrences before an entry
  becomes eligible for semantic matching, so a single crafted question cannot
  become an attractor." This is an **admission** remedy for the attractor
  problem, and `similarity-keyed-admission` currently offers only **exit**
  remedies ("a route from wrong to gone"). The asymmetry is real and this is the
  best of the untriaged rows.
- **#10** - "the default is the first 16 KB, raisable to 32, 48 or 64 KB ... For
  Application Load Balancer and AWS AppSync the limit is fixed at 8 KB"; "the
  oversize handling setting defaults to continuing evaluation with what was
  inspected, so the request is allowed rather than flagged."
- **#11** - "If you send the whole prompt as one undifferentiated block, the
  filter has to evaluate your own system instructions as potential attacks,
  which produces false positives and pushes teams to lower the threshold until
  the filter does nothing."
- **#12** - "Assemble the filter server side and never merge it with a
  caller-supplied filter. If callers can pass their own filter expressions, the
  combination logic becomes a security control, and combination logic is exactly
  where these bugs live."
- **#13** - "A request that contains a tenant field should be rejected rather
  than have the field ignored, because a rejection tells you someone is testing
  your boundary and silence does not."
- **#14** - the three sinks: metadata ~1 KB / hashed content ~3 KB / sampled
  full fidelity, each with its own retention and access policy.
- **#15** - "A gateway that silently swaps models on your behalf produces a
  quality regression with excellent uptime numbers, which is a harder problem to
  notice than an outage."
- **#16** - "Drift between the two is silent and behavioral: the same input is
  blocked in one region and allowed in the other." Plus: failing over into a
  region holding no reservation throttles under exactly the conditions that
  caused the failover.
- **#17** - "Evaluate flags once at the start of the request and carry the result
  through the turn, so a flag flipped mid-generation cannot produce a response
  assembled from two configurations."
- **#18** - "One tenant's misbehaving tool server should not open a circuit that
  stops every other tenant from using their own working tools."
- **#19** - "Percentage rollout answers how many callers get the new version. It
  does not answer which ones ... the callers most likely to surface a regression
  are rarely a random sample."
- **#20** - "the alias and weighted-alias mechanisms above are minutes, and a
  flag is one toggle."

## Fetches

**0 of 3.** Eleventh consecutive zero-fetch run for a source whose primaries the
corpus already carries. Reaching for the web here would have been a sign that
the claims had no home, and both landings were corroborated by opening corpus
files the source does not know exist.

## rescan_when

Not a repository, so no `rescan_when` is owed. The guide's dated facts (gateway
timeouts, body-inspection ceilings, payload caps) are the untriaged rows'
problem and would need a vendor-doc fetch to land at all; none was spent.
