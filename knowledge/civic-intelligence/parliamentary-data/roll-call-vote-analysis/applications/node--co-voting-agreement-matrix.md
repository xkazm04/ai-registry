---
layer: application
type: application
subject: roll-call-vote-analysis
technique: co-voting-agreement-matrix
stack: node
status: forged
verified_on: 2026-10-10
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node: an agreement panel read against the club norm

The politicas repo computes a pairwise agreement matrix for the Czech Chamber of
Deputies and prints each MP's highest-agreement partners on their profile page.
The stack is Node 24, witnessed by the CI pin
`.github/workflows/ci.yml:36` "node-version: 24". The tree was read at commit `486c1bd`, which also carries the
change described below. The measurements come from the chamber's public dumps
(`poslanci.zip`, `hl-2025ps.zip`) as published on 2026-10-10. They were replayed
through the project's own `coVotingEdges`, extracted verbatim, because no local
store was available. The replay yields 20,496 pairs, the same count the tree records
for the stored relation.

## Where the matrix already follows the technique

The counting rules are all in one pure function. Only yes/no ballots form a shared
vote, voided roll calls are skipped, and each unordered pair accumulates into one
cell: `lib/analysis/kg.ts:123` "always accumulate the (min,max) cell". The floor is
a named, imported constant, `lib/analysis/kg.ts:34` "export const MIN_SHARED_VOTES = 50;",
and the persisted edge carries both counts:
`scripts/data-analysis/kg-compute.ts:266` "props: { shared: e.shared, agree: e.agree },".
The page prints the denominator on
every row, `features/profile/ProfilePage.tsx:505` "{ count: f.int(cv.shared) }".
It also has an honest empty state for an MP below the floor with everyone, and it
discloses its cap.

Two of the technique's rules are latent here rather than live. The writer prunes at
the floor, `lib/analysis/kg.ts:140` "if (s < minShared) continue;", while its own doc
comment says the reader prunes, `lib/analysis/kg.ts:82` "Emits the full matrix above `minShared`".
In this term the floor removed 0 of 20,496 pairs, so the contradiction costs nothing
yet. It would start to cost something in a term where short mandates overlap
briefly. The replay also found 0 duplicate (person, roll call) ballots, so the
one-ballot-per-person guard has nothing to catch in this term.

## Where it did not: the reading

The panel was headed "Closest allies" and printed rates with no reference.
The technique says a high rate means something only against a baseline measured
for the corpus, and that "allied" is a human conclusion. The replay measured
that baseline:

- Median agreement between two members of one club is 0.996. Between members of
  different clubs it is 0.431. The cross-club distribution splits into two blocs.
  Club pairs inside a bloc average 0.92 to 0.99, and club pairs across the bloc
  line average 0.35 to 0.44.
- Of the 1,624 rows shown across 203 profiles, 1,419 (87.4%) were the MP's own club.

So a printed "99.7%" read as a remarkable bond, when it was the club norm.

## The A/B

- **Arm A** is the page as it stood: the same rows, rates and denominators, with no
  reference and an alliance label.
- **Arm B** is the technique's reading. The section is renamed
  `messages/en.json:819` "Most similar voting records". Under the rows it prints the
  MP's median agreement with their own club and with other clubs, taken over every
  pairing the graph holds rather than over the rows shown:
  `features/profile/getProfileData.ts:177` "const coVoteReference = coVoteBaseline(coVotersAll, person.clubAbbrev);",
  split at `features/profile/coVoteBaseline.ts:48` "(cv.clubAbbrev === ownClub ? own : other).push(cv.agreement);".
  One sentence follows, `messages/en.json:825` "Agreement is coincident ballots, not alliance."
- **Target:** profiles printing a reference beside the rates went from 0 of 203 to
  203 of 203. Against that reference, 1,568 of the 1,624 rows sit within one
  percentage point of the MP's own-club median. Of the 205 cross-club rows, 202
  stand at or above it. Those coalition partners, who vote like the MP's own club,
  are the rows that now stand out.
- **Floor:** rows shown, their order, rates and denominators changed on 0 of 1,624.
  The sort is untouched. The project's gate ran green: 4,124 tests and a clean
  typecheck at push.

## The falsifying seam

The seam was chosen because it could refute the baseline rule. If the top rows had
stood clearly above the club norm, the bare list would carry its own meaning, and a
reference line would add nothing. The result was partial. 1,280 of the 1,624 rows are
more than one ballot above the MP's own-club median, so the order is not pure noise.
But 96.6% of the rows are within one percentage point of the median. The rows are the
top tail of the club, separated by a handful of ballots out of about 2,200.

The same seam returned a second finding. The stored weight is rounded to three
decimals, as the tree notes:
`features/profile/getProfileData.ts:102` "co-voting agreement is stored rounded to 3 dp".
Because of that, 151 of the 203
profiles cut their eight rows inside a tie, and 604 slots are filled in node-id
string order. At those cuts the exact gap between the last row shown and the first
row left out has a median of 0.0002, under half a ballot, and never exceeds 0.001.
Ranking on the exact counts would give a deterministic order, but not a closer
partner. This change leaves that defect alone, because it is a second variable. The
honest repair is to show the cut as a tie.

## What this realization cannot do

The replay read the public dumps, not the stored graph. That the stored edges equal
the replayed ones is inferred from the matching pair count and the shared function,
not observed. The rendered page was not opened. The baseline is a descriptive
median and carries no significance test. It cannot say whether one cross-club pair
at 0.99 reflects coordination, a shared agenda or shared indifference, and the page
does not claim to.
