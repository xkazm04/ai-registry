---
layer: application
type: application
subject: video-assembly
technique: silent-defects-get-a-code-or-an-error
stack: next
status: forged
verified_on: 2026-10-14
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# An ad renderer whose text fit counted lines and never width

The witness for the stack is the project's framework dependency, read in its lockfile on the day of the run (16.3.3). The project renders a short ad from adopted clips, drawn supers and an end card, with the overlay text drawn on a canvas in a headless browser page.

The pipeline already followed the technique's first move. A clip, or the music take, missing from the store is a typed refusal that names the shot, returned before anything renders, never black frames. The second move found a live instance in the overlay drawing: the function that fits text shrank the font only while the wrapped line *count* exceeded its limit. The request validator bounded characters (a super up to 120, a call to action up to 80), which has no relation to width.

## What was measured

The seam was chosen to falsify the technique's third section: could the character cap plus a line-count fit still let drawn text escape the safe zone? The real overlay script was run in a headless browser at three aspects against seven copies, ordinary and awkward (a web address, a social handle, a long compound word), and the drawn pixels were read.

**Arm A** was the script as shipped. **Arm B** added one condition to the shrink loop: also shrink while the widest line is wider than the box. The target was the count of aspect-by-copy cases whose drawn extent left the safe box. The floor was that ordinary copy must keep its font size.

| Arm | Cases outside the safe box | Cases cut off at the frame edge | Ordinary copy font size |
| --- | --- | --- | --- |
| A, as shipped | 11 of 21 | 10 of 21 | 63, 46, 54 |
| B, width-aware fit | 0 of 21 | 0 of 21 | 63, 46, 54 (identical) |

The cases that failed were exactly those holding one unbreakable word wider than the box, and they stayed at the full 73 or 63 pixel size, because a single long word is one line and the line count never rose. The seam could have refuted the technique had the validator's cap been enough; it was not.

The change shipped as one loop condition and a regression probe that reads the drawn pixels, on the project's active branch, not pushed.

## What this realization cannot do

The copies were constructed to include awkward tokens, not drawn from the project's stored ads, so the 11 of 21 is a measure of the fit function's behaviour on such input, not of how often real ads contain it. How often a call to action is a web address is a question for the stored requests, which this run did not read.
