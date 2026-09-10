---
subject: unattended-build-loop
domain: game-production
last_touched: 2026-09-10
touched_by: architecture-review
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

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/unattended-build-loop",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:f91ffa4709aaf6e8",
  "disposition": "reverify",
  "coverage": "All 12 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A launch estimated at 1 unit can actually cost 100; pool width one does not bound the overshoot to one unit.",
    "When the last checkpoint disappears, snapshotting the current corrupted tree preserves it but does not make it verified green.",
    "A perceptual verifier returning fail reached the perceptual evidence kind but did not verify the item as passing."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/craft-judgment/unattended-build-loop",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "unattended-build-loop.md": {
      "disposition": "reverify",
      "reason": "Useful separation of claims, verdicts and spend. Reverify uncited 20-30 point evaluation gap and assertions about all builders. External checks can malfunction, estimates do not enforce a hard cap, and rollback is not universally preferable to diagnosed forward repair. Exact normalized names can collide. A required unavailable verifier should not be weakened merely to make success reachable."
    },
    "techniques/budget-reservation-and-drain-not-kill.md": {
      "disposition": "clarify",
      "reason": "Repaired estimated cap as bounded guarantee, non-atomic reservation, unconditional drain and missing-usage-as-settled accounting. Adds per-attempt identity, durable reconciliation, enforceable maximum versus soft budget, bounded shutdown and cancellation semantics."
    },
    "techniques/completed-with-gaps-excluded-from-the-numerator.md": {
      "disposition": "reverify",
      "reason": "Gapped work must stay outside fully verified completion, but downstream admission depends on each dependency's contract. Independently verified subitems need not inherit an unrelated parent's uncertainty; report parent completion and scoped subitem evidence separately without denominator gaming. Failure and unevaluated states can matter even when both block scheduling."
    },
    "techniques/no-gate-self-certifies.md": {
      "disposition": "reverify",
      "reason": "Independence is evidence/control separation, not necessarily a different person or server. In-process checks can have no shell command; observer results can be defective and require diagnosis. Missing environment may be repairable as infrastructure work, and producer instrumentation can supply validated evidence. Logs and exit status need a tool-specific combined protocol."
    },
    "techniques/rollback-to-last-green.md": {
      "disposition": "clarify",
      "reason": "Repaired initial/resumed state as presumed green and replacement of a missing checkpoint with an unverified baseline. Restricts restoration to owned isolated state, preserves unrelated work and diagnostic evidence, validates durable targets and acknowledges external/untracked state."
    },
    "techniques/unreachable-success-preflight.md": {
      "disposition": "reverify",
      "reason": "A blocked check pins only affected items, not necessarily the entire rate. Current missing prerequisites can become available, runtime gates have statically checkable dependencies, and self-reported targets can be invalid. Report feasible upper bounds and unknowns; continuation and weakened evidence basis require explicit run policy, not an unconditional warn-and-spend default."
    },
    "techniques/verified-vs-self-reported-pass-rate.md": {
      "disposition": "reverify",
      "reason": "Use immutable item IDs and reject ambiguous normalization collisions instead of deterministic misassignment. Bind evidence to content/configuration, not merely producing session; independent verification can succeed without a producer mentioning the item. A rate gap can come from real defects, weak claims or coverage, not almost always environment failure."
    },
    "techniques/verifier-coverage-review-agenda.md": {
      "disposition": "clarify",
      "reason": "Repaired highest-rung-with-any-verdict logic. Tracks pass/fail/unevaluated per required evidence kind and item, preserves observed failures and assigns missing coverage without treating perception as proof of hidden behavior. Clarifies unavailable gates, bounded recovery and residual review agenda."
    },
    "applications/node--budget-reservation-and-drain-not-kill.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF source locations, cap values and verification date were not rerun. Displayed helper is a projection predicate, not atomic reservation or a hard currency bound; NaN/negative inputs and durable restart reconciliation need checks. Pool width bounds active calls, not their unbounded cost. Missing usage is estimated liability, and cancellation can avoid additional cost without refunding incurred usage."
    },
    "applications/node--verified-vs-self-reported-pass-rate.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF source locations and verification date were not rerun. Normalized name/ID precedence can select the wrong feature; reject ambiguity. Shown self-report count excludes gapped areas and requires pass status before verification, so it is a filtered metric rather than every producer claim. Area-level build success does not certify all feature semantics."
    },
    "applications/node--verifier-coverage-review-agenda.md": {
      "disposition": "reverify",
      "reason": "Historical A/B metadata, recorded runs and verification date were preserved, not rerun. Counts sum to 92 iterations/323 features; reclassification is a reporting comparison, not an implementation trial proving better output. Name regex misses requirements and a single area screenshot need not cover every feature. The text claims all 77 attempts lacked verdicts while later acknowledging parsing cannot reliably separate failure from nonexecution."
    },
    "applications/process--no-gate-self-certifies.md": {
      "disposition": "reverify",
      "reason": "Historical process/PoF locations and verification date were not rerun. Nonempty captured frame plus judge outage cannot satisfy a required perception check; black output can be intentional and boot failure can be product failure. Ignore-exit policy and per-iteration shared frames need scoped protocol/identity checks; quoted doctrine is not current consumer evidence."
    }
  }
}
```
