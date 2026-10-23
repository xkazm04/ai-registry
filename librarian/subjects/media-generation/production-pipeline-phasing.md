---
subject: production-pipeline-phasing
domain: media-generation
last_touched: 2026-10-21
dry_streak: 0
---

# production-pipeline-phasing

First note: [[2026-08-26-stop-building-ai-slop]] - /intake run 22. Subject predates the notes.

## State

7 techniques. The cheap-probe rule now runs on two axes (fidelity and medium) rather
than one, and the graduation gate now runs in two directions rather than one.

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

## 2026-10-21 - /intake, a sponsored video walkthrough ([[../../sources/2026-10-21-laziest-cinematic-ai-video]])

Gained `approval-reads-forward`. The subject's graduation craft reads **backward** - the
phase order is declared by what each phase settles for its successor, and
`phase-order-and-graduation` gates sign-off against "the artifact itself", meaning
against the brief that asked for it. Neither asks whether a shared upstream asset
already contains what the beats downstream of it will need. For the one class of
artifact that every later request is conditioned on - the plate, the sheet, the style
contract - that is the whole risk: the asset can answer its brief exactly and still be
unable to produce the last shot, and nothing downstream can move it.

Found by the missing-stage hunt rather than by a missing opinion, and the subject's own
strength is what hid it - a pipeline with a real graduation gate feels covered. The
source supplied the occasion, not the rule: its creator caught a plate whose only
practical sat between the figure and the lens, over a payoff built on that figure's
shadow falling the other way, and then stated the rule out loud.

Home not contested once both boundary statements were read: `cinematic-language` owns
the plate as a reference artifact (`scene-grammar-progression`) and owns the lighting
dials, and neither owns approval.

Applied to `pof` as a **simulation**, verdict **better**, seam chosen to falsify. The
forward list ran over a seven-beat cutscene beat sheet that already passes its own
validators (which check field presence only). The pre-check was stated first: if the
list named nothing on work an experienced author had written, the technique is theatre.
It named three - an aerial a later beat must *match* whose bearing was never declared, a
reverse across an axis an earlier beat's full orbit crosses before the reverse exists,
and a two-second eye-contact beat over a character sheet with no stated gaze. All three
are consequences of an upstream artifact's geometry and none is a defect in any single
beat's brief, which is why a backward check cannot see them. Floor held. Shipped.

### Still open

A simulation cannot price what the catch saved - no render was spent against the old
sheet, so the counterfactual cost is argued, not measured. Return when that pipeline
grows an asset table and the forward list can be a validator row with a catch count per
sequence.
