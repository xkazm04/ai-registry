---
name: llm-bench
description: "Compare models head-to-head on ONE declared LLM use case of a connected project, and return a rating table a human can act on. Picks the project and the use case from tracklight's use-case registry (registering them if the project has none), fans the identical task across an arm per model - hosted Nebius open-weight models, an OpenAI-compatible endpoint, and the local Claude Code CLI - mirrors every call to tracklight so cost/latency land beside the project's real traffic, then judges the outputs on grounding, calibration and actionability, with speed reported as context rather than as the verdict. Exists because the interesting question is never 'which model is best' but 'which model is most useful HERE', and because the answer is worthless unless the harness gave every arm the same chance: the method's hard-won half is the five fairness traps that silently starve or advantage an arm, and the rule that finish_reason is read before any theory is formed. Invoke with /llm-bench [setup|run|judge|report] [project]."
category: ai-native
memory: project
version: 0.2.0
tags: llm, model-comparison, benchmark, use-cases, tracklight, nebius, judge
argument-hint: "[setup|run|judge|report] [project]"
---

# llm-bench — which model is most useful *here*

A model leaderboard tells you which model is best at somebody else's task. This runs **one call
site of one real project** across several models and asks a narrower, answerable question: at this
use case, with this prompt, judged on this project's own bar, which model is worth running?

**Is:** a deliberate, paid, occasional pass that ends in a rating table plus a paragraph on how the
outputs actually differed. **Is not:** a CI gate, a regression suite, or a general model review.

The unit of comparison is a **registered use case** — a row in tracklight's use-case registry
naming a place the project calls an LLM. That is deliberate: without it the benchmark measures a
prompt somebody invented for the benchmark, which is how you end up choosing a model for a task
nobody runs.

## The five fairness traps

Everything else in this method is bookkeeping. This section is the method.

A benchmark's failure mode is not a wrong score, it is a **quiet handicap**: one arm gets less
budget, less time, or more context than another, and the resulting table looks decisive while
measuring the harness. All five below were paid for in a real run (2026-09-05, ascent's
`scan.calibrate` across five arms) and every one of them inverted a conclusion.

Read trap 4 before the others. It is the one that subsumes three different-looking failures, and in
the run that produced this file it was diagnosed WRONG first — a plausible, specific, entirely
incorrect cause was identified and nearly fixed. The rule it yields is the cheapest in this
document and would have prevented that detour outright.

**1. The completion budget starves reasoning models.** A reasoning model spends tokens thinking
before it emits any content, and the thinking comes out of the same budget. At a 4,096-token
default one model returned **1 of 9** requested dimensions and looked incompetent; at 16,000 it
returned all 9 and looked fine. Nothing about the model changed.
→ **Set the budget high enough that no arm can hit it, and record the number in the report.** If an
arm hits `finish_reason: "length"`, that is a void result, not a low score.

**2. The client timeout is a second budget.** Raising the token budget moved two arms from
"empty answer" to "timed out at 60s" — the same handicap wearing different clothes.
→ **Raise the request timeout with the budget**, and treat a timeout as void rather than as a fail.

**3. A CLI arm is an agent, not an API.** `claude -p` runs with tool access **in the current working
directory**. Run it inside the repository under discussion and it will read that repository — its
answer cited three specific files that appeared nowhere in the prompt. It was not doing the same
task as the API arms; it was doing a better-informed one.
→ **Run every CLI arm from an empty directory**, and grep its output for repo-specific strings that
were not in the prompt. If any appear, the run is contaminated — discard and re-run.

**4. `finish_reason` explains three failures that look like four.** Empty content, truncated
content, and malformed content are usually **one** cause — the completion cap — and the adapter's
error message is usually the last place that will tell you so. Measured on ascent's real prompt at a
16,000-token cap, all four combinations of two models and two response formats returned
`finish_reason: "length"` with `completion_tokens` exactly 16,000:

| model | content | reasoning | reported by the adapter as |
| --- | --- | --- | --- |
| a reasoning model | 0 chars | 66,708 chars | "Empty response from the provider" |
| a verbose model | 67,398 chars | 0 | "returned JSON that is not an assessment object" |

