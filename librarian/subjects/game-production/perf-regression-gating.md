---
domain: game-production
subject: perf-regression-gating
last_touched: 2026-10-07
touched_by: forge
dry_streak: 0
depth: L1
---

# perf-regression-gating

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-01 - `/intake`, founding (run `in-aura-1001`)

Forged from one XL spec (`librarian/specs/2026-10-01-perf-regression-gating.md`, EXECUTED). Origin: a vendor
documentation site whose profiler page authorized nothing; the subject rests on two engine documentation pages read
verbatim, five more fetched by the forge worker, and a connected project's tree. Source note:
`librarian/sources/2026-10-01-aura-documentation.md`.

**Depth L1.** Five techniques and three applications, one project, no second source and no real-lane measurement.
Every application records that the capture stage it cites was built for this subject, so it is an application of
the standard, not corroboration of it. The gate was exercised only on simulated frame times.

**Open, with return conditions.**
- **A real lane's spread.** The technique states no sample size, threshold or noise figure because no primary does
  and none was measured. **Return:** one branch build with an injected busy tick, five runs each, and the A/A spread
  of its percentile statistic.
- **A simulation finding the technique already honours and the applications must not contradict:** five A/A pairs
  cannot separate a spread-gated rule from a looser fixed threshold; only a sweep over drift levels does. The
  technique makes the replicate count a procedure for that reason.
- **Memory and load time** are deliberately left to sibling subjects (stated in the golden path). **Return:** a
  fleet project that gates either.
- **The CSV-profiler documentation page** returned empty twice and is unread.
- **Re-run `check-anchors` at merge time:** the connected project moves fast.

**Boundary kept with the neighbours.** `runtime-observation-evidence` owns the three outcomes and the fixed-step rule;
this subject adds only what changes when the quantity is different every time it is measured. One pointer was added to
that subject's timestep technique (the boundary is the claim, not the mode).

### 2026-10-07 - `/forge`, extension (run `forge-dro-1007`, branch `autopilot/technical-decision-capture-6e0ab333`)

Three techniques from the Death Ride optimize wave of 2026-10-06: `equivalence-before-the-saving` (goldens and
oracles before a speedup counts; the four measured not-better candidates kept as the alternatives that lost),
`allocation-gate-on-the-shipped-configuration` (the step gate runs what ships, with the host's escape analysis off)
and `host-independent-work-counts` (what a desktop host may say about a device). Two kotlin applications and one
process application, all against `firetv-deathride` at `86cb512d`. The golden path gained one section and one
boundary sentence pointing at the new `render-submission-economy` subject; nothing was rewritten.

**Deviations recorded in the applications.** A kept change inside the wave's own ±2 µs noise; the simulation
golden printed rather than asserted; the allocation gate running with escape analysis on by default and passing
when its counter is unsupported; a post-wave probe whose device field is blank. **Outside hardening:** HotSpot
escape analysis and the flag (Oracle docs) and ART's load-store elimination (AOSP) — the device runtime removes
some non-escaping allocations too, just not the same set, so the claim is stated that way.

**Open.** No stick measurement of the 10-06 step or render changes; the allocation gate's default task does not
apply `-XX:-DoEscapeAnalysis`. **Return:** a stick arm, and a project change to the core test task.
