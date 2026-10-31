---
subject: concurrency-guards
domain: software-engineering
last_touched: 2026-10-15
touched_by: intake
dry_streak: 0
---

# concurrency-guards

First touch: [[2026-08-22-7]], external reconcile against `golang/sync`
@ `3ffd83c` (v0.22.0 era). Gained `go--release-guarantees` (uncovered) -
second stack; single-stack debt cleared. Hint confirmed; the worker's re-check
caught itself inverting a test's meaning and fixed it against the assertion.

## Open leads (banked, convergence rule applies)

- Any manual/out-of-band release door makes identity-checked eviction
  mandatory - the incumbent is then guaranteed to outlive its own entry.
- The enemy list should split panic from abrupt-thread-exit; they need
  different waiter treatment.
- The release must decide what the waiters GET - replay the failure, crash
  loudly, or release-and-stay-silent - and the unstated choice becomes the
  wedge.
- An acquisition that can never be satisfied belongs on the enemy list;
  failing fast is a release-design decision.

## Cross-subject proposals

- The joiner reaps the scope it created (Wait-calls-cancel) -> scheduling /
  background-jobs.
- Deliberate head-of-line blocking to prevent large-request starvation ->
  admission-queue territory; note it is the OPPOSITE trade to the one the
  API-server reconcile flagged as a deviation - the two documents together
  frame the real design choice.

## 2026-08-27 - intake, [[2026-08-27-picomq-durable-streams]]

Two amendments from one open-source stream engine. No new techniques; both
findings had homes that already existed and were incomplete rather than
absent.

**`single-flight-primitives` was enumerating wrong.** Its second-caller list
(refuse / join / queue / coalesce) closes by telling the reader to pick one
explicitly per operation - which makes an incomplete list consequential
rather than cosmetic. **Merge** is a fifth: N callers with *distinct*
payloads satisfied by one execution, each getting its own outcome. Join
returns one shared result to callers who wanted the same thing; coalesce
keeps the last arrival and discards the rest as waste; merge discards nothing
and duplicates nothing, and is the only policy that lowers the *cost* of the
guarded operation rather than its frequency. Landed with a window-closing
section: the batch can self-close on the previous execution finishing - no
timer, no tuning, no added latency for a lone caller - **only while
executions are serial.** Pipeline them and there is no single previous
execution to close against, so an explicit timer has to come back. Buffer
bounded with a distinguishable over-capacity refusal.

**`cross-process-exclusion` treats the cost of a duplicate as a measured
input.** Amendment: that cost can be engineered. Route every effect the
holder produces through a shared serialization point and the lease demotes
from safety mechanism to availability knob - which changes what its TTL has
to be defended against, and should be stated so a reader can tell which kind
of lease they are looking at. Two conditions written down because neither
survives assumption: no side-channel writes past the door, and the holder
worklist living in shared state rather than in process memory. Weakest of the
run - the premise is already owned by `idempotency-by-design`; the increment
is the consequence for lease sizing.

## Open leads from this run

- **Classify what a stale view decides: speed or correctness.** Only
  correctness decisions need freshness; they get a fence at the write site
  instead of a fresher view. The fencing half is already owned here - the
  classification framing is not, and reads as doctrine rather than technique.
  One sighting. **Return on a second independent one**, then propose at
  doctrine level rather than as a technique.

## 2026-08-27 - /intake, from a coding-agent harness tree ([[2026-08-27-whip-coding-agent-harness]])

`single-flight-primitives` amended for the second time in two runs, both times against its
own enumeration. picomq's run added `merge` as a sixth second-caller policy; this run
**scopes `join`**.

Join is written for a **computation**: one execution, N waiters, one result, finished.
Pointed at the *establishment of a durable resource* - a connection, a session, a spawned
server that drops and returns - the execution recurs, and the natural broadcast primitive
for join (a one-shot completion signal that wakes all waiters at once) is one-shot **by
construction** in most concurrency models. So the first reconnect performs it a second
time and the process dies at the moment it was recovering. The source's own note: "the
first implementation re-closed on reconnect and panicked."

Three rules landed, plus a `use_when` entry and a decision rule: the signal means "the
first attempt settled", not "usable" (settled covers failure too, which is what makes the
fire-once invariant unbreakable); callers read live state under the lock afterwards, never
the signal; every watcher carries the generation that spawned it, or a stale drop event
tears down a healthy resource.

The reusable half is the closing distinction: single-flight over a computation guards
**work** and yields a value that is delivered and forgotten; over a resource it guards
**establishment** and yields state with a lifetime - so the guard needs a generation and
the signal needs a meaning that survives being observed forever.

