---
layer: technique
type: technique
subject: keyed-sample-transforms
technique: single-draw-per-sample
status: forged
laws: []
shared_with: []
use_when: [a random augmentation over a dictionary with an input and a label, a label that no longer aligns with its image after augmentation, designing the randomisation interface of a single-value transform]
---

# Single draw per sample

A random transform over a sample with several spatial keys must produce
identical geometry on every key: the same rotation angle, the same crop
corner, the same flip decision. The mechanism is that **the keyed wrapper
draws the random parameters once per sample, then calls the single-value
form with randomisation disabled for every key**, so the callable applies
frozen parameters and never draws on its own.

## The two-call idiom

The single-value form of a random transform separates two things that a
naive implementation fuses: *drawing* the parameters and *applying* them. It
exposes a draw step that reads its generator and stores the result on the
instance, and an apply step that takes a value and a switch saying whether to
draw first. Called standalone, the switch is on and one call does both.
Called from the keyed wrapper, the wrapper invokes the draw step once, then
calls apply on each key with the switch off. The single-value form is now a
pure function of its stored parameters for the duration of the sample.

That interface — draw, then apply-without-drawing — is a design constraint
the keyed form imposes on the callable, and it is the reason a random
single-value transform cannot be written as "draw inside the call" even
though that is the obvious shape for a standalone user. A library that
discovers this after shipping a dozen random transforms rewrites all of
them; a library that states it up front writes each one once.

## Why the naive form is dangerous rather than merely wrong

Drawing per key does not fail. It returns a dictionary of the right shape
with an image rotated by one angle and a label rotated by another, and
nothing downstream can tell. A model trained on it learns to predict labels
that are slightly and randomly displaced from their images, which lowers
the ceiling on every metric by an amount that looks like a hard dataset
rather than a bug. The defect is found, when it is found, by someone
visualising an augmented pair by hand. The rule exists because the failure
is invisible at every automated checkpoint.

The test that catches it is cheap and belongs beside every random keyed
transform: build a sample whose image and label are the same array, apply the
transform, and assert the two outputs are equal. If any key received a
different draw, the assertion fails on the first run.

## The draw is a property of the sample, not the key

Everything the transform decides randomly is decided before the first key is
touched, from one read of the generator. That includes decisions that look
per-key — whether to apply at all under a probability — because a
probabilistic transform that fires for the image and not for the label is the
same misalignment in a different costume. The wrapper reads the probability
once, and either every key is transformed or none is.

Where a random transform genuinely needs per-key variation — noise added
independently to two channels — the variation is drawn once as a *set* of
per-key parameters before iteration, indexed by key during it. The draw still
happens once per sample; what it produces is a vector rather than a scalar.
The property being protected is that the generator is read a fixed number of
times per sample regardless of how many keys are present, so that adding a
key to a sample never changes the parameters the existing keys receive.

## Two draws, two owners, one read each

In practice the wrapper makes two calls before iterating, not one, and the
distinction is worth keeping. The first is the wrapper's own: whether to
fire at all, from its probability. The second belongs to the held
single-value instance: the parameters, drawn onto that instance. Both happen
once per sample, before the first key, and the key loop then calls the
callable with drawing disabled. Keeping the gate draw in the wrapper and
the parameter draw in the callable means the callable is usable standalone
with its own probability, and the wrapper's coin governs all keys without
the callable knowing a coin exists.

Because the wrapper holds a callable with its own generator, **seeding the
wrapper must seed the callable**: the wrapper's set-random-state forwards to
the held instance. A wrapper that seeds only itself is reproducible in its
coin and unreproducible in its parameters, which is the worst of both — a
chain seeded twice fires the same transforms on the same samples with
different geometry, and the discrepancy looks like a bug in the transform
rather than in the seeding.

## Where the state lives

The drawn parameters live on the single-value instance the wrapper holds,
between the draw and the last apply. That makes the instance stateful under a
call, which is what the thread-safety marking technique responds to; it also
means the wrapper must not hold one single-value instance and call it from
two samples at once. A wrapper that wants to be pure across samples copies
the callable before drawing, at a cost that is rarely worth paying — the
per-item copy the marked-transform contract already requires covers the
concurrent case, and the sequential case has no race.

## Decision rules

When a transform is random and keyed, it draws once in the wrapper and
applies with drawing disabled, without exception. When the single-value form
has no way to apply without drawing, it is not ready to be wrapped, and the
fix is to the callable's interface rather than to the wrapper. When a
transform's random decision is a probability of firing, the coin is flipped
once per sample and its outcome governs every key. When a draw must differ by
key, it is drawn as a per-key set before iteration, never inside it.

## When not to use it

A keyed transform with no random component has nothing to draw and the
technique does not apply. A keyed transform whose keys are deliberately
independent — an augmentation applied to unrelated fields that never need to
align — can draw per key, but should say so in its name, because a reader
assuming the library's default will expect alignment and be wrong.
