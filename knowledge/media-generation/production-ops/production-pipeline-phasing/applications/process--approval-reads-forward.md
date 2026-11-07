---
layer: application
type: application
subject: production-pipeline-phasing
technique: approval-reads-forward
stack: process
status: forged
verified_on: 2026-11-06
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Process: a roster walk over a beat sheet that a forward walk already passed

A project authors its cutscenes as a seven-beat sheet that names, for each beat, what happens and
how it is shot. On 2026-10-21 a forward walk over this sheet named three things later beats need from
shared assets, and the sheet now carries them. So it is a hard case for a roster walk: an experienced
author wrote it, and it has already had this technique's other half applied.

A run on 2026-11-06 read the sheet and changed nothing. No project file changed, and no render, engine
or test suite ran.

## What was compared

Arm A is the roster the sheet declares: its catalogue links, its dependency list, its forward list and
the step's asset manifest. Arm B is a walk of the seven beats, tagging each location, figure, prop and
persisting state one requires. The tags were written by hand and looked up in arm A's surfaces with a
script.

**Target:** items a beat requires that arm A does not name, found before anything is built. **Floor:**
every tag quotes a beat's own words, and nothing arm A already names is lost. Both were written after a
first read of the sheet, so this was not a blind test. **What a caught outcome would teach:** if the walk
named nothing new on a sheet this well worked, the section is ceremony and should not stand.

| Beat item | Class | Beats | Named by arm A |
|---|---|---|---|
| Lead character | figure | 4, 5 | link, dependency, forward list |
| The lead's second head, gaze to lens | state | 5 | forward list |
| Establishing aerial plate | location | 1, 6 | forward list |
| Debris field ground layout | location | 2 to 5 | forward list |
| Player character | figure | 2 to 5 | no |
| Wounded soldier who is hauled clear | figure | 4 | no |
| Survivor who reaches out, then goes still | figure | 3 | no |
| Soldiers down in the sweep | figure | 3 | no |
| Burning beams | prop | 3 | no |
| Collapsed arch the haul has to clear | prop | 4 | no |
| Fire that collapses in the foreground | prop | 6 | no |

Arm A names 4 of 11 and arm B names 11, with n=1 sheet. The floor held: every row quotes a beat, and the
4 stay named. Two of the 7 new rows, the player and the soldier, have animation clips in a later step
but no asset that step can link. So the sheet's own contract, which asks for a link for each character
animated or referenced, is unmet for both. Its validators check that links resolve, not that they are
complete.

## What this cannot show

The 7 are unnamed in this sheet's surfaces. A level outside this pipeline may hold the props, and the
project plans to reuse a base body for the soldier, so none is shown to be missing from the game. Nothing
here prices a re-mint saved, and one walk by one reader has no second tagger behind it. This is an engine
cutscene, so what the walk saves is authoring time and not generation credits. The hosted-generation
cases that prompted the section report no measured saving either: their voices state the order and do
not measure it.
