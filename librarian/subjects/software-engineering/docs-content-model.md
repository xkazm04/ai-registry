---
subject: docs-content-model
domain: software-engineering
last_touched: 2026-11-11
dry_streak: 0
---

# docs-content-model

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

5 techniques, 2 react applications. Golden path 251 lines.

## Open leads (banked, with return conditions)

- **absence-carries-meaning** (proposed law, not added). An optional field's emptiness needs a declared meaning or every consumer resolves it toward no-work. Three sightings, two of them in EXISTING techniques (`doc-rot-detection`'s unverifiable verdict, `source-doc-mapping`'s not-coupled). Strongest of the wave's proposals on evidence outside itself. Return next sweep.

## 2026-11-09 - backlog 3-017

`reference-integrity-is-per-edition` landed (experiment, better). Replay of one specification's source: 2,827 references resolve in the source and dangle in its developer edition; 1,460 more hold only through substitute definitions; 39 of 40 sampled live mentions render unlinked. The parser is approximate and three pages is a sample. The half about an edition that stopped building was not measured. Not applied at a seam: no fleet project ships audience editions.

## 2026-11-11 - /harvest backlog 3-042 ([[../../sources/2026-08-31-awesome-agentic-patterns]], /shift filler)

`relationship-fields-stay-empty` landed (blind-ab, better), clause a only: authors fill the fields whose answer they hold while writing (based-on 190 of 193) and not the ones that need a view of the corpus (related 15 of 193), so a read-next panel or graph built on a relationship field presents its emptiness as a fact about the record. Re-verified on this registry's own technique records before drafting: `laws` non-empty on 3900 of 4064, `shared_with` on 17 of 3984, while 1269 of 4064 link another technique in their prose. Probe: this registry's real frontmatter contract plus a proposal for an optional `related:` field feeding a read-next panel and a graph view. Both arms held per-topic-freshness-metadata and derived-navigation-projection. A 12, B 9 on the two target keys (target 3, met exactly): every arm-B run read the emptiness as existing records not yet assessed and said the panel would work, at least for new records; every arm-A run predicted the field stays empty because nobody writing one record holds the answer. The remedy clause (derive edges from links authors already write, write the reverse edge mechanically) tied 6 of 6 and did not land. Floor (keep laws, use_when and shared_with author-declared) 6 of 6 both arms; controls held. Sibling 3-023 (optional fields decay, a fill-rate rule) stays not-better from 11-09: this landing is the writing-time predictor, not a census rule.

## Declines

- Ceded cross-repository drift detection to `docs-sync` rather than claiming it, on the rule that a field on a record is a content-model decision and a query over it is a stewardship one. Both workers stated the same seam independently.
