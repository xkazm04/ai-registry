---
layer: golden-path
type: golden-path
subject: quality-verdict-integrity
status: forged
use_when: [storing automated quality verdicts for later reuse, deciding whether a recorded score still applies, changing a rubric that graded existing work, claiming an automated grader is calibrated]
techniques:
  - content-hash-binding
  - stale-superseded-unknown-classification
  - condemn-vs-elevate-asymmetry
  - rubric-version-supersession
  - sibling-context-projection
  - calibration-against-confirmed-labels-only
---

# Quality verdict integrity

A machine can grade craft. What it cannot do is remember, on its own, *what* it
graded, *by which standard*, and *how long that grade stays true*. Those three
bindings are the whole subject. A production line that generates content faster
than a human can look at it will accumulate thousands of automated verdicts, and
every one of them is a perishable claim about one exact artifact under one exact
standard. Treat the verdicts as durable facts and the quality layer becomes a
comfortable fiction: a dashboard full of scores that describe artifacts which no
longer exist, graded against a rubric that has since been replaced, by a judge
nobody ever checked against a human.

This subject is the integrity discipline around that: binding a verdict to its
content, classifying how much a recorded verdict still says about the present,
handling the unprovable asymmetrically, retiring verdicts when the standard
moves, giving the judge the surrounding context it needs to avoid false
positives without giving it the pipeline's own bookkeeping, and refusing to call
the system calibrated on anything but confirmed human labels.

The general operator practice of metering model traffic — spend, latency,
sampling of live traces, session plumbing — is a separate concern with its own
home. What follows is only the craft half: what a verdict is bound to, and what
it is entitled to conclude.

## A verdict is a claim about one artifact, not about a slot

