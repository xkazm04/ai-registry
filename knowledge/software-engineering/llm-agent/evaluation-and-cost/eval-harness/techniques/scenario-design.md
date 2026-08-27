---
layer: technique
type: technique
subject: eval-harness
technique: scenario-design
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [deciding what belongs in a scenario cache key, improvement shows up but the exam changed underneath, coverage reported without naming which regions]
---

# Scenario design

A scenario is the unit of question the harness asks: an input, the context it
arrives in, and a declaration of the property the answer must have. The suite
is only as good as its scenarios — a harness with pristine judges and
airtight aggregation, run over scenarios that only cover the happy path,
produces precise measurements of nothing important.

## Identity first: a scenario is a versioned fixture

Scores attach to scenario identities. Every longitudinal claim the harness
will ever make — "quality improved between versions," "the regression
appeared here" — is a comparison of scores *across time at fixed scenario
identity*. That only works if identity is minted deliberately and survives
what scenarios actually undergo: reordering in the suite, reuse across
comparison modes, regeneration of the set they belong to
([_laws: identity-survives-reuse_](../../../../_laws.md#identity-survives-reuse)).
Positional identity ("scenario 7") breaks on insert; name-equality breaks on
edit. The standard is a stable id plus a content version: when a scenario's
substance changes, its version advances, and the harness refuses to splice
scores across versions as if they were one series.

## Two sources, opposite failure modes

**Captured reality.** Real inputs promoted into fixtures: a transcript that
exposed a defect, a request that produced a bad answer, an edge case a user
actually hit. Their *inputs* are representative by construction — the
distribution they sample is the true one — and each carries a story, which
makes failures interpretable. Their *labels* are not (below). Their weakness is coverage: they accumulate slowly, cluster
around past incidents, and systematically miss the failure the system has
not had yet. Every production incident should leave a scenario behind as its
sediment; a defect fixed without a scenario is a defect the suite has agreed
to rediscover empirically.

**Generation.** A model synthesizes scenarios from a specification — a
persona, a capability contract, a coverage matrix of situations. Generation
buys breadth cheaply and can be pointed at regions captured reality never
visits. Its weaknesses are inherited blind spots (the generator finds the
cases the generator can imagine), a tendency toward well-formed inputs, and
a second layer of non-determinism: regenerating the set produces a
*different* set.

The mature suite uses both, in ratio to maturity: young systems lean on
generation because nothing has been captured yet; the ratio shifts toward
captured reality as incidents accrue.

## A captured input arrives with an outcome, not a label

Capturing reality is two acquisitions wearing one name, and they have
opposite reliability. The **input and its context** come from production and
are exactly what the system will meet. The **expected property** — the third
part of a scenario, the part that decides pass from fail — does not come from
production at all. It gets back-filled from whatever the product happened to
record, and what the product records is a *workflow outcome*: an alert
someone closed, a suggestion someone rejected, a result someone did not
return to.

A workflow outcome is not a ground truth and usually cannot be turned into
one, because several distinct truths produce the identical record. One
closure can mean the finding was wrong; or it was right and has already been
dealt with elsewhere; or it was right and the risk was consciously accepted;
or it was never read and the queue needed clearing. Promoting that single
record into an expected property renders four states as one definite value
([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)),
and the suite then scores the system for reproducing a bookkeeping artifact.

The corpus already refuses this collapse where the stakes are visible: a
delivered prompt that a user waved away is recorded as a deliberately
ambiguous weak negative rather than a rejection
([efficacy-feedback](../../../orchestration/proactive-nudges/techniques/efficacy-feedback.md)),
and a dismissed finding is kept distinguishable from a resolved one because
the difference is the only precision signal the producing system will ever
get
([evidence-based-auto-close](../../../orchestration/remediation-handoff/techniques/evidence-based-auto-close.md)).
A suite that harvests those same records as labels discards exactly the
distinction those subjects were built to preserve.

Three questions before a production record becomes an expected property, and
they are cheap enough to ask of every source:

- **How was this record created?** By whom, through which affordance, under
  what pressure. A record produced by a queue-clearing gesture and one
  produced by a considered judgment look identical in the table.
- **Does it answer the suite's question?** The product asked "is this
  actionable for you, now"; the suite is asking "is this true". Those coincide
  less often than the column name suggests.
- **Are different outcomes grouped into one category?** Collapsing happens at
  write time, in the product, for the product's reasons — so the grouping is
  usually invisible downstream and has to be checked at the source.

The corrective is **manual re-labelling of the subsets that matter**, not of
the whole capture. Ambiguous regions and the cases the decision actually
turns on get a human verdict against the suite's own question; the rest keeps
its provenance and is used for coverage rather than for scoring. The bar is
not a perfect label set — it is a label set accurate enough to support the
decision being made, and the honest way to hold that bar is to record, per
scenario, where its expected property came from. A suite whose labels have
mixed provenance and no marking cannot tell a regression from a mislabel, and
the machinery for telling them apart downstream
([failure-attribution](./failure-attribution.md)) has nothing to read.

## The cache key is an instrument-stability decision

Generated scenarios must be cached — regenerating per run is slow, costly,
and quietly re-rolls the exam. But the *scope of the cache key* is the
subtle decision, and it is worth stating as a rule:

> The key includes everything that defines the scenario's identity, and
> deliberately excludes everything that identifies the candidate the
> scenario will be run against.

Include: the scenario specification, the generator's version, the seed, the
count requested. Exclude: the candidate's instructions, its version, its
configuration — anything that changes when the *system under test* changes.
The exclusion is what makes version deltas comparable: candidate versions A
and B face the identical instrument, so the score delta is attributable to
the candidate. Widen the key to include candidate material and every
candidate change silently regenerates the scenarios — the delta now
confounds "the system changed" with "the questions changed," and no
downstream statistics can unmix them. This is not hypothetical: measured
live, a one-line change to a candidate's instructions produced a scenario
set with zero overlap against the previous one and a double-digit
"improvement" that was pure exam drift — the most convincing kind of
phantom result, because every individual score in it was honestly computed.

The scoping has a stated tradeoff, and stating it is part of the
technique: a candidate whose substance was materially rewritten keeps
facing an exam authored before the rewrite, for up to the cache lifetime.
That staleness is bounded and visible; exam drift is unbounded and
invisible. Choose the bounded defect, and write the choice down next to
the key so a future maintainer does not "fix" it backwards.

One more cache rule earned in production: **never cache an empty
generation.** A generator that produced nothing has failed, not answered;
caching the empty set converts one transient failure into a poisoned
instrument for the cache's whole lifetime.

The key's scope is a stored derivation, and it obeys the law that stored
derivations name their recomputation
([_laws: derivation-names-recomputation_](../../../../_laws.md#derivation-names-recomputation)):
write down, where the cache lives, exactly what is in the key, what is
deliberately out, and what invalidates an entry — a lifetime, a generator
upgrade, an explicit flush. A cache whose invalidation story is tribal
knowledge will be flushed at the wrong moment by someone debugging, and a
comparison series will die of it.

## Cover the ugly cases on purpose

Scenario sets drift toward politeness: well-formed inputs, cooperative
users, reasonable requests. The failures that matter live elsewhere, and
they are enumerable as a checklist because they recur across every domain:

- **Degenerate inputs** — empty, enormous, duplicated, truncated
  mid-structure.
- **Adversarial inputs** — instructions embedded in data, requests to
  violate the declared contract, bait for the system's known temptations.
- **Ambiguity** — under-specified requests where the *right* behavior is to
  ask, not to guess confidently.
- **Distribution shift** — inputs from adjacent domains the system will
  plausibly receive but was not tuned for.
- **Stress compositions** — several independently-handled features in one
  request, where integration seams fail.
- **Distractors** — a well-formed, in-distribution input that contains more
  than one plausible target, only one of which the system was asked about.
  Distinct from adversarial: nothing here is planted, nothing instructs, and
  a careless reader would call the case clean.

The last region is the one that goes missing, and the mechanism is worth
stating because it operates while everyone is being careful. **Curating a
scenario set removes distractors as a side effect of tidying it.** A case
gets trimmed to the part that matters, the surrounding material is dropped
as irrelevant, near-miss neighbours are deduplicated away — each edit
defensible, and together they produce a set in which every input has exactly
one thing worth looking at. Production never has that property. So the suite
measures the system on a task the system will not be given: *identify the
salient item*, when the real task is *evaluate the designated item, which may
not be the salient one*.

The failure it hides is specific. Given a designated target and a neighbour
that looks more like what the system is hunting for, a model will reason
about the neighbour — and it will produce a fluent, well-structured, entirely
plausible answer about the wrong object. Nothing about the output flags it;
the assertions pass, the judge scores it fairly, and only a reader who knows
which item was designated can see the substitution. Any suite whose scenarios
ask about a designated item *inside* a larger context needs this region, and
the scenario is built by keeping the neighbours the tidying pass wanted to
delete.

A note on a rule that inverts elsewhere, so it is not mistaken for a
contradiction. In assessment design — where the instrument measures a
*person's* judgment — planted distractors are disqualifying, because a case
with one right answer surrounded by wrong ones has a key, and a key converts
a judgment probe into a retrieval test. Both rules are correct, and one
question separates them: **is the distractor captured or planted?** Here it
is a property of an input the system will really receive, and excluding it
makes the suite easier than reality. There it is a property the designer
invented, and including it makes the instrument measure something other than
what it claims. Captured distractors are coverage; planted ones are an answer
key.

Tag scenarios by which region they cover, and report coverage *by region*,
never as a bare count — five hundred polite scenarios and zero adversarial
ones is not "five hundred scenarios of coverage," and any number that
travels must carry its predicate
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).

## Expected properties, not expected outputs

A deterministic fixture can declare its expected output. A scenario for a
non-deterministic system declares expected *properties*: constraints any
acceptable answer satisfies (must mention, must never claim, must stay
within, must conform to). Writing scenarios this way keeps them stable
across candidate versions — outputs change freely, the property contract
endures — and it is precisely what makes the downstream split between
mechanical assertion and judged evaluation possible: properties phrased
sharply enough become assertions, and only the remainder needs a judge (see
[assertion-vs-judgment](./assertion-vs-judgment.md)).
