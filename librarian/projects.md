# Connected projects

The projects this registry's knowledge is *about*, and the ones that consume it. This
note exists so a maintenance or research run knows which bundle a project relates to
without anybody having to remember, and so demand has a name before the
[`signals/`](../docs/signals-lane.md) lane has a number.

**Slugs and domains only.** No paths, no hosts, no internals. This lane is public under
the same rule as `usage/` and `signals/`, and the machine-readable half that resolves a
slug to a checkout on one machine is `.projects.local.json` - gitignored, local, and
never published. See [`.claude/skills/intake/SKILL.md`](../.claude/skills/intake/SKILL.md), Phase 8.

## The map

| Project | Domains it relates to | What it is |
| --- | --- | --- |
| `ascent` | `software-engineering` | The maturity index for AI-native engineering, and the reference consumer of this repository's index. `engineering-assessment` is the category forged from it. |
| `kp` | `recruiting`, `software-engineering` | A self-hostable hiring workspace: screening behind human approval gates, work samples, voice interviews. The `recruiting` bundle was forged from it. |
| `personas` | `software-engineering`, `llm-observability` | A local-first desktop app for building and monitoring AI agent personas. The `software-engineering` bundle was forged from it, and it is the first installation wired to this registry: it pairs the clone, shares and adopts skills through the `skills/` lane, writes the `usage/` lane, and consults bundle indexes at persona runtime. |
| `personas-web` | `software-engineering` | The public web companion to `personas`: a multi-locale marketing site, a product guide, a public roadmap, and a mock-driven demo of the agent-operations dashboard. Not yet forged from; its localization and CI-honesty doctrine are the first candidates. |
| `pof` | `game-production`, `software-engineering` | An AI companion for building UE5 C++ games. The `game-production` bundle was forged from it (merged 2026-08-22). Runs its own research lineage. |
| `systedo-case` | `media-generation`, `software-engineering` | An AI workspace for advertising: measures account performance and generates the content that follows from it. A `software-engineering` technique wave forged from it sits on `forge/adamant-2026-08`, unmerged. |

## What this map is for, and what it is not

**For:** routing. A finding that lands in `recruiting` has a project that can test it
against real code; a finding with no project behind it stays a standard until one shows
up. That is the difference between an application and a golden path, and this table is
where a run looks it up.

**Not for:** ranking. A project appearing here is not demand. Demand is what an
installation *reports*, in `signals/`, and until one does it reads UNKNOWN - not zero,
and not "well, we know they use it". The distinction is load-bearing everywhere else in
this repository and it does not get relaxed here.

**Not a dependency list.** `reads_registry` in the local bridge records what a project
is *pointed at*, which is a statement about intent. What it actually consults arrives
from the other side, as counts, or not at all.

## Adding one

Edit both halves in the same change: this table, and `.projects.local.json` on the
machine that needs to resolve it. A project in only the local half is invisible to
review; a project in only this one cannot be reached by a run.
