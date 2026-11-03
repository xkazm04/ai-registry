---
layer: application
type: application
subject: seated-in-world-reading
technique: one-reading-depth-in-the-comfort-zone
stack: cpp
status: draft
verified_on: 2026-11-03
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A seated light table's reading depths, counted in diopters

Source tree: bp (public, github.com/xkazm04/bp), `master` at `202883f`, which is on
`origin/master`. Read on 2026-11-03. It is a seated VR light table on Unreal Engine 5.8: a
room map lies on a table, a deck of reading screens stands over it, and a status panel rides
on the left wrist. The headset is a tethered PC headset that publishes no focal distance, so
every conflict below is given against both ends of the 1.25 to 2.5 m band that the vendor
guidance states.

## The geometry, from the code

The eye the captures are judged from sits over the table:

apps/vr/Source/bp/BpGameMode.h:34 "static constexpr float TargetEyeAboveTopCm = 43.f;"
apps/vr/Source/bp/BpGameMode.h:35 "static constexpr float TargetBehindNearEdgeCm = 30.f;"
apps/vr/Source/bp/BpTable.h:74 "static constexpr float TableDepthCm = 90.f;"

So the table's near edge is about 52 cm from the eye (1.91 D) and its far edge about 127 cm
(0.78 D). The work surface spans more than a diopter by itself.

The deck, after the owner asked for "in front of me" and "a little bit further", committed
in `f2c5170`:

apps/vr/Source/bp/BpTable.h:341 "static constexpr float DeckDistanceCm = 75.f;"
apps/vr/Source/bp/BpTable.h:343 "static constexpr float DeckDropDeg = 11.2f;"
apps/vr/Source/bp/BpTable.h:344 "static constexpr float DeckStepBackCm = 4.f;"

The wrist panel, placed relative to the eye:

apps/vr/Source/bp/BpPawn.h:58 "it hangs above the left rest hand, at WristPanel*Cm from the eye, turned to face it; SetWristParent moves it onto a"
apps/vr/Source/bp/BpPawn.h:63 "static constexpr float WristPanelForwardCm = 26.f;"
apps/vr/Source/bp/BpPawn.h:64 "static constexpr float WristPanelSideCm = -23.f;"
apps/vr/Source/bp/BpPawn.h:65 "static constexpr float WristPanelDownCm = -31.f;"

## Three cases walked under both policies

Policy A is what the code does: place by angle and by the owner's read. Policy B adds the
technique, which counts the reading depth in diopters.

1. **The deck at 75 cm (1.33 D).** Under A it is correct: straight ahead and legible. Under B
   it clears the 0.5 m floor and sits under the 1 m band. The conflict is 0.53 to 0.93 D, and
   the swing to the table is 0.57 D to the near edge and 0.55 D to the far edge. B's
   candidates, each scaled so the text keeps its angle:
   - **At 1.0 m:** the conflict falls to 0.2 to 0.6 D, and the swing becomes 0.91 D near and
     0.22 D far.
   - **Beyond the far edge (about 1.28 m):** the conflict falls to 0.02 to 0.38 D, and the
     swing becomes 1.13 D near and 0 D far.

   The panel's lower edge stays on the far-edge sightline (19.7 degrees below the horizon) at
   every scaled distance. So it clears the table top by about 17 cm at 75 cm and by about
   9 cm at 1 m. The move is geometrically open. B predicts lower strain at 1 m only if the
   person reads the deck more than the map. That is the trade, and nobody has measured it.
2. **The wrist panel at about 46.5 cm (2.15 D).** It is under the 0.5 m floor for sustained
   fixation. A already keeps it to a few rows, because a blind panel of three judges read it
   as small and steeply tilted. B reaches the same rule for an independent reason, so the
   two agree. Nothing changes.
3. **The queue and the swap.** The spines stand 4 and 8 cm behind the front screen, which is
   0.07 and 0.13 D. The swap slides a screen toward the first spine's place, a change of less
   than a tenth of a diopter. B's "one reading depth" rule holds. Nothing changes.

## Verdict: unmeasurable

B changes nothing that A shipped. It names one open choice, the deck at 75 cm against 1 m,
which only a seated session can decide. The instrument is a seated headset session of
15 minutes or more with the deck at 75 cm and at 1 m (scaled 1.33 times), in a
counterbalanced order. It records a visual-fatigue questionnaire and the reading time per
screen. **Falsifier:** if fatigue at 1 m is no lower than at 75 cm, or the map's near half
reads worse there, the over-the-surface home is the right one for a table this deep, and the
technique's preference for a metre or more gains that condition.
