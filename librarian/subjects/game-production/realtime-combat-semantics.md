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

## Architecture review - 2026-09-10 (re-review after the compression revert)

Read all 10 documents at current bytes, and read (not executed) the three `pof` sites the
applications cite. This supersedes the earlier 2026-09-10 record, whose digest the revert
invalidated, and it retracts that record's blanket `reverify` on the three applications:
every quantity they attribute to the repo is present at source, verbatim.

`src/lib/combat/choreography-sim.ts` carries the thresholds at lines 272, 278, 282, 287
and 292 exactly as quoted — `playerDied && totalDuration < 5`, `totalDuration > 45`,
`!playerDied && totalDuration < 3`, `totalEnemyHP > playerMaxHP * tuning.playerHealthMul * 5`,
and `const bucketSize = 2`. `src/lib/ability/effect-codegen-prompt.ts` carries the
cooldown comment and the `NOT a GE Period` interpolation at lines 17–20.
`src/lib/prompts/ability-forge.ts:272` is the unconditional
`'State_Dead and State_Stunned MUST always be in ActivationBlockedTags'`, with the
`animDuration 0.4-1.5s, recovery 0.1-0.5s` band at line 279. Reading those files is not
running the simulation, and none of the balance claims *behind* the thresholds were
tested; what is established is that the corpus reports its worked instance accurately.

