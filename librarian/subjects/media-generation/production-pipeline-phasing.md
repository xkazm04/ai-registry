---
subject: production-pipeline-phasing
domain: media-generation
last_touched: 2026-09-01
dry_streak: 0
---

# production-pipeline-phasing

First note: [[2026-08-26-stop-building-ai-slop]] - /intake run 22. Subject predates the notes.

## State

5 techniques. The cheap-probe rule now runs on two axes (fidelity and medium) rather than one.

## 2026-08-26 - /intake run 22

- Amendment to `asset-vs-disposable-render`: new section "A probe may change medium, and the crossing is lossy". Found by testing an enumeration - the technique's two probe examples ("a fraction of final resolution", "a short excerpt for a voice audition") are both same-medium scalar reductions, so the file read probe fidelity as one axis. The previsualization discipline runs a rung ladder (stills / stills plus timing / functional motion without materials / final), and each rung is cheap *because* it dropped a dimension. The rule that was missing is the consequence: a passed probe is `unmeasured-is-not-pass` for every dimension its medium cannot carry.
- Second bullet ("probe the whole span, not its opening") came from the source's demonstrated failure, not its advice: a six-frame sketch of a sequence's opening passed, and the render broke past the probed span. Cheapness scales with span covered, so partial coverage is the cross-medium probe's native temptation.
- One sentence added to the golden path's cheap-probe paragraph so the fidelity-only framing does not survive there.

## Open leads

- `frame-direction` owns `motion-intent-authoring` (motion authored with composition, before any renderer exists), but nothing yet owns *probing* that motion intent before the expensive render. The phase enumeration - research settles what is true, script what is said, visual selection what is seen, scoring what is heard, the cut how it lands - has no stage that settles what *moves*. Return when a run touches a motion-generation subject, and check whether the phase list needs the rung rather than another technique.

## 2026-08-31 - intake, OpenMontage (delivery-promise-lock)

Gained `delivery-promise-lock` from [[../../sources/2026-08-31-openmontage]], an
agent-orchestrated video production repo (176x read fraction; the landing page is 0.6%
of the tree).

Found by the enumeration hunt, not by the source. The golden path already states that a
*probe* which rehearses an expensive medium in a cheaper one leaves the dropped
dimension "unsettled, never approved". Nothing owned the case where the **delivery**
drops it - and that case has no later phase to settle in, so the honest states are halt
or a recorded downgrade. The sharp half is a metric-design rule the corpus did not
carry: the cheapest way to satisfy a quality ratio is to reclassify cheap output into
its numerator, so the excluded near-miss category is enumerated adversarially rather
than left to a predicate.

`generative-provider-routing/non-silent-elimination` holds the same shape one level
down - per-request, per-vendor field honouring - and was read before the home was
chosen. The two are neighbours, not duplicates: that one governs a call, this one
governs a deliverable.

Applied to `gravity` as a **simulation**, verdict **better**, proof `structural-only`.
That tree's `discipline` field is the promise and is locked before the template - the
harder half, implemented independently and well - but carries no rules and is validated
nowhere. Second structural fact worth keeping: its phase-state vocabulary uses one
token for "not required" and "not obtained", and that token ranks best in the
worst-news-first merge.

### Still open

The anti-substitution ratio - the technique's sharpest claim - has never been measured.
No project in the fleet assembles a cut from mixed motion and slide grammar, so the
half that matters most is corroborated from the source tree and simulated, not tested.

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

One lead (systedo-case). `long-run-as-background-job` gains the lifetime rule: a persisted
job whose result is not persisted is a settled lie - give the result at least the job's
lifetime, or make the read reconcile the two out loud (a state with a reason, never a silent
downgrade); reconcile at the delete where survivors are known; the reload correction only
reaches jobs found running. Corroborated by two task systems whose task record and result
retention run on independent clocks. Application `node--long-run-as-background-job` at
systedo-case `6279066f` (both designs present). The bundle does not declare `next` as a
stack, so the application is `node`. Proposal: the general form belongs in software-
engineering `job-coordination`.
