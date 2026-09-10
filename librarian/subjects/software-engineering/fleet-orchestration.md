---
domain: software-engineering
subject: fleet-orchestration
last_touched: 2026-09-10
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

### 2026-09-10 — architecture re-review after the compression revert

All 27 documents read against baseline `44c8996585f2e5e3f36e0cb0bd1983c607cadfd7`.
The restore split this subject in two, and the split matters for reading the
record below. Seven documents — the golden path, `brief-carries-the-session`,
`completion-claim-verification`, `coordination-failure-triage`,
`deliberation-as-an-elected-turn`, `heterogeneous-model-panels` and
`worker-trajectory-anatomy` — were restored whole and are pre-review bytes. The
other nine techniques and all ten applications carry the salvaged edits.

**This entry retracts the 2026-09-09 record's blanket `clarify` on the golden
path and all sixteen techniques.** That record's document-level corrections were
written against documents that no longer exist, and on the current bytes they
are largely already landed. `durable-fleet-state` already refuses to confuse a
shared callback with an atomic commit and already permits store-authoritative
and group-commit designs with a declared acknowledgement contract.
`hibernation-and-resume` already retains capacity and exclusive access until
termination is confirmed or the old executor fenced, and already requires an
atomic incarnation reservation before spawn. `session-registry` already binds
observations to a process incarnation and already says a registry transition
alone cannot stop an external process. `substrate-reconciliation` already
requires ownership and deletion-generation rechecks at the substrate boundary
and already says a grace window does not prove safety. `parallel-dispatch`
already keys queueing on durable result delivery rather than on whether the
requester is a model. Thirteen of the seventeen are `keep`.

Four are not, and three of those are source problems I checked.

**The taxonomy shares do not match the paper.** The golden path's technique list
and `coordination-failure-triage`'s table both publish specification ~42%,
inter-agent misalignment ~37%, verification ~21%. The pinned source at
`arxiv.org/html/2503.13657v3` reports the three failure categories at roughly
44.1%, 31.4% and 23.5% of its 1,642 annotated traces. The misalignment share is
six points out, and the corpus's three numbers sum to exactly 100 where the
paper's sum to 99. Everything around them checks out precisely — 1,642 traces
across seven frameworks, a taxonomy built on 150+ expert-annotated traces,
κ=0.88 on final validation (with an LLM annotator at κ=0.77), +9.4 points from
role-specification rewriting and +15.6 from an added verification step. The
+15.6 is reported by the paper **on ProgramDev specifically**, which neither
document says. The technique's own closing warning — that a pooled distribution
is a prior and not your measurement — is the right frame; it should be applied
to the paper's own version numbering, because these shares moved between
versions and the corpus is quoting one it does not name.

**The trajectory anatomy is almost exactly right, and wrong in three places.**
Against `arxiv.org/html/2607.09510v1` I confirmed, verbatim: decisive error at
median step 7 of runs with a median of 27 steps; first observable signal near
step 16; 26% of failed trajectories fabricate success with 84% of fabrication
beginning at or after lock-in; false premises 30.7% and specification neglect
14.9%; competence gaps 32.8% and environment blockers 8.8%; 92% of successful
versus 37% of failed trajectories responding to at least one error signal;
successful recoveries converging in a median of 5 steps against 12 for failed
ones. This is unusually well-sourced work. The three defects:

- **"Lock-in follows at median step 12."** The paper's stated figures are a
  median recovery window of *one* execution step and a median of *12 steps for
  unsuccessful repair attempts*. Those are different quantities, and step 12
  appears to be the second one wearing the first one's name. If lock-in really
  lands at 12 the paper says so somewhere I did not reach; as it stands the
  sentence sits one line above "The median recovery window is one step", and
  7 + 1 is not 12.
- **"Detection recall in the study nearly doubled when the task requirements
  were supplied to the monitor."** The paper reports overall monitor recall
  rising from 18.2% on behaviour alone to 28.8% at best with requirements — a
  1.6× rise, not a doubling. The doubling is real *per category* (false
  premises 15%→32%, ignored requirements 3%→22%, capability gaps 12%→30%), and
  the per-category numbers make the argument better than the aggregate does.
  The paper also reports only 3.7–8.7% of failures flagged before lock-in,
  which is the number that most sharpens this technique's front-load-the-
  supervision rule and appears nowhere in it.
- **"~3% of problems resolved by the agent's own correction."** The companion
  field corpus (`arxiv.org/html/2605.29442v1`, 20,574 sessions across 1,639
  repositories) states that 91.49% of *visible resolutions* still require
  explicit user correction and 8.51% occur without. The ~91% matches. The ~3%
  does not correspond to any figure in the abstract, and the ~23%
  inaccurate-self-reporting share is likewise not there. Either they come from
  the body under a different denominator, in which case the denominator belongs
  in the sentence, or they are wrong.

