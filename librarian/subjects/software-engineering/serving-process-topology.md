---
subject: serving-process-topology
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# serving-process-topology

First touch: [[2026-09-03-vllm]], intake of an open-source inference engine read as a
system rather than a set of claims. NEW subject, 4 techniques, 3 applications, in the new
`backend-platform/inference-serving` subcategory.

## What the gap actually was

The corpus had `subprocess-lifecycle` (a supervised child's lifecycle) and nothing about
DECOMPOSITION: which loop must stay thin, what gets pushed out of it, and how an operator
sizes the result. The transferable core is not accelerators - it is any system whose inner
loop period IS the product's latency budget.

The best decision in the set is the one nobody would guess: the process start method is
**probed at runtime**, not configured, because the fast method dies after a graphics
context exists and the compatible one re-executes a consuming program that has no main
guard. The source writes down the obvious answer (force the compatible method always),
argues it, and DECLINES it. A design record that says what it rejected is rarer than one
that says what it did.

## Still open

The forging worker refused the tree's dismissal of the config-object testability cost
("not a big problem, most tests are end-to-end") and recorded why. Whether that cost is
real at scale is unmeasured here. The process-count formula is also a hand-maintained
copy of the spawning code with no computed check - recorded as a shortfall in the
application, and a natural thing for a later pass to test.
