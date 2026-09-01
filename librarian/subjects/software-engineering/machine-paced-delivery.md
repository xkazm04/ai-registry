---
subject: machine-paced-delivery
domain: software-engineering
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# machine-paced-delivery

First touch: [[2026-08-27-managing-15-agents-solo-founder]], intake of a
first-party practitioner dialogue (two solo founders comparing their own agent
fleets). Gained `human-gate-capacity` (6 techniques now). Golden path amended in
three places: the opening enumeration, a new section after `proposal-not-push`,
and the `hitl-approval` boundary line.

## What the gap actually was

Not an omission. `proposal-not-push` already states *at machine pace the
reviewer is the bottleneck* - the subject knew. The gap was the **asymmetry**
between how the two bottlenecks are treated: the machine one gets four measures,
distribution discipline, denominators and an ordered demand-reduction section;
the human one gets one sentence, no capacity model, and only per-item slimming.
The subject scaled its first server against machine-paced arrival and routed the
whole output into a second server whose rate was never written down.

Generalizes, and this is the part worth carrying: **a constraint stated in prose
in one technique and modelled thoroughly in another is a finding shaped like an
asymmetry.** Slug maps cannot see it and a summary cannot see it. Only opening
both files does.

## Boundary, as now written in both directions

- `hitl-approval` / `review-queues` - whether a **single** decision can be made
  well: the surface, the context in place, honest batching by homogeneity.
- `machine-paced-delivery` / `human-gate-capacity` - the **rate** at which
  decisions are demanded, and whether it is one a person can meet.

A perfect queue with an unsurvivable arrival rate still launders blind
approvals. `review-queues` names that hazard; it does not own the cause.

## Open leads (banked, convergence rule applies)

- **Unattended capacity buys defect work, never selection.** Both practitioners
  converged on it unprompted, which is in-source convergence and not the
  cross-run kind. This is what would raise `human-gate-capacity` from technique
  to doctrine - it says what the freed capacity is *for*, where the technique
  currently only says to reduce arrival. Return when a second, independent
  source from another run reaches the same rule. Untriaged, not declined.
- **The two mechanisms that instantiate the technique's levers** sit untriaged
  in the same source note: risk-scoring a change so only above-threshold items
  reach a human (lever three), and bounding the review loop plus approving an
  artifact cheaper than the diff (lever two). Both attach to
  `human-gate-capacity` rather than competing with it. The second carries its
  own measured cost boundary in-source - the practitioner who tried the recorded
  walkthrough could not make it run without exhausting the session budget.
- **`verification-throughput-as-constraint`'s prioritization rule is stated for
  the runner queue only** - "human-authored work outranks machine-authored work"
  governs admission to CI. Nobody has stated the ordering rule at the human gate,
  which is where it now binds. Not written, because no source has said anything
  about it yet.

## Hazard for a later run

`stage: solo` on `human-gate-capacity` is a floor claim, and the golden path
argues the subject's floor is one person. If a future reconcile puts this
subject against a large-team tree, check whether the independence section still
reads correctly there - it is written from the one-person case outward, and the
team case may want the inverse framing.

## 2026-08-28 - intake, ai-literacy-superpowers Concepts batch

Amended `human-gate-capacity` (landed yesterday) with the case its own floor
creates: at one person and a fleet, the four measures - arrival, dwell, backlog age,
post-merge repair - describe the individual who is the queue, and the overload
signature is a claim about their state. New section before the decision rules:
count never score (the ego-depletion account is d=0.04 in the 2016 RRR; task-switching
cost and vigilance decrement are what is robust), advisory and local (never a
persisted assessment of the person), and the stop decided before the session because
the metacognition that would notice fatigue draws on the capacity being spent. Two
decision rules added. Source: [[2026-08-28-ai-literacy-superpowers-concepts]] rows 12
and 25, corroborated from training data rather than the page.

Still owed from yesterday: the subject has no application for `human-gate-capacity`;
the measures it prescribes have not been taken on any connected tree. The new Phase 8
paired-proof rule makes that the shape of the next X-lane run here.
## 2026-08-29 - second sighting of the thesis

[[2026-08-29-ai-native-sdlc-and-ci-on-call]]: a vendor SDLC playbook opens on the
same thesis `human-gate-capacity` landed on 2026-08-27 - build collapses, the
human-speed stages become the constraint, add parallel sessions only while review
keeps up. Catch at technique level; banked as a **law lead** (second sighting, same
bundle both times). Return condition: a third sighting in a different bundle.

[[2026-08-31-remeda]]: intake of a utility library's repository, mined for its
`.agents/` + `.claude/` tree rather than its library. Gained **two techniques**
(8 now) and an application. Golden path amended in three places: two new prose
sections and the technique list.

