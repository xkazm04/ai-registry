---
layer: technique
type: technique
subject: copy-quality-gates
technique: layered-mechanical-gate
status: forged
laws: [every-finding-cites-an-anchor, coverage-is-counted-not-claimed]
shared_with: []
use_when: [choosing which copy checks block a change and which only warn, a pattern rule is about to be switched to error level, a copy gate has accumulated warnings nobody reads]
stage: solo
---

# Layered mechanical gate

A copy gate is a stack of checks with very different certainty. Some cannot be
wrong about what they measure; some are right most of the time; some flag text
that is often legitimate. Running them as one undifferentiated list — all
blocking, or all warning — fails predictably: blocking on uncertain rules gets
the whole gate suppressed, and warning on certain ones lets structural breaks
ship. The layers order the checks by certainty and cost, and assign each layer
the disposition its certainty earns.

The sibling measurement subject's
[deterministic checks before estimates](../../translation-quality-measurement/techniques/deterministic-checks-before-estimates.md)
owns the decidable classes of a translated store: skeleton parity, termbase
adherence, duplicate-source divergence, budget and convention. This technique
applies the same ordering to source copy and adds what source copy breaks that a
translated store rarely does.

## The layers

- **L1, deterministic — blocking.** Message syntax validity and placeholder
  parity; no sentence assembled from concatenated catalog fragments; no literal
  user-visible string escaping the catalog; typography rules the contract
  declares (dash system, quotes, ellipsis, spacing); declared-variant spelling
  against a variant word list; termbase forbidden variants; link text that is
  not "here" or a bare "learn more"; case per element class; length budget per
  surface. Each has an unambiguous answer, and each finding carries a rule
  identifier, an address and a span.
- **L2, spelling and grammar — blocking only after counted precision.** Real
  misspellings and agreement errors, with sentence-level rules switched off for
  units classed as fragments (buttons, labels, headings, table cells), because a
  telegraphic label is correct copy and a grammar checker will call it an error.
- **L3, style patterns — warning, confirmed by a reviewer.** Interference lists,
  officialese frames, puffery density, formulaic openers and closers, triads,
  staccato runs. Every pattern here has legitimate uses; the finding asks a human
  to look, and the human's verdict is recorded.

Judgment (L4) and fidelity on translated strings (L5) are not mechanical and run
after this stack, on its residue.

## Procedure

1. **Run the layers in order and stop on L1 failure** — prose rules on a message
   that does not parse produce noise.
2. **Scope to the diff on every change**: the changed and added units, plus any
   unit whose surface class or neighbouring units changed.
3. **Audit the whole catalog on a schedule and on every rule-set or checker
   change**, because a new rule has never been run on the strings the diff gate
   will never see again.
4. **Emit findings in one shape**: rule identifier, unit address, quoted span,
   deterministic replacement where one exists. A finding without an identifier
   is a bug in the rule, per
   [every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor).
5. **Record every reviewer verdict** on L2 and L3 findings — accepted, rejected,
   rule wrong — against the rule identifier. That ledger is the precision.
6. **Print coverage**: units checked per layer against units extracted, per
   [coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed).

## Decision rules

- **When a rule is structural, block from the first day**, because it measures a
  property that cannot be a matter of taste.
- **When a rule is lexical or pattern-based, block only once at least 95% of its
  findings on the real catalog were accepted**, because a gate that is wrong one
  time in ten is resolved by the first frustrated author suppressing the rule.
- **When a rule's acceptance falls under 50% across twenty findings, demote it to
  warning or rewrite its trigger**, because it is costing more attention than the
  defects it finds.
- **When a warning is not shown in the change review, delete it**, because a
  warning nobody sees is a record that the defect was known and shipped.
- **When promoting a rule from warning to error on a catalog that already carries
  occurrences, ratchet on per-occurrence fingerprints** — rule identifier, unit
  address, hash of the unit's text — and fail only on new fingerprints. A bare
  count lets one fixed occurrence silently pay for one new one.
- **When a check is a readability formula, use it as an alarm on body blocks of a
  hundred words or more, never as a gate** (the English subject's EN-READABILITY),
  because rewriting to a grade score does not raise comprehension and a fragment
  scores nonsense.
- **When a check is a generated-text detector, do not run it** (EN-DETECTOR):
  detectors misflag non-native writers, and a finding must name a text property,
  not an author.

## When not to use it

- **To gate translated targets on source-language style patterns.** L3 lists are
  per language; running the source language's patterns on a target is noise, and
  target-side fidelity belongs to bilingual revision.
- **Before the contract declares the choices.** A variant or case check with no
  declared variant enforces whichever form its author preferred.
- **As the only instrument on money pages.** A clean mechanical run means nothing
  decidable is wrong. Whether the headline is native, specific and true is the
  residue, and it gets a human.
