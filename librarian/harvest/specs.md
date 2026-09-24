---
kind: harvest-specs
created: 2026-08-28
updated: 2026-09-24
---

# Spec bank - approved content awaiting an attended landing

Clusters the operator APPROVED but deferred ("recommended cut now, rest as
specs"). Each entry carries enough anchor detail to land without re-mining.
Strike an entry when it lands; the landing session re-verifies prior art at
body level first.

## 1. Simulation boundary fixes (game-production) - from GAME-011, 2026-08-28

- `goal-seek-on-a-seeded-monotonic-lever` (encounter-balance-simulation):
  add the MONOTONICITY PRECONDITION - when the balance lever is
  non-monotonic spatial edits (tile swaps), goal-seek does not apply; the
  measured alternative ranking is learned swap policy 68.0% of 1000 levels
  balanced to target (88.9% improved) > swap hill-climb 59.6% > replace
  hill-climb 14.3%; distribution-preserving swaps kept 0% unplayable vs
  38.8-83.1% for replace-style edits (arXiv 2503.18748v1, Tables I-III).
- `monte-carlo-scenario-presets`: estimator-convergence sim-count sizing -
  accept n when mean+sd of the outcome estimate < threshold (paper used
  0.05, hit at n>=14 with deterministic agents; the procedure ports, the
  number does not).
- Caveat to carry: the paper's players are SCRIPTED (RL is in the editing
  loop); it confirms, not challenges, the scripted-agents assumption. No
  human-perception validation anywhere.

## 2. Retirement-as-content (game-production) - from GAME-005, 2026-08-28

- Amend `orphaned-artifact-visibility` (content-drift-and-revision): from
  detection to EXECUTABLE RETIREMENT - removal/rename shipped as declarative
  migration entries (old id -> replacement, or explicit null-target for
  errorless deletion, with payload fixups); the criterion for whether
  migration is required is the PERSISTENCE SURFACE (is the id written into
  user save state), not the content type; per-type universal fallback
  entities as the alternative; migrations live in version-stamped folders
  and are themselves deleted after the next stable (retirement machinery has
  a lifecycle). Mod-level removal carries a user-facing reason string
  (cross-domain corroboration of never-fail-silently-reason-strings, already
  caught).

## 3. Music family amendments (media-generation) - from MED-009, 2026-08-28

- `reference-track-anchoring` (music-prompt-composition): melody-anchor-
  carries-contour-only - chromagram conditioning preserves pitch-class
  contour, discards timbre/rhythm/voicing; vendor-measured adherence 0.44
  chroma cosine on released models - a loose harmonic guide, never a
  soundalike path.
- `generated-audio-defect-taxonomy` (generated-music-acceptance): add
  silence-collapse ("generates end of songs, collapsing to silence"),
  vendor-attested.
- `loudness-and-peak-acceptance`: 32 kHz output (below 44.1k delivery
  standard - resample on export), mono base/stereo fine-tunes, reference
  writer normalizes -14 LUFS with loudness compression.
- `rights-and-provenance-record`: the clean-provenance-vs-license split -
  fully licensed training data does NOT clear outputs when weights are
  CC-BY-NC; provenance and license are separate rows in the record.
- Currency (record only): this family accepts text + optional chromagram
  melody ONLY - no BPM/bar/section inputs; tempo and structure survive only
  as prose; long-form is chained continuation. Sibling model (JASCO) takes
  time-stamped chords/drums/melody at a 10s window - lead for a second
  stack on temporal briefing.

## 4. Resilience: configured-dependency degradation, attempt timeouts, constant work (software-engineering) - from SEC-004/033/034/044/045/046, 2026-09-24

**AUTO-BANKED, not operator-approved.** `/harvest auto` (run `hv-auto-0924`) banks content
here per the skill's Modes table; the next attended pass triages, then lands. Source note:
[[2026-09-24-se-resilience-harvest-batch-1]]. Re-verify prior art at body level before
landing: a sibling may have touched these subjects since. Dedupe by author: SEC-033/034/044
are one publisher (Amazon), SEC-045 is Google, SEC-046 is Shopify.

