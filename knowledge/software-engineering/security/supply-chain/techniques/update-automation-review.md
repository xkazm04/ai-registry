---
layer: technique
type: technique
subject: supply-chain
technique: update-automation-review
status: forged
laws: [gate-sees-target, failure-not-empty-success, absent-guard-is-loud]
shared_with: []
use_when: [deciding if green checks justify merging a dependency bump, one manifest bump dragging strangers into the lockfile, months of claimed automation with zero proposals, a framework patch release that mitigates by disabling a capability, judging an upgrade by the label on its release notes]
---

# Update automation review

Automated dependency-update proposals solve a real problem — unpatched
dependencies age into advisories, and no human tracks hundreds of
upstream release feeds — but they invert the normal review posture. The
diff *looks* like housekeeping: machine-generated, one line in a
manifest, a lockfile churn. The payload is **third-party code entering
the trust boundary**, proposed by a bot, often carrying more new code
than the median hand-written change. Update automation is valuable
precisely and only when paired with a review doctrine that resists the
housekeeping costume.

## Never blind-merge — and know why green is not enough

The reflex to resist is "the pipeline passed, merge it." Two independent
reasons the reflex is wrong:

- **Your tests cover your use.** The project's suite exercises the
  project's call sites against the dependency, not the dependency's
  changed behavior outside that coverage — a behavioral change in a code
  path the suite never enters ships silently with a green check
  ([gate-sees-target](../../../_laws.md#gate-sees-target): the gate reads
  your coverage, the risk lives in their diff).
- **A malicious release is engineered to pass.** Compromised-maintainer
  and hijacked-package incidents ship code that behaves normally under
  test and activates elsewhere. The pipeline is not a defense against an
  adversary who has read how pipelines work.

So green is the *floor*. The review itself, sized to the risk tier:

- **Read the changelog and release notes** for the jump actually
  proposed — every version in the range, not just the target. No
  changelog is itself a signal: an undocumented release from a
  previously well-documented package warrants a look at the source diff.
- **Read the lockfile diff for what else moved.** One manifest bump can
  drag a crowd of transitive updates; each is the same class of input.
  A lockfile diff that touches packages unrelated to the named update
  is a question to answer, not noise to scroll past.
- **Check release integrity signals** where the ecosystem provides
  them: does the published artifact correspond to a tag in the source
  repository, is the maintainer the historical one, did the package's
  install-time hooks change. Install hooks appearing in a package that
  never had them is a stop-everything signal.

## Tier the risk; spend review where it buys most

Uniform ceremony produces uniform neglect — a queue of identical-looking
update proposals teaches batch-approval. Tiering keeps attention where
it matters:

- **Lockfile-only refreshes and patch bumps** of pinned, policy-gated
  dependencies: lightest tier. Candidates for auto-merge *only* when the
  policy gates ([dependency-policy-gates](./dependency-policy-gates.md))
  sit in the merge path and the team has explicitly decided to trust the
  tier — an auto-merge decision is a policy diff, reviewed like one, not
  a convenience toggle.
- **Minor versions**: changelog read, lockfile-diff scan.
- **Majors, security-critical packages (crypto, auth, serialization,
  anything with install hooks), and anything touching the build
  pipeline itself**: full review; the build pipeline's own dependencies
  are the supply chain of the supply chain.

Group updates by ecosystem and cadence window rather than letting them
arrive as a continuous trickle: a scheduled weekly batch gets a sitting
of real attention; thirty proposals dripping in daily get thirty
reflexive approvals.

## When the dependency is the framework

Tiering by version number prices the *size* of a change; it says nothing about
the *reach* of the package being changed. A framework is not one input among
many — it owns the build, the request path, and the defaults every module
inherits without asking. When a framework moves, behavior changes in code
nobody edited, and the version number is a poor guide to how much: a patch
release can retire a capability that a major release would have deprecated
politely.

The sharpest instance is the **security patch that mitigates by removal**. When
a vulnerability lives in a transitive native library rather than in the
framework's own code, the repair available on the framework's timeline is often
not a repair at all but a shutdown — the affected capability is switched off in
the patched release and stays off until the upstream fix propagates. The
advisory reads as a fix; what ships is a subtraction, and it lands on exactly
those installations that had configured the capability *on*.

This is why "your tests cover your use" is not the whole story for a framework
bump. There is a third reason green is not enough, and it is structural:
**declaratively requested capabilities have no test surface.** A suite asserts
behavior it calls. A capability the application requests in configuration and
the framework delivers on its own — an image format, a caching mode, a bundler
default, a compression setting — is asserted by no call site, so nothing fails
when it disappears
([gate-sees-target](../../../_laws.md#gate-sees-target)). The config row is
still there, still valid, still parsed; it is simply no longer honored. That is
silent degradation to a default with the operator's intent still sitting in the
file
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).

Two habits close it, and both are cheap:

- **Read the mitigations, not just the fixes.** A fix says what was wrong; a
  mitigation says what the maintainer turned off to make it right. The
  mitigation is the line that lands on your configuration, and it is routinely
  a sentence in the advisory rather than an entry in the changelog.
- **Keep the declarative-capability inventory.** List what the application asks
  the framework for in configuration rather than in code. It is a short list —
  that is the point — and it is exactly the part of the surface the suite
  cannot see. Diff it against the release's mitigations on every framework
  bump; for everything the suite does reach, the suite is still the instrument.

And carry one correction back into the tiering above: **a release's label is not
its effect.** A release classified as security can carry a performance
regression for whoever used the disabled capability; a release classified as
performance can carry a behavior change. The vendor's headline describes the
maintainer's motivation, not the delta on your system. Classify the bump by
what it does to the surface you configured, and let the version number and the
label set the starting tier rather than the final one.

## The exposure window is the metric

The point of update automation is shrinking the time between *fix
available* and *fix deployed* — the exposure window. Measure it: age of
open update proposals, and time-to-merge for security-tagged ones. Two
failure modes show up immediately in that number:

- **The unmerged pile.** Automation opening proposals nobody merges is
  not hygiene, it is a backlog dressed as one — the window never closes,
  and each stale proposal grows merge conflicts that make it less
  mergeable weekly. A pile that only grows means the tiering or the
  cadence is mis-sized; fix the process, not the pile.
- **The lane that never ran.** The opposite failure is quieter and
  worse: automation *configured* but never actually enabled — a config
  file committed, an activation step skipped, and months of "dependency
  bumps come in via automation" written in docs describing a lane that
  has produced nothing. Configured-but-dead automation is worse than
  none, because it is cited as coverage while providing zero. Prove the
  lane alive at setup by watching its first-run artifact appear (most
  update bots emit one — a dashboard, an onboarding proposal), and
  treat a sustained zero-proposal stretch as a liveness question before
  a cleanliness claim
  ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
- **Version-range drift.** If manifests carry loose ranges, resolution
  time decides what ships, and the lockfile is the only truth — pin
  exactly, commit the lockfile, and let updates arrive as reviewed
  diffs rather than as whatever the next install resolves. An update
  that happens outside a diff is an update nobody reviewed.

The end state worth aiming at: every byte of third-party code that
enters the tree arrived as a visible diff, tied to a version, gated by
policy, and merged by a person (or by a rule a person reviewed) — with
a number on the wall showing how long fixes wait.
