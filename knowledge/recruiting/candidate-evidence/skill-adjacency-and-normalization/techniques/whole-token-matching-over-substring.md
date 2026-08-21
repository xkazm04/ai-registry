---
layer: technique
type: technique
subject: skill-adjacency-and-normalization
technique: whole-token-matching-over-substring
status: forged
laws: [say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [matching skill terms against free-text job or candidate prose, adding a punctuation-tolerant fallback, debugging a match that fired on nothing]
---

# Whole-token matching over substring

Skill surfaces contain punctuation that job descriptions spell inconsistently:
hyphens that appear and vanish, dots inside compound names, slashes, plus signs,
internal spaces. To match a term written one way against prose written another,
systems fold both sides into a compacted form — lowercase, diacritics removed,
non-word characters stripped — and compare. The fold is correct and necessary.
The comparison over the fold is where the discipline lives.

**A compact match must begin where a word begins and end where a word ends in
the original text.** Anything less is a substring test over a spaceless blob,
and a substring test over natural-language prose mints capabilities out of
coincidence.

## Why this is the highest-severity defect in the area

Compaction deletes the spaces, so every word boundary in the source disappears
and adjacent words fuse. Once fused, ordinary human sentences contain the
letter sequences of unrelated technical terms:

- a sentence about a personal quality contains, across two fused words, the name
  of a mobile platform;
- a data store's name contains, as a strict substring, the name of the query
  language it speaks — so naming the store credits the language, and the two are
  genuinely different capabilities;
- a broad commercial term contains a narrower specialist one, so a generalist's
  record credits the specialism;
- an infrastructure product's name contains, letter for letter, the name of an
  unrelated framework.

None of these need contrived text. They are the ordinary consequence of deleting
spaces from prose, which means the defect fires on real candidates, at scale,
from day one.

Three properties make it worse than an ordinary bug:

1. **It is silent.** No error, no anomaly, no log line. The candidate's profile
   simply carries a skill that nothing in their record supports.
2. **It is deterministic.** The compact fallback lives in the rule-based part of
   the pipeline — the path that runs when no model is available, the path
   everyone treats as the trustworthy one. Every candidate whose text contains
   the sequence gets the same false credit, every run, forever.
3. **It inflates the metric that would catch it.** Coverage and match-rate go
   *up*. The defect looks like an improvement on every dashboard that watches
   for this class of problem.

## The rule, mechanically

Keep, alongside the compacted string, an index mapping each compacted character
back to its position in the original. Then a candidate compact match at
positions `[i, j)` is accepted only if:

- the original character before the character at index `i` is a word boundary or
  the start of the text, **and**
- the original character after the character at index `j-1` is a word boundary
  or the end of the text.

Both endpoints, always. Checking only the start is the common half-fix and it
still credits every term that is a prefix of a longer word.

Alternatives that look equivalent and are not: tokenizing and comparing token
sets loses multi-token surfaces; padding both sides with spaces before the
substring test fails on the punctuation the fold exists to absorb; a regular
expression with word-boundary anchors over the *compacted* text anchors against
the compacted grid, not the original one, which is exactly the grid that no
longer has the boundaries.

## The one relaxation

Heavily-inflected languages append case endings to borrowed technical nouns, so
a strict end-boundary rule loses genuine matches. Grant exactly one relaxation:
**a bounded suffix allowance, only for surfaces that are a single plain
alphanumeric token** — no internal hyphen, dot, slash, plus or space. Such a
term absorbing a short trailing inflection is a real match; a compound term
absorbing arbitrary trailing characters is the original defect wearing a
disguise.

Keep the allowance short (a few characters), keep it suffix-only (never a prefix
allowance — prefixes fuse with the preceding word), and gate it on the
single-token property in code, not in a comment.

## The length guard, before any of it

Short surfaces are the other half of this hazard, and they need their own rule:
**do not run the compact fallback at all on a compact form of one or two
characters.** Single-letter and two-letter capability names are real and common,
and their compacted forms are substrings of almost every word in every language
— one such alias is enough to vote its whole domain on every document the system
ever reads. Short surfaces still match precisely through the whole-token path,
which is where they belong; the fallback exists for separator-bearing spellings
and has nothing to offer a two-character token.

Do this before the word-grid check, not instead of it. The two rules cover
different accidents, and a system with only one of them still bleeds.

## Ordering: exact first, fallback last

The compact path is a *fallback*, and it must be the last thing tried:

1. exact canonical or alias match on normalized, tokenized text;
2. multi-token surface match on the token sequence;
3. compact match, word-grid-anchored, with the single-token suffix allowance.

Running the fallback first, or in parallel and taking any hit, throws away the
precision of the earlier stages. And once a stage above it has answered, the
fallback has nothing to contribute.

## The standing collision gate

The regression tests below pin the accidents you already found. The gate that
finds the *next* one is a scan: take a corpus of realistic requirement and
candidate text, run every surface's compact form against it, and report every
place a compact form lands somewhere its whole-token form does not. Three rules
make that scan usable rather than noisy:

- **Only fail on collisions that are live under the current matcher.** A
  theoretical collision that the word-grid rule already excludes is a note, not
  a failure; failing on it trains people to ignore the gate.
- **Keep a small, explicit allowlist of verified-benign compact surfaces** — the
  handful where the separator-free spelling is genuinely the same concept.
  Reviewed once, named in one place, and short enough that a new entry is a
  conversation.
- **Run the scan when surfaces change, not only when the matcher changes.**
  Adding an alias is a matching change. A new alias whose compact form collides
  with ordinary prose is exactly the same defect arriving through the data door,
  and it is the door nobody guards.

## The regression suite this earns

Every coincidence that ever fired belongs in a permanent test file, by name, as
a *negative* assertion — this text must yield no credit for that term. The value
is not that the specific pairs recur; it is that the file documents the failure
*class* to the next person who is tempted to loosen the comparison, and that a
future loosening trips every one of them at once. Pair the negatives with
positives for the cases the relaxation exists to serve — hyphen-versus-no-hyphen
spellings, dotted compounds, inflected foreign-language forms — so the suite
pins both edges and a fix cannot silently trade one for the other.

## When not to use this

- **Do not use compact matching at all where a curated alias would do.** Every
  spelling variant you can enumerate as a surface is a variant the fallback
  never has to guess at; see
  [canonical-term-with-surface-aliases](./canonical-term-with-surface-aliases.md).
  The fallback is for the long tail, not for spellings you already know.
- **Do not extend the word-grid rule into fuzzy or edit-distance matching.**
  Boundary anchoring makes a *substring* test safe; it does nothing for an
  approximate one, which reintroduces the same false credit through a different
  door.
- **Do not let compact matching itself assign relatedness.** It answers "does
  this text contain this surface", not "how related are these capabilities";
  hierarchy and adjacency run afterwards, on the canonical term it resolved, and
  graded credit for unmodelled vocabulary belongs to the bounded token-overlap
  rule in
  [unmodelled-term-graceful-fallback](./unmodelled-term-graceful-fallback.md).
