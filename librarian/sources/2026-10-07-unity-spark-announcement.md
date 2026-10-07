---
source: youtube:IU_UY7uML5I
kind: second-hand practitioner review (reads the two vendor posts aloud; demo half is vendor footage)
url: https://www.youtube.com/watch?v=IU_UY7uML5I
title: Unity's Brand New Game Engine - Unity Spark
author: Gamefromscratch
words: 2602
extracted: 8
accepted: 1
declined: 0
leads: 4
already_covered: 1
untriaged: 2
dispatched: 0
applied: 1
shipped: 1
run_id: intake-1007-iu5i
siblings: 0
---

# The demo you cannot quit: shell conventions belong in the baseline

A 13-minute review, published the day of the announcement, of an AI chat-driven game
builder that runs a browser port of a commercial engine's editor and publishes to a
browser game-hosting experiment. The reviewer reads both vendor posts aloud and plays
the vendor's demo games. The operator asked two things: can it help automate development
of `garden-vr` (two seated VR habit apps on the same engine), and is there a general
lesson worth forging.

**Ingest.** `research-ingest` exited 2 three times (HTTP 429 on the only caption track,
auto `en`, on all three rungs, and again with a node JS runtime and impersonation). The
instrument failed; the source was not thin. Transcript was produced locally: audio pulled
with the downloader, transcribed by a small English speech model on CPU in 30-second
chunks (27 chunks, 2,602 words, timestamps per chunk). The channel name came out mangled,
and one chunk ([01:00]) is a single word over music. Fetches: 2 of 3 (the vendor CEO post,
which carried one technical sentence; the reviewer's own article, which carried less than
the video).

**Class and expected yield.** Second-hand practitioner review: a demo states no operating
constraints, and the segment it is proudest of is where the boundary is missing. Expected:
a currency signal, two or three leads, possibly nothing landable. The declared focus from
the last scorecard row (budget the render seed control first) does not apply: nothing
here is render-bound.

**Board.** 0 live siblings at claim. `projects.json` carries a sibling's uncommitted
registration of `garden-vr`, `mage-arena-vr` and `firetv`; not touched, not committed.

## The direct answer for garden-vr: the product cannot help it

| Question | What the source and the vendor posts say | For garden-vr |
| --- | --- | --- |
| Availability | announced 2026-10-07; closed beta "coming soon", later in 2026 | nothing usable before the 2026-11-17 submission |
| Where it runs | browser editor; the vendor's runtime behind a chat layer, with inspector, scene graph and shader graph underneath | garden-vr is two local engine projects with shared packages and a .NET test harness |
| Export | "you can't export out to Unity" [03:00]; games publish to the hosting experiment | no path into or out of an existing project |
| Assets | the asset store's artist-made assets, plus uploads; no generated assets at launch [01:30] | garden-vr already generates and models its own |
| Target | browser players on phone and laptop | Quest 3 / 3S headsets |

So: **no feature of it can be adopted for garden-vr's LLM-automated development**, partially
or fully, today. garden-vr's own loop (headless agents, batchmode capture, a pairwise judge,
a dotnet harness for engine-free rules) is already further along the automation axis than
anything the source shows. What it can lend garden-vr is the failure its demo exposed,
which turned out to be present in garden-vr too (row 4).

## Triage

Rule per row: rows 1-3 and 6 are governed by the corroboration table (currency and leads
may be admitted on the source alone); row 4 ran the Phase 5 score.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | currency | S | A chat-driven builder on a full engine runtime shipped (closed beta) | no application cites the engine's AI tooling | none (no application to date) | real | - | **lead** |
| 2 | K | design | M | The chat layer edits the same scene graph the manual inspector edits | `game-production/engine-integration/visual-script-to-code-transpilation` (weak) | new-technique? | thin | 1/2/2 | **lead** |
| 3 | K | technique | M | Ground a conversational builder in a vetted asset library, not generation | `content-pipeline/generative-artifact-gating` (`acquired-is-not-generated`) | none | likely catch | - | **already covered** |
| 4 | K | technique | M | Name the platform shell conventions in the baseline, per platform | `production-governance/production-prompt-architecture` | new-technique | real gap | 3/0/2 | **accepted** |
| 5 | K | lead | S | Multi-user, internet-collaborative chat authoring of one game | none | none | thin | - | **lead** |
| 6 | K | lead | S | A host labelled "experiment" by its vendor is a dependency with a shelf life | none in game-production | none | thin | - | **lead** |
| 7 | X | lead | S | Free tier metered in weekly generation tokens | - | none | thin | 0/2/1 | untriaged |
| 8 | K | lead | S | Demo footage disclaimed as "screen images simulated" | - | none | thin | 0/2/1 | untriaged |

