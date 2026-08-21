---
layer: application
type: application
subject: interview-round-design
technique: shared-material-for-comparability
stack: node
status: forged
---

# Personalised questions ride only the personal phases

The comparability rule is enforced in one filter, in one pure module. It is worth
reading because the enforcement is three lines and the argument is one comment.

## The filter

`app/_lib/student-interview.ts:91` — `studentPrepRunOfShow` maps the prep automation's
CV-derived question hypotheses onto the six-phase script:

```ts
const personalPhases = STUDENT_SCRIPT.filter((p) => !p.caseGrounded);
const capacity = personalPhases.length * PREP_QUESTIONS_PER_PERSONAL_PHASE;
const questions = (rawQuestions ?? []).filter((q) => q.question).slice(0, capacity);
```

and the doc comment above it carries the whole argument:

> The CV-derived question hypotheses (the "prep" automation's output) are mapped
> round-robin onto the PERSONAL phases only — anchor / stuck-and-recovered /
> calibration — where the candidate's own story is the material; the case-grounded
> phases keep exactly the script probe, because their material is SHARED across every
> candidate on the role and a per-candidate question there would break rating
> comparability.

That is the technique's core rule, implemented as a predicate rather than as guidance. A
generated probe cannot reach a shared phase, because the code that places probes only
ever iterates `personalPhases`.

## The capacity bound is the second half

`PREP_QUESTIONS_PER_PERSONAL_PHASE = 2` (`app/_lib/student-interview.ts:52`) times three
personal phases gives a capacity of six, and the surplus from an over-productive
generator is **dropped** (`slice(0, capacity)`) rather than redistributed. This is the
half teams miss: a generator with no capacity bound will find somewhere to put its
output, and the only remaining somewhere is the material that was supposed to be
identical for everyone.

The round-robin placement (`personalPhases[i % personalPhases.length]`, line 108) also
means the personal phases fill evenly — no single phase absorbs the whole generated set
and turns a three-minute block into an interrogation.

## The brief-selection ladder

`buildGroundedInterview` (`app/_lib/interview-run.ts:235`) resolves, per entry, which
material grounds the round, ordered by specificity with comparability as the tiebreaker:

1. **Submission debrief** (line 258) — an entry promoted from an evaluated take-home gets
   authorship questions minted from its own observed decisions: "Most specific grounding
   available, so it wins over both the student script and prep." The debrief brief itself
   (line 215) instructs that using AI tools to build the submission "is expected and NEVER
   penalised — what matters is whether they own the decisions in it".
2. **The role's shared case scenario** (line 288) — when the job's dev case has a
   generated interview scenario, the brief is case-grounded, with the reason stated
   inline: "every candidate hears the same material, so ratings stay comparable".
3. **The generic six-phase script** (line 303) — same for everyone everywhere; the
   fallback when no role-specific case exists.
4. **The CV-derived prep chronology** (line 313 onward) — the experienced-hire path,
   where a record exists that can carry probing.

The reason early-career entries skip step 4 is stated at `app/_lib/student-interview.ts:227`
and repeated at `app/_lib/interview-run.ts:276`:

> Their CV cannot carry the evaluation, so YOU lead the conversation to generate the
> signal.

That is the technique's adequacy test — material must be able to ground the judgment
asked of it — as a routing decision rather than a warning.

## Deviations

- **No comparability group is recorded.** The scenario a candidate was interviewed on is
  resolved at run time from the job's dev case (`devCaseIdFromJobId`,
  `app/_lib/interview-run.ts:287`); nothing stamps *which version* of that scenario the
  session used. Rotate the case and the ratings from before and after pool silently. The
  technique's rule — a revision starts a new comparability group — is unmet.
- **The generic-script fallback crosses roles.** When no dev case exists, every
  early-career candidate on every opening hears the same script. That is maximally
  comparable and minimally role-specific; the standard's "same population scope" rule
  would prefer a per-role-family case, and the fallback is the honest last resort rather
  than the target state.
