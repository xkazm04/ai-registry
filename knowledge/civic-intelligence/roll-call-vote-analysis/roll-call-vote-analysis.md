---
layer: golden-path
type: golden-path
subject: roll-call-vote-analysis
status: forged
use_when: [computing discipline or cohesion from ballots, ranking legislators by voting behavior, building a voting record page, deriving party lines from recorded votes]
techniques:
  - vote-choice-vocabulary-mapping
  - positional-vs-participation-bases
  - club-line-and-rebellion
  - rice-cohesion-index
  - co-voting-agreement-matrix
  - tally-reconciliation
---

# Roll-call vote analysis

A roll-call record is the rare civic dataset where the primary source is nearly
complete: for every recorded division, every legislator's individual choice is
published. That completeness is a trap. Because the raw material is so good,
every derived number — a rebellion rate, a cohesion index, an agreement score —
*looks* as authoritative as the ballots underneath it, when in fact each one
embeds a stack of definitional choices: what counts as a vote, what counts as a
position, what a party's "line" even is, and which divisions were fit to measure
at all. The craft of this subject is making those choices explicitly, once,
in reviewable code — and then refusing to claim anything the definitions cannot
carry.

The stakes are personal. Every output of this analysis attaches to a named,
living politician: "the chamber's biggest rebel", "the least disciplined
party", "votes with the opposition 84% of the time". A wrong number here is not
a bug, it is a published falsehood about a person. That is why the whole
pipeline is deterministic — a language model may narrate the results, but every
count and rate is computed by code that can be re-run and audited, and any
figure that cannot be re-derived does not render.

## The ladder of derivation

Roll-call metrics form a strict ladder, and every rung inherits the
definitional debt of the rungs below it:

1. **Choice vocabulary** — the source's per-ballot codes mapped to a stable,
   documented set of meanings (vote-choice-vocabulary-mapping).
2. **Bases** — which choices count as *present* and which count as *positional*
   (positional-vs-participation-bases). Every metric above names its base.
3. **The line** — a per-vote, per-party majority position, derived not asserted
   (club-line-and-rebellion).
4. **Aggregates** — rebellion rates, Rice cohesion, pairwise agreement
   (rice-cohesion-index, co-voting-agreement-matrix). Each carries minimum-
   support thresholds so no rate is published off a handful of observations.
5. **Verification** — the recomputation checked against the chamber's own
   published totals (tally-reconciliation), because an analysis whose brand is
   "every number is checkable" must include its own recount in that promise.

The order matters because errors are silent as they travel up. A vocabulary
mistake at rung 1 — treating "did not press a button" as "abstained", or an
unknown code as "no" — does not crash anything; it just shifts every rate above
it by a few points, in a direction no one can see. The defense is to make each
rung a small, pure, unit-tested function whose definition is written down where
the reader of the final number can find it.

## Non-participation is not a position

The single most consequential distinction in the subject: **absence, excusal,
abstention, and not-pressing are forms of non-participation, and
non-participation is never agreement and never rebellion.** A legislator who
was not in the room did not defy their party. A legislator who abstained did
not vote with the opposition. Metrics that fold non-participation into a
positional bucket manufacture discipline findings out of attendance patterns —
and attendance has its own legitimate metric, computed on its own base.

This discipline has a known cost, and honesty requires stating it: strategic
absence is a real political behavior — a legislator who wants to defect
without a recorded "no" simply skips the vote — and a strictly positional
rebellion metric cannot see it. The field's standard cohesion measures share
this blindness (a party where 20 of 100 members vote and 80 stay away scores
as perfectly unified). The answer is not to smuggle absences into the
positional metric; it is to publish the participation metric *beside* the
positional one and let the divergence itself be the signal.

## The source's categories are the ceiling

A recorded vote system publishes what its rules of procedure define, and those
rules change. When a chamber's own machinery stops distinguishing two choices —
merging "abstained" and "did not vote" into one code, as procedural reforms
sometimes do — then any metric that needs them separately **cannot be computed
for the affected period**. The correct output is a merged category, honestly
labeled, and a stated limitation. Splitting the merged number by assumption,
historical ratio, or model is fabrication with extra steps. The same posture
applies to every sentinel and gap the source ships: an unknown-value sentinel
is recorded as unknown, never as its face value, and a division the source
dates with nothing falls out of any date-bucketed view *with the loss counted
and named*.

