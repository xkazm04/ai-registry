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

  "overall": 0.0 | null,                // null when nothing was measured
  "coverage": 0.0,
  "outcome": "ready" | "fail" | "incomplete" | "stalled",
  "must_address": ["<one line of work per entry>"],
  "summary": "<the synthesis in a paragraph>"
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

## The outcome, in order

1. `round_no > 3` -> **`stalled`**. The round cap is a refusal to run, read before anything
   the round produced.
2. any `hard_failures` -> **`fail`**.
3. any floor hit with `advisory: false` -> **`fail`**.
4. `coverage < 0.60` -> **`incomplete`**.
5. `trust_state == "trusted"` and (`overall` is null or `< 0.70`) -> **`fail`**.
6. otherwise -> **`ready`**.

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
