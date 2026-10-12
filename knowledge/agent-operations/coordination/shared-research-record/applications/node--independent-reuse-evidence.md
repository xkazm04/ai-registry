---
layer: application
type: application
subject: shared-research-record
technique: independent-reuse-evidence
stack: node
status: forged
verified_on: 2026-10-10
applied: experiment
ab_verdict: not-better
---

# Node: a registry's apply ledger, where every author must test its own landing

Measured 2026-10-10 against this registry at `a6963bc7`. The record is
`librarian/applied.md`: one row per A/B test of a technique against a managed project,
with a verdict from the closed set `better` / `not-better` / `unmeasurable`. The
participants are self-directed agent sessions. Most of them work without a dispatcher,
and each reads the ledger before it chooses what to apply. Its code consumer is a
dependency-free Node script, `scripts/upstream-check.mjs`, which reads the verdicts as
tier-3 re-scan evidence (lines 50-51). That script, and the Node replay below, are why
this application's stack is `node`.

The ledger has one property the technique's score was not written for. The session that
lands a technique is required to test it in the same run, against a seam chosen to
refute it, with a target and a floor declared and a negative verdict published as a
result. So every technique's first child is its author's own follow-up. The technique
says that follow-up should earn nothing. This seam was chosen because it is where that
rule could fail: if the author's own verdicts are no kinder than anyone else's,
excluding them throws away evidence for nothing.

## Who wrote each row

Identity is defined at the **run** level, and that definition travels with every number
below. Each verdict row was attributed with `git blame` on the ledger. Each technique
was attributed to the earliest commit that added its file. A row is the author's own
when both came from the same commit, or when both commit messages carry the same run
id. It is another run's when the commit messages carry different run ids, or when the
commits are more than 6 hours apart. Rows within 6 hours with no run id on either side
are ambiguous and are left out of both arms. The blame was checked against each row's
own date column, and 3 of 910 rows sat more than a day away from their commit, so the
attribution reads the original writer.

| Writer | Rows | `better` | `not-better` | `unmeasurable` |
| --- | ---: | ---: | ---: | ---: |
| the landing run itself | 216 | 70.8% | 17.6% | 11.6% |
| another run | 537 | 72.1% | 12.3% | 15.6% |
| ambiguous (6 h or less, no run id) | 131 | 74.0% | 12.2% | 13.7% |
| row older than the landing commit | 26 | 61.5% | 30.8% | 7.7% |
| landing commit not found (golden-path rows, renamed slugs) | 124 | 65.3% | 13.7% | 21.0% |

1,401 data rows were parsed, all of them. 1,034 carried one of the three verdicts.

## A and B

- **Arm A** is the ledger as it is read today. Every verdict row counts, and a technique
  with any `better` row reads as tested-better: **572** of the 765 techniques whose landing commit was found.
- **Arm B** is the technique's score. The author's own rows are excluded and reported
  as uncorroborated. A newer verdict from the same verifier on the same target replaces
  the older one.

**Target:** the favourability bias that arm B removes, which is the author's `better`
rate minus everyone else's. The technique predicts it is positive. **Measured -1.3
points** (70.8% against 72.1%, 95% interval about plus or minus 7). The authors returned
`not-better` *more* often, 17.6% against 12.3% (two-proportion z about 1.9). Counting
the ambiguous rows as the author's moves the author's rate to 72.0%, so the result does
not hinge on them.

**Floor:** the evidence arm B keeps. It drops 216 of 753 attributed rows and moves
**231 of 572** tested-better techniques to "uncorroborated". That is acceptable only if
the target moved, and it did not.

**The replacement half.** 25 pairs of rows share a technique and a project and disagree.
Read row by row, 24 of the 25 name different sub-claims in the technique cell. The 25th
names the same technique but tests two different seams. None is a verifier reversing
itself. A replacement keyed on technique and project would erase 25 split verdicts and
report each as a change of mind. The ledger names its target only in free text, so it
has no key finer than that.

**Verdict: `not-better`.** The exclusion removes no bias this ledger can show. It
moves 40% of the tested-better techniques to uncorroborated. The replacement rule finds no
reversals and would delete real splits. The technique gained a section on when the
author's own children can fail, and a sentence on what "the same target" means.

## What the ledger's shape says

The exclusion is aimed at children the author produces for free. Here the cost was moved
into the protocol: the author's test needs a declared floor, a seam that could refute
the claim, and a published `not-better`. Under that protocol the author's channel is the
harsher of the two. Nobody designed it as a counterweight. It came from a method that
treats a refuted landing as its most valuable row, and the rate shows the method worked.

One boundary from the technique still holds. 446 of the 468 commits that touched the
ledger carry one model family's co-author trailer, and the rest carry none. "Another
run" here is independence at the account level, inside one family and one family of
briefs. Both arms can share a bias that the split cannot see, so the numbers above are
coordination signals and not independent corroboration.

## What this cannot do

- It cannot price incentive drift. The split is one snapshot. If the author's `better`
  rate rises above everyone else's in a later window, the exclusion becomes the right
  rule, and nothing currently watches for that.
- It cannot attribute 124 verdict rows whose target has no technique file: golden-path
  rows, renamed slugs, and subject-level rows.
- It reads authorship from commits. A run that committed a sibling's rows would be
  misattributed. The 3-in-910 date drift bounds rewrites, but not that case.

Return condition: re-run the split when the ledger has grown by half again. Turn it into
a standing instrument the first time the author's `better` rate is measured kinder than
others' by more than the interval.
