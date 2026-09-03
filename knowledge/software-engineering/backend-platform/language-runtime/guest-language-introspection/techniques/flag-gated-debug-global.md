---
layer: technique
type: technique
subject: guest-language-introspection
technique: flag-gated-debug-global
status: forged
laws: [absent-guard-is-loud, one-authority-per-vocabulary]
shared_with: []
use_when: [adding the first engine-internal member the guest language can call, a debug member is being reached for from production or from the conformance run, deciding how the debug object and the conformance host object relate]
---

# Flag-gated debug global

The debug global is the door through which every other technique in this subject is
reached, and the whole technique is about the door's default position. It is one object,
installed into a context's global scope by one function, called from one site, under one
explicit flag whose default is off. Nothing about the engine's ordinary operation depends
on it being present, and the engine's ordinary tests run without it.

## The flag is the technique

An engine grows a debug member the way a house grows an extension cord: somebody needs
to force a collection from a script to reproduce a bug, adds a global function, and the
function is still there five years later. The cost is not the function. It is that the
engine's global scope now differs from the specification's by one enumerable name, that
any guest program can trigger a full collection in a loop, and that the name has become a
compatibility promise to whoever found it. Each of those is a separate defect and none of
them is visible in a test, because every test was written with the member present.

So the rule: when a member exposes engine state or engine control to the guest, it goes
on the debug global, and the debug global exists only when the process was started with
the debug flag. The default state — no flag, no global — is the state the engine's
conformance and behaviour suites run in, so absence is continuously tested; presence is
tested by the introspection suite, which passes the flag. A member that is reachable
without the flag is a bug regardless of how harmless it looks, because the reasons it is
harmful are properties of the surface, not of the member.

The flag is *not* a build-time feature switch alone. A compile-time gate keeps the code
out of a release binary, which is right, but a developer's binary is built with the
feature and still must not inject the global into every context, or the developer's
conformance run diverges from the release's. The runtime flag is the one that matters;
the build-time gate is an additional saving.

Where the surface *lives* is the strongest form of the gate. The debug global belongs to
the engine's shell — the command-line program that parses the flag — and not to the
engine library that embedders link. An embedder that constructs a context through the
library then cannot receive the global by any feature or option, because the code that
builds it is not in the artifact they depend on; the only way to a debug global is to
run the shell with the flag. That places the sandbox-escape and accidental-API risks
in the one binary whose users are engine developers, and nowhere else.

## Non-enumerable, installed once, and the shadowing decision

The global is defined as a non-enumerable property of the global object, so a program
that walks its own scope — and conformance suites do — sees what the specification says
it should see. It is installed once per context, at context construction, from the same
site that installs the conformance host object when that flag is set; two installation
sites for two debug-time globals is how one of them gets forgotten on a new entry point.

Whether the guest may shadow or delete the debug global is a decision, and either answer
is acceptable as long as it is written beside the installation. Configurable and
writable is the simpler default and matches how every other global behaves; the cost is
that a program under test can remove the probe before the assertion runs, which is the
test's problem and not the engine's. The choice to make it non-configurable trades that
for a global that behaves unlike any other, and the trade is rarely worth it.

## The name is a sigil, not a word

The global's name begins with a character that is legal in an identifier but that no
program uses as the first character of one — the currency symbol is the convention.
That keeps it out of collision with any name a guest program would plausibly define,
keeps it visibly *not* part of the language when it appears in a test, and lets a reader
of any script know at a glance which lines are engine-facing. The same convention
applies to the conformance host object, which is why the two names share a prefix and
must not share a suffix.

## Namespaces built by builders

The debug global is a tree of namespaces, each owning one concern of the engine —
collector, functions, objects, shapes, strings, limits, optimizer, realms — and each
installed by its own builder function in its own source unit. The installing function
does nothing but call the builders in sequence and attach their results. The reason is
ownership: a probe about string encoding belongs to whoever owns strings, and the file
that defines the string namespace is where they add it. A flat global with forty members
has forty authors and no owner.

The builders also carry the namespace's documentation, in the form of executable
examples: every member is documented by a script that calls it, and the script is run.
When the engine's representation changes, the example fails, and the failure names the
page that must be rewritten. Documentation of internals that is not run is documentation
of last year's internals.

## The conformance host object is a different object under a different flag

The language's conformance suite requires a host-provided object with a specific shape:
a realm factory, a script evaluator, a way to force collection, an agent for concurrency
tests, and a handful of others. That object is *spec-shaped* — the suite defines what it
must contain, and it must contain exactly that. The debug global is *engine-shaped* — it
exposes what the engine's developers need, and it owes the suite nothing.

Keep them separate, under separate flags, even where they overlap. Forcing a collection
is the usual overlap, and the temptation is one implementation exposed through both
objects; that is fine. The failure is one *object* exposed under both names, because
then every debug member is part of what the conformance run sees, the debug global's
evolution is coupled to the suite's expectations, and a new engine-internal probe is a
conformance-visible change. The rule: when a member is required by the suite, it goes on
the host object; when a member is required by the engine's own tests, it goes on the
debug global; when both need it, both get it, and the code is shared one layer down.

## When not to use it

A member whose audience is the guest program's author — pause here, show me my scopes,
step — belongs to a debugger protocol on the host side, not to a global in the guest.
A member whose output is a rate or a distribution belongs to the engine's performance
instrumentation, which has retention and predicates this surface does not. And a member
needed by an embedding application in production is an embedding API, exposed through
the host's typed interface, never through a guest-visible global that a flag could turn
off underneath it.
