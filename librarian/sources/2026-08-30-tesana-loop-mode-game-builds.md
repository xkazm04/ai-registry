---
source: youtube:gvPMjz08DDA
kind: sponsored second-hand practitioner review with a build-walkthrough half
url: https://www.youtube.com/watch?v=gvPMjz08DDA
title: "AI Agent Builds My Game in a Loop Until It's Done"
author: one game-focused creator (sponsored by the vendor demoed)
words: 5045
extracted: 13
accepted: 1
applied: 1
shipped: 0
declined: 0
leads: 2
already_covered: 4
untriaged: 5
dispatched: 0
fetches_spent: 0
---

# A sponsored loop-mode demo, mined for its operating half

Part of [[index]].

## The class, and the expected yield

A creator demoing a vendor's game-building agent, on the vendor's credits, across
five games he actually built. The tour half is product names and proper nouns and
the strip test deletes it whole. The operating half is a first-party account at n=5
builds: what each loop was given, how long it ran, how many prompts followed, and
where those prompts went. Expected yield stated before triage: catches and leads,
with at most one finding from the operating half. That is what arrived, and the one
finding is the run's whole value. Zero of three fetches spent: the finding was
corroborated by a connected project's recorded runs, which is a better instrument
than the web for a claim about loops.

**Unattended run.** Only the row read `real gap` advanced; `partial` and `likely
catch` rows are recorded untriaged below, unverified.

## Candidates

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Bound the loop by a credit budget | `unattended-build-loop` (budget-reservation-and-drain-not-kill) | none | likely catch | [00:02:31] |
| 2 | K | technique | M | Post-loop prompts land where no gate could look | `unattended-build-loop` | new-technique | **real gap** | [00:08:24], [00:15:59] |
| 3 | K | technique | M | Mechanics come out sound; levels and balance do not | `procedural-level-planning`, `encounter-balance-simulation` | none | likely catch | [00:09:14] |
| 4 | K | amendment | S | Report wall time beside spend | `unattended-build-loop`, `background-jobs` (loop-health-telemetry) | none | partial | [00:11:45] |
| 5 | K | lead | M | Agent-proposed next steps as a demand generator | `hitl-approval` / `plan-review` | none | thin | [00:04:11], [00:21:28] |
| 6 | K | technique | S | A plan approved unread is no gate | `plan-review` (2026-08-28) | none | likely catch | [00:11:20] |
| 7 | K | amendment | S | Visual defects need the image channel | two-channel feedback contract (2026-08-27) | none | likely catch | [00:12:10] |
| 8 | K | technique | M | One-action runtime-error report from inside the artifact | `runtime-observation-evidence` | none | likely catch | [00:21:02] |
| 9 | P | practice | S | Can the artifact leave the platform | `generative-provider-auditing` | none | thin | [00:02:06] |
| 10 | K | currency | S | No generative rigging for non-humanoid meshes | `motion-quality-gating` | dates-application | thin | [00:23:09] |
| 11 | K | technique | S | A library is agent-usable only if each entry is described | `catalog-pipeline-authoring`; the registry's own `use_when` | none | likely catch | [00:01:16] |
| 12 | K | amendment | S | The same defect class recurred across independent builds | `engine-pitfall-corpus` | none | likely catch | [00:15:31] |
| 13 | - | - | - | Multi-model orchestrator | - | none | nothing after the strip test | [00:00:51] |

## Accepted

### 2 - Post-loop prompts land where no gate could look -> `verifier-coverage-review-agenda`

The claim, in the source's terms: every loop ran four to five hours and came back
with "mechanics and game logic on an excellent level"; the six to ten prompts that
followed were "mainly all about visuals, really not about gameplay" - the home
screen, the loading screen, an inverted effect - and this held for four of five
games. Two further observations (default screens uniformly weak across every game;
loop hours versus prompt count) are folded in as its evidence.

Strip test: a loop converges on what its gates can verify and stalls on what they
cannot, so the human's post-run effort is the complement of verifier coverage and
is predictable before the run ends. Something survives.

