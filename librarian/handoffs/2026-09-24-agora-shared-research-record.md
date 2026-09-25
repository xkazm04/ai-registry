---
status: EXECUTED 2026-09-24
origin: 2026-09-24-agora (intake run intake-agora)
governs: agent-operations/coordination/shared-research-record (new category, new subject)
owner_decision: 2026-09-24 forge now (operator, E4 + E2 escalation at the admission gate)
---

# XL spec - shared-research-record (agent-operations)

## Why this is XL and not three techniques

The source is a paper (arXiv:2609.18094v2, 2026-09-18) whose repository holds only a
project page. It describes one system in which self-directed agent sessions share no
conversation, no workspace and no planner. They coordinate only through an append-only
record of contributions in git. The design read found **three load-bearing decisions no
subject models** (routing count 3, one system), all with the same home if new:

1. Credit a contribution only through **other accounts'** follow-on work. Weight it by
   contribution type, exclude self-citation, and let a newer verdict from the same
   verifier replace the older one's effect.
2. Allocate attention with **explicit exploit / explore-known / explore-novel slots**,
   ranked by an upper-confidence bound. The ranking carries a near-duplicate penalty, and
   its exploration constant grows when the metric distribution bunches near its best.
3. A **typed contribution vocabulary** with per-type rules. A result counts whether it
   succeeded or failed. A hypothesis may not carry a metric as if tested. A verification
   names exactly one target and never the verifier's own work. An endorsement or a
   work-in-progress marker is visible but carries zero weight.

Three measurements from the same run fold in, because each is a boundary of one of the
three decisions and none has a home either:

4. **A new leader must clear the evaluator's resolution.** The last recorded improvement
   was 9e-6 bpb. Cross-hardware variation on the same code was up to 1.3e-3. Every
   component was selected on one 200-text development evaluator. 18 of 1,124 scored
   contributions produced about 98% of the total reduction, and the remaining 1,106 found
   the next 0.03.
5. **The community run is the unit of analysis.** Commit-level observations are not
   independent samples. The paper's own proposed test is a four-arm matched comparison:
   isolated, flat log, central planner, and shared graph plus views. Agents, models,
   compute, evaluator and wall clock are matched across arms.
6. **Path- or source-keyed intent claims do not stop idea-level rediscovery.** The
   `wip` tag existed. Even so, of 696 equal-score pairs from different accounts, 63%
   landed within one hour of each other and 80% within six. Every worker read the same
   frontier, so the same obvious next step was taken in parallel.

**Why proposed rather than written:** one paper is a single author group's n=1 run, and
its one intervention (diversity views on 2026-05-02, first state-space edit within a day)
is uncontrolled. The paper says so itself. The subject has to be written from the
mechanisms' own literature and from a tree that implements the pattern, with the paper
cited as a measured instance and never as proof.

## Placement (verified against the authority)

- `knowledge/software-engineering/llm-agent/orchestration/` holds 10 subjects and is at
  `MAX_CHILD_DIRS`. V1 vetoes it.
- `knowledge/agent-operations/taxonomy.json` has three categories (configuration-choice,
  measurement, run-safety). The bundle's stated job is "the operator side of agents that
  change a repository: a fleet of unattended runs against real trees, where the output is
  commits". That is this subject exactly. None of the three categories fits:
  measurement is about grading runs, and run-safety is about confinement.
- **Resolved path:** `knowledge/agent-operations/coordination/shared-research-record/`,
  a new category `coordination` (order 4) with one subject. Laws are at `../../_laws.md`
  from the golden path and `../../../_laws.md` from techniques/applications.
- Purity profile `agent-ops`: no vendor, model or product names in the upper layers.
  Applications name them freely, with n and date.

## Proposed techniques (the decision rule each must carry)

