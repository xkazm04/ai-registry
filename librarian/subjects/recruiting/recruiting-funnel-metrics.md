---
subject: recruiting-funnel-metrics
domain: recruiting
date: 2026-09-10
last_touched: 2026-09-28
touched_by: deepen
dry_streak: 0
depth: L3
source: intake-career-ops-recruiting-20260910
---

# Recruiting funnel metrics

Added a structural source-tree application from the
[career-ops intake](../../sources/2026-09-10-career-ops-recruiting.md).
Transition history preserves timing provenance, but first-entry milestones and
same-day exclusions must not be described as general repeated-stage dwell.
The self-test could not load a required dependency; execution remains unverified.

## 2026-09-26 - `/deepen`, first pass (dp-rfm-0926): a react second stack, two rules flipped

The Curator lane dispatched this run on the finding "single stack (node)", with
registry HEAD 55c6bce2 at dispatch. The run worked from origin/main 06462e9a in a
detached worktree. It read the one joined consumer at a pinned commit, 3a07262e0
(Node 24, React 19).

**Depth rung:** L3. The two flips were measured on the consumer's own functions:
the forecast against known ground truth, the offer fold on three ledgers. L2
primary sources were used for the conditions: benchmarking-body definitions, vendor
formula documentation, forecast-disagreement and competing-risks literature, and a
visualisation authority.

**Lanes:**
- consumer tree: re-verify the three node applications and survey the React
  surface;
- counter-evidence on the web, unconstrained, eight claims;
- a blind training-data lane.

**Landed** in d998700a:
- NEW `react--stage-pass-through-and-dwell-time` (react@19): the dwell band.
  Its population is right: as of now, whatever window the reader chose. Its
  cadences are team-overridable defaults, and it colours a bar only against a goal
  the team set. It has two deviations:
  - the pair has lost its completed half: median occupant age plus oldest, both
    stock;
  - the stall claim ranks by median and prints the mean of the same array.

  The react application clears the single-stack finding.
- NEW `node--time-to-hire-basis-and-median-not-mean`. A windowed time to hire drawn
  from the creation cohort is capped by the window. The tree age-matched its deltas
  for this bias and left the headline sentence capped.
- **Flipped (three-way: tree, web, blind):** `offer-acceptance-rate-denominator`
  and the golden path's divisibility rule. On a transition-dated window, "resolved
  exceeds extended" is expected, not a recording defect. The defect is read at the
  record, and outstanding offers are a stock, not "extended minus resolved".
- **Flipped (web + blind, measured on the tree):** `forecast-signal-floor` and
  the golden path. The estimators' disagreement is a diagnostic, not the interval,
  and an interval comes from a model.
- **Conditioned (web + blind each):**
  - median vs mean: the mean where a duration is multiplied by a volume; name the
    statistic;
  - a terminal "resolved only" basis for conversion is coherent if labelled;
  - survival estimates are an alternative to withholding a young cohort;
  - the two dwell halves are biased in opposite directions;
  - calendar weeks with the partial period marked are the other honest fix; never
    mix window lengths on one surface;
  - clock anchors vary by definition and tool, so the label carries both ends.
- **Removed as unsourced:**
  - "basis is the answer four times in five";
  - "transition- and creation-dated volumes differ by 30% or more";
  - "sourcing lead time is the largest single term".

  The 6-10 week maturity horizon stays as a heuristic, to be checked against the
  local lag p90.
- **Re-verified:** all three node applications moved to 2026-09-26 with
  `verified_against: node@24`. Changes since 2026-08-20:
  - the forecast floor is now 3 hires and 4 inflow weeks, with a named ±1 SD band;
  - the offer-leg guard needs three funnel rows;
  - the momentum terminal-stage default was removed;
  - the whole view can be scoped to one role.

**Verified and left untouched:**
- The arithmetic "one 200-day revival moves a 20-hire mean by about 8 days" holds
  for typical durations of 30-50 days.
- Offer acceptance's end anchor (offer accepted, not start date) and time to fill
  starting at requisition *opened* match the benchmarking definition.
- The max denominator bounds the rate at 100% without a clamp. Its meaning changed;
  the bound still holds.
- The non-overlapping partition rule and role-not-label (the tree re-proved it: the
  literal terminal default made the hire series read zero on a renamed board).

