# `result.json` - the contract

Written by `scripts/council.mjs aggregate` at
`<repo>/.personas/council/runs/<run_id>/result.json` (the run root is configurable in the
overlay; the shape is not). Beside it the run keeps `started.json` (identity, written at
phase 1), `receipt.json`, one `verdict-<dimension>.json` per member, `report.md`, and
`evidence/`.

`scripts/lib/schema.mjs` is the executable copy of this document, and
`council.mjs validate --result <file>` is how you check one. Where prose and the validator
disagree, the validator is the contract.

## Absent-value convention, stated once

**An unmeasured number is `null` with a `state` other than `measured`. Never `0`, never
omitted.** A consumer reading `0` cannot tell "we measured badly" from "we could not
measure", and those lead to opposite actions.

## Document

```jsonc
{
  "schema_version": 1,                  // refused by the consumer on any other value
  "run_id": "<stable, unique, self-identifying>",
  "subject": {
    "kind": "use_case" | "architecture",
    "slug": "<stable slug within the project>",
    "title": "<human title>",
    "summary": "<one or two sentences: what it is>"
  },
  "rubric_version": "feature-v1" | "architecture-v1",
  "round_no": 1,                        // integer >= 1; the method refuses a 4th
  "supersedes_run_id": "<run_id>" | null,
  "trust_state": "uncalibrated" | "untrusted" | "trusted",

  "receipt": {
    "head_sha": "<sha>" | null,
    "spanned_paths": ["<repo-relative posix path>", "..."],   // never absolute, never ".."
    "span_digest": "<64 hex>"           // see scripts/lib/receipt.mjs for the algorithm
  },

  "hard_failures": [
    { "code": "credential_outside_vault" | "write_outside_door" | "unbounded_foreign_decode",
      "detail": "<file:line and what it does>" }
  ],

  "dimensions": [
    {
      "dimension": "value" | "craft" | "rivalry" | "robustness" | "economics" | "reversibility",
      "kind": "mechanical" | "judged" | "mixed",
      "state": "measured" | "unmeasured" | "not_applicable" | "carried",
      "score": 0.0,                     // null unless state is measured or carried
      "confidence": "low" | "med" | "high",
      "floor": 0.5,                     // null when the rubric row has none
      "floor_hit": false,
      "advisory": false,                // a judged floor hit while not yet trusted
      "unmeasured_reason": null,        // required when state is unmeasured
      "findings":   [{ "id": "", "severity": "low"|"med"|"high", "title": "", "detail": "", "recurrence": 1 }],
      "evidence":   [{ "kind": "file"|"url"|"screenshot"|"video"|"metric", "ref": "", "caption": "" }],
      "techniques": [{ "subject": "<slug>", "technique": "<slug>", "proof": "execution"|"inspection"|"claim" }],
      "delta": null                     // this score minus the superseded run's, or null
    }
  ],

  // OPTIONAL, and optional TOGETHER with "envelope". Only a use_case subject may carry
  // them. Absent = no scenarios were measured; an EMPTY envelope would be a claim.
  "scenarios": [
    {
      "slug": "marketing-candidate",
      "title": "Marketing candidates",
      "axes": { "domain": "marketing" },        // flat object, string -> string
      "state": "measured" | "unmeasured",
      "score": 0.0 | null,                      // null unless measured - never 0
      "confidence": "low" | "med" | "high",
      "n": 4 | null,                            // runs or turns the score rests on
      "proof": "observed" | "replayed" | "simulated" | "claimed",
      "summary": "<one sentence>"
    }
  ],
  "envelope": {
    "holds":        ["<slug>"],   // measured in scope, at or above the bucket floor
    "weak":         ["<slug>"],   // measured in scope, below it
    "unmeasured":   ["<slug>"],   // in scope, nobody looked
    "out_of_scope": ["<slug>"],
    "proposed":     ["<slug>"]    // declared proposed, or discovered by the value member
  },

  "overall": 0.0 | null,                // null when nothing was measured
  "coverage": 0.0,
  "outcome": "ready" | "fail" | "incomplete" | "stalled",
  "must_address": ["<one line of work per entry, <= 200 chars when generated>"],
  "summary": "<the synthesis in a paragraph - required, never empty>"
}
```

## The arithmetic

```
overall  = sum(weight * score)  over dimensions whose state is measured or carried
           / sum(weight)        over the same set                       -> null if that sum is 0
coverage = sum(weight)          over measured or carried
           / sum(weight)        over dimensions whose state is not not_applicable
```

`not_applicable` leaves **both** sums. `unmeasured` leaves the first and stays in the
second, which is exactly how "we could not tell" lowers confidence in the result instead
of lowering the result.

## Scenarios - the envelope, and the rule order a port must mirror

An approval that says nothing about branches is a stamp. With scenarios it is an envelope:
*holds for IT and engineering, weak for marketing, never measured for HR.*

