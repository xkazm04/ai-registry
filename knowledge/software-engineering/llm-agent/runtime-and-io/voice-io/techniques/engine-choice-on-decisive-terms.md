---
layer: technique
type: technique
subject: voice-io
technique: engine-choice-on-decisive-terms
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [choosing between speech recognition engines, a vendor publishes a benchmark ranking that beats the engine in production, deciding whether a better published score is worth switching for, a recognition gate passes while the transcript is unusable, building a selection set for a transcription bake-off]
---

# Engine choice on decisive terms

[on-device-vs-cloud](./on-device-vs-cloud.md) decides **where** a recognition
engine runs and lists a *quality ceiling* among its seven axes without saying
how that axis is read. This technique owns the reading — **which engine, on
what evidence** — and its whole content is one refusal: a published aggregate
recognition score is not the evidence, and switching engines because a
leaderboard moved is a purchase made on someone else's error distribution.

The re-evaluation trigger the placement technique names ("a better small model
ships") cannot fire without this. *Better* is not a property an engine has; it
is a measurement someone took, on some audio, against some scoring rule, and
all three are the buyer's to choose.

## The aggregate is a proxy, and it fails where it matters

A word error rate pools substitutions, deletions and insertions over every
token and divides by length. That arithmetic embeds one assumption — **every
word costs the same** — and no product has ever had that cost structure. In a
transcript headed for a downstream stage, tokens fall into two classes with
different physics:

- **Absorbable tokens.** Fillers, discourse markers, function words,
  punctuation, an inflection. A stage downstream re-derives the meaning without
  them, or a reader repairs them for free. They are the *bulk* of every
  transcript and therefore the bulk of the aggregate.
- **Decisive tokens.** The terms a downstream stage keys on — a domain noun, a
  proper name, an identifier, a quantity, a negation. Lose one and the stage
  does not degrade, it **acts on something that was never said**, and nothing
  further along can detect it because the transcript is internally coherent.

An engine's aggregate is dominated by the class that does not decide anything.
So the score can move in the opposite direction from the outcome, and a gate
built on it passes exactly when the proxy diverges from the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

This is not a hypothetical. Measured on one product's own instrument over its
own reference set, two candidate engines were scored on the same three
utterances: the first substituted two domain nouns and left the sentence frame
intact; the second garbled function words and inflection and preserved every
domain noun. **Aggregate error rate: 0.167 against 0.278 — the first engine
wins by 40%. Decisive-term recall: 0.667 against 1.000 — the second wins
outright.** The two instruments buy different engines from the same recording.

The sharper half of that result is on the single decisive utterance, where
**both engines scored an identical 0.231** while one of them fabricated two
capabilities the transcript then asserted. The aggregate did not merely rank
them wrongly; on the utterance that mattered it could not separate them at all.

## Build the selection set from your own audio, not from a benchmark

A published benchmark is a corpus someone else assembled to be *reported on*.
It is broad by design, because breadth is what makes a ranking publishable, and
breadth is the property that guarantees it under-weights your decisive terms.
Three consequences for the set you actually select on:

- **It is small and it is yours.** Held-out recordings from the product's real
  channel — its microphones, its rooms, its speakers, its subject matter. Tens
  of utterances chosen for their content beats thousands chosen for coverage,
  because the selection question is not "which engine is better" but "which
  engine is better *here*".
- **It contains the cases engines disagree on.** A set every candidate
  transcribes perfectly and a set every candidate fails both rank nothing while
  costing a full run each; the discipline for keeping a selection set
  discriminating, and for re-cutting it as the population moves, belongs to
  [discriminating-task-selection](../../../evaluation-and-cost/eval-harness/techniques/discriminating-task-selection.md).
- **Synthesized audio buys exactness and spends realism.** Speaking the
  reference through a synthesizer makes ground truth free and exact, which is
  the expensive half of any recognition measurement, and it is a legitimate
  foundation. What it cannot produce is the variation that lives in the
  *speaker* rather than the channel: accent, disfluency, rate, and a speaker
  who changes language mid-sentence. Seeded channel degradations — additive
  noise at a stated ratio, gain reduction — extend a synthesized set along the
  channel axis honestly, and along no other. Record what the set cannot vary,
  because that list is exactly the set of vendor claims you are unable to check.

## The metric contract, applied to recognition

[eval-harness](../../../evaluation-and-cost/eval-harness/eval-harness.md) states the
general rule — one metric is optimized, every other is a threshold that is
cleared or not — and recognition has a specific assignment of the roles that is
almost always inverted in practice:

> **Optimize decisive-term recall. Demote the aggregate error rate to a
> threshold.**

The aggregate keeps a real job in that arrangement: an engine whose bulk
accuracy collapses is unusable however well it preserves nouns, and the
threshold catches it. What the aggregate must never do is *rank* the
candidates, because ranking is the operation it performs worst.

Two rules make the recall metric an instrument rather than a number:

- **Deletions get a zero budget, separately from substitutions.** A substituted
  decisive term is wrong and a *missing* one is unrecoverable — nothing
  downstream can distinguish "not said" from "not heard"
  ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)). Report
  the missing terms themselves, not only the rate; the list is what makes a
  regression diagnosable.
