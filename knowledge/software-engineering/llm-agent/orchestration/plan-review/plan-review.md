---
layer: golden-path
type: golden-path
subject: plan-review
status: forged
use_when: [a person is about to approve a plan an agent wrote, plan approvals are running at near a hundred percent, deciding what a reviewer is shown before authorship begins, an agent is asked to critique its own proposal]
techniques:
  - decision-sized-slicing
  - silent-decision-surfacing
  - objection-before-artifacts
  - fresh-posture-self-challenge
  - informational-fold-in
---

# Plan review

A plan an agent produced arrives whole. It is coherent, internally consistent,
correctly formatted, and it was written faster than the reader can construct an
alternative to it. Acceptance is therefore the cheapest available action, and it
stays the cheapest action every time, which is how a gate that fires correctly on
every plan ends up deciding nothing. This subject owns the artifacts that make the
plan gate a decision rather than a ratification: the size the plan is allowed to
arrive at, the objections it must survive, the decisions it made without saying so,
and the order those are put to a person — each produced by a reader that is not the
author and cannot write its own verdict.

The mechanism this subject serves is not its own. The pause, the durable pending
state, the surface the human answers on, the record of what they answered and the
continuation afterwards all belong to
[hitl-approval](../hitl-approval/hitl-approval.md), and are assumed here entire. That
subject states that the human decides on the real thing — the actual content, not a
summary produced by the gated party — and then stops, because for most gated actions
the real thing is obvious: the diff, the message, the amount. For a plan it is not.
A plan's real content is mostly what was *not* written down, and a reader handed only
what the plan says is being handed the summary again, in a longer form. This subject
answers the question that leaves open: **what is on the surface, in what order, and
who produced each part.**

## The boundary, against neighbours that own the adjacent halves

`hitl-approval` owns the gate; this subject owns the gate's payload. If the question
is *when does the machine stop and how is the verdict recorded*, it is that subject's,
including trigger predicates, pending-state durability, decision-record shape,
fatigue countermeasures and the unattended opt-out. If the question is *what does the
person read when it stops at a plan*, it is this one's. The seam is clean because
nothing here produces a verdict: every technique in this subject emits a record with
`pending` dispositions and no authority to change them.

[machine-paced-delivery](../../../engineering-process/continuous-integration/machine-paced-delivery/machine-paced-delivery.md)
and its `human-gate-capacity` own the *rate* at which verdicts are demanded and
whether a person can meet it, measured at the merge gate. Its remedy — send fewer
changes, because there is no purchase that makes a person read faster — is the same
economic argument that produces slicing here, applied one stage earlier. Merge-gate
arrival is not this subject's; plan-gate arrival is. The two are separately overloaded
and separately measured, and a team that fixes one and reports the other as healthy
has moved the queue rather than shortened it. Its sibling `proposal-not-push` owns the
classes of change an agent may not author at all; this subject reviews plans and never
decides what may be delegated.

[agent-chaining](../agent-chaining/agent-chaining.md) owns the transport: the payload
contract that carries a record from the reader that produced it to the dispatcher that
persists it, the identity that threads them, the typed stop when a stage declines to
fire. The *shape* of these records is this subject's; their carriage is not.
[remediation-handoff](../remediation-handoff/remediation-handoff.md) sits on the other
side of the same line in time — it packages findings into work for a coding agent
after the plan is settled, where this subject operates before authorship begins.
Nothing here scores anything, which keeps it clear of
[judgment-guardbands](../../evaluation-and-cost/judgment-guardbands/judgment-guardbands.md):
every output is a record a person disposes, never a number that ranks. And where a
surfaced decision turns out to be a standing convention rather than a one-off choice,
it routes to the repository's standing instruction file, which
[agent-instruction-files](../../prompt-and-context/agent-instruction-files/agent-instruction-files.md)
owns — this subject says which items qualify for that route and nothing about the file.

## Coherence is the trap, and reading harder is not the remedy

The cost of disagreeing with a proposal rises with its size and its internal
consistency. Disagreement means holding a counterfactual in working memory against a
finished structure, and a plan that hangs together denies the reader the seams where a
counterfactual could attach. This is why "review the plan carefully" fails as an
instruction: it asks the reader to supply, unaided and under time pressure, the
alternative the author had hours and a machine to avoid producing. The reviewer who
cannot construct one does not therefore conclude the plan is right. They conclude
nothing, and approve.

