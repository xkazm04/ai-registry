---
domain: software-engineering
subject: fleet-orchestration
last_touched: 2026-10-15
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

### 2026-09-17 - `/harvest backlog` wave 3, one technique

`inherited-state-provenance`, from [[2026-08-30-headlong-agent-microharness]] (subagents see ancestors' trajectories) and [[2026-08-31-agent-harness-design-decisions]] (cited for its mechanism only - its persistence statistic does not reconcile with its own tables and is recorded as refuted). The subject's `brief-carries-the-session` closed with 'That is all', and this is the case that enumeration denied: state that reaches a worker structurally rather than in text, because the dispatch placed it inside a previous attempt's artifacts. Three facts repair it - provenance, a counted state with its predicate, and a mandate (continue, read-only, replace) - each preventing one of the three reasonable misreadings (stray, finished, foreign). The reusable diagnostic is the asymmetry tell: a dispatch path with this defect usually already carries ONE handover fact into the brief, for the case somebody was burned by, while a bigger one sits only in the event log. Where you find one, check its siblings. Measured on a retry path whose resumption flag was computed, logged, and never shown to the worker: 0 of 4 resume facts in the worker's channel, 4 of 4 after, first-attempt briefs byte-identical. The enumeration in `brief-carries-the-session` now carries a pointer here.

### 2026-09-17 - `/harvest backlog` wave 4, one amendment + one application

`parallel-dispatch` gains **'The cap counts a stock; the run needs a second number'**. The subject had one number at the dispatch door and believed it was the budget. The reusable distinction: a **stock** bound counts what is alive at this instant and releases; a **total** is per run, reserved at admission, and never released. A run that reissues legal-sized batches at its own checkpoints breaches neither the cap nor a per-batch limit and spends without bound. The degenerate case is the cheapest way to see it and belongs in any review of a cap: *a loop that dispatches one worker at a time can never reach a ceiling of any size.* The part that surprised: **the overflow rule inverts.** A cap queues what it refuses; a total cannot, because the queue would hold the run's own excess and the run would never end. Deferral is the answer, and it is safe only where admitted work leaves the work list - otherwise the same prefix is re-admitted forever and every run reports a full, successful budget. The failure is usually a mis-scoped limit rather than an absent one: a window smaller than the run is reissued at every checkpoint, a window larger grants a long run and a short run the same budget. Neither is wrong as a rate and neither is a total.

### 2026-09-17 - `/harvest backlog` wave 5, one technique + one application

`evidence-outranks-a-liveness-claim`. The subject carried a stored status beside a staleness sweep and never said what happens when the two disagree. They disagree in exactly one shape, and it is the expensive one. The mechanism is worth stating on its own: **a session reports at transitions, and the long silences are the work.** So the moment its report looks oldest is the moment it is deepest in the work - and the guarded sections it needs are taken at the END of a long quiet stretch. The interval where the claim is most stale and the interval where the holder is most certainly alive and holding something are the same interval, which is why widening the budget cannot separate them. The distinction that makes it decidable: **who wrote the record and why.** A claim is a session's statement about its own condition, worth what the writer's continued existence is worth. Evidence is a record some other obligation forced into existence, so its timestamp is a fact about execution. Outstanding, terminal and suspension records are usually already lying there unread. It does not overturn the expiring lease, and the boundary is instructive: a lease buys its authority with a renewal loop on a fixed cadence (so the longest legitimate silence is the cadence, not the work's duration) and with fenced writes (so a wrong takeover is a retry, not damage). A report-driven budget has neither. **Measured against this registry's own board, and it found a live defect there** - a lock taken one second earlier handed to a sibling, and `check` calling the holder's paths clear in the same second. The rule's strong form, carry no status field at all, was armed literally and broke reclaim entirely: with no budget and no probe nothing can ever say *dead*. Removing the claim is not the rule; demoting it is.

### 2026-09-23 - `/conform --stale` on personas (14 pairs re-judged at revision 23)

9 deviation, 4 not-applicable, 1 conformant. Fixed since the old verdicts: the one state
door, a durable admission queue, grid exhaustiveness over the state union, and a monitor
that no longer defaults an unknown status to running. Still short: no declared write set
at dispatch (so no disjointness check), restart recovery that never adopts or quarantines,
a hibernation that commits before the kill is confirmed and mints a new id on wake, a
harvest that folds self-declared completions into "delivered", and a build loop whose
hard turn cap finalizes as a draft rather than as truncated. Proposals from the judges,
unplaced: (1) "read status from a runtime-owned marker, never from prose" lives only in
`completion-claim-verification`, and failed here in the lifecycle lane (an eviction
inferred from reason text) - it belongs in `lifecycle-signals` and `session-registry` too;
(2) `session-registry` should say the emit boundary carries the typed state (a string
emitter plus a consumer-side cast is the mapping layer it warns about); (3)
`result-harvest` should require an abort to move every non-terminal roster member into a
named class; (4) `lifecycle-signals`' orphan scan wants a shared-machine boundary case - a
name-based scan picks up the operator's own external sessions, and a one-click Resume that
kills without the re-check the Kill path does. **Coverage:** four contexts matched on
vocabulary, not precondition (two decision surfaces that are hitl-approval's, a learning
page, a design hub); a team-assignment orchestrator is probably `pipeline-dag` first; ten
fleet backend files belong to no context in the project's map.

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923). L285 AMEND to `parallel-dispatch`: a promoted queued entry keeps its id and a spawn never lands on a live entry. **L271 COVERED** by `concurrent-vcs/isolated-index-commits`; its private-repo application declined.

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): personas 14, personas-web 1.

