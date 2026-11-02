---
layer: golden-path
type: golden-path
subject: streamer-dress-rehearsal
status: forged
use_when: [running a streamer's whole toolchain end to end before going live, building a rehearsal or demo mode into a streamer tool, preparing repeatable takes of a stream tool for review or filming, deciding what a rehearsal may touch and what it must refuse]
techniques:
  - inert-platform-bridge-or-refuse
  - separate-store-by-relaunch
  - labelled-crowd-with-rule-breakers
  - through-the-broadcast-path
  - retake-reset-discipline
  - provenance-survives-every-consumer
---

# Streamer dress rehearsal

A human streamer who runs a set of tools beside their stream — a moderation desk, a vote,
a giveaway, visuals that react to the audience, overlays the broadcasting software renders
— has exactly one environment in which all of those tools meet: the live show. Each tool
can be unit-tested, each overlay previewed, each rule read back, and none of that proves
that a chat message typed by a stranger reaches the moderation gate, passes, enters a
draw, moves a vote bar and lights a visual on the broadcast picture, in that order, with
the right thing refused along the way. A **dress rehearsal** is the discipline of running
that whole chain before going live: the real core of the tool, a generated and labelled
chat, a store of its own, the real broadcast output, and **no session with the streaming
platform at all**.

The principal practitioner's core belief is that **a rehearsal is the product running in a
quarantine, not a mock of the product**. Everything downstream of the chat is the real
code, configured the way the streamer will go live with it; the only things replaced are
the two ends that touch other people — where messages come from, and where actions on
viewers go. The naive design inverts this. It builds a demo screen that animates what the
product would do, fed by canned data inside the user interface, and it passes for a
rehearsal because it looks like the show. It proves the demo works. The first live
message then takes a path the demo never exercised, and the streamer finds out on air,
which is the one place a tool for live work must never be debugged.

## What a rehearsal owns, and what the neighbours own

Three neighbours share this ground. Simulated audience testing builds a synthetic room to
measure a *generated host*: a sourced population, a situation bank, a blind judge and
verdicts with confidence bounds, all to decide which model configuration may go live. A
dress rehearsal tests a *human streamer's tools* and produces no score; its audience is a
crowd of fixtures with a few rule-breakers in it, written so that every feature fires,
not calibrated so that a rate transfers to a real room. Testing against the broadcasting
software in an isolated lane is the neighbour that owns automation: how an unattended test
run starts its own instance of the software beside the streamer's own and never changes
the streamer's setup. A rehearsal is run by the streamer, against their own scenes, on
purpose, and it is the streamer's setup it exercises. Testing against the real platform
on owned accounts, with every live claim backed by observed evidence, is the third
neighbour; a rehearsal holds no platform session at all, so the moment a test needs the
real platform it has left this subject. The rule a reader uses to pick: if the question
is "which host configuration is safe enough to ship", read simulated audience testing; if
it is "can a test drive the broadcasting software without touching mine", read the
isolated test lane; if it is "does the real platform behave as we claim", read live test
consent; if it is "does my toolchain, as I will go live with it, work end to end before
anyone is watching", read this.

## Quarantine is decided at the edges, not in every feature

A rehearsal that relies on each feature remembering "am I in rehearsal?" leaks, because
the next feature written forgets. The quarantine lives at the two edges where the tool
meets the platform, and at the store (inert-platform-bridge-or-refuse).

Inbound, chat comes from a generator rather than the platform's event subscription. That
generator enters through the **same intake** a real message uses — the same parser, the
same moderation gate, the same fan-out — because an intake that is bypassed is an intake
that is not rehearsed. Outbound, every action that would touch the platform or a person —
a timeout, a ban, a chat reply, a channel-point refund, a poll created on the platform —
goes to an inert bridge that records what would have been sent and returns an outcome the
caller can tell apart from a real success. What the inert bridge cannot honestly
simulate, it refuses, loudly and by name. A silent no-op that returns success is the worst
outcome available: it lets a feature that was never wired to the platform at all look
rehearsed. The rehearsal composition refuses to start at all unless the bridge it was
handed is the inert one, so a forgotten check in a feature has nothing live to reach.

The generated-chat door is private. No request from the interface, a script or any other
caller supplies the text or identity of a generated message; the caller picks a rate or a
named scenario and the core writes the lines. A rehearsal door that accepted text would be
an unmoderated path from a keyboard past the platform into the gate and onto overlays,
and it would exist on every machine the tool is installed on.

Some dependencies are neither the platform nor a person and should stay real. A public
randomness source a draw depends on, the broadcasting software the overlays render in,
the clock — replacing these with fakes would make the rehearsal pass on a path the live
show will not take. The rule is that a rehearsal replaces **what reaches other people**
and keeps **what the streamer's result depends on**. Where a stage the live result depends
on has to be swapped anyway — a model-backed classifier run on its rule-only floor, say —
the rehearsal says so on its entry screen and in its summary, and its verdict covers the
floor, not the live path.

## The rehearsal is a different process, with a different store

Rehearsal is chosen when the tool starts, not by a toggle in a running session
(separate-store-by-relaunch). A runtime switch has to be honoured by every in-flight
task, every open connection and every cache at the moment it flips, and the one that does
not honour it writes a simulated ban into the real history or a real viewer into a
rehearsal draw. A relaunch makes the boundary a process boundary: the rehearsal process
opens its own store, binds its own inert bridge, and could not reach the real ones if it
tried. Flags that contradict each other — rehearsal and a live platform session, two store
paths — are refused together at start rather than resolved by precedence, because a
precedence rule is a quiet guess about what the streamer meant. Leaving is a relaunch too,
and it never replays a platform login or a live-automation opt-in: live authority is
granted again by the streamer, not resumed by the tool. The relaunch has a side benefit
worth keeping — every secret held only in memory dies with the old process.

The store carries its own mode. A rehearsal store refuses input that is not marked
simulated, and a live store refuses input that is; a mix-up between path and mode then
fails on the first write instead of after an hour of corrupted history.

## The crowd is written to make every feature fire

The generated chat is a cast, not a population (labelled-crowd-with-rule-breakers). It
carries ordinary viewers so the room looks like a room, and it carries **rule-breakers on
purpose** — a slur, a spam burst, a link, a viewer impersonating a moderator, a repeat
entrant to a draw — because a rehearsal in which the moderation desk never had anything to
do has not rehearsed the moderation desk. It is seeded, so a failure reproduces; it is
scenario-driven, so a streamer can rehearse "the giveaway segment" without waiting for
generic chatter to wander into it; and every message is labelled simulated **at
generation**, in a field the rest of the system reads, not by a naming convention a
reader has to know. A recurring rule-breaker keeps one identity, because the features
worth rehearsing are per-person — a repeat offence, a ban proposal, a duplicate draw
entry — and a breaker with a fresh identity per line never reaches them. Fixtures are
also checked against every feature's parser, so a moderation cast line never counts as a
ballot and a vote never moves because the spam bot said a keyword.

## The proof is the broadcast picture

A rehearsal ends where the viewer's experience ends: in the picture the broadcasting
software composes (through-the-broadcast-path). A tool's own preview of an overlay, a
local test button that animates a visual inside the tool, a green tick in a settings
pane — each proves that one component ran, and none proves that the overlay page was
served, loaded by the broadcasting software, placed where it should be and updated when
the core changed state. A test fire that never leaves the tool is the commonest false
rehearsal in this craft: it lights up on the streamer's screen and nothing changes on the
stream. The rehearsal drives events through the core and checks the composed picture, by
eye or by capture.

## Retakes start from a known state

A streamer rehearses more than once — after changing a rule, before a second segment, for
a recording. Every take after the first starts from whatever the previous take left
behind unless something resets it, and tools for live work are built to persist exactly
the things a retake needs gone: rules armed, draws sealed, sources added to the scene,
attempts consumed (retake-reset-discipline). Stopping a rehearsal therefore does not mean
"the take is over"; the craft distinguishes **stop**, which ends the simulated traffic,
from **reset**, which returns every persisted thing the rehearsal created to the state it
started from, and names in the interface which of the two a button does. The robust
form is a fresh store per take, discarded at the end, with the scene sources the
rehearsal created removed by identity; anything less is a list of things somebody will
forget to clear by hand. The fresh store matters for a second reason: the live tool's
protections — a sealed draw stays frozen, a consumed attempt stays consumed — must never
be loosened so a retake can proceed. A reset discards the rehearsal's world; it does not
unseal anything, because an unseal path written for rehearsal is an unseal path that
exists.

## A label that any consumer can drop is not a label

The rehearsal's outputs travel: overlays on a picture that may be recorded, a giveaway
proof a viewer could verify, an audit log, an export, a clip, a screenshot in a bug
report. Each one is a place where "this was simulated" can fall off
(provenance-survives-every-consumer). The label is therefore part of the data, set once
at the source and carried by every derived artifact, and rendered by every surface that
shows it — on the overlay itself, on the proof, in the export — derived from the state
that made it rather than from whoever renders it
([_laws: output-never-outruns-evidence_](../../../_laws.md#output-never-outruns-evidence)).
A rehearsed draw whose result card looks exactly like a live one is a fabricated record
the moment it is screenshotted.

Two refinements carry most of the weight. Aggregates inherit by **taint**: a vote window
or a draw pool holding even one generated contribution is simulated, because labelling a
mixed result costs a badge and not labelling it publishes a result a generated input
helped decide. And provenance has **more than one axis**: a rehearsed draw may have a
generated audience and a real, publicly verifiable randomness round, and a single word
on its plate misstates one of the two. Each axis that differs from live is named where
the result is shown.

## What a rehearsal cannot tell you

A rehearsal proves the chain, not the platform. It cannot show rate limits, the platform's
event delays, a token that expires mid-stream, real viewers' language, or how the
platform reacts to a moderation call; those belong to tests on owned accounts against the
real service. Its verdict is therefore narrow and should be stated narrowly: "every
feature fired end to end on the broadcast picture under this scenario, and nothing left
the machine". A streamer who reads it as "the stream will work" has read more than was
measured ([_laws: unmeasured-is-not-pass_](../../../_laws.md#unmeasured-is-not-pass)).
