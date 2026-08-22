---
layer: technique
type: technique
subject: hitl-approval
technique: unattended-mode
status: forged
laws: [gate-sees-target, creation-names-reaper, count-carries-predicate]
shared_with: []
use_when: [granting auto-approval for a bounded overnight run, preventing a grant from swallowing irreversible deletions, re-arming gates when spend velocity breaks profile]
---

# Unattended mode

Sometimes the operator legitimately wants the machine to run without asking:
the overnight batch, the bulk migration, the pipeline that has earned its
track record, the demo that must not stall on a modal. Unattended mode is the
**honest form of that trust** — an explicit, scoped, expiring, audited grant
of auto-approval — and it exists because the dishonest form is always
available: an operator who cannot get a sanctioned opt-out will manufacture
one by approving reflexively, and reflexive approval corrupts the audit trail
while a sanctioned grant preserves it. Offering unattended mode is not a
weakening of the gate discipline; it is the discipline extended to cover the
case where gating is genuinely not wanted.

## Through the gate, not around it

The single most important design decision: unattended mode is **a policy that
answers at the gate, not a bypass that skips it**. The action still arrives
at the checkpoint; the checkpoint still evaluates the trigger; the pending
question is still formed — and then the standing grant answers it, recording
an auto-approval attributed to the grant. Nothing anywhere calls the action
directly because "we're unattended tonight".

Everything valuable follows from routing through rather than around:

- **Disabling is instant and total.** Revoke the grant and the very next
  action finds a silent gate and asks a human. A bypass, by contrast, is a
  second code path whose removal is a change, a deploy, a risk.
- **The audit trail is uniform.** Attended and unattended runs produce the
  same records with different deciders; nothing that ran is invisible.
- **The gate keeps seeing its target**
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)) — triggers keep
  firing and being measured even while auto-answered, so the operator can
  later ask "what *would* have asked me?" and get a real answer.

## The grant is scoped, never total

"Run everything unattended" is not a grant; it is the mechanism's deletion
with extra steps. A grant names:

- **Which actions** — the classes or gates it answers for, enumerated. The
  four mandatory-gate categories deserve individual mention: a grant covering
  routine spend under a ceiling is sane; a grant that silently swallows
  irreversible deletions was almost certainly not what the operator meant,
  and the grant surface should make that scope impossible to enable by
  accident.
- **Which agents or processes** — trust is per track record, and track
  records belong to actors, not to the fleet.
- **Ceilings** — per-action and cumulative bounds in units of consequence:
  total spend, item counts, blast radius. A grant with ceilings converts
  "trust the machine tonight" into "trust the machine tonight *up to this
  much*", which is what the operator actually meant.

## An inferred scope is not an enumerated one

The scope above is a **list**: action classes, agents, ceilings, all written
down before the run. The tempting substitute, especially when unattended
becomes a product's default rather than an operator's deliberate grant, is to
enumerate nothing and let a model decide at action time whether each step is
consequential enough to ask about. “Auto-approve everything unless it looks
harmful” is a grant whose scope is a judgment, and it differs from an
enumerated grant in three ways that all matter at once.

- **It cannot be read before it runs.** An enumerated scope tells the operator
  what they are agreeing to; an inferred one can only be discovered by
  observing what it did, which is the review they were trying to avoid.
- **Its failures are silent in the direction that hurts.** A classifier that
  wrongly asks costs one interruption. A classifier that wrongly proceeds
  spends, sends or deletes — and produces a record showing an auto-approval
  that looked exactly like every correct one.
- **It has no stable predicate**, so the retrospective counts stop meaning
  one thing across runs: “42 auto-approved” under an enumerated grant is 42
  actions of known classes, and under an inferred one it is 42 actions the
  classifier felt fine about that day
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

