---
layer: application
type: application
subject: schema-driven-ui
technique: registry-mapping
stack: react
verified_on: 2026-11-16
verified_against: react@19
---

# Two registries, two dispatch styles — cockpit widgets and SurfaceSpec blocks

*Re-resolved 2026-11-16 against the personas tree at HEAD `8d076db46a`
(2026-11-08), read through `git show`/`git grep` only; `package.json` pins
`react ^19.2.6` and `zod ^4.3.6`. Forged 2026-08-18; every cockpit anchor
below moved since, because the cockpit panel was split into `panel/` files.*

The repo realizes kind→component mapping twice, in the two idiomatic styles,
and the pair is a working comparison of their trade-offs.

## Style 1: the record registry — `cockpitWidgetRegistry`

`src/features/home/sub_cockpit/widgetRegistry.ts:96-204` is a
`Record<string, ComponentType<CockpitWidgetProps>>` mapping 30 widget kinds
(`persona_overview`, `metric_spark`, `verdict`, `flow_steps`,
`use_case_set`, …) onto one component each. Layout policy is registry-side
too, now as a default rather than a rule: `WIDGET_DEFAULT_SPAN` (`:79-94`)
gives a kind its column span when the composer states none, and the
composer's own `span` always wins; a kind absent from that table falls back
to 6. (The 2026-08-18 text cited a `cockpitRowSpan(kind)` function; it is
gone.)

Dispatch is a lookup, and it now happens in three hosts that share the
registry:

- `CockpitWidgetCell` (`panel/CockpitGrid.tsx:33-49`) resolves
  `cockpitWidgetRegistry[widget.kind]` (`:38`); a miss renders an error
  `Tile` **naming the unknown kind** (`:40-42`,
  `t.overview.cockpit.unknown_widget`) in the widget's own grid slot. That
  is the operator-facing placeholder variant the vocabulary technique
  carves out, appropriate here because the cockpit viewer is the person
  steering the composing agent.
- Athena's chat column (`features/companions/athena/InlineChatCard.tsx:103`)
  uses the same lookup with its own unknown-kind tile (`:104-110`).
- The council evidence well
  (`features/companions/curator/council/table/EvidenceWell.tsx:77-86`) uses
  it with a named unknown tile; its kinds are app-composed
  (`composeEvidence`), and the file's header explains why it shares the
  registry but not the cell (no action footer on evidence).

**Per-node containment now exists.** `panel/WidgetBoundary.tsx` is an error
boundary per widget: a widget that throws degrades to an error `Tile` in its
own place, keyed to retry when the config changes, and the failure is logged
with its kind. The grid (`CockpitGrid.tsx:45-47`) and the chat column
(`InlineChatCard.tsx:148-150`) wrap every widget in it, and
`widgets/__tests__/malformedConfig.test.tsx` pins it. The evidence well does
not wrap its widgets.

Spec-carried actions are **re-parsed at render**, now gated by the widget's
kind as well (`parseWidgetActions(widget.actions, widget.kind)`,
`CockpitGrid.tsx:39`; `briefing/actionTypes.ts:41-90`, mirrored by
`action_allowed_on` in `src-tauri/src/companion/brain/briefing.rs:68-72`).
The `briefing/actions.ts` header still routes every execution through the
`companion_decisions` audit ledger (`:13`).

Per-kind degraded states live with the components and are pinned by tests:
`widgets/__tests__/UseCaseSetWidget.test.tsx:6-9` asserts the empty-config
rendering. The folder now holds 28 test files (it held twelve when this was
forged).

**Gaps against the standard (reported, standard kept):**

- **The lookup answers for names nobody registered** (found 2026-11-16, read,
  not run). The registry is a plain object literal, so
  `cockpitWidgetRegistry[kind]` returns an inherited `Object.prototype`
  member for a kind spelled like one, and the `if (!Component)` miss check
  in all three hosts passes it. Kind `"toString"` resolves to a function
  that React calls as a component; called with no receiver it returns the
  string `"[object Undefined]"`, which renders as bare text in the grid
  instead of the unknown-kind tile. Kind `"constructor"` resolves to
  `Object`, which hands back its props object; React throws on it, and
  `WidgetBoundary` catches it as a generic widget error rather than an
  unknown kind. The side table has the same flaw:
  `WIDGET_DEFAULT_SPAN["constructor"]` is a function, so the span
  arithmetic at `CockpitGrid.tsx:37` yields `NaN`. These names are
  reachable because `compose_cockpit` still stores kinds unvalidated (next
  item). The fix is a `Map` or a null-prototype object, or an
  `Object.hasOwn` test before trusting a hit.
