# adjust.md - onboard Wolf and Lynx to the 2026-10-25 registry structure

**Who runs this:** an agent session on **Wolf** (primary) and one on **Lynx**. Each runs it
once, in that machine's own registry checkout, after the commits from branch
`worktree-spark-registry-self-scan` have reached `origin/main`. Fox (the secondary box)
built that branch and is already adjusted.

**How to run it:** top to bottom. Every step names a command and the result to expect. If
the result differs, stop, say which step and what you saw, and do not improvise a fix.
`<registry>` means this checkout's absolute path. `<fleet root>` means the folder the
machine's projects hang off.

**When done:** report per step `ok` / `changed` / `blocked`. Delete this file only after
both Wolf and Lynx report ok, in a commit of its own.

---

## What changed, in one screen

- **One place for machine identity: `.machine.local.json`.**
  - `projects.json` is committed and portable. Per machine it carries a `note` and nothing
    else. Per project it holds checkout paths *relative to* each machine's root.
  - The machine's name, its **absolute root**, an optional contributor id and optional
    `overrides` live only in the gitignored `.machine.local.json` at the registry root.
  - A `root` under `projects.json` `machines.<name>` is a gate failure ("root belongs in
    .machine.local.json"). The fleet map used to say the opposite; that was fixed in ac7e4329.
- **Query front door.** Agents no longer read or slice `knowledge/<domain>/index.json`
  (about 400K tokens). They query first, with the `registry_query` MCP tool or
  `node scripts/registry-query.mjs "<the decision>"`, then open only the document a hit
  names. See [docs/query-lane.md](docs/query-lane.md).
- **Stricter gates.** `gate.mjs --all` is now 26 steps, and several gates got stricter;
  step 4 lists what can newly go red on local work.
- **Version discipline runs on every push**, not only on pull requests. Main stays
  unprotected by design: agents push directly.
- **Most CLIs now refuse unknown flags** (exit 2) instead of silently running their
  default, which was often a write.
- **Opt-in merge driver** for generated files (catalog, indexes, rules, marketplace).

---

## 0. Preconditions

```sh
node -v          # >= 20 required (CI pins 20); 24 runs every test (node:sqlite, type stripping)
git -C <registry> status --short
```

Expect a clean tree. If there is uncommitted work, commit it first (per file, never
`git add -A`), or ask the operator. Never stash: other sessions share this checkout.

## 1. Update the checkout

```sh
git -C <registry> fetch
git -C <registry> pull --ff-only
```

If `--ff-only` refuses, local main has diverged. Run `git pull --no-rebase` and resolve.
After step 5 (merge driver) generated files no longer need hand resolution. Before it,
resolve generated files by regenerating: `node scripts/build-index.mjs`, then
`node scripts/build-knowledge-rules.mjs`, `node scripts/build-marketplace.mjs` and
`node scripts/build-catalog.mjs`, in that order.

## 2. Machine identity: `.machine.local.json`

This is the step the new wording is about. The file must exist at the registry root, be
gitignored, and name this machine exactly as `projects.json` does (`Wolf` or `Lynx`).

```json
{
  "_note": "This machine's identity. Gitignored. Resolve through scripts/lib/projects.mjs.",
  "machine": "Wolf",
  "root": "<fleet root, absolute>",
  "contributor": "<optional; derived from the machine name when absent>",
  "overrides": { "<project slug>": "<absolute path, only for a checkout outside the root>" }
}
```

Check, in order:

```sh
git -C <registry> check-ignore -v .machine.local.json      # must print the **/.*.local.json rule
node -e "import('./scripts/lib/projects.mjs').then(m=>{const f=m.loadFleet(process.cwd());console.log(JSON.stringify({machine:f.machine,contributor:f.contributor,source:f.source,problems:f.problems},null,1))})"
node scripts/check-projects.mjs                             # exit 0
```

Expect:
- `machine` is this machine's name, and `source` is `projects.json`.
- `problems` holds at most "checkout not found" lines for projects not cloned here. That is
  information, not an error.

Fix by moving, never by copying:
- **`problems` says "no .machine.local.json"**: create the file from the shape above.
- **It says `.projects.local.json is the legacy bridge`**: move that file's machine name,
  root and overrides into `.machine.local.json`, then delete the legacy file.
- **`check-projects` reports "root belongs in .machine.local.json"**: delete the `root` key
  from `projects.json` `machines.<name>`, and keep the value in `.machine.local.json`.
- **A project this machine has is missing from `projects.json`**: add a relative checkout
  under `projects.<slug>.checkouts.<machine>`, e.g. `"Wolf": "dolla/pof"`. It must be
  relative to the root, with no drive letter and no `..`.

`projects.json` must never contain an absolute path. `check-public-paths` now scans it,
including free-text notes.

## 3. MCP server: the query front door for every project on this machine

```sh
claude mcp add --scope user ai-registry -- node <registry>/scripts/registry-mcp.mjs
claude mcp get ai-registry                                  # Status: Connected
node scripts/registry-query.mjs "deciding whether a green audit means accessible" --top 3
```

The last command should rank `software-engineering/accessibility/a11y-verification` first.
The first query builds a gitignored cache in `.cache/registry-route/`, which takes about 7 s.
`claude mcp list` should show `ai-registry` connected. A new session in any project then
has `registry_query`, `registry_read`, `registry_subject` and `registry_ledger`.

## 4. Gate - expect 26/26

```sh
node scripts/gate.mjs --all
```

Never pipe the gate into `tail`: the pipe swallows the exit code. A red step on this
machine is most likely local data the stricter gates now see:

| step | newly catches | fix |
|---|---|---|
| `check-public-paths` | machine paths in `projects.json`, `usage/`, `signals/`, plus lowercase `c:\users\..`, WSL `/mnt/<d>/Users/..`, `%USERPROFILE%`, `$HOME/`, home-relative paths | remove the path; keep machine roots in `.machine.local.json` only |
| `check-usage` / `check-signals` / `check-runs` | stray non-`.json` files in `usage/` and `signals/`; path forms in run-log comments | delete the stray file; scrub the comment |
| `check-bundles` | a technique with no `use_when`; evidence keys in any knowledge frontmatter or JSON; a subject folder holding anything but its golden path, `techniques/` and `applications/`; malformed frontmatter | fix the document; `use_when` is what the query front door ranks on |
| `check-run-results` (new) | a `librarian/runs/**/result.json` that fails its schema | fix the result; the 15 historic ones are grandfathered in `librarian/runs/.grandfathered.json`, a list that may only shrink |
| `check-simple-lanes` / `check-publications` | misnamed notes (`.MD`, `practice.md`); drafts in dot-folders | rename or remove |
| `run-tests` | now runs every test file in the repo, including lane skills' tests | a `could-not-run: <file> (<dep> absent)` line is information, not a failure |
| `context-map.test` | a code file under `scripts/` or a lane skill's `scripts|tests|tools` that `context-map.json` does not claim | add the file to its context in `context-map.json`, in the same commit as the file |
| `check-coverage-age` | `librarian/fleet-coverage.md` older than 14 days | Wolf only, step 7 |

## 5. Merge driver for generated files (recommended on both)

```sh
node scripts/install-merge-driver.mjs --install
node scripts/install-merge-driver.mjs --check               # driver + post-merge/post-rewrite/post-commit hooks present
```

After this, a merge keeps our side of `catalog.json`, the bundle indexes, `rules/` and the
marketplace. A post-merge hook then regenerates them from the merged sources and commits
only those paths. Without the installer, git falls back to today's text merge, so nothing
breaks. Details: [docs/merge-driver.md](docs/merge-driver.md).

## 6. Scheduled jobs and hooks that call registry scripts

Most CLIs now exit 2 on an unknown flag or a flag missing its value, where they used to
ignore it and run their default. List what runs unattended on this machine:
- the Task Scheduler
- git hooks in other projects (the consult hook)
- the transcript-mirror hook
- Personas Dev Tools calls

For each invocation, run the same command once by hand and confirm it does not exit 2.
Changed scripts include:
- link-registry, build-registry-map, converge (`--only` phases are now checked)
- register-project, check-context-coverage
- runs-backfill, transcript-mirror, process-sessions, agent-cost-band, leads-collect
- signals-collect, usage-from-personas, runs-report, measure-large-reads, telemetry-report
- hygiene-scan, hygiene-disk, build-fleet-map

`--contributor X` and `--contributor=X` are both accepted now. Before, the space form
silently wrote the machine's own contributor file.

## 7. Machine-specific

### Wolf (primary: the only machine that sees the whole fleet)

Fox regenerated `librarian/fleet-coverage.md` on 2026-10-25 so the age gate would stay
green. That copy is partial: 13 projects declared, 5 not checked out on Fox. Wolf owns the
real one, and `librarian/fleet-map.json` / `.md` still carry the old wording until Wolf
regenerates them.

```sh
node scripts/build-fleet-map.mjs                            # writes librarian/fleet-map.json + .md
node scripts/converge.mjs --only report                     # writes librarian/fleet-coverage.md only
node scripts/check-coverage-age.mjs                         # 0 days old, Fresh, machine: Wolf
node scripts/check-public-paths.mjs                         # exit 0
git -C <registry> diff --stat                               # only the three librarian files
git -C <registry> commit -m "librarian(fleet): regenerate fleet map and coverage on the primary machine" -- librarian/fleet-map.json librarian/fleet-map.md librarian/fleet-coverage.md
```

The fleet map's `_note` and the `fleet-map.md` intro should now name `.machine.local.json`.
Then push.

### Lynx (third box: Windows on ARM64, local media-model bench)

- Steps 0-6 as written.
- In step 4, read `run-tests`' `could-not-run` lines. Report which optional runtimes are
  missing on ARM64 (`node:sqlite`, type stripping, `zod` for demo-film) so the operator
  knows what this box cannot verify.
- Do not regenerate the fleet map or coverage here. Lynx sees only part of the fleet.

## 8. Behaviour changes your agents should know (no action)

- **AGENTS.md** says to query first. The `consult` skill (1.7.0) routes through
  `registry-query` / `registry_query`.
- **/hygiene** treats a scratch clone whose only proof of being landed is a remote-tracking
  ref as an operator row, not a delete. Nothing in the disk lane uses the network.
- **Version check:** before pushing a skill or recipe change, run
  `node scripts/check-skills.mjs --since origin/main` (and `check-recipes`). That form also
  checks uncommitted work; `--since HEAD` alone used to check nothing.
- **Shell heredocs:** write files with the file tools, not heredocs. Backslashes in regexes
  and Windows paths get eaten (seen four times on 2026-10-25).

## 9. Report

One line per step: `ok` / `changed: <what>` / `blocked: <what you saw>`. Commit only what
step 2 or step 7 changed, each with its own pathspec commit.

When both machines report ok, the operator deletes this file.
