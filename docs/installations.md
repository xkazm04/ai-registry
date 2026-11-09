# Installing selected skills

Choose a project, harness and installation mode explicitly. The installer never scans
or relinks the fleet. Existing unowned skill directories are preserved and reported.
Run these commands from the registry checkout, substituting your project path.

```sh
node scripts/install-registry.mjs --project <project> --harness codex --mode release --skills consult --revision <commit>
node scripts/install-registry.mjs --project <project> --harness codex --check
```

Codex discovery uses `.agents/skills/<name>`; Claude uses `.claude/skills/<name>` with
`--harness claude`. Both adapters link to a selected directory. Windows uses junctions.
The [Codex documentation](https://learn.chatgpt.com/docs/build-skills) describes its
skill discovery and loading of the selected `SKILL.md`. Root instructions still come
from the consuming project's own `AGENTS.md` or harness equivalent.

| Mode | Target | What changes it |
| --- | --- | --- |
| `release` | Project-local snapshot of committed skill files under `.ai/registry-releases/<commit>/` | Explicit install with `--update --revision <commit>` |
| `development` | Source skill directory in this checkout | Working-tree edits immediately affect every link to it |

Release snapshots include supporting files from git, never untracked local files.
Use the previous commit with `--update` to roll back. Updating requires selecting every
previously managed skill for that harness. Edited release snapshots block updates;
preserve and resolve those edits before retrying. The installer prepares all snapshots
before switching discovery links and rolls back ordinary switching failures. An OS crash
or concurrent installer is outside that guarantee; do not run installers concurrently.

The local `.ai/registry-installation.local.json` receipt records mode, source revision,
skill versions, targets and declared capabilities. Keep this receipt and snapshots
out of the consuming project's git history: ignore `.ai/registry-installation.local.json`,
`.ai/registry-releases/` and `.ai/skill-runs.local.jsonl` (the local half of the skill run
log - see [runs-lane.md](runs-lane.md); the registry pulls it, the project never commits it). Absolute targets are machine state. `--check` detects
changed discovery targets and edited releases; development content is intentionally live.
The development revision identifies the git base, not a digest of uncommitted work.

Capabilities are a task preflight declaration, **not permission grants or a sandbox**:

```sh
node scripts/install-registry.mjs --project <project> --harness codex --mode development --skills consult --require files.read,web.read --capabilities files.read,web.read
```

Names: `files.read`, `files.write`, `process.run`, `git.read`, `git.write`, `web.read`,
`agents.delegate`, `media.generate`, `external.write`. Missing declared requirements
stop installation with an explicit unsupported-task result. Available capabilities
must reflect the actual session. Delegation and external writes additionally require
task authorization. These adapters establish discovery; they do not certify every
skill's harness-specific commands or tool names. Inspect its method and prerequisites
before execution, and report unavailable behavior rather than substituting silently.

Reflection follows the actual installation and task scope. Release/cache/copy installs
receive local proposals; authorized development work changes the source and bumps its
version. See the [shared reflection clause](skill-clauses/skill-reflection.md).

The older `scripts/link-registry.mjs` remains an operator tool for existing Claude
development fleets. It is not a release installer. Machine roots belong exclusively in
`.machine.local.json`; `projects.json` holds portable relative checkout declarations.

## Self-healing linked projects (`link-registry.mjs --heal`)

Skill links cannot drift, but the `.claude/rules/ai-registry-*.md` rule copies can, and
before this mode only a hand-run of the linker refreshed them. The default run of
`link-registry.mjs` now also writes one SessionStart hook into each project's
machine-local `.claude/settings.local.json`:

```sh
node "<registry>/scripts/link-registry.mjs" --heal --project <slug>
```

`--heal` repairs only the classes below marked SAFE, for that one project. Each SAFE
repair also requires `git check-ignore` to report the path as ignored in the project.
Git does not report tracked files as ignored, so a tracked copy is never touched. Heal
prints nothing on stdout, because a SessionStart hook's stdout becomes session context.
It is silent when there is nothing to do and writes one stderr line naming what it
repaired. That change takes effect from the next session at the latest. If the
instrument cannot run, heal writes one stderr line and exits 0, so a broken instrument
cannot fail a session start. `--heal` without `--project`, or combined with another
flag, is a usage error (exit 2).

| Class | Detected by (in `link-registry.mjs`) | `--heal` |
| --- | --- | --- |
| Rule copy drifted from the generated rule | `ruleState()` returns `stale` | SAFE if ignored |
| Rule copy absent | `ruleState()` returns `absent` | SAFE if ignored |
| Rule installed as a symlink (the harness never loads it) | `ruleState()` returns `symlink` | SAFE if ignored |
| Declared skill whose link is absent | `inspect()` returns `absent` | SAFE if ignored |
| Declared skill whose link dangles | `inspect()` returns `broken-link` | SAFE if ignored |
| Declared skill linked to another lane skill's directory | `inspect()` returns `link-lane` with a different target | SAFE if ignored |
| Any of the above at a path git does not ignore (tracked, or not yet in the managed block) | `ignoredPaths()` | UNSAFE |
| Declared skill linked outside this lane (a fork, another checkout) | `inspect()` returns `link-elsewhere` | UNSAFE |
| Real directory or file at a lane name | `inspect()` returns `dir` or `file` | UNSAFE |
| Rule path holding a directory | `ruleState()` returns `other` | UNSAFE |
| Lane link or `ai-registry-*` rule no longer declared (a delete) | the stale `readdir` passes | UNSAFE |
| `.gitignore` managed block mismatch (tracked file) | `writeGitignoreBlock()` | UNSAFE |
| `skillOverrides` or the hook in `.claude/settings.local.json` | `writeListing()`, `writeHook()` | UNSAFE (default run) |
| Declared skill the lane lacks, or a domain with no generated rule | `laneSkills`, `RULES` lookups | Not repairable (content) |

UNSAFE findings are neither repaired nor printed by `--heal`. They belong to `--check`.
The default run repairs what it always did and maintains the hook. It never writes a
tracked or unparseable settings file; it names that file instead. `--check` reports a
missing or outdated hook. The hook uses matcher `startup|resume` and a 30-second timeout.
The script header cites the
[Claude Code hooks documentation](https://code.claude.com/docs/en/hooks) for the hook
shape and its stdout and stderr handling.

The registry links lane skills that it runs on itself, such as `/spark`, into its own
`.claude/skills/`. Its `.gitignore` declares them: each `/.claude/skills/<name>` line that
names a lane skill. The default run without `--project` makes those links, and `--check`
reports any that are missing.
