---
subject: client-state
domain: software-engineering
last_touched: 2026-09-05
touched_by: deepen
dry_streak: 0
---

# client-state

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: EXTENDS.

## State

6 -> 9 techniques, 2 -> 3 applications. Merged from FOUR independent scout proposals across four territories. One additive forward-pointer was added to an existing technique so the new write-path technique and the existing read-path guard do not read as rival owners.

## Open leads (banked, with return conditions)

- **the safe default is the failure you can see** (proposed law, not added). FIVE independent recurrences claimed, two of them in EXISTING techniques of this same subject (`persistence-and-migration`, `invalidation-strategy`). Tied with guard-failure-is-not-consent as the wave's best-evidenced proposal.

## Declines

- No application was written for `optimistic-write-path`. The source tree's entire optimistic-write API — mutex, compare-and-swap predicate, rollback — has zero call sites; the repo's own harness notes say so. Excellent material for a technique, but an application is a claim that a real stack realizes it in production, and unwired code is not that. The one place it is cited says plainly that it is unreferenced.

## 2026-08-29 — /deepen architecture batch (dry_streak 0)

10 techniques, 6→8 applications (rust--persistence-and-migration from personas — first
second stack; react--invalidation-strategy from systedo-case; ascent Tree B on
async-race-guards). Landed: replicated-record named as its own species (owned by
sync-replication); debounce/throttle excluded from the race-guard family; "invalidation
reaches readers, not only entries"; persistence version-skew split by payload class with
the older-build-never-writes-back invariant; paint-time revalidation cancel as
mitigation. Survived counter-evidence: per-entity mutation mutex, conditional revert,
derive-not-store, store-topology claims (atomic model = alternative realization, not
refutation). Banked: rust--status-fsms application from personas background_job.rs
(return: next round or when personas bumps the status vocabulary); retained-old-version
migration fixture (return: personas CURRENT_SCHEMA_VERSION bump). Techniques near
saturation; next yield expected from fleet deviations, not survey.

## 2026-08-31 — intake `github:TanStack/query` @ `1566c16d` ([[2026-08-31-tanstack-query]])

Gained `observed-read-subscription` + `next--observed-read-subscription`
(experiment, better, `structural-only`).

**The finding is an asymmetry, and the kind that survives a mature corpus.**
The golden path's "selective subscription" bullet models the **declared** form
— the consumer names the narrowest projection it reads — and the corpus had no
vocabulary for the **observed** form, where the framework records what was read
and infers the subscription. Both are legitimate; the observed form has failure
modes the declared form does not, and those are the technique. Neither the slug
map nor a summary could see this gap: the file genuinely covers the concept,
from one side only.

The sharpest rule is the fail-open: an **empty read set means unknown, not
"reads nothing"** (`unknown-is-not-a-value`), because a consumer that has not
yet rendered and one that reads nothing are indistinguishable at the check, and
getting it backwards means a consumer that never renders again.

Measured in `goat`: the explicit declaration appears **nowhere**, the lint
plugin is **not installed**, and the one known defeat sits in a shared wrapper
that spreads the tracked result — the propagation the technique predicts, in a
wrapper rather than a leaf. Blast radius honestly 2 consumers.

### Open lead

- **Install the lint rule** is a one-dependency repair in `goat` and would
  convert this application from a census into a standing gate. Sized and
  measured; the ask was not made at triage because the row named no project.

**Shipped** `goat` `d4995c3`: lint plugin installed, six rules at error/0 under
the project’s own severity policy. It found **three** violations where the
census predicted one — two `no-unstable-deps` the census was not hunting.
**The apply step corrected and amended the technique.** The flagged spread is on
an object that is already untracked; the real subscription cost is the
wrapper’s thirteen-field mapping one level up, which is deliberate good
practice and which **no linter can flag**. The technique gained the section
*A wrapper that normalizes the result destroys the observation*. That mapping
is NOT repaired — converting it to lazy getters is a public-interface change
and was outside this run’s authorization.

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

Four leads (personas, ascent). New technique `effect-identity-and-latched-callbacks`: the
dependency list is the identity of the session an effect starts; caller-supplied callbacks
are latched in a cell, never listed, or a poll that writes state restarts itself and resets
backoff and counters. Application `react--effect-identity-and-latched-callbacks` at ascent
`7ed00bb9`. Amendments: `identity-scoped-eviction` ("every trigger names its edge" - key a
reset on the return to empty); `persistence-and-migration` (a latch standing in for a
comparison does not earn persistence); `async-race-guards` (the append path of a paged list
shares the slot's token sequence). Weakest corroboration: the edge rule, by analogy only.
## 2026-09-01 - intake [[2026-09-01-matrix-rust-sdk]]

`optimistic-write-path` gained the stream-lane inversion: its "waiting on a
predecessor is not inheriting its failure" rule is the entity-lane half of a
boundary whose other half (a failed head blocks a stream lane) now lives in
delivery-guarantees/ordered-lane-blocking; the discriminating question is on
both sides. Plus the id-less equality clause: local items compare by their
local state stamp, never by the absence of a server id. Applied at
`simulation` against a fleet conversation queue (react application, better):
the drain fired on a `finally` that could not tell success from failure.
Golden path untouched this run - it carried a sibling's uncommitted technique.


## 2026-09-02 - intake (dora, run intake-dora-0902)

`persistence-and-migration` gained two clauses under "The versioned
shape": the encoding decides what a shape change is (keyed encodings
tolerate optional additions under one version; positional encodings have
no additive change, and a wire carrying one negotiates the version in
both directions because a positional misparse is silent); and a version
that has covered two shapes is retired by bumping past it and refusing it
wholesale, never reinterpreted by a cleverer reader. Source: a changelog
that walked the failure three times (a field added without a bump under a
positional format, decode failures swallowed as warnings, terminal records
vanishing from listings; then a barrier field; then an encoding change with
a handshake version). New application `next--persistence-and-migration`
(simulation, better, structural-only) against a step store whose shape
policy is honest only because its encoding is keyed and whose
"every field optional" clause nothing enforces; next change filed as a
fifth policy rule plus a type-level test.

