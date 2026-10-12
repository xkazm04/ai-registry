---
subject: racing-track-authoring-and-lint
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# racing-track-authoring-and-lint

A racing-vehicles subject with six techniques before this run, now seven. Before this run it had
two `process` applications. Both read Death Ride's track gate and design notes at firetv `9793226`
(2026-10-01). It had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-rtal-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. Three
lanes ran:
- a field lane that read the firetv `deathride/main` tree at `d9990777`, its committed quality
  evidence (`deathride/tracks/atlas/gate-proof.json`, n = 25 rows; `candidates.json`, 37 installed
  circuits) and its design notes;
- a counter-evidence web lane;
- a training-data-only blind lane.

The rank was real, and the subject had moved under it. In the 446 commits since `9793226`, the
game added a layout composer, 66 courses and 102 track choices, junctions and alternative routes,
features and obstacles with their own linters, a quality instrument with seeded six-car
simulation, and a shape contract.

**Widened: seven kotlin applications (kotlin@2.0.21), one per technique.** All 187 anchors hold
under `check-anchors` against the tree.
- **`kotlin--mutate-good-track-to-prove-linter`** (simulation, better).
  - The base ledger closed: 10 of 10, the same day as the first read (`646f37a7`).
  - The gate grew to 47 rules by composing four more linters, and 33 of them are proven. All 14
    unproven rules are route rules: junctions 1 of 6, branches 0 of 9.
  - The overlap rule still returns early. The committed proof shows it hiding a planted pacing
    verdict (a straight fraction of 1.0 got no pacing finding).
- **`kotlin--px-per-metre-scale-contract`** (simulation, better).
  - A 1.5 divisor after the clamp, an owner request of 2026-10-06, puts every race camera under
    the floor at 8.5-11.3 px/m. The data test is green.
  - The lobby became a literal 9.0 px/m camera, and the note's two pixel ranges still disagree.
- **`kotlin--straight-fraction-pacing-band`** (simulation, unmeasurable).
  - Four readers of one threshold.
  - The band never bound: 0.369-0.728 across 37 installed circuits, against 0.12-0.85.
  - Only the low end has a linter mutant.
- **`kotlin--corner-radius-in-longest-car-lengths`** (simulation, better).
  - The bake shrank the authored radius by ~1.6x (2.7 L to 1.68 L, 3.6 L to 2.23 L).
  - Installed minimums sit at 2.237-2.419 L against the 2 L floor.
  - The longest body (Bastion) is not the longest wheelbase (Kestrel), and the owner checklist
    names Kestrel.
- **`kotlin--width-in-widest-car-widths`** (simulation, better).
  - Composer authors in car units.
  - Installed minimums 3.70-4.15 W.
  - A passing width (5 W over 4 L, two zones) and a compression limit sit beside the floor.
- **`kotlin--oriented-capsule-grid-lint`** (simulation, unmeasurable).
  - The capsule maths is unchanged, and collision circles match it.
  - The grid became a zone that every content layer is linted against.
- **`kotlin--shape-contract-above-the-linter`** (simulation, better).
  - 29 of 29 lint-clean legacy circuits rejected, and 81 similar pairs.
  - 15 planted witnesses.
  - Two stretched circuits lost their hairpins unnoticed by lint and simulation.

**Both `process` applications were re-resolved at `d9990777`.**
- Mutate: 34 of 34 anchors hold.
- Scale: 27 of 27 anchors hold.

Stale claims corrected:
- "four of ten" (now ten of ten base, 33 of 47 overall);
- the five-course guard (now a floor);
- the six-car race test (legacy courses only);
- "the floor holds on one camera path" (now none);
- the 4.8 px/m shared figure (now ~3.2);
- the lobby as a map.

`verified_on` moved to 2026-10-10.

**New technique: `shape-contract-above-the-linter`.** Three lanes reached it:
- Field: the tree built it, and it rejected the library the linter passed.
- Web: Loiacono, Cardamone and Lanzi (IEEE TCIAIG 2011) score track diversity as "the entropy of
  the track's curvature and speed profiles", and find the two only loosely correlated. FIA Appendix
  O defines a corner as "a change of direction of at least 45°, with a radius of less than 300m"
  and caps a straight at 2 km.
