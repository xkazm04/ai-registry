---
layer: technique
type: technique
subject: untrusted-extension-host
technique: capability-subtraction-sandbox
status: forged
laws: [gate-sees-target, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [the only isolation available is a scripting runtime embedded in the host process, deciding which standard-library capabilities an in-process extension may reach, an extension runtime must be built from a full standard library rather than from nothing, stating honestly what an in-process sandbox does and does not contain]
---

# Capability-subtraction sandbox

The subject's other techniques assume an isolation primitive: an execution
context with no ambient reach, provided by the platform, injected below a
runner seam. A large class of hosts has no such thing. A desktop client, a
game, an editor, a daemon with an embedded scripting runtime runs its
extensions in its own address space, on its own thread, with the host's
credentials one pointer away, and rewriting the host around a process boundary
is not on the table. This technique owns the containment that is available to
that host: **build the extension's runtime by loading the full standard library
and then deleting capabilities from it**, with a written reason per deletion,
an explicit allowlist of what survives, and a test that enumerates what the
extension can actually reach.

## Subtract from the whole, never assemble from nothing

The two ways to arrive at a reduced runtime are not equivalent. Assembling from
nothing - loading only the modules the host thinks an extension needs - reads
as the safer construction and is the weaker one, because a standard library
is not a flat list: modules alias each other, the base globals reach into
loaders, the package system carries searchers that open files, and a function
the host never named is reachable through a table the host did load. A runtime
assembled by addition has a reach nobody enumerated.

Subtraction starts from the full library, where every capability is known to
be present, and removes the dangerous ones **and their aliases** until the
remainder is the allowlist. The deletions that every in-process host makes,
because they are the same four escape routes in every embedded runtime:

- **The operating-system module**: filesystem, environment, process exit,
  clock manipulation. Deleted whole, with the reason written beside the
  deletion.
- **The introspection or debug module**: anything that can reach the runtime's
  own registry, walk the host's closures, or rewrite metatables. This is the
  deletion hosts skip because the module looks harmless, and it is the one
  that unmakes every other deletion, because a registry is where the host
  stored the real versions of everything it hid.
- **Dynamic loading**: file loaders, string-to-code loaders, native library
  loaders, and the package searchers that resolve names to paths. The loaders
  are nulled; the search path is emptied; the default searchers are removed
  and replaced by resolvers that answer only inside the extension's own
  directory, refusing with a message that does not leak the resolved path.
- **Process and stream access**: spawning, pipes, and the host's own standard
  streams, so an extension cannot write into the host's console or read what
  it reads.

What remains - string, table, math, text encoding, coroutines, and the host's
own brokered API - is written down as the allowlist and published to authors
as the capability floor. The floor is a promise: an extension using only the
allowlist runs on every deployment of the host. Anything not on it is not
"undocumented"; it is absent.

## Retained calls that touch the world go through a shim with a grant check

Some capabilities cannot be deleted outright without gutting the surface -
file access is the usual one, because extensions need somewhere to keep state.
The rule is that the retained capability is **never the real module**. The
real module is loaded into a private slot the extension cannot name, and the
name the extension sees is bound to a shim that resolves paths against the
extension's own data directory, checks the declared grant, and only then
forwards to the real call. Two properties keep the shim honest: the real
module is also evicted from the runtime's loaded-module cache, so re-requiring
the name returns the shim; and the shim resolves the path *before* it checks
the grant, so a grant can only ever widen access to a location already inside
the extension's own space. Which
calls the grant permits is the declaration's concern -
[canonicalizable-privilege-declaration](./canonicalizable-privilege-declaration.md)
owns what a reachable call may do; this technique owns what is reachable at
all.

## The honest ceiling

Subtraction contains **reach**. It does not contain **resources**, and the
technique is only honest if the host says so in the same breath. An in-process
extension runs on the host's thread, usually the interface thread; an infinite
loop is the host hanging; there is no wall-clock, processor-time or memory
ceiling unless the runtime offers an instruction-count hook and the host wires
it; and there is no protection against the runtime's own bugs. A host that
ships one should say, as the better ones do, that it cannot guarantee safety.
In the subject's vocabulary this is a third runner shape beside the two that
[pluggable-isolation-runner](./pluggable-isolation-runner.md) describes, and
that technique's rule applies unchanged: publish the effective ceiling set,
which here is empty, rather than letting a documented sandbox read as a
guarantee it does not make
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

### Where the runtime counts, the ceiling set is not empty

The exception in the paragraph above - an instruction-count hook the host
wires - is not an aside for an interpreter the host embeds; it is the general
case, and it deserves a rule. Whatever the runtime *counts*, it can cap:
frames (a recursion limit), value-stack slots, loop back-edges (an iteration
limit), instructions (a fuel budget), and, where the allocator is the
runtime's own, bytes. An engine built to be embedded exposes those as a limits
object the host sets at construction, with defaults, and checks them at call
boundaries and loop edges. Three rules make the counted set honest:

- **A counted ceiling raises a failure the guest cannot catch.** A limit the
  guest's own error handling can intercept is a retry loop inside a handler;
  the failure must bypass every guest handler and unwind to the host, which
  is the only party entitled to decide what happens next.
- **Publish the ceiling set as two lists, not one word.** *Counted*: each
  ceiling with its default. *Uncounted*: wall time spent inside a call the
  host provided, and memory a host call allocates on the guest's behalf -
  each with the bound that covers it elsewhere (a wait-bound at the call
  boundary, an allocation limiter on the host side) or the word *none*. The
  earlier sentence - publish the empty set - is the degenerate case of this
  rule for a runtime that counts nothing.
- **The uncounted list is empty exactly when the guest imports nothing.** A
  guest with no host-provided calls has nowhere to spend uncounted time or
  memory, and only then is the ceiling set complete; every import added later
  re-opens the second list, and the publication must move with it.

This is also why the single-tier host is not a two-tier host with a missing
tier. [two-tier-extension-format](./two-tier-extension-format.md) owns the
split by execution location and the rule that a capability crosses into the
host tier only when it cannot be brokered. A subtraction sandbox has one tier,
in the host's address space, and its answer to "what may run here" is the
allowlist, not a tier assignment; the moment a host gains a real isolate, that
neighbour's rules take over and the allowlist becomes the brokered surface of
the sandboxed tier.

## The property is verifiable by enumeration, and only by enumeration

The failure mode of subtraction is a deletion that did not take: the alias
nobody knew about, the loaded-module cache that still holds the original, the
searcher that was removed by index and reappeared after a runtime upgrade
reordered the list. None of these are visible in the host's source, where the
deletion reads as present; they are visible only in the extension's globals.
So the test does not read the host's list of deletions; it reads the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Instantiate an
extension runtime exactly as the host does, walk every reachable table from
the globals - recursively, through metatables, the loaded-module cache and
the package searchers - and emit the set of reachable function names. Assert
that set equals the published allowlist, byte for byte, with the expected set
kept as a fixture a reviewer must consciously update. A new function appearing in the walk after a
runtime upgrade is the finding the test exists for, and the same walk
generates the published floor, so the documentation cannot drift from the
runtime. A host that cannot run this test does not know what its extensions
can reach, whatever its source says it deleted.

## Decision rules

- Build the extension runtime by loading the full standard library and
  deleting; never by assembling modules from nothing.
- Delete the operating-system module, the introspection module, every dynamic
  loader and searcher, and process and stream access; write the reason beside
  each deletion.
- Retain a world-touching capability only behind a shim that resolves inside
  the extension's own space and checks the declared grant; hide the real
  module in a slot the extension cannot name and evict it from the loaded
  cache.
- Publish the remainder as the capability floor, and publish the empty
  resource-ceiling set beside it.
- Test by enumerating the reachable functions from the extension's globals and
  comparing to the floor; never by inspecting the deletion list.

## When not to use it

A host that has, or can afford, a real isolation primitive - a process
boundary, a platform isolate, a worker with brokered reach - should use it and
this subject's runner techniques, because subtraction contains reach only. A
host whose extensions are written by its own team gains nothing from a sandbox
of either kind. The technique pays the day a stranger's script runs in the
host's process and a process boundary is not an option.
