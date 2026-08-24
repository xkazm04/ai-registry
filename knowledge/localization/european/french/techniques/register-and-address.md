---
layer: technique
type: technique
subject: french
technique: register-and-address
status: forged
laws: [the-authority-is-a-hypothesis]
shared_with: []
use_when: [setting the address policy for a French product, reviewing tone and formality in French strings, deciding how error messages address the reader]
---

# Register and address

French encodes formality grammatically, so register is not a copywriting mood —
it is inflected into every second-person verb, possessive and pronoun. The
decisions here are made once, recorded in the locale contract, and enforced as
anchored rules thereafter.

## FR-VOUS · Formal address, product-wide

> **Trigger** — any second-person string: imperative, possessive, pronoun.
> **Rule** — address the user as **vous**, without exception in professional,
> B2B, developer and transactional products: possessives *votre/vos*,
> imperatives in the vous-form (*Sélectionnez*, *Enregistrez*), object pronouns
> *vous*. *Tu* is a deliberate consumer-brand posture, chosen explicitly or not
> at all — and even a *tu* brand returns to *vous* on legal, payment and
> security surfaces.
> **Source** — the Microsoft French style guide assumes *vous* throughout its
> examples; the formal-only rule is the near-universal French software default.
> **Exception** — none within one surface. The failure mode is leakage, not
> misselection: conversational or assistant-style surfaces are where *tu* slips
> in, because chat idiom pulls informal. Audit those surfaces specifically.

A register audit is cheap to mechanize at the first approximation: *tu / ton /
ta / tes / toi* plus the tu-form verb endings are greppable, and in a
vous-product every hit is a finding. The reverse audit (a *tu* product leaking
*vous*) is rarer because translators default formal.

## FR-IMPERSONAL · Address the reader, don't hide behind a construction

> **Trigger** — *on*, existential *il y a*, *il faut*, *c'est*, and sentences
> opening with *impossible de…*.
> **Rule** — prefer the personal construction. Where the source says "We were
> unable to…", match it — *Nous n'avons pas pu…* — rather than reaching for an
> impersonal form. French software voice addresses a *vous* and speaks as a
> *nous*; the impersonal register reads as administrative prose.
> **Source** — Microsoft French style guide §2.1.4 (words and phrases to
> avoid).
> **Exception** — temporal *il y a* (*il y a huit mois*, "eight months ago") is
> not the existential construction and is correct. A naive probe that flags
> every *il y a* produces false findings; the rule targets *il y a* = "there
> is/are".

The *Impossible de…* opener deserves its own note, because it is the most
common French error-message idiom in the wild and many shipped catalogs carry
it at scale. Converting a large installed base to *Nous n'avons pas pu…* is a
house decision with a real blast radius — count the sites first, decide once,
sweep completely, per
[the authority is a hypothesis until counted](../../../_laws.md#the-authority-is-a-hypothesis).
Until that decision is recorded, a reviewer flags new strings but does not
half-sweep the old ones.

## FR-FORMAL · Plain verb, not the periphrasis

> **Trigger** — formal periphrases inflating a plain verb.
> **Rule** — *pouvoir*, not *avoir la possibilité de* or *avoir l'opportunité
> de*; *demander*, not *requérir*; *devoir*, not *nécessiter*; *recommander* or
> *conseiller*, not *faire une recommandation*. Formality in French lives in
> the *vous*, not in Latinate vocabulary; the periphrasis adds length (which
> French can least afford) and administrative distance, not politeness.
> **Source** — Microsoft French style guide §2.1.4.

## Tone calibration beyond the anchors

- **Exclamation restraint.** Do not add exclamation marks the source lacks;
  French professional register tolerates fewer than English marketing copy, and
  each one costs a mandatory non-breaking space besides.
- **Warmth is dialed, not translated.** English "Wonderful, welcome aboard!"
  can land over-effusive as *Merveilleux !*; the reviewer's question is what
  register the surface calls for (a hiring confirmation is not a game reward),
  and the honest disposition for an unanchored tone call is a native-review
  queue, not a unilateral rewrite.
- **The imperative is the default for instructions and buttons**, in vous-form,
  active voice; the style guide steers away from the subjunctive and the
  passive where the indicative or imperative serves. Noun-phrase labels are a
  legitimate UI register — that boundary belongs to the interface-conventions
  technique.

## When not to apply this

Register rules govern the product's own voice. Quoted user content, candidate-
or customer-authored text, and testimonial copy keep their author's register.
And a marketing landing page may deliberately run warmer than the console it
sells — that is a recorded per-surface register decision, not a defect, so long
as it is one decision and not a drift.
