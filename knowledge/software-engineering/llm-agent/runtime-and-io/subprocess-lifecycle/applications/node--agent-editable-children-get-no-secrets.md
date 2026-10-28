---
layer: application
type: application
subject: subprocess-lifecycle
technique: agent-editable-children-get-no-secrets
stack: node
status: forged
verified_on: 2026-10-27
---

# Node — two environment tiers in an agent-fleet runner

The tree is a runner that starts an editing coding agent per lane in its own
worktree, then runs the repository's setup and gates over the lane's change and
commits through git. Citations are against the public repository
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893` (the
same tree is mirrored on the hackathon group's GitLab), read on the
`verified_on` date. The manifest admits several Node majors, so no single
runtime version is pinned here.

## The threat model, stated where the code lives

The test file opens with the technique's premise in one sentence:
`runner/test/security.test.ts:2 "may only edit files, but gates and hooks then RUN those files, so whatever the runner hands a child is the"`
The README turns it into a named boundary:
`runner/README.md:189 "## The API-key boundary"`.

## The door picks the tier, and the safe tier is the default

Every child goes through one function, and the default is the child tier:
`runner/proc/proc.ts:24 "Default childEnv(): no secrets. Only claude is spawned with agentEnv()."`
and the spawn itself, `runner/proc/proc.ts:152 "env: opts.env ?? childEnv(),"`.
A spawn site that forgets to choose gets no secret. That is the
absent-guard direction the technique asks for.

The child tier is documented by who authors its code:
`runner/proc/proc.ts:77 "The env of every child but claude: gates, setup and git (whose hooks may live in the worktree, e.g. husky)."`
and `runner/proc/proc.ts:78 "A lane agent edits the files those children run, so they get no secret at all"`.
Git is classed as a code runner because of its hooks. That is the
classification most hosts miss.

## The pass-through goes to children only

`runner/proc/proc.ts:82 "const pass = new Set((envOf(process.env, 'PASS_ENV') ?? '')"`
reads an exact, comma-separated list of names. No prefixes or wildcards are
accepted. The agent tier never consults that list:
`runner/proc/proc.ts:88 "never an AFTERLIFE_PASS_ENV variable"`.
Both directions are pinned by tests:
`runner/test/security.test.ts:49 "expect(childEnv().NPM_TOKEN).toBe('npm-x');"`
and `runner/test/security.test.ts:55 "expect(agentEnv().NPM_TOKEN).toBeUndefined();"`.

## The agent's own children are re-stripped by the runtime

The host cannot wrap the shell commands the agent issues, so it tells the agent
runtime to strip its credentials from everything it starts:
`runner/proc/proc.ts:96 "return { ...env, CLAUDE_CODE_SUBPROCESS_ENV_SCRUB: '1' };"`.
The side effect named in the technique appears here. Under that setting the
runtime forces its default permission mode, so the lane's edit permission
moves into an explicit rule:
`runner/proc/proc.ts:90 "Under it claude forces --permission-mode default, so the lane profile allows its edits by rule."`

## The scrub is a denylist, by name and by value

`runner/proc/proc.ts:57` is the name-shape pattern (tokens, secrets, keys,
auth, cookies, DSNs, connection strings). `runner/proc/proc.ts:59 "const SECRET_VALUE = /:\/\/[^\s/@:]*:[^\s/@]+@/;"`
catches a password in a URL under any name. The key-agent socket is included
by name, as
`runner/proc/proc.ts:55 "the ssh agent's SSH_AUTH_SOCK"` documents. The
host's own loader and script-runner state comes out too, for a reason that is
correctness rather than secrecy:
a child that runs the same script runner would pick up the host's project
configuration, `runner/proc/proc.ts:64 "would load this repo's tsconfig and fail to resolve its paths"`.
`runner/test/security.test.ts:58-65` plants eight secret shapes under
innocent-looking names and checks that two harmless lookalikes survive.

## What is left open, said out loud

`runner/README.md:202-207` is the "not closed" section the technique asks for:
`runner/README.md:204 "env scrubbing does not stop a gate reading the user's credential files"`.
It names the closure the runner does not use (the agent runtime's
operating-system sandbox) and the fallback it recommends:
`runner/README.md:207 "run the runner as a user that holds only what it needs"`.

## The positional test, on the hosted side

The same repository ships a configuration file for a hosted agent platform.
There, a setup script runs **with** the triggering person's token, outside the
sandbox. It is acceptable only because the file is read from a place no change
can write. This is the "editable on this run, before this child reads it"
test:
`gitlab/examples/target-project/.gitlab/duo/agent-config.yml:4 "read from the DEFAULT BRANCH only: a file on another branch is ignored, so a flow cannot be reconfigured from an MR"`
and
`gitlab/examples/target-project/.gitlab/duo/agent-config.yml:8 "setup_script runs BEFORE the sandbox and outside it, with every environment variable of the flow, including the"`
(the triggering person's token), and
`gitlab/examples/target-project/.gitlab/duo/agent-config.yml:9 "Keep it short, pinned and free of anything fetched from a branch or an issue."`

## Deviations

- **Denylist, not allowlist.** The runner inherits a developer's toolchain
  environment and scrubs by shape. The standard stays an allowlist, and a
  denylist is the recorded weaker class. A credential with an innocent name
  and an innocent-looking value passes.
- **The runtime re-strip is asserted as configured, not as working.** The
  automated test swaps in a stub agent binary and checks that the variable was
  set (`runner/test/security.test.ts:72 "expect(agentEnv().CLAUDE_CODE_SUBPROCESS_ENV_SCRUB).toBe('1');"`).
  That the real runtime honours it was checked once by hand against one
  version (`runner/test/security.test.ts:68-69`). The technique asks for a
  re-check on every runtime upgrade, and nothing schedules one.
