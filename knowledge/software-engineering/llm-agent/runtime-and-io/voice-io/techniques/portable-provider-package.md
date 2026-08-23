---
layer: technique
type: technique
subject: voice-io
technique: portable-provider-package
status: forged
laws: [one-authority-per-vocabulary, verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [a second app needs the same voice engines the first one has, wrapping a voice engine behind an app route, letting a user compare engines by ear before committing]
---

# The portable provider package

Engine abstraction (one interface per direction, adapters behind it) answers
how a *product* outlives its engines. The moment a second product on the
same machine wants the same engines, a new question appears: how does the
engine layer itself travel — without the first app's secrets store, its
logger, its route conventions, or its settings page coming along? The naive
answer, copying the adapter folder and patching the imports, produces two
drifting copies of one engine vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary))
and, worse, two installs of a multi-hundred-megabyte local model that each
app downloads for itself. This technique is the discipline that makes the
engine layer a **package**: a directory that binds to any host through one
narrow seam, carries its own validation and test fake, and leaves policy —
authentication, throttling, preference storage, money — to the app that
embeds it.

## The host seam is the whole portability story

A package is portable exactly to the degree that its dependencies on the
host are *enumerated in one object* rather than scattered as direct reads of
process environment, home directories, working directories and loggers. The
seam a synthesis package needs is small, and keeping it small is the point:

- **configuration lookup** by name — the package names which keys it reads
  (`requiredEnv` on each adapter, names only, never values) and the host
  decides whether those come from environment, an encrypted vault or a
  settings row;
- **where per-user engines live** — a home directory the host supplies, so a
  desktop app and a server app on the same machine can point at the same
  engine install;
- **the app's own working directory** — for app-local model folders that
  ship with a repository;
- **a log sink** — typed events (probe, synthesize, fallback, error) the host
  routes into whatever observability it has; the package never prints.

Everything else — HTTP, sessions, rate limiting, persistence of a user's
choice — stays outside. The rule: when a package file imports anything from
the host app, the seam has leaked and the package no longer travels. The
package's own tests must run with a fake host object and no network, no
audio device, no model file; if they cannot, the seam is in the wrong place.

## One dispatch door, one validation door, inside the package

Hosts never call an adapter directly. The package exposes a single entry
that binds adapters to the host and routes every request through **one
validation door** before any adapter sees it: a length cap sized so a
one-shot local engine finishes inside its timeout, a voice-identifier
character allowlist that keeps identifiers innocent when they become file
paths or URL segments downstream, a language-tag shape check, a speed clamp.
Adapters may then assume a bounded, sanitized request — which is what lets
an adapter stay thirty lines of engine dialect instead of a second copy of
the validation. The same door is where local engines are serialized — and
the honest framing is that this is a **processor-budget choice, not a
correctness rule**: two CPU syntheses at once each run at half speed, so a
small concurrency bound is right whether the engine is spawned per call or
kept resident. Spawning per call pays the model load (seconds for a
several-hundred-megabyte model) on every utterance; the engines that matter
all offer a resident mode — a long-lived process fed sentences on its
input, or an in-process binding that loads once and renders per sentence
with a callback — and a package that cares about time-to-first-audio
locally moves to one of those, keeping the bound. The door is the only
place that knows which adapters have that physics (declared as a
capability, never inferred from the adapter's name).

## Preference is the host's, resolution is the package's

Which engine serves is two facts with two owners. The **preferred** engine
and the **allowed set** are policy the host wrote down — usually during
onboarding, sometimes in a settings surface — and the host hands them to the
package as data. Everything after that is the package's: the allowed set is
filtered to registered engines, a preference naming a retired engine is
dropped on read rather than thrown (the retired-engine door from engine
abstraction, applied to the preference), and at request time the package
walks *requested → preferred → first allowed and ready*, probing each. The
outcome is a typed resolution that names the engine that will serve **and
the engine it was asked for**, so a fallback is visible at every boundary
that renders it ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)):
the route forwards it in a response header, the surface prints "spoken by X,
fell back from Y". When nothing in the chain is ready the package raises a
typed unavailable error carrying the *last probe's reason*, never an empty
success ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success))
— the host's degraded terminal state is visible text, and it must know it
arrived there.

