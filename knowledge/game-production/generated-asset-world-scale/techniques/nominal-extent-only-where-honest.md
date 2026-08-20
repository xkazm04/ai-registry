---
layer: technique
type: technique
subject: generated-asset-world-scale
technique: nominal-extent-only-where-honest
status: forged
laws: [unmeasured-is-not-a-pass, one-authority-per-quantity]
use_when: [building a table of default sizes per asset class, tempted to add a default so automation stops blocking, deciding whether a system may size an asset without asking]
---

# Nominal extent only where honest

## The concern

Once a pipeline can correct scale, someone will want a table of default sizes per asset
class so the correction can run unattended. That table is the most dangerous artifact in
the subject, because every row in it looks equally authoritative and only some of the rows
are true.

A class has an honest nominal extent when the class has exactly **one** answer that the
project has already decided elsewhere. It does not have one when the class spans a range,
however tidy the class name looks in a dropdown.

## The test

Ask: *if I state this number and I am wrong, what was I wrong about?*

- **Honest.** A humanoid character. The reference skeleton fixes its height; every
  animation, every stair riser, every doorway in the kit already assumes it. Stating it is
  restating a decision, not making one. Being wrong here means the project's own canonical
  height is wrong — a discoverable, single-source error.
- **Not honest.** A prop. A coin, a lantern, a wagon, a siege engine. The class spans
  three orders of magnitude, so any default is a guess, and being wrong means being wrong
  about *this asset*, invisibly, with no source to check against.
- **Not honest.** A weapon. A dagger and a two-handed greatsword share the class.
- **Not honest.** An environment piece or a modular part. Their size is set by the level's
  grid and layout, which is a design decision per kit, not a property of the class.

A well-formed table is therefore conspicuously short — often a single row — and its
shortness is the signal that someone applied the test rather than filling in cells.

## Procedure

1. **Start the table empty.** Add a row only when you can name the external decision the
   number restates and point at where that decision lives.
2. **Make the absence of a row a first-class outcome.** A lookup that misses returns
   *no honest nominal for this class*, not a fallback, not zero, not the normalisation
   figure.
3. **Route the miss to the author.** The commissioning surface asks for the intended
   longest extent when the class has no nominal, and the request carries that number
   forward as declared intent. Asking is cheap; a silently mis-sized asset is not.
4. **Record which way the target arrived** — from the class nominal or from the author —
   alongside the value. Two numbers with the same value and different provenance are not
   interchangeable when the nominal later changes.
5. **Never let the nominal be the second copy of a value that exists elsewhere.** Where
   the honest nominal is the canonical character height, read it from the authority that
   owns that height rather than typing it again.

## Decision rules

- **When automation blocks on a missing nominal, that is the correct behaviour.** The
  urge to unblock it with a plausible default is the failure this technique exists to
  prevent. An empty cell doing its job looks exactly like a bug.
- **When a class "usually" has a size, it does not have a nominal.** "Usually" means a
  distribution, and a distribution's mean is not a specification for any member of it.
- **When an author states a target, it wins over any class nominal.** The nominal is the
  fallback for the common case, never an override of stated intent.
- **When a class nominal changes, re-grade every asset that was sized by it, and leave
  every author-sized asset alone.** This is only possible if step 4 was done.
- **When no target exists at all, the verdict is not-gradeable.** Not *passes*, not a
  neutral score. A missing target and a satisfied target are different epistemic states.

## The general rule underneath

This is not a geometry technique. It is the rule that a system may assert a value only
where an authority for that value exists, and must ask otherwise — the same discipline
that forbids inventing a default deadline, a default severity or a default owner. Geometry
just makes the consequence unusually visible: the wrong default walks onto the screen at
the wrong height and everyone can see it. In quieter domains the same invented default
survives for years.

## When not to use it

- **On a genre with a hard universal metric.** Some projects genuinely fix a size per
  class by design law — a tile-based world where every prop occupies a grid cell. Then the
  nominal is honest for every class, because it restates a real decision. The test passed;
  the technique is satisfied, not bypassed.
- **On a class of one.** If a class holds a single asset, the nominal and the author's
  target are the same statement; keep whichever one has an owner.
- **As a reason to refuse a preview.** Blocking a final import on a missing target is
  right; blocking a rough look at the geometry is not. Show it, labelled unsized.
