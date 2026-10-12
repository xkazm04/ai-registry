---
layer: application
type: application
subject: hand-tracked-timing-windows
technique: confidence-gated-detection
stack: cpp
status: draft
verified_on: 2026-10-10
verified_against: cpp@20
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A palm ward that never reads confidence, and the half of the gate that moved nothing

Source tree: `mage-arena-vr` on `master` at `6aa7a57` (the root of every path below). The
stack is C++ in an Unreal Engine 5.8 project. `cpp@20` is the engine's default language
standard: `apps/vr/Game/MageArenaVR.uproject:3 "EngineAssociation"` (5.8) is the witness,
and no module overrides it. The sibling applications describe the ward's onset walk and its
window. **Every number here is synthetic.** The clips are procedural, the pose error at low
confidence is a model, and no tracked hand has produced a real confidence dip yet.

## The seam

The ward detector builds a raise, its freshness and its onset from whatever pose arrives.
Nothing in `apps/vr/Game/Source/MageArenaVR/Gestures/WardDetector.cpp` reads
`Frame.Confidence`. The clips do carry it, and one of them already dips: the sloppy raise
holds confidence 0.4 for three frames at the start of the rise. A loss in the clip player
keeps the real pose and zeroes only the field:
`apps/vr/Game/Source/MageArenaVR/Hands/HandClipPlayer.h:38 "Clip-level tracking loss. A playing clip keeps its pose and reports confidence 0."`
The tree's one confidence floor sits in a different gate, the both-palms resume:
`apps/vr/Game/Source/MageArenaVR/Session/SessionFlow.cpp:518 "if (Left.Confidence < 0.2f || Right.Confidence < 0.2f)"`.
So the technique's own decision rule applies as written. The clips carry confidence and no
detector reads it, which means the gate is missing, not passed.

Two resolvers judge the ward, and they disagree about time. The tests' resolver judges a
hit against the recovered onset:
`apps/vr/Game/Source/MageArenaVR/Combat/AbsorbResolver.cpp:335 "const double SinceOnset = HitTime - WardState.OnsetTime;"`.
They call it after classification, which gives them a horizon:
`apps/vr/Game/Source/MageArenaVR/Tests/WardTests.cpp:676 "const FAbsorbResult AtTick = Resolver.Resolve(AuthoredTick"`.
The live session only sets a flag on the raise event
(`apps/vr/Game/Source/MageArenaVR/Session/ArenaSession.cpp:805 "bAbsorb = true;"`), and the
kernel starts the window at the tick the absorb begins:
`apps/vr/Game/Source/MageArenaVR/Kernel/ArenaKernel.cpp:43 "Actor.AbsorbFreshTick = State.Tick;"`.

## The instrument, and its positive control

No Unreal build was run. The arms ran through a line-for-line JavaScript port of the ward
detector (ingest, both onset walks, the held-sample rate) and the absorb resolver, fed the
committed clips. Before any arm was read, the port had to reproduce the suite's own timing
report, written by the onset test into the project's saved reports. It reproduced all 22
values: the geometric onset, the authored onset and confirm, and the confirm, onset and
perfect verdict at each injected latency from 0 to 100 ms.

The corpus is 28 fresh raises: the normal, sloppy and slow raises, the settle clip, and the
24 raises of the ward noise clip. Each trial puts one confidence dip of 3 or 6 samples
somewhere from 12 frames before the confirm frame to 2 after it. The dip is at 0.4, 0.1 or
0. During the dip the pose is one of four things: true (the tracker was right), held (the
last pose re-sent), jittered (1 cm per joint, five seeds), or one coherent wrong guess (the
hand rotated 20-60 degrees, five seeds). That gives 9,960 trials per arm at each confidence
level. Magic hits in the arc are judged on a 1 ms grid from 50 ms before the onset to 600 ms
after it. Each hit is judged twice, once under the onset-with-horizon rule and once under
the live rule.

## The arms

- **A**: the tree as it is.
- **B-3 / B-8**: the technique as its procedure reads. A two-threshold trust state enters at
  0.3 and leaves at 0.2. The 0.2 is the tree's own floor, and the 0.3 is a guess. With no
  reference rig, both are labelled guesses, as step 2 requires. A raise or a lowering is
  decided only on a trusted sample. An untrusted in-pose sample opens a deferral of 3 or 8
  samples, and expiry withholds the raise's freshness.
