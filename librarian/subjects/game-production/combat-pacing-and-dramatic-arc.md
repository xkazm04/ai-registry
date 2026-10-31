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

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. Since the 2026-09-10 record the subject gained three
racing techniques (`lead-car-wreck-before-lap-one-rate`, `division-wide-damage-multiplier`,
`proxy-driver-limit-declaration`), a process application and a golden-path section. The
eight older documents are byte-unchanged since that record, so its reverify items still
stand. Two internal inconsistencies are new findings: the beat taxonomy's decision rules
place the dead zone on the blend while its own definition puts it on raw activity, and
it calls "no detected beats" the definition of flat pacing while defining flat pacing by
spread and gating out activity-free timelines. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/combat-pacing-and-dramatic-arc",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:3d4a9be63146f2ed",
  "disposition": "clarify",
  "coverage": "All 12 current documents read in full. Constants were compared across golden path, techniques and the node application; the racing application's arithmetic and the gate's sampling claim were recomputed. No primary source was reopened this run (the 2026-09-10 Valve reference still scopes the curve); not evaluated: the consumer trees, any simulation run, any player study.",
  "counterexamples": [
    "A stretch with zero raw flux inside a busy blended curve fires a dead zone without being a blend feature, so 'dead zone is a blend event' contradicts the definition.",
    "A fight can have no detected beats because it has no activity at all; the taxonomy's own gate reports that as 'nothing to pace', not as flat pacing.",
    "A six-second median with a nine-second mean can come from a broad right tail rather than a few outliers; mean above median does not identify how many fights pull it.",
    "A damage-free dodge sequence can still demand consequential action (retained from 2026-09-10).",
    "Two thousand events at a 5% rate give a 95% interval of about plus or minus one point, not 'a fraction of a point'."
  ],
  "sources": [
    {
      "source": "Internal arithmetic, applications/process--lead-car-wreck-before-lap-one-rate.md",
      "result": "154 later wrecks + 1,846 finishes = 2,000; 154/2,000 = 7.7%. Coefficient series 0.10 to 0.16 is monotonic as the technique requires."
    },
    {
      "source": "Internal arithmetic, techniques/lead-car-wreck-before-lap-one-rate.md",
      "result": "5% over 40 events is 2 cases with a binomial interval spanning the target, as stated. At 2,000 events the standard error is about 0.49 points, so 'thousands narrow it to a fraction of a point' holds only well above 2,000. Minor; noted, not changed."
    },
    {
      "source": "Cross-document constants",
      "result": "Critical weight 1.35, 55/45 blend, 0.18 near-death bump, 2 s window, 0.2 prominence, 0.18 flat floor, 3/5/45 s envelopes and 5x health ratio agree between golden path, techniques and the node application."
    }
  ],
  "documents": {
    "combat-pacing-and-dramatic-arc.md": {
      "disposition": "reverify",
      "reason": "Still owed from 2026-09-10: fixed thresholds stated as general, and 'no detected beat is the signature of flat pacing' (a missing beat can be uninstrumented tension). The new opening-gate section matches its three techniques."
    },
    "techniques/beat-taxonomy-climax-comeback-deadzone.md": {
      "disposition": "clarify",
      "reason": "Decision rule says 'Dead zone is a blend event with context'; the taxonomy and the separation section define it on the raw activity signal. 'A fight with no detected beats is the definition of flat pacing' contradicts the flat-pacing rule (spread below a floor) and the nothing-to-pace gate. Correct both. Still owed: zero damage alone does not establish absent drama."
    },
    "techniques/difficulty-band-classification.md": {
      "disposition": "reverify",
      "reason": "Still owed: one band table serves win fraction and remaining-resource fraction, which are distinct estimands; boundary uncertainty is asked for but not quantified."
    },
    "techniques/division-wide-damage-multiplier.md": {
      "disposition": "keep",
      "reason": "New. Single application point, symmetric scope, same-seed reruns, retained failures and the start-window comparison are coherent; its limit (no felt claim) is stated."
    },
    "techniques/encounter-duration-envelopes.md": {
      "disposition": "reverify",
      "reason": "Still owed: genre-specific constants (3/5/45 s, 5x, 40%) stated as workable defaults without a calibration basis."
    },
    "techniques/intensity-and-threat-tension-curve.md": {
      "disposition": "reverify",
      "reason": "Still owed: normalization units, partial-window and healing reconstruction, and possible double counting of critical hits."
    },
    "techniques/lead-car-wreck-before-lap-one-rate.md": {
      "disposition": "keep",
      "reason": "New. Definition, unit, pre-declared lead, three outcomes, per-course reporting and retained later wrecks are consistent. The 'fraction of a point at thousands' phrase is loose at 2,000 events; noted only."
    },
    "techniques/plain-language-fight-report.md": {
      "disposition": "clarify",
      "reason": "The paired-reading example states that a mean above the median 'means a few long fights are pulling the average up'; it indicates right skew, which a few long fights usually but not necessarily cause. Soften to 'usually'. Still owed: thresholds quoted without calibration."
    },
    "techniques/proxy-driver-limit-declaration.md": {
      "disposition": "keep",
      "reason": "New. The declaration block, unknown sign of bias, and 'met for the declared proxy' verdict are consistent with the subject's evidence tiers."
    },
    "applications/node--intensity-and-threat-tension-curve.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; its constants agree with the techniques and its self-normalization deviation is disclosed. Dates preserved."
    },
    "applications/process--lead-car-wreck-before-lap-one-rate.md": {
      "disposition": "reverify",
      "reason": "New. Internally consistent and its deviations are stated; the cited source lines in the consumer repositories were not reopened. verified_on unchanged."
    },
    "applications/process--plain-language-fight-report.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun. It quotes the consumer's glossary line on median versus mean verbatim, so it stays as a quotation; the 30 s versus 45 s deviation is disclosed."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the clarify items the record above named: the beat taxonomy's two internal
