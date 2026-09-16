---
layer: technique
type: technique
subject: live-system-demo-film
technique: summary-rendered-from-the-run
status: forged
laws: [output-never-outruns-evidence, checkability-routes-the-pixel]
shared_with: []
use_when: [building a recap screen or end plate for a demo film, a figure on screen disagrees with what the demo did, deciding what a demo's closing frame may claim]
---

# The summary rendered from the run

The recap screen, the counts along the way, and the end plate are **rendered
from the run's own record** — never transcribed from it. This is a one-sentence
technique with an outsized failure mode, because the recap is the most quoted
frame in the film. People screenshot the closing plate; they paste the number
into a deck; the number outlives the video by a year. A recap that is a second
authority about the run is the one thing a recap must never be.

## The naive version and why it rots invisibly

The natural way to build a closing screen is to watch the demo once and type
what happened: eleven steps, three approvals, two blocked actions. On the day it
is built, it is correct. It is also frozen, and everything it describes keeps
moving. A beat is added; the count is now ten out of eleven. A safeguard changes
its wording; the plate quotes the old one. The divergence is invisible because
nobody re-watches the ending of a demo they produced, and because the plate
looks exactly as authoritative wrong as it did right.

The deeper point is about what the recap is *for*. It exists to close the loop —
to say "here is what you just watched, counted". A recap that was typed cannot
do that, because it does not know what you just watched. It is a claim sitting
beside the film rather than a reduction of it, and a claim beside the film is
precisely what the whole subject exists to eliminate.

## The record is a first-class structure

The mechanism is simple and its discipline is in one place: the run keeps a
record — per beat, what was done, what was asserted, what the assertion found,
the timings, any error — and the recap reduces over that record in the same run
that produced it.

Three rules keep the reduction honest:

- **Read the record, not a copy of it.** A recap built from a snapshot pasted
  into a fixture, or from output scraped back out of a log, has reintroduced the
  second authority with extra steps. The record is a structure the run owns and
  hands to the renderer.
- **Compute, do not annotate.** "Eleven steps" is a count over entries. The
  moment a human writes the eleven anywhere — even as a check, even as a
  default — there are two numbers and one of them will be wrong.
- **Reduce at render time, in the same run.** A recap that reads yesterday's
  record while today's take plays behind it is the sync defect of this technique.

## The zero case, and the floor that is a lie

If nothing happened, the recap says nothing happened. A recap with a hard floor
— "at least three" — or a placeholder that renders when the record is empty is
the same falsehood in smaller type, and it is usually introduced for a good
reason (the screen looked broken during development). The honest fix for an
empty-looking screen is a designed empty state, not a fabricated number.

The same applies to failure. A recap that omits the beats that broke is telling
the viewer that a clean run happened. Failed beats are part of what was watched
and belong in the count, distinguishable from successes — which is also the only
way a diagnostic take is legible as one.

## What the rule covers

Wider than the closing plate. Anything on screen that is a **figure about the
run** falls under it: progress counters during the film, a per-section tally, a
"steps completed" strip, the runtime and beat count in the film's own metadata,
and the description published alongside it. If a viewer could check it against
what they watched, deterministic code draws it from the record.

The complement is worth stating, because the rule is sometimes over-applied.
Values that are properties of the **stage** rather than of the run — a price on
a fixture's pricing page, a seeded account name, a planted defect's description
— are not run facts and are not computed from the record. They come from the
fixture, and they are declared in the film's boundary as staged. Confusing the
two produces a recap that tries to derive the set dressing, which is both
impossible and beside the point.

## Decision rules

- When a number appears on screen and describes the run, reduce it from the
  record; when it describes the stage, take it from the fixture and declare it.
- When the record and the recap disagree, fail the build. The recap never wins a
  disagreement, because the whole reason it exists is that the record is the
  authority.
- When a figure is expensive to compute at render time, cache it in the record —
  never in the renderer, because a value cached where it is displayed is a value
  that has stopped tracking its source.
- When a recap needs a figure the record does not carry, extend the record.
  Adding the figure to the renderer instead is how the second authority is born,
  every time, and it always looks like the smaller change.

## When not to use it

A film with no summary needs none — a plate that exists to have a plate is
furniture, and furniture with numbers on it is a liability. And where the closing
claim is genuinely an argument rather than a count ("this is what the
architecture buys you"), that is authored prose and should read as prose: the
technique governs figures, and dressing an argument up as a computed statistic
is a precision claim the run cannot back.