Boundary noted, not linked: `mcp-tools/client-integration` says only "treats reconnects as
routine rather than exceptional" and models catalog freshness in detail beside it. That is
the same boundary from the protocol side; the mechanism lives here because the source hits
it in three unrelated subsystems.

## Open leads

- **Untriaged, from the same source:** `guard-key-design` enumerates the identity axes and
  says entity is "almost always included" - a shell command's side effects are attributable
  to no path, so it takes a single global guard while per-path writes run in parallel. The
  enumeration does not contain the case where the entity axis cannot be determined. Return
  if a second source draws the same boundary.

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

One lead (personas), NOVEL. New technique `atomic-file-publish`: the reader's half of
write-temp-then-rename is unconditional; the writer's half is refusable on a platform whose
open handles carry sharing modes the replace call must satisfy, and the refusal lands on
exactly the polled-file case the pattern is reached for. Spine: replace from the same
directory, flushed; classify errors transient vs terminal; bounded backoff on the transient
set only; exhaustion spelled as a distinct failure; reap the temp on every exit; one publish
door. Corroborated by the vendor reference's silence on atomicity and open handles, a
language-runtime issue on rename-over-open-file, and retry layers in two package ecosystems
and a compiler toolchain. Application `rust--atomic-file-publish` at personas `b6dcf28aa`
(129 lines): roughly a dozen publish sites, none retrying; the discipline already exists in
the repo on a different call (a locale-split script's remove loop, six attempts, explicit
transient set); the worst instance is the daemon lock heartbeat, where a contender's own
read can make the sitting leader stand down. Nothing was written to personas - a project
change is owed. Proposals: `embedded-db/single-writer-holder-discipline` treats the failed
rename as general truth (platform-conditional); retry-backoff has no local-handle case.
## 2026-09-01 - intake [[2026-09-01-matrix-rust-sdk]]

`cross-process-exclusion` gained a section on the lease generation's second
reader: the technique carried the generation OUT as a write fence and never
read it back IN on re-acquisition, where an advance proves another holder
wrote in between and every cache derived from the shared store is stale. The
source's own bug was the sharper half: it detected the dirtied generation,
reloaded the one cache whose code path noticed, and consumed the flag -
leaving the other caches serving the pre-handover picture. Rule landed: one
dirt flag on the store's shared state, every derived cache reloads under it,
cleared once after all of them. Plus the in-process holder-count trap (the
handle is not a holder; cloning a guard counts).

Applied at `simulation` against the one fleet tree with a real leadership
lease: **not-better**, and recorded as the condition - every leader loop
re-reads its cursor from the store per tick, so nothing is derived across
tenures and the generation would have nothing to dirty. The falsifier is the
first in-memory cache over the shared store; the verdict flips the day one
appears.

Open lead (no home, XL): the source's other concurrency finding is a
lock-ordering deadlock - a read guard held across a call that takes a second
read guard while a writer is queued between them, on writer-preferring
reader-writer locks; fixed by taking one guard over the composite and
projecting it. The corpus holds no material on in-process lock composition
at all (zero hits for reader-writer, lock ordering, nested acquisition), and
this subject is about single-flight, not mutual exclusion. A subject on
in-process lock discipline is the home; one changelog entry is thin evidence
for a subject. Return condition: a second source, or a managed project's
incident, of the same shape.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+1 technique, +1 amendment.

**`critical-section-across-a-suspension`** — the reflexive rule "never hold a lock
across a yield" is wrong as stated. Splitting a critical section around a
suspension introduces a check-to-use race; before splitting, establish the halves
are independent. If the second depends on state the first observed, the split
converts a throughput problem into a correctness one. The subject owned guard
keys, release guarantees, single-flight and fencing — nothing spanning a
suspension, and nothing about the race created by naively shortening one.

Amendment to `release-guarantees`: a sixth path, where **the named reaper cannot
run in the context it is called from**. Not an exit path but a capability
mismatch — where release requires waiting, a synchronous destruction hook cannot
satisfy it, and spawning the release from that hook is unowned work firing exactly
as the runtime departs. A resource whose only reaper is a hook it cannot satisfy
has no reaper. Cites `creation-names-reaper`.

### 2026-09-17 - `/harvest backlog` wave 3, one technique + one application