inconsistencies and the median-versus-mean wording. The golden path's 'signature of flat
pacing' line and every other reverify item are left as owed, so the subject stays
`reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/combat-pacing-and-dramatic-arc",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:32bf5dd05906617a",
  "disposition": "reverify",
  "coverage": "All 12 current documents read in full. Constants were compared across golden path, techniques and the node application; the racing application's arithmetic and the gate's sampling claim were recomputed. No primary source was reopened this run (the 2026-09-10 Valve reference still scopes the curve); not evaluated: the consumer trees, any simulation run, any player study. Second record: the applied clarify items were re-read after editing; every other document is byte-unchanged and keeps its disposition.",
  "counterexamples": [
    "A stretch with zero raw flux inside a busy blended curve fires a dead zone without being a blend feature, so 'dead zone is a blend event' contradicts the definition.",
    "A fight can have no detected beats because it has no activity at all; the taxonomy's own gate reports that as 'nothing to pace', not as flat pacing.",
    "A six-second median with a nine-second mean can come from a broad right tail rather than a few outliers; mean above median does not identify how many fights pull it.",
    "A damage-free dodge sequence can still demand consequential action (retained from 2026-09-10).",
    "Two thousand events at a 5% rate give a 95% interval of about plus or minus one point, not 'a fraction of a point'."
  ],
  "sources": [
    {
      "source": "Internal arithmetic, applications/process--lead-car-wreck-before-lap-one-rate.md",
      "result": "154 later wrecks + 1,846 finishes = 2,000; 154/2,000 = 7.7%. Coefficient series 0.10 to 0.16 is monotonic as the technique requires."
    },
    {
      "source": "Internal arithmetic, techniques/lead-car-wreck-before-lap-one-rate.md",
      "result": "5% over 40 events is 2 cases with a binomial interval spanning the target, as stated. At 2,000 events the standard error is about 0.49 points, so 'thousands narrow it to a fraction of a point' holds only well above 2,000. Minor; noted, not changed."
    },
    {
      "source": "Cross-document constants",
      "result": "Critical weight 1.35, 55/45 blend, 0.18 near-death bump, 2 s window, 0.2 prominence, 0.18 flat floor, 3/5/45 s envelopes and 5x health ratio agree between golden path, techniques and the node application."
    }
  ],
  "documents": {
    "combat-pacing-and-dramatic-arc.md": {
      "disposition": "reverify",
      "reason": "Still owed from 2026-09-10: fixed thresholds stated as general, and 'no detected beat is the signature of flat pacing' (a missing beat can be uninstrumented tension). The new opening-gate section matches its three techniques."
    },
    "techniques/beat-taxonomy-climax-comeback-deadzone.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: decision rule now says \"Dead zone is a raw-activity event with context\"; \"no detected beats is the definition of flat pacing\" now reads \"a fight with activity and no detected beats is usually flat pacing, which the spread rule above confirms or not\". Still owed: zero damage alone does not establish absent drama."
    },
    "techniques/difficulty-band-classification.md": {
      "disposition": "reverify",
      "reason": "Still owed: one band table serves win fraction and remaining-resource fraction, which are distinct estimands; boundary uncertainty is asked for but not quantified."
    },
    "techniques/division-wide-damage-multiplier.md": {
      "disposition": "keep",
      "reason": "New. Single application point, symmetric scope, same-seed reruns, retained failures and the start-window comparison are coherent; its limit (no felt claim) is stated."
    },
    "techniques/encounter-duration-envelopes.md": {
      "disposition": "reverify",
      "reason": "Still owed: genre-specific constants (3/5/45 s, 5x, 40%) stated as workable defaults without a calibration basis."
    },
    "techniques/intensity-and-threat-tension-curve.md": {
      "disposition": "reverify",
      "reason": "Still owed: normalization units, partial-window and healing reconstruction, and possible double counting of critical hits."
    },
    "techniques/lead-car-wreck-before-lap-one-rate.md": {
      "disposition": "keep",
      "reason": "New. Definition, unit, pre-declared lead, three outcomes, per-course reporting and retained later wrecks are consistent. The 'fraction of a point at thousands' phrase is loose at 2,000 events; noted only."
    },
    "techniques/plain-language-fight-report.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the paired-reading example now says a mean above the median \"usually means\" a few long fights pull the average up. Still owed: uncalibrated thresholds."
    },
    "techniques/proxy-driver-limit-declaration.md": {
      "disposition": "keep",
      "reason": "New. The declaration block, unknown sign of bias, and 'met for the declared proxy' verdict are consistent with the subject's evidence tiers."
    },
    "applications/node--intensity-and-threat-tension-curve.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; its constants agree with the techniques and its self-normalization deviation is disclosed. Dates preserved."
    },
    "applications/process--lead-car-wreck-before-lap-one-rate.md": {
      "disposition": "reverify",
      "reason": "New. Internally consistent and its deviations are stated; the cited source lines in the consumer repositories were not reopened. verified_on unchanged."
    },
    "applications/process--plain-language-fight-report.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun. It quotes the consumer's glossary line on median versus mean verbatim, so it stays as a quotation; the 30 s versus 45 s deviation is disclosed."
    }
  }
}
```
