# XL spec — `durable-agent-operations`

- **Run:** `pi-2026-09-04`
- **Source:** `github:earendil-works/pi` @ `744a94d` — an agent toolkit whose `packages/agent` carries a 27,820-word normative harness specification, ten numbered work packages with stated forces and rejected alternatives, a 38-item invariant list, a 28-row race catalog, and a published benchmark protocol. Landing page 990 words; in-tree documents 324,241.
- **Status:** DISPATCHED
- **Why XL and not five techniques:** the Phase 2d routing count returned **four load-bearing design decisions in one system with `corpus: NONE`**, all sharing one `HOME IF NEW`, plus one that lands as an amendment elsewhere. Under v2.2 that is a subject by construction, not a judgment call. The two nearest homes each disclaim the ground **in their own words**: `agent-runtime-assembly`'s boundary section says "about a record's lifecycle, go to job-coordination"; `job-coordination` owns a durable job record, a lease and a step position — a status column and a cursor, not a state machine whose leaves are the phases of an agent turn. The operator picked row 1 at the Phase 5 gate.

## Placement (verified against the authority, not against a count)

`knowledge/software-engineering/taxonomy.json` — `layout: "nested"`; it is the AUTHORITY and the folder tree is derived from it. `MAX_CHILD_DIRS = 10` in `scripts/lib/taxonomy.mjs` is enforced, not advisory.

- **`llm-agent/runtime-and-io` is the merits-correct home and is UNAVAILABLE.** It holds exactly **10** subjects (`streaming-output, subprocess-lifecycle, agent-cli-transport, mcp-tools, terminal-multiplexing, sidecar-provisioning, voice-io, agent-addressable-ui, agent-runtime-assembly, agent-browser-control`). An 11th fails `check-bundles.mjs` with `over the cap of 10`. Do not place there; do not "fix" it by subdividing the category as a side effect of this spec.
- **Place at `llm-agent/orchestration`**, which holds **9** subjects (`agent-chaining, fleet-orchestration, model-routing, hitl-approval, remediation-handoff, proactive-nudges, plan-review, session-continuation, tenant-scoped-agent-runtime`) and no subcategories, so the both-kinds prohibition is not engaged. Add `durable-agent-operations` as the 10th.
- Resulting path: `knowledge/software-engineering/llm-agent/orchestration/durable-agent-operations/`. Link depth from a technique to `_laws.md`: `../../../../_laws.md` — **identical** to `runtime-and-io/*/techniques/*`, so no citation depth changes if a later run moves it. Golden path to a sibling: `../session-continuation/session-continuation.md`.
- The golden path MUST say, in its boundary section, that the merits placement was `runtime-and-io` and the cap decided otherwise. A reader who cannot find the subject where it belongs deserves the sentence.

## The subject's job, in one sentence

**One accepted unit of agent work — a run, a compaction, a navigation — has a durable lifecycle that outlives the process executing it, and this subject owns what must be true at every point that lifecycle can be interrupted.**

## The boundary this subject must state, and must NOT absorb

- **`job-coordination`** (different bundle: `backend-platform/work-execution`) owns the generic durable work record: identity, closed status vocabulary, leases, liveness reclaim, terminal recovery. **Do not restate any of it, and do not link across the bundle line.** State the discriminator in prose: that subject's unit is *work whose executor may die*; this subject's unit is *an agent turn*, whose phases are a provider stream, a batch of parallel tool calls, a transcript that must stay source-ordered, and a compaction — none of which a status column can express. `step-position-and-resumability` is the closest neighbour and is genuinely different: a position plus a per-step idempotency declaration is a cursor over a list; the mechanism here is a total state that names its own next procedure.
- **`agent-runtime-assembly`** (same bundle, `runtime-and-io`) owns how the code around one model call is assembled: the hook chain, extension loading, assembly identity, what the loop may hold. **Link it; do not absorb it.** Two of its techniques are load-bearing neighbours and each needs one sentence:
  - `checkpoint-mode-custody` owns the custody discipline over the durable conversation record and states the representation choice as a **binary** (full = self-contained but quadratic; delta = linear but not self-contained). T1 below is the third option, and the golden path must say so without calling the neighbour wrong — the neighbour's binary is correct for a checkpoint that *contains the conversation*, and the escape is available only once the conversation is not in the checkpoint at all.
  - `indeterminate-closure-on-interruption` owns what an interrupted call's record must say. This run lands an **amendment** to it (see the separate landing); the golden path cites it and does not restate it.
  - `bounded-projection-of-external-work` owns work that outlives a turn and is submitted-never-polled. A deferred provider poll is an instance; do not re-derive its rules.