- **4a. NEW SUBJECT `backend-platform/resilience/<configured-dependency-degradation>`**
  (slug is the forge's to pick; research-map places "soft dependency" / "critical
  dependency" beside `optional-dependency-degradation`). XL: three sources, two
  independent publishers, and the corpus names the hole itself ("If the dependency is
  configured and the call failed, that is error handling" - but error-handling owns only
  the failure's shape, and `circuit-breakers` stops at "degrade to trying"). Proposed
  techniques:
  - *failure-mode posture decided in advance* (REL05 BP01): per dependency and per failure
    mode, decide what the component still delivers - stale, alternate, or no data. The
    discriminating question is whether the function's core is **consistency or
    availability**; consistency-first functions refuse or roll back and never land a
    partial write. Rank features by criticality and cost of failure, set the security
    floor first, keep degradation controls server-side (BSRS ch.8 "Controlling
    Degradation", "Differentiate Costs of Failures").
  - *emergency levers* (REL05 BP07): a known, tested way to disable or throttle a
    non-critical component, built before the incident, with a component -> business
    function -> critical/non-critical map ("both a technical and business decision"), an
    activation rule AND a **deactivation** rule tied to monitored metrics, and a test that
    critical functions hold with the lever on. Discriminator: a lever with no turn-off
    rule is a permanent degradation calling itself temporary (`creation-names-reaper`,
    `fallback-retirement-condition`). Seam: an automated lever writes the same record an
    operator lever does (`exclusive-authorship-of-a-measured-decision`).
  - *config-store outage ladder / last-known-good local copy* (BP01 step 3; BSRS "Data
    isolation"): last successfully fetched values, never emptied on a failed refresh
    (`swr-design`), then defaults built into the artifact, kept current and in the test
    suite. **Miner-derived, needs review:** an unreachable store may use the ladder; a
    reachable store returning malformed values keeps last-good and alarms, never drops to
    defaults (`misconfiguration-never-reaches-a-fallback`).
  - *reliability tiers* (BSRS "Component Types"): high-capacity; high-availability copy
    (fewer dependencies, limited change rate, local cached data, older code/config);
    low-dependency alternate (no shared failure domain, features dropped). Cost order:
    failure domains, HA copies, shedding/throttling, low-dependency. Fund the last by
    measuring time-to-bring-up all dependencies of the critical services.
  - *failover selected in the caller* (BSRS "Failover strategies"): a distinct backend set
    per reliability behaviour, chosen by the caller; never an RPC flag asking the same
    backend to skip its dependency ("your system is still one process restart from
    disaster"); after failover, apply shedding tuned to the alternate's capacity.
  - *alternate drift guards* (BSRS "Common pitfalls"): reliance creep, dependency creep,
    failover must not compromise integrity.
  - **Boundary the subject must carry (SEC-033):** "Fallback: Use a different mechanism to
    achieve the same result." Omitting a soft output is degradation; rebuilding it another
    way is fallback, and for a configured critical dependency the answer is to harden the
    primary or let the caller retry ("spending engineering resources on making the primary
    (non-fallback) code more reliable usually raises our odds of success more than
    investing in an infrequently used fallback strategy"). Decision test: any fallback is
    worse on some axis - name it, and ask whether the incident is already straining it
    ("Why use a fallback that's worse, when something is already going wrong?").
  - Neighbours it must not absorb: `optional-dependency-degradation` (never-configured),
    `error-handling` (shape), `circuit-breakers`, `failover-path-liveness`,
    `last-value-degradation`, `capability-honest-refusal`, `depth-bounds-and-shed`.
  - On landing: strike the coverage-gaps line on third-party degradation for good.
- **4b. NEW TECHNIQUE in `retry-backoff`: explicit per-attempt timeouts** (slug for the
  forge; e.g. `attempt-timeouts`). Two independent publishers. Rule: every call to
  something you do not control carries an explicit **connect** bound and an explicit
  **request** bound; "unbounded" only as a named, searchable choice (as `call-wrapping`
  treats `none`); a library default is not a policy (Go net/http: "A Timeout of zero means
  no timeout"; Ruby Net::HTTP 60 s per phase). Two constraints, both stated: the ceiling is
  the waiting user's budget (Shopify: start at 1 s connect / 5 s read, tune from
  monitoring), and within it the value comes from the downstream latency percentile that
  matches an acceptable false-timeout rate (Brooker: 0.1% -> p99.9, add network worst case,
  pad when p99.9 is near p50). Riders: a too-low timeout makes the false-timeout rate the
  retry-rate floor (link `storm-control`); state which phases a timeout covers (DNS/TLS may
  sit outside); move the cold phase (connection open) out of the timer by opening at
  startup (`edge-deadline-arming` is the sibling shape); data stores get a per-query
  ceiling. Timeout x attempts must fit `backoff-design`'s total budget. Boundary: work
  whose legitimate duration is unbounded (`renewal-beats-a-tuned-timeout`,
  `terminate-from-outside-when-you-cannot-count`). Verify before citing: Node's `timeout`
  only emits an event; Go's DefaultTransport bounds dial/TLS but not the response.
- **4c. AMEND `retry-backoff/circuit-breakers`**: (i) a breaker is a *mode*: its open path
  runs only in incidents, it is hard to test and adds recovery time; the retry budget
  bounds amplification continuously but lets first attempts through, the breaker withholds
  first attempts - choose by which load must be withheld, and test the open path
  (force-open doubles as the test) (Brooker). Qualify the golden path's "declared unhealthy
  by a breaker" done-line: the budget alone may be enough. (ii) Operator provenance: "no
  recovery pass, probe or automatic failback may lift it. The automation that may undo a
  state is the automation that imposed it"; an automatic failback carries a disable switch
  (BSRS "Common pitfalls"). (iii) Optional example for the scope section: one payment
  platform keys its gateway breaker on host, port and merchant country, because one
  worldwide endpoint fronts per-country acquirers (Shopify).
- **4d. AMEND `retry-backoff/error-classification-for-retry`**: a client error naming state
  the caller itself just wrote to an asynchronously propagating store is transient for a
  bounded propagation window, then permanent again; the consistency-index case in
  `client-retry-and-redirect-conventions` is its token-bearing form (Brooker). Needs a
  decision on `error-handling/taxonomy-design`, which lists not-found as permanent with no
  condition - a one-clause qualifier there, confirmed against error-handling's own body.
- **4e. AMEND `retry-backoff/storm-control`**, new section after "Correlated wake-ups": *the
  failure mode does no more work than the normal mode.* A mode switch that adds work on
  failure is an amplifier the retry budget cannot see: a timeout that triggers a full
  configuration refresh, a client that bypasses its cache on error, recovery that acquires
  capacity. REL11-BP05: "A statically stable design would do constant work and always
  refresh the configuration state on a fixed cadence. When a call fails, the workload
  would use the previously cached value and initiate an alarm." The negative case (SEC-033):
  "eventually the caches all failed around the same time, which meant that every web
  server hit the database directly. This created enough load to completely lock up the
  database." One publisher, two authors; the second organisation is training data only
  (memcache gutter pools) - say so. Add to `use_when`: a failure triggers a full refresh or
  a cache bypass. Apply seam: fleet fetch-cache code that falls through to origin on error.
- **4f. AMEND `retry-backoff/retry-observability`**, "What to record" item 6: latency is
  recorded per outcome, never blended - while a breaker is open, blended latency *improves*
  as health collapses; a slow failure is worse than a fast one (SRE book monitoring
  chapter, fetched; Shopify).
- **4g. NEW TECHNIQUE in `scale-investment-timing`: provision for the lost domain** (slug for
  the forge). Capacity to survive the loss of one declared failure domain runs before the
  loss, so surviving takes no action. Reactive recovery puts the provisioning plane and the
  surviving domains' spare capacity in the recovery path when both are least available.
  REL11-BP05 anti-patterns: "Trying to dynamically acquire resources during a failure",
  "Considering static stable designs for compute resources only". Arithmetic as a derived
  limit (`limits-are-derived`): per-domain ceiling (N-1)/N, overhead 1/(N-1); 3 domains ->
  +50%, about 66% each. Reactive scaling restores headroom afterwards, never as the survival
  mechanism. Discriminator against the subject's over-building critique: headroom that
  names its domain and derives its size is availability capacity. Single-machine instances:
  pre-allocate at startup, push credentials ahead of time (SEC-033). Cross-links: the
  golden path; `vertical-headroom-before-distribution` (its "Availability" hand-off);
  `self-healing` (neighbour list); one sentence at the top of `retry-backoff.md`. Expect a
  thin fleet seam - most of the fleet is one node plus a restart.
- **4h. AMEND `llm-agent/orchestration/model-routing/failover-path-liveness`**: (i)
  exercise the path in normal work - mirror a sample to the alternate, compare, alert
  outside an expected band, always serve the primary unless it errored; split traffic
  where mirroring is impossible; people use operator-run emergency paths routinely;
  inject in latency steps and abort on any concurrent failure (BSRS). (ii) Remove the
  switch-over instead of testing it: run both paths continuously and treat either answer
  as valid (SEC-033: "It must not merely run the fallback case but also treat it as an
  equally valid source of data"), at the cost of doing the work twice. (iii) Steady
  non-zero traffic on an incident-only fallback is a capacity alarm, not health (BSRS
  "Common pitfalls"). The generic rules may belong in 4a with a cross-link here - the
  forge decides.
