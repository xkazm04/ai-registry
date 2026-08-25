---
name: agent-guidance-bootstrap
description: "Create or refresh a repo's AGENTS.md so an agent joining the codebase gets commands, architecture and constraints without guessing. Use on a repo with no agent guidance, or when the existing file has gone stale."
category: ai-native
memory: project
version: 0.4.0
tags: agents-md, onboarding, context, conventions
argument-hint: "[project-root]"
---

# Agent guidance bootstrap

An agent with no repo context re-derives the same facts every session, gets half of them wrong,
and writes code that does not match the house style. An `AGENTS.md` at the repo root is the
cheapest available fix: one file, read first, that answers the questions every session starts
with.

## Before writing anything: gather evidence

Never write guidance from assumption. Collect, in this order:

1. **Commands that actually exist.** `package.json` scripts, `Makefile` targets, `justfile`,
   `pyproject.toml`, `Cargo.toml`, the CI workflow. If CI runs it, it is real.
2. **The shape of the tree.** Top-level directories and what each owns. Two levels deep is
   enough; deeper is churn.
3. **Entry points.** Where execution starts: the server bootstrap, the CLI main, the route root.
4. **Conventions the code already keeps.** Read 5 to 10 recent commits and 3 representative
   source files. Whatever is consistent (naming, error handling, test layout, commit format) is
   the convention, whether or not anyone wrote it down.
5. **The things that would be expensive to get wrong.** Generated files, vendored code, the
   public API surface, anything security-sensitive.

If you cannot find a fact, leave a `TODO:` marker. A confident wrong command is worse than a
visible gap, because the next agent will run it.

## The file

Keep it short enough to be read every session. Aim for under 200 lines.

```
# <repo name>

<One paragraph: what this is and who uses it.>

## Commands
- Install: <cmd>
- Test: <cmd>          # the one command that proves a change
- Lint: <cmd>
- Typecheck: <cmd>
- Build: <cmd>
- Run locally: <cmd>

## Architecture
- Entry points: <path> (<what happens there>)
- <dir>/ - <what it owns>
- Data flow: <request -> ... -> response, in one line>

## Verify after every change
1. <test cmd>
2. <typecheck cmd>
3. <build cmd, if the repo has one>
Do not report a change as done before these pass.

## Constraints (never break these)
- <generated or vendored paths that must not be hand-edited>
- <public API or schema that needs a migration, not an edit>
- <security rules: where secrets come from, what must never be committed>

## Conventions
- <commit format>
- <test location and naming>
- <error handling and logging pattern>

## A good change looks like
- <link to, or three lines describing, one exemplary recent commit or PR>
```

## Rules for the content

- **Capabilities, not tools.** Write `Test: npm test`, not "we use vitest". The command survives
  a migration; the tool name does not.
- **Every claim checkable.** If a line cannot be verified by running something or opening a named
  file, it does not belong.
- **Rules with reasons.** "Do not edit `src/generated/`, it is rewritten by the codegen step" is
  followed; "follow best practices" is not.
- **One file, one root.** If the repo already carries a second guidance file, do not fork the
  content - keep one canonical file and make the other a one-line pointer to it.

## Keeping it true

Stale guidance is worse than none, because it is trusted. Re-run this skill when the build
commands change, when a top-level directory is added or removed, and when a constraint is added.
A quick audit: run every command in the Commands section. Any that fails takes the whole file's
credibility with it.

## Related

- Practice `agent-guidance` (D1) - the starter file this skill fills in.
- `ci-gate-check` - the Commands section, executed.
