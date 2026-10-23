---
layer: application
type: application
subject: grant-source-landscape
technique: relevance-precision-filtering
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A national export ingested whole, status read and never gated

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-22 on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The changes are `84a80fc` and `b238884` on the project's
`main`.

## The status was parsed into prose

The Czech structural-funds adapter reads the ministry's bulk export of calls, which is the
national-export shape the technique opens with: every call ever published, in every lifecycle
state. The adapter extracted the status field and appended it to the description string, and
filtered nothing. Downstream, the match list drops a row only when its close date parses and is
past; a null date reads as rolling and open, and the adapter's sanitizer nulls dates five or more
years out. So a cancelled or unpublished call with a far or missing close date was offered as an
open opportunity, and the stored corpus reported every closed call as part of its size. A July
defect sweep of the project had named this and left it open.

The seam was chosen to falsify the technique's claim that status is the gate worth building:
a caught outcome would have been that the close-date screen already removes nearly every
non-actionable call, leaving the allowlist as ceremony.

## The paired proof

Both arms parsed the same file, the live export dated 2026-10-21: 821 calls. Status
distribution: 630 closed, 133 open, 21 planned, 20 cancelled, 5 ended, 5 in preparation, 5
suspended, 2 finalized. Rows stored, A 821, B 154 (81 percent dropped, close to the technique's
three quarters). Target: non-actionable calls that read as open after the close-date screen, A 13
(6 cancelled, 5 in preparation, 2 finalized), B 0. Floor: every open and planned call kept in B
(154 of 154), the full suite of 3,669 tests, type check and lint green; the new tests fail on A.

The close-date screen did most of the work on its own, which is the part the seam could have
refuted: it caught 654 of the 667 non-actionable rows at match time. It could not catch the 13, and it
never shrank the stored corpus. The finding held, with a measured size: in this export the status
gate changes what users are shown by 13 rows, and what the store holds by 667.

B is an allowlist of the publisher's own literals (open, planned), case and whitespace tolerant,
with the six observed excluded literals listed and translated in a comment. A missing status
fails closed like an unknown one. Each run counts drops per status, and a dropped status outside
the known excluded set is reported at fetch, so a new publisher literal shows up as a count.

## What the gate cannot do here

The store only upserts. A call ingested before the gate existed, or one that closes after it was
admitted, is never retired by a later fetch. Past close dates still hide most of those at match
time, but a call cancelled after admission keeps its open-looking row. That became the
technique's decision rule on pairing the gate with per-source retirement. The adapter is gated
off by default, so the number of already-stored rows affected on a live store was not measured.

The same replay found a second defect at the identity step, recorded separately: the live export
names the call code differently from the field the adapter read, so ids fell back to a title
slug, and 821 calls produced 768 ids.

## Return

When the store gains per-source reconciliation, re-run the replay and count admitted rows that a
later full fetch no longer contains.
