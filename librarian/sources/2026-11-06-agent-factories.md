---
source: batch
kind: batch
url: "github:leodearden/dark-factory @ 5e61becd, github:vtmocanu/uzi @ 1fca12dd, github:Phixsura/attune @ ea94450b"
title: "Agent factories, /shift batch of 3 repositories from 3 authors"
author: "3 authors: leodearden; Vlad Mocanu (vtmocanu); Phixsura"
words: 3461000
extracted: 41
accepted: 4
declined: 0
leads: 10
already_covered: 10
untriaged: 17
dispatched: 0
applied: 4
shipped: 0
run_id: shift-factories
siblings: 1
fetches: 3
rescan_when: "dark-factory: an upstream release that classifies a reference-hook refusal in its merge worker; uzi: its run-custody and recovery ADR family is read, or ADR 0216 leaves Proposed; attune: a budget or spend check gains a production caller; or 8 weeks elapse (2027-01-01)"
---

# Agent factories, mined under /shift, 2026-11-06

Plan `plan-repos-20261106`, cluster `agent-factories`, no plan-level homes, so the miners and this
lander mapped them. Repository method, Phases 2b and 2d. Phase 7.7: gate=skipped (unattended shift);
nothing was asked. Three reports, three authors. D = dark-factory, U = uzi, A = attune. Rows below
carry the letter.

**Licences.** dark-factory is AGPL-3.0: nothing here or in the landed documents reproduces its code.
Its design is recorded in our own words, line references name where it was read, and every probe was
written from scratch. uzi is MIT. attune is Apache-2.0.

**Voice counting.** attune is a customer-feedback product built with agents. Its miner says it is not
an agent factory, and the code agrees, so **it counts for nothing as factory evidence**. Its one
landing is about alerting and stands on its own run. That leaves two factory voices, and neither row
that needed them earned convergence from attune.

**Expected yield,** from the miners: a design record, one to three techniques, many catches. Miners
accepted 8, all at threshold. Four survived. All four were re-measured by the lander, because every
one rested on a miner's throwaway probe, a miner's simulation or a record's own numbers.

**Coverage.** dark-factory about 318,000 words, uzi about 2.6 million, attune about 543,000. Miners
read about 2 to 6 % of those. Untriaged is not declined. The routing counts are floors.

## Triage

Upper-layer rows ran under Phase 5, G/R/C. Leads and currency ran under the corroboration table. Rows
not admitted keep the miner's score unless the promotion read changed it.

