---
name: tiger
description: "Hunts the highest-value surface of an LLM-powered app - its LLM call sites, the highest-value / highest-cost / highest-variance part a normal test suite is blind to - and certifies each across three lenses, judged against the jobs (use cases) the app declares. (A) Engine quality of the integration code: wrapping/chokepoint, retry/timeout/abort, schema + validation + self-repair, logging/telemetry, caching/dedupe, degrade-path disclosure. (B) Business value via the UAT Character method (representative users, jobs-to-be-done, a senior-quality bar, time-saved) but TESTING ONLY THE LLM PIECES - does each prompt's grounding and output clear the bar. (C) Model optimization as an alternative scenario - benchmark the same Character inputs across models x thinking levels: the cheapest config that still clears every bar, and whether a premium config buys value. L1 static + mass-parallel, L2 live + serial. Everything is memorized in a linked Obsidian vault at `tiger/` (one note per call site / character / model / session) so each run builds on the last. Stack-agnostic engine; per-app specifics live in the vault. Invoke with `/tiger init|scan|run|benchmark|recall|backlog [args]`."
category: testing
memory: vault
version: 2.1.0
tags: llm, call-sites, grounding, model-benchmark, characters, obsidian-vault, cost
argument-hint: "[init|scan|run|benchmark|recall|backlog] [args]"
---

# Tiger - certify the LLM engine, the highest-value part of an AI app

In an LLM-powered product the LLM call sites are the **vital organ**: they carry most of the value, most of the variable cost, and almost all of the output variance. A conventional test suite is structurally blind to whether they are *wrapped well*, *worth the money*, and *right-sized for the model*. Tiger stalks exactly those sites - ignores the CRUD around them - and never lets a high-value call site sit under-wrapped, under-grounded, or running an over-priced model. It is the LLM-focused sibling of `/uat`: it reuses UAT's Character / JTBD / senior-bar / time-saved / impact-scoring method but scopes it to the prompts and their outputs, and adds two lenses UAT does not have - integration **code quality** and **model/cost optimization**.

**Is:** a periodic, deliberate pass that (a) builds a durable inventory of every LLM call site, (b) judges each on three lenses against the jobs the app declares, and (c) emits one **session backlog** - the prioritized work to get the most out of the model engines. **Is not:** a per-commit gate, a generic linter, or a test of non-AI code. A finding that is not about a model call (or the plumbing / value / economics of one) is out of scope - that is `/uat` or `/code-review`.

**Real model calls are the point** of L2 (that is what makes business value and the cost frontier real, not a thought experiment), so Tiger is **cost-aware**: it samples, caches every live result in the vault, never re-runs an identical `(call-site, model, thinking, input-hash)` it already holds, and its live passes are a deliberate periodic exercise - never a CI gate. The two-level design keeps it affordable.

> Terminology shared with `/uat`: a **Character** is a durable, repo-committed representative user with goals, a senior-quality bar and their own scored judgement. Tiger **reuses the UAT roster** (do not reinvent users) and re-scopes each Character to the *AI surface* - the part of the experience the model generates.

## Project overlay - the `tiger/` vault

Everything app-specific lives in the consuming repo at **`tiger/`** - an Obsidian vault that is at once the overlay and the cross-session memory. Every mode reads it first; `init` scaffolds it. **With no overlay present the skill still runs** on the defaults in the last column: `init` discovers the surface, reuses `uat/characters/*` when a UAT overlay exists, and every finding carries `use_case: cross`.

| Overlay file | What it may carry | Default when absent |
|---|---|---|
| `tiger/README.md` | the home note and THE per-app config: the **jobs / use cases** table (`use_case` id; the job + its loop; the grounding questions Lens B asks for it; >=2 bound judges), per-job **hard checks** (e.g. a privacy rule Lens A must enforce), the **expected kills** list, call-site **discovery** (globs, provider patterns, what counts as a call site, exclusions), the **model-invocation recipe** for Lens C (how to run a site live per model x thinking; what cannot vary in this env), **fixtures** (fixed Character inputs per call site), the **price-basis** pointer, backlog / drain homes | no jobs declared -> one `cross` frame; discovery = the generic grep list under `init`; recipe = one Agent-tool subagent per matrix cell; fixtures derived from the Character files at `run` |
| `tiger/models.md` | the model x thinking benchmark matrix + a **dated price snapshot** from the app's own cost config + per-cell benchmark rollups | built at `init` from the code's price table; none in code -> a dated public list-price snapshot labelled *estimate* |
| `tiger/characters/_roster.md` | which Characters judge, each one's **AI-surface angle** and **use_case binding**; must-pass judges in bold | reuse `uat/characters/*` (all if <=10, else a lens-spanning subset); none -> derive as `/uat init` does and ask 1 / 5 / 10 |
| `tiger/lenses/*.md` | the three rubrics, annotated with the app's own levers | `${CLAUDE_SKILL_DIR}/references/lenses.md` as-is |
| `tiger/engine/_expected/*.md` | call sites the jobs imply but the code lacks yet | none |
| `tiger/.gitignore` | raw transcript dirs | `sessions/*/raw/`, `sessions/**/raw/`, `*.raw.jsonl` |

