---
domain: software-engineering
subject: scale-investment-timing
last_touched: 2026-08-27
touched_by: forge
dry_streak: 0
---

# scale-investment-timing

First touch: forged 2026-08-27 from
[[../../../docs/subject-proposal-scale-investment-timing]], raised by `/intake` from
[[../../sources/2026-08-27-best-engineers-focus-on-system-design]]. Placed at
`backend-platform/resilience` (8 of a cap of 10). Five techniques, one `process`
application.

## The application, and the upward lesson it produced

`process--ceiling-as-deadline-not-trigger` reconciles the ceiling technique against
this registry's OWN taxonomy cap, which turns out to be a near-perfect instance of the
technique's form: a figure (10 child directories), an axis that explicitly states what
is NOT on it (files are not counted), a method applied at four enforcement sites, and
- the part most stated ceilings omit - its predicate written in the same comment that
defines the number ("a browsing limit, not a structural truth"). It is instrumented by
a gate rather than by memory, which is `absent-guard-is-loud` satisfied literally.

**It deviates on the technique's central claim, and the deviation is correct.** The cap
is used as a TRIGGER, not a deadline. The technique's own boundary covers it: runway
exists to buy an incremental method for an expensive, risky, hard-to-reverse
remediation, and re-nesting a category is a script run. The discriminator that came out
of writing it: not the size of the system, but **whether the remediation has a failure
mode worth rehearsing.**

**The upward lesson amended the technique.** Beside the cap sits `COLLAPSE_AT = 6` -
split above ten, recombine only below six - with the reason stated: without the gap, a
category oscillating around the threshold rewrites every link inside it on alternating
contributions. That is the same defence as runway aimed at the opposite cost profile.
Runway separates trigger from limit in TIME for a dear-and-rare remediation; hysteresis
separates them in VALUE for a cheap-and-frequent one. The generalisation the draft
lacked: **never let one number serve as both the alarm and the action.** Now a section
in the technique.

Honest limits recorded in the application: the figure is asserted rather than derived
(nobody measured that ten is right, and the source comment says so), and nothing here
exercises the runway calculation, which remains carried on published practice alone. A
serving system under real growth is the realization to look for next.

## Why it exists

The bundle owned every mechanism of scale and no decision about scale. `vertical scal`
returned ZERO across 149 subjects. Every scale-adjacent subject begins after the
sizing decision; the nearest-looking neighbour, `metric-forecasting`, scopes itself to
whether a projection may be DISPLAYED. Missing stage one under an excellent stage two.

## The four dispatch questions, as resolved

1. **Name**: `scale-investment-timing` over `capacity-strategy` / `scale-sizing`. The
   through-line across all five techniques is *should we spend engineering capacity on
   scale, now* - `build-economics` is the precedent for economic framing here.
2. **Ordering**: the ceiling technique opens, which inverts the source's presentation
   order. Pipeline is state the ceiling -> measure against it -> size the increment ->
   fit it to the maintainers, with the migration audit as the guard on the whole thing.
3. **Business-case material**: kept OUT, and my intake triage was partly wrong about
   why. `executive-reporting` covers assembling a briefing from already-computed
   aggregates; it does NOT own making the case for an architecture investment. But
   that material is about *arguing* the investment, not *deciding* it - a different
   act on different evidence - so the golden path states the boundary explicitly and
   the gap is banked below rather than absorbed.
4. **Law**: none written. One run is not convergence. Lead banked below.

## Where the draft overrode the source

The source is a first-party practitioner account and authorized none of this; every
technique rests on literature or on training-data convergence.

- **The ceiling inverted.** The source framed it as ride the architecture to its limit,
  THEN rewrite. The literature says the rewrite is itself the high-risk act
  (second-system effect, requirements drift, all-or-nothing cutover), and its
  mitigation - incremental substitution behind a stable interface - needs runway.
  Riding to the ceiling destroys the runway and leaves only the dangerous method,
  under time pressure. So the ceiling became a **deadline**, with a backwards runway
  calculation producing a latest start date. This is the subject's best content and
  the source had it backwards.
- **The 80% trigger got a mechanism and a correction.** The source reported acting at
  ~80% of a resource ceiling. Queueing theory supplies the reason a number in that
  region exists at all (mean time in system rises as 1/(1-utilisation); at 0.8 a
  request already spends ~5x its service time in the system; the usable knee sits
  70-90%) - and supplies the correction: **headroom-consumed and utilisation are
  different measures and diverge exactly where it hurts.** A team at 80% of headroom
  can be well past the latency knee. The technique now requires the ceiling to state
  which curve it is on.
- **Vertical-before-horizontal got an instrument.** The source's version was a
  preference. The COST result (configuration needed to beat one competent thread -
  frequently hundreds of cores, sometimes never) converts it into a measurement, and
  supplies the load-bearing qualifier: the baseline must be *competent*, or the
  comparison measures optimisation rather than distribution.
- **Maintainer sizing got its missing direction.** Established ownership practice caps
  a subsystem at what its team can hold. The addition is temporal - the count is not
  constant and usually falls, because headcount tracks funding on a quarterly clock
  while architecture moves on a multi-year one - plus the over-built/under-staffed
  diagnostic, which needs the number recorded at design time to work at all.
- **The migration audit was de-fanged deliberately.** Stated as a purity test it gets
  ignored, so the technique argues that hiring, end-of-life, concentration risk and
  operational familiarity can each carry a migration alone. What it demands is that
  the reason be *stated*, because an unstated reason cannot be satisfied more cheaply.

## Open leads (banked, convergence rule applies)

- **A law candidate.** "Design for the next order of magnitude, never the destination"
  has a law's cross-cutting shape - it is provider-portable, clock-proof, and it
  recurs outside this subject (increment-sized commitments under a decaying
  projection). ONE sighting. Return on a second sighting in a different bundle.
- **The business case for an architecture investment is unowned.** Verified during
  this forge: `executive-reporting` owns briefing assembly, `adoption-measurement`
  owns outcome pairing, and nothing owns translating an engineering constraint into an
  argument a funder can weigh. Deliberately excluded here as a different act. Return
  when a second run finds the same hole from another direction.
- **The utilisation-versus-headroom confusion may generalise.** Two measures of the
  same resource that diverge under load, one of which is on the dashboard and one of
  which is not. Worth checking whether `observability-telemetry` or `metrics-rollups`
  names it.

## Cross-subject proposals (for owning subjects)

- The alert-on-a-fraction-of-the-ceiling rule is stated here and instrumented
  elsewhere -> `observability-telemetry` may want the trend-crossing alert shape.
- `module-design` is cited twice (consolidation, and which boundaries are load-bearing
  when an operational surface must shrink). No edit proposed; the link is one-way by
  design.

## Declines

None.
