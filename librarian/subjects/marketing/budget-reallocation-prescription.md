---
subject: budget-reallocation-prescription
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# budget-reallocation-prescription

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `paid-advertising`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** turning a triage finding into a concrete budget move, deciding which campaigns donate and which receive, projecting the lift of a reallocation and saying how sure you are, building or reviewing the approval gate around live spend changes

**Techniques (6):** donor-floor-and-movable-amount, donor-ranking-waste-vs-profit-destruction, guardrails-simulate-approve-revert, linear-projection-with-confidence-cap, pause-zero-return-before-shifting, realized-vs-projected-calibration.

**Applications (3; stacks: node):** node--donor-ranking-waste-vs-profit-destruction, node--guardrails-simulate-approve-revert, node--realized-vs-projected-calibration.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.

## Architecture review - 2026-10-31

First architecture review, against `2735ff63c`. All 13 documents read in full.
Trigger: a triage finding has to become a quantified, reversible budget move.
Intended benefit: donors ranked by what their spend destroys, burners paused rather
than shifted, a linear projection that labels its own optimism, and a gate with an
exact revert. Failure if ignored: a ratio-sorted spreadsheet that over-promises lift
and moves live money with no undo. Boundary: diagnosis, economics, causality and
pacing belong to the named neighbours.