Two messages, two apparent diagnoses, one cause, and **neither message mentions the cap we set**.

The instructive part is the wrong turn. The first diagnosis here was "the adapter cannot read
`reasoning_content`" — plausible (that field really did hold 66,708 characters), specific, and
wrong. Acting on it would have fed a **truncated scratchpad** to the judge as if it were an answer:
a fix that manufactures plausible-looking results from an arm that produced none. The direct probe
that settled it took one call.

→ **Read `finish_reason` and `usage.completion_tokens` before forming any theory.** If the reason is
`length`, or the tokens equal the cap exactly, stop: the arm was starved, the result is void, and no
other explanation is needed. Only once truncation is ruled out is it worth asking whether the
integration could read what the model sent. Distinguish *the model could not do this* from *our
harness would not let it*; only the first belongs in a rating table.

**5. The provider's request window is a third budget, and you do not control it.** Raise the token
cap and the client timeout far enough and a verbose model can still fail — because the provider
closes the connection. One arm died with a transport error at ~307 seconds on two separate runs, at
two different caps, while the same model on a shorter prompt answered in 36 seconds. That is not the
token cap (it never reached it), not the client timeout (set to 900s), and not the model's
competence.
→ **Time the failure.** A transport error at a suspiciously round, repeatable elapsed time is a
server-side window, not a flake. Record it as a **capability limit at this prompt size** — real, and
worth reporting — rather than as a quality score or as an infrastructure flake to retry forever.

A rule follows from all five: **an arm that fails for a harness reason is reported as `blocked`,
never as a low score.** A benchmark that lets its own defects become a model's rating is worse than
no benchmark, because it is persuasive.

## The pass

### Phase 1 — pick the project and the use case

```sh
curl -s "$LIGHTTRACK_URL/v1/projects/$PID/use-cases" -H "$AUTH"
curl -s "$LIGHTTRACK_URL/v1/projects/$PID/use-cases/coverage" -H "$AUTH"
```

`coverage` is the more useful read: it names what the project **declared** and what its events
**actually did**. Three rows are worth benchmarking, in this order:

1. a declared use case with real traffic — the model choice is live and costing money;
2. a `shadow` row (observed, never declared) with meaningful volume — benchmarking it is also how
   it gets registered;
3. a declared use case with `undeclared_models` — something is already running that nobody chose.

A project with no registry gets one registration first (`POST .../use-cases`), because an
unregistered use case cannot be re-measured later against the same definition.

### Phase 2 — build the arms

An arm is `(label, provider, model)`. Keep the **prompt identical** across arms — not merely
equivalent. The prompt comes from the project's own call site, not from this skill.

Where a project already has a provider abstraction, run through it: that measures the model *and*
the integration, which is what the operator actually deploys. Where it does not, call the endpoints
directly. **Do both when they disagree** — the disagreement is trap 4 and it is a finding.

State any ambiguity in the prompt out loud in the report. In the 2026-09-05 run the prompt asked
for nine dimensions "D1..D9" without defining them; every model invented a different mapping, so
per-dimension scores were not comparable across arms and only the prose and the pattern were. One
model handled this markedly better than the rest by *renaming* the dimensions to semantic ids
instead of silently guessing — which was itself the clearest quality signal in the run.

### Phase 3 — run, and mirror to tracklight

Every arm's call is reported to tracklight under the use case's `key`, so the benchmark's cost and
latency land beside the project's real traffic instead of in a scratch file:

```
LIGHTTRACK_URL / LIGHTTRACK_PROJECT / LIGHTTRACK_KEY / LIGHTTRACK_ENABLED=1
```

Record per arm: wall clock, **`finish_reason`**, completion tokens, reasoning tokens where the
provider reports them, and the raw output to a file. `finish_reason` is not optional bookkeeping —
per trap 4 it is the field that decides whether a row is a result at all, and a harness that does
not capture it cannot tell a bad answer from a starved one after the fact.

