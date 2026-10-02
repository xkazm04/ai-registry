---
source: youtube:Rn4nmFRPe0s
kind: video
url: https://www.youtube.com/watch?v=Rn4nmFRPe0s
title: Claude Mods Is The Biggest Claude Code Upgrade Since Skills
author: Chase AI
words: 1906
extracted: 10
accepted: 3
declined: 0
leads: 3
already_covered: 3
untriaged: 1
dispatched: 0
applied: 1
shipped: 0
run_id: in-cccustom-1002
siblings: 0
fetches: 3
---

# A demo of a harness release, and the idle gap its cache clock was pointing at

**Class:** second-hand practitioner review (a demo of someone else's release) with a small
first-party operating half: the creator's own two plugins, a next-steps pane and a "cache
clock". 1,906 words, one caption track, a sponsor segment (00:03:24-00:03:50) skipped. The
operator's framing turned it into a dispatch as well: research the release's customization
surface and run experiments on it. The release's own authoring documentation shipped inside
the harness build in use (2.1.287), so the primary was read in-run, alongside the changelog
and the vendor's caching documentation (3 fetches: changelog, caching page summarized, the
same page re-read verbatim because a summarizer had produced the price footnote).

**Expected yield, said before the table:** currency and leads; the fetch carries the rest.
One landing came, and it came from the creator's operating half, not from the review.

**Siblings:** 0 live at claim; the board held 16 stale records from 09-17 to 10-01, none
reaped.

## Triage (v2.5 score; currency and leads under the corroboration table)

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | M | An idle gap past the cache lifetime inverts the rewrite premium | prompt-assembly/compaction-horizon-breakeven | corrects-claim | 2/0/2 | real gap | accept, landed |
| 2 | K | currency | S | Cache-read price is per model now | llm-price-book-operations (golden path) | resets-clock | table | real | admitted under the table, landed |
| 3 | X | application | M | Cache clock plus a 14-day replay | - | fills-stack-gap | with #1 | real | landed (applied: experiment) |
| 4 | K | technique | M | Before / instead / after / around an agent action | agent-runtime-assembly/observer-and-mutator-surfaces | none | - | catch | already covered |
| 5 | K | technique | M | Swap a destructive act for a reversible one (preview, bin, receipt, backup) | undo-history/execution-emitted-inverse, checkpoint-restore; data-retention/dry-run-preview | none | - | catch | already covered |
| 6 | K | technique | S | Offer several next-step prompts after a turn, not one | ui-surfaces wizard-flows (weak) | new-technique | 2/2/1 | thin | untriaged (V2: source prose only) |
| 7 | T | lead | S | Build harness guards from your own incident record, replay them before enabling | - | none | table | partial | lead (below) |
| 8 | X | currency | S | The harness shipped function-hook plugins in 2.1.287 | runtime-and-io/agent-cli-transport | resets-clock | table | real | lead (below) |
| 9 | - | - | - | "An ecosystem will grow like skills" | - | none | - | - | nothing (future tense) |
| 10 | X | - | S | Per-tool-event command hooks cost a process each | - | none | - | measured | already covered by measurement: about 10 ms per call (p50 10, p90 18, n=20); not a lead |

`auto=1/1/0 fp=0` (row 1 accepted, row 6 rejected on V2; rows 2, 7 and 8 ran under the
corroboration table).

### Row 1 - the landing, and what the source got right by accident

The technique prices a compaction's rewrite as `write × (ratio − 1)` because the prefix "would
have been re-read anyway". The creator's cache clock (00:05:31-00:06:50) is a device for the
case where it would not: a gap longer than the cache's lifetime, after which the next request
rewrites the whole transcript. The corpus had no clock in this subject at all (no TTL, idle or
expiry in its prose). The landing is an amendment, not a technique: the file's own rule survives
inside its premise, and the idle gap is a third wall beside the window and the price step.

Corroboration: the vendor's caching page (1-hour writes at 2x base input, reads at 0.1x with
per-model exceptions, lifetime measured from the request's start) plus a replay of this
machine's own transcripts. The source's "95% discount" is a lucky case: right for the one model
priced at 0.05x and wrong for most others. That is why the amendment says to read both prices
per model rather than carry a ratio.

The replay: 1,557 sessions, 52,274 main-loop requests, 14 days; 247 gaps over the
one-hour cache; cold rewrite median 344k (p90 792k); 34% of all cache-write tokens; compact-while
-warm cheaper at 233-235 of 247 gaps, -86 to -91% on the post-gap cost.

### Row 7 - the operator's ask, executed as experiments

The video's method ("audit how I use the harness, read my last 30 sessions, suggest five
plugins") was run against this machine's incident memory instead of a fresh transcript read,
because the memory is where repeated failures were already written down. Three plugins were
built, validated, type-checked and tested in the session's mods folder (not published - they
encode machine paths and private-project names):

- **a shell guard**: eight rules, each one a recorded incident. Replayed over 39,940 real shell
  commands from 14 days, it would have denied 190 (0.48%). Confirmed hazards in that set: 48
  case-insensitive multi-pattern greps that aborted with a core dump (read as zero matches), 4
  double-quoted backtick substitutions that visibly corrupted their command (21 substituted in
  all), about 13 `--help` calls that executed a registry script instead (one wrote a signals
  file), and a symlink that copied `node_modules`. **The first draft was wrong in a way the
  replay found**: it denied pathspec-scoped `git add -A -- <dir>`, judged heredoc bodies and
  commit messages as commands, and took "prints usage" for "handles --help" (the scan script
  mentions usage and still executes). Draft to final: stage-by-name 19 -> 3, branch-switch
  11 -> 7, help 70 -> 42, and the grep rule rose 19 -> 108 once quoted `|` stopped splitting
  segments. Remaining known false positives: scripts that reject unknown flags without naming
  `--help`, and scripts in worktrees since deleted (the replay could not read them).
- **the cache clock**: row 3's realization.
- **a run-board band**: live siblings and held locks in the status line, `/board` for detail,
  and a band only while a sibling has held a lock for a minute or more.

Lead, return condition: *when a second guard set (another machine, or a shared fleet hook) is
derived from an incident record, compare its draft-to-replay correction against this one; two
runs showing the same false-positive classes (scoped pathspecs, heredoc bodies, usage-vs-help)
make it a technique in agent-runtime-assembly.*

### Row 8 - currency, banked as a lead

2.1.287 added function-hook plugins (in-process hooks over tool calls, prompts, the system
prompt, transcript rows, rendering, compaction and timers), a built-in "side agent" plugin, and
`claude plugin configure` in 2.1.285. Return condition: *when the plugin API leaves early
access (its declaration file says "may change between releases without notice"), re-check the
claude-code applications in agent-runtime-assembly and agent-cli-transport that describe the
harness's extension points as command hooks only.*

### Row 6 - untriaged, with anchors

Next-steps pane (00:04:15-00:05:31): after a turn, offer three clickable next prompts instead
of one preloaded suggestion. Strip survives ("offer several next actions after an agent turn").
Nothing corroborates it, and the creator gave no measure. A later run with a primary on
suggested-reply UX, or an A/B on prompt-to-next-prompt latency, would promote it.

## Directions

`directions=n/a` - no design record (a video).

rescan_when: n/a (a video).
