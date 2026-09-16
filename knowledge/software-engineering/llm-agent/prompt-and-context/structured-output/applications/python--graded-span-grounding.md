---
layer: application
type: application
subject: structured-output
technique: graded-span-grounding
stack: python
status: forged
verified_on: 2026-09-16
verified_against: python@3.10
---

# An extraction library that never asks for offsets and grades every alignment

LangExtract, Google's open-source library for LLM-based extraction from unstructured
text, read at commit `70cfb988` (2026-09-13), package version 1.7.0. The version witness
is `pyproject.toml:25 "requires-python"` (`>=3.10`), the interpreter floor. Paths are
relative to the repo root, and every quoted anchor below was checked against the clone
with `scripts/check-anchors.mjs`. The library is a staged pipeline: chunk a document,
prompt with few-shot examples, parse the reply, then **align each extracted string back
to the chunk** and attach character intervals. The alignment step is the whole of this
technique in one module, `langextract/resolver.py`.

## The model returns text, the resolver computes where it is

Extractions come back as class/text pairs with no positions. The annotator aligns them
against the chunk the model was shown and adds the chunk's offset afterwards:
`langextract/annotation.py:422 "aligned_extractions = resolver.align("` receives
`langextract/annotation.py:424 "text_chunk.chunk_text,"` and `char_offset`. That is the
per-window rule. A quote produced from one chunk is never searched for in the whole
document.

## A closed grade, and unlocated items kept

The grade set is an enum,
`langextract/core/data.py:44 "MATCH_EXACT"` through
`langextract/core/data.py:47 "MATCH_FUZZY"`, and an item nothing could
place keeps `None`. The resolver's own docstring gives the contract:
`langextract/resolver.py:182 "- None: No alignment found"`. The multi-pass merge treats
such items as overlapping nothing (see the recall-pass application in the
entity-graph subject). Partial exact runs are a separate grade that a caller can refuse:
`langextract/resolver.py:1011 "if accept_match_lesser:"`, otherwise the intervals are
reset to `None`.

What the library does **not** do is tie the grade to a use. Every grade reaches the
output as a located extraction, and the consumer decides. That is right for a library
whose product is highlighting (`langextract/visualization.py` renders spans), and it is
the reason a consumer that awards anything on these spans must add its own admission rule.

## Two fuzzy gates, searched across match counts

The default fuzzy aligner is a longest-common-subsequence DP that keeps, for every
achievable match count, the tightest source span
(`langextract/resolver.py:1287 "def _best_lcs_spans("`). Acceptance needs both
`langextract/resolver.py:1385 "Coverage gate (threshold): did we find enough of the extraction?"`
and
`langextract/resolver.py:1388 "Density gate (min_density): is the match tight enough? Requires"`,
at defaults `langextract/resolver.py:57 "_FUZZY_ALIGNMENT_MIN_THRESHOLD = 0.75"` and
`langextract/resolver.py:58 "_FUZZY_ALIGNMENT_MIN_DENSITY = 1 / 3"`. The caller walks
match counts downward,
`langextract/resolver.py:759 "# Try spans by decreasing match count: a sparse max-match span may fail"`,
and a test pins the case: `tests/fuzzy_alignment_cases_test.py:491 "def test_sparse_max_match_falls_back_to_dense_submatch(self):"`.
The previous sliding-window aligner, which had coverage only, is deprecated
(`langextract/resolver.py:868 "is deprecated and will be"`).
Token normalization is deliberately light:
`langextract/resolver.py:1277 "Lowercases and applies light pluralisation stemming."`.

The tokenizer counts punctuation as tokens, and coverage is counted over all of them.
Nothing here guards a short, punctuation-heavy extraction against reaching coverage on
symbols. The technique's content-token rule comes from a consumer experiment, not from
this tree.

## Items are delimited so no match can cross them

All extractions in a chunk are aligned in one matcher pass, joined by a separator
`langextract/resolver.py:795 "Unicode Symbol for unit separator"` (U+241F),
and an item containing it is refused:
`langextract/resolver.py:918 "appears inside extraction text"`. The
invariant is asserted where a block is read back:
`langextract/resolver.py:1002 "Delimiter prevents blocks greater than extraction length"`.

## Repeated mentions go to successive occurrences

The default exact aligner replaced a greedy matcher with an order-preserving occurrence
DP. The option's docstring states the new behaviour:
`langextract/resolver.py:836 "an order-preserving occurrence DP, so repeated mentions map to"`.
The selection maximizes matched tokens with the earliest-ending tie break,
`langextract/resolver.py:1122 "regions; ties prefer the earliest-ending chain, so repeated mentions"`,
and identity is tracked by object rather than value because duplicates compare equal:
`langextract/resolver.py:945 "# Track DP-aligned extractions by id(): duplicate extractions"`.
The DP assumes the model's output order is reading order. When an index suffix reorders
extractions (`langextract/resolver.py:534 "processed_extractions.sort(key=operator.attrgetter("`),
nothing checks that assumption.

## The examples pass the same aligner, under the production policy

Before any document is processed, `extract` aligns every few-shot example against its own
text, building the policy from the same resolver parameters the documents will use:
`langextract/extraction.py:220 "for field in dataclasses.fields(pv.AlignmentPolicy):"`
feeding `langextract/extraction.py:224 "report = pv.validate_prompt_alignment("`. The check
copies the examples first,
`langextract/prompt_validation.py:157 "# Defensive copy so validation never mutates user examples."`,
and escalates by level: warning by default
(`langextract/extraction.py:71 "prompt_validation_level: pv.PromptValidationLevel = pv.PromptValidationLevel.WARNING,"`),
and at the error level with strict mode on, it refuses non-exact examples as well as failed ones:
`langextract/prompt_validation.py:264 "if strict_non_exact and non_exact:"`.

## What this realization cannot do

It cannot tell a located misreading from a correct extraction. Alignment proves the
string is in the chunk, not that it belongs to the class the model gave it. It also has
no view of any renderer transport, because the chunk text it aligns against is exactly
the text the prompt carried. The first half of the technique, aligning against the
rendered view, holds here by construction, not by a rule a consumer could break.
