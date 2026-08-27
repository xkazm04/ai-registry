---
subject: docs-sync
domain: software-engineering
last_touched: 2026-08-27
dry_streak: 0
---

# docs-sync

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: EXTENDS.

## State

6 -> 9 techniques, 2 -> 3 applications. Golden path extended with five additive
edits and no paragraph rewritten. The three new techniques are the ones that
apply when the doc and the code it describes are in DIFFERENT checkouts, which
every existing technique in the subject had assumed away.

This subject was ranked for attention on a stale reading. The domain note of
2026-08-21 listed it as owing an application; the scan at dispatch time showed it
already carried two. The note is a record of a moment, the scan is the
instrument — the ranking was corrected before dispatch, and the subject was kept
in the wave for depth rather than for debt.

## Open leads (banked, with return conditions)

- **a signal discloses whether it can fail** (proposed law, not added). A report
  emitting several numbers where only some are enforced must label each, because
  enforced and decorative look identical from outside. Three recurrences, one of
  them in this subject's own existing `same-change-enforcement` (a hook assumed
  to be enforcing for fifteen months and never fired). Currently carried as prose
  inside `checked-vs-skipped-denominators`. Return next sweep and decide whether
  it earns an anchor or stays where it is.
- **Coarse watch sets saturate.** Measured at 107 of 116 documents drifting
  (92.2%) against deliberately coarse watch paths. The upward lesson taken was
  that ranking by change volume is what makes a saturated signal usable, and that
  narrowing the sets to suppress the number would trade triage for a dead signal.
  Worth re-measuring on a second tree before the ranking rule hardens.

## Declines

- Did not claim the content-model half of this ground. A sibling subject founded
  in the same wave owns the fields on the record and what their absence means;
  this subject owns what asks them a question and how the answer is reported when
  it could not be asked. Both workers stated the same seam independently, in the
  same words, without coordination — which is the strongest evidence available
  that the seam is real rather than negotiated.

---

## Touch 2 — 2026-08-27, `/intake` from [[../../sources/2026-08-27-openwiki-self-correcting-memory]]. Class: EXTENDS.

9 -> 11 techniques, plus two amendments inside existing files. Applications
unchanged at 3. Golden path: heading count 9 -> 11, opening paragraph extended,
two wall sections added, and the economics section's enumeration corrected from
two collectors to three.

## The finding was an asymmetry, not an omission

The subject measures what an **instrument** may claim with total rigour —
`checked-vs-skipped-denominators` alone carries three states, reason classes,
fractions on the headline, exit-code discipline and a fourth not-enumerated
population — and says nothing at all about when a **document** may advance its
own review date. That field is not decorative: wall 7's cross-repo detector
consumes it to choose which window of the other repository's history to query.
So a date advanced by a run that verified nothing moves the detector's horizon
past the changes it exists to find, and the detector goes on reporting clean
because it is now asking about a window in which nothing happened.

Neither slug mapping nor a summary could have surfaced this. Both halves
"cover" freshness; only opening both shows that one gets four measures and the
other gets a sentence. **The hunt that found it: which file MEASURES the thing
both files mention.**

The seam is stated in the golden path already and stops one step short —
`docs-content-model` owns the *shape* of the honest-metadata fields,
`docs-sync` owns *queries* over them, and **neither owned the write rule**,
which is the rule the query's correctness rests on.

## What landed

- **`earned-verification-state`** (new, wall 10) — the stamp advances only on a
  completed recheck over a non-empty population; three clean-looking runs that
  do not earn it. Durable staleness on the artifact, because a finding in a scan
  stream has a *dismiss* transition and a document in dispute for a year reads
  exactly as current as one nobody questioned. *Stale* as suspended belief with
  three resolutions — reaffirm, correct, retract — against the existing
  vocabulary's definition of stale as "actionable", which pushes the common case
  (evidence moved, claim survives) into the rewrite bucket. Binds at the
  proposition, with the cost stated: affordable for a machine-maintained corpus,
  usually not for a hand-written one, and document-level stamping stays correct
  there provided the *reporting* does not imply finer granularity.
- **`repair-rides-the-open-page`** (new, wall 11) — the third collector. The
  economics section enumerated per-change and batch plus a bad third posture;
  repair riding whatever page a worker already opened is a fourth and is what
  makes proposition-level freshness affordable, because cost then scales with
  change volume rather than corpus size. Two conditions and one permanent limit:
  detection stays exhaustive while only resolution is opportunistic; the
  deterministic walk runs **before** the no-op short-circuit, since work an
  earlier run deliberately deferred belongs to no subsequent diff; and it never
  converges on cold pages, so the batch lane stays the backstop and the cold set
  belongs in the catch-up marker's consciously-skipped list. Converging practice:
  repair-on-access in replicated stores, which needs anti-entropy for exactly the
  same reason and fails in exactly the same tail.
- **Amendment to `dated-corrections`** — "Retraction is a verb, never an
  absence." The source's whole-set reconciliation contract is right and its
  retraction signal is wrong: **omission**, which makes a worker forgetting and a
  worker deciding produce byte-identical results. That is the silent rewrite the
  technique opens by rejecting, relocated from the sentence to the set, at the
  one site where the disappearance is unobservable by construction
  (`deletion-is-not-repair`, already in the file's frontmatter). Disposes of the
  attractive counter-argument too: a durability guard proves the *write*
  completed, never that the omission was *intended*.
- **Amendment to `doc-rot-detection`** — "Proving the loop converges, not just
  that the sensor fires." Replay the source's own history through checkpoints,
  classify every claim four ways, and read the trajectory rather than the
  endpoint, because state at checkpoint N is the product of repairs at N-1.
  Written explicitly against `gate-liveness`, which is the real prior art: a
  seeded violation proves the detector fires and **cannot construct a fabricated
  claim at all**, because a seed is a known-bad input the tester wrote while
  fabrication is content the writer invented. The protocol detail that earns
  trust: the replay must contain **reverts**, the only change that tests whether
  the loop can un-stale a claim rather than only ever adding staleness.

## Honest limits

- The replay-harness amendment describes a protocol this registry has not run.
  It is written from the source's stated method and from mutation-testing
  convergence; the vendor's own percentages are deliberately **not** cited, since
  benchmark claims are the least reliable thing a vendor repository ships.
- `earned-verification-state`'s proposition-granularity section has no
  realization here. This subject's three applications are all file-granularity.
  A corpus that actually binds claims to evidence versions is the realization to
  hunt for next.

## Open leads

- **Law candidate, one sighting**: a verification stamp names what it was
  verified against. Recurs at three unrelated sites in this run alone. Return on
  a second sighting in a different bundle.
