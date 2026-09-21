---
source: https://github.com/kineticsystem/find-me-a-freaking-job
kind: repository
url: https://github.com/kineticsystem/find-me-a-freaking-job
title: "find-me-a-freaking-job - a tool to automatically find a job using a local LLM"
author: kineticsystem (first-party, personal tool)
commit: 974e2019614e64a4a941dc60215a5b5733662870
commit_date: 2026-09-14
words: 2,510 landing / ~27,800 in-tree (doc/Architecture.md 4,037; Python package ~21,000; agent prompts 425)
extracted: 16
accepted: 1
declined: 0
leads: 3
already_covered: 7
untriaged: 5
dispatched: 0
applied: 1
shipped: 0
run_id: intake-fmafj
siblings: 0
rescan_when: "a commit after 974e201 adds the rejection reasons or the model identity to the criteria hash (jobfinder/pipeline/criteria.py), or moves the HN seen-marker after extraction (jobfinder/sources/hn_hiring.py); or 8 weeks elapse (2026-11-11)"
---

# find-me-a-freaking-job - intake 2026-09-16

**Class:** practitioner build-walkthrough in repository form. It is one developer's daily
job-search tool: deterministic fetchers, a local model behind a headless agent CLI, SQLite,
and a small web UI. The operating half is `doc/Architecture.md`, a first-party account
with measured failures recorded as revisions (a 20-minute session boot, three context
sizes from one server, an e2e suite that changed real data three times in a day). **Expected
yield, stated before the table:** catches, since the corpus already models most of this
architecture; one or two boundary cases from where the tree disagrees with itself; no
forge-sized system. **Declared focus** (qwenpaw): read what a falsifier's query had to work
around; plan the landing before dispatch; name a full category. The first applied here: the
experiment's workaround, a drift proxy standing in for a digest nobody stored, became the
landing's closing rule. The second did not apply (no dispatch). The third did not apply
(no new slug proposed).

**Swept, in order:** `doc/Architecture.md`; the model wrapper `jobfinder/opencode.py` (file
contract, budget refusal, retry); `pipeline/criteria.py`, `triage.py`, `extract.py` and
`profile.py`; `prompts.py` and both agent files; `prefilter.py`; `db.py` (upsert, the
needing query, stale-score view, source health); `sources/base.py` and `hn_hiring.py`;
the README last. 0 of 3 fetches. 0 siblings live on the board.

## Design record

1. **decision:** Python fetches and parses; the model only reads and judges. **forces:**
   inference is the scarce resource, and major boards expose JSON. **buys:** zero
   inference spent on markup. **rejects:** a model driving a browser through walled
   boards (Architecture.md "The one design decision"). **stage:** acquisition.
   **corpus:** grant-funding `deterministic-first-classification`, software-engineering
   `judgment-guardbands/deterministic-backbone`. Catch.
2. **decision:** the model writes `result.json` with its own tool, and stdout is never
   salvaged. **forces:** under `--format json`, stdout is the CLI's event stream. A
   salvage once validated an event object as an empty batch. **buys:** one result
   channel. **where:** `opencode.py` run_session comment. **corpus:**
   `structured-output/schema-validation-and-repair` (a legal, empty, validated artifact)
   plus the law `failure-not-empty-success`. Catch.
3. **decision:** every session is fresh and runs against a generated config with no tool
   servers. **forces:** the interactive profile booted three `npx` tool servers per
   session. That took over 20 minutes with no request reaching the model, and left 63 MB
   behind per directory; the generated config starts in about 10 seconds. **corpus:**
   `agent-instruction-files/workspace-ancestry-isolation` (make the loaded set an
   artifact) covers instructions, not tool-server boot cost. `agent-cli-transport` has
   no match for boot or startup. Partial: untriaged U1.
4. **decision:** evaluation validity is keyed by `sha256(profile|preferences)`, history is
   append-only, and stale scores stay visible but faded. Rejection reasons are
   **deliberately** kept out of the key. **forces:** a dismissal should shape future
   scoring without re-scoring everything. **where:** `pipeline/criteria.py`,
   `db.list_jobs` stale CTE, `prompts._rejections_block`. **corpus:**
   `aaa-craft-rubric-authoring/lens-versioning-as-invalidation`. It models the
   stale-but-visible display (the source converges with it independently) and states
   "if it could change a grade, bump", which the deliberate exclusion inverts. **Landed
   as K1.**
5. **decision:** a two-stage cascade. Batched triage over 12 postings with local refs
   1..N and 700-character excerpts, then a per-item deep dive above a threshold, capped
   per run. An omitted ref retries because it has no evaluation row. **corpus:**
   `game-production/prompt-fitness-and-evolution/unjudged-is-null-not-zero`, and
   civic-intelligence `llm-forensic-gating/entity-id-membership-gates`. Likely catch:
   untriaged U2.
6. **decision:** discovery compounds. Any board link found in a fetched posting is
   promoted to a permanent direct source, across four independent channels. **corpus:**
   NONE. Nearest is `grant-source-landscape/curated-floor-vs-live-feed`, which does not
   model promotion from a relay into a direct origin. Lead L1.
7. **decision:** the config file is authoritative for what a source is; the database is
   authoritative for whether it is on. **corpus:** NONE found by map. Lead L2.

**Routing count:** 2 NONE (entries 6 and 7) in one system, and no shared home-if-new, so
the run stays in intake with no forge handoff. **Directions:** the only subject landed
(`aaa-craft-rubric-authoring`) has no `candidate` absences in the fleet map: pof is
present, and the other twelve projects are out-of-domain. directions=0/0.

