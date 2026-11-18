---
layer: application
type: application
subject: ship-pipeline-gating
technique: build-secrets-in-an-unstaged-layer
stack: process
status: forged
verified_on: 2026-11-18
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Process: a headset project's staged layers, read before it signs a release

The tree is `xkazm04/mage-arena` (public) at `579737e`: a seated spell duel for a standalone
headset, packaged for the headset's store platform by a PowerShell script around the engine's
automation tool. It signs with the development key only; no release signing exists yet. The
engine's own staging rules were read from the 5.8 install on the same machine, which is the
packager this tree names. No `verified_against`: the tree does not pin the engine version in a
file the run could read as a witness, only in prose and in the script's install path.

## What the layers hold

- `apps/vr/Game/Config/DefaultEngine.ini:27` "[/Script/AndroidFileServerEditor.AndroidFileServerRuntimeSettings]"
  - the development file server's settings, including its token, in a project layer the
  packager stages.
- The engine's `BaseGame.ini` puts that whole section on its section deny list, and the
  signing-password keys on its key deny list; its staging copy filters text configuration
  files by exact key prefix and by section, and skips the filter for the collapsed binary
  configuration form.
- `apps/vr/tools/package-android.ps1:45` "check-staged-clips.mjs" - a check that runs
  before the cook over what a staging rule will include. It is the right instinct at the
  wrong observation point for secrets: it reads the source, not the staged list.

## The experiment

Arm A is the pipeline as it is: nothing reads the staged file list for secret-bearing
files. Arm B adds the technique's two checks: fail on any user-layer configuration file or
keystore in the staged list, and scan the staged configuration copies for secret shapes.
Without a staged list on this machine (the engine host is another workstation, and no package
exists here), arm B could only be run against the source layers, and that is the case the
technique warns about: a source scan flags the file server token, which the packager drops by
section. The staged-list rule itself would pass (no user-layer file exists in the project's
configuration directory).

Verdict **unmeasurable**. The instrument that would measure it is the staged file list and
the staged configuration copies from one `package-android.ps1` run on the engine host:
assert no `Config/User*.ini` and no keystore in the list, grep the staged copies for the
token's key name. The structural fact stands meanwhile: this project's one secret-shaped
value in a staged layer is safe because one engine-maintained name list happens to cover it.

## What it would change here (recorded, not made)

The run did not edit this repository. Before the first release-signing change: keep the
signing password in the per-user configuration outside the project, add a post-package
assertion over the staged file list beside the existing manifest-marker check, and add any
project-chosen secret key names to the packager's key deny list.
