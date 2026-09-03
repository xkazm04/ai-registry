---
subject: persistent-batch-mutation
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# persistent-batch-mutation

First touch: [[2026-09-03-vllm]]. NEW subject, 3 techniques, 2 applications.

## What the gap actually was

A long-lived batch whose membership AND ORDER change every step, shared by several
stateful extensions holding parallel per-slot state. `admission-queue` owns the
admit/hold/refuse verdict and `concurrency-guards` owns exclusion over keys; neither
models telling N extensions what changed so all of them reconstruct the identical state.

The discriminating question the golden path now carries: does one item's transition
relocate another item's storage? If yes, a per-item state machine is the wrong model.

## Still open

The worker's draft was WRONG here in a way worth remembering: it argued removes-first
exists so adds land on vacant seats. The tree says a replacing add is the NORMAL refill
path. The corrected rule is sharper than either source had - a member can leave three
ways (explicit remove, replacing add, a one-way move onto its seat) and only the first
has an operation name, which is exactly where implementers leak state.

The source flags this API as still changing; that caveat is in the applications, not the
golden path. A deviation is recorded but unresolved: the source documents its batch-size
scalar two contradictory ways (current vs at-the-start-of-step).
