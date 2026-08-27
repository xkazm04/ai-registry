# Subject proposal — `scale-investment-timing`

**Status:** EXECUTED 2026-08-27. Forged at
`knowledge/software-engineering/backend-platform/resilience/scale-investment-timing/`
— golden path plus five techniques, gate-clean. See
[`librarian/subjects/software-engineering/scale-investment-timing.md`](../librarian/subjects/software-engineering/scale-investment-timing.md)
for how the four open questions resolved and where the draft overrode this brief.
Two overrides worth noting here: technique 2 was renamed
`ceiling-as-deadline-not-trigger` because the dispatched name
(`run-the-architecture-to-its-stated-limit`) invites the exact failure the literature
identifies, and technique 5 was shortened to `migration-reason-audit`. Applications
outstanding — the subject has not been reconciled against real code.

This document is retained as the record of what was dispatched. It is a forge input,
not knowledge.
**Bundle:** `software-engineering`
**Category:** `backend-platform` → subcategory `resilience`
**Resolved path:** `knowledge/software-engineering/backend-platform/resilience/scale-investment-timing/`
**Raised by:** `/intake`, 2026-08-27, from
[`librarian/sources/2026-08-27-best-engineers-focus-on-system-design.md`](../librarian/sources/2026-08-27-best-engineers-focus-on-system-design.md)
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.

---

## Placement, verified against the authority

`taxonomy.json` is the authority, not a directory count. `backend-platform` is
**nested** — it holds four subcategories and no bare subjects — so a flat add at
category level is illegal and the subject must enter a subcategory.
`backend-platform.resilience` currently holds **seven** subjects —
`retry-backoff`, `rate-limiting`, `error-handling`, `self-healing`,
`webhook-ingestion`, `stream-proxy-hop`, `optional-dependency-degradation` —
against a cap of ten. An eighth is legal and requires no restructuring.

Link depths, stated so they are not derived wrongly (verified against
`rate-limiting/rate-limiting.md`, which resolves `../../../_laws.md`):

