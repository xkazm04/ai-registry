---
layer: technique
type: technique
subject: streamer-dress-rehearsal
technique: inert-platform-bridge-or-refuse
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [deciding what a rehearsal mode replaces and what it keeps real, wiring a streamer tool's platform connection for a rehearsal, reviewing whether a rehearsal can reach real viewers]
---

# Inert platform bridge, or refuse

A dress rehearsal is the real toolchain with its two people-facing ends replaced: where
messages come from, and where actions on viewers go. This technique governs the second end
and the boundary around both. The platform bridge — the component that holds the
platform session, subscribes to its events and sends moderation calls, chat replies and
channel changes — is constructed **inert** for a rehearsal, and every operation that
would need the live bridge is either recorded as a simulated outcome or refused by name.
There is no third path in which an operation quietly does nothing and reports success.

## The quarantine sits at the edge, not in the features

The naive design adds a rehearsal flag and asks every feature to consult it before acting.
That fails the first time a feature is written by someone who did not know about the flag,
and it fails silently, because nothing in a rehearsal notices a real call that succeeded.
The robust design makes the edge itself incapable: the rehearsal composition is built with
a bridge that holds no credential, opens no session and has no executor, so a feature that
forgets to check cannot reach the platform because there is nothing on the other side.

Three checks make the edge trustworthy. **The composition refuses to start** in rehearsal
mode unless the bridge it was handed is the inert one; a rehearsal that would run against
a live bridge is not a degraded rehearsal, it is a live session with fake chat. **Requests
that only make sense live** — starting the platform login, revoking it, subscribing to
the channel's events — are refused at the request router, before any adapter sees them,
with a policy error the interface can show. **Actions on viewers** that the rehearsal is
meant to exercise — a confirmed ban, a timeout, a held message released — complete against
a ledger as simulated records, so the streamer sees the whole decision flow and nothing
leaves the machine.

## What stays real

The quarantine replaces what reaches other people and keeps what the streamer's result
depends on. The broadcasting software on the streamer's machine stays real, because the
overlays have to render in it. A public randomness source a draw is cast from stays real,
because a rehearsal that substitutes recorded randomness has rehearsed a draw that will
never happen live. The clock stays real. Swapping any of these for a fake makes the
rehearsal pass on a path the live show will not take.

When a stage that the live result depends on must be swapped anyway — a model-backed
classifier replaced by its rule-only floor because the rehearsal has no budget or no key,
say — the rehearsal says so wherever it reports, and the streamer reads the result as
covering the floor, not the live path.

## Procedure

1. List every outbound operation the tool performs against the platform or a person.
2. For each, choose one of two outcomes in rehearsal: **simulate** (a ledger record the
   rest of the tool can read and display as simulated) or **refuse** (a named policy error,
   raised before any adapter is called). Never a no-op returning success.
3. Build the rehearsal composition with a bridge that owns no credential, and make the
   composition's constructor refuse any other bridge.
4. Refuse at start any combination of options that would carry live authority into the
   rehearsal — a login flag, a live-automation opt-in — rather than ignoring them.
5. On leaving rehearsal, never replay a login or a live opt-in automatically; the streamer
   re-grants live authority as a fresh act.
6. List the dependencies kept real and any stage swapped for a floor, and show the list on
   the rehearsal's entry screen, including what each needs (a randomness source over the
   network needs internet access).

## Decision rules

- **When an operation cannot be honestly simulated, refuse it.** A refusal is a visible
  state the streamer can act on
  ([law: refusal-is-a-state](../../../../_laws.md#refusal-is-a-state)); a silent success
  makes a feature that was never wired look rehearsed.
- **When a dependency's output appears in what viewers will see, keep it real.** Fake it
  only if the real one is impossible offline, and then label the output.
- **When a rehearsal option and a live option are both given, fail to start.** A
  precedence rule is a guess about which the streamer meant.

## When not to use it

Testing that the platform itself behaves as claimed — rate limits, event delays, what a
moderation call really does — needs the live bridge on owned accounts and is a different
discipline. An inert bridge cannot tell you anything about the platform, and a rehearsal
that tries to emulate the platform's quirks in its inert bridge has started maintaining a
second, untested platform.
