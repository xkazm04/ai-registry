---
source: github:blader/Claudeception
kind: practitioner build-walkthrough, repository form (a single-author prompt-only skill for one coding harness; no code beyond a 176-word banner script; three example skills; a research bibliography of eight references; 16 commits over five weeks, one from an outside contributor)
url: https://github.com/blader/Claudeception
commit: 62dbb91d1183a866b5cf40079265c825b2695843
title: "Claudeception - A Claude Code skill for autonomous skill extraction and continuous learning"
author: blader (plus one contributed step, PR #13)
words: 987 landing / 8,180 in-tree markdown, all of it read (SKILL.md 2,054; the pre-rebrand copy 1,854; research-references 941; README 784; three examples 1,987; template 320; WARP 240) + 176 words of hook script + 16 commit messages
extracted: 11 (7 design entries, 4 claim rows)
accepted: 2 amendments (enforcement-demotion, procedure-promotion) + 3 applications (2 against the source tree, 1 fleet experiment)
declined: 0
leads: 2
already_covered: 6
untriaged: 2
dispatched: 0
applied: 2 rows (1 experiment, 1 code)
shipped: 0 project commits (the code row landed in the registry harness's memory store, outside any fleet repo)
run_id: claudeception
siblings: 1 at claim (gstack, phase 0, no subject named); by Phase 7 the same sibling held uncommitted edits to the agent-instruction-files golden path and subject note, both left alone
rescan_when: "the source publishes an activation measurement (per-prompt hook against description matching, counted); or the template gains an observation count or invocation record on a skill; or a second first-party skill-extraction tool ships the same six-row dedupe table"
---

# Claudeception (2026-09-02)

## Phase 1, said out loud

- Gates green, index current, source not in the ledger. One live sibling at
  claim (gstack), phase 0, no subject held.
- **Declared focus read before triage** (last scorecard row): for a handoff with
  no fleet seam, write one `task` row against the source tree. Does not apply:
  this source is not a handoff (routing count 0 NONE) and both landings found
  fleet seams. Standing foci - fragments-first (the commit log was read before
  the skill body; it supplied the two paid-for failures), seam-to-falsify (the
  fleet hook chosen for the experiment is the form the amendment praises, so it
  could only confirm the cost side; the falsifier is named in the application).
- **Expected yield for the class, said before the table:** a prompt-only skill
  is the build-walkthrough's demo half with almost no operating half; the corpus
  already holds a fifteen-technique memory subject and a twelve-technique
  instruction-file subject on the same ground. Expected: mostly catches, one or
  two boundary-case amendments, one lead. That is what arrived.

## Class and sweep

Repository, cloned at `62dbb91`, unshallowed (16 commits). Swept in the method's
order: operating documents (none - no docs/, no ADR, no changelog; the commit log
is the only revision record), the instrument (`scripts/claudeception-activator.sh`,
one `cat`), the measurement (none anywhere in the tree), the types (the YAML
frontmatter test fixture, the template), the tests (one fixture, named for a
parsing hazard: a description holding a colon, quotes and a pipe), the README last.
Landing page 987 words; in-tree 8,180. Container check: prose, small, consistent.

## Design record (Phase 2d)

**D1 - activation by every-prompt hook.**
decision: a `UserPromptSubmit` hook prints a 176-word "mandatory evaluation" banner on every prompt.
forces: the harness routes skills by matching the description against the request; this skill's trigger is the *completion state* of an unrelated task, which no request text names.
buys: the reminder is present on every turn.
rejects: description matching alone - commit 2026-01-17 "Add activation hook for reliable skill triggering", README "higher activation rates than semantic matching alone" (no number).
where: `scripts/claudeception-activator.sh`; README "Step 2".
stage: capability discovery / when a rule is redelivered.
corpus: agent-instruction-files - `enforcement-demotion` sorts rules into gate or prose and has no row for a gate channel carrying prose; `context-reset-redelivery` owns redelivery cadence; `sibling-floor-ownership` audits the listing and cannot see a hook's stdout. **Boundary case -> amendment.**

**D2 - promote on first sight; count at the second write.**
decision: extract a skill from a single session's discovery; Step 1 (PR #13) searches existing skills by trigger and a six-row table decides update / create / variant / deprecate.
forces: the harness persists nothing across sessions except the instruction file and the skills; there is no episodic layer to count in.
buys: no observation is lost with the session.
rejects: count-then-promote (nowhere to count); the dedupe step arrived only after duplicates did.
where: `SKILL.md` Step 1 table; commits 2026-01-22.
stage: the promotion door.
corpus: agent-memory - `procedure-promotion` requires counted recurrence before promotion and assumes an episodic layer beneath. **Boundary case -> amendment.**

**D3 - description written as the retrieval key** (symptom-first, error text, context markers). corpus: `sibling-floor-ownership` step 2 "read the listing, not the entries"; `procedure-promotion` selection section. Catch.

**D4 - the dedupe table itself** (six rows keyed on trigger x fix, version arithmetic per row). corpus: `procedure-promotion` "confusable siblings are a merge-or-differentiate signal" and "re-promotion is a new version". Catch; recorded in the source-tree application as the concrete decision surface.

**D5 - least-privilege tool list for the writer** (Bash removed 2026-01-17: a skill that writes skills cannot install hooks or run them). corpus: `procedure-promotion` one-door; `memory-governance` write lanes. Catch; in the application.

**D6 - web refresh before persisting, cite references.** corpus: `instruction-freshness`; agent-memory provenance. Catch.

**D7 - verified-before-write and a 1-3 per session cap.** corpus: the stateable-outcome condition; memory as a budgeted resource. Catch.

**Routing count: 0 NONE of 7.** The run stays here; two boundary cases land as amendments, the mechanism-shaped rows are all owned.

## Triage (unattended: `real gap` and promoted `partial` rows advance)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | Altitude | Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | design/amendment | M | A hook that prints prose is not a demotion | agent-instruction-files/enforcement-demotion | corrects-claim (the sort has a third shape) | partial -> promoted | technique | activator.sh; commit 2026-01-17 |
| 2 | K | design/amendment | M | Promote-first when the promoted store is the only durable store | agent-memory/procedure-promotion | fills-stack-gap (a host class the four conditions assume away) | partial -> promoted | technique | SKILL.md Step 1; PR #13 |
| 3 | K | catch | - | Description as retrieval key | agent-instruction-files/sibling-floor-ownership | none | likely catch | - | SKILL.md Step 5 |
| 4 | K | catch | - | Six-row dedupe table | agent-memory/procedure-promotion | none | likely catch | - | SKILL.md Step 1 |
| 5 | K | catch | - | Least-privilege writer | agent-memory/procedure-promotion | none | likely catch | - | commit 2026-01-17 |
| 6 | K | catch | - | Refresh against cutoff before persisting | agent-instruction-files/instruction-freshness | none | likely catch | - | SKILL.md Step 3 |
| 7 | K | catch | - | Verified-before-write; per-session cap | agent-memory (golden path) | none | likely catch | - | Quality Gates |
| 8 | K | lead | S | Curator's bibliography vs the corpus's evidence base | agent-memory/procedure-promotion | none | thin | - | resources/research-references.md |
| 9 | K | currency | S | Skills invoke as `/skill-name` since harness 2.1 | agent-instruction-files claude-code applications | none | thin | dated fact | commit 2026-01-18 |
| 10 | T | script | S | Frontmatter fixture: colon, quotes, pipe in a description | check-skills.mjs | none | thin | - | test-skill-parsing.yaml |
| 11 | K | catch | - | "Workaround discovery" as an extraction trigger writes steering for capability gaps | agent-instruction-files/capability-before-steering | none | likely catch | - | SKILL.md Automatic Trigger 3 |

**Promoting questions, executed (v2).** Row 1: *does enforcement-demotion's sort have an output for a hook whose effect is text?* Read the file: two branches, gate or prose, and "the harness's own lifecycle hooks that fire on tool use" is listed on the gate side with no condition on what the hook does. Promoted. Row 2: *does procedure-promotion say what to do when no episodic layer exists?* Read the file: four conditions, "a procedure that fails any of these stays a memory" - it assumes there is a memory to stay in. Promoted.

## Verification (Phase 6)

- Row 1 home contested between `enforcement-demotion` (the sort), `context-reset-redelivery` (cadence) and `sibling-floor-ownership` (the audit gap). Chosen: the sort, because the finding is a third shape the sort does not classify; the other two are cited from inside the amendment. The golden path's "Advisory, not enforced" section was read; it does not mention hooks that emit prose.
- Row 2 home: `procedure-promotion` only; `consolidation` and `memory-governance` were read for the fourth-writer lane (automated observation) and it is a different writer - it infers nothing, this one infers everything.
- Corroboration: training-data convergence for the harness fact (a `UserPromptSubmit` hook's stdout is appended to context; a `Stop` hook's exit 2 is fed back to the model - the fleet's own hook header states the second). Fleet code read for both (three hook copies; the registry harness memory store). **0 of 3 fetches spent.**
- The contradicted premise worth keeping: the technique's suggested pairwise vocabulary lint was run on a real store with one known duplicate pair and ranked it third of five at the threshold that finds it. The source's trigger search found it exactly. The amendment is written from the measurement, not from the source.

## Landed (Phase 7)

- Amendment `enforcement-demotion` § "A hook that prints prose is not a demotion" - with the fleet measurement.
- Amendment `procedure-promotion` § "When the promoted store is the only durable store" - four compensations, the lint-vs-trigger measurement, two fleet instances.
- Applications: `agent-instruction-files/applications/claude-code--enforcement-demotion` (source tree), `agent-instruction-files/applications/node--enforcement-demotion` (fleet experiment, `better`), `agent-memory/applications/claude-code--procedure-promotion` (source tree + the memory-store code apply, `better`).

## Applied (Phase 7.5)

| technique | project | mode | verdict | what was read |
| --- | --- | --- | --- | --- |
| enforcement-demotion (amendment) | two fleet projects with a condition-observed Stop hook | experiment | better (for the condition-observed form, on cost) | 1,631 human turns replayed with the hook's own predicate: 122 fires (7.5%); every-prompt delivery would inject 15-25x the words and speak on 1,405 edit-free turns |
| procedure-promotion (amendment) | the registry harness's memory store | code | better | two files on one trigger merged into one; trigger search 2 -> 1; the vocabulary lint's four false pairs unchanged |

Seam-to-falsify, honestly: the experiment seam is the form the amendment praises,
so it could only measure the cost of the alternative; the compliance side has no
instrument in the fleet, named in the application. No `task` row: neither
landing is a mechanism a project lacks.

Phase 7.6 (directions): the design record's entries all read as catches or
boundary cases inside owned subjects; no `candidate` absence to propose against.
`directions=0/0`.

## Already covered (6)

Rows 3-7 and 11, with anchors above. Row 11 is worth one sentence: the source's
third automatic trigger ("found a workaround for a tool/framework limitation")
writes a skill for exactly the failure `capability-before-steering` says gets a
capability change and no line; the corpus already carries the rule and its
automated-loop clause.

## Untriaged (2) - not declined, nobody verified these

| # | Title | Anchor | What a later run would check |
| --- | --- | --- | --- |
| 9 | Skills appear in the slash menu as `/skill-name` since harness 2.1 | commit 2026-01-18 | whether any `claude-code` application asserts an older invocation form; a `verified_on` move if so |
| 10 | Frontmatter fixture with colon, quotes and pipe in a description | test-skill-parsing.yaml | whether `check-skills.mjs` parses a `description: \|` block holding a colon and quotes; one fixture would settle it |

## Leads (2)

- **The curator's bibliography is a self-evolution reading list with no measurement in it.** Eight references (Voyager, CASCADE arXiv 2512.23880, SEAgent 2508.04700, Reflexion, EvoFSM, Professional Agents 2402.03628, a self-reflection study 2405.06682, one survey) - all mechanism papers about agents that grow skill libraries; none of the controlled measurements of skill libraries in coding harnesses that `procedure-promotion` rests on. The boundary converges with ours on the mechanism (a library of promoted procedures) and diverges on evidence. **Return when** a second skill-extraction tool cites the same set, or when agent-memory is deepened - CASCADE's "meta-skill" framing and EvoFSM's experience pool are the two not yet in any note.
- **Per-prompt against per-session delivery of one judgment-call line, scored on compliance.** The source asserts the gain and measures nothing; the fleet measured the cost. **Return when** a managed project adopts a per-prompt prose hook and can count what changed, or a harness publishes hook-delivery compliance data.

## Method notes

- A repository this small (8k words) is read whole; no workers, no sampling.
  The commit log carried both paid-for failures (duplicates -> PR #13; under-firing
  -> the hook) and the body carried neither. Fragments-first held.
- The experiment cost one script over the fleet hook's own exported functions; the
  hook being a pure function over an edited-path set is what made a replay
  possible in minutes. Projects whose gates export their predicate are the cheap
  experiment seams.