## What roll-call analysis is allowed to conclude

The academic literature on recorded votes carries two warnings that bound every
claim this subject makes:

- **The recorded agenda is a curated sample.** In many legislatures, which
  divisions are recorded at all is a strategic choice — requested to put
  behavior on the record. Cohesion and ideology estimated from recorded votes
  need not match behavior on unrecorded ones. Where the chamber records
  everything, say so, because it is a genuine strength; where it does not,
  never generalize from "recorded votes" to "voting behavior".
- **Agreement is coincidence, not alliance.** A high pairwise agreement rate,
  a low cohesion score, a rebellion streak — these are facts about ballots.
  "These two are allies", "this party is fracturing", "this member is defecting
  to the opposition" are interpretations, and they require either human
  judgment or an explicitly labeled interpretive layer. The numbers are leads;
  the story is a separate, gated act. Spatial ideal-point models sit further
  still along that ladder — powerful, but model-dependent estimates with
  uncertainty, never raw facts.

## Thresholds are part of the method

Every published rate carries a minimum-support gate: a pairwise agreement
score needs a floor of shared positional votes, a rebellion rate needs a floor
of eligible votes, a party's per-vote cohesion needs a floor of participating
members. Below the floor the honest value is *not measured* — a first-class
state, rendered differently from zero and from perfection — because a 100%
rate over three ballots is noise wearing a percentage sign. The thresholds
themselves are named constants, defined once, imported by every consumer, and
disclosed in the copy next to the numbers they gate. A threshold restated as a
literal in a second place is a future drift, and in this domain every drift
lands on a named person.

The same rule governs presentation caps: a "top rebels" table sliced to N rows
ships the size of the qualified population it was drawn from, counted before
the slice, so "the worst N of M" can never read as "only N exist".

## Failure modes this standard exists to prevent

- **The attendance-as-defiance error** — absences or abstentions counted as
  votes against the line, converting sick leave into rebellion.
- **The split that isn't there** — decomposing a source-merged category by
  assumption to feed a metric the source stopped supporting.
- **The three-ballot rebel** — rates published without minimum support,
  crowning outliers from noise.
- **The tied line** — asserting a party position on a vote where the party
  split evenly; a tie has no line, and the vote is skipped for that party.
- **The unchecked recount** — deriving every metric from re-tallied individual
  ballots without ever comparing the re-tally to the totals the chamber itself
  published, then discovering the ingest was short a member for a year.
- **The silent drop** — voided divisions, undated divisions, unaffiliated
  members excluded from a metric without a count of what was excluded.
- **The narrated number** — a generative layer paraphrasing rates into claims
  the definitions don't support ("routinely votes against their party" from a
  rate computed over one contested week).

## The techniques

- [vote-choice-vocabulary-mapping](techniques/vote-choice-vocabulary-mapping.md)
  — source codes to a stable choice vocabulary; sentinels, merged categories,
  and the refusal to compute what the source stopped supporting.
- [positional-vs-participation-bases](techniques/positional-vs-participation-bases.md)
  — the two denominators every metric must choose between, and why the choice
  is named in the output.
- [club-line-and-rebellion](techniques/club-line-and-rebellion.md) — deriving
  the party line as a strict per-vote majority, ties yielding no line, and
  rebellion as opposition to it under a support floor.
- [rice-cohesion-index](techniques/rice-cohesion-index.md) — the classic
  |yes−no|/(yes+no) cohesion measure, its known blind spots, and the gates
  that keep it honest.
- [co-voting-agreement-matrix](techniques/co-voting-agreement-matrix.md) —
  pairwise agreement over shared positional votes, computed densely, pruned by
  the reader not the writer.
- [tally-reconciliation](techniques/tally-reconciliation.md) — recomputing the
  chamber's own published totals from ingested ballots; a difference is a
  disclosed finding, never a repair.
