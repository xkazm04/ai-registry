---
layer: application
type: application
subject: agent-run-budgeting
technique: refusal-detection-and-requeue
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: sixty-nine refusals stored as results, and the detector that missed them

Measured on a skill benchmark running two agent runners against three repositories,
2026-09-15/16.

## The detector that worked

The Codex runner reports a refusal in its error stream with the provider's own words, so
the harness matched on text — `usage limit`, `rate limit`, `hit your limit`, `quota`,
`session limit`, plus a capacity group (`at capacity`, `overloaded`, `server is busy`,
`temporarily unavailable`). On a match it deleted the partial record, paused the whole
queue and requeued the cell: 30 minutes for an allowance limit, 10 for capacity, on the
reasoning that capacity recovers in minutes while an allowance window does not. Two real
events were handled correctly by this path — a capacity refusal at 20:59 that cost one
cell, and the weekly seat exhaustion at 09:33 that stopped the phase with 40 cells
outstanding and a stated reset five days out.

## The detector that failed, and what it cost

The Claude runner reports a refusal differently: the JSON envelope carries
`is_error: true`, but its `subtype` is the string `success`, and the actual reason — "You've
hit your session limit · resets 3:40pm" — appears only in the human-readable `result` text.
The harness recorded only the subtype in the run's errors, so the limit detector saw the
word `success` and matched nothing.

From 11:56 every job came back in about two seconds with exit 1, zero commits, zero tokens
and `errors: ['success']`. The orchestrator logged each as a finished run, ran the
deterministic checks against an unchanged tree, and stored `hard_pass=False`. **69 of 89
stored records in that phase were refusals dressed as failed runs** — produced in
minutes, and indistinguishable in aggregate from a model that suddenly stopped working.

The fix was one line of parsing: carry the result text into the errors field
(`"<subtype>: <result>"`), so the existing text detector sees the refusal. The 69 records
were moved to an archive directory rather than deleted, the phase was relaunched after the
seat reset, and it then completed all 96 cells in a single pass with no refusals at all.

## What the audit added afterwards

- **A sweep for the vocabulary across stored results**, because a detector added after the
  fact does not clean the record it failed to catch. The sweep over 281 earlier records
  found none, which is what made the 69 attributable to the parsing gap rather than to a
  long-standing hole.
- **A duration floor as a backstop.** Every one of the 69 returned in about two seconds
  against task ceilings measured in tens of minutes. A watcher now treats any run finishing
  in under ten seconds as a suspect regardless of what its status says, because the next
  refusal wording will be one nobody has seen.

## The generalisable part

Two runners, two refusal shapes, and the one that stored bad data was the one whose
refusal *looked like success*. The rule that would have prevented it is not "handle limits"
— that was implemented and working for the other runner — but "read the refusal wherever
the runner puts it, and never trust a status field to be the whole story".
