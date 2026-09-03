---
layer: technique
type: technique
subject: register-bytecode-execution
technique: placeholder-patch-jumps
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [a single-pass compiler must emit a jump whose target has not been compiled yet, choosing between a second compiler pass and a patch list, a jump to a garbage address surfaced in execution rather than in compilation]
---

# Placeholder-patch jumps

A compiler that emits bytecode in source order meets its first forward reference at the
first conditional: the jump over the consequent must be written now, and its target
address is the length of the code after the consequent is compiled. The technique keeps
the compiler single-pass by emitting the jump with a **placeholder operand**, returning a
label that names the operand's byte offset, and patching the offset once the target is
emitted. Two invariants turn this from a hack into a design: the placeholder is a value
that can never be a real address, and every label is patched exactly once.

## The placeholder is not a value

The operand written at emission time is a sentinel: the maximum representable address,
or another value the code block can never reach. It is chosen so that an unpatched jump
executed by mistake fails loudly, out of bounds, instead of landing on instruction zero
and running the function from the top. A placeholder of zero is the classic error
because zero is a legitimate address and an unpatched jump to it is a silent infinite
loop ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): the
compiler's "I do not know yet" must never be readable as the interpreter's "go here".

## Labels, and the assertion that guards them

Emitting a jump returns a label carrying the offset of its operand slot. Patching a label
writes the current code length into that slot. The compiler holds labels for as long as
it holds the control-flow structure they belong to (the loop's break label until the loop
is closed, the conditional's else label until the else is emitted), and the structure's
close patches every label it collected. That much is mechanical. What keeps it correct
over years of contributors is the assertion at patch time: a label is patched **exactly
once**, and a structure's end is set **never before its start**. The first catches a loop
that patched its break label in two exit paths; the second catches a region whose close
ran before its open, which is the shape of every misplaced early return in a compiler.
Both are cheap, both fire in the compiler's own test suite, and neither costs the
interpreter anything.

Backward jumps need no placeholder, because the target is behind the emitter and known.
The technique is only about forward references, and a compiler that uses labels for
backward jumps too, for uniformity, has made the loop head a label it must remember not
to patch.

## Jump tables and multiple targets

A jump with several targets (a switch, a continuation table at the end of a protected
region) is a list of labels patched as each target is emitted, with the same
once-and-only-once rule per entry. The table itself lives in the instruction stream as a
count followed by that many fixed-width addresses, so the interpreter indexes it by
offset without decoding. The table's default entry is emitted first and patched last,
which is the only case in the technique where a label is held across the whole
structure it belongs to rather than to the next emission.

## Decision rules

- When a jump's target is ahead of the emitter, emit a placeholder operand and a label;
  never delay emission to a second pass, because the second pass exists only to
  compute what the label already carries.
- When choosing the placeholder, choose a value that is not a legal address in any code
  block, because a placeholder that is also a legal address turns an unpatched jump into
  a silent misexecution.
- When patching, assert that the label has not been patched before, and that a region's
  end is set after its start, because these two assertions catch the two shapes of
  compiler control-flow bug at the site that made them.
- When a structure holds several labels, patch them at the structure's close and drop
  them, because a label that outlives its structure is a label that will be patched
  twice.

## When not to use it

A compiler that builds a control-flow graph and serialises it afterwards has every target
before emission and needs no placeholder. A compiler that emits relative jumps to
symbolic labels resolved by an assembler has outsourced the technique to the assembler,
which implements it the same way. The technique is for the compiler that wants to be one
pass over the syntax tree, and that is the right ambition for a bytecode compiler whose
output is snapshot-tested and whose compile time is on the user's critical path.
