---
layer: application
type: application
subject: register-bytecode-execution
technique: frame-as-two-pointers-into-one-stack
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# One stack, stored pointers, and three places the design docs lag the tree

Boa's virtual machine (`boa_engine`, workspace version 0.22.0 at `Cargo.toml:29`,
pinned at commit `665f03924a54e5162be227e7e909612e36f6e35a`) realises the frame-as-view
design over a single `Vec<JsValue>`. The version witness is `Cargo.toml:30`
(`rust-version = "1.91.0"`). Everything cited below was re-opened on the pinned tree on
the date in the frontmatter, and three of the citations are the tree disagreeing with its
own design documents, which is the structural fact this application exists to carry.

## The layout and the push

`core/engine/src/vm/mod.rs:105-120` documents the `Stack` type as persistent across
frames, addressed relative to each frame's `fp`, and lays out the slice in the order the
technique describes: `this`, function, arguments, then the register file. The prologue
width is `CallFrame::FUNCTION_PROLOGUE = 2` at `core/engine/src/vm/call_frame/mod.rs:112`.
`push_frame` at `vm/mod.rs:588-619` is the whole per-call cost: `frame.fp` is computed
as the current length minus the argument count minus the prologue, `frame.rp` is set to
the current length, and the stack is resized by `code_block.register_count` filled with
`undefined` (`vm/mod.rs:595-606`). Return is `truncate_to_frame` at `vm/mod.rs:147-150`,
which truncates to `frame.frame_pointer()`. The accessors `this_index`, `function_index`
and `arguments_range` at `call_frame/mod.rs:184-196` derive from `fp`, the argument
count and the prologue constant, with no second copy of any slot.

The persistent registers are five, not the two a first reading of "undefined and the
promise capability" suggests: `UNDEFINED_REGISTER_INDEX = 0`, the promise capability's
promise, resolve and reject at 1, 2 and 3, and `ASYNC_GENERATOR_OBJECT_REGISTER_INDEX = 4`
(`call_frame/mod.rs:113-117`). Each has a constructor returning `Register::persistent`
(`call_frame/mod.rs:119-139`), which is what lets the register allocator's drop check
accept them.

## The frame pointer is stored, and the docs say it is derived

`CallFrame` carries `fp: u32` as a field (`call_frame/mod.rs:57-59`, "points to the start
of this frame's data in the stack") and `push_frame` assigns it at `vm/mod.rs:597`. The
design document `docs/vm.md:179-183` says instead that the frame "can figure out where
everything lives on the stack using just `rp` and `argument_count`" and gives
`frame_pointer() = rp - argument_count - 2`. That was true of an earlier revision and is
not true of this one, and the reason it changed is the technique's rule about setters:
the generator machinery at `core/engine/src/builtins/generator/mod.rs:74-77` splits the
stack at `fp`, then assigns `frame.rp -= frame.fp; frame.fp = 0`, a rebase that a derived
`fp` could not express. The stored field is the design; the doc is the naive reading.

## Two more places the docs describe a different tree

`docs/vm.md:68-69` says most operands use a `VaryingOperand` that picks `u8`, `u16` or
`u32` by value. `core/engine/src/vm/opcode/args.rs:149-181` shows `IndexOperand`,
`RegisterOperand` and `Address` all encoding with `write_u32` and decoding with
`read::<u32>`: operands are fixed-width, which is the technique's position on the
dispatch cost of narrow encodings, and the doc describes the encoding the tree removed.

`docs/vm.md:318-319` says the default stack size is 1024. `core/engine/src/vm/runtime_limits.rs:24`
sets `stack_size: 1024 * 10`, ten thousand two hundred and forty slots. The limit is the
sibling subject's; the discrepancy is cited here because it is the third instance of the
same structural fact: the operating documents in `docs/` were written for the VM as it
stood some revisions ago, and a worker who reconciled against them instead of the tree
would have shipped three wrong claims. `docs/vm.md:296-300` adds a fourth, smaller one:
it places the promise capability at registers 0-2 and the async generator object at 3,
one below where `call_frame/mod.rs:113-117` puts them, because it predates the reserved
undefined register.

## Deviation: the stack check does not count the incoming register file

`Context::check_runtime_limits` at `vm/mod.rs:1017-1033` compares
`runtime_limits.stack_size_limit() <= self.vm.stack.stack.len()`. It is called at the
call boundary before the push (`core/engine/src/builtins/function/mod.rs:991`, with
`push_frame` at line 1030), which is the right place, but it compares the height *before*
the resize and does not add `code_block.register_count`. A call made with the stack one
slot under the limit is admitted and then resized by the callee's whole register file.
The technique's standard is height plus incoming register count; the tree checks height
alone, and the standard stays.

## The two dispatch tables

`core/engine/src/vm/opcode/mod.rs:412-427` defines `OPCODE_HANDLERS: [OpcodeHandler; 256]`
and `OPCODE_HANDLERS_BUDGET: [OpcodeHandlerBudget; 256]`, generated by the same macro
from one opcode definition; the budget handlers differ from the plain ones by one
`saturating_sub` of the opcode's `COST` (`opcode/mod.rs:445-448`). The reserved band is
`Reserved1` through `Reserved61` at `opcode/mod.rs:2147-2267`. The second table is the
sibling subject's mechanism; the shape (two tables, one macro, a reserved band) is this
subject's.
