---
layer: technique
type: technique
subject: video-assembly
technique: silent-defects-get-a-code-or-an-error
status: forged
laws: [unmeasured-is-not-pass, checkability-routes-the-pixel]
shared_with: []
use_when:
  - a renderer accepts input it cannot honour and produces a plausible picture anyway
  - a composition renders cleanly and the output is transparent, black, cut off or missing a layer
  - a missing or undecodable media file resolves as black frames or silent audio instead of failing
  - a request validator bounds the size of text but the text is drawn, wrapped and clipped later
  - an incident was diagnosed by watching the output and nothing now prevents its recurrence
---

# Silent defects get a code or an error

A renderer's default posture is to draw *something*. Hand it a colour it cannot
parse and the layer is transparent; hand it a border written as a shorthand
and the border is ignored; hand it a layer placed beyond the canvas and it is
drawn perfectly, outside the picture; hand it a media file it cannot open and
it can resolve with black frames and silence. Every one of these is a success
as far as the renderer is concerned, every one of them is a defect as far as
the author is concerned, and none of them leaves a trace except the output.

That is the class: **the render succeeded and the picture is wrong in a way
the input already determined.** The cure is not to watch harder. It is to give
each such defect a place to be reported before the render, by one of two moves
chosen by whether the render *can* mean anything.

## Move one: when there is nothing to draw, fail

If a referenced input cannot be opened or decoded, there is no composition to
render - there is a hole where one of its parts should be. Resolving that
hole as black frames or silent audio converts a missing-file error into an
output that has to be noticed by a person, possibly after delivery. Make it
an error that names the input, at the point the render reads it. The test is
whether any correct reading of the author's intent includes "this part is
absent"; for a referenced file, none does.

## Move two: when something draws but not as intended, lint it

For input that is valid and renders, run a **static pass** over the source
before the render and report findings with three properties:

- **A stable code** (`unknown_color`, `offscreen_layer`, `low_contrast_text`),
  so a finding can be suppressed, counted, tracked across runs and added to a
  test by name.
- **A severity defined by consequence, not by taste.** *Error* - it draws
  nothing at all (a gradient the renderer cannot read; an image layer pointed
  at a video). *Warning* - it draws, but almost certainly not what was meant
  (an unparsable colour that falls back to transparent; text below a contrast
  floor; a static layer wholly outside the canvas). *Info* - it works and is
  probably waste or a trap (an animated property whose every keyframe holds
  one value; an ambient light on top of an environment light; a material
  setting with no environment to shade it).
- **A message that names the layer and the remedy**, so the reader of the
  finding can act without opening the source to guess what the code means.

Fold the findings into the render's own quality report, so the same list is
visible whether the author ran the lint or only the render.

## What a static pass may not claim

The pass sees the source and nothing else, and it has to be honest about
that. A contrast rule knows the backdrop only until something paints over it:
text after an image, a shape or a panel at the same level sits on pixels the
pass cannot see, so the rule goes silent there rather than guessing. A
visibility rule skips a layer whose position is animated, because the layer
may move in. A rule that fires on what it cannot know trains authors to
ignore the list, and a list that is ignored is no better than no list.

Write each rule so a finding is *true of the source*, and let rule silence
mean "cannot tell", not "fine".

## A validator that counts cannot see what is drawn

The same class has a second face upstream. A request validator that bounds the
length of a piece of text - the number of characters in a caption or a call to
action - is checking the one property of the text that has no relation to
whether it fits. What is drawn depends on the width of the longest word that
cannot be broken: a web address, a handle, a long compound. Such a word can
sit within every character limit, keep a line-count check satisfied because it
occupies one line, and still be drawn past the safe zone and clipped at the
frame edge. Fitting logic that shrinks text only when it wraps onto too many
lines shares the blind spot.

The fix lives where the extent is known: the drawing layer, which can measure,
shrinks until the *widest line* fits as well as until the line count does. A
character cap at the door is a courtesy; the measurement at the canvas is the
check.

## Decision rules

- When the renderer can resolve a missing or undecodable input into a quiet
  default, make it an error that names the input.
- When an incident was found by looking at output and the cause was in the
  source, add a lint rule with a code at the time you fix it; a defect found
  twice by eye is a rule not yet written.
- When assigning severity, ask what the output looks like: nothing, probably
  wrong, or merely wasteful.
- When a rule depends on information the static view lacks, make it silent in
  that case and say so in the rule's comment.
- When text is drawn, measure the widest line at the canvas and shrink on it;
  never rely on a character count to guarantee fit.
- When reviewing a pipeline, list its silent defaults first; each is either an
  error, a lint, or an undocumented hazard.

## When not to use it

Where the input genuinely admits absence - an optional layer, a placeholder in
a draft cut - failing is wrong; carry the absence as a visible state instead
(see gap and refusal honesty). And a lint is not a substitute for looking at
a frame: it finds the defects the source determines, and a composition can
pass every rule and still be ugly.
