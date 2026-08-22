---
layer: golden-path
type: golden-path
subject: generated-asset-world-scale
status: forged
use_when: [importing a generated mesh into a real-time engine, a generated hero looks the same size as a crate, deciding what real-world size an asset class should have, wiring the unit and axis conversion at an import boundary]
techniques:
  - generator-normalization-band
  - nominal-extent-only-where-honest
  - import-scale-derivation
  - unit-convention-at-the-engine-edge
  - reference-skeleton-size-check
---

# Generated asset world scale

A generative 3D service does not know how big the thing it made is. It cannot: it was
handed a picture or a sentence, and neither carries a ruler. What it does instead is
normalise — it fits every result into the same box, so the longest bounding-box extent
of everything it returns is approximately one unit. A character, a crate, and the grip
of a sword all come back the same size.

That is a reasonable choice by the generator and a catastrophic one for whoever receives
the output, because size relative to a character is the property a game depends on most:
collision, reach, camera framing, physics mass, texel density, navigation and the entire
read of a space are all downstream of how big things are. The subject is therefore not
"how do I scale a mesh". It is: **the size information was destroyed upstream, and it has
to be deliberately re-established at the receiving end, from something real.**

## The three quantities, and which of them may be assumed

Everything in this subject is bookkeeping over three numbers, and the discipline is
entirely about where each one is allowed to come from.

| Quantity | Where it may come from | Where it may NOT come from |
| --- | --- | --- |
| **Measured extent** — how big the delivery actually is | measuring the delivered geometry | the generator's own claim; the value it was normalised to |
| **Target extent** — how big it was supposed to be | a stated nominal for a class that has an honest one, otherwise the author of the request | a class-wide default invented to avoid asking |
| **Import scale** — the correction | dividing target by measured | a hand-tuned constant, a per-asset fudge, or a global setting |

Read that table as a hierarchy of honesty. The measured number is the only one that is
free; you can always get it. The target is the expensive one, because it is a fact about
intent that lives outside the asset. The scale is never a fact at all — it is a
derivation, and the moment anyone types it by hand instead of dividing, the pipeline has
acquired a second authority for a quantity that already had one.

## The normalisation is a measurement, not a rumour

The claim "generators normalise to a unit box" is worth exactly as much as the corpus
behind it. Measure it: take every asset a pipeline has actually received, across
providers and asset classes, and record the longest extent of each. What comes back is a
tight band around one unit — a hero character, a storage crate and a sword hilt all
within a few percent of the same figure, the hilt (a twenty-centimetre object) as long
as the character who holds it.

