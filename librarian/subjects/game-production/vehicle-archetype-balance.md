---
subject: vehicle-archetype-balance
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# vehicle-archetype-balance

A racing-vehicles subject forged on 2026-10-01 from Death Ride, with six techniques and two
`process` applications. The subject had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-vab-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
rank was real, and the physics had moved under the subject. `pr-weights.csv` was fitted at
`fd6b51a1` (C1, 2026-10-01 11:14) on the point model. D2 (`c1923384`, 16:17) moved every
roster car to the two-axle solver, and no commit since has refit the weights. The project
retired the old evidence (A0) and relabelled PR "a planning index" (progression doc line 9).
It moved acceptance to the combat-on ability harness.

Three lanes ran:
- **Field lane** on firetv `deathride/main` at `d9990777`. It read PowerRating, the mapping,
  the axle solver, the A0/A1/A3/DV3/Z3 notes and `audit-roster.py`. It ran `rosterReport`
  (movement only) and `abilityReport` (combat, abilities off and on) at 2,000 races per course
  cell in a detached scratch worktree, and an SLSQP refit. Nothing was committed to the game.
- **Counter-evidence web lane.** Sources: Forza support text (search extracts only, 403), a
  Turn 10 designer's portfolio, FH6 Series 2 notes, GT7 updates 1.13/1.49/1.71, Forza
  Motorsport Update 19, Sportscar365 on WEC and SRO BoP, Motorsport.com on IMSA, Riot's 2019
  balance framework, Rupp et al. (arXiv 2407.11396) and Super Mario Wiki's datamined MK8D
  tables.
- **Training-data-only blind lane.**

**Convergence (web + blind), landed as conditions:**
- Gate per course type when the pick sees the course.
- Run the gate at two or more driver skills and fail on any.
- A single rating is exploited through the part it under-prices.

**Field-only conditions:**
- **A share is not a margin.** 12 of 15 cells go 97% or more to one class, so the share reads
  leakage.
- **The verdict belongs to the harness's ruleset.** Rookie fails at 56.175% [55.3, 57.0]
  movement-only and passes at 52.74% with combat on.

**Corrected:** "report near-zero weights". With ten cars and eight weights an unexercised stat
is unidentified. The refit put armour at 2.3 on movement-only data, and the forge's 0.1 was
the fitter's floor. Measured: shipped weights on the axle physics give fit error 0.00348 (forge
0.00183) and the Club pair at the tolerance edge on unchanged stats. The refit gives 0.00100.

**Linear mapping conditioned:**
- MK8D's per-stat lookup curves are the field alternative.
- On the axle path the grip limit takes a power of mass and width.
- Steering and yaw scale with per-class geometry that no stat drives and PR never reads.

**Rating:** a recompute outside the function is a second authority. `audit-roster.py:93`
omits `prAdjustment`, which is 0 today.

**Widened with three kotlin applications** (kotlin@2.0.21, 29 anchors held, strict):
- `kotlin--weights-fit-to-sim-with-published-residuals` (experiment, better);
- `kotlin--winner-share-over-declared-course-mix` (experiment, better);
- `kotlin--linear-stat-to-physics-mapping` (code, unmeasurable).

The process applications were not re-anchored. They read `e1640f0` in a content worktree that
no longer exists, and they stand as the forge-time reading.

**Verified and left untouched:**
- identity-pair-via-authored-band: every pair keeps its best and worst course in all arms.
- sidegrade-two-per-tier.
- The outcome-index claim in power-rating. It held for Forza PI (the FH3 support text and an
  FM5 designer). It did not hold for GT PP, whose formula is unpublished, and the subject does
  not claim it.

**Declined:** the lap-time window as a technique. It is the parity instrument for a roster
meant to be equivalent everywhere, and it is recorded as a boundary in winner-share.

**Impact: 0 contexts.** The map dry-run joins this subject nowhere. firetv sits in a sibling's
uncommitted `projects.json` entry, and its manifest declares software-engineering, localization
and llm-observability. Return condition: firetv declares game-production, or Death Ride gets its
own manifest.

**Banked leads:**
- **Per-skill share.** Run `rosterReport` at two `ai-skills.csv` rows. Return: the next roster
  pass, or any owner report that experts favour a class.
- **Shape data's share of the residual shift.** Rerun residuals with every class on one
  reference geometry. Return: a roster change touching `drift-geometry.csv`.
- **Developed builds.** The DV3 legal-shop sweep was not rerun here. Return: a shop or cap
  change.
- **Positive-control fixture.** A deliberately dominant vehicle must trip the gate (blind lane
  only, not corroborated). Return: a second source.

Clocks: the derived per-stack window; no `refresh_by` set.
