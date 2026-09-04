---
source: github:earendil-works/pi
kind: repository
url: https://github.com/earendil-works/pi
title: "pi — AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI"
author: earendil-works
words: 990 landing / 325,302 in-tree markdown
commit: 92d8e2d17d4f357788381c49ce2cdb3f4ed1f21c
extracted: 11
accepted: 1
declined: 0
leads: 1
already_covered: 3
untriaged: 6
dispatched: 0
applied: 1
shipped: 0
run_id: pi-01
siblings: 3
rescan_when: "WP08 (named-branch and streaming forks) leaves in-progress status in packages/agent/docs/work-packages/08-named-branch-streaming-forks.md; or the H1 contract-closure debt in harness.md §0.9 clears (public OperationStatus \"running\" becomes observable); or per-step replay lands, which tool-durability.md:485 defers by name; or 8 weeks elapse (2026-10-30)"
---

# pi — agent toolkit (earendil-works)

**Class: first-party practitioner codebase read as a SYSTEM.** A TypeScript
monorepo whose centre is a crash-durable agent harness: an immutable entry
tree, bound typed values/lists, an append-only usage ledger, a 13-leaf
operation state machine, an effect gate, and a documented recovery procedure
for every leaf. Peer-shaped to `personas` (both orchestrate agent runs), which
is why the operator asked for the comparison.

**Priced before extraction (round 23, item 1).** The prose-to-code ratio is the
routing signal and it is extreme in the useful direction: 990 words of landing
page against **325,302 words of in-tree markdown**, including a 27,820-word
normative harness specification, ten numbered work packages that read as ADRs
with their rejected alternatives intact, and a `values.md` that specifies a
storage primitive. Forecast stated before the triage table: routing count ≥3,
a technique triple or a scoped forge, one comparison study, 2–3 directions.
**Actual: routing count 3, one technique, one source-tree application, one
lead, six untriaged.** The forecast overshot on landing volume and was right
about depth — see the scorecard row.

Swept (Phase 2b order): `packages/agent/docs/` operating documents first
(`harness.md` 27,820w, `values.md`, `tool-durability.md`,
`assistant-durability.md`, ten `work-packages/`), then the instrument
(`src/harness/runtime/drive/tools.ts`, `recovery.ts`, `reconcile.ts`), then the
conformance matrix (`harness.md` Part 9: 38 invariants, a 30-row race catalog,
three test tiers), then the types (`session/types.ts`), then the README last.
Fetch budget spent: **0 of 3** — corroboration came from the tree itself plus
training-data convergence, as the class predicts for a first-party codebase.

**Board.** 3 live siblings at claim time (`vibevoice-peer-0904`,
`sozu-rust`, `workweave-router-0904`). The router run held
`model-routing`, `prompt-assembly` and `multi-provider-gateway-plane` — all
plausible homes for pi's `packages/ai` provider layer, so this run deliberately
routed away from the provider half and mined the durability half instead. No
contention on `job-coordination`.

## Design record (Phase 2d)

Seven entries; the three that matter to the routing count are marked.

**1. Three stores, one invariant.** `corpus: PARTIAL` — `agent-memory`,
`job-coordination`.
decision: every payload lives in an entry (write-once tree), a bound
value/list (current-state-only, no history), or the usage ledger; there is no
third place.
forces: recovery must know the complete set of addresses that can hold
authority; a fourth store means reconciliation.
buys: terminal cleanup is provable — "deleting every operation-owned value and
list must leave a complete, valid conversation and ledger" (invariant 8).
rejects: a journal / event-sourced log. §1.8 is titled "Why write-once plus
values and lists".
where: `harness.md` §0.3, invariants 1–5.

**2. The durable restart point is a TOTAL state, never a journal.** `corpus:
PARTIAL` — `job-coordination/step-position-and-resumability` models position
but not totality.
decision: after every transition, replace `pi.op.state` with the complete
current state, never depending on the previous one.
forces: journal replay needs every entry idempotent and ordered; inferring
position from what is missing is ambiguous.
buys: recovery is one read. Invariant 5: "No read on a hot path may fold
history or infer state from an absent value."
rejects: WAL replay, event sourcing.
where: `harness.md` §0.3 rule 3, §3.2 (the 13-leaf union).

