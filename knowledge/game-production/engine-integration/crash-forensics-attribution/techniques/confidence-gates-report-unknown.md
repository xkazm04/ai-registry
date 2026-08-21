---
layer: technique
type: technique
subject: crash-forensics-attribution
technique: confidence-gates-report-unknown
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, refuse-rather-than-destroy]
use_when: [deciding when a triage tool may name a subsystem, a scorer produces confident wrong answers, designing the outcome vocabulary of an attribution tool]
shared_with: []
---

# Confidence gates and reporting unknown

The concern: an attribution scorer will always rank something first. This technique is the
pair of gates that decide whether the top of that ranking is allowed to be reported as a
diagnosis, and the shape of the honest output when it is not.

## Two gates, two different failures

**The minimum-score gate** protects against *no evidence*. The top candidate's total is barely
above the floor — a couple of generic symbol hits on deep, heavily-decayed frames. There is
nothing here; the ranking is arithmetic noise ordered by accident. Most triage tools have this
gate, because a near-zero score is visibly embarrassing.

**The minimum-margin gate** protects against *ambiguous evidence*, and almost no triage tool
has it. The top candidate scores high — and so does the second. Two subsystems both have a
strong claim on this stack. This is common and it is not a bug in the scorer: subsystem
boundaries in a live engine are crossed on every frame, and a crash at a genuine boundary
*should* produce two strong scores. A high top score conceals this completely, because
nothing in "top candidate: 8.6" tells you the runner-up scored 8.1.

This is the important gate. **A confidence figure without the margin that produced it is not a
confidence.** It is a weighted sum of hand-set constants, and a reader will treat it as a
probability because it looks like one. Publish the margin next to the score, always, or
publish neither.

## Calibration

Two thresholds, and they are separate numbers:

- **Minimum score** — a floor expressed in the same units as the accumulated evidence, so it
  moves when the weights or the decay factor move. Set it so that a single top-frame directory
  match clears it and a scatter of decayed symbol matches does not. With directory/file/symbol
  weights of 3/2/1 and a decay of 0.4, a floor around **2.0** has that property.
- **Minimum margin** — the separation between the top two candidates, in either of two forms.
  A **relative** margin ("the winner must lead the runner-up by 25%", i.e. top ≥ second × 1.25)
  reads naturally and scales with the size of the evidence; its weakness is that at low
  absolute scores a large ratio can sit on a fractional difference. An **absolute** margin in
  evidence units — around **1.5** on a 3/2/1 scale, roughly "the winner holds one clear
  file-level hit the runner-up does not" — has no such weakness but must be re-set whenever the
  weights move. **Order the gates so the weakness cannot bite: apply the score floor first.**
  With a floor already excluding everything below file-level evidence, a 25% relative margin is
  safe and is the better default. Without the floor, use the absolute form.

Both thresholds are asserted, not derived, and they are the right place for a project's own
tolerance for a wrong answer to live. Tighten them after any wrong attribution reaches a team;
loosen them only with held-out evidence.

## The output when a gate fails

Unknown is a **result**, not a tool failure, and it must be as informative as a verdict:

- The verdict field reads `unknown` — a label, never a neutral score standing in for one, and
  never the top candidate with a hedged phrase attached.
- The **top two candidates and their scores** are still reported. The tool declining to choose
  does not mean it learned nothing, and the two names are what a human uses to know which two
  people to put in a room.
- The **reason** names which gate failed: below the score floor, or inside the margin. These
  demand different follow-ups — the first says the stack carries no subsystem evidence and
  probably needs better symbols or a dictionary entry; the second says the crash sits on a
  boundary and needs a person.
- The **contributing frames** are attached, so the verdict is checkable rather than oracular.

## Procedure

1. Compute per-candidate totals with the weighting and decay in force.
2. Sort. Take the top score `s1` and the runner-up `s2` (treat a missing runner-up as zero).
3. If `s1 < minScore` → unknown, reason `no-evidence`.
4. If the margin between `s1` and `s2` is short of the threshold → unknown, reason `ambiguous`.
   The reason is a closed enumeration — `attributed`, `no-evidence`, `ambiguous` — not a free
   string, so consumers can branch on it without parsing prose.
5. Otherwise report the top candidate **with** `s1`, `s2`, the margin, the weights, and the
   decay factor. A score handed across a boundary without its basis is not information.
6. Record the outcome — including the unknowns — so the unknown rate is measurable.

## Decision rules

- When you cannot decide whether a case is a weak verdict or an unknown, it is an unknown. The
  asymmetry is deliberate: no attribution costs a triage meeting, a wrong attribution costs a
  team-week and inoculates the real owner because the ticket already has a name on it.
- When the unknown rate is zero, the gates are not doing anything and should be tightened. A
  triage tool with a zero unknown rate is not confident, it is unfalsifiable.
- When the unknown rate exceeds roughly a third, do not loosen the gates — fix the input. Bad
  symbolisation, a stale dictionary, or a subsystem taxonomy split too finely all present as a
  high unknown rate, and all three are repaired upstream.
- When someone asks for "the best guess anyway", give them the top two with their scores and
  the explicit statement that the gate declined. Never re-label the guess as a verdict because
  it was asked for twice.
- When a downstream consumer aggregates verdicts, keep unknowns out of any percentage
  presented as accuracy, and report their count beside it. Folding them into a denominator
  makes the dashboard lie by arithmetic. This is the whole reason the gates are worth their
  cost: the verdicts feed the crashes-by-subsystem breakdown someone reads to decide where
  their crashes are concentrated, and one confidently misfiled crash moves that number.

## When not to use

Do not gate away a **direct** statement of ownership. If the fatal record itself names the
owning module, that is not an inferred score and the margin gate has no jurisdiction over it.

Do not use gates as a substitute for a scorer you know to be broken. If attributions are wrong
in a systematic direction, raising the floor only converts wrong answers into unknowns while
leaving the same bias in whatever still passes. Fix the dictionary; the gates are for
irreducible ambiguity, not for covering a known defect.
