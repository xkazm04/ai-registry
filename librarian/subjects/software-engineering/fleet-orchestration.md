---
domain: software-engineering
subject: fleet-orchestration
last_touched: 2026-09-09
touched_by: intake
dry_streak: 0
---

# fleet-orchestration

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from a practitioner codebase

Gained two techniques (6 -> 8) and an application from
[[../../sources/2026-08-22-onecli-repo]]: `outbound-compute-plane` (the
executor plane dials out; single-use bootstrap tokens; the store's one door)
and `substrate-reconciliation` (deletion reaches compute by convergence; the
fence stack), plus `node--substrate-reconciliation` verified against the
public tree @ ff7a192. Both were missing *stages*: the GP owned the registry
and never said how the compute connects or how the substrate is kept aligned.

### 2026-08-27 - `/intake`, boundary only (no content change)

Run 29 ([[../../sources/2026-08-27-herdr]]) proposed a session-lifecycle
technique and this subject won the contest for the state machine — correctly.
`lifecycle-signals` already owns the tiers, the sweeper, the door and the
precedence rules, and the finding would have duplicated it.

What landed instead, in `terminal-multiplexing`, is the **supplier** for the
case `lifecycle-signals` does not cover: the occupant emits no hooks and no
event stream, so the only channel is the screen it paints. `lifecycle-signals`
ranks raw output as its weakest evidence ("a hung process can animate
forever") and stops there; the new `occupant-state-detection` is how that
weakest channel is made good enough to hand to this subject's door — ranked
sub-channels inside the screen, a buffer the user cannot scroll, and an
explicit unclassifiable state that no caller may read as completion.

The discriminator, stated the same way on both sides: **does the occupant
announce its own transitions?** Yes → tier one here. No → the terminal
subject classifies and reports in, and everything this subject says about
arbitration applies unchanged. See [[terminal-multiplexing]].

Nothing in this subject needed editing. Recorded so a later run recognises the
seam instead of re-litigating it.

## Open leads

- The boundary between substrate-reconciliation's inward direction and
  job-coordination/terminal-state-recovery's boot sweep is stated on both
  sides; if either subject is next swept, confirm it reads as one seam.

## Declines

None.

## 2026-08-25 - /intake run 10 ([[2026-08-25-19-claude-code-mistakes]])

- New technique `brief-carries-the-session` (what a fresh worker does and does not inherit; primary: the harness's subagent reference). Registered in the golden path. `agent-chaining/handoff-payload-contracts` is the chain-side sibling; boundary stated in the source note, not linked.
- New application `rust--brief-carries-the-session`: three worker classes in one companion tree, each carrying the session a different way (restated invariants with a pinning test; records injected into a sessionless call; context-map pointers). Negative finding: no brief tells the worker what it cannot see.

## 2026-08-25 - /intake run 12 ([[2026-08-25-awesome-graph-engineering]])

- New technique `coordination-failure-triage` from the MAST corpus (1,600+ traces): classify against the three-class taxonomy before redesigning; specification+verification ~63% of failures; the measured interventions are briefs and gates. Independent convergence with runs 10/11.
- Lead banked in the source note: transactional tool use / compensation has no owner in the corpus.

## 2026-08-25 - /intake run 14 ([[2026-08-25-agentic-dev-paper-batch]])

- New technique `worker-trajectory-anatomy` (1,794-trajectory corpus + 20,574-session corpus): decisive error at step 7, signal at 16, fabrication concentrated after lock-in; step-denominated recovery budgets, artifact-grounded completion checks, supervisor gets the brief. The member-level companion to coordination-failure-triage.

## 2026-08-25 - /intake run 15 ([[2026-08-25-karpathy-coding-file]])

- `worker-trajectory-anatomy` now closes on law 13 `silent-state-is-ungoverned`: the error-to-signal gap IS unsurfaced state; every remedy is a conversion of it.

## 2026-08-26 - /intake run 24 ([[2026-08-26-dhh-lex-fridman]])

- Golden path gained "The operator's medium is chosen, and chat is the wrong default": chat's synchronous framing couples the one human to the fleet's latency and turns them into a polling loop; the matching medium is the work item in, the batched decision surface out. Decision mechanics deferred to `hitl-approval/review-queues`; what the fleet owns is being drivable through such a surface, with interactive attachment as an opt-in mode. Convergent with the drive-medium rule already in the path (watching is a mode).
- `heterogeneous-model-panels` gained "The produce-review pair": the two-seat sequential form that buys cross-family decorrelation for routine generation, which the panel rule explicitly excludes. Reviewer family fixed by policy (per-run convenience decays to the producer's family); stacking reviewers pays only while differently sourced; pair verdicts are review findings, never concordance evidence. Corroborated corpus-internally against `judgment-guardbands`' correlated-judges failure mode - zero fetches.


## 2026-08-30 - intake, operator-control-plane

`brief-carries-the-session` gained the case it did not cover, found by the
**asymmetry hunt** rather than by the source.

The subject modelled reviewer independence on **one axis only**:
`heterogeneous-model-panels` decorrelates the review seat by model family and
fixes the routing constraint at "producer's family != reviewer's family", with
three rules and a cross-link. Meanwhile `brief-carries-the-session` treats a
fuller brief as monotonically better, mentions bias exactly once, and that
mention is about whether to *fork*, not about what the brief *contains*. Two
files both "cover" reviewer independence; only one of them models it, and the
one that models it models a different channel.

So there are two decorrelation channels - provenance and content - closed by two
different mechanisms, and only one had been built. A different-family reviewer
handed the producer's own argument is independent in the way that no longer
matters. The load-bearing sentence: the identical content is a head start for a
continuation worker and a thumb on the scale for a reviewer, so the brief is
scoped by the receiver's **role**, not by content type.

Boundary written on both sides: a fourth rule in `heterogeneous-model-panels`
points back, per the rule that two techniques describing one boundary from
opposite sides say so rather than duplicating.

Owed: no A/B was run. The return condition is a review dispatch run twice
against one artifact, one arm carrying the producer narrative and one
withholding it, reading whether the verdicts differ.

## 2026-08-31 — intake, `github:cline/cline` @ `48d6385`

Gained `absent-status-passthrough` + `rust--absent-status-passthrough`
(simulation, `better`). See [[../../sources/2026-08-31-cline]].

The finding is a **third producer of session state**. `lifecycle-signals`
models the session reporting itself and the sweeper inferring from silence;
both observed something. The layers in between — a transport projector, a
probe whose identity provider is down, a record persisted after the turn that
would have described it — observe nothing and are asked for a value anyway.
The sweeper is structurally blind to the result, because the mislabelled
session is alive and recently heard from, so every staleness budget passes.

`lifecycle-signals` did not cite `unknown-is-not-a-value`. The subject's
state-truth technique had never reached for the corpus's own law about
rendering unknown as definite; the new technique does, and the golden path now
names the non-observers explicitly.

Contention: `2026-08-31-voltagent-papers` claimed this subject mid-run, after
Phase 4's map came back clear. Technique file uncontended; golden-path
`techniques:` list edited under the `content` lock with a re-read inside it.

## Open leads (banked, convergence rule applies)

- An explicit endpoint is a sticky exact target — recovery must never
  substitute a discovered one. Return on a second independent sighting.
- Client surface and initiation mode as two orthogonal facts on the session
  envelope. Return when a managed project conflates them.
- Lazy identity: allocate in memory, persist on first accepted turn. Sits
  beside `session-registry`. Return when a project grows an empty-session
  problem.

## 2026-08-31 - reference-index run

Touched by [[2026-08-31-voltagent-agent-papers]]. One amendment to
`coordination-failure-triage`, which **corrects a sentence the technique publishes**:
that the label set is small enough for an agent judge to do the bulk pass with human
spot-checks.

Half true, and the failing half is the load-bearing one. Measured on a corpus of
developer-reported agent failures, the same judging agent with the same tools labelled
the observable *effect* at roughly 0.86-0.90 F1 and the *root cause* at roughly
0.45-0.57 on the same artifacts, agreeing with human annotators on 39% of held-out items
from title and body alone. What a machine reads off a failure is what it looked like;
the cause axis - the one that routes the fix - is the one it cannot read. Automate the
symptom pass, keep cause attribution human, and treat a judge-built cause distribution
as unlabelled data.

**Board note.** The subject was held by a sibling at Phase 7 when the finding was ready.
Per the operator's call the run waited rather than taking the content lock; the claim
released after one poll and the amendment landed on the file as the sibling left it.

Banked as leads rather than landed: blame attribution for a step in a failed multi-step
run (nothing here assigns it, and four near-misses each decline the job - with the
counter-refutation already in hand, since around 42% of failures are specification
defects and the brief is not a step); the unqualified "warm context is the asset" in
`hibernation-and-resume`; and the mid-run health verdict on a persistent member that is
alive, responsive, inside every guard, and getting worse.

**This subject also refuted the run's own premise.** `worker-trajectory-anatomy` is a
measured trajectory-scoring technique (1,794 annotated trajectories, 63k steps, plus an
independent 20,574-session field corpus) that wave 1 declared missing, on the strength of
a proper-noun grep that a purity-gated corpus guarantees will return empty.

## 2026-09-02 - lead placed by [[2026-09-02-1]]

- **A per-subscriber buffered-age field is a staleness signal.** The reference
  multiplexer's control protocol stamps each output block with how long it sat
  buffered before send; lifecycle-signals could consume it as one more
  observation from the weakest channel. From [[terminal-multiplexing]]; noted,
  not placed.


## 2026-09-02 - intake `deer-flow` ([[2026-09-02-deer-flow]], run intake-deer-flow-0902)

**New technique `completion-claim-verification`** - the missing stage between
dispatch and harvest. `result-harvest` settles what a member hands back and
`worker-trajectory-anatomy` says a quarter of failing workers claim completion
and the harvest must read the artifact; neither said how the parent decides
or what it says when it cannot. The technique carries three layers from a
harness that built all three: execution receipts stamped by the runtime
outside every guard, which the report must cite and the parent resolves;
decidable acceptance leaves checked in code on the parent's own instrument,
with UNVERIFIED as the verdict for everything undecidable (out-of-scope
paths, truncated evidence, unestablishable sizes, error-as-content reads);
and evidence provenance - a test run recorded in the worker's own persistent
shell proves nothing, unknown session semantics fails closed. Golden path
gained one paragraph in the harvest section and the list entry.

**Map note.** `research-map` returned a total empty for "subagent delegation";
this subject owns it under session/member/worker vocabulary. A concept term
can miss the corpus's house word as badly as a proper noun misses the purity
gate.

Applied to a fleet tree (simulation, better): its bridge parks a session
Finished on a declared done-cue and its harvest correctly refuses to
paraphrase, but nothing between the cue and Finished reads an artifact - and
the brief demands a branch, which is the cheapest decidable leaf there is.
Filed as the tree's next change; the first measurement is a query over its
existing session rows.

Untriaged here with anchors in the source note: benefit-based delegation
routing (whether to delegate at all - a stage `parallel-dispatch` does not
own) and a per-run total delegation cap beside the slot cap (repeated
legal-sized batches at planning checkpoints bypass a per-response limit).
Lead: additive stop-reason over a status enum, which sits against this
subject's closed vocabulary and is unreconciled.

## 2026-09-02 - intake `deer-flow` v2 back half ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

Source-tree application added (python, against the source's own clone at
`08b27aef`), from the v2 design record's catch: the tree realises this
subject's forces one layer up from where the corpus wrote them. The design
record and its routing count live in [[2026-09-02-deer-flow-v2-replication]];
the catch, the anchors verified against the fresh clone, and what the tree
adds to the technique are in the application document itself.

### 2026-09-04 - `/intake`, from a vendor repository (deep research agent)

Gained two techniques and one amendment from
[[../../sources/2026-09-04-open-deep-research]]:
`deliberation-as-an-elected-turn` (the dispatcher's reasoning as a no-op tool
it elects, forbidden in parallel with the action it reasons about) and
`soft-budget-under-the-hard-cap` (an enforced cap that must never fire, and a
smaller budget in the brief derived from it), plus an amendment to
`parallel-dispatch` for the requester that cannot survive the wait.

**The structural finding, worth more than either technique.** These first
mapped to `agent-chaining`, and the map was wrong for a reason that is now
worth stating in both notes. That subject opens by splitting the world in two:
an orchestrator-driven pipeline holds the whole authored graph and walks it; a
chain is event-wired and peer-to-peer with the topology implicit in standing
subscriptions. A **model-driven fan-out is neither** - the topology is decided
per turn, by a language model, and exists nowhere before that turn. It lands
here instead, and it lands cleanly, because this subject's dispatcher /
worker / brief / harvest model survives the dispatcher being a model. Every
technique here that assumed a program at the dispatch door is a candidate for
the same boundary; the amendment landed this run is the first one found.

Two applications: `rust--soft-budget-under-the-hard-cap` (a paired A/B on a
managed scraping service, shipped) and
`python--deliberation-as-an-elected-turn` against the source tree.

## Architecture review - 2026-09-09

All 27 documents were read against baseline `8c670a65`. Retain the subject and
its sixteen techniques. Correct authority, fencing, persistence and evidence
boundaries and narrow empirical claims to their actual study populations.

This decision retracts earlier inferences that model-family routing closes shared
blind spots, that a no-op tool cannot fail, that a prompt prohibition establishes
a serialization point, and that retrospective non-recovery proves impossibility.
Earlier touch logs remain historical. Application tests and model comparisons
were not rerun; their dates and maturity metadata were not refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/fleet-orchestration",
  "date": "2026-09-09",
  "baseline": "8c670a65",
  "digest": "sha256:0e311578c25093ba",
  "disposition": "clarify",
  "coverage": "All 27 owned documents read. Pinned research dispatcher, prompt and utility paths inspected, along with primary study methods/results and store/lease contracts. No model run, connected-project operation, private runtime test or substrate deletion executed. Application witness dates and prior experiment metadata are historical and unchanged.",
  "counterexamples": [
    "A partitioned executor can continue writing after its lease or heartbeat expires.",
    "A callback can notify a view before its queued persistence write becomes durable.",
    "Two concurrent wake requests can both pass a non-atomic state check.",
    "A fresh shell can execute a worker-edited fake test runner.",
    "A mixed reflection/dispatch batch can assess earlier results without a new model turn.",
    "A cap can protect a run without firing in ordinary traffic.",
    "Different model families can share an error, and the best model per question may be known only after grading.",
    "A long recovery can succeed despite exceeding the median of earlier runs."
  ],
  "sources": [
    {
      "url": "https://etcd.io/docs/v3.6/learning/api_guarantees/",
      "result": "Completed durable operations and asynchronous watches have distinct guarantees; read as a contract, not a runtime test."
    },
    {
      "url": "https://kubernetes.io/docs/concepts/architecture/leases/",
      "result": "Lease and heartbeat context consulted; this review did not test remote-worker fencing."
    },
    {
      "url": "https://arxiv.org/html/2503.13657v3",
      "result": "Taxonomy, dataset composition and intervention passages checked; examples do not prove topology-independent causality or universal gain ceilings."
    },
    {
      "url": "https://arxiv.org/html/2607.09510v1",
      "result": "Methods explicitly define unrecoverability empirically rather than as impossibility; results do not establish a live cutoff oracle."
    },
    {
      "url": "https://arxiv.org/html/2605.29442v1",
      "result": "Observed sessions and visible-pushback selection constrain inference; study not reproduced."
    },
    {
      "url": "https://arxiv.org/html/2602.01011v1",
      "result": "Benchmark expertise is defined per item; an expert comparison is not a deployed routing oracle. Study not reproduced."
    },
    {
      "url": "https://raw.githubusercontent.com/langchain-ai/open_deep_research/1b7d2e80db9faa586165c60e09096dbbfd483a64/src/open_deep_research/deep_researcher.py",
      "result": "Dispatcher processes reflection and research from one response; no separation rejection in the inspected path."
    },
    {
      "url": "https://raw.githubusercontent.com/langchain-ai/open_deep_research/1b7d2e80db9faa586165c60e09096dbbfd483a64/src/open_deep_research/prompts.py",
      "result": "Prompt requests reflection around research and forbids parallel tool use; that request is not enforced by the inspected dispatcher."
    },
    {
      "url": "https://raw.githubusercontent.com/langchain-ai/open_deep_research/1b7d2e80db9faa586165c60e09096dbbfd483a64/src/open_deep_research/utils.py",
      "result": "Reflection tool returns an acknowledgement; framework costs and failures are outside the trivial function body."
    }
  ],
  "documents": {
    "fleet-orchestration.md": {
      "disposition": "clarify",
      "reason": "Replace universal architecture and workflow claims with explicit authority, consistency, resource and acceptance contracts; retain all technique identities."
    },
    "techniques/absent-status-passthrough.md": {
      "disposition": "clarify",
      "reason": "Permit optional patches or confidence envelopes instead of requiring an unknown lifecycle member; current-state probes can detect fabricated projections."
    },
    "techniques/brief-carries-the-session.md": {
      "disposition": "clarify",
      "reason": "Replace universal inheritance and cache-cost claims with inspection of actual capabilities; preserve material constraints in independent review."
    },
    "techniques/completion-claim-verification.md": {
      "disposition": "clarify",
      "reason": "Fresh shells and absolute executable paths do not establish trusted validation; separate invocation, execution and artifact evidence, and unavailable from fabricated receipts."
    },
    "techniques/coordination-failure-triage.md": {
      "disposition": "clarify",
      "reason": "Published taxonomy classes are not causal ownership; retain uncertainty, calibrated annotation and targeted comparative interventions without universal gain ceilings."
    },
    "techniques/deliberation-as-an-elected-turn.md": {
      "disposition": "clarify",
      "reason": "Record concise decisions rather than claim hidden reasoning; a prompt is not enforced serialization and no-op tools still have costs and failure modes."
    },
    "techniques/durable-fleet-state.md": {
      "disposition": "clarify",
      "reason": "Shared callbacks do not make persistence atomic; allow store authority and group commit with a declared acknowledgement contract."
    },
    "techniques/heterogeneous-model-panels.md": {
      "disposition": "clarify",
      "reason": "Family diversity does not guarantee independent errors; remove universal zero-round and mandatory cross-family review claims; distinguish per-item oracle from deployable routing."
    },
    "techniques/hibernation-and-resume.md": {
      "disposition": "clarify",
      "reason": "Do not release exclusive resources before stopping or fencing; require durable checkpoints and atomic wake reservations; allow durable pending input."
    },
    "techniques/lifecycle-signals.md": {
      "disposition": "clarify",
      "reason": "Distinguish silence and artifact growth from proven liveness or progress; scope signal precedence and orphan actions to corroborated ownership."
    },
    "techniques/outbound-compute-plane.md": {
      "disposition": "clarify",
      "reason": "Outbound-only reduces inbound exposure but not all attack surfaces; token renewal can avoid replacement and bootstrap needs atomic exchange and expiry."
    },
    "techniques/parallel-dispatch.md": {
      "disposition": "clarify",
      "reason": "Queue by durable result delivery capability, admit partial batches only when independent, reserve identity before spawn, and preserve distinct operation occurrences."
    },
    "techniques/result-harvest.md": {
      "disposition": "clarify",
      "reason": "Separate claimed completion, schema validation and acceptance; distinguish synthesis; detect same-key result conflicts."
    },
    "techniques/session-registry.md": {
      "disposition": "clarify",
      "reason": "Require incarnation-aware observations, atomic reservations and actual termination or resource fencing before release."
    },
    "techniques/soft-budget-under-the-hard-cap.md": {
      "disposition": "clarify",
      "reason": "Unused caps remain valid backstops; separate resource stop from acceptance, counted units and cleanup reserve."
    },
    "techniques/substrate-reconciliation.md": {
      "disposition": "clarify",
      "reason": "Require confirmed deletion authority, resource incarnation and epoch awareness; grace windows and repeated sweeps alone do not prove safe convergence."
    },
    "techniques/worker-trajectory-anatomy.md": {
      "disposition": "clarify",
      "reason": "Retrospective non-recovery is not impossibility or a live kill oracle; bound recovery by task policy and measure false interruptions."
    },
    "applications/node--substrate-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Historical comments do not prove crash safety; rotation, stale inventories and reused resource identities need runtime fixtures. Source implementation not reread or executed."
    },
    "applications/python--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "Historical source-guide claims need implementation and adversarial verification; fresh shell and absolute path are insufficient trust witnesses. Source implementation not rerun."
    },
    "applications/python--deliberation-as-an-elected-turn.md": {
      "disposition": "reverify",
      "reason": "Pinned dispatcher accepts mixed reflection/research batches despite prompt prohibition; source inspected, runtime and model behavior not rerun."
    },
    "applications/react--session-registry.md": {
      "disposition": "reverify",
      "reason": "Compile-time group coverage does not establish merge enforcement; historical consumer tests not rerun."
    },
    "applications/rust--absent-status-passthrough.md": {
      "disposition": "reverify",
      "reason": "Retract inferred author intent and the claim an enum member is the only instrument; unknown-transition counts do not measure counterfactual fabrication. Private runtime not rerun."
    },
    "applications/rust--brief-carries-the-session.md": {
      "disposition": "reverify",
      "reason": "Working directory and launch flags do not establish absence of user-level/harness instructions; private discovery and worker outcomes not rerun."
    },
    "applications/rust--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "Irrelevant commits can satisfy the proposed branch leaf and valid no-change tasks may not; simulation is not measured effectiveness. Private runtime not rerun."
    },
    "applications/rust--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "Historical soft admission cap and practice observations do not prove total resource enforcement; tests not rerun."
    },
    "applications/rust--session-registry.md": {
      "disposition": "reverify",
      "reason": "Skipped unknown states can hide live claims; silence is heuristic and best-effort persistence retains its loss window. Private runtime not rerun."
    },
    "applications/rust--soft-budget-under-the-hard-cap.md": {
      "disposition": "reverify",
      "reason": "A requested maximum is not promised consumption; historical field-count test does not establish changed model behavior. Private runtime not rerun."
    }
  }
}
```
