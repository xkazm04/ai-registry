---
layer: technique
type: technique
subject: templates-scaffolding
technique: instance-upgrade
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [an "update available" offer whose accept path is remove-and-re-adopt, deciding what the provenance stamp must record, an out-of-date badge that has never fired]
---

# Instance upgrade

The [adoption-lifecycle](./adoption-lifecycle.md) divorce says that editing
the template never mutates an instance, and that improvements reach
instances as *offers*. This technique covers the offer being accepted. The
problem is always the same. The instance now differs from what the old
template version produced, for two reasons nobody can tell apart just by
looking at it: **the adopter edited it**, and **the catalog moved on**. A
naive upgrade either keeps the adopter's version (and the improvement is
lost) or replaces it with the new version (and the adopter's work is lost).
The second one usually ships under the name "re-adopt".

## The stamp is the merge base

To separate the two sources of difference you have to reconstruct what
the instance looked like *before the adopter touched it*. That is possible
only if the provenance stamp recorded, at adoption:

- the template's **stable id**,
- the template **version as it stood then**, frozen rather than a pointer
  to the current version,
- the **answer set** that the mapping turned into the instance.

With those three, the old instance can be derived again. The deterministic
mapping (same template version + same answers ⇒ same instance) is what
makes that possible. The upgrade is then an ordinary three-way merge:

1. **Regenerate the base.** Run the *old* template version with the stamped
   answers. That gives the instance as adopted.
2. **Diff base → current instance.** That diff is exactly the adopter's
   edits, and nothing else.
3. **Generate the new version** with the same answers. If the new version
   added dimensions, ask only for those, with their defaults.
4. **Re-apply the adopter's diff** onto the new version. A conflict is
   surfaced as a conflict, on the part both sides changed. It is not
   resolved silently in either direction.
5. **Rewrite the stamp**: new version, the answer set now in force.

Mature project-scaffolding tools implement exactly this loop. The
recipe is not speculative. The part that is easy to get wrong is the
stamp.

## What breaks the base

- **A stamp without answers.** Id and version tell you *that* an instance
  is behind but not *what it was*, because the base can't be regenerated
  without the answers. The honest fallbacks, from best to worst: show the
  new version next to the current instance and let the adopter carry
  edits across by hand; or offer "replace" and state plainly that local
  edits will be discarded. Remove-then-re-adopt behind a button labelled
  "update" is the second fallback without the statement.
- **A stamp someone edited.** If the recorded answers are changed after
  the fact, the regenerated base is an instance that never existed, and the
  diff then attributes the change to the adopter. Only the adoption door
  and the upgrade door write the stamp.
- **A stamp nobody writes.** A comparator that rightly refuses to flag an
  instance with no recorded version stays dark for every instance if
  adoption never writes the version. See the version trap in
  [template-anatomy](./template-anatomy.md). The offer has to be *seen to
  fire*: one test that adopts, bumps the template, and requires the
  out-of-date signal.
- **A mapping that is not deterministic.** If the same version and the same
  answers do not reproduce the same instance (timestamps, generated ids,
  model output inside the mapping), the base diff is noise. Keep minted
  identity and time out of the mapped payload, or mask them in the diff.

## The out-of-date check is a gate: make it failable

"Is this instance behind?" is a derived fact. The recomputation it depends
on has to be named: the comparison of stamped version with the catalog's
current version, run where the offer is rendered. A check that can
run unattended (in continuous integration for generated code, or on a
schedule for in-app instances) and exits non-zero or raises a visible
signal turns "stale" from a feeling into a count. A check that returns
"current" when either side is missing has hidden a broken instrument
behind an empty result, and it should say "unknown" instead.

## Scope: what upgrades and what doesn't

Only what the template *copied* into the instance goes through this merge.
Parts the template shipped as *references*, pinned pointers to components
the publisher maintains, upgrade by moving the pin. There is nothing to
merge because the adopter never edited them. A template that will be
upgraded often should keep as much of itself as possible on the reference
side and copy only what the adopter is expected to change. Every copied
line is a line that can conflict at upgrade time.

Upgrades stay offers. A catalog may nudge, rank, or bulk-offer ("12
instances are behind"), but applying the merge is the adopter's act,
per instance. The one exception is the product's own seed pipeline, which
is the adopter of its built-in content (see
[catalog-curation](./catalog-curation.md)). Even there, a copy the user has
modified is preserved, not overwritten, and the preservation decision reads
the same base diff.
