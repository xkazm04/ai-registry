# Connected projects

The projects this registry's knowledge is *about*, and the ones that consume it. This
note exists so a maintenance or research run knows which bundle a project relates to
without anybody having to remember, and so demand has a name before the
[`signals/`](../docs/signals-lane.md) lane has a number.

**Slugs and domains only.** No paths, no hosts, no internals. This lane is public under
the same rule as `usage/` and `signals/`, and the machine-readable half that resolves a
slug to a checkout is `projects.json` at the registry root - **committed**, because a
path relative to a machine root names no tree until that root is supplied. Only
`.machine.local.json` stays gitignored: the machine's name, its root, and its
contributor id. See [`.claude/skills/intake/SKILL.md`](../.claude/skills/intake/SKILL.md), Phase 8.

## The map

| Project | Domains it relates to | What it is |
| --- | --- | --- |
| `ascent` | `software-engineering` | The maturity index for AI-native engineering, and the reference consumer of this repository's index. `engineering-assessment` is the category forged from it. |
| `kp` | `recruiting`, `software-engineering` | A self-hostable hiring workspace: screening behind human approval gates, work samples, voice interviews. The `recruiting` bundle was forged from it. |
| `personas` | `software-engineering`, `llm-observability` | A local-first desktop app for building and monitoring AI agent personas. The `software-engineering` bundle was forged from it, and it is the first installation wired to this registry: it pairs the clone, shares and adopts skills through the `skills/` lane, writes the `usage/` lane, and consults bundle indexes at persona runtime. |
| `personas-web` | `software-engineering`, `localization` | The public web companion to `personas`: a multi-locale marketing site, a product guide, a public roadmap, and a mock-driven demo of the agent-operations dashboard. Not forged from; it carries a thirteen-locale catalog matching the `localization` bundle's thirteen language subjects, and is the tree `source-identical-value-audit` was measured against (2026-08-28). |
| `pof` | `game-production`, `software-engineering` | An AI companion for building UE5 C++ games. The `game-production` bundle was forged from it (merged 2026-08-22). Runs its own research lineage. |
| `systedo-case` | `media-generation`, `software-engineering` | An AI workspace for advertising: measures account performance and generates the content that follows from it. A `software-engineering` technique wave forged from it sits on `forge/adamant-2026-08`, unmerged. |
| `gravity` | `media-generation`, `software-engineering` | A content-creation studio for trailer-shaped pieces: research, script, frames, score, cut over a captioned asset library. The first consumer of the `audio-generation` category — its Score phase renders spotting cues through a server-side music seam (2026-08-26), and the fixture cut already spoke the spotting doctrine before the engine existed. |
| `gravitone` | `software-engineering` | A CPU-only, Arm-native text-to-speech and speech-to-text service with voice cloning, shaped like a hosted TTS API: a bounded pool of model instances behind an admission queue with 429 backpressure, a sealed air-gapped appliance image, and a Helm chart whose autoscaling reads queue depth through an external scaler. The fleet's most advanced cluster surface; onboarded 2026-09-03 after the kube-rs round found it missing (the `gravity` row above is the content studio at `gravitone-gcloud`, which this slug was previously confused with). |

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

## Machines

The fleet has named machines, and a project can be checked out on more than one at
once, **at a different path on each**. `projects.json` gives every project a
`checkouts` map — machine name -> that machine's own relative path:

```json
"personas": {
  "checkouts": {
    "Fox":  "dolla/personas",
    "Wolf": "code/personas"
  }
}
```

The keys ARE the machines it exists on; a machine absent from the map does not have
it, and resolving there yields nothing rather than an error. Adding a machine is
adding one key. The machine's **root** — the absolute directory those relative paths
resolve against — is declared in `projects.json` too, under `machines.<name>.root`
(since 2026-09-02), so the committed file alone yields a full path per device.
`.machine.local.json` then says only which machine this is and who the contributor is,
plus — for a checkout that cannot be expressed relative to the root at all (another
drive) — an optional `overrides` map, and an optional `root` that overrides the
declared one.

**Every path the registry publishes about a project is relative to the project root**,
never to a device: the fleet map's context paths, an application's seam, a direction
proposal's anchors. Parallel development on several devices reads the same file and
resolves it against its own root.

| Machine | Role | Root |
| --- | --- | --- |
| `Fox` | secondary dev box | not declared yet (its local file supplies one) |
| `Wolf` | primary dev box | `C:/Users/kazda` |

Domains are deliberately NOT in `projects.json`. Every project declares its own in its
`.ai/manifest.yaml` (`knowledge.domains`), which is committed in that project and is the
only authority on what governs it. The registry reads them from there. A second copy is
how the first one goes stale - and it did: the old bridge carried a `domains` array that
one machine never filled in, so `build-registry-map.mjs` skipped all seven projects and
wrote nothing, silently, for days.

## Adding one

Edit both halves in the same change: this table, and `projects.json` at the registry
root. Only a NEW machine needs a local file - write `.machine.local.json` with its
name, its root and its contributor id, then add that name to the project's `machines`
array in `projects.json`. A project in only the local half is invisible to
review; a project in only this one cannot be reached by a run.
