---
layer: technique
type: technique
subject: extension-trust-boundary
technique: re-entrant-registration-across-processes
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [defining the entry function an extension must expose, an extension works in the parent process and not in workers, deciding whether extensions load per process or once, an extension needs one-time work for the whole deployment]
---

# Registration is re-entrant, because every process runs it

A service that is a graph of processes has no single place to load extensions.
The lookup that needs an extension's contribution happens wherever the object
is constructed — in a worker created after startup, in a process re-executed
from the program file, in a pool that grows under load. A registry populated in
one process is invisible in another. So the host loads extensions **in every
process**, and the entire contract lands on the extension author as one
sentence:

> Your entry function will be called once per process, in processes you did not
> create and cannot enumerate, and calling it must be harmless every time.

## Why the alternatives lose

**Load in the parent and inherit.** Works only under a start method that
duplicates the parent's memory, and hosts do not get to choose that method
freely: a process that must not fork after an accelerator context exists, or
one whose dependencies hold threads, is created by re-executing the program
instead, and a re-executed process has an empty registry. A design that is
correct under one start method and silently wrong under the other has made the
start method a load-bearing detail of the extension contract, where no author
will look for it.

**A per-process manifest.** Precise, and it makes the host's process topology
part of the public extension interface. Every author now models the process
graph, and the release that adds a role or renames one breaks extensions that
did nothing wrong. The topology is the host's business; keep it there.

**Load in every process.** Coarse, pays one import per process, and asks for the
only property an author can actually guarantee about a function they do not
schedule.

## The contract, clause by clause

**Idempotent.** Second and subsequent calls in a process must be no-ops, not
errors and not duplicates. The mechanism is usually a registry that accepts a
name; a repeat registration of the same name must either be recognised and
skipped or overwrite with an identical value. Registering a name is writing
into a closed vocabulary with exactly one authority per process
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)),
so decide the collision rule once, at the registry, rather than leaving each
author to discover it.

**Cheap.** The entry function sits on the startup path of every process,
including short-lived ones. It registers names and factories; it does not
download weights, open connections, read large files or import a heavy runtime
at module scope. Register a *constructor*, not a constructed thing — the
lookup that eventually needs the object will pay for building it, once, in the
process that needs it.

**Side-effect-local.** Anything the entry function mutates is per-process
state. It cannot be a channel between processes, a shared counter, or a
deduplication flag; the "already done" marker an author reaches for is set N
times, once in each of N isolated address spaces, and is true in all of them
and meaningful in none.

**Failure policy chosen per group, not per accident.** A registration that
raises can either abort the process or be caught, logged and skipped. Both are
defensible and the choice belongs to the group: a group that supplies the
service's externally reachable surface usually chooses skip, because one
broken extension must not deny service to everything else; a group that
supplies a type the engine will later demand by name gets an argument for
abort, because skipping converts a startup error into a mysterious lookup
failure hours later and a hundred stack frames away.

Whichever is chosen, the same obligation follows. An empty extension set
because none is installed, an empty set because discovery itself failed, and an
empty set because every candidate raised must not produce identical output
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). Log,
in each process, what was discovered, what loaded, what was skipped and why —
and if the policy is skip, make the eventual lookup failure name the extension
that failed to load rather than reporting an unknown name. That log line is the
only artifact an operator has when an extension "does not work" in a deployment
they cannot attach a debugger to.

**Idempotence is enforced on both sides.** The author is asked for a re-entrant
function; the host also keeps a per-process flag so a second load attempt in
one process is a no-op. Two guards, deliberately, because the host's flag
cannot protect a registry from an author's non-idempotent function and the
author's care cannot stop the host from calling the loader twice. Note what the
flag is *not*: it is per-process, so it never suppresses the load in the next
process, and an author who finds it and treats it as a deployment-wide
"already done" marker has misread it.

**Order-independent.** Discovery order across a set of installed extensions is
not stable and must not be relied on. An extension whose correctness depends on
loading before another has a dependency it must express in its own code, not in
its author's hope.

## The exception: a group whose contribution is a surface

Load-in-every-process is right for contributions that are *names in a
registry*, because the process that will look the name up is unknown. It is
wrong for a contribution that **is** a running thing: an externally reachable
handler set, a listener, a scheduled loop. Loading those in every process
produces one per process, which is either a bind failure or, worse, N of
something that was meant to be one.

So group extensions by the tier their contribution belongs to, and give each
group one loading locus: registry contributions load everywhere, surface
contributions load in the single process that owns the surface. Record the
locus in the group's own definition, next to its name, so the answer to "which
processes run this group" is read rather than reconstructed from call sites.

The consequence lands on authors as a distribution rule that must be stated
plainly, because nobody guesses it: **a capability spanning two tiers is two
registrations in one package.** The surface half exposes it; the engine-side
half installs the behaviour it calls. They are discovered under different group
names, loaded by different code in different processes, and **neither implies
the other** — including for gating, which is why an operator who has enabled
the surface half has not thereby constrained the other one.

## The work that must happen once for the whole deployment

Some extensions genuinely need one-time work: creating a shared directory,
registering with an external service, claiming a port. Per-process registration
gives them the worst possible venue for it. The rule:

**Do it outside registration.** Registration registers. One-time deployment
work belongs to an installer step, an operator action, or a lazily-created
resource guarded by a mechanism that is genuinely shared — a lock in a store
every process can reach, or a create-if-absent operation the storage layer
makes atomic. If the resource must be created from inside the service, make the
creation idempotent and racy-safe rather than trying to elect a process to do
it; process election in a graph whose membership changes at runtime is a
distributed-systems problem an extension author should not be handed.

## Decision rules

- If the host creates any process after startup, or by any means other than
  duplicating memory, load in every process. Do not audit which processes need
  which extension.
- If the entry function does anything that takes longer than a local import,
  move that work behind a factory and register the factory.
- If an extension must be present in one process and absent in another, that is
  a *configuration* difference, expressed as configuration read by the entry
  function — never as a host manifest keyed by process role.
- If loading is expensive per process and the set is large, the fix is lazy
  construction behind the registered name, not selective loading.

## When not to use this

- **A single-process host.** Then registration runs once, and the idempotence
  requirement is a cost with no buyer. Say so explicitly, because a host that
  later grows workers will otherwise inherit the assumption silently.
- **Extensions that supply a running service rather than a name.** A
  contribution that starts a listener, a scheduler thread or a background loop
  must not be started per process by a registration hook — that is N listeners.
  Such contributions register a factory and are started by whichever process
  owns that role.
- **Contributions with genuinely conflicting names.** If two installed
  extensions claim the same name, idempotence is the wrong frame: last-write
  resolution is a decision, and it belongs in a disclosure rather than in a
  quiet overwrite.
