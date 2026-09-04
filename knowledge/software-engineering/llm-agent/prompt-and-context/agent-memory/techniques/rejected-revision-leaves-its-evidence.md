---
layer: technique
type: technique
subject: agent-memory
technique: rejected-revision-leaves-its-evidence
status: forged
laws: [deletion-is-not-repair, one-validation-door, count-carries-predicate, identity-survives-reuse]
use_when: [a revision loop keeps proposing a change it already tried, deciding what survives when a proposed procedure change is rolled back, designing the record a validation gate writes after its verdict, an improvement loop cycles instead of compounding, deciding whether a rejected proposal's reason or its measurement is the durable artifact]
---

# A rejected revision leaves its evidence

Most proposed changes to a promoted procedure are rejected. That is the
expected outcome, not a malfunction — the same asymmetry
[procedure-promotion](./procedure-promotion.md) states for promotion itself,
where staying a memory is the correct destination for most candidates. What
happens to the rejection is the design decision that decides whether the loop
**compounds or cycles**, and it is decided once, in the gate.

The rule has two halves, and they apply to two different stores:

- The **artifact** is gated and reversible. A proposal that does not clear the
  bar is reverted, and the procedure returns to its last accepted version.
- The **diagnosis** is append-only and is never reverted. The observation that
  produced the proposal, the proposal itself, and the verdict all persist —
  regardless of the verdict.

Rolling the observation back along with the proposal is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) in its
purest form: the failing attempt is the artifact that exposed what the procedure
does not cover, and discarding it converts a visible gap into an invisible one
at exactly the site where visibility existed. The next iteration then re-derives
the same proposal, fails it the same way, and discards it again. A loop with no
memory of its rejections does not converge; it oscillates at whatever rate it
can generate candidates.

## What is measured, and what is design

Worth separating, because the two halves carry different authority.

**Measured.** On a 2026 four-benchmark ablation of a procedure-evolution loop
(one inference model, artifact library starting empty, average accuracy across
competition mathematics, web-search question answering, spreadsheet
manipulation and long-context document question answering), removing the
persistent layer entirely — the accumulated diagnosis and the pass that
maintains it — cost **15.0 points** of final accuracy, 63.7 down to 48.7. The
same study's revision timing points the same way: on its hardest benchmark
**33% of accepted revisions landed in the middle third of the run and 28% in
the late third**, so the majority of that benchmark's improvement arrived after
the point where a loop without accumulation has already exhausted what one
iteration's traces can explain. Accumulation is what buys the late revisions.

**Design, not separately ablated.** That the diagnosis specifically survives a
*rejection*, and that the gate is what records it, are structural choices in
the same system rather than arms of its experiment. They are carried here
because a maintained corpus that triages incoming candidates reaches the same
rule from the opposite direction and for a reason that needs no experiment: a
rejection nobody wrote down is re-proposed indefinitely, so the record is what
makes a filter cumulative rather than merely repeated.

## The gate writes the record, not the proposer

The component that authored a rejected change is the wrong narrator of why it
was rejected. It will record its **intent** — what the change was meant to
achieve — because that is what it holds; the outcome is something it learns
about afterwards, second-hand, and a proposer summarising its own rejection
writes an apologia. The verdict is held by the thing that issued it.

So the record is appended **programmatically, by the harness, after the
verdict**, through the same door that decided
([one-validation-door](../../../../_laws.md#one-validation-door)): whatever
proposes, and whatever evaluates, the record is written at one place, so a
proposal cannot reach the artifact without its outcome reaching the log. A
second write path is a rejection nobody recorded.

Four fields, and the choice of fields is the technique:

1. **The target.** Which procedure the proposal touched, by identity, never by
   name ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
2. **The diff.** The actual change, not a description of it.
3. **The score, with its predicate.** What the candidate achieved on which
   split ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
   A bare "rejected" is unusable a few iterations later.
4. **The outcome.** Accepted or rejected, as a value, not inferred from whether
   the artifact changed.

**Store the diff and the number; do not store the reason.** A reason recorded at
rejection time is a hypothesis authored at the moment of least information — the
gate knows the score, not the mechanism — and it hardens into a fact that later
iterations reason from. The diff and the score are observations and stay true.
The reason is exactly the thing the accumulated diagnosis is *for*, and it is
written there, later, by the pass that can see several rejections at once.

## A rejection record is not a verdict on the idea

The record says *this diff scored X on this split and did not clear the bar*.
It does not say the idea is wrong, and writing it as though it did is how a loop
ossifies. An artifact set moves; a change that could not clear the bar against
one version of a procedure may clear it comfortably against the next, and the
same shape proposed later is a new proposal with a new measurement rather than
a repeat of a settled question.

The distinction is the same one that separates *not selected* from *rejected* in
any triage that keeps a ledger, and it matters for the same reason: a store of
judgments is read as closed, and a store of measurements is read as evidence. So
the reviser's instruction is "do not re-propose this **diff** against this
**state**", never "do not revisit this area". The first is cheap and correct; the
second is the loop deciding its own scope from its worst iteration.

## What the bar is measured against

The comparison is against the **best score achieved so far**, not against the
immediately preceding version, and the bar is initialised from the empty
artifact set's own score before the loop starts. Comparing against the
predecessor lets a loop ratchet downward: an accepted revision that happened to
score high becomes the new baseline only if the baseline is a high-water mark,
and against a predecessor a run of small degradations each passes its own
neighbour.

Two costs of that choice, and both should be written down where the bar is set:

- **A strictly-better bar rejects the scaffolding step.** A proposal that
  preserves the current score while making the *next* improvement reachable
  cannot clear a bar that demands improvement now. The system whose numbers
  appear above adopted the strict bar deliberately, for comparability with
  prior work, and named this exclusion as a known limitation with no measured
  alternative. It remains unmeasured; a loop that loosens the bar to admit
  neutral proposals is making an untested trade, and should instrument it
  rather than assume it.
- **A high-water mark makes the loop's own noise a ceiling.** One lucky
  evaluation sets a bar later honest candidates cannot clear. This is the
  ordinary reason a gate's split needs enough items to separate a real
  difference from a resample, and it is the same discipline
  [baseline-ladder](./baseline-ladder.md) applies to comparisons in this
  subject: a difference smaller than the instrument's own spread is not a
  difference, whichever direction it points.

## The accumulated record is the reviser's input, and only the reviser's

The persisted rejections are diagnosis, so they live under the access rule the
next technique states: the reviser reads them, and the executor whose trace is
the evidence does not
([diagnosis-withheld-from-the-executor](./diagnosis-withheld-from-the-executor.md)).
A rejection log is an unusually pure case of it. It contains, by construction,
the procedural material that did *not* survive review — so an executor reading
it is being helped by content the gate specifically declined to promote, and
the trace it produces will be attributed to an artifact that does not contain
that content.
