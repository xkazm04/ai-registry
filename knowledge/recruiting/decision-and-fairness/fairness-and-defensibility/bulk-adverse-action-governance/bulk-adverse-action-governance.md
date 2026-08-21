---
layer: golden-path
type: golden-path
subject: bulk-adverse-action-governance
status: forged
use_when: [rejecting a cohort of candidates in one action, designing a bulk reject or auto-reject wave, deciding where the human approval gate sits in a batch pipeline, making a cutoff reproducible or an adverse action reversible]
techniques:
  - preview-then-approve-the-signed-set
  - cohort-drift-forces-a-fresh-review
  - tie-safe-cutoff-resolved-toward-the-candidate
  - unscored-excluded-never-coerced
  - small-cohort-floor-with-no-silent-exemption
  - reversal-queue-that-reads-the-sealed-reason
---

# Bulk adverse action governance

Rejecting one person is a decision. Rejecting eighty people in one click is a
*mechanism*, and the difference is not size — it is that a mechanism has no judgment in
it anywhere except at the moment somebody approves it. Everything this subject teaches
follows from that: if the only human judgment in a bulk rejection is one approval event,
then the entire defensibility of eighty adverse outcomes rests on three properties of
that one event.

1. **The set the human reviewed is the set the system committed.** Not a set of the same
   size. Not a set recomputed from the same rule. The same people.
2. **The cutoff that produced the set is reproducible from the data alone** — anyone
   holding the scores can re-derive who fell inside it, without knowing what order the
   records arrived in, who ran the wave, or what the pool looked like an hour earlier.
3. **The action is reversible, and the reversal reads back the reason that was sealed.**

Miss the first and the human approved a number, not people. Miss the second and you
cannot answer "why this person and not that one" a year later, which is the only
question that ever gets asked. Miss the third and every defect you ship is permanent.

This subject owns the *mechanics of acting on many at once*. It does not own the prior
question of who may be subject to an unattended adverse action in the first place —
which cohorts are shielded, which machine verdicts are routable at all, what happens to
an unclassifiable person. That is the automated-screening fairness-gate seam, and a bulk
tool must call through those gates rather than around them: a batch path is the single
most common way a system reaches the apply boundary without passing the gate that guards
it. Nor does it own whether the score deserves to be acted on: the validity of the
ranking, its calibration, and the clean holdout arm that lets you measure a screener
without grading it on its own rejections belong to the score-calibration seam. One
ordering rule crosses that seam and belongs here: if a holdout spares part of the
would-be adverse set, it is applied **before** the set is signed, so the human approves
the post-holdout set and the commit re-derives it identically. Assume otherwise that the
score is fit to act on and the cohort is permitted; this subject is about not corrupting
a sound decision in the act of executing it eighty times.

## Why bulk is a category change, not a volume change

A single rejection that goes wrong is an error. The same error executed across a cohort
is a **pattern**, and patterns are what discrimination analysis detects, what regulators
subpoena, and what a claimant's counsel puts in front of a court. Three properties flip
at bulk:

- **Defects multiply and correlate.** A one-off mistake is noise. A rule mistake applied
  to a wave hits everyone the rule mis-handles, and those people are rarely randomly
  distributed — a coercion bug that punishes unscored candidates punishes exactly the
  candidates whose evidence was hardest to parse, which is not a neutral group.
- **The oversight budget per person collapses.** A recruiter reviewing one rejection
  reads the file. The same recruiter reviewing a hundred is, by item twenty, matching on
  surface features. Studies of high-volume review consistently find per-item attention
  falling to a few seconds and override rates falling below one percent — an oversight
  step with a sub-one-percent override rate is not oversight, it is a signature block.
- **Reversal gets expensive and therefore does not happen.** One mistaken rejection is
  undone with an apology; eighty are undone with a project, and projects get
  deprioritized. Reversibility has to be a cheap standing mechanism, built before the
  first wave, or it will not exist when it is needed.

## The naive reading and its four failures

The naive bulk reject is: compute the bottom slice, show it, ask "are you sure?",
recompute, write the rejections. It fails four ways.

