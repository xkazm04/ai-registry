---
layer: technique
type: technique
subject: candidate-identity-and-staleness
technique: requirement-edited-since-scored
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, a-candidates-process-never-stalls-on-your-constraints, say-only-what-the-record-holds]
shared_with: []
use_when: [displaying a fit or match score that was computed earlier, editing an open requisition that already has scored candidates, deciding whether a stored assessment may be shown or acted on]
---

# Requirement edited since scored

Of the three reasons an assessment stops describing reality — the person
changed, the requirement changed, the instrument changed — this is the one you
can detect exactly, and it is the one most often missed.

The rule is one comparison: **a score computed before the requisition's last
edit is stale.** Both timestamps already exist. No heuristics, no model, no
inference. If the brief moved after the judgment was made, the judgment was
made against a brief that no longer exists.

## What is stale is the verdict, not the evidence

Hold this distinction hard, because it dictates every downstream behaviour.

The candidate did not change. Nothing extracted from their document became less
true when a hiring manager added a must-have. What expired is the *comparison*:
a fit score is a statement about the relationship between a person and a
requirement, and one side of that relationship was rewritten
([a verdict is bound to what it
judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

So the remedy is cheap and entirely internal: re-run the comparison. No
candidate contact, no new evidence, no waiting. That cheapness is what makes
the next rule affordable.

## It informs; it never blocks

A stale score is displayed, labelled, and remains fully usable. It does not
disappear from a list, does not disable the advance action, does not gate a
decision behind a re-run.

The reasoning is asymmetric. Showing a labelled stale score means a recruiter
reads slightly old information with the risk visible. Blocking means a
candidate sits unreviewed because someone edited a job description — the
person's process stalling on the organisation's internal state, which is
[a candidate's process never stalls on your
constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
They did nothing; charging them for your edit is indefensible.

There is a second, practical reason. A system that hides or blocks stale scores
after every requisition edit becomes unusable during exactly the period when
requisitions are edited most — the first days of an opening — and recruiters
respond by working around it, which is worse than a slightly old number.

## Not every edit is a material edit

A naive implementation compares against *any* modification timestamp and flags
everything, because requisitions get touched constantly: a typo in the
description, an internal owner change, a status flip, a formatting fix. Flag on
all of them and the badge appears on every score permanently, which trains
everyone to ignore it. A badge that is always on carries no information.

Track the last edit to the **decision-bearing content** — the requirements,
must-haves, seniority, location constraints, language expectations, the
weighting — separately from the record's general modification time. Everything
else is not staleness.

If separating the two is not feasible, prefer over-flagging to under-flagging,
but treat the resulting noise as a defect with a due date, not as an acceptable
steady state.

## The badge must describe the record, not the person

The staleness label states a fact about your own bookkeeping:

- Correct: *scored before the requirements were last edited* — with the two
  dates available.
- Correct: *this score was computed against an earlier version of this role.*
- Wrong: *may no longer be a fit* — a claim about a human that nothing in the
  record supports.
- Wrong: *needs re-review* — an instruction that implies the outcome is likely
  to change, when it usually does not.

[Say only what the record holds](../../../_laws.md#say-only-what-the-record-holds).
The record holds two timestamps and an ordering between them. It holds nothing
whatsoever about whether the new requirement changes this person's standing.

Pair the badge with the remedy — a re-score, one action, with the outcome
plainly not predetermined — and, where the surface allows, with what actually
changed in the requirement, which lets an experienced recruiter decide in
seconds whether a re-run is worth it.

## Decision rules

- Compare the score's computation time against the requirement's last
  *material* edit time. Earlier means stale.
- Stale is advisory. Never hide, never disable, never auto-reject, never
  auto-advance on the basis of staleness.
- Never silently re-score in the background and replace a number a recruiter
  has already seen and acted on — the changed number with no event behind it is
  a worse failure than the stale one. A re-score is an event with a timestamp
  and an actor.
- In a comparative view — a ranked list, a shortlist — mixed vintages are a
  real problem, because ordering people partly by when their score happened to
  be computed is not a ranking. Either re-score the cohort or mark the list as
  mixed-vintage and say how many entries predate the edit.
- On any surface that produces an adverse outcome, a stale score is not
  sufficient basis. Re-score first, or route to a human who can see both dates.
- Persist the requirement version the score was computed against, not just a
  timestamp, wherever versions exist. Timestamps answer "is it stale"; versions
  answer "stale against what", which is the question an audit asks.

## When not to use it

Do not apply this check to assessments that are not comparisons against the
requirement. An extraction of a person's career, a language reading, an
authenticity check — these are statements about the document alone and do not
go stale when a requisition is edited. Flagging them does not merely add noise;
it teaches recruiters that the badge means "old", and they stop reading the
reason.

Do not apply it to closed or terminal records. A score attached to a filled
requisition or a withdrawn candidate is a historical artifact; staleness on it
implies a remedy that must not exist, and terminal states outrank advisory ones.

And do not use it as a substitute for the other two staleness causes. This
check is silent when a person changes and silent when the instrument changes.
A system that shows only this badge and calls it freshness is claiming a
coverage it does not have.
