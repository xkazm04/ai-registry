---
layer: technique
type: technique
subject: video-assembly
technique: window-plan-validation-is-asymmetric
status: forged
laws: [refusal-is-a-state]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [validating a plan of generation windows or segments against a target length, a planner trims or drops trailing windows to make a plan fit, deciding whether a too-long or too-short generation plan should fail]
---

# Window plan validation is asymmetric

A long generated clip is planned as a series of windows or segments, each with a stated
duration, and the plan is checked against a target length - a section of a song, a
slot in the cut. The tempting check is symmetric: the plan must equal the target, and
anything else is either an error in both directions or something to repair
automatically. The two ways a plan can disagree with its target are not the same kind
of error, and they get opposite treatment.

- **Overrun** - the plan is longer than the target. Report it with the predicted total
  and let the plan run. A longer render is harmless and visible: the author can see
  exactly how long it will be, and the surplus is a trim at the edit.
- **Starvation** - an earlier window consumes the budget so that a later window would
  receive zero frames. Refuse the plan before anything is generated. A starved window
  is a shot the author wrote that will silently not exist.

So a planner never trims trailing windows to make a plan fit. A trim loop that shortens
the last window until the total matches, and drops it when it reaches zero, converts
an overrun - the harmless, visible error - into starvation, the harmful, invisible
one. The render then "matches the music" and is missing a shot nobody was told about.

Raising on every mismatch is the other wrong answer. It refuses plans whose only fault
is a surplus the edit absorbs for free, and it gives the author no number to act on.
The report on an overrun carries the predicted total; the refusal on starvation names
the window that would receive nothing.

## Decision rules

- Overrun: warn with the predicted total, and generate.
- A window that would receive zero frames: refuse the plan and name the window.
- Never trim or drop windows to fit a target; a fit that removes a shot is a refusal
  dressed as a success.
