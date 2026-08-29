---
layer: technique
type: technique
subject: content-drift-and-revision
status: forged
technique: typed-operator-inheritance
laws: [one-authority-per-quantity, refuse-rather-than-destroy]
shared_with: []
use_when: [authoring a variant of an existing content entry, a base rebalance silently un-tuned every derivative, deciding between a template hierarchy and copied entries]
---

# Typed-operator inheritance

The concern: content variants. A reloaded round is the factory round at
ninety percent; an elite enemy is the base enemy plus armor; and the day
the base is rebalanced, every hand-copied variant silently keeps the old
numbers. The technique, proven at decade scale in community-maintained
content: a variant entry **names its parent and states its differences as
typed operators** — relative (+n), proportional (times f), extend/delete
for set-valued fields — with absolute override still available for full
replacement. A relative or proportional delta encodes the variant's
*intended relationship* to its base, so rebalancing the base propagates
through every derivative that declared one, and only through those.

## The operator set is the contract

- **relative / proportional** carry intent ("always 10 harder", "always
  90 percent of factory") and survive base changes — the default for a
  variant that is conceptually derived.
- **absolute override** breaks the link for that field, on purpose and
  visibly — the right choice when the variant's value is independently
  designed, and a lie when it is a snapshot someone forgot to type as a
  ratio.
- **extend / delete** operate on set-valued fields as set operations, so
  a variant adds or removes members instead of restating the whole set
  and freezing it.

## Templates that cannot ship

A shared property bundle is declared **abstract**: it carries no shippable
id, is exempt from mandatory-field validation, and is discarded after
loading. Templates being structurally unable to reach the shipped game is
a guarantee no review process has to provide.

## The restraint ladder

Inheritance is a tax as well as a tool, and the source system that proved
it also caps it: cosmetic-only differences get a string-level variant, not
a new entry; a property set shared *always* — not almost always — earns an
abstract base, at most one or two levels deep; chains beyond that recreate
the duplication they were meant to remove, in a form nobody can read.
And where third parties overlay set-valued entries, **merge is the
default** and whole-set replacement requires an explicit override flag —
an overlay that clobbers its base silently is the drift this subject
exists to catch.

## When not to use this

Uneven operator support is worse than none: if only some content types
honor the operators, authors cannot predict what a delta does, and the
system's own maintainers call that state a standing tax — make support
uniform or machine-queryable before relying on it. And do not inherit
across authorship boundaries you do not control; a variant of an entry
another team may rename has coupled its correctness to their calendar.
