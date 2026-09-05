---
domain: software-engineering
subject: scale-investment-timing
last_touched: 2026-09-03
touched_by: forge
dry_streak: 0
---

# scale-investment-timing

First touch: forged 2026-08-27 from
[[../../../docs/subject-proposal-scale-investment-timing]], raised by `/intake` from
[[../../sources/2026-08-27-best-engineers-focus-on-system-design]]. Placed at
`backend-platform/resilience` (8 of a cap of 10). Five techniques, two `process`
applications - both reconciled against this registry itself, which turned out to be a
legitimate instance twice over rather than a convenience.

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

## The second application

`process--size-the-system-to-its-maintainers`, written against the technique with the
thinnest evidence in the subject. The registry is close to a pure case of the
generation-versus-operating split - authored overwhelmingly by agent sessions, merged
by one person - and it does the thing the technique asks for and almost nobody does:
**the maintaining headcount is recorded where decisions get made**, in `CODEOWNERS`,
with the failure mode named in the file's own header comment ("a personal owner becomes
an unmergeable pull request the week that person changes team"). The risk is legible in
advance rather than discovered during a resignation.

The best evidence in it was produced by the session that wrote it. Two agent sessions
in one checkout caused a bundle-integrity failure neither session's own work caused,
plus two derived-file conflicts needing manual resolution - **operational surface per
maintainer rising as a direct function of generation capacity, arriving through
coordination rather than code volume.** Nobody designed that demonstration; it fell out
of the working conditions, which is the strongest form this evidence takes.

Three honest limits recorded: it does NOT test the falling-headcount claim (the
denominator is one by policy, not attrition), the over-built/under-staffed diagnostic
has no design-time ratio to compare against, and nothing in it recommends single-owner
ownership. **The subject's central temporal claim therefore still has no confirming
instance** - a system that measurably lost maintainers while keeping its architecture
is the realization to hunt for next.

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

## 2026-08-29 — /deepen architecture batch (dry_streak 0, L2)

5 techniques (no new), 2→3 applications (node--migration-reason-audit — the kp Postgres
pre-migration audit, first non-process stack). REFUTED: "migration cost reliably
underestimated by an order of magnitude" (measured: ~27% mean overrun, 1-in-6 fat tail,
power-law) and "team size usually moves down" (reframed as asymmetry of consequence).
Qualifier-edge earned: open-vs-bounded arrivals on the utilisation knee; step growth as
ordinary (calendar-date T_ceiling); the shared-downstream budget axis (the one fan-out
worsens). Survived: COST-survey claim (strengthened), M/M/1 arithmetic, incremental-
replacement record. Banked: kp migration execution (return: KP_DB_BACKEND second
value); fleet load-test absence — zero load tests in seven projects, every limit
basis: inherited (return: any project adds a load harness). Forecast thin next pass.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+1 technique, +1 amendment. **`execution-model-concurrency-threshold`** supplies an
axis the subject lacked **with a number**.

The subject's quantified baseline discipline had one axis: node count
(`vertical-headroom-before-distribution`). Its axis list did not contain
concurrent in-flight operations. The source states the threshold —
**~1K–10K concurrent mostly-idle connections**, "most services are below that" —
with a floor (below ~10 concurrent I/O operations, profile before committing) and
a priced cost model (20–80KB resident per idle worker, the large figure being
address space not commit; 1–5µs switch; creation amortized to zero by a pool).

This reproduces the subject's own asymmetry argument on a new axis: the wrong
choice fails silently and continuously — slower delivery, unreadable traces, every
test needing a runtime — and generates no incident.

Amendment to `migration-reason-audit`: promotes a finding that was **stranded in an
application**. `node--migration-reason-audit.md:52-58` had 512 synchronous call
sites across ~48 files and "that cascade, not the SQL, is the cost", while the
technique above it carried no general rule. Now it does, with the four transitive
surfaces the application lacked (shared-state ownership, exclusion primitive, test
harness, diagnostic surface).

## 2026-09-04 — intake, `intake-eaxh`

Touched by an intake run over a tutorial explainer on system-design fundamentals
([[2026-09-04-system-design-break-order]]). The source landed nothing of its own;
the subject corrected a claim about itself.

**What changed.** The golden path's opening listed four mechanisms whose summoning
decision this subject owns — rate limiting, sharding, replication, shedding — and
asserted "this bundle covers them thoroughly." Three of the four do have subjects.
**Partitioning has none**, in any bundle: no subject slug contains `shard` or
`partition`. The opening now names the omission instead of asserting past it.

**Why it matters beyond the sentence.** A golden path that overstates its
neighbourhood's coverage sends a reader looking for a subject that is not there,
and this one is the bundle's entry point for every load decision — the highest-
traffic place in the corpus for that error to sit.

**The standing gap.** `backend-platform/data-layer` holds 7 subjects under a cap of
10, so a partitioning subject has a home and no placement veto. It is banked as a
lead rather than specced: a tutorial explainer proves the gap but cannot author the
content. Return condition in the source note.

**The subject won its own argument, twice.** The source's pedagogy — break it, then
fix the piece that broke — is the naive reading `ceiling-as-deadline-not-trigger`
exists to correct. And the run's own proposed fix (a gate asserting coverage claims
in `check-bundles.mjs`) was refuted by this subject's over-building asymmetry: the
detector, asserted against a true positive in `HEAD` and 411 negatives, found the
population to be **exactly one** — the sentence already fixed by hand.
