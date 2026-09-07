# A note store as the `knowledge_base` connector

What was learned mapping this recipe onto a file backed note store. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The store makes the forward link cheap and the back link a separate edit, so one sided
links are the default outcome.** Writing "this decision was implemented by that change" into
the decision note is one action. Recording it at the other end is another, and it is the one
that gets skipped. Write both in the same pass or accept that half the corpus will only be
navigable in one direction, which is the direction nobody arrives from.

**Notes are files, so links are usually names, and a rename breaks them silently.** Nothing
errors: the link simply stops resolving, and it stops resolving in the record rather than in
the code. Prefer an identifier that survives a rename where the store offers one, and where
it does not, say plainly that the links are name based and will need repair after any
reorganization.

**The store holds records written by people and records written by this work, and a reader
cannot tell them apart.** Mark a machine written link as machine written and say what
confirmed it. Otherwise a link somebody accepted in a hurry looks exactly like one a person
researched, and the whole set is trusted at the level of its weakest entry.

**There is no pending state in a note store.** A link written before it was confirmed is
indistinguishable from a confirmed one the moment it lands, so unconfirmed candidates have
to be held somewhere else entirely rather than written in a draft state.

**Anything written here is also a diff in somebody's synchronised folder.** A pass that
rewrites many notes at once will show up as a large unexplained change on every device, and
that is how a note store loses its owner's trust faster than a wrong link does.

## What transfers to any knowledge_base connector

- If the back link is a separate write, it will be missed unless the recipe treats both
  writes as one step.
- Name based references are fragile in a way that is invisible until somebody reorganizes.
- Machine written entries need marking, or the corpus is only as trustworthy as its most
  careless entry.
