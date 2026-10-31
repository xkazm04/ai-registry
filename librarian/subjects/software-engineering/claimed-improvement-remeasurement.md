---
subject: claimed-improvement-remeasurement
domain: software-engineering
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# claimed-improvement-remeasurement

Forged in the harvest of an agentic DevSecOps control plane (`f1fdb04e6`): a golden
path, five techniques and two node applications against one public tree.

## Architecture review - 2026-10-31

First review, against `a5a09a30c`. All eight documents read in full. The pinned public
tree behind both applications was cloned at `009c7893` and every cited file and line
re-read; each quote matches. The change-point source (Daly et al., MongoDB) supports
the threshold-false-positive motive and the range-then-run-the-missing-commits
resolution. Three internal problems surfaced. The golden path says the noise exit fires
when spread would "swallow the claimed effect", which would let the claim set a
parameter, against the subject's own first technique; the technique and the code compare
spread with a multiple of the tolerance. The golden path's list of inconclusive reasons
omits the comparability exit the technique carries. The rank-test aside says three
samples a side "cannot reach conventional significance at all", which is true two-sided
(minimum p = 2/20 = 0.10) but not one-sided (1/20 = 0.05).

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/claimed-improvement-remeasurement",
  "date": "2026-10-31",
  "baseline": "a5a09a30c",
  "digest": "sha256-b2:7564db62e641d359",
  "disposition": "clarify",
  "coverage": "All 8 documents read in full. Both applications' citations re-checked line by line in a clone of the public tree at 009c7893, including a tree-wide search for agentValue and expectedPct. One primary source on change-point detection read, plus the git merge-base documentation. Not evaluated: running the afterlife judge or its tests, the trust-policy file, whether a variant pins a runner class.",
  "trigger": "Pending: never reviewed since forging.",
  "intended_benefit": "A claimed gain is credited only from the judge's own raw samples, split by ancestry, with an honest third verdict.",
  "failure_if_ignored": "Claims set their own tolerance, window or direction; slow runs vanish from the series and medians drift fast; time-split samples credit a neighbour's commit.",
  "boundary": "Adjudicating a claimed delta between two code states. What one number may say belongs to measurement-honesty; refusing a merge belongs to metric-gates; whether 'done' is true belongs to completion-claim-verification.",
  "counterexamples": [
    "A noise exit sized against the claimed effect lets a larger claim widen the band it is judged by; only a band from the tolerance or the samples keeps the claim out.",
    "A one-sided exact rank test over three samples a side reaches p = 0.05 when every head value beats every base value; only the two-sided test is capped at 0.10.",
    "On a strictly linear integration branch with no side branches, a time split and an ancestry split give the same sets.",
    "A queue-wait or runner-provisioning metric moves with the fleet, not the commit, so ancestry is the wrong axis for it."
  ],
  "sources": [
    {
      "url": "https://ar5iv.labs.arxiv.org/html/2003.00584",
      "result": "Daly et al., change point detection in software performance testing (MongoDB). 'Using a static threshold (e.g., 10%) led to a lot of alerts for changes on noisy tests'; the system is 'built upon the E-Divisive means algorithm'; 'we can identify the range of commits between the change point and the previous test result as suspect commits' and 'we need to run the tests on the missing commits to determine the precise commit'. Supports the change-point paragraph; the paper does not discuss branches, so linearising by first parent is the technique's own adaptation."
    },
    {
      "url": "https://arxiv.org/abs/2301.03034",
      "result": "Hunter (DataStax) builds on the same E-Divisive means implementation, which supports calling the divisive method a common choice."
    },
    {
      "url": "https://git-scm.com/docs/git-merge-base",
      "result": "--is-ancestor: 'exit with status 0 if true, or with status 1 if not. Errors are signaled by a non-zero status that is not 1.' Supports the three-answer ancestry query."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Cloned and re-read: judge.ts 1-7, 12, 30, 40-43, 58-69; passive.ts 1-5, 25, 38, 51, 63-65, 71, 75, 90-91; queued.ts 1-5, 35-36, 46, 49-50; collect.ts 1-3, 16, 19, 26-29; claim.ts 3, 79, 81, 86; samples.ts 16; benchDelta.ts 8, 22-23, 74, 101, 111; intents.ts 31. All match. agentValue and expectedPct are read only by the parser, the schema, two display components and fixtures."
    },
    {
      "source": "Exact Mann-Whitney arithmetic, n = 3 per side",
      "result": "C(6,3) = 20 orderings; the most extreme gives one-sided p = 1/20 = 0.05 and two-sided p = 2/20 = 0.10."
    }
  ],
  "documents": {
    "claimed-improvement-remeasurement.md": {
      "disposition": "clarify",
      "reason": "(1) 'the spread of the samples is wide enough to swallow the claimed effect' and the summary bullet 'noise wider than the effect' size the noise exit by the claim, which the subject forbids; the technique and the code compare spread with a multiple of the tolerance. (2) The inconclusive reasons omit 'not comparable' (different runner class), which the technique lists first. (3) 'against as many runs of the same target that preceded the batch' should say the same number of runs as the batch."
    },
    "techniques/claimant-figure-never-decides.md": {
      "disposition": "keep",
      "reason": "Two-channel split and the six leak points (tolerance, window, direction, metric, sample selection, base figure) are coherent and the application confirms the parser-only reach of the figure."
    },
    "techniques/three-way-verdict-over-raw-samples.md": {
      "disposition": "clarify",
      "reason": "'an exact rank test over three samples a side cannot reach conventional significance at all' holds two-sided (minimum p = 0.10) but a one-sided test reaches 0.05 exactly; say two-sided. The rest (success-only samples, waiting vs inconclusive, per-side floors, clamped tolerance, zero-base asymmetry) is sound."
    },
    "techniques/change-point-by-ancestry.md": {
      "disposition": "keep",
      "reason": "Ancestry sets, the three-answer query and the monotone binary search are correct; the Daly et al. paper supports the change-point motive and the range-then-measure-missing-commits resolution."
    },
    "techniques/queued-runs-as-head-sample.md": {
      "disposition": "keep",
      "reason": "Capped batch, commit pinning, record-before-effect, whole-batch wait and like-with-like base are consistent with the golden path and the application."
    },
    "techniques/watermark-halts-at-unfinished.md": {
      "disposition": "keep",
      "reason": "The two store shapes, the staleness ceiling with an abandoned state, and ordering by creation key are correct and match the application's append-only collector."
    },
    "applications/node--three-way-verdict-over-raw-samples.md": {
      "disposition": "keep",
      "reason": "Every citation re-read at 009c7893 and matches; the direction deviation is real (passive.ts:75). Whether the judge's variant rules pin a runner class was not checked. verified_on may move to 2026-10-31."
    },
    "applications/node--change-point-by-ancestry.md": {
      "disposition": "keep",
      "reason": "Every citation re-read at 009c7893 and matches; the three deviations (time fallback unrecorded, branch-queued runs unchecked, released stuck runs not marked abandoned) are confirmed by the code. verified_on may move to 2026-10-31."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the clarify items from the record above, against `d6e7ba79b`. The golden path now
sizes the noise exit by the tolerance, not the claimed effect, lists the comparability exit,
and says the base matches the batch in size. The rank-test aside now says two-sided. Both
applications had every citation re-read in the public tree at `009c7893`, so their
`verified_on` moved to 2026-10-31. Nothing remains owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/claimed-improvement-remeasurement",
  "date": "2026-10-31",
  "baseline": "d6e7ba79b",
  "digest": "sha256-b2:95b820a7fa343ac4",
  "disposition": "keep",
  "coverage": "All 8 documents decided. The two clarify documents were edited and the changed passages re-read; the two applications changed only in verified_on, after a line-by-line re-check of their citations in a clone of the public tree at 009c7893. The other four documents are byte-unchanged. Not evaluated: running the afterlife judge or its tests, the trust-policy file, whether a variant pins a runner class.",
  "trigger": "Clarify items from the first 2026-10-31 record.",
  "intended_benefit": "A claimed gain is credited only from the judge's own raw samples, split by ancestry, with an honest third verdict.",
  "failure_if_ignored": "Claims set their own tolerance, window or direction; slow runs vanish from the series and medians drift fast; time-split samples credit a neighbour's commit.",
  "boundary": "Adjudicating a claimed delta between two code states. What one number may say belongs to measurement-honesty; refusing a merge belongs to metric-gates; whether 'done' is true belongs to completion-claim-verification.",
  "counterexamples": [
    "A noise exit sized against the claimed effect lets a larger claim widen the band it is judged by; only a band from the tolerance or the samples keeps the claim out.",
    "A one-sided exact rank test over three samples a side reaches p = 0.05 when every head value beats every base value; only the two-sided test is capped at 0.10.",
    "On a strictly linear integration branch with no side branches, a time split and an ancestry split give the same sets.",
    "A queue-wait or runner-provisioning metric moves with the fleet, not the commit, so ancestry is the wrong axis for it."
  ],
  "sources": [
    {
      "url": "https://ar5iv.labs.arxiv.org/html/2003.00584",
      "result": "Daly et al. (MongoDB): static thresholds 'led to a lot of alerts for changes on noisy tests'; built on E-Divisive means; suspect commit range, then 'run the tests on the missing commits'. Supports change-point-by-ancestry unchanged."
    },
    {
      "url": "https://git-scm.com/docs/git-merge-base",
      "result": "--is-ancestor exits 0 if true, 1 if not, other non-zero on error. Supports the three-answer query."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Every cited file and line re-read in a clone; all match. Basis for moving both applications' verified_on to 2026-10-31."
    },
    {
      "source": "Exact Mann-Whitney arithmetic, n = 3 per side",
      "result": "C(6,3) = 20; one-sided minimum p = 0.05, two-sided 0.10. Basis for the rank-test edit."
    }
  ],
  "documents": {
    "claimed-improvement-remeasurement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'wide enough to swallow the claimed effect' -> 'wide enough to swallow any gain the tolerance would credit'; inconclusive reasons now include different runner classes, in the prose and the summary bullet ('noise wider than the effect' -> 'spread beyond a multiple of the tolerance'); 'as many runs ... that preceded the batch' -> 'the same number of runs ... that preceded the batch'."
    },
    "techniques/claimant-figure-never-decides.md": {
      "disposition": "keep",
      "reason": "Unchanged. Two-channel split and the six leak points are coherent; the application confirms the parser-only reach of the figure."
    },
    "techniques/three-way-verdict-over-raw-samples.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'an exact rank test over three samples a side cannot reach conventional significance at all' -> 'a two-sided exact rank test over three samples a side cannot get below p = 0.10'."
    },
    "techniques/change-point-by-ancestry.md": {
      "disposition": "keep",
      "reason": "Unchanged. Ancestry sets, the three-answer query and the monotone binary search are correct and the change-point source supports the rest."
    },
    "techniques/queued-runs-as-head-sample.md": {
      "disposition": "keep",
      "reason": "Unchanged and consistent with the golden path and the application."
    },
    "techniques/watermark-halts-at-unfinished.md": {
      "disposition": "keep",
      "reason": "Unchanged and consistent with the application's append-only collector."
    },
    "applications/node--three-way-verdict-over-raw-samples.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on 2026-10-27 -> 2026-10-31 after every citation was re-read at 009c7893. The direction deviation stands. Whether the variant rules pin a runner class was not checked."
    },
    "applications/node--change-point-by-ancestry.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verified_on 2026-10-27 -> 2026-10-31 after every citation was re-read at 009c7893. The three recorded deviations are confirmed by the code."
    }
  }
}
```
