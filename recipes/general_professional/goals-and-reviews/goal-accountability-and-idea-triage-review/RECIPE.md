---
name: goal-accountability-and-idea-triage-review
version: 0.2.0
status: seed
domain: general_professional
path: general_professional/goals-and-reviews
---

# Goal accountability and idea triage review

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Goals die quietly rather than being abandoned on purpose, and the review meant
to catch that reads activity as progress. A goal somebody touches every week looks
healthy right up to its deadline, when it turns out none of the touching moved the
outcome. Meanwhile the captured ideas stop being a queue anyone decides from and become
an archive nobody can face, and the decisions that were supposed to be revisited never
are.

**Input.** Each active goal with the activity actually observed against it and its
deadline, the ideas captured since the last review, and the decisions whose checkpoints
have come due.

**Core action.** Test each goal's evidence against whether the requester can move it and
whether moving it moves the outcome, call the rest motion, and force every quiet goal
and every captured idea to leave the review with a decision rather than a place in a
list.

**Output.** A review giving each goal a trend backed by evidence that passed that test,
a queue in which nothing is left undecided, the verdict on any decision that reached its
checkpoint, and a plain closure offer for anything genuinely abandoned that also says
where the effort goes instead.

## Activities

1. Read the activity actually observed against each active goal *(observe)*
2. Ask of each measure whether it is both movable by the requester and predictive of the
outcome, and call the rest motion *(decide)*
3. Decide every captured idea in or out, so none leaves the pass undecided *(decide)*
4. Surface decisions whose checkpoint has come due and say whether the metric was hit
*(act)*
5. Name a repeated slip as a pattern rather than reporting it as though it were the
first *(act)*
6. Put a long-quiet goal as behind or abandoned, and pair any closure with where the
effort goes *(deliver)*
7. Deliver the review, saying plainly when nothing changed *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A goal's status reflects movement toward its outcome rather than activity around it.**

- Every goal names the evidence its trend rests on, and whether that evidence is both
  movable by the requester and predictive of the outcome.
- A goal with recent activity but no movement toward its outcome is reported as motion,
  not as on track.
- The date of the last change that moved the outcome is carried separately from the date
  of the last activity of any kind.
- A review in which every goal is on track says so plainly and names what would have
  shown otherwise, rather than letting an all-clear stand unexamined.
- A measure the requester defends after this review called it motion is recorded against
  that goal as evidence they hold to be predictive, and the next review either works
  from it or names what it has since failed to predict, rather than putting the same
  measure to them again.

**A goal ends by being abandoned deliberately, and the abandonment says where the effort
goes instead.**

- A goal quiet past the agreed threshold is put to the requester as behind or abandoned,
  with no third answer available.
- Closing a goal records what replaces it, because effort released with nowhere to go
  returns to the same goal within a month.
- A goal moving to at risk is reported at the moment it moves rather than held for the
  next review, since the point of knowing is that intervention is still possible.

**The captured ideas are a queue somebody decides from, not an archive that only
grows.**

- Every idea captured since the last review leaves this one accepted, rejected, or
  carrying an explicit expiry date, and none leaves undecided.
- An idea deferred a second time is treated as a rejection and said out loud, rather
  than deferred a third.
- A period with no new ideas and no status changes is reported as such, rather than
  padded with the largest item of an ordinary week.

## Guidance

Ask of every measure whether the requester can move it and whether moving it moves the
outcome. A measure that fails the second test is motion, and a goal built on motion
looks healthy right up until its deadline. Quiet is a status rather than an absence: put
a long-silent goal to them as behind or abandoned and accept nothing else. If they
abandon it, ask where the effort goes, because effort with nowhere to go comes back to
the same goal.

## Where this is worth adopting

- A solo operator carrying six goals of which two are real, who will not admit the other
  four are dead while they are still on a list, and needs the question asked by
  something that does not mind asking it.
- Someone with a strong daily habit around a goal that has not moved in a quarter, where
  every measure they watch is one they can move and none of them predicts the outcome,
  so the streak is the thing hiding the problem.
- A capture habit that worked: hundreds of ideas saved over a year, none reviewed, and
  the pile is now large enough that opening it feels worse than ignoring it, so the
  useful move is a forced decision per item rather than a better way to browse.
- A team running quarterly objectives where every status has read green all quarter and
  the miss arrives on the last day, because nobody was ever asked what evidence would
  have shown the goal was in trouble while there was still time.
- A person who has recorded decisions with checkpoints and never once returned to one,
  so the record exists, is never read, and is quietly teaching them that writing
  decisions down does not help.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`self_paced`. A weekly slot is the most habitual cadence in this kind of work and
nothing about a goal's status is defined by the week boundary. Act when a goal changes
status, when it has been quiet long enough that the quiet is itself the finding, when a
decision's checkpoint comes due, or when enough ideas have collected to be worth one
pass. A fixed evening produces a review with nothing in it often enough that the reader
stops opening the one that matters.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the current goals are and what evidence would show movement toward each outcome,
  because a goal with no observable evidence can only be tracked by asking, which is the
  thing this work exists to replace.
- How long a goal may be quiet before the quiet is worth raising, because a goal with a
  weekly rhythm and one that moves in bursts have different silences and a threshold set
  too low turns every ordinary lull into an accusation.
- How direct the requester wants this to be about a stalled goal, because accountability
  softened into politeness stops working and accountability that ignores the preference
  gets switched off.
- What counts as an idea worth capturing at all, because a queue that must be fully
  decided each pass is only affordable if what enters it was worth entering.

## Dependencies

None.
