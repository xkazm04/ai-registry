# Tiger vault - note templates

Templates for every note `/tiger` writes into the consuming repo's `tiger/` vault. Keep the
frontmatter keys stable across runs - they are what `scan`, `recall` and the continuity
contract diff against. `[[wikilinks]]` everywhere so the vault navigates in Obsidian.

Legacy 1.x vaults used `Tiger.md` (home), `config.md` (per-app config), `call-sites/<id>.md`
and `models/<model>.md`. Read them as-is; write new notes in the shapes below. A 1.x
`config.md` maps onto the README overlay sections (discovery, recipe, fixtures).

---

## `tiger/README.md` - home note + THE per-app overlay

```markdown
# tiger/ - the Tiger vault (open me in Obsidian)

This folder is an Obsidian vault and the per-app overlay for the `/tiger` skill. Tiger
certifies the LLM call sites of this app across three lenses and stores everything here so
each run extends the last. Start at [[MOC]].

## What's here
- `engine/` - one note per LLM call site; `engine/_expected/` - sites the jobs imply but the code lacks yet
- `lenses/` - the three rubrics (A engine-quality, B business-value, C model-optimization)
- `models.md` - the model x thinking matrix + dated price snapshot + benchmark rollups
- `characters/_roster.md` - the Characters, their AI-surface angles, their use_case binding
- `sessions/` - one dated note per run; `backlog.md` - the living impact-ranked backlog

## Jobs / use cases (the value frame every lens judges against)
| use_case | Job (who, the loop) | What Lens B's grounding audit asks for this job | Judges (>=2) |
|---|---|---|---|
| UC1 | <job> - <who> - <step -> step -> step> | <which computed signals / memory / org data must reach the prompt; what "generic" would look like here> | [[char-a]], [[char-b]] |
| UC2 | ... | ... | ... |
(No declarable jobs? Say so here; every finding then carries `use_case: cross`.)

## Use-case hard checks
- <use_case>: <a non-negotiable Lens-A/B check for this job, e.g. "no transcript content in prompts, logs or telemetry unless the user chose it">

## Expected kills
- [[_expected/<slug>]] - <use_case> - <the call site the job implies and the code lacks>

## Discovery (what counts as a call site here)
- globs / provider patterns / local wrapper names; paths excluded (tests, fixtures, mocks)

## Model-invocation recipe (Lens C)
- how to run a call site live per model x thinking (env vars, keys, harness, the local CLI
  engine); what this env CANNOT vary (e.g. "the harness cannot set a thinking budget")

## Fixtures
- per call site: the fixed Character inputs for `benchmark` (where they live, what is planted)

## Price basis
- <file:line of the app's own price table / cost config> -> snapshot in [[models]]

## Run it
- `/tiger init` (re)maps the surface and scaffolds this vault; `/tiger scan` diffs it
- `/tiger run` L1 sweep (`--l2` adds live calls); `/tiger benchmark <site>` live Lens C
- `/tiger recall` the trajectory; `/tiger backlog` re-emits the backlog

Committed (it is the memory). Raw benchmark transcripts are gitignored; scored summaries kept.
```

## `tiger/MOC.md` - Map of Content

```markdown
---
note_type: moc
updated: <YYYY-MM-DD>
tags: [moc, home]
---
# Tiger vault - Map of Content
## The engine (memorized call sites - "the kills")
- [[<call-site>]] - <one line: task; entry file:line; dials W/O/C; grounding N/M; use_case>
- _expected: [[_expected/<slug>]] - <use_case> - not built yet
## The three lenses
- [[engine-quality]] . [[business-value]] . [[model-optimization]]
## Model frontier
- [[models]] - matrix + price snapshot + the current floor / ceiling decision per site
## Characters
- [[_roster]] - who judges what (angle + use_case binding)
## Sessions (newest first)
- [[<YYYY-MM-DD-slug>]] - <one-line delta>
## Backlog
- [[backlog]]
```

## `tiger/engine/<call-site>.md` - one note per LLM call site

```markdown
---
note_type: engine-call-site
call_site: <stable-slug>            # the id; never changes across runs
task: <what the model is asked to do, one line>
use_case: <UC id | cross>           # primary job this site serves
modality: text | image | vision | embedding | audio
entry: <file:line of the model call>
wrapper: <chokepoint fn> | direct
prompt_builder: <file:line>
output_contract: <schema file:line> -> <validator file:line> | none
providers: [<provider (env)>, ...]
model: <current default per env; the last benchmark decision + date>
grounding: <N/M in-direction> ; out-direction <closed | open: what>
dials: { wrapping: N/10, observability: N/10, caching: N/10 }
fingerprint: <hash of prompt template + schema>   # scan diffs against this
status: discovered | assessed | benchmarked | improved
characters: ["[[char-a]]", "[[char-b]]"]
last_reviewed: <YYYY-MM-DD> (session [[<session>]])
tags: [engine, llm-call-site]
---
# Engine call site - `<slug>`
## What the model is asked to do
<task; the load-bearing constraints (clamps, guardbands, caps) that drive Lens C>
## Grounding audit (Lens B) - `grounding N/M`
<the canonical source list, numbered, each with file:line and a check / cross; IN and OUT
direction; memory; per-job rows; the quoted prompt text>
## Lens A - Engine Quality dials
<wrapping / observability / caching with file:line per item; disclosure-parity routes>
## Lens C - model fit
<task shape; bounded vs unbounded sub-tasks; realized swing; predicted frontier; decision>
## Findings
<impact-scored items across the lenses, linking [[session]] where raised / closed>
## Strengths (do not refactor away)
```

