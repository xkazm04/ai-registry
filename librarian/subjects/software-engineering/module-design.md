---
domain: software-engineering
subject: module-design
last_touched: 2026-08-27
touched_by: intake
dry_streak: 0
---

# module-design

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

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