Legacy 1.x vaults (`Tiger.md` home, `config.md`, `call-sites/<id>.md`, `models/<model>.md`) are read as-is - the continuity contract matters more than folder names; do not rename on sight, and write new notes in the layout below. Templates for every note, including the README overlay: `${CLAUDE_SKILL_DIR}/references/vault-notes.md`.

## The value frame - jobs / use cases

An LLM call site is only "at its potential" relative to the job it serves; lenses judged in the abstract certify nothing. The app declares its jobs in `tiger/README.md` at `init` - a table with an id per job (`UC1..UCn` or named slugs), the job and its loop, what Lens B's grounding audit asks *for this job*, and the >=2 Characters who judge it. Rules:

- Every `engine/*` note and every finding carries `use_case` - one primary; `cross` for shared plumbing. The backlog is grouped by use case first, impact-ranked within. Without a declaration everything is `cross` and the roster is one shared panel.
- **Per-job grounding questions.** The "computed-but-not-wired" question (Lens B) is asked *per job*: which already-computed signals, which memory, which org / user data should reach the prompt when it serves *this* job. A call site that grounds job 1 beautifully and serves job 2 cold is a `use_case: <job 2>` finding, not a pass.
- **Per-job hard checks.** A job may pin a non-negotiable check (typical: a privacy rule - nothing leaves the machine the user did not choose; no transcript content in prompts, logs or telemetry). Declared in the README, enforced under Lens A, tagged with that `use_case`, never waived by a good output.
- **Expected kills.** At `init` / `run`, list the call sites the jobs *imply but the code does not have yet* as `engine/_expected/<slug>.md` - the machinery + grounding bar written ahead of the code, so the day the site lands the first run diffs against a bar instead of starting cold. An expected site that now exists graduates into `engine/`.
- **Use-case separation.** A site that clears one job does not clear another by association; judge each job it claims to serve with that job's judges.

## The three lenses (Tiger's core)

Every finding is tagged with the `lens` it came from (A / B / C - 1.x vaults say 1 / 2 / 3; same thing). The lenses are orthogonal: a call site can be beautifully wrapped (A) yet feed the model thin context (B) on an over-provisioned model (C). Full dial checklists and verdict fields: `${CLAUDE_SKILL_DIR}/references/lenses.md`.

### Lens A - Engine Quality (the integration code)
Audits the code *around* the model, not the model. **Fully static -> pure L1** (no model calls). Follow the import chain to the actual call and score each dial as a number you watch climb across runs (`N/10`), with `file:line` evidence:

