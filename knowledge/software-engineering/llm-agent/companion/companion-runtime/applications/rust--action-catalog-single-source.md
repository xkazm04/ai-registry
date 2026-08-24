---
layer: application
type: application
subject: companion-runtime
technique: action-catalog-single-source
stack: rust
status: forged
verified_on: 2026-08-23
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
> (`dispatcher/catalog.rs:1-4`)

## Confirmed: one door, and it closes

`ALLOWED_ACTIONS` (`catalog.rs:11`) is checked at `dispatch.rs:1840` before any
`propose_action` envelope proceeds, and an unknown action is rejected with a
warning rather than passed through. `ALLOWED_ROUTES` gets the same treatment at
`dispatch.rs:1365`. The catalog also carries `READ_OPS` (`catalog.rs:209`),
`ALLOWED_LAB_MODES` (`:272`), `GUIDED_TOPICS` (`:312`) and the caps
(`READ_OP_QUERY_MAX` `:252`, `COMPOSE_MIN_STEPS`/`COMPOSE_MAX_STEPS` `:330-331`),
so the read/mutate split and the bounds are declared in one file. That is the
one-validation-door half of the technique, and it holds.

## Deviation: the catalog is a copy, not a source, and the code says so

Nothing is generated from these tables. The teaching text is a separately
authored constitution, and the mismatch is a known, documented hazard — recorded
in a code comment at the exact entry it bit (`catalog.rs:30-35`):

> `build_oneshot` is the autonomous sibling of `prefill_persona_create` …
> It **MUST** be here or the dispatcher silently drops the OP — Athena emits it
> (the constitution teaches it and `approvals.rs::execute_build_oneshot` handles
> it on approve), but without this entry no approval card is ever created and
> nothing builds.

This is the technique's asymmetry told from the inside: the prompt taught a
capability, an executor implemented it, and the third copy — the allowlist — was
the one that had to be remembered. The failure mode was not an error. It was an
action that validated away to nothing while the model, the constitution and the
executor all agreed it existed.

## Deviation: six copies of one widget vocabulary

The composed-surface family is the worst instance, and the product's own feature
doc counts it (`docs/features/companion/cockpit.md:13`):

> widget kind strings are currently duplicated across five places with no shared
> source of truth (registry, dispatcher allow-list, briefing sanitizer,
> `InlineChatCard`, and the constitution), so adding a widget means editing all
> five.

There is a sixth. `EXPLAIN_KINDS` is a **function-local** constant declared
inside the `explain_in_cockpit` arm of the dispatcher (`dispatch.rs:954-964`,
nine kinds), invisible to every other consumer and to the count above. The
frontend copy is `cockpitWidgetRegistry`
(`src/features/home/sub_cockpit/widgetRegistry.ts:51`), read by both the cockpit
panel (`CockpitPanel.tsx:450`) and the chat transcript
(`src/features/plugins/companion/InlineChatCard.tsx:83`).

## Deviation: validation asymmetry between two paths of one feature

The same feature doc records the consequence (`cockpit.md:9`):

> `explain_in_cockpit` validates widget kinds against a 9-kind allow-list and
> drops the rest; the **persistent** `compose_cockpit` path validates only that
> `widgets` is a non-empty array, so a hallucinated kind is written to disk and
> renders a red error box on every open, with no reset path.

Both paths are visible side by side in the dispatcher: `compose_cockpit` checks
only `widgets.is_empty()` (`dispatch.rs:926-931`) and then stores the spec
verbatim; `explain_in_cockpit` filters every widget against `EXPLAIN_KINDS`,
keeping the good ones and emitting a warning per drop (`dispatch.rs:965-990`).
The ephemeral path is strictly validated and the **persistent** one is not,
which is the inversion of where the cost falls. The doc adds that the strongest
validation in the feature — kind allowlist, caps, and a per-kind action
cross-check — lives in the morning-briefing sanitizer, "outside the dispatcher
entirely".

## Deviation, then confirmation: the reset path

`cockpit.md:9` names the missing floor directly — "with no reset path" — and
`:11` records that the successor engine has it:

> `SurfaceRenderer` — zod schema, salvage-instead-of-reject parsing, clamping, a
> frozen block catalog and consent-gated actions — is the newer engine … Those
> panels persist per project, carry a spec version, drop an unreadable spec
> rather than retaining it, and have a per-project reset — the specific failure
> this surface still has.

So the rule this technique states — anything a model can compose, a person can
reset in one action — was learned here the expensive way and is implemented in
the replacement rather than retrofitted into the original. The doc's own guidance
is the same conclusion: "If you are adding a new dynamic surface, start from
`SurfaceRenderer`, not from `cockpitWidgetRegistry`" (`cockpit.md:13`).

## What generation would buy here

One table of kinds with a payload shape and a description per row, in the
lowest crate both sides can reach, would collapse the six copies to one and make
three of the four failures above impossible to reintroduce: the allowlist and the
constitution would agree because both are rendered from it; a kind with no
renderer would be a build failure rather than a red box on the user's home
screen; and the two cockpit paths could not diverge because they would share the
validator. The reset path is the one thing generation does not supply — that
stays a product decision, and it is the one the successor engine already made.
