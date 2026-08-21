---
layer: golden-path
type: golden-path
subject: ai-assistance-detection-and-fairness
status: forged
use_when: [reading a take-home or work-sample submission that a model may have written, deciding whether an over-reliance flag is fair, designing authenticity checks for an assessment, presenting authenticity evidence to a hiring panel]
techniques:
  - never-penalise-tool-use-invariant
  - planted-canary-with-real-ground-truth
  - frozen-naive-baseline-comparison
  - brief-paste-ratio-and-bulk-paste-tells
  - behaviour-matched-peer-test-for-over-reliance
  - observed-process-is-supporting-not-load-bearing
---

# AI assistance detection and fairness

The question a hiring team thinks it is asking is *did this candidate use a
model?* That question is both unanswerable and the wrong one. Unanswerable
because no reliable instrument for it exists; wrong because the answer, if you
had it, would not tell you anything you are allowed to act on. Using a language
model to draft, refactor, check and accelerate work is now ordinary
professional practice in most of the roles that run work samples. A hiring
process that penalises it is not screening for integrity, it is screening for
candidates who work the way the panel worked three years ago.

The question a principal practitioner asks instead splits in two, and the split
is the whole subject:

- **Authorship.** Does the candidate own the submission — can they explain the
  decisions in it, defend the ones that are contestable, and tell you which
  parts they would change and why?
- **Over-reliance.** Did the candidate *verify* what came back, or accept it?
  Verification is a behaviour with observable consequences in the artifact. Tool
  use is not.

Only the second pair is measurable, and only the second pair is legitimate to
score. Everything below is machinery for measuring those two things without
smuggling the first question back in through a side door.

## Why stylometric detection is a discrimination mechanism, not a check

The instinct is to buy a detector: paste the text, get a probability. This is
the single worst decision available in the subject, and the reason is not
accuracy in the abstract — it is *whose* errors it makes.

Detectors built on fluency and predictability statistics flag writing that is
regular, conventional and low-perplexity. That is exactly the profile of a
competent writer working in a second or third language, of somebody writing in
a house style they were trained into, of a technical writer taught to be plain,
and of anybody who has been coached to write simply. Published evaluations have
repeatedly found false-positive rates near 60% on essays by non-native writers
of the assessment language while the same detectors were near-perfect on native
schoolchildren's essays; broader later replications put the gap lower but still
above 20%, and multi-detector audits across sixteen tools have found none that
was uniformly fair across language background and ethnicity. Litigation and
regulator attention have followed, which is the predictable end state.

Read that as a hiring instrument rather than a research result. A detector with
an error rate that varies by language background is a proxy for national
origin. Wiring it to an adverse outcome is not "using a tool with known
limitations"; it is building a selection procedure whose failure mode falls on
a protected group. The size of the false-positive rate is a second-order
detail. **The unevenness is the defect.** A detector that was wrong 30% of the
time uniformly would be useless; one that is wrong 20% of the time only for
people who learned the language late is unlawful in several jurisdictions and
indefensible in all of them.

