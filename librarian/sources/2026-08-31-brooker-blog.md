---
source: brooker.co.za/blog
kind: reference-index (single-author archive)
url: https://brooker.co.za/blog/
title: Marc's Blog
author: Marc Brooker (AWS — EC2, EBS, Lambda, Aurora DSQL; now agentic AI safety and policy)
words: 1685 (index page) / ~14,000 across the 16 references read
refs_found: 163
refs_distinct: 163
refs_ranked: 33
refs_read: 16
waves: 2
refs_untriaged: 17
fetches: 24
extracted: 33
accepted: 8
declined: 0
leads: 9
already_covered: 8
untriaged: 17
dispatched: 0
applied: 8
shipped: 0
run_id: brooker-2026-08-31
siblings: 5
---

# brooker.co.za — a single-author archive mined in two waves

Operator instruction: two waves, 2025 first, 2026 second. The archive holds
**163 posts across 2012–2026**; the operator's two years are **33** of them
(18 in 2025, 15 in 2026), and this run read **16** — a read fraction of 48% of
the ranked set, against the ~1.5% sample the reference-wave lane exists to end.

## The class reading, and the one that mattered more

The index is a **reference index** by the ratio test — 1,685 words against 163
outbound links, most of them link text. But it inverts the lane's usual
economics in one specific way that must be said before any yield is reported:
**every reference shares one author.** The lane's strongest triage signal —
within-index convergence deduped by *author* — is structurally unavailable
here. Every convergence in this run is n=1, and the references can originate
freely while authorizing almost nothing on their own. What actually authorized
the landings was corpus-internal evidence, training-data convergence on
textbook results, and in two cases a primary the post pointed at.

The second reading was the more useful one, and it was available before a
fetch: **most of this blog sits below our construction frontier**
([[../domains/software-engineering]] § 2026-08-31). The map said so bluntly —
`fair queuing`, `uuid`, `microvm`, `overload`, `utilization`, `best of n` all
returned zero prior art across 341 subjects in 8 bundles, and `strong
consistency` returned 12 hits that were all slug collisions. The DSQL,
SSD-database, UUIDv7, Firecracker and Fekete's-anomaly posts were predicted to
return no home and were not read. **That prediction was correct and is a third
sighting of the frontier.**

## The correction that governs the whole run: three of those empties were lies

`research-map` reported "the corpus has never heard of this" for `fair
queuing`, `utilization` and `queueing theory`. All three were false, and the
two ways they were false are different and both worth carrying forward:

- **Wrong slug.** `backend-platform/resilience/scale-investment-timing/techniques/ceiling-as-deadline-not-trigger.md`
  already owns open-vs-closed arrivals, the reciprocal-of-unused-fraction
  curve, and the 70–90% knee band. No queueing term reaches a subject whose
  slug is about *investment timing*.
- **Wrong layer.** `admission-queue/applications/go--priority-and-fairness.md`
  already documents shuffle sharding, a hand of 6 dealt from 64–128 queues, a
  rotating offset "explicitly to de-bias flows with overlapping hands", and
  head-of-line blocking with its metric name. **Applications are not what
  `research-map` ranks**, so the corpus had written the material and never
  lifted it to the technique layer, and the instrument cannot see that state.

Both were caught by workers reading files rather than by the map. A near-empty
from this instrument is not evidence of a hole; twice in one run it was
evidence of something we had already written and forgotten.

## What the source is actually good for

Brooker writes **decompositions**, and a decomposition is a probe. Seven of
eight wave-1 lanes and three of four wave-2 lanes landed their best finding on
a sentence where one of our own forged documents declares itself complete:
"three policies", "three ways", "two answers", "two kinds and only two", "per
category, not per site", "not an age cutoff". The enumeration hunt was the
highest-yield instrument in this run by a wide margin.

The corollary is that his *assertions* landed almost nothing. Four of sixteen
lanes found the stated class wrong — position essay, vendor product paragraph,
teaching relay, 74-word aphorism — and those four produced the run's `nothing`
returns.

## Accepted — 8 landings

Five are **corrections to claims the corpus currently states wrongly**, three
of them against content landed by sibling runs *the same day*. That is not a
criticism of those runs; it is the method's "a contradicted claim is the best
case" working, and it only surfaced because a broad read forced files open that
nobody had reason to reopen.

