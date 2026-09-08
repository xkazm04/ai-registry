---
layer: application
type: application
subject: client-state
technique: status-fsms
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.96
---

# Status FSMs — the backend half of a desktop app's job lifecycle

*Verified against the project tree at `ee124810f` (2026-09-05; the Tauri
backend of a React desktop application). Runtime witness: `rust-version =
"1.80.0"` in `src-tauri/Cargo.toml` is the floor, CI builds on
`dtolnay/rust-toolchain@stable`, and the local toolchain is `rustc 1.96.1`.*

The subject's react application reads the status machine from the WebView
side (`processActivitySlice`). This tree also runs the machine's *authority*
one process over: `src-tauri/src/background_job.rs` (1,406 lines) is a
generic `BackgroundJobManager<E>` declared as twenty-five `static`s, one per
job family, each a `Mutex<HashMap<String, JobEntry<E>>>` keyed by job id.
It is the map-keyed machine the technique prescribes, with the reaper
discipline done unusually well and the vocabulary discipline done by half —
and the half-done part was introduced by the commit that tried to fix it.

## Keyed by what runs concurrently, with exclusivity enforced

The map is keyed by the durable job id; every read and write goes through
the id. Where the domain genuinely serializes — one run per job id — the
machine enforces it rather than assuming it: `insert_running` (`:470-498`)
and `resume_running` (`:619-655`) refuse a start while an entry is
`running`, and `ensure_not_running` (`:447-465`) exposes the same check.
The refusal is typed as a capacity refusal (`RateLimited`, retryable)
rather than a caller error; the comment at `:452-462` records that the
opposite typing once told twenty-two call sites a transient "come back
later" was a permanent misconfiguration.

`resume_running` is also the technique's "a start arriving while settled
replaces, explicitly": it clears the previous attempt's abort handle and
cancel verdict (`:640-645`) *because* "a stale `Reclaimed` [would] vouch
for a task that has not been spawned yet" — the transition knows what
else it implies.

## Entries name their reaper — three times

- **TTL on settled entries.** `evict_stale` (`:368-371`) drops non-running
  entries older than thirty minutes; `evict_completed_with_cap`
  (`:375-400`) adds an LRU cap that never evicts a running row.
- **A bound on how long `running` can credibly last.** `sweep_stale_running`
  (`:403-444`) marks any `running` entry older than ten minutes plus a
  thirty-second grace as `failed`, with a diagnostic naming the elapsed
  time and the limit. This is the "completion event lost in transit"
  reaper the technique demands, and the tree learned it the hard way: the
  frontend twin's comment names the "29 running personas" incident.
- **Reaping at read time.** Both sweeps run inside `get_snapshot` and
  `list_snapshots` (`:847-848`, `:866-867`), so a poll cannot observe a
  phantom `running` row older than the bound.

## Failure carries its evidence — and the evidence had to grow an axis

Every terminal write carries `error: Option<String>` beside the status.
Commit `ae76c1fb8` (2026-09-04) found that one status value was covering
two facts: a cancel that merely *signalled* a task and a cancel that
*reclaimed* it both wrote `failed` / "Cancelled by user", so "the terminal
row asserted a reclaim the system could not perform" (`:58-69`). The fix
is a second evidence field, `cancel_outcome: Option<CancelOutcome>`
(`Requested` | `Reclaimed`, `:76-87`), carried on the entry "not derived
from `status`, because the terminal status is `"failed"` in both cases and
only this field says whether the task was actually reclaimed"
(`:215-222`). The synchronous `cancel` (`:674-687`) can only ever record
`Requested`; `cancel_and_reclaim` runs the signal → grace → abort ladder
and records `Reclaimed` only after awaiting the handle (`:760-791`); the
stale sweep, which runs on a poll thread and cannot await, writes
`Requested` and an error text that refuses to say the task stopped
(`:417-436`). A panicking worker lands on `failed` with the panic message,
not on a stuck `running` (`spawn_job`, `:951-975`; test `:1088-1115`).

That is the technique's "failure is a distinct state carrying its
evidence" — with the addition that when one status must cover two
outcomes, the *evidence* is where the distinction lives, and the counter
pair `cancel_counts()` (`:302-307`) makes the gap between "asked" and
"stopped" a measurable.

## The vocabulary: an authority that nobody consults

The same commit added `JobStatus` (`:184-187`), whose doc comment states
the technique's rule exactly: "a transition is named rather than spelled:
the legal set is enumerable from the type, and a misspelled state is a
compile error instead of a job that never leaves `"runnning"`." Then it
enumerates two variants, `Running` and `Failed`.

Measured across `src-tauri/src`: `set_status` and `set_status_quiet` are
called with a raw string literal at **52** sites in 16 files — 13
`"completed"`, 9 `"cancelled"`, 11 `"failed"`, 19 `"running"` — and with
the enum at **2**. `"completed"` and `"cancelled"` are states the type
cannot name at all (`ffmpeg.rs:604`, `artist/mod.rs:509` are two of the
thirteen), so the compile-time guarantee the comment promises covers the
states least likely to be misspelled and none of the ones a job actually
ends in. The frontend, meanwhile, declares the wire vocabulary a third
time per feature — `'idle' | 'running' | 'completed' | 'failed'` at
`src/api/overview/reviews.ts:44`, plus `'awaiting_answers'` at
`src/api/templates/n8nTransform.ts:196` — and its activity dock has a
seven-member set of its own. Three vocabularies, no shared authority; a
renamed status would be found by whichever one it missed
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).

Two more transitions-are-the-API findings follow from the same seam:

- **`set_status` is a setter, not a transition.** It takes `status: &str`
  (`:501-508`) and writes whatever it is handed; no source-state check
  exists anywhere. The named transitions — `insert_running`,
  `resume_running`, `cancel*` — guard their own entry; every terminal
  write is a raw field assignment from the worker.
- **An unexpected transition half-applies by creating a row.**
  `set_status` upserts through `entry(job_id).or_default()` (`:510`), so
  a completion for a job id that was never started — or was already
  evicted by the TTL — mints a fresh entry with that terminal status and
  `created_at: now`. The snapshot then reports an empty-status entry as
  `"idle"` (`:851-855`), which is the technique's *never attempted*
  state synthesized at read time for a row that a side path (a cancel
  verdict, an abort registration) happened to create.

## Where the seam to the frontend runs

The manager emits one status event per write (`:515-522`); the WebView's
keyed machine (`processActivitySlice`, see the react application) is the
consumer. The two machines agree on the id and disagree on the vocabulary,
and the backend's `cancel_outcome` axis does not cross the boundary as a
status at all — the dock shows `cancelled` on a fact the backend only ever
records as `failed` plus evidence.

## Next change

Extend `JobStatus` to the four states writers use, make `set_status` take
it instead of `&str`, and let the compiler find the 52 sites. The doc
comment's promise becomes true at that moment and not before.