## 2026-09-05 - /deepen batch (dry_streak 0)

12 techniques, 12 -> 13 applications (`rust--status-fsms` from a fleet desktop
backend's job-lifecycle module - the banked lead's return condition fired: the tree
added a typed job status on 2026-09-04). Two 2026-08-18 applications re-witnessed
at react@19; the react--status-fsms "known gap" (no latest-wins token) had closed
in-tree 2026-08-29/30 and was replaced by a live defect the new correction names.

Landed: status-fsms - `stale` must carry the failed reload's evidence (blind-only
self-contradiction with the failure-not-empty-success law; web confirmed the
two-axis model); persistence-and-migration - middleware version-skew corrected to the
two real shapes (migrate-everything-and-write-back vs adopt-future-unchanged);
optimistic-write-path - settle-time invalidate as a bounded-damage alternative with
its count-not-mutex limit; async-race-guards - dedup key is canonical, not only
complete; rehydration-narrowing - "narrower = default" predicated on the default
being the tightest member; invalidation floor "minutes not seconds" predicated, and
the conditional-request qualifier on "maximal load"; singleton-lifecycle - the
bundler's per-module carry-over object; effect-identity - compiler memoization is an
optimization the runtime may discard, not a correctness guarantee.

Lane 2 refuted or predicated 4 absolutes/numbers; counter-evidence confirmed 8 (the
never-a-timestamp token rule against clock coarsening; settlement removes the dedup
entry; abort advisory; first-class non-reactive handler now stable upstream).
Blind lane 9 of 14 reached by web/tree; blind-only items were both internal.

Fleet: personas seam text item 1 (scene store, no latest-wins) is stale - closed in
tree; items 2-5 stand (6/7 persisted stores lack version+migrate; 6/8 global owners
lack hatches; envelope hand-parsed; 89 storage keys, 8 prefixes, no registry). The
one recorded deviation is on personas-web, not on this machine. tracklight's two
contexts are storage crates - scan noise for this subject.

Banked (return conditions): retained-old-version migration fixture - personas
CURRENT_SCHEMA_VERSION still 1 (when it bumps); gcTime-vs-staleTime two-timer
amendment to invalidation-strategy (a fleet tree setting both deliberately);
JobStatus four-state repair in personas - 52 literal writes, 2 typed sites (any
personas run authorized to edit); ascent react--effect-identity note on the stable
non-reactive handler (next drift pass on that application).

Proposals (Director-held): "the safe default is the failure you can see" - six
in-subject sightings now, rehydration correction rests on it; still a proposal for
`_laws.md`, operator call. URL-addressed state as a fourth species (home-ambiguous,
no routing subject in the bundle). Tear-safe external-store reads (web only, no
fleet sighting - not a technique until a tree shows it). Credential refresh that
changes claims as a partial identity flip (training-data only).

Prior prediction ("yield from fleet deviations, not survey") held.

### Impact (registry map, regenerated 2026-09-05 after this landing)

Judged verdicts now stale against this subject's digest: personas 3 contexts (the
three `conformant` verdicts of 2026-08-30). Every other joined project (tracklight 2,
goat 3, grant 1, politicas 1, kp 1, ascent 1) carries only `unknown` pairs - never
judged, so nothing to re-judge. Added after the checkout was declared (same day):
personas-web 3 stale verdicts, including its one `deviation` and one `conformant`.
`/conform --stale` queue: personas, personas-web.

## 2026-10-31 - architecture review (first record)

