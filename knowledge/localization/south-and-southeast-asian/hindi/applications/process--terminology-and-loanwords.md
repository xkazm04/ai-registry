---
layer: application
type: application
subject: hindi
technique: terminology-and-loanwords
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — the Personas hi termbase as a worked loanword dial

The Personas app (a ~19k-key consumer/developer product shipping 14 locales)
carries its Hindi ruling in `C:\Users\kazda\kiro\personas\docs\i18n\style-hi.md`,
layered on the shared `docs/i18n/glossary.md` and grounded in the ~75% of
`src/i18n/locales/hi.json` that is shipped, human-reviewed Hindi. It is the
clearest worked instance of the term-class system this technique teaches, with
corpus counts backing each ruling.

## The four classes, instantiated with counts

- **Class 1 (tech nouns → transliterate)** is the guide's dominant pattern:
  पर्सोना, एजेंट, कनेक्टर, क्रेडेंशियल, वॉल्ट, रेसिपी, ट्रिगर, शेड्यूल, डिप्लॉयमेंट,
  ड्राफ्ट, मॉनिटर, चेन, वर्कफ़्लो, स्किल, टियर. The anchor case is टेम्पलेट at 118
  occurrences — the single most consistent term in the file — cited in the guide
  as "never vary the spelling". The guide's default for an unclassed new term is
  explicit: transliterate, because it is the majority pattern and keeps buttons
  short.
- **Class 2 (everyday verbs/connectives → native)** is equally explicit: करें,
  चलाएँ, हटाएँ, बंद करें, सक्षम करें, सफल, विफल, आवश्यक, वैकल्पिक — with a direct
  prohibition on transliterating enable/disable/required/optional.
- **Class 3 (abstract domain nouns → native)**: क्षमता/क्षमताएँ (capability —
  the guide bans both फीचर and एबिलिटी), समीक्षा (review) kept distinct from
  अनुमोदन (approval), निष्पादन (execution), अवलोकन (overview), and उपचार for
  "healing" — chosen as the broad everyday remedy word over the clinical इलाज, a
  nice example of ruling *within* the native class.
- **Class 4 (brands → Latin)**: the glossary's trap rule — lowercase persona(s)
  transliterates to पर्सोना, capital-P "Personas" the product never does. The
  style guide documents the over-correction failure (rendering the brand as
  पर्सोनाज़) as its Pitfall 4.

## HI-SCRIPTMIX and HI-TERMSPLIT, decided and enforced

The repo's ruling on script mixing is the transliterate-the-surface-names side
of the HI-SCRIPTMIX exception: its five plugin surface names (ट्विन, ब्रेन,
फ्लीट, डायरेक्टर, कॉकपिट) transliterate into Devanagari while the company brand
stays Latin. The guide's Pitfall 6 shows the incident that motivated recording
it: shipped keys like "Fleet निष्पादन जिन्होंने मूल्य प्रदान किया" mixing Latin
"Fleet" into a Devanagari sentence — classified by the guide as drift, not
policy, with the instruction to always emit the Devanagari form even though
older keys disagree. That is HI-SCRIPTMIX's "the defect is not having ruled"
clause working in reverse: the ruling exists, so the mixed keys are auditable
defects instead of precedent.

HI-TERMSPLIT appears verbatim as the guide's run/चलाएँ row pair: रन is the noun
("रन हटाएं" = delete the run), चलाएँ is the verb (the Run button), and the guide
explicitly bans collapsing them into "रन करें". The termbase records them as two
rows — noun and verb — exactly as the technique prescribes.

## The corpus-first discipline

Every ruling in `style-hi.md` cites the shipped corpus, not taste: आप appears
435 times against zero तुम/तू; the loanword rows are ranked "by frequency"; and
the guide explicitly excludes the ~25% still-English remainder of `hi.json` from
serving as precedent ("that raw English is the gap … not a style precedent").
This is the-authority-is-a-hypothesis run as a standing process: the style guide
was *derived from counting the catalog*, then inverted into the enforcement
authority for the 40-agent translation fleet closing the gap. The upward lesson
worth carrying to any Hindi locale: write the style authority after counting the
reviewed corpus, scope it against the unreviewed remainder, and put the
frequency numbers in the rulings so a later reviewer re-litigates against data,
not against the guide author's ear.