- **`session-continuation`** (same category, sibling) owns whether a live session's loop keeps going and how it is stopped: the continuation fact, the turn boundary, ordered teardown. The discriminator is sharp and must be written on both sides of T4: *that subject asks whether the loop should continue; this one asks whether an interrupted operation resumes without repeating what it already did.* `ordered-teardown` is the seam — see T4, which states a boundary against it, not a contradiction.
- **`streaming-output/cancellation-and-finalization`** owns the stream's own finalization. T5 owns what the *store* holds while the stream is uncertain. Cite, do not absorb.
- **`cost-metering/usage-ledgers`** owns spend as a durable fact. T2 must cite it for the usage row committed at intent, and must not restate ledger design.
- **Not in scope at all:** provider selection (`model-routing`), prompt composition (`prompt-assembly`), the tool protocol (`mcp-tools`), fleet-level dispatch (`fleet-orchestration`), process liveness (`subprocess-lifecycle`).

## Proposed techniques

Five. Each carries `use_when` and a decision-rules section. Slugs are fixed; argue in the report if one is wrong.

### T1 — `total-restart-point-by-reference`

**The decision rule:** after every durable transition, replace the operation's state with the **complete, total** current state — never a delta, never an appended journal entry — and keep that total state small by holding only bounded policy and the **ids** of large content, which lives at sibling addresses the terminal transaction deletes.

Must contain:

- Why this escapes the neighbour's binary. `checkpoint-mode-custody` is right that full checkpoints are quadratic *when the checkpoint carries the conversation*. Remove the conversation from the checkpoint and "full" costs O(1) per transition; the quadratic term was never a property of totality, it was a property of what was inside.
- What totality buys: recovery reads one value and dispatches to the responsible procedure. It never folds history, never infers position from an absent value, and never replays a journal. The source states this as a storage invariant — *no read on a hot path may fold history or infer state from an absent value* — and the golden path should carry that as the subject's spine.
- The counterpart obligation: crash states become **enumerable** — between transactions, never inside one — which is what makes an exhaustive per-state recovery test possible at all (see open question 1).
- The cleanup consequence: cleanup is **deletion, not collection**. A thirty-turn run replaces one value thirty times and then deletes it, leaving exactly the conversation and the ledger. No garbage collector, no tombstones, no compaction of the state store.
- Cite `unknown-is-not-a-value` if the anchor exists; verify in `_laws.md` before citing. Do not invent an anchor.

**Boundary:** vs `checkpoint-mode-custody` — representation choice vs what is inside the representation.

### T2 — `intent-mints-the-identity`

**The decision rule:** wrap every uncertain external effect in **two commits** — an intent that records "about to do X, its output will use ids R and U" before the effect, and a settlement that records the output and the next state after it. The identities the output will occupy are minted at intent, not at settlement.

Must contain:

- What the intent buys that a position does not: a crash *during* the effect becomes distinguishable from a crash *before* it, because the durable state says the effect is pending rather than "still at step N". Without it, the two are the same observation and recovery must guess.
- The identity half: because the output ids were minted before the effect, a recovered synthetic settlement occupies the *same* record slot the real one would have. Replay does not grow the record. This is `identity-survives-reuse` applied one step earlier than usual — verify the anchor.
- The four durable crash positions, which are the same for every repeat-sensitive effect: before intent (previous ordinary state; rerun as if nothing happened); after intent, before admission (pending); during or after the effect, before settlement (pending, indistinguishable from the previous — and that indistinguishability is the point, not a defect); after settlement (continue, never re-settle).
- The metering corollary: the usage row is part of the intent's reservation, so an interrupted generation is not free. Cite `usage-ledgers`.
- The honest non-goal: this does not make arbitrary external effects exactly-once. It makes the *record* exact and the recovery decision explicit. Say so.

