---
layer: technique
type: technique
subject: hitl-approval
technique: truncated-verdict-space
status: forged
laws:
  - absent-guard-is-loud
  - one-authority-per-vocabulary
shared_with: []
use_when: [deciding whether an automated assessor may ever admit on its own, deciding WHICH verdict to delete when the irreversible direction is refusal rather than admission, a decider and an applier are separate components and only the decider enforces the truncation, a false positive would grant standing at a trust boundary rather than cause a recoverable mistake, a consent gate keeps being misconfigured or clicked through, an outcome type declares a verdict no code path can produce, throughput pressure argues for auto-approving clean assessments]
---

# Truncate the machine's verdict space

The subject's two mirror-image flows both assume the machine has an opinion
worth acting on: review evaluates output the machine produced, consent asks
before the machine acts. There is a third placement that is neither, and it is
easy to mistake for a strict consent gate because it produces the same visible
behaviour. It is not a strict gate. **The automated assessor produces no
positive verdict at all** — its resolution has no reachable branch that admits,
and the only path to a positive outcome is a human decision minted somewhere
else entirely.

## The shape

An assessor runs a pipeline over a candidate — checks, models, coverage of the
things it was supposed to examine — and resolves to one of a small closed set
of outcomes. In the truncated form, every path lands in the negative half:

- a coverage gap, or a stage that could not run, resolves to **error**;
- any finding resolves to **review**;
- and the otherwise-clean case, with full coverage and nothing found, *also*
  resolves to **review**.

There is no fourth arm. A candidate that passes everything the machine can
check has earned an escort to a human, not an admission. The positive outcome
exists only as a decision record naming an exact revision, written by an
authenticated person through the decision surface, and the executor accepts
that record and nothing else.

## Why this is not a strict consent gate

The distinction is the payload, not the strictness, and it is the whole reason
to name this separately. A consent gate is a barrier standing in front of a
positive outcome that exists. Because the outcome exists, three failures reach
it without anyone deciding anything: the gate can be talked past by a machine
that convinces itself it has authority, misconfigured so the barrier is not
mounted on some deployment, or click-throughed by a fatigued human. Every
countermeasure in this subject is aimed at one of those three, and each is a
mitigation of a reachable path.

Truncation deletes the path. **The machine has no expression for yes.** There
is no threshold to relax, no confidence level that crosses over, no default
that degrades to open, and no volume of clean assessments that accumulates into
an admission — which is precisely what
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) demands of a
control whose absence would otherwise be silent. A deployment that misconfigures
this one does not fail open; it fails to a queue. That is a different quality of
guarantee from a well-defended gate, and it is available only where the design
can afford it.

## The decision rule

**Truncate the verdict space when a false positive is an *admission* — standing
at a trust boundary — rather than a recoverable mistake.** The test is what a
wrong yes creates, not how bad one instance of it looks:

- An admission grants a durable position: a published listing that is now
  syndicated, an identity accepted into a federation, a package a fleet will
  install, a credential's first use that establishes precedent. The wrong
  answer does not merely produce a bad artifact; it produces a party that is
  now inside, and the recovery is a revocation with its own blast radius.
- A recoverable mistake produces an artifact that can be corrected in place, by
  the same mechanism that produced it, before anything else has depended on it.

Only the first justifies truncation. The second is a consent-gate problem, and
truncating there is over-engineering that spends human attention on decisions
that should have been reversible instead.

**Accept the cost explicitly, because it is not a tuning parameter.**
Throughput is now bounded by human decisions, permanently and by construction.
No improvement in the assessor's accuracy relieves it; a perfect assessor with
a truncated verdict space produces exactly as much throughput as a mediocre one,
because its output was never the thing that admits. That means capacity planning
for this pipeline is staffing, the severity ladder's auto-approve rung is
unavailable at this boundary by definition, and the batching and
decision-remembering countermeasures against fatigue carry the entire load of
keeping the queue humane. A team that truncates without saying this out loud
discovers it as a backlog and repairs it by quietly adding the fourth arm.

## Which verdict you truncate is not always "yes"

Everything above is written with the admitting verdict as the one deleted,
because that is the common case: the machine may refuse but never let in. The
rule underneath is polarity-free, and reading it as "truncate the positive"
gets a whole class of system backwards.

