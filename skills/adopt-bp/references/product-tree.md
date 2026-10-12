# Phase A - the product tree

You read `work/inventory.json` (one row per context: what it is, its files, lines, tests, entry points,
first/last commit) and write `work/product-tree.json`. You are naming the product as its users and
its team would talk about it, not restating the folder layout.

## Output (exact shape)

```jsonc
{
  "domains": [
    { "slug": "design-studio", "name": "Design Studio", "id": "DS", "summary": "One sentence: what a user does here." }
  ],
  "capabilities": [
    { "slug": "ability-design", "name": "Ability design", "domain": "design-studio", "id": "DS-AB", "summary": "..." }
  ],
  "features": [
    {
      "slug": "ability-blueprint-editor",          // ^[a-z0-9][a-z0-9-]*$, unique, stable: never rename on a rescan
      "name": "Ability blueprint editor",           // a user-facing name, sentence case
      "summary": "What it lets the user do, one or two sentences.",
      "capability": "ability-design",
      "contexts": ["ability-blueprint"],            // context names from the inventory, exactly
      "primary_context": "ability-blueprint",
      "kind": "user_flow",                          // user_flow | capability | integration | ops
      "tier": "major",                              // major | standard
      "stage": "live",                              // idea | specified | in-dev | in-review | flagged | live | deprecated
      "stage_evidence": "Mounted in the module router (src/...:41); 4 test files; last commit 2026-09-30",
      "stage_since": "2026-08-14",                  // optional, YYYY-MM-DD, only with evidence (a commit or a date in the code/docs)
      "surfaces": ["ui", "api"]                     // optional: ui | api | cli | worker | engine | data
    }
  ]
}
```

## Rules

1. **Shape.** 3-8 domains, 2-6 capabilities per domain, and features sized so one feature is something
   a person would put on a roadmap (roughly one to three contexts each). For a repo of N contexts,
   expect about N/3 to N/1.5 features. Group names in the inventory are a hint, not the answer.
2. **Coverage.** Every context belongs to at least one feature (a shared library context may belong
   to several). The merge refuses a tree that leaves more than 10% of contexts unowned. Infrastructure
   and tooling contexts get `kind: "ops"` features in an engineering-facing domain; test-only contexts
   join the feature they test.
3. **Stage is evidence, never a guess.** Decide it from the code, and say why in `stage_evidence`:
   - `live`: reachable by a user in the shipped app (mounted route/menu/command), working end to end.
   - `flagged`: reachable only behind a flag, an env var or an experimental toggle.
   - `in-review`: complete but on an open branch/PR or marked as awaiting review.
   - `in-dev`: partly built (stubs, TODO-heavy, not mounted, commits in the last weeks).
   - `specified`: a spec/doc/plan exists but little or no code. `idea`: only mentioned.
   - `deprecated`: still runs, but marked legacy/deprecated or superseded by another feature.
   Read the entry points and grep for where they are mounted before calling anything `live`.
   An API/service feature takes the stage of the surfaces that call it: if its only callers are in
   a deprecated shell, it is `deprecated` too, whatever its route handlers look like.
   A surface only exists if it renders.
4. **Slugs** match `^[a-z0-9][a-z0-9-]*$` (lowercase kebab, no dots), unique across features, and describe the feature, not the folder.
   Domain and capability `id` are short codes (domain <= 6 chars, capability <= 8) shown on the canvas.
5. **Names** are the product's own words (README, UI labels, menu titles), in sentence case.
6. Do not invent features the code does not have. Do not split one screen into five features.
7. **A feature is something a user or maintainer would put on a roadmap.** UI atoms, stores, caches
   and helper libraries are not features: they join the feature that uses them, or one
   "shared foundations" feature (`kind: "ops"`) per domain when several features share them.

Write the file, then run `node <skill>/scripts/adopt.mjs tree --root <repo>`. It refuses a broken
tree and names each problem; fix the file and rerun until it merges.
