---
layer: application
type: application
subject: regeneration-vs-repair-economics
technique: bounded-refine-iteration
stack: process
status: forged
verified_on: 2026-08-20
---

# Bounding the critique-and-refine loop: a spec'd doctrine and its shipped retry loop

Two artifacts in PoF (`C:\Users\kazda\kiro\pof`) cover this technique: a research spec that
states the loop doctrine, and a live retry loop that already implements the bound.

## The doctrine

`docs/research/agentic-3d-asset-generation.md` surveys four 2025–26 agentic-3D papers and
extracts the shared technique: **generate → render/observe → critique (VLM/critic) → refine,
with a structured knowledge base as working memory, looped until consistent** (line 16). Its
comparison table records the gap that matters here (line 25): "Bounded, governed iteration
… ✅ **PoF is ahead** — the papers note no explicit termination criterion."

`docs/research/self-correcting-asset-gen-spec.md` turns that into a five-step pipeline whose
step 4 is the technique verbatim (line 22): "**Refine** — if the critic fails AND budget
remains: amend the generation params/prompt from the critic's defects … **Bounded** by an
iteration cap + the harness budget (PoF's strength — don't loop forever)." Its non-goals
list "unbounded iteration (the papers' omission — PoF must keep the cap)" (line 42), its
acceptance criterion is "a generation that fails the critic is either auto-refined within
the cap or surfaced with concrete defects + the iteration count; never silently shipped"
(line 40), and its risk line gates phase 2 on the iteration economics (line 41). The
iteration-governance pattern is borrowed from `harness/claude-session.ts` (budget + cap).

Both documents are absent from the repo's context map, which is why the doctrine has not
propagated to the generation path — `src/lib/visual-gen/providers.ts` + `poll.ts` are still
fire-and-poll: kick a job, poll to done/fail/timeout, return, with no critique and no
refine.

## The bound that already ships

`src/lib/visual-gen/best-of-n.ts` implements the stochastic half with the contract in place:

- **The cap** — `DEFAULT_MAX_ATTEMPTS = 3`, with the reasoning stated at the constant: "a
  cloud generator charges per task, so every extra attempt is real money. The loop stops on
  the first acceptable roll, so a healthy generator normally pays for exactly one."
- **The repeat detector** — `failureShape()` normalises the *primary* reason only, digits
  blanked to `#`. The comment carries the measurement behind that choice: across three live
  runs the counts moved every roll ("33 floater fragments … 56 disconnected parts", then
  "12 … 38") and an incidental "1 degenerate faces" appeared on some rolls and not others,
  so raw-string comparison never matched and whole-list comparison still missed. `scoreMesh`
  emitting fails before warns is what makes "first reason" mean "verdict-driving".
- **The recorded best** — `RetryOutcome.best` is the "highest-scoring roll that produced a
  mesh — present even when none was accepted", and `accepted` is "true only when a roll
  actually cleared the gate. Never inferred from `best`."
- **The third value** — `ungated?: boolean`, "the mesh was delivered with NOTHING having
  graded it (the critic could not run). Distinct from `accepted: false`, which means a gate
  ran and rejected it."
- **The early exit on a stage-determined defect** — the outcome carries a field set "when
  the loop stopped after ONE roll because the verdict's failing criteria are determined by
  the generation STAGE rather than by the draw", computed through `assessStage` from
  `critique-stage.ts`. This is the classification step outranking the loop, in code.

## The gap the doctrine still leaves

What ships is a *retry* loop: attempt n+1 re-rolls the same specification. The spec's step 4
requires amending the generation parameters or prompt from the critic's named defects, which
would make it a refine loop. Until that edge exists, the economics of re-rolling govern it
and the early exit on stage-determined defects is doing most of the work of keeping the bill
down — which is the correct order to build them in, not a substitute for the refine step.
