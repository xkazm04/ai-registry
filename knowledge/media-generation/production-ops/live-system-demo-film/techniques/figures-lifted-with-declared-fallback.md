---
layer: technique
type: technique
subject: live-system-demo-film
technique: figures-lifted-with-declared-fallback
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [a film states figures that come from earlier test or benchmark runs, a run record that backed a figure is no longer on the machine, deciding what a graphic may assert when only the documentation holds the number]
---

# Figures lifted from the record, with a declared fallback

A film about a system that has been tested states results: how many trials, how
many failures, what a run cost. The summary technique says those figures are
lifted from the run that produced them and never typed. This one covers the case
that technique leaves open: the record that backed the figure has since been
deleted, moved to another machine or never committed, and the only surviving
statement of the number is a document someone wrote.

## Three sources, graded

Every figure the picture shows comes from exactly one of these, and the source is
carried with it:

- **A record on disk.** Read from the run's own report by the code that draws the
  graphic. This is the strongest source and the default.
- **A pin.** A small committed file that copies the figure from a document the
  team already publishes, with the document named. A pin is a claim about a
  record, not the record, and it is labelled as one wherever the figure is used.
- **Nothing.** The graphic draws no figure and no placeholder. An absent value is
  an omitted element, never a zero and never a plausible number.

The grade caps the rendering: a figure that rests on a pin does not get a
precision the document did not give it, and a graphic never launders a pin into a
record by drawing it the same way.

## The disagreement rule

A record that is present and a pin that is present are two statements of one
fact. When they disagree, the run fails and names both. Neither wins quietly:
either the document is stale, the pin was copied wrong, or the record belongs to
a different run than the one the document describes, and each of those is worth
a person's attention before a film asserts anything.

## Totals are the cheap check

When figures are summed on screen, trials across several runs or failures across
several runs, compute the total from the graded parts and compare it with the
number the documentation gives for the whole. In the case that taught this, two
runs were present as records, one was a pin, and the three summed to the figure
the documentation states for all three. That agreement is evidence that the pin
was copied from the right place, and a mismatch would have been the only
indication that it had not.

## What the picture says about its source

The consumer of a pinned figure must be able to see that it is one. Carry the
source as a field with the figure, show it in the take's record, and let the
review of a film list every pinned figure beside every lifted one. A film with
three pins and the rest lifted is a normal film; a film in which nobody can say
which is which is not.

## Failure modes

- **The silent pin.** A figure typed into the graphic's own code because the
  record was missing. It is now correct until the next run, indistinguishable from
  a lifted figure, and impossible to find.
- **The quiet zero.** A missing record rendered as zero breaches or zero failures.
  The absence of evidence is drawn as evidence of absence, which is the worst
  possible error for a film whose subject is trust.
- **Refreshing the pin from the record without reading the difference.** The
  disagreement is the information; overwriting it loses it.
- **A cost or time figure pinned to a different run than its neighbours.** Two
  numbers on one graphic from two runs read as one comparison. Name the run beside
  each, or draw them apart.

## Decision rules

- When the record is on disk, lift the figure from it, because it is the only
  source that can be re-run.
- When only a published document holds the figure, pin it with the document named
  and label it as pinned, because the audience's trust rests on the document and
  the film should not be stronger than the document.
- When a record and a pin disagree, fail and name both, because a film must not
  choose between two of its own sources.
- When no source exists, draw nothing, because a plausible number is worse than a
  gap.
