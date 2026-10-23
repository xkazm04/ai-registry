---
layer: application
type: application
subject: roll-call-vote-analysis
technique: vote-choice-vocabulary-mapping
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node vote record: the unknown code survived the ingest and died at the bucketer

The node version is witnessed by the repository's CI workflow, which pins node 24.

The politicas repo follows the ingest half of the technique to the letter. One function
in its standalone normalization package maps the per-ballot code to a closed choice
vocabulary. Its documentation quotes the publisher's schema page code by code. It keeps
the merged post-1995 abstain-or-not-voting value as its own member, with a note that
any metric needing the split cannot be computed for those terms. Every unrecognized
code maps to `unknown`, and the ballot row keeps the raw code and the source revision
beside the mapped value. The presence set and the positional set are exported constants
next to the mapping, and the knowledge-graph and quality layers import them.

That made the layer *above* the vocabulary the seam most likely to falsify the
technique, and it was chosen for that reason. The claim at risk was rule 3: unknown is
countable and surfaceable, never a default bucket.

## The seam

The vote record (`features/votetrack/record/derive.ts`) does not use the vocabulary
directly. It reduces each choice to one of four display buckets (yes, no, present
without a position, away) through a small function that three surfaces share: the
record itself, the agreement compass and the money-collision candidates. That function:

- took a bare `string`, not the vocabulary type;
- listed the presence values again by hand instead of reading the exported set;
- ended in a `default` arm that returned `away`.

So `unknown`, and any string outside the vocabulary, became "the member was not at the
desk". A unit test pinned exactly that: `bucketOf("unknown")` is `away`. The ingest kept
the unknown countable, and the next mapping up turned it back into a default.

`away` is also the one slot the record's reconciliation against the chamber's published
totals deliberately does not compare, because the source publishes no column for it.
An undocumented code that really meant yes or no would surface as a reconciliation
delta. One filed as away would surface nowhere: absences, seats and the unaffiliated
count would carry it silently.

## The paired read

- **Arm A:** the shipped function. **Arm B:** the buckets read from the vocabulary
  module (presence, positional, and a new documented-absence set beside them, tested to
  partition every documented code with `unknown` in none), `null` returned outside
  them, and the record counting those ballots in `coverage.unknownChoice`.
- **Target:** ballots with an undocumented code filed as an absence. On a fixture with
  one club member and one unaffiliated member each carrying `unknown`: A filed 2 of 2
  (club away +1, unaffiliated away +1), B 0 of 2, both counted. Three new record tests
  fail on A and pass on B.
- **Floor:** seats unchanged. The first draft of B broke it. Skipping the ballot also
  dropped the seat, and club seats on the newest roll call went from 3 to 2. That was
  caught by the paired print before landing: an undocumented code is still a member in
  a seat. B now keeps the seat and leaves the ballot out of every choice tally. Every
  documented choice buckets identically under both arms. The record, compass, money and
  package suites passed 675 of 675, typecheck and lint are clean, and the full pre-push
  gate passed 4,212 tests.
- **Live:** the publisher's current-term ballot files as published on 2026-10-22 hold
  495,800 ballots, all coded yes, no, the merged code, or not-logged-in. There are zero
  unknowns, so no published figure moves. The defect was latent. It would have fired on
  the first schema revision that added a code.

Shipped to the project's default branch, with a dated entry in its route document.

## What the tree shows about the technique

The technique's "one definition, imported everywhere" rule was honoured at the first
mapping and broken at the second. The sets built on the vocabulary were exported, and
two analysis layers imported them, but the display bucketer was a mapping in its own
right and re-listed its input set. Its default arm is the defect the technique's rule 3
names, one layer later than the rule was written for. A vocabulary that keeps `unknown`
honest guarantees nothing about a function that maps from it. That function owes the
same rule: typed input, sets imported, and no default arm.

## What this realization cannot do

- `coverage.unknownChoice` is in the record payload, but the page does not render it
  yet. The record's other drop counters are printed in the method note. This one is
  countable but not yet shown, which is acceptable only while it reads zero.
- The bucketer still accepts a bare string, because the ballot input type is one. It
  now treats anything outside the vocabulary as unknown, so the looser type no longer
  produces a wrong bucket.
- Not-yet-sworn ballots still bucket as away. That is a documented meaning mapped by a
  stated rule, not a default, and the eligibility question belongs to the
  positional-versus-participation decision, not to the vocabulary.
