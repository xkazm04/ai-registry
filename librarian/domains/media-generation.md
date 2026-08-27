---
domain: media-generation
subject: null
last_swept: 2026-08-27
layout: nested
demand_known: witnessed-silent
---

# Media generation

Coverage note for the `media-generation` bundle. Part of [[index]]; graded against
[[standard]].

## Shape at this sweep (2026-08-27)

| | | at 2026-08-21 |
| --- | --- | --- |
| Subjects | 19 | 14 |
| Techniques | 122 | 83 |
| Applications | 48 | 32 |
| `use_when` written | 122/122 | 83/83 |
| Version witness (`verified_against`) | 7/48 | 0/32 |
| Expired applications | 0 | 0 |
| Never swept | 6/19 | 14/14 |
| Attention points | 38 | 54 |
| Cap breaches | none | none |
| Taxonomy errors | 0 | 0 |

These are a record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain media-generation`.

The bundle grew by five subjects and 39 techniques in six days, all of it from
`/intake` runs mining video-craft sources. This sweep is the first time the
librarian has dispatched at content here.

## Demand: witnessed, and silent

**This is a third state and the note now names it.** One installation
(`mkdol-dev-box`, 2026-08-25) lists `media-generation` among its bundles and
reported `{}` - zero consults, zero deviations, zero citations, in a 30-day
window. The scan reads that as `demandKnown: true`, and the previous version of
this note said `false`. Neither is right:

- **Unknown** would be no installation naming the bundle at all.
- **Demand** would be a consult count.
- **Witnessed-silent** is what we have: somebody has this bundle wired and
  consulted nothing from it in a month.

That is a measured instance of the second gap [[standard]] already names -
*"the knowledge is reachable and not recalled"* - and `media-generation` is now
the cleanest case of it in the registry, because the supply side moved 39
techniques in six days while the demand side stayed at zero.

## What is owed

- **A second tree for 11 subjects.** Not a second runtime - a second *tree*.
  Confirmed available this sweep: `systedo-case` is live on `master` and
  declares engines 24.x, so the transplant claim is testable here and simply
  has not been tested. This is `/reconcile` work, not `/deepen` work.
- **A maturity signal.** All 19 documents say `forged`. Nothing here has ever
  been reconciled or transplant-tested.
- **A coupling probe** for `character-identity-continuity` - see that note; the
  subject has no measurement of its own on the state axis.
- **A version witness for 10 of the 17 runtime-bearing applications.** 24 of 48
  are `process`-stack and legitimately cannot carry one. The remaining gap is
  real and it is not merely a blind spot: an application with no witness reads
  as *not drifted* rather than *unknown*, which this sweep proved the hard way -
  see [[generative-provider-routing]]. Everything landed here carries `node@24`.

## Highest attention after this sweep

- **creator-voice-and-tone** (5) - single stack (process); never swept
- **narrative-engine-selection** (5) - single stack (process); never swept
- **platform-format-adaptation** (5) - single stack (process); never swept
- **short-form-narrative-structure** (5) - single stack (process); never swept
- **frame-direction** (3) - never swept
- **generated-output-grading** (3) - never swept; holds the strongest banked
  proposal from this sweep, and is the natural next dispatch

## Dispatched

### 2026-08-27 - three workers, all landed

- [[sound-effect-generation]] - the registry's last zero-application subject.
  Re-scoped mid-flight when the subject note showed the zero was a *deliberate*
  decline with a return condition. Verdict: condition **partially** arrived.
  3 applications landed, 1 technique declined outright.
- [[character-identity-continuity]] - 3 techniques against a floor of 4, one
  day old. One technique earned on three-lane convergence after four
  refutations; three other candidates dropped, one banked.
- [[generative-provider-routing]] - chosen on three converging signals rather
  than on points. Cleared the bundle's only drifted application (13 citations
  corrected, the error union found to have grown, a declared gap found closed),
  adjudicated the banked proposal down to an **amendment** on a one-voice
  count, and found a SECOND rotted application that no scan could see because
  it carried no witness. **The bundle now has zero drifted applications.**

## Declined

- **The four process-only narrative subjects** (`creator-voice-and-tone`,
  `narrative-engine-selection`, `short-form-narrative-structure`,
  `platform-format-adaptation`), and `production-pipeline-phasing` at
  react-only. They carry the single-stack clause, but their applications
  already bind to a real tree and their subject matter is craft, not runtime -
  the second stack has to be a second *tree*, which is `/reconcile`'s engine
  and its own sitting. Declined for this run, not for good; the counterpart is
  confirmed available.
- **Sweeping the remaining never-swept subjects to clear the flag.** "Never swept"
  is a gap in what we know, not a defect in the subject - [[standard]] says so
  itself. Sweeping for the counter is padding.

## Banked from this sweep, not placed

Cross-subject findings from three workers' reads. Held rather than written,
because placing content into a subject no worker verified is exactly what the
proposal rule guards. See [[2026-08-27-1]] for the full text.

- **The delivered-vs-requested asymmetry.** Two seams in one tree return only
  the value that was *asked for*, and both were checked by hand off-instrument
  (10.000s->10.032s music, 2.000s->2.038s effects). Tempting as a two-sighting
  family; it is **one** sighting, because the bundle's own convergence
  doctrine counts voices rather than instances and this is one tree behind one
  vendor seam. **Return when a second tree shows it.**
- ~~**The omit-when-undefined wire pattern.**~~ **Adjudicated 2026-08-27** and
  landed as an amendment, not a technique - the inversion framing was rejected
  on mechanism and the sighting count is one voice, not two. See
  [[generative-provider-routing]]. What remains banked is the GENERAL claim -
  *a default nobody sets is owned by whoever is furthest from the decision* -
  for `software-engineering`, **on a second independent voice**.
- **`sound-effect-generation` owes the dated application** for that same
  omission sighting; it is that subject's module, so the routing worker
  correctly did not write it.
- **A performer-blind grading schema** - `generated-output-grading`. The
  strongest of the four proposals.
- **Capability-absence-with-remedy** - cross-bundle, likely
  `software-engineering/deployment-contract`. Out of scope for a
  media-generation run.
