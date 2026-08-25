---
layer: golden-path
type: golden-path
subject: korean
status: forged
use_when: [localizing a product into Korean, auditing or reviewing Korean UI strings in bulk, deciding Korean register and tone for a new product surface, debugging particle or counter errors around interpolated placeholders]
techniques:
  - register-and-honorifics
  - spacing-and-typography
  - particles-and-interpolation
  - counting-and-quantity
  - de-anglicization-constructions
  - terminology-and-loanwords
---

# Korean (ko)

Korean is the East Asian language that punishes the "CJK" mental model hardest.
It is written in Hangul, an alphabet arranged into syllable blocks — not a
logographic script; it uses **spaces between words**, unlike Chinese and
Japanese; it uses **half-width Latin punctuation**, not `。`/`、`/full-width
parentheses; and its politeness system is carried by verb endings that every
sentence must choose, not by an optional honorific layer that can be bolted on.
A localizer who arrives with Japanese habits ships full-width punctuation and
spaceless text; one who arrives with European habits ships pronouns, articles'
ghosts, and particles that break on half of all placeholder values. Both
products read instantly foreign to a Korean user.

The four load-bearing facts, in the order they bite:

1. **Every sentence declares a register.** There is no neutral verb ending;
   the choice among 합쇼체 (formal polite, `-습니다`), 해요체 (polite,
   `-세요`/`-어요`), and plain/casual forms is made per sentence and read as a
   statement about the product's relationship to the user. UI copy that mixes
   registers randomly reads as multiple people of different manners speaking
   from one screen.
2. **Particles inflect on the previous word's final sound.** The topic,
   subject, object, and comitative particles each have two forms selected by
   whether the preceding syllable ends in a consonant or a vowel (은/는, 이/가,
   을/를, 과/와, and (으)로 with its own rule). With interpolated placeholders
   the right form is unknowable at translation time — this single fact
   generates the most common runtime-visible defect class in Korean catalogs,
   and it has exactly three sanctioned resolutions
   (see particles-and-interpolation).
3. **Numbers demand counters, and CLDR gives Korean one plural category.**
   A bare number cannot modify a noun; a counter word (개, 명, 건, 회…)
   mediates. Meanwhile the CLDR plural rules for Korean define only `other`,
   for both cardinals and ordinals — so a message-format plural block with
   `one`/`other` branches is dead weight at best and a source defect at worst,
   and grammatical number is simply not where Korean encodes quantity
   (see counting-and-quantity).
4. **The lexicon is triple-layered.** Native Korean, Sino-Korean (한자어), and
   loanwords (외래어) coexist with settled divisions of labor; software
   vocabulary draws heavily on the loanword layer, whose Hangul spellings are
   standardized by the National Institute of Korean Language (국립국어원) — a
   real published authority a rule can cite, and one that everyday usage
   routinely diverges from in known, listable ways (see
   terminology-and-loanwords).

## The register decision, and who makes it

The register system is the first decision of any Korean localization and the
one most worth writing down before a single string is translated, because it
cannot be retrofitted cheaply: it lives in every sentence's last syllables.

The modern product default is a **two-register mix, decided by sentence
function, applied consistently per surface**:

- **합쇼체** (`-습니다`/`-입니다`) for declaratives: status text, confirmations,
  system messages, descriptions. Trustworthy, professional, slightly formal.
- **해요체** (`-세요`/`-하세요`) for directives: instructions, hints, calls to
  action phrased as sentences. Polite but warm; this is the register consumer
  software and SaaS overwhelmingly use for anything that asks the user to act.
- **Bare noun or verb-stem forms** for chrome: buttons, menu items, tabs,
  column headers carry no sentence ending at all (저장, 취소, 닫기) — a button
  is a label, not an utterance, and giving it a full conjugated ending is a
  register error in itself.

Two registers are ruled out for product UI. 반말 (casual, `-해`/`-야`) reads as
either a children's product or contempt. `-십시오` (the formal command form)
reads bureaucratic-military; it survives in legacy enterprise software and
older vendor style guides, and its presence is now itself a signal of dated
translation — a B2B product wanting extra formality gets it by shifting more
sentences into 합쇼체 declaratives, not by resurrecting `-십시오`. The
divergence between older published authority and current usage here is real
and must be settled per product, in writing, once (see
register-and-honorifics).

