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

## Waves 1-2 closed — commit `42e7ac53`

Gate green. 43 -> 47 subjects, 259 -> 295 techniques, 115 -> 127 applications. All four new
subject folders verified present in HEAD (9 files each), 295 technique files in HEAD.

**Law review (director, seeing the whole wave).** Seven laws were proposed by workers who could
not see each other. Exactly one met the recurrence bar and was added:

- **L12 — an instrument proves it had input before it reports a verdict.** Proposed independently
  and near-identically by the rubric worker (*a guard must prove it is not vacuous*) and the
  narrative worker (*an instrument must assert it had input*), each citing three recurrences,
  including the registry's own gate treating an empty walk as FATAL rather than green. Cited by
  `deliberately-overlapping-criteria` and `reachability-and-orphan-detection`, the two techniques
  whose authors proposed it. Independent duplication across a wave IS the bar; nothing else met it.

**Standing law proposals (NOT added — carried for a future wave):**
1. *a set-level property cannot be recovered from per-item scores* (prioritization)
2. *a classification is declared, never inferred* (economy)
3. *an agent may only act on what it was authored to know* — unknown is distinct from false (agent behaviour)
4. *a synthesized estimate and a measurement may not share a field* (runtime patterns)
5. *a declared field that no consumer reads is a lie with a schema* (level planning)
Proposals 2, 3 and 4 are three faces of one candidate invariant about declared provenance; 4 may
already be L2 applied to ranking. Deliberately left unresolved — one wave is not enough evidence
to mint a law, and a wrong law is more expensive than a missing one.

**Cross-subject contradiction resolved by the director:** the pacing report's advice that an
ability used a tenth of a time per fight should be buffed or cut now defers to the teaching
subject ("once it is established that the player was ever taught to use it") in both places it
appears, rather than contradicting `unused-mechanic-detection`.

**Left deliberately uncommitted:** `catalog.json` and the software-engineering /
llm-observability rule files. A parallel session's uncommitted work feeds their hashes; they
regenerate in one command and belong to whoever owns that work.

### Wave 3+4 — 2026-09-02 — asset-production subdivision + 4 NEW subjects

`asset-production` was at the cap of 10 and is now subdivided (owner-approved), applied through
`scripts/apply-taxonomy.mjs --to nested --apply`: 10 subject folders moved, 44 link rewrites
across 17 files, 275 links verified to resolve to the same file after the move.

  geometry (4)              asset-class-poly-budgeting, generated-asset-world-scale,
                            generated-mesh-acceptance, mesh-finishing-for-engine-readiness
  surface-and-imagery (3)   shader-budget-authoring, tiling-texture-acceptance,
                            sprite-and-atlas-production [new]
  motion-and-audio (3)      motion-quality-gating, spatial-audio-scene-authoring,
                            adaptive-music-authoring [new]
  sourcing-economics (2)    image-to-3d-input-gating, regeneration-vs-repair-economics

Taxonomy also registers `terrain-synthesis-acceptance` (balance-validation) and
`playtest-signal-to-defect` (craft-judgment). Four workers dispatched.

### Wave 3+4 reports

**`sprite-and-atlas-production` (NEW) — landed, gate green.**
Golden path (260 lines) + 6 techniques (101-115 lines each) + 2 applications
(node--atlas-packing-and-bleed-margins, process--pixel-grid-and-resolution-contract).
Boundaries: against tiling-texture-acceptance — a tiling texture's seam is between an image and a
TRANSLATED COPY OF ITSELF, a sprite's seam is between an image and a DIFFERENT CATALOGUED IMAGE;
the sharp practical test is bleed, which a tiling texture must never have and a sprite must always
have. Against shader-budget-authoring — the seam is the page count: this owns the page budget and
what is packed where, that owns how many pages a material may bind. Against asset-class-poly-
budgeting — same budget doctrine, different unit (authored pixels per world unit and atlas pages
per class instead of triangles).
Upward lessons: mip depth on an atlas is floored by the CELL, not the page — a 7-level chain on a
4096 page would run 256px cells down to 4px; and the 3D half of the same tree had already solved
the flat-default resolution problem with a declared texel density, which named the missing 2D
piece precisely.
Deviations recorded: an icon-set step declares "no padding (UV boundary = cell boundary)" ALONGSIDE
a 4-level mip chain — the exact forbidden combination; the atlas step's acceptance only checks that
strings are present and name something real, reading no bytes and measuring no gutter; NOTHING
anywhere in the tree reads a delivered image's width or height, so a 256px class contract is
unenforced while the generation call defaults to 512; art-step acceptance is a human selection.
Confirmed well-realized: cell budget with reserved headroom, index-based UV addressing, unit-plus-
basis outline statement, and a gallery artifact that refuses a selection with no generation
history — L12 applied to art selection, in the repo, before L12 existed.
No proposed law — every recurring rule had an anchor. L11 transferred cleanly from triangles to
pixels; L12 carried the autotile completeness check.

