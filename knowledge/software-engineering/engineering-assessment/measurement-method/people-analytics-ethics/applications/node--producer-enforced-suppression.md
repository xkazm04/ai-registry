---
layer: application
type: application
subject: people-analytics-ethics
technique: producer-enforced-suppression
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@24
---

# Producer-enforced suppression in a contributor-insights server module

The source app (`ascent`) aggregates per-contributor commit
data across an org's repositories and renders it on a Contributors tab, a Teams
tab, an Adoption brief, a CSV export and an LLM-facing copy brief. The naming
floor lives in exactly one place: the producers.

## The floor is a predicate, defined once

`src/lib/org/champions.ts:1-32` holds three constants, each with
its rationale in the doc comment rather than in a commit message:

- `CHAMPION_MIN_POP = 3` — "Minimum contributor population before naming AI
  'champions' is meaningful rather than a surveillance-y ranking. Below this, a
  single AI user becomes a celebrated '#1 ★ champion' and the fleet reads as
  100%-adopted — success theater."
- `MIN_CHAMPION_COMMITS = 3` — "One or two AI-tagged commits is an experiment,
  not a carried habit."
- `CHAMPION_LIMIT = 6` — "small enough that inclusion stays meaningful and the
  grid never degenerates into a ranked list of most of the team — which would
  defeat the not-a-scoreboard framing."

The floor is exported as a predicate, `canNameIndividuals(population)`, with an
explicit statement of where it must be applied: "so the guarantee is enforced
by the DATA PRODUCERS ... rather than re-implemented at each call site.
Consumers may still call it to choose *copy* ('suppressed' vs 'no data'), never
to re-derive the data." That is the technique's consumer rule, written into the
same file as the constant.

## The incident that moved it down a layer

`src/lib/db/org-contributors.ts:337` records why: "The guard used to live
only in the React layer, so every new consumer had to remember it (the CSV
export and the Adoption brief both forgot)." `src/lib/db/org-teams.ts:371`
records the same failure independently — two surfaces "each re-checked this and
a third surface (the CSV/brief path) never did; now no consumer can surface
what this never emits."

Three forgetting consumers across two modules is the empirical case for the
technique, and it is the case the technique predicts: the leak arrives with the
consumer written after the rule.

## What the payload looks like

`getContributorInsights` (`src/lib/db/org-contributors.ts:212`, payload `:360-361`) returns a
shape whose per-individual fields are structurally empty below the floor:

- `contributors` and `champions` — `[]` when `namingAllowed` is false, so a
  renderer that forgets the flag draws nothing rather than a roster. That is
  the "suppressed shape is self-enforcing" property: the empty list *is* the
  render guard.
- `concentration[].topLogin` — a named individual inside an otherwise
  aggregate row, so it is redacted field-by-field while the row's counts,
  `topShare` and `busFactor` survive.
- `namingAllowed: boolean` — published solely so consumers "pick honest copy
  ('withheld', not 'no data')".

`src/lib/org/adoption.ts:167-185` shows a second producer inheriting the same
guard: `enablementTargets` returns `[]` when `namingAllowed` is false, and its
comment states the consequence — "an empty list IS the render guard; no call
site re-checks the population." It also states why the cohort is exported at
all: "TWO surfaces need it and the cohort must be defined once ... Duplicating
the two thresholds at the second call site is exactly what let three adoption
surfaces drift apart before."

## Suppression removes identities, not findings

The module is careful that the floor does not become an outage
(`src/lib/db/org-contributors.ts:73` and `:360-368`). `distribution` — the
high/some/none spread of per-person AI share — is computed over every human and
"always populated, even below the naming floor, so a small org still gets an
adoption spread without any consumer having to walk the (withheld) per-person
rows to compute it." `resilience` is likewise emitted at any population size,
with the reasoning stated inline: "a 2-person org is the MOST key-person-exposed
org there is, and withholding its risk read would hide the finding, not a
person."

## The shortfall the first read found, since closed

On 2026-08-20 the one exception was `REDACTED_LOGIN = "—"`, documented as "the
same sentinel as 'no data'": withheld and empty were indistinguishable in that
field, the collision the standard forbids. By 2026-09-30 it is fixed, and the
shape of the fix is the reusable part. `topLoginState: "named" | "withheld" |
"unknown"` (`TopContributorState` in `src/lib/org/champions.ts`) rides beside
the string, and `topContributorLabel` owns the copy. The placeholder stays the
same neutral "—" on purpose: a new "[withheld]" sentinel would have leaked
through `ContributorsConcentrationTable`, which renders `topLogin` raw, so the
state carries the meaning and no consumer string-compares the placeholder. The
accepted trade-off is written down beside it: a consumer that never adopts the
state keeps the old undifferentiated display, no worse than before. The
producer test asserts the state, not the string.

## Where the floor sits against the technique

`CHAMPION_MIN_POP = 3` is below the five-to-ten band that
[naming-population-floor](../techniques/naming-population-floor.md) gives for
per-person publication. It holds here only because the output is a bounded,
celebratory list capped at `CHAMPION_LIMIT = 6` behind a commit-volume gate.
At a population of three the list is the whole team, so it would fail the
technique's residual test if it were comparative. Copying the constant without
the framing would not be safe.
