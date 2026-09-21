---
layer: technique
type: technique
subject: live-system-demo-film
technique: retake-without-an-edit-session
status: forged
laws: [cost-per-usable-output, edit-do-not-regenerate]
shared_with: []
use_when: [a demo film's script changed and the film must be re-made, controlling spend on repeated narration synthesis, deciding how a captured take is assembled into a cut, pricing a film before running it]
---

# The retake without an edit session

A script change costs **one command**. That sentence is the whole technique, and
everything below is the machinery that makes it true — because the alternative
is not "a slightly more expensive change", it is a film that is never re-made,
and a demo of a live system that is never re-made is a claim the team is still
publishing after it stopped being true.

Five mechanisms carry it, and they are worth implementing in this order.

## 1. Synthesis is idempotent, and the skip is on freshness

Narration is the expensive step and the one that is repeated most. The rule: a
clip that already exists **and can prove it belongs to the current line** is not
re-synthesised. Both halves matter. Skipping on presence alone is the single
most common implementation of this idea and it is a defect: a rewritten line
keeps its beat identity, so the old recording keeps its name, and a
presence-only skip preserves stale audio forever. The freshness comparison —
what was actually read aloud, against the line as it now stands — is what makes
the skip safe rather than merely cheap.

## 2. One beat can be re-narrated by identity, and measurements are merged

An operator who changed one sentence names that beat and only that beat is
re-synthesised. The surrounding beats are untouched, which is the general
edit-over-regenerate rule applied to audio: what the notes were not about stays
byte-identical, and everything computed against it — its measured duration, its
place in the estimate — stays valid.

The trap here is the durations record. A partial run writes measurements for the
beats it touched, and the naive implementation **replaces** the record with
those. The symptom is a whole film reverting to estimated pacing after a
one-word fix, which presents as a mysterious timing regression and is very hard
to attribute. Merge, never replace: a partial run drops nothing. This is
sufficiently easy to get wrong that it deserves a test of its own.

## 3. A spend guard, not a spend warning

Synthesis is billed per unit of text, and the runaway case is specific: an edit
that accidentally invalidates every clip, a full re-synthesis, discovered on an
invoice weeks later. A **guard** — a declared per-run budget, above which the run
refuses until it is explicitly authorised — costs one conditional and removes the
entire failure class. A warning does not, because the warning is printed into a
log nobody is reading at the moment an unattended run decides to spend.

Two properties: the budget is declared beside the script's other configuration
rather than buried, so raising it is a visible act; and the refusal states the
number it would have spent, so the authorisation is an informed one rather than
a reflex.

## 4. A dry mode that prices and paces without spending

A mode that walks the whole script, computes what synthesis would cost and what
the film would run to, and spends nothing. It answers the two questions asked
before every run — what will this cost, and how long will it be — and it is also
the cheapest structural review available: a beat that will hold twenty-two
seconds is visible as a number long before anyone sits through it.

The dry estimate is, by construction, an estimate, and it carries that mark for
the same reason every estimate in this subject does. It prices a film and paces
a rehearsal. It does not pace a delivery.

## 5. Assembly reads the offsets the recorder logged

The capture logs where each beat's audio begins, in the same clock the picture
uses; the assembler places each clip at its logged offset. There is no manual
sync step, ever — which is what makes assembly deterministic and therefore
re-runnable. Four details make it robust:

- **A continuous silent bed underneath.** Clips are placed onto a bed of the
  take's full length rather than concatenated end to end, so a missing or short
  clip displaces nothing and the mix's duration is a property of the picture.
- **Overrun is trimmed, deterministically, with a short fade.** When a clip is
  longer than the space before the next one, it is cut to fit with a brief fade
  rather than allowed to overlap. Two voices talking over each other is the
  worst defect the mix can have; a slightly clipped tail is the least bad
  resolution and it must be the *same* resolution on every run.
- **A missing clip is a warning that leaves a gap, not a crash.** Losing the
  whole assembly because one beat's audio is absent throws away a good take for
  a defect the operator can see and fix in thirty seconds. The gap is drawn in
  the record, and the run reports it.
- **Captions come from the same beats and the same offsets**, so there is no
  second timing authority to drift against the voice.

And one rule about the take's own output that reads as housekeeping and is not:
**exactly one capture file per take.** Capture tooling that writes under a
generated name and then copies to the name you asked for leaves two large,
identical-looking recordings side by side, only one of which has offsets, and
nothing in either file says which. Delete the one the assembler must not use, in
the same step that saves the one it must. A deterministic build has exactly one
input for each role, and an ambiguous input is a build that is deterministic
only until somebody guesses.

## Which change invalidates what

Most of the economy is knowing this, and it is worth writing down where the
operator can see it:

- **A wording change** invalidates that beat's clip and that beat's measurement.
  Re-narrate the beat, re-take (because the hold changed), re-assemble.
- **A change to what a beat shows** invalidates the take and nothing else. The
  audio is untouched; re-take and re-assemble.
- **A change to the assembly** — captions, the bed, a fade — invalidates neither
  the audio nor the take. Re-assemble only, in seconds.
- **A change to the system under test** invalidates the take, and may invalidate
  the *script*, which the recorder's own assertions are what tell you.

## Decision rules

- When the same film will be produced more than twice, build the skip, the
  guard and the dry mode before the second run; the economics that make a
  re-shoot cheap are worth nothing if they arrive after the film is already
  being re-shot by hand.
- When a clip is stale, re-synthesise it; when the whole film reports stale,
  stop and check the normalisation of the freshness comparison before
  authorising the spend, because a false-positive freshness check is a bill.
- When assembly needs a human to line something up, the offsets are wrong or
  missing — fix the logging rather than the timeline, because a manual fix is
  one that must be repeated on every future run.
- When a run is unattended, a refusal is the correct outcome for an
  over-budget film; an unattended run that spends is the one that gets the
  budget taken away.

## When not to use it

A film that will be produced exactly once does not need this machinery, and the
guard and the dry mode are the parts to skip first. And note the boundary that
this technique does *not* cross: it is the **mechanical and economic** re-shoot
of a captured take — what a change costs and what it invalidates. Whether a
reviewer's note should be answered by an edit or by a regeneration, and how a
regenerated region joins the material around it, is the review-iteration craft's
question and this technique does not settle it. Cheap re-running makes
regeneration tempting; it does not make it correct.
