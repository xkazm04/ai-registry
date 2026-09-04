---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: indeterminate-closure-on-interruption
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [a restart finds work that was running and nothing knows how it ended, deciding what status a killed run is given, a downstream classifier recovers a cause by matching an error message, recovery must produce a transcript a later reader can rely on]
---

# Indeterminate closure on interruption

A process dies with a tool call outstanding. The side effect may have
happened, may have half happened, may not have started. Recovery has to
write *something* into the record, because the alternative is a transcript
with a hole in it that every later reader trips over. The question is what.

The two answers reached for by default are both lies with different
victims. Writing **success** is obviously wrong. Writing **failure** looks
conservative and is not: failure is a definite verdict, and the runtime
does not have one. It has an absence of information, and
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
is the rule that absence may not be rendered as a value — least of all as
the value a retry policy, an alerting rule and a cost attributor all branch
on.

The correct answer is a third status the vocabulary usually does not have:
**the call is closed with an indeterminate result that says the outcome is
unknown and that no retry was attempted.**

## What the closure says, and to whom

The synthetic result is written for two readers and must serve both.

For the **model**, it is a message in the transcript, and it should say
plainly: the tool was interrupted, its outcome is unknown, and it was not
re-run. That is enough for a capable model to do the right thing — verify
the effect, re-run the tool, or proceed — which is the whole reason not to
guess on its behalf. A recovery that silently re-executes the call has
decided that every tool is idempotent; a recovery that reports failure has
told the model something false about the world it is about to act in.

For the **machine**, it is a first-class status in the closed vocabulary —
not a success flag, not a failure flag, and *not a distinguishing string
inside a failure's message field*. That last one is the failure mode this
technique exists to name, and it is worth being blunt about, because it is
what teams actually build: the recovery sweep marks the work failed with a
distinctive sentence, and later, when something downstream needs to know
these were not real failures, a classifier is added that matches on the
sentence. Now the verdict lives in prose, every consumer that wants it must
re-parse it, and the first reword of that sentence silently reclassifies
history ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
— a caller that must inspect message text has been handed no verdict).

The tell that a codebase is in this state is a string comparison against an
error message in a classifier. Where you find one, the status it is
recovering is the status the writer should have written.

## Closure is what makes the record safe to read

The rule has a second half that is easy to miss and is the reason it is a
runtime concern rather than a logging preference. **Every unresolved call
is given its synthetic result before the terminal event is written.** Not
after, not lazily at read time, and not never.

A record whose terminal event sits above calls that have no results is
structurally incomplete, and every consumer inherits the problem: a reader
composing a later prompt from it has to invent a policy for the gap, and
two readers will invent different ones. Closing first means the guarantee
"a terminated unit's record is complete" holds for everyone, and no reader
needs a special case. Where units reference their predecessors, this is
load-bearing rather than tidy: an unclosed unit anywhere in the chain is a
gap that every descendant materialization has to handle.

## Not every interruption is indeterminate

The status is for work whose outcome the runtime genuinely cannot
determine, and applying it wholesale is its own kind of dishonesty. Sort by
whether the effect could have escaped:

- **A side-effecting call that was requested and never reported** is
  indeterminate. This is the case the technique is for.
- **A side-effect-free call** — a model request, a pure read — is not.
  Re-issue it and close the old one as interrupted, because re-issuing
  costs nothing and produces a real answer. Count the re-issue against
  whatever budget the original consumed.
- **Work that was never started** because the record shows only intent and
  no dispatch is not interrupted, it is unstarted, and it can simply be
  started.
- **A corrupt or unreadable record** is neither: it is an infrastructure
  error and must reject the read rather than resolve into any status at
  all. Writing a terminal event onto a record you could not parse converts
  a loud, fixable problem into a permanent quiet one.

Deciding which case applies requires the record to say what was *requested*
before it says what happened — which is the same discipline that makes
recovery possible at all, from the other direction.

## Closing it is not the same as deciding what happens next

Everything above concerns the honesty of the record. A second decision
follows immediately and is easy to fold into the first by accident: **what
the runtime does with the closed work.** Collapsing them produces a rule
that is correct about the record and dangerous in operation, because
"unknown" is not one disposition. It is at least three, and they are told
apart by evidence the sweep already holds.

**Classify at recovery; do not declare.** A unit interrupted seconds ago
was plausibly mid-flight and is worth one re-admission. A unit interrupted
long enough ago that the runtime's own liveness sweep would already have
reaped it was not mid-flight, and re-admitting it resumes work whose inputs
are stale — it is neither runnable nor failed, and the honest disposition is
to surface it and let a person choose. A unit whose start stamp is missing,
unparseable, or in the future cannot be *shown* to be mid-flight, and so
falls to the same human-decides class rather than to the optimistic one.
The window that separates the first two is not a fresh number: it is
whatever threshold the live sweep already uses to call a running unit
stalled, because two different answers to "was this in flight" in one system
is a defect on its own.

**Count involuntary interruption on its own key.** A retry counter that
counts healing retries of an *observed* failure must not also count
restarts, because they are evidence of different things and one of them has
no failure identity at all — no error class, no location, nothing the loop
could match on. The unit simply never finished. Keep the restart counter
beside the retry counter, never merged, and put it with whatever restores
work across restarts rather than inside the loop that died.

**Cap the re-admission, and let the cap outrank the freshness test.** This
is the half whose absence turns the rule into a hazard. A unit that takes
the process down *is* re-admitted by a freshness test — it always looks
fresh, because it just crashed — and it takes the process down again. The
loop is not in the agent; it is in the recovery path, and every iteration
looks locally correct. So the escalation is checked first: past a small
number of consecutive restarts the unit stops being re-admitted and becomes
terminal, on the principle that **a run which kills the host every time it
resumes must terminate itself rather than terminating the host.**

**Clear the mark on success, never on the attempt.** Clearing when a resume
*begins* is the mistake that costs the whole mechanism: every crash becomes
the first crash, the counter never reaches the cap, and the escalation can
never fire. The mark rides through the re-admission and is cleared only by a
unit that actually finishes.

A useful side effect of writing the legacy marker down as a constant rather
than deleting it: the population of rows written by the old blind sweep
becomes **countable**, so the migration off it has a number rather than a
belief.

## Decision rules

When recovery finds outstanding work, close it with an indeterminate result
rather than a failure. When the vocabulary has no such status, add one; do
not encode it in a message string, and treat an existing string-matching
classifier as a defect to be paid down rather than a working solution. When
the synthetic result reaches the model, say that the outcome is unknown and
that nothing was retried. When a terminal event is about to be written,
close every unresolved call first. When the interrupted work was
side-effect-free, re-issue instead. When the record cannot be read, refuse
the read and write nothing. When deciding what happens to the closed work,
classify against the liveness threshold the system already uses rather than
declaring one disposition for all of it; count restarts on a key of their
own; check the escalation cap before the freshness window; and clear the
mark on completion, not on the attempt.
