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

## Architecture review - 2026-10-31

First review, against `e3f00b8a4`. All eleven documents read. The tables in all five cpp
applications recompute. Two technique claims about the $-family were checked against the
primary papers and need scoping: $P and $Q distances are unbounded, and $Q's early abandoning
precludes a margin unless one is designed in. The golden path's held-out-user gap holds only
when templates come from one person. One internal inconsistency is in stroke-plane-projection
('completely' versus its own sign rule). The founding open item, that
`vocabulary-distinctiveness-audit` has no application, is closed by the 2026-10-14 application.
The consumer tree was not reachable, so no verified_on date moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/drawn-gesture-command-recognition",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:c763688c28aafebb",
  "disposition": "clarify",
  "coverage": "All 11 documents read in full (golden path, 5 techniques, 5 cpp applications). Every table in the applications was recomputed. Relative links to on-device-verification-harness resolve. Three primary sources opened. Trigger: pending since founding. Intended benefit: the subject's claims about the $-family match what the papers say. Failure if ignored: a team sets a reject floor as if scores were bounded, or builds a margin on $Q's early-abandoned partial sums. Boundary: no tracked-hand evidence exists; every application figure is synthetic, and the consumer tree was not re-opened.",
  "counterexamples": [
    "Templates drawn by many people on flat input reach >99% user-independent accuracy with $P/$Q. The held-out gap is large only when one person drew the templates.",
    "A fitted plane is facing-invariant, but its eigen-solver sign is not. Pointed at a world constant, every stroke mirrors past 90 degrees of yaw (99 of 270 wrong in the cpp experiment).",
    "A $Q matcher with early abandoning cannot report a margin. The second-best distance it returns is a partial sum.",
    "A short tracking gap (up to about 200 ms in one synthetic corpus) is forgiven by a resampling point-cloud matcher. 'Abort after a few samples' discards every correct cast there."
  ],
  "sources": [
    {
      "url": "https://depts.washington.edu/acelab/proj/dollar/dollar.pdf",
      "result": "$1 pseudocode read. RECOGNIZE returns 'score <- 1 - b / 0.5*sqrt(size^2 + size^2)', a score bounded to [0..1]. It defines no reject step, which matches the founding note's reading."
    },
    {
      "url": "https://mintviz.usv.ro/publications/MobileHCI2018_1.pdf",
      "result": "$Q paper (Vatavu, Anthony, Wobbrock, MobileHCI 2018) read. '$P delivers 99% user-dependent accuracy with T=4 templates per gesture type ... reaches 99.1% user-independent accuracy starting from PxT = 32 templates'. The pseudocode starts 'score <- infinity' and returns the minimum distance (unbounded). '$Q similarly implements early abandonment during the point-cloud matching process', plus a lower bound LB(C,T) <= $Q(C,T) that skips CLOUD-DISTANCE calls. '$Q evaluated over 1,000 templates in just 82 ms on the Cortex-A53', consistent with 'microseconds per template' and 'well under a frame' for a few dozen templates."
    },
    {
      "url": "https://depts.washington.edu/acelab/proj/dollar/index.html",
      "result": "$-family landing page. '$Q ... 142x faster and slightly more accurate'. No reject or threshold guidance."
    },
    {
      "source": "mage-arena-vr (consumer tree)",
      "result": "Not reachable from this checkout. Application anchors were not re-opened. Arithmetic was recomputed from the documents' own tables. No verified_on refreshed."
    }
  ],
  "documents": {
    "drawn-gesture-command-recognition.md": {
      "disposition": "clarify",
      "reason": "The held-out-user claim was unscoped. The $Q paper reports $P at 99.1% user-independent accuracy from 32 templates per gesture type on flat input, so the gap is a property of templates drawn by one person. Scope the sentence to that case and add the multi-person counterexample. The rest stands: the six-stage pipeline, the matcher-always-answers rule and the corpus labels are consistent with every technique."
    },
    "techniques/pen-down-stroke-segmentation.md": {
      "disposition": "keep",
      "reason": "Its numbers match the cpp application: 1,440 trials = 360 x 4, 95.0% to 200 ms, 88/75/54% at 300/400/600 ms, 8 extra wrong = 72 - 64. The bridge rule and the held-pose-versus-missing-frame rule follow from that experiment. Hysteresis, pre-roll and reach-not-path are standard and internally consistent."
    },
    "techniques/stroke-plane-projection.md": {
      "disposition": "clarify",
      "reason": "Internal inconsistency. 'Three ways to choose the plane' says a fitted plane 'removes facing error completely', but the decision rule added on 2026-10-13 (from the cpp experiment: 13 to 99 wrong casts of 270 past 90 degrees of yaw) says the normal's sign still needs head forward. Scope the sentence to 'up to the normal's sign'."
    },
    "techniques/reject-class-recognition.md": {
      "disposition": "clarify",
      "reason": "Two corrections from primary sources. (1) 'Its scores are bounded' holds for $1, where score = 1 - b / 0.5*sqrt(size^2 + size^2), but not for $P and $Q, which return a raw summed (squared, for $Q) distance that starts at infinity. The cpp application's floor is the raw distance 26000. (2) The margin refusal needs the second-best distance, and $Q's early abandoning and lower bound stop computing any template that cannot beat the best so far. A margin has to be designed into the search. The four refusals, the negative-corpus procedure and the decision rules stand."
    },
    "techniques/vocabulary-distinctiveness-audit.md": {
      "disposition": "keep",
      "reason": "The invariance-first rule matches $P and $Q's documented direction and articulation invariance. The two decision rules added on 2026-10-14 (per-command bars inside each variant; remainder share under a shared prefix) are backed by the cpp application's 24/30 cell under a pooled 82/90. The founding note's open item, that this technique had no application, is closed by that application."
    },
    "techniques/held-out-cross-user-acceptance.md": {
      "disposition": "keep",
      "reason": "It holds out by person, labels the corpus by what produced it, re-draws the negatives with the split, and fails a skipped template. Each rule is traced to a cpp finding. The 'fewer than about five people' preliminary threshold is a judgement and is labelled as one."
    },
    "applications/cpp--held-out-cross-user-acceptance.md": {
      "disposition": "keep",
      "reason": "The arithmetic checks: 87/90 = 96.7%, 88/90 = 97.8%, 82/90 = 91.1%. Unmeasured rows are stated as unmeasured. The source tree (mage-arena-vr) is not reachable from this checkout, so the line anchors were not re-opened and verified_on is unchanged."
    },
    "applications/cpp--pen-down-stroke-segmentation.md": {
      "disposition": "keep",
      "reason": "Every precision in the table recomputes (1,376/1,440 = 95.6% through 159/251 = 63.3%). 15 samples at 72 Hz = 208 ms, and 3 samples = 42 ms. Anchors not re-opened (tree unavailable). Note for the next reader: the header names a86c1c6 while the 2026-10-10 touch log names e9f99db as the measured base and a86c1c6 as the applied row. Not resolvable without the tree."
    },
    "applications/cpp--reject-class-recognition.md": {
      "disposition": "keep",
      "reason": "26000 - 23595 = 2405, and 251/270 = 93.0% leaves 19 misses, matching the 'all 19 extrap25 misses' anchor. The no-margin deviation is honestly recorded. Anchors not re-opened (tree unavailable)."
    },
    "applications/cpp--stroke-plane-projection.md": {
      "disposition": "keep",
      "reason": "170 + 99 + 1 = 270. Line3 at 180 degrees: 48 + 37 + 4 + 1 reject = 90. Line1 and line2 losses (3 + 11) plus line3's 85 account for 99 wrong. The unbuilt C++ half and the assumed yaw are declared. Anchors not re-opened (tree unavailable)."
    },
    "applications/cpp--vocabulary-distinctiveness-audit.md": {
      "disposition": "keep",
      "reason": "0.90 x 90 = 81, 24/30 = 80% and 28/30 = 93.3% across 12 cells (4 variants x 3 classes), all consistent. Being JS-port-only and synthetic is declared. Anchors not re-opened (tree unavailable)."
    }
  }
}
```

Applied the same day, re-recorded against the new digest. The three clarify items above are
now in the text.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/drawn-gesture-command-recognition",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:3007cbcc28588de7",
  "disposition": "keep",
  "coverage": "All 11 documents read in full (golden path, 5 techniques, 5 cpp applications). Every table in the applications was recomputed. Relative links to on-device-verification-harness resolve. Three primary sources opened. Trigger: re-record after applying this run's three clarify items. Intended benefit: the subject's claims about the $-family match what the papers say. Failure if ignored: a team sets a reject floor as if scores were bounded, or builds a margin on $Q's early-abandoned partial sums. Boundary: no tracked-hand evidence exists; every application figure is synthetic, and the consumer tree was not re-opened.",
  "counterexamples": [
    "Templates drawn by many people on flat input reach >99% user-independent accuracy with $P/$Q. The held-out gap is large only when one person drew the templates.",
    "A fitted plane is facing-invariant, but its eigen-solver sign is not. Pointed at a world constant, every stroke mirrors past 90 degrees of yaw (99 of 270 wrong in the cpp experiment).",
    "A $Q matcher with early abandoning cannot report a margin. The second-best distance it returns is a partial sum.",
    "A short tracking gap (up to about 200 ms in one synthetic corpus) is forgiven by a resampling point-cloud matcher. 'Abort after a few samples' discards every correct cast there."
  ],
  "sources": [
    {
      "url": "https://depts.washington.edu/acelab/proj/dollar/dollar.pdf",
      "result": "$1 pseudocode read. RECOGNIZE returns 'score <- 1 - b / 0.5*sqrt(size^2 + size^2)', a score bounded to [0..1]. It defines no reject step, which matches the founding note's reading."
    },
    {
      "url": "https://mintviz.usv.ro/publications/MobileHCI2018_1.pdf",
      "result": "$Q paper (Vatavu, Anthony, Wobbrock, MobileHCI 2018) read. '$P delivers 99% user-dependent accuracy with T=4 templates per gesture type ... reaches 99.1% user-independent accuracy starting from PxT = 32 templates'. The pseudocode starts 'score <- infinity' and returns the minimum distance (unbounded). '$Q similarly implements early abandonment during the point-cloud matching process', plus a lower bound LB(C,T) <= $Q(C,T) that skips CLOUD-DISTANCE calls. '$Q evaluated over 1,000 templates in just 82 ms on the Cortex-A53', consistent with 'microseconds per template' and 'well under a frame' for a few dozen templates."
    },
    {
      "url": "https://depts.washington.edu/acelab/proj/dollar/index.html",
      "result": "$-family landing page. '$Q ... 142x faster and slightly more accurate'. No reject or threshold guidance."
    },
    {
      "source": "mage-arena-vr (consumer tree)",
      "result": "Not reachable from this checkout. Application anchors were not re-opened. Arithmetic was recomputed from the documents' own tables. No verified_on refreshed."
    }
  ],
  "documents": {
    "drawn-gesture-command-recognition.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: held-out-user claim scoped to single-person templates, plus the $P 99.1% user-independent counterexample (from 32 templates per shape) from the $Q paper."
    },
    "techniques/pen-down-stroke-segmentation.md": {
      "disposition": "keep",
      "reason": "Its numbers match the cpp application: 1,440 trials = 360 x 4, 95.0% to 200 ms, 88/75/54% at 300/400/600 ms, 8 extra wrong = 72 - 64. The bridge rule and the held-pose-versus-missing-frame rule follow from that experiment. Hysteresis, pre-roll and reach-not-path are standard and internally consistent."
    },
    "techniques/stroke-plane-projection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'removes facing error completely' -> 'up to the normal's sign', pointing to the existing sign decision rule."
    },
    "techniques/reject-class-recognition.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: comparable-not-bounded scores ($1 bounded in [0..1]; $P/$Q raw unbounded distance), and the margin refusal now notes that $Q's early abandoning and lower bound never compute the second-best score."
    },
    "techniques/vocabulary-distinctiveness-audit.md": {
      "disposition": "keep",
      "reason": "The invariance-first rule matches $P and $Q's documented direction and articulation invariance. The two decision rules added on 2026-10-14 (per-command bars inside each variant; remainder share under a shared prefix) are backed by the cpp application's 24/30 cell under a pooled 82/90. The founding note's open item, that this technique had no application, is closed by that application."
    },
    "techniques/held-out-cross-user-acceptance.md": {
      "disposition": "keep",
      "reason": "It holds out by person, labels the corpus by what produced it, re-draws the negatives with the split, and fails a skipped template. Each rule is traced to a cpp finding. The 'fewer than about five people' preliminary threshold is a judgement and is labelled as one."
    },
    "applications/cpp--held-out-cross-user-acceptance.md": {
      "disposition": "keep",
      "reason": "The arithmetic checks: 87/90 = 96.7%, 88/90 = 97.8%, 82/90 = 91.1%. Unmeasured rows are stated as unmeasured. The source tree (mage-arena-vr) is not reachable from this checkout, so the line anchors were not re-opened and verified_on is unchanged."
    },
    "applications/cpp--pen-down-stroke-segmentation.md": {
      "disposition": "keep",
      "reason": "Every precision in the table recomputes (1,376/1,440 = 95.6% through 159/251 = 63.3%). 15 samples at 72 Hz = 208 ms, and 3 samples = 42 ms. Anchors not re-opened (tree unavailable). Note for the next reader: the header names a86c1c6 while the 2026-10-10 touch log names e9f99db as the measured base and a86c1c6 as the applied row. Not resolvable without the tree."
    },
    "applications/cpp--reject-class-recognition.md": {
      "disposition": "keep",
      "reason": "26000 - 23595 = 2405, and 251/270 = 93.0% leaves 19 misses, matching the 'all 19 extrap25 misses' anchor. The no-margin deviation is honestly recorded. Anchors not re-opened (tree unavailable)."
    },
    "applications/cpp--stroke-plane-projection.md": {
      "disposition": "keep",
      "reason": "170 + 99 + 1 = 270. Line3 at 180 degrees: 48 + 37 + 4 + 1 reject = 90. Line1 and line2 losses (3 + 11) plus line3's 85 account for 99 wrong. The unbuilt C++ half and the assumed yaw are declared. Anchors not re-opened (tree unavailable)."
    },
    "applications/cpp--vocabulary-distinctiveness-audit.md": {
      "disposition": "keep",
      "reason": "0.90 x 90 = 81, 24/30 = 80% and 28/30 = 93.3% across 12 cells (4 variants x 3 classes), all consistent. Being JS-port-only and synthetic is declared. Anchors not re-opened (tree unavailable)."
    }
  }
}
```