- from `scale-investment-timing/scale-investment-timing.md` → `../../../_laws.md`
- from `scale-investment-timing/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling subject, e.g. `../rate-limiting/rate-limiting.md`
- to another category, e.g.
  `../../../engineering-process/codebase-stewardship/module-design/module-design.md`

### Override me if you disagree, and say why

`resilience` is the least-bad existing home, not an obvious one. Its seven
subjects are all runtime mechanisms for surviving adverse conditions; this
subject is a *decision* discipline about how much system to build, and two of
its proposed techniques are organisational rather than runtime. Two alternatives
were considered and rejected as worse, not as wrong:

- **a new `backend-platform` subcategory** (`capacity-and-growth`): structurally
  legal, but it would hold one subject, and the taxonomy's own hysteresis rule
  subdivides a category when it goes *over* the cap rather than in anticipation.
- **`engineering-process/codebase-stewardship`** (5 subjects, room for more):
  attractive because `module-design` is the natural sibling — structure sets the
  cost of every future change, and this sets how much structure to buy — but
  that subcategory's subjects are all about the *code*, not about runtime
  capacity, and "should we shard yet" does not read as stewardship.

If, having read the neighbouring subjects' stated scopes, you conclude one of
those is right, **take it and state the argument in your report.** A brief that
reads as non-negotiable buys compliance with a mistake.

## The gap, measured

The bundle carries **149 subjects** (960 techniques when this run mapped it),
and nothing owns the question of *how much system should exist right now*. Every scale-adjacent
subject begins after the sizing decision has been made:

| subject | what it presupposes |
| --- | --- |
| `rate-limiting` | a ceiling already chosen, and traffic to hold under it |
| `admission-queue` | a capacity already fixed, and load to shed against it |
| `sync-replication` | two stores that must converge, already decided upon |
| `runner-fleet` | CI execution capacity, sized for machine-paced arrival |
| `metric-forecasting` | a *tracked metric*, and the question of whether a projection may be **displayed** |

The last row is the one that looks closest and is not. `metric-forecasting`
states its own boundary explicitly — it owns the fit, the ray, the estimated
date, and "load-bearingly, the decision whether the claim may be displayed at
all." It is a dashboard discipline. It governs how to draw a growth curve
honestly; it says nothing about what to build because of one.

Three further checks, because a near-empty prior-art result is more dangerous
than an empty one:

- `research-map` over `capacity planning`, `vertical scaling`, `architecture
  evolution`, `rewrite decision` and `database sharding` returned semantically
  unrelated hits — grant portfolio capacity floors, ARPG power scaling, theme
  architecture, a markdown vault. The neighbourhood is empty.
- The concept-level term **`vertical scal`** returns **zero** hits across all
  149 subjects. `horizontal scal` returns exactly one, inside
  `rate-limiting/limiter-topology`. Product names returning zero is expected and
  correct under the purity floor; a *concept* returning zero is the finding.
- No law in `_laws.md` reaches it. The closest,
  `derivation-names-recomputation`, governs stored derived values.

**The shape of the gap is the missing first stage.** The bundle is thorough from
stage two onward — how to shard, retry, shed, replicate, migrate — and leaves
stage one, *how much of this to build and when*, to a default. A subject that is
excellent from stage two onward is exactly where a missing stage one hides.

## Source and corroboration status — read this before drafting

The raising source is a **first-party practitioner account**: a senior engineer
on a large hosted CI product, describing systems he built. By the corroboration
table that class authorizes *what he did and measured*, at n=1, and authorizes
**nothing** about what works in general.

**Every technique below must be corroborated before it lands.** The source is
the occasion for this subject, not its evidence. Its numbers are existence
proofs and must be written as such — dated, attributed to one stack, never
generalised into a threshold. In particular the "80%" and "millions of requests
per second on five or six containers" figures below are one engineer's report of
one system; they are legitimate as illustrations of a *shape* and illegitimate
as rules.

Expect the primary literature to contradict some of it. That is the good case,
not the bad one: on 2026-08-21 a source located a real hole and stated its rule
backwards, and the technique written against the literature was stronger for it.

## Proposed techniques

Five, folded in from candidates that each looked standalone at extraction. Each
carries the decision rule it must state; the drafter decides the rest.

### 1. `next-order-of-magnitude-only`

**The rule:** design for the next order of magnitude of load, never the final
one. Confidence in a growth projection decays with horizon, so an architecture
built for 100× when the curve supports 10× has spent real money against a
projection nobody believes.

Must carry: what "an order of magnitude" is measured in (it is not always
requests — it may be tenants, data volume, or concurrent editors); how to pick
the axis that will actually bind; and the honest statement that this trades a
future rewrite for present speed, deliberately.

The counter-case to hunt: domains where the rewrite is not available later —
data model choices that become irreversible once customer data exists, and
public API contracts. The technique must state where it stops applying.

### 2. `run-the-architecture-to-its-stated-limit`

**The rule:** the trigger for redesign is the *measured* exhaustion of the
current architecture, not the anticipation of it. State the current design's
ceiling in advance, instrument against it, and rewrite when the instrument says
so.

Must carry: how a ceiling is stated so that it is falsifiable (a number, an
axis, and a measurement method, per
`count-carries-predicate`); the failure mode where the ceiling is never written
down and "we are at scale" becomes a matter of opinion; and the opposite failure
where a team rides past a ceiling it did measure because the rewrite is
unfunded.

Relationship to technique 1: these are the same decision seen from the two ends,
and the drafter should say so rather than repeating it.

### 3. `vertical-headroom-before-distribution`

**The rule:** exhaust single-node headroom before distributing, because
distribution buys capacity and *sells* the ability to reason about the system.

Must carry: the axes on which vertical headroom actually runs out (memory
bandwidth and IO before core count, usually); the trigger for moving — the
source reports acting at roughly 80% of a resource's ceiling, which is an
existence proof and not a threshold; and the cases where distribution is
mandatory regardless of headroom, which are availability and blast radius, not
throughput.

**This one most needs counter-evidence.** It is the technique most likely to be
stated backwards by a practitioner generalising from one workload. Fetch the
primary literature.

### 4. `size-the-system-to-its-maintainers`

**The rule:** an architecture is sized to the team that will *operate* it, not
the team that built it. A design maintainable by thirty engineers is a liability
at eight, and headcount falls faster than architecture does.

Must carry: maintainer count as an explicit design input written down at design
time; the observation that funding, not growth, usually sets it; and the link to
[`module-design`](../knowledge/software-engineering/engineering-process/codebase-stewardship/module-design/module-design.md),
whose thesis — structure is the variable that sets the cost of every future
change — is the mechanism this technique prices.

This is the strongest candidate in the set and the one with no prior art
anywhere in the bundle: `headcount` appears only in assessment and reporting
subjects, never as an input to a design decision.

### 5. `audit-a-migration-for-its-technical-reason`

**The rule:** before a platform migration, enumerate its stated reasons and
strike the ones that are not technical. A migration whose surviving list is
empty is a status purchase, and it is paid for in delivery velocity.

Must carry: the named non-technical reasons that recur (resume value, "cloud
native", peer-organisation imitation, vendor pressure) and why each is a real
motivation rather than a stupid one; the test that separates them from a genuine
constraint; and the honest counter-case — a migration justified by hiring or by
an ecosystem's direction can be correct, and the technique must not pretend the
only legitimate reason is a benchmark.

## Boundaries this subject must NOT absorb

- **How to shard, replicate, shed or rate-limit.** Those are
  `sync-replication`, `admission-queue` and `rate-limiting`. This subject stops
  at the decision; the mechanisms are owned.
- **How to draw or display a growth projection.** That is
  `metric-forecasting`, which owns it well and defensively.
- **Which storage engine.** That is the `storage-engine-selection` proposal
  raised 2026-08-27; if it has landed by the time you draft, read it and
  cross-reference rather than restating. The two are adjacent and must not
  overlap: that one picks the engine, this one decides how much of it to buy.
- **Structural decisions inside the codebase.** `module-design`, including the
  agent-delegation boundary. Cite it; do not restate it.
- **Team topology, hiring and org design.** Technique 4 takes maintainer count
  as an *input*. It does not get to recommend one.

## Open questions the drafter must decide, not discover

1. **Is `scale-investment-timing` the right subject name?** It is descriptive
   and strip-test clean, but it foregrounds *timing* while techniques 3 and 4
   are about *sizing*. `capacity-strategy` and `scale-sizing` were the
   alternatives. Pick one and commit before writing, because the golden path's
   opening boundary statement depends on it.
2. **Does technique 1 or technique 2 lead the golden path?** The subject's
   pipeline is: state the ceiling → measure against it → decide the next
   increment → size it to the maintainers. That ordering makes 2 the opening and
   1 the consequence, which inverts the order the source presents them in.
3. **How much of the business-constraint material belongs here at all?** The
   source is rich on translating engineering investment into business numbers,
   and the intake run judged that already covered by
   `engineering-assessment/reporting-and-remediation/executive-reporting`
   (`denominator-naming`, `grounded-narrative-generation`) and
   `adoption-measurement` (`adoption-vs-outcome-separation`). Verify that
   judgment; if it is wrong, the material is a sixth technique, not a section.
4. **Is there a law here?** "Build for the next order of magnitude" has the
   cross-cutting shape of a law, and one run is not convergence. Do not write a
   law. Record the lead if the drafting confirms the shape.

## Why this was proposed rather than written

Five decision rules, each needing its own counter-evidence lane, in a
neighbourhood with no prior art to correct against — that is a subject, and the
`XL` classification is about the corroboration budget rather than the word
count. A single intake run has a three-fetch ceiling and spent zero of it on
this cluster, because the account that raised it can authorize none of it. Any
one of these techniques written from the source alone would be a video authoring
an upper layer, which is the one failure that damages the corpus rather than
wasting a run.

## An instance a worker can open today

`scale-investment-timing` is unusual among proposals in that its subject matter
is visible in this registry's own connected fleet rather than only in the
literature. The bridge at `.projects.local.json` resolves six consumer projects;
several are single-VM deployments whose architecture was chosen against a user
count that has not yet arrived. A worker with the operator's confirmation can
read one tree and report whether its stated ceiling exists anywhere in writing —
which is technique 2's central claim, tested negatively, and a negative
application is the strongest evidence this subject can get early.

Do not open a project tree without asking. Do not write `verified_against`
unless you did.
