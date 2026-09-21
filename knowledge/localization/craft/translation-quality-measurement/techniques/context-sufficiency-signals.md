---
layer: technique
type: technique
subject: translation-quality-measurement
technique: context-sufficiency-signals
status: forged
laws: [the-source-locale-is-the-source-of-truth, every-finding-cites-an-anchor]
shared_with: []
use_when: [translated units keep failing review and the source text may be the cause, deciding which source strings need a context note before translation, two models produce different translations of the same unit, building a review pass that can report defects in the source]
---

# Context-sufficiency signals

Every other instrument in this subject asks whether a translation is right. This
one asks the question upstream of it: **was the input enough to get it right?** A
short label with no context note, a word with two senses, a fragment that is not
a sentence, a placeholder whose type nobody stated — each caps quality for every
locale at once, and measuring the output never finds the cause, because the
output is a reasonable reading of an input that allowed several.

## Two shipped designs that converge

**Disagreement as the signal.** Translate one unit with several independent
models. Where they agree, the source is probably well specified; where they
diverge, the source is usually ambiguous — the models settled an open question
differently because the input left it open. One platform ships this as a
component of its published quality index (vendor-stated; neither its weighting
nor its accuracy is published).

**Ask the model about the input.** A review pass whose question is not "is this
translation good?" but "could a competent translator succeed with this source and
this context?" — and whose output is a defect on the *source*, not on any
translation (a vendor-stated feature, with no measured accuracy published).

The designs meet in one place: the finding belongs to the source.

## The cheap implementation

Two models, one unit, compare.

1. Pick two models of **different lineage**. Two samples from one model measure
   its sampling randomness, not the source's ambiguity, and two models trained on
   the same data share their guesses. (Design reasoning, not a measured result.)
2. Translate each unit with both, deterministically, and with the same context the
   production engine receives — the signal is about the context actually
   delivered, not the context that exists somewhere.
3. Normalise before comparing: mask placeholders and markup, fold whitespace and
   punctuation, so a divergence is about words rather than formatting.
4. Flag units that diverge past a threshold, and for each, name the suspected
   missing input: a context note, a sense, a sentence frame, a placeholder type.

No threshold has a published calibration. Set the first one where the flag
volume fits the source owner's capacity to answer — the way a review floor is set
from budget — and record that it was chosen that way.

## The discipline

- **A divergence finding is a source defect, and it goes to the source owner.**
  [The source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth):
  the fix is a context note, a split key or a stated placeholder type, written
  once and inherited by every locale. Resolving it inside one locale hides it
  while the others keep paying.
- **It is never a reason to pick one of the two translations.** The renderings are
  evidence that the input was open, not candidates. Choosing the better one
  settles the ambiguity by taste in one language and leaves it open in all the
  others.
- **The divergence is the signal; the named missing input is the finding.**
  [Every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor):
  "the models disagreed" is not actionable, while "nothing says whether this label
  is a verb or a noun" is.
- **Divergence in one target language still usually names a source gap.** It
  often marks a distinction the target grammar forces and the source leaves
  unmarked — the addressee's gender, formality, a count — and the context note
  that settles it serves every language that forces the same choice.
- **It is a triage signal, not a verdict.** Nobody has published a measured
  precision for either design. Until one is measured on your own catalog, a flag
  is a question put to the source owner, and the share of flags the owner confirms
  is the precision estimate worth keeping.

A deterministic cousin exists and runs first: a source string whose translations
fail checks in two or more languages is a source defect decidable without any
model (see the copy-quality-gates subject,
`source-defects-from-cross-language-agreement`). As
[deterministic-checks-before-estimates](./deterministic-checks-before-estimates.md)
orders every lane, the two-model comparison is pointed at what that leaves.

## When not to use it

- **On units whose divergence is the point.** Transcreated marketing lines,
  slogans and wordplay are meant to be rendered freely; two models disagreeing
  there is the brief working, not a defect.
- **On a class a rule already decides.** A missing plural branch or a placeholder
  parity failure is a verdict from a check, not a disagreement to interpret.
- **As a quality score for either model.** Agreement is not correctness — two
  models can agree on the same mistranslation of a clear source — and this
  technique makes no claim about the output at all.
