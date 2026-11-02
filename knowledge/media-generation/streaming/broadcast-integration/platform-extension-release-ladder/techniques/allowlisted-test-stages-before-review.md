---
layer: technique
type: technique
subject: platform-extension-release-ladder
technique: allowlisted-test-stages-before-review
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [deciding when an extension version is ready to submit for platform review, setting up the test-account allowlist, choosing a release date after approval]
---

# Allowlisted test stages before review

A version climbs every rung it can climb on accounts the team owns before it is put in
front of a reviewer, and each rung has a written list of what it must prove. The
allowlist of test accounts is the only staged exposure the platform offers, so it is
used deliberately and kept small. Approval is not release: release is a separate, dated
decision by the owner.

## Why

Review is slow, resubmission resets the queue, and rejection can revoke the extension's
identity. Every defect a reviewer finds therefore costs weeks, and some cost everything.
The rungs below review are free by comparison, and they see the same platform: the
hosted test rung serves the very bundle the reviewer will receive from the platform's
own network. A version that reaches review untested on that rung is a version whose
first real run is the reviewer's.

## The rungs and their acceptance lists

**Local test** — assets from the team's development host, visible only to allowlisted
accounts. Must prove: the shell renders with the default design and with a set of
documents (valid, invalid, missing); the backend handshake and viewer token validation
work; configuration can be written and read back; every view the extension declares —
panel, video component, mobile — renders at its declared sizes.

**Hosted test** — the uploaded bundle served from the platform. Must prove everything on
the local list again, from the bundle, plus: no asset is missing; no request goes to an
undeclared host; no runtime path the reviewer would object to exists in the shipped
files. This rung catches what the development host hid.

**Load rung** — the team's own, beside hosted test. Simulated viewers at the target
audience size on the broadcast path and the backend, with recorded figures. A capacity
nobody measured is reported as unmeasured, not as fine.

**Review readiness** — a review channel that will be live while review runs, with the
extension installed, configured and usable without error; review notes that tell the
reviewer how to exercise every feature, including the ones switched off by default and
how to switch them on; and the list of declared hosts with a reason for each.

**Approved, unreleased** — the version waits. Release is chosen for the streamer's
schedule, with the backend ready for both the old and new version, because release
upgrades every install at once and there is no rollback but another review.

## Before the first rung: confirm the premise

When the whole extension rests on a reading of platform policy the platform has not
confirmed — that a data-driven shell is acceptable, that per-streamer branding in the
document is allowed — the cheapest rung is a question to the platform, asked before the
build. Where that is not possible, the first submission is a minimal shell that exercises
the premise and nothing else, so a rejection costs the least the identity can cost. Do
not let a premise be first tested by the full product's review.

## Procedure

1. **Keep the allowlist to owned accounts.** The team's own test channel and viewer
   accounts, and a named operator or two. Every account on it sees an unreviewed
   version; a partner streamer on it is receiving an unreviewed release.
2. **Write the acceptance list per rung before building the version.** Tick it with
   evidence — a screenshot, a log line, a load figure — not a recollection.
3. **Promote only on a complete list.** A rung with an unticked item stays where it is.
4. **Submit only what passed.** The submitted version is byte-identical to the one that
   passed hosted test. A last-minute fix re-enters at local test.
5. **Treat requested changes as a defect in the lower rungs.** When review returns
   changes, add the missed check to the rung that should have caught it.
6. **Make submission and release owner acts.** Submitting for review and releasing are
   both decisions by the extension's owner, written down, never a step a build pipeline
   or a contributor performs on reaching the end of a checklist. Until the owner approves
   submission, the version reaches only the allowlist, however finished it looks.
7. **Show the next rungs as requirements, not as buttons.** In any tool that tracks the
   ladder, the current rung is a state and the higher rungs are lists of what they need;
   none of them is a control that promotes. Record who released, when and why then. If the
   backend needs a migration for the new version, it is done and verified before the
   release step.

## Decision rules

- **When a deadline tempts a submission without hosted test**, the deadline moves; a
  rejection costs more than the slip.
- **When a feature is not ready at submission**, ship it switched off in the design
  document and say so in the review notes, with how to turn it on.
- **When a partner wants early access**, they get it after release, or the team accepts
  that putting them on the allowlist is an unreviewed release to their audience.

## When not to use it

A team shipping a trivial panel can compress local and hosted test into one pass. It
cannot skip hosted test, because that is the only rung that runs the real bundle on the
real platform before a reviewer does.
