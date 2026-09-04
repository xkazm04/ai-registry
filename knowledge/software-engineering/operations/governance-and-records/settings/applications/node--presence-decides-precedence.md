---
layer: application
type: application
subject: settings
technique: presence-decides-precedence
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# A health probe and the code it reports on read different names

A managed media-cataloguing app in this fleet exposes an enrichment health
endpoint that probes four external sources and reports each as healthy,
degraded, unhealthy or unconfigured. One of the four resolved its credential
from two names; the code it was reporting on resolved from one.

The probe:

```ts
const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
if (!apiKey) return { status: 'unconfigured', ... error: 'TMDB_API_KEY not set' };
```

The fetcher that performs actual enrichment reads `TMDB_API_KEY` and nothing
else, throwing `TMDB API key not configured` when it is absent.

## Three things in the same file already disagreed with that line

This is the technique's per-call-site failure in its purest form: nobody
resolved the two names in one place, so the process holds two answers to "which
name supplies this setting", and every nearby artifact sided against the one
that was executing.

- **The doc comment two lines above** says *Requires TMDB_API_KEY env var*.
- **The probe's own error string** says `TMDB_API_KEY not set`.
- **The four sibling probes in the same file** — two Twitch credentials, two
  Spotify credentials — each read exactly one name. The dual read was the only
  one of five, which is what a line that drifted looks like versus a house
  style.

The operator-visible consequence: set only the public name, and the health
endpoint reports the source configured while every enrichment call throws. The
gate does not read what the gated code reads.

## The paired measurement

**Measurable:** does the probe's verdict agree with the fetcher's actual
capability, across the three environment states? Four tests through the exported
route handler with `fetch` stubbed, so no arm touches the network.

| Case | Arm A (dual read) | Arm B (one name) | Fetcher can work? |
| --- | --- | --- | --- |
| neither name set | unconfigured | unconfigured | no |
| server-only name set | configured | configured | yes |
| **public name only** | **configured** | unconfigured | **no** |
| public name only — outbound `api_key` | **carries the public value** | never sent | — |

**2 of 4 fail before the change, 4 of 4 after.** Full unit suite 285/285 across
13 files. Typecheck adds no new errors — 29 are pre-existing in an unrelated
store module and were confirmed untouched by this change.

## The fourth row is the one that matters

The disagreement is not only cosmetic. Arm A does not merely *report* the public
value as usable; it **spends** it, putting `NEXT_PUBLIC_TMDB_API_KEY` into the
outbound `api_key` query parameter. A variable named for the client bundle was a
working way to supply a secret, and the fallback is what kept it alive.

That connects this seam to
[public-vs-server-env-split](../../../../security/data-and-transport/browser-credential-boundary/techniques/public-vs-server-env-split.md):
the naming convention exists so nothing has to remember which side a value is
on, and a compatibility fallback that accepts the public name for a server-side
secret quietly re-crosses the line the convention drew. A rename fallback is a
security decision whenever the two names sit on opposite sides of that split.

## What this realization does not do

It fixes the resolution at one call site rather than introducing the single
resolver the technique asks for. The project has no configuration module — every
route reads `process.env` inline — so "resolve once" has nowhere to live yet, and
building that module is a larger change than the defect warranted. The deprecation
notice the technique prescribes is also absent: nothing tells an operator still
holding the public variable that it has stopped working. Both are recorded as the
return condition rather than smuggled into a one-line fix.
