---
layer: application
type: application
subject: data-video-virality
technique: precedent-evidence-gate
stack: process
status: draft
verified_on: 2026-10-03
---

# Precedent gate in a 200-pass ideation loop: a data-video studio

How one local-first data-video studio (repo: `StatReel`, viz-led 30–90 s
narration-free videos per its ADR 007) triaged content ideas against
counted public view evidence, and what the gate rejected.

## Setting

- Ideas live in the studio's `case_ideas` table (`data/app.sqlite`). The
  sanctioned write path is `POST /api/cases` (ADR 008), validated by
  `validateCaseIdea` and `checkCases` in `.claude/skills/board/scripts/`.
- Only one data source is ingested (F1DB, CC BY 4.0), so most ideas need
  a new source, which needs owner approval. That is scored on the data
  axis, not ignored.
- The loop's output is in `content-ideas/` in the studio repo: `RUBRIC.md`,
  `BACKLOG.md`, `backlog.json`, `cases-passed.json`,
  `reference-library.json`, `research-log.json`,
  `EXISTING-EVALUATION.md`, `progress.json`. A dry-run importer
  (`import-cases.mjs`) has not been run.

## The rubric as built

Out of 100 points: hook 15, **precedent 15 (computed)**, universality 15,
**story 15 (computed)**, data 10, feasibility 10, novelty 10, series 5,
platform 5.

- Precedent tiers from the best comparable's views: ≥5M → 15, ≥1M → 12,
  ≥250K → 9, ≥50K → 6, otherwise 3. Adjacent comparables are capped at 6.
- Story is 0 when the span is under 10 years or there are fewer than 4
  beats (this also encodes the owner's 10-year rule, which is why every
  single-season championship-fight idea failed).
- **PASS = total ≥ 75 AND precedent ≥ 9 AND story ≥ 9 AND data ≥ 5.**
- Duplicate topics are failed with a reason (topic-duplicate-screen).
  12 were caught, e.g. three separate "best-selling game" framings
  against one existing case.

## Results (2026-10-03)

- 10 batches, **302 ideas generated, 202 passed, 100 failed**. The
  studio's own `checkCases` accepts all 202 passing case records.
- The **106 pending ideas that already existed** were rescored with the
  same rubric: **19 pass**. Most failures had no comparable above 250K
  views or a span under ten years.
- The reference library holds 293 observed comparables (views, channel,
  length, observation date).

## What the evidence said

- Millions of views: "Most Popular Websites 1996–2019" (~38.8M), "The
  History of Europe: Every Year" (~33.8M), console brand sales 1972–2019
  (~28.7M), the tallest building through the years (~35.3M), a national
  flags timeline (~23.3M).
- Saturated clusters (counter-evidence, see saturation-check): recent
  NBA all-time scorer races in the hundreds to low thousands of views,
  World Cup goals races ~12K, Super Bowl races ~10K, and similar results
  for energy, crypto, exports, "fastest to 100M users" and
  causes-of-death races.
- The format pattern that passed most: every-year map histories, size
  ladders, record progressions, and long rivalries with a famous cast.

## Limits that were recorded, not hidden

- View counts came from public long-form video pages and search results.
  Short-video platforms without public counts were used only through
  search snippets (counted as adjacent evidence). The forum API was
  blocked, and the fetch tool was blocked by the video host, so a plain
  HTTP client was used instead.
- Hook, universality, novelty, series and platform scores are the
  scorer's own judgments. Only precedent and story are computed.
