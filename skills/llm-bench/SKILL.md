---
name: llm-bench
description: "Compare models head-to-head on ONE declared LLM use case of a connected project, and return a rating table a human can act on. Picks the project and the use case from tracklight's use-case registry (registering them if the project has none), fans the identical task across an arm per model - hosted Nebius open-weight models, an OpenAI-compatible endpoint, and the local Claude Code CLI - mirrors every call to tracklight so cost/latency land beside the project's real traffic, then judges the outputs on grounding, calibration and actionability, with speed reported as context rather than as the verdict. Exists because the interesting question is never 'which model is best' but 'which model is most useful HERE', and because the answer is worthless unless the harness gave every arm the same chance: the method's hard-won half is the five fairness traps that silently starve or advantage an arm, and the rule that finish_reason is read before any theory is formed. Invoke with /llm-bench [setup|run|judge|report] [project]."
category: ai-native
memory: project
version: 0.1.0
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

<!-- clause: skill-reflection v3 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). If this skill carries no `## Project overlay` section, or its overlay section names no location, write that dated one-liner to `.claude/llm-bench/config.md` in the consuming repo under `## Skill improvement log`, creating the file and the heading if they are absent - so the instruction is executable in every skill. When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - llm-bench` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/llm-bench` in a consuming repo is a symlink to `<registry>/skills/llm-bench` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/llm-bench` and `git -C <registry> commit -m "skill(llm-bench): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/llm-bench/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/llm-bench` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
