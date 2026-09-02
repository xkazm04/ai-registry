---
layer: technique
type: technique
subject: gameplay-runtime-patterns
technique: data-driven-type-objects-over-subclass-growth
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a content request arrives as "we need a new kind of X", reviewing a class tree that grows with the content, deciding whether a variation belongs in a table or in code, a data table has acquired a field that means run a special case]
---

# Data-driven type objects over subclass growth

The named concern: decide whether a requested new *kind* of thing is a new row of data or a
new unit of code, and keep the answer stable as the content set grows. Get it wrong toward
code and the class tree grows linearly with the content, every design tweak needs an
engineer and a build, and nobody who authors content can change anything. Get it wrong
toward data and a table slowly becomes an under-specified programming language with no
tooling and no diagnostics.

## The crossing test

The question is not *how different are these two kinds*. It is **where the difference
lives**.

**The difference is a value.** More health, a different display name, a different reference
to an effect, a different projectile speed, a different icon. Two kinds separated only by
values are one kind with values, always. There is no threshold of "enough different values"
that flips this — fifty differing numbers is still fifty numbers. The shape is one runtime
class holding a reference to a shared definition, and a new kind is a new row somebody
authors without touching code.

**The difference is conduct.** One retreats when hurt; the other calls for reinforcements.
No number expresses that. Something has to carry the conduct, and the choice is among three
shapes ordered by cost: a closed vocabulary of named behaviours selected by a data field; a
narrow override hook whose body may only call primitives the parent supplies; or a full
composed capability set. Take the cheapest one the content actually needs, and re-derive
rather than defaulting to whichever the codebase already has.

**The difference is conduct, authored in volume, by people who are not engineers.** This is
the only condition under which an interpreted instruction set — a small domain language with
its own execution — starts to pay. It is a large purchase: it needs an authoring surface, an
error-reporting story, a debugger of some kind, and a versioning story for content authored
against an older instruction set. Teams routinely underestimate that burden by an order of
magnitude, and a language with none of those attached is a table with worse ergonomics.

## Procedure

1. **List the proposed kinds and the differences between them, field by field.** Do this
   before choosing a shape. The list is usually shorter than the conversation implied, and
   the shape often falls out of it without further argument.
2. **Partition the differences into values and conduct.** A difference that can be written
   as a number, a string, a reference or a set of references is a value. Everything else is
   conduct, and the conduct list is the one that decides the shape.
3. **If the conduct list is empty, stop.** One class, one definition table, one row per kind.
4. **If the conduct list is small and closed, name each behaviour and select it by a field.**
   The field's legal values are enumerated and validated at load, so an unknown behaviour
   name is a loud load-time failure rather than a silent no-op at run time.
5. **If the conduct list is open-ended, use a narrow override hook and constrain what it can
   reach.** The parent supplies a fixed set of operations; the override composes them. This
   is what keeps a hundred subclasses from each inventing their own access to the world, and
   it is the difference between a manageable subclass family and an unmanageable one.
6. **Define the table's columns with their units and their basis.** A damage column without a
   type and a stacking bucket, a duration column without saying whether it is seconds or
   steps, a rate column without its time basis — each is a silent disagreement waiting for a
   second author to read it the other way.
7. **Give each quantity exactly one home.** A value that exists both as a default in code and
   as a column in the table has two authorities, and which one wins is discovered during a
   live incident. The table owns it, and the code owns only the behaviour of a *missing*
   entry, which is a stated, loud failure rather than a quiet default.

## Decision rules

- **When two proposed kinds differ only in values, they are one kind, because a class per row
  makes the content set a build dependency.** No exception for "this one is special" — that
  is what a value is for.
- **When a data field's meaning is "run this special case", the variation has crossed into
  conduct and the shape must be re-decided.** That field is a subclass in disguise; it will
  be joined by a second and a third, and each will interact with the others in ways nothing
  tests. Catching it at the first occurrence is the cheapest moment there will ever be.
- **When a definition table is loaded, validate it against a declared schema and fail loudly
  on an unknown key, a missing column or an out-of-range value.** Data-driving moves a class
  of error from compile time to load time; the load-time check is what replaces the compiler,
  and without it the shape is strictly worse than the class tree it replaced.
- **When an entry is absent, that is not a default — it is a missing entry.** Substituting a
  neutral value for an unauthored one destroys the distinction between "this kind has no
  bonus" and "nobody authored this kind", which are different states that send an engineer to
  different places.
- **When conduct is selected by a data field, enumerate the legal values and reject the rest
  at load.** A free-text behaviour name resolves at run time or silently does nothing, and
  the silent nothing is indistinguishable from an intentionally passive kind.
- **When the same quantity appears in two tables or in a table and in code, delete one.**
  Two authorities for one number is worse than either alone, because the disagreement is
  invisible until it is load-bearing.

## When not to use this

- **On a genuinely singular thing.** One player controller, one save system, one match
  director. A type-object shape imposed on a population of one is indirection with no
  variance to absorb, and its table has one row that will never gain a second.
- **Where the conduct differences dominate and the values are trivial.** A table of two
  columns beside six distinct behaviours has data-driven the uninteresting half. Model the
  conduct properly and let the two values be fields on it.
- **Where hot-path cost forbids the indirection.** Reading a definition through a reference
  every step, for a population large enough to matter, is a real cost. The answer is usually
  to copy the few values the step actually needs into the instance at initialisation — which
  keeps the authoring shape and removes the per-step lookup — not to abandon the table.
- **As a way to avoid deciding.** Pushing an unresolved design question into a configuration
  field does not resolve it; it distributes the question to everyone who later authors a row,
  and they will answer it inconsistently.
