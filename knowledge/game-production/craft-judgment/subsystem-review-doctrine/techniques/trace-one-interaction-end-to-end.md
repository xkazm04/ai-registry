---
layer: technique
type: technique
subject: subsystem-review-doctrine
technique: trace-one-interaction-end-to-end
status: forged
laws: [compiling-is-not-wiring, one-authority-per-quantity, structural-proof-is-never-sufficient]
shared_with: []
use_when: [reviewing a subsystem whose parts each look fine, hunting a defect that survives every per-file check, verifying a feature is actually wired]
---

# Trace one interaction end to end

## The concern

Per-file checks find defects inside components. The defects that cost weeks live **between**
them, in the seams — and a seam belongs to nobody, so nobody's checklist covers it. The three
canonical seam defects:

- **A second authority for one quantity.** One component holds the real value; another quietly
  keeps its own copy, updated on a different path. Each is internally consistent. The
  interface reads one, the damage path writes the other, and they agree right up until the
  moment they matter.
- **A read with no writer.** A calculation reads a modifier that no effect, table or default
  ever sets. It compiles, it runs, it contributes exactly zero, and every balance conversation
  downstream of it is about a number that does not exist.
- **A step that cannot be authored from code.** The chain passes through an artifact that must
  be made in an editor — an authored animation sequence, an event marker embedded inside one,
  a behaviour graph, a level.
  Everything on both sides of it exists. The chain is dead in the middle, and every structural
  check passes.

A trace of one representative interaction finds all three in a single pass, because it forces
the reviewer to account for *continuity*: every step must name its successor, and a step that
cannot is the finding.

## The procedure

Pick one representative interaction — the one the subsystem exists for. Produce a **numbered
call graph**, in order, in which every step names something real:

1. **Initiator.** What actor or system starts it, and *how* — a bound input, a tag, a
   controller call, a timer. "Something triggers it" fails the step.
2. **Activation.** The event or tag that activates, and the entry point that receives it.
3. **Branch actually taken.** Where the path forks, say which branch runs under the current
   configuration, and what the other branch would do. Reviews that describe both branches
   neutrally are describing the code, not tracing it.
4. **What is applied.** The effect, message, or mutation that carries the interaction forward,
   and the calculation that executes it.
5. **Reads and writes, listed separately.** Every quantity read by the calculation and every
   quantity written by it, by name. This list is where the second-authority and no-writer
   defects fall out on their own.
6. **What is broadcast, and who listens.** Each notification the interaction emits and the
   named listeners. An emitter with no listener is a finding; a listener that is the only
   thing keeping a duplicate copy in sync is a bigger one.

Then, over the completed graph, run two sweeps:

- **Authorability sweep.** Flag every step that depends on an artifact which cannot be
  produced from code. These are the steps that silently do not exist yet.
- **No-op sweep.** For every quantity in the read list, name where it is written. Any read
  with no writer is flagged as a no-op regardless of how correct the calculation around it is.

The graph is the primary output. Findings are derived from it and reported after it, so a
reader can check the reasoning rather than trusting the conclusions.

## Decision rules

- **When a step cannot name its successor, stop and report.** Do not bridge the gap with a
  plausible guess; the gap *is* the result. This is the trace's highest-value moment and the
  one most often smoothed over.
- **When two components both write a quantity, that is a finding at the severity of what the
  divergence causes** — usually high, because divergence between two health-like values shows
  up as a player-visible lie about state. The fix is one authority and adapters into it, not
  synchronisation.
- **When the interaction has real variants, trace one and name the others.** One complete trace
  beats four partial ones; the untraced variants are recorded as untraced, never as fine.
- **Trace the representative case, not the edge case.** The edge case is a debugging tool. The
  representative case is what tells you whether the subsystem is wired.
- **Re-trace after any change to the chain.** A trace is bound to the code it walked; after a
  refactor it is a historical document.

## Why it outranks its cost

A trace costs more than any single check — it is the most expensive item in a subsystem
review. It earns that because its yield is in a defect class with no other detector: seam
defects survive compilation, existence checks, convention checks, and per-file review by
construction, and they are found otherwise only by a player noticing that a number does not
do anything. When review time is scarce, the trace is the last thing to cut, not the first.

## When not to use it

- **Not on an unconfirmed subsystem.** A trace over entities nobody grounded produces a
  beautifully numbered fiction. Grounding first, always.
- **Not for a subsystem with no interaction chain** — a pure data or presentation layer with no
  multi-component flow has no seams to trace, and the effort belongs in its check set instead.
- **Not as a substitute for behavioural evidence.** A trace proves the chain is connected in
  the code. It does not prove the interaction looks or feels right at runtime; that is a
  separate rung of evidence and nothing in a trace implies it.
