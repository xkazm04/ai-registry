---
layer: golden-path
type: golden-path
subject: indonesian
status: forged
use_when: [localizing a product into Indonesian, auditing an Indonesian catalog for register or casing drift, deciding loanword vs native term for an Indonesian UI string, reviewing machine-translated Indonesian for calques]
techniques:
  - register-and-address
  - quantity-and-plurality
  - de-anglicization-constructions
  - terminology-and-loanwords
  - ui-conventions-and-length
---

# Indonesian (id)

Indonesian looks like the easiest major language a product will ever ship: Latin
script, left-to-right, no diacritics, no grammatical gender, no case endings, no
verb conjugation, one plural category. Every one of those absences is real, and
together they produce the characteristic Indonesian failure mode: **because the
grammar refuses so little, a bad translation is never ungrammatical — it is
merely foreign.** A German catalog full of errors breaks visibly; an Indonesian
catalog full of errors reads, to a reviewer without the craft, like Indonesian.
The defects live one level up from grammar: in register, in affix choice, in
calqued constructions, and in the loanword system — which is exactly where an
audit needs citable rules, because "this smells translated" is otherwise
unanswerable.

## Where the difficulty actually lives

**The entire register system is one pronoun.** Indonesian verbs do not inflect
for person or formality — there is no vous/tu or Sie/du verb split to keep a
translator honest. The formal/informal signal is carried almost entirely by the
second-person pronoun: `Anda` (formal, capitalized in every position by the
official spelling rules, EYD) versus `kamu` (informal) and the pronouns below it
(`kau`, colloquial `lo`/`lu`). That concentration makes the register decision
both cheap to enforce and catastrophic to drift on: one `kamu` in an
`Anda`-register product is as jarring as a `du` in a Sie-register German one,
and it is a single-token defect a grep can find. Software convention: `Anda` is
the default for anything professional, B2B, financial, or governmental;
consumer and lifestyle apps in the Indonesian market have broadly moved to
`kamu` for warmth. Either is defensible; mixing them is not. The choice is made
once, recorded, and audited — see register-and-address.

**Morphology replaces syntax as the craft surface.** What Indonesian lacks in
inflection it spends on affixation: `me-` (active verb), `di-` (passive),
`ber-`, `ter-` (stative/accidental), `-kan`/`-i` (transitivizers),
`pe-…-an`/`ke-…-an` (nominalizations). A localizer's fluency shows in choosing
the affix a UI slot wants: the control says the bare root (`Simpan`), the
progress state says the `me-` form (`Menyimpan…`), the completed state says
`ter-` or `di-` (`Tersimpan`, `Disimpan`). A catalog that puts `Menyimpan` on a
button has translated the English gerund, not the interaction — see
ui-conventions-and-length.

**Plurality is contextual, not inflectional.** Indonesian nouns have no plural
form. Plurality is expressed by a numeral or quantifier when it matters
(`dua buku`, `beberapa berkas`), by reduplication (`buku-buku`) only when it is
both load-bearing and unquantified, and by nothing at all when context already
carries it. The classic machine error runs the two together: an English plural
after a number becomes `dua buku-buku`, which is wrong — a numeral or
quantifier *blocks* reduplication. In CLDR terms Indonesian has a single plural
category, `other`, for cardinals and ordinals alike; a plural block needs exactly
one **catch-all** branch, whose spelling belongs to the format generation rather
than to the language — the older syntax mandates `other`, the current standard
mandates `*` and treats `other` as an ordinary key. Copying the source's `one`
branch into the target is dead weight, and no more than that: an unreachable
branch is inert, and dropping one is the move a strict skeleton comparator
notices. See quantity-and-plurality.