## 2026-10-06 - /intake deer-flow --delta (run `intake-deer-flow-1006-v3`, cloud dispatch)

Source [[../../sources/2026-10-06-deer-flow-v3]], `08b27aef..53df22bd`. **One amendment** to `completion-claim-verification`: "That fallback may refuse a pass; it may never grant one". The technique said a shell result with no exit marker falls back to the tool's meta status, and that status is success for any call that returned text. Twice in one month the tree's own Fixed list recorded a stage after execution that dropped the marker: an output budget swapping a long result for a preview (#6354), and an audit layer appending its warning after the last line (#6307). Each time the checker fell back to success and a failed test run satisfied `tests_passed`. The tree fixed both rewriters and kept the fallback. The amendment fixes it at the checker: a lost marker is UNVERIFIED, and keeping the marker becomes a coverage property of every post-execution stage. Scored 2/0/1 as an append; the rewrite reading (3/2, untriaged) is recorded in the source note for audit. The source application was re-pinned, gained the fallback section, and had its paragraph-size figure corrected (about 1,500 words, never 4,800). The judge layer has still not landed. Unapplied (cloud session; handoff in the dispatch result).

## 2026-10-13 - inbox lead from garden-vr (2026-10-07), ruled by `/intake`

**LANDED in 795a2fef** as an amendment to `result-harvest`: "A clean exit without the result is resumed before it is classified". The lead: a one-shot headless session ends its whole run when the model ends a turn, including a turn ended to "wait for" a background process, so the process exits 0 with an empty drop point and the background job's failure goes unread. **Prior art:** `result-harvest` already classed "completion claimed, result missing" but named no recovery. `session-continuation/continuation-as-state` owns the doctrine that a prose "keep working" rule does not hold and the harness must enforce continuation with a cap. It enforces at an in-process stop hook. The lead's novel half is the out-of-process form: the runner is the only party awake after exit, the trigger is exit success AND declared artifact absent AND a captured session id, and the remedy is a same-session resume with a fixed continuation prompt, bounded (two), skipped on quota exhaustion. **Corroboration:** convergence with continuation-as-state (a different run and source reaching the bounded harness-side rule), plus the consumer tree read at garden-vr `f14a1164`: `tools/orchestrate/agent-loop.mjs:106-117` implements exactly this trigger and bound through each engine's own resume flag. The lessons ledger records three incidents across three model families (2026-10-02, 10-03 after the prose rule, 10-04). **Not measured, and said so in the text:** the rescue rate. The consumer's local `orchestration/runs/{sundial,terrarium}/loop.log` (362 lines) carry no `resuming (continuation` line, so there is no yield figure yet; step 4 of the amendment (account every continuation) is how to get one. No application written: the tree's runner is a candidate `node--result-harvest` witness once a rescue rate exists. Not A/B tested (Phase 7.5 not run in this headless dispatch).

## 2026-10-14 - intake `agentic-coding-flywheel-setup` (run dle-r1-1014, practitioner series R1)

Source note [[2026-10-14-agentic-coding-flywheel-setup]]. One new technique and two
amendments, from a design record whose E4 (code-first waves, one orchestrator closes,
self-close forbidden, verification debt capped) was PARTIAL here.

- New technique `verifier-seat-capacity`: the closer separated from the producer is a
  seat with a queue. Count debt at the seat with its oldest age; pair a cap with an
  occupancy check that escalates instead of stalling; give the verifier's own work a
  second reader; read self-grading from a verdict distribution that almost never says no.
  The source's own audit found the seat vacant, the debt cap refusing every new claim,
  and, once a verifier was appointed, 17 of 28 submitted items sent back.
- `parallel-dispatch` corrected: it said no observed door enforces the debt bound; the
  source's task-policy file is one. `completion-claim-verification` gained one paragraph.
- Application `process--verifier-seat-capacity--practitioner-swarm` (anchors at pinned
  commits; the audit's heading says ten closed where its list names eleven).
- Phase 7.5 on this registry (experiment, **unmeasurable**): an occupancy replay over the
  harvest evaluation ledger says the seat was silent 47 days while passes kept landing and
  a 7-day check would first have fired 2026-09-04; a replay cannot say whether an
  escalation would have been answered. Instrument: a live arm (backlog row
  `dle-m6-verification-debt-veto`) or a blind re-read.
- Our own self-grading, measured (`completion-claim-verification` row, experiment,
  **not-better** as a falsifier): a tier-1 re-verify of 460 self-graded `better` rows in
  `librarian/applied.md` found a gate run after the change in about 70% and falsified
  none, but only 13.5% of code passes ran a gate whose exit status could fail; 16 masked
  passes printed failures. Not landed; kept on a local branch for the series' DLE-010
  round, which builds tier 2 (re-run the named gate at the named commit).

## 2026-10-15 - intake `mcp_agent_mail_rust` (run dle-002-1015, practitioner series DLE-002)

Source note [[2026-10-15-mcp-agent-mail-rust]]. New application
`rust--evidence-outranks-a-liveness-claim--agent-mail`: a forced release refused while any
of four activity signals on the leased paths is fresh, computed for the guarded object
rather than the session; departures: a probe that cannot resolve its workspace folds into
"stale" (unknown read as dead), and expiry outranks evidence without fenced writes. Design
entry D6 (an automated coordinator on an autonomy ladder, shadow by default, policies
replayed on history before live) has no home: banked as lead L1; this category is full.

## Architecture review - 2026-10-31

Re-review against `140c101d`. Since 2026-09-10 the subject gained three techniques
(inherited-state-provenance, evidence-outranks-a-liveness-claim and
verifier-seat-capacity), a third number at the dispatch door, two harvest and
verification amendments, and five applications. All are coherent. The old record's
numeric corrections were never applied, and soft-budget still has no sibling links,
so those items are carried forward. The 2026-09-10 note that the martingale claim
'carries no citation anywhere in the subject' is still true. A primary source now
exists (arXiv 2508.17536), and its condition has to travel with the citation. The
kp application's pin no longer resolves in a clone of the public repository. No
verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/fleet-orchestration",
  "date": "2026-10-31",
  "baseline": "140c101d",
  "digest": "sha256-b2:93bd71853ab468b1",
  "disposition": "clarify",
  "coverage": "All 35 current documents decided. The 20 carried from the 2026-09-10 record (baseline 44c89965) were checked by diff, and the numeric claims that record flagged were confirmed still present by grep. Changed and new documents were read in full or in their changed sections: the golden path, brief-carries-the-session, completion-claim-verification, parallel-dispatch, result-harvest, soft-budget-under-the-hard-cap, three new techniques, five new applications, and the re-pinned python completion application. All relative links resolve. Primary sources were checked for the martingale claim and one public application. A public pin was checked against a clone. No model run and no private runtime.",
  "counterexamples": [
    "A configured concurrency ceiling of ten observed at eleven simultaneous runs is either a sampling artifact or an unenforced path. Either way, 'the ceiling engaged at ten' (golden path) and 'eleven against a limit of ten' (technique) are not the same claim.",
    "A cap that never fires is still a functioning backstop. soft-budget's 'zero cap-fired stops ... the cost ceiling it represents is imaginary' contradicts this, which the 2026-09-10 record already stated.",
    "Simultaneous-revision debate is a martingale only under the unbiased belief-update model. The same paper shows that a correction-biased update breaks it, so the zero-round rule rests on a modelling condition, not a law.",
    "A force-release guard that reads 'workspace unresolved' as 'no activity' turns an instrument that could not look into proof of death. This is the unknown-as-dead path the evidence technique forbids, observed in a public tree.",
    "A verification-debt cap with no occupancy check stopped every producer when its verifier seat emptied. A fleet with no cap went seven weeks without a verdict. Opposite policies, same outcome."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2508.17536",
      "result": "Located through search (abstract-level). 'Debate or Vote' (NeurIPS 2025) models debate as a Bayesian belief update and shows it induces a martingale over belief trajectories, so debate alone does not improve expected correctness. Majority voting accounts for most reported multi-agent-debate gains, and biasing updates toward correction can break the martingale. This supplies the citation heterogeneous-model-panels lacked, together with the condition that must travel with it. The full paper was not read."
    },
    {
      "url": "https://raw.githubusercontent.com/Dicklesworthstone/frankengit/142adb9098d5/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md",
      "result": "Confirmed 'a verification loop with nobody in it', that the debt 'had reached 36, so the tracker refuses new claims', the 'Verdicts, 28 beads' section with 10 closed and 17 rework in the summarised text, and 'No bead IcyIbis authored has been independently verified.' The application's claim that the list names eleven was not confirmed from the fetched summary."
    },
    {
      "source": "A clone of the public kp repository (HEAD e2a1b2e), read only",
      "result": "The scoringSpawnBudget derivation, the deferral warning and the 'nothing bounding the total' test comment are present at HEAD. Neither the cited commit 73672577 nor the change 05a9cb7f exists in that clone's history, so node--parallel-dispatch's pin needs re-pointing."
    },
    {
      "source": "git diff 44c89965..140c101d over the subject directory",
      "result": "The 2026-09-10 clarifies were applied to soft-budget only partly; it was rewritten but still has zero cross-links. They were not applied to the golden path, coordination-failure-triage, heterogeneous-model-panels or worker-trajectory-anatomy. All still carry the figures that record refuted (42/37/21, 'a few points', 'lock-in at median step 12', '~3%')."
    },
    {
      "source": "2026-09-10 record's arXiv checks (2503.13657v3, 2607.09510v1, 2605.29442, 2602.01011)",
      "result": "Relied on as recorded and not re-fetched. The text they refuted is unchanged, so their conclusions still apply."
    }
  ],
  "documents": {
    "fleet-orchestration.md": {
      "disposition": "clarify",
      "reason": "Still republishes the taxonomy shares as ~42/~37/~21. The pinned source reports ~44.1/~31.4/~23.5, so pin the paper version beside them. New: the supervisory-stock paragraph says the machine ceiling 'engaged at ten simultaneous runs', while parallel-dispatch and its process application report eleven against a limit of ten. Make the three agree and explain the overshoot."
    },
    "techniques/absent-status-passthrough.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/brief-carries-the-session.md": {
      "disposition": "keep",
      "reason": "The only change is a pointer to inherited-state-provenance, which closes the 'That is all' enumeration correctly."
    },
    "techniques/completion-claim-verification.md": {
      "disposition": "keep",
      "reason": "The new rule that a lost exit marker is UNVERIFIED and never the meta status is sound, and is grounded in two changelog-recorded incidents. The verifier-seat pointer is apt."
    },
    "techniques/coordination-failure-triage.md": {
      "disposition": "clarify",
      "reason": "Unchanged. Still owes the 44.1/31.4/23.5 shares and a note that the +15.6 gain is specific to ProgramDev."
    },
    "techniques/deliberation-as-an-elected-turn.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/durable-fleet-state.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/evidence-outranks-a-liveness-claim.md": {
      "disposition": "keep",
      "reason": "The claim-versus-evidence split, three-valued liveness, the lease boundary (renewal cadence plus fenced writes) and the measured refutation of its own strong form are coherent and scoped. The entry-only crash is stated as the non-goal."
    },
    "techniques/heterogeneous-model-panels.md": {
      "disposition": "clarify",
      "reason": "Cite arXiv 2508.17536 for the martingale result and carry its condition: an unbiased belief-update model, which a correction-biased update breaks. 'Announcing the expert moved outcomes by a few points' still inverts arXiv 2602.01011 and is still owed from 2026-09-10."
    },
    "techniques/hibernation-and-resume.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/inherited-state-provenance.md": {
      "disposition": "keep",
      "reason": "Provenance, count and mandate each prevent one of the three named misreadings. The orchestrator-log-versus-worker-channel diff and the asymmetry tell are reusable. The measured claim is modest and bounded."
    },
    "techniques/lifecycle-signals.md": {
      "disposition": "keep",
      "reason": "Unchanged. The 2026-09-23 conform proposals (runtime-owned status markers, the shared-machine orphan scan) are leads, not defects."
    },
    "techniques/outbound-compute-plane.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/parallel-dispatch.md": {
      "disposition": "clarify",
      "reason": "The stock/total/supervisory three-number model, the inverted overflow rule, deferral's work-list condition and promotion keeping identity are sound. One change is owed: 'eleven simultaneous runs against a limit of ten' reports a configured ceiling being exceeded without explanation. State whether that is sampling granularity or an unenforced path, and align the golden path."
    },
    "techniques/result-harvest.md": {
      "disposition": "keep",
      "reason": "The clean-exit-without-result continuation is correctly bounded, accounted and ingested through the same door, and it says the rescue rate is unmeasured."
    },
    "techniques/session-registry.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/soft-budget-under-the-hard-cap.md": {
      "disposition": "clarify",
      "reason": "Still has zero links to sibling documents (laws only). Link parallel-dispatch's cap and total, deliberation-as-an-elected-turn, verifier-seat-capacity (which cites this technique) and its own rust application. Reword the 'Zero cap-fired stops, ever ... imaginary' bullet: a never-firing cap is still a backstop, so zero fires calls for a check that the cap is enforced, not proof it is absent."
    },
    "techniques/substrate-reconciliation.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/verifier-seat-capacity.md": {
      "disposition": "keep",
      "reason": "Counting at the seat, the oldest-age report, an occupancy check paired with the cap, the verifier's residue and the self-grading signature are each tied to a recorded failure. It explicitly declines to infer inflation from unpaired populations."
    },
    "techniques/worker-trajectory-anatomy.md": {
      "disposition": "clarify",
      "reason": "Unchanged. Still owes the three 2026-09-10 corrections: lock-in 'median step 12', 'recall nearly doubled', and '~3% resolved by the agent's own correction' (the source gives 8.51% of visible resolutions without user intervention)."
    },
    "applications/node--evidence-outranks-a-liveness-claim.md": {
      "disposition": "reverify",
      "reason": "A regression test with a replicated-predecessor positive control and floor rows, against the registry's own board. Not re-run in this review."
    },
    "applications/node--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "The mechanism is present at the public kp HEAD. The cited commits 73672577 and 05a9cb7f are absent from a clone's history, so re-pin it to a reachable commit and re-check the line anchors."
    },
    "applications/node--substrate-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Commit ff7a192 still not opened."
    },
    "applications/process--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "Private store replay with instrument controls. Its peak of 11 against a ceiling of 10 is the source of the clarify on parallel-dispatch. Not re-run."
    },
    "applications/process--verifier-seat-capacity--practitioner-swarm.md": {
      "disposition": "reverify",
      "reason": "The public audit confirms the vacancy, the refusal at the hard cap, 28 verdicts and the unverified verifier output. 'The list names eleven' and the franken_engine closure proxy were not re-checked."
    },
    "applications/python--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "Re-pinned to deer-flow 53df22bd on 2026-10-06, with the fallback section and the 1,500-word correction. Not reopened here."
    },
    "applications/python--deliberation-as-an-elected-turn.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/react--session-registry.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--absent-status-passthrough.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--brief-carries-the-session.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "Unchanged. The named falsifier query has still not been run."
    },
    "applications/rust--evidence-outranks-a-liveness-claim--agent-mail.md": {
      "disposition": "reverify",
      "reason": "Public tree at 3821104c. Its anchors were not opened in this review. Its departures (unknown read as stale; expiry outranking evidence without fencing) are clearly stated."
    },
    "applications/rust--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--session-registry.md": {
      "disposition": "reverify",
      "reason": "Unchanged. The new-id-on-wake deviation is still open; the 2026-09-23 conform pass confirms it."
    },
    "applications/rust--soft-budget-under-the-hard-cap.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    }
  }
}
```

## Clarify applied - 2026-10-31

Applied the six clarifies the 2026-10-31 architecture review named, against `19cb20182`.
Primary sources were re-opened this run. One correction to that review's own sources: the
pinned taxonomy paper's Figure 1 (v3) prints the category shares as 44.2 / 32.3 / 23.5, not
the 44.1 / 31.4 / 23.5 the 2026-09-10 record transcribed; the documents now carry the
figure's values, rounded, with the version named. The eleven-against-ten overshoot is now
stated consistently and named as undetermined: the replay counts recorded intervals and
cannot separate a recording artifact from an unenforced admission path. The ~23%
inaccurate-self-reporting figure in worker-trajectory-anatomy was not named in the owed
corrections and still has no confirmed source; it is left as it was. No verification date
was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/fleet-orchestration",
  "date": "2026-10-31",
  "baseline": "19cb20182",
  "digest": "sha256-b2:2e1a3b2ab288bdf0",
  "disposition": "reverify",
  "coverage": "All 35 documents keyed. The six documents carrying clarify items were re-read in their affected sections and edited; the other 29 are carried from the 2026-10-31 review unchanged (their bytes were not touched). Primary sources re-opened this run: arXiv 2503.13657v3 (HTML and the rendered Figure 1 SVG), 2607.09510v1 (HTML), 2605.29442, 2602.01011 and 2508.17536 (abstracts). No private tree, store replay or model run.",
  "counterexamples": [
    "A configured ceiling of ten observed at eleven in a replay of recorded intervals can be a late end stamp rather than an over-admission; the replay alone cannot tell, so the documents now say so instead of choosing.",
    "A cap that never fires is still a backstop; zero fires is evidence about the soft budget, not about whether the cap exists.",
    "Debate's martingale holds under an unbiased belief update; a revision step biased toward correction leaves that premise and can gain."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/html/2503.13657v3",
      "result": "Figure 1 (taxonomy_neurips_final_10_23_25.svg, rendered this run) prints System Design Issues 44.2%, Inter-Agent Misalignment 32.3%, Task Verification 23.5%; its mode percentages sum to those totals. Text: 'adding a high-level task objective verification step to ChatDev yields a +15.6% improvement in task success on ProgramDev'; role-specification improvements '+9.4% success rate increase for ChatDev'. Corrects the 2026-09-10 record's 44.1/31.4."
    },
    {
      "url": "https://arxiv.org/html/2607.09510v1",
      "result": "'A decisive error typically leaves a median recovery window of one execution step before failure lock-in'; 'supplying the monitor with task's requirements lifts recall from 18.2% to 28.8%'; per class 'ignored requirements from 3% to 22%, on false premises from 15% to 32%, and on capability gaps from 12% to 30%'; 'only 3.7-8.7% of failures are flagged before lock-in'."
    },
    {
      "url": "https://arxiv.org/abs/2605.29442",
      "result": "Abstract: '91.49% of visible resolutions still require explicit user correction'. The ~8.5% without is that figure's complement, written as such. The ~23% self-reporting share is not in the abstract and was not checked further."
    },
    {
      "url": "https://arxiv.org/abs/2508.17536",
      "result": "Abstract (v2, NeurIPS 2025): Majority Voting 'accounts for most of the performance gains typically attributed to MAD'; debate modelled as a stochastic process that 'induces a martingale over agents' belief trajectories, implying that debate alone does not improve expected correctness'; 'biasing the belief update toward correction, can meaningfully enhance debate effectiveness'. Full paper not read."
    },
    {
      "url": "https://arxiv.org/abs/2602.01011",
      "result": "Abstract: LLM teams 'consistently fail to match their expert agent's performance, even when explicitly told who the expert is, incurring performance losses of up to 41.1%'; leveraging, not identification, is the bottleneck."
    },
    {
      "source": "The subject's own process--parallel-dispatch application (Controls section)",
      "result": "The concurrency instrument counts overlapping recorded intervals (1 for twenty serial, 20 for twenty overlapping). This is what grounds the 'recording artifact or unenforced path' statement; the private store was not reopened, so which one occurred is not established."
    }
  ],
  "documents": {
    "fleet-orchestration.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: technique-list shares 42/37/21 -> ~44/~32/~24 with 'as arXiv 2503.13657v3 publishes them'; the supervisory-stock paragraph now says the ceiling of ten engaged with a recorded peak of eleven and points to parallel-dispatch for what the overshoot can and cannot mean."
    },
    "techniques/absent-status-passthrough.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/brief-carries-the-session.md": {
      "disposition": "keep",
      "reason": "The only change is a pointer to inherited-state-provenance, which closes the 'That is all' enumeration correctly."
    },
    "techniques/completion-claim-verification.md": {
      "disposition": "keep",
      "reason": "The new rule that a lost exit marker is UNVERIFIED and never the meta status is sound, and is grounded in two changelog-recorded incidents. The verifier-seat pointer is apt."
    },
    "techniques/coordination-failure-triage.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: table shares 42/37/21 -> ~44/~32/~24, pinned to arXiv 2503.13657v3 Figure 1 (44.2/32.3/23.5) with a note that the shares moved between versions; the +15.6 verification gain is now scoped to one benchmark (ProgramDev)."
    },
    "techniques/deliberation-as-an-elected-turn.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/durable-fleet-state.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/evidence-outranks-a-liveness-claim.md": {
      "disposition": "keep",
      "reason": "The claim-versus-evidence split, three-valued liveness, the lease boundary (renewal cadence plus fenced writes) and the measured refutation of its own strong form are coherent and scoped. The entry-only crash is stated as the non-goal."
    },
    "techniques/heterogeneous-model-panels.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the martingale claim now cites arXiv 2508.17536 and carries its condition (an unbiased belief update; a correction-biased update breaks it and improves debate), plus its finding that majority voting accounts for most debate gains; 'announcing the expert moved outcomes by a few points' -> teams told who the expert is still fail to match it, losses up to 41.1% (arXiv 2602.01011)."
    },
    "techniques/hibernation-and-resume.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/inherited-state-provenance.md": {
      "disposition": "keep",
      "reason": "Provenance, count and mandate each prevent one of the three named misreadings. The orchestrator-log-versus-worker-channel diff and the asymmetry tell are reusable. The measured claim is modest and bounded."
    },
    "techniques/lifecycle-signals.md": {
      "disposition": "keep",
      "reason": "Unchanged. The 2026-09-23 conform proposals (runtime-owned status markers, the shared-machine orphan scan) are leads, not defects."
    },
    "techniques/outbound-compute-plane.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/parallel-dispatch.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: after 'eleven simultaneous runs against a limit of ten', states that the peak counts overlapping recorded run intervals, so it is either a recording artifact or a path that admitted past the ceiling, that a timestamp replay cannot separate them, and what would (the admission log or slot grants). The cause itself remains undetermined and is owed to process--parallel-dispatch's reverify."
    },
    "techniques/result-harvest.md": {
      "disposition": "keep",
      "reason": "The clean-exit-without-result continuation is correctly bounded, accounted and ingested through the same door, and it says the rescue rate is unmeasured."
    },
    "techniques/session-registry.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/soft-budget-under-the-hard-cap.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: sibling links added to parallel-dispatch (the run total as the loop's hard cap, not the releasing slot cap), deliberation-as-an-elected-turn, verifier-seat-capacity and rust--soft-budget-under-the-hard-cap; the 'Zero cap-fired stops ... imaginary' bullet reworded so zero fires calls for checking the cap is enforced rather than proving it absent."
    },
    "techniques/substrate-reconciliation.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/verifier-seat-capacity.md": {
      "disposition": "keep",
      "reason": "Counting at the seat, the oldest-age report, an occupancy check paired with the cap, the verifier's residue and the self-grading signature are each tied to a recorded failure. It explicitly declines to infer inflation from unpaired populations."
    },
    "techniques/worker-trajectory-anatomy.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'lock-in at median step 12' -> lock-in follows the decisive error with a median recovery window of one step; 'recall nearly doubled' -> 18.2% to 28.8% overall with the per-class doublings and 3.7-8.7% flagged before lock-in; '~3% resolved by the agent's own correction' -> 91.49% of visible resolutions need explicit user correction, the remaining ~8.5% without. The ~23% self-reporting figure was not among the owed items and is unchanged."
    },
    "applications/node--evidence-outranks-a-liveness-claim.md": {
      "disposition": "reverify",
      "reason": "A regression test with a replicated-predecessor positive control and floor rows, against the registry's own board. Not re-run in this review."
    },
    "applications/node--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "The mechanism is present at the public kp HEAD. The cited commits 73672577 and 05a9cb7f are absent from a clone's history, so re-pin it to a reachable commit and re-check the line anchors."
    },
    "applications/node--substrate-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Commit ff7a192 still not opened."
    },
    "applications/process--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "Private store replay with instrument controls. Its peak of 11 against a ceiling of 10 is the source of the clarify on parallel-dispatch. Not re-run."
    },
    "applications/process--verifier-seat-capacity--practitioner-swarm.md": {
      "disposition": "reverify",
      "reason": "The public audit confirms the vacancy, the refusal at the hard cap, 28 verdicts and the unverified verifier output. 'The list names eleven' and the franken_engine closure proxy were not re-checked."
    },
    "applications/python--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "Re-pinned to deer-flow 53df22bd on 2026-10-06, with the fallback section and the 1,500-word correction. Not reopened here."
    },
    "applications/python--deliberation-as-an-elected-turn.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/react--session-registry.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--absent-status-passthrough.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--brief-carries-the-session.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "Unchanged. The named falsifier query has still not been run."
    },
    "applications/rust--evidence-outranks-a-liveness-claim--agent-mail.md": {
      "disposition": "reverify",
      "reason": "Public tree at 3821104c. Its anchors were not opened in this review. Its departures (unknown read as stale; expiry outranking evidence without fencing) are clearly stated."
    },
    "applications/rust--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--session-registry.md": {
      "disposition": "reverify",
      "reason": "Unchanged. The new-id-on-wake deviation is still open; the 2026-09-23 conform pass confirms it."
    },
    "applications/rust--soft-budget-under-the-hard-cap.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    }
  }
}
```

