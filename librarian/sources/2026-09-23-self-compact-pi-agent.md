---
source: self-compact-pi-agent
kind: first-party practitioner build-walkthrough (devlog video, with a three-harness bake-off segment)
url: https://www.youtube.com/watch?v=3b0U4_02bAE
title: "Self-Compact Pi Agent: ZERO HYPE Agentic Coding Devlog"
author: IndyDevDan
words: 6214
extracted: 12
accepted: 1
declined: 0
already_covered: 5
untriaged: 4
leads: 3
dispatched: 0
applied: 1
shipped: 0
run_id: intake-3b0U4
siblings: 0
---

# The wall is where the price steps, not where the window ends

A builder writes a spec for a self-compacting coding agent and hands it to three
harness/model pairs side by side. The agent gets its own compaction tool with a
note-to-self, three occupancy thresholds (notice, warning, forced), a context bar
that marks them, and a replacement for the harness's default compaction prompt. The
defaults are set by price, not by window: *"the GPT models price basically doubles
when you hit the 270K mark... soft warning at 225... hard warning at 250, and then
we'll force at that 270 mark"* `[00:11:09]`.

**Class and expected yield, said before the table:** practitioner build-walkthrough.
This is a build log from one afternoon, with no months of operating behind it. The
tour half shows the solution. The operating half is what happened on screen: one
model ran out of window, a notice was ignored, a compaction fired. Expected: mostly
catches against `prompt-assembly`, which already holds four compaction schedules,
and at most one boundary case. That held: 5 catches, 1 amendment, 1 of 3 fetches.

**Board:** 0 siblings live at claim. The shared checkout carried uncommitted work
from sessions not on the board (`skills/contest`, `skills/motionize`, this skill's
`SCORECARD.md`). The regenerated `catalog.json` hashed the motionize WIP, so the
catalog was built in a detached worktree of HEAD.

## The landing: a price step is a second compaction wall

The source hardcodes its thresholds to one vendor's price step. The corpus places
every compaction threshold as a fraction of the window
(`amortized-compaction-cadence`: *"cross a stated fraction of the advertised
window"*), and `compaction-horizon-breakeven` says *"the wall overrides all of it"*
with the window as the only wall. Its arithmetic prices a token the same at any
occupancy.

Corroboration:
- **Corpus-internal, from the other side of a bundle boundary.** The observability
  bundle's price book already states that above a provider-declared input threshold
  *"characteristically the entire request reprices, not just the tokens past the
  threshold"*, and encodes it as a tier row. The compaction techniques never read
  that fact.
- **A primary, fetched in-run, which corrected the source's premise.** The vendor
  pricing page for the harness this fleet runs says its current generation bills
  *"the full 1M token context window at standard pricing. (A 900k-token request is
  billed at the same per-token rate as a 9k-token request.)"* Steps exist on some
  models and not others, and they move between generations. So the source was right
  that a step is a wall, and wrong to write it into the harness as a constant. The
  landing says both: compact regardless within the reserve of a step, and read the
  step per model from the price book at session start.
- The source itself reports a second vendor's step at ~270K. That claim is not
  independently verified here and is cited in the technique only as "reported".

Landed as an **amendment** (boundary case, not mechanism): a section "When the price
book moves the wall", one decision rule, one `use_when` entry, and a golden-path
clause. Every existing sentence in the file stays true.

## Apply: the tier wall replayed over this fleet's own sessions (experiment)

Declared focus (can both arms be imported as they are?): yes, but not from a
project tree. No fleet project owns a compaction trigger. `git grep` over personas,
tracklight, pumper, athena-everywhere, pof, ascent and politicas found none: the
nearest are fixed per-section token budgets and a CLI-usage reader. So both arms
were rebuilt from the same instrument the 2026-09-16 break-even row used: this
checkout's own coding-agent session records.

- Instrument check: the replay counts **9** threshold compactions. The 2026-09-16
  replay independently counted **8** over 166 sessions of the same records.
- Population: 190 sessions, 26,299 requests. **60.3% of requests ran above 200K
  tokens and 37.1% above 272K**, while the harness compacted near 1M.
- Arm A: compaction as it happened (window wall). Arm B: compact within a 16K
  reserve of a step, restart at the observed median post-compaction size (66K).
  Cost is priced as reads at 0.1x, new tokens at 1.25x, and the whole request at 2x
  above the step.

| book | B wall | A | B | B/A | compactions A -> B | B repaid (break-even) |
| --- | --- | --- | --- | --- | --- | --- |
| step 272K x2 | 272K | 1225M | 495M | 0.40 | 9 -> 187 | 186/187 |
| step 200K x2 | 200K | 1380M | 420M | 0.30 | 9 -> 373 | 368/373 |
| flat (this vendor) | 272K | 775M | 495M | 0.64 | 9 -> 187 | 180/187 |

**Target:** the step premium on the same traffic is +58% (272K) with no wall, and
zero with it. **Floor:** declared as task outcome after compaction. It is **not
measured**: compactions rise 20x and each one is lossy. **Verdict `unmeasurable`.**
The instrument that would measure it is a compaction-fidelity probe that re-asks
facts from before the fold and counts what survives, e.g. a memory-year arm, or a
replay that scores post-compaction continuity.