That check produced the one finding worth acting on. The golden path renders the fourth
threshold as "a roster whose combined enemy health exceeds about **five times** the
player's own reads as tedious". The source compares against `playerMaxHP *
tuning.playerHealthMul * 5` — five times a *tuned* player pool, not the player's own
maximum. This subject carries `a-number-carries-its-unit-and-basis` on three of its six
techniques and the golden path drops the basis on the one number it restates from code.
The application quotes the expression correctly; the golden path paraphrases it into a
different claim.

A second, softer seam: the golden path sets ~0.25 s as the floor "for a trained player to
perceive and begin a response to a clear visual cue", while
`active-defense-two-axis-split` step 1 calls a window "under roughly a fifth of a second"
a coin flip and the same technique's closing rule forbids grading a window "already
shorter than perception latency". A 0.2 s window is below the 0.25 s floor the same
subject states, so the two documents describe the sub-perception region differently — one
as a coin flip to be avoided, the other as a region where no axis may be added at all.
Nothing in the subject sources the 0.25 s figure either; it is consistent with the usual
range reported for simple visual reaction time, but the corpus asserts it without a
citation and it is doing real work in three documents.

The rest of the subject is the strongest material in this group and I would change none
of it. The five-assumption derivation at the top — consented position, partial
information, mid-commitment, parallel resolution, wall-clock duration — genuinely
generates the six techniques rather than decorating them, and the four pathologies
("unfair", "flat", "random", "spongy") each map to a distinct structural cause rather than
to a tuning knob. `hit-dedup-per-swing`'s insistence that the set lives on the activation
rather than on the detection window, and its "verify with the worst geometry" step, are
the kind of rule that is only ever written after somebody lost a week to it.

What I did not evaluate: no simulation run, no engine session, no playtest, no crash
replay, and no measurement of any reaction-time or time-to-kill band against a real
player. The `docs/catalog/ARPG-LAWS.md` §5 and §8 citations and the
`crash-analyzer/sample-crashes.ts` root-cause pairs were not re-read at source, so the two
process applications keep a narrower `reverify` on those specific citations even though
their prompt-side quotations check out.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/realtime-combat-semantics",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:d81e35ff68e40bae",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read at current bytes. choreography-sim.ts, effect-codegen-prompt.ts and ability-forge.ts read (not executed) in the pof working tree. Not evaluated: any simulation run, engine session, playtest, crash replay, or empirical reaction-time measurement; ARPG-LAWS and sample-crashes citations not re-read.",
  "counterexamples": [
    "The golden path's 'five times the player's own' health omits the tuning multiplier the shipped comparison actually applies, so the number cannot be reproduced from the document.",
    "A 0.2 s defensive window is a 'coin flip' under active-defense-two-axis-split and below the perception floor the golden path states, and the subject gives no single reading for that region.",
    "A telegraph obligation stated as an exclusive disjunction has no reading for an effect that is position-resolved, telegraphed, and whose cue is occluded by the camera the player is driving — the subject requires two sensory channels but never says what verdict a single-channel cue earns.",
    "hit-dedup-per-swing's activation-owns-the-set rule gives no account of an activation that outlives the actor (a projectile whose caster dies mid-flight), which is exactly where death-via-state-tag's cancel-through-the-tag rule would remove it."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/combat/choreography-sim.ts",
      "result": "Read, not executed. Confirms the five quoted thresholds at lines 272, 278, 282, 287 and 292, and establishes that the enemy-health comparison is playerMaxHP * tuning.playerHealthMul * 5 — which the golden path restates as five times the player's own maximum. Establishes nothing about whether any threshold is well chosen."
    },
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/ability/effect-codegen-prompt.ts and src/lib/prompts/ability-forge.ts",
      "result": "Read, not executed. Confirms the cooldown-is-not-a-GE-Period comment at effect-codegen-prompt.ts:17-20, the unconditional State_Dead/State_Stunned rule at ability-forge.ts:272 and the 0.4-1.5s / 0.1-0.5s band at 279. Establishes that the applications quote the tree accurately; establishes nothing about the bands' empirical basis."
    }
  ],
  "documents": {
    "realtime-combat-semantics.md": {
      "disposition": "clarify",
      "reason": "Restates the enemy-health threshold as five times the player's own maximum where the cited code multiplies by a tuning factor first; the 0.25 s perception floor is asserted without a source and is load-bearing in three documents."
    },
    "techniques/telegraph-or-homing-for-area-effects.md": {
      "disposition": "keep",
      "reason": "Exclusive disjunction with a named forbidden third case, lead time derived from the region rather than the animation, and the accept-the-whiff rule are all argued correctly."
    },
    "techniques/real-time-timers-with-an-escapable-window.md": {
      "disposition": "keep",
      "reason": "The cooldown/period split and the growth-rate-versus-traversal comparison are stated with their bases; the never-derive-one-from-the-other rule is the right closing."
    },
    "techniques/active-defense-two-axis-split.md": {
      "disposition": "keep",
      "reason": "Two-axis decomposition and both collapse modes are correct, and the mitigation-basis paragraph applies the unit law properly; the window-floor wording is a golden-path reconciliation, not a defect here."
    },
    "techniques/hit-dedup-per-swing.md": {
      "disposition": "keep",
      "reason": "Set on the activation rather than the detection window, per-tick sets for persistent volumes, and worst-geometry verification are all specific and non-obvious."
    },
    "techniques/single-source-of-health-truth.md": {
      "disposition": "keep",
      "reason": "Retire-or-mirror remediation, the prediction exemption and the drive-one-path proof step are stated without overreach."
    },
    "techniques/death-via-state-tag-not-input-disable.md": {
      "disposition": "keep",
      "reason": "The ordering rule (secure the death reaction before the mass cancel) and the initialisation-race rule are both derived from named failures rather than asserted."
    },
    "applications/node--real-time-timers-with-an-escapable-window.md": {
      "disposition": "keep",
      "reason": "Every quoted threshold, the jitter expression and the cooldown comment confirmed verbatim at source; the stated deviation (the sim resolves time, not space) is honest and the standard is held."
    },
    "applications/process--death-via-state-tag-not-input-disable.md": {
      "disposition": "reverify",
      "reason": "The GAS_RULES and combo-timing quotations confirmed at source, but the crash-analyzer root-cause pairs and the ARPG-LAWS wiring law were not re-read and no crash was replayed."
    },
    "applications/process--telegraph-or-homing-for-area-effects.md": {
      "disposition": "reverify",
      "reason": "The module-eval-prompts quotation and the ARPG-LAWS survivability cap were not re-read at source; the deviation it records (no lead time measured against traversal) is unchanged."
    }
  }
}
```
