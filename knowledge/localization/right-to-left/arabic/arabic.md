---
layer: golden-path
type: golden-path
subject: arabic
status: forged
use_when: [translating or auditing an Arabic UI catalog, reviewing RTL rendering of interpolated strings, choosing register and address for Arabic software copy, deciding numeral and plural handling for an ar locale]
techniques:
  - register-and-address
  - bidirectional-text-and-interpolation
  - plural-and-count-agreement
  - script-and-typography
  - de-anglicization-constructions
  - terminology-and-loanwords
---

# Arabic (ar)

Arabic is the locale where three hard problems most fleets meet only once arrive
at the same time: a right-to-left script sharing every string with left-to-right
placeholders, the richest plural system in the CLDR (all six categories, live),
and a diglossic register situation where the language people speak is not the
language software is written in. A localizer who has shipped French or German
brings almost no transferable instinct here; a localizer who has shipped Hebrew
brings half of one. The craft below is what any product shipping `ar` needs
regardless of what the product is.

## One written language, many spoken ones

Software Arabic is **Modern Standard Arabic** (فصحى, fuṣḥā) — the shared written
register of every Arabic-speaking market — never a spoken dialect (عامية).
This is not a stylistic preference but the mechanism that lets one `ar` catalog
serve twenty-plus countries: MSA is what every literate user reads daily in
news, books, and every major OS vendor's Arabic UI, while Egyptian, Levantine,
Gulf and Maghrebi colloquials are mutually divergent and register-marked. A
dialect word in a UI string reads the way slang reads in a legal document. The
per-market variation that IS legitimate — numeral system, occasionally a
regional term — is a per-locale setting decision, not a register decision; the
prose stays MSA everywhere. The Microsoft and Mozilla Arabic style guides both
open with this rule, and it is the single anchor an audit cites most often
against machine output trained on social-media Arabic.

MSA's address problem is real and settled: Arabic conjugates the second person
for gender and number and has **no gender-neutral second-person form**. The
industry-wide convention is masculine singular as the unmarked default for
direct instructions, with gender-avoiding strategies — the verbal noun (masdar)
on controls, the impersonal passive on status copy — carrying most of the UI so
that explicitly gendered verbs appear only where a full-sentence instruction
needs them. A product may choose a costlier gender-neutral strategy; what it may
not do is mix forms, because a catalog that says اختر in one screen and اختاري
in the next reads as two different products. See register-and-address.

## Direction is a rendering property; the string is logical order