| # | Landing | Target | Shape |
| --- | --- | --- | --- |
| 1 | modelled-vs-measured, and the independence assumption | `eval-harness/techniques/reliability-aggregation.md` | correction |
| 2 | capacity vs share under a mintable key | `admission-queue/techniques/priority-and-fairness.md` | correction |
| 3 | absorbability depends on arrival correlation | `error-handling/techniques/taxonomy-design.md` | amendment |
| 4 | the in-flight reader no guard can see | `versioning-snapshots/techniques/retention-and-pruning.md` | amendment |
| 5 | partitioning machines ≠ partitioning queues | `runner-fleet/techniques/capability-typed-queues.md` | correction |
| 6 | **`queue-cardinality`** — how many lines, precommitment as discriminator | `admission-queue/` (new technique + golden path) | technique |
| 7 | Little's Law as a sizing use, + the inspection paradox | `admission-queue/techniques/wait-telemetry.md` | amendment |
| 8 | admission as the **fourth** cache policy | `client-fetch-cache/client-fetch-cache.md` | amendment |

**#1 needed no source at all.** The re-read produced it: `reliability-aggregation`
opens by computing any-of-3 ≈ 96% and all-of-3 ≈ 30% from a per-trial rate of
2/3, and its own later section forbids exactly that — "a harness that produces
one has substituted a model for a measurement." Of three trials that actually
ran with two successes, observed any-of-3 is 1.00 and observed all-of-3 is 0.00.
Three distinct objects were wearing two names across the technique and its
application. The fix names the model, states the independence assumption the
compounding rests on, and reads `count-carries-predicate` strictly: the
predicate of a modelled number includes the model.

**#2** — "gains a thousand positions in the rotation and not one byte of
additional capacity … takes nothing from anyone else." The first clause is
right about occupancy; the second is false for throughput share, which a
thousand identities take at ~1000/(1000+M) from exactly the honest callers the
sentence says lose nothing. The amendment names the currency each mechanism
degrades in, and that only the global bound never degrades.

**#3** — corroborated by a **primary** (the Cloudflare 18 Nov 2025 postmortem)
rather than by the essay that pointed at it: a preallocation cap of 200 against
~60 in use, hit by a fleet-broadcast artifact, panicking rather than absorbing.
Same category the technique names as canonically never-absorbable, opposite
correct answer, and the discriminator is arrival correlation.

**#6** is the run's one new technique and **two lanes converged on it** —
one from the precommitment/head-of-line argument, one from SFQ's stateless
bucketing — plus the corpus-internal evidence above. `admission-queue` had nine
techniques and every one governed policy *inside* one line.

## Already covered — 8 catches

`version-identity` owns the version-authority coordination point ·
`cache-breakpoint-allocation` already *is* the temporal-spatial hypothesis,
correct because a prompt prefix cache is the append-ordered case where the
collapse condition holds · `unaided-baseline-screening` states the
unit-under-test question more strongly than the source ·
`transactions-and-units-of-work` is ahead on read-modify-write ·
`hitl-approval`'s golden path opens with the Sorcerer's-Apprentice thesis and
attaches the mechanism · `machine-paced-delivery` states the verifier thesis
with three named consequences · `assertion-vs-judgment` owns the
spec-vs-oracle split with a forcing question · `storm-control` owns retry
amplification completely.

Two of these are worth more than a catch normally is. **The corpus refutes the
"Agentic Software Development Hypothesis" empirically**: `verifier-coverage-review-agenda`
records a run where a deterministic oracle *was* available for all 179 passing
items — a type check — and the work was trivially *green*, not trivially
*done*. And **our agent-safety doctrine is ahead of a domain expert's published
stance**: four separate techniques already say a gate the gated party can open
is a decoration.

## Leads — 9

1. **`triage-queues`' fusion doctrine states no precondition** — it inherits
   the supermarket's fungibility assumption. Return when a multi-operator
   triage surface shows the cursor's first item unactionable by its holder.
2. **Configuration currency is not an invariant** — the corpus has boot-time
   validation and build-time validation, and no third moment for config that
   arrives *while running*. Return with a second sighting.
3. **`deterministic-backbone` vs a model-generated rule base** — is the rule
   base derived out of band and frozen, or per-response? That fact decides
   whether it is an amendment or a rejection.
4. **The verification/selection cost inversion, at law altitude.** *When the
   cost of verifying a result falls faster than the cost of choosing which
   result is worth verifying, the volume of verified results rises and the
   information per result falls.* One sighting in `skills/`, not in
   `knowledge/`. Return on a second independent run.
5. **Timeout choice as the retry multiplier's input** — `backoff-design` owns
   the delay *between* attempts and nothing owns the deadline *on* an attempt.
   A timeout at p50 converts half of all requests into two.