| # | Candidate | Anchor | Voices | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|
| D1 | Gate the line's move, not the commit | `hooks/reference-transaction:4-8` | 1 + git's own docs + re-run | technique, Phase 5 | real gap | 2/0/2 | **accept, `gate-the-line-move`** |
| D2+U3 | A pipe cannot carry a verdict, in either mode | `agents/pipeline_status_guidance.py`; `AGENTS.md:225` | 2 independent | amendment, Phase 5 | real gap, cause now traced | 2/0/1 | **accept, `gate-liveness`** |
| D3+U4 | A wait on a sibling is a resource | `lock_table.py:127-135`; `merge.sh:407` | 2 sources about locks, 0 about lockless waits | amendment, Phase 5 | partial | 1/0/1, was 2/0/1 | untriaged, convergence struck. See below |
| D4 | Frozen verify frontier with a speculative suffix | `ARCHITECTURE.md:803-811` | 1 | design | real gap, unread | n/a | untriaged, E4 proposal 1 |
| D5 | Rebase clearance by a named reason | `merge_lane/reverify_gate_decision.py:33-55` | 1 | design | real gap, headers only | n/a | untriaged, E4 proposal 1 |
| D6+U15 | Every hold has an owner and a bound | `docs/legibility/design-invariants.md:127-171` | 2, code not read | design | partial | 2/2/2 | untriaged |
| D7 | Ladder an agent cannot self-climb | `ARCHITECTURE.md:906-938` | 1 | design | partial | 2/3/2 | untriaged |
| D8 | Undeclared landings rose to a quarter | `docs/landed-scope-diff.md:44-45` | 1 | lead, table | their number | n/a | lead |
| D9+U5 | One entry per file for ledgers | `split_merge_lane_ratchet_ledger.py:2`; `adr/2957-changelog-fragments.md:16-17` | 2 | application | catch | n/a | covered: `per-contributor-aggregation`. Proposal 4 |
| D10 | Done needs provenance and a capability check | `ARCHITECTURE.md:392-395` | 1 | design | not opened | n/a | untriaged |
| D11 | Pressure admission keeps a progress floor | `docs/prds/dispatch-admission-load-cap.md:55-58` | 1, opposite to /shift | lead, table | discriminator below | n/a | lead |
| U1 | Cap predicate only on the locked row | `adr/0106-revise-cap-atomicity.md:32-33` | 1 + vendor docs + re-run | technique, Phase 5 | real gap, source overstates | 2/0/2 | **accept, `cap-predicate-on-the-locked-row`** |
| U2 | Off-task finding lane | `adr/0333-incidental-findings.md:13-69` | 1, no usage data | technique, Phase 5 | real gap | 2/1/2 | untriaged, home contested. See below |
| U6 | Permit on the exact head | `adr/1225-structural-completion-interlock-invariants.md:14-50` | 1 | design | catch | n/a | covered: `evidence-binds-to-the-measured-change`. Proposal 3 |
| U7 | Keep a protocol clause out of the override vocabulary | same, `:38` | 1 | design | unknown | 1/2/1 | untriaged |
| U8 | Unbound approve dies, unbound reject lives | `adr/1795-gate-revision-bound-verdicts.md:188-192` | 1 | correction | boundary | 1/1/1 | untriaged |
| U9 | Three identical attempts escalate | `docs/run-completion-hold.md:57-59` | 1 | lead, table | thin | n/a | lead |
| U10 | Unattended admission as an exclusion list | `.agents/skills/issue-triage/references/on-deck.md:12` | 1 | lead, table | thin | n/a | lead |
| U11 | Filter eligibility before the scan window | `adr/1543-sweep-eligibility-in-sql.md:20-25` | 1 | lead, table | thin | n/a | lead |
| U12 | An enforceable call bound decided a gate's fate | `adr/1225-structural-completion-interlock-invariants.md:532` | 1 | currency, table | dated 2026-10-23 | n/a | lead: home not opened |
| U13 | Other family gates the plan, advises on code | `docs/cross-check.md:14-16` | 1 | lead, table | asymmetry unexplained | n/a | lead |
| U14 | Canary before trusting a silent gate | `docs/security-gate.md:48-53` | 1 | catch | catch | n/a | covered: `gate-liveness` |
| A1 | Count spike rule, and the price of its guard | `internal/service/anomaly/detector.go:73-99` | 1, re-run | technique, Phase 5 | real gap | 2/0/2 | **accept, `count-spike-rule`, with a boundary the seam found** |
| A2 | A rule over a model's label moves policy, not judgment | `internal/service/enrich/enricher.go:230-234`, `:305-307` | 1 | amendment, Phase 5 | partial | 1/0/1, was 2/0/1 | untriaged, convergence struck. See below |
| A3 | A queue with no work in it | `internal/service/enrich/queue.go:59-69`, `runner.go:192-200` | 1 | technique, Phase 5 | core is a catch | 1/1/2, was 2/0/2 | untriaged; recovery rate is a lead. See below |
| A4 | A settable ceiling with no reader | `internal/service/apikey/apikey.go:561-562` | 1 | correction | partial | 1/0/1 | untriaged |
| A5 | Self-report may gate optional spend | `internal/repo/replydraft/task.go:47-50` | 1 | correction | prose | 1/2/1 | untriaged |
| A6 | Unknown resolves toward silence | `internal/service/enrich/enricher.go:305-307` | 1 | correction | reasoned | 1/1/2 | untriaged |
| A7 | Cluster failures on the failure-time config | `docs/proposals/2026/06/2026-06-30-terminal-failure-workbench.md:96` | 1 | correction | proposal only | 1/2/1 | untriaged |
| A8 | Self-report stripped at the outbound edge | `internal/service/enrich/enricher_outbox.go:392-401` | 1 | catch | catch | n/a | covered: `self-reported-confidence-is-not-a-measurement` |
| A9 | Unpriced model recorded as zero | `docs/proposals/2026/06/2026-06-11-llm-confidence-cost.md:138-140` | 1 | catch | specimen | n/a | covered: `nullable-cost-never-zero` |
| A10 | Three thresholds on one uncalibrated scale | `internal/handlers/console/feedback/classification_quality.go:283` | 1 | catch | catch | n/a | covered: `compare-gates-at-matched-coverage` |
| A11 | Cancelled before the call is not a failure | `internal/service/enrich/enricher.go:337-338` | 1 | catch | catch | n/a | covered: `unattempted-is-not-failed` |
| A12 | Length rule dropped short reports in one script | `CHANGELOG.md:4832-4835` | 1 | lead, table | no home opened | n/a | lead |
| A13 | Review events feed only a count | `internal/repo/feedback/classification_review.go:185` | 1 | lead, table | thin | n/a | lead |
| A14 | A proposal records its refuted claims | `docs/proposals/2026/06/2026-06-13-enricher-reply-draft.md:33-34` | 1 | lead, table | unchecked | n/a | lead |
| A15 | Alert lifecycle with a retracted state | `docs/anomaly-detection.md:46` | 1 | design | not opened | n/a | untriaged |

