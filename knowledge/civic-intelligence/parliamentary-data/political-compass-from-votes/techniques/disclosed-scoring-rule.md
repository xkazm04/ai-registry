---
layer: technique
type: technique
subject: political-compass-from-votes
technique: disclosed-scoring-rule
status: forged
laws: [deterministic-code-owns-numbers, one-definition-one-import, provenance-or-nothing]
shared_with: []
use_when: [publishing a match formula alongside its results, wiring scoring copy to scoring code, adding reader-side re-weighting without contaminating the official number]
---

# Disclosed scoring rule

The scoring rule is where the designer's judgment concentrates after every
other surface has been mechanized. The methodology literature's central result
makes it non-optional to disclose: with identical inputs, different reasonable
scoring models hand a majority of users *different* top matches. Real recorded
ballots do not neutralize this — they only relocate it. So the rule is treated
as part of the published output: **the formula, its floors, its tie-breaks,
and its live parameter values render verbatim on the result surface**, so a
reader can disagree with the method instead of the data.

## What "disclosed" concretely requires

- **The whole cascade, not the headline.** "Alignment = matches ÷ comparable"
  is the easy sentence. The rule also owns: what counts as comparable (the
  abstention buckets), the ranking floor, the minimum-answers floor, rounding
  precision, and the complete tie-break order. Every one of these changes who
  appears above whom; every one is part of the rule.
- **Meaningless tie-breaks say so.** The final stability tie-break (a name
  collation, an identifier) exists so the same inputs always yield the same
  order — and readers will read meaning into adjacency unless the rule
  explicitly denies it. Print the denial.
- **Live values, not prose copies.** The rendered rule interpolates the
  actual constants and thresholds from the code that computes with them.
- **The rejection accounting.** A rule with floors owes the counts of what
  each floor rejected; a disclosed formula over an undisclosed candidate pool
  is half a disclosure.

## One definition, two consumers

The recurring corruption is drift between the rule as *computed* and the rule
as *stated*. It arrives innocently: the formula's constants get restated as
literals in the explainer copy, in a share image, in a second page — then a
threshold is tuned, and the tool now publishes a methodology it no longer
uses. In this domain that is not a typo; it is the instrument lying about
itself on the surface whose entire claim is checkability.

The structural fix: the rule lives in **one pure module** — constants,
formula, ordering — and *every* consumer imports from it: the scoring path,
the rendered methodology text, any share artifact. A restated literal is a
future lie; the discipline is one definition, imported everywhere. Purity is
what makes the promise testable: a function from (questions, ballots, answers)
to (scores, ranks) with no clock, no locale surprises, no hidden state,
covered by fixture tests that pin the semantics — an abstention scoring as
nothing, a tie producing no group line, the floor flipping rankability at
exactly ⌈answered/2⌉. Determinism is also a privacy dividend: the citizen's
answers can stay on their device, because the published rule and data are all
the computation needs.

## Reader re-weighting: a second artifact, never a blend

Letting the citizen re-weight the result is legitimate — under a boundary that
must be absolute. The authoritative score is computed by the published rule;
the reader's lens is a *recomputation* under the reader's stated parameters.
The two never mix:

- At published defaults, the lens does not run — the surface shows the
  official numbers, byte-identical to every other reader's.
- The moment any parameter differs, **everything** on the surface — scores,
  ranks, summaries, distributions — comes from the recomputation and is
  labeled as the reader's own. A page showing official ranks beside
  lens-adjusted scores is asserting a hybrid methodology nobody published.
- A lens arriving from outside (a shared link) is validated against the
  parameter grammar and **rejected if malformed — never repaired** to the
  nearest valid weighting. A repaired lens attributes a methodology to an
  author who never chose it; the link *is* a claim about method, so it
  carries the method verbatim or it carries nothing.
- Preset lenses are labeled as editorial examples and attributed to no real
  organization — inventing "how group X would weigh it" fabricates an
  authority's position, the exact sin the record-based design exists to
  avoid.

## When not to use this

There is no compass context where an undisclosed rule is acceptable — the
technique's "when not" is about scope. Do not stretch disclosure into
justification theater: the rule states what is computed and why each floor
exists, not a literature review. And do not let disclosure substitute for
restraint — a dubious scoring choice does not become sound by being printed;
it becomes checkable, which is the point, and checkable includes *found
wanting*.
