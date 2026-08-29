---
name: agent-guidance-bootstrap
description: "Create or refresh a repo's AGENTS.md so an agent joining the codebase gets commands, architecture and constraints without guessing. Use on a repo with no agent guidance, or when the existing file has gone stale."
category: ai-native
memory: project
version: 0.5.0
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

---

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/agent-guidance-bootstrap/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - agent-guidance-bootstrap` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/agent-guidance-bootstrap` in a consuming repo is a symlink to `<registry>/skills/agent-guidance-bootstrap` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/agent-guidance-bootstrap` and `git -C <registry> commit -m "skill(agent-guidance-bootstrap): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/agent-guidance-bootstrap/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/agent-guidance-bootstrap` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
