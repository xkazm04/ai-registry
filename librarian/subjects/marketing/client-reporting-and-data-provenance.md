---
subject: client-reporting-and-data-provenance
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# client-reporting-and-data-provenance

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `measurement-and-economics`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** assembling a periodic client-facing marketing report, choosing which tiles a report shows for a given business, grounding a model that will narrate a month of marketing results, deciding whether a report may say "live" or must say "illustrative", rendering a lower-is-better metric or a multi-currency account to a client

**Techniques (6):** live-means-synced-rows, lower-is-better-inverts-verdict-not-number, never-sum-across-currencies, plain-language-gloss-and-white-label, stale-caveat-travels-into-the-narrative, tile-presets-by-business-type.

**Applications (3; stacks: node, react):** node--live-means-synced-rows, node--never-sum-across-currencies, react--plain-language-gloss-and-white-label.

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

## Architecture review - 2026-10-31

First architecture review, against `ecb203909`. All eleven documents read in full.
Four internal inconsistencies were found in the technique layer and the golden path,
and one platform claim was checked against the dominant ad platform's help pages.
The four applications cite a private tree that was not reopened; their dates stay.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/client-reporting-and-data-provenance",
  "date": "2026-10-31",
  "baseline": "ecb203909",
  "digest": "sha256-b2:fe885254bb5f67e0",
  "disposition": "clarify",
  "coverage": "All 11 documents (golden path, 6 techniques, 4 applications) read in full; cross-subject references and law anchors resolve. Trigger: pending, never reviewed. Intended benefit: a client report whose every number states whose it is, how old it is and what may be said about it. Failure if ignored: a live badge, a green arrow or a converted total the client cannot reconcile with any invoice. Boundary: assembly and provenance of the client-facing report; delta significance, economics, forecasting, diagnosis, attribution and public-surface proof stay with their own subjects. Three primary help pages read; no private tree reopened, nothing executed, no verification date refreshed.",
  "counterexamples": [
    "A dominant-platform account billed in euros reports a shop's crown conversion value already converted to euros at the platform's average daily rate, so the ratio is single-currency yet carries an unlabelled conversion; a value sent with no currency code is not converted at all and is read as euros.",
    "A month with spend and zero conversions has an undefined cost per lead; a divide guarded to return 0 renders it as a -100 % green improvement even though the prior value was non-zero.",
    "A source whose last sync ran after the period ended can still deliver rows that stop three days before the period end, so sync time is not row coverage.",
    "A private shared report page that is fully live still must not be indexed; index-when-live applies only to public surfaces."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/13064032?hl=en",
      "result": "'Conversion values will always be reported to you in your Google Ads billing currency'; 'we use the average daily foreign exchange rate to convert the amount into your account currency'; with no currency assigned 'we won't do any foreign exchange conversion, regardless of the account currency'. Refines never-sum-across-currencies' last decision rule: the mixed-currency ratio arises from an untagged value, and a tagged one arrives platform-converted."
    },
    {
      "url": "https://support.google.com/google-ads/answer/9842104?hl=en",
      "result": "'Your currency is permanently set when you set up your account. This setting cannot be updated because it is used to determine how you are billed.' Supports the euro account 'opened by a previous agency' persisting beside a crown account."
    },
    {
      "url": "https://developers.google.com/search/docs/crawling-indexing/block-indexing",
      "result": "noindex is a meta tag or response header; 'For the noindex rule to be effective, the page or resource must not be blocked by a robots.txt file.' Supports the no-index directive as the mechanism; does not decide which pages carry it."
    },
    {
      "source": "Internal cross-reading of the subject",
      "result": "Golden path announces three narrative disciplines and lists four. live-means-synced-rows says the shared report page is no-index until live; plain-language-gloss-and-white-label and the react application say it is never indexed. lower-is-better's 'prior value is zero' rule contradicts its own application, whose predicate is a zero denominator in a period with spend. tile-presets' live-branch-only rule contradicts its own 'when not to use'."
    }
  ],
  "documents": {
    "client-reporting-and-data-provenance.md": {
      "disposition": "clarify",
      "reason": "'Three disciplines hold it honest' introduces four bullets (trend word, truncated window, year-over-year, advice); say four."
    },
    "techniques/live-means-synced-rows.md": {
      "disposition": "clarify",
      "reason": "Procedure step 4's indexing bullet says the shared report page is no-index until live, contradicting plain-language-gloss-and-white-label (private page never indexed) and the golden path (public surface); scope it to public surfaces built from the same rows. The decision rule for 'synced, not for this period' keys on sync age against period end, while the technique's definition and the stale technique key on row coverage; restate on coverage."
    },
    "techniques/lower-is-better-inverts-verdict-not-number.md": {
      "disposition": "clarify",
      "reason": "The 'spent, no return' rule is triggered by 'the prior value is zero'; the state it names is a zero denominator (no conversions or no revenue) in a period with spend, which is what its own application implemented. Restate the trigger."
    },
    "techniques/never-sum-across-currencies.md": {
      "disposition": "clarify",
      "reason": "The last decision rule treats a conversion value in the shop's currency on a euro-billed account as arriving unconverted. The dominant platform converts a tagged value to billing currency at an average daily rate and leaves an untagged value unconverted; name both cases, the second as the mixed ratio and the first as a platform conversion the report labels."
    },
    "techniques/plain-language-gloss-and-white-label.md": {
      "disposition": "keep",
      "reason": "Gloss arithmetic checks (1/4.2 = 23.8 %, about 24 %; 3.1 % = 31 per 1,000). The per-field identity order, the never-the-vendor rule and the always-no-index private page are coherent and match the application."
    },
    "techniques/stale-caveat-travels-into-the-narrative.md": {
      "disposition": "keep",
      "reason": "Both thresholds are labelled convention with a stated reason for 20 hours; never-synced and future-timestamp edge cases are decided; caveat-in-prose and the empty fresh branch agree with the application."
    },
    "techniques/tile-presets-by-business-type.md": {
      "disposition": "clarify",
      "reason": "A decision rule appends a synced-only pair on the live branch, and 'when not to use' says a preset encoding 'show this tile only when live' gets it wrong. Scope the latter to using liveness as a trust judgement, distinct from a tile the illustrative dataset has no row for."
    },
    "applications/node--live-means-synced-rows.md": {
      "disposition": "reverify",
      "reason": "Line anchors and quotes at the cited commit were not reopened; the three recorded shortfalls (no sync date in the caveat, no not-for-this-period state, no page-level minimum) are clear and consistent with the technique."
    },
    "applications/node--lower-is-better-inverts-verdict-not-number.md": {
      "disposition": "reverify",
      "reason": "The A/B 'better' and the shipped predicate rest on a private tree not re-run; the recorded spend-as-down-is-good deviation stays open."
    },
    "applications/node--never-sum-across-currencies.md": {
      "disposition": "reverify",
      "reason": "Blend refusal, upper-cased codes and the pair rule are cited at a private commit not reopened; shortfalls (no per-currency rows, silent base-currency default) are recorded."
    },
    "applications/react--plain-language-gloss-and-white-label.md": {
      "disposition": "reverify",
      "reason": "Brand fallback chain, unconditional no-index and tile-skip are cited at a private commit not reopened; the gloss-as-label and microsite fallback deviations are recorded."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the five clarify items the earlier 2026-10-31 record named. The applications
were not touched and keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/client-reporting-and-data-provenance",
  "date": "2026-10-31",
  "baseline": "86c3b7112",
  "digest": "sha256-b2:8399363e8806aaba",
  "disposition": "reverify",
  "coverage": "All 11 documents decided. The five clarify items of the earlier 2026-10-31 record were applied and the edited passages re-read; the platform currency behaviour was confirmed this run from the help page quoted below, and the other four were verified internal inconsistencies. Other documents are byte-unchanged and keep their dispositions. No private tree reopened, nothing executed, no verification date refreshed.",
  "counterexamples": [
    "A dominant-platform account billed in euros reports a shop's crown conversion value already converted to euros at the platform's average daily rate, so the ratio is single-currency yet carries an unlabelled conversion; a value sent with no currency code is not converted at all and is read as euros.",
    "A month with spend and zero conversions has an undefined cost per lead; a divide guarded to return 0 renders it as a -100 % green improvement even though the prior value was non-zero.",
    "A source whose last sync ran after the period ended can still deliver rows that stop three days before the period end, so sync time is not row coverage.",
    "A private shared report page that is fully live still must not be indexed; index-when-live applies only to public surfaces."
  ],
  "sources": [
    {
      "url": "https://support.google.com/google-ads/answer/13064032?hl=en",
      "result": "'Conversion values will always be reported to you in your Google Ads billing currency'; 'we use the average daily foreign exchange rate to convert the amount into your account currency'; with no currency assigned 'we won't do any foreign exchange conversion, regardless of the account currency'. Refines never-sum-across-currencies' last decision rule: the mixed-currency ratio arises from an untagged value, and a tagged one arrives platform-converted."
    },
    {
      "url": "https://support.google.com/google-ads/answer/9842104?hl=en",
      "result": "'Your currency is permanently set when you set up your account. This setting cannot be updated because it is used to determine how you are billed.' Supports the euro account 'opened by a previous agency' persisting beside a crown account."
    },
    {
      "url": "https://developers.google.com/search/docs/crawling-indexing/block-indexing",
      "result": "noindex is a meta tag or response header; 'For the noindex rule to be effective, the page or resource must not be blocked by a robots.txt file.' Supports the no-index directive as the mechanism; does not decide which pages carry it."
    },
    {
      "source": "Internal cross-reading of the subject",
      "result": "Golden path announces three narrative disciplines and lists four. live-means-synced-rows says the shared report page is no-index until live; plain-language-gloss-and-white-label and the react application say it is never indexed. lower-is-better's 'prior value is zero' rule contradicts its own application, whose predicate is a zero denominator in a period with spend. tile-presets' live-branch-only rule contradicts its own 'when not to use'."
    }
  ],
  "documents": {
    "client-reporting-and-data-provenance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Three disciplines' -> 'Four disciplines', matching the four bullets."
    },
    "techniques/live-means-synced-rows.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the indexing gate now names public surfaces built from the same rows and states the private shared page is never indexed; the 'synced, not for this period' rule now keys on row coverage, not sync timestamp."
    },
    "techniques/lower-is-better-inverts-verdict-not-number.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the 'spent, no return' trigger is now a zero denominator in a period with spend (undefined, not zero), replacing 'the prior value is zero'."
    },
    "techniques/never-sum-across-currencies.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the last decision rule now distinguishes a tagged conversion value (platform-converted to billing currency at an average daily rate; labelled) from an untagged one (not converted, read as billing currency; refused, fix by sending the code)."
    },
    "techniques/plain-language-gloss-and-white-label.md": {
      "disposition": "keep",
      "reason": "Gloss arithmetic checks (1/4.2 = 23.8 %, about 24 %; 3.1 % = 31 per 1,000). The per-field identity order, the never-the-vendor rule and the always-no-index private page are coherent and match the application."
    },
    "techniques/stale-caveat-travels-into-the-narrative.md": {
      "disposition": "keep",
      "reason": "Both thresholds are labelled convention with a stated reason for 20 hours; never-synced and future-timestamp edge cases are decided; caveat-in-prose and the empty fresh branch agree with the application."
    },
    "techniques/tile-presets-by-business-type.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'when not to use' now scopes the live-only prohibition to trust judgements and names the live-branch rule as the not-measured rule, removing the contradiction."
    },
    "applications/node--live-means-synced-rows.md": {
      "disposition": "reverify",
      "reason": "Line anchors and quotes at the cited commit were not reopened; the three recorded shortfalls (no sync date in the caveat, no not-for-this-period state, no page-level minimum) are clear and consistent with the technique."
    },
    "applications/node--lower-is-better-inverts-verdict-not-number.md": {
      "disposition": "reverify",
      "reason": "The A/B 'better' and the shipped predicate rest on a private tree not re-run; the recorded spend-as-down-is-good deviation stays open."
    },
    "applications/node--never-sum-across-currencies.md": {
      "disposition": "reverify",
      "reason": "Blend refusal, upper-cased codes and the pair rule are cited at a private commit not reopened; shortfalls (no per-currency rows, silent base-currency default) are recorded."
    },
    "applications/react--plain-language-gloss-and-white-label.md": {
      "disposition": "reverify",
      "reason": "Brand fallback chain, unconditional no-index and tile-skip are cited at a private commit not reopened; the gloss-as-label and microsite fallback deviations are recorded."
    }
  }
}
```
