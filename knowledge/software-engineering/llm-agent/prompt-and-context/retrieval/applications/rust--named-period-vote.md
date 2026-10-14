---
layer: application
type: application
subject: retrieval
technique: named-period-vote
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A period vote fused beside two lanes, and the hook path that runs it beside one (icm)

Source tree: `github:rtk-ai/icm@5f402434` (2026-10-13), a single-binary memory store for
coding agents, read at release 0.11.4. The stack version is the floor its crates declare
(`edition = "2024"`, which needs Rust 1.85); CI builds on the stable channel. Nothing here
was executed against the binary. The verdict is read from the tree's structure against the
measurement in the technique.

## The design this tree made

The v2 recall engine fuses three ranked lists by reciprocal rank (`k = 60`,
`crates/icm-core/src/fusion.rs:19 "pub const RRF_K: f32 = 60.0;"`): the lexical arm, the
vector arm, and a time list. The time list is not a fetch of its own:
`crates/icm-store/src/store/ranked.rs:59 "adds a third list: kept candidates whose"`
lie inside the window, built from what the two arms already returned
(`crates/icm-store/src/store/ranked.rs:125 ".filter(|m| window.contains(m.created_at))"`),
and `crates/icm-store/src/store/ranked.rs:61 "A window matching no candidate changes nothing."`
That is the technique's shape exactly: a vote over fetched candidates, never a filter.

The parser is precision-first and says why:
`crates/icm-core/src/temporal.rs:11 "A wrong window costs more than a missed one, so the rules give up when a"`
number or a word could be something else. Relative expressions resolve against a
caller-supplied instant, `crates/icm-core/src/temporal.rs:8 "never against the wall clock, so a benchmark"`
can ask about a past year, and the asker's offset decides civil days
(`crates/icm-core/src/temporal.rs:92 "Paris is the Parisian yesterday, not the UTC one."`).
On the write side the HTTP store call accepts the item's own event time
(`crates/icm-cli/src/http_api.rs:681 "mem.created_at = t;"`), so an import does not vote as
the day it was loaded. The tree reached the same decision as an earlier memory library mined
here, which kept its temporal signal additive for the same reason; that is the convergence
the technique stands on.

## What the structure says about the weight

The tree gives the time list the same weight as each topical arm
(`crates/icm-store/src/store/ranked.rs:158 "weight: 1.0,"`). With an embedder that is one vote
against two, close to the half-weight row the technique measured. Without one, the time list
is one vote against one, the full-weight row. The question is which path runs without an
embedder, and at what cut.

The answer is the path every prompt takes. The prompt hook injects recalled memories before
each user message, and it calls the ranked recall with a limit of five
(`crates/icm-cli/src/main.rs:5103 "let ctx = extract::recall_context(store, query, project_filter, 5)?;"`)
on a path documented as keyword-only:
`crates/icm-cli/src/extract.rs:276 "No embedder (the lexical and temporal arms rank alone), no neighbor"`.
That is a full-weight vote at a cut of five, the regime where the technique measured a
wrong window costing exactly what a filter costs (24 of 78 answered questions lost, against
24 for the filter). The paths that do carry an embedder default to the same cut of five:
the CLI flag (`crates/icm-cli/src/main.rs:145 "#[arg(short, long, default_value = "`, whose
value is 5), the HTTP route (`crates/icm-cli/src/http_api.rs:488 "const V2_DEFAULT_LIMIT: usize = 5;"`),
and the agent tool, whose schema test pins the default under
`crates/icm-mcp/src/tools.rs:5300 "The published limit contract is untouched."`. That is the
half-weight row at a cut of five, where a wrong window still lost 21 of 78. Only a caller that passes a token budget gets the wide default
(`crates/icm-cli/src/http_api.rs:490 "const V2_DEFAULT_LIMIT_WITH_BUDGET: usize = 200;"`),
the regime where the measured loss from a wrong window was one question in 105.

So the decision the tree states in prose ("costs more than a missed one") holds on the
budgeted calls and is held weakly everywhere else, most weakly on its most frequent path. Nothing is wrong in any one file: the fusion is correct,
the parser is careful, and the hook's narrow cut and missing embedder are each sensible for
a hook that must answer in milliseconds. The interaction is what turns the vote back into a
filter.

## What the tree does not do

- The time list cannot reach an item neither arm fetched, so a question that is only a
  period ("what happened yesterday") gets no help from it. The tree does not fetch by time.
- The vote's provenance is recorded per hit (each fused hit carries its time rank), which
  is the technique's "say what moved" rule.

## Return condition

`unmeasurable` until the hook path is replayed: build the binary, load a dated store, and
run the same past-state questions through the hook's recall at its limit of five, with the
window right and shifted. The prediction to falsify: with no embedder, a shifted window
loses about as many answers as a date filter would.
