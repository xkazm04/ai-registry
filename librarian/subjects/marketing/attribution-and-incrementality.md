---
subject: attribution-and-incrementality
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# attribution-and-incrementality

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `measurement-and-economics`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** a report or prompt is about to say a channel "drove" or "caused" conversions, two ad platforms' conversion counts are being summed or compared, a budget change is being judged by what happened after it, offline or pipeline conversions are being fed back to an ad platform

**Techniques (6):** before-after-is-not-an-experiment, holdout-test-on-the-biggest-channel, last-click-under-credits-prospecting, offline-conversion-upload-guards, platform-conversions-are-self-attributed, triangulate-attribution-incrementality-and-mix-model.

**Applications (3; stacks: node):** node--before-after-is-not-an-experiment, node--last-click-under-credits-prospecting, node--offline-conversion-upload-guards.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.

## 2026-10-31 - architecture review (first record)

All twelve documents read in full against baseline `52bd095d3`. The subject is sound
in structure: one question ("may this number say caused?") with six techniques that
each own a distinct failure, and the five applications' arithmetic re-computes
(holdout arms: 26,500 x (13.7 - 1.7) = 318,000; 0.6 factor -> about 173,000; flip at
5.6 / 13.7 = 0.41; zero-gain at 1.7 / 13.7 = 0.124; triangulate header 1,900 / 250 = 7.6
against live 2.0).

- **Trigger:** a surface, prompt or report is about to attach a causal verb to a
  channel's number, sum two platforms' conversion columns, judge a change by its
  after-window, or send pipeline conversions back to an ad platform.
- **Intended benefit:** causal claims only where an untreated comparison exists;
  attributed and modelled numbers carry their instrument and window.
- **Failure if ignored:** double-counted blended revenue, prospecting cut on a
  last-click target, before/after deltas narrated as effects, and an upload job that
  teaches bidding wrong values or re-sends rows.
- **Boundary:** economics of the spend, on-site experiment arithmetic, significance of
  a delta and root-cause diagnosis belong to the named neighbours.

