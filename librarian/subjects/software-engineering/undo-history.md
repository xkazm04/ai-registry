---
subject: undo-history
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# undo-history

First touch: [[2026-09-04-kdenlive]] — **the golden path's "two architectures"
were three.**

The subject opened with "There are two ways to make an action reversible, and
the choice is the load-bearing decision of the whole subject", and priced
command-inverse against snapshot honestly and in detail. It named
command-inverse's two collapses precisely — inverses that are hard to derive
because the operation destroyed information, and inverses that must cover a
cascade — and prescribed a round-trip test as the mitigation.

A real editing model answers both collapses with a third architecture the
enumeration did not contain, so `execution-emitted-inverse` was added and the
opening was corrected to three with the boundary stated. The forward operation
**returns its own inverse as a value**: as it runs, each nested layer appends a
closure capturing the value it just overwrote, at the instant it still existed.
No second implementation, so no drift; information destruction and fan-out
reverse themselves; memory proportional to the change.

Its price is the discriminating question and it is sharp: **a closure over live
references is not data**, so the history cannot be inspected, persisted,
transmitted or replayed. Collaborative editing, undo across a restart, and any
audit trail are off the table — permanently, and quietly.

One source-tree application (`cpp--execution-emitted-inverse`, `cpp@14`): 294
accumulator signatures, 185 composition sites in **both** directions at 6:1
(the technique predicts the second primitive is not optional; 25 uses is the
number that makes it non-optional), and 38 sites where the accumulated closure
is also the partial-failure rollback path — so the recovery code is exercised
by every undo the user performs. The structural fact nobody designed: that tree
has no collaborative editing, no cross-process undo and no durable history
anywhere, which is the boundary showing up as an absence.

Applied to goat, **`better`, shipped**: its hand-written inverse gave up on a
displaced item with a comment saying the data was unavailable. It was not — the
plan builder had captured it at the moment of overwrite. The reversal was
written in a different function from the mutation, which is exactly the
technique's thesis, and the paired measurement moved restored state fields from
1/4 to 4/4.

**Where the subject is still thin:** the memory arithmetic in
`undo-model-selection`'s decision procedure has no measurement behind it in any
application here, and the new technique inherits that. A tree with undo-memory
instrumentation would be the thing to look for next.
