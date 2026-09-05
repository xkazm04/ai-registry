---
layer: technique
type: technique
subject: translation-quality-measurement
technique: deterministic-checks-before-estimates
status: forged
laws: [format-skeleton-is-inviolable, one-concept-one-rendering, identical-source-identical-target]
shared_with: []
use_when: [designing the check suite for a machine-translated store, deciding whether a defect class needs a model or a rule, a termbase exists and nothing verifies the store honours it, a reviewer's time is being spent on defects a script could have found, choosing what blocks a regeneration from publishing]
---

# Deterministic checks before estimates

A meaningful share of what breaks a translated product is not a matter of
judgment. It is checkable against a rule, with an unambiguous answer, over the
entire store, at negligible cost per unit. Those checks return **verdicts**;
the estimator returns a probability. Running the probability first — or
instead — is the most common way to spend a measurement budget and learn
nothing, because the cases a rule decides are also the cases an estimator is
worst at: they are local, mechanical, and often invisible to a model that was
trained to judge whether text reads like a good translation.

The ordering rule: **every defect class a rule can decide is decided by the
rule, and the estimator is pointed only at the residue.**

## The four decidable classes

- **Skeleton parity.** Every placeholder name, rich-tag name, syntax keyword
  and brace in the source appears in the target, unchanged. A rename or a
  translated keyword is a runtime failure that ships silently because the
  string still reads fine, and
  [the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
  makes it critical unconditionally. Position is deliberately not checked —
  moving a placeholder to where the target grammar wants it is required, and a
  check that enforces source order manufactures a defect out of correct work.
- **Termbase adherence.** For each concept with a settled rendering, the check
  is: the source term is present in this unit and the target's canonical
  rendering is absent from the target unit. That is the mechanical half of
  [one concept, one rendering](../../../_laws.md#one-concept-one-rendering) —
  and the law's own warning binds here: the signal is mechanical, the ruling is
  judgment. Most candidates are legitimate senses, inflected forms the matcher
  missed, or contexts where the term is not the term. This produces a review
  queue, never a rewrite.
- **Duplicate-source divergence.** Group units by identical source value and
  compare their targets;
  [identical source, identical target](../../../_laws.md#identical-source-identical-target)
  makes any divergence a defect, and the fix is usually mechanical — copy the
  better rendering to its twin. In a machine-translated store this class is
  larger than in a hand-translated one, because a non-deterministic engine will
  cheerfully produce two different translations of the same sentence.
- **Budget and convention.** Rendered length against the surface's budget,
  numeral and date form against the locale's convention, and the target's own
  typographic rules where a language subject states them as a checkable rule.

Everything else — is this the right word, does this read as translated, does
this sentence say what the source said — is the residue, and the residue is
what an estimator and a human are for.

## Termbase adherence is the strongest signal a derived store has

It deserves naming separately because it is the only quality dimension in this
whole subject that is measurable at corpus scale, without a reference, without
a model, and with a *decided answer behind it*. Every other instrument here
predicts what a human would have said; this one checks against what a human
already said, in the termbase, on the record.

That makes it the natural gate on a regeneration, and the natural first
measurement on a new engine: an engine that cannot be steered to a product's
settled renderings is disqualified for that product regardless of how it scores
elsewhere, because the defect it produces is not a quality shortfall but a
direct contradiction of a recorded decision. It also degrades gracefully in a
way estimators do not — a termbase with ten rows measures ten things correctly,
rather than measuring everything badly.

Its ceiling is exactly the termbase's size, which is the honest limitation:
this check knows nothing about concepts nobody has ruled on. Coverage of the
check is therefore coverage of the termbase, and stating one as the other is
the mistake to avoid.

## Where the deterministic layer stops

These checks assume the unit *was* translated and test constraints on it. They
say nothing about whether a value is machine output left in the source
language — a source-language string satisfies skeleton parity perfectly, may
satisfy the termbase trivially, and will pass every length budget. Proving
translatedness is a prior and separate question with its own instrument in the
topology subject, and a store can be entirely constraint-clean and entirely
untranslated.

The other stopping point is severity. A rule can say *a defect of class X
exists here*; only the typology and a human can say what it costs. Skeleton
breaks are the one exception, and only because the law rules them critical in
advance.

## When not to use it

- **As a gate before the check has been counted.** A termbase or convention
  rule enforced before anyone counted its occurrences in this catalog produces
  a wall of findings that whoever is unblocking the build resolves by
  suppressing them wholesale, and the check is dead thereafter. Count first,
  rule the residue, then gate.
- **On a signal whose false-positive rate is unknown.** A deterministic check
  is only cheap while its output is nearly all true. A stem matcher that fires
  on every inflected form of a common word costs more reviewer attention than
  the defects it finds.
- **Where the language subject says the rule has a direction-dependent
  reading.** A check that clears a string most confidently in the cases that
  language's craft says require a rendered pass is returning an affirmative
  *no finding* where it should be silent, which is worse than not running.
