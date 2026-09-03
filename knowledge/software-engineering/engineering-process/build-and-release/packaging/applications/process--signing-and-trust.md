---
layer: application
type: application
subject: packaging
technique: signing-and-trust
stack: process
status: forged
verified_on: 2026-09-03
---

# Gatekeeper's Sequoia tightening, and the unnotarized DMG wrapper

The tree is Voicebox at `51f49dea198384b4eb6087b72c17057c6eb1c1cd` — a
Tauri desktop shell around a PyInstaller-frozen Python backend, released as
signed installers by a GitHub Actions workflow. The version witness is the
tree's own declared release identity, `tauri/src-tauri/tauri.conf.json:4`
(`"version": "0.5.0"`), cross-checked against the bundler pinned in
`tauri/src-tauri/Cargo.lock:4273-4274` (`tauri 2.9.5`); the Rust toolchain
is not pinned (`.github/workflows/release.yml:135` uses
`dtolnay/rust-toolchain@stable`), so this document takes the application's
own version as its witness and declares no runtime version.

## The tightening: what macOS 15 enforces that macOS 14 tolerated

`docs/plans/MACOS_NOTARIZATION.md:25-29` records the platform-version
delta, discovered when `brew audit --cask --online --signing --new
voicebox` went red on macOS 15 (Sequoia) while staying green on macOS 14
and macOS 26, on both architectures. `spctl -t open` on 15 enforces three
things 14 did not:

1. **Secure timestamp required on hardened-runtime signatures.**
   Untimestamped signatures pass on 14 and fail on 15.
2. **Deep verification of nested Mach-O binaries.** An embedded `.dylib`
   or helper binary carrying an ad-hoc signature — or a signature under a
   different Team ID — now rejects the whole bundle; 14 often accepted it.
3. **Hardened runtime required on every nested executable**, not just the
   top-level app binary, and **entitlements declared on the outer app do
   not propagate** to the sidecars.

The third is the one with teeth here: the app declares
`externalBin` sidecars (`voicebox-server` in 0.4.x, plus `voicebox-mcp`
from 0.5.0), Tauri's bundler signs each with the configured identity but
applies neither `--options=runtime` nor `--timestamp` and does not merge
the outer app's entitlements into the sidecar signature. The outer
`Voicebox` binary is correctly signed with hardened runtime plus
`disable-library-validation`; the sidecars are not.

The plan document also records why nobody on the team saw it first
(`:31`): a local developer machine passes `spctl` because the first-party
developer context and cached notarization tickets mask exactly these
failures. A fresh Sequoia VM with no prior trust state does not — which is
the technique's *verify on the published bytes, in a context with no access
to the signing key* rule, restated as an incident.

## The wrapper direction: signed and attested inside, unattested outside

`.github/workflows/release.yml:232-237` states the defect in its own
comment: Tauri's bundler signs and notarizes the `.app`, and ships the
`.dmg` wrapper **unnotarized**. Gatekeeper rejects that on macOS 15 —
caught by Homebrew Cask CI, not by this pipeline — and on older Intel Macs
it produces "app isn't signed" dialogs whenever Apple's notarization
servers are slow (issue #509). The payload is fully covered; the container
the user actually downloads is not; `tauri-action` reports success and
uploads it.

The remediation is the post-bundle re-attestation step at `:238-270`, and
it carries every property the technique demands:

- **Enumerate every wrapper.** `:252-253` sets `shopt -s nullglob` and
  globs `"${DMG_DIR}"/*.dmg` into an array, then loops over all of them
  (`:258`) — not just the first.
- **Submit, staple, then verify with the platform's own checker on the
  bytes being published.** `:260-266`: `xcrun notarytool submit --wait
  --timeout 20m`, `xcrun stapler staple`, then
  `spctl -a -t open --context context:primary-signature -vv` — the same
  assessment policy Homebrew's audit runs, executed before publication
  rather than after.
- **Replace the asset the bundler already uploaded.** `:267-268`:
  `gh release upload "${RELEASE_TAG}" "$dmg" --clobber`. Without
  `--clobber` the notarized DMG would sit beside the un-notarized one that
  `tauri-action` published as a side effect of building, and the download
  link would still point at the bad file.
- **Hard-fail on an empty glob.** `:254-257`: zero DMGs found emits
  `::error::No DMGs found in ${DMG_DIR} — tauri bundler output path may
  have changed` and `exit 1`. This is `failure-not-empty-success` written
  into a shell script: the bundler's output path is an internal detail of
  a pinned dependency, and a re-attestation step that quietly notarizes
  nothing is indistinguishable from one that worked.

## The release identity comes from the version source, not the ref

`:249-251` is the trap, defused with a comment:

```bash
# Match the release tag tauri-action resolved from tauri.conf.json's
# version field; GITHUB_REF_NAME is a branch name under workflow_dispatch.
RELEASE_TAG="v$(jq -r '.version' tauri/src-tauri/tauri.conf.json)"
```

`tauri-action` names the draft release from `tauri.conf.json`'s `version`
(`releaseName: "voicebox v__VERSION__"`, `:225`). The re-attestation step
has to upload into that same release, and the obvious handle —
`GITHUB_REF_NAME` — is a branch name whenever the workflow runs under
`workflow_dispatch` rather than a tag push. Reading the declared version
source instead is the release pipeline's single-truth rule applied at the
one place where a second authority would have silently uploaded into a
release named after a branch.

## What this stack still owes

The DMG re-attestation closes the wrapper hole. It does **not** close the
sidecar hole from `MACOS_NOTARIZATION.md`: the plan's status line still
reads *"Diagnosis — Homebrew Cask CI rejects v0.4.5 on macOS 15 (Sequoia);
fix pending"*, and the deep-verification and per-executable-hardened-runtime
requirements are properties of the `.app`'s nested binaries, unaffected by
anything done to the container around it. Notarizing the wrapper made the
download stop warning; it did not make `spctl --assess` on the extracted
bundle pass. The pipeline also runs its verification on whatever macOS
image its runners default to, which is how a downstream channel's CI got
to the finding first.
