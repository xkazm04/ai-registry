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


## 2026-10-31 - architecture review

Pending at dispatch. Two internal fixes owed and applied in the same run: the golden
path's technique list had dropped `delivery-promise-lock`, and the phase-granularity
rule predicted that pressure would always push toward re-merging, which the tree the
example came from has since contradicted by restoring its Motion step. The three
applications citing that tree describe states it no longer has (six phases, an empty
retirement map, a retired browser job system, five disciplines) and carry no pinned
commit; the local clone is too shallow to recover one, so they stay `reverify`. This
partly retracts the 2026-08-31 entry's "three values" description of the discipline as
current fact: it was true then and is not now.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/production-pipeline-phasing",
  "date": "2026-10-31",
  "baseline": "3e0f55289",
  "coverage": "All 12 documents (golden path, 7 techniques, 4 applications) read in full. Relative law and sibling links resolve. The gravitone-gcloud tree was reopened at its current head for the three applications that cite it; its clone is shallow (history starts 2026-10-23), so the 2026-08 states those applications describe could not be re-pinned. systedo-case was not reachable. Not evaluated: any runtime, the anti-substitution ratio (no tree measures it), the forward-list catch count. No verification date was refreshed.",
  "counterexamples": [
    "A phase merged because a still and its movement are one decision was split out again once the movement grew its own proposing turn, render queue and graded takes, while the still and its motion line stayed on one record. Reorganization pressure pushed toward re-splitting, not re-merging.",
    "A cross-tab claim guard is not limited to a store without compare-and-swap: a same-origin lock primitive (Web Locks) gives mutual exclusion across tabs, so the stated residual race is a property of the chosen store, not of browsers.",
    "Over independent projects, worst-news-first paints a whole shelf by one stuck project; the technique's own boundary already sends that case to grouping by state.",
    "A shared asset still diverging, with nothing accepted against it, gains nothing from a forward list; a cheap re-mint buys the same (the technique's own boundary)."
  ],
  "sources": [
    {
      "url": "https://en.wikipedia.org/wiki/Previsualization",
      "result": "Supports the medium-dropping probe rung: 'An animatic is a video of a hand-drawn storyboard with very limited added motion accompanied by a soundtrack', and previs tests staging and camera 'without incurring actual production costs'. Does not name a fixed rung ladder; the technique's four rungs are its own framing, not a cited standard."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API",
      "result": "'While held, no other script executing in the same origin can acquire the same lock, which allows a web app running in multiple tabs or workers to coordinate work'. The technique's sentence is conditional ('without a compare-and-swap primitive') and stays true; recorded as a counterexample, no edit owed."
    },
    {
      "source": "gravitone-gcloud at 67e1083, packages/catalog/src/projects.ts",
      "result": "PHASES is now six steps with motion restored ('MOTION IS A STEP AGAIN (operator decision, 2026-10-05)'), on the reasoning that the merge 'held while a clip could only be TYPED'. DISCIPLINES is now five values (educational, trailer, free, music-video, ads)."
    },
    {
      "source": "gravitone-gcloud at 67e1083, lib/projects.ts",
      "result": "RETIRED_PHASES is empty ('EMPTY TODAY, and kept: motion -> frames lived here until Motion came back'). STATE_RANK is unchanged (blocked, review, working, done, empty), so empty still ranks best. projectState, reportPhase and parkAt still exist at different lines."
    },
    {
      "source": "gravitone-gcloud at 67e1083, lib/jobs.tsx",
      "result": "60 lines; its header says the browser job system and its localStorage serialisation were retired ('the serialisation it approximated is the kernel's lanes and leases now'). None of the react long-run application's line citations exist."
    },
    {
      "source": "gravitone-gcloud at 67e1083, gate location",
      "result": "app/_phases/script/gate.ts is gone; 'THE ONE HONESTY RULE' header now appears in lib/script/gate.ts (not re-read line by line)."
    }
  ],
  "digest": "sha256-b2:f1762f69eb77b8d3",
  "disposition": "clarify",
  "documents": {
    "production-pipeline-phasing.md": {
      "disposition": "clarify",
      "reason": "Frontmatter lists seven techniques but 'The techniques' section lists six; delivery-promise-lock is missing. Otherwise sound: the one economic sentence, the two artifact classes, the forward-reading approval and the shared clock hold."
    },
    "techniques/phase-order-and-graduation.md": {
      "disposition": "clarify",
      "reason": "The granularity rule says reorganization pressure 'will push toward re-merging' inseparable phases. The tree this example came from re-split the merged phase once its later half grew its own work and failure states, keeping both halves on one record. Add that a merge verdict is not permanent and that phase boundary and record boundary are separate choices."
    },
    "techniques/asset-vs-disposable-render.md": {
      "disposition": "keep",
      "reason": "Classification by human commitment, probe fidelity, the medium-dropping rung (supported by the animatic definition) and atomic counted deletion are coherent and bounded."
    },
    "techniques/long-run-as-background-job.md": {
      "disposition": "keep",
      "reason": "Job record, four-state vocabulary, lifetime rule, per-kind concurrency and driven vs timed clocks are sound. The CAS caveat is conditional and true; a same-origin lock primitive is recorded as a counterexample."
    },
    "techniques/worst-news-first-progress.md": {
      "disposition": "keep",
      "reason": "Rank, single writer, unsayable not-started and the bookmark/progress split are consistent with the golden path and bounded to dependent work."
    },
    "techniques/shared-clock-across-phases.md": {
      "disposition": "keep",
      "reason": "Start-and-duration contract, visible absence and re-timing as migration are sound; the boundary excludes wall-clock scheduling."
    },
    "techniques/delivery-promise-lock.md": {
      "disposition": "keep",
      "reason": "The numerator rule and halt-or-recorded-downgrade are clearly scoped. The anti-substitution ratio is still unmeasured anywhere; the note says so and the text does not claim otherwise."
    },
    "techniques/approval-reads-forward.md": {
      "disposition": "keep",
      "reason": "Forward list, decision rules and the free-re-mint boundary are coherent; its one witness is a simulation, which the note records."
    },
    "applications/node--delivery-promise-lock.md": {
      "disposition": "reverify",
      "reason": "States the discipline is 'three values'; the current tree has five (adds music-video, ads). The consumer census ('three uses') and the absence of a rules table need re-running at a pinned commit. The empty-ranks-best fact still holds. Evidence needed: a pinned re-census of discipline consumers."
    },
    "applications/node--long-run-as-background-job.md": {
      "disposition": "keep",
      "reason": "Pinned to systedo-case 6279066f, so its citations are historical facts at that commit. Not reopened this run; its date is unchanged."
    },
    "applications/react--long-run-as-background-job.md": {
      "disposition": "reverify",
      "reason": "Describes a browser job system in lib/jobs.tsx that has since been retired into a 60-line shape file; serialisation moved to server lanes and leases. No commit is pinned and the clone is too shallow to recover the 2026-08 state. Evidence needed: a full-history clone to pin the described commit, or a rewrite against the server job layer."
    },
    "applications/react--worst-news-first-progress.md": {
      "disposition": "reverify",
      "reason": "Cites a five-phase PHASES at lib/projects.ts:39, RETIRED_PHASES motion -> frames and app/_phases/script/gate.ts; now six phases in @gt/catalog, RETIRED_PHASES empty, gate moved to lib/script/gate.ts. Worst-news-first aggregation, reportPhase and parkAt survive at other lines. Evidence needed: re-cite against a pinned current commit (the retirement example no longer exists there) or pin the original commit from full history."
    }
  }
}
```

Phase B applied the two clarify items; this record is against the new bytes.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/production-pipeline-phasing",
  "date": "2026-10-31",
  "baseline": "3e0f55289",
  "coverage": "All 12 documents (golden path, 7 techniques, 4 applications) read in full. Relative law and sibling links resolve. The gravitone-gcloud tree was reopened at its current head for the three applications that cite it; its clone is shallow (history starts 2026-10-23), so the 2026-08 states those applications describe could not be re-pinned. systedo-case was not reachable. Not evaluated: any runtime, the anti-substitution ratio (no tree measures it), the forward-list catch count. No verification date was refreshed. Second record after Phase B: two clarify items applied; the three gravitone application items remain reverify.",
  "counterexamples": [
    "A phase merged because a still and its movement are one decision was split out again once the movement grew its own proposing turn, render queue and graded takes, while the still and its motion line stayed on one record. Reorganization pressure pushed toward re-splitting, not re-merging.",
    "A cross-tab claim guard is not limited to a store without compare-and-swap: a same-origin lock primitive (Web Locks) gives mutual exclusion across tabs, so the stated residual race is a property of the chosen store, not of browsers.",
    "Over independent projects, worst-news-first paints a whole shelf by one stuck project; the technique's own boundary already sends that case to grouping by state.",
    "A shared asset still diverging, with nothing accepted against it, gains nothing from a forward list; a cheap re-mint buys the same (the technique's own boundary)."
  ],
  "sources": [
    {
      "url": "https://en.wikipedia.org/wiki/Previsualization",
      "result": "Supports the medium-dropping probe rung: 'An animatic is a video of a hand-drawn storyboard with very limited added motion accompanied by a soundtrack', and previs tests staging and camera 'without incurring actual production costs'. Does not name a fixed rung ladder; the technique's four rungs are its own framing, not a cited standard."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API",
      "result": "'While held, no other script executing in the same origin can acquire the same lock, which allows a web app running in multiple tabs or workers to coordinate work'. The technique's sentence is conditional ('without a compare-and-swap primitive') and stays true; recorded as a counterexample, no edit owed."
    },
    {
      "source": "gravitone-gcloud at 67e1083, packages/catalog/src/projects.ts",
      "result": "PHASES is now six steps with motion restored ('MOTION IS A STEP AGAIN (operator decision, 2026-10-05)'), on the reasoning that the merge 'held while a clip could only be TYPED'. DISCIPLINES is now five values (educational, trailer, free, music-video, ads)."
    },
    {
      "source": "gravitone-gcloud at 67e1083, lib/projects.ts",
      "result": "RETIRED_PHASES is empty ('EMPTY TODAY, and kept: motion -> frames lived here until Motion came back'). STATE_RANK is unchanged (blocked, review, working, done, empty), so empty still ranks best. projectState, reportPhase and parkAt still exist at different lines."
    },
    {
      "source": "gravitone-gcloud at 67e1083, lib/jobs.tsx",
      "result": "60 lines; its header says the browser job system and its localStorage serialisation were retired ('the serialisation it approximated is the kernel's lanes and leases now'). None of the react long-run application's line citations exist."
    },
    {
      "source": "gravitone-gcloud at 67e1083, gate location",
      "result": "app/_phases/script/gate.ts is gone; 'THE ONE HONESTY RULE' header now appears in lib/script/gate.ts (not re-read line by line)."
    }
  ],
  "digest": "sha256-b2:95dfbb64eb030b29",
  "disposition": "reverify",
  "documents": {
    "production-pipeline-phasing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the missing delivery-promise-lock entry to 'The techniques' list, matching the frontmatter."
    },
    "techniques/phase-order-and-graduation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a paragraph that a merge verdict describes the work as it stands; a later half that grows its own machinery and failure states earns its phase back, and phase and record boundaries are separate choices."
    },
    "techniques/asset-vs-disposable-render.md": {
      "disposition": "keep",
      "reason": "Classification by human commitment, probe fidelity, the medium-dropping rung (supported by the animatic definition) and atomic counted deletion are coherent and bounded."
    },
    "techniques/long-run-as-background-job.md": {
      "disposition": "keep",
      "reason": "Job record, four-state vocabulary, lifetime rule, per-kind concurrency and driven vs timed clocks are sound. The CAS caveat is conditional and true; a same-origin lock primitive is recorded as a counterexample."
    },
    "techniques/worst-news-first-progress.md": {
      "disposition": "keep",
      "reason": "Rank, single writer, unsayable not-started and the bookmark/progress split are consistent with the golden path and bounded to dependent work."
    },
    "techniques/shared-clock-across-phases.md": {
      "disposition": "keep",
      "reason": "Start-and-duration contract, visible absence and re-timing as migration are sound; the boundary excludes wall-clock scheduling."
    },
    "techniques/delivery-promise-lock.md": {
      "disposition": "keep",
      "reason": "The numerator rule and halt-or-recorded-downgrade are clearly scoped. The anti-substitution ratio is still unmeasured anywhere; the note says so and the text does not claim otherwise."
    },
    "techniques/approval-reads-forward.md": {
      "disposition": "keep",
      "reason": "Forward list, decision rules and the free-re-mint boundary are coherent; its one witness is a simulation, which the note records."
    },
    "applications/node--delivery-promise-lock.md": {
      "disposition": "reverify",
      "reason": "States the discipline is 'three values'; the current tree has five (adds music-video, ads). The consumer census ('three uses') and the absence of a rules table need re-running at a pinned commit. The empty-ranks-best fact still holds. Evidence needed: a pinned re-census of discipline consumers."
    },
    "applications/node--long-run-as-background-job.md": {
      "disposition": "keep",
      "reason": "Pinned to systedo-case 6279066f, so its citations are historical facts at that commit. Not reopened this run; its date is unchanged."
    },
    "applications/react--long-run-as-background-job.md": {
      "disposition": "reverify",
      "reason": "Describes a browser job system in lib/jobs.tsx that has since been retired into a 60-line shape file; serialisation moved to server lanes and leases. No commit is pinned and the clone is too shallow to recover the 2026-08 state. Evidence needed: a full-history clone to pin the described commit, or a rewrite against the server job layer."
    },
    "applications/react--worst-news-first-progress.md": {
      "disposition": "reverify",
      "reason": "Cites a five-phase PHASES at lib/projects.ts:39, RETIRED_PHASES motion -> frames and app/_phases/script/gate.ts; now six phases in @gt/catalog, RETIRED_PHASES empty, gate moved to lib/script/gate.ts. Worst-news-first aggregation, reportPhase and parkAt survive at other lines. Evidence needed: re-cite against a pinned current commit (the retirement example no longer exists there) or pin the original commit from full history."
    }
  }
}
```