## Triage (v2.5 gate; upper-layer rows scored, leads under the corroboration table)

| # | Shape | Title | Home | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| K1 | amendment (inverts) | Injected context: evidence or steering | `game-production/craft-judgment/aaa-craft-rubric-authoring/techniques/lens-versioning-as-invalidation` | real gap | 2/0/1 | **accept** |
| C1 | correction | A seen-marker written before a capped stage is at-most-once without a failure | `backend-platform/work-execution/delivery-guarantees` | partial | 1/0/1 | untriaged |
| U1 | technique | Generate a hermetic per-workload agent config | `agent-cli-transport` or `workspace-ancestry-isolation` | partial | 3/2/2 | untriaged (home contested, prose measurement) |
| U2 | catch-check | Batched triage with local refs, omitted refs self-retry | `unjudged-is-null-not-zero` | likely catch | - | untriaged |
| U3 | technique | Keep the model's own words beside the digest of them | `prompt-assembly/compression-hardens-deferred-decisions` | partial | 2/2/1 | untriaged |
| U4 | technique | Rejections as taste guidance, never keyword rules | `prompt-assembly` | partial | 2/2/1 | untriaged |
| U5 | catch-check | Browser suite against a throwaway instance after three live-data mutations | `test-harness/isolation-lanes` | likely catch | - | untriaged |

**K1** is authorized by code read in a tree: the source's `criteria.py` and
`_rejections_block`, which says the block is not part of the criteria hash on purpose.
The read converges with recommender practice, where feedback re-ranks future candidates
and never re-scores history. The row is an append: the technique's "if yes, bump"
sentence stays true of lens edits, and the new section treats injected context as a
separate input class.

**C1, from the tree disagreeing with itself.** `hn_hiring.py` marks each comment seen at
fetch time, for up to 120 comments. Extraction then runs at most 3 batches of about
3,000 tokens, which is roughly 18 comments, and skips entirely when the model server is
down. So most of a thread is marked as structured and never structured. The Architecture
doc says "each comment is only ever structured once". The corpus already owns this
failure: `delivery-guarantees` (no informal states; a watermark is the last position
*durably processed*). Its enumeration of accidental at-most-once names only the crash.
The source shows a success-path cause, a planned budget cap. Scores 1/0/1, so it is
banked. Return: a second source, or a fleet seam, where a cap or a planned skip sits
behind an intake marker.

## Catches (already covered)

- Deterministic fetch, model judges (entry 1).
- File contract with no stdout salvage (entry 2).
- A criteria hash that omits model identity and the scoring scale. That is the ordinary
  stale-lens failure (`lens-versioning-as-invalidation`: "retain an exact content digest
  for every executed instrument"; `prompt-assembly/fingerprinting-and-cache-keys`: "the
  identity of the model family ... is an input"). The source has it and does not know.
- Stale scores shown faded rather than blanked. This converges with "display
  stale-under-current-policy separately from never judged".
- Refusing a prompt over 80% of a conservative window rather than letting the server
  truncate (`prompt-assembly/context-budgeting`: floors fail loudly, and the tail
  truncation is "chosen by nobody").
Not verified against a file, so these are recorded as seen rather than as catches: a
cooperative stop between units that kills the in-flight process group, and a readiness
gate that writes no run record until its inputs exist.

## Leads

- **L1 - relay-to-origin promotion.** A hit in a bulk relay registers its origin as a
  direct source, so discovery compounds. Return: a fleet project grows a
  crawler or ingest that sees origin links inside relayed records.
- **L2 - declaration versus switch ownership.** A seeded config stays authoritative for
  identity and loses authority over enablement once an operator has touched it. Return: a
  second source with the same split, or a fleet settings seam that re-enables on re-sync.
- **L3 - dated fact: one local inference server reports three context sizes.** The
  client config, the models endpoint and the per-slot value disagreed (155K, 64K and
  128K), and only the per-slot value governs a request. Return: a fleet project budgets
  against a local server's advertised window.

## Apply (Phase 7.5)

K1 went to **pof** (`judge-craft-quality` context), in `experiment` mode, with verdict
**better**. The seam was chosen to falsify the landing. pof's panel judge reads a sibling
projection that looks like steering, but its rubric condemns contradictions with it. A
read-only pass over the live store ran pof's own hash:

- Of 152 bound panel verdicts, 143 have siblings, and 131 of those had a sibling updated
  since the judgment.
- Full binding would stale 131 (92%).
- Per-dimension binding (coherence weakest) stales 13.
- As built, nothing is staled.

A keyword attribution first marked 93 rows. Read row by row, most of those praised
sibling consistency, so it was discarded. A CAUGHT outcome of 0 or all-131 would have
collapsed the split into one side. The finding held as the per-dimension rule. Row
committed in pof `bba723dc` (not pushed), with the next change filed: stamp the projection
digest on each verdict. **Ship 0:** adoption adds a provenance state across acceptance,
the standing chips and the judge runner, which is more than one readable diff for a
ledger run.

Application: `knowledge/game-production/craft-judgment/aaa-craft-rubric-authoring/applications/node--lens-versioning-as-invalidation.md`.
No source-tree applications were written: the source's entries 1, 2 and 4 converge with
techniques that already say the same thing better, and entries 6 and 7 have no subject.
