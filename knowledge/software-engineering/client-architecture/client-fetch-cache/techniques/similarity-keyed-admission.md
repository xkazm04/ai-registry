---
layer: technique
type: technique
subject: client-fetch-cache
technique: similarity-keyed-admission
status: forged
laws: [count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [a cache is keyed on resemblance rather than on identity, deciding whether to serve a stored answer to a request that is not byte-identical, tuning a similarity threshold, a cache whose wrong answers look like right ones, choosing an eviction rule for a cache that can hit falsely]
---

# Similarity-keyed admission

Every bet in [admission-hypothesis](./admission-hypothesis.md) is a bet about
*time or adjacency*: it was read recently, it was made recently, something near
it was read, it was written alongside something being read now. All four
presuppose that the entry, once found, is the right entry — because the key is an
identity and a hit is a proof.

There is a fifth bet, and it breaks that presupposition. **Paraphrase
recurrence**: the entry will be read again by a *different utterance of the same
request*. It is the bet behind every cache keyed on a resemblance — an embedding,
a normalized shape, a fuzzy digest — and it is worth stating separately because
it is the only admission bet under which a hit can be **wrong** rather than
merely old.

That single difference reorganizes all four policies.

## The failure mode moves from staleness to falsity

An identity-keyed cache fails by serving something *true earlier*. Lifetime is
the whole defence, and every question the golden path asks about believability is
a question about time.

A resemblance-keyed cache adds a failure that lifetime cannot reach: the stored
answer was never an answer to this request. It is not stale, it is not corrupt,
and nothing about it is detectable downstream — it is a fluent, plausible
response to a question nobody asked. The consumer cannot tell, because the
artefact carries no trace of which request produced it.

So the admission bet must be paired with a **stated tolerance for wrongness**,
and that tolerance is a product decision, not a tuning constant. A cache in front
of an expensive, slow, approximate authority can rationally buy a small
false-hit rate; a cache in front of a cheap exact one cannot buy anything,
because it has nothing to pay with.

## Two knobs, and only one of them is usually exposed

A resemblance key has a **metric** (what counts as near) and a **cut-point**
(how near is near enough). Configuration surfaces routinely expose the second and
bury the first, which produces a specific and durable confusion: the cut-point is
commonly expressed as a fraction of the metric's own range, so the same
configured number means an incomparable thing under a different metric. Swapping
the metric — a cheaper embedding, a different distance, a reranker — silently
re-tunes the correctness boundary while every dashboard and every config file
still reads the same.

State both, together, at the construction site. A threshold without its metric is
not a setting; it is a number waiting to be misread, and it will be misread the
first time somebody changes the metric for an unrelated reason.

The corollary is that per-call risk tolerance belongs at the call site and
per-family tolerance belongs at the key family. A single global cut-point across
request families with different costs of being wrong is the same mistake as one
lifetime across key families with different volatility, and it is invisible for
the same reason.

## Confirmation is a ladder, and every rung returns on one scale

A single threshold is a poor defence because it spends the whole budget in one
place. The shape that works is an ordered ladder: cheap recall first, then
confirmations of increasing cost, **each able to veto**. Recall proposes; the
rungs above it dispose.

The discipline that makes the ladder composable is that every rung returns a
score on a *declared range* rather than a boolean. Given that, a rung that has
nothing to do with resemblance can join the same pipeline — an age bound becomes
a rung that returns the floor once the entry is too old, and freshness is
expressible in the same type as similarity instead of living in a separate
lifetime check that knows nothing about the match.

Two rules govern the top of the ladder:

- **A confirmation that costs as much as the original call has to justify
  itself.** It pays only when the avoided wrong answer costs more than the call
  does. Say which case you are in; a confirmation rung added by reflex converts a
  cost saving into a cost.
- **The expensive rung fails toward the authority, never toward the cache.** When
  the confirmation is unavailable or unsure, the correct fallthrough is to do the
  real work. A confirmation step that defaults to *admit* on its own failure has
  removed the guard exactly when the guard was uncertain.

## Eviction reinforces the entries it should remove

This is the failure an identity-keyed cache cannot have, and it is the reason
eviction cannot be inherited here.

Eviction by recency of access is fed by hits. In an identity-keyed cache that is
sound: a hit is a proof the entry was wanted. Under a resemblance key a hit is
only a *claim* that the entry was wanted, and a hit whose correctness was never
confirmed refreshes the entry's recency exactly as a correct one does. An entry
that is wrong but **attractive** — one that sits near many requests, a
semantic hub — is therefore reinforced by precisely the traffic it is
corrupting. It rises through the store while doing damage, and the eviction
policy reads its rise as evidence of value.

Nothing in a recency or frequency policy can detect this, because both measure
demand and the defect is in supply. What is needed is a path by which an entry
can leave for being *wrong* rather than for being old or unpopular: a negative
outcome recorded against the entry, a confirmation failure that evicts rather
than merely declining to serve, or a bounded lifetime that caps how long any one
entry can keep winning. Without one of those, the store has no route from
"discovered to be wrong" to "gone".

## The measurement most such caches ship cannot see the failure

The natural instrument is a hit counter and a miss counter, and it is the wrong
instrument. A wrong hit and a genuine miss both land in the same bucket unless
something distinguishes them, so the number that comes out is a **recall**
figure — while the failure the design is defending against is **precision**.

A precision number needs a negative set: pairs that must *not* match, labelled
independently of the cache under test. A corpus of paraphrase pairs alone cannot
produce one, because every pair in it is a true positive by construction, and a
threshold swept against it will report improvement all the way to admitting
everything.

Carry the predicate with the number
([count-carries-predicate](../../../_laws.md#count-carries-predicate)): a hit
rate is not a claim about correctness, and reporting it beside a latency saving
invites exactly the reading it cannot support. If the negative set does not
exist, say the precision is unmeasured rather than implying it is high.

**Measure at the threshold you ship.** A benchmark run at a cut-point nobody
deploys measures a system nobody runs, and the gap between the measured setting
and the default is the most common way this instrument lies without anyone
choosing to lie.

## Enumerate the reject arm's side effects before tuning either knob

The two knobs above are where attention goes, and a field test says that is not
where the worst failures are. Both of the severe, shipped incidents observed in
one crawler's history occurred at a **correct metric and a correct cut-point**,
and neither would have been caught by any amount of precision tuning. In each
case the defect was in what the *reject* branch skipped along the way.

A similarity gate is usually written as one branch, and over time that branch
accumulates work that has nothing to do with admission: a near-duplicate page was
rejected, so its outbound links were never enqueued and whole subtrees reachable
only through paginated or faceted pages went silently uncrawled; a near-duplicate
was rejected, so the stored record was never rewritten and every templated
document's validators stayed frozen indefinitely while the duplicate counter
climbed and the run reported success.

Both are **scope failures at a correct threshold**, and they share a signature
worth recognizing: the cache's own counters look healthy — better than healthy,
because a rising duplicate count reads as the cache working — while a
consequence nobody associated with caching quietly stops happening.

So the audit has a third question ahead of the other two: **what else does the
reject arm skip?** List every side effect on that branch, and for each one ask
whether it is a consequence of *this entry being a duplicate* or merely a
consequence of *this branch being where the code happened to sit*. The second
kind moves out. What remains is an admission decision and nothing else, and the
scope predicate that decides when the gate applies at all is worth lifting into
a named, pure, separately testable function rather than left inline — it is the
knob that was missing, and it is the one the incidents were actually about.

## The third defect class

[cache-key-discipline](./cache-key-discipline.md) sorts cache defects into
collisions and fragmentation, and prescribes an axis audit that finds both by
inspection of the key builder. Under a resemblance key that audit can pass clean
while the cache serves wrong answers all day, because the collision boundary is
not in the builder at all — it is in the metric and the cut-point, outside every
axis the audit walks.

So a resemblance-keyed cache owes the axis audit **and** a second one: what does
the cut-point admit that the axis list would have separated? The two audits catch
different things, and passing the first is not evidence about the second.

The axis audit still matters, and here it is sharper rather than weaker: the
material a resemblance key is built from is usually a *reduction* of the request
— a summary, an embedding of one field, the user-supplied part with the
surrounding frame stripped for recall. Every axis dropped in that reduction is an
axis the cache cannot distinguish, and dropping them is what makes recall good.
Recall and correctness are pulling in opposite directions on the same lever,
which is why the reduction has to be written down rather than tuned.

## Decision rules

- Name the fifth bet explicitly when it is the one being made; it is not a
  variant of recency, and inheriting recency's defaults imports the wrong
  eviction.
- State the metric and the cut-point together, and treat a metric change as a
  correctness change requiring re-measurement, not as a swap.
- Give the cut-point a scope — per family, per call — matching the cost of being
  wrong. One global number across families is a mismatch to argue, not a default.
- Compose confirmation as vetoing rungs on a declared range, so an age bound and
  a resemblance test can live in the same pipeline.
- Fail the expensive rung toward the authority. Uncertainty is not admission.
- Give the store a route from wrong to gone — a bounded lifetime at minimum.
  Recency and frequency alone reinforce an attractive wrong entry.
- Measure precision against an independently labelled negative set, at the
  threshold you deploy, or report precision as unmeasured.
- Enumerate the reject arm's side effects before tuning either knob, and move
  out everything that is not an admission decision; the severe failures observed
  in the field were scope failures at a correct threshold.
- Lift the predicate deciding *whether the gate applies* into a named pure
  function, separately testable from the metric and the cut-point.
- Run the axis audit *and* the cut-point audit; the first passing says nothing
  about the second.

## Canonicalization is not resemblance, and the hazard does not transfer

One boundary is worth drawing sharply, because the two look alike at the call
site and behave nothing alike. A key built by **canonicalizing** the request —
case-folding, collapsing whitespace, sorting parameters, then digesting the
result — is not a resemblance key. It is an identity key computed after a total
function, and every equal input maps to exactly one entry by construction.

Everything above is inapplicable to it. There is no metric and no cut-point,
there is no false-hit rate to tolerate, a hit remains a proof, and the eviction
reinforcement cannot occur. Such a gate belongs to
[cache-key-discipline](./cache-key-discipline.md), where the canonical
serialization is already the rule, and its failure mode is the ordinary one: an
answer-changing axis that the canonicalization discarded.

A **projection** is a total function too, and this is the case most often
misread as a resemblance key: a memo keyed on some prefix, field subset or
truncation of the request. Ask what the cached computation actually reads. If it
reads only the projection the key was built from, the key is exact *on that
domain* — precision is 1.0 by construction, there is no cut-point, and none of
this technique applies. It becomes a resemblance key only when the cached work
reads more than the key does, and then the interesting quantity is not precision
but what the projection *dropped*.

The discriminator is whether two *unequal* requests can share an entry. Under
canonicalization they cannot — the equivalence class is exact, decidable and
explainable, and the entries it merges were the same request wearing different
punctuation. Under a resemblance key they can, deliberately. Choosing
canonicalization where resemblance was tempting is frequently the better
engineering, and a system that can state its equivalence as a total function
should prefer that and take none of this technique's costs.

## What this technique does not own

Whether an entry should be cached at all, and the four time-and-adjacency bets,
are [admission-hypothesis](./admission-hypothesis.md) — this technique owns only
the fifth bet and what it changes. The identity of an entry and its collision
audit remain [cache-key-discipline](./cache-key-discipline.md); the reduction
that produces a resemblance key is a key concern and belongs there, and only the
cut-point is owned here. How long an entry stays believable, and removal for
memory rather than for belief, are the golden path's Lifetime and Eviction
policies. Nothing here governs caching *inside* the authority being called,
where the reuse is of the authority's own internal work rather than of an answer.
