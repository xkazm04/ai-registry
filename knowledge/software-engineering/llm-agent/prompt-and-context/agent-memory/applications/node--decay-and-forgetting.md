---
layer: application
type: application
subject: agent-memory
technique: decay-and-forgetting
stack: node
verified_on: 2026-09-07
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Six governors, no callers, green tests (Node)

`memory-lancedb-pro` at `1a683cf5` implements the whole lifecycle this
technique specifies — a Weibull decay composite, three tiers with promotion and
demotion rules, an access tracker with debounced write-back — and ships with
none of it running. The version witness is the CI pin, `node-version: 22` in
every job of `.github/workflows/ci.yml`.

This is the technique's "a lifecycle pass that exists, is correct, and never
executes", found in a tree that had already taken the technique's advice about
where to hook it.

## The measurement

Same instrument on both trees: for each governance mechanism, count references
that are not its own definition. Calibrated first against a known live pair in
the same tree — `fuseResults` and `applySearchBoost` return 4 each — so a zero
is a reading rather than a broken grep.

| mechanism | non-definition refs |
| --- | --- |
| `runRecallLifecycle` (`index.ts:3103`) | 0 |
| `recordAccessAndMaybeTransition` (`src/retriever.ts:1763`) | 0 |
| `applyLifecycleBoost` (`src/retriever.ts:1741`) | 0 |
| `getStaleMemories` (`src/decay-engine.ts:231`) | 0 |
| `createUserScope` (`src/scopes.ts:469`) | 0 |
| `buildAdmissionStats` (`src/admission-stats.ts:263`) | 0 |

`runRecallLifecycle` holds the only `scoreAll`/`evaluateAll` call pair in the
tree (`index.ts:3160-3161`); with it dead, the sole surviving tier-transition
site is the dreaming engine's light phase (`src/dreaming-engine.ts:719-732`),
gated at `index.ts:6565` on a flag that defaults false. `setAccessTracker`
(`src/retriever.ts:612`) has no production caller and `new AccessTracker`
appears nowhere, so `this.accessTracker` is permanently null and the entire
375-line write-back machinery in `src/access-tracker.ts` is unreachable — it
survives only as `setAccessTracker() {}` in 19 test mocks.

Both recall paths still increment `access_count` — auto-recall at
`index.ts:4009` via `src/auto-recall-tier1.ts:125`, the tool at
`src/tools.ts:1044-1060`. **The inputs accumulate and nothing consumes them.**
Out of the box, no memory in this store ever changes tier: every row keeps the
`"working"` default stamped by `normalizeTier` (`src/smart-metadata.ts:101`),
and decay's whole live effect collapses to a search multiplier bounded below by
`workingDecayFloor = 0.7`.

The repo's own architecture document (`docs/memory_architecture_analysis.md:594-616`,
dated 2026-03-09) still describes the auto-recall path as running the complete
loop, and its diagram at `:91` labels `runRecallLifecycle()` as the auto-recall
main chain. The caller was removed; the document was not.

## The tests are green, and that is the finding

`test/smart-memory-lifecycle.mjs:88-100` constructs the decay engine and the
tier manager, calls `scoreAll` and `evaluateAll` directly, and asserts the
transitions are correct. They are. Nothing asserts that anything *calls* them,
so the suite is satisfied by dead code — which is why the technique's test
instrument gained the door clause.

## Arm B: the same instrument on a tree that asserts at the door

`personas` implements the same class of machinery — a memory reaper with a
debt ledger — and tests it by driving the store's own delete rather than the
reaper's API. Same instrument, non-test non-definition references:

| mechanism | refs |
| --- | --- |
| `spawn_reapers` | 2 |
| `reap_recorded` | 1 |
| `drain_ledger` | 4 |
| `record_owed` | 7 |
| `resolve_reaper` | 4 |
| `record_attempt` | 5 |
| `gc_archived_memory_embeddings` | 7 |

**0 of 6 against 7 of 7.** The causal link is readable in one test name:
`every_delete_door_records_the_owed_cleanup`
(`src-tauri/db/src/repos/core/memory_reaper.rs`) enters through
`memories::delete(&pool, &m)` and asserts the ledger row, so a lost caller
fails the test by construction. Its module header carries the other half —
plain-table stand-ins for the feature-gated vector tables, "so the whole
surface is witnessed without the ml feature", which is what keeps the door test
running in the build where the real mechanism is compiled out.

`personas` also converts every skip into a recorded debt rather than a no-op:
all three branches of `spawn_reapers` log and leave the ledger holding it. That
is the remedy the amendment prescribes, and it was read out of the fleet's tree
rather than proposed to it — nothing shipped, because the seam is already
correct.

## The defaults are the policy

The polarity is one grep of the config reads, and it runs one way:

- **opt-out (on by default):** `smartExtraction !== false` (`index.ts:2700`),
  `autoCapture !== false`, `memoryReflection.storeToLanceDB !== false`,
  `memoryReflection.writeLegacyCombined !== false` — four ingestion paths,
  including two independent reflection writers.
- **opt-in (off by default):** `admissionControl?.enabled !== true`
  (`index.ts:2303`) — the write gate; `manualStoreSupersede === true`
  (`index.ts:3492`) — retirement on manual writes; `autoRecall !== true`
  (`index.ts:598`) — the lane the lifecycle was hooked to;
  `dreaming?.enabled !== true` (`index.ts:6565`) — the only live tier site;
  `extractionThrottle?.skipLowValue === true`.

The honest counter-example, which cuts the right way: `captureAssistant === true`
is an ingestion *widener* and is correctly opt-in. But the five governance
mechanisms are opt-in and the four ingestion paths are opt-out, so the shipped
default captures continuously through two paths, writes reflection output
through two writers, gates nothing, throttles nothing, supersedes nothing on
manual writes, and never re-tiers.

`autoRecall` was defaulted off for a reason in another subsystem entirely —
changelog 1.0.11, "to avoid the model echoing injected `<relevant-memories>`
blocks" — which is the sharpest form of the finding: the lifecycle's liveness
became collateral of a prompt-rendering bug.

## What this realization cannot do

The reference count is a static measure and proves absence of callers, not
absence of effect: a dynamic dispatch or a string-keyed registry would evade
it. Neither exists in this tree — the greps were read row by row, and the two
apparent hits on `getStaleMemories` resolved to an interface declaration and
its implementation — but the instrument would not survive being pointed at a
codebase that wires its lifecycle through a plugin registry.
