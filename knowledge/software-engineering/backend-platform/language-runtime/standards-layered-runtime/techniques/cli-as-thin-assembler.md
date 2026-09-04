---
layer: technique
type: technique
subject: standards-layered-runtime
technique: cli-as-thin-assembler
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [building or reviewing the command-line front end of an embeddable runtime, diagnosing a program that behaves differently in the shipped binary and when embedded, deciding whether a requested feature belongs in the executable or the library]
---

# CLI as thin assembler

The executable at the top of a layered runtime has one job: make the handful
of choices the library leaves open, hand them to the library, and get out of
the way. The choices are few and fixed — **which job executor drives the
event loop, which root the module loader resolves from, whether the host
blocks on pending jobs or streams, and which runtime baseline and extensions
are installed** — and every one of them corresponds to a library entry point
an embedder could call with the same argument. Flag parsing, an interactive
prompt, pretty-printing of results and errors, and process exit codes are the
executable's own concerns and belong to it. Nothing else does.

The technique exists because the executable is the layer most tempted to grow
behaviour. It is where a developer first tries a feature, where a quick fix
for an awkward import lands, where a polyfill goes in "for now". Each of those
becomes a behaviour the shipped binary has and the library does not, and the
runtime acquires a fifth authority beside the language specification, the
standards, and the extras layer: *the binary, as it happens to behave*. No
embedder can depend on that authority. No standard describes it. And the
first bug report that says "works from the command line, fails embedded" is
the bill.

## The choice list is closed

**When a proposed flag would make the executable do something no library
caller can do, put the behaviour in the library first and have the flag select
it**, because the executable's vocabulary of behaviours must be a subset of
the library's ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
the library defines what the runtime can do, and the executable derives its
options from that definition rather than extending it). The test is
mechanical: for each flag, name the library call it maps to. A flag with no
such call is behaviour that has leaked into the wrong layer.

**When the executable needs a resolution rule, a default, or a limit the
library does not expose, expose it in the library as an option with the same
default**, because a default that lives only in the executable is a default
embedders cannot reproduce, and the programs that pass in the binary and fail
embedded are usually failing on exactly such a default.

## What the executable may decide

The executable is the right place for decisions about the *process*, which
embedders make differently and the library cannot know: which executor to use
when the host has no event loop of its own (the library ships a simple
queue-draining executor for this, and the executable picks it); where the
module root is, since it comes from the working directory or a flag; whether
to block until every pending job has run before exiting, which is a
command-line convention and not a library one; and which extras to install,
since a command-line tool wants the non-standard conveniences its users
expect. Each of those is a value passed to a library constructor. None of
them is a behaviour the executable implements.

The interactive prompt is the one substantial thing the executable owns, and
it is owned as a *client* of the library: it reads a line, hands it to the
library's evaluate entry point, prints what comes back. **When the prompt
starts to interpret input before the library sees it — special commands,
rewritten syntax — keep that vocabulary visibly separate from the language**,
because a user who learns the prompt's dialect and takes it to an embedded
context has been taught a language the runtime does not implement.

## The thickening test

Two measurements catch a thickening executable early. First, the executable's
dependency list. It depends on the engine, because the context builder is
the engine's; on the extras layer, because that is the baseline it installs;
and on the process-level libraries — argument parsing, line editing, terminal
colour. A dependency beyond those — on the parser, on the collector, on a
standard package the extras layer already re-exports — is a question to
answer: each such edge should map to a flag whose behaviour is a library
call (a syntax-dump flag legitimately needs the parser), and an edge with no
such flag is the trace of a behaviour implemented in the wrong place.
Second, the ratio of the executable's source that *calls* the library to the
part that *does* something: the assembly is a screen, the prompt loop is a
few hundred lines, and every line beyond those should be attributable to
rendering, flag parsing or process control. A front end approaching the size
of a standard package has almost certainly become one.

## When not to use it

A runtime that will never be embedded — a scripting tool whose only consumer
is its own binary — can put behaviour wherever is convenient, because there is
no second authority to diverge from. The technique pays the moment a second
consumer of the library exists, and it pays most when that consumer is a
conformance suite, because a suite exercises the library through the same
entry points an embedder would and reports every place the binary was
quietly doing something extra.
