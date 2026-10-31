---
layer: application
type: application
subject: generative-provider-routing
technique: non-silent-elimination
stack: node
status: forged
verified_on: 2026-10-31
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
`ImagingErrorKind | "constraint"` (`lib/imaging/types.ts:114-122`). The twelve
error kinds are a closed union with a comment per member
(`lib/imaging/errors.ts:15-61`), and `constraint` is grafted onto them
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
(`router.ts:343-351`); at any later position the same condition is recorded and
stepped over. The second door is subtler: a provider may *declare* the
capability and still have no method for it, which surfaces as
`if (out === undefined) throw unsupported(id, cap)` inside the try
(`router.ts:401`). That one lands in the catch, so it is pushed onto the trail
first and only then rethrown — `unsupported` is not reroutable
(`errors.ts:131-133`). Same kind, two paths, and only one of them leaves a trail
entry: worth knowing when reading a log line whose `tried=` is empty.

## Three destinations, from one array

The trail is built once in `run()` (`router.ts:276`) and reaches the caller
three ways:

- **On the asset.** When a later vendor serves, the steps settle into
  `provenance.reroutedFrom` (`router.ts:405`, `types.ts:192-195`). Its
  *presence* is the signal — the ordinary single-hop call has no such field —
  and it survives the HTTP boundary: the browser-side type re-declares it with
  the same reading (`lib/imagingClient.ts:38-49`).
- **On the log.** One settle line per request, written from the chokepoint so
  there is nowhere to forget it. The same array renders as `tried=` on a
  failure and `rerouted=` on a success, because "on a success the trail IS the
  re-route: someone was tried and lost" (`lib/imaging/log.ts:118-121`). Kinds
  and provider ids go through unscrubbed as closed unions the repo owns; only
  the message is scrubbed (`log.ts:17-32`).
- **In the error**, when nothing served (`router.ts:488-509`).

## The constraint outranks the vendor error

The final throw does not simply surface the first failure. When a request-level
constraint eliminated anyone, the router recomputes which vendors *would* have
been eligible and leads with the narrowing, appending the first error rather
than headlining it (`router.ts:493-506`): "no API key for google" does not
explain why google was the only candidate for a request carrying references.
The two message shapes differ on whether any eligible vendor existed at all,
and the synthesised error inherits `first`'s kind when there is one and falls
back to `no-key` or `unsupported` by the same test. The `first ??=` idiom
throughout the loop is deliberate: the first thing that went wrong describes
the vendor the plan *meant* to use, which is the honest headline
(`router.ts:333-335`).

## What is proved, and what is not

The live integration harness asserts the caller-facing half directly: a
rate-limited recognize call must be served by the fallback *and* carry
`qwen:rate-limited` in `provenance.reroutedFrom`, failing with "the re-route
left no trail in the response" otherwise
(`pipeline/integration-imaging.mts:597-621`). The log destination is now held
by a check as well: `formatCall` was deliberately split from `logCall` "so it
can be asserted on" (`log.ts:102`), and a probe added 2026-08-24 drives the
real function and pins the naming rule directly — the same trail must print as
`rerouted=` on a success and `tried=` on a failure, with neither spelling
leaking into the other
(`tests/golden-path/imaging-log-line.probe.spec.ts:99-114`).

One gap against the standard survives. The position-0 `unsupported` throw is
the one elimination that never becomes a trail entry at all: it still reaches
the caller, as the thrown error and as a log line whose `kind=` names it, but
the array the other three travel in never records it — which is why that
failure is the one whose `tried=` reads empty.

Re-checked 2026-10-31 at gravitone-gcloud@fd09c06. Three things moved under
the anchors above, none of which reverses the finding. (1) The closed
vocabulary grew from ten kinds to twelve: `protected-material` and
`account-blocked` are terminal stops that end the chain rather than walk it,
and a trail step may now also carry the `stage` the vendor named
(`types.ts:120-121`). (2) Between the credential check and the call the loop
now re-reserves a budget hold after a billed failure has spent the previous
one (`router.ts:374-396`); an `over-budget` refusal there is pushed onto the
trail before it is thrown, so it is a fifth way out that also leaves a
record, and the "four ways" in the file header (`router.ts:17-24`) undercounts
it. (3) The browser-side re-declaration of `reroutedFrom` in
`lib/imagingClient.ts` is gone: that module's `/api/imaging/*` fetches were
deleted with the v1 pages (its header, `imagingClient.ts:6-14`), so the
"survives the HTTP boundary" claim now rests on the turn kinds that copy
`provenance.reroutedFrom` into their results (for example
`lib/turns/kinds/frames.ts:61`) rather than on a client type. The
position-0 `unsupported` gap is unchanged (`router.ts:347`).
