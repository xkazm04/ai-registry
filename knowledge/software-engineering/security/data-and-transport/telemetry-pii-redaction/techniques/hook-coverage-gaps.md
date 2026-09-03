---
layer: technique
type: technique
subject: telemetry-pii-redaction
technique: hook-coverage-gaps
status: forged
laws: [one-validation-door, gate-sees-target]
shared_with: []
use_when: [installing an outbound scrubbing callback, adding a capture site that hands over a caller-supplied payload, initialising a telemetry client in more than one runtime]
---

# Hook coverage gaps

A transport offers one outbound callback. The team installs the redactor in
it, reviews the change, and stops — because a single interception point
looks exactly like the one door the rest of the codebase is disciplined
about
([one-validation-door](../../../../_laws.md#one-validation-door)). It is not
one door. It is one door with named holes in it, and the holes are
structural: they are properties of how the record is assembled and how the
callback is invoked, not lapses anybody committed. This technique is the
enumeration of those holes and the two mechanisms that cover them.

## What the callback does not reach

**Fields the walker steps past by type.** A recursive scrubber written for
objects and arrays walks the contexts block, the extras bag and the tags,
and quietly skips the top-level **message** and the **exception value**,
because they are strings and the walker's entry condition asks for an
object. It also tends to skip the **stack frames**, which are an array of
records with the interesting material — captured local variables, in the
runtimes that provide them — nested inside each element. These are the
first two fields anyone would name if asked what an error record contains,
and they are routinely the two a naive hook misses.

**Channels that never pass through this callback.** Records leave by more
paths than the error one: trace and transaction payloads with their own
callback, metric and measurement attributes, session recordings,
performance samples, and the route or transaction **name**, which is
attached before the callback sees it in some clients and is not part of the
walkable body in others. The callback gates the channel it was installed
on. The gate that does not observe a channel cannot say anything about it
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

For a channel the callback genuinely cannot reach, there is a third option
besides scrubbing it and ignoring it, and it is usually the right one:
**turn the channel off.** A session recording cannot be scrubbed by a field
walker — it is a reconstruction of a screen, and the screen had the user's
data on it. Setting its sample rate to zero in the shared configuration is
a one-line, auditable, permanent answer, and it is a better one than an
allowlist of elements that a future component will silently fall outside
of. The same reasoning applies to performance payloads and any channel
whose value to triage does not exceed the cost of not being able to
guarantee what is in it. A disabled channel is the only channel with no
gaps.

**The callback's own failure.** In most implementations a callback that
throws is treated as consent to send the original record. So the body is
guarded and returns a gutted record on error, per
[redact-at-the-cap](./redact-at-the-cap.md); an unguarded hook is a
boundary that disappears exactly when the payload is unusual, which is the
same population as the payloads worth worrying about.

**Caller-supplied payloads at high-volume sites.** Not a mechanism gap but
a distributional one, and it is the reason the next section exists. The
call sites that capture most often — a shared request wrapper, a
data-fetch error handler, a form submission path — are the ones most likely
to hand over a whole response object, a whole form state, or a whole
caught error with the input attached, because at those sites attaching
everything is the convenient thing to do.

## The wrapper is the primary control; the hook is the floor

The mechanism that actually covers caller-supplied payloads is a **capture
wrapper**: one exported function that scrubs the caller's message and
context itself, then calls the transport. Every call site uses it; nobody
calls the raw capture function. Its value over the hook is that it runs
*before* assembly, so it sees the caller's object as the caller shaped it,
including the fields the hook's walker will never enter.

This is a social control with a structural backstop, and it should be
described that way rather than pretended otherwise. The rule *every new
capture site goes through the wrapper* lives in the contributor
instructions and is enforced by a review question, which means it will be
violated within a quarter by someone who did not read them. The hook stays
installed underneath precisely to catch that violation partially — partial
being the honest word, since the fields the hook cannot reach are exactly
the ones the wrapper existed to cover. Neither mechanism is redundant with
the other; each is the other's incomplete backstop.

## One shared configuration, or one runtime ships unscrubbed

A product initialises its telemetry client once per runtime — the server
entry, the browser entry, a worker, an edge context — and the failure is
always the same: three of them get the hooks and the fourth is a copy
somebody made in a hurry. **All runtimes initialise from one shared base
configuration** that already sets the do-not-send-inferred-personal-data
switch and installs both the error hook and the trace hook, and a
runtime-specific entry supplies only what genuinely differs. Then "is this
runtime scrubbed?" has one answer for the whole product instead of one
answer per file, and adding a runtime cannot silently add an unscrubbed
one.

## Write the gaps where the hook is installed

The list above is not knowledge a future contributor will reconstruct. Put
it as prose at the installation site — a paragraph naming what this hook
does *not* cover and what covers it instead — because that is the one
location guaranteed to be read by the person about to widen the surface.
Two rules keep it alive:

- **A newly discovered gap lands in the code and in that paragraph in the
  same change.** A gap fixed silently is a gap the next transport upgrade
  reopens.
- **A field moved from "covered by the hook" to "covered by the wrapper"
  is a change to the paragraph too.** The paragraph is a claim about
  coverage, and a stale claim about coverage is worse than none, because
  the next reviewer will trust it.

## Prefer a lower interception point where one exists

If the transport exposes a serializer or a transport-level filter — a point
after assembly and before encoding — prefer it to the event callback. Lower
points have fewer gaps by construction: they see the finished payload,
including the fields the event callback was never handed. Where such a
point exists the wrapper stays anyway, for the caller-shaped-object reason,
but the enumerated hole list gets shorter, and a shorter hole list is the
real deliverable of this technique.

## When not to reach for this

None of this applies to a sink whose payload you construct yourself; there
the wrapper *is* the transport and there is no hook to have gaps. And do
not install a second hook to cover the first one's gaps — two callbacks on
one channel is a vocabulary with two authorities, and the second will drift
from the first the same quarter it is added.
