---
layer: application
type: application
subject: playtest-signal-to-defect
technique: observation-before-interpretation
stack: process
status: forged
verified_on: 2026-09-02
---

# The finding record as an observation/interpretation contract

Realized in the Pillars of Fortune (PoF) app, whose AI Game Director stores sessions played by an
automated agent and the findings extracted from them. Citations resolve against commit `9aa31407`
on `master`. This is a `process` application: the split lives in a report schema and in the
writer's contract before it lives in any algorithm, and the schema is the whole enforcement
mechanism.

## The split, as far as it goes

`PlaytestFinding` (`src/types/game-director.ts:115-141`) separates `description` from
`suggestedFix` (`:128`), and the storage schema mirrors it — `game_director_findings` carries
`description TEXT NOT NULL DEFAULT ''` and `suggested_fix TEXT NOT NULL DEFAULT ''` as distinct
columns (`src/lib/game-director-db.ts:68-90`). A machine tester's proposed remedy therefore has a
field of its own and does not have to be extracted from prose later. Crucially, the interpretation
field is **off the identity path**: the cross-build fingerprint is hashed from
`category::titleStem::relatedModule` only (`src/lib/regression-tracker.ts:100-108`), so a finding
whose suggested fix changes between sessions is still the same finding.

The finding also carries `gameTimestamp` (`:127`) — the timestamp that lets an observation be
seeked to in a capture, which is the minimum an observation needs in order to be checkable at
all.

## Provenance, done properly

The strongest thing in this tree is not the field split; it is `SessionSource`
(`src/types/game-director.ts:50-63`). Every session records whether its numbers came from a real
harness or from the in-repo fixture, and the doc comment refuses the flattering default in as many
words: `simulated` means "NO build was launched, no frame was captured, nothing was measured", and
"**absent means `simulated`**, never 'verified'". Consumers are required to resolve it through
`resolveSessionSource()` (`src/lib/game-director-styles.ts:100`) rather than reading the field, and
the overview surface renders it as a provenance chip
(`src/components/modules/game-director/DirectorOverview.tsx:240`).

That is the technique's attribution rule generalised to a whole session: an interpretation — or a
score — is worth what its source is worth, and the source travels with it to the display layer.
The same instinct governs `PlaytestSummary` (`:95-113`), where `totalScreenshotsAnalyzed`,
`testCoverage` and `playtimeSeconds` are all `number | null` with the comment "a made-up one is
worse than an absent one".

## Deviations: the standard stays

**The observation field is not constrained to observations.** `description` is free text and the
fixture fills it with mixed observation and theory — "The window between combo attacks has a 200ms
dead zone where input is ignored. Players expect immediate responsiveness during combo chains"
(`src/lib/game-director-sim.ts:141`). The first sentence is an observation, the second is a claim
about players nobody measured, and they share a column. The technique wants the observation field
validated — timestamped entries, no causal connectives — and a separate field for the theory;
having two columns is half the mechanism, and the unvalidated half is the one that leaks.

**Confidence is a constant with a default.** `confidence INTEGER NOT NULL DEFAULT 80`
(`src/lib/game-director-db.ts:80`, repeated on the occurrence row at
`src/lib/regression-tracker.ts:48`) is documented as "Confidence 0-100 that this is a real issue"
(`src/types/game-director.ts:130-131`), and the fixture's values run 82-97 with no stated basis. A
default of 80 is an unmeasured quantity rendering as a number, which is exactly what the same tree
refuses elsewhere with `number | null`. The honest shape is the one `PlaytestSummary` already uses:
`null` for not measured, and a stated basis when it is.

**There is no separate observation request.** The findings arrive already carrying category,
severity, confidence and a suggested fix from one generation pass. The technique's two-request
protocol — events first, validated, then the theory with the events quoted back — is not
implemented, and a single pass is where a model writes the observation to support the theory it
already has.

## What a consumer should copy

The provenance field with its refusal to default to "verified", the `number | null` discipline for
unmeasured quantities, and the exclusion of the remedy field from the finding's identity hash.
Then close the gap: validate the observation column, make confidence nullable, and split the
generation into two requests.