**`terrain-synthesis-acceptance` (NEW) — landed, gate green.**
Golden path (204 substance lines) + 6 techniques + 2 applications
(process--terrain-to-room-graph-handoff, node--heightfield-resolution-and-vertical-basis).
Boundary with procedural-level-planning: that owns the GRAPH (rooms, connections, seeds, pacing,
landmarks, gate-and-key), this owns the GROUND (field, basis, gradient, masks, traversable mask).
The handoff is a ONE-WAY payload — basis, traversable mask, locomotion class, connected
components, play boundary, constraint surfaces. Terrain may never nominate arenas or gates; the
planner may never re-derive walkability with its own threshold; unmet needs return as a
regeneration request with a stated constraint; and ON DISAGREEMENT THE GROUND WINS, because the
plan is a request and the mask is a measurement.
Against generated-asset-world-scale: mirrors its unit discipline and names the one difference —
a heightfield carries TWO scales, and the vertical one is dangerous because it silently
multiplies every slope.
Upward lessons: connectivity reported as a single ratio (largest passable region / all passable
cells) beside the region count, because one number travels into a build report and a component
list does not; and a real incident fix — a point SNAPS to the nearest cell the geometry actually
emits a floor for and records WHICH reason moved it, while a footprint whose position carries
design meaning is rejected. The draft had said "reject rather than adjust" flatly; reality was
more precise.
Deviations recorded: the tree's one heightfield generator is UNITLESS — a sample count and a bare
"height value"; the vertical is a hand-typed `heightScale: 10` at the far end and the horizontal
is `grid_size / max(rows, cols)` fed the SAMPLE COUNT, so spacing evaluates to 1 by accident.
The same codebase is rigorous about units EVERYWHERE ELSE (cm extents, "in metres (glTF axes)",
an explicit px/m texel-density unit) — the heightfield is the one place the discipline lapses.
No erosion, drainage, slope/gradient or splat code exists anywhere; "biome" means a texture-search
preset or a gallery step whose acceptance is "a candidate is selected"; the project's own audit
records a deferred terrain build for want of a terrain mesh engine; and the terrain test suite's
seven cases are ALL numeric-shape assertions — precisely the "a heightfield cannot be malformed"
trap the golden path opens on.
PROPOSED LAW (not added): *when a rule and a measurement of the same thing disagree, the
measurement is the authority and the finding is against the rule.* L3 covers duplication and L7
covers self-certification; neither states precedence between a declared rule and a measured field.

**`playtest-signal-to-defect` (NEW) — landed, gate green.**
Golden path (225 substance lines) + 6 techniques (97-119 lines each) + 2 applications
(process--observation-before-interpretation, node--unreproducible-is-a-state-not-a-dismissal).
Boundary with crash-forensics-attribution, as a picking rule: WHEN THE BUILD PRODUCED MACHINE
EVIDENCE OF ITS OWN FAILURE IT IS CRASH FORENSICS; WHEN THE BUILD KEPT RUNNING AND A PERSON OR AN
AGENT IS THE ONLY INSTRUMENT THAT NOTICED ANYTHING, IT IS THIS SUBJECT. The two meet at one report
and deliberately do not merge. Subsystem review: this feeds it and borrows its consequence severity
ladder wholesale, adding only the frequency axis a review does not need. Quality verdict integrity:
a playtest finding ages exactly as a verdict does, cited rather than repeated. Runtime observation
evidence: the session contract sits on its ladder and the observed rung is a required field of an
agent's report; the ladder is named, never restated.
Upward lessons: (1) a regression tracker in the tree carries its own post-mortem — a global
"mark fixed" sweep declared every untested category fixed and then fired regression alerts against
fixes that never happened; that produced the rule *a session can only testify about ground it
covered*, adding declared coverage as a fifth required record, plus total-coverage-not-overlap and
unknown-scope-counts-as-not-covered. (2) The same file confesses two taxonomies (finding categories
vs session test categories) with no stored mapping — which became the routing rule that the classes
you route by must be the classes a session declares coverage in.
Deviations recorded: no unreproducible state anywhere in the triage status set and no attempt count
in either schema — `snooze` is exactly the parking lot the technique forbids; `occurrence_count` is
a numerator with no denominator, though the sweep already computes the sessions that looked;
`confidence INTEGER NOT NULL DEFAULT 80` is an unmeasured quantity rendering as a number, in a tree
that elsewhere uses `number | null` for precisely this; the description column is unvalidated free
text and the fixture mixes observation with theory inside it.
No proposed law. Notably, the worker DECLINED to cite `refuse-rather-than-destroy` on the
silent-close failure after checking that it governs live-workspace tools — dropped rather than
decorated. L12 carried three of the six techniques and was the strongest new fit: a "could not
reproduce" with no attempt count is an instrument reporting a conclusion over an unstated scope.

