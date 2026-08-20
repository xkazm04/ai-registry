---
layer: application
type: application
subject: roll-call-vote-analysis
technique: club-line-and-rebellion
stack: node
status: forged
verified_on: 2026-08-19
---

# Club line and rebellion in a civic-graph pipeline (node)

The politicas repo computes lines and rebellion twice from one shared
definition set, in two pure DB-free modules: the knowledge-graph pass
(`lib/analysis/kg.ts`) and the vote-record page derivation
(`features/votetrack/record/derive.ts`). Both import their bases and floors
rather than restating them — the one-definition rule realized as module
exports.

## The vocabulary and bases underneath

`packages/czech-civic-data/src/normalize.ts:72-131` is the vocabulary layer:
`voteChoice()` maps the publisher's schema codes (quoted from the schema page
in the doc comment) to the stable `VoteChoice` union, including the merged
`abstain_or_not_voting` bucket — with the ceiling rule stated at the source:
"since the 1995 amendment of the rules of procedure the Chamber itself stops
distinguishing the two … Any product metric that needs 'abstained' separately
from 'did not press' CANNOT be computed for post-1995 terms. Say so; do not
split the number." Directly below, the two bases are exported constants:
`PRESENT_CHOICES` (the attendance base) and `POSITIONAL_CHOICES = {yes, no}`
(`:122-131`). `kg.ts:47-50` wraps the latter as `positionOf()`, returning
`null` for every non-positional choice — the "non-participation is never
rebellion" rule as a total function.

## Line derivation, tie included

`kg.ts` `rebellion()` (`:175-241`) buckets positional ballots per vote per
club, then derives the line as strict majority with the tie case explicit:
`const majority = t.yes > t.no ? 1 : t.no > t.yes ? 0 : -1; if (majority ===
-1) continue; // tie → no club line on this vote` (`:222-223`). Eligible
votes increment only past that guard; a rebel is `v.pos !== majority`. The
page derivation states the same rule as `lineOf()` (`derive.ts:141-145`,
"tie yields no line") and discloses it verbatim in the UI copy — the header
(`derive.ts:9-35`) is a literal list of the disclosed rules, including
voided-vote exclusion and "MPs without a resolved club render but are never
scored".

## Floors and the population-before-cap discipline

Thresholds are named exported constants at `kg.ts:31-38`:
`MIN_SHARED_VOTES = 50`, `MIN_ELIGIBLE_VOTES = 50`, `MIN_CLUB_POSITIONAL = 5`,
each with a one-line rationale ("so a rate is never published off a
handful"). `rebellion()` gates its outputs to `eligibleVotes >= minEligible`
and sorts deterministically (`rate desc, person id`, `:230-240`).

The page's top-rebels ranking (`derive.ts:475-496`) separates the
measurement floor from the presentation cap on purpose — the comment says
the measurability threshold and the presentation bound are split
deliberately, because without the population count "the worst 12 of N"
cannot be distinguished from "only 12 rebelled". `qualifiedRebels` is
filtered by the floor first, `topRebelsTotal = qualifiedRebels.length` is
taken before `.slice(0, topRebelsCap)`, and both ship in the payload
(`:522-523`). The sort ends in `name.localeCompare(…) || personPspId` — a
total order, so equal-rate rebels never reshuffle between builds.

## Coverage as a first-class output

The derivation returns a `coverage` block (`derive.ts:526-544`) counting
every exclusion the metrics made: voided divisions, valid-but-undated
divisions that fall out of the day-bucketed seismogram (`withoutDate`, with
a comment noting it "used to vanish silently"), and unaffiliated seats. The
seismogram itself renders a day where no club cleared `MIN_CLUB_POSITIONAL`
as `meanCohesion: null` (`:393`) — not measured, drawn differently from a
unified day, per the header's own doctrine.
