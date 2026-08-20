---
layer: golden-path
type: golden-path
subject: aaa-craft-rubric-authoring
status: forged
use_when: [writing a craft rubric for a deliverable class, a judge is scoring generated game content, quality scores cluster in a narrow band, deciding what counts as good enough to ship]
techniques:
  - named-benchmark-anchors-per-level
  - criterion-with-a-cited-source
  - capped-disqualifiers
  - checkable-against-the-stored-artifact
  - ceiling-as-a-market-assumption
  - lens-versioning-as-invalidation
---

# Authoring a craft rubric that grades against what ships

A craft rubric — a *lens* — is the written instrument that turns one stored artifact
into an absolute grade against the standard of work that actually shipped in its
medium. It is not a scoring prompt, and the distinction matters more than any other
decision in this subject. A scoring prompt asks an examiner for an opinion and gets
back the examiner's taste, smoothed toward the middle. A lens hands the examiner a
fixed set of checkable bars, a named reference standard at each quality level, a list
of errors that cap the grade no matter what else is true, and a ceiling that says how
good this class of thing is currently allowed to get. The examiner's remaining freedom
is to read the artifact and answer the questions. Everything a rubric author does is
an attempt to shrink the space in which taste can operate without shrinking the space
in which craft is visible.

Build the instrument this carefully because machine-generated content arrives in
volumes no lead can review, and it arrives *plausible*. Generated work fails in a
characteristic way: it is correct, complete, generic, and dead — the right number of
frames, the right structure, the right named parts, and none of the intent that makes
a shipped piece read at a glance. A rubric that rewards correctness will pass all of
it. So the first law of this craft is that **correctness is the floor, not a passing
grade**: a functional, generic result that a lead would hand back is placeholder work
and must score as placeholder work. Any rubric where a technically valid,
artistically absent artifact lands in the passing band is mis-authored, and no amount
of examiner tuning fixes it.

## The three graders a rubric must refuse to be

Three grading stances feel natural and each destroys the instrument.

**The curve.** Scoring an artifact relative to the batch it arrived in. The batch is a
property of the generator, the week, and the prompt that produced it; grading against
it means the score drifts every time the generator changes, and a mediocre batch mints
a top grade. A rubric that ranks is not a rubric — it is a sort key wearing one. The
grade must be answerable for a single artifact with no siblings present.

**The ambition scale.** Scoring an artifact relative to what it was trying to be. This
is the stance that produces the sentence "good for a first pass" and then ships the
first pass. Ambition belongs in the brief, not in the ruler. The bar for a shipped
piece is the same bar whether it took four hours or four weeks.

**The charitable reader.** Assuming the input was competent and filling gaps with
generosity. An examiner that infers intent from an artifact's structure will grade the
inference rather than the artifact. If the piece does not communicate its intent
unaided, the intent is not there for a player either.

Each stance grades something other than the artifact against something other than what
ships. The four structural devices below are how the document forecloses them.

## Four parts, and each one has a job

A lens for a deliverable class is four blocks. Any one of them missing produces a
predictable pathology.

**Level anchors.** Each quality level names a concrete, current, publicly available
reference product that two reviewers would picture the same way — not an adjective.
"Excellent" is a word each examiner fills with their own history; "at the standard of
the current top-tier commercial product in this genre" is a fixed point. Without
anchors, examiners regress to the middle of whatever scale you gave them; the wider
the scale, the harder they regress. See
[named-benchmark-anchors-per-level](techniques/named-benchmark-anchors-per-level.md).

**Criteria, each a bar with a source.** Seven to twelve of them, each stated
positively as the thing that must be true, each carrying the named published talk,
textbook, standard or specification that establishes why it is the bar. The source is
not a citation ritual — it is what makes the criterion arguable by a practitioner
instead of arguable by anyone. A criterion nobody can trace is a preference; a
criterion traced to a named methodology is a standard someone can contest on the
merits. See [criterion-with-a-cited-source](techniques/criterion-with-a-cited-source.md).

