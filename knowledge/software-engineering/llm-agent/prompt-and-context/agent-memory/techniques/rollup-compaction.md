---
layer: technique
type: technique
subject: agent-memory
technique: rollup-compaction
status: forged
laws: [failure-not-empty-success, one-validation-door]
shared_with: []
use_when: [the store grew by accretion, many items say one thing, compressing without deleting]
---

# Rollup compaction

Consolidation turns records into beliefs; decay retires beliefs that stopped
mattering. Neither handles the third way a store degrades: **accretion**. Six
items, each individually true, each individually worth keeping, that together
say one thing — and cost six recall seats to say it. Rollup compaction is the
pass that finds those families and replaces them with one item that
supersedes them.

It is not summarization for its own sake. The measure of a good rollup is that
the store gets *smaller in what it recalls* while losing nothing from what it
can prove: the members remain, linked, auditable, and out of default reads.

## Clustering wants a symmetric measure — and that is the opposite of dedup

Both this pass and consolidation's duplicate check compare two texts, and they
must use **different similarity measures**, for a reason worth stating as a
rule: *the measure follows the question.*

- Consolidation asks **"does this new item correct or duplicate that existing
  one?"** — a directional question. A short, sharp correction should score
  high against the long item it corrects, so the measure normalizes by the
  *smaller* side and is deliberately asymmetric in effect.
- Rollup asks **"do these belong to the same family?"** — a mutual question.
  Two items belong together only if each is largely about what the other is
  about, so the measure normalizes by the *union* and is symmetric. Length
  sensitivity, a bug in the first question, is precisely the guard in the
  second: a one-line note and a three-page write-up that share a few terms are
  not a family.

Using the correction-shaped measure for clustering pulls every short item into
every long item's family, and the resulting rollups read as confident
nonsense. This is the single most common way a compaction pass poisons a
store.

## A family needs three

A cluster of **two** is not a rollup case; it is a supersedence case. Two
similar items are handled by [consolidation](./consolidation.md) — one replaces
the other, and the survivor keeps every specific either had. A summary that
replaces a pair almost always loses more nuance than the one recall seat it
saves. Three is the smallest size where compression genuinely wins.

The join threshold has a knee that must be found empirically, not assumed: set
it too low and unrelated items merge because they mention the same system;
set it too high and genuine restatements of one fact split into singletons.
State the chosen value with the observation that justified it, because the
next person to "tune" it needs to know what moving it costs in both
directions.

## No model, no rollup — and say which happened

The deterministic prefilter can find families. Nothing deterministic can write
an honest summary of them. So when the reasoner that would write the rollup
prose is unreachable, the pass returns **no proposals** — it does not fall
back to concatenation, first-sentence extraction, or any other mechanical
stand-in. **A memory store that invents its own summaries poisons itself**,
and it poisons itself in the worst possible place: at the item that
supersedes six real ones and now speaks for all of them.

Silence is only safe if it is legible, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success). "We
looked and there is nothing to compact" and "we could not look" are the same
empty result and opposite instructions to the operator — the first means the
store is healthy, the second means compaction has silently stopped running
and accretion is unchecked. The pass reports which, explicitly, alongside how
many families it found.

## The proposal is untrusted input, and its identifiers are the dangerous part

A rollup proposal is not prose to be reviewed at leisure; the member
identifiers inside it **become supersede writes**. That makes parsing the
proposal the load-bearing security boundary of the whole pass — the same
discipline [consolidation](./consolidation.md) applies to cited grounds, with
one sharpening the correction case makes clear:

- The proposal must name a family the pass actually asked about.
- Every member identifier must belong to *that* family. A foreign identifier
  **rejects the whole proposal** rather than being quietly dropped: a
  reasoner that mixed two families has misread the task, and its prose is
  therefore suspect too. Repairing the identifier list while trusting the
  summary keeps the part that was proven wrong.
- Fewer than two surviving members after validation is a rewrite, not a
  rollup. Reject it.
- **A rollup's confidence is capped at the maximum confidence of its
  members.** A derived item may never be more certain than the most certain
  thing it derives from. Without this ceiling, compaction is a laundering
  machine: six hunches in, one confident-looking fact out, and the hedging
  that made the hunches honest is gone.

Everything here is strict-reject, never repair. And the pass itself **writes
nothing** — it returns proposals, and adopting one is a separate, explicit
act through the store's single door, per
[one-validation-door](../../../../_laws.md#one-validation-door).

## Bound the pass by the pass, not by the store

Compaction's cost must be independent of how large the store has grown, or it
becomes the operation that gets disabled the moment memory starts paying off.
Three caps do it: a maximum number of families considered per pass, a
per-member excerpt length so one enormous item cannot crowd out its own
family, and a maximum length for the rollup body — a summary longer than that
is not a summary, and the cap is a cheap check on whether the pass is doing
its job at all.

## When not to use it

Do not compact items whose value is their multiplicity: independent
confirmations of one fact are evidence *weight*, and collapsing them into one
line destroys the reinforcement signal the
[memory-value-model](./memory-value-model.md) and supersedence arbitration both
read. Do not compact across trust grades — an operator-issued correction
folded into a rollup of inferences loses the grade that made it authoritative.
And do not run compaction on a store whose duplicates are a *capture* defect:
if one event is minting six near-identical items, the repair is upstream at
the write path, not a pass that tidies the output forever.