- **C-8**: B-8 plus the timing half. An untrusted sample measures nothing. It carries the
  last trusted speed and height, the way the tree's held-sample rate carries a re-sent pose,
  and the next trusted sample is measured across the gap.

## What it measured

**Target**: phantom perfect time, meaning hit times that earn a perfect the clean clip does
not grant. It is reported as a share of the clean perfect time, for dips below the floor,
under the onset-with-horizon rule.

| Arm | Phantom perfect (jitter / wrong guess) | Held pose, 6 samples (lost / phantom) | Rewards decided below 0.2 |
| --- | --- | --- | --- |
| A | 3.6-4.7% / 1.8-2.4% | 80.5% / 80.1% | 81-1,062 trials per cell |
| B-8 | 4.0-5.4% / 1.3-2.7% | 80.5% / 80.1% | 0 |
| C-8 | 0.2-0.5% / 0.2-0.5% | 0.4% / 0.5% | 0 |

**Floor**: the perfect time kept, with a 1% tolerance. On clean clips and on dips to 0.4,
all four arms are identical. On true-pose dips under the onset rule, B-8 loses nothing and
C-8 loses 0.2-0.4%. B-3 loses 20.3% at 6-sample dips, and 81 of 415 trials lose the perfect
outright, because expiry withholds the reward from a raise that was correct. Under the live
rule, every gated arm loses 3.9% (3-sample dips) and 13.4% (6-sample dips) of both perfect
and guard time where the tracker was right. A deferral moves the raise event the live
window opens at, and the hits inside it land unguarded.

## What it says about the technique

**The eligibility gate alone moved nothing.** B took the sub-floor reward count to zero,
which is step 5's measure. Its phantom rate was the same as A's. Under a per-hand
confidence, the low-confidence position feeds the onset walk, and the walk decides which
hits fall in the window. An arm that gates only the raise decision passes step 5 and still
pays the same phantoms. Only the comparison with a clean reference shows it.

**The timing gate is a hold, and the tree already owns the mechanism.** The held-sample rate
cannot tell a re-sent pose from stillness after its bound:
`apps/vr/Game/Source/MageArenaVR/Gestures/HeldPointRate.h:12 "A repeat that lasts past MaxHoldS is stillness"`,
at `apps/vr/Game/Source/MageArenaVR/Gestures/HeldPointRate.h:18 "MaxHoldS = 0.05"`. A
six-sample held pose outlives that bound. It reads as stillness, the walk stops on it, and
the onset jumps to the reappearance. Confidence is the flag that would lift the bound: a
low-confidence hold is not stillness. C-8 is that change.

**A deferral is free only where the verdict waits.** The technique says the player loses
nothing because the onset does not move while the game waits. That held under the tests'
resolver, where B-8 lost no perfect time on correct dips. It failed under the live rule,
where the window starts at the raise event. There the deferral moved the window and
dropped the guard for its length. The bound also has to cover the dips. Three samples lost a
fifth of the perfect time on 83 ms dips, and eight lost none.

**Verdict: not-better here.** The project's live path opens the window at the raise event,
and every gated arm fails the floor there. C-8 is better only under the onset rule, which the
tests use and the session does not yet. The order is fixed by the subject's open return
condition: put the onset in the live session first, then gate both halves. Writing C-8 into
the tree now would cost 13% of guard time on 83 ms dips the tracker got right.

## What this realization cannot show

The pose error at low confidence is assumed, not measured. A real tracker may keep the palm
position good at confidences where the finger joints are poor, which is the case the
technique's timing clause allows for. This tree has per-hand confidence only, so the run
could not separate them. The true-pose rows bound the cost of the hold when position was
right: 0.2-0.4% of perfect time. The dip lengths are also chosen, not observed. The project's
first device milestone asks for
`docs/PROJECT-PLAN.md:48 "≥95% high-confidence frames"`, and its corpus is the one to read
for the dip-length distribution and the pose error per confidence band. The floor and the
bound should be chosen from that corpus.