- `CockpitWidgetProps.config` is `Record<string, unknown>`
  (`widgetRegistry.ts:53-64`): the registry carries **no per-kind config
  validator**, so each widget narrows its own config (`widgets/narrow.ts`,
  named in the `WidgetBoundary` header) and the boundary is the net. The
  validation door cannot enforce per-kind contracts it does not hold.
- **Kinds are still not validated at dispatch for `compose_cockpit`**
  (`src-tauri/src/companion/dispatcher/dispatch.rs:968-989`; the
  2026-08-18 anchor `dispatcher.rs:1492-1523` moved when the dispatcher was
  split on 2026-08-22). The sibling `explain_in_cockpit` arm does validate,
  against a hand-written `EXPLAIN_KINDS` list (`:996-1006`), and drops
  unknown kinds with a warning. The vocabulary now has at least four
  hand-maintained copies: the registry, `EXPLAIN_KINDS`, the op line in
  `dispatcher/catalog.rs:796` that lists 12 kinds for `compose_cockpit`, and
  the constitution doctrine the registry header still tells you to update
  (`widgetRegistry.ts:8-10`). The comment on `council_media` (`:131-137`)
  treats absence from "every Rust op allowlist" as a security property,
  which depends on those copies staying apart on purpose. These were already
  registered under the `w4-prompt-assembly` anchor in the consumer's
  deviation register; cited here, not re-registered.
- **The chat column dispatches twice.** `InlineChatCard.tsx:53-100` handles
  six chat-only kinds (`report`, `fleet_plan`, `ship_milestone`,
  `ship_goals`, `note_suggestions`, `lifecycle_proposal`) in an `if` chain
  before it consults the registry. The comments give each a reason (not
  pinnable, confirm needs the card id), but it is a second dispatch path,
  and the registry no longer tells you every kind the chat can render.

## Style 2: the exhaustive switch — `SurfaceBlockView`

`surface/SurfaceRenderer.tsx:193-308` dispatches the seven SurfaceSpec block
kinds through a `switch` on a zod discriminated union. Each case maps onto
one blessed catalog primitive: `stat_row`→`StatCard` grid,
`table`→`UnifiedTable`, `decisions`→`DecisionRow`,
`markdown`→`MarkdownRenderer`, `gauge`→`ConfidenceArc`,
`progress`→`StatCard`+mini-bar, `terminal`→`CliOutputPanel`. The header
comment states the closure rule: "The switch below is the ENTIRE vocabulary
… no new visual primitives, no arbitrary HTML" (`:6-7`). The `default` arm
is a compile-time exhaustiveness guard (`const _never: never = block`,
`:300-306`). An unknown kind is unreachable here *because the validation
door already dropped it*, which is the right division of labor: the door
owns unknown kinds, the dispatcher owns known ones, and the type system
proves the set is covered. `SurfaceBlockView` is now exported (`:190-192`)
so that a markdown document can render one block on its own (see the
spec-validation application).

Config validation is registry-side in this style: each kind's schema sits
beside its literal in `surfaceSpec.ts:90-179`, so "add a block type" means
one schema, one case, and one row in the emitter doc (the `surface/SPEC.md`
block table). That is three edit sites, with the schema as the authority the
other two mirror.

The switch style is not immune to the inherited-key flaw either. The table
case renders `row[col.key]` (`SurfaceRenderer.tsx:326-332`) for column keys
the spec supplied, so a column keyed `constructor` over rows that lack it
renders the source text of `Object` where the "—" missing-value mark
belongs.

## The comparison, distilled

The record registry scales to many kinds and keeps growth to one edit site.
As implemented, though, it holds no config contracts, its emitter docs are
hand-synced in four places, and its lookup is not own-key. The switch style
carries typed config contracts and proven exhaustiveness, but every addition
edits the dispatcher itself, and the emitter doc is still a parallel
artifact. The standard's target is the union: record-style registration on a
structure with no inherited keys, *carrying* the per-kind validator and the
emitter-facing description, so the door, the dispatch, and the generated
vocabulary docs all derive from one entry.
