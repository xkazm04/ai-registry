# A hosted repository as the `source_control` connector, on GitHub

What was learned mapping this recipe onto GitHub specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The tracker and the code host are the same system, which is convenient and is a hazard.**
A reference from a commit or a pull request can close an item automatically. That means an
approved maintenance item can be closed by a phrase in a commit message before anybody has
confirmed the change matched what was approved. Point the recipe's back reference at the
approval, and keep the decision that the work is finished with a person rather than with a
keyword.

**An item's number is meaningless on its own.** The visible number is per repository, so a
record that stores only the number resolves to a different item in any other repository.
Store the full reference or the URL, never the integer.

**Choosing the repository is a recurring judgment, not a lookup.** In an organization with
many repositories an approval about a shared convention has no obvious home, and an item
filed in the wrong one looks exactly like a correctly filed one. Settle the rule at
adoption rather than deciding it differently each time.

**Labels are a namespace shared with everybody else in that repository.** A label invented
for this work's own bookkeeping is a label nobody filters on, and it becomes noise on every
board in the repository. Reuse what the team already filters on, and if nothing fits, say
so rather than inventing.

**The permission this recipe needs is much smaller than the one it can be given.** Writing
issues and writing code are separate grants here. Bind the narrower one: this recipe never
touches the tree, and a binding that could is one incident away from doing so.

## What transfers to any hosted source_control connector

- Where the tracker and the code host are one system, automatic closing exists and will
  eventually close something nobody verified.
- Store a reference that resolves without context, not the number a person sees.
- Reuse the label vocabulary the team already filters on; inventing one is a private note
  in a public namespace.
