# /hackathon project overlay

`.claude/hackathon/config.md` in the consuming repo (tracked). The skill runs without it.
YAML frontmatter for scalars, `##` sections for lists and prose:

```yaml
---
vault: ["<abs obsidian root>"]   # first existing wins  [<repo>/.hackathon]
vault_subdir: Hackathon          # [Hackathon]
arena: .hackathon/arena          # [.hackathon/arena]
ideators: ""                     # [claude:claude-opus-5-5@high,claude:claude-sonnet-5-5@high]
ideas: 10                        # per ideator  [10]
hours: 5                         # the clock  [5]
build_effort: xhigh              # [xhigh]
base_port: 3300                  # entry n gets base_port + n  [3300]
worktrees_root: ""               # [win32: C:/t/hk-<id>; else <tmp>/hk-<id>]
baseline_frac: 0.35              # [0.35]
sprint_min: 60                   # --sprints sprint length  [60]
max_sessions: 6                  # per entry  [6]
---
```

| Section | What it carries | Default |
|---|---|---|
| `## Setup` | bullets, one backticked command each, run in each entry worktree before the clock | none |
| `## Gates` | bullets, one backticked command each, run per branch at collect and quoted in the brief | none |
| `## Repo law` | the constraints a builder must obey, pasted into every builder brief (store isolation, spend, file-size law) | "read the repo's CLAUDE.md / AGENTS.md first" |
| `## Taste` | what this owner judges hardest, appended to both briefs | none |
| `## Skill improvement log` | dated lines from the reflection clause | empty |
