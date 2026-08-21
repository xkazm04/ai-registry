---
layer: golden-path
type: golden-path
subject: candidate-archetype-routing
status: forged
use_when: [deciding how to classify what kind of career a candidate is having, designing an intake form that adapts to the applicant, scoring populations that cannot share one rubric, handling a candidate whose career does not parse]
techniques:
  - signal-scored-routing-not-rule-matching
  - self-declaration-trusted-contradictions-flagged
  - confidence-always-returned-with-a-review-threshold
  - conservative-default-and-the-unrouted-state
  - population-specific-weights-and-dimension-renaming
  - one-registry-shared-across-runtimes
---

# Candidate archetype routing

A hiring system that scores people has to answer a question before it scores anybody:
**what kind of career is this person having?** A candidate with eleven years in one
discipline, a candidate three months out of a degree, and a candidate leaving one
profession for another are not three points on one scale. They are three populations
whose evidence has different shapes, whose strong signals are different signals, and
whose weak signals mean different things. Routing is the act of deciding which of them
you are looking at.

It is worth being blunt about why this is a subject at all rather than a display
concern. The archetype decides three things, and none of them is cosmetic:

1. **What you ask.** The intake form for an experienced candidate asks about scope,
   ownership and depth. The one for an early-career candidate asks about coursework,
   projects and what they are building toward. Asking the wrong set produces empty
   fields, and empty fields score as weakness.
2. **How you score.** Each population gets its own weighting of its own dimensions —
   not a discount applied to a shared rubric, but a different rubric with different
   axes and different names.
3. **What protects them.** Fairness shields key off the archetype. A misclassification
   is not a cosmetic error; it can be the difference between a candidate a machine may
   never reject unattended and one it may.

That third consequence is what makes routing a compliance surface rather than a
convenience. It also means the classifier is downstream of nothing and upstream of
everything, which is an unusual and uncomfortable position for a heuristic to occupy.

## The naive reading, and why it fails

The naive design is a chain of conditionals: if the person says they are a student, they
are a student; else if their years of experience are below some number, they are
early-career; else they are experienced. It is three lines and it fails in five
predictable ways.

- **First rule wins, and the ordering is an accident.** Rule chains encode priority in
  source order, so the answer for a candidate matching two rules depends on which
  engineer added which rule first. Nobody ever wrote that priority down, and nobody can
  defend it.
- **It has no notion of degree.** A candidate one week from graduating and a candidate
  eighteen months into a first job both fall on the same side of a hard cutoff, and the
  system cannot express that one case is obvious and the other is marginal.
- **It cannot say it does not know.** A rule chain always terminates in an `else`, so
  the least confident classification the system ever makes is indistinguishable in the
  record from the most confident one.
- **It cannot be audited or tuned.** A weight you can print is a policy; a conditional
  buried in a function is a behaviour. When someone asks "why was this person routed as
  a career changer", a rule chain's only honest answer is "read the code".
- **It goes stale in exactly one direction.** Rules accumulate. Nobody removes them.
  The chain grows a long tail of special cases, each added for a real candidate, none
  ever validated against the population.

The correct shape is a **weighted signal model**: independent signals each contribute a
score toward one or more archetypes, the archetypes are ranked, the winner is returned
with a confidence, and a threshold decides whether a human should look. This is the
first technique, and everything else in the subject depends on it.

## Archetype is a claim about evidence, not about worth

The load-bearing distinction of the whole subject: an archetype names **the shape of the
evidence available about a person**, never their quality, potential or seniority. It is
tempting to read "early-career" as "weaker" and "experienced" as "stronger", and the
moment a team does, the taxonomy becomes a ranking and the routing becomes discrimination
with a data structure.

The discipline that keeps this honest is that each archetype is scored on **its own
dimensions**, and those dimensions are *renamed*, not merely reweighted. An experienced
candidate is read on demonstrated skill, career trajectory and personal signals. An
early-career candidate is read on foundation, potential and fit. These are not the same
three axes with different multipliers; they are different questions. Renaming is the
mechanism that stops a reviewer comparing across populations, because there is nothing
to compare — no shared number exists, by construction. What is scored *instead* of years
of experience belongs to the neighbouring subject on early-career potential assessment;
what belongs here is the decision about which set of axes applies at all.

