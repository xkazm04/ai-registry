---
layer: application
type: application
subject: production-pipeline-phasing
technique: long-run-as-background-job
stack: react
status: forged
---

# React: minutes-long AI runs as jobs in a browser studio

Gravitone (repo `gravitone-gcloud`) runs its long creative AI work —
research passes, notebook follow-ups, and a real script recalibration
backed by a local Claude CLI process — through one React context,
`lib/jobs.tsx`. The file's opening comment is the technique's thesis:
"research is long, and the user is not locked while it runs" — a run
"belongs above the step that started it, survives navigating away, and
reports back through the bell rather than by holding a screen hostage."

## Per-kind concurrency, enforced at claim time

The policy is data: `SERIALISED = new Set(["followup", "recalibrate"])`
(`lib/jobs.tsx:146`) — research is "deliberately absent" because different
topics are independent, while a follow-up "mutates the notebook it was
launched from" and a recalibration rewrites the project's scripts, so both
are one-per-project.

`start` (`:432-483`) enforces the refusal in "three checks that get
progressively wider": a synchronous `live` ref (two clicks in one tick both
read the same pre-update React state array, so state alone cannot catch a
double-click — `:306-309`), then this tab's state, then
`claimedElsewhere` (`:266`) reading the shared localStorage record
synchronously at click time — because two tabs each starting a recalibrate
is "two real minutes-long Opus 5 calls whose results overwrite each other."
`claimInStore` (`:285`) publishes the claim inside `start`, before it
returns; waiting for the persist effect "would get there a frame later, and
a frame is the entire race." The residual window — localStorage has no
compare-and-swap — is stated in the `claimedElsewhere` docstring rather
than hidden, with the note that a server-side record closes it.

## Driven vs measured: no invented fractions

Every job carries `measured` (`:62-70`): a driven job "is waiting on work
with no schedule — a local Claude Opus 5 turn is minutes and nothing here
knows how many. Drawing a fraction over it would be inventing one, so
surfaces show elapsed time instead" (`elapsed`, `:527`). The mocked-duration
timer that once animated fake progress was deleted (`:127-143`), and with
it the rule hardened: `recalibrate` forces `driven` ("a caller cannot opt
it back onto a clock that would lie about it", `:434-436`), and since
nothing in the file can now advance a job, "an undriven start would sit at
`running` with a `measured` progress of 0 forever — a worse lie than the
nine-second recalibrate timer that was removed for telling a shorter one."
On non-success, `finish` (`:384-403`) leaves the fraction where it stopped
rather than snapping to 100%.

## Interruption is honest, and ownership scopes the claim

Jobs persist under one key (`STORE_KEY`, `:157`) precisely because "a
refresh mid-run used to lose the whole thing silently, including any unread
notification about work that had already finished." On mount, `readStore`
(`:180-200`) marks jobs it finds `running` as `interrupted` with a reason —
"say it was interrupted, which is the only thing we actually know" — never
resurrecting them as live and never calling them done.

But the claim is scoped: `interrupted` "is a thing a tab says about
ITSELF." `ownerTab` (`:71-77`) records which tab runs a job; `fresher`
(`:204-215`) lets a copy still saying `running` beat one saying
`interrupted`, and `mergeJobs` (`:217-230`) never lets another tab's copy
overwrite a job this tab owns — otherwise a newly mounted tab's
"interrupted" would land on a live run, `settle` would no-op on the real
result, and paid work "would land nowhere." The `storage` event handler
(`:363-382`) both delivers other tabs' work and pushes the truth back when
a stale interruption was written over an owned run.

`settle` itself (`:485-492`) no-ops on any job not `running`, "so a late
resolve after a cancel cannot resurrect it" — and `interrupted` is a
first-class member of `JobStatus` (`:49`), the same word a reload already
uses.