- **Wrapping / chokepoint** - is every call funnelled through one provider-switching wrapper (so retry, failover, cost-stamping and telemetry live in one place) or are SDK calls / `fetch` scattered? Retry + failover before a hard fail; per-call timeout **and** a total budget across attempts; abort / cancellation on client disconnect; a structured-output request + typed schema with **normalize + validate + self-repair re-prompt** in a **never-throw** decoder; a **quality / coverage gate** (a parseable-but-empty reply is a failure, never rendered as truth); **input / output bounds** (field length + array count, so a hostile or verbose reply cannot bloat the DB row, the payload or the bill); rate-limit + quota; sensible `temperature` / `maxTokens`; **graceful degradation** to a deterministic floor that is flagged as such.
- **Logging / observability** - can you debug a bad answer and bill it honestly? Token-usage metering **committed only on a usable attempt** (never for a failed one); latency; per-attempt outcome (not only failures); **prompt + raw-response capture** for post-hoc eval; request / trace id; cost attribution (model, tokens, cost, attempts, repaired, demo / degraded flags); **secret / PII redaction** in anything captured; an eval / golden harness that **fingerprints prompt + schema** so drift surfaces. Missing prompt/response capture is usually the load-bearing gap: it blocks debugging, injection forensics, auditor defense AND Lens-C benchmarking (no eval corpus) at once.
- **Degrade-path disclosure parity** - when the model fails the app falls back to a deterministic floor; check that **every route to that floor discloses equally loudly**. A pilot found the *failure* route emitting a loud "AI unavailable" caveat while the *keyless-default* route (no key -> mock from the start) set the same floor with `degraded=false` and disclosed only via a quiet chip. A floor served as "AI" without the loud caveat is a trust finding wherever any path reaches it silently.
- **Caching / efficiency** - are you paying for the same tokens twice? Result caching by a stable key / input hash; **provider prompt-caching** on the stable system / context prefix (usually the largest single lever on input-heavy prompts); in-flight **dedup** of identical concurrent calls; **context-size discipline** (what is re-sent every call vs truly per-request; whole records where a digest would do; grounding text built once and reused). Each gap carries a **cost implication**, not a style note.

### Lens B - Business Value (UAT L1, scoped to the LLM output only)
The UAT method (Nielsen heuristics + cognitive walkthrough + JTBD), with the surface binding narrowed to **the part of the surface the model produces**. For each Character, walk the AI output theoretically and judge it through their lens:

- **Grounding audit (the L1 sweet spot)** - enumerate the Character's *real* context the output should use (their data, brand, costs, history, prior choices, the deterministic signals already computed) and score **how many actually reach the prompt** (`grounding N/M`). "Good machinery fed thin context" is the most common AI-product defect and is fully visible in code - make it a number per call site. The denominator is the call site's canonical source list in its `engine/*` note, shared by every Character (segment-specific sources are named additions, never a different ruler). Four refinements pilot runs proved sharpest:
  - **Audit BOTH directions.** *In:* does context reach the prompt? *Out:* does the model's provenance (engine, model, which fields it moved, degraded or not) survive into the **durable artifact** the Character files / exports / shares? A signed audit export that drops the engine column - so a deterministic-floor period is byte-identical to a model-scored one - is a grounding-OUT failure no prompt audit catches.
  - **The sharpest finding is "computed-but-not-wired".** Do not ask "does this context exist?" - ask "does context the app **already computed or already paid to fetch** actually reach the model?". The richest pilot findings were a detector whose result was dropped into `warnings` instead of the prompt, and a signal-ranked file fetch that got **re-sorted alphabetically** before the prompt window truncated it - both fully visible in code, both invisible to "does it exist?".
  - **Memory grounding.** On a *re-run* product, does the prompt carry "what changed since last time" / the Character's prior choices - or does it re-judge cold every call? (The vault itself is the model for good cross-run memory.)
  - **Use-case grounding.** Ask the job's row of the README table - the computed-but-not-wired question per use case.
- **Grounding bar (hard rule).** Every verdict must **quote the actual prompt text** (the real template string at `file:line`, not a paraphrase) **and at least one real sampled output** (logs, fixtures, cached vault captures, or an L2 live call). Never judge from the call-site *name* or wrapper signature - "the campaign evaluator sounds well-grounded" is not a finding. If no output sample exists anywhere, say so and mark the verdict `ungrounded - needs L2 sample` instead of guessing.
- **Senior-quality bar** - is the output at least as good as this Character would produce as a senior in their role? Generic, ungrounded or self-contradicting output fails even if it "worked".
- **Time-saved & trust** - does the AI output beat their manual way (a number: LLM-less minutes -> with-app minutes), and would they stake their reputation on it (does it reconcile, is it sourced)? "Slower than doing it by hand" is a finding.

L1 judges the *designed* prompt + grounding; **L2 confirms the live output actually uses the grounding** (names the supplied entity, reflects the real data, no placeholders). One confirmed live finding beats ten theoretical ones.

### Lens C - Model Optimization (the alternative-scenario lens - Tiger's novel contribution)
Treat **model x thinking-level** as a *variable*, not a constant. Per LLM piece: *what is the cheapest model / thinking config that still clears every must-pass Character's senior-quality bar - and does a premium config meaningfully upgrade business value, or just cost more?* The Characters are the **consistent judgment harness** that makes cross-model comparison fair.

