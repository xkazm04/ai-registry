---
layer: technique
type: technique
subject: declarative-object-graph-configs
technique: escape-hatch-expressions
status: forged
laws: [absent-guard-is-loud, silent-state-is-ungoverned]
shared_with: []
use_when: [a config value must be computed from other config values, deciding whether a config format may contain evaluated code, a config file will be loaded from a source the operator does not control, the reference-in-expression mechanism is implemented as string replacement]
---

# Escape-hatch expressions

Every object-graph config format reaches the value that no grammar covers: a
learning rate scaled by world size, a directory name with a timestamp in it, a
transform list that differs by a flag, a callable that is a lambda over two
other nodes. The formats that refuse an escape hatch push authors into
generating the config from a script, at which point the config is no longer the
source of truth. The formats that admit one become, at that moment,
programming languages with a data-shaped syntax. This technique is how to admit
the hatch honestly.

## What the hatch is

A value whose string begins with the expression sigil is **code in the host
language**, evaluated at resolution time, and its result replaces the value.
The remainder of the string after the sigil is not parsed by the config loader;
it goes to the host's evaluator as-is. Whatever the host allows in an
expression — arithmetic, attribute access, calls, lambdas, comprehensions —
the hatch allows.

This is the first thing to say plainly in the format's specification: **an
expression is code execution.** A file containing one is a program, and the
loader is an interpreter. A team that loads such files from a public model
zoo, a user upload, a remote orchestration server or a message queue is
running code from that source with the loader's privileges. There is no
sandbox in the host evaluator worth relying on, and the format should not
pretend to offer one. The correct posture is a stated trust boundary — the
loader's own documentation says which sources are trusted and that untrusted
files must not be loaded with evaluation enabled — plus the two controls below.

## References inside expressions bind, they do not substitute

An expression will need other nodes: `$@batch_size * 4`, `$lambda x:
@postprocessor(x)`. The first implementation anyone writes finds `@batch_size`
in the text, converts the referenced value to a string, and splices it in
before evaluating. It works for the integer case and fails for every other: a
string value arrives unquoted, a mapping arrives as its printed form, an
instance arrives as an address, and any value an operator can influence
becomes a code-injection path.

The correct mechanism: the resolver walks the expression text for references,
resolves each one to its object, and **binds the object to a scoped name** in
the namespace the evaluator will read — either a generated identifier derived
from the id, or a lookup into a single scoped mapping of resolved objects keyed
by id — with the reference text rewritten to that name. The expression then
executes with those names in scope like any other local. The object keeps its
type, quoting is a non-issue, and nothing an operator wrote is ever re-parsed
as code. The scoped names are per evaluation, not global, so two expressions
referencing different nodes under the same short name cannot collide.

Two details of the rewrite are load-bearing. The references found in the text
are rewritten **longest first**: `@a` is a prefix of `@ab`, and a rewrite that
handled the short one first would corrupt the long one. And the rewrite is by
reference text, not by value, so the same object mentioned twice is bound once.
A consequence the specification must state: because the binding is the object
itself, an expression can **mutate** what it references — pop from a
referenced list, set an attribute on a referenced instance — and the mutation
is visible to every other node holding that object. That is a feature for the
author who knows and a trap for the one who does not.

When the evaluator's namespace is assembled from more than one source — the
scoped references, a set of imported modules the file declared, globals the
host passes in — a name defined twice is reported with a warning that names
both sources, and the later definition wins. Silently shadowing an import with
a reference produces an expression that evaluates to the wrong thing with no
error.

## The kill switch

The loader carries a **global switch that disables evaluation**. With the
switch off, an expression value is left as text — the code, unevaluated — and
the graph resolves with strings where computed values would have been. The
switch is global to the loader and set by the caller or the process
environment, never by the file; a file cannot re-enable its own evaluation.
This is the control a hardened deployment throws: load with evaluation off,
inspect what the file would have run, decide. An import form is the one
exception worth allowing through even with evaluation off, because binding a
module name executes nothing of the author's and an inspection tool still
needs to know which modules a file would pull in — but the specification says
so, rather than leaving the reader to discover that "off" is not quite off.

When the switch is read from the process environment, it outlives the run
that set it: a shell in which evaluation was disabled for one inspection keeps
it disabled for the next training launch, which then resolves to strings and
fails somewhere deep. The loader logs the switch's state at load when it is
not the default, so the surprise has a line to find.

The switch must default to on, because a format whose expressions are off by
default is a format nobody's file works in and everybody turns on in the first
line of every script — which is the same as no switch, with the extra cost of
having taught every operator to flip it without thinking. The guard that
matters is that the switch exists, is one line to throw, and is documented next
to the trust statement ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## The debug mode

A second switch, per node or global, evaluates the expression under the host's
debugger rather than the plain evaluator, so that an author whose expression
fails can step into it with the scoped names visible. Because the scoped names
are generated identifiers, the debug mode prints the mapping from reference
text to identifier before dropping into the debugger; without that, the
author sees `__local_batch_size` and has to guess. The mode is a
development convenience and is never on in an unattended run; a loader that
detects it on under a non-interactive environment should say so and continue
without it, because a debugger prompt in a batch job is a hang
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).

## Imports

An expression that needs a module needs it imported, and the file is the only
place that knows which. So the format carries an import form — an expression
whose result is a module bound to a name — and the resolver hoists every such
node before anything else, as described in
[reference-resolution-with-cycle-detection](./reference-resolution-with-cycle-detection.md).
Imports are the most obviously code-shaped thing in the file and the clearest
reminder, to anyone reading it, of what the hatch is.

## Decision rules

When a value can be expressed with a reference, use the reference; an
expression that merely returns `@x` is a slower, less inspectable reference.
When a value depends on runtime facts the file cannot know — the number of
devices, the current time — the expression is the right tool, and the
alternative of generating the file is worse. When the file will be loaded from
a source the operator does not control, load with evaluation off, or do not
load it. When an expression grows past a line, it belongs in a module the file
imports, not in the file; the hatch is for wiring, not for logic.

## When not to use this

A format consumed by tools in more than one host language cannot have a host-
language hatch; its expressions would be a dialect nobody else can run, and a
small purpose-built expression language (arithmetic, string formatting, no
calls) is the honest substitute. A format whose files must be machine-validated
without execution — a manifest, a schema — must not have a hatch at all. And a
format in which the only computed values are arithmetic over a handful of
scalars is better served by a fixed set of built-in functions than by opening
the whole host.
