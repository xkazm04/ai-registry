---
layer: application
type: application
subject: mcp-tools
technique: tool-schema-design
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# A catalog that demotes on purpose, and the one parameter that fell through

`xkazm04/lighttrack` is an observability service whose agent surface is a
stdio server publishing sixty-four tools generated from a single endpoint
table. The stack version is witnessed by `rust-toolchain.toml`, which pins
`channel = "1.96.1"` and exists precisely so the blocking gates are a function
of the commit rather than of the day CI ran. That file is the witness used
here; nothing in this document depends on a version a dispatch guessed.

This tree is a good witness for the transport-rung rule because it reached the
rule on its own, from the other direction, and then failed to apply it in one
place — which is what made the gap measurable rather than hypothetical.

## What the published surface actually contains

The catalog is generated, so it can be dumped and counted rather than
sampled. Sixty-four tools, two hundred and three top-level parameters, and the
entire published surface uses **six** schema keywords: `type`, `description`,
`properties`, `required`, `enum`, `items`. There is no `minimum`, no `pattern`,
no `format`, no `maxItems` anywhere in it.

That is not an oversight, and reading it as one is the mistake this document
exists to prevent. The catalog is shared with a second renderer — a parameter
"cannot describe itself one way to an agent and another way to a client
generator" — and the surface is held to a pinned contract by a generated-shape
test. Constraints are demoted into prose *as house style*, and the demotions
are unusually good ones:

- a projection horizon reads "days to project ahead (default 14, 1..=90)";
- its trailing-history sibling reads "default 14, clamped to 4..=90 — below
  the evidence floor a trend cannot be presented", which carries the reason
  and not merely the bound;
- a window start reads "an RFC3339 instant, or a relative 30m / 24h / 7d",
  an alternation the subset in use cannot express;
- a rolling window is a real three-value `enum`, kept on the machine-enforced
  rung because the subset carries it.

That distribution is the technique's ladder, built by a team that never wrote
it down: enumerations stay machine-checked, everything the subset drops moves
to prose with its reason attached. The registry's rule as it stood — formats
and ranges stay in the schema — describes none of this, and would have graded
the whole catalog as wrong.

## The one that fell through, and what it cost

`create_benchmark.baseline_score` published as
`{"type":"number","description":"the mean a run must not fall below"}`. The
handler rejects anything outside `0.0..=1.0` with a bad-request naming the
range, because run means are normalized. The bound therefore reached the
caller on **neither** rung: not the schema, which carries no numeric bounds at
all, and not the description, which states no unit.

The failure is the diagnosable one. "The mean a run must not fall below" with
no unit invites a caller reasoning in percentages to send `85`, two orders of
magnitude out, and read a rejection it cannot trace to anything it was handed.
The same tree already guards the neighbouring case: a test asserts that a
required argument appears in `required`, with the comment that otherwise "an
agent will omit it and get a 400 it cannot diagnose from the schema it was
given". The guard exists for requiredness and stops there — the enumeration
that names one constraint kind, one level down from the one this technique's
amendment corrects.

## The paired comparison

The measurable is **published parameters carrying a server-enforced value
constraint that reaches neither channel**, counted over the generated catalog
with the server's own rejection sites as the reference.

| Arm | Catalog | Count | Gates |
| --- | --- | --- | --- |
| A — as published | 64 tools / 203 params / 6 keywords | **1** | green |
| B — bound and reason demoted to the description | unchanged shape | **0** | green |

The change is one parameter's prose, following the house pattern its two
nearest siblings already set: the bound, the normalization that explains it,
and the disambiguation that prevents the specific wrong value. Both crates'
suites stayed green either side — twenty-one in the contract crate,
fifty-eight in the server — and the pinned-contract test did not move.

Verdict: **better**, at n=1, which is the honest scale. There was exactly one
instance of the defect in the surface, it was found by audit rather than by
guess, and the arm count travels with the number.

## What the tree proves that nobody built it to prove

**The pinned contract does not cover the channel the constraints live in.**
The pin carries each tool's argument names, types and required set; the test
holds the generator to it, so a renamed argument or a changed required set is
a failing build. A *description* can be rewritten to say anything, or nothing,
and every gate stays green.

Nobody designed that asymmetry — it fell out of pinning the machine-readable
surface, which is the obvious thing to pin. Its consequence is exact and it
runs against the house style: this catalog deliberately routes its load-bearing
constraints into the one part of the published surface with no drift guard.
The 1..=90 in a horizon's prose mirrors a clamp in a handler, and nothing will
notice when one of them moves. Demotion trades silent non-enforcement for
silent drift, and a surface that demotes as policy owes the prose rung a guard
of its own.

That fact is the strongest evidence available for the amendment's second
discipline, and it came from a tree that was ahead of the standard on the
first one.

## What this realization cannot do

The audit that produced the count is not an instrument the repository holds;
it was a dump of the generated catalog cross-read against the handler's
rejection sites by hand. It does not run in CI, so the count is a measurement
taken once rather than a property maintained. The return condition for
promoting it is a check that can name a server-enforced bound automatically —
which this tree could support, since both halves are already generated from
declarations, but does not today.
