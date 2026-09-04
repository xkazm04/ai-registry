---
layer: technique
type: technique
subject: self-describing-data-envelopes
technique: global-tracking-kill-switch
status: forged
laws: [absent-guard-is-loud, one-authority-per-vocabulary]
shared_with: []
use_when: [a caller that wants bare primitives from an envelope-carrying pipeline, deciding the default for metadata tracking, a per-transform tracking flag that has started to drift]
---

# Global tracking kill switch

An envelope costs something on every operation: a slot copy, a journal append,
a dispatch through the hook that re-attaches metadata. For most of a pipeline's
consumers the cost is invisible and the benefit is the whole point. For a few
it is pure overhead — a training loop that resampled everything to one frame at
load time and will never invert, a numerical-debugging session that wants the
engine's own type with no surprises, a benchmark that must not be confounded
by tracking. Those consumers need a way to make the envelope go away, and the
way must be **one switch, process-global, read where envelopes are minted**.

## Why one switch and not a flag per transform

The tempting alternative is a `track` parameter on each transform, defaulting to
on. It appears to offer finer control, and it does — but the control is
illusory, because tracking is not a property of a transform. It is a property
of the *value*: either the datum carries a journal or it does not, and a chain
in which the third transform stops tracking hands the fourth a datum whose
journal is truthful up to a point that nothing records. The fourth transform
pushes its entry onto a journal missing the third's, inversion later pops the
fourth and then undoes the second on a value the third had changed, and the
failure is a plausible-looking result in the wrong place. Per-transform flags
are a second authority for a fact that must have
[exactly one](../../../../_laws.md#one-authority-per-vocabulary).

So the switch is global, and *tracking* means all of it: when the switch is off,
the constructor returns the bare primitive rather than an envelope, the dispatch
hook returns whatever the engine returned without decoration, and any journal a
transform tries to push onto does not exist. There is no half state. A datum is
an envelope with every slot live, or it is the engine's primitive.

## The default is on

The guard that must be switched on protects the examples and not the
installations; a fleet converges on the default, and if the default is off, the
consumers who needed tracking discover that at the first inversion that returns
garbage — long after the datum that needed the journal was produced
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The
default is therefore *on*, and switching it off is a deliberate, visible act at
the top of a program, not a configuration row that may or may not be present.

The switch is a **function call**, not a bare module variable, so that the
place tracking is disabled is greppable and so that the implementation can, if
it must, do more than flip a boolean — reset thread-local state, emit a
one-time notice, refuse when envelopes already exist in flight. An
environment-variable override for the same switch is acceptable as a
deployment convenience, provided the variable is read at exactly the point the
function would have been called and nowhere else; two readers of the variable
are two authorities again.

## What "off" must guarantee

When the switch is off, a consumer must be able to rely on three things, and
the test suite asserts each of them explicitly.

**Every value is the engine's own type.** Not an envelope with empty slots — the
primitive. A consumer who switched tracking off to debug a numerical
discrepancy is entitled to a value that the engine's own tooling recognises
without any subclass in the type chain.

**Every operation that would have consulted the envelope still succeeds.** A
transform that reads the frame to decide how to resample must, with tracking
off, either fall back to a stated default frame or accept the frame as an
explicit argument. A transform that *requires* the envelope and raises without
it has silently made the kill switch unusable for every pipeline containing it;
such a transform documents that requirement in its own contract and the
pipeline author is warned at composition time, not at the first sample.

**Inversion refuses loudly.** A pipeline whose values carried no journal cannot
be inverted, and the inverse must say so — not return the input unchanged, not
warn and proceed. The kill switch removes a capability; it must never convert
that capability into a silent no-op.

## Scope and lifetime

The switch is read when an envelope would be minted and when the dispatch hook
decorates a result, and at no other time. It is not cached per transform, per
dataset or per worker, because a cached read is a second authority that
outlives a change to the first. In a worker pool the switch's state at fork
time is what workers see, which is the correct behaviour and worth stating:
a program that flips the switch after spawning workers has two populations of
processes producing two kinds of value, and the collate step will meet both.

## When not to use it

The kill switch is a process-level decision for a consumer who wants none of
the envelope. It is not the tool for a *stage* that wants to hand a bare
primitive to one engine call — that stage calls the envelope's explicit
degrade-to-primitive method on its input and, if the metadata is needed
afterwards, re-attaches it from the value it kept. It is not the tool for
disabling one slot — a pipeline that wants a frame but no journal has a design
question, not a switch question, and the answer is usually that it wants the
journal too and has not met the failure yet. And it is not a performance knob
to be flipped in production on a hunch: the cost of tracking is measured
before it is switched off, because the inversion it disables is the one a
downstream consumer will ask for the week after.
