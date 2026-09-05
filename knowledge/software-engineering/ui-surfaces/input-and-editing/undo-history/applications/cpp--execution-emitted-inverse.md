---
layer: application
type: application
subject: undo-history
technique: execution-emitted-inverse
stack: cpp
verified_on: 2026-09-04
verified_against: cpp@14
proof: structural-only
---

# 294 accumulator signatures, 185 composition sites, and 38 places the undo path is the rollback path (C++/Qt, a video editor's timeline model)

The tree is a desktop non-linear video editor built on a separate rendering
engine; the witness for the version above is `src/CMakeLists.txt:310`, which
pins `CXX_STANDARD 14` on the library target (the fuzzer and test targets pin
the same). Read at commit `b7124d97`. It is the largest coherent instance of the
execution-emitted model available to read, and it is worth an application
because the model's costs and benefits are both visible as counts rather than
as claims.

## The mechanism, as the tree implements it

`src/undohelper.hpp` is the whole contract in forty lines:

```cpp
using Fun = std::function<bool(void)>;

#define PUSH_LAMBDA(operation, lambda)                  \
    lambda = [lambda, operation]() {                    \
        bool v = lambda();                              \
        return v && operation();                        \
    };
```

`Fun` is the accumulator. `PUSH_LAMBDA` appends a reversal to run *after* the
ones already accumulated; `PUSH_FRONT_LAMBDA`, defined immediately below it,
prepends one to run *before* them. The composition short-circuits on the first
false, which is the technique's second prohibition satisfied at the macro
rather than at each call site.

Every mutating model operation carries the pair in its signature —
`bool requestClipMove(..., Fun &undo, Fun &redo)` and 293 others. The stack
entry is `FunctionalUndoCommand`, a `QUndoCommand` holding two `Fun` values and
nothing else, so the history is literally a stack of closures.

## What the counts say

| Property | Count | Read from |
| --- | --- | --- |
| Operations taking the accumulator pair | 294 | `Fun &undo, Fun &redo` across `src/` |
| Composition sites, append direction | 160 | `PUSH_LAMBDA` |
| Composition sites, prepend direction | 25 | `PUSH_FRONT_LAMBDA` |
| Sites where the accumulated inverse is invoked as rollback | 38 | `local_undo()` |

Three of these confirm the technique against a real tree rather than restating
it.

**Both composition directions are used, at a 6:1 ratio.** The technique
predicts that a system with only one primitive rebuilds the missing direction
by hand at the call site. This tree provides both, and the minority direction
is used 25 times — a system that had shipped only `PUSH_LAMBDA` would have 25
hand-assembled accumulators, which is exactly the drift surface the model
exists to remove. The prediction is that the second primitive is not optional,
and 25 is the number that makes it non-optional here.

**The rollback path is the undo path, 38 times.** `local_undo()` appears
throughout `src/timeline2/model/timelinemodel.cpp` in the shape

```cpp
if (!ok) {
    bool undone = local_undo();
    Q_ASSERT(undone);
    return false;
}
```

This is the technique's strongest claim made concrete: the cleanup path for a
compound operation that failed at step four is not a separately-written
recovery routine exercised only by failures. It is the same accumulated closure
the user exercises on every Ctrl+Z, so it is continuously tested by ordinary
use. Thirty-eight compound operations get their partial-failure recovery for
free, and the `Q_ASSERT` on the return value is the short-circuit contract
being checked rather than assumed.

## The structural fact the tree could not have been built to prove

The interesting evidence is negative and nobody designed it. Search this tree
for a serialized, persisted or transmitted undo history and there is none — the
project file format documented in `dev-docs/fileformat.md` stores the document,
never the history, and there is no collaborative editing feature, no
cross-process undo, and no "restore my last session's history" path anywhere.

That is the technique's boundary showing up as an absence. A closure over live
model references cannot be written to a file, so the model that made 294
operations reversible without a line of duplicate inverse code also made the
history unexportable — and the product simply does not have any of the features
that would need it. The causality is not recorded anywhere in the tree and is
probably not how the decision was experienced, but the shape is exactly what
the technique predicts: **choose the emitted inverse and the durable-history
features are off the table, quietly, from then on.**

A team reading this application to decide whether to copy the model should read
that absence as the price list. It is not that the tree chose not to persist
undo. It is that after this choice it could not.

## What this realization cannot do

- It cannot tell you the memory profile. The tree has no undo-memory
  instrumentation, so the claim that closures cost change-proportional memory
  is inherited from the technique and is not measured here.
- The `Q_ASSERT` on rollback is compiled out in release builds, so the
  short-circuit contract is checked in development and merely hoped for in
  production. A team copying the pattern should decide whether that is the
  trade they want; a failed rollback in release is silent.
- There is no static check that a mutating function takes the accumulator pair.
  The technique's first prohibition is enforced by review here, not by CI, and
  a tree this size makes that a real gap rather than a theoretical one.
