---
subject: search-term-mining
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-nbp-1022 (apply)
dry_streak: 0
---

# search-term-mining

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `paid-advertising`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** turning a search-terms report into negative keywords, deciding whether a query has earned its own exact keyword, designing or reviewing an automated negative/promote recommender, auditing why a converting query stopped serving

**Techniques (6):** campaign-level-phrase-negative, exact-promote-into-serving-ad-group, negatives-before-promotes, never-mine-demo-data, spend-and-click-floors-before-negation, zero-conversions-on-unrounded-count.

**Applications (5; stacks: node):** node--campaign-level-phrase-negative, node--exact-promote-into-serving-ad-group, node--negatives-before-promotes, node--never-mine-demo-data, node--zero-conversions-on-unrounded-count.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.
- 2026-10-22 (apply-exact-promote-1022): exact-promote-into-serving-ad-group applied,
  `code`, `better`. The tree kept unknown match types distinct in its mapper and then
  let them through with a "not exact" gate in another file. Paired A/B: an unknown-type
  row with 3 conversions promoted 1/1 before, 0/1 after an allowlist gate. That became
  one decision rule: list the match types a promote may come from.
- 2026-10-22 (intake-apply-nbp-1022): negatives-before-promotes applied, `code`,
  `better`. The recommender emitted the pinned order. The apply loop kept going past a
  failed criterion move, and a unit test pinned a promote landing after a failed
  negative. Paired A/B: promotes after a failed negative 2/2 before, 0/2 after. The
  tree argues for a narrower reading of the technique's "stop on failure": withhold
  every promote after a failed negative, and let later negatives run, since their
  errors are usually row-specific. Recorded in the application and not in the
  technique, because it rewrites a standing rule from one tree. Return: a second tree,
  or a measured failure rate for negatives.

## Owed

- Single-stack debt, still open after 2026-10-22. The attention scan ranked this
  subject for it. Of the two fleet projects declaring `marketing`, only one reads a
  search-terms report; the other holds freelance gig documents and no ads code. The
  return condition is a second tree that mines search terms.
- Unapplied (no `librarian/applied.md` row): spend-and-click-floors-before-negation, and never-mine-demo-data and
  zero-conversions-on-unrounded-count, which have applications but no A/B row.
