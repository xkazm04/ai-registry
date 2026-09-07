# A hosted repository as the `source_control` connector, on GitLab

What was learned mapping this recipe onto GitLab specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**There are two numbers on every item and they are not interchangeable.** The number a
person sees is scoped to the project; the identifier the interface uses is global. A record
that stores the visible one cannot be resolved without also storing the project it belongs
to, and the two are easy to mix up because both are small integers. Store the URL, which is
unambiguous either way.

**Projects nest inside groups, and some approvals belong to the group.** A maintenance
decision about a convention shared by six projects has no natural project to land in, and
whichever one is chosen makes it invisible from the other five. Decide at adoption whether
group level items are used here, because otherwise the decision gets made silently and
differently each time.

**An item can be filed and unfindable at the same time.** Confidential items are hidden from
people who can otherwise see the project. That is exactly the failure this recipe exists to
prevent, arrived at through a setting rather than through a lost API call, so the visibility
of a filed item is worth confirming rather than assuming.

**Labels here are created by being used.** A misspelled label does not produce an error; it
produces a new label with one item on it, and that item then never appears on the board that
filters for the intended one. Read the project's existing labels before filing rather than
trusting the string.

**Boards and milestones, not labels, are usually what a maintainer actually looks at.**
Filing with correct labels into a project whose team works from a board that does not
include them is filing into a place nobody reads. Ask where the maintainer looks, not where
the item can be put.

## What transfers to any hosted source_control connector

- Confirm that a filed item is visible to the person expected to pick it up, not merely that
  the write succeeded.
- Where labels are created implicitly, a typo is silent and removes the item from every
  filter that mattered.
- File where the maintainer looks, which is not always where the item technically belongs.
