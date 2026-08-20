---
layer: technique
type: technique
subject: public-verdict-badge
technique: customization-scope-guard
status: forged
laws: [one-validation-door, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding which badge parameters an embedder may set, a request to allow custom colours, hardening a public rendering endpoint against parameter abuse]
---

# Customization scope guard

Every public rendering endpoint accumulates parameters. Embedders want the
artifact to fit their page: a different label, their own wording, a style that
matches the surrounding chrome, a colour that does not fight their palette.
Most of that is reasonable and should be granted, because a badge that clashes
with every page gets replaced by a hand-made one carrying a number you no
longer control. The technique is drawing the line — not between "few" and
"many" parameters, but between **cosmetic dimensions and meaning-bearing
channels** — and then enforcing it where rendering happens rather than in
documentation.

## The two classes

A parameter is **meaning-bearing** if changing it changes what a viewer
believes about the subject, without changing what the assessment found. The
test is a viewer test, not a data-model test: does a glance at the artifact
now yield a different conclusion?

- **Meaning-bearing (closed):** the verdict fill colour; the value text; the
  threshold, bar, or rubric version the verdict is computed against; whether a
  qualifier is displayed; the subject identity.
- **Cosmetic (open):** the label text; the badge geometry or style variant;
  the logo or mark; scale; a colour for **neutral states only**, where there
  is no verdict for a hue to misrepresent.

The single most important entry in that table is the verdict fill. Hue is the
most-glanced channel in the artifact — it is read pre-attentively, before any
glyph is parsed, and for a large minority of viewers it is the *only* channel
consumed. An embedder who can render a failing verdict on bright green has
undone, with one query parameter, every other honesty guard the badge carries:
the qualifier in the value, the neutral vocabulary, the cache policy. The
guards are all downstream of a channel the viewer already read.

The neutral-state exception is what makes the rule shippable rather than
merely strict. Embedders who ask for colour control overwhelmingly want the
*non-verdict* case to blend in — the grey placeholder that appears before
anything has been assessed, sitting awkwardly in a dark-themed page. Granting
colour exactly there costs nothing, because a neutral state asserts nothing
that a hue could contradict, and it removes most of the pressure to grant it
where it would be fatal.

## Meaning parameters may tighten, never weaken

Some meaning-bearing parameters cannot be removed from the caller's reach —
a gate bar, a rubric variant, a minimum threshold. For those the rule is
directional: **a caller parameter may only make the verdict harder to earn.**

The scenario this prevents is concrete. An organization configures a bar for
its subjects. A badge endpoint that merges caller parameters over the archetype
default, ignoring the configured bar, will happily render a confident pass for
a subject that the enforcing pipeline fails — the artifact quietly advertising
a bar the owner had already raised. Worse, any embedder can then relax a
threshold in a query string and mint a green verdict for themselves.

The structural fix has two halves:

- **One authority for the bar.** A persisted owner-level policy, where one
  exists, is the baseline for every surface that asserts the verdict — the
  badge, the enforcing check, the administrative view, the documentation
  snippet. A surface that resolves the bar independently is a surface that
  will disagree, and the disagreement will surface publicly.
- **A tighten-only merge.** Caller parameters overlay the baseline through a
  merge function that takes the stricter of the two per field, never the
  supplied value outright. Where no owner policy exists, caller parameters may
  set the bar over the default — but the merge function is the only path in
  either case.

Label text is genuinely cosmetic, with one caveat worth stating: a label is
free to be *wrong* in a way that misleads, and you cannot prevent that, since
an embedder could always place arbitrary text next to the image. What you can
guarantee is that the **value** — which is where the qualifier lives — is
never author-supplied. That asymmetry is the reason the qualifier belongs in
the value in the first place.

## One door, not one check per route

Parameter allowlisting is a
[one-validation-door](../../_laws.md#one-validation-door) problem. Validation
spread across each route is validation minus the route someone adds next
quarter, and the route added next quarter is exactly the one written in a
hurry against a deadline. The structural form:

- **One render function owns the artifact.** Routes resolve a subject and an
  outcome; they do not compose the artifact. The render function takes a typed
  options object, not a raw query bag.
- **The allowlist is positive.** Named, typed, enumerated dimensions with
  defaults. A denylist of forbidden parameters is a list of the abuses someone
  already thought of.
- **The guard is expressed in the type, where possible.** If the neutral-state
  colour option only exists on the neutral-render path's parameter type, the
  verdict path *cannot* accept it, and the rule survives refactoring by people
  who never read this document. A comment saying "do not pass a colour here"
  survives until the first merge conflict.
- **Unrecognized parameters are ignored, not echoed.** Never reflect an
  unknown parameter into the output; that is how a rendering endpoint becomes
  a content-injection surface.

## Sanitizing the values you do accept

Accepting a dimension is not accepting arbitrary input in it.

- **Colours** are parsed against a strict pattern and a named palette, and
  rejected — falling back to the default, not erroring — otherwise. Never
  interpolate a caller string into the rendered markup.
- **Text** is length-capped and escaped for the output format before it is
  placed in the document. An embeddable image is markup; caller text inside
  markup is an injection vector, and the artifact is served from your origin
  under your name.
- **Numbers** are clamped to a sane range. A scale parameter with no ceiling
  is a request-amplification lever. So is an uncapped text length or an
  unbounded embedded image: the rendered artifact's size scales with both, on
  an unauthenticated endpoint.
- **Embedded imagery is inlined and non-executable.** A caller-supplied mark
  is accepted only as an inline encoded payload — never a remote address,
  which would make your renderer fetch arbitrary hosts on every request — and
  only in raster types. A nested vector image is markup, and markup can carry
  script; accepting one inside an artifact your origin serves as an image
  hands the caller script execution under your own domain, for every viewer of
  every page that embeds it.
- **Contrast is recomputed after customization.** If a caller supplies a
  neutral fill, the foreground is selected against *that* fill by luminance,
  not left at the default. Customization that produces unreadable output is
  indistinguishable from a broken endpoint.

## Procedure

1. **Inventory every parameter the endpoint currently accepts.** Classify each
   against the viewer test above.
2. **Move meaning-bearing parameters out of the caller's reach**, or, where a
   parameter genuinely must be caller-set (a threshold, say), pin it in the
   generated snippet so the value is an author's explicit choice rather than a
   drifting default.
3. **Collapse rendering to one function** with a typed options object; delete
   per-route composition.
4. **Write the allowlist positively**, with the neutral-only colour option
   living on a type the verdict path cannot reach.
5. **Sanitize on the way in, recompute contrast on the way out.**
6. **Document the open set publicly.** Embedders who know what they may change
   stop asking for what they may not.

## When not to use this

- **Not on private or authenticated renderings.** An internal report surface
  or an owner's own dashboard can offer full theming; there is no third-party
  viewer being misled.
- **Not as an argument against theming entirely.** Refusing all customization
  drives embedders to screenshot the badge and hand-edit it, which is strictly
  worse: you lose freshness, the cache policy, and the reach signal, and gain
  an unversioned image that asserts an old verdict forever.
