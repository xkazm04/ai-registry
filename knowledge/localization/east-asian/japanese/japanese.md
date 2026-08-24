---
layer: golden-path
type: golden-path
subject: japanese
status: forged
use_when: [translating or auditing a product catalog into Japanese, deciding register for Japanese UI text, reviewing Japanese strings for translationese, planning layout or length budgets for a Japanese locale]
techniques:
  - register-and-politeness
  - character-width-and-typography
  - counting-and-quantity
  - de-anglicization-constructions
  - terminology-and-katakana-loanwords
  - ui-conventions-and-length
---

# Japanese (ja)

Japanese is the locale where a translation betrays itself without a single wrong
word. The grammar is forgiving — no gender, no plural inflection, no agreement
cascades — so a mechanical pass produces strings that are grammatically fine and
still unmistakably translated: the pronoun English forced is still there, the
plural branch English needed is still there, the half-width comma English typed
is still there. Localizing into Japanese is less about avoiding grammatical
error than about **removing the fingerprints of English**, and every one of
those fingerprints is mechanical enough to state as a citable rule.

That is the shape of this subject: Japanese quality control is unusually
automatable, because most of its defects are character-class defects (wrong
width, wrong glyph, a space that should not exist) or construction defects
(a pronoun, a plural suffix, a bare number without its counter) that a reviewer
— human or agent — can find by pattern and cite by anchor. The judgment calls
that remain are few and well-bounded: register, loanword rendering, and where a
label stops being a label and becomes a sentence.

## The register system, and how a product chooses within it

Japanese sentence endings encode the social relationship between writer and
reader. For product UI the live choice is between 敬体 (the です・ます polite
style) and 常体 (the plain だ・である style) — and for software addressed to a
user, the choice is already made: **です・ます for every full sentence that
addresses or informs the user**. This holds for consumer and B2B products alike;
what varies between them is not the ending but the temperature around it — a
consumer product allows softer hedges and the occasional exclamation, a
professional tool stays flat and declarative. 常体 belongs to documentation
written as reference prose, log lines, and marketing copy that deliberately
performs boldness; it is never the default for strings a user reads inside a
running product. Beyond です・ます lies 敬語 proper — honorific (尊敬語) and
humble (謙譲語) forms. Product UI uses a thin, conventional slice of it
(ください, ございます in set phrases) and no more; a UI that escalates into full
honorific keigo reads as a bank letter, and one that drops below です・ます
reads as either a toy or a threat.

The register system has a second axis English lacks entirely: **most UI text is
not sentences**. Buttons, menu items, tab names, and headings use 体言止め
(noun-ending) or the bare dictionary-form verb — 保存, 閉じる, 設定 — with no
polite ending and no punctuation. This is not a register downgrade; it is a
different text category with its own convention, and pasting します or
してください onto a label is one of the most reliable translationese signals in
the language. The boundary between the two categories — sentence text gets
です・ます, label text gets noun/dictionary form — is the single most-cited rule
pair in any Japanese review pass. See register-and-politeness.

## What makes a Japanese string smell translated

Four constructions do most of the damage, and all four are English grammar
surviving the crossing:

1. **The pronoun that should not exist.** Japanese omits subjects and
   possessors that context supplies, and in UI text context supplies almost
   everything. あなた ("you") is grammatical and almost always wrong — a
   shipped string dense with あなたの is the surest translationese marker
   Japanese has.
2. **The plural machinery that has no target.** Japanese nouns do not inflect
   for number; CLDR gives Japanese the single category `other`, for cardinals
   and ordinals alike. Every plural branch in a source string collapses to one
   Japanese string — and a translator who instead copies the branching syntax
   ships visible raw braces.
3. **The bare number.** Counting in Japanese runs through counter words
   (助数詞); "3 personas" as a bare numeral-plus-noun is a calque of English
   bare-plural grammar. The counter is not decoration — omitting it is the
   number-grammar equivalent of a missing article in English.
4. **The English clause order kept out of caution.** Particles, not position,
   carry role in Japanese, so placeholders must move to where the particle
   structure wants them — and the particle chosen must fit what the placeholder
   will contain at runtime.

