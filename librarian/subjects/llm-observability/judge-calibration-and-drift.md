---
domain: llm-observability
subject: judge-calibration-and-drift
---

# judge-calibration-and-drift

## 2026-08-28 - /harvest batch 1 + A/B evaluation

Two landings: a panel-of-judges section on `judge-selection-by-spread`
(externally corroborated ~1/7-cost ensemble) and difficulty-conditioned
agreement + verbosity-inflation fixtures on `golden-set-agreement-measurement`.
Both A/B probes returned **impact-positive** (blind 10-9 and 10-8): in the
selection probe the entire margin was the landed panel row, correctly applied
with the members-must-span-families caveat against an all-one-family candidate
space; in the calibration probe the gap sat on difficulty conditioning and
gameability probes. Evaluation ledger: [[../../harvest/evaluations.md]].

### 2026-08-31 - `/intake`, from danluu.com (2026 posts)

`repeatability-floor` added, and it came from a **cross-bundle asymmetry** rather than
from the source. Two bundles both cover judge instability; only one models it. The
builder-side offline harness has carried a repeatability floor for weeks ("a 0.3 delta
is noise if the judge disagrees with itself by 0.4"). This subject runs an agreement
coefficient, a trust bar, a per-cycle drop alert and a windowed baseline regression -
every one of them computed from **one judge score per item**, with no floor beneath
any of them. Both files score identically on any keyword; only opening both shows it.

The consequence is the part this subject was missing: the floor is the **minimum
detectable effect for both detectors**. Without it they fire on the judge's own
re-score noise, reliably, on a schedule - and the operational cost is worse than the
false alarm, because a detector that cries wolf on a cadence gets muted and the real
drift then arrives into a muted channel.

Measured in the source: re-grading **one fixed artifact** ten times with the same judge
model flipped the published verdict 23% of the time; official differed from median
21%; a different judge model more than halved the passes. The half that made it a
technique rather than a number is that repeatability is **per dimension** - 32% / 5% /
3% across three dimensions of one rubric - so a composite figure hides that the
heaviest-weighted dimension is the noisiest, which is the common and invisible rubric
design. Boundary with the builder side stated in prose, not linked. Source:
[[../../sources/2026-08-31-danluu-2026]].

Applied same-run as a simulation (`structural-only`) against a managed tree's
conformance corpus: **better**. 142 judged pairs, 12 workers, and **0 (subject,
technique) keys judged more than once** - the partition-for-coverage design makes the
floor unobtainable from the output, permanently. With a 79.6% deviation base rate, a
worker answering `deviation` to everything is indistinguishable from a discriminating
one. Instrument named: overlap ~5% of pairs in the next run, ~7 extra judgements,
no human labels.
