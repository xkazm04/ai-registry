---
layer: technique
type: technique
subject: test-harness
technique: pin-the-call-not-the-name
status: forged
laws: [gate-sees-target, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [a test asserts that one call appears before another in a file's source, a conformance check walks the suite's own files and reads them as text, a structural assertion went red after an edit that changed only a comment, a check accepts a cleanup or restore hook by its presence, deciding which marker a source-text assertion should search for, a source-text assertion disagrees between two checkouts of the same commit]
---

# Pin the call, not the name

A test normally observes a program running. A **structural pin** does not: its
input is a file's source text, and its claim is that some construct is present,
absent, or ordered ahead of another.
[unreached-decisions-pin-nothing](./unreached-decisions-pin-nothing.md) licenses
this as the honest interim where the site itself cannot be executed in the lane
— a guard that runs only inside a server entry point, a component wiring that a
lane with no interface cannot render — and the same shape recurs as a
conformance walk over the suite's own files.

It is an instrument, and it has three settings nobody sets on purpose: the
**population** it walks, the **needle** it looks for, and the **haystack** it
looks in. Every one of them has a default, and each default fails toward green.

## The haystack holds two languages

A source file carries the program and the prose about the program, and a matcher
cannot tell them apart. The consequence in the permissive direction — a guard
satisfied by a comment that merely *names* the thing it is hunting — belongs to
[match-the-resolved-artifact](../../../standards-and-gates/quality-gates/techniques/match-the-resolved-artifact.md),
which owns it and its remedy.

The direction the corpus has *not* named is the other one, and it is what a
structural pin meets first. Measured in one application tree: a contract spec
pins roughly forty throttled entry points by asserting that the shared limiter
call appears **before** a marker for the expensive work it guards. Editing a
stale comment in two of those files — to name the very markers the spec pins —
put those strings above the limiter and failed the ordering assertion for both.
The documented trap caught the note about itself.

An over-matching pin is not the harmless direction. It is paid for by the next
editor, who learns that touching a comment turns the suite red and concludes
that this code is not to be documented. A pin whose price is the project's
prose will be deleted, and then the rule it carried has no instrument at all.

## The needle is a shape only the program can produce

The repair that scales is not normalising the haystack; it is choosing a needle
the haystack's other language cannot write.

A **bare identifier is never usable for an ordering claim**, and the reason is
structural rather than stylistic: the name appears in the import line, which
necessarily precedes every call in the file. The pin then asserts that the
limiter precedes the import, which is false in every correct file. The same name
appears in the header comment for the same reason — a file that explains its own
call sites mentions them before it makes them.

A needle that carries a token only a call site has is immune to both:

- the opening parenthesis or brace **with the first argument behind it**, so the
  match requires an argument list rather than a mention;
- an `await` prefix, where the call is awaited;
- for an assignment, the `=` with a lookahead that excludes `==`, so a
  *comparison* against the same field is not read as a write to it.

In the measured spec, thirteen rows carry a comment recording exactly this
substitution, each naming the prose or the import line that forced it. That
record is the second half of the technique:

> **The explanation of a source-text pin goes in the asserting file, never beside
> the pinned code.** The pinned code is the haystack; a note there is an edit to
> the instrument's input. The asserting file's own comments are in nobody's
> haystack.

Choosing an unwritable needle is also what keeps a house rule of *explain the
guard beside the code it guards* compatible with a guard that reads that code.
The stripper and the needle are two answers to one hazard, and the needle is the
one that costs nothing and cannot itself be wrong.

## The needle names the resource, not the shape

A pin can match real code — no prose involved — and still be satisfied by
something that is not the behaviour, because the pattern describes a
**construct** where the rule is about a **resource**.

Measured, 2026-09-06: a lane whose probes share one process and must therefore
restore whatever they mutate carried a derived check that every file writing to
the process environment also registers a restore. It accepted *any* per-test
teardown hook as a restore. One file's teardown restored a network global and
nothing else, while its setup wrote a credential into the environment — so the
check reported zero offenders while that credential arrived in every later file
of the lane's fixed order, witnessed by a probe sorted after it. The repair reads
the teardown's **body** for the environment object.

The rule generalises past hooks: where a predicate is satisfied by the presence
of a construct, it must read that construct for the thing the rule is about.
Presence of the remedy's usual shape is not the remedy — the same move
[unreached-decisions-pin-nothing](./unreached-decisions-pin-nothing.md) makes
when it refuses a value with no producer named.

## The haystack is a checkout, not a file

Two properties of the bytes belong to the working copy rather than to the code,
and both produce a verdict that disagrees between two checkouts of one commit.

- **Line endings.** A marker chosen to end at a line boundary — a common way to
  stop a needle from matching the import line — matches nothing where the
  checkout translates line endings on the way in. Measured: an ordering pin went
  red on one platform for an order the code had right the whole time. Normalise
  the text before matching and say why: the claim is about order in the source
  and never about the byte that ends a line.
- **Readability as text.** A file the tooling declines to treat as text leaves
  the population silently;
  [match-the-resolved-artifact](../../../standards-and-gates/quality-gates/techniques/match-the-resolved-artifact.md)
  owns that case and its remedy.

## The population is the third setting

A walk that matches nothing reports a clean tree in the voice of a clean tree
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Both measured instances declare a floor — *at least this many files were read*,
*at least this many call sites matched* — and the floor is what survives the day
the needle stops matching. The discipline and its reasoning belong to
[derived-selection-must-be-measured](./derived-selection-must-be-measured.md);
a structural pin is one more configuration that has to be checked for having
matched anything, and its count travels with the predicate it was measured over
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

One refinement worth copying where a walk carries an exemption list: check the
list in **both** directions. An entry whose file now complies is reported too,
with *delete this entry* as the remedy, so the exemption set cannot quietly
outlive the holes it names.

## Boundaries

- [match-the-resolved-artifact](../../../standards-and-gates/quality-gates/techniques/match-the-resolved-artifact.md)
  asks whether the bytes a matcher reads are the thing the rule is about, when a
  resolution step stands between them — a configuration engine, a compiler, a
  bundler. Here there is no resolution step: the text *is* the subject, admitted
  as an interim because the site cannot be executed, and the question is how to
  build the assertion so it means what it says.
- [unreached-decisions-pin-nothing](./unreached-decisions-pin-nothing.md) says
  when a structural pin is allowed at all, and what it is weaker than. Read it
  first; this technique is only about doing the weaker thing well.
- [negative-control-tests](./negative-control-tests.md) supplies the control: a
  structural pin is proved by seeding the offending shape into a real file and
  watching it go red, and the seeded pair — one fragment that only *describes*
  the construct, one that is the construct — is what records why the needle has
  the shape it has.

## Decision rules

- **An ordering claim never rests on a bare identifier.** The import line
  precedes everything.
- **The needle carries a token prose cannot spell** — an argument list, an
  `await`, a write that is not a comparison.
- **A predicate satisfied by a construct reads that construct for the resource**
  the rule is about.
- **The reason for a needle lives in the asserting file**, in the row that pins
  it.
- **Normalise line endings before matching**, and state that the claim is about
  order and not about bytes.
- **The walk declares a floor**, and an exemption list is checked in both
  directions.

## When not to use it

Where the site can be executed, execute it — a structural pin is the interim,
and a lane that can run the real call once is worth more than any needle. And
where the construct genuinely has no textual form the prose cannot share (a
convention about naming, a rule about intent), the honest answer is that no
matcher decides it: that is
[prose-rule-drift](../../../standards-and-gates/quality-gates/techniques/prose-rule-drift.md),
not an instrument to be tuned.
