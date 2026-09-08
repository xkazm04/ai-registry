---
name: data-dictionary-stewardship
version: 0.1.0
status: seed
domain: data_ai
path: data_ai/data-quality
---

# Data dictionary stewardship for shared fields and metrics

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A dictionary is easy to produce and fails quietly, because the definitions
everyone agrees to are the ones nobody was disputing. The term that costs money is the
one two teams use confidently in different senses, an active user, revenue, closed,
where each number is correct inside the reasoning that produced it and the gap is only
visible the day both land on the same page. Writing one definition over that does not
settle it: it makes the other team's existing reports wrong without giving them any way
to notice.

**Input.** The fields and metrics actually referenced by shared queries, reports and
downstream consumers, the derivation each is computed by in every place it is computed,
whatever definitions already exist and where they disagree with the code that runs, who
gets asked when a number looks wrong, and what has previously been ruled.

**Core action.** Rule what a shared term authoritatively means, with the derivation that
produces it and the owner who may change it, and judge which kind of collision is in
front of you: two teams misusing one term, which a ruling settles, or two genuinely
different measures wearing one name, which is settled by splitting the name and
migrating one side rather than by picking a winner.

**Output.** Definitions for the shared terms carrying their derivation, their allowed
values, the owner who may change them and the date the meaning was last ruled on; each
collision closed either by a ruling that names what the losing usage must change, or by
two distinct terms where there was one; and, when a pass finds nothing to move, a dated
record that the shared terms were re-read, so a dictionary that is current is
distinguishable from one nobody has opened in a year.

## Activities

1. Take the terms shared across teams rather than every column in the warehouse
*(observe)*
2. Read how each term is actually derived at every place it is computed *(observe)*
3. Separate terms that disagree in wording from terms that measure different things
*(decide)*
4. Rule the meaning, or split a genuine collision into two named terms *(decide)*
5. Name the owner who may change each definition and what a change obliges them to
announce *(act)*
6. Publish the ruled definitions where the consumers of these numbers actually look
*(deliver)*
7. Record that the shared terms were re-read and what was covered, including when
nothing moved *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A shared term has a single authoritative meaning, or it has been split into two terms
that each have one.**

- Each definition carries the derivation that produces the number, not only a sentence
  describing it, so a consumer can tell whether their own query computes the same thing.
- A collision where the two sides genuinely measure different things is resolved by
  giving them different names and migrating one usage, rather than by a single
  definition that silently invalidates one team's existing reports.
- A ruling names what the losing usage must change and by when; a ruling with no
  migration attached is recorded as unenforced rather than as settled.
- A term used in one place by one team is left out rather than defined for completeness,
  because a dictionary that grows past what anybody reads stops being read at all.
- A definition contradicted by the derivation that actually runs is raised for a person
  to rule on, and is never corrected silently toward either side, since either direction
  changes somebody's published number.

**A definition can be challenged and changed by a named person, and a change reaches the
people whose numbers move.**

- Each definition names an owner with the authority to rule on it; an ownerless
  definition is reported as ownerless rather than attributed to whoever last typed it.
- A change to a definition is dated and announced to the consumers it moves, so a report
  that changed value is explained rather than investigated as a data incident.
- A field whose name implies something its derivation does not measure is raised as a
  rename candidate even when its written definition is accurate, because the name is
  what most consumers ever read.
- A meaning ruled here that a downstream contract, regulator or public report already
  fixes is recorded as constrained by that, rather than re-decided on internal
  preference.

**The effort goes to the terms whose ambiguity actually costs something, and a quiet
pass is still evidence.**

- A first pass ranks terms by how many independent consumers depend on them and defines
  that head, rather than attempting the whole surface and shipping a dictionary that is
  complete on the columns nobody queries.
- A pass that re-read the shared terms and found nothing to rule leaves a dated record
  of what it covered, so silence is not read as either currency or abandonment.
- A term that has stopped being shared, because the consumers that referenced it are
  gone, is retired from the dictionary with that reason, not carried forward because
  removing it feels like losing documentation.

## Guidance

Define only what is shared: a dictionary that documents every column is abandoned before
it is useful. Read the derivation that actually runs rather than the sentence somebody
wrote about it, and treat a collision as a question before it is a ruling. Two teams
misusing one term is settled by deciding; two different measures wearing one name is
settled by splitting it, and forcing one definition over that case just makes one team
wrong without telling them. Every definition names who may change it.

## Where this is worth adopting

- A weekly leadership pack where two teams report an active user count that differs by a
  fifth, and each figure is correct inside the query that produced it.
- A warehouse migration where the same metrics are being reimplemented, and the only
  cheap moment to settle what they mean is before the new derivations are written.
- A finance team and a product team both using closed, one meaning the deal is signed
  and the other meaning the record stopped changing, in reports that end up side by
  side.
- An analyst leaving, taking with them the reason a revenue column excludes one customer
  type, which nothing in the schema, the column name or the transformation records.
- A dictionary produced during a governance push, still published and still linked in
  onboarding, that now disagrees with the transformations running every night.

## Connector types

`database`, `knowledge_base`, `analytics`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. The moments that produce a correct ruling are events: a discrepancy surfacing
between two reports, a derivation being rewritten, a term crossing out of one team's
queries into a shared surface. A scheduled review re-reads whatever was easiest to
re-read and reliably misses the collisions that matter, because a collision announces
itself as an argument about a number and not as a date. A periodic sweep is worth
keeping only as a backstop against a dictionary nobody has opened.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which terms are genuinely shared in this operation, since that boundary sets the
  dictionary's size and the size decides whether anyone reads it.
- Who is empowered to rule when two teams disagree, because stewardship with no
  escalation route produces well documented disagreements and no decisions.
- Where the consumers of these numbers actually look a meaning up, given that a
  definition published somewhere else loses every time to the sentence somebody half
  remembers.
- How a definition change is announced here, because a number that moves with no notice
  attached is investigated as an incident, and that investigation costs more than the
  change did.
- Which meanings are fixed by an outside obligation, a contract, a regulator or a
  published figure, since those are not available to be ruled on internally however
  inconvenient they are.

## Dependencies

None.
