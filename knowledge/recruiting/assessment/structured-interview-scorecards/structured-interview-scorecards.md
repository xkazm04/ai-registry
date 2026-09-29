---
layer: golden-path
type: golden-path
subject: structured-interview-scorecards
status: forged
use_when: [designing or revising an interview rubric, writing behavioural anchors for a competency, deciding what a scorecard may record when a topic was never discussed, comparing candidates scored on different scales]
techniques:
  - behaviourally-anchored-level-writing
  - evidence-quote-requirement
  - unassessed-competency-handling
  - rubric-versioning-at-write-time
  - separate-rubric-per-population
  - role-family-axis-extension
---

# Structured interview scorecards

A scorecard is not a form. It is an instrument, and the only property that makes
it worth building is **reproducibility**: the same performance, seen by a
different interviewer on a different day, produces the same rating. Everything
else the artifact does — feeding a decision meeting, feeding a hiring metric,
feeding a defensibility file — is downstream of that one property, and collapses
without it.

That the structured form beats the unstructured conversation on average is settled
and has been for decades; it is not the interesting part and it is not what a team
gets wrong. Read the size honestly, though: the 2022 overcorrection-adjusted
meta-analysis puts structured interviews at about .42 against about .19 for
unstructured, down from .51 and .38 in the 1998 summary that most citations still
repeat, and the structured figure carries an 80% credibility range of roughly .18 to
.66. The ordering held; the spread is the finding. A structured format is a
precondition for a valid instrument, not evidence that yours is one, which is the
whole reason the rest of this subject exists. Teams get *structure theatre*: fixed questions, a 1–5 box per competency,
a comment field, no anchors, no evidence discipline, no versioning. The form is
structured; the judgment inside it is exactly as unstructured as before, and now
it wears a number. Numbers are worse than adjectives when they are not grounded,
because a number invites arithmetic — averaging, thresholding, ranking — that
the underlying judgment cannot support. The fault is the missing grounding and the
threshold laid over a small gap, not the arithmetic: combining well-grounded
ratings by a fixed rule beats a holistic overall impression (a 2013 meta-analysis
put the mechanical method's edge for predicting job performance at more than 50%,
and found the holistic loss held even for experts who knew the job), which is the
decision subjects' ground and not this one's.

The principal reading is that a scorecard has four load-bearing commitments, and
each one is a place a team quietly opts out:

1. **The competency set is fixed before the candidate is seen.** What is scored
   is decided by the role, once, for everyone in the population. An interviewer
   who adds an axis mid-loop because this candidate happened to be strong at
   something has scored a different instrument.
2. **Each level is described in behaviour, not in degree.** "Good" and "very
   good" are the same anchor written twice. A level must name what a person
   observably did.
3. **A rating cites the evidence that produced it.** Not a summary, not an
   impression — the thing the candidate actually said or did.
4. **The rating is bound to the version of the scale it was scored on.** Rubrics
   get revised; ratings do not get re-meant when they do.

## Anchors are the instrument; the number is a label on it

The rating scale is a set of *behavioural descriptions* that a rater matches
against what they observed. The integer is an index into that set, not a
quantity. This ordering is what people invert, and inverting it is the origin of
most scorecard pathology: raters who feel a 4 and then hunt for a justification,
scales where the midpoint means "fine, no strong feeling", and calibration
sessions that argue about whether someone is a 3 or a 4 without ever quoting
what they did.

Written properly, the anchor set does the arguing for you. Two raters disagreeing
on a level should be able to resolve it by asking "which of these two paragraphs
describes what we watched?" — and if neither does, the finding is that the
anchors are wrong, which is a fixable defect. Anchors that cannot adjudicate a
disagreement are decoration.

Hold the claim at the strength the evidence gives it. Anchored scales are the
standard practice and the mechanism above is sound, but the mechanism is an
argument; the head-to-head evidence against plain scales is thin. The best
interview-specific comparison is a 2011 experiment that crossed descriptively
anchored scales with frame-of-reference training: each improved rating accuracy and
interrater reliability by a comparable amount over neither, and using both improved
accuracy further. So anchors and calibration (below) are two halves of one
reproducibility mechanism, not a main effect and a nicety. A team that writes
careful anchors and never calibrates has bought part of it, and so has the reverse.

The highest-value anchors are the **low ones**. Teams write a lyrical top level
and a vague bottom ("does not meet expectations"), which is exactly backwards:
the top of the scale is rarely contested, and the bottom is where an adverse
decision gets made. A level-1 anchor should be as behaviourally specific as the
level-5 — it names a real, recognisable, observable thing a person does, not the
absence of the good thing. See behaviourally-anchored-level-writing.

