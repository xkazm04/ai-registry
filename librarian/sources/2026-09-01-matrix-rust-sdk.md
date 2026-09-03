---
source: github:matrix-org/matrix-rust-sdk
kind: repository - vendor repository (a company's client SDK over a federated protocol)
url: https://github.com/matrix-org/matrix-rust-sdk
title: "matrix-rust-sdk - Matrix Client-Server SDK for Rust"
author: matrix-org / Element
commit: 37a0ae4f1b6372c5f32cf2b17b275f5d2d7339b1
words: 597 landing (empty body) / ~30,200 in-tree markdown (7,800 in the main crate's CHANGELOG, 2,500 in the sliding-sync module doc, 2,200 in CONTRIBUTING) plus 191 unreleased changelog fragments and the rustdoc of send_queue, cross_process_lock and event_cache
extracted: 20
accepted: 4
declined: 0
leads: 4
already_covered: 4
untriaged: 8
applied: 4
shipped: 1
dispatched: 0
run_id: matrix-rust-sdk
siblings: 3
rescan_when: "the main crate's CHANGELOG.md gains a released version section carrying PRs 6843 (send queue ordering) and 6869 (aggregator deadlock); or 8 weeks elapse; or a second source states a serialization-snapshot rule for persisted types (untriaged #13)"
---

# matrix-rust-sdk - a messaging SDK read at its send queue, its lock and its changelog

## Class, and the yield it predicted

Read as a **vendor repository**: a company's SDK over a hosted protocol,
where the class predicts that the docs' rules pages and the client's types
are the reliable surface and the README is the least reliable. The ingest
confirmed the class in the crudest way - 597 landing words and an **empty
body**, the rendered page having decoded to nothing - so the run mined the
clone. Expected yield was said out loud before triage as **2-4, mostly
amendments**. Four landed: one technique and three amendments, which is the
call, with the technique coming from a rule inversion rather than a gap.

The yield did not come from where the class predicts. The sliding-sync
module doc is a protocol tour; the encryption doc is a primer with a good
pitfalls table. The dense surface was the **191 unreleased changelog
fragments** in `changelog.d/` - one file per merged PR, written under a
CONTRIBUTING rule that a fragment must be understandable to someone outside
the project - and the rustdoc headers of three modules (`send_queue`,
`cross_process_lock`, `event_cache`). A `fixed.md` fragment is a paid-for
failure with its mechanism written down by the person who paid; three of
the four landings came from one each (6843, 6629, 6811). **For a repository
that keeps per-PR changelog fragments, `changelog.d/` outranks `docs/`** -
add it to the Phase 2b sweep order ahead of the operating documents.

## Board and siblings

Three siblings were live at claim: an openwiki intake (quiet, holding
docs-sync, test-harness, error-handling, agent-memory), a librarian run, and
an awesome-game-security intake. The librarian's reconciliation had left
96 uncommitted files in the checkout, including a sibling technique in
`client-state.md` and `concurrency-guards.md` golden paths. This run
therefore **edited no golden path with foreign WIP** - the client-state and
concurrency-guards landings are technique-file amendments only - and the
two sibling-modified subject notes it appended to are left uncommitted for
their owner. The test-harness catch below was not written into that
sibling's subject.

## Declared focus

The scorecard's declared focus was: give every repository-class source a
re-scan condition at Phase 9, and check fired ones at Phase 1. Phase 1: the
ledger held **no** row with a re-scan condition, so none had fired - a
result, not a miss, and the first row that carries one is this source's
(`rescan_when:` above, and the ledger row).

## Triage table

Expected yield stated before the table: 2-4, mostly amendments.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | Anchor |
|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | A wedged head blocks its stream lane | delivery-guarantees (retry-escalation) / client-state (optimistic-write-path) | new-technique + corrects-claim | real gap | `send_queue/mod.rs:30-34`; `changelog.d/6843.changed.md` |
| 2 | K | amendment | S | Read the lease generation on regain; dirty all derived caches once | concurrency-guards/cross-process-exclusion | new-technique (amendment) | real gap | `cross_process_lock.rs:15-38`; `6629.fixed.md`; `6674.fixed.md`; `6629 (common).fixed.md` |
| 3 | K | amendment | S | Name sidecars from the engine, not a guessed suffix | embedded-db/journal-and-durability-modes | corrects-claim (amendment) | real gap | `ffi changelog.d/6811.bugfix.md` |
| 4 | K | amendment | S | Local echoes compare by state, not id-absence | client-state/optimistic-write-path | amendment | real gap | `6836.fixed.md` |
| 5 | K | technique | XL | Nested read guards deadlock under a queued writer; take one guard and project | none (0 hits) | new-subject | real gap, unhomed | `6869.fixed.md` |
| 6 | K | technique | M | Setup/run split: the run phase refuses to start without identity state | none clear | new-technique | partial | `labs/setup-pattern.md` |
| 7 | K | practice | M | AI contribution policy split by artifact: code disclosed, prose forbidden, review forbidden, autonomy forbidden | none (0 hits) | none / lead | partial | `CONTRIBUTING.md` § AI policy |
| 8 | K | amendment | S | Any request-shape change cancels the in-flight long poll, symmetrically | realtime-events / client-fetch-cache (WIP) | amendment | partial | `6828.fixed.md`; `6932.fixed.md` |
| 9 | K | catch | S | Flaky tests: label, two weeks, then ignore with an issue | test-harness/flake-lifecycle | none | likely catch | `CONTRIBUTING.md` § Intermittent failure policy |
| 10 | K | catch | S | Refresh-token rotation race narrowed by ordering the slow step first | credential-vault/token-refresh-lifecycle | none | likely catch | `6860.fixed.md` |
| 11 | K | catch | S | A non-standard 5xx from a proxy is transient, not a wedge | retry-backoff/error-classification-for-retry | none | likely catch | `6843.changed.md` (third bullet) |
| 12 | K | catch | S | Lease renewed at 1:10 of its duration; generation for fencing | job-coordination/lease-renewal | dated fact | likely catch | `cross_process_lock.rs:29-35` |
| 13 | K | technique | S | Every persisted type gets a serialization snapshot test | migrations/schema-drift-detection | new-technique | partial | `CONTRIBUTING.md` § Snapshot testing |
| 14 | K | technique | M | Encrypt-at-rest KV: value cipher + per-table keyed-hash key obfuscation | none clear | new-technique | partial | `matrix-sdk-store-encryption/README.md` |
| 15 | K | dated fact | S | Size-optimised release profiles: ~33% smaller; lto+strip halves | release-pipeline | dated fact | thin | `bindings/CONTRIBUTING.md` § Build profiles |
| 16 | K | amendment | S | SQL migration notes: comments inside tables are schema; quote identifiers not literals | migrations | amendment | thin | `sqlite/migrations/NOTES.md` |
| 17 | K | catch | S | Per-PR changelog fragments with typed filenames | release-pipeline | none | likely catch | `CONTRIBUTING.md` § Writing changelog entries |
| 18 | K | catch | M | One bounded prioritised back-pagination executor replaces per-room credits | admission-queue/queue-cardinality | none | likely catch | `6838.feature.md` |
| 19 | K | catch | S | Two ingestion paths must compute derived state identically | trace-rollup/single-shape-rule (other bundle) | none | likely catch | `6903.fixed.md` |
| 20 | T | practice | M | `cargo xtask ci` as the one CI door; feature-matrix tests as the instrument | quality-gates | none | thin | `xtask/src/ci.rs:279-291` |

Unattended run: rows whose own read is `real gap` advanced (1-5); 5 was
unhomed and is a lead. `partial` and `likely catch` rows were verified only
where one file read settled them (9-12 became catches); the rest are
untriaged below, unverified.

## Landed

### 1. `ordered-lane-blocking` (delivery-guarantees) - technique, from an inversion

The source's send queue used to skip over a request that failed for good
and send the ones behind it, delivering a conversation out of order; 6843
changed it so a wedged request blocks its room until retried or aborted.
The corpus said the *opposite* in `optimistic-write-path`: "waiting on a
predecessor is not inheriting its failure - a queue that propagates
rejections turns one failed write into a cascade." Both are right, and the
technique states the discriminator: an **entity lane** (independent intents
against one thing) skips a dead head; a **stream lane** (messages,
document operations, an upload and the event describing it) blocks on it.
The sorting question: would item N still mean what its author meant if N-1
vanished? Also carries the two release verbs, abort-as-retraction when the
head already left (6931), the head's failure shown on its own echo (6843,
second bullet), and the asymmetric cost of misclassification in a stream
lane (6843, third bullet, which is where the 520 catch lives). Golden path
gained the technique and a paragraph after the lifecycle rules.
Corroboration: the module's own rustdoc and changelog (a vendor
repository's operating docs), and training-data convergence - ordered
outboxes and per-partition logs carry head-of-line blocking as the price
of ordering.

### 2. `cross-process-exclusion` - amendment: the generation's second reader

The corpus carried the lease generation OUT as a write fence. The source
reads it IN: a lock "dirtied" since this process last held it means another
process wrote to the shared store, and every cache derived from it is
stale. 6629's fix is the sharper half: the dirt was detected, one cache
reloaded, the flag consumed, the other caches left inconsistent - so the
rule is one flag on the shared state, every derived cache reloads, cleared
once. Plus the holder-count trap from 6674 and the common-crate 6629 (the
handle is not a holder; cloning a guard counts). Applied: not-better, with
the condition written into the technique (see below).

### 3. `journal-and-durability-modes` - amendment: name the set from the engine

The technique already said delete/reset paths remove the whole sidecar set.
6811 shows how that clause is honoured in intent and missed in fact: the
clear-caches path looked for `.wal`/`.shm` where the engine writes
`-wal`/`-shm`, the stale journal survived, and the rebuilt store opened
beside it and failed with a bare disk I/O error. Amendment: sidecar names
are the engine's, derived by appending to the full file name; the path
library's extension swap is right only for stores named the conventional
way; keep one test that opens a store named without the extension and
asserts the constructed sidecar exists. Applied at `code` and shipped (see
below).

### 4. `optimistic-write-path` - amendment: the inversion, and id-less equality

The stream-lane inversion stated from the client side, pointing at the
technique, plus 6836: local states with no server id compared equal, so a
head moving from *sending* to *cannot be sent* was invisible to subscribers.

## Applied (Phase 7.5)

| technique | project | mode | verdict | what was read |
|---|---|---|---|---|
| ordered-lane-blocking | personas | simulation | better | three real cases from the conversation queue: the drain fires on a `finally` that cannot tell success from failure; a redirect skips correctly under both; a replayed nonce wedges the lane silently. Filed as the project's next change - not a few lines |
| optimistic-write-path (amendment) | personas | simulation | better | same seam, same cases; local echoes there carry a minted local id, so the id-absence half is met structurally |
| cross-process-exclusion (amendment) | personas | simulation | not-better | the leadership lease has no generation, and needs none: every leader loop re-reads its cursor from the store per tick, so nothing derived survives a tenure. Condition recorded in the technique |
| journal-and-durability-modes (amendment) | personas | code | better | `ab-paired`: a harness over six store names, arm A the project's `with_extension("db-wal")` rule (2/6 correct), arm A' the source's `.wal` bug (0/6), arm B append-to-full-name (6/6). Shipped with a test that opens `store` under WAL and asserts the constructed sidecar exists |

Why not a higher mode for the first three: the drain lives in a React
effect over a store singleton, and driving it needs the project's test
setup with store mocks - an experiment that costs more than the landing.
The lease case has no seam to measure by construction (nothing cached).

## Shipped (Phase 8)

personas: sidecar naming derived from the full file name in the pre-migration
backup, its rotation, and the permission pass; plus the regression test the
amendment prescribes. Committed on the project's active branch, not pushed.
Proof `ab-paired` (the harness above) with the project's own test as the gate.

## Already covered (catches)

- **Flaky policy** (9): `test-harness/flake-lifecycle` holds the full
  process - detect, label, quarantine with owner and expiry, release on a
  stable window. The source's two-weeks-then-ignore is one instance.
- **Rotation race** (10): `credential-vault/token-refresh-lifecycle` says
  re-read the stored credential after acquiring the lock, and that the lock
  must live where both processes see it. The source narrowed the window
  without a shared lock; the corpus's rule is the stronger one.
- **520 as transient** (11): `error-classification-for-retry` defaults the
  unknown class to conservative retry, never permanent by branch order -
  which is what prevents the source's wedge. The stream-lane cost of the
  misclassification is what the technique adds, not the class.
- **Lease sizing** (12): `lease-renewal` says renew at a fraction (a third);
  the source uses 1:10 "because the scheduler might be busy". A data point
  on the same rule, recorded, not a correction.

## Leads

- **In-process lock composition** (5): a read guard held across a call that
  takes a second read guard, with a writer queued between, deadlocks on
  writer-preferring reader-writer locks; the fix takes one guard over the
  composite and projects it. Zero corpus hits for the concept. Home would be
  a new subject on in-process lock discipline; one changelog entry is thin
  evidence for a subject. Return: a second source or a fleet incident of
  the same shape.
- **Setup/run split for identity-bearing state** (6): a long-running agent
  whose cryptographic identity lives in a store should refuse to run
  without it rather than mint a new, untrusted identity; the source wants
  an explicit create-or-open intent on the store opener. No clear home
  (embedded-db's boot assertion is the nearest). Return: a fleet project
  with a device identity in a store, or a second source.
- **AI contribution policy by artifact** (7): code with disclosure allowed;
  human-facing prose (commits, PR text, comments, issues) must not be
  generated; AI review forbidden; autonomous contribution forbidden. Zero
  hits. It is a stance (n=1 project) and this registry is itself
  agent-authored, so the interesting landing would be the discriminator,
  not the policy. Return: a second major project's policy that splits by
  artifact rather than banning wholesale.
- **Long-poll cancellation symmetry** (8): two fixes in one month where a
  request-shape change cancelled the in-flight poll only on one branch
  (add-and-remove, not add-only; not remove-to-empty), leaving the change
  waiting out the poll timeout. The home is realtime-events or
  client-fetch-cache, both of which a sibling held. Return: when
  client-fetch-cache's WIP lands, as an amendment to in-flight-dedup.

## Untriaged (extracted, reached the table, never verified - not declines)

| # | Title | Anchor | What a later run would check |
|---|---|---|---|
| 13 | Serialization snapshot test per persisted type | CONTRIBUTING § Snapshot testing | whether `schema-drift-detection` or `persistence-and-migration` (WIP) owns payload-shape drift; training data converges on the rule |
| 14 | Encrypt-at-rest KV with per-table keyed-hash key obfuscation | store-encryption README | a home; the README is explicit hazmat and names two non-Matrix preconditions (chunk values, rotate keys) |
| 15 | Size-optimised mobile release profiles, measured | bindings/CONTRIBUTING § Build profiles | a dated fact for release-pipeline; PR 6714 carries the measurement |
| 16 | SQL migration notes: in-table comments are schema; identifiers vs literals | sqlite/migrations/NOTES.md | an amendment to migrations if nothing there says it |
| 17 | Per-PR changelog fragments, typed filenames, tool-generated | CONTRIBUTING § Writing changelog entries | release-pipeline likely holds it; unverified |
| 18 | One bounded prioritised executor replaces per-consumer credits | 6838.feature.md | admission-queue/queue-cardinality; the "one run per key" clause may be missing |
| 19 | Two ingestion paths computing one derived value must agree | 6903.fixed.md | the single-shape rule lives in another bundle; whether client-state owns the client instance |
| 20 | One CI door with a feature-matrix test instrument | xtask/src/ci.rs | quality-gates; the feature-set matrix (six combinations) is the reusable half |

## What this source class taught the method

One line, for LESSONS: **per-PR changelog fragments are the densest surface
in a repository that keeps them**, and the sweep order should say so. Three
of four landings came from `changelog.d/*.fixed.md` files of 40-250 words
each; the 30,000 words of curated markdown produced the catches.
