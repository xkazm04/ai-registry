---
layer: technique
type: technique
subject: compile-time-code-emission
technique: pure-expansion
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [an emitter reads a file, an environment variable or the clock, generated output differs between machines or between two clean builds, an editor re-runs a source generator on every keystroke, adding an emitter that pulls a large dependency into the build]
---

# Pure expansion

An expansion is a pure function of its declared inputs: the invocation's own
tokens or syntax, the context the host hands it, and inputs the host lets it
declare - additional files, build options - through the host's own channel.
It reads no clock, no undeclared file, no environment variable the host does
not track, no network, and two runs over the same inputs produce the same
output byte for byte.

## Why the host requires it

A host compiler treats an expansion as a stored derivation: it may cache the
output, skip re-running an emitter whose inputs did not change, run many
expansions in parallel and re-run them in an editor on every edit. Each of
those is correct only if the output depends on the inputs the host can see.
An undeclared input is a derivation whose recomputation is not named
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
the cache cannot know when it is stale, and nobody can reproduce the output a
colleague's build produced. One vendor's incremental-generator design states
the dependency outright - its caching does not merely benefit from
determinism, it requires it. Another host enforces it: its macro
implementations run as separate programs in a sandbox with no file-system or
network access, so the expansion can depend only on the node it was given and
the context the host supplies.

## Value equality makes caching real

Purity is necessary but not enough for an incremental host. Its pipeline
compares the intermediate values each stage produces with the previous run's,
and skips the downstream work when they are equal. A stage that carries an
object compared by reference - a compiler symbol, a whole compilation, a
syntax node with its location, a list with reference equality - is never
equal to its predecessor, so every stage below it re-runs on every edit and
the editor slows in proportion to the codebase. The rule from the vendor's
own guidance: extract plain values early - names, strings, flags - into
records with value equality, and wrap collections so they compare by content.
Hold compiler objects for as short a stretch of the pipeline as possible.

## The emitter carries the compiler's privileges

Where the host does not sandbox emitters, an emitter runs with whatever the
compiler can do, and a language reference puts it bluntly: such macros carry
the same security concerns as build scripts. That shifts how an emitter is
priced as a dependency: it executes on every developer machine and build
agent, at build time, before any test. Pricing that tier is the supply-chain
subject's job; the emission-side rule is to keep emitters dependency-light, to
read nothing beyond declared inputs even when the host would allow it, and to
treat a new emitter dependency as code that runs on every workstation.

## Procedure

1. List the emitter's inputs. Every one must arrive through the invocation or
   through a host channel that tracks it. A file read by path is moved to the
   host's additional-input mechanism, or the emitter is redesigned.
2. Remove ambient sources: timestamps, random identifiers, host names,
   absolute paths, iteration over unordered maps. Where unique names are
   needed, use the host's unique-name facility, which is deterministic per
   expansion site.
3. On an incremental host, reduce compiler objects to value-equal records at
   the first stage that can, and check that a no-op edit re-runs nothing
   downstream.
4. Test determinism directly: expand the same input twice in separate
   processes and compare bytes.

## When not to use this

A generator that legitimately reads an external description - a schema file,
a protocol definition - is not exempt; it declares that file as an input
through the host channel. A generator that must reach the network to produce
code is not an emitter at all: it is a build step that writes committed
output, and belongs to the pipeline discipline of committed derived source,
where the fetched input is pinned and recorded.
