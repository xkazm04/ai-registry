---
layer: technique
type: technique
subject: music-prompt-composition
technique: section-plan-as-the-brief
status: forged
laws: [edit-do-not-regenerate, style-is-restated-not-remembered]
shared_with: []
use_when: [briefing a generator on a full piece rather than a loop, a one-shot prose prompt keeps returning takes that are wrong in different places, a piece will need revision after review, deciding how much structure to specify versus leave to the model]
---

# Section plan as the brief

The unit of a music brief is the **section**, and the brief itself is an
ordered plan of them: each section carries a label (its structural role — an
opening, a verse, a chorus, a bridge, a close), a duration, its own style
directives stated in both directions, and its content — lyric lines to be
performed, or an explicit instrumental marking. Current generation schemes
converge on exactly this shape, with per-section duration down to the
millisecond, per-section include/exclude style lists, and global caps (on
the order of dozens of sections, and total lengths from seconds to minutes)
— the numbers move per vendor and live in the application layer; the shape
is the technique.

## Why the plan beats the paragraph

A prose prompt and a section plan can describe the same piece. They fail
differently, and the difference is the whole argument:

- **A prose piece fails as a whole.** When the one take comes back 80%
  right, there is no address for the 20% — the only operations are accept,
  or regenerate everything and lose the 80%.
- **A planned piece fails by section.** The chorus that missed its brief is
  a named region with a stated duration and its own directives; the note
  becomes an edit, the edit targets the section, and everything approved
  survives byte-identical. The edit-over-regeneration law is only
  exercisable over an artifact that has parts, and the plan is where parts
  come from.

The plan is also the acceptance contract. "Does the delivered audio have
the briefed structure" is only a checkable question because the brief
committed to a structure — sections at expected offsets, with expected
durations. An acceptance pass without a plan to check against is a vibe
with a checklist's posture.

## Writing the plan

- **Decide the piece's identity in the opening section.** Its directives
  set genre, tempo world, and palette for everything after; later sections
  inherit that frame and their directives should state *deltas* — lift,
  thin, halve the feel, add a choir — not restate the identity.
- **State every section's style in full anyway when the scheme allows it.**
  Inheritance is a model behavior, not a promise; the restatement law
  applies to music exactly as to images. The delta lives in what you add,
  but the base style rides in every section that must keep it.
- **Durations are decisions, not suggestions.** A section plan with real
  durations is executable against picture; "auto" duration is for
  standalone pieces where the clock is free. Mixed plans — fixed where
  picture demands, free elsewhere — are legitimate and should say which is
  which.
- **Mark instrumental sections explicitly.** An empty lyric field is
  ambiguous to a model that can sing; an explicit instrumental marking is
  not. The most expensive missing word in an underscore brief is that one.
- **Stay under the scheme's caps by design, not by truncation.** If the
  piece needs more structure than the plan format allows, the piece is
  really several pieces (movements, cues) and should be briefed as such.

## Decision rules

- When the piece will ever be reviewed, revised, or cut against picture,
  brief it as a plan, because every one of those workflows needs addressable
  parts.
- When exploring identity — no structure yet worth committing — a short
  prose prompt for disposable candidates is honest; promote the chosen
  direction into a plan before any take accrues review capital.
- When a take from a plan is wrong in one section, edit that section by
  address rather than re-briefing the piece, because the plan exists
  precisely to make the smaller operation available.

## When not to use this

Loops, stingers, and beds a few seconds long have one section; a plan of one
is a prose prompt with extra steps. And a piece whose structure is genuinely
the thing being explored — "surprise me" as a legitimate creative posture —
should not be forced through a committed plan on the first pass; the plan
enters when commitment does.