| slug | decision rule |
| --- | --- |
| `independent-reuse-evidence` | Score a contribution by what OTHER participants built on it or reproduced. Never count the author's own extensions or endorsements. When a verifier changes its verdict, the newest verdict replaces the older one's effect, and both stay in the history. Carries the capture boundary: a participant with many accounts defeats account-level exclusion. |
| `explicit-explore-slots` | Serve the shared frontier as separate exploit / explore-known / explore-novel choices, never as one ranked list. Penalise near-duplicates. Raise exploration when the metric distribution bunches near its best, or when one cluster holds more than a stated share of recent activity (the run's trigger was over a third of all activity plus a stalled leader). |
| `typed-contribution-vocabulary` | A closed set of contribution types, each with a validation rule and a scoring weight. Failures are results. A hypothesis carries no metric. A verification has exactly one target and a different author. Zero-weight types (in-flight, acknowledgement) are visible so they coordinate, and are excluded from fitness so they cannot be farmed. Carries the emergent pre-registration observation: participants who state a predicted band before the result make their record auditable, and a verdict without artifacts is a coordination hint, not validation. |
| `resolution-bounded-leaders` | A contribution becomes the new leader only when it beats the current one by more than the evaluator's measured resolution (same-code spread across the hardware the participants actually run). Below that it is recorded as a tie. A tie at the top of a shared frontier is what the explore slots exist for, so this rule and `explicit-explore-slots` are one mechanism seen from two sides. Converges with the leaderboard literature: a leaderboard that updates only on a margin resists adaptive overfitting to its holdout. |
| `community-run-as-unit` | To claim that the shared record helped, compare whole community runs under matched budgets (isolated / flat log / central planner / record plus views). Commit-level statistics are diagnostics, not samples. A single run with a mid-run intervention is a case, not an effect. |

`idea-level-rediscovery` (item 6) is **not** its own technique. Fold it into
`explicit-explore-slots` as the failure the slots answer, and state in the golden path
that path- or source-keyed claims coordinate *where*, not *what*.

## Boundaries it must NOT absorb

- `software-engineering/.../concurrent-vcs` owns physical isolation, intent ledgers keyed
  on path scope, and commit mechanics in a shared checkout. This subject owns what the
  sessions **publish to each other and how they choose the next thing**. Name the seam
  in prose. Cross-bundle links are forbidden.
- `software-engineering/.../fleet-orchestration` owns **assignment** (a dispatcher carves
  the work). This subject owns the case with no dispatcher: participants self-select.
- `agent-operations/measurement/*` grades runs. This subject uses those grades as inputs
  and does not restate them.
- The weight-transfer method itself (initialising a model from donor behaviour) is not
  this subject. It is a lead in the source note.

## Primaries (the web budget)

- The paper: https://arxiv.org/abs/2609.18094 (full text at /html/2609.18094). The
  director already read it; its numbers are quoted above and may be cited from here.
- Training-data convergence the drafter may rely on without fetching:
  - UCB1: Auer, Cesa-Bianchi and Fischer 2002.
  - UCT: Kocsis and Szepesvari 2006.
  - Novelty search: Lehman and Stanley 2011.
  - Quality-diversity / MAP-Elites: Mouret and Clune 2015.
  - Merton 1961 on multiple discovery.
  - The Ladder leaderboard mechanism: Blum and Hardt 2015, "The Ladder: A Reliable
    Leaderboard for Machine Learning Competitions".
  - Bibliometric self-citation exclusion.
  - At most one fetch, to confirm the Ladder's update rule if the drafter cites it.

## The tree that implements the pattern (reconcile read-only)

This registry is a live instance. A dozen self-directed intake sessions share one git
record, with no planner assigning sources:

- `scripts/run-board.mjs`: in-flight claims keyed on **source and subject**. This is the
  `wip` analogue, and it is exactly the path/source-keyed claim item 6 says cannot see
  idea-level overlap.
- `scripts/librarian-scan.mjs`: one sorted worklist every session reads
  (`const worklist = [...subjects].sort((a, b) => b.points - a.points ...)`). It carries
  two exploration-shaped terms: a never-swept bonus (`W.neverSwept`), which is the
  explore-novel analogue, and a computed dry-streak saturation brake. It has **no slot
  separation**.
- `.claude/skills/intake/SKILL.md` § Corroboration: "Tier sources; never count them",
  and convergence counts "two independent sources, from different runs". This is the
  independent-reuse rule reached independently, which is the convergence this spec
  leans on.
- `librarian/sources/*.md` untriaged tables are the open-hypothesis analogue, and
  `librarian/applied.md` is the verification analogue. Its verdict vocabulary is
  `better / not-better / unmeasurable`.

Write at least two applications, stack `process`, each opening with its witness:

1. The paper's run, as a dated measured instance: numbers with n and date, and what it
   cannot show (uncontrolled intervention, single evaluator).
2. This registry's fleet as the second instance, with anchors checked by
   `check-anchors.mjs --root .`. State plainly what its worklist does and does not do
   against `explicit-explore-slots`.

## Open questions the drafter decides (and says why)

- Is `resolution-bounded-leaders` in this subject or an amendment to
  `software-engineering/.../measurement-honesty/noise-band-and-hysteresis`? The spec
  argues here: the leader is the attention signal of a shared frontier, so a sub-band
  leader moves the whole community. Override if you find the neighbour owns it.
- Whether the golden path should state a law candidate. Do not write it into `_laws.md`
  (laws need convergence across runs). Name it in prose if the drafter believes one
  exists.

**Override this spec where the neighbours' own scope statements say otherwise, and say
why in the report.**

## Executed (2026-09-24)

Forged in-session by one worker; director reviewed the diff (gate green, purity grep against the source vocabulary clean, use_when on all 6 documents, anchors 19/19 on the registry application and 4/4 on the personas application).

- **Override 1 (accepted):** resolution-bounded-leaders stays here, narrowed. noise-band-and-hysteresis owns one instrument's own drift (announce or not); it has no term for many participants adaptively querying one holdout, nor for a promoted leader re-pointing a whole community.
- **Override 2 (accepted):** no verified_against on process applications (the gate rejects it on stack process); the witness is named in each application's first paragraph.
- **Director amendments from the apply step:** explicit-explore-slots gained "A frontier that empties itself does not herd" (measured on this registry: frontier-driven work top-5 share 0.138 below the source-driven p5 0.152; verdict not-better), and resolution-bounded-leaders gained the paired case-sampling margin (personas memory-year ladder: 5 leader claims, 0 resolve; verdict better, shipped bf6a039c6).
- Techniques: 5. Applications: 3 (the paper's run, this registry's fleet, the personas ladder).
