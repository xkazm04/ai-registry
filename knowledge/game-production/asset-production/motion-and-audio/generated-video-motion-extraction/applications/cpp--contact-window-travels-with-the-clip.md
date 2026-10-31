---
layer: application
type: application
subject: generated-video-motion-extraction
technique: contact-window-travels-with-the-clip
stack: cpp
status: forged
verified_on: 2026-10-31
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: ab-paired
---

# PoF's player strike: a constant hit time over a clip that strikes four seconds later

The tree is the PoF Unreal project, `pof-exp` on `main` at `37f5609` (2026-09-25), read on
2026-10-31, together with the asset its player attack plays. The witness for the version is the
project's `EngineAssociation` of 5.8 with `DefaultBuildSettings = BuildSettingsVersion.Latest`,
which builds the game module as C++20; no target file overrides the standard. The capture scripts
live in the companion app repository (`pof`), where this run added the instrument described below.

## The seam

The player's melee ability falls back to one montage when none is set
(`Source/PoF/AbilitySystem/GA_MeleeAttack.cpp:163 "/Game/Weapons/AM_SwordSlashC.AM_SwordSlashC"`).
That montage is no longer hand-authored: the capture pipeline rebuilds it from the motion
extracted out of a generated video of a two-handed overhead saber strike, through a montage
factory that adds no notifies. The ability knows that montage has no hit event and says so
(`Source/PoF/AbilitySystem/GA_MeleeAttack.cpp:181 "has no notify, so without this the attack would land no damage at all."`),
so it switches to self-applied damage
(`Source/PoF/AbilitySystem/GA_MeleeAttack.cpp:182 "const bool bEffectiveGrayBox = !bUseAnimationDrivenDamage || !MontageHasHitNotify(AttackMontage);"`)
after a fixed delay
(`Source/PoF/AbilitySystem/GA_MeleeAttack.cpp:185 "UAbilityTask_WaitDelay::WaitDelay(this, GrayBoxHitDelay);"`)
whose default is a constant
(`Source/PoF/AbilitySystem/GA_MeleeAttack.h:84 "float GrayBoxHitDelay = 0.2f;"`), at
the default play rate (`Source/PoF/AbilitySystem/GA_MeleeAttack.h:52 "float MontagePlayRate = 1.0f;"`).
The ability is granted as the C++ class itself, so no Blueprint overrides either value; the run
read both from the class default object in the editor and got 0.2 and 1.0.

That is the technique's opening case exactly. The motion has answered "when can this hurt", a
constant answers it a second time, and each is consistent with itself, so nothing compares them.
The bone gate passes the clip because a bone rotated. The app's combo checker reads the hit time
from an authored notify and reports none. No step anywhere puts the two numbers side by side.

## The A/B

Run headless in UE 5.8, read-only, over the extracted clip the montage is built from. The montage
was confirmed to carry no notify events and one `Default` section starting at zero, so the
montage timeline is the clip's timeline.

- **Arm A, the seam as it stands:** damage at 0.20 s, which is frame 6 of the clip.
- **Arm B, the technique:** the contact window read from the motion. Contact point: both hands
  (a two-handed grip, the blade between them), in component space. Direction: down, for an
  overhead strike. Fraction: half of peak speed.

| | Arm A (constant) | Arm B (measured) |
| --- | --- | --- |
| Hit time | 0.20 s, frame 6 | frames 133-135, 4.43-4.53 s |
| Hand speed at the hit | 1 cm/s, 0% of peak | peak 667 cm/s (right), 595 cm/s (left), both at frame 134 |
| Basis stated | none | 175 frames, 5.833 s, 30 fps **resampled**, clip fingerprint, bones, direction, fraction |
| Disagreement visible to any step | no | yes: 4.23 s, hit outside the window |

- **Target:** whether the hit time sits inside the motion's contact window, and whether anything
  reports it when it does not. Arm A lands damage 4.23 s before the strike, during the idle
  lead-in, and no instrument says so. Arm B states the window and the offset.
- **Floor:** the window must not depend on an arbitrary choice of contact point. Right hand,
  left hand, and the right hand by 3D speed instead of downward speed all start at frame 133 and
  end at 135 or 136. Held.
- **Verdict:** `better`.

Two things the floor found that the technique says in one line and this tree makes concrete:

- **The direction is part of the measurement.** Reading forward speed instead of downward speed
  puts the window at frames 128-129, five frames earlier and narrower: the forward reach comes
  before the downward chop. Five frames is more than the window is long. For this strike, "down"
  is the right declaration, and the sidecar carries it so a reader can tell.
- **The rate basis moves frame indices.** A first probe in the same run mapped frames to time at
  29.83 fps (frames minus one, over the length) and got a window one frame earlier (132-135) than
  the instrument at 30 fps. Four seconds into a clip, a 0.6% rate error is a whole frame. The
  basis is also not the generator's: the capture step re-encodes to 30 fps and forces 30 when the
  extractor cannot read a rate, so the sidecar labels it resampled, not native.

## What shipped, and what did not

Shipped in `pof` (commit `14be0f45` on `master`): a read-only capture-stage script that measures
the window from any extracted AnimSequence and writes it as a sidecar with the basis, the
fingerprint, and the ability's authored hit time beside it, never replacing it. It refuses to
emit a window when a bone never moves or no contact point reaches a striking speed. The pipeline
document gained a step 3b telling the run order to read it for any clip that becomes an attack.

Not shipped: the change to the game. The decision lives in the Unreal project, whose working tree
carries other sessions' uncommitted assets, and the fix is an asset edit (a hit-detection notify
state over frames 133-135 on the montage) or a derived delay, either of which wants an editor pass
and a play test. It is filed as the project's next change. Note also that the montage is the whole
5.8 s generated clip; trimming the idle lead-in would move both numbers, so the window is re-read
after any trim, as the technique requires.

## What this cannot show

- **That a hit inside the window feels right.** The window says when contact is plausible; whether
  the combat design widens it, and whether the target is in reach then, is the combat system's call.
- **A tip trajectory.** The blade is not a bone in this skeleton. Both hands bracket a two-handed
  grip, and their agreement is the evidence that the grip stands in for the blade here. A
  one-handed weapon held far from the hand would need a socket.
- **Anything about other clips.** One clip, one solve, one retarget. The fingerprint is what stops
  this window from being reused after a re-roll.
