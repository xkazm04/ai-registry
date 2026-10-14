---
source: youtube:czsNiALTgWQ
kind: youtube
url: https://www.youtube.com/watch?v=czsNiALTgWQ
title: "This Is How I Actually Make Games With AI - My Setup"
author: Stefan 3D AI
words: 3165
extracted: 9
accepted: 0
declined: 0
leads: 3
already_covered: 4
untriaged: 2
dispatched: 0
applied: 0
shipped: 0
run_id: intake-czsN-1014
siblings: 1
---

# A creator's setup tour: four catches, three leads, no landing

**Class:** first-party practitioner account, build-walkthrough half (a personal
workspace the author uses daily). Expected yield was catches and leads; that is what
arrived. Siblings live at start: 1 (`intake-v1Gwa1`, a different source, held no subject
in common). Caption ladder `vtt/en.*`; the transcript is clean prose, 3,165 words, with
speech-to-text mangling of product names (read "Hicksville" as a video-generation
aggregator, "Tripo", "fal"-style aggregator, "Mixamo"-like Blender plugin named
"mix are"), none of which matter because every claim here strips to a pattern.

The operating half (what happened to the author) is the useful part: one narrow chat per
task, a successful iteration written back into the process files, and time priced above
subscription cost. The demo half (the HTML dashboard tabs, the mobile bridge) shows a
tool and hides its boundary; nothing in it is checkable from the transcript.

## Triage

| # | Candidate | Anchor | Prior art | Impact | G/R/C | Read | Decision |
|---|---|---|---|---|---|---|---|
| 1 | Promote a task into the process files after ONE successful iteration, with a review stop at stated stages | [00:02:31] "okay, now put this into the processes" | `agent-memory/procedure-promotion` | none | - | likely catch | **already covered**, and the corpus is stricter (recurrence counted, stateable outcome, gate on consequence). The source's n=1 promotion is the case the technique's four conditions exist to refuse; its "remind me to review at this stage" is the gate condition. |
| 2 | Skills the author wrote a year ago are already redundant on newer models | [00:02:06] "some of the skills are already redundant" | `agent-instruction-files/substrate-coupled-expiry` | none | - | likely catch | **already covered** by name and mechanism. No new datum: the source asserts it without a measurement. |
| 3 | One chat per narrow task (six for one game) so small details are not lost | [00:07:34] "to keep one narrow context" | `prompt-assembly/task-envelope`, `context-budgeting` | none | - | likely catch | **already covered**. The source's own concession, "technically I can just have one chat", is the honest read: it is a preference, not a measured effect. |
| 4 | A project folder carries context across agents and engines, so switching agent is cheap | [00:06:18] "whenever I want to jump from one agent to another" | `agent-instruction-files/workspace-ancestry-isolation`, `agent-memory/cross-context-promotion` | none | - | likely catch | **already covered**. |
| 5 | Operator time belongs in the local-versus-API cost: ~10 USD saved is not worth ~5 hours; ~10-12 USD per hero asset, ~20-25 with video references | [00:11:47] "saving 10 bucks ... spending like five hours more is a no brainer" | `generative-provider-routing/cost-per-usable-economics` | new-technique or corrects-claim (boundary) | 1/2/1 | partial | **lead** (see below) |
| 6 | A curated vendor MCP spends fewer operator tokens on "which model, which settings" than a generic aggregator MCP, which needs a hand-written skill that pins models and settings | [00:13:28] "if you just say generate me an image, you're not going to get far" | `mcp-tools/tool-schema-design`, `generative-provider-routing/capability-to-vendor-plan` | new-technique | 2/2/2 | partial | **lead** (see below) |
| 7 | Dictation plus a hand-annotated frame dropped into the chat as one message | [00:08:24] "I can draw on the image and then I can actually drop it to the chat" | `voice-io` (voice agents, not review feedback) | new-technique | 1/2/1 | thin | **lead** (see below) |
| 8 | Ask the agent for an HTML report instead of a text report, and keep the layout by saving it once | [00:01:41] | none | none | - | thin | **untriaged**: no mechanism, no failure mode, no number. |
| 9 | Engine-side agent surfaces: a first-party Unreal MCP in 5.8, a first-party Unity CLI, a community Unity MCP "with skills" | [00:15:37] | `engine-integration/*` already pins UE 5.8.3 | resets-clock | 1/2/2 | thin | **untriaged**: a currency signal with no version or date said aloud, so no clock can honestly move. Return when a release note names the surface. |

Not extracted: subscription opinions (the author prefers one frontier lab over another,
cancels a top tier after trying it for a month, calls one lab "out of the league"). These
are one creator's preference and price points on one date; they are not a finding.

**Gate:** rows 1-4 are catches. Rows 5-7 fail `GAIN - RISK >= 2` (rest on prose alone,
one speaker, no primary fetched). Rows 8-9 fail V2/V4-style tests. No fetch was spent:
for a first-party account the fetch is corroboration only for a picked row, and no row
was picked. `fp=0`.

## Leads (each with a return condition)

- **Operator time in the cost-per-usable denominator (row 5).** Read
  `cost-per-usable-economics`: the denominator is price per render over acceptance rate;
  it prices vendors against each other and never against doing the work locally, and the
  words operator time, hours and self-hosting appear nowhere in the subject's techniques
  (grep returned no match). The source's claim is the boundary: the comparison flips when
  the people-time the cheaper route consumes exceeds the saved spend. **Return when** a
  second independent practitioner or a vendor-side cost study states the exchange rate
  with a measured hours figure, or when a connected project routes between a local
  generator and a paid one and records the hours.
- **Curated versus aggregator tool surface for generation (row 6).** `tool-schema-design`
  is about schema; no technique says who owns the default model and settings when the
  tool is a catalogue of many models. **Return when** a second source (a vendor doc or a
  project tree) shows the aggregator's missing defaults causing wrong-model calls, which
  would make it a technique with a failure mode instead of a preference.
- **Annotated frame plus dictation as one review message (row 7).** **Return when** a
  tree is found where the review loop is built this way and a measurable (re-render
  count per accepted asset) exists.

## Phases not run, and why

- 6b render proof: not render-bound; nothing was proposed to change a generator's
  instruction.
- 7.5 apply: nothing landed, so no row is owed. The one seam read, `cost-per-usable-economics`,
  names no managed project.
- 7.6 / 7.7 direction pass and gate: a video, `directions=n/a`, `gate=n/a`.
- No design record: not a repository; routing count n/a.