The remedy is structural and it operates before the plan exists: **bound what arrives
at the gate to a size at which a counterfactual can be held**. One material decision
per unit, each unit complete end to end, each dispositioned separately. That is
[decision-sized-slicing](./techniques/decision-sized-slicing.md), and its position in
the pipeline is the whole of its argument — slicing after a plan is written means
unwinding a framing already committed to, against pushback that arrives on behalf of
finished work.

## A single reader reviewing its own plan is refining it

An agent asked to critique the plan it just wrote anchors on that plan. The measured
picture is consistent and unflattering: models repair an error reliably once its
location is supplied and find that location unreliably in their own output; asked to
reconsider, they revise toward whatever the challenge implies rather than toward the
evidence; and a review run in a genuinely separate context outperforms the same model
told mid-session to switch roles. The finding that matters for design is the last one,
because it prices the cheap option honestly rather than removing it: the in-context
posture switch is a *degraded* instrument, not an equivalent one, and a design that
uses it should know which rung of the ladder it is standing on
([fresh-posture-self-challenge](./techniques/fresh-posture-self-challenge.md)).

Separation alone is not enough either, because a separate reader with no charter
produces a general critique, and a general critique is a list the reviewer dismisses
in two minutes. The charters are distinct enough that bundling them softens each:
*refuse coherence at the wrong scale* is a different job from *find what is wrong* is
a different job from *find what was chosen without anyone noticing a choice was
available*. A reader asked to do all three does the first thing it finds and stops.

## Two record classes, and a routing rule that is not a judgment call

Two of the readers emit records, and the difference between them is not severity — it
is what is lost if the finding is dropped:

- A finding belongs in the **decision record** if removing it would leave a decision
  unrecorded but no class of failure undetected.
- It belongs in the **objection record** if removing it would leave a class of failures
  undetected.
- If both, it is an objection; failures dominate for routing, because an unrecorded
  decision costs understanding later and an undetected failure costs an incident.
- If neither, it is dropped, and dropping it is the correct outcome rather than a
  reader underperforming.

Both readers apply the same rule before emitting, which is what keeps the two records
from becoming one record with two headings. The rule is deterministic on purpose:
routing decided per finding by whichever reader saw it first produces a corpus whose
two halves cannot be read separately, and reading each half's disposition distribution
is where most of the value of keeping records at all turns up.

## Pending items block at different stages, keyed to what the item is

The placement rule follows from the routing rule, and it is stated here rather than as
a trigger predicate next door, because it keys on the class of the record rather than
on the consequence of the action — and the record classes are this subject's.

**An untriaged risk blocks the plan. A captured decision blocks the merge.** An
objection whose disposition is still `pending` means nobody has decided whether a named
class of failure is acceptable, and advancing past it converts a question into a
default answer. A surfaced decision whose disposition is still `pending` means the plan
committed to something silently and nobody has said whether that was right; the work
can proceed, because the decision is already made either way, but it may not merge
carrying an unacknowledged commitment. Slices sit with the objections: an
undispositioned slice boundary means the plan gate has not yet been told what it is
reviewing.

This is a claim about the *records*, and `hitl-approval` remains the authority on how
a pending item is stored, surfaced and resolved. What this subject adds is that the
record's class is a legitimate input to a trigger predicate alongside the action's
consequence.

## Three disposition vocabularies, one authority each

Objections are `accepted` / `rejected` / `deferred`. Surfaced decisions are `accepted`
/ `revisit` / `promoted`. Slices are `accepted` / `merged` / `dropped` / `revised`.
Three closed sets rather than one, and this does not violate
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary) — that
law forbids two hand-maintained definitions of *one* vocabulary, not three vocabularies
for three record classes. The stances genuinely differ. Rejecting an objection is an
act of judgment about a risk; dropping a slice is an act of judgment about a boundary;
and collapsing them into one table forces every consumer to know which subset applies
where, which is the drift the law exists to prevent, arriving by the other road.

Two rules keep the three honest. Each set is **declared once**, in one place, and the
record class names which set it draws from — a record that emits a token outside its
declared set is malformed, not lenient. And `accepted` means the same act in all three:
*the person takes the item as it stands*. That token is shared deliberately and with
identical semantics; any other token appearing in two sets with different meanings is
the actual violation.

