---
layer: application
type: application
subject: degrade-never-block-a-candidate
technique: an-outage-must-not-change-who-advances
stack: process
status: forged
verified_on: 2026-10-31
applied: code
ab_verdict: better
---

# Keeping degradation away from the advance decision — the Python pipeline

The pipeline is where degradation could most easily become a selection criterion: it
is the layer that turns a candidate into a verdict the TS side branches on. Three
mechanisms keep the outage out of that decision. A fourth one had a gap in the
favourable direction, and that gap was closed on 2026-09-29.

## 1. The fallback verdict is the middle state, never an outcome

`pipeline/jobfit/automation.py:364` defines the canonical verdict vocabulary once —
`RECOMMENDATIONS = ("advance", "hold", "reject")` — and, immediately below,
`RECOMMENDATION_FALLBACK = "hold"` (`:369`) for an unknown, empty or malformed verdict,
with the reasoning stated (`:365-368`):

> Never silently `advance` (could auto-progress a candidate) or `reject` (the fairness
> gate forbids a silent auto-reject) — `hold` routes to the human Decisions gate.

So a malformed run cannot move anyone in either direction; it moves them to a person.
`SCREEN_ROUTES = ("advance", "hold")` (`:377`) narrows the *actionable* set below the
*expressible* set, so `reject` is not something the automation layer can execute at
all. The verdict semantics and the hold's fairness properties belong to the
`automated-screening-fairness-gates` subject; what this application shows is that the
degraded path lands inside that safe set by construction rather than by branch.

`RECOMMENDATION_CHOICES` (`:372`) is derived from the same tuple and rendered into the
prompts (`:1122`, `:2552`), so the model can never be shown a stale vocabulary — the
degraded and authoritative runs are answering the same question.

## 2. The favourable direction: a template may not clear anyone (fixed 2026-09-29)

"Malformed goes to hold" was true. "Degraded goes to hold" was not. Past the
`ai_candidates` allowance the TS side runs screening with `--no-llm`, and the
deterministic builder answers `rec, conf = "advance", 82` for any match total of 70 or
more with no missing must-have (`automation.py:1136-1137`). The route is
`advance` when the recommendation is advance and confidence is at least
`screen_advance_conf` (80, `:151`; the route at `:1219-1220`). A typed constant of 82
clears a bar of 80, so every such candidate came back `route: "advance"`.
`automation-run.ts` then moved them from Screened to Interview with actor `system` and
no engine-attributed event. With the screening gate on "auto", a template "advance"
parked for confidence was ratified unattended too. The builder predates billing
degradation (2026-05-29); nobody chose it as a quota fallback. It became one.

The consequence is the Tuesday cohort in reverse. For one workspace the instrument that
decided who advanced depended on whether this month's allowance had run out, and a
lapsed card reached it too: a failed payment drops the org to free after its grace,
the allowance empties, and screening flips to templates.

KP `b0ca8df00` (local on main, not pushed; main carried other runs' unpushed commits)
routes every template verdict to `hold` in `app/_lib/automation-run.ts`. It lands on the
same `screening_review` card, with `verdictSource: "template"` disclosed and a
`screening_hold` event attributed to `auto:automation-template`. The auto gate now
ratifies only model verdicts. At the entry column a template screen still moves the
applicant into Screened, as every screen does, flagged for review rather than clean.

Measured in `app/_lib/automation-run.test.ts`, on the real module against an isolated
SQLite file with the verdict seeded at the exact cache key:

| Case | Before (`d984fd4df`) | After (`b0ca8df00`) |
| --- | --- | --- |
| Template, route advance | `advanced`, no approval | `held_for_review`, engine on card and event |
| Template, recommendation advance, gate auto | `auto_ratified` | parked for a person |
| Model, route advance (control) | `advanced` | `advanced` |

The suite went 30/30 with tsc clean. The ten failures in the neighbouring
`interview-scorecard-commit.test.ts` predate this change: that module is a throwing
stub.

## 3. Degradation is refused at routing, not discovered at read

The earlier version of this application quoted `docs/architecture/llm-provider-layer.md`
(now `:142-145`): a `cv_analysis` config routed to a provider without file input "runs
without salary grounding and the envelope flags `grounding: "unavailable"`". The code
does not do that, and the doc sentence is stale. `pipeline/jobfit/llm/capabilities.py:1-11`
says the registry validates routing at resolve time, so such a config "raises instead,
and the caller's deterministic fallback takes over only for *runtime* failures, never
for misconfiguration". `cv_analysis` requires `CAP_FILE_INPUT` (`:118`), which the
text-only providers do not advertise. No code emits `grounding: "unavailable"`. And CV
analysis has no deterministic branch at all (`pipeline/jobfit/pipeline.py:542-545`: "This
path always calls a model").

So the property holds by the stricter of the technique's two options. It refuses the
routing ahead of the run, rather than flagging a known-weak run. The key-resolution
order (`llm-provider-layer.md:230-231`, workspace BYOM key → platform key → provider
unavailable → existing deterministic fallback) still gives outage and absent credential
one route for the steps that *have* a floor.

## 4. Even the demonstration path refuses to skip the human gate

`app/api/sim/screen-draft/route.ts:10-12` is a deterministic, no-LLM screening
recommendation used by the simulation. It could trivially have auto-advanced — it is a
demo. Instead it sets the `screening_review` approval (`setSimApproval`, `:41`) so a
real card appears in the Decisions queue for the driver to click. The draft itself is
built in `simDrafts.ts:47-48` with `recommendation: "advance"` and
`SIM_SCREEN_CONFIDENCE = 72` (`:43`), and still none of it advances anybody. The demo
had this right before the product did; section 2 brings the product's degraded path in
line with it.

## Deviations from the standard

- **No degraded-window accounting.** The technique's core procedure — define the
  window, enumerate the candidates produced inside it, re-read them on the model and
  count changed decisions, recompute before anyone reviews — is not implemented. The
  engine is now on every parked verdict's card and event, which makes the set findable,
  but no job sweeps a window.
- **Engine marked per card, not per list.** `CandidateDecisionBar.tsx:63-66` shows an
  amber "engine: template" label on each decision card. No list or ranked view
  separates or filters by engine.
- **The hold is unbounded.** A parked template verdict waits for a person with no time
  limit and no automatic re-read when the allowance returns.
- **The stale doc sentence** at `llm-provider-layer.md:142-145` still describes the
  grounding flag the code does not emit. It is left for KP's own doc pass.

## Since first documented

### 2026-10-31 re-verification

Re-checked 2026-10-31 at kp@6edf5d7e6. `b0ca8df00` is on main, and the template
park is in place (`automation-run.ts:622-628`; the auto gate's model-only condition
at `:659`). One later commit closed a gap section 1 had not seen.
`fix(screening)` (2026-10-14, commit `7354b2786`): an off-set or absent model
recommendation used to be backfilled from the deterministic builder, `advance`
included, and then carried the model's confidence and the `llm` source, so it could
route `advance` and be ratified unattended as the model's verdict. "A malformed run
cannot move anyone" was therefore not fully true until that commit. An unreadable
verdict now resolves to `hold` when the template would advance. This strengthens the
application's verdict rather than reversing it; the measured table above predates it
and is left as measured.
