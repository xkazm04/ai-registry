---
layer: golden-path
type: golden-path
subject: hindi
status: forged
use_when: [translating or auditing Hindi UI strings, setting register and loanword policy for a Hindi locale, reviewing Devanagari typography and numeral choices, wiring Hindi plural categories into a message catalog]
techniques:
  - register-and-address
  - devanagari-and-numerals
  - gender-and-agreement
  - de-anglicization-constructions
  - terminology-and-loanwords
  - ui-conventions-and-length
---

# Hindi

Hindi is the rare software locale where the register question is already settled
and the hard question is vocabulary. Every serious published authority for the
language — a major OS vendor's Hindi style guide, a major browser vendor's — and
every professionally reviewed catalog converge on the same address system (आप,
formal verb forms, no exceptions), so a localizer spends no judgment there. The
judgment all goes into one dial: **how much English is the right amount**. A
"pure" Hindi translation — शुद्ध हिन्दी, the Sanskrit-derived literary register —
is grammatically impeccable and reads *foreign* in a software product, because
the people who use software in Hindi live in a Hinglish speech community where
संगणक lost to कंप्यूटर decades ago. A translation that keeps too much English is
not a translation at all. The craft of this locale is holding that dial steady
across thousands of strings, and everything else — script mechanics, agreement,
word order — is discipline that can be written as rules and audited by anchor.

## The register system, and why software collapses it

Hindi has a three-level address system: तू (intimate/subordinating), तुम
(familiar), आप (formal/honorific). Software collapses it to one level: **आप,
everywhere** — instructions, errors, empty states, confirmations, marketing
strings inside the product. This is not a B2B-versus-consumer choice the way tu/vous
or du/Sie is in European locales; even consumer products addressed to young
users ship आप, because तुम from a machine reads presumptuous and तू reads
insulting. The one register decision that *does* vary by product is tone around
the आप skeleton — playful versus sober word choice — not the pronoun or the verb
morphology.

आप is grammatically **plural**: it takes plural verb agreement even when
addressing one person (आप करते हैं, never आप करता है), and its imperative is the
-ें/-इए honorific form (करें, सहेजें; कीजिए in extra-polite prose). A bare root
imperative (करो, ढूँढो — the तुम forms) in a button or error is the single most
recognizable register defect in a Hindi catalog, and published style authorities
call it out as rude, not merely informal. The full mechanics, and the audit
anchors, are in register-and-address.

## The Hinglish dial

The load-bearing distinction is **term class**, not string-by-string taste:

- **Tech and product-domain nouns** stay English-derived, written in Devanagari
  (transliterated): टेम्पलेट, फ़ाइल, डाउनलोड, सेटिंग्स, अकाउंट. Coining or reviving a
  native word here (संचिका for file, प्रतिरूप for template) is the classic
  over-literary failure — the user has never seen the word outside a government
  form.
- **Acronyms, code, and brand names** stay in Latin script untouched: API, URL,
  PDF, product names. Transliterating an acronym (एपीआई) trades recognition for
  nothing.
- **Everyday verbs and connective tissue** are native Hindi and must stay so:
  करें, हटाएँ, सक्षम करें, आवश्यक, वैकल्पिक, सफल, विफल. Transliterating these
  (इनेबल करें for "enable" where सक्षम करें is established) is drift in the other
  direction.
- **Abstract domain nouns with no snappy borrow** go native, usually
  Sanskrit-derived: समीक्षा (review), अनुमोदन (approval), निष्पादन (execution).

