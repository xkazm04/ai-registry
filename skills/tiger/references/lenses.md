# Tiger lenses - the three rubrics (full checklists)

The body of SKILL.md carries the method; this file carries the dial-by-dial checklists and
the verdict fields. `/tiger init` copies these three sections into `tiger/lenses/*.md` in the
consuming repo and annotates them with the app's own levers (which sub-task is clamped, which
prefix is cacheable, which Character is must-pass). When the vault has no `lenses/` folder,
judge against this file as-is.

Scores are dials (`N/10` per dial, `N/M` for grounding) so they are numbers you watch climb
across sessions. Every score cites `file:line`.

---

## Lens A - Engine Quality (the integration code)

Audits the code *around* the model. No Characters, no model calls - `file:line` truth only.
Fully L1. Three dials per call site.

### Dial 1 - Wrapping / chokepoint (`N/10`)
Is the call defended, and defended in ONE place?
- one provider-switching wrapper (chokepoint) that every call goes through - retries, fallback,
  cost-stamping and telemetry live there, not scattered beside raw SDK calls / `fetch`
- provider abstraction / swappability (model and vendor change without touching call sites)
- retry + failover before a hard fail
- per-call timeout AND a total budget across attempts
- abort / cancellation on client disconnect
- structured-output request (schema / tool-forced) + a typed schema with normalize + validate
  + self-repair re-prompt, in a NEVER-THROW decoder
- a quality / coverage gate (a parseable-but-empty reply != success; never rendered as truth)
- input / output bounds (field length + array count - anti-injection, anti-bloat: a hostile or
  verbose reply must not bloat the DB row, the payload or the bill)
- rate-limit + quota per caller / tenant
- sensible `temperature` / `maxTokens` for the task shape (temperature 0 where a number must
  be reproducible; keep nuance in prose, not in the score)
- graceful degradation to a FLAGGED deterministic floor
- one tagged call per tool / task (so telemetry can attribute by task)

### Dial 2 - Observability (`N/10`)
Can you debug a bad answer and bill it honestly?
- token-usage metering, committed ONLY on a usable attempt (never for a failed one)
- latency capture
- per-attempt outcome logging (not just failures - a usable-but-wrong answer must leave a trace)
- prompt + raw-response capture for post-hoc eval (the single most common gap; it blocks
  debugging, injection forensics, auditor defense AND Lens-C benchmarking at once)
- request / trace id; cost attribution (model, tokens, costUsd, attempts, repaired, demo /
  degraded flags)
- secret / PII redaction in any captured prompt or log (no API keys, no user transcripts)
- an eval / golden harness that fingerprints prompt + schema so drift surfaces, and an
  accumulating eval corpus (prompt -> output -> verdict) Lens C can benchmark against
- degrade-path disclosure parity: every route to the deterministic floor (failure, keyless
  default, explicit demo, quota exhausted) discloses equally loudly to the user AND in the
  durable artifact (export, report, badge). Enumerate the routes; a quiet chip on one and a
  loud caveat on another is a trust finding

### Dial 3 - Caching / efficiency (`N/10`)
Are you paying for the same tokens twice?
- result caching by a stable key / input hash (and a sane TTL)
- provider prompt-caching (`cache_control` / `cachePoint`) on the stable system / context prefix
  - usually the biggest single cost lever on input-heavy prompts; the prefix must be
  byte-identical across requests for it to hit
- in-flight dedup of identical concurrent calls
- context-size discipline: what is re-sent every call vs truly per-request; whole records where
  a digest would do; grounding text built once and reused; windows that cut the RIGHT content
  (signal-ranked, not alphabetical)
- cache-aware metering (cached input tokens priced as cached)
Every gap carries a cost implication (per call and per month at real volume), not a style note.

### Verdict
Findings carry `lens: engine-quality`, `character` omitted, `dimension` in
`{observability, cost, trust}`, `code_check` always set (`confirmed-absent |
present-but-missed | present-broken | by-design | n-a`). Strengths are first-class here - they
say what NOT to touch (e.g. "usage committed only on a usable attempt - honest billing").
A job's hard check (privacy etc.) declared in `tiger/README.md` is audited under this lens and
tagged with that `use_case`.

---

## Lens B - Business Value (UAT method, scoped to the LLM output only)

Inherits the seven acceptance dimensions from the consuming repo's `uat/rubric.md`
(completion . effort . clarity . trust . missing . time-saved . senior-quality) and the
cognitive-walkthrough + JTBD method, but the surface binding is narrowed to the part of the
experience the model generates: the scores / summaries / drafts / roadmaps / audits /
images the model produced. Do not judge the chrome around it.

