# Phase B - judgement

Static metrics (size, tests, dependencies, secrets, unsafe sinks, raw colour literals) are already
measured. You add what only reading the code can tell: how well each feature follows good practice,
what is wrong with it, and what to do next. Each batch file `work/batches/NN.json` lists up to 8
features with their biggest files, entry points and static values. Write one result file
`work/judgement/NN.json` per batch (same number).

## Output (exact shape)

```jsonc
{
  "features": {
    "<feature slug>": {
      "development": { "dupSites": 2, "techDebt": 1,
                       "evidence": "Store logic duplicated in src/x/A.tsx:40 and src/x/B.tsx:88; no error boundary around the editor." },
      "security":    { "findingsCritical": 0, "findingsHigh": 0, "findingsMedium": 1, "findingsLow": 2,
                       "evidence": "API route src/app/api/x/route.ts:12 passes user input to fs.readFile without a path guard (medium)." },
      "design":      { "undesignedStates": 2, "status": "implemented", "a11y": "partial", "specDrift": false,
                       "evidence": "No empty state in src/x/List.tsx:20; error is a raw alert() at src/x/Form.tsx:55." }
      // a feature with no UI: "design": { "applicable": false }
      "quality":     { "flowTests": 3, "untestedPaths": 2, "brokenTests": 0,
                       "evidence": { "flowTests": "src/x/List.test.tsx:12 adds and removes an item", "untestedPaths": "...", "brokenTests": "..." } },
      "operations":  { "applicable": false, "reason": "build script, no runtime of its own" }
      // every lens in the batch's lenses[]: its metric fields, evidence per key (or one string), or applicable:false WITH a reason
    }
  },
  "proposals": [
    { "feature": "<slug>", "lens": "security", "metric": "findingsMedium", "title": "Guard the file path in the export route",
      "body": "## Summary\n...\n## Description\n...\n## Flow\n...\n## Expected impact\n...\n## Evaluation\nBefore 1 (this run), after 0 ...",
      "standard": "none", "expected_delta": -1, "size": "S", "risk": 3, "tier": 2, "risk_class": "authz" }
  ],
  "coverage": [
    { "feature": "<slug>", "lens": "development", "standard": "<subject>/<technique>", "state": "deviation", "evidence": "src/x/A.tsx:40" }
  ]
}
```

## How to judge

- **Read the code.** Open at least the two largest files and the entry point of every feature. A
  value you could not ground in a file you read is omitted, not guessed (absent = unmeasured).
- **Every lens, every feature.** For each feature in the batch, judge development and security, and
  design when it has a UI (otherwise `"design": { "applicable": false }`), and every lens in the batch's
  `lenses[]` (business, operations, quality, project lenses): follow that lens's `instructions` and
  only them, fill its listed metric fields, and mark it `applicable: false` with a one-line `reason`
  when the instructions say the feature has nothing for it. Proposals may name these lenses too, with
  one of their listed metrics (`flowTests` and `capacityUsers` are up-is-better: a positive delta). A lens you looked at and
  found clean gets explicit zeros (`"findingsCritical": 0` ...): zero is a measurement. Omit a key only
  when you did not look. `judge` prints per-lens coverage and warns on gaps.
- **Standards and coverage (this is where `standardsPct` comes from).** Each feature in the batch
  lists `standards`: the registry techniques that govern it (`<subject>/<technique>` and when it
  applies). For each one that touches a lens you judged, write one `coverage` row with that `lens`:
  `conformant`, `deviation`, `not-applicable` or `unknown`, with `file:line` evidence. `judge` derives
  `standardsPct = conformant / (conformant + deviation)` per feature and lens, exactly as /lens-scan
  does. Never write `standardsPct` yourself (it is ignored). A house rule in `.ai/house/standards/`
  counts the same as `house:<subject>/<line-id>` (lens-scan `references/house.md`). No standard listed
  and no house rule: write no coverage row and the metric stays unmeasured. Never invent a standard.
- `dupSites`: places where the same logic is copy-pasted (count of extra copies you saw).
- `techDebt`: 0 none, 1 some, 2 heavy, 3 severe.
- `findings*`: concrete problems you could point at with file:line, by severity. Critical = exploitable
  now with serious impact; high = exploitable under realistic conditions; medium = a missing guard;
  low = hygiene. A local developer tool with no network exposure rarely has a critical.
- `undesignedStates`: user-visible states with no designed treatment (loading, empty, error,
  overflow, disabled) in the feature's screens.
- **Choice fields.** Beside the numbers, set the lens's enum and boolean fields its manifest declares
  (bp `docs/standard/lenses/<lens>.json`): design `status` (none .. polished), `a11y` (unknown, fail,
  partial, pass) and `specDrift`; security `dataClass` and `review`; development `humanReviewed`.
  `judge` refuses a value outside the manifest's list. Stage, development `status` and `stalled` are
  derived, never judged.
- **Triage** on every proposal: `tier` 0 stop-ship, 1 before production, 2 soon after, 3 backlog, and a
  `risk_class` (secret, authz, money, data, llm, perf, reliability, ux, debt), as lens-scan's
  `references/triage.md` defines them. The review UI sorts by them; an untriaged item sinks.
- **Proposals** follow /lens-scan's contract, so the review UI and `/lens-scan execute` can take
  them: only for real problems you saw; each names the catalog `metric` it moves and by how much
  (`expected_delta` in the metric's unit, negative for `down`-is-better metrics; a fix that moves no
  metric is refused), a size `XS`..`XL` and a risk 1-10, and a body in five sections: **Summary /
  Description / Flow / Expected impact / Evaluation** (Before = the stored value, After = the
  expected one). `standard` is `none` unless a listed technique or house rule governs it. A rerun
  never re-proposes an item that is open or was declined.
- Be calibrated: count what you can point at, and rate severity by the definitions above, not by
  how the code feels. Most features have 0 critical and 0 high findings; a clean lens is all zeros.
- **Deprecated features** (stage `deprecated`): judge security only, `"design": { "applicable": false }`,
  and propose nothing but a security fix or the feature's removal. Code with no importer is a
  removal proposal, not a refactor.
- **Line numbers are checked.** Cite the line you read, not one you remember; a wrong line costs the
  reviewer more than no line.
- **Proposals are a review queue, not a census.** At most 2 per feature and about one per feature
  across the batch; keep the ones a maintainer would act on this month. A proposal's body cites at
  least one file by its full repo-relative path with a line (`src/app/api/x/route.ts:12`), never a
  bare file name - bare names are ambiguous in a large repo.

When every batch has a result, run `node <skill>/scripts/adopt.mjs judge --root <repo> --model <your model id>`.
It refuses out-of-range values and unknown slugs by name; fix and rerun (a rerun appends a new run;
the map keeps the latest values).

**Fan out when you can.** Batches are independent: if your harness has subagents, judge batches in
parallel (one subagent per 1-3 batches) and give each this file plus its batch files. If it has none,
judge them in order, biggest first (batch 01 holds the largest features).