- Blind: "Judge pacing with a simulated-driver speed profile rather than geometry alone", corner-type
  variety, the longest flat-out stretch.

**Golden-path rules that flipped, each reached by at least two lanes and checked against the
current file:**
- **Branches hang off the curve.** A declared crossing waives the overlap rule near its two
  points; elevated crossovers are declared by layer; projection is hinted by the last progress; an
  alternative route maps both ends onto an interval of the main lap; route rules need their own
  mutants.
  - Field: `Tracks.kt:267`, `Tracks.kt:170`, `TrackBranches.kt:5`.
  - Web: Game AI Pro ch. 39, re-read verbatim from the PDF text 2026-10-10: "Normally, a racing
    track will be a single list of nodes" ... "A track may have one or more branches that will
    require multiple link references in the data"; an arcade track "will be heavily branched with
    alternative routes".
    (https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter39_Representing_and_Driving_a_Race_Track_for_AI_Controlled_Vehicles.pdf).
  - Blind: "a directed graph of segments", junctions and bridges exempted from the self-overlap
    check "by layer or z".
- **The turning floor is decided by the longest wheelbase and steering lock; the body is a proxy.**
  - Field: the drift geometry table.
  - Web: the bicycle model tan(δ) = L/R with L the wheelbase (arXiv 2012.02978), and Game AI Pro
    ch. 39 "even steering lock can play a roll", re-read verbatim.
  - Blind: "R_min = wheelbase / tan(max steer lock)".
- **The overlap exclusion is the larger of car lengths and road widths.** Field only, but a
  correction of a stated claim ("best stated in widths") by measured evidence: two committed false
  hits that I re-counted from `gate-proof.json` (17/19, 114/116; the third hit, 8/48, is the
  genuine crossing).
- **Acceptance is a separate instrument.** This is the new technique's golden-path summary.

**Technique conditions, each reached by two lanes:**
- **Grip binds at racing speed, and the geometric floor binds only in slow hairpins.** Web: arXiv
  2012.02978 on forces at higher speed; Game AI Pro ch. 39 "request the maximum speed from the
  vehicle physics interface, based on a value of radius". Blind: R = v²/(μg). It extends the
  standing "geometric floor" hedge. Landed in corner-radius.
- **A passing width over a stated length and a compression limit sit beside the floor.** Field:
  `quality-rules.csv`. Web: McMillan on Game Developer, "Having a wider section of track used for a
  corner will allow for more margin for error". FIA Appendix O on grid width held "through to the
  exit of the first corner" and a field-size coefficient "W= a coefficient depending on the minimum
  width of the circuit", both re-read verbatim from the 2024 PDF text. Blind: "Make braking zones and hairpin entries wider (+1 to 2 car widths)". The
  radius rule never measured width, so the old step-6 hand-off was wrong; corrected. Landed in
  width.
- **Cap the longest straight; record a speed profile; the ceiling admits a fast circuit.** Web: FIA
  Appendix O "The maximum permitted length for straight sections of track is 2km", re-read
  verbatim; F1's Monza guide "full throttle for 80% of the lap" (web lane). Blind: Monza "about
  75–80% full throttle", longest flat-out stretch. Field: `longestStraightM` recorded, 130-527 m.
  Landed in straight-fraction and the golden path.