**Disqualifiers that cap.** A short list of errors that force the grade below the
passing band regardless of every strength. Craft is not additive: an animation with
extraordinary weight and a missing contact frame is not an average of the two, it is
broken. Without caps, a strong artifact buys its way past a defect that a lead would
reject on sight. See [capped-disqualifiers](techniques/capped-disqualifiers.md).

**A ceiling with a reason.** The highest level this deliverable class may currently
reach, recorded with a written justification and a three-way classification of how
permanent that limit is. A ceiling is a product decision about the state of tooling
and the market, dated and revisitable — not a fact about the medium. See
[ceiling-as-a-market-assumption](techniques/ceiling-as-a-market-assumption.md).

Above the four blocks sits a header: what evidence base this lens reads, and — stated
explicitly — what it does not judge. "Checkable against the stored artifact and its
declared specification, never against a live play session" is a sentence worth writing
at the top of every lens, because it settles in advance the argument an examiner would
otherwise resolve by imagining.

Two further disciplines wrap the four blocks. Every criterion must be answerable from
the stored artifact alone, by an examiner with no access to the process that made it
([checkable-against-the-stored-artifact](techniques/checkable-against-the-stored-artifact.md)).
And the whole document carries a version that acts as an invalidation switch, so a
verdict scored under an older lens reads as ungauged rather than being silently
re-meant ([lens-versioning-as-invalidation](techniques/lens-versioning-as-invalidation.md)).

## One lens per deliverable class, and the class is not negotiable

The single most expensive rubric failure is applying the right rubric to the wrong
thing. An examiner handed a general craft rubric and a piece of technical scaffolding
will grade the scaffolding as though it were a finished piece and return a confident,
specific, catastrophically wrong number — a layout schematic scored in the low tens
for lacking colour, a reference sheet of icons scored in the high teens for not being
a composition. Both artifacts were exactly what they were asked to be. The verdict was
not wrong about the artifact; the rubric was wrong about the question.

So the routing is part of the instrument. Each deliverable class maps to exactly one
lens, and the map is data, not a judgment the examiner makes at scoring time. Two
rules keep the map honest:

- **A class may only be redirected to a lens that judges the same kind of thing.** In
  practice this means overrides are permitted only among text-shaped classes, where
  the artifact really is prose and the question is which prose standard applies. A
  visual class may not be redirected to a text lens, because that is not a routing
  decision, it is an escape.
- **Re-labelling must not dodge a lens.** If a producer can rename a deliverable class
  and thereby move an artifact to a laxer rubric, the rubric system has no floor. The
  override surface is deliberately narrow for exactly this reason.

Sub-classes inside a medium deserve their own sub-rubrics where the craft differs.
Within a single visual medium, a schematic, an icon sheet, a texture tile and a
finished illustration are four different crafts sharing a delivery format. One rubric
over all four grades three of them against a standard they were never meant to meet.
And when you split a rubric in response to such an incident, the split must not be a
softening: each new sub-rubric keeps every bar that still applies and is *differently*
strict where its own craft demands more. A sheet that legitimately carries text is not
excused from text quality — it is held to a stricter text bar than the rubric that
forbade text entirely could ever express.

## The bar the producer is given and the bar the examiner scores are one text

If the instruction handed to whoever or whatever produces the artifact and the
criterion the examiner grades it against are maintained as two documents, they will
drift, and the drift is invisible from both sides: producers optimise for a bar that
is no longer scored, examiners score a bar nobody was asked for, and the resulting
grades look like a quality problem. Author the bar once and generate both surfaces
from it. The level anchor a producer is told to aim at and the level anchor an
examiner compares against must be the same sentence, not two paraphrases of one
intention. This is the single cheapest structural fix in the subject and the one most
often skipped, because at authoring time the two documents genuinely do agree.

The corollary at authoring time is that the rule an artifact will be graded against
should be visible to whoever authors the artifact. A hidden rubric is a guessing game
whose failures are indistinguishable from craft failures.

## Scale design: narrow, ordinal, anchored