These are all rule-shaped, all citable, and all covered in
de-anglicization-constructions and counting-and-quantity.

## Script, width, and the typography contract

Japanese runs in three scripts at once (kanji, hiragana, katakana) plus
embedded Latin and digits, **with no spaces between words**. That single fact
drives most of the typography rules: word boundaries are invisible, so line
breaking is character-class-driven (禁則処理 — the prohibition rules on what
may start or end a line, specified publicly in the W3C's Japanese text layout
requirements), and the width of every character matters twice — once as an
encoding question (full-width vs half-width code points are different
characters) and once as a rendering question (a full-width glyph occupies
roughly twice the horizontal space of a Latin letter).

The encoding half is pure rule: Japanese punctuation in Japanese prose is
full-width (。、（）「」), embedded Latin and digits are half-width, and the
full-width Latin look-alikes (Ａ, １) are defects on sight. The boundary
between a Japanese run and a Latin run — space or no space — is the one
question the public authorities answer differently, so it is decided once per
product and enforced as a house constant, not improvised per string. See
character-width-and-typography.

## Loanwords: the axis where Japanese has a real style choice

Katakana borrowing is productive and unbounded — any English term *can* be
transliterated — which means the loanword decision is where Japanese
localization actually exercises judgment. The load-bearing distinctions:

- **Katakana vs native kanji** is roughly a register-of-vocabulary choice:
  katakana reads as current, technical, spoken-by-practitioners; a kanji
  compound reads as considered and precise. A workable heuristic exists (things
  users manipulate borrow well; processes and judgments translate better), but
  whatever the heuristic, the ruling is made **once per term** and recorded —
  the same concept oscillating between katakana and kanji across a catalog is
  a defect even when both renderings are individually fine.
- **The chōonpu (ー) question** — コンピュータ or コンピューター — is not
  taste; it is two published authorities disagreeing (the JIS technical-writing
  tradition omits the final long vowel on longer words, the Cabinet
  Notification and the vendors that follow it write it out), and a catalog
  must pick one convention and hold it.
- **Katakana false friends** exist: a transliteration can carry a different
  dominant sense in Japanese than its English source (a "promote" borrowed as
  プロモート reads as advertising). The fix is a native compound, and each such
  finding is worth a permanent termbase row.

See terminology-and-katakana-loanwords.

## Length: shorter in characters, not in pixels

Japanese translations usually *shrink* relative to English — kanji compounds
are dense (a four-character compound routinely replaces a ten-letter English
word) — which makes Japanese the rare locale where truncation is not the
default fear. The trap is converting that character saving into a pixel
assumption: full-width glyphs are ~2× the width of Latin letters, so a string
half as long in characters can be equally wide on screen. Layout planning for
Japanese is therefore about rendered width, line-height (CJK glyphs want more
vertical room than Latin at the same point size), and wrap behavior (no spaces
means text can wrap anywhere the kinsoku rules allow — which is a feature, but
only if the rendering layer applies those rules). Japanese also resists
abbreviation: kanji compounds are already near minimal, and inventing a
clipped form to fit a column produces a typo, not a shorter word. See
ui-conventions-and-length.

## How this subject is used in review

Every rule in the techniques carries a stable `JA-*` identifier, because the
reader that matters most is an audit pass that must type its findings — a
finding that cites `JA-DESU-MASU` or `JA-COUNTER` is a defect, and a finding
that cites nothing is taste. The rules are written trigger-first so a smaller
model can recognize the pattern without holding the whole language: most
Japanese defects are findable by character class and construction shape, which
is exactly what makes bulk review of this locale cheap when the anchors exist
and hopeless when they do not.

What this subject deliberately does not own: any product's termbase (which
concepts render as which katakana or kanji), its do-not-translate list, its
choice on the contested conventions this subject flags as house constants
(the Latin-boundary space, the chōonpu convention), and its format contract.
Those live with the product; this subject teaches what the decision is, what
the public authorities say, and why it must be made once rather than per
string.
