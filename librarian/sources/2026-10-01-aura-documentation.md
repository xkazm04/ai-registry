---
source: web:tryaura.dev/documentation
kind: vendor documentation site
url: https://www.tryaura.dev/documentation/
title: Aura documentation - an AI agent for Unreal Engine and Unity, its Verification Agent, crash recovery, profiler and sandbox
author: Ramen (the vendor)
words: 1899
words_in_site: 26972
extracted: 19
accepted: 3
declined: 0
leads: 4
already_covered: 7
untriaged: 3
dispatched: 2
applied: 5
shipped: 5
run_id: in-aura-1001
siblings: 0
fetches: 0
rescan_when: the vendor documents how its Verification Agent runs three cases at once, or publishes per-case latency; or 8 weeks elapse (2026-11-26)
---

# A crash recovery protocol the vendor wrote down, and the gap it exposed in our own grouped boot

**Class:** vendor documentation site, read together with the vendor's own release announcements. It is not in the
class table. It sits between **vendor release announcement** (numbers are the yield) and **first-party operating
documents** (the stated limits are the yield), and the docs half behaves like the second: every page ends in a
"Current Limitations" section, and those sections, not the feature prose, carried the finding. Expected yield, said
before the table: **low**. The corpus already owns the epistemics of runtime verification in depth
(`runtime-observation-evidence`, six techniques, a five-rung ladder) and the guest-application contract
(`engine-integration-safety`); a vendor's product docs mostly restate it. That prediction held: 7 of 19 candidates
resolved to catches. What the corpus did not hold was the *mechanics* of surviving the engine dying mid-run.

**Sweep.** The landing page (1,899 words) is a quick start, not the source; `sitemap.xml` lists 34 documentation pages
and 12 changelog posts. Every Unreal page was ingested (20, 18,652 words) and seven changelog and case-study posts
(6,421 words). **Read in full:** quick start, Verification Agent, Automatic Crash Recovery, Performance Profiling,
Filesystem Sandbox, Custom Agents and Workflows, Aura Skills, IDE/MCP, Advanced Settings, Editor Agent, Coding Agent,
Project Understanding, the 1.0 release announcement (the Verification Agent numbers) and the AccelByte case study
(the lessons section). **Searched by keyword only** (verify, test, PIE, playtest, validate, regress, headless):
level design, behavior trees, blueprints, prompting tips, giving context, materials, art tooling, VFX, audio and the
other five posts. **Not read:** every Unity page, pricing, account and the three troubleshooting pages (each ingested
thin, exit 3). The scope of every statement below is the read half. No web fetch was spent on corroboration: the
site's own pages are the source, as the pages of a reference index are, and the landings are corroborated by code
read in the connected project and by executing it.

Design record (Phase 2d) and routing count: **n/a**. This is documentation of a hosted product, not a tree; there is
no source tree to read decisions out of, and the stated mechanisms are what the vendor chose to publish.
Board: no live siblings at claim time (a hygiene session and an operator edit appeared in the checkout later; none
held a claim).

## Triage (Phase 5; G/R/C; v2.5 gate)