## Architecture review - 2026-10-31 (re-verification)

Follows a re-verification pass over three applications the previous record left `reverify` because the kp and personas trees were not reopened; both trees were reopened and every citation resolved, so the three move to `keep` with dated re-check notes. The other documents carry their prior dispositions.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/fleet-orchestration",
  "date": "2026-10-31",
  "baseline": "6e9ae5cbb",
  "digest": "sha256-b2:4ab08fc75b3f0277",
  "disposition": "reverify",
  "coverage": "Re-verification pass only. node--parallel-dispatch checked against kp at the pinned 73672577 and HEAD 936588503; react--session-registry against personas at the pinned bf2a1e249 and HEAD 61029d7ae0; rust--completion-claim-verification against personas HEAD (no pinned commit). Source read only; nothing compiled, tested or executed. The other 32 documents were not re-read and carry the previous record's dispositions.",
  "counterexamples": [
    "A measured change cited by a branch sha can land on the main line under another sha; the kp A/B change 05a9cb7f is unreachable and landed as bb5b74f14.",
    "A merge rung granted to the worker that also reports its gates green lets a completion claim reach the default branch with no parent-side check behind it."
  ],
  "sources": [
    {
      "source": "kp at 73672577 and 936588503: package.json, app/_lib/python-runner.ts, app/_lib/python-runner-concurrency.test.ts, app/_lib/automation-pass.ts, app/_lib/automation-scoring-budget.test.ts",
      "result": "Pinned citations resolve; engines pin unchanged. scoringSpawnBudget landed as bb5b74f14 (automation-pass.ts:259-262). The semaphore gained interactive/background lanes (python-runner.ts:341-389), both counting against one ceiling and releasing on settle."
    },
    {
      "source": "personas at bf2a1e249 and 61029d7ae0: src/lib/bindings/FleetSessionState.ts, src/features/plugins/fleet/{fleetStateMeta.ts,sub_grid/fleetGridGroups.ts,sub_grid/__tests__/fleetGridGroupOrder.test.ts}, src-tauri/engine/src/unattended.rs, src-tauri/src/commands/companion/fleet_bridge.rs, src-tauri/src/commands/fleet/run.rs, rust-toolchain.toml",
      "result": "Arm B of session-registry is in the tree with the exhaustiveness door; the vocabulary grew to ten (queued, expired) and both arrived with group rows. Completion path still reads no artifact; worktree rule 2 now varies by rung (push/PR at 2, self-merge at 3). Toolchain pinned 1.96.1."
    }
  ],
  "documents": {
    "fleet-orchestration.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: technique-list shares 42/37/21 -> ~44/~32/~24 with 'as arXiv 2503.13657v3 publishes them'; the supervisory-stock paragraph now says the ceiling of ten engaged with a recorded peak of eleven and points to parallel-dispatch for what the overshoot can and cannot mean."
    },
    "techniques/absent-status-passthrough.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/brief-carries-the-session.md": {
      "disposition": "keep",
      "reason": "The only change is a pointer to inherited-state-provenance, which closes the 'That is all' enumeration correctly."
    },
    "techniques/completion-claim-verification.md": {
      "disposition": "keep",
      "reason": "The new rule that a lost exit marker is UNVERIFIED and never the meta status is sound, and is grounded in two changelog-recorded incidents. The verifier-seat pointer is apt."
    },
    "techniques/coordination-failure-triage.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: table shares 42/37/21 -> ~44/~32/~24, pinned to arXiv 2503.13657v3 Figure 1 (44.2/32.3/23.5) with a note that the shares moved between versions; the +15.6 verification gain is now scoped to one benchmark (ProgramDev)."
    },
    "techniques/deliberation-as-an-elected-turn.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/durable-fleet-state.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/evidence-outranks-a-liveness-claim.md": {
      "disposition": "keep",
      "reason": "The claim-versus-evidence split, three-valued liveness, the lease boundary (renewal cadence plus fenced writes) and the measured refutation of its own strong form are coherent and scoped. The entry-only crash is stated as the non-goal."
    },
    "techniques/heterogeneous-model-panels.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the martingale claim now cites arXiv 2508.17536 and carries its condition (an unbiased belief update; a correction-biased update breaks it and improves debate), plus its finding that majority voting accounts for most debate gains; 'announcing the expert moved outcomes by a few points' -> teams told who the expert is still fail to match it, losses up to 41.1% (arXiv 2602.01011)."
    },
    "techniques/hibernation-and-resume.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/inherited-state-provenance.md": {
      "disposition": "keep",
      "reason": "Provenance, count and mandate each prevent one of the three named misreadings. The orchestrator-log-versus-worker-channel diff and the asymmetry tell are reusable. The measured claim is modest and bounded."
    },
    "techniques/lifecycle-signals.md": {
      "disposition": "keep",
      "reason": "Unchanged. The 2026-09-23 conform proposals (runtime-owned status markers, the shared-machine orphan scan) are leads, not defects."
    },
    "techniques/outbound-compute-plane.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/parallel-dispatch.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: after 'eleven simultaneous runs against a limit of ten', states that the peak counts overlapping recorded run intervals, so it is either a recording artifact or a path that admitted past the ceiling, that a timestamp replay cannot separate them, and what would (the admission log or slot grants). The cause itself remains undetermined and is owed to process--parallel-dispatch's reverify."
    },
    "techniques/result-harvest.md": {
      "disposition": "keep",
      "reason": "The clean-exit-without-result continuation is correctly bounded, accounted and ingested through the same door, and it says the rescue rate is unmeasured."
    },
    "techniques/session-registry.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/soft-budget-under-the-hard-cap.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: sibling links added to parallel-dispatch (the run total as the loop's hard cap, not the releasing slot cap), deliberation-as-an-elected-turn, verifier-seat-capacity and rust--soft-budget-under-the-hard-cap; the 'Zero cap-fired stops ... imaginary' bullet reworded so zero fires calls for checking the cap is enforced rather than proving it absent."
    },
    "techniques/substrate-reconciliation.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep, and that reasoning still holds."
    },
    "techniques/verifier-seat-capacity.md": {
      "disposition": "keep",
      "reason": "Counting at the seat, the oldest-age report, an occupancy check paired with the cap, the verifier's residue and the self-grading signature are each tied to a recorded failure. It explicitly declines to infer inflation from unpaired populations."
    },
    "techniques/worker-trajectory-anatomy.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'lock-in at median step 12' -> lock-in follows the decisive error with a median recovery window of one step; 'recall nearly doubled' -> 18.2% to 28.8% overall with the per-class doublings and 3.7-8.7% flagged before lock-in; '~3% resolved by the agent's own correction' -> 91.49% of visible resolutions need explicit user correction, the remaining ~8.5% without. The ~23% self-reporting figure was not among the owed items and is unchanged."
    },
    "applications/node--evidence-outranks-a-liveness-claim.md": {
      "disposition": "reverify",
      "reason": "A regression test with a replicated-predecessor positive control and floor rows, against the registry's own board. Not re-run in this review."
    },
    "applications/node--parallel-dispatch.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31: every citation resolves at 73672577 and the A/B results stand; dated note records that the measured change landed as bb5b74f14 (05a9cb7f unreachable) and that the semaphore gained admission lanes without changing the stock-cap argument. verified_on moved to 2026-10-31."
    },
    "applications/node--substrate-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Commit ff7a192 still not opened."
    },
    "applications/process--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "Private store replay with instrument controls. Its peak of 11 against a ceiling of 10 is the source of the clarify on parallel-dispatch. Not re-run."
    },
    "applications/process--verifier-seat-capacity--practitioner-swarm.md": {
      "disposition": "reverify",
      "reason": "The public audit confirms the vacancy, the refusal at the hard cap, 28 verdicts and the unverified verifier output. 'The list names eleven' and the franken_engine closure proxy were not re-checked."
    },
    "applications/python--completion-claim-verification.md": {
      "disposition": "reverify",
      "reason": "Re-pinned to deer-flow 53df22bd on 2026-10-06, with the fallback section and the 1,500-word correction. Not reopened here."
    },
    "applications/python--deliberation-as-an-elected-turn.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/react--session-registry.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31: every citation resolves at bf2a1e249; at HEAD arm B is the tree (fleetGridGroups.ts) and the door absorbed two new states, queued and expired, which confirms the verdict. verified_on moved to 2026-10-31."
    },
    "applications/rust--absent-status-passthrough.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--brief-carries-the-session.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--completion-claim-verification.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 against personas HEAD: anchors updated in place, the structural fact (no artifact read before Finished) holds and the verdict stands. Dated note: rung-dependent rule 2 now permits push/PR and self-merge, so 'never push or merge' is the base guardrails only. verified_on moved to 2026-10-31, verified_against rust@1.96 from rust-toolchain.toml."
    },
    "applications/rust--evidence-outranks-a-liveness-claim--agent-mail.md": {
      "disposition": "reverify",
      "reason": "Public tree at 3821104c. Its anchors were not opened in this review. Its departures (unknown read as stale; expiry outranking evidence without fencing) are clearly stated."
    },
    "applications/rust--parallel-dispatch.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    },
    "applications/rust--session-registry.md": {
      "disposition": "reverify",
      "reason": "Unchanged. The new-id-on-wake deviation is still open; the 2026-09-23 conform pass confirms it."
    },
    "applications/rust--soft-budget-under-the-hard-cap.md": {
      "disposition": "reverify",
      "reason": "Unchanged since the 2026-09-10 reverify."
    }
  }
}
```
