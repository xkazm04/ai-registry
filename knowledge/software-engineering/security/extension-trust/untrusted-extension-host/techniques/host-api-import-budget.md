---
layer: technique
type: technique
subject: untrusted-extension-host
technique: host-api-import-budget
status: forged
laws: [limits-are-derived, count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [an isolated extension runs under a wall-clock execution limit, extensions time out under load but not in isolation, setting the timeout for sandboxed foreign code, the host publishes a client library that extensions are expected to import, an extension API has grown heavy initialization]
---

# Host-API import budget

The host gives foreign code an execution limit and calls it the extension's
budget. It is not. Before the extension's first line runs, the runtime has to
resolve the imports the extension declares — and the largest of those is
usually **the host's own API**, because the host requires it: the base class an
extension subclasses, the result type it returns, the decorators it is
documented to use. That initialization is host code, running on the host's
behalf, charged to the extension's clock.

The gap is not marginal. A published client library that pulls in a settings
layer, a generated transport client, an error reporter and a large registry of
optional classes costs seconds to import. Against a single-digit-second limit,
under the CPU contention a shared execution pool guarantees, the host can spend
a quarter or more of the budget before the extension does anything — and the
symptom arrives as *the extension timed out*, which points every diagnosis at
the extension author.

This is [limits-are-derived](../../../../_laws.md#limits-are-derived) applied to a
number that is almost always chosen rather than derived. A limit set by asking
"how long should a scorer take" prices the wrong thing; the limit is a budget
for import plus execution, and only the second half is the extension's.

## Measure the two halves before setting the limit

The measurement is cheap and nobody takes it, because in isolation the import
is warm and fast. Take it where the code actually runs:

- **Import time in the execution environment**, cold, under the contention the
  pool produces at its configured concurrency — not on a developer machine with
  a warm filesystem cache.
- **The extension's own time**, from the moment its module body starts.

Publish both in the timeout's own documentation, and state the limit as what it
is: a total, with a stated floor left for the extension after the host has been
paid ([count-carries-predicate](../../../../_laws.md#count-carries-predicate) — the
number travels with what it counts). "Nine seconds" and "nine seconds, of which
the host's API typically consumes two and a half" are different contracts, and
only the second one lets an author decide whether their scorer fits.

## Publish a light implementation under the real import path

Once the two halves are visible, the cheap fix is structural rather than
budgetary. The surface an extension actually needs is small — a base class, a
result type, perhaps an enum — and it usually has no dependencies beyond the
standard library. The heavy machinery in the published client exists for the
*calling* side, which no sandboxed extension is.

So the execution environment installs a **dependency-free implementation of the
hot subset, registered under the import path the extension is documented to
use**. The extension's ordinary import resolves to it, the API it sees is the
API it was promised, and the initialization cost falls to nothing measurable.
The subset is chosen by evidence, not by taste: the classes the host's own
documentation tells authors to import, and the ones its corpus of existing
extensions actually reference.

Two properties keep this from becoming a fork:

- **Same names, same semantics, no extra surface.** The light implementation is
  the real one's contract with the machinery removed, never a variant of it. An
  extension that works against the stub and fails against the published package
  means the stub added or dropped behaviour, and that is a defect in the stub.
- **The stub does not decide what an extension may use.** It is a performance
  substitution, not a capability restriction. Restriction belongs to the
  isolation primitive
  ([capability-subtraction-sandbox](./capability-subtraction-sandbox.md)),
  where it is enforced rather than merely unimplemented.

## The escape hatch has two doors, and the second one is easy to miss

Any extension touching something outside the subset must get the real package,
transparently. Implementing that badly is the common failure, because a stub
placed in the module table covers only one of the two ways a name is resolved:

- **Attribute access** on the stubbed module — the ordinary "reach into the
  package for something else" path.
- **Dotted submodule import** — resolved by the runtime's own module-finding
  machinery, consulting the finder chain rather than asking the parent module
  for the attribute.

A stub that handles only the first looks correct in testing and fails on
exactly the imports that motivate the fallback. Register the stub as **both**:
an object in the module table for attribute access, and a finder in the
resolution chain for submodule paths. Both routes funnel through one loader
that evicts every stub from both places and performs the real import once, so
the escape is idempotent and the process ends in the ordinary state it would
have had without the stub.

The consequence is a two-tier cost model the extension author can reason about:
the documented surface is free, and reaching past it costs the full
initialization — once, and visibly.

## Verify the substitution, or it rots into a fork

The stub is a second implementation of a contract the host also ships, so it
carries the obligation every second copy carries
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):

- A test that imports each stubbed name from **both** implementations and
  asserts the same signature and behaviour, run in the same pipeline that
  publishes the real client.
- A test that exercises the fallback through the submodule route specifically,
  because that is the door a naive stub leaves shut.
- The measured import cost re-taken when the published client gains a
  dependency, since that is the event this whole technique is defending against
  and it arrives as somebody else's ordinary feature work.

Without those, the substitution is an optimization with a delay fuse: the real
client's contract moves, the stub does not, and extensions start behaving
differently depending on which one they happened to resolve.

## When NOT to do this

- **The limit is generous relative to the measurement.** If the import is a
  percent of the budget, publish the number and stop; a substitution has its own
  maintenance cost and it is not free.
- **The environment can amortize the import.** A warm worker that imports once
  and executes many extensions has already solved this, and the technique's
  premise is gone — though "warm" must be a property of the pool's design, not
  an accident of low traffic.
- **The API is already dependency-free.** The right fix is upstream: a host
  whose extension-facing surface has no heavy dependencies never needs a second
  implementation of it, and moving the machinery out of the imported path is
  strictly better than shadowing it.

## Decision rules

- Measure import time and execution time separately, cold, under the pool's
  real contention.
- State the limit as a total with the host's share named, never as an
  extension-facing budget it is not.
- Substitute a dependency-free implementation of the documented hot subset
  under the real import path when the host's share is material.
- Cover both resolution routes with one idempotent loader; a stub that handles
  attribute access alone is a trap.
- Test the stub against the published contract in the pipeline that ships the
  published contract, and re-measure whenever it gains a dependency.
- Prefer removing the weight from the extension-facing path over shadowing it.