Home: `game-production/craft-judgment/unattended-build-loop`, whose golden path asks
"what may it conclude?" and answers "only what a party other than the producer
verified" - but whose techniques model the gate that *cannot run* (preflight) and
the number that *was not verified* (two numerators), not the item whose only
verdict came from a gate that could not see its requirement. A missing stage, at
run end, between the loop and the reviewer.

Corroboration: real code plus recorded runs in a connected project (see the
application, `node--verifier-coverage-review-agenda`), and training-data
convergence - an autonomous builder optimises for what its gate measures. The tree
made the finding bigger than the source: the perceptual gate was configured,
advisory, excluded from preflight by design, and returned zero verdicts in 77 of 77
deciding iterations while 234 features were marked done. Applied as an `experiment`
over the four recorded runs; verdict `better`; row in [[../applied]].

## Already covered

- **1** - the loop's credit budget is `a-budget-shapes-the-output` and
  `budget-reservation-and-drain-not-kill`, which additionally hold the
  reserve-before-launch and drain-not-kill rules the source has no view of.
- **3** - "you have to play a lot to see if it is balanced" is what
  `encounter-balance-simulation`'s monte-carlo presets replace, and "there must be a
  level editor or a way to explain how a level should be organised" is
  `procedural-level-planning`'s designer-paragraph-to-room-graph contract. The source
  located the gap and the corpus already owns both halves; the observation is folded
  into candidate 2 as evidence of where verifier coverage is thin.
- **6** - "I approved the plan without reading anything" is `plan-review`'s
  premise, landed 2026-08-28.
- **11** - "described libraries, so the agent knows how to combine them" is the
  registry's own `use_when` discipline and `catalog-pipeline-authoring`.

## Untriaged (extracted, reached the table, never picked - nobody verified these)

- **4** - the loop did not display its wall time; the creator wanted it. Possibly an
  amendment to the budget-report rule (report duration beside overshoot width).
  [00:11:45]
- **7** - an inverted effect was only fixed once a screenshot was attached, in two
  separate builds. Likely a corroboration line for the two-channel feedback contract
  landed 2026-08-27; would convert it from single-source. [00:12:10], [00:15:31]
- **8** - a "fix it" control inside the running game that reports an internal error
  back to the agent. Likely covered by `runtime-observation-evidence`'s observation
  spine; the one-action affordance may be an amendment. [00:21:02]
- **9** - "not a black box; export the source and continue locally." Practice-level,
  no bundle home found; thin. [00:02:06]
- **12** - the same effect-inversion defect appeared in two independent builds from
  one asset library. Shape of an `engine-pitfall-corpus` entry; needs the library's
  side to say why. [00:15:31]

## Leads

- **5** - after every pass the agent proposes the next feature and the operator
  accepts with one action; the creator calls it addictive twice. Strip:
  agent-proposed scope consumes budget nobody allocated, and a plan gate that admits
  suggestions by default is not the gate `fixed-policy-amendable-plan` describes.
  Return condition: a second independent source describing the same mechanism, or a
  managed project growing a suggestion surface on its loop. [00:04:11], [00:21:28]
- **10** - dated capability: generated non-humanoid meshes cannot be rigged
  automatically; humanoid rigging works. Currency for `motion-quality-gating` /
  `generated-asset-world-scale` if either cites a rigging step. Return condition: a
  primary source (a generator's docs or a paper) stating the rigging boundary, or a
  project that needs a non-humanoid rig. [00:23:09]

## Dropped

- **13** - "an orchestrator that includes several models" - nothing survives the
  strip test that `model-routing` does not already say.

## Method notes for the next run on this class

- The tour half of a sponsored demo is worthless and the operating half is worth
  one finding; the discriminating sentence was the creator's own count of what his
  prompts were about. Read the prompt history the creator shows on screen before
  the gameplay.
- A managed project's *recorded run state* corroborated a claim about loops better
  than a fetch would have, and it made the finding larger. For a claim about
  unattended runs, look for a tree that keeps run state before opening a browser.
