---
layer: application
type: application
subject: mesh-finishing-for-engine-readiness
technique: conform-target-is-not-a-remap-row
stack: node
status: forged
verified_on: 2026-09-20
verified_against: node@24.14.0
applied: code
ab_verdict: better
proof: ab-paired
---

# The preset whose empty field nothing could read

The version witness is the interpreter the verification ran on, because the tree pins
nothing else: checked on 2026-09-20, the project declares no `engines` field, no
`volta` block, no `.node-version`, no CI workflow and no container base image. Its
framework dependency resolves to `next@16.3.3`, which witnesses the framework and not
the runtime. So `node@24.14.0` is named here on the strength of the suite and the
typecheck having actually executed under it in this checkout — the weakest of the
witnesses the format admits, and the only one this tree offers.

A rig-preset table held three target skeletons as three rows of one shape. Two of them
are reached by mapping a source skeleton's bone names onto the target. The third is
reached by conforming a rigged template — and it sat in the same table, with the same
mapping field, holding an empty array and a trailing comment explaining that it "requires
a custom retargeting workflow".

## What the structure said before anyone measured it

The rows declare their own requirements, so the check is free to compute. Each preset
names its inverse-kinematics chains as start-bone/end-bone pairs; the union of those
endpoints is what the target requires, and the mapping table's target column is what it
has.

```
id                 declared  faceRig  mapRows  chainBones  unmapped
ue5-mannequin            67    false       20          10         0
metahuman               584     true        0          10        10
minimal-humanoid         25    false       18          10         0
```

Ten of ten. By the remap rule — *a chain whose start or end bone is unmapped is a limb
that will not animate* — the highest-fidelity preset in the table had five broken limbs,
and had had them for as long as the table existed.

It had not, of course. The row is a conform target, its mapping table is empty **by
construction**, and the number is an artifact of asking a remap question. That is the
finding: one field, two incompatible meanings, and no way to write a check that is
correct for both.

## Three readers, and none of them could see it

The structural fact is better evidence than the count, because nobody designed it. A
census of the field's readers returns three, and each one is blind in a different way:

- **The renderer hides it.** The mapping section was guarded by
  `mixamoMapping.length > 0`, so selecting the conform target made the whole section
  disappear. The one preset with no mapping was the one that displayed no mapping
  problem — and an absent section reads as *nothing to configure*, which is the opposite
  of the truth on a remap row and coincidentally correct on this one.
- **The fixtures flatten it away.** Two sibling suites build their bone vocabularies by
  flat-mapping every preset's rows. A preset contributing zero rows contributes nothing
  to the fixture and cannot fail an assertion built from it. A third suite pins the
  mannequin by id and never looks at the others.
- **The armature builder never consults it at all.** It constructs bones from the chain
  endpoints, which is why all three presets — declaring 67, 584 and 25 bones — emit the
  same eleven.

So the field was declared on every row, rendered conditionally, flattened into fixtures,
and read by nothing that could act on it. That is a declared input with no consumer,
which is the disease the law names, and here it had reached the stage where the *absence*
of a value was load-bearing in two contradictory directions at once.

## What changed, and what the change refused to do

`kind: 'remap' | 'conform'` on every row, and `checkPresetBinding()` branching on it. The
branch is the whole point, and the tempting wrong fix is instructive: run the totality
check unbranched and the conform row reports ten unmapped bones, whereupon the obvious
remedy is to author a mapping table for a source skeleton that does not exist.

The conform branch therefore returns `unmappedChainBones: null` rather than `[]`. An
empty array would claim *checked, nothing missing*; null says *this check does not apply
here*, and the reason names what the row owes instead — that the joints were inherited
from the template rather than estimated from the source mesh, which is what preserves
compatibility with the template's animation library. A conform row carrying mapping rows
is refused rather than passed, because that combination means the row is mislabelled or
the table is stale.

## The proof

Paired on the same instrument, arms interleaved on one tree state, with the target and
the floor named before either arm ran.

- **Target** — required chain endpoints whose mapping state is *correctly reported*:
  0 of 10 before, 10 of 10 after on the conform row, plus 20 of 20 now verified on the
  two remap rows that had never been checked either.
- **Floor** — the surrounding suite and the typecheck: 1,195 tests passed with no new
  failures, `tsc --noEmit` exit 0. The new required field on the preset interface is
  exactly the kind of change that breaks construction sites elsewhere; the typecheck is
  the instrument that would have seen it, and it stayed clean.

The new suite carries a **known negative** that pins arm A: the same row read as a remap
target still fails on all ten endpoints. Without it the four passing assertions would be
compatible with a check that cannot fail.

## What this realization cannot do

It verifies the *declaration*, not the rig. Nothing here opens an exported skeleton, so
the conform row's real obligation — that its joints were inherited rather than estimated
— is stated in the reason string and checked by no instrument, because this tree has no
reader for an exported joint orientation. That is the honest boundary: the change makes
the question expressible and routes it to a human, and a later pass that can read an
exported rig is what would close it.
