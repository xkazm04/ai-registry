---
layer: application
type: application
subject: agent-chaining
technique: graph-to-wiring-translation
stack: rust
verified_on: 2026-10-31
---

# Graph-to-wiring translation — team handoff wiring

Where the technique lands in this repo:
`src-tauri/engine/src/team_handoff.rs` (`wire_team_handoff`), translating a
team's drawn connection graph (`persona_team_connections`) into the runtime
event wiring (`persona_triggers` rows) that makes an upstream member's
completion actually start the next member. The module doc records exactly
the failure the technique exists to prevent: adoption used to derive
subscriptions from a side channel (`event_subscriptions` on use-cases), so
personas whose job lived elsewhere got **no** handoff wiring and "the chain
died after the entry member."

## What conforms

- **One arrow is several rows.** Each non-feedback edge S → T produces two
  rows, both on the *target* persona: a `chain` trigger keyed on
  `source_persona_id = S` (the emitter rule — when S completes,
  `personas_db::chain::evaluate_chain_triggers` publishes a targeted
  `team_handoff.<T>` event with S's output forwarded via `payload_forward`)
  and an `event_listener` for `team_handoff.<T>` (the receiver rule — the
  bus only executes a persona with a matching listener, and `chain` is
  deliberately excluded from the auto-listener policy)
  (`team_handoff.rs:104-186`). The decomposition is explicit and documented
  in the module header, including *why* both rows are needed.
- **Listener-side conditions.** The condition rides the target-side chain
  trigger's config (`build_condition`, `team_handoff.rs:203-214`), not the
  emitter — sequential/parallel edges get `{"type":"success"}`, a
  `conditional` edge embeds its JSON predicate verbatim. The emitter stays
  an unconditional announcer, exactly the technique's default.
- **Idempotent re-apply.** Re-running skips edges already wired:
  `chain_trigger_exists` / `listener_exists` match on `json_extract` of the
  plaintext `source_persona_id` / `listen_event_type` config keys
  (`team_handoff.rs:216-242`), and the pass reports
  `skipped_existing` in its `HandoffWireResult` summary. Saving twice does
  not double-fire the downstream persona.
- **Feedback edges are never wired as forward flow.**
  `connection_type == "feedback"` edges are skipped at translation
  (`team_handoff.rs:105-108`) — they are revision loops, and the module
  notes the chain-cycle guard in `triggers::create`
  (`src-tauri/db/src/repos/resources/triggers/definitions.rs:245-254`, via
  `chain::detect_chain_cycle`) would reject them anyway. Static layer at
  the wiring door, confirmed twice over.
- **Drift is manually repairable.** The pass is exposed as the
  `repair_team_handoff` command (`src-tauri/src/commands/teams/teams.rs:50-55`),
  and `team_preset.rs` tracks `handoff_wired` + the last wiring error so
  the adoption modal can surface a "Repair handoff" affordance — the
  recomputation is named and invokable, per the technique.

## Where it deviates from the standard (kept, reported)

- **Append-only, not reconcile.** `wire_team_handoff` only *creates*
  missing rows; nothing anywhere deletes the `chain` trigger or listener
  when the drawn connection is removed. A deleted arrow leaves an orphaned
  emitter rule and listener — the exact "agent that starts by itself"
  ghost the technique names. This is the golden path's registered
  counter-evidence.
- **No edge-id tagging.** Wiring rows are matched back to edges
  structurally (persona pair + event type via `json_extract`), not by a
  stored edge id — so a true reconcile pass (set difference on edge ids)
  and a "this arrow is drawn but not wired" drift report both lack their
  cheap implementation. Fan-in sharing one listener per target
  (`handoff_event_type` is per-target, `team_handoff.rs:56-59`) makes
  naive per-edge deletion additionally unsafe: the listener is legitimately
  shared by multiple inbound edges.
- **Partial-failure tolerance instead of transactionality.** A failed
  trigger create is warn-logged and the loop continues
  (`team_handoff.rs:152-155,176-179`), so an edge can end up
  emitter-wired but listener-less — announcing into the void — until the
  next repair pass. The `HandoffWireResult` counters make the gap visible,
  but the pass is not transactional per graph as the technique prescribes.

## Context worth carrying

The drawing surface itself moved: the reducer-board canvas that originally
drew these graphs was deleted as orphaned (see the corpus note at
`#w7-canvas-graph` in the consumer's deviation register); the
surviving authoring surface for team connections is the Mastermind flow
(`src-tauri/src/commands/design/team_synthesis.rs:736` calls
`wire_team_handoff` after synthesis, and `team_preset_adopter.rs:662` on
adoption). The wiring module outlived the canvas that fed it — evidence for
the technique's claim that the drawn graph and the runtime wiring are
separate artifacts with separate lifetimes.

Re-checked 2026-10-31 at personas@61029d7ae: `team_handoff.rs` is unchanged
in substance and every anchor in it still resolves (`:56-59`, `:104-186`,
`:105-108`, `:152-155`, `:176-179`, `:203-214`, `:216-242`), as does
`repair_team_handoff` (`teams.rs:50-55`). The verdicts hold: nothing deletes
wiring when an arrow goes, because `delete_connection` removes only the
`persona_team_connections` row, and rows are still matched structurally, not
by edge id. Three anchors moved and are updated above. The cycle guard
followed the 2026-08-22 split of the triggers repository into
`triggers/definitions.rs`. Synthesis calls the wiring pass at
`team_synthesis.rs:736`. Adoption calls it at `team_preset_adopter.rs:662`,
and the member-retry path now re-wires at `:974` too. The deviation-register
pointer had lost its form and is restored. Since the last check, the
Mastermind canvas was retired as well (the register's 2026-09-25 entry), while
both wiring call sites survive. That strengthens the closing claim. One thing
this document never carried, though it predates the first check: the relay
suppresses a `team_handoff.*` emitter whenever the completing run is already a
chain execution or an assignment step (`chain.rs:489-533`, recorded as
`handoff_suppressed`). So the wiring makes the next member start for one hop
only. Flow over more steps belongs to the team's DAG, and a sequential A -> B
-> C drawing wires B -> C rows that the relay will not fire from a chained B.
