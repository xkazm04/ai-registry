---
subject: serving-process-topology
domain: software-engineering
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# serving-process-topology

First touch: [[2026-09-03-vllm]], intake of an open-source inference engine read as a
system rather than a set of claims. NEW subject, 4 techniques, 3 applications, in the new
`backend-platform/inference-serving` subcategory.

## 2026-09-04 - /intake run (microsoft/VibeVoice @ 1541f59)

- **New technique `cache-residency-sets-the-balancing-unit`.** This subject treats replication as a pure capacity term and its own application records the assumption as a fact of the stack - "any API server to route requests to any engine core". The neighbouring `cross-instance-cache-lease` does handle router/cache coupling, and prescribes leasing per item so the coupling stays **out of** the balancer. Neither contemplates the regime where the coupling cannot be dissolved, because the cached state is the client's own growing prefix: there is nothing to lease finely and nowhere else to put it.
- Discriminating question: **does a request's cost or result depend on which replica served the one before it?** Distinguish by what the state is *about* - state about a work item can be leased, moved or re-derived; state about a **span of interaction** is defined by its history and cannot be reconstructed elsewhere without paying for the history again.
- The failure is a **wrong answer, not an error**: load-dependent (never reproduces at width one), partial (the first requests of every span are correct), and distributed across spans so each replica's log is internally coherent.
- The source is unusually good evidence because it holds **both regimes in one repository over one model family**, separated by one engine flag: the non-streaming launcher disables prefix caching and therefore balances freely by least-connections; the streaming launcher's product promise *is* the prefix cache, and it refuses the data-parallel flag outright.
- Closing section absorbs a second design decision that had no home of its own: **define the sibling mode's flag and refuse it with the reason, rather than omitting it.** An undefined flag produces a generic complaint naming nothing; a defined one can say what the operator wanted, why this mode cannot, and which topology achieves it. Accept-and-ignore is the worse variant - a deployment at a fraction of its provisioned capacity, with nothing saying so until the queue does.
- Also added to the golden path: a precondition before the sizing arithmetic means anything, and a failure mode ("the width that is really a router change").
- **Catch worth recording: `process-count-as-a-formula` predicted a live defect in the source.** Its warning that "a shared pool divided by a process count is the correct derivation and a per-process constant is the common error" is exactly the source's floored per-worker FFmpeg concurrency exported into each of N workers - host ceiling 64 x dp, 512 processes at the documented eight-way example, and one-directional because it is a max rather than a clamp, so the documented advice to tune it down is silently ignored. Written into the source-tree application, not landed.
- **`unapplied by construction`, decided at triage** - no fleet project has a context for this subject, verified per project. Return condition: a fleet project grows a model-serving path.

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