Admission: auto=4/17/1, fp=4. The escalation is the E4 forge proposal. Rows U3 and U4 merged into D2 and
D3, and they are counted under `already_covered` in the frontmatter so the 41 extracted rows add up.

## What the promotion read found

**The incident's cause was in the transcript.** Both miners reported that they could not establish why a
lander committed past a red gate, and one offered a PowerShell hypothesis. The command is on record:
Git Bash, the full gate piped to a last-lines reader and a first-line reader, then a separator, then
more statements ending in the commit. The hypothesis was wrong about the shell, and the operator's
account of a pipe is right. **A pipe was half the defect.** The separator would have committed anyway,
so fixing only the pipe does not fix it. That is why the amendment adds a bullet for separators, which
no miner proposed.

**The miner's seam search on D2 was misleading.** It grepped documents for piped gates and found none.
The transcripts show 17 of 25 distinct full-gate strings through a reader, 1 of them reading a status.
Two runs also filtered out `could-not-run` lines. The instruction is clean and the practice is not.

**D2: the source's sentence is half right.** "Strict mode is not the fix" holds for the false red. Its
exact measurement, a producer exiting 64 turned into 141, did not reproduce here, with either a subshell
or a runtime producer. The bare native producer did return 141.

**U1: the record overstates its rule, and the read limits it.** "May reference only columns of the row the
statement locks" reads as universal. A lock taken as its own statement, with the count in a later
statement, held 0 of 25, because a later statement takes a new snapshot. That is the form
`concurrent-admission-integrity` prescribes in another bundle, so the two do not conflict, and the
landed text says what separates them. Six forms measured on a real server; the record's numbers
reproduced for the four it measured.

**A1: the seam falsified the arm, and that became the most useful line.** Pre-declared replacement of a
daily cost rule: target hit, floor failed, 92 false alerts a year against 26 on a series idle half its
days. The same blind spot exists in the source's count rule, at 36 % of ordinary active days. Neither
the source's document nor the miner tried such a series. Verdict `not-better`, and the technique carries
the boundary.

**D1: a probe's gaps, filled.** The miner did not test rebase or measure cost. A refused rebase is left
half done on a detached head. The hook spawned about ten times a cycle and cost 1.7 s a cycle here. Added
routes: cherry-pick, reset, forced branch update, fetch into the branch.

**D3: the convergence was not real.** dark-factory's order is over reservation records and uzi's refusal
is a lock. Both have holders. Neither speaks to a wait with no record, which is the claim, and that rests
on one incident here. The lock half is a catch: `sub-file-claim-scope` already says all-or-nothing in one
canonical order, and `shared-resource-arbitration` already says surface a stall. So G falls to 1 and the
row misses at 1/0/1. Banked wording: "A wait on a sibling's outcome is a contended resource even when no
lock exists. Ask first whether it is needed, since work carried by whoever is ready removes it." Return: a
second incident with no lock in it. The live fix is already in the lander brief.

**U2: contested home, one voice.** The code matches the record: separate tool server, no path to turn-ending,
evidence and disposition tables, the digest rule. But it sits between `fleet-orchestration` and
`codebase-scanning`, half of it restates `finding-lifecycle`, and no usage data was read. 2/1/2, net 1.
Banked wording is in the miner's report, reproduced here in brief: a working tool that records and returns,
built apart from anything scanned for stop signals, with no tracker credential. Return: a second tree, or
usage counts showing filed findings get acted on.

**A2: already nearly there, and attune cannot vote.** The code confirms the mechanism: the model picks
labels, a rule derives urgency, and a label filtered out reads as not urgent. But its convergence rested on
the two factories, about a different thing: their recomputation reads evidence outside the model. Struck,
so 1/0/1. And the home's own property, reproducible, already excludes a model's label from backbone grade.
Banked wording: "A rule over a model's label moves the policy, not the judgment." The vocabulary-filter
half belongs with A6. Return: a fleet project claiming computed status for a model-rated input.

