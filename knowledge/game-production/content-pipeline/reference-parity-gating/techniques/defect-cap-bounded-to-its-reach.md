---
layer: technique
type: technique
subject: reference-parity-gating
technique: defect-cap-bounded-to-its-reach
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity]
shared_with: []
use_when: [a parity component cannot pass because the reference itself is defective, granting a waiver against a comparison gate, repairing a reference other verdicts were measured against, a long-standing cap turns out to have the wrong premise]
---

# A waiver covers exactly the rows the defect can reach

Eventually a component fails not because the candidate is wrong but because the reference
is: an assembly fused where it should articulate, a part modelled short, a body posed for
storage rather than for use. Both obvious responses are wrong. Grinding against an
unreachable target burns the line and teaches producers that the gate is arbitrary. Waiving
the component converts one located defect into a standing exemption that nobody revisits.

The rule is narrow and it is provable: **a waiver is bounded to exactly the rows the defect
can physically reach, and the bound is derived from the measurement's own structure.**

## The bound is a consequence of the registration, not a negotiation

This is what makes the technique enforceable rather than a matter of judgment. Because the
comparison frame is derived once from an invariant region — see
[register-once-from-the-invariant](./register-once-from-the-invariant.md) — the reach of any
reference defect can be computed rather than argued.

A reference whose protruding component is modelled short caps *only* the whole-artifact
rows, through the symmetric coverage penalty against the candidate's correct, longer
component. The body rows, the sub-assembly rows, the cross-sections and every dimension row
remain fully satisfiable, because none of them includes the disputed part and the frame was
never allowed to move with it. **A waiver claiming any of those is invalid on its face**,
and a reviewer can say so without re-measuring anything.

The dual case bounds just as tightly. A fused component authored provably *long* — beyond
the published overall dimension — caps the whole-artifact rows and exactly those
sub-assembly samples the component itself occupies. Where the sampling trim is lateral, a
long forward-projecting part stays inside the retained centre samples, so the affected
samples are enumerable and **must be listed individually** in the waiver. Samples from
another view are not covered at all.

## The specification anchor is never waivable

No defect in a reference can excuse a wrong size. The reference owns profile; the published
specification owns scale, and they are independent by construction — see
[dual-anchor-scoring](./dual-anchor-scoring.md) and [one authority per
quantity](../../../_laws.md#one-authority-per-quantity). A waiver that reaches the
specification anchor has not bounded a defect; it has dismantled the mechanism that made
the gate trustworthy, which is precisely the conjunction a defective reference was supposed
to be caught by.

Stated as a hard rule: a capped candidate must still match the published figures **and**
the undamaged views. The waiver removes rows from the pass condition; it never lowers the
bar on the rows that remain.

## Repair before you waive, and repair without destroying

Where a rigid transformation can seat, unfuse or re-pose the reference, repairing is
strictly better than capping — it restores rows to satisfiable rather than exempting them.
Repair discipline is unglamorous and every rule in it is a scar:

- **Append-only recipes over pristine committed bytes.** A duplicate recipe key once ran a
  stale transformation and doubly warped a reference; the recovery came from the untouched
  original, which existed only because the discipline required it.
- **Never flat-assign over a live recipe.** Supersede explicitly and demote the old one to
  history with its own preserved original.
- **Prove idempotence twice**, and pre-flight by reproducing the committed bytes before
  extending a chain.
- **Assert against the file, not against the in-memory copy you just wrote.** A routine that
  validates its own unflushed buffer validates nothing.

## A repair retires every verdict measured under the old pose

This is the rule that catches teams late, and it caught one badly.

Every early measurement of one reference reported a sunken sub-assembly, and a waiver for a
short-modelled component was *built on that premise*. A census of the untouched original
showed the truth: the assembly had been authored parked for storage — laid flat, 1.77 m aft
and 0.53 m to one side of a perfectly circular seat. One rigid translation seated it, and
the short-component premise dissolved entirely. The part had never been short; the whole
assembly had been sitting off-station.

So: **a repair that re-frames a reference retires every conclusion measured against the old
pose**, including the waivers granted under it. That is [a verdict is bound to the content
it judged](../../../_laws.md#a-verdict-is-bound-to-its-content) reaching backwards through
an exemption, and it means a waiver must record the reference state it was granted against
precisely enough that a repair can invalidate it.

The coupling runs the other way too. Where a candidate has faithfully reproduced a
reference defect, removing the defect alone re-frames the comparison and drops the
unmodified candidate to the floor. **The reference repair and the candidate's rework are one
landing**, and verifying them separately proves nothing about either. Verify such a coupled
state by serving the candidate reference to the *unmodified* gate — intercepting the
measurement's inputs rather than editing shared files — so the coupled result is measured
by the official pipeline with nothing about it changed.

## Procedure

1. **Prove the defect is the reference's**, from the reference's own data, before anything
   else. A cap on an unproven premise is the expensive failure.
2. **Attempt repair first** where a rigid transformation suffices, under the discipline
   above.
3. **Compute the reach** from the registration: which rows can this defect move, and which
   are structurally immune?
4. **Enumerate the affected samples individually** where the reach is partial.
5. **Confirm the specification anchor is untouched**, and state that in the waiver.
6. **Record the reference state the waiver was granted against**, so a later repair can
   invalidate it automatically.
7. **Re-derive every conclusion after any repair that moves the frame**, rather than
   adjusting it.

## Decision rules

- **When a waiver's reach is stated in prose rather than derived from the frame, reject
  it.** "The reference is bad so this component is exempt" is the shape that becomes a
  blanket.
- **When a cap covers a row the defect cannot reach, the premise is wrong**, not generous —
  go back to step 1.
- **When a cap has stood for a long time, re-derive its premise.** Long-lived caps are where
  wrong premises hide, because nothing re-examines a settled exemption.
- **When repair and rework are coupled, land them together** and verify through the
  unmodified instrument.
- **When a reference is repaired, every artifact measured against it is unverified**, not
  degraded. The distinction matters: they are not worse, they are unmeasured.

## When not to use this

- **Where the reference is authoritative by definition** — an approved master. There the
  reference cannot be defective in this sense; a mismatch is the candidate's, or the
  approval was wrong, and both are different conversations.
- **Where the defect class is common enough to be systemic.** Many references failing the
  same way is a sourcing problem; a hundred individually bounded waivers is the expensive
  way to discover that.
- **As a route to shipping.** A bounded cap is a statement about what could not be measured,
  never a substitute for the perceptual pass, which still applies in full.
