---
layer: technique
type: technique
subject: executive-reporting
technique: bad-news-labelling
status: forged
laws: [deletion-is-not-repair, one-authority-per-vocabulary]
shared_with: []
use_when: [a period delta is negative and must still be printed, choosing headings for a report section, deciding whether a bad result may be omitted from a summary]
---

# Bad-news labelling

A stakeholder document has one irreversible failure: it makes a reader
confident about something false. The fastest route to it is not a wrong
number — it is a **correct number under the wrong heading**. A regression
printed beneath a heading that means "improvement" converts the reader's
correct arithmetic into a wrong belief, and does so with the document's full
authority. The reader is not being careless; they are trusting the structure,
which is what structure is for.

The technique's governing sentence: **a report may never become quieter by
hiding its own bad news; it may only stop mislabelling it.** Every fix in this
area is a heading change, a sign change, or a section change. None of them is
a filter.

## Direction-of-good is data, not narration

The root cause of mislabelled bad news is almost always the same: the code
that prints the heading knows the delta but not its polarity. Cycle time down
is good; defect count down is good; retention down is bad; cost down is good
unless it is spend against a committed budget. There is no way to infer this
from the number, and every attempt to infer it from the metric's *name* is a
heuristic that fails on the first metric someone renames.

So: **each metric carries its direction-of-good as a declared property, in one
place, and every surface that assigns a valence consults it** —
[one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary)
applied to the good/bad vocabulary. A second copy of the polarity table inside
the reporting layer is the mechanism by which a heading and a chart end up
disagreeing about the same delta.

The lesson is best learned the way it is usually learned: a reader opens a
briefing and finds a decline printed under a heading meaning value delivered,
and their verdict is not "the number is wrong" but *"that is the tool not
knowing which direction is good, and the sign is right there in the
variable."* The information needed to label correctly was present in the same
scope as the label. That is the shape of this defect every time.

## Procedure

1. **Declare polarity per metric** at the metric's definition, next to its
   unit and its window — never in the renderer.
2. **Compute a valence for each printed delta** from polarity plus sign, in
   the deterministic verdict stage, before any prose exists.
3. **Select the heading from the valence, not from the section's intent.** A
   section conceived as "wins" must be able to render as "regressions" when
   its contents are negative, or it must exclude negatives *and* the negatives
   must appear elsewhere in full.
4. **Print the bad number in full, with its basis** — same precision, same
   denominator discipline as good news
   ([denominator-naming](denominator-naming.md)). Rounding bad news harder
   than good news is a tell readers learn to detect.
5. **Never let a section's absence be able to mean "bad".** This is the rule
   the stability instinct is reaching for, stated so it survives contact with
   sparse data. A section that disappears *because its numbers were negative*
   is a filter and is forbidden. A section that is absent *because nothing of
   its kind was measured at all* is fine, and is better than a heading over a
   row of zeros: "never attempted" must not render as "attempted and nothing
   landed". The test is whether a reader could mistake the absence for a
   value. Where they could — a suppressed comparison, a withheld rank — print
   the reason instead of the number. Where they could not — a period in which
   no such activity exists — omit the section and let the document be short.
   A scaffold of empty headings is the failure at the other end, and it trains
   readers to skim past headings that matter.

## Decision rules

- **When a delta's valence is negative, change the heading, never the
  dataset.** Filtering is
  [deletion-is-not-repair](../../_laws.md#deletion-is-not-repair) applied to a
  document: it removes the artifact that exposes the problem at the exact
  place visibility existed.
- **When polarity is genuinely undefined for a metric** (a count that is
  neither good nor bad — volume, headcount, distribution), print it under a
  neutral heading and forbid any valence language about it. "Changed by" is a
  legitimate heading; inventing a direction is not.
- **When a metric's polarity depends on context** (spend is good against a
  target, bad against a budget), that is two metrics, not one metric with a
  conditional. Split it; a conditional polarity will be evaluated by the
  wrong branch eventually.
- **When sections imply mutual exclusion — strengths and risks, wins and
  concerns — enforce disjointness mechanically.** An item in both reads as an
  assembly bug and discredits both sections. The mechanism that works: take
  the positive section from the top of the ranked list, capped at **the lesser
  of the display maximum and half the population rounded up**, then draw the
  negative section from the remaining pool only. On a rich population this is
  identical to naive top-N and bottom-N; on a sparse one it is the difference
  between an obviously weak item being listed as a strength and it landing
  where it belongs. A section rendering two items is fine; a section padded to
  three by double-listing is not.
- **When the whole period is bad, the document still leads with the number.**
  A summary that opens with process narration and buries the decline in
  paragraph four has filtered by ordering, which is the same failure with
  better manners.

## When not to use it

- **Internal debugging views and raw query surfaces** need no valence at all;
  labelling is a document obligation, not a data obligation. Adding polarity
  to an exploratory tool invites arguing with it.
- **Alerting** already owns urgency semantics; do not re-derive severity here.
  A report describes a period, an alert interrupts one.
- **Metrics under active definition change** should not be given a polarity by
  guess to satisfy the schema. Mark them undefined and print them neutrally
  until someone decides — a guessed polarity is worse than none, because it
  will be trusted.

## Smells

- A heading string is a literal in the renderer while the sign of the value it
  labels is computed three lines above.
- A "highlights" section that is empty in exactly the periods that were bad.
- A section whose item count is a layout constant rather than a function of
  how many items the population honestly supplies.
- Bad numbers shown as ranges or qualitative words while good numbers show two
  decimals.
- The same item appearing under both a positive and a negative section in one
  edition.
- A stakeholder asking "was that good?" about a printed delta — the label
  failed, whatever the number was.
