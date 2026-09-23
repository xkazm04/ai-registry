---
layer: application
type: application
subject: companion-runtime
technique: action-catalog-single-source
stack: rust
status: forged
verified_on: 2026-09-23
verified_against: rust@1.96
---

# The op catalog and the cockpit post-mortem (Personas / Athena)

This companion emits actions as `OP:`-prefixed JSON lines inside its reply text.
A dispatcher scans the finalized text, parses each line into an envelope,
validates it, and either auto-fires it or persists an approval card
(`src-tauri/src/companion/dispatcher/dispatch.rs:1-8`). The action vocabulary
lives in a sibling module whose own header states the intent exactly as this
technique asks:

> The allow-lists. Every op name, route, lab mode, guided topic and guidance
> anchor Athena may propose is enumerated here — an op outside these tables is
> rejected before it can reach a database write.
> (`dispatcher/catalog.rs:1-3`)

Citations re-resolved on 2026-09-23 against the tree at `1b8161096`. The
toolchain witness is the observed `rustc 1.96.1`, which is also what the tree's
`rust-toolchain.toml` pins (a pin added 2026-09-18); the manifest floor is
`rust-version = "1.80.0"` (`src-tauri/Cargo.toml:218`).

## Confirmed: one door, and it closes

`ALLOWED_ACTIONS` (`catalog.rs:11`) is checked at `dispatch.rs:2190` before any
`propose_action` envelope proceeds, and an unknown action is rejected with a
warning rather than passed through. `ALLOWED_ROUTES` (`catalog.rs:414`) gets the
same treatment at `dispatch.rs:1446`. The catalog also carries `READ_OPS`
(`catalog.rs:244`), `ALLOWED_LAB_MODES` (`:397`), `GUIDED_TOPICS` (`:437`) and the
caps (`READ_OP_QUERY_MAX` `:327`, `COMPOSE_MIN_STEPS`/`COMPOSE_MAX_STEPS`
`:455-456`), so the read/mutate split and the bounds are declared in one file.
That is the one-validation-door half of the technique, and it holds.

## Moved since 2026-08-23: the teaching text is now generated

The first version of this application recorded that nothing was generated from
these tables and the teaching text was a separately authored constitution. That
is no longer true for the chat-class prompt. `OP_SECTIONS` (`catalog.rs:581`) is
a table of rows — name, gate, one-line intent, exact params shape — and
`render_op_reference()` (`:775`) renders the prompt's op reference from it, with
a header that says so. The pins arrived in two steps and are worth reading as a
sequence:

- 2026-09-03 (`c68db0d5ac`): `every_catalog_op_is_taught_by_the_constitution`
  (`catalog.rs:860`) asserts every `ALLOWED_ACTIONS` and `READ_OPS` entry is named
  in the hand-written constitution. Its doc comment records the measurement that
  motivated it: eight ops were wired end to end and never taught.
- 2026-09-17 (`322b14e5a5`): the generated reference, and
  `every_catalog_op_has_a_reference_row_and_vice_versa` (`:916`) — both directions,
  plus a duplicate-row check — and `every_catalog_op_is_taught_by_the_chat_family`
  (`:1029`).

Both matcher-based tests carry a positive and a negative control
(`the_documentation_matcher_finds_a_known_documented_op`, `:896`; and inline in
`:1029`) — the text-matching form of the technique's non-emptiness line.

What remains a copy: `OP_SECTIONS` restates the names that `ALLOWED_ACTIONS`,
`READ_OPS` and the test-only `AUTO_FIRE_ACTIONS` (`:513`) already carry, so this is
"checked against" rather than "derived from". The check runs both ways, so it
satisfies the technique; the single table with a gate column is the next step,
and the gate-agreement test (`reference_gates_agree_with_the_allow_lists`)
already derives the gate from table membership, which is that column's content.

## Deviation: the executor is a string match with a wildcard, and has more producers than the model

`execute_approval_action`
(`src-tauri/src/commands/companion/approvals/approval_lifecycle.rs:141`) is
documented as "the single executor table for both consent paths", and it is a
`match action { "run_persona" => …, … }` over a `&str` whose last arm is
`other => Err(AppError::Internal(… "unknown action" …))` (`:286`). A kind added to
`ALLOWED_ACTIONS` without an arm compiles and fails only when somebody approves it.

Measured 2026-09-23 by reading both lists out of source (comments stripped): 56
`ALLOWED_ACTIONS` entries, 61 executor arms; every allowed action has an arm, and
five arms have no allow-list entry — `kp_hire_request`, `compose_dashboard`,
`use_connector`, `post_team_message`, `night_shift_execute_plan`. Some of these
are filed by producers other than the model's `propose_action` line (a bridge
from another application, a night-shift planner, special-cased dispatcher arms).
This is the case the technique's per-producer condition was written from: an
"executor equals model vocabulary" equality would be false here by design, and
nothing today asserts the weaker, true properties (each producer's kinds have an
arm; each arm is reachable from some producer).

