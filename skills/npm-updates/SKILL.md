---
name: npm-updates
description: Fetch npm package updates, analyze new features, and identify improvement opportunities for this app. Use when the user wants to explore what's new in dependencies or plan next development directions.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npm outdated*), Bash(npm view*), Bash(npm info*), WebSearch, WebFetch
argument-hint: [category?]
version: 1.3.0
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

<!-- clause: skill-reflection v5 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the checkout you worked in: local,
gitignored run output inside the task's own repository, never a write into the registry.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill npm-updates --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"npm-updates","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null`; exact figures are measured later from transcripts - never guess one.
- `result` is one line (max 240 chars). `comment` (max 2000) is the self-reflection a
  reviewer reads: what worked, what the method made harder, where its instructions were
  wrong, missing or ignored. No filesystem paths or email addresses.
- Never read run logs during a run. They are evidence ABOUT this skill for its reviewer;
  an executor that reads its own diagnosis contaminates the next measurement.

**Project learning.** Only when this run produced an observation that would change how a
future run behaves. A run that went as the method describes writes nothing: an entry that
restates the procedure, records "no issues", or repeats the task is a defect, not a
deliverable. When there is such an observation and local edits are within scope, put one
dated line in the overlay this skill's `## Project overlay` section names, under
`## Skill improvement log`. **Write only into an overlay that already exists.** If the
project has none, put the observation in the response instead - creating a new tracked
file for a reflection is scope the task did not ask for, and a reader who never asked for
the skill has to review it. If the overlay is a structured config (YAML, TOML, JSON),
record the note as comments so the file keeps parsing, or use the response.
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
