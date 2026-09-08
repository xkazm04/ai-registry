---
layer: technique
type: technique
subject: narrative-scroll-surface
technique: illustration-carries-the-claim
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [choosing the art for a step of an explanatory page, an illustration decorates a claim without evidencing it, mockup art looks small beside the display copy next to it, deciding whether a graphic element is content or decoration]
---

# Illustration carries the claim

Every graphic element on an explanatory page belongs to one of two
populations, and they have opposite obligations. **Informative art** is
evidence for a claim the page makes and is therefore content. **Decorative
art** carries no claim and is therefore furniture. The failure this technique
exists to prevent is a page in which everything is furniture and the claims
are unsupported — the default outcome, because furniture is cheaper to make,
never goes stale, and looks the same at a glance.

## The litmus

Ask one question of the element: **if this claim were false, would the picture
change?**

If yes, it is informative. A reduced screen showing the extracted requirements
would look different if extraction did not work; a sample record would look
different if the fields were not captured; a transcript excerpt would look
different if the conversation did not happen.

If no, it is decorative. A gradient, a connector curve, an abstract card with
placeholder lines, a floating shape — these look identical whether the claim
is true, false, or absent.

Two corroborating tests when the first is uncomfortable:

- **The swap test.** Move this station's art to the next station. If nothing
  reads as wrong, the art was evidencing nothing. Run it across the page and
  the count of swappable pieces is a measure of how much of the page's art is
  doing work.
- **The caption test.** Write, in one line, what the reader should notice in
  this image. If the line is a restatement of the heading, the image is
  decoration with a claim pinned to it.

## Informative art is a faithful reduced mockup

The standard for informative art is that it is a **reduced but not falsified**
rendering of the real artifact: the real screen with its real controls in
their real arrangement, the real record with its real fields, the real message
in its real shape — simplified by removing what does not bear on the claim,
never by inventing what the product does not do.

Three rules make "faithful" checkable:

- **Nothing appears that the product does not have.** A control drawn into a
  mockup is a promise, and a reader who arrives looking for it and cannot find
  it has learned that the page lies. This is the single most damaging failure
  in the technique, because it converts an explanatory page into a credibility
  liability.
- **Sample values are plausible and obviously sample.** Real-looking data
  carries the shape of the artifact, which is the point; a number that reads
  as a *metric* — an accuracy, a saving, a count of users — is a claim in its
  own right and does not belong in an illustration, because nothing there
  states where it came from.
- **The simplification is subtractive.** Remove chrome, remove rows, remove
  states. Do not rearrange, do not re-colour a control into something it is
  not, do not merge two screens into one screen the product cannot show.

### Faithful art is a derived copy, and it decays

This is the cost the technique accepts and must therefore state. A mockup is a
copy of an artifact that keeps changing, and there is no mechanism in it that
notices when it has diverged. The page keeps confidently showing a screen the
product redesigned two releases ago, and it goes on doing so until a human
happens to look at both.

So a mockup names its recomputation path
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
what real artifact it is a copy of, and what event obliges someone to re-check
it. The strongest form is a coupling that a routine check can see — the
artifact and its illustration named together in whatever registry the project
keeps for source-to-document coupling — so that changing the real screen
raises the question. The weakest acceptable form is a stated owner and a
stated trigger written beside the art. What is not acceptable is a mockup with
no recorded relationship to the thing it depicts, because that is the state in
which nobody can even tell whether it is still true.

Where the divergence risk is intolerable, the alternative is to stop copying:
render the illustration from the same source the product renders from, so it
cannot drift. That is more expensive and is the right trade only for the one
or two artifacts the page's whole argument rests on.

## Decorative art is inert, and rationed

Decoration is legitimate. A page of nothing but faithful mockups is a
catalogue, and the flourish is part of what makes a reader stay. The rules are
about keeping it from doing work it cannot do:

- **It is hidden from assistive technology.** A decorative graphic announced
  to a non-visual reader is noise between two sentences, and there is no text
  that could accompany it honestly, because it means nothing.
- **It carries no text.** A word rendered inside decorative art is content
  hiding in furniture: unsearchable, untranslatable, unselectable, and
  invisible to every reader who does not see it.
- **A flourish is spent once per page.** This is the rule most often broken by
  accretion rather than by decision. A distinctive decorative gesture — a
  drawn arrow, a hand-sketched circle, a signature texture — reads as
  intentional the first time, as a motif the second, and as wallpaper the
  third. Each addition looked like an improvement in isolation, which is why
  the budget has to be a rule rather than a judgment made at each site.

## The type-scale problem, and why it is a block-level fix

There is a specific and non-obvious defect where the two populations meet.
Mockup art is drawn at the *product's* text sizes, because that is what makes
it faithful. It is then placed beside a station's *display* copy, which is
several steps up the scale. In that neighbourhood the mockup's text reads
roughly a full step smaller than it should — not because it is wrong, but
because perceived size is relative to what surrounds it, and the mockup's
context has changed from an application to a poster.

The naive repair is to bump the sizes of the elements that look worst. That
produces art whose internal proportions no longer match the product's, which
is exactly the falsification the fidelity rule forbids, and it produces it
gradually, one element at a time, so no single edit looks like the moment it
happened.

The correct repair is a **uniform scale lift applied to the illustration block
as a whole**: one rule, one place, every text size inside the mockup moving
together. The internal proportions are preserved, the art is legible beside
display copy, and the adjustment is a single edit a designer can retune rather
than a diffuse set of overrides nobody can reconstruct. State it where the
block is defined, not at the call sites.

Two details that decide whether the lift stays maintainable:

- **It re-states absolute sizes; it does not multiply.** A lift expressed as a
  factor over whatever the surrounding scale happens to be will compound the
  moment an illustration block ends up nested inside another lifted block, and
  the compounded result is nobody's decision. Absolute values at each rung
  cannot compound.
- **It is opted into per illustration block, not applied page-wide.** The
  lift's justification is specific — this art was drawn at product sizes and
  sits beside display copy — and a page-wide version silently enlarges text
  that was never in that situation.

A related rule about text *inside* informative art: it is real, translatable
copy, carried by the same mechanism as the rest of the page. Baking it into
the picture is what the decorative rules forbid, and the excuse for doing it —
"they are only stylised labels" — expires the moment the page is served in a
second language. What legitimately stays untranslated inside a mockup is
narrow and should be enumerated where it is decided: invented proper names,
technology names, and sample numerals.

## When not to use this

- **Pages whose reader has already decided.** A reference document's reader
  wants precision, not evidence; a diagram there answers a different question
  and is governed by the reading surface's rules, not these.
- **Claims that are genuinely non-visual.** A claim about price, about a
  policy, about what happens to data has no faithful picture, and inventing
  one produces the empty art this technique is against. Some claims are made
  in words and left there.
- **Artifacts that cannot be shown.** Anything containing real personal or
  customer data is not eligible to be a faithful mockup; the fabricated
  substitute is still informative, and the fabrication is what makes the
  "obviously sample" rule non-negotiable.

## What this technique refuses

- Art that would be equally at home beside a different claim on the same page.
- A control, a field, or a capability drawn into a mockup that the product
  does not have.
- A metric-shaped number inside an illustration.
- Text baked into decorative art.
- A decorative element announced to assistive technology.
- Per-element font-size patching inside a mockup to make it read larger.
- A faithful mockup with no recorded relationship to the artifact it copies.
