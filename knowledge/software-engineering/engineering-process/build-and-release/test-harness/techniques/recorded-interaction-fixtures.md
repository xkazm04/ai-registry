---
layer: technique
type: technique
subject: test-harness
technique: recorded-interaction-fixtures
status: forged
laws: [gate-sees-target, derivation-names-recomputation, absent-guard-is-loud, count-carries-predicate]
shared_with: []
use_when: [deciding whether a suite may talk to a real remote service, a green suite that has not noticed an upstream change, a secret appearing in a committed fixture, recorded traffic bloating every clone]
---

# Recorded interaction fixtures

A suite that must exercise a real remote service has three bad options and one
good one. Hitting the service on every run buys fidelity at the price of
credentials, quota, rate limits, network flakiness and a lane nobody can run
offline. Hand-writing a fake buys speed at the price of asserting against a
model of the service written by the same person who misunderstood it. Skipping
the interaction entirely leaves the integration boundary — where defects
concentrate — uncovered.

The fourth option is to **record every interaction once and replay it
thereafter**. The recording is the fixture, and everything in
[fixture-economics](./fixture-economics.md) applies to it: it is capital, built
expensively once and spent cheaply many times. What that technique does not
cover, and what this one owns, is that this particular fixture is a *captured
observation of somebody else's system*, which gives it two properties a
database template does not have — a fidelity that can be dialled down without
anyone noticing, and an expiry nobody wrote down.

## Three modes, declared per lane

- **Live** — the request goes to the real service, nothing is written. This is
  the certification lane, and it is not optional (see *The freshness
  obligation* below).
- **Record** — the request goes to the real service and the exchange is written
  to storage.
- **Playback** — the request is served from storage; the network is never
  touched.

The mode is a property of the lane, not of the test, chosen the same way
[isolation-lanes](./isolation-lanes.md) chooses what a suite may inherit. A
suite whose mode is decided per test file has no answer to "did this run reach
the network," which is the only question that matters when a run is slow,
flaky, or expensive.

## Put the seam in the production transport

The recording hook belongs **below** every client library's own retry,
serialization, and authentication layers — at the wire. Above them you capture
a client's idea of the exchange; the retry it performed, the header it
computed, and the encoding it chose all vanish, and the replay then certifies a
sanitized story rather than the bytes the service actually saw.

In practice that means the seam lives in the **application's real transport
factory**, configured once as a default that every component resolves — not in
a per-test client the tests construct themselves. This produces the technique's
central move, and it is a contract inversion worth stating plainly:

> **Correct dependency injection becomes the precondition for recordability.**

A component that constructs its own transport instead of resolving the shared
one does not fail loudly under playback. It succeeds — by silently escaping to
the live network, with credentials that may not exist and latency the lane did
not budget for. Recordability is therefore not a testing concern bolted on at
the end; it is a structural property of the production wiring, visible in code
review as "does this resolve the shared transport or build its own"
([_laws: absent-guard-is-loud_](../../../../_laws.md#absent-guard-is-loud) — a
seam that engages only where somebody remembered to wire it protects the
examples and not the code).

**Compile the hook out of release builds** rather than gating it at runtime. A
shipped binary carrying a "redirect every outbound request to the address named
in this environment variable" hook is a redirection primitive with a
configuration switch on it, sitting in production for the convenience of a lane
that does not run there. Conditional compilation removes the capability; a
runtime flag only removes the intent.

**Grade the seam per component, and refuse rather than degrade.** Correct
injection is the precondition, and whether a given component meets it is a fact
about that component's *code* — not about any particular recording — so it can
be decided once and written down. A suite that knows this publishes three
states rather than a boolean: fully replayable (all outbound work crosses the
seam, so a replay serves the whole run), partially replayable (the component
mixes seam traffic with direct calls, so a replay is genuine for the recorded
part and live for the rest), and unreplayable (its work *is* the direct calls,
so a replay would reproduce none of it). The middle state is the one that earns
the design: a partial replay that reports itself as a plain replay reads as full
determinism to everyone downstream, so the grade and its reason travel *with the
result*, not in a comment. The unreplayable case is refused at the door rather
than run and quietly labelled. A suite that cannot say which of the three it is
in cannot tell you how much of its green was actually recorded
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

**Put a second tripwire behind the seam.** The escape this technique warns about
— a component that builds its own transport and quietly reaches the live service
during playback — is invisible precisely because it *succeeds*. So make success
impossible by a second, independent route: in playback, supply a credential that
cannot authenticate anywhere. A caller that dodged the transport seam then fails
loudly on the way out instead of returning a real response that the suite records
as a pass. This costs one line in the playback lane's environment and converts
the technique's worst failure mode from silent to noisy
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The general
form: when a seam's bypass is undetectable at the seam, deny the bypassed path a
resource it cannot proceed without.

## The fidelity dial

This is the part of the technique with the sharpest edge, because both of its
knobs are turned for good reasons and both of them turn the same way: **down**.

**Sanitizers** rewrite secrets out of the recording at rest — credentials,
tokens, account identifiers, anything that would be a disclosure once the
recording is stored where the whole team can read it. Every sanitizer is
correct and every sanitizer **weakens the recording's fidelity**, because the
replayed exchange is now provably not the exchange that happened.

**Matchers** decide which parts of a request must agree before a recorded
response is served: method, path, query, body, which headers. Relaxations are
also correct — a timestamp, a nonce, a generated boundary, a header whose order
is not stable — and every relaxation **weakens the assertion**, because the
test now accepts a wider set of requests as "the same request."

The rule that ties them together:

> **A recorded test's strength is the intersection of what was not sanitized
> and what is still matched.**

A suite that sanitizes the body and matches on path alone is asserting that the
code sent *some* request to *some* endpoint, and reporting green. Nothing in
the run distinguishes that from a suite asserting the full exchange. So both
dials are set as a **suite-level default with per-case overrides**, and the
overrides are reviewable: a matcher relaxation is a test-strength change and
must be read as one, in the same breath as the assertion it weakens. A
reviewer who sees only the test body sees none of this.

The third piece is what makes the two dials workable at all. Some values must
**survive record-to-playback without being sanitized** — a generated resource
name the assertion depends on, an identifier the next request in the sequence
must carry. These need an explicit registration channel: a way for a test to
say "this value is not a secret, preserve it." Without one, the sanitizer
eventually eats the thing the test was about, and the failure reads as a
mysterious mismatch rather than as a policy collision.

## The freshness obligation

[fixture-economics](./fixture-economics.md) requires that a template name what
rebuilds it. A recording, by default, names nothing:

**A recording carries no fingerprint of the service it recorded.** Its metadata
says where the recording is stored, when it was captured, perhaps who captured
it — never which version of the remote contract it captured. So playback keeps
certifying yesterday's service indefinitely, on a green board, until the
divergence is discovered in production. This is the corpus's own vicious-green
failure arriving through a door the fixture technique does not watch, and it is
strictly worse than a stale schema template, because the input that changed is
not in the repository at all and no fingerprint over local files can see it
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target): the gate is
reading a recording and claiming a service).