Korean also **drops pronouns structurally**. There is no safe everyday word
for "you" — 당신 is marked (intimate, confrontational, or advertising-toned
depending on context) — so translated UI recovers English's subject pronouns
by omission and restructuring, never by inserting 당신. A catalog with 당신
scattered through microcopy was machine-translated and not reviewed; this is
one of the fastest single greps for translation quality in this language.

## What "smells translated" in Korean

The tell-tale constructions are predictable because they are English's
skeleton showing through Hangul:

- **Clause order preserved from English.** English states a fact, then appends
  a reason or contrast with a conjunction. Korean fuses these into one
  sentence with a connective ending (`-이므로`, `-어서`, `-지만`, `-려면`). Two
  short sentences joined by 그래서/하지만 where one connective sentence is
  natural is the number-one calque.
- **Subjects and possessives everywhere.** Every "it", "your", "this" carried
  over. Korean omits what context supplies; a faithful pronoun-for-pronoun
  translation is over-specified and stilted.
- **English passives rendered as `-에 의해` passives.** Korean has passive
  verbs but uses them far less; agentless English passives usually become
  active or intransitive constructions.
- **"Please" rendered lexically.** The politeness of "Please save…" lives in
  the `-세요` ending, not in a word; adding 제발 turns a polite request into
  desperate pleading.
- **Plural 들 wherever English has -s.** 들 is optional, pragmatic, and mostly
  for people; mechanical pluralization is a marker of raw machine output.

These are auditable constructions, each with an anchored rule
(see de-anglicization-constructions).

## Script, layout, and typography facts an engineer must know

Hangul is left-to-right, horizontally set, no bidi concerns. Each syllable
block is a full-square glyph roughly 1.5–1.8× the width of a Latin character
in common UI fonts — and because Korean drops articles and compresses verbs
into stems for labels, translated strings usually run *shorter in characters*
but not proportionally narrower in pixels. Budget by rendered width.

Line breaking: Korean text with spaces breaks at spaces, and modern layout
also permits breaks between syllables inside a word (the traditional
typesetting norm); which behavior applies is a CSS/layout-engine setting, not
a translation choice — but translators must not insert manual breaks or rely
on any particular wrap point. No hyphenation exists.

Punctuation is **half-width Latin**: `.` `,` `?` `!` `(` `)` — full-width CJK
punctuation (`。`, `、`, `（）`) is a Chinese/Japanese convention that Korean
standard orthography does not use. This regularly needs stating explicitly
because "CJK" tooling defaults and pan-Asian style guidance keep reintroducing
it. Ellipsis, quotes, terminal punctuation on labels versus messages, and
where Latin-script terms embed unchanged all carry anchored rules (see
spacing-and-typography).

## How quantity actually works

The two number systems (native Korean 하나/둘/셋 for small counts with certain
counters; Sino-Korean 일/이/삼 for dates, money, and most technical counting)
matter for choosing the right counter reading, but UI strings almost always
show Arabic numerals, which sidesteps the reading question and leaves the
counter question: `{count}개 항목` — numeral, counter attached, then the noun;
or the noun-first pattern `항목 {count}개`. Both are grammatical; noun-first
is tighter for lists and dashboards. What is never grammatical is the bare
English calque `{count} 항목`.

Because CLDR Korean has only `other`, one translated plural branch serves
every count — ranges, zero, and one included. Zero usually reads better
restructured as an existence-negation (없음 / 없습니다) than as a literal
"0개", which is a source-string design question to raise upstream rather than
patch per-locale (see counting-and-quantity).

## The relationship with the authority

Korean localization is unusually well supplied with citable public
authorities: the National Institute of Korean Language's orthography,
spacing, and loanword transliteration standards; CLDR's plural and formatting
data; and major vendors' published Korean style guides. It is equally well
supplied with settled everyday usage that contradicts them — loanword
spellings the standard prescribes but almost nobody types, spacing rules
official orthography permits both ways, register recommendations a decade
behind the products people actually use. The working posture: cite the
authority as the anchor, count the catalog before enforcing it, and when the
product deliberately sides with usage against the standard, write the ruling
down where the termbase lives so no later reviewer re-litigates it. An
un-written divergence is indistinguishable from an error, and a Korean
catalog has more standard-versus-usage divergences to manage than most
European languages ever will.