### Row 4 - accepted: `platform-shell-conventions-in-the-baseline`

- **Anchor.** [10:30]-[11:30]: two of the vendor's own demo games could not be quit: "Escape
  does not exit", "a new ability to exit". This is the segment the demo is proudest of
  (playable games, made in weeks), and it is where the boundary is missing.
- **Strip.** Something is left: a producer that authors a whole playable program builds what
  was described, and the shell conventions (quit, pause on focus loss, nothing lost on
  close, resume) are never described.
- **Corroboration.** Code read in a tree: garden-vr at `14946ee`. Its standing agent rules
  name three shell conventions and all three are built and tested. The fourth, an in-app
  quit on the PC player, is named nowhere and not built: Esc raises a pause, and the
  borderless-fullscreen player exits only by an OS chord. Training-data convergence:
  platform certification checklists for consoles and headsets require focus-loss pause
  and safe close and leave quit to the system menu. That ownership split is the
  discriminator the technique carries.
- **Score.** GAIN 2 (new technique, subject not in the scan's top 15) +1 (convergence: the
  garden-vr rule file independently put shell conventions in its standing baseline) = 3.
  RISK 0 (the director opened the tree; an append, no standing sentence made false).
  COST M = 2. 3 - 0 >= 2 and 3 >= 2: **auto-accept**.
- **Stage.** The subject's pipeline is: assemble the skeleton, inject scanned state, wiring,
  appended criteria, scoped knowledge. Nothing owned *what the standing baseline must
  contain when the producer authors the program itself*. The wiring section answers
  "is the artifact reachable"; this answers the same question one level up.
- **Boundary.** `docs/subject-proposal-immersive-interaction.md` proposes
  `focus-loss-pause-and-resume` under N3 for head-worn play. That technique will own the
  *behaviour*. This one owns that the convention is *named to the producer*, and the
  per-platform ownership table. The proposal reads garden-vr as meeting focus-loss, which
  this run confirms.
- **Landed.** The technique, the golden-path paragraph and `techniques:` entry, and an
  application against garden-vr (`applied: experiment`, `ab_verdict: unmeasurable`;
  11/11 anchors held by `check-anchors`).

### Leads

1. **Chat-driven builder on a full engine runtime (currency).** Return: when the closed beta
   opens and either an export path into a regular engine project or an agent-drivable API
   exists. Then re-ask the garden-vr question. Until then no application in the corpus is
   dated by it.
2. **Chat layer and manual inspector edit one scene graph.** The demo shows a chat, an
   inspector, a scene graph and a shader graph side by side [01:30]-[02:30]. The claim would
   be that conversational authoring stays adoptable only when its edits land in the same
   representation the manual tools edit, so a person can take over at any granularity. Not
   checkable from footage. Return: when a second source shows how the chat layer's edits
   are represented, or when a fleet project builds a conversational editor.
3. **Collaborative chat authoring.** Several named users in one session [00:30]. Return:
   when the beta shows how conflicting instructions from two people are resolved.
4. **Experiment-tier host as a dependency.** The reviewer's prior about the host vendor is
   opinion. The vendor's own "experiment" label is the usable fact. Return: when a fleet
   project considers publishing onto an experiment-labelled platform.

### Already covered

- Row 3: the asset-library grounding is a launch choice, not a mechanism. The corpus already
  says acquired assets are not exempt from gating (`acquired-is-not-generated`). For
  garden-vr, store-sourced props versus its generated ones is a product choice, not a
  finding.

### Untriaged (nobody verified these)

| # | Candidate | Anchor |
|---|---|---|
| 7 | Free tier metered in weekly generation tokens; higher limits through a consumer AI subscription; no creator revenue | [09:30] |
| 8 | Vendor footage carries "screen images simulated"; the reviewer's first live play failed to load | [04:00]-[04:30] |

## Applied

| Technique | Project | Mode | Verdict | Seam |
|---|---|---|---|---|
| platform-shell-conventions-in-the-baseline | garden-vr | experiment | unmeasurable | the agent rule file vs the keyboard provider's Esc mapping |

The seam was chosen to falsify. If garden-vr had an in-app quit that no rule named, the
claim that named conventions get built and unnamed ones do not would have failed on its
first tree. It held, on n=4 conventions in one tree, observationally. **Shipped:** one rule
line in garden-vr `AGENTS.md` rule 2 (commit `9a89355`, main, not pushed). It is
documentation only, because the project's decision 0004 freezes edits to engine-compiled
files until a licensed session can compile them. Return condition: the first licensed
session builds the quit path from the rule, and the next PC review build is audited for it.

Directions: n/a (no design record; a video).
