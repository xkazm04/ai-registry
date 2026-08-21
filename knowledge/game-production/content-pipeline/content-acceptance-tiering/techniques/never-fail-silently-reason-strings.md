---
layer: technique
type: technique
subject: content-acceptance-tiering
technique: never-fail-silently-reason-strings
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, law-and-check-share-one-source]
shared_with: []
use_when: [designing the verdict shape for a check, triage of a failing run takes hours, a deferral cannot be explained]
---

# Never fail or skip silently: reason strings

Every verdict that is not a pass carries a human-readable reason, and the system is
constructed so that a reasonless non-pass cannot be produced. This technique covers the
shape that enforces it, what a good reason contains, and the triage economics that
justify the effort.

## The rule and its enforcement

> A non-pass without a reason is not a valid verdict.

Enforce it in the shape of the result, not in a review checklist. The verdict type is
constructed so that the pass case takes no reason and every other case requires one —
a tagged union, a constructor per status, a factory function that will not compile or
will not run without the text. What must be impossible is a code path that produces a
failure or a deferral by filling in a default.

Two constructions to avoid, because both look like enforcement and are not: an optional
reason field with a lint rule (the lint rule will be suppressed), and a reason field with
a default value like *unknown* or the empty string (the default becomes the answer and
the field becomes noise).

## What a reason must contain

A reason is one sentence, addressed to whoever will act on it, and it answers a different
question depending on the status:

- **fail** — *what was wrong, and in what terms*. Name the property, the expected
  condition, and the observed value. "References a faction that does not exist:
  the named target resolved to nothing." Not "validation error".
- **deferred** — *what was missing from the environment*. Name the precondition, not the
  consequence. "No runtime harness attached in this environment." Not "skipped".
- **pending** — *what has not been authored yet*. Name the missing work. "No variant has
  been selected." Not "incomplete".

Where a reason quotes a number, it carries the number's unit and the basis it was
computed against, because a bare figure in a failure message is the most reliably
misread text in any pipeline. "Exceeds the class budget: 41,200 triangles against a
20,000 ceiling for this class" is actionable; "budget exceeded (41200)" starts an
investigation.

Two properties that separate a good reason from a plausible one:

- **It names the artifact's own vocabulary**, not the checker's internals. The reader
  is a content author, not the person who wrote the rule.
- **It distinguishes the observation from the interpretation** where they differ. "The
  activation event was never emitted" is an observation; "the ability is not wired" is an
  inference that may be wrong. Report the observation; infer only when the inference is
  certain.

## Write the reason when you write the check

The reason must be authored at the same moment as the condition, and this is the single
highest-leverage habit in the technique. The person writing the check knows precisely
what the failing state means, in that minute. A reason retrofitted three months later is
reconstructed from the condition expression — it says what the code tests, which the
reader could already see, rather than what it means.

A useful drafting order that costs nothing: write the reason string first, then write the
condition that produces it. If the reason is hard to write, the check is testing something
you have not yet defined, and you have found that out before implementing it rather than
after.

## The triage economics

The effort is justified by a ratio that is easy to measure in your own pipeline. A
production run over a few hundred artifacts typically produces a small tail of
non-passes. With self-describing reasons, triage is a scan: read the list, group by
reason text, dispatch. Without them, each entry is an investigation — open the artifact,
find the check, reproduce the condition, work out the intent.

Measure it once on your own data and the argument ends. The pattern that recurs: a run
whose non-passes explain themselves is triaged in the time it takes to read them, and one
whose non-passes do not costs roughly an order of magnitude more, most of it spent
rediscovering intent that existed at authoring time and was not written down.

There is a second-order benefit that matters more over years. Grouped reason strings are
a defect taxonomy you did not have to design. The reason that appears ninety times across
a run is a systemic problem in the producer, visible immediately; with opaque failures
that same pattern is invisible, and the systemic problem gets fixed ninety times
individually.

## When the instrument itself fails

A check that throws is not a check that passed, and it is not a check that failed
either. The correct degradation is to a non-pass status — never an optimistic pass —
whose reason is the thrown message itself, truncated but verbatim. The tempting
alternative, an opaque *unverified*, discards the one piece of information anybody
needed. This costs a few lines at the one place checks are invoked and is the difference
between a broken rule being fixed the same afternoon and a rung silently returning
nothing for a quarter.

## A deferral reason is a work order

The highest-value form of this technique: where a deferral will later be resolved by a
runner, the reason is written in a **shared, parseable format that names the exact
observation required** — this behavioural test, this capture, this build. The set of
outstanding deferrals then *is* the runner's queue; draining gates becomes a mechanical
sweep instead of a person reading amber cells and deciding what to launch.

The constraint that makes it safe: the function that writes the reason and the function
that parses it are defined together, in one place, exported as a pair. A hand-formatted
string on the writing side and a regular expression on the reading side will drift within
weeks, and the drift is silent — the queue simply stops containing items nobody notices
are missing. If the format cannot be single-sourced, do not encode machine meaning in
prose at all; carry a structured field beside the human sentence instead.

## The self-describing unrun gate

For a deferral, the reason text carries a burden nothing else does: it is the only place
the rung's *precondition* is written where a non-engineer will read it. Treat deferral
reasons as documentation of the ladder, phrase them as complete statements about the
environment, and keep them stable — a deferral reason that reads the same every time
becomes a recognizable, groupable, ignorable-when-expected signal, and that is exactly
what you want from a legitimate absence.

## When not to use this

Do not attach reasons to passes. A pass with an explanation invites the reader to
evaluate the explanation, and the whole value of a pass is that it needs no reading. If
a pass is conditional or partial, it is not a pass — it is a different status.

Do not put remediation instructions inside the reason. The reason states what is; how to
fix it belongs in the rule's documentation, linked or referenced, where it can be
maintained. Reasons that embed fixes go stale invisibly and start misdirecting the
people who trust them most.
