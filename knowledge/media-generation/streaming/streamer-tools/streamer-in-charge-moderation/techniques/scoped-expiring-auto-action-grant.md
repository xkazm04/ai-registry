---
layer: technique
type: technique
subject: streamer-in-charge-moderation
technique: scoped-expiring-auto-action-grant
status: forged
stage: team
laws: [typed-input-owns-its-channel, unmeasured-is-not-pass]
shared_with: []
use_when: [a hostile raid or spam wave outpaces the streamer's review, letting automation act on viewers or chat settings for a limited time, deciding what happens to automation when a human moderator acts]
---

# Scoped, expiring auto-action grant

When the streamer delegates action to automation, the delegation is a lease. It names the
actions allowed, the ceiling of their severity, the rules that may use it and the room it
applies to, and it expires on its own and never renews itself. A human changing the same
thing by hand ends it early, and its expiry never overrides what the human did. Permanent
removal is the last thing a grant should hold; where a tool allows it, it comes with a
ceiling and a breaker.

## Why a lease and not a setting

A standing "auto-moderate" switch is turned on during the worst evening of the month and
left on for the next six, where it meets ordinary chat with incident-grade settings.
Leases fix that by construction: power granted for a raid ends with the raid's likely
duration whether or not anyone remembers to withdraw it. Yielding to the human fixes the
other failure — the machine and a moderator acting on the same thing at once, each undoing
the other — by making the human's action the signal that the room is being handled.

## Two shapes of grant

**Room-mode leases** let automation apply a room setting — slow mode, followers-only with
a minimum account age, emote-only, unique-message mode — when the room crosses a size or
pressure threshold. Each setting is issued once per activation of that threshold and
carries its own expiry. The threshold has a margin and must be held continuously for a
hysteresis interval, so a room hovering on a border does not flap the setting on and off.
The lease's clock advances on a regular tick even when chat is silent; expiry driven only
by incoming messages never arrives in an empty room.

**Per-rule action grants** let one armed rule act on accounts without a proposal: delete,
time out, and — only if the tool offers it at all — remove. The grant belongs to the rule,
not to the tool, and carries an expiry and a ceiling of actions per hour.

## The procedure

1. **Issue with bounds.** Allowed actions, a severity ceiling, the rule (or room setting)
   it covers, an expiry in minutes, and an hourly ceiling for any action on accounts. The
   streamer picks from presets built for real situations, each stating its consequence in
   one line before it is granted.
2. **Show it while it lives.** The grant and its countdown are visible in the tool for its
   whole life. An invisible grant is the standing switch again.
3. **Check on every action.** Unexpired, in scope, under the ceiling, breaker not tripped.
   A check that fails drops the action to a proposal for review — never to silence.
4. **Trip the breaker at the ceiling.** Reaching the hourly ceiling sets a persistent
   breaker on the grant: every further case goes to the streamer's click until a person
   resets it. Count the actions people confirmed by hand against the same ceiling, and
   count any action whose record was erased against every grant, so neither a busy
   streamer nor a data deletion resets the limit.
5. **Yield to the human, and tell the echo apart.** When a person changes the setting the
   lease governs, or acts on the account in the room, the lease is marked yielded. It keeps
   its original deadline — yielding never renews — and at expiry a yielded lease produces
   an observation for the log, never an "end" command that would revert the human's
   choice. The tool must distinguish a change a human made from the platform echoing the
   tool's own change; mistaking its own echo for a human yields every lease at once, and
   mistaking a human for its echo overrides them.
6. **Log every action under the grant** with the grant's identity, so the incident can be
   reviewed as a whole afterwards and individual actions reversed.

## Decision rules

- **When the threat is a crowd rather than a person**, use a room-mode lease first. Actions
  on accounts are for what room settings cannot stop.
- **A classifier's judgement never removes anyone under a grant.** Only deterministic
  pattern rules — whose every hit the streamer could have predicted from the pattern — may
  hold a removal grant. Prefer timeouts even there: a wrong timeout expires; a wrong
  removal becomes an appeal.
- **When a target is a moderator, the broadcaster or in a care state**, no grant reaches
  them. When the platform has flagged the account as suspicious, the grant does not reach
  it either; suspicion routes to review.
- **When the grant expires mid-incident**, it does not renew itself. The tool tells the
  streamer it ended.
- **When the platform refuses actions under the grant** (rate limit, permission), stop
  and report; do not queue refused actions to replay later.

## When not to use it

A solo streamer without moderators and with small chat rarely needs a grant at all: room
settings set by hand and the platform's own held-message screen cover a raid at that size,
and a grant adds machinery nobody will exercise. The technique earns its place when chat is
large enough, or hostile enough, that the review window cannot keep up.
