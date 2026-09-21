---
layer: technique
type: technique
subject: local-visibility-and-reputation
technique: attention-score-for-many-locations
status: forged
laws: [label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [ordering the locations of a multi-location business by urgency, importing a listing-status export, designing a location roster]
---

# Attention score for many locations

A business with many locations needs one answer: which one to look at first. The
attention score is a weighted sum of a location's problems, used as a *sort key* and
nothing else. Its weights are conventions chosen to enforce an ordering a principal
practitioner would defend - a listing that is not cleanly connected before everything,
a human's flag before a backlog, a backlog growing with its size - and the score is
never displayed as a measurement of health, a percentage, or a grade.

## The ordering the weights enforce

From most to least urgent:

1. **A disconnected or suspended listing.** The location is invisible; no review work,
   no page work and no rank work changes that. Weight it so that it outranks any
   plausible combination of the other inputs.
2. **A listing whose status needs attention** - pending verification, an unrecognised
   status, a warning from the platform. Roughly half the disconnected weight: serious,
   but the location is still visible.
3. **Items a human flagged.** Somebody looked and said "this one"; a flag outranks any
   automatically counted backlog. Per flag.
4. **Unanswered reviews.** Linear in the count, because a backlog of twenty is worse
   than a backlog of three and the reader of the thread sees all of them.
5. **A pack rank off the first page.** A fixed penalty when the location's best
   tracked position is worse than ten; the boundary is the first-page convention.
6. **Open tasks.** Linear, small.

A convention this bundle has seen work: disconnected 100, attention 50, flagged times
twenty, unanswered times six, off-first-page 15, open tasks times four. None of those
is measured. What is defended is the *order* those numbers produce and the fact that
the first two cannot be overtaken by the rest at any realistic count.

## Procedure

1. **Parse the listing status, failing toward attention.** An explicit healthy value
   (connected, verified, active, live) is healthy. An explicit bad value (disconnected,
   inactive, suspended, warning, issue) is bad. A value that is present but *not
   recognised* - a new platform wording, a status in a language the alias table missed,
   a typo - is *attention*, never healthy. This field feeds the score, and an
   optimistic default on it would hide exactly the locations the score exists to
   surface: a suspended profile is the classic emergency.
2. **Treat an absent status column as not reported.** The export carried no status, so
   nothing is known; the location sorts by its other inputs and the roster says the
   status column was absent. It is not a problem signal, and it is not a clean bill of
   health either.
3. **Compute per location:** the status weight, plus flags, plus unanswered, plus the
   rank penalty, plus tasks.
4. **Sort descending, ties by roster order.** A stable sort, so two equal locations do
   not swap places between renders and a manager does not chase a moving list.
5. **Show the reasons, not the number.** Each row carries the inputs that produced its
   place - "listing disconnected", "seven unanswered", "rank 14" - so the manager acts on
   a reason. The score itself may be hidden entirely.

## Decision rules

- **When a listing status is unrecognised, score it as attention, because the cost of
  surfacing a healthy location is one glance and the cost of burying a suspended one is
  the location's revenue** until somebody notices.
- **When a location needs attention by any single criterion - listing not clean, a
  flag, rank off the first page, more than a couple of unanswered reviews - count it
  in the "needs attention" total,** and keep that total as a count, separate from the
  score; the count answers "how many" and the score answers "which first".
- **When two locations tie, do not invent a tiebreak from the score's inputs;** use
  roster order and let the manager decide.
- **When the fleet average rating is shown, weight it by review count,** so the
  location with two reviews cannot move the fleet's figure as far as the one with two
  hundred.
- **When the score would be shown to a client, show the reasons instead.** A number
  invites "why is mine 63" and the honest answer is "the weights are ours".

## Why not a health percentage

A percentage claims a measurement: 80% healthy of what, on which scale, against which
target. The score claims only an order. Rendering it as a bar or a grade would make
every weight a promise, and the weights are conventions. The roster's job is to point
at one row; a sort key does that and a grade does not.

## When NOT to use

- **One or two locations.** Look at both. The score adds nothing.
- **As a ranking of managers.** The inputs are counts of problems, several of which
  (rank, listing status) are outside a local manager's control; sorting people by it
  is a misuse the design must not invite.
- **Where the listing status is not imported at all.** Without the dominant input the
  ordering is "who has the most unanswered reviews", which is a fine list but should be
  called that.
- **To decide what to do at the chosen location.** The score picks the location; the
  coverage, decline, reply and recency techniques decide the action.