A related discipline is the one the measurement literature calls
**retranslation**: hand the anchor paragraphs, stripped of their competency
labels and level numbers, to people who did not write them, and ask them to sort
them back into competency and order. Anchors landing in the wrong competency are
measuring something other than what the header claims; anchors landing out of
order are not distinguishable in practice, so the scale has fewer real levels
than boxes. It is a cheap, pre-launch test of whether the scale a team wrote is the
scale a reader will take it to be (agreement thresholds in the literature are
convention, commonly 60% to 80%, and no test was found showing that passing predicts
later reliability or validity, so it screens for clarity and does not certify), and it
is why
[meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)
governs here: the header of a competency, the name of a level and the display
string of a scale are all inert. The paragraph underneath is the instrument.

## Evidence, or the rating did not happen

A rating without cited evidence is an impression with a number stapled to it. The
non-negotiable is that every rating carries **what the candidate actually said or
did**, in near-verbatim form, close enough to the original that the candidate
would recognise it. Paraphrase erodes in a predictable direction — toward the
rater's conclusion — so by the time it reaches the decision meeting the evidence
field restates the score instead of grounding it.

This matters for three separate reasons that are easy to conflate. **Calibration**
— quotes are the raw material of every calibration exercise; a team cannot align
on what a 4 looks like by discussing 4s, only by discussing transcript fragments.
**Defensibility** — an adverse decision explained months later is explained by the
record, and
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
means the record has to hold something. **Rater honesty** — the requirement is a
live check at write time; a rater who cannot produce a quote has usually
discovered, in the act of trying, that they are rating an inference.

Where a machine drafts the scorecard from a transcript, the requirement gets
*stricter*, not looser, because a model's fluent paraphrase is the most
convincing wrong evidence available. Whatever fills the evidence field must be
traceable to the transcript, and where it is not, the field is empty and the
rating is marked unassessed. See evidence-quote-requirement.

## Not-assessed is a state, not a score

Interviews run out of time. A planned competency goes untouched; a probe never
lands; the candidate redirects. The scorecard must have somewhere to put that,
and the somewhere must not be a number that participates in arithmetic —
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence).

Both naive resolutions are wrong in the same way. Scoring an untouched competency
zero ranks a person worst on a dimension nobody observed. Scoring it at the
midpoint makes an unmeasured competency indistinguishable from a measured
adequate one, which is worse, because it is invisible. The workable arrangement
separates two things a single integer cannot carry: the *rating*, which for an
unobserved axis is best simply absent, and the *coverage flag*, which is what
actually gets surfaced — to the interviewer while the loop is still reschedulable,
and to the decision meeting as a stated limit on what was observed.

A neutral placeholder integer is a compromise for a schema that insists on a
number, and it is tolerable only while the coverage state travels with it
everywhere the rating goes. The moment the number is exported, averaged or ranked
without its flag, an unmeasured competency has been laundered into a measured one.
It has a second hazard the word "neutral" hides: a scale that names its bar (as
this subject says it should) usually names the middle level, so the neutral
placeholder is the level that meets the bar, and any threshold reads it as a pass.
Where a person is filling the scorecard, omit the rating; a machine that must emit
an integer needs a coverage record from somewhere other than its own say-so. See
unassessed-competency-handling.

## Rubrics get revised; ratings do not get re-meant

Every rubric worth having is revised — anchors sharpen, a competency splits, an
axis is retired. The failure this creates is not the revision; it is that old
ratings are silently reinterpreted under the new scale. A competency retired in
March renders as *off-rubric* on a January scorecard that was scored perfectly
correctly at the time. A five-point scale rescaled to four turns every historical
4 into a different claim about a person.

The fix is that **a scorecard stamps the scale it was scored on at write time** —
not a date, not a "current version" pointer, but the identity of the exact axis
set and anchor text in force at the moment of writing. A rating displayed later
is displayed against its own rubric, and a rating whose rubric has been
superseded is *labelled* superseded rather than quietly re-meant, which is the
whole content of
[a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged).
See rubric-versioning-at-write-time.

The corollary constrains comparison: candidates are comparable **within** a
scoring model and never across one. Averaging a rating taken on one scale with a
rating taken on another produces a number with no referent. When a shortlist view
must span models, it says so and groups by model; it never silently pools.

## One scale cannot serve two populations

A rubric encodes what good looks like *for a population*, and the most common
structural error in hiring is running one instrument over two. The sharpest case
is early-career versus experienced: a graduate scored against an experienced
rubric fails the ownership and judgment anchors on the accurate observation that
they have not had the opportunity, and the instrument reads that as weakness.
Everything predictive about an early-career candidate — learning rate,
coachability, quality of reasoning under an unfamiliar problem — is not an axis
on the experienced scale at all.

The answer is a separate scoring model per population, with its own competencies
and its own anchors, and an explicit rule for which model applies. Two disciplines
keep it honest: the choice of model is recorded on the scorecard, not inferred at
read time from the candidate's profile; and historical records written before the
second model existed default to the model that did exist, rather than being
retro-classified into one that could not have produced them. See
separate-rubric-per-population.

