---
layer: application
type: application
subject: encounter-balance-simulation
technique: monte-carlo-scenario-presets
stack: process
status: forged
verified_on: 2026-08-20
---

# A standing cast, and the report it feeds

The balance methodology in the `pof` repo is built on a fixed cast checked in at
`src/lib/combat/gas-balance-presets.ts`. Every balance question the tool asks is asked
against these combatants, which is what makes an answer from March comparable to an
answer from May.

## The cast (`gas-balance-presets.ts:5`)

| Preset | Level | Health | Armour | Base hit | Crit | Rate | Axis it exercises |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `DEFAULT_PLAYER` | 15 | 500 | 20 | 50 | 15% ×1.5 | 1.2 | the reference build |
| `skeleton` — Skeleton Warrior | 12 | 150 | 10 | 25 | 5% ×1.5 | 0.8 | trash, fast fights, overkill |
| `golem` — Stone Golem | 18 | 800 | 60 | 45 | 0% | 0.5 | the armour soft-cap region |
| `mage` — Dark Mage | 16 | 200 | 5 | 60 | 20% ×2.0 | 0.7 | glass burst, one-shot risk |
| `boss` — Dungeon Boss | 20 | 2500 | 40 | 80 | 15% ×2.0 | 0.6 | long fights, attrition, tails |

Derived stats carry their formula inline — `attackPower: 70, // base 10 + Str*2 = 70` at
`:15` — so a reader can tell an authored number from a computed one.

`SCENARIO_PRESETS` (`:87`) composes exactly three: `trash-pack` (3× skeleton),
`mixed-pack` (2× skeleton + 1× mage), `boss-fight`. Each stores `iterations: 2000` as a
property of the scenario, not of the session — at that count the standard error on a
survival rate near 50% is about ±1.1 pp, so differences under ~3 pp are noise.
`DEFAULT_SWEEP_CONFIG` (`:117`) drops to `iterationsPerLevel: 300` across levels 1–50,
which is ±2.9 pp — a deliberate interactivity trade that the surface does not currently
disclose.

## The report the cast feeds

`src/lib/combat/fight-report.ts` narrates the run for non-technical stakeholders. Bands
from `difficultyBand` (`:55`): `≥0.9` easy, `≥0.6` fair, `≥0.35` tough, else brutal.
`DOMINANT_KILLER_SHARE = 0.3` (`:43`) gates the culprit sentence, and `buildTopFix`
(`:92`) implements the refusal beside it — when no source clears the threshold it returns
"No single attack dominates your deaths…" rather than naming the argmax, and when
`totalDeaths === 0` it returns `null` rather than inventing a culprit.

Encounter alerts live in `src/lib/combat/choreography-sim.ts:263`: death under 5 s is
`critical` ("too punishing"), any death is a `warning`, over 45 s is "spongy", under 3 s
is "trivially easy", combined enemy HP above 5× player HP is "tedious", and a 2-second
bucket carrying more than 40% of player max HP is a `critical` burst spike. The
unresolved-placement alert at `:265` is the *unmeasured-is-not-a-pass* case: skipped
enemy placements (renamed or removed archetype) are reported as a warning rather than
silently simulated away.

## The glossary as a methodology artifact

`src/lib/combat/metric-glossary.ts:1` defines 20 metrics with one jargon-free sentence
and one worked example each, and it is the single source behind every inline tooltip. It
is where several judgments live in prose rather than in code:

- `oneShotRate` (`:69`): "Anything above ~5% feels unfair — players die before they can
  react."
- `killShare` (`:89`): "A 40% kill share means this single source lands 4 of every 10
  killing blows — the prime nerf target."
- `damageShare` (`:95`), distinguished from kill share by its denominator.
- `medianFightDurationSec` (`:47`): "A 6s median with a 9s average means a few long
  fights are pulling the average up" — the distribution-not-mean lesson, taught in a
  tooltip.

## The peer-band lint that runs before any of this

`src/lib/balance/bestiary-guardrails.ts:25` screens a new archetype against its roster:
`MIN_PEERS = 2`, `HIGH_FACTOR = 2.5`, `LOW_FACTOR = 0.4`, both bands `warn` ("Verify this
is intentional" / "May be under-tuned"), with missing abilities as a hard `error`. Scores
come from `src/lib/balance/threat-score.ts:19` — damage .5, health .3, armour/resist .25,
crit .2, speed .15, default .1 — chosen for legibility.

One deviation the standard does not follow the code on: `threatPercentile` (`threat-score
.ts:55`) returns `100` for a single-entry roster. A percentile over a population of one
is not a percentile; the correct value is the same *unranked* label the linter already
uses below `MIN_PEERS`, and returning a maximum score is a fabricated number in exactly
the situation — a brand-new tier — where a stray stat is most likely.
