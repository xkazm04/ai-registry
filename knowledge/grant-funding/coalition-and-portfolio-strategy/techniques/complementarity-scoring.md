---
layer: technique
type: technique
subject: coalition-and-portfolio-strategy
technique: complementarity-scoring
status: forged
laws: [hard-gates-precede-soft-scores]
shared_with: []
use_when: [ranking candidate partners for a coalition, judging whether a proposed consortium reads as breadth or redundancy]
---

# Complementarity scoring

The concern: given an applicant that needs partners and a pool of candidate
organizations, rank the candidates by how much each one *strengthens the
coalition's case* — not by how much each one resembles the applicant. Funders
fund consortia to buy coverage a single organization cannot offer: more of the
target population, more of the service spectrum, more of the delivery chain. A
partner who duplicates the applicant adds budget and nothing else, and a reviewer
reads a coalition of near-duplicates as one organization with passengers.

## The score: what does this partner add that we lack?

The workable formulation measures the **fraction of a candidate's capabilities
that are new to the applicant**. Represent each organization's mission and
capabilities as a normalized set of terms (lowercased, trimmed — the comparison
is only as good as the normalization). Then:

    complementarity(applicant, candidate) =
      |candidate terms not in applicant terms| / |candidate terms|

The denominator choice is deliberate and load-bearing: dividing by the
*candidate's* term count asks "how much of what they bring is fresh?" A large
organization overlapping the applicant on nine capabilities and adding one scores
low (0.10 — mostly redundant); a small focused organization whose three
capabilities are all new scores 1.0. Dividing by the union (a plain similarity
inverse) would reward candidates for being large; this formulation rewards them
for being *additive*.

An empty capability set scores zero, not unknown-high: a candidate about whom
nothing is known cannot be argued as adding anything, and the score must never
reward missing data.

## The sameness constraint: complementary, not incoherent

Pure complementarity maximization assembles a coalition of maximally unrelated
organizations — which no funder wants either. The coalition must be legible as
**one intervention in one place or system**: same region, same target population,
or same service chain. So the ranking combines a hard sameness term with the
complementarity term — for example, a binary same-region indicator added to the
complementarity fraction, so a same-region complementary partner outranks an
out-of-region one at any complementarity level. The design intuition: **be the
same where the funder needs coherence; differ where the funder needs coverage.**
Which axis carries the sameness constraint is grant-specific — a place-based
funder needs geographic sameness; a systems-change funder may need population
sameness across regions. Read the grant before wiring the constraint.

## Assembly: greedy until the floor clears

With candidates ranked, assembly is greedy: add the best-ranked candidate,
recheck combined capacity against the award floor, stop the moment it clears.
Tie-break equal scores by capacity, so the coalition stays small. The stopping
rule matters as much as the ranking — every member past the floor adds
coordination cost, dilutes every share, and lengthens the weakest-link compliance
chain without strengthening the application. **The best coalition is the smallest
one that clears the floor with the most complementary members.**

Two honest-output rules govern the result. If the applicant already clears the
floor alone, propose nothing — a coalition nobody needs is pure overhead, and a
system that proposes them teaches users to ignore its proposals. If even the full
candidate pool falls short, still return the assembled best attempt with
reachability marked false and the shortfall visible: "80% of the floor with
everyone in" is a recruiting target or an informed walk-away, but it must never
be presented as reachable.

## Decision rules

- When a candidate's complementarity is high but the sameness constraint fails,
  exclude by default — coherence is what makes breadth fundable. Override only
  when the grant's own text invites cross-region or cross-population consortia.
- When two candidates tie on score, prefer the higher-capacity one: fewer
  members, same coverage.
- When the top candidates are all near-duplicates of the applicant (uniformly low
  complementarity), surface that as a finding — the honest advice may be "your
  network cannot produce a strong coalition for this grant" — rather than
  shipping the least-bad ranking as if it were a good one.
- Candidates are ranked only from among **consenting** peers. Scoring
  organizations into a coalition that never agreed to be in one produces
  proposals that collapse on first contact; consent is a precondition of the
  pool, not a follow-up.

## When not to use

Keyword-set complementarity is a screening heuristic, not a due-diligence
verdict. It cannot see quality, reputation, financial health, or whether two
organizations' leaderships can stand each other — the factors that actually sink
coalitions. Use it to order the shortlist a human evaluates, never to auto-commit
partnerships. And skip the technique entirely when the coalition's composition is
dictated — some programs prescribe who must be at the table (employers, schools,
health systems); there the job is verifying required seats are filled, not
optimizing free ones.
