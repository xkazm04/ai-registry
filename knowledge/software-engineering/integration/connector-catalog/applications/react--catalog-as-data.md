---
layer: application
type: application
subject: connector-catalog
technique: catalog-as-data
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
---

# The audience bridge: a side table that says out loud it is temporary

*Verified against the project tree at `c2a3c5fa1`.*

The technique names a transitional form and calls it "observed working in the
field": when a taxonomy axis is born beside the rows as a hand-maintained side
table, the honest bridge reads the row's own declaration first, falls back to
the side table, unions both, and **documents the direction of migration in
place**. `src/lib/credentials/connectorAudiences.ts` is that bridge, complete
with all four properties, and it is worth citing for a reason the technique
does not anticipate: the migration is at zero percent, so the file is also a
measurement of what the form costs when nobody finishes it.

## What the technique asks, and what the file does

**Row first, table as fallback, union.** `getAudiencesForConnector`
(`:180-192`) is nine lines:

```ts
  const fromMeta = audiencesFromMetadata(metadata);
  const fromFallback = FALLBACK_AUDIENCES[name] ?? [];
  if (fromMeta.length === 0) return [...fromFallback];
  if (fromFallback.length === 0) return fromMeta;
  // Union, preserving insertion order from metadata first.
  const set = new Set<Audience>(fromMeta);
  for (const a of fromFallback) set.add(a);
  return Array.from(set);
```

The row's declaration wins the ordering; neither source can suppress the
other. `audiencesFromMetadata` (`:153-171`) is the row-side reader, and it
carries a detail the technique's abstract version does not: the metadata blob
arrives across the IPC boundary as either a raw JSON string or an already-
parsed object depending on the caller, so the parser accepts both and returns
`[]` on anything malformed rather than throwing (`:156-164`). The closed
vocabulary is enforced inline in the same loop (`:168`), so an unknown token
in a row cannot widen the axis.

**The migration direction is stated three times, at three altitudes.** The
module header (`:11-15`):

> The data ideally lives in builtin connector metadata (`scripts/connectors/
> builtin/<name>.json -> metadata.audiences`). Until every JSON is migrated,
> `getAudiencesForConnector` first reads from a connector's own metadata blob
> and falls back to this static table for connectors that have not yet been
> tagged. Both sources may contribute — they are unioned.