The resolution is not to refuse the classifier — it is genuinely useful for the
long tail an enumeration cannot anticipate. It is to keep it **subordinate to
the list**: the mandatory-gate categories stay enumerated and always ask, the
classifier operates only inside the classes the grant already covers, and its
verdict is recorded as a distinct decider so that “auto-approved by enumerated
scope” and “auto-approved by judgment” are separable in the morning. A
classifier that can override the enumeration is not a scope refinement; it is
the enumeration deleted, with a plausible-sounding step in front of it.

## The grant expires

A standing grant is created state and names its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). Time-boxing
is the default posture — tonight, this run, this week — because trust
extended for a purpose should end with the purpose. A permanent grant is a
different, heavier decision (a configuration default, deliberately made and
separately visible), never the quiet residue of a temporary one that nobody
turned off. The expiry event itself is safe: gates re-arm and ask; nothing
mid-flight is killed, it simply waits like any pending item.

## Ungated is not unrecorded

Every action taken under the grant is recorded **as if it had been reviewed**
— the same decision record, decider = the grant, plus the disclosure that
*would* have been shown. This produces the retrospective review surface: the
morning after, the operator reads what ran, with counts that carry their
predicates ("42 auto-approved under grant G, of which 3 exceeded half their
ceiling" — [count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
and either ratifies the night's work with a glance or finds the surprise
while it is one night old. Retrospective review is unattended mode's half of
the fatigue bargain: attention is not eliminated, it is *moved* to a batched,
scheduled, cheaper position.

## Some flows are deleted by a grant, not accelerated by one

Every scope rule above assumes the gate is a **tax** on a flow that would rather proceed:
the action is what the operator wants, the pause is the cost of assurance, and a grant
buys the flow back. For most flows that is exactly right.

It is wrong for a flow whose **product is the human's answer**. An elicitation round, a
design review, a structural proposal, a plan the machine has drafted and cannot evaluate
— in these the pause is not overhead wrapped around the work, it *is* the work. The
machine has produced a question precisely because the answer is not derivable from
anything it holds.

Auto-approving such a flow does not make it faster. It makes it **finish**, having
produced whatever the machine would have chosen unaided, wearing a record that says a
decision was made. That record is worse than no record: a run with a gate that was never
reached looks, in every retrospective surface this technique builds, exactly like a run
whose gates were answered.

The consequences for the grant:

- **A grant covers actions, never questions.** If a gate's pending state carries a
  question whose answer the machine cannot derive, that gate is outside every grant's
  scope by construction, and the grant surface should make covering it impossible rather
  than merely unlikely — the same posture the enumerated scope takes toward irreversible
  deletions.
- **The flow states its own requirement.** The gate declares that it is answer-bearing;
  the grant honours the declaration. Leaving it to the grant's author to remember which
  flows are which is a rule that holds until the day somebody grants broadly in a hurry,
  which is the day it matters.
- **An operator who wants such a flow to run unattended wants a different flow.** The
  honest options are to defer it (queue the question for a batch later), to answer it
  in advance (supply the decision as an input, which is a real answer and is recorded as
  one), or to accept a machine-chosen default that is *labelled as machine-chosen* in the
  output. All three are legitimate. What is not legitimate is a default that is
  indistinguishable from a human's answer.

The general form is worth stating because it recurs wherever a human step is
automated away: **before removing a wait, establish whether the wait was carrying
anything.** A wait that guards an action can be granted away with ceilings and an audit
trail. A wait that carries information cannot be granted away at all — it can only be
moved, and moving it means somebody still answers.

## The circuit breaker

A grant states the conditions of its own suspension. Anomaly re-arms the
gates mid-grant: error rates above threshold, spend velocity out of profile,
an action class outside the enumerated scope, a ceiling reached. The breaker
resolves to *pending*, not to silent failure — the machine stops auto-
proceeding and starts asking again, and the queue explains why ("grant G
suspended: cumulative spend ceiling reached"). An unattended run that hits
its breaker and stalls until morning is the mechanism succeeding, not
failing; the alternative — a grant that keeps answering yes while the error
rate climbs — is the one outcome the operator would never have approved of
in person, being approved in their name all night.
