---
layer: golden-path
type: golden-path
subject: bengali
status: forged
use_when: [localizing a product into Bengali (bn), auditing Bengali catalog strings in bulk, deciding register or numeral script for a Bengali UI, reviewing Bengali strings that smell machine-translated]
techniques:
  - register-and-address
  - bengali-script-and-numerals
  - classifiers-and-quantity
  - de-anglicization-constructions
  - terminology-and-loanwords
  - ui-conventions-and-length
---

# Bengali (bn)

Bengali is the language where a translation betrays itself not by vocabulary but
by *machinery*: a dropped numeral classifier, a copula calqued from English "is",
a Latin digit glued to a Bengali suffix, a verb that landed at the front of the
sentence. Each of these is mechanically checkable, which makes Bengali unusually
friendly to anchored review — most of what separates shipped-quality Bengali from
machine output can be stated as rules an audit cites by ID, and this subject's
techniques exist to be cited exactly that way.

Three facts shape everything else. Bengali is **verb-final** (SOV), so every
English sentence must be re-planned, not re-worded. Bengali verbs agree with
**person and register but never gender** — a genuine relief for anyone arriving
from Hindi, where every verb form forces a gender decision the source string
never supplies; in Bengali that entire class of problem simply does not exist,
and a reviewer should not go hunting for it. And Bengali **counts with
classifiers**: a bare number cannot sit next to a noun; the classifier morpheme
between them is mandatory grammar, and its absence is the single loudest
machine-translation tell in the language.

## Register: one answer, settled

Bengali has a three-step address system — আপনি (formal), তুমি (familiar), তুই
(intimate) — and each step selects its own verb endings. For software the answer
is settled: **আপনি everywhere**, with the formal imperative in -উন/-ুন on every
button, instruction, error and confirmation. This is not a lean to revisit per
product; Microsoft's Bangla style guides and Mozilla's bn-BD guide agree on it,
and a mature consumer catalog examined for this subject carried hundreds of
আপনি/আপনার against zero তুমি/তুই. The formal ending already carries the
politeness, which yields the corollary translators over-apply: no "please"
(দয়া করে) stacked on ordinary imperatives. A children's or intimate-social
product may argue for তুমি — but that is a product-level ruling to record in the
consuming repo, not a per-string judgment call. See register-and-address.

## Script: what a reviewer must actually check

Bengali script is an abugida with stacking conjuncts and vowel signs, and its
review surface is precise rather than large:

- **Sentence-ending punctuation is the daṛi ।**, not the Latin period. Bengali
  has no native question or exclamation mark; the Latin ? is reused, and ! is
  best avoided in UI copy entirely.
- **Three letters — ড়, ঢ়, য় — are distinct letters**, not decorated variants of
  ড, ঢ, য. Confusing য/য় in a loanword, or shipping the same word with two
  different underlying encodings of these letters, breaks both reading and
  string matching.
- **Conjunct spelling of borrowed words drifts** — the same loanword shipped
  with and without its conjunct is a real, observed defect class, and the fix is
  a termbase row with one canonical spelling.
- **The র + য cluster in English loanwords needs a ZWJ** (র‍্যা- as in "ram",
  "rank", "wrap") or it collapses into an unreadable ligature. This is the one
  invisible-character problem Bengali actually has; ZWNJ is essentially unused.

The numerals question — Bengali digits ০-৯ or Latin 0-9 — is the place where
published authorities genuinely disagree, and the settled software answer is a
split: **Bengali digits for quantities in prose, Latin digits for technical
identifiers** (ports, versions, hashes, anything inside a placeholder). Never
both scripts on one token. See bengali-script-and-numerals for the rule and for
why the authority disagreement is recorded rather than hidden.

## Counting: classifiers and the shape of plurals

