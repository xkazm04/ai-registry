---
layer: application
type: application
subject: schema-driven-ui
technique: registry-mapping
stack: react
verified_on: 2026-10-31
---

# Two registries, two dispatch styles — cockpit widgets and SurfaceSpec blocks

The repo realizes kind→component mapping twice, in the two idiomatic styles,
and the pair is a working comparison of their trade-offs.

## Style 1: the record registry — `cockpitWidgetRegistry`

`src/features/home/sub_cockpit/widgetRegistry.ts:96-204` is a
`Record<string, ComponentType<CockpitWidgetProps>>` mapping 30 widget kinds
(`persona_overview`, `metric_spark`, `verdict`, `flow_steps`,
`use_case_set`, …) onto one component each. Layout policy is registry-side
too: `WIDGET_DEFAULT_SPAN` (`:79-93`) gives each kind a default column span,
used only when the spec states none, so the emitter speaks no geometry beyond
an optional `span` the host clamps to 1–12.

Dispatch is a lookup: `CockpitWidgetCell` (`panel/CockpitGrid.tsx:32-48`)
resolves `cockpitWidgetRegistry[widget.kind]`; a miss renders a **per-node
error Tile naming the unknown kind** (`:39-41`,
`t.overview.cockpit.unknown_widget`) inside the widget's own grid slot — the
operator-facing placeholder variant the vocabulary technique carves out,
appropriate here because the cockpit viewer is the person steering the
composing agent. A hit renders inside a per-widget `WidgetBoundary`
(`:44-46`, `panel/WidgetBoundary.tsx`) that logs the throw and shows that
widget's fallback, retrying when its config changes — the per-node
containment the technique asks for. Spec-carried actions are **re-parsed at
render** (`parseWidgetActions`, `CockpitGrid.tsx:29-31` and `:38` — "never
trust a stored/composed spec's raw shape") against an explicit enum
(`briefing/actionTypes.ts:11-15`), and every execution lands in the
`companion_decisions` audit ledger (`briefing/actions.ts:9-11`).

Per-kind degraded states live with the components and are pinned by tests:
`widgets/__tests__/UseCaseSetWidget.test.tsx:6-9` asserts the empty-config
rendering; sibling test files in the same directory do the same for their
kinds, and `malformedConfig.test.tsx` covers bad config — config in, surface
out, the widget contract as executable spec.

**Gaps against the standard (reported, standard kept):**

- `CockpitWidgetProps.config` is `Record<string, unknown>`
  (`widgetRegistry.ts:53-55`) — the registry carries **no per-kind config
  validator**, so each widget self-defends. The validation door cannot
  enforce per-kind contracts it doesn't hold.
- `compose_cockpit` kinds are **not validated at dispatch**
  (`src-tauri/src/companion/dispatcher/dispatch.rs:968-988`), while its
  sibling `explain_in_cockpit` drops unknown kinds with a warning (`:1020`).
  The emitter's vocabulary still lives as hand-written doctrine in the
  constitution template rather than being generated from this registry — the
  registry header itself instructs "update the doctrine … so Athena knows"
  (`widgetRegistry.ts:8-10`). Since 2026-10-19 a parity test
  (`widgets/__tests__/widgetKindParity.test.ts`) reads five emitter-side kind
  lists and fails when one names a kind the registry cannot render. It checks
  one direction only: a registered kind the doctrine never mentions passes.
  Two hand-maintained copies, now compared, still not one authority.
  Both registered under the `w4-prompt-assembly` anchor in
  the consumer's deviation register; cited here, not re-registered.
- **Invalid actions vanish.** `parseWidgetActions`
  (`briefing/actionTypes.ts:31-36`) drops unknown kinds and missing targets
  without a trace, where the standard renders a half-valid proposal
  disarmed, with its reason.

## Style 2: the exhaustive switch — `SurfaceBlockView`

`SurfaceRenderer.tsx:193-306` dispatches the seven SurfaceSpec block kinds
through a `switch` on a zod discriminated union, each case mapping onto one
blessed catalog primitive — `stat_row`→`StatCard` grid, `table`→`UnifiedTable`,
`decisions`→`DecisionRow`, `markdown`→`MarkdownRenderer`,
`gauge`→`ConfidenceArc`, `progress`→`StatCard`+mini-bar,
`terminal`→`CliOutputPanel`. The header comment states the closure rule: "The
switch below is the ENTIRE vocabulary … no new visual primitives, no
arbitrary HTML" (`:5-7`). The `default` arm is a compile-time exhaustiveness
guard (`const _never: never = block`, `:300-305`) — an unknown kind here is
unreachable *because the validation door already dropped it*, which is the
correct division of labor: the door owns unknown kinds, the dispatcher owns
known ones, and the type system proves the set is covered.

Config validation is registry-side in this style: each kind's schema sits
beside its literal in `surfaceSpec.ts:90-179`, so "add a block type" = one
schema + one case + one row in the emitter doc (`surface/SPEC.md` block
table) — three edit sites, with the schema as the authority the other two
mirror.

## The comparison, distilled

The record registry scales to many kinds and keeps growth to one edit site,
but as implemented it holds no config contracts and its emitter docs are
hand-synced. The switch style carries typed config contracts and proven
exhaustiveness, but every addition edits the dispatcher itself and the
emitter doc is still a parallel artifact. The standard's target is the union:
record-style registration that *carries* the per-kind validator and the
emitter-facing description, so the door, the dispatch, and the generated
vocabulary docs all derive from one entry.
