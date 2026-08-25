---
layer: technique
type: technique
subject: bengali
technique: classifiers-and-quantity
status: forged
laws: [format-skeleton-is-inviolable]
shared_with: []
use_when: [translating or auditing strings with counts and plural categories, choosing a Bengali classifier for a counted noun, reviewing plural-suffix use in singular-category strings]
---

# Classifiers and quantity

Bengali cannot put a bare number next to a noun. Between them sits a
**classifier** — a small suffix on the numeral that categorizes what is being
counted — and it is mandatory grammar: ৩টি ফাইল ("3 files"), never ৩ ফাইল.
Dropping the classifier is the single most reliable machine-translation tell in
Bengali, because no fluent writer omits it and no naive word-for-word pipeline
produces it.

The working inventory for UI text is small:

| classifier | counts | register | UI use |
|---|---|---|---|
| -টি | things, neutral | formal/written | the software default |
| -টা | things, neutral | colloquial | avoid in আপনি-register UI |
| -জন | people | neutral | users, members, reviewers |
| -খানা | flat or whole objects | somewhat colloquial | rare in UI; documents, sheets |

## BN-CLASSIFIER · a counted noun takes a classifier

**Rule.** Every construction of number + noun gets a classifier on the number:
**-টি** for things in formal UI copy, **-জন** for people. -টা is grammatical but
colloquial — inconsistent with the আপনি register this bundle's Bengali defaults
to — and -খানা/-খানি belong to specific object classes a UI rarely counts; when
in doubt, -টি is never wrong for a thing and -জন never wrong for a person.

**Second job: definiteness.** The same morphemes suffixed to the *noun* mark
definiteness: ফাইলটি "the file", এই পার্সোনাটি "this specific persona". This is
how Bengali renders English "the/this X" pointedly without any article — use it
in confirmations that name their object (এই ফাইলটি মুছবেন?), and do not mistake
a noun-attached টি for a counting error.

**Exception.** Measure words and units count without a classifier (২৪ ঘণ্টা "24
hours", ৫ মিনিট) — units are their own classifier. Do not "fix" ২৪ ঘণ্টা to
২৪টি ঘণ্টা; that over-application reads as foreign in exactly the way the
missing classifier does elsewhere.

## BN-CLGLUE · glued to the number, one script, skeleton intact

**Rule.** The classifier attaches *directly* to the numeral or the placeholder
with no space: ৩টি, {count}টি, ৫জন — never `{count} টি`. Three consequences:

- With a placeholder, the classifier sits hard against the closing brace. The
  placeholder name inside the braces is
  [skeleton](../../../_laws.md#format-skeleton-is-inviolable) and never changes;
  the classifier is target-language text and lives outside.
- The numeral and any literal digits obey one script per token: ১টি, never 1টি
  (a shipped, observed bug class — Latin digit fused to a Bengali suffix).
- A runtime-injected count arrives in whatever script the runtime formats;
  the classifier glued after it is correct either way, so never pre-render a
  digit into the string to control its script.

**Trigger.** Mechanical: whitespace between a digit-or-brace and a classifier
morpheme; a Latin digit directly adjacent to Bengali script in one token.

## BN-PLURALONE · CLDR "one" includes zero — write for both

**Rule.** CLDR gives Bengali cardinals two categories, **one** and **other**,
and the *one* rule is `i = 0 or n = 1`: **a count of 0 selects the singular
category**, as do fractions below 1. Whatever plural mechanism the stack uses —
message-format plural branches or per-category keys — the "one" string must
read correctly when the count is 0, not just 1. Write it count-carrying
({count}টি ফলাফল) rather than hardcoding "১টি", unless the surrounding product
convention separately guarantees an explicit zero branch; a hardcoded ১ shown
against a real count of 0 is a lie the grammar was warning you about.

**Source.** CLDR plural rules for bn (cardinal: one, other). Bengali ordinals
have a richer five-way CLDR split (one/two/few/many/other) — relevant only if a
product renders ordinals ("1st", "2nd") through plural categories, which UI
copy should generally avoid by rephrasing.

## BN-PLSUFFIX · no plural suffix on a counted or singular-category noun

**Rule.** Bengali marks nominal plurality with গুলো/গুলি (things) and রা/দের
(people) — but plural marking is *optional and usually wrong when a number is
present*, because numeral + classifier already states the quantity. ৩টি
বার্তাগুলো is doubled marking; ৩টি বার্তা is correct. The audit-sharp corollary:
a plural suffix inside a **one**-category string is a contradiction on its face
(the count there is 0 or 1), observed in real catalogs as `{count}টি নতুন
বার্তাগুলো` in a singular key — the classifier stays, the suffix goes.

**When গুলো is right.** Uncounted definite plurals: সেটিংসগুলো ("the settings"),
ফলাফলগুলো ("the results") as a heading over a list with no number in the
string. There, it is doing the work the English definite plural does.

**Trigger.** গুলো/গুলি/রা/দের co-occurring with a numeral, a count placeholder,
or a singular plural-category context.

## When not to over-apply

Classifier rules govern counting and definiteness, not every number-adjacent
string. Version numbers, IDs and codes take no classifier (they are names, not
quantities — see BN-DIGITS for their script). And generic bare plurals in
headings ("Files", "Agents") need neither classifier nor গুলো — the bare noun
covers the generic plural reading in Bengali, and decorating every heading with
গুলো is its own translated-smell.
