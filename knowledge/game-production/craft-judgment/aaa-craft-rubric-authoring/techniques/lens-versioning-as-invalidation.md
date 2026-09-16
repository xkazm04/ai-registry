---
layer: technique
type: technique
subject: aaa-craft-rubric-authoring
technique: lens-versioning-as-invalidation
status: forged
laws: [a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass, law-and-check-share-one-source]
shared_with: []
use_when: [changing a criterion threshold or a level anchor, comparing grades across time, a rubric edit is about to re-mean historical verdicts, a judge prompt injects neighbouring artifacts or reviewer feedback and the verdict records neither]
---

# The lens version is the invalidation switch

Every craft rubric carries a version, every verdict records the version it was scored
under, and a verdict whose version is older than the current lens is reported as
**ungauged** rather than as a grade. That is the whole mechanism, and it exists for one
reason: editing a rubric silently re-means every score ever produced by it. The
numbers do not move — their meaning does, invisibly, and the historical record becomes
a set of statements nobody can interpret.

## Why a verdict cannot outlive its rubric

A grade is a compound claim: *this artifact, judged against this instrument, landed
here*. Change the instrument and only two of the three terms survive. Downstream the
damage is quiet and compounding:

- **Trends become fiction.** A quality line that crosses a rubric edit shows a step
  nobody caused, and teams will explain it — wrongly — as a change in the work.
- **Gates admit what they would now reject.** A stored pass from a laxer version keeps
  clearing a gate that has since tightened.
- **Disputes become unresolvable.** "Why did this score higher than that?" has no
  answer once the two were scored by different documents that share a name.

Projecting the stale verdict as ungauged, rather than deleting it, is the survivable
outcome. The verdict is still evidence about the past and should be readable as such.
What it must never be is readable as a current pass. An unjudged artifact and a
judged-and-passed artifact are different epistemic states; a rubric edit can remove current standing without erasing the historical
judgment. Display stale-under-current-policy separately from never judged.

## What counts as a version bump

Bump when the meaning of a grade changes. In practice:

**Always bump for** — adding, removing or restating a criterion; changing a threshold,
a unit, or the measurement basis behind one; changing a level anchor; adding or
removing a disqualifier; changing a ceiling or its classification; changing which
deliverable classes route to this lens.

**Separate editorial revisions from semantic policy versions.** Retain an exact
content digest for every executed instrument. Reordering or clarifying prompts
can change model judgments even if the intended bars are unchanged; validate
compatibility before treating such edits as non-invalidating. The test is mechanical: *could this
edit change the grade of any artifact that has already been scored?* If yes, bump. If
you are unsure, bump; a spurious ungauged is cheap and a stale pass is not.

Version the lens, not the whole rubric corpus. One document's edit must not invalidate
the verdicts of unrelated deliverable classes — that is an invalidation storm, and the
first thing a team does after one is stop trusting the ungauged state.

## The mechanics that make it work

- **The version lives with the lens, and the check reads it from there.** One source.
  A version constant maintained separately from the document it describes will drift,
  and the drift is undetectable from either side — the document changes, the constant
  does not, and every stale verdict keeps rendering as current. Where a system genuinely
  needs the version in a second place — a typed table the scoring path reads without
  parsing prose — that duplicate is only safe if an automated check pins the two
  together and fails when they diverge. An unpinned duplicate is worse than no version
  at all, because it produces confident invalidation decisions from a stale number.
- **Every verdict stores the version it was scored under.** Storing "current" is
  storing nothing.
- **Comparison is version-scoped by default.** Any aggregate, trend or ranking spans a
  single lens version unless someone explicitly asks otherwise, and a mixed-version
  aggregate is labelled as one.
- **Re-scoring is a batch operation with a cost.** Publishing a new version means
  deciding, per class, whether to re-score the backlog or let it stand as ungauged.
  Both are legitimate; what is not legitimate is leaving the question unanswered and
  letting old verdicts drift forward.
- **Keep old versions readable.** A verdict from three versions back is only
  interpretable if the document that produced it still exists. Retire lens versions,
  never delete them.

## Interaction with content binding

