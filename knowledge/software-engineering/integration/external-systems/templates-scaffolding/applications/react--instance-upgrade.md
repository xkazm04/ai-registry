---
layer: application
type: application
subject: templates-scaffolding
technique: instance-upgrade
stack: react
status: forged
verified_on: 2026-09-23
verified_against: react@19
applied: experiment
ab_verdict: not-better
---

# Recipe adoption: an offer that can fire now, and an accept path that erases

*Checked against the project tree at `f05c1759f` (react 19.2.6 installed).
This is a read-only pass: nothing was built or run.*

The recipe catalog attaches a recipe to a persona as a `DesignUseCase` and
offers "Update" when the catalog's recipe version moves ahead of the one
adopted. It has both halves of the technique: the comparator, and the path
an adopter takes to accept.

## The comparator, dark until 2026-09-17 (fixed, `f3c1d4e90d`)

`src/features/templates/sub_recipes/libs/recipeStaleness.ts:37-42`
(`isRecipeStale`) and `:46-60` (`computeStaleRecipeIds`) compare the
catalog `version` with the `source_recipe_version` pinned on the adopted
use case. On purpose, they skip any adoption with no pinned version (the
comment at `:33-36`: "a false 'update' nag is worse than silence"). Until
the fix, `recipeToUseCase` wrote `source_recipe_id` but never the version.
So the right refusal applied to every adoption, and the Update chip
(`components/RecipesBrowseList.tsx:68`) and the detail panel's stale state
(`components/RecipeDetailPanel.tsx:47`) could never light up. The fix is
the pair at `libs/useAdoption.ts:248-249`, plus a comment at `:242-247`
explaining why the version matters as much as the id. It adds tests to
`recipeStaleness.test.ts`. This is the "stamp nobody writes" failure,
exactly as the technique names it.

## The stamp still can't serve as a merge base

`types.ts:211-223` declares an `AdoptionMetadata` envelope that includes
`bindingValues`, "persisted so future re-runs with newer recipe versions
can carry forward + flag what changed". That is the answer set the
technique's upgrade needs. `useAdoption.ts:39-42` says the envelope "is
still not persisted — the `DesignUseCase` shape doesn't carry it". Only
the id and version are stored. The binding values are substituted into
the use case at adoption (`recipeToUseCase`, `:177` onward) and then
dropped. The base can't be regenerated.

## The accept path is remove, then adopt

Adoption is idempotent per recipe: the dedupe at `useAdoption.ts:57-75`
refuses a second adoption of the same `source_recipe_id`.
`RecipeDetailPanel.tsx:48-50` therefore turns an adopted recipe's call to
action into Remove, not Adopt. `remove` (`useAdoption.ts:134-140`) drops
every use case carrying that recipe id. So the only way to take a newer
version is to Remove the use case, including any edits the adopter made
to it since, and then Adopt again with the bindings entered afresh. That
is the technique's "replace" fallback without the statement that local
edits will be discarded.

## What this does not show

- Whether adopters actually edit an adopted recipe use case afterwards. If
  they never do, the missing base costs only re-entering the bindings.
  That is the condition under which this seam would *not* bear out the
  technique.
- Whether catalog versions move in practice. The backend bumps
  `source_version` on derivation
  (`src-tauri/src/commands/recipes/recipe_derivation.rs:241-270`), and the
  frontend adapter defaults it to `'1.0.0'`
  (`libs/recipeAdapter.ts:560`). How many live recipes ever carry
  anything but the default was not counted.

## Applied 2026-09-23 - the merge base and the offer, read-only experiment

The tree's own adoption mapping ran over the 132 shipped recipes and 9 real content
revisions from the seed bundle's history. The mapping is deterministic for all 132 once
the minted use-case id is masked, so a base could be regenerated, but the stamp holds id
and version and no answers: 278 bindings across 119 recipes are dropped. Three edit
surfaces reach an adopted use case (an enabled toggle with a UI caller; generation
settings and a model pin with a command but no UI caller). Remove-then-adopt loses 27 of
27 walked edits (3 surfaces x 9 revisions); a three-way merge from a stamp with answers
keeps all 27, both deliver the upstream change, and there are 0 conflicts. Tuned parameter
values do survive remove-then-adopt through a persona-level merge where existing keys
win, and by the same rule a revised default never arrives. Trigger rows keyed to the old
use-case id are neither removed nor re-keyed on re-adopt, though the confirmation text
says they are removed.

**Caught, `not-better`:** the offer fires for 0 of 132 recipes at HEAD. Over 32 commits
of the seed bundle, 783 payload changes moved the version 0 times - the only version ever
shipped is 1.0.0 - because the boot seeder rewrites built-in content in place without a
bump. The stamp has been written since 2026-09-17, and the fire test exists and passes,
but it sets a fixture version by hand. Only 1 of the 9 revisions changes the copied
instance; 2 change the input schema, which is read by reference. The technique gained the
condition that the fire test moves the version through the publisher's own content-change
path. No product test ran.
