---
layer: technique
type: technique
subject: live-test-consent-and-evidence
technique: owned-test-accounts-only
status: forged
laws: []
shared_with: []
use_when: [choosing the channel and accounts a live platform test may act on, writing a live test that times out, bans or messages an account, reviewing a live test suite before its first run]
---

# Owned test accounts only

A live test of a streamer tool is an action on a real service. When it bans an account,
that account is banned; when it posts in chat, the message is in chat. The only way such a
test is acceptable is if every account and channel it can touch belongs to the people
running it. This technique fixes the target set before the test is written, enforces it in
the harness rather than in the test author's care, and keeps what the test writes onto the
platform fixed and recognisable.

## The target set

A live suite has three kinds of participant, and each is owned:

- **The channel**, controlled by the team, used for testing and nothing else while a
  suite runs. If the same channel is also where someone streams, the suite runs only when
  it is offline.
- **The acting identity**, the account whose credential the tool holds — the
  broadcaster or a moderator of the test channel. Its scopes are the ones the tool will
  ask a real streamer for, no more, so the test exercises the permission set the product
  ships with.
- **The targets**, viewer accounts the team created and holds credentials for. At least
  one is an ordinary viewer with no privileges on the test channel; others exist only
  where a test needs a privileged target on purpose.

## Ownership is asserted by a person and checked by the harness

No code can tell that an account belongs to the team. What the harness can do is make the
operator say so explicitly and then check everything around that statement. The operator
supplies the test channel and the target; supplying them is recorded as their assertion of
ownership, and the harness never widens it — it does not pick "a" test account, infer one
from a pattern in the name, or fall back to a default. Then, before anything is sent, it
checks what is checkable: the authenticated identity is the test channel's broadcaster,
the target is a different account from the broadcaster, and the target holds no
privilege on the channel. Each check is a refusal with a reason, and each is itself
tested with the near-misses — the same account twice, the wrong broadcaster.

Act on the platform's stable account identifier, never on a display name or login. Names
can be changed and claimed; an identifier cannot be taken over by a stranger between two
runs. The strongest way to obtain it is to let the owned account identify itself: the
operator sends a fixed marker from the target account into the test channel, and the test
takes the identifier from the platform's verified metadata on that one message, ignoring
every other line. A name-to-identifier lookup is the weaker form, acceptable when the
configured name is the operator's assertion and the resolved identifier is checked against
the rules above before use.

## Enforcement lives in the harness

The client a live test uses is wrapped so that every call that acts on an account or
channel checks the target against the owned set **before** sending. A target outside the
set is a refusal with the target named, not a warning. This matters because tests are
edited by people in a hurry: a test that looks up "the most recent chatter" to time out,
or copies a channel identifier from a production log, is one edit away from moderating a
stranger, and only a check outside the test can catch it.

## The privileged-target trap

The ordinary path — a moderator acting on a plain viewer — is the one the product runs a
thousand times a night, and it is the one a careless suite does not test. Teams create one
test viewer, make it a moderator so it can help with other tests, and then every live
moderation test runs against a moderator. Platforms commonly refuse or special-case actions
on moderators, so the suite learns the refusal path and records it as the platform's
behaviour. Keep at least one **non-privileged** target, and record on each live result
which kind of target it ran against.

## What the test writes

Everything a live test puts onto the platform is a fixed marker: a constant chat line, a
constant timeout or ban reason, a constant poll title, each saying plainly that it is an
automated test and naming the tool. No generated text, no copied production content, no
user input. A fixed marker can be searched for and cleaned up; it reads unambiguously to
a platform reviewer looking at the channel's moderation log; and it cannot carry
something nobody reviewed onto a real service.

The same holds for what the test reads. It echoes only the marker it waits for and never
prints, logs or saves another message body, even from the owned accounts, because the
test channel is still a channel and a saved real line becomes a fixture its author never
agreed to.

## Observe before you act

Much of what a team needs from the platform is the shape of what it sends: a moderation
event, a held message, a settings change announced on the event subscription. None of
that requires the test to perform the action. The test can instead ask the operator, by
name and with a deadline, to perform it by hand on the owned target through the
platform's own interface, and only listen. The test then issues no ban, no warning, no
settings change; the person who owns the accounts does, knowingly. Where a scenario
changes channel state, the test reads the initial state first, asks for the change, then
asks for it to be restored and checks both the restoration event and a read-back. Reserve
tests that act for the questions that are about the tool's own call.

## Procedure

1. Create the test channel and target accounts; record each one's stable identifier and
   whether it holds any privilege on the test channel.
2. Put the owned set in configuration the live harness reads, separate from any
   production configuration.
3. Wrap the platform client for live tests so every account- or channel-directed call is
   checked against the set before it is sent.
4. Define the marker strings as constants and make the live tests use nothing else.
5. Before each run, check broadcaster, target distinctness and target privilege, confirm
   the channel is not live with an audience, and refuse to start on any mismatch.
6. Prefer observer tests the operator drives by hand; write acting tests only for the
   tool's own calls.

## Decision rules

- **When a test needs a target, pick one from the owned set by identifier.** Never select
  a target from chat, a log or a search.
- **When a test is about the ordinary moderation path, its target holds no privilege.**
  Record the target kind on the result.
- **When the test channel is live with viewers, do not run.** Their attendance is not
  consent to a test suite. When an account nobody agreed for appears in the channel
  mid-run, stop.
- **When a person outside the team must take part** — a second streamer, a viewer — get
  their explicit agreement for that run, add their identifier for that run only, and
  remove it afterwards.

## When not to use it

Hermetic tests that never open a connection to the platform need none of this; they need
a recorded response. Read-only calls that act on nobody — fetching the test channel's own
settings, listing its own rewards — still belong to an owned channel, but a read against a
public resource does not need a target list.
