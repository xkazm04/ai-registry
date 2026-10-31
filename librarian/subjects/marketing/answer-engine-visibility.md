---
subject: answer-engine-visibility
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# answer-engine-visibility

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `search-and-content`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** reweighting a keyword map after AI answers appeared on the results page, deciding whether an informational page is still worth building, structuring a page so an answer engine can lift it, judging a vendor claim about what earns an AI citation, setting up a citation scoreboard for a business

**Techniques (6):** answer-block-under-question-heading, ask-the-models-baseline, informational-as-linking-fuel-not-traffic, self-contained-passages-with-original-data, third-party-mentions-over-on-page-tricks, weight-the-map-toward-transactional-and-local.

**Applications (2; stacks: prompt-pipeline):** prompt-pipeline--third-party-mentions-over-on-page-tricks, prompt-pipeline--weight-the-map-toward-transactional-and-local.

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

First architecture review, against `c99b6d9db`. **Trigger:** pending since the
2026-09-09 forge. **Intended benefit:** a keyword map, brief or audit that orders work by
observed answer-box presence and by evidence class, so a vendor magnitude never becomes a
constant. **Failure if ignored:** uniform forecast discounts, markup and manifest files
sold as citation levers, and percentages computed over a fifteen-row log. **Boundary:**
Google's answer box and the main conversational engines as of early 2026; paid search,
markets with no AI answers, and causal claims about mentions are outside it.

