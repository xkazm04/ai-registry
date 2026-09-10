---
domain: game-production
subject: realtime-combat-semantics
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# realtime-combat-semantics

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/realtime-combat-semantics",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:39c31b61641740f6",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A 1-second duration with ticks at 0, 0.4 and 0.8 has three ticks, not duration/period = 2.5.",
    "A damage callback can re-enter overlap processing before post-resolution insertion and damage the same target twice.",
    "An expanding hazard with a finite maximum radius can be escaped after expansion stops even when its initial growth exceeds run speed."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/systems-canon/realtime-combat-semantics",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/GameplayAbilities/UAbilitySystemComponent",
      "scope": "Official API search distinguishes cancellation operations from ability-spec clearing. Does not verify the historical sample crash or consumer ordering."
    }
  ],
  "documents": {
    "realtime-combat-semantics.md": {
      "disposition": "reverify",
      "reason": "Reverify universal reaction/encounter bands, turn-based consent/full-information assumptions, wall-clock-only timers and telegraph-or-homing as exhaustive fairness. Real-time state updates can be serialized functions. Homing does not establish counterplay; a fixed-strength dodge can be intentional."
    },
    "techniques/active-defense-two-axis-split.md": {
      "disposition": "reverify",
      "reason": "Two-axis defense is a design model, not mandatory. Held guards still involve positioning/resource choices, gear can intentionally widen timing windows, and a constant-magnitude dodge need not make all progression decorative. Thresholds need population and input-latency evidence."
    },
    "techniques/death-via-state-tag-not-input-disable.md": {
      "disposition": "reverify",
      "reason": "Observable authoritative death state is useful but tags are one representation. Death reactions, corpse actions and committed projectiles can intentionally persist. Activating a death ability before cancel-all does not protect it from cancellation; resurrection needs explicit restoration semantics."
    },
    "techniques/hit-dedup-per-swing.md": {
      "disposition": "clarify",
      "reason": "Repaired policy-specific hit identity, atomic reservation before callbacks, re-entry epochs, legitimate multi-hit/tick behavior and stale activation callbacks. A centralized registry with complete keys is valid."
    },
    "techniques/real-time-timers-with-an-escapable-window.md": {
      "disposition": "clarify",
      "reason": "Repaired exact tick scheduling, clock domain, endpoint conventions, catch-up policy and geometric escape assumptions. Duration/period is not generally an integer tick count; growth rate alone cannot establish inescapability."
    },
    "techniques/single-source-of-health-truth.md": {
      "disposition": "reverify",
      "reason": "Separate authority from location: prediction, shields and replicas can have separate components with explicit reconciliation. Predicted death presentation may be reversible. A display discrepancy is not necessarily a competing authority, and finite path tests do not prove universal coherence."
    },
    "techniques/telegraph-or-homing-for-area-effects.md": {
      "disposition": "reverify",
      "reason": "Telegraph and homing are neither exhaustive nor mutually exclusive; fast reactive/anticipatory attacks and persistent hazards have other cues and counters. Homing may still be dodgeable/blockable, moving cues may remain readable, and player-owned cues can support aiming. Treat numerical rules as scoped policies."
    },
    "applications/node--real-time-timers-with-an-escapable-window.md": {
      "disposition": "reverify",
      "reason": "The historical prompt wording distinguishes cooldown from period but does not enforce emitted behavior. Displayed encounter thresholds are authored heuristics, not player measurements; the simulation has no spatial escape model. Consumer not rerun or dates refreshed."
    },
    "applications/process--death-via-state-tag-not-input-disable.md": {
      "disposition": "reverify",
      "reason": "The historical sample-crash text is not a confirmed live crash witness. CancelAllAbilities and clearing ability specs are distinct API operations; activate-before-cancel still needs a cancellation exemption. State_Dead and State.Dead also require exact tag identity reconciliation. Consumer not rerun."
    },
    "applications/process--telegraph-or-homing-for-area-effects.md": {
      "disposition": "reverify",
      "reason": "The historical either/or prompt is not a complete fairness test or necessarily an exclusive disjunction. Some declared timing properties are statically checkable, while perceptibility needs observation. Binary assets are not universally unauthorable from code. No live review or player evidence refreshed."
    }
  }
}
```
