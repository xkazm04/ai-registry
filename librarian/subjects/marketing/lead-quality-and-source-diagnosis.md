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

## Architecture review 2026-10-31

First architecture-review record. Two clarify items found: the two-axis technique misstated the vendor floor for learned scoring as closed outcomes rather than leads plus conversions, and the cause-taxonomy application used a per-stage-floor example (9 of 40 qualified) that the cited rule order cannot route to the win-rate branch. Both applied in the same pass; the second record is against the edited bytes.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/lead-quality-and-source-diagnosis",
  "date": "2026-10-31",
  "baseline": "c46c573d3",
  "digest": "sha256-b2:e5af2603bf125987",
  "disposition": "clarify",
  "coverage": "All 13 documents read in full (golden path, 6 techniques, 6 node applications). Sample-size arithmetic re-derived by computation; vendor scoring claims checked against primary/near-primary pages. Consumer trees are private and were not re-opened or re-executed.",
  "trigger": "Pending architecture review; first record for this subject.",
  "intended_benefit": "Sources are judged at qualified and won stages, with one closed cause, one shared junk predicate and per-stage sample floors, so verdicts agree across surfaces and can be scored later.",
  "failure_if_ignored": "Cost-per-lead ranking rewards spam floods; thin-sample verdicts and alerts accuse sources on noise; two copies of a threshold disagree on one row.",
  "boundary": "Per-source quality and cause; per-lead two-axis grade. Not the reply clock (speed-to-lead), not offline-conversion upload (attribution-and-incrementality), not the general diagnosis shape (performance-root-cause-diagnosis).",
  "counterexamples": [
    "A mis-targeted campaign on a cheap social lead form reads 'cheap and unqualified' under the peer test alone; the prior-period test is what separates it (the 2026-10-14 experiment's cold lead-form source).",
    "A broken sales process (slow replies) shows as a low win rate and is mis-read as mis-targeting unless the reply clock is read first.",
    "A one-field-form business has a normal qualification rate near a fifth, so an absolute 35% junk threshold flags its every paid source.",
    "A bot with a plausible company name scores A on fit by construction; the source diagnosis must outrank the lead grade."
  ],
  "sources": [
    {
      "url": "https://knowledge.hubspot.com/scoring/understand-the-lead-scoring-tool",
      "result": "Read. Engagement scores 'qualify records based on their actions and interactions'; fit scores 'based on their demographic information'; combined scores yield total, engagement-only and fit-only values, labelled A-C (fit) x 1-3 (engagement). Supports the two-axis convention; decay intervals 1/3/6/12 months, so the 30-day half-life is correctly a convention."
    },
    {
      "url": "https://www.crmscience.com/single-post/how-salesforce-einstein-lead-scoring-works",
      "result": "Read (secondary). Einstein Lead Scoring historically 'required 1,000 new leads and 120 leads converted in the previous six months'; smaller orgs scored from 'anonymized data from Salesforce customers' as a baseline. Refutes 'a thousand closed outcomes' as the floor's unit."
    },
    {
      "url": "https://resources.docs.salesforce.com/242/latest/en-us/sfdc/pdf/sales_einstein_implementation_guide.pdf",
      "result": "Not reachable (HTTP 503). Search excerpt reports 1,000 leads created and 120 converted in the last 200 days (Spring '23); the current window is unverified, so the applied wording says 'half-year window' without a day count."
    },
    {
      "source": "Computation (Wilson and exact binomial)",
      "result": "Upper bound below 0.35: p=0.2 needs n~39 (Wilson, 95%) / ~45 (exact, one-sided 2.5%); p=0.3 needs ~350-370. Confirms minimum-sample-before-verdict's figures."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated reports retained; private consumer evidence not re-executed; verified_on dates unchanged."
    }
  ],
  "documents": {
    "lead-quality-and-source-diagnosis.md": {
      "disposition": "keep",
      "reason": "Scope boundaries with performance-root-cause-diagnosis, speed-to-lead and attribution are explicit; the stage-rate verdict, per-stage floor arithmetic (30 leads x 35% = ~10 qualified) and tombstone denominator rule are internally consistent with every technique."
    },
    "techniques/quality-score-qualification-and-win.md": {
      "disposition": "keep",
      "reason": "Adjacent-denominator rates, absence-as-null and band-is-not-verdict hold; weights and bands are labelled convention with a calibration route."
    },
    "techniques/junk-source-rule.md": {
      "disposition": "keep",
      "reason": "One predicate, one exported threshold, shared sample floor; threshold labelled convention with the relative-to-blend standard. Consumer evidence (node--junk-source-rule) confirmed the two-verdicts failure it predicts."
    },
    "techniques/cause-taxonomy-spam-mistargeting-pricing-volume.md": {
      "disposition": "keep",
      "reason": "Closed ordered set, least-accusatory coercion and severity-from-shown-cause are coherent; boundary to speed-to-lead (sales-process failures) is stated."
    },
    "techniques/cheap-cpl-splits-spam-from-mistargeting.md": {
      "disposition": "keep",
      "reason": "Stated as a heuristic with mechanism, relative to two baselines, corroborated by telemetry; refuses to split when spend is unmeasured. The 2026-10-14 experiment exercised the prior-period half."
    },
    "techniques/minimum-sample-before-verdict.md": {
      "disposition": "keep",
      "reason": "Arithmetic re-derived this run: an upper 95% bound below 35% at a 20% observed rate needs ~39 leads (Wilson) to ~45 (exact binomial), so 'roughly fifty' is conservative-correct; at 30% observed it needs ~350 (Wilson), so 'several hundred' holds; 30 leads at p~1/3 is the np>=10 normal-approximation threshold."
    },
    "techniques/two-axis-fit-engagement.md": {
      "disposition": "clarify",
      "reason": "HubSpot documents separate fit, engagement and combined scores (supports the two-axis convention; its combined label is a 3x3 A-C/1-3 grid, the 2x2 here is a chosen simplification). But 'below roughly a thousand closed outcomes stay rule-based' misstates the vendor floor it echoes: Einstein Lead Scoring's documented threshold is ~1,000 leads created and 120 converted in the window, with a pooled global model below it. Restate as leads-plus-conversions."
    },
    "applications/node--quality-score-qualification-and-win.md": {
      "disposition": "keep",
      "reason": "Dated 2026-09-09 against a pinned commit; the ungated drift alert and floorless junk flag it records remain true of that commit and of master (the later fixes live on unmerged branches per the sibling applications). Private tree not re-opened; verified_on unchanged."
    },
    "applications/node--cause-taxonomy-spam-mistargeting-pricing-volume.md": {
      "disposition": "clarify",
      "reason": "Internal inconsistency: the 'per-stage floor absent' example (40 leads, 9 qualified, mis-targeting on a win rate over nine) cannot reach the win-rate branch under the pickCause order the same document cites, since 9/40 = 22.5% < MIN_QUAL_RATE 0.35. Use a count at or above 35% (e.g. 15 of 40)."
    },
    "applications/node--cheap-cpl-splits-spam-from-mistargeting--peers-and-prior.md": {
      "disposition": "keep",
      "reason": "Experiment states its unmeasured parts (prompt not changed, top-three peer median, no telemetry producer). Private tree not re-run; verified_on unchanged."
    },
    "applications/node--junk-source-rule.md": {
      "disposition": "keep",
      "reason": "ab-paired evidence with commits and declared floor; unmet standards listed. Private tree not re-run; verified_on unchanged."
    },
    "applications/node--minimum-sample-before-verdict.md": {
      "disposition": "keep",
      "reason": "ab-paired evidence; records that the alert half is preventive on this tree's live tiers and lists the owed trend-pill and judgeable-date gaps. Private tree not re-run; verified_on unchanged."
    },
    "applications/node--two-axis-fit-engagement.md": {
      "disposition": "keep",
      "reason": "Anchors describe the weights the technique labels convention; recency/re-normalise/erasure lessons coherent. Private tree not re-opened; verified_on unchanged."
    }
  }
}
```

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/lead-quality-and-source-diagnosis",
  "date": "2026-10-31",
  "baseline": "c46c573d3",
  "digest": "sha256-b2:c66487b32388a394",
  "disposition": "keep",
  "coverage": "All 13 documents read in full (golden path, 6 techniques, 6 node applications). Sample-size arithmetic re-derived by computation; vendor scoring claims checked against primary/near-primary pages. Consumer trees are private and were not re-opened or re-executed.",
  "trigger": "Pending architecture review; first record for this subject.",
  "intended_benefit": "Sources are judged at qualified and won stages, with one closed cause, one shared junk predicate and per-stage sample floors, so verdicts agree across surfaces and can be scored later.",
  "failure_if_ignored": "Cost-per-lead ranking rewards spam floods; thin-sample verdicts and alerts accuse sources on noise; two copies of a threshold disagree on one row.",
  "boundary": "Per-source quality and cause; per-lead two-axis grade. Not the reply clock (speed-to-lead), not offline-conversion upload (attribution-and-incrementality), not the general diagnosis shape (performance-root-cause-diagnosis).",
  "counterexamples": [
    "A mis-targeted campaign on a cheap social lead form reads 'cheap and unqualified' under the peer test alone; the prior-period test is what separates it (the 2026-10-14 experiment's cold lead-form source).",
    "A broken sales process (slow replies) shows as a low win rate and is mis-read as mis-targeting unless the reply clock is read first.",
    "A one-field-form business has a normal qualification rate near a fifth, so an absolute 35% junk threshold flags its every paid source.",
    "A bot with a plausible company name scores A on fit by construction; the source diagnosis must outrank the lead grade."
  ],
  "sources": [
    {
      "url": "https://knowledge.hubspot.com/scoring/understand-the-lead-scoring-tool",
      "result": "Read. Engagement scores 'qualify records based on their actions and interactions'; fit scores 'based on their demographic information'; combined scores yield total, engagement-only and fit-only values, labelled A-C (fit) x 1-3 (engagement). Supports the two-axis convention; decay intervals 1/3/6/12 months, so the 30-day half-life is correctly a convention."
    },
    {
      "url": "https://www.crmscience.com/single-post/how-salesforce-einstein-lead-scoring-works",
      "result": "Read (secondary). Einstein Lead Scoring historically 'required 1,000 new leads and 120 leads converted in the previous six months'; smaller orgs scored from 'anonymized data from Salesforce customers' as a baseline. Refutes 'a thousand closed outcomes' as the floor's unit."
    },
    {
      "url": "https://resources.docs.salesforce.com/242/latest/en-us/sfdc/pdf/sales_einstein_implementation_guide.pdf",
      "result": "Not reachable (HTTP 503). Search excerpt reports 1,000 leads created and 120 converted in the last 200 days (Spring '23); the current window is unverified, so the applied wording says 'half-year window' without a day count."
    },
    {
      "source": "Computation (Wilson and exact binomial)",
      "result": "Upper bound below 0.35: p=0.2 needs n~39 (Wilson, 95%) / ~45 (exact, one-sided 2.5%); p=0.3 needs ~350-370. Confirms minimum-sample-before-verdict's figures."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated reports retained; private consumer evidence not re-executed; verified_on dates unchanged."
    }
  ],
  "documents": {
    "lead-quality-and-source-diagnosis.md": {
      "disposition": "keep",
      "reason": "Scope boundaries with performance-root-cause-diagnosis, speed-to-lead and attribution are explicit; the stage-rate verdict, per-stage floor arithmetic (30 leads x 35% = ~10 qualified) and tombstone denominator rule are internally consistent with every technique."
    },
    "techniques/quality-score-qualification-and-win.md": {
      "disposition": "keep",
      "reason": "Adjacent-denominator rates, absence-as-null and band-is-not-verdict hold; weights and bands are labelled convention with a calibration route."
    },
    "techniques/junk-source-rule.md": {
      "disposition": "keep",
      "reason": "One predicate, one exported threshold, shared sample floor; threshold labelled convention with the relative-to-blend standard. Consumer evidence (node--junk-source-rule) confirmed the two-verdicts failure it predicts."
    },
    "techniques/cause-taxonomy-spam-mistargeting-pricing-volume.md": {
      "disposition": "keep",
      "reason": "Closed ordered set, least-accusatory coercion and severity-from-shown-cause are coherent; boundary to speed-to-lead (sales-process failures) is stated."
    },
    "techniques/cheap-cpl-splits-spam-from-mistargeting.md": {
      "disposition": "keep",
      "reason": "Stated as a heuristic with mechanism, relative to two baselines, corroborated by telemetry; refuses to split when spend is unmeasured. The 2026-10-14 experiment exercised the prior-period half."
    },
    "techniques/minimum-sample-before-verdict.md": {
      "disposition": "keep",
      "reason": "Arithmetic re-derived this run: an upper 95% bound below 35% at a 20% observed rate needs ~39 leads (Wilson) to ~45 (exact binomial), so 'roughly fifty' is conservative-correct; at 30% observed it needs ~350 (Wilson), so 'several hundred' holds; 30 leads at p~1/3 is the np>=10 normal-approximation threshold."
    },
    "techniques/two-axis-fit-engagement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'below roughly a thousand closed outcomes' -> the vendor-floor reading actually documented (about a thousand leads with ~120 converted in a half-year window, below which the vendor scores from a pooled cross-customer model). Two-axis convention confirmed by HubSpot's separate fit/engagement/combined scores."
    },
    "applications/node--quality-score-qualification-and-win.md": {
      "disposition": "keep",
      "reason": "Dated 2026-09-09 against a pinned commit; the ungated drift alert and floorless junk flag it records remain true of that commit and of master (the later fixes live on unmerged branches per the sibling applications). Private tree not re-opened; verified_on unchanged."
    },
    "applications/node--cause-taxonomy-spam-mistargeting-pricing-volume.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the per-stage-floor example 'forty leads and nine qualified ... win rate over nine' -> 'fifteen qualified ... win rate over fifteen'; 9/40 = 22.5% is under MIN_QUAL_RATE 0.35, so the documented pickCause order would diagnose it on qualification, never reaching the win-rate branch. verified_on unchanged (citations not re-checked)."
    },
    "applications/node--cheap-cpl-splits-spam-from-mistargeting--peers-and-prior.md": {
      "disposition": "keep",
      "reason": "Experiment states its unmeasured parts (prompt not changed, top-three peer median, no telemetry producer). Private tree not re-run; verified_on unchanged."
    },
    "applications/node--junk-source-rule.md": {
      "disposition": "keep",
      "reason": "ab-paired evidence with commits and declared floor; unmet standards listed. Private tree not re-run; verified_on unchanged."
    },
    "applications/node--minimum-sample-before-verdict.md": {
      "disposition": "keep",
      "reason": "ab-paired evidence; records that the alert half is preventive on this tree's live tiers and lists the owed trend-pill and judgeable-date gaps. Private tree not re-run; verified_on unchanged."
    },
    "applications/node--two-axis-fit-engagement.md": {
      "disposition": "keep",
      "reason": "Anchors describe the weights the technique labels convention; recency/re-normalise/erasure lessons coherent. Private tree not re-opened; verified_on unchanged."
    }
  }
}
```