Four findings. (1) The golden path and the donor-ranking technique still say a
zero-return campaign out-ranks every partial donor "by construction"; the pause
technique and its 2026-10-14 application already showed that holds only at equal
spend. The text contradicts itself. (2) The worked example in the golden path
claims "+22 700 CZK ... tempered by a 0.8 calibration". 22 680 is 3 600 x (8.4 -
2.1), the uncalibrated gain. With the multiplier on the recipient half only, the
technique's own rule gives 3 600 x 8.4 x 0.8 - 3 600 x 2.1 = 16 632. (3) The
learning-period paragraph says automated bidding re-learns after a large budget
change and calls the one-fifth / one-to-two-week figure undocumented convention.
Google's Smart Bidding learning page says the opposite for its platform: budget
changes do not trigger Learning status, the status never lasts more than 7 days,
and target changes converge over 1 to 2 conversion cycles. The one-fifth rule is
Meta practitioner lore; Meta's own help page could not be reached and the
practitioner sources say Meta documents no budget threshold. (4) "Average return is
an upper bound on the marginal" holds under diminishing returns, not on the convex
part of an S-curve. By the same concavity the donor's lost value read at average
efficiency over-states the loss, so "the donor half is arithmetic" is true of spend
but not of value. Google's average daily budget (up to 2x on a day, 30.4x a month)
also makes a daily delta x days an expected, not exact, period movement. The
applications rest on a private consumer tree that was not reopened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/budget-reallocation-prescription",
  "date": "2026-10-31",
  "baseline": "2735ff63c",
  "digest": "sha256-b2:5cc151043ddffaf9",
  "disposition": "clarify",
  "coverage": "All 13 documents read in full. Primary sources checked for the learning-period and daily-budget claims; Meta's help page unreachable. Consumer-tree evidence behind the six applications not reopened.",
  "counterexamples": [
    "A 2 000 CZK burner beside a 10 000 CZK donor at half target: the donor wastes 5 000, more than the burner's whole cost, so the burner does not rank first by waste.",
    "On Google Ads a budget change does not trigger Smart Bidding Learning status, so a large single-step budget shift is not by itself a learning reset there.",
    "A recipient on the convex part of an S-shaped response curve has marginal return above its average; the linear projection under-states it.",
    "Under a margin, a donor below the revenue target but above profit break-even has negative destruction: it is still a donor by the filter and ranks last.",
    "The after-window starts at the apply day's midnight, so hours before a late-day apply are counted as after."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/13020501",
      "result": "Read. 'Adjusting daily budgets takes effect immediately and allows campaigns to scale without triggering \"Learning\" status'; Learning status 'never lasts more than 7 days'; performance converges over '1 to 2 conversion cycles' after target changes. Refutes the budget-change learning claim for Google."
    },
    {
      "url": "https://support.google.com/google-ads/answer/6385083",
      "result": "Read. Daily spending limit 'two times your average daily budget for most campaigns'; monthly limit '30.4 times your average daily budget'. No minimum daily budget stated. Supports clarifying the period-to-daily conversion; leaves the floor value as convention."
    },
    {
      "url": "https://www.jonloomer.com/facebook-ads-edits-learning-phase/",
      "result": "Search-result summary only: practitioner states no exact documented budget threshold for a Meta significant edit. Supports labelling the one-fifth rule as Meta practitioner convention. Meta's own help page returned 404."
    },
    {
      "source": "Internal arithmetic",
      "result": "Golden-path example: 3 600 x (8.4 - 2.1) = 22 680 uncalibrated; calibrated recipient half gives 16 632. Burner-ranking claim refuted by the pause technique's own 2 000 vs 10 000 case."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated accounts retained; private consumer tree and its tests not re-executed. Verification dates unchanged."
    }
  ],
  "documents": {
    "budget-reallocation-prescription.md": {
      "disposition": "clarify",
      "reason": "Burner 'out-ranks every partial donor by construction' contradicts the pause technique; worked-example gain 22 700 is uncalibrated though labelled tempered (16 600); learning-period paragraph contradicted by Google's Smart Bidding page; 'average is an upper bound' needs the diminishing-returns condition and donor value loss is a model, not arithmetic."
    },
    "techniques/donor-ranking-waste-vs-profit-destruction.md": {
      "disposition": "clarify",
      "reason": "Step 3 says a zero-return campaign lands first by construction; true only at equal spend. Otherwise sound; profit-destruction algebra checks."
    },
    "techniques/pause-zero-return-before-shifting.md": {
      "disposition": "keep",
      "reason": "Already corrected to 'out-ranks only at equal spend' and count-not-ratio burner test; consistent with its application."
    },
    "techniques/donor-floor-and-movable-amount.md": {
      "disposition": "clarify",
      "reason": "Treats a daily delta x days as the period movement; Google's average daily budget can spend up to 2x on a day and 30.4x a month, so applied spend matches only on average. Floor value stays convention (no documented minimum)."
    },
    "techniques/linear-projection-with-confidence-cap.md": {
      "disposition": "clarify",
      "reason": "'Average is the ceiling of the marginal' needs concavity; 'under-states nothing on the donor side' is wrong under the same concavity (donor loss over-stated); learning-period paragraph contradicted by Google's documentation."
    },
    "techniques/realized-vs-projected-calibration.md": {
      "disposition": "clarify",
      "reason": "Rationale 'the money leaves and so does what it bought' should say the value loss is read at average efficiency and errs conservative; window, insufficient-state and clamp rules sound."
    },
    "techniques/guardrails-simulate-approve-revert.md": {
      "disposition": "keep",
      "reason": "Relative-apply / absolute-restore asymmetry, stale-claim recovery by snapshot evidence and refused empty revert are coherent and match the application."
    },
    "applications/node--donor-ranking-waste-vs-profit-destruction.md": {
      "disposition": "reverify",
      "reason": "Pinned 2026-09-08 line references in a private tree not reopened; the donor filter it quotes (roas > 0) was later changed per the pause application, so a re-pin is owed."
    },
    "applications/node--guardrails-simulate-approve-revert.md": {
      "disposition": "reverify",
      "reason": "Pinned private-tree line references not reopened; content consistent with the technique."
    },
    "applications/node--realized-vs-projected-calibration.md": {
      "disposition": "reverify",
      "reason": "Pinned private-tree references not reopened; constants agree with the technique."
    },
    "applications/node--donor-floor-and-movable-amount.md": {
      "disposition": "reverify",
      "reason": "Dated n=1 paired account with honest limits; private tree not re-executed."
    },
    "applications/node--linear-projection-with-confidence-cap.md": {
      "disposition": "reverify",
      "reason": "Dated n=2 paired account; records the unapplied 'spend saved' rule honestly; private tree not re-executed."
    },
    "applications/node--pause-zero-return-before-shifting.md": {
      "disposition": "reverify",
      "reason": "Dated n=2 paired account that drove the technique's correction; private tree not re-executed."
    }
  }
}
```

Applied the same day, against the record above. All five clarify items were
applied: each rests on a primary source opened this run or on an internal
contradiction or arithmetic error checked here. The six applications stay
`reverify` and their verification dates are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/budget-reallocation-prescription",
  "date": "2026-10-31",
  "baseline": "2735ff63c",
  "digest": "sha256-b2:4f14d820ae065fa9",
  "disposition": "reverify",
  "coverage": "Second record after applying this run's clarify items. All 13 documents re-read where edited. Consumer-tree evidence behind the six applications still not reopened.",
  "counterexamples": [
    "A 2 000 CZK burner beside a 10 000 CZK donor at half target: the donor wastes 5 000, more than the burner's whole cost.",
    "On Google Ads a budget change does not trigger Smart Bidding Learning status.",
    "A recipient on the convex foot of an S-shaped response curve has marginal return above its average.",
    "Under a margin, a donor below the revenue target but above profit break-even has negative destruction and ranks last while still qualifying.",
    "The after-window starts at the apply day's midnight, so hours before a late-day apply are counted as after."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/13020501",
      "result": "Read; budget changes do not trigger Learning status, status at most 7 days, convergence over 1 to 2 conversion cycles. Basis of the learning-period edits."
    },
    {
      "url": "https://support.google.com/google-ads/answer/6385083",
      "result": "Read; up to 2x average daily budget per day, 30.4x per month. Basis of the floor-technique conversion edit."
    },
    {
      "url": "https://www.jonloomer.com/facebook-ads-edits-learning-phase/",
      "result": "Search-result summary only; no documented Meta budget threshold. Meta help page returned 404."
    },
    {
      "source": "Internal arithmetic",
      "result": "Worked example corrected to 16 632 (shown as 16 600) calibrated, 22 680 (22 700) uncalibrated."
    },
    {
      "source": "Existing consumer applications",
      "result": "Not re-executed; verification dates unchanged."
    }
  ],
  "documents": {
    "budget-reallocation-prescription.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: burner out-ranks only an equal-spend donor, so pauses are considered first explicitly; 'upper bound' scoped to diminishing returns; donor value loss errs conservative; learning period split by platform (largest search platform documents budget changes do not trigger learning; social-platform one-fifth rule is convention), products unnamed in this layer; example +22 700 -> +16 600 calibrated."
    },
    "techniques/donor-ranking-waste-vs-profit-destruction.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 3 'lands first by construction' -> out-ranks only an equal-spend donor, pointing to the pause technique."
    },
    "techniques/pause-zero-return-before-shifting.md": {
      "disposition": "keep",
      "reason": "Unchanged; already consistent."
    },
    "techniques/donor-floor-and-movable-amount.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: daily delta x days is the expected period movement where the daily budget is an average (largest search platform: up to 2x a day, 30.4x a month), product unnamed in this layer."
    },
    "techniques/linear-projection-with-confidence-cap.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: concavity condition stated, donor half errs conservative, S-curve exception named; learning-period paragraph split by platform per the search platform's documentation, products unnamed."
    },
    "techniques/realized-vs-projected-calibration.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: donor-half rationale now says spend is arithmetic and value loss at average efficiency errs conservative."
    },
    "techniques/guardrails-simulate-approve-revert.md": {
      "disposition": "keep",
      "reason": "Unchanged; coherent and matches its application."
    },
    "applications/node--donor-ranking-waste-vs-profit-destruction.md": {
      "disposition": "reverify",
      "reason": "Pinned 2026-09-08 private-tree references not reopened; quoted donor filter later changed, re-pin owed."
    },
    "applications/node--guardrails-simulate-approve-revert.md": {
      "disposition": "reverify",
      "reason": "Pinned private-tree references not reopened."
    },
    "applications/node--realized-vs-projected-calibration.md": {
      "disposition": "reverify",
      "reason": "Pinned private-tree references not reopened."
    },
    "applications/node--donor-floor-and-movable-amount.md": {
      "disposition": "reverify",
      "reason": "Dated n=1 paired account; private tree not re-executed."
    },
    "applications/node--linear-projection-with-confidence-cap.md": {
      "disposition": "reverify",
      "reason": "Dated n=2 paired account; private tree not re-executed."
    },
    "applications/node--pause-zero-return-before-shifting.md": {
      "disposition": "reverify",
      "reason": "Dated n=2 paired account; private tree not re-executed."
    }
  }
}
```
