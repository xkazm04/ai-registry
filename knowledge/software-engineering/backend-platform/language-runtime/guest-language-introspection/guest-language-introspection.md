---
layer: golden-path
type: golden-path
subject: guest-language-introspection
status: forged
use_when: [writing an engine test that must assert on representation rather than on observable behaviour, deciding what an engine exposes to the language it implements and under which flag, a documentation example about internals that should be executable, tracing or bounding one function without tracing or bounding the whole process]
techniques:
  - flag-gated-debug-global
  - per-function-trace-flag
  - representation-probes
  - guest-settable-limits-and-switches
  - realm-factory-for-cross-realm-tests
---

# Guest-language introspection

A language engine has two audiences that never meet. The guest program sees only what
the specification lets it see: values, properties, exceptions, the order of effects.
The engine developer sees everything underneath — which objects share a hidden class,
whether a concatenation allocated, whether an array is still dense, which bytecode a
function compiled to — and none of it is reachable from the language. Guest-language
introspection is the surface that lets the second audience ask its questions **from
inside the first audience's language**: a debug object, injected into the global scope
only under an explicit flag, whose members answer representation questions, trace and
disassemble individual functions, force a collection, set the engine's limits, and mint
fresh realms.

The reason to build it is not convenience. Everything an engine developer wants to
assert is *about* a guest program — this literal, that concatenation, the object after
those two property adds — and the cheapest place to state a fact about a guest program
is beside it, in its own language. A host-side test that constructs the same object
through the embedding API is a second program that only approximates the first; the
approximation drifts, and the drift is invisible because both programs pass. With an
introspection surface the test *is* the program, the documentation's examples run, and
a regression in representation is caught by a three-line script instead of a
benchmark's slope. Engines that lack one end up testing representation through
timing, which is the least reliable oracle available.

## The boundary against the neighbours

This subject sits between two neighbours that observe the same kinds of facts from the
outside. [Performance instrumentation](../../../operations/service-operations/perf-instrumentation/perf-instrumentation.md)
is a shipped product measuring itself in production and reporting distributions with
their predicates attached; this surface is a developer-only control panel that is
compiled out or flag-gated out of production and answers *is* rather than *how often* —
one object's shape, one string's encoding, never a rate — and the rule for choosing is
whether the reader is a user's machine or a test file. The
[test harness](../../../engineering-process/build-and-release/test-harness/test-harness.md)
is the machinery outside the process that decides which suites run, where, at what
cost; this surface is inside the process, called by the tests the harness selected, and
the rule is that the harness may *use* the debug global to reach a fact but never *is*
it — a lane's configuration does not belong on a global, and a probe does not belong in
a runner. A third cousin is the host object the language's conformance suite requires,
which is spec-shaped, must be exactly what that suite expects, and lives behind its own
flag; the debug global is engine-shaped, owes the suite nothing, and the two are never
one object.

## What a principal practitioner holds true

**The surface is a switch, and the default position is off.** An introspection global
that is always present is three defects at once. It is a sandbox escape, because a
member that forces collection or lowers a stack limit is a denial-of-service primitive
handed to any guest. It is a conformance failure, because an enumerable extra global
changes what a program that walks the global scope observes. And it is an accidental
public API, because the first user who finds `$debug.gc()` useful will depend on it,
and an internal you cannot remove is no longer internal. So the global is injected by
one function, called from one site, under one flag whose default is off — and its
absence under the default is the tested state, not the untested one. The strongest
form of the switch is placement: the global is built by the engine's shell, beside the
flag parser, and not by the engine library, so an embedder cannot receive it through
any option because the code is not in the artifact they link. The switch, the
namespaces behind it, and why the conformance host object gets a separate flag are
[flag-gated-debug-global](./techniques/flag-gated-debug-global.md).

**Namespaces, not a flat bag.** The global is a small tree — a collector namespace, a
function namespace, an object namespace, a string namespace, a limits namespace, a
realm namespace — each installed by its own builder from its own source unit. The
reason is not tidiness. A flat bag with forty members is written by forty people over
five years, and nobody can say what it exposes; a namespace has one owner and one
file, and adding a probe means opening that file. The namespace is also the unit of
documentation: each one carries a page of executable examples, and the examples are
the tests the documentation was written to become.

**Probes are pure; verbs are named.** A member that answers a question about
representation — shape identity, storage kind, string encoding — must not change the
representation it reports on. The naive probe materializes: it flattens a rope to
measure it, transitions a shape to inspect it, densifies an array to count it, and then
reports on the thing it just made, so the test asserting "this stayed a rope" passes
forever. A member that *does* change state — force a collection, set a limit, mark a
function traceable — is a verb with a verb's name and a documented effect, never a
getter with a side effect. The reader of a test must be able to tell from the call
alone whether the engine was observed or moved. The pure kind, and the identity rules
that keep shape comparison honest under a moving collector, are
[representation-probes](./techniques/representation-probes.md).

