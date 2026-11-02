---
layer: technique
type: technique
subject: streamer-dress-rehearsal
technique: labelled-crowd-with-rule-breakers
status: forged
laws: []
shared_with: []
use_when: [writing the generated chat a streamer tool rehearses against, making every rehearsed feature have something to act on, keeping generated chat from being mistaken for real viewers]
---

# Labelled crowd with rule-breakers

The generated chat in a dress rehearsal is a cast of fixtures, not a calibrated
population. Its job is not to predict how a real room behaves — that belongs to simulated
audience testing — but to make **every feature of the toolchain act at least once**, on
the streamer's own configuration, with each line unmistakably generated. A crowd that
only cheers rehearses the overlays and nothing else; a crowd with nobody breaking a rule
leaves the moderation desk idle and lets the streamer go live believing a rule they
armed works when it has never matched anything.

## What the crowd is made of

**Ambient lines** make the room look like a room and give rate-sensitive features
something to count. **Rule-breakers** are a small recurring cast, each breaking one of the
rules streamers commonly write — a spoiler, backseating, a link from a first-time chatter,
a slur, a spam burst — so a rule the streamer writes and arms has something to catch.
**Scenario bursts** drive one feature on demand: twenty distinct entrants for a draw,
thirty ballots for a vote, a burst of contributions for a reactive visual. Scenarios let a
streamer rehearse one segment without waiting for ambient chatter to wander into it.

Three properties make the cast useful rather than noisy. A recurring rule-breaker **keeps
one identity** across messages, because the features worth rehearsing are per-person —
repeat-offence escalation, a ban proposal naming the same viewer, a draw deduplicating a
second entry — and a breaker with a fresh identity each time never triggers them. Fixtures
are written **not to cross-trigger** other features: a rule-breaker's line carries no
ballot token and no keyword a vote counts, so a vote result is not polluted by the
moderation cast. And the generator is **private**: no request from the interface or any
other caller supplies the text or the identity of a generated message, because a
rehearsal door that accepts arbitrary text is an injection path straight past the
platform into the moderation gate and onto overlays.

## Every line is labelled at generation

Each generated message carries a simulated flag in a typed field the rest of the system
reads, a generated identity in a reserved namespace that can never collide with a real
account, and a message id prefixed with the rehearsal session. A visible marker in the
text itself is a useful second channel for humans reading logs, never the first: a flag
in the text is one formatting change away from disappearing, and a downstream consumer
that strips or truncates text drops it.

## Reproducibility

The crowd's content and order should be reproducible from a seed, and the seed shown with
the run, so a rehearsal that failed can be replayed exactly. Jitter in timing and in
ballot splits is fine — real chat is not metronomic — but it is drawn from the recorded
seed, not from an unrecorded random source. A rehearsal that fails once and cannot be made
to fail again teaches the streamer to distrust the rehearsal.

## Procedure

1. List the features the toolchain has and, for each, the input that makes it act. That
   list is the cast.
2. Write the rule-breaker lines against the rule kinds streamers commonly write, not
   against the streamer's actual rules; the rehearsal should test the streamer's rule,
   not be shaped to match it.
3. Give each breaker a stable reserved identity; give ambient chatters generated
   identities from a sequence that cannot reach the breakers' range.
4. Check every fixture against every feature's parser so none counts where it should not.
5. Expose the crowd as a rate control and the scenarios as named buttons; accept no text.
6. Record the seed and the rate with the run.

## Decision rules

- **When a rehearsed feature had nothing to act on, the rehearsal did not test it.** Say
  so in the summary rather than reporting a quiet feature as healthy.
- **When a fixture triggers a feature it was not written for, fix the fixture.** A
  cross-firing cast makes every result ambiguous.
- **When a caller wants to type a line into the rehearsal, refuse.** A streamer who wants
  to test a specific phrase uses the rule editor's own test input, which never reaches
  overlays.

## When not to use it

When the question is how a host or a moderation model behaves against realistic traffic,
with rates that must transfer to a real room, a fixture cast is the wrong instrument; use
a sourced synthetic population and a judged situation bank instead.