The reader's own doc restates it more tightly (`:173-179`) and names the
consequence the union exists to buy — "so a partial migration does not regress
the filter." The side table's doc (`:26-36`) says what it is for in one clause
("Bridges builtin connectors that haven't yet had `metadata.audiences`
populated") and then spends the rest of the block on *why the axis moved onto
the rows at all*: the previous design forced audience to be implied by
category, "which lost precision for tools like Sentry, Linear, Notion". A
reader arriving cold learns the destination, the reason, and the cost of the
old shape without leaving the file.

**The closed vocabulary has one authority.** `Audience` (`:18`) is a
three-member union and `ALL_AUDIENCES` (`:20-24`) is its frozen runtime
mirror; both the row parser and the fallback table's type
(`Readonly<Record<string, readonly Audience[]>>`, `:37`) are keyed on it.

**The predecessor is a tombstone, not a second authority.**
`catalogRolePresets.ts` is thirteen lines: a `@deprecated` block (`:1-12`)
pointing at the new module and explaining that presets are now derived
emergently rather than authored, plus the surviving `RolePreset` type (`:13`)
kept only so existing imports compile. The retired role→category map is gone
from disk, not merely unused.

**Exactly one consumer.** `usePickerFilters.ts:97` is the only call site of
`connectorMatchesAudience` in the tree, inside a single `applyFilters`
pipeline (`:81-100`) where the other four axes read the row directly —
category from `c.category` (`:84`), license from the row's metadata (`:90`).
The call-site comment (`:76-80`) restates the migration story a third time and
names what the change bought: "Adding a new connector with a new category no
longer requires editing a separate ROLE_PRESETS table."

## The structural fact that makes this evidence

The technique's transitional form is easy to *describe* and rare to find
implemented honestly, because the honest version requires writing down that
your own data layout is wrong. Here the admission is load-bearing in three
places and the code shape matches it: a union rather than a precedence, an
inline closed-set filter on the row side so the destination state is already
validated, and a dead predecessor reduced to a type alias.

The sharper evidence is the contrast available *within the same directory*.
`connectorLicensing.ts` runs the same two-source problem with the precedence
**inverted**: `getLicenseTier` (`:176-186`) consults the static
`LICENSE_OVERRIDES` map first (`:180`) and treats the row's own
`metadata.pricing_tier` as the fallback (`:185`), with no migration comment
anywhere — the table is framed as the authority. A third sibling,
`connectorRoles.ts`, holds a pure `role → members[]` side table (`:72`) that
reads no row at all. So one tree carries three points on the technique's own
axis: a declared bridge migrating toward the rows, an undeclared bridge
migrating away from them, and a side table that never started. The first is
distinguishable from the other two only because it says which direction it is
going.

## Where the enumeration door is, and what it filters

The technique's single-door rule is half-satisfied and the split is clean
enough to be diagnostic. There is exactly one door: `list_connectors`
(`src-tauri/src/commands/credentials/connectors.rs:13-19`) is the only Rust
read, explicitly unauthenticated and unfiltered ("Public command — no IPC
token required (read-only, needed at startup)", `:17`); `listConnectors`
(`src/api/auth/connectors.ts:11-12`) is its only caller, itself called only by
`fetchConnectorDefinitions` (`credentialSlice.ts:322-344`), after which every
listing surface reads one store field. Filtering *at* that door is
plugin-dependency gating only (`:334-339`): a connector declaring
`metadata.requires_plugin` is dropped unless the dependency is satisfied, with
the reason at `:326-330`. Audience, license and category filtering all happen
per-surface instead, in `usePickerFilters`.

That is the technique's prediction rather than its prescription — the axes
that stayed at the door are the ones nothing can leak past; the axes that went
per-surface are one forgotten picker away from leaking.

The row shape itself is orthodox: `ConnectorDefinitionBase`
(`src/lib/types/types.ts:241-263`) carries minted identity, presentation,
auth schema (`fields`), capability declarations (`services`, `events`,
`resources`), a single-valued `category`, and the open `metadata` blob
(`:252`) the audience tags are migrating into. `categories?: string[]`
(`:254`) is a second axis mid-migration, annotated in the type itself —
"declared in builtin JSON, not stored on backend" — and `builtinConnectors.ts`
unions it with the singular field the same way (`:231-243`), the difference
being that both of *those* inputs are the row's own.

## What this realization cannot do or prove

- **The migration is at zero percent, and nothing in the tree knows.** None of
  the 134 row files under `scripts/connectors/builtin/` contains the string
  `audiences`. Every audience resolved today comes from the fallback table;
  the row-first branch (`:184`, `:186`) has never returned a non-empty result
  in production. The bridge is therefore proof that the *form* can be written
  honestly, and simultaneously proof that writing it honestly does not make
  anyone finish it. The technique says the scalar "is retired only when a
  migration has rewritten all rows" — it does not say what to do when the
  bridge outlives the intent, and this tree cannot answer that either.
- **No mechanism would notice the declaration lying.** The technique's closing
  demand is that every declarative field name the mechanism that would catch
  its lie. Nothing cross-checks `FALLBACK_AUDIENCES` keys against real
  connector names, and the drift is already measurable: of the table's 92 keys,
  20 match no `name` in any of the 134 row files — including one that is a
  near-duplicate of a key that does match. Each of those twenty tags a
  connector that does not exist, silently, forever. The seed generator validates string escaping,
  not taxonomy; the only closed-set enforcement is the inline literal
  comparison at `:168`, which drops unknown values without reporting them.
- **One axis is not a catalog.** This document evidences the transitional
  bridge and the row shape; it does not evidence the technique's central
  economic claim — flat cost for service N+1 — because nothing here measures
  what adding a connector actually costs, and two of the taxonomy axes still
  require editing a file that is not the row.
- **The stack split hides half the row's life.** The rows are authored as
  JSON, code-generated into Rust, seeded into SQLite on every launch, and read
  back as stringly-typed IPC payloads. Everything cited above is the frontend
  half of that pipeline; whether the seed path preserves the metadata blob
  faithfully for a row that *does* declare audiences is untested here, and the
  zero-percent migration means it has never been exercised.
