---
layer: application
type: application
subject: signed-artifacts
technique: bypass-is-a-versioned-policy
stack: go
verified_on: 2026-09-04
verified_against: go@1.24.4
applied: code
ab_verdict: better
---

# The signature exemption as a tested production predicate (Go, appliance OTA)

An appliance updates itself over the air, in two components: an application
binary and the system image beneath it. Updates are GPG-signed with a detached
signature fetched beside the payload. And the project routinely has to install
unsigned builds — a developer's local build, a release candidate that has not
reached the signing ceremony, a specific version pushed to one unit for support.

## The predicate

The exemption is one function taking three values: the parsed version, whether
this install was explicitly requested as a custom artifact, and whether the
installing device has opted into prereleases. It lives in the shipping binary
beside the verifier, not in a test helper, and its behaviour is pinned by a
table-driven test whose rows are mostly refusals:

- a stable version, not custom → **does not** bypass;
- a stable version, custom → bypasses;
- a prerelease with the opt-in → bypasses;
- a prerelease **without** the opt-in → does not bypass;
- a version that does not parse → **does not** bypass.

The last two carry the design. Being a prerelease is a property of the artifact;
being willing to run prereleases is a property of the installation, and only the
conjunction exempts — otherwise anyone who can present a `-dev` version to a
stable device has defeated signing. And an unparseable version resolves to
*verify*, which is the non-obvious branch: the tempting shortcut is to treat a
weird version as a dev build, since dev builds have weird versions, and that
hands the bypass to any malformed string.

## The mandatory component is exempt from the exemption

The two components are not equally exemptible. The system image is verified
unconditionally — a request to install one with no signature URL fails with a
message naming the requirement, and the test asserts the HTTP client was called
**zero** times. The check runs before the fetch, which saves the transfer and,
more usefully, makes the ordering hard to undo in a later refactor: a test that
counts calls fails loudly when the check migrates behind the download.

A sibling case pins the other end — a signature URL that resolves and returns an
**empty body** with a 200 is an error, not an absent signature. There the client
*was* called once, and the assertion says so. The two tests together fix both the
"never fetched" and "fetched nothing" branches, which is the pair that a single
`if sig == nil` collapses.

## The exemption exists because the release lane needs it

The interesting coupling is that this policy is not a concession — it is load-bearing
for the project's own release gate. Releasing runs the update path on real hardware
before publishing, and one of those lanes upgrades *from the current published
stable release* to the locally built candidate. The candidate is unsigned at that
point, because signing happens later in the same target. Without a first-class
exemption, that lane could not exist; with an ad-hoc one, the lane would be
exercising a code path production does not have.

So the rehearsal and the exemption are one design, and the project treats them
that way: the release target runs both the permissive lanes and the lanes that
watch an unsigned prerelease get **rejected** on a device. A bypass tested only in
its permissive direction has been tested as a feature, not as a boundary.

## The preflight that makes the gate cheap to fail

Beside the policy, the same release target refuses to start unless its external
preconditions hold: the signing key is present in the local keyring (checked by
fingerprint, before anything is built), the artifact bucket is reachable, the
branch is the release branch, the tree is clean, and local matches upstream. Each
check is a few lines and each fails with the command that fixes it.

That ordering is worth copying independently of the signing story. The expensive
work — a cross-compiled build, a frontend build, a full hardware end-to-end
sweep — happens *after* the cheap checks, so the common failure (a key on the
other laptop) costs seconds instead of the whole lane. The signing step itself is
then interactive and retried up to three attempts, with the artifact removed
between tries so a partial signature cannot be mistaken for a real one.

## What this realization cannot do

The predicate governs *whether* to verify, not *whom* to trust. Key custody,
rotation, and what happens when the root fingerprint changes are elsewhere in the
tree and not covered by this table.

It also has no notion of a revoked artifact: an exemption granted by version and
opt-in is a static decision, so a prerelease that turns out to be harmful cannot
be un-exempted from the update feed's side — the only lever is the device's own
opt-in flag. For a fleet that ships prereleases broadly, that would need a second
mechanism, and this tree does not have one.
