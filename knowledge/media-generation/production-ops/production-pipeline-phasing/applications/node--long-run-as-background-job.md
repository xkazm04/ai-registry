---
layer: application
type: application
subject: production-pipeline-phasing
technique: long-run-as-background-job
stack: node
status: forged
verified_on: 2026-09-01
verified_against: node@24
---

# Node: a plan slot whose result can be deleted under it

Systedo (repo `systedo-case`, branch `master`, HEAD `6279066f`, Next 16 on
Node 24) runs its content board as a persisted plan: each slot records that
a generation was launched from it and, when the engine finishes, the id of
the asset it produced. Both halves are stored with the board; the asset
itself lives in another store the maker can delete from directly. That is the lifetime
mismatch, in one product: the slot's claim outlives the thing it claims.

## The two claims a slot can be left holding

`ContentPost` carries `briefStartedAt` — "ISO instant a generation was
launched FROM this slot" (`src/lib/content-schedule/sample.ts:73`) — and
`libraryEntryId`, the pointer to the produced asset, whose comment states the
split plainly: "the asset itself lives in the project's content library …
the slot stores only the pointer" (`:78`). `slotProgress`
(`src/lib/content-schedule/compute.ts:62`) reads them in that order: a
resolvable `libraryEntryId` (or body text) is `drafted`, `briefStartedAt`
alone is `drafting`, neither is `planned`.

So deleting the asset leaves the slot "claiming *Koncept hotový* and
offering a link to an asset that no longer exists — `slotProgress` reads
`libraryEntryId` as proof there is copy behind the slot"
(`compute.ts:143`). Nothing in the board's load re-checks it.

## Fix one: reconcile at the delete, not at the render

`clearLibraryLinks` (`compute.ts:153`) drops the dead pointer, and it is
called from the delete path — `sweepPlanLinks` (
`src/components/ai/SavedContentLibrary.tsx:165`, awaited inside `remove` at
`:184-188`) reads the stored board, clears matching slots and writes it
back. The seam choice is argued in the docstring: sweeping at the delete
beats detecting at the board's render, because the board "would have to load
the whole library on every paint just to ask 'does my pointer still
resolve', and it would still show the stale claim until someone opened the
plan." It is best-effort by design — the delete already succeeded, and "the
deep link discloses a dangling pointer as a fallback."

The repair is deliberately partial: clearing `libraryEntryId` is *not*
paired with clearing `briefStartedAt`, "because work genuinely did start from
that slot, so the slot falls back to *Rozpracováno* rather than to
untouched" (`compute.ts:146-148`). The claim about the result dies; the
history of the run does not.

## Fix two: when the owner is elsewhere, say it out loud

The same class appears where the result is owned by another system.
`reconcileWithChannel` (`compute.ts:94`) derives every handed-over slot's
status from the channel, and a slot whose channel post is gone "drops back
to `scheduled` and is FLAGGED `channelWithdrawn` — never a stale claim, and
never a silent revert either: the maker handed a post over and it is no
longer there, which is news they have to be told." The flag is a first-class
field (`sample.ts:70`) with its own user-facing sentence — "The post is no
longer in the channel — someone deleted it there. The slot is back in the
plan; you can send it again" (`ContentScheduleSlot.tsx:61`, rendered at
`:256-257`), distinct from the failure notice because nothing went wrong.

Because the derivation is pure, the withdrawal would be re-derived forever
against a dead link; `clearWithdrawnLinks` (`compute.ts:130`) is the
persisted half, run once per mount (`ContentSchedule.tsx:153-163`), and it
keeps `channelWithdrawn` while stripping the link "so the flag outlives the
evidence instead of being re-derived forever" (`compute.ts:89`).

## What ordering the two writes cost

The launch write is awaited before navigation (`createContent`,
`ContentSchedule.tsx:200-209`) after a fire-and-forget version proved unsafe:
the engine's link-back "reads the stored board, merges `libraryEntryId` into
it and writes the whole blob, and the state route is a blind
last-writer-wins PUT — so a `briefStartedAt` write still in flight could land
after that read and erase the pointer the engine had just recorded"
(`:191-196`). A result pointer that a racing job write can erase is the same
mismatch arriving from the other side: the asset survives, and the record of
it does not.
