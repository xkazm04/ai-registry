---
layer: application
type: application
subject: generated-workflow-candidates
technique: candidates-as-ordinary-artifacts
stack: next
status: forged
verified_on: 2026-10-14
verified_against: next@16
applied: code
ab_verdict: better
proof: ab-paired
---

# Next: a candidate pool that minted three identities

The tree is a ranking app whose model proposes candidate items (a title, a year, a
creator, traits, cover art) for a topic. Candidates are not model packages, but the
technique's last rule travels: a candidate is named once, at generation, and every later
stage keys on that name. The seam hunt looked for the places this tree decides "is this
the same candidate as that one".

## What the tree actually did

Three functions decided sameness, and they disagreed:

- the persisted item id, a name-based UUID over topic, title and year (case folded, nothing
  else) - the identity that survives into storage;
- a readable in-request key that folded accents and collapsed punctuation to hyphens, used
  to drop a candidate proposed twice in one response;
- two private copies of a third normaliser, one in the gap finder and one in the
  recommendation route, that lower-cased and replaced everything outside `a-z0-9` with a
  space, used to drop a suggestion the user already has.

The third pair is where it broke. It erased every non-ASCII letter, so a title in a
non-Latin script normalised to the empty string. One listed non-Latin title therefore made
every non-Latin suggestion look already listed; an accented respelling of a listed title
("Amelie" against "Amelie" with the accent) was kept as new; and two different non-Latin
titles of one year collapsed to one key inside a request.

## The A/B

Seam chosen to falsify "the tree names a candidate once": a caught outcome (the tree
already shares one key) would have left the technique unchanged, but the three divergent
functions are the finding. Three constructed cases through the real gap finder:

| case | A (before) | B (one shared key) |
| --- | --- | --- |
| accent-free respelling of a listed title | kept as new | dropped |
| non-Latin listed title, non-Latin suggestion | dropped | kept |
| two non-Latin titles, same year | collapsed to one | both kept |

Target: wrongly dropped or kept suggestions, 3 of 3 cases to 0 of 3. Floor: the project's
152 tests, type check and lint stayed green, and the persisted id function was not touched.
That last point is a limit worth stating: the persisted id still treats a respelled title
as a different item. Changing it would orphan stored rows, so the shared key governs
comparison and dedupe, and the id stays a separate, frozen contract.

## What this realization cannot do

It does not make the persisted id spelling-insensitive, and it says nothing about the
package-contract half of the technique: these candidates are rows, not directories, so the
"generator uninstalled" test has no analogue here. Only the naming rule was exercised.