- **L1 (theoretical frontier).** From task shape (grounded? structured-output? reasoning-heavy or extraction-heavy? output capped?), the quality bar and the price table (`models.md`), predict a quality<->cost frontier and place the **current default** on it: over-provisioned, right-sized, or under-provisioned (a cheaper model failing skeptical Characters). Output a **benchmark matrix** (which models x thinking levels are worth testing live) + predicted winners.
- **L2 (empirical - `benchmark` mode).** Run the piece with each config against fixed Character inputs; have the Characters score the outputs blind; plot the **real** frontier (quality delta vs cost delta per config). Deliverable: a **model-fit recommendation per piece** - `keep | downgrade to X | upgrade to Y` - with quality / cost / latency evidence and a concrete monthly-cost delta. Watch for **degradation** (a model that silently drops grounding or hallucinates) as hard as for savings.

Rules that pilots and live benchmarks proved (measured 2026-06 and 2026-07):
- **Decompose the piece before you price it - the "two-model split".** A call site often mixes a *bounded* sub-task (extraction, or a score the engine clamps) with an *unbounded* one (a reasoning-heavy roadmap or audit). The bounded part is model-insensitive; the unbounded part sets the floor. A split *can* win - but **price it against the token mix**: when OUTPUT tokens dominate the bill (usual), an input- or scoring-side split saves little and the cheap model often degrades the prose too, so a single mid model frequently beats the split. Measure, do not assume.
- **A downstream clamp protects the NUMBER, not the OUTPUT.** With a guardband / clamp after the model, a cheap model's wild score gets clipped back into range and the final number looks fine - while the **un-clamped** qualitative output (roadmap, audit, summaries) visibly degrades and skeptical Characters catch it blind. "The cheap model holds the score" is usually true and irrelevant. Design the fixture to **stress the un-clamped sub-tasks** (plant a detector miss the audit must catch) and judge those.
- **Configured != realized.** A "+-25 guardband" blended 60/40 lets the model move the final number only +-15. Price and judge the *realized* swing or you over-state what a better model can buy.
- **Shape the matrix by what is measurable.** Test effort / thinking levels **only where the output is uncapped and the task is verification-heavy** (structured extraction, schema-checkable, factual); for long-form prose test at most low vs medium. **A hard output cap collapses the effort axis** (no effort response at all was observed under a strict length cap) - do not pay for reasoning you cannot get. **More effort is not better** on long-form output: quality *inverted* above medium - the priciest run drifted its own cross-references and violated its brief. Length is not insight; never recommend an effort upgrade on prose evidence alone.
- **Judge blind, with the must-pass panel, by forced ranking.** Anonymize the per-config outputs (A / B / C, mapping withheld); 2-3 must-pass Characters score them, multi-sample, majority wins. Use **forced ranking with a named separator per adjacent pair** - absolute 0-5 scoring saturates (straight top marks, near-zero signal). Independent blind convergence is far stronger evidence than one labelled comparison.
- **Cross-family comparisons need >=2 judge families or a human spot-check.** Judges rank their own model family first (two judges disagreed at rho = 0.50, each favouring its own family). A single-judge verdict across families is inadmissible; within-family (effort) comparisons from one judge are fine. Quality is judged by Characters on a separate model, **never by the model under test grading itself**.
- **When every cell disappoints, suspect the prompt framing before the model.** The most replicated finding: all cells at every model and effort missed the same thing - a sharper problem statement would have caught it, no escalation would. Emit a Lens-B *value* finding, not an upgrade recommendation.
- **A recipe that works without API keys:** dispatch one subagent per matrix cell with the Agent tool's `model` / `effort` params, fed the call site's *real* system prompt + a fixed Character input; it returns clean schema JSON and a usable latency proxy (subagent wall-clock). Reasoning content is redacted in transcripts, so effort is measured by output tokens + outcome, never by inspecting the reasoning. Judge the cells with a separate model.

## The Obsidian vault - `tiger/` (this IS the memory)

A real vault (YAML frontmatter + `[[wikilinks]]` + a Map-of-Content home note) committed in the repo, so a human can open it in Obsidian and *navigate the engine's history*, and so each run **follows and extends the last** instead of starting cold. Append-and-update: engine notes are long-lived (dials, grounding, model decision evolve); session notes are immutable run records; the MOC always reflects current truth.

