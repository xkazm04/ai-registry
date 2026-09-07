---
layer: application
type: application
subject: measurement-honesty
technique: control-failure-is-not-a-datum-state
stack: process
verified_on: 2026-09-06
---

# Control failure — a winner's benchmark that publishes the axis it could not compare

*Verified against the source tree at commit `fdb58c0d` on 2026-09-06: the
benchmark document is committed in the repository's `docs/`, and every
statement below is quoted from it. The tree's crate version is 0.24.3; the
document measures 0.16.3, so it is dated relative to its own repository —
see the currency note at the end.*

A competitive benchmark published by the party that wins it is the adverse
case for this technique: the incentive to drop an unflattering or
uninterpretable axis is maximal, and the resulting document is
byte-identical to an honest one. This tree's benchmark is the positive
instance, and it is worth reading because it does all three parts.

## The axis, the failed control, and no number

The document collected CPU samples and does not publish them. What it
publishes instead is exactly the three-part disclosure:

- **The axis was in scope and was collected** — stated in its own short
  paragraph, not omitted and not buried in a limitations list.
- **The control that failed, concretely** — the live event rate changed
  during the samples, so the two arms were not doing comparable work. This
  is a confound in the design, named as a condition that did not hold
  across the arms. It is not "the data was inconclusive".
- **No number** — no raw values with a caveat, no direction in words. The
  paragraph ends by saying the document does not include the data.

The classification test resolves the same way. The instrument saw CPU
perfectly, so *unmeasurable* would have been the laundering the gate exists
to prevent; nothing errored, so it is not a *failed measurement*; nothing
published refutes it; neither program was exposed to the instrument in
advance. Four states, four wrong homes, and the document files it under
none of them — it invents the right one in prose.

## The two refusals are worded differently, in the same table

The technique's hardest ask is that a control failure and a noise-band
refusal not be phrased alike, and this document is the rare artifact that
demonstrates both, three lines apart.

It measures its own harness first: one screen-capture operation costs a
median 6.26 ms, and the observed input-to-screen floor is near 12 ms —
"results near this floor do not show a useful product difference." The row
movement measurement then comes in at 12.42 ms against the competitor's
12.77 ms, and the document **declines its own win**: the result column
reads "The result was at the harness floor", not a percentage. That is the
band refusal, and the publisher forfeits a favourable number to it.

The CPU axis is worded as an experiment that did not happen. A reader can
tell from the language alone that one of these should be re-run with a
better harness and the other should not, which is the whole point of
keeping the two refusals distinct.

## What surrounds it, and why that matters to the classification

The disclosure is credible here because it is not isolated. The document
publishes an eleven-item list of axes it did not measure at all; it
publishes per-trial raw data including a run where the winner was four
times slower than its own median; it declares an asymmetric confound it
chose not to normalize away (one program's timings include an installed
shell launcher, the other's do not) together with the reason for keeping
it; and it states that its pod population moved during the run. The
selection inference the technique warns about is what the reader would
otherwise draw, and these are the artifacts that block it.

## What this realization cannot show

This is a process artifact, not an instrument: nothing in the tree
*enforces* any of it. There is no gate that fails a benchmark document for
omitting a collected axis, no schema for the disclosure, and no test that
a published comparison names its harness floor — the discipline lives
entirely in one document's prose and would not survive an author change.
A stack that judges rather than measures cannot demonstrate the technique's
enforceability, only its shape. The corpus has no instrument for this
either, which is the honest reading of why this application is a document
review rather than a check.

**Currency.** The benchmark measures version 0.16.3 while the tree it ships
in is 0.24.3, and it names no re-measurement condition. Its own "recommended
next tests" section asks for a fixed event replay that would fix the CPU
control — the return condition for this axis is that harness existing, and
nothing in the document says who owns it.
