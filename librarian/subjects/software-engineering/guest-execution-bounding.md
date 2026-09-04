---
subject: guest-execution-bounding
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# guest-execution-bounding

Born 2026-09-03 from the forge wave `forge-boa-0903`, executed in-session from the `/intake` handoff `librarian/handoffs/2026-09-03-boa.md` (run `intake-boa-0903`, source `github:boa-dev/boa` @ `665f039`, routing count 13 NONE sharing one home-if-new). Placed in the new subcategory `backend-platform/language-runtime` with eight siblings (nine of a cap of ten). Stack `rust@1.91`, two applications against the source tree, gate green at birth.

How an interpreter enforces the ceilings it counts: per-opcode cost with cooperative yield through a second dispatch table, uncatchable limit errors that skip every guest handler, host re-entry counted in recursion depth, an explicit back-edge iteration opcode, an instruction budget for fuzzing, a bounded shadow backtrace. Links `capability-subtraction-sandbox` in the security subject (which owns reach and the counted-versus-uncounted publication) and `stage-ordered-fuzz-targets` (which owns where the budget sits in a portfolio). Structural fact: the budgeted loop has exactly one caller; module evaluation and promise jobs run through the blocking loop.

No fleet consumer yet: no managed project embeds a language runtime. Return condition in `librarian/applied.md` (2026-09-03).