**It approves a count, not a set.** "Reject the bottom 20" is a rule, and a rule
re-evaluated at commit time is a different set from the one on screen the moment
anything moves. The human consented to a rule; the system executed on people. The fix is
to make the approval token carry the identity of the reviewed set — a signature over the
exact members — and to refuse the commit if what the commit would touch is not byte-for-
byte what was signed.

**It has no undecided input state.** Scores arrive missing: a parse failed, a run was
degraded, a candidate applied after the wave was scored. The naive code writes
`score ?? 0` and moves on. That single defaulting expression converts *we did not
measure this person* into *this person measured worst*, which then passes the threshold
test, ranks at the bottom of the cohort, and seals a fabricated number into an immutable
adverse record. The unmeasured must be a distinct state, excluded from the ranked cohort
and surfaced by name.

**Its boundary is order-dependent.** A stable sort over scores with ties in them breaks
those ties by whatever order the records came out of storage — arrival order, insertion
order, a join's plan. Two candidates with identical scores then receive opposite
irreversible outcomes, and the record's only available explanation is "one applied
first". That is not a reason a system may give a person, and it is not reproducible: run
the same wave tomorrow against the same numbers and the boundary moves.

**It is terminal.** The rejection writes, the letters send, the pipeline entry closes,
and there is no path back that preserves who did what. When a reinstatement does happen
it is done by editing the record, which silently leaves the machine's attribution in
place — so the audit trail says the automation reinstated the person, and the one thing
an accountability record may never get wrong is who is accountable.

## The reviewed set, the signed set, and the committed set

Hold these three apart; most bulk bugs are a conflation of two of them.

- The **reviewed set** is what a human read: names, per-person reasons, the score, and
  the boundary that put each one inside.
- The **signed set** is the machine-readable identity of that reviewed set, produced at
  preview time and carried by the approval.
- The **committed set** is what the write actually touches.

The invariant is `committed ⊆ signed = reviewed`, with the subset relation allowed only
in the candidate's favour — a person removed by a late shield, a hold, or a withdrawal
falls out of the commit and never falls in. Additions are always a fresh review, never a
merge, and this is the whole content of drift handling: the pool moved, so the mandate
expired.

The narrowing is not a licence to write "whatever is still valid". Each per-person write
carries the state it was previewed against and is refused at the row if that state moved
— so a candidate a recruiter advanced by hand during the review window is left untouched
rather than rejected, and the skipped row is reported by name in the committed view with
its own outcome. A wave whose commit differs from its approved preview is legitimate
only in that direction and only when every difference is visible per row.

Signing the set and refusing on drift also removes the temptation to make the preview
"live". A preview that quietly re-derives as the pool changes feels helpful and is
exactly the failure: the reviewer's attention was captured at one instant and the system
must treat that instant as the boundary of their consent.

## What makes review meaningful rather than nominal

Regulatory doctrine on human oversight has converged on a test that is useful even where
no regulator is watching: involvement counts only if the reviewer *could have reached a
different outcome*, considered the individual circumstances, and acted after the
automated output rather than merely upstream of it. Sign-off by somebody with no
practical ability to override is treated as no human involvement at all. Three design
consequences follow, and none of them is about policy text.

**The interface must make the individual visible inside the aggregate.** A flat list of
eighty names produces the click-through failure. Grouping the cohort by the *reason* each
member is being rejected restores judgment: the reviewer sees "forty-one below the score
floor, nine missing a required credential, six withdrew" and can act on a group whose
reason they disagree with without reading eighty files. Groups are also where systematic
defects become visible — a reason bucket that is suddenly three times its usual size is a
rule change nobody announced.

**The reviewer must be able to remove individuals, and removal must survive to commit.**
An oversight step that offers only approve-all and cancel-all is an alarm, not a control.
Per-person exclusion is the mechanism that makes the approval a decision, and the signed
set is what carries the exclusions through to the write.

**The preview must disclose what the reviewer cannot see in a name and a number.** Three
disclosures earn their space on every row: the *effective* threshold this person was
judged against when it differs from the one displayed in the rule — otherwise a row that
sits above the visible setting appears to have moved for no reason; whether the score
predates a change to the role definition it was scored against, which informs the review
without blocking it; and whether the score is a measurement at all. Each is a fact about
the basis of this individual's outcome, which is exactly what individual consideration
means.

