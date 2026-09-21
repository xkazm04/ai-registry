---
layer: application
type: application
subject: llm-extracted-entity-graph
technique: recall-passes-with-a-declared-cap
stack: python
status: forged
verified_on: 2026-09-16
verified_against: python@3.10
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Blind re-sample passes merged by span overlap

LangExtract, Google's open-source library for LLM-based extraction, read at commit
`70cfb988` (2026-09-13), package version 1.7.0. The version witness is
`pyproject.toml:25 "requires-python"` (`>=3.10`). Paths are relative to the repo root, and
every quoted anchor was checked with `scripts/check-anchors.mjs`. The library offers
further extraction passes for recall, and it is the realization the technique's section
on blind passes was written from. It is not an entity graph. It extracts typed spans from
a document, and its passes and merge are the part that transfers.

## The passes are blind

Each pass re-runs single-pass annotation over the same documents:
`langextract/annotation.py:477 "for pass_num in range(extraction_passes):"` calls
`langextract/annotation.py:482 "self._annotate_documents_single_pass("` with the same
resolver, chunking and prompt arguments. The only per-pass differences are logging and
progress, `langextract/annotation.py:487 "debug=(debug and pass_num == 0),"`. No pass sees
another's answer, so a later pass finds something new only if decoding samples
differently. The option's docstring prices the passes honestly, in tokens:
`langextract/annotation.py:240 "Values > 1 reprocess tokens multiple times, potentially increasing"`.
The same library tells callers how to make decoding deterministic:
`langextract/extraction.py:111 "Set to 0.0 for deterministic output"`. The docstring does
not say that under that setting, further blind passes mostly repeat the first.

## The merge is span overlap, first pass wins

`langextract/annotation.py:52 "the extraction from the earlier pass is kept (first-pass wins strategy)."`
A later item is compared only when it has a span,
`langextract/annotation.py:74 "if extraction.char_interval is not None:"`, and anything
that overlaps nothing is appended,
`langextract/annotation.py:81 "if not overlaps:"`. Two consequences follow from those two
lines. A later item of another type inside an earlier span is dropped. An item the aligner
could not place never overlaps, so it is appended once per pass.

The library's own test shows the first as intended behaviour. In its fixture the second
pass labels the surname inside the first pass's title-plus-name as a different role,
`tests/annotation_test.py:890 "- patient:"`, and the test asserts that label is gone:
`tests/annotation_test.py:910 "assertCountEqual(extraction_classes"`. In that fixture the
drop is correct, because the later label is a relabel of the same mention. That is exactly
why span overlap alone cannot be the rule. The same code drops a real nested entity just as
readily.

## A: the library's merge; B: type-and-span keying; C: declared nesting with conflicts

The library's own merge function was run in place (A) against two alternative merges, on
four pass sets. The first set is the test fixture above. The other three were built to put
each branch of the merge code under one case.

| Pass set | A (library) | B (type and span) | C (declared nesting) |
| --- | --- | --- | --- |
| relabel inside a mention (the library's fixture) | drops the relabel | keeps the relabel | holds it out, records a conflict |
| same type, same span, three passes | one item | one item | one item |
| unlocated item returned by three passes | three copies | one item | one item |
| dose inside a medication phrase, second pass | drops the dose | keeps both | keeps both |

Wrong outcomes: A 2 of 4, B 1 of 4, C 0 of 4. The floor was the library's own fixture, and
A and C agree on it. B failed exactly that case, and that failure is what moved the
technique's rule from "key on type and span" to "declare which types nest, and record the
rest as conflicts". The seam was picked because the library's own test could falsify the
first repair, and it did.

## What this realization cannot do

It has no declared nesting, so it cannot tell a relabel from a nested entity, and it
resolves both the same way. It does not count unlocated items per pass, so a caller cannot
see a later pass adding mostly ungrounded output. And no fleet project runs multi-pass
extraction. The experiment ran on the library, not on a consumer, so the adoption cost of
declared nesting in a real schema is unmeasured.
