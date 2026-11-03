---
subject: claimed-improvement-remeasurement
domain: software-engineering
last_touched: 2026-11-03
dry_streak: 0
---

# claimed-improvement-remeasurement

First note. The subject was harvested on 2026-10-27 (f1fdb04e6) from one node tree, an
agentic DevSecOps control plane (afterlife). A Curator dispatch ranked it on "single stack
(node)".

## State

5 techniques, 4 applications: 2 `node` (afterlife 009c7893) and 2 `rust` (tracklight
5aa119f). The Rust tree is an LLM evaluation product's prompt-promotion gate, not a CI timing
judge. It answers the stack finding for the techniques that concern who may set the judge's
parameters and which runs count as the head. change-point-by-ancestry and
watermark-halts-at-unfinished are still node-only.

## 2026-11-03 - deepen (cirm-deepen-1103)

Landed in 42bf985a5 (catalog 1bb95b472). Lanes:
- **Counter-evidence (web)**: Laaber, Scheuner and Leitner (EMSE 2019); MongoDB's
  change-point paper (arXiv 2003.00584); the Hunter paper (arXiv 2301.03034); Treeherder's
  `perfalert`; Chromium Pinpoint's compare module; Apache Otava's docs; Mozilla's
  performance-sheriffing and PerfCompare docs; an exact Mann-Whitney table. Quotes were taken
  from the fetched text, not from summaries.
- **Training-data only (blind)**: one agent, no tools, the same questions.
- **Field, tracklight at origin/main 5aa119f** (a git-archive export, anchors checked with
  check-anchors): the promotion gate, its tests, the paired verdict and the runner's
  resolved-version write. A seam search over tracklight, personas and overlord for
  remeasurement terms found tracklight's runner and API as the only real seam.
- `check-currency --volatile --subject`: 0 facts in 8 documents.

What moved:
- **Flipped (golden path + three-way-verdict): the centre follows the claim class.** Medians
  hold for a typical-run claim. A spend claim (runner-minutes, billed cost) is a sum. The web
  lane found production detectors on means (Treeherder's weighted-mean t-test, Hunter) and
  the case where removing retries cuts cost while leaving the median unchanged.
- **Correction (three-way-verdict): exact rank-sum at 3 vs 3.** The smallest two-sided p is
  0.10, one-sided reaches 0.05 only under p ≤ α, and 4 a side is the first size that can pass
  two-sided. A rank-sum test is not a median test when shapes differ (Pinpoint pairs it with
  K-S for that reason), so the spread check stays beside it.
- **New section (three-way-verdict): when base and head can be paired.** Interleave on one
  machine, or difference over the same items, and link paired-per-case-testing rather than
  restate it. The fleet, blind and web lanes converged (Laaber: same-instance randomised
  trials reduce the repetitions needed; on different instances only 78-83% of combinations
  detect slowdowns reliably).
- **Noise exit**: now named as a detectability check, with the multiple of 2 marked a house
  default. Neither lane sourced it. Pinpoint states its effect size in IQR units instead.
- **Upward lessons from tracklight**: in queued-runs step 2, the identity stamp is written by
  the step that consumed the input, never copied from the queue request. The claimant
  technique's leak list gains the override: a force flag waives evidence refusals, never a
  policy refusal, and the order of checks enforces that.
- **Golden path** names quality-regression-gating and perf-regression-gating as neighbours,
  and states the burden difference between a gate (undecidable passes) and a credit judge
  (undecidable does not pay).
- **Confirmed untouched**: every change-point tool checked linearises the series (Perfherder
  by push timestamp, MongoDB as a time series, Otava as two branch tails), so the golden
  path's partial-order point stands. Triggered runs carry a label: Mozilla pools retriggers
  into the organic series, but its harness controls warm-up and CI wall-clock does not, so
  the technique's "without labels" wording stands. The ~8-sample IQR cutoff has no primary
  source and is already hedged as "roughly".
- **Banked, not landed**: A/A calibration (base against base) to learn a series'
  false-positive rate, which may belong to measurement-honesty; correlated noise between
  runs close in time (MongoDB: E-divisive handles IID noise, not correlated noise); effect
  size beside the verdict (Cliff's delta in PerfCompare).
- **Applied**: 1 row, `unapplied`, for the flipped centre rule. No fleet tree judges a spend
  claim.

## Impact

No judged verdicts: the registry map joins no context in any of 12 projects to this subject
(0 pairs, 0 stale). The known positive, quality-regression-gating in tracklight, was present.
Maps were regenerated fleet-wide and committed locally on each active branch (12 projects,
map file only). None were pushed, because every branch already carries other sessions'
unpushed commits.

## Banked

- **tracklight's allow hides the third state.** A recorded interval that straddles the floor
  returns a bare `Allow`, the same outcome as an interval wholly above it. The doc comment
  says a noisy run is "not waved through". `AllowWithWarning` already exists. Return when
  tracklight's promotion gate is next touched: a code A/B in which a straddling interval
  allows with a warning, pinned by the existing noisy test.
- **tracklight: no test pins `force` failing to clear a trust refusal.** Every
  `gate_promotion` call in the gate's tests passes no trust refusal. Return with the item
  above.
- **Unjoined seam.** tracklight's promotion gate maps to quality-regression-gating only.
  Return when the context map gains a promotion or claim context, then run `/conform` against
  this subject.
- **A/A calibration and correlated noise.** Return when measurement-honesty is next deepened.
  Check whether its noise band already covers A/A before adding a rule here.
- **change-point-by-ancestry and watermark-halts-at-unfinished are node-only.** Return when a
  fleet tree collects CI runs incrementally or searches for a change point.