The corollary is that archetype counts are not a leaderboard and must never be presented
as one. "Sixty percent of our applicants are early-career" is a fact about a sourcing
channel, not a fact about a talent pool.

## Trust the person, distrust the inference — and never the reverse

A candidate who tells you what kind of career they are having is giving you the single
best signal available, and it is better than anything you can derive from a document.
The system should ask, and having asked, should believe. The rule is:

**A self-declaration sets the archetype and lifts confidence sharply. A contradicting
signal lowers the confidence — it never overrides the claim.**

And it runs in **both directions**. Teams implement the contradiction check as scepticism
aimed at the protected declarations — the self-declared student with four years of work —
and stop there. But a self-declared experienced professional whose record shows current
enrolment or under a year of relevant work is exactly as contradicted, and that one
matters more: an uncapped confident routing sends a candidate who may belong to a
shielded population down the unprotected path. Write a contradiction rule for every
archetype, including the default one.

This asymmetry is the ethical core of the subject. When the record says "student" and
the parsed history shows four years of full-time work, there are many innocent
explanations — a mature student, a person working through a degree, a career restart,
an unusual education system, an imprecise parse. There is exactly one explanation in
which the candidate is lying, and it is not the system's job to pick it. So the
contradiction is expressed as a **confidence cap**: the classification stands as
declared, the confidence drops to a value that will trip the review threshold, and a
person is invited to look. Domain scepticism becomes data rather than a veto.

