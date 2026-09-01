---
layer: golden-path
type: golden-path
subject: generative-artifact-gating
status: forged
use_when: [wiring a gate around a paid generation step, a generative step is always green, deciding whether an artifact may advance to the next paid stage, recording who chose a generated candidate]
techniques:
  - placeholder-is-not-an-asset
  - grade-the-selected-candidate
  - generation-history-as-artifact
  - auto-picked-vs-human-chosen-provenance
  - gate-before-every-credit-spend
  - cite-evidence-not-descriptions
---

# Generative artifact gating

A production line that spends money to make content has one question it must be able to
answer honestly at every joint: *did a generator actually produce something here, or is
this a stand-in that happens to render?* Everything in this subject follows from taking
that question seriously. It is not a philosophical question. A placeholder is cheap,
deterministic, always available, and looks exactly like success to any check that asks
whether a field is populated. A generated asset costs money, takes wall-clock time, can
fail, and — for the asset classes whose only producer is a generator — is the only thing
that can carry the line forward. A gate that cannot tell them
apart is not a gate; it is a formality that converts the absence of work into a green
light.

The subject is deliberately narrow and it is a **production-line** subject, not an
aesthetic one. Grading a generated output as a finished piece of craft — is the
composition good, is the style on-brand, does the lighting read — is a separate concern
with its own rubrics. What is at stake here is narrower and more mechanical: *may this
artifact advance, and may we spend on the next stage.* Those two decisions are load-
bearing in a way a quality score is not, because they gate irreversible expenditure.

## The existence check is the enemy

Nearly every generative-step gate begins life as an existence check, and nearly every one
of them is wrong in the same way. The step stores which candidate was chosen. The check
asks whether that stored selection is present and plausible — an index that is a
non-negative number, a field that is not empty, a record that parses. It passes. It passes
whether or not a generator has ever run, because a default index, a seeded stand-in, and a
real generated asset all satisfy "present and plausible" identically.

This is worth stating as a measurement rather than a worry. Instrument a fleet of such
steps and mutate the content behind them: scale every number, replace every string, and
re-run the verdicts. In one such audit **44 of 47 registered generative steps were
provably insensitive to any change in their own content** — no numeric-scaling or
string-replacement mutation over the live definitions moved a single verdict. Those 47
steps had been reporting green for months. They were reporting on the existence of an
integer.

The general method that measurement demonstrates is the most portable idea in this
subject: **mutate what a check reads and confirm the verdict moves. A check whose verdict
never changes under mutation of its own input is not a check.** It costs an afternoon to
build and it is the only way to find out that a gate is decorative before a milestone
does. Run it over the whole registry of steps, not a sample, and treat the count of
insensitive steps as a headline production metric — it is the fraction of your green that
means nothing.

## Five states, not two

The reason existence checks survive so long is that teams reach for a binary. Pass or
fail, green or red. A generative step has at least five distinct epistemic states and
collapsing any pair of them is how the line starts lying:

- **The step has not produced at all.** No selection is recorded. This is *not yet run* —
  a pending state, distinct from every judgment about content, and the only one whose
  remedy is simply "produce".
- **Something was produced but nothing was ever generated.** A selection exists; no
  history, no candidates, no attempt stands behind it. This is not a failure of quality;
  it is the absence of work. It must render as *not measured*, and it must never be
  reported at the same severity as a bad result, because the remedy is different: run the
  generator.
- **A deterministic stand-in occupies the slot.** Something renders. It is structurally
  valid. For a class the generator alone can produce, no local edit turns it into a real
  asset — the generator has to run — and the correct verdict is a *deferral naming what is
  missing*, not a pass and not a failure. Where the class has a terminal deterministic
  producer, this state is not reachable at all; that case is the next section.
- **A real generated asset is selected and resolves.** This may advance. It should pass at
  the lowest tier that its evidence actually supports, and the verdict should name the
  asset it judged.
- **The selection is broken.** It points at nothing, or it points at a candidate that
  disagrees with the field being graded. This is a genuine failure — an inconsistency
  inside the artifact — and it is more urgent than a missing asset, because it means the
  record of what happened is corrupt.