`preparation-is-the-staleness-window`, from [[2026-08-31-openwiki-v050]], [[2026-09-07-lago]] and [[2026-09-04-openviking]]. The subject owned the check-to-use race created by splitting a critical section and fencing at the write; what was missing is placement: a guard's verdict ages across the preparation that follows it, and the gap is the length of the preparation rather than a scheduling accident. The technique's value is that the irreversible step's nature picks the form - condition the write where the store owns the state, re-read and dedup where the effect leaves the system, snapshot before and after where a cheap write licenses future skipping - and that the fresh read may refuse or widen a lock set but never swap a payload an operation identity already promised. Measured on a real outbound PII path (1 leaked POST of 3 probes to 0) and shipped. Noted for a later run: `mcp-tools/write-freshness-gate` is the same law at a different altitude and neither file knows about the other.

### 2026-10-14 - intake `github:rtk-ai/grit` (run intake-grit-1014), one technique + three applications

Source note [[2026-10-14-grit]]. New technique `shared-claims-by-announce-and-verify`:
shared and exclusive modes on a store with only per-key create-if-absent, by two
keyspaces and announce-then-verify; the store's read and list consistency stated as
a precondition; upgrade counts every other reader; reclaim conditional, refresh
re-reads, explicit-code-only error classification. Unapplied (no fleet project runs
shared claims over an object store). Applications: `rust--shared-claims-by-announce-and-verify`
and `rust--cross-process-exclusion--symbol-lock-store` (the source tree: an
in-process mutex as scenery and a test that shared it; non-atomic expired-holder
reclaim; a malformed config falling back to a private authority), and
`node--cross-process-exclusion`: the registry's own board had the same
delete-by-name takeover; fixed in `6bfb3f6c`, double-grant trials 13/32 to 0/32.
The `cross-process-exclusion` text was not changed: its rule (takeover is
replace-if-unchanged) was right and the board violated it.

## 2026-10-15 - intake `mcp_agent_mail_rust` (run dle-002-1015, practitioner series DLE-002)

