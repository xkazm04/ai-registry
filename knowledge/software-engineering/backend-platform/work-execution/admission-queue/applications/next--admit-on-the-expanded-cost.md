---
layer: application
type: application
subject: admission-queue
technique: admit-on-the-expanded-cost
stack: next
verified_on: 2026-09-17
verified_against: next@16
applied: code
ab_verdict: better
---

<!-- version witness: next 16 and vitest 4.1.10, from the checkout's package.json and the runner's own banner -->

# A download door that bounded the wire, in front of a grader charged in triangles

The seam is a provider-result download that exists to make a generated asset gradeable
at all: it refuses by scheme, by host allow-list, by content type, by redirect, by
filename shape, and by size. The size refusal is stated twice — against the declared
transfer length before the body is read, and against the received body after — and the
constant's own comment names what it is protecting: the grader "loads the whole mesh
into trimesh in a python subprocess", with the ceiling "chosen against" the largest
stored delivery measured in a sweep of the output directory.

That is a byte ceiling derived from observed byte sizes, standing in front of a consumer
whose cost is decoded geometry. The project already owns the geometry number — a
per-class face budget in triangles, and a class-blind decimation line the grader warns
above — and enforces it in the scorecard the grader produces *after* the load
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## What the two arms were

**A** — the door as it stands. **B** — the same door plus a read of the container's own
declared geometry, with the admission ceiling derived from the grader's warn line times
a stated headroom, the declaration carried forward on the success outcome, and an
unreadable container recorded as unmeasured rather than admitted as compliant.

## What was read

- **The ratio, over every stored delivery in the tree (60 files).** Transferred bytes per
  declared triangle ranged from 18.6 to 640.5 — a 34.5x spread — and bytes do not order
  the deliveries by cost: a 615 KB file declares 30,700 triangles while a 3.1 MB file
  declares 4,867. At the densest observed ratio the byte ceiling admits 5.4M triangles,
  135x the authored character budget. A single multiplier cannot carry this bound.
- **Four crafted arrivals, each inside the byte ceiling.** A sub-kilobyte container
  declaring 100,000,000 triangles; one at the admission budget and one at budget+1; a
  declaration spread across 64 primitives; counts that would leave exact-integer range
  if they were summed before being compared. Arm A admitted all four. Arm B refused all
  four and wrote nothing.
- **The floor.** All 60 stored deliveries are admitted by arm B, none unreadable, the
  densest declaring 1,492,072 triangles against a 3,200,000 budget. The seam's existing
  suite is unchanged at 14 green, and the module's whole area runs 1,190 green.
- **What the door cannot buy.** A container that declares 1,000 triangles beside a 4 MB
  payload is admitted, by design: the declaration is a claim and the door bounds the
  claim. The claim is therefore recorded on the outcome so the stage that measures the
  real geometry can see the discrepancy.

## What it refuted

The instinct that the byte ceiling was a proxy for the real one, with a margin. It is
not a proxy at all on this data — the two quantities are not even monotonically related
— and the margin was five orders of magnitude on a declared arrival. The falsifier that
would have killed the finding was available and did not fire: had the cost dimension
been unreadable without paying the expansion, or had one legitimate delivery been
refused, the corpus's existing exemption would have covered the case and no technique
was owed.
