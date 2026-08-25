---
layer: technique
type: technique
subject: bengali
technique: register-and-address
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [choosing or auditing the address register of Bengali UI text, reviewing imperative and possessive forms, deciding whether a politeness word belongs in a string]
---

# Register and address

Bengali address is a three-step system, and each step selects verb morphology:

| register | pronoun | "your" | imperative of করা | reading |
|---|---|---|---|---|
| formal | আপনি | আপনার | করুন | respect; strangers, professional contexts |
| familiar | তুমি | তোমার | করো | peers, friends, most family |
| intimate | তুই | তোর | কর | close intimacy or condescension |

The register lives in the verb ending as much as in the pronoun, so a string
with no pronoun at all — which is most UI strings, since Bengali drops
recoverable pronouns freely — still commits to a register through its
imperative. There is no register-neutral way to tell a user to do something.

## BN-APNI · আপনি is the software register

**Rule.** Address the user as আপনি with the matching formal verb morphology
everywhere: imperatives and button verbs in **-উন/-ুন** (সংরক্ষণ করুন, মুছুন,
বাতিল করুন, চালিয়ে যান), possessives as **আপনার**, question forms in the formal
ending (মুছবেন? not মুছবে?). Never a তুমি-form (করো, দেখো), never a bare root
(কর, দ্যাখ).

**Source.** Microsoft's Bangla (Bangladesh) and Bangla (India) style guides and
Mozilla's bn-BD guide all prescribe আপনি for addressing the user; a mature
consumer catalog audited for this subject held hundreds of আপনি/আপনার forms
against zero তুমি/তুই — a fully settled convention, not a lean.

**Exception.** A product whose voice is deliberately intimate (children's
products, some social apps) may rule for তুমি — but that is a recorded house
ruling in the consuming repo, applied catalog-wide, never a per-string choice.
The one register mix that is *never* correct is an inconsistent one: a single
catalog carrying both করুন and করো for the user is a defect regardless of which
register the house chose.

**Audit trigger.** Any তুমি/তোমার/তুই/তোর token, or any imperative not ending in
-ুন/-ুন-class morphology, in a catalog with no recorded তুমি ruling.

## BN-NOGENDER · no gender agreement — stop looking for it

**Rule.** Bengali verbs, adjectives and pronouns do not inflect for gender.
সে is "he" or "she"; করেছেন is "did" for anyone. A reviewer arriving from Hindi
or another gendered Indic language must *not* flag Bengali strings for missing
gender marking, and a translator must not import gendered paraphrases to
"clarify" — the ungendered form is the correct, complete form.

**Why it earns an ID.** The absence is load-bearing twice. It removes an entire
error class that plagues Hindi/Urdu localization (source strings addressed to a
user of unknown gender), so Bengali needs no "rewrite to avoid gender"
workarounds — do not copy them in from a sibling locale's guide. And it gives
false positives a name: an audit fan-out across Indic locales needs an anchor
saying *this check does not apply here*, or smaller review models will invent
findings. Citable absence is the point.

**Exception.** A handful of animate noun pairs are lexically gendered
(ছাত্র/ছাত্রী "student"); this is vocabulary, not agreement, and UI copy about
users should use the unmarked form.

## BN-NOPLEASE · the ending already carries the politeness

**Rule.** Do not stack দয়া করে / অনুগ্রহ করে ("please") on the formal
imperative in ordinary UI copy. The -উন ending is itself the politeness marker;
"please" on every button and instruction reads as stilted over-translation, the
Bengali equivalent of writing "kindly do the needful". Reserve an explicit
please for a genuinely high-stakes, irreversible confirmation.

**Trigger.** দয়া করে or অনুগ্রহ করে in a routine instruction, button, tooltip
or error string — especially one whose English source also said "please",
which is where the calque comes from.

**Exception.** Legal or consent copy where the source's "please" is doing real
work, and the rare apology-adjacent error string where the product is asking
the user to absorb an inconvenience. Both are judgment; the button case never
is.

## When not to over-apply

Register rules govern text addressed *to the user*. Text where the user
addresses the machine (search placeholder text, command phrasing) is
conventionally imperative-familiar or bare-infinitival in Bengali software —
Mozilla's bn-BD guide explicitly permits তুমি toward the machine — and log-like
status text (সংরক্ষণ হচ্ছে…) addresses nobody and carries no register at all.
Flag register only where a reader is being addressed.
