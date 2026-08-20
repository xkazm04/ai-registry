---
layer: technique
type: technique
subject: delivery-analytics
technique: review-coverage-rate
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [defining what counts as a reviewed change, reading a branch protection setting as evidence of review, comparing review discipline across repositories]
---

# Review coverage rate

Review coverage is the share of merged changes that a **different party
approved before the merge**. Every word in that sentence is doing work, and
each one is a place where implementations quietly diverge:

- *merged* — proposals abandoned or still open are not in the denominator; they
  never reached production and their review state is not evidence about
  delivery discipline.
- *a different party* — the approver is not the author, and not a co-author of
  the change.
- *approved* — an approving decision was recorded. Comments are not approval.
  A requested review that never returned is not approval.
- *before the merge* — post-merge approval is a different practice with
  different risk; count it separately or exclude it, but do not launder it into
  the same numerator.

State the definition beside the number, every time. Two teams reporting "review
coverage" under two of the definitions above are not disagreeing about their
processes; they are reporting different metrics with the same label
([count-carries-predicate](../../_laws.md#count-carries-predicate)).

## Enforced coverage and observed coverage are two metrics

**Observed** coverage counts what actually happened: approving reviews on
merged changes. **Enforced** coverage asks whether the platform *would have
prevented* an unreviewed merge — a branch rule, a protected reference, a
required-approvals setting.

They answer different questions and they fail differently. Observed coverage
can be high on a repository with no protection at all, because the team is
disciplined — and that discipline evaporates the week it gets busy. Enforced
coverage can be high on a repository where every approval is a rubber stamp.
A serious report shows both.

Enforcement is also where the most common false claim in this whole subject
lives. Hosts expose several similar-sounding settings, and only one of them
means what an assessor wants:

- "direct pushes are blocked" — changes must arrive through a proposal. It says
  nothing about review.
- "a review must be requested" / "a change-request object is required to merge"
  — a proposal object must exist. Still nothing about approval.
- "N approving reviews are required" — the actual claim.

Reading either of the first two as the third produces a policy finding that is
false in the reassuring direction. **"Require review" must mean an approving
review is required, not merely that a change proposal is required to merge.**
This is [gate-sees-target](../../_laws.md#gate-sees-target) in assessment form:
the check must read the setting that actually gates the merge, not a
neighbouring setting whose name resembles it.

## Procedure

1. **Fix the population.** Merged changes to the branches that reach
   production, within a stated window. Name the exclusions: automated
   dependency bumps, release-tag commits, and merges produced by the host's own
   automation are usually excluded — and the exclusion, not just its result, is
   part of the published definition.
2. **Resolve the approver set per change**, dropping the author and any
   recorded co-authors. A change whose only approval came from an author
   identity contributes to the denominator and not the numerator.
3. **Compute the rate with its sample size attached**, never as a bare
   percentage. See the denominators technique for the floor below which the
   rate is not published at all.
4. **Read enforcement from the specific approving-review requirement**, and
   record when the setting could not be read — unreadable is not unenforced.
5. **Check for off-platform review before publishing a low rate.** A team that
   signs off in trailers or in a room produces a low observed rate for a reason
   that has nothing to do with discipline; the detection and suppression rules
   are the off-platform technique's job.

## Decision rules

- **When approval arrived within seconds of the proposal opening, keep it in
  the numerator but surface the share separately.** Fast approval is not proof
  of a rubber stamp — a one-line revert deserves a fast approval — but a team
  whose median time-to-approval is under a minute is telling you something the
  coverage rate alone hides.
- **When a change was merged by its own author after someone else approved,
  that is still covered.** The metric is about scrutiny, not about who clicked
  merge.
- **When self-approval is possible on the platform, exclude it explicitly and
  report how often it occurred.** A nonzero self-approval count is a finding in
  its own right, and a more actionable one than a coverage percentage.
- **When comparing repositories, compare like exclusions.** One repository that
  excludes bot dependency bumps and one that does not will differ by tens of
  points on process alone.
- **When enforcement and observation disagree sharply, report the gap, not an
  average of the two.** High observed with zero enforced is a fragility
  finding; high enforced with low observed usually means the population is
  wrong (a branch nobody protects is in the denominator).

## When not to use this

Do not use review coverage as a quality metric. It measures whether a second
party approved, and approval quality is not observable from the artifact
stream at all. A repository at 100% coverage where every review is a
same-minute approval from the same person is worse off than one at 80% with
substantive discussion, and no coverage rate can distinguish them.

Do not use it on a repository with a trunk-based, pair-programmed, or
continuously-reviewed workflow without first establishing that the workflow's
review evidence lands in the artifact stream. In those workflows the metric
frequently measures the absence of an artifact rather than the absence of a
practice.

Do not slice it per author. Coverage is a property of a change and of the
process around it; attributing an unreviewed merge to the person who made it
converts a process finding into a personal one, which is the boundary this
subject hands to the people-analytics-ethics subject.
