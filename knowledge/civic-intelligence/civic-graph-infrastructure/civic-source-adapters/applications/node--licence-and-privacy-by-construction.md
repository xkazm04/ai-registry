---
layer: application
type: application
subject: civic-source-adapters
technique: licence-and-privacy-by-construction
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: structural-only
---

# Node: a purpose-binding header, contradicted by the notes written downstream

The politicas repo mirrors the justice ministry's officer registry export
(`lib/ingest/sources/dataor.ts`). The stack is Node 24, witnessed by the CI
pin in `.github/workflows/ci.yml`.

## What the tree did

The adapter header does the acquisition half well: it names the licence
document (non-commercial reuse), records that the recipient of officer birth
dates becomes a data controller, and states the rule: the birth date is
extracted "ONLY to compare against our own roster birth date, never surfaces
it directly". The licence is logged in prose, not as structure, and the rule
is a promise in a comment.

Seam chosen to falsify the technique's central claim, that purpose-binding
must live in the code and not in a header: if the downstream writers honoured
the header, the technique would add nothing here. Three of them did not. The
corroboration scripts built the stored analyst note by interpolating the
roster date: the match note ("datum narození poslance (YYYY-MM-DD)
potvrzeno"), the no-match note, and the PRaK re-point confidence note. Those
strings are persisted onto graph edges and rendered to the analyst. The
committed batch payloads hold ten date-bearing occurrences across two files.
The date was the roster person's (a public figure), but the rule in the
header is about the field, not the person, and the same code path handles
officers who are not public figures.

## The change

The three note strings moved into pure builders that take no date parameter,
so the stored text cannot carry one; the comparison itself is untouched. A
test pins that no ISO date appears in any branch. Console output of the
re-point script prints presence of a date instead of the value.

## Proof

Structural-only. Arm A: three builders able to carry a birth date. Arm B:
zero. Floor: role spans, term history, flags and verdicts unchanged, and the
exact-date comparison untouched. No behavioural arm was run because the
loops write to a live graph.

## Still open

Rows already persisted and the historical payloads keep the old prose;
scrubbing them is a data decision for the owner. The adapter still returns the
birth date as a field of its officer type, because the comparison needs it. An
API that answers "does this officer match this date" would close that too.
