---
layer: technique
type: technique
subject: wiring-contract-doctrine
technique: cross-catalog-link-resolution
status: forged
laws: [one-authority-per-quantity, compiling-is-not-wiring, unmeasured-is-not-a-pass]
shared_with: []
use_when: [dependencies name siblings in other catalogs, finding orphaned content, an effect that fires and silently does nothing]
---

# Cross-catalog link resolution

The dependency field is only worth writing if every name in it is looked up. Link
resolution is the pass that takes each declared dependency, finds the catalog it
claims to live in, and confirms the referent exists — turning a documentation
convention into an integrity constraint over the whole content graph.

This is the step where the doctrine stops being about individual artifacts. Once
dependencies resolve, they are edges; once they are edges, the content is a graph;
once it is a graph, reachability is a traversal rather than an audit, and the
question "which of these two hundred artifacts can a player actually get to"
becomes a query that runs in a second.

## The contract between content classes

Each content class declares, once, which other catalogs it may reference and in
which fields. An ability's effects reference the status-effects catalog. An item's
affixes reference the status-effects catalog. An enemy's abilities reference the
abilities catalog. A spawn table references the enemies catalog.

Declaring this per class, rather than resolving whatever identifiers happen to
look like identifiers, buys three things:

- **Typed edges.** A name in an item's affix field is known to be a status effect,
  so a resolution failure is specific — "affix references an unknown status
  effect" — instead of "unknown reference somewhere".
- **A generation order.** If items depend on status effects, status effects are
  produced first. A pipeline that generates in arbitrary order manufactures
  dangling references at a rate proportional to how much it produces, then spends
  the rest of the milestone chasing them.
- **A ceiling on the blast radius of a rename.** The set of catalogs that can
  possibly break is knowable before the rename, not discovered after.

The corollary is single authority: each referenced entity is defined in exactly
one catalog, and every other mention is a link to it. A status effect that exists
as a real entry in the status catalog *and* as an inline description on three
abilities has four definitions, and the disagreement between them is invisible
until it is load-bearing.

## The procedure

1. **Resolve every declared dependency against its stated catalog**, on every
   commit. Report unresolved as a failure attached to the *referencing* artifact,
   with the field, the identifier, and the catalog searched.
2. **Distinguish three outcomes, not two.** *Resolved* (the referent exists),
   *unresolved* (it does not), and *not yet produced* (it is a legitimate future
   entry the pipeline has scheduled). Collapsing the third into the second makes
   the report unreadable during active generation and trains everyone to ignore
   it.
3. **Walk the graph backwards for reachability.** From the roots a player can
   actually touch — starting loadouts, progression tiers, loot tables, spawn
   rules, quest rewards — traverse the granting edges. Anything unvisited is an
   orphan. This is the query the whole doctrine was built to enable, and it is the
   one that finds the two hundred beautiful unreachable artifacts.
4. **Report orphans in three buckets**, matching the granting field's declared
   state: *declared and reachable*, *declared deferred* (staged for a named
   milestone), and *undeclared orphan*. Only the third is a defect. Without the
   deferred bucket the report has a permanent noise floor and gets muted.
5. **Make every unresolved report actionable, not merely accurate.** Name the
   unresolved targets individually — the catalog and the identifier, not a count —
   and state the legal resolutions, which are always exactly two: *produce the
   target entity*, or *drop the link and model the thing as descriptive data*. A
   failure that names the fix is closed in a minute; one that reports "3 of 7
   links resolve" starts an investigation, and investigations get deferred.
6. **Fail the rename, not the release.** When an identifier changes, the resolver
   is the thing that finds every referencing artifact, and the rename is not done
   until they all resolve again.

## Decision rules

- **When a dependency cannot be typed to a catalog, it is not a dependency —
  it is prose.** Move it out of the field or give the project a catalog for it.
  An untypeable entry pollutes the graph with unresolvable edges and slowly
  teaches the team that resolution failures are normal.
- **When resolution is case-, whitespace- or path-sensitive, normalize at one
  door.** Two normalizers will disagree, and the disagreement surfaces as a
  reference that resolves in the checker and not in the engine — the worst
  possible split, since the check now actively lies.
- **When an artifact's dependency is binary content rather than a sibling entry,
  do not attempt to resolve it as a link.** Route it to the flagged
  human-authored queue and count it separately; a mesh that does not exist yet is
  a scheduling fact, not a broken reference.
- **When the resolver cannot run — no catalog context, no index loaded — it
  reports *not resolved here*, never a pass.** The temptation is real and the
  reasoning sounds responsible: a path that genuinely cannot resolve links should
  not drag a good artifact down, so it returns green. What it has actually done is
  make greenness depend on which code path asked, and the least-capable path is
  usually the one feeding the summary. An unrunnable check is unmeasured, and
  unmeasured is its own value.
- **When the orphan count is non-zero at a milestone, it is a release-blocking
  number or it is decoration.** Pick one deliberately. A number nobody blocks on
  will be non-zero forever and will grow.

## What resolution does not prove

A resolving link proves the referent exists. It does not prove the referent is
*correct* — an ability pointing at the wrong status effect resolves perfectly. It
does not prove the engine will actually load the reference at runtime, which is a
separate question about how the data reaches the engine. And it does not prove the
effect is visible: a status effect that exists, resolves, and applies with no
visual cue is reachable and unperceivable, which is a different defect on a higher
rung of evidence.

## When not to use it

- **Not before the catalogs have stable identifiers.** Resolution over a naming
  scheme still in flux produces a wall of failures that are all the same failure,
  and the wall is what kills adoption. Stabilize identifiers first; resolve
  second.
- **Not as a replacement for the engine's own reference validation.** If the
  runtime has a loader that can report unresolved references from real data, that
  observation sits on a higher rung and should be preferred where it is available.
  Static resolution is the cheap, every-commit approximation — necessary, and
  never sufficient on its own.
