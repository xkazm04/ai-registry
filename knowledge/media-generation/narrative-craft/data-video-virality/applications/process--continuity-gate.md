---
layer: application
type: application
subject: data-video-virality
technique: continuity-gate
stack: process
status: draft
verified_on: 2026-10-03
---

# Continuity, path and event gates calibrated on owner verdicts: a data-video studio

How the data-video studio from `process--precedent-evidence-gate.md`
(repo: `StatReel`, narration-free viz-led videos per its ADR 007) rebuilt
its content-idea rubric after the owner reviewed 27 round-1 passes and
judged the precedent-led rubric too weak. Round 1 passed ideas such as
"How old is the president" and "The biggest plane" because the topics had
big comparables, but nothing asked why anyone would keep watching the
chart.

## The owner's verdicts (calibration set)

| # | round-1 case | verdict | direction or reason |
|---|---|---|---|
| 1 | The search box wars | accept | engine share over time, with key events that spark big moves |
| 2 | Lauda's comeback year | reject | documentary topic, not data viz |
| 3 | The battle royale bubble | accept | expand to every game in the genre, with pop-up events (releases, seasons) |
| 4 | The trillion-dollar club | accept | |
| 5 | Number one of every year in streams | accept | redirect to the top 20 streamed songs each month |
| 6 | The largest empire alive | accept | |
| 7 | The tallest thing humans built | accept | |
| 8 | Every Premier League champion's points | reject | no visual continuity, so no insight |
| 9 | Who held the pocket | accept | redirect to the top 10 phone makers by share, events as catalysts |
| 10 | The pole is faster every year | reject | yearly data only: short, choppy jumps |
| 11 | Steam's most played every month | accept | |
| 12 | Your paycheck vs the house | accept | |
| 13 | Who sold the most records each decade | accept | |
| 14 | How the flags changed | accept | many flags at once on a map, splitting and merging |
| 15 | Life expectancy 1800 to now | accept | |
| 16 | The Ballon d'Or duopoly | reject | yearly over a short horizon, no continuity |
| 17 | Messengers of the world | accept | ideally monthly |
| 18 | Max's record year | reject | single season, can't stretch to length |
| 19 | The Tetris ceiling | accept | if the data exists (max score over time) |
| 20 | What one dollar bought | accept | |
| 21 | Eurovision winners on the map | reject | interest only in the conclusion, not the path |
| 22 | Africa's map every year | accept | |
| 23 | Who got taller | accept | with more countries that changed a lot |
| 24 | The World Cup by country | accept | as total goals by country across history |
| 25 | The richest YouTube kingdoms | accept | as top channels by subscribers over time |
| 26 | Seven titles | accept | as the top 10 drivers by titles across history |
| 27 | The first-person shooter crown | accept | if monthly data can be gathered |

Nine negative controls must also fail: how old is the president, the
biggest plane, the biggest ship, the tallest statue, the 100 m record
ladder, Super Bowl rings, yearly counts of space flyers, the 2021 title
fight, and an independence fill-in map.

## The rubric as rebuilt

Hard gates (any failure rejects):

- **Format:** banned single-value ladders, record lists, winners lists,
  single seasons, documentaries, fill-ins, single lines, conclusion-only.
- **Continuity:** sub-annual or per-event data needs 60 or more real
  steps. Yearly data needs 100 or more steps and 10 or more entities.
  Decade data fails.
- **Entities:** at least 5 on screen.
- **Path:** at least 2 lead changes and 15 visible movements (estimated,
  recorded per case).
- **Accelerator events:** 5 to 15, each with a parseable date, what
  happened and an on-screen effect of at least ten characters; 5 or more
  inside the span.
- **Keep-watching rationale:** at least 140 characters, 2 or more dates or
  numbers, 2 or more named entities, no filler words.
- **Speculative grounding:** a model of 80 or more characters, a real
  baseline of 20 or more years (or 10 or more years of monthly-or-finer
  data), a horizon no longer than twice the baseline, projections to 2100
  at most.
- **Owner veto** (ignored when measuring calibration).

Points out of 100: continuity 20, path 20, events 15, keep-watching 10,
cast 10, data 10, precedent 10 (it was 15 and a gate in round 1), novelty 5;
a saturation flag subtracts 8. **PASS = all gates and 72 or more points.**
The lowest-scoring owner accept scores 75.

Calibration result: **36 of 36** (27 owner verdicts plus 9 controls)
reproduced with the veto switched off. The six owner rejects all fail on
format or continuity gates, not on points.

## Results (2026-10-03)

- 226 round-2 records, **201 pass**: 143 fact, 26 what-if, 32
  projection. The speculative share is 29%.
- Origins of the passes: 21 owner-accepted cases (with directions
  applied), 70 reworked round-1 ideas, 15 reworked pending-DB ideas, and
  95 new ideas (41 fact, 24 what-if, 30 projection).
- Re-triage of the 302 round-1 ideas: 21 had owner verdicts applied, 6
  were owner rejects, 73 were reworked (70 pass) and 202 were rejected. Of
  the 106 pending-DB ideas, 16 were reworked, 5 merged into other cases and
  85 rejected.
- 26 of the speculative passes are sequels of a fact case (the same data
  pipeline with ghost bars or a projected tail), so about 175 distinct
  topics.
- 25 records failed honestly, including 17 speculative ideas on yearly
  data whose points fell short (a yearly baseline scores low on
  continuity), and one counterfactual whose 112-year horizon ran more
  than twice its 43-year baseline.

## What changed in the ideas

- Ladders became races: "the biggest X each year" turned into top-10
  cumulative or ranked views, or was rejected.
- Granularity went down to the finest available data: monthly charts,
  weekly box office, daily market values, per-match goals, per-launch
  counts.
- Every case carries 5 to 15 dated events with their on-screen effects
  (a merger absorbs a bar, a war makes a country's bar vanish, a record
  line moves).

## Limits that were recorded, not hidden

- Lead-change and movement counts are estimates made before any data was
  pulled. They should be checked against the first render.
- Keep-watching, cast and novelty scores are the scorer's judgment.
  Continuity, path, events, data and precedent are computed.
- Many sources are marked "verify" (licence, scraping terms, paid data).
- A cache-path bug briefly dropped search comparables from early
  checkpoints. It was fixed and everything was rescored before the final
  export.
