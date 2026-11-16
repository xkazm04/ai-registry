---
layer: application
type: application
subject: schema-driven-ui
technique: spec-validation-and-repair
stack: python
verified_on: 2026-11-16
verified_against: python@3
---

# Python: a CMS block stream that drops unknown kinds at load, and deletes them on the next save

*Read 2026-11-16 in a shallow, sparse clone of the public `wagtail/wagtail`
repository at `3002dd0` (2026-11-13, `VERSION = (8, 2, 0, "alpha", 0)`),
tree unmodified, no code run. Files read: `wagtail/blocks/stream_block.py`,
`wagtail/fields.py`, `docs/advanced_topics/streamfield_migrations.md`.*

This is the second stack for the subject. A CMS "stream field" is a stored
document of typed blocks (`{type, value, id}` in a JSON column), realized
through a registry of block definitions (`child_blocks`). That is the
subject's shape exactly: a closed vocabulary, a registry, and a stored spec
with stable node ids. The composer is a human editor who can only pick
registered kinds, so an unknown kind arrives one way: a developer removed or
renamed a block type that stored documents still use. The library's answer
is the worked counter-case for two of the technique's rules.

## Unknown kinds are filtered at load, silently

`StreamBlock.to_python` (`stream_block.py:253-305`) builds the lazy stream
value from the stored JSON "but first we reject any unrecognised block types
from the list" (`:275-283`: `if child_data["type"] in self.child_blocks`).
The tuple form does the same (`:297-304`, `if k in self.child_blocks`), and
so does the bulk path (`:324-326`, "skip any blocks with an unrecognised
type"). The form path drops an unknown posted type with a bare `continue` on
`KeyError` (`:127-130`). `fields.py:246-256` routes database reads through
`to_python`. Nothing records the drop: no count, no reason, nothing for a
page or an editor to see. This is policy (1) of the vocabulary technique,
silently skip.

## The filtered view becomes storage on the next save

`StreamValue.get_prep_value` (`stream_block.py:757-776`) serializes what the
value holds, and the value never held the rejected blocks. So the first save
after a block type disappears writes the document back without them. Here the
render-time view and the storage-time edit are the same act, which the
technique's "repair is a render-time view, not a storage-time edit"
forbids. The library's own documentation names the result: "If the data is
not migrated, even a simple change like renaming a block can result in old
data being lost" (`docs/advanced_topics/streamfield_migrations.md:215`).

## What it gets right: storage change is a versioned migration

The documented remedy is the one the technique asks for. A vocabulary change
ships as a deliberate data migration with named operations (rename, remove,
alter values) applied to the stored documents
(`streamfield_migrations.md:215-222`, `wagtail/blocks/migrations/operations.py`). Block
ids are minted once and kept (`get_prep_value` assigns a UUID only when one
is missing, `:763-764, 772-773`), which is the stable node identity that
emitter-registry-sync asks for.

## Reading it against the technique

- The silent skip is tolerable here only because the composer cannot emit
  an unknown kind. The one source is developer drift, which a migration is
  meant to absorb. With a model as the composer, the same filter would hide
  every hallucinated kind and leave the emitter-improvement loop blind.
- Storage-time deletion is the costly half. Removing a block type from the
  code, deploying, and letting one editor press save destroys content that
  a later revert of the code cannot bring back from the current row (older
  revisions may still hold it). Keeping unknown raw items as they were
  stored, and disclosing them, would cost one branch in serialization.
