---
domain: software-engineering
subject: module-design
last_touched: 2026-08-29
touched_by: intake
dry_streak: 0
---

# module-design

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-28 - `/intake`, from a practitioner listicle on design canon

Three amendments, no new technique, from
[[../../sources/2026-08-28-six-things-mistaken-for-good-oop]].

- `seams-and-adapters` gained "An adapter that refuses a verb is not an adapter":
  subtyping is a substitution promise, a substitute that narrows the guarantee has
  broken it, the fix is in the interface (split at the capability that differs),
  with inheritance-for-reuse as the accidental form of the same promise. The
  contract-suite section had only ever caught a drifting *double*.
- `module-depth` gained "A variation is data until it changes a guarantee": the
  counterpart of the options-bag failure. The existing rule sent a different need to
  "a different module, not a mode flag" and, read alone, invited a unit per
  combination of settings. Discriminator: would the module be wrong to choose a
  default?
- `locality-and-leverage` gained one sentence: the type-erasure tell for a wrong
  abstraction (the shared unit can only be typed at the top of the hierarchy).

**The corpus carried every item at module altitude under its own vocabulary**; the
map reported "liskov", "mixin" and "duplication" as holes and all three were
present as substitutability, the contract suite and the wrong-abstraction rule.
The source supplied the class-hierarchy instance the mechanism-neutral subject never
names. Lead banked: a unit-kind selection rule (classes for invariants, functions for
stateless work) - the subject chooses boundaries and never says what kind of unit
sits inside one; needs a second source before it becomes golden-path doctrine.

### 2026-08-27 - `/intake`, from a first-party practitioner interview

Gained `scoreable-designs-are-built-not-argued` from
[[../../sources/2026-08-27-best-engineers-focus-on-system-design]].

**The finding came from the subject's own denial, not from the source.**
`structure-is-not-delegable` partitions design decisions on whether the outcome
is scoreable inside the run, owns the unscoreable half, and hands the scoreable
half to `orchestration-to-tool-migration` (subject: `mcp-tools`). That hand-off
does not land - that technique governs which decisions a *model* makes inside an
LLM pipeline, not an engineer choosing between two implementations of one
interface. The class had been defined twice in this bundle and owned by nobody.

The new technique closes it from the constructive side: one harness over
substitutable candidates rather than N benchmarks, the workload choice as the
undelegable residue one rung down, and the hazard that cheap benchmarks get
commissioned for decisions they cannot settle - the mirror image of this
subject's existing "taste argument" failure mode, and worse, because it does not
look like an opinion. `structure-is-not-delegable` was edited to point at it, so
the pair now reads as one partition with both halves written.

Source supplied the instance and the ratio (a cache key whose shape forces the
data access pattern; three candidate structures benchmarked by an agent, 2-3
days estimated, ~20 minutes actual), written as a dated n=1 existence proof.

### 2026-08-22 - `/research`, from a practitioner codebase

Gained `node--seams-and-adapters` from
[[../../sources/2026-08-22-onecli-repo]] - two seams at two altitudes
(container substrate, vendor harness) in one public tree, with the
conformance-suite-includes-the-fake discipline as the technique's "double
checked against the same contract" made mechanical. The candidate arrived as
a technique proposal and resolved to a catch; the application is the
repayment.

## Declines

None.

## 2026-08-29 — /deepen architecture batch (dry_streak 0, L3)

6→7 techniques (io-free-core — verb-count rule vs seams-and-adapters), 2→5 applications
(go--seams-and-adapters stdlib fs seam; rust--io-free-core mature protocol tree;
rust--module-depth personas projection-lattice deviation). Golden path: observable-
interface (Hyrum) refinement; agent-erosion figures now carry their predicate (~4/5 vs
~half, one 2026 benchmark); gate-able structural subclass carved out honestly
(dependency direction/visibility gateable; depth/leakage not). Survived and
strengthened: smaller-is-not-better (the opposing position concedes in the 2024-25
written dialogue); structure-is-not-delegable (two 2026 studies measure the division of
labour). Banked: selection-agreement benchmark (return: one measuring choice, not
fidelity); kp Phase 3 cv_analysis fold-in (python — impact-only); onecli re-verification
on clock.
