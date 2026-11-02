---
layer: technique
type: technique
subject: streaming-platform-api-custody
technique: fail-fast-rate-limit-buckets
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [handling a rate-limited response from the streaming platform, deciding whether to queue or retry a platform call, keeping cosmetic traffic from starving moderation actions]
---

# Fail-fast rate-limit buckets

The platform's rate-limit headers are the truth about the budget. When the budget is spent,
the broker refuses locally, at once, with the moment it resets; it does not sleep, queue or
retry, and it keeps separate local buckets so one kind of traffic cannot spend another's
budget.

## Why waiting is the wrong default

A streaming platform meters calls as points in a bucket that refills per minute, per
application and per user, and reports on each response the bucket's size, what remains and
when it resets. Generic HTTP clients answer a 429 by backing off and retrying. On a live
channel that converts a refused action into a delayed action, and a delayed action is a
different action: a timeout that lands ninety seconds late lands on someone who may have
apologised, been dealt with by a moderator, or left. Meanwhile the retry loop keeps spending
from a bucket the whole tool shares. The honest answer to an empty bucket is a refusal the
calling feature can see and decide on.

## The procedure

1. **Read the headers on every response.** Update the local view of remaining points and the
   reset moment from the response, not from a local counter. The reset header is
   authoritative over any local estimate, because other instances and other tools on the same
   grant spend from the same bucket.
2. **Check before sending.** If the local view says the bucket is empty and the reset moment
   is in the future, refuse the call with "rate limited until T" without contacting the
   platform.
3. **Do not retry a 429.** Record the reset moment from its headers, return the rate-limited
   outcome to the caller, and let the feature decide - a moderation proposal may stay in the
   streamer's queue; a cosmetic refresh may be dropped.
4. **Partition the budget locally.** Give critical operations (moderation actions, the
   streamer's own commands) a reserved share, and cosmetic or bulk reads their own smaller
   bucket, so a burst of profile lookups cannot spend what a ban confirmation needs.
5. **Distinguish other 429s.** Some endpoints refuse with 429 for reasons that are not the
   general bucket - a per-target limit, a duplicate action. Map them by the platform's error
   class to their own outcome rather than treating them as the global bucket.

## Decision rules

- **When the reset moment is seconds away and the action is the streamer's explicit click**,
  show the countdown and let the streamer click again; do not auto-fire when it expires.
- **When a rate-limit refusal lacks the bucket headers**, take the wait from the response's
  retry hint, or a short conservative default (a second) when there is none. Do not reuse the
  previous response's reset moment: a refusal without headers usually comes from an
  endpoint's own unpublished cap, a different budget from the one the old reset described.
  An explicit reset in the current response is authoritative even when it is less than a
  second away.
- **When a successful response reports zero remaining**, the request itself succeeded and is
  reported as done; it is the next call that is refused before transport.
- **When the platform returns a transient server error**, a single retry may be reasonable for
  idempotent reads; mutations are reported unknown, not resent.

## When not to use it

Batch jobs off-stream - a nightly export of follower counts - may wait for the reset
instead of failing, because nothing about them is time-bound. They still read the reset
header rather than guessing, and they still run in their own bucket.
