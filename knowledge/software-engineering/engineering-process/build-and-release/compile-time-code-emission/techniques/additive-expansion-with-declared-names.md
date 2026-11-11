---
layer: technique
type: technique
subject: compile-time-code-emission
technique: additive-expansion-with-declared-names
status: forged
laws: []
shared_with: []
use_when: [an emitter replaces or rewrites the declaration it is attached to, a reader cannot tell what names a declaration has without expanding it, a module or item emitted by a macro is skipped by the formatter or the navigator, deciding what a generator should emit and what the author should keep in source]
---

# Additive expansion with declared names

An emitter adds code beside the author's declaration; it does not rewrite the
declaration in place. The names it introduces are declared up front, in the
emitter's signature or registration, so the compiler and the editor can know
what a declaration provides without running the emitter. And whatever the
author must read, edit or have formatted stays in source rather than being
emitted.

## Add, do not rewrite

Two mature host designs reached the same rule independently. One generator
host lets generators add source files to a compilation and forbids them to
modify existing user code; authors augment a type by declaring it partial and
letting the generator supply the other part. One macro design gives attached
macros a fixed set of roles - add peers, add members, add accessors, add
conformances - and returns additions rather than a replacement; it rejected
in-place rewriting because it would hide what a declaration means until
expansion ran and would cost compile time. Both reasons generalise:

- **A rewrite makes the source a lie.** The reader sees a declaration; the
  compiler sees something else. An additive emitter leaves the author's text
  meaning what it says, and adds what it adds beside it.
- **A rewrite couples emitters to each other.** Two rewriting emitters on one
  declaration compose in an order-dependent way, and each sees the other's
  output as if the author wrote it. Additions compose by union.

Some hosts do let an attribute emitter replace the item it sits on. Use that
power to re-emit the item with additions - a statement prepended to a body, an
attribute added - keeping every token of the original, and never to change the
meaning of what the author wrote.

## Declare the names an expansion introduces

When an expansion introduces names, the rest of the program can only find
them by expanding it - unless the emitter declares them. A host that requires
declarations (named exactly, by prefix or suffix of the declaration's name,
or explicitly arbitrary) can resolve a name lookup without expansion and
refuses the circular case where expansion depends on a lookup that depends on
expansion. Where the host does not require it, the rule still holds as
documentation: the emitter's documentation lists every name it introduces
and every name it requires the caller to have, and the probe in the testing
technique checks the list.

## Keep editable structure in source

An emitted item is invisible to tools that read source. A formatter formats
only modules it can find by reading files; a module declared inside an
expansion is never formatted. A navigator can jump to the emitter, not into
its output. A reviewer sees the invocation, not what it produced. So the
split between what is emitted and what is written follows one question:
**will a person need to read or edit this?** Module declarations, the list a
contributor appends to, the configuration a reviewer judges - written in
source, with the emitter consuming them. Mechanical consequences of those -
dispatch tables, accessors, conversions - emitted.

## When not to use this

A codemod rewrites authored code on purpose; that is its job, and the
subject's codemod technique governs it - the difference is that its output is
reviewed and committed, so the source stops lying the moment the change
lands. A pattern macro that exists to introduce new syntax for a whole block
has no declaration to add beside; its additive form is that it binds nothing
the invocation did not name.