Two factual defects found against primary sources. (1) The "sixty-three days after the
click" upload limit is the Google Ads limit for enhanced conversions for leads (rows
keyed on user-provided data); a click-identifier upload - the only kind the subject's
guards describe - has a 90-day limit. (2) The synthetic-control sentence in the golden
path and in the holdout technique's step 4 builds the counterfactual in the wrong
direction for the design the same paragraphs describe: GeoLift's methodology builds the
treated markets' counterfactual as a weighted combination of untreated markets fitted
on the pre-period, and the text predicts the held-out series from the treated ones,
which does not fit its own lift formula. The claim that the platform's default lookback
windows "were reset in the same period" as the model reduction could not be confirmed:
current help pages state defaults (30-day click, 3-day engaged view) without a reset
history; it stays as reverify. Single-stack debt from the forge note remains owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/attribution-and-incrementality",
  "date": "2026-10-31",
  "baseline": "52bd095d3",
  "digest": "sha256-b2:ec4c7c4c286f6f72",
  "disposition": "clarify",
  "coverage": "All 12 documents read in full (golden path, 6 techniques, 5 applications); application arithmetic re-computed; consumer-tree citations not re-opened, so application verified_on dates stand unchanged.",
  "counterexamples": [
    "A business whose platforms together claim fewer orders than it booked has no visible overlap, yet each column is still self-attributed; the bookings comparison is a diagnostic, not a correction.",
    "An enhanced-conversions-for-leads upload (keyed on hashed user data, not a click identifier) is cut off at 63 days, not 90; a pipeline using that path has the tighter window.",
    "A go-dark design removes the channel from the held-out regions, so the regions whose treatment changed are the held-out ones and their counterfactual is built from the regions still running; the direction of the synthetic control follows the design, not the labels.",
    "A single-city business cannot split geography; a time-based on/off is the only holdout and is a weaker control than place."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/6259715",
      "result": "Supports the model claim: 'The first click, linear, time decay, and position-based attribution models are no longer supported by Google'; data-driven is 'the default attribution model for most conversion actions'; last click remains."
    },
    {
      "url": "https://support.google.com/google-ads/answer/15081888",
      "result": "Refutes the 63-day figure for click uploads: 'Offline conversions that were uploaded more than 90 days after the associated last click won't be imported'; 63 days applies to 'Offline conversions for enhanced conversion leads'. Also: 'The same conversion won't be imported more than once.'"
    },
    {
      "url": "https://support.google.com/google-ads/answer/10029210",
      "result": "Corroborates: 'You can upload any conversion with GCLID so long as it's no longer than 90 days'; conversions with personally identifiable information for enhanced conversions are limited to 63 days."
    },
    {
      "url": "https://support.google.com/google-ads/answer/7014069",
      "result": "Supports the duplicate key: 'Google Ads uses the conversion action name, time of conversion, and the relevant unique identifier associated with a conversion.'"
    },
    {
      "url": "https://developers.google.com/meridian/geox/intro-to-geox",
      "result": "Supports the open-source geo-experiment tool: 'an open-source solution designed to establish a Google standard for geo-experimentation', holdback/go-dark/heavy-up designs, results calibrate Meridian. No minimum-volume guidance stated."
    },
    {
      "url": "https://www.techwyse.com/news/platform-updates/google-meridian-geox-global-launch-brand-signals-agentic-tools",
      "result": "Supports the 2026 date (secondary): GeoX named 5 May 2026, beta earlier in 2026, generally available 9-10 September 2026."
    },
    {
      "url": "https://facebookincubator.github.io/GeoLift/docs/Methodology/",
      "result": "Supports the synthetic-control direction correction: 'SCMs find the combination of untreated units that most closely replicate the treated', 'constructing the counterfactual as a weighted average of the units of observation'."
    },
    {
      "url": "https://support.google.com/google-ads/answer/3123169",
      "result": "States current defaults (30-day click window for Search/Display, 3-day engaged view) but no reset history; the 'reset in the same period' claim stays unconfirmed."
    }
  ],
  "documents": {
    "attribution-and-incrementality.md": {
      "disposition": "clarify",
      "reason": "The offline-upload limit is 90 days after the click for click-identifier uploads (63 is the enhanced-conversions-for-leads limit); the synthetic-control sentence must build the treated regions' counterfactual from the held-out regions. Reverify the 'default lookback windows were reset in the same period' clause."
    },
    "techniques/platform-conversions-are-self-attributed.md": {
      "disposition": "keep",
      "reason": "Model claim confirmed on the platform's help page; reading rule and decision rules are sound. The 'defaults were reset in the same period' clause is unconfirmed and carried as a reverify note, not a rewrite."
    },
    "techniques/last-click-under-credits-prospecting.md": {
      "disposition": "keep",
      "reason": "Under-credit is a property of the rule; the vendor retargeting figure is already labelled vendor research for direction only; unclassified-not-performance rule is sound."
    },
    "techniques/before-after-is-not-an-experiment.md": {
      "disposition": "keep",
      "reason": "Descriptive status, coverage floor, calibration-only consumer and regression-to-the-mean discount are correct; conventions are labelled."
    },
    "techniques/holdout-test-on-the-biggest-channel.md": {
      "disposition": "clarify",
      "reason": "Step 4's synthetic control predicts the held-out series from the treated regions, which inverts the standard construction (counterfactual of the treated from a weighted combination of untreated regions fitted on the pre-period) and does not fit its own lift formula."
    },
    "techniques/triangulate-attribution-incrementality-and-mix-model.md": {
      "disposition": "keep",
      "reason": "Division of labour, no-averaging rule and lift-test calibration match Meridian/GeoX guidance; two-year data need is labelled convention."
    },
    "techniques/offline-conversion-upload-guards.md": {
      "disposition": "clarify",
      "reason": "Two sentences state a sixty-three-day click window for click-identifier uploads; the platform's guidelines give 90 days for those and 63 for enhanced conversions for leads. Duplicate key confirmed."
    },
    "applications/node--before-after-is-not-an-experiment.md": {
      "disposition": "keep",
      "reason": "Deviation record is internally consistent with the technique; citations not re-opened, verified_on unchanged."
    },
    "applications/node--holdout-test-on-the-biggest-channel.md": {
      "disposition": "keep",
      "reason": "Arm arithmetic re-computes exactly; unmeasurable verdict is honest about the hypothetical factor."
    },
    "applications/node--last-click-under-credits-prospecting.md": {
      "disposition": "keep",
      "reason": "Records the role-table-nothing-reads deviation with the standard kept; consistent with the technique."
    },
    "applications/node--offline-conversion-upload-guards.md": {
      "disposition": "clarify",
      "reason": "'The sixty-three-day click window is not checked before send' inherits the wrong figure; the click-identifier window is 90 days."
    },
    "applications/node--triangulate-attribution-incrementality-and-mix-model.md": {
      "disposition": "keep",
      "reason": "Header arithmetic re-computes (1,900 / 250 = 7.6 vs 2.0); the extension rule it motivated is in the technique."
    }
  }
}
```


Second record, same day: the clarify items above were applied (ninety-day click-identifier
upload limit in the golden path, the upload-guards technique and its application; the
synthetic-control direction in the golden path and the holdout technique). The golden
path carries `reverify` for the unconfirmed default-window reset clause, and so does the
subject overall until that clause is confirmed or cut.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/attribution-and-incrementality",
  "date": "2026-10-31",
  "baseline": "52bd095d3",
  "digest": "sha256-b2:e31ea384b2ff73a9",
  "disposition": "reverify",
  "coverage": "All 12 documents read in full (golden path, 6 techniques, 5 applications); application arithmetic re-computed; consumer-tree citations not re-opened, so application verified_on dates stand unchanged. Second record after applying the clarify items; the one open item is the unconfirmed default-window reset clause (golden path and self-attributed technique).",
  "counterexamples": [
    "A business whose platforms together claim fewer orders than it booked has no visible overlap, yet each column is still self-attributed; the bookings comparison is a diagnostic, not a correction.",
    "An enhanced-conversions-for-leads upload (keyed on hashed user data, not a click identifier) is cut off at 63 days, not 90; a pipeline using that path has the tighter window.",
    "A go-dark design removes the channel from the held-out regions, so the regions whose treatment changed are the held-out ones and their counterfactual is built from the regions still running; the direction of the synthetic control follows the design, not the labels.",
    "A single-city business cannot split geography; a time-based on/off is the only holdout and is a weaker control than place."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/6259715",
      "result": "Supports the model claim: 'The first click, linear, time decay, and position-based attribution models are no longer supported by Google'; data-driven is 'the default attribution model for most conversion actions'; last click remains."
    },
    {
      "url": "https://support.google.com/google-ads/answer/15081888",
      "result": "Refutes the 63-day figure for click uploads: 'Offline conversions that were uploaded more than 90 days after the associated last click won't be imported'; 63 days applies to 'Offline conversions for enhanced conversion leads'. Also: 'The same conversion won't be imported more than once.'"
    },
    {
      "url": "https://support.google.com/google-ads/answer/10029210",
      "result": "Corroborates: 'You can upload any conversion with GCLID so long as it's no longer than 90 days'; conversions with personally identifiable information for enhanced conversions are limited to 63 days."
    },
    {
      "url": "https://support.google.com/google-ads/answer/7014069",
      "result": "Supports the duplicate key: 'Google Ads uses the conversion action name, time of conversion, and the relevant unique identifier associated with a conversion.'"
    },
    {
      "url": "https://developers.google.com/meridian/geox/intro-to-geox",
      "result": "Supports the open-source geo-experiment tool: 'an open-source solution designed to establish a Google standard for geo-experimentation', holdback/go-dark/heavy-up designs, results calibrate Meridian. No minimum-volume guidance stated."
    },
    {
      "url": "https://www.techwyse.com/news/platform-updates/google-meridian-geox-global-launch-brand-signals-agentic-tools",
      "result": "Supports the 2026 date (secondary): GeoX named 5 May 2026, beta earlier in 2026, generally available 9-10 September 2026."
    },
    {
      "url": "https://facebookincubator.github.io/GeoLift/docs/Methodology/",
      "result": "Supports the synthetic-control direction correction: 'SCMs find the combination of untreated units that most closely replicate the treated', 'constructing the counterfactual as a weighted average of the units of observation'."
    },
    {
      "url": "https://support.google.com/google-ads/answer/3123169",
      "result": "States current defaults (30-day click window for Search/Display, 3-day engaged view) but no reset history; the 'reset in the same period' claim stays unconfirmed."
    }
  ],
  "documents": {
    "attribution-and-incrementality.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: upload limit now ninety days after the click (sixty-three for hashed-customer-data uploads); synthetic control now builds the treated regions' counterfactual from a weighted blend of held-out regions. Still owed: the clause that default lookback windows 'were reset in the same period' is unconfirmed on current help pages."
    },
    "techniques/platform-conversions-are-self-attributed.md": {
      "disposition": "keep",
      "reason": "Model claim confirmed on the platform's help page; reading rule and decision rules are sound. The 'defaults were reset in the same period' clause is unconfirmed and carried as a reverify note, not a rewrite. Reverify still owed on that clause."
    },
    "techniques/last-click-under-credits-prospecting.md": {
      "disposition": "keep",
      "reason": "Under-credit is a property of the rule; the vendor retargeting figure is already labelled vendor research for direction only; unclassified-not-performance rule is sound."
    },
    "techniques/before-after-is-not-an-experiment.md": {
      "disposition": "keep",
      "reason": "Descriptive status, coverage floor, calibration-only consumer and regression-to-the-mean discount are correct; conventions are labelled."
    },
    "techniques/holdout-test-on-the-biggest-channel.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 4's synthetic control is now a weighted combination of the held-out regions fitted to track the treated regions in the pre-period (GeoLift methodology), consistent with its lift formula."
    },
    "techniques/triangulate-attribution-incrementality-and-mix-model.md": {
      "disposition": "keep",
      "reason": "Division of labour, no-averaging rule and lift-test calibration match Meridian/GeoX guidance; two-year data need is labelled convention."
    },
    "techniques/offline-conversion-upload-guards.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: both sixty-three-day statements corrected to the ninety-day click-identifier limit, with sixty-three named for hashed-customer-data uploads (Google Ads guidelines 15081888, FAQ 10029210)."
    },
    "applications/node--before-after-is-not-an-experiment.md": {
      "disposition": "keep",
      "reason": "Deviation record is internally consistent with the technique; citations not re-opened, verified_on unchanged."
    },
    "applications/node--holdout-test-on-the-biggest-channel.md": {
      "disposition": "keep",
      "reason": "Arm arithmetic re-computes exactly; unmeasurable verdict is honest about the hypothetical factor."
    },
    "applications/node--last-click-under-credits-prospecting.md": {
      "disposition": "keep",
      "reason": "Records the role-table-nothing-reads deviation with the standard kept; consistent with the technique."
    },
    "applications/node--offline-conversion-upload-guards.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'sixty-three-day click window' -> 'ninety-day click window'; consumer citations not re-opened, verified_on unchanged."
    },
    "applications/node--triangulate-attribution-incrementality-and-mix-model.md": {
      "disposition": "keep",
      "reason": "Header arithmetic re-computes (1,900 / 250 = 7.6 vs 2.0); the extension rule it motivated is in the technique."
    }
  }
}
```
