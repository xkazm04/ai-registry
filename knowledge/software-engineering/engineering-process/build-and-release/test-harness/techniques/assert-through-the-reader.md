---
layer: technique
type: technique
subject: test-harness
technique: assert-through-the-reader
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [the product emits text another program will interpret, a setup snippet is offered for a user to paste into a shell, a rule is appended to a configuration file some other tool owns, a write succeeded and the effect never appeared, deciding whether a rendering or clipboard assertion covers a generated command, a product reconstructs a tool's file layout instead of asking it]
---

# Assert an emitted artifact through the program that reads it

Some of what a product emits is not for a human and not for itself. It is input
for **another program**: a setup block a user pastes into a shell, a rule
appended to a configuration file some other tool owns, a command line, a
manifest, a query. The claim such a product makes is never about the bytes. It
is about what the reader does with them.

Every cheap assertion available is on the near side, and every one of them is
satisfied by an artifact the reader will reject or ignore. The text rendered on
screen is right. The clipboard carries it. The write returned success. None of
those is the claim ([gate-sees-target](../../../../_laws.md#gate-sees-target) —
the assertion read the artifact, and the product's promise is about its
interpretation).

> **The oracle is the program that will read it. Run that program.**

## Two shapes, both green on the near side

- **Emitted for a parser.** The bytes are well-formed prose and ill-formed
  input. A value carrying a space, a quote, or a metacharacter needs quoting the
  emitter did not apply, and the reader refuses the line — or, worse, accepts a
  truncated version of it. Measured: four rendering assertions over one generated
  setup block all passed while the block's authorization header, which contains a
  space, was unquoted; pasted into a real shell it was rejected as an invalid
  identifier, so the feature had never worked for anyone who used it.
- **Written for a reader that never reads it.** The write lands at a path the
  tool does not consult. Nothing errors, the file exists, its contents are
  correct, and the behaviour it was supposed to change is unchanged. Measured: a
  rule appended to what the writer believed was the tool's metadata directory,
  in a working-copy layout where that directory is private to the copy and the
  tool reads a shared one.

The second shape has a tell worth learning: **the product reconstructed the
reader's layout instead of asking the reader for it.** Any code that joins a
known directory name onto a root it derived itself is correct in the common
layout and wrong in every variant — a linked working copy, a redirected home, a
relocated store.

## This is the cheap end of the far side

[far-side-oracle](./far-side-oracle.md) states the law: put the oracle where the
effect lands. It then describes a lane whose oracle is a daemon deployed onto
another machine — slow, environment-bound, scheduled rather than gating.

The economics here are the opposite, and mistaking one for the other is how this
class survives. The reader is a shell, a version-control tool, a package
manager: already installed, already a dependency of the lane, answering in
milliseconds. An emitted-artifact claim therefore belongs on the **unit rung**,
not above live-app. Settling for a string assertion because "executing it would
need an integration lane" is a cost estimate that was never taken.

## Three moves

- **Ask the tool where it will read.** Resolve the effective location through
  the tool's own query rather than reconstructing it, and treat an answer that
  is not in the expected form as *no answer* — a relative fragment joined onto
  the process's working directory creates a path nobody asked for.
- **Execute with synthetic credentials and assert the resulting state.** Run the
  emitted block in the target interpreter with a fabricated secret, and assert
  the environment the interpreter ended in — value by value, including the
  metacharacters. This is the only assertion that establishes parsing, and it
  costs one subprocess.
- **Assert through the consuming verb, not only through the query.** Where the
  artifact exists to change a later operation, drive that operation. Asking the
  tool *is this path excluded?* is one witness; performing the operation and
  reading what it did is the claim the product actually makes, and the two come
  apart whenever the tool consults more than one source.

## The fixture matrix is the prior state, not the input

For an artifact **appended** to a file somebody else owns, the interesting input
space is not the product's arguments. It is the states that file is already in,
because the product must decide whether its rule is already present — and that
decision is a matcher over text with all of that instrument's blind spots
([pin-the-call-not-the-name](./pin-the-call-not-the-name.md) and
[match-the-resolved-artifact](../../../standards-and-gates/quality-gates/techniques/match-the-resolved-artifact.md)
own them). Three prior states are worth a cell each: the rule absent, the rule
present **only inside a comment**, and the rule present and then **negated
later**. A naive *already contains this string* check reads the last two as done
and writes nothing.

Cross that with the layouts the reader supports and the matrix is small and
complete: in the measured instance, two working-copy layouts by three prior
contents, six cells, each one ending in an actual staging operation and a read
of what was staged.

## What a string assertion is still worth

It pins the wire form *after* the reader has established the meaning — useful,
because a reader-based test says the artifact works and not that it still says
what a human agreed to.

One trap makes most such pins worthless: **a substring of the emitted text is
usually shared by the broken form and the fixed one.** Quoting a value adds
characters around it, so a `contains` over the unquoted value passes on both —
the assertion is blind to exactly the defect it was written after. Where a
string pin is used on emitted output, assert the **whole line**, anchored, so
the broken form fails it.

## When not to use it

- **Where the reader is not available in the lane** — a hosted parser, a vendor
  service. That is [far-side-oracle](./far-side-oracle.md) or
  [recorded-interaction-fixtures](./recorded-interaction-fixtures.md), and the
  cost estimate is real there.
- **Where the reader is the product itself.** A round trip through one's own
  parser is an ordinary unit test; the value here comes from the reader being
  foreign and having rules nobody on the team wrote.
- **Where running the reader performs the artifact's effect.** A destructive
  command is checked with the reader's own parse-only or dry-run verb, or in a
  disposable copy of the world — never by executing it and observing that it
  worked.
