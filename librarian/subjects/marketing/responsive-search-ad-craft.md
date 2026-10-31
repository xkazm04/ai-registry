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


## Review 2026-10-31

Architecture review against the platform's own help pages and the vendor study. Retraction of the forging inference: the vendor analysis this subject cited as 2023 / ~20,000 accounts is the September 2024 study of 22,000+ accounts, and its finding is 'no clear correlation', with Average best on CPA, CVR and ROAS, not uniform no-correlation on every metric.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/responsive-search-ad-craft",
  "date": "2026-10-31",
  "baseline": "c46c573d3",
  "digest": "sha256-b2:119e1bd28a1fb722",
  "disposition": "clarify",
  "coverage": "All 13 documents read in full. Platform limits, serving shape, Ad Strength documentation, the vendor study and text customization checked against primary pages; the private consumer tree was not reopened.",
  "counterexamples": [
    "A set rated Average by the platform had the best CPA, conversion rate and ROAS in a 22,000-account sample.",
    "A served ad can show one headline and one description; a preview that assumes three and two overstates every combination.",
    "A keyword split across two headlines is present in the set but does not count for the platform's label.",
    "A legacy automatically-created-assets campaign was upgraded into AI Max automatically, not by opt-in."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/7684791",
      "result": "Read. Supports limits and slots: \"minimum of 3 headlines, but you can enter up to 15\", \"minimum of 2 descriptions ... up to 4\", headlines \"up to 30 characters\", descriptions \"up to 90\". Serving: \"a minimum of one headline and one description will be selected\"; \"The second headline, third headline, and second description fields aren't guaranteed to appear\". Pinning \"can affect ad strength\"."
    },
    {
      "url": "https://support.google.com/google-ads/answer/9921843",
      "result": "Read. Refutes the 'documentation says the label does not change with performance' wording and the 'length spread' factor: documented factors are \"Keyword relevance\", \"Headline and description quantity\", \"Headline and description diversity\", \"Sitelinks\"; \"it does not measure external factors ... the quality of your landing pages and offerings\"; \"isn't used to calculate Ad Rank, Quality Score, or auction wins\"; \"A keyword must be contained entirely within a single headline to improve Ad Strength\"."
    },
    {
      "url": "https://www.optmyzr.com/blog/google-ad-strength-study",
      "result": "Read. Corrects the vendor analysis: published September 9, 2024 (not 2023), \"over 22,000 accounts\"; \"no meaningful difference in CTR\"; \"RSAs with an 'average' Ad Strength have the best CPA, conversion rate, and ROAS\"; \"There is no clear correlation between ad performance and Ad Strength\"; \"The majority of ads have an Ad Strength label of 'poor' or 'average', but perform well\"."
    },
    {
      "url": "https://support.google.com/google-ads/answer/11259373",
      "result": "Read. Text customization \"was formerly known as automatically created assets\"; \"You must opt-in to AI Max to use this feature\"; campaigns using it \"will automatically be upgraded to AI Max\" starting September 2026. Supports the opt-in claim and adds the automatic upgrade it omitted."
    },
    {
      "url": "https://napoveda.sklik.cz/en/display-network/types-of-ads/combined-ads/",
      "result": "Read. Lists the display combined ad's fields (short and long headline, description) and defers limits to another page; says nothing of a search-network combined ad. Second-platform limit claims stay unverified."
    },
    {
      "source": "Web search for the 'Excellent lost to Good' practitioner experiment",
      "result": "Not found. Adalysis and Clix Marketing report higher strength not tracking CTR/CVR, but no located experiment matches 'Excellent lost to Good on CTR, CVR and Quality Score'. Reverify."
    },
    {
      "source": "Existing consumer applications",
      "result": "Private consumer tree not reopened; dated accounts retained, verified_on dates unchanged."
    }
  ],
  "documents": {
    "responsive-search-ad-craft.md": {
      "disposition": "clarify",
      "reason": "Set-is-the-unit framing and the order of work hold. Corrections owed from opened sources: the label's factors are documented as keyword relevance, quantity, diversity and sitelinks, not length spread; the docs say it does not measure landing pages/offerings and is not used for Ad Rank or Quality Score, not that it 'does not change with performance'; the vendor study is Sept 2024, 22,000+ accounts, no clear correlation with Average best on CPA/CVR/ROAS; the platform-written-assets paragraph omits the September 2026 automatic upgrade of legacy users. Internal: step 4 should name the headroom-vs-short-bucket tension its technique records. Second-platform search-network limits and the practitioner experiment remain unverified."
    },
    "techniques/ad-strength-is-a-proxy-not-relevance.md": {
      "disposition": "clarify",
      "reason": "Proxy-not-relevance rule is confirmed by the platform ('does not measure ... landing pages and offerings'). Evidence paragraph misdates and overstates the vendor study and paraphrases the documentation into a claim it does not make. 'At least five / ideally eight' guidance not re-located this run."
    },
    "techniques/headline-angle-coverage.md": {
      "disposition": "keep",
      "reason": "Angle-first, distinctness as proxy, and leave-out-not-fake rules are internally consistent and labelled as convention; the platform's 'Headline and description diversity' factor supports the distinctness concern."
    },
    "techniques/keyword-coverage-half-not-all.md": {
      "disposition": "clarify",
      "reason": "Share-not-all argument holds and is labelled convention. The quoted 'should include' is not the documentation's wording; it says \"Include popular keywords\" and \"A keyword must be contained entirely within a single headline to improve Ad Strength\", which a rater mirroring the label should know."
    },
    "techniques/length-bucket-spread-and-combination-preview.md": {
      "disposition": "clarify",
      "reason": "Spread and stride-preview rules hold. 'Served combination is three headlines and two descriptions' overstates the documented shape: at least one of each is selected and the second/third headline and second description are not guaranteed."
    },
    "techniques/over-limit-omitted-not-truncated.md": {
      "disposition": "keep",
      "reason": "Minimums (three headlines, two descriptions) confirmed by the platform help page; omission rule and two-path agreement are internally consistent with the limits technique."
    },
    "techniques/platform-limits-stay-slightly-under.md": {
      "disposition": "reverify",
      "reason": "Dominant-platform headline/description limits and slot counts confirmed; second national platform's search-network combined-ad shape and its 25-character display short headline could not be confirmed from its help (limits page not reached). Headroom correctly labelled convention."
    },
    "applications/node--ad-strength-is-a-proxy-not-relevance.md": {
      "disposition": "keep",
      "reason": "Dated 2026-09-09 account of a private tree with deviations recorded and the standard kept; not re-checked, verified_on unchanged."
    },
    "applications/node--headline-angle-coverage.md": {
      "disposition": "keep",
      "reason": "Dated account; rater-vs-judge gap and catalog fallback deviation recorded honestly; not re-checked."
    },
    "applications/node--keyword-coverage-half-not-all.md": {
      "disposition": "keep",
      "reason": "Dated 2026-10-14 change with a paired check and explicit not-measured list; not re-checked."
    },
    "applications/node--length-bucket-spread-and-combination-preview.md": {
      "disposition": "keep",
      "reason": "Dated A/B with target and floor stated and its sample limit disclosed; consistent with the technique's generator decision rule; not re-checked."
    },
    "applications/node--over-limit-omitted-not-truncated.md": {
      "disposition": "keep",
      "reason": "Dated account; the clamp-floor deviation is superseded in part by the 2026-10-22 repair-overruns change recorded in the limits application, which this account predates; both dated, no contradiction in their own dates."
    },
    "applications/node--platform-limits-stay-slightly-under.md": {
      "disposition": "keep",
      "reason": "Dated paired run with floor, sample size and unrealised step 6 disclosed; not re-checked."
    }
  }
}
```


## Review 2026-10-31 (after apply)

The clarify items with an opened source were applied; the record below is against the new bytes. Owed: the second national platform's search-network limits and the 'Excellent lost to Good' practitioner experiment (reverify).

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/responsive-search-ad-craft",
  "date": "2026-10-31",
  "baseline": "c46c573d3",
  "digest": "sha256-b2:0177eee6ee0ee5a9",
  "disposition": "reverify",
  "coverage": "All 13 documents read in full. Platform limits, serving shape, Ad Strength documentation, the vendor study and text customization checked against primary pages; the private consumer tree was not reopened.",
  "counterexamples": [
    "A set rated Average by the platform had the best CPA, conversion rate and ROAS in a 22,000-account sample.",
    "A served ad can show one headline and one description; a preview that assumes three and two overstates every combination.",
    "A keyword split across two headlines is present in the set but does not count for the platform's label.",
    "A legacy automatically-created-assets campaign was upgraded into AI Max automatically, not by opt-in."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/7684791",
      "result": "Read. Supports limits and slots: \"minimum of 3 headlines, but you can enter up to 15\", \"minimum of 2 descriptions ... up to 4\", headlines \"up to 30 characters\", descriptions \"up to 90\". Serving: \"a minimum of one headline and one description will be selected\"; \"The second headline, third headline, and second description fields aren't guaranteed to appear\". Pinning \"can affect ad strength\"."
    },
    {
      "url": "https://support.google.com/google-ads/answer/9921843",
      "result": "Read. Refutes the 'documentation says the label does not change with performance' wording and the 'length spread' factor: documented factors are \"Keyword relevance\", \"Headline and description quantity\", \"Headline and description diversity\", \"Sitelinks\"; \"it does not measure external factors ... the quality of your landing pages and offerings\"; \"isn't used to calculate Ad Rank, Quality Score, or auction wins\"; \"A keyword must be contained entirely within a single headline to improve Ad Strength\"."
    },
    {
      "url": "https://www.optmyzr.com/blog/google-ad-strength-study",
      "result": "Read. Corrects the vendor analysis: published September 9, 2024 (not 2023), \"over 22,000 accounts\"; \"no meaningful difference in CTR\"; \"RSAs with an 'average' Ad Strength have the best CPA, conversion rate, and ROAS\"; \"There is no clear correlation between ad performance and Ad Strength\"; \"The majority of ads have an Ad Strength label of 'poor' or 'average', but perform well\"."
    },
    {
      "url": "https://support.google.com/google-ads/answer/11259373",
      "result": "Read. Text customization \"was formerly known as automatically created assets\"; \"You must opt-in to AI Max to use this feature\"; campaigns using it \"will automatically be upgraded to AI Max\" starting September 2026. Supports the opt-in claim and adds the automatic upgrade it omitted."
    },
    {
      "url": "https://napoveda.sklik.cz/en/display-network/types-of-ads/combined-ads/",
      "result": "Read. Lists the display combined ad's fields (short and long headline, description) and defers limits to another page; says nothing of a search-network combined ad. Second-platform limit claims stay unverified."
    },
    {
      "source": "Web search for the 'Excellent lost to Good' practitioner experiment",
      "result": "Not found. Adalysis and Clix Marketing report higher strength not tracking CTR/CVR, but no located experiment matches 'Excellent lost to Good on CTR, CVR and Quality Score'. Reverify."
    },
    {
      "source": "Existing consumer applications",
      "result": "Private consumer tree not reopened; dated accounts retained, verified_on dates unchanged."
    }
  ],
  "documents": {
    "responsive-search-ad-craft.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: label factors restated from the platform's documentation (keyword relevance, count, diversity, sitelinks; landing page and offer not measured; not used for Ad Rank or Quality Score); vendor analysis corrected to 2024 / 22,000 accounts / no clear correlation, Average best on CPA, CVR, ROAS; 'same year' coupling of the practitioner experiment removed; text-customization automatic upgrade from September 2026 added; step 4 names the headroom/short-bucket tension. Still owed: the second national platform's search-network limits and the 'Excellent lost to Good' practitioner experiment are unconfirmed; no source located."
    },
    "techniques/ad-strength-is-a-proxy-not-relevance.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: evidence paragraph corrected to the 2024 / 22,000-account study and its actual findings; documentation sentence quotes what the label does not measure; input list aligned to documented factors. Still owed: the 'Excellent lost to Good' practitioner experiment and the 'at least five / ideally eight' guidance were not located."
    },
    "techniques/headline-angle-coverage.md": {
      "disposition": "keep",
      "reason": "Angle-first, distinctness as proxy, and leave-out-not-fake rules are internally consistent and labelled as convention; the platform's 'Headline and description diversity' factor supports the distinctness concern."
    },
    "techniques/keyword-coverage-half-not-all.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: platform's keyword guidance quoted from its documentation, including whole-keyword-in-one-headline."
    },
    "techniques/length-bucket-spread-and-combination-preview.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: serving shape stated as at most three headlines and two descriptions, with only the first of each guaranteed."
    },
    "techniques/over-limit-omitted-not-truncated.md": {
      "disposition": "keep",
      "reason": "Minimums (three headlines, two descriptions) confirmed by the platform help page; omission rule and two-path agreement are internally consistent with the limits technique."
    },
    "techniques/platform-limits-stay-slightly-under.md": {
      "disposition": "reverify",
      "reason": "Dominant-platform headline/description limits and slot counts confirmed; second national platform's search-network combined-ad shape and its 25-character display short headline could not be confirmed from its help (limits page not reached). Headroom correctly labelled convention."
    },
    "applications/node--ad-strength-is-a-proxy-not-relevance.md": {
      "disposition": "keep",
      "reason": "Dated 2026-09-09 account of a private tree with deviations recorded and the standard kept; not re-checked, verified_on unchanged."
    },
    "applications/node--headline-angle-coverage.md": {
      "disposition": "keep",
      "reason": "Dated account; rater-vs-judge gap and catalog fallback deviation recorded honestly; not re-checked."
    },
    "applications/node--keyword-coverage-half-not-all.md": {
      "disposition": "keep",
      "reason": "Dated 2026-10-14 change with a paired check and explicit not-measured list; not re-checked."
    },
    "applications/node--length-bucket-spread-and-combination-preview.md": {
      "disposition": "keep",
      "reason": "Dated A/B with target and floor stated and its sample limit disclosed; consistent with the technique's generator decision rule; not re-checked."
    },
    "applications/node--over-limit-omitted-not-truncated.md": {
      "disposition": "keep",
      "reason": "Dated account; the clamp-floor deviation is superseded in part by the 2026-10-22 repair-overruns change recorded in the limits application, which this account predates; both dated, no contradiction in their own dates."
    },
    "applications/node--platform-limits-stay-slightly-under.md": {
      "disposition": "keep",
      "reason": "Dated paired run with floor, sample size and unrealised step 6 disclosed; not re-checked."
    }
  }
}
```