The classifier system is small — -টি (neutral-formal, the UI default), -টা
(neutral-colloquial), -জন (people), -খানা (flat/whole objects) — but it is
load-bearing three times over. It is mandatory on counted nouns (৩টি ফাইল, never
৩ ফাইল). It glues *directly* onto the number or the placeholder with no space,
which makes it the one Bengali morpheme that routinely touches the format
skeleton. And it doubles as the definiteness marker when suffixed to the noun
instead (ফাইলটি — "the file"), which is how Bengali marks "this specific one"
without any article.

CLDR gives Bengali two cardinal plural categories, **one** and **other**, with a
trap in the boundary: the *one* category is `i = 0 or n = 1`, so **zero takes
the singular form**. A "one"-category string must read correctly for a count of
0 as well as 1, and a plural suffix (গুলো) leaking into a singular-category
string is a contradiction an audit flags mechanically. Bengali plural marking is
itself optional once a number is present — the numeral-plus-classifier already
says how many, so adding গুলো on top of a count is doubled marking, not
thoroughness. See classifiers-and-quantity.

## What makes Bengali smell translated

The constructions that expose a calque, in observed frequency order:

1. **English word order preserved.** The verb belongs at the end; an
   interrogative belongs in the verb's ending, not in fronted auxiliary order.
2. **The copula calqued.** Bengali has **zero copula in the present tense**:
   "X is Y" is simply "X Y". Translators back-fill the gap with আছে or হয়
   because the English "is" seems to demand a word — but আছে asserts existence
   or location and হয় asserts habitual occurrence, so both say something the
   source never said. The correct rendering of most "is" strings contains no
   verb at all, and a reviewer must resist "fixing" that absence.
3. **Light verbs done literally.** Bengali builds its verb inventory as
   noun + করা/দেওয়া/হওয়া compounds, and each pairing is conventional, not
   compositional — the wrong light verb reads instantly as foreign.
4. **English words left bare mid-sentence** where the loanword policy says they
   should be transliterated — half-translated strings are a coverage defect,
   not a style choice.

See de-anglicization-constructions.

## Vocabulary: borrow decisively, and know your two Bengals

The workable loanword policy for technical products is decisive borrowing:
**core tech and product-domain nouns transliterate into Bengali script**
(এজেন্ট, টেমপ্লেট, ইভেন্ট…), **everyday verbs and connective tissue stay native**
(করুন, মুছুন, ব্যর্থ, ঐচ্ছিক), and abstraction nouns with a natural native word go
native (পর্যালোচনা, অনুমোদন, খসড়া). Bengali also splits a single English word
across the boundary — borrowed as a noun, native as its verb — and those splits
must be held, not "harmonized".

Bengali serves two standardizing communities — Bangladesh (bn-BD, Bangla
Academy) and West Bengal (bn-IN, Paschimbanga Bangla Akademi) — with real
lexical divergences (পানি/জল is the emblem) and separate Microsoft style guides.
For transliterated tech vocabulary the two registers substantially agree, which
is why a single-catalog product can ship one bn: the worked convention is **one
neutral catalog, transliteration-forward, with the divergence recorded** so a
per-region fork later is a policy change, not an archaeology project. See
terminology-and-loanwords.

## Space: longer, and taller than it looks

Bengali runs modestly longer than English by character count — a measured
catalog put it near 8% — but the character count undersells the problem twice.
Conjuncts and vowel signs stack above and below the base consonant, so Bengali
glyphs run visually wider *and taller* than Latin at the same nominal size:
width budgets need more slack than the ratio suggests, and tight line-heights
clip matras. Buttons take the shortest correct formal verb; narrow surfaces
prefer the (shorter) borrowed noun over a native paraphrase; and the classifier
adds a syllable to every counted noun that no layout may assume away. See
ui-conventions-and-length.

## What this subject does not own

Which specific rendering a given product uses for a given term is the consuming
repo's termbase; whether a product overrules আপনি for a তুমি voice is a house
ruling recorded where the product's rules live. This subject owns what Bengali
itself demands — the machinery every product shipping bn inherits, written as
anchors (`BN-*`) an audit can cite by name.