**`adaptive-music-authoring` (NEW) — landed, gate green.**
Golden path (217 substance lines) + 6 techniques (124-150 lines each) + 2 applications
(node--music-acceptance-beyond-decode-checks, process--intensity-mapping-from-declared-game-state).
Boundary with spatial-audio-scene-authoring, stated as an AUTHORITY rule rather than a topic split:
the scene owns the total simultaneous-playback budget and music consumes a DECLARED RESERVATION out
of it; the derived layer count comes FROM that reservation, music yields first when the budget
binds, and the reverse direction is barred — the scene never schedules music, having no tempo.
Motion-quality-gating: the shape of the argument transplants (time-based medium, rungs of evidence,
sampling is part of the instrument), the rubric does not. Content-acceptance-tiering owns the ladder
construct and wins any vocabulary dispute; this owns only which rungs a score needs.
Upward lessons: a transition reversed mid-overlap must RESUME the interrupted tier in progress,
never restart it; the top intensity tier needs a DWELL CEILING as well as a floor, because the
densest material is the least tolerable to repeat; and GRID ALIGNMENT IS NOT PHRASE ALIGNMENT — a
demand-loaded layer started on a bar boundary is on-beat and in the wrong place in the form.
Deviations recorded: loop boundaries declared in MILLISECONDS rather than samples; per-stem
crossfades up to 200ms CONCEALING tails instead of folding them, with no pre-roll or tail-fold
anywhere; a block-based compressed packaging format whose loop boundary is never re-measured after
re-encode; combat entry waiting up to 2500ms for a bar with no immediate unpitched accent covering
the gap; and the largest — RUNG 2 DOES NOT EXIST: every number is author-typed, so no step recovers
tempo, grid or loudness FROM audio, and the generation layer marks files loopable by a request flag
and reports duration asserted from the request. Honest half: the runtime gate is `deferred` with a
parseable reason, never passed.
No proposed law. One scout-style assumption (that the repo generates music) was FALSE and is
reported as the refusal it actually is rather than written up as a finding.

## Campaign closed — 2026-09-02

All 12 ledger units landed, every one gate-green. Bundle 43 -> 51 subjects, 259 -> 319 techniques,
115 -> 135 applications. `asset-production` subdivided into four subcategories.

### Final law review

Thirteen laws now. Two were added by this campaign, on DIFFERENT evidence, and the distinction is
recorded because a future director will need to know which bar was applied:

- **L12 — an instrument proves it had input before it reports a verdict.** Promoted on
  *independent duplication*: two workers who could not see each other proposed it near-identically,
  each citing three recurrences.
- **L13 — declaring an input is not consuming it.** Promoted on *corpus-level recurrence*, which is
  stronger evidence than duplication and predates the wave: two techniques written BEFORE this
  campaign (`declare-what-each-engine-ignores`, `declared-vs-referenced-tag-audit`) exist for no
  other purpose than this invariant and cited no law that stated it — a law-shaped hole. Five of the
  twelve units then independently found instances of it in the consuming repo: a room connection's
  gate condition as free text no linter reads; a zone edge's locked flag ignored by the only
  traversal that consumes those edges; an economy converter's input pool written and never read;
  no code anywhere reading a delivered image's dimensions; an occurrence count with no denominator
  while the sweep already computes one. Cited from the two pre-existing techniques, deliberately not
  from this wave's own output.

**Standing proposals carried forward, NOT added** (each raised once, none independently duplicated):
1. *a set-level property cannot be recovered from per-item scores*
2. *a classification is declared, never inferred*
3. *an agent may only act on what it was authored to know* — unknown is distinct from false
4. *a synthesized estimate and a measurement may not share a field* (possibly L2 applied to ranking)
5. *when a rule and a measurement of the same thing disagree, the measurement is the authority*
Proposals 2 and 3 remain candidate faces of one invariant about declared provenance. A future wave
that hits any of these again should promote it; one occurrence is not evidence.

### What the source actually yielded

The link directory is old and its tools are mostly obsolete. Its value was never the links: it was
the CANON it points at (the pattern literature, the AI-for-games literature, the lens tradition,
the internal-economy diagramming discipline, the level-design and playtesting literature) read as a
coverage checklist. Four whole territories turned out to be uncovered — agent behaviour, generated-
code shape, narrative topology, and teaching — plus 2D imagery, music, ground and playtest signal.

The reusable finding for the next campaign: putting old craft beside an automated pipeline produces
knowledge that exists in NEITHER. The clearest instance is `emittability` in
`agent-behaviour-authoring` — an arbitration graph stored as opaque binary content is unauthorable
by a text-emitting generator, so the pipeline's reach co-decides the behaviour model. No textbook
lists that criterion, because a human author with an editor never encounters it.

### Anchor errors made by the director, corrected by workers

- the engine-trap corpus is at `src/lib/knowledge/ue-gotchas.ts`, not `src/lib/ue-gotchas.ts`
- the `proc-terrain` checklist prompt is at `module-registry.ts:1177`, not 1168
- the briefed claim that double-counting is intrinsic to overlapping criteria was WRONG: it is a
  property of a MEAN composition, and the corpus was corrected upward rather than following the brief
- one worker was briefed to expect generated music in the consuming repo; there is none, and it
  reported the refusal rather than manufacturing a finding
