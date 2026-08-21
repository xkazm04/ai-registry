---
layer: technique
type: technique
subject: honest-measurement-presentation
technique: headline-may-not-outrun-its-qualifier
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
shared_with: []
use_when: [writing a summary sentence over a chart, a big-number tile with a caption, an insight card with a footnote, a suppressed figure appearing elsewhere on the page]
---

# The headline may not outrun its qualifier

Measurement surfaces summarize, and summaries are read unevenly. The big
number, the bold sentence and the insight title are read; the caption, the
footnote and the tooltip are read sometimes, by some readers, when something
already looks odd. A qualifier therefore cannot repair a headline — it can
only explain one that was already true.

"Offer acceptance collapsed this quarter" over a footnote reading "based on 3
offers" is not a hedged claim. It is a false claim with a true note attached,
and every reader who acts on the page acts on the false half. The technique is
the discipline of **writing the headline at the strength the weakest input
supports**, so that the qualifier's job is to explain the basis rather than to
retract the sentence above it.

## The procedure

**1. Determine the claim strength before writing the claim.** The inputs are
the sample behind the figure, the maturity of the window, whether a comparison
exists, and whether a goal exists. Each of those can only lower the strength.
The strongest sentence available is the one the weakest input allows.

**2. Map strength to sentence shape.** Four rungs, and the surface should be
able to say which rung it is on:

- **Verdict** — "screen-to-interview is below the 40% target." Requires a
  measured figure, an adequate sample, a mature window and a goal somebody set.
- **Trend** — "screen-to-interview has fallen for three periods." Requires an
  adequate sample and a comparable prior; no goal needed, and no valence.
- **Observation** — "screen-to-interview converted 31% of 96 candidates."
  Requires only a measured figure and its base.
- **Count** — "3 offers this period; too few to read a rate." The honest
  bottom rung, and usually more actionable than the trend somebody wanted.

Never render a sentence from a rung above the one the inputs allow. Rendering
one from a rung below is always permitted and is the safe direction.

**3. State the base inside the headline, not under it.** "31% of 96
candidates" is one sentence carrying its own basis
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
Splitting it into a bold "31%" and a small "n=96" puts the load-bearing half
in the half that does not get read.

**4. When the answer is a refusal, the refusal *is* the headline.** This is the
strongest form of the technique and the one teams resist hardest, because a
panel whose lead story is "not enough outcomes yet to draw this" looks like a
broken panel. It is not: a curve fitted through a handful of points projects a
confidence the data does not have, and the reader cannot see the handful. So
the under-data verdict occupies the headline position, in the same typographic
weight a real finding would get, and the accrual horizon — how much more is
needed, and by when — goes beside it. Demoting the refusal to a caveat under a
drawn curve is the exact failure this rung system exists to prevent.

**5. Make the qualifier explanatory, never contradictory.** A caption should
answer "what is this computed over" and "why is it phrased this cautiously".
The moment a caption's job is to take back what the headline said, the
headline is wrong and the caption is a fig leaf.

**6. Let a suppression propagate across the whole page.** When the claim-side
discipline rules a figure too thin to support a rate, the rate is suppressed
everywhere on that surface — the tile, the chart label, the narrative
sentence, the export and any generated digest. The commonest way a suppression
is defeated is not an override but a second component computing the same thing
without asking. One resolved claim object per metric, consumed by every
element, is what prevents it.

**7. Where a sentence is generated rather than written, constrain the
generator.** A summary produced by a language model must receive the claim
strength as an input and be forbidden the vocabulary of higher rungs; it must
also be forbidden to reach for a cause. "Because the interview panel was
short-staffed" is a claim about the world that no metric measured — say only
what the record holds
([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
Validate the output against the closed vocabulary rather than trusting the
instruction.

## Words that carry a rung

Some words assert more than they look like they do, and they are the ones that
smuggle a headline up a rung:

- *Sharply, collapsed, surged, plummeted* — assert magnitude relative to
  normal variation, which requires knowing normal variation.
- *Bottleneck, weakest, underperforming, problem* — assert a verdict, which
  requires a goal.
- *Because, driven by, caused by* — assert causation, which a funnel never
  measures.
- *Trend, trending, consistently* — assert more than two comparable points.
- *Improving, worsening* — assert a valence on a direction.

A surface that keeps a list like this and checks its generated copy against it
catches most rung inflation before it ships.

## Decision rules

- **When the sample is adequate but the window is immature**, the honest rung
  is observation with the maturity stated: a cohort that has not finished
  happening cannot support a trend, and its rate will move on its own.
- **When two metrics on the same card have different strengths**, the card's
  headline takes the weaker. A card is read as one claim.
- **When a reader hovers or drills in**, more may be said — the drill-in is
  where the fuller qualifier lives. It never licenses a stronger headline on
  the surface above it.
- **When there is nothing strong enough to headline**, say what was counted.
  An empty insight slot is better than a manufactured insight, and a count is
  never empty.

## When not to use this

- **In a raw data export or an analyst's query result**, where the consumer is
  computing their own claims and the prose layer does not exist. Keep the base
  columns; drop the rung machinery.
- **Where the headline is a label rather than a claim** — a section title, a
  metric name, an axis label. These assert nothing and need no rung.
- **Where the sibling small-sample discipline has already suppressed the
  figure entirely.** Then there is no headline to calibrate; the obligation
  here is only to ensure nothing else on the page re-asserts what was
  suppressed.