The four-state shape is why the deferral tier matters. When a stand-in is holding the
slot, the honest report is not "this step is incomplete" in the abstract; it is "a visual
artifact is missing, and only a generator run supplies it." Reporting a missing generated
asset at the same rung as a missing configuration value sends someone to edit a file for
an hour looking for the setting that will fix it. **Report a deferral at the rung whose
work would actually resolve it.** The ladder of rungs itself, and the statuses that ride
on it, are a neighbouring concern; what belongs here is the rule that a generative
deferral is a *perceptual* deferral, because a generator run is not a config edit.

The governing principle, worth saying in one line and putting on the wall: **honesty over
greenness.** A gate exists to be believed. Every design choice that trades a small amount
of green for a truthful state is correct, and the trade is never close.

One invariant keeps the five states disciplined: **a cleanly produced artifact may only
grade as pass, pending or deferred — never as a failure.** Failure is reserved for
internal contradiction: a selection resolving to nothing, or a selected candidate that
disagrees with the field claiming to select it. Holding that line makes a failure
informative. When one appears, nobody wonders whether the work is merely unfinished; the
record itself is broken, and that is a different and more urgent class of problem.

## Deterministic is not a synonym for unfinished

Everything above routes on a proxy, and the proxy is worth naming because it is load-bearing
and it is not always true: *was a generator involved* stands in for *has the work happened*.
The two coincide exactly when a generator is the only producer an asset class has. For a
class that also has a **terminal deterministic producer** they come apart, and the gate then
files a deferral over an artifact that is finished.

Those classes are easy to recognise once looked for: they are the ones a parameter set
describes completely. A rope, a cable, a railing, a road, a wire — a curve with a profile and
a depth reproduces one exactly, faster than a generation and with control a generation does
not offer. A practitioner running an otherwise fully generative asset pipeline reached for a
curve instead of the generator for exactly this reason and put the difference at roughly five
times the speed at better quality. This bundle already holds a subject whose shipped artifact
is of that kind: a procedural level plan is locally computed, reproducible from a seed, and
terminal — nobody regenerates it with a model — and the seed contract standing behind it is
the evidence-of-work record, playing the part a generation history plays for a generated
asset.

So origin is not a boolean. It has three values — **generated**, **constructed**,
**stand-in** — and only the third defers. A constructed artifact carries its own evidence:
the algorithm, its version, the parameter set, the seed. A stand-in carries none, and that
absence is what makes it a stand-in. Collapsing *constructed* into *stand-in* costs more than
a wrong verdict, because the deferral names a generator run as the work that resolves it: the
line then pays a paid stage to replace a finished artifact with a worse one. That is the
failure the neighbouring repair-economics subject calls refusing the fix that cannot help,
arriving one stage earlier and costing more.

Which producers are terminal for a class is a **declaration**, made once per asset class and
reviewed like any other, never inferred from the artifact in front of the gate. Inference is
what the origin field exists to prevent, and it does not become safe here.

## Grade the candidate, not the fact of a choice

The repair for the existence check is mechanical and it generalises: **resolve the
selection to the object it names, and grade that object.** The stored index is a pointer.
A pointer is not evidence. Follow it into the generation history, find the kept candidate,
and ask that candidate the questions — was it produced by a generator or seeded, does it
carry an origin, does its own recorded position agree with the field that claims to select
it. A gate that never dereferences its pointer can only ever grade the pointer.

## The history is part of the artifact

The instinct is to keep the winner and discard the rest: one field holds the chosen asset,
generation is a transient act. That instinct destroys the only evidence that could
distinguish the five states above. **The set of candidates, their origins, and the record
of who kept which one are part of the artifact, not scaffolding around it.** An artifact
with a chosen asset and no history cannot prove the asset was generated. An artifact with
history can be re-judged later, can be audited, can answer "how many attempts did this
take" — which is the only honest input to whether the pipeline is improving.

This has a corollary that catches teams by surprise: the code that *produces* the artifact
and the code that *grades* it must share one source of shape. A verdict is only honest if
it can rely on the structure of what produced the thing it judges. When the producing half
and the grading half are written separately, they drift, and the drift shows up as a gate
that silently degrades to an existence check because the field it wanted stopped being
populated. Single-source them, in the same place, and let the grader read the producer's
shape rather than a copy of it.

