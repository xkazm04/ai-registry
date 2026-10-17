---
layer: application
type: application
subject: agent-session-archive
technique: declared-message-coordinates
stack: node
verified_on: 2026-10-15
applied: code
ab_verdict: unmeasurable
---

# Row coordinates for ledgers that siblings append to while you read

The technique is written for archived messages: cite a message in a declared coordinate
space bound to its conversation's identity, never as a line of a file, and refuse rather
than substitute when the coordinate no longer resolves. This registry has the same
problem with a different unit. Its shared ledgers (the applied ledger at 266,899 words,
the intake scorecard at 166,027, the lessons file at 160,003, the source ledger at
110,861) are appended to by several concurrent sessions, so a line number read at one
moment points at a different row a minute later, and an offset-paged read of a ledger
skips or repeats rows when a sibling appends mid-walk.

## What this run built

`scripts/ledger-read.mjs` (branch `ab/ledger-read`, `f15a86df`, merged `80b78ce5`) reads a
ledger as rows (table rows, or `## ` sections). Every row carries an identity, a hash of its
content, printed beside its line number with the line labelled informational. The paging
cursor is that identity plus a byte offset inside an oversize row. A cursor whose anchor
row changed is refused, never silently moved to a neighbour. The coordinate space is the
row, and the payload names it.

## What was measured, and what was not

The A/B this run ran for the reader measured bytes delivered: 30.5% fewer than today's
grep and tail commands across 12 questions taken from the skills, with all 12 answered
completely in both arms (merged as `better`). That is the budget half. The coordinate
half was verified by tests, not by an A/B: replacing the refusal with a silent skip fails
5 of the 10 tests, which simulate an append during a paged walk.

**Verdict for this technique: unmeasurable.** The instrument that would decide it: replay
the citations sessions actually wrote into notes ("line N of the applied ledger") against
the ledger as it stood when they were written and as it stands now, and count citations
that now resolve to a different row. Arm B is the same citations re-expressed as row
identities. The target is mis-resolved citations; the floor is citations that resolved
correctly before and still do.

## A boundary the transplant shows

A row identity built from a content hash survives appends and reorders but not an edit to
the row itself, and that is deliberate: an edited row is a different row, and a citation of
the old content should fail. Ledgers here are append-mostly but not append-only (a later
run strikes a row from an untriaged table), so the refusal is the expected outcome for an
edited row, not an error to retry.
