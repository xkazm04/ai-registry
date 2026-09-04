---
subject: deferred-operation-fusion
domain: software-engineering
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# deferred-operation-fusion

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/data-pipeline-semantics`.

## 2026-09-04 - /intake run (microsoft/VibeVoice @ 1541f59)

- **`equivalence-oracle-testing` amended: a tolerance on the array is not a tolerance on the result.** Every one of its three assertions compares continuous arrays under a stated per-mode tolerance, and its rule that "bit equality is the wrong bar" is right for array-to-array comparison. It **stands on the boundary twice without naming it** - nearest mode held to exact equality "because there is nothing to accumulate", and a global tolerance refused because it would pass "the label image whose fused values were interpolated between classes". Both are one fact: a discrete-valued output has no meaningful tolerance.
- The general rule is about what **consumes** the array, not what produced it. Where a discontinuous selector is downstream - argmax, threshold, nearest-class, ranking, token decode - no bound on the array's error bounds the error in the result, and when the selection is autoregressive one flipped near-tie changes everything after it.
- Measured instance from the source: it decodes at the native rate and resamples with the specific library the checkpoints were **evaluated** with, because "the two resamplers differ by ~1% RMS, and near-tied greedy argmaxes turn that into different words." 1% RMS passes any sane array tolerance.
- Added: assert at the last continuous stage before the first discrete one; compare decisions exactly rather than values loosely; where exactness is unavailable report a disagreement **rate** over a fixed corpus; and count the near-tie population, which is measurable on the eager path alone and says whether a safe array tolerance exists at all. Extended to **implementation substitution**, which the technique did not otherwise reach: the implementation a model or threshold was calibrated against is part of the contract.
- **`unapplied by construction`, decided at triage** per round 21's focus - no fleet project has a context for this subject, verified against all eleven projects' own registry maps rather than the (stale) fleet map. Return condition: a fleet project grows a lazy array pipeline.

## 2026-09-03 - forged from the handoff

algebraic op representation, one flush predicate, data-dependent opt-out, compatibility-break resample, explicit barrier, equivalence oracle; 6 techniques. Upward lessons: requires_current_data is a property of the op as parameterized; the flush predicate logs its branch; per-assertion oracle tolerances. Deviations: the compatibility check is a stub so the mid-chain resample is dead code and overrides are last-entry-wins; array-form crops declare no data dependence while reading voxels. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.