State before: pending. All 26 documents decided. The 2026-09-05 deepen claims that rested on external software (persistence middleware shapes, query-cache error-with-data, optimistic cancel and isMutating gate, the HMR carry-over object, the stable non-reactive handler) were re-read at source and hold. Five clarify items: two technique refinements from primary sources (observed-read-subscription, effect-identity), the banked react--effect-identity note, and two internal inconsistencies in applications.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/client-state",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:b667f5c1f4abdd9d",
  "disposition": "clarify",
  "coverage": "All 26 documents read in full (golden path, 12 techniques, 13 applications); every relative link resolves. Six primary sources opened for the unstable claims (persistence middleware, query-cache notify and error-with-data, concurrent optimistic updates, HMR data object, Effect Events, useMemo contract). Not evaluated: any connected-project tree or runtime; every application witness is taken as dated and was not re-executed, so no verified_on moved.",
  "counterexamples": [
    "A persistence middleware that checks only version inequality runs a future payload through the forward migrate and writes it back, so a rollback loses data even where a migrate function exists.",
    "A configuration-implied notification need not enter the tracked set: a fetch layer can check it as a separate condition, so an audit looking for the union finds nothing and wrongly concludes the case is unhandled.",
    "An Effect Event cannot be passed to a child or another hook, so \"prefer the first-class handler\" cannot replace a cell whose value is handed onward.",
    "Refs and a state setter passed as props are already stable; listing them in the dependency array would not restart the session, so the restart loop needs a re-created argument, not merely a listed one."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/pmndrs/zustand/main/src/middleware/persist.ts",
      "result": "Confirms: version !== options.version routes any mismatch, future included, through migrate; no migrate logs \"couldn't be migrated since no migrate function was provided\" and discards; migrated state is written back via setItem."
    },
    {
      "url": "https://raw.githubusercontent.com/rt2zz/redux-persist/master/src/createMigrate.ts",
      "result": "Confirms: inboundVersion > currentVersion logs \"redux-persist: downgrading version is not supported\" and returns Promise.resolve(state) unchanged."
    },
    {
      "url": "https://raw.githubusercontent.com/TanStack/query/main/packages/query-core/src/queryObserver.ts",
      "result": "Confirms both fail-open guards (no prevResult -> notify; empty trackedProps without declaration -> notify) and the proxy read trap; isRefetchError = isError && hasData. Refines: throwOnError is an extra notify condition, not a union into the tracked set."
    },
    {
      "url": "https://tanstack.com/query/latest/docs/eslint/no-rest-destructuring",
      "result": "Confirms the spread hazard: rest destructuring \"automatically subscribes to every field of the query result\"."
    },
    {
      "url": "https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query",
      "result": "Confirms paint-time cancelQueries and settlement invalidation gated on isMutating === 1."
    },
    {
      "url": "https://vite.dev/guide/api-hmr",
      "result": "Confirms hot.data \"is persisted across successive instances of the same module during HMR\"."
    },
    {
      "url": "https://react.dev/blog/2025/10/01/react-19-2",
      "result": "useEffectEvent listed under New React Features in 19.2; \"Effect Events should not be declared in the dependency array\"; roomId/theme example supports the session-identity reading."
    },
    {
      "url": "https://react.dev/reference/react/useEffectEvent",
      "result": "Restriction: \"can only be called from inside Effects or other Effect Events. Do not call them during rendering or pass them to other components or Hooks.\""
    },
    {
      "url": "https://react.dev/reference/react/useMemo",
      "result": "Supports the memoization claim: \"a performance optimization, not a semantic guarantee, React may throw away the cached value\"."
    }
  ],
  "documents": {
    "client-state.md": {
      "disposition": "keep",
      "reason": "Species classification, slice composition, FSM, race guards, optimistic path, persistence, narrowing, invalidation, eviction, singleton and effect-identity sections each delegate to an owning technique; every relative link resolves. The unqualified \"maximal load\" for primary polling is a summary of the technique, which carries the conditional-request qualifier. The proposed law \"the safe default is the failure you can see\" stays an operator call, not a golden-path edit."
    },
    "techniques/store-slicing.md": {
      "disposition": "keep",
      "reason": "Domain-of-change boundary test, slice-owned writes, writer-side reference stability and the three cross-slice patterns are internally consistent and correctly hand remediation to store-dependency-topology."
    },
    "techniques/store-dependency-topology.md": {
      "disposition": "keep",
      "reason": "Manifest properties, derived order (count sort is not a topological sort), the check-must-run rule and the discriminated accessor answer are sound; the half-dozen threshold is stated as judgement, with three observable signals."
    },
    "techniques/status-fsms.md": {
      "disposition": "keep",
      "reason": "Canonical state set, failure-lands-by-data-presence, stale carries the failed reload's evidence. The two-axis claim is confirmed upstream: TanStack Query's observer exposes isRefetchError = isError && hasData, i.e. an error and held data at once."
    },
    "techniques/async-race-guards.md": {
      "disposition": "keep",
      "reason": "Token minted before dispatch, inert stale completions, append path shares the slot sequence, debounce excluded from the family, canonical dedup key, removal on failure. No unstable external claim."
    },
    "techniques/optimistic-write-path.md": {
      "disposition": "keep",
      "reason": "Confirmed against the primary practitioner source for the mainstream cache layer: cancelQueries in onMutate \"aborts all currently running queries that could interfere with our optimistic update\", and invalidation is skipped unless isMutating is 1 (\"only ... if there's no other mutation in-flight\"). The technique's \"a count, not a mutex\" reading matches."
    },
    "techniques/persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "The load-bearing middleware claim is confirmed at source. Zustand persist: version !== options.version (no direction check) routes a future payload through migrate, discards it when no migrate is supplied, and writes the migrated result back with setItem. redux-persist createMigrate: inboundVersion > currentVersion logs \"downgrading version is not supported\" and returns Promise.resolve(state) unchanged. Both shapes as described."
    },
    "techniques/rehydration-narrowing.md": {
      "disposition": "keep",
      "reason": "Direction rule with the widest-default predicate, whole-tuple-or-coerce, vocabulary-validates-itself, per-field guards, policy at hydration, throw vs refuse split. Internally consistent with persistence-and-migration and identity-scoped-eviction."
    },
    "techniques/invalidation-strategy.md": {
      "disposition": "keep",
      "reason": "Freshness hierarchy, demoted floor with the named live-figure exception, conditional-request qualifier (a 304 saves the body, not the round trip), readers-not-only-entries, scoped refresh failure. Sound."
    },
    "techniques/identity-scoped-eviction.md": {
      "disposition": "keep",
      "reason": "One owner below both layers, enumerated triggers with the credential-refresh exclusion, return-to-empty edge rule, wipe-everything asymmetry, persisted stores, network-independent local wipe. Sound."
    },
    "techniques/singleton-lifecycle.md": {
      "disposition": "keep",
      "reason": "Ladder (refcount, generation token, global slot) and inertness-over-prevention are sound. The per-module carry-over object is confirmed: Vite documents hot.data as \"persisted across successive instances of the same module during HMR\"."
    },
    "techniques/observed-read-subscription.md": {
      "disposition": "clarify",
      "reason": "Both fail-open guards are confirmed in TanStack Query's shouldNotifyListeners (\"if (!prevResult) return true\"; an empty trackedProps with no declaration notifies on any change), and the lint rationale is confirmed (rest destructuring \"automatically subscribes to every field\"). One refinement: upstream realizes the configuration-implied case for throwOnError not by unioning \"error\" into the tracked set but as a separate notify condition (throwOnError && error changed). The section should admit either realization so a reader does not look for a union that is not there."
    },
    "techniques/effect-identity-and-latched-callbacks.md": {
      "disposition": "clarify",
      "reason": "Session-identity reading is confirmed by the framework's own example (roomId in the list, theme read through an Effect Event). The memoization claim is supported by the useMemo docs (\"a performance optimization, not a semantic guarantee, React may throw away the cached value\"). Owed: the first-class non-reactive handler, shipped in React 19.2 as useEffectEvent, carries a restriction the technique does not state - \"Effect Events can only be called from inside Effects or other Effect Events. Do not call them during rendering or pass them to other components or Hooks.\" So a callback that must be handed onward still needs the plain cell."
    },
    "applications/react--singleton-lifecycle.md": {
      "disposition": "keep",
      "reason": "Rung mapping, the reset-hatch census (19 hatches, 2 of 7 global-slot owners) and the realm boundary are specific and cited at ee124810f. Private tree not reopened; verified_on unchanged."
    },
    "applications/react--status-fsms.md": {
      "disposition": "keep",
      "reason": "Keyed-machine and state-set halves cited at ee124810f; the stale-without-evidence gap matches the technique clause it motivated; the previously reported latest-wins gap is recorded as closed with commits. Not re-executed."
    },
    "applications/rust--status-fsms.md": {
      "disposition": "keep",
      "reason": "Literal-write census is arithmetically consistent (13+9+11+19 = 52 literal sites vs 2 enum sites); the cancel_outcome evidence axis and the upsert-mints-a-row finding are specific. Not re-executed."
    },
    "applications/react--effect-identity-and-latched-callbacks.md": {
      "disposition": "clarify",
      "reason": "Banked from the 2026-09-05 note: the tree pins react 19.2.4, which ships useEffectEvent, and the application never says so. Also the omitted dependencies are refs and a state setter, identities React already keeps stable, so the counterfactual restart applies only to re-created arguments; worth one sentence. Tree not reopened."
    },
    "applications/react--async-race-guards.md": {
      "disposition": "clarify",
      "reason": "Internal inconsistency with the sibling react--status-fsms application: this document's \"guards families, not entities\" and \"no in-flight deduplication was added\" limits are presented as current, while the sibling's 2026-09-05 re-verification records commit 3aba78285 (2026-08-30) adding a per-project keyed slot for invalidateScans and an in-flight registry for the argument-less loads. Add a dated pointer; the tree itself was not reopened."
    },
    "applications/next--observed-read-subscription.md": {
      "disposition": "clarify",
      "reason": "Carries two \"## Return condition\" headings; the first (\"Install the lint rule\") was met by the Shipped section (d4995c3) and now reads as still open. Mark it met so only the getter conversion reads as owed."
    },
    "applications/rust--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Document-vs-state payload split is the source of the technique's clause and is consistent with it; both resolved notes (3ed7a9675, e52dc8e02) are dated. Zero-step migration chain gap stays open by design. Not re-executed."
    },
    "applications/react--store-dependency-topology.md": {
      "disposition": "keep",
      "reason": "Findings are specific and line-cited (count sort masked by a stable sort on equal counts; assertion on an unimported module). Provenance gap: no tree commit is pinned, only verified_on; pin one on the next drift pass."
    },
    "applications/react--invalidation-strategy.md": {
      "disposition": "keep",
      "reason": "Readers-not-subscribed defect and the subscriber-registry fix are consistent with the technique; limits are honest (one mutation source, no test pins the push)."
    },
    "applications/react--identity-scoped-eviction.md": {
      "disposition": "keep",
      "reason": "Owner, triggers, refresh exclusion and network-independent wipe are cited. Minor: \"the six stores the owner clears\" predates or ignores the resolved incidents-filter addition, and no tree commit is pinned; recount and pin on the next drift pass. Not changed here because the tree was not reopened."
    },
    "applications/next--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Three-case simulation is honest about falsifiers and about being structural-only; matches the encoding and retired-version clauses."
    },
    "applications/react--optimistic-write-path.md": {
      "disposition": "keep",
      "reason": "Thin seam document that defers verdict and evidence to the delivery-guarantees application; link resolves; limits stated."
    },
    "applications/react--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Backward-skew A/B with byte-identical outcome under B; limits (no disclosure consumer, convention-only single author) stated."
    }
  }
}
```

## 2026-10-31 - architecture review, re-record after apply

The five clarify items of the record above were applied minimally in each document's own voice; this record is against the new digest. No other document changed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/client-state",
  "date": "2026-10-31",
  "baseline": "8d20ba827",
  "digest": "sha256-b2:9b7a96e67d0d158a",
  "disposition": "keep",
  "coverage": "Second record after applying the five clarify items of the first 2026-10-31 record. All 26 documents carried; only the five edited documents changed. No verified_on date moved; no connected-project tree was reopened.",
  "counterexamples": [
    "A persistence middleware that checks only version inequality runs a future payload through the forward migrate and writes it back, so a rollback loses data even where a migrate function exists.",
    "A configuration-implied notification need not enter the tracked set: a fetch layer can check it as a separate condition, so an audit looking for the union finds nothing and wrongly concludes the case is unhandled.",
    "An Effect Event cannot be passed to a child or another hook, so \"prefer the first-class handler\" cannot replace a cell whose value is handed onward.",
    "Refs and a state setter passed as props are already stable; listing them in the dependency array would not restart the session, so the restart loop needs a re-created argument, not merely a listed one."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/pmndrs/zustand/main/src/middleware/persist.ts",
      "result": "Confirms: version !== options.version routes any mismatch, future included, through migrate; no migrate logs \"couldn't be migrated since no migrate function was provided\" and discards; migrated state is written back via setItem."
    },
    {
      "url": "https://raw.githubusercontent.com/rt2zz/redux-persist/master/src/createMigrate.ts",
      "result": "Confirms: inboundVersion > currentVersion logs \"redux-persist: downgrading version is not supported\" and returns Promise.resolve(state) unchanged."
    },
    {
      "url": "https://raw.githubusercontent.com/TanStack/query/main/packages/query-core/src/queryObserver.ts",
      "result": "Confirms both fail-open guards (no prevResult -> notify; empty trackedProps without declaration -> notify) and the proxy read trap; isRefetchError = isError && hasData. Refines: throwOnError is an extra notify condition, not a union into the tracked set."
    },
    {
      "url": "https://tanstack.com/query/latest/docs/eslint/no-rest-destructuring",
      "result": "Confirms the spread hazard: rest destructuring \"automatically subscribes to every field of the query result\"."
    },
    {
      "url": "https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query",
      "result": "Confirms paint-time cancelQueries and settlement invalidation gated on isMutating === 1."
    },
    {
      "url": "https://vite.dev/guide/api-hmr",
      "result": "Confirms hot.data \"is persisted across successive instances of the same module during HMR\"."
    },
    {
      "url": "https://react.dev/blog/2025/10/01/react-19-2",
      "result": "useEffectEvent listed under New React Features in 19.2; \"Effect Events should not be declared in the dependency array\"; roomId/theme example supports the session-identity reading."
    },
    {
      "url": "https://react.dev/reference/react/useEffectEvent",
      "result": "Restriction: \"can only be called from inside Effects or other Effect Events. Do not call them during rendering or pass them to other components or Hooks.\""
    },
    {
      "url": "https://react.dev/reference/react/useMemo",
      "result": "Supports the memoization claim: \"a performance optimization, not a semantic guarantee, React may throw away the cached value\"."
    }
  ],
  "documents": {
    "client-state.md": {
      "disposition": "keep",
      "reason": "Species classification, slice composition, FSM, race guards, optimistic path, persistence, narrowing, invalidation, eviction, singleton and effect-identity sections each delegate to an owning technique; every relative link resolves. The unqualified \"maximal load\" for primary polling is a summary of the technique, which carries the conditional-request qualifier. The proposed law \"the safe default is the failure you can see\" stays an operator call, not a golden-path edit."
    },
    "techniques/store-slicing.md": {
      "disposition": "keep",
      "reason": "Domain-of-change boundary test, slice-owned writes, writer-side reference stability and the three cross-slice patterns are internally consistent and correctly hand remediation to store-dependency-topology."
    },
    "techniques/store-dependency-topology.md": {
      "disposition": "keep",
      "reason": "Manifest properties, derived order (count sort is not a topological sort), the check-must-run rule and the discriminated accessor answer are sound; the half-dozen threshold is stated as judgement, with three observable signals."
    },
    "techniques/status-fsms.md": {
      "disposition": "keep",
      "reason": "Canonical state set, failure-lands-by-data-presence, stale carries the failed reload's evidence. The two-axis claim is confirmed upstream: TanStack Query's observer exposes isRefetchError = isError && hasData, i.e. an error and held data at once."
    },
    "techniques/async-race-guards.md": {
      "disposition": "keep",
      "reason": "Token minted before dispatch, inert stale completions, append path shares the slot sequence, debounce excluded from the family, canonical dedup key, removal on failure. No unstable external claim."
    },
    "techniques/optimistic-write-path.md": {
      "disposition": "keep",
      "reason": "Confirmed against the primary practitioner source for the mainstream cache layer: cancelQueries in onMutate \"aborts all currently running queries that could interfere with our optimistic update\", and invalidation is skipped unless isMutating is 1 (\"only ... if there's no other mutation in-flight\"). The technique's \"a count, not a mutex\" reading matches."
    },
    "techniques/persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "The load-bearing middleware claim is confirmed at source. Zustand persist: version !== options.version (no direction check) routes a future payload through migrate, discards it when no migrate is supplied, and writes the migrated result back with setItem. redux-persist createMigrate: inboundVersion > currentVersion logs \"downgrading version is not supported\" and returns Promise.resolve(state) unchanged. Both shapes as described."
    },
    "techniques/rehydration-narrowing.md": {
      "disposition": "keep",
      "reason": "Direction rule with the widest-default predicate, whole-tuple-or-coerce, vocabulary-validates-itself, per-field guards, policy at hydration, throw vs refuse split. Internally consistent with persistence-and-migration and identity-scoped-eviction."
    },
    "techniques/invalidation-strategy.md": {
      "disposition": "keep",
      "reason": "Freshness hierarchy, demoted floor with the named live-figure exception, conditional-request qualifier (a 304 saves the body, not the round trip), readers-not-only-entries, scoped refresh failure. Sound."
    },
    "techniques/identity-scoped-eviction.md": {
      "disposition": "keep",
      "reason": "One owner below both layers, enumerated triggers with the credential-refresh exclusion, return-to-empty edge rule, wipe-everything asymmetry, persisted stores, network-independent local wipe. Sound."
    },
    "techniques/singleton-lifecycle.md": {
      "disposition": "keep",
      "reason": "Ladder (refcount, generation token, global slot) and inertness-over-prevention are sound. The per-module carry-over object is confirmed: Vite documents hot.data as \"persisted across successive instances of the same module during HMR\"."
    },
    "techniques/observed-read-subscription.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the configuration-implied section now admits the extra-notify-condition realization beside the union, as the mainstream fetch layer does for its throw-on-error flag"
    },
    "techniques/effect-identity-and-latched-callbacks.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the first-class-handler sentence now states its call-site restriction and that a value handed onward stays in a plain cell"
    },
    "applications/react--singleton-lifecycle.md": {
      "disposition": "keep",
      "reason": "Rung mapping, the reset-hatch census (19 hatches, 2 of 7 global-slot owners) and the realm boundary are specific and cited at ee124810f. Private tree not reopened; verified_on unchanged."
    },
    "applications/react--status-fsms.md": {
      "disposition": "keep",
      "reason": "Keyed-machine and state-set halves cited at ee124810f; the stale-without-evidence gap matches the technique clause it motivated; the previously reported latest-wins gap is recorded as closed with commits. Not re-executed."
    },
    "applications/rust--status-fsms.md": {
      "disposition": "keep",
      "reason": "Literal-write census is arithmetically consistent (13+9+11+19 = 52 literal sites vs 2 enum sites); the cancel_outcome evidence axis and the upsert-mints-a-row finding are specific. Not re-executed."
    },
    "applications/react--effect-identity-and-latched-callbacks.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a closing note that the pinned React ships the first-class handler, that the omitted values here are already-stable refs and a setter, and that the handler's call-site restriction is why a ref stays the right home for the caller-owned cells"
    },
    "applications/react--async-race-guards.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a dated note under the limits pointing to the later per-project keyed slot and in-flight registry as recorded by the status-fsms application's 2026-09-05 re-verification"
    },
    "applications/next--observed-read-subscription.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the first return-condition heading is marked met by the shipped lint gate"
    },
    "applications/rust--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Document-vs-state payload split is the source of the technique's clause and is consistent with it; both resolved notes (3ed7a9675, e52dc8e02) are dated. Zero-step migration chain gap stays open by design. Not re-executed."
    },
    "applications/react--store-dependency-topology.md": {
      "disposition": "keep",
      "reason": "Findings are specific and line-cited (count sort masked by a stable sort on equal counts; assertion on an unimported module). Provenance gap: no tree commit is pinned, only verified_on; pin one on the next drift pass."
    },
    "applications/react--invalidation-strategy.md": {
      "disposition": "keep",
      "reason": "Readers-not-subscribed defect and the subscriber-registry fix are consistent with the technique; limits are honest (one mutation source, no test pins the push)."
    },
    "applications/react--identity-scoped-eviction.md": {
      "disposition": "keep",
      "reason": "Owner, triggers, refresh exclusion and network-independent wipe are cited. Minor: \"the six stores the owner clears\" predates or ignores the resolved incidents-filter addition, and no tree commit is pinned; recount and pin on the next drift pass. Not changed here because the tree was not reopened."
    },
    "applications/next--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Three-case simulation is honest about falsifiers and about being structural-only; matches the encoding and retired-version clauses."
    },
    "applications/react--optimistic-write-path.md": {
      "disposition": "keep",
      "reason": "Thin seam document that defers verdict and evidence to the delivery-guarantees application; link resolves; limits stated."
    },
    "applications/react--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Backward-skew A/B with byte-identical outcome under B; limits (no disclosure consumer, convention-only single author) stated."
    }
  }
}
```

