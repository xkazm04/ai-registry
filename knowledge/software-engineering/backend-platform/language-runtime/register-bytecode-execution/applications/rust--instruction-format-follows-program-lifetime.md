---
layer: application
type: application
subject: register-bytecode-execution
technique: instruction-format-follows-program-lifetime
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.95
---

# A stack VM chosen in 2026, and what it spends its opcode bytes on

Monty (`github.com/pydantic/monty`, commit
`fdd26283903f0559ee146ec48375867aadacf92b`) is a sandboxed Python interpreter in
Rust, built to run code that a language model wrote and nobody reviewed. The
version witness is `Cargo.toml:28` (`rust-version = "1.95"`, edition 2024); the
workspace holds eighteen crates. It is the technique's second regime in a tree
somebody can open, and it was designed with the register measurements already in
the literature.

## It is a stack machine, and the headline metric says why that is not a lapse

`crates/monty/src/bytecode/op.rs:70-80` opens the opcode enum with `Pop = 0`,
`Dup = 1`, `Rot2 = 2`, `Rot3 = 3` — implicit-operand stack manipulation — and
`CLAUDE.md:168` states the lineage plainly: *"Monty is implemented as a bytecode
VM, same as CPython."* There is no register file and no register allocator;
`crates/monty/src/bytecode/vm/mod.rs:355` defines a `CallFrame` over a shared
value stack.

The number the project leads with is a cold one.
`scripts/startup_latency_chart.py` carries the measured `ROWS` — the same figures
`docs/index.md`, `docs/alternatives.md` and `README.md` quote — as **cold start
plus a warm agent run of ten REPL commands**:

| | Combined (ms) |
| --- | --- |
| Monty | 4.9 |
| Full Monty | 7.4 |
| WASI / wasmtime | 200 |
| Docker | 900 |
| Sandboxing service | 1900 |
| Pyodide | 2700 |

Ten commands is the whole program population. A register allocation pass over a
snippet executed once is startup cost paid in full on every run, and the dispatch
saving it buys has ten commands to amortize over. This is the technique's ratio at
its floor, and the format follows it.

**The reconstruction is mine, not the project's.** No document in the tree argues
stack-versus-register; `CLAUDE.md` states the choice and moves on. What the tree
supplies is the structural pair — a stack machine, and a headline metric that is
cold start — and the arithmetic that connects them. Read it as an existence proof
that a contemporary interpreter lands on the other side of the ratio, not as a
claim about anyone's stated reasoning.

## Operand width is lifted into the opcode, and the bill arrives in slots

`op.rs:6-11` documents the encoding as a fixed property of each instruction:

```
- No suffix, 0 bytes: `BinaryAdd`, `Pop`, `LoadNone`
- No suffix, 1 byte (u8/i8): `LoadLocal`, `StoreLocal`, `LoadSmallInt`
- `W` suffix, 2 bytes (u16/i16): `LoadLocalW`, `Jump`, `LoadConst`
- Compound (multiple operands): `CallFunctionKw` (u8 + u8), `MakeClosure` (u16 + u8)
```

This is the technique's third row. Width varies across instructions and is never
read from the stream, so no decode branch is paid; the dispatch table entry
already knows the width and the operand is fetched by offset.

The wide siblings are used with restraint that the technique recommends and that
is worth recording as a count: **exactly two exist** — `LoadLocalW` and
`StoreLocalW` — and they are an overflow escape, not a general scheme.
`crates/monty/src/bytecode/builder.rs:329` says so: *"Slots 256+ use `LoadLocalW`
with a u16 operand"*, and `builder.rs:367,388` are the two emit sites that pick
the variant from a fact the compiler already holds.

The account this draws on is named in the tree. `CLAUDE.md:170-176`:

> Opcodes serialize as a single byte, so the `Opcode` enum
> (`crates/monty/src/bytecode/op.rs`) is hard-capped at 256 variants and roughly
> half are already taken. Use slots sparingly: prefer a flags/operand encoding on
> one opcode (e.g. `Assert`/`FormatValue`) over a family of near-identical
> opcodes, **unless the instruction is hot enough that decoding the discriminating
> operand would cost measurable dispatch time.**

That is the rationing rule with its current count attached, and the count checks
out: the enum body (`op.rs:69-558`) defines **122 variants against a ceiling of
256**, so "roughly half" is accurate to within two percentage points — and it adopts the
runtime-tagged option deliberately for cold instructions. The flag constants at
`op.rs:21-33` are the mechanism: `FORMAT_VALUE_HAS_SPEC`, `FORMAT_VALUE_STATIC_SPEC`
and `ASSERT_CMP_FLAG` fold what would otherwise be an opcode family onto one
instruction each, with `assert_flags`/`decode_assert_flags` (`op.rs:36-57`) as the
paid-for decode.

## The structural fact: the opcode byte is a persisted format, and the tree says so

The technique argues that a reserved band is the weaker protection once programs
or frames can be serialized. This tree is the case, and it did not solve it with a
band — `op.rs:64-66`:

> Opcode bytes are part of Monty's serialized `Code` format. Explicit discriminants
> prevent source reordering or removal from changing that format accidentally;
> intentional renumbering requires a dump-format version bump.

All 122 variants carry an explicit `= n`, and the numbers run 0 through 121
contiguously — **there is no reserved band at all**. The protection is entirely
the discriminant plus the format version, and renumbering is *permitted at a
stated price* rather than forbidden, which is the honest form: a band would
eventually fill and this design never has to pretend otherwise.

The fact the tree could not have been built to prove, and proves anyway: these two
decisions are in tension and the tree pays both sides. Serialization is a headline
feature (`README.md`: *"a paused interpreter serialises to bytes you can resume
later"*), which makes opcode slots expensive to compact later; and the wide-variant
mechanism spends slots to buy narrow operands. The conservation rule in `CLAUDE.md`
is what mediates them, and it is stated as guidance to contributors rather than
enforced anywhere — there is no check that fails when the enum crosses a
threshold, and nothing in the tree asserts the discriminants are contiguous either.
At 122 of 256 that is comfortable; the tension is structural, not urgent, and it is
legible only because the tree writes both halves down.

## What this realization does not do

It does not measure the counterfactual. There is no register-VM branch of Monty
and no benchmark comparing the two formats on this workload, so the tree
establishes that a serious contemporary interpreter for single-execution programs
took the stack form — not by how much it won. The startup figures compare against
containers and WASM runtimes, which differ from Monty in far more than instruction
format. A reader wanting the size of the effect will not find it here.
