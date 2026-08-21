---
layer: technique
type: technique
subject: content-research-grounding
technique: evidence-grading-ladder
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
use_when: [recording a claim into the research asset, deciding whether a fact can bear the argument's weight, auditing sourcing quality before render]
---

# Evidence grading ladder

A claim without a grade is not a claim, it is a preference. The ladder makes
every recorded statement answer two separate questions — *what kind of
evidence stands behind this?* and *how confident are we?* — and keeps the
answers visible all the way to the render, where the grade caps what may be
drawn or narrated from the fact.

## The two ladders, kept apart

**Evidence class** describes the *source's relationship to the event*:

- **primary** — the record itself: the filing, the statute, the ledger
  entry, the disclosure.
- **secondary** — reporting on the record.
- **aggregator** — a compiler of others' reporting.
- **vendor** — a third-party research shop *selling the conclusion*.
- **self-published** — the claimant's own channel.
- **protected** — true, verified by the researcher, and not citable by the
  reader. A real category; a ladder without it forces researchers to either
  drop verified material or launder it into a citable class.

Every source also carries a **locator** — the page, line, article, hash, or
timestamp that makes it findable. A source a reader cannot navigate to is a
name, not a source.

**Confidence** (high / medium / low, always with the reason) is a separate
judgment about how likely the claim is true. The load-bearing distinction:
**interested is not low-confidence.** A regulation's own reference figure, an
income disclosure, a short-seller's arithmetic are all interested parties'
numbers and all authoritative — record the interest as a flag on the source,
not as a confidence demotion. Vendor research defaults to low confidence not
because it is interested but because its business is the conclusion.

An analogous ladder governs *how a claim was established* in a craft
knowledge base: measured (counted, with the script and the sample size),
observed (a specific cited moment, quoted), inferred (reasoning across
observations, which are named), assumed (unchecked, with an open question
naming what would settle it). The invariant shared by both ladders: **the
sample size is always visible.** Two sources is two sources; a pattern seen
twice is a hypothesis and says so. And sources are quoted, never paraphrased
into authority — a reader who disagrees must be able to go look.

## Grading rules

1. **Sources are plural, always.** A comma-joined string of publication
   names is one source-shaped blob that nothing can count, class, or locate.
   One structured entry per source, each with its own class and locator.
2. **Load-bearing is its own axis.** Mark whether the argument collapses
   without the fact. A load-bearing fact at low confidence is the single
   most dangerous object in the asset and must be flagged for a second
   source before any render leans on it.
3. **Load-bearing quantitative claims reach a primary source or carry a
   named gap.** The recurrence to design against: a post-run note demanded
   primary sourcing, was never adopted because no field consumed it, and the
   next run shipped all-aggregator sourcing again. The rule lives as a
   checkable field-level requirement or it does not live.
4. **Three dates, never one.** *As-of* (when the researcher last checked —
   drives staleness), *event date* (when the thing happened), *period* (the
   window a quantity covers). Collapsing them into one field is how a
   30-day figure gets compared to a 60-day one under the phrase "the same
   window".
5. **Kind is graded too.** Found, derived, absence, utterance, plan — each
   with its own required baggage: a derived fact names its inputs and
   method; an absence names its search scope and date; an utterance renders
   as attribution; a plan renders as announced-not-built.

## What the grade buys downstream

The grade is the render's ceiling, per the bundle's law that output never
outruns evidence: a low-confidence figure cannot anchor the thesis; a
vendor number surfaces as a direction or not at all; an inferred pattern is
narrated as reasoning, not as fact; an assumed claim does not reach the
screen. Provenance also surfaces at human triage — a reviewer deciding what
to cut sees each card's class chip, so cutting decisions are made against
evidence quality rather than rhetorical appeal.

## When not to use it

Do not grade what will never be claimed — stylistic choices, framing notes,
production metadata. Grading is for statements with a truth value. And do
not let the ladder become false precision: a fact graded high on the word of
one secondary source is mis-graded, however confident the researcher feels —
confidence entries carry their reason precisely so that "felt sure" is
distinguishable from "checked twice".
