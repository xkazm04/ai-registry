---
layer: application
type: application
subject: guest-language-introspection
technique: per-function-trace-flag
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Per-function trace flag — `$boa.function.trace` and `.traceable`

Boa (github `boa-dev/boa`, commit `665f03924a54e5162be227e7e909612e36f6e35a`, toolchain
witness `rust-version = "1.91.0"` at `Cargo.toml:30`) puts the trace bit exactly where
the technique says it belongs — on the `CodeBlock` — and reads it in the one place the
technique says it should be read, the interpreter's per-instruction dispatch. It also
carries one deviation the technique's restore rule was written against, and one place
where the documentation describes a member the code does not implement.

## The bit is on the code block

`core/engine/src/vm/code_block.rs:222-234`:

```rust
#[cfg(feature = "trace")]
pub(crate) fn traceable(&self) -> bool {
    self.flags.get().contains(CodeBlockFlags::TRACEABLE)
}
/// Enable or disable instruction tracing to `stdout`.
#[cfg(feature = "trace")]
#[inline]
pub fn set_traceable(&self, value: bool) {
    let mut flags = self.flags.get();
    flags.set(CodeBlockFlags::TRACEABLE, value);
    self.flags.set(flags);
}
```

`TRACEABLE` is one bit of a `Cell<CodeBlockFlags>` beside `IS_CLASS_CONSTRUCTOR` and the
other per-code flags — interior-mutable, because the code block is shared by every
closure and every frame of the function and is otherwise immutable after compilation.
The frame carries no trace state; `core/engine/src/vm/mod.rs:792-796` reads the bit
through the frame's code-block pointer at every instruction:

```rust
#[cfg(feature = "trace")]
if self.vm.trace || self.vm.frame().code_block.traceable() {
    self.trace_execute_instruction(f, opcode)
} else {
    self.execute_instruction(f, opcode)
}
```

That single `||` is the technique's "same sink, same format" rule made structural: the
process-wide `--trace` flag (`context.set_trace(args.trace)` at `cli/src/main.rs:586`,
`Context::set_trace` at `core/engine/src/context/mod.rs:469`) and the per-function bit
take the same `trace_execute_instruction` path, and a generator's resumed frame — a
fresh `CallFrame` pointing at the same `CodeBlock` — sees the same bit. The whole path
is behind `#[cfg(feature = "trace")]`; the CLI enables the feature at
`cli/Cargo.toml:15` alongside `flowgraph`, so the two gates of the technique are the
crate feature and the `--debug-object` flag.

## The two entry points

`cli/src/debug/function.rs:113-122` is the shared setter: downcast the argument to an
`OrdinaryFunction`, reach `function.codeblock()`, call `set_traceable`. The two guest
members sit on top of it.

`trace` at `function.rs:125-142` takes the callable, a receiver, and rest arguments; it
sets the bit, calls, and clears:

```rust
set_trace_flag_in_function_object(&callable, true)?;
let result = callable.call(this, arguments, context);
set_trace_flag_in_function_object(&callable, false)?;
result
```

The clear runs on the throwing path too — `result` is a `JsResult` held across the
second call — which is the half of the restore rule this code keeps. The half it does
not keep is *restore to prior*: the third line writes `false` unconditionally, so a
`trace(f)` on a function the test earlier marked with `traceable(f, true)` clears that
mark on exit. The technique's rule is to write back what was read; the standard stays.
`docs/boa_object.md:64-67` also records that this member traces only the named function
("if the specified function calls other functions, their instructions aren't traced"),
so the tree ships the technique's default mode and no deeper one.

`traceable` at `function.rs:144-157` takes the callable and a boolean, sets the bit, and
returns `value.clone()` — the function itself, which is the upward lesson the technique
now carries: a mark can be applied at the point of definition. `docs/boa_object.md:85-89`
names the reason the bit is on the code block in the engine's own words — "useful ... to
trace functions that suspend their execution (async functions, generators, async
generators)" — and `docs/boa_object.md:93-122` shows the trace continuing through three
`Yield` / `GeneratorNext` pairs across three `iter.next()` calls, which is the
suspension-survival behaviour a frame-scoped flag could not produce.

## The static siblings, and an anchor that did not hold

`function.rs:89-111` is `bytecode` and `function.rs:51-87` is `flowgraph`. The
flow-graph member returns its rendering as a string (`function.rs:86`), in mermaid or
graphviz notation with a direction option. The disassembler does not:
`function.rs:106-110` is

```rust
let code = function.codeblock();
println!("{code}");
Ok(JsValue::undefined())
```

— it prints the listing to stdout and returns `undefined`. `docs/boa_object.md:22-24`
describes the same member as one that "returns the compiled bytecode of a function as a
string", and the transcript at `docs/boa_object.md:30-61` renders the listing as a quoted
string result. The documentation describes the design the technique asks for; the code
implements the print-and-return-nothing shape the technique names as the one a test
cannot assert on. Treat `docs/boa_object.md:24` as the naive reading and
`function.rs:108` as the tree.
