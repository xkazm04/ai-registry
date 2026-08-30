---
subject: unattended-build-loop
domain: game-production
last_touched: 2026-08-30
dry_streak: 0
---

# unattended-build-loop

First touch: 2026-08-30, an `/intake` run on a sponsored loop-mode demo
([[../../sources/2026-08-30-tesana-loop-mode-game-builds]]). Forged 2026-08-20
from one tree; three applications, all from the same tree.

## State

6 -> 7 techniques, 3 -> 4 applications (all `node`/`process`, one tree).

Landed:

- `verifier-coverage-review-agenda` (new technique) - a plan item inherits
  verified status from whichever gate passed in its area, which certifies
  perceptual requirements with a compiler when the perceptual gate is advisory;
  the loop certifies only up to the rung a verdict reached, emits the unjudged
  items as the reviewer's agenda, and prints per-gate verdict counts at run end
  because the static preflight excludes runtime-determined gates on purpose.
  Applied as an `experiment` over the connected tree's four recorded runs:
  the perceptual gate returned zero verdicts in 77/77 deciding iterations while
  234 features were marked done. Verdict `better`; the project's next harness
  change is filed, not committed (touches three files, gate unreachable here).
- Golden path gains "Coverage decides where the human's time goes" between the
  third-status section and the spend section.

## Boundaries observed

- The golden path already states that a sibling discipline
  (`runtime-observation-evidence`, tiers-of-truth) owns the evidence ladder;
  this technique reads the rung off a verdict and routes what falls short. Do
  not let it grow a ladder of its own.
- `subsystem-review-doctrine`'s entitlement rule is the reviewer-side mirror
  (conclude only what prior passes confirmed); this is the loop-side statement
  of the same asymmetry. Both are in-bundle, so a sentence in each is enough.

## Leads carried

- Report wall time beside spend and overshoot width (untriaged, source note).
- Agent-proposed next steps as unallocated scope (lead, source note).