## Deviation, with history: the parity test that was not retired for its cost

A membership test, `containment_posture_tests::autonomously_used_actions_have_dispatcher_entries`,
once asserted that 22 hand-listed actions the autonomous loop leans on had
`ALLOWED_ACTIONS` entries, through a helper, `action_is_allowed`, "exposed so the
approval side can assert the two lists agree". It was emptied on 2026-08-21 by
`4bf1845d70`, a refactor that deleted 72 unreachable IPC commands "and everything
they held up": outside the test build the helper had no caller, so it was dead
code, and the test went with it. Nobody judged the test too expensive; it was a
hand list calling a helper that existed only for it, and a dead-code sweep cannot
tell a test's only dependency from dead code. The project re-established the property for three ops
in `dispatcher/tests.rs:583` (`the_ship_ops_are_on_the_lists_that_give_them_their_behaviour`),
whose comment names the retired test — again as a hand list.

## Deviation: six copies of one widget vocabulary

The composed-surface family is the worst instance, and the product's own feature
doc counts it (`docs/features/companion/cockpit.md:26`):

> widget kind strings are currently duplicated across five places with no shared
> source of truth (registry, dispatcher allow-list, briefing sanitizer,
> `InlineChatCard`, and the constitution), so adding a widget means editing all
> five.

There is a sixth. `EXPLAIN_KINDS` is a **function-local** constant declared
inside the `explain_in_cockpit` arm of the dispatcher (`dispatch.rs:996-1006`,
nine kinds), invisible to every other consumer and to the count above. The
frontend copy is `cockpitWidgetRegistry`, a `Record<string, …>`
(`src/features/home/sub_cockpit/widgetRegistry.ts:52`) — keyed by `string`, so
the frontend compiler cannot demand an entry per kind — read by both the cockpit
panel (`CockpitPanel.tsx:466`) and the chat transcript
(`src/features/plugins/companion/InlineChatCard.tsx:103`).

## Deviation: validation asymmetry between two paths of one feature

The same feature doc records the consequence (`cockpit.md:22`): the persistent
`compose_cockpit` path "validates only that `widgets` is a non-empty array, so a
hallucinated kind is written to disk and renders a red error box on every open,
with no reset path." Both paths are visible side by side in the dispatcher:
`compose_cockpit` checks only emptiness (`dispatch.rs:968-976`) and then stores
the spec verbatim; `explain_in_cockpit` filters every widget against
`EXPLAIN_KINDS`, keeping the good ones and warning per drop (`dispatch.rs:1008-1027`).
The ephemeral path is strictly validated and the **persistent** one is not,
which is the inversion of where the cost falls.

## Deviation: every half of a reset, and no reset

This surface now has each of the three things the technique names as *not* a
reset, and still lacks the one action:

- **A floor that is only a first-run state.** A deterministic, model-free default
  board shipped (`cockpit.md:13`; `src/features/home/sub_cockpit/defaultCockpit.ts`),
  and its header states the precedence: "Athena's composed spec always takes
  PRECEDENCE when present — this is the fallback" (`defaultCockpit.ts:11`). After
  the first composition, nothing returns to it.
- **An undo whose slot is model-composed, with no control.** The sibling
  dashboard store keeps one prior version and `reset_dashboard`
  (`src-tauri/src/companion/brain/dashboard.rs:177`) swaps it back — honestly
  designed ("a reset can itself be reset"), and marked
  `#[allow(dead_code)] // awaiting a companion_reset_dashboard command` (`:176`).
  The prior version it restores was itself written by `compose_dashboard`.
- **A reset in the successor engine.** `SurfaceRenderer` panels "have a per-project
  reset — the specific failure this surface still has" (`cockpit.md:24`).

`cockpit.rs` itself (`src-tauri/src/companion/brain/cockpit.rs:1-7`) still
describes `compose_cockpit` as overwriting the singleton spec; it merges
user-pinned widgets forward (`:63-67`) but has no restore. The floor exists; the
action that reaches it does not.

## What generation would buy here

The prompt half of this has already happened, and the tests that pin it are the
technique's shape. What is left is the other direction: the executor and the
surfaces. A closed kind type in the catalog — rather than `&[&str]` — would make
the executor match exhaustive at compile time and remove the wildcard arm; the
repo already generates TypeScript from Rust source for its command names
(`src/lib/commandNames.generated.ts`, a union read by the invoke wrapper), so the
same move over the kind set would let every frontend table be a
`Record<Kind, …>` the compiler checks. The reset is the one thing generation does
not supply, and here it is the smallest missing piece: a floor that already
exists and a control that points at it.
