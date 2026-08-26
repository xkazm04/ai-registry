---
domain: software-engineering
subject: agent-memory
last_touched: 2026-08-25
touched_by: research
dry_streak: 0
---

# agent-memory

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from an external source

Gained `procedure-promotion` (9 -> 10 techniques). Source:
[[2026-08-22-ai-agent-race-exploded]].

Not a hole - a seam. `consolidation` already produced procedures as durable beliefs, so
the mapping instrument returned almost nothing and the finding had to be read out of the
prose. The boundary it names is where a remembered procedure becomes an invocable
capability, which is a different artifact class with a different lifecycle: executed
rather than injected, versioned rather than overwritten, and reviewable by a human who
never reads a transcript.

The finding met the corroboration bar by **cross-run convergence** - two independent
vendors shipping the same capture-and-promote feature across two runs - rather than by
a fetched source.

### 2026-08-22 - `/research`, from an external source (second touch)

Three techniques amended from [[2026-08-22-shapes-of-agent-memory]], a
first-party empirical study: `consolidation` gained the state-vs-event
supersedence type check; `episodic-capture` gained the distiller-ceiling
section (yield instrumentation + priced write path); `recall-injection`
gained two sections - "Labeled is not applied" (critique-and-reconstruct
before a recalled experience drives action; memory's value floats on the
consumer-task gap) and "Eager recall buys over-answering" (the answer-side
abstention discipline, with the should-abstain-in-denominator eval rule).
Zero new files; the subject stays at ten techniques. The trained-experience
architecture is banked as a lead with a return condition in the source note.

## Open leads

- **The promotion door and `hitl-approval` overlap.** A procedure with unbounded
  consequence is promoted with a gate attached; if a later run touches either subject,
  check the seam is stated once rather than twice.
- **This registry is itself an instance.** Its `skills/` lane is a library of promoted
  procedures with versions and lessons. Whether that is worth an application document is
  a real question and was not answered here.

## Standing debt

- Ten techniques is the largest count in `llm-agent`. Not a cap breach (files are not
  counted), but worth watching: a subject that keeps growing techniques may be two
  subjects.
- **Never swept by `/librarian`.**

## Declines

None.

## 2026-08-25 - /intake run 12 ([[2026-08-25-awesome-graph-engineering]])

- `procedure-promotion` gained two measured sections from the 2026 skills field study: the artifact carries actions not facts (65.7% vs 4.5%), and selection-at-scale is the silent failure (actual-use precision 29.6% -> 3.3% at pools 5 -> 100, success flat; cap and scope the live pool, merge confusable siblings, measure actual-use).
- Golden path gained the store-shape paragraph: two independent sightings (shapes-study hybrid-ties-flat; a graph vendor own-ablation +2%) that topology buys marginal recall; value lives in the transitions. Temporal-KG supersedence resolved as a catch - consolidation already outreasons it.

## 2026-08-25 - /intake run 13 ([[2026-08-25-awesome-llm-apps]])

- One sentence added to `procedure-promotion`'s confusable-siblings rule: static pairwise description linting as the standing admission guard. The registry now runs its own (`scripts/check-skill-triggers.mjs`).

## 2026-08-26 - /intake run 18 ([[2026-08-26-supermemory]])

- `decay-and-forgetting` gained a third axis: **the fact that expires by its own terms.**
  The technique's own enumeration said wrongness -> supersedence, staleness -> decay, and
  a self-dating claim is neither. The mechanism the corpus adds over the source: the
  retrieval term *protects* these items, because a time-boxed claim is maximally
  retrievable exactly during the window in which it is true. Cites
  `creation-names-reaper` at item level and `unknown-is-not-a-value` for the bound (an
  absent boundary is never a default expiry). `laws:` frontmatter extended accordingly.
- `episodic-capture` gained **the batch is the ceiling's other half** - third sighting of
  one root across two runs, landed as the root rather than a third dated fact. Distiller
  *strength* (2026-08-22, the study) and distiller *input size* (this run) bound the same
  thing from opposite sides and need opposite fixes; what a crowded batch drops first is
  the cross-item judgments, stated shape-neutrally so it does not smuggle in a store
  topology.
- **Two applications written against a real tree** (`rust--decay-and-forgetting`,
  `rust--episodic-capture`), and the expiry lane was realized and committed in the
  connected project the same run.
- **The tree corrected the technique once.** The first draft of the episodic-capture
  amendment claimed a batch never names what it crowded out. The tree's packer does -
  `dropped` against `total_available`, surfaced into the distiller's own prompt - and
  goes further: overflow is *deferred* to the next cycle, not discarded, with the
  stopping boundary recorded. "Overflow defers; it does not drop" is now the technique's
  rule and it came from the code, not from the source that started the run.
- Four catches, all real: version chains, tombstone-with-a-reason, static/dynamic
  profile split, container isolation. This subject outclassed a state-of-the-art vendor's
  published ontology on every one of them.

## Open leads (added 2026-08-26)

- **A deliberate forget and an expiry need opposite re-derivation policies.** An
  operator-issued forget must suppress re-derivation of a key or the next distillation
  pass reverses the correction from the same episodes; an expiry must leave the key
  learnable. A store with one forget operation cannot express both. Return when the
  connected tree's in-flight operator-forget lane lands in `HEAD`.
- **The coverage hole under the expiry lane.** Nothing counts boundaries the distiller
  failed to notice - an absence, and `coverage-instrumentation` says a listing surface
  cannot show one. The technique states the obligation; no realization measures it yet.
