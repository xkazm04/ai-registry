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
      "development": { "standardsPct": 72, "dupSites": 2, "techDebt": 1,
                       "evidence": "Store logic duplicated in src/x/A.tsx:40 and src/x/B.tsx:88; no error boundary around the editor." },
      "security":    { "findingsCritical": 0, "findingsHigh": 0, "findingsMedium": 1, "findingsLow": 2, "standardsPct": 85,
                       "evidence": "API route src/app/api/x/route.ts:12 passes user input to fs.readFile without a path guard (medium)." },
      "design":      { "undesignedStates": 2, "standardsPct": 70,
                       "evidence": "No empty state in src/x/List.tsx:20; error is a raw alert() at src/x/Form.tsx:55." }
      // a feature with no UI: "design": { "applicable": false }
    }
  },
  "proposals": [
    { "feature": "<slug>", "lens": "security", "metric": "findingsMedium", "title": "Guard the file path in the export route",
      "body": "Why and how, 2-4 sentences, with file:line.", "standard": "none", "expected_delta": -1, "size": "S", "risk": 3 }
  ],
  "coverage": [
    { "feature": "<slug>", "standard": "house:errors/boundaries", "state": "deviation", "evidence": "file:line" }
  ]
}
```

## How to judge

- **Read the code.** Open at least the two largest files and the entry point of every feature. A
  value you could not ground in a file you read is omitted, not guessed (absent = unmeasured).
- **Every lens, every feature.** For each feature in the batch, judge development and security, and
  design when it has a UI (otherwise `"design": { "applicable": false }`). A lens you looked at and
  found clean gets explicit zeros (`"findingsCritical": 0` ...): zero is a measurement. Omit a key only
  when you did not look. `judge` prints per-lens coverage and warns on gaps.
- `standardsPct` (0-100): the share of the practices that apply to this feature that it follows. For
  development: typing, error handling, separation of concerns, no dead code, naming, tests for logic.
  For security: input validation at boundaries, authz on routes, no secrets, safe sinks, safe
  file/process/SQL access. For design: tokens instead of literals, loading/empty/error states,
  keyboard access, labels, the 12 px text floor.
- `dupSites`: places where the same logic is copy-pasted (count of extra copies you saw).
- `techDebt`: 0 none, 1 some, 2 heavy, 3 severe.
- `findings*`: concrete problems you could point at with file:line, by severity. Critical = exploitable
  now with serious impact; high = exploitable under realistic conditions; medium = a missing guard;
  low = hygiene. A local developer tool with no network exposure rarely has a critical.
- `undesignedStates`: user-visible states with no designed treatment (loading, empty, error,
  overflow, disabled) in the feature's screens.
- **Proposals:** only for real problems you saw. Each names a metric it moves and by
  how much (`expected_delta`, negative for `down`-is-better metrics), a size `XS`..`XL` and a risk 1-10.
  `standard` is `none` unless you are applying a named registry technique (`<subject>/<technique>`)
  or house rule (`house:<subject>/<rule>`).
- **Coverage:** optional; one row per standard you checked explicitly.
- Be calibrated, not anchored: score what you saw. 90+ means you found nothing to fault in a feature
  you read closely; under 60 means several practices are clearly missing. Most features have 0
  critical and 0 high findings.
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
