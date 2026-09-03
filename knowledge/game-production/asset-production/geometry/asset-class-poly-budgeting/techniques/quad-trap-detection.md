---
layer: technique
type: technique
subject: asset-class-poly-budgeting
technique: quad-trap-detection
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
use_when: [a delivered mesh overruns its budget, writing the diagnostic for a budget failure, triaging whether to re-request or re-configure]
---

# Quad-trap detection

## The concern

A unit mismatch does not produce a random overrun. It produces a *characteristic* one:
the delivery lands at almost exactly twice the requested triangle count, because every
quad the service emitted became two triangles on load. That signature is diagnostic.
A system that reports it as "over budget" has thrown away the most useful thing it
knew, and the human reading the report will re-roll the generation — which reproduces
the fault, because the request is still wrong.

The technique is to attribute an overrun whose ratio falls in a narrow band around two
to the unit trap *by name*, in the message, with the fix.

## Procedure

1. **Compute the ratio** of measured triangles to requested triangles. Not a
   difference — a difference does not carry the signature, and a fixed absolute
   tolerance is meaningless across a range from 8k to 60k.
2. **Apply the honest tolerance first.** Below roughly 1.1 the delivery is honoured;
   decimators and remeshers land near a target rather than on it, and about 10% of
   slack absorbs that imprecision without absorbing anything worth catching. The
   failures actually observed sit at 2x and 10x, so there is a wide, empty gap between
   noise and signal — that gap is what makes a tolerance defensible rather than
   arbitrary.
3. **Test the ratio against an explicit trap band.** A band of roughly 1.8 to 2.2 is
   the working window: wide enough to survive a decimator that overshot a little on top
   of a doubled budget, narrow enough that a genuine 2.5x refusal-to-comply does not get
   misattributed.
4. **Attribute in the reason string.** Inside the band the message names the mechanism
   ("a ~2x overrun is the quad/triangle unit trap: the density parameter counts faces,
   so a quad-topology request must be halved"), names the conversion function to use,
   and stops. Outside the band the message says the provider did not honour the
   requested budget, and offers the two real options: re-request with an explicit limit,
   or decimate before shipping.
5. **Keep the band as a named constant** next to the tolerance, so the two numbers are
   revised together and the band's rationale is readable at the point of definition.

## Decision rules

- **When the ratio is in the band, check the request before touching the mesh.** The
  most likely defect is in what was sent, not in what came back. Re-rolling a
  correctly-configured generation costs money and produces the same result.
- **When the ratio is in the band but the request provably asked for triangle
  topology**, the trap attribution is wrong and the message must say so: the service
  answered in a topology it was not asked for, which is a provider-conformance finding,
  not a caller bug. Guard the attribution on the recorded request when you have it.
- **When the ratio is far above the band** — 5x, 10x — the service ignored the budget
  entirely. This is observed and common; some services accept a low-poly request and
  return a six-figure triangle count anyway. That is a provider-selection question, not
  a unit question.
- **When the ratio is *below* one by a lot**, that is not a win. A delivery at a
  fraction of its budget usually means the service silently answered from a lower
  density tier, and the mesh will be under-detailed rather than efficient. Report it.
- **Never let the attribution turn a failure into a pass.** Naming the cause changes
  the message, never the verdict. The mesh is still over budget.

## Why a band and not an equality test

Two effects stack. The service's own decimation lands near, not on, its limit; and the
floor in the triangle-to-quad conversion loses up to one quad. So an exact 2.000 ratio
essentially never occurs, and an equality test would fire on nothing. The band is the
tolerance for the doubling, in the same way the 1.1 figure is the tolerance for the
honest case.

Widen the band only with evidence. Every widening buys a few more correct attributions
and imports the risk of confidently mislabelling an unrelated failure — and a
confident wrong diagnosis costs more than none, because it is acted on.

## When not to use it

- **When no measurement exists.** There is no ratio, so there is no attribution; the
  verdict is unmeasured and the reason says the mesh was never measured. Do not guess
  the trap from the fact that quads were requested.
- **When the topology in play is not quads.** A pipeline that only ever requests
  triangles has no trap to detect, and the band should not be applied to some other
  doubling — an accidentally-mirrored mesh also lands near 2x and is a completely
  different defect, discovered by the structural scorecard rather than here.
- **When the same signature appears in a non-geometry budget.** The idea transplants
  (a clean integer ratio between requested and delivered is always a unit smell) but
  the constant does not; derive the expected ratio from the two units in play.
