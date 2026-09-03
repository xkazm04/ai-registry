---
layer: technique
type: technique
subject: supply-chain
technique: unsafe-deserialization-off-by-default
status: forged
laws: [absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [loading a saved model, checkpoint, array archive or object graph produced outside the current process, a loader whose permissive mode is the default, choosing a serialization format for state that will be shared or downloaded, a security advisory names a load path]
---

# Unsafe deserialization off by default

Some serialization formats store *data*. Others store *instructions for
reconstructing objects*, and a loader that honours those instructions will
instantiate whatever type the file names — including one whose constructor
runs arbitrary code. Native object pickling, markup-language loaders with
type tags, array archives that may contain object members, and model
checkpoint files that carry the pickled program alongside the weights are
all in the second family. A file from that family, loaded from a download, a
shared bucket, a user upload or a cache another process wrote, is a program
you are choosing to run.

[archive-extraction-safety](./archive-extraction-safety.md) owns the
container: entry names as paths, declared sizes as claims. This technique
owns what happens *after* the container is opened and a member is turned
back into an object. The two are cousins because they are forgotten the same
way — the format library decodes; it does not defend — and they are distinct
because the container defense is a path check while this one is a decision
about which loader exists at all.

## The rule

**The restricted loader is the default; the permissive one is an explicit,
named, per-call opt-in; and the storage format migrates to a data-only one so
the opt-in can retire.** Three parts, each necessary:

- **Default off.** Every load site that can instantiate types takes a flag
  that is false unless the caller sets it. Not "safe mode available" —
  *default*. A guard that must be requested is an absent guard on the
  deployments that matter
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)); three
  large scientific-computing ecosystems flipped exactly this default between
  2019 and 2025, each after an advisory, and each found that the permissive
  path had been on for every user who never read the docstring.
- **Named for the risk, at the call.** The flag says what it grants —
  "allow pickled members", "load code as well as weights" — so a reviewer
  reading the call site sees the grant. A flag inverted into a safety word
  (`safe=false`) reads as a preference; a flag naming the hazard reads as
  the exception it is. Where a whole legacy fleet cannot migrate at once, an
  environment-level override may re-enable the permissive path, read once at
  startup and logged when set: a fleet-wide silent grant is worse than no
  guard, because it looks like one.
- **Migrate the format.** The opt-in is a bridge, not a destination. State
  that is shared between processes, machines or versions moves to a
  data-only format — a structured text encoding, a weights-only tensor
  container, an archive whose members are all numeric — and the permissive
  flag is removed once nothing produces the old shape. The permissive mode's
  own `removed` version belongs in the same declaration that deprecates it.

## Enumerate the sites; test the refusal

The prominent loader is the one that gets fixed; the others are the ones
that get exploited. Grep for every call that opens the format and treat each
as its own site, exactly as the container rule does. Then prove the guard is
live rather than declared: build two archives with the project's own key set
— one shaped like the producer writes it, one with a single object-typed
member — and load both through both arms. The producer-shaped archive must
load identically with the grant off; the hostile-shaped one must be refused
with the grant off and *accepted* with it on. A gate must see what it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)): a refusal you have
not watched fire on a hostile shape is a docstring.

The producer-shaped arm is the one teams skip and the one that carries the
finding. When it loads identically, the permissive grant was never needed
for the data the project actually writes; it was on because it was the
default when the reader was written. That is the common case, and it means
the flip costs nothing but the flag.

## Decision rules

- **Data that crosses a process boundary is loaded restricted**, whoever
  wrote it. "We produced it ourselves" is a claim about the past, not about
  the file on disk now.
- **The permissive flag is per call, named for the hazard, and false by
  default.** A module-level or global permissive setting reintroduces the
  silent fleet-wide grant.
- **An environment override is read once, logged when present, and carries
  its own removal version.**
- **Every load site is enumerated**, not just the one the advisory named.
- **Both arms run against a hostile shape before the change ships**; the
  refusal is a measurement, not an assertion.
- **The storage format migrates**, and the permissive path is deprecated
  against a version, not left as a permanent escape hatch.

## When not to use this

State written and read by the same trusted process within one lifetime — an
in-memory cache spilled to a private temp file and reloaded before exit —
gains nothing from the restricted loader and may need object members. The
boundary is the process, not the format: the moment the file can be replaced
by something else between write and read, it is outside, and the rule
applies.