## 2026-10-31 - architecture review, after re-verification against personas

This record follows the re-verification of the four personas applications against personas@61029d7ae0. The trees were reopened at their pinned commits and at HEAD. Every other document carries its prior disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/client-state",
  "date": "2026-10-31",
  "baseline": "2a7424170",
  "digest": "sha256-b2:ce3e09e5bbef4a25",
  "disposition": "clarify",
  "coverage": "Third record of 2026-10-31. The four personas applications (react--async-race-guards, react--singleton-lifecycle, react--status-fsms, rust--status-fsms) were re-checked citation by citation, both at their pinned commits (bf2a1e249, ee124810f) and at personas HEAD 61029d7ae0. Each got a dated Re-checked 2026-10-31 section, and no measured result was rewritten. verified_on moved to 2026-10-31 for react--status-fsms and rust--status-fsms only. async-race-guards Tree B (af251109) is not in this checkout, and the singleton hatch count of 19 could not be reproduced. The other 22 documents carry their dispositions from the prior record unchanged.",
  "counterexamples": [
    "A persistence middleware that checks only version inequality runs a future payload through the forward migrate and writes it back, so a rollback loses data even where a migrate function exists.",
    "A configuration-implied notification need not enter the tracked set: a fetch layer can check it as a separate condition, so an audit looking for the union finds nothing and wrongly concludes the case is unhandled.",
    "An Effect Event cannot be passed to a child or another hook, so \"prefer the first-class handler\" cannot replace a cell whose value is handed onward.",
    "Refs and a state setter passed as props are already stable; listing them in the dependency array would not restart the session, so the restart loop needs a re-created argument, not merely a listed one."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/pmndrs/zustand/main/src/middleware/persist.ts",
      "result": "Confirms: version !== options.version routes any mismatch, future included, through migrate; no migrate logs \"couldn't be migrated since no migrate function was provided\" and discards; migrated state is written back via setItem."
    },
    {
      "url": "https://raw.githubusercontent.com/rt2zz/redux-persist/master/src/createMigrate.ts",
      "result": "Confirms: inboundVersion > currentVersion logs \"redux-persist: downgrading version is not supported\" and returns Promise.resolve(state) unchanged."
    },
    {
      "url": "https://raw.githubusercontent.com/TanStack/query/main/packages/query-core/src/queryObserver.ts",
      "result": "Confirms both fail-open guards (no prevResult -> notify; empty trackedProps without declaration -> notify) and the proxy read trap; isRefetchError = isError && hasData. Refines: throwOnError is an extra notify condition, not a union into the tracked set."
    },
    {
      "url": "https://tanstack.com/query/latest/docs/eslint/no-rest-destructuring",
      "result": "Confirms the spread hazard: rest destructuring \"automatically subscribes to every field of the query result\"."
    },
    {
      "url": "https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query",
      "result": "Confirms paint-time cancelQueries and settlement invalidation gated on isMutating === 1."
    },
    {
      "url": "https://vite.dev/guide/api-hmr",
      "result": "Confirms hot.data \"is persisted across successive instances of the same module during HMR\"."
    },
    {
      "url": "https://react.dev/blog/2025/10/01/react-19-2",
      "result": "useEffectEvent listed under New React Features in 19.2; \"Effect Events should not be declared in the dependency array\"; roomId/theme example supports the session-identity reading."
    },
    {
      "url": "https://react.dev/reference/react/useEffectEvent",
      "result": "Restriction: \"can only be called from inside Effects or other Effect Events. Do not call them during rendering or pass them to other components or Hooks.\""
    },
    {
      "url": "https://react.dev/reference/react/useMemo",
      "result": "Supports the memoization claim: \"a performance optimization, not a semantic guarantee, React may throw away the cached value\"."
    }
  ],
  "documents": {
    "client-state.md": {
      "disposition": "keep",
      "reason": "Species classification, slice composition, FSM, race guards, optimistic path, persistence, narrowing, invalidation, eviction, singleton and effect-identity sections each delegate to an owning technique; every relative link resolves. The unqualified \"maximal load\" for primary polling is a summary of the technique, which carries the conditional-request qualifier. The proposed law \"the safe default is the failure you can see\" stays an operator call, not a golden-path edit."
    },
    "techniques/store-slicing.md": {
      "disposition": "keep",
      "reason": "Domain-of-change boundary test, slice-owned writes, writer-side reference stability and the three cross-slice patterns are internally consistent and correctly hand remediation to store-dependency-topology."
    },
    "techniques/store-dependency-topology.md": {
      "disposition": "keep",
      "reason": "Manifest properties, derived order (count sort is not a topological sort), the check-must-run rule and the discriminated accessor answer are sound; the half-dozen threshold is stated as judgement, with three observable signals."
    },
    "techniques/status-fsms.md": {
      "disposition": "keep",
      "reason": "Canonical state set, failure-lands-by-data-presence, stale carries the failed reload's evidence. The two-axis claim is confirmed upstream: TanStack Query's observer exposes isRefetchError = isError && hasData, i.e. an error and held data at once."
    },
    "techniques/async-race-guards.md": {
      "disposition": "keep",
      "reason": "Token minted before dispatch, inert stale completions, append path shares the slot sequence, debounce excluded from the family, canonical dedup key, removal on failure. No unstable external claim."
    },
    "techniques/optimistic-write-path.md": {
      "disposition": "keep",
      "reason": "Confirmed against the primary practitioner source for the mainstream cache layer: cancelQueries in onMutate \"aborts all currently running queries that could interfere with our optimistic update\", and invalidation is skipped unless isMutating is 1 (\"only ... if there's no other mutation in-flight\"). The technique's \"a count, not a mutex\" reading matches."
    },
    "techniques/persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "The load-bearing middleware claim is confirmed at source. Zustand persist: version !== options.version (no direction check) routes a future payload through migrate, discards it when no migrate is supplied, and writes the migrated result back with setItem. redux-persist createMigrate: inboundVersion > currentVersion logs \"downgrading version is not supported\" and returns Promise.resolve(state) unchanged. Both shapes as described."
    },
    "techniques/rehydration-narrowing.md": {
      "disposition": "keep",
      "reason": "Direction rule with the widest-default predicate, whole-tuple-or-coerce, vocabulary-validates-itself, per-field guards, policy at hydration, throw vs refuse split. Internally consistent with persistence-and-migration and identity-scoped-eviction."
    },
    "techniques/invalidation-strategy.md": {
      "disposition": "keep",
      "reason": "Freshness hierarchy, demoted floor with the named live-figure exception, conditional-request qualifier (a 304 saves the body, not the round trip), readers-not-only-entries, scoped refresh failure. Sound."
    },
    "techniques/identity-scoped-eviction.md": {
      "disposition": "keep",
      "reason": "One owner below both layers, enumerated triggers with the credential-refresh exclusion, return-to-empty edge rule, wipe-everything asymmetry, persisted stores, network-independent local wipe. Sound."
    },
    "techniques/singleton-lifecycle.md": {
      "disposition": "keep",
      "reason": "Ladder (refcount, generation token, global slot) and inertness-over-prevention are sound. The per-module carry-over object is confirmed: Vite documents hot.data as \"persisted across successive instances of the same module during HMR\"."
    },
    "techniques/observed-read-subscription.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the configuration-implied section now admits the extra-notify-condition realization beside the union, as the mainstream fetch layer does for its throw-on-error flag"
    },
    "techniques/effect-identity-and-latched-callbacks.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the first-class-handler sentence now states its call-site restriction and that a value handed onward stays in a plain cell"
    },
    "applications/react--singleton-lifecycle.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31, anchors hold at ee124810f. The dated note covers the HEAD drift: the rung-1 ticker now installs an unremoved module-scope visibilitychange listener (a leak, not a misfire), the census rule moved to rules.json (baseline 14 at the pin, 12 at HEAD), and fleetSlice gained a hatch. The 19-hatch count is not reproducible under a plain predicate, so verified_on is unchanged."
    },
    "applications/react--status-fsms.md": {
      "disposition": "clarify",
      "reason": "Re-verified 2026-10-31. Every citation resolves, and verified_on moved. The dated note reverses one reading: at ee124810f, stale was unreachable, because failStatus read the 'loading' status every loader set before its await. db4a19c2d fixed this on 2026-10-19 with everLoaded/failedReload. The body paragraph presenting failStatus as producing stale on a failed reload still states the opposite of its own note, so it needs a pointer or a qualification."
    },
    "applications/rust--status-fsms.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31, and verified_on moved. background_job.rs is byte-identical to the pin, so every anchor holds. The 25 statics and the 13/9/11/19 vs 2 census reproduce at the pin. HEAD reads 21 statics and 40 literal vs 2 enum sites, the artist module is gone, and the toolchain is pinned at 1.96.1. The verdict and the next change stand."
    },
    "applications/react--effect-identity-and-latched-callbacks.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a closing note that the pinned React ships the first-class handler, that the omitted values here are already-stable refs and a setter, and that the handler's call-site restriction is why a ref stays the right home for the caller-owned cells"
    },
    "applications/react--async-race-guards.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31. Every Tree A citation holds at bf2a1e249. Policy B is recorded as shipped (c9d4ec29c), and the HEAD drift is a one-line move plus a keyed latest-wins export. Tree B was not reopened because it is not in this checkout, so verified_on stays 2026-08-29."
    },
    "applications/next--observed-read-subscription.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the first return-condition heading is marked met by the shipped lint gate"
    },
    "applications/rust--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Document-vs-state payload split is the source of the technique's clause and is consistent with it; both resolved notes (3ed7a9675, e52dc8e02) are dated. Zero-step migration chain gap stays open by design. Not re-executed."
    },
    "applications/react--store-dependency-topology.md": {
      "disposition": "keep",
      "reason": "Findings are specific and line-cited (count sort masked by a stable sort on equal counts; assertion on an unimported module). Provenance gap: no tree commit is pinned, only verified_on; pin one on the next drift pass."
    },
    "applications/react--invalidation-strategy.md": {
      "disposition": "keep",
      "reason": "Readers-not-subscribed defect and the subscriber-registry fix are consistent with the technique; limits are honest (one mutation source, no test pins the push)."
    },
    "applications/react--identity-scoped-eviction.md": {
      "disposition": "keep",
      "reason": "Owner, triggers, refresh exclusion and network-independent wipe are cited. Minor: \"the six stores the owner clears\" predates or ignores the resolved incidents-filter addition, and no tree commit is pinned; recount and pin on the next drift pass. Not changed here because the tree was not reopened."
    },
    "applications/next--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Three-case simulation is honest about falsifiers and about being structural-only; matches the encoding and retired-version clauses."
    },
    "applications/react--optimistic-write-path.md": {
      "disposition": "keep",
      "reason": "Thin seam document that defers verdict and evidence to the delivery-guarantees application; link resolves; limits stated."
    },
    "applications/react--persistence-and-migration.md": {
      "disposition": "keep",
      "reason": "Backward-skew A/B with byte-identical outcome under B; limits (no disclosure consumer, convention-only single author) stated."
    }
  }
}
```
