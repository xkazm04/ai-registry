---
layer: application
type: application
subject: engine-integration-safety
technique: editor-thread-timeout-budgeting
stack: node
status: forged
---

# Two derived timeouts in PoF: the bridge bound and the lab's poll budget

Two numbers in this codebase are derived rather than chosen, and each records its
derivation next to the constant.

## The bridge default, derived from the game thread's work model

`src/lib/bridge/run-python.ts:35`:

```ts
export const RUN_PYTHON_DEFAULT_TIMEOUT_MS = 120_000;
```

The comment above it is the technique's step 1 through 3, executed:

> this route dispatches onto the EDITOR GAME THREAD, so a call is queued behind whatever
> the editor is doing. A live-coding compile or a queued asset import/save routinely costs
> 30-60s, which rules out the 15s `UI_TIMEOUTS.pofHttpTimeout` used for the cheap
> `/pof/status` + `/pof/manifest` reads — too short would turn healthy slow work into a NEW
> false failure. Two minutes clears that band with room to spare while still being a real
> bound: past it, the editor is not "busy", it is wedged (crashed mid-PIE, modal dialog
> open, blocking Python), and an unbounded await would hang the caller forever with no
> error at all.

Work model (single privileged thread, queued), healthy band (30–60 s, measured), wedge
threshold (past ~2 min it is not busy, it is stuck), and the explicit rejection of the
cheap-read bound at `src/lib/constants.ts:142` for a call with a different work model.

The opt-in rules follow: "Genuinely longer work (cooks, full reimports) must opt into a
larger `timeoutMs` explicitly rather than inherit an unbounded wait", and `timeoutMs: 0`
"waits indefinitely — an explicit, rarely correct choice, since nothing else can then
unstick a wedged editor." `resolveDeadline` (line 114) implements the caller-owned deadline rule: a caller-supplied `signal` suppresses the default, and a supplied
`timeoutMs` composes with it so either can end the call.

## The lab's poll budget, derived from the server's own ceiling

`src/lib/ue-experiment/poll-budget.ts` is the technique's step 6 as a module, and its
header records the phantom-failure it fixed:

> The lab used to poll `600 × 30 s = 5 hours` for a job the runner can spend at most 60 s
> (python probe) or 180 s (scenario) inside — the browser tab was pinned for a quarter of a
> day on a wedged run, and the timeout said only "experiment timed out".

The fix is one owner and one derivation. `EXPERIMENT_SETTLE_MS` (line 20) holds the
server's settle ceilings — `python: 60_000`, `scenario: 180_000` — and `runner.ts:315,371`
imports *those exact constants* as its spawn-seam defaults, with the import commented "the
settle ceilings live beside the client's poll-budget derivation so the number the browser
quotes when it gives up is provably the number spent here." The declaration is explicit:
"These ARE the defaults used at the spawn call sites — do not re-declare them there."

`experimentCeiling` (line 54) picks the ceiling and returns *why* — `CeilingSource` is one
of "the spec's own settleMs", "the scenario default", "the python-probe default", carrying
the basis with the number. `experimentPollBudget` (line 68) then computes
`budgetMs = ceilingMs + marginMs` where the margin (`UI_TIMEOUTS.experimentBudgetMargin`,
3 minutes, `constants.ts:175`) covers exactly what the client can see and the server ceiling
does not: editor boot, capture, the visual judge and the history write. `maxPolls` is
derived from that budget and the poll interval (`experimentPoll`, 5 s), with the off-by-one
stated — "+1 because the first poll is immediate (poll THEN sleep)".

## The give-up message quotes both numbers

`experimentTimeoutMessage` (line 97) prints how long the client actually waited, the poll
count and interval, the server ceiling it was derived from, which source that ceiling came
from, and the margin — closing with the rule that a client give-up is not a verdict on the
work:

> The job (${jobId}) was still reporting "running" — it may yet finish and appear in the run
> history; nothing here says the experiment failed.