A band measured that way is load-bearing where an assumption is not. It lets a receiving
system say *this delivery is raw generator output whose real size is unknown* as a
positive detection, and it makes that detection falsifiable: a provider that changes
behaviour moves out of the band and is noticed. Treat the band as a measured constant
with a date and a corpus size attached, and re-measure when the provider set changes —
[a-number-carries-its-unit-and-basis](../../_laws.md#a-number-carries-its-unit-and-basis)
applied to the pipeline's own constants.

## Why a nominal size is only sometimes honest

Here is the distinction that carries this whole subject, and it is an epistemics rule
wearing a geometry costume.

You may assert a real-world size for a humanoid character, because the genre fixes it.
A playable humanoid is somewhere between 1.7 and 1.9 metres; the reference skeleton the
animation set is authored against pins it exactly; every animation, every step length,
every door frame and stair riser in the level kit already assumes that number. The
nominal is not a guess, it is a restatement of a decision the project made elsewhere.

You may **not** assert a real-world size for "a prop". Props range over three orders of
magnitude — a coin, a lantern, a wagon — and any class-wide default is a coin flip
dressed as a specification. The same is true for weapons (a dagger and a two-handed
greatsword are one class), for environment pieces, and for modular kit parts.

So the rule is: **a class gets a nominal extent only where the class has exactly one
honest answer, and the table of nominals is deliberately, visibly short.** Where no
honest nominal exists, the size must come from whoever commissioned the asset, and a
system that lacks it must *ask* rather than default. Inventing a default here does not
add information; it launders an unknown into a number that reads as authoritative and
then propagates into collision and camera work. An unrequested size is unrequested —
[unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass) — and the honest
verdict for a mesh with no target is *not gradeable*, never *fine*.

The temptation to fill the table is strong, because an empty cell blocks automation. It
should block automation. That is the cell doing its job.

## Two independent statements of the same finding

The normalisation behaviour tends to be discovered twice by different routes: once by
measuring a corpus of received files, and once by a practitioner writing down the import
gotcha after a hero shipped at just over half the height of everything around it. When a
measured corpus and an independently written practice note agree on the same figure from
different evidence, that is a strong fact — much stronger than either alone — and that
convergence is worth deliberately looking for before hard-coding any constant a pipeline
will rely on.

## Size is not proportion

An asset can be exactly the right height and still be wrong. Scale correction is uniform
by construction — one factor on every axis — so it fixes *size* and cannot fix *build*. A
generated humanoid with short legs relative to its torso will, after correction, stand
exactly as tall as the reference skeleton and still be wrong, in a way that only appears
once animation authored for the reference proportions is retargeted onto it and the feet
slide or the hands miss the weapon grip.

Hence a second check alongside the size one: compare the delivery's segment proportions
against the reference skeleton's, not just its total height. The reference skeleton is
the right authority for both, because it is where the canonical character height already
lives; duplicating that height as a separate constant elsewhere is exactly the failure
[one-authority-per-quantity](../../_laws.md#one-authority-per-quantity) describes. The manual
version of this check is the long-standing habit of importing the reference skeleton into
a modelling package purely as a size reference; the automated version reads its height and
segment lengths and reports the comparison.

## Tolerance is not a global constant

How much scale error is acceptable depends entirely on what the asset has to align with,
and this is the part most pipelines get wrong by having one number.

- **A free-standing prop** tolerates several percent. Nobody perceives a rock that is 4%
  large, and no other asset depends on its exact extent.
- **A modular kit piece** tolerates almost nothing. Assets that snap to a grid have a
  strict scale contract: a wall segment 2% short leaves a visible seam every repetition,
  and the error accumulates along a run rather than averaging out. The same 2% that is
  invisible on a rock is catastrophic on a wall.
- **A character** is bounded by its animation, not by perception: the tolerance is
  whatever keeps retargeted motion from producing foot slide and mismatched interaction
  heights.
- **An attachment** (a weapon in a hand, a helmet on a head) is bounded by the socket it
  attaches to, which means its tolerance belongs to the parent, not to itself.

State the tolerance per class next to the nominal, and grade against the class's number.
A single global tolerance is either too loose for the kit or too tight for the rock.

## Where the correction belongs in the line

Scale correction is the *last* thing to settle and the *first* thing to decide. Decide
the target extent at commissioning time, before anything is generated, because it is an
input to the brief and to the geometry budget. Apply the correction at the import edge,
after retopology, unwrap and baking — the finishing bench works in the generator's
normalised space perfectly happily, and rescaling mid-bench only lets one stage disagree
with another about which space it is in. Between those two points the target rides along
with the asset as declared intent, carried but not acted on. What must never happen is a
correction applied *twice* — once by a rescale in a modelling package and once by an
importer setting — the signature of a pipeline where the correction lives in two places.

## Failure modes of the naive reading

- **Treating the import scale as a setting to tune.** It is a derived quantity. The
  moment someone nudges it until it looks right, the target extent has been silently
  redefined and no longer matches the design.
- **Believing the unit is wrong when only the size is.** Generated output is usually in
  the *correct* unit and the *wrong* size. Applying the hundredfold unit correction that
  a different pipeline needed produces an asset wrong by two orders of magnitude, and the
  team then adds a compensating factor elsewhere. Diagnose unit errors and size errors
  separately; they have different signatures (a round factor versus an arbitrary one).
- **Letting an unrequested size read as a pass.** A scorecard that shows no complaint
  about scale because nobody stated a target is reporting silence as compliance.
- **Fixing scale in the level instead of the asset.** A per-instance scale in a scene
  fixes one placement and leaves the source asset wrong for every future use, and it
  breaks physics and navigation, which read the asset's own bounds.
- **Assuming a delivery outside the normalisation band was authored at world scale.** It
  may equally be a delivery that has already been corrected once. Provenance matters; a
  bare number cannot distinguish them.

## What this subject does not own

Structural grading of a generated mesh — shell counts, floaters, manifold integrity — is
a separate concern, as are the retopology, unwrap, bake and rig-binding stages of the
finishing bench and the gating of input images before generation. Geometry density
budgeting is the closest cousin: the same law applied to a different quantity, and the
two travel together because both are numbers commissioned before generation, delivered
without their basis, and only meaningful when measured back. The general craft of
prompting and routing generative providers belongs to the wider generative-media
discipline; what belongs here is only whether the output can be the right size.
