---
layer: technique
type: technique
subject: engine-host-contract
technique: contained-async-module-loader
status: forged
laws: [one-validation-door, gate-sees-target]
shared_with: []
use_when: [designing the import hook an embedded engine exposes to its host, a guest module imported a path outside the directory the embedding meant to expose, an engine is embedded in a host with no filesystem and scripts still import, sources must ship inside the binary and the loader must not read disk, the same import resolved differently on two calls]
---

# Contained async module loader

Of every seam an embedded engine cuts, the module loader is the one that reaches
outside the process. Every other hook computes on values the engine already holds; the
loader turns a string a guest wrote into bytes from somewhere the host controls — a
directory, an archive, a network, a table in the binary. That makes it the seam where
the specification's demands and a sandbox's demands meet, and this technique is the
shape that satisfies both.

## One asynchronous hook, idempotency stated

The specification defines loading as one operation: given a referrer (the module or
script doing the importing) and a specifier (the string it wrote), produce a module or a
failure, and continue the engine's module algorithm with the result. The engine exposes
exactly that, as one asynchronous method on the loader interface, with the
specification's requirement in its documentation: **the same referrer and specifier must
yield the same module every time**, because the module graph is built on it — a module
imported by two paths is one module with one evaluation, and a loader that returns two
instances has produced two evaluations of one source, with two sets of top-level side
effects.

It is asynchronous because the host's source of bytes may be. A network fetch, a
database read, a lazy archive all complete later, and an engine that offered a
synchronous loader beside the asynchronous one would have two module algorithms with
different semantics at every await point. The one host that has synchronous bytes — a
filesystem — completes its future immediately, and pays nothing for the shape.

## Normalise without canonicalising

The shipped loader resolves a relative specifier against the referrer's directory and
collapses dot segments lexically: a single dot is dropped, a double dot removes the
preceding segment, and nothing else is touched. It does **not** canonicalise — it does
not ask the filesystem to resolve links, case, or existence — for two reasons. The file
need not exist at resolution time: an embedding may resolve a specifier to decide what
it *would* load, or to key a cache, or to report a helpful failure naming the path it
tried, and a canonicaliser fails on a missing file before any of that can happen. And
canonicalisation follows links, which means a resolved path can leave a directory it
lexically sat inside; the containment check must therefore see the lexical result, not
the filesystem's opinion of it.

## Refuse anything outside a root canonicalised once

The loader is constructed with a root, and it canonicalises the root **once, at
construction** — the root does exist, so canonicalising it is safe, and doing it once
means every later comparison is against a stable absolute path with links resolved.
Every resolved specifier is then checked as a *path prefix* under that root: the resolved
path's components must begin with the root's components, compared component-wise, never
as a string prefix, because a string comparison lets a sibling directory whose name
extends the root's pass. A resolution that lands outside is refused with an error naming
the specifier and not the path, so the failure does not leak the layout the check exists
to hide.

This is the one place this subject touches the security neighbour, and the seam is
exact: whether an in-process engine is an isolation tier at all, and what an untrusted
bundle may be granted, are that subject's; that the engine's own shipped loader does not
hand a trusted host a disk-reaching primitive with a hole in it is this one's. Per
[one-validation-door](../../../../_laws.md#one-validation-door), the root check is one
function every resolution passes through — the resolver returns nothing that has not
been through it — and per [gate-sees-target](../../../../_laws.md#gate-sees-target), it
checks the path the loader will actually open, after normalisation, rather than the
specifier the guest wrote.

## Three shapes for three hosts

The filesystem loader is the shipped default and the one just described. Two others
cover hosts it does not fit. An **idle loader** fails every import with a module error
saying the host does not load modules. It exists so a host with no filesystem — an
embedding inside a browser page, a sandbox with no disk, a test — has the seam filled
with a loader that says so, rather than an unset hook that fails somewhere inside the
module algorithm with a message about a missing capability. An **embedded loader**
carries its sources inside the binary, built at compile time from a directory, keyed by
the same normalised paths the filesystem loader would compute, so a program written
against one runs against the other. It carries a byte budget declared at build time,
because a table compiled into a binary is paid for on every start by every host, and a
budget with a number beside it is the difference between "we embed the standard prelude"
and "the binary grew by the size of the examples directory and nobody noticed".

## Decision rules

- When exposing module loading to a host, expose one asynchronous hook taking referrer
  and specifier, because a synchronous sibling is a second module algorithm.
- When documenting the hook, state that the same referrer and specifier must yield the
  same module, because the module graph's single-evaluation guarantee rests on it.
- When resolving a specifier, collapse dot segments lexically and do not canonicalise,
  because the file need not exist and canonicalisation follows links out of the root.
- When constructing a filesystem loader, canonicalise the root once and compare every
  resolved path to it component-wise, because a string prefix admits a sibling
  directory.
- When a resolution lands outside the root, refuse it naming the specifier, because
  naming the resolved path leaks the layout the check exists to hide.
- When the host has no filesystem, install the idle loader rather than leaving the hook
  unset, because a filled seam fails with the right error and an unfilled one fails
  somewhere inside the engine.
- When sources ship in the binary, key them by the same normalised path the filesystem
  loader would compute and declare a byte budget, because a program must be portable
  between the two and a compiled-in table is paid for at every start.

## When not to use it

A host that overrides the loader entirely — fetching modules from a network with its own
resolution rules — inherits only the first section: one asynchronous hook with
idempotency stated. The containment rules are for the loader the engine *ships*, and a
host that brings its own owns its own containment, which is a policy question this
subject does not decide. And an engine that has no module system — a scripting language
with a single global scope and an include directive — has no referrer, no specifier and
no graph, and the idempotency requirement that motivates the whole shape does not apply.