`stake-before-merit` is the **missing-stage** shape again, and the stage is
upstream of everything the subject models. `human-gate-capacity` names demand
reduction as the only lever and then lists four - send fewer changes, cheaper
verdicts, narrower classes, stated service level - **every one of which assumes
the party feeling the overload generates the arrival**. It says so outright ("a
decision the team is already making"). At an outward-facing gate none of them is
reachable, and the subject had no other lever to offer. Two things the source
located without articulating: the ration was an *accident* (producing a plausible
change used to be expensive, so submission carried evidence of investment) that
nobody wrote down, so nothing announced its removal; and a merit filter cannot
replace it, because deciding whether a change is worth reviewing means reviewing
it - the predicate spends the resource it protects.

`mutating-local-gates` is a **boundary against another bundle's rule**, and the
boundary is inside this bundle's own lane. `hook-hygiene` states a flat
prohibition ("Hooks observe; they never mutate") with one carve-out, the
editor-on-save loop. The agent turn boundary is a third position it was never
written against, and checking its three contracts one at a time rather than
inheriting the verdict gives two of three transferring - which is what made this
a technique rather than an exception. Named, not linked around: the commit path
keeps the prohibition intact and this file says so.

## The apply step re-drafted the technique, twice

Worth recording because it is a first for this subject and arguably for the
method. `mutating-local-gates` was drafted claiming *mutation* creates a turn-end
gate's termination contract. The seam - a managed project's own turn-end gate -
neither mutates nor blocks and **still** carries a re-entry guard, because its
advisory exit re-enters the model's loop. Draft 2 said *blocking* creates it; the
same file refuted that in its own header. The landed version carries a three-tier
ladder (advisory / blocking / mutating) and names the advisory tier as the one
most likely to ship unguarded, because it looks harmless.

Generalizes: **a technique written from a single source is a hypothesis, and the
seam is the first thing in the pipeline that can disagree with it.** Phase 7.5 is
described as validation; here it was a drafting instrument.

Second corroboration from the same seam, for the liveness paragraph: that gate
detected nothing for its entire life - 1,136 Edit/Write calls across 31
transcripts, zero detections - and ran green the whole time, because its
turn-boundary predicate broke on line one. It independently reached
`gate-liveness`'s three-state contract afterwards, which is corroboration for the
standard rather than an application of it.

## 2026-08-31 - `/intake` (run `intake-ripgrep-0831`)

Source: the same search-tool repository, for its `AI_POLICY.md` and
`CONTRIBUTING.md`. Amended `stake-before-merit` with a channel split; the
subject gains one application (`process--stake-before-merit`) and no new
technique.

**This was a contradiction, and the contradiction is why it was worth taking.**
`stake-before-merit` closes its central argument with "the distinction is
authorship of the accountability, **not** authorship of the text" - and the
source's policy draws precisely that denied distinction, by channel: generated
code is welcome, generated replies to maintainers may be hidden without notice.
The technique is right that stake is *asked for* at admission; it is only
*tested* in the review round trip the same technique separately names as the
expensive half, and the reviewer's question there is a probe of comprehension
rather than a request for text. The asymmetry is structural: the diff has
instruments that do not care who wrote it, while the conversation has only the
reviewer's attention - the scarce server the whole technique exists to protect.
So generated discourse is the one contribution class that consumes the
protected resource while adding nothing to it.

The denied-symmetry hunt found this. That is now three consecutive runs where a
technique's explicit denial of a distinction was the highest-yield thing to
test, and it is worth treating as the first hunt rather than the third.

The amendment kept the technique's own guardrail intact: it restricts a
*channel*, never tooling, and it carries a translation carve-out, because the
rule otherwise falls hardest on contributors working in a second language and
becomes a language test nobody intended.

**Contention note.** `intake-yt-tgbj-0831` held this subject concurrently and
was editing the golden path and `human-gate-capacity.md` while this run amended
`stake-before-merit.md`. Contended subject, disjoint files - no `content` lock
was needed and none was taken.

## 2026-08-31 - intake, a two-founder software-factory dialogue

[[2026-08-31-boundary-software-factory]]. **The asymmetry shape a third time**, and
this note's own generalization predicted it: size is stated in prose in
`proposal-not-push` ("the size at which review degrades to skimming is lower than
people admit") and rate is modelled in `human-gate-capacity` with four measures, a
distribution discipline and an ordered lever ladder. What made this one different
from the first two is that the corpus had **already written the missing half and
filed it elsewhere**: `batch-size-thresholds` in `delivery-analytics` names its top
size bucket *approval is a formality* - the rubber stamp, at size - and nothing
connected it to the gate that models the rubber stamp. Worth carrying: a near-empty
map over a concept is sometimes not a hole and not a seam, but **material we own in
a measurement subject and never lifted into the decision subject that needs it**.

Amendment to `human-gate-capacity` (no new technique, so the `techniques:` list was
untouched - which is what made this landable while two siblings held the subject).
It carries the discriminator (rising post-merge repair with *low* arrival is the
size case), the inverted remedy (this one *raises* arrival), the honest split
predicate borrowed from `proposal-not-push` (independently mergeable and
independently worth merging - because `batch-size-thresholds` already warns that
splitting is the canonical gameable move), and a correction to a decision rule:
per-item slimming is a constant factor for *shape* work and not for size.

**The apply step re-drafted the technique again - that is now three times on this
subject.** First application for `human-gate-capacity`, which discharges the debt
recorded here on 2026-08-28. Arm B by changed lines looked like a clean 1.42x
confirmation; the control destroyed it. Post-merge repair tracks *files touched*
monotonically (34% to 92%) and, holding files fixed, the line gradient vanishes and
inverts in the single-file band. Larger changes touch more files, so a line-based
size measure reproduces the files result and confirms itself. The technique gained
the condition: state the unit, validate it against the other candidate once. The
owning table leaves the unit open and defaults to lines.

Bound recorded in the application rather than smoothed over: the measured tree has
no human merge gate on that population, so the premise is corroborated and the
mechanism is unobserved. Return condition is a tree with recorded review events -
which would also give this subject the two measures (dwell, backlog age) that no git
history can supply.

## Still owed here

- `verification-throughput-as-constraint`'s prioritization rule at the human gate -
  unchanged from 2026-08-27, still nothing written.
- The **law lead** is at its second sighting (2026-08-29) and this run did not
  advance it; the size finding is a different root, not a third sighting of the
  thesis.
