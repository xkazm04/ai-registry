---
subject: register-bytecode-execution
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# register-bytecode-execution

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

A register bytecode over one shared value stack: frames as pointers into it (frame pointer stored once at push), generator resume as a stack swap plus a nested run, placeholder-patched jumps, a finally jump table with entry 0 as fallthrough, half-open handler ranges with environment depth, a leak-checked register allocator, a fixpoint optimiser capped at 10 that refuses to eliminate hoisted declarations. Structural fact: the VM design doc disagrees with the tree in four places (operand encoding, frame pointer, stack default, reserved registers). Deviation: the stack-limit check admits a wide frame one call late.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).
