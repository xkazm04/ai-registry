---
layer: application
type: application
subject: plan-review
technique: fresh-posture-self-challenge
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Process — a read-only planning session whose risks list could not say whether it was examined

A code-maintenance product runs a read-only planning session per batch of findings and gates
the execution on the operator's decision over the stored plan. The planner writes one JSON
block in one pass: intent, per-item approach, files, declared architecture moves, a `risks`
list and a `notDoing` list. That is rung two of the challenge ladder with its boundary
missing: the plan and its self-assessed risks come from the same pass, and the reader maps an
absent `risks` field and an examined-and-clean plan to the same empty list, which the desk
renders as nothing.

**Seam chosen to falsify** "the fixed question set and a sentinel are enough to make the
pass auditable". If a strict, fail-closed reader had no honest place for a sentinel, the
technique would need a carve-out. It had: the reader already treats `risks` and
`notDoing` as informational, so the only open question was what a malformed or empty value
should do, and the answer (read as did-not-run, never void the plan) became a decision rule on
the technique.

**A and B.** A: the reader drops unknown fields, so a challenge list of any content, empty or
absent yields the same plan object. B: the planning brief asks for a challenge segment (the
five fixed questions, the plan presented as another planner's draft) and a reserved sentinel
for found-nothing; the reader keeps a non-empty list, reads empty, absent or malformed as
undefined without voiding the plan, and the desk shows "not recorded" versus the notes.

**Read.** Target: the three states are distinguishable in the stored plan. A fails the new
parse test, B passes it. Floor: the 97 existing planning tests, tsc and the push gate stay
green, and a malformed challenge never turns a readable plan unreadable (pinned for five
malformed shapes). Not measured: whether the extra segment changes plan quality or breaks the
planner's wall-clock budget; the brief already says to write the plan once and to aim for
three quarters of the ceiling. The sentinel-only ratio becomes computable from stored plans
once real planning sessions run on the new brief.

Return condition: after a batch of real planning sessions, read the ratio of sentinel-only
plans beside their risks and revisions; a ratio near one with no revisions is the signal to
seed known defects or move to a separate reader.
