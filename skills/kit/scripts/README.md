# kit instruments

Node builtins only (Node 20+); `family.py` needs Python 3 and Pillow. Every script prints
usage in its header comment. All four Node instruments group files into modules through
`lib/modules.mjs`, so a module name means the same thing in every output.

Pure halves are pinned by `node --test "skills/kit/tests/*.mjs"`.

## Shared config (`--config <file.json>`)

One JSON file may serve every instrument. Keys and defaults:

| key | default | used by |
| --- | --- | --- |
| `featuresRoot` | `src/features` | divergence, reachability |
| `extensions` | `[".tsx"]` | divergence, reachability |
| `exclude` | `__tests__\|\.test\.\|\.spec\.\|\.stories\.` (regex) | divergence, reachability |
| `grouping` | `sub` (feature/sub_x heuristic) or `depth:N` | divergence, reachability |
| `systemPrefix` | `shared/` (a string, comma list or array: the kit plus shared folders) | divergence, reachability, join (system rows never rank) |
| `metrics`, `replaceMetrics`, `palette`, `phantomClasses`, `phantomWeight`, `groups`, `mdColumns`, `cssWeight`, `sharedImport`, `contextMap`, `lowConfLoc` | see the header of `style-divergence.mjs` | divergence |
| `entry`, `entryGlob` (`next-app` preset or globs), `aliases`, `resolveExtensions`, `floor` | see the header of `reachability.mjs` | reachability |

`phantomClasses` is empty by default. A project derives it from its stylesheets: the
token-looking class names used in source that no stylesheet defines.

## style-divergence.mjs

```sh
node style-divergence.mjs --repo <dir> [--config kit.json] [--out <dir>] [--top 10] [--json | --csv]
```

Per module: weighted raw-style occurrences per 100 LOC (`score`), the same as occurrences
(`debt`), LOC, last commit, 30-day commits, per-metric counts. `--out` writes CSV, MD and JSON.

## reachability.mjs

```sh
node reachability.mjs --repo <dir> [--entry src/main.tsx]... [--entry-glob next-app]... [--alias @=src]... [--floor 50] [--json]
```

Walks the import graph from the entry; prints DEAD (no reachable file) and PARTIAL modules.
Exits 2 when fewer than `--floor` files were walked: a broken resolver, not a small app.

## join.mjs

```sh
node join.mjs --divergence <csv|json> --reach <reach.json> [--ledger coverage.json] \
  [--order debt|visibility|easy] [--visible a,b] [--status pending] [--out inventory.json]
```

The inventory: live modules ranked, dead ones listed after as routing questions.

## coverage.mjs

```sh
node coverage.mjs init --ledger <file> --inventory inventory.json
node coverage.mjs status --ledger <file> [--next 10] [--summary-every 3] [--all]
node coverage.mjs open-batch --ledger <file> --id b1 --modules a,b [--builders x,y] [--kind feature|kit]
node coverage.mjs gate --ledger <file> --id b1
node coverage.mjs close-batch --ledger <file> --id b1 --verdict approved|director-approved|sent-back|mixed \
  --text "<owner's words | Director's decision record>" \
  [--approved a --director-approved b --sent-back c] [--commits sha,sha] \
  [--decisions decisions.md]      # REQUIRED with director-approved: "1. ..." per decision
node coverage.mjs summary-gate --ledger <file> --id summary-1 --verdict approved|sent-back|mixed \
  --text "<owner's words>" [--batches b1,b2] [--approved a --sent-back b]
node coverage.mjs adopt --ledger <file> --id adopt-0 --text "<where the existing kit came from>"
node coverage.mjs mark --ledger <file> --module a --status skipped [--reopen]
node coverage.mjs mark --ledger <file> --module a --status done-outside --note "done-outside: <gate, sha>"
node coverage.mjs add-kit-part --ledger <file> --name DataGrid --api "<signature>" --batch b1
node coverage.mjs add-kit-part --ledger <file> --batch adopt-0 --parts kit-parts.json
node coverage.mjs add-kit-part --ledger <file> --name Carousel --declined --why "<owner's words>"
```

The ledger is the skill's memory across sessions and lives in the consuming project.
Exit 1 = refused (unknown module, illegal transition, missing verdict words, a declined
part proposed again without `--replace`); the file is left untouched. `director-approved`
is a Director's call awaiting a summary gate; only `summary-gate` (or an owner verdict)
moves it to `approved`. Ledgers written by 0.2.x read unchanged (schema 1; the new
status and fields are additive).

## family.py

```sh
python family.py --col "Current=shots/current/home" --col "A=shots/a/home" --out family/ [--views 1920x1080-dark]
```

One image per view with the columns side by side under a label strip. `--dry-run` lists
the plan without Pillow.
