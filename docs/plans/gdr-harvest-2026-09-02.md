# GDR harvest — campaign journal (opened 2026-09-02)

Source: `https://github.com/Kavex/GameDev-Resources` — a 572-line curated link directory of
traditional game-development resources. Its knowledge payload is not the tool links: it is
(a) the book canon it points at, and (b) the taxonomy of concerns a conventional pipeline
covers, read as a coverage checklist against `knowledge/game-production` (43 subjects at
open, 7 categories).

Method: `docs/harvest-brief.md` (joining an existing bundle), one worker per subject folder,
director regenerates derived files once per wave. `docs/forge-brief.md` binds for file shapes.

Framing question for every unit: **what does the traditional craft know that an automated
production line must encode as a budget, a rubric criterion, an acceptance rule, or a
generation constraint?**

## Ledger

| # | Subject | Class | Category | Canon behind it | Wave | State |
|---|---|---|---|---|---|---|
| 1 | agent-behaviour-authoring | NEW | systems-canon | AI for Games; Programming Game AI by Example | 1 | dispatched |
| 2 | gameplay-runtime-patterns | NEW | engine-integration | Game Programming Patterns; Game Engine Architecture | 1 | dispatched |
| 3 | branching-narrative-graph-validation | NEW | content-pipeline | Ultimate Guide to VG Writing; story-design tool class | 1 | dispatched |
| 4 | learning-curve-and-teaching-design | NEW | balance-validation | Theory of Fun; Flow; Rules of Play; Level Up! | 1 | dispatched |
| 5 | game-economy-tuning | EXTENDS | systems-canon | Game Mechanics: Advanced Game Design (Machinations) | 2 | pending |
| 6 | aaa-craft-rubric-authoring | EXTENDS | craft-judgment | The Art of Game Design (lenses) | 2 | pending |
| 7 | production-work-prioritization | EXTENDS | production-governance | PM tool class; game-jam class | 2 | pending |
| 8 | procedural-level-planning | EXTENDS | balance-validation | Game Dev Essentials: Level Design | 2 | pending |
| 9 | sprite-and-atlas-production | NEW | asset-production/* | spritesheet, pixel, bitmap-compression, tile-editor sections | 3 | pending |
| 10 | adaptive-music-authoring | NEW | asset-production/* | tracker / DAW / chiptune section | 3 | pending |
| 11 | terrain-synthesis-acceptance | NEW | balance-validation | terrain-generator section | 4 | pending |
| 12 | playtest-signal-to-defect | NEW | craft-judgment | bug-reporting + jam-feedback class | 4 | pending |

## Structural work

- **Wave 3 blocker:** `asset-production` holds 10 subject folders — the profile cap. Subjects
  9 and 10 require subdividing it into subcategories, applied through
  `scripts/apply-taxonomy.mjs` (never a hand move: relative links encode depth).
  Approved by the owner 2026-09-02.

## Wave log

### Wave 1 — 2026-09-02 — 4 NEW subjects, the ground the bundle does not cover at all
Taxonomy entries written (systems-canon 4->5, engine-integration 6->7, content-pipeline 8->9,
balance-validation 4->5). Workers dispatched.

### Wave 2 reports

**`production-work-prioritization` (EXTENDS) — landed, gate green.**
3 techniques (vertical-slice-as-the-first-milestone, fixed-deadline-scope-triage,
declared-scope-as-a-shaping-budget) + 1 node application. Golden path edited additively
(200 -> 224 lines), one new section inserted whole, no existing paragraph reworded.
Seam: the ranking holds only per-item factors, so "the finished set adds up to a walkable
path" cannot arise inside it — milestone shape is a filter above the ranking, never a sixth
weighted factor.
Upward lesson: the consuming repo computes its vertical-slice milestone as a project-wide
checklist percentage, so a "complete slice" is reachable with no path anywhere — this
hardened the rule from "prefer a step name" to "when the only metric is a project-wide
percentage, do not report the slice on it at all".
Deviations recorded: slice milestone is a breadth fraction; a durable deadline store exists
that no prioritization reads; the recommendation engine has no deadline term, no cut list and
no slice-membership filter, so horizontal drift is its equilibrium rather than an accident.
PROPOSED LAW (not added): *a set-level property cannot be recovered from per-item scores.*

**`game-economy-tuning` (EXTENDS) — landed, gate green.**
3 techniques (source-drain-converter-trader-vocabulary, feedback-loop-topology-and-polarity,
structural-economy-simulation-before-numbers) + 1 node application. Golden path edit was
34 insertions / 0 deletions — purely additive.
Seam: the eight existing techniques answer *what the rates should be*; the three new ones
answer *what shape the rates flow through*. A structural pass returns "structurally stable at
unit rates", never "balanced"; the numeric band consumes the structural output, not the reverse.
Upward lesson: when a transformation's output is a state change on an existing object rather
than countable units, it is a PURE DRAIN of its input — calling it a converter invents an
output resource and double-counts.
Deviations recorded: the consuming repo's economy event type admits only faucet|sink (no
converter, trader or pool kind); a vendor-sell converter is typed as a plain source whose input
pool is written and never read, so the item pool diverges monotonically and the gold source is
unfunded WHILE THE +/-15% BAND PASSES; the two balancing loops in the model are undeclared
special cases; a negative-balance clamp is an unnamed source; nothing enumerates feedback loops.
PROPOSED LAW (not added): *a classification is declared, never inferred* — adjacent to L1 but
distinct; L1 governs missing measurements, this governs missing types.

**`aaa-craft-rubric-authoring` (EXTENDS) — landed, gate green.**
3 techniques (question-form-criteria-for-open-judgment, deliberately-overlapping-criteria,
criterion-set-coverage-audit) + 1 node application. Golden path +37 / -0.
Naming collision handled: the new material never calls a question a "lens" — the instrument is
an *interrogative criterion*, and the technique states outright that the borrowed tradition
spent the same word this corpus already spends on versioned instruments.
Upward lessons: (1) double-counting under deliberate overlap is largely a property of a MEAN,
not of overlap itself — under a weakest-dominates composition a defect seen by three framings
moves the total exactly as far as one seen by one; (2) deduplication by exclusion must carry a
vacuity guard, and the trade is that a framing outside the arithmetic has no path to a verdict
when it alone saw the defect; (3) an improvement-directive channel is not a coverage input,
because it can only speak in the categories it was supplied.
Deviations recorded: findings carry no location field, so merge-by-identity is unimplemented and
a producer reads the same defect twice; deduplication is by exclusion rather than merging; no
pilot distinguishes designed overlap from duplication; the judge's output contract admits only
0-100 plus pass/fail with NO *not answerable* state — the exact failure the question-form
technique names.
`verified_against` deliberately omitted: the tree pins no runtime version, and guessing was the
worse option.
PROPOSED LAW (not added): *a guard must prove it is not vacuous* — a check that inspects an
empty set reports the same clean result as one that inspects everything. L1, L4, L7 and L9 each
touch a neighbouring idea; none states this one.

### Wave 1 reports

**`agent-behaviour-authoring` (NEW) — landed, gate green.**
Golden path (197 lines) + 6 techniques (110-142 lines each) + 2 applications
(process--perception-before-decision, node--group-coordination-without-a-hive-mind).
Boundaries: combat semantics owns what an attack IS and how it resolves, this owns why an agent
threw it and what it is now bound to (the seam: semantics sets wind-up/recovery bands, the
decision layer must honour them). Difficulty design owns HOW HARD and the human-plausible
ceiling; this owns the unit-carrying dials that ceiling caps (perception latency, reaction delay,
execution error, consideration cap). Encounter simulation owns outcomes over seeded trials; this
owns decisions — a simulation reports an identical win rate for an agent whose senses are
switched off, so the decision trace is this subject's output and the simulation's blind spot.
Upward lessons (folded into the draft): the claim registry belongs to the CONTESTED RESOURCE,
not the group — an attack-slot ring owned by the target and sized to its silhouette makes
retargeting, converging groups and target death correct by construction; a lease needs a
request -> offer -> arrive-and-confirm-within-timeout handshake, not just expiry; adjoining-unit
claims force a reseat move; mass-cancel on a resource state change is distinct from per-lease
expiry; holding a slot and being permitted to act from it are separate grants; and a sixth
model-selection criterion absent from the traditional literature — **emittability**: an
arbitration graph stored as opaque binary content is unauthorable by a text-emitting generator,
so the pipeline's reach co-decides the model family.
Deviations recorded: the feature graph makes the behaviour-tree system and perception setup
SIBLINGS, so a decision layer can be authored and marked complete before any sense exists; sense
parameters carry no reference target; no competence dial anywhere, so a difficulty ceiling has
nowhere to land and the only lever for a responsiveness complaint is to blind the agent; no
commitment/dwell/hysteresis in any check family, and the one timing rule present exempts combat
AI; blackboard guidance is one line about typing with no unit, scope, owner, lifetime or
unset-vs-default rule; the debug surface is human-only with no structured seeded decision record;
the coordination spec is graded only by reading source, never by observing a fight.
All eleven cited law anchors re-opened and held.
PROPOSED LAW (not added): *an agent may only act on what it was authored to know* — an
unobserved fact is `unknown`, distinct from false. Adjacent to L1 but not the same claim: L1
governs what a REPORT may say, this governs what a RUNTIME CONSUMER may infer.
Cross-subject finding (left out deliberately, not claimed): a placed-instance-vs-class-default
wiring gotcha belongs to engine-pitfall-corpus / wiring-contract-doctrine.

**`gameplay-runtime-patterns` (NEW) — landed, gate green.**
Golden path (273 lines) + 6 techniques (110-153 lines each) + 2 applications
(process--pattern-selection-by-force-present, node--allocation-discipline-in-the-hot-path).
Boundaries: against visual-script transpilation — there a prior artifact fixes the shape and the
burden is fidelity to something diffable; here no prior artifact exists and the defect is a shape
no force justified, so the picking rule is "is there something to be faithful TO". Against the
engine-pitfall corpus — that states properties of a specific host platform, this decides
properties of the problem that hold on any platform, and a platform's component model, update
phases and allocator arrive here AS FORCES from that corpus. Against ability-authoring — one
question separates them: is there a schema on the other side? With a waiting schema the craft is
agreement; without one, agreement is unavailable and form is what must be judged.
Upward lessons: a per-step opt-in should be DERIVED from evidence of per-step work, never
inherited from a template; an optimisation finding carries an estimated saving and the list is
ranked by it; a stated materiality floor suppresses noise findings, and the floor's existence is
reported so a filtered list is not read as an empty one.
Deviations recorded: pool candidacy selected by class-name substring plus instance count rather
than churn rate; a synthesized saving shares one ranked field with profile-derived savings, so an
unmeasured figure can outrank a measured one; the pool fix prompt omits the reset-on-acquire
obligation entirely; twelve best-practice packs are all agreement constraints with zero
runtime-shape or budget content; two module prompts prescribe named delegates with no force
stated; the only generation-time budget in the tree caps FILE SIZE, not shape.
ANCHOR THAT DID NOT HOLD: the engine-trap corpus is at `src/lib/knowledge/ue-gotchas.ts`, not
`src/lib/ue-gotchas.ts` as the dispatch stated. Director error; corrected here for later waves.
PROPOSED LAW (not added): *a synthesized estimate and a measurement may not share a field.*
L1 covers absence-of-measurement and L2 covers unit/basis; neither states that a modelled number
and an observed number must stay separately labelled when ranked together.

**`procedural-level-planning` (EXTENDS) — landed, gate green.**
3 techniques (landmark-and-sightline-legibility 148, critical-path-to-optional-branch-ratio 138,
gate-and-key-solvability-proof 152) + 1 node application. Golden path +58 / -1 (the single
deletion is the use_when line, one phrase appended).
Seam: the pacing linter asks whether the sequence of rooms has a rhythm; these three ask whether
the player can READ the space, whether it has the SHAPE it declared, and whether it can be
FINISHED at all — four verdicts on one graph, carried separately, weakest governing.
Upward lessons: (1) a gate stored as FREE TEXT is worse than no gate — it reads as authored and
is structurally invisible; (2) construction-time correctness rots without a JOIN, not without a
measurement — a disconnected-region count already exists beside a boss placer that never asks
whether the boss shares a region with the player spawn.
Deviations recorded: no Key/Lock/Gate type, no requires/unlockedBy edge, no inventory closure, no
key ordering, no gate-cycle detection, no unwinnable verdict anywhere; a room connection's
`condition` is a free-text string the pacing linter never reads, so its adjacency build and its
unreachable-check WALK LOCKED DOORS AS OPEN; a zone edge's `locked` flag is ignored by the one
traversal that consumes those edges and is written elsewhere purely as a display colour; no
landmark, sightline or visibility concept exists anywhere (the only landmark rule in the tree is
prose inside an evaluation prompt); no computed critical path over any room or zone graph —
`criticalPath` is a hand-authored boolean, and the only real longest-path algorithm in the tree
operates on developer task graphs.
PROPOSED LAW (not added): *a declared field that no consumer reads is a lie with a schema.*
Recurred three times in this subject alone. Adjacent to but distinct from L5 *compiling is not
wiring*: L5 is about a produced ARTIFACT never being reachable; this is about a declared INPUT
never being consulted.

**`branching-narrative-graph-validation` (NEW) — landed, gate green.**
Golden path (215 substance lines) + 6 techniques (83-99 lines each) + 2 applications
(process--state-variable-declaration-contract, node--reachability-and-orphan-detection).
Boundaries: judgeable-spec-authoring — anything a careful reader could verify by READING is the
neighbour's, anything requiring EDGE-WALKING is this subject's; a text grader scores a graph's
prose and self-consistency well and still cannot see that ending four is unreachable.
wiring-contract-doctrine — the neighbour owns the OUTWARD question (can a player reach this
conversation), this owns the INWARD one (once inside, can a player reach this node); a scene can
be perfectly wired externally and softlocked internally. content-drift-and-revision — the
neighbour answers "did the content change", this answers "which proven graph properties did that
change invalidate", which cannot be read off a fingerprint. media-generation (cross-bundle, prose
only) — dramatic structure, voice and prose grading are theirs; the seam is the runtime, and a
scene can be their best work and this subject's worst artifact simultaneously.
Upward lesson: a walk over zero nodes finds zero orphans and returns a VACUOUS PASS — added an
"assert the instrument before the result" section; no nodes, no declared entries and no declared
endings each render as *not measured*, and a pass must carry its counts.
Deviations recorded: the entry set is array order rather than a declaration, so reordering a node
literal silently re-roots the walk; there is no backward walk at all, so ending attainability and
co-reachability are uncomputed; the terminal check asks only whether SOME node is terminal, so an
accidental dead end is invisible; guards live in edge-label prose, making guarded dead ends — the
class that actually ships softlocks — undetectable by construction; the one runtime graph
generator declares endings by inference (a null successor), which the technique rules out; drift
detection is content-level only, with no topological classification whatever.
Three reconnaissance line numbers were off by 1-3 and were corrected before shipping.
PROPOSED LAW (not added): *an instrument must assert it had input before it reports a verdict* —
L1 covers the absence of a measurement but not a measurement taken over nothing.
Cross-subject note: this subject's reachability closure and `procedural-level-planning`'s
gate-and-key proof run the same mathematics over different domains (conversation state vs spatial
progression). No territorial conflict; a future pass may want a prose cross-reference.

**`learning-curve-and-teaching-design` (NEW) — landed, gate green.**
Golden path (234 substance lines, over the 120-220 band; the three required boundary paragraphs
carry it over and further cutting would have removed the seam work) + 6 techniques + 2
applications (process--skill-atom-inventory, node--unused-mechanic-detection).
Boundaries: difficulty-design owns how hard and who may change it while the player watches; this
owns whether the player was ever taught the thing being made harder. The worker named a genuine
DISAGREEMENT rather than papering it — the neighbour's four-term model treats player skill as
unauthorable, which is right about the population and incomplete about the game, because the
TAUGHT FLOOR beneath that term is authored and is the only lever that moves it. Combat pacing
owns one engagement for a player already able to fight; this owns the axis across many
encounters, touching at one point (a flat fight can be a pattern exhausted). Procedural level
planning owns where things go; the atom schedule is an input its linter consumes.
Upward lessons: one IDENTITY TOKEN per atom so parallel machine authoring cannot cross-contaminate
two atoms; the taught set as durable queryable player state rather than a progress position, so
the corridor check runs at runtime and authoring time from one authority; every introduce beat
needs an explicit failure exit that records the atom UNTAUGHT rather than trapping the player.
Deviations recorded: the tutorial pipeline's terminal state is `Introduced` with no practice or
test site — introduce-and-never-test encoded in the data model; no prerequisite graph across beats
(ordering is row order); one beat per mechanic, so atoms are counted as mechanics; the
comprehension metric is a within-sandbox success rate measured where the taught input is the only
active one — tutorial completion wearing a competence label; and the unused-ability alert lists
three balance causes and no teaching cause, raised by a simulation whose actor is competent by
construction, i.e. structurally blind to the cause it should suspect first.
NO proposed law — every recurring rule mapped onto an existing anchor.
CROSS-SUBJECT CONTRADICTION (director action required): `combat-pacing-and-dramatic-arc` advises
that "an ability used a tenth of a time per fight should be buffed or cut"; this subject's
`unused-mechanic-detection` inverts that default (teaching defect until proven a balance defect).
Two balance-validation subjects currently disagree in prose.
