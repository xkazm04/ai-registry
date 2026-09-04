---
layer: application
type: application
subject: agent-runtime-assembly
technique: indeterminate-closure-on-interruption
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@22.15
proof: structural-only
---

# Both halves of the rule inverted, in a harness that thought about the problem

The version witness is `mise.toml`, which pins `nodejs = "22.15.0"` alongside
`pnpm = "10.26.2"`; the TypeScript harness runs under that pin. Read at commit
`7801005`.

This is the negative case the technique names in advance, found in a system that
is otherwise careful. The harness keeps an append-only conversation event log and
replays it into a prompt on every model round. A turn can end with a tool call
outstanding — a crash, an interrupt, a service restart, a drain — and provider
APIs reject a message history containing a tool call with no matching result. So
the harness must close the gap. It does, and it makes both of the two choices the
technique exists to warn against.

## The verdict is a prose string inside a failure

The synthetic result written for every unresolved call is a failure flag carrying
a distinguishing sentence: `ok: false` with an error reading "tool execution did
not complete before the previous turn ended".

The technique calls this out by name and predicts the trajectory: *"the recovery
sweep marks the work failed with a distinctive sentence, and later, when
something downstream needs to know these were not real failures, a classifier is
added that matches on the sentence."* The tell it gives — a string comparison
against an error message — is not yet present in this tree, which is what makes
the instance useful: it is the state *before* the classifier, where the cost has
been incurred and not yet paid. Every consumer that later needs to distinguish
"the tool failed" from "nobody knows whether the tool ran" will have to re-parse
that sentence, and the first reword silently reclassifies history.

The model is the immediate consumer here, and it is being told something false
about the world it is about to act in: a call that may well have completed —
written a file, sent a message, charged something — is presented as a definite
failure. The technique's argument is that this is not a logging preference but a
correctness property, and the agent case sharpens it, because the reader acts.

## The closure happens at read time, and writes nothing

The second half is the one the technique flags as easy to miss: *"Every
unresolved call is given its synthetic result before the terminal event is
written. Not after, not lazily at read time, and not never."*

This harness closes lazily at read time, by construction. The repair lives in the
function that materializes events into provider messages: it tracks pending tool
call ids while scanning, flushes synthesized results before each later message
event and again at the end of the scan, and appends nothing to the log. The
durable record keeps terminal events sitting above calls that have no results.

What is notable is that the choice is *principled*, and the reasoning is sound as
far as it goes: writing a repair event would put a fact into an append-only log
that the runtime does not actually know, and this tree treats its event log as
the agent's one immutable history. Preferring an honest log to a convenient one
is the right instinct. But the technique's answer is that the dilemma is false —
the third status exists precisely so the closure can be *written* without
claiming a verdict nobody has. Choosing between "write a lie" and "write
nothing" is what a two-value vocabulary forces, and the vocabulary is the defect.

The cost is the one the technique states: the record is structurally incomplete,
so every consumer must invent a gap policy, and two consumers will invent
different ones. This tree already has two runtimes reading the same log — a Rust
executor and a TypeScript one — which is exactly the condition under which the
policies diverge.

## Why this counts as evidence

An inverted case from a careless system is worth little. This one is worth
recording because the tree demonstrably reasoned about the surrounding
constraints: it kept the log append-only on purpose, it documented the dangling
call as a known case, and it pinned the flush behaviour with a test asserting
that results are synthesized before later message events. It arrived at both
wrong answers *through* care, which is the strongest available argument that the
technique's two rules are non-obvious and worth stating explicitly.
