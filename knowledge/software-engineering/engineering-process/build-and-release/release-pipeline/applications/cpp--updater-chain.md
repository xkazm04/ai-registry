---
layer: application
type: application
subject: release-pipeline
technique: updater-chain
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# Updater chain - the in-app updater of a desktop chat client

How the Chatterino 2 desktop client realizes, and where it falls short of,
[updater-chain](../techniques/updater-chain.md), read at commit
`fda51f0d3a4a5cd15f099b951b796e299d566e9e`. The version witness is the tree's
own build file: `CMakeLists.txt:71` declares `VERSION 2.5.5`, `CMakeLists.txt:30`
and `:100` make Qt 6 the required toolkit, and `CMakeLists.txt:281` sets the
C++ standard the tree compiles against, which is what `verified_against`
names. This is a catch: the technique already states every rule below, and
the tree is read against it.

## The feed, and who polls it

The feed is one URL per platform per channel
(`src/singletons/Updates.cpp:334-335`), and the channel is a **setting**: a
boolean `betaUpdates` at `src/singletons/Settings.hpp:759`, surfaced as a
checkbox "Receive beta updates" (`src/widgets/settingspages/GeneralPage.cpp:904`),
resolved to `"beta"` or `"stable"` by `currentBranch()` (`Updates.cpp:32-35`).
Flipping the setting re-checks immediately (`:61-65`). So the stable and beta
channels each poll their own feed, which is the technique's ring structure
implemented as two feeds rather than a rollout fraction on one.

The feed manifest carries a version string, an installer URL, and on one
platform a portable-archive URL (`:340-376`). Each is checked for presence and
type, and a missing field sets `SearchFailed` rather than proceeding with a
partial answer (`:344-350`, `:355-361`, `:367-374`) - the technique's
"hard-fail on any absence", on the client side.

Two populations decline to poll at all. A build without a supported operating
system logs and returns (`:320-326`); a sandboxed-package install, detected by
a marker file (`src/common/Version.cpp:85-88`), returns silently (`:328-332`)
because the package manager owns updates there. And the whole updater can be
compiled out (`:317`, `:405`).

## Nightly refuses the door, and says so

The design record this application was filed from is the nightly rule.
`installUpdates` (`Updates.cpp:120-133`) checks `Version::isNightly()` before
anything platform-specific and, if true, opens the downloads page and returns,
with the comment "Since Nightly builds can be installed in many different
ways, we ask the user to download the update manually." The nightly flag is a
build-time definition (`CMakeLists.txt:43`, `src/CMakeLists.txt:1177`) set by
the CI workflow from the branch (`.github/workflows/build.yml:96-106`), so a
nightly cannot be talked into applying by any feed content. The user-facing
text (`Updates.cpp:459-470`) repeats the refusal and, when the online version
parses lower than the running one, explains that either a release was
reverted or the user is on a newer build.

This is the technique's one-way door reasoned about honestly: an apply step
that cannot know how the running copy was installed cannot stage-and-swap
safely, so it declines rather than guesses.

## What the tree confirms

- **Platform-specific apply, and refusal where apply is unsafe.** One
  platform gets a detached installer process; another opens the payload URL
  and tells the user to install; a third says automatic updates are not
  available and opens a guide (`:135-149`). Portable and installed modes on
  the first platform take different payloads and different updater binaries
  (`:151-227` versus `:228-311`), and the portable path refuses with a named
  status if its updater binary is missing (`:209-213`).
- **Every failure is a named status**, not a swallowed branch: the `Status`
  enum (`src/singletons/Updates.hpp:32-42`) distinguishes search, download,
  file-write, missing-updater and run-updater failures, and
  `shouldShowUpdateButton` / `isError` (`:419-449`) map them to the surface.
- **Stale payloads are reaped.** `deleteOldFiles` (`:90-108`) removes the
  previous release's downloaded installer and archive on start.

## Where the realization falls short of the technique

**No signature, no checksum.** The feed carries a version and URLs and
nothing else (`:340-376`); the downloaded installer is written to disk and
executed (`:264-292`) with no verification beyond the transport. The
technique's central rule - the verifier fails closed on an unsigned payload,
and re-verifies at apply time - has no implementation here. Anyone who can
write to the distribution host, or the feed host, can ship code to every
installed copy that clicks the update button.

**"Different" means "update".** The comparison at `:392-401` is string
inequality: any online version that is not byte-equal to the running one sets
`UpdateAvailable`. A semantic comparison runs afterwards (`isDowngradeOf`,
`:69-88`) but only to set a downgrade flag for the message text; an online
version that fails to parse is logged and treated as *not a downgrade*
(`:72-77`), and since the strings differ, the client still offers it as an
update. The design read for this run stated the opposite ("an unparsable
version means no update"); the tree says an unparsable version means an
update that is not called a downgrade. Recorded here as a correction.

**Nightly still polls the release feed.** The channel is stable or beta
(`:34`); there is no nightly feed. A nightly build compares its release
version string against the stable feed, sees a difference whenever the two
disagree, and shows an update it will then refuse to apply. The refusal is
correct; the offer that precedes it is noise the technique's "the updater
reports its own health" would want silenced.

**No rehearsal, no adoption telemetry, no staged rollout.** Nothing in
`.github/workflows/` runs the previous release against a candidate feed; the
client sends no version-adoption signal; the feed offers one version to
everyone on a channel. The two-channel structure is the whole rollout
control, and it is opt-in on the client, not a fraction honoured by the feed.

**No feed-from-artifacts discipline is visible from here.** The feed is served
by a separate host, and this tree does not contain the generator, so whether
it is derived from uploaded artifacts or assembled from intent cannot be
confirmed. Given the manifest carries no checksums, there is nothing for it to
derive.

The standard stands; the tree ships an updater that is honest about where it
cannot apply and silent about whether what it applies is genuine.