**Where the seam could falsify, and what it refuted.** The flat-book row was the
falsifying arm. If the step were the only force pulling the wall below the window,
a flat book would show B no better than A. It showed B/A = 0.64 from prefix reads
alone. So the window is not where the economics put the threshold on either book.
That is written into the technique as a warning, not a rule, because its fidelity
cost is unmeasured.

No application document was written: no project tree was opened, and the session
records are not a published stack. The row lives in `librarian/applied.md`.

## Catches (already covered, and covered better)

| # | Candidate | Anchor | Where the corpus owns it |
| --- | --- | --- | --- |
| 2 | Agent-owned compaction tool + note-to-self | `[00:08:36]` "leave a note to themselves" | `session-continuation/compaction-checkpoint`: harness checkpoint + model-writable notepad as two channels, and the loop depends only on the first. `compaction-horizon-breakeven` already takes its trigger from model-declared plan boundaries, with harness arithmetic deciding. The source lets the model decide with no arithmetic, and its own demo shows the cost (row 3). |
| 5 | Definition of done + "how you're graded" rubric | `[00:07:18]` | `prompt-assembly/task-envelope`: a done criterion and a self-check; the measured record shows role priming buys nothing. "Rubrics tap training" is unfalsifiable as stated. |
| 6 | Bake-off isolation: own dir each, instant-fail on reading a sibling | `[00:13:40]` | `eval-harness/candidate-write-access`, `test-harness/isolation-lanes` |
| 8 | "Half the time, a fraction of the tokens" | `[00:17:55]` | `eval-harness/outcome-conditioned-cost`. The source's own figures compare final occupancy (500K vs 136K), not spend, and cached re-reads dominate spend. |
| 11 | Count compaction cycles | `[00:25:55]` | `amortized-compaction-cadence`: judge on "how many threshold compactions actually fired" |

## Leads

- **L1 - The compaction prompt is steerable, not always replaceable** (row 4,
  `[00:24:13]` "you cannot override" one harness's). Partly contradicted from
  training data: that harness takes compaction instructions and a pre-compaction
  hook, but its default prompt cannot be replaced. Return: when an
  `agent-cli-transport` capability matrix needs a compaction column.
- **L2 - A reasoning-heavy open-weights model spent its window on thinking**
  (row 9, `[00:17:04]` "98% context. It cannot do this job"). n=1, dated. Return:
  when a fleet local-model lane records per-turn occupancy and the split between
  reasoning and output.
- **L3 - Threshold placement below the window is an economic lever on flat books
  too** (this run's own replay, B/A 0.64 at 272K on a flat book). Return: a
  compaction-fidelity instrument that can price the loss per compaction. Then the
  break-even can weigh both sides, and the window-fraction default in
  `amortized-compaction-cadence` can be re-derived.

## Untriaged (extracted, never verified - carries no judgment)

| # | Candidate | Anchor | Why not landed |
| --- | --- | --- | --- |
| 3 | Deliver occupancy to the model in graded notices (notice / warning / forced, with tools locked at the last rung) | `[00:04:41]`, `[00:23:23]` "a large self-compact window... a shorter gap between the warning and the force" | Promoting question ran: nothing in `llm-agent` or `agent-operations` delivers occupancy to the model as prompt content, so it reads as a **real gap**. G2/R1/C2 fails +2. The source's own demo is the counter-evidence: under the soft notice the agent reasoned *"1 million. I have plenty of room"* `[00:22:08]`. It read the percentage against the window it knew, not the policy it was given. A second source, or a fleet harness that injects occupancy, promotes it. The boundary to carry: a notice must state the budget it enforces, not a share of the window. |
| 7 | "If you mistakenly cause a failure, stop immediately and report" | `[00:14:06]` | thin: one prompt line, no observed effect |
| 10 | Context bar: cached / uncached / free with threshold markers | `[00:09:26]` | an application-level UI. `llm-observability/operator-surfaces-for-llm-spend` is the home; no fleet seam proven |
| 12 | One model writes better compaction prompts than another | `[00:25:30]` | thin: n=1 opinion |

## Triage (admission scored under v2.5; currency and leads under the corroboration table)

| # | Shape | Read | G/R/C | Rule | Decision |
| --- | --- | --- | --- | --- | --- |
| 1 | amendment | real gap | 2/0/2 | score (boundary 1 + convergence 1; primary fetched and files opened, append) | accept |
| 2 | technique | likely catch | - | - | covered (opened) |
| 3 | technique | real gap (promoted) | 2/1/2 | score | untriaged |
| 4 | currency | partial | - | corroboration table | lead |
| 5 | technique | likely catch | - | - | covered (opened) |
| 6 | practice | likely catch | - | - | covered |
| 7 | technique | thin | 1/2/1 | score | untriaged |
| 8 | correction | likely catch | - | - | covered |
| 9 | lead | thin | - | corroboration table | lead |
| 10 | application | partial | 1/2/2 | score | untriaged |
| 11 | technique | likely catch | - | - | covered (opened) |
| 12 | - | thin | - | - | untriaged |

`auto=1/3/0`, `fp=0`. Altitude: the landing is a **technique**-level boundary that
cites dated facts, not a dated fact alone. The dated part (which vendor has a step,
and where) sits in the price book, where it can go stale safely.

Directions: n/a (a video; no design record). Render: n/a (no render-bound row).