**3. In-flight is a position — a third durable value between pending and
complete.** `corpus: NONE` ← **landed as a technique.**
decision: commit `effect_pending` carrying the effect's identity and its
declared replay disposition *before* dispatching the effect; recovery reads the
disposition instead of inferring one.
forces: an agent's steps are model-chosen tool calls, so the job's author
cannot enumerate the effects at design time, and the far side (a shell command,
a filesystem) honours no idempotency key.
buys: at-most-once for declared-unsafe effects, with an honest unknown, and no
operator queue — recovery resumes rather than parking.
rejects: at-least-once-with-declared-idempotency, which the corpus currently
states as the only protocol.
where: `harness.md` §0.5, §3.2; `tools.ts:489-511, 496, 527`;
`tool-durability.md:368-407`.
stage: the dispatch boundary of one step.

**4. Replay disposition is re-checked across the deploy boundary.**
Folded into entry 3's technique.
decision: the safe path requires the *stored* declaration and the *currently
registered* one to both say `safe`; disagreement or a vanished tool falls to
unsafe interruption recovery. Default is `?? "never"`.
where: `tools.ts:527`, `tool-durability.md:407`.

**5. A deadline is not a correctness boundary.** `corpus: NONE` — **untriaged,
see below.**
decision: `DriveOptions.deadline` and the `yielded` outcome were *removed*.
forces: a deadline is checked only before starting another transition or
effect; an admitted provider/tool/hook runs past it and the host may kill the
process anyway, so unknown-outcome recovery stays mandatory either way.
buys: the durable core carries no wall-clock policy, and four race classes
(deadline-vs-retry-timer, deadline-vs-effect-admission, yield-vs-convenience-
loop, safe-boundary checks) cease to exist.
rejects: timeouts as a control primitive. Invariant 25 forbids re-adding one.
where: `work-packages/03-remove-drive-deadlines.md`, invariant 25.

**6. The race catalog: every durable mutation race has exactly two durable
histories.** `corpus: NONE` — **untriaged, see below.**
decision: enumerate concurrent interleavings as a normative specification
table naming both legal outcomes, and test every listed order with test-only
commit gating. ~30 rows.
forces: a durable system's concurrency is intentional, so guards do not
describe it; a race with three legal outcomes is a design defect and a race
with one is not a race.
buys: the table is consumed by tests — "tables that tests consume are part of
the contract" (§0.7).
where: `harness.md` §9.2, §9.3 Tier B (an instrumented decorator around
`Storage.commit()` asserting write *order*).

**7. The specification marks its own unimplemented parts inline.** `corpus:
PARTIAL` — nearest neighbour `quality-gates`.
decision: §0.9 lists labelled debt (J1, C1, R12, T1, S3, R11, H1, WP08), each
re-labelled at its own section, and states "Part 9 states the required
conformance matrix; it is not a claim that every listed row already has one
dedicated test."
buys: a reader can tell specification from implementation without running it.
where: `harness.md` §0.9.

**Routing count: 3** (entries 3, 5, 6 have no corpus home). The count is met,
but the three decisions **home into three different existing subjects** rather
than clustering into one new one, so neither v2.2 clause fires: no system
reaches three NONE sharing a home-if-new. **Handoff to `/forge` declined on
that basis**, not on size — this is not a "kept small" decision, it is that
there is no single subject-shaped hole here. The one row that cleared the
admission gate was landed in place.

## Triage table (Phase 5, v2.5 scored)

