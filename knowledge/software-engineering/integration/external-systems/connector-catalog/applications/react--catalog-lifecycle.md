---
layer: application
type: application
subject: connector-catalog
technique: catalog-lifecycle
stack: react
status: forged
verified_on: 2026-09-23
verified_against: react@19
---

# A catalog with no lifecycle vocabulary, and a door that filters the only list

*Verified against the project tree at `f05c1759f` (react 19.2.6 from the lockfile).*

The technique puts the deprecation stage in the offering lists: an entry is
hidden from discovery and pickers, but lookups by identity still return it.
This tree cannot express that stage, and its one existing gate shows why the
split matters. It hides a row from new adoption by removing the row from the
only list that existing references read.

## The row has no stage to filter on

`ConnectorDefinitionBase` (`src/lib/types/types.ts:241-263`) carries identity,
presentation, auth schema, capabilities, category and an open `metadata`
blob. It has no status, stage or deprecation field. None of the 135 row
files under `scripts/connectors/builtin/` declares one. The gallery's filter
pipeline (`usePickerFilters.ts:81-100`) therefore has nothing to apply: a
consumer map's "the picker applies no lifecycle predicate" is accurate, but
the gap belongs to the catalog, not the picker. A predicate needs a
vocabulary to test, and the row does not have one.

## Retirement happened, as a bare delete

The catalog has retired entries once. Migration
`src-tauri/db/src/migrations/incremental/c01_plugin_tables.rs:690-697` deletes
two shipped rows by name, with the comment "any user credentials referencing
them via the canonical tables remain intact". That is the outcome the
technique's third stage warns about. Credentials survive and the type they
name is gone, so every resolver lookup for those credentials returns nothing,
with no tombstone to supply a label or a "retired on" fact. The deletion is
per-identity and hand-written. Nothing computes the set difference between
the shipped rows and the installed ones, which is the adjacent gap the
technique names.

## The one gate that exists is applied at the door, to both reads

The enumeration door is `fetchConnectorDefinitions`
(`src/stores/slices/vault/credentialSlice.ts:405-427`). It applies one
predicate, plugin dependency: a row declaring `requires_plugin:
"obsidian-brain"` is dropped while that plugin is not ready (`:409-421`). The
filtered list becomes the store field `connectorDefinitions` (`:423`). That
same field is read by the gallery and also by 16 lookups by identity across
15 files (`connectorDefinitions.find(...)`, e.g. `SidebarLevel2.tsx:96`,
`useHealthyConnectors.ts:39`, `connectorRunnability.ts:156`). When a user
disconnects the plugin, the gate that should only stop new adoption also
removes the row from their existing credential's lookups.

The split the technique asks for was designed here once. It is in
`src/features/plugins/obsidian-brain/useVisibleConnectorDefinitions.ts:5-17`,
a selector applying the same predicate, whose doc says to use it "in places
where the user *picks* a connector" and not "in admin-only listings where
every connector should be visible regardless of state". That is an offer read
layered over an unfiltered list. It has no call sites; the only other
reference to it is a comment. The predicate landed in the door in the same
commit (`4b543fc5b5`, 2026-04-15), so the unfiltered list the selector's doc
assumes has not existed since the day the selector was written.

## What this realization cannot show

- **No deprecation has ever run here**, so the tree cannot show the
  technique's runway (a banner on existing uses, a replacement named). It
  shows only the two cheap outcomes: an entry is either present and offered,
  or deleted and dangling.
- **The resolvers' degraded paths were not traced.** Each of the 16 lookups
  handles a miss in its own way (`useAutomationSetup.ts:134` returns `null`,
  for example). Whether a missing row produces a broken surface or only a
  plainer one has not been measured.
- **Categories are the same shape of problem on another axis, and are out of
  scope here.** The picker filters on the scalar `category` (`:83-85`) even
  though 85 of the 135 row files declare more than one category, because the
  multi-valued list is "declared in builtin JSON, not stored on backend"
  (`types.ts:253-254`). The union accessor that reads the list
  (`builtinConnectors.ts:231-243`) looks it up from the bundled JSON by name,
  so a consumer holding stored rows cannot use it.
