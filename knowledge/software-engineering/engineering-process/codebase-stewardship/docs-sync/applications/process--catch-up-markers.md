---
layer: application
type: application
subject: docs-sync
technique: catch-up-markers
stack: process
status: forged
verified_on: 2026-10-31
---

# A marker that records its own obsolescence

The artifact is `.claude/guide-sync-marker.json` in the desktop repository,
left behind by the batch pass that rewrote a marketing guide against the
application it documents. It carries all four things the technique asks for,
and a fifth that turns out to matter more than any of them.

## The four fields, as declared

**The anchor.** `lastSyncCommit: "201bfeec6"` with `lastSyncDate: "2026-05-16"`.
The next pass scans that range forward instead of re-reading history or
guessing, which is the marker's entire reason to exist.

**What was covered.** `topicsUpdated` lists **84 topic ids** explicitly —
`installing-personas`, `webhook-triggers`, `fitness-scoring-explained`, and
eighty-one more. This is the technique's insistence that "full pass" is a claim
and the list is its predicate: a later reader can tell *"this topic was current
as of the anchor"* from *"this topic was never in scope"*, which a count alone
cannot distinguish.

**What was consciously skipped.** `missingCoverage` names three product surfaces
that had no guide topics at all — the cockpit chatbot, the meta-persona coach,
and outbound-only delivery. Recorded as gaps, in the same file, carried forward
as *"candidates for new-topic editorial work"* rather than discovered again by
the next pass.

**What was flagged but not fixed.** `topicsFlagged` is present and empty — which
is a declared zero rather than an absent field, and reads as "nothing was left
half-done" instead of "this pass had no such concept".

## The fifth field: a marker that argues for its own retirement

The `note` field is a paragraph, and its last sentence is the interesting one:

> *"The Stop hook at scripts/docs/check-doc-sync.mjs now prevents this kind of
> drift per-session; bulk rewrites should not be needed again."*

The marker records not just what the batch pass did but **why there should not
be another one** — naming the per-change mechanism that replaced it, by path.
The technique frames catch-up as the recovery lane for a per-change system that
lapsed; this marker closes the loop from the other side, pointing forward at the
enforcement that makes the recovery lane unnecessary.

That is the honest shape of the relationship between the two techniques, and it
is only visible because the note was written as prose rather than as a status
enum. A marker whose schema had no room for an argument could not have carried
it.

## The reconciliation, and what it costs

The anchor is dated 2026-05-16 and the note says bulk rewrites should not be
needed again — a claim with a testable consequence: if the per-change hook is
working, the marker should be *stale and that should be fine*. Three months on
it is indeed untouched, and the per-change mechanism it points at has since
grown a guard of its own for the failure mode where a mapping entry silently
stops matching ([source-doc-mapping](./node--source-doc-mapping.md)).

*Corrected 2026-10-31:* this paragraph said the hook was "not only alive". It
was not. The project's own replay, dated 2026-08-17, found the hook's
transcript walk had seen 0 of 2,367 edits since it landed on 2026-05-16, and
the hook is registered in no settings file at 2026-10-31. So the note's
sentence is a hope recorded as a fact, as
[catch-up-markers](../techniques/catch-up-markers.md) says, and the marker
being untouched is evidence of nothing. The framing above, that the marker
"closes the loop" by pointing at the enforcement that replaced it, does not
survive the correction either: it points at a mechanism that never ran.

The deviation is in the ledger's reach rather than its shape. `missingCoverage`
named three surfaces in May; nothing in the repository re-checks whether they
are still uncovered, still exist, or were quietly written up. A recorded gap
with no clock is a to-do in a file nobody re-opens — the marker did the hard
part, which is admitting the gap in the voice of the pass that skipped it, and
stopped short of the easy part, which is a date by which someone looks again.
