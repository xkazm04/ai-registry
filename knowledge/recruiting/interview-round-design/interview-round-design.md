---
layer: golden-path
type: golden-path
subject: interview-round-design
status: forged
use_when: [designing or trimming an interview loop for a role, deciding whether a proposed extra conversation earns its place, choosing which rounds a machine may conduct, deciding what happens to candidates who are not advanced between rounds]
techniques:
  - one-round-one-purpose
  - round-mode-selection-machine-human-or-hybrid
  - phase-to-competency-mapping
  - cohort-reducer-between-rounds
  - shared-material-for-comparability
  - not-advanced-is-a-recordable-outcome
---

# Interview round design

Round design answers three questions before anyone schedules anything: **how many
conversations does this hire need, what is each one uniquely allowed to decide, and
how does the field narrow between them.** It is an allocation problem, not a
scheduling problem. The scheduling problem — invitations, slots, reminders,
no-shows — is real and downstream; teams that start there end up with a loop whose
shape was decided by whoever had calendar availability.

The naive reading is that more conversation is more signal, so a serious process has
many rounds and a casual one has few. This is wrong in both directions at once. It is
wrong about signal, because interview validity plateaus early: past roughly two
well-designed structured conversations, additional rounds move the hire/no-hire
verdict very little, and the published analyses that put numbers on it land in the
same place — a panel of about four independent assessments reaches the same decision
as a larger one the overwhelming majority of the time, with each further assessor
adding change on the order of a percentage point. And it is wrong about cost, because
the cost of an extra round is not an hour of interviewer time. It is paid by the
candidate, in waiting, and the interview stage is where candidates leave: it is
consistently the single largest withdrawal point in the funnel, and "too many rounds"
sits at the top of the stated reasons alongside scheduling latency. A fifth round does
not buy you a better decision; it buys you a worse-composed final pool, because the
people with other offers are the ones who leave first.

So the governing constraint is stated as a rule, not a preference: **a round is
justified only by naming a judgment that no earlier round was able to make.** If you
cannot state that judgment in one sentence, the round is redundant and its removal
costs you nothing you can measure. Loop design is subtraction under a signal floor,
not addition under a thoroughness instinct.

## A round is a unit of judgment, not a unit of time

The load-bearing definition: a round is one *bounded assessment activity* that
produces one *comparable record* and ends in an *advance decision*. Three consequences
that teams routinely miss:

- **A conversation and the scoring of that conversation are different rounds** — or
  more precisely, different steps in the pipeline. A scoring pass is a distinct thing
  the process does, a distinct thing a human ratifies, and a real place a candidate
  waits. Folding it into the interview as an invisible property hides the wait from
  the board, hides the ratification from the audit trail, and makes it impossible to
  say how long candidates sit between "we spoke" and "we decided".
- **Two conversations are two rounds even when they happen the same afternoon.** The
  test is whether they produce separately-recorded judgments, not whether they share a
  calendar block. One step runs one activity; a second conversation is a second
  column.
- **The loop's shape must be a decision somebody made, not a shape that emerged.**
  Nothing structural prevents a team from stacking two conversations behind one
  stage and calling it one round; it happens because nothing stopped it, and the
  result is a second assessment that no board draws, no candidate can be told they
  are standing on, and no metric can measure. When a hidden second round is made
  explicit, the loop's behaviour genuinely changes — a handoff that used to fire
  invisibly now has to be chosen — and that is the point: a loop shape should be a
  visible decision, and a default should not quietly enable a round.
- **A round with no advance decision is not a round.** If everyone who enters leaves
  in the same state, you have run an information session, which may be worth doing —
  and should be named as such rather than dressed as assessment.

How those steps are then modelled as a board — stage roles, ordering, what a column
means, how a team renames it without changing what the rules key off — belongs to the
pipeline-stage-modelling subject. Round design decides *what the steps are and why*;
stage modelling decides how the process represents them. When the two disagree, the
usual cause is a loop whose rounds were never designed, so the board grew columns to
match whatever meetings people were already holding.

The minute-by-minute internals of a single conversation — the opening, the timings,
the closing, who speaks when — are a different craft, and the sibling subject on the
run of show owns it. Round design stops at the boundary of the round; run-of-show
starts inside it. Likewise the rubric that turns observation into a rating belongs to
the scorecards subject; round design decides *which competencies a given round is
allowed to rate at all*, and hands the rating instrument itself to that neighbour.