Population is not the same axis as role family. A rubric may also need **extra
scored dimensions for a family of roles** — clinical judgment and patient safety,
site safety, scientific rigour, portfolio craft, operational execution, service
reliability — that no general competency set contains and that no interviewer
should have to remember to ask about. Those extend the instrument for that
family rather than replacing it; a family with no such tail is the normal case
and must be the silent one. See role-family-axis-extension.

## Independent scoring before the debrief

The debrief is where a well-built instrument is most often destroyed. If
interviewers discuss the candidate before their scorecards are written, the
panel has not produced independent ratings — it has produced one
rating and several ratifications of it. Anchoring to the first speaker is a
standard finding of the group-judgment literature, plausibly stronger when the first
speaker is senior, and it is entirely invisible in the artifact afterwards: the
record shows four aligned scorecards, which is what a well-run loop and a captured
one both look like. Be plain about the basis. The case rests on that literature and
on the independent-then-aggregate protocol in *Noise*, not on a debrief experiment
in hiring, which is thin. What independence demonstrably buys is preserved variance;
it does not by itself improve the decision, because discussion also fails to pool
what only one person saw. So the rules below are cheap protections against a known
contamination, held as design rules and not as measured effects.

Independent *ratings* are also not independent *observations*. Interviewers who sit
on one conversation share its content, and their agreement flatters the instrument:
the 2013 update of interview reliability puts mean interrater agreement at .74 for
panels against .44 for separate interviewers, and an earlier review of 120 studies
found that panel format did not add validity. A panel is the right tool for
protecting one conversation from one person's blind spot, and the wrong evidence
that the instrument is reproducible. Agreement across separate interviews is the
figure that means something.

The rules:

- **Every scorecard is submitted before any discussion of the candidate.**
  Not "mostly", not "the hiring manager writes theirs after" — submitted, then
  discussed. A panel member who cannot recall their rating without the meeting
  has already lost the observation.
- **The debrief opens with the disagreements, not the average.** The value of a
  panel is the variance; a meeting that converges to the mean has spent its
  panel and bought nothing.
- **Speaking order runs from least to most senior**, and the decision-maker
  speaks last. This is a heuristic against deference; no study of it was found,
  and it is the weakest rule here.
- **Disagreement is adjudicated against the anchors and the quoted evidence**,
  not by preference or persuasion. "Which anchor paragraph describes what you
  heard, and what did they say?" is the only question the meeting needs.

A team that runs the loop entirely at team scope, with no per-interviewer
identity on a scorecard, gets one property free — no individual leniency
signature is attributable, so no rater can be shamed — and pays for it twice: it
cannot measure inter-rater reliability, and it cannot satisfy
[every decision names its actor](../../_laws.md#every-decision-names-its-actor)
from the scorecard alone. That is a legitimate trade only when the actor is
recorded elsewhere in the decision trail. It is never a reason to skip
independent scoring, which costs nothing and needs no identity model.

## Calibration is a recurring practice, not a launch task

An instrument drifts. Frame-of-reference training — walking raters through
concrete recorded responses and reaching agreement on which anchor each one
matches — has the strongest meta-analytic support among rater trainings
(for rating accuracy, with the effect concentrated in telling performances apart
and in behavioural accuracy), and it works because it operates on the same objects
the scorecard does: behaviour and anchors, not scores. For interviewers specifically
the one controlled comparison found it about as effective as descriptively anchored
scales, and better together with them (see the anchors section). Treat the direction
as robust and any specific effect size as context-bound; the reliability gain in an
interview setting has one experiment behind it, on videotaped interviews.

Run it on real, anonymised transcript fragments from your own loops. Run it when
the rubric changes, when a new interviewer joins, and on a slow cadence
otherwise. And run it as a *test of the rubric*, not only of the raters: when
five calibrated people cannot agree on which anchor applies, the finding is
about the anchor.

## What this subject does not own

Which competencies a given role should be scored on, and how the rounds are
divided so each competency is observed by someone, belong to interview round
design; a scorecard assumes its axis set arrives already justified. How a set of
scorecards combines with other signals into a hire decision, and the rule that no
adverse outcome is fully automated, belong to the decision subjects. Where a
model drafts scorecards, the plumbing of that model — routing, cost, degraded
runs, judge scaffolding — belongs to the neighbouring observability practice;
what stays here is the hiring-craft half: that a drafted rating is a hypothesis
until a person adopts it, and that a degraded run must downgrade the scorecard's
provenance rather than freeze a thin verdict as though it were authoritative
([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).

The whole subject reduces to one test, and it is worth applying to any scorecard
system before shipping it: **take a rating written six months ago, and ask what
it claims.** If the answer requires knowing who wrote it, what mood they were in,
which version of the rubric was live, or what the competency header meant that
quarter — the instrument does not measure anything, and the numbers built on top
of it are ornaments.
