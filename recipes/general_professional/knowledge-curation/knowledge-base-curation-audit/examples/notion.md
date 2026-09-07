# Notion as the `knowledge_base` connector

What was learned mapping this recipe onto Notion specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The walk is bounded by what has been shared with the credential, and that bound is
invisible in the results.** An integration sees only the pages explicitly shared with it,
so a page in an unshared area is not reported as unreachable, it simply is not there. Every
page in the visible set that links into the invisible one then looks like it points at
nothing, and every page in the invisible set that points into the visible one leaves its
target looking unreferenced. Both directions produce false findings that read exactly like
true ones. Establish the share scope at adoption, report it as a figure in every audit, and
treat a growing gap between the scope and the base as its own finding.

**Notion gives you last-edited and does not give you last-verified.** This recipe insists
the two are different, and here the second only exists if the curation step that wrote the
page created a property for it. An audit over a base whose pages predate that property has
no staleness signal at all beyond age, and the honest report says so rather than reporting
age and letting it be read as verification. That is the most common way this recipe silently
degrades into the tidiness audit it is trying not to be.

**Near-duplicate tag detection is the one part that is genuinely cheap here.** A
multi-select property exposes its full option list directly, so the plural pairs, the
spelling variants and the options used exactly once are readable without walking a single
page. Do that part first: it costs almost nothing and it is the finding a curator can act
on immediately.

**A relation is visible from both ends and an inline link is not.** Orphan detection over a
base connected by body links is a full-text problem and will be incomplete; over a base
connected by relations it is a property read. The audit inherits whichever choice the
curation work made and cannot repair it, so a base built on inline links needs its orphan
section reported as partial rather than presented as a count.

**Archived pages come back in some queries and not others.** A page in the trash can appear
in a search result while being absent from a database query, so an audit that mixes the two
reports pages that no reader can reach as live orphans. Pick one enumeration path and state
which.

## What transfers to any knowledge base

- Find out what the credential cannot see, and report that share every time. A partial walk
  invents orphans and hides real ones, in the same pass.
- If the store does not record when a claim was last checked, the audit has an age and not a
  staleness signal, and must say which one it is reporting.
- Do the cheap structural findings first. Vocabulary duplicates are usually one read.
- Orphan detection is only as complete as the connection type the base was built on.
- Decide which enumeration counts as the population, including how deleted and archived
  items are treated, and say so in the report.
