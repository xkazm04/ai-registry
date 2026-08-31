---
layer: technique
type: technique
subject: reference-parity-gating
technique: instrument-blindness-register
status: forged
laws: [structural-proof-is-never-sufficient, no-gate-self-certifies]
shared_with: []
use_when: [a defect shipped at a passing parity score, deciding whether a gate miss is a tuning problem or a structural one, choosing which witness certifies which defect class, arguing that an automated gate can replace a human review]
---

# Enumerate what the rig cannot see, and give each class a different witness

Every measurement rig has a configuration — how it renders, what it projects, what it
compensates for, what it culls — and that configuration defines a set of defect classes it
**cannot detect at any threshold**. These are not false negatives to be tuned away. They
follow from the geometry of the measurement, and the only correct response is to write them
down and assign each one to a witness that *can* see it.

The register is the artifact. A gate without one accumulates its blind spots as folklore,
rediscovers each of them through a shipped defect, and — worst — invites the argument that
because the score is high, the artifact is fine.

## Four worked classes, each of which shipped at a passing score

**Culling mismatch.** The comparison masks render double-sided; the consuming runtime and
the perceptual critic render single-sided. A mirrored construction loop that flipped
coordinates without reordering face corners handed builders the opposite winding, so every
face of a mirrored assembly pointed inward. An entire side of the object was absent in the
product while the parity rows scored above 90. Flood-based tools share the blindness for the
same reason — a reversed surface reads as open background, never as a hole. *Witness: a
rendered view under the runtime's own culling, compared left against right, every round.*
*Guard: a winding assertion on every mirrored construction path.*

**Registration blindness.** Translation-only alignment cannot represent a mirrored assembly.
An artifact assembled back-to-front kept its silhouette, overlapped the reference well
enough to score in the seventies, and was caught by a person looking at it. A mirror
re-scoring check — re-score with the candidate profile reflected about its span midpoint,
and hard-fail the row when the reflected fit is decisively better — catches asymmetric
shapes and *provably does not* catch near-symmetric ones, where the wrongness lives in
shaded features no mask carries. *Witness: source-side assertions on orientation derived
from the reference's own coordinates, plus a mandatory human pass.*

**Projection blindness.** Cross-section cameras clip a thin slab, so a long, thin,
axis-aligned component presents only its end caps to the sampling camera: its side and top
faces project to zero width and the part is invisible at every mid-span slice. Width rows
sag while the silhouette views see the component correctly. This one is worth stating
carefully, because it is *not* a measurement artifact — the rig measures what is presented
to it. Segmenting such a component into per-slab pieces with real end faces recovered a
cross-section row from 54.2 to 76.1 with no other change. *Witness: an authoring rule, plus
the disagreement between silhouette and cross-section rows as the tell.*

**Silhouette blindness.** An orthographic mask cannot see hollowness at all. Open shells,
unclosed backs, floating panels and interior voids are invisible to every profile row and
immediately obvious in a shaded overhead or perspective view. *Witness: shaded views from
above and at an angle, not orthographic ones.*

A fifth inverts the intuition and is easy to miss: **invisible geometry still measures.**
Bounding-box computation, framing, hashing and probes all see meshes flagged not-visible,
so a hidden component parked at an unused pose silently widened every frame that was
supposed to exclude it. Deferring its construction until the state that needs it fixed the
class outright — but the general lesson is that *visibility flags are a rendering concern
and most instruments are not renderers.*

## The register's shape

One row per class. Four fields, and the fourth is what makes it useful:

| Field | Content |
| --- | --- |
| Class | the defect, named so a producer recognises it |
| Why unseeable | the property of the rig that makes it structural |
| Witness | the specific check, view, or assertion that does see it |
| Standing | whether that witness is currently mandatory, and where it runs |

A row without a witness is not a register entry; it is an unresolved risk, and it should
read as one.

## Procedure

1. **Derive the classes from the rig's configuration, not from incident history.** For each
   choice the measurement makes — projection, culling, resolution, what the registration
   compensates for, what the sampling clips — ask what defect that choice makes
   unrepresentable. Most entries are findable before they ship.
2. **Add every incident anyway.** A shipped defect at a passing score is by definition a
   class the derivation missed, and it belongs in the register before it belongs in a
   postmortem.
3. **Assign each class a witness that does not share the blind property.** A second check
   built on the same masks inherits the same blindness while looking like defence in depth.
4. **Make the witness mandatory where the class is severe**, and say so in the register. An
   optional witness for a class that ships whole missing surfaces is not a control.
5. **Record known limits of each witness.** The mirror check's failure on near-symmetric
   shapes is part of the entry; a witness presented as complete is worse than none, because
   it terminates the search.
6. **Re-derive the register whenever the rig's configuration changes.** A resolution bump, a
   culling change, a new registration term all move the boundary.

## Decision rules

- **When a defect ships at a passing score, first ask whether the rig could ever have seen
  it.** If not, no threshold change is a fix, and re-tuning is how a team spends a quarter
  on the wrong lever.
- **When a proposed check reuses the failing instrument's pipeline, reject it as a
  witness.** It cannot see what the pipeline cannot see.
- **When someone proposes replacing the human pass because the scores are good, read the
  register aloud.** Its length is the argument.
- **When a blindness has an authoring corrective, prefer that to a measurement change.** A
  rig that measures correctly should not be complicated to accommodate an authoring
  pattern that could simply stop.
- **When a witness is added, the class stays in the register.** Deleting the row loses the
  reason the witness exists, and the witness is removed as redundant two refactors later.

## When not to use this

- **As a place to record ordinary false negatives.** A defect the rig could have caught with
  a better threshold is a tuning item; putting it here inflates the register and dulls it.
- **Where the rig and the consumer are the same instrument.** If the artifact is only ever
  consumed by the thing that measured it, its blind spots are not defects — nothing
  downstream can perceive them either.
- **As a substitute for fixing a blindness that is cheap to remove.** If a culling mismatch
  can be eliminated by measuring under the runtime's own settings, do that; the register is
  for what remains after the cheap fixes.

## The rule this technique exists to protect

A parity score is structural evidence. [Structural proof is necessary and never
sufficient](../../../_laws.md#structural-proof-is-never-sufficient) is usually read as a
statement about whether an artifact is well-formed, and it applies with equal force to
whether it matches: **a parity number alone never certifies an artifact.** The register is
the concrete, non-rhetorical reason why — an enumerated list of things that are true of the
artifact and invisible to the number.
