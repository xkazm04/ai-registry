---
layer: technique
type: technique
subject: error-handling
technique: exit-contract-is-a-taxonomy-projection
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [a program's callers branch on its exit status, deciding where the mapping from failure kind to external code lives, a new failure kind shipped without a code and nobody noticed, auditing which of a program's failure paths can carry a code at all, an external code space is narrower than the internal one]
---

# The exit contract is a projection of the taxonomy

[taxonomy-design](./taxonomy-design.md) establishes the closed vocabulary of
failure kinds that every consumer branches on, and
[structured-propagation](./structured-propagation.md) keeps that vocabulary
intact as a failure moves inward. This technique covers the last hop outward,
for any component whose caller is a process supervisor, a shell, a scheduler or
a pipeline: **the exit status is a second closed vocabulary over the same
failures, and it is a consumer of the taxonomy like any other — the only one
that cannot read a structured field.**

That constraint is the whole difficulty. Every other consumer receives the
error. This one receives a small integer, chosen by somebody, at a boundary the
error does not survive.

## Two places the mapping can live, and only one of them holds

**Beside the exit** — a table, a match, a chain of conditionals near the
program's entry point that translates each failure kind into a number. This is
the default and it drifts, for a reason that is structural rather than
cultural: adding a failure kind and giving it a code are **two edits in two
files, and only the first one is required to compile**. The type checker has
nothing to say about a mapping table that is missing a row unless the table is
exhaustive, and a table written as a chain with a fallback is never exhaustive.
The failure mode is uniform — the new kind falls through to the generic failure
code — and it is invisible from inside, because the program still exits
non-zero and still prints the right message. Only the caller branching on the
number sees it, and the caller is usually a script somebody else owns.

**Attached to the declaration** — each member of the taxonomy carries its
external code where the member itself is declared. Now there is one edit, the
code is read off the value rather than looked up, and a kind without a code is
a kind that does not compile. The vocabulary and its projection have one
authority, which is the property
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
asks for and the table cannot supply.

The distinction is worth stating in one line, because it is what makes the
second form cheap: the external contract becomes a **projection** of the
taxonomy rather than a **translation** of it. Projections cannot drift from
their source. Translations always do.

Numbering the members deliberately is part of the payoff and costs nothing.
Reserve bands by class so a caller can branch on a range rather than on a set of
literals, and borrow a well-known code where one exists and matches — a reader
who recognises the number gets the semantics for free, and a reader who does not
is no worse off.

## The coverage question, which is where the technique is actually lost

A projection binds exactly what the type covers, and that is a smaller set than
anyone assumes.

The moment one module returns a **different** error representation — a boxed
dynamic error, a foreign library's result type, a bare string — its failures
leave the taxonomy before they reach the boundary, and the projection has
nothing to project. Those failures collapse onto the generic failure code. The
module compiles, its errors are reported, its messages are good, and its exit
status is a lie of omission: the caller is told *something failed* by a program
that was specifically built to tell it *what*.

This is nearly always a **peripheral** module — completions, diagnostics, a
one-shot subcommand, an installer helper — precisely because those are the
places where the crate's own error type feels like ceremony. The audit is one
grep and it should be standing:

> Enumerate every fallible entry point the program can exit through, and count
> how many do not return the taxonomy's type.

Any nonzero count is the exact list of paths on which the exit contract does not
apply. That list belongs in the documentation of the contract, or the paths
belong inside the type. A published table of exit codes that does not say which
paths it governs is a claim the program does not honour.

## The narrowing rule at the platform edge

The internal space is usually wider than the external one — a taxonomy with a
hundred kinds and a platform that carries a single byte, or eight bits of which
some are reserved by convention. A collapse is therefore required, and it must
obey [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value): the
law's own example is *a lost outcome published as a synthetic exit code*, which
is exactly what a silent truncation produces.

- Decide the collapse once, at the boundary, in the same place the projection is
  read.
- A code that does not fit maps to the **generic failure** value, never to its
  own low bits — truncation manufactures a specific, wrong, plausible answer,
  which is worse than the honest generic one.
- Say so on the error stream when it happens. The caller cannot see the
  distinction; the operator reading the log can, and that line is the only
  evidence the contract was narrowed on this run.

## Decision rules

- The external code is declared with the failure kind, not looked up beside the
  exit. One authority, one edit, no drift.
- A new failure kind that does not force a code decision at declaration time
  will ship without one.
- Audit coverage by counting fallible exit paths that do not return the
  taxonomy's type. That count is the contract's exception list, and it is
  usually not zero.
- Peripheral subcommands are where the type is abandoned; hold them to the
  contract or document them out of it explicitly.
- Narrowing to the platform's code space collapses to the generic failure value
  and says so; it never truncates into another kind's number.
- A published exit-code table states the paths it governs, or it overstates what
  the program guarantees.