**Boundary:** vs `step-position-and-resumability` — that technique's checkpoint ordering (effects durable first, then position) is one commit plus a cursor and its safety burden lands on at-least-once per step. This is two commits and the burden lands on a declared unknown-outcome policy. Both are correct; the discriminator is whether the effect's *identity in the output* has to survive the replay.

### T3 — `settlement-order-is-not-placement-order`

**The decision rule:** when several effects run in parallel but their results must appear in a fixed order, give the result a durable state **between** "the effect settled" and "the result is placed". Outcome durability follows completion order; materialization follows the required order; neither waits for the other.

Must contain:

- The failure it removes, as a trace: calls A, B, C run in parallel; B and C finish; A is still running; the process dies. Without the intermediate state B's and C's finished results exist only in memory, so recovery treats them as unresolved and may re-run effects that already completed. The cost is not a lost result — it is a **repeated side effect**.
- The two orders named separately, because conflating them is the whole defect: *outcome durability* = actual completion order; *entry materialization* = required source order.
- The placement rule: a settled-but-unplaced result is placed when every earlier position is complete or ready. Placement is a **prefix flush**, not an all-results barrier — a barrier at turn end is wrong, because an early-placed result would then exist in both the placed record and the in-flight projection at once.
- The projection consequence, which is where this technique earns its keep for a reader with a UI: a result that is settled but unplaced must remain visible as in-flight until its own placement event, not until the turn ends. The source found this as a real shipped bug — a call that vanished from the display between effect completion and placement, and reappeared only when placement happened — and the fix was to project the intermediate state rather than to hide it.
- The invariants a reader can test: every settled-unplaced result has exactly one finalized staged payload, no placed entry, and no leftover progress checkpoint; settled and placed results never execute again.

**Boundary:** vs `delivery-guarantees` (different bundle) — do not link; that subject orders *deliveries to consumers*, this orders *materializations into one record*. One sentence of prose.

### T4 — `two-cancellations-and-a-synchronous-door`

**The decision rule:** a caller's cancellation and the operation's cancellation are different things and must not share a mechanism. Aborting a caller ends only that caller's observation. Durable cancellation is a separate primitive that writes a marker; and the door between "may this effect start" and "the effect started" must be **one synchronous expression**, with all preparation completed before it.

Must contain:

- Why the split matters: a request's disconnect must not cancel the operation it was watching, and a cancellation must survive the disconnection of everyone watching. Collapsing them gives a system where closing a tab kills the work, or where killing the work requires someone to be watching.
- The synchronous-door rule and the race it removes, stated as a trace: if preparation happens *inside* the admission check, cancellation can win while preparation awaits — the effect is then admitted after cancellation was requested. Prepare first; then check-and-invoke with no yield between. The admitted boundary is the whole logical operation (including any lazy setup it does internally), not the eventual syscall.
- The consequence that makes it testable: exactly **two** orders exist for every admitted effect — admission-first (the effect starts, then cancellation signals it) and cancellation-first (the door refuses, the effect never starts). Every gated integration gets one test per order, and the catalog of what is gated is **closed and enumerated** — a list that can be checked, not a convention.
- What is *not* behind the door: commits, pure classification, synthetic results, and passive observers. Gating those is the common over-application and it deadlocks or silently drops writes.
- The durability rule: the door is **not durable state**. If the process dies before the cancellation commits, no cancellation exists; recovery trusts only the marker. A gate that "remembers" across a restart is a second source of truth.

