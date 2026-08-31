---
layer: technique
type: technique
subject: test-input-generation
technique: model-based-oracle
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [a randomized suite only catches crashes and assertion failures, deciding whether a reference implementation is worth its cost, a well-formed wrong answer reached production, choosing between a recorded output and a stated property]
---

# Model-based oracle

Generating inputs is half a test. The other half is deciding whether the answer
was right, and that half sets a ceiling on everything the generator can
achieve: a perfect generator attached to a weak oracle finds only the defects
the weak oracle can see. Teams invest heavily in the first half and accept
whatever oracle was convenient, which is why the most common outcome of a large
fuzzing investment is a suite that finds crashes well and wrong answers not at
all.

## The ladder

Oracles form a ladder of strength, and the rungs cost roughly what they are
worth.

1. **Crash and assert.** The process died, or an internal assertion fired.
   Nearly free, since it needs no test-side logic at all, and it catches only
   defects the system already noticed. Everything that returns normally passes.
2. **Invariant checks.** Properties any correct output must satisfy —
   conservation of a total, an ordering that must hold, a size relation, a
   round trip that must return the original. Cheap, transplantable across every
   input, and genuinely strong. Their ceiling is structural: an invariant
   answers *did anything obviously break*, never *is this the right answer*.
   A system that returns a consistent, well-ordered, correctly-summing, wrong
   result passes every one of them.
3. **A reference model.** A second implementation of the same behaviour,
   written for clarity rather than for performance, whose answers the real
   system's are compared against on every generated input. This is the only
   rung that catches the well-formed wrong answer.

The third rung is where the expensive defects live, because a well-formed wrong
answer survives every check made of *shape* rather than of *meaning*, and those
are the checks that exist at every other layer of a system. It is also the rung
that catches what a saturated generator cannot: in the case that motivates this
subject, a query returning an empty result where a record existed was invisible
to roughly twenty generators and to their invariant checks, and was found
immediately by an external checker holding an independent model of what the
answers should be.

## The rung between: a recorded expected output

There is a fourth position on that ladder, and it sits between invariants and a
model rather than above either. A **recorded expected output** — the result of
running the system once, reviewed by a human, and committed — answers a
narrower question than a model: *is this the same answer as last time?* It is a
change detector, not a correctness oracle, and its entire value rests on one
event, which is a person having actually read the output the first time.

That makes it cheap in a way the model is not, because the "second
implementation" is the system's own past behaviour. It also makes it fragile in
a specific way: the check degrades to nothing the moment updating becomes
reflexive. The disciplines that keep it honest are all about the update path
rather than the comparison:

- **Updating is opt-in and explicit** — an environment variable, a flag, a
  deliberate method — never the default action on failure and never automatic
  in the pipeline. A recorded output that regenerates itself when it disagrees
  is a test that always passes.
- **The review surface is a diff in version control.** Update in place, then
  read the change the way any other change is read. This is the whole quality
  gate, so it must land somewhere review already happens rather than in a
  reviewer's terminal scrollback.
- **Volatile parts are marked ignorable at the point they occur** —
  timestamps, durations, generated identifiers, addresses. A recording full of
  values that legitimately change every run trains everyone to update without
  reading, which removes the only thing making it work.
- **The recording lives adjacent to the case it belongs to**, close enough to
  read both at once, and carries the location it must be written back to so
  updating is mechanical. A recording in a distant file is reviewed by nobody.
- **Nothing is written unless the check would otherwise fail.** A test that
  rewrites its own expectations on every green run has no expectations.

The decision rule against the other rungs: **use a recorded output where you
can recognise a correct result but cannot state what makes it correct** —
rendered structure, generated code, a formatted report, an error message, a
compiled plan. Where the property *can* be stated, state it: an invariant
survives a legitimate refactor that a recording flags, and a recording freezes
incidental structure the system was free to change. Where the answer is
computable independently, a model is stronger, because a recording can only
tell you the answer changed, never that it was wrong to begin with.

## Building a model that is worth having

A model earns its cost only if it fails independently of the system. Three
rules, and the first is the one that decides the outcome.

**Write it from the specification, not from the implementation.** A model
derived by simplifying the real code inherits the real code's
misunderstandings, and the comparison then confirms agreement between two
expressions of the same error. When the behaviour is genuinely subtle, the
model should be written by someone who has not just written the
implementation, or at minimum from the requirement rather than from the source.
This is the practical form of
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
the specification is the authority both artifacts answer to, and a model that
answers to the implementation has left no authority in the system at all.

**Optimise it for obviousness, and accept that it is slow.** The model may use
the naive data structure, recompute from scratch, hold everything in memory,
and run at a fraction of the system's speed. Its only job is to be so simple
that its correctness is inspectable by reading. Every optimisation moves it
toward the implementation and toward correlated failure.

**Model the observable contract, not the internals.** The model reproduces what
callers are promised. It should not mirror the system's internal layout —
the moment it does, it stops being an independent check of the contract and
becomes a change-detector for the implementation, failing on every refactor
while catching nothing.

## Reading a disagreement

A mismatch says the two disagree; it does not say which is wrong, and treating
the system as guilty by default wastes the technique's best output. **A model
that is wrong is a finding**: it means the specification is ambiguous enough
that two careful readings diverged, which is a defect in the specification and
frequently the more valuable discovery. Record which side was wrong each time.
A model that has never been wrong was probably derived from the implementation
after all.

The diagnosis also wants the **smallest** disagreeing input, not the first one,
which is why this technique pairs with a shrinking step or with
[exhaustive-when-bounded](./exhaustive-when-bounded.md), whose enumeration
delivers the minimal case for free.

## When the cost is not justified

- **When invariants already pin the answer.** If the correct output is uniquely
  determined by properties you can state cheaply, those properties *are* the
  model, and writing a second implementation adds cost and no discrimination.
- **When the behaviour is the reference.** For a system whose whole job is a
  well-defined transformation with an existing trusted implementation, compare
  against that one rather than writing a third.
- **When the output is not deterministic** for a fixed input — a scheduler, a
  cache with timing-dependent contents, a model-driven component. There the
  oracle has to be a property or an acceptance band, and this technique does
  not apply; that is the neighbouring evaluation subject's problem.
- **When the model would be as complex as the system.** That is the honest
  disqualifier, and it is the point at which the correct move is to invest in
  [inside-out-invariants](./inside-out-invariants.md) instead: assert the
  internal relationships directly rather than reproducing them.
