# recipes/ - craftsman knowledge

One directory per **recipe**: the best current knowledge of how one kind of work is done
well, written so any agent can hold it, run it, and improve it.

```
recipes/
└── <domain>/
    └── <topic>/
        └── <slug>/
            ├── recipe.json     # the machine object (Recipe v3)
            ├── RECIPE.md       # the rendered human view
            ├── LESSONS.md      # append-only, one block per run
            └── examples/       # one file per concrete connector
recipes/index.json              # GENERATED - slug to path, version, status, connector types
```

The format contract is [`docs/recipes-lane.md`](../docs/recipes-lane.md). The gate is
`node scripts/check-recipes.mjs`. The index is
`node scripts/build-recipes-index.mjs` (`--check` in CI).

## A recipe is mastery, not configuration

| | Recipe (here) | Charter (adopted instance, in the consuming app) |
| --- | --- | --- |
| owns | need, input, core action, output, activities, outcomes, guidance, connector TYPES, recommended trigger, personalization needs, dependencies, examples | bound connectors, assigned trigger and cadence, credentials, budget, scope, approval gates, persona memory |
| changes by | a version bump plus a `LESSONS.md` entry, by pull request | edits in the app; lessons in the charter's memory |
| never carries | a connector id, a cron, a persona | a general lesson somebody else would want |

Everything that binds a recipe to one installation happens at **adoption**. That is why
a recipe names `analytics` and not `plausible`, `time` and not `0 9 * * 1`. The concrete
connector knowledge is not lost - it lives in `examples/`, where a reader looking for it
knows to find it.

## What is here

133 recipes, all `seed`, across ten domains and forty-six topics. The authoritative
list is [`index.json`](index.json), which is generated; this table is the shape of it.

| Domain | Recipes | Topics |
| --- | --- | --- |
| `software_engineering` | 42 | 10 |
| `sales_marketing` | 19 | 4 |
| `creative_design` | 13 | 5 |
| `general_professional` | 13 | 5 |
| `finance_accounting` | 12 | 4 |
| `legal_compliance` | 9 | 4 |
| `customer_support` | 8 | 4 |
| `data_ai` | 8 | 3 |
| `product_project` | 5 | 3 |
| `operations_logistics` | 4 | 4 |

A count in prose goes stale the first time somebody adds a recipe and does not read this
far. `node scripts/build-recipes-index.mjs` prints exactly these figures, so the way to
correct this table is to run it rather than to guess.

**The lane was declared ahead of its corpus, on purpose.** It opened on 2026-09-06 with
its spec, its gate, its index builder and one worked example, and nothing else: the
corpus migrated from the consuming application afterwards, once the operator had reviewed
it. That first example was not decoration. A lane declared with nothing in it is a
promise, the gate would have had nothing to check and the index nothing to index, and
both would have reported green over an empty tree for however long the approval took.

## Adding a recipe

1. Pick the `<domain>/<topic>` it belongs under. Neither level may hold more than ten
   child directories - subdivide above ten, collapse back only at six or below.
2. Write `recipe.json` against the field list in
   [`docs/recipes-lane.md`](../docs/recipes-lane.md).
3. Render `RECIPE.md` from it. The five frontmatter keys must equal their JSON twins;
   the gate compares them.
4. Seed `LESSONS.md` with the format and no entries.
5. Add `examples/<connector>.md` for each concrete connector the recipe has real
   knowledge about.
6. `node scripts/check-recipes.mjs` then `node scripts/build-recipes-index.mjs`, and
   commit the regenerated index.

## Improving one

A recipe improves from two directions and they must not be confused.

- **Charter memory** keeps the lessons specific to one adoption: this operator's sheet
  layout, this account's rate limit, this team's approval step. They stay in the app.
- **A lesson that generalizes** arrives here as a pull request: a version bump plus a
  `LESSONS.md` entry. Propose only, human adopted, the same door as every other write.

The test for which one a lesson is: would an agent in a different organization, holding
this recipe against a different connector, be better off knowing it. If it names a
credential, an account, a file path or a person, it is charter memory.