6. **Queue-entry expiry is not in the exit enumeration** — the golden path's
   state table lists promotion, cancellation, shed and drain, and every one
   requires someone to *act*. There is no exit for "the caller's deadline
   passed while this sat in line."
7. **`oracle-frozen-during-repair` enumerates only oracle-side edits** — the
   symmetric code-side route (satisfy a frozen check by narrowing the code path
   to the tested input) is absent, and a corpus-wide grep for reward-hacking
   vocabulary returns zero files.
8. **The `plan-review` / `unattended-mode` join** — `plan-review` sizes plans
   for a reader who will not be there; `unattended-mode` bounds consequences
   without bounding underspecification. Nobody owns what an agent does when it
   hits an underspecified point with no human reachable.
9. **MTTR has no home** — `grep -rniE "MTTR|mean time to recover"` returns zero
   across `knowledge/`. Incident *duration* measurement is an XL gap; one post
   cannot authorize a subject.

## Untriaged — 17 references, ranked and unread

Nobody looked at these. They are recorded so the next pass is a diff rather
than a re-derivation. **Not declines.**

**2025 (10 unread of 18):** `uuidv7` · `database-for-ssd` · `firecracker` ·
`dynamo-dynamodb-dsql` · `decomposing` · `thinking-dsql` · `feketes` ·
`natural-language` · `hotos` · `career`. The first seven are below the
construction frontier and were deliberately not read; `natural-language` and
`hotos` are genuine unread candidates, `hotos` being a paper aggregator whose
references are its yield.

**2026 (7 unread of 15):** `dsql-paper` (below the frontier) ·
`whats-easy-whats-hard` · `be-right` · `you-are-here` · `ic-junior` ·
`ic-leadership` · `my-blog-and-ai`. **`my-blog-and-ai` is the one worth a slot
next time** — it is an author's stated disclosure policy for machine-assisted
writing, and `machine-authored-documentation` was forged the same day this run
ran; it was held by a sibling at claim time.

**The reference that should have had a slot and did not:** *Barbarians at the
Gate: How AI is Upending Systems Research* (Cheng, Liu, Pan et al.). The
`barbarians` post is commentary quoting it; the paper is a **paper** and can
authorize what the post cannot. Its worker recommended promoting it over its
own reference.

## The boundary finding — what this curator included and excluded

A bibliography is a stated opinion about a field's edge, and this one is a
career's worth of it. The archive's centre of mass is **queueing, overload,
formal methods and storage internals**, and its 2026 output has migrated almost
entirely to **agentic development and agent safety** without carrying the
measurement discipline of the earlier work with it: the systems posts publish
simulation protocols and cite primaries, and the agent posts are aphorisms,
analogies and product paragraphs. That divergence is the boundary finding, and
it converges with a boundary we drew — this registry treats evals as
measurement doctrine, and the source's own field has not yet.

## Method notes for the next pass over this archive

- **Rank by word count before spending a fetch.** The 74-word aphorism and the
  ~500-word product aside were both `nothing`; the 805-word talk write-up and
  the 613-word queueing post were both strong. Length does not predict yield,
  but *aphorism-vs-account* does, and word count discriminates them for free.
- **Title-level epistemics keywords are non-evidence.** "Hypothesis" was a
  false positive for falsifiability; the post states no falsifier.
- **The byline is not the class.** Four of sixteen lanes found otherwise.
- **A below-the-frontier post is worth a slot only when it argues who *pays*
  for the mechanism**, not when it explains it. "Why Strong Consistency?" paid
  because its argument is that weak consistency relocates work into every
  caller — the layer this bundle owns. That distinction should be a ranking
  input next time; the slug map cannot see it.
- **For a talk write-up, read the images.** One lane found 9 slides with
  `alt=""` carrying the only numbers in the document, including a reproduced
  VLDB'24 fleet table the prose never mentions.
- **`WebFetch` refuses verbatim reproduction and burns a budget slot on a
  summary.** Two lanes lost a fetch to this. Go to `research-ingest` or raw
  `curl` first for a short single-page essay.

## Run conditions

5 live siblings at claim time, holding `quality-gates`, `conformance-checking`,
`accessibility`, `knowledge-registry`, `pipeline-authoring`,
`machine-authored-documentation` and `review-iteration-loops` — no overlap with
this run's seven claimed subjects. The `content` lock was taken twice, for the
two golden-path spine edits only (`admission-queue`, `client-fetch-cache`), and
released immediately each time.
