---
source: "I Made a Vox-Style Explainer Video With One Prompt (Claude)"
kind: practitioner build-walkthrough (promotional half dominant)
url: https://www.youtube.com/watch?v=0-kbZa8Dagg
title: "I Made a Vox-Style Explainer Video With One Prompt (Claude)"
author: "Zubair Trabzada | AI Workshop"
published: 2026-07-27
duration: 1187s (19:47)
words: 4285
transcript_kind: ASR (auto `en-orig` track — unpunctuated; NO sentence-level claim rests on exact wording)
extracted: 8
accepted: 0
declined: 0
untriaged: 1
leads: 2
already_covered: 4
applied: 0
shipped: 1
dispatched: 0
run_id: yt-0kbZ-0909
siblings: 2
---

# Vox-style explainer "with one prompt" — Claude Code + Higgsfield MCP

**Operator brief.** Media-generation domain; impact on the prompts and artstyle of the
`gravity` project (`gravitone-gcloud`).

**Siblings live at claim time: 2** — `llmfit-0909` (a repository, software-engineering)
and `yt-yRxm-0909` (another YouTube source). A third, `intake-marketing-0909`, appeared
mid-run at phase 7 holding `marketing/bundle`, an entire new uncommitted bundle. Neither
held a media-generation subject, so no contention on this run's targets.

## Class, and the yield it predicts

A **practitioner build-walkthrough whose promotional half dominates**: an affiliate link
to the vendor it demonstrates (Higgsfield), two Skool community upsells, and a "free
prompt pack" the video exists to distribute. The class rule says route per half — the
demo half shows the solution and hides the problem, the operating half is a first-party
account. Here the operating half is thin and the demo half is most of the runtime, so
**expected yield was low: catches, a currency signal, and leads.** That is what it
produced, and the number is calibration rather than failure.

The class also predicted where the boundary would be missing: *the segment it is
proudest of*. The wrap-up at [00:17:02] is "very cool ... does a really good job", with
no measurement, no consistency check and no failure discussed.

## Ingest — the instrument failed, and the failure was the run's most reusable finding

`research-ingest` exited **2** (instrument failure, not a thin source) on HTTP 429 from
YouTube's caption endpoint. Six backoff attempts over ~19 minutes and four hand variants
(`tv`, `web_safari`, `android`, `ios` player clients; `--cookies-from-browser chrome`,
which cannot copy a locked cookie DB while Chrome runs) all failed identically.

The cause was not throttling. **The script's "retry" ran the same command twice**, so a
shape-specific rejection failed twice and reported itself as transient. The working shape
was a different triple — `json3` format, the `en-orig` track, and `--impersonate chrome`
— which succeeded on its *first* try in the same minute from the same IP. Two facts
underneath it: YouTube now gates `timedtext` on a browser TLS fingerprint (so `curl_cffi`
must be installed or every impersonate target reads `unavailable`), and **`en.*` does not
glob to `en-orig`**, so rung 1 can 429 on `en` while the original-language track is
served fine.

Landed as a fix to `scripts/research-ingest.mjs` — see "What landed".

## What the source actually is

One human prompt, expanded by an agent. Two forms, and the second is the interesting one:

- **A prompt pack** [00:05:03]: a long staged prompt with the topic slotted in, organised
  as "six blocks for one object" [00:05:13].
- **A skill file** [00:09:39]: `vox-motion-graphics.skill`, attached to Claude Code. The
  human prompt is then context-free — *"Create a 1-minute explainer video about a
  relevant topic related to AI"* — and the agent reads the skill for the vendor, the step
  order and the format. *"I never explained to use Higgsfield ... in that skill file, all
  of the instructions are there"* [00:11:24].

Stack: Claude Opus 5 (also Fable 5; Sonnet untried) + Claude Code + Higgsfield MCP, with
Nano Banana Pro for images [00:08:44]. The plan line the agent prints reads "six blocks,
10 seconds each, 60 seconds, 9x16 vertical" [00:12:01].

## The finding the title promised, and what it actually turned out to be

The title reads as a challenge to the corpus's two-block law (`two-block-style-and-action`,
`style-block-restated-every-call`). It is not. **The two blocks still exist; the agent
authors them instead of the human.** "One prompt" describes the human's input, not the
model's.

