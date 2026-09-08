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