**A3: the core is a catch the miner's map missed.** `change-tracking-and-cursors` says "the durable record is
the truth; every faster signal is only an accelerator" and "a missed wake costs latency, not data", with a
tick beneath. Its home is a different subject, and the claim is the same. What is left is one sentence:
under overflow the backlog drains at the sweep's batch over its interval, whatever the worker count. That is
inferred from defaults in the code (10 rows per 30 s) and not measured. 1/1/2. Lead. Return: a measured burst
on a tree of this shape, or `personas` reading whether anything reconciles a dropped change event.

## Where the voices chose opposite defaults

Factory voices only. attune's rows are context.

| Question | D | U | Discriminator |
|---|---|---|---|
| Who may move main? | A worker, unattended | The product's bot may not; the author's own lander may | Is there a human reviewer per change? It follows whose code it is, not the author's belief |
| What tree is verified? | A frozen tip, before the move | The exact PR head, then main's CI watched | Is red main survivable? Yes when one lander can repair and PRs are few, no when 24 tasks rebase onto it |
| Where do full gates run? | Inside the worker | Remote CI | Is there a remote gate at all? We have none on the commit path, so this does not transfer |
| Concurrency | 24 tasks | 1 run per worker | Is CPU contention already a measured flake source? |
| Under saturation | Floor of one in flight | Not compared | Is the load yours to shed, or someone else's to protect? /shift goes to 0 because the video job owns the box |
| Stop on a question? | A ladder up to a human | Proceed, except a structural hold | Is the question ordinary, or a claim of completion? |
| Shared ledger shape | One file per entry, computed merge | One file per entry, independent oracle | Not opposite. Convergence, and /shift is the exception |

Both authors isolate each writer in its own tree. A gate on our shared checkout sees the union of siblings'
files, which limits D1 here. The commit door's pinned tree removes that for a landing.

## Design record, in our words

Recorded here rather than as applications against each source. Phase 7 asks for one application per entry
with a named subject. **That was not done, and this is the reason:** most entries were read at headers or
prose only, so an application's `verified_on` would claim more than was checked. Landed rows have theirs.

Labels are the triage rows above.

- **D4, frontier.** Requests wait in a reorderable queue, then an immutable prefix. Verification runs against
  that prefix's frozen tip, and the next request merges against the previous one's speculative result.
  Buys a verdict about a fixed tree and throughput not bound by suite time. Corpus: none. `integration-door`
  serialises.
- **D1, ref-move audit.** Landed.
- **D5, rebase clearance.** After a rebase a tree may skip re-verification only as byte-identical or disjoint from
  trusted drift, and the reason is recorded before any re-verify. Corpus: none.
- **D3, ordered waits.** Reservation owners share one total key, so a wait can only point at a smaller key, and
  the wait graph has no cycle. It answered a real 31-hour stall. Corpus: `sub-file-claim-scope`.
- **D6, holds.** Each hold names who will exit it and carries a bound; a status implying ownership needs a live
  claimant. Measured there at 13-52 h strands. Corpus: partial.
- **D7, ladder.** Steward, automated triage, human. An agent cannot file at the human rung, and role checks do not
  trust a caller-supplied role. Corpus: partial.
- **U6, permit.** The server recomputes completion and mints a permit on the exact head; a report with no permit
  changes nothing. Its semantic audit was built and left dormant, and the record says so.
- **U, guarded landing.** Typed refusals and a lock that refuses with the holder's name and never blocks. No cycle
  check on `--depends-on` was found in the four scripts grepped.
- **U8, verdict binding; U1, cap; U2, findings lane; U10, exclusion list.** See rows.
- **attune.** Confidence is stored and shown and never routes; urgency comes by rule over labels (A2); a wake queue
  over durable rows (A3); classification and follow-ups commit together and fail apart; terminal failure is a
  derived condition (A7); the spike rule (A1); quality as proxy signals, never accuracy.

Routing: dark-factory's landing lane has 3 `corpus: NONE` with a home, so it is a triple inside `concurrent-vcs`,
not a forge, and D1 has now landed elsewhere. uzi 2 NONE, attune 2 NONE. No home reaches 3.

