---
subject: lead-quality-and-source-diagnosis
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-msbv-1022
dry_streak: 0
---

# lead-quality-and-source-diagnosis

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `conversion-and-leads`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** scoring the leads a source produces, deciding whether a paid lead source is junk, explaining why a lead source underperforms, designing a lead score for a work queue, setting the minimum sample before a source verdict

**Techniques (6):** cause-taxonomy-spam-mistargeting-pricing-volume, cheap-cpl-splits-spam-from-mistargeting, junk-source-rule, minimum-sample-before-verdict, quality-score-qualification-and-win, two-axis-fit-engagement.

**Applications (6; stacks: node):** node--cause-taxonomy-spam-mistargeting-pricing-volume, node--cheap-cpl-splits-spam-from-mistargeting--peers-and-prior, node--junk-source-rule, node--minimum-sample-before-verdict, node--quality-score-qualification-and-win, node--two-axis-fit-engagement.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.
- 2026-10-22, intake-apply-junk-source-rule: `junk-source-rule` applied to systedo-case
  in code, verdict better. The junk badge had no sample floor while the diagnosis reads
  under 30 leads as volume, and the diagnosis kept its own copy of the 0.35 threshold.
  B shares both constants: rows junk while the diagnosis says volume went from 3 of 5 to 0
  on a small live tier, and the demo spine was unchanged. The commits are on a local
  branch, unpushed: the project's pre-push suite is red outside the change.
- 2026-10-22, intake-apply-msbv-1022: `minimum-sample-before-verdict` applied to
  systedo-case in code, verdict better. The diagnosis had one floor, on leads, so the
  win-rate and pricing branches ran on any qualified count, and the CPQL alerts had no
  floor (the product's own fixture alerted a 100 % rise on one qualified lead). B adds a
  qualified floor of 30: verdicts on under 30 qualified went 2 of 7 to 0 on a CRM-shaped
  tier, qualification verdicts kept, demo spine byte-identical. Both live tiers carry no
  prior period, so the alert half is preventive in this tree. Branch cur/msbv-floor is
  pushed, stacked on the junk-floor branch; not merged to master.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- Unapplied: `cause-taxonomy-spam-mistargeting-pricing-volume`,
  `quality-score-qualification-and-win`, `two-axis-fit-engagement` have no
  `librarian/applied.md` row.
- minimum-sample-before-verdict, unmet in the consumer: the lead module's trend pill
  still takes a tone from a thin CPQL delta; the floor is the convention, not an
  interval; a thin source is not told when it will be judgeable.
- junk-source-rule, unmet in the consumer: the threshold is an absolute fraction, not
  relative to the blended qualification rate. The junk copy calls a non-cheap junk
  source cheap. The alert names neither the source nor its two numbers.
