---
source: github:OpenBMB/PilotDeck
kind: repository
url: https://github.com/OpenBMB/PilotDeck
title: A denominator, a door and a base that three of the tree's own guards never checked
author: OpenBMB / ModelBest, THUNLP and partners
words: 2530
extracted: 23
accepted: 5
declined: 0
leads: 2
already_covered: 11
untriaged: 4
dispatched: 0
applied: 6
shipped: 4
run_id: in-pd-0929
siblings: 1
fetches: 1
commit: ae87280a (shallow clone, 2,012 commits upstream)
rescan_when: the always-on apply path calls its mechanical worktree-apply function, or the router applies its orchestration tool whitelist; or 12 weeks elapse (2026-12-22)
---

# A denominator, a door and a base that three of the tree's own guards never checked

**Class:** repository, design-deep, a task-oriented agent runtime ("agent operating
system") with per-project workspaces, white-box memory with an idle consolidation, a
difficulty router that demotes work to cheaper models, an always-on background loop, a
context engine and a durable session store. Expected yield per the class: catches from
the mature parts, two or three contrast findings, and a fact-check of the README's
numbers. The README (2,530 words) was read last; the landing page carries its four
headline claims, and the tree carries none of their measurements.

## What was swept, and how the claims were checked

Four read-only readers took four systems (memory; router and model pool; always-on and
cron; context, session and the operating documents) and returned design-record entries
with `path:line "quote"` anchors. The director then **re-ran** the strongest executed
claims himself, from the readers' own harnesses, and did not rely on a report for any
finding that landed: the Dream rollback and its write-loss cases, the router's
cache-aware switch across eight cache fractions, the parse of hostile judge output, the
selector and empty-answer cases, the heartbeat with the model down, the transcript
replay cases, the cron transition dates, the worktree and snapshot diffs, and the
permission matcher. Fifty anchors from the four reports were run through
`scripts/check-anchors.mjs` (50 of 50 held); every application's anchors were checked
against its own tree (all held after three corrections to a bare path, an inner quote and
one moved line). One correction to a reader: the "uncalled" apply function is in fact
injected into a service's dependency bag and never invoked, which is not the same
statement. In-tree operating documents: about 110 KB of testing records, architecture and
requirement documents (English and Chinese) and a screenshot-fidelity log, against the
2,530-word landing page. The tests are few (there is none for the router's parse, fallback
or health tracker, the always-on scheduler and gates, the workspace modules, or the memory
provider); the failure-named cases that exist are the compaction snapshot, the message
stream and the cron schedule.

One primary was fetched verbatim (the provider's caching documentation, by `curl`, never a
summariser): its `input_tokens` is "the tokens after the last cache breakpoint", the total
is the sum of read, write and input, and a system-layer change invalidates the system and
message caches. That fetch is the corroboration under `whole-prompt-denominator` and
`pinned-prompt-clock`.

**Declared focus (last scorecard row): execute a harness's real code with the irrelevant dependencies stubbed before triaging.** Met: every landed row rests on a run the director repeated, and three of the five landings were invisible to a read that had reached the same functions (a fraction that clamps past one, a load with no filter, a diff that ignores commits).

## Fact-check notice (kept out of the findings, per the standing rule)

- **"~70% cost savings", "1/6 the cost while beating frontier models", the routing
  tables.** No evaluation, protocol, seed or scorer exists anywhere in the tree. The only
  trace is one comment naming a benchmark that appears nowhere else. The README's own
  arithmetic is off by a tenth (12.58 / 2.83 is 4.45x; its multiplier column gives 4.55x).
  Treat the figures as the vendor's claim, not a measurement.
- **"Dream Mode consolidates memory in idle windows."** Nothing detects idleness; the
  scheduled pass runs when files changed since the last one and its interval elapsed.
- **"Layout and tone never bleed across projects."** True by construction for a single
  project (each has its own directory), and untested; a workspace in the user's home
  directory reads every other workspace read-only by design.
- **"One-click rollback."** A one-slot before-image that toggles between the two states
  and refuses after any write, including a write that was then deleted.
- **"Running long-horizon monitors."** No monitor exists; the only watcher lifts a dormancy
  flag when files change. "After you sign off" holds while the server process runs.
- **The router's planning-versus-polishing split.** One judge call per user turn on the last
  message; the tool whitelist the orchestrator would need is documented as enforced and is
  never applied (`requestPatch` is never assigned).
- **A screenshot QA log ends "passed"** while its own body lists five unrelated baseline
  failures in the stream-timing tests, the area the reconciliation documents cover.

## Design record (four systems; the strongest, condensed)

| # | decision | corpus | home |
| --- | --- | --- | --- |
| 1 | a cache-aware switch keeps the incumbent model when the newcomer's full prefill exceeds the incumbent's cached price | modelled (`cache-continuity`); the fraction it runs on divides by the uncached remainder and clamps to one | **row 1** |
| 2 | recall is a gate, a project pick, a manifest pick and a load by id | partial (`recall-injection`, `stale-served-versus-stale-answered`): the retirement filter is not applied at the load | **row 2** |
| 3 | unattended work runs in a disposable copy; only the merge waits for a human | modelled (`disposable-run-environments`); the read-back is blind to commits | **row 3** |
| 4 | the system date is pinned per session, a rollover is a tail message, only a full compaction refreshes it | none: nearest `variable-interpolation` | **row 4** |
| 5 | consolidation runs on a staged copy and swaps directories, undo gated on identical state | partial (`durable-store-failure-posture` names the lost update, not the long window) | **row 5** and lead 6 |
| 6 | a compaction is one fsynced snapshot record; replay honours only a complete valid one | partial (`compaction-checkpoint`); the emergency tier is never persisted | untriaged 9 |
| 7 | difficulty is inferred by a judge over the last message, sticky through the tool loop | modelled (`turn-classification`); the parse fails toward the cheap tier | catch, application |
| 8 | savings are repriced tokens at a baseline model | none: nearest `price-tables` | lead 7 |
| 9 | a fire that finds nothing goes dormant until the tree changes | partial (`attention-budgets`) | untriaged 8 |
| 10 | live streaming and persisted history share block identity, never text similarity | partial | untriaged 10 |
| 11 | an unattended session is auto-allow with a deny list over command patterns | modelled (`os-enforced-run-boundary`), as its counter-example | catch, application |

**Routing count (Phase 2d).** Entries whose corpus line is NONE: three (rows 4, 8, 9);
none of the four systems reaches three, and no home-if-new is shared by three (each names
a different subject). Decision written before landing: **stay in intake; no forge
handoff.** The handoff was not declined; the count was not met.

## Triage (v2.5: scored, then landed)

| # | Lane | Shape | Eff | Candidate | Prior art | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | input is the whole prompt; convert at the extractor; never clamp a ratio | cost-metering; cache-continuity | 3/0/2 | **accept**: landed |
| 2 | K | technique | M | filter at the id door; an empty selection is not a crash | agent-memory | 4/0/2 | **accept**: landed |
| 3 | K | technique | M | read a run back against the recorded base | unattended-run-isolation | 3/0/2 | **accept**: landed |
| 4 | K | technique | M | pin the prompt clock to the session; rollover at the tail | prompt-assembly | 2/0/2 | **accept**: landed |
| 5 | K | amendment | S | a staged pass that swaps is the long-window lost update | durable-store-failure-posture | 2/0/1 | **accept**: landed |
| 6 | K | technique | M | reversible consolidation with an undo gated on identical state | agent-memory | - | **lead** (memory lane: not expressible on the four-call contract) |
| 7 | K | technique | M | a counterfactual saving assumes the baseline used the same tokens | cost-metering | 2/1/2 | **lead** |
| 8 | K | technique | M | dormant until a cheap signal says the input changed | proactive-nudges | 2/1/2 | untriaged |
| 9 | K | amendment | S | emergency truncation must be persisted; resume equals live | history-compaction | 1/0/1 | untriaged |
| 10 | K | technique | M | block identity shared by live and durable copies | chat-transcript | 2/1/2 | untriaged |
| 11 | K | technique | M | a sticky orchestrating flag over a judged tier | model-routing | 1/1/1 | untriaged |
| 12-22 | K | catch | - | judge continuation rule, dangling-turn repair, summary gate, cron DST, deny-list boundary, scope as directory, bounded recall, retry before first byte, revision claim, cache-aware switch, compaction ladder | modelled | - | **already covered** (five carry a contrast application) |
| 23 | K | folded | - | a capture flush consumes the turn when the model is down | failure-not-empty-success | - | folded into row 2's application |

`auto=5/0/0`, `fp=0`. Rows 7, 8 and 9 each fail the score on the single blocker (a worker
report the director did not re-check) or on the gain: 8 and 10 were not re-read, so the
promotion read was not spent on them (the standing focus was execution, and both would
have cost another reader). Nothing was declined; every unpicked row carries no judgment.

## What landed

Four techniques and one amendment, all corroborated by an executed run **and** a second
tree:

- **`whole-prompt-denominator`** (cost-metering). Verified against the fetched primary and
  found live in the fleet: an LLM-cost service whose three client extractors ignored the
  convention stated on its own receiving type, and a product that mirrors calls to it.
  Fixed in both, paired, committed, not pushed. The second reader-visible instance was in
  the source tree itself, in the router's cache fraction.
- **`filter-at-the-id-door`** (agent-memory). Executed in the source; converged on
  independently by a fleet tree whose comment reasons to the same placement rule.
- **`diff-from-the-recorded-base`** (unattended-run-isolation). Executed in the source;
  live in a fleet dispatcher, fixed, paired.
- **`pinned-prompt-clock`** (prompt-assembly). The source is the reference realization; a
  fleet tree has the latent trap and the tail-section control.
- **Amendment to `durable-store-failure-posture`**: the long-window instance, with a live
  fleet read-modify-write fixed and paired.

Sixteen applications: ten against the source tree (five contrast findings among them) and
six against fleet trees.

## Applied (Phase 7.5)

| Technique | Project | Mode | Verdict |
| --- | --- | --- | --- |
| whole-prompt-denominator | tracklight | code | better (extractors 24 to 3572; cost -46.5% to 0%) |
| whole-prompt-denominator | ascent | code | better (mirror 48.0% to 89.7% of the meter; the rest is the write premium) |
| diff-from-the-recorded-base | pof | code | better (S1 0 of 2 to 2; S2 2 of 3 to 3) |
| durable-store-failure-posture | pof | code | better (1, 2, 1 lines lost to 0) |
| filter-at-the-id-door | personas | simulation | unmeasurable (already applied; doctrine lane unchecked) |
| pinned-prompt-clock | personas | simulation | unmeasurable (latent; no template uses the variable) |

**Seams were chosen to falsify.** The tracklight seam could have failed if a server-side
ingest normalised `input`; a search of the ingest crates found none. The pof memory-cap
seam could have shown no loss if the script's read and write were adjacent; a preload that
appends between them showed the loss, and a first proof of the fix returned identical
results for both arms because the preload had crashed on a wrong import, so the arms were
re-run before any number was reported.

## Leads

- **Reversible consolidation with an undo gated on identical state (6).** Return: an
  arm on the memory-year harness that stages a rewrite, keeps a before-image and injects a
  mid-pass ingest; the lane says a mechanism is an arm before it is a technique.
- **A counterfactual saving assumes the baseline used the same tokens (7).** The tree's
  "saved" figure is actual tokens repriced at a baseline model (a run gave cost 2 against
  baseline 90 on identical tokens). Return: a second source, or a paired run that
  measures the token delta.
- **Untriaged, anchors kept.** Dormant-until-signal (`src/always-on/runtime/DiscoveryGates.ts:21 "first failing gate wins"`;
  `src/always-on/runtime/SignalWatcher.ts:21 "prevent self-excitation"`), emergency truncation not persisted
  (`src/agent/loop/AgentLoop.ts:2275 "if (!input.onCompactPersisted || !compact.result) {"`), block identity across live and durable copies
  (`docs/architecture/session-timeline.md:65 "There is deliberately no client reconstruction of a provider response from its"`), and a sticky orchestrating flag whose
  whitelist is dead code (`src/router/config/schema.ts:145 "tool whitelist enforced by router"`). Nobody verified these.
- **Other defects worth the owner's attention, not the corpus'.** The always-on lock has no
  stale handling and there is no timeout anywhere under the always-on tree (a crash between
  acquire and release blocks every later fire; read, not executed by the director); the
  lease gates have no writer; a mid-turn crash drops the tool call. The tree's authors are
  not a fleet project, so none of these was reported upstream.

## Directions not proposed

`directions=0/0`. The fleet map was stale when read (`--check` exited 1) and regenerating it
rewrites tracked files beside a live sibling, so it was not rebuilt. The seven fleet changes
above are coverage at seams the projects already have; none creates a capability a
project's scope does not name. One earlier proposal is still waiting in tracklight (a batch
budget enforced against a ceiling the wire does not send) was put to the operator at the
end of the run, **accepted**, and executed in the same session on a worktree branch: option A,
gate green (runner 204, engine 215, re-run by the director), merged as `73f571f`, not pushed.
See the applied ledger.

## Instruments and incidents

- The run's board claim held throughout; one sibling (`dp-ppf-0929`) was live and held none
  of this run's subjects. `check-bundles` is red on one recruiting application filename this
  run did not touch; it was reported, not fixed.
- **A near-loss, kept for the ledger:** two applications were written over tracked files of
  the same name for other trees ("updated", not "created"); both were restored from `HEAD`
  before any commit and re-filed as second-tree documents (`--pilotdeck`).
- The clone lives at a short path and is deleted by name at Phase 9.
