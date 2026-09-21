---
source: github:supermemoryai/supermemory@a92c21b2
kind: vendor-repository
url: https://github.com/supermemoryai/supermemory
title: "supermemory - memory and context engine (re-mined in the memory lane)"
author: supermemoryai (first-party; open client, docs and a released self-hosted server binary beside a hosted platform)
commit: a92c21b2dceba3fc5aa92c10dc6c5b345e40c034
commit_date: 2026-09-16
engine: supermemory-server 0.0.8 windows-x64 (release server-v0.0.8, sha256 d8fb2ac0)
words: 2,057 landing / ~119,700 in-tree markdown (22,886 across the concept, recall, ingestion and benchmark docs read) ; 0 of 3 fetches
extracted: 13 (6 design + 7 claim)
accepted: 2
declined: 0
leads: 4
already_covered: 4
untriaged: 8
applied: 3
shipped: 4
dispatched: 0
run_id: intake-supermemory
siblings: 1
lane: memory (--memory)
prior_note: 2026-08-26-supermemory
rescan_when: "a server release after 0.0.8 adds an as-of or observation-time parameter to search or evaluates forgetAfter against documentDate rather than the wall clock; or the memorybench scorer counts provider failures against accuracy; or 8 weeks elapse (2026-11-12)"
---

# supermemory, re-mined in the memory lane - the engine was never closed

**This source was mined on 2026-08-26** (run 18, skill 0.10.0), before the memory lane
existed and without a commit pin. The operator re-invoked it with `memory`. Under the lane
the question is not what the docs claim but **which arm this is and whether it can be
re-run as one**, and that question overturned the prior note's premise.

## The correction to the prior note

The 2026-08-26 note read this as "a vendor repository whose headline product is not in
it... the engine is a hosted service". **It was not, even then.** The engine has shipped as
a self-hosted server binary since `server-v0.0.2` (2026-06-10), with Windows support from
`server-v0.0.6` (2026-07-19), documented under `apps/docs/self-hosting/`. The prior run read
`concepts/` and the client types and never opened `self-hosting/` or the Releases page. The
class reading ("a closed engine still ships its ontology in its client's types") is still a
good heuristic; its premise for this source was wrong, and the consequence was a run that
priced the engine from its schema when it could have been run.

**Lesson for the class:** a vendor repository's Releases page is part of the tree. Check it
for a server artifact before concluding the engine is hosted-only.

## Memory lane: which arm is this?

Read against the ladder before the corpus. The engine stores every document verbatim as
chunks **and** runs a tool-calling extraction agent that searches existing memories,
creates atomic ones, and links them with `updates | extends | derives`; a superseded memory
keeps its version chain and leaves search. Retrieval can return memories only, or memories
plus raw chunks (`hybrid`).

No ladder row has that shape. Its nearest priors bracket it: *verbatim + hybrid retrieval,
no model at write* (0.87, 5 stale) keeps the chunks without the distillation; *write-time
verdict reconciliation* (0.78, 4 stale) decides supersedence at write time without the
chunks. The sibling mem0 run today (`2026-09-17-mem0`) banked the adjacent missing shape -
LLM extraction, **no** rewrite, hybrid retrieval - as a lead. This engine is the
non-additive counterpart: supersedence decided by an agent at write, filtered at read.

