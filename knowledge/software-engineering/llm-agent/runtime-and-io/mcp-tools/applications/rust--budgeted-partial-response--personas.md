---
layer: application
type: application
subject: mcp-tools
technique: budgeted-partial-response
stack: rust
verified_on: 2026-10-15
applied: experiment
ab_verdict: unmeasurable
---

# A bounded fold that returns a partial rollup as if it were whole

The personas desktop app reads its fleet's agent-CLI transcripts and rolls each one up
into a summary (tokens, tools, files, message counts) that its fleet views and token
summary show (`src-tauri/src/commands/fleet/transcript_read.rs`). The fold is bounded,
and correctly so: one pass reads at most 1 MiB on whole-line boundaries
(`INGEST_MAX_BYTES_PER_PASS`), and the on-demand catch-up loops at most 64 passes
(`INGEST_MAX_PASSES`) so a file appended faster than it is read cannot hold the loop.
That is the technique's first half. The second half is missing. When the 64th pass ends
with bytes still unread, `ingest_catch_up` returns nothing, and `FleetTranscriptSummary`
has no field that says the rollup stopped short. A budget-shortened result reads exactly
like a complete one.

The seam was chosen to falsify the technique. If no transcript on a real machine came
near the cap, the rule would cost a field and buy nothing.

## The experiment (arm A only)

A Node replay of the fold bound (64 passes of 1 MiB, each ending at the first line
boundary at or after its budget) ran over every top-level transcript on this machine.
Four exceed the cap: 72, 96, 124 and 193 MB. The comment beside the cap sized it against
a local maximum of 6.3 MB, and that is no longer the population.

| transcript | bytes folded by one catch-up | usage tokens missed |
| --- | --- | --- |
| 72 MB | 89% | 11% |
| 96 MB | 67% | 32% |
| 124 MB | 52% | 56% |
| 193 MB | 33% | 66% |

Later calls resume from the stored offset, so repeated polling converges. But the entry
is evicted after 30 idle minutes and the next call folds from zero again. Any single
summary may show a third of a session as the whole.

## Verdict: unmeasurable, with the instrument named

Arm B is the technique's envelope at this seam: catch-up reports whether it reached the
end of the file, and the summary carries folded bytes, file bytes and a complete flag. It
was not built in this run. The change touches a type exported to the frontend, in a tree
holding another session's uncommitted work, so it is filed as the project's next change
(personas `.ai/applied.jsonl`, 2026-10-15) and not shipped. The instrument that would decide it: re-run the token
summary over the same four sessions and read the flag. The target is 4 of 4 visible.
The floor is the summary totals for the other 10,000-odd transcripts, which must not
change.

## What the tree confirms

The cap is a good bound, and the per-pass budget on a line boundary is exactly the
"shed at a boundary you chose" rule. What it lacks is the report. This is the technique's
case: the budget was designed and the envelope was not, so a partial result gets no label
on its way to the user. The registry's own transcript reader shipped a disposition count
the same day for the same reason (`agent-session-archive/ingest-disposition-accounting`,
applied to this registry).
