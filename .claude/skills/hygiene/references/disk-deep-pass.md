# Disk deep pass

`hygiene-disk.mjs` keeps the scratch root, stale cargo `incremental/` and temp in check
every morning. A **deep pass** is for the day the drive is nearly full anyway: it measures
every development pool on the machine with an outside analyzer, then reclaims what
regenerates, through each tool's own command. First run 2026-10-22: 54 GB free -> 158 GB
with analyzer-found pools, then -> 546 GB once the growth walk (step 0) found what no rule
knows about.

## 0. Find what grew: the growth walk (start here)

Analyzer rules know only the pools they were written for. On 2026-10-22 MangoDisk's rules
covered about 100 GB, while 465 GB more sat in folders no rule names. Measure the growth
first, from the last date the drive had the free space you expect (the `disk-growth-sources`
memory records each sweep's result):

```
node .claude/skills/hygiene/tools/growth-walk.mjs walk 'C:\' <since YYYY-MM-DD> <scratch>/growth.json
node .claude/skills/hygiene/tools/growth-walk.mjs report <scratch>/growth.json
node .claude/skills/hygiene/tools/growth-walk.mjs report <scratch>/growth.json 'Users\kazda\AppData\Local'
```

The C: walk takes about 20 minutes for 11 million files, so run it in the background. It
totals all bytes and bytes changed since the date, five levels deep. To see below that, walk
a subfolder as its own root (Temp: 45 s). Separately, check the virtual disks (`*.vhdx`
under `AppData/Local/Packages`, `Docker`) and the root `pagefile.sys`/`hiberfil.sys`: they
are files, and they do not shrink by themselves.

Recurring growth families found 2026-10-22 (all were deleted on operator approval):

| family | size | how to recognise it |
|---|---|---|
| a spike's local model store (`~/.athena-avatar/models` + `venvs`, InfiniteTalk/Wan2.1) | 202 GB | a new dot-folder under the home dir with `models/`; the operator wants no local models, so always ask |
| Personas headless orphans (`~/.personas/headless-masters/worktrees/<project>/<hash>`) | 145 GB | no `.git`, absent from `git worktree list --porcelain` of the project, each holding a 10-16 GB `target/` |
| out-of-tree cargo target beside the fleet (`kiro/paypal-belay-target`) | 63 GB | `kiro/<name>-target`, `kiro/.<name>-target` |
| cargo builds inside Claude session scratchpads (`Temp/claude/<proj>/<session>/scratchpad/target`, `cpa/target`, `target-mut`) | 28 GB | `target*` folders under a scratchpad |
| per-wave git-archive exports in a scratchpad (`w<N>-export`, `w<N>-tsc`, `final-*`, `merged-*`) | 15 GB | 0.6 GB copies of the repo, one per wave |

Check registration in node, comparing against the `--porcelain` paths. `grep -i` against a
variable aborted with exit 134 here, which silently skipped the check.

Run it under the same claim as `/hygiene disk` (`/hygiene disk deep`). It is a director
task. No workers.

## 1. Analyzer: MangoDisk CLI (read-only)

Installed 2026-10-22 from release v1.2.0 (GPL-3.0, github.com/harry0703/MangoDisk). The
binaries are signed by Apowersoft Ltd and the CLI crate has no network code.

| what | where |
|---|---|
| CLI | `C:/Users/kazda/tools/mangodisk-cli/mangodisk.exe` |
| GUI (portable, for the operator) | `C:/Users/kazda/tools/mangodisk-gui/MangoDisk-1.2.0-windows-portable.exe` |
| source, for reading rules | `C:/Users/kazda/tools/MangoDisk-src` (shallow, tag v1.2.0) |

Upgrade: `gh release download <tag> -R harry0703/MangoDisk -p '*windows-cli.exe'` into a
fresh folder, compare `sha256sum` with the release asset digest, check
`Get-AuthenticodeSignature`, then copy it over `mangodisk.exe`. Never use `irm | iex`.

```powershell
& C:\Users\kazda\tools\mangodisk-cli\mangodisk.exe --format json --include-full-paths `
  --no-progress clean --deep-project-discovery > <scratch>\mango-scan.json
```

About 7 minutes on the 2 TB drive. A plain `clean` (no `--apply`) never changes a file.
The JSON starts with a BOM, so strip `\uFEFF` before `JSON.parse`. `data.rules[]` carries
`ruleId`, `bytes`, `risk`, `recommendedSelected`, `runningProcesses` and `sources[]`
(`path`, `bytes`, `modifiedAtMs`). Sort the rules by bytes, then sort each big rule's
sources. Write the summarizer as a script file, not `node -e`: bash eats the
backslashes in Windows-path regexes.

**Never `mangodisk clean --apply` from hygiene.** The CLI selects only `recommended` or
`all`. `recommended` includes browser, game and app caches while those apps run, and
the `project.*` rules delete a whole `target/` or `node_modules` with no liveness check.
Use MangoDisk to measure, and our own gates to delete.

## 2. Reclaim, in this order

Each step re-checks liveness immediately before it acts. A deletion goes through
`scripts/lib/safe-remove.mjs` (`removeTree`, which never follows a junction) or through
the owning tool's own prune command.

| pool | gate | how | 2026-10-22 |
|---|---|---|---|
| cargo `target/debug/incremental` in fleet checkouts | no `cargo`/`rustc` process (Win32_Process command lines); crate dir and its files idle 60 min | `removeTree` per crate dir | 73.3 GB |
| Unreal `Intermediate/` in idle worktrees | worktree clean, 0 commits off the remotes, nothing written in 48 h | `removeTree` on `Intermediate/` only; keep the worktree | 26.2 GB |
| uv cache `.tmp*` folders | idle 24 h (abandoned unpacks) | `removeTree` | 8.4 GB |
| pip cache | - | `pip cache purge` | 5.2 GB |
| pnpm store | - | `pnpm store prune` | 2.4 GB |
| npm cache | - | `npm cache clean --force` (clears `_cacache` only; `_npx`, ~4 GB, stays - measured after the clean) | ~9 GB |
| uv cache proper | no `uv.exe` running, because the prune waits on the cache lock (a 300 s timeout hit a live `uv run pytest`) | `uv cache prune` | skipped |

## 3. Operator only - list, never delete

- A whole `target/` or `deps/` in a fleet checkout. It costs a full rebuild in a checkout a
  session may be building in. On 2026-10-22 there were paypal 37 GB deps, overlord 47 GB
  (a `cargo test` was running) and personas 15 GB deps older than 7 days.
- `target/` under `AppData/Roaming/com.personas.desktop/worktrees/`, about 14 GB. The
  Personas app owns these.
- WSL `ext4.vhdx` (Ubuntu, 44 GB) and Docker (21 GB). They shrink only by compacting,
  which needs `wsl --shutdown` and stops every distro.
- `.android` AVDs (8.6 GB), Playwright browser versions (5-6 GB), Gradle version caches.
- `node_modules` in projects that are not in the fleet and have been untouched for months
  (MangoDisk's `project.node-build-artifacts` sources, sorted by `modifiedAtMs`).

Deleting a step 0 family takes an operator answer per family. Then run it from a
`<idleHours> <path>` list through `removeTree`, which re-measures the newest file of each
path and keeps anything inside its floor (models 24 h, orphans 6 h, build output 2 h), and
log every row to `<plan dir>/deep-applied.jsonl`. List directories explicitly: a `merged-*`
glob also matched a sibling `.txt` file.

Report free space before and after, and GB per pool. Append a LESSONS entry when a pool
grows by a new family.
