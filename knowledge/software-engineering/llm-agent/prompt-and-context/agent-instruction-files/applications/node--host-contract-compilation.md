---
layer: application
type: application
subject: agent-instruction-files
technique: host-contract-compilation
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@22
applied: simulation
ab_verdict: better
proof: structural-only
---

# One skill suite, ten hosts, no per-host code in the generator

gstack ships some fifty workflow skills for Claude Code and compiles the same
sources for nine other harnesses (Codex, Factory, Kiro, OpenCode, Slate,
Cursor, OpenClaw, Hermes, GBrain). This application records the design as it
stands at the pinned commit, read from the tree rather than the README.

## The decision and its forces

Each host is one file under `hosts/` built by `defineHost()` — two required
fields, everything else derived from the name — and the generator
(`scripts/gen-skill-docs.ts`), the setup script, the health dashboard, the
uninstaller and the worktree copier all read the resulting `HostConfig`
(`scripts/host-config.ts`). `docs/ADDING_A_HOST.md` states the property the
design was built to reach: "None of them have per-host code."

The forces are visible in the contract's own fields. Codex accepts only
`name` and `description` in frontmatter and errors above 1,024 characters
(`hosts/codex.ts`, `descriptionLimitBehavior: 'error'`); OpenClaw-style
runtimes name their tools `exec`/`read`/`write` rather than `Bash`/`Read`/
`Write`, so a shared `EXEC_STYLE_TOOL_REWRITES` map rewrites the prose
(`hosts/define-host.ts`); Codex cannot invoke itself, so the five
cross-model sections (`CROSS_MODEL_RESOLVERS`) are suppressed on it and on
every non-Claude agent runtime; and only hosts that can run with a memory
store keep the two brain-aware sections. `pathRewrites` and
`extraPathRewrites` are mutually exclusive and the factory throws if both are
passed.

## What the tree confirms about the technique

- **Suppression is validated, not trusted.** `validateHostConfig` takes the
  registry of resolver names and rejects a suppressed name it does not know.
- **Goldens per host exist and are the largest files in the test tree**:
  `test/fixtures/golden/{claude,codex,factory}-ship-SKILL.md` (11k, 25k and
  29k words), diffed on every change.
- **Prose is validated per render, into a temporary directory.**
  `test/skill-validation.test.ts` renders the Codex host once into a
  `mkdtemp` and asserts every `$B` command in the compiled prose against
  `browse/src/commands.ts`; the file's own comment records that it used to
  regenerate in place at three sites and that this was "a tree-mutating
  hazard for concurrent readers".
- **The boundary instruction is a host field.** `codex.ts` carries the text
  that tells the second model not to read `~/.claude/`, `.claude/skills/` or
  `agents/` — "bash scripts and prompt templates that will waste your time".
- **The instruction-only tier is real.** `install.instructionTier` names a
  committed digest (`agents-digest/`) delivered by print plus user copy; the
  contract's comment says setup "must never write or overwrite a user's own
  AGENTS.md".

## Where the tree falls short of its own rule

The changelog for the pinned release records the third recurrence of one bug
class: a harness change made subagents launch in the background by default,
and four dispatch steps in the ship skill did not pass the foreground flag.
The fix is a single resolver constant carried into 24 generated files and
pinned by a test that enumerates its carriers — which is the technique's
single-source rule applied after the fact. The follow-up the team filed is
the structural fix the technique would have asked for first: enforcement in
a hook rather than in prose.

## The paired comparison

Arm A is the registry's skills lane as it stands: one host, six consumer
repositories, skills reached by link. Arm B is the lane with a host contract.
Three real cases from the registry's own history:

1. **Six links, one host.** Every consumer runs the same harness, so
   single-source-topology is sufficient and B adds nothing. Equal.
2. **The desktop work surface that loads skills at session start from a
   zip** (a banked lead in the intake notes): a second delivery mechanism
   with a different install strategy. Under A the lane has no field for it;
   under B it is one host file with `install.linkingStrategy` set. B better.
3. **`scripts/check-skill-triggers.mjs`** validates skill descriptions for
   collisions on one host's semantics. A host with a description limit would
   need the check per render; B's per-host golden is where that check runs.
   B better, and the first step is small.

Verdict `better` on two of three, structural-only: no code changed, and the
arms are read from the lane's files.

## What this realization cannot do

The suite has no measurement of *drift caught per host*: the goldens fail CI
when they change, but nothing counts how often a host-specific render would
have shipped wrong without them. The number that would price the technique is
golden failures per host per month, which the CI history holds and nobody
aggregates.
