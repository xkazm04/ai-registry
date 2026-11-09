# The generated-file contract

The registry publishes generated JSON views that other repositories parse at run time.
`registry.yaml` promises `compatibility: additive`: a field a consumer reads is never
dropped, renamed or retyped by accident. The contract makes that promise checkable.

- **Contract:** [`scripts/contracts/generated-fields.json`](../scripts/contracts/generated-fields.json),
  a committed, reviewed source file.
- **Checker:** `node scripts/check-generated-contract.mjs` (exit 0 clean, 1 violations,
  2 could not run).

## What it covers

One entry per generated file, keyed by a glob. Each declared field path has its JSON type
and the consumer projects known to read it:

```json
{ "schema": "generated-contract/1", "files": {
  "knowledge/*/index.json": { "fields": {
    "laws{}.techniques": { "type": "array", "consumers": ["personas"] },
    "subjects{}.applications[].refresh_by": { "type": "string", "optional": true, "consumers": [] }
  } } } }
```

| Glob | Generator |
|---|---|
| `catalog.json` | `scripts/build-catalog.mjs` |
| `knowledge/*/index.json` | `scripts/build-index.mjs` (one contract every bundle's index must satisfy) |
| `recipes/index.json` | `scripts/build-recipes-index.mjs` |
| `publications/index.json` | `scripts/build-publications-index.mjs` |
| `.claude-plugin/marketplace.json` | `scripts/build-marketplace.mjs` |

`rules/ai-registry-*.md` are generated too, but they are markdown read by agents, not JSON
parsed by code. They are out of scope for this field contract.

**Path notation.** Dotted keys; `[]` means every element of an array; `{}` means every value
of a map (an object keyed by data such as subject slugs): `subjects{}.techniques[].slug`,
`laws{}.techniques[]`, `skills[].invokes30d`. A declared `x{}` makes `x` a map and a declared
`x.key` makes it a record. For an object the contract has never classified, a key that is not
an identifier (for example `no-op`) or more than 30 keys makes it a map.

**Types.** `string`, `number`, `integer`, `boolean`, `object`, `array`, `null`, or a union
such as `number|null`. `number` accepts integers; `integer` accepts only whole numbers.

## Verdicts

| In the tree | Verdict |
|---|---|
| A declared path is absent | violation (1), names the consumers |
| A declared path is on only some of the objects that should carry it | violation (1) |
| A declared path has a type outside its union | violation (1), names the consumers |
| A declared path is absent because its container is empty everywhere (an empty array) | clean: vacuous, not a drop |
| A path marked `"optional": true` is absent or partial | clean. A wrong type still fails |
| A path in the file is not declared | note (0). Additive is allowed |
| A glob matches no file, or a generated file or the contract does not parse | could not run (2) |

`--self-test` plants a dropped `laws{}.techniques` in a temporary fixture and fails unless
the checker reports it with its consumer.

## How to add a field

Add it to the generator and regenerate. The checker prints a note for each new path. Then run:

```sh
node scripts/check-generated-contract.mjs --write
```

`--write` declares each undeclared path with its observed type and `"consumers": []`. A path
present on only some objects is declared `"optional": true`. `--write` never removes a path,
never edits a declared entry, and never touches a consumer list. A second run changes nothing.
Commit the contract change with the generator change.

## How to remove or change a field on purpose

A breaking change is a visible diff in the contract:

1. Read the field's `consumers`. If the list is not empty, update those projects first so
   they stop reading the field, or wait until their maintainers have done so. Then empty the
   list in the same change that records why.
2. Delete the path (or change its `type`) in the contract, in the same pull request as the
   generator change.
3. Run the checker. It must pass.

Never edit the contract only to silence a violation you did not intend. The violation means
code in another repository is about to break.

## How to refresh consumers

A consumer is named by its project slug from `projects.json` only. No path, file name or
code from the consumer goes into this repository.

1. On a machine with the consumer checked out, run the lead scan:

   ```sh
   node scripts/check-generated-contract.mjs --consumers <consumer checkout> --slug <slug>
   ```

   It lists the consumer's own source files (git's view, so build output and nested worktrees
   stay out). In each file that mentions a generated file, it finds field names that look like
   property access and that are not yet attributed to `<slug>`. It writes nothing. **This is a
   text scan, so a lead is not proof.** A field name like `path` or `name` matches almost
   anywhere.
2. Read the code behind each lead. Attribute a path only when you read the code that takes it,
   including a typed parser that validates it (a schema or a serde struct), since a retype
   breaks those too. Add the slug to the path and to each ancestor container that the read
   goes through (`subjects`, `subjects{}`, `subjects{}.techniques`, ...).
3. Run the checker and commit the contract.

The consumers recorded at seeding (2026-11-09) were found by reading the readers in
`personas` and `gravitone-gcloud`. Neither repository reads `publications/index.json` or
`.claude-plugin/marketplace.json` today: one reads each `publication.json` directly.