**Reasoning overhead is worth its own column**: one arm spent 46,943 characters of reasoning to
produce 8,689 of answer, a 5.4x ratio that no quality score shows and that decides whether the model
is affordable at volume.

### Phase 4 — judge

The judge reads the outputs **against the use case's own job**, not against a general notion of good
writing. Four axes, each 1–10:

| axis | the question |
| --- | --- |
| **grounding** | Does every claim trace to the supplied evidence? Inventing a finding is the cardinal sin for an evidence-calibration use case, and scoring a dimension down for evidence that was never supplied is a subtle form of it. |
| **calibration** | Are the numbers defensible and *differentiated*? An arm that scores everything 80 has told you nothing. |
| **actionability** | Could an operator do the roadmap items on Monday? "Establish governance rhythms" is consultantese; "add cargo-audit alongside cargo-deny" is work. |
| **assumption legibility** | When the prompt was ambiguous, did the arm say so, or quietly guess? |

Speed is reported, never scored. A model that is 6× faster and slightly worse may well be the right
choice, but that is the operator's trade to make with both numbers in front of them.

Judge blind where practical, and **never let an arm's provider identity into the judging prompt.**

### Phase 5 — report

A rating table (one row per arm, the four axes, a total, and a `blocked` marker where a harness
issue prevented a fair result), then two paragraphs: how the outputs *differed in kind*, and the
recommendation with its trade-off stated. Attach the raw outputs.

The report must state the fairness settings it ran under — token budget, timeout, and whether CLI
arms ran from an empty directory. Without those three numbers the table is not reproducible and
should not be trusted, including by the person who produced it.

## Project overlay

Per-project specifics live in the consuming repo at **`.claude/llm-bench.local.md`**, and the skill
runs without one. It may pin: the default `use_case` key to benchmark; the arm roster (label →
provider + model); the prompt's source (which module builds it); the token budget and timeout the
project's own calls use; and the tracklight project id. With no overlay, Phase 1 reads the registry
and asks, the roster defaults to whatever provider credentials are present in the environment, and
the budget/timeout defaults are the ones this file names.

## Never

- Never report a harness failure as a model's score; mark it `blocked` and say what blocked it.
- Never theorise about a failed arm before reading its `finish_reason` and `completion_tokens`.
- Never fall back to a reasoning/scratchpad field as if it were an answer; a truncated scratchpad
  reads as a result and is not one.
- Never compare arms that saw different prompts, budgets, timeouts, or working directories.
- Never run a CLI arm from inside the repository under discussion.
- Never let a per-dimension number cross arms when the dimensions were not defined in the prompt.
- Never benchmark a use case that is not registered — register it first, or the result cannot be
  re-measured against the same definition later.
- Never treat one run as a verdict. A rating table is one probe, one day, one prompt.

---

<!-- clause: skill-reflection v5 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the checkout you worked in: local,
gitignored run output inside the task's own repository, never a write into the registry.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill llm-bench --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"llm-bench","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null`; exact figures are measured later from transcripts - never guess one.
- `result` is one line (max 240 chars). `comment` (max 2000) is the self-reflection a
  reviewer reads: what worked, what the method made harder, where its instructions were
  wrong, missing or ignored. No filesystem paths or email addresses.
- Never read run logs during a run. They are evidence ABOUT this skill for its reviewer;
  an executor that reads its own diagnosis contaminates the next measurement.

**Project learning.** Only when this run produced an observation that would change how a
future run behaves. A run that went as the method describes writes nothing: an entry that
restates the procedure, records "no issues", or repeats the task is a defect, not a
deliverable. When there is such an observation and local edits are within scope, put one
dated line in the overlay this skill's `## Project overlay` section names, under
`## Skill improvement log`. **Write only into an overlay that already exists.** If the
project has none, put the observation in the response instead - creating a new tracked
file for a reflection is scope the task did not ask for, and a reader who never asked for
the skill has to review it. If the overlay is a structured config (YAML, TOML, JSON),
record the note as comments so the file keeps parsing, or use the response.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
