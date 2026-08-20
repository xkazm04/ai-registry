---
layer: application
type: application
subject: operator-surfaces-for-llm-spend
technique: agent-prompts-as-dashboards
stack: process
status: forged
---

# Process: seven operator journeys as MCP prompts (LightTrack)

LightTrack's MCP server ships its operator journeys as MCP prompts that
Claude Code surfaces as slash commands — `/lighttrack:cost-report`,
`/lighttrack:limit-check`, `/lighttrack:benchmark-leaderboard`,
`/lighttrack:score-triage`, `/lighttrack:recent-activity`,
`/lighttrack:price-book`, `/lighttrack:margin-report` (`README.md:255-258`).
The whole catalog is `crates/mcp/src/prompts.rs` — 227 lines including tests
— and it is a clean process template for the technique.

## The three-part shape, verbatim

The module doc states the design in one breath (`prompts.rs:1-7`): each
prompt "tells the agent *which* read tools to call and *how* to present the
result — the render layer already formats the tables, so the prompts just
steer tool choice + framing. They never trigger writes."

`cost_report` (`prompts.rs:70-85`) is the canonical instance. With a project
argument it resolves to a numbered procedure:

1. Tool plan — "Call `get_cost_summary` with project `{p}`…"
2. Presentation contract — "…and present the returned table verbatim (it is
   already formatted)."
3. Analytic framing — "Call `get_limit_status`…; call out any rule that is
   breached or at ≥80% of its threshold, naming the metric and window", then
   "Close with the single biggest cost driver (provider/model) and, if one
   model dominates spend, one concrete cost-saving suggestion."

Note the conditional lever: the saving suggestion is asked for only "if one
model dominates spend" — the prompt pre-authorizes a recommendation only
where the data supports it. `margin-report` (`prompts.rs:147-160`) does the
same with a closed menu of levers ("raise price, cap usage with a limit
rule, or move to a cheaper model/prompt") reserved for "a deeply-negative"
key, and keys its call-outs to the renderer's glyphs (🔴/⚠️) by name.

## Degradation instead of errors, as tested behavior

Every argument-taking journey has an explicit no-argument branch. Bare
`limit-check` (`prompts.rs:93-95`): "first call `list_projects`, then call
`get_limit_status` for each (or ask the user which project to check)". Bare
`benchmark-leaderboard` (`prompts.rs:108-110`): ask, or list benchmarks
first. The unit test pins the contract with its own comment
(`prompts.rs:216-220`): `assert!(text.contains("list_projects")); // graceful
fallback, not an error`. Only a genuinely unknown prompt *name* errors
(`prompts.rs:54`, tested at 222-225) — the boundary between "operator gave
less than ideal input" (degrade) and "caller is broken" (fail) is drawn
exactly where the technique draws it.

Argument weaving is centralized in `call_with` (`prompts.rs:171-185`), which
builds the tool-call hint from whichever of project/limit are present, so
optional arguments compose instead of forking per-journey text.

## Catalog discipline

Seven journeys, each a recurring question from the operator's week (spend +
limit warnings, limit check, regression check, judge-score triage, recent
activity, price book, margin) — not a generated wrapper per API endpoint
(the same server exposes 28 read tools; the catalog curates, `README.md:
239-244`). Each `def(...)` carries a one-line description that doubles as
the slash-command menu entry (`prompts.rs:12-30`), and `list_exposes_all_
prompts` (`prompts.rs:192-204`) pins the catalog's membership and count so a
renamed journey breaks CI, not the operator.

The read-only stance is structural, not aspirational: the prompts name only
read tools, and independently the server gates all 15 write tools behind
`LIGHTTRACK_MCP_ALLOW_WRITES` (default off) with key-minting never exposed
at all (`CLAUDE.md:74-78`) — the journey layer and the capability layer
enforce the same posture from opposite sides.

## Upward lesson taken from this repo

The draft specified tool plan + verbatim presentation + framing, but its
framing guidance was open-ended ("summarize what matters"). The repo's
prompts showed that the framing works because it is *closed-form*: a fixed
threshold with its number (≥80%), a fixed close ("biggest driver + one
suggestion"), and levers offered from a fixed menu under a stated data
condition. The technique now prescribes fixed-shape syntheses and
data-conditioned recommendations rather than open summarization.
