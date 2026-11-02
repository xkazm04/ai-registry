---
layer: technique
type: technique
subject: streamer-in-charge-moderation
technique: room-intents-cannot-name-a-person
status: forged
laws: [typed-input-owns-its-channel]
shared_with: []
use_when: [designing the set of actions automation may emit, separating chat-mode changes from actions on accounts, letting a model or rule engine suggest moderation steps]
---

# Room intents cannot name a person

Actions that change the room — slow mode, followers-only, emote-only, a stricter
platform screen, a chat delay — and actions that land on a person — delete their message,
time them out, ban them — are different types. The type for a room intent has no field
that can carry an account, so no automation that emits room intents can address a viewer
through it, however it is configured, prompted or broken.

## Why make it structural

Automation is most useful, and safest, at the room level: a room intent treats everyone
alike, it is visible to everyone, and it is undone in one click. The danger is the slide
from one to the other. A rule engine whose single action type has an optional target
field is one filled field away from turning "calm the room" into "remove this viewer". A
model asked to suggest moderation steps, given a generic action schema, will helpfully
name the account it thinks is the cause. Neither needs malice; both need only a type that
permits it. Policy checks downstream can catch it — until the path that skips the check.
A type that cannot express the target needs no check.

## The procedure

1. **Two vocabularies.** Define room intents as a closed set of values with only room
   parameters (duration, minimum account age, delay seconds). Define person actions as a
   separate set whose every member requires a target identity and an evidence reference.
2. **Two producers.** Automated components — rules, classifiers, models, schedules — may
   produce room intents directly, under the streamer's settings or a grant. They produce
   person actions only as proposals routed into the review window.
3. **One executor per vocabulary.** The code that executes room intents cannot accept a
   person action, and vice versa. Make the separation a compile-time property where the
   language allows it, and test it with a case that must fail to build — a room intent
   constructed with an account field — kept in the test suite so the property cannot be
   loosened by a refactor without a red build. Cover every variant, including the one
   that *ends* a setting: an "end" that could carry a target is a person action by the
   back door.
4. **Give the room type no wire form of its own.** If room intents can be deserialised
   from an arbitrary payload, the type barrier holds in code and leaks at the boundary.
   Construct them only from the room governor's own state.
5. **Echo room state honestly.** After a room intent is sent, its state is unknown until
   the platform confirms it; show *unknown*, then the confirmed state. Mark the previous
   state unreliable the moment the change is dispatched, and stamp each pending change
   with an epoch so a late confirmation of an older request cannot revive a state that
   was since superseded.

## Decision rules

- **When a room intent is triggered by one viewer's behaviour**, it still addresses the
  room. If the remedy should fall on that viewer alone, it is a person action and goes to
  review.
- **When a model proposes a step**, it chooses from the room-intent vocabulary, or it
  writes a proposal against a person with evidence attached — never free text that is
  parsed into an action.
- **When a new room intent is added**, check it truly addresses no one. "Restrict
  first-time chatters" is a room intent; "restrict accounts like this one" is a person
  action wearing a room's clothes, because its scope is chosen by reference to someone.

## When not to use it

The separation is about automated producers. The streamer's own console naturally offers
both kinds of action side by side; a human choosing to time someone out is the decision
the whole subject protects, and needs no type barrier — only honest reporting of the
result.