- **Match the collision shape; author the grid on a straight.** Web: a capsule under-reports
  corner overlap on boxy bodies (the lane's own geometric reasoning, flagged as such); FIA Appendix
  O builds the grid by construction. Blind: oriented boxes preferred, capsules "a cheap, close
  stand-in", "the grid sits on a straight or a gentle curve". Field: collision is circles, and the
  composer puts the grid on a straight. Landed in oriented-capsule-grid-lint.
- **Separation as a game rule; look-ahead from the safe area.** Web: Micro Machines (Wikipedia,
  commentary) and Fire TV "fully within the inner 90% (the safe zone)". Blind: the elimination rule,
  the "90% action-safe area". Landed in px-per-metre-scale-contract.
- **A felt camera change belongs in the table.** The field instance of the standing every-mode
  rule. Landed in px-per-metre-scale-contract and the golden path.

**Verified and left:**
- `mutate-good-track-to-prove-linter`. Just et al. FSE 2014: "73% of real faults are coupled to the
  mutants generated by commonly used mutation operators" (web lane). The cost objection
  (Petrović and Ivanković 2018) does not apply to a deterministic data linter.
- Width stated in car units. McMillan's "1.6 car widths" lanes are confirmed. FIA and CIK state
  metres per class (12 m; 8 m against a 1.4 m kart, ~5.7 widths).
- The radius-must-exceed-half-width derived rule. Game AI Pro's "registration should be considered
  undefined" condition is the same failure.
- The scale contract's logical-pixel basis, against platform type minimums (Fire TV 14sp ≈ 28 px at
  1080p).

**Declined, not landed:**
- **The width-change rate ("not greater than 1m in 20m total width", FIA Appendix O, re-read
  verbatim).** Web only. Banked.
- **"Too wide hides corner structure; print metres and the typical car's width too."** Field only
  (the tree's own research note). Drafted into the width technique and removed before commit. It
  stays in the kotlin application.
- **A grid is a protected zone for every content layer.** Field only. Drafted into the grid
  technique and removed before commit. It stays in the kotlin application.
- **The 27% of real faults not coupled to mutants.** Web only. Not a condition on the technique.
- **Per-sub-linter mutant ledgers.** Field only. It stays in the kotlin application.

## Impact

The subject joins **0 contexts** across the 12 mapped projects. This was checked by reading each
registered project's committed `.ai/registry-map.json` at its HEAD, with a positive control: pof
joins game-economy-tuning 21 times. No verdict went stale, and no `/conform --stale` queue exists.
firetv, the only tree with the seam, has no map and is registered only by a sibling's uncommitted
`projects.json` change in the shared tree, which this run did not touch. Return: re-run the map
once that registration lands.

## Applied

- **shape-contract-above-the-linter** - firetv - simulation - better.
- **Golden path: branches hang off the curve** - firetv - simulation - better (2 of 3 cases; no
  shipped split).
- **Golden path: overlap exclusion** - firetv - simulation - better.
- **Wheelbase, steering lock, grip and headroom** - firetv - simulation - better.
- **Passing width and compression** - firetv - simulation - better.
- **Longest straight and speed profile** - firetv - simulation - unmeasurable (no limit stated, no
  flat-out share recorded).
- **Collision shape and grid on a straight** - firetv - simulation - unmeasurable (collision is
  circles).
- **A factor after the clamp, separation, safe area** - firetv - simulation - better.

No project commit. firetv is unregistered at HEAD, and every row is a simulation over committed
evidence.

## Open leads (banked, convergence rule applies)

- **The width-change rate as a lint rule.** Web only. Return: a second lane, or a tree with an
  abrupt width step that drives badly.
- **Too wide hides corners.** Field only. Return: a second lane.
- **The grid as a protected zone.** Field only. Return: a second tree with layered content.
- **A per-sub-linter ledger.** Field only. Return: a second composed linter.
- **Project leads in firetv, not registry content.** These wait on the owner:
  - move the 1.5 race zoom-out into `presentation.csv` and lower the floor with its reason, or
    floor after the divisor;
  - add the camera-function assertion;
  - widen the linter's overlap exclusion to the shape tool's `max(8 L, 4 widths)`;
  - collect findings instead of returning on the first overlap;
  - mutants for five junction rules and nine branch rules;
  - put numbers and positions in the finding texts;
  - fix the W6-tracks.md:9 vs :15 pixel ranges;
  - move route literals (0.004 per metre, 1.5 m, 45-135°) into tables.

## Saturation

Depth rung L3: a code read, committed evidence re-counted (37 installed circuits, 25 proof rows),
two re-anchored applications. Last-pass yield:
- 7 applications;
- 1 technique;
- 4 golden-path rules flipped;
- 6 technique conditions;
- 6 stale claims corrected.

Clocks: the derived per-stack windows. The web evidence (FIA 2024 text, platform guidelines) has no
clock of its own. Demand: none mapped. dry_streak 0.
