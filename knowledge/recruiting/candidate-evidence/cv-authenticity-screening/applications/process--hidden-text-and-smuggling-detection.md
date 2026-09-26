---
layer: application
type: application
subject: cv-authenticity-screening
technique: hidden-text-and-smuggling-detection
stack: process
status: forged
verified_on: 2026-09-26
applied: code
ab_verdict: better
---

# From a character-class flag to a content screen (Python pipeline)

The CV screen in `pipeline/jobfit/authenticity.py` shipped with the exact rule
the technique forbids, and on 2026-09-26 it was changed to the technique's
discipline. Both halves are recorded, because the before state is the common
one and the measurement is what made the change safe.

## Before: one code point was enough

Until 2026-09-26 the hidden-text half of `prompt_injection_checks` was one
regex, searched once:

```python
_INVISIBLE_CHARS = re.compile(
    "[\u200b\u200c\u200d\u2060\ufeff\u200e\u200f\u202a-\u202e\u2066-\u2069\u00ad]"
)
...
if _INVISIBLE_CHARS.search(text):
    flags.append(_INJECTION_INVISIBLE_FLAG)
```

Its test pinned the intent in so many words: "One is enough to warn." Nothing
upstream strips these characters (the text cleaner removes none of them), so
whatever the extractor emitted reached the rule. And the flag was not idle. The
screen never drops the CV, but since 2026-09-23 the reviewer surface refuses to
advance a candidate until every open warning is ticked. A false positive here
cost friction on exactly one route, the favourable one.

## The measurement

The real `prompt_injection_checks`, run before and after over thirteen cases.
The benign cases are how real text is spelled or what real tooling leaves
behind. The attacks are the four hidden-content shapes plus a visible control.

| Case | Before | After |
| --- | --- | --- |
| emoji ZWJ sequence in a header | fires | quiet |
| Persian title, mandatory ZWNJ | fires | quiet |
| Hebrew city with an RLM before Latin | fires | quiet |
| soft hyphens from optional hyphenation | fires | quiet |
| BOM left mid-text by a concatenated export | fires | quiet |
| Devanagari ZWJ half-form | fires | quiet |
| England flag emoji (a tag sequence) | quiet | quiet |
| lone zero-width space (the case the old test pinned) | fires | quiet |
| zero-width characters wedged inside an imperative | caught | caught |
| **tag-character smuggled instruction** | **missed** | caught |
| zero-width run | caught | caught |
| bidi override reversing a span | caught | caught |
| visible imperative (control) | caught | caught |

Benign cases fired 7/8 before and 0/8 after; attacks were caught 4/5 before and
5/5 after, n=13, constructed from real character usage rather than drawn from
candidates' documents. The miss is the instructive row: a rule that knows the
zero-width set is blind to the tag block, which carries a whole sentence
losslessly. The class-based rule was noisy and incomplete at once.

## After: four shapes that carry content

`authenticity.py:144-185`, with the reasoning written above the constants:

- a zero-width **run** of eight or more (`_ZERO_WIDTH_RUN`, `:160`);
- an imperative that `_INJECTION_PATTERNS` matches **only once** zero-width
  characters and soft hyphens are removed (`_has_hidden_content`, `:180-185`),
  which is the technique's "re-read without them and flag what changes";
- **tag characters**, decoded, with the emoji subdivision-flag shape skipped
  (`_tag_smuggled`, `:166-173`);
- a bidi **override** (LRO/RLO, `:161`). The marks, embeddings and isolates
  that right-to-left text needs no longer fire.

The discipline was not invented for the CV path. The same tree's scan of
untrusted gig listings (`app/_lib/gigs/suspect.ts:37-41`, `:197-233`) already
used a run threshold, the removal differential and tag decoding, with negative
tests for emoji ZWJ sequences and flag tags. Two screens in one repository had
opposite rules for the same characters. The listing screen had the right one.

Tests, both directions, every character written as an escape:
`pipeline/jobfit/tests/test_authenticity.py:165-203` and
`pipeline/jobfit/tests/test_pipeline.py:92-99`.

## Deviations

- **Styling-hidden text is not screened at all.** Nothing on the CV path
  compares the rendered page with the text layer, so white or tiny type is
  invisible to the screen unless it happens to contain an imperative. Measured
  on real application documents, that is the commonest attack: hidden keyword
  and skill lists aimed at the matcher. The instruction screen catches the rare
  case and passes the common one. The extraction-quality comparison
  (`pipeline.py:582-601`) compares two extractors' text by spacing and length,
  not the page against its text.
- **The flag carries no fragment.** `_INJECTION_INVISIBLE_FLAG` (`:194-200`)
  names the four shapes but not which one fired or where, and the decoded tag
  payload, the most quotable evidence the screen ever holds, is discarded.
- **The neutralise step is absent.** The screen flags; nothing strips the
  invisible characters or folds homoglyphs in the copy that goes downstream, so
  a smuggled sentence the screen caught still reaches the model. The standing
  clause and the grounding gate are what stand behind it.
- **Residual, by choice.** A lone zero-width character that splits a keyword
  without forming an instruction is no longer flagged. That is keyword evasion,
  not injection, and it belongs with the matcher's normalisation.