The direction of every claim held against the primary sources. Five documents carry
scope or arithmetic slips: a rebound attributed to a layout change the source disclaims,
a one-surface correlation read as all AI visibility, a markup null whose sample was
already-cited pages, a second controlled test the self-contained technique forgets, and a
per-engine count stated as a monthly total.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/answer-engine-visibility",
  "date": "2026-10-31",
  "baseline": "c99b6d9db",
  "digest": "sha256-b2:89fa7ab511e67376",
  "disposition": "clarify",
  "coverage": "All 13 documents decided. Primary sources opened this run for the GEO paper, the Seer 2026 CTR update, the Ahrefs markup test and the Ahrefs 75,000-brand correlation; the Seer 2025 study and the SE Ranking llms.txt study were read through secondary summaries only; the 137,000-site and 900-site manifest-file figures and the trigger-rate split were not checked. No private tree was reopened and no verification date was refreshed.",
  "counterexamples": [
    "A local plumber's money query can show an AI answer in one market and not another, so the tier is observed per market and dated rather than read off the intent label.",
    "A brand mentioned often because it is already the market leader would correlate with AI Overview visibility without mentions causing citations; buying mentions need not buy citations.",
    "Markup that did not move citations for pages already cited 100+ times may still matter for a page not yet cited at all; the controlled test does not cover that population.",
    "A business cited on one engine and absent from another has no single AI visibility figure; the engines overlap little."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2311.09735",
      "result": "Abstract: 'GEO can boost visibility by up to 40% in generative engine responses' and 'the efficacy of these strategies varies across domains'. Full text: 'we evaluate them on Perplexity.ai, a real deployed Generative Engine', where 'Quotation Addition performs best in Position-Adjusted Word Count with a 22% improvement' and Subjective Impression gains reach about 37%; keyword stuffing 'performs 10% worse than the baseline' on word count, slightly above on Subjective Impression. Supports the +40% and the 'did nothing or hurt' reading; refutes 'one engine'."
    },
    {
      "url": "https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-2026-update",
      "result": "'Organic CTR on AIO-present queries climbed from a floor of 1.3% in December 2025 to 2.4% in February 2026' (table 1.31% / 2.36%). Sample 53 brands, 5,471,127 queries, 2.43B organic impressions, January 2025 to February 2026, a different sample from the 3,119-term September 2025 study. The authors say they cannot claim causation; they name no specific layout change. 'Being cited in the AIO delivers +120% more organic clicks per impression versus when you are not cited.' Refutes 'within two months of a layout change' and 'moved with every layout change' as causal claims; supports 'roughly double the clicks per impression'."
    },
    {
      "source": "Secondary coverage of the Seer Interactive September 2025 study (web search)",
      "result": "3,119 informational queries across 42 organisations, 25.1M organic impressions, June 2024 to September 2025: organic CTR on AI-Overview queries fell from 1.76% to 0.61%. Consistent with the documents' figures; the primary page was not opened."
    },
    {
      "url": "https://ahrefs.com/blog/schema-ai-citations/",
      "result": "'We tracked 1,885 web pages that added JSON-LD schema' against 4,000 matched controls, August 2025 to March 2026; AI Overviews -4.6%, 'small but statistically significant decline'; AI Mode +2.4% and ChatGPT +2.2%, 'statistically indistinguishable from zero'; 'Every page in the dataset had 100+ AI Overview citations in February 2025, before any schema was added.' Its own correlational analysis of about 6 million URLs: cited pages 'almost three times more likely to have JSON-LD'. No 2.3x figure appears. Supports the null; adds the already-cited-pages boundary; does not confirm that the 2.3x number came from this vendor."
    },
    {
      "url": "https://ahrefs.com/blog/ai-overview-brand-correlation/",
      "result": "'Brand web mentions show the strongest correlation (0.664) with AI Overview brand visibility'; backlinks 0.218; Spearman over 75,000 brands (DR above 40), about 26% of brands with zero AI Overview mentions. The surface measured is Google AI Overviews, not AI visibility in general."
    },
    {
      "source": "SE Ranking llms.txt study (web search summary of seranking.com/blog/llms-txt)",
      "result": "300,000 domains, about 10% with the file; no correlation with AI citations; machine-learning accuracy improved when the feature was removed. Consistent with the documents. The 137,000-site and 900-site figures were not checked this run."
    },
    {
      "source": "Arithmetic in techniques/ask-the-models-baseline.md",
      "result": "Five questions x three engines x three runs = 45 observations a month; the 'fifteen observations' and '4 of 15' figures are per engine. The document's own procedure contradicts an unqualified 'fifteen a month'."
    }
  ],
  "documents": {
    "answer-engine-visibility.md": {
      "disposition": "clarify",
      "reason": "(1) 'the same vendor's 2026 update showed the figure rebounding to around 2.4% within two months of a layout change' conflates samples and asserts a cause the source disclaims: the update is a different 53-brand sample, measured 1.3% (December 2025) to 2.4% (February 2026), and 'cannot claim causation'. (2) The 0.66/0.22 mention correlation is with AI Overview visibility, one surface, not AI visibility generally. (3) The markup null holds for pages already carrying 100+ AI Overview citations; the test does not speak to uncited pages, and the decline on one engine was statistically significant."
    },
    "techniques/ask-the-models-baseline.md": {
      "disposition": "clarify",
      "reason": "'three tries on five questions is fifteen observations' and 'Fifteen observations a month' are per engine; the procedure's three engines make 45 a month. State 'per engine'."
    },
    "techniques/self-contained-passages-with-original-data.md": {
      "disposition": "clarify",
      "reason": "'The only controlled experiment in the field' contradicts the golden path, which names two controlled tests (the 2023 paper and the 2026 markup test). 'from one 2023 experiment on one engine' is wrong: the paper also re-ran on a deployed engine (Perplexity) with smaller best gains, 22% to 37%."
    },
    "techniques/third-party-mentions-over-on-page-tricks.md": {
      "disposition": "clarify",
      "reason": "(1) The 0.66/0.22 correlation is with AI Overview brand visibility. (2) The markup test covered pages already cited 100+ times; the AI Overviews decline was statistically significant. (3) 'the same vendor published both numbers' is not confirmed: that vendor's own correlation is 'almost three times' over about 6 million URLs. Still owed after this run: the convention section's '8 of 9 sites saw no change' has no counterpart in the body, which cites a 900-site log study; which figure is right was not established."
    },
    "techniques/weight-the-map-toward-transactional-and-local.md": {
      "disposition": "clarify",
      "reason": "'has since moved with every layout change' asserts a cause the 2026 source disclaims; 'moved by a factor of two within months' overstates 1.31% to 2.36% (about 1.8x in two months)."
    },
    "techniques/informational-as-linking-fuel-not-traffic.md": {
      "disposition": "keep",
      "reason": "Every magnitude is labelled vendor correlation; the fan-out sub-query count is labelled one vendor's observation; the blank-not-zero forecast rule is sound. The 'cited outclicks uncited' claim matches Seer's +120% clicks per impression."
    },
    "applications/prompt-pipeline--answer-block-under-question-heading.md": {
      "disposition": "reverify",
      "reason": "Internally consistent paired table with stated limits (n=12, constructed briefs, non-production model). The private tree and harness were not re-run."
    },
    "applications/prompt-pipeline--informational-as-linking-fuel-not-traffic.md": {
      "disposition": "reverify",
      "reason": "Honest null on the linking half and an untested refusal path are stated. The private tree was not re-run."
    },
    "applications/prompt-pipeline--self-contained-passages-with-original-data.md": {
      "disposition": "reverify",
      "reason": "A not-better verdict correctly not shipped; the table-vocabulary gap is a scoped finding. The private tree was not re-run."
    },
    "applications/prompt-pipeline--third-party-mentions-over-on-page-tricks.md": {
      "disposition": "reverify",
      "reason": "The pipeline commit was not reopened. Its reading that the same vendor holds both the 2.3x and the controlled number is not confirmed: the controlled test's vendor reports 'almost three times' over about 6 million URLs, not 2.3x. The listing-Q&A date (3 November 2025) matches secondary reports of the API shutdown; the visible removal date varies in coverage."
    },
    "applications/prompt-pipeline--weight-the-map-toward-transactional-and-local.md": {
      "disposition": "reverify",
      "reason": "Its 1.3% to 2.4% December-to-February figure matches the Seer 2026 update. The pipeline commit was not reopened, and the 36% / 8% / 5% trigger-rate figures were not checked against a primary source."
    },
    "techniques/answer-block-under-question-heading.md": {
      "disposition": "keep",
      "reason": "Convention labels are honest (40-60 words, 18-word sentence, first-third fraction all marked); the procedure and the no-invented-number rule hold. 'Strongest arm in the controlled experiment' matches the paper, where quotation and statistics addition led."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the confirmed clarify items from the record above against `c99b6d9db`.
The Seer, Ahrefs and GEO-paper wording quoted there is the basis for every edit. The
'8 of 9' manifest-file figure is still owed. Applications were not touched and keep
`reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/answer-engine-visibility",
  "date": "2026-10-31",
  "baseline": "c99b6d9db",
  "digest": "sha256-b2:b765b011c661d2d6",
  "disposition": "reverify",
  "coverage": "All 13 documents decided. The clarify items from the first 2026-10-31 record were applied where a primary source opened this run supported them, and the edited sections re-read. One third-party-mentions item stays owed (unconfirmed manifest-file figure). Applications were not touched and keep reverify, which is now the overall disposition. No verification date was refreshed.",
  "counterexamples": [
    "A local plumber's money query can show an AI answer in one market and not another, so the tier is observed per market and dated rather than read off the intent label.",
    "A brand mentioned often because it is already the market leader would correlate with AI Overview visibility without mentions causing citations; buying mentions need not buy citations.",
    "Markup that did not move citations for pages already cited 100+ times may still matter for a page not yet cited at all; the controlled test does not cover that population.",
    "A business cited on one engine and absent from another has no single AI visibility figure; the engines overlap little."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2311.09735",
      "result": "Abstract: 'GEO can boost visibility by up to 40% in generative engine responses' and 'the efficacy of these strategies varies across domains'. Full text: 'we evaluate them on Perplexity.ai, a real deployed Generative Engine', where 'Quotation Addition performs best in Position-Adjusted Word Count with a 22% improvement' and Subjective Impression gains reach about 37%; keyword stuffing 'performs 10% worse than the baseline' on word count, slightly above on Subjective Impression. Supports the +40% and the 'did nothing or hurt' reading; refutes 'one engine'."
    },
    {
      "url": "https://www.seerinteractive.com/insights/aio-impact-on-google-ctr-2026-update",
      "result": "'Organic CTR on AIO-present queries climbed from a floor of 1.3% in December 2025 to 2.4% in February 2026' (table 1.31% / 2.36%). Sample 53 brands, 5,471,127 queries, 2.43B organic impressions, January 2025 to February 2026, a different sample from the 3,119-term September 2025 study. The authors say they cannot claim causation; they name no specific layout change. 'Being cited in the AIO delivers +120% more organic clicks per impression versus when you are not cited.' Refutes 'within two months of a layout change' and 'moved with every layout change' as causal claims; supports 'roughly double the clicks per impression'."
    },
    {
      "source": "Secondary coverage of the Seer Interactive September 2025 study (web search)",
      "result": "3,119 informational queries across 42 organisations, 25.1M organic impressions, June 2024 to September 2025: organic CTR on AI-Overview queries fell from 1.76% to 0.61%. Consistent with the documents' figures; the primary page was not opened."
    },
    {
      "url": "https://ahrefs.com/blog/schema-ai-citations/",
      "result": "'We tracked 1,885 web pages that added JSON-LD schema' against 4,000 matched controls, August 2025 to March 2026; AI Overviews -4.6%, 'small but statistically significant decline'; AI Mode +2.4% and ChatGPT +2.2%, 'statistically indistinguishable from zero'; 'Every page in the dataset had 100+ AI Overview citations in February 2025, before any schema was added.' Its own correlational analysis of about 6 million URLs: cited pages 'almost three times more likely to have JSON-LD'. No 2.3x figure appears. Supports the null; adds the already-cited-pages boundary; does not confirm that the 2.3x number came from this vendor."
    },
    {
      "url": "https://ahrefs.com/blog/ai-overview-brand-correlation/",
      "result": "'Brand web mentions show the strongest correlation (0.664) with AI Overview brand visibility'; backlinks 0.218; Spearman over 75,000 brands (DR above 40), about 26% of brands with zero AI Overview mentions. The surface measured is Google AI Overviews, not AI visibility in general."
    },
    {
      "source": "SE Ranking llms.txt study (web search summary of seranking.com/blog/llms-txt)",
      "result": "300,000 domains, about 10% with the file; no correlation with AI citations; machine-learning accuracy improved when the feature was removed. Consistent with the documents. The 137,000-site and 900-site figures were not checked this run."
    },
    {
      "source": "Arithmetic in techniques/ask-the-models-baseline.md",
      "result": "Five questions x three engines x three runs = 45 observations a month; the 'fifteen observations' and '4 of 15' figures are per engine. The document's own procedure contradicts an unqualified 'fifteen a month'."
    }
  ],
  "documents": {
    "answer-engine-visibility.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the 2026 rebound now reads as a larger 2026 update on a different sample, 1.3% (December 2025) to 2.4% (February 2026), without claiming a cause; the mention correlation is scoped to AI Overview visibility; the markup test's sample is stated as pages already cited in AI answers, with the one decline marked statistically significant."
    },
    "techniques/ask-the-models-baseline.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: both 'fifteen observations' statements now say per engine, and the monthly total across three engines (45) is stated."
    },
    "techniques/self-contained-passages-with-original-data.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'The only controlled experiment in the field' became 'The founding controlled experiment of the field'; 'on one engine' became the authors' own engine, with smaller best gains (22% to 37%) when re-run on a deployed engine."
    },
    "techniques/third-party-mentions-over-on-page-tricks.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: the 0.66/0.22 correlation is scoped to AI Overview brand visibility; the markup test is scoped to already-cited pages with a statistically significant AI Overviews decline; 'the same vendor published both numbers' became that vendor's own 'almost three times' correlation over about six million URLs. Still owed: the convention section's '8 of 9 sites saw no change' has no counterpart in the body (a 900-site log study); not confirmed which figure is right."
    },
    "techniques/weight-the-map-toward-transactional-and-local.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'has since moved with every layout change' became 'has since moved in both directions'; 'by a factor of two' became 'by nearly a factor of two'."
    },
    "techniques/informational-as-linking-fuel-not-traffic.md": {
      "disposition": "keep",
      "reason": "Every magnitude is labelled vendor correlation; the fan-out sub-query count is labelled one vendor's observation; the blank-not-zero forecast rule is sound. The 'cited outclicks uncited' claim matches Seer's +120% clicks per impression."
    },
    "applications/prompt-pipeline--answer-block-under-question-heading.md": {
      "disposition": "reverify",
      "reason": "Internally consistent paired table with stated limits (n=12, constructed briefs, non-production model). The private tree and harness were not re-run."
    },
    "applications/prompt-pipeline--informational-as-linking-fuel-not-traffic.md": {
      "disposition": "reverify",
      "reason": "Honest null on the linking half and an untested refusal path are stated. The private tree was not re-run."
    },
    "applications/prompt-pipeline--self-contained-passages-with-original-data.md": {
      "disposition": "reverify",
      "reason": "A not-better verdict correctly not shipped; the table-vocabulary gap is a scoped finding. The private tree was not re-run."
    },
    "applications/prompt-pipeline--third-party-mentions-over-on-page-tricks.md": {
      "disposition": "reverify",
      "reason": "The pipeline commit was not reopened. Its reading that the same vendor holds both the 2.3x and the controlled number is not confirmed: the controlled test's vendor reports 'almost three times' over about 6 million URLs, not 2.3x. The listing-Q&A date (3 November 2025) matches secondary reports of the API shutdown; the visible removal date varies in coverage."
    },
    "applications/prompt-pipeline--weight-the-map-toward-transactional-and-local.md": {
      "disposition": "reverify",
      "reason": "Its 1.3% to 2.4% December-to-February figure matches the Seer 2026 update. The pipeline commit was not reopened, and the 36% / 8% / 5% trigger-rate figures were not checked against a primary source."
    },
    "techniques/answer-block-under-question-heading.md": {
      "disposition": "keep",
      "reason": "Convention labels are honest (40-60 words, 18-word sentence, first-third fraction all marked); the procedure and the no-invented-number rule hold. 'Strongest arm in the controlled experiment' matches the paper, where quotation and statistics addition led."
    }
  }
}
```