| # | Candidate | Read | Prior art (verified by reading) | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- |
| 1 | A batch carried by one launch that dies partway: completed / culprit / unreached; resume the unreached without the culprit, bounded, each resume making progress; one crash is an observation | real gap | `engine-integration-safety` owns "cut short is its own outcome" per run; nothing owns the batch, the resume or the crash loop | 3/1/2 | **accept** - technique `crash-truncated-batch-resume` |
| 2 | A callee that enumerated its work and then crashed also carries the enumeration, so the enumeration cannot separate "nothing matched" from "cut short" | real gap | `judge-by-log-markers-not-exit-code` step 3 names the enumeration as THE signal | 2/0/1 | **accept** - amendment (found by running the connected project's own path, not stated by the source) |
| 3 | The Verification Agent runs the game and reads live state: actors, ability attributes, widgets, a recorded video | likely catch | `runtime-observation-evidence`: existence, behavioural state, perceptual rungs, bounded evidence | - | **already covered** |
| 4 | "Ask for the outcome, not the implementation": a testable condition | likely catch | `unmeasurable-criteria` in `quality-gates`; the required tier declared in the request | - | **already covered** |
| 5 | "Needs an observable result": an editor-only utility or a behaviour-preserving refactor cannot be verified by playing | likely catch | the golden path refuses a request whose tier the run mode cannot serve; `unverifiable-is-not-fail`. The connected project's own record (a visual gate that returned 0 verdicts in 77 of 77 iterations) is already an applied row | - | **already covered** |
| 6 | "Read the evidence, not just the verdict": the video shows what a pass omits | likely catch | `bounded-evidence-with-provenance`; `quality-verdict-integrity` | - | **already covered** |
| 7 | When something fails, it attempts a fix and verifies again | likely catch | `oracle-frozen-during-repair`, `unattended-build-loop` | - | **already covered** |
| 8 | Two tool servers: a read-only inspector and a mutating editor | likely catch | the connected project holds an accepted direction (session-scoped tool surface, 2026-09-02) | - | **already covered** |
| 9 | Unity's verification is the perceptual rung alone: compile, Play mode, a screenshot judged against the request | likely catch | the ladder places that rung and states its blindness | - | **already covered** |
| 10 | "8x faster": 2-3 minutes to under one minute per case, three cases in parallel | thin | per-case 2-3x, times three parallel is the 8x: a **throughput** figure, not a latency drop. A vendor number | 1/2/1 | **lead** |
| 11 | Three verification cases at once | partial | the corpus serialises one editor behind a lease; the vendor does not say how concurrent play sessions are isolated | 2/2/3 | **lead** |
| 12 | Profile a bounded capture window around the reproduced symptom; manual start/stop beats autonomous capture; an intermittent issue is hard to profile | real gap | perf-as-a-test-stage is **unowned** (grep verified uncapped over `game-production`: only authoring-time and size budgets) | 3/2/3 | **E4 escalation, then accepted by the operator**: banked first as an XL lead (one weak source cannot authorize a subject), then forged in-session on the operator's decision once two engine primaries were read verbatim -> subject `perf-regression-gating` |
| 13 | A virtual filesystem overlay for the agent's asset writes: accept, reject, or leave behind; code is not covered; accept can overwrite a newer file in the real project | partial | `isolation-lanes` covers isolation in general; nothing places an asset overlay against runtime state | 2/2/2 | **lead** (falsifier below) |
| 14 | Code-defined UI gave more predictable agent output than designer-layout UI | thin | one vendor case study, one integration | 1/2/1 | **lead** |
| 15 | A debugger attached suppresses the crash report, so recovery cannot fire | partial | none | - | folded into candidate 1 as a failure mode |
| 16 | Crash recovery fires only when the agent was working and the editor actually crashed; closing it yourself never triggers it | partial | `refuse-dont-kill-a-live-editor` | - | folded into candidate 1 (step 2) |
| 17 | Skills are Claude-compatible `SKILL.md` files under an engine directory that version control ignores by default | thin | `agent-instruction-files` | - | **untriaged** |
| 18 | "The only agent that can playtest itself"; a customer built tutorials in half the time; a studio cut development time 50% | thin | marketing claims, no method | - | **untriaged** |
| 19 | Project memory carried across threads; an index-ignore file; auto-index under 30,000 files | thin | memory lane; no number to price against the measured ladder | - | **untriaged** |

`auto=2/0/1 fp=0`. Escalations: one. The XL row (12) went to the operator rather than being auto-accepted (E4);
the vendor page is thin and authorizes nothing, so the subject rests on the engine's own documentation read
verbatim (two pages), the connected tree, and training-data convergence. Untriaged rows carry no judgment; nobody
verified them. **Candidate 2 is the useful surprise.** The corpus technique that said "the enumeration distinguishes
nothing-matched from truncated" was derived from the connected project's own incident, and the project's batch path
had not implemented the second half. The correction came from executing the project's function, not from the source.

## Landed

- **Technique** `game-production/engine-integration/engine-integration-safety/techniques/crash-truncated-batch-resume.md`.
- **Amendment** `judge-by-log-markers-not-exit-code` step 3, and the golden path's `techniques:` list and one paragraph.
- **Application** `node--crash-truncated-batch-resume.md` against the connected project's grouped boot; ten anchors, all
  held under `check-anchors`.
- **Subject** `game-production/engine-integration/perf-regression-gating`: golden path, 5 techniques, 3 applications
  (see the forged section below), and one pointer added to `deterministic-headless-timestep`'s "When not to use".
- **Connected project** (a coverage change, standing authorization): one commit on its active branch, unpushed. Paired
  proof on a simulated editor, same input both arms, six tests with a deterministic crasher at position three over
  three drain passes: tests with a real verdict **2 -> 5**; existing tests labelled "planned - scaffold available"
  **4 -> 0**; launches **3 -> 4**. Floor held: a clean batch is exactly one launch and a genuinely unregistered name
  still reads "planned" on one launch (both asserted), 528 tests in the surrounding suites pass, typecheck and lint
  clean. **Arm A was run before the fix was written, and it caught a defect in the instrument:** the first measurement
  reported zero mislabelled tests because the label regex matched "planned, not registered" while the batch path wrote
  "planned - scaffold available". With the regex corrected the same run counts four. A metric defined by a pattern
  needs a positive control on the old arm, not the new one.

## Directions: a comparison study, then four accepted proposals executed in the session (Phase 7.6-7.7)

Aura and pof are the **peer shape** (v2.2): both are an agent system that decides whether a change to a game works
by driving the engine. So the pass wrote a 32-point comparison study in the project's own tree (read-only
worker, pinned to the commit before the director's change), not three proposals. **Verdicts: adopt 1, adapt 8,
keep ours 14, different forces 9.** `keep ours` is the largest class, as the method predicts, and the study's
last section lists seven things the project does better. The one `adopt` is a rule, not a mechanism: act on a
repeated crash signature, never a single one (it landed as step 8 of the technique).

The study corrected seven of the director's seed points against the tree. The two that mattered: a manual crash
launcher that clears the recovery directories exists in the engine project (outside the pinned tree, called by
nothing); and the project's **"0 verdicts in 77 of 77" record belongs to the harness's webapp `visual-check`
gate, not to the engine visual gate** the director had assumed. L4 verdict yield is measured nowhere.

At the decision gate the operator accepted **all four** (the three ranked features plus the harness
fatal-marker defect the study found), each built by one worker in its own worktree, each reviewed by the
director against the diff and re-gated, then merged `--no-ff` on a green gate. Nothing pushed.

| Direction | Verdict | The number | Read |
| --- | --- | --- | --- |
| fatal marker outranks a pass in the harness verdict | **better** | 1 of 1 crash-truncated suites certified as a pass -> 0; four floor logs byte-identical in verdict and reason | S, 16 lines. Pinned risk: a benign teardown fault that prints the same marker flips a clean run to unverifiable; no real log exists to settle it |
| test reachability audit | **better** | the runner told a planted unreachable class from a never-written name 0 of 3; the audit flags 3 of 3, clears both controls, flags 0 of 3 tests that carried a verdict | pure module, not wired into the drain. Real tree, one read-only scan: 59 declared classes, 3 actors with no placement evidence. A capture of `Automation List` from 2026-05-24 exists and was used only to check the parser |
| change-class router | **better, narrow** | cannot-judge on 234 of 234 recorded unjudged `visual-check` features, 0 falsified; today's run-end lines name 0 of 234 | **one rule carries the number**: the generated spec sits outside Playwright's `testDir`. All four recorded runs are webapp UI, so the engine and docs classes are unit-tested only. A wrong router trips the falsifier at 126 |
| perf capture stage | **unmeasurable** (engine half) | simulated frame times: 100 A/A pairs, false flags 21-48 for a single-run median rule against 0-2 for the spread-gated rule; detection of an injected 2 ms tied at 20 of 20 | inert until the engine-side controller emits three events it does not emit today; the CSV-profiler flag names come from reading the engine source, not from a run. The falsifier trips from 5% run-to-run drift |

Two findings are the point of the exercise and neither came from the vendor. **(1)** `verify()` records a visual
gate that *failed to run* as a failure rather than as unverifiable, which is why today's run-end lines read 0 pass
/ 83 fail instead of "never judged". It was left alone (scope), and it is the same family as the crash-truncation
defect: a run that never observed anything reported as an observation. **(2)** The simulation of the perf stage
shows the noise-floor gate does not beat a looser fixed threshold on five A/A pairs; only a sweep separates them,
so a five-pair floor is not evidence for the technique being forged.

Full suite on the merged project: 11,244 tests pass, the same five failures as before the session (all outside
these files; confirmed against the pre-change commit in a throwaway worktree).

## What the apply step could not measure

The editor is simulated. The log vocabulary is borrowed from the tree's existing fixtures and no real engine crash log
exists in the tree, so whether a real crash logs a start line naming exactly one requested test is unmeasured; if it
does not, the culprit is unidentified and the resume simply does not exclude it, which the progress guard bounds.
**Instrument that would settle it:** one captured crash log from a deliberately crashing test. The crasher's repeat
count is not persisted, so step 8 of the technique (act on a repeat, not a first sighting) is not enforced in the tree.

## Forged in the session: `perf-regression-gating` (candidate 12; XL spec `librarian/specs/2026-10-01-perf-regression-gating.md`, EXECUTED)

The spec proposed five techniques and the worker wrote five: `noise-floor-before-the-threshold`,
`bracketed-capture-window`, `per-thread-budgets-not-one-frame-time`, `percentile-and-hitch-gate` and
`baseline-bound-to-build-and-machine`, plus the golden path and three applications against the connected project
(94 anchors, all held at `880bfed9`). Placement was verified against `taxonomy.json` (category `engine-integration`,
7 subjects before, 8 after; cap 10).

**Overrides the worker made, and the director kept:** no sixth verdict technique (the five named non-answer reasons
are one paragraph in the golden path); memory and load time left out as siblings with the argument stated; and it
allows a threshold derived from a measured spread to block at its published resolution, while agreeing with the
neighbouring metric-gate standard that a guessed clock threshold must not.

**The spec's premise moved mid-run:** the capture stage the spec called unmerged landed in the connected project
while the worker drafted. The worker rewrote the applications against the merged tree and said each is an
application of the standard built for it, not independent corroboration.

**Primaries.** Two engine pages read verbatim before the worker started, five fetched by it, two CSV-profiler
slugs came back empty (that page is unread). What they support: per-stage budgets, a baseline phase before a named
record, test-state independence across machines, frame caps flooring the presented interval, profiler overhead.
**None states any noise figure, threshold or sample size, so the upper layers carry none** and the replicate count
is a procedure. The vendor page is about diagnosis, not gating, and its claims that manual capture is more
reliable and that tight windows analyse more cleanly rest on no data it gives.

**One corpus edit to a neighbour.** The timestep technique said a fixed step "hides exactly the phenomenon" when
measuring real-time performance. True for pacing, hitching and thermal behaviour; but per-frame *cost* is measured on
a fixed step in the connected tree. A pointer was added to its "When not to use": the boundary is the claim, not the
mode. This is the boundary case the amendment shape is for - no standing sentence became false.

**Not verified:** no pof code was executed by the worker (the sampling-error figure is arithmetic and the claim that
an empty CSV imports as default frames is from reading); the body of one visual-effects perf test is not in the
tree; the simulated A/A results are the gate's, not the lane's.

## Leads (return conditions)

1. **Asset overlay against test side effects.** The vendor's sandbox keeps real files untouched until accept; the
   engine ships it as an experimental plugin on the version the connected project runs. **The study decided it from
   the repo's own evidence:** the recorded order-dependence of the combat tests lives in runtime world state (the
   tests share one map and mutate live actors; only one cleans up), which an asset overlay cannot reach, and the
   vendor itself says code is not sandboxed. So the overlay would not have prevented it, and no technique is
   warranted. Not tested against a real engine (test T-b in the study). **Return:** a captured case of a test
   leaking an *asset* write.
2. **Three verification cases at once.** **Return:** the vendor documents the isolation of concurrent play sessions,
   or per-case latency; or a fleet project grows a second engine slot.
3. **The vendor's speed number** (candidate 10) is a throughput composite. **Return:** per-case latency published.
4. **Code-defined versus designer-layout UI for agent-authored output.** **Return:** a second source, or a project
   measures its visual gate's verdict rate on both.

## Untriaged (nobody verified these)

Candidates 17, 18 and 19 above, plus two dated facts with no application citing them: a workflow is capped at ten
sub-tasks, four at once, 35 minutes; and up to about four prompts run in parallel in one chat.
