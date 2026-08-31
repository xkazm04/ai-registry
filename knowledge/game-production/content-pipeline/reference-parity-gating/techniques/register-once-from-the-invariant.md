---
layer: technique
type: technique
subject: reference-parity-gating
technique: register-once-from-the-invariant
status: forged
laws: [a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [aligning a candidate artifact to a reference before scoring it, a displaced component keeps scoring clean, deciding which transforms a comparison may compensate for, a comparison frame shifts when an unrelated part changes]
---

# Register once, from the region the defect cannot reach

Every comparison needs a frame: some transform that puts candidate and reference into
correspondence before the deviations are counted. That transform decides what the gate can
detect, because **anything the registration compensates for is an error class the gate has
agreed not to find.**

Two decisions carry almost all of the consequence: how much the frame is allowed to
compensate, and how many times it is computed.

## Compensate for as little as the comparison can bear

A registration that normalises translation, rotation and scale before comparing will
report an excellent match between a reference and a half-size candidate lying on its side.
It corrected away exactly the errors it existed to find. The temptation is real, because
each compensation removes a class of nuisance variation — and each one also removes a
class of defect.

The defensible floor for a parity gate is **translation only**: align by the span midpoint
along the comparison axis and by the mean vertical offset, and compensate for nothing else.
A mis-scaled candidate then fails, because its deviations grow with distance from the
centre. A listing candidate fails, because rotation was never absorbed. Both are real
defects and both are cheap to detect, which is precisely why the frame must not be allowed
to absorb them.

Say in the gate's output which transforms the registration applied. A deviation figure
whose basis includes a silent scale normalisation is a different quantity from one that
does not, and a reader cannot tell them apart from the number.

## Compute the frame once, from the invariant region

The second decision is subtler and it is the one that produces false passes.

If each scored row registers itself independently, then a component sitting out of position
simply re-centres itself before it is measured. A sub-assembly 40 cm aft of its seat, or
floating above it, aligns to its own displaced centroid and scores as though it were
correctly placed. The gate reports the shape of the part, having deleted the fact that the
part is in the wrong place — which was usually the defect.

So: **derive the alignment once per view, from the region the defect under test cannot
reach, and reuse it unchanged for every dependent row.**

Choosing that region is the whole craft. It must be large enough to align stably and must
exclude whatever is itself in dispute. A body silhouette that omits a long protruding
component is the canonical choice: the component's length is under test, so including it
would let a length error shift the frame and hide itself. Excluding it has a second
benefit worth stating, because it looks like a limitation and is not — a candidate built
to a *published* length against a reference whose equivalent component is modelled short
stays fully satisfiable on every body row, since the disagreement can no longer move the
frame.

Registered this way, a displaced part is visible **as displacement**, in the row that
covers it, at the position where it happens.

## Procedure

1. **List the properties the gate must detect.** Any transform that could absorb one of them
   is disqualified from the registration.
2. **Pick the invariant region**: the largest part of the artifact whose geometry is not
   itself under dispute in the rows that will reuse the frame.
3. **Compute the frame once per view from that region**, and record it as data on the
   report — it is a fact about the comparison, not a defect.
4. **Reuse it for every dependent row**, including sub-assembly and whole-artifact rows.
   Re-registering a row is a decision that needs its own justification in the report.
5. **Derive any positional sampling from an invariant extent too.** Cross-sections placed
   along a span that includes a disputed protrusion drift onto empty space as that
   protrusion's length changes; place them from the body extent so the sample positions
   mean the same thing in both artifacts.
6. **Freeze the frame-defining extremes before deriving downstream targets.** An edit that
   moves a span extreme shifts the sampling by a fraction of a step and invalidates every
   target derived under the old frame — either freeze the extremes first, or re-derive all
   targets after any edit that touches them.
7. **Enumerate what the chosen registration cannot see**, and hand each class to
   [instrument-blindness-register](./instrument-blindness-register.md). This step is not
   optional: a strict frame buys detection power by accepting specific blindnesses, and an
   unrecorded blindness is how the power gets spent.

## Decision rules

- **When a component scores well and looks misplaced, check whether its row registered
  itself.** This is the signature failure, and it is invisible in the number.
- **When registration is unstable, enlarge the invariant region rather than adding a
  compensated transform.** Instability is usually too small a basis, not too rigid a frame.
- **When a row genuinely needs its own frame, record both frames and their offset.** The
  offset between a shared frame and a local one is registration data, and reporting it as a
  defect is a category error that sends producers chasing phantom work.
- **When any external probe reads coordinates from the artifact, apply the same
  normalisation the measurement pipeline applied.** A probe reading authored coordinates
  against a scaled comparison drifts by roughly a percent and confidently reports defects
  that exist only in the mismatch between two frames.
- **When the frame moves, every conclusion measured under the old frame is retired**, not
  adjusted. Prior deviations are about a different comparison.

## When not to use this

- **When the artifacts are already in a shared canonical frame** — same rig, same origin,
  same units, guaranteed upstream. Registration then adds a failure mode and no
  information.
- **When pose variation is the legitimate subject of comparison**, as in motion, where the
  frame must follow an articulated root and a rigid single-frame alignment measures nothing.
- **When the invariant region cannot be identified.** If everything is in dispute there is
  no honest frame, and the gate should report that rather than pick one — an arbitrary
  frame produces confident, meaningless deviations.
