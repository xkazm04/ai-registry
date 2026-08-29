---
layer: technique
type: technique
subject: hindi
technique: gender-and-agreement
status: forged
laws: [format-skeleton-is-inviolable, one-concept-one-rendering]
shared_with: []
use_when: [assigning gender to a loanword, phrasing strings with interpolated placeholders, mapping plural messages to CLDR categories for Hindi]
---

# Gender and agreement

Hindi marks two genders on verbs, adjectives, participles, and possessives, and
declines nouns for the oblique case before every postposition. None of this is
exotic — it is the same agreement work European gendered locales do — but two
software-specific collisions make it a technique: English loanwords arrive with
no gender and must be assigned one, and interpolated placeholders take values
the translator never sees, in case slots the grammar cares about.

## HI-LOANGENDER · every loanword gets one gender, recorded once

**Trigger:** a new English borrow enters the catalog; two strings disagree on a
loanword's agreement (फ़ाइल सहेजा गया vs फ़ाइल सहेजी गई).

**Rule:** assign the gender when the term enters the termbase, and record it
there as a fact beside the rendering — gender is part of the rendering under
[one concept, one rendering](../../../_laws.md#one-concept-one-rendering).
The assignment heuristics, in order: (1) established usage wins — फ़ाइल is
feminine, कंप्यूटर masculine, ईमेल masculine in most shipped corpora — check a
corpus before ruling; (2) analogy with the native near-synonym pulls the borrow
toward that gender (फ़ाइल ~ चिट्ठी f.; रिपोर्ट f. ~ ख़बर f.); (3) endings that
read feminine in Hindi (-ई, and often English -y/-ee transliterated as -ी) pull
feminine; (4) otherwise **default masculine** — the productive default for
borrows. A wrong-but-consistent assignment is a style debt; an inconsistent one
is an error factory, because every participle and adjective in every string
containing the word takes a side.

**Exception:** a handful of borrows are genuinely variable across speakers
(ईमेल, कार as m./f. in the wild). The termbase still picks one; "speakers vary"
licenses the choice, not the variance.

## HI-AGREE · agreement runs through the whole sentence

**Trigger:** reviewing perfective verbs, passives, and adjectives near any
gendered noun; MT output with default-masculine everywhere.

**Rule:** the gender and number of the governing noun surface on adjectives
(अच्छा/अच्छी/अच्छे), on perfective participles (सहेजा/सहेजी/सहेजे), on the passive
auxiliary (सहेजी गई vs सहेजा गया), and on possessives (आपका/आपकी/आपके agree with
the possessed noun, never with आप). The audit heuristic that pays: find the
feminine termbase nouns (फ़ाइल, रिपोर्ट, सूची, सेटिंग…) and check every string
containing them — MT output defaults masculine, so feminine nouns concentrate
the agreement defects. In perfective transitive clauses the ergative ने
construction flips agreement to the *object*: आपने फ़ाइल सहेजी है (verb agrees
with feminine फ़ाइल, not with आप) — the single most common human-translator slip
under English influence, because English keeps the verb glued to the subject.

## HI-OBLIQUE · phrase around placeholders that land before postpositions

**Trigger:** any string interpolating a name, title, or noun placeholder
adjacent to ने, को, से, का, में, पर, के लिए.

**Rule:** a noun before a postposition stands in the oblique case, and oblique
marking changes some noun forms (लड़का → लड़के को) and all agreement around them —
but a placeholder's value arrives at runtime and cannot decline. Shape the
string so the frozen placeholder is grammatical for *any* value:

- **Proper names are safe** — Hindi proper nouns do not visibly decline, so
  `{name} ने टिप्पणी की` and `{name} को भेजें` are correct for every name. The
  placeholder token itself stays byte-identical per
  [the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable);
  its *position* moves to where the postposition grammar wants it — that move is
  required, not permitted.
- **Common-noun placeholders are not safe.** If `{item}` can be a Hindi common
  noun or a phrase, `{item} को हटाएँ` risks an oblique mismatch. Restructure to
  put the placeholder in a quoting frame that suspends declension: "{item}" को
  हटाएँ, or a colon frame (हटाएँ: {item}) — the quotation mark is doing grammar,
  not decoration.
- **Never split honorifics or gender into the placeholder's surroundings** — a
  gendered participle agreeing with an unknown `{user}` (सहमत हुए/हुई) cannot be
  written correctly; choose a construction that avoids agreement with the
  placeholder (masculine-plural honorific agreement हुए is the conventional
  neutral, or restructure to an agentless nominal).

**Exception:** when the source system provides gender/case-aware message
variants (a select on a gender argument), use them instead of neutralizing —
neutral phrasing is the fallback, not the ideal.

## HI-PLURAL · CLDR one/other, and zero belongs to one

**Trigger:** wiring plural messages; auditing count-bearing strings; an empty
state showing a plural form with 0.

**Rule:** CLDR gives Hindi two cardinal categories, with the rule for one being
`i = 0 or n = 1` — so **0 and 1 both take the one form**: 0 फ़ाइल, 1 फ़ाइल,
2 फ़ाइलें. A pipeline that assumes the English mapping (0 → other) ships a
number-agreement error on every zero state; conversely a reviewer "fixing"
0 फ़ाइल to the plural is reverting correct CLDR behavior. Two legitimate-looking
oddities to leave alone: (1) Hindi often leaves a counted noun unmarked after a
numeral (5 एजेंट is fine; the -ें/-याँ plural is required in *unquantified*
plurals: फ़ाइलें सहेजी गईं), so one and other variants of a message may be
textually identical — correct, not lazy; (2) the oblique plural takes -ों before
postpositions (फ़ाइलों को हटाएँ), which no *plural category* names — but it is
not unnamed: CLDR carries it on an orthogonal **case** axis (nominative/oblique)
and publishes the inflected forms crossed with count. Where a runtime exposes that
axis the translator need not smuggle the oblique inside a plural branch; where it
does not, they must, and the technique's guidance below applies.

**The zero rule is wider than "0 and 1", and this is the half to get right.** The
condition is a disjunction on the **integer part** (`i = 0`), not on the value, so
**every count whose integer part is zero takes the one form** — 0.5, 0.9, 0.04 all
select `one`, and CLDR's published samples for the category say so explicitly.
Only fractions at or above 1 fall to other (1.5 घंटे). A Hindi `one` branch must
therefore read correctly at 0, at 1 **and** at 0.5 — which is a stricter authoring
constraint than "the empty state plus the singular". Ordinals have their own
five-way CLDR split (1ला, 2रा, 4था, 6ठा, 5वाँ…) — if the product renders ordinals
from data, use the ordinal categories, never string-append वाँ.

**The ordinal set looks arbitrary and is not: it is a suffix inventory.** The
categories land on 1, 2–3, 4 and 6 because पहला, दूसरा/तीसरा, चौथा and छठा are
suppletive and each needs its own form, while -वाँ is regular from 5 onward. That
is why 6 earns a category and 5 does not — a fact worth carrying, because it also
tells a reviewer that the set is closed and will not grow.

**One exemplar above cannot be sourced from the locale data.** CLDR's own published
minimal pair for the `few` category ships with **no ordinal suffix at all** — the
-था of चौथा is simply absent, identically across three releases. So `4था` is
correct Hindi and is the single ordinal form a product must supply from its own
knowledge rather than lift from the standard. Do not "correct" it to match the data.

**Source:** CLDR plural rules for hi (cardinal: one `i = 0 or n = 1`; ordinal:
one/two/few/many/other).

## When not to use this

Gender assignment is not a vocabulary decision — whether the word should be a
loanword at all is terminology-and-loanwords' question; this technique starts
after the rendering is chosen. And do not audit agreement inside pass-through
material (user content, quoted text): the product's grammar contract covers the
product's own voice.