**Truncate the verdict the system cannot take back.** Ask which direction
creates a party or a state that survives being wrong, and delete *that* one from
the machine's vocabulary:

- Where the durable position is created by letting something *in* — a listing
  that syndicates, an artifact a fleet installs, an identity accepted into a
  federation — the admitting verdict is the one to delete, and the machine's
  refusals can flow freely. A wrongly refused candidate waits; a wrongly
  admitted one is inside.
- Where the durable position is created by shutting something *out* — a subject
  who is never told, never returns, and never learns a decision was made about
  them — the **adverse** verdict is the one to delete, and the machine's
  admissions can flow freely. A wrongly advanced subject meets the next human
  stage anyway; a wrongly excluded one is gone, and in regulated settings the
  exclusion is the decision the law is about.

Both are the same mechanism and they truncate opposite ends. A system that
copies the polarity instead of the rule doubles its human load on the reversible
direction while leaving the irreversible one automated — the exact inversion
this technique exists to prevent, arrived at by imitation.

**Re-derive the gate at the apply boundary, not only at the decision.** Where
the deciding component and the applying component are separate — different
languages, different processes, a queue between them — truncation in the decider
is a claim the applier cannot check, and an upstream regression that starts
emitting the deleted verdict will be applied verbatim. The durable form is a
backstop at the point of effect that re-derives the truncation from the state it
already holds, and downgrades a forbidden verdict to the queue rather than
refusing it silently. Two properties make that backstop honest: it is
independent of the decider's logic rather than a mirror of it, so a shared bug
cannot pass both; and its downgrades are counted, because a non-zero count is
the only evidence that the decider has drifted.

## The honesty rule: mark the dead branch or remove it

The failure this technique invites is not in the runtime; it is in the record.
The outcome vocabulary usually keeps its positive member — the machine's type
still enumerates *passed* — because the label exists downstream, minted by the
human path, and the same vocabulary is shared. So the type declares a member the
resolution can never produce, and both statements claim to define the same
closed set
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

An unreachable positive branch left unmarked makes a deliberate design
indistinguishable from a bug. The next reader — a maintainer, an auditor, an
agent asked to extend the policy — sees an outcome the code claims to support
and finds nothing producing it, and has exactly two readings available: *this is
the design* and *someone deleted the branch by accident*. They will pick one
without evidence, and the cheap pick is to "restore" it.

So: **mark it, or remove it.** Either the positive member carries an explicit
statement at its definition that no automated path mints it and where it comes
from instead, or the assessor's own outcome type is narrowed to the arms it can
actually produce and the wider vocabulary lives only at the boundary that
records human decisions. The second is stronger and not always available; the
first is always available and costs one sentence. What is not acceptable is the
silent version, because the whole guarantee of this technique is a claim about
what the code cannot do, and an unmarked dead branch is that claim with no
witness.

The same honesty belongs on the published side. Where the assessor's policy is
described to the parties it judges, the fact that automatic admission is
disabled is part of the policy, stated as a durable field rather than implied by
the absence of positive results — a party that assumes a clean run will admit
them will read a queue as an outage.

## Decision rules

- Ask what a wrong yes creates. If it is standing at a trust boundary, remove
  the machine's positive arm; if it is a correctable artifact, use a consent
  gate and keep the arm.
- Resolve coverage gaps and stage failures to a distinguishable error outcome
  rather than folding them into the review arm — an assessment that could not
  run is not an assessment that found nothing.
- Route the clean case to review by the same explicit branch as the
  findings case, with its own reason code, so the record says *no automatic
  admission is available here* rather than *nothing was found*.
- Mint the positive label only from a decision record naming an exact revision,
  and have the executor verify that record rather than any assessor output.
- Mark the unreachable positive member at its definition or narrow the type.
  Never leave it bare.
- State the throughput consequence at design time and staff for it; do not
  discover it as a queue.

## When not to use it

Anywhere the wrong yes is cheap to undo, truncation is a tax on people with no
compensating safety. It is also the wrong instrument when the real problem is
that nobody can tell whether an item is correct: a queue of unverifiable items
routed to humans by an assessor with no positive arm produces rubber-stamping at
maximum volume — see oracle-before-gate, which is the prior question. Truncation
answers *may the machine admit*; it does not answer *can the reviewer tell*, and
a system that truncates without an oracle has moved the failure rather than
removed it.
