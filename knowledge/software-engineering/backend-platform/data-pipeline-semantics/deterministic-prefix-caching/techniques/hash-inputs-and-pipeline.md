---
layer: technique
type: technique
subject: deterministic-prefix-caching
technique: hash-inputs-and-pipeline
status: forged
laws: [derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [naming the on-disk entry for a cached head output, a transform parameter changed and the cache kept serving the old output, writing the docstring for a persistent cache]
---

# Hash inputs and pipeline

A persistent cache entry needs a name, and the name must change when the entry's
content would. The content is the output of the head transforms applied to one record,
so the name is a function of two things: the record and the head. The technique is to
build the key from a hash of the record, extend it best-effort with a hash of the head
transforms, document in the mechanism's own reference that the head hash is advisory
and not guaranteed to track behavioural change, and give the operator a single command
that clears the cache. Each of those four clauses does a job the others cannot.

## The record half is sound

A record is data — a path, an identifier, a dictionary of paths and labels. Hashing it
is well-defined: serialise it canonically (sorted keys, stable encoding) and digest the
bytes. Two records that serialise the same are the same record for the cache's
purposes, and a record that serialises differently gets a different entry. The only
care needed is canonicalisation: a dictionary whose key order varies between runs must
be sorted before hashing, or the same record earns two entries and the cache is half
as effective as it looks. Where a record contains a file path, the hash keys on the
path and not on the file's contents; a file replaced in place under the same path is a
staleness the record hash cannot see, and that case belongs on the list of things the
documentation says.

Two details of the record half are easy to get wrong in the same direction. The hash
is computed from the record *before* the head runs, and the head runs on a copy: a
dictionary-shaped record is typically mutated in place by the stages that load and
transform it, and a hash taken afterwards is a hash of the output, which differs per
run and never hits. And where the record list contains duplicates — a manifest that
oversamples rare cases by repeating rows — keying on the record's hash rather than its
position collapses the duplicates into one entry, which is both smaller and correct,
since the head's output for identical records is identical.

## The head half is advisory, and says so

The head is a list of transform objects. A transform has parameters, and the
parameters decide its output — a resample to a different spacing, a normalisation
with a different window, a crop to a different size. If the key does not include the
head, an operator who changes a parameter and reruns gets the previous parameter's
output from the cache, with no error, for as long as the cache lives.

So the key includes the head — as a hash of a serialisation of the transform objects
— and the honest statement about that hash is that it is best-effort. A transform can
hold a closure, a reference to a function, a lazily-built table, a nested object from
another library; the serialisation of these is not guaranteed to change when their
behaviour changes (a function's identity is its name and module, not its body) and
not guaranteed to stay fixed when their behaviour does not (an object with an address
in it). A key built from this hash is a gate that observes a proxy, and the standard
does not pretend otherwise. The documentation for the persistent cache carries the
sentence, near the parameter that enables the hash: the transform hash is a
best-effort signal and does not guarantee invalidation on every change; when in doubt,
clear the cache.

That sentence is the technique's most important output. It converts a class of
silent bug ("I changed the spacing and the loss did not move") into a documented
limitation with a documented response. An operator who has read it changes the
parameter and clears; an operator who has not read it changes the parameter and
trusts. The disclaimer belongs where the parameter is declared, not in a
troubleshooting page, because the operator who needs it is reading the constructor.

## The clear is one command

A derived value names its recomputation, and for a cache the recomputation is: delete
the entries, run the head again. The mechanism therefore exposes a clear that takes
no arguments — remove the cache directory, or remove every entry under the current
key prefix — and the documentation names it in the same breath as the disclaimer. A
clear that requires the operator to find the directory, confirm it is the right one,
and delete it by hand is a clear that is skipped, and the skip is where the stale
entry survives.

Replacing the dataset's records is a clear. A dataset that accepts new data after
construction — a new fold, a new manifest — removes its cache directory as part of
accepting it, rather than leaving entries from the old records beside entries from the
new. The old entries would never be hit (different record hashes) but they would
occupy disk under a name that suggests they are current, and a later operator would
have no way to tell which entries belong to which data.

## Procedure

1. Canonicalise the record and digest it. The digest algorithm is chosen for speed
   and collision resistance over the dataset's size, not for cryptographic strength;
   it is named in the key so a future change of algorithm changes every key.
2. Optionally digest the head. Serialise the transform list with a general object
   serialiser, digest the bytes, and append the digest to the record's. Make this
   optional and off by default only if the serialiser is expensive relative to the
   head; otherwise on by default, because the failure it prevents is worse than the
   cost it adds. When the serialiser refuses a transform — a member it cannot
   represent — fall back to a weaker signal rather than none: digest the sequence of
   stage class names. That catches a stage added, removed or reordered and misses a
   parameter change, and the fallback is logged so the operator knows which grade of
   hash the cache is keyed on.
3. Write the disclaimer beside the option. Write the clear beside the disclaimer.
4. On any replacement of the dataset's records, clear.
5. When the read path fails to load an entry that exists — a serialisation the
   current version cannot read, a field the format cannot represent — treat it as
   corrupt: unlink and recompute
   ([atomic-write-then-move](./atomic-write-then-move.md) owns the write side of
   that), and log that it happened. A cache where every read fails and falls through
   to recompute is a cache that is all miss while looking full, and only the log
   distinguishes it from a cache that hits.

## Decision rules

When an operator asks whether the cache noticed a change, the answer is "clear it";
do not reason about whether the hash would have caught this case. When the head
contains a transform whose serialisation is known to be unstable across processes,
exclude it from the head hash and say so, or the cache is all miss across runs. When
two operators share one cache directory with different heads, the head hash is what
keeps their entries apart, and a mechanism with the hash off cannot be shared.

## When not to use it

An in-memory cache that lives and dies with the process needs no key beyond the
record's index; the head cannot change under it. A cache whose head is a fixed,
versioned pipeline — a deployed preprocessing service with a release number — keys on
the release number, which is sound, and does not need the advisory hash at all. The
advisory hash is for the case where the head is an object graph assembled in a script
by the person running it, and that is the common training case.
