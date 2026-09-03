---
layer: technique
type: technique
subject: deployment-contract
technique: platform-build-parity
status: forged
stage: solo
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a hosted build fails while the delivery system is green, a hosted build resolves dependencies differently than local, pinning a runtime version for a deploy target, the platform builds with a command nobody reviewed, one artifact is served by two hosts and links work on only one]
---

# Platform build parity

When the hosting platform builds the code itself, the repository has two build systems. This
technique makes them one build system with two executors, by forcing every input that could
differ to come from a single declared authority.

## The inputs that diverge

Enumerate them explicitly; each one has produced the "green pipeline, failed deploy" incident
somewhere:

- **The build command.** The platform has a default for the detected framework; the pipeline
  runs whatever its workflow says. The moment either is customized, they can differ.
- **The runtime version.** A platform defaults to *its* current version, which moves under you
  on the platform's schedule, not yours. The pipeline pins its own. A version pinned in two
  places is two authorities; a version pinned in one place the platform does not read is one
  authority with a deaf consumer.
- **The install.** Lock-derived clean install versus resolving install; peer-dependency
  strictness flags; whether optional native dependencies for the *builder's* platform exist in
  the lockfile at all. A lockfile maintained from one operating system and consumed by a
  builder on another is a known source of installs that fail only remotely.
- **Environment at build time.** Variables present in one builder and absent in the other
  change what gets compiled in, what gets prerendered, and what fails. A build that must
  degrade gracefully when a variable is absent should be *proven* to, by a builder that omits
  it deliberately.
- **What triggers the build.** The pipeline builds on push and pull request; the platform
  builds on its own integration's events. Two triggers on one commit are two builds — see the
  coupling technique for the race this creates.

## Parity does not end at the artifact

Every input above is a **build-time** input, and that enumeration is incomplete in a way
that hides from every check built on it. Give two hosts the *byte-identical* artifact and
they can still serve two different sites, because serving is a resolution step of its own:
each host decides, by its own rules, what a request path means.

The rules that differ, and each has produced the same incident:

- **Extensionless paths.** One host maps a request with no file extension onto the
  matching file with one; the other returns not-found. A generator that emits real files
  with extensions, linked internally without them, works on the first host and is broken
  on the second — for links nobody hand-wrote.
- **Directory requests.** Whether a path naming a directory serves that directory's index
  document, redirects, or fails.
- **Trailing slashes.** Whether the two forms of the same path are the same resource, one
  redirects to the other, or only one exists — which also decides whether relative links
  inside the served document resolve one level too high.
- **Not-found behaviour.** A not-found that serves an application shell with a success
  status hides broken links entirely; a not-found that serves an error page reveals them.
  Two hosts disagreeing here means one of them is lying about the other's bugs.
- **Case sensitivity and normalization** of the path, which differ with the host's
  filesystem and are invisible to anyone developing on the permissive one.

The reason this input is worth naming separately is what it does to the parity check
itself: **the artifact really is identical**, so an artifact comparison passes, a checksum
matches, and a build-parity check reports agreement while the two sites disagree. Per
[gate-sees-target](../../../../_laws.md#gate-sees-target), a check comparing the bytes has
not observed the thing users experience, which is the bytes *plus* the resolution rules of
the host that served them.

So the rule: **where one artifact is served by two hosts, the difference between their
resolution rules is part of the contract, and it is tested rather than assumed.** The
authority-per-input discipline below applies unchanged — the second host's configuration
is written to reproduce the first's behaviour, with the *reason* recorded at the
configuration site, because a rule whose only justification is "the other host does this"
is otherwise deleted by the next reader as redundant.

Testing it is cheap and the shape matters: the assertion must request the path shape that
**fails** — the extensionless link, the directory without its trailing slash — and require
a success status. An assertion that fetches the landing page proves the server started;
it proves nothing about resolution, because the landing page resolves under every rule
either host implements. One request per divergent rule, run against the actual serving
configuration, is the whole check.

Where only one host ever serves the artifact, none of this applies and writing resolution
rules to match an imaginary peer is waste.

## One authority per input

Per [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary), each
input gets exactly one home the repository owns, and every consumer — the pipeline, the
platform, the developer's machine — reads it there or receives it from there mechanically:

- The build command lives in the project's task definitions; the platform's configuration file
  in the repository points at that task rather than restating it.
- The runtime version lives in one pin file or manifest field. The pipeline reads that file.
  If the platform can read it, it does; if the platform only offers a dashboard setting, the
  setting is set once to match and recorded in the deployment manifest as a mirror (see
  [deployment-config-as-code](./deployment-config-as-code.md)) — a mirror with a named source
  is maintained state; an unrecorded copy is drift waiting.
- Install flags live in the package manager's own committed configuration file, which both
  builders honor, never in one builder's settings.

The test for having done this right: a reader can answer "what version of the runtime builds
production?" from the repository alone, with one file open.

## The gate must see the platform's build

Per [gate-sees-target](../../../../_laws.md#gate-sees-target), a verification pipeline that
never runs the production build command has not verified the thing that ships. The pipeline's
build step must be the same task the platform runs — including the parts that look like
deployment concerns, such as a database migration folded into the platform's build command.
If the platform builds `migrate && build`, a pipeline that only runs `build` is green on a
command production never runs. Either the pipeline runs the full platform command against a
disposable target, or the migration moves out of the build into a deploy step, but the two
commands must not silently differ.

Where true parity is impossible — the platform injects proprietary build steps around your
command — the honest posture is to verify everything up to the platform's boundary locally and
treat the platform's additions as a monitored dependency: known, named, and watched, not
assumed equivalent.

## The prebuilt escape

Most platforms accept a locally-produced build artifact instead of building themselves. This
collapses the two build systems back into one: the pipeline (or the developer's machine)
builds, and the platform only hosts. It is the strongest parity available and the right
default when the platform's builder keeps surprising you. Its cost is that the uploading
environment now needs a deploy credential — which is where
[secret-materialization-discipline@ci-execution-trust](../../ci-execution-trust/techniques/secret-materialization-discipline.md)
takes over — and that build-environment cleanliness becomes your responsibility again.

## Decision rules

- Enumerate the divergable inputs — command, runtime, install, environment, trigger — and give
  each exactly one declared home in the repository.
- The platform reads declarations where it can; where it cannot, mirror once and record the
  mirror with its source in the deployment manifest.
- The pipeline's build step runs the platform's actual build command, migrations and all — or
  the difference is deliberate, written down, and reviewed.
- A lockfile maintained on one operating system gets its cross-platform entries verified by
  the remote builder, and remote-only install failures are fixed in the lockfile, not by
  loosening install strictness.
- Two hosts serving one artifact get their request-resolution rules compared explicitly —
  extensionless paths, directory requests, trailing slashes, not-found, case — and the
  second host's configuration states which behaviour it is reproducing and why.
- The parity assertion requests the shape that would fail on a mis-configured host and
  requires success; a landing-page fetch is a liveness check, not a parity check.
- When the platform's builder diverges twice for the same cause, switch to prebuilt deploys
  and let the platform host only.
