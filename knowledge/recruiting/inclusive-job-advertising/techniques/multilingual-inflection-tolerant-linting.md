---
layer: technique
type: technique
subject: inclusive-job-advertising
technique: multilingual-inflection-tolerant-linting
status: forged
laws: [meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [extending a posting lint to a second language, a lint reports zero findings on a non-English posting, matching phrases in an inflecting or diacritic-bearing language]
---

# Multilingual inflection-tolerant linting

The concern: a phrase-based check written for one language, applied to a
posting written in another, reports nothing — and nothing is indistinguishable
from clean. This is the most dangerous failure in the subject because it fails
silently in the flattering direction, and because the team that built the check
never sees it: their own postings are in the language the list covers.

## Three mechanical traps, all of which fail silently

**1. The list is in the wrong language.** A posting written in the local
language and checked against an interface-language phrase list produces zero
findings. The fix is per-language lists — not translations of one list, but
lists built from *that* language's highest-frequency offenders, because the
boilerplate of each labour market is native to it. A word-for-word translation
of a foreign filler phrase is usually not the phrase anyone actually writes.

**2. Inflection.** In an inflecting language a phrase appears in many forms —
different case endings, gender agreement, comparative and superlative
formations. A list of citation forms matches almost none of the text that is
actually written. The remedy is **stemmed patterns**: match a stable stem plus
a bounded run of letters, so every ending of the word is caught by one entry.
Choose the stem conservatively — long enough that it cannot begin an unrelated
word, short enough that it survives the language's stem alternations.

**3. The letter class excludes the alphabet.** This is the trap that makes an
inflection-tolerant lint *look* correct and behave worse than useless: the
default word-character class in most pattern engines covers only the unaccented
Latin letters and digits. A stem followed by a generic word-character run
therefore stops at the first accented character — so precisely the inflected,
diacritic-bearing forms the stemming was added to catch are the ones that never
match, while the plain forms still do. The check reports a few findings, looks
alive, and is blind to most of the language.

**The rule: a stemmed pattern in any language with diacritics must use a
unicode-aware letter class**, and the pattern engine must be told to interpret
patterns in unicode mode. Two entries in the same list, one using the default
class and one using the unicode class, will disagree about the same word, and
nobody will notice because both return findings.

**4. The word boundary is ASCII too.** The same defect wearing different
clothes, and the one that survives the fix for trap three: a word-boundary
assertion is defined against the same unaccented character class, so a boundary
placed immediately after a diacritic-bearing character does not hold. A pattern
that correctly matches an accented city or an inflected stem and then closes
with a trailing boundary fails on exactly the words it was written for. The
remedy is to *end the pattern at a letter run rather than a boundary* where the
tail may be accented, and to reserve boundary assertions for positions that are
provably ASCII — chiefly the front of an unaccented stem. Case-insensitive
matching needs the same treatment: folding must be unicode-aware or an accented
capital will not fold to its lowercase form.

## Procedure

1. **Detect the document's language from the document**, not from the reader's
   interface. A posting is a document with a language of its own; the lint that
   applies to it is the one for that language. Per [meaning does not live in a
   label](../../_laws.md#meaning-does-not-live-in-a-label), rules key off a
   stable language identity on the record, never off a display setting that
   happens to be in front of a user.
2. **Build one list per supported language**, sourced natively, capped at the
   highest-frequency offenders so the signal stays high.
3. **Write stemmed, unicode-aware, case-insensitively-folded patterns** with a
   boundary at the front and a letter run at the back. The front boundary is
   what stops a stem matching inside a longer unrelated word; the open letter
   run at the back is what lets the ending vary — and, per trap four, is what a
   trailing boundary would have broken.
4. **Test every pattern against real inflected text**, including the accented
   forms specifically. A test corpus of one sentence per pattern, containing at
   least one diacritic-bearing inflection, catches the entire class-three trap
   at review time instead of a year later.
5. **Report an unsupported language explicitly.** When a posting's language has
   no list, the check must say *not checked in this language*, not return an
   empty finding set.

## Decision rules

- **A language with no list returns "not checked", never "clean".** Per
  [absence of evidence is not
  evidence](../../_laws.md#absence-of-evidence-is-not-evidence), a check that
  did not run may not render as a pass. This single state is the difference
  between a lint that degrades honestly and one that lies by omission.
- **Use a unicode letter class in every stemmed pattern, in every language,
  including the ones without diacritics.** Uniformity costs nothing and
  prevents the next language's list from inheriting the trap by copy-paste.
- **Prefer a shorter list per language over a translated long one.** Fifteen
  native offenders beat two hundred translated ones, both in findings that
  land and in maintenance.
- **When a phrase is offensive in one language and neutral in another, the
  lists diverge, and that is correct.** Do not force parity between lists;
  parity is a symptom of translation, and translation is what produces the
  patterns nobody writes.
- **Never machine-translate the posting to run one list over everything.** The
  translation changes the phrasing, which is the object under test. Findings
  against a translation are findings against text that does not exist.

## When not to use it

- **Not stemming where the language does not inflect.** In a largely
  uninflected language a stemmed pattern buys nothing and costs false
  positives; use whole-phrase word-boundary matches.
- **Not stemming very short roots.** A three-letter stem plus an open letter
  run matches half the dictionary. Where a language's morphology forces a short
  stem, enumerate the forms explicitly instead.
- **Not as a substitute for a native reviewer when a market is opened.** The
  list for a new language is drafted by someone who writes advertisements in
  it, and reviewed against real postings from that market, before the check is
  trusted enough to be shown to writers.
