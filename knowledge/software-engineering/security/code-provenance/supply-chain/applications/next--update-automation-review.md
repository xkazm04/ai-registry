---
layer: application
type: application
subject: supply-chain
technique: update-automation-review
stack: next
verified_on: 2026-08-26
verified_against: next@16.3.3
---

# Update automation review — a seven-project web fleet on one framework

How a fleet of applications sharing one server-rendering framework applies (and
where it undershot) the
[update-automation-review](../techniques/update-automation-review.md) technique,
and specifically its "When the dependency is the framework" section. Resolved
on 2026-08-26 against the six checkouts in the fleet that carry Next.js.

## What the manifests said, and what the lockfiles said

The manifests disagreed with each other and, in three cases, with themselves:

| project | manifest range | lockfile resolved |
| --- | --- | --- |
| ascent | `^16.3.0` | 16.3.0 |
| kp | `16.3.0` | 16.3.0 |
| personas-web | `^16.3.0` | 16.3.0 |
| pof | `16.2.10` | 16.2.10 |
| systedo-case | `16.3.0` | 16.3.0 |
| gravitone | `16.3.0` | 16.3.0 |

Three projects carry a caret range and three an exact pin, which is the
technique's **version-range drift** failure in its mildest form: the caret
projects were one `npm install` away from resolving differently from their
siblings, and only the committed lockfile made the fleet's actual state
knowable. The lockfile was the only truth here exactly as the technique says —
reading the manifests alone would have reported the fleet as "on 16.3.x" and
missed that every member was inside a critical advisory range.

## The finding: two critical advisories, all six members inside both

Next.js 16.3.3 shipped 2026-08-25 with two critical unauthenticated-RCE fixes:

- **CVE-2026-75604** (CVSS 9.0) — path traversal to RCE, affected
  `>=13.4 <15.5.24` and `>=16.0 <16.3.3`. Preconditions: the application is
  hosted on a **Windows filesystem**, uses the Pages and/or App router, and does
  not use the Cache Component. The advisory states there is **no workaround**.
- **GHSA-2xp9-vwfh-vxw4** (CVSS v4 9.5) — RCE via `libheif` (reached through
  `sharp`) when the built-in image optimizer processes a crafted **AVIF** file.
  Affected `>=10.0.0 <15.5.24` and `<16.3.3`.

Every member's resolved version sat inside both ranges, and all six carry
`sharp` in the lockfile. Exposure is not uniform, and the difference matters:
the fleet's deployment targets are Linux (containers and a hosted platform), so
the Windows-filesystem precondition binds on **development servers**, not on
production; the AVIF advisory carries no OS precondition and binds wherever the
optimizer is reachable.

## The structural fact: the fix is a subtraction, and it lands on one member

This is the part the tree proves and the changelog does not. The AVIF advisory's
own mitigation is *"optimization of AVIF files is disabled"* — the patched
release does not repair `libheif`, it stops calling it. Across the fleet exactly
one project had asked for that capability:

- **personas-web** declares `formats: ["image/avif", "image/webp"]` in its
  Next config. Framework default is WebP only; AVIF is opt-in, and this project
  opted in.
- The other five leave `formats` unset and are therefore unaffected by the
  subtraction.

So the same patch is, for five members, a pure security win, and for the sixth,
a security win **plus a silent capability loss**: the config row is still
present, still valid, still parsed, and no longer honored. AVIF encodes smaller
than WebP at equal quality, so for personas-web the release labelled *security*
is also a **payload-size regression** — the release's label describing the
maintainer's motivation and not the delta on this system, which is the
correction the technique's last paragraph makes.

Nothing in the fleet would have caught it. No suite asserts "images are served
as AVIF" — there is no call site to assert against, because the request is a
config key and the delivery is the framework's. This is the technique's
declarative-capability blind spot occurring in the wild, and it is why the
inventory habit exists.

## What was done

All six upgraded to 16.3.3 in one pass and committed per project with a
pathspec over the manifest and lockfile only. Five were patch bumps
(16.3.0 → 16.3.3); pof was a minor bump (16.2.10 → 16.3.3) and is the one that
warranted the technique's heavier tier.

## The baseline that was not taken, and what it cost

Five members took a patch bump; one took a minor (16.2.10 -> 16.3.3) and was the
only one worth verifying. Its typecheck passed and its production build failed,
in the file-tracing phase, with a Windows resource exhaustion (`os error 1450`)
while reading a header inside a game-engine installation under `Program Files`.

The instinct - the minor bump broke the build - was wrong, and the only thing
that could settle it was the baseline nobody had taken. Reinstalling the outgoing
version and rebuilding showed **the build was already failing before the upgrade**,
in an earlier phase and for an unrelated reason: a client component reaching a
Node-only module, which the bundler rejects at chunking time. So the two versions
fail at different stages:

| version | phase reached | failure |
| --- | --- | --- |
| 16.2.10 (outgoing) | chunking | a client bundle importing a Node-only module |
| 16.3.3 (incoming) | file tracing | tracer walks an external engine install, handle exhaustion |

The upgrade did not cause the second failure; it stopped the *first* one from
blocking, and the build advanced into a phase this codebase had not reached in a
long time, where a second latent defect was waiting. That defect is independent of
any framework version: an API route computes a well-known install location with a
constant `path.join(...)` of string literals, and the tracer resolves constant path
expressions and pulls the resolved tree into the build graph. The tree happens to
be a game engine - hundreds of thousands of files - so the trace exhausts handles
rather than merely being slow.

Both defects predate this run and neither is a framework problem. What the run
demonstrates is the diagnostic cost of the missing baseline: without it, the
security upgrade was the obvious suspect, and it was innocent.

## What this realization cannot do

- **It does not measure the regression it names.** The AVIF claim is a size
  argument from the format, not a before/after byte count on this project's own
  images. The technique asks for a measured delta; this application asserts a
  direction, not a magnitude.
- **It has no standing inventory.** The declarative-capability list was
  reconstructed by grepping six config files during one incident. Nothing keeps
  it, so the next framework bump re-derives it — the habit is documented here
  and not yet instrumented.
- **One member still has no green build, on either version.** The upgrade was
  shipped anyway, and that was the right call - two unauthenticated RCEs outrank a
  build that was already red - but it means the fleet cannot currently distinguish
  a regression from the status quo in that project. The baseline is owed, not taken.
- **The exposure window went unmeasured.** The gap between the 2026-08-25
  publication and the 2026-08-26 upgrade is known only because this run
  happened to look; no lane was watching, and a fleet that learns of a critical
  advisory because someone asked an unrelated question has not measured its
  window, it has sampled it once by luck.
