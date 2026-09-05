---
subject: register-bytecode-execution
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# register-bytecode-execution

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

A register bytecode over one shared value stack: frames as pointers into it (frame pointer stored once at push), generator resume as a stack swap plus a nested run, placeholder-patched jumps, a finally jump table with entry 0 as fallthrough, half-open handler ranges with environment depth, a leak-checked register allocator, a fixpoint optimiser capped at 10 that refuses to eliminate hoisted declarations. Structural fact: the VM design doc disagrees with the tree in four places (operand encoding, frame pointer, stack default, reserved registers). Deviation: the stack-limit check admits a wide frame one call late.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).

## 2026-09-04 - intake `monty` (run `monty-0904`, intake 2.5.0)

**The second independent source, one day after birth.** This subject was forged
2026-09-03 from a JavaScript engine in Rust and was single-sourced until now.
`github:pydantic/monty` @ `fdd2628` is a Python interpreter in Rust — a second
language runtime, independently designed, and it lands on the **other side** of
the subject's opening trade.

New technique `instruction-format-follows-program-lifetime`, plus a scoping
correction to the golden path's "Registers, not a stack" section. Three
unqualified sentences were scoped rather than deleted, all three found by reading
the host file for absolutes:

- *"fewer instructions is the win that matters"* — true wherever a program is
  executed far more often than compiled. The dispatch saving is paid per executed
  instruction; the allocator and the wider stream are paid per compiled program.
  A source whose programs are generated per request and run once takes the stack
  form: `op.rs:70-80` opens with `Pop`/`Dup`/`Rot2`/`Rot3`, and the headline
  measurement is 4.9 ms cold start plus ten REPL commands.
- *"Operands are fixed-width, one word each"* — the dichotomy (uniform vs a
  runtime-read width) omits a third option: width lifted into the **opcode
  identity**, no decode branch, paid for in slots. The source has exactly two wide
  variants and uses them as an overflow escape ("slots 256+"), then rations the
  account with a hotness rule that deliberately adopts the runtime-tagged option
  for cold instructions.
- *"a healthy instruction set leaves a reserved band"* — the band protects only
  while the numbering is private to one build. Where the interpreter serializes
  programs or frames, the opcode byte is a format on disk: `op.rs:64-66` pins
  explicit discriminants and routes renumbering through a dump-format version bump.

Structural fact, from parsing the enum body rather than grepping it: **122
variants, discriminants 0-121, contiguous, all explicit — no reserved band at
all.** My first count said 144 and was wrong (the grep matched a second
`#[repr(u8)]` enum in the same file); the corrected number is what makes the
absence of a band positive evidence rather than an impression.

One source-tree application (`rust--instruction-format-follows-program-lifetime`,
`verified_against: rust@1.95` from `Cargo.toml:28`). Apply row: **unapplied** —
all twelve fleet trees searched per-project, no managed project embeds a language
runtime, which confirms this note's own 2026-09-03 statement from the other side.
