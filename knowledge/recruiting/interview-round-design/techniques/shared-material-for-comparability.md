---
layer: technique
type: technique
subject: interview-round-design
technique: shared-material-for-comparability
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [adding candidate-specific questions to an interview, deciding what material grounds a round, comparing ratings across a cohort]
---

# Shared material for comparability

A rating is comparable across a cohort only if the people rated were given the same
thing to respond to. This is obvious stated baldly and is violated constantly, because
the violation arrives disguised as an improvement: *personalise the questions to each
candidate.*

Personalisation is genuinely better per conversation. A probe aimed at what this person
actually did gets a more informative answer than a generic prompt, and candidates
experience it as respect. The problem is that a personalised probe on a *shared*
competency silently converts a cohort-wide scale into a per-candidate instrument. Two
people rated on the same axis after being handed different problems were not rated on
the same axis, and any comparison of those numbers — a shortlist, a ranking, a
threshold, a calibration session — is comparing readings from two different
instruments, per
[a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged).

## The resolution: split the round's phases by grounding

Do not choose between personalisation and comparability. Split the round:

- **Shared phases** run on identical material for every candidate in the population: the
  same case, the same problem, the same scripted intervention, the same core questions.
  These phases feed the competencies that are compared across the cohort.
- **Personal phases** run on candidate-specific material: something they built,
  something a document raised, their stated motivation, a follow-up on a prior round.
  These feed judgments that are inherently individual and are not used to rank people
  against each other on a common scale.

Then enforce one rule, which is the whole technique in a sentence: **candidate-specific
questions may be attached only to personal phases.** A generated or hand-written probe
aimed at one candidate never lands on a shared phase, no matter how good it is.

The rule is cheap to enforce because it is structural. Each phase already carries a
grounding flag in its specification; the question-generation step reads that flag and
refuses to attach to a shared phase. Enforcing it by asking interviewers to be careful
does not work, because the temptation arrives exactly when the interviewer has read
something interesting about the candidate.

The split also gives you a **capacity**, which is the second half of the enforcement and
the half people miss. The number of personal phases times the number of questions each
can absorb is the total number of candidate-specific questions the round can hold. Any
automated preparation step that mints probes from a document will happily produce more
than that; the surplus is dropped, not redistributed onto shared phases. A generator with
no capacity bound will find somewhere to put its output, and the only remaining
somewhere is the material that was supposed to be identical for everyone.

## What "the same material" has to mean

Shared material is stricter than "the same topic":

- **Same artifact.** One case document, one dataset, one problem statement, one code
  sample — a specific object, not a category of object. Two equally hard problems are
  not the same problem, and any difficulty difference between them lands entirely inside
  the ratings.
- **Same delivery.** The same framing, the same time allowed, the same hint at the same
  point. A shared problem delivered with more scaffolding to one candidate has become
  personal material.
- **Same population scope.** Material is shared *within a population*, not universally.
  A different case for a different role family or seniority band is correct; what is
  wrong is a different case within the group whose ratings will be compared. This mirrors
  the scorecards rule that a separate population gets a separate instrument.
- **A version.** When shared material is revised — a case updated, a problem swapped
  because it leaked — the revision starts a new comparability group. Ratings from before
  and after are not pooled without saying so.

## Freshness versus comparability

The two pull against each other and the tension is permanent. Shared material becomes
known: candidates talk, questions circulate, and a case in use for a year is measuring
preparation as much as ability. Rotating material restores freshness and breaks the
comparability group.

Resolve it by rotating on a **cohort boundary**, not continuously. All candidates for a
given opening see the same version; the next opening may see a new one. Where hiring is
continuous, rotate on a stated interval and treat each interval as its own comparability
group — which also means a ranking must never silently span a rotation, and a rate
computed across one must state that it did, per
[a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis).

## Choosing what grounds a round at all

Shared material is only half the question; the other half is whether the material is
*adequate to the judgment*. The brief a round runs from should be selected by round type
and checked against what it is being asked to support:

- A record-based brief supports probing a claimed history. It does not support an
  evaluation where there is little history to probe — an early-career record cannot
  carry an evaluation, and a round built on one will produce confident verdicts grounded
  in nothing.
- A work-sample brief supports a demonstration judgment and little else; it says nothing
  about collaboration.
- A prior-round brief supports follow-up, and only on what the prior round actually
  covered.

When the available material cannot ground the round's judgment, the fix is to supply
material that can — usually a shared case or work sample — not to lower what the round
claims to have judged.

Where several kinds of material exist for the same candidate, resolve them as a **ladder
ordered by specificity, with comparability as the tiebreaker**, evaluated once per round
rather than blended:

1. **A demonstration this candidate actually produced** — a submitted work sample, and a
   debrief that probes the decisions inside it. Most specific grounding available, and it
   wins outright, because verifying authorship and reasoning against a concrete artifact
   is a judgment nothing else can make.
2. **Shared material for the role** — the same case for every candidate on the opening.
   The default for a population being compared, and the fallback the moment (1) is absent.
3. **A generic designed script** — the same for every candidate everywhere. Weaker
   material, identical comparability; the honest last resort when no role-specific case
   exists.
4. **The candidate's own record** — used to shape probes, never as the sole ground of a
   round for a population whose records are thin.

Stating the ladder as a ladder, rather than letting each round improvise, is what stops a
round from being run on whatever happened to be attached to the candidate that day — which
is the quiet route by which two candidates for the same opening end up assessed on
entirely different bases.

## When not to use this

- **Rounds that produce no cross-cohort rating.** A final conversation with one remaining
  finalist compares nobody; personalise it completely. The rule binds where comparison
  happens, and nowhere else.
- **Accessibility and accommodation.** An adjustment made for a candidate's needs is not
  a comparability violation; it is a different delivery of the same instrument, recorded
  as an accommodation. Refusing an accommodation to protect comparability is the wrong
  trade and, in most jurisdictions, not a trade you are allowed to make.
- **Where the shared artifact is compromised.** If the case has leaked, comparability is
  already gone; rotate immediately and mark the boundary rather than defending a group
  that no longer means anything.
