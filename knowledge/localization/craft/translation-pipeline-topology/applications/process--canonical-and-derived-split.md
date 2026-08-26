---
layer: application
type: application
subject: translation-pipeline-topology
technique: canonical-and-derived-split
stack: process
verified_on: 2026-08-26
---

# A reviewed-and-committed catalog, read against the split (desktop app, 14 locales)

The fleet's desktop companion app localizes ~16.2k leaf keys across 14
locales, catalogs committed to the source branch — the topology the
technique calls reviewed-and-committed, in the tree that motivated naming
it. Read on 2026-08-26 against the technique's own questions: what claims
the commit makes, what enforces them, and whether the artifact can carry
its trust classes. The tree confirms the shape, runs three of the
subject's other techniques inside it, and exposes one structural gap the
technique predicts.

## The commit's floor claim, and the gates that make it real

Committing a machine translation here is not a bare act; two pre-commit
gates convert the commit into a checkable claim:

- **Key parity, strict** — every locale carries every key
  (`scripts/i18n/check-coverage.mjs --strict`), re-checked at pre-push.
- **No untranslated values, strict** — no committed value may be
  byte-identical to the canonical English unless it is enumerated in
  `docs/i18n/untranslated-allowlist.json`
  (`scripts/i18n/check-untranslated.mjs --strict`). The gate's own comment
  states the reason: key parity "asserts a key EXISTS in every locale,
  never that its VALUE was translated", and the runtime's deep-merge
  fallback would render the gap invisibly.

So the committed catalog's floor claim is precise: *every value differs
from canonical or is a named exception.* That is a mechanical claim, not a
review claim — the distinction the technique turns on — but it is a real
one, enforced at the door rather than asserted in prose.

## Three sibling techniques, running inside the reviewed topology

- **Per-unit canonical fallback** — the runtime `t` proxy deep-merges
  English under every locale, so a missing or stale unit renders canonical
  rather than blank. Fallback-serving is not exclusive to the
  derived-and-served topology; here it is the safety net *under* the
  committed catalog, and it is exactly why the no-untranslated gate must
  exist (the fallback hides what the gate counts).
- **The enumerated exception** — the untranslated allowlist is the
  hand-authored-exception-contract's mirror image: a committed,
  per-key (`*:section.key`) list of values *allowed* to equal canonical
  (product names, format examples), living in the docs tree where review
  can argue with it. The exception is enumerated, not implied.
- **Derived files committed beside their source** — the runtime does not
  load the edited catalogs at all; it loads per-section files regenerated
  by a splitter, and the repo contract states the consequence in bold:
  editing the catalog without regenerating ships a no-op. Both are
  committed, in the same change. A derived store *can* live on the source
  branch — the contract that keeps it honest is that regeneration travels
  with every source edit, which is the cache technique's invalidation
  rule enforced socially rather than by digest.

## The structural gap the technique predicts

The technique's discriminator is the human quality claim — and this tree
holds **two** trust classes above the floor: values that passed only the
mechanical gates (a hosted-model subagent per locale, merged by
pipeline), and values that additionally passed a human/agent review wave
with anchored findings (about a fifth of the catalog at reading time, by
the programme's own run records). The artifact cannot tell them apart.
No key, file or manifest marks review; the wave's existence is recorded
in commit history, in per-language exemplar and style documents, and in
this registry's run notes — history, not state. Grep the catalog for the
reviewed slice and nothing distinguishes it. The technique names this
shape precisely: a review claim that lives outside the artifact upgrades
the whole catalog's apparent trust class, because a reader of the source
branch sees one uniform committed surface. Nobody designed that; it fell
out of committing both classes to one place, and it is better evidence
for the technique's storage-location-is-a-trust-claim stance than the
clean half of the tree.

## What this realization cannot show

Whether per-key review provenance would earn its cost here is unmeasured
— a section-level review manifest (which sections passed which wave)
would be cheap and would make the two trust classes inspectable, but no
consumer has yet needed to distinguish them at runtime. The return
condition is concrete: the next review wave writes its coverage into the
tree as state rather than as run notes, or a defect is traced to an
unreviewed key that a reader assumed reviewed — whichever comes first.
