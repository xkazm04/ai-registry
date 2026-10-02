---
layer: application
type: application
subject: prompt-assembly
technique: compaction-horizon-breakeven
stack: claude-code
status: forged
verified_on: 2026-10-02
verified_against: claude-code@2.1.287
applied: experiment
ab_verdict: unmeasurable
proof: unproven
---

# The idle gap is the wall nobody draws: a cache clock over 14 days of sessions (Claude Code)

The version witness is the CLI's own `--version` output on the machine the
replay ran on, and the first line of the plugin API's declaration file that
build writes ("Written by Claude Code 2.1.287"). Function-hook plugins
("mods") first shipped in that release, per its changelog.

The technique prices a compaction's rewrite as a premium over a read, on the
premise that the prefix would have been re-read anyway. This application tests
the case where that premise fails: a person steps away, the prompt cache
expires, and the next request rewrites the whole transcript. A practitioner
video occasioned it. Its creator had built a status-line-adjacent "cache clock"
with a compaction button, and claimed a 95% discount on cached reads. That is
right for one current model and wrong for most others, which is why the
technique now reads both prices per model.

## Arm A and arm B, on the same gaps

The instrument is the harness's own session transcripts: every main-loop
assistant record carries its usage (`cache_creation_input_tokens` with the
one-hour and five-minute split, `cache_read_input_tokens`) and a timestamp,
and every compaction leaves a boundary record with its pre- and post-token
counts. One pass over the last 14 days found:

| measure | value |
| --- | --- |
| sessions / main-loop requests | 1,557 / 52,274 |
| cache lifetime in force | one hour (every write in the window was the one-hour class) |
| idle gaps longer than the cache | 247 (median 171 minutes, p90 917) |
| cold rewrite on the first request after a gap | median 344k tokens, p90 792k |
| cold rewrites as a share of all cache-write tokens | 34% |
| cache read on that same request | median 26.6k (the shared system prefix only) |
| post-compaction size (33 compactions observed) | median 15.0k tokens |

Arm A is the gap as it happened: `context × 2.0` (the one-hour write price over
base input). Arm B is the same gap priced with a compaction run while the cache
was warm: `context × read + summary × 5.0 + memo × 2.0`, at the published read
price of 0.05x for the model in use and output at five times input. Arm B was
cheaper at 235 of 247 gaps (233 with a 12k-token summary), and cut the
post-gap cost from 192.2M to 17.5–27.4M base-input units, an 86–91% reduction.

## Why the verdict is `unmeasurable`

The target moved, and on paper it moved a long way. The floor did not get
measured. Arm B was priced and never run, so nothing here says whether a session
resumed from a fold continues its task as well as one resumed from the full
transcript. Two other things are also outside the instrument. The 247 gaps are
the ones the operator came back from: a compaction before a gap that ends the
session is pure cost, and the median session ended carrying 53k tokens. And
the replay cannot tell which gaps the operator could have predicted. The
instrument that would settle the floor is a paired continuation eval: resume
the same sessions after a real gap from a warm-compacted state and from the
uncompacted transcript, and grade task completion on both arms.

## The realization: a clock, not a timer

The harness change is a function-hook plugin in the operator's own harness, not
a fleet commit. It records the start of every main-loop model request (the
lifetime runs from a request's start, per the vendor's caching documentation),
puts the minutes left and the context size in the status line, and in the last
ten minutes, over a context of at least 40k tokens, draws a band above the
prompt: the size of the cold rewrite, a **Compact now** button that runs the
same compaction `/compact` runs, and Hide. It never compacts on its own,
because the replay's blind spot is exactly the gap the harness cannot
predict. Its tests drive a mocked clock through a real `turn.step` and mount
the band on two surfaces. A compaction offered at 52 minutes is pressed and
reaches the engine. At 20 minutes, after expiry, and over a 12k context, the
band stays absent.

What it cannot do: it knows the lifetime only as a constant (one hour, read
from the session's configuration rather than from the API), it sees the
context size the status line reports and not the cache's real state, and a
subagent's requests, which keep their own prefixes warm, are deliberately not
counted.
