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
out of the consuming project's git history: ignore `.ai/registry-installation.local.json`
and `.ai/registry-releases/`. Absolute targets are machine state. `--check` detects
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
