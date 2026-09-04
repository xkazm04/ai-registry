---
layer: technique
type: technique
subject: register-bytecode-execution
technique: instruction-format-follows-program-lifetime
status: forged
laws: [count-carries-predicate, limits-are-derived]
shared_with: []
use_when: [choosing the instruction format of a new bytecode interpreter, an interpreter's programs are generated per request and executed once, a dispatch-count measurement is being used to settle a design choice, deciding whether an operand's width may vary, the opcode enum is filling up and a family of near-identical instructions is proposed]
---

# The instruction format follows the program's lifetime

The case for the register form is a dispatch-count argument: the same program
compiles to roughly half as many instructions, every executed instruction is an
indirect branch, and fewer branches is the win. The measurement is real. What it
does not carry is the workload it was taken on
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and
the workload is the whole of the choice, because **the win and the costs it buys
are paid on different clocks.**

- The dispatch saving is paid **per executed instruction**.
- The register allocator, the wider instruction stream, and the larger artifact
  to emit and load are paid **per compiled program**.

So the trade is not a constant, it is a ratio: **instructions executed per
instruction compiled**. Nothing about the two formats decides which side of that
ratio a given interpreter sits on; the programs do.

## The two regimes

**Long-lived programs.** A script loaded once and run for the life of a document,
a handler compiled at boot and called a million times, anything with a hot loop:
the ratio runs to the thousands, compile-time cost amortizes to nothing, and the
dispatch saving is the only term left. This is the regime the rest of this subject
assumes, and it is the common one — it is why the register form is the default
recommendation and why this subject is written about it.

**Single-execution programs.** A snippet composed per request, executed once, and
discarded: the ratio approaches one. Every instruction the compiler emits is
executed about once, so halving the executed instruction count halves a term that
was never dominant, while the allocator and the wider stream move onto the
critical path and are paid in full on every single run. An interpreter in this
regime measures **cold start plus a handful of commands** as its headline number,
and the stack form wins it — there is no register allocation pass at all, and the
denser stream is less to build and less to hand to the loop.

The existence of the second regime is not hypothetical and not a legacy
concession. A contemporary interpreter built specifically to run
machine-generated snippets, embedded in a host that creates and destroys sessions
constantly, reports a combined cold-start-plus-ten-commands figure in single-digit
milliseconds and is a stack machine with a value stack, an explicit
push/pop/rotate instruction group, and no register file. It was designed after the
register measurements were widely known.

**The discriminator, and it is one question:** *is the instruction stream executed
many times more often than it is compiled?* Answer it with the program population
the interpreter will actually see, not with a benchmark's inner loop, which is by
construction the long-lived case.

## The same trade decides operand width

The dispatch-count argument reappears one level down, and the received answer
there is a false dichotomy that costs a real option.

The argument runs: a compact encoding picking the narrowest width per operand
saves bytes and costs a **decode branch on every operand of every instruction**,
which is the same indirect-branch tax the format choice was made to avoid — so
operands are fixed-width, one word each, decoded by offset. That reasoning is
sound about the option it describes and silent about a third one:

| | Operand width | Decode branches | What it spends |
| --- | --- | --- | --- |
| Uniform | one word, every operand | none | instruction-stream bytes |
| Runtime-tagged | narrowest, width read from the stream | one per operand | dispatch time |
| **Opcode-encoded** | narrowest, width fixed per opcode | **none** | **opcode slots** |

The third row is the one to know. Width becomes a property of the *instruction*
rather than of the operand: the narrow form and the wide form are two opcodes, the
dispatch table entry already knows the width, and the operand is still decoded by
offset. The compiler picks the variant at emit time from a fact it already holds —
whether the index fits. No branch is paid at runtime, and the stream stays narrow.

**The bill arrives somewhere else.** One byte of opcode is 256 slots, and the wide
variants are drawn from that same account as every real instruction. An interpreter
that mints a variant per width finds the enum half consumed and the scarce resource
is no longer bytes or branches but **names**
([limits-are-derived](../../../../_laws.md#limits-are-derived): the ceiling is the
encoding's, not a policy's). The discipline that follows is a rationing rule, and
it inverts the default:

> Fold near-identical instructions onto **one** opcode with a discriminating
> operand — accepting the decode branch — **unless the instruction is hot enough
> that decoding the operand would cost measurable dispatch time.**

Which is the runtime-tagged option, adopted deliberately, for cold instructions
only. The three rows are not three philosophies; they are three prices, and a
mature instruction set pays each of them where it is cheapest: uniform width where
slots are scarce and code size is not, opcode-encoded width for the frequent
narrow case, a runtime tag for the cold family nobody profiles. Reserve the wide
sibling for the genuine overflow — an index past what one byte holds — rather than
minting a pair per instruction on principle.

## The opcode byte is a persisted format, not just a dispatch key

A reserved band left unused at the end of the enum is the usual protection: a new
opcode is an appended entry, never a renumbering of the ones a snapshot test
already knows. The band is worth having and it is not the load-bearing protection,
because it only holds while the numbering is private to one build.

The moment an interpreter can **serialize a compiled program or a paused frame**
and resume it later, the opcode byte is on the wire and in the file, and its
numbering is a compatibility contract with every artifact ever written. The
protections that follow are stronger than a band and are the ones to state:

- **Discriminants are explicit in the source**, so that reordering or deleting a
  variant cannot silently shift the format. An implicit discriminant makes the
  serialized meaning of every later byte a function of source-file line order.
- **Renumbering is permitted, and it costs a version bump on the serialized
  format.** This is the honest form: the band eventually fills, and a design whose
  only answer to that is "do not renumber" has no answer.
- The reserved band's remaining job is narrower and still worth doing — it keeps
  routine additions off the version-bump path.

Note which way this cuts against the previous section: minting opcode variants for
operand widths spends the same account that a persisted format makes expensive to
compact. An interpreter with snapshots pays twice for a wide sibling — once in
slots, once in the renumbering it cannot cheaply do later.

## Decision rules

- State the program population before choosing a format, and state it as a ratio
  of executions to compilations. A format choice defended by a dispatch benchmark
  has been defended on the long-lived case whatever the population is.
- Where the ratio approaches one, count the compiler's passes as runtime. An
  allocation pass that runs once per program is a startup cost in this regime, not
  a compile-time cost.
- Do not read "narrow operands cost a decode branch" as settled. Ask whether the
  width can be lifted into the opcode, and if it can, price the slots.
- Before minting an opcode variant, name the account it draws on and the fraction
  already spent. A rationing rule with no current count is not a rule.
- Where the interpreter serializes programs or frames, treat the opcode
  discriminant as format, pin it explicitly, and route renumbering through the
  format's version.
