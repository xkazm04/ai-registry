---
layer: application
type: application
subject: judgeable-spec-authoring
technique: execute-the-rules-against-the-worked-example
stack: node
status: forged
verified_on: 2026-09-01
refresh_by: 2027-03-01
source: "cucumber/cucumber-js"
---

# Node: a runner whose whole job is executing the rules against the worked example

## Pin

`cucumber/cucumber-js` @ `c887bc5667aa8fdc797efec632249b97268b6759`, package version
`13.2.1`, read and run on 2026-09-01 with Node v24.14.0 on Windows. Executed evidence
comes from two harnesses: the published `@cucumber/cucumber@13.2.1` in a fresh fixture
project, and the clone itself after `npm ci && npm run build`.
**Fate: confirmed**, with the technique's step 4 split into four and one limit added.

## What the tree does

A Gherkin feature file is a spec containing worked examples; step definitions are the
rules; the runner is the technique's audit made compulsory. It cannot read a rule as
intended — a step's text is matched against definition patterns with no inference — and
the *shape of the mismatch* is the verdict:

- `src/runtime/test_case_runner.ts:329-341` — zero matching definitions →
  `UNDEFINED`, and the runner emits a suggestion (a generated snippet) alongside it.
- `src/runtime/test_case_runner.ts:343-348` — more than one matching definition →
  `AMBIGUOUS`. Not a first-match win, not a most-specific-wins heuristic.
- `src/runtime/step_runner.ts:70-78` — the rule ran: returning `'pending'` →
  `PENDING`, a thrown error → `FAILED`, otherwise `PASSED`.

The technique's "when they differ, decide which is right" is one bucket where this tree
has four, each with a different repair: write a rule (`UNDEFINED`), disambiguate the
rule text (`AMBIGUOUS`), finish the rule (`PENDING`), fix rule or example (`FAILED`).
Only the last is the classic rule/example disagreement.

**Strictness is one bit over exactly one verdict.** `src/runtime/helpers.ts:62-75`:
`AMBIGUOUS`, `FAILED` and `UNDEFINED` are unconditional failure statuses; `--strict`
appends `PENDING` and nothing else, and `src/configuration/default_configuration.ts:25`
ships `strict: true`. The negotiable verdict is the one the author *declared* unfinished
— the golden path's "split the claim by evidentiary status" enforced by a runner.
`--dry-run` suppresses all of them (`src/runtime/helpers.ts:63-65` returns `false` before
the status is consulted): structural proof that every step binds with zero rules executed
— [L9](../../../_laws.md#structural-proof-is-never-sufficient) in one flag.

**The tree self-specifies in its own format.** `features/*.feature` are specs its own
runner executes against `features/step_definitions/*.ts`; the ambiguity verdict has a
worked example at `features/ambiguous_step.feature:1-33` pinning the exact rendered
output including both matching patterns and their file:line.

## Executed evidence

Fixture project, `@cucumber/cucumber@13.2.1`, one-scenario features and four step
definitions. `npx cucumber-js features/<f>.feature <mode>`, exit via `out=$(...); code=$?`:

| feature | `--strict` | `--no-strict` |
| --- | --- | --- |
| step matching no definition | `1 scenario (1 undefined)` exit=1 | exit=1 |
| step matching two definitions | `1 scenario (1 ambiguous)` exit=1 | exit=1 |
| step returning `'pending'` | `1 scenario (1 pending)` exit=1 | exit=**0** |

`--strict` changed exactly one row, confirming `helpers.ts:62-75` from the outside.
`--dry-run --strict` over the undefined + ambiguous features:
`2 scenarios (1 undefined, 1 ambiguous)` and **exit=0**.

The ambiguous verdict body, verbatim:

```
       Given a ambiguous step
           Multiple matching step definitions found:
             • ^a ambiguous step$ # features\step_definitions\steps.js:3
             • ^a (.*) step$ # features\step_definitions\steps.js:4
```

**A dead rule keeps a stale example forever.** `src/runtime/helpers.ts:9-40` defines
`getAmbiguousStepException`, whose text is `Multiple step definitions match:` — a
different sentence from the one the runner actually prints. It is dead:

```
$ grep -rn "getAmbiguousStepException" . --include=*.ts --include=*.js \
    --include=*.feature --include=*.md | grep -v node_modules
./src/runtime/helpers.ts:9:export function getAmbiguousStepException(...)
```

One hit, the definition; the shipped wording comes from
`@cucumber/pretty-formatter`'s `formatAmbiguousStep.js`. The project's own worked example
still passes — `node bin/cucumber.js features/ambiguous_step.feature --parallel 0 --format
summary` → `1 scenario (1 passed) / 7 steps (7 passed)`, exit=0 — because it exercises the
wired path, not the orphan. The technique's audit clause from the negative side: executing
rules against worked examples reaches only *reachable* rules, and an unreferenced rule is
exactly where a stale statement survives.

## What sharpened, and one limit

**Sharpened.** The technique's step 4 ("decide which is right — usually the example")
assumes the only failure is disagreement. Classifying *why* the example did not bind
turns one judgement call into four routed repairs: ask first whether the example bound to
one rule, to none, or to two.

**Refuted for a sibling technique, not for this one.** The runner does **not** check
that a scenario outline's placeholders are covered by its Examples header. Fixture:

```gherkin
  Scenario Outline: echo
    Given echo <amount>|<recipient>
    Examples:
      | amount | unused |
      | 10     | zzz    |
```

Result: `BOUND=[10|<recipient>]`, `1 scenario (1 passed)`, exit=0 under `--strict`. An
uncovered placeholder is left as literal text and passes; an unused column passes too.
What *is* enforced is header-vs-row cell arithmetic, and only that — a row with one cell
under a two-cell header gives `Parse error in "features\ragged.feature" (6:7):
inconsistent cell count within the table`, exit=1 (from `@cucumber/gherkin@42.0.1`, a
dependency of this tree, not this tree). The strictest reader in this class closes the
enumeration it can count and is silent on the one it must cross-reference.

## Leads

- The verdict/strictness split is a second-sighting candidate against
  `acceptance-verdict-spine`; return if a third counterpart also makes exactly one
  verdict configurable.
- `compatibility/` holds the cross-implementation conformance kit, unread here: a
  ready-made fixture corpus for any spec-grading claim.