Two independent invalidation axes exist and both must be live. A verdict dies when the
**artifact** changes — that is the content-binding concern belonging to the neighbouring
subject of verdict integrity, and it is enforced by a fingerprint of what was judged. A
verdict also dies when the **lens** changes, which is this technique. Implementing only
one leaves a whole class of stale passes standing: fingerprint-only misses every rubric
edit, version-only misses every artifact edit. They are cheap to run together and
neither substitutes for the other.

## Injected context: evidence or steering

A judge prompt usually carries a third kind of input besides the lens and the artifact:
material the scoring path injects around them. That might be the neighbouring artifacts
the judge must stay consistent with, the reasons a reviewer gave for rejecting earlier
items, or a list of recent decisions. Each can move a grade, so the mechanical test above
says bump. Read literally, that turns every neighbour edit and every reviewer decision
into a version change, and it produces the invalidation storm this file warns against.
Leaving the input out altogether is not safe either. The question that separates the two
cases is: **could a finding rest on this input as a fact about the artifact?**

- **Steering** shapes how the judge weighs things, but no finding can cite it. Reviewer
  taste is the typical case: "earlier items like this were turned down for being
  consultancy work" should lower the next similar item's score. It says nothing true or
  false about the item already scored. Keep steering out of the invalidation key, because
  its effect is meant to be forward-only. Still store a digest of the steering snapshot
  on every verdict, and label any ranking that spans snapshots as mixed. A verdict that
  cannot say which steering it was scored under turns every later comparison into
  guesswork.
- **Evidence** is material the judge is told to check the artifact against, so a finding
  can rest on it: "contradicts the value in the neighbouring step." When the evidence
  changes, the finding may no longer be true, and the verdict is stale in exactly the way
  an artifact edit makes it stale. The binding is **per dimension**, though, not per
  verdict. Store a digest of the context the judge read. When that digest moves,
  invalidate only the verdicts whose failing dimension is the one that reads that
  context. Every other verdict treats the change as steering.

Treating injected context as all evidence, or as all steering, fails both ways, and the
failure is large enough to measure. One store held 143 bound verdicts, each scored with a
projection of its neighbouring artifacts in the prompt. For 131 of them, a neighbour had
been modified since the judgment:

- **Full binding** would have cleared all 131, silencing 92% of the standing
  condemnations.
- **No binding**, the design as found, kept all 131 standing.
- **Per-dimension binding** marked 13. In those, the consistency dimension was the
  weakest score, and one of them condemned an off-by-one computed from a neighbour's
  value.

The count is an upper bound on drift. The store recorded no digest of the projection it
scored against, so drift could only be measured from modification times, and a
neighbour edit need not have changed the projection. That missing record is the rule
behind the numbers: **capture the context digest at judgment time, because nothing
reconstructs it afterwards.**

Keeping steering out of the key does not remove the lens axis. A system that
deliberately kept reviewer feedback out of its validity key had also left out the model
identity and the judge's scoring scale. Changing either one silently re-meant every score,
which is the ordinary stale-lens failure, not a steering case. Check each excluded input
against the steering test on its own.

## Decision rules

- **When a bump would invalidate more than you can re-score, bump anyway and stage the
  re-scoring.** The alternative is knowingly serving grades under a document that no
  longer exists.
- **When an edit is urgent and small, it is still a bump.** Urgency is the condition
  under which unversioned edits happen, and it is the condition under which they do the
  most damage.
- **When a lens is edited during an active scoring run, pin the complete instrument and its referenced policy at run start, and
  record that exact snapshot. A starting version label over live mutable text
  does not prevent a mixed run.** A half-migrated batch is worse than a wholly stale one, because
  nothing in the data distinguishes the halves.
- **Never reuse a version identifier.** A version whose contents changed is a version
  that means two things.

## When not to use it

- **For instruments with no persisted verdicts.** An ad-hoc review someone runs and
  reads once has nothing to invalidate; versioning it is bookkeeping without a
  beneficiary.
- **During the pilot of a new lens.** While the document is being calibrated against
  known-good and known-bad artifacts it will change daily, and every verdict from that
  period is a calibration observation rather than a production grade. Mark the whole
  pilot as pre-release, but bind each calibration observation to a distinct
  revision or digest so pilot comparisons remain interpretable.
