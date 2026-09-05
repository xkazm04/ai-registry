---
name: dojo
description: "Autonomous infinite training loop for media-generation craft: each cycle reflects prior human verdicts into the consuming repo's prompt surfaces, scans the registry for the weakest knowledge dimension, researches one candidate technique, generates seed-matched A/B pairs with the LOCAL image/video stack, machine-judges them pairwise, and parks the cycle for human gating in the app's Foundry -> Dojo tab. Human verdicts are consumed by the NEXT cycle, never immediately; approved improvements land as prompt-recipe edits and return to the registry as leads. Runs only where the overlay declares a runner (GPU machines); elsewhere it stops at generation and says so, or fabricates a plausible cycle with --fixture for surface and protocol testing. Use to keep image/video prompt recipes improving unattended, to drain parked human verdicts into code, or to exercise the Dojo tab without hardware. Invoke with /dojo [run|status|reflect|--fixture]."
argument-hint: "[run|status|reflect] [--fixture] [--resume <cycle-id>]"
category: ai-native
memory: project
version: 1.2.2
tags: training, media-generation, ab-testing, judge, foundry, loop, craft
allowed-tools: Read, Write, Edit, Bash, PowerShell, Glob, Grep, Monitor, WebSearch, Agent
---
# Dojo — the infinite training loop

A **long-running loop** that trains CRAFT, not weights. The unit of improvement is
a *technique injected into a prompt recipe*, proven by seed-matched pairwise A/B
against the incumbent recipe, gated by human eyes in the app, reflected into the
consuming repo's prompt surfaces, and returned to the registry as leads. Scores
are a pre-filter, never a verdict — the human's pick is the verdict, and the
disagreement between score and eye is the finding worth keeping.

The loop never writes `knowledge/`. It produces EVIDENCE — cycles, pairs, picks,
ledger rows — and hands that evidence to `/deepen` and `/intake`, which own the
corpus. If the answer is "research this subject", the answer is `/deepen`,
dispatched from here; dojo never re-implements its lanes.

The human is never waited on. Cycles park in `awaiting-gate` and accumulate;
whoever opens Foundry -> Dojo gates them on their own clock (K approve / X reject
/ U clear); whichever future cycle runs Phase 0 next consumes the verdicts. That
one-cycle lag is the design, not a limitation: reflection reads a settled ledger,
never a human mid-decision.

## Invocation

```
/dojo run                 # the loop: reflect, then cycle until budget or breaker
/dojo status              # read manifests + ledger, touch nothing
/dojo reflect             # Phase 0 only: drain approved verdicts into code, then stop
/dojo run --fixture       # no runner needed: fabricate a plausible cycle end-to-end
/dojo run --resume <id>   # continue a cycle stopped by budget or a dead process
```

## State and overlay

**All mutable state lives in the CONSUMING repo.** The lane forbids `state/` in a
skill directory for exactly this reason — a copy that mutates diverges on first use.

- `foundry-out/training/<cycle-id>/cycle.json` — the cycle manifest, **the only
  state**. Everything else (pairs on disk, verdicts, logs) is addressed from it.
  The full wire contract is `references/cycle-contract.md` — field names there
  are shared truth with the app's implementation; never rename one side.
- `pipeline/foundry/training-ledger.json` — the git-tracked verdict ledger, the
  cross-machine sync channel. A GPU box generates and parks; any machine that
  pulls sees the human's verdicts; the next Phase 0 anywhere reflects them.
- `pipeline/foundry/training/thumbs/` — one tracked thumbnail per approved
  improvement, the only media that survives a commit.

The overlay `.claude/dojo/config.md` in the consuming repo declares:

| Key | Meaning |
| --- | --- |
| `runner` | Command templates for the local model stack — image and video generation. **Absent on machines without GPUs.** |
| `budget` | Hard spend/time ceiling per cycle window. |
| `dimensions` | The knowledge dimensions this repo trains (allowed subjects). |
| `promptSurfaces` | The reflection map: which file owns which recipe decision. For gravitone: `pipeline/FRAMES-SCENE-PROMPT.md`, `lib/formatBrief.ts` direction[], `app/_phases/frames/shotPrompt.ts`, `lib/foundry/extract/prompts.ts`, `lib/music/plan.ts`. |
| `judges` | The judge providers, and (once earned) which judge is pinned. |

**No runner declared** -> the loop still runs Phases 0-3, then stops at Phase 4
with `runner: absent` and says so plainly — reflection and planning are worth
doing on any machine. Unless invoked with `--fixture`, which fabricates a
plausible cycle (manifest, pairs, picks, parked state) for surface and protocol
testing — design-mastery mode for machines that cannot generate. A fixture cycle
is marked as such in its manifest log and never reaches the ledger as evidence.

## The cycle