Its published numbers (#1 on three long-term-memory suites) are a lead, never evidence, per
the lane. So the mechanism was **built as an arm** before anything about it was landed.

## The arm

`personas` `c67a86bec`: `evals/memory-year/memory_year/backends/supermemory.py` plus
`evals/memory-year/arms/supermemory/` (shim, launcher, supervisor, README).

- The released binary runs locally; its write-time model is routed through an
  OpenAI-compatible shim onto the harness's cached Claude CLI, `claude-sonnet-5@low`, the
  same writer the other model-bound arms use. The engine's extraction is a **tool-calling
  agent loop**, not a completion - the smoke run produced 0 memories until the shim
  translated tool calls, and then failed repeatably when the CLI tried to call the named
  tools natively and cached its own refusal.
- **Design choices recorded in the run header:** one document per simulated day (the
  engine's own "medium-sized, self-contained documents" rule; one event per document would
  have been ~25k CLI calls); strict ingest order, each document waited on through `status`
  and `dreamingStatus` (the docs make arrival order the temporal authority); hybrid search
  at `limit` 100 / `threshold` 0 so the harness budget binds rather than the engine's
  default cap of 10 at 0.5 (the lane's "a cap inside an arm outranks the declared budget").
- **Hazard recorded, not repaired:** the engine stamps and expires on its **wall clock**.
  The scenario is dated 2025; the profile endpoint labels every entry with the real date,
  and any `forgetAfter` the agent writes has already passed. There is no as-of parameter
  on search.
- **A year does not fit one model-budget window**, and the first attempt was discarded at
  day 174: the harness answers every probe after the replay, so nothing was salvageable,
  and a naive resume would have answered a day-20 probe against a store holding day 174.
  The adapter now checkpoints document ids before the wait, deletes and re-sends failed
  days in order, stops after three consecutive failures, and **replays each probe's
  context from the instant it was first captured**. The supervisor resumes at the reset
  the CLI names.

### Result

Completed 2026-09-18 across four model-budget windows: 361 day-documents, 3,571 events,
0 failed documents in the final store, 194 probes. **The arm tops the ladder** - 0.90 on its
mixed read (memories plus raw history), **0.92** on the curated read (memories only),
against retrieval-filling-its-budget at 0.89 and verbatim+hybrid at 0.87. It is also by
some way the most expensive to write: about 4.1 writer calls per ingested day
(~1,000-1,100 for a clean build; the header reported 0 and the true figure was
reconstructed from the writer cache - see the lesson).

**The finding is not the ranking, it is what the store did with supersedence.** A
superseded value reached the context in **92 of 92** reversal and expired probes, through a
retrieved *memory*, under both read modes. The docs say search excludes forgotten and
expired memories; a non-latest version is neither, so the version chain records which item
won without keeping the loser out of the result set. `consolidation`'s "recall serves the
successor" is not what this store does - and it still scored at the top, because every item
carries its date and version marker and the reader adjudicated all but 6 to 7 of those 92.

That answers the sibling mem0 run's untriaged promoting question ("must read-time
adjudication be able to *exclude* a superseded belief, or only rank it?") with a measured
third option: **it excluded nothing and labelled everything, and that was enough**.

**The paired read** (same store, same instants, one variable) differs on 5 of 194 probes,
all five favouring the curated read, none the other way - a sign test at p≈0.03, but three
of the five are near-identical answers separated by grader strictness, which the lane's own
rule says is an input to the score. The two that are mechanism: on a reversal the mixed read
answered the retired value while the curated read answered the current one, and on a
failure-cause the mixed read confused two projects. The raw layer cost 347 tokens per probe
and bought no correct answers. **Read the 0.92-vs-0.90 as "not worse, cheaper", not as a
two-point win.**

**Distrust the expired class** (6 probes, 0.50): the engine expires on its wall clock and
the scenario is dated 2025, so every `forgetAfter` its agent wrote had already passed.

## Design record (Phase 2d)

Written by a read-only worker and checked by the director at the anchors quoted.

**D1 - Memories form in a second phase ("dreaming"), grouped across documents.**
- decision: `done` means searchable chunks; memories come later, from related documents
  grouped into coherent units.
- forces: extraction from one isolated write cannot see the relations that make an update.
- buys: `updates`/`extends` judged across a session rather than per message.
- rejects: per-write extraction (`instant`), priced as an extra operation.
- where: `apps/docs/concepts/how-it-works.mdx:116 "come from a second phase called **dreaming**"`
- stage: capture -> consolidation.
- corpus: `agent-memory/consolidation` ("a periodic batch over a window of episodes"). Catch.

**D2 - Inferred memories are provisional and down-weighted until reviewed.**
- decision: derived facts carry `isInference` and rank below stated ones; a review queue
  approves, declines (forgets) or undoes.
- forces: a guess must not outrank what the user said.
- where: `apps/docs/recall/memory-review.mdx:24 "down-weighted in search"`
- stage: recall ranking.
- corpus: partial. `memory-governance` states the two ends - an unconfirmed item "recalls
  as unconfirmed or not at all". Down-weighting is a third policy between them, and
  nothing measures which is right. Lead.

**D3 - The version chain keeps retrieval on the current fact; forgotten and expired
memories leave search by default.**
- where: `apps/docs/recall/search.mdx:208 "excludes memories that have been forgotten"`
- corpus: `consolidation` § Supersedence. Catch (also caught 2026-08-26).

**D4 - Arrival order is the temporal authority; `documentDate` sits beside it, and the docs
never say which wins when they disagree.**
- where: `apps/docs/concepts/rules.mdx:116 "that's how supermemory determines what came first"`
- corpus: partial. The sibling run's `observation-clock` owns grounding a relative phrase in
  the observation clock; it does not own out-of-order arrival. Untriaged.

**D5 - Always-on tiers are deduplicated with a fixed precedence before injection.**
- decision: static profile, then dynamic profile, then search results; a later item whose
  normalized text was already seen is dropped.
- where: `packages/tools/src/tools-shared.ts:404 "!seenMemories.has(key)"`
- corpus: partial. `recall-injection` budgets its three tiers separately and has no
  cross-tier dedup rule. GAIN 1 (boundary), below threshold. Untriaged.

**D6 - One engine, two write pipelines (`memory` vs chunk-only `superrag`).**
- where: `apps/docs/ingestion/add-memories.mdx:303 "No fact extraction, no profile updates."`
- corpus: `baseline-ladder` models distilling vs verbatim. An in-engine one-variable pair;
  lead.

**Routing count:** NONE 0; partial 3 (D2, D4, D5), all under `agent-memory`, no shared HOME
IF NEW. No handoff.

## The benchmark this source ships (memorybench / MemScore)

Audited against the lane's four claims and its instruments.

- **Gets right:** reports accuracy, latency and context tokens side by side, unweighted
  (`apps/docs/memorybench/memscore.mdx:48 "MemScore leaves that trade-off to you"`); recommends re-judging with a second judge.
- **Failures leave the denominator.** `apps/docs/memorybench/memscore.mdx:34 "failures are excluded from accuracy, not counted against it"`. A provider that times out on the hard questions scores higher.
  -> the landing below.
- **The rubric is a provider input.** `apps/docs/memorybench/memscore.mdx:18 "providers can supply their own judge prompts"`. The lane's "a grader's rubric is an input to the score" applies directly.
- **Self-against-self** comparison set, **no write cost** on the cost axis, restraint as one
  number rather than two, and the engine's own default cap unexamined against the budget.
  All already in the corpus; catches, recorded so the next memory source is priced faster.

## Triage (Phase 5, scored)

Declared focus (scorecard): **`extract`, via the untriaged backlog** - grep prior runs'
untriaged tables for this source's terms before scoring. **Done: no convergence** from any
other source's untriaged rows (denominator, inferred-vs-stated, cross-tier dedup, arrival
order). Three of this source's own 2026-08-26 untriaged rows were re-sighted in the same
docs (speaker grounding, the always-include test, write-time input scoping); same author,
so not independent, and they stay untriaged. **The convergence the focus was hunting came
from a sibling note instead**: the mem0 run's untriaged "temporal boost never filters" row
and its "contradiction resolution" lead are what the arm's recorded pair measures.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | S | Incomplete is decided by whose failure it was | eval-harness/outcome-conditioned-cost | corrects-claim | real gap | 2/0/1 | **accept** |
| 2 | X | arm | L | Build the engine as a ladder arm | memory-lane ladder | new measurement | real gap | lane rule | **built** |
| 2b | K | technique | M | Stale served versus stale answered | recall-injection; consolidation § Supersedence | new-technique | real gap | 3/0/2 | **accept** |
| 3 | K | technique | M | Rank inferred items below stated until reviewed | memory-governance | new-technique? | partial | 2/2/2 | untriaged |
| 4 | K | amendment | S | Dedupe across recall tiers, highest tier wins | recall-injection | fills-stack-gap | partial | 1/0/1 | untriaged |
| 5 | K | amendment | S | Arrival order vs claimed date: name the authority | observation-clock (sibling) | corrects-claim | partial | 1/1/1 | untriaged |
| 6 | K | technique | M | Bulk forget: preview, then apply by the previewed ids | decay-and-forgetting | new-technique | partial | 2/2/2 | untriaged |
| 7 | T | lead | S | memscore rubric supplied by the provider | judge-stability | none | catch | - | catch |
| 8 | K | lead | S | In-engine pair: extraction vs chunk-only | baseline-ladder | none | lead | - | lead |

Row 1 GAIN 2: under a condition the file never names - the failing component is part of
the arm - its "incomplete, belongs in neither view" rule inverts to "a failed trial".
Scored as an inversion, which is the judgment call in this table. RISK 0: the director
opened the file and the section appends without falsifying a sentence. `auto=1/5/0 fp=0`.
Row 2 ran under the memory lane's rule, not the score: a mechanism becomes an arm before
it becomes a technique.

## Landed

- `eval-harness/techniques/outcome-conditioned-cost` § "Incomplete is decided by whose
  failure it was" + two `use_when` entries. Registry `dd2336f5`.
- `eval-harness/applications/python--outcome-conditioned-cost` (fleet, code, better,
  ab-paired). `check-anchors`: 5 of 5 held (first pass 1 of 5 - escaped quotes end a quote
  early; rewritten with quote-free substrings).
- `agent-memory/techniques/stale-served-versus-stale-answered` + the golden path's
  `techniques:` list + `agent-memory/applications/python--stale-served-versus-stale-answered`
  (fleet, code, better, ab-paired). `check-anchors`: 4 of 4 held. **Row 2b did not come from
  the source**: it came from the arm's own measurement, under the method's clause that the
  fleet originates too. GAIN 3 (a new technique in a subject the scan ranks first), RISK 0
  (the director ran the measurement; the landing appends).

## Applied (Phase 7.5)

**outcome-conditioned-cost / personas / code / better / ab-paired.** The seam was chosen
**to falsify**: if the memory-year harness charged its own failures to arms, the published
ladder would carry them. Two paths could. The visible `error` verdict stays in the scored
denominator - and is zero on all thirteen published runs. The silent one: a failed or empty
judge extraction returned `""` and the judge fell back to raw matching with no mark. A
constructed reply that states the current value and narrates the old one scores correct
with a working extractor and **wrong-old** with a failing one. Fix: the judge returns a
distinct no-value, marks the verdict, and the report counts it. **Target:** degraded
verdicts visible. **Floor:** no verdict moves. HEAD vs fix over the cached answers of all
thirteen runs: **2,158 judgments, 0 verdict changes, 0 degraded**, 521 of 522 judge calls
from cache; positive control fired on a throwing and an empty extractor. **Refuted:** the
worry that the ladder silently absorbed judge outages. Personas `bee29e016`.

**stale-served-versus-stale-answered / personas / code / better / ab-paired.** The harness
reported only the wrong-old rate, which cannot say whether the store served the superseded
value or the reader repeated it. Added `served_stale()` and a paired report section.
**Target:** the split is reported. **Floor:** no verdict moves. Re-ran one arm over identical
replayed contexts: **194 of 194 consumer calls from cache, 0 of 194 verdicts changed**, new
section reports **92 served / 6 answered**. The zero-cost re-run is a property of the arm's
context recording, not luck.

**The arm / personas / experiment / better.** See Result. One store, two read modes recorded
at the same instants; consumer, judge, budget and elaboration held to the ladder's.

## Shipped

- personas `bee29e016` - the judge marks and counts its own failed extractions (master).
- personas `c67a86bec` - the supermemory arm and its run kit (master).
- personas `2172cbc6b` - staleness measured at two points, in the report (master).
- personas `2186f009b` - round five in `FINDINGS.md`, three `applied.jsonl` rows, and the
  shim counter fix so write cost survives a resume (master).

All committed with a pathspec on `master`; hooks (gitleaks) passed; **not pushed**.

## Directions (Phase 7.6 / 7.7)

`directions=n/a`: every design-record entry resolved to a catch or a partial inside
`agent-memory`, and the sibling run found the fleet map lists no absences for that subject.
Gate: empty.

## Untriaged (nobody verified these; anchors kept)

| Row | Anchor | Promoting question |
| --- | --- | --- |
| Rank inferred below stated until reviewed | `apps/docs/recall/memory-review.mdx:24 "down-weighted in search"` | Is down-weighting better than `memory-governance`'s "unconfirmed or not at all" on any measured class? Needs an inferred-fact class the ladder does not have. |
| Dedupe across recall tiers | `packages/tools/src/tools-shared.ts:404 "!seenMemories.has(key)"` | Does any fleet recall path inject one fact through two tiers? Seam not found in personas in one pass. |
| Arrival order vs `documentDate` | `apps/docs/concepts/rules.mdx:116 "that's how supermemory determines what came first"` | When they disagree, which does the engine's `updates` relation follow? Testable by ingesting two days out of order. |
| Bulk forget: preview, then apply by id | `apps/docs/recall/memory-operations.mdx:179 "then re-run with"` | Does `decay-and-forgetting` separate a forget-by-query from a forget-by-previewed-ids? |
| Speaker grounding (`entityContext`), re-sighted | `apps/docs/ingestion/add-memories.mdx:203 "Context for memory extraction on this container tag"` | carried from 2026-08-26 row 2; same author |
| Always-include test, re-sighted | `apps/docs/concepts/user-profiles.mdx:47 "call me Dhravya, not my full name"` | carried from 2026-08-26 row 4; same author |
| Write-time input scoping, re-sighted | `apps/docs/concepts/rules.mdx:205 "filterByMetadata"` | carried from 2026-08-26 row 6; same author |
| Embrace a little noise / don't pre-summarize | `apps/docs/concepts/rules.mdx:289 "Embrace a little noise"`, `apps/docs/concepts/rules.mdx:144 "Let supermemory handle the learning"` | carried from 2026-08-26 rows 5 and 16 |

## Catches

- Dreaming as a batch over a window: `consolidation`.
- Version chain, forgotten and expired excluded from search: `consolidation` § Supersedence.
- memscore reports cost beside accuracy unweighted: `baseline-ladder`.
- A provider-supplied rubric: `judge-stability`.

## Leads

- **The wall-clock hazard, measured.** The engine expires on the real date against a 2025
  scenario. Return condition: the rebasing clock-purity check (`intake/clock-purity-rebase`,
  unmerged) lands on `master` and a second replay at a shifted base date is affordable.
- **The in-engine pair** - extraction vs chunk-only `superrag` on one engine. Return
  condition: a second year of budget for this arm.
- **Inferred below stated.** Return condition: the scenario gains an inferred-fact class.
- **Contradiction resolution across store shapes.** The sibling's mem0 lead asked for our
  own measurement of an additive store; this arm is the non-additive side. Return condition:
  the additive arm is built, then read the reversal class across both.
