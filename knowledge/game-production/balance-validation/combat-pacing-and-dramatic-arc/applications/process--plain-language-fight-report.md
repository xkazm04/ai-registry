---
layer: application
type: application
subject: combat-pacing-and-dramatic-arc
technique: plain-language-fight-report
stack: process
status: forged
verified_on: 2026-08-20
---

# A fight report card and its glossary, as a shipped methodology

The `pof` project's combat balance simulator carries its plain-language layer as two
cooperating modules — `src/lib/combat/metric-glossary.ts` (the dictionary) and
`src/lib/combat/fight-report.ts` (the card) — plus a Simple/Advanced split in the view that
mirrors an equivalent split in the project's prompt-evolution screen.

## The glossary is the instrument, not its documentation

`metric-glossary.ts:1-20` states the problem in the file's own words: the simulator is "the
most acronym-dense screen in the product", surfacing DPS, Monte Carlo, one-shot rate, armor
weight and kill share to users who cannot parse them. Twenty-odd entries follow, each a
`MetricGlossaryEntry` with exactly the three parts the technique requires — `term`, one
jargon-free `plain` sentence, one concrete `example`:

- `oneShotRate` (`:69`) — plain: "the share of deaths where the player was killed by a single
  blow from near-full health"; example: **"Anything above ~5% feels unfair — players die
  before they can react."** The example slot is being used to carry a design judgment, and
  that judgment is the reason the metric is actionable at all.
- `abilityUsage` — "An ability at 0.1 uses/fight is almost never worth pressing — buff it or
  cut it." Again: a threshold plus a decision, in one sentence.
- `killShare` (`:89`) — "A 40% kill share means this single source lands 4 of every 10 killing
  blows — the prime nerf target."
- `medianFightDurationSec` — "A 6s median with a 9s average means a few long fights are pulling
  the average up." This is the paired-reading entry: it teaches two metrics against each other
  rather than either alone.

Entries are keyed by the literal summary field name (`avgDPS`, `oneShotRate`,
`armorEffectivenessWeight`), with short slugs for acronyms, so `lookupMetric` (`:172`) can be
called with the raw key a panel already holds. That keying is what makes the invariant
enforceable: every KPI card, mini-stat, heatmap cell and tuning slider defines a term the same
way, because they all reach the same record.

## The card

`narrateSummary` (`fight-report.ts:134`) assembles a fixed five-part structure:

- **Band + headline.** `difficultyBand` (`:54`) is the whole band table in five lines:
  `>= 0.9` easy, `>= 0.6` fair, `>= 0.35` tough, else brutal. `winsOutOfTen` (`:50`) converts
  the survival rate into a count out of ten and `buildHeadline` speaks it — "You usually win
  (7 of 10 tries)."
- **Verdict.** `buildVerdict` (`:80`) narrates duration.
- **Top fix.** `buildTopFix` (`:91`) applies `DOMINANT_KILLER_SHARE = 0.3` (`:43`): a source at
  or above a 30% kill share earns a named culprit and an instruction — "the Stone Brute's
  charge... landed the killing blow in 4 of every 10 deaths. Soften it to make the fight
  fairer." Below the threshold it deliberately refuses to name a leader: "No single attack
  dominates your deaths... the danger is spread across several sources" (`:103-105`). Returning
  `null` when `totalDeaths === 0` handles the third case — nothing to nerf.
- **Notes.** `:137-141` filters `severity !== 'info'`, maps through `plainAlert`, and slices to
  three. `plainAlert` (`:109`) returns `null` for `survival-low` and `survival-high` with the
  comment "already covered by the headline" — the explicit de-duplication the technique asks
  for.
- **Portability.** `formatReportCardText` (`:162`) renders the same card as a plain-text block
  for pasting into a document, so a finding can leave the tool.

## The deviation worth naming

`buildVerdict` (`:80-88`) calls fights "a slog" above **30 seconds**, while the encounter
simulator's spongy alert fires at **45 seconds** (`choreography-sim.ts:279`) and its
"too quick to land" line at 3 seconds matches the sim's trivial threshold. Two authorities for
one quantity: a fight at 35 seconds is narrated as dragging while the alert layer says nothing,
and the reader is left to decide which half of the same tool to believe. The standard stays —
the prose layer reads its thresholds from the same constant the checks use, or the two drift
silently and the drift is invisible from either side. The correct move here is to lift both
duration bounds into one exported constant that the alert and the narration share.

## The shape that transfers

What generalizes is not the wording but the discipline: a metric enters the human-facing
surface only when someone can write its plain sentence, its worked example, and the sentence
that says what a good value looks like. The glossary file is where that judgment is stored, it
is versioned with the code that emits the numbers, and a metric with no entry is a metric that
should not be on screen.