The real observation is an **absence, and it is the strongest thing this source carries**:
across 4,285 words about producing a *style-defined* genre, there is **no style lock of any
kind**. Zero occurrences of palette, colour, reference sheet, consistency, or character
continuity. The entire artstyle payload is the phrase "Vox style" inside a skill file.

Measured against `visual-style-locking`, that is the subject's **first enumerated failure
mode** — *"The vibe style — mood words instead of an attribute grammar; every call
re-interprets, every frame differs."* So the source is a live demonstration of a failure
the corpus already owns: an **already-covered catch**, not a gap.

Two honest wrinkles, both banked rather than landed (see Leads):

- It ships anyway, at **six shots**. The corpus's subject is written for the forty-frame
  case and states no lower bound.
- "Vox style" is a *publication house style*, not a mood word — a proper noun whose
  subject attractor is structurally absent, which is the one case
  `medium-vocabulary-locking`'s proper-noun rule scopes itself away from.

## Triage table

Rows targeting the upper layers are scored (v2.5/v2.8); the currency row runs under the
corroboration table instead, which lets a source authorize it alone.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Skill file carries the production contract; human prompt is context-free | se/llm-agent/prompt-and-context/`agent-instruction-files` [15t 15a] | none | likely catch | — | **already covered** |
| 2 | K | amendment | M | A publication house-style name is a style token, not a content token | mg/.../`medium-vocabulary-locking` | new-technique? | partial→real | 3/2/2 = +1 | **untriaged** (V2) |
| 3 | K | technique | M | Six blocks x 10s fixed grid decided before generation | mg/narrative-craft/`short-form-narrative-structure` | none | likely catch | — | **already covered** |
| 4 | K | correction | M | "If the number is disputed, use the conservative figure" | mg/.../`unknowns-as-constraints` | none | catch — corpus refutes source | — | **already covered** |
| 5 | K | lead | S | Aspect-ratio switch re-routes style through a different vendor preset | mg/visual-generation/`generative-provider-routing` | none | thin (ASR garbled) | — | **lead** |
| 6 | K | technique | S | Agent verifies MCP reachability before spending | se/llm-agent/runtime-and-io/`mcp-tools` | none | likely catch | — | **already covered** |
| 7 | K | currency | S | Agent-orchestrated end-to-end video through one MCP is a working consumer workflow | mg/production-ops/`production-pipeline-phasing` | resets-clock | real | corroboration table | **accept** |
| 8 | K | lead | M | No style lock at N=6; the subject is written for N=40 and states no lower bound | mg/visual-generation/`visual-style-locking` | none | partial | — | **lead** |

### Row 4 is the best catch, and it is a contradiction

The source's research step instructs: *"Cross-check every number against at least two
independent sources ... If the number is disputed, use the conservative figure"*
[00:07:40]–[00:07:49].

The corpus refutes this at **both** steps, which is why it is a catch and not a finding:

- At the draw step, `precision-limit-propagation` — *"Medium confidence or disagreeing
  sources -> shapes and proportions, not values ... A band drawn where sources span a
  range is more informative than a false midpoint, not less."*
- At the script step, `unknowns-as-constraints` — use_when carries "sources disagree on a
  figure", and the rule is *"the script uses a ratio, not a number"* and *"never pick one
  silently."*

"Use the conservative figure" **is** picking one silently. It is the durable version of
the error because it feels like the responsible choice, and it renders as an exact spoken
figure ("about 140 targets", "56 ships"). The corpus is ahead of the source here.

I went looking for a missing stage — a band cannot be *spoken*, so the script step needs
its own policy — and `unknowns-as-constraints` already owns exactly that. Recorded so no
later run re-derives it.

### Row 2 — the promoting question, executed

*Question:* does `medium-vocabulary-locking` already admit the house-style case?

*Answer (one file read):* it scopes the hazard itself — *"the exposure is not 'did I name
a work' alone, it is 'did I name a work known for this kind of subject'."* A publication
house style is the case where subject overlap is structurally zero: Vox explainers cover
any topic, so the name carries a look with no content attractor. The technique's own
remedy — strip the name, put its signature features in exclusions — would *lose*
information there, so the rule plausibly **inverts**.