## Purpose exclusivity: the anti-redundancy rule

The most common defect in a real loop is not length; it is **overlap**. Four rounds
that each ask "tell me about a hard problem you solved" are one round run four times,
at four times the cost, producing four correlated readings that a debrief will then
mistake for convergence. Correlated signal feels like confirmation and is not.

Purpose exclusivity means each round owns a set of competencies and the other rounds
do not touch them. Two disciplines make it real:

1. **Every competency in the role's assessment plan is assigned to exactly one round**
   as its owner, and every round can enumerate what it owns. A competency owned by
   nobody is the gap that surfaces at offer time as a vague misgiving. A competency
   owned by everybody is the redundancy above.
2. **Deliberate re-testing is allowed but must be declared.** Sometimes you genuinely
   want a second, independent read on the one competency that decides the role. That
   is a *replication*, it is designed in, and it comes with the requirement that the
   two reads are independent — different assessor, no access to the first rating
   before recording the second. An undeclared re-test is just overlap; a declared one
   is a design choice with a cost you accepted.

Independence is the part that quietly breaks. When a later interviewer reads the
earlier scorecard before the conversation, the second reading is anchored to the first
and the loop has spent a round to buy a confirmation. The standard is: assessments are
recorded before they are compared; the material that carries *forward* between rounds
is the plan for what to probe next, not the previous verdict.

## The loop narrows: the cohort reducer

Between any two rounds sits a **reducer** — the rule that decides who continues. It is
part of the design, not an administrative afterthought, and it has to be written down
before the first candidate is seen. A reducer has three properties:

- **A stated basis.** A threshold on a recorded score, a shortlist of a fixed size, a
  named human's selection, or an explicit combination. "The hiring manager will look at
  them" is a basis; "we'll see" is not.
- **A stated ratio or floor.** Round design without an expected narrowing is a funnel
  drawn as a cylinder. If your later rounds are the expensive human ones, the earlier
  reducer is what makes the loop affordable — and if the reducer never actually reduces,
  the round before it was decorative.
