---
layer: application
type: application
subject: decentralized-artifact-distribution
technique: publisher-declared-verification-floor
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
---

# A release signed after publication, installed by a script that never looks

Citations are against `github:xkazm04/lighttrack` at commit
`f7f07ee6e0e612cd9bb968eb846d8bf6c33b05ab`, a public repository. The version
witness is `rust-toolchain.toml` — `channel = "1.96.1"` — which pins the ruler
the workspace's gates run under. The shipped artifacts are native binaries and
the installers are shell and PowerShell, so the stack that decides the build is
Rust and the seam itself is language-independent.

This is the first realization of the technique in a tree that distributes to an
audience it does not control, and it is a **negative** one: the tree has the
signing apparatus and no floor, and the gap between the two is the technique's
whole argument.

## What the tree has

.github/workflows/release.yml:108 "signing is a property added to the artifacts, not a gate".
The signing job is separate from the build and runs after the release is
published, keyless, binding the OIDC identity of the workflow. That is the
credential half done well: no long-lived key exists to steal.

.github/workflows/release.yml:152 "verify:" asserts that every platform archive
exists on the release (the loop at line 170). It does not assert that any
signature bundle exists, and it declares `needs: build` — the same dependency as
`sign` — so it runs beside the signer, not after it.

deploy/install.sh:27 "releases/latest/download/lighttrack-${target}.tar.gz" and
the `curl | tar` at line 49 install whatever is there. Neither installer reads a
signature, a checksum or a policy.

## What the tree cannot say

A release whose signing job fails, or whose bundles are removed afterwards by
anyone holding release-write access, is indistinguishable at install time from a
release that was never going to be signed. The failure is a red run, which is a
fact about a CI invocation and not about the artifact; the artifact carries no
declaration that it was owed a signature. That is the technique's first claim,
**a downgrade is an absence, and an absence has no signal**, observed in a tree
nobody built to demonstrate it.

## The measurement

Of the six public releases (`v0.0.2` to `v0.0.7`), the asset lists carry **zero**
signature bundles and no SBOM; the signing job post-dates the last tag, so it has
never run in production. Adoption of the floor is 0 of 6, and the installer has
no means of telling "predates signing" from "had its signature removed".

## The experiment (arms and result)

Arm A is the installer as it stands: it takes any release. Arm B adds one
decision, made from the asset list and a floor constant that lives **in the
installer on the default branch**, a record transported separately from the
release assets: releases below the floor are `unattested-permitted` (installed,
labelled), releases at or above it need a bundle for the exact archive being
installed, and are `required-and-missing` (refused) without one. Nine asset
lists: the six real releases, a synthetic signed release, a synthetic stripped
release, and a synthetic release carrying another platform's bundle.

- **Target:** a stripped release at or above the floor. A installs it; B refuses
  it. A bundle for a different archive is refused too, so the check is bound to
  the artifact installed, not to "some bundle exists".
- **Floor:** the six real releases and the correctly signed release install
  exactly as before in both arms; 9 of 9 rows keep A's outcome except the two
  rows the technique says must change.

## Why this seam, and what it refuted

The seam was chosen because it could kill the finding. The technique says the
floor belongs above the release; the tree showed the floor **cannot be declared
yet**: with 0 of 6 releases signed, any floor at or below the latest tag breaks
every install, so the first declaration has to name a version that does not exist
(`0.0.8`). The technique's "when not to use it" case — a publisher population
that cannot yet satisfy the requirement — is therefore reached by a single
publisher with a single history. The honest form is a floor declared **ahead** of
the first signed release, which is what the experiment priced, and the technique
holds only in that forward-declared form. A floor can protect releases from the
declaration onward; it can never repair the past.

## What this realization cannot do

- It classifies; it does not verify. A present bundle is reported as present,
  not as valid, because the consumer may have no verifier installed. The third
  state, present-and-unverifiable, is not modelled and is the larger half of
  the consumer's build.
- The installer resolves `latest` by redirect, so it does not know the tag it is
  about to install. Deciding against a floor needs the tag, which is one more
  request and one more place to fail.
- A compromised default branch rewrites the floor. The declaration is separate
  from the release, not from the publisher; the technique's anchor is the
  publisher's key, and here it is the repository's write access.
- The PowerShell installer is a second door. A floor in one installer is a
  downgrade path through the other.
