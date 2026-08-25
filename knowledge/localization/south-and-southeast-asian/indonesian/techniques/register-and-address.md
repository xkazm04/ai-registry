---
layer: technique
type: technique
subject: indonesian
technique: register-and-address
status: forged
laws: [one-concept-one-rendering, every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing Anda vs kamu for a product, auditing second-person pronouns in an Indonesian catalog, writing imperative or possessive copy in Indonesian]
---

# Register and address

Indonesian concentrates its entire formality system into pronoun choice. Verbs
do not conjugate for person or politeness, so there is no grammatical agreement
to keep a register decision honest — and no grammatical error when it drifts.
The register decision is therefore made once, per product, recorded as a rule,
and enforced by search: it is one of the few localization decisions in any
language that is simultaneously this consequential and this mechanically
auditable.

## ID-ANDA · Anda is capitalized in every position

When the formal register is in force, the second-person pronoun is `Anda`,
capitalized wherever it appears — mid-sentence, in possessives, everywhere. The
official Indonesian spelling rules (EYD; the rule dates back through PUEBI)
treat `Anda` as a term of address capitalized like a title. Lowercase `anda`
mid-sentence is a spelling error, not a style choice.

- Right: `perubahan Anda`, `Akun Anda telah diperbarui`
- Wrong: `perubahan anda`

Source: EYD/PUEBI capitalization rules; Microsoft's and Mozilla's published
Indonesian style guides both render "you" as `Anda`.

## ID-REGISTER · one register per product, decided once

`Anda` is the software default for professional, B2B, developer, financial,
and government-adjacent products. `kamu` is a legitimate, widespread choice for
consumer and lifestyle products — the large Indonesian consumer apps
(ride-hailing, e-commerce, chat) largely address users as `kamu` for warmth,
and imposing `Anda` there reads stiff. Neither is wrong; the defect is mixing.
The decision rule:

- **Operator or professional audience, or any doubt → `Anda`.** It is never
  offensive; `kamu` to the wrong audience is.
- **Consumer product deliberately choosing warmth → `kamu`**, recorded as a
  house ruling with the same force `Anda` would have had.
- **Never** `kau`, `lo`/`lu`, or regional pronouns in product copy at either
  register — those are speech registers, not writing registers.
- The choice binds the whole pronoun family: `Anda` pairs with the full
  possessive `… Anda` (`akun Anda`); `kamu` pairs with the clitic `-mu`
  (`akunmu`) and subject `kamu`. A catalog with `akun Anda` in one string and
  `akunmu` in the next has mixed registers even though no bare pronoun did —
  audit the clitics, not just the pronouns
  ([one concept, one rendering](../../../_laws.md#one-concept-one-rendering)
  applied to the address system itself).

The predictable failure mode is tone-matching: a translator reads warm,
casual-sounding English companion copy and reaches for `kamu` in an
`Anda`-register product. The tone can stay warm — Indonesian carries warmth in
word choice and sentence shape, not in the pronoun. Wrong:
`Ceritakan tentang dirimu`. Right: `Ceritakan tentang diri Anda`.

## ID-IMP-DROP · imperatives drop the pronoun

Formal Indonesian imperatives are bare-verb by default: `Simpan`, `Coba lagi`,
`Pilih berkas`. Buttons, menu items, and step instructions never carry the
pronoun; `Anda harus menyimpan` on a control is a register error dressed as
politeness. This is not a register downgrade — dropping the pronoun IS the
formal imperative. Politeness, where a full-sentence instruction genuinely
needs softening, is added with `silakan` (invitation: `Silakan pilih templat`)
or `mohon` (request, slightly humbler: `Mohon tunggu`), never by inserting the
pronoun.

Decision rule: control label or numbered step → bare verb, no softener; a
sentence asking the user to wait or tolerate something → `mohon`; a sentence
inviting an optional action → `silakan`. Stacking both (`Mohon silakan…`) is
always wrong.

## ID-FIRST-PERSON · the product's own voice

First-person plural: `kami` (exclusive "we" = the maker, not the user) is
correct for product-voice copy (`Kami tidak dapat memuat data Anda`); `kita`
(inclusive "we" = you and I together) is wrong there and its misuse is an MT
tell, because English "we" maps to both. Use `kita` only where the copy
genuinely means user-and-product jointly ("let's set up your first project" →
`Mari kita siapkan…` is legitimate in `kamu`-register onboarding). When in
doubt, `kami` — or restructure to drop the pronoun, which Indonesian does
gracefully.

## When NOT to enforce

- Quoted user-generated content, testimonial copy, and marketing taglines may
  legitimately sit outside the product's register ruling; audit them against
  their own context, not against the catalog rule.
- Do not "fix" a consumer product's consistent `kamu` catalog to `Anda` on the
  strength of this technique — consistency is the rule, `Anda` is only the
  default. A register migration is a product decision executed as a full sweep,
  never a per-string finding
  ([every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor):
  the anchor for a single-string register finding is the *recorded house
  register*, and if none is recorded, minting that record is the fix).