**Stated controls that do not run,** observed in two trees and not counted as convergence: a README's
auto-revert not found in the parts searched (D), and a shipped spend limit whose action is discarded with
no production reader (A).

## Phase 7.5

| Landing | Mode | Verdict | Target and floor |
|---|---|---|---|
| `gate-the-line-move` | experiment, scratch repo | unmeasurable | Routes past the check: 11 of 12 to 1 of 12. Floor held. Toy hook, so no project reading. Instrument named |
| `gate-liveness` | experiment plus transcript replay | better | Failing status read: 0 to 64. No false red from the file form |
| `cap-predicate-on-the-locked-row` | experiment, own schema | unmeasurable | Over cap 25/25 to 0/25. Sequential control held. No project has the shape |
| `count-spike-rule` | experiment, synthetic series | not-better | 3x after flat 0 to 100 %. Floor failed on idle series, 92 against 26 |

The PostgreSQL 17.6 used is a binary already on this box from another project's dev directory. It was
run read-only against a new data directory in scratch, on a private port, then stopped, and the data
directory was deleted. No proof needed a GPU, and no project changed. `simulation` substituted for nothing,
and nothing here is render-bound.

## Held rows

None. Every proof that could run did run here on CPU. The personas A/B on real spend data needs the owner's
data, and the worktree experiment in proposal 3 is for whoever owns the commit door, so neither is a row
that could run unattended.

## Proposals, not landed

1. **E4: a scoped `/forge` of the landing lane in dark-factory,** with D4 frontier and D5 clearance as the
   scout's brief. The unread merge worker and gates are what would justify it. AGPL: design only.
2. **personas seam, daily cost anomaly.** Not as written: its arm failed its floor. The product first decides
   what an idle day means. Separately, a flat series that jumps never reports today, and the zero-deviation
   skip is a small fix on its own. Also read whether dropped change events are reconciled (A3).
3. **/shift, read by the supervisor, whose rework this run did not touch.** `scripts/shift-land.mjs` landed while
   this run was open and covers P1, P7's intent and P8: a pinned tree, a child's status, fragments. This run
   landed through it. It does not cover the transcript habit outside a landing, and its header says it fires no
   reference hook by design. Still open: a wait that is not a named lock is not allowed (P6); fence on a taken-over seat (P10); name the reader of
   each stated bound (P11). P3, P4 and P9 were not checked against the door by this run, so read them against
   its header first.
4. **One file per entry for shared ledgers (P5).** Two outside authors, three of our techniques, and the
   deadlock's cause. Operator decision: large, and `ledger-read` and the query server read these files.
5. **/dowser scan-score.** Name the model-rated input where the number shows (A2). `/dowser` lands only through
   its own door. Proposal only.
6. **bp reference hook.** The plainest gap in the fleet, and the 11-18 deadline makes it a bad time. Not before.
7. **Admission threshold.** fp=4 here, on top of fp=2 in earlier runs today. The method says three across runs
   raises it to +3. The method owner should read these rows: three of the four deaths are struck convergence
   or a home a slug map missed, so better prior-art reads may answer it better than a higher bar.
8. **`source-classes.md`.** Three miners found no class for a first-party system with its engine in the tree.
9. **uzi run-custody family** (`docs/run-recovery.md`, ADRs 1296, 1751, 2445, 1810, 2921, 2943): a scoped read
   before anyone decides that tree stays in intake.

No law, direction, XL row or taxonomy change was made.

## Leads: return conditions

- **D8:** a second tree measuring undeclared landings over time.
- **D11:** the first /shift pressure event where a floor of one would have changed the outcome.
- **U9, U10, U11, U13:** a second independent voice, or a fleet incident of the shape.
- **U12:** `agent-run-budgeting` opened, and the credential claim re-checked after 2026-10-23.
- **A3 recovery rate:** above.
- **A12, A13, A14:** a consumer in the fleet with short-script input, a review ledger, or a proposal process.

## Could not verify, and what was not done

- Nothing in any clone was executed. Clones were partial, read by `git show`, and deleted by name.
- Most of all three trees. Numbers quoted from their documents are theirs, except where re-run above.
- The count and money figures are synthetic. No real traffic or spend was read.
- Other database engines for U1. The re-measurement covers one version of one server.
- Whether the hook figure holds off this platform, and any reference hook inside a real mover.
- The transcript counts are distinct command strings, some differing only by a leading directory change. They
  cover this machine only, and a command's failure status was not read from each.
- The board claim stays with the director. The queue and the /shift skill were not edited.
