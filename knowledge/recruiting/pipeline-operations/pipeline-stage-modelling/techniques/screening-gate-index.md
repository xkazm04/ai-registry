---
layer: technique
type: technique
subject: pipeline-stage-modelling
technique: screening-gate-index
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [defining advanced-past-screening for a fairness metric, comparing pipelines across teams, deciding what an automated screen may do at a given stage]
---

# The screening gate index

Most of the questions a hiring system asks about position are not "which
stage" but "which side of a line". *Has this candidate been assessed by a
human yet? Have they cleared the automated filter? Are they past the point
where a rejection is a real rejection rather than a filter?* All of these are
one boundary, and the boundary is what must be derived — never a named stage,
never a hardcoded index.

**The screening gate is the position of the first stage where a real look
happens — the first interview-role stage; failing that the first offer-role
stage; failing that the first terminal-role stage; failing all three, past the
end of the board. Clearing the gate means occupying a stage at or after it.**
That is the whole definition, and it is portable to a board with zero
screening stages, three of them, or a screening stage a team put fourth.

Define the gate by the *first real-evaluation* stage rather than by the *last
screening* stage. Both formulations agree on a conventional board and diverge
on the boards that matter. A team may run three pre-stages or none, may call
none of them screening, may bolt on a custom holding column — and the
question the fairness metric asks is never "how many pre-stages were there",
it is "did this candidate get a real look". Anchoring on the presence of a
positive event is robust; anchoring on the absence of filtering steps inherits
every mistake in the team's screening-role assignments.

The final fallback matters as much as the rule. An axis with no interview,
offer or terminal role has a gate *past the end of the board*: nobody has
cleared it. Falling back the other way — treating an ungated board as one
where everyone has advanced — flatters the process by declaring a perfect
clearance rate on an axis nobody has modelled
([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

## Why a boundary and not a stage

The headline fairness measurement in a hiring funnel is a selection rate: of
the people who applied, which fraction got past the first filter, cut by
whatever cohorts you are obliged to examine. The naive implementation is
"reached the stage called *Interview*". Three things are wrong with it:

- **It renames.** A team calling their interview column *Panel* drops to a
  zero rate for everyone, which reads as catastrophic bias and is a string
  mismatch.
- **It reorders.** A team that inserts a stage before interview changes which
  candidates count without changing their process.
- **It measures the wrong event even when it works.** Reaching a named stage
  is one particular downstream milestone. The fairness question is about
  *clearing the filter* — the thing that removed people. A candidate in a
  post-screening scoring stage cleared the filter and is invisible to a
  metric that waits for an interview column.

Deriving the gate fixes all three at once, and it fixes them for boards you
have not seen, which is the property that matters once teams edit their own
axes ([meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label)).

## Computing it

1. Resolve the board's stages in order, each with its role.
2. Walk the preference list — interview, then offer, then terminal — and take
   the position of the first stage carrying the first role that appears at
   all. That position is the gate.
3. If none of the three appears, the gate is past the end of the board.
4. A candidate has cleared the gate if their stage resolves on this axis and
   its position is greater than or equal to the gate.

Three properties follow that are easy to get wrong:

- **The comparison is inclusive, not strict.** Reaching the first
  real-evaluation stage *is* clearing the gate — that is the event being
  measured. The corresponding strictness lives on the other side: sitting in
  a screening stage is not clearing anything, which the inclusive comparison
  against a *later* index already gives you.
- **Derive both sides from the one boundary.** "Which stages are screening
  stages" — the set where an automated screen may still act — is *everything
  before the gate*, computed from the same number rather than from an
  independent role filter. Two independently-computed predicates for one
  boundary will drift, and the drift is silent: a stage that counts as
  screening for the automation and as post-screening for the metric produces
  candidates the system both filters and reports as having cleared the
  filter.
- **An off-axis stage has not cleared the gate.** A candidate standing on a
  retired or unrecognised column resolves to no position, and the honest
  answer is false — not "past", not "before". Guessing a position for an
  unresolvable stage lets the metric count somebody nobody has classified.

Terminal stages need a policy, stated once. A candidate rejected at screening
sits in a terminal stage whose position is at the end of the board —
numerically past the gate, semantically not past it. Resolve by outcome
before position: a terminal-rejected candidate has not cleared the gate; a
terminal-hired one obviously has. Comparing raw positions here is the single
most common way this metric inverts.

## What the gate is used for, and what it must carry

Three consumers, each with an obligation:

- **Fairness rates.** Cleared-the-gate over entered-the-pipeline, cut by
  cohort. The claim must carry its denominator and refuse to render below a
  cohort size that supports a proportion
  ([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
  The threshold policy belongs to the small-sample discipline; what this
  technique owns is that the numerator is the right set of people.
- **Automated screening permissions.** What an automated screen may do
  depends on which side of the gate the candidate is. Before the gate the
  screen is doing the filtering work it exists for and may move someone; at
  or past the gate a human step is in progress and the screen is **advisory
  only** — it may produce a verdict, and nothing moves. Within the pre-gate
  region the permission still varies by position: at the entry stage a screen
  always files the applicant onward into the first assessed stage and its
  confidence decides only *how* they land — cleanly, or flagged for a human
  to resolve — because letting a low-confidence screen leave a fresh
  applicant in the inbox is how people are forgotten. Deeper in, low
  confidence holds them in place for review. No branch of that table
  rejects: an automated screen may recommend it, never route it.
- **Cross-team benchmarks.** Each team's rows are judged against that team's
  own gate, computed from that team's own axis. This is what makes the
  comparison legitimate at all — the shared quantity is "cleared our filter",
  not "reached column three".

## Decision rules

- When you need "past screening", compute the gate. Never accept a stage name
  or a literal index as an input to the question.
- When a board changes, recompute — the gate is derived per board, per read,
  and caching it across an edit is a stale schema.
- When the board has several pre-gate stages, or none, the gate is unchanged:
  it is a property of where evaluation starts, not of how much filtering
  precedes it.
- When a candidate is in a terminal stage, resolve gate-clearance by outcome
  before position.
- When you need the *other* side — where an already-assessed candidate
  belongs, for an import or a re-route — derive it too: the last stage before
  the gate, falling back to the entry stage and then to the first column, so
  the answer always names a real place to put somebody. Hardcoding the name
  of today's screened column is the same bug in the other direction.
- When a custom-role stage sits among screening stages, it does not move the
  gate. The escape hatch never defines a boundary; if a team's custom step
  really is their filter, the fix is to give it the screening role.
- When a metric derived from the gate is presented, name the gate it used —
  "past this board's screening stage" is legible; a bare percentage invites
  the reader to supply their own definition.

## When not to use this

Do not use the gate as a proxy for candidate quality or recruiter
performance. It measures how far the process carried people, which is a
property of the process, the inbound mix and the role — a low clearance rate
can be a well-calibrated filter or an unfair one, and this boundary cannot
tell you which. It locates the population; the fairness and calibration
disciplines judge it.

Do not build a second boundary for every question. If you find yourself
deriving an "interview gate" and an "offer gate" for ad-hoc reporting, what
you actually want is role-and-position resolution generally — the screening
gate is special because it is the one with a fairness obligation attached,
not because boundaries are otherwise forbidden.
