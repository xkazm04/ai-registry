---
layer: technique
type: technique
subject: credential-vault
technique: health-probing
status: forged
laws: [failure-not-empty-success, derivation-names-recomputation, one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [deciding whether could-not-reach counts as broken, a revoked credential still shows green, probing trips provider rate limits, deciding which provider status codes are verdicts about the credential, an offline probe overwrote the last real verdict]
---

# Health probing

A vault holds credentials so that unattended work can use them later. Health
probing answers the only question that matters about "later": **will this
credential work when the automation needs it** — answered *before* it is
needed, while a human is around to fix what isn't. The entire technique is an
exercise in epistemic honesty about systems you do not control, reached over
networks that fail, on machines that sleep.

## Three states, not two

Every probe concludes in exactly one of three outcomes:

| Outcome | Meaning | Evidence |
| --- | --- | --- |
| **healthy** | the provider accepted the credential | a positive authenticated response, now |
| **broken** | the provider rejected the credential | a definitive authentication/authorization rejection, now |
| **unknown** | the probe could not reach a verdict | offline, timeout, provider outage, rate-limited, probe misconfigured |

The third state is the load-bearing one
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
**"could not verify" is not "broken."** Collapse unknown into broken and an
offline laptop paints the entire credential population red — teaching the
operator that red is noise, which is the one lesson a vault must never teach.
Collapse unknown into healthy (or silently keep the last green) and a dead
credential hides behind a stale checkmark until the 3 a.m. automation finds
it. The two collapses fail in opposite directions; the only honest design is
the third state, rendered as itself.

The word doing the work in "silently keep the last green" is *silently*.
Keeping the last verdict is correct: a probe that never reached the provider
learned nothing about the credential, so it has no standing to overwrite what
the last real answer said, and large probe systems throw an errored probe's
result away rather than record it. What must not happen is that the
unanswered attempt disappears. The verdict and the attempt are two facts,
stored as two: the last verdict with its time, and the last attempt with its
outcome, its time, and the obstacle. A could-not-reach updates the attempt
and leaves the verdict alone, and the surface renders both — "verified four
days ago; could not check since this morning, offline". Overwrite the verdict
and the offline laptop paints the vault red; drop the attempt and the last
green ages behind a checkmark nobody knows is unrefreshed. The two facts
also need an order. Where the attempt is written only when a probe reaches no
verdict, the next verdict must clear it, or every surface must compare the
attempt's time with the verdict's. Otherwise a "could not check" that a later
verdict has already answered renders beside that verdict. Every path that
writes a verdict owes the clear, including a sweep or a gateway that
persists results through a writer of its own.

The same honesty applies inside "broken": a rejection carries its kind where
the provider offers one — expired, revoked, insufficient scope, account
suspended — because each routes to a different remedy, and the probe was the
moment the evidence was fresh.

### Which answers are verdicts

The partition between broken and unknown is drawn over the provider's
answers, and the status line alone does not draw it. A rejection of the
credential's authentication is a verdict. Rate limiting, server errors and
maintenance responses are answers about the provider, not the credential,
and belong in unknown. The status code that does not sort cleanly is
*forbidden*: it means insufficient scope at one provider and an exhausted
rate limit at another — at least one major API answers a spent quota with it
and a zero remaining-quota header. A probe that files every non-success
status as a failure therefore records a provider outage, and every rate-limit
window, as a credential failure. That is the collapse this technique exists
to prevent, and it gets in through the classifier rather than the renderer.
Classify from the typed signals the protocol carries — the authentication
challenge's error code, the token endpoint's error field, the rate-limit
headers — and treat an answer none of them explains as unknown, with the raw
evidence kept for diagnosis. The success status is not a verdict either,
where a provider carries its errors in the body: an API that answers a
revoked token with a success status and an error flag in the payload is
drawn green by any classifier that stops at the status line.

The kind, once classified, crosses every boundary as a field
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
The decay to look for is a consumer that gets the kind back by
pattern-matching the result's message — a regular expression lifting a
status code out of prose, a substring check for a phrase the backend
happened to write. It shows the classification was thrown away one hop
upstream, and it breaks the first time someone rewords the message.

And "unknown" itself splits along a line worth rendering: **cannot probe
now** (transient — offline, outage, rate limit; will resolve, carries
staleness, retried on cadence) versus **cannot probe ever** (structural — the
service offers no safe read-only way to exercise this credential kind). The
structural case is a permanent property of the connector, not a degradation:
it renders as a calm, explicit "stored, not live-verifiable" — never as a
stale warning that trains the operator to ignore staleness, and never as the
green check it did not earn. Two probe-shaped facts with opposite retry
semantics must not share a state
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
includes not overloading a state's meaning). Equally: a transient
could-not-reach must never be *recorded as a credential failure* — a provider
outage written into the failure ledger indicts every credential behind it,
and the indictment outlives the outage.

The vocabulary's width is a property of **every representation the verdict
passes through**, not only of the surface that renders it. Three narrowings
recur, and each deletes the third state long before a badge is reached: a
failure handler that converts an unreachable provider into the rejected
outcome, because the catch clause has one path out; a persisted column typed
as a boolean, which holds *verified* and *not verified* and has nowhere to
put *not verified yet*; and an intermediate accessor whose declared return
type is narrower than the store's, collapsing the state on the way out. A
fourth narrowing survives the other three being fixed: the compatibility
boolean kept on the result beside the typed state. Its truth table was
chosen for one consumer, the admission gate, so "cannot probe ever" is
usually true there so as not to block a save, and every renderer that reads
the boolean because it is the simpler field inherits the gate's policy. The
structural case draws the green check it did not earn, and the transient
case draws the red cross. The retrofit trap in
[three-state-outcomes](../../../../operations/service-operations/health-checks/techniques/three-state-outcomes.md)
is the general form of this: the boolean is a gating shim and nothing
else, and its collapse is documented where it is defined. The
audit is therefore a type walk rather than a screenshot: follow one probe
result from the call that produced it, through every type it is declared as,
to the column that stores it, and confirm the third state is representable at
each hop. Where it is not, the third state exists only in the renderer —
which is to say it does not exist.

## Probe design

- **Cheapest authenticated read.** The ideal probe is the provider's
  identity/introspection endpoint: it exercises the credential, returns the
  authenticated identity and often the live scope set, and costs one trivial
  read. Never a write, never a side-effecting call, never an expensive query
  — a probe that mutates state or burns meaningful quota is a defect even
  when green.
- **The probe must actually exercise the credential.** A reachability ping
  that succeeds without authenticating validates the network, not the secret
  ([the gate must see its target](../../../../_laws.md#gate-sees-target) — a probe
  is a gate, and its target is the credential's acceptance, not the
  provider's uptime).
- **Probes are traffic the provider sees.** Aggressive schedules burn rate
  limits that real work needs, and authentication-heavy patterns from one
  origin can trip provider anomaly detection — the probe designed to confirm
  health becoming the cause of lockout is the technique's signature own-goal.
  Cadences are per-provider, modest by default, and back off when the
  provider pushes back.
- **Two sources, labeled.** Expiry math (local, free: "the proof expires at
  T") and live probes (remote, costly: "the provider accepted it now") both
  feed status, and the record labels which source produced which claim.
  Expiry math predicts rejection; only a probe observes acceptance. Neither
  substitutes for the other.

## Results age; staleness is part of the answer

A probe result is a fact about a moment. A green from last Tuesday is not
green; it is *"was green, N days ago"* — and the difference is the credential
that was revoked Wednesday. So:

- **Every stored result carries its timestamp**, and consuming surfaces
  render the age, not just the color.
- **Freshness thresholds belong to the consumer.** A dashboard glance
  tolerates hours; a pre-flight check before dispatching a critical
  automation may demand a probe *now*. The store serves the result and its
  age; the consumer decides sufficiency.
- **A stored status is a derived value and names its recomputation**
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
  the probe is invokable on demand — per credential, from every surface that
  renders staleness — or the display is a cache with no refresh path and the
  first disagreement with reality has no arbiter.

## Layered result storage

Three layers, three jobs, kept distinct:

1. **Current status** — one small, fast-to-read verdict per credential
   (state + timestamp + one-line reason), and beside it the last attempt
   when that attempt reached no verdict (time + obstacle). What lists and
   badges render. Only a verdict writes the verdict fields.
2. **Last probe detail** — the full evidence of the most recent probe:
   endpoint touched, response class, latency, rejection kind, sanitized
   payload. What a human diagnoses from.
3. **History** — the sequence of outcomes over time. What trends are read
   from, and the evidence stream the
   [remediation ladder](./rotation-and-remediation.md) scores; a ladder fed
   only the current status cannot distinguish "flaky for a week" from
   "failed once, just now". History has a retention bound named at design
   time — an unbounded probe log is a slow disk leak with a dashboard.

Never log secret material in any layer; the probe touches plaintext only
inside the brokered door, and its stored evidence is outcome-shaped, not
request-shaped.

## One vocabulary, scheduled honestly

The status set — healthy, broken, unknown, and any refinements — is defined
**once** and every consumer derives from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the badge renderer, the remediation scorer, the pre-flight gate, the filter
menu. A hand-copied status list in one surface is a blank badge waiting for
the vocabulary's next member — which will be added *precisely because* it
matters (a new degradation nuance), and will be invisible exactly where it
matters.

Scheduling, finally, is decoupled from attention: probes run on cadence and
on meaningful events (post-acquisition, post-rotation, on resume from
offline), **not on render**. Probing when a user opens a screen couples
quota consumption to curiosity, hammers providers on every visit to a list,
and — worse — means credentials nobody looks at are never probed, inverting
the technique's purpose: the unwatched credential serving the 3 a.m.
automation is the one that most needs watching.
