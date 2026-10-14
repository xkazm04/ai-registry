---
layer: application
type: application
subject: drawn-gesture-command-recognition
technique: vocabulary-distinctiveness-audit
stack: cpp
status: draft
verified_on: 2026-10-14
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Three spell lines, one pooled gate, and the class it could not see

Source tree: `mage-arena-vr` on `master` at `f928f1d` (the root of every path below). The stack
is C++ in an Unreal Engine project; `cpp@20` is the engine default standard, as in the sibling
applications on this subject. **Every number here is synthetic**: the clips come from the
project's seeded procedural hand, and no tracked hand and no person drew any stroke counted.
The measurement ran on the project's own JavaScript ports of the recognizer and the stroke
builder (`apps/vr/tools/glyphs/qdollar.mjs`, `stroke.mjs`), not on the engine; no Unreal test
was run.

## The vocabulary and the seam

The vocabulary is three commands. Each is a loop followed by one inner stroke: vertical,
horizontal and diagonal (`apps/vr/tools/clipgen/corpus.mjs:35 "['sigil-line1', 'vertical']"`).
The diagonal is drawn at 45 degrees
(`apps/vr/tools/clipgen/corpus.mjs:190 "stroke === 'vertical' ? Math.PI / 2"`), exactly midway
between the other two. The project already prints a confusion matrix with a rejection column
(`apps/vr/Game/Source/MageArenaVR/Tests/SigilTests.cpp:63 "struct FAccuracyBucket"`), which is
step 4 of the technique. What it gates is narrower than what it prints: the top-1 bars are
applied to a variant with the three classes pooled
(`apps/vr/Game/Source/MageArenaVR/Tests/SigilTests.cpp:503 "sloppy top1 %.4f"`, bar 0.90).

The seam was chosen to falsify the claim that the existing matrix already covers the
technique's fourth step. If it did, cutting the same bars per class would find nothing new.

## The instrument, and its positive control

The audit script (`apps/vr/tools/vocab-audit/audit.mjs`, pushed with this row) runs steps 1 to
5 on the 36 committed templates, the 270-clip synthetic corpus, the 90 mouse-path clips and
the 180 impostors. Its positive control is the project's own header. The recognizer header
states a correct-match maximum of 23595, bare circles from 13084, open arcs from 49796 and
zigzags from 4271; the port reproduces all four exactly, and the pooled sloppy result of 82
of 90. The first version of the script carried its own matcher and a fixed-plane projection;
it came within 0.5% of those numbers, then was replaced by the project's ports once they were
found, and every cell count stayed the same.

## The arms

**A** is the gate as it is: three pooled variant bars. **B** is the same bars applied to each
class inside each variant, with the other four steps read beside it.

**Target:** class cells under their own bar. **Floor:** the pooled gate stays met, and no
product code or threshold changes.

| Step | What it read |
| --- | --- |
| 4, cut per class | A sees 0 cells under a bar. B sees 2 of 12: synthetic sloppy horizontal 24 of 30 (80%, all six misses read as diagonal) and synthetic normal diagonal 28 of 30 (93%, bar 95%). |
| 4, pooled | sloppy 82 of 90 against a bar that needs 81. One more miss fails the gate; it is a one-clip margin that happens to hide a class at 80%. |
| 2, shared prefix | The inner mark is 9.3% to 9.9% of the drawn path. A loop-only drawing is 4481 to 5358 from the nearest other command, while the correct tail reaches 23595. About a tenth of the cloud carries the whole difference between commands. |
| 3, quarter turns | A vertical template turned 90 degrees lands 2178 from a horizontal template, and the reverse 2522. That is closer than any unturned cross-class pair (3196), so the pair depends on the projection getting its axes right, as the technique says. |
| 1, pairwise | Tightest unturned cross-class pair is horizontal with diagonal at 3196. The diagonal's own templates spread to 59941, so its class is wider than the gap to its neighbours. |
| 5, negative proximity | zigzag and dot impostors sit 4271 and 5008 from a template, all below the reject distance; the stroke builder, not the distance, refuses them. This matches the recognizer header and is why the reject distance cannot be the vocabulary's separator. |

The check shipped with the script is a ratchet, not a bar, because HEAD is under its bar. A
cell may not lose clips against the baseline. Removing the twelve sloppy templates turns it red
on four cells, which shows it sees the class level.

## What the seam says about the technique

The finding held: the matrix existed, the per-class cut was missing, and the cut found a class
at 80% that a pooled 91% hid. Two decision rules came out of it and are now in the technique:
apply an acceptance gate's bars to each command and each capture variant, and report the
remainder's share of the path when every command opens with the same prefix.

## What this cannot say

- The horizontal-to-diagonal pair is a vocabulary question, and the technique says change a
  shape, not the reject distance. No angle sweep was run: the generator has no knob for the
  diagonal's angle, and its template mode rewrites tracked clips.
- A seeded procedural hand drew the sloppy variant. Whether real hands tilt a horizontal line
  toward the diagonal at the same rate is unknown until a device corpus exists.
- The staged-teaching rule (audit each subset) was not exercised; the vocabulary has three
  commands and no stage.
