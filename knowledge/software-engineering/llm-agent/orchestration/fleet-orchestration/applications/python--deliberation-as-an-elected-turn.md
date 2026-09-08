---
layer: application
type: application
subject: fleet-orchestration
technique: deliberation-as-an-elected-turn
stack: python
status: forged
verified_on: 2026-09-04
verified_against: python@3.11
applied: simulation
ab_verdict: better
proof: structural-only
---

# A tool that returns its own argument, and the one rule that makes it worth a turn

An open-source deep-research agent - a supervisor that splits a research brief
into topics, fans them out to parallel sub-researchers, reads what comes back,
and decides whether to go again - ships a reflection tool whose entire
implementation returns the string it was given, prefixed with an
acknowledgement. It reserves nothing, cannot fail, and changes no state. The
version witness is the runtime the project declares in its own graph
configuration (`python_version: "3.11"`), not a guess.

It looks like a no-op because it is one. Everything it buys is in the two
constraints wrapped around it.

## Elected, not mandatory

The tool sits in the supervisor's tool list beside the delegation tool and the
completion tool, so the supervisor *chooses* it the way it chooses to dispatch.
The alternative available in this framework was free and was not taken: the
graph could hold a reflection node between the supervisor and its tool
executor, firing every iteration.

Not taking it is the design. A node that always reflects pays a turn on
iterations with nothing to decide, and - the part that is harder to see later -
its output sits in the transcript indistinguishable from reflection the
supervisor wanted. Election is itself the signal, and a mandatory step destroys
it.

## Never in parallel with the action

Both prompts that mention the tool say the same thing in capitals, in the
supervisor's brief and again in the researcher's: use it after each result,
and *do not call it in parallel with any other tool*.

This is the load-bearing half and the reason the technique is not just "log
your reasoning". Tool calls in one batch are all generated from one context. A
supervisor that emits a reflection and three delegations together wrote the
reflection **before** any of the three returned - it is a prediction about work
that has not started, sitting in the record where an assessment belongs, and
nothing downstream can tell the two apart. Forbidding the parallel emission is
what turns the tool from a comment into a serialization point: the results
land, the turn ends, the next turn reads them, and only then is the next
fan-out chosen.

## The instruction the tree gives twice, and the one it does not give

The prompts pair the tool with the questions it is for - what did I find, what
is missing, is this enough, should I delegate again or stop - in both the
supervisor's brief and the sub-researcher's. That symmetry is right: the
member's loop has the same shape as the fleet's.

What is absent is any reading of the election rate. Nothing counts how often
the supervisor reflected, on what population, or whether it stopped reflecting
as it approached its iteration ceiling - the two behaviours this technique
names as differently-diagnosable failures. The record is written and never
read, which is a strictly better position than not writing it, and one step
short of the instrument.

## What this realization cannot do

The tool is durable only within one run's transcript. Nothing extracts the
reflections into a form a later triage can query across runs, so the account of
why a fan-out was three and not one survives exactly as long as the trace does.
For a fleet whose failures are classified after the fact, that is the gap
between an artifact and an instrument.
