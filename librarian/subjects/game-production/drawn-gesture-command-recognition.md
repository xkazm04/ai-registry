---
domain: game-production
subject: drawn-gesture-command-recognition
last_touched: 2026-10-10
touched_by: intake
dry_streak: 0
depth: L1
---

# drawn-gesture-command-recognition

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-09 - `/forge`, founding (run `b78a2519`, branch `autopilot/accepted-idea-delivery-b78a2519`)

This is N1 of `docs/subject-proposal-immersive-interaction.md`, a Phase-1 draft at status
`draft`. It is the first subject of the new `immersive-interaction` ring in `couch-and-tv-play`
(placement B, owner 2026-10-07). The ring, the retitle to "Couch, TV and immersive play" and the
`apply-taxonomy.mjs` move of the six existing subjects into `couch-and-tv` landed in the same
series. Order: expert draft, outside hardening, then reconciliation against `mage-arena-vr`
`master` at `be7583a`, read-only.

**Depth L1.** Five techniques and two cpp applications. There is one source tree, and no
tracked hand or person drew any stroke. Every figure is labelled synthetic, including the
"mouse" corpus, which is generated.

**Outside hardening.** The $1 paper (scores in [0..1], so a non-recognition threshold is
possible, but it defines no reject method) and later work that learns the reject threshold
from synthetic negatives with an F1 objective. Leave-one-user-out results from several
modalities (for example 92% overall against 80% on unseen users, recovering to 90% with three
samples per user). $P and 3D point-cloud variants, plus the in-plane orientation hazard of a
fitted plane.

**Upward lessons from the source.**
- Scale normalisation erases a mark's size relative to its loop. Impostor distances overlapped
  the correct tail, so the floor could not refuse them, and structural gates in the stroke
  builder do. This became the first of four refusals.
- Under a predicting tracker, path length doubles every overshoot, so gates measure reach.
- A corpus is labelled by what produced it, not by what it imitates.
- A harness that skips templates or counts unfed seconds certifies more than it measured.

**Deviations recorded.**
- No best-to-second margin, and all 19 remaining extrap25 misses are line confusions.
- The negatives come from fixed bands that do not move with the held-out seed.
- The D-G2 rows for the owner (≥95%) and a second person (≥85%) are unmeasured.
- The matcher timing and the pen-down-to-cast figures are not in committed evidence.
- The plane frame is a fixed seated forward (+X), not the head's forward direction captured at
  pen-down.

**Open, with return conditions.**
- **People's held-out draws.** **Return:** the owner's and a second person's mouse draws
  (D1), then real hands (V2, 8 Nov), each with n, date, build and command.
- **A margin or garbage templates.** **Return:** a run that reports what a margin would
  reject among the remaining line confusions.
- **`vocabulary-distinctiveness-audit` has no application.** **Return:** a cross-user
  confusion matrix.

### 2026-10-10 - `/intake apply pen-down-stroke-segmentation` (run `intake-apply-pdss-1010`, Curator dispatch on "single stack (cpp)")

First application of `pen-down-stroke-segmentation`, as an **experiment** with verdict
**not-better**, against `mage-arena-vr` `origin/master` at `e9f99db`. The applied row is
`a86c1c6` in the project's `.ai/applied.jsonl`, pushed. There is no product change.

**Seam, chosen to falsify.** The subsystem passes every frame to the stroke builder and never
reads confidence, and the session pauses only after 1.5 s of loss. A resampling point-cloud
matcher could forgive a short joined chord, which step 4 called a shape the player never drew.

**Instrument first** (the declared focus). A line-for-line port of the builder over the
project's own plane fit and cloud distance, run on the corpus the project documents. Its
positive control was 83/83 of the suite's thresholds, checked before any arm was read.

**Read.** 1,440 trials per loss length. Cast precision held at 95.0% through 200 ms of loss
(95.6% with none), then fell to 88% at 300 ms, 75% at 400 ms and 54% at 600 ms. Aborting past
3 samples discarded every correct cast at 100-200 ms. A held pose and a dropped frame were the
same input to the pinch pen. To the speed pen, a held pose was a stop that committed a partial
shape: 166 casts at 200 ms, all removed by the bridge.

**Landed.** Step 4 now bridges a gap the matcher tolerates. Two decision rules were added:
held pose versus missing frame by pen type, and how to measure the bridge. A cpp application
records the arms and the table.

**Side finding, not landed.** The project's speed-pen style is set only by tests. It extracts
every corpus drawing, but none classifies under the reject floor, and the suite checks only
extraction. **Return:** when that style becomes selectable, or the suite classifies it.

**Open, with return conditions.**
- **The knee on real hands.** It lies between 200 and 300 ms on synthetic strokes, under a
  model where the hand keeps drawing while untracked. **Return:** the first recorded hands
  corpus with dropouts. Re-read the curve before the confidence gate is built.
- **Single stack (cpp).** Unmoved: one project draws gestures, in one stack.
