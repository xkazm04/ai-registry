---
layer: golden-path
type: golden-path
subject: funder-intelligence-index
status: forged
use_when: [publishing aggregate funder statistics from applicant outcomes, designing a win-probability or difficulty signal, deciding what a shared outcome dataset may disclose, auditing whether a fit score earns the trust it claims]
techniques:
  - award-rate-by-revenue-bracket
  - rfp-difficulty-scoring
  - k-anonymity-suppression
  - consent-scoped-contribution
  - win-probability-confidence-bands
  - fit-calibration-monotonicity
---

# Funder intelligence index

Every submitted application ends in an outcome, and almost every organization
throws that outcome away. A funder intelligence index is the discipline of
keeping it: turning individual application results — submitted, awarded,
declined, at what fit, by whom, for how much — into a publishable dataset about
*funders*: how often they award, how hard each program is, how the odds shift
with applicant size, and what an applicant like you should expect before
spending eighty hours on a proposal. It inverts the usual information
asymmetry. Funders see every applicant; applicants see only their own history.
Pooling outcomes across organizations gives the applicant side the base rates
the funder side has always had.

The naive reading is "collect outcomes, compute averages, publish a
leaderboard." That reading fails on four independent axes, and the subject is
the study of all four: the **statistics** are wrong (small samples masquerade
as rates), the **privacy** is wrong (a published cell can identify the one
organization behind it), the **consent** is wrong (contributors never agreed
to be data), and the **honesty** is wrong (the index asserts predictive power
it has never measured against its own record). An index that gets any one of
these wrong is worse than no index, because it publishes lies with the
typography of facts.

## The pipeline: from event to publishable cell

The index is a pipeline of deliberate reductions, and each stage is a design
decision, not plumbing:

1. **Capture at the moment of truth.** An outcome row is written when an
   application changes state — submitted, awarded, declined — not
   reconstructed later from memory. Each row carries the contributor's
   identity (for consent and k-counting), the funder, a coarse program
   bucket, the applicant's size band, the fit score the application was
   submitted at, the funding-cycle bucket, and the awarded amount when there
   is one. Precision is deliberately discarded at write time: size becomes a
   bracket, the program title becomes a non-reversible bucket, the date
   becomes a cycle. What is never stored cannot leak.
2. **Collapse events into applications.** One application generates several
   state-change rows over its life. Rates are computed over *applications*,
   not events — a submission that was later awarded is one datum, not two —
   and re-recording the same transition must overwrite, not duplicate, or
   every retry inflates the denominator.
3. **Aggregate under a suppression floor.** Cells — per funder, per funder ×
   size band, per program — are computed only over consenting contributors
   and published only when enough *distinct organizations* stand behind
   them. Below the floor the cell does not exist.
4. **Publish with methodology attached.** Every published figure travels
   with its as-of date, its source description, its privacy floor, its
   refresh cadence, and its known biases. A number without its methodology
   is a rumor.

## The two-sided ledger: private truth, public aggregate

The same outcome data serves two audiences under two different rules, and
conflating them is a recurring failure. The *contributor's own dashboard* may
show that organization everything about itself — its own win rate, its own
history — because there is no privacy question in showing you your own data;
the only guard needed there is statistical (a win rate over two decided
applications is noise, so even the private view suppresses below a minimum
decided count). The *public index* shows only aggregates, and there the guard
is dual: statistical (small samples lie) **and** adversarial (a small cell
identifies its members). The floors differ — a private minimum of a few
decided outcomes, a public floor of several distinct contributors — because
they defend against different attacks. Reusing one floor for both jobs means
one of the two is miscalibrated.

## Consent and suppression are different protections

The two privacy mechanisms are frequently confused because both remove data
from publication, but they answer different questions. **Consent** answers
"may this organization's outcomes enter the pool at all?" — it is a per-
contributor gate, honored retroactively (an opt-out removes the organization
from the *next* computation, not just future rows), with a privacy-
conservative default for anyone whose consent state is unknown.
**Suppression** answers "may this computed cell be shown?" — it is a per-cell
gate applied after consent filtering, protecting the contributors who *did*
consent from being individually inferable. Neither substitutes for the other:
a consenting organization can still be exposed by a cell of one, and a
suppressed cell does not make non-consented data acceptable to hold. The
system needs both, in that order, as separate code paths that a reviewer can
point at separately.