The allowed set is also how one package serves two deployment shapes
without a code fork. A **local, single-user install** allows everything
registered: the user has a cloud key and two local engines, and the point
is to let them compare. A **team deployment** allows one: the operator chose,
the compare control collapses to a label, and no teammate can route audio
to an engine the operator did not approve.

## The host wrapper: a route is policy, not plumbing

Embedding the package in a web app means one route, and the route's job is
everything the package deliberately refused to own:

- **authentication** — whatever the app's operator gate is, applied as
  defense in depth even when an outer proxy already gates;
- **throttling per caller** — a cloud call spends money and a local call
  spawns a process; an unthrottled synthesis route in an open-mode app is a
  cost amplifier, and the throttle should be pinned by a contract test so
  it cannot be quietly removed;
- **the error mapping** — the package's typed error codes become status
  codes at exactly one place (invalid input, unavailable, timeout, engine
  failure are four different answers), so the browser can branch without
  parsing messages;
- **the served-engine headers** — the resolution's identity and fallback
  travel with the audio, because a clip that arrives without saying who
  spoke it has already lost the verdict;
- **a probe-only read** — a request that reports every engine's absent /
  broken / ready state with its setup or repair hint and spends nothing,
  which is what an onboarding flow verifies against and what a settings
  surface renders.

The browser half is a headless hook against that route shape: status,
speak, stop, and a *blocked* state when the platform refuses un-gestured
playback — with the playback lifecycle rules from the synthesis pipeline
technique (one utterance audible at a time, stop means now) owned by the
hook so every surface inherits them.

## Compare by ear before committing

Quality claims about synthesis engines do not survive contact with a user's
own language and use. A package worth reusing therefore ships the compare
affordance as a first-class surface, not a lab hack: every allowed engine
with its probe state, one sentence in the user's language, spoken by the
engine they pick, with who-served-it and latency printed. Three rules keep it
honest. Engines that are not ready are shown disabled **with their reason
and next step** — the compare surface doubles as the install diagnostic, and
hiding an absent engine hides the fact that it could be installed. And the
surface is gated to the audiences who choose engines: a candidate, a guest,
an end user on a team deployment never sees a provider name.

A third rule makes the comparison worth anything: **like for like**.
Listeners in formal tests identify a lossy-compressed clip against an
uncompressed one by the codec alone, and a louder clip is rated better
regardless of voice — so an engine returning compressed audio is asked for
raw samples and wrapped into the same container the local engines produce,
sample rates are stated next to the clip, leading silence is trimmed, and
where the product goes further it loudness-normalizes and randomizes the
order. A compare that measures the codec or the gain has decided nothing
about the voice.

## Sharing local engines across apps

A local engine is a binary plus a model, often hundreds of megabytes. The
package resolves binaries through a fixed ladder — an explicit override,
then a **per-user shared home** every consuming app agrees on, then the
system path — and looks for models under the same shared home by
convention. The consequence is that the first app to install an engine
installs it for every app on the machine, and a second app's onboarding
probes and finds it ready instead of downloading again. The shared home is
a convention the package documents and the host may override; what it must
not do is default to an app-private folder, which reintroduces the duplicate
download the technique exists to remove.

## When not to package

A single app with a single engine does not need this — the engine
abstraction alone is enough, and a host seam for one host is ceremony. The
package earns its cost when the second app appears, when a local engine is
expensive enough that duplicating its install is a real cost, or when the
choice of engine is a user-facing decision that needs a compare surface.
Until one of those is true, keep the adapters in the app and keep the seam
honest, so extracting the package later is a move, not a rewrite.