Everything about RTL that goes wrong goes wrong at one seam: an Arabic string
holding left-to-right material — a placeholder resolving to a Latin name, a
number, a file path, a brand, a code literal. The Unicode bidi algorithm
(UAX #9) resolves the display order at render time from the string's *logical*
order, and it resolves the common cases correctly; the craft is knowing which
cases it cannot resolve and what to do there.

The load-bearing facts a layout engineer and a translator both need:

- The string is stored in logical (reading) order. Nobody types characters
  backwards, and nobody pre-mirrors paired punctuation — `(` and `)` are typed
  in the same logical order as English and mirrored by the renderer. A
  translator who "helpfully" swaps them ships doubly-mirrored parentheses.
- Neutral characters (spaces, punctuation, `%`, `/`) between an LTR run and an
  RTL run take their direction from context, which is exactly where trailing
  punctuation ends up on the wrong side of a Latin run. The modern fix is a
  **directional isolate** (U+2066–U+2069) around the embedded value; the legacy
  fix is an LRM/RLM mark at the seam. Isolates are preferred because they also
  protect the *surrounding* text from the embedded value.
- A string-level diff cannot show any of this. Two byte-identical-looking
  strings can render differently by an invisible character, and a visually
  broken string can be byte-correct. Arabic review therefore has a rendered
  pass that no other lane in the fleet needs, checking things a diff is
  structurally blind to. See bidirectional-text-and-interpolation.

Concatenation — already a defect in every locale — is worse in Arabic, because
gluing an LTR fragment to an RTL fragment at runtime creates a bidi seam the
translator never saw and cannot fix. A source string built from fragments is a
source defect to escalate, not a puzzle to solve locale-side.

## Six plural categories, and all of them are load-bearing

Arabic uses every CLDR plural category: **zero, one, two, few, many, other**
(per CLDR: 0 → zero, 1 → one, 2 → two, n % 100 in 3–10 → few, n % 100 in 11–99
→ many, else other). These are not ceremonial variants of one sentence — they
select different noun forms required by Arabic grammar: the **dual** (كتابان,
"two books") is a morphological number English does not have; 3–10 takes the
plural noun; 11 and up takes the *singular* again. A catalog whose message
format is frozen to `one`/`other` is therefore not merely unidiomatic — it is
**structurally unable to be grammatical**: there exists no single "other" string
that agrees with 2, 5 and 15 at once. That freeze is a source-format defect, the
most expensive one an Arabic locale inherits, and the honest mitigations when it
cannot be fixed are known and ranked. See plural-and-count-agreement.

## Script and typography

Arabic script is cursive and has no letter case, which deletes two English
instincts (Title Case, ALL-CAPS emphasis) and creates two new hazards:
letter-spacing and justification-by-stretching (kashida) break the script's
joining behavior and are banned in UI text. The casing *analog* that replaces
Title Case is the definite-article convention: navigation and section labels
take الـ, action controls drop it.

The numeral question — Western `0-9` versus Eastern Arabic-Indic `٠-٩` — is the
one genuinely per-market decision: CLDR defaults most `ar` locales to
Arabic-Indic digits with the Maghreb on Western, while most software products
override to Western digits everywhere. Either answer is defensible; what is a
defect is mixing them, or letting machine translation flip a product's settled
choice string by string. Diacritics (tashkil) are off by default in UI prose,
with a narrow, deliberate exception for words whose bare skeleton genuinely
misleads. Punctuation is the Arabic set — comma `،`, question mark `؟`,
semicolon `؛` — inside Arabic prose, Latin punctuation inside embedded code and
URLs. See script-and-typography.

## What makes an Arabic string smell translated

The tells are consistent enough to enumerate, and every one has an anchor:

- **English word order kept out of caution** — subject-first declaratives where
  Arabic wants the verb first, of-stacks rendered as stacked مِن phrases instead
  of an iḍāfa construct, "will be lost"-style agentless futures instead of the
  natural existential lead-in. See de-anglicization-constructions.
- **Transliterated tech vocabulary** — الكاش, الداشبورد, سينك — colloquial-tech
  loans that mark the string as unedited machine output, where MSA has settled
  native terms. The inverse failure is respelling frozen Latin identifiers into
  Arabic letters. See terminology-and-loanwords.
- **A Latin plural `s` stapled to an Arabic word** — the fingerprint of a
  translator working around a missing plural variant instead of escalating it.
- **Eastern digits appearing in a Western-digit catalog** (or vice versa) — the
  fingerprint of MT "helpfully" localizing numerals.

## Length and layout

Arabic single-word labels run at or under English length — the masdar
convention keeps buttons to one word, and there is no article-and-auxiliary
overhead on a bare noun. Full sentences run roughly 15–25% longer than English,
because agreement repeats the article and gender/number marking across a noun
and everything attached to it. The budget consequence: buttons are cut, not
wrapped; sentences are given room, not telegraphed — a clipped Arabic fragment
reads worse than a slightly long complete sentence, because MSA has no
established headline-ese for UI the way English does.

Layout mirroring — that the whole UI flips, that directional icons flip while
symmetric ones don't — belongs to the product's design system, not to this
subject. What this subject owns is the string: everything a translator or an
auditing agent can get right or wrong inside the catalog value itself.

## How to read the techniques

The six techniques carry the anchored rules (`AR-…` identifiers) an audit
cites. Register-and-address and script-and-typography are where most volume
findings land; bidirectional-text-and-interpolation is the chapter to read
before touching any string with a placeholder; plural-and-count-agreement is
the chapter to read before approving any source format; the last two are the
difference between correct Arabic and Arabic that was clearly written in
English first.
