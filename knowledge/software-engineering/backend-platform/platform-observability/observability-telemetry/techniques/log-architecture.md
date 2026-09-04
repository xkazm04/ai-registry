---
layer: technique
type: technique
subject: observability-telemetry
technique: log-architecture
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [deciding whether a value is a field or part of the message, a warn fires on every run, logging shows up in the profile]
---

# Log architecture

The architecture of a logging subsystem is four decisions — record shape,
level vocabulary, filter topology, and write path — and each has a
converged senior answer. Products that improvise them re-derive the same
answers slowly, one incident at a time.

## Structured records, prose payload

A log record is a **structured envelope around a human-readable message**:
timestamp, level, origin (the module or component that emitted it), and
optional key-value fields, with the message as one field among them — not
the whole record. The envelope is what makes the corpus queryable: filter
by origin, cut by level, correlate by the shared fields. Prose-only lines
force every future question through fragile text matching — the same
anti-pattern the failure domain bans for classification applies to
querying your own history.

Two rules on the fields:

- **The message is for humans; the fields are for machines.** Never make
  a consumer parse a value back out of the message that could have been
  a field. If something will ever be filtered on, grouped by, or counted,
  it is a field.
- **Interpolate nothing secret.** The write-path scrubbing gate (see the
  golden path) can pattern-match fields; it cannot un-bake a credential
  interpolated into free prose. Keeping values in fields is what makes
  scrubbing tractable.

## Levels are a contract, not a mood

A level vocabulary works only if every emitter and every consumer mean
the same thing by each level — one authority, everyone derives
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The converged semantics:

- **error** — something failed and a human should eventually know; every
  error-level record should correspond to a failure that also reached a
  door in the failure domain's sense.
- **warn** — surprising but survived; the record exists so that when the
  later failure comes, the precursor is on file. A warn that fires on
  every run is a lie at the vocabulary level — demote it or fix it.
- **info** — the skeletal narrative of normal operation: lifecycle
  transitions, subsystem starts, notable state changes. An operator
  reading info-only should be able to follow the plot.
- **debug/trace** — diagnosis detail, compiled for humans chasing a
  specific defect; off by default in production, and cheap enough to
  leave in the code permanently.

The production default derives from the contract: info and above to the
persistent sink, debug and below dark until summoned. A production log
that defaults to debug drowns rotation and turns every incident read
into an excavation.

### A level bound to a side effect leaves the vocabulary

The contract above says what each level *means*. A design that also
gives a level an *effect* — the formatter or the emitter terminating
the process on an error-level record, so that logging an error and
aborting are the same act — looks like the strongest possible
enforcement of that meaning. It is the opposite: it deletes the level.

The reasoning is short. Once `error` terminates, no call site may emit
`error` for a failure the program intends to survive. But "something
failed and a human should eventually know" describes an enormous number
of survivable failures — a version lookup that could not read its
registry, an unrecognized enumeration member falling back to a default,
an optional dependency that did not load. Every one of those must now be
emitted at `warn`, which this contract reserves for "surprising but
survived, on file for when the later failure comes." The level that was
supposed to mean *a failure reached a door* now means *the process is
ending*, and `warn` has silently absorbed both of its own meanings and
all of `error`'s. An operator filtering for errors sees only crashes,
and the record of the failure that caused the crash is a rung below,
mixed in with everything routine.

The tell in a codebase is a population count: if `warn` outnumbers
`error` by an order of magnitude and the `warn` records include things
that plainly failed, the vocabulary has already collapsed and the
binding is why.

Termination is a decision the failure domain makes, and it travels as a
typed outcome
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)),
not as a severity string that a formatting layer happens to inspect.
Keep the two separable: severity describes the record, the returned
outcome decides the fate. A system that wants one authority for "this is
fatal" should put it in the error taxonomy, where the classification
already lives, and let the logger report that classification like any
other field.

## Filter at the origin, per module

Verbosity is not one global knob. The useful shape is **per-origin
targeting**: each module's contribution is independently tunable, so a
noisy subsystem can be quieted without blinding the rest, and the module
under investigation can be opened to trace without drowning the sink in
everything else's trace. Two structural requirements:

- **Origins are stable names.** The targeting vocabulary is only usable
  if module names survive refactors well enough for a support
  instruction ("raise X to debug") to work across versions.
- **The filter is runtime-adjustable without a rebuild** — an
  environment override, a configuration entry, or a diagnostic command.
  The machine exhibiting the defect is rarely the machine with the
  toolchain.

Filtering belongs *before* the write path, at record construction —
records filtered after formatting still paid the formatting cost, and in
hot paths that cost is the difference between "logging is free" and
"logging shows up in the profile".

## The write path never blocks the work

The cardinal sin of a logging subsystem is transferring its own latency
to the code being logged. Persistent sinks live behind a **non-blocking
boundary**: the emitting thread appends to a bounded in-memory channel
and returns; a dedicated writer drains the channel to disk. Three
consequences follow from the word *bounded*:

- **Overflow policy is a decision, not an accident.** When the channel
  fills — a disk stall, a log storm — something gives: drop records (and
  count the drops as a first-class, visible number) or apply
  backpressure (and accept that logging now throttles the product).
  For diagnostics, dropping-with-a-counter is almost always right; a
  product that slows down because its diary is behind has inverted its
  priorities.
- **Flush is explicit at the exits.** Buffered records die with the
  process unless orderly shutdown drains the channel. The shutdown path
  owns a flush; the crash path owns nothing — which is precisely why
  crash evidence uses a separate store with a synchronous write
  (crash-record-storage).
- **The writer is the scrub point.** A single drain thread is the
  natural one-door position for redaction and formatting — every record
  passes it exactly once, regardless of which of the thousand call
  sites emitted it.

## One sink, many taps

All origins converge into one ordered stream, and the stream then fans
out to destinations — the rotating file, the developer console, the
remote channel's breadcrumb feed. The fan-out point applies per-
destination filtering (the file takes info+, the console takes whatever
the developer asked for, the remote feed takes the curated subset), but
ordering and record identity are decided once, at convergence. The test
for whether the architecture is right: during an incident, one file,
read top to bottom, tells the whole story — no cross-referencing private
diaries, no interleaving by hand.
