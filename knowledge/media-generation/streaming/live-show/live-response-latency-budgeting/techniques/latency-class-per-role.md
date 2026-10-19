---
layer: technique
type: technique
subject: live-response-latency-budgeting
technique: latency-class-per-role
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
use_when: [assigning a model tier, effort or timeout to a role in a live show, a background or offline role keeps timing out, choosing between a cheaper fast tier and a slower capable one for the host's voice]
---

# Latency class per role

A live show calls models for many roles, and their tolerance for delay spans
two orders of magnitude. The host's voice must produce a first word within
seconds. A moderation classifier sits on that same path and must be faster
still. A segment planner can take tens of seconds. A memory consolidator can
take minutes between segments. An offline judge reading a whole transcript
can take many minutes and nobody waits on it live. A routing table that does
not say which is which gives them all one timeout, one tier, one retry policy,
and is wrong for nearly all of them.

## The classes

Declare a class for every role that calls a model, and make the class a field
of the route, not a comment:

| Class | Who waits | Budget shape | On timeout |
| --- | --- | --- | --- |
| **live voice** | the audience, now | first word within the host budget at a high percentile | do not retry in place; stall, fall back to a faster route or to authored material |
| **live gate** | the live voice | a small slice of the host budget | fail closed for safety checks, fail toward a cheaper check for the rest |
| **near-live** | the next beat | seconds to tens of seconds | drop or expire the beat; the fast lane covers |
| **background** | the show, between moments | minutes | retry with backoff; nothing on air depends on it |
| **offline** | an operator, later | as long as the work needs | retry later; record the result as pending, never as pass or fail |

The class fixes four things together: which tiers the role is eligible for,
how much reasoning effort it may spend, its timeout, and what happens when the
timeout fires. Change one without the others and the role drifts out of its
class.

Reasoning effort belongs to the class as much as the tier does. A model that
reasons before it answers has a first-token time that varies with how hard it
finds the input, which is the opposite of what a live budget needs; the live
classes run with reasoning off or at its minimum, and a tier whose reasoning
cannot be switched off is not eligible for the live voice however fast its
output streams once it starts.

## Timeouts come from measured percentiles

A timeout is a claim about how long the role takes when it is working. Size it
from the measured high percentile of that role, on that tier, on the real
workload, plus headroom; never copy it from another role and never guess. The
headroom must cover the longest inputs, not a token fraction over the
percentile: a timeout set a fifth above the measured high percentile still
loses the longest job in the batch, and for an offline role the longest job
is usually the one that most needed judging. For a live role the arithmetic
runs the other way: its timeout must sit inside the silence ceiling, because
a live call allowed to run longer than the room tolerates silence has already
failed the show by the time it fires. An
offline role given a live timeout fails to finish on the very inputs that need
it most, the long ones. A live role given an offline timeout holds the
microphone for a minute before anyone notices. And a timeout that fires on an
offline role is not a verdict: the work is pending, and is retried or re-run,
never scored as if it had been judged.

## Admit a tier on its tail and its silence

The live voice class is the one where tier choice is a latency decision, not
only a quality and cost decision. Admit a tier to it on three measurements
from rehearsal on the show's own workload: its high-percentile time to first
word, the longest silence it produced, and its quality. The median is not on
the list.

The reason is a pattern that measurement keeps showing: a smaller, faster tier
can post a better median and a worse tail. It is quick on the easy lines and
slow, or wrong and retried, on the hard ones, and the hard ones are where the
silences come from. Its per-call price is lower, but its cost per usable
minute of show, counting the silences and the replies that failed quality,
can be higher. Price the tier on usable output, and route the voice to the
tier whose worst seconds the audience can live with.

## Decision rules

- When a role has no declared class, it has the wrong timeout; declare one.
- When a role's timeout fires often on correct work, its timeout is below its
  real tail, or it belongs in a slower class.
- When two tiers tie on quality for the live voice, pick the one with the
  smaller high percentile and the shorter longest silence, not the cheaper
  median.
- When an offline role cannot finish within any reasonable timeout, split its
  input; do not let a pending result decay into a void.
- When a role moves class, re-measure; its old figures describe a different
  job.

## When not to use it

A show with one model call per line and no background work has one class.
Declare it anyway; it is the record that the timeout was a decision.
