---
subject: local-visibility-and-reputation
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# local-visibility-and-reputation

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `local-and-zero-budget`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** deciding which service-by-area gap a local business closes first, reading map-pack rank data from one or more engines, drafting or gating a public review reply, ranking the locations of a multi-location business by urgency

**Techniques (6):** attention-score-for-many-locations, pack-visibility-per-engine-never-averaged, review-recency-beats-count, review-reply-by-rating-band, service-area-coverage-gaps-by-volume, sustained-decline-three-runs-three-positions.

**Applications (3; stacks: node):** node--pack-visibility-per-engine-never-averaged, node--review-reply-by-rating-band, node--service-area-coverage-gaps-by-volume.

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

First architecture review, against `4940dba1b`. All 11 documents read in full. Three
primary sources opened: the 2026 practitioner ranking-factor survey and two pages of
the dominant engine's owner help. The survey confirms the review-factor ranks the
subject cites (rating 6, quantity 9, recency 11, sustained inflow 14, owner replies
122), but ranks proximity second, behind primary category, where two documents call it
the single largest input. It says review and behavioural signals both gained weight,
not that reviews grew most; the group percentages sit in a chart image and the
"second-largest group" share was confirmed only by a secondary source. The engine's
current reply guidance no longer reads as the review-reply technique paraphrases it,
and it advises signing a reply with a name or initials. The attention-score weights do
not hold the ordering the technique says they hold at any realistic count. No
verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/local-visibility-and-reputation",
  "date": "2026-10-31",
  "baseline": "4940dba1b",
  "digest": "sha256-b2:5d614de6ba6e3089",
  "disposition": "clarify",
  "coverage": "All 11 documents read in full (golden path, 6 techniques, 4 node applications). Three primary sources opened. Weight arithmetic in the attention-score technique recomputed. Not evaluated: the private workspace and prompt-pipeline trees the applications cite, any runtime, the survey's chart-image group weights.",
  "counterexamples": [
    "With the stated weights a location with seventeen unanswered reviews (17 x 6 = 102) sorts above a disconnected listing with nothing else wrong (100), and five flags (100) tie it; nine unanswered reviews (54) overtake an attention status (50).",
    "A survey can rank proximity second behind primary category while a practitioner still finds proximity decides most packs in a dense market; a factor rank is an expert opinion aggregate, not a measured weight.",
    "A reply signed with the responder's initials follows the engine's own advice and still speaks for the business; a strict 'the individual is not shown' rule is a convention, not the platform's rule.",
    "A three-pack boundary is widely reported by practitioners but is observed behaviour of the results page rather than a published platform specification; a layout change would move it."
  ],
  "sources": [
    {
      "url": "https://whitespark.ca/local-search-ranking-factors/",
      "result": "2026 edition, 47 experts, 187 factors. Local pack ranks: 'Primary GBP Category' 1, 'Proximity of Address to the Point of Search' 2, high numerical ratings 6, quantity of native reviews with text 9, recency of reviews 11, 'Sustained influx of reviews over time (rather than bursts)' 14, 'Presence of owner responses to most reviews' 122. On groups: 'the biggest changes we're seeing are an increased importance of review signals and behavioural signals.' Supports the review ranks; refutes 'proximity is the single largest input' and 'the group whose weight grew most'."
    },
    {
      "url": "https://support.google.com/business/answer/3474122?hl=en",
      "result": "Current reply tips: 'Be professional and polite', 'Keep it short and simple', 'Make your replies count' (avoid the same thank-you to everyone), 'Be conversational, not promotional' (no deals or promotions in replies), 'Never share a reviewer's private information or engage in personal attacks', ask the reviewer to contact by phone or email for complex issues, and 'Personalize your reply' including signing off 'with your name or initials'. Supports the band invariants; refutes the technique's paraphrase ('thank the reviewer, be a friend rather than a salesperson') and qualifies its 'individual is not shown' rule."
    },
    {
      "url": "https://support.google.com/business/answer/3474050?hl=en",
      "result": "'Helpful and positive replies to reviews can show that you're responsive to your customers.' Says nothing on ranking. Consistent with reply-for-the-reader framing."
    },
    {
      "source": "Secondary summaries of the 2026 survey and of the local finder",
      "result": "One secondary article gives GBP 32% and reviews 20% as the top groups; vendor articles describe a three-listing pack since 2015 and a local finder of about 20. Not primary; the 'second-largest group' and 'about twenty' claims are kept but not confirmed."
    }
  ],
  "documents": {
    "local-visibility-and-reputation.md": {
      "disposition": "clarify",
      "reason": "(1) 'proximity is the single largest input' -> among the largest, second behind primary category in the 2026 survey. (2) 'the group whose weight grew most' -> one of two groups (with behavioural signals) the survey says gained weight. Owed, not confirmable this run: 'documented platform behaviour' for the three-pack is practitioner-documented observation, not a published platform spec."
    },
    "techniques/attention-score-for-many-locations.md": {
      "disposition": "clarify",
      "reason": "The claim that the first two inputs 'cannot be overtaken by the rest at any realistic count' is false for the stated weights (17 unanswered = 102 > 100; 9 unanswered = 54 > 50; 5 flags = 100). State the crossover and offer status-tier-first sorting where such counts are realistic."
    },
    "techniques/pack-visibility-per-engine-never-averaged.md": {
      "disposition": "clarify",
      "reason": "'Proximity is the largest single input to the pack' -> second in the 2026 survey behind primary category. Rest (refuse unknown engine, strict pack import, no phantom engine, illustrative share of voice) keep."
    },
    "techniques/review-recency-beats-count.md": {
      "disposition": "keep",
      "reason": "Survey ranks quoted correctly (6, 9, 11, 14, owner replies past 100 at 122) and the text already concedes the survey does not place recency above count. 'Grew in weight' matches the source; 'second-largest group' rests on a chart the text did not expose and is secondary-confirmed only."
    },
    "techniques/review-reply-by-rating-band.md": {
      "disposition": "clarify",
      "reason": "Replace the engine-guidance paraphrase with its current wording (professional and polite, short and simple, conversational not promotional, never share private information, take complex issues to phone or email) and qualify the 'individual is not shown' invariant: the engine advises a name or initials sign-off; 'we' remains this bundle's convention."
    },
    "techniques/service-area-coverage-gaps-by-volume.md": {
      "disposition": "keep",
      "reason": "Pair matrix, null-not-zero rank and volume, weak count beside coverage and ordinal-only volume use are internally consistent and labelled as convention where they are."
    },
    "techniques/sustained-decline-three-runs-three-positions.md": {
      "disposition": "keep",
      "reason": "Run plus magnitude, both labelled convention; four-observation minimum matches the three-move run; date policy is coherent."
    },
    "applications/node--attention-score-for-many-locations.md": {
      "disposition": "reverify",
      "reason": "Paired 14/15 -> 0/15 result is internally consistent; the private tree was not reopened. Its 'weights match the technique exactly' inherits the crossover problem now stated in the technique."
    },
    "applications/node--pack-visibility-per-engine-never-averaged.md": {
      "disposition": "reverify",
      "reason": "Line-anchored claims at a private commit not reopened; shortfalls (unlabelled share of voice, no grid) stated honestly."
    },
    "applications/node--review-reply-by-rating-band.md": {
      "disposition": "reverify",
      "reason": "Private workspace and the sibling prompt pipeline at a47c1ecd not reopened; shortfalls (no escalation rule, no velocity alarm) stated honestly."
    },
    "applications/node--service-area-coverage-gaps-by-volume.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; the 'volume 0 sorts as measured' deviation is disclosed."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the four clarify items of the record above, each backed by a source opened this
run or by recomputed arithmetic. The three-pack "documented platform behaviour" wording
stays owed: no primary platform page stating it was found. Applications were not
touched and keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/local-visibility-and-reputation",
  "date": "2026-10-31",
  "baseline": "4940dba1b",
  "digest": "sha256-b2:150475493afdffcb",
  "disposition": "reverify",
  "coverage": "All 11 documents decided. Four documents edited and the edited passages re-read; the other seven are byte-unchanged and keep their dispositions. No private tree or runtime reopened; no verification date refreshed.",
  "counterexamples": [
    "With the stated weights a location with seventeen unanswered reviews (102) sorts above a disconnected listing with nothing else wrong (100); the technique now states the crossover and the status-tier-first remedy.",
    "A survey can rank proximity second behind primary category while proximity still decides most packs in a dense market; a factor rank is an expert opinion aggregate, not a measured weight.",
    "A three-pack boundary is widely reported but is observed results-page behaviour rather than a published platform specification; a layout change would move it."
  ],
  "sources": [
    {
      "url": "https://whitespark.ca/local-search-ranking-factors/",
      "result": "Re-read 2026-10-31: proximity rank 2 behind 'Primary GBP Category'; 'an increased importance of review signals and behavioural signals'. Basis for the golden-path and pack-technique edits."
    },
    {
      "url": "https://support.google.com/business/answer/3474122?hl=en",
      "result": "Re-read 2026-10-31: 'Be professional and polite', 'Keep it short and simple', 'Be conversational, not promotional', 'Never share a reviewer's private information', sign off 'with your name or initials'. Basis for the review-reply edits."
    },
    {
      "source": "Arithmetic in techniques/attention-score-for-many-locations.md",
      "result": "5 x 20 = 100, 17 x 6 = 102, 9 x 6 = 54 against status weights 100 and 50. Basis for the crossover sentence."
    }
  ],
  "documents": {
    "local-visibility-and-reputation.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: proximity is now 'among the largest inputs ... second only to the primary category in the 2026 practitioner survey'; reviews are 'one of the two groups (with behavioural signals) the latest edition says gained weight'. Still owed: 'documented platform behaviour' for the three-pack boundary should read as practitioner-observed behaviour unless a primary platform page is found."
    },
    "techniques/attention-score-for-many-locations.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced 'cannot be overtaken by the rest at any realistic count' with the computed crossovers (5 flags tie, 17 unanswered overtake disconnected, 9 overtake attention) and the status-tier-first sort that makes the first two unconditional."
    },
    "techniques/pack-visibility-per-engine-never-averaged.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'largest single input' -> 'among the largest inputs ... second only to the primary category in the 2026 practitioner survey'."
    },
    "techniques/review-recency-beats-count.md": {
      "disposition": "keep",
      "reason": "Survey ranks quoted correctly (6, 9, 11, 14, owner replies at 122) and the text already concedes the survey does not place recency above count. 'Second-largest group' is secondary-confirmed only."
    },
    "techniques/review-reply-by-rating-band.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the engine-guidance sentence now carries its current wording (professional and polite, short and simple, no identical thank-you, conversational not promotional, no private information, complex issues to phone or e-mail); the first-person-plural invariant now allows a name or initials sign-off."
    },
    "techniques/service-area-coverage-gaps-by-volume.md": {
      "disposition": "keep",
      "reason": "Pair matrix, null-not-zero rank and volume, weak count beside coverage and ordinal-only volume use are internally consistent and labelled as convention where they are."
    },
    "techniques/sustained-decline-three-runs-three-positions.md": {
      "disposition": "keep",
      "reason": "Run plus magnitude, both labelled convention; four-observation minimum matches the three-move run; date policy is coherent."
    },
    "applications/node--attention-score-for-many-locations.md": {
      "disposition": "reverify",
      "reason": "Paired 14/15 -> 0/15 result is internally consistent; the private tree was not reopened. Its 'weights match the technique exactly' now carries the crossover the technique states."
    },
    "applications/node--pack-visibility-per-engine-never-averaged.md": {
      "disposition": "reverify",
      "reason": "Line-anchored claims at a private commit not reopened; shortfalls (unlabelled share of voice, no grid) stated honestly."
    },
    "applications/node--review-reply-by-rating-band.md": {
      "disposition": "reverify",
      "reason": "Private workspace and the sibling prompt pipeline at a47c1ecd not reopened; shortfalls (no escalation rule, no velocity alarm) stated honestly."
    },
    "applications/node--service-area-coverage-gaps-by-volume.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; the 'volume 0 sorts as measured' deviation is disclosed."
    }
  }
}
```
