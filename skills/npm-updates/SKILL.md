---
name: npm-updates
description: Fetch npm package updates, analyze new features, and identify improvement opportunities for this app. Use when the user wants to explore what's new in dependencies or plan next development directions.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npm outdated*), Bash(npm view*), Bash(npm info*), WebSearch, WebFetch
argument-hint: [category?]
version: 1.1.0
category: workflow
memory: none
---

# NPM Package Updates & Improvement Opportunities

Analyze npm dependency updates and identify new features that could improve this app.

If `$ARGUMENTS` is provided, filter analysis to that category only (e.g. "ai", "ui", "framework", "data", "testing").

## Steps

### 1. Scan for outdated packages

Run `npm outdated --json` in the project root to get a structured list of packages with available updates. Parse the JSON output to identify:
- **Major updates** (breaking changes, new APIs)
- **Minor updates** (new features, non-breaking)
- **Patch updates** (bug fixes only)

Focus analysis on major and minor updates. Patches can be listed but don't need deep analysis.

### 2. Categorize packages by role

Group the outdated packages by their role in the app:
- **Framework & Runtime**: next, react, react-dom, typescript
- **AI & SDK**: @anthropic-ai/sdk, @anthropic-ai/claude-agent-sdk, @github/copilot-sdk, @modelcontextprotocol/sdk
- **Data & State**: better-sqlite3, zustand, @tanstack/react-query, @supabase/supabase-js
- **UI & Visualization**: @xyflow/react, recharts, framer-motion, lucide-react, @monaco-editor/react, @dnd-kit/*, @uiw/react-md-editor
- **Cloud & Infrastructure**: @aws-sdk/*
- **Testing & Dev**: vitest, eslint, tailwindcss, playwright-core
- **Utilities**: uuid, clsx, glob, chokidar, d3, ts-morph, sonner

### 3. Research significant updates

For each package with a major or minor version bump:
- Use WebSearch to find the changelog or release notes (search: `<package-name> release notes <latest-version>`)
- Identify new features, deprecated APIs, and breaking changes
- Note any security fixes

### 4. Map opportunities to app features

Cross-reference new package features with the app's architecture:
- **Conductor Pipeline** (`src/app/features/Manager/lib/conductor/`): Could AI SDK updates improve the pipeline stages?
- **CLI Sessions** (`src/lib/claude-terminal/`, `src/components/cli/`): New Copilot SDK or Claude SDK features?
- **Task Runner** (`src/app/features/TaskRunner/`): Better state management, UI improvements?
- **Canvas/Flow** (`@xyflow/react`): New node types, interaction patterns?
- **Observability** (`src/app/db/repositories/`): Better query patterns, perf improvements?
- **External Requirements** (`src/lib/supabase/`): Supabase SDK improvements?
- **MCP Server** (`src/mcp-server/`): MCP SDK protocol updates?

### 5. Present findings

Output a structured report:

**Package Update Summary** as a markdown table with columns: Package, Current, Latest, Update Type, Priority.

**Improvement Opportunities** ranked by impact, each with:
- Which packages enable it
- What's new (specific APIs/features)
- How it improves vibeman concretely
- Effort estimate (Low / Medium / High)
- Key files that would change

**Recommended Update Order:**
1. Safe patches (low risk, do first)
2. Minor updates with useful features
3. Major updates requiring migration

**Breaking Changes to Watch** - list any breaking changes requiring migration work.

### 6. Ask what to pursue

After presenting the report, ask the user which improvement opportunities they want to pursue. Offer to:
- Create a detailed implementation plan for chosen opportunities
- Run the safe patch updates immediately
- Research specific package changes in more detail

---

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/npm-updates/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - npm-updates` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/npm-updates` in a consuming repo is a symlink to `<registry>/skills/npm-updates` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/npm-updates` and `git -C <registry> commit -m "skill(npm-updates): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/npm-updates/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/npm-updates` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
