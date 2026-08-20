---
layer: application
type: application
subject: delivery-analytics
technique: review-coverage-rate
stack: node
status: forged
---

# Review coverage, enforced and observed (node)

The same assessment product computes two independent review-coverage numbers
and keeps them apart, because they answer different questions and fail
differently.

## Enforced: the setting that actually gates the merge

`src/lib/db/org-signals.ts:231-234` derives `requireReviewRate` across an
organization's repositories. The predicate is `g.requiredApprovals >= 1`, and
the comment records the bug it replaced:

> "Require review" must mean an APPROVAL is required
> (`required_approving_review_count >= 1`), not merely that a PR is required to
> merge — a PR-required branch with 0 required approvals lets the author
> self-merge unreviewed. Counting `requiresPullRequest` overstated
> approval-enforced coverage.

This is the technique's central enforcement trap, found in production. The
neighbouring rates in the same return — `protectedRate`, `requireChecksRate`,
`signedRate` — each read their own specific setting rather than a bundled
"protected" boolean, for the same reason.

The unreadable case is handled separately rather than defaulted:
`src/lib/db/org-delivery-trend.ts:107-109` documents `protectedRate` as "Null
when no scan that day could read governance (never a measured 0 — 'couldn't
read' != 'unprotected')."

## Observed: the reviewed share of human-authored merges

`src/lib/analyze/pulls.ts:296-306` computes `reviewedRate` as
`reviewedHumanMerged / mergedHuman`, and the denominator choice is deliberate:
the population is *human-authored merged* proposals, so an all-agent fleet does
not read as a review-discipline failure. The comment states the consequence
directly — "review discipline was never measurable — null, NOT a fabricated
'0% reviewed' that would drag D6 and feed the LLM auditor a stated falsehood."

The governance split for tool-touched work is a second rate over its own
denominator: `aiGovernedRate` (`pulls.ts:320`) is `aiApprovedCount /
aiInvolved`, asking whether tool-touched proposals were reviewed at all.
`applyPrSignals` (`pulls.ts:463-470`) blends it into D8 bidirectionally —
governed lifts, ungoverned drags — which is the correct polarity for a rigor
dimension and the opposite of the additive-only treatment adoption signals get.

## Off-platform review suppresses the observed rate

`src/lib/analyze/index.ts:527-540` implements `offPlatformReview(commits)`:
positive evidence, read from commit trailers, that review happens somewhere the
host's review API cannot see — a `Reviewed-on:` URL pointing at an external
review system, a `Change-Id:` trailer, or merge-queue markers. The comment
names the failure it prevents: crediting off-platform review "stops the '0%
reviewed / nothing stops a merge' narrative firing on projects whose review
gate is stricter than any host-native setup."

The response is suppression, not adjustment. `applyPrSignals`
(`pulls.ts:381-386`) sets `reviewedRate = null` when `offPlatformReview` fired,
and the composite renormalizes over the terms that remain
(`pulls.ts:388-396`): with review present the weights are `0.5 * reviewedRate +
0.3 * smallPrRate + 0.2 * stability`; with it absent they become `0.6 *
smallPrRate + 0.4 * stability`. The off-platform evidence is separately
credited as a positive signal in the D6 detector — additive credit where the
evidence is per-repository, suppression of the metric it invalidates.

The suppression is also *labelled at the render surface* rather than silently
dropped: `pulls.ts:406-412` emits either "PR review coverage n/a (review runs
off-platform, credited in D6)" or "PR review coverage n/a (fewer than 5
human-merged PRs in window)". Two different reasons for the same null, and the
reader is told which.

## Deviations

- Self-approval is excluded structurally only to the extent the host's review
  model prevents it; the analyzer does not compute or report a self-approval
  count. The standard asks for it explicitly, because a nonzero self-approval
  count is a more actionable finding than the coverage percentage that hides
  it.
- Time-to-first-review is collected (`medianHoursToFirstReview`,
  `pulls.ts:311`) but the rubber-stamp share — approvals arriving within
  seconds of the proposal opening — is not derived from it. The standard keeps
  that surfaced separately; the data to do so is already in the fetched nodes.
