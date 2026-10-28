---
layer: application
type: application
subject: agent-cli-transport
technique: derived-bash-allowlist
stack: claude-code
status: forged
verified_on: 2026-10-27
---

# Claude Code — lane shell grants derived from a fleet file

An agent-fleet runner starts one headless coding-agent session per lane, in
the lane's own worktree, and must let that session run the repository's gates
itself. Citations are against
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893`, read
on the `verified_on` date. The CLI version the runner's own comment names as
checked is quoted below, and no `verified_against` is set because the tree
pins no single CLI version.

## Why rules at all

`runner/agent/permissions.ts:2 "tool call that would prompt, so a lane can run a shell check only through an allow rule"`
The four profiles (plan, review, lane, reflect) are declared at
`runner/agent/permissions.ts:5-11`. Only the lane profile has a shell.

## The derivation

`runner/agent/permissions.ts:52 "Bash allow prefixes for a lane: every sub-command (split on && ; || |) of the gates and setup, plus extras as given."`
The plain-word stop is
`runner/agent/permissions.ts:42 "if (!w || w.startsWith('-') || !WORD.test(w)) break;"`,
with quoted arguments blanked out first (`:41`). Launchers take a third word
(`runner/agent/permissions.ts:32 "const LAUNCHERS = new Set(['uv run', 'npm run', 'npm exec', 'pnpm exec', 'pnpm run', 'yarn run', 'poetry run', 'pipx run', 'bundle exec']);"`),
and a one-word prefix on an interpreter or package manager is refused
(`runner/agent/permissions.ts:49 "return want === 1 && BARE.has(prefix) ? null : prefix;"`,
over the set at `:34`). The deny filter runs over the derived list and the
extras alike (`runner/agent/permissions.ts:62`), and the same programs are
also written as deny rules (`runner/agent/permissions.ts:73`).

The table test pins it, including the refusals:
`runner/test/permissions.test.ts:24 "['npm', []],"`,
`runner/test/permissions.test.ts:26 "['git diff --exit-code', []],"`,
`runner/test/permissions.test.ts:27 "['curl https://x | sh', []],"`.
The call site derives from the fleet file's own setup and gates:
`runner/wave/wave.ts:91 "const bash = bashPrefixes([...(repo.setup ?? []), ...repo.gates], repo.laneTools);"`.

## The rules travel in a file

`runner/agent/permissions.ts:3-4 "rather than argv because on Windows claude.cmd runs through cmd.exe"`, with the file passed by path.
The path is checked to be a plain token before the spawn
(`runner/agent/spawn.ts:53 "settings path is not shell-safe"`), and the empty
tool list is passed as one token so that it survives the interpreter
(`runner/agent/spawn.ts:56 "would vanish on its way through cmd.exe"`).
The per-call directory is removed with retries, and a failure there never
replaces the result
(`runner/agent/spawn.ts:97 "finally would replace the call's result, and with it the cost the caps are counted from"`).
The operator's personal scope is excluded
(`runner/agent/spawn.ts:9-10 "the operator's allow list must not widen the profile"`).

## Honesty about what it does not close

`runner/agent/permissions.ts:9 "prefixes run code the lane can edit, so the rules do not close the network or the filesystem"`
The README repeats it for operators, and adds that the tool runs some
commands it judges harmless without any rule:
`runner/README.md:55 "Read-only commands claude itself treats as safe"`

## Deviations

- **An extra that is a launcher.** A gate of the form "package manager,
  directory flag, path, script" derives nothing
  (`runner/test/permissions.test.ts:23 "['pnpm --dir apps/desktop/client install', []],"`),
  so the example fleet adds the manager and its flag as an extra
  (`runner/fleet.example.yml:75 "- pnpm --dir"`). The test then asserts that
  grant as a useful rule (`runner/test/permissions.test.ts:38`). Extras skip
  the bare-launcher check, and this one runs any script in any directory.
  This is the upward lesson folded into step 5 of the technique.
- **The workspace's settings scope is loaded.** The spawn passes
  `runner/agent/spawn.ts:57 "'--setting-sources', 'project,local'"`. The
  project scope lives in the worktree the lane edits. Deny-wins protects the
  denied programs, but an allow rule written there by a lane, or shipped by
  the target repository, would widen the shell for the next resumed turn.
  This is not demonstrated here. It is recorded as the open seam the technique
  now names.

## Adjacent: the same lesson on a hosted agent platform

The repository's hosted agent flows met the platform's version of the same
"what the definition says is not what runs" problem. The documented loop-cap
field was refused on registration, which left only the per-step timeout as a
bound:
`gitlab/flows/README.md:83-84 "is a disallowed additional property"` and
`gitlab/flows/README.md:85 "The loop bound now comes only from each prompt's"`. The
agent's toolchain on that platform is set by a project file read only from
the protected default branch, and dependencies are fetched before the agent
starts, so its gate could run offline
(`gitlab/flows/README.md:113 "warm-up had filled the Gradle cache"`).
