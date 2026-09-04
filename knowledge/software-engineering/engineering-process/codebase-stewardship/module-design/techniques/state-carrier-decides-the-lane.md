---
layer: technique
type: technique
subject: module-design
technique: state-carrier-decides-the-lane
status: forged
laws: [count-carries-predicate, silent-state-is-ungoverned]
shared_with: []
use_when: [adding a parallel or forked lane to a runner that was written sequentially, shared state has to be copied rather than shared to cross a boundary, a summary or counter is missing entries nobody can explain, choosing the container for state that several execution paths will reach, a spawn site carries a comment apologising for what does not propagate back]
---

# The state carrier decides the lane

[concurrency-at-the-edge](./concurrency-at-the-edge.md) asks where a
flow-control model is allowed to live, and assumes the question is open when
you ask it. Usually it is not. By the time anyone proposes a second lane, the
state that lane must reach is already sitting in a container chosen months
earlier for the convenience of the first lane — and that container carries a
property that answers the concurrency question before it is put.

**A container for shared state is also a claim about which boundaries the state
may cross.** A reference-counted cell built for a single flow of control cannot
be handed to a second one. A handle bound to a connection, an arena, a thread
or an event loop cannot leave it. A closure that captured a non-transferable
reference cannot be sent. When the second lane arrives the checker refuses, and
there are only three ways forward: change the carrier everywhere, build a real
sink the lane can reach, or **copy the state in and drop it on the way out**.

The third is always the cheapest, it always compiles, and it is almost never
decided. It is conceded.

## The concession is per-struct; its correctness is per-field

This is the whole of the technique, and it is why the defect survives review.

The copy is written once, at the spawn site, over **one aggregate**. Correctness
is a property of **each field inside it**, and the fields fall into three
classes that a single copy treats identically:

- **Per-branch state** — which unit of work this branch is running, its
  arguments, its working directory. A copy is not merely acceptable here, it is
  the point: these fields *should* diverge, and sharing them would be the
  defect.
- **Accumulators** — timing summaries, counters, collected warnings, coverage
  records. A copy is a **silent loss**. The branch writes into its own copy,
  the copy is discarded at the join, and the accumulator that survives is
  missing exactly the work that ran in the new lane. Nothing reports this: the
  summary still prints, still looks complete, and is now a count whose
  predicate has quietly changed from "every unit of work" to "every unit that
  did not take the fast path".
- **Latched decisions** — a mode selected at run time, a backend forced by an
  earlier step, a feature toggled by a dependency. A copy is a **divergence**:
  the branch sees the value as it stood at the fork, later changes never reach
  it, and its own latch never reaches anybody.

One clone covers all three. The reviewer sees a spawn site that compiles and a
comment; nobody enumerates the fields, because the copy reads as a single
decision about a single value.

## The tell is an apology at the spawn site

Where the carrier made the decision rather than the author, the code says so, in
a form that is easy to read past:

> *we do not support merging changes back to parent*

A one-line comment at a spawn site, in the register of a product decision,
sitting immediately after a deep copy that exists because the original would not
cross. That sentence is not documentation of a design; it is the record of a
concession, written by the person who made it, at the moment the checker
refused. **Treat every such comment as an unreviewed change to the semantics of
everything the copied aggregate contains.**

The second tell is documentary, and it is the stronger one because it is
falsifiable from outside the code. A system whose author knew the lane had
hazards will publish a hazard list — *these features behave differently under
the parallel form*. Compare that list against the fields of the copied carrier.
The list will name the hazards **visible to the user of a feature** (a shared
working directory, an environment variable) and omit the ones the **runtime
accumulates on the user's behalf** (the timing summary, the forced selection).
The omission is the proof: hazards that were designed get documented, hazards
that fell out of a bound do not, because nobody ever formed the thought.

## What to do instead, in the order the repair usually runs

- **Move the accumulator out of the carrier.** An accumulator does not need to
  be *shared*; it needs a **sink that outlives the branch** — a channel, a
  collector returned from the join, an append-only file. This is almost always
  the cheapest correct repair, because it changes one field's home rather than
  the carrier's type, and it leaves the per-branch fields copying as they
  should.
- **Merge explicitly at the join.** Where the accumulator must stay in the
  carrier, the join returns it and the parent folds it in. The fold is a real
  operation with a real question attached — are two timings summed or listed,
  does a latch set in one branch win — and forcing that question to be answered
  is most of the value.
- **Change the carrier** only when the latched decisions must genuinely be
  shared. This is the expensive repair and it is correct less often than it
  looks, because the per-branch fields then need protecting from the sharing the
  new carrier permits.
- **Or keep the copy and publish it.** Isolation per branch is frequently the
  right semantics. It stops being a defect the moment it is stated as a
  guarantee in the same place the feature is documented, with the fields named.
  The failure was never the copy; it was that the copy was never a decision.

## Where the pressure comes from, so it can be seen early

The bound that refuses is not always a type-system bound, and the technique
applies wherever a boundary demands a copy rather than a reference:

- a worker or isolate reached only through a serializing channel, where the
  message is a snapshot by construction;
- a subprocess or fork, where the child's writes to inherited memory are
  invisible to the parent;
- a re-invocation of the same binary as a child — the shape most likely to be
  described as "running the unit again", which conceals that it is a fresh
  process with a fresh accumulator;
- an ownership or borrow discipline that marks the carrier as belonging to one
  flow of control and refuses to transfer it.

In all four the visible edit is small and local, and the semantic change is
distributed across every field of the thing copied.

## Where it does not apply: a payload built for the crossing

The technique triggers on an **existing shared carrier that is copied in order to
cross**. It does not trigger on a boundary whose payload is *constructed for the
crossing* — a request object assembled at the call site from arguments, sent, and
answered by a reply that the caller writes into its own state.

The distinction is not stylistic and it decides whether there is anything to
look for. When the payload is built per call, every field in it is per-branch by
construction: the accumulators — caches, counters, eviction tallies — never enter
the message at all, because they live on the calling side and are written when
the reply resolves. That is the technique's own primary repair (*move the
accumulator out of the carrier, into a sink that outlives the branch*), reached
by default rather than by correction, and it is what a worker or service
boundary designed from the start usually looks like.

So the audit has a cheap precondition. **Before classifying fields, ask whether
the thing crossing is a snapshot of state the caller already had, or a request
the caller just assembled.** Only the first can lose anything. A seam that fails
this precondition needs no field classification and should not be reported as a
clean result — nothing was ever at risk there.

## Decision rules

- Choose the state carrier for the **widest lane the system will plausibly
  grow**, not for the first lane written. The carrier is a concurrency decision
  taken before the concurrency question is asked.
- At every boundary where state is copied rather than shared, **enumerate the
  fields and classify each** as per-branch, accumulator, or latched decision.
  The copy is correct for the first class only.
- An accumulator inside a copied carrier is a defect until it is either moved to
  a sink that outlives the branch or merged explicitly at the join.
- A comment at a spawn site describing what does not propagate is a design
  decision that was never reviewed. Promote it to documentation or repair it; do
  not leave it as a comment.
- Diff the published hazard list against the copied carrier's fields. What the
  list omits is what nobody decided.
- Any total or summary emitted by a system with a copying lane states which
  lanes it covers, or it is a count without its predicate.
