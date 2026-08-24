---
layer: technique
type: technique
subject: hindi
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding whether a term is transliterated or translated or left Latin, setting the Hindi-vs-Hinglish register for a product, resolving disputes about a settled rendering]
---

# Terminology and loanwords

The highest-leverage decision in a Hindi catalog is the loanword dial, and the
highest-leverage property of that decision is that it be **made once and held**.
Hindi tech users live in a Hinglish speech community: the vocabulary a product
must use is neither शुद्ध Hindi (which reads governmental and foreign in
software) nor raw English (which reads untranslated). The workable convention,
consistent across major vendors' shipped Hindi products and professionally
reviewed catalogs, sorts every term into one of four classes — and once a term
is classed, re-litigating it string-by-string is the defect, whichever way the
re-litigation points.

## HI-HINGLISH · the register is Hinglish-in-Devanagari, decided by term class

**Trigger:** setting terminology policy for a new Hindi locale; a reviewer
proposing to "elevate" the vocabulary; a translator importing dictionary Hindi
for a tech concept.

**Rule:** classify, don't taste:

1. **Tech and product-domain nouns → transliterate** into Devanagari: फ़ाइल,
   डाउनलोड, टेम्पलेट, सेटिंग्स, अकाउंट, पासवर्ड, ब्राउज़र. These are the words Hindi
   speakers actually say; a Sanskritic coinage (संचिका, प्रतिरूप, कूटशब्द) is not
   a translation, it is a register error — grammatically Hindi, sociolinguistically
   foreign.
2. **Everyday verbs and connective tissue → native**: करें, हटाएँ, खोलें, सक्षम
   करें, आवश्यक, वैकल्पिक, सफल, विफल, अगला, पिछला. Transliterating into this class
   (इनेबल करें, नेक्स्ट) is drift toward raw Hinglish and reads lazy.
3. **Abstract domain nouns with no established borrow → native**, usually
   Sanskrit-derived and genuinely current: समीक्षा (review), अनुमोदन (approval),
   अनुमति (permission), सूचना (notification, where नोटिफ़िकेशन hasn't been settled
   instead), अवलोकन (overview).
4. **Acronyms, code, standards, brands → Latin, untouched**: API, URL, PDF,
   JSON, product and tier names. See HI-SCRIPTMIX.

The boundary cases (class 1 vs 3) are exactly where a termbase earns its keep:
the ruling is corpus-first — check what the product's shipped strings and the
wider Hindi tech web actually use before ruling
([the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis))
— and once recorded, one concept keeps one rendering
([one concept, one rendering](../../../_laws.md#one-concept-one-rendering)).

**Source:** the published OS-vendor Hindi style guide's preference for current,
comprehensible terms over coinages; the browser-vendor guide's explicit
"transliterate when no easy term exists" rule; shipped-corpus frequency counts
from professionally reviewed catalogs.

## HI-XLIT · transliteration is standardized, not improvised

**Trigger:** a new borrow entering the catalog; two spellings of one borrow
appearing (वर्कफ़्लो/वर्कफ्लो, कंप्यूटर/कम्प्यूटर).

**Rule:** a transliteration is a spelling decision with the same permanence as a
translation. Fix each borrow's Devanagari form in the termbase at first use,
with the nukta present where the sound demands it (फ़ for /f/, ज़ for /z/ —
वर्कफ़्लो not वर्कफ्लो), the conventional matra choices recorded (डिप्लॉयमेंट vs
डिप्लोयमेंट-type variance is the common split), and English plural -s carried
into the borrow only where established (सेटिंग्स is settled; most counted borrows
stay unmarked after numerals per the plural rules). Default policy for an
unclassed new term is **transliterate** — it is the dominant pattern, it keeps
labels short, and it is reversible by termbase ruling later, whereas a coinage
that ships trains users on a word you will retract.

**Exception:** do not transliterate a term whose Latin form is itself the
recognition unit — see HI-SCRIPTMIX.

## HI-SCRIPTMIX · what stays Latin inside a Devanagari sentence

**Trigger:** acronyms, brand names, code literals, or feature names sitting in
Hindi text; a reviewer transliterating an acronym or leaving a common noun in
Latin.

**Rule:** Latin script inside a Hindi sentence is reserved for tokens whose
*written Latin form* is the recognition unit: acronyms and standards (API, PDF,
USB), code and identifiers, URLs and emails, and brand/product names the brand
owner writes in Latin. Everything else that is staying English-derived goes into
Devanagari — a lone Latin common noun stranded mid-sentence (Fleet निष्पादन…)
breaks the script rhythm and shaping worse than in Latin-script target
languages, which is the whole argument for transliterating rather than
code-switching. Two sub-rules: Latin embeds keep their source casing exactly
(API never api, product names never re-cased — Devanagari has no case to
harmonize them with); and grammar wraps around the embed with normal
postpositions and agreement (API से, PDF में) — the embed takes no declension.

**Exception:** a product may rule that certain feature surface-names
transliterate (recognition through *sound*) while the company brand stays Latin
(recognition through *logo*). Both rulings are legitimate; the defect is not
having ruled, which ships the same name three ways.

## HI-TERMSPLIT · a concept may split noun and verb across the dial

**Trigger:** a term that is both noun and verb in English (run, download,
share); a reviewer "harmonizing" रन and चलाएँ into one word.

**Rule:** Hindi frequently settles a borrowed *noun* beside a native *verb* for
the same concept: रन (the run) vs चलाएँ (run it), डाउनलोड (the download) as noun
with डाउनलोड करें as verb but शेयर करें beside साझा करें contested. The split is
not an inconsistency — one-concept-one-rendering operates per part of speech
here, and the termbase should record noun and verb renderings as two rows.
Collapsing a settled split (रन करें because the noun is रन) produces the stilted
compound the light-verb rules warn about.

## HI-GENPLURAL · settle each loanword's generic plural in the termbase

> **Trigger** — a transliterated noun used as a generic, uncounted plural:
> a section header, a group label — no count placeholder governs it.
> **Rule** — per noun, record in the termbase whether the generic plural
> carries the English -s (*टूल्स*) or stays bare (*ट्रिगर*, *कनेक्टर*), and
> apply the recorded form everywhere. Either convention is defensible; the
> split between near-identical constructions is the defect.
> **Provenance** — harvested 2026-08 from a cross-locale review wave; the
> plural rule only governs CLDR-category-selected counted messages.

## When not to use this

Product-specific term rulings — what THIS product calls its own features, which
tier names stay English, which native word was chosen over a viable borrow —
are the consuming repo's termbase, not this technique; this technique teaches
the classing system those rulings instantiate. And terminology audits do not
extend to register morphology or word order: a perfectly classed vocabulary in
an English-shaped sentence still fails de-anglicization-constructions.
