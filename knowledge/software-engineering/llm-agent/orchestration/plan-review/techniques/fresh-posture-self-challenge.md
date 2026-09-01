---
layer: technique
type: technique
subject: plan-review
technique: fresh-posture-self-challenge
status: forged
laws: [failure-not-empty-success, silent-state-is-ungoverned, gate-sees-target]
shared_with: []
use_when: [a second reviewing agent is not affordable yet, one agent both drafts and critiques in a single pass, deciding when a cheap self-review must be replaced by a separate reader, a self-review has stopped producing revisions]
---

# Fresh-posture self-challenge

When a separate reading agent is too expensive for the capability's maturity, one agent
carries two postures in one file — construct, then challenge — separated by an explicit
segment boundary that reframes the second as somebody else's work. The boundary is the
mechanism. Collapse it and the challenge degenerates into the drafting context arguing
for its draft, which is the default behaviour and costs a model call to obtain.

State the rung honestly first: **this is the cheap option and it is measurably weaker
than a genuinely separate context.** Reviews run in a fresh context outperform the same
model told mid-session to switch roles; models repair errors reliably once the location
is supplied and find the location in their own output unreliably; and asked to
reconsider, they tend to move toward whatever the challenge implies rather than toward
the evidence. None of that makes the posture switch worthless — a structured challenge
against a fixed question set beats no challenge — but it does mean the design is
standing on the middle rung of a ladder and should know it.

## The boundary, and what makes it real

The segment is not a heading. It is a re-framing that changes what the second pass is
doing:

- **The prior output is presented as an artifact, not as memory.** The challenge segment
  reads the draft as given material with an author who is not present, rather than
  continuing to produce it.
- **The posture is stated as a role with a licence to disagree** — challenge where the
  evidence allows, and say when it does not.
- **The construct-phase reasoning is not carried forward.** The justifications are what
  the challenge is supposed to test; supplying them alongside the artifact is supplying
  the answer with the question.

The failure to avoid is a boundary that is only typographic. A section header that says
"now review" inside an unbroken reasoning flow produces a pass that finds spelling.

## The fixed question set

The challenge runs against the same questions on every element, and the fixity is what
makes the output comparable across runs and the sentinel below meaningful:

- **Boundary** — is this one thing, or two things smeared into one?
- **Evidence** — does the cited material actually support the description given?
- **Confounders** — what nearby thing is this not, and would a reader confuse them?
- **Confidence** — is this claimed more strongly than what supports it?
- **Specificity** — is this specific to the situation at hand, or is it textbook
  material that would be true of anything?

A free-form "critique this" produces a different critique every run and cannot be
compared to the last one, which removes the only cheap instrument for noticing the pass
has degenerated.

## Challenge notes are retained, not discarded

Every element carries its challenge notes forward into the output: what was challenged,
what the challenge concluded, and what changed as a result. A critique that is applied
and then thrown away leaves a downstream reader unable to distinguish an element that
survived scrutiny from one that was never examined, and unable to see that the same
weak point has been challenged and waved through three runs running. The notes are the
conversion of the pass's private assessment into something a later reader can act on
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)); without
them the challenge governs nothing beyond the run it happened in.

Keep them short. A note longer than the element it challenges is a second draft, and the
retention rule turns into a reason to skip the technique.

## The sentinel

"The challenge ran and surfaced nothing" is a **reserved explicit value**, never an
empty notes field. Empty is the same rendering as a challenge segment that was truncated,
a boundary that was never emitted, and a pass that silently skipped the element
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). The
sentinel costs one string and it is the only thing that makes the escalation trigger
below computable at all.

## The posture's label is a pinned parameter, not a framing choice

The posture is stated as a role, and *which* role is not free. Measured on frozen
transcripts with the content held byte-identical and only the participant's role
name changed, a reader's verdict moved by up to thirty-odd points — so the label is
an input to the output, and an unpinned one wherever it is chosen by whoever wrote
the prompt that day.

Two things follow for a technique that runs on posture.

- **Pin the label with the rest of the instrument.** It belongs beside the model,
  the parameters and the rubric in whatever record says how a review was produced.
  A review whose posture drifted between runs is not comparable to itself, and
  nothing in the output shows it.
- **Expertise-derived labels hold position harder than office-derived ones.** In the
  same measurement, seats named for what they *know* moved their verdicts less
  under peer pressure than seats named for what they *decide*. That cuts in this
  technique's favour: the failure being defended against is a reader collapsing
  into agreement with the plan, so a label that resists movement is the one to
  pick — and the obvious name for a reviewing seat, the one derived from office,
  is measurably the weaker instrument.

The same finding bounds the claim, and the bound must travel with it: the
measurement was on a task with no correct answer, chosen deliberately so that
convergence could be observed without accuracy confounding it. It shows a label
moves a verdict. It does not show the movement is toward truth, and a label chosen
to make a reader stubborn will make it stubborn when it is wrong.

## The escalation ladder, with its trigger

Three rungs, in cost order:

1. **One-context self-review** — no boundary. Cheapest, and worth roughly what it costs.
   Legitimate only for mechanical checks.
2. **Fresh-posture single agent** — this technique.
3. **Two-agent dispatch** — a separate reader with its own charter and its own context,
   which is what the rest of this subject assumes.

The observable trigger for moving from rung two to rung three is the **sentinel-only
ratio**: across real invocations, the share of runs where every element came back with
the sentinel and nothing was revised. A pass that is doing work revises something,
sometimes. A pass that has degenerated into self-confirmation returns the sentinel
everywhere while looking exactly like a healthy pass on a clean draft, and the ratio is
what separates them — a rising ratio against unchanged draft quality is the tell.

**Honesty the technique keeps:** with no invocation corpus the ratio is not computable,
and the trigger degrades to a manual read of a handful of outputs beside their drafts.
That is a weaker instrument and it is the one most teams will actually have. Say which
one is in use rather than implying a measurement that is not being taken.

## Where this sits against a model auditing its own evidence

A neighbouring discipline lets a reading model assert that the deterministic evidence
against it is wrong, and bounds that assertion with a fixed budget of such claims. That
mechanism and this one are easily confused and answer different questions. There, the
model challenges the *instrument* and the currency is a number it is allowed to move;
the budget exists because the claim buys the model authority. Here, the model challenges
its *own prior output* and the currency is a note a person reads; there is no number and
no authority to bound, so there is no budget — the constraints are the boundary, the
fixed questions, and the retained notes. A design that borrows the budget mechanism into
this technique has spent effort limiting a model's power over something it does not
control.

## When not to use it

- **When a separate reader is affordable.** Rung three dominates rung two on every axis
  except cost. This technique is a maturity accommodation, not a preference.
- **On the highest-consequence plan in the pipeline.** The rung whose known weakness is
  self-confirmation is the wrong rung for the artifact whose approval matters most.
- **When the pass cannot be blocked on.** A challenge whose output nothing reads is a
  longer generation, and the boundary the gate reads must be the persisted notes, never
  a claim in the same output that the challenge occurred
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## What this cannot do

It cannot supply independence. The second posture shares the first's context window, its
training priors, and its reading of the task; what it supplies is a structured excuse to
look again, which catches the errors that survive only through momentum and misses the
ones that come from the model's own model of the problem being wrong. Those are the
errors that matter most, they are why the ladder has a third rung, and a team on rung two
should record which class of error it is currently not catching rather than reporting a
review that happened.
