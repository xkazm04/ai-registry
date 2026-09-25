---
layer: technique
type: technique
subject: docs-sync
technique: named-duplication-points
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [one fact has to appear in several hand-written documents because each reader needs it where they already are, a figure is quoted rounded in one place and exact in another, choosing the drift check for copies that no generator can produce, a restated fact changed in one document and the others still carry the old value, an instruction file lists where a fact is repeated and nobody has checked that list]
---

# Named duplication points

The single-source rule says a fact has one author and every other appearance of it
is derived: generated from the source, marked as generated, regenerated in CI, and
compared on every build. That works when each copy is a *function* of the source.
Some facts are restated on purpose in prose that no function produces. A landing
page quotes a latency as "5 ms", the reference table beside it says "4.90 ms", a
comparison page says "5 ms cold", a chart draws it as a bar, and a docstring gives a
default in words. The fact is one; the copies differ in rounding, unit, sentence and
reader. No generator writes them, so "regenerate and compare" has no defined answer.
This technique covers that case: **restate on purpose, name one authority per fact,
and check the copies with a reviewer. Use a machine only for the facts whose copies
really are literal.**

## A literal check is wrong in both directions on rounded copies

The obvious mechanical fallback is to take the value from the authoritative copy and
assert that each other copy contains it. Measured on a real tree whose latency figure
lives in four hand-maintained places, that check was wrong both ways. On the clean
tree it flagged 2 of 3 correct prose copies, because they round the figure. After a
seeded change that updated only the authority and one table, it passed 1 of 3 stale
copies, because the new value's digits happened to appear elsewhere on that page.
Tolerances do not rescue it: the hard part is knowing *which* number in *which*
sentence is this fact, and that is a reading task.

A reviewer is the check that fits. Across eight reviewer runs over the same seeded
change (12 stale sites: six rounded latency copies including an unregenerated chart,
five print-cap statements, one module table), reviewers found 92 of 96 site-instances.
On a clean tree with a benign change they raised no false duplication finding.

## Decide per fact, not per regime

"Not derivable" is true of some facts on a duplication list and false of others. In
the same tree the importable-module list appears as the **same table** in two
documents, and a cap is written the same way ("10 MiB") in every document that states
it. Those copies are literal. A table diff and a value grep found every seeded stale
site there (6 of 6), with one false hit where the same digits meant a different
limit. So ask of each listed fact: could one extraction from each site compare them?

- **Yes:** assert it mechanically. Diff the table or grep the value, and fail on
  difference. A reviewer is the weaker instrument for a fact a machine can compare.
- **No** (rounded, reworded, drawn, spread over sentences): a reviewer, with the
  authority named so a disagreement has a resolution rule
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## The list of sites is a copy too, and it rots

The regime usually writes its sites down: "these facts are stated in more than one
place on purpose; change one and change all of them." That list is worth less than it
looks, and it can be wrong.

- **It did not move the catch rate.** Reviewers given the list found 47 of 48 stale
  sites; reviewers with the list removed found 45 of 48. On the rounded latency copies
  the averages were 5.75 and 5.25 of 6. A capable reviewer searches for the old value
  and follows the page's own links. The list helped most where a copy is rounded
  beyond search. Its one measured failure ran the other way: a reviewer ticked off a
  listed *file* once the table in it had moved and missed the stale sentence below it
  in the same file. List sites as occurrences, not files.
- **It is itself a copy.** In the source tree the list is written twice, in the
  instruction file and in the reviewer's brief, and the two already disagree (five
  default limits in one, four in the other). After the seeded change, every run that
  had the list flagged the list as stale, because it quotes the value it indexes.
  Write the list once and have the brief point to it. Where possible, list locations
  and not values.
- **Its census is unchecked.** For one listed fact, the list named a document that
  does not state it. A value grep found the fact in four documents the list omits, and
  found at least eleven unlisted copies across three facts of one listed group. A
  source comment also restated a module's surface ("only two functions implemented")
  when the module implements eleven: a copy nobody listed because nobody saw it as
  one. The census *is* mechanical even though the prose is not. Grep each fact's
  current spellings and compare the files found with the files listed. Use it as a
  report for the reviewer, not a gate, because equal digits can mean a different fact
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## A reviewer nobody invokes is prose

The reviewer counts as the drift check only if something runs it on the change that
moves the fact. In the source tree the parity reviewer is "the documentation gate
before merge" only in prose. A general review skill delegates to it "for a full pass,"
and no pipeline runs it. That puts the regime in the unbacked column of
[prose-rule-drift](../../../standards-and-gates/quality-gates/techniques/prose-rule-drift.md):
ask what invokes the reviewer, on what event. For the literal facts, the mechanical
assertion above can run in a pipeline even when the reviewer cannot, which is another
reason to split them out.
