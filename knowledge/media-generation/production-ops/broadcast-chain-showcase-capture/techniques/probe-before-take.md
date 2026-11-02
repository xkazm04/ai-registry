---
layer: technique
type: technique
subject: broadcast-chain-showcase-capture
technique: probe-before-take
status: forged
laws: [unmeasured-is-not-pass, cost-per-usable-output]
shared_with: []
use_when: [before a take that goes through a live broadcast, a take was spent and the stream picture was unusable, writing the checklist a showcase capture runs before recording, deciding whether a take may be published]
---

# Probe before the take

Before a take through the broadcast chain, grab one frame of every region the take will
record, with the chain live, and check each condition the take depends on. The take starts
only when every condition passes. A condition nobody checked is unmeasured, not passed.

## Why the tool's own probe is not this probe

A capture that drives a tool usually has a dry run: it walks the beats, screenshots the
tool, and reports which controls were found. That probe is necessary and it checks the
wrong picture. The tool window is the caption; the stream picture and the platform player
are the evidence, and every chain failure that ruins a take lives in those two: a dialog
the broadcasting software opened on going live, another window across the player's region,
overlays stacked in the centre of the canvas, pale cards over a black scene, a drawer left
open over the end marker. None of them appears in a screenshot of the tool, and each
appears in one frame of the right region.

A take through the chain costs a live session, a public or semi-public stream, a reset of
the rehearsal state, and minutes of recording that is only reviewed afterwards. A probe
costs one frame per region. A take that ends unusable for a reason one frame would have
shown spent the whole chain to learn it.

## The conditions

Check each from a captured frame where it can be seen, and from state where it cannot,
and record which.

1. **Regions.** Each recorded region contains the window it is meant to, at size, with
   nothing over it, edge to edge. Compare the frame of the player region against the
   player's own appearance, not merely against "not empty": the broadcasting software's
   preview over the player region is not empty.
2. **Marker patches.** Each recording's sampling patch is uncovered and shows a colour the
   marker is distinguishable from.
3. **Program.** The broadcast shows the scene the take starts on, with the stream
   background in place and every source the first beat needs reporting itself showing; a
   browser source in a scene that is not showing may not have painted.
4. **Leftovers.** No overlay, source, armed rule, sealed draw or other state from a previous
   take is present. A chain take writes to the broadcasting software and the tool's stores
   at once; retakes fail when either is not reset, and the reset is a script, not a memory.
5. **Platform.** The player is playing the live stream from this session, not a previous
   broadcast or an offline slate.
6. **Picture.** For every shot the film will use, apply the shot and grab the program
   frame. The composition check of the overlay craft runs on each: overlays drew
   something, none overlap, all sit inside the safe area, text reads at viewer scale, and
   each card reads over the background it will air on. A probe that checked the program
   once, with no shot applied, has not seen the film's stream picture.
7. **Abort safety.** A command exists, and has been run once, that stops the stream and the
   recording and removes the take's sources if the capture dies mid-take, because a crashed
   capture leaves a channel live.

## After the take, the same conditions are the gate

The take's own frames are checked against the same list at both markers and at each shot
change before anything is assembled. A take that fails is a diagnostic. It is kept for the
lesson and not cut into the film, and a film whose takes all failed is abandoned rather than
salvaged: editing a better stream picture over a take whose stream picture was the evidence
produces a film that claims more than the run showed.

## Decision rules

- When a probe fails, fix the cause and re-probe; never start the take in the hope that the
  condition clears itself.
- When a take fails for a reason the probe did not check, add that condition to the probe
  before the next take, because the probe is the film's accumulated lessons in executable
  form.
- When the probe can only screenshot the tool, it is the tool's dry run, and the chain is
  unprobed; say so rather than reporting a probe pass.
- When the stream picture does not read in the probe, stop filming and fix the overlays or
  the shot list; no amount of capture discipline rescues an unreadable picture.

## When not to use it

A take of a local application that costs seconds and touches no live chain can be its own
probe; re-running it is cheaper than checking it.