There is a second reason beyond ethics, and it is the practical one that convinces
engineers: an override is unrecoverable. Once the machine has replaced the person's own
statement with its inference, the record no longer contains what the candidate said, and
every downstream consumer — the intake form, the score, the shield, the audit log —
inherits a claim nobody can trace back to a source. A confidence cap loses nothing.
[Inference must look like inference](../../_laws.md#inference-must-look-like-inference).

## Confidence is not optional and not decorative

Every routing result carries a confidence, and the confidence is *used*. A classifier
that returns a class without a confidence has thrown away the only thing that
distinguishes its good answers from its bad ones, and the cost lands on the candidate:
a marginal routing and an obvious one produce identical downstream behaviour.

The design has three parts and all three are required:

- **A published low-confidence threshold** below which the result is flagged for human
  review. Publish the number in the same place as the weights, so the policy is legible
  as one table.
- **Distinct confidence tiers for distinct evidence.** A self-declaration is worth far
  more than a document inference — in practice roughly the difference between "act on
  it" and "confirm it". A degraded run that could not gather signals at all is worth
  less than either, and must say so rather than emitting a middling number.
- **A confidence that gates the optimistic action, not the adverse one.** Low confidence
  may withhold an auto-advance and may attach a review flag. It may never authorize an
  adverse action, at any value, because that path should not exist for a machine at all.

Two numeric relationships in that table are invariants rather than preferences, and both
are worth asserting in the loader. **The unguided-default confidence must sit strictly
below the review threshold**, so a routing that no evidence produced always trips review
— otherwise the fallback becomes the one path that escapes the mechanism designed to
catch it. And **the declaration tier must sit above it**, so answering the question
actually buys the candidate something.

There is also a third state that hides inside "low confidence" and deserves its own
marker: **no signal fired at all.** A routing where the evidence was contested and the
winner took a thin share, and a routing where the classifier saw nothing and fell back,
can carry the same number and mean opposite things — one is a hard case, the other is an
absent input, usually an upstream extraction failure. Emit a distinguishable marker for
the unguided fallback so a reviewer, and a monitor, can tell a difficult career from a
broken parse.

And confidence must render as what it is. A model's or a heuristic's self-reported
certainty is evidence about the classifier, not about the person, and it must not be
displayed in the visual grammar reserved for measurement.

## Two safe directions, not one

The single most misunderstood point in this subject is that "the safe default" is not
one thing, because two different consumers ask the classifier two different questions.

- **For scoring**, the safe default is the *unprotected* archetype — the experienced
  one. Scoring an unclassifiable person on the experience-weighted rubric asks for
  evidence they may not have, which understates them; scoring them on a potential-based
  rubric asserts a claim about their career that nothing supports and can read as
  condescension. The conservative default understates rather than flatters, which is
  the honest direction.
- **For protection**, the safe default is *protected*. An unclassifiable candidate is
  shielded from unattended adverse action, because uncertainty about a person must never
  resolve into an irreversible outcome against them.

These two answers look inconsistent and are not. They are the same asymmetry stated
twice: a wrongly-conservative score costs a review, a wrongly-removed shield can cost
someone the job. Write the asymmetry down next to both predicates, because it is exactly
the kind of thing a later cleanup pass will "fix". The enforcement of the shield itself
belongs to the neighbouring subject on automated screening fairness gates; what belongs
here is that routing must hand that gate an honest input, including an honest *unknown*.

Which brings the rule that carries the most weight in the whole subject: **the
conservative scoring default is not a classification.** The routing result must retain a
distinct **unrouted** state — an explicit member of the taxonomy meaning "could not
classify" — even while a scorer is choosing a fallback rubric to run. Collapsing
unrouted into the concrete default is the failure that does the most damage, because it
is silent, it is permanent, and it produces a *confident wrong record*: the candidate
loses the shield everywhere downstream, appears in cohort analytics as a member of a
group they were never in, and the audit trail asserts a classification nobody made.
[Meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label) — and
an unrouted candidate stays unrouted until evidence or a person changes it.

## One registry, or the gate desynchronizes

Routing is consumed by every part of a hiring system that has an opinion about a person:
the intake form, the parser, the scorer, the fairness gate, the recruiter's display, the
analytics. In any real deployment those consumers do not all run in the same runtime —
a web layer and an analysis pipeline at minimum, often a batch job and a reporting layer
as well.

If each of them carries its own copy of the archetype list, the weights, or worst of
all the protected set, then the system has several definitions of who is protected. They
will agree on the day they are written and diverge on some later day, and the divergence
**fails with zero error**: no exception, no log line, no failing test — just a protected
candidate quietly routed as unprotected. A safety mechanism whose failure mode is
silence is not a safety mechanism.

So: the archetype list, the per-population dimension names and weights, the signal
table, the thresholds and the protected flag live in **one declarative artifact that
every runtime reads**. Not a shared library — a shared *file*, because a library is
still code and code gets forked. The declaration should carry the protected flag
explicitly, marked as compliance-critical, so that the next person to edit it knows what
they are touching.

Two invariants make the shared artifact safe to own:

- **Validate the structure at load, not at use.** Every weight vector must sum to one,
  checked when the artifact is read, refusing to start otherwise. This is not fussiness.
  A single mistyped digit rescales every score, every tier and every shortlist for that
  population, and nothing about the output looks wrong — the ranking is internally
  consistent, just measured with a bent ruler. There is no downstream check that catches
  it; only the sum does.
- **Retire, don't trap.** When a population is withdrawn, it disappears from the pickers
  so nobody new can be routed into it, and it keeps working for everyone already routed
  there — the definition stays readable, the weights stay loadable, the scores stay
  reproducible. Deleting an archetype orphans real people mid-process, and
  [a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).

## Where the archetype is decided, and how it survives

Routing happens at least twice: once when a document is parsed, cheaply and with low
confidence, and once when the candidate answers for themselves at intake, expensively
and with high confidence. The intake answer wins and lifts the confidence; the parse is
what you have until then.

Five rules govern the intake question, and each was learned the hard way:

- **A question with one available answer is not a question.** If the archetype options
  collapse to a single choice — because the workspace archived the others, or because a
  filter narrowed them — the form must refuse to render it rather than present a
  formality that returns a "declaration" the candidate never made. A single-option
  question manufactures consent to a classification.
- **A degraded intake defaults to the unprotected-but-safe path, never to a shielded
  class.** When the archetype list cannot be loaded, the form falls back to the general
  path. Guessing a protected class to be generous is the wrong kind of generosity: it
  puts a claim about a person's career into the record on the basis of an outage.
- **Which archetypes are self-declarable is itself a registry decision.** An archetype
  can exist for routing and scoring without being offered as an intake option — the
  taxonomy and the question are two lists, and only the second one is candidate-facing
  copy that has to make sense to a stranger.
- **A new archetype must never yield an empty intake.** When the form has a tailored
  question lane per archetype, extending the taxonomy adds a class that no lane covers,
  and the candidate silently gets asked nothing. Make the lane selection fall through to
  a general question, so the failure of an addition is a generic form rather than a blank
  one.
- **The declaration is stored as a declaration.** Persist what the candidate said, and
  the derived classification, as separate facts. When they later diverge — because the
  signal table was retuned, because a parse improved — you need to know which one was
  theirs.

## Failure modes this standard exists to prevent

- **The rule chain** — ordered conditionals whose priority nobody chose, that cannot
  express degree and cannot say "unsure".
- **The overridden candidate** — a self-declaration replaced by an inference, so the
  record no longer holds what the person actually said.
- **The confidence nobody reads** — a number returned by the classifier and consumed by
  no branch, which is the same as not having one.
- **The collapsed unknown** — unrouted coerced into the fallback class, stripping the
  shield everywhere downstream and asserting a classification nobody made.
- **The shared scale** — populations scored on the same axes with different multipliers,
  so a reviewer compares numbers that were never comparable.
- **The second copy of the taxonomy** — two runtimes with two archetype lists, agreeing
  today, silently disagreeing later, mis-routing a protected candidate with zero error.
- **The bent ruler** — a weight vector that does not sum to one, rescaling every score
  in a population invisibly.
- **The deleted archetype** — a retired population removed rather than archived,
  stranding the candidates already routed into it.
- **The archetype as a ranking** — a taxonomy of evidence shapes read as a hierarchy of
  worth, which is the failure that turns this whole mechanism into the thing it exists
  to prevent.

## Where this subject ends

Three seams matter, and all three are close enough to be crossed by accident.

**The shield's enforcement is not this subject.** Which cohorts may not be auto-rejected,
what the routable verdict vocabulary is, how the gate is re-checked at the apply
boundary, and how a blocked rejection is recorded all belong to the neighbouring subject
on automated screening fairness gates. This subject *produces the input* that gate keys
off, and owes it two things: an honest class and an honest unknown. It does not own what
the gate does with them.

**What is scored instead of years of experience is not this subject either.** The
content of a potential-based rubric — what a foundation dimension actually measures, how
a project substitutes for a shipped product, how a learning trajectory is read — belongs
to the neighbouring subject on early-career potential assessment. This subject owns the
decision that a different rubric applies, the names of its axes, and the guarantee that
its weights are valid. It does not own what those axes mean.

The third seam is thinner: the general practice of model routing, prompt telemetry and
cost metering belongs to the model-operations domain, and the general practice of
configuration loading, schema validation and cross-process contracts belongs to
engineering. What stays here is the hiring judgment wearing engineering clothes — that
this particular configuration is compliance-critical because a typo in it changes who a
machine may reject.

## The techniques

- [signal-scored-routing-not-rule-matching](./techniques/signal-scored-routing-not-rule-matching.md)
  — replacing the ordered conditional chain with weighted signals that accumulate into
  a ranked, scored decision.
- [self-declaration-trusted-contradictions-flagged](./techniques/self-declaration-trusted-contradictions-flagged.md)
  — believing the candidate's own statement, and expressing scepticism as a confidence
  cap rather than an override.
- [confidence-always-returned-with-a-review-threshold](./techniques/confidence-always-returned-with-a-review-threshold.md)
  — making every routing result carry a confidence, and making a published threshold act
  on it.
- [conservative-default-and-the-unrouted-state](./techniques/conservative-default-and-the-unrouted-state.md)
  — the two safe directions, and why the fallback rubric must never overwrite the
  unknown class.
- [population-specific-weights-and-dimension-renaming](./techniques/population-specific-weights-and-dimension-renaming.md)
  — giving each archetype its own axes and its own names, and validating that the
  weights are a distribution.
- [one-registry-shared-across-runtimes](./techniques/one-registry-shared-across-runtimes.md)
  — one declarative artifact read by every runtime, validated at load, archived rather
  than deleted.
