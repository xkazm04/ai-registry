---
domain: agent-operations
subject: engine-behaviour-profiles
last_touched: 2026-10-10
touched_by: intake
dry_streak: 0
---

# engine-behaviour-profiles

Subject note. Part of [[index]]; graded against [[standard]].

First touch by `/deepen`. A single-subject run dispatched by the Curator lane on the scan
finding "3 techniques (design floor is 4)". Registry HEAD at dispatch was d93fbd78. The
primary checkout's main was 156 behind origin, so the run worked from origin/main
(2fc868d2) in a detached worktree. A clean worktree from an earlier dispatch of this
subject held no commits; nothing had reached origin.

## 2026-09-27 - a profile names the engine until the harness is crossed, dispositions expire like capabilities, the deferring engine does not always defer

**Depth rung:** L2 primary for the corrections, L3 empirical for the new technique:
- two vendor agents' own source and docs, read verbatim - the precedence line in one
  agent's base prompt, the role its repository file is injected in, its per-model prompt
  catalog; the other's memory docs;
- a local multi-model harness's per-family prompt selection;
- a terminal benchmark's cross-harness table (one model under its vendor agent and a neutral one, 6-14 points apart);
- the instruction-hierarchy paper; a cross-scaffold safety study and its counterweight;
- the correlated-errors paper; the self-preference and perplexity-bias papers;
- a vendor launch post and a cross-lab alignment exercise on release-to-release and
  sibling-model disposition shifts;
- the operator machine's own session transcripts: 13,920 of one engine, 389 of the other.

**Lanes:** four.
- A blind training-data lane.
- A web counter-evidence lane.
- A harness-source landscape lane.
- A local read of the fleet's multi-model harness checkout and session records.

**Convergence:** all four reached the harness confound independently. The blind lane
ranked it first of ten pitfalls and recalled one agent's precedence line before any search.

**Landed (55bd8787):**
- **New technique, harness-crossed-attribution.** Until a family runs through a second
  harness, or its own harness's precedence statement is removed, a profile names the
  engine - release, harness, version, wording. Read the harness first, search the field
  record, and route on the engine you will actually run.
- **Flipped: authority-conflict-disposition.** The resolution belongs to the engine and
  the wording, not the family. Added: read the harness's precedence, search the field
  record, and a family that deferred is not cleared.
- **Flipped: capability-claims-expire.** Dispositions get no longer shelf life. The
  harness version is a stamp and a fifth re-derivation trigger.
- **Flipped: golden path.** The unit is the engine; stability holds within a release, not
  across; routing keeps the mechanical stop; a same-family fallback through another
  harness is unprofiled; "fails differently" is measured, not assumed.
- **Conditioned: family-diversity-as-a-control.** A shared failure points at what the runs
  shared, harness included, and is a prior under correlated errors. A second-family judge
  reduces self-preference and does not remove it.
- **Corrected both older applications.** The authority-conflict profile is two engines,
  not two families, and the field record contradicts its deferring side. The evidence-reach
  split was within one family at one tier, so it is not a family disposition.
- **Verified and left untouched:** "fix the instruction regardless of which family you
  keep"; the mechanical stop outliving both models; withholding one-family verdicts
  rather than mixing them.

**Applied (personas, three rows):**
- **harness-crossed-attribution + authority-conflict flip: `better`, experiment.** The
  engine recorded as deferring (0 of 4 cells) force-added ignored paths in 4 sessions
  across 3 repositories, 3 still tracked. Seam: the personas Codex maintenance lane; its
  brief states no precedence for excluded paths and the shared merge path has no
  excluded-path check. Recorded as a lead, not patched.
- **capability-claims-expire flip: `better`, simulation.** The lane now pins a model
  outside the profiled set, under a harness version it does not record (event mapping
  names 0.154, the machine runs 0.157.1, the version helper is dead code). The old rule
  misses both; the new one flags both.
- **family-diversity conditions: `unapplied`.** No fleet judge pairs families on agent
  runs.

**Impact:** none. `build-registry-map --dry-run` shows no fleet map pairs a context with
this subject, so no verdict went stale. The maps read STALE from other landings; this run
did not regenerate them.

**Banked leads:**
- **personas, excluded-path stop on the owner's merge path.** Fail a branch that commits a
  path the repository's own ignore rules exclude, for both engines. Return when the
  platform owner next touches the merge gates.
- **personas, precedence in the maintenance brief.** One sentence: where the repository
  excludes a path, write it and leave it uncommitted. Return with the stop above.