**The panel technique rests one claim on nothing and one on an inversion.** The
martingale result — "analysis of simultaneous-revision debate shows belief in
the correct answer moves as a martingale — no expected gain beyond what the
first-round vote already held" — is a formal claim with no citation anywhere in
the subject, and it is what justifies the zero-round cap. It needs an address.
Separately, "announcing the expert moved outcomes by a few points where routing
its answer around the vote recovers the whole gap" is checked against
`arxiv.org/abs/2602.01011` (*Multi-Agent Teams Hold Experts Back*; Pappu, El,
Cao, di Nolfo, Sun, Cao, Zou), whose abstract says teams fail to match their
expert "even when explicitly told who the expert is" — no improvement, not a
few points. The abstract does confirm everything else the technique builds on
it: expert *leveraging* rather than identification is the bottleneck,
integrative compromise averages expert and non-expert views, the effect worsens
with team size and correlates negatively with performance, and losses reach
41.1%. Fix the one sentence, keep the rule.

**One document did not survive the compression, and the salvage screen missed
it.** `soft-budget-under-the-hard-cap.md` is 499 words against a ~1,100-word
median across this subject's sixteen techniques, and it is the **only** one with
zero cross-links: `grep -c '](' ` returns 0. Its own frontmatter declares three
laws — `limits-are-derived`, `failure-not-empty-success`,
`count-carries-predicate` — and the body cites none of them. It names neither
its own application (`rust--soft-budget-under-the-hard-cap`), nor
`parallel-dispatch`, whose slot cap is one of the ceilings it is telling the
reader to reconcile, nor `deliberation-as-an-elected-turn`, which the golden
path pairs it with. The salvage commit kept it on the grounds that techniques
came out at 0% net and none fell below floor; that is an aggregate, and this
document is the tail it conceals. The content that remains is correct — I am not
asking for words back, I am reporting that the subject's densest cross-linked
technique set has one node with no edges, which is a structural finding a
reader can check in one command. `durable-fleet-state` (888 words, two links,
opening on a design choice rather than on the concern) is the same shape, one
degree milder, and I keep it.

