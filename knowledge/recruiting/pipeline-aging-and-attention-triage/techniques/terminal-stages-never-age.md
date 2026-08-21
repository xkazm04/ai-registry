---
layer: technique
type: technique
subject: pipeline-aging-and-attention-triage
technique: terminal-stages-never-age
status: forged
laws: [meaning-does-not-live-in-a-label, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [an attention queue never empties, designing a staleness query, deciding which entries have a clock]
---

# Terminal stages never age

An aging clock measures a wait. A wait requires somebody waiting. An entry that
has been hired, rejected or withdrawn is not waiting for anything, so it has no
clock — and the moment the aging query forgets this, the whole surface stops
working.

The rule: **the terminal role is excluded from every aging computation, at the
source of the computation, not by filtering the display.**

## Why this is load-bearing, not tidiness

The naive staleness query is "entries whose dwell exceeds the threshold". A
candidate rejected four months ago satisfies that predicate today, tomorrow,
and forever, and their dwell only grows. So the top of the attention queue
fills permanently with rows nobody can act on. Two things follow, both fatal:

- **The queue can never reach empty.** A recruiter who clears every real item
  still sees a red count. A counter that cannot go to zero conveys no
  information, and within a week nobody looks at it. Reachable-empty is the
  property that makes a triage surface trustworthy.
- **The oldest rows crowd out the urgent ones.** If ranking uses "most
  overdue first", the dead entries win by construction, because nothing ages
  faster than something that stopped moving on purpose.

Terminal exclusion is therefore not a cosmetic filter. It is what converts a
duration report into an actionable list.

## Terminal is a role, not a word

Which stages are terminal comes from the stage-role vocabulary owned by the
stage-modelling discipline — not from matching names like "rejected",
"declined", "hired", "archive", or whatever this team called it. Matching words
fails on every rename, every translation, and every team that spells its
closing column something creative, and it fails
[silently](../../_laws.md#meaning-does-not-live-in-a-label): the query returns
rows, they just happen to be the wrong ones. If a stage's role cannot be
resolved, treat it as *not aging* rather than as active. Erring toward silence
costs a missed nudge; erring toward noise costs the surface.

## Terminal and inactive are not the same

Three states get conflated and want separate handling:

- **Terminal stage** — the entry reached an end state in the pipeline. No
  clock, permanently.
- **Inactive or archived entry** — the record was set aside administratively
  while the stage is still, say, screening. No clock while inactive, but the
  clock should resume, not restart, if it is reactivated: the candidate's wait
  did not pause because your record-keeping did.
- **Withdrawn by the candidate** — terminal, and worth distinguishing from
  rejected in the record even though both stop the clock, because the two
  belong to different stories about the pipeline.

## The clock stops; the obligation may not

Reaching a terminal stage stops the aging clock. It does not automatically
discharge what is owed to the person. A candidate moved to a terminal stage who
has not yet been *told* is not an aging case, but they are very much an
attention case — the outstanding obligation is "communicate the outcome", not
"progress the entry". Model that as its own queue with its own reason, sourced
from the communication discipline that owns whether a message actually reached
anyone. Do not smuggle it back into aging by giving terminal stages a small
threshold; that reintroduces the never-empty queue for a reason a separate
queue handles better.

## The direction of the exclusion

Exclusion is worth stating in the direction that survives new stages: aging
applies to entries in **active** roles, rather than aging applying to everything
*except* a listed set of terminal ones. An allowlist of aging roles fails safe
when somebody adds a new stage role next quarter and forgets this code exists —
the new role simply does not age until someone decides it should. A denylist of
terminal roles fails the other way, and it fails invisibly.

## Say it twice, in two mechanisms

The strongest implementations express terminal non-aging in **both** places
independently: the policy table gives the terminal role a non-positive
threshold that means "never ages", *and* the selection predicate excludes
terminal roles before the threshold is ever consulted. This looks redundant and
is not. Each mechanism protects a different failure: a caller that forgets the
predicate still gets no badge, and a policy table that loses its terminal row
still yields no rows. Neither is load-bearing alone, which is the point — this
is the one exclusion whose absence quietly destroys the surface, so it is worth
paying for twice.

## Interaction with automation

Because terminal entries carry the highest dwell numbers in any workspace, they
are the rows a bulk cleanup job finds first. Resist. Any automated pass keyed
on duration must exclude terminal roles for the same reason the badge does, and
must in any case only nudge:
[no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated).
A duration is a fact about your operation, never evidence about a person, and
never a licence to close a record on their behalf.

## Decision rules

- Compute aging only for entries whose stage role is in the active set.
- When a role cannot be resolved, do not age the entry.
- When an entry is reactivated out of an inactive state, resume its wait from
  the candidate's perspective rather than resetting it to zero.
- Model "outcome decided but not communicated" as a separate attention queue,
  never as an aging threshold on a terminal stage.

## When not to use this

Terminal exclusion is about *aging alerts*. It does not apply to measurement:
funnel metrics legitimately count time-to-rejection and time-to-hire, and those
computations need exactly the terminal rows this technique excludes. Nor does
it apply to compliance retention clocks, which run on terminal records by
design and are governed by the consent-and-retention discipline. Two clocks,
different purposes — do not let one implementation serve both.
