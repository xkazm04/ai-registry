# The registry lens - one product against this registry, feature by feature

bp measures a product feature by feature through lenses. The registry lens
(`com.xkazm04.registry`) asks one question per feature: **how far does this registry
govern it, and what has the product sent back?** Two scripts serve it:

- [`scripts/registry-lens.mjs`](../scripts/registry-lens.mjs) measures. It is the
  `script` step of the lens's composed scan, and prints the lens-scan steps row contract
  `[{feature, metric, value, evidence?, applicable?, reason?}]` and nothing else. It never
  writes.
- [`scripts/register-project.mjs`](../scripts/register-project.mjs) connects a product.
  It is what the lens's "register the project" backlog item runs when someone approves it.

```sh
node scripts/registry-lens.mjs --project <slug> --path <root> [--structure <file>] [--features a,b] --json
node scripts/register-project.mjs --slug <slug> --path <root> [--domains a,b] [--dry-run]
```

## Unmeasured is not a pass, and not a zero

Three different states have to stay three different things:

| State | What the rows say |
| --- | --- |
| **Unmeasured** - nobody has joined this product to the registry | the per-feature metric rows are **omitted**. bp reads an absent value as unmeasured. |
| **Not touched** - no context holds the feature's code | one row `{feature, applicable: false, reason}` and nothing else for that feature. |
| **Measured** | a row per metric, with a value and the evidence it came from. |

A pair whose `state` is `unknown` is **mapped, not judged**. It counts toward
`topicsMapped` and never toward `judgedPct` or `conformantPct`: a pair nobody has read the
code against is not evidence of conformance, and a lens that read it as a pass would
report a product as governed on the day it was registered. `/conform` is the only thing
that turns `unknown` into a verdict.

## How the join works

The registry map (`<root>/.ai/registry-map.json`, built by
[`build-registry-map.mjs`](../scripts/build-registry-map.mjs)) is per **context**: one row
per context, each carrying the subjects that govern it as context-subject pairs. bp
measures per **feature**. The join between them:

1. **A feature's files** are the `file_paths` of the structure contexts the feature names
   in `<root>/.ai/lens-scan/app-structure.json` (adopt-bp's v3 structure; `--structure`
   names another file).
2. **The contexts** are every context in the product's full `<root>/context-map.json`,
   keyed exactly as the map builder keys them (the context's `id`, else
   `<group>/<name>`).
3. A directory entry on either side is expanded to the tracked files under it
   (`git ls-files`; a tree walk outside a git checkout).
4. **A context claims a feature when the two file sets overlap at all.** One shared file
   is enough: the feature's code lives partly in that context, so the standards governing
   that context govern part of the feature.
5. The feature is measured over the map rows of every claiming context. A claiming context
   the map has never seen is named in the evidence and left out of the counts.

Pairs are deduplicated on (context, subject). The same subject governing two of a
feature's contexts is two pairs, because conformance is judged per pair: the payments
context can conform to a standard the cart context deviates from.

## The metrics

Per feature, from the registry map (omitted when there is no map):

| Metric | Means | Better |
| --- | --- | --- |
| `topicsMapped` | distinct context-subject pairs over the feature's contexts | up |
| `judgedPct` | pairs whose `state` is not `unknown`, as a percent of `topicsMapped` (one decimal); omitted when there are no pairs | up |
| `conformantPct` | `conformant` pairs as a percent of `conformant` + `deviation` pairs (one decimal) - the pairs the subject actually governs. `not-applicable` (the matcher's miss, not the product's shortfall) and `unknown` are excluded; omitted when that denominator is 0 | up |
| `deviations` | pairs judged `deviation` - the lens's backlog | down |
| `staleVerdicts` | pairs whose verdict was judged against a subject that has since moved (`stale: true` or `revisionsBehind > 0`) | down |

The evidence on each names the claiming contexts and up to five of their subjects.

Per project, the same value on every feature row, with evidence starting `project-level:`:

| Metric | Means |
| --- | --- |
| `registered` | 1 when `projects.json` declares a checkout for this machine that resolves (through `scripts/lib/projects.mjs`) to `--path`, else 0. Omitted when the registry checkout has no `.machine.local.json`, because then nothing can resolve. |
| `leadsFiled` | lines in `<root>/.ai/registry-leads.jsonl` - knowledge leads the product has sent back (0 when the ledger is absent) |
| `leadsLanded` | rows of `librarian/inbox.md` carrying `LANDED` whose `from` column starts with `<slug> /` - leads the librarian turned into registry content |
| `appliedBetter` | lines of `<root>/.ai/applied.jsonl` whose `verdict` is `better` - registry techniques the product applied and measured as an improvement |

A feature that is `applicable: false` carries none of these: the lens does not touch it.

## Registering a project

`register-project.mjs` makes the three writes that connect a checkout, in order, and only
the ones still missing:

1. `projects.<slug>.checkouts.<this machine>` in `projects.json`, as a path relative to the
   machine root from `.machine.local.json`. The file keeps its formatting and key order.
2. `<root>/.ai/manifest.yaml`, **in the product repo**, only when absent: schema,
   `registry.local` (relative path to the registry's main checkout, never a worktree),
   `knowledge.domains` (`--domains`, default `software-engineering`), empty `skills`. An
   existing manifest is never rewritten; it is the authority on its domains.
3. `<root>/.ai/registry-map.json` through `build-registry-map.mjs --project <slug> --path
   <root>`, only when absent.

Then it runs `check-projects.mjs` and reports.

It refuses, before any write, when the registry checkout has uncommitted changes
(`register-project refused: registry checkout has uncommitted changes`), when the slug
already points at a different checkout or another slug at this one, and when the checkout
sits outside the machine root. A second run says `already registered` and writes nothing.
`--dry-run` prints every write it would make and makes none.

Both scripts exit 0 on success and 2 (`FATAL`, [`scripts/lib/exit-codes.mjs`](../scripts/lib/exit-codes.mjs))
with a one-line reason on bad input or a refusal.