Source note [[2026-10-15-mcp-agent-mail-rust]]. New application
`rust--cross-process-exclusion--agent-mail`: every version-control call takes a
per-repository in-process mutex and then an OS lock on a private sentinel, after a tool
release corrupted repositories under concurrent readers. Departure: the server's own
archive commits run under a different guard and meet a second process only at the tool's
own index lock. Catches this run: critical-section-across-a-suspension (sync outside the
fence, rename inside), preparation-is-the-staleness-window (a pooled snapshot pre-check).
Backlog row dle-002-lock-fence (a broken lock's holder learns it before the guarded write).

## Architecture review - 2026-10-31

First architecture review of the subject: all 29 documents decided. Six
clarify items. Three rest on primary sources opened this run (hashicorp/raft's
Apply contract; Rust's std::fs::rename docs and rust-lang/rust#131072, for two
documents). Two are internal: the golden path names four second-caller policies
where the technique has five, and the renewal technique calls a no-margin shape
a stop "before" the lease can be taken (OpenBao's source confirms 5 s + 10 s =
15 s). The sixth, on idempotency-by-design's zero-rows verdict, is reasoning
only. Private
application trees were not reopened; no verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/concurrency-guards",
  "date": "2026-10-31",
  "baseline": "602b39448",
  "digest": "sha256-b2:ccc991958e998a93",
  "disposition": "clarify",
  "coverage": "First architecture review. All 29 documents (golden path, 15 techniques, 13 applications) read in full. Five primary sources opened and one local source checked. Not evaluated: private consumer trees, external clones other than OpenBao postgresql.go and golang/sync singleflight, any runtime. No verification date refreshed.",
  "counterexamples": [
    "A version-checked conditional write that affects zero rows because another writer advanced the version is a conflict, not an already-done success.",
    "A Raft leader deposed by a partition it has not noticed can append an entry locally; only the new term's quorum keeps it from committing, and its caller cannot tell whether the write landed.",
    "A one-third renewal cadence with a two-thirds deadline gives up at the instant the lease becomes stealable (OpenBao: 5 s + 10 s = 15 s).",
    "Since Rust 1.85, std::fs::rename over a destination held open with delete-sharing succeeds on Windows 10 1607+; a scanner that opened it without delete-sharing still refuses it.",
    "A lock board whose loops re-read every cursor per tick gains nothing from a regain-generation check (retained from the 2026-09-01 not-better application)."
  ],
  "sources": [
    {
      "url": "https://github.com/openbao/openbao/blob/6b5f82e1/internal/physical/postgresql/postgresql.go",
      "result": "Read at the pinned commit. Constants 'PostgreSQLLockTTLSeconds = 15', 'PostgreSQLLockRenewInterval = 5 * time.Second', 'PostgreSQLLockRetryInterval = time.Second'; writeItem uses 'context.WithTimeout(context.Background(), PostgreSQLLockTTLSeconds*2/3*time.Second)' under the comment 'ensure we block at most 2/3rds of the total lock period ... We give ourselves a little grace period'; validateFence returns nil with no fence or an unfenced-write mark, else asks IsActivelyHeld; 'Leave one for lock renewal. txnMaxParInt = maxParInt - 1'. Confirms the go application's quoted facts (line numbers not rechecked) and that 5 s + 10 s = 15 s leaves no margin."
    },
    {
      "url": "https://github.com/hashicorp/raft/blob/main/api.go",
      "result": "Read. Apply 'must be run on the leader or it will fail'; 'If the node discovers it is no longer the leader while applying the command, it will return ErrLeadershipLost. There is no way to guarantee whether the write succeeded or failed in this case.' ErrLeadershipLost: 'a leader fails to commit a log entry because it's been deposed in the process.' So a node that knows it is a follower is refused, but a deposed leader that has not noticed can append locally; what fences it is the quorum commit, and its caller gets an unknown outcome. Refines leadership-is-the-lock's 'rejects a proposal from a non-leader before it is appended'."
    },
    {
      "url": "https://doc.rust-lang.org/std/fs/fn.rename.html",
      "result": "Read. 'MoveFileExW with a fallback to SetFileInformationByHandle on Windows'; 'On Windows 10 version 1607 and above, the behavior is the same as Unix if the filesystem supports FileRenameInfoEx.'"
    },
    {
      "url": "https://github.com/rust-lang/rust/pull/131072",
      "result": "Read. 'Win: Use POSIX rename semantics for std::fs::rename if available', merged 2024-12-22, milestone 1.85.0, resolves #123985: tries FileRenameInfoEx with FILE_RENAME_FLAG_POSIX_SEMANTICS, which succeeds when the target is open with FILE_SHARE_DELETE, falling back to FileRenameInfo. Refutes rust--atomic-file-publish's claim (toolchain 1.97.1) that std::fs::rename does not pass POSIX semantics; the retry advice survives because a handle opened without delete-sharing still refuses."
    },
    {
      "url": "https://github.com/golang/sync/blob/master/singleflight/singleflight.go",
      "result": "Read at master, not at the application's pin 3ffd83c. The eviction is 'if g.m[key] == c { delete(g.m, key) }'; Forget deletes by key; a panic with channel waiters runs 'go panic(e)' then 'select {}'. Confirms go--release-guarantees sections 2 and 3 in substance."
    },
    {
      "source": "This registry's scripts/run-board.mjs at 6bfb3f6c and at HEAD",
      "result": "At 6bfb3f6c the node--cross-process-exclusion anchors hold exactly (createLock :492, breakIfUnchanged :521, rec._breakable :567). At HEAD the same quotes sit at :556, :585, :660. HEAD :525-527 carries node--cache-value-not-handle's arm B (ownerGone || pastTtlAndQuiet)."
    }
  ],
  "documents": {
    "concurrency-guards.md": {
      "disposition": "clarify",
      "reason": "Spine item 3 says 'Refuse loudly, join ..., queue ..., or coalesce ... all four are legitimate', but single-flight-primitives lists five policies since the 2026-08-27 merge amendment. Add merge."
    },
    "techniques/guard-key-design.md": {
      "disposition": "keep",
      "reason": "Axes, two failure directions and closed key vocabularies are sound. The banked lead (an entity axis that cannot be determined, e.g. a shell command) stays a lead pending a second source."
    },
    "techniques/single-flight-primitives.md": {
      "disposition": "keep",
      "reason": "Five policies are enumerated and named consistently in the decision rules; the serial self-closing merge window and the durable-resource join rules are internally consistent."
    },
    "techniques/cache-value-not-handle.md": {
      "disposition": "keep",
      "reason": "Reclaim deadline derived above the owner timeout, presence flag, and generation-bump-plus-release are consistent with each other and with single-flight-primitives' boundary."
    },
    "techniques/release-guarantees.md": {
      "disposition": "keep",
      "reason": "Five-path enemy list plus the capability-mismatch sixth path; references to the list's third and fifth entries are correct. Corroborated by golang/sync's conditional eviction."
    },
    "techniques/critical-section-across-a-suspension.md": {
      "disposition": "keep",
      "reason": "The split-introduces-check-to-use-race rule and its inversion are stated with a clear test; cross-links resolve."
    },
    "techniques/cross-process-exclusion.md": {
      "disposition": "keep",
      "reason": "Substrate options, fail direction, engineered duplicate cost and the regain-generation section are consistent; the not-better application is honestly reflected as a condition."
    },
    "techniques/attempt-attribution.md": {
      "disposition": "keep",
      "reason": "Mint-at-start, verify-adjacent-to-write and discard-as-counted-outcome are sound and consistent with the fencing techniques."
    },
    "techniques/idempotency-by-design.md": {
      "disposition": "clarify",
      "reason": "The conditional-writes tool lists set-if-version-matches and then says zero rows is read as 'already done'. For a version check, zero rows can equally mean another writer changed the row, which is a conflict, not the already-done success; preparation-is-the-staleness-window treats the same count as 'the race loses loudly'. State that zero rows reads as already-done only where the condition encodes this operation's own completion (status flip, create-if-absent with a natural key). Not applied: needs the author's wording, and no primary source was opened for it."
    },
    "techniques/atomic-file-publish.md": {
      "disposition": "clarify",
      "reason": "'newer editions expose replace semantics that tolerate open readers the way other platforms always have' overstates: the POSIX-semantics rename succeeds only against handles opened with delete-sharing (rust-lang/rust#131072). Qualify it; the retry rule is unaffected."
    },
    "techniques/leadership-is-the-lock.md": {
      "disposition": "clarify",
      "reason": "'the log's own admission rule rejects a proposal from a non-leader before it is appended' holds for a node that knows it is not leader. hashicorp/raft documents that a leader deposed mid-apply returns ErrLeadershipLost with no guarantee whether the write succeeded: the fence is the quorum commit, not local admission. Say so; the no-token conclusion stands."
    },
    "techniques/fence-inside-write-transaction.md": {
      "disposition": "keep",
      "reason": "Commit-time and direct-write fencing, the atomicity caveat and the marked allowlist all match the OpenBao source read this run."
    },
    "techniques/renewal-deadline-two-thirds-ttl.md": {
      "disposition": "clarify",
      "reason": "Internal inconsistency: the arithmetic paragraph says two thirds is 'a hard stop before the lease can be taken', and the next paragraph shows that a one-third cadence plus a two-thirds deadline equals the TTL with no margin (confirmed in OpenBao: 5 s + 10 s = 15 s). The decision rule 'give up at about two thirds' sits beside 'strictly inside the TTL' without reconciling them."
    },
    "techniques/race-catalog-with-two-histories.md": {
      "disposition": "keep",
      "reason": "Exactly-two rule, test-consumed catalog and write-order assertion are coherent; the boundary question against guards is clear."
    },
    "techniques/preparation-is-the-staleness-window.md": {
      "disposition": "keep",
      "reason": "Placement rule, three shapes by step nature, refuse-only re-read and the bounded lock-set stabilisation loop are sound. The zero-rows tension is recorded against idempotency-by-design."
    },
    "techniques/shared-claims-by-announce-and-verify.md": {
      "disposition": "keep",
      "reason": "Announce-then-verify argument is correct given the stated read and list consistency precondition; upgrade, reclaim and error-classification rules match the application."
    },
    "applications/go--fence-inside-write-transaction.md": {
      "disposition": "keep",
      "reason": "Constants, the two-thirds timeout and its comment, validateFence's shape and the reserved connection were re-read at 6b5f82e1 this run. Line numbers were not rechecked, so verified_on is unchanged."
    },
    "applications/go--leadership-is-the-lock.md": {
      "disposition": "reverify",
      "reason": "Plausible and consistent with hashicorp/raft's API, but the raft.go and physical.go anchors at 6b5f82e1 were not reopened."
    },
    "applications/go--release-guarantees.md": {
      "disposition": "keep",
      "reason": "Conditional eviction, Forget and the go panic plus select {} branch confirmed at golang/sync master; errgroup and semaphore anchors at 3ffd83c not reopened. Pin stays in prose."
    },
    "applications/node--cache-value-not-handle.md": {
      "disposition": "keep",
      "reason": "Arm B's predicate is present in this registry's run-board (HEAD :525-527); the 3/5 versus 5/5 table is arithmetically consistent. Its fit is closer to reclaim-on-owner-state than to the value-cache mechanism; a later pass may re-home it."
    },
    "applications/node--cross-process-exclusion.md": {
      "disposition": "keep",
      "reason": "All three anchors verified at fix commit 6bfb3f6c; at HEAD they have drifted to :556, :585, :660 with quotes intact. Measurement not re-run."
    },
    "applications/node--preparation-is-the-staleness-window.md": {
      "disposition": "reverify",
      "reason": "Private consumer tree and its probes not reopened; internal arithmetic (1/3 to 3/3, 68 pass both arms) consistent."
    },
    "applications/node--race-catalog-with-two-histories.md": {
      "disposition": "reverify",
      "reason": "Quotes from earendil-works/pi at 92d8e2d1 not reopened this run."
    },
    "applications/rust--atomic-file-publish.md": {
      "disposition": "clarify",
      "reason": "States that std::fs::rename 'does not pass FILE_RENAME_POSIX_SEMANTICS (rust-lang/rust#123985)' at toolchain 1.97.1. rust-lang/rust#131072 (Rust 1.85) added that path and closed #123985. Correct the sentence; private anchors otherwise need reverify."
    },
    "applications/rust--cross-process-exclusion.md": {
      "disposition": "reverify",
      "reason": "Private tree at the 2026-09-01 reading not reopened; the not-better verdict and its falsifier are stated."
    },
    "applications/rust--cross-process-exclusion--agent-mail.md": {
      "disposition": "reverify",
      "reason": "Clone at 3821104c not reopened; quoted anchors carry their own checkable text."
    },
    "applications/rust--cross-process-exclusion--symbol-lock-store.md": {
      "disposition": "reverify",
      "reason": "rtk-ai/grit at 0f3c9d04 not reopened."
    },
    "applications/rust--shared-claims-by-announce-and-verify.md": {
      "disposition": "reverify",
      "reason": "rtk-ai/grit at 0f3c9d04 not reopened; the embedded-backend replay is not re-run."
    },
    "applications/rust--single-flight-primitives.md": {
      "disposition": "reverify",
      "reason": "Private tree, dated 2026-08-18, not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied five of the six clarify items the record above names, each minimal
and in the document's own voice. The idempotency-by-design zero-rows item stays
owed because it needs the author's wording and no source was opened for it. The
rust application's private anchors were not reopened, so its verified_on is
unchanged. Overall disposition stays clarify.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/concurrency-guards",
  "date": "2026-10-31",
  "baseline": "c5d3faf84",
  "digest": "sha256-b2:fc07b54dee264b44",
  "disposition": "clarify",
  "coverage": "All 29 documents decided. Five of the six clarify items from the first 2026-10-31 record were applied and re-read (golden path, atomic-file-publish, leadership-is-the-lock, renewal-deadline-two-thirds-ttl, rust--atomic-file-publish). The idempotency-by-design item stays owed. Every other document is byte-unchanged and keeps its decision. No private tree reopened, no verification date refreshed.",
  "counterexamples": [
    "A version-checked conditional write that affects zero rows because another writer advanced the version is a conflict, not an already-done success.",
    "A Raft leader deposed by a partition it has not noticed can append an entry locally; only the new term's quorum keeps it from committing, and its caller cannot tell whether the write landed.",
    "A one-third renewal cadence with a two-thirds deadline gives up at the instant the lease becomes stealable (OpenBao: 5 s + 10 s = 15 s).",
    "Since Rust 1.85, std::fs::rename over a destination held open with delete-sharing succeeds on Windows 10 1607+; a scanner that opened it without delete-sharing still refuses it.",
    "A lock board whose loops re-read every cursor per tick gains nothing from a regain-generation check (retained from the 2026-09-01 not-better application)."
  ],
  "sources": [
    {
      "url": "https://github.com/openbao/openbao/blob/6b5f82e1/internal/physical/postgresql/postgresql.go",
      "result": "Read at the pinned commit. Constants 'PostgreSQLLockTTLSeconds = 15', 'PostgreSQLLockRenewInterval = 5 * time.Second', 'PostgreSQLLockRetryInterval = time.Second'; writeItem uses 'context.WithTimeout(context.Background(), PostgreSQLLockTTLSeconds*2/3*time.Second)' under the comment 'ensure we block at most 2/3rds of the total lock period ... We give ourselves a little grace period'; validateFence returns nil with no fence or an unfenced-write mark, else asks IsActivelyHeld; 'Leave one for lock renewal. txnMaxParInt = maxParInt - 1'. Confirms the go application's quoted facts (line numbers not rechecked) and that 5 s + 10 s = 15 s leaves no margin."
    },
    {
      "url": "https://github.com/hashicorp/raft/blob/main/api.go",
      "result": "Read. Apply 'must be run on the leader or it will fail'; 'If the node discovers it is no longer the leader while applying the command, it will return ErrLeadershipLost. There is no way to guarantee whether the write succeeded or failed in this case.' ErrLeadershipLost: 'a leader fails to commit a log entry because it's been deposed in the process.' So a node that knows it is a follower is refused, but a deposed leader that has not noticed can append locally; what fences it is the quorum commit, and its caller gets an unknown outcome. Refines leadership-is-the-lock's 'rejects a proposal from a non-leader before it is appended'."
    },
    {
      "url": "https://doc.rust-lang.org/std/fs/fn.rename.html",
      "result": "Read. 'MoveFileExW with a fallback to SetFileInformationByHandle on Windows'; 'On Windows 10 version 1607 and above, the behavior is the same as Unix if the filesystem supports FileRenameInfoEx.'"
    },
    {
      "url": "https://github.com/rust-lang/rust/pull/131072",
      "result": "Read. 'Win: Use POSIX rename semantics for std::fs::rename if available', merged 2024-12-22, milestone 1.85.0, resolves #123985: tries FileRenameInfoEx with FILE_RENAME_FLAG_POSIX_SEMANTICS, which succeeds when the target is open with FILE_SHARE_DELETE, falling back to FileRenameInfo. Refutes rust--atomic-file-publish's claim (toolchain 1.97.1) that std::fs::rename does not pass POSIX semantics; the retry advice survives because a handle opened without delete-sharing still refuses."
    },
    {
      "url": "https://github.com/golang/sync/blob/master/singleflight/singleflight.go",
      "result": "Read at master, not at the application's pin 3ffd83c. The eviction is 'if g.m[key] == c { delete(g.m, key) }'; Forget deletes by key; a panic with channel waiters runs 'go panic(e)' then 'select {}'. Confirms go--release-guarantees sections 2 and 3 in substance."
    },
    {
      "source": "This registry's scripts/run-board.mjs at 6bfb3f6c and at HEAD",
      "result": "At 6bfb3f6c the node--cross-process-exclusion anchors hold exactly (createLock :492, breakIfUnchanged :521, rec._breakable :567). At HEAD the same quotes sit at :556, :585, :660. HEAD :525-527 carries node--cache-value-not-handle's arm B (ownerGone || pastTtlAndQuiet)."
    }
  ],
  "documents": {
    "concurrency-guards.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: spine item 3 now names merge as the fifth second-caller policy ('all five are legitimate'), matching single-flight-primitives."
    },
    "techniques/guard-key-design.md": {
      "disposition": "keep",
      "reason": "Axes, two failure directions and closed key vocabularies are sound. The banked lead (an entity axis that cannot be determined, e.g. a shell command) stays a lead pending a second source."
    },
    "techniques/single-flight-primitives.md": {
      "disposition": "keep",
      "reason": "Five policies are enumerated and named consistently in the decision rules; the serial self-closing merge window and the durable-resource join rules are internally consistent."
    },
    "techniques/cache-value-not-handle.md": {
      "disposition": "keep",
      "reason": "Reclaim deadline derived above the owner timeout, presence flag, and generation-bump-plus-release are consistent with each other and with single-flight-primitives' boundary."
    },
    "techniques/release-guarantees.md": {
      "disposition": "keep",
      "reason": "Five-path enemy list plus the capability-mismatch sixth path; references to the list's third and fifth entries are correct. Corroborated by golang/sync's conditional eviction."
    },
    "techniques/critical-section-across-a-suspension.md": {
      "disposition": "keep",
      "reason": "The split-introduces-check-to-use-race rule and its inversion are stated with a clear test; cross-links resolve."
    },
    "techniques/cross-process-exclusion.md": {
      "disposition": "keep",
      "reason": "Substrate options, fail direction, engineered duplicate cost and the regain-generation section are consistent; the not-better application is honestly reflected as a condition."
    },
    "techniques/attempt-attribution.md": {
      "disposition": "keep",
      "reason": "Mint-at-start, verify-adjacent-to-write and discard-as-counted-outcome are sound and consistent with the fencing techniques."
    },
    "techniques/idempotency-by-design.md": {
      "disposition": "clarify",
      "reason": "The conditional-writes tool lists set-if-version-matches and then says zero rows is read as 'already done'. For a version check, zero rows can equally mean another writer changed the row, which is a conflict, not the already-done success; preparation-is-the-staleness-window treats the same count as 'the race loses loudly'. State that zero rows reads as already-done only where the condition encodes this operation's own completion (status flip, create-if-absent with a natural key). Not applied: needs the author's wording, and no primary source was opened for it."
    },
    "techniques/atomic-file-publish.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'replace semantics that tolerate open readers the way other platforms always have' now says such readers must have opened the file with delete-sharing, per rust-lang/rust#131072."
    },
    "techniques/leadership-is-the-lock.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the opening now separates a node that knows it is a follower (refused before append) from a deposed leader that has not noticed (may append locally, cannot commit without the new term's quorum, its caller told leadership was lost with the outcome unknown), per hashicorp/raft's Apply contract."
    },
    "techniques/fence-inside-write-transaction.md": {
      "disposition": "keep",
      "reason": "Commit-time and direct-write fencing, the atomicity caveat and the marked allowlist all match the OpenBao source read this run."
    },
    "techniques/renewal-deadline-two-thirds-ttl.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'a hard stop before the lease can be taken' now reads 'no later than the moment', with a pointer to the margin check; the decision rule now says to shorten the two-thirds deadline when the cadence would leave no margin."
    },
    "techniques/race-catalog-with-two-histories.md": {
      "disposition": "keep",
      "reason": "Exactly-two rule, test-consumed catalog and write-order assertion are coherent; the boundary question against guards is clear."
    },
    "techniques/preparation-is-the-staleness-window.md": {
      "disposition": "keep",
      "reason": "Placement rule, three shapes by step nature, refuse-only re-read and the bounded lock-set stabilisation loop are sound. The zero-rows tension is recorded against idempotency-by-design."
    },
    "techniques/shared-claims-by-announce-and-verify.md": {
      "disposition": "keep",
      "reason": "Announce-then-verify argument is correct given the stated read and list consistency precondition; upgrade, reclaim and error-classification rules match the application."
    },
    "applications/go--fence-inside-write-transaction.md": {
      "disposition": "keep",
      "reason": "Constants, the two-thirds timeout and its comment, validateFence's shape and the reserved connection were re-read at 6b5f82e1 this run. Line numbers were not rechecked, so verified_on is unchanged."
    },
    "applications/go--leadership-is-the-lock.md": {
      "disposition": "reverify",
      "reason": "Plausible and consistent with hashicorp/raft's API, but the raft.go and physical.go anchors at 6b5f82e1 were not reopened."
    },
    "applications/go--release-guarantees.md": {
      "disposition": "keep",
      "reason": "Conditional eviction, Forget and the go panic plus select {} branch confirmed at golang/sync master; errgroup and semaphore anchors at 3ffd83c not reopened. Pin stays in prose."
    },
    "applications/node--cache-value-not-handle.md": {
      "disposition": "keep",
      "reason": "Arm B's predicate is present in this registry's run-board (HEAD :525-527); the 3/5 versus 5/5 table is arithmetically consistent. Its fit is closer to reclaim-on-owner-state than to the value-cache mechanism; a later pass may re-home it."
    },
    "applications/node--cross-process-exclusion.md": {
      "disposition": "keep",
      "reason": "All three anchors verified at fix commit 6bfb3f6c; at HEAD they have drifted to :556, :585, :660 with quotes intact. Measurement not re-run."
    },
    "applications/node--preparation-is-the-staleness-window.md": {
      "disposition": "reverify",
      "reason": "Private consumer tree and its probes not reopened; internal arithmetic (1/3 to 3/3, 68 pass both arms) consistent."
    },
    "applications/node--race-catalog-with-two-histories.md": {
      "disposition": "reverify",
      "reason": "Quotes from earendil-works/pi at 92d8e2d1 not reopened this run."
    },
    "applications/rust--atomic-file-publish.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the std::fs::rename sentence now says that since Rust 1.85 it tries FileRenameInfoEx with POSIX semantics (rust-lang/rust#131072, closing #123985), so only a reader without delete-sharing refuses it; the retry advice stands. The private tree's anchors at b6dcf28aa were not reopened and verified_on is unchanged."
    },
    "applications/rust--cross-process-exclusion.md": {
      "disposition": "reverify",
      "reason": "Private tree at the 2026-09-01 reading not reopened; the not-better verdict and its falsifier are stated."
    },
    "applications/rust--cross-process-exclusion--agent-mail.md": {
      "disposition": "reverify",
      "reason": "Clone at 3821104c not reopened; quoted anchors carry their own checkable text."
    },
    "applications/rust--cross-process-exclusion--symbol-lock-store.md": {
      "disposition": "reverify",
      "reason": "rtk-ai/grit at 0f3c9d04 not reopened."
    },
    "applications/rust--shared-claims-by-announce-and-verify.md": {
      "disposition": "reverify",
      "reason": "rtk-ai/grit at 0f3c9d04 not reopened; the embedded-backend replay is not re-run."
    },
    "applications/rust--single-flight-primitives.md": {
      "disposition": "reverify",
      "reason": "Private tree, dated 2026-08-18, not reopened."
    }
  }
}
```