- **Four real force-adds of ignored paths** (kp, systedo-case, personas x2). They are
  public trees; whether any of the material was meant to stay private is the owners'
  call. Return on the next `/hygiene` pass.
- **Runs per cell for a disposition claim.** Blind lane: roughly 20-25 runs per arm to
  separate 30% from 70%. One source, and power belongs to agent-benchmark-design; return
  when that subject is swept.

**Declined:**
- A preprint that scaffolding amplifies sycophancy: withdrawn by its author, who asked it
  not be cited.
- Cross-harness spreads from a harness survey and a second benchmark paper: not read, and
  the two disagree on one model.
- The second lab's side of the cross-lab exercise: the page answered 403; summary only.

Yield: high. dry_streak 0.

Source classes, this run. Kept:
- harness source code read raw, over the harness's own prose - one agent's prompt and its
  code disagree on the role its repository file is injected in;
- vendor docs for the vendor's own product;
- the fleet's session transcripts, read row by row after a regex.

Declined: withdrawn preprints; search-summary-only numbers.

## 2026-09-28 - fourth send, declined (run `dp-ebp-0928b`)

Declined, no pass. The Curator lane sent the finding "3 techniques (design floor is 4)" again,
this time from dispatch HEAD bd295204, which is 235 commits behind origin/main (18cf9154).
At origin the subject has had four techniques since `dp-ebp-0927` (55bd8787). The two sends
between, `dp-ebp-0927b` and `dp-ebp-0928`, recorded `idled` and added no note. No commit since
the first touch's ledger commit (740666db) changes the subject folder or this note.
`check-currency` reports agent-operations at 0 expired, 0 at-risk and 0 drift. The run records
`declined`, not `idled`: the subject has had one pass, not two dry ones. dry_streak is
unchanged; the banked leads were not re-checked. The fix belongs in the
dispatcher: read origin, and read `librarian/runs/*/result.json` for the subject before sending.

## 2026-10-10 - capability-claims-expire applied in code, a second stack (run `ap-cce-1010`)

This was an `/intake apply` run, dispatched on the scan finding "single stack (process)". Registry HEAD at
dispatch was e5babec3. No siblings were live.

**Seam hunt.** gigs is the only fleet project that declares agent-operations. Its engine
pin (a second-opinion model through a CLI harness) led to kp, which runs the gigs
pipeline. kp holds two kinds of claim about model families. The first kind is call-site
pins, which are current: they name the 5.5 releases. The second is a baked benchmark
grid, measured 2026-08-12 on the 5.0 releases. A Models > Quality board turns that grid
into a per-use-case routing recommendation with a one-click Pin. The grid stamps its
date, judge, runs per cell, cases and release ids. It stamps no harness version and no
effort tier, and nothing compares it with the releases kp runs.

**Applied: `better`, code, ab-paired** (`next--capability-claims-expire`, 9/9 anchors
held against kp).
- Arm A: a pin on a newer release of a family the grid measured read "not benchmarked",
  and the board offered to re-pin it onto the older measurement. That happened in 22 of
  22 such cells (11 use cases x 6 pins over the committed grid).
- Arm B, the technique's decision rule ("a grid older than the newest release in either
  family answers we do not currently know"): a `superseded_pin` state with no Pin
  button, 0 of 22.
- Floor: the other 44 rows are byte-identical across the arms, and the typecheck and
  i18n parity are green.
- The seam was chosen to falsify. A grid whose picks never met a newer-release pin would
  have read not-better.
- Pushed as kp 7392a7179 + ledger f673baa37, cherry-picked onto origin in a worktree
  through kp's full pre-push gate. kp's local main carries a sibling run's unpushed
  commit, and this run did not publish it.

**Structural fact.** kp already knew the newer releases, in five call-site pins and two
plan seats, and the board read none of them. The stamps were written for the grid's
reader, and nothing was written for when the grid stops being true. This supports the
technique's re-derive-on-a-trigger rule: a stamp makes a claim falsifiable, and
something still has to fire the trigger.

**Lead (kp, not landed).** The board reads only the pin. A superseded *pick* under a
default pin is still recommended: the grid's `claude-opus-5` is recommended although kp
runs `claude-opus-5-5` elsewhere. Return: when the bake records the releases kp runs,
or the grid is re-benched on the 5.5 releases. The bench runner's records carry no CLI
version either, so a harness update under an unchanged model id leaves the grid quoting
itself.

`next` was added to the agent-operations bundle's `stacks:` (the gate refused the stack
until then). dry_streak is unchanged.