All ten applications are `reverify`. The public tree behind
`node--substrate-reconciliation` exists and is described as the document
describes it — github.com/onecli/onecli, an open-source platform for running
sandboxed agents, with an `apps/runner` component that "starts, parks and reaps
agent sandboxes" — but commit `ff7a192` was not checked out and no line was
opened. The other nine cite private or vendor trees; nothing was re-executed,
no A/B rerun, no witness date refreshed. Worth carrying forward:
`rust--session-registry` discloses a live divergence from its own technique —
wake mints a **new** registry id and deletes the old row, so the identity that
actually survives is the runtime's conversation id, not the registry key, where
`session-registry` prescribes one identity end to end. That is honestly
recorded and remains the subject's most interesting open deviation.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/fleet-orchestration",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:3385725341c62bac",
  "disposition": "clarify",
  "coverage": "All 27 owned documents read in full against the post-restore bytes, plus a structural pass over the technique set (word counts and cross-link counts per document) to locate compression damage the salvage screen's aggregates hide. Primary sources read, not executed: arxiv.org/html/2503.13657v3 (taxonomy, corpus size, kappa, category shares, intervention deltas), arxiv.org/html/2607.09510v1 (trajectory anatomy figures), arxiv.org/abs/2605.29442 (field-corpus abstract), arxiv.org/abs/2602.01011 (expert-deference abstract), and the onecli repository landing page. Not evaluated: any model run, any connected-project runtime, the onecli tree at ff7a192, the deer-flow and open_deep_research trees, every private consumer test, and every application witness date - all unchanged.",
  "counterexamples": [
    "A projector that fills in a default status for a record that carried none produces a state no turn can ever clear, because the turn that would have emitted the correction already ended - and every staleness budget passes over it.",
    "A probe whose identity provider is briefly down reads as 'process absent' and reaps a live session's slot, working directory and advertised artifacts.",
    "A worker can satisfy 'the branch named in the brief exists and is one commit ahead' with an irrelevant or empty commit, and a valid no-change review can fail the same leaf honestly.",
    "A test run in a shell the worker used all task long can be green because an earlier call in that same session shadowed the runner; only a fresh controlled session decides the leaf.",
    "A dispatcher can emit reflection and dispatch in one model response, so the reflection describes a state that has not happened and reads in the transcript exactly like an assessment that did.",
    "A cap that never fires in ordinary traffic is still a functioning backstop, so a zero cap-fired fraction is not evidence the cap is unnecessary.",
    "Two seats from different model families can share a training-era error, and a reviewer handed the producer's own argument is decorrelated by provenance and anchored by content.",
    "A resumed process that silently failed to load its stored context passes every liveness check while having lost everything the identity was preserved for.",
    "A reconciliation sweep that reads a partial substrate listing as a complete one converts a transport outage into a purge of live work.",
    "A registry wake that mints a new key and deletes the old row keeps the session alive and breaks the one-identity-end-to-end invariant the same subject prescribes."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/html/2503.13657v3",
      "result": "Established 1,642 annotated traces across 7 frameworks, a taxonomy developed on 150+ expert-analysed traces, kappa 0.88 on final validation (LLM annotator 0.77), category shares of roughly 44.1% / 31.4% / 23.5%, +9.4% task success from role-specification improvements and +15.6% from an added verification step on ProgramDev. Established that the corpus's published shares (42/37/21) do not match this version. Did not establish topology-independent causality, a universal gain ceiling, or which paper version the corpus quoted."
    },
    {
      "url": "https://arxiv.org/html/2607.09510v1",
      "result": "Confirmed exactly: decisive error at median step 7 (mean 11.92, 1,184 failed trajectories) in runs of median 27 steps; first observable failure near step 16; 26% of failed trajectories fabricate success with 84% beginning at or after lock-in; false premises 30.7%, specification neglect 14.9%, competence gaps 32.8%, environment blockers 8.8%; 92% vs 37% error-signal response; successful recoveries median 5 steps, failed 12; monitor recall 18.2% behaviour-only rising to 28.8% at best with requirements, with per-category rises of 15->32, 3->22 and 12->30; only 3.7-8.7% of failures flagged before lock-in. Did NOT establish a lock-in median of step 12 (the paper states a median recovery window of one step), did not establish the 44-80% epistemic range across model-scaffold pairings, and does not support 'recall nearly doubled' as an aggregate."
    },
    {
      "url": "https://arxiv.org/abs/2605.29442",
      "result": "Established the corpus as 20,574 coding-agent sessions across 1,639 repositories, seven recurring misalignment forms, 90.50% of incidents causing effort and trust costs rather than irreversible damage, and 91.49% of visible resolutions requiring explicit user correction against 8.51% without. Did not establish the corpus's '~3% resolved by the agent's own correction' or the '~23% inaccurate self-reporting among misaligned episodes' figures."
    },
    {
      "url": "https://arxiv.org/abs/2602.01011",
      "result": "Established the paper as 'Multi-Agent Teams Hold Experts Back' (Pappu, El, Cao, di Nolfo, Sun, Cao, Zou): self-organizing teams consistently fail to match their expert agent even when explicitly told who the expert is, with losses up to 41.1%; expert leveraging rather than identification is the bottleneck; integrative compromise averages expert and non-expert views, worsens with team size and correlates negatively with performance, while providing robustness against adversarial agents. Established that 'announcing the expert moved outcomes by a few points' is not what the abstract reports. Study not reproduced."
    },
    {
      "url": "https://github.com/onecli/onecli",
      "result": "Established the repository exists and is an open-source platform for running sandboxed agents per team member, Apache-2.0, with web, API, Rust gateway, runner and sandbox-supervisor components, the runner described as starting, parking and reaping agent sandboxes. Did not open commit ff7a192, did not confirm any cited file path or line range, and executed nothing."
    },
    {
      "source": "Structural pass over the subject's own bytes (word and cross-link counts per technique)",
      "result": "Established that soft-budget-under-the-hard-cap.md is 499 words against a ~1,100-word median for this subject's 16 techniques and carries zero cross-links where every sibling carries 1-5, while declaring three laws in frontmatter that its body never cites. Established durable-fleet-state.md as the same shape one degree milder (888 words, 2 links). Did not determine whether the missing material was ever substantive rather than ceremonial."
    }
  ],
  "documents": {
    "fleet-orchestration.md": {
      "disposition": "clarify",
      "reason": "Republishes the taxonomy shares as specification ~42% / misalignment ~37% / verification ~21% in its technique list; the pinned source reports ~44.1 / ~31.4 / ~23.5. Pin the paper version beside the numbers. Everything else - one registry one state machine, the two lifecycle tiers, hibernation as a state, collision domains, harvest as a phase, the chosen operator medium, the invariants - is sound and stays."
    },
    "techniques/absent-status-passthrough.md": {
      "disposition": "keep",
      "reason": "The sweeper-cannot-cover-this test, the three laundering points, and the salvaged section allowing an optional patch field or a confidence envelope instead of mandating an enum member are correct; unknown-does-not-authorize-reaping is already stated."
    },
    "techniques/brief-carries-the-session.md": {
      "disposition": "keep",
      "reason": "The inherited-versus-session-state inventory, the class-dependent standing-file trap, and the role-scoped split between continuation and judgment briefs - with the explicit note that the same content is a head start for one and a thumb on the scale for the other - are the subject's clearest reasoning and need no change."
    },
    "techniques/completion-claim-verification.md": {
      "disposition": "keep",
      "reason": "Three layers with receipts stamped outside every short-circuiting guard, decidable leaves checked parent-side with UNVERIFIED as the fail-closed verdict, provenance stamps from the sandbox that produced the evidence, criteria in the untrusted channel and verdicts server-owned, and an explicit statement that runner semantics are trusted. Complete."
    },
    "techniques/coordination-failure-triage.md": {
      "disposition": "clarify",
      "reason": "The class shares in the table (42/37/21) do not match the pinned source (44.1/31.4/23.5), and the +15.6 verification gain is ProgramDev-specific in the paper without being said so here. The corpus size, framework count, kappa and +9.4 all check out, as does the judge-reads-symptom-not-cause amendment and the composition-not-variance section."
    },
    "techniques/deliberation-as-an-elected-turn.md": {
      "disposition": "keep",
      "reason": "The three placements, the no-parallel-emission rule as the one thing that costs a turn, and election-rate-as-signal-never-target are internally consistent and correctly bounded against grounding-over-deliberation."
    },
    "techniques/durable-fleet-state.md": {
      "disposition": "keep",
      "reason": "Content is correct after the salvage - terminal states not lossy, group commit with per-waiter acknowledgement, mirror stores identity not handles, the four-step reconcile order, and the recovery vocabulary keeping adopted, lost-at-recovery and self-reported failure separate. Noted as the second-densest compression casualty by cross-link count; no content change requested."
    },
    "techniques/heterogeneous-model-panels.md": {
      "disposition": "clarify",
      "reason": "The martingale claim about simultaneous-revision debate carries no citation anywhere in the subject and is what justifies the zero round cap, so it needs an address. 'Announcing the expert moved outcomes by a few points' inverts the pinned study, whose abstract reports teams failing to match the expert even when told who it is. The leveraging-not-identification bottleneck, integrative compromise, the team-size effect and the 41.1% loss all check out."
    },
    "techniques/hibernation-and-resume.md": {
      "disposition": "keep",
      "reason": "Park as an ordered transition with releases deferred until termination or fencing, policy parking re-validated inside the lock, wake as identity work with an atomic incarnation reservation and a restoration check against the stored checkpoint, and a retention policy for the sleeping. Nothing outstanding."
    },
    "techniques/lifecycle-signals.md": {
      "disposition": "keep",
      "reason": "Two mandatory tiers, signals-are-observations-not-commands, total vocabulary mapping, per-workload staleness budgets with the multiplier written down, the orphan scan's corroborated-ownership requirement, and the salvaged rule that silence and artifact growth are suspicion signals rather than proof."
    },
    "techniques/outbound-compute-plane.md": {
      "disposition": "keep",
      "reason": "The itemised no-ingress payoff with its honest security caveat, the store's one door with the executor outside it, single-use bootstrap tokens with expiry, audience and ambiguous-exchange recovery, and the labelled dev relaxation. The replace-not-restart consequence is correctly scoped to a baked-in spent token rather than to all bootstrap protocols."
    },
    "techniques/parallel-dispatch.md": {
      "disposition": "keep",
      "reason": "Capacity, assignment and accounting as inseparable; the refuse-instead-of-queue rule keyed on durable delivery rather than on requester kind; the derived dispatch key with its check-then-act caution and pre-spawn reservation; collision domains with the verify-after-irreversible-act ritual and the repair-attribution-not-rewind recovery rule."
    },
    "techniques/result-harvest.md": {
      "disposition": "keep",
      "reason": "The result contract, six terminal accounts summing to the roster as a total invariant, the straggler policy with quorum and correction-event semantics, provenance preserved through the merge, and harvest keyed by run, incarnation and revision so a repeat is a no-op and a changed body is a conflict."
    },
    "techniques/session-registry.md": {
      "disposition": "keep",
      "reason": "Entry shape, the eight-state closed vocabulary with lost never merged into exited, the one transition door with its awkward cases, incarnation-bound observations, and the rule that release follows confirmed stop or fencing rather than suspicion. The prior record's corrections are already in the text."
    },
    "techniques/soft-budget-under-the-hard-cap.md": {
      "disposition": "clarify",
      "reason": "A compression survivor the salvage aggregate concealed: 499 words against a ~1,100-word median, the only technique in the subject with zero cross-links, declaring three laws in frontmatter that the body never cites, and naming neither its own application nor parallel-dispatch's slot cap nor deliberation-as-an-elected-turn. What remains is correct; what is missing is every edge to the rest of the subject."
    },
    "techniques/substrate-reconciliation.md": {
      "disposition": "keep",
      "reason": "Deletion as a registry act reaching compute by convergence, the five fences each with the failure it prevents, incarnation- and generation-aware deletion at the substrate boundary, partial teardown recorded rather than claimed as success, and the read-only reduction when the platform cascades deletes."
    },
    "techniques/worker-trajectory-anatomy.md": {
      "disposition": "clarify",
      "reason": "Three numbers do not survive the source. 'Lock-in at median step 12' conflicts with the paper's median recovery window of one step and appears to borrow the median duration of failed repair attempts; 'detection recall nearly doubled' overstates an 18.2%-to-28.8% aggregate rise that doubles only per category; and '~3% resolved by the agent's own correction' does not match the field corpus's 8.51% of visible resolutions without user intervention. Every other figure verified exactly against the pinned paper."
    },
    "applications/node--substrate-reconciliation.md": {
      "disposition": "reverify",
      "reason": "The cited public repository exists and matches its description, but commit ff7a192 was not checked out and no line range was opened. The quoted header comments remain design claims rather than crash-safety proofs, and the token-derived installation fingerprint still owes a rotation policy."
    },
    "applications/python--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "Historical source-guide observations against a pinned tree that was not reopened or executed; the fresh-shell stamp and absolute-path criterion remain necessary rather than sufficient trust witnesses, as its own boundary section says."
    },
    "applications/python--deliberation-as-an-elected-turn.md": {
      "disposition": "reverify",
      "reason": "The salvaged correction stands - the pinned dispatcher accepts reflection and research calls in one model response, so the prompt requests separation the dispatcher does not enforce. Source not reread, runtime and model behaviour not rerun, election rate still unmeasured."
    },
    "applications/react--session-registry.md": {
      "disposition": "reverify",
      "reason": "The seven-row GROUP_ORDER against an eight-member binding, and the exhaustiveness door that closes it, are a clear and useful account; compile-time coverage still does not establish merge enforcement, and neither arm was rerun."
    },
    "applications/rust--absent-status-passthrough.md": {
      "disposition": "reverify",
      "reason": "The three-case simulation and its bounded blast radius are well argued and the salvaged retraction of inferred author intent is correct; the private tree was not reopened, and a transitions-out-of-unknown counter measures departures from unknown, not counterfactual fabrications."
    },
    "applications/rust--brief-carries-the-session.md": {
      "disposition": "reverify",
      "reason": "Three worker classes carrying the session three ways, with a test pinning the restated invariants, is the technique's inventory in code; launch flags and working directory remain inputs to discovery rather than proof that no user-level or harness instruction loaded, and nothing here was rerun."
    },
    "applications/rust--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "The cue-to-Finished path with nothing reading an artifact is a sound structural finding, and the salvaged caveat that the branch leaf admits irrelevant commits and rejects valid no-change tasks is correct. The named falsifier - a query over existing session rows and branches - has still not been run."
    },
    "applications/rust--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "The declared soft-cap trade-off, the window-grouped run identity with zero explicit callers at the census date, and the summary-from-declared-text boundary are useful disclosed deviations; code, tests and counts were not rerun and the soft cap does not establish a total fleet resource bound."
    },
    "applications/rust--session-registry.md": {
      "disposition": "reverify",
      "reason": "Documents the subject's most interesting live deviation - wake mints a new registry id and deletes the old row, so the surviving durable identity is the conversation id rather than the registry key - alongside a best-effort mirror that can lose terminal transitions. Skipping unknown persisted tokens can also hide a live session's resource claims. Nothing rerun."
    },
    "applications/rust--soft-budget-under-the-hard-cap.md": {
      "disposition": "reverify",
      "reason": "The paired measurement (0 result fields naming the unreachable surplus before, 2 after, behaviour unchanged) and the output-shape contract test that rejected the first attempt are recorded honestly, and the behavioural half is explicitly unbanked. Tests were not rerun and a requested ceiling is still not a promise to spend it."
    }
  }
}
```
