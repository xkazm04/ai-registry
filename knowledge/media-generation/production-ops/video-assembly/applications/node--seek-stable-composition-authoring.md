---
layer: application
type: application
subject: video-assembly
technique: seek-stable-composition-authoring
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Seek-stable composition authoring in a distributed HTML render engine

The witness is the tree's own CI pin and test image, both `node:22`; the
engine was read at commit `3704863d` and the timeline library at the major
version its lockfile resolves.

A published render engine that compiles HTML compositions into video states
the frame-index rule as its central guarantee and then spends a whole static
analysis package defending it. Its own account of the failure sits in the
analyzer's comments: `packages/lint/src/rules/gsap.ts:553` "The renderer distributes frames across workers; cold render workers seek", continuing at
`packages/lint/src/rules/gsap.ts:554` "non-linearly straight into their range instead of playing sequentially from 0." The consequence is named on the next
line — `packages/lint/src/rules/gsap.ts:555` "Any state that depends on seek ORDER".

That engine is the reason this technique names the **second writer** rather
than the relative value. Its rule exempts constructs that resolve their
endpoints at build time — `packages/lint/src/rules/gsap.ts:1929` "from()/fromTo() resolve their values at build (immediateRender), so" — and
exempts a writer that finishes before the relative one starts; the flagged
case is narrowly the overlap. The technique inherits that boundary because it
was tested rather than believed.

## What was measured

The engine's whole pipeline was not reachable locally, so the claim was
tested at the layer that carries it: the timeline library the engine drives,
run headless, with no renderer and no browser. Two arms, one variable — the
entry path.

**Arm A** walked every frame of a three-second timeline in order, as a
preview or a single-process render does. **Arm B** split the same timeline at
the midpoint into two workers, each building its own timeline and seeking
cold into its own range, as a distributed render does. The composition under
test had an absolute writer moving a property 0→100 across the first two
seconds and a second, relative writer (`+=50`) starting one second in, while
the first was still moving.

| Composition | Frames differing, A vs B | Value step across the seam |
| --- | --- | --- |
| Second writer, relative value | **45 of 90** | 26.67, against a normal per-frame step of 1.67 |
| Same timeline, explicit endpoints | **0 of 90** | 1.67 — indistinguishable from any other frame |

A third arm held the control: a relative value with **no** second writer
resolved identically on both entry paths. That is the arm that earns the
discriminator. Had it diverged, the technique would have had to ban relative
values outright; it did not, so the technique bans the overlap instead.

The target was the count of frames on which the two entry paths disagree, and
the floor was that the timeline still ends where it was authored to end — both
arms finish at the same value, so the fix moves the path and not the
destination.

## What the tree confirms that nobody designed

The engine refuses a hardware drawing backend for distributed renders —
`docs/deploy/migrating-to-hyperframes-lambda.mdx:77` "hardware GL is non-deterministic across chunk boundaries" — and it refuses it at the
deployment layer rather than the authoring one:
`docs/deploy/aws-lambda.mdx:198` "refuse it at the runtime-image / launch-flags layer (not at the composition layer)", with a typed non-retryable
error. Separately, its encoder settings disable the frame class whose
placement within a group is not fixed:
`docs/deploy/migrating-to-hyperframes-lambda.mdx:90` "can land anywhere in a GOP, which breaks concat-copy at chunk seams".

Three enforcement points, three altitudes, one invariant. Nothing in the
engine's documentation presents this as a layering doctrine — each refusal is
written up locally, in the deployment guide for the platform it applies to.
The pattern is only visible from outside, and it is the strongest evidence
available for the technique's last decision rule: the composition checker
cannot see the drawing backend, so placing every check at the authoring gate
would leave two of the three violations undetectable.

## What this realization cannot do

The static check is a source analysis, so it sees only what is written
literally in the composition. A relative value assembled at runtime from a
variable, or a second writer introduced by code the analyzer does not
evaluate, passes the gate and fails the render. The engine is explicit that
targets without a stable identity are skipped rather than guessed at —
`packages/lint/src/rules/gsap.ts:77` "same driven DOM channel), so equality cannot prove they conflict." The gate
is therefore a floor on a checkable subset, not a proof of frame-index purity
— which is the same shape as every other static purity claim in this corpus,
and should be reported the same way.
