---
layer: application
type: application
subject: nonprofit-verification
technique: identifier-checksum-prevalidation
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Two normalizers for one identifier: a form-accepted id reported as a typo

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `68158d3` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `8d82253` and its ledger row is `5dc9575`,
both on the project's `main`.

## The tree already implements most of the technique

The seam was chosen to falsify "the tree does this". Shape check, the published mod-11 check
digit behind one shared validator, an inconclusive `invalid` outcome that never touches the
network, a cache keyed on the normalized id, the no-checksum-means-shape-only comment on the
other market, and tested near-misses are all present. The invalid outcome is mapped to
inconclusive and never to a determinate fail. What a caught result could teach was the
normalization step, because the technique says every later stage must use the same normalized form.

## What the seam showed

There were two normalizers. The onboarding form tolerates `-`, `.` and `/` separators in the
typed identifier and checks the checksum on the de-separated form, then stores the value as typed.
The verification adapter stripped whitespace and zero-padded, nothing else. So `267-215-11`, a
checksum-valid id the form had accepted, reached the adapter as a ten-character string, failed
the checksum, and was reported offline as "not a valid organization id". That is the technique's
own failure: a true id sent back to the user's paperwork as a typo.

## What changed

One normalizer, owned by the jurisdiction model: whitespace and the tolerated separators removed,
then zero-padded to eight when the remainder is all digits. The adapter, its cache key and its
result id use it. The form's pattern stays eight digits.

## The paired proof

Arm A is the adapter verbatim; arm B shares the normalizer. Population: four separator or
padded spellings of checksum-valid ids, plus one real typo as the floor. Target, valid ids
reported as invalid offline: A 4 of 4, B 0 of 4, and B looks the canonical id up. Floor: the real
typo is still invalid with zero network calls; the plain, spaced and zero-padded ids are
unchanged; the full suite (3,637 tests), the type check and lint are green.

## What is not measured, and why a short id was left alone

No live count of separator-formatted ids exists. A short unpadded id (a spreadsheet dropping
leading zeros) is still rejected by the form shape while the adapter pads it. That was left:
asking the user to retype is a defensible repair, and padding in the unhinted detector would read
any four-digit number as an organization id.
