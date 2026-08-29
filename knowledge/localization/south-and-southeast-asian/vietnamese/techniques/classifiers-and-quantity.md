---
layer: technique
type: technique
subject: vietnamese
technique: classifiers-and-quantity
status: forged
laws: [the-source-locale-is-the-source-of-truth, format-skeleton-is-inviolable]
shared_with: []
use_when: [translating strings with interpolated counts into Vietnamese, writing or auditing plural blocks in a vi catalog, choosing classifiers for counted nouns]
---

# Classifiers & quantity

Vietnamese has no plural morphology, and the *cardinal* side of CLDR has long
reflected that exactly: locale vi carries the single category **`other`**. Two
things qualify that, and both are load-bearing.

**Ordinals have never been single-category.** vi has carried an ordinal `one` for
over a decade, because the ordinal series is suppletive at 1 — *thứ nhất*, not
*\*thứ một* — and the selector is where that irregularity has to live. A technique
that treats "no plural morphology" as "no plural categories anywhere" is wrong on
the ordinal file, and has been for as long as the file has existed.

**The cardinal answer has an expiry.** CLDR 49 moves vi into the `i = 0 or n = 1`
group, giving it a singular category that also covers zero. Check the CLDR release
your stack actually ships before assuming either answer.

Neither of those is plural morphology arriving in Vietnamese — the noun still never
changes. What a second category carries is *agreement downstream of the count*, not
inflection of the counted thing (see VI-PLURAL-OTHER). The bulk of the difficulty
remains where it always was: in syntax — what stands *between* a numeral and its
noun, and what marks plurality when no numeral is present. Translators arriving from
European locales solve the problem they no longer have and miss the one they gained.

## VI-PLURAL-OTHER · one plural branch, and it must still be written

**Trigger:** any source string with a plural block; any count interpolation.
**Rule:** a vi plural block carries the catch-all branch, plus — on a CLDR release
that gives vi a singular category — a singular branch **only where the string needs
one**. The test is not "did the source have a plural block"; it is **does this
string refer back to the thing it counted**. A bare count string says the same words
whatever the number (`{count} tệp`), and duplicating it doubles maintenance for
nothing. A string that pronominalises what it counted is different: Vietnamese
distinguishes singular from plural anaphora — *nó* against *chúng* — so there the
two branches differ by exactly that word, and collapsing them loses a real
distinction. Never delete the plural syntax down to a bare string if the format
system distinguishes the two — the skeleton stays
([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)).
**Where a singular category exists it includes zero** (`i = 0 or n = 1`), so such a
branch must read correctly at a count of 0 — or the zero case needs its own
exact-value branch rather than being left to it.
The noun inside is invariant: 1 tệp, 5 tệp, never a pluralized loanword
(5 files → 5 tệp, and a borrowed noun is equally invariant: 3 workflow, not
3 workflows, once the loan is adopted as a Vietnamese noun).
**Corollary:** English source tricks for dodging plurals ("file(s)") have no
Vietnamese reflex — translate to the plain invariant form and note the source
string can be simplified.

## VI-CLASSIFIER · counted nouns take their classifier

**Trigger:** a numeral — literal or interpolated — directly quantifying a noun.
**Rule:** insert the classifier the noun takes: numeral + classifier + noun.
The load-bearing ones for UI text:
- **cái** — general-purpose inanimate; the safe default for objects.
- **chiếc** — individual manufactured items (devices, vehicles); overlaps cái,
  slightly more formal/literary.
- **con** — animate beings, plus a closed idiomatic set of inanimates (con dao,
  con đường, con chip — usage extends to some tech artifacts colloquially).
- **quyển / cuốn** — bound volumes; **tờ** — sheets; **bức** — flat rectangular
  items (pictures, walls, letters).
- Abstract and unit-like nouns count bare: 3 ngày, 5 lần, 2 trang — no classifier,
  because the noun is itself the measure.
Sino-Vietnamese compound nouns in software (tệp, mục, thông báo, tài khoản)
mostly count bare or with cái; when unsure, the bare form is the smaller error
in UI register — a wrong classifier is marked, a missing one is terse.
**The audit edge:** an interpolated `{count} X` string can only be classified
correctly if the translator knows what X is. A placeholder whose referent is
ambiguous in source ("{count} items" covering files in one screen and members in
another) is a **source defect** — surface it per
[the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth),
do not guess a classifier that will be wrong on one of the two screens.

## VI-PLURAL-MARK · các/những mark plurality, not agreement

**Trigger:** plural reference without a numeral — "your files", "settings",
"all agents".
**Rule:** the bare noun is number-neutral and often sufficient (Cài đặt for
"Settings"). **các** marks a definite, complete plurality ("the files" — all of
them in view): các tệp của bạn. **những** marks an indefinite or contrastive
subset ("some/those files that…") and usually wants a following qualifier:
những tệp chưa lưu. Choose by meaning, not by the presence of an English -s.
Two hard prohibitions: never stack a plural marker onto a counted noun
(5 các tệp is ungrammatical), and never add các/những reflexively to every
plural source noun — Vietnamese headers and labels read best bare, and a catalog
that mirrors every English plural with các reads translated at a glance.

## VI-NUMFORMAT · quantities format Vietnamese-style

**Trigger:** numbers, ranges, units in vi strings.
**Rule:** decimal comma, period thousands separator (1.526,75) — Microsoft
Vietnamese style guide, punctuation section. Platform-formatted placeholders
already do this from locale data; the rule exists for numbers embedded in
translatable text and for reviewers who would "correct" 1.526 back to English
formatting. Keep the numeral with its unit and classifier on one line — the
wrapping mechanics are owned by ui-conventions-and-length, but the quantity
phrase is the case that most often needs the protection.

## When not to reach for this technique

Dates and number formatting are formatting-library territory. **Ordinals are not
simply out of scope**: vi carries an ordinal singular category precisely so the
suppletive first has somewhere to live (thứ nhất, with tư for 4th), so an ordinal
selector in a vi catalog is real and its singular branch is load-bearing — the
rule above applies to it rather than skipping it. What stays outside is hardcoded
ordinal text in translatable strings, which needs the syntax and classifier rules
rather than a plural block. And do not retrofit classifiers into settled
UI noun labels that are not being counted — a menu entry Tệp needs no classifier;
the classifier system activates at quantification, not at every noun.
