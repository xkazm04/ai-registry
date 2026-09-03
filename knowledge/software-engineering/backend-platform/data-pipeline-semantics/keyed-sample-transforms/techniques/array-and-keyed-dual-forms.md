---
layer: technique
type: technique
subject: keyed-sample-transforms
technique: array-and-keyed-dual-forms
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [adding a transform to a library that has both single-value and dictionary callers, a keyed transform whose behaviour has drifted from its single-value twin, deciding where a new transform parameter belongs]
---

# Array and keyed dual forms

Every transform ships twice: as a pure callable over one value, and as a
keyed wrapper that applies that callable to the named entries of a sample
dictionary. The rule that keeps the pair honest is a division of labour with
no overlap: **the single-value form is the only implementation of the
operation, and the keyed form owns key iteration and nothing else.**

## The shape

The single-value form takes a value and its parameters and returns a value.
It has no notion of a key, a sample, or a sibling field. It is separately
constructible, separately callable and separately tested, and a caller with
one array and no dictionary uses it directly.

The keyed form is constructed with the list of keys it will touch plus every
parameter the single-value form accepts. Its constructor builds one instance
of the single-value form from those parameters and holds it. Its call
iterates the keys, applies the held instance to each value, writes the result
back under the same key, and returns the dictionary. That is the whole of it.
Anything the keyed form does beyond iteration — a random draw, a missing-key
decision, a fan-out — is an obligation of the *wrapper role* and is stated in
its own technique; it is never a second implementation of the operation.

The two forms share a name by convention, with a fixed suffix or namespace
marking the keyed one, so that a reader who knows one can find the other
without a lookup. Where a sample has fields that need different parameters
under the same operation — the image interpolated smoothly, the label
interpolated by nearest neighbour — the keyed form accepts per-key parameter
lists of the same length as the key list, broadcast from a scalar when one
value is given, and passes the matching entry to the single-value form on
each iteration. Per-key parameters live in the wrapper because they are a
property of *which key*, and the callable does not know what a key is.

## The two ways the pair drifts

**Drift by re-implementation.** Someone extends the keyed form directly — a
special case for a particular key, an extra normalisation step — because it
was the form they were calling. The single-value form no longer does what the
keyed form does; the tests of one no longer cover the other; and the next
person to use the single-value form standalone gets behaviour the keyed
users abandoned a year ago. The fix is structural: the keyed form's call
body is a loop over a delegation and nothing else, and a review that finds
operation logic inside it rejects the change. A vocabulary — here, the set
of behaviours the operation has — needs exactly one authoritative definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and two implementations of one operation are the race that law names.

**Drift by parameter.** The single-value form gains a parameter and the
keyed form's constructor is not updated to accept and forward it. The keyed
form still works, silently, at the old default. This one is the harder to
see because nothing fails; it shows up as a keyed caller who cannot get the
new behaviour and does not know why. The rule is that a parameter added to
the callable is added to the wrapper in the same change, and a test that
constructs both forms with the same argument set and compares outputs on a
one-key dictionary catches the omission mechanically.

## Decision rules

When a behaviour depends only on the value, put it in the single-value form,
because it must be reachable by callers without a dictionary. When it depends
on which key, on a sibling key, or on the sample as a whole, put it in the
keyed form, because the callable cannot see those. When a behaviour seems to
need both — it acts on a value but only for keys matching a predicate — it is
still two pieces: the predicate selects keys in the wrapper, the action lives
in the callable.

When a transform only makes sense over a dictionary — a rename, a copy from
one key to another, a delete — it has no single-value twin, and the library
should say so by shipping only the keyed form rather than a vacuous
single-value one. The dual-form rule is about operations on values, not a
requirement that every dictionary utility invent a value-level meaning.

When the keyed form must apply *one* operation to a *pair* of keys jointly
— a transform that reads the image to decide how to crop the label — that is
not a keyed wrapper over a single-value callable; it is a dictionary-only
transform with two inputs, and disguising it as a wrapper hides the coupling.

## When not to use it

A library with one consumer that only ever passes dictionaries pays the
dual-form cost for nothing, and a library whose values are not homogeneous
— where "the same operation" on two keys is two different algorithms — has no
single-value form to share. The technique earns its keep exactly when the
same numeric operation is applied to several fields of one sample and to
standalone values elsewhere, which is the normal case in supervised training
pipelines and an unusual one outside them.
