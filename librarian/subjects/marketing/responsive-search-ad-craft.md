---
subject: responsive-search-ad-craft
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-plsu-1022 (apply)
dry_streak: 0
---

# responsive-search-ad-craft

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `paid-advertising`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** writing or generating a multi-asset search ad, rating a set of headlines and descriptions before upload, exporting an ad set to a platform import sheet, deciding what a platform's ad-strength label is allowed to mean

**Techniques (6):** ad-strength-is-a-proxy-not-relevance, headline-angle-coverage, keyword-coverage-half-not-all, length-bucket-spread-and-combination-preview, over-limit-omitted-not-truncated, platform-limits-stay-slightly-under.

**Applications (5; stacks: node):** node--ad-strength-is-a-proxy-not-relevance, node--headline-angle-coverage, node--keyword-coverage-half-not-all, node--length-bucket-spread-and-combination-preview, node--over-limit-omitted-not-truncated.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.
- 2026-10-22 (intake-apply-lbscp-1022): length-bucket-spread-and-combination-preview
  applied, `code`, `better`. The rater and the preview already followed the technique.
  The generator was never asked for a spread. Real-model A/B: 0/8 to 8/8 three-bucket
  sets once the prompt asked for the short bucket alone. Asking for all three buckets
  clamped over-limit headlines. That became one decision rule. Two techniques in this
  subject pull against each other at the generator: staying under the limit empties the
  short bucket.
- 2026-10-22 (intake-apply-plsu-1022): platform-limits-stay-slightly-under applied,
  `code`, `better`. Five of the six steps were already in the tree. Step 4 had been
  removed deliberately: to save a model call, a pure length overrun went to the clamp,
  which cut the asset mid-word. In a paired real-model run, 8 truncated descriptions
  became 0 on the fast tier at 2 extra calls in 12. The quality tier never overran.
  The rule is a cost question only for tiers that overrun, and those are the tiers
  where the clamp hides the failure.

## Owed

- Single-stack debt, still open after 2026-10-22. The attention scan ranked this
  subject for it. Of the two fleet projects declaring `marketing`, only one generates or
  rates ad copy, so no second-stack tree exists to apply against. The return condition
  is a second tree that writes or rates a search-ad asset set.
- Preview step 5 (narrow-width view) is unrealised in the one tree that has a preview.
- Unapplied (no `librarian/applied.md` row): ad-strength-is-a-proxy-not-relevance,
  headline-angle-coverage and over-limit-omitted-not-truncated.
- platform-limits-stay-slightly-under step 6 (count the way the platform counts) is
  unrealised: the tree counts UTF-16 units.
