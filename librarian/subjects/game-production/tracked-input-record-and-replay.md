---
domain: game-production
subject: tracked-input-record-and-replay
last_touched: 2026-10-21
touched_by: deepen
dry_streak: 0
depth: L2
---

# tracked-input-record-and-replay

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-21 - `/intake apply headless-replay-against-the-rules` (run `intake-apply-hrar-1021`)

This is the first reconciliation against real code. The subject was founded on 2026-10-17
(`cdd41f53`) as a text-only draft.

**Tree.** `mage-arena-vr` `master` at `27e1633`, read in a detached worktree. The project
row is `d25ecc7` on origin master (`.ai/` only). The primary checkout was left untouched: it
is behind origin and carries owner WIP.

**Mode.** `experiment`, a static audit of oracle origin. The verdict is `not-better` on the
technique as written, so the technique gained a boundary section. All 33 automation tests in
the five gesture suites were classified. Of the 27 that carry a rule verdict: 18 authored,
2 pinned, 1 two-sided ratchet, 6 differential (the shipped rule on modelled 30/25 Hz held or
extrapolated streams against the same rule at 72 Hz). As written, the circularity rule
demotes all 6 differentials. They are input-path invariance checks, the pre-device form of
this technique's own divergence section, so the floor fell.

**Amendment, a boundary rather than a mechanism.** A differential stays a check if it has
two things: an anchor that fails when the reference is empty, and a known-miss list that
fails in both directions. An oracle that recomputes the rule's own threshold is a copy of
the rule. A pinned snapshot is legitimate as a refactor guard, but it is named as a snapshot.

**Gaps filed in the project, not built.** No engine build was run in this pass.
- The blink, sigil-line and staff differentials have no reference guard.
- No output names the clip set or the rules revision, and the corpus is regenerated and
  gitignored.
- Four ward oracles compute the expected onset from the rule's own speed constant.

**Refuted on review:** "the staff rule has no reject clip". A reader limited to five suites
reported none, and the defence suite carries "mudra does not plant". A rule's coverage is the
union over every suite that drives it.

**The evidence gate is still owed.** Every clip is synthetic, all 111 of them. Replay versus
person cannot be measured until the project's V2 window records real hands (2026-11-05 to
11-08). Return then and run the divergence half and the corpus-provenance check of
`versioned-input-corpus`. The clip header carries `source` but no runtime, device class or
rules revision.

Not applied this run: `versioned-input-corpus`, `proxy-corpus-miss-ledger`. The project's
`KnownModelMisses` tables are a rule-level miss ledger, and they are the nearest seam for the
second.

### 2026-10-21 - `/deepen game-production/tracked-input-record-and-replay` (run `trr-deepen-1021`)

A Curator dispatch on "3 techniques (design floor is 4)". Volatile scan: no vendor-set facts.
There were three lanes. A web lane read vendor record and playback docs for raw-sensor, pose,
event and robotics-log recorders. A counter-evidence lane attacked five claims, and a blind
lane worked from training data only.

**Landed (`7e467e68`).** New technique `record-below-the-rule`, earned on convergence. The web
lane and the blind lane each reached, independently, the rule that the recording layer decides
which changes a replay can regress. Raw sensor re-runs tracking, so its assertions need
tolerances. Poses bypass the tracker. Decided values bypass the recogniser. The golden path
gained a paragraph on this, a distinction (a measured field versus a decided field) and a
naive-build bullet.

**Counter-evidence.** Nothing was refuted. The circularity rule in
`headless-replay-against-the-rules` was qualified to "a change detector, not a correctness
check", after the characterization-test literature. Two further points confirmed claims
already in the subject and changed nothing. A runtime update can change hand latency with no
app change, which confirms "an older runtime is a different corpus". Raw-sensor playback is
documented as differing from the recording.

**Applied.** mage-arena-vr at `a31989a`, experiment, `better`. Four rules gate on
runtime-decided fields: sigil style A pen state, staff grip, the system gate and session
confidence. The synthetic corpus places the thumb from the authored pinch, and 0 of 8,995
pen-down frames over 113 clips have the tips apart (seeded control: 5 of 5 detected). Project
change `b0ce3c7` adds a Field layers section to `docs/CLIP-SCHEMA.md`, and the row is at
`c1b94cc`. Both were pushed from a detached worktree, and the primary checkout was untouched
(behind by 76, with owner WIP).

**Impact.** mage-arena-vr's bridge declares no domains, so it has no registry map: no pairs
and no stale verdicts. No fleet project's committed map names this subject. The join exists
only through the applications.

**Return conditions.**
- V2 window, 2026-11-05 to 11-08. For each recorded clip, count the frames where `pinch` says
  contact and the tips are apart, and the reverse. That count is the first proxy-miss row for
  pinch.
- Run the extrapolation model both ways on real clips.
- Also owed in that window: the earlier pass's divergence half and the corpus-provenance check.
- Banked, untested: the replay clock (timestamps versus one frame per update). The web lane
  found both documented. The deterministic headless timestep owns most of it, so it was not
  minted here.
