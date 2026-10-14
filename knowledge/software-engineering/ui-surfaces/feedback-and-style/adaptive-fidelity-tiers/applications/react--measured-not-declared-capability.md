---
layer: application
type: application
subject: adaptive-fidelity-tiers
technique: measured-not-declared-capability
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: simulation
ab_verdict: unmeasurable
---

# React application - measured, not declared capability

A raster-compositing landing page picks one of three tiers (full, lite, still)
from a probe at load and then runs a frame-time governor. It is a hybrid of
the technique and the thing the technique warns against, and the split is
instructive because the two halves sit forty lines apart.

## What conforms

The governor samples the page's own rAF intervals while the page is doing its
idle motion, summarises with the 90th percentile (never a mean), discards a
window when the tab is hidden, and judges the intro's one-off reveal out of
the sample on purpose. A verdict the governor had to correct is stored under
a signature of the probe inputs with a one-day expiry. All of this is the
technique.

## What does not, and the seam chosen to falsify

The initial verdict is not measured. It reads the renderer string of a
throwaway WebGL context, then `hardwareConcurrency <= 2`, `deviceMemory <= 2`
and Save-Data, and any one of them sets `lite` for the whole session.

Seam chosen to falsify "a declared lite is merely a cheap prior": the governor
moves **down only** and a session never steps up, and only a governor
downgrade is cached. So a declared `lite` is a verdict nothing in the system
can ever contradict: no frame it produces is read against it. The technique's
under-serving direction ("a recent phone reports a modest core count and
receives the stripped experience while outrunning the median laptop") has no
correction path here, because the corrective instrument exists only in the
downward direction. Had the governor also stepped up, the declared prior
would be harmless; it does not, so the prior is the decision.

Three constants (`22 ms`, `45 frames`, the 3 s window) state what they
measure but not their derivation; the window is bounded by duration **and** a
minimum count, so the percentile is computed over a variable sample count.

## Three cases walked under A (as is) and B (declared signals become a prior the governor can overturn upward after a clean measured window)

1. A two-core machine with a hardware GPU and low memory bucket (device memory
   is reported in coarse buckets capped at eight): A serves lite for the
   session whatever the frames would have said; B starts lite, measures the
   same windows, and promotes after a clean run. Prediction: B reaches full
   within one session; falsified if such a device then drops windows and
   oscillates.
2. A thermally throttled twelve-core desktop: neither arm's initial verdict
   differs (full); the governor already catches it. Control, no change.
3. A software-composited machine: the renderer match sends both arms to lite;
   B's promotion window must keep failing on it. Falsified if a software
   renderer ever clears the window.

Floor: tier flapping per session and frames over the deadline after a
promotion must not rise. Target: sessions on a declared-lite device that
reach a tier their frames support.

## Verdict: unmeasurable

No fleet instrument reports tier per session or the share of declared-lite
sessions that would have passed the window. The page emits no tier telemetry.
Return condition: when the landing page records the tier and the governor's
window p90 per session (the instrument), run arm B behind the forced-tier
query and read the promoted share and the flap rate. A task has been filed in
the project's applied ledger; no product code was changed here, because a
promotion path changes what a weak device sees first and that is a design
call with no measured floor yet.