**Trace one function, and let the mark survive suspension.** Whole-process tracing is
a firehose that drowns the one call being studied. The useful grain is a single
function, and the useful control is a bit on the function's *compiled code*, not on
the call frame and not on a process-wide "tracing now" flag. A frame-scoped flag is
lost the moment a generator yields or an awaited value suspends the function, so the
resumption runs untraced exactly where the interesting behaviour is; a process-wide
flag traces everything that runs while the function is suspended, which is everything.
Two entry points, one to trace a single invocation and one to set a persistent mark,
and the rules for what each restores are
[per-function-trace-flag](./techniques/per-function-trace-flag.md).

**Limits and passes are settable from the guest, through the host's own door.** A test
for stack-overflow handling that recurses fifty thousand times is slow, flaky across
platforms, and tests the platform's stack more than the engine's handling. The honest
test lowers the engine's recursion limit to twenty and recurses twenty-one times. So
runtime limits — recursion depth, loop iterations, value-stack slots — and optimizer
passes are exposed as accessors, and the setters pass through the same validation the
embedding API uses, because a limit that can be set to zero from the guest and not
from the host has two validation doors. The accessors, the restore obligation, and the
statistics a switchable pass prints are
[guest-settable-limits-and-switches](./techniques/guest-settable-limits-and-switches.md).

**A realm is its intrinsics, and a factory must mint all of them.** Cross-realm
behaviour — brand checks, prototype identity, an error thrown by one realm's
constructor and caught by another — is a class of specification rule that cannot be
tested inside one global scope. The surface provides a factory that returns a fresh
global object with its own intrinsics, and the first assertion in any test that uses
it is that the new realm's object prototype is not the caller's. A factory that
returns a new global whose prototype chain still reaches the parent's intrinsics has
minted a scope, not a realm, and every cross-realm test written against it passes for
the wrong reason. The factory and the tests it enables are
[realm-factory-for-cross-realm-tests](./techniques/realm-factory-for-cross-realm-tests.md).

## The failure modes of the naive reading

The naive reading is "expose the internals as a global and write tests against it".
Each word in that sentence hides a way the surface goes wrong.

*Expose* without a flag is the sandbox escape and the accidental API named above, and
it is the most common shape in practice because the flag is the part that feels like
ceremony. It also breaks the engine's own conformance run, because the extra global is
visible to the suite and the suite counts it.

*Internals* exposed as handles — a raw shape pointer, an address, an index into the
engine's own tables — leak an identity that the collector may move or reuse, so a test
comparing two addresses across a collection compares a live object with a dead one's
successor. The surface returns descriptions, not handles: a stable id when the engine
can mint one, an engine-side comparison when it cannot, and the vocabulary of storage
kinds as a closed set of strings that the engine defines once.

*A global* that is enumerable, deletable, or writable by the guest changes the guest's
observable scope and can be removed by the program under test before the assertion
runs. The debug global is non-enumerable and installed once per context; whether the
guest may shadow it is a decision, and the decision is written down.

*Tests against it* that set process-level state — a limit, a pass, a trace mark — and
do not restore it leak that state into the next test in the same context. The
surface's state-changing members are paired with a way to read the prior state, and
every test that sets restores in a finally block or runs in a fresh context; a test
file that lowers the recursion limit and forgets is a file whose every later test
fails on a different line than the one that broke.

## What the surface is for, and what it is not for

The surface serves the engine's own developers and the language's power users who read
the engine's documentation. It is not a debugger protocol — a debugger attaches from
the host side, pauses frames and inspects scopes across a wire, and its audience is
the guest program's author, not the engine's. It is not a profiler and not a metrics
sink; it carries no windows, no percentiles, no retention, and it is never present on
a user's machine. It is not the conformance host object. Where a fact is needed by all
three — force a collection is the usual one — each surface exposes it under its own
name and flag, because sharing the implementation is cheap and sharing the object is a
coupling that makes the debug global part of the conformance contract.

The test of a good introspection surface is that the engine's documentation of its
internals can be run as a script and its claims checked: "two objects built by the
same sequence of property adds share a shape" is a paragraph and a three-line test,
and the test is the paragraph.

## The techniques

- [flag-gated-debug-global](./techniques/flag-gated-debug-global.md) — one flag, off by
  default; a non-enumerable global built from per-namespace builders; the conformance
  host object behind a separate flag; the tested state is the absence.
- [per-function-trace-flag](./techniques/per-function-trace-flag.md) — the trace bit on
  the compiled code so it survives suspension; the one-invocation form restores what it
  found; the persistent mark is shared by every closure of the same code.
- [representation-probes](./techniques/representation-probes.md) — shape identity, type
  and sameness; element storage kind; string storage and encoding; all pure, all
  returning descriptions rather than handles.
- [guest-settable-limits-and-switches](./techniques/guest-settable-limits-and-switches.md)
  — limits and optimizer passes as accessors through the host's validation door; the
  restore obligation; statistics for a switchable pass.
- [realm-factory-for-cross-realm-tests](./techniques/realm-factory-for-cross-realm-tests.md)
  — a factory that mints a global with its own intrinsics, and the first assertion that
  proves it did.
