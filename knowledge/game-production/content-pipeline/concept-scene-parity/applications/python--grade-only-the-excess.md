---
layer: application
type: application
subject: concept-scene-parity
technique: grade-only-the-excess
stack: python
status: forged
verified_on: 2026-10-25
applied: code
ab_verdict: unmeasurable
---

# Python: an excess-blue grading LUT fitted from five regions

bp's VR light table (`apps/vr`, Unreal Engine 5.8, forward VR path) grades its frame with a
256 x 16 colour-grading LUT fitted by a pure-Python script from a neutral engine capture to
the concept image. The script keeps three models side by side, and its docstring records
why two of them were rejected. Read at bp commit `d8b1fea` on 2026-10-25.

## The tone curve was switched off, then put back

The first look round turned the filmic tone curve off to land the paper's authored blue:
apps/vr/tools/mcp-steps/py/level_lighttable.py:93 "No filmic tone curve: with it the paper's authored blue"
The fidelity sprint's light step reverses that and moves the colour work into a grade:
apps/vr/tools/mcp-steps/py/fid_look.py:14 "Post: filmic back on"
apps/vr/tools/mcp-steps/py/fid_look.py:15 "The paper's blue comes back through a grading LUT fitted from a neutral capture"
The sprint's light brief gives the reason in the technique's terms: the scan band, at six
times the paper's emission, saturated to white with the curve off. That brief is in the
session scratchpad, not the tree.

## Three models, two rejected with the reason written down

scripts/lookdev/fit_grade_lut.py:6 "the matrix turned the skin lavender, Lynx 2026-10-24"
scripts/lookdev/fit_grade_lut.py:9 "the per-channel curve yellowed the neutrals"
The model that held fits only the blue standing above the other two channels:
scripts/lookdev/fit_grade_lut.py:84 "e_src = src[2] - max(src[0], src[1])"
scripts/lookdev/fit_grade_lut.py:99 "out[2] = m + (rgb[2] - m) *"
Pixels without a blue excess pass through untouched, so skin, the amber accents and the
neutrals keep their hue. The black lift is capped, as the technique asks:
scripts/lookdev/fit_grade_lut.py:26 "LIFT_MAX = 0.04"

The fit is committed with its inputs, which is the technique's step 6: five regions, the
two paper regions weighted three, in
docs/concepts/vr-light-table/lookdev/grade/fid-grade-regions.json:2 "paper open, mid"
and one fitted number for the deviation, in
docs/concepts/vr-light-table/lookdev/grade/fid-grade-fit.json:1 "0.3823862544636659"
applied at strength 0.8. The engine step names the model it imports:
apps/vr/tools/mcp-steps/py/fid_look.py:161 "fit_grade_lut.py --model excess from a neutral capture"

The fit file also shows the technique's last decision rule in action. After grading, the
city region is still well bluer than the concept's, and the dark room region is still far
darker; the narrow model did not widen to chase them. Those residuals are findings for the
city matte and the room's light, not for the grade.

## The verdict

`ab_verdict: unmeasurable`. The comparison of the three models (lavender skin, yellowed
neutrals, excess held) is the builder's reading, made on preview renders during the
sprint. The owner never saw the grade in isolation: the intake run
`intake-vr-fidelity-20261024` judged only the whole scene before and after the sprint
(better, unblinded, "about 25-30"), and the grade is one of many changes inside that arm.

## Deviations recorded

- **The script's default is still the per-channel curve**, the model its own docstring says
  yellowed the neutrals:
  scripts/lookdev/fit_grade_lut.py:4 "curve (the default)"
  A run without `--model excess` reproduces the rejected grade.
- **The grade has no device cost on record.** The sprint measured frame time in the
  editor's game mode on the desktop, not on a headset, so the post chain the grade rides
  on is uncosted against the headset budget subject's allowance.
