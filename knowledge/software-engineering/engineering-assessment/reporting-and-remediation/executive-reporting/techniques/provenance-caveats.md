---
layer: technique
type: technique
subject: executive-reporting
technique: provenance-caveats
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [a report section covers only part of its population, a projection rests on thin or noisy input, deciding where a caveat belongs on the page]
---

# Provenance caveats

Between the aggregate and the reader sits a set of facts about *how the
aggregate came to exist* that the number itself cannot express: it covered
some of the population rather than all of it, it was computed from a source
last refreshed three days ago, it is a projection from a handful of
observations, or the section rendered a default because its real input was
unavailable. Each of these changes what a reasonable reader should conclude,
and none of them changes the digits. A caveat is the mechanism by which the
document says which kind of number this is.

The obligation is the document-layer face of
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success): a
report assembled over partial inputs and a report assembled over complete ones
must not render identically. If they do, the healthy edition and the broken
edition are indistinguishable to every reader, and the broken one is the more
persuasive of the two because nothing on it looks unusual.

## The four caveat kinds

**Coverage — partial versus total.** The most consequential and the most
often dropped. "Average review time: 4.2 hours" over a fifth of the population
is a different claim from the same sentence over all of it. Coverage is
expressed as a fraction of the named population, next to the value, and the
partial case is worded so the reader cannot mistake it for the total: not
"across the org" but "across the 12 of 61 units with sufficient data".

A trap specific to coverage caveats, and one that survives review because the
code reads sensibly: **a caveat keyed on a *mixture* goes silent at total
degradation.** A condition written as "some inputs were degraded" naturally
compiles to "degraded present AND healthy present" — and then the worst
possible period, the one where *every* input was degraded, is the single case
that produces no caveat at all. Key the caveat on the presence of degradation,
and let its wording escalate from "some" to "all". The same shape recurs
wherever a warning is defined by contrast rather than by presence.

**Staleness.** The as-of moment of the underlying source, distinct from the
document's generation time. These diverge constantly — a nightly ingest, a
paused connector, a source that rate-limited — and a report dated today over
data from last week is read as today's. Print the source's as-of, and print it
even when it is current, so its presence is not itself a signal.

**Noise.** A projection, extrapolation, or per-unit rate built on few
observations is marked as noisy at the point of display, in words rather than
in a confidence interval a stakeholder will not parse: "projected from 9
completed items; treat as directional". Whether a value is entitled to be
reported at all is the
[measurement-honesty](../../../measurement-method/measurement-honesty/measurement-honesty.md)
subject's call; this technique governs the wording once it is.

**Fallback.** A section that rendered template or default content because its
real input was missing must say so — *when the reader's interpretation depends
on it*. This is the one caveat with an exception, and the exception is
principled: see the asymmetry below.

## The asymmetry: data degradation is disclosed, presentation degradation is not

Two kinds of degradation, opposite rules.

**Data degradation is always disclosed.** Coverage, staleness, noise — these
change what the reader should believe, so hiding them corrupts the decision.

**Presentation degradation is deliberately invisible.** When the prose
generator is unavailable and the document renders deterministic template copy
in its place, the reader is shown a plainer sentence about the same facts.
Printing "narrative generation failed" in a stakeholder document buys the
reader nothing — both sentences are true, and the notice damages confidence in
numbers that are entirely sound. The test is one question: **does the reader's
conclusion depend on this?** If the answer is yes, it is a caveat. If it only
tells the reader something about your infrastructure, it is a log line and
belongs in the log. See
[grounded-narrative-generation](./grounded-narrative-generation.md) for why the
degraded path must be structurally indistinguishable rather than merely
similar.

## Procedure

1. **Attach provenance at fact-assembly time**, as fields on the fact:
   covered/total, source as-of, observation count, and whether the value is a
   projection. Provenance computed at render time is provenance guessed.
2. **Place the caveat adjacent to the number it qualifies**, in the same
   visual unit — a caveat block at the foot of the document does not survive a
   forwarded crop, and the crop is how the number will actually travel.
3. **Word it as a fact about the basis, not as a hedge.** "Based on 12 of 61
   units" is a caveat; "results may vary" is an apology and carries no
   information.
4. **Suppress rather than qualify below the floor.** A caveat is not a licence
   to print a number that should not be printed; when the basis is too thin,
   the reason line replaces the value
   ([denominator-naming](./denominator-naming.md)).
5. **Keep caveat presence stable.** Always printing the as-of, present or not,
   prevents readers from learning that a visible caveat means trouble and an
   absent one means fine — an inference they will otherwise make and be wrong
   about the first time a caveat is dropped in a refactor.

## Decision rules

- **When coverage is partial, name both numerator and denominator of the
  coverage itself**, not a percentage. "12 of 61" is checkable; "20% coverage"
  invites the reader to reconstruct the wrong population.
- **When a source is stale beyond its expected refresh interval, escalate from
  caveat to lead.** Past a threshold the staleness *is* the finding, and
  burying it beside a tile understates it.
- **When several caveats apply to one value, print the one that most changes
  the conclusion, and make the rest reachable.** A number wearing four
  parentheticals is read as noise and skipped entirely.
- **When a caveat would apply to every value in the document, hoist it to the
  header once.** Per-tile repetition of a universal condition trains readers to
  skip caveats.
- **When the document has a text serialization consumed without its chrome,
  the caveats must be inside the text, and they lead rather than trail.** A
  reader-agent, an export, or a pasted payload never sees the badges and
  tooltips the interactive surface renders around a number; a caveat that
  exists only as page chrome does not exist for those consumers, and they are
  the ones that act on the report unsupervised.

## When not to use it

- **Fully-covered, fresh, well-sampled values** need no per-value caveat
  beyond the document's standing header; over-caveating is a real failure mode
  that destroys the signal value of the caveats that matter.
- **Presentation-layer fallbacks** — see the asymmetry above.
- **Machine payloads** carry provenance as fields, not sentences; do not push
  prose caveats into a schema consumed by a program.

## Smells

- A footnote section at the bottom of the report that nobody has updated in
  four editions.
- Coverage expressed only as a percentage, or only in a tooltip.
- The document's own generation timestamp used as the data's as-of.
- A number that changed a lot between editions because coverage changed, with
  nothing on either edition saying so.
- Caveat text that hedges the conclusion ("approximately", "roughly") without
  naming a basis — hedging is not disclosure.
