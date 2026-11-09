---
layer: technique
type: technique
subject: subprocess-lifecycle
technique: enrichment-wait-excludes-cold-start
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [a tool result waits on a helper process for extra information, an edit tool blocks for diagnostics from a language server, the first call in a session is much slower than later ones, choosing a timeout for optional enrichment on a tool result, deciding when to start a helper that takes seconds to load, a capped wait returned nothing and the result read as clean]
---

# The enrichment wait excludes cold start

A tool can finish its real work and then wait on a helper for something extra: an edit that
waits for diagnostics, a read that waits for symbols. The work is done and the wait is optional,
so it is paid only for what it adds. A single timeout on that wait hides two costs that behave
differently. One is the ordinary answer from a helper that is already loaded, which is short and
steady. The other is the helper's load, which happens once and can take many times longer.

Give them separate treatment:

- **Cap the wait at what a loaded helper needs.** The cap is sized from the warm answer.
- **Take the load off that path.** Start it when the file is read, or earlier, so it runs in the
  background during the time the agent already spends between reading and editing.
- **Say when the cap ran out.** A result with no enrichment because the wait expired is a
  different result from one that was checked and found nothing.

## Why one timeout does not do it

A timeout long enough to cover the load makes every first touch pay it. One sized to the warm
answer returns on time and delivers nothing on a first touch, so the first edit of a session
gets no check. Neither value is right, because no single number describes two distributions.

Measured on a language server loading about 2,700 files of real code, 12 edits per run with one
planted type error each:

| policy | first edit waits | first edit gets the diagnostic | later edits get it |
| --- | --- | --- | --- |
| wait up to 5 s, load on first touch | 4.6 to 4.9 s | 3 of 3 runs | 11 of 11 |
| cap 1.5 s, load on first touch | 1.5 s | 0 of 3 runs | 11 of 11 |
| cap 1.5 s, load at the read, 40 s earlier | 0.14 s | 2 of 2 runs | 2 of 2 |
| cap 1.5 s, load at the read, 3.8 s earlier | 0.8 to 1.5 s | 1 of 3 runs | 11 of 11 |

Loaded, the median answer took 73 to 98 ms and the slowest about 210 ms, so the short cap cost
no later edit anything. Lengthening the cap would have bought only the first touch, which the
early load buys better.

The last row is the limit. Starting early helps only when the read leads the edit by more than
the load takes. In one sample of 18 agent sessions, 130 of 308 edits followed a read of the same
file in that session, at a median of 39 s and a lower quartile of 3.8 s. The other 178 had no
read to start from, and those keep the cold first touch.

## An expired wait is not a clean result

In all three capped runs the planted error existed, the tool returned at 1.5 s with no
diagnostics, and the error arrived about 3 s later. A result shaped as an empty list says the
file is clean, and the agent has no reason to look again
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). The status belongs
in the result in words a model reads: the check did not finish, not that it found nothing
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

An answer that arrives after the tool has returned still has value. Attach it to the next
result for the same file, labelled with the version of the file it was computed for.

## Boundaries

- Starting a helper early spends memory and a process slot on a file that may never be edited.
  [session-reuse](./session-reuse.md) owns the warm pool and what it may hold; the warm helper is
  still a child with a reaper.
- This is for enrichment. If the tool's own result depends on the helper, the wait is the work,
  and it gets a ceiling and a failure status instead of a cap.

## What it does not prove

The measurement used one language server and one body of code replicated twelve times to stand
in for a large project, so the load was about 4.7 s. A load of tens of seconds was not observed.
It measured wait and delivery, not whether an agent makes better edits with the diagnostic in
front of it. The status wording and the late delivery on the next result were not tested.