## `tiger/engine/_expected/<slug>.md` - an expected kill

```markdown
---
note_type: engine-expected
call_site: <slug>
use_case: <UC id>
implied_by: <the job step / design doc that implies this call site>
status: expected            # flips to discovered when the code lands -> move into engine/
---
# Expected call site - `<slug>`
## The job it will serve
## Grounding bar (what must reach the prompt on day one)
## Machinery bar (the Lens-A dials it must clear)
## Judges
```

## `tiger/characters/_roster.md`

```markdown
---
note_type: roster
count: <n>
source: reused from uat/characters/ | derived at /tiger init
---
# Tiger roster
Must-pass Characters (the senior-quality floor for Lens C) in **bold**.
| # | Character | uat file / note | AI-surface angle | Lenses | use_case |
|---|---|---|---|---|---|
| 1 | **<name - role>** | `uat/characters/<slug>.md` | <grounding / hallucination / trust / latency / cost / privacy / determinism> | A B C | UC1 |
Coverage check: every lens >= 3 judges; every use case >= 2 judges; skeptics named.
```

## `tiger/characters/<slug>.md` - only for Characters NOT in `uat/characters/`

```markdown
---
name: <First role-tag>
type: tiger/character
maps_to: ["[[<call-site>]]", ...]      # the LLM surfaces this Character exercises
use_case: [<UC ids>]
references: [<url> - the bar it sets]
---
## Who they are / Background / Voice   (per the UAT template - authentic texture)
## Jobs to be done                      (what they hire the MODEL OUTPUT for)
## Senior-quality bar                   (the floor: output >= what they would write as a senior)
## Time-saved (motivation)              (LLM-less minutes -> with-app minutes, as a NUMBER)
## Scored acceptance criteria           (judged identically every run, applied to the OUTPUT)
- [ ] grounded in MY real context (names the supplied entity / data, no placeholders)
- [ ] senior-grade (specific, correct, not generic)
- [ ] worth the latency / cost
```

## `tiger/models.md`

```markdown
---
note_type: model-matrix
price_snapshot: <YYYY-MM-DD> (<file:line of the app's price table>, USD per MTok)
---
# Model x thinking-level matrix
## Price basis (dated snapshot)
| Tier | Model | $ in / MTok | $ out / MTok | Notes (current default for which env) |
## Benchmark matrix (rows to run in `benchmark`)
| # | Model | Thinking | Hypothesis (pre-registered) |
## Results (per call site, per cell) - `{quality, costUsd, latencyMs, verdict}`
| Call site | Model | Thinking | Cleared must-pass? | quality_delta | cost_delta | Result |
## How to read: floor / ceiling / the per-piece recommendation
## Caveat: where the env cannot run live, rows are predicted and labelled
```

## `tiger/sessions/<YYYY-MM-DD-slug>.md`

```markdown
---
note_type: session
date: <YYYY-MM-DD>
mode: run | run --l2 | benchmark | scan
characters: [..]
---
# Session <date> - <slug>
## Surface diff vs last session   (new / changed / removed call sites; _expected graduated)
## Lens scores + dial deltas      (per call site: wrapping / observability / caching; grounding N/M)
## Use-case verdicts              (per job: yes / partly / not wired)
## Findings opened / closed / regressed  (ids, linking [[engine]] notes)
## Model-fit                      (predicted or measured; floor / ceiling per site)
## Value ledger                   (grounding + time-saved rolled up; promised vs delivered)
## Strengths to protect
```

## `tiger/backlog.md`

```markdown
---
note_type: backlog
updated: <YYYY-MM-DD> (session [[..]])
---
# Tiger backlog
Grouped by use case, impact-ranked within (frequency x reachability x trust-erosion / cost).
Each item: id . lens tag (`code` / `value` / `model`) . [[call-site]] . impact . fix . l2_priority.
## <use_case>
### P0 / P1 / P2 ...
## cross
## Strengths - protect, do NOT refactor away
## Closed / resolved log   (each with its ceiling)
```

## `tiger/.gitignore`

```
sessions/*/raw/
sessions/**/raw/
*.raw.jsonl
```
