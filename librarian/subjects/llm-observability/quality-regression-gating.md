---
subject: quality-regression-gating
domain: llm-observability
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# quality-regression-gating

First touch: [[2026-08-23-6]], external reconcile against
`promptfoo/promptfoo` @ `679e7ec` (0.122.0). Gained
`node--unverified-vs-regressed-exit-states` (uncovered); single-stack debt
cleared. Hint confirmed. Executed evidence: five exit-code cases through the
real decision function via the tree's own vitest harness.

## The sharpest sightings

- The tree COMPUTES the unverified discriminator (findTargetErrorStatus) and
  spends it on the console banner while the exit code ignores it - rule 3
  violated with the fix already in a local variable.
- The green hole: zero verified cases -> passRate NaN -> NaN < 100 false ->
  exit 0. Upstream-reportable; reachable via --filter-failing
  warn-and-proceed.
- Both gate constants are env-remappable per invocation - fixed-alpha
  discipline applied to the verdict vocabulary itself; the vendor's own agent
  skill zeroes the exit code and rebuilds the gate outside the tool.

## Technique-edit candidates (single-sighted, banked)

- "Gating is opt-in per invocation" should admit a second split: a flag OR a
  distinct entry point, visible in the invocation (cli-vs-sdk sighted).
- New rule: when the verdict is COMPUTED rather than looked up, enumerate the
  degenerate inputs (no cases, zero denominator) as unverified explicitly - a
  NaN comparison silently takes the pass branch. Possible second sighting
  beside the rust partial-run application; director's call whether it counts.
- fixed-alpha-discipline: extend the discipline to the verdict vocabulary
  (remappable exit codes mean no contract at all).
- partial-run-never-green: promptfoo hard-fails truncation as regressed and
  its own tooling neutralized the exit code - the field witness that
  technique's decision rule predicts.

## Open leads

- Two contradicting official CI recipes ship in-repo (a jq line omitting
  errors from the denominator vs the newer skill reading s.errors).
- Docs advertise a nonexistent --fail-on-error flag; small upstream doc fix.
- --resume incomplete-run semantics untraced.

## 2026-09-01 — intake, adaptive-harness-review

Added `baseline-carries-its-conditions`, amended `paired-per-case-testing`'s
comparability predicate to include the judge model and version, and extended the golden
path's "Honesty about what the test cannot see" enumeration with the baseline's
currency.

The gap was found by the asymmetry hunt, not by the source. The subject was already
mature on sampling noise and silent on comparator decay: four comparability conditions
that all describe the experiment and none the instrument; three stated baseline
limitations that are all standard-error limitations; and a routing rule that waives the
predicate on the floor test — the test whose comparator is oldest — and reaches it
precisely when comparability has already failed.

Boundary held rather than linked: `judge-calibration-and-drift` owns the judge's own
drift and its recalibration schedule; this subject owns whether a stored number produced
by that judge may still be compared against. Recruiting's
`an-organisation-owned-manual-baseline` reaches "the baseline value and its provenance
travel with it" from the opposite side — a *declared* counterfactual baseline that never
decays because no instrument produced it. That inversion is the technique's "when not to
use it" and is stated in prose on this side only; no cross-bundle link.

Applied to tracklight, `experiment`/`better`, on the collective-ingest canonicalization
table. The apply step added the technique's normalization-surface discriminator.

## Open leads

- The gate's own arm is unmeasured anywhere in the fleet: no connected tree can produce
  two runs spanning a judge change, because the one implementation makes a benchmark row
  immutable. Return when a project grows a re-baseline or benchmark-update path.