## Honesty is a measured property, not a tone

An index makes implicit predictive claims — "this funder is hard," "orgs like
yours win here N% of the time," "high fit means better odds" — and each claim
must be either backed by measurement or visibly downgraded:

- A **rate** is published with the sample size that produced it, and the
  displayed confidence follows the sample, not the layout. In sector
  practice, foundation award rates run from low single digits at
  national-scale funders to 30% and beyond at local ones — a spread wide
  enough that a rate without its n is uninterpretable.
- A **probability** shown to a user is a base rate from an observed cell, or
  it is nothing. When no cell covers the user's situation, the honest output
  is *no estimate* — never a default, never a global average dressed as a
  personal number.
- A **fit score** that drives submission decisions owes the system a
  calibration audit: do applications submitted at high fit actually win more
  often than applications at low fit, in this dataset? If observed award
  rate is not monotonic in fit band, the scorer is decoration, and the index
  must know that before its users do.

## Live data earns its place cell by cell

Every index starts with a curated prior — hand-researched figures, published
funder reports, sector benchmarks — because observed data arrives slowly and
unevenly. The transition from curated to observed is where a subtle
architectural failure lives: the **all-or-nothing cutover**, where the first
observed cell to clear the suppression floor flips the entire surface from
curated to live, replacing a broad useful prior with one row of observed
truth. The correct semantics is a **per-cell merge**: an observed cell
replaces its curated counterpart only when it clears the floor; curated cells
without observed counterparts are retained; observed-only cells are appended.
Each row then carries its own provenance note — "observed from N applications
across M organizations" versus the curated note — so a blended surface is
self-describing and no reader has to guess which regime a number came from.

## The methodology page is part of the product

A published index is a citable dataset, and citable datasets carry their
methodology as a first-class surface, in the tradition of national-statistics
practice: the **as-of date** (a buyer's first question is "how stale is
this?"), the **source** (who contributes what, under what consent), the
**privacy floor** (stated as the same number the code enforces — sourced from
one constant so the disclosure cannot drift from the implementation), the
**refresh cadence**, and a **bias note** naming the panel's known skew (an
opt-in panel over-represents whoever adopted the product first, and rates
generalize only as far as the panel does). The bias note is the one most
often omitted and the one that most separates an honest index from a
marketing page.

## Failure modes this standard exists to prevent

- **The 100% win rate** — a true number computed over two applications,
  published as if it meant something.
- **The cell of one** — an aggregate that is somebody's private history with
  the name removed and trivially restored.
- **The silent conscript** — outcomes published from organizations that
  never opted in, or that opted out and stayed in the aggregates.
- **The confident stranger** — a win probability shown for a situation no
  observed cell covers, synthesized from a default.
- **The uncalibrated oracle** — a fit score marketed as predictive that has
  never been checked against the outcomes it claims to predict.
- **The cliff cutover** — live data replacing the entire curated surface the
  moment the first cell qualifies.
- **The drifting disclosure** — a methodology page promising one privacy
  floor while the code enforces another.

## The techniques

- [award-rate-by-revenue-bracket](techniques/award-rate-by-revenue-bracket.md)
  — the core published cell: applications, awards, rate and median award per
  funder × applicant-size band, computed over collapsed applications.
- [rfp-difficulty-scoring](techniques/rfp-difficulty-scoring.md) — mapping
  observed award rates onto a small ordinal difficulty scale calibrated to
  the real spread of funder selectivity.
- [k-anonymity-suppression](techniques/k-anonymity-suppression.md) — the
  publication floor: distinct-contributor counting, granularity fallback,
  and the subtraction attacks a naive floor misses.
- [consent-scoped-contribution](techniques/consent-scoped-contribution.md) —
  opt-in as the load-bearing mechanism: retroactive opt-out, conservative
  defaults, and the provenance notice contract.
- [win-probability-confidence-bands](techniques/win-probability-confidence-bands.md)
  — turning a cell's base rate into a personal estimate with sample-driven
  confidence, and refusing to estimate off-cell.
- [fit-calibration-monotonicity](techniques/fit-calibration-monotonicity.md)
  — the honesty audit: binning outcomes by submitted fit score and testing
  whether higher fit actually wins more.
