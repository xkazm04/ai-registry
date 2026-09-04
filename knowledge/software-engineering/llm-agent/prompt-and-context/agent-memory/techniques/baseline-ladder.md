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

## The learned rung, and the one it is usually measured against instead

The four rungs above are all *architectures*, and they are all written for a
consumer whose weights do not change. Where the memory operations are trained
into the policy rather than designed — which entries to write, which to
supersede, which to recall — the ladder needs a rung of its own, and the
substitution that gets made instead is the wrong one.

The rung is: **the same system with the learned decision pinned.** Fix the
policy to a constant assignment, a random one, and where it is computable an
oracle one; run the identical pipeline. That is the arm which separates *the
pipeline is good* from *the policy is good*, and those are separately
purchasable. A learned design that beats several rival architectures has shown
only the first.

The substitution to refuse is a comparison against rival *systems*. It is the
easier table to build and it answers a different question, and it is what gets
published: a learned memory router measured against seven competing memory
systems, with no fixed-assignment arm anywhere and its only ablation on a
reward-normalization constant, cannot say whether the learning bought anything
at all.

**And the evidence for an adaptive policy is its dispersion at one setting, not
its mean across settings.** Reporting the policy's average selection frequency
per cost weight is what a global mixture also produces; the statistic that
separates a per-query policy from a knob is the variance across queries with
the knob held still. A design that publishes only the sweep has described a
dial and called it a policy.

## The stage ablation carries its operating regime

Removing a stage and re-scoring is the within-pipeline counterpart to the rungs
above, and it inherits `count-carries-predicate` in a form that is easy to
miss: **a stage ablation measures the regime it was run in, not the stage.**

Ablate forgetting in a store that never filled and the result is that
forgetting is worth nothing — which is true of that run and false of the
technique. One measured instance: removing the delete operation from a learned
memory policy cost almost nothing, and the same paper's capacity appendix shows
delete and update frequencies rising once the store is capped, so the operation
was barely firing in the arm that ablated it. The number is real and it reports
the absence of pressure.

So ablate a stage only under the pressure that stage exists to answer: decay
only over a full store, supersedence only past a reversal, capture only past
the window, recall budgeting only where the candidate set exceeds the budget.
State the regime beside the delta, or the delta belongs to the regime.

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

## The elaboration regime is a predicate too, and it is the largest one

Before the confounds below, one that is cheaper to check than any of them and
is routinely left uncontrolled: **how much reasoning the consumer was asked to
do.** It is not a property of the memory design at all, and it moves results
further than the designs do.

Measured on one instrument: the same evidence, the same consumer, no retrieval
difference, one added instruction to reason step by step before answering —
and the result moved 21.8 points, recovering most of a gap that had been
reported as a memory-architecture finding. A control that measured tokens
spent ruled out generation volume as the cause; the elaboration itself was the
term.

So a rung's number travels with the elaboration it was produced under, and two
rungs are comparable only when that is held fixed. A ladder whose lower rungs
answer directly and whose top rung reasons in stages is measuring prompting
with an architecture's name on it.

The ladder also has no **ceiling** arm, and one is worth adding where it is
constructible: the best any design could do on this task, evidence-wise —
every item the answer requires, supplied outright. Treat it as a diagnostic
and never as a bound, because it is neither. A staged process has been measured
*above* such a ceiling even with elaboration held equal, because a minimal
sufficient evidence set is not the same object as a maximally helpful one.

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

## The judge and the per-arm budget travel with the rung

Two more variables belong in the list a number travels with, and a
first-party benchmark tree makes both visible by holding them in code rather
than in the report. The **judge**: a memory benchmark scores free-text answers
with a model, and the prompt that model is given has a *direction* — one
tree's default judge awards a correct mark when at least one gold item
appears, accepts dates within two weeks and durations within half, and is
instructed to use evidence only to accept, never to reject; a second judge in
the same tree is told to be generous and count an answer that touches the
gold's topic. Paired with an answer prompt that forbids abstention, that
grading rewards guessing, inflates both arms, and compresses the gap the
comparison exists to measure. The strict variant was one flag away and was
not the default. A rung's number therefore names its judge, the judge's
leniency direction, and whether the answerer was allowed to say "unknown" —
or two rungs graded under different judges are not comparable, and two
rungs graded under one lenient judge are comparable about the wrong thing.

The **per-arm retrieval budget**: when the treatment arm recalls under a
stated cap — six items, ten thousand tokens — and the control arm is the
consumer's own native memory under whatever it does, a reported token
reduction compares two budgets, not two memories. Hold the budget constant
across arms or report the token number as the *budget's* effect. Where the
control is a different consumer altogether (a harness that ran the "native"
arm against a different model than the one it is named for), the row is not a
rung at all and should be reported as an integration test of the harness.

## Write cost is an axis, not a footnote

Accuracy-only reporting hides where this class of system actually spends.
Reasoning at ingest is priced per event and paid on every event forever, while
the accuracy delta is collected once; a tie at fifty times the write cost is a
loss, and a one-point win at an order of magnitude more cost has to argue for
that point. Report cost per unit of history next to accuracy, on every rung —
rungs 1 and 3 are cheap at write time precisely because they defer the work,
and that is the trade the ladder exists to price.

## Restraint is two numbers, and one of them alone is a lie

Including should-abstain questions in the denominator is the floor, not the
finish. The rate they produce - the share of unanswerable questions a design
asserted an answer to anyway - is trivially gamed, because the cheapest way to
drive it to zero is to answer less. A design that abstains on everything scores
perfectly on restraint and is worthless, and nothing in an accuracy column
distinguishes it from a design that is genuinely careful.

So the restraint rate travels with its inverse: the share of *answerable*
questions, whose fact is demonstrably in the record, that got an abstention.
Push either one down by tuning eagerness and the other rises. Reported as a
pair they describe where a design sits on that axis; reported alone, either is
a number a careless arm can win.

The pair earns its place the first time it runs, on rungs the accuracy column
already ranks correctly. The empty rung reads a perfect restraint rate against
a total silent-failure rate, which is the degenerate quiet extreme drawn in two
numbers. Retrieval over the raw record is the loudest arm on the ladder and its
restraint rate says so, in the same run where its accuracy looks respectable.
And a pipeline read through its own production consumer asserted on nothing it
should have stayed silent about while abstaining on one answerable question in
eight - where the same store read by the neutral consumer abstained on one in a
hundred. That gap is a property of the consumer's instructions and effort, not
of the memory, and only the pair could see it.

Two operating notes. Restraint questions must be authored, not harvested: the
population is questions with no answer in the record and questions whose answer
expired, and both have to be planted deliberately because a stream of real usage
contains few of them and labels none. And keep the two rates unweighted and
separate rather than folding them into one score - the trade between them is the
finding, and an average is exactly the thing that hides it.

The pair is not new to measurement; it is the risk-coverage trade-off of
selective prediction, where coverage is the share answered and risk the error
among the answered, and that literature's founding observation is the one
above — either number alone is won by moving along the curve. Its operating
rule is sharper than "report both": **compare two arms at matched coverage.**
One eagerness knob traces a curve, and a design that answers 90% of questions
is not comparable to one that answers 70% at any accuracy; either hold
coverage fixed across arms, or report the curve. A single point on each of
two curves compares two settings of a dial and calls the difference a design.

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
