---
layer: technique
type: technique
subject: plan-review
technique: informational-fold-in
status: forged
laws: [unknown-is-not-a-value, count-carries-predicate, absent-guard-is-loud]
shared_with: []
use_when: [a derived number would help at an existing approval, someone proposes a new gate for an advisory figure, a rough estimate is about to be persisted next to real measurements, an informational field has started blocking things]
---

# Informational fold-in

A derived number that would help a person decide — a cost range, a count of pending
items, a coverage figure — lands as a **field inside an existing gate**. No new gate, no
extra keypress, no verdict, no disposition written by anything but a person. The rule
looks like a UI preference and is not: a plan gate accumulates advisory figures faster
than it accumulates decisions, and every one that arrives as its own gate spends the
attention budget the rest of this subject exists to protect.

The estimate itself is somebody else's problem. How a figure is computed, how its error
bars are set, and the advisory / soft-gate / hard-gate hierarchy for figures that *are*
meant to enforce something belong to the cost-metering discipline. This technique owns
only where in the review flow an advisory number lands and the rule that keeps it from
becoming a gate by accretion.

## The four constraints

**It occupies a field, not a step.** The number appears on a surface the person was
already going to open, in the same interaction. If seeing it costs a navigation or a
keypress, it is a gate with the verdict removed, and it will acquire a verdict.

**It has no verdict and no disposition.** Nothing about the number is `pending`. Nothing
advances or blocks on it. The moment it gains a disposition it has become a record class
this subject governs, and it should then be designed as one deliberately rather than
arriving as a promoted field.

**Unavailable is a state, not a value.** When the figure cannot be computed, the field
reads *unavailable* and the gate proceeds exactly as it would have. It does not read
zero, it does not read the last known value, and it does not silently disappear —
rendering "we do not know" as a definite number is the laundering
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) forbids, and it
misleads hardest at exactly the gate where a person is deciding. An absent field that
looks the same as a zero field is the version of this that ships most often.

**The predicate travels with the number.** *What* was counted, over what window, under
what assumption
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A figure on an
approval surface is read at a glance and then quoted later in an argument it was never
sized for; the predicate is what stops that.

## Durability tracks confidence

The rule that makes this technique worth writing down separately: **the less grounded
the figure, the less durable it is allowed to be.**

- A **ballpark** derived from raw task text, before any plan or measurement exists, is
  surfaced once, at the moment it is useful, and persisted nowhere.
- A **calculated** figure derived from a settled plan against known rates persists with
  its inputs and its assumption stated.
- A **measured** actual persists as a fact.

The reason is the inversion that happens when a weak estimate is written down. A number
in a store acquires the authority of an artifact: a later reader finds it, has no access
to the context that made it a guess, and treats it as a fact about the work — and the
weakest figures are the ones most likely to be found later, because they are the ones
produced earliest and referenced in the most places. Ephemerality is not a limitation
here; it is the property that keeps a guess honest.

The corollary is a colocation rule: **a forecast is never stored beside captured
actuals.** Two numbers in the same shape in the same place will be compared, aggregated
and charted together by somebody who did not read either definition, and the resulting
series is neither a forecast series nor an actual series. Keep them apart, or make the
difference structural rather than a column name.

## The accretion failure, which is the one to watch for

An informational field becomes a gate in three quiet steps, and every step is locally
reasonable. First someone adds a threshold colour, because the number matters more when
it is high. Then someone adds a confirmation for the red case, because approving past it
by accident happened once. Then the confirmation is required, because the confirmation
was being clicked through — and now there is a gate whose trigger predicate nobody
designed, whose severity ladder does not exist, and whose bypass is a keypress. It sits
alongside gates that were designed, and it teaches the reviewer that some gates are
noise, which is a cost paid by the designed ones.

The rule is therefore a boundary rather than an aspiration: **if a figure should block
something, design it as a gate, with the trigger, the pending state and the record that
implies.** If it should not, it stays a field and its colours stay descriptive. There is
no third position, and "advisory but prominent" is where the third position is
attempted.

The same reasoning limits how far the field may quietly degrade. A field that vanishes
when its source is unhealthy leaves a reviewer with a surface that looks complete and is
not, which is the condition
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) names: either the
information is there, or its absence is visible and deliberate.

## When not to use it

- **When the number should genuinely block.** Then it is not this technique. Irreversible
  spend, an external commitment, a threshold with a real consequence on the other side —
  design the gate.
- **When the surface has no room left.** A gate carrying six advisory fields has none;
  each one dilutes the reading of the others, and the remedy is to drop the weakest, not
  to add the seventh in a smaller font.
- **When the figure would be the only thing a rushed reviewer reads.** A single prominent
  number beside a dense record becomes the summary, and a summary of a plan produced by
  the pipeline that wrote the plan is the thing the gate exists to refuse.

## What this cannot do

An informational field does not make a decision better; it makes one input to the
decision cheaper to obtain. It is also invisible in every after-the-fact record, since
nothing about it is persisted at the moment of the verdict — so when a decision goes
wrong, there is no way to establish whether the field was read, or what it said at the
time. That is an accepted cost of not making it a record, and it should be accepted
knowingly rather than discovered during a post-mortem.
