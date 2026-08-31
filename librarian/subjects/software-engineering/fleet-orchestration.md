---
domain: software-engineering
subject: fleet-orchestration
last_touched: 2026-08-31
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
