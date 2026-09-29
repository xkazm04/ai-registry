---
layer: technique
type: technique
subject: requisition-lifecycle-governance
technique: fill-is-a-count-and-close-is-the-act-it-triggers
status: forged
laws: [say-only-what-the-record-holds, every-decision-names-its-actor]
shared_with: []
use_when: [a requisition can hold more than one seat, deciding when a filled role closes itself, a filled role is still chasing candidates, two hires landing at once closed a role twice]
---

# Fill is a count, and close is the act it triggers

A requisition is a permission to hire *some number* of people, and the number is
one only by default. The two words teams use for its end are different kinds of
fact, and treating them as one is how a three-seat role either closes on its
first hire or never closes at all.

- **Filled** is a *count*: people hired against the role, compared with the
  number the role was opened for. It is true or false at any moment and nobody
  decides it.
- **Closed** is an *act*: the role stops taking applications, drops out of the
  open count, and its people are withdrawn. It has an actor, a moment and a
  cause, and it is what the earlier technique's cascade hangs off.

Fill is the most common *cause* of a close. It is not the same thing, and a
system that stores one flag for both has to guess which it means.

## Why the seat count has to exist

Every applicant-tracking product that supports more than one hire per role models
the seat separately from the role, because the alternative fails in both
directions:

- The three enterprise-grade products whose documentation was read for this pass
  all model it. One describes a role as a single job with as many openings as
  there are hires; one closes the job automatically only once its *last* opening
  is closed and offers to keep it open when the role is evergreen; one will not
  mark a requisition filled until every position attached to it is filled. A
  fourth is reported, from search summaries only, to close on the first hire by
  default. The pages are named in the application's sources.
- Closing on the first hire of three withdraws every candidate in flight for two
  seats that are still open, ends their process on the strength of a fact that
  does not end it, and stops the role taking applications while it still needs
  people. That is the stranded-candidate failure from the close cascade, caused
  by the fill rule rather than the cascade.
- Never closing on a full role is the immortal requisition again, with a hired
  headcount to prove it.

The seat count is also what the approval was for. Headcount approval commits
money to *a number of seats*; a role that closes on any other number has
detached the approval from the thing it approved.

## The procedure

1. **State the target when the role opens, and default it in one place.** An
   unstated target is one, and a stored null, zero or negative folds to one in the
   same function that every reader calls. "Unstated" and "stated as one" are the
   same fact and must never read differently. Refuse a non-integer instead of
   truncating it: a role opened for a number nobody typed is worse than a
   rejected form. Put a ceiling on it, and treat the ceiling as the line past
   which a role is really a campaign; a mistyped hundred would keep a requisition
   open indefinitely while its progress reads as honest and useless.
2. **Derive *filled*; do not store it.** The hire commits, and the close follows
   it a moment later. In between, the role is three of three and still live. A
   stored `filled` flag would disagree with the count beside it for that moment,
   and no migration can promise the two never disagree; a derived value cannot.
   Show four things to the recruiter from two facts: draft, open (with hired and
   target, "1 of 3"), filled, and closed short of its target.
3. **Count the hire from what the stage means, not what it is called.** A hire is
   the arrival at the stage that carries the terminal *role*. A board whose last
   column was renamed or reordered must behave the same as the default one; a
   comparison against the literal word disables the whole rule for exactly the
   teams that customised the board, and nothing reports it.
4. **Run the check after the hire has committed, and never let it fail the hire.**
   The candidate is hired either way. The hook re-reads the entry and the stage it
   was told about, because a second move may have landed in the gap and closing a
   role on a hire the recruiter has already undone applies a decision to a stage
   the person has left. A failure to retire the role leaves it open for a human,
   and is logged as such.
5. **Make the close a compare-and-swap.** Two candidates dropped into the terminal
   column at the same moment both commit, and both hooks then read "target met".
   Re-assert the "still open" predicate in the write's own condition, and let only
   the call whose write changed a row go on to withdraw anyone. Without it one
   filled role runs two withdrawal sweeps and announces itself twice. The swap is a
   single atomic statement, which is a stronger guarantee than a select and an
   update inside a deferred transaction.
6. **Spare the people it was filled with, on both predicates.** The sweep selects
   the still-in-flight and its write re-asserts both the status and the stage it
   read. A hire is a stage move, not a status move, so a recruiter dropping
   someone onto the terminal column between the select and the write would
   otherwise be withdrawn from the role they were just hired into.
7. **Withdraw through the same function a manual close uses.** A candidate's
   timeline must not be able to tell the two closes apart, because to the person
   withdrawn they are the same event. No event kind of its own for the automatic
   path.

## Decision rules

- **When a requisition is shared across teams, the target and the close are each
  team's.** One team filling its seats must not retire the role for the others,
  and a target stored on the shared row is a fact about whoever wrote it last.
- **When a hire falls through after the role has closed, that is a reopen, not an
  automatic un-close.** The seat may have been reabsorbed and the approval may
  have moved, so it takes the new-span rule from the states technique. The count
  falling back below target does not restore anything by itself.
- **When the role is a standing pool, do not give it a target.** A continuously
  open requisition has no fill event by design; model it as its own kind of
  record, and where a product offers to keep a role open after its last hire, make
  that a recorded choice with an owner.
- **When the hiring system does not own headcount, read its openings from the
  system that does.** The count is then someone else's and the hook's job is to
  compare, not to keep a second counter that will drift from the first.
- **Show the number the decision was taken on.** The count the hook closes on must
  be the count the recruiter's screen shows, read through the same function. A
  second, private counter is exactly how a "2 of 3" role ends up closed.

## When not to use this

- **Single-seat organisations.** If every role is one seat the target is always
  one and the rule reduces to "the hire closes the role". Keep the compare-and-swap
  anyway; it is the part that needs no seat count.
- **Where a hire is not a stage move.** If the record of a hire is an accepted
  offer in another system, the trigger is that event and the rest is unchanged.
- **As a substitute for the cascade.** This decides *when* the close fires. What
  the close does to the people in the role is the close technique's job.
