---
layer: technique
type: technique
subject: image-to-3d-input-gating
technique: score-defect-verdict-protocol
status: forged
laws: [unmeasured-is-not-a-pass, no-gate-self-certifies, compiling-is-not-wiring]
use_when: [designing the response contract of an automated visual gate, a vision critic returns prose that nothing can act on, choosing thresholds for an input rubric]
---

# The score / defects / verdict protocol

## The concern

A vision model asked to judge an image will happily write three paragraphs. Paragraphs are
not a gate. They cannot be compared between runs, they cannot be thresholded, they cannot be
counted across a batch, and every reader extracts a different conclusion from the same text —
which means the gate's actual behaviour is decided by whoever reads it last.

The fix is an **output contract**: the judge is instructed to answer in a fixed shape, and
the caller parses that shape rather than interpreting language. Three fields, and only three.

- **SCORE** — one integer on a stated scale, against stated criteria.
- **DEFECTS** — zero or more entries drawn from a **closed vocabulary**, one per line.
- **VERDICT** — one token from a closed set.

Everything the judge wants to say beyond that is discarded by the parser, and that is
correct. Justification prose is useful for a human debugging the gate; it is never the thing
the pipeline acts on.

## Why the defect list must be enumerated

This is the part most implementations get wrong, because free-form defect text feels more
informative. It is not, for a reason that only appears in aggregate: the list exists so you
can answer *which failure class is costing us the most across a hundred inputs*, and free
text cannot be counted. Two judges describing one problem as "cluttered background" and
"busy scene behind subject" produce two rows in a report that should be one, and a batch of
sixty inputs yields fifty distinct defect strings and no signal at all.

A closed vocabulary also disciplines the judge. Given a fixed list, a vision model picks
from it; given an open field, it invents severity language and drifts toward describing the
image rather than grading it. Keep the vocabulary small — the working set for reconstruction
inputs is on the order of eight to twelve entries, one per criterion plus the recurring
compound cases. Anything the judge genuinely cannot express is a signal to extend the
vocabulary deliberately, not a reason to open the field.

Each defect entry carries its class and, where the class is conditional, the region it
applies to. Severity is **derived from the class**, in the caller, from the downstream-
dependence rule — not asserted by the judge. A judge that assigns its own severities will
rank by how bad things look, which is the wrong axis.

## The scale and the band

Use one integer scale, stated in the prompt, with the criteria attached to the numbers rather
than left to the model's sense of the word "good". A defensible default:

- **At or above 7 — pass.** Proceed to generation.
- **Below 5 — fail.** Refuse to generate. Return the defect list to the caller.
- **5 or 6 — the middle band.** Do not generate. **Prepare and re-gate.**

The band is deliberate and it is the most valuable region in the rubric. A single threshold
forces a false choice: set high and the gate rejects almost everything, which gets it
disabled within a week; set low and it passes everything, which is theatre. The band names
the real third outcome — this image is recoverable — and routes it to the preparation steps
rather than to a human's judgment call. Most middle-band inputs are one background removal or
one crop from a pass, which is exactly why they must not be allowed to leak through as
"good enough".

Two rules keep the band honest. **A middle-band input is never generated from directly**;
if the pipeline permits an override, the override is recorded on the artifact and shows up in
the report, because someone will eventually ask why an expensive mesh had a predictable
defect. And **a re-gate after preparation is a fresh judgment on the prepared image**, scored
from scratch — never the old score plus a bonus for having been worked on.

## Anchoring the scale

The numbers mean nothing without a basis, and the basis is not the current batch. Anchor each
level to what actually reconstructs into an asset of shipping quality: state, in the rubric
itself, what a 9 looks like and what a 5 looks like, as descriptions an examiner can check an
image against. Grading relative to the pile is the failure mode that makes a gate slowly
useless — as input quality drifts down, a curve-graded rubric drifts with it and keeps
reporting the same distribution.

Report the scale alongside every score. A bare 7 is not information; a 7 out of 10 against
the named criterion set is. If the score is re-based to fit a shared scorecard — a ten-point
rubric multiplied onto a hundred-point card is the common case — **re-base the thresholds in
the same breath**, and never let a report say "score 70" while the rule that produced it says
"pass at 7". A reader who compares the two numbers without their bases draws a wrong
conclusion silently.

## Three honest states, not two

A gate does not answer pass or fail. It answers one of three things, and conflating any two
of them is where gates start lying.

- **It ran** and produced a verdict on this exact image.
- **It could not run** — no credentials, transport failure, or a reply the parser could not
  read.
- **The caller opted out**, explicitly, by a stated flag — never inferred from a missing
  field.

The second and third are not passes. They are also **not failures**: a gate that measured
nothing has produced no condemnation, and inventing one from its own absence is as dishonest
as inventing a pass. What it does instead is stamp the artifact *submitted ungated*, and that
stamp rides with the artifact and appears in every report about it. Only a verdict the gate
actually produced may refuse a spend — write that as one pure, testable function, so the rule
"which states cost money" lives in exactly one place instead of being re-derived at each call
site.

An unparseable reply belongs in the second state, not the first. Retry once; on a second
failure the gate is unavailable, and if the pipeline proceeds anyway the image carries the
ungated stamp. Silently defaulting an unparseable reply to a pass is the most dangerous line
of code in the whole gate, and it is the line everybody writes first. A judge that cannot
hold the contract shape is a finding about the judge; the remedy is a different judge, not a
lenient parser.

## Where the verdict is enforced

The protocol is worthless if nothing calls it. The most convincing failure available here is
a gate that exists, is tested, and has **zero callers** while the paid path posts the raw
image straight past it — every claim in its documentation about credits saved is then false,
and nothing in the test suite says so. A gate is real at exactly one place: the line that
spends money.

So the enforcement point is the code path that dispatches the paid job. It calls the gate
before the provider, parses the verdict, and on a fail **returns an error instead of a job**.
Not a warning, not a log line, not a flag on a result that proceeds anyway. Where an override
is genuinely needed, it is an explicit named parameter on the request — never a default, never
a config value — and taking it stamps the artifact as overridden so the decision is visible
later, when someone asks why an expensive result had a predictable defect.

Two constraints follow from the laws. The judge is a **separate observer** from whatever
produced the image; a generator's own claim that its output makes a good input is recorded as
a self-report and never as the verdict. And the verdict is bound to the exact image it saw:
prepare the image, and the previous verdict is history, not a pass.

## When not to use this

- **Creative judgments** that genuinely need prose — art direction feedback, a critique that
  a human will read and act on. Forcing those into three fields destroys their value.
- **Exploratory calibration**, where you are still discovering the defect classes. Run open
  and read the language *once*, to build the vocabulary; then close it and never reopen it
  casually.
- **Anywhere a deterministic measurement exists.** If a property can be computed from the
  image directly — resolution, aspect, alpha coverage, edge sharpness — compute it. A vision
  judge is for the criteria that require seeing, and spending it on arithmetic adds latency,
  cost and variance for nothing.
