---
layer: technique
type: technique
subject: undo-history
technique: execution-emitted-inverse
status: forged
laws: [derivation-names-recomputation, absent-guard-is-loud]
shared_with: []
use_when: [inverses drifting from the forward operations they mirror, an operation that destroys information or fans out through derived state, needing rollback for a partially applied multi-step operation, deciding whether undo history must be serializable]
---

# Execution-emitted inverse

The two-architecture split — derive an inverse from a recorded command, or
capture the document — is not exhaustive, and the option it omits removes the
worst failure of the first without paying the memory of the second. In the
third model the forward operation **returns its own inverse as a value**: as it
runs, each step appends a closure that captures the exact prior value it just
overwrote, at the instant it still existed. Undo is not derived later from what
the command *was*; it is emitted now from what the execution *did*.

The signature is the whole idea. Every mutating operation takes an accumulator
pair by reference and returns a success flag:

```
apply(args, out undo, out redo) -> bool
```

Each nested layer composes its own reversal onto the accumulator before
returning. The composed pair is pushed onto the stack once, at the top-level
call, and the stack entry is a pair of callables rather than a record.

## What the emission buys

- **There is no second implementation, so nothing can drift.** The
  dual-maintenance tax that makes command-inverse dangerous is a property of
  writing the reversal in a *different function* from the mutation. Here the
  reversal is written on the line after the mutation, by the same person, in
  the same change. The derivation names its own recomputation because the
  recomputation is a lexical neighbour of the thing derived
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
- **Information destruction costs nothing.** A quantizing filter, a truncation,
  a delete — the closure runs while the destroyed value is still in scope and
  captures precisely it. Command-inverse has to reach for a snapshot here and
  becomes a hybrid; this model does not notice the difference.
- **Fan-out reverses itself.** An operation that triggers reflow, renumbering,
  or cascade deletion calls sub-operations that each append their own reversal.
  Compose them in reverse order and the cascade unwinds in the order it wound,
  with no author having enumerated the cascade anywhere. This is the case that
  most reliably defeats hand-written inverses, and it is the case this model
  handles by construction.
- **Memory is proportional to the change**, exactly as command-inverse, because
  a closure captures the values it touched and nothing else.

## The property that is not about undo at all

The accumulated inverse is also the **rollback path for a failed operation**,
and this is the strongest argument for the model in systems where operations
are compound.

A multi-step operation that fails at step four has already mutated state in
steps one through three. Every architecture must handle this, and most handle
it with a hand-written cleanup path that is exercised only by failures — which
is to say, exercised rarely and reviewed never
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) is the
sibling problem: here the guard is present and simply wrong). With an emitted
inverse the cleanup path already exists: on failure, invoke the accumulator
built so far and return false. The rollback code is the undo code, so it is
exercised by every undo the user performs, which is continuously.

This collapses two mechanisms into one and it is the reason the return flag is
part of the signature rather than an exception. A composed inverse must
short-circuit — stop at the first step that fails to reverse rather than
continuing through the rest — because a half-reversed state is worse than
either endpoint, and only a value-returning composition can express that.

## What it costs, and the boundary is sharp

**The history becomes unreadable.** A closure over live references is not data.
It cannot be inspected, serialized, diffed, transmitted, replayed on another
process, or persisted past the session that built it. Two identical user
gestures produce two different closures, so there is not even a stable identity
to name a step by beyond a label string attached for the menu.

That is the discriminating question, and it should be asked before the model is
chosen rather than discovered later:

> Does anything other than this session's own stack need to read the history?

- **No** — in-session undo, on one process, with a label for the menu. The
  emitted inverse is the strongest available model and the arithmetic in
  [undo-model-selection](./undo-model-selection.md) does not need to be run,
  because it costs change-proportional memory *and* has no drift surface.
- **Yes** — collaborative editing, undo that survives a restart, server-side
  replay, an audit trail, an operation log shipped to support. All of these
  need a *data* representation of the step, which this model does not have and
  cannot be retrofitted with. Choose command-inverse and pay the drift tax with
  a round-trip test, or keep an emitted inverse for reversal and a separate,
  independently-derived operation log for the readers — never claim the closure
  stack as the log.

Two smaller costs are worth budgeting for:

- **Composition has two directions and both are needed.** Appending a reversal
  to run *after* the accumulated ones and prepending one to run *before* them
  are different operations, and a system with only one primitive will express
  the missing direction by rebuilding the accumulator by hand at the call site,
  which is where the drift the model prevented comes back in. Provide both.
- **Every layer must honour the contract or the composition is a lie.** One
  mutating function that writes state without appending a reversal produces a
  stack that silently under-undoes, and the defect surfaces as a corrupted
  document several gestures later. This is the same bypass-writer failure
  command-inverse has, in a form that is easier to introduce (any function can
  mutate) and easier to detect (any function taking the accumulator pair is
  declaring itself in; one that mutates without taking it is visible in review
  and greppable in CI).

## Verification

The model removes the need for a do/undo/redo round-trip test *per command
type*, because there are no command types. It replaces it with a stronger and
cheaper obligation: assert a whole-model invariant after every operation and
after its reversal, driven by generated sequences
([inside-out-invariants](../../../../engineering-process/build-and-release/test-input-generation/techniques/inside-out-invariants.md)).
A suite built this way checks the composition rather than an enumeration of
cases somebody thought of, which is the right target — the defects in this
model are compositional, not per-operation.

## Prohibitions

1. No mutating function outside the accumulator contract. If it changes model
   state, it takes the pair and appends to it.
2. No composition without short-circuit. A reversal chain that continues past a
   failed step manufactures a state that never existed.
3. No claim that the stack is a log. If a reader outside this session needs the
   history, it is derived separately and the closure stack is not it.
4. No emitted inverse capturing a reference where it needs a value. The closure
   must own what it will restore; capturing a pointer to state that later steps
   mutate reverses to whatever the state became, silently and correctly-looking.