Provenance signals do not rescue this either. Model-side text watermarking is
real and works on substantial verbatim passages, but it degrades sharply under
paraphrase and translation round-trips, covers only the models that implement
it, and is absent from the entire open-weights population; embedded content
credentials can be stripped by any intermediate step. So watermark evidence is
usable as *positive* confirmation when it is present and never as evidence of
absence. A clean watermark scan means "no watermark found", which is
compatible with heavy assistance from an unwatermarked model, with a paraphrase
pass, and with a candidate who wrote every word. Treat it exactly as the
[absence-of-evidence](../_laws.md#absence-of-evidence-is-not-evidence) law
requires: a distinct *not detected* state, never a clean bill.

## The reframe: measure distance from delegation, not proximity to a model

Once you stop trying to identify the tool, a tractable measurement appears.
Fully delegated work has a shape. It is what you get when a capable model is
handed the brief and nothing else — no reading of the codebase it must fit, no
choice about which constraint to honour when two conflict, no noticing that the
supplied material contains a mistake. That artifact can be *generated*, frozen,
and used as a reference point (frozen-naive-baseline-comparison). Distance from
it is measurable, and it is a measurement of judgment rather than of authorship.

The second tractable measurement is verification. Plant a real, deliberate flaw
in the material the candidate is given — a wrong constant, a contradictory
requirement, a subtly broken assumption — and record the ground truth of what
was planted. Then read what the submission did about it: addressed it, flagged
it without fixing, propagated it unchanged, or the artifact simply does not
touch it (planted-canary-with-real-ground-truth). A candidate who used a model
heavily *and* caught the canary has demonstrated the exact competence the role
needs. A candidate who wrote every line by hand and propagated the flaw has
not. Notice what the canary does not care about: which of them used a model.
That indifference is the property that makes it fair.

The third is behavioural shape at the margin: a submission produced by pasting
a brief once and pasting a result back exhibits a containment relationship
between the brief's text and the artifact's, and a session with almost no
intermediate editing (brief-paste-ratio-and-bulk-paste-tells). This is the
weakest of the three and must be handled as such.

## The invariant that has to hold, and be tested

State it as a testable property, not an aspiration: **a candidate who used a
model and verified its output must not score lower than a comparable candidate
who verified without a model.** That is never-penalise-tool-use-invariant, and
the important word is *tested*. Every team believes it does not penalise tool
use; the belief is worthless until you compute both group means on real cohorts
and check the gap against a declared tolerance, with a declared minimum group
size below which the comparison says *inconclusive* rather than *pass*
([a claim carries its sample](../_laws.md#a-claim-carries-its-sample-and-its-basis)).
The two most common ways to fail it silently: a rubric line that rewards
"original voice", and a reviewer instruction that mentions assistance at all.

The mirror-image test governs the over-reliance flag itself. An over-reliance
flag is unfair **only** when it lands on a model-using candidate while a
behaviour-matched peer — same verification habit, same evidence in the artifact,
no model — is not flagged. In that pair, the only differing variable is the
tool, so the tool is what was punished. If both are flagged, the justification
is the shared behaviour, and that is fair, however uncomfortable it looks in
aggregate (behaviour-matched-peer-test-for-over-reliance). Aggregate flag rates
that differ between model users and non-users prove nothing on their own; the
matched pair is the only construction that isolates the variable.

## Process signals are supporting evidence and nothing more

Teams reach for process telemetry — edit cadence, session length, revision
history, paste events — because it feels objective. It is objective and it is
weak, for a reason that only shows up under adversarial testing: **process
signals are the cheapest thing in the pipeline to fabricate.** A candidate who
sets out to look diligent can produce a plausible commit rhythm, a decision log
written after the fact, and a revision history with no bulk paste in it. A
deterministic scorer reading those signals will rank that candidate alongside
honest ones. The instruments that resist fabrication are the ones anchored to
the artifact and to the specific case: the canary verdict, distance from the
frozen baseline, and a live conversation in which a human asks the candidate
why (observed-process-is-supporting-not-load-bearing).

This ordering has a design consequence. Never let a process signal alone move a
candidate across a decision boundary, and never let its *absence* be read as
guilt. A candidate on a locked-down machine, on a flaky connection, or simply
working offline produces no telemetry; that is a
[no-signal state](../_laws.md#absence-of-evidence-is-not-evidence), and the
candidate's process must never stall on your capture working
([a candidate's process never stalls on your constraints](../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
Capture what a professional would consider their own work product — files,
commits, submitted prompts they chose to share — and never keystrokes, never
the screen, never anything they did not know was recorded.

## No data must never read as unfair

Every check in this subject needs four outcomes, not two: **pass**, **fail**,
**inconclusive**, and **not evaluable**. The distinction between the last two
carries the ethics. *Inconclusive* means the check ran and could not decide —
too few candidates in a comparison group, a canary the artifact never reached.
*Not evaluable* means the check did not run — no canaries were planted, no
baseline exists for this case, telemetry was off. Collapsing either into
*fail* produces the failure mode this domain is most prone to: a candidate
penalised for a gap in your instrumentation.

The same rule forbids the seductive shortcut of manufacturing checks to fill
the report. A canary invented after the fact, with no recorded ground truth of
what was actually planted, grades the candidate against noise — it will
"detect" whatever the reader wants. An empty canary set means *not run*, and it
must render as *not run*, never as *clean*
([say only what the record holds](../_laws.md#say-only-what-the-record-holds)).

A third state hides between "ran" and "did not run" and is the one teams miss:
a check that ran **degraded**. Where any instrument has a fallback path — a
cheap deterministic approximation when the expensive one is unavailable — the
fallback's output looks like a healthy result and passes every well-formedness
test. Record *why* each check produced what it produced, and distinguish "the
deterministic path ran because that is what we chose" from "the deterministic
path ran because the real one failed". Without that provenance, a run in which
every instrument fell back reports as a clean green, and the report that is
most wrong is the one that looks best.

There is also a way to write a fairness check so that it can never fail. If the
check is guarded to run only on a path that structurally cannot produce the
thing being checked — an over-reliance invariant evaluated only over a
deterministic fallback that never assigns flags — it is vacuously true forever,
and its permanent green is read as evidence. **Test every fairness invariant on
the path that actually makes the decision**, and confirm the check can fail by
making it fail once on purpose.

## Presenting it without creating the penalty you avoided

The last place the invariant breaks is the screen. A report that shows a
"baseline similarity" number on a red-to-green meter has told the reviewer it
is a penalty, whatever the caption says. Rules that hold up:

- Render model use as a **fact about how the work was done**, never as a score
  component, never in a warning colour, never adjacent to a risk total.
- Render baseline distance as a plain number with its interpretation in words,
  with no meter and no colour ramp — it is a measurement of judgment distance,
  and a ramp converts it into a verdict the instrument cannot support.
- Show honest darkness: a check that did not run shows as *not run* with the
  reason, not as an empty green tick and not as an ominous blank.
- Attach the sample and basis to every rate, and mark every inference as an
  inference ([inference must look like inference](../_laws.md#inference-must-look-like-inference)).
- No adverse outcome — no rejection, no "integrity" note on a record — comes
  out of this machinery without a named human who reviewed the artifact
  ([no adverse outcome is solely automated](../_laws.md#no-adverse-outcome-is-solely-automated)).

## Penalties, if you must have them, are schedules with reasons

Where a numeric authenticity adjustment exists, it must be a published schedule
in which each line names the behaviour it penalises and why that behaviour
matters for the role — not a black-box risk score. Two rules keep such a
schedule from becoming a detector by another name. First, no line may be
triggered by model use, model style, or fluency; every line must name an
artifact-anchored behaviour. Second, a submission produced under live
observation waives the process-derived lines entirely: you watched, so the
inference those lines substitute for is unnecessary, and running them anyway
double-counts.

## What is out of scope, and who owns it

The seams matter here because three neighbouring subjects look like this one
from a distance.

**Designing the case itself** — what task to set, how to make it resistant to
one-shot delegation, how long it may take, what to publish about permitted
tools — belongs to the work-sample design subject. This subject assumes a case
exists and asks how to read what came back. The overlap is real at exactly one
point: the canary must be planted at design time, so the design subject owns
where flaws go and this subject owns how their verdicts are graded.

**Whether the instrument discriminates between strong and weak candidates at
all** — reliability, construct validity, whether scores predict anything —
belongs to the instrument-validation subject. It is the prerequisite: an
authenticity layer bolted to a work sample that does not measure competence
adds precision to noise. Assume that work is done elsewhere and do not redo it
here.

**An adversarial résumé** — a document engineered to pass a screen, with
fabricated employers, borrowed history, or keyword stuffing — is a *different
problem*, owned by the authenticity-screening subject for candidate documents.
The difference is not the technique, it is the construct. There, deception is
the thing being measured and the document is itself the claim. Here, deception
may be entirely absent: the overwhelming majority of model-assisted
submissions are honest work by candidates using the tools of their trade. An
instrument built for the adversarial case, pointed at this one, will produce
exactly the discrimination this subject exists to prevent.

Finally, the general craft of running, metering and logging model calls — how
a judging model is invoked, what a degraded run costs, how outputs are cached —
is a neighbouring domain's business. What belongs here is the hiring judgment
wearing that clothing: what a verdict about a person may conclude, why the
verdict vocabulary is closed, and what a failed check means for the candidate
who is waiting.