Rationale is mandatory on every disposition of an objection, and the reason the rule
inverts there rather than following the general "why is optional on approval" belongs
to [decision-records](../hitl-approval/techniques/decision-records.md), which owns the
inverted reading of an objection record's distribution. Cite it; this subject does not
restate it.

## What the readers may never do

Every reader in this subject is read-only, and the constraint is structural rather than
instructed: it is granted no tool that writes, and its output is a record whose
dispositions are all `pending`. A person opening the record writes the disposition. The
authority separation is `hitl-approval`'s — the identity that produces the work is not
the identity that approves it — and applies unchanged here with one extra edge: the
reader is not the author *either*, so it holds neither authority. It informs,
challenges and surfaces. It never fixes, writes, merges or decides.

Three specific prohibitions follow, and each is a real temptation:

- **No reader produces a number that ranks.** A severity label routes attention; a score
  invites the reviewer to disposition by threshold, which is the ratification this whole
  subject exists to prevent, wearing an instrument's clothes.
- **No reader scores the person.** Counts of what was decided are legitimate and belong
  to the capacity measure next door, which already carries the rule that at the
  one-person floor they are counted and never scored. Nothing here persists an
  assessment of the reviewer.
- **No advisory number becomes a gate by accretion.** A derived figure may fold into an
  existing gate as an informational field, and the moment it acquires a verdict or a
  keypress it has become a gate nobody designed
  ([informational-fold-in](./techniques/informational-fold-in.md)).

## Failure modes of the naive reading

- **One reader, all charters.** Produces a general critique that is long, unranked and
  dismissed as a block. Charter separation is the mechanism, not a staffing preference.
- **Objections without anchors.** A reader that wins by volume produces a list the human
  clears in two minutes, and the clearing is the review failing. An objection with no
  quotable anchor in the plan is inadmissible.
- **Padding to a count.** A reader told to emit five to eight items emits eight, and the
  three weakest ones mask the strongest. A hard cap with a soft floor, plus a reserved
  way to say *this ran and found nothing*, is the shape that survives
  ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)): an empty
  list and a reader that never ran must be spelled differently.
- **Slicing after the plan.** Reframes as a critique of finished work, which activates
  every sunk-cost pressure the technique exists to avoid, in both the human and the
  machine.
- **A rich record of decisions the author knew they were making.** A plan can carry
  excellent explicit rationale and still carry the whole of this debt, because the
  decisions that go unrecorded are exactly the ones the author did not notice making.
- **Reading the objection record like an action record.** Objections mostly rejected
  with substantive rationale is health, not a defect upstream. The inverted reading is
  next door and it is not optional.

## What this subject cannot do

None of it makes the reviewer's judgment better. It makes the reviewer's judgment
*possible* by bounding what they must hold and separating the questions they must
answer, and that is a smaller claim than it looks. A pipeline running every reader here
still approves a wrong plan when the person disposes without engaging — and every
signal in the records will look healthy while it happens, because dispositions are
being written and rationale is being typed. The one instrument that catches it is
reading a handful of records beside the plans they were raised against, by hand, and
this subject has no mechanization for that and should not claim one.

## The techniques

- [decision-sized-slicing](./techniques/decision-sized-slicing.md) — bounding the unit
  before a plan exists: the lens priority, the inseparability case that must argue
  rather than assert, and the four-value disposition that keeps *fold this in* distinct
  from *throw this away*.
- [silent-decision-surfacing](./techniques/silent-decision-surfacing.md) — the decisions
  a plan committed to without naming them, emitted as stories a person disposes; why an
  author-written rationale record is absent exactly where this is needed; the aggregate
  readings.
- [objection-before-artifacts](./techniques/objection-before-artifacts.md) — the
  chartered disagreement, raised while a premise-level objection is still cheap; the
  admissibility rule, the closed category set, the two modes and the hard gate.
- [fresh-posture-self-challenge](./techniques/fresh-posture-self-challenge.md) — the
  cheap rung: one reader, two postures, an explicit boundary; the retained challenge
  notes, the reserved sentinel, and the escalation ladder with its observable trigger.
- [informational-fold-in](./techniques/informational-fold-in.md) — a derived number
  landing in an existing gate as a field and never as a verdict; durability tracking
  confidence; degrading to unavailable rather than to a value.
