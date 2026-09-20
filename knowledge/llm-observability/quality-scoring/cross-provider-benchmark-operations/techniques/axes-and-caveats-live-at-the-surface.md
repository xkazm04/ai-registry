---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: axes-and-caveats-live-at-the-surface
status: forged
laws: [never-present-absence-as-an-answer, estimation-announces-itself]
shared_with: []
use_when: [a benchmark gains a new target axis or a graded field, a machine-readable contract describes a benchmark's declaration, a verdict line branches on whether the claim is significant, one render layer serves a runner and a console and an agent, deciding where a caveat has to be printed]
---

# Axes and caveats live at the surface

A benchmark grows by gaining fields. A new axis on the target — the reasoning
setting, a per-case service ceiling. A new grade on the case. A new qualifier on
a claim — which cases the paired test actually ran over. The field gets a type,
a parser, tests and a paragraph in the documentation, and every one of those is
the *inside* of the feature.

The outside is two surfaces: the **declaration a caller writes against** on the
way in, and the **render a reader sees** on the way out. A field that exists
inside and at neither of those does not exist. Nothing errors, no test fails,
and the omission is invisible from the only two places anyone stands: the axis
is simply never varied, and the caveat is simply never printed.

That silence is what distinguishes this from an ordinary missed integration. A
dropped field that *breaks* something announces itself on the first run. These
two fail by producing a correct-looking artifact: a scorecard whose columns all
ran at one setting nobody chose, and a headline claim with nothing attached
saying what it rests on.

## The input half: an axis nobody can see is an axis nobody varies

The declaration is not documentation of the feature; for everyone who did not
read the source it **is** the feature's whole addressable surface. That includes
every automated caller, which is now most of them: an agent handed a parameter
list saying the target set is "an array" writes a benchmark that cannot express
the knob, and will never learn the knob was there.

Two properties make this worse than a documentation gap.

**A closed vocabulary must be in the contract, not merely behind it.** A ladder
the handler validates and the declaration does not name produces callers
confidently stating rungs that do not exist. Where the handler refuses, the
caller receives a rejection it had no way to anticipate; where the handler is
lenient, the value is accepted and silently discarded, and the run reports over
a corpus whose grading was thrown away. The enum belongs in the document the
caller receives.

**The default has to be named as its own fact.** An omitted knob is not the
lowest level and not the middle one — it is the provider's default, which is a
different and perfectly legitimate choice. A declaration that lists the levels
without saying what absence means invites a caller to read absence as a level
([_laws: never-present-absence-as-an-answer_](../../../_laws.md#never-present-absence-as-an-answer)),
and a scorecard whose unset rows are indistinguishable from its lowest-setting
rows has lost the comparison it was built for.

## The output half: the branch that claims most prints least

When a claim gains a qualifier, the render almost always prints it on the weak
branch and drops it on the strong one. The reason is chronological rather than
careless: the strong branch was written first, as a one-line headline, and the
qualification logic arrived later with the hedged wording it was invented for.
So the code that says "no significant difference — here is why not" carries the
caveats, and the code that says "best, significantly ahead" returns early.

The result is a precise inversion. **The strongest sentence the tool emits is
the one that cannot say what it rests on.** A tested superiority claim computed
over the intersection of the cases both targets completed is still a real claim
— and rendered bare, it hides the single fact a reader needs to weigh it
([_laws: estimation-announces-itself_](../../../_laws.md#estimation-announces-itself)).
The caveat is the unit on the number, and a unit printed only when the number is
unimpressive is decoration.

## One render layer, more consumers than the one you fixed

The layer that draws the scorecard is usually shared — the runner that produced
the numbers, an operator console reading stored results, an agent-facing tool
call. That sharing is the whole reason the table is consistent, and it is also
why the tempting fix is wrong. Printing the missing caveat *beside the call*, in
the runner that noticed, reaches one consumer of three and leaves the other two
emitting the unqualified claim — with the finding now marked fixed, which is the
expensive part. Count the consumers of a rendering layer before repairing
anything inside it, and repair it there.

## Procedure

1. **Enumerate the field's surfaces before writing its tests.** The core type,
   the stored artifact, the declaration a caller reads, and every render path.
   A field whose reach ends at the test boundary is a field the product does not
   have.
2. **Put the closed vocabulary and the meaning of absence in the declaration**,
   not only in the handler that enforces them.
3. **Pin each surface with a test that reads it as a caller receives it** —
   asserting the axis is present, that its levels are the ones the engine
   actually parses, and that it is not required. A test of the parser is not a
   test of the contract; a contract is a document, and it goes stale the way
   documents do.
4. **Print the qualifier on every branch, and derive nothing at the render.**
   The layer that draws the sentence decides how to say it, never what is true:
   it is handed the claim and its caveats, and it refuses to print a stronger
   sentence than the one it was given. An empty caveat list prints nothing, which
   is the only branch where silence is correct.
5. **Repair the shared layer, never the caller that noticed.**
6. **Give absence a rendering of its own.** A column that exists only when some
   row declared the axis is fine; a row that leaves it blank is not, because a
   blank reads as the same value as the row above it. Mark the unset cell
   explicitly, and never fill it with a guessed level.

## Decision rules

- **When the field is optional, the declaration still has to name it.** Optional
  describes whether a caller must supply it, not whether a caller is told it
  exists. Optional-and-undeclared is the combination that produces a feature
  used only by its author.
- **When the surface cannot carry the field — a type-only pin, a fixed column
  set — that is a finding about the surface**, not a licence to skip it. Record
  the axis as unreachable through that surface so the gap is legible to whoever
  reads the artifact next.
- **When a new field only qualifies an existing claim, it ships with that
  claim's renderer or it does not ship.** The claim is already circulating; a
  caveat that arrives a release later never catches the screenshots.
- **When a run's field is genuinely internal**, it has no surface obligation.
  The test is whether a decision reads it: a retry counter is bookkeeping, a
  case count under a recommendation is the recommendation's predicate.

## When not to use it

- As a reason to widen a stable declaration for every internal field a run
  gains. Each surface is a compatibility obligation from the day it is
  published; the discipline is to enumerate surfaces deliberately, not to export
  everything.
- On a single-consumer tool with one code path in and one out. The rule earns
  its keep where the inside and the outside are maintained by different people
  on different clocks — which a benchmark reaches as soon as it has an
  automated caller.
