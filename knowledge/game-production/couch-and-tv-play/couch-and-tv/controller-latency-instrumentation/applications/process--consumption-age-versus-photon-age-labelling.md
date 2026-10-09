---
layer: application
type: application
subject: controller-latency-instrumentation
technique: consumption-age-versus-photon-age-labelling
stack: process
status: forged
verified_on: 2026-10-01
---

# Labelling, soak summaries and the flash test in a racing game's reports

Verified 2026-10-01 in the racing game's tree; paths are relative to its root, except the
last section, which cites a sibling repository and says so. Honesty first, as the wave
requires: every figure below came from scripted clients on a real Fire TV stick, or from a
desktop host. The optical flash test was written and documented and has never been run on a
human's setup. No human has felt this game's latency.

## Labels, as written

The stats documentation defines the field by its end event and disclaims the optical
reading in the same entry:

- `deathride/README.md:38` "age when the simulation consumes the state."
- `deathride/README.md:38` "it is not an optical latency measurement."

The milestone report keeps the vocabulary apart:

- `docs/concepts/deathride/G1-REPORT.md:104` "Whole-load acknowledgment RTT p50/p95/max was" sits beside the active-window input age p95 and max of 47.05 and 73.95 ms, and closes with `docs/concepts/deathride/G1-REPORT.md:104` "These are distinct measurements."
- `docs/concepts/deathride/G1-REPORT.md:117` "not input-to-photon"
- `docs/concepts/deathride/G1-REPORT.md:110` "Optical thresholds remain unmeasured." is the not-measured state rendered as words, not a blank.

The round-trip tail (63 ms at the ninety-fifth percentile) exceeding the consumption-age
tail (47 ms) is the live example behind the technique's warning that the numbers are not
ordered the way intuition expects. It is a measured result of two scripted clients, not of
a household network.

## No prediction was added to hide lag

The verdict records a design decision the labelling technique asks to be stated, and carries
its optical rubric as a proposal:

- `deathride/docs/concepts/DEATH-RIDE-SPIKE-VERDICT.md:73` "No prediction was added to conceal lag."
- `deathride/docs/concepts/DEATH-RIDE-SPIKE-VERDICT.md:79` "Proposed rubric: optical p50"
- `deathride/docs/concepts/DEATH-RIDE-SPIKE-VERDICT.md:79` "None of these hardware thresholds is certified by this delivery."

The rubric itself is the neighbouring norms subject's kind of object; the point here is that
it travels labelled as a proposal and is never rendered as met.

## The flash test

The protocol is as documented and as specified; it was not run on a human setup.

- `deathride/README.md:43` "Film both screens in one 240 fps shot for at least 30 taps."
- `deathride/README.md:43` "network RTT is not a substitute"
- `deathride/README.md:43` "Flash events are discarded if their input is already stale."
- Hardware gate: `deathride/docs/concepts/DEATH-RIDE-SPIKE-VERDICT.md:77` "Film both screens at 240 fps for at least 30 FLASH TEST taps."
- The screen device acts only on an accepted input: `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:173` "flash.set(true)"
- The not-measured line from the feel research: `docs/concepts/deathride/W1-feel-research.md:19` "Optical latency and owner feel are not measured."

Confirmed against the draft: single-frame event, accepted-input gate, frame rate and tap
count stated, network figure refused as a substitute, p50, p95 and max reported. Not in the
documented protocol and wanted by the standard: randomised tap phase, miss counting, the
controller display's own latency, and the television's mode settings in the report.

The scout's anchor at line 73 of the feel research does not exist (the file ends at line
41). The relevant sentences are at lines 19 and 39; line 39 carries the earlier
scripted-client numbers: `docs/concepts/deathride/W1-feel-research.md:39` "not input-to-photon"

## Window percentiles, not pooled

The soak report applies the non-pooling rule in so many words:

- `docs/concepts/deathride/G1-REPORT.md:117` "Never average window percentiles"
- `docs/concepts/deathride/G1-REPORT.md:102` "sums of rolling populations"
- `docs/concepts/deathride/G1-REPORT.md:102` "(different windows)"

Confirmed: worst-window reporting with the different-windows caveat, phases reported
separately with both maxima kept, rolling-population caveat on counts. The run did not
retain a shared-geometry histogram per window, so a pooled percentile over the whole soak
was not producible, which is why the report uses worst-window figures. That is step one of
the technique's soak procedure not having been done before the run.

## Two paths, before blaming the radio

The sibling repository's findings record the discipline of refusing the obvious story. Paths
in this block are relative to that repository's root (the firetv repo, not the game tree):
`docs/POC-FINDINGS.md:222` "settled it by measuring two paths at once" and `docs/POC-FINDINGS.md:224` "app stalls coincided with a network stall". Zero of 139 stalls coincided
(0 of 48, 26 and 65 across three runs); the tail was the application's. That finding is the
origin of the golden path's section on disagreeing with the first story. It concerned a
pen-drawing socket, not a controller, so it is an upward lesson for method and not a
measurement of this game.
