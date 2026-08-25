---
layer: technique
type: technique
subject: bengali
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding whether an English tech term transliterates or translates, building or auditing a Bengali termbase, handling Bangladesh vs West Bengal vocabulary divergence]
---

# Terminology and loanwords

The highest-leverage decision in a Bengali catalog is the loanword policy,
because it is decided hundreds of times and every inconsistency is visible.
Bengali has absorbed English technical vocabulary for over a century and does it
gracefully — the failure mode is not borrowing, it is *indecision*: the same
concept shipped transliterated in one string, natively translated in a second,
and bare Latin in a third.

## BN-LOAN · the four-bucket policy, decided per term, once

**Rule.** Classify every recurring term into one bucket and record it:

1. **Core tech and product-domain nouns transliterate** into Bengali script —
   এজেন্ট (agent), টেমপ্লেট (template), ইভেন্ট (event), ট্রিগার (trigger),
   ক্রেডেনশিয়াল (credential), ওয়ার্কফ্লো (workflow). This is the dominant bucket
   in every worked catalog examined, it is what Mozilla's bn-BD guide
   prescribes when the native equivalent "sounds unusual", and it keeps
   width-constrained strings short. **Default here** when a new term fits no
   other bucket.
2. **Feature/concept names transliterate too** — a product's named surfaces
   that are concepts rather than brands. A lone Latin word stranded inside a
   Bengali sentence breaks script rhythm and font shaping harder than in any
   Latin-script target; only true brands earn that disruption.
3. **Everyday verbs and connective tissue are native** — করুন, মুছুন, বন্ধ করুন,
   সফল, ব্যর্থ, আবশ্যক, ঐচ্ছিক. Never transliterate enable/disable/required/
   optional; native words fully own this territory, and a transliterated
   এনাবল reads as laziness, not register.
4. **Abstraction nouns with a natural native word go native** — পর্যালোচনা
   (review), অনুমোদন (approval), খসড়া (draft), সতর্কতা (alert), সারসংক্ষেপ
   (overview). These read as normal professional Bengali, not calques, which
   is why they beat transliteration *here* despite bucket 1 being the majority
   pattern overall.

The bucket assignment is the recorded ruling; re-litigating it per string is
the defect. [One concept, one rendering](../../../_laws.md#one-concept-one-rendering)
adds the inverse duty: the settled word must not be reused for a second concept
— a catalog that renders both "execution" and "edit" with visually colliding
words (সম্পাদন / সম্পাদনা) has created a defect out of two defensible choices.

## BN-SPLITPOS · a term may split by part of speech — hold the split

**Rule.** Bengali freely borrows a noun while keeping its verb native, and the
split is a *feature*: "run" as a countable noun transliterates (৩টি রান), while
the action is the native verb চালান — never the calqued রান করুন. When a
termbase records such a split, both halves are the anchor; "harmonizing" them
into one form is an error in either direction. Expect the same shape wherever
English uses one word as noun and verb (export, review, trigger) and record the
ruling per part of speech, not per English headword.

## BN-FALSEFRIEND · a dictionary word can be the wrong word

**Rule.** The dangerous rendering is not the awkward one — it is the fluent
native word whose established sense differs from the tech sense. Documented
cases from worked catalogs: শংসাপত্র for "credential" (it means
certificate/diploma — access-secret is the tech sense, so the transliteration
wins); নিরাময়/চিকিৎসা for self-"healing" systems (medical cure — the product
means automatic remediation); a native word already load-bearing for "publish"
reused for "deployment" (sense collision). The audit posture: when a native
rendering was chosen over the default transliteration, verify its primary sense
actually covers the tech sense; when a false friend is found *already shipped
and counted in the minority*, the majority rendering becomes the rule and the
false friend is corrected opportunistically — per
[the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis),
the coherent catalog outvotes the dictionary.

## BN-SPELLFIX · one canonical spelling per loanword

**Rule.** A transliterated term has many defensible spellings and exactly one
canonical one. Conjunct drift (পার্সোনা vs পারসোনা — the র্স conjunct present or
absent), vowel-length drift (ই/ঈ), and ZWJ presence (per BN-ZWJ) all produce
near-duplicates that render similarly and split every downstream count. The
termbase row records the exact canonical string — encoding included, NFC per
BN-NUKTA — and every audit matches against it byte-wise, because Bengali's
near-homograph space is too rich for eyeball dedup.

## BN-VARIANT · two Bengals, one recorded convention

**Rule.** Bengali has two standardizing communities with separate authorities
and separate Microsoft style guides: Bangladesh (bn-BD, Bangla Academy) and
West Bengal, India (bn-IN, Paschimbanga Bangla Akademi). The divergence is real
— vocabulary (পানি vs জল "water" is the emblem, with a register/community
valence), some spelling taste, some collation — but for *transliterated
technical vocabulary the two registers substantially agree*, which is why a
single bn catalog is viable for software. The worked convention: **ship one
neutral, transliteration-forward catalog; prefer vocabulary shared across both
communities; where a choice is unavoidable, pick once, record which register it
follows, and never mix.** A product with a dominant market in one region may
rule for that region's register wholesale — a recorded catalog-wide ruling.
The defect this anchor types is not "chose the BD word" or "chose the IN word";
it is *mixing* them, or forking per-region silently so the two catalogs drift
with no recorded policy.

## When not to over-apply

Bucket rules govern recurring domain terms, not every English-origin word —
Bengali's centuries-old assimilated loans (চেয়ার, স্কুল, ব্যাংক) are simply
Bengali words needing no ruling. And the specific term-to-rendering table is
the consuming repo's termbase: this technique owns the buckets, the split
mechanism, and the false-friend discipline — never the product's actual rows.
