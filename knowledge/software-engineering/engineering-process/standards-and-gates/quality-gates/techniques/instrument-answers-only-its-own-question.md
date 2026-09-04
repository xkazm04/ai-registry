---
layer: technique
type: technique
subject: quality-gates
technique: instrument-answers-only-its-own-question
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [deciding whether a fast check's green licenses skipping a slower one, an automated editor needs to confirm the code it just wrote resolves, two checks look redundant and one is about to be retired, a lower rung reports clean and the next rung fails on the same unchanged content]
---

# An instrument answers only its own question

[gate-laddering](./gate-laddering.md) places checks on rungs by cost, and the
picture it leaves is of one standard enforced repeatedly at escalating
expense — the cheap rung a preview of the expensive one. For a class of
instruments that picture is wrong, and acting on it produces a green that
means nothing anyone believed it meant.

The rule underneath the ladder: **a check's pass is evidence about the
question that check asks, and about nothing else.** Two instruments reading
the same source text are not usually a fast copy and a slow copy of one
question. They are a *partition* of questions, and where their domains would
overlap, the partition is normally settled by switching the overlap off in
one of them
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
applied to checks rather than to data). The cheap instrument then reports
clean on the expensive instrument's subject matter with total confidence,
because that subject matter was removed from its remit by configuration.

## The disabling is invisible at the call site

What makes this a trap rather than a triviality is *where the partition is
written*. The rule that yields a question to another tool lives in a shared
configuration — often one inherited from a published preset several layers
up — and the invocation that runs the check names none of it. Someone
reading the command reads "the checker ran over the file I changed and found
nothing." Someone reading the configuration reads "this checker does not
answer that question." Only the second reader is right, and the first
reading is the one that survives into a script.

The ecosystem's own guidance produces the configuration deliberately and for
good reasons: where a type system already resolves every identifier, the
redundant textual check is slower, less accurate, and noisier, so the
recommended setup turns it off and cites the type errors it defers to. The
guidance is correct. What it also does — silently, to every consumer of the
preset downstream — is convert "the fast rung is a subset of the slow rung"
into "the fast rung is disjoint from the slow rung on exactly the question a
new call site raises."

The shape recurs well beyond that one pair. A formatter's green is a claim
about layout and none about meaning. A schema validation's green is a claim
about each record's shape and none about whether its references resolve. A
scoped subset of a test suite is a claim about the cases it selected. In
every instance the error is the same substitution — *a check ran over this
file* standing in for *this file is correct*
([count-carries-predicate](../../../../_laws.md#count-carries-predicate): a
green carries a predicate, and the predicate is the question asked).

## The rule for an automated author

This costs most where the author is a program editing in a loop, because a
program will faithfully run whatever verification step it was given and
report success in the words of the standard rather than the words of the
instrument. So, as a construction rule:

> **An automated edit is verified by the instrument that owns the question
> the edit raises, not by the cheapest instrument that reads the same file.**

An edit that adds a call, an import, or a reference raises a resolution
question, and resolution is the type checker's question wherever a type
checker exists — so that edit's verification step runs the type checker, over
a scope that includes the edited file, and a scoped pass of any other tool is
recorded as what it is: silence on the matter at hand. The failure this
prevents is not a subtle one. It is an automated change reported as verified,
landing broken, and the report being technically true of everything it
actually said.

Two corollaries worth writing next to the script:

- **Name the question, not the tool, in the verification step.** "Confirm
  the new reference resolves" survives a change of toolchain; "run the
  fast checker on the changed files" survives nothing and drifts silently
  when the preset moves a rule.
- **Do not read overlap as redundancy.** The mirror error retires the
  expensive instrument because the cheap one "already covers it." Before
  deleting either of two apparently duplicated checks, establish which
  questions each is *configured* to answer today — the answer is frequently
  that they were made disjoint years ago
  ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

## Decision rules

- State, per rung, the question that rung answers. A rung whose question is
  unstated will be read as answering all of them.
- Where two instruments could answer one question, find the configuration
  that decides which of them does, and treat that configuration as part of
  the gate's definition rather than as setup.
- Verify an automated edit with the instrument that owns the edit's own
  question; a faster instrument's green is recorded as no evidence, not as
  weak evidence.
- Never infer coverage from co-location: reading the same file is not
  answering the same question.
- When a lower rung is clean and the next rung fails on unchanged content,
  suspect a partition before suspecting drift — the rungs may never have
  overlapped.
