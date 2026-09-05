---
layer: technique
type: technique
subject: module-design
technique: mirror-type-at-the-edge
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [logic is untestable because its input type can only be constructed by the host that calls it, a test needs a request scope or a compiler session or a plugin container to exist before it can assert anything, deciding whether to mock a host-bound type or to stop accepting it, a whole ecosystem has converged on a shim type and it is not obvious why]
---

# The mirror type at the edge

[io-free-core](./io-free-core.md) removes a module's dependencies by turning
them into values: inputs arrive by call, time arrives as a parameter,
nondeterminism arrives through the constructor. Every one of its four
properties assumes the same thing — that a value of the input's type **can be
constructed by a test**. This technique is the case where that assumption
fails, and where following the I/O-free advice literally produces a module
that is still untestable and now also inside-out.

Some types cannot be built outside the host that supplies them. A compiler's
token stream exists only during a compilation of a plugin package. A request's
cookie jar exists only inside a request scope. A device handle, a kernel
allocation, an editor's document model, a database session inside a stored
procedure, a GPU launch context — each is minted by a runtime that a test
process is not running under, and each has no public constructor because
constructing one outside its host would be meaningless. Handing such a value
in "as a parameter" does not help: the test still has to produce one.

## The failure this replaces

Two moves are reached for first, and both are worse than they look.

**Mocking the host type.** A double for a host-bound type is a double for the
runtime's own semantics, and the runtime is exactly the thing nobody on the
team can specify. The mock encodes what the author believed about cookie
precedence, or token spacing, or handle lifetimes, and the test then passes
against that belief forever. This is
[gate-sees-target](../../../../_laws.md#gate-sees-target) failing in its most
convincing form: the check is green, and what it read was a proxy the same
author wrote.

**Booting the host.** Standing up a real request, a real compilation, a real
device is honest but converts every unit assertion into an integration test.
The decision under test is four branches of pure logic; paying a runtime
per branch is why those branches end up with no tests at all.

## The shape

Define — or adopt — a **mirror type**: an ordinary type, constructible
anywhere, carrying the same information the host-bound type carries for this
module's purposes. Then:

1. **Convert at the entry edge.** The host-bound value is turned into the
   mirror in the first statement of the host-facing function.
2. **Write every line of logic against the mirror.** The core names the
   host-bound type nowhere. It is an ordinary function over ordinary values
   and it is tested as one.
3. **Convert back at the exit edge**, if the host demands its own type on the
   way out.
4. **Keep the shim under a handful of lines, and take no verdict branch in
   it.** The host-facing function reads the ambient values, calls the core, and
   returns. Usually that means no branches at all, since a branch there is one
   nothing can reach. The exception is a guard that decides *whether to touch
   the host*, which is legitimate and sometimes required: where reaching for
   the host has a side effect on the host — a rendering-mode opt-out, a
   transaction start, a permission prompt — removing the guard to make the shim
   branchless changes behaviour under cover of a testability refactor. The
   check that the extraction was honest is not the branch count; it is that no
   verdict is returned outside the core.

What is left in the untestable region is a projection, not a decision — which
is the same disposal [marked-unverifiable-region](./marked-unverifiable-region.md)
prescribes, arrived at from the input side rather than the output side.

The mirror is not always a type you write. Where the constraint is
structural rather than incidental, ecosystems converge on a shared mirror and
publish it: a compiler plugin API whose native token type is available only
inside plugin packages acquires a drop-in twin that works everywhere, and
essentially every plugin in that ecosystem converts to the twin on its first
line and back on its last. When an entire community pays a conversion on
every call, the conversion is buying something; this is what it is buying.

## The cost, stated

The mirror is a second vocabulary for one concept, and that is a real price.
It can drift from the host type as the host evolves; it costs two conversions
per call; and a reader now meets two names for what they thought was one
thing. Three things keep it honest:

- **Mirror only what this module reads.** The temptation is to mirror the
  host type faithfully, which reproduces the host's whole surface and its
  drift. A gate that reads one cookie needs a mirror carrying one string, not
  a cookie jar.
- **The conversion is the only place both types appear.** If the mirror leaks
  outward into callers, or the host type leaks inward past the shim, the
  boundary has stopped existing and the cost is being paid for nothing.
- **Do not reach for it when the host type is already constructible.** Many
  types look host-bound and are not — they have a public constructor, a test
  builder, or a documented fake shipped by the runtime itself. Check before
  mirroring; adopting the runtime's own fake is strictly better than
  inventing a parallel vocabulary for it.

## Decision rule

**Mirror when a test cannot construct the input at all**, and the logic behind
it carries more than one branch. Those two conditions together are what
distinguish this from ordinary parameter-passing: one branch behind an
unconstructible input is a projection and can stay in the shim, and many
branches behind a constructible input are already
[io-free-core](./io-free-core.md)'s case.

**Do not mirror when the module needs the host's verbs**, only its data. A
module that must call a dozen methods on a session is holding a capability
and wants [seams-and-adapters](./seams-and-adapters.md); mirroring a
capability produces a data structure that has to be replayed, and the replay
is a mock with extra steps.

The measurement that settles an argument about it is cheap and specific:
**count the branches of the decision that the project's own test runner can
reach.** Before the extraction that number is usually zero — not because the
branches are hard, but because nothing can call them. After it, it is all of
them, and the shim that remains has none.
