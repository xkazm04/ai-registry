---
layer: application
type: application
subject: bengali
technique: terminology-and-loanwords
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — a counted loanword policy in a shipped Bengali catalog

The Personas app's Bengali style guide
(`C:\Users\kazda\kiro\personas\docs\i18n\style-bn.md`) is a worked realization
of every anchor in terminology-and-loanwords, with the distinguishing feature
this bundle's laws demand: **its rulings are grep counts against the shipped
catalog** (`src/i18n/locales/bn.json`, ~75% human-reviewed at the 2026-07-10
sweep), not taste.

## The four buckets, with frequencies

The guide's loanword policy is BN-LOAN with numbers attached. Bucket 1
(transliterate tech nouns) is demonstrated dominant by count: ক্রেডেনশিয়াল
226×, ইভেন্ট 173×, ট্রিগার 135×, এক্সিকিউশন 130×, টেমপ্লেট 108×, কানেক্টর 92×.
Bucket 3 (native verbs/connective tissue) and bucket 4 (native abstraction
nouns: পর্যালোচনা 127×, অনুমোদন 86×, খসড়া 49× vs ড্রাফট 10×) are equally
settled. The guide's own instruction — "be decisive, follow the majority
pattern already shipped, do not 'improve' it toward a more literary/native
vocabulary" — is BN-LOAN's decision discipline in house voice.

## Documented anchor instances

- **BN-SPLITPOS**: the guide's termbase row for "run" — noun রান ("৩টি রান"),
  verb চালান ("never রান করুন") — is the part-of-speech split held as policy.
- **BN-FALSEFRIEND**: `sidebar.credentials` shipped as শংসাপত্র
  ("certificate/diploma"), the false friend, at 30× against ক্রেডেনশিয়াল at
  226×. Ruling: majority rendering wins; the false friend is corrected
  opportunistically, not bulk-migrated — the authority-is-a-hypothesis law
  applied with real counts.
- **BN-SPELLFIX**: পার্সোনা (208×, correct র্স conjunct) vs পারসোনা (36×,
  conjunct dropped — and locally the *majority* inside the `monitor.*`
  section). The guide names the canonical spelling and orders normalization on
  touch; the section-local majority is exactly why canon must be recorded
  rather than re-derived per file.
- **Sense-collision inverse of one-concept-one-rendering**: এক্সিকিউশন chosen
  over সম্পাদন because the latter visually collides with সম্পাদনা ("edit") one
  tab away; ডিপ্লয়মেন্ট over প্রকাশ because প্রকাশ was already load-bearing for
  "publish".
- **Feature-name transliteration (BN-LOAN bucket 2)**: the guide rules
  concept/feature names into Bengali script (টুইন, ককপিট, ডিরেক্টর) while
  brands (Personas, Claude, Obsidian) stay Latin per its glossary's
  do-not-translate list — and explicitly marks the bare-Latin "Twin"/"Cockpit"
  strings still shipping in `twin.*` and `overview.cockpit.*` as **gap, not
  policy**, the exact drift-vs-policy distinction an auditing agent needs
  stated.

## BN-VARIANT in practice

Personas ships a single `bn` catalog, not a bn-BD/bn-IN pair. The corpus's
vocabulary is transliteration-forward and region-neutral for tech terms —
consistent with both Microsoft Bangla style guides — and no per-region fork
exists; the divergence risk is carried by the termbase's one-canonical-row
discipline. This is the worked instance of BN-VARIANT's rule: one recorded
convention, mixing forbidden, forking deferred until a market ruling forces it.

## What stays downstairs

The termbase table itself — which Bengali word "vault" or "alert" maps to for
this product — is the repo's artifact and is not restated in the technique.
What migrated upward is the mechanism: buckets decided once with counts,
splits held per part of speech, false friends outvoted by coherent majorities,
canonical spellings recorded byte-exact.
