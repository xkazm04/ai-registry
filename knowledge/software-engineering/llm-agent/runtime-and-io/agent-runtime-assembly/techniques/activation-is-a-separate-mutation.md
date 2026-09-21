---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: activation-is-a-separate-mutation
status: forged
laws: [absent-guard-is-loud, silent-state-is-ungoverned, one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [deciding whether an extension install needs the review a code change gets, an installed extension contributes a callback that runs on operations nobody in that session started, a committed gate is believed to be running and nothing has confirmed it, an install step is written so it cannot fail, classifying a configuration change by what it reaches rather than by what it declares]
---

# Activation is a separate mutation

An extension install is read as one decision — accept this, or do not — and it is
several writes with different reach, different lifetimes, and different
observability. Sorting them by what the extension *declares* gets the
classification wrong, because the declaration is the part everybody looks at. Sort
them by **reach**: what the write can cause to happen, and to which sessions.

Three reach classes are enough, and the boundaries are sharp:

| class | the write is | what survives the installing session |
| --- | --- | --- |
| **prompt** | text a model consumes inside a turn | only the model's output |
| **executes** | something that runs when this session asks for it | nothing |
| **executes and persists** | a registration the host reads at the *start* of later work | a program that runs on sessions that never asked for it |

The third class is the one the install decision is actually about. A contribution
in it runs on operations started by people and processes that never consented to
it, for as long as the registration stands, and its content is free to change
underneath the registration. Adding instructions cannot enter that class: an
instruction is bounded by the context that consumed it, and the next session that
does not load it is unaffected. So an install that reaches the third class and an
install that only adds instructions are not two sizes of the same decision.

## The component that decides is not the component that gets reviewed

Reach and visibility are two different orderings, and the naive expectation — that
the further something reaches, the harder it is to change unseen — is false in the
ordinary case. A persisted registration has at least three parts, and they are
written to three places with three different review surfaces:

- **the body** — the callback or the configuration entry, usually a tracked file in
  the repository, so a diff shows it and a reviewer reads it;
- **the activation** — the value that makes the host look at the body at all, very
  often a machine-local setting that is in no repository, in no diff, and in no
  review;
- **the payload** — the code the body dispatches to, which for an installed
  extension commonly lives in a tree the repository deliberately excludes, so the
  reviewed body is a pointer and the thing it points at changes with no commit
  anywhere near it.

Measured over a real fleet of eighteen repositories with a push-stage gate, the
three orderings came apart completely: **every gate body was tracked, no
activation value was, and under half the installed extension entries were.** The
best-reviewed artifact was the executing one, and the two components that decide
whether it executes and what it executes were the two nobody could see. The
same census found hand-written instruction documents tracked almost universally
and *installed* instruction copies tracked almost never — so the property that
predicted visibility was not execute-versus-instruct at all. It was
**hand-authored versus installed**.

That is the correction this technique carries. Classify by reach to decide whether
the install needs a decision; then ask, per component, whether a review can see it
at the moment the code runs. A review binds only surfaced state
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)),
and reviewing the install harder does not surface a value that lives outside every
artifact a review reads.

## An install step written so it cannot fail is not an install step

The standard mitigation for an unobservable activation is an install step wired
into the project's bootstrap, so that a working checkout implies a working
registration. In the field that step is written to swallow its own failure,
because the bootstrap also runs where the registration is meaningless — a
container build, a continuous-integration checkout — and a bootstrap that dies
there is worse than an ungated push. The idiom that results is silent on success
and silent on failure.

That converts the mitigation into an instance of the thing it mitigates, one level
up. The registration's absence was undetectable; now the *installer's* failure is
undetectable too, and the operator's belief that a checkout implies a gate is
exactly as unfounded as before, with one more layer of apparatus supporting it
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The resolution separates the two properties the idiom conflates. **Not fatal** is
correct and must stay: the bootstrap may not fail where the registration is
meaningless. **Silent** is not, and it was never required. So:

- the install step reports what it set, in the words a reader can act on, and
  reports just as loudly when it could not set it, naming the reason and the
  one command that repairs it;
- it exits zero either way, so the environments that do not want a registration
  are unaffected;
- a **separate** mode has teeth: it is the one that fails, it runs where the
  answer matters rather than where the install happens, and it compares the
  registration the repository declares against what is actually registered —
  activation included. Three outcomes, three outputs
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
  registered, not registered, could not tell.

A gate that already refuses loudly when its payload is missing has solved the
easier half. A missing payload produces a message; a missing *activation* produces
nothing at all, because the body that would have printed the message was never
reached. Only the separate mode with teeth can see that, and only if it reads the
activation rather than the body.

## What this does not license

This is a classification rule and an observability rule. It does not say who may
write a registration that names code — that ladder is ordered by writer and stays
where it is. It does not say a third-class install is forbidden; a push-stage gate
that an extension contributes is a good thing to have, and the point of
classifying it is to stop the install being waved through as "one more
instruction". And it does not make the payload reviewable: an extension tree the
repository excludes on purpose is excluded for good reasons, and the honest
posture is that the registration's content is trusted at install time and
re-trusted every time the tree changes — which is a fact to state in the record,
not a gap to paper over with a diff of the pointer
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
the declared registration and the actual one are one vocabulary, and the mode with
teeth is what keeps them from becoming two).
