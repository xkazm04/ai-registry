# Google Ads as the `advertising` connector

What was learned mapping this recipe onto Google Ads specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The change history is the only honest answer to "was it actually done".** A proposal
graded against a window is worthless if nobody can say whether the change landed, when,
or whether somebody else changed something else on the same day. This platform records
every edit with a timestamp and an actor, which makes the grading step cheap and makes
attributing an effect to a proposal defensible for the first time. Read it before
grading, not after, and record the change identifier on the proposal when it is accepted.
Where a platform has no such record, the grading is an assertion and the recipe should
say so rather than pretending otherwise.

**Automated bidding has a relearning period, and it invalidates the front of every
window.** After a bid strategy or a significant budget change, the system re-optimises,
and performance during that stretch says nothing about the change's merit in either
direction. A verification window that starts on the day the change landed grades mostly
the relearning. Start the window after it, and say in the proposal how much was skipped.

**Recommendations from the platform itself are not findings from the read.** The account
surfaces its own suggestions, complete with a score, and they are the easiest thing in
the world to launder into a proposal that looks evidence backed. They are generic by
construction and several of them argue for spending more. If one is worth proposing,
it still has to be argued from the adopter's own reading, and the proposal should say the
idea came from the platform so the reviewer can weight it accordingly.

**Cost per acquisition here is last click within the platform's own attribution.** It
attributes the conversion to the click the platform saw, which flatters exactly the terms
the buyer would have reached anyway. A proposal to move budget toward a low cost per
acquisition term is arguing from the number most likely to be biased in its favour. It
can still be the right proposal, and it should carry that caveat and, where the adopter
can run one, a test rather than a reallocation.

## What transfers to any advertising connector

- Grade against a record that the change actually landed and when. Without one, grading
  is an assertion.
- Ask whether the platform relearns after a change, and start the verification window
  after that, not on the day of the edit.
- A platform's own recommendations are generic and mostly argue for more spend. Do not
  launder them into evidence backed proposals.
- Platform reported cost per acquisition is last click inside that platform. Say so
  whenever a proposal rests on it.