The DECLARED scenarios come from the product, at `<repo>/.personas/council/state.json`:

```jsonc
{ "scenarios": [ { "subject_slug": "<slug>", "slug": "<slug>", "title": "<human title>",
                   "axes": { "<axis>": "<value>" },
                   "scope": "proposed" | "must_hold" | "tracked" | "out_of_scope",
                   "floor": 0.6 | null } ] }
```

Its absence is tolerated at every level. The value member REPORTS scenarios; the product
DECLARES their scope. `scripts/lib/aggregate.mjs` `aggregateScenarios()` folds the two, and
its rule order is the contract - a consumer in another language mirrors it literally:

1. Index declared and reported rows by `slug`; a duplicate is a problem, not an overwrite.
2. The set is every declared slug in declared order, then every reported slug that was not
   declared, in reported order. An undeclared report is **discovered** and reads as
   `proposed`.
3. `scope` comes from the declaration only; unknown or missing reads as `proposed`. **A
   member may propose a branch and may never promote one.**
4. `state` is `measured` only with a numeric score; otherwise `unmeasured` and `score` is
   `null`. Never `0` - the same absent-value rule dimensions have.
5. `floor` = the declared floor when numeric, else **0.5**.
6. `floor_hit` = scope `must_hold` AND `measured` AND `score < floor`. `tracked` never hits
   a floor; `proposed` and `out_of_scope` never compute one.
7. `advisory` = `floor_hit` AND `trust_state != "trusted"` - a scenario score is a judged
   opinion, so it inherits the judged asymmetry.
8. Envelope buckets, one scenario in exactly one: `proposed` scope -> `proposed`;
   `out_of_scope` scope -> `out_of_scope`; in scope and unmeasured -> `unmeasured`;
   in scope and measured -> `holds` when `score >= bucket floor`, else `weak`. The bucket
   floor is the scenario's floor for `must_hold` and a flat 0.5 for `tracked`.
9. Every `floor_hit`, advisory or binding, adds one `must_address` line:
   `Scenario <title> is below its floor (<score> < <floor>)`.
10. The proof ladder is **recorded and not enforced**. "This branch is only simulated"
    belongs in the scenario's `summary`, where a person reads it; making it a gate would be
    the instrument deciding what counts as evidence.

## `must_address` is a row, and `summary` is not optional

**Every entry the instrument GENERATES is one line of at most 200 characters.** An
unmeasured dimension contributes `<dimension> is unmeasured: <first sentence of the reason,
<= 160 chars>`; a `high` finding contributes `<dimension>: <title>`. Nothing is lost by the
clamp - the full `unmeasured_reason` is on the dimension and the full `detail` is on the
finding, which is where a reader who wants the argument goes. An entry **carried in** from a
human rejection is exempt and stays verbatim: a person's own words are the highest-value
input the method receives and the instrument has no standing to edit them.

**`summary` is required and may not be empty.** `aggregate` resolves it from `--summary`,
else `started.summary`, else the first paragraph of `<run>/report.md`, and refuses to write
a result without one; the validator refuses an empty string. An empty summary is not a
harmless blank - a consuming door that substitutes the subject's own description for it
shows a person the subject's blurb labelled as what the council concluded.

## The outcome, in order

1. `round_no > 3` -> **`stalled`**. The round cap is a refusal to run, read before anything
   the round produced.
2. any `hard_failures` -> **`fail`**.
3. any dimension floor hit with `advisory: false` -> **`fail`**.
4. any **scenario** floor hit with `advisory: false` -> **`fail`**. A perfect mean over a
   must-hold branch on the floor is the failure the per-scenario view exists to stop.
5. `coverage < 0.60` -> **`incomplete`**.
6. `trust_state == "trusted"` and (`overall` is null or `< 0.70`) -> **`fail`**.
7. otherwise -> **`ready`**.

Steps 3 and 4 both produce `fail`, so their relative order cannot change an outcome; it is
fixed anyway so two implementations report the same reason for the same document. A
scenario floor hit never touches `overall` or `coverage`: it is a branch of the value
dimension, not a dimension of its own, and counting it twice would be the defect the
bounded-member rule exists to prevent.

`advisory` is `true` exactly when a dimension whose rubric `kind` is not `mechanical` hits
its floor while `trust_state != "trusted"`. Mechanical floors are measurements and bind at
every trust state.

**There is no admitting outcome.** `ready` means "clean enough to put in front of a
person". The person admits, elsewhere, and what they saw when they did is recorded
separately from this file.

## Supersede, never rewrite

A second round writes a NEW run directory. The superseded `result.json` stays byte for
byte as it was, `supersedes_run_id` chains them, and a consumer displays the chain. A
verdict that can be edited after the fact is not a record of what was decided.