Announce each round boundary out loud, scan-sweep's way: `── Cycle <n>:
<dimension>/<subject> ──`. A loop whose cycles are not visible reads as one
runaway session. Each cycle is self-contained — its manifest is written before
the next cycle is chosen, so an interrupted loop loses only the cycle in flight,
and `--resume` picks that one up from its `status`.

### Phase 0 — Reflect (the first act, always)

Read `training-ledger.json` for rows with `reflected: false` and a human verdict.
For each **approved** row:

1. Edit the named prompt surface's DECISION part — a new numbered rule, a
   direction line, a recipe clause — citing the technique by name. The edit goes
   where the overlay's `promptSurfaces` map says that decision lives, never
   guessed from a grep.
2. Add or extend the surface's **regression control**, so the rule cannot silently
   fall out of the prompt later. `FRAMES-SCENE-PROMPT.md` has none — create one on
   first touch, shaped like the repo's existing `pipeline/*-regression.mts`.
3. Commit on a branch for operator review — reflection edits product prompts and
   is never merged by the loop itself.
4. Stamp the row `reflected: <sha>`.
5. File one lead line to `.ai/registry-leads.jsonl` — **earned**: the human
   approved AND the edit landed. Log the consult to `.ai/consults.jsonl`.

A **rejected** improvement gets verdict `not-better` in the ledger and is itself
reflection input: the next plan avoids the failed direction, and the not-better
row is filed as a lead too. Rejections are the most valuable rows — a technique
the literature praises and the human's eye refused is exactly what the corpus
does not yet know.

### Phase 1 — Scan

Prove the instrument first: `node scripts/check-bundles.mjs` (read-only), then
`node scripts/build-index.mjs` (WRITES `index.json`; use `--check` when the
registry checkout is not yours to edit or another session is mid-edit there),
in the registry. Then `node scripts/librarian-scan.mjs --json` (read-only) for
the per-subject scores. **Never count anything yourself** — this registry once
reported 0/267 over a corpus at 267/267 because a counter read a different
shape than the parser emitted. Spot-check one number against one real file
before trusting any score. A `check-bundles` failure in a bundle this cycle does
not consume is reported, not repaired.

Ranking: **demand outranks scan points, and demand means THIS repo's** — the
consuming repo's own `.ai/conform-detail.json` (its live deviations) or a
repeatedly-not-better dimension beats any structural gap. The scan's aggregate
deviation count is a bundle signal across the fleet, not a this-repo signal: a
subject with six consumer deviations and no conformance pair here has never
been deviated on here. Pick **ONE dimension/subject per cycle**, from the
overlay's allowed set. A dimension whose recent cycles all came back not-better
with no new technique in sight is saturated for now; say so and pick the next.
A live deviation the loop's only instrument cannot measure (a schema gap, a
cross-frame property under a still-image A/B) is a standing blind spot; name it
and pass.

### Phase 2 — Research

Banked leads first: `librarian/subjects/media-generation/*.md` "Open leads"
sections are pre-written objectives somebody already scoped — a due lead is
cheaper than a fresh scan. For real research, **DISPATCH `/deepen`** on the
subject; never re-implement its lanes here.

The output of this phase is exactly one candidate technique with a **falsifiable
claim**: *when X, do Y, because Z*. A technique that cannot lose its A/B is not
a technique, it is a preference — send it back.

### Phase 3 — Plan

Write `cycle.json` with `status: "planning"`: 1-2 improvements, each carrying

- `baseline_recipe` — the incumbent, read from the consuming repo's **live**
  prompt surface or `styles.json`, never from memory;
- `challenger_recipe` — the same recipe with the technique injected, and nothing
  else changed;
- a scene roster (reuse `pipeline/foundry/plans/` scenes — known ground beats
  fresh invention) and a **fixed seed list**.

Preflight like train-style's `--dry`: pair count, worst-case cost, the budget
window. Over budget -> STOP with the over-budget sentence; `--resume` continues
when the window has moved. No spend starts without the number having been said.

### Phase 4 — Generate

Through the overlay's runner templates only. **Seed-matched**: the same scene and
the same seed in both arms — the seed is the control that makes the pair a
measurement instead of two rolls. Videos always render a poster still; the
judges and the tab read stills.

Detached-process discipline, verbatim from train-style: anything over ten minutes
must NOT be a Bash background task (it is killed at the ceiling). Launch with
`Start-Process` with redirected output, then poll with Monitor:

```powershell
$log = "pipeline/foundry/logs/dojo-<cycle-id>.log"
Start-Process -FilePath "npx" -ArgumentList <runner args from overlay> -RedirectStandardOutput $log -RedirectStandardError "$log.err" -NoNewWindow
```

**Check the engine's owner before launching.** Where the runner keeps a run-id
registry (gravitone's `guard.py` does), a foreign run-id on the engine is
`runner: busy`: stop the cycle the way `runner: absent` stops it, and say whose
job holds the card. Never force-recycle another job's engine. Two loops on one
card is an interlock problem, not a convention problem; the safety rail below is
the convention and this check is the interlock. Diagnostic rule while polling:
**a unit taking more than 3x its measured per-unit time is contention, not a
bad seed** — re-check the owner instead of waiting out the timeout. When the
card is contended rather than absent, `--fixture` still exercises the protocol.

Track `fail_streak` on the manifest; the breaker trips at **3** consecutive
failures -> `status: "failed"`, stop the cycle, move on next wake. `failed` means
more broadly *the runner did not deliver a judgeable set, and the log says why*
— a breaker, an engine refusal, or a pass that ran out of window all park as
`failed`. A failed cycle is a result, not an embarrassment; the manifest's log
says what broke, and a PNG on disk is a finished render, so `--resume` on a
quiet card needs only the missing units.

### Phase 5 — Judge

Pairwise, blind, one pick + **ONE reason** per pair — never 1-10 scores. Scores
are a pre-filter, never a verdict; a number invites averaging away exactly the
disagreement the loop exists to find. The full protocol, including how
`pick_rate` and `judge_agreement` are computed, is
`references/judge-protocol.md`.

Two judges in early cycles, both logged per pair:

- **the chokepoint judge** — per-image readback via the consuming repo's
  recognize router, then a reasoned pairwise pick via its reason router or a
  dispatched Fable subagent;
- **the Gemini joint judge** — both images plus the claim in ONE multimodal
  request.

This is a meta-A/B over the judges themselves, resolved by evidence: the tab
shows pick-rate and judge agreement; once **>= 3 gated cycles** show one judge
tracking the human better, the overlay pins that judge and the other is dropped,
with the decision recorded in the overlay.

### Phase 6 — Park

Set `status: "awaiting-gate"`, write the cycle log line, then loop to Phase 1
for the next cycle. **A cycle with zero complete duos never parks for a human**,
however it got there: with no pairs there is no thumbnail and no pick rate, and
an empty cycle in the tab risks a fabricated row in the cross-machine ledger.
It stays `failed` with its log. Human gating happens in the app (Foundry -> Dojo; K approve
/ X reject / U clear). Commit from the tab is **destructive**: one tracked
thumbnail per approved improvement survives; undecided media is preserved until
someone decides. The loop NEVER waits here — parked cycles accumulate, and
verdicts are picked up by whichever future cycle runs Phase 0.

## Safety rails

- **Never touch another session's files.** Check the consuming repo's active-runs
  ledger where it keeps one; the manifest's `lease` field marks who is driving a
  cycle, and a leased cycle is not yours to resume.
- **One dojo loop per machine.** Two loops share one budget window and one GPU;
  one of them will trip the other. This is the convention; Phase 4's owner check
  is the interlock, and it is the interlock that holds (two eval cycles on
  2026-09-01 honoured the convention on paper and still spent eleven hours on
  two renders because a third job held the card).
- **Never edit `knowledge/`** — evidence goes to `/deepen` and `/intake`.
- **Never edit `styles.json` by hand** — the catalogue is written by commits from
  the app's own commit path.
- **The budget window is a hard stop**, not a suggestion; `--resume` is the only
  way past it, and only once the window has moved.
- Reflection commits land on a branch for operator review, never on main.

## Knowledge sync

Dojo consumes the **media-generation** bundle and pays back into it, on its own
terms rather than the generic clause's, because the loop's whole output is
knowledge-shaped evidence:

- **Read** — resolve subjects through `knowledge/media-generation/index.json`
  and take each subject's `file` **verbatim** from the index. Never construct a
  path from a slug: bundles are nested and depth is dynamic, so a built path
  points at a folder nobody walks. Phase 1 ranks over this read; Phase 3's
  challenger cites the technique it injects.
- **Log every consult** — one line per cycle to `.ai/consults.jsonl`:
  `{"ts":"<ISO>","bundle":"media-generation","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`.
  Slugs and counts only, never paths. This is the demand signal Phase 1's own
  ranking later reads back.
- **File leads ONLY for human-gated, landed improvements** — a lead is owed when
  the human approved (or rejected — `not-better` leads are the most valuable
  rows) AND the reflection edit landed with its sha in the ledger. Append to
  `.ai/registry-leads.jsonl`:
  `{"ts":"<ISO>","bundle":"media-generation","nearest":"<subject-slug or null>","kind":"technique|application","claim":"<when X, do Y, because Z>","because":"<pick_rate, agreement, and the human verdict>","confidence":"low|medium|high","from":"dojo@<version>"}`.
  The verdict vocabulary is closed — `better` / `not-better` / `unmeasurable` —
  inherited from the sweep lane and intake's Phase 7.5.
- **Never write knowledge itself** — dojo ORIGINATES evidence and dispatches
  `/deepen` (subject research) and `/intake` (source-shaped findings); the
  registry's own intake decides what survives. Say in the report which leads
  were filed, and say plainly when none were.

---

<!-- clause: skill-reflection v3 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/dojo/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - dojo` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/dojo` in a consuming repo is a symlink to `<registry>/skills/dojo` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/dojo` and `git -C <registry> commit -m "skill(dojo): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/dojo/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/dojo` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
