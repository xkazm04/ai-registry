---
layer: technique
type: technique
subject: keyed-sample-transforms
technique: missing-key-policy
status: forged
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [a keyed transform meeting a sample without one of its keys, running a training chain on inference samples that have no label, inverting a keyed chain over a dictionary with fewer keys than the forward pass]
---

# Missing-key policy

A keyed transform names the keys it acts on, and a sample may arrive without
one of them. The transform must do one of two things — raise, or skip the
key and continue — and it must do it by policy rather than by accident.
**The default is to raise; skipping is an explicit, per-transform opt-in;
and both are honoured by exactly one gate, the iterator that yields the keys
to touch.**

## Why raise is the default

A transform that skips a missing key has done nothing and returned a
dictionary that looks processed. If the key was missing because of a typo in
the key list — `lable` for `label` — the chain runs to completion with the
label never transformed, the image augmented, and the two now misaligned in
a way indistinguishable from a bad draw. The typo is found, if at all, by
inspecting outputs by eye. Raising turns it into a first-run stack trace
naming the transform and the key. An optional strictness that must be
switched on protects nobody, because the default is what runs
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)); the
strict reading has to be the one the caller gets without asking.

## When skipping is legitimate

There are samples that genuinely lack a key, and the same chain must serve
them. An inference sample has an image and no label; a partially annotated
case has an image and a mask but no contour. The caller who knows this says
so on the transforms that touch the optional key — the permissive flag is set
per transform, at construction, by the person assembling the chain — and
those transforms skip the absent key and process the rest. The flag is
never global, because "skip anything missing anywhere" is exactly the
silent failure the default exists to prevent, wearing a configuration
switch.

The standing case where every transform in a chain needs the permissive
mode at once is *inversion*: reversing a keyed chain over a dictionary that
holds only the predicted key, where the forward chain was told about several.
The inverse pass has to walk the same transforms, each named for keys the
inverse dictionary lacks, and it should not require the author of the
forward chain to have anticipated it. The library answer is a scoped
override — a context that sets every transform in a chain to permissive for
the duration of one call and restores the prior settings on exit, including
on exception. The restore is the load-bearing half; a permissive mode that
leaks past the inverse call into the next forward call has re-created the
global switch. The override's other obligation is reach: it must find
*every* keyed transform in the chain, including those inside nested chains
that a flattening pass keeps opaque because their mapping depth differs
from the parent's. An override that collects its targets from a flattened
view misses exactly those, and the inverse then raises on a missing key
from a transform the caller believed it had covered. Walk the tree; never
rely on the flattened list.

## One gate

The policy is honoured in one place: the iterator that walks the transform's
key list against the sample and yields the keys that will be processed. It
checks presence, consults the transform's permissive flag, raises with the
transform name and the key when the key is absent and the flag is off, and
yields nothing for that key when the flag is on. Every keyed transform
obtains its keys through this iterator and no keyed transform tests key
presence itself.

The reason is the one every validation door has
([one-validation-door](../../../../_laws.md#one-validation-door)): a check
implemented in each transform is a check absent from the transform written
next quarter, and a chain is only as strict as its least strict member.
The single gate also gives the scoped override one thing to flip, and gives
the error message one authoring site, so that "transform X requires key Y
and the sample has keys A, B, C" reads the same from every transform.

The iterator is also where per-key parameter lists are zipped with the key
list, so that a skipped key skips its parameters too and the alignment
between keys and parameters survives the skip. A transform that zips its
own parameters outside the gate misaligns them on the first skipped key.

## Decision rules

When a chain serves samples that always carry every key, leave every
transform strict and let a missing key be the error it is. When one key is
optional across the dataset, set the permissive flag on the transforms that
name it, and only those. When a chain is inverted over a reduced dictionary,
use the scoped override for the inverse call rather than loosening the
forward chain. When a transform is found checking key presence outside the
iterator, route it through the iterator; the check is not wrong, it is in
the wrong place.

When a missing key should be *filled* rather than skipped or raised — a
default mask of ones, an identity affine — that is not a missing-key policy,
it is a keyed transform that creates the key, placed ahead of the transforms
that need it. Filling inside the gate would make the gate a second author of
sample content.

## When not to use it

A chain whose samples are validated against a schema at ingestion, so that a
missing key cannot reach a transform, gets no value from a second check. The
technique is for open dictionaries flowing through chains assembled by the
caller, where the key list on each transform is the only schema there is.
