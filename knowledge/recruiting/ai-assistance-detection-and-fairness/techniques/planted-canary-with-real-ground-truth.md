---
layer: technique
type: technique
subject: ai-assistance-detection-and-fairness
technique: planted-canary-with-real-ground-truth
status: forged
laws: [absence-of-evidence-is-not-evidence, a-verdict-is-bound-to-what-it-judged, say-only-what-the-record-holds]
shared_with: []
use_when: [building the material a work sample hands the candidate, grading whether a submission verified what it was given, deciding what an unreached check means]
---

# Planted canary with real ground truth

A canary is a deliberate, recorded flaw placed in the material a candidate is
handed — a wrong constant, a contradiction between two stated requirements, an
off-by-one in a supplied helper, a stale figure in a brief. It is the only
instrument in this subject that measures verification directly, and it is
indifferent to how the candidate produced their answer. A model user who
catches it demonstrated the competence; a hand-writer who propagates it did
not. That indifference is precisely what makes it fair.

## Ground truth is the whole technique

The canary's power comes from one fact: **you know what is wrong, where, and
why.** That record — the location, the correct value, the nature of the flaw,
and the version of the material it was planted in — is the ground truth, and it
must be written down when the material is built, by whoever built it.

The failure mode is the reason this technique carries the word *real* in its
name. Under pressure to produce a report, it is tempting to have a model read
the case and *invent* plausible canaries after the fact, or to declare that
"probably something in section three was subtly wrong". A canary with no
recorded ground truth grades the candidate against noise: the grader will find
whatever it is looking for, in any submission, including a perfect one. This is
the sharpest form of
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds).
Build the refusal into the pipeline rather than the guidance: a canary set with
no recorded planting provenance is rejected, not fabricated.

An empty canary set therefore means **not run**. It does not mean *clean*, and
it must never render as a pass
([absence of evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
A submission graded against zero canaries has told you nothing about
verification, and the report must say so in those words.

## The four-way verdict

Two-way grading (caught / missed) destroys the most informative distinctions.
Use four, per canary:

- **addressed** — the submission corrected the flaw, or worked correctly around
  it. Full credit. It does not matter whether a model suggested the fix.
- **flagged** — the submission identified the flaw and did not fix it,
  typically raising it as a question or a note. This is often the *strongest*
  signal in the set: it is what a professional does with an ambiguous
  requirement they cannot unilaterally resolve, and it is nearly impossible to
  produce without having actually understood the material. Score it at or near
  addressed, and never below propagated.
- **propagated** — the submission carried the flaw through unchanged, building
  on it. This is the finding the canary exists to make.
- **unverifiable** — the check cannot be run honestly here: the ground truth
  does not resolve against the material actually served, or the submitted
  region is not a descendant of the material at all (see below). **Not a miss**,
  and it must be scored as neither.

Two hard rules govern the boundary between the last two, both learned the
expensive way.

**Absence of the region must never read as *addressed*.** The naive check is
"is the flawed fragment still present?", and a partial submission that never
included the canary's region answers *no* — earning a free full mark, exactly
for the candidates who engaged least. The correct reading is that the flaw was
in scope and survived unexamined, which is *propagated*. Where the region was
genuinely out of scope — a timeboxed case the candidate was told to stop, an
optional section — the honest verdict is *unverifiable*, decided by what the
brief asked for, not by what arrived.

**A verdict requires descent from the supplied material.** If the submitted
region was rebuilt from a different base, or invented from scratch at the same
name, then "the flawed fragment is gone" proves nothing — the fragment was
never there to be caught. Check descent before grading: require that a
meaningful share of the supplied region's substance survives in the submission,
with the bar set low, because honest heavy editing keeps scaffolding and
structure while a genuine rewrite keeps almost none. A non-descendant region is
*unverifiable*, and the live conversation grades it instead. Skip this guard
and the strongest reversal in the subject appears: a fully delegated submission
that regenerated everything scores clean canaries and outranks the careful
candidate who edited what they were given.

Deciding *flagged* needs a defined place to look: the mandated decision log,
plus anything the candidate said to a stakeholder or to a model through a
captured channel. Declare that surface in advance. A candidate who raised the
flaw in a channel you never read is recorded as propagating it, which is the
quiet way a good behaviour becomes a finding against them.

Any verdict value that does not resolve to one of the four — a malformed
record, an unrecognised string crossing a boundary between components — becomes
*unverifiable*. Never *addressed*, never *propagated*: an unreadable verdict is
an absence of one.

The verdict is bound to the specific canary and the specific artifact region it
was judged over
([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
Record which region was read for each verdict; a propagated verdict that cannot
name where it looked is not evidence.

## The guard that refuses to grade against noise

Before any canary set is graded, the grader checks that each canary resolves:
the recorded location exists in the material actually served to this candidate,
and the recorded correct value is still correct in this version. Material
drifts — a case gets edited, a helper gets rewritten, and yesterday's canary
becomes today's ordinary correct code. Grading against a stale ground truth
produces confident, wrong propagated verdicts.

A canary that does not resolve is dropped from the set and reported as such,
and if the resolving set is empty, the whole check returns *not run*. The
guard's job is to make "we could not grade this" a first-class outcome instead
of a silently degraded score.

## Designing canaries that measure verification and not luck

- **Plant several, of different kinds.** One canary is a coin flip. A handful —
  one arithmetic, one contradiction between stated requirements, one plausible
  but wrong assumption — turns a lucky catch into a pattern.
- **Make them survivable.** A canary that halts the work measures persistence,
  not verification, and violates the rule that a candidate's process must never
  stall on your machinery. The flaw must let the work proceed while quietly
  making the output wrong.
- **Make them plausible, and do not signpost.** A canary that reads as a typo
  gets fixed without thought; one that reads as an intentional decision
  separates readers from executors. No "verify the supplied constants" hint in
  the brief, and no canary in a section the brief tells them to check.
- **Rotate them.** Canaries leak the moment candidates talk to each other. Keep
  several sets per case, rotate on a schedule, and treat a set's catch rate
  jumping toward 100% as evidence of leakage, not of a stronger cohort.

## Reporting

Report per-canary verdicts with their locations and what kind of flaw was
planted, plus the counts of each verdict type and the number dropped as
unresolvable. Never report a single "canary score" without the denominator:
two-of-three addressed and two-of-twelve addressed are different findings.

A propagated verdict is a finding a human reads and discusses with the
candidate, not a rejection reason. The next step is the authorship conversation,
which frequently reveals that the candidate saw the flaw, made a defensible
call, and did not write it down.

## When not to use it

- **When the case has no supplied material.** A blank-page brief has nowhere to
  plant a flaw. Do not invent one in the brief text just to have a canary.
- **When the flaw would advantage prior domain knowledge over verification.**
  A canary that only a specialist could recognise measures background, not
  diligence, and imports exactly the kind of proxy this subject avoids.
- **When the material is candidate-supplied.** Their code, their repository,
  their prior work — you cannot plant ground truth in something you did not
  build, and inferring canaries from it is fabrication.
