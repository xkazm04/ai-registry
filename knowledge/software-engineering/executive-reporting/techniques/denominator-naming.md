---
layer: technique
type: technique
subject: executive-reporting
technique: denominator-naming
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [printing a rate or percentage in a stakeholder document, a period comparison rests on very few units, deciding whether a comparison is quotable at all]
---

# Denominator naming

The recurring failure of the stakeholder-document genre is not a wrong number.
It is a **right number with an unnamed basis**: "up 14%", "62% adoption",
"average score 71". Each is arithmetically correct and each is received as a
claim about a population the reader invents. The technique is one obligation
applied to every derived figure that appears in a document that will be
forwarded: the figure travels with what was counted, over what window, across
how many units — [count-carries-predicate](../../_laws.md#count-carries-predicate)
applied to prose rather than to a wire format.

This is cheap to state and consistently skipped, for a structural reason worth
naming: the assembler *has* the denominator. It just divided by it. The
denominator is dropped at the formatting step, one line after it was known, by
code whose author could see the whole context and could not imagine the
reader who cannot.

## Procedure

For every rate, percentage, average, delta, or comparison that reaches the
page:

1. **Carry the basis alongside the value** from the moment it is computed —
   the count of units, the window, and any filter that narrowed the
   population. Not as a formatted string; as fields, so the decision in step 3
   can be made mechanically.
2. **Render the basis with the value, in the same visual unit.** A footnote at
   the bottom of the document is not naming the denominator, because the
   forwarded screenshot is of the tile, not the page. "+14% (17 of 22 units,
   last 30 days)" survives the crop; "+14%" with an asterisk does not.
3. **Apply a quotability floor.** Below a declared minimum basis, the
   comparison is not printed as a number at all — see below. The floor is a
   property of the metric, declared once, not a judgment made per report.
4. **Name the window explicitly, including its edges, and freeze it at
   assembly time.** "Last 30 days" is ambiguous about whether today counts,
   and worse, it is *relative*: any consumer that re-resolves the label
   against its own clock produces a different window and therefore different
   numbers under the same heading. Resolve to absolute instants once, print
   them, and carry them wherever the document travels.

## The suppressed comparison says why

The hard half of this technique is what to do when the basis is too thin. The
naive options are both wrong. Quoting the number anyway ("up 200%, n=3")
launders three data points into a trend, and the parenthetical does not
protect the reader — it is read as precision, not as a warning. Silently
dropping the section is worse: absence becomes ambiguous across editions, and
a reader who noticed the comparison last month reads its disappearance as bad
news, or as nothing, unpredictably.

The rule: **a suppressed comparison prints its reason in place of the
number.** "No period comparison: 3 units in the prior window, below the
minimum of 10." This is not a smaller statement than the percentage — it is
usually a *more* useful one, because it tells the reader something true about
the population that the percentage would have concealed. It also keeps the
document's shape stable across editions, so absence never has to be
interpreted.

Sample floors, noise bands, and the epistemics of when a single number is
entitled to be reported at all belong to the
[measurement-honesty](../../measurement-honesty/measurement-honesty.md)
subject; this technique consumes those verdicts and governs how they are
*worded on the page*. If that subject says a value is unmeasurable, this
technique forbids the document from rendering it as zero, blank, or omitted
without a reason line.

## Decision rules

- **When a figure is derived, print its basis inline; when the basis would not
  fit, the figure does not fit either.** Layout pressure is not a reason to
  drop a denominator — it is a reason to drop the tile.
- **When the prior-period population is below the metric's declared floor,
  suppress the comparison and print the reason with the actual count.** Never
  quote an inadequate basis with a hedge.
- **When two figures in one document use different populations, say so at each
  of them.** The most damaging denominator errors are comparisons between two
  correctly-computed numbers over different sets; a reader will subtract them
  because they are adjacent. The sharpest case is a **subset presented beside
  its superset**: a fleet-wide average printed next to a movement count taken
  only over the units that had a comparable prior measurement. Neither number
  is wrong and the page appears to contradict itself, because only one of them
  stated its scope. The reader does not need the term for the narrower
  population — they need the document not to contradict itself, which means
  the narrower figure names its subset in the same line.
- **When the population changed between editions, disclose the change, not
  just the new value.** A metric that improved because low scorers left the
  population has not improved; the delta is a composition artifact and the
  document must be able to say so.
- **When a percentage rests on fewer than a handful of units, prefer the raw
  counts.** "4 of 6" is honest at a glance in a way "67%" is not.

## When not to use it

- **Absolute counts over the whole named population** need no separate
  denominator sentence when the document's header already names the population
  and window — repeating it per tile becomes noise, and noise gets stripped by
  the next person editing the template. Name it once, prominently, and only
  restate it where a tile narrows the population.
- **Interactive surfaces where the definition is one click away** may be
  terser; the obligation scales with the distance to the source. It returns in
  full the moment the surface is exportable.
- **Machine-consumed payloads** carry the basis as fields rather than prose;
  that is [structured-output](../../structured-output/structured-output.md)'s
  contract, not this one. Do not embed explanatory sentences in a schema to
  satisfy this technique.

## Smells

- A report template with a percentage placeholder and no basis placeholder —
  the omission is designed in.
- Comparison sections that vanish in some editions and appear in others with
  no reason line.
- Two tiles whose numbers a reader would naturally subtract, computed over
  different populations, with nothing on the page saying so.
- A "top movers" list where the largest movements are all from the smallest
  populations — the ranking is measuring sample size.
