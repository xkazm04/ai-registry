---
layer: technique
type: technique
subject: shader-budget-authoring
technique: surface-to-shading-model-map
status: forged
laws: [one-authority-per-quantity, law-and-check-share-one-source]
use_when: [turning a plain-language surface brief into material settings, deciding which shading path a surface requires, building authoring guidance that must survive a renderer upgrade]
---

# Surface-to-shading-model map

## The concern

The brief arrives as a phrase: *polished marble*, *wet asphalt*, *frosted glass*,
*human skin*, *dusty canvas*. Somewhere between that phrase and a compiled material,
someone decides a shading path and a set of property ranges. If that decision lives in
practitioners' heads it is made differently by each of them, it is invisible to the
cost estimate, and it is impossible to check.

The technique is to write the mapping down once, as data — surface vocabulary to
shading path, and plain-language adjectives to physically-based property ranges — and to
have every consumer read the same copy: the authoring surface that suggests a starting
point, the estimator that costs the material before it exists, and any analyser that
grades a finished one.

## Procedure

1. **Enumerate the shading paths the renderer actually offers**, not the ones the
   standard describes. A typical set is: an opaque default, a subsurface path, a
   clear-coat path, a cloth path, a transparent path, and an unlit path. Each has a
   different cost baseline and some have hard prerequisites.
2. **Write the forced mappings first.** Certain descriptions do not get a choice. Skin
   and foliage are subsurface. A lens, a liquid volume, or anything described as clear is
   transparent. Cloth and hair have their own paths where the renderer provides them.
   Record these as *forced*, not as *defaults* — the distinction is load-bearing, because
   a forced expensive path is a fact to negotiate with the requester, while a default is
   something an author is free to override.
3. **Write the adjective-to-property rules next.** These are the small ones that carry
   most of the value: mirror-bright or chrome implies metallic near one and roughness
   near zero; matte or chalky implies roughness above the mid range and metallic zero;
   wet implies a roughness reduction and usually a clear-coat layer rather than a change
   of base material; worn or weathered implies breaking uniform roughness with a mask
   rather than lowering a global value.
4. **Bind each rule to the feature it implies, not just the value.** *Cracked* is not a
   roughness value; it is a request for depth, which is a parallax or displacement
   decision with a cost. A mapping that stops at scalar properties leaves exactly the
   expensive half of the translation undone.
5. **Read the whole table from a versioned statement of renderer facts.** The available
   paths, their names and their prerequisites belong to one renderer version. Deriving
   the guidance from that statement rather than from literals is what makes an engine
   upgrade a single edit whose effect on the advice is visible
   ([law-and-check-share-one-source](../../../../_laws.md#law-and-check-share-one-source)).
6. **Give each path its own cost entry and its own cheaper substitute**, exactly as an
   optional feature has. A subsurface path is not free because it was forced — it runs
   roughly a third to two-thirds more expensive per pixel than the opaque default, and
   there is usually a pre-integrated approximation that serves many cases without the
   full transport pass. The path selection is the largest single cost decision in the
   material, so it is the one that most needs its alternative named beside it.
7. **Emit the mapping into the guidance an author or an assistant reads**, phrased as
   rules, so the same sentence that instructs is the sentence that will be checked.

## Decision rules

- **When a description matches a forced mapping, apply it and surface the cost
  immediately.** The right moment to say "this surface is subsurface and that is
  expensive" is when the brief is read, not when the material is reviewed.
- **When a description matches nothing, do not invent a path.** Fall to the opaque
  default and record that no rule matched. An unmatched brief is a gap in the table and
  should be visible as one; the alternative is a silent guess that looks like a decision.
- **When two rules conflict, the path outranks the property.** *Matte glass* is
  transparent with high roughness, not opaque. Path selection is structural; properties
  are adjustable afterwards.
- **When a project accumulates two copies of the mapping, delete one immediately.** A
  second copy is not redundancy, it is a second authority for the same quantity, and the
  divergence is invisible until a costed material and a shipped material disagree
  ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).
- **When the mapping suggests a value, keep it a starting point, not a lock.** The table
  exists to remove the blank page and to make the cost knowable early; an author who
  overrides it with intent is using it correctly.

## Why written rules beat trained intuition here

Not because practitioners are wrong — experienced ones produce better materials than any
table. Because the table is *readable by the machinery*. A stated mapping lets the cost
of a brief be estimated before anyone opens an authoring tool, lets an assistant produce
a defensible first pass, and lets a reviewer point at the rule rather than at taste. The
intuition remains the override; the table is what makes the override an exception
somebody notices.

## When not to use it

- **When the surface is a one-off art direction piece.** A signature material for a
  single hero object is authored, not derived, and forcing it through a general mapping
  produces a generic result.
- **When the renderer's paths are in flux.** A mapping written against paths that are
  being replaced will be re-taught to everyone twice. Wait for the version to settle,
  then derive the table from it.
- **When the vocabulary is domain-specific and small.** A project whose surfaces are
  forty named materials from an art bible does not need a general adjective mapping; it
  needs the forty materials in a library, which is a stronger form of the same idea.
