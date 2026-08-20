---
layer: technique
type: technique
subject: ai-assistance-detection-and-fairness
technique: observed-process-is-supporting-not-load-bearing
status: forged
laws: [say-only-what-the-record-holds, every-decision-names-its-actor, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [weighting process telemetry against artifact evidence, red-teaming an authenticity layer, deciding what a live authorship interview is for]
---

# Observed process is supporting, not load-bearing

Process evidence — commit rhythm, session length, revision history, a decision
log, edit cadence, paste events — is the most attractive material in this
subject and the least trustworthy. It feels objective because it is numeric and
mechanically captured. It is weak for one reason that only appears under
adversarial testing: **it is the cheapest thing in the whole pipeline to
fabricate.**

Run the demonstration before trusting any of it. Build a persona whose goal is
to look diligent rather than to be diligent: work backwards from a delegated
artifact, stage a plausible commit sequence, write the decision log afterwards
to match the finished work, avoid a single bulk paste. Scored alongside honest
candidates, it ties with them or beats them on process signals — it optimised
directly against the observable — while the artifact-anchored layers hold,
because faking those requires understanding the material. That result reorders
the instruments permanently.

## The ordering

**Load-bearing** — may support a finding, may be cited in a decision:

1. **Planted-canary verdicts.** Faking a catch requires finding the flaw, which
   is the competence being measured. There is no shortcut.
2. **Distance from the frozen naive baseline.** Faking distance requires doing
   different work, which is the work.
3. **The live authorship conversation.** A human asks why: why this structure,
   what did you consider and reject, what would you change, what did you make
   of the contradiction in section three. This is the strongest instrument in
   the subject and the only one that cannot be prepared against in general,
   because the follow-up questions are generated from *this* submission.

**Supporting** — may add colour, may prompt a question, may never carry a
decision alone:

4. Decision logs and written reasoning. Valuable as the conversation's raw
   material; worthless as proof, because they are written by whoever wanted the
   proof.
5. Revision history and commit shape.
6. Paste ratios and bulk-paste tells.
7. Session duration and edit cadence.

The rule that falls out: **no process signal, alone or in combination with
other process signals, moves a candidate across a decision boundary.** A
combination of weak fakeable signals is a weak fakeable signal.

## The live authorship conversation

If you take one thing from this technique, take this: fifteen minutes of a
competent human asking a candidate about their own submission outperforms every
automated authenticity instrument combined, and it is the only one that is
fair by construction — it asks about the work, so it cannot discriminate on how
the work was produced.

Run it as follows. The interviewer reads the submission first and prepares
questions from *it*, not from a script. Questions target contestable decisions
("you handled the conflicting requirements this way — what was the alternative
you rejected?"), the canary regions ("what did you make of the value here?"),
and forward reasoning ("what breaks first if the volume goes up tenfold?").
Model use is explicitly welcome in the answers — "the model suggested it and I
checked it by doing X" is a complete and good answer, and interviewers must be
briefed that it is, or they will silently penalise the disclosure and take the
invariant down with them.

The conversation is a decision by a named person
([every decision names its actor](../../_laws.md#every-decision-names-its-actor)).
Record who ran it and what they concluded, in their words, bound to the
submission they read.

## Client-emitted events prove *when*, not *sincerity*

Even a well-engineered event stream — server-received, hash-chained, timestamps
cross-checked against the server's receive window — establishes only that a
sequence of events arrived in an order at a time. It does not establish that
the events meant what their names imply. An "opened the file" event proves a
file was opened, not that anything in it was read.

Two consequences. First, integrity machinery is worth building anyway, because
it converts one whole class of fabrication (staging the log after the fact) into
a detectable event — and a **failed** integrity check is decisive: a trace
manipulated after the fact makes every process signal derived from it
worthless, so the correct response is to void them all and route to a human,
not to subtract points. Second, integrity passing buys you nothing about
sincerity, so a clean chain must never be presented as authorship evidence.

## The observation waiver, and its trap

A submission produced under live observation — screen-shared session, on-site
work, a supervised environment — has already answered part of what the process
signals stand in for, and it *structurally cannot produce* some of them. Watched
work has no commit history by design. Penalising it for missing commits scores
the most strongly evidenced submissions you have as the most suspicious ones,
which is the waiver's whole reason to exist.

So: **waive the signals that observation makes structurally unavailable**, and
record them as waived, with the reason. Not zeroed, not passed — waived, a
distinct state a reader can interpret
([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).

The trap is waiving *everything*. Observation proves the work happened in front
of you; it does not prove the work was authored there. A candidate can paste an
entire finished solution into a watched editor, and a blanket waiver scores
that submission as pristine — the cleanest-looking record in the cohort
belonging to the least authored work. So the signals that observation makes
*more* observable, not less, must stay on and in fact get sharper: a single
large insertion into the watched surface with no incremental build-up is
directly witnessed, not inferred, and it is the one process tell that earns real
weight. The artifact-anchored instruments run regardless; observation never
makes a canary verdict redundant.

## The honest-darkness rule

Because process capture fails often and for innocent reasons, its states must
be explicit: *observed*, *not observed*, *capture unavailable*, *declined by
candidate*, *waived*. Each renders as itself. None renders as a pass, a zero, a
neutral middle value, or a blank cell.

A ratio needs the same discipline in its denominator: exclude the population
where the behaviour was structurally impossible. "Read before writing" computed
over every touched region silently counts every *newly created* one as edited
without reading — a candidate who adds a test or a helper is marked careless for
not reading a file that did not exist. Every derived ratio in this class hides
one of these; find it by asking, for each unit in the denominator, whether the
candidate could have exhibited the behaviour at all.

Emit an explicit no-signal value rather than a definitive negative. "No bulk
pastes recorded" and "paste capture was not running" are different facts, and
the system that stores them as the same zero has just published the second as
the first. This is the single most common implementation bug in the subject and
it always flatters somebody — usually a candidate on a well-instrumented setup,
at the expense of one who was not.

## Red-teaming as a standing practice

Run the gaming persona on a schedule, not once. Every time a signal is added,
ask what a candidate optimising for it would do. If gaming it requires doing the
real work, promote it toward load-bearing; if gaming it requires only a habit,
it is supporting at best, and if it also penalises an innocent group (assistive
technology, offline work, a different editor), delete it. Keep the results with
the pipeline's documentation: a signal's fakeability is part of its
specification, and a team that cannot state it will over-trust the signal within
two quarters.

## When not to use it

- **Do not use process observation as the primary instrument** in a
  high-volume, unobserved, remote assessment. That is the exact configuration
  in which it is weakest, and the temptation is strongest.
- **Do not capture more to compensate for weakness.** Keystroke logging, screen
  recording and camera-based attention monitoring are not stronger evidence;
  they are the same weak class of evidence with a much larger harm and a legal
  exposure, and several of them discriminate against candidates who move,
  look away, or use assistive technology.
- **Do not skip the conversation because the automated signals looked clean.**
  Clean signals are the case in which the conversation is cheapest and most
  informative.
