---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: content-addressed-contribution
status: forged
laws: [never-present-absence-as-an-answer, aggregates-leave-identity-behind]
shared_with: []
use_when: [a contribution is published as a proposed change rather than posted to an endpoint, a retry after a partial upload duplicated results, deciding what a contributor's second submission should do to their first, hand-assembled contributions are arriving alongside generated ones]
---

# Content-addressed contribution

A federation whose contributions arrive as **proposed changes to a shared
store** — rather than as posts to an endpoint the hub controls — inherits a
problem the endpoint model does not have. There is no transaction. Publishing is
several steps against a system the contributor does not own: authenticate, fork
or branch, write files, open the proposal. Any of them can fail after some of
them succeeded, and the contributor's natural response to a failure is to run
the command again.

Under any name that encodes *when* or *how many times* — a sequence number, a
run index, a submission timestamp chosen at publish time — the second run
produces a second set of files holding the same measurements. The federation now
counts one contributor's single result twice, which is precisely the weight
inflation the ingest gates and influence bounds exist to prevent, arriving
through the door nobody was watching because it came from an honest contributor
having a bad network day.

## Name the file for what is in it

Give every contribution a path derived from its own content and its own subject:
a directory keyed by what the result is *about* (the hardware, the target, the
configuration), and a filename carrying a hash of the payload alongside the
local capture time.

Three properties follow, and all three are the point:

- **Re-running is free.** A retry recomputes the same path from the same bytes,
  so it either writes a file that is already there — a no-op — or completes the
  half of the publish that failed. Partial failure stops being a state anyone
  has to reason about.
- **Concurrent contributors never collide.** Two machines submitting at the same
  instant produce different content, so they produce different paths, without a
  coordinator issuing ids.
- **A contributor's second submission extends their first.** With stable paths,
  an already-open proposal can be added to rather than superseded, so a
  contributor who benchmarks ten targets over a week ends with one proposal
  containing ten files rather than ten proposals a maintainer must reconcile.

The hash covers the payload, not the path — otherwise the name depends on itself
— and the capture time in the name is the *contributor's local* time, which is
fine here precisely because it is a naming input rather than an accounting one.
What "recent" means is still the hub's clock's business, and this technique does
not touch that.

## The naming convention is a convention; the validator is the contract

The path shape above is what the publishing tool generates, and it is tempting to
enforce it as the admission rule. Do not. A federation that rejects everything
its own tool did not produce has made the tool mandatory, and the first
consequence is that anyone on an unsupported platform, or anyone reconstructing a
result from records they already hold, simply cannot contribute.

Keep the two roles separate:

- **The checks are the contract.** Schema conformance, the arithmetic
  plausibility rules, the cross-field ordering — these decide admission, and a
  hand-assembled contribution that passes them is as good as a generated one.
  Say so where contributors will read it.
- **The naming convention is a signal.** A path that does not match what the
  tool emits is not a violation; it is a flag that this contribution was
  assembled by hand and deserves a human's attention rather than only the
  machine's. That is a triage input, not a rejection.

This ordering also keeps the tool honest. When the generator is the contract, a
bug in the generator becomes the specification; when the checks are the contract,
the generator is just the most convenient way to satisfy them, and it can be
rewritten, ported, or replaced by a contributor's own script without a
negotiation.

## What this owes the federation

- **A duplicate that is detectable as a duplicate**, not merely improbable. Two
  files with identical payload hashes under one subject are the same
  measurement; the merge should be able to say so rather than counting both
  ([aggregates-leave-identity-behind](../../../_laws.md#aggregates-leave-identity-behind)).
- **A stated policy for a repeated path with different content**, which means
  either the hash input or the payload changed. It is not a merge conflict to be
  resolved by choosing a side; it is a signal that one of the two is not what it
  claims, and the honest handling is to refuse both and say why.
