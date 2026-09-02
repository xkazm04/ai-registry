---
layer: technique
type: technique
subject: terrain-synthesis-acceptance
technique: biome-mask-cross-consistency
status: forged
laws: [an-instrument-proves-it-had-input, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [checking generated biome material and vegetation masks against the height and slope they sit on, a scatter pass planted a forest on a cliff, two mask layers disagree about the same region, a mask consistency check reports no conflicts]
---

# Biome mask cross-consistency

Over the elevation grid sits a stack of masks: which biome a sample belongs to, which
surface material it renders with, where vegetation may stand, where water covers it, where
the play boundary runs. Each is produced by its own rule, frequently by its own pass, often
keyed on a different input — and their agreement with the ground and with each other is
nobody's job unless it is made someone's job. That is why it is the terrain defect that
survives furthest into production.

The naive reading is that a contradiction between layers is a visual issue an artist will
notice. The artist notices it a week later, after a scatter pass has faithfully planted ten
thousand trees on a forty-degree face and a lighting pass has been built over the result.
Every contradiction in this family is detectable **before anything is placed**, from the
masks and the height field alone, and at that point the fix is a rule change rather than a
cleanup.

## The three families of contradiction

**Against height.** A mask whose rule declares an elevation band must lie inside it: snow
below the declared snow line, beach material at an elevation the water never reaches, an
alpine biome sitting in a basin, a subaquatic material above the water level. The check is a
band membership test per sample and it is trivial once the elevation band is data rather than
prose.

**Against slope.** Vegetation, settlement, road and soft-ground masks all carry an implicit
maximum gradient — a tree cannot root on a face steeper than its class allows, a path does
not climb a cliff, sediment does not rest at forty degrees. Where a mask claims ground the
gradient field says is a wall, the mask is wrong, because the gradient is a measurement and
the mask is a rule.

**Against each other.** Vegetation outside the biome that supports it. Two mutually exclusive
biomes both claiming a sample. Weights across a blended stack that do not sum to full
coverage, so an unallocated remainder resolves to whichever layer the renderer happens to put
in the first slot — a defect that renders as a plausible surface and is therefore invisible
until someone asks why that field is the wrong colour. And a play boundary that excludes a
region another mask has populated, which is content generated for ground nobody can reach.

## The authority question

Height and slope are **measurements of the field**; masks are **rules over it**. When they
disagree, the field wins, and the finding is against the mask. This matters because the
tempting fix — nudging the elevation so the mask becomes true — silently redefines the ground
under everything else that already read it.

It matters a second time in how thresholds are stored. The elevation band a mask is generated
from and the band a checker validates it against are one quantity, and holding them in two
places guarantees they drift, which produces the worst possible outcome: a checker that
passes masks the generator will never again produce, or fails masks that are correct. One
source, read by both, per
[one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity).

## Procedure

1. **Enumerate the layers and state the semantics of each** — exclusive or blended, and if
   blended, what full coverage means. A stack whose semantics are undeclared cannot be checked
   for coverage at all.
2. **Assert non-emptiness first, and loudly.** Count set samples per layer before evaluating a
   single rule. An empty mask satisfies every consistency rule trivially, and a clean report
   over an empty stack is the cheapest false pass in terrain production — precisely what
   [an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)
   forbids. Report the examined sample count beside every verdict.
3. **Check band membership against height** for every layer that declares an elevation rule,
   reading the band from the same place the generator read it.
4. **Check gradient admissibility against slope** for every layer that declares a maximum, at
   the spacing the placement pass will use.
5. **Check exclusivity and coverage.** For exclusive layers, no sample claimed twice. For
   blended layers, weights summing to full coverage everywhere inside the play boundary, with
   the tolerance stated.
6. **Check containment between layers** — vegetation inside its biome, settlement inside
   habitable ground, water masks consistent with the drainage result.
7. **Report per-layer, with sample counts and locations.** A single aggregate verdict over a
   stack of six masks tells nobody which rule to change.
8. **Report a rule that could not be evaluated as unevaluated,** never as a pass — a layer with
   no declared band has no band verdict, per
   [unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass).

## Decision rules

- **When a mask contradicts the ground, change the mask.** The gradient and the elevation are
  measurements; the mask is a rule that was applied to them incorrectly or with a stale
  threshold.
- **When two exclusive layers overlap, fail rather than resolving by priority.** A priority
  order silently picks a winner and buries the fact that two rules were written to fire on the
  same ground; the overlap is the finding.
- **When blended weights do not sum to full coverage, treat the remainder as a defect even
  though it renders.** It renders as whatever was in the first slot, which is a plausible
  surface arrived at by accident, and it will be diagnosed as an art problem for as long as it
  survives.
- **When a mask is generated from a key the ground does not carry** — a latitude, an arbitrary
  region index, a hand-drawn region — require it to be reconciled against height and slope
  before it is used for placement. A biome painted by an axis that has nothing to do with
  elevation is how desert lands on a glacier.
- **When the check finds nothing, state what it read.** No findings over four hundred thousand
  examined samples and no findings over zero are the same output and opposite facts.
- **When a contradiction is intended** — a magically frozen valley, an impossible garden — let
  it be declared as an exception with a reason, and keep it in the report as a declared
  exception rather than deleting the rule. A rule with three named exceptions still catches the
  fourth, unintended one; a deleted rule catches nothing.

## When not to use this

- **Hand-painted masks on hand-authored terrain,** where every contradiction was somebody's
  deliberate choice and the report is a list of decisions. The technique is for generated
  stacks, where nobody chose.
- **Single-layer stacks with no elevation or slope rule** — one material everywhere. There is
  nothing to be inconsistent with, and running the check produces a pass that means nothing.
- **As an appearance check.** Perfect cross-consistency describes a stack whose rules agree; it
  says nothing about whether the resulting world looks good, whether the biome transitions read
  as transitions, or whether the palette works. That judgment sits on a different rung and
  needs a different instrument.