**The passive trap runs in both directions.** Formal Indonesian genuinely uses
the `di-` passive far more than English uses its passive — "file not found" is
naturally `Berkas tidak ditemukan`, and error copy that manufactures an agent
(`Sistem tidak dapat menemukan berkas`) to stay "active" reads bureaucratic and
translated. But the reverse trap is just as real: a translator who has learned
"Indonesian likes passives" and converts every English sentence mechanically
produces agentless mush where the user's own action was the point. The rule set
that separates the two, plus the relative-clause (`yang`) chains and the
calqued prepositions (`di mana` for "where" above all), is
de-anglicization-constructions — the technique that most distinguishes a
localized catalog from a fluent-but-foreign one.

**Loanwords are a two-route system, and mixing routes is the defect.** English
tech vocabulary enters Indonesian either by adapted-spelling absorption —
respelled to Indonesian orthography and thereby *becoming* Indonesian
(`aplikasi`, `fitur`, `komputer`, `dasbor`, `ekspor`, `versi`, `notifikasi`) —
or as an unassimilated borrowing kept in English (proper-noun feature names,
API-class identifiers). The national dictionary (KBBI) and the language body
behind it sanction the absorbed forms and have also minted native coinages, of
which some decisively won (`unduh`/`unggah` for download/upload) and some
decisively lost to real usage (nobody's mouse is a `tetikus`). The craft is a
per-term decision rule, not a blanket policy — and verbs are always native,
never borrowed-as-a-verb, with exactly one systemic exception (`klik`). See
terminology-and-loanwords.

## What makes a string smell translated

Ranked by how reliably each one convicts a catalog:

1. **Title Case.** Indonesian has no title-case convention at all — labels,
   buttons, and headings are sentence case, with only proper nouns and `Anda`
   capitalized mid-string. `Simpan Perubahan Anda` on a button is English
   capitalization wearing Indonesian words; token-for-token case copying is the
   single most frequent mechanical MT error in this locale.
2. **`di mana` as a relative pronoun.** "A page where you can…" calqued as
   `halaman di mana Anda dapat…`. Natural Indonesian uses a purpose phrase
   (`halaman untuk…`) or `tempat` when a locative relative is truly needed.
3. **Reduplication after a numeral or inside a counted placeholder string.**
4. **Register mixing** — one string's `kamu` against a catalog of `Anda`, or a
   `-mu` clitic surviving in a formal-register product.
5. **Raw English where an absorbed form exists** (`Dashboard` for `dasbor`,
   `Download` for `unduh`) — reads as laziness, not borrowing.
6. **Missing sentence particles English never hints at**: fluent Indonesian
   spends small words (`yang`, `untuk`, `dengan`, `akan`, `sudah`/`telah`)
   English omits or contracts; copy that drops them all is compressed telegraphese.

## What a layout engineer must know

Unmodified Latin script, LTR, no diacritics in standard spelling, ordinary
ASCII word-spacing — no bidi work, no CJK metrics, no French-style punctuation
spacing. Length expansion is gentle but real: short labels run at or under
English (absorbed nouns are compact — `Eksekusi`, `Notifikasi`), full
sentences run roughly 10–15% longer because of the grammatical small words
above; budget narrow surfaces for that asymmetry rather than for a flat
percentage. Numbers invert English punctuation — decimal comma, thousands
period (`1.234,56`) — which is precisely why numeric formatting must stay in
runtime formatters and never be hand-written into a translated string. The
ellipsis is `…` (U+2026); quotation marks are plain doubles; standard
orthography (EYD, currently its 5th edition, successor of the guideline
published as PUEBI) has no guillemet or low-quote tradition to invent.

## How this subject is used

The techniques carry anchored rules with stable `ID-*` identifiers. An audit
finding against an Indonesian string cites the rule ID
([every finding cites an anchor](../../_laws.md#every-finding-cites-an-anchor));
a finding that cannot cite one either isn't a defect or reveals a rule this
subject should mint. What this subject deliberately does not carry: a product's
termbase (whether *this* product's "vault" is `brankas` is a house decision;
that the decision must be made once and recorded is
[one concept, one rendering](../../_laws.md#one-concept-one-rendering)), a
product's borrowed feature names, and any house ruling that overrules KBBI —
legitimate exactly when written down where the term lives.
