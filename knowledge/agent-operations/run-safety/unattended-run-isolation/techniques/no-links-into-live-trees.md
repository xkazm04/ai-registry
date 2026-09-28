---
layer: technique
type: technique
subject: unattended-run-isolation
technique: no-links-into-live-trees
status: draft
laws: [the-harness-is-a-suspect-in-every-red, measure-the-tree-not-the-summary]
shared_with: []
use_when: [tempted to share dependencies or build output with a real project, auditing what a run environment points at, investigating results that depend on what a human did outside the bench]
---

# No links into live trees

The concern: dependency installation and compilation are the slowest parts of preparing a
run environment, and the obvious economy is to point the run at the real project's existing
directories. That link is not a cache — it is **write access to a directory a person is
using**, granted to an unattended process, through a path nothing at runtime displays.

## Why it fails in both directions

- **Outward.** Any tool the run invokes may rewrite what the link points at: a dependency
  installer reinstalling from a different lockfile, a build writing generated artefacts, a
  cleanup removing a cache. The run's task never mentioned the real project, and the damage
  is silent because the run believes it is working locally.
- **Inward.** Shared state makes results depend on what else happened: another run's build,
  a developer's dev server, an editor's index. A verification that reads through a link is
  no longer verifying only this run — and the resulting failures look exactly like model
  defects.

## The rule and its permitted exception

**Default: no links.** Install per run, or supply a copy. The cost is disk and minutes;
both are cheaper than one incident.

The narrow exception is a download cache whose every entry is checked against a recorded
integrity hash when it is read. Even then it must be per-purpose, so a writer of one kind
of artefact cannot poison another kind. Three conditions decide whether a package manager's
cache qualifies:
- **"Read-only" is enforced by a mount, not assumed.** Package managers write to their
  caches during ordinary installs, and some put their own logs there by default.
- **A cache that stores what it built is build output.** One common installer keeps wheels
  it built from source in the same cache as downloads, and reuses them for the same
  version. Sharing that cache shares executed artefacts.
- **A store linked into each project is a link into a live tree.** A content store that
  hard-links files into every project's dependency directory makes an edit in one project
  an edit in the store, and so in every other project.

An intact cache can still carry forward a package that was malicious when it was fetched.
Read-only protects the cache, not the trustworthiness of what it holds.

If a link is nonetheless used because the cost is prohibitive, then: the linked directory
is excluded from every verification input; no task that may run install, build or cleanup
commands gets the link; and the fleet audits periodically that the real directory is
unchanged. Those conditions are hard to hold, which is the point — most fleets should
simply pay the install cost.

## Auditing

- **Enumerate what each environment points at** before a queue starts, not after an
  incident: every link, its target, and whether the target is live.
- **Check the targets afterwards** for modification times inside the run window. This is how
  a silent rewrite is discovered while it is still one incident.
- **On discovery, remove the link, never the target**, and record what was reached, what
  changed, whether it is recoverable and what now prevents recurrence.

## Decision rules

- **A shared build-output directory is never acceptable**, linked or not, because its
  artefacts are executed during verification.
- **Removing a link mid-flight is safe; removing its target is not, and a recursive delete
  can do the second while meaning the first.** Some recursive deletes follow a directory
  junction or a trailing-slash symlink into its target. Remove the link object itself,
  then confirm the target is intact before deleting the environment around it. Runs that
  lose a link simply rebuild locally.
- **Treat "it has been fine so far" as unmeasured, not as evidence.** The link is harmless
  until the first task that installs or builds — and a fleet adds those tasks routinely.
