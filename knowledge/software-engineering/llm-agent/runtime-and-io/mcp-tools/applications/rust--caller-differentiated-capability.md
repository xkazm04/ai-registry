---
layer: application
type: application
subject: mcp-tools
technique: caller-differentiated-capability
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.96.1
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# A research runtime that had already made the subtraction, and what it knew that the technique did not

## The seam

The version witnessed is the toolchain the repository pins for itself —
`rust-toolchain.toml` sets channel `1.96.1`, pinned deliberately because
formatter drift from version skew had reached roughly 190 files before the
pin went in.

A Rust research runtime spawns a coding CLI as a subprocess and hands it an
allow-list of tools for the run. The list is not one list. Its configuration
carries two (`crates/core/src/config.rs`), chosen by execution mode:

- hosted mode grants `["WebSearch", "WebFetch"]` — the CLI's own tools;
- self-hosted mode grants exactly `["mcp__pumper__fetch"]`, one tool, pointed
  at the runtime's own MCP surface.

The invariant driving the subtraction is stated in the runtime's own words at
`crates/core/src/agent_tools.rs`: every non-valid token verdict is *"a refusal
the tool reports as its own error rather than as a silent unattributed fetch —
an unattributed fetch is precisely the state this feature exists to end."*
Self-hosted mode must attribute every outbound fetch to a job's budget, so the
subtraction removes exactly the tools that can fetch without attribution and
leaves the one that cannot. That is the technique's rule — subtract by the
invariant, not by what looks risky — arrived at independently.

Every refusal also names the surface, which is the technique's second rule:
*"It is not callable from an ordinary MCP client."*

## What A and B were

Arm A is the runtime as it stands. Arm B would be the runtime with the
technique applied. There is no arm B: the technique prescribes what the tree
already does, at both of its rules, so the verdict is `not-better` in the
literal sense that no change improves it. Nothing was committed.

## What the tree knew that the technique did not

Following the rule that a tree ahead of the corpus is a source, the question
put to it was what it carries beyond the two rules — and it carries a third,
which has been folded back into the technique as its own section.

A narrowed surface refuses often, and the runtime enumerates **four** verdicts
for one gate rather than two: no token presented, a token this process never
minted, a token whose run has ended, and valid. The three refusals carry three
different sentences, and the code says why the seam was extracted at all:
*"an expired grant is a different fact from an unknown one (the first says the
run is over, the second says the caller is not pumper), and a seam that
collapsed them would make a leaked-token report indistinguishable from an
ordinary late call."*

The technique as written required the refusal to name the *surface*. It did
not require the refusals to stay distinguishable from *each other*, and that
is the harder obligation: both cases look like a guard working correctly, so
a collapse is invisible exactly where it matters. The technique now carries it
as "The refusals are a channel, and they must not collapse either."

## The structural fact

The runtime's token lifetime is enforced by ownership rather than by a
sweeper — the mint guard is held beside the scratch files for the life of the
subprocess, so *"a cancelled run drops the guard on the same path that kills
the process tree, and the token stops resolving before the CLI has finished
dying."* Nobody designed that as a capability boundary; it fell out of Rust's
drop semantics. It means the narrowed surface's grant cannot outlive the work
it was narrowed for, which is a property the technique asks for and has no
mechanism to obtain in a language without deterministic destruction.

## What this realization cannot do

The subtraction here is over a *tool list handed to a subprocess*, which is a
coarser instrument than the per-option subtraction the technique's other
witness performs inside one tool. This tree can remove a tool; it cannot
remove a flag from a tool it keeps. Where an admitted tool's own arguments
need narrowing, this pattern has nothing to say and the argument-level guard
is the one that has to exist.
