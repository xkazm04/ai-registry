---
layer: application
type: application
subject: aaa-craft-rubric-authoring
technique: capped-disqualifiers
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# A cap written in a lens file, and a write door that did not read it

The `pof` ARPG production tool grades generated deliverables through ten markdown craft
lenses, and every one ends its criteria with a numbered DISQUALIFIERS list of five entries
that "caps at A1 regardless of other strengths" (three vfx entries say A2). The cap existed
as prose only. An auditor posted a gauge as a level plus findings, each finding naming the
violated criterion and a routing class; the write door checked the lens, the lens version
and the medium's roof, and nothing else. A gauge could report a fired disqualifier in its
findings and still award A3, and the store could not tell it from a gauge that was merely
generous.

## What changed

A finding may now name the disqualifier it reports by its 1-based position in the lens
file's list. A small table holds each lens's cap per position, pinned to the lens files by a
test that parses them (count and cap wording), so editing a list without the table fails the
build. The admission door takes the strictest cap among the cited disqualifiers and refuses
any level above it, and refuses a cited number the lens does not have, because ignoring it
would let a typo lift the cap. Lowest cap wins and caps do not stack, as the technique says.
Findings without the field, and gauges with no findings, are admitted exactly as before.

## The pair

Replay over every lens x disqualifier x level (10 lenses, 50 entries, 200 tagged gauges).
Target, tagged gauges above their own cap that the door admits: A 147 of 147, B 0. Floor,
tagged gauges at or below the cap, and untagged gauges: unchanged, 53 of 53 admitted, and the
existing craft and verdict-route suites (142 tests across 9 files) green. The new tests fail
on the old door (5 of 19) and pass on the new one. Type check and lint clean. Shipped on the
project's default branch as `8481218a`.

## What this did not touch

Two lens entries conflict with the technique and were left alone, because changing a lens
list bumps its version and re-projects every stored gauge under it as ungauged. Both audio
lenses cap at A1 when no loudness measurement exists anywhere in the metadata, which files an
absent measurement as a detected defect rather than as an unmeasured state the technique asks
to keep distinct. And dialogue and narrative each carry one entry (a voice-swap test, a
"could be attached to another entity" test) that needs a judgment call to detect, which the
technique's second test places in criteria, not caps. Neither is changed here; both are
recorded as a lens-version decision for the owner.

## Not measured

No stored gauges existed on the machine used, so how many live gauges already sit above a cap
they should have had is unknown. The field is optional and the craft-loop skill now tells the
auditor to send it; until auditors do, the door protects only the gauges that cite one.