Use three to five ordered levels, not a continuous hundred-point range. Wide scales
invite two failures at once: examiners cluster toward the centre, and the extra
resolution is fictitious — nobody can defend the difference between 71 and 74. Where a
downstream consumer needs a number, derive it from the level; do not ask for it. If a
finer signal is genuinely needed, get it by adding criteria rather than by widening
the scale, because a criterion is checkable and a decimal place is not.

Score criteria independently and compose afterwards. Asking for one holistic
impression and then a breakdown produces a breakdown reverse-engineered from the
impression: the sub-scores will be internally consistent and jointly uninformative.
Ask each criterion in isolation, with its own bar in front of the examiner, and derive
the level from the pattern of answers plus the disqualifier check.

State each criterion as the positive form of the bar — what must be true — rather than
as a defect to hunt. Defect-shaped rubrics reward silence: an examiner that finds
nothing wrong scores full marks, which means an artifact too vague to have visible
defects outranks a specific one with a visible flaw. The positive form makes absence
of evidence read as failure to meet the bar, which is what it is.

## Known distortions the document must absorb

A machine examiner brings measurable biases, and the rubric — not the examiner — is
where they are absorbed, because the rubric is the part you can version.

- **Central tendency.** Mitigated by narrow anchored scales and by anchors that make
  the top and bottom concrete enough to reach.
- **Verbosity and elaboration.** A longer artifact, or a longer description of one,
  reads as better work. Mitigated by criteria that ask whether a specific thing is
  present, not whether the artifact is thorough.
- **Surface fluency.** Polish on the presentation layer masks absence underneath —
  this is the exact failure mode of generated content, and it is why disqualifiers
  exist. A capped defect cannot be out-argued by fluency.
- **Order and neighbour effects.** Anything that lets one artifact's grade depend on
  another's is a curve in disguise. Score singly.
- **Self-preference.** An examiner from the same model family as the generator grades
  its relatives generously. The mitigation is operational — different families for
  generation and judgment — but the rubric contributes by keeping every criterion
  answerable from evidence rather than from impression.

Calibrating a lens against human labels, binding a verdict to a content fingerprint,
and deciding what standing a stale verdict retains belong to the neighbouring subject
of verdict integrity; this subject ends at the document. The telemetry and cost of
running examiners at volume belongs to the general practice of operating model
traffic and is not duplicated here.

## Building one, in order

1. **Fix the deliverable class.** Name the artifact type precisely enough that a
   sub-class with different craft does not fit inside it.
2. **Collect incidents, not opinions.** Gather concrete accepted and rejected examples
   in this class from the people who lead the work — the specific behaviours that made
   each acceptable or not. "Responds with a clear silhouette at thumbnail size" is an
   incident; "looks professional" is not. Ten to twenty per criterion dimension is the
   working number.
3. **Sort and retranslate.** Have a second group place each incident under the
   criterion it belongs to. Incidents that land inconsistently are ambiguous and get
   rewritten or dropped; this step is what stops two criteria from measuring the same
   thing under different names.
4. **Write the bars, attach the sources.** Each surviving dimension becomes one
   positively-stated criterion with its citation.
5. **Name the level anchors.** One concrete reference product per level, chosen for
   shared recognisability.
6. **Extract the disqualifiers.** The rejection incidents that were fatal on their own
   become the capped list — typically three to six, never twenty.
7. **Set the ceiling and classify it.** Permanent, arguable, or uncapped, with the
   reason written down and dated.
8. **Version it, then pilot it.** Score a known-good and a known-bad artifact. If the
   known-bad passes, the disqualifier list is short; if the known-good fails, a
   criterion is measuring the wrong thing. Expect four to eight weeks of this per
   class, and expect the pilot to change the document.

## The rubric is also an instrument you read

An artifact meeting every criterion at the highest level its class permits is a
success, and the rubric must read as saying so; render "at the ceiling" with the same
warning treatment as "below the bar" and everyone learns to ignore both. The
distribution says something too: a class where nothing reaches its ceiling has a
process gap, a class where everything does has a ceiling set too low, and a grade
distribution frozen for two quarters usually means the anchors have aged out rather
than that the work has plateaued. All three are readings of the document, not of the
content, and all three are how it tells you it needs a new version.
