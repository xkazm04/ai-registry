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
| `systemPrefix` | `shared/` | divergence, reachability |
| `metrics`, `replaceMetrics`, `palette`, `phantomClasses`, `phantomWeight`, `groups`, `mdColumns`, `cssWeight`, `sharedImport`, `contextMap`, `lowConfLoc` | see the header of `style-divergence.mjs` | divergence |
| `entry`, `aliases`, `resolveExtensions`, `floor` | see the header of `reachability.mjs` | reachability |

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
node reachability.mjs --repo <dir> [--entry src/main.tsx]... [--alias @=src]... [--floor 50] [--json]
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
node coverage.mjs status --ledger <file> [--next 10]
node coverage.mjs open-batch --ledger <file> --id b1 --modules a,b [--builders x,y]
node coverage.mjs gate --ledger <file> --id b1
node coverage.mjs close-batch --ledger <file> --id b1 --verdict approved|sent-back|mixed \
  --text "<owner's words>" [--approved a --sent-back b] [--commits sha,sha]
node coverage.mjs mark --ledger <file> --module a --status skipped [--reopen]
node coverage.mjs add-kit-part --ledger <file> --name DataGrid --api "<signature>" --batch b1
```

The ledger is the skill's memory across sessions and lives in the consuming project.
Exit 1 = refused (unknown module, illegal transition, missing verdict words); the file is
left untouched.

## family.py

```sh
python family.py --col "Current=shots/current/home" --col "A=shots/a/home" --out family/ [--views 1920x1080-dark]
```

One image per view with the columns side by side under a label strip. `--dry-run` lists
the plan without Pillow.