The naive schema stores a score on the row that produced it: this step scored 78.
The row is a slot, and slots get rewritten. Re-produce the step and the artifact
underneath the 78 changes while the 78 does not. The schema never encoded which
bytes were examined, so it has no way to notice that they moved. This is [a
verdict is bound to the content it
judged](../_laws.md#a-verdict-is-bound-to-its-content) in its most literal form,
and the fix is equally literal: the verdict carries a fingerprint of the exact
content it read (content-hash-binding), and every read recomputes that
fingerprint over what is on record now and compares.

The comparison is not a validity check that discards the verdict. It is a
**classification**: the same stored verdict is *current* evidence about the
present or *historical* evidence about the past, depending on a fact only
discoverable at read time. A verdict never becomes wrong; it becomes about
something else.

Two consequences that surprise people:

- **The fingerprint must exclude volatile keys.** If the digest covers the whole
  record, then a timestamp, a run identifier, a retry counter or a rendering
  cache path changes the digest without changing a single character the judge
  actually read. Every verdict then reads as historical the moment anything
  touches the row, and the quality layer degrades to noise. The digest covers
  the *judged payload* and nothing else.
- **The exclusion rule is two-way.** Excluding a key on the write side and not
  on the read side (or the reverse) is a silent, total failure: every verdict
  mismatches, every mismatch reads as a change, and the whole layer goes dark
  while every individual component passes its own tests. The projection that
  builds the payload is one function used by both sides — never two functions
  that "do the same thing".
- **A missing fingerprint is never defaulted.** Fingerprinting an empty record
  produces a perfectly valid-looking digest for content nobody read. A caller
  with no binding must produce a *binding-less* verdict, which classifies as
  unprovable and is handled as such. Manufacturing a digest to satisfy a
  non-optional field is how a fabricated binding enters the store.

## Four standings, and the one that must not collapse

A stored verdict against present content is in exactly one of four states, and
the vocabulary is closed on purpose (stale-superseded-unknown-classification):

| Standing | Means | Counts as current quality? |
| --- | --- | --- |
| **current** | fingerprint present, recomputes, matches; standard unchanged | yes |
| **stale** | fingerprint present and recomputes, but does not match — the content moved | no |
| **superseded** | the standard the verdict was issued under has been replaced | no |
| **unknown** | provenance cannot be established at all | no, but see below |

`unknown` is the load-bearing one, and it is where most implementations quietly
fail. It is not a synonym for `stale`. `stale` is a *proven* mismatch: the
fingerprint was there, it was recomputed, it differed. `unknown` is the absence
of proof — no fingerprint was recorded, or the fingerprint that was recorded
cannot be compared because the fingerprinting scheme itself changed underneath
it. Collapsing the two is attractive (both are "not current") and is exactly the
mistake that costs the most: on the day the digest scheme moves, every standing
verdict in the store becomes uncomparable at once, and if uncomparable degrades
to `stale`, every recorded condemnation in the system silently retires in a
single deployment. Nobody gets an alert. Quality appears to improve. Degrade to
`unknown` instead and condemnations survive their own infrastructure migration,
which is the only behaviour a reviewer would have chosen if asked.

Two refinements earn their keep. First, a **dating fallback** for verdicts from
before fingerprints existed: if the verdict is dated and the content records
when it was last written, a verdict issued *before* the last write demonstrably
judged something else and is `stale`; a verdict that cannot be dated against the
content at all stays `unknown`. This is the one legitimate route from an absent
fingerprint to a proven mismatch, and it is available only when both timestamps
exist. It is a fallback for classification, never a basis for *reuse* — see
below.

Second, **`unknown` states its reason**. "No binding was ever recorded" and "the
binding was recorded under a superseded fingerprinting scheme" are the same
standing but different situations, and a reader who cannot tell them apart will
read an infrastructure migration as institutional negligence. Carry the reason
as text on the verdict, and render it wherever the standing is rendered.

This is also the practical answer to
[unmeasured is not a pass](../_laws.md#unmeasured-is-not-a-pass): there is no
neutral score for "we do not know". There is a label.

## Condemnation and elevation are not symmetric

The tempting rule is one rule: a verdict counts when its provenance is current,
and does not otherwise. It is wrong, and understanding why is the centre of this
subject.

A verdict is used for two opposite purposes. **Elevation** — this artifact is
good, promote it, stop reviewing it, let it ship. **Condemnation** — this
artifact failed, hold it, flag it, show a human. The cost of being wrong is
wildly different in the two directions. A wrongly-retained condemnation costs a
human ten minutes looking at something that turns out to be fine. A wrongly-
retained elevation ships bad work under a green label and, worse, teaches the
whole organisation that green means nothing.

So the provenance rule is asymmetric (condemn-vs-elevate-asymmetry): the set of
standings that may *condemn* is strictly looser than the set that may *elevate*.
`unknown` condemns and does not elevate. `stale` warns and does not elevate.
Only `current` elevates. The unprovable falls to the conservative side, always,
by construction rather than by reviewer discretion — because the direction of
the fall is the property that keeps every other guarantee in this subject
honest. It is the same instinct as
[no gate self-certifies](../_laws.md#no-gate-self-certifies): where the evidence
runs out, the system does not get the benefit of the doubt.

There is a third use, and it is where implementations get the asymmetry
backwards: **reuse**. When a batch grader decides whether it may skip
re-judging a piece of content because a stored verdict already covers it, the
bar is *stricter than either* of the other two. `unknown` condemns, but it must
never authorise a skip: skipping on an unprovable binding lets genuinely
unjudged content read as judged, which is the exact lie this whole subject
exists to prevent. The cost ledger makes the rule obvious — a wasted re-judge
costs one model draw; a wrong skip costs the credibility of every green label in
the system. Every uncertainty judges. In particular, reuse is never decided on
timestamps: the binding is the fingerprint and nothing else.

A concrete corollary: **a failing verdict is attached to the artifact even when
it is not applied.** If a piece of content was condemned, then re-produced, and
nobody has re-judged it, the correct rendering is not "no verdict" — it is "a
failing verdict exists, it speaks for the previous version, this version is
unjudged". Both halves must be visible. Dropping the verdict makes an unjudged
artifact indistinguishable from a passing one; applying it as current makes a
possibly-fixed artifact indistinguishable from a broken one. Attaching it with
its standing, plus a plain-language note stating what it does and does not
prove, is the only rendering that is true.

## The judged payload is exactly the artifact

The most severe and least obvious defect in this whole area is **contamination
of the judged payload**. A grading pipeline assembles a bundle to hand the
judge: the artifact, plus, almost accidentally, the things the pipeline happened
to be carrying — the prompt that generated the artifact, the plan step, the
retry history, the tool trace. Each addition looks like helpful context. What it
actually does is hand the judge the *intent* alongside the *result*, and a
grader shown a confident statement of what a thing was supposed to be will
grade what it was supposed to be.

The effect is not subtle. In a controlled comparison, moving the generation
prompt out of the judged payload moved mean scores by roughly seventeen points
on a hundred-point scale — an order of magnitude larger than the run-to-run
noise of the judge itself. It is also self-concealing when the rubric penalises
leaked instruction text as a defect: the judge sees the leaked prompt, notes it
as a flaw, and *still* scores higher, so the contamination shows up as neither a
crash nor an obviously implausible number.

The rule is therefore absolute: **the judged payload is the artifact as a
consumer would receive it, and nothing the pipeline attached for its own
bookkeeping.** Build it by explicit projection — a named allowlist of fields
that belong to the artifact — never by handing over the working record minus a
few redactions. Denylists leak, and this particular leak is the proof: a
grader that copied every field it had not explicitly been told to strip
graded a generation instruction as the artifact for roughly three artifacts in
ten, for months, while docking those same artifacts for leaked instruction
text. The harness injected the defect it penalised; an allowlist could not have
expressed that bug. Note the double duty: the projection that keeps the payload
clean is the projection the fingerprint covers, so volatile-key exclusion and
contamination control are one mechanism, not two.

## Context is not contamination

The mirror-image failure is starving the judge. An artifact that is legitimately
correct in the context of its neighbours reads as broken in isolation — a value
that looks inconsistent until you see the sibling defining it, a reference to
something produced two steps earlier. The judge reports a defect that is not
there, and false positives are more corrosive than misses: a reviewer who has
overturned three verdicts stops reading the fourth.

The resolution is not to relax the payload rule but to distinguish two kinds of
surrounding material (sibling-context-projection). **The pipeline's own
bookkeeping** — intent, prompts, plans, self-reported success — is contamination
and stays out. **The artifact's peers** — the sibling content the artifact must
agree with, in the same shape a consumer would see it — is context and goes in,
clearly demarcated as reference material, never as part of the graded object.
Supplying blind siblings this way measurably raises scores by a few points where
contamination raised them by seventeen: the difference between removing a
spurious penalty and removing the judge's job.

Two disciplines make this safe. First, project siblings **structurally, not
scalar-only**: a projection that flattens each neighbour to its top-level
numbers will emit an empty context for every artifact whose real content sits nested,
and the resulting silent-empty case can cover a large minority of a corpus
without a single error. Count the non-empty projections and treat a low rate as
a defect in the harness, not as a property of the content. Second, the injected
context **redirects scrutiny without lowering the bar**: a project rule handed
to the judge tells it what to check, and a violation of that rule is itself a
defect — it is never a licence to excuse work that would otherwise fail.

## When the standard moves, the verdicts retire

A rubric is a versioned instrument. When it changes in a way that would change
scores — new criteria, moved anchors, a corrected payload projection, a fixed
harness defect — every verdict issued under the previous version is
`superseded` (rubric-version-supersession). Not deleted: superseded verdicts
remain visible as evidence of what was believed and when, and they are the only
way to audit whether the change was an improvement. But they stop counting as
current quality, immediately and without exception, because the alternative is a
score distribution silently mixing two instruments.

The version travels *inside* the verdict's binding, alongside the content
fingerprint. Two independent invalidators, one comparison at read time. And the
version history is prose that survives: each bump records what changed and why,
so a reader confronted with a corpus of superseded verdicts can tell whether
they are worth re-running.

Selection and strictness are two different questions and must be asked
separately. **Selection**: only the verdicts at the *newest version present for
this artifact* speak for it — so a lenient older pass can never outvote a newer
strict fail, and an older fail can never outvote a newer pass. **Strictness**:
whether that newest-present version *is* the version in force, which is what
decides `superseded`. Spelling selection as "at or above the current version" is
the classic bug: it agrees with newest-present today and diverges the instant
the version is bumped, at which point two generations of verdicts are retained
together and the pipeline acts on whichever one failed.

The hardest instance is the harness defect. When a bug in the grading harness is
found — a contaminated payload, a context projection emitting nothing — it does
not invalidate one run. It makes **every verdict ever issued under that harness
provisional**, and the honest response is a version bump that supersedes all of
them, plus a measured comparison that quantifies the defect's effect so the size
of the correction is on record rather than assumed.

## One counted subset, or the dashboards disagree

Every surface that reports "how good is this content" must count *exactly* the
verdicts the gate counts. This sounds like a display concern and is not: a
summary view that averages every stored row includes superseded and stale ones
and reports a failure count the system's own gate does not hold, and the two
numbers get defended by two different people in the same meeting. Draw the line
in one place — [one authority per quantity](../_laws.md#one-authority-per-quantity)
— and have every consumer read that predicate rather than re-implement the
filter. The eligible set is narrow in more than one dimension: a verdict from a
grader that does not cover this kind of artifact never speaks for it, while a
human's verdict always may. The store itself stays append-only and complete; the
filter is applied on read. Retire from the *score*, never from the *record*.

## Calibrated means measured against confirmed human labels

The last integrity boundary is the claim that the automated grader agrees with
people (calibration-against-confirmed-labels-only). This claim is worth exactly
the labels behind it, and there is only one kind of label that counts: one a
human deliberately confirmed against the same rubric text the judge received.
Labels inferred from a proxy — a step that was accepted, a piece of content
nobody complained about, a prior judge run — are not human labels. They are the
system's own opinion wearing a costume, and calibrating against them measures
self-consistency, which is not a virtue.

So a grading system's standing is a small closed vocabulary whose honest default
is never the top one — no measurement at all, provisional, superseded, enforced
— and a system whose entire label set is seeded from prior evidence rather than
confirmed by a person is provisional: deliberately not a green. Saying so, in
the same report that prints the agreement rate, is the practice. The threshold
is stated once and never lowered to make a run pass; lowering it is the only
move in this subject that a re-measurement cannot undo.

Three mechanical rules keep the loop clean. Agreement is chance-corrected over a
sample stratified across the score range, not a raw percentage over whatever was
convenient. The calibration run **writes nothing to the verdict store** —
calibration measures the instrument, and mixing it into the corpus makes the
instrument part of its own evidence. And the measurement is **re-run whenever
the standard is versioned**, because an agreement figure from a superseded
rubric describes an instrument that no longer exists.

The naive reading is that calibration is a launch gate you pass once. It is a
standing measurement with a confidence interval, and a system that reports an
agreement figure without a sample size has reported nothing.

## The failure modes, collected

- **The verdict on a slot.** Score stored without a content fingerprint; content
  re-produced; the score now describes a thing that no longer exists.
- **A volatile key inside the digest, or a one-way exclusion.** Either makes
  every verdict read as historical; the layer goes dark while looking healthy,
  and no component test fails.
- **Uncomparable degraded to stale.** A change of fingerprinting scheme quietly
  retires every standing condemnation in one deployment.
- **Symmetric provenance.** Elevation, condemnation and reuse held to the same
  evidentiary bar; the unprovable pass ships and the unjudged item reads as
  judged.
- **Dropped failing verdicts.** "Unjudged since the change" rendered as no
  finding, which reads as a pass.
- **Contaminated payload.** The generation intent inside the graded object; the
  judge grades the intent; scores inflate by more than any real quality movement.
- **Starved judge, or silent-empty context.** Correct work condemned for
  cross-references it was never shown — and a projection that emits nothing for
  a third of the corpus while reporting no error.
- **Mixed instruments.** Verdicts from two versions aggregated into one
  distribution, usually because selection was spelled "at or above current".
- **Two counted subsets.** A summary surface averages every stored row and
  reports a quality number the gate itself does not hold.
- **Calibration on proxies.** Agreement measured against the system's own prior
  outputs and reported as human agreement.
