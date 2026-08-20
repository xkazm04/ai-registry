---
layer: technique
type: technique
subject: measurement-honesty
technique: renormalize-over-present
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [averaging values where some inputs are absent, a detector was removed or went dark, aggregating a nullable measure across many subjects]
---

# Renormalize over what was present

Some of the inputs are missing. The arithmetic still runs. The question is what
the denominator was, and the honest answer is **the set actually observed** —
not the set intended.

The move is mechanical: drop absent contributions from both the numerator and
the denominator, divide by the weight (or count) actually present, and carry
the observed fraction beside the result. The output changes meaning from
"quality of this subject" to "quality over what we could see", which is the
only claim the evidence ever supported.

## Why the alternatives all fabricate

Every non-renormalizing handling of an absent input invents evidence:

- **Impute zero** — absence is punished as failure. The subject with the worst
  *visibility* becomes the subject with the worst *score*, and the verdict is
  actionable, so things downstream demote it on the strength of nothing.
- **Impute the ceiling** (common when a measure is a penalty deducted from a
  maximum) — a source delivering no bad news scores identically to one
  delivering good news. The report says "fine" precisely when its instruments
  go silent.
- **Impute the mean or a neutral midpoint** — fabricates conformity, and biases
  every partially observed subject toward indistinguishability, which is the
  worst possible outcome for a number whose job is to discriminate.
- **Let the type's default through** — the same as imputing zero, but
  accidental, and therefore not written down anywhere.

All four produce a well-formed number, so nothing crashes and nothing warns.
This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
in arithmetic form.

## Procedure

1. **Preserve absence at every hop.** Absence must survive collection, storage,
   transport, and aggregation without being coerced. The classic laundering
   points are a storage layer that defaults null to zero, a serialization step
   that drops the field, and a "defensive" fallback at the read site. Every
   coercion is a destroyed fact; the fix is a type that cannot be coerced, not
   a convention that it should not be.
2. **Aggregate null-preserving.** When folding a nullable measure across many
   subjects, accumulate into a sum *and* a present-count in the same pass, and
   emit absence when the present-count is zero. Contributing only where present
   is what keeps *null* and *measured zero* distinguishable after the fold —
   the fold is the last place the difference still exists, and the easiest
   place to lose it.
3. **Divide by observed weight.** For a weighted mean, the denominator is the
   sum of the weights of present inputs, not the declared total. A dropped
   input then has *no* effect on the result rather than a punitive one, which
   is the property you want: removing a detector must not move the headline.
4. **Apply the sample floor to the present set.** Renormalizing over two of ten
   inputs is arithmetically valid and epistemically empty; the floor from
   [minimum-sample-floors](./minimum-sample-floors.md) is evaluated on what was
   present, and below it the result is absence, not a small number.
5. **Disclose the fraction, always.** "82, over seven of ten measures" and "82,
   fully measured" are different claims; rendered identically they teach the
   reader that neither can be trusted. The disclosure travels with the value —
   in the breakdown, in the export, in the string that gets pasted into a
   message — per [count-carries-predicate](../../../../_laws.md#count-carries-predicate).
6. **Name the absent inputs.** A visible "not measured — *reason*" row is worth
   more than the coverage percentage, because it converts a caveat into a task.

## The incentive property, stated plainly

Under zero-imputation, the cheapest way to raise a number is to break the
collector that lowers it, and the cheapest way to avoid a bad score is to stop
measuring a weak area. Under renormalize-plus-disclosure the incentive
inverts: an unmeasured input buys nothing, it only lowers coverage, and
measuring is always the improving move. This is the strongest practical
argument for the technique and the one to make to whoever owns the metric —
it is not about arithmetic taste, it is about which behavior the number pays
for.

## Where renormalization stops being honest

- **Below the coverage floor**, the result is not a small number, it is *no
  number*: the ranking of a subject measured on two inputs against one measured
  on ten rewards ignorance, because the sparse subject's two happened to be
  strengths. Refuse to rank; say "insufficient coverage" and name the gaps.
- **When coverage differs sharply between compared subjects**, even above the
  floor, the comparison itself is the dishonest artifact. Either disclose the
  asymmetry inline or offer the comparison restricted to the shared observed
  subset.
- **When absence is correlated with the thing being measured.** If inputs go
  missing *because* the subject is unhealthy, renormalizing systematically
  flatters exactly the subjects you most need to see. The tell is a correlation
  between coverage and score; when it appears, absence must be treated as an
  incomplete run rather than a gap — see
  [incomplete-not-verdict](./incomplete-not-verdict.md).

## When not to use it

- **When the input is mandatory by policy.** Some measures are required for the
  result to mean anything; their absence is a refusal condition, not a
  renormalization case. Excluding them silently produces a confident number
  about a subject you never verified.
- **When the weights encode a whole that must sum.** For a budget-shaped or
  share-shaped quantity, renormalizing over the present parts rescales shares
  into a claim about a whole you did not observe. Report the observed parts as
  parts, with the unobserved remainder named.
- **Inside a rubric's own dimension handling**, where the composite's absence
  policy, coverage floor, and breakdown contract are already owned elsewhere;
  this technique is the general arithmetic, not a second policy for the same
  artifact.
