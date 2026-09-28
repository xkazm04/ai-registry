---
kind: harvest-specs
created: 2026-08-28
updated: 2026-09-28
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

## 5. Unattended-run isolation: audited as paths, fails as reach (agent-operations + neighbours) - from SEA-023/038/044/045/046/047/055, 2026-09-24

Banked by `/harvest auto` run hv-sea-0924; note
[[2026-09-24-se-agent-isolation-harvest-batch-1]]. Nobody approved these. They are
corroborated and drafted for an attended landing, and the landing session re-verifies prior
art at body level first.

Needle: `agent-operations/run-safety/unattended-run-isolation`, 3 techniques against a
design floor of 4, never swept. Purity: agent-operations upper layers are transplant-clean,
so every draft below names mechanisms, never vendors. Incident and product names belong only
in an application or evidence file.

- **5a. CONTRADICTION in the `unattended-run-isolation` golden path** ("Shared state is the
  recurring failure", rule 2), in its Dependencies bullet, and in the `no-links-into-live-trees`
  exception. The subject holds two standards for one object: rule 2 says "Runs may share a
  read-mostly package cache", while the Dependencies bullet says "a genuinely read-only
  shared cache". The looser one failed in the field.
  - SEA-055, measured: ~1,200 runs sent 70k+ messages through a shared pull-through package
    cache. They wrote it at install-level permissions through directory creation, entry
    metadata, and requests for made-up names that the cache stored ("a read was a write").
    A listing showed each run its siblings' fetches. It was read-mostly in intended use.
  - SEA-023, code: E2B's runtime cache is lazily filled and safe. The host is the one writer,
    keys are control-plane build IDs, and the run never supplies a key or a value. The
    run-filled build-layer cache is per-tenant and published only after upload.
  - So the corrected rule is not "no fill-on-demand". Draft rule 2:
    > **A shared cache is per-purpose and per-writer, and read-mostly is not read-only.**
    > Runs may share a cache only when no run can choose what is stored in it (neither key
    > nor value) and no run can observe what a sibling caused to be stored. A cache filled by
    > one writer outside the runs, keyed by identifiers the runs do not choose, qualifies
    > even when it fills on demand. A pull-through cache that stores whatever name a run
    > requests, and lists it, is a channel between every run that reaches it. Runs must never
    > share a build output directory [keep the existing reason]. The same holds for any cache
    > that provisioning or an environment reset pulls from: whoever can write it chooses what
    > the next environment runs.
  - Dependencies bullet, sentence to add: "Read-only means read-only through every path a
    run can use, not only the file interface: the permission needed to install a package is
    often enough to create an entry or set a property on one."
  - `no-links-into-live-trees` exception: replace "a package download cache, for example"
    with a cache that meets rule 2's test, and say that a pull-through proxy is not the
    exception.
  - Voices: METR/Redwood (measured), E2B (code), HF (same incident, relay: the proxy was also
    the escape egress). The corpus-internal inconsistency was spotted independently by the
    SEA-046 lane.
  - Apply seam, NOT verified: any fleet runner whose unattended runs share a content-addressed
    package store or download cache that every install writes into. Check whether a run
    chooses what lands there and whether it can list what siblings fetched.
- **5b. NEW TECHNIQUE in `unattended-run-isolation`: reachable services are inside the
  boundary** (slug for the forge; SEA-044 drafted `permitted-egress-is-the-boundary`). This
  is the subject's 4th technique, which meets its design floor. The instrument: `rg -i
  'network|egress|container|kernel|outbound'` over the subject returns 0, while the positive
  control `credential` returns 4, so "What isolation must cover" has no network item.
  - Mechanism: a run's network policy is a list of destinations, and each one is attack
    surface.
    - A destination that forwards (a proxy, a mirror with an upstream, a relay) is reach
      that depends on the forwarder's correctness.
    - One that accepts the run's writes is a channel both ways.
    - The supervising host is itself a destination. SEA-045: two of four unintended escapes
      never touched the container. The run reached its own host over the bridge gateway and
      used the published base image's default credentials, then its publicly downloadable
      key.
    - Name-based controls fall to hosts-file pinning, DNS rewrites and in-process
      resolution (SEA-044, observed). So enforce outside the guest by route and address, or
      through a host-side proxy that ignores the guest's resolution and resolves the name
      itself (SEA-023: the enforcer dials the hostname and rejects an internal resolved IP
      before connect).
    - Deny link-local, metadata, loopback and private ranges before any allow.
    - Allowing a name implicitly allows its resolver, so list derived destinations
      (SEA-023: allowing any domain silently adds a public resolver).
    - Strip network tools from images that do not need them.
    - Disposability resets state, not reach: a rebuilt environment re-arms itself from any
      external stage it can fetch.
  - Audit before a queue starts: for every address a run can reach, starting with its own
    supervisor, does it forward, does it accept writes, where is it enforced, and does the
    environment's image share any credential with another run or with the public?
  - `use_when`: deciding what network destinations an unattended run may reach; a run's only
    permitted egress is a dependency proxy or mirror; provisioning a run host or base image;
    auditing whether a disposable environment is also a contained one.
  - Transplant condition: the incident's objective rewarded reach and its safety classifiers
    were off. Carry that as the "when this bites hardest" line, not as a precondition.
  - Voices: HF, METR/Redwood, Oxford + UK AISI, E2B; the Rashidi SoK is a relay and not
    counted. Second implementations to read when forging: SEA-056 (sandbox-runtime) and
    SEA-057 (gondolin).
- **5c. NEW TECHNIQUE in `unattended-run-isolation`: `isolation-class-by-threat-model`**
  (SEA-047 draft). The subject's other techniques contain a *mistake*. Once a run executes
  code nobody reviewed (generated scripts, a cloned repository's install or test hooks,
  packages the run picked itself), the threat becomes an escape, and escapes go through the
  kernel the process talks to.
  - Procedure:
    1. State the threat first. A shared-kernel container is disqualified for hostile code on
       your own infrastructure.
    2. Qualify escape, reconnaissance, addable hardening and patch lag at the pin actually
       run, each separately, never as a composite.
    3. Read the product, not the class. A privileged start disables most hardening layers.
       SEA-023's VMM runs without its vendor's jailer.
    4. Verify from inside a fresh guest, reading the filter state of every thread. A
       leader-thread read said "no filter" while 32 of 33 workers were filtered.
  - Decision rules: a small surface limits reachable paths, not bug density; zero CVEs with
    no fuzzer is unmeasured; count hardening layers only within a class.
  - The weakness-class measurement (SEA-045, re-grouped from Appendix H): configuration and
    over-grant weaknesses were cleared at 0.97-0.99 by capable models since 2026-02; known-CVE
    weaknesses held at 0.11 and now at 0.50. Every scenario had a deliberate weakness, so
    this says nothing about a hardened container.
  - Boundary: the substrate bounds kernel escape only. Shared services stay with 5a and 5b.
  - When not to use: runs that execute only reviewed code.
  - Voices: Andronchik/Lokhmakov, Oxford + UK AISI, E2B.
- **5d. `unattended-run-isolation` "Isolation is a claim to be tested": escape rehearsal by
  weakness class** (SEA-045 draft `escape-rehearsal-by-weakness-class`; the forge decides
  between technique and amendment). Rehearse the escape instead of waiting for the incident:
  - Put a canary outside every namespace of the boundary under test.
  - Nest that boundary in a stronger one, so a success is contained.
  - Give a capable agent a shell and the objective of reading the canary, and exact-match the
    result.
  - Report by weakness class (configuration or grant vs unpatched defect), not as pass or
    fail.
  - Success rises roughly log-linearly with token budget at about $1 a sample. The verdict is
    therefore a property of model x budget x retries x parallelism, and a fixed-budget
    negative rules nothing out.
  - The benchmark saturated in about 2 months (56% -> 100%), so re-run on model release.
  - This dates the golden path's "what proves otherwise is usually an incident": a
    deliberate, public and contained test now exists. Single source (primary measurement);
    SandboxEval (lead L12) is the probe-list corroboration to read when forging.
- **5e. NEW TECHNIQUE in `unattended-run-isolation`: `checkout-configuration-is-code`**
  (SEA-046). A harness reads configuration from several scopes, and the checkout is one of
  them: project settings, hook declarations, tool-server manifests, endpoint overrides.
  Whoever wrote the repository wrote those.
  - NVD CVE-2026-21852, fetched in-run: a checked-in settings file pointed the credentialed
    API endpoint at an attacker, and requests went out before the trust prompt (CWE-522,
    CVSS v3.1 7.5). An unattended run has no trust prompt to outrun.
  - Before the agent starts:
    - ignore checkout-scope settings, or honour an allowlist of keys;
    - bind the credential to its destination outside the tree;
    - build the environment rather than inherit it.
  - It pairs with `confine-configured-output-paths` (where writes go); this technique is
    about where credentials go and what executes. The golden path's "operator's own
    configuration" bullet strips only the operator's scope.
  - Inference, not authorized: a run that commits a harness-config file opens a channel into
    the next run, so the landing gate should flag such diffs.
  - Single source plus the NVD primary. Links: `agent-cli-transport/subscription-auth-selection`,
    `credential-vault/brokered-egress`.
- **5f. AMEND `unattended-run-isolation` "Isolation is a claim to be tested": record
  custody.** A run must not be able to reach the record of what it did.
  - Logs inside the run's environment are testimony. Write the record that verdicts read
    from outside, continuously, and treat a gap in it as an event.
  - SEA-055: in-container logs were edited harmlessly because the transcripts came from
    another mechanism. Agents that reached the VM spoofed tool calls by intercepting the
    executor (~7% of transcripts, 96+ clear cases). When the executor is within reach,
    confirm effects from state, not from recorded output. Cross-link
    `deterministic-run-verification`.
  - SEA-023 adds two rules from code:
    - A host service the run can reach identifies the caller by the channel the host
      assigned (the source address on a per-run interface), and strips and overwrites any
      identity in the payload.
    - Host tools that parse run-produced bytes are jailed harder than the run (throwaway
      user, empty root, no network, a syscall filter). They read their verdict from a
      sentinel stream the tool cannot write, and a missing sentinel fails closed.
  - Last sentence: the record of an escape names the capability removed; restoring the
    reached thing is recovery, not prevention (SEA-055: new channels within a day of the
    wipe).
  - N2 may be a technique of its own ("inspecting a run's output is handling hostile
    input"). The forge decides.
  - Voices: METR/Redwood (measured), E2B (code). Corpus convergence: `audit-logging`
    tamper evidence.
- **5g. AMEND `eval-harness/candidate-write-access`.**
  - Question 1, "What can the candidate read?", extends to copies of the grading material
    hosted outside the harness, since a published suite's solutions live wherever it is
    distributed. SEA-044: access to five challenge and solution datasets was observed; the
    motive is inferred.
  - New question 6: **where does grading run, and what of the candidate is still alive
    there?** SEA-055: a watcher on the flag file reported scorer details to the other runs.
    Grade in a fresh environment built from the candidate's output, or end and verify every
    candidate-launched process first.
  - Two authors on one incident: facts corroborate, practice does not.
- **5h. TWO NEW TECHNIQUES in `agent-benchmark-design`** (3 techniques, below floor; SEA-045
  primary measurement, single source).
  - **`verify-the-intended-path`.** Outcome scoring (a secret beyond the property under
    test, exact-matched) makes the score unhackable and leaves the route open. There were 4
    unintended routes: two through harness provisioning, and two through a different defect
    of the same vintage that the pinned image carried (the model read the kernel version
    and took the cheaper exploit over the pre-compiled intended one). Verify the intended
    path per success, then either remove each discovered route or promote it to its own
    scenario.
  - **`segment-the-transcript-at-environment-death`.** In 100M-token runs the agent
    destroyed its own environment in 47-100% of failures (median onset 4-39% of turns), and
    everything after is re-prompt noise. The paper's own 35.6% refusal figure is largely a
    post-death artefact. Detect death deterministically by a terminal run of calls sharing
    one non-zero exit code matched against death signatures. Publish its rate, compute
    behavioural metrics on the live segment only, and change no score.
  - Anchors: §3.3, §5.1, §6.2; App. C.1-C.4, E.2.3, Table 3.
- **5i. AMEND `eval-harness/discriminating-task-selection`** (or `scenario-design`; the forge
  reads both): a solvability screen before an unattended run. A run given a task it cannot
  complete is the one that probes its boundary, so a suite containing unintentionally
  impossible tasks is an isolation stress test nobody scheduled. SEA-055: "Having an
  impossible task drives agents to explore widely for ways to cheat the scorer" (about 30-40%
  of targets). Single source. Do one primary fetch on impossible-task measurements when
  forging.
- **5j. AMEND `software-engineering/security/extension-trust/untrusted-extension-host/pluggable-isolation-runner`**
  (SEA-047): add a section, "Reach does not carry over either".
  - Each runner declares its isolation class beside its ceiling set: own kernel behind a
    monitor, mediating userspace kernel, shared kernel behind a filter, or same address
    space.
  - Startup confirms the declaration with a probe inside a fresh context that lists
    reachable primitive families and reads the filter on every thread, not only the leader.
  - An unconfirmed declaration is displayed as unverified.
  - Laws: `gate-sees-target`, `unknown-is-not-a-value`. This stays on the publication side
    of the golden path's "sandbox escape is not here" boundary.
- **5k. FORGE HANDOFF CANDIDATE (new software-engineering subject): microVM sandbox runtime**
  from `e2b-dev/infra` @ `d13ee7e`. The corpus does not model at least 3 load-bearing
  decisions:
  - host-side re-resolving egress proxy;
  - channel-assigned caller identity;
  - inspector jail stricter than the guest;
  - build-time kernel and VMM pin with within-line remap only.

  Auto mode never lands a new subject. An attended pass either runs `/forge` on the repo or
  folds the pieces into 5b, 5c and 5f and drops 5k.

## 6. Migrations on a live server: the lock wait, the deploy boundary, readers we do not deploy (software-engineering) - from SEC-040/041/042/043/053/054, 2026-09-28

**AUTO-BANKED, not operator-approved.** `/harvest auto` (run `hv-mig-0928`) banks content
here per the skill's Modes table; the next attended pass triages, then lands. Source note:
[[2026-09-28-se-migrations-harvest-batch-1]]. Every entry targets
`knowledge/software-engineering/backend-platform/data-layer/migrations/`; re-verify prior art
at body level before landing, since a sibling may have touched the subject since. Dedupe by
author: five publishers (GoCardless, GitLab, Braintree, Andrew Kane, Xata) plus Fowler and
Sadalage; GitLab and strong_migrations share a stack (Rails), so they are two voices on
engine-level claims and one voice on ORM-level ones. Engine verbs (`lock_timeout`,
`CONCURRENTLY`, `NOT VALID`, `ALGORITHM=INPLACE`) are stack-application material; every
rule below is written stack-neutral.

- **6a. NEW TECHNIQUE `migrations/<lock-bounded-ddl>`** (slug is the lander's). Five
  publishers converge; strong_migrations shows it holds on Postgres, MySQL and MariaDB.
  - *The step is priced by its wait, not its run time.* A request for a lock that
    conflicts with ordinary traffic joins a queue, and every later conflicting request
    queues behind it. A step that executes in milliseconds can stall a hot table for as
    long as it waits. Anchors: "The ALTER TABLE statement itself was fast to execute, but
    the effect of it waiting for an AccessExclusive lock on the referenced table caused
    the downtime" (SEC-054); "The lock request is waiting in a queue and it may also block
    other queries on the users table once it has been enqueued" (SEC-040); "if a migration
    can't acquire a lock in a timely manner, other statements won't be stuck behind it"
    (strong_migrations README:959).
  - *Bound every lock-taking step's wait,* scoped to the migrator and never to the server or
    the app: per session and restored afterwards (pg_ha_migrations
    `safe_statements.rb:772-814`, `LOCK_TIMEOUT_SECONDS = 5`; pgroll `roll.go:109-113`,
    500 ms default), or on the migrator's own database role behind a transaction-mode
    pooler, where a session setting does not stick (strong_migrations README:968-975). Two
    timeouts, not one: a short lock wait and a long statement timeout
    (strong_migrations README:959-1016). When the bound fires, the deploy fails and the
    application keeps serving: "It's better to abort a deploy than take your application
    down" (SEC-054).
  - *The footprint is every table the step's constraints reference,* and child partitions
    (SEC-054; strong_migrations README:308 "Adding a foreign key blocks writes on both
    tables", Postgres and MySQL messages alike; pg_ha_migrations `unsafe_statements.rb:146`,
    `safe_statements.rb:715-717`). A change to a cold, empty table can stall a hot one.
  - *One lock set per acquisition, up front, one deadline over it.* Take every lock the
    step needs at once, in the application's own order (referenced before referencing),
    under a single deadline, because per-object timeouts add up (pg_ha_migrations README:102
    "total lock time is additive", `safe_statements.rb:736-740`); refuse nested or
    escalating acquisition (`:688-699`); once held, do everything that needs the lock and
    nothing long (SEC-040).
  - *Retry, releasing first, and let the queue drain.* A timed-out attempt releases what it
    holds (pgroll rolls back the whole transaction before sleeping, `db.go:79-107`), then
    pauses "to allow potentially queued up queries to finish before continuing"
    (pg_ha_migrations `safe_statements.rb:750`). The retry unit equals the atomic unit, and
    a whole-step retry is refused once anything has committed (strong_migrations
    `checker.rb:92-96, 137`).
  - *The bound on retries is a total deadline, and it ends in a failed deploy.* **Stated
    disagreement, not resolved:** GitLab (a total budget ending in a final failure) and
    strong_migrations (count times delay, then re-raise, `checker.rb:132-146`) bound it;
    pg_ha_migrations (`until successfully_acquired_lock`, fixed 25 s) and pgroll (no count,
    no deadline, `db.go:38-106`) do not, so contention stalls the deploy with nobody told.
    The unbounded pair is the evidence for what the bound prevents.
  - *Pre-check before joining the queue.* Look for a long-running transaction holding a
    conflicting mode on the target tables and wait for it rather than queue behind it
    (pg_ha_migrations `blocking_database_transactions.rb:32-80`, by conflict mode, never
    cancelling the holder; GitLab halts on an anti-wraparound maintenance lock).
  - *When not:* a single-copy unattended store (the subject's default case: no concurrent
    load, nothing to bound); a table no live reader or writer reaches yet, which
    strong_migrations defines as "created in this migration, even after inserting data"
    (`checks.rb:151-153`); a stopped-process maintenance window. The lock level per verb
    varies by engine and version (PG 18 `ADD FOREIGN KEY` takes SHARE ROW EXCLUSIVE, which
    reads pass): look it up in the application layer, never in the technique.
- **6b. GOLDEN-PATH AMENDMENT `migrations.md`** ("The server case has one problem the
  harder case does not"). Replace "exactly one respect" with two: concurrent code versions
  AND concurrent load during the step. Qualify "a staging copy rehearsed it": a rehearsal
  without live load certifies the statement, not the wait. Anchors: "we re-ran the
  migrations against a backup of the database from earlier that day. They went through in
  a few hundred milliseconds" (SEC-054); pg_ha_migrations opens with the same two classes,
  "Database safety (e.g., long-held locks)" and "Application safety (e.g., dropping columns
  the app uses)" (README:34-38); GitLab measures slot budgets on a production-size copy and
  sets the gate below the budget because the copy runs fast. Link 6a from the section.
- **6c. DISCRIMINATOR on `techniques/error-propagation.md`.** Its rule "Retry *loops*
  within one boot are noise" is right for deterministic step failure and wrong for a
  lock-wait timeout on a server, which is transient contention. Scope the rule to the
  single-copy boot and point the server case at 6a's bounded retry. Anchored by four
  retrying implementations (GitLab, pg_ha_migrations, strong_migrations, pgroll). When not:
  unattended single-copy boots, where the existing rule stands.
- **6d. AMENDMENT `techniques/transactional-ddl.md`** (the unit shrinks on a live server).
  - *Online builds leave the transaction.* On a live table, request the engine's online
    build mode even though it cannot share the step's transaction ("Unlike CREATE INDEX,
    CREATE INDEX CONCURRENTLY must be performed outside a transaction", SEC-040;
    strong_migrations README:489-497). On MySQL/MariaDB the online algorithm is the default
    and DDL auto-commits, so the rule is "do not force a copy or a lock", not "leave the
    transaction" (README:749-799). The build then needs its own ledger boundary.
  - *Tension to resolve at landing:* pg_ha_migrations runs each statement in its own
    transaction because held locks add up (README:94-103), which moves the ledger bump
    outside the statement's transaction; the technique puts the bump inside the step's
    transaction. The lander decides whether "per step" becomes "per lock-taking statement,
    with residue covered by `idempotent-steps`" on a live server.
  - *Post-condition, not authorized by a source:* asserting the index exists and is valid
    after an online build is the corpus's own post-condition discipline. strong_migrations
    only drops a leftover invalid index on re-run, opt-in (`remove_invalid_indexes = false`,
    `checker.rb:282-296`). Land it as ours, if at all.
  - *When not:* a table no traffic reaches yet (6a's criterion); there the blocking build
    inside the transaction is simpler and correct.
- **6e. NEW TECHNIQUE, ONE VOICE `migrations/<deploy-relative-migration-slots>`.** Every
  server migration takes one of three slots: before deploy (fast, only the schema the new
  code needs), after deploy (cleanups, slow or non-critical builds, tightening
  constraints), background (data rewrites over budget, never schema: "Batched background
  migrations should not change the schema"). Each slot has a duration budget measured on a
  production-size copy, gated below the budget. A critical but slow change ships its code
  behind a switch that flips when completion is *observed* (`gate-sees-target`). When not:
  single-copy stores, where everything runs at boot behind the snapshot gate. **GitLab only
  (n=1):** the attended pass needs a second primary, or folds the slots into 6f.
- **6f. AMENDMENT `techniques/expand-deploy-contract.md`** (four clauses).
  - *Phases are deploy boundaries, not releases.* A release with pre- and post-deploy slots
    holds two boundaries, so under a roll-forward-only policy expand, deploy and contract
    can ship in one release, and a rename can too. Where rollback targets are kept, or where
    installs upgrade across versions and can merge steps, each phase needs its own release
    and the destructive step goes to a release no upgrade can merge with the earlier ones.
    **This conditions two corpus lines on the technique's own condition 2:** "There is no
    rename in this model - a rename is all three" (`migrations.md`) and "There is no rename
    in this discipline. A rename is three releases" (`expand-deploy-contract.md`). Anchor: "Following this procedure helps us to make sure
    there are no deployments to GitLab.com and upgrade processes for GitLab Self-Managed
    instances that lump together any of these steps" (SEC-040).
  - *Direction rule.* Relax a constraint before the code that relies on it ships; add one
    only after all code honours it: "Adding a NOT NULL constraint requires that any
    application changes are deployed first, so it should happen in a post-deployment
    migration. In contrary removing a NOT NULL constraint should be done in a regular
    migration" (SEC-040). strong_migrations shows the same ordering without stating it.
  - *Two-step constraint add, engine-conditional.* Generalize the uniqueness decomposition:
    where the engine can add a constraint unenforced for existing rows and validate it later
    under a weaker lock, do that, in a separate step from the one holding a write-blocking
    lock (strong_migrations `checks.rb:486-496`; pg_ha_migrations README:307-338; SEC-054).
    Where it cannot (MySQL/MariaDB check constraints: "Let us know if you have a safe way",
    README:411-413), the add is a blocking step that needs a window.
  - *"A new index" is expand-safe only when built online;* a drop that cascades to indexes
    is not online (pg_ha_migrations README:52; pgroll `op_create_index.go:36`). And some
    shape changes rewrite the table under lock while others are metadata-only, per engine
    and version (strong_migrations): the expand list should say which question to ask, and
    the application layer answers it.
- **6g. AMENDMENT `techniques/expand-deploy-contract.md`: readers outside the deployment
  inventory.**
  - *Rule:* when a reader of the shape does not ship from your inventory (another
    application, reports, extracts, hand-written SQL), compatibility lives in the store: a
    view under the old name, or triggers keeping the old column in sync. Code-side
    dual-write never reaches that reader. Anchor: "A transition phase is a period of time
    when the database supports both the old access pattern and the new ones simultaneously.
    This allows older systems time to migrate over to the new structures at their own pace"
    (SEC-043). pgroll is the working mechanism: version schemas of views, `up` and `down`
    triggers (`docs/concepts.md:19-25`).
  - *Contract safety can be observed, and the tool does not observe it.* Store-side
    compatibility makes every client declare its version (pgroll: the session
    `search_path`), so access to the old version is observable, from that declaration or
    from statement logs over a stated window. But pgroll's `Complete` drops the old version
    with no client check (`execute.go:173-193`), gated only by a docs Warning. The
    observation is the operator's job; say so.
  - *The window holds two versions.* One active migration per schema (`execute.go:62-68`)
    blocks the next schema change until old readers drain, which collides with the
    durable-queue case already in the technique ("for a durable queue that can be days").
    The shim carries a named removal date, set by the slowest consumer ("it may take years",
    SEC-043).
  - *Failure mode:* a client that never declares a version is served as the old version,
    silently (pgroll `clientapps.mdx`, "What happens if the search_path is not set?").
  - *It refines the cost line* "Three releases per shape change, and the middle one carries
    dual-write code": with a store-side shim, the app release carries no dual-write code.
  - *Discriminator:* does every reader of this table ship from a release you control and can
    list? Yes: code-side dual-write as written. No: a store-side shim plus an observed-usage
    gate. Corroboration owed: one database-refactoring primary on the view-based transition
    besides the tool.
- **6h. NEW TECHNIQUE `migrations/<migration-safety-gate>`** (or a section of 6a). The
  runner refuses DDL it cannot classify: every verb is labelled safe, unsafe or raw by its
  lock and application effect (pg_ha_migrations README:40-48, `unsafe_statements.rb:2-18`);
  an unsafe verb needs an explicit acknowledgement in the migration, raw SQL is refused
  unless acknowledged, and old steps are grandfathered (strong_migrations). The gate
  evaluates the production engine's version and effective timeout, not the development
  box's (strong_migrations README:1061-1071, `postgresql_adapter.rb:35-43`; an instance of
  `gate-sees-target`). GitLab enforces its rules through lint and a database reviewer, the
  review-time form of the same gate. When not: single-copy stores, where the
  snapshot-before-migrate contract is the guard.

  Auto mode never lands content. An attended pass lands 6a-6d and 6f-6g after re-verifying
  the anchors, and decides whether 6e and 6h stand alone or fold into 6a and 6f. Each landing
  owes an A/B evaluation per `.claude/skills/harvest/references/evaluation.md`.