Two properties make that pairing work. The grader is a **pure function of the artifact's
own stored state** — it reads nothing else — so an interactive surface, a re-grade on a
server and an unattended produce-and-accept loop all reach the same verdict; a gate whose
answer depends on where it ran cannot be cited anywhere. And the seeded stand-in is
**deterministic**: no wall-clock stamp, no random identifiers, so the same input always
yields the same artifact and content fingerprints stay stable. A stand-in that changes
every time it is written breaks every verdict bound to a fingerprint, and it breaks them
invisibly.

## Provenance: four values, and one rule about back-filling

Every selection carries a provenance, and it needs four values, not a boolean:

| Value | Means |
| --- | --- |
| **none** | nothing has been selected |
| **auto** | the system picked, by rule or by default, with no human in the loop |
| **human** | a person examined the candidates and chose |
| **unrecorded** | a selection exists but the pipeline predates the provenance field, or lost it |

`unrecorded` is not `auto`. Conflating them destroys the ability to measure how much of
the line is actually being reviewed, which is the number a producer needs most. And the
hard rule: **an auto-pick is never back-filled as a human choice.** Looking is not
choosing; promotion happens only on an explicit act of selection. Provenance is recorded
and reported, and it does not move the verdict — the goal is not to force a click, it is
to stop the machine's pick being cited as a person's.

## Gate placement is an economic decision

In a pipeline where each stage costs money and each stage **amplifies the defects of its
input**, gate placement is not a matter of taste. A downstream model reproduces and
magnifies whatever it is fed; no later stage repairs a bad source. So the cheapest possible
placement of a gate is *immediately before the first paid stage*, and the cost of a missed
defect compounds: a flaw that survives to stage three has been paid for three times, and
the work to correct it now includes discarding two stages of derived output that were
faithful to a bad input.

The doctrine that follows is uncomfortable and correct: **before every step that spends
money, there is a gate, and the gate is on the input.** Verify the thing you are about to
pay to transform, at the fidelity the next stage will actually consume — close, at scale,
under the conditions where the defect would show — not the thing you already paid to
produce. Gates are the moat; the temptation to skip one is always framed as speed and is
always paid back with interest at the stage where the defect finally becomes visible.

## Corrective feedback must cite served evidence

When a gate rejects, something has to say what to fix, and the usual answer is a
paraphrase: a person looked at the artifact and described what was wrong. A generator
handed a paraphrase optimises against the paraphrase, and the paraphrase usually smuggles
in a target value nobody decided. Two rules follow. **A citation into a corrective prompt
must name a real, served location** — an artifact that exists and can be fetched and
looked at — never a description of one, and never a sample invented to stand for one. And
**corrective language states what "fix this" concretely means for the class of deliverable
without inventing the target**: name the axis, name the evidence, leave the value to the
rubric or canon that owns it. A correction that ships an unauthorised number has quietly
become the source of the design.

## Failure modes worth naming

- **Green by default.** A step that has never run reports the same colour as a step that
  passed. Ranked first because it is the most common and the most expensive.
- **Grading the pointer.** The selection is validated; the candidate is never opened.
- **The stand-in that graduated.** A seeded placeholder was good enough for review, review
  passed, and nothing in the pipeline ever again asks whether a generator ran.
- **Provenance laundering.** Auto-picks quietly become human choices through viewing,
  reordering, or a migration that defaults the field.
- **The gate after the spend.** Verification sits at the end of the stage it should have
  guarded, so it can only tell you what you already bought.
- **Structural completeness mistaken for readiness.** Every field is populated, every
  record parses, and no pixel was ever generated. Structural proof is necessary and never
  sufficient.

## What is next door

Deciding *what to do* with a rejection — regenerate from the source, repair in place, or
accept and move on — is an economics question owned elsewhere. The rubric that scores a
generated mesh or a source image on its own merits is owned elsewhere. The ladder of
evidence rungs and the statuses a verdict may take is owned elsewhere. This subject owns
only the joint: the gate that stands between an artifact and the next stage of spend, and
the honesty of the state it reports.
