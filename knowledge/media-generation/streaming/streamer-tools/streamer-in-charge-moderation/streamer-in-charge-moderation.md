---
layer: golden-path
type: golden-path
subject: streamer-in-charge-moderation
status: forged
use_when: [building a tool that can time out, ban or restrict viewers on a human streamer's behalf, deciding which moderation actions automation may take without the streamer, designing a review queue for proposed bans, turning on a new automated chat rule during a live stream]
techniques:
  - shadow-by-default-rules
  - arming-as-a-logged-grant
  - ban-review-window-with-invalidation
  - decide-on-the-stored-original
  - scoped-expiring-auto-action-grant
  - room-intents-cannot-name-a-person
---

# Streamer-in-charge moderation

A moderation tool that a human streamer runs is a machine with its hand on other people.
It reads chat faster than any person can, it can match a pattern across a thousand
messages, and through the streaming platform it can delete, hold, time out and ban. The
streamer, meanwhile, is performing: talking, playing, reading a fraction of what scrolls
past. The tempting design follows from that imbalance — let the machine act, because the
machine is the one paying attention. This subject is the standard that refuses that
design without giving up what the machine is good at. The whole of it rests on one
sentence:

> **Automation proposes and records; the streamer decides anything that touches a
> person, inside a window that is bounded in time and voided by any change to the facts.**

A ban is not a filter verdict. It lands on a named account, in front of that account's
friends, in a community where the streamer's reputation is the product. A false positive
in a word filter costs one hidden message; a false positive in a ban costs a regular, a
public accusation, and an appeal the streamer has to answer personally. The platforms'
own tools reflect this: their automated screens hold messages for a human, flag accounts
that look like ban evasion for a human, delay chat to give a human time, and say plainly
that the classifier is not accurate enough to ban on its own. A third-party tool that is
bolder than the platform's own screens has to earn that, and mostly it cannot.

## What the machine is for

Automation earns its place in three jobs, and none of them is deciding. **It notices**:
it matches rules over every message, links repeat patterns across accounts and surfaces
the handful of events worth the streamer's glance. **It records**: every match, every
proposal, every decision and every action taken is written down with the evidence it was
taken on, so the stream can be reviewed afterwards and a viewer's appeal can be answered
from a record rather than from memory. **It executes**: once a human has decided, the
machine carries the decision to the platform correctly, confirms it landed, and
reports honestly when it did not.

The fourth job — acting on a person without a human — exists, but only as a delegation
the streamer grants deliberately, narrowly and for a limited time, and which falls back
to them the moment they act themselves. That is a grant, not a default, and the
difference is the whole subject.

## A new rule watches before it acts

Every rule a streamer writes is a hypothesis about their chat, and most first drafts are
wrong in a way only live chat reveals: the word that is also a regular's in-joke, the
link pattern that also matches the streamer's own merch page, the caps rule that fires
on every hype moment. So a rule is born in **shadow**: it runs on real messages, records
what it would have done, and does nothing. The streamer sees its would-have hits in the
tool and decides from evidence, not from imagination, whether it is ready. A rule whose
shadow record is empty has not been shown to be safe; it has not been shown to be
anything. Shadow is also a property a whole session can take: the first time a tool is
pointed at a live channel, or whenever its operator says so, every saved armed rule is
forced back to recording for that session — one way, without rewriting the saved
configuration — so that a rule armed last week against different chat cannot act on
tonight's before anyone has looked. That is
[shadow-by-default-rules](./techniques/shadow-by-default-rules.md).

Moving a rule from shadow to enforcing — **arming** it — is a grant of power, and it is
treated like one: an explicit act by the streamer, carrying a reason they gave, written to
the log *before* the rule's configuration changes, so a crash between the two grants
nothing. The rule is armed only while that log entry can be found and the rule is
byte-for-byte the version it names. Editing an armed rule must not keep it armed: either
the edit is refused until the rule is back in shadow, or the edit disarms it; both are
honest, and silently carrying the consent over to new text is not. A rule that arms
itself by default, or stays armed through an edit, has taken a decision nobody made. That
is [arming-as-a-logged-grant](./techniques/arming-as-a-logged-grant.md).

## A ban is a proposal with a clock

When automation thinks a person should be removed, it does not remove them. It writes a
proposal — the account, the evidence, the suggested action — and puts it in front of the
streamer with a short review window, on the order of two minutes. The window does two
jobs. It bounds the streamer's burden: an unanswered proposal never executes, because
silence from a person who is busy performing is not consent — and it does not release the
message either. The offending line stays held and the person stays untouched; expiry
returns the case to review rather than closing it in anyone's favour. And it bounds staleness:
the proposal carries the facts it was built on, and any change to those facts — the
message deleted, the account already actioned by a moderator, the rule edited or
disarmed, the stream ended, the viewer marked as someone the show is caring for — voids
it before the streamer can confirm it. Confirming a proposal whose premise has changed is
confirming a decision about a situation that no longer exists. That is
[ban-review-window-with-invalidation](./techniques/ban-review-window-with-invalidation.md).

What the streamer looks at when they decide is equally load-bearing. They see the
original message as it was captured when the rule fired — the stored bytes, the account
identity as the platform stamped it, the time — never a model's paraphrase, a summary, or
a re-fetch of whatever that account says now. The confirm request itself carries nothing
but the proposal's identity; the text the streamer read comes from the durable queue, and
if the stored original has expired or been erased, the proposal cannot be confirmed at
all. The action, once confirmed, is bound to that record, so the decision and the
evidence cannot drift apart. And the record is what answers the appeal next week. That is
[decide-on-the-stored-original](./techniques/decide-on-the-stored-original.md).

## Delegation is a lease, not a setting

There are moments when a person cannot keep up: a hostile raid of new accounts, a spam
wave, a coordinated flood. Holding every proposal for review in those minutes means the
harm lands while the queue fills. The answer is not a standing "auto-ban" switch. It is a
**grant** the streamer issues for that situation: which actions, up to what severity,
from which rules, for how long. The grant expires on its own and never renews itself, the
tool shows its countdown on screen, and the instant the streamer or a moderator changes
the same thing by hand, the grant yields — the human is back, the machine steps behind
them, and when the grant's time runs out it does not "restore" anything over the human's
change. Permanent removal is the last thing a grant should hold. If a tool offers it at
all, it is for deterministic pattern rules only — never a classifier's judgement — under a
ceiling of removals per hour, and reaching the ceiling trips a breaker that hands every
further case back to the streamer's click until they reset it. That is
[scoped-expiring-auto-action-grant](./techniques/scoped-expiring-auto-action-grant.md).

One input is never a reason for the machine to act: the platform's own suspicion. An
account the platform flags as a possible ban evader, or a restricted user whose messages
reach only moderators, enters through a separate intake that can hold and show but cannot
produce an action, whatever rules are armed. The platform declined to act on that signal
alone because it is not accurate enough; a tool that acts on it is bolder than the
classifier's own authors.

## Rooms and people are different types

Much of what protects a stream addresses no one: slow mode, followers-only, emote-only,
a stricter platform screen, a chat delay. These **room intents** change the conditions
for everyone equally, they are reversible in one click, and automation may reasonably
propose or, under a grant, apply them. Actions on a person are a different kind of thing,
and the cleanest design makes that difference structural: the type that carries a room
intent has no field that can name an account, so no rule, model or bug can turn "calm
the room" into "remove this viewer" by filling in a parameter. Person-addressed actions
travel a separate path that ends at the review window. That is
[room-intents-cannot-name-a-person](./techniques/room-intents-cannot-name-a-person.md).

## Honest state

A moderation tool that reports "banned" when it sent a ban request has lied twice — to the
streamer, who believes the account is gone, and to the log, which now records a fact
nobody observed. Actions are reported in three states: requested, confirmed by the
platform, and refused or unknown. The same holds for settings: whether a chat mode is
actually on is unknown until the platform reports it back, and the tool shows *unknown*
rather than echoing the switch it last pressed. The moment a change is sent, the old known
state is gone too: a timeout or a failure leaves it unknown, and a restart never guesses.
A platform refusal — insufficient permission, target is a moderator, rate limited — is a
state the streamer sees, never a silent retry and never a quiet success.

The machinery itself fails the same way. A gate that could not run is recorded as
*skipped*, not as *found nothing*; a classifier that timed out or answered in a shape the
gate does not recognise yields a held message, not a passed one; and any error on the way
to a verdict means withheld, never pass by absence. The rules that encode the outcomes no
setting may override — the ones that make a disclosure reach the streamer instead of a
timeout — are owned by code: the streamer may change how they are delivered, never
whether they run.

## The naive readings, and why they fail

**"The classifier is good enough, let it ban."** It is never good enough at the scale of a
community: one wrong ban per thousand at a few thousand bans a month is several wrongly
removed regulars, each with a public story. And the classifier is the component a hostile
raid studies.

**"Just ask the streamer to confirm everything."** A confirm dialog the streamer clicks
through forty times an hour is not a decision; it is a rubber stamp with extra latency.
The review queue works only if it is small — shadow rules keep it small, room intents
handle crowds without it, and grants handle the minutes when it cannot keep up.

**"An expired proposal means they didn't object."** Silence from someone mid-performance
means they did not see it. Expiry never resolves to the action — and not to a pardon
either: the line stays held until someone has looked.

**"The model saw the message, so its summary is the evidence."** A summary is a claim about
evidence. The person deciding sees the evidence.

## Boundaries

[Live chat moderation and anti-bait](../../trust-and-evaluation/live-chat-moderation-and-anti-bait/live-chat-moderation-and-anti-bait.md)
governs what a generated host *says*: chat is data, injections become tags, one output
gate stands at the last door before broadcast. It defends the show's voice from the
audience. This subject governs what a tool *does to viewers* on a human streamer's behalf
— holds, timeouts, bans, chat modes — and who decides. They share the input classifier,
and the seam is the verb: when the risk is an utterance, read that subject; when the risk
is an action landing on an account, read this one. Its rule that authority comes from
platform metadata, never from text, binds here too: a chat message claiming to be a
moderator cannot confirm a ban.

[Live safety rails](../../trust-and-evaluation/live-safety-rails/live-safety-rails.md)
owns the outcomes no setting may override, among them the care state a viewer enters
after a disclosure. This subject consumes that state and never overrides it: a viewer in
care is never the target of an automated proposal or a grant's action, and a disclosure
is never itself moderation evidence. When safety and moderation both fire on one
message, safety's handling wins and the moderation proposal is voided rather than queued.

Streaming platform API custody owns *how* an action reaches the platform: the broker that
holds the credential, its rate limits, its refresh and event subscriptions. This subject
owns *whether* an action should be sent and on whose authority. A tool that passes this
subject's checks and then calls the platform with a token a module holds directly has
failed custody, not moderation; a tool with flawless custody that bans on a classifier's
word has failed here.
