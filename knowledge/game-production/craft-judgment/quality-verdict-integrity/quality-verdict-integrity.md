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
graded, *by which standard*, and *how long that grade stays true* — those three
bindings are the whole subject. A line that generates content faster than a human
can look at it accumulates thousands of verdicts, each a perishable claim about
one exact artifact under one exact standard. Treat them as durable facts and the
quality layer becomes a comfortable fiction: a dashboard of scores describing
artifacts that no longer exist, graded against a rubric since replaced, by a
judge nobody ever checked against a human. Metering model traffic is a separate
concern with its own home; this is the craft half.

## A verdict is a claim about one artifact, not about a slot

The naive schema stores a score on the row that produced it: this step scored 78.
The row is a slot, and slots get rewritten. Re-produce the step and the artifact
underneath the 78 changes while the 78 does not; the schema never encoded which
bytes were examined, so it cannot notice they moved. This is [a verdict is bound
to the content it judged](../../_laws.md#a-verdict-is-bound-to-its-content) at its
most literal, and the fix is equally literal: the verdict carries a fingerprint
of the exact content it read (content-hash-binding), recomputed over what is on
record and compared at every read.

That comparison is not a validity check that discards the verdict. It is a
**classification**: the same stored verdict is *current* evidence about the
present or *historical* evidence about the past, depending on a fact only
discoverable at read time. A verdict never becomes wrong; it becomes about
something else.

Three rules make the binding trustworthy. The digest covers the *judged payload*
and **excludes volatile keys** — a timestamp or retry counter inside it makes
every verdict read as historical the moment anything touches the row. The
exclusion is **two-way**, from one projection function used by both the write and
the read path; a one-sided exclusion is a silent total failure in which every
verdict mismatches, the layer goes dark, and every component still passes its own
tests. And a missing fingerprint is **never defaulted** — a digest over an empty
record binds to content nobody read, so a caller with no binding produces a
*binding-less* verdict, which classifies as unprovable.

## Four standings, and the one that must not collapse

A stored verdict against present content is in exactly one of four states, and
the vocabulary is closed on purpose (stale-superseded-unknown-classification):

| Standing | Means | Counts as current quality? |
| --- | --- | --- |
| **current** | fingerprint present, recomputes, matches; standard unchanged | yes |
| **stale** | fingerprint present and recomputes, but does not match — the content moved | no |
| **superseded** | the standard the verdict was issued under has been replaced | no |
| **unknown** | provenance cannot be established at all | no, but see below |

`unknown` is the load-bearing one, and it is not a synonym for `stale`. `stale`
is a *proven* mismatch: the fingerprint was there, it was recomputed, it
differed. `unknown` is the absence of proof — no fingerprint recorded, or one
that cannot be compared because the fingerprinting scheme changed underneath it.
Collapsing the two costs the most on the day the digest scheme moves: every
standing verdict becomes uncomparable at once, and if uncomparable degrades to
`stale`, every recorded condemnation retires in a single deployment. No alert
fires. Quality appears to improve. Degrade to `unknown` instead and condemnations
survive their own infrastructure migration.

Two refinements earn their keep. A **dating fallback** — a verdict predating
fingerprints but dated before the content's last write demonstrably judged
something else, so it is `stale` — is the one legitimate route from an absent
fingerprint to a proven mismatch, and it classifies only, never authorising
*reuse*. And **`unknown` states its reason**, because "no binding was ever
recorded" and "recorded under a superseded scheme" are one standing but two
situations, and a reader who cannot tell them apart reads a migration as
institutional negligence. There is no neutral score for "we do not know" —
[unmeasured is not a pass](../../_laws.md#unmeasured-is-not-a-pass) — only a label.

## Condemnation and elevation are not symmetric

A verdict serves opposite purposes at wildly different cost, and one rule for all
of them is the central error. A wrongly-kept **condemnation** costs a human ten
minutes on something that turns out to be fine; a wrongly-kept **elevation**
ships bad work under a green label and teaches the organisation that green means
nothing. So the provenance rule is asymmetric
(condemn-vs-elevate-asymmetry): the standings that may condemn are strictly
looser than those that may elevate. `unknown` condemns and does not elevate.
`stale` warns and does not elevate. Only `current` elevates. The unprovable falls
to the conservative side by construction rather than by reviewer discretion,
because the direction of that fall is what keeps every other guarantee here
honest — the same instinct as [no gate
self-certifies](../../_laws.md#no-gate-self-certifies).

The third use is where implementations get the asymmetry backwards: **reuse**.
When a batch grader decides it may skip re-judging because a stored verdict
covers the content, the bar is *stricter than either* of the others. `unknown`
condemns, but must never authorise a skip: skipping on an unprovable binding lets
genuinely unjudged content read as judged. The cost ledger settles it — a wasted
re-judge costs one model draw, a wrong skip costs the credibility of every green
label. Every uncertainty judges, and reuse is never decided on timestamps: the
binding is the fingerprint.

Hence the corollary that **a failing verdict is attached to the artifact even
when it is not applied**. Content condemned, re-produced and not re-judged
renders as "a failing verdict exists, it speaks for the previous version, this
version is unjudged" — both halves visible, with a plain note of what the verdict
does and does not prove. Dropping it makes an unjudged artifact look passing;
applying it as current makes a possibly-fixed artifact look broken.

## The judged payload is exactly the artifact

The most severe and least obvious defect here is **contamination of the judged
payload**. A pipeline assembles a bundle for the judge: the artifact, plus,
almost accidentally, whatever it was carrying — the generating prompt, the plan
step, the retry history, the tool trace. Each addition looks like helpful
context; what it does is hand the judge the *intent* alongside the *result*, and
a grader shown what a thing was supposed to be grades that.

The effect is not subtle. In a controlled comparison, moving the generation
prompt out of the judged payload moved mean scores by roughly seventeen points on
a hundred-point scale — an order of magnitude larger than the judge's own
run-to-run noise. It is also self-concealing where the rubric penalises leaked
instruction text: the judge sees the leaked prompt, notes it as a flaw, and
*still* scores higher, so contamination surfaces as neither a crash nor an
obviously implausible number.

The rule is absolute: **the judged payload is the artifact as a consumer would
receive it, and nothing the pipeline attached for its own bookkeeping.** Build it
by explicit projection — a named allowlist — never by handing over the working
record minus a few redactions. Denylists leak, and this leak is the proof: a
grader that copied every field it had not explicitly been told to strip graded a
generation instruction as the artifact for roughly three artifacts in ten, for
months, while docking those same artifacts for leaked instruction text. The
harness injected the defect it penalised; an allowlist could not have expressed
that bug. The projection that keeps the payload clean is the projection the
fingerprint covers: one mechanism, not two.

## Context is not contamination

The mirror-image failure is starving the judge. An artifact legitimately correct
in the context of its neighbours reads as broken in isolation — a value that
looks inconsistent until you see the sibling defining it. The judge reports a
defect that is not there, and false positives are more corrosive than misses: a
reviewer who has overturned three verdicts stops reading the fourth.

The resolution is not to relax the payload rule but to split the surrounding
material in two (sibling-context-projection). **The pipeline's own bookkeeping**
— intent, prompts, plans, self-reported success — is contamination and stays out.
**The artifact's peers** — the sibling content it must agree with, in the shape a
consumer would see — are context and go in, demarcated as reference material,
never as part of the graded object. Blind siblings supplied this way raise scores
by a few points where contamination raised them by seventeen: the difference
between removing a spurious penalty and removing the judge's job.

Two disciplines make it safe. Project siblings **structurally, not scalar-only** —
flattening each neighbour to its top-level numbers emits an empty context for
every artifact whose real content sits nested, and that silent-empty case can
cover a large minority of a corpus without a single error, so count the non-empty
projections and treat a low rate as a harness defect rather than a property of
the content. And injected context **redirects scrutiny without lowering the
bar**: a project rule tells the judge what to check, and a violation of that rule
is itself a defect, never a licence to excuse weak work.

## When the standard moves, the verdicts retire

A rubric is a versioned instrument. When it changes in a way that would change
scores — new criteria, moved anchors, a corrected payload projection, a fixed
harness defect — every verdict issued under the previous version is `superseded`
(rubric-version-supersession), and stops counting as current quality immediately
and without exception, because the alternative is a score distribution silently
mixing two instruments. The version travels *inside* the verdict's binding
alongside the content fingerprint — two independent invalidators, one comparison
at read time — and each bump records in prose what changed and why, so a reader
facing superseded verdicts can tell whether re-running them is worth it.

Selection and strictness are different questions, asked separately.
**Selection**: only verdicts at the *newest version present for this artifact*
speak for it, so a lenient older pass can never outvote a newer strict fail, and
an older fail can never outvote a newer pass. **Strictness**: whether that
newest-present version *is* the version in force, which is what decides
`superseded`. Spelling selection as "at or above the current version" is the
classic bug — it agrees with newest-present today and diverges the instant the
version is bumped, at which point two generations are retained together and the
pipeline acts on whichever one failed.

The hardest instance is the harness defect. A bug in the grading harness — a
contaminated payload, a context projection emitting nothing — does not invalidate
one run. It makes **every verdict ever issued under that harness provisional**,
and the honest response is a version bump superseding all of them plus a measured
comparison quantifying the defect's effect, so the size of the correction is on
record rather than assumed.

## One counted subset, or the dashboards disagree

Every surface reporting "how good is this content" must count *exactly* the
verdicts the gate counts. This sounds like a display concern and is not: a
summary that averages every stored row includes superseded and stale ones and
reports a failure count the gate does not hold, and the two numbers get defended
by two different people in the same meeting. Draw the line in one place — [one
authority per quantity](../../_laws.md#one-authority-per-quantity) — and have every
consumer read that predicate rather than re-implement the filter. The eligible
set is narrow in more than one dimension: a grader that does not cover this kind
of artifact never speaks for it, while a human's verdict always may. The store
stays append-only and complete and the filter applies on read — retire from the
*score*, never from the *record*, because superseded and stale verdicts are the
only evidence of what was believed and when.

## Calibrated means measured against confirmed human labels

The last integrity boundary is the claim that the grader agrees with people
(calibration-against-confirmed-labels-only). The claim is worth exactly the
labels behind it, and only one kind counts: one a human deliberately confirmed
against the same rubric text the judge received. Labels inferred from a proxy — a
step that was accepted, content nobody complained about, a prior judge run — are
the system's own opinion in a costume, and calibrating against them measures
self-consistency, which is not a virtue.

So a grading system's standing is a small closed vocabulary whose honest default
is never the top one — no measurement at all, provisional, superseded, enforced —
and a system seeded entirely from prior evidence rather than confirmed by a
person is provisional: deliberately not a green, said in the same report that
prints the agreement rate. The threshold is stated once and never lowered to make
a run pass; lowering it is the only move here a re-measurement cannot undo.

Three mechanical rules keep the loop clean. Agreement is chance-corrected over a
sample stratified across the score range, not a raw percentage over whatever was
convenient. The calibration run **writes nothing to the verdict store**, because
mixing measurement of the instrument into the corpus makes the instrument part of
its own evidence. And it is **re-run whenever the standard is versioned**, since
an agreement figure from a superseded rubric describes an instrument that no
longer exists. Calibration is a standing measurement with a confidence interval,
not a launch gate passed once, and a figure reported without a sample size has
reported nothing.

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
