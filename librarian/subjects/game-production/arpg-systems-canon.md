---
domain: game-production
subject: arpg-systems-canon
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# arpg-systems-canon

## Architecture review - 2026-09-10

Read all nine documents. Reframed canon examples as local rules and corrected
stacking, mitigation, loot and effective-health arithmetic. Both applications remain reverify.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/arpg-systems-canon",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b15a69af0914f5f8",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "An additive sum grows without bound even while each fixed addition has diminishing relative gain.",
    "At 100% critical chance, increasing critical multiplier still increases damage.",
    "Physical-only armour and nonphysical-only resistance act on disjoint components and commute.",
    "Comparing mitigated damage against EHP counts the same mitigation twice.",
    "Six equal-value affixes need not have the same total power as two.",
    "The example level-25 versus level-1 multiplier ratio is 3.5/1.1, not 3.5."
  ],
  "sources": [
    {
      "url": "https://www.pathofexile.com/forum/view-thread/1930316",
      "scope": "Official historical 3.0 ailment/hit separation; counterexample to universal doctrine, not verification of current game formulas or local consumer."
    }
  ],
  "documents": {
    "arpg-systems-canon.md": {
      "disposition": "clarify",
      "reason": "Reframe local canon as project policy and correct additive saturation, disjoint mitigation, loot power and EHP bases."
    },
    "techniques/added-increased-more-stacking.md": {
      "disposition": "clarify",
      "reason": "Correct relative diminishing returns versus saturation, unbounded multiplier chains and critical throughput terminology."
    },
    "techniques/mitigation-order-and-soft-caps.md": {
      "disposition": "clarify",
      "reason": "Correct commutativity, percentage-point penetration and negative resistance; qualify caps and entropy guarantees."
    },
    "techniques/ailments-scale-off-the-hit.md": {
      "disposition": "clarify",
      "reason": "Scope hit-derived ailments; clarify double mitigation, duration, hybrids and independent scaling."
    },
    "techniques/rarity-is-an-affix-budget.md": {
      "disposition": "clarify",
      "reason": "Resolve constant-power contradiction; separate frequency from desirability and define sampling/functional effect contracts."
    },
    "techniques/ilvl-gated-affix-tiers.md": {
      "disposition": "clarify",
      "reason": "Correct example ratios and tier ordering; qualify level relationships and enforce weighted-sampling boundaries."
    },
    "techniques/layered-defenses-and-the-ehp-floor.md": {
      "disposition": "clarify",
      "reason": "Fix raw-versus-mitigated EHP comparison and strict survival boundary; scope probabilistic and temporal guarantees."
    },
    "applications/node--mitigation-order-and-soft-caps.md": {
      "disposition": "reverify",
      "reason": "Reverify runtime parity, invalid inputs, default damage types and RNG migration claims."
    },
    "applications/process--rarity-is-an-affix-budget.md": {
      "disposition": "reverify",
      "reason": "Reverify canon parity and power allocation; correct level-scaling ratio and scope historical genre comparison."
    }
  }
}
```
