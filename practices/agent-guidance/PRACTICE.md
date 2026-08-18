---
id: agent-guidance
dimension: D1
applies-when: "The repo has no root AGENTS.md or CLAUDE.md, or the one it has does not name the build and test commands."
---

# Agent guidance (AGENTS.md / CLAUDE.md)

**What it gives you:** machine-readable project context, so any AI contribution lands consistent
and on-spec instead of re-deriving the repo from scratch every session.

**Dimension:** D1. **Starter:** [`starter/AGENTS.md`](starter/AGENTS.md).

## The shape

A conformant repo carries one root guidance file with these six sections. This is the *shape* -
no repo's actual content travels with it.

1. **Build and test commands.** How to install, run, lint, typecheck, test, and build. One
   command per capability, each of them real and runnable today.
2. **Architecture map.** Entry points, the top-level directories and what each owns, and the data
   flow in one or two lines. Enough to route a change to the right file.
3. **Verify-after-every-change rules.** The explicit sequence an agent must run before calling a
   change done, and the instruction not to report success before it passes.
4. **Constraints that must never be broken.** Generated or vendored paths, the public API or
   schema surface, security rules, and any convention whose violation is expensive. Each with
   its reason, because a rule without a reason is a rule that gets argued away.
5. **Tooling in use.** MCP servers, hooks, subagents, or scripts the repo expects, and what each
   is for. Omit the section entirely if there are none.
6. **One or two examples of a good change.** A link to a real commit or PR, or three lines
   describing it. This calibrates size, commit style, and how much test comes with a change.

## Why this shape

The first three sections are what an agent needs in the first 30 seconds; the last three are what
stops it from doing damage it cannot see. Ordering matters - a file that opens with philosophy
and buries the test command gets skimmed past the part that mattered.

## How to tell it is working

- A new session can run the test suite without asking or guessing.
- Changes arrive matching the repo's commit and test conventions without being told.
- The file is edited when the build changes, not months later. A guidance file whose commands
  fail is worse than no file, because it is trusted.

## Adopting it

1. Copy `starter/AGENTS.md` to the repo root.
2. Fill every `<...>` and `TODO:` from evidence in the repo (the `agent-guidance-bootstrap` skill
   automates the evidence pass).
3. Run every command in the Commands section. Delete or fix any that fails.
4. If the repo already has a guidance file under another name, keep one canonical file and make
   the other a one-line pointer.

## Anti-patterns

- Aspirational commands ("we should run coverage") mixed with real ones. Only real commands.
- A copy of the README. The README sells the project; this file operates it.
- Naming frameworks instead of capabilities. `Test: npm test` outlives `we use vitest`.
- Length as thoroughness. Past a few hundred lines it stops being read in full, and the parts
  that get skipped are chosen by the reader, not by you.
