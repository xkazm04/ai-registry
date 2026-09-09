---
name: npm-updates
description: Fetch npm package updates, analyze new features, and identify improvement opportunities for this app. Use when the user wants to explore what's new in dependencies or plan next development directions.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npm outdated*), Bash(npm view*), Bash(npm info*), WebSearch, WebFetch
argument-hint: [category?]
version: 1.2.0
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

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Put a dated observation in the consuming project's configured
overlay under `## Skill improvement log`, when local edits are within scope. Use the
location in this skill's `## Project overlay` section. If none is configured, use
`.agents/npm-updates/config.md` for Codex or `.claude/npm-updates/config.md` for Claude.
If the harness is unknown, propose the note in the response instead of guessing a path.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
