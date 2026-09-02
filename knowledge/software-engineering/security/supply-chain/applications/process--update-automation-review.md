---
layer: application
type: application
subject: supply-chain
technique: update-automation-review
stack: process
verified_on: 2026-09-02
applied: experiment
ab_verdict: unmeasurable
proof: before-after
---

# Five weeks of bot proposals, and what a three-day floor would have skipped

Four connected repositories run the same update bot on a weekly Monday
cadence, each with grouped patch-and-minor proposals and majors kept
separate. None sets a minimum release age. One deliberately declares no
ignore rules at all, in a header explaining that on this bot an ignore
also silences security proposals — the tree had already read the
mitigation the technique tells the reader to read. Another carries one
ignore that expires on an event: a storage engine major that is really a
data migration, to be lifted in the same change that performs it. That is
the event-expiry shape the technique now names, found in a tree before the
source that prompted it was read.

## The experiment

The technique's churn claim is that a release-age floor skips proposals a
successor will supersede within days. The instrument is the bot's own
proposal history: every proposal it opened across the four repositories,
with its package, creation time and fate, and for each closed-unmerged
proposal whether a later proposal for the same package followed and how
soon.

Calibration first, against cases whose answer was known: a proposal that
was merged must not count as superseded (it did not), and a package with a
single proposal must produce no pair (it did not). Then the run.

| | count |
| --- | --- |
| proposals opened | 67 |
| closed unmerged and followed by a proposal for the same package | 8 |
| of those, followed within three days | 4 |
| of those four, a *release* replaced by its successor | 1 |

The calibration changed the count. Three of the four fast supersessions
were grouped proposals the bot closed and re-opened because the group's
membership changed — a release-age floor does not touch that mechanism at
all. The one real case is a library whose major landed and whose first
minor followed forty hours later; a three-day floor would have proposed the
minor once and the major never.

## The verdict

**Unmeasurable** for the claim the floor is actually justified by. The
churn saving is measured — one proposal in sixty-seven — and it is not the
reason to adopt the floor. The supply-chain reason is that a poisoned
release is withdrawn within days, and this fleet's history contains no
such release, so the arms cannot separate on it. The instrument that would
make it measurable is an advisory feed joined to release timestamps: for
every withdrawn-or-flagged version the fleet ever pulled, the age of that
version at the moment the proposal was opened. Until such a case exists in
the fleet's own history, the floor is adopted on the ecosystem's evidence,
not this tree's, and the application says so.

The technique carries the measured number so the next reader does not
adopt the floor for the churn and then wonder where the saving went.
