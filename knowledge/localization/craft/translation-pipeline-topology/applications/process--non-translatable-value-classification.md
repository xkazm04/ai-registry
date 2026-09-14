---
layer: application
type: application
subject: translation-pipeline-topology
technique: non-translatable-value-classification
stack: process
status: forged
verified_on: 2026-09-14
---

# The classifier applied by hand to one catalog: 25 values excluded, 11 of them wrongly (personas-web)

`personas-web` on `chore/remove-react-virtuoso` at `35d557b` (2026-09-14). The UI
catalog (`src/i18n/*.ts`, 1,663 English strings, 13 target locales) has neither a
classifier nor an exclusion vocabulary. Its structural type contract requires every
key in every locale, so the only mark a value can carry for "not translated" is being
identical to English. That day I applied the technique's six whole-value classes to
every English string. The contract's accepted terms (33 entries,
`docs/i18n/copy-contract.json:26`) stood in for a locked list. I then sorted two
samples by hand. All counts come from a read-only walk that includes arrays.

## The classifier over every English value

Of 1,663 strings:
- empty, boolean, ISO date and URL: 0 each
- pure number: 1 (`athenaPage.onboarding.canvas.stats.0.value`, *24*)
- accepted term: 14 keys, carrying 9 distinct entries
- identifier: 10

That excludes **25**.

The identifier rule was implemented as the technique words it: a token with no
spaces, at least eight characters, mixed case, and a digit or a separator. It matched
ten values, and **all ten are English words**:
- *Self-hosted*, *Self-improving*, *Auto-fixed* (×2) and *Asia-Pacific*
- five progress labels: *Loading...*, *Cancelling...*, *Refreshing...*,
  *Analyzing...*, *Joining...*

Two mechanisms produced them. A hyphenated compound supplies the separator. And the
contract's own mechanics ruling, `"ellipsis": "dots"` (`:23`), turns every progress
label into something shaped like a dotted token. Excluded, the ten would ship English
in every locale. As things stand, nine are translated in all thirteen locales.

**Finding for the technique.** "It errs toward translating" needs a sharper floor than
"digits or separators". A separator alone is not composition. The rule should require
a digit or an internal case change, and it should read a single hyphen and a trailing
ellipsis as prose. A mechanics ruling made for the source language also changes what
the classifier sees, and nothing ties the two together.

## The identity assertion, run

"Excluded values must be identical between source and target" fired **135** times
over 25 keys × 13 locales. Every firing was a defect in the exclusion list, and none
was a translation defect:

- **128 fall on the ten false identifiers.** Each is a correct translation the
  classifier would have blocked (*Selbst gehostet*, *セルフホスト*). *Self-hosted*
  matches English only in `cs` and `id`, and there it is untranslated rather than
  locked (below).
- **7 fall on `athenaPage.hero.headlineGradient` = *Athena*.** It is an accepted term,
  and the guide template lists it as a brand that stays verbatim (`35d557b`,
  `scripts/i18n/translate-guide-subagent-prompt.md:142`). `ar`, `bn`, `ja`, `ko`, `ru`
  and `zh` write it in their own script: a transliteration ruling nobody recorded. The
  seventh, `hi` *एथेना से*, is not a name. It carries a postposition, because the key
  is the gradient-styled part of a headline split across keys, and Hindi grammar
  attached to it. The whole-value test ran on a value that is whole in English and a
  fragment in the sentence.

The technique says this assertion has no false positives, and that holds only when
the list is right. Here it detected a wrong list.

## Hand-sorting 149 identical values

The two samples are every value identical to English in `ja` (103; non-Latin, where
identity nearly proves untranslatedness) and the 46 `cs` values above the 95-key
all-locale intersection (Latin, where identity is noisy).

| class | `ja` (103) | `cs` above the intersection (46) |
|---|---|---|
| untranslated English | **67** | 2 |
| proper nouns, product and tier names | 21 | 5 |
| initialisms, symbols, technical tokens | 6 | 6 |
| pure skeleton | 9 | 6 |
| cognates | — | 12 |
| adopted loanwords | — | 14 |
| identical by coincidence | — | 1 |

- **`ja`, untranslated (67):** 54 use-case card strings, 12 FAQ entries and
  `footer.copyright` (*Personas. All rights reserved.*).
- **`ja`, names (21):** 13 are in the accepted list. 8 are not: *Google Drive*,
  *Windows*, *macOS* and *Linux* (two keys each) and *DevOps*.
- **`ja`, tokens (6):** *SLA* ×2, *stdout*, *ID*, *Web*, *Webhook*.
- **`ja`, skeleton (9):** *P50 / P95 / P99*, *18 / 25*, *1.2s*, *0.8s*, *—*, *UTC+1*,
  *24*, *98%*, *1.4s*.
- **`cs`, untranslated (2):** `compareSection.offerBadges.1` *Self-hosted* and
  `pricing.features.designEngine` *Design engine*.
- **`cs`, names (5):** *Cloud*, *Enterprise* as a pricing tier and as a roadmap bar,
  the theme *Matrix*, *Athena*.
- **`cs`, tokens (6):** *max*, *min*, *ID*, *SSO · audit*, *ok* ×2.
- **`cs`, skeleton (6):** *{n} min* and five punctuation joints in
  `athenaPage.fleet.request.clauses`.
- **`cs`, cognates (12):** *Agent* ×7, *Incident*, *Momentum*, *Trend*, *Info*,
  *Persona*.
- **`cs`, loanwords (14):** *Blog* ×2, *Menu*, *Open source*, *Demo*, *Webhook*,
  *trigger*, *Prompt*, *Chat*, *Web*, *Marketing*, *Boost*, *{count} boost*, and
  *Enterprise* as a complexity level.
- **`cs`, coincidence (1):** `triggerDays[6]` is *S* for Saturday in English and for
  *sobota* in Czech. The Wednesday slot differs (*W* against *S*). This is a
  one-letter correct translation that no short-token rule may touch.

**What the mechanical layer caught.**
- **`ja`: 14 of 103** (the 13 accepted terms and *24*), every one legitimately
  identical. The other 22 legitimate values go to an engine, which is the "errs toward
  translating" rule working: *1.4s* and *98%* are language-bound in some targets.
- **`cs`: 2 of the 46** above the intersection. *Athena* is correct. *Self-hosted* is
  wrong: it is one of the two untranslated values, and excluding it would lock it into
  English permanently.

## What the four exclusion classes would have said

The tree has one flag with two partial homes. One is an English checker's exemption
list (`terms.accept`). The other is a do-not-translate paragraph in the guide template
(`:139-157` at `35d557b`). No tool on the UI catalog reads either.

- **Locked.** The 21 `ja` names are that list. 8 of them are missing from
  `terms.accept`, which was written for English case and spelling checks, not for
  translation.
- **Ignored.** Not representable. The `Translations` type requires every key, while
  the runtime already fills an absent key from English
  (`src/i18n/useTranslation.ts:29-48`). The type forbids a state the runtime handles.
- **Preserved.** Nothing in a catalog value records who wrote it, so no pass can know
  which values a human owns.
- **Allowlisted.** It would have been needed for exactly the ten false identifiers.

The locked set belongs in the identical-value audit's allowlist by construction, and
here it cannot be copied in as it stands. Only 9 of its 33 entries occur as whole
values. One of those, *Athena*, is transliterated in seven locales. And eight names
the audit needs are absent from it.
