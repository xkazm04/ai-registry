---
layer: application
type: application
subject: speed-to-lead-and-assisted-reply
technique: answer-in-first-sentence-never-promise
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The model path held the doctrine; the canned reply beside it did not

The Czech-first marketing workspace at commit `962c2a1b` (2026-10-14; the version
witness is the Node 24 test runner) already states all eight rules in the system
prompt of its model-backed reply tool, in its own words: the answer in the first
sentence, no promise absent from the grounding, a neutral address when the name is
absent. Reading that prompt against the technique found nothing to change, so the seam
was chosen to falsify "the doctrine reaches every surface that writes a customer
reply": a second, deterministic writer exists in the social inbox, and it is not a
fallback but the suggested text a marketer sends after a glance.

## What was read

Four canned replies, selected by keyword on the inbound comment. Two of them (a price
question, an availability question) opened with a standalone thank-you sentence, so the
answer sat in sentence two, which is rule 1 broken in the form the technique names
(thanks may share the first sentence, it may not replace it). All four built the
greeting from the author's first token with a literal filler word as the default, so an
author with no usable first name produced the greeting "Dobrý den díky" (rule 3: an
address must be neutral, not a word that merely reads as a name). The promise rule held:
no figure, date or discount in any of the four, and the only commitment is "as soon as
possible", with no hour attached.

## The change and the measurement

The answer now leads the first sentence and the thanks follow it in the same sentence;
an empty author yields the bare greeting. A pure function with four pinned cases.

| | A (before) | B (after) |
| --- | --- | --- |
| price and availability replies carrying the answer in sentence one (target) | 0 of 2 | 2 of 2 |
| empty or blank author yielding a stray greeting word | 2 of 2 | 0 of 2 |
| replies containing a price, date or percentage (floor, must stay 0) | 0 of 4 | 0 of 4 |

Floor also held: tsc, eslint and the 4,155-test unit suite unchanged apart from four
failures that already fail on the base (a hook-install exit code, a job-scope check, a
docs-command check, an embeddings test needing cloud credentials).

## Not measured

Whether marketers edit the old opener away in practice (no send-without-edit rate is
recorded for the social inbox). The canned replies still carry emoji, which rule 7
permits only when the voice asks; no voice is configured on that surface, so removing
them was left as an owner call rather than a measured defect.
