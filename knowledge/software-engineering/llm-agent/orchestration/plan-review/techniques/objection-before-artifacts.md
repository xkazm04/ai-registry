---
layer: technique
type: technique
subject: plan-review
technique: objection-before-artifacts
status: forged
laws: [gate-sees-target, failure-not-empty-success, silent-state-is-ungoverned]
shared_with: []
use_when: [a plan is about to be approved and nobody has argued against it, premise-level problems keep surfacing after the code is written, designing what a chartered critic is allowed to raise, an objection list is long and gets cleared in two minutes]
---

# Objection before artifacts

A reader chartered to disagree raises the strongest evidence-grounded objections to a
plan **before any implementation artifact exists**, and raises a second, differently
chartered set against the finished change before it integrates. The timing is the
technique. Everything else is admissibility rules that keep the timing from being wasted.

## Why the timing carries the whole argument

A premise-level objection costs almost nothing against a plan. Against a branch with
tests and an implementation it costs the tests and the implementation, and the person
weighing it knows that while they weigh it. Sunk cost is not a human failing that
discipline removes; it is the correct local reading of a real expenditure, and it
applies to the agent that wrote the code as much as to the person reading it. So the
objection either arrives while the premise is still cheap to change, or it arrives as a
proposal to throw work away and is disposed accordingly.

This is also why a plan-time objection cannot be deferred to the change-time pass "if it
still matters". By then it is a different objection with a different price, and the
record will show it accepted at a lower rate for reasons that have nothing to do with
its merit.

## Admissibility: an objection needs an anchor

**An objection with no quotable anchor in the plan is inadmissible and is not emitted.**
The reader wins nothing by volume. A list of plausible general concerns is cleared by a
reviewer in two minutes, and that clearing is the review failing — not because the
reviewer was careless but because nothing in the list was checkable against the artifact
in front of them. An anchor makes the objection falsifiable: the reviewer can read the
quoted span and see whether the objection lands.

The corollary is that a reader which cannot find an anchor for a real intuition should
say so as a low-confidence note rather than manufacture one. A fabricated anchor is
worse than a missing objection, because it spends the reviewer's trust in the whole
record to buy one item.

## The closed category set

Six categories, closed, and the closure is what makes the record readable in aggregate:

- **Premise** — the plan is solving the wrong problem, or a problem that is not the one
  stated. Only available at plan time, which is most of the argument for running at plan
  time at all.
- **Design** — the approach will not do what it claims.
- **Threat** — an adversary or an untrusted input reaches something it should not.
- **Failure** — a runtime condition the plan does not survive.
- **Operational** — it works and cannot be run, deployed, observed, or reversed.
- **Cost** — the resource consequence is materially different from what the plan implies.

A finding that fits none of these is either a surfaced decision (route it to the decision
record) or noise. A reader permitted to open categories will, and the aggregate reading
below stops working the moment the category set is a free-text field.

## Two modes, two charters

**Plan time** — premises, framing, and the alternatives that were foreclosed. This mode
may object to the existence of the task.

**Change time** — the risks the realized change carries that the plan could not have
shown: what the implementation actually touches, what the diff exposes, what the
operational surface became. This mode may not re-litigate the premise, because the
premise was dispositioned and re-opening it here is the sunk-cost fight the plan-time
mode existed to avoid. If the premise is genuinely wrong and only now visible, that is
an escalation to the person, not an objection in the record — and it is rare enough that
treating it as routine corrupts the mode.

The cross-mode signal is the pair's most valuable output: **change-time objection counts
trending upward, particularly in the premise-adjacent categories, says the plan-time
charter is too loose.** Problems that should have been cheap are being found expensive.
Tighten the plan-time charter or widen what the plan-time reader is shown; do not tune
the change-time reader, which is doing its job by catching them at all.

## The hard gate

**The pipeline does not advance while any objection disposition is `pending`.** Not a
warning, not a summary count, not a soft prompt. An untriaged risk that advances has had
its question answered by default, and the default is "acceptable" — which is a verdict
nobody wrote. The gate lives where the pipeline advances, not in the reader's output and
not in an instruction to the agent, because a gate the gated party can open is a
decoration ([gate-sees-target](../../../../_laws.md#gate-sees-target)). The check reads
the persisted record, not a claim carried in a message.

The disposition set is `accepted` / `rejected` / `deferred`, and **rationale is mandatory
on every one of them**. "Rejected — already covered by the constraint on the input path"
is a decision. "Looks fine" is a keypress. A blank disposition is indistinguishable from
a considered one at read time, which is exactly the property that lets a rubber stamp
survive an audit. `deferred` additionally carries the condition under which it returns;
without one it is a rejection that avoided saying so.

Why the rationale rule inverts here relative to the general "why is optional on
approval" — and how to read the disposition distribution once it exists — belongs to the
decision-record technique next door, which owns the inverted reading. This technique
produces the records; it does not restate how to read them.

## Silence must be spelled

A run that produced no admissible objections emits a reserved, explicit statement to
that effect, never an empty list. The distinction between *the challenger ran and found
nothing* and *the challenger did not run* is the difference between a plan with
evidence behind it and a plan with a broken pipeline behind it, and both render as
zero objections on any surface that does not insist on the difference
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). The
reader's own assessment of the plan is otherwise private state governing an advance
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).

Consistently empty across many plans is not, by itself, a defect. It has two causes with
opposite remedies — strong plans, or a challenger that is not challenging — and the only
instrument that separates them is reading a few records beside their plans by hand.

## When not to use it

- **On work with no premise to object to.** A fully specified mechanical change gives
  the plan-time mode nothing but design objections it cannot ground, and a reader
  producing hollow items teaches the reviewer to skim the record on the plans where it
  matters.
- **When the disposition cannot be blocked on.** Without the hard gate this is an
  advisory list, and advisory lists next to finished plans are read at the rate their
  authority earns, which is none.
- **As a scoring instrument.** Objection counts do not rank plans, authors, or agents.
  The moment they do, plans get written to minimize objectionable surface, which is
  achieved by saying less — and the decision record next door then goes quiet too.

## What this cannot do

The reader objects to what the plan says. It cannot object to what the plan omits unless
the omission is visible in the text, and the most expensive premise errors are usually
omissions — the constraint nobody wrote down, the stakeholder nobody consulted. It also
cannot tell a strong objection from a well-argued wrong one; that judgment is the
person's, and the record's only contribution is to make sure they were asked while
answering was still cheap.