Expected yield stated before the table: for a first-party codebase at this
documentation density, 1–3 techniques and no currency signals.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | In-flight is a position | job-coordination | new-technique | real gap | 3/1/2 | **accept** |
| 2 | K | technique | M | A deadline is not a correctness boundary | — (gate-sees-target law) | new-technique | real gap | 2/1/2 | untriaged |
| 3 | K | technique | M | Race catalog with two legal histories | concurrency-guards | new-technique | real gap | 2/1/2 | untriaged |
| 4 | K | amendment | S | Total state, never a journal | job-coordination/step-position | corrects-claim | partial | 2/2/1 | untriaged |
| 5 | K | catch | — | Indeterminate closure on interruption | agent-runtime-assembly | none | likely catch | — | already covered |
| 6 | K | catch | — | Record precedes effect | `_laws.md` | none | likely catch | — | already covered |
| 7 | K | catch | — | Steps declare re-run safety | job-coordination/step-position | none | likely catch | — | already covered |
| 8 | K | technique | M | Synchronous admission boundary | concurrency-guards/critical-section | none | partial | 1/2/2 | untriaged |
| 9 | K | practice | S | Spec marks its own unimplemented parts | quality-gates | none | partial | 1/1/1 | untriaged |
| 10 | K | technique | L | Session/Branch/Lane four-concept split | fleet-orchestration | new-technique | partial | 2/2/3 | untriaged |
| 11 | X | lead | — | Provider-stream billing window | — | none | real gap | — | **lead** |

`auto=1/6/0`, `fp=0`.

**Why one row of eleven cleared a +2 bar.** The gate is reject-biased by
design and this run is its intended case: a single reader, a single source, and
no cross-run convergence, so RISK carries the contested-home `+1` on almost
every row and only a row that *refutes* something the corpus asserts reaches
GAIN 3. Row 1 does — `step-position-and-resumability` enumerates three repairs
for the honestly-non-idempotent step and pi's is in none of them. Rows 2 and 3
are real absences and are banked with full anchors precisely so a second
sighting promotes them cheaply; they carry no judgment.

### The promoting question, executed on every `partial` row

- **Row 4** — *does `step-position-and-resumability` forbid folding history?*
  Read: it does not discuss it; totality is assumed, not stated. Answer does
  not promote — it is a boundary case of row 1's mechanism, not a separate one.
- **Row 8** — *does `critical-section-across-a-suspension` already require the
  check and the use to be one synchronous expression?* Read: it does, from the
  check-to-use direction. Not promoted; near-catch.
- **Row 9** — *does `quality-gates` own a document declaring its own
  unimplemented rows?* Read: it owns gate honesty, not specification honesty.
  Real but S-sized and single-sighted; banked.
- **Row 10** — *does `fleet-orchestration` model the lane/branch split?* Read:
  it models sessions and their registry, not a branch-tip-plus-configuration
  split within one session. Real gap, but `L` and this run cannot afford it
  honestly against one tree. Banked with anchors.

### Catches (rows 5–7) — the corpus said it, and in two cases said it better

- **`indeterminate-closure-on-interruption`** already owns the recovery
  *status* decision in full: close unknown work as indeterminate, never as
  failure; tell the model it was not re-run; close every unresolved call before
  the terminal event. pi implements this precisely. The catch is clean, and it
  is what made row 1 findable — that technique's case analysis *presumes* a
  record that distinguishes "unstarted" from "started, outcome unknown" and
  never says what writes one.
- **`record-precedes-effect`** (law) owns intent-before-effect at the
  accountability grain. Row 1 cites it rather than competing with it.
- **`step-position-and-resumability`** already owns per-step re-run
  declarations and the four-way idempotency ladder.

## Lead

**The provider-stream billing window.** pi names one window it cannot close:
a process death mid-stream leaves a request that "may have been billed and may
or may not have produced output" (`harness.md` §0.4), and stream resumption is
an explicit non-goal (§0.6). Committed frames preserve the latest partial for
display but "never establish provider completion" (invariant 31). So a durable
agent system has a structural class of spend it cannot attribute, distinct from
the metering problems `cost-metering` models.
*Return condition:* when a second independent source states the same
unattributable-spend window, or when a provider ships a request-status endpoint
that closes it — at which point this becomes a technique in `cost-metering`
rather than a lead.

## Untriaged (nobody verified these; anchors preserved so a later run need not re-derive)

Rows 2, 3, 4, 8, 9, 10 above, each with `where:` anchors in the design record
or the triage table. Rows 2 and 3 are the two strongest and both are
single-sighted; a second repository showing either would promote it on
convergence at no fetch cost.
