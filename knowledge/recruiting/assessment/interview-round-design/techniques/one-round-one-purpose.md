---
layer: technique
type: technique
subject: interview-round-design
technique: one-round-one-purpose
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [adding a round to a loop, auditing an existing loop for redundancy, deciding whether two conversations should be merged]
---

# One round, one purpose

Every round in a loop must be able to complete this sentence: *"This round exists to
decide X, and no earlier round could decide it because Y."* A round that cannot
complete it is redundant, and redundancy in a loop is not neutral — it costs candidate
time, produces correlated readings that a debrief mistakes for agreement, and dilutes
the accountability for every competency it touches.

The technique is a specification discipline plus two audits: one that runs when a round
is proposed, one that runs periodically over the whole loop.

## The proposal test

A new round is admitted only when all four hold:

1. **It names a judgment.** Not a topic, not a stakeholder — a decision the process
   will make differently depending on the outcome. "The founder likes to meet people"
   is a stakeholder preference; "we decide whether to make an offer" is a judgment.
2. **The judgment is unmakeable earlier.** Either the evidence does not exist yet (a
   work sample has not been produced), the counterparty does not exist yet (nobody who
   could judge it has met the candidate), or the earlier round's material cannot
   support it. The third case is the honest one most of the time, and it is worth
   writing down explicitly: *this round is here because the previous round's material
   could not ground this verdict.*
3. **It owns competencies no other round owns.** See the ownership map below.
4. **Its cost is stated.** Days added to the loop, hours of interviewer time,
   candidates expected to withdraw during the additional wait. A round proposed without
   its cost is proposed against an imaginary budget.

If a proposed round fails (2) it should be merged into the round that could have made
the judgment. If it fails (3) it should be merged into the round that owns the
overlapping competencies. Merging is almost always better than deleting, because the
person who proposed it usually wanted something real.

## The ownership map

Build one table for the role before the loop opens: every competency in the assessment
plan on the left, exactly one owning round on the right, and — for the honest version —
the phase inside that round that produces the reading.

Two failure states are visible immediately in that table and in no other artifact:

- **An unowned competency.** Nobody is accountable for judging it, so at decision time
  it will either be skipped or improvised by whoever remembers it exists. An unassessed
  competency must then be recorded as unassessed rather than defaulted, per
  [absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
  — but the cheaper fix is to notice the hole in the map.
- **A multiply-owned competency.** Two or more rounds claim it. Either collapse to one
  owner, or promote the overlap to a declared replication (below).

The map is also the artifact that makes a round removable. When someone proposes
cutting a round to shorten the loop, the map answers the only question that matters:
which competencies lose their owner, and where do they go.

## Declared replication

Independent re-testing of one decisive competency is legitimate. It is not the default,
it is a design choice, and it carries conditions:

- **Declared in the map**, marked as a replication with the reason ("this competency
  decides the role and a single reading is too noisy").
- **Genuinely independent.** Different assessor; the second assessor does not see the
  first rating before recording their own. A second reading taken after reading the
  first is not a replication, it is a confirmation, and confirmations are worth roughly
  nothing.
- **Both readings survive.** The point of a replication is that disagreement is
  informative. Averaging them at the moment of recording throws away the signal you
  paid a round for; keep both, and let the decision step reconcile them.

Replication has an inverse failure worth naming: the "second opinion" round that exists
because the first round's assessor is not trusted. That is a calibration problem wearing
a loop-design costume, and adding rounds will not fix it.

## What carries forward between rounds

Purpose exclusivity survives only if the handoff between rounds carries the right
object. The rule:

- **Carry forward the probe plan** — what the next round should push on, what was left
  open, what the candidate raised that deserves a follow-up. This is the mechanism by
  which a loop compounds instead of repeating.
- **Do not carry forward the verdict** into the next assessor's preparation. A round's
  rating is bound to the material and rubric that produced it, per
  [a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged);
  re-used as prior context for a differently-scoped round, it stops being a verdict
  about what it judged and becomes an anchor for a judgment it never saw.

The practical form is a short structured handoff — open questions and observed gaps —
rather than the scorecard itself. Teams that share full scorecards forward almost
always discover, when they stop, that their later rounds start disagreeing with their
earlier ones, which is what independent assessment looks like and what they had been
suppressing.

## When not to use this

- **Very small loops.** A two-round loop for a junior role does not need an ownership
  map maintained as a living document; it needs the two purposes written in one line
  each. The discipline scales down to a sentence, and forcing the full apparatus onto
  it is process theatre of a different kind.
- **Exploratory or pre-role conversations.** A first exploratory chat with someone
  before a role exists is not a round and should not be forced into the map. It becomes
  a round the moment it produces a recorded judgment that affects advancement.
- **Rounds whose purpose is the candidate's, not yours.** A session that exists so the
  candidate can meet the team and ask questions has no assessment purpose and should be
  labelled as such — including internally, so that nobody's impressions from it leak
  into a scorecard they were never collected for.
