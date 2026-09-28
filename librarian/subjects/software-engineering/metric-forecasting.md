---
domain: software-engineering
subject: metric-forecasting
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L2
---

# metric-forecasting

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-mf-0926)

Dispatched by the Curator lane on "single stack (node)". All three
applications read one TypeScript maturity-forecast module. The run had four
lanes:
- a read of three fleet trees the subject reaches: systedo-case's
  monthly pacing (TypeScript, joined by the map), tracklight's spend-forecast
  gate (Rust, **not** joined by the map; found by a per-project search for
  forecasting code outside TypeScript), and ascent's forecast module (the
  existing applications' source);
- web counter-evidence on five claims, against FPP3, the NIST handbook, the
  R Journal's inverse-prediction paper and practitioner pacing sources;
- a blind training-data lane;
- a day-by-day replay simulation through systedo-case's own pacing code.

**Counter-evidence: none refuted, four conditioned, the rest confirmed.**
- "OLS is almost always right; richer methods buy the appearance of rigour":
  conditioned. The closed-form OLS prediction interval needs no bootstrap and
  widens with thin evidence. Theil–Sen keeps every property the technique
  names and survives one misfired scan. Smoothing and decomposition stay
  refused.
- The crossing range: conditioned. It is the inverse-prediction interval,
  unbounded when the slope is not distinguishable from zero, and not gated on
  R². fit-confidence-honesty already said R² is not a forecast measure; the
  crossing technique still let "fit confidence" gate the range.
- Anchoring on the last observation: conditioned (see convergence).
- Linear pacing: conditioned (see measurement).
- Horizon cap: confirmed in direction. No source for "one year" exists; it
  stays a labelled domain judgement. The evidence-derived alternative (a
  horizon from interval width) is banked.
- Left untouched: the two-dimensional gate, measuring from now, withheld is
  not zero, and the degenerate two-point R².

**Convergence.** The blind lane and the web lane independently conditioned
the anchor. Anchoring on the last observation is random walk with drift,
which is right for a persistent metric. It imports the last sample's full
noise, and one lane gave "anchor on the fit when the last point is an
outlier" without prompting. tracklight's tree is the third branch in code: a
smoothed EWMA origin for a noise-dominated daily counter. Both lanes also
reached Theil–Sen and the calibration interval. The condition landed in the
golden path and the technique; no new technique was earned.

**Measurement (simulation, systedo-case's own `monthlyPacing` and
`weekdayWeights`).** The arms used the same projection, calendar target line
against shaped target line. They replayed every day of 21 closed months, 617
replays per arm, plus three real bursty daily series (commits per day in
three fleet repos, goal = median of the three prior months).

| Series | Calendar line | Shaped line |
| --- | --- | --- |
| Shipped dataset (mild shape, ±10%) | 2-4 flips, 0.8-1.1% wrong | 4 flips, 1.3-1.8% wrong |
| Same data with a strong business-days shape imposed | 27-28 flips, 7.1-7.3% wrong | 3-10 flips, 1.6-4.9% wrong |
| Real commit series | never disagreed with the shaped line | - |

The shaped current verdict equalled the forecast verdict on every replay (0
breaks), which is algebra when the projection is the shaped run-rate.

**Landed** (3d5147e8):
- `applications/rust--projection-presentability-gates.md`:
  `verified_on: 2026-09-26`, `verified_against: rust@1.96.1`. It covers the
  dense-zero-fill defect, the non-zero-day floor, `refused[]` prose, r²
  withheld through to the pager, the level-relative flat band, EWMA origin
  and burn-rate corroboration. It also records that a refused projection
  still ships its numbers in the JSON.
- Conditions in the golden path (anchor, target line) and in
  trend-fitting-and-anchoring, pace-against-a-deadline,
  threshold-crossing-eta and horizon-caps-and-flat-bands.

**Declined:**
- A code change in systedo-case to a shaped target line. The simulation says
  not-better on the shipped data. Return: a real account whose weekday shape
  is strong against its monthly noise.
- A metric-forecasting application for systedo-case's pacing. The marketing
  bundle's goal-pacing-and-forecast already carries it
  (node--weekday-weighted-month-end-projection). A second copy here would be
  a second authority.

**Banked leads:**
- Marketing goal-pacing-and-forecast holds both positions: its golden path
  warns that a flat target makes a Friday business "behind plan every
  Wednesday", while its weekday-weighted technique (step 5) and its band
  technique keep the flat plan line as a second, "both are right" verdict.
  The measurement above bears on that subject directly: under a strong shape
  the calendar badge was wrong on 39 of the 43 replays where it disagreed with
  the projection. Return: the next marketing pass on that subject.
- Burn-rate corroboration before paging (recent mean above window mean), one
  tree. Return: a second tree that gates alerts on a projected crossing.
- The evidence-derived horizon (withhold when the interval exceeds a
  tolerance) against the fixed one-year cap. Return: a tree that computes a
  crossing interval.
- The inbox's 2026-08-29 derived-leg lead (kp hire forecast) stays banked in
  the recruiting lane, where its application lives.

## Impact

Map rebuilt against 3d5147e8; subject revision 2, digest
sha256-b2:40bc666cc27ebc42.
- ascent: 3 contexts, 0 stale verdicts (unjudged).
- systedo-case: 3 contexts, 0 stale verdicts (unjudged).
- kp: 1 context, 0 stale verdicts (unjudged).
- personas: 1 context, 0 stale verdicts (unjudged).
- tracklight: 0 contexts. Its forecast gate realizes this subject and the map
  does not join it, so this is a coverage miss in the join rather than in the
  corpus.

Map commits: pushed in pof and athena-everywhere. In gravitone, goat, tracklight,
pumper, personas and kp the commit is local, because the default branch has diverged
from origin with other sessions' commits. In politicas (test), ascent (verify),
systedo-case (gate) and tracklight (test) the commit is also local, because the
pre-push gate failed on the stack of commits the push would carry; no gate was
bypassed. personas-web is committed on its active feature branch.

## Saturation

L2 (primary statistical sources plus three real trees and one simulation).
Clocks: the Rust application verified 2026-09-26; the node applications
remain at 2026-08-20. Dry streak 0. Next pass: a `code` row in ascent for the
anchor condition once its re-scan spread is measured; the tracklight join;
a python or go stack if a fleet project grows one.
