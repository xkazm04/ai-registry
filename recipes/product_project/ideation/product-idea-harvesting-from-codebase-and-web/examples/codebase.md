# A local checkout as the `development` connector

What was learned mapping this recipe onto a bound local source tree. Nothing here is part of
the recipe: swap to a hosted forge, an API, or a running deployment and this file stops
applying while the recipe does not change.

## What the mapping has to decide

**A checkout answers "what is this product" well and "does it already do X" badly.** Reading
directory structure, dependencies and route or command names gives an accurate picture of the
domain and stack in a few minutes, which is the grounding half of the recipe and the half that
works. The rejection half is harder: a feature can be present under a name nobody would guess,
half built behind a flag, or implemented and never exposed. Treat "not found in the code" as a
weak claim and say so on the candidate, rather than presenting an absence as a verified gap.

**Not found is still a real finding, and it must be distinguishable from not looked.** A search
that ran and matched nothing and a search that never ran produce the same silence. Record what
was searched for, so a candidate that survived the already-built check is known to have
survived it rather than merely to have not been checked.

**A checkout has history and no usage.** It can tell you when something was written and how
often it has changed, and it cannot tell you whether anybody uses it. So the code supports
"this exists" and never "this matters", and a candidate justified by how much of the codebase
touches something is making a claim the source cannot support.

**Vendored and generated code will dominate any naive read.** Dependency trees, lockfiles,
build output and generated bindings are usually most of the bytes and none of the product.
Establish the exclusions at adoption; without them the grounding read describes the framework
rather than the product, and every candidate comes back plausible for that framework.

**A checkout is a point in time, and it may be an old one.** A stale working copy grounds the
harvest in a product that has moved, which is the same premise failure the recipe is trying to
avoid on the candidate side. Check how current the tree is before treating its absences as
evidence.

## What transfers to any code-reading connector

- Grounding is the strong use; absence checking is the weak one. Label the confidence.
- Record what was searched for, so "we looked and found nothing" is distinguishable from
  "nobody looked".
- Code shows existence, never usage. A claim about importance needs a different source.
- Exclude vendored and generated trees, or the read describes the dependencies.
