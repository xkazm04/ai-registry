---
layer: technique
type: technique
subject: native-shell-integration
technique: non-stealing-overlay
status: forged
laws: [absent-guard-is-loud, verdict-survives-boundary, creation-names-reaper]
shared_with: []
use_when: [a floating indicator over another application yanks focus away from the user's work, a hidden overlay still swallows clicks where it used to be, deciding the teardown order for an always-on-top transparent window, restoring focus to the application the user was in before delivering text into it]
---

# Non-stealing overlay

An overlay is a small, always-on-top, usually transparent surface the product
places over **somebody else's work**: a capture indicator, a live status pill,
a floating control. Its entire value proposition is that it annotates without
interrupting, and it has exactly one way to destroy that value — taking key
focus. When it does, the user's cursor leaves the document they were typing in,
the product's own pipeline loses the target it was about to deliver to, and the
user experiences it as the product grabbing their machine. Everything below is
the discipline that keeps a surface visible and inert.

## Showing is not "show"

The show path has one rule that is invisible in a diff: **it deliberately does
not raise or focus the window**. Most window toolkits offer a convenient
show-and-focus, most examples use it, and the omission looks like an oversight
to the next reader — who adds it back, and the regression is a subjective one
that no test catches. So the omission is written down at the call site: a
comment stating that focus is not taken because taking it would pull the user
out of whatever they are typing in, which is the opposite of what the surface
is for. An unstated invariant is an absent one
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).

The rest of the show path is positioning, and it carries one non-obvious case.
If the hide path parks the surface off any display (below), the host's "which
display is this window on" query has no answer when the surface is next shown.
Resolve the current display, and where that yields nothing, fall back to the
primary — a positioning path that assumes a current display leaves the surface
parked in the void and the feature looks dead.

## Hiding is three acts, and only one of them is a hide

The naive teardown is one call to hide. On at least one host, a transparent,
always-on-top window **survives its own hide as an invisible click target**:
nothing is drawn, and clicking where it used to be activates the product and
steals focus back. The user's complaint is that the application "randomly comes
to the front", which is unattributable to the overlay by anyone debugging it
later. The teardown is therefore layered, and each layer covers the layer above
it failing:

1. **Suppress hit testing** — mark the surface click-through, so any residual
   region passes events to whatever is underneath. This is the layer that
   actually addresses the defect.
2. **Park it off any viewport** — move it to coordinates no display covers, so
   even a surface that ignores both the click-through flag and the hide is
   nowhere a user can reach.
3. **Hide it** — the intended act, now with two backstops beneath it.

The order matters: suppress and park while the surface is still addressable,
then hide. Doing it after the hide asks the host to modify a window it now
considers gone, which is precisely the case whose behaviour is unspecified.

The general rule this instance teaches, and the reason it belongs in a standard
rather than in a bug comment: **a window manager's hide is a request, not an
effect.** The product does not own the compositor, cannot observe the result,
and gets no failure when the request is partially honoured. So a defensive
teardown is judged by *what remains clickable*, not by what remains visible —
and that is a thing a reviewer can check by clicking, which a screenshot cannot.

Where the click-through call itself is unsafe on some host — the common case is
a toolkit whose implementation aborts the process when the window has not yet
been realised — that layer is compiled out for that host rather than guarded,
and the surrounding code says which host and why. The layering degrades
honestly: two of three layers on the host that never had the defect.

## The surface is created once and named by its reaper

An overlay built on demand from two different entry points is built twice, and
the second build silently replaces the first while the first's event listeners
survive. Build it through one idempotent path — return the existing surface if
it exists, construct it otherwise — and let every entry point call that. Its
teardown is the one described above, and the event that triggers the teardown
is named at the point of creation
([creation-names-reaper](../../../_laws.md#creation-names-reaper)); a surface
whose disappearance depends on whichever component happens to notice is a
surface that will one day stay up.

## Giving focus back is an act that can be refused

The overlay never takes focus. The pipeline it serves may nonetheless need to
hand focus **back** to the application the user was in — a target captured
earlier, activated deliberately just before something is delivered into it. Two
rules govern that hand-back, and both come from it being a request to a host
that has its own opinions:

- **It returns a verdict, and the verdict is checked.** The target may have
  quit while the product was working, the grant that permits activation may
  have been revoked since the last poll, and a cooperative-activation request
  may simply be declined. Each of those is reported as a plain negative return
  that a call site written for a void result discards
  ([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).
- **It is checked before the first destructive step.** Ordering is the whole
  protection: a failed activation caught before anything shared is mutated
  costs the user nothing, and the same failure caught afterwards leaves them
  with a clobbered shared channel and no delivery to show for it.

Where the host offers both an older activation call and a newer cooperative one
that asks the current application to yield first, probe once for the newer and
cache the answer for the process's lifetime — the answer cannot change, and the
probe is otherwise repeated inside a latency-sensitive path.

## Decision rules

- Never call show-and-focus; call show, and write down why focus is omitted.
- Teardown order: suppress hit testing, park off-viewport, hide.
- Judge a teardown by clicking where the surface was, not by looking.
- One idempotent construction path; the teardown trigger is named at creation.
- A deliberate focus hand-back is verified before any destructive step.
- Where a defensive layer is unsafe on a host, compile it out and say so.

## When not to use this

- **The surface is meant to be interacted with.** A floating window the user
  types into needs focus, and the technique inverts: the discipline becomes
  restoring the previous focus afterwards, not avoiding focus.
- **The surface lives inside the product's own window.** No other application's
  focus is at stake, and every rule here is cost with no benefit.
- **The host composites overlays for you.** Where a platform provides a
  first-class non-activating notification or indicator surface, use it — the
  teardown problem is the platform's, and it has more information than the
  product does.
