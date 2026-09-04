---
layer: technique
type: technique
subject: session-continuation
technique: ordered-yield-composition
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [two independently authored behaviours each want to hold the session open, a second loop is being refused because the first one armed first, deciding whether a stop decision is single-valued or ordered, an operator cannot end a session because some interceptor will not release it]
---

# Ordered yield composition

[single-loop-authority](./single-loop-authority.md) holds the continuation
authority to one value and resolves a second claimant from a closed set —
refuse, adopt, artifact-only. All three work the same way underneath: they
ensure the second loop does not exist *as a loop*. Refuse rejects it, adopt
dissolves it into the first, artifact-only lets it speak and forbids it to
act. That is the right answer when the two claimants have no defined order
between them, and it is the only answer available when the authority is a
single-valued field.

There is a fourth, and it is what a system reaches for once the claimants
stop being two host modes and start being contributions from people who have
never read each other's code. **Keep both loops alive and give them a total
order.** The authority is then not a behaviour but an arbiter — a stack — and
the vocabulary still has exactly one owner, which is what
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
actually demands. The law constrains how many parties may *decide*; it says
nothing about how many may be *consulted*, in what order.

## The candidate yield is the unit

The mechanism needs one named object: the **candidate yield** — the moment
the turn has produced no further tool calls and the loop is about to hand
control back. That moment is offered to the stack from the innermost frame
outward, and each frame returns exactly one of a closed set:

- **pass** — decline to consume; the next frame outward sees the same
  candidate yield.
- **continue** — consume it and run another turn, with a stated reason.
- **yield** — consume it and actually return control.
- **push** — place a child frame above yourself; the child will see the next
  candidate yield first.
- **done** — pop yourself, then offer the *same* candidate yield to the frame
  below.
- **fail** — pop with an error, and see the fail-direction rule below.

Two invariants make this composition rather than a queue of hooks. **Exactly
one frame consumes a given candidate yield**, so there is no race to resolve
and no warn-and-continue branch. And **pass is the only way outward**, so a
frame that stays silent cannot accidentally hold the session: silence is
declining to decide, never deciding to block. The request path runs the
mirror image — outermost to innermost, so the innermost frame refines the
request its parents were about to make.

## The discriminator

Both models are correct, and choosing between them is not a matter of taste:

> **Is there a defined order between the claimants, and does the order come
> from somewhere other than arrival time?**

If the answer is no, the field is single-valued and
[single-loop-authority](./single-loop-authority.md) governs — first-armed
wins and the second is resolved from its closed set. Arrival order is not an
order: it is a race with a winner, and a policy built on it decides
differently on every session.

If the answer is yes — nesting, an explicit priority, a parent that pushed
the child — then refusing the second claimant is not safety, it is a missing
abstraction wearing safety's clothes. The tell is a codebase where the same
exclusivity check is restated by hand at every entry point that could arm a
mode, and where an extension author has built a private mutex to make their
*own* plugins compose, which by construction cannot make anyone else's
compose with them.

## What the stack buys that the flat field cannot

The flat field's `adopt` policy carries a condition it cannot always meet:
the two modes' yield states must be reconcilable, and where one mode's
completion is the other's failure, the policy falls back to refuse. Under an
ordered stack that fork does not arise. Two conditions that cannot be merged
do not need to be merged — they are evaluated at different depths, in order,
and the stack terminates because each frame either consumes or passes.

Composition also makes the control state **inspectable and reversible for
free**, because the stack is a subtree of the session's own record rather
than a runtime array somebody promises to serialize later. A rewind removes
frames, a resume restores them, and a remote inspector can answer *which
behaviour currently owns the stop decision* without new plumbing. A stack
that lives only in process memory has none of these properties and will
reproduce the state bugs
[continuation-as-state](./continuation-as-state.md) exists to prevent.

## Two obligations the stack inherits

Composition does not repeal the subject's existing guarantees, and a design
that forgets them trades a warn-and-continue race for a stuck operator.

**Every frame carries a declared risk class and a derived fail direction**,
per [advisory-guard-fail-mode](./advisory-guard-fail-mode.md). A frame whose
check throws must not swallow the candidate yield it was holding: `fail`
pops the frame *and* re-offers the candidate yield to the frame below, so an
advisory contribution that crashes degrades to absent rather than to a
session that cannot end. A frame that can neither pass nor pop is the stuck
operator the flat model was trying to avoid, arrived at by a longer road.

**Every frame is leased.** A stack restored from a record is restored with
its deadlines, not with a fresh clock. A crashed session whose stack held a
forcing frame at attempt one of three must not resume into an armed force
that no live turn ever set — that is the same staleness
[session-continuation](../session-continuation.md) already requires a lease
to prevent, applied to a structure that now survives restart by design.
An expired frame is popped and recorded as expired, never silently honoured
and never silently dropped.
