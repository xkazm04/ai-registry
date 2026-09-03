---
layer: technique
type: technique
subject: ci-execution-trust
technique: measure-apply-split
status: forged
stage: team
laws: [failure-not-empty-success, one-validation-door]
shared_with: []
use_when: [a check needs to comment or push back onto a proposed change, a job runs contributor code and also holds a write credential, adding a label or a commit to a verification job, deciding how a result crosses from an untrusted job to a trusted one]
---

# Untrusted measurement, trusted application

Two requirements collide in one very ordinary job. To **measure** a
proposed change — its size, its query count, its rendered output, its
formatting — you have to build and run its author's code. To **apply** the
result — comment it, label it, commit a regenerated artifact back — you
need a credential that can write. Put both in one job and the credential is
present in the process that is executing somebody else's code, which is the
plainest form of the arrangement this whole subject exists to prevent.

Nobody designs this deliberately. It arrives by increment: a verifying job
exists and is correctly credential-free, then someone adds a helpful
comment-back step, and the write scope is granted to the job that already
runs foreign code. The lane split described in
[untrusted-contribution-lanes](./untrusted-contribution-lanes.md) was
correct the day it was drawn and is now collapsed by a feature.

The discipline: **one job runs the untrusted code with no credential and
emits an artifact; a second, separate job with write scope consumes the
artifact and applies the result, and never executes anything from the
change.**

## The split

- **The producing job** is triggered by the proposal, holds a read-only
  token, and runs the build, the harness, the formatter — all of it foreign
  code. Its only output is an inert artifact: the measurement, the
  regenerated file, the diff, and whatever identifiers the second job needs
  to find its way back. It never comments, never labels, never pushes.
- **The applying job** is triggered by the *completion* of the first, holds
  the write scope, and does four things: download the artifact, verify it,
  copy inert bytes into place, and commit or comment. It runs no script
  from the change, no lifecycle hook from the change, no tool resolved out
  of the change's dependency tree. If it checks the tree out at all — to
  push onto the branch — it treats that checkout as data, not as a place
  to execute from.

The separation is structural for the same reason the lane split is: the
capability is in what the job was *issued*, not in a condition somewhere
that a change could edit.

## The handoff must be inert, and the applying job still trusts its contents

This is the residual risk, and it is the part most descriptions of this
pattern leave out. The applying job does not execute the change's code —
but it does act on the artifact, and the artifact was produced by a process
running that code. Anything the producing job could be induced to write
into the artifact, the applying job will faithfully apply with a write
credential.

So the artifact's *shape* is the trust boundary, and two rules hold it:

- **The producing job must not be able to write arbitrary paths into the
  artifact.** Collect a named, enumerated set of files, never a directory
  the build can add to. An artifact assembled as "whatever ended up in this
  folder" is a channel from foreign code to a privileged writer.
- **The applying job enumerates what it is allowed to place and commit**,
  and fails on anything else. It stages, then checks every staged path and
  status against an allowlist, then commits — the same control that makes
  an automated regeneration commit safe, and the reason that technique is
  this one's natural partner
  ([post-merge-regeneration](../../../build-and-release/codegen/techniques/post-merge-regeneration.md)).
  This is [one-validation-door](../../../../_laws.md#one-validation-door)
  for a branch: the privileged writer is one job, and it passes through one
  place that says what may be written.

Carry only inert types across the boundary — measurements, images, text,
diffs. Nothing the applying job will interpret: no scripts, no
configuration it will load, no dependency manifest it will install from.

## Bind the application to the revision that was measured

The two jobs are separated in time, and the branch can move between them.
Applying a result computed against one revision onto a different one is not
a hypothetical — it is the ordinary consequence of a contributor pushing
twice — and it produces the worst outcome available: a stale measurement
committed onto a newer tree, hiding the very regression the newer commit
introduced.

- **The producing job records the exact revision it measured**, and the
  applying job re-derives that revision from the trigger rather than
  trusting a value the artifact carries alone. Cross-check the two.
- **The write targets that revision**, and a non-fast-forward refusal is
  the *correct* outcome, not an error to work around. The branch moved; a
  fresh measurement is already queued behind the new commit.
- **The approval property from the lane split applies unchanged**: what was
  computed binds to a revision, never to a proposal or a person.

## Distinguish "nothing to apply" from "measurement failed"

The applying job's most likely wrong behaviour is to find no artifact and
conclude that everything is fine
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Three states arrive at it looking similar and must be told apart:

- The producing job succeeded and found nothing to apply. Nothing to do.
- The producing job failed — crashed, timed out, was cancelled. The
  applying job must not run at all, or must fail loudly; a silent skip
  converts an instrument failure into a clean result.
- The producing job succeeded but uploaded an empty or incomplete artifact.
  This is the one that needs an assertion at the producing end: an upload
  step that treats "no files matched" as an error rather than a shrug.

And where the application genuinely cannot be performed — the write is
refused because the contributor's branch does not accept it — that is a
failure the reviewer needs to see, with the manual recovery named in the
message. Silently not applying is the same defect one layer out.

## Boundary

[injected-code-scope-ladder](./injected-code-scope-ladder.md) orders
**where code may enter** a job — machine, repository, step — and pushes it
down until it stops working.
[untrusted-contribution-lanes](./untrusted-contribution-lanes.md) orders
**which lane a contribution runs in**, and what that lane is issued.

This technique orders **what a single job may hold at the same time**: the
conjunction of foreign code and a write credential. It is the constraint
the other two do not express, and it is the one that gets violated by
addition rather than by design — a correct ladder and a correct lane split
are both still satisfied by a verifying job that grew a comment step. When
a verification needs to write, the answer is never to widen the verifier's
scope; it is a second job.

## Decision rules

- A job that runs code from a proposed change holds no write credential.
  Where the result must be written, split the job.
- The handoff is an inert artifact of named files, never a directory the
  build can extend.
- The applying job executes nothing from the change, including hooks and
  tooling from a checkout it takes for pushing.
- The applying job allowlists every path and status it commits, and fails
  on anything else.
- Bind the application to the measured revision; a non-fast-forward refusal
  is the safe outcome.
- Treat a missing artifact, a failed producer, and an empty artifact as
  three different states, and let none of them read as success.
