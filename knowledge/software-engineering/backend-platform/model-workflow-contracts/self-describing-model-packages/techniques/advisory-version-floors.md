---
layer: technique
type: technique
subject: self-describing-model-packages
technique: advisory-version-floors
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [recording which framework and engine versions a model package was built on, deciding what a consumer should do when its installed versions differ, reviewing a package loader that refuses on version inequality]
---

# Version floors are advisory

A package was built somewhere: under one version of the framework, one
version of the tensor engine, one version of the array library, perhaps with
a handful of extras. Those facts belong in the metadata, because a consumer
whose environment differs wants to know it before the first opaque failure.
The question is what the consumer is meant to *do* with them, and the two
naive answers are both wrong.

The first naive answer treats the recorded versions as pins: equality
required. A consumer with a newer framework is refused, learns that the
check refuses working installs, and disables it — and now the check guards
nothing. The second naive answer records the versions and checks nothing,
which is the first answer's endpoint reached without the detour.

The rule: **record the versions the package was built on as floors, warn
when the installed version is below a floor, and enforce only what you can
actually test.** A version number is a proxy for compatibility; the model
loading and forward-passing is compatibility itself, and the package has a
way to test that directly.

## Floor semantics

The metadata states the versions it was **generated on**, and the
specification states, in one clause, that later versions are expected to
work. That clause is what makes the field a floor. Without it, a reader is
free to interpret the number as an equality, and the strict reader is the
one that ships.

The recorded value is the **release part** of the version and nothing else.
Engines and frameworks decorate their version strings with build metadata —
a local hash, an accelerator toolkit tag, a pre-release marker — and a floor
that carries the decoration compares against nothing on any other machine.
Strip it at record time, so the field says what was built on in terms a
comparison can read. The comparison itself is over **parsed** version
components, never over the strings: a lexicographic compare orders a
two-digit minor below a one-digit one and turns the floor into noise in
exactly the direction that trains consumers to ignore it.

A floor is checked with one comparison: installed below recorded means the
consumer is running something older than what the package was built on, and
the package cannot promise anything about that. The consumer is told so, in
a warning that names both versions, and is allowed to proceed. Above the
floor, silence — that is the expected case.

The warning must be loud enough to be seen and quiet enough to be
tolerated. It is issued once per load, at the point of load, naming the
package, the field, the recorded version and the installed one. A guard
that fires as a debug line nobody reads is an absent guard
(`../../../../_laws.md#absent-guard-is-loud`); a guard that fires on every
inference call is a guard that gets muted.

## Extras beyond the base

A package may need libraries the base framework does not require — a
specific reader for its input format, a specific runtime for its compiled
form. Those go in a separate map, name to version, and the same floor
semantics apply. The consumer reads the map to know what to install; it does
not, by default, refuse when something is missing, because the thing might
be needed only by a workflow the consumer is not running. A training-only
dependency is not a reason to refuse inference.

## Enforce only what you can test

The line between advisory and enforced is drawn by what the package can
observe. A version comparison observes a string. A forward pass observes
whether the weights load into the network under the installed engine and
whether the network runs. The second is the gate; the first is a hint about
what the gate might find (`../../../../_laws.md#gate-sees-target`).

So: the version check warns. The load-and-forward-pass check — the same one
the shape-constraint technique ships — fails. A consumer that wants a hard
gate on compatibility runs the forward pass, and a consumer that only wants
to know what it is getting into reads the warning. Neither is fooled by a
green version check into thinking the model runs, and neither is blocked by
a red one from finding out.

A stricter regime is legitimate in one place: a consumer that *is* the
deployment gate — a serving container's start-up, a catalogue's admission
check — may promote the warning to a refusal, by its own policy, because it
has decided that "built on a newer version than I have" is a risk it will
not carry. That is the consumer's decision, made at the consumer, and the
package's tooling does not make it for everyone.

## Decision rules

- **When the installed version is below the floor, warn and continue.** The
  package cannot know whether the older version works; the consumer can find
  out, and the warning tells it to.
- **When the installed version is above the floor, stay silent.** A warning
  on the expected case trains consumers to ignore warnings.
- **When a required extra is absent, warn at load and fail at use.** The
  import that needs it is the thing that fails, with the package's recorded
  version in the message, so the consumer knows what to install rather than
  what went wrong.
- **When the floor is a major version behind the installed one, still
  warn rather than refuse** — but say "major" in the warning. The odds of
  breakage are higher and the consumer deserves to know the gap is not
  trivial.
- **When the metadata records no version at all, treat it as unknown, not
  as satisfied.** An absent floor is not a passed check; it is a package
  that did not say, and the consumer reports that as its own outcome.

## When not to use this

Do not apply floor semantics to the schema version of the metadata itself.
That is a contract version, and the neighbouring subject's rule holds: a
major version above what the reader understands is a refusal, stated as
such, because the reader cannot guess what fields mean. Floors are for the
runtime the model runs on; the contract the metadata speaks is pinned.
