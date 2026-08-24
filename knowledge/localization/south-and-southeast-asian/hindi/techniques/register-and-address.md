---
layer: technique
type: technique
subject: hindi
technique: register-and-address
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing or auditing the address register of a Hindi catalog, writing imperatives for buttons and instructions, reviewing verb agreement with आप]
---

# Register and address

Hindi's three-way address system — तू, तुम, आप — collapses to a single answer in
software, and the value of writing it down is not the choice but the audit: the
तुम and तू forms are morphologically distinct, so a register violation is
grep-detectable, and the honorific's plural agreement produces secondary defects
a reviewer must know to look for.

## HI-AAP · आप is the software register

**Trigger:** any string that addresses the user — instructions, errors,
confirmations, empty states, onboarding, marketing copy inside the product.

**Rule:** address the user as आप with the matching formal verb morphology,
uniformly across the whole catalog. There is no consumer-versus-B2B split, no
"casual mode", no per-surface softening to तुम. Warmth and playfulness are
expressed through word choice and sentence rhythm around the आप skeleton, never
through the pronoun system.

**Source:** the published OS-vendor and browser-vendor Hindi style guides both
prescribe honorific pronouns (आप over तुम) and name the informal imperative as
rude; professionally reviewed product catalogs show आप in the hundreds of
occurrences with तुम/तू at zero.

**Exception:** a product persona that deliberately speaks as an intimate
character (a companion app, a game character) may adopt तुम as a *recorded house
ruling* in the consuming repo — the default never moves, and the ruling must be
written where the register rule lives, not improvised per string.

## HI-TUM-TU · तुम and तू are excluded, and detectably so

**Trigger:** auditing a machine-translated or crowd-translated batch for
register.

**Rule:** the words तुम, तू, and their possessives तुम्हारा/तेरा, plus the तुम-form
verb endings (-ो imperatives: करो, देखो, ढूँढो; तू forms: कर, देख) must not appear
in user-addressed text. Because these forms are distinct tokens, run the check
mechanically: search for तुम/तू/तेरा/तुम्हारा and for -ो-final imperatives of the
catalog's common verbs. तू is worse than तुम — it reads as insult from a product,
not informality — but both are the same defect class and both are critical, not
stylistic: register violations are the errors Hindi-speaking users actually
notice and screenshot.

**Exception:** quoted third-party content, song or literary quotations, and
strings that render *another user's* words pass through untouched — the rule
governs the product's own voice only.

## HI-HONPLUR · आप takes plural agreement, always

**Trigger:** writing or reviewing any conjugated verb, participle, or possessive
in an आप-addressed sentence.

**Rule:** आप is grammatically plural even when addressing one person. Verbs,
auxiliaries, and participles agree plural: आप करते हैं (never आप करता है), आपने
सहेजा है with plural concord where the construction demands it, क्या आप निश्चित
हैं (never है). The possessive is आपका/आपकी/आपके agreeing with the *possessed*
noun's gender and number — आपकी फ़ाइल, आपके टेम्पलेट — not with आप. The
half-formal hybrid (आप with a singular or तुम-form verb: आप करो) is a real and
common MT output and is exactly as wrong as bare तुम.

**Source:** standard Hindi grammar; the hybrid-form warning is field experience
with statistical and neural MT output, which mixes registers mid-sentence more
often than humans ever do.

## HI-IMPER · commands use the -ें honorific imperative

**Trigger:** buttons, menu items, command labels, and instruction sentences.

**Rule:** the imperative for buttons and instructions is the आप-imperative in
-ें (with ँ where the verb stem nasalizes): सहेजें (save), हटाएँ (delete), भेजें
(send), रद्द करें (cancel), पुनः प्रयास करें (retry), जारी रखें (continue). Never
the bare stem (कर, देख) and never the -ो form (करो, ढूँढो). For longer prose
where extra courtesy fits — help text, apology strings — the -इए form (कीजिए,
देखिए) is available, but a catalog should pick one imperative register per
surface class and hold it; mixing करें and कीजिए across sibling buttons reads as
two translators, not two tones.

**Source:** the published vendor style guides prescribe the honorific imperative
explicitly (फिर ढूँढें, not ढूँढो) and label the -ो forms rude in product text.

**Exception:** none for buttons. In error text, prefer the negative-polite न
करें / नहीं की जा सकी phrasings over blunt prohibitions; the imperative morphology
still stays honorific.

## When not to use this

Do not extend the register rules to text the product merely transports:
user-generated content, third-party API messages, quoted material. And do not
let register enforcement drift into rewriting sentence *tone* — a string can be
perfectly आप-registered and playful; the anchor governs morphology, and a
finding against tone needs its own anchor or it is taste.
