---
layer: application
type: application
subject: hand-tracked-timing-windows
technique: tracking-loss-as-a-game-state
stack: cpp
status: draft
verified_on: 2026-10-13
verified_against: cpp@20
applied: simulation
ab_verdict: better
---

# A palm ward that outlives its hand: one loss bound, at the session, ten windows long

Source tree: `mage-arena-vr` on `master` at `a7b5c6d` (the root of every path below), read-only.
The stack is C++ in an Unreal Engine 5.8 project; `cpp@20` is the engine default standard, witnessed
by `apps/vr/Game/MageArenaVR.uproject:3 "EngineAssociation"` as in the sibling applications. An
off-hand open palm is a ward; a fresh raise just before a hit is a perfect. **Nothing here was
executed.** No engine is installed on this machine, and the earlier confidence application kept no
runnable port, so the mode is a simulation over three cases read from the tree. No tracked hand
produced any figure.

## What the tree does with a loss

- **The session owns the only bound.** Loss is a confidence of zero on every seen hand, counted in
  combat, and it pauses the game when it lasts long enough:
  `apps/vr/Game/Source/MageArenaVR/Session/ArenaSession.h:82 "TrackingLossS = 1.5"` feeds
  `apps/vr/Game/Source/MageArenaVR/Session/SessionFlow.cpp:497 "HoldPause"`.
  That is the technique's single-player pause, and it is the only reaction to loss in the tree.
- **The ward detector has no loss state.** `Ingest` returns early on a frame with no palm joint,
  `apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.cpp:219 "if (!Frame.Joints.IsValidIndex(Palm))"`,
  and it never reads confidence. A raised ward therefore stays raised through an unseen interval.
- **The guard reads that flag and nothing else.**
  `apps/vr/Game/Source/MageArenaVR/Combat/AbsorbResolver.cpp:334 "const bool bGuarded = WardState.bRaised && InArc"`
  has no tracking input. The perfect window is `windowS 0.15`
  (`apps/vr/data/pinned/docs/design/baseline-fourteen-nights/design/data/combat.json:15 "windowS": 0.15`).
- **The presentation tells a different story from the guard.** The ward is drawn only while the
  latest left frame still carries a palm joint:
  `apps/vr/Game/Source/MageArenaVR/Greybox/HandPresentationComponent.cpp:296 "Detector->GetState().bRaised"`
  followed by the joint test on the next lines.

## Three cases, walked under A (as built) and B (a ward-level bound under the window)

B is the technique's procedure: a coast bound shorter than the 0.15 s window, after which the
detector neutralises (ward drops, no verdict earned inside the gap) and shows the loss.

1. **Hands unseen, ward raised (the idle untracked frame).** The test rig feeds a confidence-0 frame
   with no joints for 84 frames (`apps/vr/Game/Source/MageArenaVR/Tests/PauseTests.cpp:261 "84 sim frames"`).
   A: the detector returns early on every one, `bRaised` stays true for 1.4 s, a hit in the arc is
   guarded for the whole interval, and the ward is not drawn, because its frame has no palm. The
   player has an invisible guard. B: the ward drops once the gap passes the bound, so the first hit
   after about 0.1 s lands unguarded and the pause at 1.5 s still follows. Predicted: guard time under
   loss falls from the full 1.5 s to the bound, a factor of about ten to fifteen. **Falsified if** a
   code path outside the files read gates the guard on tracking; the grep for `bRaised` outside the
   detector found only the resolver and the presentation.
2. **Tracking dropped, pose kept (the clip drop).** The clip player keeps emitting the real pose at
   confidence zero (`apps/vr/Game/Source/MageArenaVR/Hands/HandClipPlayer.cpp:197 "Frame.Confidence = 0.0f"`).
   A: the detector ingests those samples as trusted, so a lowering and a re-raise made while the
   sensor reports nothing can earn a fresh perfect; the technique's count of verdicts awarded
   during loss is not zero. B: those samples are coasting, held, and the re-raise earns nothing.
   Predicted: the count falls to zero. **Falsified if** the resolver ignores freshness under a
   session pause; it does not, since freshness is the detector's flag. Cases 1 and 2 cannot both
   be exercised on one session, because the pause at 1.5 s freezes the second.
3. **Re-acquisition after a gap shorter than the pause.** The previous application on this subject
   measured, in a model, that a held pose longer than the hold limit reads as stillness and the
   onset jumps to the reappearance (its confidence application, applied row of 2026-10-10: held
   pose over 6 samples, 80.5% lost, 80.1% phantom in arms A and B). A gap of 0.1 s with a 0.4 m
   return is 4 m/s against `OnsetSpeedMps = 0.30`, so the first sample after a gap is read as a
   raise onset. B marks the first samples after a gap untrusted for a settle interval. Predicted:
   phantom perfects after a gap fall toward the C-8 figures of that row (0.2-0.5%). **Falsified
   if** the model's phantom rate does not survive a recorded device gap; V1's device corpus is the
   instrument.

## Verdict

`better`, simulation, with the target and floor named. Target: guard time and verdicts awarded
while a hand is unseen, from the 1.5 s session bound to a bound under 0.15 s, and from non-zero to
zero. Floor: perfect time kept on clean clips and on dips shorter than the bound, held at the
tolerance the confidence application declared (1%). The earlier row warns that a gate that
moves the raise event costs live guard time; a coast keeps the last trusted state and moves
nothing, so the floor is not at risk from the coast itself, only from the release after it.

**Seam chosen to falsify**, and what it refuted: the obvious reading was that the pause already
is the technique's loss state and the tree is covered. It is not. The tree holds the technique's
pause half and omits its coast half, and the two bounds are not one number.

## What the tree shows that the technique did not say

The technique ties the pause to the coast bound, "so that flicker does not pause the game". This
tree pauses at 1.5 s because a pause is a stop the player feels, while the guard has to release
inside a 0.15 s window. Those two thresholds cannot be the same number. A bound short enough to
release a guard would pause the game on every flicker; a bound long enough to avoid that is a
guard that outlives its hand ten times over. The technique now carries that as a decision rule.

## What this realization cannot do

It cannot say how often a real sensor loses a hand, how long its gaps are, or what the pose is
while it is blind. The gap lengths set the coast bound and no recording exists. It also cannot
rank this fix against the live-onset fix the confidence application put first in the ship order.

## Return condition

V1's device corpus with active state and confidence per frame (PROJECT-PLAN V1, 4 Nov): read the
gap-length distribution, pick the coast bound from it, then run cases 1 and 2 as an experiment on
the project's JS port of the detector. No change was made to the project's tree.
