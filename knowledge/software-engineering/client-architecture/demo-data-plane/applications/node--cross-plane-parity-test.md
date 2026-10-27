---
layer: application
type: application
subject: demo-data-plane
technique: cross-plane-parity-test
stack: node
status: forged
verified_on: 2026-10-27
verified_against: node@24
---

# The fake group: the live poller over a GitLab built from the demo (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). A DevSecOps control plane with two data sources — a demo
source serving a catalogue, and a live source that polls a GitLab group into an in-process index —
and a third mode, `AFTERLIFE_GITLAB=fake`, in which the live source polls a GitLab built from the
demo dataset. Tests run on the CI image `node:24-bookworm` (`.gitlab-ci.yml:21`). This application
covers [cross-plane-parity-test](../techniques/cross-plane-parity-test.md) and the
[replay-clock-pinning](../techniques/replay-clock-pinning.md) it depends on.

## The rig and its pinned clock

`src/server/data/__tests__/fakeGroup.ts` is the rig the parity test shares: it seeds the index
with what GitLab cannot express (`seedDemo(db)`, `src/server/data/__tests__/fakeGroup.ts:20`), runs one real poll cycle
against the demo GitLab at the pinned poll instant (`src/server/data/__tests__/fakeGroup.ts:22`, `runPollCycle(gl.port, db,
replayClock.poll(), ...)`), and builds the snapshot at the pinned read instant (`src/server/data/__tests__/fakeGroup.ts:24`,
`buildSnapshot(db, replayClock.read(), ...)`). The clock has two faces,
`src/server/data/live/clock.ts:1-2` "when a poll happens, and the instant the screens read the
index at (feed ages and countdowns are measured against it)", and the replay pins both to one
dataset constant, `src/server/data/live/clock.ts:12-20`: "The demo's numbers are a frozen moment (14:22, feed 12 s
old, countdowns "19 h 12 m"), so the fake group is polled at 14:21:48 and read at 14:22:00,
always", with `poll: () => new Date(SEED_NOW.getTime() - 12_000)` and `read: () => SEED_NOW`.
The production path selects the same clock for the fake GitLab
(`src/server/data/live/ports.ts:18`), so the deployed replay and the test use one pin.

## Props compared as the page sends them

`src/server/data/__tests__/parity.test.ts:1-2` states the promise: "the live source, fed by a poll
of the demo GitLab on top of the seeded index, must hand every screen's loader exactly what the
demo source hands it. Where the two may differ is listed in the last describe, and nowhere else."
`both()` runs a loader under each source (`src/server/data/__tests__/parity.test.ts:54-61`); props are compared after a JSON
round-trip "as the page would send it to the client: JSON, so `undefined` and a missing key are
the same" (`src/server/data/__tests__/parity.test.ts:33-34`). A spelling-only difference has a named normaliser with its
reason (`src/server/data/__tests__/parity.test.ts:44` "The fixture spells "no last event" as null on six projects; the index
view leaves the key out. Both draw nothing.").

A separate group proves the poll really wrote what parity rests on
(`src/server/data/__tests__/parity.test.ts:96` "the poll really did write what the parity rests on (it is not just the
seed)"), reading values only ingestion could produce — the class record counted from the MR the
fake GitLab carries, where the seed said 16 (`src/server/data/__tests__/parity.test.ts:101-103`).

The intended differences are a describe of their own (`src/server/data/__tests__/parity.test.ts:109` "where live differs
from demo, on purpose"), each asserting the difference itself — e.g. the Needs-you count is 0
live and 5 demo (`src/server/data/__tests__/parity.test.ts:110-115`) — and the data-layer README cites that list as the
boundary (`src/server/data/README.md:73`).

## Where the tree sits against the technique

Confirmed: fake upstream from the demo world, real ingestion, pinned clock, serialised
comparison, the it-is-not-just-the-seed check, the on-purpose group. One deviation: the
per-loader comparisons also null fields inline — the Fleet case sets the deep project's
`needsYou`, `armed`, `last` and `webUrl` aside inside its own `read` (`src/server/data/__tests__/parity.test.ts:65-68`), and
its comment points to a second file for the reasons ("Where live differs (below, and
../live/projectFields.test.ts)"). The list is therefore one describe plus local strips plus
another file, not one place.