- **An actor.** Every consequential decision names who or what made it, per
  [every-decision-names-its-actor](../_laws.md#every-decision-names-its-actor). The
  reducer is consequential by construction: it is the moment a candidacy ends for most
  of the people in it.

The reducer is also where the loop's fairness properties concentrate, because a
narrowing rule applied to a cohort is exactly the object a selection-rate analysis
looks at. That analysis belongs to the adverse-impact subject; what round design owes
it is a reducer that is *legible* — a rule that can be stated, replayed against the
recorded scores, and shown to have been applied to everyone the same way.

## Mode: what a machine round may and may not decide

A round can be conducted by a machine, by a human, or by a human with machine
assistance, and this is a design decision per round rather than a stance about the
process. The allocation that survives contact with reality:

- **Machine-conducted rounds are for breadth and consistency at the top of the loop.**
  They ask everyone the same things, they scale to a cohort no team could interview,
  and they are unusually good at the thing humans are worst at — asking the same
  question the same way to the hundredth candidate as to the first.
- **Human rounds are for judgments that require a human counterparty**: what it is
  like to work with this person, whether the team's actual problems interest them,
  anything the candidate is entitled to negotiate, and every judgment whose adverse
  version ends the candidacy.
- **Hybrid rounds** — a human conversation with machine-prepared probes, or a machine
  conversation a human reviews before it counts — are the right default for the middle
  of the loop, and the honest answer when a machine can gather but not conclude.

Two hard limits sit on machine rounds. First, no adverse outcome is solely automated:
a machine round may produce advance or hold, and a recommendation of reject parks at a
human gate, per
[no-adverse-outcome-is-solely-automated](../_laws.md#no-adverse-outcome-is-solely-automated).
Second, a machine round's output is a *record of what was said*, and the judgments it
supports are bounded by that; a conversation yields evidence, and only a demonstration
yields proof. Whether a given machine interviewer is safe enough to occupy a round at
all is a separate discipline — the validation subject owns proving it, and the brief
authoring subject owns instructing it. Round design owns only the question of *which
seat* it may take in the loop.

## Comparability is a property of the loop, not of the interview

Ratings from a round are usable only if they were produced against the same stimulus,
and that decides an otherwise attractive feature: personalising the questions to each
candidate. Personalisation genuinely gets better answers — but landed on the phases
whose ratings are compared across a cohort, it destroys the comparison. Two candidates
rated on the same axis after being handed different problems were not rated on the same
axis.

The resolution is structural rather than a matter of restraint: **split the round into
shared phases and personal phases.** Shared phases carry identical material and feed
the cross-cohort competencies; personal phases carry candidate-specific probes and feed
judgments that are inherently individual. Candidate-specific questions ride only the
personal phases. Without that one rule the rating apparatus quietly becomes a
per-candidate instrument producing numbers nobody may compare.

The same rule governs the *brief* a round runs from, which must be adequate to the
judgment asked of it: an early-career résumé cannot carry an evaluation, because there
is not enough recorded history in it to ground one — which is why an early-career loop
leans on shared work material and a designed conversation while an experienced-hire loop
can lean harder on the record. Asking a round to judge from material that cannot support
the judgment is the second-most-common loop defect after redundancy, and the one that
produces confident, groundless verdicts.

## "Not advanced" is an outcome, and it happens more than rejection does

The reducer between rounds produces, for most of the cohort, an event that is not a
rejection but ends the candidacy in practice: *not advanced to the next round*. When a
machine round precedes a human one, this becomes the highest-volume consequential
event in the whole process — and it is the one most likely to be unrecorded, because
nothing "happened": no letter went out, no status flipped to a terminal value, the
candidate simply stopped moving.

Treat it as recordable and near-adverse:

- It gets a state of its own, distinct from *rejected* and distinct from *still in
  round*, so that
  [absence-of-evidence-is-not-evidence](../_laws.md#absence-of-evidence-is-not-evidence)
  is honoured — a candidate who was never advanced is not the same object as a
  candidate who was never assessed.
- It names its actor and its basis, and it is reversible, because a reducer applied to
  a cohort will occasionally be wrong about one person and the cheapest time to fix
  that is while the loop is still open.
- It is told to the candidate. A stalled candidacy is the worst version of this: the
  candidate is out, the record says nothing, and the only party who does not know is
  the person whose plans depend on it.

The mirror obligation is to narrate the loop up front. A single-round process explains
itself; a two- or three-round loop does not, and the failure is specific — the
candidate finishes a conversation, believes the process is over, and then receives a
second invitation that reads like an administrative error. State at the first
invitation how many rounds there are, what each is, and what happens between them, so
every later contact lands as the next expected step. It is the cheapest drop-off
intervention available and it costs one paragraph.

## Failure modes this standard exists to prevent

- **The redundant round.** Two rounds testing the same competency without declaring it,
  read at debrief as agreement.
- **The round that cannot make its judgment.** A round asked for a verdict its material
  cannot ground — a culture read from a document, a skills verdict from a conversation
  that never demonstrated the skill.
- **The cylinder.** A loop with no reducer between rounds, where everyone advances and
  the early rounds exist to make the process look rigorous.
- **The invisible scoring wait.** Assessment folded into the interview step, so the
  time between speaking and deciding is unmeasured and the ratification is unrecorded.
- **The per-candidate instrument.** Personalised material on shared phases, producing
  ratings that cannot legitimately be compared but are compared anyway.
- **The anonymous round.** A conversation recorded against a team rather than a person,
  so no one can say who assessed the candidate — which is the one thing an assessment
  record exists to answer.
- **The silent drop.** Not-advanced treated as an absence of an event rather than an
  event, leaving the largest population in the process with no state, no reason, and no
  notification.

## The techniques

- [one-round-one-purpose](techniques/one-round-one-purpose.md) — the exclusivity rule,
  the justification sentence a round must produce, and how to kill a round safely.
- [round-mode-selection-machine-human-or-hybrid](techniques/round-mode-selection-machine-human-or-hybrid.md)
  — assigning conduct mode per round, and what a machine seat may never decide.
- [phase-to-competency-mapping](techniques/phase-to-competency-mapping.md) — the
  specification that makes a round auditable: goal, probe, listen-for, duration,
  competencies fed, grounding.
- [cohort-reducer-between-rounds](techniques/cohort-reducer-between-rounds.md) — the
  narrowing rule: basis, ratio, actor, and the tie at the cutoff.
- [shared-material-for-comparability](techniques/shared-material-for-comparability.md)
  — splitting shared from personal phases so ratings stay comparable across a cohort.
- [not-advanced-is-a-recordable-outcome](techniques/not-advanced-is-a-recordable-outcome.md)
  — giving the loop's highest-volume event a state, an actor, a reason and a reversal.