**Boundary:** vs `session-continuation/ordered-teardown` — that technique governs *control guards that can refuse a stop* and requires one cancel path that clears every one of them. This governs *in-flight effects* and requires that the cancel path start nothing new. They compose and neither is the other; write the discriminator explicitly, because both are "the cancel path" to a casual reader.

### T5 — `close-is-a-controlled-crash`

**The decision rule:** shutdown writes no cancellation and no terminal state. It seals admission, drains what was already admitted, and stops — so reopening finds exactly the restart point a power loss would have left.

Must contain:

- The argument, which is a testing argument and should be stated as one: a distinct graceful-shutdown path is a **second recovery path**, exercised only on clean exits, and therefore the one that is wrong. Making close indistinguishable from a crash means the single recovery path is exercised by every shutdown, and the rare case stops being rare.
- What close may and may not do: it may seal new work, reject observations at its boundary, and release resources. It may **not** write cancellation, synthesize a settlement, remove a durable operation, or create an ownership-loss recovery path. An effect that finishes after the seal simply cannot commit — its write is refused — and the operation stays at its pending restart point.
- The negative case the reader will ask about: this is wrong when the interrupted work holds a resource nothing else can release, or when the effect is irrevocable and a shutdown could have compensated it. Name that condition; a technique that claims universality here is lying.
- The relationship to T2: close is safe *because* the effect boundaries are already two-commit. Without T2, "close like a crash" is just "lose work".

**Boundary:** vs `ordered-teardown` — the opposite stance on a different object, and the golden path must say so plainly rather than leave two techniques appearing to disagree. Teardown clears *guards a stop must defeat*; close clears *nothing*, because there is no stop being requested. The registry holds both and the discriminator is whether a person asked for the work to end.

## Open questions the drafter must DECIDE, not discover

1. **Whether a sixth technique on exhaustive recovery testing belongs here or in `test-harness`.** The source's test tier is unusually strong: for each durable state, construct it, close, reopen, drive, and assert the next transition — and explicitly, *invoking recovery twice from the initial prefix is not sufficient*, each half-completed prefix is its own case. There is also a writer-conformance tier that wraps the store in a recording decorator and asserts exact write order and content against the specification's transaction tables. Both are excellent and neither is obviously this subject's. **Decide and say why.** If it stays, slug it `recovery-prefix-enumeration`; if it goes, say so in the report and it will be banked as a lead — do not half-write it.
2. **Whether T3 should carry the projection half or hand it to a UI subject.** The in-flight-visibility rule is real and was a shipped bug, but `chat-transcript` and `streaming-output` both touch the display side. Decide; do not write it twice.
3. **The subject's own name.** `durable-agent-operations` is the spec's choice. If the golden path's opening argues better for `agent-operation-recovery` or `crash-safe-agent-turns`, change it and say why in the report — but change it *before* writing, because the slug is in every citation.

## Primaries the drafter may spend web budget on

The run spent **zero** of its three fetches; the whole budget is available and the source is a repository, so corroboration is corpus-internal and code-internal by default. Spend a fetch only to check whether a durable-execution or workflow-engine primary states T2's two-commit rule in the same terms — if it does, that is training-data convergence made explicit and T2 gets stronger. Do not spend a fetch on commentary about agent frameworks.

## What the drafter must NOT do

- Do not name the source, its packages, its types, or any product in the golden path or the techniques. The upper layers are name-free and `check-bundles.mjs` enforces part of it; the rest is review. The source's vocabulary is dense and quotable, which makes this the likeliest failure — every mechanism above has a plain-English name in this spec, and those are the names to use.
- Do not place in `runtime-and-io`. It is at the cap; see Placement.
- Do not restate `job-coordination`. Different bundle, no links, one prose discriminator.
- Do not write an application document. The source-tree applications for this repository are written by the intake director, not by the forge worker.
- Do not run any git command.
- **Override this brief where it is wrong, and argue it in the report.** Two workers dispatched on 2026-08-22 both overrode their briefs and both were right. If a neighbour's stated scope excludes a technique, or a boundary in this spec is drawn in the wrong place, say so with the file you read.