### The questions that matter most
1. **Grounding (`N/M`)** - of the Character's real context the output should use, how much
   actually reaches the prompt? The denominator is the call site's canonical source list in
   its `engine/*` note, shared by every Character; a Character's segment-specific sources
   are named additions, never a different denominator. Audit:
   - IN: does each source reach the prompt (not `warnings`, not a log, the prompt)?
   - OUT: does provenance (engine, model, degraded-or-not, which fields the model moved)
     survive into the durable artifact the Character files / exports / shares?
   - computed-but-not-wired: context the app already computed or already paid to fetch that
     never reaches the model (a detector result dropped, a ranked list re-sorted before the
     window cut it)
   - memory: on a re-run product, does the prompt carry what changed since last time / the
     Character's prior choices, or does it re-judge cold?
   - per job: the row of the jobs table in `tiger/README.md` for the use case this call
     serves - which registry / exemplar / journal / prior-run data should reach the prompt
     for THIS job
2. **Senior-quality** - is the output at least as good as this Character would produce as a
   senior in their role? Generic advice ("add more tests"), an ungrounded number, or an audit
   that misses an obvious planted error FAILS even if the JSON validated.
3. **Time-saved & trust** - LLM-less minutes -> with-app minutes, as a number; would they stake
   their reputation on it (does it reconcile, is it sourced, same input twice = same answer)?

### Grounding bar (hard rule)
Every verdict quotes the actual prompt text (the real template string at `file:line`) and at
least one real sampled output (logs, fixtures, cached vault captures, or an L2 live call).
Never judge from the call-site name or wrapper signature. No sample anywhere -> mark
`ungrounded - needs L2 sample`, do not guess.

### Run scope
- L1: judge the DESIGNED prompt + grounding - would this plausibly produce a senior-grade,
  defensible output for THIS Character? Cite `file:line`, quote the prompt.
- L2: run the real model; assert the live output USES the grounding (names the supplied
  entity, reflects the real data, no placeholders) and clears the bar (real quality, latency,
  determinism on a re-run).

### Verdict
Findings carry `lens: business-value`, a required `character`, a required `use_case`, and
`dimension` in `{trust, senior-quality, time-saved, clarity, missing, completion, effort}`.
Each Character also writes a first-person felt verdict (would I trust this number? would I
ship this draft? is it worth the wait?). Across Characters the voices form the value panel.

---

## Lens C - Model Optimization (the alternative-scenario lens)

Treats model x thinking-level as a variable for each LLM piece and answers one question:

> What is the cheapest model / thinking config that still clears every must-pass Character's
> senior-quality bar - and does a premium config meaningfully upgrade business value, or just
> cost more?

### Read the piece before pricing it
- Which sub-tasks are BOUNDED (extraction; a score the engine clamps / guardbands / blends)
  and which are UNBOUNDED (reasoning-heavy roadmap, audit, long-form prose)? The bounded
  part is model-insensitive; the unbounded part sets the floor.
- Configured != realized: compute the realized swing after any clamp / blend.
- Is the output capped? A hard output cap collapses the effort axis - do not benchmark effort
  there.
- Which tokens dominate the bill - input (cacheable prefix, excerpts) or output (prose)? This
  decides whether a two-model split can pay.

### Method
- L1 (theoretical): from task shape + the quality bar + the `models.md` price table, predict
  the quality <-> cost frontier and place the current default on it (over- / right- /
  under-provisioned). Emit the benchmark matrix - rows = model x thinking worth testing live,
  each with a pre-registered hypothesis.
- L2 (`benchmark`): hold the input fixed; run each matrix row live; capture tokens + latency +
  raw output per row; score with 2-3 Character judges, blind (A/B/C, mapping withheld),
  forced ranking with a named separator per adjacent pair, multi-sample -> majority;
  `quality_delta` vs the default + `cost_delta` ($ per call and $ per month at real volume).
- Recommend the FLOOR (cheapest row where every must-pass Character still clears their bar)
  and the CEILING (the most a premium row improves the panel's value score, against its cost
  delta; if it does not move a must-pass verdict, the premium is waste). Watch for
  DEGRADATION - a row that silently drops grounding or hallucinates.

### Judging rules (measured)
- Quality is judged by Characters on a separate model, never by the model under test.
- Cross-family comparisons need >=2 judge families or a human spot-check (judges favour their
  own family; rho = 0.50 between two judges was observed). Within-family effort comparisons
  from one judge are fine.
- More effort is not better on long-form output (quality inverted above medium). Never
  recommend an effort upgrade on prose evidence alone.
- When every cell disappoints, suspect the prompt framing before the model -> a Lens-B
  finding, not an upgrade.
- Stress the un-clamped sub-tasks in the fixture (plant a detector miss the audit must
  catch); the clamped number is not where the value is.
- A recipe without API keys: one subagent per matrix cell via the Agent tool's `model` /
  `effort` params, fed the real system prompt + a fixed Character input; latency proxy =
  subagent wall-clock; effort measured by output tokens + outcome (reasoning is redacted).

### Verdict
Findings carry `lens: model-optimization`, a `character` (whose bar moved), `use_case`,
`model_variant`, `quality_delta`, `cost_delta`, `dimension` in `{cost, senior-quality,
trust}`. The per-piece recommendation (`keep | downgrade to X | upgrade to Y`) updates the
engine note's `model:` decision, `models.md` and the backlog. Never fabricate a benchmark
number - env-blocked -> predicted frontier, labelled theoretical.
