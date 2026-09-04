---
layer: technique
type: technique
subject: admission-queue
technique: refusal-without-release
status: forged
laws: [failure-not-empty-success, verdict-survives-boundary, creation-names-reaper]
shared_with: []
use_when: [a capacity refusal is correlated across the whole caller population, operators drain or cordon a node that holds long-lived callers, a rollout percentage or feature valve rejects arrivals fleet-wide, refusing an arrival costs more than holding it]
---

# Refusal without release

[depth-bounds-and-shed](./depth-bounds-and-shed.md) establishes that a refusal
must be loud, reasoned, and accompanied by a backpressure signal so producers
pace themselves instead of retry-hammering. That is the right design when
refusals are **independent** — each caller learns something about its own
request, backs off on its own schedule, and the population de-synchronizes
naturally.

A whole class of refusal is not independent, and for it the same design is an
attack on your own system.

> **When the reason for refusing is a property of the *server*, every caller
> is refused at the same instant** — and a refusal that releases the caller is
> a synchronizing event that hands you the entire population back at once.

Setting a rollout valve to zero. Cordoning a node before a deploy. A capacity
ceiling reached during a traffic shift. A dependency going unavailable. In each
one the refusals are perfectly correlated, and jitter on the *caller's* retry
does not fix it, because the callers were synchronized by your action, not by
their own timing. Worse, the reconnect arrives at a system that is already at
capacity or deliberately draining — the refusal has recruited the load it was
protecting against.

The cost is asymmetric in a way that decides the design. Releasing a caller
that must come back costs a full re-establishment: a new connection, a new
handshake, authentication, session setup, state hydration. Holding it costs a
socket and some memory. When the refusal is transient by construction — a
valve you intend to reopen, a drain that will finish — you are paying the
expensive one to avoid the cheap one.

## Split the failures by whether coming back will help

The technique is a classification, and the classification is the whole of it.
Every admission failure is sorted into two classes, once, in one place:

- **Terminal — release the caller.** Nothing about waiting changes the answer.
  Bad credentials. A malformed or impossible request. A per-principal limit the
  caller is already over. An identity that is not permitted here at all.
  Releasing is correct and *kind*: the caller must do something different, and
  holding it hides that.
- **Transient — hold the caller.** The answer is expected to change without
  the caller doing anything differently. At capacity. Draining. Not yet
  eligible under a rollout. A timeout or 5xx from a dependency the gate needs.
  Retries exhausted against an internal service.

Then the transient class is **not refused at all in the sense that releases**.
The request is parked, the caller is held, and admission is retried on the
server's own schedule.

Two disciplines make the classification trustworthy:

- **It is exhaustive and it is one function.** Every failure the admission path
  can produce appears in the sort, including the ones that arrive as an
  unexpected error from a dependency. The default arm matters more than the
  named ones: an unclassified failure defaulting to *hold* leaks connections
  the system cannot account for, and defaulting to *release* reintroduces the
  stampede for every failure nobody enumerated yet. Choose it deliberately,
  and say which.
- **The class travels with the verdict**
  ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
  Terminal and transient are different outcomes to every consumer downstream —
  metrics, logs, the client's own state machine. A classification that exists
  only as a branch in the admission function, and reaches the socket as one
  undifferentiated close, has died where it mattered.

## A held caller is state, and state names its reaper

Holding is not free and it is not passive. Parked callers occupy the resource
the gate was rationing, so the hold is bounded like anything else
([creation-names-reaper](../../../../_laws.md#creation-names-reaper) — every
parked request enumerates how it leaves):

- **Admitted**, when the retry succeeds.
- **Released as terminal**, when a retry produces a terminal failure — a
  transient condition can resolve into a permanent one, and the classification
  is re-run on every attempt rather than decided once at parking time.
- **Timed out**, when the hold exceeds its own bound. The hold has a ceiling,
  and past it the caller is released with a reason. Otherwise "hold" is
  "forever" and this technique has re-created the unbounded queue one layer up,
  wearing a different noun.
- **Dropped**, when the caller disconnects on its own — which is the honest
  signal that the hold outlived the caller's patience, and is worth counting
  separately, because it is the number that tells you the ceiling is wrong.

The parked set is itself bounded, and *that* bound is where this subject's
ordinary machinery returns: it is a queue, with a depth, and refusing to park
is a real refusal that does release the caller.

## Retry on the server's clock, and let the resolution push

The server retries on a schedule the server chooses — an interval with jitter,
so parked callers do not resynchronize against the gate itself. Jitter here
works where jitter on the client did not, because these callers are already
held: spreading their retries spreads load without spreading a reconnect storm.

The strong form is not to retry on a timer at all. When the transient
condition is something an operator or a control plane *changes* — a rollout
percentage, a drain flag, a capacity setting — the change can be published, and
parked callers admitted the moment it arrives. Recovery then tracks the fix
rather than the polling interval, and the system drains its own backlog with no
client involvement and no thundering herd, because the server controls the
order in which it admits them.

That is also the property to test, and it is testable without load:

1. Park N callers by setting the valve closed.
2. Open the valve.
3. Assert all N reach the admitted state, and that **zero** close or
   disconnect frames were observed across the whole episode.

The second half of that assertion is the technique. A test that only checks
recovery passes just as well against a design that dropped every caller and
got them back.

## The signal you lose, and how to keep it

Holding rather than refusing removes the refusal count, which is this subject's
primary overload instrument and
[wait-telemetry](./wait-telemetry.md)'s ground. A gate that holds instead of
refusing looks, on a dashboard built for refusals, exactly like a gate under no
pressure at all.

So the held population is measured as what it is: a gauge of currently parked
callers, a distribution of hold durations, and a counter of parks by reason
class. Those replace the refusal rate as the saturation signal, and the reason
class is what makes them actionable — "400 held, all `draining`" is a deploy in
progress, and "400 held, all `at_capacity`" is an incident
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
the hold is a designed outcome and it reports itself as one, rather than
appearing as an absence of traffic).

## When to release anyway

Hold only what you can afford to hold. Where callers are cheap to
re-establish — a stateless request, a short-lived connection, a client with
good backoff and a population large enough to smear itself — the correlation
argument is weaker than the memory argument, and an ordinary reasoned refusal
with a retry-after hint is right. The technique earns its cost where
re-establishment is expensive, the caller population is long-lived, and the
refusal is one you are choosing to cause.
