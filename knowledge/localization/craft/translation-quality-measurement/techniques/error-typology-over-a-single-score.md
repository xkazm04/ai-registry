---
layer: technique
type: technique
subject: translation-quality-measurement
technique: error-typology-over-a-single-score
status: forged
laws: [every-finding-cites-an-anchor, format-skeleton-is-inviolable]
shared_with: []
use_when: [designing what a reviewer records when they find a translation defect, a quality dashboard shows one number per locale and nobody can act on it, deciding whether a defect blocks a release or joins a backlog, comparing two engines that score the same overall, routing findings to the person who can fix them]
---

# An error typology over a single score

One number per segment, or per locale, answers the wrong question. It answers
*how bad*, when the actionable question is *bad how* — because the two dominant
defect classes have opposite remediations, opposite owners, and opposite
release consequences, and an average is exactly the operation that destroys the
distinction.

A **mistranslation** is an accuracy failure: the target says something the
source did not. The fix is a retranslation of that unit, the owner is whoever
can translate, and shipping it puts a false statement in the product. An
**awkward register** is a fluency or style failure: the target says the right
thing in the wrong voice. The fix is a rewrite against a style rule, the owner
is whoever holds the style authority, and shipping it costs polish. Summed into
one score they are the same magnitude of unhappiness — and because fluency
defects are far more numerous, a store optimized against that score will trade
accuracy away to buy smoothness. Fluent mistranslation is the end state, and it
is the hardest defect class to catch downstream precisely because it reads
well.

## The two axes, and what they are for

A finding carries a **category** and a **severity**, recorded independently.

The categories are the top level of a published multidimensional error
typology: accuracy (mistranslation, omission, addition, untranslated),
fluency and linguistic convention (grammar, agreement, spelling, punctuation),
terminology, style, locale convention (number, date, address, currency form),
and a non-translation class for output that failed entirely. Use the published
top level rather than inventing one, because the value of a typology is
comparability across locales, waves and reviewers, and a per-project category
set forfeits it on day one.

Severity is impact on the reader, not size of the edit: **minor** distracts,
**major** misleads or blocks, **critical** breaks the product or carries legal
or safety consequence. The widely used analytic model weights the three at 1,
5 and 25 when a total is needed, and the steepness is the point — no volume of
minor defects can outvote one critical defect. A gentler weighting reintroduces
the averaging the typology exists to prevent.

Two severity rulings are made in advance rather than per finding. A skeleton
break is **critical unconditionally**, because
[the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
and the failure is a runtime failure that no reviewer will catch by reading. A
defect on a surface with legal, financial or safety consequence is at least
major regardless of category, because severity is about the reader's exposure
and the surface sets that.

## The categories are slots; the languages fill them

A typology with no language-specific content behind its categories is a form
that turns taste into a checkbox. What *is* a register defect, what *is* an
awkward construction, what *is* the wrong counter or the wrong plural category
is decided by the language subjects and recorded there as rules with
identifiers — which is what makes the finding citable at all.
[Every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor):
the category names the shelf, the anchor names the rule, and a finding with a
category and no anchor is the same unactionable "this feels translated" as
before, with better filing.

The productive move when a real defect has no anchor is unchanged by the
typology: mint the anchor in the language subject or the product's own rule
artifact, then file the finding against it. A typology accelerates this,
because the category tells you which artifact should have held the rule.

## What the typed record buys

- **Routing.** Accuracy findings go to translation; terminology findings go to
  the termbase owner; locale-convention findings usually go to the source or
  the formatting layer, not to a translator at all.
- **A release rule that is not a threshold.** Ship on *zero critical, no major
  on a consequential surface, minor within budget* rather than on a composite
  crossing a line. A composite lets a hundred minors mask the one critical; a
  categorical rule cannot.
- **Engine comparison that survives a tie.** Two engines with the same overall
  score are routinely not equivalent: one distributes its defects across
  fluency, the other concentrates them in accuracy. The typed profile is the
  only view in which that difference is visible, and it is usually the
  deciding one.
- **A defect distribution that points at its own cause.** A locale whose
  findings are overwhelmingly terminology has a termbase problem, not a
  translation problem, and re-translating it will not help.

## When not to use it

- **On a store nobody will review.** A typology is a recording format for human
  and rule-based findings. It cannot be applied by an estimator that produces
  only a number, and pretending otherwise — mapping score bands onto severity
  levels — manufactures a typed record with no observation behind it.
- **For the routing decision itself.** Which segments a reviewer opens is the
  estimator's and the deterministic layer's job; the typology begins once the
  segment is open.
- **As arithmetic.** How weighted sub-scores combine into a single reportable
  figure is a scoring-rubric concern and is not settled here. The typology's
  claim is that the categories must survive into the decision; how a composite
  is computed, if one is needed at all, is somebody else's standard.
- **With a bespoke category set.** A locally invented taxonomy is not
  comparable to the next wave's, the next locale's, or any external benchmark,
  and the comparability was the reason to type findings in the first place.