**Declined:**
- Moving vendors' "implied" pass-through convention, which counts skippers as having
  passed every earlier stage, into the technique. It is a single web lane with no
  blind or tree support, and the technique's "skips are legal" argues the other
  way. Banked.
- Citing a reporting standard's metric text directly. It is paywalled and was
  reached only through a secondary overview, so upper layers say "some reporting
  standards" and name none.

**Consumer deviations recorded, not fixed.** kp's tree carries unrelated
uncommitted work, and three sibling runs landed in kp today. These are for
`/conform`:
- The offer panel's "awaiting response" is a net flow, and it links to the people
  at the offer column. When the net is 0 the row is hidden while offers are open.
- The stall claim prints the mean of the array it ranked by median.
- The forecast's "Expected lag" is the mean time to hire.
- `projected[].hires` is `0`, not null, when there is no signal.
- The briefing's time-to-hire sentence is capped by the window and names no
  statistic or n.
- The momentum chart spans 35 days beside 30-day figures, and its skipped rows are
  uncounted.
- From the tree lane only, not re-read by this run: the org benchmark and team stats
  do not exclude simulated rows. Simulated LLM spend enters compute cost per hire.
  The offer query has no upper bound.

**Impact.** kp: 4 contexts pair with this subject. None is judged, so 0 verdicts
went stale. The map was regenerated in kp 148e6c8b9, committed and not pushed,
because kp's main is ahead 31 and behind 3 with other runs' commits.

**Applied (6 rows):**
- three better by simulation: offer, time to hire, momentum windows;
- one better by experiment: the forecast interval;
- one unmeasurable: dwell halves, which needs completed passages folded from the
  ledger;
- one unapplied: the cohort basis, with no seam in the joined tree.

**Leads banked (single lane):**
- vendors' implied pass-through convention for skipped stages (web only);
- in-flight crediting from snapshot reach being biased low until the cohort matures
  (blind lane; written into the forecast technique only as a consequence of its
  existing matured-cohort rule);
- a "time to start" as the separately named start-date clock (blind lane).

## 2026-09-28 - `/deepen`, currency pass (dp-rfm-0928): the one drifted application executed

The Curator lane dispatched this run on "single stack (node)" from local main
d93fbd78, which was 190 commits behind origin. The 09-26 pass had already cleared
that finding with its react application. The run worked from origin/main 29be65e1
in a detached worktree.

On origin, `check-currency` still reported one event for this subject. Stack drift:
the career-ops application `node--stage-pass-through-and-dwell-time` sat at
`node@18` (verified 2026-09-10), against a fleet major of 24. The 09-26 pass
re-verified the kp applications but not this one. This run worked that event only.
No research lanes ran, so the pass does not count toward saturation, and
`dry_streak` stays 0.

**Landed:** the application's `verified_on` moved to 2026-09-28 and
`verified_against` to `node@24`. Its Verification section now records an
execution, where it had recorded an unrunnable self-test:
- with dependencies installed, `node funnel-velocity.mjs --self-test` passed on
  Node 24.14 at the pinned commit 6ddfca5a;
- it passed again at upstream 2d0285ab (2026-09-27), where `funnel-velocity.mjs`
  is unchanged since the pin;
- a mutation control removed the p75 interpolation, and the run exited 1;
- `package.json` still declares `>=18`.

The fixtures cover same-day exclusion, censoring, the n<3 suppression and the
empty ledger. No fixture covers a return to a stage, so first-entry selection
stays a reading of the code. The pinned citations still resolve, and the body's
claims are unchanged. After the edit `check-currency` shows 0 drift, 0 expired
and 0 at-risk for this subject.

**Impact.** kp: 4 contexts pair with this subject. The map records 0 of them as
judged, where 30 judged pairs elsewhere in the same map serve as the positive
control, so 0 verdicts went stale. `build-registry-map` was not run. It rewrites
all twelve fleet maps in trees where sibling runs are live, and the only thing it
would change here is the digest on four unjudged pairs. The next fleet map build
carries it.

**Applied:** none owed. No technique is new and no rule flipped.

**Return conditions:**
- career-ops changes `funnel-velocity.mjs` or its declared engine;
- kp judges one of its 4 contexts against this subject;
- one of the three banked leads gains a second lane.
