---
layer: technique
type: technique
subject: copy-quality-gates
technique: deterministic-repair-classes
status: forged
laws: [format-skeleton-is-inviolable, clean-strings-stay-untouched]
shared_with: []
use_when: [a gate report is dominated by findings a script could have fixed, deciding whether a class of finding may be auto-corrected, an autocorrect step exists and nobody knows what it changed]
stage: solo
---

# Deterministic repair classes

A finding is a request for a human's attention. When the fix for a class of
finding is unambiguous — one correct output, derivable from the input by rule,
with nothing a reader would need to decide — spending that attention is waste, and
a report full of such findings buries the ones that needed a person. Three
implementations read in their shipping source ship the same answer (code-verified,
2026-09): the class is **repaired, not reported**.

The shipped repair classes are small and typographic: normalizing an ellipsis to
the one form the contract declares; removing a zero-width space; stripping control
characters; writing the sentence terminator of a script that uses a danda instead
of a Latin full stop; inserting the space a language requires before certain
punctuation marks; sanitizing markup down to the set the format allows. None of
them touches a word.

Two details of those implementations matter more than the list. One attaches an
**exact offset and a machine-applicable replacement** to every finding it emits, so
a repair is simply a finding whose replacement the pipeline is permitted to apply —
repairable and reportable are one data shape with one extra flag. Another ships an
autocorrect mode that also **suppresses the findings it could not fix**. That is the
failure mode to name: the report goes quiet on exactly the units that still needed
a human, and a clean report after autocorrect reads as a clean catalog.

## What makes a class repairable

- **Deterministic.** One output for one input, from the unit and the contract
  alone. No model, no ranking of candidates, no context the rule does not have.
- **Idempotent.** Applying the repair to its own output changes nothing. This is a
  test, not a property to assert: run every repair twice over the fixture set and
  diff.
- **Skeleton-preserving.** Placeholder names, tag names, syntax keywords and braces
  are byte-identical before and after, per
  [the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable).
  A repair runs on a parsed unit so that it cannot reach the skeleton at all, and
  the skeleton check re-runs after it.
- **Below meaning.** If two different repairs are possible — the ellipsis could be
  a trailing-off or a truncation marker, the space could belong to either side —
  the class is not repairable for that unit and the finding is reported instead.

## Every repair is recorded

A silent normalization of a human's text is indistinguishable, afterwards, from a
defect being introduced. Each repair writes what changed, where, and by which rule
identifier, into the same ledger the reporting layers write to. That record is
what keeps a repair inside
[clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched): the
law permits rewriting what a typed finding flagged, and a repair is a typed finding
applied — without the record it is a drive-by edit with a script's confidence.

## Procedure

1. **Run format validation first.** A unit that does not parse is not repaired; it
   is reported, because a repair on an unparsed unit can reach the skeleton.
2. **Apply repair classes before the reporting layers** of the
   [layered-mechanical-gate](./layered-mechanical-gate.md), so the report a human
   reads contains only what a script could not settle.
3. **Emit every finding with an offset and a replacement where one exists**, and
   mark the classes whose replacement may be applied without review.
4. **Apply, then re-run the skeleton check and the repair set on the output.** A
   second pass that changes anything means a class is not idempotent; disable it
   and report its findings until it is fixed.
5. **Write the repair ledger** — rule, unit address, offset, before, after.
6. **Report what could not be repaired in full.** Autocorrect never removes an
   unfixed finding from the report.

## Decision rules

- **When a class has exactly one correct output for every input, repair it**,
  because reporting it spends reviewer attention on a decision nobody has to make.
- **When a unit admits two repairs, report the finding**, because choosing between
  them is interpretation and a rule has no standing to interpret.
- **When a repair depends on a language's punctuation or spacing convention, it
  cites that language's rule**, because a repair without an anchor in the language
  subject is one author's taste applied at scale.
- **When an autocorrect step would suppress findings it could not fix, change the
  step**, because a report that is quiet after repair is read as a catalog that is
  clean.
- **When a repair would change a word, it is not a repair class**, because anything
  that moves meaning belongs to the reported layers and to a human.

## When not to use it

- **Before the contract declares the form.** An ellipsis normalized toward a form
  nobody declared enforces whichever form the script's author preferred.
- **On a model's suggested replacements.** A model's fix can be applied only after
  review under [anchored-model-review](./anchored-model-review.md); it is neither
  deterministic nor guaranteed idempotent.
- **On legal or quoted text** where the characters are the record — a quotation, a
  licence clause, an external identifier — which stays byte-identical even when
  its typography is wrong.
