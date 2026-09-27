---
domain: agent-operations
subject: agent-run-budgeting
last_touched: 2026-09-27
touched_by: deepen
dry_streak: 0
---

# agent-run-budgeting

Subject note. Part of [[index]]; graded against [[standard]].

First touch by `/deepen`. A single-subject run dispatched by the Curator lane on the scan
finding "3 techniques (design floor is 4)". Registry HEAD at dispatch was d93fbd78; the
primary checkout was behind origin, so the run worked from origin/main (ca2c87ac) in a
detached worktree and rebased once over a sibling's ledger commit.

## 2026-09-27 - every run ends for one recorded reason, pause the scope that refused, parallelism is free under a token bucket

**Depth rung:** L2 primary for the corrections, L3 empirical for the applications (planted
envelopes of observed shape through two fleet harnesses). Primary sources read raw, not
through a summarizer:
- the CLI runner's agent SDK reference (result subtypes; "check `terminal_reason` before
  `subtype`");
- the provider's rate-limit and error docs (per-model limits, token-bucket replenishment,
  429 vs 529, the spend-limit error code, batch pricing and its separate pool);
- three issues in the runner's trackers: a per-model rejection rendered as
  `subtype: success` + `is_error: true` + exit 0; a session-limit envelope carrying
  `api_error_status` and a `rate_limit_event` with `resetsAt`; a spend cap held by a
  sub-agent ending the parent with no result message;
- a workflow runner's cost reference and one of its own guardrail reports (1K of 1K,
  over by 7.65);
- an agent-benchmark maintainer's timeout post and release notes (a flat, raised timeout
  for every entrant; a delisting until resubmitted with correct timeouts);
- a budget-aware tool-use paper, a cost-aware leaderboard paper, a vendor post on
  infrastructure noise in agentic evals.

**Lanes:** four. A blind training-data lane, a web counter-evidence lane, a landscape lane,
and a field lane that searched the fleet's trees for the runners that launch agent CLIs.

**Convergence:** the new technique was reached by three lanes independently - the blind
lane as "every run records which budget ended it", the landscape lane as named cap exits,
the counter-evidence lane as structured refusal signals. The landscape lane's own top
candidate (budget visibility as a run condition) was reached by it alone and is banked.

**Landed (d9382ed7):**
- **New technique, termination-cause-record.** One cause per run from a closed vocabulary;
  structured signals before text, text only over errored envelopes; the absence of a
  terminal record is a cause; caps are configuration, uniform and stated, and fail in
  software (overshoot, missing result message, a retry loop past a turn cap); partial work
  at a cap is a declared policy, never pooled with finished runs.
- **Flipped: golden path + refusal-detection, "reads the text".** Structured fields first;
  the text is the fallback and is read only from an envelope that says it errored.
- **Flipped: golden path + refusal-detection, "pause the whole queue".** Pause the scope
  the limit belongs to: seat, model pool, organisation spend, provider capacity.
- **Corrected: refusal-detection, "delete the partial record".** Quarantine it. The
  subject's own application had archived the records, not deleted them; deletion destroys
  the evidence of a detector false positive.
- **Conditioned:**
  - refusal-detection: the duration floor gains the zero-API-time signature and a
    per-shape minimum; "do not raise parallelism" holds for fixed-volume windows, not
    per-minute token buckets.
  - allowance-budgeting: deferred judging is the default on API keys with a batch pool and
    wherever the judge is not pinned; parallelism is the lower of the window's and the
    machine's limit (the file contradicted itself here); withheld verdicts counted per arm;
    a seat refusal kept apart from a content refusal.
  - ceiling-as-measurement-boundary: the tail is the pooled tail; a tier nearing the
    ceiling raises it for all or turns the result into "pass within budget X".
- **Verified and left untouched:** a withheld verdict beats a partial one (two judge-bias
  papers support it); the uniform-ceiling rule itself; host-clock hazards.

**Applied (personas, three rows, two commits pushed):**
- **termination-cause-record: `better`, code (f3f68dc9c).** The memory-year wrapper
  retried a usage-limit refusal four times, then its judge's catcher stored **wrong-old**
  for a correct reply, and resume would have kept it. Now an allowance refusal raises on
  the first call and the judge and two writer catchers let it through. A new model-free
  check plants six envelopes.
- **Structured-first flip: `better`, code (b281310f7).** A studio build harness ran its
  rate-limit regex over every reply: 2/6 correct before (session limits counted as turns,
  real replies about rate limiting discarded), 6/6 after.
- **Scoped-pause flip: `unapplied`.** The harness now stops on any allowance refusal (the
  seat scope); return when a per-model limit stops a mixed-model run.

Impact: none. No fleet project declares the `agent-operations` domain, so no
`registry-map.json` pairs a context with this subject (personas' map: 0 mentions, with
`rate-limiting` as the positive control); no verdict went stale and no map was rebuilt.

Seams seen and left: the contest skill's runner in this repository (a sibling session's
uncommitted work at the time); the memory-year supervisor that parses the reset time from
text where a `resetsAt` instant exists in stream mode; a model benchmark that scores a
delegate-scenario timeout as a model failure. None of the five runners found has a
duration floor, host-sleep handling or a spend cap.

**Banked leads:**
- **Budget visibility as a run condition** (for agent-benchmark-design's
  comparable-cell-construction or here). Whether the agent is shown its remaining budget
  changes how it spends it - a tool-use paper measured equal accuracy at a tenth of the
  budget with a tracker - and one agent vendor reported the opposite (shortcuts near a
  believed context end). Single lane; return when a second lane or a fleet harness that
  injects a countdown corroborates it.
- **Block-ordered queues.** Schedule whole comparison blocks per window so an exhausted
  window leaves missing cells balanced across arms. Blind lane only; return when a fleet
  benchmark loses a window mid-queue.
- **Kill the process tree at a ceiling**, not only the CLI. Blind lane only, medium
  confidence; return when an orphaned build is observed after a ceiling.

**Declined:**
- A per-harness turn cap as comparable across runners: the unit differs (requests, tool
  round-trips, plan steps), so the technique states caps per runner instead.
- The landscape summary's Python SDK subtype names (`max_turns_exceeded` /
  `max_budget_exceeded`): the raw doc says `error_max_turns` / `error_max_budget_usd`; a
  summarizer invented them.

Yield: high. dry_streak 0.

Source classes, this run. Kept:
- the runner's own SDK reference and issue tracker, read raw (the issue bodies carry the
  verbatim envelopes);
- the provider's API reference pages;
- benchmark maintainers' posts about their own timeout policy.

Declined: page summaries from a fetch tool as quote sources - one invented an enum.

## 2026-09-27 - re-dispatched on a stale clock (run `dp-arb-0927b`)

Declined, no pass. The Curator lane re-sent the same finding, "3 techniques (design floor
is 4)", from d93fbd78. The primary checkout's main was 171 behind origin, where d9382ed7 had
already landed the fourth technique (termination-cause-record) earlier the same day. The
floor passes, no clock has expired, and no event is newer than that landing. dry_streak is
unchanged: a declined dispatch is not a dry pass. This is the lane's second stale re-send
of the day (after `dp-abd-0927b`), so the run records it as a failure signature.
