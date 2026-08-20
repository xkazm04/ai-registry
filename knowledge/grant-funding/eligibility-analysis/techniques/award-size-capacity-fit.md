---
layer: technique
type: technique
subject: eligibility-analysis
technique: award-size-capacity-fit
status: forged
laws: [hard-gates-precede-soft-scores, never-fabricate-a-figure]
shared_with: []
use_when: [screening opportunities by award size against organizational capacity, handling single-bound award ranges, a too-large award was recommended to a small organization]
---

# Award-size capacity fit

An award an organization cannot responsibly absorb is a trap, not a prize:
funders assess capacity in review (and a mismatch loses on their side first),
and a small organization that does win an outsized award inherits compliance,
audit and delivery obligations that can sink it. The capacity gate screens
the opportunity's award range against the applicant's financial size before
anyone argues fit. It is the most heuristic of the four gates, and its craft
is mostly about not over-claiming what a heuristic knows.

## The comparison, done honestly

1. **Normalize currency first.** The award range and the applicant's revenue
   must be in one currency before any comparison; comparing a foreign-
   denominated ceiling against home-currency revenue as if the numbers were
   commensurate mis-sizes every cross-border opportunity by the exchange
   rate. Keep the native amount for display; compare on the normalized pair,
   falling back to native only when the row predates normalization and the
   currencies genuinely match.
2. **A missing bound is open, not mirrored.** An "up to X" opportunity has an
   effective floor of zero; an "at least X" opportunity is unbounded above.
   Collapsing a missing bound to the published one produces two concrete
   bugs: a high-ceiling/no-floor opportunity trips the capacity check
   (the floor wrongly inherits the big ceiling), and single-bound rows spoof
   the fit band. Encode `floor = published ?? 0`, `ceiling = published ?? ∞`.
3. **No range at all → unknown.** Many listings publish no amounts. That is
   an unanswered question for the applicant to check, not a pass and not a
   fail.
4. **No revenue on file → unknown, with a prompt.** The gate cannot run
   without the applicant's figure, and it must ask for the real number —
   never assume one. The revenue figure is the applicant's verified fact;
   nothing in this gate invents or estimates it.

## The two thresholds

- **Capacity ceiling (the only fail):** when the award *floor* — the
  smallest amount the applicant could be awarded — exceeds annual revenue,
  flag a likely capacity mismatch. A single award larger than a year's
  entire budget roughly doubles the organization overnight; funders read
  the same ratio and score it down. This is the one condition harsh enough
  to fail on, and even it ships with its doorway: the opportunity remains
  *reachable as a coalition* with complementary partners, where the lead's
  capacity is the consortium's, and the fail message says so.
- **Sweet-spot band (pass):** when the award range overlaps roughly 5–40%
  of annual revenue, pass. The band is a screening heuristic, not a
  published sector norm — what the field actually publishes is concentration
  guidance (a single funding source above roughly a quarter to a third of
  revenue is a board-level risk conversation), and the band's upper edge
  sits deliberately near that line: below the band the award may not be
  worth the application's cost; above it concentration risk climbs. Field
  practice also sanctions far larger asks where alignment and relationship
  are exceptional — which is exactly why off-band is unknown, not fail. Overlap means
  `ceiling ≥ 5% of revenue AND floor ≤ 40% of revenue` — the range touching
  the band, not sitting inside it.
- **Everything else → unknown** ("outside the typical sweet spot — check
  capacity"). A too-small award and a large-but-under-revenue award are
  judgement calls for the applicant, not verdicts for a heuristic.

## Decision rules

- **Fail only on floor > revenue, never on ceiling > revenue, because** a
  generous ceiling with a modest floor lets the applicant request an
  appropriate amount; only a *minimum* it cannot absorb removes the choice.
- **Tie the band to revenue, not to a fixed money threshold, because** the
  same award is transformative for one applicant and rounding error for
  another; fixed thresholds encode one customer's size into the gate.
- **When a public-funder regime mandates an audit above a cumulative
  annual-expenditure threshold, surface the crossing in the gate's detail —
  and keep the threshold as dated data in the jurisdiction model, never a
  constant in code, because** an award that pushes a small organization over
  the line carries a real compliance cost the revenue ratio alone does not
  show, and the threshold itself is regulation, which moves.
- **When the applicant explicitly pursues step-change funding, let the fit
  layer argue past an unknown — but not past the fail, because** ambition
  changes the argument, not the arithmetic of absorbing a floor larger than
  the budget alone; the coalition doorway is the sanctioned route.

## When not to use

Capacity gating presumes project-grant economics. For instruments where the
award *is* the organization's budget by design — venture-style catalytic
funding, first-institutional-grant programmes, prize money with no delivery
obligations — the revenue ratio is the wrong lens; suppress the gate (return
unknown with a note) rather than emit fails the instrument's own logic
contradicts.
