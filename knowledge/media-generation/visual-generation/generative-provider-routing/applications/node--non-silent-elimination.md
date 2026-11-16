---
layer: application
type: application
subject: generative-provider-routing
technique: non-silent-elimination
stack: node
status: forged
verified_on: 2026-11-16
verified_against: node@24
---

# Node — the elimination trail in a server-side imaging router

`gravitone-gcloud` runs every image call through one Node/Next.js chokepoint,
`lib/imaging/router.ts`. Its sibling application follows the *hop* — how a
refusal walks to the next vendor. This one follows the *record*: the file
states "no elimination is silent" as its governing invariant (`router.ts:17-24`)
and then spends the rest of the walk holding it, so the four ways a candidate
can drop out all arrive at the caller in a shape someone can act on months
later.

## Four reasons, one closed vocabulary

The trail is `RerouteStep[]` — `{ provider, why }` — and `why` is typed
`ImagingErrorKind | "constraint"` (`lib/imaging/types.ts:114-120`). The ten
error kinds are a closed union with a comment per member
(`lib/imaging/errors.ts:15-50`), and `constraint` is grafted onto them
precisely because it is *not* an error: nothing was called, the request itself
ruled the vendor out. Keeping the vocabulary closed is what makes the trail
countable — `google:no-key,leonardo:no-key` aggregates, a free-text reason does
not — and the human-language specifics stay in the message instead.

## The order of the guards is the design

The loop tests each candidate in a fixed order — capability, then request
constraint, then credential, then the call itself (`router.ts:339-485`) — and
each rung is cheaper and more structural than the next. The credential check
in particular runs *before* the call rather than letting the adapter's own
`keyFor()` raise `no-key`, and the comment says why: calling would "reach the
same place by a longer road… while spending a provider construction to get
there", and "recording is what makes the skip non-silent" (`router.ts:361-372`).
An unconfigured primary is the reason the caller is billed for a fallback, and
it is the headline they get when the fallback is unkeyed too.

## `unsupported` is positional, and has two doors

A plan entry that cannot do the job is a bug in the table, not a runtime
condition, so at position 0 it throws outright and never enters the trail
(`router.ts:343-352`); at any later position the same condition is recorded and
stepped over. The second door is subtler: a provider may *declare* the
capability and still have no method for it, which surfaces as
`if (out === undefined) throw unsupported(id, cap)` inside the try
(`router.ts:401`). That one lands in the catch, so it is pushed onto the trail
first and only then rethrown — `unsupported` is not reroutable
(`errors.ts:111-113`). Same kind, two paths, and only one of them leaves a trail
entry: worth knowing when reading a log line whose `tried=` is empty.

## Three destinations, from one array

The trail is built once in `run()` (`router.ts:276`) and reaches the caller
three ways:

- **On the asset.** When a later vendor serves, the steps settle into
  `provenance.reroutedFrom` (`router.ts:405`, `types.ts:190-193`). Its
  *presence* is the signal — the ordinary single-hop call has no such field —
  and it crosses the HTTP boundary in the response body. The browser-side
  re-declaration this document cited on 2026-08-27 (`lib/imagingClient.ts:38-49`)
  is gone: that file is now 101 lines and declares no provenance type. Where
  the browser reads the field now was not traced in this pass.
- **On the log.** One settle line per request, written from the chokepoint so
  there is nowhere to forget it. The same array renders as `tried=` on a
  failure and `rerouted=` on a success, because "on a success the trail IS the
  re-route: someone was tried and lost" (`lib/imaging/log.ts:117-121`). Kinds
  and provider ids go through unscrubbed as closed unions the repo owns; only
  the message is scrubbed (`log.ts:19-32`).
- **In the error**, when nothing served (`router.ts:487-509`).

## The constraint outranks the vendor error

The final throw does not simply surface the first failure. When a request-level
constraint eliminated anyone, the router recomputes which vendors *would* have
been eligible and leads with the narrowing, appending the first error rather
than headlining it (`router.ts:493-507`): "no API key for google" does not
explain why google was the only candidate for a request carrying references.
The two message shapes differ on whether any eligible vendor existed at all,
and the synthesised error inherits `first`'s kind when there is one and falls
back to `no-key` or `unsupported` by the same test. The `first ??=` idiom
throughout the loop is deliberate: the first thing that went wrong describes
the vendor the plan *meant* to use, which is the honest headline
(`router.ts:332-335`).

## What is proved, and what is not

The integration harness asserts the caller-facing half directly: a
rate-limited recognize call must be served by the fallback *and* carry
`qwen:rate-limited` in `provenance.reroutedFrom`, failing with "the re-route
left no trail in the response" otherwise
(`pipeline/integration-imaging.mts:596-620`). The log destination is now held
by a check as well: `formatCall` was deliberately split from `logCall` "so it
can be asserted on" (`log.ts:102`), and a probe added 2026-08-24 drives the
real function and pins the naming rule directly — the same trail must print as
`rerouted=` on a success and `tried=` on a failure, with neither spelling
leaking into the other
(`tests/golden-path/imaging-log-line.probe.spec.ts:99-111`).

One gap against the standard survives. The position-0 `unsupported` throw is
the one elimination that never becomes a trail entry at all: it still reaches
the caller, as the thrown error and as a log line whose `kind=` names it, but
the array the other three travel in never records it — which is why that
failure is the one whose `tried=` reads empty.

## Re-read 2026-11-16 at `fc26e172`

Every anchor above was re-resolved at `fc26e172` (2026-11-16). The router grew from
424 to 541 lines, so every router citation moved. The guard order, the closed
ten-kind vocabulary (`errors.ts:15-50`) and the constraint-first final message
are unchanged.

**The one caller-facing assertion now tests a chain that no longer exists.** The
live probe `recognize.re-routes-past-a-rate-limited-vendor` still sets "dev
recognize is qwen, then google" (`pipeline/integration-imaging.mts:598`), and it
fails unless qwen is called three times and the trail carries
`qwen:rate-limited` (`:612-619`). Qwen cloud left the dev recognize row on
2026-09-01 (`cb35418c`), and the row is now local first, then google
(`router.ts:98-106`). No qwen call can happen on that path, so the probe
cannot pass as written. The probe sits in the script's free offline half,
which fakes the wire (`:273-285`), but no `package.json` script runs this file,
so nothing in the verify chain would notice. It was read, not run. Until it is re-pointed at a chain the plan holds,
the asset-side destination (`reroutedFrom` on a served result) has no
end-to-end check. The log destination is still pinned by the probe above.

**A fourth destination field travels with the trail.** Since `35ed3fb7`
(2026-10-25) a Google batch that comes back short records
`provenance.shortBatch` instead of discarding what arrived (`types.ts:194-197`).
That is an elimination record for outputs, not vendors, and its presence is the
signal in the same way as `reroutedFrom`. See the sibling
`node--refusal-reroute-hop` application.

