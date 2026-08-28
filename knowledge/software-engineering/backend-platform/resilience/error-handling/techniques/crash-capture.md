---
layer: technique
type: technique
subject: error-handling
technique: crash-capture
status: forged
laws: [creation-names-reaper, gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [naming the last-resort handler for each execution context, deciding which fields may survive into a crash report, the same startup crash ships every few seconds, error reporting is a framework hook and handlers catch their own failures, a streaming or long-lived response reports failure in-band, error rates look low on the best-maintained code paths]
---

# Crash capture

Every technique upstream of this one assumes the failure was caught by code
that expected it. Crash capture is the tier for the failures nothing
expected — the unhandled exception, the unhandled rejection, the panic, the
process that dies mid-write. Its posture differs from ordinary doors: it
cannot rely on the program being healthy, it captures the richest context
of any door, and it is the single most likely place to leak secrets.

## The auto-capture tier sees escapes, not failures

Most platforms offer a single hook that reports "every server error" —
a request-error callback, an unhandled-rejection handler, a framework's
error middleware. It is the cheapest observability a product ever buys, and
it is routinely mistaken for what it is not.

Such a hook observes **failures that escaped the handler**. It cannot see a
failure that was caught, because catching is precisely what stops the escape.
So the moment a handler grows a `try`/`catch` that returns a tidy error
response, that code path leaves telemetry — not because anyone decided it
should, but because the hook's subject was never "failures", it was "escapes"
([gate-sees-target](../../../../_laws.md#gate-sees-target): the instrument
observes a proxy, and the proxy diverges from the target exactly where the
code got more careful).

The result is an **inverted incentive gradient**, and it is worth stating
plainly because it runs against every instinct a reviewer has:

- The handler with no error handling at all is fully reported.
- The handler that catches, maps the failure to a status, and answers the
  caller cleanly is **invisible**.

Writing more defensive code makes the system darker. Nobody chooses this; it
is emergent, it compounds silently as a codebase matures, and it is most
severe in exactly the handlers that were given the most care. A measurement
that says "our error rate is low" under this arrangement is reporting how
much of the code lacks error handling.

The tell is a ratio nobody usually computes: **what share of handlers catch,
and what share of caught failures reach an operator door.** A codebase where
most handlers catch and the only reporting is an escape hook has no
production error visibility on its most-maintained paths, however healthy the
dashboard looks.

Two structural fixes, in order of preference:

- **Give the handled path its own door, at a chokepoint.** Where a shared
  helper already builds the error response, that helper is the natural
  reporting site: pass it the caught cause, and reporting becomes a property
  of answering rather than a discipline each handler must remember. This
  converts the swallow into a routed failure without asking anyone to stop
  catching — and unlike a per-site rule, it engages on its own
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
- **Report by intent, not by exit path.** Route the failures nobody intended —
  the server-fault tier, plus anything a caller explicitly marks as
  unexpected — and deliberately do NOT route the ones the taxonomy already
  calls correct handling. A rate limit, a validation rejection and a
  not-found are the system working; reporting them is the flood that trains
  operators to ignore the tool, which costs more visibility than the original
  gap did.

Two properties keep the door cheap enough that nobody routes around it: it must
not delay the response the user is waiting on (schedule the send after the
response, where the platform offers it), and every failure inside it is
swallowed — telemetry that can turn an error response into a crash will be
removed by the first person it wakes at night.

The streaming case deserves its own note, because it is both the most
expensive and the most commonly missed. Once a response has committed its
status and headers, there is no status left to change and typically no escape
either: the failure is delivered as an in-band frame and the handler returns
normally. To an escape hook that is a **successful request**. Long-lived
responses — streams, server-sent events, chunked progress — are therefore
dark by default at the exact moment their cost is highest, and they need the
handled-path door wired explicitly rather than inherited.

## Cover every execution context, at the true edge

Unhandled failures escape per execution context, and each context has its
own escape hatch: the synchronous exception channel, the asynchronous
rejection channel, background workers, native layers with their own panic
path, and separate processes each with all of the above. The audit is an
enumeration: list every context the product runs code in, and name the
last-resort handler for each. A context without one does not "crash
loudly" — on most platforms it dies or limps *silently*, which makes the
missing handler a swallowed catch at the largest possible scope.

Rules for the handlers themselves:

- **Registered first, before any code that can fail.** A crash during
  startup, before the handler exists, is the least diagnosable crash and
  startup is where crashes cluster.
- **Minimal and self-contained.** The handler runs inside a dying program;
  it must not depend on the frameworks, state, or services whose corruption
  may be the cause. Capture, sanitize, persist — nothing clever.
- **Never crash in the handler.** Every step wrapped, every fallback
  terminal. A throwing crash handler recurses or takes down the platform's
  own reporting.

## Capture the trail, not just the point

The failure's own detail (type, message, stack) says where the program
died; diagnosing *why* usually requires what happened during the preceding
seconds. That is the **breadcrumb trail**: a small, bounded ring buffer of
recent significant events — navigations, commands issued, requests
completed and failed, state transitions — appended cheaply during normal
operation and read only at capture time. Design points:

- **Bounded and cheap by construction.** Fixed capacity, constant-size
  entries, no allocation spikes; the trail records the flight, it must
  never influence it.
- **Ordinary error doors append breadcrumbs too.** Handled failures often
  precede unhandled ones; the crash report that shows three handled
  timeouts before the fatal error has effectively diagnosed itself.
- Alongside the trail: coarse environment (version, platform, uptime) and
  the crash's own identity fields — everything keyed for aggregation, so a
  hundred instances of one defect arrive as one group with a count, not a
  hundred mysteries.

## Sanitize before anything persists

A crash report serializes state indiscriminately — argument values,
recent inputs, buffers — which makes it the most likely artifact in the
entire product to embed a secret, a credential, or personal data. The
discipline:

- **Sanitize at capture time, before the first write.** Once a raw report
  touches disk, deleting it everywhere is no longer in your control —
  files get shipped, backed up, attached to tickets.
- **Allowlist, not denylist.** Enumerate the fields the report carries;
  do not enumerate the secrets to strip. Denylists fail open on the secret
  shape nobody predicted; allowlists fail closed at the cost of an
  occasional missing field.
- **Breadcrumbs carry references, not payloads.** "Request to service X
  failed" — never the request body, never the response, never user
  content. The trail names events; the events' contents stay out.

## Persist first, ship later

The crash may take the network stack, the reporting library, or the whole
process down with it — so the capture path's terminal act is a **local
write**, small and atomic, to a spool location. Shipping happens on the
*next* healthy start: read the spool, send, and delete on confirmed
receipt. Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper),
the spool names its reaper at creation: shipped reports are deleted by the
shipper; unshippable reports (endpoint gone, user opted out) are reaped by
an age/count cap, so the spool cannot grow without bound on a machine that
never reconnects.

Two guards on the restart path:

- **Crash-loop detection.** A crash during startup means the next start
  likely crashes too. Count rapid successive crashes; past a threshold,
  stop doing the normal thing — enter a degraded or safe mode, and make
  the loop itself a first-class report. Shipping the same startup crash
  every four seconds is a denial-of-service against your own telemetry.
- **The spool is read defensively.** A truncated report from a mid-write
  death must not crash the shipper — the parser that reads the spool
  treats corruption as expected input, reporting it as its own (small)
  finding rather than dying on it.

## Crash capture is also a product moment

The session after a crash is a user-facing state, not only a telemetry
one: work the user had in flight should be restored or explicitly
acknowledged as lost, and a product that just vanished mid-task owes the
user one honest sentence on return. Silence after a crash reads as "it
lost my work and won't admit it" — the trust cost of the crash is mostly
paid *here*, not at the moment of death.
