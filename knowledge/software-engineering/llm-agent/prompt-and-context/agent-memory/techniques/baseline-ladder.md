---
layer: technique
type: technique
subject: agent-memory
technique: baseline-ladder
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [deciding whether a memory pipeline earns its cost, a memory system reports a score and nobody asked against what, choosing between two memory designs on one benchmark number, the write path costs more than anyone has measured]
---

# Baseline ladder

Every other technique in this subject describes how to build the pipeline. This
one asks the question the pipeline structurally cannot ask about itself:
**does having it beat not having it?** The standard is a stack of obligations
that cost money at write time and attention at read time, and not one of those
costs is self-justifying.

The failure this prevents is not "the memory system turned out to be bad". It
is that the system was never compared to anything, so nobody — including the
people who built it — can say what it bought.

## Four rungs, cheapest first

A memory design owes a number at each rung, on the same tasks, with the same
consumer:

1. **No memory.** The consumer answers from what is in front of it. This is
   the floor and it is not a formality: where the consumer already solves the
   task from the present situation, every rung above is spend with no return,
   and replaying past material raw has been measured *below* this rung.
2. **The whole history, in context.** Every prior exchange, unprocessed,
   inside the consumer's window. This is the rung most often skipped and the
   one that most often wins. Where many designs have been measured against it
   at once, purpose-built memory systems frequently lose: the distillation
   drops what the retriever later needs, and similarity-matched retrieval
   compounds a small error at each hop, so the end-to-end result lands well
   under what the same store scored when its retrieval step was bypassed.
3. **Retrieval over the raw record.** Chunk the history, index it, take the
   top matches. No extraction pass, no beliefs, no supersedence — the thing
   this subject opens by calling the original sin of the domain. As a
   *baseline* it is formidable and nearly free at write time; compared
   head-to-head under one protocol, a full extraction pipeline has tied it
   while paying tens of times the write-path cost.
4. **The pipeline.** Capture, consolidation, decay, budgeted recall.

Rungs 2 and 3 are not strawmen to be waved at on the way to rung 4. They are
the incumbent. The pipeline is the challenger, and it is the challenger's job
to show the delta.

## The ladder is not an argument against the pipeline

Losing a rung-2 comparison is not evidence that the four structural objections
to raw history were wrong. Those objections — wrong altitude, no supersedence,
unbounded growth against a bounded recall, no correction surface — are claims
about **what happens past the window and past a reversal**. None of them
predicts a win on a fixed-size question set where the whole history still fits
and nothing was ever corrected. A suite of that shape measures retrieval
quality; it does not exercise the properties the pipeline exists for.

Which is why the ladder's real output is a *crossover*, not a winner. The
pipeline earns its cost where the history no longer fits the budget, or where
beliefs must be correctable, auditable and governed — and those are the two
conditions to state out loud before running anything. Where neither holds, the
lower rungs are the right answer and the pipeline is overhead wearing a
discipline's clothes.

## The score's predicate is the consumer and the index

A memory score is not a property of the memory design. Where the confounds
have been controlled one at a time, each of them moved the result by more than
the architectures being compared differed from each other: swapping only the
embedding model inside otherwise identical retrieval code reversed which of
two designs was ahead, and running one full-history-versus-retrieval
comparison across three consumers produced three different verdicts spanning
tens of points in both directions — with a large share of one consumer's
losses being refusals to answer rather than wrong answers, which no
accuracy-only report distinguishes.

This is [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
at benchmark scale. A memory number travels with the consumer, the index and
embedding used, the retrieval depth, and which rung it beat — or it does not
travel. And per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation),
the comparison is a derived value like any other: it names how to re-run it,
one variable at a time, or it is a claim with no arbiter the first time
somebody disagrees.

The corollary is uncomfortable and load-bearing: **most published memory
comparisons do not clear this bar**, so a design decision imported from one is
resting on an uncontrolled variable. Re-run the ladder on your own consumer
before adopting anyone's verdict, including a favourable one.

## Write cost is an axis, not a footnote

Accuracy-only reporting hides where this class of system actually spends.
Reasoning at ingest is priced per event and paid on every event forever, while
the accuracy delta is collected once; a tie at fifty times the write cost is a
loss, and a one-point win at an order of magnitude more cost has to argue for
that point. Report cost per unit of history next to accuracy, on every rung —
rungs 1 and 3 are cheap at write time precisely because they defer the work,
and that is the trade the ladder exists to price.

## Re-run, never inherited

Because a consumer swap can move the outcome further than an architecture
swap, a ladder verdict is pinned to the consumer it was measured on. A new
model, a longer window, or a changed index invalidates it. Record the verdict
with its date and its consumer, and treat it as stale rather than inherited
when any of them changes — an unmeasured design is not a passing one, and a
verdict measured against a consumer nobody runs any more is unmeasured.

## When not to use it

When there is no task set with checkable answers, the ladder has no rungs, and
manufacturing a suite would only launder the decision that was going to be
made anyway. Instrument the live recall path instead — how often recall
returns empty and on what, considered against selected, and whether recalled
items were acted on — which is the honest signal available when nothing can be
scored. The one thing not available is the claim that the pipeline is worth
its cost: absent a comparison, that remains a design intention, and
[coverage-instrumentation](./coverage-instrumentation.md) is the reminder that
a store inspected only through its own contents always looks fine.
