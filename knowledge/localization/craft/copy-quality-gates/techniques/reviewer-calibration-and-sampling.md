---
layer: technique
type: technique
subject: copy-quality-gates
technique: reviewer-calibration-and-sampling
status: forged
laws: [every-finding-cites-an-anchor, coverage-is-counted-not-claimed]
shared_with: []
use_when: [choosing who reviews source copy and in which role, deciding which pages get complete human review and which are sampled, a reviewer's corrections are being accepted without anyone knowing their error rate]
stage: team
---

# Reviewer calibration and sampling

Human review is the last layer of a copy gate and the most expensive, and the two
decisions that waste it are made before anyone reads a string: **who** reviews,
and **what share** of the copy they see. The default answers — "a native speaker"
and "whatever changed" — are both wrong in ways that are measurable.

The general discipline of drawing a review sample under a budget belongs to the
sibling subject's
[human review sampling under a budget](../../translation-quality-measurement/techniques/human-review-sampling-under-a-budget.md),
and its typology and weights to
[error typology over a single score](../../translation-quality-measurement/techniques/error-typology-over-a-single-score.md).
This technique adds what source copy and agent-written copy change: role
separation, qualification by calibration, and a coverage rule weighted by surface.

## Roles, separated

- **Bilingual reviser** — fidelity of translated strings against their source:
  negations, numbers, conditions, qualifiers, dropped clauses. ISO 17100 draws
  this line between bilingual revision and monolingual review.
- **Variant-native editor** — nativeness, collocation, register. Native to the
  *declared* variant: an editor from the other variant "fixing" copy degrades it,
  and every correction looks like an improvement to them.
- **Termbase owner** — rulings on term candidates; nobody else edits the termbase.
- **Money-page sign-off** — one named person per money page, who reads it
  rendered.

One person can hold several roles on a small product. What matters is that each
review pass states which role it performed, because a nativeness pass is not
evidence of fidelity.

## Qualification by calibration

Nativeness is neither necessary nor sufficient. Expert annotators working with an
error typology and document context diverge sharply from crowd raters (Freitag et
al. 2021); agreement between human raters in generation evaluation usually falls
below conventional thresholds (Amidei et al. 2019); the readers who reliably
recognize generated prose are heavy model users, not natives as such.

1. **Build a seeded set per role**: real strings with planted defects, each tagged
   with its rule identifier, mixed with approved clean strings.
2. **Measure two numbers**: recall on the planted defects, per rule family, and
   the edit rate on clean strings. A reviewer who finds everything and edits half
   the clean set is a rewriter.
3. **Measure agreement on a shared overlap** between reviewers, expect it to be
   modest, and adjudicate disagreements into rulings recorded in the contract.
4. **Require a rule identifier on every correction**, per
   [every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor);
   a correction without one is a proposal for a new rule, decided once.
5. **Re-run calibration when the rule set changes materially** or a reviewer
   returns after a long gap.

## What gets reviewed

- **Money pages: complete review, on the rendered page.** Home, pricing, top
  landing pages, sign-up, checkout, payment and authentication errors,
  transactional email. A spreadsheet hides whether "Order" or "Close" is a noun or
  a verb, and hides truncation.
- **The long tail: a risk-weighted sample** toward strings that are new,
  translated from another language, written without a brief, or written by an
  agent; plus the sibling's random reserve, drawn without regard to risk, which is
  the only part that estimates the catalog.
- **Every L3 warning the gate raised** in the change, because the verdict is the
  precision measurement for that rule.

## Severity as arithmetic

A finding's weight is the typology's severity times a surface weight declared in
the contract. A construction finding in a pricing headline outranks the same
finding in a settings tooltip; an error message on a payment step outranks both.
Normalized per word reviewed, this gives a number that compares releases. It
routes attention and it never clears a page; clearing is the sign-off.

## Decision rules

- **When a reviewer's clean-set edit rate is high, restrict them to finding, not
  fixing**, because their corrections degrade approved copy faster than their
  findings improve it.
- **When two reviewers disagree on a rule's application, the ruling goes into the
  contract**, because an undecided disagreement is re-litigated on every string.
- **When a sampled review is reported, state strings assigned and strings
  actually read**, per
  [coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed).
- **When a reviewer cannot judge a string without the page, send them the page**;
  an unreviewable unit is a finding about the review setup.

## When not to use it

- **At the single-author stage.** One owner with an agent writer gets more from
  the mechanical gate and anchored model review; formal calibration pays once
  several reviewers' verdicts feed one catalog.
- **To make a model reviewer's output authoritative by having a human skim it.**
  An uncalibrated skim of a model's findings is two unmeasured instruments in a
  row.
- **On legal copy's substance.** Whether a legal statement is correct is counsel's
  review; this technique checks its language.
