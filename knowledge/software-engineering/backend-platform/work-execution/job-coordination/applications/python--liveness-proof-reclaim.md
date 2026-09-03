---
layer: application
type: application
subject: job-coordination
technique: liveness-proof-reclaim
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# A graph-ingestion pipeline reclaims a dead worker's slot by probing its process identity, never by expiry

Verified against the LightRAG source tree at commit
`c1248646e4eda4d89054926af2e094730daf23fe`; every line cited below was opened in
that clone. The runtime witness is the shipped image, which pins `python3.12`
(`Dockerfile:20`), above the `requires-python = ">=3.10"` floor in
`pyproject.toml:14`.

The coordinated work is document ingestion: parse, chunk, then an extraction
pass that calls a language model per chunk. A single large document holds the
pipeline slot for many minutes with nothing the coordinator can observe, and
re-running extraction is neither free nor idempotent. The tree's answer is the
technique's: **the reclaim predicate is a process-identity probe, and there is
no lease deadline anywhere in it.**

## The predicate

`_process_alive(pid, start_id)` (`lightrag/kg/shared_storage.py:620`) is the
whole decision, and its docstring states the one-sided rule outright — it
returns `False` "ONLY when the owner is *confirmed* dead," while "every
uncertainty — no recorded identity, no permission to probe, non-Linux,
unreadable `/proc` — is treated as ALIVE." Its two halves are the technique's
steps 2 and 3:

- **Existence** — `_pid_alive()` (`:508`). With `psutil` present a zombie is
  reported *dead* on purpose, because "a zombie executes no code and cannot be
  using a lock or reservation," while the fallback `os.kill(pid, 0)` would call
  it alive and wedge the key. `PermissionError` and every other `OSError`
  return `True`.
- **Sameness** — `_read_proc_starttime()` (`:539`) reads field 22 of
  `/proc/<pid>/stat` as the start token; a live PID whose token differs is a
  different process that reused the handle. `None` (non-Linux, unreadable)
  makes no reuse claim.

Both degradations are exactly the technique's "degrade in the safe direction":
a missing start token loses reuse detection but keeps death detection, which is
why `_owner_identity_unprobeable()` (`:588`) qualifies *only* a record with no
PID at all, and is evaluated after the dead branch.

The fork pitfall the technique warns about is in the tree as a fixed bug.
`_my_start_id()` (`:568`) caches the token *keyed by PID*, because "a plain
'already computed' flag would be inherited across `fork`, making a worker
publish reservation records carrying its own PID but the master's start id" —
a live worker read as a PID reuser. The keyed-lock path avoids the question
entirely by having the arbiter stamp identity at grant time: `_start_delta()`
(`:666`) is computed inside the manager server, so the lock is "structurally
independent of any client-side identity cache" (`:890`).

## The payoff, stated by the tree

`_KeyedLeaseLock` (`:890`) closes with the sentence the technique argues for:
"Dead-only: a live (merely slow) owner is never preempted, so no fencing token
is needed" (`:904`). No generation counter, no fenced writes, no stale-write
rejection — the machinery a renewable lease requires is absent because the
window it covers cannot open.

`KeyedHolderTable.try_acquire()` (`:779`) implements probe-outside, swap-inside
literally: the snapshot is taken under a `threading.Lock`, `_holder_dead(snap)`
runs outside it because "system calls may be slow and must not stall RPCs for
other keys" (`:799`), and the install is a compare-and-set on `lease_id` so a
slot that changed while probing is left alone (`:805-811`).

## Reclaim as a verdict, and the fence

`make_owner_record(token, kind)` (`:2260`) records the operation class at claim
time, and `_RERUNNABLE_RESERVATION_KINDS` (`:2183`) holds only `processing` and
`scan`. `_dead_reservation_updates()` (`:2299`) clears the slot for those and,
for `custom_chunks` / `delete` / `clear`, clears the flags but sets
`recovery_required`, because a destructive holder "may have half-committed."
All of it lands in a single `status.update` so a crash mid-recovery cannot tear
it apart.

The undecidable branch is present and reasoned: `_dead_pipeline_reservation_updates()`
(`:2343`) fences a record with no probeable identity rather than reclaiming or
ignoring it, leaving its flags in place and surfacing a 503 plus a documented
`/documents/recovery/force_reset` exit "instead of a 409 that can only be
cleared by restarting the service" (`:2384-2399`).

Reclaim runs on the arrival path, not on a sweep: `_prepare_pipeline_reservation_decision()`
(`:2577`) folds recovery updates into the same snapshot every acquire already
takes, and `reap_dead_reservations_locked()` (`:2452`) exists only for the one
caller that waits without acquiring — the manual drain in `lightrag/pipeline.py:3412`
and `:3922`.

## Where the tree falls short

**1. The hung holder is unrecoverable, and the tree says so rather than fixing
it.** `_still_run_owner()` (`lightrag/pipeline.py:3149`) is "an in-memory owner
check, deliberately NOT an expiring lease," and the comment concedes that
"forcing takeover from a process that is alive but unreachable would require a
storage-verifiable fencing token, which the no-new-field design does not have"
(`:3155-3159`). This is the technique's stated cost taken without its stated
mitigation: no progress marker is emitted, so a worker wedged inside a model
call that never returns holds `busy` indefinitely with no automatic exit. The
technique asks for a visible age on the operator surface plus a named reset;
the reset exists (`force_reset`) but is reachable only through the fence, which
a *live* hung holder never raises.

**2. The proof is available on one platform, and its absence is silent.**
`_reservation_recovery_enabled()` (`:2186`) returns false unless multi-worker
*and* Linux, so on any other host the reservation reclaim layer is a no-op
rather than a declared degradation. Off Linux the keyed lock still probes, but
through the paired-sample `_start_delta()` fallback whose
`_NON_LINUX_START_DELTA_TOLERANCE = 1.0` (`:505`) is documented as leaving a
window in which "a PID reuser whose start time is within 1s of the dead owner's
goes undetected until the PID itself dies." The technique's "say which regime
you are in" is satisfied in the docstrings; it is not satisfied at runtime,
where an operator on a non-Linux host gets neither reclaim nor a warning.