The dial is held by a termbase, one rendering per concept, and by the discipline
that a reviewer may not "improve" a settled transliteration toward literary
Hindi — that is taste overriding an anchor, the exact failure
[every finding cites an anchor](../../_laws.md#every-finding-cites-an-anchor)
exists to stop. Policy and its exceptions live in terminology-and-loanwords.

## What makes a Hindi string smell translated

Hindi is SOV with postpositions, and English is SVO with prepositions, so the
calques are predictable and mechanical to audit:

1. **Stranded postpositions.** के लिए, में, पर, से follow their noun. Machine
   output regularly leaves them fronted in English preposition position (के लिए
   यह फ़ाइल instead of इस फ़ाइल के लिए) — ungrammatical, not merely awkward.
2. **Verb not final.** The verb complex closes the Hindi clause. A placeholder
   or object trailing the verb usually means English order was preserved.
3. **Calqued light verbs and passives.** Hindi builds most verbs as noun/loan +
   करना/होना (क्लिक करें, लोड हो रहा है). Done idiomatically this is the engine of
   the language; calqued from English argument structure it produces the
   characteristic MT smell — wrong auxiliary, wrong aspect, English passive
   forced through जाना where Hindi wants an intransitive.
4. **Over-literary vocabulary** where the Hinglish register was settled — the
  dial drifting under a translator who was taught शुद्ध Hindi is "better".

These are anchored and worked through in de-anglicization-constructions.

## Agreement: everything carries gender, including loanwords

Hindi has two genders and marks them on verbs, adjectives, and possessives —
there is no neuter to hide in. Every English loanword must therefore *have* a
gender, and usage assigns one (फ़ाइल is feminine, टेम्पलेट masculine); the default
for a new borrow is masculine unless analogy or ending pulls feminine, and the
assignment is a termbase fact, decided once. Interpolated placeholders make this
concrete: a `{name}` landing before ने/को/से sits in the **oblique** case slot,
and a perfective verb agrees ergatively past ने — the string must be phrased so
it stays grammatical for any value the placeholder takes. The mechanics,
including the CLDR plural mapping, are in gender-and-agreement.

On plurals, CLDR gives Hindi cardinal categories **one** and **other**, with the
quirk a naive English mapping misses: the rule for one is `i = 0 or n = 1`, so
**0 takes the singular form** (0 फ़ाइल, not 0 फ़ाइलें). A catalog that copies the
English zero-goes-to-other assumption ships an agreement error on every empty
state. Hindi also frequently leaves a counted noun unmarked for plural, which is
why the one/other values of many messages legitimately look identical — that is
correct Hindi, not a lazy translation.

## Script and layout facts an engineer must know

- Devanagari is **left-to-right**; no bidi handling applies.
- It is a **complex script**: consonants combine into conjuncts, vowels attach
  as matras above, below, before, or after the consonant, and the nukta dot
  derives the loanword consonants क़ ज़ फ़. Correct rendering requires a shaping
  engine and a real Devanagari font; a missing font shows dotted circles (◌) and
  broken clusters, and truncation that splits a cluster corrupts the text.
- **Vertical metrics run taller than Latin.** The headstroke plus above- and
  below-base matras need more line height; fixed-height components tuned on
  Latin text clip Hindi descenders (the ु in टेम्पलेट, the ृ in कृपया) first.
- There is **no letter case**. Casing instructions in a source style guide are
  inapplicable to Devanagari text; the only casing decisions left are about
  embedded Latin material, which keeps its source casing.
- Sentence-final punctuation is the **danda ।**, not the Latin period; digits in
  modern software are the **International (Latin) 0-9**, not Devanagari ०-९ —
  both settled by the published authorities and by every major shipped catalog,
  with narrow deviations covered in devanagari-and-numerals.
- Hindi runs **longer than English for sentences** (postposition chains,
  conjunct width) but equal-or-shorter for transliterated single-word labels;
  length strategy per surface is in ui-conventions-and-length.

## The failure modes of the naive reading

The naive reading of this locale is "Hindi is hard because the grammar is
different". The grammar differences are the *easy* part — they are rules, they
are anchored below, and an audit catches their violations mechanically. The
expensive failures are the judgment ones: a reviewer re-litigating the Hinglish
dial string by string; a machine pass translating ICU keywords or placeholder
names because they looked like words
([the format skeleton is inviolable](../../_laws.md#format-skeleton-is-inviolable));
a "fluency" pass that rewrites settled transliterations into literary Hindi and
degrades a catalog that was already right
([clean strings stay untouched](../../_laws.md#clean-strings-stay-untouched)).
Hold the dial with anchors, audit the mechanics with rules, and Hindi is one of
the most tractable large locales a product ships.
