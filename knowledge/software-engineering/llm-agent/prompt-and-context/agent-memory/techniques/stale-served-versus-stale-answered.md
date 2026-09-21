---
layer: technique
type: technique
subject: agent-memory
technique: stale-served-versus-stale-answered
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a store supersedes by linking versions rather than by removing them, deciding whether a stale answer is a retrieval defect or a reading defect, a memory system reports only wrong-answer rates, choosing between filtering a superseded belief and labelling it, measuring whether recall serves the successor]
---

# Stale served versus stale answered

A stale answer is the end of a chain with two links, and a single number
cannot say which one broke. The store either put the superseded value in
front of the reader or it did not; the reader either repeated it or
adjudicated it. **Measure both, separately, or every fix aims at whichever
layer the team already suspected.**

- **Stale served** — of the questions whose subject has a superseded value,
  how many contexts contained that old value at all. This is a property of
  the store and the read path, and it is measured without a consumer, a
  judge or a model call: search the assembled context for the value the
  ground truth says is no longer current.
- **Stale answered** — of those same questions, how many replies asserted
  the old value. This is the end-to-end number every benchmark reports, and
  it is the product of the first rate and the reader's adjudication.

The ratio between them is the thing worth knowing. Serving the old value
is not a defect on its own, and a system that never serves it has bought
that with a filter that can also drop a value it should have kept.

## The rule that inverts, and the measurement that shows it

[consolidation](./consolidation.md) states the strong design: supersede
rather than replace, and **recall serves the successor** while audit can
still reach the lineage. That is the right default, and it is not what a
version chain gives you for free. A superseded item is typically neither
deleted nor expired, so a store that filters only deleted and expired items
still serves the old belief: the chain records which item won without
keeping the loser out of the result set.

Measured on one engine of exactly that shape — an extraction agent writing
`updates` relations over a versioned store, replayed through a simulated
year — **the superseded value reached the context in 92 of 92 reversal and
expired questions, through a retrieved memory rather than through raw
history, under both of the store's read modes.** Recall did not serve the
successor. It served both, every time.

And the system answered 0.90 to 0.92 of all questions correctly, with
**7 stale answers out of those same 92 opportunities** under the mixed read
and 6 under the filtered one. The old value was present and was adjudicated
away nine times in ten, because every
retrieved item carried its own date and version marker and the newer one
said what it replaced. That is
[recall-injection](./recall-injection.md)'s labelling discipline doing the
work that the read filter was not doing.

So the design space is wider than "retire it or fail":

- **Filter at read** — the successor alone is served. Strongest when the
  store can reliably tell which item is superseded *for this question*, and
  it forecloses the reader's ability to notice a bad supersedence.
- **Date and version, and let the reader adjudicate** — both are served,
  each labelled with its instant and its place in the chain. It survives a
  wrong supersedence, and it spends context on beliefs that are known to be
  dead.

A store that has chosen the second without knowing it — because it filters
deleted items and assumed that covered superseded ones — is running the
weaker version of it: paying the context cost and relying on labels it never
designed. The two-point measurement is what makes that visible.

## Reading the pair

| stale served | stale answered | what broke, and where to fix it |
| --- | --- | --- |
| low | low | nothing; the filter works |
| high | low | the reader is adjudicating; labels are carrying it. Cheap improvement is at the read filter, not the prompt |
| high | high | the store serves the old value and nothing tells the reader it is old — label before filtering |
| low | high | the reader invents or remembers staleness the store did not serve; a prompt or a training-prior problem, and the store is not the fix |

The bottom row is the one a single end-to-end number hides completely, and
the one where a store-side fix cannot work.

## Cost, not only correctness

Serving both versions is paid for in context. In the measured run the
filtered read (memories only, superseded versions still included) spent
2,637 tokens per question against 2,984 for the read that also admitted raw
history — and answered five more questions correctly, none fewer. Where a
read path mixes a curated layer with an unfiltered one, price the second
layer against what it adds: here it added tokens and no correct answers, and
on the one reversal where the two diverged mechanically it was the mixed read
that repeated the retired value.

## What this cannot tell you

The split is only as good as the ground truth behind "the value that is no
longer current"; it needs a fixture that records supersession, not a log of
questions. It also says nothing about *why* the reader adjudicated well — a
capable reader, a short context and a clear label all help, and this
measurement does not separate them. And a difference of a handful of
questions between two read modes is within the grader's own noise
([eval-harness/judge-stability](../../../evaluation-and-cost/eval-harness/techniques/judge-stability.md)):
in the measured pair, three of the five differing questions were near-identical
answers separated by grader strictness, which is exactly why the served rate —
counted without a model in the loop — is the more durable half of the pair.
