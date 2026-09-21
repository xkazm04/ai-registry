---
layer: technique
type: technique
subject: responsive-search-ad-craft
technique: keyword-coverage-half-not-all
status: forged
laws: [label-convention-as-convention]
shared_with: []
use_when: [deciding how many headlines carry the ad group's keyword, scoring keyword presence in a generated set, explaining why a rater does not reward every headline containing the keyword]
---

# Keyword coverage: half, not all

The ad group's keywords appear in about half the headlines. Not all: a set where every
headline carries the keyword gives the combiner no keyword-free headline to pair with a
keyword-bearing one, so the searcher sees the same term three times in one ad and reads
it as spam. Not none: the results page bolds the query terms in the ad, and the
platform's own quality assessment reads ad-to-keyword relevance from the copy, so a set
that never says the keyword loses both. The share is a convention; the shape - some,
not all - is the technique.

## Why the rater's goal is a share, not a count

A rater that awards full marks when every headline contains the keyword trains writers
and generators to stuff. A rater whose goal is a share, reached at half and not
improved beyond it, rewards the mix the combiner needs. The half is practitioner
convention; the platform documents neither a share nor a count, only that headlines
"should include" the keywords.

## Procedure

1. **Take the keyword set from the ad group, not from the brief's product name.** The
   keywords are what the searcher typed; the product name is what the business calls
   it. When they differ, the keyword is what gets bolded.
2. **Tokenise both sides the same way.** Lowercase, strip diacritics and punctuation,
   split on whitespace, keep significant tokens. In an inflected language a keyword
   and its form in a headline differ by an ending, so token matching on a normalised
   stem-length prefix is the practical compromise; exact-string matching under-counts
   badly.
3. **Handle the short-keyword case explicitly.** A significance filter (tokens of four
   or more characters, a convention that drops stopwords and stray units) can strip a
   whole keyword like a three-letter product noun. When the filter leaves nothing to
   match, fall back to whole-keyword substring matching on the normalised headline
   rather than reporting "no headline contains a keyword" when all of them do.
4. **When there are no measurable keywords, exclude the factor.** A set generated
   without a keyword list has nothing to score against; the factor is marked "not
   measured" and its weight is redistributed, never scored as zero. A zero here is a
   fabricated verdict.
5. **Score coverage as the share of headlines with any keyword token, capped at the
   goal.** Coverage of half is full marks; coverage above half earns no more; coverage
   of zero fails; anything between is partial.

## Decision rules

- **When coverage is below the share, add the keyword to headlines that lack it rather
  than writing new keyword headlines, because** the angle set is already right and a
  new headline dilutes it.
- **When coverage is above the share, leave it, because** the goal is a floor for
  relevance, not a ceiling to enforce; the writer who removes keywords to hit exactly
  half is optimising a proxy.
- **When the significance filter strips every keyword token, fall back to substring
  matching, because** the alternative is a confident "no keywords" verdict on a set that
  says the keyword in every line.
- **When the keyword list is empty, report the factor as unmeasured and renormalise the
  composite, because** an absent signal must neither penalise nor inflate the rating.

## When NOT to use

- Do not apply the share to brand campaigns where the keyword *is* the brand. There
  the brand headline and the keyword headline coincide and the combiner will pair
  brand with brand whatever the share; write the set for the brand's angles and let
  coverage land where it lands.
- Do not use keyword presence as the relevance measure. A headline containing the
  keyword is relevant to the *query*; whether it is relevant to the *page* is a question
  the factor cannot answer (see `ad-strength-is-a-proxy-not-relevance`).
- Do not enforce the share in a language the tokeniser cannot normalise. If diacritics,
  compounding or inflection defeat token matching, the factor is a guess and is
  reported as unmeasured rather than scored.