- **Match the term list by morphology, longest-first.** A decisive term appears
  inflected, and a lexicon matched as bare strings under-counts in exactly the
  languages where recognition is weakest. Longest-prefix-first ordering stops a
  short term swallowing a long one that contains it, and short ambiguous terms
  that collide with ordinary speech are excluded deliberately and recorded as
  excluded.

Both numbers travel with the size of the set they were taken over and the
conditions they were taken under
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
recall figure without its utterance count and its degradation condition is not
a measurement, and it is the form in which every published ranking arrives.

## The vendor's feature list is a checklist against your set, not a reason

A release announcement is reliable for one thing: that a capability now exists
somewhere. Each capability it names — speaker attribution, per-word timing,
vocabulary biasing, in-sentence language switching, automatic language
detection, noise tolerance — is an axis, and the useful move is to ask, per
axis, **whether your selection set can score it at all.** Most sets can score
one or two. The rest are claims you are structurally unable to check, and the
honest posture toward those is a recorded gap, not a purchase.

Note which way that cuts: an axis your set cannot vary is not an axis on which
the incumbent has been shown adequate either. The gap is symmetric, and it is
an argument for extending the set, never for trusting the announcement.

## The selection instrument must be able to reach a second engine

The failure this technique most often meets in a mature product is not a bad
metric — it is a good one that is welded shut. A recognition harness grows
inside the integration it was built to test, speaking one provider's protocol
directly, and the moment a second engine is worth considering the measurement
that would decide it cannot be aimed. The product then has an excellent
instrument for *regressions* and none for *choices*, and the engine question
gets settled by a published ranking after all, which is where this technique
started.

So the engine boundary is a requirement of the harness, not a refactor to do
later: the thing under test is named by configuration, the reference set and
the scoring are engine-independent, and adding a candidate is a new adapter
rather than a new harness. Where the product already keeps a fallback chain
([engine-abstraction](./engine-abstraction.md)), that seam exists and the
harness should be built on it rather than beside it.

## When not to run the comparison at all

- **The rights axis has not been read.** Placement's licensing gate outranks
  every quality result: an engine that may not ship its output is not a
  candidate, and measuring it first spends the budget on an answer that cannot
  be used.
- **The decisive terms are not enumerable.** Where the downstream stage
  consumes open-ended prose and keys on nothing in particular, this technique's
  metric has no referent and the aggregate genuinely is the best available
  scalar. Say so explicitly; the honest version of this technique includes the
  case where it does not apply.
- **The incumbent has never been measured on the set.** A candidate scored
  against a remembered impression of the incumbent is a one-armed comparison.
  Both arms run on the same set, in the same conditions, or the result is an
  anecdote with a decimal point.
