---
layer: application
type: application
subject: operator-surfaces-for-llm-spend
technique: glyph-encoded-business-thresholds
stack: rust
status: forged
---

# Rust: glyph thresholds in a shared JSON→Markdown render crate (LightTrack)

LightTrack's `crates/render` is the single render layer shared by the MCP tool
server, the `lt` CLI, and the `lt-runner bench` compare view
(`README.md:250-253`): every read tool returns compact Markdown tables from
this crate alongside the raw payload as `structuredContent`. The margin
reports in `crates/render/src/margin.rs` show the technique end to end.

## One function is the business rule

The level judgment lives in a single six-line function with the rule in its
doc comment (`margin.rs:249-258`):

```rust
/// 🔴 losing money · ⚠️ thin margin (<20%) · 🟢 healthy.
fn glyph(margin: f64, pct: Option<f64>) -> &'static str {
    if margin < 0.0 { "🔴" }
    else if pct.is_some_and(|p| p < 0.2) { "⚠️" }
    else { "🟢" }
}
```

Three details carry the craft. The loss test is on **dollars first** — a
negative margin is 🔴 regardless of percentage. The thin band takes an
`Option<f64>`: a row with cost and no revenue has no margin percentage, and
`is_some_and` routes the absent ratio *around* the threshold comparison
instead of comparing a fabricated zero — the value cell meanwhile renders an
em-dash (`mpct.map(pct).unwrap_or_else(|| "—".into())`, `margin.rs:38`).
And every caller fuses the glyph to the row key
(`format!("{} {}", glyph(margin, mpct), s(r, "key"))`, `margin.rs:34`), so
the severity survives copy-paste of a single row.

The same function grades every surface that shows the quantity: the rollup
table (`margin.rs:7-53`), the trend table (`margin.rs:92`, with `None` for
the percentage a per-day series doesn't carry), and the single-customer
headline (`margin.rs:197-217`). One tuning of the 20% band moves all three.

## Deltas get their own vocabulary and an explicit sign

The pricing what-if (`margin.rs:111-174`) grades its per-key change with a
*separate* triple — `delta_glyph` (`margin.rs:185-194`): 🟢 the hypothetical
model improves margin, ⚪ neutral, 🔴 it earns less — because "this what-if
helps" is a different judgment from "this row is healthy". The delta column
itself goes through `signed()` (`margin.rs:176-183`), which prepends an
explicit `+` on gains; the unit test pins this as a contract:
`assert!(out.contains("+$13.00"), "positive delta gets an explicit + sign")`
(`margin.rs:286-289`), alongside assertions that the simulation stamps itself
`Read-only` and echoes its `$8.00/Mtok` assumption.

## The prompt layer keys on the glyphs by name

The `margin-report` journey prompt (`crates/mcp/src/prompts.rs:147-160`)
instructs the agent in the renderer's own vocabulary: *"Call out every {dim}
with a negative margin (🔴) — they cost more in LLM spend than they pay — and
any thin-margin ones (⚠️)."* The model triages by the renderer's pre-computed
signal instead of re-deriving the threshold — the glyph function's judgment
propagates through the agent surface unmodified.

## The placement boundary, confirmed by omission

The same repo's shared dashboarding config
(`dashboards/grafana/dashboards/lighttrack.json`) defines 14 panels — errors,
calls, cost over time, cost by project/provider/model, scores — and **no
margin panel**. The ranked per-customer P&L that `margin.rs` renders exists
only on authenticated surfaces (admin-scoped API → MCP/CLI); the wall never
gets it. The glyph vocabulary makes the margin table effortless to read,
which is exactly why *where it renders* is a policy decision, not a
convenience one.

## Upward lesson taken from this repo

The draft treated signed deltas as formatting polish. The repo's pairing of a
dedicated `delta_glyph` triple with the `signed()` renderer — and a test that
fails if the `+` disappears — reframed it: the sign and the delta-specific
vocabulary are the what-if's actual finding, load-bearing enough to pin in
CI, and the technique now states both as first-class refinements.
