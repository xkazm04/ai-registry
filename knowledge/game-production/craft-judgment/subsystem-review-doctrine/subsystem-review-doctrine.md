---
layer: golden-path
type: golden-path
subject: subsystem-review-doctrine
status: forged
use_when: [reviewing a game subsystem's implementation, designing an automated or assisted review pass, deciding how severe a finding is, reporting review progress across runs]
techniques:
  - ground-truth-pass-before-proposals
  - four-pass-ordering
  - per-subsystem-check-sets
  - trace-one-interaction-end-to-end
  - severity-by-consequence
  - regression-diff-new-persisting-resolved
---

# Subsystem review doctrine

A senior engine engineer reviewing a subsystem is not exercising taste. They are running
an **epistemic procedure**: establishing what is actually there, then concluding only what
that establishment entitles them to conclude, in an order where each conclusion rests on a
confirmed one rather than on a plausible one. The output is not an opinion about the code.
It is a set of findings, each of which names a thing that is true of the code, what it costs
if it stays true, and what would make it false.

This matters more, not less, when the reviewer is a machine. The characteristic failure of
an assisted reviewer is not a wrong opinion — it is a *confident, well-written, entirely
fluent review of code it never read*. It names a parent class that does not exist, cites a
member that was renamed two months ago, and recommends a refactor for a pattern that was
already removed. Every sentence is idiomatic; nothing in it is grounded. Published measures
of code-model grounding failures put invented interfaces at a substantial and persistent
fraction of all such errors, and the rate is worse in ecosystems with loose, fast-moving
interfaces than in tightly documented ones. A reviewer that cannot be stopped from inventing
its subject produces findings that cost more to triage than they save.

The doctrine below is the set of constraints that make a review's output worth its triage
cost. It applies unchanged to a human reviewer; it is *load-bearing* for an automated one.

## The entitlement rule

The organising principle of the whole subject:

> **A review pass may only conclude what the passes before it confirmed.** A conclusion that
> rests on an unconfirmed premise is not a weak finding — it is not a finding at all.

This is why review is ordered. Not for convenience, not to batch similar work, not because
some checks are cheaper. Ordering exists because findings have *prerequisites*, and a
finding whose prerequisite was never established is speculation wearing the costume of
analysis. A performance finding — "this recalculates every frame and should be cached" —
presupposes that the call site exists, that it is on the frame path, and that the value is
stable enough to cache. If nothing confirmed the call site, the finding is a guess about a
file. Its confidence is unaffected by its groundlessness, which is exactly what makes it
dangerous: it reads identically to a real one.

The entitlement rule has a consequence that reviewers resist: **the honest output of an
ungrounded pass is a refusal, not a reduced-confidence finding.** Lowering confidence on an
invented premise still puts the invention into the report, where someone will spend an hour
on it. Refusal — "I could not confirm the members this subsystem depends on; here is the
inventory I need" — costs one round trip and produces no false work. `four-pass-ordering`
develops the rule; `ground-truth-pass-before-proposals` is the pass that makes it usable.

## Ground truth is a pass, not a preamble

Grounding is not an instruction to "read the code first". Instructions of that shape are
absorbed and ignored by humans and models alike, because nothing checks them. Grounding is a
*pass with an output*: for every entity the review will discuss, the reviewer states its
identity in the codebase, the specific members it depends on, and — the check that cannot
be faked from pattern-matching — **one observable runtime behaviour** of that entity. An
invented class can be given a plausible parent and plausible members. It is much harder to
give it a specific observable behaviour, and much easier to catch when it is attempted.

The pass has exactly two outcomes: confirmed, or a **refusal with a request**. There is no
third branch where the review proceeds anyway on partial grounding, because the partial case
is where the fabrications live.

## The subsystem is the unit, and it carries a memory

Review is scoped per subsystem — character and input, animation and retargeting, the ability
layer, combat, enemy behaviour, inventory, loot, interface, progression, world and streaming,
saving, materials, dialogue and quests, and the cross-cutting polish layer — because *what
usually goes wrong* is subsystem-specific and does not generalise. Inventory subsystems fail
at stack bounds and null definitions; save subsystems fail at synchronous writes and missing
migration paths; interface subsystems fail by polling state that already broadcasts changes.
A generic review finds generic things.

A check set is that subsystem's accumulated memory of its own failures, phrased so a reviewer
can *confirm or refute each entry against the code*. This is the transplantable craft — the
shape of an entry, not any particular list. `per-subsystem-check-sets` covers how to build,
phrase, prune and retire one. The related corpus of engine-level traps a reviewer should be
primed with before they start is a separate subject; a check set is the per-subsystem
projection of it, and the seam between them is scope: the corpus is what the platform does
to everyone, the check set is what this subsystem does to itself.

## One traced interaction outranks fifty checked lines

The single highest-yield check in a subsystem review is not a check at all. It is a **trace
of one representative interaction, end to end, numbered, naming every hop**: what initiates
it, what activates, which branch is actually taken, what is applied, what is read and what is
written, what is broadcast, and who listens. This finds the class of defect no per-file check
can find, because the defects live in the *seams* — the second component quietly keeping its
own copy of a quantity the rest of the system reads from elsewhere, the modifier that is read
by a calculation but written by nothing, the step that cannot be authored from code at all
because it needs a binary artifact nobody has made.

Those are the defects that survive every structural check and every convention check, and
they are the ones that cost weeks. A trace surfaces them in one pass because it forces the
reviewer to *account for continuity*: each step must name the next, and a step that cannot
name its successor is the finding. `trace-one-interaction-end-to-end` gives the procedure.

## Severity is a claim about consequence

A finding's severity states **what happens if it is never fixed** — to the player, or to the
project. Nothing else. Not the category the finding fell into, not the subsystem it came
from, not the tooling's log level, not how confident the reviewer feels, and above all not
how *interesting* the finding is. A convention violation that will corrupt saved progress on
the next schema change outranks a real crash in an editor-only debug path, because the
consequences say so and the categories do not.

The mapping rule and its ladder are in `severity-by-consequence`. Two consequences of it
belong here because they shape the whole report. First, severity and effort are independent
axes and must be reported as two numbers; collapsing them produces a queue sorted by
convenience. Second, a composite health figure that is allowed to read green while a
subsystem's own content is failing judgment is a lie the review told the dashboard — where
two signals about the same subsystem disagree, the disagreement is itself reportable, and it
outranks the average.

## A review that cannot be compared to the last one is not progress

A single scan produces a list. Two scans produce *direction*, which is the only thing anyone
outside the review actually needs. Every current finding is either **new** since the last run
or **persisting**; every prior finding not present now is **resolved**. Three buckets, and
they are the minimum honest report: new means the last change introduced something,
persisting means the team decided not to act or did not get to it, resolved means work
landed.

Two disciplines keep the buckets honest. Findings must be matched between runs by a
**line-insensitive identity**, or a finding that merely shifted down twelve lines reports as
one resolved plus one new, and the report churns without anything having changed. And when
only part of the codebase was re-reviewed, the comparison must be **restricted to the
re-reviewed scope**, or every untouched subsystem reports as resolved — the most flattering
possible false result. `regression-diff-new-persisting-resolved` carries both, plus the
distinction that a finding which disappeared because the code was *deleted* is not the same
as one that was fixed.

## Failure modes of the naive reading

- **Review as summary.** Restating what the subsystem does, in fluent prose, with no
  confirmable claim in it. Reads as thorough; contains nothing anyone can act on or refute.
- **Category-driven severity.** Ranking findings by which bucket they landed in, so every
  memory finding outranks every correctness finding regardless of what either costs.
- **Check-set ritual.** A list that grew for three years and was never pruned, where most
  entries have not fired since they were written. Reviewers stop reading a list they have
  learned is mostly noise, and the entries that matter go down with the ones that do not.
- **Structural sufficiency.** Concluding a subsystem is fine because everything compiles,
  every class exists, and every property is set. Existence proofs are a floor with rungs
  above them, and the canonical embarrassment is a subsystem that passed every structural
  check and did nothing observable at runtime.
- **Self-certification.** Accepting the producing party's own report of its work as the
  verdict. It is an input to a verdict. The verdict comes from a separate observer reading
  real state — and under automation, what was *verified* and what was *asserted* are two
  different numbers, only one of which counts.
- **Reviewing the ambition.** Grading a subsystem generously because it attempted something
  hard, or relative to the other subsystems in the batch. The bar is what ships.

## What this subject is not

It is not rubric construction. Reviewing code and grading a produced artifact are a matched
pair with different objects: a rubric names levels and reference standards for an artifact's
craft, a review procedure names what a reader is entitled to conclude about an implementation.
The two are designed together and must not be conflated — a rubric applied to code produces
grades nobody can act on, and a review procedure applied to an artifact produces findings
about its serialisation.

It is also not gate integrity, not the unattended build loop that may dispatch a review, and
not the design law a subsystem is being reviewed *against* — the real-time semantics a combat
subsystem must obey are their own subject, and this one owns only the method by which someone
checks that they are obeyed. Where a review names a design rule, it is quoting that subject,
not extending it. The subsystem taxonomy here is shared with crash attribution, deliberately:
the same partition that tells a reviewer what to check tells a triager where a failure came
from, and keeping the two partitions identical is worth more than either being optimal alone.
