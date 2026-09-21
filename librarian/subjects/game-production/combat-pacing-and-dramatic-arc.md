---
domain: game-production
subject: combat-pacing-and-dramatic-arc
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# combat-pacing-and-dramatic-arc

## Architecture review - 2026-09-10

Read and assessed all 8 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/combat-pacing-and-dramatic-arc",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:74791ba6f05fb35e",
  "disposition": "reverify",
  "coverage": "All 8 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "A damage-free dodge sequence can still demand consequential action.",
    "Equal health ratios can produce different durations when damage rates differ.",
    "Damage per window divided by damage per second has units of time unless window duration is accounted for."
  ],
  "sources": [
    {
      "url": "https://steamcdn-a.akamaihd.net/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf",
      "scope": "Valve describes a game-specific intensity estimate and adaptive pacing with quiet periods; this does not validate the local curve weights, bands or universal experience claims."
    }
  ],
  "documents": {
    "combat-pacing-and-dramatic-arc.md": {
      "disposition": "reverify",
      "reason": "Reverify fixed pacing thresholds and the equation of telemetry with experience. A missing detected beat can mean uninstrumented tension, not a flat fight."
    },
    "techniques/beat-taxonomy-climax-comeback-deadzone.md": {
      "disposition": "reverify",
      "reason": "Reverify deadzone and comeback inference against observed actions, healing and resources. Zero damage is insufficient to establish absent drama."
    },
    "techniques/difficulty-band-classification.md": {
      "disposition": "reverify",
      "reason": "Reverify shared bands for win fraction and remaining-health fraction; they are distinct estimands. Include sample counts and uncertainty at boundaries."
    },
    "techniques/encounter-duration-envelopes.md": {
      "disposition": "reverify",
      "reason": "Reverify genre-specific duration constants and health-based time inference. Inspect damage rate, authored pauses and player behavior before changing envelopes."
    },
    "techniques/intensity-and-threat-tension-curve.md": {
      "disposition": "reverify",
      "reason": "Reverify dimensional normalization, matching window alignment, partial windows, healing and shield reconstruction, and possible critical-hit double counting. Fixed seeds do not disqualify pacing analysis."
    },
    "techniques/plain-language-fight-report.md": {
      "disposition": "reverify",
      "reason": "Reverify claims that absent beats prove boredom or mean above median proves a few long fights. Retain descriptive metrics and distribution evidence when thresholds are uncalibrated."
    },
    "applications/node--intensity-and-threat-tension-curve.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed intensity-and-threat-tension-curve contract. Reverify dimensional normalization, matching window alignment, partial windows, healing and shield reconstruction, and possible critical-hit double counting. Fixed seeds do not disqualify pacing analysis."
    },
    "applications/process--plain-language-fight-report.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed plain-language-fight-report contract. Reverify claims that absent beats prove boredom or mean above median proves a few long fights. Retain descriptive metrics and distribution evidence when thresholds are uncalibrated."
    }
  }
}
```