Design against automation bias directly: keep the wave small enough to be read, make the
default action nothing, put the spared set on screen next to the rejected set (a
reviewer who never sees who was *kept* cannot judge where the boundary sits), and never
let a wave be scheduled to fire unattended. An unattended process queues work for a
human; it does not execute an adverse outcome.

## Making the boundary reproducible

A bulk cutoff has to be re-derivable from the scores alone, months later, by someone with
no access to the original session. That rules out three tempting designs: a boundary that
depends on record order, a boundary that depends on how many people happened to be in the
pool at that second when the rule was expressed as a fraction, and a boundary that
depends on floating-point comparison of scores that were rendered to the reviewer rounded.

Rules that survive:

- **Compare at the precision you display**, and round a proportional window in a
  documented direction that is stated in the record. "The bottom fifteen percent" of 43
  people is not an integer, and which way that rounds is a decision about people — not an
  artifact of a language's default.
- **Never split a tied score.** A run of identical scores at the boundary is resolved as
  a unit, and toward the candidate: the window shrinks to the lower edge of the run,
  sparing all of it. Expanding to the upper edge enlarges an irreversible adverse action
  to satisfy a target count, which inverts the direction uncertainty must resolve.
- **Let the count be an outcome, not a promise.** Tie-safety means a request for twenty
  may reject seventeen. Show the shortfall with its cause, or someone will "fix" it.

## Floors, exemptions, and the small cohort

Two opposite failures live at small pool sizes. A percentage window rounds to zero, so a
recruiter who switched on an automated bottom-slice rejection finds it silently doing
nothing for every small role — the setting reads as active and is not, which is the worst
state a governance control can be in. So the window floors at one candidate in any
non-empty pool. But the converse is just as real: a cohort of six cannot support an
adverse-impact statistic, so an automated action on six people is unmeasurable by
definition, and that has to be stated on the preview rather than inferred from a clean
disparity report that was computed on nothing. A floor makes the control honest; it does
not make the action measurable.

Role-family overrides belong in this same discussion. Different role families genuinely
warrant different floors, and per-family overrides resolving to one effective floor at
decision time are the right structure — provided the effective value is what gets
recorded, not the family name, so the record answers "what floor applied to this person"
without a lookup against a configuration that has since changed.

## Reversibility as a standing mechanism

The reconsider path is not a courtesy feature; it is what keeps a bulk action from being
a bulk irreversible action, and its design has three load-bearing rules.

**Only automated adverse outcomes enter the queue.** A rejection a human deliberately
made is a decision, and sweeping it into a reconsideration backlog both insults the
decision and floods the queue until nobody reads it. The queue's value is that
everything in it was decided by a mechanism.

**The reversal reads back the sealed reason.** The person reconsidering must see the
exact reason text that was written at rejection time, in the words the record holds —
not a re-derived reason, not a fresh model call, and not a paraphrase. A re-derivation
answers "what would we decide now", which is a different question and usually a
flattering one.

**Reinstatement seals to the reversing human and never inherits the machine's actor.**
Attribution may be downgraded toward the automated process when the record is unclear; it
may never be upgraded, and a human's reversal is a new decision with a new actor, not an
amendment of the old one. The original adverse record stays, marked reversed. Deleting it
makes the pattern disappear from exactly the analysis that exists to find patterns.

Where the reversal must un-send something already delivered — a rejection letter, a
withdrawn portal status — the delivery mechanics belong to the platform-engineering seam;
what belongs here is that the outbound step is the *last* one and is severable, so the
window between commit and delivery is a real window a reversal can land in.

## What a principal holds true

- The unit of consent in a bulk action is a set of people, not a rule and not a count.
- A boundary that is not reproducible from the data is not a boundary; it is an anecdote.
- The unmeasured are excluded and named, never coerced into the worst value.
- Every tie at an irreversible cutoff is resolved as a group, toward the candidate.
- A control that silently does nothing on small pools is worse than an absent control.
- Reversal is cheap and standing, or it is theoretical.
- Nothing about the batch path may be reachable without the gates the single-candidate
  path passes through.