That promotes the read from `partial` to `real gap`. It does **not** clear **V2**: an
amendment to a technique needs a primary fetched in-run, training-data convergence, or
code read in a tree, and the only evidence that a genre name *locks* anything is a
promotional demo I cannot inspect. **A veto is absolute and a score may not overturn it**,
so the row is recorded untriaged with its anchors, carrying no judgment. Fetch budget was
available (0 of 3 spent) and deliberately not spent: no primary would settle an empirical
claim about one vendor's model on one 60-second render.

## Leads

- **Style locking below the drift threshold.** `visual-style-locking` opens on "forty
  generated images" and never states the shot count at which locking starts to pay. This
  source ships six shots with no lock at all. *Return condition:* when a project measures
  look drift as a function of shot count — gravity's `consistency-control-arm` seam and
  its `pipeline/style-ref-stability.mts` could run it directly.
- **Format switch re-routes the vendor preset.** At [00:13:01] switching to 16x9 produced
  "a custom landscape style key instead of a vertical preset", and "three earlier
  submissions were intercepted by a preset". If a preset is keyed to aspect ratio, then
  changing format silently changes the style path — which would defeat a project-owned
  style block without any error. The ASR is garbled here and this is one vendor.
  *Return condition:* when a project generates the same locked style at two aspect ratios
  and compares.

## The seam hunt as a second source (round-43 focus #2) — the run's verified finding

Applying the focus paid, and the finding is about `gravity` rather than about the video.

`visual-style-locking` (6 techniques) joins **no gravity context at all**, while 14 of 20
media-generation subjects do. The cause is not staleness — the subject was forged
2026-08-19, well before the map was generated 2026-09-06.

The cause is a hole in the context map. Of 208 mapped paths, these are absent:

| path | context |
|---|---|
| `lib/stylePrompt.ts` — self-described "STYLE BLOCK -> PROMPT. The one compiler." | **none** |
| `lib/themes.ts` — defines `ColorRole` / `StyleBlock` | **none** |
| `app/_phases/frames/shotPrompt.ts` | **none** |
| `pipeline/foundry/styles.json` | **none** |

That single hole explains both symptoms: the subject governing the artstyle system joins
nothing, and `image-prompt-composition` attached instead to `lib/imaging/*`, the vendor
transport — producing the recorded `deviation` in which 8 of 11 techniques evaluated
"not-applicable". A conformance worker diagnosed exactly this on 2026-08-29 and proposed
re-pointing the subject at the compiler; nobody acted on it.

**Not fixed, deliberately.** `context-map.json` is on gravity's manifest `neverTouch`
list: it is generated by the Personas app from its own database, and a hand edit "is
erased by the next scan and, until then, is read as truth by /perfect, /explorer and
/uat". A local fix would be both temporary and actively misleading. The fix belongs
upstream in the Personas scan. Reported to the operator; no project commit.

This is a `ship 0` of a **third kind** — not "no seam exists" and not "the owner's call",
but "the seam is real and inside a boundary this method may not cross". The scorecard row
says so rather than flattening it into the other two.

## What landed

**One change, in the `scripts/` lane** (judgment, no gate):
`scripts/research-ingest.mjs` — the caption retry became a **ladder** instead of a repeat.
Three rungs, each a different (format, track, transport) triple, so a rung that fails for
its own reason tells the next one nothing. Adds a `cleanJson3` reader with the same
rolling-ASR dedupe `cleanVtt` has (without it an auto track inflates its own word count
several-fold and `--min-words` reads a thin source as thick), reports the winning rung in
`caption_rung`, and names `curl_cffi` in the fatal when impersonation was unavailable.

Asserted against the source that defeated it: exit 0, 4,285 words, rung
`json3/en-orig,en.*/impersonate`. Rung 1 is still tried first, so the common case is
unchanged.

**No knowledge-layer content landed**, and no apply rows are owed: Phase 7.5 owes one row
per landed technique, golden-path correction or amendment, and this run landed none of
those. Four catches, one untriaged row, two leads and a currency signal is the honest
yield of a promotional build-walkthrough aimed at a subject pair that already carries 17
techniques.
