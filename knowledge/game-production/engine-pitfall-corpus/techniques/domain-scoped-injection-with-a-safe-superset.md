---
layer: technique
type: technique
subject: engine-pitfall-corpus
technique: domain-scoped-injection-with-a-safe-superset
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [routing a growing corpus to individual tasks, a knowledge block has grown too large to inject whole, deciding what an unrecognised task descriptor should receive]
---

# Domain-scoped injection with a safe superset

Once a corpus passes a few dozen entries, injecting all of it into every task is
wasteful and, past a threshold, actively harmful: a wall of mostly-irrelevant
warnings trains the reader — human or machine — to skim past the two that bite.
Scoping fixes that. It also introduces the only correctness bug this subject can
produce, and this technique exists to close it.

## The selection, in order

1. **Hard filter by task kind.** Discard every entry whose declared task kinds do
   not include this task's kind. This filter is not an optimisation — a pitfall
   about a scripted authoring route is *wrong* advice for compiled source, so
   including it costs more than tokens.
2. **Resolve the task descriptor to a domain set.** A routing table maps each
   known work item (module, subsystem, deliverable) to the domains its work
   touches. Keep the table one lookup deep and declarative; a routing rule with
   branching logic in it is a routing rule nobody maintains.
3. **Keep every universal entry unconditionally.** An entry with no declared
   domain is universal, not unclassified. "Prove the capability before you call
   it" is true of every task of its kind. The absence of a domain tag means
   *everywhere*; it must never be read as *nowhere*.
4. **Keep the domain-matching entries.** An entry survives if its domains
   intersect the resolved set.
5. **If the descriptor is unrecognised, keep everything of that kind.**

## The asymmetry that decides step 5

Under-inclusion and over-inclusion are not symmetric errors.

| | Cost | Visibility |
| --- | --- | --- |
| **Over-include** | injection budget, some reader fatigue | immediate and measurable — the block is longer |
| **Under-include** | the incident recurs, at full original cost | none — nobody can see the entry that was not injected |

An error that is expensive *and* invisible must never be the default. So: **a
missing mapping resolves to the conservative superset, never to the empty set.**
New work items appear faster than anyone updates a routing table; the table will
always be incomplete, and the design must make incompleteness merely wasteful
rather than silently wrong.

State this as a comment at the point of the fallback, in the imperative, so the
next person to "tidy up" the branch understands they are looking at a deliberate
asymmetry and not a missing case. Fallbacks without a stated reason get optimised
away by well-meaning people.

## Empty is a verdict, and it must be distinguishable

Three outcomes must not collapse into one another:

- **Nothing matched** — the filters ran and this task genuinely has no relevant
  entries. Emit nothing rather than an empty heading; a section with a title and
  no content is noise on every task forever, and readers learn to skip the
  heading, including on the tasks where it is populated.
- **The descriptor was unknown** — emit the superset, and record that the fallback
  fired. A router silently running in permanent fallback is a routing table that
  has stopped being maintained, and that fact should be observable rather than
  inferred from a long block.
- **The router did not run** — a bug. This must never look like "no relevant
  entries". Absence of a selection is not a selection of nothing.

## Decision rules

- **Route on domains, not on entry identifiers.** A per-task list of entry ids is
  a second corpus that drifts from the first; the domain tag lives with the entry
  and travels with it.
- **Keep domains few and coarse.** A dozen or so, named after subsystems people
  already talk about. Fine-grained domains push the routing table toward
  per-entry curation, which is where scoping stops paying for itself.
- **Give an entry every domain it plausibly touches.** Scope is a soft filter; the
  penalty for a generous tag is tokens, and the penalty for a stingy one is the
  incident. Tag toward inclusion, at the entry as well as at the router.
- **A work item with no relevant domains gets an explicit empty domain set, not
  an omission.** Omission means unknown and triggers the superset. Deliberately
  narrow is a different statement from unmapped, and the table must be able to
  say both.
- **Never make the router the place where entries are edited.** Selecting and
  authoring are different jobs; a router that rewrites text is a second source of
  truth for the corpus.

## When not to use it

Below roughly two dozen entries, do not scope — inject the whole corpus of the
right task kind and spend the budget. Scoping has a maintenance cost (the table)
and a risk (this technique's whole subject), and neither is worth paying while
everything fits. Also do not scope the boundary declaration or the identifier set
by the same mechanism reflexively: the boundary is short and applies to every
authoring task, so it rides along universally.