```
tiger/                         # open THIS folder as an Obsidian vault
  README.md                    # home + THE per-app overlay (jobs table, discovery, recipe, fixtures, price basis)
  MOC.md                       # Map of Content - links every engine/character/session/backlog note
  engine/                      # THE memorized LLM-usage map - one atomic note per call site ("the kills")
    <call-site>.md             # frontmatter {file,line,task,use_case,modality,wrapper,provider,model,schema,grounding,dials,fingerprint,status,last_reviewed,characters}
    _expected/<slug>.md        # call sites the jobs imply but the code lacks yet - the bar written ahead of the code
  lenses/
    engine-quality.md          # Lens A rubric (the wrapping/observability/caching dials)
    business-value.md          # Lens B rubric (inherits uat/rubric.md dimensions, LLM-scoped)
    model-optimization.md      # Lens C rubric + how to read the frontier
  models.md                    # the model x thinking benchmark matrix + a dated price-table snapshot + per-cell rollups
  characters/
    _roster.md                 # which Characters this vault uses + AI-surface ANGLE + use_case binding (>=2 judges per job)
    <slug>.md                  # only for Characters NOT already in uat/characters/ (else [[link]] the UAT file)
  sessions/                    # session memory - one dated note per run (Obsidian daily-note style)
    <YYYY-MM-DD-slug>.md       # journal: surface diff vs last session, lens scores, links to new/closed findings
    <YYYY-MM-DD-slug>/         # per-Character reports, benchmark inputs/outputs (raw/ gitignored)
  backlog.md                   # the LIVING cross-session backlog (the deliverable); open items roll forward, closed move to a log
  findings/                    # optional atomic note per significant finding, linked from backlog + engine + session
  .gitignore                   # raw benchmark transcripts out; scored summaries in
```

**Continuity contract (every `run`):** (1) read the latest `sessions/*.md` + `backlog.md` + `engine/*.md`; (2) re-discover the LLM call sites and **diff** against `engine/*` (new / changed / removed - prompt or schema drift vs the recorded **fingerprint**); (3) run the lenses; (4) write a new `sessions/<date>.md` with the **delta** (which dials moved, which findings closed / opened, which model-fit decisions changed), update the affected `engine/*` notes, roll `backlog.md` forward. A dial that moved run-over-run is the headline; a finding that reappears after being marked closed is a **regression**. Call-site ids are stable across runs - never duplicate a note, update it.

**Vault-write verification (learned 2026-06-20):** a discovery / scan subagent may be unable to write files in some harnesses and returns the note bodies inline instead. After any parallel scan the orchestrator MUST `ls` the target dir, diff against the expected id set, and **backfill** missing notes from the agents' returned content - never trust "wrote N notes" without checking.

## Two-level certification (chronological, inherited from `/uat`)

- **L1 - theoretical (static, code-grounded, mass-parallel).** Build the LLM surface model from code; run all three lenses *on paper*. Lens A is **fully** L1. Lens B is UAT-L1 scoped to the AI output. Lens C-L1 is the predicted frontier + benchmark plan. **No model calls.** Cheap and parallel - one subagent per Character. **Pass -> L1.**
- **L2 - empirical (live model calls, serial).** Only for what earned L1. Run the actual LLM piece. Lens B-L2 = real output quality per Character on the *grounded* path. Lens C-L2 = the real model x thinking benchmark (`benchmark` mode). Long and env-gated by nature - accept it.

Why chronological: L1 is a cheap filter and the only level that scales Characters to 10+ for free; reserve expensive serial L2 (real tokens, real latency, real spend) for the questions L1 raised. A Lens-A finding needs no model call at all - it is `file:line` truth.

## Finding schema

Extends the UAT finding with `lens`, `use_case`, `call_site` and the Lens-C model fields:

`{ id, lens, use_case, call_site, character?, cert_level, type, severity, impact, dimension, title, expected, got, evidence[], code_check, verdict, cost_note?, model_variant?, quality_delta?, cost_delta?, resolution, ceiling, l2_priority? }`
- `lens`: `engine-quality | business-value | model-optimization`
- `use_case`: a declared job id or `cross` - REQUIRED; the backlog is grouped by it first, impact-ranked within.
- `call_site`: the `engine/<note>` this is about - REQUIRED, so every finding links to a memorized site.
- `character`: required for Lens B / C findings (whose bar), omitted for pure Lens-A code findings.
- `cert_level` `L1|L2`; `type` `missing-feature|quality-gap|broken-flow|confusion|trust|cost`; `dimension` adds `cost` and `observability` to UAT's seven.
- `severity` derived from `impact` `{frequency, reachability, trust_erosion}` - **do not free-hand it.** For Lens A / C, `frequency` ~ how many calls / $ it affects (a per-call waste outranks a rare edge case).
- `evidence[]`: `file:line` at L1; transcript / score at L2. `code_check`: `confirmed-absent|present-but-missed|present-broken|by-design|n-a`. `verdict`: `confirmed|refuted|uncertain` (adversarial). `resolution`: `open|fixed|resolved-verified|by-design|accepted`. `ceiling` required on every `resolved-verified` / `by-design`.
- Lens C only: `model_variant` (e.g. `haiku . think:low`), `quality_delta` (vs the default, per the panel), `cost_delta` (per-call or per-month $).
- A finding may be a **strength** ("usage committed only on a usable attempt - honest billing") - strengths say what NOT to touch.

---

## Mode: `init`

Goal: scaffold the `tiger/` vault grounded in the codebase's **actual LLM surface**. **Step 0:** `ls tiger/` - if a vault already exists this is a `scan`, not an `init`: never write a second parallel vault or roster; extend the one that exists.

1. **Discover the LLM call sites (stack-agnostic).** Use the overlay's `discovery` section if present, else grep for provider SDKs and call shapes: `openai`, `anthropic` / `@anthropic-ai`, `@google/genai` / `generativelanguage`, `@aws-sdk/client-bedrock`, `langchain`, the Vercel `ai` package (`generateText` / `generateObject`), `ollama`, `mistral`, image / vision / embedding providers, plus a local provider abstraction (`assess(`, `complete(`, `chat(`, `generateStructured(`). **Follow the import chain** from each call to the code that builds its prompt and decodes its response - do not guess the file. Each distinct touchpoint -> one `engine/<call-site>.md`, `modality` set (text / image / vision / embedding / audio).
2. **For each call site, capture (in its note):** the *task*, the *prompt construction* + what **grounding** reaches it (`grounding N/M` with the canonical source list), the *structured-output* contract (schema? validator? repair?), the *provider / model* + how it is selected, the **wrapping / observability / caching** machinery -> the Lens-A dials, and a **fingerprint** of prompt + schema for drift. Cite `file:line` for everything.
3. **Declare the jobs.** Write the jobs / use cases table into `README.md` from the product's own positioning (docs, onboarding, pricing, "for <audience>" copy) - or take it from the operator. No declarable jobs -> say so; everything is `cross`. Write `engine/_expected/*` for the call sites the jobs imply but the code lacks.
4. **Bind Characters.** Reuse `uat/characters/*` if a UAT overlay exists (it usually does - `/tiger` and `/uat` are siblings); offer to adapt them. In `characters/_roster.md` give each an **AI-surface angle** - the dimension of the *model output* they judge hardest (grounding, hallucination, trust / defensibility, latency, **cost**, **model privacy / on-prem**, **determinism**) - **and a `use_case` binding** (>=2 judges per job). Span all three lenses (cost- and model-savvy Characters for Lens C, a security Character for Lens A, skeptics for Lens B); mark the must-pass panel. No UAT roster -> derive Characters from the app's real target group exactly as `/uat init` does (never a generic roster) and **ask how many (1 / 5 / 10)**.
5. **Write the lenses + the model matrix.** `lenses/*.md` from `${CLAUDE_SKILL_DIR}/references/lenses.md`, annotated with the app's own levers. `models.md`: the candidate models x thinking levels with a **dated snapshot of the app's own price basis** (find the price table / cost config in code) so the frontier is grounded in real rates. Record the **model-invocation recipe** and fixtures in `README.md`.
6. **Write `MOC.md` + `README.md`** so the vault is navigable from one home note.

Output: a short summary of the LLM surface found + the Lens-A dials' starting values + open overlay questions (esp. the invocation recipe). Do not run Characters in `init`.

## Mode: `scan`

Re-inventory and **diff against the vault**: new / removed / changed call sites (prompt or schema drift vs the recorded fingerprint), update notes, graduate `_expected` sites that now exist, flag regressions. No lens runs. Cheap - run often; `run` performs it implicitly.