Two obligations follow, and they are not optional extras:

1. **Record the contract revision alongside the recording** — the service
   version, the API revision, the schema hash the provider publishes, whatever
   the remote side offers as an identity. If it offers nothing, record the
   capture date and treat age as the proxy. A stored derivation names how it is
   recomputed ([_laws:
   derivation-names-recomputation_](../../../../_laws.md#derivation-names-recomputation)),
   and here recomputation means *re-record against the live service*.
2. **Keep a live lane on a cadence.** The playback lane runs on every change;
   a live lane re-certifies against reality nightly or weekly, judged and
   scheduled the way
   [long-lane-certification](./long-lane-certification.md) describes — its
   value is the trend, its failure is a *finding* about the world rather than
   a broken build, and its first green must be an observed event.

Say it plainly, because teams do not: **a recorded suite with no live lane is a
suite that has stopped testing the world.** It tests that the code still
behaves the way it behaved on the day of the recording, which is a real and
useful property, and is not the property the suite's name claims.

## Warehouse the recordings, commit the pointer

Recordings are large and they only grow: every new case adds bytes, and
re-recording adds a second copy of the old bytes to the repository's history
forever. Keeping them in the source tree taxes every clone, permanently, for a
fixture most contributors never open.

The shape that works: store recordings in a **separate content-addressed
location**, and commit only a **tag** naming the set. Fetching is sparse and by
tag; pushing a new set writes the new tag back into the committed pointer. This
keeps the capital framing intact — the fixture is still capital, this is just
where the capital is warehoused — while the repository carries an identifier
instead of the asset.

It creates one obligation, and it is easy to miss: **the tag is the only thing
tying a commit to the recordings it passed against.** A change that alters
requests and a change that updates the tag are the same change, and they belong
in the same commit. Split them and the history contains revisions that cannot
be reproduced in either direction — old code against new recordings, new code
against old.

## Playback must neutralize recorded timing

A recorded throttling response carries the service's instruction to wait before
retrying. Replayed verbatim, the suite obeys it: a test that exists to prove
the retry path works now takes as long as the real backoff, every run, forever.

The wrong fix is to delete such directives from the recording, which deletes
the condition under test — the client no longer sees a throttle, takes the
happy path, and the retry code is never exercised while the test that named
itself after retries continues to pass.

The right fix is to **rewrite the timing directive to zero on the way out of
playback**. The response still says "you were throttled, wait"; it says wait
for no time. The client's retry logic runs in full — the branch is taken, the
attempt counter advances, the backoff calculation executes, the eventual
success is observed — and the wall clock cost is gone. The distinction is worth
holding onto because it generalizes: when a recording carries a value whose
only effect is elapsed time, neutralize the value, never the behaviour.

## Boundaries

This is not [out-of-graph-artifacts](./out-of-graph-artifacts.md). That
technique is about building and loading a real artifact that the gate's
population never reached; the artifact under test is yours, and the fix is a
job that compiles and loads it. Here the thing being stood in for belongs to
somebody else and cannot be built at all — only observed and stored.

Nor is it a substitute for a live lane, which is the whole content of the
freshness obligation above. A harness that replaced its live lane with
recordings has converted a slow honest check into a fast dishonest one.

## When not to use it

**When the behaviour under test is the service's, not your handling of it.** A
recorded exchange can only tell you what the service did once. If the question
is "does this endpoint enforce the limit," "does the provider reject this
malformed payload," or "is this field really optional," a recording answers by
replaying whatever happened the day you asked, which means the test now
exercises your parser and nothing else — and will keep answering the same way
long after the service changed its mind.

**When the interaction is cheap, deterministic, and locally hostable.** A
service you can run in a container beside the suite is better than a recording
of it in every dimension that matters: it responds to inputs the recording
never saw, it fails the way the real thing fails, and it has no fidelity dial
to be quietly turned down.

**When the exchange is trivial enough to fake honestly.** A single request with
a two-field response does not need capture machinery; the recording's
overheads — storage, tags, sanitizers, matcher policy, freshness — are fixed
costs, and below some volume they exceed what they buy.
