---
layer: technique
type: technique
subject: release-pipeline
technique: skippable-release
status: forged
laws: [identity-survives-reuse]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [a change feels like it must make this release, release day arriving with work still landing, deciding whether to cut a release this week at all, a burst of merges on the day of a version bump, a release candidate abandoned after its number was stamped, choosing what to give up when the date and the change collide, an unreleased section that has grown for months]
---

# Make the release cheap enough to skip

The rest of this subject makes a release *correct*. None of it decides whether
there is one. That decision is a stage too, and when nobody owns it, the date
owns it: a release scheduled for Friday pulls every change that "has to be in
it" toward Friday, and the pressure has to land somewhere. It lands on the two
things that are hardest to see bending - the review of the change that was
rushed to make the cut, and the verification of the release that was cut under
deadline ([release-verification](./release-verification.md) names that second
one: the check skipped "just this once").

**Put the valve on the release, not on the change and not on the check.** When
a change and a date collide, the change lands at its natural pace and the
release is skipped. A skipped release costs nothing if the pipeline was built
for it, and it is cheap to build for:

- **The decision is explicit and separate from merging.** Merging never implies
  releasing; a release is armed by a person or an armed automation
  ([pipeline-staging](./pipeline-staging.md), publishing is armed), and the
  question "do we release this week?" has *no* as a normal answer.
- **The description already exists.** Entries accumulate under the unreleased
  heading as changes merge ([changelog-generation](./changelog-generation.md)),
  so a skipped release loses no notes and the next one inherits them whole.
- **Version numbers are monotonic, with gaps.** A number stamped for a
  candidate that was then abandoned is burned: never reused for different
  bytes, never filled in later. Readers may find no release between two
  numbers; that is allowed. What is not allowed is one number naming two
  artifacts, or a number lower than one already published (the machines that
  compare versions, [version-single-truth](./version-single-truth.md)).

## The tell that the valve is in the wrong place

Look at the merge history around a version bump. A burst of merges on the bump
day, larger than the weeks around it, followed the next day by a wave of fixes
to the same files, is a release that pulled its changes rather than collecting
them. That shape says the date was the authority. The repair is not a stricter
freeze; a freeze only moves the burst to the day before it. The repair is that
missing the date stops costing anything.

## Skipping has a ceiling

A release that is always skippable can be skipped forever, and then every fix
already merged is a fix no user has. Two conditions end a skip, and they
should be written down before anyone needs them:

- **A merged fix users are exposed to without it** - a security fix, a
  data-loss fix, a crash on a common path - forces a release. "Skip the
  release" applies to the change that is not ready, never to the fix that is.
- **The unreleased ledger has an age.** Measure how long the oldest
  unreleased entry has waited. When that age passes the project's own bound,
  the next release is owed, and it is cut from whatever is ready. A ledger
  that has grown for months is a release that has become expensive again, the
  very thing the skip was meant to avoid.

The skip is a valve on timing, not a substitute for releasing.
