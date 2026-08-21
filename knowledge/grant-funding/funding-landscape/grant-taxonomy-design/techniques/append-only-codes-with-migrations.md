---
layer: technique
type: technique
subject: grant-taxonomy-design
technique: append-only-codes-with-migrations
status: forged
laws: [provenance-per-field]
shared_with: []
use_when: [a taxonomy code needs renaming or splitting, stored rows carry codes from an older vocabulary, designing the change policy for a controlled vocabulary]
---

# Append-only codes with migrations

The concern: taxonomy codes escape. They persist in classified rows, cached
classifier outputs, exports, and other systems' integrations — so the moment
a vocabulary ships, editing it in place becomes a data-corruption operation.
This technique fixes the change policy: **append, deprecate, migrate —
never edit, never delete, never reuse.**

## The policy

1. **Adding a code is always safe.** New codes append to a dimension's term
   list. Jurisdictions or verticals may *add* codes on top of the shared
   core; nobody edits the core. New codes are earned by evidence — typically
   an audit of the uncategorized set proving a class of grants has no home —
   not by taxonomic ambition.
2. **A rename is a migration, not an edit.** When a code's name misleads
   (the classic case: a code whose name implies a narrow subclass while its
   contents were always the general class), mint the correct code and record
   `old-code → live-code` in a migration map. History is never rewritten;
   the map is applied **on read**, before any validity filtering, so a
   stored historical tag normalizes to the live code instead of being
   dropped as unknown. Order matters and is a real bug class: filter-then-
   migrate silently deletes every historical tag the rename was supposed to
   preserve.
3. **A retirement is a deprecation.** A code that should stop being assigned
   is closed to writers but remains readable — either migrated to a
   successor or kept as a recognized-but-frozen historical code. This is the
   same rule every durable identifier scheme converges on: deprecate, never
   delete, and never reuse a retired identifier for a new meaning, because a
   reused code makes old rows and new rows indistinguishable lies.
4. **Stamp the version.** The vocabulary carries a version identifier,
   bumped on any code change, and every classified row is stamped with the
   version that produced it. This turns vocabulary evolution into a
   queryable property of the data: which rows predate a split, which cached
   classifier outputs are stale, which export a partner received.
5. **A split is a re-classification, not a migration.** Migration maps
   handle renames (one-to-one, meaning-preserving). Splitting one code into
   two *meanings* cannot be resolved by a map — rows under the old code must
   be re-classified into the successors, and until they are, the version
   stamp is what marks them as pre-split.

## Decision rules

- **Rename when the code's name actively misleads readers; otherwise leave
  it.** Codes are identifiers, not documentation — a merely inelegant code
  is not worth a migration entry. The bar: analysts or classifiers are
  demonstrably making wrong calls *because of the name*. Corroborate before
  renaming; one production rename was held back as "kept for continuity"
  until an audit confirmed the misnomer across nearly the whole corpus
  slice.
- **Write the why next to the map entry.** Each migration line carries a
  dated comment stating what was renamed, why, and what evidence justified
  it. The migration map is the vocabulary's changelog; a bare `old: new`
  pair forces the next maintainer to re-derive the reasoning.
- **Normalize at every ingress of stored codes** — reads from persistence,
  cached model outputs, external imports — through one shared
  `migrate-then-validate` helper. Two normalization sites drift; one cannot.
- **Unknown after migration still drops.** The migration map recognizes
  *known former* codes; anything else is invalid and is filtered out, not
  defaulted. Migration is for continuity, never a back door for garbage.

## When NOT to use it

- Pre-release, before any code has been persisted anywhere: edit freely.
  The policy binds at first durable write, not at first draft.
- As a substitute for getting the facet design right: migrations preserve
  continuity through *renames*; they cannot repair an entangled dimension.
  If you are writing many-to-many migration entries, you have a modelling
  problem, not a naming problem.
- For labels. Labels are presentation and change without ceremony; only the
  code layer is append-only.
