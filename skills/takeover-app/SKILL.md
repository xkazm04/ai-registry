---
name: takeover-app
description: "Take over an unknown or vibecoded fullstack app and bring it under control toward production readiness: a phased, gated sequencer over the registry's existing skills. Recon the stack, boot it, map it, score readiness, scan it through the built-in lenses plus four takeover lenses (API and LLM call hygiene, security depth, backend performance, money and privacy) with an Opus judge, import the Azure DevOps backlog into the same queue, rank every item by severity tier (0 stop-ship .. 3 backlog), write a stakeholder control report, then build approved tier 0-1 fixes in gated batches while a parallel UX track polishes the top screens. Three operator gates are the only path to builds; a run ledger makes it resumable. Use when you inherit a codebase you did not write and must quickly know what is dangerous, what is slow, and what to fix first. Invoke with /takeover-app [<repo>], /takeover-app resume, or /takeover-app status."
category: workflow
memory: project
version: 1.0.0
tags: takeover, onboarding, production-readiness, triage, azure-devops, lens-scan, security, llm
argument-hint: "[<repo path>] | resume | status"
---

# Takeover - an inherited app, under control

You have been handed an app nobody can fully explain: months of fast, prompt-driven
commits, no map, unknown health, a backlog in Azure DevOps and a deadline for "production
ready". This skill is the order to do things in. It writes almost nothing itself; it
**sequences** the registry's skills, adds what a takeover needs that they lack (four
judged lenses, a severity tier, a backlog import, stakeholder outputs) and stops at three
gates where the operator decides.

The chronology, and why it is in this order:

```
P0 recon -> P1 boot -> P2 map                    == GATE 1 (stack, boot, map coverage) ==
P3 readiness -> P4 adopt+scan -> P5 ADO import -> P6 triage -> P7 outputs
                                                 == GATE 2 (the ranked plan) ==
P8 hardening batches (tier 0, then 1)  == GATE per batch ==
   || P9 UX track (harness, screenshots, /perfect on the top 2-3 screens) - in parallel with P8
```

Recon before boot (you cannot install what you have not identified); map before scan
(every lens works context by context); readiness before scan (the passport finds the
missing foundations - no CI, no error tracking - that no code lens reports); backlog import
after the scan (so dedupe has both sides); triage before outputs (the report is the ranked
list); builds only after a gate.

## Invocation

```
/takeover-app                 # the current repo, from the first phase not done in the ledger
/takeover-app <repo path>     # another checkout (a clone or a branch, never a shared main)
/takeover-app resume          # continue from the ledger
/takeover-app status          # print the ledger and the next action; changes nothing
```

## Preflight - before P0, every time

1. **Siblings resolve.** A sequencer that invokes a missing skill does not fail: the agent
   improvises the step and the judgement that skill carries is silently skipped. So check
   first, deterministically:

   ```
   node ${CLAUDE_SKILL_DIR}/scripts/siblings.mjs --product-root <repo>
   ```

   Exit 1 lists the missing required siblings (onboarding, adopt-bp, lens-scan, perfect)
   and the fix (declare them in `.ai/manifest.yaml` `skills:` and run the registry's
   `link-registry.mjs`). **Stop and show it**; never run a phase whose skill is absent.
   Optional siblings are reported with their fallback: project-populate (P2 uses adopt-bp's
   step 0), passport-onboard (P3 uses the condensed checklist), scan-sweep (P4 skips the
   second opinion). passport-onboard resolving only at user scope is flagged: that copy
   has drifted from the canonical one in the Personas repo before - compare versions.
2. **A clone or a branch.** `git status --porcelain` and the current branch. On the
   default branch, create `takeover/<YYYY-MM-DD>` (ask once). Uncommitted work that is not
   yours: stop and name the files; never commit, stash or reset it.
