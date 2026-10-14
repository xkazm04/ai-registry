---
source: github:google/eng-practices
kind: repository
url: https://github.com/google/eng-practices
title: "Google Engineering Practices: the code review guide (reviewer and author halves)"
author: Google
words: 11417
extracted: 15
accepted: 0
declined: 0
leads: 2
already_covered: 7
untriaged: 6
dispatched: 0
applied: 0
shipped: 0
run_id: hv-se-1014-sec006
siblings: 0
---

# A review policy mostly covered by measurement and by gates; the human-review standard has no home

**Class:** first-party practitioner account in repository form: a doc-only tree of 16
files, about 11,400 words, no code, tests or evals, no README to strip. Queue row
SEC-006, harvest batch `hv-se-1014`. Commit `3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c`
(shallow clone, deleted by name). Fetches: 0 of 3. Forge-handoff count 0. The repository
is a primary for its own rules and n=1 for general truth: it states policy and causal
stories, no measurements. `check-anchors` was not run; anchors are `review/` path:line
from reading the files.

Expected yield said before the table: amendments and leads, not techniques. The
exception is the cluster below.

## Triage

| # | Candidate | Anchor | Decision |
| --- | --- | --- | --- |
| 2 | One self-contained change; about 100 lines fine, 1000 usually too large; may be rejected for size alone | `developer/small-cls.md:65` "100 lines is usually a reasonable size for a CL, and 1000 lines is usually too large" | **already covered** (`delivery-analytics/batch-size-thresholds`); the reviewer's right to refuse on size alone is the enforcement half the measurement technique lacks |
| 3 | Whole-file deletion counts as about one line | `developer/small-cls.md:83` | **already covered** |
| 8 | Label comment severity so required differs from advisory | `reviewer/comments.md:65` "Consider labeling the severity of your comments" | **already covered** (`quality-gates/severity-by-construction`, human-review instance) |
| 10 | Say which parts were reviewed when review is partial | `reviewer/looking-for.md` exceptions section | **already covered** (`review-attestation-ledger`, `review-coverage-rate`) |
| 11 | Reject a wrong-direction change at once and say what would work | `reviewer/navigate.md` step one | **already covered** (`refusal-names-a-reachable-remedy`) |
| 13 | A change description is a permanent record of what and why | `developer/cl-descriptions.md:5` | **already covered (partial)** (`docs-sync`) |
| 15 | Over-engineering is a defect: solve the problem you have | `reviewer/looking-for.md:50` | **already covered** (`dead-code/unadopted-extension-point`) |
| 6 | Response time, not completion time: first response within a business day | `reviewer/speed.md:36` "One business day is the maximum time it should take to respond" | **lead** |
| 9 | Approve with unresolved comments when the author is trusted, the comments optional, or trivial; the reviewer states which | `reviewer/speed.md:75` | **lead** |
| 7, 12, 14 | Do not interrupt focused work to review; review order design-first; fix the code before explaining it | `speed.md:45`, `navigate.md:40-70`, `handling-comments.md:37` | **untriaged** (no home, or unmapped) |
| 1 | Approve once the change definitely improves overall code health, even if imperfect; never approve a net worsening except in an emergency | `reviewer/standard.md:31` "favor approving a CL once it is in a state where it definitely improves the overall code health" | **untriaged** (not picked at the gate; no home) |
| 4 | A promised later cleanup never happens; new complexity is cleaned before submission, or filed as an owned bug | `reviewer/pushback.md:51` "usually unless the developer does the clean up *immediately* after the present CL, it never happens" | **untriaged** (not picked at the gate; boundary of `waiver-names-its-finding`) |
| 5 | Emergency means a small fix for a production bug, a security hole or a hard deadline; a launch-week wish, a soft deadline and sunk effort are not | `emergencies.md:45` "A hard deadline is one where **something disastrous would happen**" | **untriaged** (not picked at the gate; bypass eligibility for `quality-gates`) |

## Finding for the operator

The human review rung has no subject. The corpus models automated gates in depth
(27 techniques) and measures change size, but states no approval standard, no
cleanup-deferral rule and no emergency-bypass eligibility for review. Rows 1, 4, 5, 6
and 9 share one home if new (`engineering-process/standards-and-gates`), which is above
the three-candidate trigger. It is not forged: the primary is unmeasured policy, and a
new subject is an operator decision. Rows 1, 4 and 5 were offered at the run gate and not picked, so they are untriaged, not declined and not banked. "Cleanup
never happens" is Google's assertion; no study backs it in this run.

## Not extracted

Courtesy and tone, conflict escalation, cross-timezone review and mentoring: no
mechanism a team elsewhere could test for.
