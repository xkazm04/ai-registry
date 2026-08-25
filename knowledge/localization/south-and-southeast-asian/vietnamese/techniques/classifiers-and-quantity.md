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

Vietnamese has no plural morphology and CLDR reflects that exactly: locale vi has
one plural category, **`other`**, for both cardinals and ordinals (CLDR language
plural rules). This makes the message-format side of quantity trivial — one branch,
noun never changes — and moves the entire difficulty into syntax: what stands
*between* a numeral and its noun, and what marks plurality when no numeral is
present. Translators arriving from European locales solve the problem they no
longer have and miss the one they gained.

## VI-PLURAL-OTHER · one plural branch, and it must still be written

**Trigger:** any source string with a plural block; any count interpolation.
**Rule:** a vi plural block contains exactly the `other` branch. Do not replicate
the source's one/other split with identical text in both branches (it doubles
maintenance for nothing) and do not delete the plural syntax to a bare string if
the format system distinguishes the two — the skeleton stays
([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)).
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

Ordinals (thứ nhất, thứ hai — "thứ + numeral", with nhất/tư as irregulars for 1st
and 4th) and dates are formatting-library territory; only hardcoded ordinal text in
translatable strings needs the rule. And do not retrofit classifiers into settled
UI noun labels that are not being counted — a menu entry Tệp needs no classifier;
the classifier system activates at quantification, not at every noun.