## Mode: `run`  (default L1; `--l2` - alias `--live` - adds the live pass)

Flags: `--lens A|B|C|all` (default `all`), `--chars N`, `--use-case <id>`, `--site <call-site>`. Honor the **continuity contract** (read prior sessions first; diff the surface; write a session note + roll the backlog).

### Phase L1 - theoretical (mass-parallel)
- **Lens A (code audit) - one focused pass (you, or one subagent per call site for a large surface).** Walk each `engine/*` note's machinery and score the dials with fresh `file:line`. Emit Lens-A findings (no Character needed). Pure code truth.
- **Lens B (Character value) - dispatch one subagent per Character** (per `character x call-site` when the surface is large). Each reads its bound call sites, builds the AI-output surface model, runs the grounding audit (both directions; per job), and walks the output in-character against their scored criteria (senior-quality, time-saved, trust) - **scoped to the model output only**, under the grounding bar. Returns a per-Character value verdict + grounding score + findings + a first-person felt verdict.
- **Lens C (model frontier) - one subagent** (or fold into the Lens-B agents' "would a cheaper / bigger model change your verdict?" question). Predicted frontier per call site, the current default placed on it, the **benchmark matrix** for `benchmark` mode.
- **Synthesize.** A final pass writes the session note + updates `backlog.md`: the backlog **grouped by use case, impact-ranked within each** (items tagged `code` / `value` / `model`, each linking its `[[call-site]]`), the **dial deltas** vs the prior session, the **model-fit recommendation (predicted)**, a one-line **use-case verdict** per job (does the LLM surface serve it at senior grade today - yes / partly / not wired), the **value ledger** (grounding + time-saved rolled up; what the engine *promises* vs *delivers*), and the **strengths to protect**. Diff `engine/_expected/*` against discovered sites. The chat reply is the headline + sharpest findings, linking `file:line` and vault notes.

### Phase L2 - empirical (serial, live; `--l2`)
Only the questions L1 raised. **Lens B:** run the real LLM piece against each Character's grounded inputs; assert the live output *uses* the grounding + clears the bar (real quality, latency, determinism on a re-run). **Lens C:** see `benchmark`. Adversarially verify every kept finding (a refuter pass - "is the slow call a timeout or just slow?"; "did the cheaper model actually fail, or did the judge over-penalize?"; "is the column really missing - `grep` it"). Only `confirmed` reach the headline.

## Mode: `benchmark <call-site> [--models ...] [--thinking ...]`  (Lens C empirical)

The expensive, highest-value pass: run the piece across the `models.md` matrix against **fixed Character inputs**, score each output with the **Character panel** (the same scored criteria, applied identically, blind, forced ranking), and plot the **real quality<->cost frontier**.
1. **Hold the input fixed** (same data / prompt / grounding across variants) so the only variable is model x thinking. Capture token usage + latency + raw output per variant (raw transcripts gitignored; scored summaries committed). Cache every cell by `(call-site, model, thinking, input-hash)` so re-runs are free.
2. **Score each variant** with 2-3 Character judges (multi-sample; majority) against their senior-quality bar -> `quality_delta` vs the current default. Price each with `models.md` -> `cost_delta` (per call, and per month at the app's real call volume if known). Record per-cell `{quality, costUsd, latencyMs, verdict}` in `models.md`.
3. **Recommend per call site:** the **floor** (cheapest config holding every must-pass bar) and whether any premium config buys enough to justify its delta (the **ceiling**). Write `sessions/<date>-benchmark.md`, update the engine note's `model:` decision and the backlog.
4. **Honesty:** if the env cannot run live model calls (no key / local-only provider / sandboxed), say so and emit the **plan + predicted frontier** labelled *theoretical* - exactly like an env-blocked UAT L2. Never fabricate numbers.

## Mode: `recall`  (memory readout - no new scan)

Read `sessions/*` + `backlog.md` + `engine/*` and report the **trajectory**: how each Lens-A dial moved over time, which findings are still open / regressed / closed, the current model-fit decision per call site and when it last changed, the top of the backlog. The "what has Tiger learned about this engine" view - the payoff of memorizing to a vault.

## Mode: `backlog`

(Re)emit the impact-ranked, use-case-grouped backlog from current findings across all three lenses, without a new scan.

---

## Concurrency model
- **L1 is mass-parallel** - one subagent per Character (Lens B) at once; Lens A is a small static pass. A 10-Character L1 sweep finishes in ~one agent's wall-clock.
- **L2 / `benchmark` is serial with long runs** - real model calls take 30-130 s each and the matrix multiplies them; queue them, **budget for latency**, sample call sites, and cache every result.
- **Artifact hygiene:** gitignore raw transcripts (`tiger/sessions/*/raw/`); commit the scored summaries + the vault notes. If another agent commits in the same tree, commit vault artifacts path-scoped in a quiet window.

## Trust rules
- **Grounding:** no finding without evidence (L1 -> `file:line` + the quoted prompt text; L2 -> transcript / score). Never fabricate a benchmark number - env-blocked -> predicted frontier, labelled.
- **Code-verify every "X is missing" claim about a durable artifact before acting on it** - a pilot's L1 agent reported a signed export had no engine column; one `grep` / `git log -L` showed it had been there for weeks. The adversarial pass exists for this.
- **Per-character consistency:** judge against each Character's *scored criteria*, identically each run; multi-sample Lens-C judging across 2-3 samples and take the majority; default to "not better" unless the output earns it.
- **Impact over label:** rank the backlog by `impact` (frequency x reachability x trust-erosion / cost), not the raw severity word - a per-call token waste or an every-scan ungrounded field outranks a rare edge case.
- **Honest ceilings:** every `resolved-verified` / `by-design` finding names the limit that remains ("the cheaper model holds for the generic path; the grounded path still needs the mid tier").
- **Lens separation:** never let a gorgeous Lens-A wrapper excuse a Lens-B grounding gap, or a great Lens-B output hide that it runs on a 3x-too-expensive model. The three verdicts are independent.
- **Use-case separation:** see the value frame - a job's hard check (privacy etc.) is enforced under Lens A and never waived by a good output.
- **Vault hygiene:** stable ids, update never duplicate, fingerprints recorded, vault-write verification after every parallel scan.

## Using this on a new app
1. Install `/tiger` (this directory, or a copy under `.claude/skills/tiger/`). 2. `/tiger init` -> discovers the call sites, declares the jobs, scaffolds `tiger/`, reuses the UAT roster (or derives one). 3. Resolve the README's open questions (esp. the model-invocation recipe for Lens C). 4. `/tiger run` -> cheap L1 sweep across all three lenses -> a session note + a use-case-grouped backlog + a predicted frontier; `/tiger run --l2` for live Lens B. 5. Fix the Lens-A / B items; **`/tiger benchmark`** when you want the real cost frontier. 6. `/tiger scan` after changes, `/tiger recall` any time. The vault carries the memory forward - run it on a cadence and the dials become a story.

---

## Skill Reflection

After the run's real work is done, reflect twice - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING for lane 2. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

Lane 1 - PROJECT learnings (what the next session in THIS repo needs): write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract when the repo carries a `.personas/` dir. Project-specific insight only.

Lane 2 - METHOD learnings (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append an entry to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - <skill>` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a methodic redesign you are NOT applying now.
3. Version bump - ONLY when you also edit SKILL.md to apply the improvement in the same change: patch for wording, minor (2.1.0 -> 2.2.0) for a prompt / step refinement, major (2.x -> 3.0.0) for a methodic redesign. Update the `version:` frontmatter field. Never bump without an applied edit; never edit the method without a bump.
4. Sync ritual (only when you bumped): (a) commit the skill directory as a STANDALONE commit on the current branch - message `skill(<name>): v<new> - <one-line reason>` - containing nothing but this skill's files; (b) propagate to the library the repo syncs from (a PR to the registry, or a copy to `~/.claude/skills/<name>/`) so sibling projects can adopt it. EXCEPTION: read the sibling-awareness file first (`.personas/skill-registry.json` or the registry's `catalog.json`, whichever the repo carries) - if the library already carries a HIGHER version than yours, do not overwrite it; keep your lesson in LESSONS.md and note the version conflict in the entry.

Sibling awareness: the sibling-awareness file (repo root, when present) lists this skill's installed version, the library version, and which sibling projects run it at which version with recent usage. Use it to judge whether a lesson is worth a bump (heavily-used siblings raise the bar for majors) and to notice you are BEHIND (library newer than yours -> prefer recording the lesson over editing a stale method).