3. **The ledger.** Open or create `<repo>/.ai/takeover/ledger.md` (below) and exclude
   `.ai/takeover/` locally (`.git/info/exclude`, so the repo's `.gitignore` is untouched).

## The run ledger

`<repo>/.ai/takeover/ledger.md` is the run's memory; `resume` reads it and nothing else.

```
# Takeover ledger
skill: takeover-app 1.0.0   repo: <name>   branch: takeover/2026-10-18   started: <ISO>

| phase | status | started | ended | artifacts | note |
|---|---|---|---|---|---|
| P0 recon | done | <ISO> | <ISO> | .ai/takeover/recon.md | Next 15, Supabase, 41 routes |
| P1 boot | done | ... | ... | capability matrix in recon.md | 2 groups degraded |
| P2 map | running | ... | | context-map.json | coverage 78% |

## Gates
- GATE 1 <ISO> - go - operator:<name> - "map is good enough, skip the legacy/ folder"
```

Status is `pending | running | done | skipped (<why>) | blocked (<what>)`. Write the row
when a phase starts and again when it ends, with the artifact paths. On `resume`, the
first row not `done` or `skipped` runs; a `running` row restarts from its beginning -
every phase checks its artifacts first and does only what is missing. Gate decisions are
recorded verbatim with who decided.

## P0 - Recon (read only)

Follow [references/recon.md](references/recon.md): stack and size, entry points,
routes and API handlers, outbound calls, **LLM touchpoints** (SDKs and raw HTTPS calls to
model endpoints), auth, persistence and migrations, CI, and the **names** of the
environment variables. Write `.ai/takeover/recon.md` with a `file:line` for every claim.

**Never print an environment value.** Read `.env.example` and the code's env reads for
names; never `cat` a `.env*` file, never echo a variable. A secret found in a tracked file
is a finding (tier 0, `secret`): record its file and line and the variable's name, not
its value.

## P1 - Boot

Run `/onboarding` (full run) on the repo: runtime probe, capability groups, `.env.local`
written without echoing secrets, boot verified, capability matrix. Copy the matrix into
`recon.md`. A degraded or hidden group is input to P3 and P7, not a reason to stop. If
the app does not boot at all, mark P1 `blocked`, record why, and continue read-only: P2-P7
work on code, and the control report says what could not be run.

## P2 - Map

The context map (v2) is what every later phase scopes by.

- **Personas answers** (project-populate resolves and Personas is reachable): run
  `/project-populate contexts`.
- **Otherwise** (the usual case at a company): adopt-bp's step 0 - write `context-map.json`
  yourself in v2 shape (`groups[]` with `name`, `domain`; `contexts[]` with `name`,
  `group`, `category`, `description`, `file_paths[]`, `entry_points[]`), one context per
  cohesive module of roughly 5-40 files, derived from the routes and directories recon
  found. A financial app's modules (ledger, invoices, payments, CRM, suppliers) should
  each be a context, not one "app" blob.

Then measure what the map can see:

```
node ${CLAUDE_SKILL_DIR}/scripts/coverage.mjs --product-root <repo> --uncovered
```

It reports files-claimed / files-tracked per top-level root, dead paths, and the
uncovered directories. Close the large gaps (a whole `api/` root unclaimed is a hole, a
`scripts/` folder may be fine) and rerun.

### GATE 1 - stack, boot, map

Show the operator, in one screen: the stack line, the capability matrix (works / degraded
/ hidden), the context count and coverage per root, and what recon could not settle.
Ask: **go** / **adjust** (what) / **stop**. Record the answer in the ledger. Nothing past
this line runs without a `go`.

## P3 - Readiness

Run `/passport-onboard` standalone (it assesses the 15 readiness dimensions, then offers
paths; take its **assessment** here - the paths it offers become candidate work items, not
work done now). When it does not resolve, score the condensed checklist in
[references/outputs.md](references/outputs.md#readiness) yourself. Either way the result
is `docs/takeover/readiness.md`: 15 dimensions, a level and the evidence for each.

## P4 - Adopt and scan

1. `/adopt-bp <repo>`: the v3 map, events, static metrics, the first judgement baseline in
   `.ai/lens-scan/` (overlay `bp:` names the bp checkout).
2. Add the four takeover lenses, each with lens-scan's own writer:

   ```
   node <lens-scan>/scripts/structure.mjs lens-add --manifest <bp>/docs/standard/lenses-custom/ai.takeover.api-llm.json --structure <repo>/.ai/lens-scan/app-structure.json
   ```

   and the same for `ai.takeover.security-depth`, `ai.takeover.backend-perf`,
   `ai.takeover.money-privacy`. An id the map already has is refused (exit 1): that lens
   is in, move on.
3. Measure each takeover lens over every feature with the **judge model** (overlay
   `judge_model`, default the strongest Opus available): `/lens-scan measure --lens <id>`,
   or headless `node <lens-scan>/scripts/drive.mjs cover --lens <id> --root <repo> --model <judge>`.
   Then `/lens-scan propose --lens <id>`. Built-ins (development, security, design,
   performance) were measured by adopt-bp; run `cover` for any that report gaps.
4. Optional second opinion: `/scan-sweep --ideas-only --lenses security,...` on the two
   or three riskiest contexts (it changes no code). A finding it makes that the lenses
   missed enters the store as a work item: `store.mjs propose --kind work-item --origin
   sweep --external-ref sweep:<context>/<n>`.

**Jobs run with permissions skipped** (lens-scan headless starts `claude -p` that way).
That is accepted on a clone or a takeover branch; it is not on a shared main.

## P5 - Backlog import (Azure DevOps)

With an overlay `ado:` block (or `--org`/`--project` and `--wiql`/`--query-id`) and a PAT
in `<repo>/.env.local` as `AZURE_DEVOPS_PAT` (scope: Work Items Read):

```
node ${CLAUDE_SKILL_DIR}/scripts/ado.mjs import --product-root <repo> --dry-run
node ${CLAUDE_SKILL_DIR}/scripts/ado.mjs import --product-root <repo>
```

Dry-run first and show the mapping counts. Each work item becomes a `work-item` proposal
(origin `ado`, external_ref `ado:<id>`) on the feature its area path names (else
`backlog`), lens from its type and tags, tier from priority and severity. A re-import
updates changed text and never duplicates. **No config: skip P5** with a ledger note
("no ADO config - backlog not imported") and say so in the control report. Writing back
to ADO is designed and off: [references/ado-sync.md](references/ado-sync.md).

## P6 - Triage

Every proposal gets a tier and a risk class, by the rubric in
[../lens-scan/references/triage.md](../lens-scan/references/triage.md):

```
node <lens-scan>/scripts/store.mjs --db <repo>/.ai/lens-scan/scan.db proposals --untriaged
node <lens-scan>/scripts/store.mjs --db <repo>/.ai/lens-scan/scan.db rank --id <id> --tier <0-3> --risk-class <c> --by skill:takeover-app --note "<why, file:line>"
```

- Rank **every** item, imported ones included: an ADO priority is the reporter's opinion,
  the rubric is the evidence. When you change an imported tier, the note says why.
- A tier 0 names the `file:line` of the defect AND the entry point that reaches it; no
  entry point, no tier 0.
- `risk` (1-10) is the risk of the change. Never write a severity into it.
- **Dedupe ADO against the scan.** For each ADO item, look for a scan proposal about the
  same problem (same feature, same risk class, same code site). When they match, rank both
  and name the other in each note (`same problem as p-3f9a1c (ado:1234)`). Decline
  nothing: which one to keep is the operator's call at GATE 2.

## P7 - Outputs

Write from the templates in [references/outputs.md](references/outputs.md), into the repo
(committing them is the operator's call):

- `docs/takeover/control-report.md` - for stakeholders: stack, health by lens, tier 0 and
  1 with evidence, the readiness gap, a two-week plan, and what was not measured.
- `docs/takeover/architecture.md` - modules, data flow, external calls, LLM touchpoints,
  one mermaid diagram.
- `docs/takeover/readiness.md` - from P3.

### GATE 2 - the ranked plan

Present, in this order: the **tier 0 list**, the **tier 1 list** (each item: id, title,
feature, risk class, evidence, size), the **ADO overlap** (matched pairs, and which one
you would keep), and the **UX shortlist** (the 2-3 screens P9 would take, from overlay
`top_screens` or the design lens and the routes users hit most). The operator approves
items - in the bp review UI, or by telling you, which you record as
`store.mjs decide --ids <a,b> --decision approve --by operator:<name>`. Never approve on
your own judgement. Record the gate in the ledger with the approved ids.

## P8 - Hardening batches

Approved tier 0 first, then tier 1, one lens at a time:

```
/lens-scan execute --lens <lens> --proposals <approved ids of that lens and tier>
```

Each run builds a pack branch (never main) and records before/after evidence. A
`work-item` has no metric: it is built against the acceptance criteria in its body and the
gates (overlay `## Gates`), and its evidence is the gate output. After each batch, **GATE**:
show the pack, its items done/failed with evidence; the operator triages each item
(accept / rework / descope) in the bp review UI or through
`drive.mjs triage ... --by operator:<name>`. Then `/lens-scan release` ships the accepted
items. The next batch starts only after the gate.

## P9 - UX track (parallel with P8)

Starts after GATE 2, runs beside P8 on its own branch so the two never write the same
files at the same time:

1. A design harness: lens-scan's `## Harness` overlay (start command, base URL, a route per
   feature) so every route can be reached headless.
2. Screenshots of every route, light and dark, phone and desktop, recorded as before shots
   (`store.mjs shot`).
3. `/perfect` on the top 2-3 screens of the shortlist: its loop proposes, the operator
   gates, its builders build.

A P9 change that touches a file a P8 pack touches waits for that pack's release.

## Safety

- **A clone or a branch**, never a shared main; never commit, stash or reset work that
  is not this run's.
- **Env values are never printed** - not in recon, not in the ledger, not in reports.
  Names only.
- **External writes are off.** The ADO adapter refuses to write unless `--enable-write`
  AND overlay `ado.write: true`; nothing else in this skill writes outside the repo and
  its bp registration.
- **The gates are the only path to builds.** No execute before GATE 2 approvals, no next
  batch before the batch gate. `drive.mjs --approve-proposed` only when the operator asked
  for those items to be built.

## Status

`/takeover-app status`: print the ledger table, the last gate decision, the next phase and
its first command, and from the store `proposals` counts by tier and status. Changes
nothing.

## Project overlay

Optional `<repo>/.claude/takeover-app/config.md`, frontmatter plus `##` sections; absent,
the run uses the defaults below and the ledger records `overlay: defaults`.

```
---
bp: ../bp                    # the bp checkout (adopt-bp, the takeover lens manifests)
judge_model: opus            # the model P4 measures the takeover lenses with
top_screens: [dashboard, invoices, suppliers]   # P9 shortlist; default: picked at GATE 2
ado:
  org: contoso               # name or https://dev.azure.com/<org>
  project: Ledger
  wiql: .claude/takeover-app/backlog.wiql       # or query_id: <saved query guid>
  process: agile             # agile | scrum | basic | cmmi (the write-back state map)
  write: false               # write-back switch; also needs --enable-write per call
  areaPathMap:
    "Ledger\\Reporting": reporting
    Suppliers: supplier-management
---
## Gates
npm run lint
npm run typecheck
npm test
```

| Key | Default | Meaning |
| --- | --- | --- |
| `bp` | `$ADOPT_BP_ROOT`, else a sibling `../bp` | The bp checkout. |
| `judge_model` | the strongest Opus available | P4's judge. |
| `top_screens` | chosen at GATE 2 | P9's screens. |
| `ado.*` | none: P5 skipped | Import source; `areaPathMap` maps an area path (full, or its last segment) to a feature slug. |
| `ado.write` | `false` | Write-back, with `--enable-write` on the call. |
| `## Gates` | `.ai/manifest.yaml` capabilities | Commands P8 runs per item, verbatim. |

The overlay reader takes a YAML subset (block maps, scalars, inline lists `[a, b]`);
anything else is an error naming the line.

## References

- [recon.md](references/recon.md) - the first-hour recon checklist, per ecosystem.
- [outputs.md](references/outputs.md) - control report, architecture and readiness templates.
- [ado-sync.md](references/ado-sync.md) - the two-way ADO contract (import built, write-back designed).
- lens-scan [triage.md](../lens-scan/references/triage.md) - the tier and risk-class rubric.

---

<!-- clause: skill-reflection v6 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the task's MAIN checkout: local,
gitignored run output inside the task's own repository, never a write into the registry.
A run that worked in a linked worktree logs in the main checkout that worktree belongs to
(`git rev-parse --git-common-dir`, minus `/.git`) - a disposable worktree takes the line
with it when it is removed. `log-run.mjs` resolves this on its own.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill takeover-app --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"takeover-app","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null` (with `log-run.mjs`, omit `--tokens-est`); exact figures are measured
  later from transcripts - never guess one.
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
