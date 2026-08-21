---
layer: technique
type: technique
subject: combining-signals-into-a-hire-decision
technique: a-hold-that-blocks-auto-advance
status: forged
laws: [uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated, inference-must-look-like-inference]
shared_with: []
use_when: [designing the verdict vocabulary of a combined decision, deciding whether a strong score may advance a candidate automatically, handling an authenticity concern or thin evidence at a gate]
---

# A hold that blocks auto-advance

Most combination logic is two-valued in its bones: a threshold, and above or
below it. A third value gets added later — *review*, *maybe*, *borderline* —
and it is almost always advisory, a label attached to a candidate who advances
anyway. This technique is about making the third value **load-bearing**: a hold
that a good score cannot outvote, that stops the automated path, and that names
what must be resolved before the path resumes.

## The vocabulary is closed and three-valued

The combined verdict takes exactly one of three values, and the machine may act
on only two of them:

| Verdict | Meaning | Machine may act? |
| --- | --- | --- |
| **advance** | evidence clears the floor and no blocker fired | yes — may move the candidate forward |
| **hold** | a blocker fired, or evidence is too thin to support advancing | yes — parks at a human gate |
| **decline** | the evidence does not support proceeding | **no** — recommendation only, a person acts |

Two properties make this more than a label. First, the vocabulary is **closed**:
an unrecognised, malformed or absent verdict resolves to *hold*, never to
advance and never to decline
([law](../../_laws.md#uncertainty-resolves-toward-the-candidate)). Second, the
machine-actionable set omits *decline* entirely
([law](../../_laws.md#no-adverse-outcome-is-solely-automated)) — a model may
recommend it, but the route it can execute admits advance and hold only.

## What forces a hold, regardless of score

The blockers are predicates, not terms in a sum. Each one, alone, forces hold:

- **Authenticity in question.** Any unresolved concern that the work may not be
  the candidate's own, that a credential does not check out, or that an identity
  does not reconcile. This is not a penalty of some points; the whole composite
  is meaningless if it is grading somebody else's work.
- **Evidence confidence below the floor.** When the weakest input's confidence
  is low, no combination of strong scores makes the file trustworthy.
- **Coverage below the minimum.** Too few dimensions were actually assessed for
  the composite to mean what it claims.
- **An unresolved discrepancy** between signals of comparable weight (see the
  discrepancy technique).
- **A degraded or partial run.** The assessment did not complete, a model was
  unavailable and a deterministic fallback ran, a rubric version could not be
  resolved. A verdict produced under degradation is provisional and says so
  rather than freezing as authoritative.

The design rule underneath: **the blockers are evaluated before and
independently of the score, and their result is not a number.** The moment a
blocker becomes "minus 15 points", a sufficiently strong candidate walks through
it, which is precisely the candidate you most need to stop.

Two structural corollaries worth encoding literally:

- **The blocker sits above the ladder, not on it.** In the decision function,
  test the blockers before the quality ladder is consulted at all, so that no
  quality metric — however good — has a branch that reaches the cleared state
  while a blocker holds. A blocker placed below the ladder can be out-scored;
  one placed above it cannot.
- **Put it in the decision table, not in the copy.** It is tempting to implement
  a blocker as a warning sentence attached to a result. Warning copy regresses
  under every redesign and every translation; a decision table does not. If the
  only thing stopping an advance is a paragraph, nothing is stopping it.

## The hold must carry its reasons visibly

A hold with no visible cause is worse than no hold — it stalls a person's
process while telling the reviewer nothing, and a reviewer with nothing to act
on clears it. Every hold carries:

- the **specific flags** that fired, each in the words the record holds, not a
  generic severity;
- **what would resolve each one** — the missing signal, the check to re-run, the
  question to ask;
- **who** is expected to resolve it;
- the **score and its coverage**, still shown, clearly subordinate to the flags,
  and never in the visual grammar of a cleared result
  ([law](../../_laws.md#inference-must-look-like-inference)).

A hold is a request for a specific action, not a shrug.

## A hold is not a slow decline

The most common corruption of a good hold state is administrative: files park in
it and age out. A hold that nobody is accountable for becomes a rejection
delivered by silence, which is the worst rejection there is — no reason, no
record, no reconsider path.

Guardrails that keep a hold honest:

- **Every hold has an owner and a clock.** Aging is surfaced to the owner, not
  to a rule that acts on it.
- **Aging never converts a hold into a decline automatically.** Escalate the
  reminder, never the outcome.
- **The candidate's own process is not blocked by your queue.** Whatever a
  candidate can do themselves — accept, book, submit, ask for their data — stays
  available while your side holds
  ([law](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **A resolved hold records who resolved it and on what basis**, so that clearing
  a flag is itself an attributable decision rather than a state change nobody
  owns.

## Decision rules

- **When any blocker fires, the verdict is hold** — irrespective of the
  composite, and without a score-based override path existing anywhere in the
  code or the policy.
- **When the verdict cannot be parsed or is absent, the verdict is hold.**
- **When the run was degraded, the verdict is at best hold**, and its provenance
  is downgraded truthfully rather than presented as a complete assessment.
- **When a hold is cleared, record the clearing actor and reason**; the cleared
  flag stays in the record rather than disappearing.
- **Never let hold be a display state over an advance.** If the pipeline moved
  the candidate, the verdict was advance; calling it hold in the interface is a
  lie with a clean audit trail.

## When not to use this

- **Where the concern is a hard eligibility predicate** — a required licence, a
  work authorization the role legally requires — a hold is the wrong instrument.
  That is a gate with its own governance, not an uncertainty state.
- **Where holding is more adverse than proceeding.** For time-critical roles
  with a closing requisition, an indefinite hold can harm the candidate more than
  a decision would. The answer is a tighter clock and a named owner, not a
  removal of the hold — but the trade-off must be made deliberately.
- **Where the hold would fire on nearly everyone.** A blocker that catches 70% of
  files is not a safety net, it is a mis-specified threshold that will be
  routinely overridden until it means nothing. Fix the predicate; do not train
  reviewers to ignore it.
